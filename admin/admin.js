import { supabase } from '../js/supabase-client.js';
import { seedPrograms } from '../js/seed-programs.js';

// Check authentication
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('user-email').textContent = user.email;
        // Check if programs exist, if not seed them
        const { count } = await supabase.from('programs').select('*', { count: 'exact', head: true });
        if (count === 0) {
            await seedPrograms();
        }

        // Log login if not already logged in this session
        if (!sessionStorage.getItem('login_logged')) {
            await logAction('Login', 'Auth', user.id);
            sessionStorage.setItem('login_logged', 'true');
        }
    }
}

// Audit Logging Helper
async function logAction(action, type, id, details = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.rpc('log_admin_action', {
            action_text: action,
            e_type: type,
            e_id: id,
            extra_details: details
        });
    } catch (err) {
        console.error('Logging failed:', err);
    }
}

// Page Structure Mapping for Visual Editor
const PAGE_STRUCTURE = {
    'index.html': [
        {
            id: 'hero',
            label: 'Top Page Image',
            description: 'The main banner at the top of the homepage.',
            fields: [
                { key: 'home_hero_title', label: 'Main Heading', type: 'text' },
                { key: 'home_hero_subtitle', label: 'Sub-heading', type: 'text' }
            ],
            hasHeroImage: true
        },
        {
            id: 'stats',
            label: 'Impact Numbers',
            description: 'Key statistics shown on the homepage.',
            isRepeatable: true,
            key: 'home_stats'
        },
        {
            id: 'challenge',
            label: 'The Challenge',
            description: 'Section explaining the problems being addressed.',
            fields: [
                { key: 'home_challenge_title', label: 'Section Title', type: 'text' },
                { key: 'home_challenge_content', label: 'Main Content', type: 'rich' }
            ]
        },
        {
            id: 'work',
            label: 'Our Model',
            description: 'Overview of the integrated delivery model.',
            fields: [
                { key: 'home_work_title', label: 'Section Title', type: 'text' },
                { key: 'home_work_subtitle', label: 'Sub-heading', type: 'text' }
            ]
        },
        {
            id: 'cta',
            label: 'Action Section',
            description: 'The final call-to-action at the bottom of the page.',
            fields: [
                { key: 'home_cta_title', label: 'Heading', type: 'text' },
                { key: 'home_cta_subtitle', label: 'Description', type: 'text' },
                { key: 'home_cta_btn1_label', label: 'Button 1 Label', type: 'text' },
                { key: 'home_cta_btn1_link', label: 'Button 1 Link', type: 'page' },
                { key: 'home_cta_btn2_label', label: 'Button 2 Label', type: 'text' },
                { key: 'home_cta_btn2_link', label: 'Button 2 Link', type: 'page' }
            ]
        }
    ],
    'about.html': [
        {
            id: 'hero',
            label: 'Top Page Image',
            description: 'The main banner at the top of the About page.',
            fields: [
                { key: 'about_hero_title', label: 'Page Title', type: 'text' },
                { key: 'about_hero_subtitle', label: 'Page Subtitle', type: 'text' }
            ],
            hasHeroImage: true
        },
        {
            id: 'story',
            label: 'Our Story',
            description: 'Detailed information about the foundation.',
            fields: [
                { key: 'about_who_we_are_title', label: 'Section Title', type: 'text' },
                { key: 'about_who_we_are_content', label: 'Main Content', type: 'rich' }
            ]
        }
    ],
    'work.html': [
        {
            id: 'hero',
            label: 'Top Page Image',
            fields: [
                { key: 'work_hero_title', label: 'Page Title', type: 'text' },
                { key: 'work_hero_subtitle', label: 'Page Subtitle', type: 'text' }
            ],
            hasHeroImage: true
        },
        {
            id: 'model',
            label: 'Our Integrated Model',
            fields: [
                { key: 'work_model_title', label: 'Section Title', type: 'text' },
                { key: 'work_model_content', label: 'Main Content', type: 'rich' }
            ]
        }
    ],
    'impact.html': [
        {
            id: 'hero',
            label: 'Top Page Image',
            fields: [
                { key: 'impact_hero_title', label: 'Page Title', type: 'text' },
                { key: 'impact_hero_subtitle', label: 'Page Subtitle', type: 'text' }
            ],
            hasHeroImage: true
        },
        {
            id: 'scaling',
            label: 'Scaling Forward',
            fields: [
                { key: 'impact_scaling_title', label: 'Section Title', type: 'text' },
                { key: 'impact_scaling_target', label: 'Target Number', type: 'text' },
                { key: 'impact_scaling_subtext', label: 'Description', type: 'text' }
            ]
        }
    ],
    'contact.html': [
        {
            id: 'hero',
            label: 'Top Page Image',
            fields: [
                { key: 'contact_hero_title', label: 'Page Title', type: 'text' },
                { key: 'contact_hero_subtitle', label: 'Page Subtitle', type: 'text' }
            ],
            hasHeroImage: true
        },
        {
            id: 'form',
            label: 'Contact Form',
            fields: [
                { key: 'contact_form_title', label: 'Form Heading', type: 'text' }
            ]
        }
    ]
};

