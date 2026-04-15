const Product = require('../models/Product');
const { ITEMS_PER_PAGE } = require('../config/constants');

function index(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const result = Product.getDeals(page, ITEMS_PER_PAGE);

  res.render('pages/deals', {
    title: 'Deals & Offers - AfyaCart Kenya',
    metaDescription: 'Discover the best deals and offers on medicines, supplements, and health products at AfyaCart Kenya.',
    canonicalPath: '/deals',
    products: result.products,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

module.exports = {
  index,
};
