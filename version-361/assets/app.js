(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        var open = mobilePanel.hasAttribute('hidden');
        if (open) {
          mobilePanel.removeAttribute('hidden');
        } else {
          mobilePanel.setAttribute('hidden', '');
        }
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-slide') || 0));
          schedule();
        });
      });

      schedule();
    }

    var filterInput = document.querySelector('.movie-filter');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.select-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = normalize(filterInput ? filterInput.value : '');
      var values = selects.map(function (select) {
        return {
          key: select.getAttribute('data-filter-key'),
          value: normalize(select.value)
        };
      });
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesSelects = values.every(function (item) {
          if (!item.value) {
            return true;
          }
          return normalize(card.getAttribute('data-' + item.key)).indexOf(item.value) !== -1;
        });
        var isVisible = matchesQuery && matchesSelects;
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener('input', applyFilters);
      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });
      applyFilters();
    }
  });
}());
