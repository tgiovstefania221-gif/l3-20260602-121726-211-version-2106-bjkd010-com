(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 48);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__hlsPromise) {
            return window.__hlsPromise;
        }
        window.__hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsPromise;
    }

    function beginPlayback(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var streamUrl = cover ? cover.getAttribute('data-play-url') : '';

        if (!video || !streamUrl) {
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== streamUrl) {
                video.setAttribute('src', streamUrl);
            }
            video.play().catch(function () {});
            return;
        }

        loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                if (video._hlsPlayer) {
                    video._hlsPlayer.destroy();
                }
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                video._hlsPlayer = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.setAttribute('src', streamUrl);
                video.play().catch(function () {});
            }
        }).catch(function () {
            video.setAttribute('src', streamUrl);
            video.play().catch(function () {});
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var cover = box.querySelector('.player-cover');
        var video = box.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                beginPlayback(box);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.currentSrc) {
                    beginPlayback(box);
                }
            });
        }
    });

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
            '<span class="poster-wrap">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">' +
                '<span class="poster-shade"></span>' +
                '<span class="poster-play">▶</span>' +
            '</span>' +
            '<span class="movie-card-body">' +
                '<span class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></span>' +
                '<strong>' + escapeHtml(movie.title) + '</strong>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<span class="movie-tags">' + tags + '</span>' +
            '</span>' +
        '</a>';
    }

    var searchForm = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (searchForm && results && window.MovieData) {
        var keywordInput = searchForm.querySelector('[data-search-keyword]');
        var categoryInput = searchForm.querySelector('[data-search-category]');
        var regionInput = searchForm.querySelector('[data-search-region]');
        var yearInput = searchForm.querySelector('[data-search-year]');
        var params = new URLSearchParams(window.location.search);

        if (keywordInput && params.get('keyword')) {
            keywordInput.value = params.get('keyword');
        }
        if (categoryInput && params.get('category')) {
            categoryInput.value = params.get('category');
        }
        if (regionInput && params.get('region')) {
            regionInput.value = params.get('region');
        }
        if (yearInput && params.get('year')) {
            yearInput.value = params.get('year');
        }

        function applySearch() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var category = categoryInput ? categoryInput.value : '';
            var region = regionInput ? regionInput.value : '';
            var year = yearInput ? yearInput.value : '';
            var filtered = window.MovieData.filter(function (movie) {
                var target = [movie.title, movie.oneLine, movie.genre, movie.region, movie.category].concat(movie.tags || []).join(' ').toLowerCase();
                if (keyword && target.indexOf(keyword) === -1) {
                    return false;
                }
                if (category && movie.category !== category) {
                    return false;
                }
                if (region && movie.region !== region) {
                    return false;
                }
                if (year && String(movie.year) !== String(year)) {
                    return false;
                }
                return true;
            });
            var visible = filtered.slice(0, 240);
            results.innerHTML = visible.map(cardTemplate).join('');
            if (summary) {
                summary.textContent = filtered.length ? '筛选结果已更新' : '未找到相关内容';
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
        });

        searchForm.addEventListener('change', applySearch);

        if (window.location.search) {
            applySearch();
        }
    }
})();
