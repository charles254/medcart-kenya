const { getDb } = require('../config/database');
const db = getDb();

// The real top-level categories we want
const KEEP_TOP_LEVEL = [
  'Beauty & Skin Care',
  'Health & Wellness',
  'Vitamins & Supplements',
  'Personal Care',
  'Mum & Baby',
  'Medical Devices',
  'Sexual & Reproductive Health',
  'Traditional Medicine',
  'Snacks & Drinks',
  'IV Therapy',
];

// Map messy top-level categories to their correct parent
const REPARENT_MAP = {
  'Health Care': 'Health & Wellness',
  'First Aid &amp': 'Health & Wellness',
  'Cold': 'Health & Wellness',
  'Oral Care': 'Personal Care',
  'Hair Care': 'Beauty & Skin Care',
  'Cardiovascular': 'Health & Wellness',
  'Mum &amp': 'Mum & Baby',
  'Conditions': 'Health & Wellness',
  'Aches &amp': 'Health & Wellness',
  'Anti Infective': 'Health & Wellness',
  'Stomach &amp': 'Health & Wellness',
  'Deodorants &amp': 'Personal Care',
  'Bath &amp': 'Personal Care',
  'Pharma': 'Health & Wellness',
  'Multivitamins &amp': 'Vitamins & Supplements',
  'FIRST AID': 'Health & Wellness',
  'Travel &amp': 'Health & Wellness',
  'Diabetic Care': 'Health & Wellness',
  'Bone &amp': 'Health & Wellness',
  'Products': 'Health & Wellness',
  'Eye Care': 'Health & Wellness',
  'Mens': 'Personal Care',
  'Grooming': 'Personal Care',
  'Chronic': 'Health & Wellness',
  'Equipment &amp': 'Medical Devices',
  'Alimentary': 'Health & Wellness',
  'E-derma': 'Beauty & Skin Care',
  'Dermatological': 'Beauty & Skin Care',
  'Fitness &amp': 'Personal Care',
  'Analgesics': 'Health & Wellness',
  'Flu and Cough': 'Health & Wellness',
  'Immunity': 'Vitamins & Supplements',
  'Mens Grooming': 'Personal Care',
  'Feeding Bottles': 'Mum & Baby',
  'Genito-Urinary': 'Health & Wellness',
  'Personal': 'Personal Care',
  'Energy &amp': 'Vitamins & Supplements',
  'Children': 'Mum & Baby',
  'Skin Treatments': 'Beauty & Skin Care',
  'Stop Smoking': 'Health & Wellness',
  'Probiotics &amp': 'Vitamins & Supplements',
  'Calm &amp': 'Health & Wellness',
  'Hair': 'Beauty & Skin Care',
  'Body Oils &amp': 'Beauty & Skin Care',
  'Respiratory': 'Health & Wellness',
  'Allergy &amp': 'Health & Wellness',
  'Heart &amp': 'Health & Wellness',
  'Sore Throat': 'Health & Wellness',
  'Vitamin C': 'Vitamins & Supplements',
  'Womens Health': 'Health & Wellness',
  'Antiallergic And Antianaphylactic': 'Health & Wellness',
  'Accessories': 'Medical Devices',
  'Ear Care': 'Health & Wellness',
  'Acne': 'Beauty & Skin Care',
  'Renal &amp': 'Health & Wellness',
  'Anti Wrinkle/Age': 'Beauty & Skin Care',
  'support and braces': 'Medical Devices',
  'Vitamin &amp': 'Vitamins & Supplements',
  'Sanitary Care': 'Personal Care',
  'Sexual Health': 'Sexual & Reproductive Health',
  'Sexual enhancement': 'Sexual & Reproductive Health',
  'Anti Oxidants': 'Vitamins & Supplements',
  'Skin': 'Beauty & Skin Care',
  'Shower Gel &amp': 'Personal Care',
  'Bites &amp': 'Health & Wellness',
  'Vitamin D': 'Vitamins & Supplements',
  'Cleansers': 'Beauty & Skin Care',
  'Anti Diarrhoea': 'Health & Wellness',
  'Travel': 'Health & Wellness',
  'Fertility &amp': 'Sexual & Reproductive Health',
  'Vitamin B': 'Vitamins & Supplements',
  'Dry Skin': 'Beauty & Skin Care',
  'Health Care Equipment': 'Medical Devices',
  'Fish Oils &amp': 'Vitamins & Supplements',
  'Serums': 'Beauty & Skin Care',
  'Face Wash': 'Beauty & Skin Care',
  'Face Care': 'Beauty & Skin Care',
  'Black November': 'Health & Wellness',
  'Iron Supplements': 'Vitamins & Supplements',
  'Sunscreens': 'Beauty & Skin Care',
  'Anti Infectives': 'Health & Wellness',
  'Intimate Care': 'Personal Care',
  'Lip Balms': 'Beauty & Skin Care',
  'Contraceptives': 'Sexual & Reproductive Health',
  'Antiperspirants': 'Personal Care',
  'All skin types': 'Beauty & Skin Care',
  'Gift Cards': 'Health & Wellness',
  'Rehydration': 'Health & Wellness',
  'Travel and Sun care': 'Beauty & Skin Care',
  'Sports & Nutrition': 'Vitamins & Supplements',
  'Medicine': 'Health & Wellness',
  'Veterinary': 'Health & Wellness',
};

