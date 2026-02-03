import { supabase } from './js/supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate Links
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Hamburger Animation
            hamburger.classList.toggle('toggle');
        });
    }

    // Close button logic
    const closeBtn = document.querySelector('.mobile-close-btn'); // Note: This selects one, but since we have one menu it's fine. 
    // However, since the close btn is dynamically added or static in HTML, wait.
    // It will be static in HTML.

    // We need to use event delegation or select it here.
    // Since I'm adding it to HTML, we can select it.
    // BUT since I am adding it as an LI inside .nav-links, verify selector.
    // I haven't added it to HTML yet. But I will.

    // Actually, let's use event delegation on navLinks just in case, or just select it safely.
    // Better to select inside the loop if I had multiple, but here specific selection is fine.

    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-close-btn')) {
                navLinks.classList.remove('active');
                if (hamburger) hamburger.classList.remove('toggle');
                links.forEach(link => {
                    link.style.animation = '';
                });
            }
        });
    }

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            links.forEach(link => {
                link.style.animation = '';
            });
        });
    });

    // Smooth Scrolling for Anchor Links with Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const messageData = Object.fromEntries(formData.entries());

            const { error } = await supabase.from('contact_messages').insert([messageData]);

            if (error) {
                alert('Error sending message: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            } else {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Newsletter Subscription
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn = newsletterForm.querySelector('button');

            if (!emailInput.value) return;

            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '...';

            const { error } = await supabase.from('newsletter_subscribers').insert([{ email: emailInput.value }]);

            if (error) {
                if (error.code === '23505') {
                    alert('You are already subscribed!');
                } else {
                    alert('Error subscribing: ' + error.message);
                }
            } else {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    let animated = false;
    const section = document.querySelector('.impact-metrics');

    window.addEventListener('scroll', () => {
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const pageY = window.pageYOffset;
        const windowHeight = window.innerHeight;

        if (pageY > (sectionTop - windowHeight + sectionHeight / 2) && !animated) {
            animateCounters();
            animated = true;
        }
    });

    // Donation Logic
    const currencyBtns = document.querySelectorAll('.currency-btn');
    const donateNowBtn = document.getElementById('donate-now-btn');
    let selectedCurrency = 'MWK'; // Default to MWK

    if (currencyBtns.length > 0) {
        currencyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currencyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCurrency = btn.getAttribute('data-currency');
            });
        });
    }

    if (donateNowBtn) {
        donateNowBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const paychanguLinks = {
                'USD': (window.siteSettings && window.siteSettings.donation_link_usd) || 'https://give.paychangu.com/dc-8nu2ur',
                'MWK': (window.siteSettings && window.siteSettings.donation_link_mwk) || 'https://give.paychangu.com/dc-CMO2D4'
            };

            const redirectUrl = paychanguLinks[selectedCurrency];

            if (redirectUrl) {
                window.open(redirectUrl, '_blank');
            }
        });
    }
});
