import {
  buildWaterDefsSvg,
  renderValveSvg,
  renderPressureGaugeSvg,
  renderWaterwheelSvg,
  renderDuckTankSvg,
  renderFlowerBedSvg,
  VALVE_STAGES,
  getRotatedPorts
} from './water-lab-assets.js';

export default class WaterLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'valve'; // 'valve' | 'pipe'
    this.stageIdx = 0;

    this.pumpOn = true;
    this.valves = [];
    this.valveSpins = {};
    this.stageCleared = false;

    this.flowOffset = 0;
    this.pressure = 0.2;
    this.wheelAngle = 0;
    this.tankFill = 0;
    this.flowerBloom = 0;

    // 5x4 Pipe Grid
    this.gridCols = 5;
    this.gridRows = 4;
    this.grid = [];
    this.paintTool = 'rotate'; // 'rotate' | 'straight' | 'elbow' | 'tee' | 'cross'
    this.pipeCleared = false;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#E0F2FE');
    }
    this.injectStyles();
    this.renderShell();
    this.loadValveStage();
    this.initPipeGrid();
    this.renderScene();
    this.ensureLoop();
  }

  onPause() {
    this.paused = true;
    this.stopLoop();
  }

  onResume() {
    this.paused = false;
    this.ensureLoop();
  }

  unmount() {
    this.destroyed = true;
    this.stopLoop();
    if (this.mountEl) this.mountEl.innerHTML = '';
  }

  injectStyles() {
    const old = document.getElementById('wl-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'wl-styles';
    style.textContent = `
      .wl-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #E0F2FE; color: #1E293B; user-select: none; -webkit-user-select: none;
        padding: 8px 10px 10px; box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .wl-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 42px;
      }
      .wl-modes {
        display: flex; gap: 5px; background: #FFFFFF; padding: 4px;
        border-radius: 16px; border: 3px solid #1E293B; box-shadow: 0 3px 0 #1E293B;
      }
      .wl-mode-btn {
        border: none; border-radius: 11px; padding: 6px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #475569; cursor: pointer; font-family: inherit;
      }
      .wl-mode-btn.active { background: #0EA5E9; color: #FFFFFF; box-shadow: inset 0 -3px 0 #0369A1; }

      .wl-status {
        display: flex; align-items: center; gap: 10px; background: #FFFFFF;
        border: 3px solid #1E293B; border-radius: 16px; padding: 4px 12px;
        box-shadow: 0 3px 0 #1E293B;
      }
      .wl-hint { font-size: 14px; font-weight: 900; color: #1E293B; }

      .wl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        border-radius: 22px; border: 4px solid #1E293B; box-shadow: 0 6px 0 rgba(30,41,59,0.2);
        overflow: hidden; background: #F0F9FF;
      }
      .wl-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .wl-root { padding: 6px; gap: 5px; }
        .wl-topbar { padding-left: 44px; padding-right: 44px; }
        .wl-mode-btn { padding: 5px 10px; font-size: 12px; }
        .wl-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="wl-root">
        <div class="wl-topbar">
          <div class="wl-modes">
            <button class="wl-mode-btn active" data-mode="valve" type="button">バルブ パズル</button>
            <button class="wl-mode-btn" data-mode="pipe" type="button">パイプ くみたて</button>
          </div>
          <div class="wl-status">
            <span class="wl-hint" id="wl-hint">あかい バルブを タップして ひらこう！</span>
          </div>
        </div>

        <div class="wl-stage-wrap">
          <svg class="wl-svg" id="wl-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildWaterDefsSvg()}
            <g id="wl-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#wl-svg');
    this.sceneEl = this.mountEl.querySelector('#wl-scene');
    this.hintEl = this.mountEl.querySelector('#wl-hint');

    this.mountEl.querySelectorAll('.wl-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.mountEl.querySelectorAll('.wl-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        if (m === 'valve') {
          this.loadValveStage();
        } else {
          this.tankFill = 0;
          this.flowerBloom = 0;
          this.hintEl.textContent = 'パイプを タップして まわし、みずぐるま と あひる に つなごう！';
        }
        this.renderScene();
      });
    });

    // 100% Direct Diegetic SVG Clicks
    this.svgEl.addEventListener('pointerdown', (e) => {
      const nextEl = e.target.closest('[data-next-stage]');
      if (nextEl) {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        this.stageIdx++;
        this.loadValveStage();
        return;
      }
      const valveEl = e.target.closest('[data-valve]');
      if (valveEl) {
        e.preventDefault();
        this.sound.unlock();
        this.toggleValve(valveEl.dataset.valve);
        return;
      }
      const pumpEl = e.target.closest('[data-pump]');
      if (pumpEl) {
        e.preventDefault();
        this.sound.unlock();
        this.togglePump();
        return;
      }
      const toolEl = e.target.closest('[data-pipe-tool]');
      if (toolEl) {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const t = toolEl.dataset.pipeTool;
        if (t === 'reset') {
          this.initPipeGrid();
        } else {
          this.paintTool = t;
        }
        this.renderScene();
        return;
      }
      const tileEl = e.target.closest('[data-cell]');
      if (tileEl) {
        e.preventDefault();
        this.sound.unlock();
        const [c, r] = tileEl.dataset.cell.split(',').map(Number);
        this.clickPipeCell(c, r);
      }
    });
  }

  loadValveStage() {
    const st = VALVE_STAGES[this.stageIdx % VALVE_STAGES.length];
    this.pumpOn = true;
    this.stageCleared = false;
    this.tankFill = 0;
    this.flowerBloom = 0;
    this.valves = st.valves.map((v) => ({ ...v }));
    this.valveSpins = {};
    this.valves.forEach((v) => { this.valveSpins[v.id] = v.open ? 180 : 0; });
    this.hintEl.textContent = st.hint;
    this.renderScene();
  }

  initPipeGrid() {
    const preset = [
      ['elbow',    'straight', 'tee',      'straight', 'straight'],
      ['tee',      'elbow',    'straight', 'elbow',    'tee'],
      ['elbow',    'tee',      'elbow',    'straight', 'straight'],
      ['straight', 'elbow',    'straight', 'elbow',    'straight']
    ];
    this.grid = [];
    for (let r = 0; r < this.gridRows; r++) {
      const row = [];
      for (let c = 0; c < this.gridCols; c++) {
        row.push({ type: preset[r][c], rot: (r + c) % 4, wet: false });
      }
      this.grid.push(row);
    }
    this.grid[1][0] = { type: 'tee', rot: 0, wet: false };
    this.pipeCleared = false;
    this.recomputePipeFlow();
  }

  togglePump() {
    this.pumpOn = !this.pumpOn;
    this.sound.playBreakerClack();
    if (this.pumpOn) this.playWaterSurge();
    if (this.mode === 'pipe') this.recomputePipeFlow();
    else this.checkValveGoals();
    this.renderScene();
  }

  toggleValve(id) {
    const v = this.valves.find((x) => x.id === id);
    if (!v) return;
    v.open = !v.open;
    this.playValveTurn();
    if (this.pumpOn && v.open) this.playWaterSurge();
    this.checkValveGoals();
    this.renderScene();
  }

  getValveFlows() {
    const v1 = this.valves.find((v) => v.id === 'v1');
    const v2 = this.valves.find((v) => v.id === 'v2');
    const v3 = this.valves.find((v) => v.id === 'v3');
    const main = this.pumpOn;
    const trunk = main && v1 && v1.open;
    const wheel = trunk && v2 && v2.open;
    const tank = trunk && v3 && v3.open;
    return { main, trunk, wheel, tank };
  }

  checkValveGoals() {
    if (this.stageCleared) return;
    const st = VALVE_STAGES[this.stageIdx % VALVE_STAGES.length];
    const f = this.getValveFlows();
    const wantWheel = st.goalIds.includes('wheel');
    const wantTank = st.goalIds.includes('tank');
    if (f.wheel === wantWheel && f.tank === wantTank && (wantWheel || wantTank)) {
      this.stageCleared = true;
      this.sound.playCrackerPop();
      this.hintEl.textContent = 'だいせいこう！ みずが いきおいよく とどいたよ！';
    }
  }

  clickPipeCell(c, r) {
    const cell = this.grid[r] && this.grid[r][c];
    if (!cell) return;
    if (this.paintTool === 'rotate') cell.rot = (cell.rot + 1) % 4;
    else cell.type = this.paintTool;
    this.playPipeClick();
    const targets = this.recomputePipeFlow();
    if (targets.wheel || targets.tank || targets.flower) this.playWaterSurge();
    if (targets.wheel && targets.tank && !this.pipeCleared) {
      this.pipeCleared = true;
      this.sound.playCrackerPop();
      this.hintEl.textContent = 'すごい！ みずぐるま と あひるタンク 両方に つながったよ！';
    }
    this.renderScene();
  }

  recomputePipeFlow() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) this.grid[r][c].wet = false;
    }
    if (!this.pumpOn) return { wheel: false, tank: false, flower: false };

    const q = [];
    const entryPorts = getRotatedPorts(this.grid[1][0].type, this.grid[1][0].rot);
    if (entryPorts[3]) {
      this.grid[1][0].wet = true;
      q.push([0, 1]);
    }

    const dirs = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
    while (q.length > 0) {
      const [c, r] = q.shift();
      const ports = getRotatedPorts(this.grid[r][c].type, this.grid[r][c].rot);
      for (const [dc, dr, myP, nbP] of dirs) {
        if (!ports[myP]) continue;
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nc >= this.gridCols || nr < 0 || nr >= this.gridRows) continue;
        const nb = this.grid[nr][nc];
        if (nb.wet) continue;
        if (getRotatedPorts(nb.type, nb.rot)[nbP]) {
          nb.wet = true;
          q.push([nc, nr]);
        }
      }
    }

    const wheel  = this.grid[0][4].wet && !!getRotatedPorts(this.grid[0][4].type, this.grid[0][4].rot)[1];
    const tank   = this.grid[2][4].wet && !!getRotatedPorts(this.grid[2][4].type, this.grid[2][4].rot)[1];
    const flower = this.grid[3][4].wet && !!getRotatedPorts(this.grid[3][4].type, this.grid[3][4].rot)[1];
    return { wheel, tank, flower };
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 34) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.step(dt);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  step(dt) {
    this.flowOffset = (this.flowOffset + dt * 64) % 36;
    this.valves.forEach((v) => {
      const target = v.open ? 180 : 0;
      const cur = this.valveSpins[v.id] || 0;
      this.valveSpins[v.id] = cur + (target - cur) * Math.min(1, dt * 11);
    });

    let wheelWet = false;
    let tankWet = false;
    let flowerWet = false;
    let targetPressure = 0.05;

    if (this.mode === 'valve') {
      const f = this.getValveFlows();
      wheelWet = f.wheel;
      tankWet = f.tank;
      flowerWet = f.tank;
      targetPressure = !f.main ? 0.05 : (!f.trunk ? 0.92 : ((f.wheel && f.tank) ? 0.58 : (f.wheel || f.tank ? 0.74 : 0.88)));
    } else {
      const res = this.recomputePipeFlow();
      wheelWet = res.wheel;
      tankWet = res.tank;
      flowerWet = res.flower;
      targetPressure = this.pumpOn ? 0.78 : 0.05;
    }

    this.pressure += (targetPressure - this.pressure) * Math.min(1, dt * 6);
    if (wheelWet) this.wheelAngle = (this.wheelAngle + dt * 210) % 360;
    this.tankFill = tankWet ? Math.min(1, this.tankFill + dt * 0.45) : Math.max(0, this.tankFill - dt * 0.3);
    this.flowerBloom = flowerWet ? Math.min(1, this.flowerBloom + dt * 0.55) : Math.max(0, this.flowerBloom - dt * 0.25);

    this.renderScene();
  }

  renderPipeSegment(x1, y1, x2, y2, wet) {
    const ink = '#1E293B';
    const isVert = Math.abs(x1 - x2) < 2;
    return `
      <!-- Soft cast shadow behind clear pipe -->
      <line x1="${x1 + 3}" y1="${y1 + 5}" x2="${x2 + 3}" y2="${y2 + 5}" stroke="rgba(15,23,42,0.14)" stroke-width="34" stroke-linecap="round"/>
      <!-- Bold toon-ink glass pipe outer outline -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="34" stroke-linecap="round"/>
      <!-- Clear empty glass interior -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E0F2FE" stroke-width="26" stroke-linecap="round"/>
      ${wet ? `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${isVert ? 'wl-water-v' : 'wl-water-h'})" stroke-width="24" stroke-linecap="round"/>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFFFFF" stroke-width="6"
          stroke-dasharray="12 24" stroke-dashoffset="${(-this.flowOffset).toFixed(1)}" stroke-linecap="round" opacity="0.82"/>
      ` : ''}
      <!-- Crisp cel-shaded white glass reflection streak -->
      <line x1="${x1 - (isVert ? 7 : 0)}" y1="${y1 - (isVert ? 0 : 7)}" x2="${x2 - (isVert ? 7 : 0)}" y2="${y2 - (isVert ? 0 : 7)}"
        stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.72"/>
    `;
  }

  /** 2.5D Industrial Steel Water Pump with physical yellow ON/OFF lever right on top! */
  renderPumpUnitSvg(x, y, scale = 1) {
    const ink = '#1E293B';
    const leverTilt = this.pumpOn ? -30 : 30;
    return `
      <g data-pump="1" style="cursor:pointer;" transform="translate(${x} ${y}) scale(${scale})">
        <ellipse cx="4" cy="64" rx="56" ry="12" fill="rgba(15,23,42,0.2)"/>
        <!-- Physical Yellow Toggle Lever right on top of the pump! -->
        <g transform="translate(0 -56) rotate(${leverTilt})">
          <rect x="-5" y="-36" width="10" height="36" rx="4" fill="#CBD5E1" stroke="${ink}" stroke-width="3"/>
          <circle cx="0" cy="-38" r="13" fill="${this.pumpOn ? '#22C55E' : '#EF4444'}" stroke="${ink}" stroke-width="3.2"/>
        </g>
        <!-- 2.5D Extruded Pump Housing -->
        <polygon points="-50,-54 -36,-66 64,-66 50,-54" fill="#E2E8F0" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="50,-54 64,-66 64,46 50,58" fill="#64748B" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="-50" y="-54" width="100" height="112" rx="16" fill="url(#wl-steel)" stroke="${ink}" stroke-width="4"/>
        <circle cx="0" cy="-10" r="28" fill="#1E293B" stroke="${ink}" stroke-width="3"/>
        <circle cx="0" cy="-10" r="15" fill="${this.pumpOn ? '#38BDF8' : '#64748B'}" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="-36" y="26" width="72" height="22" rx="11" fill="${this.pumpOn ? '#22C55E' : '#EF4444'}" stroke="${ink}" stroke-width="2.5"/>
        <text x="0" y="41" text-anchor="middle" font-size="11.5" font-weight="900" fill="#FFFFFF" font-family="sans-serif">ポンプ ${this.pumpOn ? 'ON' : 'OFF'}</text>
      </g>
    `;
  }

  renderScene() {
    if (this.mode === 'valve') this.renderValveScene();
    else this.renderPipeGridScene();
  }

  renderValveScene() {
    const ink = '#1E293B';
    const f = this.getValveFlows();
    const st = VALVE_STAGES[this.stageIdx % VALVE_STAGES.length];
    const wantWheel = st.goalIds.includes('wheel');
    const wantTank = st.goalIds.includes('tank');

    this.sceneEl.innerHTML = `
      <!-- Sunlit Ceramic Tile Waterworks Wall + Warm Wooden Bench -->
      <rect x="0" y="0" width="800" height="418" fill="url(#wl-tiles)"/>
      <rect x="0" y="412" width="800" height="88" fill="url(#wl-bench)"/>
      <line x1="0" y1="412" x2="800" y2="412" stroke="${ink}" stroke-width="4"/>

      <!-- 2.5D Clear Acrylic Pipe Network -->
      ${this.renderPipeSegment(150, 230, 300, 230, f.main)}
      ${this.renderPipeSegment(300, 230, 412, 230, f.trunk)}
      ${this.renderPipeSegment(412, 230, 412, 132, f.trunk)}
      ${this.renderPipeSegment(412, 132, 515, 132, f.trunk)}
      ${this.renderPipeSegment(515, 132, 678, 132, f.wheel)}
      ${this.renderPipeSegment(412, 230, 412, 332, f.trunk)}
      ${this.renderPipeSegment(412, 332, 515, 332, f.trunk)}
      ${this.renderPipeSegment(515, 332, 678, 332, f.tank)}

      <!-- Bolted 2.5D Brass Tee Collar -->
      <circle cx="412" cy="230" r="24" fill="url(#wl-brass)" stroke="${ink}" stroke-width="3.5"/>
      <circle cx="412" cy="230" r="8" fill="#1E293B"/>

      <!-- Left 2.5D Water Pump with Direct Lever -->
      ${this.renderPumpUnitSvg(104, 230, 1.0)}

      <!-- Brass Pressure Gauge -->
      ${renderPressureGaugeSvg(224, 144, this.pressure)}

      <!-- Direct Interactive Red 5-Spoke Valves -->
      ${this.valves.map((v) => renderValveSvg(v.id, v.x, v.y, v.open, this.valveSpins[v.id] || 0)).join('')}

      <!-- Clear Goal Target Pointers -->
      ${wantWheel ? `<rect x="626" y="34" width="104" height="26" rx="13" fill="#FACC15" stroke="${ink}" stroke-width="2.5"/><text x="678" y="52" text-anchor="middle" font-size="12.5" font-weight="900" fill="${ink}" font-family="sans-serif">ここへ おくる！</text>` : ''}
      ${wantTank ? `<rect x="626" y="250" width="104" height="26" rx="13" fill="#FACC15" stroke="${ink}" stroke-width="2.5"/><text x="678" y="268" text-anchor="middle" font-size="12.5" font-weight="900" fill="${ink}" font-family="sans-serif">ここへ おくる！</text>` : ''}

      <!-- Right Outputs: Waterwheel & Floating Duck Tank -->
      ${renderWaterwheelSvg(678, 174, this.wheelAngle, f.wheel)}
      ${renderDuckTankSvg(678, 352, this.tankFill)}

      <!-- Next Stage 2.5D Workbench Plaque when cleared -->
      ${this.stageCleared ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(360 452)">
          <rect x="-126" y="-22" width="252" height="52" rx="18" fill="#15803D" stroke="${ink}" stroke-width="3.5"/>
          <rect x="-126" y="-28" width="252" height="52" rx="18" fill="#22C55E" stroke="${ink}" stroke-width="3.5"/>
          <text x="0" y="5" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="sans-serif">だいせいこう！ つぎへ</text>
        </g>
      ` : ''}
    `;
  }

  renderPipeGridScene() {
    const ink = '#1E293B';
    const startX = 166;
    const startY = 24;
    const cellSz = 92;
    const res = this.recomputePipeFlow();

    let tilesSvg = '';
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        const cx = startX + c * cellSz + cellSz / 2;
        const cy = startY + r * cellSz + cellSz / 2;
        const ports = getRotatedPorts(cell.type, cell.rot);
        const half = cellSz / 2;
        const endpoints = [[cx, cy - half], [cx + half, cy], [cx, cy + half], [cx - half, cy]];
        const arms = ports.map((open, pIdx) => open ? this.renderPipeSegment(cx, cy, endpoints[pIdx][0], endpoints[pIdx][1], cell.wet) : '').join('');

        tilesSvg += `
          <g data-cell="${c},${r}" style="cursor:pointer;">
            <rect x="${startX + c * cellSz + 3}" y="${startY + r * cellSz + 3}" width="${cellSz - 6}" height="${cellSz - 6}" rx="14"
              fill="${cell.wet ? '#E0F2FE' : '#FFFFFF'}" stroke="${cell.wet ? '#0284C7' : '#94A3B8'}" stroke-width="2.5"/>
            ${arms}
            <circle cx="${cx}" cy="${cy}" r="13" fill="url(#wl-brass)" stroke="${ink}" stroke-width="2.5"/>
          </g>
        `;
      }
    }

    // Visual 2.5D Workbench Tool Tiles right along the bottom wooden shelf!
    const tools = [
      { id: 'rotate',   label: 'まわす',   icon: '<path d="M-10 0 A10 10 0 1 1 5 9" fill="none" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/><polygon points="2,14 11,10 5,2" fill="#1E293B"/>' },
      { id: 'straight', label: 'まっすぐ', icon: '<line x1="-16" y1="0" x2="16" y2="0" stroke="#0284C7" stroke-width="10" stroke-linecap="round"/>' },
      { id: 'elbow',    label: 'Lじ',      icon: '<path d="M0 14 V0 H14" fill="none" stroke="#0284C7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' },
      { id: 'tee',      label: 'Tじ',      icon: '<path d="M-14 0 H14 M0 0 V14" fill="none" stroke="#0284C7" stroke-width="10" stroke-linecap="round"/>' },
      { id: 'cross',    label: 'じゅうじ', icon: '<path d="M-14 0 H14 M0 -14 V14" fill="none" stroke="#0284C7" stroke-width="10" stroke-linecap="round"/>' },
      { id: 'reset',    label: 'リセット', icon: '<circle cx="0" cy="0" r="10" fill="none" stroke="#EF4444" stroke-width="4"/>' }
    ];

    const traySvg = tools.map((t, i) => {
      const tx = 148 + i * 102;
      const sel = this.paintTool === t.id;
      return `
        <g data-pipe-tool="${t.id}" style="cursor:pointer;" transform="translate(${tx} 448)">
          <rect x="-44" y="-26" width="88" height="58" rx="14" fill="${sel ? '#0369A1' : '#92400E'}" stroke="${ink}" stroke-width="3"/>
          <rect x="-44" y="-32" width="88" height="58" rx="14" fill="${sel ? '#BAE6FD' : '#FFFBEB'}" stroke="${sel ? '#0284C7' : ink}" stroke-width="3"/>
          <g transform="translate(0 -10)">${t.icon}</g>
          <text x="0" y="19" text-anchor="middle" font-size="11.5" font-weight="900" fill="${ink}" font-family="sans-serif">${t.label}</text>
        </g>
      `;
    }).join('');

    this.sceneEl.innerHTML = `
      <rect x="0" y="0" width="800" height="404" fill="url(#wl-tiles)"/>
      <rect x="0" y="398" width="800" height="102" fill="url(#wl-bench)"/>
      <line x1="0" y1="398" x2="800" y2="398" stroke="${ink}" stroke-width="4"/>

      <!-- Left Source Pump feeding Row 1 -->
      ${this.renderPipeSegment(112, startY + cellSz * 1.5, startX + 8, startY + cellSz * 1.5, this.pumpOn)}
      ${this.renderPumpUnitSvg(82, startY + cellSz * 1.5, 0.84)}
      ${renderPressureGaugeSvg(82, 314, this.pressure)}

      <!-- Interactive 5x4 2.5D Pipe Grid -->
      ${tilesSvg}

      <!-- Right Outputs -->
      ${renderWaterwheelSvg(712, startY + cellSz * 0.55, this.wheelAngle, res.wheel)}
      ${renderDuckTankSvg(712, startY + cellSz * 2.15, this.tankFill)}
      ${renderFlowerBedSvg(712, startY + cellSz * 3.55, this.flowerBloom)}

      <!-- Diegetic Visual Workbench Pipe Piece Tray -->
      ${traySvg}
    `;
  }

  /* =========================================================================
     Realistic Plumbing Web Audio Synthesizers
     ========================================================================= */

  playValveTurn() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3;
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(bp); bp.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.12);
  }

  playWaterSurge() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(420, now);
    bp.frequency.exponentialRampToValueAtTime(1150, now + 0.18);
    bp.Q.value = 2.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    src.connect(bp); bp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.25);
  }

  playPipeClick() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.065);
  }
}
