document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 12) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile Menu
    const menuBtn = document.querySelector('[aria-label="Open menu"]');
    const closeBtn = document.querySelector('[aria-label="Close menu"]');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = mobileMenu?.querySelector('.bg-foreground\\/40');

    const openMenu = () => {
        mobileMenu?.classList.remove('hidden');
        document.documentElement.classList.add('menu-open');
    };

    const closeMenu = () => {
        mobileMenu?.classList.add('hidden');
        document.documentElement.classList.remove('menu-open');
    };

    menuBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    menuOverlay?.addEventListener('click', closeMenu);

    // Reveal Animations using Intersection Observer
    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));

    // Counter Animation
    const counters = document.querySelectorAll('.stat-counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.value);
                const duration = 2000;
                const startTime = performance.now();
                const element = entry.target;

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const currentCount = Math.floor(progress * target);

                    element.textContent = currentCount.toLocaleString() + (element.dataset.suffix || '');

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    }
                };

                requestAnimationFrame(updateCount);
                counterObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
});
