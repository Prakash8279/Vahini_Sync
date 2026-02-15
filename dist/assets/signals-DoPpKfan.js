import{J as p,A as x}from"./index-COlKA5z0.js";let o,e,m=null,u=null,g=null;const $={render(d,a){var s;g=a;const n=a.getState();d.innerHTML=`
      <div class="signals-view">
        <!-- Top Controls -->
        <div class="signals-top">
          <span class="section-title" style="margin:0;">Corridor: Ring Road — 5 Junctions</span>
          <div class="signals-mode-badge ${n.emergencyActive?"badge-red":"badge-blue"}" id="sig-mode-badge">
            ${n.emergencyActive?"🚨 EMERGENCY MODE":"🔵 NORMAL MODE"}
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
            ${p.map((i,c)=>{const t=n.signals[i.id],v=x[c],l=40+Math.random()*50,r=l>70?"high":l>40?"medium":"low";return`
              <div class="junction-card" id="jcard-${i.id}">
                <div class="junction-header">
                  <span class="junction-name">${i.name}</span>
                  <span class="badge ${t.overridden?"badge-amber":"badge-blue"}" id="jbadge-${i.id}">
                    ${t.overridden?"Override":"Auto"}
                  </span>
                </div>
                <div class="junction-signals" id="jsigs-${i.id}">
                  <div class="mini-signal">
                    <div class="mini-light ${t.mainState==="green"?"green":"off"}"></div>
                    Main
                  </div>
                  <div class="mini-signal">
                    <div class="mini-light ${t.mainState==="amber"?"amber":"off"}"></div>
                    Amber
                  </div>
                  <div class="mini-signal">
                    <div class="mini-light ${t.mainState==="red"?"red":"off"}"></div>
                    Stop
                  </div>
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);margin-left:auto;font-family:var(--font-mono);" id="jcount-${i.id}">
                    ${t.countdown}s
                  </span>
                </div>
                <div class="congestion-meter">
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);width:50px;">Side Rd</span>
                  <div class="congestion-bar">
                    <div class="congestion-fill ${r}" style="width:${l}%;" id="jcong-${i.id}"></div>
                  </div>
                  <span style="font-size:var(--fs-xs);color:var(--text-muted);" id="jcongtext-${i.id}">${Math.round(l)}%</span>
                </div>
                ${v?`
                <div class="ai-logic-box" style="margin-top:var(--sp-2);">
                  <div class="logic-title">🧠 AI Decision</div>
                  <div class="logic-row"><span>Action:</span><span class="logic-val">${v.action}</span></div>
                  <div class="logic-row"><span>Predicted Save:</span><span class="logic-val" style="color:var(--signal-green);">${v.timeSaved}s</span></div>
                  <div class="logic-row"><span>Confidence:</span><span class="logic-val">${v.confidence}%</span></div>
                </div>`:""}
              </div>`}).join("")}
          </div>
        </div>
      </div>
    `,(s=document.getElementById("sig-toggle-mode"))==null||s.addEventListener("click",()=>{a.setEmergency(!a.emergencyActive),a.isRunning||a.start()}),setTimeout(()=>this.initCanvas(a),100),u=i=>this.onTick(i),a.on("tick",u)},initCanvas(d){if(o=document.getElementById("signals-canvas"),!o)return;const a=o.parentElement;o.width=a.clientWidth,o.height=a.clientHeight,e=o.getContext("2d"),this.drawFrame(d.getState())},drawFrame(d){if(!e||!o)return;const a=o.width,n=o.height;e.clearRect(0,0,a,n),e.fillStyle="#0a1628",e.fillRect(0,0,a,n);const s=n/2,i=50;e.fillStyle="#1a2a44",e.fillRect(0,s-i/2,a,i),e.setLineDash([20,15]),e.strokeStyle="#f59e0b55",e.lineWidth=2,e.beginPath(),e.moveTo(0,s),e.lineTo(a,s),e.stroke(),e.setLineDash([]);const c=a/6;if(p.forEach((t,v)=>{const l=c*(v+1),r=d.signals[t.id];e.fillStyle="#1a2a44",e.fillRect(l-20,0,40,n),e.fillStyle="#0f1f3a",e.fillRect(l-25,s-i/2-5,50,i+10);const b=r.mainState==="green"?"#22c55e":r.mainState==="amber"?"#f59e0b":"#ef4444",y=r.sideState==="green"?"#22c55e":"#ef4444";e.beginPath(),e.arc(l,s-i/2-15,8,0,Math.PI*2),e.fillStyle=b,e.fill(),e.shadowColor=b,e.shadowBlur=12,e.fill(),e.shadowBlur=0,e.beginPath(),e.arc(l+30,s,6,0,Math.PI*2),e.fillStyle=y,e.fill(),e.fillStyle="#8fa3bf",e.font="10px Inter, sans-serif",e.textAlign="center",e.fillText(t.id,l,s+i/2+30),e.fillText(r.countdown+"s",l,s-i/2-28),r.greenWaveActive&&(e.fillStyle="rgba(34, 197, 94, 0.08)",e.fillRect(l-35,s-i/2-10,70,i+20),e.strokeStyle="#22c55e",e.lineWidth=2,e.strokeRect(l-35,s-i/2-10,70,i+20)),r.cleared&&(e.fillStyle="#22c55e",e.font="bold 16px Inter, sans-serif",e.fillText("✓",l,s+i/2+48));const h=r.overridden?6:3;for(let f=0;f<h;f++)e.fillStyle="#4a6fa5",e.fillRect(l-7,s-i/2-40-f*18,14,10)}),d.emergencyActive||d.isRunning){const t=d.routeProgress*(a-c)+c/2;e.beginPath(),e.arc(t,s-5,18,0,Math.PI*2),e.fillStyle="rgba(220, 38, 38, 0.15)",e.fill(),e.fillStyle="#dc2626",e.fillRect(t-12,s-12,24,10),e.fillStyle="#ffffff",e.font="bold 8px Inter, sans-serif",e.textAlign="center",e.fillText("AMB",t,s-5);const v=Math.min(t+120,a);e.fillStyle="rgba(34, 197, 94, 0.06)",e.fillRect(t+12,s-i/2,v-t-12,i)}e.fillStyle="#5b7191",e.font="9px Inter, sans-serif",e.textAlign="left",e.fillText("← 0 km",10,n-10),e.textAlign="right",e.fillText("8.5 km →",a-10,n-10),m=requestAnimationFrame(()=>this.drawFrame((g==null?void 0:g.getState())||d))},onTick(d){const a=document.getElementById("sig-mode-badge");a&&(a.className=`signals-mode-badge ${d.emergencyActive?"badge-red":"badge-blue"}`,a.textContent=d.emergencyActive?"🚨 EMERGENCY MODE":"🔵 NORMAL MODE"),p.forEach(n=>{const s=d.signals[n.id],i=document.getElementById(`jcount-${n.id}`);i&&(i.textContent=s.countdown+"s");const c=document.getElementById(`jbadge-${n.id}`);c&&(c.className=`badge ${s.overridden?"badge-amber":"badge-blue"}`,c.textContent=s.overridden?"Override":"Auto")})},destroy(){m&&cancelAnimationFrame(m),m=null,o=null,e=null,g=null}};export{$ as default};
