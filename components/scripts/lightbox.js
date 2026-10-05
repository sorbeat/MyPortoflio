document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img.content-img, .ui-tile img');
    if (!images.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged image');
    overlay.hidden = true;
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close image">✕</button><img src="" alt="">';
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector('img');

    const close = () => {
        overlay.hidden = true;
        overlayImg.src = '';
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus(); // return focus to the image that opened it
    };

    const closeBtn = overlay.querySelector('.lightbox-close');
    let lastFocused = null;

    const open = (img) => {
        lastFocused = img;
        overlayImg.src = img.currentSrc || img.src;
        overlayImg.alt = img.alt;
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    images.forEach((img) => {
        // Keyboard access: images can be focused and opened with Enter / Space
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
        img.addEventListener('click', () => open(img));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(img);
            }
        });
    });

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) close();
    });
});