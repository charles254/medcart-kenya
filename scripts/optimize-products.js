/**
 * Product Title, Description & Meta Description Optimizer
 * Based on SKILL-product-optimizer.md best practices
 *
 * Enhances all products in the database with:
 * - Optimized SEO-friendly titles
 * - Expanded 150-200 word descriptions
 * - Meta descriptions (120-160 chars)
 */

const { getDb } = require('../config/database');
const db = getDb();

// ─── Category keyword maps ───────────────────────────────────────
const CATEGORY_KEYWORDS = {
  'Pain': 'Pain & Fever Relief',
  'Analgesic': 'Pain Relief',
  'Paracetamol': 'Headache & Fever Relief',
  'Ibuprofen': 'Anti-Inflammatory Pain Relief',
  'Antibiotic': 'Antibiotic Treatment',
  'Antifungal': 'Antifungal Treatment',
  'Vitamin': 'Daily Nutritional Support',
  'Supplement': 'Health & Wellness Support',
  'Omega': 'Heart & Brain Health',
  'Calcium': 'Bone Health Support',
  'Iron': 'Energy & Blood Health',
  'Zinc': 'Immune System Support',
  'Probiotic': 'Digestive Health',
  'Cleanser': 'Gentle Skin Cleansing',
  'Moisturizer': 'Deep Skin Hydration',
  'Moisturising': 'Deep Skin Hydration',
  'Sunscreen': 'Sun Protection',
  'SPF': 'Sun Protection',
  'Serum': 'Targeted Skin Treatment',
  'Shampoo': 'Hair Care & Cleansing',
  'Conditioner': 'Hair Nourishment',
  'Diaper': 'Baby Comfort & Protection',
  'Formula': 'Infant Nutrition',
  'Syrup': 'Liquid Medicine',
  'Inhaler': 'Respiratory Relief',
  'Drops': 'Targeted Relief',
  'Cream': 'Topical Treatment',
  'Ointment': 'Topical Treatment',
  'Gel': 'Fast-Absorbing Treatment',
  'Lotion': 'Skin Moisturizing',
  'Spray': 'Quick-Apply Treatment',
  'Bandage': 'Wound Care',
  'Thermometer': 'Temperature Monitoring',
  'Monitor': 'Health Monitoring',
  'Test': 'Diagnostic Testing',
  'Condom': 'Protection & Intimacy',
  'Sanitizer': 'Hand Hygiene',
  'Mask': 'Protective Face Covering',
  'Toothpaste': 'Oral Care',
  'Mouthwash': 'Oral Hygiene',
};

// ─── Form/format detection ───────────────────────────────────────
const FORMS = {
  'tablet': 'Tablets', 'tablets': 'Tablets', 'tabs': 'Tablets', 'tab': 'Tablets',
  'capsule': 'Capsules', 'capsules': 'Capsules', 'caps': 'Capsules', 'caplets': 'Caplets',
  'syrup': 'Syrup', 'suspension': 'Suspension', 'solution': 'Solution',
  'cream': 'Cream', 'ointment': 'Ointment', 'gel': 'Gel', 'lotion': 'Lotion',
  'spray': 'Spray', 'drops': 'Drops', 'inhaler': 'Inhaler',
  'powder': 'Powder', 'sachet': 'Sachets', 'sachets': 'Sachets',
  'soap': 'Bar Soap', 'shampoo': 'Shampoo', 'wash': 'Wash',
  'patch': 'Patches', 'patches': 'Patches',
  'injection': 'Injection', 'suppository': 'Suppository',
};

// ─── Helper functions ────────────────────────────────────────────

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/â€™/g, "'").replace(/â€œ/g, '"').replace(/â€\u009d/g, '"')
    .replace(/â€"/g, '-').replace(/â€"/g, '-')
    .replace(/Â /g, ' ').replace(/Â/g, '')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractStrength(title) {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|iu|%)/i);
  return match ? match[0] : '';
}

function extractCount(title) {
  const match = title.match(/(\d+)\s*'?s\b/i) || title.match(/(\d+)\s*(tablets?|caps?|capsules?|sachets?|pcs?|pieces?|pack)/i);
  return match ? match[1] : '';
}

function extractSize(title) {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(ml|l|g|kg|oz)\b/i);
  return match ? match[0] : '';
}

function detectForm(title) {
  const lower = title.toLowerCase();
  for (const [key, value] of Object.entries(FORMS)) {
    if (lower.includes(key)) return value;
  }
  return '';
}

