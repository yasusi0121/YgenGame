import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';
import { ALEXA_DEVICES, DOT_COLORS, buildAlexaPcbPath, renderAlexaPartSvg } from './alexa-builder-parts.js';

function ensureAlexaStyles() {
  if (document.getElementById('ab-styles-v2')) return;
  const style = document.createElement('style');
  style.id = 'ab-styles-v2';
  style.textContent = `
    .ab-root {
      position: relative;
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) calc(10px + var(--safe-bottom)) calc(12px + var(--safe-left));
      gap: 7px;
      user-select: none; -webkit-user-select: none;
      touch-action: none;
    }
    .ab-topbar {
      width: 100%; max-width: 1040px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      padding: 0 56px;
    }
    .ab-device-row {
      display: flex; align-items: center; justify-content: center;
      gap: 7px; flex-wrap: wrap;
    }
    .ab-dev-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.92); color: #1E293B;
      border: 3px solid #FFFFFF; border-radius: 18px;
      box-shadow: 0 4px 0 rgba(15,23,42,0.18);
      padding: 4px 11px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 13.5px; font-weight: 900;
      transition: transform 0.1s ease, background 0.14s ease;
    }
    .ab-dev-btn:active { transform: translateY(2px); }
    .ab-dev-btn.is-active {
      background: #38BDF8; color: #0F172A;
      box-shadow: 0 4px 0 #0284C7;
    }
    .ab-color-chip {
      width: 28px; height: 28px; border-radius: 50%;
      border: 3px solid #FFFFFF; cursor: pointer;
      box-shadow: 0 3px 0 rgba(15,23,42,0.22);
      transition: transform 0.1s ease;
    }
    .ab-color-chip.is-active {
      transform: scale(1.16);
      box-shadow: 0 0 0 3px #FFD12E, 0 3px 0 rgba(15,23,42,0.22);
    }
    .ab-hint-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: #475569; color: #F8FAFC;
      border: 3px solid #FFFFFF; border-radius: 18px;
      box-shadow: 0 4px 0 rgba(15,23,42,0.25);
      padding: 5px 12px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 13px; font-weight: 900;
      transition: transform 0.1s ease, background 0.14s ease;
    }
    .ab-hint-btn:active { transform: translateY(2px); }
    .ab-hint-btn.is-on {
      background: #F59E0B; color: #FFFFFF;
      box-shadow: 0 4px 0 #B45309;
    }
    .ab-prog-pill {
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(15,23,42,0.42); color: #F8FAFC;
      border: 2.5px solid rgba(255,255,255,0.65); border-radius: 999px;
      padding: 4px 12px;
      font-family: var(--font-rounded); font-size: 13px; font-weight: 900;
      letter-spacing: 0.03em;
    }
    .ab-banner {
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #FFFFFF;
      box-shadow: 0 5px 0 rgba(15,23,42,0.16);
      border-radius: 999px;
      padding: 6px 18px;
      font-size: clamp(13.5px, 1.8vw, 17px); font-weight: 900;
      display: inline-flex; align-items: center; gap: 10px;
      text-align: center;
    }
    .ab-stage-wrap {
      flex: 1 1 auto; min-height: 0;
      width: 100%; max-width: 780px;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .ab-svg {
      width: 100%; height: 100%;
      max-height: 390px;
    }
    .ab-tray {
      width: 100%; max-width: 1000px;
      background: rgba(255, 251, 235, 0.95);
      border: 4px solid #FFFFFF;
      box-shadow: 0 7px 0 rgba(15,23,42,0.2);
      border-radius: 24px;
      padding: 7px 10px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      min-height: 90px;
    }
    .ab-part-card {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 90px; min-height: 76px; padding: 5px 4px;
      background: #FFFFFF;
      border: 3px solid #CBD5E1; border-bottom: 5px solid #94A3B8;
      border-radius: 15px; cursor: grab;
      transition: transform 0.12s ease, border-color 0.14s ease;
      touch-action: none;
    }
    .ab-part-card:active { cursor: grabbing; transform: scale(0.95); }
    .ab-part-card.is-next {
      background: #FFFBEB; border-color: #F59E0B; border-bottom-color: #B45309;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.45);
    }
    .ab-part-card.is-locked { opacity: 0.45; }
    .ab-part-card.is-dragging { opacity: 0.25; }
    .ab-part-label {
      font-size: 10.5px; font-weight: 900; color: #1E293B;
      text-align: center; line-height: 1.15; margin-top: 2px;
    }
    .ab-ghost {
      position: fixed; pointer-events: none; z-index: 9999;
      transform: translate(-50%, -50%) scale(1.1);
    }
    .ab-test-btn {
      display: inline-flex; align-items: center; gap: 6px;
      border: 3px solid #FFFFFF; border-radius: 18px;
      padding: 9px 16px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 15px; font-weight: 900;
      color: #FFFFFF; transition: transform 0.1s ease;
    }
    .ab-test-btn:active { transform: translateY(3px); }
    .ab-t-music   { background: #8B5CF6; box-shadow: 0 5px 0 #6D28D9; }
    .ab-t-weather { background: #0EA5E9; box-shadow: 0 5px 0 #0369A1; }
    .ab-t-timer   { background: #F97316; box-shadow: 0 5px 0 #C2410C; }
    .ab-t-xray    { background: #14B8A6; box-shadow: 0 5px 0 #0F766E; }
    .ab-t-next    { background: #22C55E; box-shadow: 0 5px 0 #15803D; }
    .ab-pulse { animation: abPulse 1.15s ease-in-out infinite; }
    @keyframes abPulse {
      0%, 100% { opacity: 0.95; }
      50% { opacity: 0.35; }
    }
  `;
  document.head.appendChild(style);
}

