/* ===== Vahini-Sync Main Entry & Router ===== */
import { engine } from './simulation/engine.js';

// View modules (lazy loaded)
const viewModules = {
    ambulance: () => import('./views/ambulance.js'),
    dashboard: () => import('./views/dashboard.js'),
    signals: () => import('./views/signals.js'),
    driver: () => import('./views/driver.js'),
    'ai-layer': () => import('./views/ai-layer.js'),
    pilot: () => import('./views/pilot.js'),
};

const VIEW_TITLES = {
    ambulance: { title: 'Ambulance Interface', subtitle: 'PARAMEDIC CONSOLE' },
    dashboard: { title: 'Central AI Dashboard', subtitle: 'TRAFFIC AUTHORITY COMMAND CENTER' },
    signals: { title: 'Signal Simulation', subtitle: 'TRAFFIC SIGNAL CONTROL' },
    driver: { title: 'Driver Notification', subtitle: 'REROUTING FLOW' },
    'ai-layer': { title: 'AI & Data Layer', subtitle: 'SYSTEM INTELLIGENCE' },
    pilot: { title: 'Pilot Demo', subtitle: 'LIVE SCENARIO SIMULATION' },
};

let currentView = null;
let currentViewInstance = null;

// Clock
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) {
        el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
}
setInterval(updateClock, 1000);
updateClock();

// Navigation
async function navigateTo(viewName) {
    if (currentView === viewName) return;

    // Cleanup previous view
    if (currentViewInstance && currentViewInstance.destroy) {
        currentViewInstance.destroy();
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update header
    const titles = VIEW_TITLES[viewName];
    if (titles) {
        document.getElementById('view-title').textContent = titles.title;
        document.getElementById('view-subtitle').textContent = titles.subtitle;
    }

    // Load and render view
    const container = document.getElementById('view-container');
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">Loading...</div>';

    try {
        const module = await viewModules[viewName]();
        currentViewInstance = module.default;
        currentView = viewName;
        container.innerHTML = '';
        currentViewInstance.render(container, engine);
    } catch (err) {
        console.error('Failed to load view:', viewName, err);
        container.innerHTML = `<div style="color:var(--signal-red);padding:20px;">Failed to load view: ${viewName}</div>`;
    }
}

// Bind nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) {
            window.location.hash = view;
        }
    });
});

// Hash router
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'ambulance';
    navigateTo(hash);
}

window.addEventListener('hashchange', handleRoute);

// Init
handleRoute();

// Global engine state for debugging
window.__engine = engine;
