function getCart(session) {
  if (!session.cart) {
    session.cart = [];
  }
  return session.cart;
}

function addItem(session, product) {
  const cart = getCart(session);
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.sale_price && product.sale_price < product.price ? product.sale_price : product.price,
      primary_image: product.primary_image,
      requiresPrescription: product.requires_prescription ? true : false,
      quantity: 1,
    });
  }

  session.cart = cart;
}

function updateQuantity(session, productId, quantity) {
  const cart = getCart(session);
  const item = cart.find(item => item.id === productId);

  if (item) {
    if (quantity <= 0) {
      removeItem(session, productId);
    } else {
      item.quantity = quantity;
      session.cart = cart;
    }
  }
}

function removeItem(session, productId) {
  const cart = getCart(session);
  session.cart = cart.filter(item => item.id !== productId);
}

function getTotal(session) {
  const cart = getCart(session);
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCount(session) {
  const cart = getCart(session);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function clear(session) {
  session.cart = [];
}

function hasRxItems(session) {
  const cart = getCart(session);
  return cart.some(item => item.requiresPrescription);
}

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  getTotal,
  getCount,
  clear,
  hasRxItems,
};
