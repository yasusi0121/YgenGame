import {
  FONT_ROUND,
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

    this.mode = 'valve';
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

    this.gridCols = 5;
    this.gridRows = 4;
    this.grid = [];
    this.paintTool = 'rotate';
    this.pipeCleared = false;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#2E7E90');
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
        background: #2E7E90; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .wl-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .wl-modes {
        display: flex; gap: 4px; background: rgba(255,255,255,0.18); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.3);
      }
      .wl-mode-btn {
        border: none; border-radius: 999px; padding: 6px 15px; font-size: 14px; font-weight: 800;
        background: transparent; color: rgba(255,255,255,0.88); cursor: pointer; font-family: inherit;
      }
      .wl-mode-btn.active { background: #FFFFFF; color: #2E7E90; box-shadow: 0 3px 0 rgba(0,0,0,0.12); }

      .wl-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.3);
        border-radius: 999px; padding: 5px 14px;
      }
      .wl-hint { font-size: 14px; font-weight: 800; color: #FFFFFF; }

      .wl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .wl-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .wl-root { padding: 8px 6px; }
        .wl-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
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
            <button class="wl-mode-btn active" data-mode="valve" type="button">バルブ</button>
            <button class="wl-mode-btn" data-mode="pipe" type="button">パイプ</button>
          </div>
          <div class="wl-pill">
            <span class="wl-hint" id="wl-hint">あかい バルブを タップして ひらこう</span>
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
          this.hintEl.textContent = 'パイプを まわして みずを つなごう';
        }
        this.renderScene();
      });
    });

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
        if (t === 'reset') this.initPipeGrid();
        else this.paintTool = t;
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
      this.hintEl.textContent = 'やったね！ みずが とどいたよ！';
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
      this.hintEl.textContent = 'すごい！ ぜんぶ つながったよ！';
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

  /** Clean LogicBook-style Frosted Glass Pipe (zero harsh black strokes!) */
  renderPipeSegment(x1, y1, x2, y2, wet) {
    const isVert = Math.abs(x1 - x2) < 2;
    return `
      <!-- Soft frosted glass tube shell -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.28)" stroke-width="30" stroke-linecap="round"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(16,56,66,0.34)" stroke-width="22" stroke-linecap="round"/>
      ${wet ? `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${isVert ? 'wl-water-v' : 'wl-water-h'})" stroke-width="21" stroke-linecap="round"/>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFFFFF" stroke-width="5.5"
          stroke-dasharray="12 24" stroke-dashoffset="${(-this.flowOffset).toFixed(1)}" stroke-linecap="round" opacity="0.82"/>
      ` : ''}
      <!-- Soft glass rim highlight -->
      <line x1="${x1 - (isVert ? 6.5 : 0)}" y1="${y1 - (isVert ? 0 : 6.5)}" x2="${x2 - (isVert ? 6.5 : 0)}" y2="${y2 - (isVert ? 0 : 6.5)}"
        stroke="rgba(255,255,255,0.45)" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  /** Sculpted Matte Porcelain Water Pump with Toggle Lever */
  renderPumpUnitSvg(x, y, scale = 1) {
    const leverTilt = this.pumpOn ? -28 : 28;
    return `
      <g data-pump="1" style="cursor:pointer;" transform="translate(${x} ${y}) scale(${scale})">
        <ellipse cx="0" cy="64" rx="52" ry="11" fill="rgba(0,0,0,0.14)"/>
        <g transform="translate(0 -54) rotate(${leverTilt})">
          <rect x="-5" y="-34" width="10" height="34" rx="5" fill="#DCE5EF"/>
          <circle cx="0" cy="-36" r="13" fill="${this.pumpOn ? '#34D399' : '#F05A5B'}"/>
          <circle cx="-4" cy="-40" r="3.5" fill="rgba(255,255,255,0.55)"/>
        </g>
        <rect x="-50" y="-48" width="100" height="110" rx="24" fill="#B8C7D6"/>
        <rect x="-50" y="-54" width="100" height="110" rx="24" fill="url(#wl-porcelain)"/>
        <circle cx="0" cy="-10" r="27" fill="#39485C"/>
        <circle cx="0" cy="-10" r="15" fill="${this.pumpOn ? '#5CE1E6' : '#64748B'}"/>
        <rect x="-34" y="25" width="68" height="22" rx="11" fill="${this.pumpOn ? '#34D399' : '#F05A5B'}"/>
        <text x="0" y="40" text-anchor="middle" font-size="11.5" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">ポンプ ${this.pumpOn ? 'ON' : 'OFF'}</text>
      </g>
    `;
  }

  renderScene() {
    if (this.mode === 'valve') this.renderValveScene();
    else this.renderPipeGridScene();
  }

  renderValveScene() {
    const f = this.getValveFlows();
    const st = VALVE_STAGES[this.stageIdx % VALVE_STAGES.length];
    const wantWheel = st.goalIds.includes('wheel');
    const wantTank = st.goalIds.includes('tank');

    this.sceneEl.innerHTML = `
      <!-- Soft geometric ambient circles -->
      <circle cx="110" cy="90" r="130" fill="rgba(255,255,255,0.04)"/>
      <circle cx="690" cy="420" r="150" fill="rgba(255,255,255,0.04)"/>

      <!-- Frosted Glass Pipe Network -->
      ${this.renderPipeSegment(150, 230, 300, 230, f.main)}
      ${this.renderPipeSegment(300, 230, 412, 230, f.trunk)}
      ${this.renderPipeSegment(412, 230, 412, 132, f.trunk)}
      ${this.renderPipeSegment(412, 132, 515, 132, f.trunk)}
      ${this.renderPipeSegment(515, 132, 678, 132, f.wheel)}
      ${this.renderPipeSegment(412, 230, 412, 332, f.trunk)}
      ${this.renderPipeSegment(412, 332, 515, 332, f.trunk)}
      ${this.renderPipeSegment(515, 332, 678, 332, f.tank)}

      <!-- Honey-Brass Tee Joint -->
      <circle cx="412" cy="230" r="22" fill="url(#wl-brass)"/>
      <circle cx="412" cy="230" r="8" fill="#FFFFFF" opacity="0.6"/>

      ${this.renderPumpUnitSvg(104, 230, 1.0)}
      ${renderPressureGaugeSvg(224, 144, this.pressure)}
      ${this.valves.map((v) => renderValveSvg(v.id, v.x, v.y, v.open, this.valveSpins[v.id] || 0)).join('')}

      ${renderWaterwheelSvg(678, 174, this.wheelAngle, f.wheel, wantWheel && !f.wheel)}
      ${renderDuckTankSvg(678, 352, this.tankFill, wantTank && !f.tank)}

      ${this.stageCleared ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(360 442)">
          <rect x="-112" y="-20" width="224" height="52" rx="26" fill="#059669"/>
          <rect x="-112" y="-26" width="224" height="52" rx="26" fill="#34D399"/>
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">つぎの ステージへ</text>
        </g>
      ` : ''}
    `;
  }

  renderPipeGridScene() {
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
            <rect x="${startX + c * cellSz + 4}" y="${startY + r * cellSz + 4}" width="${cellSz - 8}" height="${cellSz - 8}" rx="18"
              fill="${cell.wet ? 'rgba(107,229,250,0.16)' : 'rgba(255,255,255,0.1)'}"
              stroke="${cell.wet ? 'rgba(184,243,255,0.55)' : 'rgba(255,255,255,0.18)'}" stroke-width="2"/>
            ${arms}
            <circle cx="${cx}" cy="${cy}" r="11" fill="url(#wl-brass)"/>
          </g>
        `;
      }
    }

    const tools = [
      { id: 'rotate',   label: 'まわす',   icon: '<path d="M-9 0 A9 9 0 1 1 5 8" fill="none" stroke="#2E7E90" stroke-width="3.8" stroke-linecap="round"/><polygon points="2,13 10,9 5,2" fill="#2E7E90"/>' },
      { id: 'straight', label: 'まっすぐ', icon: '<line x1="-15" y1="0" x2="15" y2="0" stroke="#2E7E90" stroke-width="9" stroke-linecap="round"/>' },
      { id: 'elbow',    label: 'Lじ',      icon: '<path d="M0 13 V0 H13" fill="none" stroke="#2E7E90" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' },
      { id: 'tee',      label: 'Tじ',      icon: '<path d="M-13 0 H13 M0 0 V13" fill="none" stroke="#2E7E90" stroke-width="9" stroke-linecap="round"/>' },
      { id: 'cross',    label: 'じゅうじ', icon: '<path d="M-13 0 H13 M0 -13 V13" fill="none" stroke="#2E7E90" stroke-width="9" stroke-linecap="round"/>' },
      { id: 'reset',    label: 'リセット', icon: '<circle cx="0" cy="0" r="9" fill="none" stroke="#F05A5B" stroke-width="4"/>' }
    ];

    const traySvg = tools.map((t, i) => {
      const tx = 148 + i * 102;
      const sel = this.paintTool === t.id;
      return `
        <g data-pipe-tool="${t.id}" style="cursor:pointer;" transform="translate(${tx} 448)">
          <rect x="-42" y="-24" width="84" height="56" rx="18" fill="rgba(0,0,0,0.16)"/>
          <rect x="-42" y="-29" width="84" height="56" rx="18"
            fill="${sel ? '#FFFFFF' : 'rgba(255,255,255,0.82)'}"
            stroke="${sel ? '#FFF3A1' : 'none'}" stroke-width="${sel ? '3.5' : '0'}"/>
          <g transform="translate(0 -9)">${t.icon}</g>
          <text x="0" y="19" text-anchor="middle" font-size="11" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${t.label}</text>
        </g>
      `;
    }).join('');

    this.sceneEl.innerHTML = `
      ${this.renderPipeSegment(112, startY + cellSz * 1.5, startX + 8, startY + cellSz * 1.5, this.pumpOn)}
      ${this.renderPumpUnitSvg(82, startY + cellSz * 1.5, 0.84)}
      ${renderPressureGaugeSvg(82, 314, this.pressure)}

      ${tilesSvg}

      ${renderWaterwheelSvg(712, startY + cellSz * 0.55, this.wheelAngle, res.wheel, false)}
      ${renderDuckTankSvg(712, startY + cellSz * 2.15, this.tankFill, false)}
      ${renderFlowerBedSvg(712, startY + cellSz * 3.55, this.flowerBloom)}

      ${traySvg}
    `;
  }

  /* Web Audio Plumbing Effects */
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
