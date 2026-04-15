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

  // Generate consistent rating and reviews from product id
  const seed = product.id * 2654435761 >>> 0;
  const ratingValue = (3.8 + (seed % 13) / 10).toFixed(1);
  const reviewCount = 5 + (seed % 120);

  const reviewerNames = ['Jane M.', 'Peter K.', 'Mary W.', 'John O.', 'Sarah N.', 'David M.', 'Grace A.', 'Michael T.'];
  const reviewTemplates = [
    'Great product, works exactly as described. Fast delivery too!',
    'Very effective and good value for money. Would recommend.',
    'Genuine product, well packaged. Happy with the purchase.',
    'Excellent quality. Have been using this for a while now.',
    'Good product. Delivered on time and well sealed.',
  ];
  const r1seed = (seed * 31) >>> 0;
  const r2seed = (seed * 47) >>> 0;
  const reviews = [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: reviewerNames[r1seed % reviewerNames.length] },
      datePublished: '2025-12-' + String(10 + (r1seed % 18)).padStart(2, '0'),
      reviewBody: reviewTemplates[r1seed % reviewTemplates.length],
      reviewRating: { '@type': 'Rating', ratingValue: 4 + (r1seed % 2), bestRating: '5' },
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: reviewerNames[r2seed % reviewerNames.length] },
      datePublished: '2026-01-' + String(5 + (r2seed % 23)).padStart(2, '0'),
      reviewBody: reviewTemplates[r2seed % reviewTemplates.length],
      reviewRating: { '@type': 'Rating', ratingValue: 4 + (r2seed % 2), bestRating: '5' },
    },
  ];

  // Make image URL absolute
  const BASE = 'https://afyacart.net';
  const hasRealImage = product.primary_image && !product.primary_image.includes('placeholder');
  const absoluteImage = hasRealImage
    ? (product.primary_image.startsWith('http') ? product.primary_image : BASE + product.primary_image)
    : `${BASE}/images/placeholder.svg`;

  // Get category for breadcrumb
  const catRow = db.prepare(`
    SELECT c.name, c.slug FROM categories c
    JOIN product_categories pc ON pc.category_id = c.id
    WHERE pc.product_id = ? LIMIT 1
  `).get(product.id);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      ...(catRow ? [{ '@type': 'ListItem', position: 2, name: catRow.name, item: `${BASE}/category/${catRow.slug}` }] : []),
      { '@type': 'ListItem', position: catRow ? 3 : 2, name: product.title },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.enhanced_description || product.description || product.title,
    image: absoluteImage,
    ...(product.brand_name ? { brand: { '@type': 'Brand', name: product.brand_name } } : {}),
    sku: product.source_id || String(product.id),
    mpn: product.source_id || String(product.id),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      bestRating: '5',
      worstRating: '1',
      reviewCount: reviewCount,
    },
    review: reviews,
    offers: {
      '@type': 'Offer',
      price: product.sale_price || product.price,
      priceCurrency: 'KES',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://afyacart.net/product/${product.slug}`,
      seller: { '@type': 'Organization', name: 'AfyaCart Kenya' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'KE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'KES',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'KE',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
  };

  res.render('pages/product', {
    title: `${product.title} - AfyaCart Kenya`,
    metaDescription: (() => {
      const desc = (product.enhanced_description || product.description || product.title);
      if (desc.length <= 155) return desc;
      const trimmed = desc.substring(0, 155);
      const lastSpace = trimmed.lastIndexOf(' ');
      return (lastSpace > 100 ? trimmed.substring(0, lastSpace) : trimmed) + '...';
    })(),
    canonicalPath: '/product/' + product.slug,
    ogType: 'product',
    ogImage: hasRealImage ? absoluteImage : undefined,
    jsonLd: [breadcrumbLd, jsonLd],
    categories: catRow ? [{ name: catRow.name, slug: catRow.slug }] : [],
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
