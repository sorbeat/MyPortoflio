/**
 * Site animations (GSAP 3 + ScrollTrigger + SplitText + ScrambleText)
 * Home page, All Work (showcase) page and project case-study pages.
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
    if (!window.gsap || !window.ScrollTrigger) {
        showHero();
        return;
    }

    // SplitText (every page) and ScrambleText (home page only) are optional —
    // each effect checks its plugin is there before running.
    const HAS_SPLIT    = !!window.SplitText;
    const HAS_SCRAMBLE = !!window.ScrambleTextPlugin;
    gsap.registerPlugin(ScrollTrigger);
    if (HAS_SPLIT)    gsap.registerPlugin(SplitText);
    if (HAS_SCRAMBLE) gsap.registerPlugin(ScrambleTextPlugin);

    // Wait for web fonts so text is split at its real size (max 1.5s so we never hang).
    const fontsReady = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 1500))
    ]);

    const NO_MOTION = '(prefers-reduced-motion: reduce)';
    const MOTION    = '(prefers-reduced-motion: no-preference)';

    // Plain fade/slide reveals start straight away (no font wait), so content
    // that's already on screen doesn't flash visible → hidden → visible.
    // Hero intro starts immediately — scrambling doesn't need fonts measured,
    // and starting early gets the headline on screen sooner (better LCP).
    gsap.matchMedia().add(NO_MOTION, () => { showHero(); });
    gsap.matchMedia().add(MOTION, () => {
        heroIntro();
        sectionReveals();
        projectCards();
        hobbyPhotos();
        showcaseReveals();
        projectPageReveals();
    });

    // Text-splitting effects wait for fonts so lines/letters are measured correctly.
    fontsReady.then(() => {
        if (!HAS_SPLIT) return;
        gsap.matchMedia().add(MOTION, () => {
            aboutText();
            footerHeading();
        });
    });


    /* Shared helper — fade + rise a list of elements as they scroll into view,
       a few at a time (ScrollTrigger.batch groups ones that enter together). */
    function revealOnScroll(elements, { y = 40, stagger = 0.1, start = 'top 90%' } = {}) {
        const items = gsap.utils.toArray(elements);
        if (!items.length) return;

        // opacity (not autoAlpha/visibility) so hidden items stay reachable with Tab
        gsap.set(items, { opacity: 0, y });
        ScrollTrigger.batch(items, {
            start,
            onEnter: (batch) => gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger,
                ease: 'power3.out',
                overwrite: true,
                // hand transform back to CSS so hover lifts keep working
                onComplete: () => gsap.set(batch, { clearProps: 'transform,transition' })
            })
        });

        // Keyboard users: if focus lands inside something not revealed yet, show it now
        document.addEventListener('focusin', (e) => {
            const item = items.find((el) => el.contains(e.target));
            if (item && +getComputedStyle(item).opacity < 1) {
                gsap.to(item, { opacity: 1, y: 0, duration: 0.3, overwrite: true,
                    onComplete: () => gsap.set(item, { clearProps: 'transform,transition' }) });
            }
        });
    }


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

        if (title && !HAS_SCRAMBLE) {
            tl.from(title, { autoAlpha: 0, y: 30, duration: 0.9 });
        } else if (title) {
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

        if (tagline && !HAS_SCRAMBLE) {
            tl.to(tagline, { autoAlpha: 1, duration: 0.6 }, '-=0.4');
        } else if (tagline) {
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
                opacity: 0,
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
            opacity: 0,
            y: 60,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: grid, start: 'top 80%' },
            onComplete: () => gsap.set(cards, { clearProps: 'transform,transition,opacity' })
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


    /* ---------------------------------------------------------
       7. ALL WORK (/projects/) — header on load, cards on scroll
       --------------------------------------------------------- */
    function showcaseReveals() {
        const header = document.querySelector('.work-hero');
        if (!header) return;

        // Header: title, intro and filter bar rise in on load
        gsap.from(['.work-title', '.work-intro', '.work-filter-bar'], {
            autoAlpha: 0,
            y: 30,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform'
        });

        // Cards: the CSS hover lift also uses transform, so switch its
        // transition off until each card has finished revealing.
        const cards = gsap.utils.toArray('.work-featured, .work-card');
        gsap.set(cards, { transition: 'none' });
        revealOnScroll(cards, { y: 60, stagger: 0.12, start: 'top 92%' });

        // The filter chips hide/show cards (display: none), which moves
        // everything below — recalculate trigger positions after a filter.
        document.querySelectorAll('.chip').forEach((chip) => {
            chip.addEventListener('click', () => ScrollTrigger.refresh());
        });
    }


    /* ---------------------------------------------------------
       8. PROJECT / CASE STUDY PAGES — hero on load, content on scroll
       --------------------------------------------------------- */
    function projectPageReveals() {
        const hero = document.querySelector('.project-hero');
        if (!hero) return;

        // Hero: name, tags, image and meta rise in on load
        gsap.from(hero.querySelectorAll('.project-name, .project-tags, .project-hero-img, .project-meta'), {
            autoAlpha: 0,
            y: 30,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform'
        });

        // Everything in the case study that should reveal on scroll.
        // Cards inside grids are listed individually so they stagger.
        const REVEAL = [
            '.dark-block',
            '.content-heading', '.content-heading-dk', '.content-title', '.content-subtitle',
            '.content-body', '.section-body', '.content-caption',
            '.content-img', '.size-img', '.btn--centre',
            '.info-card', '.step-card', '.stat-card',
            '.persona-label', '.persona-card',
            '.empathy-caption-row', '.empathy-quadrant',
            '.finding-row', '.priority-row',
            '.palette-group-label', '.swatch', '.type-scale-row'
            // (IA diagram left out — it's collapsed/hidden on mobile)
        ].join(', ');

        // Skip anything inside another revealed block (e.g. the heading inside
        // an info-card) so nothing animates twice.
        const items = gsap.utils.toArray(document.querySelectorAll('.project-content ' + REVEAL.split(', ').join(', .project-content ')))
            .filter((el) => !el.parentElement.closest(REVEAL));

        revealOnScroll(items, { y: 40, stagger: 0.08 });
    }
})();
