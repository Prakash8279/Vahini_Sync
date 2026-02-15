import{R as y,H as m,J as f}from"./index-COlKA5z0.js";let o=null,d=null,l=null,v=null,u=null,g=null;function p(e){const n=Math.floor(e/60),t=e%60;return`${String(n).padStart(2,"0")}:${String(t).padStart(2,"0")}`}const x={render(e,n){const t=n.getState();e.innerHTML=`
      <div class="ambulance-view">
        <!-- Emergency Toggle + Quick Stats -->
        <div class="emergency-section">
          <div class="emergency-toggle-wrap">
            <button class="emergency-btn ${t.emergencyActive?"on":"off"}" id="emergency-toggle">
              ${t.emergencyActive?"🚨 ACTIVE":"⚡ ACTIVATE"}
            </button>
            <div>
              <div class="emergency-label">Emergency Response</div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px;" id="emergency-status-text">
                ${t.emergencyActive?"Green corridor is active. Proceed on priority route.":"Tap to activate emergency corridor."}
              </div>
            </div>
          </div>
          <div class="status-row" style="flex:unset;gap:var(--sp-3);">
            <div class="status-card" style="min-width:120px;">
              <div class="status-icon blue">⏱</div>
              <div class="status-info">
                <h4>ETA</h4>
                <div class="value large" id="eta-value">${p(t.ambulance.etaSeconds||480)}</div>
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
            <div class="corridor-badge ${t.emergencyActive?"active":"inactive"}" id="corridor-badge">
              <span class="status-dot ${t.emergencyActive?"green":""}" id="corridor-dot"></span>
              <span id="corridor-text">${t.emergencyActive?"Green Corridor Active":"Corridor Standby"}</span>
            </div>
            <div class="corridor-badge inactive" id="junction-badge" style="display:${t.emergencyActive?"flex":"none"};">
              <span>🔀</span>
              <span id="junction-text">Junctions Cleared: ${t.junctionsCleared}/5</span>
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
              ${Math.round(t.ambulance.speed||0)} km/h
            </span>
          </div>
        </div>
      </div>
    `,setTimeout(()=>this.initMap(n),100),document.getElementById("emergency-toggle").addEventListener("click",()=>{const a=!n.emergencyActive;n.setEmergency(a)}),v=a=>this.onTick(a),u=a=>this.onEmergencyChange(a,n),g=()=>this.onArrived(),n.on("tick",v),n.on("emergency",u),n.on("arrived",g)},initMap(e){const n=document.getElementById("amb-map");if(!n||o)return;o=L.map(n,{center:[28.56,77.23],zoom:13,zoomControl:!1,attributionControl:!1}),L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(o);const t=y.map(i=>[i.lat,i.lng]);l=L.polyline(t,{color:"#3b82f6",weight:4,opacity:.6,dashArray:"10 6"}).addTo(o);const a=L.divIcon({html:'<div style="font-size:24px;text-align:center;">🏥</div>',iconSize:[32,32],className:""});L.marker([m.lat,m.lng],{icon:a}).addTo(o),f.forEach(i=>{const c=L.divIcon({html:'<div style="width:12px;height:12px;border-radius:50%;background:var(--signal-amber);border:2px solid #fff;box-shadow:0 0 6px rgba(245,158,11,0.5);"></div>',iconSize:[12,12],className:""});L.marker([i.lat,i.lng],{icon:c}).addTo(o).bindTooltip(i.name,{direction:"top",offset:[0,-8],className:"junction-tooltip"})});const r=L.divIcon({html:'<div style="font-size:28px;filter:drop-shadow(0 0 8px rgba(220,38,38,0.6));">🚑</div>',iconSize:[32,32],className:""}),s=e.getState();d=L.marker([s.ambulance.lat,s.ambulance.lng],{icon:r}).addTo(o),o.fitBounds(l.getBounds(),{padding:[40,40]})},onTick(e){d&&d.setLatLng([e.ambulance.lat,e.ambulance.lng]);const n=document.getElementById("eta-value");n&&(n.textContent=p(e.ambulance.etaSeconds));const t=document.getElementById("speed-value");t&&(t.textContent=`${Math.round(e.ambulance.speed)} km/h`);const a=document.getElementById("junction-text");a&&(a.textContent=`Junctions Cleared: ${e.junctionsCleared}/5`),o&&e.ambulance.lat&&o.panTo([e.ambulance.lat,e.ambulance.lng],{animate:!0,duration:.5})},onEmergencyChange(e,n){const t=document.getElementById("emergency-toggle"),a=document.getElementById("emergency-status-text"),r=document.getElementById("corridor-badge"),s=document.getElementById("corridor-dot"),i=document.getElementById("corridor-text"),c=document.getElementById("junction-badge");t&&(t.className=`emergency-btn ${e.active?"on":"off"}`,t.innerHTML=e.active?"🚨 ACTIVE":"⚡ ACTIVATE"),a&&(a.textContent=e.active?"Green corridor is active. Proceed on priority route.":"Tap to activate emergency corridor."),r&&(r.className=`corridor-badge ${e.active?"active":"inactive"}`),s&&(s.className=`status-dot ${e.active?"green":""}`),i&&(i.textContent=e.active?"Green Corridor Active":"Corridor Standby"),c&&(c.style.display=e.active?"flex":"none")},onArrived(){const e=document.getElementById("eta-value");e&&(e.textContent="00:00");const n=document.getElementById("emergency-status-text");n&&(n.textContent="✅ Arrived at hospital. Emergency concluded.");const t=document.getElementById("corridor-text");t&&(t.textContent="Arrived at Destination")},destroy(){o&&(o.remove(),o=null),d=null,l=null}};export{x as default};
