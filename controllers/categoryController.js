const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { ITEMS_PER_PAGE, SORT_OPTIONS } = require('../config/constants');

function show(req, res) {
  const category = Category.findBySlug(req.params.slug);
  if (!category) {
    return res.status(404).render('pages/404', { title: 'Category Not Found' });
  }

  const descendantIds = Category.getDescendantIds(category.id);
  const children = Category.getChildren(category.id);
  const ancestors = Category.getAncestors(category.id);

  // Parse filter query params
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
  const sort = req.query.sort || 'relevance';
  const inStock = req.query.inStock === '1' ? true : undefined;
  const prescription = req.query.rx === '1' ? true : (req.query.rx === '0' ? false : undefined);

  let brandIds;
  if (req.query.brand) {
    brandIds = Array.isArray(req.query.brand)
      ? req.query.brand.map(Number)
      : [Number(req.query.brand)];
  }

  const filters = { minPrice, maxPrice, brandIds, inStock, prescription, sort };
  const result = Product.findByCategory(descendantIds, filters, page, ITEMS_PER_PAGE);

  // Get brands available in this category for the filter sidebar
  const brandsInCategory = Brand.getByCategory(category.id);

  res.render('pages/category', {
    title: category.name + ' - MedCart Kenya',
    metaDescription: 'Browse ' + category.name + ' products at MedCart Kenya. ' + result.total + ' products available with fast delivery across Kenya.',
    canonicalPath: '/category/' + category.slug,
    category,
    children,
    ancestors,
    products: result.products,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    brandsInCategory,
    filters,
    sortOptions: SORT_OPTIONS,
    query: req.query,
  });
}

module.exports = {
  show,
};
