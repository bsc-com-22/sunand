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
    toolbar.style.marginBottom = '0.5rem';
    toolbar.innerHTML = `
        <button type="button" class="btn-icon" onclick="document.execCommand('bold', false, null)"><b>B</b></button>
        <button type="button" class="btn-icon" onclick="document.execCommand('italic', false, null)"><i>I</i></button>
        <button type="button" class="btn-icon" onclick="document.execCommand('insertUnorderedList', false, null)">• List</button>
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
        ${type === 'success' ? '✅' : '❌'}
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
        button.innerHTML = `<span class="spinner"></span> Saving...`;
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
            storageStats,
            programs
        ] = await Promise.all([
            supabase.from('projects').select('id, is_featured, created_at, program_id'),
            supabase.from('news').select('id, is_published, published_at'),
            supabase.from('contact_messages').select('id, created_at'),
            supabase.from('newsletter_subscribers').select('id, created_at'),
            supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
            getStorageStats(),
            supabase.from('programs').select('id, name')
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
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> Projects</h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalProjects}</span>
                        <span class="stat-trend trend-up">${featuredProjects} Featured</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('news')">
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> News Posts</h3>
                    <div class="stat-main">
                        <span class="stat-number">${news.data?.length || 0}</span>
                        <span class="stat-trend trend-up">+${newsThisMonth} this month</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('messages')">
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Messages</h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalMessages}</span>
                        <span class="stat-trend ${newMessages > 0 ? 'trend-up' : ''}">${newMessages} new (30d)</span>
                    </div>
                </div>
                <div class="stat-card" onclick="loadSection('subscribers')">
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Subscribers</h3>
                    <div class="stat-main">
                        <span class="stat-number">${totalSubs}</span>
                        <span class="stat-trend trend-up">+${subsThisMonth} this month</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-row">
                <div class="content-card">
                    <div class="card-header" style="justify-content: flex-start; margin-bottom: 1.5rem;">
                        <h3>Recent Admin Activity</h3>
                    </div>
                    <div class="activity-list">
                        ${auditLogs.data?.length > 0 ? auditLogs.data.map(log => `
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div class="activity-content">
                                    <strong>${log.admin_email}</strong> ${log.action} ${log.entity_type ? `on ${log.entity_type}` : ''}
                                    <div class="activity-time">${new Date(log.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('') : '<p>No recent activity found.</p>'}
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header" style="justify-content: flex-start; margin-bottom: 1.5rem;">
                        <h3>System Health</h3>
                    </div>
                    <div class="health-grid">
                        <div class="health-item">
                            <span>CMS Status</span>
                            <div class="health-status status-online"></div>
                        </div>
                        <div class="health-item">
                            <span>Database</span>
                            <div class="health-status status-online"></div>
                        </div>
                        <div class="health-item">
                            <span>Storage</span>
                            <div class="health-status status-online"></div>
                        </div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <h4>Media Usage</h4>
                        <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
                            Total Files: ${storageStats.totalFiles}<br>
                            Estimated Size: ${(storageStats.totalSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h2>Quick Actions</h2>
                <div class="overview-grid">
                    <div class="stat-card" onclick="loadSection('news')">
                        <h3>Drafts Needing Review</h3>
                        <div class="stat-number">${news.data?.filter(n => !n.is_published).length || 0}</div>
                    </div>
                    <div class="stat-card" onclick="loadSection('pages')">
                        <h3>Stale Pages (>6mo)</h3>
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
        <div class="modal-content">
            <h3>${id ? 'Edit' : 'Add'} Project</h3>
            <form id="project-form" class="admin-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${project.title}" required>
                </div>
                <div class="form-group">
                    <label>Program</label>
                    <select name="program_id" id="program-select" required>
                        <option value="">Select a Program</option>
                        ${programs ? programs.map(p => `<option value="${p.id}" data-name="${p.name}" ${project.program_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('') : ''}
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value="${project.location || ''}">
                </div>
                <div class="form-group">
                    <label>Number of Beneficiaries</label>
                    <input type="text" name="beneficiaries" value="${project.beneficiaries || ''}">
                </div>
                <div class="form-group" id="tech-field-group">
                    <label>Technology Used</label>
                    <input type="text" name="technologies" value="${project.technologies || ''}">
                    <small class="helper-text">Only applicable for Irrigation and Climate-smart programs.</small>
                </div>
                <div class="form-group">
                    <label>Short Summary</label>
                    <textarea name="summary">${project.summary || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Featured Image</label>
                    <input type="file" id="project-image-input" accept="image/*">
                    ${project.image_url ? `<img src="${project.image_url}" class="preview-img">` : ''}
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" name="is_featured" ${project.is_featured ? 'checked' : ''}>
                    <label>Featured (Display on Homepage)</label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Project</button>
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

        // Rules: Show for Irrigation and Climate-smart
        const showTech = programName && (
            programName.includes('Irrigation') ||
            programName.includes('Climate-smart')
        );

        techGroup.style.display = showTech ? 'block' : 'none';
        if (!showTech) {
            techGroup.querySelector('input').value = ''; // Clear if hidden
        }
    };

    programSelect.addEventListener('change', updateTechVisibility);
    updateTechVisibility(); // Initial check

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            const projectData = Object.fromEntries(formData.entries());
            projectData.is_featured = formData.has('is_featured');

            // Ensure technology is cleared if not applicable
            const selectedOption = programSelect.options[programSelect.selectedIndex];
            const programName = selectedOption.getAttribute('data-name');
            if (!(programName.includes('Irrigation') || programName.includes('Climate-smart'))) {
                projectData.technologies = '';
            }

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
            <h3>${id ? 'Edit' : 'Add'} News Post</h3>
            <form id="news-form" class="admin-form">
                <div class="form-grid">
                    <div class="form-main">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" name="title" value="${item.title}" required>
                        </div>
                        <div class="form-group">
                            <label>Short Summary (Homepage)</label>
                            <textarea name="excerpt" rows="3">${item.excerpt || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Full Story Content</label>
                            <textarea name="content" rows="15">${item.content || ''}</textarea>
                        </div>
                    </div>
                    <div class="form-sidebar">
                        <div class="form-group">
                            <label>Featured Image</label>
                            <input type="file" id="news-image-input" accept="image/*">
                            ${item.image_url ? `<img src="${item.image_url}" class="preview-img">` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label>Attachments (PDF, DOCX)</label>
                            <input type="file" id="news-docs-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx">
                            <div id="attachments-list" class="attachments-manager">
                                ${attachments.map(a => `
                                    <div class="attachment-item" data-id="${a.id}">
                                        <span class="file-name">${a.file_name}</span>
                                        <button type="button" class="btn-remove-attach" onclick="removeAttachment('${a.id}', '${a.file_url}')">×</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group checkbox-group">
                            <input type="checkbox" name="is_published" ${item.is_published ? 'checked' : ''}>
                            <label>Published</label>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" name="is_featured" ${item.is_featured ? 'checked' : ''}>
                            <label>Featured (Homepage)</label>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Post</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('news-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            const newsData = Object.fromEntries(formData.entries());
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
                <button class="btn btn-primary" id="add-news-btn">+ Add News Post</button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
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
                    <td>${item.title}</td>
                    <td>${new Date(item.published_at).toLocaleDateString()}</td>
                    <td><span class="status-badge ${item.is_published ? 'status-published' : 'status-draft'}">${item.is_published ? 'Published' : 'Draft'}</span></td>
                    <td><span class="status-badge ${item.is_featured ? 'status-published' : 'status-draft'}">${item.is_featured ? 'Yes' : 'No'}</span></td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editNews('${item.id}')">Edit</button>
                        <button class="btn-icon btn-delete" onclick="deleteNews('${item.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5">No news posts found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
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
        <div class="modal-content">
            <h3>${id ? 'Edit' : 'Add'} Team Member</h3>
            <form id="team-form" class="admin-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${member.name}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" name="role" value="${member.role}" required>
                </div>
                <div class="form-group">
                    <label>Bio</label>
                    <textarea name="bio" rows="4">${member.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Photo</label>
                    <input type="file" id="team-image-input" accept="image/*">
                    ${member.image_url ? `<img src="${member.image_url}" class="preview-img">` : ''}
                </div>
                <div class="form-group">
                    <label>Sort Order (Lower numbers appear first)</label>
                    <input type="number" name="sort_order" value="${member.sort_order}">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Member</button>
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
                <button class="btn btn-primary" id="add-team-btn">+ Add Team Member</button>
            </div>
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
                    <td><img src="${member.image_url || '../assets/placeholder.png'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
                    <td>${member.name}</td>
                    <td>${member.role}</td>
                    <td>${member.sort_order}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editTeam('${member.id}')">Edit</button>
                        <button class="btn-icon btn-delete" onclick="deleteTeam('${member.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5">No team members found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
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
            <div class="card-header" style="justify-content: space-between;">
                <h3>Inquiries</h3>
                <div class="filter-group">
                    <select id="message-filter" onchange="renderMessages()">
                        <option value="all" ${filter === 'all' ? 'selected' : ''}>All Messages</option>
                        <option value="unread" ${filter === 'unread' ? 'selected' : ''}>Unread</option>
                        <option value="read" ${filter === 'read' ? 'selected' : ''}>Read</option>
                    </select>
                </div>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Date</th>
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
                        <strong>${msg.name}</strong><br>
                        <small>${msg.email}</small>
                    </td>
                    <td>${msg.subject}</td>
                    <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="viewMessage('${msg.id}')">View</button>
                        <button class="btn-icon btn-delete" onclick="deleteMessage('${msg.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="5">No messages found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
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
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">Message from ${msg.name}</h3>
                    <p style="color: #64748b;">${msg.email} • ${new Date(msg.created_at).toLocaleString()}</p>
                </div>
                <span class="status-badge ${msg.is_read ? 'status-draft' : 'status-published'}">${msg.is_read ? 'Read' : 'New'}</span>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #1e293b;">Subject: ${msg.subject}</h4>
                <p style="white-space: pre-wrap; line-height: 1.6;">${msg.message}</p>
            </div>

            <div class="modal-actions">
                <button class="btn btn-outline" onclick="toggleReadStatus('${msg.id}', ${!msg.is_read})">Mark as ${msg.is_read ? 'Unread' : 'Read'}</button>
                <button class="btn btn-primary" onclick="closeModal()">Close</button>
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
                <h3>Newsletter Subscribers</h3>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (subs && subs.length > 0) {
        subs.forEach(sub => {
            html += `
                <tr>
                    <td>${sub.email}</td>
                    <td>${new Date(sub.created_at).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="btn-icon btn-delete" onclick="deleteSubscriber('${sub.id}')">Remove</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3">No subscribers found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contentArea.innerHTML = html;
}

async function renderSettings() {
    const { data: settings } = await supabase.from('site_settings').select('*');
    const s = {};
    settings.forEach(item => s[item.key] = item.value);

    contentArea.innerHTML = `
        <div class="content-card">
            <form id="settings-form" class="admin-form">
                <div class="form-grid">
                    <div class="form-main">
                        <h3>Contact Information</h3>
                        <div class="form-group">
                            <label>Official Email</label>
                            <input type="email" name="contact_email" value="${s.contact_email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="contact_phone" value="${s.contact_phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Physical Address</label>
                            <textarea name="contact_address">${s.contact_address || ''}</textarea>
                        </div>

                        <h3 style="margin-top: 2rem;">Social Media Links</h3>
                        <div class="form-group">
                            <label>Facebook URL</label>
                            <input type="url" name="social_facebook" value="${s.social_facebook || ''}">
                        </div>
                        <div class="form-group">
                            <label>Twitter/X URL</label>
                            <input type="url" name="social_twitter" value="${s.social_twitter || ''}">
                        </div>
                        <div class="form-group">
                            <label>LinkedIn URL</label>
                            <input type="url" name="social_linkedin" value="${s.social_linkedin || ''}">
                        </div>
                    </div>
                    <div class="form-sidebar">
                        <h3>Impact Stats</h3>
                        <div class="form-group">
                            <label>Farmers Trained</label>
                            <input type="text" name="stat_farmers" value="${s.stat_farmers || ''}">
                        </div>
                        <div class="form-group">
                            <label>Hectares Covered</label>
                            <input type="text" name="stat_hectares" value="${s.stat_hectares || ''}">
                        </div>
                        <div class="form-group">
                            <label>Youth Empowered</label>
                            <input type="text" name="stat_youth" value="${s.stat_youth || ''}">
                        </div>
                    </div>
                </div>
                <div class="modal-actions" style="margin-top: 2rem;">
                    <button type="submit" class="btn btn-primary">Save All Settings</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);
            for (const [key, value] of formData.entries()) {
                await supabase.from('site_settings').upsert({ key, value });
            }
            showToast('Settings saved successfully');
            await logAction('Updated', 'Site Settings', 'global');
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Error saving settings', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
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
        <div class="content-card">
            <div class="card-header">
                <h3>Website Pages</h3>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Hero Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (pages && pages.length > 0) {
        pages.forEach(page => {
            html += `
                <tr>
                    <td>${page.title}</td>
                    <td><code>${page.slug}</code></td>
                    <td>
                        ${page.hero_image_url ?
                    `<img src="${page.hero_image_url}" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;">` :
                    '<span class="status-badge status-draft">No Image</span>'}
                    </td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editPage('${page.id}')">Edit Content</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="4">No pages found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
        </div>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">Editing: ${page.title}</h3>
                    <p class="helper-text">Changes will be live once you click "Save & Update Website"</p>
                </div>
                <button class="page-preview-btn" onclick="previewPage('${page.slug}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Preview Page
                </button>
            </div>
            
            <form id="visual-editor-form" class="admin-form">
                <div id="editor-sections-container">
                    <!-- Sections will be injected here -->
                </div>

                <div class="modal-actions" style="position: sticky; bottom: -3rem; background: white; padding: 1.5rem 0; border-top: 1px solid #e2e8f0; margin-top: 3rem; z-index: 10;">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Discard Changes</button>
                    <button type="submit" class="btn btn-primary">Save & Update Website</button>
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
        sectionCard.className = 'editor-section-card';

        sectionCard.innerHTML = `
            <div class="editor-section-header">
                <span class="editor-section-title">${group.label}</span>
            </div>
            ${group.description ? `<p class="editor-section-desc">${group.description}</p>` : ''}
            <div class="section-fields"></div>
        `;

        const fieldsContainer = sectionCard.querySelector('.section-fields');

        if (group.hasHeroImage) {
            const heroGroup = document.createElement('div');
            heroGroup.className = 'form-group';
            heroGroup.innerHTML = `
                <label>Top Page Image</label>
                <p class="helper-text" style="margin-bottom: 1rem;">This is the large image at the very top of the page.</p>
                <input type="file" id="hero-image-input" accept="image/*" style="margin-bottom: 1rem;">
                <div id="hero-preview-container">
                    ${page.hero_image_url ? `<img src="${page.hero_image_url}" class="preview-img" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px;">` : '<p class="helper-text">No image set.</p>'}
                </div>
            `;
            fieldsContainer.appendChild(heroGroup);

            // Preview handler
            heroGroup.querySelector('input').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        heroGroup.querySelector('#hero-preview-container').innerHTML = `<img src="${re.target.result}" class="preview-img" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px;">`;
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

            const addStatBlock = (label = '', number = '') => {
                const block = document.createElement('div');
                block.className = 'stat-block';
                block.innerHTML = `
                    <div class="form-group" style="margin-bottom: 0;">
                        <input type="text" placeholder="Label (e.g. People Trained)" value="${label}" class="stat-label-input">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <input type="text" placeholder="Number" value="${number}" class="stat-number-input">
                    </div>
                    <button type="button" class="btn-remove-attach" onclick="this.parentElement.remove()">×</button>
                `;
                statsList.appendChild(block);
            };

            stats.forEach(s => addStatBlock(s.label, s.number));

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn-add-block';
            addBtn.textContent = '+ Add another impact number';
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

    // Handle Form Submit
    document.getElementById('visual-editor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            // 1. Handle Hero Image
            const heroFile = document.getElementById('hero-image-input')?.files[0];
            if (heroFile) {
                const heroUrl = await uploadImage('heroes', heroFile);
                if (heroUrl) {
                    await supabase.from('pages').update({ hero_image_url: heroUrl }).eq('id', id);
                }
            }

            // 2. Handle Text Fields & Selects
            const inputs = e.target.querySelectorAll('.visual-field-input');
            for (const input of inputs) {
                const sectionId = input.dataset.sectionId;
                await supabase.from('sections').update({
                    content: { html: input.value }
                }).eq('id', sectionId);
            }

            // 3. Handle Rich Editors
            for (const item of richEditors) {
                await supabase.from('sections').update({
                    content: { html: item.editor.innerHTML }
                }).eq('id', item.id);
            }

            // 4. Handle Repeatable Blocks (Stats)
            for (const block of repeatableBlocks) {
                const stats = [];
                const items = block.container.querySelectorAll('.stat-block');
                items.forEach(item => {
                    const label = item.querySelector('.stat-label-input').value;
                    const number = item.querySelector('.stat-number-input').value;
                    if (label || number) stats.push({ label, number });
                });

                if (block.sectionId) {
                    await supabase.from('sections').update({
                        content: { stats }
                    }).eq('id', block.sectionId);
                } else {
                    // Create section if missing
                    await supabase.from('sections').insert({
                        page_id: id,
                        section_name: block.key,
                        content: { stats }
                    });
                }
            }

            await logAction('Updated', 'Page Content', id, { title: page.title });
            showToast('Website updated successfully!');
            closeModal();
            renderPages();
        } catch (error) {
            console.error('Save failed:', error);
            showToast('Failed to save changes', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
};

window.previewPage = (slug) => {
    window.open(`../${slug}`, '_blank');
};
