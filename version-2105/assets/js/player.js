(function () {
  function initMoviePlayer(source) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var shell = document.querySelector('[data-player-shell]');
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !shell || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function start() {
      attachSource();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    shell.addEventListener('click', function (event) {
      if (!loaded && event.target === shell) {
        start();
      }
    });
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
