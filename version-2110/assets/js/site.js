(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupArchiveFilters();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupArchiveFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-card-grid]");

    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var searchInput = panel.querySelector("[data-search-input]");
    var yearFilter = panel.querySelector("[data-year-filter]");
    var typeFilter = panel.querySelector("[data-type-filter]");
    var sortSelect = panel.querySelector("[data-sort-select]");
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query && searchInput) {
      searchInput.value = query;
    }

    function filterCards() {
      var keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType === type;
        var visible = matchKeyword && matchYear && matchType;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    function sortCards() {
      var value = sortSelect ? sortSelect.value : "newest";
      var sorted = cards.slice().sort(function (a, b) {
        if (value === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }

        var yearA = Number(a.getAttribute("data-year") || 0);
        var yearB = Number(b.getAttribute("data-year") || 0);

        return value === "oldest" ? yearA - yearB : yearB - yearA;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [searchInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortCards();
        filterCards();
      });
    }

    sortCards();
    filterCards();
  }
})();
