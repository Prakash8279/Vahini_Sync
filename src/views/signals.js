/* ===== Traffic Signal Simulation View ===== */
import '../styles/signals.css';
import { JUNCTIONS, AI_DECISIONS, SIDE_ROAD_IMPACT } from '../simulation/data.js';

let canvas, ctx;
let animFrame = null;
let tickHandler = null;
let currentEngine = null;

const view = {
    render(container, engine) {
        currentEngine = engine;
        const state = engine.getState();

        container.innerHTML = `
      <div class="signals-view">
        <!-- Top Controls -->
        <div class="signals-top">
          <span class="section-title" style="margin:0;">Corridor: Ring Road — 5 Junctions</span>
          <div class="signals-mode-badge ${state.emergencyActive ? 'badge-red' : 'badge-blue'}" id="sig-mode-badge">
            ${state.emergencyActive ? '🚨 EMERGENCY MODE' : '🔵 NORMAL MODE'}
          </div>
          <div style="margin-left:auto;display:flex;gap:var(--sp-2);">
            <button class="btn btn-outline" id="sig-toggle-mode" style="font-size:var(--fs-xs);">
              Toggle Emergency
            </button>
          </div>
        </div>

        <!-- Main -->
        <div class="signals-main">
          <!-- Canvas -->
          <div class="signals-canvas-wrap">
            <canvas id="signals-canvas"></canvas>
            <div class="canvas-overlay-label">
              <span class="badge badge-blue">Green Wave Propagation</span>
              <span class="badge" id="wave-status" style="background:var(--bg-overlay);color:var(--text-secondary);">500m Ahead</span>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="signals-right">
            <!-- Comparison -->
            <div class="card" style="padding:var(--sp-3);">
              <div class="card-header" style="margin-bottom:var(--sp-2);">
                <span class="card-title" style="font-size:var(--fs-sm);">Normal vs Emergency</span>
              </div>
              <div class="comparison-row">
                <div class="comparison-card">
                  <div class="comp-label">Normal Transit</div>
                  <div class="comp-value normal" id="normal-time">14:30</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-muted);">Avg Transit Time</div>
                </div>
                <div class="comparison-card">
                  <div class="comp-label">With Vahini-Sync</div>
                  <div class="comp-value emergency" id="emergency-time">07:45</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-muted);">Optimized Time</div>
                </div>
              </div>
            </div>

            <!-- Junction Details -->
            ${JUNCTIONS.map((j, i) => {
            const sig = state.signals[j.id];
            const impact = SIDE_ROAD_IMPACT[i];
            const decision = AI_DECISIONS[i];
            const congestion = 40 + Math.random() * 50;
            const congLevel = congestion > 70 ? 'high' : congestion > 40 ? 'medium' : 'low';
            return `
              <div class="junction-card" id="jcard-${j.id}">
                <div class="junction-header">
                  <span class="junction-name">${j.name}</span>
                  <span class="badge ${sig.overridden ? 'badge-amber' : 'badge-blue'}" id="jbadge-${j.id}">
                    ${sig.overridden ? 'Override' : 'Auto'}
                  </span>
                </div>
                <div class="junction-signals" id="jsigs-${j.id}">
                  <div class="mini-signal">
                    <div class="mini-light ${sig.mainState === 'green' ? 'green' : 'off'}"></div>
                    Main
                  </div>
                  <div class="mini-signal">
                    <div class="mini-light ${sig.mainState === 'amber' ? 'amber' : 'off'}"></div>
                    Amber
                  </div>
                  <div class="mini-signal">
                    <div class="mini-light ${sig.mainState === 'red' ? 'red' : 'off'}"></div>
                    Stop
                  </div>
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);margin-left:auto;font-family:var(--font-mono);" id="jcount-${j.id}">
                    ${sig.countdown}s
                  </span>
                </div>
                <div class="congestion-meter">
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);width:50px;">Side Rd</span>
                  <div class="congestion-bar">
                    <div class="congestion-fill ${congLevel}" style="width:${congestion}%;" id="jcong-${j.id}"></div>
                  </div>
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);" id="jcongtext-${j.id}">${Math.round(congestion)}%</span>
                </div>
                ${decision ? `
                <div class="ai-logic-box" style="margin-top:var(--sp-2);">
                  <div class="logic-title">🧠 AI Decision</div>
                  <div class="logic-row"><span>Action:</span><span class="logic-val">${decision.action}</span></div>
                  <div class="logic-row"><span>Predicted Save:</span><span class="logic-val" style="color:var(--signal-green);">${decision.timeSaved}s</span></div>
                  <div class="logic-row"><span>Confidence:</span><span class="logic-val">${decision.confidence}%</span></div>
                </div>` : ''}
              </div>`;
        }).join('')}
          </div>
        </div>
      </div>
    `;

        // Toggle
        document.getElementById('sig-toggle-mode')?.addEventListener('click', () => {
            engine.setEmergency(!engine.emergencyActive);
            if (!engine.isRunning) engine.start();
        });

        // Init canvas
        setTimeout(() => this.initCanvas(engine), 100);

        tickHandler = (data) => this.onTick(data);
        engine.on('tick', tickHandler);
    },

    initCanvas(engine) {
        canvas = document.getElementById('signals-canvas');
        if (!canvas) return;
        const wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth;
        canvas.height = wrap.clientHeight;
        ctx = canvas.getContext('2d');
        this.drawFrame(engine.getState());
    },

    drawFrame(state) {
        if (!ctx || !canvas) return;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(0, 0, W, H);

        // Draw corridor (horizontal road)
        const roadY = H / 2;
        const roadH = 50;
        const laneH = roadH / 2;

        // Main road
        ctx.fillStyle = '#1a2a44';
        ctx.fillRect(0, roadY - roadH / 2, W, roadH);

        // Lane divider
        ctx.setLineDash([20, 15]);
        ctx.strokeStyle = '#f59e0b55';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, roadY);
        ctx.lineTo(W, roadY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw 5 junctions
        const spacing = W / 6;
        JUNCTIONS.forEach((j, i) => {
            const x = spacing * (i + 1);
            const sig = state.signals[j.id];

            // Vertical road (side road)
            ctx.fillStyle = '#1a2a44';
            ctx.fillRect(x - 20, 0, 40, H);

            // Intersection
            ctx.fillStyle = '#0f1f3a';
            ctx.fillRect(x - 25, roadY - roadH / 2 - 5, 50, roadH + 10);

            // Signal indicators
            const mainColor = sig.mainState === 'green' ? '#22c55e' : sig.mainState === 'amber' ? '#f59e0b' : '#ef4444';
            const sideColor = sig.sideState === 'green' ? '#22c55e' : '#ef4444';

            // Main signal (horizontal)
            ctx.beginPath();
            ctx.arc(x, roadY - roadH / 2 - 15, 8, 0, Math.PI * 2);
            ctx.fillStyle = mainColor;
            ctx.fill();
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Side signal (vertical)
            ctx.beginPath();
            ctx.arc(x + 30, roadY, 6, 0, Math.PI * 2);
            ctx.fillStyle = sideColor;
            ctx.fill();

            // Junction label
            ctx.fillStyle = '#8fa3bf';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(j.id, x, roadY + roadH / 2 + 30);
            ctx.fillText(sig.countdown + 's', x, roadY - roadH / 2 - 28);

            // Green wave glow
            if (sig.greenWaveActive) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
                ctx.fillRect(x - 35, roadY - roadH / 2 - 10, 70, roadH + 20);

                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 35, roadY - roadH / 2 - 10, 70, roadH + 20);
            }

            // Cleared check
            if (sig.cleared) {
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.fillText('✓', x, roadY + roadH / 2 + 48);
            }

            // Draw side-road mini cars
            const carCount = sig.overridden ? 6 : 3;
            for (let c = 0; c < carCount; c++) {
                ctx.fillStyle = '#4a6fa5';
                ctx.fillRect(x - 7, roadY - roadH / 2 - 40 - c * 18, 14, 10);
            }
        });

        // Ambulance position on road
        if (state.emergencyActive || state.isRunning) {
            const ambX = state.routeProgress * (W - spacing) + spacing / 2;

            // Siren glow
            ctx.beginPath();
            ctx.arc(ambX, roadY - 5, 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
            ctx.fill();

            // Ambulance box
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(ambX - 12, roadY - 12, 24, 10);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('AMB', ambX, roadY - 5);

            // Green wave corridor ahead
            const waveEnd = Math.min(ambX + 120, W);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
            ctx.fillRect(ambX + 12, roadY - roadH / 2, waveEnd - ambX - 12, roadH);
        }

        // Distance scale
        ctx.fillStyle = '#5b7191';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('← 0 km', 10, H - 10);
        ctx.textAlign = 'right';
        ctx.fillText('8.5 km →', W - 10, H - 10);

        animFrame = requestAnimationFrame(() => this.drawFrame(currentEngine?.getState() || state));
    },

    onTick(data) {
        // Update mode badge
        const badge = document.getElementById('sig-mode-badge');
        if (badge) {
            badge.className = `signals-mode-badge ${data.emergencyActive ? 'badge-red' : 'badge-blue'}`;
            badge.textContent = data.emergencyActive ? '🚨 EMERGENCY MODE' : '🔵 NORMAL MODE';
        }

        // Update junction cards
        JUNCTIONS.forEach(j => {
            const sig = data.signals[j.id];
            const countEl = document.getElementById(`jcount-${j.id}`);
            if (countEl) countEl.textContent = sig.countdown + 's';

            const badgeEl = document.getElementById(`jbadge-${j.id}`);
            if (badgeEl) {
                badgeEl.className = `badge ${sig.overridden ? 'badge-amber' : 'badge-blue'}`;
                badgeEl.textContent = sig.overridden ? 'Override' : 'Auto';
            }
        });
    },

    destroy() {
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = null;
        canvas = null;
        ctx = null;
        currentEngine = null;
    },
};

export default view;
