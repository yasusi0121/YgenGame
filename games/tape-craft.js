import {
  TAPE_CATALOG,
  TAPE_WIDTHS,
  PACKING_STAGES,
  REPAIR_STAGES,
  FREE_BACKGROUNDS,
  buildTapeDefsSvg,
  getTapeFill,
  renderRollIconSvg,
  buildTornStripPath
} from './tape-craft-stages.js';

const ROLL_MAX_PX = 1400; // Total tape length per roll before juicy auto-refill!

function pointToSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 0.001) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export default class TapeCraftGame {
  constructor(mountEl, sound) {
    this.mountEl = mountEl;
    this.sound = sound;

    this.mode = 'packing'; // 'packing' | 'repair' | 'free'
    this.stageIdx = 0;
    this.deliveredCount = 0;
    this.freeBgIdx = 0;

    this.selectedTape = TAPE_CATALOG[0];
    this.selectedWidth = TAPE_WIDTHS[0];
    this.toolMode = 'tape'; // 'tape' | 'peel' (in free mode)

    this.rollRemain = {};
    TAPE_CATALOG.forEach((t) => { this.rollRemain[t.id] = 1.0; });

    this.strips = []; // { id, x1, y1, x2, y2, tapeId, width, seed }
    this.nextStripId = 1;
    this.checkpoints = [];

    this.dragging = false;
    this.dragStart = null;
    this.dragCur = null;
    this.dragLastPullPos = null;
    this.rollAngle = 0;
    this.lastPullSoundAt = 0;
    this.peelTarget = null;

    this.stageState = 'playing'; // 'playing' | 'conveyor-out' | 'conveyor-in' | 'repair-reward'
    this.animT = 0;
    this.carAnim = null; // { active, pathIdx, segT }
    this.particles = []; // { x, y, vx, vy, color, size, life }
    this.refillToastTimer = null;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onPointerDown = (e) => this.handlePointerDown(e);
    this._onPointerMove = (e) => this.handlePointerMove(e);
    this._onPointerUp = (e) => this.handlePointerUp(e);
  }

  start() {
    this.injectStyles();
    this.renderShell();
    this.loadStage();
  }

  onPause() {
    this.paused = true;
    this.stopLoop();
  }

  onResume() {
    this.paused = false;
    if (this.needsLoop()) this.ensureLoop();
  }

  destroy() {
    this.destroyed = true;
    this.stopLoop();
    if (this.refillToastTimer) clearTimeout(this.refillToastTimer);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    if (this.mountEl) this.mountEl.innerHTML = '';
  }

  injectStyles() {
    if (document.getElementById('tc-styles')) return;
    const style = document.createElement('style');
    style.id = 'tc-styles';
    style.textContent = `
      .tc-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: linear-gradient(180deg, #FFF8EE 0%, #FDECD5 100%);
        user-select: none; -webkit-user-select: none; overflow: hidden;
        padding: 8px 12px 10px; box-sizing: border-box; gap: 8px;
      }
      .tc-topbar {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; flex-wrap: wrap; padding-left: 52px; padding-right: 52px;
        min-height: 44px;
      }
      .tc-modes { display: flex; gap: 6px; background: rgba(255,255,255,0.75); padding: 4px; border-radius: 16px; border: 2.5px solid #E5C7A3; }
      .tc-mode-btn {
        border: none; border-radius: 12px; padding: 7px 14px; font-size: 15px; font-weight: 900;
        background: transparent; color: #78350F; cursor: pointer; font-family: inherit;
        transition: transform 0.12s;
      }
      .tc-mode-btn.active { background: #F59E0B; color: #FFFFFF; box-shadow: 0 3px 0 #B45309; }
      .tc-mode-btn:active { transform: translateY(2px); }

      .tc-status {
        display: flex; align-items: center; gap: 10px; background: #FFFFFF;
        border: 2.5px solid #E5C7A3; border-radius: 16px; padding: 5px 12px;
      }
      .tc-hint { font-size: 14px; font-weight: 800; color: #78350F; white-space: nowrap; }
      .tc-prog-wrap { width: 92px; height: 14px; background: #F3E5D0; border-radius: 99px; overflow: hidden; border: 2px solid #D6B98C; }
      .tc-prog-bar { height: 100%; width: 0%; background: linear-gradient(90deg, #22C55E, #4ADE80); border-radius: 99px; transition: width 0.16s; }
      .tc-count-badge {
        background: #FEF3C7; color: #92400E; font-weight: 900; font-size: 14px;
        padding: 3px 10px; border-radius: 99px; border: 2px solid #F59E0B;
      }

      .tc-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        background: #FFFDF7; border-radius: 22px; border: 4px solid #D6B98C;
        box-shadow: 0 6px 0 rgba(180,130,80,0.22); overflow: hidden;
      }
      .tc-svg {
        width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair;
      }
      .tc-roll-hud {
        position: absolute; left: 10px; bottom: 10px; display: flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,0.92); border: 2.5px solid #D6B98C; border-radius: 16px;
        padding: 4px 10px 4px 6px; pointer-events: none;
      }
      .tc-roll-bar-bg { width: 52px; height: 10px; background: #E5E7EB; border-radius: 99px; overflow: hidden; }
      .tc-roll-bar { height: 100%; width: 100%; background: #F59E0B; border-radius: 99px; transition: width 0.12s; }
      .tc-roll-label { font-size: 12px; font-weight: 900; color: #78350F; }

      .tc-refill-toast {
        position: absolute; left: 50%; top: 14px; transform: translateX(-50%) scale(0.7);
        background: #F59E0B; color: #FFFFFF; font-size: 18px; font-weight: 900;
        padding: 8px 20px; border-radius: 99px; border: 3px solid #FFFFFF;
        box-shadow: 0 6px 0 #B45309; opacity: 0; pointer-events: none;
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
      }
      .tc-refill-toast.show { opacity: 1; transform: translateX(-50%) scale(1); }

      .tc-next-float {
        position: absolute; right: 14px; bottom: 14px; display: none;
        border: 3px solid #FFFFFF; border-radius: 18px; padding: 10px 20px;
        background: #22C55E; color: #FFFFFF; font-size: 18px; font-weight: 900;
        box-shadow: 0 5px 0 #15803D; cursor: pointer; font-family: inherit;
      }
      .tc-next-float.show { display: inline-flex; align-items: center; gap: 6px; }
      .tc-next-float:active { transform: translateY(3px); box-shadow: 0 2px 0 #15803D; }

      .tc-dock {
        display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.88);
        border: 3px solid #D6B98C; border-radius: 20px; padding: 6px 10px;
      }
      .tc-tools { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .tc-tool-btn {
        border: 2.5px solid #D6B98C; border-radius: 13px; padding: 6px 11px;
        background: #FFFDF7; color: #78350F; font-size: 13px; font-weight: 900;
        cursor: pointer; font-family: inherit; white-space: nowrap;
      }
      .tc-tool-btn.active { background: #3B82F6; color: #FFFFFF; border-color: #1D4ED8; box-shadow: 0 3px 0 #1D4ED8; }
      .tc-tool-btn.warn { background: #FEF2F2; color: #B91C1C; border-color: #FCA5A5; }
      .tc-tool-btn.go { background: #22C55E; color: #FFFFFF; border-color: #15803D; box-shadow: 0 3px 0 #15803D; }
      .tc-tool-btn:active { transform: translateY(2px); }

      .tc-rack {
        display: flex; align-items: center; gap: 6px; overflow-x: auto; flex: 1;
        padding: 2px 4px; -webkit-overflow-scrolling: touch; scrollbar-width: none;
      }
      .tc-rack::-webkit-scrollbar { display: none; }
      .tc-roll-btn {
        flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 1px;
        border: 2.5px solid transparent; border-radius: 14px; padding: 3px 6px;
        background: transparent; cursor: pointer; font-family: inherit;
        transition: transform 0.14s;
      }
      .tc-roll-btn.selected {
        background: #FEF3C7; border-color: #F59E0B; transform: translateY(-3px) scale(1.06);
        box-shadow: 0 3px 0 #D97706;
      }
      .tc-roll-name { font-size: 11px; font-weight: 800; color: #78350F; line-height: 1; }

      @media (max-width: 640px) {
        .tc-root { padding: 6px 6px 8px; gap: 6px; }
        .tc-topbar { padding-left: 44px; padding-right: 44px; gap: 5px; }
        .tc-mode-btn { padding: 5px 9px; font-size: 13px; }
        .tc-hint { font-size: 12px; }
        .tc-dock { flex-direction: column; align-items: stretch; padding: 6px; gap: 6px; }
        .tc-tools { justify-content: center; flex-wrap: wrap; }
        .tc-tool-btn { padding: 5px 9px; font-size: 12px; }
      }
      @media (max-height: 500px) and (orientation: landscape) {
        .tc-root { padding: 4px 8px 6px; gap: 4px; }
        .tc-topbar { min-height: 36px; }
        .tc-mode-btn { padding: 4px 10px; font-size: 13px; }
        .tc-dock { padding: 4px 8px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="tc-root">
        <div class="tc-topbar">
          <div class="tc-modes" role="tablist">
            <button class="tc-mode-btn active" data-mode="packing" type="button">おとどけ</button>
            <button class="tc-mode-btn" data-mode="repair" type="button">なおす</button>
            <button class="tc-mode-btn" data-mode="free" type="button">じゆう</button>
          </div>
          <div class="tc-status">
            <span class="tc-hint" id="tc-hint">テープを ひっぱって はろう！</span>
            <div class="tc-prog-wrap" id="tc-prog-wrap"><div class="tc-prog-bar" id="tc-prog-bar"></div></div>
            <span class="tc-count-badge" id="tc-count-badge">0こ</span>
          </div>
        </div>

        <div class="tc-stage-wrap">
          <svg class="tc-svg" id="tc-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildTapeDefsSvg()}
            <g id="tc-conveyor-bg"></g>
            <g id="tc-stage-group">
              <g id="tc-base-layer"></g>
              <g id="tc-guide-layer"></g>
              <g id="tc-strips-layer"></g>
              <g id="tc-reward-layer"></g>
            </g>
            <g id="tc-active-layer"></g>
            <g id="tc-fx-layer"></g>
          </svg>

          <div class="tc-roll-hud" id="tc-roll-hud">
            <span id="tc-roll-hud-icon"></span>
            <div>
              <div class="tc-roll-label" id="tc-roll-hud-label">クラフト</div>
              <div class="tc-roll-bar-bg"><div class="tc-roll-bar" id="tc-roll-bar"></div></div>
            </div>
          </div>

          <div class="tc-refill-toast" id="tc-refill-toast">あたらしい ロール！</div>
          <button class="tc-next-float" id="tc-next-btn" type="button">
            <span>つぎへ</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 5 L18 12 L8 19 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div class="tc-dock">
          <div class="tc-tools" id="tc-tools"></div>
          <div class="tc-rack" id="tc-rack"></div>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#tc-svg');
    this.conveyorBg = this.mountEl.querySelector('#tc-conveyor-bg');
    this.stageGroup = this.mountEl.querySelector('#tc-stage-group');
    this.baseLayer = this.mountEl.querySelector('#tc-base-layer');
    this.guideLayer = this.mountEl.querySelector('#tc-guide-layer');
    this.stripsLayer = this.mountEl.querySelector('#tc-strips-layer');
    this.rewardLayer = this.mountEl.querySelector('#tc-reward-layer');
    this.activeLayer = this.mountEl.querySelector('#tc-active-layer');
    this.fxLayer = this.mountEl.querySelector('#tc-fx-layer');

    this.hintEl = this.mountEl.querySelector('#tc-hint');
    this.progWrap = this.mountEl.querySelector('#tc-prog-wrap');
    this.progBar = this.mountEl.querySelector('#tc-prog-bar');
    this.countBadge = this.mountEl.querySelector('#tc-count-badge');
    this.rollHudIcon = this.mountEl.querySelector('#tc-roll-hud-icon');
    this.rollHudLabel = this.mountEl.querySelector('#tc-roll-hud-label');
    this.rollBar = this.mountEl.querySelector('#tc-roll-bar');
    this.refillToast = this.mountEl.querySelector('#tc-refill-toast');
    this.nextBtn = this.mountEl.querySelector('#tc-next-btn');
    this.toolsEl = this.mountEl.querySelector('#tc-tools');
    this.rackEl = this.mountEl.querySelector('#tc-rack');

    // Mode tabs
    this.mountEl.querySelectorAll('.tc-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.stageIdx = 0;
        this.toolMode = 'tape';
        this.carAnim = null;
        this.mountEl.querySelectorAll('.tc-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        this.renderTools();
        this.loadStage();
      });
    });

    this.nextBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.stageIdx++;
      this.loadStage();
    });

    this.svgEl.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove, { passive: false });
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);

    this.renderTools();
    this.renderRack();
    this.updateRollHud();
  }

  renderTools() {
    const isWide = this.selectedWidth.id === 'wide';
    const isFree = this.mode === 'free';
    this.toolsEl.innerHTML = `
      <button class="tc-tool-btn ${isWide ? 'active' : ''}" data-act="width" type="button">${isWide ? 'ふとい' : 'ほそい'}</button>
      ${isFree ? `
        <button class="tc-tool-btn ${this.toolMode === 'peel' ? 'active' : ''}" data-act="peel" type="button">はがす</button>
        <button class="tc-tool-btn go" data-act="car" type="button">くるま</button>
        <button class="tc-tool-btn" data-act="bg" type="button">${FREE_BACKGROUNDS[this.freeBgIdx].label}</button>
      ` : ''}
      <button class="tc-tool-btn warn" data-act="clear" type="button">やりなおす</button>
    `;
    this.toolsEl.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const act = btn.dataset.act;
        if (act === 'width') {
          this.selectedWidth = this.selectedWidth.id === 'wide' ? TAPE_WIDTHS[1] : TAPE_WIDTHS[0];
          this.sound.playPageTurn(1);
          this.renderTools();
        } else if (act === 'peel') {
          this.toolMode = this.toolMode === 'peel' ? 'tape' : 'peel';
          this.sound.playPageTurn(1);
          this.hintEl.textContent = this.toolMode === 'peel'
            ? 'テープを さわって ペリペリ はがそう！'
            : 'すきな いろを ペタペタ はろう！';
          this.renderTools();
        } else if (act === 'car') {
          if (this.strips.length === 0) {
            this.hintEl.textContent = 'まず テープで みちを はろう！';
            this.sound.playSoftBoing();
            return;
          }
          this.carAnim = { active: true, stripIdx: 0, segT: 0 };
          this.sound.playSparkle();
          this.ensureLoop();
        } else if (act === 'bg') {
          this.freeBgIdx = (this.freeBgIdx + 1) % FREE_BACKGROUNDS.length;
          this.sound.playPageTurn(1);
          this.renderTools();
          this.renderStageBase();
        } else if (act === 'clear') {
          this.strips = [];
          this.carAnim = null;
          this.rewardLayer.innerHTML = '';
          this.sound.playPageTurn(-1);
          this.renderStrips();
          this.evaluateProgress();
        }
      });
    });
  }

  renderRack() {
    this.rackEl.innerHTML = TAPE_CATALOG.map((t) => `
      <button class="tc-roll-btn ${t.id === this.selectedTape.id ? 'selected' : ''}" data-tape="${t.id}" type="button">
        <span class="tc-roll-svg-slot" data-slot="${t.id}">${renderRollIconSvg(t, this.rollRemain[t.id], 38)}</span>
        <span class="tc-roll-name">${t.name}</span>
      </button>
    `).join('');

    this.rackEl.querySelectorAll('.tc-roll-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const t = TAPE_CATALOG.find((x) => x.id === btn.dataset.tape);
        if (!t) return;
        this.selectedTape = t;
        this.toolMode = 'tape';
        this.playTapeStick();
        this.rackEl.querySelectorAll('.tc-roll-btn').forEach((b) => b.classList.toggle('selected', b.dataset.tape === t.id));
        this.renderTools();
        this.updateRollHud();
      });
    });
  }

  updateRollHud() {
    const t = this.selectedTape;
    const ratio = this.rollRemain[t.id];
    this.rollHudIcon.innerHTML = renderRollIconSvg(t, ratio, 36);
    this.rollHudLabel.textContent = t.name;
    this.rollBar.style.width = `${Math.round(ratio * 100)}%`;
    this.rollBar.style.background = ratio < 0.25 ? '#EF4444' : t.color;

    const slot = this.rackEl.querySelector(`[data-slot="${t.id}"]`);
    if (slot) slot.innerHTML = renderRollIconSvg(t, ratio, 38);
  }

  getCurrentStage() {
    if (this.mode === 'packing') return PACKING_STAGES[this.stageIdx % PACKING_STAGES.length];
    if (this.mode === 'repair') return REPAIR_STAGES[this.stageIdx % REPAIR_STAGES.length];
    return FREE_BACKGROUNDS[this.freeBgIdx];
  }

  loadStage() {
    this.strips = [];
    this.stageState = 'playing';
    this.animT = 0;
    this.carAnim = null;
    this.nextBtn.classList.remove('show');
    this.stageGroup.setAttribute('transform', '');
    this.rewardLayer.innerHTML = '';
    this.activeLayer.innerHTML = '';

    const st = this.getCurrentStage();
    this.buildCheckpoints(st.seams || []);

    if (this.mode === 'packing') {
      this.hintEl.textContent = st.hint;
      this.progWrap.style.display = '';
      this.countBadge.style.display = '';
      this.countBadge.textContent = `${this.deliveredCount}こ`;
    } else if (this.mode === 'repair') {
      this.hintEl.textContent = st.hint;
      this.progWrap.style.display = '';
      this.countBadge.style.display = 'none';
    } else {
      this.hintEl.textContent = 'すきな いろを ペタペタ はろう！';
      this.progWrap.style.display = 'none';
      this.countBadge.style.display = 'none';
    }

    this.renderStageBase();
    this.renderGuides();
    this.renderStrips();
    this.evaluateProgress();
  }

  buildCheckpoints(seams) {
    this.checkpoints = [];
    seams.forEach((s) => {
      const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
      const count = Math.max(5, Math.round(len / 34));
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        this.checkpoints.push({
          x: s.x1 + (s.x2 - s.x1) * t,
          y: s.y1 + (s.y2 - s.y1) * t,
          covered: false
        });
      }
    });
  }

  renderStageBase() {
    if (this.mode === 'packing') {
      this.conveyorBg.innerHTML = `
        <rect x="0" y="0" width="800" height="500" fill="#FFF8EE"/>
        <!-- Conveyor belt tracks -->
        <rect x="0" y="90" width="800" height="328" fill="#E2E8F0"/>
        <rect x="0" y="90" width="800" height="16" fill="#64748B"/>
        <rect x="0" y="402" width="800" height="16" fill="#64748B"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${24 + i * 68}" y="112" width="16" height="284" rx="8" fill="#CBD5E1"/>`).join('')}
      `;
      const st = this.getCurrentStage();
      this.baseLayer.innerHTML = this.stageState === 'conveyor-out' ? st.renderClosed() : st.renderOpen();
    } else if (this.mode === 'repair') {
      this.conveyorBg.innerHTML = '';
      this.baseLayer.innerHTML = this.getCurrentStage().renderBase();
    } else {
      this.conveyorBg.innerHTML = '';
      this.baseLayer.innerHTML = FREE_BACKGROUNDS[this.freeBgIdx].render();
    }
  }

  renderGuides() {
    if (this.mode === 'free' || this.stageState !== 'playing') {
      this.guideLayer.innerHTML = '';
      return;
    }
    const seams = this.getCurrentStage().seams || [];
    this.guideLayer.innerHTML = seams.map((s) => `
      <line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}"
        stroke="#F59E0B" stroke-width="20" stroke-linecap="round" opacity="0.22"/>
      <line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}"
        stroke="#D97706" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round" opacity="0.78"/>
    `).join('');
  }

  renderStrips() {
    this.stripsLayer.innerHTML = this.strips.map((st) => this.buildStripSvg(st)).join('');
  }

  buildStripSvg(st, extraOpacity = 0.91) {
    const tape = TAPE_CATALOG.find((t) => t.id === st.tapeId) || TAPE_CATALOG[0];
    const dx = st.x2 - st.x1;
    const dy = st.y2 - st.y1;
    const len = Math.max(14, Math.hypot(dx, dy));
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const path = buildTornStripPath(len, st.width, st.seed);
    const fill = getTapeFill(tape);

    return `
      <g transform="translate(${st.x1.toFixed(1)} ${st.y1.toFixed(1)}) rotate(${deg.toFixed(1)})" opacity="${extraOpacity}">
        <path d="${path}" fill="${fill}" stroke="${tape.edge}" stroke-width="1.6" stroke-linejoin="round"/>
        <!-- Subtle top glossy highlight for authentic craft tape sheen -->
        <line x1="4" y1="${(-st.width * 0.34).toFixed(1)}" x2="${(len - 4).toFixed(1)}" y2="${(-st.width * 0.34).toFixed(1)}"
          stroke="rgba(255,255,255,0.34)" stroke-width="3" stroke-linecap="round"/>
        <line x1="4" y1="${(st.width * 0.14).toFixed(1)}" x2="${(len - 4).toFixed(1)}" y2="${(st.width * 0.14).toFixed(1)}"
          stroke="${tape.fiber}" stroke-width="1.5"/>
      </g>
    `;
  }

  getSvgCoords(e) {
    const rect = this.svgEl.getBoundingClientRect();
    const scaleX = 800 / Math.max(1, rect.width);
    const scaleY = 500 / Math.max(1, rect.height);
    // Account for preserveAspectRatio="xMidYMid meet"
    const aspectView = 800 / 500;
    const aspectRect = rect.width / Math.max(1, rect.height);
    let x, y;
    if (aspectRect > aspectView) {
      const renderedW = rect.height * aspectView;
      const offsetX = (rect.width - renderedW) / 2;
      x = ((e.clientX - rect.left - offsetX) / renderedW) * 800;
      y = ((e.clientY - rect.top) / rect.height) * 500;
    } else {
      const renderedH = rect.width / aspectView;
      const offsetY = (rect.height - renderedH) / 2;
      x = ((e.clientX - rect.left) / rect.width) * 800;
      y = ((e.clientY - rect.top - offsetY) / renderedH) * 500;
    }
    return { x: Math.max(0, Math.min(800, x)), y: Math.max(0, Math.min(500, y)) };
  }

  handlePointerDown(e) {
    if (this.stageState !== 'playing') return;
    e.preventDefault();
    this.sound.unlock();
    const pt = this.getSvgCoords(e);

    // Peel mode in free play: grab topmost strip under finger!
    if (this.mode === 'free' && this.toolMode === 'peel') {
      for (let i = this.strips.length - 1; i >= 0; i--) {
        const s = this.strips[i];
        if (pointToSegDist(pt.x, pt.y, s.x1, s.y1, s.x2, s.y2) <= s.width * 0.65) {
          this.peelTarget = { index: i, strip: s, startX: pt.x, startY: pt.y };
          this.playTapePeel(0.6);
          return;
        }
      }
      return;
    }

    // Start pulling a new craft tape strip!
    this.dragging = true;
    this.dragStart = pt;
    this.dragCur = pt;
    this.dragLastPullPos = pt;
    this.dragSeed = Math.random() * 100 + 1;
    this.playTapeStick();
    this.renderActivePull();
  }

  handlePointerMove(e) {
    if (this.peelTarget) {
      e.preventDefault();
      const pt = this.getSvgCoords(e);
      const d = Math.hypot(pt.x - this.peelTarget.startX, pt.y - this.peelTarget.startY);
      const now = performance.now();
      if (now - this.lastPullSoundAt > 70) {
        this.lastPullSoundAt = now;
        this.playTapePeel(Math.min(1, d / 90));
      }
      if (d > 42) {
        const removed = this.strips.splice(this.peelTarget.index, 1)[0];
        this.peelTarget = null;
        this.playTapeRip();
        const tape = TAPE_CATALOG.find((t) => t.id === removed.tapeId) || TAPE_CATALOG[0];
        this.spawnParticles((removed.x1 + removed.x2) / 2, (removed.y1 + removed.y2) / 2, tape.color, 7);
        this.renderStrips();
      }
      return;
    }

    if (!this.dragging) return;
    e.preventDefault();
    const pt = this.getSvgCoords(e);
    const stepDist = Math.hypot(pt.x - this.dragLastPullPos.x, pt.y - this.dragLastPullPos.y);

    if (stepDist >= 4) {
      this.rollAngle = (this.rollAngle + stepDist * 1.4) % 360;
      const now = performance.now();
      if (now - this.lastPullSoundAt > 48) {
        this.lastPullSoundAt = now;
        this.playTapePull(Math.min(1, stepDist / 26));
      }

      // Consume roll amount proportionally to pulled length
      const tid = this.selectedTape.id;
      const prevLen = Math.hypot(this.dragCur.x - this.dragStart.x, this.dragCur.y - this.dragStart.y);
      const newLen = Math.hypot(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
      const deltaLen = Math.max(0, newLen - prevLen);
      if (deltaLen > 0) {
        this.rollRemain[tid] = Math.max(0, this.rollRemain[tid] - deltaLen / ROLL_MAX_PX);
        this.updateRollHud();
      }

      this.dragLastPullPos = pt;
      this.dragCur = pt;
      this.renderActivePull();

      // If roll just ran out, auto-rip here and trigger joyful roll refill!
      if (this.rollRemain[tid] <= 0.002) {
        this.commitActiveStrip();
        this.triggerRollRefill(tid);
      }
    }
  }

  handlePointerUp(e) {
    if (this.peelTarget) {
      this.peelTarget = null;
      return;
    }
    if (!this.dragging) return;
    e.preventDefault();
    this.commitActiveStrip();
  }

  commitActiveStrip() {
    if (!this.dragging || !this.dragStart || !this.dragCur) return;
    const len = Math.hypot(this.dragCur.x - this.dragStart.x, this.dragCur.y - this.dragStart.y);
    const x1 = this.dragStart.x;
    const y1 = this.dragStart.y;
    let x2 = this.dragCur.x;
    let y2 = this.dragCur.y;

    // Even a quick tap places a neat short piece of tape!
    if (len < 16) {
      x2 = Math.min(785, x1 + 48);
      y2 = y1;
    }

    this.strips.push({
      id: this.nextStripId++,
      x1, y1, x2, y2,
      tapeId: this.selectedTape.id,
      width: this.selectedWidth.px,
      seed: this.dragSeed
    });

    this.dragging = false;
    this.dragStart = null;
    this.dragCur = null;
    this.activeLayer.innerHTML = '';

    this.playTapeRip();
    this.spawnParticles(x2, y2, this.selectedTape.color, 8);
    this.renderStrips();
    this.evaluateProgress();
  }

  renderActivePull() {
    if (!this.dragging || !this.dragStart || !this.dragCur) {
      this.activeLayer.innerHTML = '';
      return;
    }
    const tempStrip = {
      x1: this.dragStart.x,
      y1: this.dragStart.y,
      x2: this.dragCur.x,
      y2: this.dragCur.y,
      tapeId: this.selectedTape.id,
      width: this.selectedWidth.px,
      seed: this.dragSeed
    };
    const ratio = this.rollRemain[this.selectedTape.id];
    const outerR = 13 + ratio * 15;
    const fill = this.selectedTape.pattern === 'rainbow' ? '#F472B6' : this.selectedTape.color;

    this.activeLayer.innerHTML = `
      ${this.buildStripSvg(tempStrip, 0.94)}
      <!-- Rolling craft tape roll following the child's finger! -->
      <g transform="translate(${this.dragCur.x.toFixed(1)} ${this.dragCur.y.toFixed(1)}) rotate(${this.rollAngle.toFixed(0)})">
        <circle cx="0" cy="0" r="${outerR.toFixed(1)}" fill="${fill}" stroke="${this.selectedTape.edge}" stroke-width="3"/>
        <circle cx="0" cy="0" r="10" fill="#E2C7A4" stroke="#9A7146" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="6" fill="#FFFFFF"/>
        <line x1="-8" y1="0" x2="8" y2="0" stroke="#9A7146" stroke-width="2" opacity="0.6"/>
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#9A7146" stroke-width="2" opacity="0.6"/>
      </g>
    `;
  }

  triggerRollRefill(tapeId) {
    this.playRollRefill();
    this.refillToast.classList.add('show');
    if (this.refillToastTimer) clearTimeout(this.refillToastTimer);
    this.refillToastTimer = setTimeout(() => {
      if (this.destroyed) return;
      this.rollRemain[tapeId] = 1.0;
      this.updateRollHud();
      this.refillToast.classList.remove('show');
    }, 680);
  }

  evaluateProgress() {
    if (this.mode === 'free' || this.checkpoints.length === 0) return;

    let covered = 0;
    for (const cp of this.checkpoints) {
      let hit = false;
      for (const s of this.strips) {
        if (pointToSegDist(cp.x, cp.y, s.x1, s.y1, s.x2, s.y2) <= s.width * 0.68) {
          hit = true;
          break;
        }
      }
      cp.covered = hit;
      if (hit) covered++;
    }

    const pct = Math.min(100, Math.round((covered / this.checkpoints.length) * 100));
    this.progBar.style.width = `${pct}%`;

    // Generous 85% threshold so young children never get frustrated by tiny edge gaps
    if (pct >= 85 && this.stageState === 'playing') {
      this.progBar.style.width = '100%';
      this.guideLayer.innerHTML = '';
      if (this.mode === 'packing') {
        this.deliveredCount++;
        this.countBadge.textContent = `${this.deliveredCount}こ`;
        this.stageState = 'conveyor-out';
        this.animT = 0;
        this.baseLayer.innerHTML = this.getCurrentStage().renderClosed();
        this.hintEl.textContent = 'こんぽう かんりょう！ おとどけー！';
        this.sound.playCrackerPop();
        this.spawnParticles(400, 250, '#FACC15', 14);
        this.ensureLoop();
      } else if (this.mode === 'repair') {
        this.stageState = 'repair-reward';
        this.animT = 0;
        this.hintEl.textContent = 'ばっちり なおったよ！';
        this.sound.playCrackerPop();
        this.spawnParticles(400, 220, '#4ADE80', 14);
        this.nextBtn.classList.add('show');
        this.ensureLoop();
      }
    }
  }

  spawnParticles(x, y, color, count = 8) {
    const palette = [color, '#FACC15', '#FFFFFF', '#F472B6'];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const sp = 2.5 + Math.random() * 4.5;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.5,
        color: palette[i % palette.length],
        size: 5 + Math.random() * 5,
        life: 1.0
      });
    }
    this.ensureLoop();
  }

  needsLoop() {
    return this.stageState !== 'playing' || this.particles.length > 0 || (this.carAnim && this.carAnim.active);
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) { // ~30fps power-saving cap
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.stepAnimations(dt);
      }
      if (this.needsLoop()) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  stepAnimations(dt) {
    // 1. Packing conveyor belt transition
    if (this.stageState === 'conveyor-out') {
      this.animT += dt * 1.15;
      const ease = this.animT * this.animT;
      this.stageGroup.setAttribute('transform', `translate(${(ease * 860).toFixed(1)} 0)`);
      if (this.animT >= 1.0) {
        this.stageIdx++;
        this.strips = [];
        this.stageState = 'conveyor-in';
        this.animT = 0;
        const st = this.getCurrentStage();
        this.buildCheckpoints(st.seams || []);
        this.hintEl.textContent = st.hint;
        this.progBar.style.width = '0%';
        this.renderStageBase();
        this.renderStrips();
        this.stageGroup.setAttribute('transform', 'translate(-820 0)');
      }
    } else if (this.stageState === 'conveyor-in') {
      this.animT += dt * 1.6;
      const ease = 1 - Math.pow(1 - Math.min(1, this.animT), 3);
      const tx = -820 * (1 - ease);
      this.stageGroup.setAttribute('transform', `translate(${tx.toFixed(1)} 0)`);
      if (this.animT >= 1.0) {
        this.stageState = 'playing';
        this.stageGroup.setAttribute('transform', '');
        this.renderGuides();
      }
    } else if (this.stageState === 'repair-reward') {
      this.animT = (this.animT + dt * 0.42) % 1.0;
      const st = this.getCurrentStage();
      if (st.renderReward) this.rewardLayer.innerHTML = st.renderReward(this.animT);
    }

    // 2. Free-play mini-car driving along child's tape strips!
    if (this.carAnim && this.carAnim.active) {
      if (this.strips.length === 0) {
        this.carAnim = null;
        this.rewardLayer.innerHTML = '';
      } else {
        const s = this.strips[this.carAnim.stripIdx % this.strips.length];
        const len = Math.max(40, Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
        this.carAnim.segT += (dt * 240) / len;
        if (this.carAnim.segT >= 1) {
          this.carAnim.segT = 0;
          this.carAnim.stripIdx++;
          if (this.carAnim.stripIdx >= this.strips.length) {
            this.carAnim = null;
            this.rewardLayer.innerHTML = '';
            this.sound.playSparkle();
          }
        }
        if (this.carAnim) {
          const cur = this.strips[this.carAnim.stripIdx % this.strips.length];
          const cx = cur.x1 + (cur.x2 - cur.x1) * this.carAnim.segT;
          const cy = cur.y1 + (cur.y2 - cur.y1) * this.carAnim.segT;
          const deg = (Math.atan2(cur.y2 - cur.y1, cur.x2 - cur.x1) * 180) / Math.PI;
          this.rewardLayer.innerHTML = `
            <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${deg.toFixed(1)})">
              <rect x="-24" y="-14" width="48" height="28" rx="8" fill="#EF4444" stroke="#7F1D1D" stroke-width="3"/>
              <rect x="-10" y="-10" width="22" height="20" rx="5" fill="#BAE6FD"/>
              <circle cx="18" cy="-8" r="3" fill="#FEF08A"/>
              <circle cx="18" cy="8" r="3" fill="#FEF08A"/>
            </g>
          `;
        }
      }
    }

    // 3. Torn paper / celebration particles
    if (this.particles.length > 0) {
      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= dt * 2.2;
      });
      this.particles = this.particles.filter((p) => p.life > 0);
      this.fxLayer.innerHTML = this.particles.map((p) => `
        <rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${p.size.toFixed(1)}" height="${(p.size * 0.7).toFixed(1)}"
          rx="1.5" fill="${p.color}" opacity="${Math.max(0, p.life).toFixed(2)}"/>
      `).join('');
    }
  }

  /* =========================================================================
     Web Audio ASMR Tape Synthesizer (uses shared SoundEngine AudioContext)
     ========================================================================= */

  playTapeStick() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.055);
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g);
    g.connect(this.sound.dryBus);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playTapePull(intensity = 0.5) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    src.playbackRate.value = 0.85 + intensity * 0.65;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1100 + intensity * 1600, now);
    bp.Q.value = 2.6;

    const g = ctx.createGain();
    const dur = 0.045 + (1 - intensity) * 0.025;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14 + intensity * 0.14, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.3, dur + 0.01);
  }

  playTapeRip() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1750, now);
    hp.frequency.exponentialRampToValueAtTime(3400, now + 0.09);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.32, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    src.connect(hp);
    hp.connect(g);
    g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.12);
  }

  playTapePeel(intensity = 0.5) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2200 + intensity * 1200, now);
    bp.Q.value = 4.2;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.25, 0.075);
  }

  playRollRefill() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(g);
      g.connect(this.sound.dryBus);
      osc.start(now);
      osc.stop(now + 0.15);
    });
  }
}
