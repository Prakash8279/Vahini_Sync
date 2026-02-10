/* ===== AI & Data Layer Visualization ===== */
import '../styles/ai-layer.css';

let feedInterval = null;

const FEED_ENTRIES = [
    { type: 'input', msg: 'GPS update: AMB-DL-4721 at 28.5588°N, 77.2430°E | speed: 42km/h' },
    { type: 'input', msg: 'Traffic sensor J2: density 92 veh/100m | queue: 14 vehicles' },
    { type: 'input', msg: 'Historical model: 6PM peak, Ring Road congestion P=0.95' },
    { type: 'process', msg: 'RL Agent: evaluate action space for J3 → extend_green(25s)' },
    { type: 'process', msg: 'Graph predictor: flow propagation → J4 impact: +16s side delay' },
    { type: 'output', msg: 'Signal command: J3 → GREEN_MAIN [duration: 60s] [priority: EMERGENCY]' },
    { type: 'output', msg: 'Driver alert: push to 23 devices in 500m radius [type: YIELD_LEFT]' },
    { type: 'safety', msg: 'Safety check: J2 side-road red duration 68s < MAX(120s) ✓ PASS' },
    { type: 'process', msg: 'Route optimizer: confidence 94% for Ring Road corridor' },
    { type: 'input', msg: 'V2X beacon: cross-traffic count at J4 = 8 vehicles waiting' },
    { type: 'safety', msg: 'Override check: no manual override active → AI control retained' },
    { type: 'output', msg: 'ETA update: destination in 7m 45s (improved from 14m 30s)' },
    { type: 'process', msg: 'Congestion prediction: J5 clear in 12s, pre-empt green wave' },
    { type: 'input', msg: 'Network health: latency 12ms, packet loss 0.01%, uplink stable' },
    { type: 'safety', msg: 'Auto-cancel check: ambulance moving > 5km/h ✓ emergency valid' },
];

