import{_ as S,J as D,S as R,A as w}from"./index-COlKA5z0.js";let f=null,p=null;const o=D.map((a,t)=>({...a,decision:w[t],impact:R[t],normalDelay:35+Math.floor(Math.random()*25),emergencyDelay:5+Math.floor(Math.random()*8)})),B={render(a,t){var d;let c=0,e=!1,i=0;a.innerHTML=`
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
              ${o.map((l,s)=>`
                <div class="junction-timeline-item pending" id="jtl-${s}">
                  <div class="jtl-icon pending" id="jtl-icon-${s}">
                    ${s+1}
                  </div>
                  <div class="jtl-content">
                    <div class="jtl-name">${l.name}</div>
                    <div class="jtl-stats">
                      <div class="jtl-stat">
                        ⏱ Normal: <span style="margin-left:2px;">${l.normalDelay}s delay</span>
                      </div>
                      <div class="jtl-stat">
                        ⚡ Optimized: <span class="positive" id="jtl-saved-${s}">--</span>
                      </div>
                      <div class="jtl-stat">
                        📊 Side Impact: <span id="jtl-impact-${s}">--</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join("")}
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
                  ${o.map((l,s)=>`
                    <tr id="cmp-row-${s}">
                      <td style="font-weight:var(--fw-medium);">${l.name}</td>
                      <td>${l.normalDelay}s</td>
                      <td class="improved" id="cmp-opt-${s}">--</td>
                      <td class="improved" id="cmp-saved-${s}">--</td>
                      <td id="cmp-impact-${s}">--</td>
                    </tr>
                  `).join("")}
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
    `,(d=document.getElementById("pilot-start-btn"))==null||d.addEventListener("click",()=>{if(e)return;e=!0,i=0,c=0;const l=document.getElementById("pilot-start-btn");l&&(l.textContent="⏳ Running...",l.disabled=!0);const s=document.getElementById("pilot-status-badge");s&&(s.className="badge badge-amber",s.textContent="Running"),t.emergencyActive||t.setEmergency(!0),t.isRunning||t.start(),f=setInterval(()=>{if(i>=5){clearInterval(f),e=!1,this.showFinalResults(l,s);return}i++,c=i/5*100;const v=document.getElementById("timeline-fill"),u=document.getElementById("timeline-pct");v&&(v.style.width=c+"%"),u&&(u.textContent=Math.round(c)+"%");const m=i-1,y=o[m],b=document.getElementById(`jtl-${m}`),g=document.getElementById(`jtl-icon-${m}`);if(b&&(b.className="junction-timeline-item completed"),g&&(g.className="jtl-icon completed",g.textContent="✓"),i<5){const k=document.getElementById(`jtl-${i}`),j=document.getElementById(`jtl-icon-${i}`);k&&(k.className="junction-timeline-item active"),j&&(j.className="jtl-icon active")}const h=y.decision.timeSaved,I=document.getElementById(`jtl-saved-${m}`);I&&(I.textContent=`${y.emergencyDelay}s (-${h}s)`);const $=document.getElementById(`jtl-impact-${m}`);$&&($.textContent=`+${y.impact.additionalDelay}s`);const C=document.getElementById(`cmp-opt-${m}`);C&&(C.textContent=`${y.emergencyDelay}s`);const E=document.getElementById(`cmp-saved-${m}`);E&&(E.textContent=`-${h}s`);const x=document.getElementById(`cmp-impact-${m}`);x&&(x.textContent=`+${y.impact.additionalDelay}s`),this.updateTotals(i)},2500);const r=document.getElementById("jtl-0"),n=document.getElementById("jtl-icon-0");r&&(r.className="junction-timeline-item active"),n&&(n.className="jtl-icon active")})},updateTotals(a){let t=0,c=0,e=0,i=0;for(let n=0;n<a;n++)t+=o[n].normalDelay,c+=o[n].emergencyDelay,e+=o[n].decision.timeSaved,i+=o[n].impact.additionalDelay;const d=(n,v)=>{const u=document.getElementById(n);u&&(u.textContent=v)};d("cmp-total-normal",t+"s"),d("cmp-total-opt",c+"s"),d("cmp-total-saved",`-${e}s`),d("cmp-total-impact",`+${i}s`),d("res-time-saved",`${e}s`);const l=Math.floor((870-e)/60),s=(870-e)%60;d("res-transit",`${l}m ${s}s`);const r=Math.round(e/t*100);d("res-reduction",`${r}%`),d("res-side-impact",`+${Math.round(i/a)}s`)},showFinalResults(a,t){t&&(t.className="badge badge-green",t.textContent="Complete"),a&&(a.textContent="✅ Complete",a.style.background="var(--signal-green)"),this.drawChart()},drawChart(){const a=document.getElementById("impact-canvas");if(a)try{S(async()=>{const{default:t}=await import("./auto-CpL4W96M.js");return{default:t}},[]).then(({default:t})=>{p&&p.destroy();const c=a.getContext("2d");p=new t(c,{type:"bar",data:{labels:o.map(e=>e.id),datasets:[{label:"Normal Delay (s)",data:o.map(e=>e.normalDelay),backgroundColor:"rgba(239, 68, 68, 0.6)",borderColor:"#ef4444",borderWidth:1,borderRadius:4},{label:"With Vahini-Sync (s)",data:o.map(e=>e.emergencyDelay),backgroundColor:"rgba(34, 197, 94, 0.6)",borderColor:"#22c55e",borderWidth:1,borderRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:"#8fa3bf",font:{family:"Inter",size:11}}}},scales:{x:{ticks:{color:"#5b7191",font:{family:"Inter",size:11}},grid:{color:"rgba(255,255,255,0.04)"}},y:{ticks:{color:"#5b7191",font:{family:"Inter",size:11}},grid:{color:"rgba(255,255,255,0.04)"},title:{display:!0,text:"Delay (seconds)",color:"#5b7191",font:{family:"Inter",size:11}}}}}})}).catch(()=>{this.drawFallbackChart(a)})}catch{this.drawFallbackChart(a)}},drawFallbackChart(a){const t=a.getContext("2d"),c=a.width=a.parentElement.clientWidth-32,e=a.height=160;t.clearRect(0,0,c,e);const i=c/12,d=60;o.forEach((l,s)=>{const r=s*(i*2.2)+20,n=l.normalDelay/d*(e-30);t.fillStyle="rgba(239, 68, 68, 0.6)",t.fillRect(r,e-20-n,i-2,n);const v=l.emergencyDelay/d*(e-30);t.fillStyle="rgba(34, 197, 94, 0.6)",t.fillRect(r+i,e-20-v,i-2,v),t.fillStyle="#5b7191",t.font="10px Inter",t.textAlign="center",t.fillText(l.id,r+i,e-5)})},destroy(){f&&clearInterval(f),f=null,p&&(p.destroy(),p=null)}};export{B as default};
