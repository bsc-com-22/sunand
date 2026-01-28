import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    loadProgramBasedProjects();
});

async function loadProgramBasedProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        // Fetch all programs
        const { data: programs, error: progError } = await supabase
            .from('programs')
            .select('*')
            .order('sort_order', { ascending: true });

        if (progError) throw progError;

        // Fetch all projects with their program info
        const { data: projects, error: projError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (projError) throw projError;

        container.innerHTML = ''; // Clear loading state

        programs.forEach(program => {
            // Filter projects for this program
            const programProjects = projects.filter(p => p.program_id === program.id);

            // Only show program section if it has projects
            if (programProjects.length > 0) {
                const section = document.createElement('section');
                section.className = 'program-section section-padding';
                section.innerHTML = `
                    <div class="container">
                        <div class="section-header-left">
                            <h2>${program.name}</h2>
                            <div class="underline-left"></div>
                            <p class="program-description">${program.description || ''}</p>
                        </div>
                        <div class="portfolio-grid">
                            ${programProjects.map(project => `
                                <div class="portfolio-card">
                                    <div class="portfolio-image" style="background-image: url('${project.image_url || 'assets/placeholder.png'}');"></div>
                                    <div class="portfolio-content">
                                        <h3>${project.title}</h3>
                                        <div class="portfolio-details">
                                            <div class="detail-row">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                <div class="detail-content">
                                                    <span class="detail-label">Location</span>
                                                    <span class="detail-value">${project.location || '-'}</span>
                                                </div>
                                            </div>
                                            <div class="detail-row">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                <div class="detail-content">
                                                    <span class="detail-label">Beneficiaries</span>
                                                    <span class="detail-value">${project.beneficiaries || '-'}</span>
                                                </div>
                                            </div>
                                            ${project.technologies ? `
                                            <div class="detail-row">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                                <div class="detail-content">
                                                    <span class="detail-label">Technology</span>
                                                    <span class="detail-value">${project.technologies}</span>
                                                </div>
                                            </div>
                                            ` : ''}
                                        </div>
                                        <div class="portfolio-outcomes">
                                            <h4>Summary</h4>
                                            <p>${project.summary || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                container.appendChild(section);
            }
        });

        if (container.innerHTML === '') {
            container.innerHTML = '<div class="no-results">No projects found.</div>';
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<div class="error">Error loading projects. Please try again later.</div>';
    }
}
