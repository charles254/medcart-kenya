const Cart = require('../models/Cart');

function show(req, res) {
  const cart = Cart.getCart(req.session);
  const total = Cart.getTotal(req.session);
  const hasRxItems = Cart.hasRxItems(req.session);

  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  res.render('pages/checkout', {
    title: 'Checkout - AfyaCart Kenya',
    metaDescription: 'Complete your order at AfyaCart Kenya.',
    canonicalPath: '/checkout',
    noindex: true,
    cart,
    total,
    hasRxItems,
  });
}

function process(req, res) {
  const cart = Cart.getCart(req.session);
  const hasRxItems = Cart.hasRxItems(req.session);

  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  const { name, email, phone, address } = req.body;

  // Basic validation
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name is required');
  if (!email || !email.includes('@')) errors.push('Valid email is required');
  if (!phone || phone.trim().length < 9) errors.push('Phone number is required');
  if (!address || address.trim().length < 5) errors.push('Delivery address is required');

  // Validate prescription upload if cart has Rx items
  if (hasRxItems && !req.file) {
    errors.push('A prescription upload is required for prescription items in your cart');
  }

  if (errors.length > 0) {
    const total = Cart.getTotal(req.session);
    return res.render('pages/checkout', {
      title: 'Checkout - AfyaCart Kenya',
      metaDescription: 'Complete your order at AfyaCart Kenya.',
      canonicalPath: '/checkout',
      noindex: true,
      cart,
      total,
      hasRxItems,
      errors,
      formData: req.body,
    });
  }

  // Store order summary in session before clearing
  req.session.lastOrder = {
    items: [...cart],
    total: Cart.getTotal(req.session),
    customer: { name, email, phone, address },
    orderedAt: new Date().toISOString(),
    prescriptionFile: req.file ? req.file.filename : null,
  };

  Cart.clear(req.session);
  res.redirect('/checkout/success');
}

function success(req, res) {
  const order = req.session.lastOrder;

  res.render('pages/checkout-success', {
    title: 'Order Confirmed - AfyaCart Kenya',
    metaDescription: 'Your order has been confirmed at AfyaCart Kenya.',
    canonicalPath: '/checkout/success',
    noindex: true,
    order: order || null,
  });
}

module.exports = {
  show,
  process,
  success,
};
