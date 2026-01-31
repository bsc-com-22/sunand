import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalSettings();
    loadImpactMetrics();
    loadFeaturedProjects();
    loadFeaturedNews();
    loadPageContent();
});

async function loadGlobalSettings() {
    const { data: settings } = await supabase.from('site_settings').select('*');
    window.siteSettings = {}; // Store for other scripts

    if (settings) {
        settings.forEach(setting => {
            window.siteSettings[setting.key] = setting.value;

            const elements = document.querySelectorAll(`[data-setting="${setting.key}"]`);
            elements.forEach(el => {
                if (el.tagName === 'A' && setting.key.includes('email')) {
                    el.href = `mailto:${setting.value}`;
                    el.textContent = setting.value;
                } else if (el.tagName === 'A' && setting.key.includes('phone')) {
                    el.href = `tel:${setting.value}`;
                    el.textContent = setting.value;
                } else if (el.tagName === 'IFRAME' || (el.tagName === 'DIV' && setting.key.includes('map'))) {
                    // Handle Map Embeds
                    if (el.tagName === 'IFRAME') el.src = setting.value;
                } else {
                    el.textContent = setting.value;
                }
            });
        });

        // Dispatch event for other scripts that depend on settings
        window.dispatchEvent(new CustomEvent('settingsLoaded', { detail: window.siteSettings }));
    }
}

async function loadImpactMetrics() {
    // This function now handles both the old site_settings stats and the new home_stats section
    const { data: stats } = await supabase.from('site_settings').select('*').filter('key', 'like', 'stat_%');
    if (stats) {
        stats.forEach(stat => {
            const el = document.getElementById(stat.key);
            if (el) {
                el.setAttribute('data-target', stat.value);
            }
        });
    }
}

async function loadFeaturedProjects() {
    const { data: projects } = await supabase.from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

    const container = document.querySelector('.projects-grid');
    if (!container) return;

    if (projects && projects.length > 0) {
        container.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-image-wrapper">
                    <div class="project-category">${project.category || 'Project'}</div>
                    <div class="project-image" style="background-image: url('${project.image_url || 'assets/placeholder.png'}')"></div>
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.summary || ''}</p>
                    <a href="projects.html?id=${project.id}" class="read-more">
                        Explore Project
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<div class="no-results">No featured projects available.</div>';
    }
}

async function loadFeaturedNews() {
    // Fetch featured news first, then fill with latest if needed
    let { data: news } = await supabase.from('news')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(3);

    // If less than 3 featured, get latest non-featured to fill
    if (!news || news.length < 3) {
        const { data: latest } = await supabase.from('news')
            .select('*')
            .eq('is_published', true)
            .eq('is_featured', false)
            .order('published_at', { ascending: false })
            .limit(3 - (news ? news.length : 0));

        if (latest) {
            news = [...(news || []), ...latest];
        }
    }

    const container = document.querySelector('.news-grid');
    if (!container) return;

    if (news && news.length > 0) {
        container.innerHTML = '';
        news.forEach(item => {
            const date = new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                    <p class="news-excerpt">${item.excerpt || ''}</p>
                    <a href="news.html?id=${item.id}" class="read-more">Read Full Story</a>
                </div>
            `;
            container.appendChild(article);
        });
    } else {
        container.innerHTML = '<div class="no-results">No news updates available.</div>';
    }
}

async function loadPageContent() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';

    // Fetch page and its sections
    const { data: page } = await supabase
        .from('pages')
        .select('*, sections(*)')
        .eq('slug', pageName)
        .single();

    if (page) {
        // Load Hero Image
        if (page.hero_image_url) {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.style.backgroundImage = `url('${page.hero_image_url}')`;
                heroSection.style.backgroundSize = 'cover';
                heroSection.style.backgroundPosition = 'center';
            }
        }

        if (page.sections) {
            page.sections.forEach(section => {
                const identifier = section.section_name;
                if (!identifier) return;

                // 1. Handle Repeatable Stats
                if (identifier === 'home_stats' && section.content?.stats) {
                    const container = document.querySelector('[data-cms-block="home_stats"]');
                    if (container) {
                        container.innerHTML = section.content.stats.map(s => `
                            <div class="metric-item">
                                <span class="counter" data-target="${s.number.replace(/[^0-9]/g, '')}">${s.number}</span>
                                <p>${s.label}</p>
                            </div>
                        `).join('');

                        // Re-trigger counter animation if script.js is already loaded
                        if (window.initCounters) window.initCounters();
                    }
                    return;
                }

                // 2. Handle Links
                const linkElements = document.querySelectorAll(`[data-cms-link="${identifier}"]`);
                linkElements.forEach(el => {
                    const link = section.content?.html || section.content || '';
                    if (link) el.href = link;
                });

                // 3. Handle Standard Blocks
                const elements = document.querySelectorAll(`[data-cms-block="${identifier}"]`);
                elements.forEach(el => {
                    let htmlContent = section.content;
                    if (htmlContent && typeof htmlContent === 'object') {
                        htmlContent = htmlContent.html || htmlContent.text || '';
                    }

                    if (el.tagName === 'A') {
                        el.textContent = htmlContent || '';
                    } else {
                        el.innerHTML = htmlContent || '';
                    }
                });
            });
        }
    }
}
