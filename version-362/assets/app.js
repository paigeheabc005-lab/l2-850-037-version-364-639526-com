(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = selectAll('[data-hero-slide]');
  var dots = selectAll('[data-hero-dot]');
  var heroIndex = 0;
  function showHero(index) {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      var input = heroSearch.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  }

  function matchYear(value, year) {
    if (!value || value === '全部年份') return true;
    var n = parseInt(year, 10);
    if (value === '2010-2019') return n >= 2010 && n <= 2019;
    if (value === '2000-2009') return n >= 2000 && n <= 2009;
    if (value === '更早') return n < 2000;
    return String(year) === value;
  }

  function setupFilters() {
    var list = document.querySelector('[data-card-list]');
    if (!list) return;
    var cards = selectAll('[data-title]', list);
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var result = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    if (input && q) input.value = q;

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var text = title + ' ' + region + ' ' + genre + ' ' + type.toLowerCase() + ' ' + year;
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) ok = false;
        if (typeValue && typeValue !== '全部类型' && type.indexOf(typeValue) === -1) ok = false;
        if (!matchYear(yearValue, year)) ok = false;
        card.classList.toggle('hidden-card', !ok);
        if (ok) visible += 1;
      });
      if (result) result.textContent = '当前匹配 ' + visible + ' 部影片';
    }

    [input, typeSelect, yearSelect].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
    apply();
  }
  setupFilters();

  function setupPlayer() {
    var configEl = document.getElementById('movie-player-config');
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.player-overlay');
    if (!configEl || !video || !overlay) return;
    var config = {};
    try {
      config = JSON.parse(configEl.textContent || '{}');
    } catch (err) {
      config = {};
    }
    if (config.poster) video.setAttribute('poster', config.poster);
    var attached = false;
    var hls = null;

    function attachSource() {
      if (attached || !config.src) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(config.src);
        hls.attachMedia(video);
      } else {
        video.src = config.src;
      }
    }

    function startPlayer() {
      attachSource();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
    }

    overlay.addEventListener('click', startPlayer);
    video.addEventListener('click', function () {
      if (video.paused) startPlayer();
    });
    window.addEventListener('pagehide', function () {
      if (hls && hls.destroy) hls.destroy();
    });
  }
  setupPlayer();
})();
