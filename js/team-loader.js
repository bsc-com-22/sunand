import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
});

async function loadTeamMembers() {
    const { data: team, error } = await supabase.from('team_members').select('*').order('sort_order', { ascending: true });

    const container = document.querySelector('.team-grid');
    if (!container) return;

    if (team && team.length > 0) {
        container.innerHTML = '';
        team.forEach(member => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <div class="team-photo-wrapper">
                    <div class="team-photo" style="background-image: url('${member.image_url || 'assets/placeholder.png'}')">
                        ${!member.image_url ? `
                            <div class="placeholder-icon">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="team-info">
                    <h3>${member.name}</h3>
                    <span class="role">${member.role || ''}</span>
                    <p class="bio">${member.bio || ''}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<div class="no-results">No team members found.</div>';
    }
}
