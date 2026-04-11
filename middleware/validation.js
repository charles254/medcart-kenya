/**
 * Input validation and sanitization middleware
 * Protects against XSS, injection, and invalid input
 */

// Sanitize search and filter query parameters
function sanitizeQuery(req, res, next) {
  if (req.query.q) {
    req.query.q = req.query.q.replace(/[<>"'`;]/g, '').trim().substring(0, 200);
  }
  if (req.query.minPrice) {
    req.query.minPrice = Math.max(0, parseInt(req.query.minPrice) || 0);
  }
  if (req.query.maxPrice) {
    req.query.maxPrice = Math.max(0, parseInt(req.query.maxPrice) || 100000);
  }
  if (req.query.page) {
    req.query.page = Math.max(1, Math.min(1000, parseInt(req.query.page) || 1));
  }
  next();
}

// Validate checkout form fields
function validateCheckout(req, res, next) {
  const { name, phone, email } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2 || name.length > 100) {
    errors.push('Name must be 2-100 characters');
  }
  if (!phone || !/^[\d+\-\s]{7,20}$/.test(phone)) {
    errors.push('Invalid phone number');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email address');
  }

  if (errors.length > 0) {
    req.validationErrors = errors;
  }
  next();
}

// Sanitize cart input (productId, quantity)
function validateCartInput(req, res, next) {
  if (req.body.productId) {
    req.body.productId = parseInt(req.body.productId) || 0;
  }
  if (req.body.quantity) {
    req.body.quantity = Math.max(1, Math.min(99, parseInt(req.body.quantity) || 1));
  }
  next();
}

module.exports = { sanitizeQuery, validateCheckout, validateCartInput };
