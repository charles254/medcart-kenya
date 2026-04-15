const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { CATEGORY_ICONS } = require('../config/constants');

function index(req, res) {
  const categories = Category.getTopLevel().map(cat => ({
    ...cat,
    icon: CATEGORY_ICONS[cat.name] || '',
  }));

  const trending = Product.getTrending(12);
  const deals = Product.getDeals(1, 8);
  const popularBrands = Brand.getPopular(12);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AfyaCart Kenya',
    url: 'https://afyacart.net',
    logo: 'https://afyacart.net/favicon.svg',
    description: "Kenya's trusted online pharmacy",
    contactPoint: { '@type': 'ContactPoint', telephone: '+254734600890', contactType: 'customer service' },
    sameAs: ['https://facebook.com/afyacart', 'https://instagram.com/afyacart', 'https://x.com/afyacart'],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AfyaCart Kenya',
    alternateName: ['AfyaCart', 'Afya Cart'],
    url: 'https://afyacart.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://afyacart.net/search?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  res.render('pages/home', {
    title: 'AfyaCart Kenya - Online Pharmacy',
    metaDescription: 'Shop 8,000+ medicines, vitamins, supplements and health products online. Fast delivery across Kenya.',
    canonicalPath: '',
    jsonLd: [orgJsonLd, websiteJsonLd],
    categories,
    trending,
    deals: deals.products,
    popularBrands,
  });
}

module.exports = {
  index,
};
