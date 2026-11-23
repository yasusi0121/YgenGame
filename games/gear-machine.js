import { FLAT_ICONS } from "../core/flat-icons.js";
import { showCelebrationOverlay } from "../core/celebration.js";

const GM_COLS = 6;
const GM_ROWS = 4;
const GM_STEP = 96;
const GM_OX = 116;
const GM_OY = 96;

const GM_SPECS = {
  S: { teeth: 8,  r: 32, color: '#38BDF8', stroke: '#0284C7', label: 'しょう' },
  M: { teeth: 12, r: 48, color: '#FF924C', stroke: '#C85A17', label: 'ちゅう' },
  L: { teeth: 16, r: 64, color: '#A78BFA', stroke: '#6D28D9', label: 'だい' }
};

const GM_MACHINES = [
  { id: 'clock',    name: 'とけい' },
  { id: 'signal',   name: 'しんごうき' },
  { id: 'fan',      name: 'せんぷうき' },
  { id: 'musicbox', name: 'おるごーる' }
];

/** Generate mathematically accurate gear tooth SVG path centered at (0,0) */
function buildGearPath(teeth, pitchR) {
  const addendum = 6.2;
  const dedendum = 6.8;
  const rOut = pitchR + addendum;
  const rIn = Math.max(12, pitchR - dedendum);
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const base = i * step;
    const a0 = base - step * 0.24;
    const a1 = base - step * 0.14;
    const a2 = base + step * 0.14;
    const a3 = base + step * 0.24;
    const a4 = base + step * 0.50;
    const p = (r, a) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
    d += (i === 0 ? `M ${p(rIn, a0)} ` : `L ${p(rIn, a0)} `);
    d += `L ${p(rOut, a1)} L ${p(rOut, a2)} L ${p(rIn, a3)} L ${p(rIn, a4)} `;
  }
  return d + 'Z';
}

const GM_GEAR_PATHS = {
  S: buildGearPath(GM_SPECS.S.teeth, GM_SPECS.S.r),
  M: buildGearPath(GM_SPECS.M.teeth, GM_SPECS.M.r),
  L: buildGearPath(GM_SPECS.L.teeth, GM_SPECS.L.r)
};

