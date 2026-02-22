document.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('human-flying-knot-video');
  var toggleContainer = document.querySelector('.task-video-toggle');

  if (!video || !toggleContainer) {
    return;
  }

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

  if (!source || buttons.length === 0) {
    return;
  }

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
});
