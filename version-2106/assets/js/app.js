document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
  var empty = document.querySelector("[data-empty-result]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
  var activeFilter = "";

  function applySearch() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || ""
      ].join(" ").toLowerCase();
      var okKeyword = !keyword || text.indexOf(keyword) >= 0;
      var okFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) >= 0;
      var ok = okKeyword && okFilter;
      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var value = chip.getAttribute("data-filter-chip") || "";
      activeFilter = activeFilter === value ? "" : value;
      chips.forEach(function (item) {
        item.classList.toggle("active", item === chip && activeFilter);
      });
      applySearch();
    });
  });

  var player = document.querySelector("[data-video-player]");
  var playButton = document.querySelector("[data-play-button]");
  var playLayer = document.querySelector("[data-play-layer]");
  var hlsInstance = null;
  var ready = false;

  function startPlayer() {
    if (!player) {
      return;
    }
    var source = player.getAttribute("data-source");
    if (!source) {
      return;
    }
    if (!ready) {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(player);
      } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = source;
      } else {
        player.src = source;
      }
      ready = true;
    }
    if (playLayer) {
      playLayer.classList.add("hidden");
    }
    var promise = player.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayer);
  }
  if (player) {
    player.addEventListener("click", function () {
      if (player.paused) {
        startPlayer();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
