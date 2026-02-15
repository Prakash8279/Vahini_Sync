import{R as r,J as m,H as b,A as h}from"./index-COlKA5z0.js";let n=null,v=null,p=null,u=[],g={},f=null;const x={render(a,s){var d,t,i,o;const l=s.getState();a.innerHTML=`
      <div class="dashboard-view">
        <!-- KPI Row -->
        <div class="dashboard-kpi-row">
          <div class="dashboard-kpi">
            <div class="kpi-icon">🚨</div>
            <div class="kpi-val" id="kpi-active">${l.emergencyActive?"1":"0"}</div>
            <div class="kpi-lbl">Active Emergencies</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">⏱️</div>
            <div class="kpi-val" id="kpi-eta">${l.ambulance.etaSeconds?Math.ceil(l.ambulance.etaSeconds/60)+"m":"--"}</div>
            <div class="kpi-lbl">Est. Response Time</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">🟢</div>
            <div class="kpi-val" id="kpi-cleared">${l.junctionsCleared}</div>
            <div class="kpi-lbl">Junctions Cleared</div>
          </div>
          <div class="dashboard-kpi">
            <div class="kpi-icon">⚡</div>
            <div class="kpi-val" id="kpi-saved">${l.totalTimeSaved}s</div>
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
                  ${l.isRunning?"⏸ Pause":"▶ Resume"}
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
                ${m.map(e=>{const c=l.signals[e.id];return`
                  <div class="signal-item" id="sig-item-${e.id}">
                    <div class="signal-item-left">
                      <div class="signal-light ${c.mainState}" id="sig-light-${e.id}">${c.countdown}</div>
                      <div>
                        <div class="signal-name">${e.name}</div>
                        <div class="signal-sub" id="sig-sub-${e.id}">${c.overridden?"⚡ AI Override":"Normal Cycle"}</div>
                      </div>
                    </div>
                    <div>
                      ${c.greenWaveActive?'<span class="badge badge-green">🟢 Wave</span>':""}
                      ${c.cleared?'<span class="badge badge-green">✓ Cleared</span>':""}
                    </div>
                  </div>`}).join("")}
              </div>
            </div>

            <!-- AI Decisions -->
            <div class="card" style="padding:var(--sp-3) var(--sp-4);">
              <div class="card-header" style="margin-bottom:var(--sp-3);">
                <span class="card-title">AI Decisions</span>
                <span class="badge badge-blue">Predictive</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:var(--sp-2);" id="ai-decisions">
                ${h.map(e=>`
                  <div class="ai-decision-item" id="ai-dec-${e.junction}">
                    <div class="decision-header">
                      <span class="decision-action">${e.junction}: ${e.action}</span>
                      <div class="badge badge-green">${e.confidence}%</div>
                    </div>
                    <div class="decision-reason">${e.reason}</div>
                    <div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-1);">
                      <span style="font-size:var(--fs-xs);color:var(--signal-green);">⏱ ${e.timeSaved}s saved</span>
                      <div class="confidence-bar"><div class="confidence-fill" style="width:${e.confidence}%;"></div></div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,setTimeout(()=>this.initMap(s),100),(d=document.getElementById("dash-ai-toggle"))==null||d.addEventListener("click",()=>{s.isRunning?s.stop():s.start();const e=document.getElementById("dash-ai-toggle");e&&(e.innerHTML=s.isRunning?"⏸ Pause":"▶ Resume")}),(t=document.getElementById("speed-1x"))==null||t.addEventListener("click",()=>s.setSpeed(1)),(i=document.getElementById("speed-2x"))==null||i.addEventListener("click",()=>s.setSpeed(2)),(o=document.getElementById("speed-4x"))==null||o.addEventListener("click",()=>s.setSpeed(4)),f=e=>this.onTick(e),s.on("tick",f)},initMap(a){const s=document.getElementById("dash-map");if(!s||n)return;n=L.map(s,{center:[28.56,77.23],zoom:13,zoomControl:!0,attributionControl:!1}),L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(n);const l=r.map(i=>[i.lat,i.lng]);L.polyline(l,{color:"#3b82f6",weight:3,opacity:.4,dashArray:"8 5"}).addTo(n),L.marker([b.lat,b.lng],{icon:L.divIcon({html:'<div style="font-size:22px;">🏥</div>',iconSize:[28,28],className:""})}).addTo(n),m.forEach(i=>{const e=a.getState().signals[i.id],c=e.mainState==="green"?"#22c55e":e.mainState==="amber"?"#f59e0b":"#ef4444",y=L.circleMarker([i.lat,i.lng],{radius:8,fillColor:c,fillOpacity:.8,color:"#fff",weight:2}).addTo(n).bindTooltip(i.name,{direction:"top"});g[i.id]=y}),[{lat:28.55,lng:77.252,intensity:.9},{lat:28.555,lng:77.247,intensity:.7},{lat:28.562,lng:77.238,intensity:.85},{lat:28.57,lng:77.225,intensity:.6},{lat:28.578,lng:77.204,intensity:.75}].forEach(i=>{const o=L.circle([i.lat,i.lng],{radius:300,fillColor:`rgba(239, 68, 68, ${i.intensity*.3})`,fillOpacity:i.intensity*.3,color:"transparent",weight:0}).addTo(n);u.push(o)});const t=a.getState();v=L.marker([t.ambulance.lat,t.ambulance.lng],{icon:L.divIcon({html:'<div style="font-size:24px;filter:drop-shadow(0 0 8px rgba(220,38,38,0.6));">🚑</div>',iconSize:[28,28],className:""})}).addTo(n),p=L.polyline([],{color:"#22c55e",weight:5,opacity:.7}).addTo(n),n.fitBounds(L.polyline(l).getBounds(),{padding:[30,30]})},onTick(a){const s=(d,t)=>{const i=document.getElementById(d);i&&(i.textContent=t)};s("kpi-active",a.emergencyActive?"1":"0"),s("kpi-eta",a.ambulance.etaSeconds?Math.ceil(a.ambulance.etaSeconds/60)+"m":"--"),s("kpi-cleared",a.junctionsCleared),s("kpi-saved",a.totalTimeSaved+"s");const l=88+Math.floor(Math.random()*10);if(s("kpi-confidence",l+"%"),v&&v.setLatLng([a.ambulance.lat,a.ambulance.lng]),p&&a.emergencyActive){const d=Math.floor(a.routeProgress*(r.length-1)),t=r.slice(Math.max(0,d-1),Math.min(d+6,r.length));p.setLatLngs(t.map(i=>[i.lat,i.lng]))}m.forEach(d=>{const t=a.signals[d.id],i=document.getElementById(`sig-light-${d.id}`);i&&(i.className=`signal-light ${t.mainState}`,i.textContent=t.countdown);const o=document.getElementById(`sig-sub-${d.id}`);if(o&&(o.textContent=t.overridden?"⚡ AI Override":"Normal Cycle"),g[d.id]){const e=t.mainState==="green"?"#22c55e":t.mainState==="amber"?"#f59e0b":"#ef4444";g[d.id].setStyle({fillColor:e})}})},destroy(){n&&(n.remove(),n=null),v=null,p=null,u=[],g={}}};export{x as default};
