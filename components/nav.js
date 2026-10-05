/* Shared navigation
   - Injects the nav into #nav-placeholder (project + showcase pages)
   - Wires up the mobile menu toggle on any page with a <nav> (incl. index.html) */

const navPlaceholder = document.getElementById('nav-placeholder');

if (navPlaceholder) {
    navPlaceholder.innerHTML = `
    <nav>
        <a href="/index.html" class="logo">Sebastianhar</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
        </button>
        <ul class="nav-links" id="nav-links">
            <li><a href="/index.html#about">About</a></li>
            <li><a href="/projects/showcase.html">My Work</a></li>
            <li><a href="/index.html#contact" class="btn-nav">Get in Touch</a></li>
        </ul>
    </nav>
    `;
}

(function initNavToggle() {
    const nav = document.querySelector('nav');
    const toggle = nav && nav.querySelector('.nav-toggle');
    if (!toggle) return;

    const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => {
        setOpen(!nav.classList.contains('is-open'));
    });

    // Close after picking a link (e.g. same-page #about)
    nav.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    // Escape closes and returns focus to the button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            setOpen(false);
            toggle.focus();
        }
    });

    // Reset if the window grows past mobile while open
    window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
        if (e.matches) setOpen(false);
    });
})();