function getBenefit(title, categoryName) {
  const lower = (title + ' ' + (categoryName || '')).toLowerCase();
  for (const [key, benefit] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(key.toLowerCase())) return benefit;
  }
  return '';
}

// ─── Title optimizer ─────────────────────────────────────────────

function optimizeTitle(product) {
  const brand = product.brand_name || '';
  const origTitle = cleanText(product.title);
  const strength = extractStrength(origTitle);
  const count = extractCount(origTitle);
  const size = extractSize(origTitle);
  const form = detectForm(origTitle);
  const benefit = getBenefit(origTitle, product.category_name);

  // Remove brand from title to avoid duplication
  let coreName = origTitle;
  if (brand && coreName.toLowerCase().startsWith(brand.toLowerCase())) {
    coreName = coreName.substring(brand.length).trim();
    if (coreName.startsWith('-') || coreName.startsWith(' ')) coreName = coreName.substring(1).trim();
  }
  // Remove "MYDAWA" prefix
  coreName = coreName.replace(/^MYDAWA\s+/i, '');

  // Clean up redundant info from core name for reconstruction
  let cleanCore = coreName
    .replace(/\s+\d+'?s\s*$/i, '') // remove trailing "100's"
    .replace(/\s+\(\d+\s*(tablets?|caps?|capsules?|pcs?|sachets?)\)/i, '')
    .trim();

  // Build optimized title
  let parts = [];

  // Brand
  if (brand) parts.push(brand);

  // Core product name
  parts.push(cleanCore);

  // Benefit (if we found one and it's not already in the name)
  if (benefit && !origTitle.toLowerCase().includes(benefit.toLowerCase().split(' ')[0])) {
    parts.push('- ' + benefit);
  }

  // Format suffix
  let suffix = '';
  if (count && form) {
    suffix = `(${count} ${form})`;
  } else if (size) {
    suffix = `(${size})`;
  } else if (count) {
    suffix = `(${count}'s)`;
  }
  if (suffix) parts.push(suffix);

  let optimized = parts.join(' ');

  // Ensure not too long (max 120 chars)
  if (optimized.length > 120) {
    // Remove benefit to shorten
    parts = parts.filter(p => !p.startsWith('- '));
    optimized = parts.join(' ');
  }

  // Ensure not too short (keep original if optimization made it worse)
  if (optimized.length < 15) return origTitle;

  return optimized;
}

// ─── Description generator ───────────────────────────────────────

function generateDescription(product) {
  const brand = product.brand_name || 'this trusted brand';
  const title = cleanText(product.title);
  const origDesc = cleanText(product.description || '');
  const form = detectForm(title);
  const strength = extractStrength(title);
  const benefit = getBenefit(title, product.category_name);
  const categoryName = product.category_name || 'Health & Wellness';
  const isRx = product.requires_prescription;

  // If description already good (>120 words), just clean it
  if (origDesc && origDesc.split(' ').length > 80) {
    return origDesc;
  }

  let desc = '';

  // Paragraph 1: What it is
  if (origDesc) {
    desc += origDesc;
  } else {
    desc += `${title} is a quality ${categoryName.toLowerCase()} product from ${brand}. `;
    if (form) desc += `Available in ${form.toLowerCase()} form`;
    if (strength) desc += ` with ${strength} strength`;
    desc += `, this product is designed to support your health and wellness needs.`;
  }

  // Paragraph 2: Benefits/Usage
  desc += '\n\n';
  if (benefit) {
    desc += `Formulated for ${benefit.toLowerCase()}, ${title} provides effective results you can trust. `;
  }
  desc += `Suitable for adults and families, this product has been carefully selected for the AfyaCart Kenya catalog from ${brand}'s range of quality products.`;

  // Paragraph 3: Key features
  desc += '\n\n';
  desc += 'Key features: ';
  const features = [];
  if (brand) features.push(`Trusted ${brand} brand`);
  if (strength) features.push(`${strength} strength formula`);
  if (form) features.push(`Convenient ${form.toLowerCase()} format`);
  features.push('Genuine and authentic product');
  features.push('Fast delivery across Kenya');
  desc += features.join(' | ') + '.';

  // Paragraph 4: Trust/Disclaimer
  desc += '\n\n';
  if (isRx) {
    desc += 'This is a prescription medicine. A valid prescription is required at checkout. Always consult your doctor or pharmacist before use. ';
  }
  desc += `Order ${title} from AfyaCart Kenya, your trusted online pharmacy with free delivery on orders above KES 2,500.`;

  return desc;
}

// ─── Meta description generator ──────────────────────────────────

function generateMetaDescription(product, optimizedTitle) {
  const brand = product.brand_name || '';
  const benefit = getBenefit(optimizedTitle, product.category_name);
  const isRx = product.requires_prescription;

  let meta = '';

  if (benefit) {
    meta = `${benefit} with ${optimizedTitle}. `;
  } else {
    meta = `Shop ${optimizedTitle}. `;
  }

  if (brand) {
    meta += `Genuine ${brand} product. `;
  }

  if (isRx) {
    meta += 'Prescription required. ';
  }

  meta += 'Fast delivery across Kenya from AfyaCart.';

  // Trim to 160 chars
  if (meta.length > 160) {
    meta = meta.substring(0, 157) + '...';
  }

  return meta;
}

// ─── Main execution ──────────────────────────────────────────────

function main() {
  console.log('=== Product Title, Description & Meta Optimizer ===\n');

  // Add meta columns if they don't exist
  try {
    db.exec('ALTER TABLE products ADD COLUMN optimized_title TEXT');
  } catch (e) { /* column exists */ }
  try {
    db.exec('ALTER TABLE products ADD COLUMN meta_description TEXT');
  } catch (e) { /* column exists */ }
  try {
    db.exec('ALTER TABLE products ADD COLUMN enhanced_description TEXT');
  } catch (e) { /* column exists */ }

  // Get all products with brand and category info
  const products = db.prepare(`
    SELECT p.*, b.name AS brand_name,
      (SELECT c.name FROM product_categories pc
       JOIN categories c ON pc.category_id = c.id
       WHERE pc.product_id = p.id LIMIT 1) AS category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
  `).all();

  console.log(`Processing ${products.length} products...\n`);

  const updateStmt = db.prepare(`
    UPDATE products
    SET optimized_title = ?,
        meta_description = ?,
        enhanced_description = ?,
        title = ?
    WHERE id = ?
  `);

  db.exec('BEGIN');

  let updated = 0;
  let titleExamples = [];

  for (const product of products) {
    const optimizedTitle = optimizeTitle(product);
    const enhancedDesc = generateDescription(product);
    const metaDesc = generateMetaDescription(product, optimizedTitle);

    updateStmt.run(optimizedTitle, metaDesc, enhancedDesc, optimizedTitle, product.id);
    updated++;

    if (titleExamples.length < 10 && optimizedTitle !== product.title) {
      titleExamples.push({
        before: product.title,
        after: optimizedTitle,
        meta: metaDesc.substring(0, 80) + '...',
      });
    }

    if (updated % 2000 === 0) {
      console.log(`  Processed ${updated}/${products.length}...`);
    }
  }

  db.exec('COMMIT');

  // Rebuild FTS index with new titles
  console.log('\nRebuilding search index...');
  db.exec('DROP TABLE IF EXISTS products_fts');
  db.exec("CREATE VIRTUAL TABLE products_fts USING fts5(title, description, brand_name, content='', tokenize='porter unicode61')");
  db.exec(`INSERT INTO products_fts(rowid, title, description, brand_name)
    SELECT p.id, p.title, COALESCE(p.enhanced_description, p.description, ''), COALESCE(b.name, '')
    FROM products p LEFT JOIN brands b ON p.brand_id = b.id`);

  console.log('\n=== Optimization Complete ===');
  console.log(`  Products updated: ${updated}`);

  console.log('\n--- Sample Title Improvements ---');
  titleExamples.forEach((ex, i) => {
    console.log(`\n  ${i + 1}. BEFORE: ${ex.before}`);
    console.log(`     AFTER:  ${ex.after}`);
    console.log(`     META:   ${ex.meta}`);
  });

  // Stats
  const avgTitleLen = db.prepare('SELECT AVG(LENGTH(title)) as avg FROM products').get();
  const avgMetaLen = db.prepare('SELECT AVG(LENGTH(meta_description)) as avg FROM products WHERE meta_description IS NOT NULL').get();
  const avgDescLen = db.prepare('SELECT AVG(LENGTH(enhanced_description)) as avg FROM products WHERE enhanced_description IS NOT NULL').get();

  console.log(`\n--- Stats ---`);
  console.log(`  Avg title length:       ${Math.round(avgTitleLen.avg)} chars`);
  console.log(`  Avg meta desc length:   ${Math.round(avgMetaLen.avg)} chars`);
  console.log(`  Avg description length: ${Math.round(avgDescLen.avg)} chars`);
}

main();
