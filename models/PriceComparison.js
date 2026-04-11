const { getDb } = require('../config/database');

function findByProduct(productId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM price_comparisons
    WHERE product_id = ?
    ORDER BY price ASC
  `).all(productId);
}

module.exports = {
  findByProduct,
};
