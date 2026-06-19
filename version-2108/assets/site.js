document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchBoxes();
    setupHeroSlider();
    setupVideoPlayers();
    hideBrokenImages();
});

function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', function () {
        nav.classList.toggle('is-open');
        document.body.classList.toggle('no-scroll', nav.classList.contains('is-open'));
    });
}

function setupSearchBoxes() {
    var inputs = document.querySelectorAll('[data-search-input]');

    inputs.forEach(function (input) {
        var scope = input.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var emptyState = scope.querySelector('[data-empty-state]');

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        });
    });
}

function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));

    if (slides.length === 0) {
        return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.classList.toggle('is-active', thumbIndex === current);
        });
    }

    function startTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
            activate(index);
            startTimer();
        });
    });

    activate(0);
    startTimer();
}

function setupVideoPlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        var button = player.querySelector('[data-play-button]');
        var video = player.querySelector('video');
        var status = player.querySelector('[data-player-status]');
        var source = player.getAttribute('data-video-src');
        var hlsInstance = null;

        if (!button || !video || !source) {
            return;
        }

        button.addEventListener('click', function () {
            button.classList.add('hidden');
            video.setAttribute('controls', 'controls');

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    tryPlay(video, status);
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (status && data && data.fatal) {
                        status.textContent = '当前播放源暂时无法加载，请稍后重试。';
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    tryPlay(video, status);
                }, { once: true });
            } else if (status) {
                status.textContent = '当前浏览器需要支持 HLS 才能播放该片源。';
            }
        });
    });
}

function tryPlay(video, status) {
    var playPromise = video.play();

    if (status) {
        status.textContent = '正在加载播放源…';
    }

    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.then(function () {
            if (status) {
                status.textContent = '正在播放。';
            }
        }).catch(function () {
            if (status) {
                status.textContent = '播放器已就绪，如未自动播放请再次点击播放按钮。';
            }
        });
    }
}

function hideBrokenImages() {
    var images = document.querySelectorAll('img');

    images.forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });
    });
}
