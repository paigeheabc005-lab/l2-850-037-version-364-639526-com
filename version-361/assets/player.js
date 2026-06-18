import { H as Hls } from './hls.js';

export function createPlayer(source, videoId, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var prepared = false;

  if (!video || !source) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    }

    prepared = true;
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    video.setAttribute('controls', 'controls');
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.detail-btn')).forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });
  });

  video.addEventListener('click', function () {
    if (!prepared || video.paused) {
      play();
    }
  });
}
