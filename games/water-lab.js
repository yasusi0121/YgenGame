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

    // Valve mode state
    this.pumpOn = true;
    this.valves = [];
    this.valveSpins = {}; // visual rotation angle per valve
    this.stageCleared = false;

    // Animated physical quantities
    this.flowOffset = 0;
    this.pressure = 0.2;
    this.wheelAngle = 0;
    this.tankFill = 0;
    this.flowerBloom = 0;

    // Pipe builder grid state (5 cols x 4 rows)
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
      this.app.setGameBackground('#0F172A');
    }
    this.injectStyles();
    this.renderShell();
    this.loadValveStage();
    this.initPipeGrid();
    this.renderDock();
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
    if (document.getElementById('wl-styles')) return;
    const style = document.createElement('style');
    style.id = 'wl-styles';
    style.textContent = `
      .wl-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 10%, #1E3A5F 0%, #0F172A 100%);
        color: #F8FAFC; user-select: none; -webkit-user-select: none;
        padding: 8px 12px 10px; box-sizing: border-box; gap: 8px; overflow: hidden;
      }
      .wl-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 44px;
      }
      .wl-modes {
        display: flex; gap: 6px; background: rgba(15,23,42,0.8);
        padding: 4px; border-radius: 16px; border: 2px solid #38BDF8;
      }
      .wl-mode-btn {
        border: none; border-radius: 12px; padding: 7px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #CBD5E1; cursor: pointer; font-family: inherit;
      }
      .wl-mode-btn.active { background: #0EA5E9; color: #FFFFFF; box-shadow: 0 3px 0 #0369A1; }

      .wl-status {
        display: flex; align-items: center; gap: 10px; background: rgba(30,41,59,0.9);
        border: 2px solid #475569; border-radius: 16px; padding: 5px 12px;
      }
      .wl-hint { font-size: 14px; font-weight: 800; color: #BAE6FD; }

      .wl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(180deg, #16263E 0%, #0B1526 100%);
        border-radius: 22px; border: 3px solid #334155; overflow: hidden;
      }
      .wl-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      .wl-dock {
        display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;
        background: rgba(30,41,59,0.92); border: 2.5px solid #475569;
        border-radius: 20px; padding: 7px 12px; min-height: 62px;
      }
      .wl-btn {
        border: 2.5px solid #64748B; border-radius: 14px; padding: 8px 15px;
        background: #0F172A; color: #F8FAFC; font-size: 14px; font-weight: 900;
        cursor: pointer; font-family: inherit; box-shadow: 0 3px 0 #020617;
      }
      .wl-btn.active { background: #0EA5E9; border-color: #BAE6FD; box-shadow: 0 3px 0 #0369A1; }
      .wl-btn.green  { background: #22C55E; border-color: #DCFCE7; box-shadow: 0 3px 0 #15803D; }
      .wl-btn.red    { background: #EF4444; border-color: #FCA5A5; box-shadow: 0 3px 0 #991B1B; }
      .wl-btn:active { transform: translateY(2px); }

      @media (max-width: 640px) {
        .wl-root { padding: 6px; gap: 6px; }
        .wl-topbar { padding-left: 44px; padding-right: 44px; }
        .wl-mode-btn { padding: 5px 10px; font-size: 12px; }
        .wl-hint { font-size: 12px; }
        .wl-dock { padding: 6px; gap: 5px; min-height: 54px; }
        .wl-btn { padding: 6px 10px; font-size: 12px; }
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
          <svg class="wl-svg" id="wl-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
            ${buildWaterDefsSvg()}
            <g id="wl-scene"></g>
          </svg>
        </div>

        <div class="wl-dock" id="wl-dock"></div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#wl-svg');
    this.sceneEl = this.mountEl.querySelector('#wl-scene');
    this.hintEl = this.mountEl.querySelector('#wl-hint');
    this.dockEl = this.mountEl.querySelector('#wl-dock');

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
          this.hintEl.textContent = 'パイプを タップして まわし、みずぐるまと あひるに つなごう！';
        }
        this.renderDock();
        this.renderScene();
      });
    });

    this.svgEl.addEventListener('pointerdown', (e) => {
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
    this.renderDock();
    this.renderScene();
  }

  initPipeGrid() {
    // 5 cols x 4 rows playful plumbing layout (rotatable or replaceable!)
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
    // Give left entry tile (0,1) an easy starting orientation
    this.grid[1][0] = { type: 'tee', rot: 0, wet: false };
    this.pipeCleared = false;
    this.recomputePipeFlow();
  }

  togglePump() {
    this.pumpOn = !this.pumpOn;
    this.sound.playBreakerClack();
    if (this.pumpOn) this.playWaterSurge();
    this.renderDock();
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
      this.renderDock();
    }
  }

  clickPipeCell(c, r) {
    const cell = this.grid[r] && this.grid[r][c];
    if (!cell) return;
    if (this.paintTool === 'rotate') {
      cell.rot = (cell.rot + 1) % 4;
    } else {
      cell.type = this.paintTool;
    }
    this.playPipeClick();
    const targets = this.recomputePipeFlow();
    if (targets.wheel || targets.tank || targets.flower) {
      this.playWaterSurge();
    }
    if (targets.wheel && targets.tank && !this.pipeCleared) {
      this.pipeCleared = true;
      this.sound.playCrackerPop();
      this.hintEl.textContent = 'すごい！ みずぐるま と あひるタンク 両方に つながったよ！';
    }
    this.renderScene();
  }

  recomputePipeFlow() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        this.grid[r][c].wet = false;
      }
    }
    if (!this.pumpOn) return { wheel: false, tank: false, flower: false };

    const q = [];
    // Pump feeds left side (port index 3) of cell (c=0, r=1)
    const entryPorts = getRotatedPorts(this.grid[1][0].type, this.grid[1][0].rot);
    if (entryPorts[3]) {
      this.grid[1][0].wet = true;
      q.push([0, 1]);
    }

    const dirs = [
      [0, -1, 0, 2], // Top -> neighbor's Bottom
      [1,  0, 1, 3], // Right -> neighbor's Left
      [0,  1, 2, 0], // Bottom -> neighbor's Top
      [-1, 0, 3, 1]  // Left -> neighbor's Right
    ];

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
        const nbPorts = getRotatedPorts(nb.type, nb.rot);
        if (nbPorts[nbP]) {
          nb.wet = true;
          q.push([nc, nr]);
        }
      }
    }

    // Right edge outputs: (4,0) -> wheel, (4,2) -> duck tank, (4,3) -> flowers
    const wheel  = this.grid[0][4].wet && !!getRotatedPorts(this.grid[0][4].type, this.grid[0][4].rot)[1];
    const tank   = this.grid[2][4].wet && !!getRotatedPorts(this.grid[2][4].type, this.grid[2][4].rot)[1];
    const flower = this.grid[3][4].wet && !!getRotatedPorts(this.grid[3][4].type, this.grid[3][4].rot)[1];
    return { wheel, tank, flower };
  }

  renderDock() {
    if (this.mode === 'valve') {
      this.dockEl.innerHTML = `
        <button class="wl-btn ${this.pumpOn ? 'active' : 'red'}" id="wl-pump-btn" type="button">
          ポンプ：${this.pumpOn ? 'ON（ながす）' : 'OFF（とめる）'}
        </button>
        ${this.stageCleared ? `
          <button class="wl-btn green" id="wl-next-btn" type="button">つぎの ステージへ</button>
        ` : ''}
      `;
      this.dockEl.querySelector('#wl-pump-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.togglePump();
      });
      const nxt = this.dockEl.querySelector('#wl-next-btn');
      if (nxt) {
        nxt.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.unlock();
          this.sound.playPageTurn(1);
          this.stageIdx++;
          this.loadValveStage();
        });
      }
      return;
    }

    const tools = [
      { id: 'rotate',   label: 'まわす' },
      { id: 'straight', label: 'まっすぐ' },
      { id: 'elbow',    label: 'Lじ' },
      { id: 'tee',      label: 'Tじ' },
      { id: 'cross',    label: 'じゅうじ' }
    ];
    this.dockEl.innerHTML = `
      <button class="wl-btn ${this.pumpOn ? 'active' : 'red'}" id="wl-pump-btn" type="button">
        ポンプ：${this.pumpOn ? 'ON' : 'OFF'}
      </button>
      ${tools.map((t) => `
        <button class="wl-btn ${this.paintTool === t.id ? 'active' : ''}" data-tool="${t.id}" type="button">${t.label}</button>
      `).join('')}
      <button class="wl-btn" id="wl-reset-grid" type="button">リセット</button>
    `;

    this.dockEl.querySelector('#wl-pump-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.pumpOn = !this.pumpOn;
      this.sound.playBreakerClack();
      this.recomputePipeFlow();
      this.renderDock();
      this.renderScene();
    });
    this.dockEl.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        this.paintTool = btn.dataset.tool;
        this.renderDock();
      });
    });
    this.dockEl.querySelector('#wl-reset-grid').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(-1);
      this.initPipeGrid();
      this.renderScene();
    });
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
    this.flowOffset = (this.flowOffset + dt * 62) % 36;

    // Smooth handwheel spin interpolation
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
    const isVert = Math.abs(x1 - x2) < 2;
    return `
      <!-- Clear Acrylic Outer Pipe Wall -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#475569" stroke-width="32" stroke-linecap="round"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0F172A" stroke-width="24" stroke-linecap="round"/>
      ${wet ? `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${isVert ? 'wl-water-v' : 'wl-water-h'})" stroke-width="22" stroke-linecap="round"/>
        <!-- Animated flowing white bubbles/streaks -->
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(224,242,254,0.75)" stroke-width="6"
          stroke-dasharray="12 24" stroke-dashoffset="${(-this.flowOffset).toFixed(1)}" stroke-linecap="round"/>
      ` : ''}
      <!-- Glossy Glass Highlight Line -->
      <line x1="${x1}" y1="${y1 - (isVert ? 0 : 7)}" x2="${x2}" y2="${y2 - (isVert ? 0 : 7)}"
        stroke="rgba(255,255,255,0.28)" stroke-width="4" stroke-linecap="round"/>
    `;
  }

  renderScene() {
    if (this.mode === 'valve') {
      this.renderValveScene();
    } else {
      this.renderPipeGridScene();
    }
  }

  renderValveScene() {
    const f = this.getValveFlows();
    const st = VALVE_STAGES[this.stageIdx % VALVE_STAGES.length];
    const wantWheel = st.goalIds.includes('wheel');
    const wantTank = st.goalIds.includes('tank');

    this.sceneEl.innerHTML = `
      <!-- Subtle blueprint grid backdrop -->
      <rect x="24" y="20" width="752" height="440" rx="20" fill="#0F172A" stroke="#334155" stroke-width="3"/>

      <!-- Transparent Pipe Network -->
      ${this.renderPipeSegment(150, 240, 300, 240, f.main)}
      ${this.renderPipeSegment(300, 240, 412, 240, f.trunk)}
      <!-- Upper Branch to Waterwheel -->
      ${this.renderPipeSegment(412, 240, 412, 140, f.trunk)}
      ${this.renderPipeSegment(412, 140, 515, 140, f.trunk)}
      ${this.renderPipeSegment(515, 140, 678, 140, f.wheel)}
      <!-- Lower Branch to Duck Tank -->
      ${this.renderPipeSegment(412, 240, 412, 340, f.trunk)}
      ${this.renderPipeSegment(412, 340, 515, 340, f.trunk)}
      ${this.renderPipeSegment(515, 340, 678, 340, f.tank)}

      <!-- Bolted Steel Tee Junction Collar -->
      <circle cx="412" cy="240" r="22" fill="url(#wl-steel)" stroke="#334155" stroke-width="3"/>
      <circle cx="412" cy="240" r="8" fill="#1E293B"/>

      <!-- Left Main Water Pump Unit (tap to toggle ON/OFF) -->
      <g data-pump="1" style="cursor:pointer;" transform="translate(106 240)">
        <rect x="-52" y="-56" width="104" height="112" rx="16" fill="url(#wl-steel)" stroke="${this.pumpOn ? '#38BDF8' : '#475569'}" stroke-width="4"/>
        <circle cx="0" cy="-8" r="28" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
        <circle cx="0" cy="-8" r="14" fill="${this.pumpOn ? '#38BDF8' : '#475569'}"/>
        <rect x="-36" y="28" width="72" height="20" rx="10" fill="${this.pumpOn ? '#16A34A' : '#DC2626'}"/>
        <text x="0" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">ポンプ ${this.pumpOn ? 'ON' : 'OFF'}</text>
      </g>

      <!-- Analog Water Pressure Gauge mounted above main trunk -->
      ${renderPressureGaugeSvg(224, 152, this.pressure)}

      <!-- Interactive Red 5-Spoke Handwheel Gate Valves -->
      ${this.valves.map((v) => renderValveSvg(v.id, v.x, v.y, v.open, this.valveSpins[v.id] || 0)).join('')}

      <!-- Goal Target Badges -->
      ${wantWheel ? `<rect x="628" y="44" width="102" height="24" rx="12" fill="#FACC15"/><text x="679" y="60" text-anchor="middle" font-size="12" font-weight="900" fill="#0F172A" font-family="sans-serif">ここへ おくる！</text>` : ''}
      ${wantTank ? `<rect x="628" y="256" width="102" height="24" rx="12" fill="#FACC15"/><text x="679" y="272" text-anchor="middle" font-size="12" font-weight="900" fill="#0F172A" font-family="sans-serif">ここへ おくる！</text>` : ''}

      <!-- Upper Output: Spinning Waterwheel -->
      ${renderWaterwheelSvg(678, 178, this.wheelAngle, f.wheel)}

      <!-- Lower Output: Glass Tank with Floating Yellow Duck -->
      ${renderDuckTankSvg(678, 356, this.tankFill)}
    `;
  }

  renderPipeGridScene() {
    const startX = 166;
    const startY = 44;
    const cellSz = 96;
    const res = this.recomputePipeFlow();

    let tilesSvg = '';
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        const cx = startX + c * cellSz + cellSz / 2;
        const cy = startY + r * cellSz + cellSz / 2;
        const ports = getRotatedPorts(cell.type, cell.rot);
        const half = cellSz / 2;

        // Draw arms to each open port [Top, Right, Bottom, Left]
        const endpoints = [
          [cx, cy - half],
          [cx + half, cy],
          [cx, cy + half],
          [cx - half, cy]
        ];
        const arms = ports.map((open, pIdx) => {
          if (!open) return '';
          const [ex, ey] = endpoints[pIdx];
          return this.renderPipeSegment(cx, cy, ex, ey, cell.wet);
        }).join('');

        tilesSvg += `
          <g data-cell="${c},${r}" style="cursor:pointer;">
            <rect x="${startX + c * cellSz + 3}" y="${startY + r * cellSz + 3}" width="${cellSz - 6}" height="${cellSz - 6}" rx="12"
              fill="${cell.wet ? 'rgba(14,165,233,0.14)' : '#1E293B'}" stroke="${cell.wet ? '#38BDF8' : '#334155'}" stroke-width="2"/>
            ${arms}
            <circle cx="${cx}" cy="${cy}" r="12" fill="url(#wl-steel)" stroke="#334155" stroke-width="2"/>
          </g>
        `;
      }
    }

    this.sceneEl.innerHTML = `
      <rect x="20" y="20" width="760" height="440" rx="20" fill="#0F172A" stroke="#334155" stroke-width="3"/>

      <!-- Left Source Pump feeding Row 1 -->
      ${this.renderPipeSegment(118, startY + cellSz * 1.5, startX + 8, startY + cellSz * 1.5, this.pumpOn)}
      <g data-pump="1" style="cursor:pointer;" transform="translate(86 ${startY + cellSz * 1.5})">
        <rect x="-46" y="-50" width="92" height="100" rx="14" fill="url(#wl-steel)" stroke="${this.pumpOn ? '#38BDF8' : '#475569'}" stroke-width="3.5"/>
        <circle cx="0" cy="-8" r="22" fill="#1E293B"/>
        <circle cx="0" cy="-8" r="11" fill="${this.pumpOn ? '#38BDF8' : '#475569'}"/>
        <text x="0" y="34" text-anchor="middle" font-size="11" font-weight="900" fill="#0F172A" font-family="sans-serif">ポンプ</text>
      </g>
      ${renderPressureGaugeSvg(86, 336, this.pressure)}

      <!-- Interactive 5x4 Plumbing Grid -->
      ${tilesSvg}

      <!-- Right Outputs: Waterwheel (Row 0), Duck Tank (Row 2), Flower Bed (Row 3) -->
      ${renderWaterwheelSvg(712, startY + cellSz * 0.55, this.wheelAngle, res.wheel)}
      ${renderDuckTankSvg(712, startY + cellSz * 2.2, this.tankFill)}
      ${renderFlowerBedSvg(712, startY + cellSz * 3.55, this.flowerBloom)}
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
