(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = next;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute('data-filter-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var empty = document.querySelector(input.getAttribute('data-empty-target') || '');
      if (!scope) {
        return;
      }
      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle('hidden-card', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      });
    });
  }

  function setupSort() {
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-sort-select]'));
    selects.forEach(function (select) {
      var scope = document.querySelector(select.getAttribute('data-sort-scope'));
      if (!scope) {
        return;
      }
      select.addEventListener('change', function () {
        var mode = select.value;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        cards.sort(function (a, b) {
          if (mode === 'rating') {
            return parseFloat(b.getAttribute('data-rating') || '0') - parseFloat(a.getAttribute('data-rating') || '0');
          }
          if (mode === 'views') {
            return parseInt(b.getAttribute('data-views') || '0', 10) - parseInt(a.getAttribute('data-views') || '0', 10);
          }
          return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
        });
        cards.forEach(function (card) {
          scope.appendChild(card);
        });
      });
    });
  }

  function startPlayer(video, cover, url) {
    var loaded = video.getAttribute('data-loaded') === 'true';
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute('data-loaded', 'true');
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    if (!video || !url) {
      return;
    }
    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(video, cover, url);
      });
    }
    video.addEventListener('click', function () {
      if (video.getAttribute('data-loaded') !== 'true') {
        startPlayer(video, cover, url);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSort();
  });
})();
