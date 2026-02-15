let t=0,s=null;const r=[{title:"Detection",desc:"Vahini-Sync detects ambulance on emergency route. Nearby drivers within 800m radius are identified via cell-tower mapping.",detail:["Range: 800m","Method: Cell-tower + GPS","Latency: <200ms"],active:!1},{title:"Initial Alert",desc:'Navigation apps push an overlay alert: "🚑 Ambulance approaching. Keep left." No app installation needed — works via Google/Apple Maps integration.',detail:["Channel: Push overlay","Format: Visual + Audio","Dismissible: Yes"],active:!0},{title:"Lane Guidance",desc:"Directional arrows guide drivers to clear the ambulance lane. Lane assignment is dynamic based on traffic density.",detail:["Direction: Left/Right","Adaptive: Yes","Coverage: 500m corridor"],active:!1},{title:"Alternate Route",desc:"Drivers on blocked routes get a suggested alternate route with estimated time difference. Soft redirect — not forced.",detail:["Type: Suggestion","Time delta: +2-4 min","Compliance: ~72%"],active:!1},{title:"All Clear",desc:'After ambulance passes, drivers receive "✅ Resume normal driving" notification. Signal timing reverts to normal cycle.',detail:["Auto-clear: 15s","Signal reset: Gradual","Traffic recovery: ~90s"],active:!1}],o={render(i,a){var e;t=0,a.getState(),i.innerHTML=`
      <div class="driver-view">
        <!-- Phone Mockup -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>18:07</span>
              <span style="font-weight:600;">Google Maps</span>
              <span>📶 4G</span>
            </div>

            <div class="phone-nav" id="phone-nav">
              <!-- Simulated map background -->
              <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0c1524 0%,#132344 100%);"></div>

              <!-- Road grid -->
              <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.3;" viewBox="0 0 300 500">
                <line x1="150" y1="0" x2="150" y2="500" stroke="#2a4a6b" stroke-width="30"/>
                <line x1="0" y1="250" x2="300" y2="250" stroke="#2a4a6b" stroke-width="20"/>
                <line x1="0" y1="150" x2="300" y2="150" stroke="#1e3a5c" stroke-width="12"/>
                <line x1="80" y1="0" x2="80" y2="500" stroke="#1e3a5c" stroke-width="10"/>
                <!-- Route highlight -->
                <line x1="150" y1="500" x2="150" y2="100" stroke="#3b82f6" stroke-width="5" stroke-dasharray="10 5"/>
                <circle cx="150" cy="100" r="8" fill="#3b82f6"/>
                <text x="170" y="105" fill="#3b82f6" font-size="10" font-family="Inter">Dest.</text>
              </svg>

              <!-- Nav overlay -->
              <div class="nav-route-overlay">
                <div class="nav-eta-box">
                  <div class="eta-time">12 min</div>
                  <div class="eta-dist">4.2 km — via Ring Road</div>
                </div>

                <!-- Alert area -->
                <div id="alert-area"></div>
              </div>
            </div>

            <!-- Bottom bar -->
            <div class="phone-bottom">
              <div class="signal-countdown-visual" id="signal-countdown">
                <div class="countdown-dot" id="countdown-dot" style="background:var(--signal-green);"></div>
                <span class="countdown-text" id="countdown-text" style="color:var(--signal-green);">32s</span>
              </div>
              <span style="font-size:var(--fs-xs);color:var(--text-muted);">Next Signal</span>
              <div style="margin-left:auto;display:flex;gap:4px;">
                <div style="width:20px;height:20px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;font-size:10px;">🔊</div>
                <div style="width:20px;height:20px;border-radius:50%;background:var(--bg-surface);display:flex;align-items:center;justify-content:center;font-size:10px;">⚙️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flow Description -->
        <div class="driver-flow">
          <div class="section-header">
            <span class="section-title">Driver Notification Flow</span>
            <button class="btn btn-primary" id="driver-play-btn" style="font-size:var(--fs-xs);">
              ▶ Play Sequence
            </button>
          </div>

          <div id="flow-steps">
            ${r.map((n,l)=>`
              <div class="flow-step ${n.active?"active":""}" id="flow-step-${l}">
                <div class="flow-step-number">${l+1}</div>
                <div class="flow-step-content">
                  <h3>${n.title}</h3>
                  <p>${n.desc}</p>
                  <div class="flow-detail">
                    ${n.detail.map(d=>`<span>${d}</span>`).join("")}
                  </div>
                  ${l===2?`
                  <div class="lane-guide">
                    <div class="lane clear">←</div>
                    <div class="lane clear">←</div>
                    <div class="lane occupied">🚗</div>
                    <div class="lane ambulance">🚑</div>
                  </div>`:""}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Key Facts -->
          <div class="card" style="padding:var(--sp-3) var(--sp-4);">
            <div class="card-title" style="font-size:var(--fs-sm);margin-bottom:var(--sp-2);">Design Principles</div>
            <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-xs);color:var(--text-secondary);">
                <span style="color:var(--signal-green);">✓</span> No new app required — works through existing navigation apps
              </div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-xs);color:var(--text-secondary);">
                <span style="color:var(--signal-green);">✓</span> Soft redirection — system works even if some drivers ignore alerts
              </div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-xs);color:var(--text-secondary);">
                <span style="color:var(--signal-green);">✓</span> Privacy-first — no personal data collected, only anonymized positions
              </div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-xs);color:var(--text-secondary);">
                <span style="color:var(--signal-green);">✓</span> Fail-safe — signals revert to normal if system loses connectivity
              </div>
            </div>
          </div>
        </div>
      </div>
    `,(e=document.getElementById("driver-play-btn"))==null||e.addEventListener("click",()=>{this.playSequence()})},playSequence(){t=0,s&&clearInterval(s),s=setInterval(()=>{t++,this.updatePhase(),t>=5&&(clearInterval(s),s=null)},3e3),this.updatePhase()},updatePhase(){const i=document.getElementById("alert-area");if(i){if(r.forEach((a,e)=>{const n=document.getElementById(`flow-step-${e}`);n&&n.classList.toggle("active",e===t)}),t===0)i.innerHTML="";else if(t===1)i.innerHTML=`
        <div class="phone-alert warning">
          <div class="alert-icon">🚑</div>
          <div class="alert-title">Emergency Vehicle Approaching</div>
          <div class="alert-text">Ambulance is 800m behind you. Prepare to move left.</div>
        </div>
      `;else if(t===2){i.innerHTML=`
        <div class="phone-alert warning">
          <div class="alert-icon">⬅️</div>
          <div class="alert-title">Move to Left Lane NOW</div>
          <div class="alert-text">Ambulance 200m away. Clear right lane immediately.</div>
        </div>
      `;const a=document.getElementById("countdown-dot"),e=document.getElementById("countdown-text");a&&(a.style.background="var(--signal-red)"),e&&(e.style.color="var(--signal-red)",e.textContent="8s")}else if(t===3)i.innerHTML=`
        <div class="phone-alert reroute">
          <div class="alert-icon">🔀</div>
          <div class="alert-title">Alternate Route Available</div>
          <div class="alert-text">Via Lodhi Road — adds 3 min. Less congestion ahead.</div>
          <div class="alert-action">
            <button class="btn btn-primary" style="font-size:var(--fs-xs);padding:4px 12px;">Accept Route</button>
            <button class="btn btn-ghost" style="font-size:var(--fs-xs);padding:4px 12px;">Dismiss</button>
          </div>
        </div>
      `;else if(t===4){i.innerHTML=`
        <div class="phone-alert cleared">
          <div class="alert-icon">✅</div>
          <div class="alert-title">All Clear</div>
          <div class="alert-text">Emergency vehicle has passed. Resume normal driving.</div>
        </div>
      `;const a=document.getElementById("countdown-dot"),e=document.getElementById("countdown-text");a&&(a.style.background="var(--signal-green)"),e&&(e.style.color="var(--signal-green)",e.textContent="32s")}}},destroy(){s&&clearInterval(s),s=null}};export{o as default};
