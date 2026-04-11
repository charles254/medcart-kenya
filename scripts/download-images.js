/**
 * Download all product images locally
 * Saves images to public/images/products/ and updates database URLs
 *
 * Usage: node scripts/download-images.js
 */

const { getDb } = require('../config/database');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const CONCURRENCY = 5; // Parallel downloads
const TIMEOUT = 15000;

// Create images directory
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const contentType = res.headers['content-type'] || '';
      if (!contentType.includes('image') && !contentType.includes('octet')) {
        reject(new Error(`Not an image: ${contentType}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        // Check file size — delete if too small (error page)
        const stats = fs.statSync(filepath);
        if (stats.size < 500) {
          fs.unlinkSync(filepath);
          reject(new Error('File too small'));
        } else {
          resolve(stats.size);
        }
      });
      file.on('error', (err) => {
        fs.unlinkSync(filepath).catch(() => {});
        reject(err);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function getExtension(url) {
  const urlPath = url.split('?')[0];
  const ext = path.extname(urlPath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext)) return ext;
  return '.jpg'; // Default
}

async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('=== Product Image Downloader ===\n');

  const db = getDb();

  // Get all products with external images
  const products = db.prepare(`
    SELECT id, primary_image, slug
    FROM products
    WHERE primary_image IS NOT NULL
      AND primary_image != ''
      AND primary_image NOT LIKE '/images/%'
  `).all();

  console.log(`Products with external images: ${products.length}`);
  console.log(`Saving to: ${IMAGES_DIR}\n`);

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  const updateStmt = db.prepare('UPDATE products SET primary_image = ? WHERE id = ?');

  // Process in batches
  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);

    const promises = batch.map(async (product) => {
      const ext = getExtension(product.primary_image);
      const filename = `${product.id}${ext}`;
      const filepath = path.join(IMAGES_DIR, filename);
      const localUrl = `/images/products/${filename}`;

      // Skip if already downloaded
      if (fs.existsSync(filepath)) {
        updateStmt.run(localUrl, product.id);
        skipped++;
        return;
      }

      try {
        const size = await downloadImage(product.primary_image, filepath);
        updateStmt.run(localUrl, product.id);
        downloaded++;
      } catch (err) {
        failed++;
        // Set to null so placeholder shows
        updateStmt.run(null, product.id);
      }
    });

    await Promise.allSettled(promises);

    const total = downloaded + failed + skipped;
    if (total % 100 === 0 || total === products.length) {
      process.stdout.write(`\r  Progress: ${total}/${products.length} (${downloaded} downloaded, ${skipped} skipped, ${failed} failed)`);
    }
  }

  console.log('\n\n=== DOWNLOAD COMPLETE ===');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);

  // Check folder size
  let totalSize = 0;
  const files = fs.readdirSync(IMAGES_DIR);
  files.forEach(f => {
    totalSize += fs.statSync(path.join(IMAGES_DIR, f)).size;
  });
  console.log(`  Total files: ${files.length}`);
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Location: ${IMAGES_DIR}`);
}

main().catch(console.error);
