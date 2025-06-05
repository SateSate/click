window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.circle-element-dynamic').forEach((el) => {
    const numberEl = el.querySelector('.number');
    const valueEl = el.querySelector('.value');

    const origNumber = numberEl.textContent.trim();
    const num1 = numberEl.getAttribute('data-number1');
    const num2 = numberEl.getAttribute('data-number2');

    const origValue = valueEl.textContent.trim();
    const val1 = valueEl.getAttribute('data-value1');
    const val2 = valueEl.getAttribute('data-value2');

    const tl = gsap.timeline({
      paused: true,
      repeat: -1,
      delay: 3,
      repeatDelay: 3,
    });

    tl.to(
      [numberEl, valueEl],
      {
        y: '25%',
        autoAlpha: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          numberEl.textContent = num1;
          valueEl.textContent = val1;
        },
      },
      0
    );

    tl.to(
      [numberEl, valueEl],
      {
        y: '0%',
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      },
      '-=0'
    );

    tl.to(
      [numberEl, valueEl],
      {
        y: '25%',
        autoAlpha: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          numberEl.textContent = num2;
          valueEl.textContent = val2;
        },
      },
      '+=3'
    );

    tl.to(
      [numberEl, valueEl],
      {
        y: '0%',
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      },
      '-=0'
    );

    tl.play();

    document.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          tl.pause();
        }
      });
    });
  });

  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  document.querySelectorAll('.anim-list-items').forEach((container) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 90%',
          invalidateOnResize: true,
        },
      })
      .from(container.querySelectorAll('.anim-item'), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power1.out',
      });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-filters-set').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;

      if (getComputedStyle(panel).display === 'block') {
        panel.style.display = 'none';
        btn.classList.remove('is-open');
      } else {
        panel.style.display = 'block';
        btn.classList.add('is-open');
      }
    });
  });

  let thresholdPx = window.innerWidth > 1024 ? 230 : 140;
  let offsetY = 0;

  function recalcOffset() {
    const grid = document.getElementById('gridFilterContainer');
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    offsetY = window.pageYOffset + rect.top - thresholdPx;
  }

  recalcOffset();
  window.addEventListener('resize', () => {
    thresholdPx = window.innerWidth > 1024 ? 230 : 140;
    recalcOffset();
  });

  document
    .querySelectorAll('.btn-filters-container .form-check-label')
    .forEach((label) => {
      label.addEventListener('click', () => {
        const filterSelector = label.getAttribute('data-filter');
        if (!filterSelector) return;

        const filterContainer = document.querySelector(
          '.btn-filters-container'
        );
        const filterButton = document.querySelector('.btn-filters-set');
        const grid = document.getElementById('gridFilterContainer');
        const projectSection = document.querySelector('.projects-over');
        const footer = document.querySelector('footer');

        // 1) add “loading” classes:
        [filterContainer, filterButton].forEach(
          (el) => el && el.classList.add('disable')
        );
        if (grid) grid.classList.add('is-loading');
        if (projectSection) {
          const next1 = projectSection.nextElementSibling;
          if (next1) next1.classList.add('is-loading-next');
          const next2 = next1 ? next1.nextElementSibling : null;
          if (next2) next2.classList.add('is-loading-next');
        }
        if (footer) footer.classList.add('is-loading-next');

        // 2) Scroll to the grid (if No.scrollTo exists), otherwise immediately do the filter:
        const doFilterSequence = () => {
          // a) hide all items
          document
            .querySelectorAll('#gridFilterContainer .grid-item')
            .forEach((item) => {
              item.style.display = 'none';
            });
          // b) show only the matching ones
          document
            .querySelectorAll(`#gridFilterContainer ${filterSelector}`)
            .forEach((item) => {
              item.style.display = '';
            });
          // c) if you’re using Locomotive Scroll + ScrollTrigger proxy “Ho”, refresh it:
          if (typeof Ho !== 'undefined' && typeof Ho.refresh === 'function') {
            Ho.addEventListener('refresh', () => No.update());
            Ho.refresh();
          }

          // d) remove “loading” classes
          if (grid) grid.classList.remove('is-loading');
          [filterContainer, filterButton].forEach(
            (el) => el && el.classList.remove('disable')
          );
          if (projectSection) {
            const next1 = projectSection.nextElementSibling;
            const next2 = next1 ? next1.nextElementSibling : null;
            if (next1) next1.classList.remove('is-loading-next');
            if (next2) next2.classList.remove('is-loading-next');
          }
          if (footer) footer.classList.remove('is-loading-next');

          // e) update the closed‐button text & collapse the panel
          const selectedText = label.textContent.trim();
          const closedValueEl = document.querySelector(
            '.btn-filters-set .value'
          );
          if (closedValueEl) closedValueEl.textContent = selectedText;
          if (filterContainer) filterContainer.style.display = 'none';
          if (filterButton) filterButton.classList.remove('is-open');
        };

        if (typeof No !== 'undefined' && typeof No.scrollTo === 'function') {
          // if you do have No.scrollTo, animate the scroll first
          No.scrollTo(offsetY, {
            duration: 150,
            callback: () => {
              setTimeout(doFilterSequence, 300);
            },
          });
        } else {
          // otherwise just run it right away
          setTimeout(doFilterSequence, 300);
        }
      });
    });
});

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.circle-element.hidden-icon-over, .hidden-over-element')
    .forEach((el) => {
      el.setAttribute('data-state', '0');

      el.addEventListener('mouseenter', () => {
        if (el.getAttribute('data-state') !== '0') return;
        el.setAttribute('data-state', '1');
        el.classList.add('is-hover');

        const beforeEl = el.querySelector('.before');
        const iconEl = el.querySelector('.icon');
        const arrowEls = el.querySelectorAll(
          '#external #arrow-line, #external #arrow_el'
        );

        const tl = gsap.timeline();
        tl.to(
          beforeEl,
          {
            x: '0%',
            duration: 0.4,
            ease: 'power1.out',
          },
          0
        )
          .to(
            iconEl,
            {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              ease: 'power1.out',
            },
            0.1
          )
          .to(
            arrowEls,
            {
              y: -16,
              x: 16,
              transformOrigin: 'top right',
              ease: 'power1.in',
              duration: 0.15,
            },
            0.3
          )
          .set(arrowEls, {
            y: 20,
            x: -20,
          })
          .to(
            arrowEls,
            {
              y: 0,
              x: 0,
              transformOrigin: 'top right',
              ease: 'power1.out',
              duration: 0.15,
              onComplete: () => {
                el.setAttribute('data-state', '0');
                el.classList.remove('is-hover');
              },
            },
            0.5
          );
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('is-hover');

        const beforeEl = el.querySelector('.before');
        const iconEl = el.querySelector('.icon');

        const tl2 = gsap.timeline();
        tl2
          .to(
            iconEl,
            {
              opacity: 0,
              scale: 0.8,
              duration: 0.4,
              ease: 'expo.out',
            },
            0
          )
          .to(
            beforeEl,
            {
              x: '-100%',
              duration: 0.6,
              ease: 'expo.out',
            },
            0.2
          );
      });
    });
});

