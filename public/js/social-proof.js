/**
 * MedCart Kenya - Social Proof Notifications
 * Shows realistic purchase/activity notifications to build trust
 */
(function() {
  'use strict';

  var container = document.getElementById('socialProofContainer');
  if (!container) return;

  // Kenyan cities and names
  var cities = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Thika', 'Malindi', 'Kitale', 'Naivasha', 'Nanyuki',
    'Nyeri', 'Machakos', 'Meru', 'Lamu', 'Garissa',
    'Kilifi', 'Kajiado', 'Kiambu', 'Ruiru', 'Athi River'
  ];

  var firstNames = [
    'Jane', 'Mary', 'Grace', 'Faith', 'Joy',
    'Peter', 'John', 'James', 'David', 'Samuel',
    'Ann', 'Sarah', 'Ruth', 'Esther', 'Mercy',
    'Brian', 'Kevin', 'Dennis', 'Martin', 'Joseph',
    'Lucy', 'Diana', 'Catherine', 'Monica', 'Teresa',
    'Charles', 'Patrick', 'Michael', 'Paul', 'George'
  ];

  // Product snippets (realistic pharmacy products)
  var products = [
    { name: 'Panadol Extra Tablets', price: 'KES 1,000' },
    { name: 'Vitamin C 1000mg', price: 'KES 450' },
    { name: 'CeraVe Moisturizing Cream', price: 'KES 2,320' },
    { name: 'Omega 3 Fish Oil Capsules', price: 'KES 1,200' },
    { name: 'Nivea Body Lotion 400ml', price: 'KES 850' },
    { name: 'Centrum Multivitamins', price: 'KES 2,100' },
    { name: 'Dettol Antiseptic 500ml', price: 'KES 680' },
    { name: 'Dove Shampoo 400ml', price: 'KES 950' },
    { name: 'Huggies Diapers Size 3', price: 'KES 1,450' },
    { name: 'La Roche-Posay Sunscreen', price: 'KES 3,200' },
    { name: 'Strepsils Lozenges 24s', price: 'KES 520' },
    { name: 'Osteocare Tablets 30s', price: 'KES 842' },
    { name: 'Colgate Toothpaste 150ml', price: 'KES 380' },
    { name: 'Johnson Baby Oil 200ml', price: 'KES 620' },
    { name: 'Biotin Hair Supplements', price: 'KES 1,800' },
  ];

  var timeAgo = [
    '2 minutes ago', '5 minutes ago', '8 minutes ago',
    '12 minutes ago', '15 minutes ago', '20 minutes ago',
    '25 minutes ago', '32 minutes ago', '45 minutes ago',
    '1 hour ago', '1 hour ago', '2 hours ago'
  ];

  // Different notification types
  var notifTypes = [
    function() {
      var p = products[Math.floor(Math.random() * products.length)];
      var name = firstNames[Math.floor(Math.random() * firstNames.length)];
      var city = cities[Math.floor(Math.random() * cities.length)];
      var time = timeAgo[Math.floor(Math.random() * timeAgo.length)];
      return {
        icon: '&#128722;',
        iconBg: '#00A651',
        title: name + ' from ' + city,
        text: 'Just purchased <strong>' + p.name + '</strong>',
        time: time,
      };
    },
    function() {
      var count = Math.floor(Math.random() * 30) + 5;
      var p = products[Math.floor(Math.random() * products.length)];
      return {
        icon: '&#128293;',
        iconBg: '#FF6B35',
        title: 'Trending Now',
        text: '<strong>' + p.name + '</strong> - ' + count + ' people bought this today',
        time: 'Popular item',
      };
    },
    function() {
      var count = Math.floor(Math.random() * 50) + 10;
      return {
        icon: '&#11088;',
        iconBg: '#F59E0B',
        title: count + ' orders placed',
        text: 'In the last hour across Kenya',
        time: 'Live update',
      };
    },
    function() {
      var name = firstNames[Math.floor(Math.random() * firstNames.length)];
      var city = cities[Math.floor(Math.random() * cities.length)];
      return {
        icon: '&#9989;',
        iconBg: '#00A651',
        title: 'Order Delivered',
        text: name + ' in ' + city + ' received their order',
        time: Math.floor(Math.random() * 3 + 1) + ' hours ago',
      };
    },
    function() {
      var p = products[Math.floor(Math.random() * products.length)];
      var viewers = Math.floor(Math.random() * 15) + 3;
      return {
        icon: '&#128064;',
        iconBg: '#6366F1',
        title: viewers + ' people viewing',
        text: '<strong>' + p.name + '</strong> right now',
        time: 'Live',
      };
    },
  ];

  function showNotification() {
    var type = notifTypes[Math.floor(Math.random() * notifTypes.length)];
    var data = type();

    var toast = document.createElement('div');
    toast.className = 'social-proof-toast';
    toast.innerHTML =
      '<div class="sp-icon" style="background:' + data.iconBg + ';">' + data.icon + '</div>' +
      '<div class="sp-content">' +
        '<div class="sp-title">' + data.title + '</div>' +
        '<div class="sp-text">' + data.text + '</div>' +
        '<div class="sp-time">' + data.time + '</div>' +
      '</div>' +
      '<button class="sp-close" onclick="this.parentElement.remove();">&times;</button>';

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(function() {
      toast.classList.add('sp-show');
    });

    // Auto remove after 5 seconds
    setTimeout(function() {
      toast.classList.remove('sp-show');
      toast.classList.add('sp-hide');
      setTimeout(function() {
        if (toast.parentElement) toast.remove();
      }, 400);
    }, 5000);
  }

  // Start showing after 8 seconds, then every 20-40 seconds
  setTimeout(function() {
    showNotification();
    setInterval(function() {
      showNotification();
    }, Math.floor(Math.random() * 20000) + 20000);
  }, 8000);

})();
