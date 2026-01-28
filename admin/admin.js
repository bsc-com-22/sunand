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
                    <select name="program_id" required>
                        <option value="">Select a Program</option>
                        ${programs ? programs.map(p => `<option value="${p.id}" ${project.program_id === p.id ? 'selected' : ''}>${p.name}</option>`).join('') : ''}
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
                <div class="form-group">
                    <label>Technology Used</label>
                    <input type="text" name="technologies" value="${project.technologies || ''}">
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
                const { data, error } = await supabase.from('news').insert([newsData]).select();
                if (data) {
                    newsId = data[0].id;
                    await logAction('Created', 'News Post', newsId, { title: newsData.title });
                }
            }

            // Handle document uploads
            const docFiles = document.getElementById('news-docs-input').files;
            if (docFiles.length > 0 && newsId) {
                for (const file of docFiles) {
                    const docData = await uploadDocument(file);
                    if (docData) {
                        await supabase.from('news_attachments').insert([{
                            news_id: newsId,
                            file_url: docData.url,
                            file_name: docData.name,
                            file_type: docData.type,
                            file_size: docData.size
                        }]);
                    }
                }
            }

            showToast(id ? 'News post updated' : 'News post created');
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

        // Try to delete from storage if we can extract the path
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            await supabase.storage.from('news_attachments').remove([fileName]);
        } catch (e) {
            console.error('Could not delete file from storage:', e);
        }

        // Remove from UI
        const item = document.querySelector(`.attachment-item[data-id="${id}"]`);
        if (item) item.remove();
    }
};

async function renderNews() {
    const { data: news, error } = await supabase.from('news').select('*').order('published_at', { ascending: false });

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
            const date = new Date(item.published_at).toLocaleDateString();
            html += `
                <tr>
                    <td>${item.title}</td>
                    <td>${date}</td>
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

async function renderMessages() {
    const { data: messages, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    let html = `
        <div class="content-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (messages && messages.length > 0) {
        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString();
            html += `
                <tr>
                    <td>${date}</td>
                    <td><strong>${msg.name}</strong><br><small>${msg.email}</small></td>
                    <td>${msg.subject || '-'}</td>
                    <td><div class="msg-preview">${msg.message}</div></td>
                    <td class="actions">
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

async function renderSubscribers() {
    const { data: subscribers, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });

    let html = `
        <div class="content-card">
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

    if (subscribers && subscribers.length > 0) {
        subscribers.forEach(sub => {
            const date = new Date(sub.created_at).toLocaleString();
            html += `
                <tr>
                    <td>${sub.email}</td>
                    <td>${date}</td>
                    <td class="actions">
                        <button class="btn-icon btn-delete" onclick="deleteSubscriber('${sub.id}')">Delete</button>
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
                    <input type="text" name="role" value="${member.role || ''}">
                </div>
                <div class="form-group">
                    <label>Bio</label>
                    <textarea name="bio">${member.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <input type="file" id="team-image-input" accept="image/*">
                    ${member.image_url ? `<img src="${member.image_url}" class="preview-img">` : ''}
                </div>
                <div class="form-group">
                    <label>Sort Order</label>
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
            const teamData = Object.fromEntries(formData.entries());

            const imageFile = document.getElementById('team-image-input').files[0];
            if (imageFile) {
                const imageUrl = await uploadImage('team', imageFile);
                if (imageUrl) teamData.image_url = imageUrl;
            }

            if (id) {
                await supabase.from('team_members').update(teamData).eq('id', id);
                await logAction('Updated', 'Team Member', id, { name: teamData.name });
                showToast('Team member updated');
            } else {
                const { data } = await supabase.from('team_members').insert([teamData]).select();
                if (data) await logAction('Added', 'Team Member', data[0].id, { name: teamData.name });
                showToast('Team member added');
            }

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
    const { data: team, error } = await supabase.from('team_members').select('*').order('sort_order', { ascending: true });

    let html = `
        <div class="content-card">
            <div class="card-header">
                <button class="btn btn-primary" id="add-team-btn">+ Add Team Member</button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (team && team.length > 0) {
        team.forEach(member => {
            html += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.role || '-'}</td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editTeam('${member.id}')">Edit</button>
                        <button class="btn-icon btn-delete" onclick="deleteTeam('${member.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3">No team members found.</td></tr>';
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contentArea.innerHTML = html;
    document.getElementById('add-team-btn').addEventListener('click', () => showTeamForm());
}

async function renderSettings() {
    const { data: settings, error } = await supabase.from('site_settings').select('*');

    let html = `
        <div class="content-card">
            <form id="settings-form" class="admin-form">
                <div class="settings-grid">
    `;

    if (settings) {
        settings.forEach(setting => {
            html += `
                <div class="form-group">
                    <label for="setting-${setting.id}">${setting.key.replace(/_/g, ' ').toUpperCase()}</label>
                    <input type="text" id="setting-${setting.id}" value="${setting.value || ''}" data-id="${setting.id}">
                </div>
            `;
        });
    }

    html += `
                </div>
                <button type="submit" class="btn btn-primary">Save All Settings</button>
            </form>
        </div>
    `;

    contentArea.innerHTML = html;

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const inputs = e.target.querySelectorAll('input');
            const updates = Array.from(inputs).map(input => ({
                id: input.getAttribute('data-id'),
                value: input.value
            }));

            for (const update of updates) {
                await supabase.from('site_settings').update({ value: update.value }).eq('id', update.id);
            }

            await logAction('Updated', 'Site Settings', 'global');
            showToast('Settings saved successfully');
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
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="editPage('${page.id}')">Edit Content</button>
                    </td>
                </tr>
            `;
        });
    } else {
        html += '<tr><td colspan="3">No pages found.</td></tr>';
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

    const modal = document.createElement('div');
    modal.className = 'admin-modal';

    // Defensive mapping to handle potential nesting or missing fields
    const sectionsHtml = (page.sections || []).map(s => {
        // Handle potential nesting from Supabase joins
        const section = s.sections && typeof s.sections === 'object' ? s.sections : s;

        // Field fallbacks for robustness
        const identifier = section.section_name || section.identifier || section.key || section.slug || 'no-id';
        const name = section.name || section.title || section.label || identifier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const sectionId = section.id;

        // Handle content that might be an object (JSONB)
        let content = section.content;
        if (content === null || content === undefined) {
            content = '';
        } else if (typeof content === 'object') {
            // If it's our standard {html: "..."}, just show the HTML
            content = content.html || content.text || JSON.stringify(content, null, 2);
        }

        return `
            <div class="form-group">
                <label>${name} (<code>${identifier}</code>)</label>
                <textarea name="section_${sectionId}" rows="5">${content}</textarea>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <h3>Edit Page: ${page.title || 'Untitled'}</h3>
            <form id="page-content-form" class="admin-form">
                ${sectionsHtml || '<p>No editable sections found for this page.</p>'}
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('page-content-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setLoading(submitBtn, true);

        try {
            const formData = new FormData(e.target);

            for (const [key, value] of formData.entries()) {
                if (key.startsWith('section_')) {
                    const sectionId = key.replace('section_', '');
                    // Save as a JSON object with an 'html' key for consistency
                    await supabase.from('sections').update({
                        content: { html: value }
                    }).eq('id', sectionId);
                }
            }

            await logAction('Updated', 'Page Content', id);
            showToast('Page content updated successfully');
            closeModal();
        } catch (error) {
            console.error('Error updating page content:', error);
            showToast('Error updating page content', 'error');
        } finally {
            setLoading(submitBtn, false, originalText);
        }
    });
};
