/**
 * Sidebar nav for project detail pages.
**/
const ACTIVE_ZONE_TOP = 0.2; // 20% down the viewport//
//  --- 1. Build the links ---
const sections = document.querySelectorAll('.content-section');
const sidebar = document.querySelector('.sidebar-links');

sections.forEach(section => {
    const label = section.dataset.navLabel || section.id;
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = label;
    sidebar.appendChild(link);
});

// --- 2. Scroll-spy: highlight the active link ---
const links = document.querySelectorAll('.sidebar-links a');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            links.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.sidebar-links a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(section => observer.observe(section));
    const progressFill = document.querySelector('.sidebar-progress-fill');
    const content = document.querySelector('.project-content');

function updateProgress() {

if (!progressFill || !content) return;
    const anchor = window.innerHeight * ACTIVE_ZONE_TOP;
    const contentTop = content.getBoundingClientRect().top + window.scrollY;
    const contentBottom = contentTop + content.offsetHeight;
    const readingLine = window.scrollY + anchor;
    const progress = (readingLine - contentTop) / (contentBottom - contentTop);
    progressFill.style.height = `${Math.min(100, Math.max(0, progress * 100))}%`;
}

// requestAnimationFrame throttling: scroll can fire dozens of times per
// second, but the screen only repaints ~60 times a second — this makes
// sure we never do more work than the browser can actually show.
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateProgress();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

window.addEventListener('resize', updateProgress);
updateProgress();