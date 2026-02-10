/* ===== Ambulance Interface View ===== */
import '../styles/ambulance.css';
import { ROUTE_POINTS, JUNCTIONS, HOSPITAL, AMBULANCE_DEPOT } from '../simulation/data.js';

let map = null;
let ambulanceMarker = null;
let routeLine = null;
let tickHandler = null;
let emergencyHandler = null;
let arrivedHandler = null;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const view = {
    render(container, engine) {
        const state = engine.getState();

        container.innerHTML = `
      <div class="ambulance-view">
        <!-- Emergency Toggle + Quick Stats -->
        <div class="emergency-section">
          <div class="emergency-toggle-wrap">
            <button class="emergency-btn ${state.emergencyActive ? 'on' : 'off'}" id="emergency-toggle">
              ${state.emergencyActive ? '🚨 ACTIVE' : '⚡ ACTIVATE'}
            </button>
            <div>
              <div class="emergency-label">Emergency Response</div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px;" id="emergency-status-text">
                ${state.emergencyActive ? 'Green corridor is active. Proceed on priority route.' : 'Tap to activate emergency corridor.'}
              </div>
            </div>
          </div>
          <div class="status-row" style="flex:unset;gap:var(--sp-3);">
            <div class="status-card" style="min-width:120px;">
              <div class="status-icon blue">⏱</div>
              <div class="status-info">
                <h4>ETA</h4>
                <div class="value large" id="eta-value">${formatTime(state.ambulance.etaSeconds || 480)}</div>
              </div>
            </div>
            <div class="status-card" style="min-width:120px;">
              <div class="status-icon green">🏥</div>
              <div class="status-info">
                <h4>Destination</h4>
                <div class="value" style="font-size:var(--fs-base);">Safdarjung Hospital</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="map-section" id="amb-map-container">
          <div class="corridor-status-overlay">
            <div class="corridor-badge ${state.emergencyActive ? 'active' : 'inactive'}" id="corridor-badge">
              <span class="status-dot ${state.emergencyActive ? 'green' : ''}" id="corridor-dot"></span>
              <span id="corridor-text">${state.emergencyActive ? 'Green Corridor Active' : 'Corridor Standby'}</span>
            </div>
            <div class="corridor-badge inactive" id="junction-badge" style="display:${state.emergencyActive ? 'flex' : 'none'};">
              <span>🔀</span>
              <span id="junction-text">Junctions Cleared: ${state.junctionsCleared}/5</span>
            </div>
          </div>
          <div id="amb-map" style="height:100%;width:100%;"></div>
        </div>

        <!-- Bottom Status Bar -->
        <div class="bottom-bar">
          <div class="network-status">
            <div class="network-bar">
              <span></span><span></span><span></span><span></span>
            </div>
            <span style="color:var(--signal-green);font-weight:var(--fw-medium);">4G LTE</span>
            <span style="color:var(--text-muted);">|</span>
            <span style="color:var(--text-muted);">Latency: 12ms</span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--sp-4);">
            <div class="auth-badge">
              <span>🔒</span>
              <span>Authenticated</span>
            </div>
            <span style="font-size:var(--fs-xs);color:var(--text-muted);font-family:var(--font-mono);">
              AMB-DL-4721
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-sm);">
            <span style="color:var(--text-muted);">Speed:</span>
            <span style="color:var(--text-heading);font-weight:var(--fw-bold);font-family:var(--font-mono);" id="speed-value">
              ${Math.round(state.ambulance.speed || 0)} km/h
            </span>
          </div>
        </div>
      </div>
    `;

        // Init map
        setTimeout(() => this.initMap(engine), 100);

        // Emergency toggle
        document.getElementById('emergency-toggle').addEventListener('click', () => {
            const newState = !engine.emergencyActive;
            engine.setEmergency(newState);
        });

        // Engine events
        tickHandler = (data) => this.onTick(data);
        emergencyHandler = (data) => this.onEmergencyChange(data, engine);
        arrivedHandler = () => this.onArrived();

        engine.on('tick', tickHandler);
        engine.on('emergency', emergencyHandler);
        engine.on('arrived', arrivedHandler);
    },

    initMap(engine) {
        const mapEl = document.getElementById('amb-map');
        if (!mapEl || map) return;

        map = L.map(mapEl, {
            center: [28.560, 77.230],
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Route line
        const coords = ROUTE_POINTS.map(p => [p.lat, p.lng]);
        routeLine = L.polyline(coords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.6,
            dashArray: '10 6',
        }).addTo(map);

        // Hospital marker
        const hospitalIcon = L.divIcon({
            html: '<div style="font-size:24px;text-align:center;">🏥</div>',
            iconSize: [32, 32],
            className: '',
        });
        L.marker([HOSPITAL.lat, HOSPITAL.lng], { icon: hospitalIcon }).addTo(map);

        // Junction markers
        JUNCTIONS.forEach(j => {
            const jIcon = L.divIcon({
                html: `<div style="width:12px;height:12px;border-radius:50%;background:var(--signal-amber);border:2px solid #fff;box-shadow:0 0 6px rgba(245,158,11,0.5);"></div>`,
                iconSize: [12, 12],
                className: '',
            });
            L.marker([j.lat, j.lng], { icon: jIcon }).addTo(map).bindTooltip(j.name, {
                direction: 'top',
                offset: [0, -8],
                className: 'junction-tooltip',
            });
        });

        // Ambulance marker
        const ambIcon = L.divIcon({
            html: '<div style="font-size:28px;filter:drop-shadow(0 0 8px rgba(220,38,38,0.6));">🚑</div>',
            iconSize: [32, 32],
            className: '',
        });
        const state = engine.getState();
        ambulanceMarker = L.marker([state.ambulance.lat, state.ambulance.lng], { icon: ambIcon }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    },

    onTick(data) {
        // Update ambulance position on map
        if (ambulanceMarker) {
            ambulanceMarker.setLatLng([data.ambulance.lat, data.ambulance.lng]);
        }

        // Update ETA
        const etaEl = document.getElementById('eta-value');
        if (etaEl) etaEl.textContent = formatTime(data.ambulance.etaSeconds);

        // Update speed
        const speedEl = document.getElementById('speed-value');
        if (speedEl) speedEl.textContent = `${Math.round(data.ambulance.speed)} km/h`;

        // Update junctions cleared
        const jText = document.getElementById('junction-text');
        if (jText) jText.textContent = `Junctions Cleared: ${data.junctionsCleared}/5`;

        // Center map on ambulance
        if (map && data.ambulance.lat) {
            map.panTo([data.ambulance.lat, data.ambulance.lng], { animate: true, duration: 0.5 });
        }
    },

    onEmergencyChange(data, engine) {
        const btn = document.getElementById('emergency-toggle');
        const statusText = document.getElementById('emergency-status-text');
        const badge = document.getElementById('corridor-badge');
        const dot = document.getElementById('corridor-dot');
        const corridorText = document.getElementById('corridor-text');
        const junctionBadge = document.getElementById('junction-badge');

        if (btn) {
            btn.className = `emergency-btn ${data.active ? 'on' : 'off'}`;
            btn.innerHTML = data.active ? '🚨 ACTIVE' : '⚡ ACTIVATE';
        }
        if (statusText) {
            statusText.textContent = data.active
                ? 'Green corridor is active. Proceed on priority route.'
                : 'Tap to activate emergency corridor.';
        }
        if (badge) badge.className = `corridor-badge ${data.active ? 'active' : 'inactive'}`;
        if (dot) dot.className = `status-dot ${data.active ? 'green' : ''}`;
        if (corridorText) corridorText.textContent = data.active ? 'Green Corridor Active' : 'Corridor Standby';
        if (junctionBadge) junctionBadge.style.display = data.active ? 'flex' : 'none';
    },

    onArrived() {
        const etaEl = document.getElementById('eta-value');
        if (etaEl) etaEl.textContent = '00:00';
        const statusText = document.getElementById('emergency-status-text');
        if (statusText) statusText.textContent = '✅ Arrived at hospital. Emergency concluded.';
        const corridorText = document.getElementById('corridor-text');
        if (corridorText) corridorText.textContent = 'Arrived at Destination';
    },

    destroy() {
        if (map) {
            map.remove();
            map = null;
        }
        ambulanceMarker = null;
        routeLine = null;
        const { engine } = window.__engine ? { engine: window.__engine } : {};
        // Remove listeners — we store them in module scope
    },
};

export default view;