function createRichEditor(container, initialValue) {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.style.display = 'flex';
    toolbar.style.gap = '0.5rem';
    toolbar.style.marginBottom = '1rem';
    toolbar.style.padding = '0.5rem';
    toolbar.style.background = '#f8fafc';
    toolbar.style.borderRadius = '12px';
    toolbar.style.border = '1px solid #e2e8f0';
    toolbar.innerHTML = `
        <button type="button" class="btn-icon" onclick="document.execCommand('bold', false, null)" title="Bold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
        </button>
        <button type="button" class="btn-icon" onclick="document.execCommand('italic', false, null)" title="Italic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
        </button>
        <button type="button" class="btn-icon" onclick="document.execCommand('insertUnorderedList', false, null)" title="List">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
        <button type="button" class="btn-icon" onclick="document.execCommand('createLink', false, prompt('Enter URL:'))" title="Link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>
    `;

    const editor = document.createElement('div');
    editor.className = 'rich-editor';
    editor.contentEditable = true;
    editor.innerHTML = initialValue;

    container.appendChild(toolbar);
    container.appendChild(editor);

    return editor;
}

// UI Helpers
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${type === 'success' ?
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
        </div>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setLoading(button, isLoading, originalText = 'Save') {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.innerHTML = `<span class="spinner"></span> <span>Saving...</span>`;
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        button.innerHTML = originalText;
    }
}

// Navigation handling
const navItems = document.querySelectorAll('.nav-item');
const sectionTitle = document.getElementById('section-title');
const contentArea = document.getElementById('content-area');
const sidebar = document.querySelector('.admin-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarToggle = document.getElementById('sidebar-toggle');

function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleSidebar);
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');

        // Update active state
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update title and load content
        sectionTitle.textContent = item.textContent.trim();
        loadSection(section);

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

// Logout handling
document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// Section loaders
async function loadSection(section) {
    contentArea.innerHTML = '<div class="content-card"><p>Loading ' + section + '...</p></div>';

    switch (section) {
        case 'overview':
            renderOverview();
            break;
        case 'projects':
            renderProjects();
            break;
        case 'news':
            renderNews();
            break;
        case 'team':
            renderTeam();
            break;
        case 'messages':
            renderMessages();
            break;
        case 'subscribers':
            renderSubscribers();
            break;
        case 'settings':
            renderSettings();
            break;
        case 'pages':
            renderPages();
            break;
    }
}

