const { getDb } = require('../config/database');

function getTopLevel() {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM categories
    WHERE level = 0
    ORDER BY product_count DESC
  `).all();
}

function findBySlug(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) || null;
}

function getChildren(parentId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM categories
    WHERE parent_id = ?
    ORDER BY name ASC
  `).all(parentId);
}

function getDescendantIds(categoryId) {
  const db = getDb();
  const ids = [categoryId];
  const queue = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift();
    const children = db.prepare('SELECT id FROM categories WHERE parent_id = ?').all(current);
    for (const child of children) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }

  return ids;
}

function getAncestors(categoryId) {
  const db = getDb();
  const ancestors = [];
  let currentId = categoryId;

  while (currentId) {
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(currentId);
    if (!cat || !cat.parent_id) break;
    const parent = db.prepare('SELECT * FROM categories WHERE id = ?').get(cat.parent_id);
    if (!parent) break;
    ancestors.unshift(parent);
    currentId = parent.id;
    if (!parent.parent_id) break;
  }

  return ancestors;
}

function getTree() {
  const db = getDb();
  const topLevel = getTopLevel();
  return topLevel.map(cat => ({
    ...cat,
    children: getChildren(cat.id).map(child => ({
      ...child,
      children: getChildren(child.id),
    })),
  }));
}

module.exports = {
  getTopLevel,
  findBySlug,
  getChildren,
  getDescendantIds,
  getAncestors,
  getTree,
};
