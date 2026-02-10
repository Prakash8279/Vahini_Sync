/* ===== Central AI Orchestration Dashboard ===== */
import '../styles/dashboard.css';
import { JUNCTIONS, ROUTE_POINTS, HOSPITAL, AI_DECISIONS } from '../simulation/data.js';

let map = null;
let ambulanceMarker = null;
let corridorLine = null;
let heatCircles = [];
let junctionMarkers = {};
let tickHandler = null;

const view = {
    render(container, engine) {
        const state = engine.getState();

        container.innerHTML = `
      <div class="dashboard-view">
        <!-- KPI Row -->
        <div class="dashboard-kpi-row">
          <div class="dashboard-kpi">
            <div class="kpi-icon">🚨</div>
            <div class="kpi-val" id="kpi-active">${state.emergencyActive ? '1' : '0'}</div>
            <div class="kpi-lbl">Active Emergencies</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">⏱️</div>
            <div class="kpi-val" id="kpi-eta">${state.ambulance.etaSeconds ? Math.ceil(state.ambulance.etaSeconds / 60) + 'm' : '--'}</div>
            <div class="kpi-lbl">Est. Response Time</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">🟢</div>
            <div class="kpi-val" id="kpi-cleared">${state.junctionsCleared}</div>
            <div class="kpi-lbl">Junctions Cleared</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">⚡</div>
            <div class="kpi-val" id="kpi-saved">${state.totalTimeSaved}s</div>
            <div class="kpi-lbl">Time Saved</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">📊</div>
            <div class="kpi-val" id="kpi-confidence">--</div>
            <div class="kpi-lbl">Route Confidence</div>
          </div>
        </div>

        <!-- Main Layout -->
        <div class="dashboard-main">
          <!-- Left: Map + Controls -->
          <div class="dashboard-map-panel">
            <div class="dashboard-map">
              <div id="dash-map"></div>
              <div class="map-legend">
                <div class="legend-item"><div class="legend-dot" style="background:var(--emergency-red);"></div> Ambulance</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--signal-green);"></div> Green Corridor</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--signal-amber);"></div> Junction</div>
                <div class="legend-item"><div class="legend-dot" style="background:rgba(239,68,68,0.5);"></div> High Traffic</div>
              </div>
            </div>
            <div class="dashboard-controls">
              <div class="control-group">
                <span class="control-label">AI Control:</span>
                <button class="btn btn-primary btn-sm" id="dash-ai-toggle" style="font-size:var(--fs-xs);padding:4px 12px;">
                  ${state.isRunning ? '⏸ Pause' : '▶ Resume'}
                </button>
              </div>
              <div class="control-group">
                <span class="control-label">Override:</span>
                <button class="btn btn-danger btn-sm" id="dash-override" style="font-size:var(--fs-xs);padding:4px 12px;">
                  🛑 Manual Override
                </button>
              </div>
              <div class="control-group">
                <span class="control-label">Priority:</span>
                <select style="background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:3px 8px;font-size:var(--fs-xs);">
                  <option>Single Ambulance</option>
                  <option>Multiple — Priority Queue</option>
                </select>
              </div>
              <div class="control-group" style="margin-left:auto;">
                <span class="control-label">Speed:</span>
                <button class="btn btn-ghost btn-sm" style="font-size:var(--fs-xs);padding:4px 8px;" id="speed-1x">1×</button>
                <button class="btn btn-ghost btn-sm" style="font-size:var(--fs-xs);padding:4px 8px;" id="speed-2x">2×</button>
                <button class="btn btn-ghost btn-sm" style="font-size:var(--fs-xs);padding:4px 8px;" id="speed-4x">4×</button>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="dashboard-right">
            <!-- Signal Status -->
            <div class="card" style="padding:var(--sp-3) var(--sp-4);">
              <div class="card-header" style="margin-bottom:var(--sp-3);">
                <span class="card-title">Signal Status</span>
                <span class="badge badge-blue">Live</span>
              </div>
              <div class="signal-list" id="signal-list">
                ${JUNCTIONS.map(j => {
            const sig = state.signals[j.id];
            return `
                  <div class="signal-item" id="sig-item-${j.id}">
                    <div class="signal-item-left">
                      <div class="signal-light ${sig.mainState}" id="sig-light-${j.id}">${sig.countdown}</div>
                      <div>
                        <div class="signal-name">${j.name}</div>
                        <div class="signal-sub" id="sig-sub-${j.id}">${sig.overridden ? '⚡ AI Override' : 'Normal Cycle'}</div>
                      </div>
                    </div>
                    <div>
                      ${sig.greenWaveActive ? '<span class="badge badge-green">🟢 Wave</span>' : ''}
                      ${sig.cleared ? '<span class="badge badge-green">✓ Cleared</span>' : ''}
                    </div>
                  </div>`;
        }).join('')}
              </div>
            </div>

            <!-- AI Decisions -->
            <div class="card" style="padding:var(--sp-3) var(--sp-4);">
              <div class="card-header" style="margin-bottom:var(--sp-3);">
                <span class="card-title">AI Decisions</span>
                <span class="badge badge-blue">Predictive</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:var(--sp-2);" id="ai-decisions">
                ${AI_DECISIONS.map(d => `
                  <div class="ai-decision-item" id="ai-dec-${d.junction}">
                    <div class="decision-header">
                      <span class="decision-action">${d.junction}: ${d.action}</span>
                      <div class="badge badge-green">${d.confidence}%</div>
                    </div>
                    <div class="decision-reason">${d.reason}</div>
                    <div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-1);">
                      <span style="font-size:var(--fs-xs);color:var(--signal-green);">⏱ ${d.timeSaved}s saved</span>
                      <div class="confidence-bar"><div class="confidence-fill" style="width:${d.confidence}%;"></div></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        // Init map
        setTimeout(() => this.initMap(engine), 100);

        // Controls
        document.getElementById('dash-ai-toggle')?.addEventListener('click', () => {
            if (engine.isRunning) { engine.stop(); }
            else { engine.start(); }
            const btn = document.getElementById('dash-ai-toggle');
            if (btn) btn.innerHTML = engine.isRunning ? '⏸ Pause' : '▶ Resume';
        });

        document.getElementById('speed-1x')?.addEventListener('click', () => engine.setSpeed(1));
        document.getElementById('speed-2x')?.addEventListener('click', () => engine.setSpeed(2));
        document.getElementById('speed-4x')?.addEventListener('click', () => engine.setSpeed(4));

        // Engine events
        tickHandler = (data) => this.onTick(data);
        engine.on('tick', tickHandler);
    },

    initMap(engine) {
        const mapEl = document.getElementById('dash-map');
        if (!mapEl || map) return;

        map = L.map(mapEl, {
            center: [28.560, 77.230],
            zoom: 13,
            zoomControl: true,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Route
        const coords = ROUTE_POINTS.map(p => [p.lat, p.lng]);
        L.polyline(coords, { color: '#3b82f6', weight: 3, opacity: 0.4, dashArray: '8 5' }).addTo(map);

        // Hospital
        L.marker([HOSPITAL.lat, HOSPITAL.lng], {
            icon: L.divIcon({ html: '<div style="font-size:22px;">🏥</div>', iconSize: [28, 28], className: '' }),
        }).addTo(map);

        // Junction markers with signal colors
        JUNCTIONS.forEach(j => {
            const state = engine.getState();
            const sig = state.signals[j.id];
            const color = sig.mainState === 'green' ? '#22c55e' : sig.mainState === 'amber' ? '#f59e0b' : '#ef4444';
            const marker = L.circleMarker([j.lat, j.lng], {
                radius: 8,
                fillColor: color,
                fillOpacity: 0.8,
                color: '#fff',
                weight: 2,
            }).addTo(map).bindTooltip(j.name, { direction: 'top' });
            junctionMarkers[j.id] = marker;
        });

        // Traffic heatmap circles
        const heatPoints = [
            { lat: 28.5500, lng: 77.2520, intensity: 0.9 },
            { lat: 28.5550, lng: 77.2470, intensity: 0.7 },
            { lat: 28.5620, lng: 77.2380, intensity: 0.85 },
            { lat: 28.5700, lng: 77.2250, intensity: 0.6 },
            { lat: 28.5780, lng: 77.2040, intensity: 0.75 },
        ];
        heatPoints.forEach(hp => {
            const c = L.circle([hp.lat, hp.lng], {
                radius: 300,
                fillColor: `rgba(239, 68, 68, ${hp.intensity * 0.3})`,
                fillOpacity: hp.intensity * 0.3,
                color: 'transparent',
                weight: 0,
            }).addTo(map);
            heatCircles.push(c);
        });

        // Ambulance
        const ambState = engine.getState();
        ambulanceMarker = L.marker([ambState.ambulance.lat, ambState.ambulance.lng], {
            icon: L.divIcon({
                html: '<div style="font-size:24px;filter:drop-shadow(0 0 8px rgba(220,38,38,0.6));">🚑</div>',
                iconSize: [28, 28],
                className: '',
            }),
        }).addTo(map);

        // Green corridor line (dynamic)
        corridorLine = L.polyline([], { color: '#22c55e', weight: 5, opacity: 0.7 }).addTo(map);

        map.fitBounds(L.polyline(coords).getBounds(), { padding: [30, 30] });
    },

    onTick(data) {
        // Update KPIs
        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setTxt('kpi-active', data.emergencyActive ? '1' : '0');
        setTxt('kpi-eta', data.ambulance.etaSeconds ? Math.ceil(data.ambulance.etaSeconds / 60) + 'm' : '--');
        setTxt('kpi-cleared', data.junctionsCleared);
        setTxt('kpi-saved', data.totalTimeSaved + 's');

        // Confidence varies realistically
        const conf = 88 + Math.floor(Math.random() * 10);
        setTxt('kpi-confidence', conf + '%');

        // Update ambulance on map
        if (ambulanceMarker) ambulanceMarker.setLatLng([data.ambulance.lat, data.ambulance.lng]);

        // Update corridor line — show green wave ahead of ambulance
        if (corridorLine && data.emergencyActive) {
            const routeIdx = Math.floor(data.routeProgress * (ROUTE_POINTS.length - 1));
            const ahead = ROUTE_POINTS.slice(Math.max(0, routeIdx - 1), Math.min(routeIdx + 6, ROUTE_POINTS.length));
            corridorLine.setLatLngs(ahead.map(p => [p.lat, p.lng]));
        }

        // Update signal lights
        JUNCTIONS.forEach(j => {
            const sig = data.signals[j.id];
            const lightEl = document.getElementById(`sig-light-${j.id}`);
            if (lightEl) {
                lightEl.className = `signal-light ${sig.mainState}`;
                lightEl.textContent = sig.countdown;
            }
            const subEl = document.getElementById(`sig-sub-${j.id}`);
            if (subEl) subEl.textContent = sig.overridden ? '⚡ AI Override' : 'Normal Cycle';

            // Update map junction markers
            if (junctionMarkers[j.id]) {
                const color = sig.mainState === 'green' ? '#22c55e' : sig.mainState === 'amber' ? '#f59e0b' : '#ef4444';
                junctionMarkers[j.id].setStyle({ fillColor: color });
            }
        });
    },

    destroy() {
        if (map) { map.remove(); map = null; }
        ambulanceMarker = null;
        corridorLine = null;
        heatCircles = [];
        junctionMarkers = {};
    },
};

export default view;