export default class GearMachineGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.tool = 'M'; // 'S' | 'M' | 'L' | 'erase'
    this.gears = []; // { id, col, row, x, y, size, fixed, role, omega, phase }
    this.blocked = new Set(); // "col,row"
    this.machine = GM_MACHINES[0];
    this.jammed = false;
    this.goalPowered = false;
    this.solved = false;
    this.simTime = 0;
    this.lastFrame = 0;
    this.rafId = null;
    this.musicTick = 0;
    this.solveTimer = null;
  }

  mount() {
    this.app.setGameBackground('#0F766E');
    this.container.innerHTML = `
      <div class="gm-root" id="gm-root">
        <div class="lb-title-area" style="margin-top:2px;">
          <h2 class="lb-circuit-name"><ruby>GEAR MACHINE<rt>はぐるま マシン</rt></ruby></h2>
          <p class="lb-circuit-tip" id="gm-tip">はぐるま を つないで うごかそう！</p>
        </div>

        <div class="gm-viewport">
          <div class="gm-board" id="gm-board">
            <svg class="gm-svg" id="gm-svg" viewBox="0 0 900 480"></svg>
          </div>
        </div>

        <div class="gm-dock" id="gm-dock">
          <button class="gm-tool-btn" type="button" data-tool="S">${FLAT_ICONS.gearMini(22, '#38BDF8')}<span>ちいさい</span></button>
          <button class="gm-tool-btn is-active" type="button" data-tool="M">${FLAT_ICONS.gearMini(28, '#FF924C')}<span>ふつう</span></button>
          <button class="gm-tool-btn" type="button" data-tool="L">${FLAT_ICONS.gearMini(34, '#A78BFA')}<span>おおきい</span></button>
          <button class="gm-tool-btn" type="button" data-tool="erase">${FLAT_ICONS.eraser(24)}<span>はずす</span></button>
          <button class="gm-tool-btn" type="button" id="gm-new-btn">${FLAT_ICONS.refresh(22)}<span>べつの おだい</span></button>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#gm-root');
    this.tipEl = this.container.querySelector('#gm-tip');
    this.boardEl = this.container.querySelector('#gm-board');
    this.svgEl = this.container.querySelector('#gm-svg');
    this.toolBtns = Array.from(this.container.querySelectorAll('[data-tool]'));

    this.toolBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.tool = btn.dataset.tool;
        this.toolBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        this.sound.playButtonDown('yellow');
      });
    });

    this.container.querySelector('#gm-new-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.generatePuzzle();
    });

    this.generatePuzzle();
    this.lastFrame = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      this.tickAnimation(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  unmount() {
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.solveTimer);
    this.container.innerHTML = '';
  }

  pegCoords(col, row) {
    return { x: GM_OX + col * GM_STEP, y: GM_OY + row * GM_STEP };
  }

  /** Generate a guaranteed-solvable random puzzle with random goal machine */
  generatePuzzle() {
    clearTimeout(this.solveTimer);
    this.solved = false;
    this.goalPowered = false;
    this.jammed = false;
    this.musicTick = 0;

    // Pick random goal machine (different from previous if possible)
    const candidates = GM_MACHINES.filter((m) => m.id !== this.machine.id);
    this.machine = candidates[Math.floor(Math.random() * candidates.length)];

    const startRow = Math.floor(Math.random() * GM_ROWS);
    const goalRow = Math.floor(Math.random() * GM_ROWS);

    // Place 1-3 random blocked pegs while verifying orthogonal solvability via BFS
    let blocked = new Set();
    for (let attempt = 0; attempt < 25; attempt++) {
      const testBlocked = new Set();
      const numBlocks = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < numBlocks; k++) {
        const bc = 1 + Math.floor(Math.random() * (GM_COLS - 2));
        const br = Math.floor(Math.random() * GM_ROWS);
        testBlocked.add(`${bc},${br}`);
      }
      if (this.hasOrthogonalPath(0, startRow, GM_COLS - 1, goalRow, testBlocked)) {
        blocked = testBlocked;
        break;
      }
    }
    this.blocked = blocked;

    const startPos = this.pegCoords(0, startRow);
    const goalPos = this.pegCoords(GM_COLS - 1, goalRow);

    this.gears = [
      { id: 'start', col: 0, row: startRow, x: startPos.x, y: startPos.y, size: 'M', fixed: true, role: 'start', omega: 1.4, phase: 0 },
      { id: 'goal',  col: GM_COLS - 1, row: goalRow, x: goalPos.x, y: goalPos.y, size: 'M', fixed: true, role: 'goal', omega: 0, phase: 0 }
    ];

    this.tipEl.textContent = `はぐるま を つないで「${this.machine.name}」を うごかそう！`;
    this.solveNetwork();
    this.renderSvg();
  }

  hasOrthogonalPath(sc, sr, gc, gr, blocked) {
    const q = [[sc, sr]];
    const seen = new Set([`${sc},${sr}`]);
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (q.length > 0) {
      const [c, r] = q.shift();
      if (c === gc && r === gr) return true;
      for (const [dc, dr] of dirs) {
        const nc = c + dc, nr = r + dr;
        const key = `${nc},${nr}`;
        if (nc >= 0 && nc < GM_COLS && nr >= 0 && nr < GM_ROWS && !blocked.has(key) && !seen.has(key)) {
          seen.add(key);
          q.push([nc, nr]);
        }
      }
    }
    return false;
  }

  /** Check strict non-overlapping physical clearance */
  canPlaceAt(col, row, size) {
    if (this.blocked.has(`${col},${row}`)) return false;
    const pos = this.pegCoords(col, row);
    const rNew = GM_SPECS[size].r;
    for (const g of this.gears) {
      if (g.col === col && g.row === row) continue;
      const dist = Math.hypot(g.x - pos.x, g.y - pos.y);
      const minDist = rNew + GM_SPECS[g.size].r - 1.5;
      if (dist < minDist) return false;
    }
    return true;
  }

  /** Exact BFS gear meshing, gear-ratio angular velocity, phase alignment & jam detection */
  solveNetwork() {
    for (const g of this.gears) {
      g.omega = 0;
      g.visited = false;
    }
    this.jammed = false;

    const startGear = this.gears.find((g) => g.role === 'start');
    if (!startGear) return;

    startGear.omega = 1.45;
    startGear.phase = 0;
    startGear.visited = true;

    const queue = [startGear];
    const MESH_TOL = 2.0;

    while (queue.length > 0 && !this.jammed) {
      const cur = queue.shift();
      const curSpec = GM_SPECS[cur.size];

      for (const nxt of this.gears) {
        if (nxt === cur) continue;
        const nxtSpec = GM_SPECS[nxt.size];
        const dist = Math.hypot(nxt.x - cur.x, nxt.y - cur.y);
        const ideal = curSpec.r + nxtSpec.r;

        if (Math.abs(dist - ideal) <= MESH_TOL) {
          const expectedOmega = -cur.omega * (curSpec.teeth / nxtSpec.teeth);
          const theta = Math.atan2(nxt.y - cur.y, nxt.x - cur.x);
          const expectedPhase = theta + Math.PI + (Math.PI / nxtSpec.teeth) - (cur.phase - theta) * (curSpec.teeth / nxtSpec.teeth);

          if (!nxt.visited) {
            nxt.visited = true;
            nxt.omega = expectedOmega;
            nxt.phase = expectedPhase;
            queue.push(nxt);
          } else if (Math.abs(nxt.omega - expectedOmega) > 0.02) {
            // Odd-cycle mechanical jam detected!
            this.jammed = true;
            break;
          }
        }
      }
    }

    if (this.jammed) {
      for (const g of this.gears) g.omega = 0;
      this.goalPowered = false;
      this.boardEl.classList.remove('is-jammed');
      void this.boardEl.offsetWidth;
      this.boardEl.classList.add('is-jammed');
      this.tipEl.textContent = 'はぐるま が ぶつかって とまったよ！ 1つ はずしてみてね';
      this.sound.playGentleNudge();
      return;
    }

    const goalGear = this.gears.find((g) => g.role === 'goal');
    this.goalPowered = !!(goalGear && Math.abs(goalGear.omega) > 0.01);

    if (this.goalPowered && !this.solved) {
      this.solved = true;
      this.tipEl.textContent = `やったね！「${this.machine.name}」が うごいたよ！`;
      this.sound.playSuccessFanfare();
      clearTimeout(this.solveTimer);
      this.solveTimer = setTimeout(() => {
        showCelebrationOverlay(this.rootEl, {
          title: 'うごいたよ！',
          subtitle: `「${this.machine.name}」が かんせい！`,
          centerHtml: FLAT_ICONS.gearMini(64, '#FFD12E'),
          btnLabel: 'つぎの マシンへ',
          sound: this.sound,
          onNext: () => this.generatePuzzle()
        });
      }, 1250);
    } else if (!this.goalPowered) {
      this.tipEl.textContent = `はぐるま を つないで「${this.machine.name}」を うごかそう！`;
    }
  }

  handlePegTap(col, row) {
    if (this.solved) return;
    this.sound.unlock();
    if (this.blocked.has(`${col},${row}`)) {
      this.sound.playGentleNudge();
      return;
    }

    const existingIdx = this.gears.findIndex((g) => g.col === col && g.row === row);
    if (existingIdx >= 0) {
      const g = this.gears[existingIdx];
      if (g.fixed) {
        this.sound.playButtonDown('yellow');
        return;
      }
      if (this.tool === 'erase' || g.size === this.tool) {
        this.gears.splice(existingIdx, 1);
        this.sound.playGearRemove();
        this.solveNetwork();
        this.renderSvg();
        return;
      }
      // Replace with different size if clearance allows
      if (this.canPlaceAt(col, row, this.tool)) {
        g.size = this.tool;
        this.sound.playGearSnap(this.tool);
        this.solveNetwork();
        this.renderSvg();
      } else {
        this.sound.playGentleNudge();
        this.boardEl.classList.remove('is-jammed');
        void this.boardEl.offsetWidth;
        this.boardEl.classList.add('is-jammed');
      }
      return;
    }

    if (this.tool === 'erase') return;

    if (this.canPlaceAt(col, row, this.tool)) {
      const pos = this.pegCoords(col, row);
      this.gears.push({
        id: `g_${col}_${row}`,
        col, row, x: pos.x, y: pos.y,
        size: this.tool,
        fixed: false,
        role: 'user',
        omega: 0,
        phase: 0
      });
      this.sound.playGearSnap(this.tool);
      this.solveNetwork();
      this.renderSvg();
    } else {
      // Physically blocked by adjacent gear overlap
      this.sound.playGentleNudge();
      this.boardEl.classList.remove('is-jammed');
      void this.boardEl.offsetWidth;
      this.boardEl.classList.add('is-jammed');
    }
  }

  renderGoalMachineSvg(goalY) {
    const m = this.machine.id;
    const cx = 775;
    const cy = 240;
    const shaft = `
      <path d="M ${GM_OX + (GM_COLS - 1) * GM_STEP} ${goalY} L 685 ${goalY} L 685 ${cy} L 710 ${cy}"
            fill="none" stroke="${this.goalPowered ? '#FFD12E' : 'rgba(255,255,255,0.45)'}"
            stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    `;

    if (m === 'clock') {
      return `
        ${shaft}
        <g id="gm-machine">
          <circle cx="${cx}" cy="${cy}" r="74" fill="#FFFFFF" stroke="#FFD12E" stroke-width="10"/>
          <circle cx="${cx}" cy="${cy - 54}" r="5" fill="#94A3B8"/>
          <circle cx="${cx + 54}" cy="${cy}" r="5" fill="#94A3B8"/>
          <circle cx="${cx}" cy="${cy + 54}" r="5" fill="#94A3B8"/>
          <circle cx="${cx - 54}" cy="${cy}" r="5" fill="#94A3B8"/>
          <line id="gm-clock-h" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 32}" stroke="#1E293B" stroke-width="9" stroke-linecap="round"/>
          <line id="gm-clock-m" x1="${cx}" y1="${cy}" x2="${cx + 44}" y2="${cy}" stroke="#FF595E" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${cx}" cy="${cy}" r="8" fill="#1E293B"/>
        </g>
      `;
    }

    if (m === 'signal') {
      return `
        ${shaft}
        <g id="gm-machine">
          <rect x="${cx - 46}" y="${cy - 102}" width="92" height="204" rx="28" fill="#1E293B" stroke="#FFFFFF" stroke-width="7"/>
          <circle id="gm-sig-r" cx="${cx}" cy="${cy - 58}" r="23" fill="#475569"/>
          <circle id="gm-sig-y" cx="${cx}" cy="${cy}"      r="23" fill="#475569"/>
          <circle id="gm-sig-g" cx="${cx}" cy="${cy + 58}" r="23" fill="#475569"/>
        </g>
      `;
    }

    if (m === 'fan') {
      return `
        ${shaft}
        <g id="gm-machine">
          <rect x="${cx - 12}" y="${cy + 40}" width="24" height="62" rx="10" fill="#CBD5E1"/>
          <rect x="${cx - 46}" y="${cy + 92}" width="92" height="18" rx="9" fill="#FFFFFF"/>
          <circle cx="${cx}" cy="${cy}" r="74" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" stroke-width="8"/>
          <g id="gm-fan-blades" transform="translate(${cx}, ${cy})">
            <ellipse cx="0" cy="-34" rx="16" ry="30" fill="#38BDF8" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="0" cy="34"  rx="16" ry="30" fill="#38BDF8" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="-34" cy="0" rx="30" ry="16" fill="#67E8F9" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="34"  cy="0" rx="30" ry="16" fill="#67E8F9" stroke="#FFFFFF" stroke-width="4"/>
            <circle cx="0" cy="0" r="14" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4"/>
          </g>
        </g>
      `;
    }

    // 'musicbox'
    return `
      ${shaft}
      <g id="gm-machine">
        <rect x="${cx - 64}" y="${cy - 44}" width="128" height="96" rx="22" fill="#FF85B3" stroke="#FFFFFF" stroke-width="7"/>
        <rect x="${cx - 46}" y="${cy - 22}" width="92" height="52" rx="12" fill="#FFF1F2"/>
        <g id="gm-music-note" transform="translate(${cx}, ${cy})">
          <path d="M-8 14 V-12 L14 -17 V9" stroke="#FF4757" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <circle cx="-13" cy="14" r="7" fill="#FF4757"/>
          <circle cx="9" cy="9" r="7" fill="#FF4757"/>
        </g>
      </g>
    `;
  }

  renderSvg() {
    let pegsHtml = '';
    for (let r = 0; r < GM_ROWS; r++) {
      for (let c = 0; c < GM_COLS; c++) {
        const { x, y } = this.pegCoords(c, r);
        const isBlocked = this.blocked.has(`${c},${r}`);
        if (isBlocked) {
          pegsHtml += `
            <g>
              <circle cx="${x}" cy="${y}" r="22" fill="rgba(15,23,42,0.45)" stroke="rgba(255,255,255,0.35)" stroke-width="4"/>
              <line x1="${x - 9}" y1="${y - 9}" x2="${x + 9}" y2="${y + 9}" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/>
              <line x1="${x + 9}" y1="${y - 9}" x2="${x - 9}" y2="${y + 9}" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/>
            </g>
          `;
        } else {
          pegsHtml += `
            <circle cx="${x}" cy="${y}" r="11" fill="rgba(255,255,255,0.38)" stroke="rgba(255,255,255,0.65)" stroke-width="3"/>
          `;
        }
      }
    }

    let gearsHtml = '';
    this.gears.forEach((g) => {
      const spec = GM_SPECS[g.size];
      const fill = g.role === 'start' ? '#FFD12E' : (g.role === 'goal' ? '#4ADE80' : spec.color);
      const stroke = g.role === 'start' ? '#B45309' : (g.role === 'goal' ? '#15803D' : spec.stroke);
      const innerR = Math.max(11, spec.r * 0.42);
      gearsHtml += `
        <g transform="translate(${g.x}, ${g.y})">
          <g class="gm-gear-rot" data-gear-id="${g.id}">
            <path d="${GM_GEAR_PATHS[g.size]}" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
            <circle cx="0" cy="0" r="${innerR}" fill="#FFFFFF" opacity="0.35"/>
            <circle cx="${(innerR * 0.58).toFixed(1)}" cy="0" r="5" fill="#FFFFFF"/>
            <circle cx="${(-innerR * 0.58).toFixed(1)}" cy="0" r="5" fill="#FFFFFF"/>
            <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="${stroke}" stroke-width="3.5"/>
          </g>
          ${g.role === 'start' ? `<text x="0" y="${spec.r + 24}" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="900">スタート</text>` : ''}
          ${g.role === 'goal'  ? `<text x="0" y="${spec.r + 24}" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="900">ゴール</text>` : ''}
        </g>
      `;
    });

    // Interactive peg hit targets on top
    let hitsHtml = '';
    for (let r = 0; r < GM_ROWS; r++) {
      for (let c = 0; c < GM_COLS; c++) {
        const { x, y } = this.pegCoords(c, r);
        hitsHtml += `<circle class="gm-peg-hit" cx="${x}" cy="${y}" r="44" data-col="${c}" data-row="${r}"/>`;
      }
    }

    const goalGear = this.gears.find((g) => g.role === 'goal');
    const goalY = goalGear ? goalGear.y : 240;

    this.svgEl.innerHTML = `
      ${pegsHtml}
      ${this.renderGoalMachineSvg(goalY)}
      ${gearsHtml}
      ${hitsHtml}
    `;

    this.svgEl.querySelectorAll('.gm-peg-hit').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handlePegTap(Number(el.dataset.col), Number(el.dataset.row));
      });
    });

    this.applyGearTransforms();
  }

  applyGearTransforms() {
    for (const g of this.gears) {
      const el = this.svgEl.querySelector(`[data-gear-id="${g.id}"]`);
      if (!el) continue;
      const angleRad = g.phase + g.omega * this.simTime;
      const angleDeg = (angleRad * 180) / Math.PI;
      el.setAttribute('transform', `rotate(${angleDeg.toFixed(2)})`);
    }
  }

  tickAnimation(dt) {
    this.simTime += dt;
    this.applyGearTransforms();

    if (!this.goalPowered) return;

    const m = this.machine.id;
    if (m === 'clock') {
      const hEl = this.svgEl.querySelector('#gm-clock-h');
      const mEl = this.svgEl.querySelector('#gm-clock-m');
      if (hEl && mEl) {
        const degM = (this.simTime * 190) % 360;
        const degH = (this.simTime * 28) % 360;
        mEl.setAttribute('transform', `rotate(${degM.toFixed(1)} 775 240)`);
        hEl.setAttribute('transform', `rotate(${degH.toFixed(1)} 775 240)`);
      }
    } else if (m === 'signal') {
      const idx = Math.floor(this.simTime * 2.2) % 3;
      const rEl = this.svgEl.querySelector('#gm-sig-r');
      const yEl = this.svgEl.querySelector('#gm-sig-y');
      const gEl = this.svgEl.querySelector('#gm-sig-g');
      if (rEl && yEl && gEl) {
        rEl.setAttribute('fill', idx === 0 ? '#FF4757' : '#475569');
        yEl.setAttribute('fill', idx === 1 ? '#FFD32A' : '#475569');
        gEl.setAttribute('fill', idx === 2 ? '#2ED573' : '#475569');
      }
    } else if (m === 'fan') {
      const fEl = this.svgEl.querySelector('#gm-fan-blades');
      if (fEl) {
        const deg = (this.simTime * 420) % 360;
        fEl.setAttribute('transform', `translate(775, 240) rotate(${deg.toFixed(1)})`);
      }
    } else if (m === 'musicbox') {
      const nEl = this.svgEl.querySelector('#gm-music-note');
      if (nEl) {
        const bob = Math.sin(this.simTime * 7) * 9;
        nEl.setAttribute('transform', `translate(775, ${(240 + bob).toFixed(1)})`);
      }
    }
  }
}
