function about(req, res) {
  res.render('pages/about', {
    title: 'About Us - AfyaCart Kenya',
    metaDescription: 'Learn about AfyaCart Kenya, your trusted online pharmacy delivering medicines and health products across Kenya.',
    canonicalPath: '/about',
  });
}

function privacy(req, res) {
  res.render('pages/privacy', {
    title: 'Privacy Policy - AfyaCart Kenya',
    metaDescription: 'Read the AfyaCart Kenya privacy policy. Learn how we collect, use, and protect your personal information.',
    canonicalPath: '/privacy',
  });
}

function terms(req, res) {
  res.render('pages/terms', {
    title: 'Terms & Conditions - AfyaCart Kenya',
    metaDescription: 'AfyaCart Kenya terms and conditions. Review the rules and guidelines for using our online pharmacy services.',
    canonicalPath: '/terms',
  });
}

function cookies(req, res) {
  res.render('pages/cookies', {
    title: 'Cookie Policy - AfyaCart Kenya',
    metaDescription: 'AfyaCart Kenya cookie policy. Understand how we use cookies to improve your browsing experience.',
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
    title: 'Sitemap - AfyaCart Kenya',
    metaDescription: 'Browse the full AfyaCart Kenya sitemap. Find all categories, brands, and products available on our online pharmacy.',
    canonicalPath: '/sitemap',
    categories,
    popularBrands,
  });
}

function sitemapXml(req, res) {
  const db = require('../config/database').getDb();
  const baseUrl = 'https://afyacart.net';

  const staticPages = ['', '/about', '/privacy', '/terms', '/cookies', '/brands', '/deals', '/sitemap', '/blog'];
  const categories = db.prepare('SELECT slug FROM categories WHERE level = 0').all();
  const products = db.prepare('SELECT slug, title, primary_image FROM products WHERE in_stock = 1 ORDER BY stock_quantity DESC LIMIT 5000').all();
  const brands = db.prepare('SELECT slug FROM brands WHERE product_count > 0 ORDER BY product_count DESC LIMIT 500').all();

  // Blog posts
  let blogPosts = [];
  try {
    blogPosts = db.prepare('SELECT slug, updated_at FROM blog_posts ORDER BY created_at DESC').all();
  } catch { /* blog table may not exist */ }

  const today = new Date().toISOString().split('T')[0];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  staticPages.forEach(path => {
    xml += `  <url><loc>${baseUrl}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${path === '' ? '1.0' : '0.5'}</priority></url>\n`;
  });

  categories.forEach(c => {
    xml += `  <url><loc>${baseUrl}/category/${c.slug}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  });

  products.forEach(p => {
    const hasImage = p.primary_image && !p.primary_image.includes('placeholder');
    const imageUrl = hasImage ? (p.primary_image.startsWith('http') ? p.primary_image : baseUrl + p.primary_image) : null;
    xml += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n`;
    if (imageUrl) {
      xml += `    <image:image>\n      <image:loc>${esc(imageUrl)}</image:loc>\n      <image:title>${esc(p.title)}</image:title>\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  });

  brands.forEach(b => {
    xml += `  <url><loc>${baseUrl}/brand/${b.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
  });

  blogPosts.forEach(post => {
    const lastmod = post.updated_at ? post.updated_at.split(' ')[0] : today;
    xml += `  <url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  });

  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
}

module.exports = { about, privacy, terms, cookies, sitemap, sitemapXml };