export default class AlexaBuilderGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.deviceId = 'show8'; // 'show8' | 'dot'
    this.dotColorIdx = 0;
    this.mode = 'assemble'; // 'assemble' | 'wire' | 'repair'
    this.hintOn = true;

    this.installed = new Set();
    this.wired = new Set();
    this.brokenIds = new Set();
    this.totalFaults = 0;
    this.repairDecoys = [];
    this.completed = false;
    this.testMode = 'idle';
    this.xray = false;

    this.dragPart = null;
    this.wireDrag = null; // { nodeId, startEnd, x1, y1, x2, y2, color }
    this.timerInterval = null;
    this.celebTimer = null;

    this.boundMove = (e) => this.onPointerMove(e);
    this.boundUp = (e) => this.onPointerUp(e);
  }

  mount() {
    ensureAlexaStyles();
    this.app.setGameBackground('#0284C7');

    this.container.innerHTML = `
      <div class="ab-root" id="ab-root">
        <div class="ab-topbar">
          <div class="pm-mode-tabs" id="ab-mode-tabs">
            <button class="pm-tab-btn is-active" type="button" data-abmode="assemble">${FLAT_ICONS.stars(1, 14)}<span>くみたて</span></button>
            <button class="pm-tab-btn" type="button" data-abmode="wire">${FLAT_ICONS.stars(2, 14)}<span>はいせん</span></button>
            <button class="pm-tab-btn" type="button" data-abmode="repair">${FLAT_ICONS.stars(3, 13)}<span>しゅうり</span></button>
          </div>
          <div class="ab-device-row" id="ab-device-row">
            <button class="ab-dev-btn is-active" type="button" data-dev="show8">${FLAT_ICONS.echoShow(24)}<span>Show 8</span></button>
            <button class="ab-dev-btn" type="button" data-dev="dot">${FLAT_ICONS.echoDot(24, 'white')}<span>Echo Dot</span></button>
            <span id="ab-dot-colors" style="display:none;align-items:center;gap:6px;">
              ${DOT_COLORS.map((c, idx) => `
                <button class="ab-color-chip ${idx === 0 ? 'is-active' : ''}" type="button" data-dcol="${idx}" aria-label="${c.label}" style="background:${c.body};"></button>
              `).join('')}
            </span>
            <button class="ab-hint-btn is-on" type="button" id="ab-hint-btn">ひんと：ON</button>
            <span class="ab-prog-pill" id="ab-prog-pill">0 / 10</span>
          </div>
        </div>

        <div class="ab-banner" id="ab-banner"></div>

        <div class="ab-stage-wrap">
          <svg class="ab-svg" id="ab-svg" viewBox="0 0 560 360" aria-label="アレクサ つくり"></svg>
        </div>

        <div class="ab-tray" id="ab-tray"></div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#ab-root');
    this.bannerEl = this.container.querySelector('#ab-banner');
    this.svgEl = this.container.querySelector('#ab-svg');
    this.trayEl = this.container.querySelector('#ab-tray');
    this.dotColorsWrap = this.container.querySelector('#ab-dot-colors');
    this.hintBtn = this.container.querySelector('#ab-hint-btn');
    this.progEl = this.container.querySelector('#ab-prog-pill');

    this.container.querySelectorAll('[data-abmode]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (btn.dataset.abmode === this.mode) return;
        this.mode = btn.dataset.abmode;
        this.sound.playPageTurn(1);
        this.resetStage();
      });
    });

    this.container.querySelectorAll('[data-dev]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (btn.dataset.dev === this.deviceId) return;
        this.deviceId = btn.dataset.dev;
        this.sound.playButtonDown('yellow');
        this.resetStage();
      });
    });

    this.container.querySelectorAll('[data-dcol]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.dotColorIdx = Number(btn.dataset.dcol);
        this.sound.playButtonDown('yellow');
        this.container.querySelectorAll('[data-dcol]').forEach((b) =>
          b.classList.toggle('is-active', Number(b.dataset.dcol) === this.dotColorIdx)
        );
        this.renderAll();
      });
    });

    this.hintBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.hintOn = !this.hintOn;
      this.hintBtn.textContent = this.hintOn ? 'ひんと：ON' : 'ひんと：OFF';
      this.hintBtn.classList.toggle('is-on', this.hintOn);
      this.sound.playButtonDown('yellow');
      this.renderAll();
    });

    window.addEventListener('pointermove', this.boundMove, { passive: false });
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('pointercancel', this.boundUp);

    this.resetStage();
  }

  unmount() {
    this.clearTimers();
    this.clearDrag();
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
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    if (this.celebTimer) { clearTimeout(this.celebTimer); this.celebTimer = null; }
  }

  getDevice() {
    return ALEXA_DEVICES[this.deviceId];
  }

  getDotColor() {
    return DOT_COLORS[this.dotColorIdx];
  }

  getNowTimeStr() {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  resetStage() {
    this.clearTimers();
    this.clearDrag();
    this.installed.clear();
    this.wired.clear();
    this.brokenIds.clear();
    this.totalFaults = 0;
    this.repairDecoys = [];
    this.completed = false;
    this.testMode = 'idle';
    this.xray = false;

    const existing = this.rootEl.querySelector('.celeb-overlay');
    if (existing) existing.remove();

    this.container.querySelectorAll('[data-abmode]').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.abmode === this.mode)
    );
    this.container.querySelectorAll('[data-dev]').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.dev === this.deviceId)
    );
    this.dotColorsWrap.style.display = this.deviceId === 'dot' ? 'inline-flex' : 'none';

    const dev = this.getDevice();
    if (this.mode === 'repair') {
      // Pick 2 or 3 simultaneous random internal faults + 2 decoy spare parts
      const candidates = dev.assembleParts.filter((p) => p.id !== 'plug' && p.id !== 'shell');
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      const count = Math.random() < 0.5 ? 2 : 3;
      shuffled.slice(0, count).forEach((p) => this.brokenIds.add(p.id));
      this.totalFaults = this.brokenIds.size;
      this.repairDecoys = shuffled.slice(count, count + 2);
    }

    this.renderAll();
  }

  renderAll() {
    const dev = this.getDevice();
    if (this.mode === 'assemble') {
      this.progEl.textContent = `${this.installed.size} / ${dev.assembleParts.length}`;
    } else if (this.mode === 'wire') {
      this.progEl.textContent = `${this.wired.size} / ${dev.wireNodes.length}`;
    } else {
      const fixed = this.totalFaults - this.brokenIds.size;
      this.progEl.textContent = `${fixed} / ${this.totalFaults}`;
    }

    if (this.completed) {
      this.bannerEl.textContent = `${dev.name} きどうしたよ！ボタンで テストしよう！`;
    } else if (this.mode === 'assemble') {
      const next = dev.assembleParts.find((p) => !this.installed.has(p.id));
      const left = dev.assembleParts.length - this.installed.size;
      if (this.hintOn && next) {
        this.bannerEl.textContent = `「${next.label}」を ドラッグして はめよう！（あと ${left} こ）`;
      } else {
        this.bannerEl.textContent = `ぶひんを じゅんばんに くみたてよう！（あと ${left} こ）`;
      }
    } else if (this.mode === 'wire') {
      this.bannerEl.textContent = `おなじ いろの たんしを 90ど きばんはいせんで つなごう！（${this.wired.size} / ${dev.wireNodes.length}）`;
    } else if (this.mode === 'repair') {
      this.bannerEl.textContent = `あかく こわれた ぶひん（あと ${this.brokenIds.size} こ）を なおそう！`;
    }

    this.renderSvg();
    this.renderTray();
  }

  renderSvg() {
    const dev = this.getDevice();
    const renderOpts = {
      dotColor: this.getDotColor(),
      powered: this.completed,
      testMode: this.testMode,
      timeStr: this.getNowTimeStr()
    };

    let inner = dev.renderChassis();

    if (this.mode === 'assemble') {
      for (const p of dev.assembleParts) {
        if (!this.installed.has(p.id)) continue;
        const isCover = p.id === 'screen' || p.id === 'shell';
        const op = (this.xray && isCover) ? ' opacity="0.24"' : '';
        inner += `<g transform="translate(${p.x} ${p.y})"${op}>${renderAlexaPartSvg(p.kind, renderOpts)}</g>`;
      }
      if (!this.completed && this.hintOn) {
        const active = this.dragPart
          ? dev.assembleParts.find((p) => p.id === this.dragPart.id)
          : dev.assembleParts.find((p) => !this.installed.has(p.id));
        if (active) {
          inner += `
            <g class="ab-pulse" pointer-events="none">
              <circle cx="${active.x}" cy="${active.y}" r="${Math.min(active.r, 58)}"
                fill="rgba(251,191,36,0.18)" stroke="#FFD12E" stroke-width="4.5" stroke-dasharray="9 6"/>
              <circle cx="${active.x}" cy="${active.y}" r="7" fill="#FFD12E"/>
            </g>
          `;
        }
      }
    } else if (this.mode === 'wire') {
      const cx = this.deviceId === 'show8' ? 250 : 260;
      const cy = this.deviceId === 'show8' ? 192 : 196;

      if (this.completed && !this.xray) {
        for (const p of dev.assembleParts) {
          inner += `<g transform="translate(${p.x} ${p.y})">${renderAlexaPartSvg(p.kind, renderOpts)}</g>`;
        }
      } else {
        // Subtle PCB grid lines inside chassis
        inner += `<g opacity="0.16" pointer-events="none" stroke="#94A3B8" stroke-width="1">
          <line x1="126" y1="130" x2="374" y2="130"/><line x1="126" y1="192" x2="374" y2="192"/><line x1="126" y1="254" x2="374" y2="254"/>
          <line x1="186" y1="106" x2="186" y2="278"/><line x1="250" y1="106" x2="250" y2="278"/><line x1="314" y1="106" x2="314" y2="278"/>
        </g>`;

        // Central AI CPU chip
        inner += `<g transform="translate(${cx} ${cy})">${renderAlexaPartSvg('ai-chip', { ...renderOpts, powered: this.wired.size > 0 })}</g>`;

        // 6 authentic 90/45-degree PCB traces & solder pads
        for (const n of dev.wireNodes) {
          const isDone = this.wired.has(n.id);
          const d = buildAlexaPcbPath(n.from[0], n.from[1], n.to[0], n.to[1]);
          inner += `<g transform="translate(${n.x} ${n.y}) scale(0.66)">${renderAlexaPartSvg(n.kind, { ...renderOpts, powered: isDone })}</g>`;
          if (isDone) {
            inner += `<path d="${d}" fill="none" stroke="${n.color}" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>`;
            inner += `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-dasharray="7 7" stroke-linecap="round"/>`;
          } else if (this.hintOn) {
            inner += `<path d="${d}" fill="none" stroke="rgba(255,255,255,0.26)" stroke-width="3.5" stroke-dasharray="5 5"/>`;
          }

          // Gold solder pad rings + interactive color-coded terminal pads
          inner += `
            <circle cx="${n.from[0]}" cy="${n.from[1]}" r="13.5" fill="none" stroke="#FBBF24" stroke-width="2.5" pointer-events="none"/>
            <circle class="ab-wire-port ${isDone ? '' : 'ab-pulse'}" data-port="${n.id}" data-end="from"
              cx="${n.from[0]}" cy="${n.from[1]}" r="11"
              fill="${n.color}" stroke="#0F172A" stroke-width="2" style="cursor:pointer;"/>
            <circle cx="${n.to[0]}" cy="${n.to[1]}" r="15" fill="none" stroke="#FBBF24" stroke-width="2.5" pointer-events="none"/>
            <circle class="ab-wire-port ${isDone ? '' : 'ab-pulse'}" data-port="${n.id}" data-end="to"
              cx="${n.to[0]}" cy="${n.to[1]}" r="12.5"
              fill="${n.color}" stroke="#0F172A" stroke-width="2" style="cursor:pointer;"/>
            <text x="${n.to[0]}" y="${n.to[1] + 29}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#F8FAFC" font-family="sans-serif">${n.label}</text>
          `;
        }

        // Live dragging 90/45-degree PCB wire preview
        if (this.wireDrag) {
          const liveD = buildAlexaPcbPath(this.wireDrag.x1, this.wireDrag.y1, this.wireDrag.x2, this.wireDrag.y2);
          inner += `<path id="ab-live-wire" d="${liveD}" fill="none" stroke="${this.wireDrag.color}" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>`;
        }
      }
    } else if (this.mode === 'repair') {
      for (const p of dev.assembleParts) {
        const isBroken = !this.completed && this.brokenIds.has(p.id);
        const isCover = (p.id === 'screen' || p.id === 'shell') && !isBroken;
        const op = ((!this.completed || this.xray) && isCover) ? ' opacity="0.2"' : '';
        inner += `<g transform="translate(${p.x} ${p.y})"${op}>${renderAlexaPartSvg(p.kind, { ...renderOpts, broken: isBroken })}</g>`;
        if (isBroken) {
          inner += `
            <g class="ab-pulse" pointer-events="none">
              <circle cx="${p.x}" cy="${p.y}" r="${Math.min(p.r, 52)}" fill="none" stroke="#EF4444" stroke-width="4.5" stroke-dasharray="9 6"/>
            </g>
          `;
        }
      }
    }

    this.svgEl.innerHTML = inner;

    // Bind wire drag ports in wiring mode
    if (this.mode === 'wire' && !this.completed) {
      this.svgEl.querySelectorAll('.ab-wire-port').forEach((el) => {
        el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.unlock();
          const id = el.dataset.port;
          if (this.wired.has(id)) return;
          const node = dev.wireNodes.find((n) => n.id === id);
          if (!node) return;
          const pt = this.clientToSvg(e.clientX, e.clientY);
          this.wireDrag = {
            nodeId: id,
            startEnd: el.dataset.end,
            x1: Number(el.getAttribute('cx')),
            y1: Number(el.getAttribute('cy')),
            x2: pt.x,
            y2: pt.y,
            color: node.color
          };
          this.sound.playButtonDown('yellow');
          this.renderSvg();
        });
      });
    }
  }

  renderTray() {
    const dev = this.getDevice();

    if (this.completed) {
      this.trayEl.innerHTML = `
        <button class="ab-test-btn ab-t-music" type="button" data-test="music">${FLAT_ICONS.note(20, '#FFFFFF')}<span>おんがく</span></button>
        <button class="ab-test-btn ab-t-weather" type="button" data-test="weather">${FLAT_ICONS.sun(20)}<span>おてんき</span></button>
        <button class="ab-test-btn ab-t-timer" type="button" data-test="timer">${FLAT_ICONS.sparkle(20)}<span>タイマー</span></button>
        <button class="ab-test-btn ab-t-xray" type="button" id="ab-xray-btn"><span>${this.xray ? 'カバーを もどす' : 'なかを みる'}</span></button>
        <button class="ab-test-btn ab-t-next" type="button" id="ab-finish-btn"><span>かんせい！</span></button>
      `;
      this.trayEl.querySelectorAll('[data-test]').forEach((btn) => {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.runAlexaTest(btn.dataset.test);
        });
      });
      this.trayEl.querySelector('#ab-xray-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.xray = !this.xray;
        this.sound.playButtonDown('yellow');
        this.renderAll();
      });
      this.trayEl.querySelector('#ab-finish-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.showClearCelebration();
      });
      return;
    }

    if (this.mode === 'wire') {
      this.trayEl.innerHTML = dev.wireNodes.map((n) => {
        const done = this.wired.has(n.id);
        return `
          <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:15px;background:${done ? '#DCFCE7' : '#FFFFFF'};border:3px solid ${done ? '#22C55E' : n.color};font-weight:900;font-size:13px;color:#1E293B;">
            <span style="width:14px;height:14px;border-radius:50%;background:${n.color};display:inline-block;"></span>
            <span>${n.label}${done ? ' OK' : ''}</span>
          </div>
        `;
      }).join('');
      return;
    }

    if (this.mode === 'repair') {
      // Show all currently broken parts + 2 decoy spare parts
      const brokenParts = dev.assembleParts.filter((p) => this.brokenIds.has(p.id));
      const choices = [...brokenParts, ...this.repairDecoys].sort((a, b) => a.id.localeCompare(b.id));

      this.trayEl.innerHTML = choices.map((p) => `
        <div class="ab-part-card ${this.hintOn && this.brokenIds.has(p.id) ? 'is-next' : ''}" data-part-id="${p.id}" role="button">
          <svg width="46" height="46" viewBox="${p.thumbBox}">${renderAlexaPartSvg(p.kind, { dotColor: this.getDotColor() })}</svg>
          <div class="ab-part-label">${p.label}</div>
        </div>
      `).join('');

      this.trayEl.querySelectorAll('[data-part-id]').forEach((card) => {
        card.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const p = dev.assembleParts.find((x) => x.id === card.dataset.partId);
          if (p) this.startPartDrag(e, p, card);
        });
      });
      return;
    }

    // Assemble mode tray (10 parts)
    const next = dev.assembleParts.find((p) => !this.installed.has(p.id));
    const remaining = dev.assembleParts.filter((p) => !this.installed.has(p.id));
    this.trayEl.innerHTML = remaining.map((p) => {
      const unlocked = !p.req || this.installed.has(p.req);
      const isNext = this.hintOn && next && next.id === p.id;
      const lockedCls = (this.hintOn && !unlocked) ? 'is-locked' : '';
      return `
        <div class="ab-part-card ${isNext ? 'is-next' : ''} ${lockedCls}" data-part-id="${p.id}" role="button">
          <svg width="46" height="46" viewBox="${p.thumbBox}">${renderAlexaPartSvg(p.kind, { dotColor: this.getDotColor() })}</svg>
          <div class="ab-part-label">${p.label}</div>
        </div>
      `;
    }).join('');

    this.trayEl.querySelectorAll('[data-part-id]').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const p = dev.assembleParts.find((x) => x.id === card.dataset.partId);
        if (!p) return;
        if (p.req && !this.installed.has(p.req)) {
          this.sound.playGentleNudge();
          return;
        }
        this.startPartDrag(e, p, card);
      });
    });
  }

  startPartDrag(e, part, cardEl) {
    this.clearDrag();
    this.sound.playButtonDown('yellow');
    const ghost = document.createElement('div');
    ghost.className = 'ab-ghost';
    ghost.innerHTML = `<svg width="82" height="82" viewBox="${part.thumbBox}">${renderAlexaPartSvg(part.kind, { dotColor: this.getDotColor() })}</svg>`;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    cardEl.classList.add('is-dragging');
    this.dragPart = { id: part.id, ghost, cardEl };
    this.renderSvg();
  }

  onPointerMove(e) {
    if (this.dragPart) {
      e.preventDefault();
      this.dragPart.ghost.style.left = `${e.clientX}px`;
      this.dragPart.ghost.style.top = `${e.clientY}px`;
    } else if (this.wireDrag) {
      e.preventDefault();
      const pt = this.clientToSvg(e.clientX, e.clientY);
      this.wireDrag.x2 = pt.x;
      this.wireDrag.y2 = pt.y;
      const pathEl = this.svgEl.querySelector('#ab-live-wire');
      if (pathEl) {
        pathEl.setAttribute('d', buildAlexaPcbPath(this.wireDrag.x1, this.wireDrag.y1, pt.x, pt.y));
      }
    }
  }

  onPointerUp(e) {
    const dev = this.getDevice();
    if (this.dragPart) {
      const { id } = this.dragPart;
      this.clearDrag();
      const pt = this.clientToSvg(e.clientX, e.clientY);

      if (this.mode === 'assemble') {
        const part = dev.assembleParts.find((p) => p.id === id);
        if (part && Math.hypot(pt.x - part.x, pt.y - part.y) <= Math.max(70, part.r + 22)) {
          this.installed.add(part.id);
          this.sound.playMetalClick();
          if (this.installed.size === dev.assembleParts.length) {
            this.onComplete();
          } else {
            this.renderAll();
          }
        } else {
          this.sound.playGentleNudge();
          this.renderSvg();
        }
      } else if (this.mode === 'repair') {
        const target = dev.assembleParts.find((p) => p.id === id);
        if (this.brokenIds.has(id) && target && Math.hypot(pt.x - target.x, pt.y - target.y) <= Math.max(76, target.r + 24)) {
          this.brokenIds.delete(id);
          this.sound.playMetalClick();
          if (this.brokenIds.size === 0) {
            this.onComplete();
          } else {
            this.renderAll();
          }
        } else {
          this.sound.playGentleNudge();
          this.renderSvg();
        }
      }
    } else if (this.wireDrag) {
      const wd = this.wireDrag;
      this.wireDrag = null;
      const node = dev.wireNodes.find((n) => n.id === wd.nodeId);
      const pt = this.clientToSvg(e.clientX, e.clientY);
      const targetPt = wd.startEnd === 'from' ? node.to : node.from;
      const dist = Math.hypot(pt.x - targetPt[0], pt.y - targetPt[1]);
      if (dist <= 58) {
        this.wired.add(node.id);
        this.sound.playCountPip(this.wired.size + 4);
        if (this.wired.size === dev.wireNodes.length) {
          this.onComplete();
        } else {
          this.renderAll();
        }
      } else {
        this.sound.playGentleNudge();
        this.renderSvg();
      }
    }
  }

  clearDrag() {
    if (this.dragPart) {
      if (this.dragPart.ghost) this.dragPart.ghost.remove();
      if (this.dragPart.cardEl) this.dragPart.cardEl.classList.remove('is-dragging');
      this.dragPart = null;
    }
    this.wireDrag = null;
  }

  clientToSvg(clientX, clientY) {
    const r = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 560,
      y: ((clientY - r.top) / r.height) * 360
    };
  }

  onComplete() {
    this.completed = true;
    this.testMode = 'idle';
    this.sound.playSuccessFanfare();
    this.renderAll();
  }

  runAlexaTest(kind) {
    this.clearTimers();
    this.testMode = kind;
    this.renderSvg();

    if (kind === 'music') {
      this.sound.playSuccessFanfare();
      this.bannerEl.textContent = 'おんがく が なったよ！ スピーカー ばっちり！';
    } else if (kind === 'weather') {
      this.sound.playLampOn('and');
      this.bannerEl.textContent = 'きょうは はれ！ おてんき ばっちり！';
    } else if (kind === 'timer') {
      let n = 3;
      this.sound.playCountPip(6);
      this.bannerEl.textContent = 'ミニ タイマー：3…';
      this.timerInterval = setInterval(() => {
        n--;
        const tEl = this.svgEl.querySelector('#ab-timer-text');
        if (n > 0) {
          this.sound.playCountPip(6 - n);
          if (tEl) tEl.textContent = String(n);
          this.bannerEl.textContent = `ミニ タイマー：${n}…`;
        } else {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          if (tEl) tEl.textContent = 'OK!';
          this.sound.playCrackerPop();
          this.bannerEl.textContent = 'ピピピッ！ タイマー かんりょう！';
        }
      }, 750);
    }
  }

  showClearCelebration() {
    const dev = this.getDevice();
    const modes = ['assemble', 'wire', 'repair'];
    const nextIdx = (modes.indexOf(this.mode) + 1) % modes.length;
    showCelebrationOverlay(this.rootEl, {
      title: `${dev.name} かんせい！`,
      subtitle: 'ばっちり うごいたね！ さすが エンジニア！',
      centerHtml: this.deviceId === 'show8' ? FLAT_ICONS.echoShow(70) : FLAT_ICONS.echoDot(70, this.getDotColor().id),
      btnLabel: 'つぎの あそびへ',
      sound: this.sound,
      onNext: () => {
        this.mode = modes[nextIdx];
        this.resetStage();
      }
    });
  }
}
