/**
 * MedCart Kenya - Search Autocomplete
 * Debounced autocomplete: fetches /api/search?q=TERM and renders dropdown
 */
(function() {
  'use strict';

  var searchInput = document.getElementById('searchInput');
  var autocompleteEl = document.getElementById('searchAutocomplete');
  var debounceTimer = null;
  var DEBOUNCE_DELAY = 300;
  var MIN_CHARS = 2;

  if (!searchInput || !autocompleteEl) return;

  // Debounced search
  searchInput.addEventListener('input', function() {
    var query = this.value.trim();

    clearTimeout(debounceTimer);

    if (query.length < MIN_CHARS) {
      hideAutocomplete();
      return;
    }

    debounceTimer = setTimeout(function() {
      fetchResults(query);
    }, DEBOUNCE_DELAY);
  });

  // Hide on blur (with delay so clicks register)
  searchInput.addEventListener('blur', function() {
    setTimeout(function() {
      hideAutocomplete();
    }, 200);
  });

  // Show on focus if there's content
  searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= MIN_CHARS && autocompleteEl.children.length > 0) {
      showAutocomplete();
    }
  });

  // Enter key navigates to search results
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      hideAutocomplete();
    }
  });

  function fetchResults(query) {
    fetch('/api/search?q=' + encodeURIComponent(query))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        renderResults(data.products || data.results || data || []);
      })
      .catch(function() {
        hideAutocomplete();
      });
  }

  function renderResults(products) {
    autocompleteEl.innerHTML = '';

    if (!products || products.length === 0) {
      hideAutocomplete();
      return;
    }

    products.forEach(function(p) {
      var item = document.createElement('a');
      item.href = '/product/' + p.slug;
      item.className = 'autocomplete-item';

      var imgSrc = p.primary_image || '/images/placeholder.svg';
      var price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;

      item.innerHTML =
        '<img src="' + imgSrc + '" alt="" onerror="this.src=\'/images/placeholder.svg\'">' +
        '<div class="autocomplete-item-info">' +
          '<div class="autocomplete-item-title">' + escapeHtml(p.title) + '</div>' +
          '<div class="autocomplete-item-price">KES ' + Number(price).toLocaleString() + '</div>' +
        '</div>';

      autocompleteEl.appendChild(item);
    });

    showAutocomplete();
  }

  function showAutocomplete() {
    autocompleteEl.classList.add('active');
  }

  function hideAutocomplete() {
    autocompleteEl.classList.remove('active');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
