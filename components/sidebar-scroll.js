/**
 * Sidebar nav for project detail pages.
**/

// --- 1. Build the links ---
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