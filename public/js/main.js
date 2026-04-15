/**
 * AfyaCart Kenya - Main JavaScript
 * Handles: mobile navigation, image fallbacks, filter toggles
 */
(function() {
  'use strict';

  // ---- Mobile Navigation ----
  var hamburger = document.getElementById('hamburgerBtn');
  var mobileNav = document.getElementById('mobileNav');
  var mobileNavOverlay = document.getElementById('mobileNavOverlay');
  var mobileNavClose = document.getElementById('mobileNavClose');

  function openMobileNav() {
    if (mobileNav) mobileNav.classList.add('active');
    if (mobileNavOverlay) {
      mobileNavOverlay.style.display = 'block';
      // Force reflow for transition
      mobileNavOverlay.offsetHeight;
      mobileNavOverlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('active');
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.remove('active');
      setTimeout(function() {
        mobileNavOverlay.style.display = 'none';
      }, 250);
    }
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (mobileNav && mobileNav.classList.contains('active')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', closeMobileNav);
  }

  // ---- Image Fallback Handler ----
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
      e.target.dataset.fallback = 'true';
      e.target.src = '/images/placeholder.svg';
    }
  }, true);

  // ---- Filter Section Toggles ----
  var filterTitles = document.querySelectorAll('.filter-section-title');
  filterTitles.forEach(function(title) {
    title.addEventListener('click', function() {
      var section = this.closest('.filter-section');
      if (section) {
        section.classList.toggle('collapsed');
      }
    });
  });

  // ---- Hero Banner Slideshow ----
  var sliderTrack = document.getElementById('sliderTrack');
  var slides = sliderTrack ? sliderTrack.querySelectorAll('.slide') : [];
  var sliderDots = document.querySelectorAll('.slider-dot');
  var sliderPrev = document.getElementById('sliderPrev');
  var sliderNext = document.getElementById('sliderNext');
  var currentSlide = 0;
  var slideCount = slides.length;
  var autoSlideTimer;

  function goToSlide(index) {
    if (!sliderTrack || slideCount === 0) return;
    currentSlide = ((index % slideCount) + slideCount) % slideCount;
    sliderTrack.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    sliderDots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  if (sliderNext) sliderNext.addEventListener('click', function() { nextSlide(); startAutoSlide(); });
  if (sliderPrev) sliderPrev.addEventListener('click', function() { prevSlide(); startAutoSlide(); });

  sliderDots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goToSlide(parseInt(this.dataset.slide));
      startAutoSlide();
    });
  });

  if (slideCount > 1) startAutoSlide();

  // ---- Flash Message Auto-dismiss ----
  var flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach(function(msg) {
    setTimeout(function() {
      msg.style.transition = 'opacity 0.3s ease';
      msg.style.opacity = '0';
      setTimeout(function() {
        msg.remove();
      }, 300);
    }, 5000);
  });

})();
