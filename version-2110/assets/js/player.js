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
    var video = document.querySelector("[data-movie-player]");
    var button = document.querySelector("[data-play-button]");
    var source = video ? video.getAttribute("data-src") : "";
    var hlsInstance = null;
    var playWhenReady = false;

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (button && video.paused) {
        button.classList.remove("is-hidden");
      }
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showOverlay();
        });
      }
    }

    function prepareSource() {
      if (video.getAttribute("data-ready") === "true") {
        return;
      }

      video.setAttribute("data-ready", "true");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playWhenReady) {
            playVideo();
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.insertAdjacentHTML("afterend", '<p class="player-message">当前浏览器不支持 HLS 播放。</p>');
      }
    }

    prepareSource();

    if (button) {
      button.addEventListener("click", function () {
        playWhenReady = true;
        prepareSource();
        playVideo();
      });
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
