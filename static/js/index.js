document.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('human-flying-knot-video');
  var toggleContainer = document.querySelector('.task-video-toggle');

  if (video && toggleContainer) {
    var source = video.querySelector('source');
    var buttons = Array.from(toggleContainer.querySelectorAll('button[data-video-src]'));
    var realtimeButton = buttons.find(function (button) {
      return /realtime/i.test(button.getAttribute('data-video-src') || '');
    }) || buttons[0];
    var slowmoButton = buttons.find(function (button) {
      return /slomo/i.test(button.getAttribute('data-video-src') || '');
    }) || buttons[1];
    var realtimeSrc = realtimeButton ? realtimeButton.getAttribute('data-video-src') : '';
    var slowmoSrc = slowmoButton ? slowmoButton.getAttribute('data-video-src') : '';
    var realtimeLoopCount = 0;
    var previousTime = 0;

    if (source && buttons.length > 0) {
      function setActiveButton(activeButton) {
        buttons.forEach(function (button) {
          var isActive = button === activeButton;
          button.classList.toggle('is-link', isActive);
          button.classList.toggle('is-light', !isActive);
          button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      }

      function switchVideo(nextSrc, activeButton) {
        if (!nextSrc) {
          return;
        }

        if (source.getAttribute('src') === nextSrc) {
          if (activeButton) {
            setActiveButton(activeButton);
          }
          return;
        }

        var shouldResumePlayback = !video.paused || video.autoplay;
        source.setAttribute('src', nextSrc);
        video.load();

        if (shouldResumePlayback) {
          video.play().catch(function () {
            return;
          });
        }

        if (activeButton) {
          setActiveButton(activeButton);
        }

        previousTime = 0;
        if (nextSrc === realtimeSrc) {
          realtimeLoopCount = 0;
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var nextSrc = button.getAttribute('data-video-src');
          switchVideo(nextSrc, button);
        });
      });

      video.addEventListener('timeupdate', function () {
        if (source.getAttribute('src') !== realtimeSrc || !slowmoButton || !slowmoSrc) {
          previousTime = video.currentTime;
          return;
        }

        if (document.visibilityState && document.visibilityState !== 'visible') {
          previousTime = video.currentTime;
          return;
        }

        if (previousTime > 0.5 && video.currentTime < 0.25) {
          realtimeLoopCount += 1;

          if (realtimeLoopCount >= 3) {
            switchVideo(slowmoSrc, slowmoButton);
            return;
          }
        }

        previousTime = video.currentTime;
      });
    }
  }

  var ropeCarousel = document.getElementById('rope-results-carousel');
  if (!ropeCarousel) {
    return;
  }

  function clearRopeVideoControls() {
    Array.from(ropeCarousel.querySelectorAll('video')).forEach(function (ropeVideo) {
      ropeVideo.removeAttribute('controls');
    });
  }

  clearRopeVideoControls();

  if (window.bulmaCarousel && typeof window.bulmaCarousel.attach === 'function') {
    window.bulmaCarousel.attach('#rope-results-carousel', {
      slidesToShow: 3,
      slidesToScroll: 1,
      loop: true,
      infinite: true,
      navigation: true,
      pagination: true,
      autoplay: false,
      navigationSwipe: true,
      breakpoints: [
        {
          changePoint: 640,
          slidesToShow: 1,
          slidesToScroll: 1
        },
        {
          changePoint: 1024,
          slidesToShow: 2,
          slidesToScroll: 1
        }
      ]
    });
  }

  clearRopeVideoControls();

  function setHoverControls(event, show) {
    if (!event.target || !event.target.closest) {
      return;
    }

    var activeVideo = event.target.closest('video');
    if (!activeVideo || !ropeCarousel.contains(activeVideo)) {
      return;
    }

    if (event.relatedTarget && activeVideo.contains(event.relatedTarget)) {
      return;
    }

    if (show) {
      activeVideo.setAttribute('controls', '');
    } else {
      activeVideo.removeAttribute('controls');
    }
  }

  ropeCarousel.addEventListener('mouseover', function (event) {
    setHoverControls(event, true);
  });

  ropeCarousel.addEventListener('mouseout', function (event) {
    setHoverControls(event, false);
  });

  ropeCarousel.addEventListener('focusin', function (event) {
    setHoverControls(event, true);
  });

  ropeCarousel.addEventListener('focusout', function (event) {
    setHoverControls(event, false);
  });
});
