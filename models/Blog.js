const { getDb } = require('../config/database');

function getAll(page = 1, perPage = 6) {
  const db = getDb();
  const offset = (page - 1) * perPage;

  const posts = db.prepare(`
    SELECT * FROM blog_posts
    WHERE published = 1
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(perPage, offset);

  const { total } = db.prepare(`
    SELECT COUNT(*) as total FROM blog_posts WHERE published = 1
  `).get();

  return {
    posts,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

function findBySlug(slug) {
  const db = getDb();
  const post = db.prepare(`
    SELECT * FROM blog_posts WHERE slug = ? AND published = 1
  `).get(slug);

  if (post) {
    db.prepare(`UPDATE blog_posts SET views = views + 1 WHERE id = ?`).run(post.id);
  }

  return post || null;
}

function getByCategory(category, page = 1, perPage = 6) {
  const db = getDb();
  const offset = (page - 1) * perPage;

  const posts = db.prepare(`
    SELECT * FROM blog_posts
    WHERE published = 1 AND category = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(category, perPage, offset);

  const { total } = db.prepare(`
    SELECT COUNT(*) as total FROM blog_posts WHERE published = 1 AND category = ?
  `).get(category);

  return {
    posts,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

function getRecent(limit = 4) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM blog_posts
    WHERE published = 1
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

function getCategories() {
  const db = getDb();
  return db.prepare(`
    SELECT category, COUNT(*) as count
    FROM blog_posts
    WHERE published = 1
    GROUP BY category
    ORDER BY count DESC
  `).all();
}

function getRelated(postId, category, limit = 3) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM blog_posts
    WHERE published = 1 AND id != ? AND category = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(postId, category, limit);
}

module.exports = { getAll, findBySlug, getByCategory, getRecent, getCategories, getRelated };
