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

  const baseUrl = 'https://afyacart.net';
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    ...ancestors.map((a, i) => ({
      '@type': 'ListItem', position: i + 2, name: a.name, item: `${baseUrl}/category/${a.slug}`,
    })),
    { '@type': 'ListItem', position: ancestors.length + 2, name: category.name },
  ];

  const categoryJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      url: `${baseUrl}/category/${category.slug}`,
      description: `Browse ${category.name} products at AfyaCart Kenya. ${result.total} products available.`,
      numberOfItems: result.total,
    },
  ];

  res.render('pages/category', {
    title: category.name + ' - AfyaCart Kenya',
    metaDescription: 'Browse ' + category.name + ' products at AfyaCart Kenya. ' + result.total + ' products available with fast delivery across Kenya.',
    canonicalPath: '/category/' + category.slug + (page > 1 ? '?page=' + page : ''),
    jsonLd: categoryJsonLd,
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
