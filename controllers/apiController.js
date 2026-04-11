const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { AUTOCOMPLETE_LIMIT, ITEMS_PER_PAGE } = require('../config/constants');

function search(req, res) {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json({ results: [] });
  }

  const result = Product.search(query, 1, AUTOCOMPLETE_LIMIT);
  const results = result.products.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    sale_price: p.sale_price,
    primary_image: p.primary_image,
    brand_name: p.brand_name,
  }));

  res.json({ results });
}

function products(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = Math.min(48, parseInt(req.query.perPage) || ITEMS_PER_PAGE);
  const query = (req.query.q || '').trim();

  let result;
  if (query) {
    result = Product.search(query, page, perPage);
  } else {
    // Return trending/all products if no query
    const trending = Product.getTrending(perPage);
    result = { products: trending, total: trending.length, page: 1, totalPages: 1 };
  }

  res.json({
    products: result.products,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

function cartAdd(req, res) {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: 'Product slug is required' });
  }

  const product = Product.findBySlug(slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  Cart.addItem(req.session, product);

  res.json({
    success: true,
    cartCount: Cart.getCount(req.session),
    cartTotal: Cart.getTotal(req.session),
  });
}

module.exports = {
  search,
  products,
  cartAdd,
};
