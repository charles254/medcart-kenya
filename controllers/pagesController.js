function about(req, res) {
  res.render('pages/about', {
    title: 'About Us - MedCart Kenya',
    metaDescription: 'Learn about MedCart Kenya, your trusted online pharmacy delivering medicines and health products across Kenya.',
    canonicalPath: '/about',
  });
}

function privacy(req, res) {
  res.render('pages/privacy', {
    title: 'Privacy Policy - MedCart Kenya',
    metaDescription: 'Read the MedCart Kenya privacy policy. Learn how we collect, use, and protect your personal information.',
    canonicalPath: '/privacy',
  });
}

function terms(req, res) {
  res.render('pages/terms', {
    title: 'Terms & Conditions - MedCart Kenya',
    metaDescription: 'MedCart Kenya terms and conditions. Review the rules and guidelines for using our online pharmacy services.',
    canonicalPath: '/terms',
  });
}

function cookies(req, res) {
  res.render('pages/cookies', {
    title: 'Cookie Policy - MedCart Kenya',
    metaDescription: 'MedCart Kenya cookie policy. Understand how we use cookies to improve your browsing experience.',
    canonicalPath: '/cookies',
  });
}

function sitemap(req, res) {
  const Category = require('../models/Category');
  const Brand = require('../models/Brand');

  const categories = Category.getTopLevel();
  categories.forEach(cat => {
    cat.children = Category.getChildren(cat.id);
  });

  const popularBrands = Brand.getPopular(30);

  res.render('pages/sitemap', {
    title: 'Sitemap - MedCart Kenya',
    metaDescription: 'Browse the full MedCart Kenya sitemap. Find all categories, brands, and products available on our online pharmacy.',
    canonicalPath: '/sitemap',
    categories,
    popularBrands,
  });
}

function sitemapXml(req, res) {
  const db = require('../config/database').getDb();
  const baseUrl = 'https://afyacart.net';

  // Static pages
  const staticPages = ['', '/about', '/privacy', '/terms', '/cookies', '/brands', '/deals', '/sitemap'];

  // Categories (level 0)
  const categories = db.prepare('SELECT slug FROM categories WHERE level = 0').all();

  // In-stock products (top 5000)
  const products = db.prepare('SELECT slug FROM products WHERE in_stock = 1 ORDER BY stock_quantity DESC LIMIT 5000').all();

  // Active brands (top 500)
  const brands = db.prepare('SELECT slug FROM brands WHERE product_count > 0 ORDER BY product_count DESC LIMIT 500').all();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticPages.forEach(path => {
    xml += `  <url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>${path === '' ? '1.0' : '0.5'}</priority></url>\n`;
  });

  categories.forEach(c => {
    xml += `  <url><loc>${baseUrl}/category/${c.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  });

  products.forEach(p => {
    xml += `  <url><loc>${baseUrl}/product/${p.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
  });

  brands.forEach(b => {
    xml += `  <url><loc>${baseUrl}/brand/${b.slug}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
  });

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
}

module.exports = { about, privacy, terms, cookies, sitemap, sitemapXml };