const view = {
    render(container) {
        container.innerHTML = `
      <div class="ai-layer-view">
        <!-- Section: Data Flow Architecture -->
        <div class="section-header">
          <span class="section-title">System Architecture — Data Flow</span>
        </div>

        <div class="data-flow">
          <!-- Input Column -->
          <div class="flow-column">
            <div class="flow-card input">
              <div class="flow-card-icon">📡</div>
              <div class="flow-card-title">Ambulance GPS</div>
              <div class="flow-card-desc">Real-time position, speed, heading from onboard GPS module</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Update Rate</span><span class="value">1 Hz</span></div>
                <div class="data-row"><span class="label">Accuracy</span><span class="value">±2m</span></div>
                <div class="data-row"><span class="label">Protocol</span><span class="value">MQTT/TLS</span></div>
              </div>
            </div>
            <div class="flow-card input">
              <div class="flow-card-icon">🚦</div>
              <div class="flow-card-title">Traffic Sensors</div>
              <div class="flow-card-desc">Loop detectors, CCTV feeds, V2X beacons at each junction</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Sensors</span><span class="value">320+ nodes</span></div>
                <div class="data-row"><span class="label">Coverage</span><span class="value">94%</span></div>
                <div class="data-row"><span class="label">Latency</span><span class="value">&lt;50ms</span></div>
              </div>
            </div>
            <div class="flow-card input">
              <div class="flow-card-icon">📊</div>
              <div class="flow-card-title">Historical Data</div>
              <div class="flow-card-desc">5-year congestion patterns, seasonal trends, event calendar</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Records</span><span class="value">12M+</span></div>
                <div class="data-row"><span class="label">Granularity</span><span class="value">5 min</span></div>
                <div class="data-row"><span class="label">Accuracy</span><span class="value">92%</span></div>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flow-arrow">→</div>

          <!-- Processing Column -->
          <div class="flow-column">
            <div class="flow-card process">
              <div class="flow-card-icon">🧠</div>
              <div class="flow-card-title">RL Signal Timing Agent</div>
              <div class="flow-card-desc">Deep Q-Network trained on 500K episodes. Optimizes signal durations to minimize ambulance transit while bounding side-road delays.</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Model</span><span class="value">DQN-v3</span></div>
                <div class="data-row"><span class="label">State Space</span><span class="value">48 dims</span></div>
                <div class="data-row"><span class="label">Inference</span><span class="value">&lt;5ms</span></div>
              </div>
            </div>
            <div class="flow-card process">
              <div class="flow-card-icon">🔗</div>
              <div class="flow-card-title">Graph Flow Predictor</div>
              <div class="flow-card-desc">Graph Neural Network models the road network. Predicts flow propagation and congestion ripple effects.</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Model</span><span class="value">GAT-v2</span></div>
                <div class="data-row"><span class="label">Nodes</span><span class="value">1,200</span></div>
                <div class="data-row"><span class="label">Horizon</span><span class="value">5 min</span></div>
              </div>
            </div>
            <div class="flow-card process" style="border-left-color:var(--signal-amber);">
              <div class="flow-card-icon">🛡️</div>
              <div class="flow-card-title">Safety Monitor</div>
              <div class="flow-card-desc">Rule-based safety layer. Validates all AI decisions against hard constraints before execution.</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Rules</span><span class="value">24 active</span></div>
                <div class="data-row"><span class="label">Override</span><span class="value">Human > AI</span></div>
                <div class="data-row"><span class="label">Fail Mode</span><span class="value">Revert Normal</span></div>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flow-arrow">→</div>

          <!-- Output Column -->
          <div class="flow-column">
            <div class="flow-card output">
              <div class="flow-card-icon">🟢</div>
              <div class="flow-card-title">Signal Commands</div>
              <div class="flow-card-desc">Direct signal state changes sent to junction controllers via secure API</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Protocol</span><span class="value">NTCIP 1202</span></div>
                <div class="data-row"><span class="label">Delivery</span><span class="value">&lt;100ms</span></div>
                <div class="data-row"><span class="label">ACK</span><span class="value">Required</span></div>
              </div>
            </div>
            <div class="flow-card output">
              <div class="flow-card-icon">📱</div>
              <div class="flow-card-title">Driver Alerts</div>
              <div class="flow-card-desc">Push notifications to navigation apps within the emergency corridor</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Channel</span><span class="value">FCM/APNS</span></div>
                <div class="data-row"><span class="label">Radius</span><span class="value">800m</span></div>
                <div class="data-row"><span class="label">Delivery</span><span class="value">&lt;500ms</span></div>
              </div>
            </div>
            <div class="flow-card output">
              <div class="flow-card-icon">📈</div>
              <div class="flow-card-title">Analytics & ETA</div>
              <div class="flow-card-desc">Real-time ETA updates, performance metrics, and post-incident reports</div>
              <div class="flow-card-data">
                <div class="data-row"><span class="label">Dashboard</span><span class="value">Live</span></div>
                <div class="data-row"><span class="label">Reports</span><span class="value">Auto-gen</span></div>
                <div class="data-row"><span class="label">Retention</span><span class="value">90 days</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Decision Safety Rules -->
        <div class="section-header" style="margin-top:var(--sp-2);">
          <span class="section-title">Decision Safety Rules</span>
          <span class="badge badge-amber">24 Active Rules</span>
        </div>

        <div class="safety-grid">
          <div class="safety-card critical">
            <div class="safety-icon">⏱️</div>
            <div class="safety-title">Max Red-Light Duration</div>
            <div class="safety-desc">Side roads cannot be held red for more than this duration, even during emergencies.</div>
            <div class="safety-value">120s</div>
          </div>
          <div class="safety-card critical">
            <div class="safety-icon">🚫</div>
            <div class="safety-title">Auto-Cancel Conditions</div>
            <div class="safety-desc">Emergency mode auto-cancels if ambulance speed drops to 0 for >60s or deviates >500m from route.</div>
            <div class="safety-value">60s / 500m</div>
          </div>
          <div class="safety-card">
            <div class="safety-icon">👤</div>
            <div class="safety-title">Manual Override Priority</div>
            <div class="safety-desc">Human operator commands always override AI decisions. AI resumes only after explicit release.</div>
            <div class="safety-value">HUMAN > AI</div>
          </div>
          <div class="safety-card">
            <div class="safety-icon">🔄</div>
            <div class="safety-title">Fail-Safe Revert</div>
            <div class="safety-desc">On network loss or system error, all signals revert to pre-programmed normal timing within 5s.</div>
            <div class="safety-value">5s revert</div>
          </div>
          <div class="safety-card">
            <div class="safety-icon">🔐</div>
            <div class="safety-title">Authentication Required</div>
            <div class="safety-desc">Only verified ambulances with valid credentials can trigger emergency mode. Multi-factor auth.</div>
            <div class="safety-value">MFA + Cert</div>
          </div>
          <div class="safety-card">
            <div class="safety-icon">🔒</div>
            <div class="safety-title">Data Privacy</div>
            <div class="safety-desc">No personal driver data collected. Positions anonymized. GPS logs auto-purged after 72 hours.</div>
            <div class="safety-value">72h purge</div>
          </div>
        </div>

        <!-- Section: AI Models -->
        <div class="section-header" style="margin-top:var(--sp-2);">
          <span class="section-title">AI Model Details</span>
        </div>

        <div class="model-grid">
          <div class="model-card">
            <div class="model-badge rl">🧠 Reinforcement Learning</div>
            <div class="flow-card-title">Signal Timing Optimizer</div>
            <div class="flow-card-desc" style="margin-bottom:var(--sp-3);">
              Deep Q-Network with experience replay and target networks. Trained in simulation with realistic traffic patterns.
            </div>
            <div class="flow-card-data">
              <div class="data-row"><span class="label">Architecture</span><span class="value">3-layer MLP (256-128-64)</span></div>
              <div class="data-row"><span class="label">Training Episodes</span><span class="value">500,000</span></div>
              <div class="data-row"><span class="label">Reward Signal</span><span class="value">-ambulance_delay + 0.3×side_flow</span></div>
              <div class="data-row"><span class="label">Action Space</span><span class="value">Extend/Reduce/Hold (per junction)</span></div>
              <div class="data-row"><span class="label">State Features</span><span class="value">Queue, speed, ETA, phase, density</span></div>
              <div class="data-row"><span class="label">Update Freq</span><span class="value">Every 5s during emergency</span></div>
            </div>
          </div>
          <div class="model-card">
            <div class="model-badge graph">🔗 Graph Neural Network</div>
            <div class="flow-card-title">Traffic Flow Predictor</div>
            <div class="flow-card-desc" style="margin-bottom:var(--sp-3);">
              Graph Attention Network modeling road network topology. Predicts congestion ripple effects for proactive management.
            </div>
            <div class="flow-card-data">
              <div class="data-row"><span class="label">Architecture</span><span class="value">GAT v2 (4 heads, 3 layers)</span></div>
              <div class="data-row"><span class="label">Graph Nodes</span><span class="value">1,200 intersections</span></div>
              <div class="data-row"><span class="label">Graph Edges</span><span class="value">3,400 road segments</span></div>
              <div class="data-row"><span class="label">Prediction Horizon</span><span class="value">5 minutes</span></div>
              <div class="data-row"><span class="label">Input Features</span><span class="value">Speed, density, signal phase, time</span></div>
              <div class="data-row"><span class="label">MAE</span><span class="value">±4.2 vehicles/segment</span></div>
            </div>
          </div>
        </div>

        <!-- Section: Live Data Feed -->
        <div class="data-feed">
          <div class="feed-header">
            <span class="card-title" style="font-size:var(--fs-sm);">Live System Feed</span>
            <div style="display:flex;gap:var(--sp-2);">
              <span class="badge badge-green"><span class="status-dot green"></span> Connected</span>
            </div>
          </div>
          <div class="feed-body" id="feed-body"></div>
        </div>
      </div>
    `;

        // Start feed simulation
        this.startFeed();
    },

    startFeed() {
        const body = document.getElementById('feed-body');
        if (!body) return;
        let idx = 0;

        const addLine = () => {
            const entry = FEED_ENTRIES[idx % FEED_ENTRIES.length];
            const now = new Date();
            const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const line = document.createElement('div');
            line.className = 'feed-line';
            line.innerHTML = `
        <span class="feed-time">${time}</span>
        <span class="feed-type ${entry.type}">[${entry.type.toUpperCase()}]</span>
        <span class="feed-msg">${entry.msg}</span>
      `;
            body.prepend(line);
            // Keep max 50 lines
            while (body.children.length > 50) body.removeChild(body.lastChild);
            idx++;
        };

        // Initial batch
        for (let i = 0; i < 8; i++) addLine();

        feedInterval = setInterval(addLine, 2000);
    },

    destroy() {
        if (feedInterval) clearInterval(feedInterval);
        feedInterval = null;
    },
};

export default view;
