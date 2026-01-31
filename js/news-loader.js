import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (newsId) {
        loadSingleNews(newsId);
    } else {
        loadAllNews();
    }
});

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
                        <a href="news.html?id=${item.id}" class="read-more">Read Full Story</a>
                    </div>
                `;
                container.appendChild(article);
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
    const { data: item, error } = await supabase.from('news')
        .select('*')
        .eq('id', id)
        .single();

    // Fetch attachments
    const { data: attachments } = await supabase.from('news_attachments')
        .select('*')
        .eq('news_id', id);

    const container = document.querySelector('.container');
    if (container && item) {
        const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Update page title
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

        container.innerHTML = `
            <div class="news-detail">
                <a href="news.html" class="back-link">← Back to News</a>
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
    }
}
