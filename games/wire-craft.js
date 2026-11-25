import { FLAT_ICONS } from '../core/flat-icons.js';
import {
  buildPcbTracePoints,
  generateCircuitStage,
  pointsToSvgPath,
  renderComponentSvg,
  renderLiveMachineStage,
  renderMachineSvg
} from './wire-craft-data.js';

function ensureWireCraftStyles() {
  if (document.getElementById('wc-styles-v3')) return;
  const old2 = document.getElementById('wc-styles-v2');
  if (old2) old2.remove();
  const old = document.getElementById('wc-styles-v1');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'wc-styles-v3';
  style.textContent = `
    .wc-root {
      position: relative;
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) calc(10px + var(--safe-bottom)) calc(12px + var(--safe-left));
      gap: 7px;
      user-select: none; -webkit-user-select: none;
      touch-action: none;
    }
    .wc-root.is-wide {
      padding: calc(6px + var(--safe-top)) calc(8px + var(--safe-right)) calc(8px + var(--safe-bottom)) calc(8px + var(--safe-left));
      gap: 5px;
    }
    .wc-topbar {
      width: 100%; max-width: 1080px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      padding: 0 56px;
    }
    .wc-stage-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #FFD12E; border-radius: 18px;
      box-shadow: 0 4px 0 rgba(15,23,42,0.18);
      padding: 5px 14px; font-size: 15px; font-weight: 900;
      white-space: nowrap;
    }
    .wc-shuffle-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #FFFFFF; border-radius: 18px;
      box-shadow: 0 4px 0 rgba(15,23,42,0.18);
      padding: 6px 13px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 14px; font-weight: 900;
      transition: transform 0.1s ease;
    }
    .wc-shuffle-btn:active { transform: translateY(2px); }
    .wc-hud {
      width: 100%; max-width: 980px;
      display: flex; align-items: center; justify-content: center;
      gap: 12px; flex-wrap: wrap;
    }
    .wc-root.is-wide .wc-hud { max-width: 100%; }
    .wc-machine-card {
      display: inline-flex; align-items: center; gap: 10px;
      background: #FFFFFF; color: #1E293B;
      border: 4px solid #FFFFFF; border-radius: 22px;
      box-shadow: 0 6px 0 rgba(15,23,42,0.18);
      padding: 4px 16px 4px 10px;
    }
    .wc-machine-name {
      font-size: clamp(14px, 1.9vw, 18px); font-weight: 900; color: #1E293B;
    }
    .wc-machine-sub {
      font-size: 12px; font-weight: 800; color: #475569;
    }
    .wc-power-switch {
      display: inline-flex; align-items: center; gap: 8px;
      border: 4px solid #FFFFFF; border-radius: 22px;
      padding: 12px 26px; min-height: 54px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 19px; font-weight: 900;
      color: #FFFFFF; touch-action: manipulation;
      background: #EF4444; box-shadow: 0 6px 0 #B91C1C;
      transition: transform 0.1s ease, background 0.15s ease;
    }
    .wc-power-switch:active { transform: translateY(3px); }
    .wc-power-switch.is-ready {
      background: #22C55E; box-shadow: 0 6px 0 #15803D;
    }
    .wc-power-switch.is-disabled {
      background: #94A3B8; box-shadow: 0 5px 0 #64748B;
      opacity: 0.72;
    }
    .wc-board-wrap {
      flex: 1 1 auto; min-height: 0;
      width: 100%; max-width: 980px;
      display: flex; align-items: center; justify-content: center;
    }
    .wc-root.is-wide .wc-board-wrap { max-width: 100%; }
    .wc-svg {
      width: 100%; height: 100%;
      border-radius: 18px;
      border: 4px solid #CBD5E1;
      box-shadow: 0 10px 0 rgba(15, 23, 42, 0.34);
      touch-action: none;
    }
    .wc-port-pulse { animation: wcPulse 1.1s ease-in-out infinite; }

    /* Live Machine Action Stage Overlay */
    .wc-live-overlay {
      position: absolute; inset: 0; z-index: 50;
      background: rgba(15, 23, 42, 0.62);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .wc-live-card {
      width: min(92vw, 460px);
      background: #FFFFFF;
      border: 6px solid #FFD12E;
      border-radius: 34px;
      box-shadow: 0 12px 0 #C28A00;
      padding: 18px 20px 20px;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      text-align: center;
    }
    .wc-live-svg {
      width: 100%; max-width: 340px; height: auto;
      border-radius: 20px; overflow: hidden;
      border: 3px solid #E2E8F0;
    }
    .wc-live-title {
      margin: 0; font-size: clamp(22px, 3vw, 28px); font-weight: 900; color: #1E293B;
    }
    .wc-live-sub {
      margin: 0; font-size: 16px; font-weight: 800; color: #475569;
    }
    /* Lightweight GPU transform/opacity machine animations */
    .wc-anim-launch { animation: wcLaunch 1.6s ease-in-out infinite; }
    .wc-anim-flame  { transform-origin: 160px 144px; animation: wcFlame 0.22s ease-in-out infinite alternate; }
    .wc-anim-drive  { animation: wcDrive 1.8s ease-in-out infinite; }
    .wc-anim-fly    { animation: wcFly 1.6s ease-in-out infinite alternate; }
    .wc-anim-prop   { transform-origin: 97px 108px; animation: wcProp 0.16s linear infinite; }
    .wc-anim-bounce { animation: wcHop 0.55s ease-in-out infinite alternate; }
    .wc-anim-wave   { transform-origin: 160px 108px; animation: wcWave 0.9s ease-in-out infinite alternate; }
    .wc-anim-wave2  { transform-origin: 160px 108px; animation: wcWave 0.9s 0.35s ease-in-out infinite alternate; }

    @keyframes wcPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.42; } }
    @keyframes wcLaunch {
      0%   { transform: translateY(18px); }
      25%  { transform: translateY(14px) translateX(-2px); }
      40%  { transform: translateY(14px) translateX(2px); }
      100% { transform: translateY(-76px); }
    }
    @keyframes wcFlame { from { transform: scaleY(0.82); } to { transform: scaleY(1.22); } }
    @keyframes wcDrive {
      0%   { transform: translateX(-64px); }
      50%  { transform: translateX(0px) translateY(-3px); }
      100% { transform: translateX(68px); }
    }
    @keyframes wcFly {
      from { transform: translate(-18px, 12px) rotate(-4deg); }
      to   { transform: translate(18px, -16px) rotate(4deg); }
    }
    @keyframes wcProp { from { transform: scaleY(1); } to { transform: scaleY(0.2); } }
    @keyframes wcHop  { from { transform: translateY(4px) scale(0.98); } to { transform: translateY(-10px) scale(1.04); } }
    @keyframes wcWave { from { opacity: 0.35; transform: scale(0.92); } to { opacity: 1; transform: scale(1.06); } }
  `;
  document.head.appendChild(style);
}