console.log('=== Fixing Categories ===\n');

db.exec('BEGIN');

// Step 1: Reparent known miscategorized top-level items
let reparented = 0;
for (const [childName, parentName] of Object.entries(REPARENT_MAP)) {
  const parent = db.prepare('SELECT id FROM categories WHERE name = ? AND level = 0').get(parentName);
  const child = db.prepare('SELECT id FROM categories WHERE name = ? AND level = 0').get(childName);
  if (parent && child) {
    db.prepare('UPDATE categories SET parent_id = ?, level = 1 WHERE id = ?').run(parent.id, child.id);
    db.prepare('UPDATE categories SET level = 2 WHERE parent_id = ?').run(child.id);
    reparented++;
  }
}
console.log('Reparented ' + reparented + ' categories');

// Step 2: Catch remaining non-KEEP top-level categories
const remaining = db.prepare('SELECT id, name, product_count FROM categories WHERE level = 0').all();
const hw = db.prepare('SELECT id FROM categories WHERE name = ? AND level = 0').get('Health & Wellness');
let catchAll = 0;
for (const cat of remaining) {
  if (!KEEP_TOP_LEVEL.includes(cat.name) && hw) {
    db.prepare('UPDATE categories SET parent_id = ?, level = 1 WHERE id = ?').run(hw.id, cat.id);
    db.prepare('UPDATE categories SET level = 2 WHERE parent_id = ?').run(cat.id);
    catchAll++;
  }
}
console.log('Moved ' + catchAll + ' remaining orphans under Health & Wellness');

// Step 3: Recalculate product counts
db.prepare('UPDATE categories SET product_count = 0').run();

// Set direct counts
db.prepare(`
  UPDATE categories SET product_count = (
    SELECT COUNT(DISTINCT pc.product_id)
    FROM product_categories pc
    WHERE pc.category_id = categories.id
  )
`).run();

// Roll up level 2 to level 1
db.prepare(`
  UPDATE categories SET product_count = product_count + COALESCE((
    SELECT SUM(c2.product_count) FROM categories c2 WHERE c2.parent_id = categories.id
  ), 0) WHERE level = 1
`).run();

// Roll up level 1 to level 0
db.prepare(`
  UPDATE categories SET product_count = COALESCE((
    SELECT SUM(c1.product_count) FROM categories c1 WHERE c1.parent_id = categories.id
  ), 0) + (
    SELECT COUNT(DISTINCT pc.product_id) FROM product_categories pc WHERE pc.category_id = categories.id
  ) WHERE level = 0
`).run();

db.exec('COMMIT');

// Print results
const final = db.prepare('SELECT name, product_count FROM categories WHERE level = 0 ORDER BY product_count DESC').all();
console.log('\nFinal top-level categories (' + final.length + '):');
final.forEach(c => console.log('  ' + c.name + ': ' + c.product_count + ' products'));
