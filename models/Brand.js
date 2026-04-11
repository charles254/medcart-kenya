const { getDb } = require('../config/database');

function getAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM brands ORDER BY name ASC').all();
}

function findBySlug(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM brands WHERE slug = ?').get(slug) || null;
}

function getPopular(limit = 10) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM brands
    WHERE product_count > 0
    ORDER BY product_count DESC
    LIMIT ?
  `).all(limit);
}

function getByCategory(categoryId) {
  const db = getDb();
  return db.prepare(`
    SELECT DISTINCT b.*
    FROM brands b
    JOIN products p ON p.brand_id = b.id
    JOIN product_categories pc ON pc.product_id = p.id
    WHERE pc.category_id = ?
    ORDER BY b.name ASC
  `).all(categoryId);
}

module.exports = {
  getAll,
  findBySlug,
  getPopular,
  getByCategory,
};