export default class WireCraftGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.mode = 'normal'; // 'normal' | 'wide' | 'challenge'
    this.stageNum = 1;
    this.stage = null;
    this.connected = new Set();
    this.switchOn = false;
    this.powered = false;

    this.drag = null; // { pairId, end, x1, y1, x2, y2, color, laneX }
    this.celebTimer = null;

    this.boundMove = (e) => this.onPointerMove(e);
    this.boundUp = (e) => this.onPointerUp(e);
  }

  mount() {
    ensureWireCraftStyles();
    this.app.setGameBackground('#0F766E');

    this.container.innerHTML = `
      <div class="wc-root" id="wc-root">
        <div class="wc-topbar">
          <div class="pm-mode-tabs" id="wc-tabs">
            <button class="pm-tab-btn is-active" type="button" data-wcmode="normal">${FLAT_ICONS.stars(1, 14)}<span>ふつう</span></button>
            <button class="pm-tab-btn" type="button" data-wcmode="wide">${FLAT_ICONS.stars(2, 14)}<span>ワイド</span></button>
            <button class="pm-tab-btn" type="button" data-wcmode="challenge">${FLAT_ICONS.stars(3, 13)}<span>チャレンジ</span></button>
          </div>
          <span class="wc-stage-pill" id="wc-stage-pill">${FLAT_ICONS.star(18)}<span>ステージ 1</span></span>
          <button class="wc-shuffle-btn" type="button" id="wc-shuffle-btn">
            ${FLAT_ICONS.refresh(18)}<span>べつの きばん</span>
          </button>
        </div>

        <div class="wc-hud" id="wc-hud"></div>

        <div class="wc-board-wrap">
          <svg class="wc-svg" id="wc-svg" viewBox="0 0 740 420" aria-label="プリント きばん"></svg>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#wc-root');
    this.stagePillEl = this.container.querySelector('#wc-stage-pill');
    this.hudEl = this.container.querySelector('#wc-hud');
    this.svgEl = this.container.querySelector('#wc-svg');
    this.tabBtns = Array.from(this.container.querySelectorAll('[data-wcmode]'));

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (btn.dataset.wcmode === this.mode) return;
        this.mode = btn.dataset.wcmode;
        this.stageNum = 1;
        this.sound.playPageTurn(1);
        this.nextStage(false);
      });
    });

    this.container.querySelector('#wc-shuffle-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.nextStage(false);
    });

    window.addEventListener('pointermove', this.boundMove, { passive: false });
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('pointercancel', this.boundUp);

    this.nextStage(false);
  }

  unmount() {
    this.clearTimers();
    this.drag = null;
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('pointercancel', this.boundUp);
    this.container.innerHTML = '';
  }

  onPause() { this.clearTimers(); }
  onResume() {}

  clearTimers() {
    if (this.celebTimer) {
      clearTimeout(this.celebTimer);
      this.celebTimer = null;
    }
  }

  nextStage(increment = true) {
    this.clearTimers();
    this.drag = null;
    if (increment) this.stageNum++;
    const prevId = this.stage ? this.stage.machine.id : null;
    this.stage = generateCircuitStage(this.stageNum, this.mode, prevId);
    this.connected.clear();
    this.switchOn = false;
    this.powered = false;

    const existing = this.rootEl.querySelector('.wc-live-overlay, .celeb-overlay');
    if (existing) existing.remove();

    this.rootEl.classList.toggle('is-wide', this.mode === 'wide');
    this.tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.wcmode === this.mode));
    this.stagePillEl.innerHTML = `${FLAT_ICONS.star(18)}<span>ステージ ${this.stageNum}</span>`;
    this.svgEl.setAttribute('viewBox', `0 0 ${this.stage.width} ${this.stage.height}`);

    this.renderAll();
  }

  allWired() {
    return this.stage && this.connected.size === this.stage.pairs.length;
  }

  isComponentPowered(compId) {
    if (this.powered) return true;
    if (compId === 'cpu') return this.connected.size > 0;
    return this.stage.pairs.some((p) => this.connected.has(p.id) && (p.a.compId === compId || p.b.compId === compId));
  }

  renderAll() {
    this.renderHud();
    this.renderBoard();
  }

  renderHud() {
    const st = this.stage;
    const allDone = this.allWired();
    const mSize = this.mode === 'wide' ? 44 : 54;
    const statusText = this.powered
      ? st.machine.msg
      : (allDone && st.hasSwitch
        ? 'はいせん かんりょう！ スイッチを おそう！'
        : `おなじ いろの ランドを つなごう！（${this.connected.size} / ${st.pairs.length}）`);

    let switchHtml = '';
    if (st.hasSwitch) {
      const cls = this.powered ? 'is-ready' : (allDone ? 'is-ready' : 'is-disabled');
      const lbl = this.powered ? 'SW1: ON' : 'SW1: でんげん ON';
      switchHtml = `<button class="wc-power-switch ${cls}" type="button" id="wc-power-btn">${FLAT_ICONS.sparkle(20)}<span>${lbl}</span></button>`;
    }

    this.hudEl.innerHTML = `
      <div class="wc-machine-card">
        ${renderMachineSvg(st.machine.id, this.powered, mSize)}
        <div>
          <div class="wc-machine-name">${st.machine.name} きばん（${st.theme.name}）</div>
          <div class="wc-machine-sub">${statusText}</div>
        </div>
      </div>
      ${switchHtml}
    `;

    const swBtn = this.hudEl.querySelector('#wc-power-btn');
    if (swBtn) {
      const handleSwitch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sound.unlock();
        if (this.powered) return;
        if (!this.allWired()) {
          this.sound.playGentleNudge();
          return;
        }
        this.switchOn = true;
        this.sound.playSwitchToggle(true);
        this.triggerPowerOn();
      };
      swBtn.addEventListener('pointerdown', handleSwitch);
      swBtn.addEventListener('click', handleSwitch);
    }
  }

  renderBoard() {
    const st = this.stage;
    const { width: W, height: H, theme } = st;

    // Fine PCB reference grid
    let gridLines = '';
    for (let x = 32; x < W; x += 32) {
      gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${theme.grid}" stroke-width="1"/>`;
    }
    for (let y = 32; y < H; y += 32) {
      gridLines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${theme.grid}" stroke-width="1"/>`;
    }

    // Silkscreen perimeter frame & authentic PCB markings
    const silkFrame = `
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="8" fill="none" stroke="${theme.silk}" stroke-width="2"/>
      <text x="52" y="28" font-size="11" font-weight="900" fill="${theme.silk}" font-family="monospace">YGEN-PCB REV.${this.stageNum}.0  //  ${st.machine.id.toUpperCase()}-CTRL</text>
      <text x="${W - 52}" y="${H - 18}" text-anchor="end" font-size="10" font-weight="800" fill="${theme.silk}" font-family="monospace">+5V / GND  OK</text>
    `;

    // Background copper traces (strictly 90deg + 45deg!)
    const bgTraces = st.traces.map((d) =>
      `<path d="${d}" fill="none" stroke="${theme.copper}" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter" opacity="0.7"/>`
    ).join('');

    // Gold-plated mounting holes at 4 corners
    const holes = [[28, 28], [W - 28, 28], [28, H - 28], [W - 28, H - 28]].map(([hx, hy]) => `
      <circle cx="${hx}" cy="${hy}" r="11" fill="#D97706" stroke="#FDE68A" stroke-width="2.5"/>
      <circle cx="${hx}" cy="${hy}" r="5.5" fill="#0F172A"/>
    `).join('');

    // Authentic 90deg/45deg octilinear PCB traces & corner vias
    let wiresHtml = '';
    for (const p of st.pairs) {
      const isDone = this.connected.has(p.id);
      const pts = buildPcbTracePoints(p.a.x, p.a.y, p.b.x, p.b.y, p.laneX);
      const pathD = pointsToSvgPath(pts);

      if (isDone) {
        wiresHtml += `
          <path d="${pathD}" fill="none" stroke="${p.color.dark}" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter"/>
          <path d="${pathD}" fill="none" stroke="${p.color.hex}" stroke-width="7.5" stroke-linecap="square" stroke-linejoin="miter"/>
          <path d="${pathD}" fill="none" stroke="${p.color.copper}" stroke-width="2.4" stroke-dasharray="10 8" stroke-linecap="square" opacity="${this.powered ? '1' : '0.75'}"/>
        `;
        // Place gold vias at intermediate bend points for authentic PCB look
        if (pts.length >= 4) {
          const v1 = pts[1];
          const v2 = pts[pts.length - 2];
          wiresHtml += `
            <circle cx="${v1[0].toFixed(1)}" cy="${v1[1].toFixed(1)}" r="5" fill="#FBBF24" stroke="#92400E" stroke-width="1.5"/>
            <circle cx="${v1[0].toFixed(1)}" cy="${v1[1].toFixed(1)}" r="2" fill="#0F172A"/>
            <circle cx="${v2[0].toFixed(1)}" cy="${v2[1].toFixed(1)}" r="5" fill="#FBBF24" stroke="#92400E" stroke-width="1.5"/>
            <circle cx="${v2[0].toFixed(1)}" cy="${v2[1].toFixed(1)}" r="2" fill="#0F172A"/>
          `;
        }
      } else {
        // Subtle silkscreen guide trace showing the 45-degree PCB corridor
        wiresHtml += `
          <path d="${pathD}" fill="none" stroke="${p.color.hex}" stroke-width="3" stroke-dasharray="6 7" stroke-linejoin="miter" opacity="0.28"/>
        `;
      }
    }

    // Large realistic electronic components mounted on the PCB
    const compsHtml = st.components.map((comp) => `
      <g transform="translate(${comp.x} ${comp.y})">
        ${renderComponentSvg(comp, this.isComponentPowered(comp.id))}
      </g>
    `).join('');

    // Gold-plated through-hole solder pads (lands) with clear color coding
    const padR = this.mode === 'wide' ? 16 : 17;
    let padsHtml = '';
    for (const p of st.pairs) {
      const isDone = this.connected.has(p.id);
      const isDraggingThis = this.drag && this.drag.pairId === p.id;
      for (const endKey of ['a', 'b']) {
        const pt = p[endKey];
        const isTarget = isDraggingThis && this.drag.end !== endKey;
        const r = isTarget ? padR + 5 : padR;
        padsHtml += `
          <g class="wc-port" data-pair="${p.id}" data-end="${endKey}" style="cursor:pointer;">
            <circle cx="${pt.x}" cy="${pt.y}" r="${r + 10}" fill="transparent"/>
            <!-- Outer gold solder pad -->
            <circle cx="${pt.x}" cy="${pt.y}" r="${r + 2.5}" fill="#F59E0B" stroke="#92400E" stroke-width="1.6"/>
            <!-- Color-coded signal ring -->
            <circle class="${!isDone ? 'wc-port-pulse' : ''}" cx="${pt.x}" cy="${pt.y}" r="${r - 1.5}"
              fill="${p.color.hex}" stroke="#FFFFFF" stroke-width="${isTarget ? 4 : 2.5}"/>
            <!-- Through-hole drill center -->
            <circle cx="${pt.x}" cy="${pt.y}" r="${isDone ? 5 : 4.2}" fill="${isDone ? '#FFFFFF' : '#0F172A'}"/>
          </g>
        `;
      }
    }

    // Real-time 90deg/45deg octilinear dragging trace!
    let liveWireHtml = '';
    if (this.drag) {
      const livePts = buildPcbTracePoints(this.drag.x1, this.drag.y1, this.drag.x2, this.drag.y2);
      const d = pointsToSvgPath(livePts);
      liveWireHtml = `
        <path id="wc-live-wire-bg" d="${d}" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter" opacity="0.5"/>
        <path id="wc-live-wire" d="${d}" fill="none" stroke="${this.drag.color.hex}" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>
      `;
    }

    this.svgEl.innerHTML = `
      <rect width="${W}" height="${H}" fill="${theme.bg}"/>
      ${gridLines}
      ${bgTraces}
      ${silkFrame}
      ${holes}
      ${wiresHtml}
      ${compsHtml}
      ${liveWireHtml}
      ${padsHtml}
    `;

    this.svgEl.querySelectorAll('.wc-port').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const pairId = el.dataset.pair;
        const end = el.dataset.end;
        if (this.connected.has(pairId) || this.powered) return;
        const pair = this.stage.pairs.find((p) => p.id === pairId);
        if (!pair) return;
        const startPt = pair[end];
        const curPt = this.clientToSvg(e.clientX, e.clientY);
        this.drag = {
          pairId,
          end,
          x1: startPt.x,
          y1: startPt.y,
          x2: curPt.x,
          y2: curPt.y,
          color: pair.color,
          laneX: pair.laneX
        };
        this.sound.playMetalClick();
        this.renderBoard();
      });
    });
  }

  onPointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const pt = this.clientToSvg(e.clientX, e.clientY);
    this.drag.x2 = pt.x;
    this.drag.y2 = pt.y;
    // Live octilinear (90deg + 45deg) PCB routing as the finger moves!
    const livePts = buildPcbTracePoints(this.drag.x1, this.drag.y1, this.drag.x2, this.drag.y2);
    const d = pointsToSvgPath(livePts);
    const bgEl = this.svgEl.querySelector('#wc-live-wire-bg');
    const fgEl = this.svgEl.querySelector('#wc-live-wire');
    if (bgEl) bgEl.setAttribute('d', d);
    if (fgEl) fgEl.setAttribute('d', d);
  }

  onPointerUp(e) {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;

    const pair = this.stage.pairs.find((p) => p.id === d.pairId);
    if (!pair) return;

    const targetEnd = d.end === 'a' ? 'b' : 'a';
    const targetPt = pair[targetEnd];
    const pt = this.clientToSvg(e.clientX, e.clientY);
    const dist = Math.hypot(pt.x - targetPt.x, pt.y - targetPt.y);

    if (dist <= 54) {
      this.connected.add(pair.id);
      this.sound.playCountPip(this.connected.size + 3);
      if (this.allWired() && !this.stage.hasSwitch) {
        this.triggerPowerOn();
      } else {
        this.renderAll();
      }
    } else {
      this.sound.playGentleNudge();
      this.renderBoard();
    }
  }

  triggerPowerOn() {
    this.powered = true;
    this.sound.playLampOn(this.stage.machine.sound);
    this.renderAll();

    const st = this.stage;
    this.celebTimer = setTimeout(() => {
      this.sound.playCrackerPop();
      const overlay = document.createElement('div');
      overlay.className = 'wc-live-overlay';
      overlay.innerHTML = `
        <div class="wc-live-card">
          <div class="celeb-icons-row">
            <span class="celeb-cracker-l">${FLAT_ICONS.cracker(46)}</span>
            <h3 class="wc-live-title">ステージ ${this.stageNum} クリア！</h3>
            <span class="celeb-cracker-r">${FLAT_ICONS.cracker(46)}</span>
          </div>
          ${renderLiveMachineStage(st.machine.id)}
          <p class="wc-live-sub">${st.machine.msg}</p>
          <button class="celeb-next-btn" type="button" id="wc-live-next">
            <span>つぎの きばんへ</span>
            ${FLAT_ICONS.arrowRight(26)}
          </button>
        </div>
      `;
      const nextBtn = overlay.querySelector('#wc-live-next');
      const goNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sound.playPageTurn(1);
        overlay.remove();
        this.nextStage(true);
      };
      nextBtn.addEventListener('pointerdown', goNext);
      nextBtn.addEventListener('click', goNext);
      this.rootEl.appendChild(overlay);
    }, 520);
  }

  clientToSvg(clientX, clientY) {
    const r = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * this.stage.width,
      y: ((clientY - r.top) / r.height) * this.stage.height
    };
  }
}
