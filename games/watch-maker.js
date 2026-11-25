import { FLAT_ICONS } from '../core/flat-icons.js';
import { Pseudo3DController, buildLayeredRigHtml, showSideCelebration } from '../core/pseudo-3d-viewer.js';
import { CLOCK_MODELS, getClockStageParts } from './watch-maker-models.js';
import { renderMechPartSvg, renderClockHandSvg } from './watch-maker-parts.js';

const LEVELS = [
  { id: 'exterior',  label: 'がいけん', stars: 1 },
  { id: 'geartrain', label: 'はぐるま', stars: 2 },
  { id: 'movement',  label: 'ほんもの', stars: 3 },
  { id: 'repair',    label: 'しゅうり', stars: 4 }
];

export default class WatchMakerGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.clockIndex = 0;
    this.levelIndex = 0;
    this.stageParts = [];
    this.installed = new Set();
    this.brokenIds = new Set();
    this.hintOn = true;
    this.completed = false;
    this.skeletonMode = false;
    this.phaseNotified = false;

    this.dragState = null;
    this.rafId = null;
    this.celebTimer = null;
    this.lastFrameTime = 0;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.escapeStepAngle = 0;
    this.gearAngles = {};
    this.cuckooPlayed = false;

    this.boundMove = (e) => this.onPointerMove(e);
    this.boundUp = (e) => this.onPointerUp(e);
  }

  injectStyles() {
    if (document.getElementById('watch-maker-styles-v3')) return;
    const old2 = document.getElementById('watch-maker-styles-v2');
    if (old2) old2.remove();
    const old = document.getElementById('watch-maker-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'watch-maker-styles-v3';
    style.textContent = `
      .wm-root {
        width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center;
        padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) calc(10px + var(--safe-bottom)) calc(12px + var(--safe-left));
        gap: 7px;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      .wm-topbar {
        width: 100%; max-width: 1040px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; flex-wrap: wrap;
        padding-left: 56px; padding-right: 56px;
      }
      .wm-top-right {
        display: flex; align-items: center; gap: 8px;
      }
      .wm-skeleton-btn {
        background: #FFFFFF;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 0 rgba(15, 23, 42, 0.22);
        color: #1E3A5F;
        font-family: var(--font-rounded);
        font-weight: 900; font-size: 14px;
        padding: 7px 14px; border-radius: 18px;
        cursor: pointer; white-space: nowrap;
        transition: transform 0.1s ease, background 0.14s ease;
      }
      .wm-skeleton-btn:active { transform: translateY(2px); }
      .wm-skeleton-btn.is-on {
        background: #38BDF8; border-color: #FFFFFF; color: #0F172A;
        box-shadow: 0 4px 0 #0284C7;
      }
      .wm-progress-pill {
        background: #FFFFFF;
        border: 3px solid #FFD12E;
        box-shadow: 0 4px 0 rgba(15, 23, 42, 0.18);
        color: #4D3300;
        font-weight: 900; font-size: 15px;
        padding: 6px 14px; border-radius: 18px;
        white-space: nowrap;
      }
      .wm-banner {
        background: #FFFFFF;
        border: 3px solid #FFFFFF;
        box-shadow: 0 5px 0 rgba(15, 23, 42, 0.18);
        color: #1E293B;
        font-size: clamp(14px, 1.9vw, 18px);
        font-weight: 900;
        padding: 6px 18px;
        border-radius: 999px;
        text-align: center;
        display: inline-flex; align-items: center; gap: 10px;
        flex-wrap: wrap; justify-content: center;
      }
      .wm-mech-chip {
        background: #FEF3C7;
        border: 2px solid #F59E0B;
        color: #92400E;
        font-size: 12px; font-weight: 900;
        padding: 2px 10px; border-radius: 999px;
      }
      .wm-workspace {
        flex: 1 1 auto; min-height: 0;
        width: 100%; max-width: 1040px;
        display: flex; align-items: stretch; justify-content: center;
        gap: 10px;
      }
      .wm-picker {
        width: 192px; flex-shrink: 0;
        background: rgba(255, 251, 235, 0.94);
        border: 4px solid #FFFFFF;
        box-shadow: 0 7px 0 rgba(15, 23, 42, 0.22);
        border-radius: 24px;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
        align-content: start;
        overflow-y: auto;
      }
      .wm-clock-btn {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 2px;
        padding: 5px 3px 5px;
        border-radius: 16px;
        border: 3px solid #E2E8F0;
        border-bottom: 5px solid #CBD5E1;
        background: #FFFFFF;
        color: #334155;
        font-family: var(--font-rounded);
        cursor: pointer;
        transition: transform 0.12s ease, background 0.14s ease, border-color 0.14s ease;
      }
      .wm-clock-btn:active { transform: translateY(2px); }
      .wm-clock-btn.is-active {
        background: #FFD12E;
        border-color: #FFFFFF;
        border-bottom-color: #C28A00;
        color: #4D3300;
      }
      .wm-clock-btn svg { width: 44px; height: 44px; display: block; }
      .wm-clock-name {
        font-size: 10.5px; font-weight: 900; line-height: 1.1; text-align: center;
      }
      .wm-stage-wrap {
        flex: 1 1 auto; min-width: 0; min-height: 0;
        display: flex; align-items: center; justify-content: center;
        position: relative;
      }
      .wm-svg {
        width: 100%; height: 100%;
        max-height: 410px;
      }
      .wm-tray {
        width: 100%; max-width: 1040px;
        background: rgba(255, 251, 235, 0.94);
        border: 4px solid #FFFFFF;
        box-shadow: 0 7px 0 rgba(15, 23, 42, 0.22);
        border-radius: 24px;
        padding: 8px 10px;
        display: flex; align-items: center; justify-content: center;
        gap: 8px; flex-wrap: wrap;
        min-height: 98px;
      }
      .wm-part-card {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        width: 92px; min-height: 80px;
        padding: 5px 5px 4px;
        background: #FFFFFF;
        border: 3px solid #CBD5E1;
        border-bottom: 5px solid #94A3B8;
        border-radius: 16px;
        cursor: grab;
        transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
        touch-action: none;
      }
      .wm-part-card:active { cursor: grabbing; transform: scale(0.95); }
      .wm-part-card.is-next {
        background: #FFFBEB;
        border-color: #F59E0B;
        border-bottom-color: #B45309;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.45);
        animation: wmPulseCard 1.4s ease-in-out infinite;
      }
      .wm-part-card.is-locked { opacity: 0.46; filter: grayscale(0.45); }
      .wm-part-card.is-dragging { opacity: 0.25; }
      .wm-part-label {
        font-size: 11px; font-weight: 900; color: #1E293B;
        line-height: 1.15; text-align: center; margin-top: 2px;
      }
      .wm-part-sub {
        font-size: 9.5px; font-weight: 700; color: #64748B;
      }
      .wm-ghost {
        position: fixed; pointer-events: none; z-index: 9999;
        transform: translate(-50%, -50%) scale(1.12);
      }
      .wm-target-pulse { animation: wmPulseRing 1.15s ease-in-out infinite; }
      .wm-banner.is-done {
        background: linear-gradient(180deg, #FEF08A 0%, #FACC15 100%);
        border-color: #FFFFFF;
        color: #422006;
        box-shadow: 0 5px 0 #CA8A04;
      }
      .wm-done-actions {
        display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center;
      }
      .wm-replay-btn {
        background: #F59E0B; color: #FFFFFF;
        border: 3px solid #FFFFFF; border-bottom: 6px solid #B45309;
        border-radius: 18px; padding: 9px 18px;
        font-family: var(--font-rounded);
        font-size: 15.5px; font-weight: 900; cursor: pointer;
        transition: transform 0.1s ease;
      }
      .wm-replay-btn.is-green {
        background: #22C55E; border-bottom-color: #15803D; color: #FFFFFF;
        font-size: 18px; padding: 11px 26px;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.35);
      }
      .wm-replay-btn.is-teal {
        background: #14B8A6; border-bottom-color: #0F766E; color: #FFFFFF;
      }
      .wm-replay-btn.is-slate {
        background: #64748B; border-bottom-color: #334155; color: #FFFFFF;
      }
      .wm-replay-btn.is-blue {
        background: #38BDF8; border-bottom-color: #0284C7; color: #0F172A;
      }
      .wm-replay-btn:active { transform: translateY(2px); }
      @media (max-width: 740px) {
        .wm-workspace { flex-direction: column; }
        .wm-picker {
          width: 100%; display: flex; flex-direction: row;
          overflow-x: auto; padding: 6px;
        }
        .wm-clock-btn { flex: 0 0 74px; }
      }
      @keyframes wmPulseCard {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes wmPulseRing {
        0%, 100% { opacity: 0.95; }
        50% { opacity: 0.35; }
      }
    `;
    document.head.appendChild(style);
  }

  mount() {
    this.injectStyles();
    this.app.setGameBackground('#2B4C7E');
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'wm-root';
    root.innerHTML = `
      <div class="wm-topbar">
        <div class="pm-mode-tabs" id="wm-tabs">
          ${LEVELS.map((lv, idx) => `
            <button class="pm-tab-btn ${idx === this.levelIndex ? 'is-active' : ''}" data-lv="${idx}" type="button">${FLAT_ICONS.stars(lv.stars, 14)}<span>${lv.label}</span></button>
          `).join('')}
        </div>
        <div class="wm-top-right">
          <button class="wm-skeleton-btn is-on" id="wm-hint-btn" type="button">ひんと：ON</button>
          <button class="wm-skeleton-btn" id="wm-skeleton-btn" type="button" style="display:none;">なかを みる</button>
          <div class="wm-progress-pill" id="wm-progress">0 / 5</div>
        </div>
      </div>
      <div class="wm-banner" id="wm-banner"></div>
      <div class="wm-workspace">
        <div class="wm-picker" id="wm-picker">
          ${CLOCK_MODELS.map((clk, idx) => `
            <button class="wm-clock-btn ${idx === this.clockIndex ? 'is-active' : ''}" data-clk="${idx}" type="button">
              ${clk.thumbSvg}
              <span class="wm-clock-name">${clk.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="wm-stage-wrap">
          <div class="p3d-scene" id="wm-p3d-scene">
            <div class="p3d-rig" id="wm-p3d-rig">
              <svg class="wm-svg" id="wm-svg" viewBox="0 0 560 400" aria-label="とけい くみたて"></svg>
            </div>
            <div class="p3d-hint-chip is-hidden" id="wm-3d-hint">ゆびで くるくる まわして みてみよう！</div>
          </div>
        </div>
      </div>
      <div class="wm-tray" id="wm-tray"></div>
    `;
    this.container.appendChild(root);

    this.rootEl = root;
    this.p3dScene = root.querySelector('#wm-p3d-scene');
    this.p3dRig = root.querySelector('#wm-p3d-rig');
    this.p3dHint = root.querySelector('#wm-3d-hint');
    this.svgEl = root.querySelector('#wm-svg');
    this.trayEl = root.querySelector('#wm-tray');
    this.bannerEl = root.querySelector('#wm-banner');
    this.progressEl = root.querySelector('#wm-progress');
    this.skeletonBtn = root.querySelector('#wm-skeleton-btn');
    this.hintBtn = root.querySelector('#wm-hint-btn');

    this.p3d = new Pseudo3DController(this.p3dScene, this.p3dRig, {
      maxYaw: 56,
      maxPitch: 36,
      onFirstDrag: () => {
        if (this.p3dHint) this.p3dHint.classList.add('is-hidden');
      }
    });

    this.hintBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.hintOn = !this.hintOn;
      this.hintBtn.classList.toggle('is-on', this.hintOn);
      this.hintBtn.textContent = `ひんと：${this.hintOn ? 'ON' : 'OFF'}`;
      this.sound.playButtonDown('yellow');
      this.renderAll();
    });

    root.querySelectorAll('#wm-tabs .pm-tab-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.lv);
        if (idx === this.levelIndex) return;
        this.sound.playPageTurn(1);
        this.loadSetup(this.clockIndex, idx);
      });
    });

    root.querySelectorAll('#wm-picker .wm-clock-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.clk);
        if (idx === this.clockIndex) return;
        this.sound.playButtonDown('yellow');
        this.loadSetup(idx, this.levelIndex);
      });
    });

    this.skeletonBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.toggleSkeletonMode();
    });

    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('pointercancel', this.boundUp);

    this.loadSetup(0, 0);
  }

  toggleSkeletonMode() {
    this.skeletonMode = !this.skeletonMode;
    this.skeletonBtn.classList.toggle('is-on', this.skeletonMode);
    this.skeletonBtn.textContent = this.skeletonMode ? 'もじばん を もどす' : 'なかを みる';
    this.sound.playButtonDown('yellow');
    this.renderWatchSvg();
    if (this.completed) {
      if (this.p3d) this.p3d.setExploded(this.skeletonMode);
      this.renderTray();
      this.startWatchAnimation();
    }
  }

  unmount() {
    this.stopAnimation();
    if (this.celebTimer) {
      clearTimeout(this.celebTimer);
      this.celebTimer = null;
    }
    if (this.p3d) {
      this.p3d.destroy();
      this.p3d = null;
    }
    this.clearDrag();
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('pointercancel', this.boundUp);
  }

  getClock() {
    return CLOCK_MODELS[this.clockIndex];
  }

  getLevel() {
    return LEVELS[this.levelIndex];
  }

  getNextPart() {
    return this.stageParts.find((p) => !this.installed.has(p.id)) || null;
  }

  isPartUnlocked(part) {
    return !part.req || this.installed.has(part.req);
  }

  isMechPhaseDone() {
    return this.stageParts.filter((p) => p.phase === 'mech').every((p) => this.installed.has(p.id));
  }

  loadSetup(clockIdx, levelIdx) {
    this.stopAnimation();
    if (this.celebTimer) {
      clearTimeout(this.celebTimer);
      this.celebTimer = null;
    }
    this.clearDrag();
    if (this.p3d) this.p3d.setEnabled(false);
    if (this.p3dHint) this.p3dHint.classList.add('is-hidden');

    this.clockIndex = clockIdx;
    this.levelIndex = levelIdx;
    this.stageParts = getClockStageParts(this.getClock(), this.getLevel().id);
    this.installed.clear();
    this.brokenIds.clear();
    this.completed = false;
    this.skeletonMode = false;
    this.phaseNotified = false;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.escapeStepAngle = 0;
    this.gearAngles = {};
    this.cuckooPlayed = false;

    // In Repair/Overhaul mode: pre-install all parts, then randomly break 2-3 parts!
    if (this.getLevel().id === 'repair') {
      const candidates = this.stageParts.filter((p) => p.kind !== 'bridge' && p.kind !== 'bridge-gold');
      const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
      const breakCount = Math.min(3, Math.max(2, Math.floor(candidates.length / 2)));
      shuffled.slice(0, breakCount).forEach((p) => this.brokenIds.add(p.id));
      this.stageParts.forEach((p) => {
        if (!this.brokenIds.has(p.id)) this.installed.add(p.id);
      });
    }

    this.rootEl.querySelectorAll('#wm-tabs .pm-tab-btn').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.lv) === levelIdx);
    });
    this.rootEl.querySelectorAll('#wm-picker .wm-clock-btn').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.clk) === clockIdx);
    });

    this.skeletonBtn.classList.remove('is-on');
    this.skeletonBtn.textContent = 'なかを みる';

    this.renderAll();
  }

  renderPartContent(part) {
    const clock = this.getClock();
    if (part.kind === 'custom-dial') return clock.renderDialSvg();
    if (part.kind === 'custom-glass') return clock.renderGlassSvg();
    if (part.kind === 'hand-hour') return renderClockHandSvg(clock.handStyle, 'hour', clock.handScale);
    if (part.kind === 'hand-minute') return renderClockHandSvg(clock.handStyle, 'minute', clock.handScale);
    if (part.kind === 'hand-second') return renderClockHandSvg(clock.handStyle, 'second', clock.handScale);
    return renderMechPartSvg(part.kind, part.r);
  }

  renderAll() {
    const clock = this.getClock();
    const level = this.getLevel();
    const next = this.getNextPart();

    const canSkeleton = level.id === 'movement' && this.installed.has('dial');
    this.skeletonBtn.style.display = canSkeleton ? 'inline-block' : 'none';

    this.bannerEl.classList.toggle('is-done', this.completed);

    if (level.id === 'repair') {
      this.progressEl.textContent = this.completed ? 'しゅうり OK' : `あと ${this.brokenIds.size} こ`;
      this.bannerEl.innerHTML = this.completed
        ? `<span>${clock.name} しゅうり かんりょう！ くるくる まわして みてみよう！</span><span class="wm-mech-chip">${clock.mechLabel}</span>`
        : `<span>あかく こわれた ぶひん（あと${this.brokenIds.size}こ）を あたらしい ぶひんに かえよう！</span><span class="wm-mech-chip">オーバーホール</span>`;
    } else {
      this.progressEl.textContent = `${this.installed.size} / ${this.stageParts.length}`;
      if (this.completed) {
        this.bannerEl.innerHTML = `<span>${clock.name} かんせい！ くるくる まわして みてみよう！</span><span class="wm-mech-chip">${clock.mechLabel}</span>`;
      } else if (next) {
        const phaseTag = level.id === 'movement'
          ? (next.phase === 'mech' ? 'ステップ1：なかみ・ネジ' : 'ステップ2：もじばん・パッキン')
          : clock.mechLabel;
        const msg = this.hintOn
          ? `「${next.label}」を ドラッグ して はめよう！`
          : `つぎの ぶひんを じぶんで みつけて はめよう！`;
        this.bannerEl.innerHTML = `<span>${msg}</span><span class="wm-mech-chip">${phaseTag}</span>`;
      }
    }

    this.renderWatchSvg();
    this.renderTray();
  }

  renderWatchSvg() {
    const clock = this.getClock();
    const level = this.getLevel();
    const nextPart = this.getNextPart();
    const showPlate = level.id === 'geartrain' || level.id === 'movement' || level.id === 'repair';
    const caseBg = clock.renderCaseBg();

    let plateSvg = '';
    if (showPlate) {
      plateSvg = clock.renderMovementPlate();
      const seenPos = new Set();
      for (const p of this.stageParts) {
        if (p.phase !== 'mech') continue;
        if (p.kind === 'bridge' || p.kind === 'bridge-gold' || p.kind === 'pendulum' || p.kind === 'ruby-jewels' || p.kind === 'oil-drop' || p.kind === 'screw-set') continue;
        const key = `${p.x},${p.y}`;
        if (seenPos.has(key)) continue;
        seenPos.add(key);
        plateSvg += `
          <circle cx="${p.x}" cy="${p.y}" r="${Math.min(p.r + 2, 42)}" fill="#0F172A" fill-opacity="0.12"/>
          <circle cx="${p.x}" cy="${p.y}" r="7" fill="#F8FAFC" stroke="#64748B" stroke-width="1.6"/>
          <circle cx="${p.x}" cy="${p.y}" r="3.6" fill="#E11D48"/>
        `;
      }
    }

    // Group installed parts by depth layer for pseudo-3D view when completed
    let mechLayer = '';
    let dialLayer = '';
    let handLayer = '';
    let glassLayer = '';
    let installedSvg = '';

    for (const p of this.stageParts) {
      const isBroken = level.id === 'repair' && this.brokenIds.has(p.id);
      if (!this.installed.has(p.id) && !isBroken) continue;
      const angle = this.gearAngles[p.id] ?? p.initAngle ?? 0;
      const isFaceOverlay = p.kind === 'custom-dial' || p.kind === 'sub-hygro' || p.kind === 'sub-thermo';
      const opacityAttr = (this.skeletonMode && isFaceOverlay) ? ' opacity="0.24"' : (isBroken ? ' opacity="0.52"' : '');

      let chunk = '';
      if (clock.id === 'cuckoo-white' && p.id === 'door' && this.completed) {
        chunk = `
          <g id="wm-part-door" transform="translate(${p.x} ${p.y})">
            <rect x="-42" y="-10" width="18" height="28" rx="2" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
            <rect x="24" y="-10" width="18" height="28" rx="2" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
            <g id="wm-cuckoo-pop" transform="translate(0, 2)">
              ${renderMechPartSvg('cuckoo-bird', 24)}
            </g>
          </g>
        `;
      } else {
        chunk = `
          <g id="wm-part-${p.id}" transform="translate(${p.x} ${p.y}) rotate(${angle})"${opacityAttr}>
            ${this.renderPartContent(p)}
          </g>
        `;
      }

      if (isBroken) {
        chunk += `
          <g class="wm-target-pulse" pointer-events="none" transform="translate(${p.x} ${p.y})">
            <circle cx="0" cy="0" r="${Math.min(p.r + 4, 40)}" fill="rgba(239,68,68,0.2)" stroke="#EF4444" stroke-width="4" stroke-dasharray="8 5"/>
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
            <line x1="12" y1="-12" x2="-12" y2="12" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
          </g>
        `;
      }

      installedSvg += chunk;
      if (p.kind === 'custom-glass' || p.kind === 'gasket') {
        glassLayer += chunk;
      } else if (p.kind && (p.kind.startsWith('hand-') || p.id === 'door')) {
        handLayer += chunk;
      } else if (isFaceOverlay) {
        dialLayer += chunk;
      } else {
        mechLayer += chunk;
      }
    }

    let fxSvg = '';
    if (clock.id === 'round-radio' && this.completed) {
      fxSvg = `
        <g id="wm-radio-waves" pointer-events="none" opacity="0.8">
          <path d="M 244 26 Q 280 4 316 26" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
          <path d="M 228 16 Q 280 -14 332 16" fill="none" stroke="#7DD3FC" stroke-width="3.5" stroke-linecap="round"/>
        </g>
      `;
    }

    // Completed mode: render multi-layer pseudo-3D clock with physical case thickness!
    if (this.completed) {
      const layers = [
        { z: -24, html: caseBg, cls: 'p3d-slice-deep' },
        { z: -16, html: caseBg, cls: 'p3d-slice' },
        { z: -8,  html: caseBg, cls: 'p3d-slice' },
        { z: 0,   html: `${caseBg}${plateSvg}` }
      ];
      if (mechLayer) layers.push({ z: 12, html: mechLayer });
      if (dialLayer) layers.push({ z: 22, html: dialLayer });
      if (handLayer) layers.push({ z: 30, html: handLayer });
      if (glassLayer || fxSvg) layers.push({ z: 38, html: `${glassLayer}${fxSvg}` });

      this.p3dRig.innerHTML = buildLayeredRigHtml(layers, '0 0 560 400', 'wm-svg');
      this.svgEl = this.p3dRig.querySelector('svg');
      if (this.p3d) this.p3d.applyLayerDepths();
      return;
    }

    // Target snap guide ring (only shown when Hint is ON and not in repair mode)
    let guideSvg = '';
    if (this.hintOn && level.id !== 'repair') {
      const activeTarget = this.dragState
        ? this.stageParts.find((p) => p.id === this.dragState.partId)
        : nextPart;

      if (activeTarget) {
        const ringR = Math.min(Math.max(activeTarget.r, 24), 134);
        guideSvg = `
          <g class="wm-target-pulse" pointer-events="none">
            <circle cx="${activeTarget.x}" cy="${activeTarget.y}" r="${ringR}"
              fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="4" stroke-dasharray="10 7"/>
            <circle cx="${activeTarget.x}" cy="${activeTarget.y}" r="7" fill="#FBBF24"/>
          </g>
        `;
      }
    }

    this.p3dRig.innerHTML = `<svg class="wm-svg" id="wm-svg" viewBox="0 0 560 400" aria-label="とけい くみたて">${caseBg}${plateSvg}${installedSvg}${fxSvg}${guideSvg}</svg>`;
    this.svgEl = this.p3dRig.querySelector('#wm-svg');
  }

  renderTray() {
    const level = this.getLevel();
    const nextPart = this.getNextPart();

    if (this.completed) {
      const hasNextLevel = this.levelIndex < LEVELS.length - 1;
      const canExplode = this.stageParts.some((p) => p.kind === 'custom-dial') || level.id === 'movement';
      this.trayEl.innerHTML = `
        <div class="wm-done-actions">
          <button class="wm-replay-btn is-green" id="wm-next-btn" type="button">${hasNextLevel ? 'つぎの レベルへ' : 'つぎの とけいへ'}</button>
          ${canExplode ? `<button class="wm-replay-btn is-teal" id="wm-explode-btn" type="button">${this.skeletonMode ? 'カバーを もどす' : 'なかを みる'}</button>` : ''}
          <button class="wm-replay-btn is-slate" id="wm-reset-3d-btn" type="button">しょうめん</button>
          <button class="wm-replay-btn is-blue" id="wm-replay-btn" type="button">もういっかい</button>
        </div>
      `;
      this.trayEl.querySelector('#wm-next-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.playPageTurn(1);
        if (hasNextLevel) {
          this.loadSetup(this.clockIndex, this.levelIndex + 1);
        } else {
          this.loadSetup((this.clockIndex + 1) % CLOCK_MODELS.length, 0);
        }
      });
      const expBtn = this.trayEl.querySelector('#wm-explode-btn');
      if (expBtn) {
        expBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.toggleSkeletonMode();
        });
      }
      this.trayEl.querySelector('#wm-reset-3d-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.playButtonDown('yellow');
        if (this.p3d) this.p3d.resetView();
      });
      this.trayEl.querySelector('#wm-replay-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.playPageTurn(1);
        this.loadSetup(this.clockIndex, this.levelIndex);
      });
      return;
    }

    // Repair mode: show all broken replacements + 2 decoy spare parts!
    if (level.id === 'repair') {
      const brokenParts = this.stageParts.filter((p) => this.brokenIds.has(p.id));
      const decoys = this.stageParts.filter((p) => !this.brokenIds.has(p.id)).slice(0, 2);
      const trayParts = [...brokenParts, ...decoys].sort((a, b) => a.id.localeCompare(b.id));

      this.trayEl.innerHTML = trayParts.map((p) => {
        const isBroken = this.brokenIds.has(p.id);
        return `
          <div class="wm-part-card ${this.hintOn && isBroken ? 'is-next' : ''}"
            data-part-id="${p.id}" role="button" aria-label="${p.label}">
            <svg width="48" height="48" viewBox="${p.thumbBox}">
              ${this.renderPartContent(p)}
            </svg>
            <div class="wm-part-label">${p.label}</div>
            ${p.ruby ? `<div class="wm-part-sub">${p.ruby}</div>` : ''}
          </div>
        `;
      }).join('');

      this.trayEl.querySelectorAll('.wm-part-card').forEach((card) => {
        card.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const part = this.stageParts.find((p) => p.id === card.dataset.partId);
          if (part) this.startDrag(e, part, card);
        });
      });
      return;
    }

    // In 3. ほんもの, show Phase 1 (mech) parts first, then Phase 2 (face) parts cleanly!
    const currentPhase = (level.id === 'movement' && !this.isMechPhaseDone()) ? 'mech' : 'face';
    const remaining = this.stageParts.filter((p) => {
      if (this.installed.has(p.id)) return false;
      if (level.id === 'movement') return p.phase === currentPhase;
      return true;
    });

    this.trayEl.innerHTML = remaining.map((p) => {
      const unlocked = this.isPartUnlocked(p);
      const isNext = this.hintOn && nextPart && nextPart.id === p.id;
      return `
        <div class="wm-part-card ${isNext ? 'is-next' : ''} ${this.hintOn && !unlocked ? 'is-locked' : ''}"
          data-part-id="${p.id}" role="button" aria-label="${p.label}">
          <svg width="48" height="48" viewBox="${p.thumbBox}">
            ${this.renderPartContent(p)}
          </svg>
          <div class="wm-part-label">${p.label}</div>
          ${p.ruby ? `<div class="wm-part-sub">${p.ruby}</div>` : ''}
        </div>
      `;
    }).join('');

    this.trayEl.querySelectorAll('.wm-part-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const part = this.stageParts.find((p) => p.id === card.dataset.partId);
        if (!part) return;
        if (!this.isPartUnlocked(part)) {
          this.sound.playGentleNudge();
          return;
        }
        this.startDrag(e, part, card);
      });
    });
  }

  startDrag(e, part, cardEl) {
    this.clearDrag();
    this.sound.playButtonDown('yellow');

    const ghost = document.createElement('div');
    ghost.className = 'wm-ghost';
    ghost.innerHTML = `
      <svg width="86" height="86" viewBox="${part.thumbBox}">
        ${this.renderPartContent(part)}
      </svg>
    `;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    cardEl.classList.add('is-dragging');
    this.dragState = { partId: part.id, ghost, cardEl };
    this.renderWatchSvg();
  }

  onPointerMove(e) {
    if (!this.dragState) return;
    this.dragState.ghost.style.left = `${e.clientX}px`;
    this.dragState.ghost.style.top = `${e.clientY}px`;
  }

  onPointerUp(e) {
    if (!this.dragState) return;
    const { partId } = this.dragState;
    const part = this.stageParts.find((p) => p.id === partId);
    this.clearDrag();
    if (!part) return;

    const svgPt = this.clientToSvg(e.clientX, e.clientY);
    const dist = Math.hypot(svgPt.x - part.x, svgPt.y - part.y);
    const snapRadius = Math.max(66, Math.min(part.r + 28, 145));

    if (this.getLevel().id === 'repair') {
      if (this.brokenIds.has(part.id) && dist <= snapRadius) {
        this.brokenIds.delete(part.id);
        this.installed.add(part.id);
        this.sound.playMetalClick();
        if (this.brokenIds.size === 0) {
          this.onStageComplete();
        } else {
          this.renderAll();
        }
      } else {
        this.sound.playGentleNudge();
        this.renderWatchSvg();
      }
      return;
    }

    if (dist <= snapRadius) {
      this.installed.add(part.id);
      if (part.id === 'hour' || part.id === 'minute' || part.id === 'second') {
        const nowAngles = this.getCurrentTimeAngles(false);
        this.gearAngles[part.id] = nowAngles[part.id];
      } else {
        this.gearAngles[part.id] = part.initAngle ?? 0;
      }
      this.sound.playMetalClick();

      // Celebrate Phase 1 -> Phase 2 transition in 3. ほんもの!
      if (this.getLevel().id === 'movement' && !this.phaseNotified && this.isMechPhaseDone()) {
        this.phaseNotified = true;
        this.sound.playSuccessFanfare();
      }

      if (this.installed.size === this.stageParts.length) {
        this.onStageComplete();
      } else {
        this.renderAll();
      }
    } else {
      this.sound.playGentleNudge();
      this.renderWatchSvg();
    }
  }

  clearDrag() {
    if (!this.dragState) return;
    if (this.dragState.ghost) this.dragState.ghost.remove();
    if (this.dragState.cardEl) this.dragState.cardEl.classList.remove('is-dragging');
    this.dragState = null;
  }

  clientToSvg(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 560,
      y: ((clientY - rect.top) / rect.height) * 400
    };
  }

  getCurrentTimeAngles(smooth = false) {
    const now = new Date();
    const sec = now.getSeconds() + (smooth ? now.getMilliseconds() / 1000 : 0);
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;
    return {
      hour: hr * 30,
      minute: min * 6,
      second: sec * 6,
      rawSec: now.getSeconds()
    };
  }

  syncHandsToNow(dc, smooth = false) {
    const a = this.getCurrentTimeAngles(smooth);
    if (this.installed.has('second')) {
      this.gearAngles.second = a.second;
      this.updatePartTransform('second', dc.x, dc.y, a.second);
    }
    if (this.installed.has('minute')) {
      this.gearAngles.minute = a.minute;
      this.updatePartTransform('minute', dc.x, dc.y, a.minute);
    }
    if (this.installed.has('hour')) {
      this.gearAngles.hour = a.hour;
      this.updatePartTransform('hour', dc.x, dc.y, a.hour);
    }
    return a.rawSec;
  }

  onStageComplete() {
    this.completed = true;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.lastRealSec = -1;
    this.cuckooPlayed = false;

    const clock = this.getClock();
    const nowAngles = this.getCurrentTimeAngles(false);
    if (this.installed.has('hour')) this.gearAngles.hour = nowAngles.hour;
    if (this.installed.has('minute')) this.gearAngles.minute = nowAngles.minute;
    if (this.installed.has('second')) this.gearAngles.second = nowAngles.second;

    this.sound.playSuccessFanfare();
    showSideCelebration(this.rootEl);

    this.renderAll();
    this.startWatchAnimation();

    if (this.p3d) {
      this.p3d.setEnabled(true);
      this.p3d.introPose(-18, 10);
    }
    if (this.p3dHint) {
      this.p3dHint.classList.remove('is-hidden');
    }

    if (clock.id === 'cuckoo-white') {
      this.celebTimer = setTimeout(() => {
        if (this.completed && this.getClock().id === 'cuckoo-white') {
          this.sound.playCuckoo();
        }
      }, 420);
    }
  }

  startWatchAnimation() {
    this.stopAnimation();
    this.lastFrameTime = performance.now();
    this.lastRealSec = -1;

    // Cache SVG elements across all 3D layers to eliminate per-frame querySelector overhead
    const scope = this.p3dRig || this.svgEl;
    this.partEls = new Map();
    for (const p of this.stageParts) {
      const el = scope && scope.querySelector(`#wm-part-${p.id}`);
      if (el) this.partEls.set(p.id, el);
    }
    this.cuckooPopEl = scope && scope.querySelector('#wm-cuckoo-pop');
    this.radioWaveEl = scope && scope.querySelector('#wm-radio-waves');

    const clock = this.getClock();
    const dc = clock.dialCenter;
    const hasSpinningGears = this.stageParts.some((p) => p.speed && this.installed.has(p.id));
    const isStepOnly = !hasSpinningGears && clock.animType === 'quartz-step';

    // Step-only exterior quartz clocks only need 1Hz updates (zero continuous rAF!)
    if (isStepOnly) {
      const stepCheck = () => {
        if (document.hidden) return;
        const realSec = new Date().getSeconds();
        if (realSec !== this.lastRealSec) {
          this.lastRealSec = realSec;
          this.sound.playWatchTick(realSec % 2 === 1);
          this.syncHandsToNow(dc, false);
        }
      };
      stepCheck();
      this.stepTimer = setInterval(stepCheck, 250);
      return;
    }

    const MIN_FRAME_MS = 32; // ~30fps cap to prevent 120Hz iPad thermal throttling
    const tick = (now) => {
      if (this.paused) {
        this.rafId = null;
        return;
      }
      const elapsed = now - this.lastFrameTime;
      if (elapsed < MIN_FRAME_MS) {
        this.rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(elapsed / 1000, 0.06);
      this.lastFrameTime = now;
      this.runTime += dt;

      // Rotate all installed gear parts smoothly
      for (const p of this.stageParts) {
        if (!p.speed || !this.installed.has(p.id)) continue;
        this.gearAngles[p.id] = ((this.gearAngles[p.id] || 0) + p.speed * 36 * dt) % 360;
        this.updatePartTransform(p.id, p.x, p.y, this.gearAngles[p.id]);
      }

      const realSec = new Date().getSeconds();
      const secChanged = realSec !== this.lastRealSec;

      if (clock.animType === 'sweep') {
        this.syncHandsToNow(dc, true);
        this.lastRealSec = realSec;
      } else if (clock.animType === 'tuning-fork') {
        this.syncHandsToNow(dc, true);
        if (secChanged) {
          this.lastRealSec = realSec;
          this.sound.playWatchTick(realSec % 2 === 1);
        }
        const hum = Math.sin(this.runTime * 36) * 1.4;
        this.updatePartTransform('fork', 336, 254, hum);
      } else if (clock.animType === 'pendulum') {
        const phase = this.runTime * 0.5 * Math.PI * 2;
        const swing = Math.sin(phase) * 18;
        if (secChanged) {
          this.lastRealSec = realSec;
          this.sound.playPendulumTick(realSec % 2 === 1);
          this.escapeStepAngle = (this.escapeStepAngle + 12) % 360;
          this.syncHandsToNow(dc, false);
        }
        this.updatePartTransform('pendulum', 280, 226, swing);
        this.updatePartTransform('anchor', 280, 112, swing * 0.55);
        this.updatePartTransform('escape', 280, 146, this.escapeStepAngle);
      } else if (clock.animType === 'cuckoo') {
        if (secChanged) {
          this.lastRealSec = realSec;
          this.sound.playWatchTick(realSec % 2 === 1);
          this.syncHandsToNow(dc, false);
        }
        const bob = Math.sin(this.runTime * 7) * 4;
        if (this.cuckooPopEl) this.cuckooPopEl.setAttribute('transform', `translate(0, ${(2 + bob).toFixed(1)})`);
        const belEl = this.partEls.get('bellows');
        if (belEl) belEl.setAttribute('transform', `translate(224 172) scale(${(1 + Math.sin(this.runTime * 6) * 0.08).toFixed(3)}, 1)`);
      } else if (clock.animType === 'steampunk') {
        if (secChanged) {
          this.lastRealSec = realSec;
          this.sound.playWatchTick(realSec % 2 === 1);
          this.syncHandsToNow(dc, false);
        }
        const sectorAng = Math.sin(this.runTime * 4) * 9;
        this.updatePartTransform('sector', 254, 224, sectorAng);
      } else {
        if (secChanged) {
          this.lastRealSec = realSec;
          this.sound.playWatchTick(realSec % 2 === 1);
          this.syncHandsToNow(dc, false);
        }
        if (clock.animType === 'radio' && this.radioWaveEl) {
          this.radioWaveEl.setAttribute('opacity', (0.35 + 0.65 * Math.abs(Math.sin(this.runTime * 4))).toFixed(2));
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  onPause() {
    this.paused = true;
    this.stopAnimation();
    if (this.p3d) this.p3d.stopLoop();
  }

  onResume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.completed) {
      this.startWatchAnimation();
    }
  }

  updatePartTransform(partId, x, y, angle) {
    const scope = this.p3dRig || this.svgEl;
    const el = (this.partEls && this.partEls.get(partId)) || (scope && scope.querySelector(`#wm-part-${partId}`));
    if (el) {
      el.setAttribute('transform', `translate(${x} ${y}) rotate(${angle.toFixed(1)})`);
    }
  }

  stopAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }
}
