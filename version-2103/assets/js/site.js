(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCategoryFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector('[data-filter-keyword]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
    var empty = document.querySelector('[data-filter-empty]');

    function apply() {
      var keywordValue = normalize(keyword && keyword.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.querySelector('.card-desc') ? card.querySelector('.card-desc').textContent : ''
        ].join(' '));
        var ok = true;
        if (keywordValue && haystack.indexOf(keywordValue) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          ok = false;
        }
        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          ok = false;
        }
        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, region, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function buildSearchCard(item) {
    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + item.url + '" aria-label="查看' + escapeHtml(item.title) + '">',
      '    <img src="' + item.poster + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + item.year + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
      '    <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '    <div class="tag-row">' + escapeHtml((item.tags || []).slice(0, 3).join(' ')) + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var panel = document.querySelector('[data-search-panel]');
    var results = document.querySelector('[data-search-results]');
    if (!panel || !results || !window.SEARCH_INDEX) {
      return;
    }
    var keyword = panel.querySelector('[data-search-keyword]');
    var category = panel.querySelector('[data-search-category]');
    var year = panel.querySelector('[data-search-year]');
    var region = panel.querySelector('[data-search-region]');
    var type = panel.querySelector('[data-search-type]');
    var status = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && keyword) {
      keyword.value = params.get('q');
    }

    function apply() {
      var keywordValue = normalize(keyword && keyword.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);

      var filtered = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.oneLine,
          item.summary,
          item.region,
          item.type,
          item.year,
          item.categoryName,
          (item.tags || []).join(' ')
        ].join(' '));
        if (keywordValue && haystack.indexOf(keywordValue) === -1) {
          return false;
        }
        if (categoryValue && normalize(item.categorySlug) !== categoryValue) {
          return false;
        }
        if (yearValue && normalize(item.year) !== yearValue) {
          return false;
        }
        if (regionValue && normalize(item.region) !== regionValue) {
          return false;
        }
        if (typeValue && normalize(item.type) !== typeValue) {
          return false;
        }
        return true;
      }).slice(0, 160);

      results.innerHTML = filtered.map(buildSearchCard).join('');
      if (status) {
        status.textContent = filtered.length ? '已显示匹配结果，点击卡片进入详情页。' : '没有找到匹配内容，可尝试减少筛选条件。';
      }
    }

    [keyword, category, year, region, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player-shell]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video[data-m3u8]');
    var start = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (!video) {
        return Promise.reject(new Error('播放器未找到'));
      }
      var source = video.getAttribute('data-m3u8');
      if (!source) {
        return Promise.reject(new Error('播放源为空'));
      }
      if (video.getAttribute('data-loaded') === 'true') {
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-loaded', 'true');
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        video.setAttribute('data-loaded', 'true');
        return Promise.resolve();
      }
      return Promise.reject(new Error('当前浏览器未加载 HLS 播放能力'));
    }

    function play() {
      setMessage('正在加载播放源...');
      attachSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          setMessage('');
          if (start) {
            start.classList.add('is-hidden');
          }
        })
        .catch(function (error) {
          setMessage(error && error.message ? error.message : '播放启动失败，请稍后重试');
        });
    }

    if (start) {
      start.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        if (start) {
          start.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (start && video.currentTime === 0) {
          start.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        setMessage('播放源加载失败，请检查网络或稍后重试');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