async function renderSettings() {
    contentArea.innerHTML = '<div class="content-card"><p>Loading settings...</p></div>';

    try {
        const { data: settings } = await supabase.from('site_settings').select('*');
        const settingsMap = {};
        if (settings) {
            settings.forEach(s => settingsMap[s.key] = s.value);
        }

        const getVal = (key) => settingsMap[key] || '';

        contentArea.innerHTML = `
            <div class="content-card">
                <div class="card-header">
                    <h3>Site Configuration & Donation Settings</h3>
                </div>
                <form id="settings-form" class="admin-form">
                    <div class="settings-grid">
                        
                        <!-- Contact Information -->
                        <div class="settings-section">
                            <h4>Contact Information</h4>
                            <div class="form-group">
                                <label>Primary Phone Number</label>
                                <input type="text" name="contact_phone" value="${getVal('contact_phone')}" placeholder="+265 999 123 456">
                            </div>
                            <div class="form-group">
                                <label>Secondary Phone Number (Optional)</label>
                                <input type="text" name="contact_phone_secondary" value="${getVal('contact_phone_secondary')}" placeholder="+265 888 123 456">
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" name="contact_email" value="${getVal('contact_email')}" placeholder="info@sunandsoil.org">
                            </div>
                            <div class="form-group">
                                <label>Physical Address</label>
                                <textarea name="contact_address" rows="2">${getVal('contact_address')}</textarea>
                            </div>
                        </div>

                        <!-- Donation Links -->
                        <div class="settings-section">
                            <h4>Donation Setup</h4>
                            <div class="form-group">
                                <label>Malawian Kwacha (MWK) Donation Link</label>
                                <input type="url" name="donation_link_mwk" value="${getVal('donation_link_mwk')}" placeholder="https://paychangu.com/...">
                                <small class="helper-text">Direct payment link for local donations.</small>
                            </div>
                            <div class="form-group">
                                <label>US Dollar (USD) Donation Link</label>
                                <input type="url" name="donation_link_usd" value="${getVal('donation_link_usd')}" placeholder="https://paypal.com/...">
                                <small class="helper-text">International payment link.</small>
                            </div>
                        </div>

                        <!-- Maps & Social -->
                        <div class="settings-section">
                            <h4>Google Map Location</h4>
                            <div class="form-group">
                                <label>Google Maps Embed Src URL</label>
                                <input type="text" name="contact_map_link" value="${getVal('contact_map_link')}" placeholder="https://www.google.com/maps/embed?...">
                                <small class="helper-text">Paste the 'src' attribute from the Google Maps Embed code.</small>
                            </div>
                        </div>

                        <div style="text-align: right;">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            setLoading(btn, true);

            const formData = new FormData(e.target);
            const updates = [];

            for (const [key, value] of formData.entries()) {
                // Upsert loading: verify if key exists, if so update, else insert
                // Actually supabase upsert works well if we have a unique constraint on key
                updates.push({ key, value });
            }

            try {
                const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });

                if (error) throw error;

                await logAction('Updated', 'Settings', 'Global');
                showToast('Settings updated successfully');
            } catch (err) {
                console.error('Error saving settings:', err);
                showToast('Failed to save settings', 'error');
            } finally {
                setLoading(btn, false, 'Save Changes');
            }
        });

    } catch (err) {
        console.error('Error loading settings:', err);
        contentArea.innerHTML = '<div class="content-card"><p class="text-error">Error loading settings.</p></div>';
    }
}

async function renderOverview() {
    contentArea.innerHTML = `
        <div class="overview-grid">
            <div class="stat-card skeleton-card skeleton"></div>
            <div class="stat-card skeleton-card skeleton"></div>
            <div class="stat-card skeleton-card skeleton"></div>
            <div class="stat-card skeleton-card skeleton"></div>
        </div>
        <div class="dashboard-row">
            <div class="content-card">
                <div class="skeleton skeleton-text" style="width: 200px; height: 24px; margin-bottom: 2rem;"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
            <div class="content-card">
                <div class="skeleton skeleton-text" style="width: 150px; height: 24px; margin-bottom: 2rem;"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `;

    try {
        // Fetch all metrics in parallel
        const [
            projects,
            news,
            messages,
            subscribers,
            auditLogs,
            storageStats
        ] = await Promise.all([
            supabase.from('projects').select('id, is_featured, created_at'),
            supabase.from('news').select('id, is_published, published_at'),
            supabase.from('contact_messages').select('id, created_at'),
            supabase.from('newsletter_subscribers').select('id, created_at'),
            supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
            getStorageStats()
        ]);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Content Metrics
        const totalProjects = projects.data?.length || 0;
        const featuredProjects = projects.data?.filter(p => p.is_featured).length || 0;
        const newsThisMonth = news.data?.filter(n => {
            const d = new Date(n.published_at);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length || 0;

        // Interaction Metrics
        const totalMessages = messages.data?.length || 0;
        const newMessages = messages.data?.filter(m => new Date(m.created_at) > thirtyDaysAgo).length || 0;
        const totalSubs = subscribers.data?.length || 0;
        const subsThisMonth = subscribers.data?.filter(s => {
            const d = new Date(s.created_at);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length || 0;

        contentArea.innerHTML = `
            <div class="overview-grid">
                <div class="stat-card" onclick="loadSection('projects')">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        Projects
                    </h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalProjects}</span>
                        <span class="stat-trend trend-up">${featuredProjects} Featured</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('news')">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        News Posts
                    </h3>
                    <div class="stat-main">
                        <span class="stat-number">${news.data?.length || 0}</span>
                        <span class="stat-trend trend-up">+${newsThisMonth} this month</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('messages')">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Messages
                    </h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalMessages}</span>
                        <span class="stat-trend ${newMessages > 0 ? 'trend-up' : ''}">${newMessages} new</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('subscribers')">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Subscribers
                    </h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalSubs}</span>
                        <span class="stat-trend trend-up">+${subsThisMonth} this month</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-row">
                <div class="content-card">
                    <div class="card-header" style="justify-content: flex-start; margin-bottom: 2rem;">
                        <h3>Recent Activity</h3>
                    </div>
                    <div class="activity-list">
                        ${auditLogs.data?.length > 0 ? auditLogs.data.map(log => `
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div class="activity-content">
                                    <div style="margin-bottom: 0.25rem;">
                                        <strong style="color: var(--primary-dark)">${log.admin_email.split('@')[0]}</strong> 
                                        <span style="color: var(--text-main)">${log.action}</span> 
                                        <span style="color: var(--text-muted)">${log.entity_type ? `on ${log.entity_type}` : ''}</span>
                                    </div>
                                    <div class="activity-time">${new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        `).join('') : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No recent activity found.</p>'}
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header" style="justify-content: flex-start; margin-bottom: 2rem;">
                        <h3>System Status</h3>
                    </div>
                    <div class="health-grid">
                        <div class="health-item">
                            <span style="font-weight: 600;">Database</span>
                            <div class="health-status status-online"></div>
                        </div>
                        <div class="health-item">
                            <span style="font-weight: 600;">Storage</span>
                            <div class="health-status status-online"></div>
                        </div>
                        <div class="health-item">
                            <span style="font-weight: 600;">Auth Service</span>
                            <div class="health-status status-online"></div>
                        </div>
                    </div>
                    <div style="margin-top: 2.5rem; padding: 1.5rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <h4 style="font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;">Media Usage</h4>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600;">Total Files</span>
                            <span>${storageStats.totalFiles}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 600;">Storage Used</span>
                            <span>${(storageStats.totalSize / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section" style="margin-top: 3rem;">
                <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Quick Insights</h2>
                <div class="overview-grid">
                    <div class="stat-card" onclick="loadSection('news')">
                        <h3>Drafts Pending</h3>
                        <div class="stat-number">${news.data?.filter(n => !n.is_published).length || 0}</div>
                    </div>
                    <div class="stat-card" onclick="loadSection('pages')">
                        <h3>Stale Pages</h3>
                        <div class="stat-number" id="stale-pages-count">0</div>
                    </div>
                </div>
            </div>
        `;

        // Check for stale pages
        const { data: stalePages } = await supabase.from('sections').select('page_id, updated_at');
        const staleCount = new Set(stalePages?.filter(s => new Date(s.updated_at) < new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000))).map(s => s.page_id)).size;
        const staleEl = document.getElementById('stale-pages-count');
        if (staleEl) staleEl.textContent = staleCount;

    } catch (err) {
        console.error('Dashboard load failed:', err);
        showToast('Failed to load dashboard metrics', 'error');
    }
}

async function getStorageStats() {
    const buckets = ['projects', 'news', 'team', 'news_attachments'];
    let totalFiles = 0;
    let totalSize = 0;

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.from(bucket).list();
        if (data) {
            totalFiles += data.length;
            data.forEach(file => {
                totalSize += file.metadata?.size || 0;
            });
        }
    }

    return { totalFiles, totalSize };
}

async function showProjectForm(id = null) {
    let project = { title: '', location: '', category: '', summary: '', beneficiaries: '', technologies: '', is_featured: false, program_id: '' };
    if (id) {
        const { data } = await supabase.from('projects').select('*').eq('id', id).single();
        project = data;
    }

    // Fetch programs for the dropdown
    const { data: programs } = await supabase.from('programs').select('*').order('name');

    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h3 style="padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem;">
                ${id ? 'Edit Project Details' : 'Add New Project'}
            </h3>
            <form id="project-form" class="admin-form">
                <div class="form-grid">
                    <!-- Main Content Column -->
                    <div class="form-main">
                        <h4 style="font-size: 0.95rem; color: var(--primary-dark); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px;">Basic Information</h4>
                        
                        <div class="form-group">
                            <label>Project Title</label>
                            <input type="text" name="title" value="${project.title}" required placeholder="e.g. Solar Irrigation in Salima" style="font-size: 1.1rem; padding: 0.8rem;">
                        </div>

                        <div class="form-group">
                            <label>Project Summary</label>
                            <textarea name="summary" rows="5" placeholder="Briefly describe the project impact, goals, and outcomes..." style="line-height: 1.6;">${project.summary || ''}</textarea>
                        </div>

                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 2rem;">
                            <h4 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-secondary);">Project Details</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="form-group">
                                    <label>Program Area</label>
                                    <select name="program_id" id="program-select" required>
                                        <option value="">Select a Program</option>
                                        ${programs ? programs.map(p => `<option value="${p.id}" data-name="${p.name}" ${project.program_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('') : ''}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" name="location" value="${project.location || ''}" placeholder="e.g. Salima, Malawi">
                                </div>
                                <div class="form-group">
                                    <label>Beneficiaries</label>
                                    <input type="text" name="beneficiaries" value="${project.beneficiaries || ''}" placeholder="e.g. 500+ Farmers">
                                </div>
                                <div class="form-group" id="tech-field-group">
                                    <label>Technology Used</label>
                                    <input type="text" name="technologies" value="${project.technologies || ''}" placeholder="e.g. Solar Pumps">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar Column -->
                    <div class="form-sidebar">
                        <div class="form-group">
                            <label>Featured Image</label>
                            <div style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                                ${project.image_url ?
            `<img src="${project.image_url}" class="preview-img" style="margin-bottom: 1rem; max-height: 200px;">` :
            '<div style="height: 150px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.9rem; border: 2px dashed #cbd5e1; border-radius: 8px; margin-bottom: 1rem;">No Image Selected</div>'
        }
                                <input type="file" id="project-image-input" accept="image/*" style="font-size: 0.85rem;">
                            </div>
                        </div>

                        <div class="form-group checkbox-group" style="background: #fff; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm);">
                            <input type="checkbox" name="is_featured" id="is_featured" ${project.is_featured ? 'checked' : ''} style="width: 1.2rem; height: 1.2rem;">
                            <label for="is_featured" style="margin-bottom: 0; cursor: pointer; user-select: none;">
                                <span style="display: block; font-weight: 600; color: var(--primary-dark);">Featured Project</span>
                                <span style="display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 400;">Display prominently on home</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn" style="background: #f1f5f9; color: #64748b;" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save Project
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const programSelect = document.getElementById('program-select');
    const techGroup = document.getElementById('tech-field-group');

    const updateTechVisibility = () => {
        const selectedOption = programSelect.options[programSelect.selectedIndex];
        const programName = selectedOption ? selectedOption.getAttribute('data-name') : '';

        const showTech = programName && (
            programName.includes('Irrigation') ||
            programName.includes('Climate-smart')
        );

        techGroup.style.display = showTech ? 'block' : 'none';
    };

    programSelect.addEventListener('change', updateTechVisibility);
    updateTechVisibility();

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            const projectData = Object.fromEntries(formData.entries());
            projectData.is_featured = formData.has('is_featured');

            const imageFile = document.getElementById('project-image-input').files[0];
            if (imageFile) {
                const imageUrl = await uploadImage('projects', imageFile);
                if (imageUrl) projectData.image_url = imageUrl;
            }

            if (id) {
                await supabase.from('projects').update(projectData).eq('id', id);
                await logAction('Updated', 'Project', id, { title: projectData.title });
                showToast('Project updated successfully');
            } else {
                const { data } = await supabase.from('projects').insert([projectData]).select();
                if (data) await logAction('Created', 'Project', data[0].id, { title: projectData.title });
                showToast('Project created successfully');
            }

            closeModal();
            renderProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            showToast('Error saving project', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
}

async function uploadImage(bucket, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

async function uploadDocument(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('news_attachments')
        .upload(filePath, file);

    if (uploadError) {
        alert('Error uploading document: ' + uploadError.message);
        return null;
    }

    const { data } = supabase.storage.from('news_attachments').getPublicUrl(filePath);
    return {
        url: data.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        path: filePath
    };
}

window.closeModal = () => {
    const modal = document.querySelector('.admin-modal');
    if (modal) modal.remove();
};

window.editProject = (id) => showProjectForm(id);

async function renderProjects() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*, programs(name)')
        .order('created_at', { ascending: false });

    let html = `
        <div class="content-card">
            <div class="card-header">
                <button class="btn btn-primary" id="add-project-btn">+ Add Project</button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Program</th>
                        <th>Location</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (projects && projects.length > 0) {
        projects.forEach(project => {
            html += `
                <tr>
                    <td>${project.title}</td>
                    <td>${project.programs ? project.programs.name : '<span class="status-badge status-draft">No Program</span>'}</td>
                    <td>${project.location || '-'}</td>
                    <td><span class="status-badge ${project.is_featured ? 'status-published' : 'status-draft'}">${project.is_featured ? 'Yes' : 'No'}</span></td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editProject('${project.id}')">Edit</button>
                        <button class="btn-icon btn-delete" onclick="deleteProject('${project.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5">No projects found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contentArea.innerHTML = html;
    document.getElementById('add-project-btn').addEventListener('click', () => showProjectForm());
}

async function showNewsForm(id = null) {
    let item = { title: '', excerpt: '', content: '', is_published: false, is_featured: false, published_at: new Date().toISOString().split('T')[0] };
    let attachments = [];

    if (id) {
        const { data } = await supabase.from('news').select('*').eq('id', id).single();
        item = data;

        const { data: attachData } = await supabase.from('news_attachments').select('*').eq('news_id', id);
        attachments = attachData || [];
    }

    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h3>${id ? 'Edit News Post' : 'Create News Post'}</h3>
            <form id="news-form" class="admin-form">
                <div class="form-grid">
                    <div class="form-main">
                        <div class="form-group">
                            <label>Article Title</label>
                            <input type="text" name="title" value="${item.title}" required placeholder="e.g. New Partnership for Sustainable Farming">
                        </div>
                        <div class="form-group">
                            <label>Short Excerpt</label>
                            <textarea name="excerpt" rows="3" placeholder="A brief summary for the news list...">${item.excerpt || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Full Article Content</label>
                            <div id="news-editor-container"></div>
                        </div>
                    </div>
                    <div class="form-sidebar">
                        <div class="form-group">
                            <label>Featured Image</label>
                            <input type="file" id="news-image-input" accept="image/*">
                            ${item.image_url ? `<img src="${item.image_url}" class="preview-img" style="width: 100%; height: auto; margin-top: 1rem;">` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label>Attachments</label>
                            <input type="file" id="news-docs-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" style="font-size: 0.8rem;">
                            <div id="attachments-list" class="attachments-manager">
                                ${attachments.map(a => `
                                    <div class="attachment-item" data-id="${a.id}">
                                        <span class="file-name">${a.file_name}</span>
                                        <button type="button" class="btn-remove-attach" onclick="removeAttachment('${a.id}', '${a.file_url}')">×</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group checkbox-group" style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
                            <input type="checkbox" name="is_published" id="is_published" ${item.is_published ? 'checked' : ''}>
                            <label for="is_published" style="margin-bottom: 0; cursor: pointer;">Published</label>
                        </div>
                        <div class="form-group checkbox-group" style="background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <input type="checkbox" name="is_featured" id="is_featured" ${item.is_featured ? 'checked' : ''}>
                            <label for="is_featured" style="margin-bottom: 0; cursor: pointer;">Feature on Homepage</label>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn" style="background: #f1f5f9; color: #475569;" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save Article
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const editor = createRichEditor(document.getElementById('news-editor-container'), item.content || '');

    document.getElementById('news-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            const newsData = Object.fromEntries(formData.entries());
            newsData.content = editor.innerHTML; // Capture rich text content
            newsData.is_published = formData.has('is_published');
            newsData.is_featured = formData.has('is_featured');
            if (!id) newsData.published_at = new Date().toISOString();

            const imageFile = document.getElementById('news-image-input').files[0];
            if (imageFile) {
                const imageUrl = await uploadImage('news', imageFile);
                if (imageUrl) newsData.image_url = imageUrl;
            }

            let newsId = id;
            if (id) {
                await supabase.from('news').update(newsData).eq('id', id);
                await logAction('Updated', 'News Post', id, { title: newsData.title });
            } else {
                const { data } = await supabase.from('news').insert([newsData]).select();
                newsId = data[0].id;
                await logAction('Created', 'News Post', newsId, { title: newsData.title });
            }

            // Handle Attachments
            const docFiles = document.getElementById('news-docs-input').files;
            for (let i = 0; i < docFiles.length; i++) {
                const doc = await uploadDocument(docFiles[i]);
                if (doc) {
                    await supabase.from('news_attachments').insert({
                        news_id: newsId,
                        file_name: doc.name,
                        file_url: doc.url,
                        file_type: doc.type,
                        file_size: doc.size,
                        storage_path: doc.path
                    });
                }
            }

            showToast('News post saved successfully');
            closeModal();
            renderNews();
        } catch (error) {
            console.error('Error saving news:', error);
            showToast('Error saving news post', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
}

window.removeAttachment = async (id, url) => {
    if (confirm('Remove this attachment?')) {
        // Delete from DB
        await supabase.from('news_attachments').delete().eq('id', id);
        // Note: Storage deletion could be added here if needed
        document.querySelector(`.attachment-item[data-id="${id}"]`).remove();
        showToast('Attachment removed');
    }
};

async function renderNews() {
    const { data: news } = await supabase.from('news').select('*').order('published_at', { ascending: false });

    let html = `
        <div class="content-card">
            <div class="card-header">
                <h3>News & Updates</h3>
                <button class="btn btn-primary" id="add-news-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add News Post
                </button>
            </div>
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Article Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (news && news.length > 0) {
        news.forEach(item => {
            html += `
                <tr>
                    <td style="font-weight: 600; color: var(--primary-dark)">${item.title}</td>
                    <td>${new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span class="status-badge ${item.is_published ? 'status-published' : 'status-draft'}">${item.is_published ? 'Published' : 'Draft'}</span></td>
                    <td><span class="status-badge ${item.is_featured ? 'status-published' : 'status-draft'}">${item.is_featured ? 'Yes' : 'No'}</span></td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editNews('${item.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteNews('${item.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted)">No news posts found. Click "Add News Post" to start writing.</td></tr>';
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
    document.getElementById('add-news-btn').addEventListener('click', () => showNewsForm());
}

async function showTeamForm(id = null) {
    let member = { name: '', role: '', bio: '', sort_order: 0 };
    if (id) {
        const { data } = await supabase.from('team_members').select('*').eq('id', id).single();
        member = data;
    }

    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h3 style="padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem;">
                ${id ? 'Edit Team Member' : 'Add Team Member'}
            </h3>
            <form id="team-form" class="admin-form">
                <div class="form-grid">
                    <div class="form-main">
                        <h4 style="font-size: 0.95rem; color: var(--primary-dark); margin-bottom: 1rem; text-transform: uppercase;">Profile Details</h4>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" value="${member.name}" required placeholder="e.g. John Doe">
                        </div>
                        <div class="form-group">
                            <label>Role / Position</label>
                            <input type="text" name="role" value="${member.role}" required placeholder="e.g. Executive Director">
                        </div>
                        <div class="form-group">
                            <label>Short Bio</label>
                            <textarea name="bio" rows="6" placeholder="Brief professional background..." style="line-height: 1.6;">${member.bio || ''}</textarea>
                        </div>
                    </div>

                    <div class="form-sidebar">
                        <div class="form-group">
                            <label>Profile Photo</label>
                            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                                ${member.image_url ?
            `<img src="${member.image_url}" class="preview-img" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">` :
            '<div style="width: 100px; height: 100px; background: #e2e8f0; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>'
        }
                                <input type="file" id="team-image-input" accept="image/*" style="font-size: 0.85rem; width: 100%;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Display Order</label>
                            <input type="number" name="sort_order" value="${member.sort_order}" placeholder="0">
                            <small class="helper-text">Lower numbers appear first.</small>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn" style="background: #f1f5f9; color: #64748b;" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save Member
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('team-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            const memberData = Object.fromEntries(formData.entries());

            const imageFile = document.getElementById('team-image-input').files[0];
            if (imageFile) {
                const imageUrl = await uploadImage('team', imageFile);
                if (imageUrl) memberData.image_url = imageUrl;
            }

            if (id) {
                await supabase.from('team_members').update(memberData).eq('id', id);
                await logAction('Updated', 'Team Member', id, { name: memberData.name });
            } else {
                const { data } = await supabase.from('team_members').insert([memberData]).select();
                if (data) await logAction('Created', 'Team Member', data[0].id, { name: memberData.name });
            }

            showToast('Team member saved successfully');
            closeModal();
            renderTeam();
        } catch (error) {
            console.error('Error saving team member:', error);
            showToast('Error saving team member', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
}

async function renderTeam() {
    const { data: team } = await supabase.from('team_members').select('*').order('sort_order');

    let html = `
        <div class="content-card">
            <div class="card-header">
                <h3>Team Members</h3>
                <button class="btn btn-primary" id="add-team-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Team Member
                </button>
            </div>
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (team && team.length > 0) {
        team.forEach(member => {
            html += `
                <tr>
                    <td><img src="${member.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=216825&color=fff'}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light);"></td>
                    <td style="font-weight: 600; color: var(--primary-dark)">${member.name}</td>
                    <td>${member.role}</td>
                    <td><span class="status-badge status-draft">${member.sort_order}</span></td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editTeam('${member.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteTeam('${member.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted)">No team members found. Click "Add Team Member" to start building your team.</td></tr>';
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
    document.getElementById('add-team-btn').addEventListener('click', () => showTeamForm());
}

async function renderMessages() {
    const filter = document.getElementById('message-filter')?.value || 'all';
    let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    if (filter === 'unread') query = query.eq('is_read', false);
    if (filter === 'read') query = query.eq('is_read', true);

    const { data: messages } = await query;

    let html = `
        <div class="content-card">
            <div class="card-header">
                <h3>Inquiries & Messages</h3>
                <div class="filter-group">
                    <select id="message-filter" onchange="renderMessages()" style="padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; font-family: inherit; font-weight: 600;">
                        <option value="all" ${filter === 'all' ? 'selected' : ''}>All Messages</option>
                        <option value="unread" ${filter === 'unread' ? 'selected' : ''}>Unread Only</option>
                        <option value="read" ${filter === 'read' ? 'selected' : ''}>Read Only</option>
                    </select>
                </div>
            </div>
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Sender</th>
                            <th>Subject</th>
                            <th>Received</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (messages && messages.length > 0) {
        messages.forEach(msg => {
            html += `
                <tr class="${!msg.is_read ? 'unread-row' : ''}">
                    <td><span class="status-badge ${msg.is_read ? 'status-draft' : 'status-published'}">${msg.is_read ? 'Read' : 'New'}</span></td>
                    <td>
                        <div style="font-weight: 600; color: var(--primary-dark)">${msg.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted)">${msg.email}</div>
                    </td>
                    <td>${msg.subject}</td>
                    <td>${new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="viewMessage('${msg.id}')" title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteMessage('${msg.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted)">No messages found.</td></tr>';
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
}

window.viewMessage = async (id) => {
    const { data: msg } = await supabase.from('contact_messages').select('*').eq('id', id).single();
    if (!msg) return;

    // Mark as read if unread
    if (!msg.is_read) {
        await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
        renderMessages();
    }

    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem;">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">Message from ${msg.name}</h3>
                    <p style="color: var(--text-muted); font-weight: 500;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        ${msg.email} • ${new Date(msg.created_at).toLocaleString()}
                    </p>
                </div>
                <span class="status-badge ${msg.is_read ? 'status-draft' : 'status-published'}">${msg.is_read ? 'Read' : 'New'}</span>
            </div>
            
            <div style="background: #f8fafc; padding: 2rem; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 2.5rem;">
                <h4 style="margin-bottom: 1.25rem; color: var(--primary-dark); font-size: 1.1rem;">Subject: ${msg.subject}</h4>
                <p style="white-space: pre-wrap; line-height: 1.8; color: var(--text-main); font-size: 1.05rem;">${msg.message}</p>
            </div>

            <div class="modal-actions">
                <button class="btn" style="background: #f1f5f9; color: #475569;" onclick="toggleReadStatus('${msg.id}', ${!msg.is_read})">
                    Mark as ${msg.is_read ? 'Unread' : 'Read'}
                </button>
                <button class="btn btn-primary" onclick="closeModal()">Close Message</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.toggleReadStatus = async (id, status) => {
    await supabase.from('contact_messages').update({ is_read: status }).eq('id', id);
    showToast(`Message marked as ${status ? 'read' : 'unread'}`);
    closeModal();
    renderMessages();
};

async function renderSubscribers() {
    const { data: subs } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });

    let html = `
        <div class="content-card">
            <div class="card-header">
                <h3>Newsletter Community</h3>
                <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
                    Total: ${subs?.length || 0} Subscribers
                </div>
            </div>
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Email Address</th>
                            <th>Subscription Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (subs && subs.length > 0) {
        subs.forEach(sub => {
            html += `
                <tr>
                    <td style="font-weight: 600; color: var(--primary-dark)">${sub.email}</td>
                    <td>${new Date(sub.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                    <td class="actions">
                        <button class="btn-icon btn-delete" onclick="deleteSubscriber('${sub.id}')" title="Remove Subscriber">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3" style="text-align: center; padding: 3rem; color: var(--text-muted)">No subscribers yet.</td></tr>';
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
}



// Global functions for actions (attached to window for onclick)
window.deleteProject = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) alert(error.message);
        else {
            await logAction('Deleted', 'Project', id);
            renderProjects();
        }
    }
};

window.editNews = (id) => showNewsForm(id);
window.deleteNews = async (id) => {
    if (confirm('Delete this news post?')) {
        await supabase.from('news').delete().eq('id', id);
        await logAction('Deleted', 'News Post', id);
        renderNews();
    }
};

window.editTeam = (id) => showTeamForm(id);
window.deleteTeam = async (id) => {
    if (confirm('Delete this team member?')) {
        await supabase.from('team_members').delete().eq('id', id);
        await logAction('Deleted', 'Team Member', id);
        renderTeam();
    }
};

window.deleteMessage = async (id) => {
    if (confirm('Delete this message?')) {
        await supabase.from('contact_messages').delete().eq('id', id);
        renderMessages();
    }
};

window.deleteSubscriber = async (id) => {
    if (confirm('Remove this subscriber?')) {
        await supabase.from('newsletter_subscribers').delete().eq('id', id);
        renderSubscribers();
    }
};

// Initialize
checkAuth();
loadSection('overview');

async function renderPages() {
    const { data: pages } = await supabase.from('pages').select('*').order('title');

    let html = `
    < div class="content-card" >
            <div class="card-header">
                <h3>Website Content Management</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500;">Select a page to edit its visual content and hero images.</p>
            </div>
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Page Name</th>
                            <th>URL Path</th>
                            <th>Hero Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (pages && pages.length > 0) {
        pages.forEach(page => {
            html += `
                <tr>
                    <td style="font-weight: 600; color: var(--primary-dark)">${page.title}</td>
                    <td><code>/${page.slug}</code></td>
                    <td>
                        ${page.hero_image_url ?
                    '<span class="status-badge status-published">Image Set</span>' :
                    '<span class="status-badge status-draft">No Image</span>'}
                    </td>
                    <td class="actions">
                        <button class="btn btn-primary" onclick="editPage('${page.id}')" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit Page Content
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted)">No pages found.</td></tr>';
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div >
    `;

    contentArea.innerHTML = html;
}

window.editPage = async (id) => {
    const { data: page } = await supabase.from('pages').select('*, sections(*)').eq('id', id).single();
    if (!page) return;

    const { data: allPages } = await supabase.from('pages').select('title, slug');

    const modal = document.createElement('div');
    modal.className = 'admin-modal';

    const structure = PAGE_STRUCTURE[page.slug] || [];

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h3 style="padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <span>Content Editor: <span style="color: var(--text-secondary); font-weight: 400;">${page.title}</span></span>
                <button class="btn" style="background: #f1f5f9; color: var(--primary-dark); font-size: 0.85rem; padding: 0.5rem 1rem;" onclick="window.open('../${page.slug}', '_blank')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Live Preview
                </button>
            </h3>
            
            <form id="visual-editor-form" class="admin-form">
                <div id="editor-sections-container">
                    <!-- Sections will be injected here -->
                </div>

                <div class="modal-actions" style="margin-top: 3rem;">
                    <button type="button" class="btn" style="background: #f1f5f9; color: #64748b;" onclick="closeModal()">Close Editor</button>
                    <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Save & Update Website
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const container = document.getElementById('editor-sections-container');
    const richEditors = [];
    const repeatableBlocks = [];

    // Inject Sections
    structure.forEach(group => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'content-card';
        sectionCard.style.marginBottom = '2rem';
        sectionCard.style.border = '1px solid #e2e8f0';
        sectionCard.style.boxShadow = 'none';

        sectionCard.innerHTML = `
            <div style="margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem;">
                <h4 style="font-size: 1.1rem; color: var(--primary-dark); margin-bottom: 0.25rem;">${group.label}</h4>
                ${group.description ? `<p style="color: var(--text-muted); font-size: 0.9rem;">${group.description}</p>` : ''}
            </div>
            <div class="section-fields"></div>
        `;

        const fieldsContainer = sectionCard.querySelector('.section-fields');

        if (group.hasHeroImage) {
            const heroGroup = document.createElement('div');
            heroGroup.className = 'form-group';
            heroGroup.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 250px; gap: 2rem; align-items: start;">
                    <div>
                        <label style="margin-bottom: 1rem; display: block;">Banner Image Upload</label>
                        <input type="file" id="hero-image-input" accept="image/*" class="form-control">
                        <p class="helper-text" style="margin-top: 0.5rem;">Recommended size: 1920x600px. High quality JPG or WebP.</p>
                    </div>
                    <div id="hero-preview-container" style="background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                        ${page.hero_image_url ?
                    `<img src="${page.hero_image_url}" style="width: 100%; height: 140px; object-fit: cover;">` :
                    '<div style="width: 100%; height: 140px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 500; font-size: 0.85rem;">No Image Set</div>'
                }
                    </div>
                </div>
            `;
            fieldsContainer.appendChild(heroGroup);

            heroGroup.querySelector('input').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        heroGroup.querySelector('#hero-preview-container').innerHTML = `<img src="${re.target.result}" style="width: 100%; height: 140px; object-fit: cover;">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (group.isRepeatable) {
            const section = page.sections.find(s => s.section_name === group.key);
            let stats = [];
            try {
                stats = section?.content?.stats || [];
            } catch (e) { }

            const statsList = document.createElement('div');
            statsList.className = 'stats-list';
            statsList.style.display = 'grid';
            statsList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            statsList.style.gap = '1rem';
            statsList.style.marginBottom = '1.5rem';

            const addStatBlock = (label = '', number = '') => {
                const block = document.createElement('div');
                block.className = 'stat-block';
                block.style.background = '#f8fafc';
                block.style.padding = '1rem';
                block.style.borderRadius = '8px';
                block.style.border = '1px solid #e2e8f0';
                block.style.position = 'relative';

                block.innerHTML = `
                    <button type="button" class="btn-icon" onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; color: #ef4444; padding: 0.25rem;">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="form-group" style="margin-bottom: 0.75rem;">
                        <label style="font-size: 0.75rem;">Label</label>
                        <input type="text" placeholder="e.g. Farmers" value="${label}" class="stat-label-input" style="padding: 0.5rem; font-size: 0.9rem;">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 0.75rem;">Value</label>
                        <input type="text" placeholder="e.g. 5,000" value="${number}" class="stat-number-input" style="padding: 0.5rem; font-size: 0.9rem;">
                    </div>
                `;
                statsList.appendChild(block);
            };

            stats.forEach(s => addStatBlock(s.label, s.number));

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn btn-secondary';
            addBtn.style.width = '100%';
            addBtn.style.borderStyle = 'dashed';
            addBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Impact Metric
            `;
            addBtn.onclick = () => addStatBlock();

            fieldsContainer.appendChild(statsList);
            fieldsContainer.appendChild(addBtn);

            repeatableBlocks.push({ key: group.key, container: statsList, sectionId: section?.id });
        }

        if (group.fields) {
            group.fields.forEach(field => {
                const section = page.sections.find(s => s.section_name === field.key);
                if (!section) return;

                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'form-group';
                fieldGroup.innerHTML = `<label>${field.label}</label>`;

                let content = section.content?.html || section.content || '';

                if (field.type === 'rich') {
                    const editor = createRichEditor(fieldGroup, content);
                    richEditors.push({ id: section.id, editor });
                } else if (field.type === 'page') {
                    const select = document.createElement('select');
                    select.className = 'visual-field-input';
                    select.dataset.sectionId = section.id;
                    select.innerHTML = `<option value="">Select a page...</option>` +
                        allPages.map(p => `<option value="${p.slug}" ${content === p.slug ? 'selected' : ''}>${p.title}</option>`).join('');
                    fieldGroup.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = content;
                    input.dataset.sectionId = section.id;
                    input.className = 'visual-field-input';
                    fieldGroup.appendChild(input);
                }
                fieldsContainer.appendChild(fieldGroup);
            });
        }

        container.appendChild(sectionCard);
    });

    document.getElementById('visual-editor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const heroFile = document.getElementById('hero-image-input')?.files[0];
            if (heroFile) {
                const heroUrl = await uploadImage('heroes', heroFile);
                if (heroUrl) {
                    await supabase.from('pages').update({ hero_image_url: heroUrl }).eq('id', id);
                }
            }

            const inputs = e.target.querySelectorAll('.visual-field-input');
            for (const input of inputs) {
                const sectionId = input.dataset.sectionId;
                await supabase.from('sections').update({
                    content: { html: input.value }
                }).eq('id', sectionId);
            }

            for (const item of richEditors) {
                await supabase.from('sections').update({
                    content: { html: item.editor.innerHTML }
                }).eq('id', item.id);
            }

            for (const block of repeatableBlocks) {
                const stats = [];
                block.container.querySelectorAll('.stat-block').forEach(b => {
                    stats.push({
                        label: b.querySelector('.stat-label-input').value,
                        number: b.querySelector('.stat-number-input').value
                    });
                });
                await supabase.from('sections').update({
                    content: { stats }
                }).eq('id', block.sectionId);
            }

            showToast('Page content updated successfully');
            await logAction('Updated', 'Page Content', page.title);
            closeModal();
            renderPages();
        } catch (error) {
            console.error('Error updating page:', error);
            showToast('Error updating page content', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
};


