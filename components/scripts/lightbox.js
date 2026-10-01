document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img.content-img, .ui-tile img');
    if (!images.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.hidden = true;
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close image">✕</button><img src="" alt="">';
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector('img');

    const close = () => {
        overlay.hidden = true;
        overlayImg.src = '';
        document.body.style.overflow = '';
    };

    images.forEach((img) => {
        img.addEventListener('click', () => {
            overlayImg.src = img.currentSrc || img.src;
            overlayImg.alt = img.alt;
            overlay.hidden = false;
            document.body.style.overflow = 'hidden';
        });
    });

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) close();
    });
});