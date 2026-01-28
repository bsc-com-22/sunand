import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                const { error } = await supabase.from('contact_messages').insert([data]);
                if (error) throw error;

                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Sorry, there was an error sending your message. Please try again later.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Newsletter Form Handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const emailInput = newsletterForm.querySelector('input[type="email"]');

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = '...';
            submitBtn.disabled = true;

            const email = emailInput.value;

            try {
                const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
                if (error) {
                    if (error.code === '23505') {
                        alert('You are already subscribed to our newsletter!');
                    } else {
                        throw error;
                    }
                } else {
                    alert('Thank you for subscribing to our newsletter!');
                    newsletterForm.reset();
                }
            } catch (error) {
                console.error('Error subscribing:', error);
                alert('Sorry, there was an error subscribing. Please try again later.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
