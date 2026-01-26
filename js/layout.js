import { logout } from './auth.js';

/**
 * Layout Manager for Super Admin Dashboard
 * Handles dynamic loading of shared components (header, sidebar, mobile menu)
 */
export async function initLayout(pageId) {
    // 1. Load Partials
    await Promise.all([
        loadPartial('sidebar', 'partials/sidebar.html'),
        loadPartial('mobile-menu', 'partials/mobile-menu.html'),
        loadPartial('header', 'partials/header.html')
    ]);

    // 2. Set Active Navigation Item
    if (pageId) {
        setActiveNavItem(pageId);
    }

    // 3. Initialize Mobile Menu Logic
    initMobileMenu();

    // 4. Expose logout to window for inline onclick handlers
    window.logout = logout;
}

async function loadPartial(elementId, url) {
    const container = document.getElementById(elementId);
    if (!container) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(`Error loading partial [${elementId}]:`, error);
    }
}

function setActiveNavItem(pageId) {
    const navItems = document.querySelectorAll(`.nav-item[data-page="${pageId}"]`);
    navItems.forEach(item => {
        item.classList.add('active');
        const icon = item.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.add('filled');
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
    const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (!mobileMenuBtn || !mobileMenuDrawer || !mobileMenuOverlay) return;

    function toggleMobileMenu() {
        mobileMenuDrawer.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
}

// Auto-initialize if data-page attribute is present on body
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.dataset.page;
    if (pageId) {
        initLayout(pageId);
    }
});
