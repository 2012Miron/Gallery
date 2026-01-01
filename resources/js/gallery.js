document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.getElementById('gallery-container');
    if (!gallery) return;

    // Ensure images are lazy-loaded
    gallery.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    // Click-to-open lightbox
    gallery.addEventListener('click', function (e) {
        const img = e.target.closest('img');
        if (!img) return;
        e.preventDefault();

        const src = img.dataset.full || img.src;
        const caption = img.dataset.title || img.alt || '';

        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbCaption = document.getElementById('lightbox-caption');
        if (!lightbox || !lbImg) return;

        lbImg.src = src;
        lbImg.alt = img.alt || '';
        if (lbCaption) lbCaption.textContent = caption;

        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
    });

    // Close lightbox when clicking overlay or pressing Escape
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target.id === 'lightbox-img') return;
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            const lbImg = document.getElementById('lightbox-img');
            if (lbImg) lbImg.src = '';
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                lightbox.classList.remove('open');
                lightbox.setAttribute('aria-hidden', 'true');
                const lbImg = document.getElementById('lightbox-img');
                if (lbImg) lbImg.src = '';
            }
        });
    }
});