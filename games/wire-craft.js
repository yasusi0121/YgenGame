import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';
import {
  generateCircuitStage,
  renderMachineSvg,
  renderPartIconSvg
} from './wire-craft-data.js';

function ensureWireCraftStyles() {
  if (document.getElementById('wc-styles-v1')) return;
  const style = document.createElement('style');
  style.id = 'wc-styles-v1';
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
    .wc-root.is-wide .wc-hud {
      max-width: 100%;
    }
    .wc-machine-card {
      display: inline-flex; align-items: center; gap: 10px;
      background: #FFFFFF; color: #1E293B;
      border: 4px solid #FFFFFF; border-radius: 24px;
      box-shadow: 0 6px 0 rgba(15,23,42,0.18);
      padding: 5px 16px 5px 10px;
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .wc-machine-card.is-powered {
      background: #FEF9C3; border-color: #FFD12E;
      animation: wcCelebrateHop 0.45s ease-in-out 3;
    }
    .wc-machine-name {
      font-size: clamp(15px, 2vw, 19px); font-weight: 900; color: #1E293B;
    }
    .wc-machine-sub {
      font-size: 12px; font-weight: 800; color: #64748B;
    }
    .wc-power-switch {
      display: inline-flex; align-items: center; gap: 8px;
      border: 4px solid #FFFFFF; border-radius: 22px;
      padding: 10px 22px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 18px; font-weight: 900;
      color: #FFFFFF;
      background: #EF4444; box-shadow: 0 6px 0 #B91C1C;
      transition: transform 0.1s ease, background 0.15s ease;
    }
    .wc-power-switch:active { transform: translateY(3px); }
    .wc-power-switch.is-ready {
      background: #22C55E; box-shadow: 0 6px 0 #15803D;
      animation: wcSwitchPulse 0.9s ease-in-out infinite alternate;
    }
    .wc-power-switch.is-disabled {
      background: #94A3B8; box-shadow: 0 5px 0 #64748B;
      opacity: 0.72;
    }
    .wc-board-wrap {
      flex: 1 1 auto; min-height: 0;
      width: 100%; max-width: 960px;
      display: flex; align-items: center; justify-content: center;
    }
    .wc-root.is-wide .wc-board-wrap {
      max-width: 100%;
    }
    .wc-svg {
      width: 100%; height: 100%;
      border-radius: 26px;
      border: 5px solid #FFFFFF;
      box-shadow: 0 10px 0 rgba(15, 23, 42, 0.28);
      touch-action: none;
    }
    .wc-port-pulse {
      animation: wcPulse 1.1s ease-in-out infinite;
    }
    @keyframes wcPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    @keyframes wcSwitchPulse {
      from { transform: scale(1); }
      to   { transform: scale(1.06); }
    }
    @keyframes wcCelebrateHop {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.06); }
    }
  `;
  document.head.appendChild(style);
}

function wireCurvePath(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const bend = Math.max(36, dx * 0.42);
  const cx1 = x1 + (x2 >= x1 ? bend : -bend);
  const cx2 = x2 - (x2 >= x1 ? bend : -bend);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${y1.toFixed(1)}, ${cx2.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
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

    this.drag = null; // { pairId, end, x1, y1, x2, y2, color }
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
          <svg class="wc-svg" id="wc-svg" viewBox="0 0 680 400" aria-label="はいせん きばん"></svg>
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

  onPause() {
    this.clearTimers();
  }

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

    const existing = this.rootEl.querySelector('.celeb-overlay');
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

  renderAll() {
    this.renderHud();
    this.renderBoard();
  }

  renderHud() {
    const st = this.stage;
    const allDone = this.allWired();
    const mSize = this.mode === 'wide' ? 46 : 58;
    const statusText = this.powered
      ? st.machine.msg
      : (allDone && st.hasSwitch
        ? 'ぜんぶ つながった！スイッチを おそう！'
        : `おなじ いろ を つなごう！（${this.connected.size} / ${st.pairs.length}）`);

    let switchHtml = '';
    if (st.hasSwitch) {
      const cls = this.powered ? 'is-ready' : (allDone ? 'is-ready' : 'is-disabled');
      const lbl = this.powered ? 'でんげん ON！' : 'でんげん スイッチ';
      switchHtml = `<button class="wc-power-switch ${cls}" type="button" id="wc-power-btn">${FLAT_ICONS.sparkle(20)}<span>${lbl}</span></button>`;
    }

    this.hudEl.innerHTML = `
      <div class="wc-machine-card ${this.powered ? 'is-powered' : ''}">
        ${renderMachineSvg(st.machine.id, this.powered, mSize)}
        <div>
          <div class="wc-machine-name">${st.machine.name} を うごかそう！</div>
          <div class="wc-machine-sub">${statusText}</div>
        </div>
      </div>
      ${switchHtml}
    `;

    const swBtn = this.hudEl.querySelector('#wc-power-btn');
    if (swBtn) {
      swBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (this.powered) return;
        if (!this.allWired()) {
          this.sound.playGentleNudge();
          return;
        }
        this.switchOn = true;
        this.sound.playSwitchToggle(true);
        this.triggerPowerOn();
      });
    }
  }

  renderBoard() {
    const st = this.stage;
    const { width: W, height: H, theme } = st;

    // Subtle PCB grid lines (low-cost SVG lines)
    let gridLines = '';
    for (let x = 40; x < W; x += 40) {
      gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${theme.grid}" stroke-width="1.5"/>`;
    }
    for (let y = 40; y < H; y += 40) {
      gridLines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${theme.grid}" stroke-width="1.5"/>`;
    }

    // Decorative background PCB traces
    const tracesHtml = st.traces.map((d) =>
      `<path d="${d}" fill="none" stroke="${theme.trace}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>`
    ).join('');

    // Corner PCB mounting holes
    const holes = [[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].map(([hx, hy]) =>
      `<circle cx="${hx}" cy="${hy}" r="9" fill="#0F172A" stroke="#FBBF24" stroke-width="3"/>`
    ).join('');

    // Guide lines (faint dashed hints for unconnected pairs) & Connected glowing cables
    let wiresHtml = '';
    for (const p of st.pairs) {
      const isDone = this.connected.has(p.id);
      const pathD = wireCurvePath(p.a.x, p.a.y, p.b.x, p.b.y);
      if (isDone) {
        wiresHtml += `
          <path d="${pathD}" fill="none" stroke="${p.color.dark}" stroke-width="14" stroke-linecap="round"/>
          <path d="${pathD}" fill="none" stroke="${p.color.hex}" stroke-width="9" stroke-linecap="round"/>
          <path d="${pathD}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="10 10" stroke-linecap="round" opacity="${this.powered ? '0.95' : '0.65'}"/>
        `;
      } else {
        wiresHtml += `
          <path d="${pathD}" fill="none" stroke="${p.color.hex}" stroke-width="3.5" stroke-dasharray="7 9" opacity="0.26"/>
        `;
      }
    }

    // Electronic component chips & interactive color ports
    const portR = this.mode === 'wide' ? 20 : 21;
    let portsHtml = '';
    for (const p of st.pairs) {
      const isDone = this.connected.has(p.id);
      const isDraggingThis = this.drag && this.drag.pairId === p.id;
      for (const endKey of ['a', 'b']) {
        const pt = p[endKey];
        const isTargetHighlight = isDraggingThis && this.drag.end !== endKey;
        const r = isTargetHighlight ? portR + 6 : portR;
        const offsetChipX = endKey === 'a' && pt.kind !== 'relay' ? -36 : (endKey === 'b' && pt.kind !== 'relay' ? 36 : 0);
        const chipSvg = pt.kind === 'relay'
          ? `<g transform="translate(${pt.x} ${pt.y - 34}) scale(0.72)">${renderPartIconSvg('relay', isDone)}</g>`
          : `<g transform="translate(${pt.x + offsetChipX} ${pt.y}) scale(0.85)">${renderPartIconSvg(pt.kind, isDone)}</g>`;

        portsHtml += `
          ${chipSvg}
          <g class="wc-port" data-pair="${p.id}" data-end="${endKey}" style="cursor:pointer;">
            <circle cx="${pt.x}" cy="${pt.y}" r="${r + 8}" fill="transparent"/>
            <circle class="${!isDone ? 'wc-port-pulse' : ''}" cx="${pt.x}" cy="${pt.y}" r="${r}"
              fill="${p.color.hex}" stroke="#FFFFFF" stroke-width="${isTargetHighlight ? 5.5 : 4}"/>
            <circle cx="${pt.x}" cy="${pt.y}" r="${isDone ? 7 : 5}" fill="${isDone ? '#FFFFFF' : p.color.dark}"/>
          </g>
        `;
      }
    }

    // Live dragging wire
    let liveWireHtml = '';
    if (this.drag) {
      const d = wireCurvePath(this.drag.x1, this.drag.y1, this.drag.x2, this.drag.y2);
      liveWireHtml = `
        <path id="wc-live-wire-bg" d="${d}" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.5"/>
        <path id="wc-live-wire" d="${d}" fill="none" stroke="${this.drag.color.hex}" stroke-width="10" stroke-linecap="round"/>
      `;
    }

    this.svgEl.innerHTML = `
      <rect width="${W}" height="${H}" fill="${theme.bg}"/>
      ${gridLines}
      ${tracesHtml}
      ${holes}
      ${wiresHtml}
      ${liveWireHtml}
      ${portsHtml}
    `;

    // Bind pointerdown on unconnected ports
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
          color: pair.color
        };
        this.sound.playButtonDown('yellow');
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
    const d = wireCurvePath(this.drag.x1, this.drag.y1, this.drag.x2, this.drag.y2);
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

    if (dist <= 56) {
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
      showCelebrationOverlay(this.rootEl, {
        title: `ステージ ${this.stageNum} クリア！`,
        subtitle: st.machine.msg,
        centerHtml: renderMachineSvg(st.machine.id, true, 76),
        btnLabel: 'つぎの きばんへ',
        sound: this.sound,
        onNext: () => this.nextStage(true)
      });
    }, 1450);
  }

  clientToSvg(clientX, clientY) {
    const r = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * this.stage.width,
      y: ((clientY - r.top) / r.height) * this.stage.height
    };
  }
}
