import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';

/* =========================================================================
   GEAR MACHINE V2 — Drag & Drop + Tetris-like Gear Tray + Exact Meshing
   Module m = 8px (pitchR = 4 * teeth):
     S: 8 teeth,  R = 32px
     M: 12 teeth, R = 48px
     L: 16 teeth, R = 64px
   Every generated puzzle guarantees S/M/L variety and exact geometric fit.
   ========================================================================= */
const GM_SPECS = {
  S: { teeth: 8,  r: 32, color: '#38BDF8', stroke: '#0284C7', label: 'ちいさい' },
  M: { teeth: 12, r: 48, color: '#FF924C', stroke: '#C85A17', label: 'ふつう' },
  L: { teeth: 16, r: 64, color: '#A78BFA', stroke: '#6D28D9', label: 'おおきい' }
};

const GM_MACHINES = [
  { id: 'clock',    name: 'とけい' },
  { id: 'signal',   name: 'しんごうき' },
  { id: 'fan',      name: 'せんぷうき' },
  { id: 'musicbox', name: 'おるごーる' }
];

function buildGearPath(teeth, pitchR) {
  const addendum = 6.0;
  const dedendum = 6.6;
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

function ensureGearStyles() {
  if (document.getElementById('gm-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'gm-v2-styles';
  style.textContent = `
    .gm-tray-bar {
      width: 100%;
      max-width: 920px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(10px, 1.8vw, 18px);
      background: rgba(15, 23, 42, 0.28);
      border: 4px solid rgba(255, 255, 255, 0.35);
      border-radius: 28px;
      padding: 8px 16px;
      z-index: 15;
      flex-wrap: wrap;
    }
    .gm-tray-label {
      color: #FEF08A;
      font-size: clamp(13px, 1.6vw, 16px);
      font-weight: 900;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .gm-tray-slots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(10px, 1.6vw, 16px);
      min-height: 76px;
      flex-wrap: wrap;
    }
    .gm-tray-item {
      position: relative;
      width: 78px;
      height: 78px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.92);
      border: 4px solid #FFFFFF;
      box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18);
      display: grid;
      place-items: center;
      cursor: grab;
      touch-action: none;
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease;
    }
    .gm-tray-item.is-next {
      border-color: #FFD12E;
      box-shadow: 0 0 0 4px rgba(255, 209, 46, 0.55), 0 6px 0 #C28A00;
      transform: translateY(-2px);
    }
    .gm-tray-item:active {
      cursor: grabbing;
      transform: scale(0.94);
    }
    .gm-next-badge {
      position: absolute;
      top: -11px;
      left: 50%;
      transform: translateX(-50%);
      background: #FFD12E;
      color: #4D3300;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 9px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 2px 0 #C28A00;
    }
    .gm-drag-ghost {
      position: fixed;
      pointer-events: none;
      z-index: 90;
      transform: translate(-50%, -50%) scale(1.08);
      filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.3));
    }
  `;
  document.head.appendChild(style);
}

export default class GearMachineGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.level = 1;     // 1..5 progressive complexity
    this.pegs = [];     // { id, x, y, role: 'start'|'goal'|'slot'|'decoy', expectedSize? }
    this.gears = [];    // { id, pegId, x, y, size, fixed, role, omega, phase }
    this.tray = [];     // { uid, size }
    this.machine = GM_MACHINES[0];

    this.jammed = false;
    this.goalPowered = false;
    this.solved = false;
    this.simTime = 0;
    this.lastFrame = 0;
    this.rafId = null;
    this.solveTimer = null;

    // Drag state
    this.drag = null;
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
  }

  mount() {
    ensureGearStyles();
    this.app.setGameBackground('#0F766E');

    this.container.innerHTML = `
      <div class="gm-root" id="gm-root">
        <div class="lb-title-area" style="margin-top:2px;">
          <h2 class="lb-circuit-name">はぐるま</h2>
          <p class="lb-circuit-tip" id="gm-tip">はぐるま を ひっぱって はめよう！</p>
        </div>

        <div class="pm-mode-tabs" id="gm-levels">
          <button class="pm-tab-btn is-active" type="button" data-glv="1">${FLAT_ICONS.stars(1, 14)}<span>1</span></button>
          <button class="pm-tab-btn" type="button" data-glv="2">${FLAT_ICONS.stars(2, 14)}<span>2</span></button>
          <button class="pm-tab-btn" type="button" data-glv="3">${FLAT_ICONS.stars(3, 14)}<span>3</span></button>
          <button class="pm-tab-btn" type="button" data-glv="4">${FLAT_ICONS.stars(4, 13)}<span>4</span></button>
          <button class="pm-tab-btn" type="button" data-glv="5">${FLAT_ICONS.stars(5, 12)}<span>5</span></button>
        </div>

        <div class="gm-viewport">
          <div class="gm-board" id="gm-board">
            <svg class="gm-svg" id="gm-svg" viewBox="0 0 900 480"></svg>
          </div>
        </div>

        <div class="gm-tray-bar">
          <span class="gm-tray-label">つぎの はぐるま</span>
          <div class="gm-tray-slots" id="gm-tray-slots"></div>
          <button class="gm-tool-btn" type="button" id="gm-new-btn" style="height:56px;">
            ${FLAT_ICONS.refresh(22)}<span>べつの おだい</span>
          </button>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#gm-root');
    this.tipEl = this.container.querySelector('#gm-tip');
    this.boardEl = this.container.querySelector('#gm-board');
    this.svgEl = this.container.querySelector('#gm-svg');
    this.traySlotsEl = this.container.querySelector('#gm-tray-slots');
    this.levelBtns = Array.from(this.container.querySelectorAll('[data-glv]'));

    this.levelBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.setLevel(Number(btn.dataset.glv));
      });
    });

    this.container.querySelector('#gm-new-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.generatePuzzle();
    });

    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.gearElMap = new Map();
    this.goalElCache = {};
    this.paused = false;

    this.generatePuzzle();
    this.startLoop();
  }

  startLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastFrame = performance.now();
    const MIN_FRAME_MS = 32; // ~30fps cap to prevent 120Hz iPad thermal throttling
    const loop = (now) => {
      if (this.paused) {
        this.rafId = null;
        return;
      }
      const elapsed = now - this.lastFrame;
      if (elapsed >= MIN_FRAME_MS) {
        const dt = Math.min(0.06, elapsed / 1000);
        this.lastFrame = now;
        this.tickAnimation(dt);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  onPause() {
    this.paused = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  onResume() {
    if (!this.paused) return;
    this.paused = false;
    this.startLoop();
  }

  setLevel(lv) {
    this.level = Math.max(1, Math.min(5, lv));
    this.levelBtns.forEach((b) => b.classList.toggle('is-active', Number(b.dataset.glv) === this.level));
    this.sound.playPageTurn(1);
    this.generatePuzzle();
  }

  unmount() {
    this.paused = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    clearTimeout(this.solveTimer);
    this.cleanupDrag();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.container.innerHTML = '';
  }

  /**
   * Generate a guaranteed-solvable chain puzzle scaling across 5 levels:
   *   Lv.1: 3 middle gears
   *   Lv.2: 4 middle gears (zigzag)
   *   Lv.3: 5 middle gears + 1 decoy peg
   *   Lv.4: 6 middle gears + 2 decoy pegs + 1 extra decoy tray gear
   *   Lv.5: 7 middle gears (serpentine) + 2 decoy pegs + 2 extra decoy tray gears
   */
  generatePuzzle() {
    clearTimeout(this.solveTimer);
    this.cleanupDrag();
    this.solved = false;
    this.goalPowered = false;
    this.jammed = false;

    const candidates = GM_MACHINES.filter((m) => m.id !== this.machine.id);
    this.machine = candidates[Math.floor(Math.random() * candidates.length)];

    const levelCfg = {
      1: { middleCount: 3, decoyPegs: 0, extraTray: 0 },
      2: { middleCount: 4, decoyPegs: 0, extraTray: 0 },
      3: { middleCount: 5, decoyPegs: 1, extraTray: 0 },
      4: { middleCount: 6, decoyPegs: 2, extraTray: 1 },
      5: { middleCount: 7, decoyPegs: 2, extraTray: 2 }
    }[this.level];

    const totalLen = levelCfg.middleCount + 2; // start + middle + goal
    const sizesPool = ['S', 'M', 'L'];

    let built = null;
    for (let attempt = 0; attempt < 90; attempt++) {
      // Build a size sequence guaranteed to include S, M, and L
      const seq = [];
      for (let i = 0; i < totalLen; i++) {
        seq.push(sizesPool[Math.floor(Math.random() * sizesPool.length)]);
      }
      if (!seq.includes('S') || !seq.includes('L')) {
        seq[1] = 'S';
        seq[2] = 'L';
      }

      const nodes = [{ size: seq[0], x: 96, y: 120 + Math.random() * 240 }];
      let ok = true;

      for (let i = 1; i < seq.length; i++) {
        const prev = nodes[i - 1];
        const rPrev = GM_SPECS[prev.size].r;
        const rCur = GM_SPECS[seq[i]].r;
        const dist = rPrev + rCur;

        let placed = null;
        // Allow steeper serpentine turns for longer chains (Lv.3..5)
        const angleSpread = totalLen >= 7 ? 2.15 : (totalLen >= 6 ? 1.75 : 1.25);

        for (let t = 0; t < 36; t++) {
          let angle = (Math.random() - 0.5) * angleSpread;
          // On final step, prefer heading rightward toward the goal machine
          if (i === seq.length - 1) angle *= 0.45;
          const nx = prev.x + Math.cos(angle) * dist;
          const ny = prev.y + Math.sin(angle) * dist;

          if (nx < 88 || nx > 632 || ny < 74 || ny > 406) continue;

          let conflict = false;
          for (let j = 0; j < nodes.length - 1; j++) {
            const other = nodes[j];
            const dOther = Math.hypot(nx - other.x, ny - other.y);
            const minClear = rCur + GM_SPECS[other.size].r + 14;
            if (dOther < minClear) { conflict = true; break; }
          }
          if (!conflict) {
            placed = { size: seq[i], x: Math.round(nx), y: Math.round(ny) };
            break;
          }
        }
        if (!placed) { ok = false; break; }
        nodes.push(placed);
      }

      if (ok && nodes[nodes.length - 1].x >= 460) {
        built = nodes;
        break;
      }
    }

    // Guaranteed serpentine fallback if random placement didn't converge
    if (!built) {
      const fbSizes = ['M', 'S', 'L', 'S', 'M', 'L', 'S', 'M', 'S'].slice(0, totalLen);
      built = [{ size: fbSizes[0], x: 96, y: 240 }];
      for (let i = 1; i < fbSizes.length; i++) {
        const prev = built[i - 1];
        const d = GM_SPECS[prev.size].r + GM_SPECS[fbSizes[i]].r;
        const ang = i % 2 === 1 ? -0.68 : 0.68;
        built.push({
          size: fbSizes[i],
          x: Math.round(prev.x + Math.cos(ang) * d),
          y: Math.round(prev.y + Math.sin(ang) * d)
        });
      }
    }

    // Center horizontally in pegboard area (x: 92..624)
    const minX = Math.min(...built.map((n) => n.x));
    const maxX = Math.max(...built.map((n) => n.x));
    const shiftX = Math.round(((96 + 616) - (minX + maxX)) / 2);
    built.forEach((n) => { n.x = Math.max(84, Math.min(634, n.x + shiftX)); });

    this.pegs = built.map((n, idx) => ({
      id: idx === 0 ? 'peg_start' : (idx === built.length - 1 ? 'peg_goal' : `peg_${idx}`),
      x: n.x,
      y: n.y,
      role: idx === 0 ? 'start' : (idx === built.length - 1 ? 'goal' : 'slot'),
      expectedSize: n.size
    }));

    // Add decoy pegs for Lv.3..5 (placed safely away from existing pegs)
    for (let d = 0; d < levelCfg.decoyPegs; d++) {
      for (let t = 0; t < 30; t++) {
        const dx = 150 + Math.round(Math.random() * 420);
        const dy = 86 + Math.round(Math.random() * 308);
        const tooClose = this.pegs.some((p) => Math.hypot(p.x - dx, p.y - dy) < 88);
        if (!tooClose) {
          this.pegs.push({ id: `peg_decoy_${d}`, x: dx, y: dy, role: 'slot', isDecoy: true });
          break;
        }
      }
    }

    // Fixed start and goal gears
    const first = this.pegs[0];
    const last = this.pegs[built.length - 1];
    this.gears = [
      { id: 'start', pegId: first.id, x: first.x, y: first.y, size: first.expectedSize, fixed: true, role: 'start', omega: 1.5, phase: 0 },
      { id: 'goal',  pegId: last.id,  x: last.x,  y: last.y,  size: last.expectedSize,  fixed: true, role: 'goal',  omega: 0,   phase: 0 }
    ];

    // Build shuffled tray from required middle pieces + optional extra decoy gears (Lv.4..5)
    const traySizes = built.slice(1, -1).map((n) => n.size);
    for (let ex = 0; ex < levelCfg.extraTray; ex++) {
      traySizes.push(sizesPool[Math.floor(Math.random() * sizesPool.length)]);
    }
    for (let i = traySizes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [traySizes[i], traySizes[j]] = [traySizes[j], traySizes[i]];
    }
    this.tray = traySizes.map((size, idx) => ({ uid: `piece_${Date.now()}_${idx}`, size }));

    this.tipEl.textContent = `Lv.${this.level}：「${this.machine.name}」を うごかそう！`;
    this.solveNetwork();
    this.renderAll();
  }

  /** Check strict physical non-overlapping clearance at a target peg */
  canPlaceAtPeg(peg, size, ignoreGearId = null) {
    if (!peg || peg.role === 'start' || peg.role === 'goal') return false;
    const occupied = this.gears.some((g) => g.pegId === peg.id && g.id !== ignoreGearId);
    if (occupied) return false;

    const rNew = GM_SPECS[size].r;
    for (const g of this.gears) {
      if (g.id === ignoreGearId) continue;
      const dist = Math.hypot(g.x - peg.x, g.y - peg.y);
      const minDist = rNew + GM_SPECS[g.size].r - 2.5;
      if (dist < minDist) return false;
    }
    return true;
  }

  /** Exact BFS meshing, gear-ratio speed, phase angle & jam detection */
  solveNetwork() {
    for (const g of this.gears) {
      g.omega = 0;
      g.visited = false;
    }
    this.jammed = false;

    const startGear = this.gears.find((g) => g.role === 'start');
    if (!startGear) return;

    startGear.omega = 1.5;
    startGear.phase = 0;
    startGear.visited = true;

    const queue = [startGear];
    const MESH_TOL = 3.2;

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
          const expectedPhase =
            theta + Math.PI + (Math.PI / nxtSpec.teeth) - (cur.phase - theta) * (curSpec.teeth / nxtSpec.teeth);

          if (!nxt.visited) {
            nxt.visited = true;
            nxt.omega = expectedOmega;
            nxt.phase = expectedPhase;
            queue.push(nxt);
          } else if (Math.abs(nxt.omega - expectedOmega) > 0.02) {
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
      }, 1200);
    } else if (!this.goalPowered) {
      this.tipEl.textContent = `はぐるま を ひっぱって「${this.machine.name}」を うごかそう！`;
    }
  }

  /* ==================== DRAG & DROP INTERACTION ==================== */
  clientToSvg(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 900;
    const y = ((clientY - rect.top) / rect.height) * 480;
    return { x, y, inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom };
  }

  startDrag(e, { source, uid, size, originPegId = null }) {
    if (this.solved) return;
    e.preventDefault();
    this.sound.unlock();
    this.cleanupDrag();

    // If dragging from board, temporarily remove it from gears
    if (source === 'board') {
      const idx = this.gears.findIndex((g) => g.id === uid);
      if (idx >= 0) this.gears.splice(idx, 1);
      this.solveNetwork();
      this.renderSvg();
    }

    const spec = GM_SPECS[size];
    const ghostSize = spec.r * 2 + 26;
    const ghost = document.createElement('div');
    ghost.className = 'gm-drag-ghost';
    ghost.innerHTML = `
      <svg width="${ghostSize}" height="${ghostSize}" viewBox="${-spec.r - 12} ${-spec.r - 12} ${(spec.r + 12) * 2} ${(spec.r + 12) * 2}">
        <path d="${GM_GEAR_PATHS[size]}" fill="${spec.color}" stroke="${spec.stroke}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="${spec.stroke}" stroke-width="3.5"/>
      </svg>
    `;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    this.drag = {
      pointerId: e.pointerId,
      source,
      uid,
      size,
      originPegId,
      ghostEl: ghost,
      snapPeg: null,
      canSnap: false
    };

    this.sound.playButtonDown('yellow');
    this.updateDragSnap(e.clientX, e.clientY);
  }

  updateDragSnap(clientX, clientY) {
    if (!this.drag) return;
    this.drag.ghostEl.style.left = `${clientX}px`;
    this.drag.ghostEl.style.top = `${clientY}px`;

    const pt = this.clientToSvg(clientX, clientY);
    let bestPeg = null;
    let bestDist = 66;

    if (pt.inside) {
      for (const peg of this.pegs) {
        if (peg.role !== 'slot') continue;
        const d = Math.hypot(peg.x - pt.x, peg.y - pt.y);
        if (d < bestDist) {
          bestDist = d;
          bestPeg = peg;
        }
      }
    }

    this.drag.snapPeg = bestPeg;
    this.drag.canSnap = bestPeg ? this.canPlaceAtPeg(bestPeg, this.drag.size) : false;
    this.renderSnapPreview();
  }

  handlePointerMove(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    e.preventDefault();
    this.updateDragSnap(e.clientX, e.clientY);
  }

  handlePointerUp(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    const d = this.drag;
    this.cleanupDrag();

    if (d.snapPeg && d.canSnap) {
      // Snap into peg!
      if (d.source === 'tray') {
        const tIdx = this.tray.findIndex((t) => t.uid === d.uid);
        if (tIdx >= 0) this.tray.splice(tIdx, 1);
      }
      this.gears.push({
        id: d.uid,
        pegId: d.snapPeg.id,
        x: d.snapPeg.x,
        y: d.snapPeg.y,
        size: d.size,
        fixed: false,
        role: 'user',
        omega: 0,
        phase: 0
      });
      this.sound.playGearSnap(d.size);
    } else {
      // Return to tray (if dragged from board) or stay in tray
      if (d.source === 'board') {
        this.tray.unshift({ uid: d.uid, size: d.size });
        this.sound.playGearRemove();
      } else if (d.snapPeg && !d.canSnap) {
        this.sound.playGentleNudge();
        this.boardEl.classList.remove('is-jammed');
        void this.boardEl.offsetWidth;
        this.boardEl.classList.add('is-jammed');
      }
    }

    this.solveNetwork();
    this.renderAll();
  }

  cleanupDrag() {
    if (this.drag && this.drag.ghostEl) {
      this.drag.ghostEl.remove();
    }
    this.drag = null;
    const prev = this.svgEl && this.svgEl.querySelector('#gm-snap-preview');
    if (prev) prev.innerHTML = '';
  }

  renderSnapPreview() {
    const layer = this.svgEl.querySelector('#gm-snap-preview');
    if (!layer) return;
    if (!this.drag || !this.drag.snapPeg) {
      layer.innerHTML = '';
      return;
    }
    const peg = this.drag.snapPeg;
    const spec = GM_SPECS[this.drag.size];
    if (this.drag.canSnap) {
      layer.innerHTML = `
        <g transform="translate(${peg.x}, ${peg.y})">
          <circle cx="0" cy="0" r="${spec.r + 12}" fill="rgba(74,222,128,0.22)" stroke="#4ADE80" stroke-width="5" stroke-dasharray="10 8"/>
          <path d="${GM_GEAR_PATHS[this.drag.size]}" fill="${spec.color}" opacity="0.52" stroke="#FFFFFF" stroke-width="3"/>
        </g>
      `;
    } else {
      layer.innerHTML = `
        <g transform="translate(${peg.x}, ${peg.y})">
          <circle cx="0" cy="0" r="${spec.r + 6}" fill="rgba(239,68,68,0.24)" stroke="#FF6B6B" stroke-width="5"/>
          <line x1="-18" y1="-18" x2="18" y2="18" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
          <line x1="18" y1="-18" x2="-18" y2="18" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
        </g>
      `;
    }
  }

  /* ==================== RENDERING ==================== */
  renderAll() {
    this.renderSvg();
    this.renderTray();
  }

  renderTray() {
    this.traySlotsEl.innerHTML = '';
    if (this.tray.length === 0) {
      this.traySlotsEl.innerHTML = `<span style="color:rgba(255,255,255,0.85);font-weight:900;font-size:15px;">ぜんぶ おいたよ！</span>`;
      return;
    }

    this.tray.forEach((piece, idx) => {
      const spec = GM_SPECS[piece.size];
      const item = document.createElement('div');
      item.className = `gm-tray-item ${idx === 0 ? 'is-next' : ''}`;
      const viewR = 76;
      item.innerHTML = `
        ${idx === 0 ? '<span class="gm-next-badge">つぎ！</span>' : ''}
        <svg width="64" height="64" viewBox="${-viewR} ${-viewR} ${viewR * 2} ${viewR * 2}">
          <path d="${GM_GEAR_PATHS[piece.size]}" fill="${spec.color}" stroke="${spec.stroke}" stroke-width="5" stroke-linejoin="round"/>
          <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="${spec.stroke}" stroke-width="4"/>
        </svg>
      `;
      item.addEventListener('pointerdown', (e) => {
        this.startDrag(e, { source: 'tray', uid: piece.uid, size: piece.size });
      });
      this.traySlotsEl.appendChild(item);
    });
  }

  renderGoalMachineSvg(goalPeg) {
    const m = this.machine.id;
    const cx = 785;
    const cy = 240;
    const shaft = `
      <path d="M ${goalPeg.x} ${goalPeg.y} L 690 ${goalPeg.y} L 690 ${cy} L 712 ${cy}"
            fill="none" stroke="${this.goalPowered ? '#FFD12E' : 'rgba(255,255,255,0.45)'}"
            stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    `;

    if (m === 'clock') {
      return `
        ${shaft}
        <g id="gm-machine">
          <circle cx="${cx}" cy="${cy}" r="72" fill="#FFFFFF" stroke="#FFD12E" stroke-width="10"/>
          <circle cx="${cx}" cy="${cy - 52}" r="5" fill="#94A3B8"/>
          <circle cx="${cx + 52}" cy="${cy}" r="5" fill="#94A3B8"/>
          <circle cx="${cx}" cy="${cy + 52}" r="5" fill="#94A3B8"/>
          <circle cx="${cx - 52}" cy="${cy}" r="5" fill="#94A3B8"/>
          <line id="gm-clock-h" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 30}" stroke="#1E293B" stroke-width="9" stroke-linecap="round"/>
          <line id="gm-clock-m" x1="${cx}" y1="${cy}" x2="${cx + 42}" y2="${cy}" stroke="#FF595E" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${cx}" cy="${cy}" r="8" fill="#1E293B"/>
        </g>
      `;
    }

    if (m === 'signal') {
      return `
        ${shaft}
        <g id="gm-machine">
          <rect x="${cx - 44}" y="${cy - 98}" width="88" height="196" rx="28" fill="#1E293B" stroke="#FFFFFF" stroke-width="7"/>
          <circle id="gm-sig-r" cx="${cx}" cy="${cy - 56}" r="22" fill="#475569"/>
          <circle id="gm-sig-y" cx="${cx}" cy="${cy}"      r="22" fill="#475569"/>
          <circle id="gm-sig-g" cx="${cx}" cy="${cy + 56}" r="22" fill="#475569"/>
        </g>
      `;
    }

    if (m === 'fan') {
      return `
        ${shaft}
        <g id="gm-machine">
          <rect x="${cx - 12}" y="${cy + 40}" width="24" height="60" rx="10" fill="#CBD5E1"/>
          <rect x="${cx - 44}" y="${cy + 90}" width="88" height="18" rx="9" fill="#FFFFFF"/>
          <circle cx="${cx}" cy="${cy}" r="72" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" stroke-width="8"/>
          <g id="gm-fan-blades" transform="translate(${cx}, ${cy})">
            <ellipse cx="0" cy="-32" rx="15" ry="28" fill="#38BDF8" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="0" cy="32"  rx="15" ry="28" fill="#38BDF8" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="-32" cy="0" rx="28" ry="15" fill="#67E8F9" stroke="#FFFFFF" stroke-width="4"/>
            <ellipse cx="32"  cy="0" rx="28" ry="15" fill="#67E8F9" stroke="#FFFFFF" stroke-width="4"/>
            <circle cx="0" cy="0" r="14" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4"/>
          </g>
        </g>
      `;
    }

    return `
      ${shaft}
      <g id="gm-machine">
        <rect x="${cx - 60}" y="${cy - 44}" width="120" height="94" rx="22" fill="#FF85B3" stroke="#FFFFFF" stroke-width="7"/>
        <rect x="${cx - 42}" y="${cy - 22}" width="84" height="50" rx="12" fill="#FFF1F2"/>
        <g id="gm-music-note" transform="translate(${cx}, ${cy})">
          <path d="M-8 14 V-12 L14 -17 V9" stroke="#FF4757" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <circle cx="-13" cy="14" r="7" fill="#FF4757"/>
          <circle cx="9" cy="9" r="7" fill="#FF4757"/>
        </g>
      </g>
    `;
  }

  renderSvg() {
    const pegsHtml = this.pegs.map((peg) => {
      if (peg.role !== 'slot') return '';
      return `
        <g>
          <circle cx="${peg.x}" cy="${peg.y}" r="22" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.55)" stroke-width="4" stroke-dasharray="7 6"/>
          <circle cx="${peg.x}" cy="${peg.y}" r="9" fill="#FFFFFF"/>
        </g>
      `;
    }).join('');

    const gearsHtml = this.gears.map((g) => {
      const spec = GM_SPECS[g.size];
      const fill = g.role === 'start' ? '#FFD12E' : (g.role === 'goal' ? '#4ADE80' : spec.color);
      const stroke = g.role === 'start' ? '#B45309' : (g.role === 'goal' ? '#15803D' : spec.stroke);
      const innerR = Math.max(11, spec.r * 0.42);
      return `
        <g transform="translate(${g.x}, ${g.y})" ${!g.fixed ? `class="gm-user-gear" data-uid="${g.id}" style="cursor:grab;"` : ''}>
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
    }).join('');

    const goalPeg = this.pegs.find((p) => p.role === 'goal') || { x: 600, y: 240 };

    this.svgEl.innerHTML = `
      ${pegsHtml}
      ${this.renderGoalMachineSvg(goalPeg)}
      ${gearsHtml}
      <g id="gm-snap-preview"></g>
    `;

    // Allow dragging placed user gears to reposition or return to tray
    this.svgEl.querySelectorAll('.gm-user-gear').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        const uid = el.dataset.uid;
        const g = this.gears.find((item) => item.id === uid);
        if (!g) return;
        this.startDrag(e, { source: 'board', uid: g.id, size: g.size, originPegId: g.pegId });
      });
    });

    // Cache SVG elements to eliminate per-frame querySelector overhead
    this.gearElMap = new Map();
    this.svgEl.querySelectorAll('[data-gear-id]').forEach((el) => {
      this.gearElMap.set(el.dataset.gearId, el);
    });
    this.goalElCache = {
      clockH: this.svgEl.querySelector('#gm-clock-h'),
      clockM: this.svgEl.querySelector('#gm-clock-m'),
      sigR: this.svgEl.querySelector('#gm-sig-r'),
      sigY: this.svgEl.querySelector('#gm-sig-y'),
      sigG: this.svgEl.querySelector('#gm-sig-g'),
      fan: this.svgEl.querySelector('#gm-fan-blades'),
      note: this.svgEl.querySelector('#gm-music-note')
    };
    this.lastSignalIdx = -1;

    this.applyGearTransforms(true);
  }

  applyGearTransforms(forceAll = false) {
    for (const g of this.gears) {
      if (!forceAll && g.omega === 0) continue;
      const el = this.gearElMap.get(g.id);
      if (!el) continue;
      const angleRad = g.phase + g.omega * this.simTime;
      const angleDeg = (angleRad * 180) / Math.PI;
      el.setAttribute('transform', `rotate(${angleDeg.toFixed(1)})`);
    }
  }

  tickAnimation(dt) {
    this.simTime += dt;
    this.applyGearTransforms(false);
    if (!this.goalPowered) return;

    const m = this.machine.id;
    const c = this.goalElCache;
    if (m === 'clock') {
      if (c.clockH && c.clockM) {
        c.clockM.setAttribute('transform', `rotate(${((this.simTime * 190) % 360).toFixed(1)} 785 240)`);
        c.clockH.setAttribute('transform', `rotate(${((this.simTime * 28) % 360).toFixed(1)} 785 240)`);
      }
    } else if (m === 'signal') {
      const idx = Math.floor(this.simTime * 2.2) % 3;
      if (idx !== this.lastSignalIdx && c.sigR && c.sigY && c.sigG) {
        this.lastSignalIdx = idx;
        c.sigR.setAttribute('fill', idx === 0 ? '#FF4757' : '#475569');
        c.sigY.setAttribute('fill', idx === 1 ? '#FFD32A' : '#475569');
        c.sigG.setAttribute('fill', idx === 2 ? '#2ED573' : '#475569');
      }
    } else if (m === 'fan') {
      if (c.fan) {
        c.fan.setAttribute('transform', `translate(785, 240) rotate(${((this.simTime * 420) % 360).toFixed(1)})`);
      }
    } else if (m === 'musicbox') {
      if (c.note) {
        const bob = Math.sin(this.simTime * 7) * 9;
        c.note.setAttribute('transform', `translate(785, ${(240 + bob).toFixed(1)})`);
      }
    }
  }
}
