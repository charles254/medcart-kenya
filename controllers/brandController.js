const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { ITEMS_PER_PAGE } = require('../config/constants');
const { getDb } = require('../config/database');

function index(req, res) {
  const brands = Brand.getAll();

  // Group by first letter
  const grouped = {};
  for (const brand of brands) {
    const letter = (brand.name[0] || '#').toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(brand);
  }

  res.render('pages/brands-index', {
    title: 'All Brands - MedCart Kenya',
    metaDescription: 'Browse all pharmacy brands available at MedCart Kenya. Find trusted medicine and health product brands.',
    canonicalPath: '/brands',
    grouped,
    letters: Object.keys(grouped).sort(),
  });
}

function show(req, res) {
  const brand = Brand.findBySlug(req.params.slug);
  if (!brand) {
    return res.status(404).render('pages/404', { title: 'Brand Not Found' });
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const db = getDb();

  const countRow = db.prepare(
    'SELECT COUNT(*) AS total FROM products WHERE brand_id = ?'
  ).get(brand.id);
  const total = countRow.total;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const products = db.prepare(`
    SELECT p.*, b.name AS brand_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.brand_id = ?
    ORDER BY p.title ASC
    LIMIT ? OFFSET ?
  `).all(brand.id, ITEMS_PER_PAGE, offset);

  res.render('pages/brand', {
    title: `${brand.name} - MedCart Kenya`,
    metaDescription: `Browse ${brand.name} products at MedCart Kenya. ${total} products available with fast delivery across Kenya.`,
    canonicalPath: '/brand/' + brand.slug,
    brand,
    products,
    total,
    page,
    totalPages,
  });
}

module.exports = {
  index,
  show,
};
