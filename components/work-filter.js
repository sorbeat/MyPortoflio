/**
 * Filter chips for the All Work page.
 *
 * Each filterable card carries data-categories, a space-separated list of
 * the category slugs it belongs to — same slugs as each chip's data-filter.
 * Clicking a chip shows only cards whose data-categories includes that
 * slug; "all" shows everything. The visible-project count is read off the
 * DOM after filtering rather than tracked separately, so it can't drift
 * out of sync with what's actually on screen.
 *
 * Runs with `defer`, so the DOM is already parsed by the time this executes.
 */
const chips = document.querySelectorAll('.chip');
const items = document.querySelectorAll('.work-item');
const countEl = document.querySelector('.work-count');

function applyFilter(filter) {
    let visible = 0;
    items.forEach((item) => {
        const cats = item.dataset.categories ? item.dataset.categories.split(' ') : [];
        const match = filter === 'all' || cats.includes(filter);
        item.style.display = match ? '' : 'none';
        if (match) visible += 1;
    });
    if (countEl) {
        countEl.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    }
}

chips.forEach((chip) => {
    chip.addEventListener('click', () => {
        chips.forEach((c) => {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        applyFilter(chip.dataset.filter);
    });
});

applyFilter('all');