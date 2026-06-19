(function () {
    function initMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", isOpen);
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function initActiveNav() {
        var current = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(function (link) {
            var href = link.getAttribute("href") || "";
            var target = href.replace("./", "");
            if (target === current) {
                link.classList.add("is-active");
            }
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll(".filter-scope").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var category = scope.querySelector("[data-category-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

            if (!input && !category) {
                return;
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var selected = normalize(category ? category.value : "");

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.category
                    ].join(" "));
                    var cardCategory = normalize(card.dataset.category);
                    var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                    var categoryMatched = !selected || cardCategory === selected;
                    card.classList.toggle("is-hidden", !(keywordMatched && categoryMatched));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            if (category) {
                category.addEventListener("change", apply);
            }

            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-overlay");
            var stream = shell.getAttribute("data-stream");
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function attachStream() {
                if (video.dataset.ready === "true") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (shell.classList.contains("is-playing")) {
                            video.play().catch(function () {});
                        }
                    });
                } else {
                    video.src = stream;
                }

                video.dataset.ready = "true";
            }

            function play() {
                shell.classList.add("is-playing");
                attachStream();
                video.play().catch(function () {});
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    shell.classList.remove("is-playing");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initActiveNav();
        initHero();
        initFilters();
        initPlayers();
    });
}());
