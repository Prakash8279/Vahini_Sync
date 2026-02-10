/* ===== Pilot Scenario Simulation View ===== */
import '../styles/pilot.css';
import { JUNCTIONS, AI_DECISIONS, SIDE_ROAD_IMPACT } from '../simulation/data.js';

let simInterval = null;
let chartInstance = null;

const JUNCTION_DATA = JUNCTIONS.map((j, i) => ({
    ...j,
    decision: AI_DECISIONS[i],
    impact: SIDE_ROAD_IMPACT[i],
    normalDelay: 35 + Math.floor(Math.random() * 25),
    emergencyDelay: 5 + Math.floor(Math.random() * 8),
}));

const view = {
    render(container, engine) {
        let simProgress = 0;
        let simRunning = false;
        let completedJunctions = 0;

        container.innerHTML = `
      <div class="pilot-view">
        <!-- Scenario Header -->
        <div class="scenario-header">
          <div class="scenario-info">
            <div class="scenario-title">🎯 Pilot Scenario: Peak Hour Emergency Response</div>
            <div class="scenario-desc">Ring Road Corridor • 5 Intersections • Single Ambulance • 6:00 PM Peak Traffic</div>
          </div>
          <div class="scenario-params">
            <div class="param-item">
              <div class="param-value">18:00</div>
              <div class="param-label">Time</div>
            </div>
            <div class="param-item">
              <div class="param-value">8.5 km</div>
              <div class="param-label">Distance</div>
            </div>
            <div class="param-item">
              <div class="param-value">5</div>
              <div class="param-label">Junctions</div>
            </div>
            <div class="param-item">
              <div class="param-value">95%</div>
              <div class="param-label">Congestion</div>
            </div>
          </div>
          <button class="btn btn-primary" id="pilot-start-btn" style="min-width:160px;height:44px;font-size:var(--fs-base);font-weight:var(--fw-semibold);">
            ▶ Start Simulation
          </button>
        </div>

        <!-- Main -->
        <div class="pilot-main">
          <!-- Left: Timeline -->
          <div class="pilot-timeline">
            <div class="card-header" style="margin-bottom:0;">
              <span class="card-title">Corridor Timeline</span>
              <span class="badge badge-blue" id="pilot-status-badge">Ready</span>
            </div>

            <div class="timeline-progress">
              <div class="timeline-bar">
                <div class="timeline-fill" id="timeline-fill" style="width:0%;"></div>
              </div>
              <span class="timeline-pct" id="timeline-pct">0%</span>
            </div>

            <div id="junction-timeline">
              ${JUNCTION_DATA.map((j, i) => `
                <div class="junction-timeline-item pending" id="jtl-${i}">
                  <div class="jtl-icon pending" id="jtl-icon-${i}">
                    ${i + 1}
                  </div>
                  <div class="jtl-content">
                    <div class="jtl-name">${j.name}</div>
                    <div class="jtl-stats">
                      <div class="jtl-stat">
                        ⏱ Normal: <span style="margin-left:2px;">${j.normalDelay}s delay</span>
                      </div>
                      <div class="jtl-stat">
                        ⚡ Optimized: <span class="positive" id="jtl-saved-${i}">--</span>
                      </div>
                      <div class="jtl-stat">
                        📊 Side Impact: <span id="jtl-impact-${i}">--</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Results -->
          <div class="pilot-results">
            <!-- KPI Grid -->
            <div class="result-kpi-grid">
              <div class="result-kpi">
                <div class="rkpi-value green" id="res-time-saved">--</div>
                <div class="rkpi-label">Total Time Saved</div>
                <div class="rkpi-compare">vs. normal signal cycle</div>
              </div>
              <div class="result-kpi">
                <div class="rkpi-value blue" id="res-transit">--</div>
                <div class="rkpi-label">Optimized Transit</div>
                <div class="rkpi-compare">Normal: 14m 30s</div>
              </div>
              <div class="result-kpi">
                <div class="rkpi-value green" id="res-reduction">--</div>
                <div class="rkpi-label">Stoppage Reduction</div>
                <div class="rkpi-compare">Ambulance stops at junctions</div>
              </div>
              <div class="result-kpi">
                <div class="rkpi-value amber" id="res-side-impact">--</div>
                <div class="rkpi-label">Avg Side-Road Impact</div>
                <div class="rkpi-compare">Additional delay per side road</div>
              </div>
            </div>

            <!-- Comparison Table -->
            <div class="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Junction</th>
                    <th>Normal Delay</th>
                    <th>With Vahini-Sync</th>
                    <th>Saved</th>
                    <th>Side-Road +Delay</th>
                  </tr>
                </thead>
                <tbody id="comparison-tbody">
                  ${JUNCTION_DATA.map((j, i) => `
                    <tr id="cmp-row-${i}">
                      <td style="font-weight:var(--fw-medium);">${j.name}</td>
                      <td>${j.normalDelay}s</td>
                      <td class="improved" id="cmp-opt-${i}">--</td>
                      <td class="improved" id="cmp-saved-${i}">--</td>
                      <td id="cmp-impact-${i}">--</td>
                    </tr>
                  `).join('')}
                  <tr style="font-weight:var(--fw-bold);background:var(--bg-surface);">
                    <td>TOTAL</td>
                    <td id="cmp-total-normal">--</td>
                    <td class="improved" id="cmp-total-opt">--</td>
                    <td class="improved" id="cmp-total-saved">--</td>
                    <td id="cmp-total-impact">--</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Impact Chart -->
            <div class="impact-chart">
              <div class="card-header" style="margin-bottom:var(--sp-2);">
                <span class="card-title" style="font-size:var(--fs-sm);">Time Saved per Junction</span>
              </div>
              <canvas id="impact-canvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

        // Start button handler
        document.getElementById('pilot-start-btn')?.addEventListener('click', () => {
            if (simRunning) return;
            simRunning = true;
            completedJunctions = 0;
            simProgress = 0;

            const btn = document.getElementById('pilot-start-btn');
            if (btn) { btn.textContent = '⏳ Running...'; btn.disabled = true; }

            const badge = document.getElementById('pilot-status-badge');
            if (badge) { badge.className = 'badge badge-amber'; badge.textContent = 'Running'; }

            // Also start the engine if not running
            if (!engine.emergencyActive) engine.setEmergency(true);
            if (!engine.isRunning) engine.start();

            // Simulate junction-by-junction progress
            simInterval = setInterval(() => {
                if (completedJunctions >= 5) {
                    clearInterval(simInterval);
                    simRunning = false;
                    this.showFinalResults(btn, badge);
                    return;
                }

                // Update progress
                completedJunctions++;
                simProgress = (completedJunctions / 5) * 100;

                const fill = document.getElementById('timeline-fill');
                const pct = document.getElementById('timeline-pct');
                if (fill) fill.style.width = simProgress + '%';
                if (pct) pct.textContent = Math.round(simProgress) + '%';

                // Update junction timeline item
                const jIdx = completedJunctions - 1;
                const jd = JUNCTION_DATA[jIdx];
                const item = document.getElementById(`jtl-${jIdx}`);
                const icon = document.getElementById(`jtl-icon-${jIdx}`);

                if (item) { item.className = 'junction-timeline-item completed'; }
                if (icon) { icon.className = 'jtl-icon completed'; icon.textContent = '✓'; }

                // Set next as active
                if (completedJunctions < 5) {
                    const nextItem = document.getElementById(`jtl-${completedJunctions}`);
                    const nextIcon = document.getElementById(`jtl-icon-${completedJunctions}`);
                    if (nextItem) nextItem.className = 'junction-timeline-item active';
                    if (nextIcon) nextIcon.className = 'jtl-icon active';
                }

                // Update stats for this junction
                const timeSaved = jd.decision.timeSaved;
                const savedEl = document.getElementById(`jtl-saved-${jIdx}`);
                if (savedEl) savedEl.textContent = `${jd.emergencyDelay}s (-${timeSaved}s)`;

                const impactEl = document.getElementById(`jtl-impact-${jIdx}`);
                if (impactEl) impactEl.textContent = `+${jd.impact.additionalDelay}s`;

                // Update comparison table
                const optEl = document.getElementById(`cmp-opt-${jIdx}`);
                if (optEl) optEl.textContent = `${jd.emergencyDelay}s`;
                const cmpSavedEl = document.getElementById(`cmp-saved-${jIdx}`);
                if (cmpSavedEl) cmpSavedEl.textContent = `-${timeSaved}s`;
                const cmpImpactEl = document.getElementById(`cmp-impact-${jIdx}`);
                if (cmpImpactEl) cmpImpactEl.textContent = `+${jd.impact.additionalDelay}s`;

                // Running totals
                this.updateTotals(completedJunctions);
            }, 2500);

            // Set first junction as active
            const firstItem = document.getElementById('jtl-0');
            const firstIcon = document.getElementById('jtl-icon-0');
            if (firstItem) firstItem.className = 'junction-timeline-item active';
            if (firstIcon) firstIcon.className = 'jtl-icon active';
        });
    },

    updateTotals(count) {
        let totalNormal = 0, totalOpt = 0, totalSaved = 0, totalImpact = 0;
        for (let i = 0; i < count; i++) {
            totalNormal += JUNCTION_DATA[i].normalDelay;
            totalOpt += JUNCTION_DATA[i].emergencyDelay;
            totalSaved += JUNCTION_DATA[i].decision.timeSaved;
            totalImpact += JUNCTION_DATA[i].impact.additionalDelay;
        }

        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setTxt('cmp-total-normal', totalNormal + 's');
        setTxt('cmp-total-opt', totalOpt + 's');
        setTxt('cmp-total-saved', `-${totalSaved}s`);
        setTxt('cmp-total-impact', `+${totalImpact}s`);

        // KPIs
        setTxt('res-time-saved', `${totalSaved}s`);
        const transitMin = Math.floor((870 - totalSaved) / 60);
        const transitSec = (870 - totalSaved) % 60;
        setTxt('res-transit', `${transitMin}m ${transitSec}s`);
        const stoppageReduction = Math.round((totalSaved / totalNormal) * 100);
        setTxt('res-reduction', `${stoppageReduction}%`);
        setTxt('res-side-impact', `+${Math.round(totalImpact / count)}s`);
    },

    showFinalResults(btn, badge) {
        if (badge) { badge.className = 'badge badge-green'; badge.textContent = 'Complete'; }
        if (btn) { btn.textContent = '✅ Complete'; btn.style.background = 'var(--signal-green)'; }

        // Draw chart
        this.drawChart();
    },

    drawChart() {
        const canvas = document.getElementById('impact-canvas');
        if (!canvas) return;

        try {
            import('chart.js/auto').then(({ default: Chart }) => {
                if (chartInstance) chartInstance.destroy();

                const ctx = canvas.getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: JUNCTION_DATA.map(j => j.id),
                        datasets: [
                            {
                                label: 'Normal Delay (s)',
                                data: JUNCTION_DATA.map(j => j.normalDelay),
                                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                                borderColor: '#ef4444',
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                            {
                                label: 'With Vahini-Sync (s)',
                                data: JUNCTION_DATA.map(j => j.emergencyDelay),
                                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                borderColor: '#22c55e',
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: '#8fa3bf', font: { family: 'Inter', size: 11 } },
                            },
                        },
                        scales: {
                            x: {
                                ticks: { color: '#5b7191', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.04)' },
                            },
                            y: {
                                ticks: { color: '#5b7191', font: { family: 'Inter', size: 11 } },
                                grid: { color: 'rgba(255,255,255,0.04)' },
                                title: { display: true, text: 'Delay (seconds)', color: '#5b7191', font: { family: 'Inter', size: 11 } },
                            },
                        },
                    },
                });
            }).catch(() => {
                // Fallback: draw simple bars on canvas
                this.drawFallbackChart(canvas);
            });
        } catch {
            this.drawFallbackChart(canvas);
        }
    },

    drawFallbackChart(canvas) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.parentElement.clientWidth - 32;
        const H = canvas.height = 160;
        ctx.clearRect(0, 0, W, H);

        const barWidth = W / 12;
        const maxVal = 60;

        JUNCTION_DATA.forEach((j, i) => {
            const x = i * (barWidth * 2.2) + 20;

            // Normal bar
            const nh = (j.normalDelay / maxVal) * (H - 30);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.fillRect(x, H - 20 - nh, barWidth - 2, nh);

            // Optimized bar
            const oh = (j.emergencyDelay / maxVal) * (H - 30);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
            ctx.fillRect(x + barWidth, H - 20 - oh, barWidth - 2, oh);

            // Label
            ctx.fillStyle = '#5b7191';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(j.id, x + barWidth, H - 5);
        });
    },

    destroy() {
        if (simInterval) clearInterval(simInterval);
        simInterval = null;
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    },
};

export default view;
