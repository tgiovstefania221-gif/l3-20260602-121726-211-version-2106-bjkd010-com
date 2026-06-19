(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      setHero(current + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(current + 1);
        startHero();
      });
    }

    startHero();
  }

  var input = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
  var empty = document.querySelector('[data-empty-result]');

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function filterItems() {
    if (!items.length) {
      return;
    }

    var query = (input ? input.value : '').trim().toLowerCase();
    var year = yearFilter ? yearFilter.value : '';
    var category = categoryFilter ? categoryFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var visible = 0;

    items.forEach(function (item) {
      var haystack = [
        item.getAttribute('data-title'),
        item.getAttribute('data-tags'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-category'),
        item.getAttribute('data-year')
      ].join(' ').toLowerCase();

      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (year && item.getAttribute('data-year') !== year) {
        matched = false;
      }

      if (category && item.getAttribute('data-category') !== category) {
        matched = false;
      }

      if (type && item.getAttribute('data-type') !== type) {
        matched = false;
      }

      item.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (input) {
    var initial = getParam('q');
    if (initial) {
      input.value = initial;
    }

    input.addEventListener('input', filterItems);
  }

  [yearFilter, categoryFilter, typeFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('change', filterItems);
    }
  });

  filterItems();
})();
