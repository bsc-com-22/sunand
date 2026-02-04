import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure modal structure exists
    ensureModalExists();

    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    // Always load the background grid
    await loadAllNews();

    // If there's an ID, open the modal
    if (newsId) {
        loadSingleNews(newsId);
    }

    // Handle Back/Forward browser buttons
    window.addEventListener('popstate', (e) => {
        const newParams = new URLSearchParams(window.location.search);
        const newId = newParams.get('id');
        if (newId) {
            loadSingleNews(newId);
        } else {
            closeModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

function ensureModalExists() {
    if (!document.querySelector('.news-modal-overlay')) {
        const modalHtml = `
            <div class="news-modal-overlay">
                <div class="news-modal-container">
                    <div class="news-modal-header">
                        <div class="header-logo" style="width: 40px; opacity: 0.5;">
                            <!-- Optional logo icon or simplified header -->
                        </div>
                        <button class="news-modal-close" aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="news-modal-body">
                        <!-- Content injected here -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Bind close events
        const overlay = document.querySelector('.news-modal-overlay');
        const closeBtn = document.querySelector('.news-modal-close');

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
}

function closeModal() {
    const overlay = document.querySelector('.news-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');

        // Update URL without functionality reload
        const url = new URL(window.location);
        url.searchParams.delete('id');
        window.history.pushState({}, '', url);

        // Optional: clear content after delay
        setTimeout(() => {
            const body = overlay.querySelector('.news-modal-body');
            if (body) body.innerHTML = '';
        }, 300);
    }
}

async function loadAllNews() {
    const container = document.querySelector('.news-grid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading news...</div>';

    try {
        const { data: news, error } = await supabase.from('news')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (error) throw error;

        container.innerHTML = '';

        if (news && news.length > 0) {
            news.forEach(item => {
                const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const article = document.createElement('article');
                article.className = 'news-card';
                article.innerHTML = `
                    <div class="news-image-wrapper">
                        <div class="news-image" style="background-image: url('${item.image_url || 'assets/placeholder.png'}')"></div>
                    </div>
                    <div class="news-content">
                        <div class="news-meta">
                            <span class="news-date">${date}</span>
                            <span class="news-tag">${item.is_featured ? 'Featured' : 'Update'}</span>
                        </div>
                        <h3>${item.title}</h3>
                        <p>${item.excerpt || ''}</p>
                        <a href="news.html?id=${item.id}" class="read-more" data-id="${item.id}">Read Full Story</a>
                    </div>
                `;
                container.appendChild(article);
            });

            // Bind click events to read more buttons
            const readMoreBtns = container.querySelectorAll('.read-more');
            readMoreBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = btn.getAttribute('data-id');
                    loadSingleNews(id);
                });
            });

        } else {
            container.innerHTML = '<div class="no-results">No news articles available at the moment.</div>';
        }
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<div class="error">Error loading news. Please try again later.</div>';
    }

    // Pagination Logic
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        const newsCards = container.querySelectorAll('.news-card');
        if (newsCards.length <= 6) {
            pagination.style.display = 'none';
        } else {
            pagination.style.display = 'flex';
        }
    }
}

async function loadSingleNews(id) {
    // Show modal immediately with loading state if needed, or wait for fetch
    const overlay = document.querySelector('.news-modal-overlay');
    const modalBody = overlay.querySelector('.news-modal-body');

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('id', id);
    window.history.pushState({}, '', url);

    // Lock Scroll & Show Overlay
    document.body.classList.add('no-scroll');
    overlay.classList.add('active');

    modalBody.innerHTML = '<div class="loading">Loading story...</div>';

    const { data: item, error } = await supabase.from('news')
        .select('*')
        .eq('id', id)
        .single();

    // Fetch attachments
    const { data: attachments } = await supabase.from('news_attachments')
        .select('*')
        .eq('news_id', id);

    if (item) {
        const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        document.title = `${item.title} - Sun & Soil News`;

        let attachmentsHtml = '';
        if (attachments && attachments.length > 0) {
            attachmentsHtml = `
                <div class="news-attachments">
                    <h3>Downloads & Resources</h3>
                    <div class="attachments-grid">
                        ${attachments.map(a => {
                const size = a.file_size ? `(${(a.file_size / 1024 / 1024).toFixed(2)} MB)` : '';
                return `
                                <a href="${a.file_url}" target="_blank" class="attachment-link">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <span class="file-info">
                                        <span class="file-name">${a.file_name}</span>
                                        <span class="file-meta">${a.file_type.split('/').pop().toUpperCase()} ${size}</span>
                                    </span>
                                </a>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="news-detail">
                <div class="news-detail-header">
                    <div class="news-meta">
                        <span class="news-date">${date}</span>
                        <span class="news-tag">${item.is_featured ? 'Featured' : 'Update'}</span>
                    </div>
                    <h1>${item.title}</h1>
                </div>
                <div class="news-detail-image" style="background-image: url('${item.image_url || 'assets/placeholder.png'}')"></div>
                <div class="news-detail-content">
                    <p class="news-excerpt"><strong>${item.excerpt || ''}</strong></p>
                    <div class="full-content">${item.content || ''}</div>
                </div>
                ${attachmentsHtml}
            </div>
        `;
    } else {
        modalBody.innerHTML = '<div class="error">News article not found.</div>';
    }
}
