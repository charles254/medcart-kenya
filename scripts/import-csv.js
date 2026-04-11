#!/usr/bin/env node

/**
 * CSV Import Script for Pharmacy E-Commerce
 * Reads combined_pharmacy_products.csv and populates the SQLite database.
 *
 * Usage: node scripts/import-csv.js
 *    or: npm run import
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const slugify = require('slugify');
const Database = require('better-sqlite3');

const { TOP_LEVEL_CATEGORY_MAP, CATEGORY_ICONS } = require('../config/constants');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const CSV_PATH = path.join('C:', 'Users', 'ENG. KIPTOO', 'Desktop', 'Firecrawl', 'combined_pharmacy_products.csv');
const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'pharmacy.db');
const MIGRATION_PATH = path.join(DB_DIR, 'migrations', '001-initial-schema.sql');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fix common mojibake from UTF-8 misinterpretation */
function fixEncoding(text) {
  if (!text) return text;
  return text
    .replace(/â€™/g, '\u2019')   // right single quote
    .replace(/â€œ/g, '\u201C')   // left double quote
    .replace(/â€\u009D/g, '\u201D') // right double quote
    .replace(/â€"/g, '\u2013')   // en-dash
    .replace(/â€"/g, '\u2014')   // em-dash
    .replace(/â€¦/g, '\u2026')   // ellipsis
    .replace(/Â /g, ' ')         // non-breaking space artefact
    .replace(/&amp;/g, '&');
}

/** Generate a unique slug, appending -2, -3, etc. on collision */
function uniqueSlug(title, existingSlugs) {
  let base = slugify(title, { lower: true, strict: true, locale: 'en' });
  if (!base) base = 'product';
  // Truncate overly long slugs
  if (base.length > 120) base = base.substring(0, 120);

  let slug = base;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

/** Normalize in_stock to 0 or 1 */
function normalizeInStock(val) {
  if (val === undefined || val === null || val === '') return 1;
  const s = String(val).trim().toLowerCase();
  if (s === 'true') return 1;
  if (s === 'false') return 0;
  const n = Number(s);
  if (!isNaN(n)) return n > 0 ? 1 : 0;
  return 1;
}

/** Normalize sale_price: empty / "None" / 0 / equal to price -> null */
function normalizeSalePrice(val, price) {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim().toLowerCase();
  if (s === 'none' || s === 'null' || s === '') return null;
  const n = parseFloat(s);
  if (isNaN(n) || n <= 0) return null;
  if (n === price) return null;
  return n;
}

/** Normalize requires_prescription to 0 or 1 */
function normalizeRx(val) {
  if (!val) return 0;
  return String(val).trim().toLowerCase() === 'true' ? 1 : 0;
}

/** Parse price from string, return 0 if invalid */
function parsePrice(val) {
  if (val === undefined || val === null || val === '') return 0;
  const n = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : n;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log('=== Pharmacy CSV Import ===\n');

  // 1. Check CSV exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }
  console.log(`Reading CSV: ${CSV_PATH}`);

  // 2. Read and parse CSV
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  });
  console.log(`Parsed ${records.length} rows from CSV.\n`);

  // 3. Initialize database
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  // Remove old database for clean import
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Removed existing database for clean import.');
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  const migration = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  db.exec(migration);
  console.log('Database initialized with schema.\n');

  // ---------------------------------------------------------------------------
  // Prepare statements
  // ---------------------------------------------------------------------------
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, parent_id, level, icon)
    VALUES (@name, @slug, @parent_id, @level, @icon)
  `);
  const getCategoryBySlug = db.prepare('SELECT id FROM categories WHERE slug = ?');

  const insertBrand = db.prepare(`
    INSERT OR IGNORE INTO brands (name, slug) VALUES (@name, @slug)
  `);
  const getBrandBySlug = db.prepare('SELECT id FROM brands WHERE slug = ?');

  const insertProduct = db.prepare(`
    INSERT INTO products (source, source_id, title, slug, description, price, regular_price,
      sale_price, currency, brand_id, primary_image, product_url, in_stock, stock_quantity,
      requires_prescription, tags, also_available_at)
    VALUES (@source, @source_id, @title, @slug, @description, @price, @regular_price,
      @sale_price, @currency, @brand_id, @primary_image, @product_url, @in_stock,
      @stock_quantity, @requires_prescription, @tags, @also_available_at)
  `);

  const insertProductCategory = db.prepare(`
    INSERT OR IGNORE INTO product_categories (product_id, category_id)
    VALUES (@product_id, @category_id)
  `);

  const insertPriceComparison = db.prepare(`
    INSERT OR IGNORE INTO price_comparisons (product_id, pharmacy, price)
    VALUES (@product_id, @pharmacy, @price)
  `);

  // ---------------------------------------------------------------------------
  // Caches
  // ---------------------------------------------------------------------------
  const categorySlugs = new Map();   // slug -> id
  const brandSlugs = new Map();      // slug -> id
  const productSlugs = new Set();    // for collision detection

  // Stats
  let imported = 0;
  let skipped = 0;
  let catCreated = 0;
  let brandCreated = 0;

  // ---------------------------------------------------------------------------
  // Process rows inside a transaction
  // ---------------------------------------------------------------------------
  const importAll = db.transaction(() => {
    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      // Progress
      if ((i + 1) % 1000 === 0) {
        console.log(`  Processing row ${i + 1} / ${records.length}...`);
      }

      // ------ Categories ------
      const rawCategories = (row.categories || '').trim();
      if (!rawCategories) { skipped++; continue; }

      const catSegments = rawCategories
        .split(';')
        .map(s => fixEncoding(s.trim()))
        .filter(s => s && s.length <= 60);

      if (catSegments.length === 0) { skipped++; continue; }

      // Normalize top-level category
      const topRaw = catSegments[0];
      const topKey = topRaw.toLowerCase();
      let topName;

      if (topKey in TOP_LEVEL_CATEGORY_MAP) {
        topName = TOP_LEVEL_CATEGORY_MAP[topKey];
        if (topName === null) { skipped++; continue; } // skip non-real categories
      } else {
        // Use as-is if not in map
        topName = topRaw;
      }

      // Build category hierarchy: level 0 (top), level 1, level 2
      const categoryIds = [];

      // Level 0
      const topSlug = slugify(topName, { lower: true, strict: true });
      if (!categorySlugs.has(topSlug)) {
        insertCategory.run({
          name: topName,
          slug: topSlug,
          parent_id: null,
          level: 0,
          icon: CATEGORY_ICONS[topName] || null,
        });
        const row0 = getCategoryBySlug.get(topSlug);
        categorySlugs.set(topSlug, row0.id);
        catCreated++;
      }
      const topId = categorySlugs.get(topSlug);
      categoryIds.push(topId);

      // Level 1
      if (catSegments.length > 1) {
        const l1Name = catSegments[1];
        const l1Slug = `${topSlug}-${slugify(l1Name, { lower: true, strict: true })}`;
        if (!categorySlugs.has(l1Slug)) {
          insertCategory.run({
            name: l1Name,
            slug: l1Slug,
            parent_id: topId,
            level: 1,
            icon: null,
          });
          const row1 = getCategoryBySlug.get(l1Slug);
          categorySlugs.set(l1Slug, row1.id);
          catCreated++;
        }
        const l1Id = categorySlugs.get(l1Slug);
        categoryIds.push(l1Id);

        // Level 2
        if (catSegments.length > 2) {
          const l2Name = catSegments[2];
          const l2Slug = `${l1Slug}-${slugify(l2Name, { lower: true, strict: true })}`;
          if (!categorySlugs.has(l2Slug)) {
            insertCategory.run({
              name: l2Name,
              slug: l2Slug,
              parent_id: l1Id,
              level: 2,
              icon: null,
            });
            const row2 = getCategoryBySlug.get(l2Slug);
            categorySlugs.set(l2Slug, row2.id);
            catCreated++;
          }
          categoryIds.push(categorySlugs.get(l2Slug));
        }
      }

      // ------ Brand ------
      let brandId = null;
      const brandName = fixEncoding((row.brand || '').trim());
      if (brandName) {
        const brandSlug = slugify(brandName, { lower: true, strict: true }) || 'brand';
        if (!brandSlugs.has(brandSlug)) {
          insertBrand.run({ name: brandName, slug: brandSlug });
          const br = getBrandBySlug.get(brandSlug);
          brandSlugs.set(brandSlug, br.id);
          brandCreated++;
        }
        brandId = brandSlugs.get(brandSlug);
      }

      // ------ Product ------
      const title = fixEncoding((row.title || '').trim());
      if (!title) { skipped++; continue; }

      const price = parsePrice(row.price);
      const regularPrice = parsePrice(row.regular_price) || null;
      const salePrice = normalizeSalePrice(row.sale_price, price);
      const slug = uniqueSlug(title, productSlugs);

      const productInfo = insertProduct.run({
        source: (row.source || '').trim(),
        source_id: (row.source_id || '').trim() || null,
        title,
        slug,
        description: fixEncoding((row.description || '').trim()) || null,
        price,
        regular_price: regularPrice,
        sale_price: salePrice,
        currency: (row.currency || 'KES').trim(),
        brand_id: brandId,
        primary_image: (row.primary_image || '').trim() || null,
        product_url: (row.product_url || '').trim() || null,
        in_stock: normalizeInStock(row.in_stock),
        stock_quantity: parseInt(row.stock_quantity, 10) || 0,
        requires_prescription: normalizeRx(row.requires_prescription),
        tags: (row.tags || '').trim() || null,
        also_available_at: (row.also_available_at || '').trim() || null,
      });

      const productId = Number(productInfo.lastInsertRowid);

      // ------ Product-Category joins ------
      for (const catId of categoryIds) {
        insertProductCategory.run({ product_id: productId, category_id: catId });
      }

      // ------ Price comparisons ------
      const pcRaw = (row.price_comparison || '').trim();
      if (pcRaw) {
        try {
          // Handle single-quoted JSON by replacing single quotes
          let jsonStr = pcRaw;
          if (jsonStr.startsWith("'") || jsonStr.includes("'")) {
            jsonStr = jsonStr.replace(/'/g, '"');
          }
          const priceMap = JSON.parse(jsonStr);
          for (const [pharmacy, pVal] of Object.entries(priceMap)) {
            const pPrice = parseFloat(pVal);
            if (!isNaN(pPrice) && pPrice > 0) {
              insertPriceComparison.run({
                product_id: productId,
                pharmacy: pharmacy.trim(),
                price: pPrice,
              });
            }
          }
        } catch (e) {
          // Silently skip unparseable price comparison JSON
        }
      }

      imported++;
    }
  });

  console.log('Starting import transaction...');
  const startTime = Date.now();
  importAll();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Transaction committed in ${elapsed}s.\n`);

  // ---------------------------------------------------------------------------
  // Post-import: update counts
  // ---------------------------------------------------------------------------
  console.log('Updating category product counts...');
  db.exec(`
    UPDATE categories SET product_count = (
      SELECT COUNT(DISTINCT pc.product_id)
      FROM product_categories pc
      WHERE pc.category_id = categories.id
    )
  `);

  // Also include children counts for parent categories
  db.exec(`
    UPDATE categories SET product_count = product_count + COALESCE((
      SELECT SUM(c2.product_count)
      FROM categories c2
      WHERE c2.parent_id = categories.id
    ), 0)
    WHERE level = 1
  `);
  db.exec(`
    UPDATE categories SET product_count = COALESCE((
      SELECT SUM(c2.product_count)
      FROM categories c2
      WHERE c2.parent_id = categories.id
    ), product_count)
    WHERE level = 0
  `);

  console.log('Updating brand product counts...');
  db.exec(`
    UPDATE brands SET product_count = (
      SELECT COUNT(*) FROM products WHERE brand_id = brands.id
    )
  `);

  // ---------------------------------------------------------------------------
  // FTS5 full-text search index
  // ---------------------------------------------------------------------------
  console.log('Creating full-text search index...');
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
      title, description, brand_name, content='', tokenize='porter unicode61'
    )
  `);
  db.exec(`
    INSERT INTO products_fts(rowid, title, description, brand_name)
    SELECT p.id, p.title, COALESCE(p.description, ''), COALESCE(b.name, '')
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
  `);
  console.log('FTS index populated.\n');

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalCategories = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  const totalBrands = db.prepare('SELECT COUNT(*) as c FROM brands').get().c;
  const totalPriceComps = db.prepare('SELECT COUNT(*) as c FROM price_comparisons').get().c;
  const topCategories = db.prepare(
    'SELECT name, product_count FROM categories WHERE level = 0 ORDER BY product_count DESC'
  ).all();

  console.log('=== Import Summary ===');
  console.log(`  Products imported: ${imported}`);
  console.log(`  Rows skipped:      ${skipped}`);
  console.log(`  Categories:        ${totalCategories} (${catCreated} created)`);
  console.log(`  Brands:            ${totalBrands} (${brandCreated} created)`);
  console.log(`  Price comparisons: ${totalPriceComps}`);
  console.log(`  Total in DB:       ${totalProducts} products`);
  console.log('');
  console.log('  Top-level categories:');
  for (const cat of topCategories) {
    const icon = CATEGORY_ICONS[cat.name] || '  ';
    console.log(`    ${icon} ${cat.name}: ${cat.product_count} products`);
  }
  console.log('\nDone!');

  db.close();
}

main();
