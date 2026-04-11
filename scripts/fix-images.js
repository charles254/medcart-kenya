const { getDb } = require('../config/database');
const db = getDb();

// Set watermarked Pharmaplus images to NULL so the placeholder SVG is used instead
const result = db.prepare(`
  UPDATE products
  SET primary_image = NULL
  WHERE source = 'Pharmaplus'
  AND (primary_image LIKE '%api.pharmaplus.co.ke/images/placeholders/%'
    OR primary_image LIKE '%api.pharmaplus.co.ke/images/700_x_700/%')
`).run();

console.log('Updated', result.changes, 'products - replaced watermarked images with placeholder');
