(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function toggleHeader() {
    var searchToggle = document.querySelector("[data-search-toggle]");
    var searchPanel = document.querySelector("[data-search-panel]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function () {
        searchPanel.classList.toggle("active");
        var input = searchPanel.querySelector("input");
        if (searchPanel.classList.contains("active") && input) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("active");
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-section"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var container = scope.querySelector("[data-card-container]");
      var empty = scope.querySelector("[data-empty-state]");

      if (!container) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var term = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesTerm = !term || haystack.indexOf(term) !== -1;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var cardType = card.getAttribute("data-type") || "";
          var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
          var show = matchesTerm && matchesYear && matchesType;

          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("active", visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector(".player-cover");
      if (!video || !trigger) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var initialized = false;
      var hlsInstance = null;

      function init() {
        if (initialized || !stream) {
          return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        init();
        player.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      init();

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (!player.classList.contains("is-playing")) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    toggleHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
