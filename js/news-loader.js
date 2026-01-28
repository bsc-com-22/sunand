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
}

async function loadSingleNews(id) {
    const { data: item, error } = await supabase.from('news')
        .select('*')
        .eq('id', id)
        .single();

    const container = document.querySelector('.container');
    if (container && item) {
        const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Update page title
        document.title = `${item.title} - Sun & Soil News`;

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
            </div>
        `;
    }
}
