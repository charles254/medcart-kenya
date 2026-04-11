/**
 * MedCart Kenya - Cart JavaScript
 * AJAX add-to-cart, quantity controls, and remove buttons
 */
(function() {
  'use strict';

  // ---- AJAX Add to Cart ----
  document.addEventListener('submit', function(e) {
    var form = e.target;

    // Handle add-to-cart forms
    if (form.classList.contains('add-to-cart-form')) {
      e.preventDefault();
      var formData = new FormData(form);
      var button = form.querySelector('button[type="submit"]');
      var originalText = button.innerHTML;

      button.disabled = true;
      button.innerHTML = 'Adding...';

      fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formData.get('slug'),
          productId: formData.get('productId')
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          updateCartBadge(data.cartCount);
          button.innerHTML = '&#10003; Added!';
          button.style.backgroundColor = '#008C45';
          setTimeout(function() {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
          }, 1500);
        } else {
          button.innerHTML = originalText;
          button.disabled = false;
        }
      })
      .catch(function() {
        // Fallback: submit the form normally
        button.innerHTML = originalText;
        button.disabled = false;
        form.submit();
      });
    }

    // Handle cart quantity update forms
    if (form.classList.contains('cart-qty-form')) {
      e.preventDefault();
      var qtyFormData = new FormData(form);

      fetch('/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(qtyFormData).toString()
      })
      .then(function(res) {
        if (res.ok) {
          window.location.reload();
        }
      })
      .catch(function() {
        form.submit();
      });
    }

    // Handle cart remove forms
    if (form.classList.contains('cart-remove-form')) {
      e.preventDefault();
      var removeFormData = new FormData(form);

      fetch('/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(removeFormData).toString()
      })
      .then(function(res) {
        if (res.ok) {
          window.location.reload();
        }
      })
      .catch(function() {
        form.submit();
      });
    }
  });

  // ---- Update Cart Badge ----
  function updateCartBadge(count) {
    var badge = document.getElementById('cartBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

})();
