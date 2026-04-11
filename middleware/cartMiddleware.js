const Cart = require('../models/Cart');
const Category = require('../models/Category');
const { CATEGORY_ICONS } = require('../config/constants');

let cachedCategories = null;

function cartMiddleware(req, res, next) {
  res.locals.cartCount = Cart.getCount(req.session);
  res.locals.cartTotal = Cart.getTotal(req.session);

  // Cache top-level categories for the nav dropdown
  if (!cachedCategories) {
    cachedCategories = Category.getTopLevel().map(cat => ({
      ...cat,
      icon: CATEGORY_ICONS[cat.name] || '💊',
    }));
  }
  res.locals.topCategories = cachedCategories;

  next();
}

module.exports = cartMiddleware;
