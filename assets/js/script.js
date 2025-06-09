document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('menu-button');
  const menuBlock = document.querySelector('.b-menu');

  if (menuButton && menuBlock) {
    menuButton.addEventListener('click', function (e) {
      e.preventDefault();

      menuBlock.classList.toggle('active');

      document.body.style.overflow = menuBlock.classList.contains('active')
        ? 'hidden'
        : 'auto';
    });
  }

  document.addEventListener('click', function (e) {
    if (
      menuBlock.classList.contains('active') &&
      !menuBlock.contains(e.target) &&
      !menuButton.contains(e.target)
    ) {
      menuBlock.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  const navImage = document.querySelector('.nav-image');

  if (menuButton && navImage) {
    menuButton.addEventListener('mouseenter', function () {
      navImage.classList.add('active');
    });

    menuButton.addEventListener('mouseleave', function () {
      navImage.classList.remove('active');
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  gsap.registerPlugin(ScrollTrigger);

  const serviceCards = document.querySelectorAll('.servCard');

  serviceCards.forEach((card, index) => {
    gsap.set(card, {
      scale: 1,
      filter: 'brightness(1)',
      transformOrigin: 'center center',
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 40%',
        end: 'bottom top',
        scrub: 0.5,
      },
      scale: 0.9645,
      filter: 'brightness(0.7871)',
      ease: 'power1.inOut',
    });
  });

  gsap.from('.servCardW', {
    scrollTrigger: {
      trigger: '.servWrap',
      start: 'top 80%',
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.3,
    ease: 'power2.out',
  });

  const lineBlock = document.querySelector('.line-block');

  if (lineBlock) {
    gsap.set(lineBlock, {
      width: '20%',
    });

    gsap.to(lineBlock, {
      scrollTrigger: {
        trigger: lineBlock,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none none',
        once: true,
      },
      width: '100%',
      duration: 5,
      ease: 'power2.out',
    });
  }

  const videoWrappers = document.querySelectorAll(
    '.Video_wrapper___YKwG, .Work_wrapper__F_40c'
  );

  videoWrappers.forEach((wrapper) => {
    // When mouse enters the wrapper
    wrapper.addEventListener('mouseenter', function () {
      // Set data-hovered attribute to true
      this.setAttribute('data-hovered', 'true');

      // Get the hover video (second video element or first video if in Work_wrapper)
      const hoverVideo = this.classList.contains('Work_wrapper__F_40c')
        ? this.querySelector('.Work_video__oEzx1')
        : this.querySelector('video:last-child');

      if (hoverVideo) {
        // Reset video to beginning
        hoverVideo.currentTime = 0;

        // Wait for opacity transition to complete before playing
        setTimeout(() => {
          hoverVideo.play().catch((e) => console.error('Video play error:', e));
        }, 400); // Match the transition duration in CSS
      }
    });

    // When mouse leaves the wrapper
    wrapper.addEventListener('mouseleave', function () {
      // Set data-hovered attribute to false
      this.setAttribute('data-hovered', 'false');

      // Get the hover video
      const hoverVideo = this.classList.contains('Work_wrapper__F_40c')
        ? this.querySelector('.Work_video__oEzx1')
        : this.querySelector('video:last-child');

      if (hoverVideo) {
        // Pause the hover video when mouse leaves
        hoverVideo.pause();
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // Check if ScrollTrigger has been loaded
  if (typeof ScrollTrigger !== 'undefined') {
    // Create the parallax effect for the content above footer
    gsap.registerPlugin(ScrollTrigger);

    // Get the footer element
    const footer = document.querySelector('.footer-sticky');
    const workSection = document.querySelector('.work.border-top');

    // Create a parallax effect by moving the work section slightly faster than scroll
    if (footer && workSection) {
      gsap.to(workSection, {
        ease: 'none',
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom', // start when the top of the footer hits the bottom of the viewport
          end: 'top top', // end when the top of the footer reaches the top of the viewport
          scrub: true, // smooth animation that ties to the scrollbar position
        },
      });
    }
  }
});
