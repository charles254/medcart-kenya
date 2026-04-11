const { getDb } = require('../config/database');
const { ITEMS_PER_PAGE } = require('../config/constants');

function findBySlug(slug) {
  const db = getDb();
  const product = db.prepare(`
    SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.slug = ?
  `).get(slug);
  return product || null;
}

function findByCategory(categoryIds, filters = {}, page = 1, perPage = ITEMS_PER_PAGE) {
  const db = getDb();
  const { minPrice, maxPrice, brandIds, inStock, prescription, sort } = filters;

  const whereClauses = ['pc.category_id IN (' + categoryIds.map(() => '?').join(',') + ')'];
  const params = [...categoryIds];

  if (minPrice != null) {
    whereClauses.push('p.price >= ?');
    params.push(minPrice);
  }
  if (maxPrice != null) {
    whereClauses.push('p.price <= ?');
    params.push(maxPrice);
  }
  if (brandIds && brandIds.length > 0) {
    whereClauses.push('p.brand_id IN (' + brandIds.map(() => '?').join(',') + ')');
    params.push(...brandIds);
  }
  if (inStock != null) {
    whereClauses.push('p.in_stock = ?');
    params.push(inStock ? 1 : 0);
  }
  if (prescription != null) {
    whereClauses.push('p.requires_prescription = ?');
    params.push(prescription ? 1 : 0);
  }

  const whereSQL = whereClauses.join(' AND ');

  let orderBy = 'p.id DESC';
  switch (sort) {
    case 'price_asc': orderBy = 'p.price ASC'; break;
    case 'price_desc': orderBy = 'p.price DESC'; break;
    case 'name_asc': orderBy = 'p.title ASC'; break;
    case 'name_desc': orderBy = 'p.title DESC'; break;
    case 'newest': orderBy = 'p.created_at DESC'; break;
    case 'discount': orderBy = 'CASE WHEN p.sale_price IS NOT NULL AND p.sale_price < p.price THEN (p.price - p.sale_price) / p.price ELSE 0 END DESC'; break;
    default: orderBy = 'p.id DESC';
  }

  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    WHERE ${whereSQL}
  `).get(...params);

  const total = countRow.total;
  const totalPages = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;

  const products = db.prepare(`
    SELECT DISTINCT p.*, b.name AS brand_name
    FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE ${whereSQL}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, perPage, offset);

  return { products, total, page, totalPages };
}

function search(query, page = 1, perPage = ITEMS_PER_PAGE) {
  const db = getDb();

  // Prepare FTS5 query with prefix matching
  const ftsQuery = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `"${term.replace(/"/g, '""')}"*`)
    .join(' ');

  if (!ftsQuery) {
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM products_fts
    WHERE products_fts MATCH ?
  `).get(ftsQuery);

  const total = countRow.total;
  const totalPages = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;

  const products = db.prepare(`
    SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
    FROM products_fts fts
    JOIN products p ON p.rowid = fts.rowid
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE products_fts MATCH ?
    ORDER BY rank
    LIMIT ? OFFSET ?
  `).all(ftsQuery, perPage, offset);

  return { products, total, page, totalPages };
}

function getDeals(page = 1, perPage = ITEMS_PER_PAGE) {
  const db = getDb();

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total FROM products
    WHERE sale_price IS NOT NULL AND sale_price < price
  `).get();

  const total = countRow.total;
  const totalPages = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;

  const products = db.prepare(`
    SELECT p.*, b.name AS brand_name, b.slug AS brand_slug,
      ROUND((p.price - p.sale_price) / p.price * 100) AS discount_percent
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.sale_price IS NOT NULL AND p.sale_price < p.price
    ORDER BY (p.price - p.sale_price) / p.price DESC
    LIMIT ? OFFSET ?
  `).all(perPage, offset);

  return { products, total, page, totalPages };
}

function getTrending(limit = 12) {
  const db = getDb();
  return db.prepare(`
    SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.in_stock = 1
      AND p.requires_prescription = 0
      AND p.primary_image IS NOT NULL
      AND p.primary_image != ''
    ORDER BY p.stock_quantity DESC
    LIMIT ?
  `).all(limit);
}

function getRelated(productId, categoryId, brandId, limit = 6) {
  const db = getDb();
  return db.prepare(`
    SELECT DISTINCT p.*, b.name AS brand_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    WHERE p.id != ?
      AND (pc.category_id = ? OR p.brand_id = ?)
    ORDER BY RANDOM()
    LIMIT ?
  `).all(productId, categoryId || 0, brandId || 0, limit);
}

function countAll() {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) AS total FROM products').get();
  return row.total;
}

module.exports = {
  findBySlug,
  findByCategory,
  search,
  getDeals,
  getTrending,
  getRelated,
  countAll,
};
