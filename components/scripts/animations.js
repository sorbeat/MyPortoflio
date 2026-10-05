/**
 * Home page animations (GSAP 3 + ScrollTrigger + SplitText + ScrambleText)
 *
 * Load order (all `defer`, so they run in this order after the HTML is parsed):
 *   gsap.min.js → ScrollTrigger.min.js → SplitText.min.js → ScrambleTextPlugin.min.js → animations.js
 *
 * Every block checks its elements exist first, so this file is safe to load
 * on any page — sections that aren't there are simply skipped.
 *
 * Accessibility:
 *   - prefers-reduced-motion: reduce → no animation at all, content just shows.
 *   - Scrambled headings keep their real text in an aria-label while animating,
 *     so screen readers never read the random characters.
 *   - SplitText adds aria-labels to split elements automatically.
 */
(function () {
    const root = document.documentElement;
    const showHero = () => root.classList.remove('js-anim');

    // If GSAP didn't load (offline, blocked script), show everything and stop.
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !window.ScrambleTextPlugin) {
        showHero();
        return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

    // Wait for web fonts so text is split at its real size (max 1.5s so we never hang).
    const fontsReady = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 1500))
    ]);

    fontsReady.then(() => {
        const mm = gsap.matchMedia();

        // Reduced motion: no animation, just make sure the hero is visible.
        mm.add('(prefers-reduced-motion: reduce)', () => {
            showHero();
        });

        mm.add('(prefers-reduced-motion: no-preference)', () => {
            heroIntro();
            aboutText();
            sectionReveals();
            projectCards();
            hobbyPhotos();
            footerHeading();
        });
    });


    /* ---------------------------------------------------------
       1. HERO — scramble/decode headline + tagline, then the rest
       --------------------------------------------------------- */
    function heroIntro() {
        const hero = document.querySelector('.hero');
        if (!hero) return showHero();

        const title   = hero.querySelector('h1');
        const tagline = hero.querySelector('.hero-tagline');
        const buttons = hero.querySelectorAll('.hero-buttons a');
        const card    = hero.querySelector('.hero-card');

        const titleText   = title ? title.textContent.trim() : '';
        const taglineText = tagline ? tagline.textContent.trim() : '';
        const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&*+=<>/?';

        // Real text for screen readers while the visible text is scrambled.
        if (title)   title.setAttribute('aria-label', titleText);
        if (tagline) tagline.setAttribute('aria-label', taglineText);

        // Starting states (set before un-hiding, so nothing flashes).
        if (title)   gsap.set(title,   { autoAlpha: 1 });
        if (tagline) gsap.set(tagline, { autoAlpha: 0 });
        gsap.set(buttons, { autoAlpha: 0, y: 20 });
        if (card) gsap.set(card, { autoAlpha: 0, y: 30, scale: 0.96 });
        showHero();

        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => {
                if (title)   title.removeAttribute('aria-label');
                if (tagline) tagline.removeAttribute('aria-label');
            }
        });

        if (title) {
            tl.to(title, {
                duration: 1.6,
                scrambleText: {
                    text: titleText,
                    chars: CHARS,
                    revealDelay: 0.4, // scramble a moment before letters lock in
                    speed: 0.5
                },
                ease: 'none'
            });
        }

        if (tagline) {
            tl.set(tagline, { autoAlpha: 1 }, '-=0.6')
              .to(tagline, {
                  duration: 1.1,
                  scrambleText: {
                      text: taglineText,
                      chars: 'lowerCase',
                      revealDelay: 0.2,
                      speed: 0.6
                  },
                  ease: 'none'
              }, '<');
        }

        tl.to(buttons, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, '-=0.4');

        if (card) {
            tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, '-=0.3');
        }
    }


    /* ---------------------------------------------------------
       2. ABOUT — SplitText "chars + words + lines" effect
       Letters pop in, then each word pulses the accent blue and settles.
       Nested <strong>/<em> and emoji are kept intact by SplitText.
       Plays once when the section scrolls into view.
       --------------------------------------------------------- */
    function aboutText() {
        const text = document.querySelector('.about-body');
        if (!text) return;

        const ACCENT = getComputedStyle(root).getPropertyValue('--blue').trim() || '#4BA4F2';
        let played = false; // so a resize re-split doesn't replay it

        SplitText.create(text, {
            type: 'chars, words, lines',
            autoSplit: true, // re-split if the font size / width changes
            onSplit(self) {
                if (played) return;

                gsap.set(text, { perspective: 400 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: text,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    },
                    onStart: () => { played = true; },
                    onComplete: () => gsap.set(self.words, { clearProps: 'color,transform' })
                });

                // 1. letters scale down into place
                tl.from(self.chars, {
                    duration: 0.6,
                    autoAlpha: 0,
                    scale: 3,
                    force3D: true,
                    stagger: 0.008
                })
                // 2. each word pulses the accent colour…
                .to(self.words, {
                    duration: 0.2,
                    color: ACCENT,
                    scale: 0.9,
                    stagger: 0.04
                }, 'words')
                // 3. …and settles back
                .to(self.words, {
                    duration: 0.4,
                    color: getComputedStyle(text).color,
                    scale: 1,
                    stagger: 0.04
                }, 'words+=0.1');

                // 4. orange highlighter sweeps across the <mark> words
                const marks = text.querySelectorAll('.highlight');
                if (marks.length) {
                    tl.from(marks, {
                        backgroundSize: '0% 100%',
                        duration: 0.7,
                        ease: 'power2.inOut',
                        stagger: 0.25 // if the highlight wraps onto 2 lines
                    }, '-=0.6');
                }

                return tl;
            }
        });
    }


    /* ---------------------------------------------------------
       3. SECTION LABELS + TAGLINES — rise in
       --------------------------------------------------------- */
    function sectionReveals() {
        const items = gsap.utils.toArray('.section-label, .project-tagline');
        items.forEach((el) => {
            gsap.from(el, {
                autoAlpha: 0,
                y: 24,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
    }


    /* ---------------------------------------------------------
       4. PROJECT CARDS — fade + rise, staggered
       The cards also have a CSS hover lift on `transform`, so the CSS
       transition is switched off while GSAP runs, then handed back.
       --------------------------------------------------------- */
    function projectCards() {
        const grid = document.querySelector('.project-grid');
        if (!grid) return;
        const cards = grid.querySelectorAll('.project-card-large, .project-card-small, .project-card-seemore');
        if (!cards.length) return;

        gsap.set(cards, { transition: 'none' });
        gsap.from(cards, {
            autoAlpha: 0,
            y: 60,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: grid, start: 'top 80%' },
            onComplete: () => gsap.set(cards, { clearProps: 'transform,transition,opacity,visibility' })
        });
    }


    /* ---------------------------------------------------------
       5. HOBBY PHOTOS — clip wipe up + slight zoom-out
       --------------------------------------------------------- */
    function hobbyPhotos() {
        const grid = document.querySelector('.hobbies-grid');
        if (!grid) return;
        const tiles = grid.querySelectorAll('.hobbies-items');
        const imgs  = grid.querySelectorAll('.hobbies-items img');
        if (!tiles.length) return;

        gsap.set(imgs, { transition: 'none' }); // img has a CSS hover zoom
        const tl = gsap.timeline({
            scrollTrigger: { trigger: grid, start: 'top 80%' },
            onComplete: () => gsap.set(imgs, { clearProps: 'transform,transition' })
        });
        tl.from(tiles, {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.1,
            stagger: 0.15,
            ease: 'power4.inOut'
        }).from(imgs, {
            scale: 1.25,
            duration: 1.4,
            stagger: 0.15,
            ease: 'power3.out'
        }, 0);
    }


    /* ---------------------------------------------------------
       6. FOOTER HEADING — lines slide up from a mask
       --------------------------------------------------------- */
    function footerHeading() {
        const heading = document.querySelector('.footer-heading');
        if (!heading) return;

        SplitText.create(heading, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
                return gsap.from(self.lines, {
                    yPercent: 100,
                    duration: 1,
                    stagger: 0.1,
                    ease: 'power4.out',
                    scrollTrigger: { trigger: heading, start: 'top 90%' }
                });
            }
        });
    }
})();