document.addEventListener('DOMContentLoaded', function () {
  // Make sure GSAP and ScrollTrigger are loaded
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);

    // Define mobile breakpoint
    const MOBILE_BREAKPOINT = 1024;

    // Set up the horizontal scroll for the awards section
    const awardsSection = document.querySelector('.bg-dark.bg-gradient-sides');
    const pinWrap = awardsSection
      ? awardsSection.querySelector('.pin-wrap')
      : null;
    const boxes = pinWrap ? pinWrap.querySelectorAll('.box') : [];
    const footer = document.querySelector('.site-footer');

    // Check if we're on desktop
    const isDesktop = () => window.innerWidth >= MOBILE_BREAKPOINT;

    // Function to set up horizontal scrolling (desktop only)
    function setupHorizontalScroll() {
      // Skip setup on mobile
      if (!isDesktop() || !awardsSection || !pinWrap || boxes.length === 0) {
        // Ensure footer is visible on mobile
        if (footer) {
          gsap.set(footer, { opacity: 1, y: 0, clearProps: 'all' });
        }

        // Add class to handle mobile layout
        if (awardsSection) {
          awardsSection.classList.add('mobile-view');
        }
        return;
      }

      // Desktop implementation begins
      // First, hide the footer initially
      gsap.set(footer, {
        opacity: 0,
        y: 50,
      });

      // Remove mobile view class if it exists
      if (awardsSection) {
        awardsSection.classList.remove('mobile-view');
      }

      // Calculate the width that needs to be scrolled horizontally
      let totalScrollWidth = 0;
      let viewportWidth = window.innerWidth;

      // Function to calculate total scroll width
      function calculateScrollWidth() {
        viewportWidth = window.innerWidth;
        let boxesWidth = 0;

        // Calculate total width of all boxes plus gaps
        boxes.forEach((box) => {
          const boxStyle = window.getComputedStyle(box);
          const boxWidth = box.offsetWidth;
          const marginRight = parseInt(boxStyle.marginRight || 0);
          boxesWidth += boxWidth + marginRight;
        });

        // Subtract the viewport width since the first box is already visible
        totalScrollWidth = boxesWidth - viewportWidth + 200; // Add buffer

        return Math.max(totalScrollWidth, 100); // Ensure minimum scroll distance
      }

      // Initial calculation
      calculateScrollWidth();

      // Create the ScrollTrigger for horizontal scrolling
      const horizontalScroll = gsap.timeline({
        scrollTrigger: {
          trigger: awardsSection,
          start: 'top top',
          end: `+=${calculateScrollWidth()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => calculateScrollWidth(),
        },
      });

      // Add the animation to move boxes horizontally
      horizontalScroll.to(pinWrap, {
        x: () => -totalScrollWidth,
        ease: 'none',
      });

      // Create a separate ScrollTrigger for the footer animation
      ScrollTrigger.create({
        trigger: awardsSection,
        start: 'bottom bottom-=100',
        endTrigger: 'html',
        onEnter: () => {
          gsap.to(footer, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'transform',
          });
        },
        // This handles going back up
        onLeaveBack: () => {
          gsap.to(footer, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: 'power2.in',
          });
        },
      });

      // Enhance the visual experience by animating the boxes as they enter viewport
      boxes.forEach((box) => {
        gsap.from(box, {
          opacity: 0.5,
          scale: 0.95,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: box,
            start: 'center right',
            end: 'center center',
            containerAnimation: horizontalScroll,
            scrub: true,
          },
        });
      });
    }

    // Initial setup
    setupHorizontalScroll();

    // Handle window resize - destroy and recreate animation if switching between mobile/desktop
    let lastScreenMode = isDesktop();
    window.addEventListener('resize', () => {
      // Check if screen mode changed (mobile <-> desktop)
      if (lastScreenMode !== isDesktop()) {
        lastScreenMode = isDesktop();

        // Kill all ScrollTrigger instances related to the section
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.trigger === awardsSection) st.kill();
        });

        // Reset any transforms on the pin-wrap
        if (pinWrap) {
          gsap.set(pinWrap, { clearProps: 'all' });
        }

        // Re-setup the horizontal scroll
        setupHorizontalScroll();
      }
    });
  }

  // Box hover effects (keep this part)
  const caseBoxes = document.querySelectorAll('.box.box-case');
  caseBoxes.forEach((box) => {
    box.addEventListener('mouseenter', function () {
      this.classList.add('is-hover');
    });

    box.addEventListener('mouseleave', function () {
      this.classList.remove('is-hover');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 1) Animate headings/lines:
  //    “section:not(.noanim) h5, section:not(.noanim) h4, section:not(.noanim) .anim-lines”
  const headingsAndLines = Array.from(
    document.querySelectorAll(
      'section:not(.noanim) h5, section:not(.noanim) h4, section:not(.noanim) .anim-lines'
    )
  );

  if (headingsAndLines.length) {
    headingsAndLines.forEach((el) => {
      // Use the SplitText plugin to split into lines
      const split = new SplitText(el, {
        type: 'words,lines',
        linesClass: 'title-line',
      });

      // Make the element visible immediately
      gsap.set(el, { visibility: 'visible' });

      // Animate each line from y=80% → 0, fade‐in, staggered
      gsap.from(split.lines, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          invalidateOnRefresh: true,
        },
        duration: 0.85,
        yPercent: 80,
        autoAlpha: 0,
        ease: 'power4.out',
        stagger: 0.1,
      });
    });
  }

  // 2) Animate counters (“.anim-letters” inside sections that are not .noanim)
  const animLetters = Array.from(
    document.querySelectorAll('section:not(.noanim) .anim-letters')
  );

  if (animLetters.length) {
    animLetters.forEach((el) => {
      // Read data-number and use half as the "from" start value
      const fullValue = parseFloat(el.getAttribute('data-number'));
      const startValue = fullValue / 2;

      // Immediately make the element visible
      gsap.set(el, { visibility: 'visible' });

      // Animate its innerText from startValue → fullValue, snapping to integers
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          invalidateOnRefresh: true,
        },
        innerText: startValue,
        snap: { innerText: 1 },
        autoAlpha: 0,
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.1,
        yPercent: 130,
        // After the tween completes, explicitly set innerText to the exact fullValue
        onComplete() {
          el.innerText = fullValue;
        },
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class "anim-image"
    const animImages = document.querySelectorAll('.anim-image');

    // For each .anim-image, create a GSAP timeline that animates on scroll
    animImages.forEach((el) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 100%',
            invalidateOnResize: true,
          },
        })
        .from(el, {
          y: 40,
          autoAlpha: 0,
          ease: 'expo.out',
          duration: 0.7,
        });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Ensure ScrollTrigger is registered
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Select all elements with class "anim-list"
  const animLists = document.querySelectorAll('.anim-list');
  if (animLists.length === 0) return;

  animLists.forEach((container) => {
    // Create a GSAP timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 90%',
        invalidateOnResize: true,
      },
    });

    // Animate the first <p> inside this container
    const paragraph = container.querySelector('p');
    if (paragraph) {
      tl.from(
        paragraph,
        {
          yPercent: 100,
          autoAlpha: 0,
          ease: 'expo.out',
          duration: 0.7,
        },
        '0'
      );
    }

    // Animate all <li> inside a <ul> within this container
    const listItems = container.querySelectorAll('ul li');
    if (listItems.length > 0) {
      tl.from(
        listItems,
        {
          yPercent: 100,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.7,
        },
        '-=0.7'
      );
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Register ScrollTrigger plugin
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Find all elements with class "running-text"
  const runningTextEls = document.querySelectorAll('.running-text');
  if (runningTextEls.length === 0) return;

  runningTextEls.forEach((el) => {
    // Find the inner element
    const inner = el.querySelector('.running-text-inner');
    if (!inner) return;

    // Compute how far the inner text should scroll
    // outerWidth ≃ offsetWidth (content + padding + border)
    const innerWidth = inner.offsetWidth;
    const containerWidth = el.offsetWidth;
    const distanceToScroll = innerWidth - containerWidth;

    // Create a GSAP timeline with ScrollTrigger
    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 100%',
          end: 'bottom 0%',
          scrub: true,
          invalidateOnResize: true,
        },
      })
      .to(inner, {
        x: -distanceToScroll,
        ease: 'power0.inOut',
      });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Ensure GSAP & ScrollTrigger are available
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Select all elements with the "anim-element" class
  const animEls = document.querySelectorAll('.anim-element');
  animEls.forEach((el) => {
    // Create a timeline that triggers when "el" scrolls into view
    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 100%',
          invalidateOnResize: true,
        },
      })
      .from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 0.5,
      });
  });
});

function Ko() {
  // Only run on desktop widths
  if (window.innerWidth > 1025) {
    const links = document.querySelectorAll('.floating-link');
    links.forEach((link) => {
      link.addEventListener('mousemove', () => {
        const parent = link.parentElement;
        if (parent) parent.classList.add('is-hover');
      });
      link.addEventListener('mouseleave', () => {
        const parent = link.parentElement;
        if (parent) parent.classList.remove('is-hover');
      });
      link.addEventListener('click', () => {
        const parent = link.parentElement;
        if (parent) parent.classList.remove('is-hover');
      });
    });
  }
}

// Call it on DOMContentLoaded (or whenever appropriate)
document.addEventListener('DOMContentLoaded', Ko);

document.addEventListener('DOMContentLoaded', function () {
  // Make sure ScrollTrigger is registered
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // === 1. “.sticky-over” animations ===
  const stickyOvers = document.querySelectorAll('.sticky-over');
  if (stickyOvers.length > 0) {
    stickyOvers.forEach((el) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: true,
            invalidateOnResize: true,
          },
        })
        .from(el.querySelector('.custom-scroll-el-scroller'), {
          height: 0,
          transformOrigin: 'top',
          ease: 'power0.inOut',
        });
    });
  }

  // === 2. “.scroll-sticky-element” fade-out on scroll ===
  const scrollStickyElems = document.querySelectorAll('.scroll-sticky-element');
  if (scrollStickyElems.length > 0) {
    scrollStickyElems.forEach((el) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: true,
            invalidateOnResize: true,
          },
        })
        .to(el, {
          autoAlpha: 0,
        });
    });
  }

  // === 3. “.process-item” entry animations ===
  const processItems = document.querySelectorAll('.process-item');
  if (processItems.length > 0) {
    processItems.forEach((item) => {
      // 3a: Animate the sticky side elements
      const sideChildren = item.querySelectorAll(
        '.process-side .process-side-sticky > *'
      );
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 50%',
          end: 'bottom 50%',
          invalidateOnResize: true,
        },
      });

      if (sideChildren.length > 0) {
        tl.from(
          sideChildren,
          {
            x: -30,
            autoAlpha: 0,
            transformOrigin: 'top',
            ease: 'power4.out',
            stagger: 0.1,
            duration: 0.6,
          },
          0
        );
      }

      // 3b: Animate the main content block
      const contentEl = item.querySelector('.process-content');
      if (contentEl) {
        tl.from(
          contentEl,
          {
            y: 30,
            autoAlpha: 0,
            transformOrigin: 'top',
            ease: 'power1.out',
            duration: 0.4,
          },
          '=-0.6'
        );
      }
    });

    // 3c: Animate every child inside “.process-content”
    const processContentChildren = document.querySelectorAll(
      '.process-item .process-content *'
    );
    processContentChildren.forEach((el) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: '120% 85%',
            scrub: true,
            invalidateOnResize: true,
          },
        })
        .from(el, {
          y: 10,
          autoAlpha: 0,
          transformOrigin: 'top',
          scale: 0.98,
          ease: 'power1.inOut',
          duration: 0.6,
        });
    });
  }
});

// ==================================================================================
// “Connect / Social-Feed” – only run on desktop (>= 1024px), pin .grid-connection …
// ==================================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 2) This function will initialize the pin/animation if viewport >= 1024px
  function initGridConnection() {
    // Bail out if screen is narrower than 1024px
    if (window.innerWidth < 1024) {
      return;
    }

    // Select every wrapper (in case you have more than one on the page):
    document.querySelectorAll('.grid-connection-over').forEach((wrapper) => {
      // Select the inner grid we want to pin/animate:
      const grid = wrapper.querySelector('.grid-connection');
      if (!wrapper || !grid) {
        // If either wrapper or grid is missing, do nothing
        return;
      }

      // Force a DOM reflow/read to ensure GSAP can measure heights correctly:
      void wrapper.offsetHeight;

      // Helper: return the wrapper’s full height (we will pin for exactly that distance)
      const getPinEndDistance = () => wrapper.offsetHeight;

      // Build a single timeline + ScrollTrigger that:
      //  • pins the .grid-connection element
      //  • scrolls for exactly wrapper.offsetHeight px
      //  • plays all the “.from(…)” tweens in parallel
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 5%', // adjust as needed; “5%” means “when wrapper’s top hits 5% down from top of viewport”
          end: () => `+=${getPinEndDistance()}`,
          pin: grid,
          scrub: true,
          invalidateOnResize: true,
          // (You can add markers: true for debugging if you like)
          // markers: true,
        },
      });

      // -----------------------------
      //  Sequence of “.from(…)” tweens
      //  (all of these overlap by “-=1” so they run roughly together)
      // -----------------------------
      tl.from(
        wrapper.querySelector('.item4'),
        { xPercent: 100, yPercent: -100, duration: 1 },
        0
      );

      tl.from(
        wrapper.querySelector('.item6'),
        {
          xPercent: -150,
          yPercent: -90,
          rotation: -10,
          scale: 0.9,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item7'),
        {
          xPercent: 150,
          yPercent: -190,
          rotation: 10,
          scale: 0.9,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item9'),
        {
          xPercent: -200,
          yPercent: -165,
          rotation: -20,
          scale: 0.8,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item8'),
        {
          xPercent: 100,
          yPercent: -165,
          rotation: 20,
          scale: 0.8,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item1'),
        { xPercent: 240, yPercent: 60, rotation: 30, scale: 0.7, duration: 1 },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item3'),
        {
          xPercent: -240,
          yPercent: 60,
          rotation: -30,
          scale: 0.7,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.item2'),
        {
          xPercent: -140,
          yPercent: 60,
          rotation: -30,
          scale: 0.7,
          duration: 1,
        },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.itemText'),
        { scale: 0, autoAlpha: 0, duration: 1 },
        '-=1'
      );

      tl.from(
        wrapper.querySelector('.grid-connection'),
        { columnGap: '0px', rowGap: '0px', duration: 1 },
        '-=1'
      );

      // Animate every .image-box in parallel
      wrapper.querySelectorAll('.grid-connection .image-box').forEach((box) => {
        tl.from(
          box,
          { boxShadow: '0px 0px 40px #111', scale: 1.3, duration: 1 },
          '-=1'
        );
      });

      // Finally fade in each .label
      wrapper.querySelectorAll('.grid-item .label').forEach((labelEl) => {
        tl.from(
          labelEl,
          { autoAlpha: 0, duration: 1, ease: 'power0.inOut' },
          '-=1'
        );
      });
    });
  }

  // Run it once on load:
  initGridConnection();

  // Re‐initialize or kill triggers on resize:
  window.addEventListener('resize', () => {
    // If the new width is < 1024, kill any ScrollTriggers that pinned “.grid-connection”
    if (window.innerWidth < 1024) {
      ScrollTrigger.getAll().forEach((st) => {
        // st.trigger is the element that this trigger was attached to.
        // If that trigger matches “.grid-connection” (the pinned element), kill it.
        if (st.trigger && st.trigger.matches('.grid-connection')) {
          st.kill();
        }
      });
    } else {
      // Otherwise (re‐entered desktop), re‐create
      // A small timeout ensures the layout has settled
      setTimeout(() => {
        initGridConnection();
        ScrollTrigger.refresh();
      }, 100);
    }
  });
});
