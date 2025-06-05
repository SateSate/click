document.addEventListener('DOMContentLoaded', function () {
  // === 1. Grab all the key elements ===
  var videoModal = document.querySelector('.video-modal');
  var videoPlayer = document.getElementById('videoPlayer');
  // (FIXED) just grab the single .video-set-in container
  var videoSetIn = document.querySelector('.video-set-in');
  var videoModalOverlay = document.querySelector('.video-modal-overlay');
  var playAgainBtn = document.querySelector('.video-modal .play-video');
  var closeButtons = document.querySelectorAll('.close-video-modal');

  // Utility: add/remove a class on all matching selectors
  function addClassAll(selector, cls) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add(cls);
    });
  }
  function removeClassAll(selector, cls) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.remove(cls);
    });
  }

  // === 2. “e” function: once the modal fully expands, configure time & controls ===
  function activateVideoControls() {
    // (a) Mute the videoPlayer so autoplay is allowed
    videoPlayer.muted = true;

    // (b) Display total duration (mm:ss)
    var totalMinutes = Math.floor(videoPlayer.duration / 60);
    var totalSeconds = Math.floor(videoPlayer.duration - totalMinutes * 60);
    document.querySelector('.video-time .duration').textContent =
      totalMinutes + ':' + (totalSeconds < 10 ? '0' : '') + totalSeconds;

    // (c) As the video plays, update the “current” timestamp
    videoPlayer.addEventListener(
      'timeupdate',
      function () {
        var curMin = Math.floor(videoPlayer.currentTime / 60);
        var curSec = Math.floor(videoPlayer.currentTime % 60);
        var secPad = (curSec < 10 ? '0' : '') + curSec;
        document.querySelector('.video-time .current').textContent =
          curMin + ':' + secPad;
      },
      false
    );

    // (d) Show the custom UI elements and start playback
    addClassAll('.video-ui-el', 'is-active');
    addClassAll('.video-time', 'is-active');
    videoPlayer.play();

    // (e) When the video ENDS, hide UI and show “Play again”
    videoPlayer.addEventListener('ended', function onEnd() {
      removeClassAll('.video-ui-el', 'is-active');
      removeClassAll('.video-time', 'is-active');

      gsap
        .timeline()
        .set('.video-modal .video-controls', { visibility: 'visible' })
        .fromTo(
          '.video-modal .video-controls',
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: 'power1.out', duration: 0.25 }
        );

      // Clicking “Play again” hides controls and restarts the video
      playAgainBtn.addEventListener('click', function onPlayAgain() {
        addClassAll('.video-ui-el', 'is-active');
        addClassAll('.video-time', 'is-active');

        gsap.timeline().to('.video-modal .video-controls', {
          autoAlpha: 0,
          ease: 'power1.out',
          duration: 0.25,
        });
        videoPlayer.play();

        // Remove listener so it doesn’t stack up if clicked multiple times
        playAgainBtn.removeEventListener('click', onPlayAgain);
      });

      // Clean up this ‘ended’ listener if you like:
      videoPlayer.removeEventListener('ended', onEnd);
    });
  }

  // === 3. “n” function: close/reset the modal ===
  function closeVideoModal() {
    videoModal.setAttribute('data-open', '0');
    videoModal.removeAttribute('style');
    videoPlayer.removeAttribute('style');
    videoPlayer.src = '';
    document.querySelectorAll('.play-pause-video').forEach(function (btn) {
      btn.classList.remove('is-play');
      btn.setAttribute('data-state', '0');
    });
    if (typeof No !== 'undefined' && No.start) {
      No.start();
    }
  }

  // === 4. “i” function: bind click‐handlers to every [data-video] thumbnail ===
  function initVideoThumbnails() {
    var screenWidth = window.innerWidth;
    var thumbnails = document.querySelectorAll('[data-video]');

    thumbnails.forEach(function (thumbnail) {
      var videoURL = thumbnail.getAttribute('data-video');

      if (screenWidth > 1025) {
        // DESKTOP: animate from thumbnail → modal center
        thumbnail.addEventListener('click', function (evt) {
          evt.preventDefault();

          // 1) Get thumbnail’s position & size
          var thumbRect = thumbnail.getBoundingClientRect();
          var thumbTop = thumbRect.top + window.scrollY;
          var thumbLeft = thumbRect.left + window.scrollX;
          var thumbW = thumbRect.width;
          var thumbH = thumbRect.height;

          // 2) Get “video-set-in” (center container) position & size
          var setRect = videoSetIn.getBoundingClientRect();
          var setTop = setRect.top + window.scrollY;
          var setLeft = setRect.left + window.scrollX;
          var setW = setRect.width;
          var setH = setRect.height;

          // 3) Pause any scroll library
          if (typeof No !== 'undefined' && No.stop) {
            No.stop();
          }

          // 4) Set the video src and mark modal as “open”
          videoPlayer.src = videoURL;
          if (videoModal.getAttribute('data-open') === '0') {
            videoModal.setAttribute('data-open', '1');
          }

          // 5) Immediately force the overlay to become visible
          videoModalOverlay.style.opacity = '1';
          videoModalOverlay.style.visibility = 'inherit';

          // 6) GSAP animation: fade in modal at thumbnail → expand to center → show UI
          gsap
            .timeline()
            // 6a: place .video-modal exactly over the thumbnail (invisible)
            .set(
              videoModal,
              {
                top: thumbTop,
                left: thumbLeft,
                width: thumbW,
                height: thumbH,
                autoAlpha: 0,
              },
              '+=0'
            )
            // 6b: fade in the modal shell
            .to(
              videoModal,
              {
                autoAlpha: 1,
                ease: 'power1.out',
                duration: 0.3,
              },
              '+=0'
            )
            // 6c: expand the modal to the “video-set-in” area
            .to(
              videoModal,
              {
                top: setTop,
                left: setLeft,
                width: setW,
                height: setH,
                ease: 'power1.inOut',
                duration: 1,
              },
              '+=0'
            )
            // 6d: fade in close‐btn + UI + progress bar, then call activateVideoControls()
            .fromTo(
              '.video-modal-overlay .btn-close, .video-ui-el, .video-time, .video-progress',
              { autoAlpha: 0, scale: 0.8 },
              {
                autoAlpha: 1,
                scale: 1,
                ease: 'power1.out',
                duration: 0.25,
                stagger: 0.1,
                onStart: activateVideoControls,
              },
              '+=0'
            );
        });
      } else {
        // MOBILE: simply make the <a> point to the raw video URL (browser‐native playback)
        thumbnail.setAttribute('href', videoURL);
        thumbnail.addEventListener('click', function () {
          // no fancy modal on mobile
        });
      }
    });
  }

  // === 5. Bind the play/pause, fullscreen, mute/unmute, and close buttons ===
  function bindControls() {
    // (a) Play / Pause toggle
    document.querySelectorAll('.play-pause-video').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var state = btn.getAttribute('data-state'); // "0" or "1"
        if (state === '0') {
          btn.setAttribute('data-state', '1');
          btn.classList.add('is-play');
          videoPlayer.pause();
        } else {
          btn.setAttribute('data-state', '0');
          btn.classList.remove('is-play');
          videoPlayer.play();
        }
      });
    });

    // (b) Fullscreen
    document.querySelectorAll('.fullscreen-video').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen();
        }
      });
    });

    // (c) Mute / Unmute
    document.querySelectorAll('.sound-video').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var s = btn.getAttribute('data-state');
        if (s === '0') {
          btn.setAttribute('data-state', '1');
          btn.classList.add('muted');
          videoPlayer.muted = true;
        } else {
          btn.setAttribute('data-state', '0');
          btn.classList.remove('muted');
          videoPlayer.muted = false;
        }
      });
    });

    // (d) Close the modal (any element with .close-video-modal)
    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        gsap
          .timeline()
          .to(
            '.video-modal-overlay .btn-close, .video-ui-el, .video-time',
            {
              scale: 0.8,
              autoAlpha: 0,
              ease: 'power1.out',
              duration: 0.25,
            },
            '+=0'
          )
          .to(
            '.video-progress',
            { autoAlpha: 0, ease: 'power1.out', duration: 0.25 },
            '+=0.25'
          )
          .to(
            videoModal,
            {
              autoAlpha: 0,
              ease: 'power1.out',
              duration: 0.35,
              onComplete: closeVideoModal,
            },
            '+=0'
          )
          .to(
            '.video-modal .video-controls',
            { autoAlpha: 0, ease: 'power1.out', duration: 0.25 },
            '+=0'
          )
          .to(
            videoModalOverlay,
            { autoAlpha: 0, ease: 'power1.out', duration: 0.25 },
            '+=0.25'
          );
      });
    });
  }

  // === 6. On scroll (Locomotive “No”), re‐initialize thumbnails exactly as in the original jQuery code ===
  if (typeof No !== 'undefined' && No.on) {
    No.on('scroll', function () {
      initVideoThumbnails();
    });
  }

  // === 7. Kick everything off ===
  initVideoThumbnails();
  bindControls();

  // === 8. (OPTIONAL) Autoplay each inline <video data-inline-media> so they don’t just show a loader ===
  document.querySelectorAll('video[data-inline-media]').forEach(function (v) {
    v.muted = true;
    v.loop = true;
    // Attempt to play now that it’s muted
    v.play().catch(function () {
      // If the browser refuses, you might need to wait until it’s in‐view or user interaction.
    });
  });
});
