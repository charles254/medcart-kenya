const Product = require('../models/Product');
const { ITEMS_PER_PAGE } = require('../config/constants');
const { getDb } = require('../config/database');

function show(req, res) {
  const product = Product.findBySlug(req.params.slug);
  if (!product) {
    return res.status(404).render('pages/404', { title: 'Product Not Found' });
  }

  // Get a category ID for related products
  const db = getDb();
  const productCategory = db.prepare(
    'SELECT category_id FROM product_categories WHERE product_id = ? LIMIT 1'
  ).get(product.id);
  const categoryId = productCategory ? productCategory.category_id : null;

  const related = Product.getRelated(product.id, categoryId, product.brand_id, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.enhanced_description || product.description || product.title,
    image: product.primary_image || 'https://afyacart.net/images/placeholder.svg',
    brand: { '@type': 'Brand', name: product.brand_name || '' },
    sku: product.source_id || String(product.id),
    offers: {
      '@type': 'Offer',
      price: product.sale_price || product.price,
      priceCurrency: 'KES',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'AfyaCart Kenya' },
    },
  };

  res.render('pages/product', {
    title: `${product.title} - AfyaCart Kenya`,
    metaDescription: (product.enhanced_description || product.description || product.title).substring(0, 160),
    canonicalPath: '/product/' + product.slug,
    ogType: 'product',
    ogImage: product.primary_image || undefined,
    jsonLd: jsonLd,
    product,
    related,
  });
}

function search(req, res) {
  const query = (req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);

  let result = { products: [], total: 0, page: 1, totalPages: 0 };
  if (query) {
    result = Product.search(query, page, ITEMS_PER_PAGE);
  }

  res.render('pages/search-results', {
    title: query ? `Search: ${query} - AfyaCart Kenya` : 'Search - AfyaCart Kenya',
    metaDescription: query ? `Search results for "${query}" at AfyaCart Kenya.` : 'Search for medicines and health products at AfyaCart Kenya.',
    canonicalPath: '/search',
    noindex: true,
    query,
    products: result.products,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

module.exports = {
  show,
  search,
};
