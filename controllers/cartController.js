const Cart = require('../models/Cart');
const Product = require('../models/Product');

function show(req, res) {
  const cart = Cart.getCart(req.session);
  const total = Cart.getTotal(req.session);

  const hasRxItems = Cart.hasRxItems(req.session);

  res.render('pages/cart', {
    title: 'Shopping Cart - MedCart Kenya',
    metaDescription: 'Your MedCart Kenya shopping cart.',
    canonicalPath: '/cart',
    noindex: true,
    cart,
    total,
    hasRxItems,
  });
}

function add(req, res) {
  const { slug } = req.body;
  if (slug) {
    const product = Product.findBySlug(slug);
    if (product) {
      Cart.addItem(req.session, product);
    }
  }
  res.redirect(req.get('Referer') || '/cart');
}

function update(req, res) {
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity);

  if (productId && !isNaN(quantity)) {
    Cart.updateQuantity(req.session, productId, quantity);
  }
  res.redirect('/cart');
}

function remove(req, res) {
  const productId = parseInt(req.body.productId);
  if (productId) {
    Cart.removeItem(req.session, productId);
  }
  res.redirect('/cart');
}

module.exports = {
  show,
  add,
  update,
  remove,
};
