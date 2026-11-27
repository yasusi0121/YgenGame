import {
  FONT_ROUND,
  buildRailDefsSvg,
  renderTrainSvg,
  renderFumikiriPostSvg,
  renderRoadCarSvg
} from './rail-control-assets.js';

const FUMIKIRI_TRAINS = [
  { type: 'commuter',   name: 'でんしゃ',     speed: 260 },
  { type: 'shinkansen', name: 'しんかんせん', speed: 370 },
  { type: 'freight',    name: 'かもつれっしゃ', speed: 215 }
];

const SWITCH_ORDERS = [
  { color: 'red',    label: '1ばん（あか）',   targetPath: 'top' },
  { color: 'blue',   label: '2ばん（あお）',   targetPath: 'mid' },
  { color: 'yellow', label: '3ばん（きいろ）', targetPath: 'bot' }
];

export default class RailControlGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'crossing';
    this.score = 0;

    this.gateCommandClosed = false;
    this.gateClosedRatio = 0;
    this.lampTimer = 0;
    this.lampPhase = 0;
    this.train = null;
    this.nextTrainTimer = 1.4;
    this.car = { x: 110, y: 382, color: '#4FA8D8', roof: '#A8DDF5' };
    this.trainCycleIdx = 0;

    this.pointA = 'top';
    this.pointB = 'mid';
    this.signalGreen = false;
    this.swOrderIdx = 0;
    this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    this.injectStyles();
    this.renderShell();
    this.resetModeState();
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
    const old = document.getElementById('rc-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'rc-styles';
    style.textContent = `
      .rc-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #8CCAE3; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 0 0;
        box-sizing: border-box; gap: 4px; overflow: hidden;
        transition: background 0.35s ease;
      }
      .rc-root.is-switch { background: #2A8567; }

      .rc-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 60px; padding-right: 60px; min-height: 44px;
        position: relative; z-index: 4;
      }
      .rc-modes {
        display: flex; gap: 4px; background: rgba(255,255,255,0.22); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.38);
      }
      .rc-mode-btn {
        border: none; border-radius: 999px; padding: 6px 15px; font-size: 14px; font-weight: 800;
        background: transparent; color: rgba(255,255,255,0.92); cursor: pointer; font-family: inherit;
      }
      .rc-mode-btn.active { background: #FFFFFF; color: #2D3436; box-shadow: 0 3px 0 rgba(0,0,0,0.12); }

      .rc-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.22); border: 2px solid rgba(255,255,255,0.38);
        border-radius: 999px; padding: 5px 14px;
      }
      .rc-hint { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .rc-score {
        background: #FFFFFF; color: #2A8567; font-size: 13px; font-weight: 900;
        padding: 2px 10px; border-radius: 999px;
      }

      .rc-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .rc-svg { width: 100%; height: 100%; max-width: 1020px; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .rc-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
        .rc-mode-btn { padding: 5px 10px; font-size: 12px; }
        .rc-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="rc-root" id="rc-root">
        <div class="rc-topbar">
          <div class="rc-modes">
            <button class="rc-mode-btn active" data-mode="crossing" type="button">ふみきり</button>
            <button class="rc-mode-btn" data-mode="switch" type="button">ポイント</button>
          </div>
          <div class="rc-pill">
            <span class="rc-hint" id="rc-hint">レバーで しゃだんきを おろそう</span>
            <span class="rc-score" id="rc-score">0かい</span>
          </div>
        </div>

        <div class="rc-stage-wrap">
          <svg class="rc-svg" id="rc-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildRailDefsSvg()}
            <g id="rc-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.rootEl = this.mountEl.querySelector('#rc-root');
    this.svgEl = this.mountEl.querySelector('#rc-svg');
    this.sceneEl = this.mountEl.querySelector('#rc-scene');
    this.hintEl = this.mountEl.querySelector('#rc-hint');
    this.scoreEl = this.mountEl.querySelector('#rc-score');

    this.mountEl.querySelectorAll('.rc-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.mountEl.querySelectorAll('.rc-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        this.resetModeState();
      });
    });

    this.svgEl.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      e.preventDefault();
      this.sound.unlock();
      const act = target.dataset.act;

      if (act === 'toggle-gate') {
        this.gateCommandClosed = !this.gateCommandClosed;
        this.sound.playBreakerClack();
        if (this.gateCommandClosed) {
          this.playFumikiriBell();
          this.hintEl.textContent = 'カンカンカン！ しゃだんきが おりるよ';
        } else {
          this.hintEl.textContent = 'しゃだんき オープン！';
        }
        this.renderScene();
      } else if (act === 'call-train') {
        if (!this.train) this.spawnCrossingTrain();
        else this.playTrainHorn();
      } else if (act === 'toggle-point-a') {
        if (this.swTrain.state === 'running') return;
        this.pointA = this.pointA === 'top' ? 'branch' : 'top';
        this.playPointThrow();
        this.renderScene();
      } else if (act === 'toggle-point-b') {
        if (this.swTrain.state === 'running') return;
        this.pointB = this.pointB === 'mid' ? 'bot' : 'mid';
        this.playPointThrow();
        this.renderScene();
      } else if (act === 'dispatch-train') {
        if (this.swTrain.state !== 'waiting') return;
        const chosen = this.pointA === 'top' ? 'top' : this.pointB;
        this.signalGreen = true;
        this.swTrain = { t: 0, state: 'running', chosenPath: chosen };
        this.playTrainHorn();
        this.hintEl.textContent = 'しゅっぱつ しんこう！';
        this.renderScene();
      }
    });
  }

  resetModeState() {
    const isSw = this.mode === 'switch';
    this.rootEl.classList.toggle('is-switch', isSw);
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground(isSw ? '#2A8567' : '#8CCAE3');
    }

    if (!isSw) {
      this.gateCommandClosed = false;
      this.gateClosedRatio = 0;
      this.train = null;
      this.nextTrainTimer = 1.4;
      this.car = { x: 110, y: 382, color: '#4FA8D8', roof: '#A8DDF5' };
      this.hintEl.textContent = 'レバーで しゃだんきを おろそう';
    } else {
      this.pointA = 'top';
      this.pointB = 'mid';
      this.signalGreen = false;
      this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
      const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
      this.hintEl.textContent = `${ord.label} へ ポイントを きりかえよう`;
    }
    this.renderScene();
  }

  spawnCrossingTrain() {
    const spec = FUMIKIRI_TRAINS[this.trainCycleIdx % FUMIKIRI_TRAINS.length];
    this.trainCycleIdx++;
    const dir = this.trainCycleIdx % 2 === 0 ? -1 : 1;
    this.train = { ...spec, dir, x: dir > 0 ? -240 : 1040, state: 'approach', clackAccum: 0 };
    this.playTrainHorn();
    this.hintEl.textContent = `${dir > 0 ? 'ひだり' : 'みぎ'}から ${spec.name} が くるよ！`;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
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
    if (this.mode === 'crossing') this.stepCrossing(dt);
    else this.stepSwitchyard(dt);
    this.renderScene();
  }

  stepCrossing(dt) {
    const target = this.gateCommandClosed ? 1 : 0;
    if (this.gateClosedRatio < target) this.gateClosedRatio = Math.min(1, this.gateClosedRatio + dt * 1.15);
    else if (this.gateClosedRatio > target) this.gateClosedRatio = Math.max(0, this.gateClosedRatio - dt * 1.45);

    const warningActive = this.gateCommandClosed || this.gateClosedRatio > 0.05;
    if (warningActive) {
      this.lampTimer += dt;
      if (this.lampTimer >= 0.44) {
        this.lampTimer = 0;
        this.lampPhase = 1 - this.lampPhase;
        this.playFumikiriBell();
      }
    } else {
      this.lampTimer = 0;
    }

    const stopX = 244;
    const roadBlocked = this.gateCommandClosed || this.gateClosedRatio > 0.15;
    if (!(roadBlocked && this.car.x >= stopX - 18 && this.car.x <= stopX + 8)) {
      this.car.x += dt * 115;
      if (this.car.x > 870) {
        const palette = [
          { color: '#4FA8D8', roof: '#A8DDF5' },
          { color: '#F05A5B', roof: '#FFA8A8' },
          { color: '#F7C948', roof: '#FFF0A8' },
          { color: '#45B87B', roof: '#A6E8C4' }
        ];
        const next = palette[Math.floor(Math.random() * palette.length)];
        this.car = { x: -70, y: 382, color: next.color, roof: next.roof };
      }
    }

    if (!this.train) {
      this.nextTrainTimer -= dt;
      if (this.nextTrainTimer <= 0) this.spawnCrossingTrain();
    } else {
      const tr = this.train;
      const stopBefore = tr.dir > 0 ? 110 : 690;
      const reachedStop = tr.dir > 0 ? (tr.x >= stopBefore) : (tr.x <= stopBefore);
      const passed = tr.dir > 0 ? (tr.x > 1060) : (tr.x < -260);

      if (tr.state === 'approach' && reachedStop && this.gateClosedRatio < 0.85) {
        tr.state = 'waiting-gate';
        this.hintEl.textContent = 'しゃだんきを おろしてね！';
        this.playTrainHorn();
      } else if (tr.state === 'waiting-gate') {
        if (this.gateClosedRatio >= 0.85) {
          tr.state = 'passing';
          this.hintEl.textContent = `${tr.name} つうかちゅう！`;
        }
      } else {
        if (tr.state === 'approach' && reachedStop && this.gateClosedRatio >= 0.85) {
          tr.state = 'passing';
          this.hintEl.textContent = `${tr.name} つうかちゅう！`;
        }
        tr.x += tr.dir * tr.speed * dt;
        tr.clackAccum += tr.speed * dt;
        if (tr.clackAccum >= 115 && tr.x > -100 && tr.x < 900) {
          tr.clackAccum = 0;
          this.playRailClack();
        }
        if (passed) {
          this.train = null;
          this.score++;
          this.scoreEl.textContent = `${this.score}かい`;
          this.nextTrainTimer = 3.2;
          this.sound.playSuccessFanfare();
          this.hintEl.textContent = 'あんぜん つうか！ しゃだんきを あげよう';
        }
      }
    }
  }

  stepSwitchyard(dt) {
    if (this.swTrain.state !== 'running') return;
    this.swTrain.t += dt * 0.42;
    if (Math.floor(this.swTrain.t * 8) !== Math.floor((this.swTrain.t - dt * 0.42) * 8)) this.playRailClack();
    if (this.swTrain.t >= 1) {
      this.swTrain.t = 1;
      const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
      if (this.swTrain.chosenPath === ord.targetPath) {
        this.score++;
        this.scoreEl.textContent = `${this.score}かい`;
        this.sound.playCrackerPop();
        this.hintEl.textContent = `${ord.label} に とうちゃく！`;
        this.swOrderIdx++;
      } else {
        this.sound.playBoing();
        this.hintEl.textContent = `もういちど ${ord.label} へ ゆうどうしよう`;
      }
      this.swTrain.state = 'arrived';
      this.signalGreen = false;
      setTimeout(() => {
        if (this.destroyed || this.mode !== 'switch') return;
        this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
        const nextOrd = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
        this.hintEl.textContent = `${nextOrd.label} へ ポイントを きりかえよう`;
        this.renderScene();
      }, 1350);
    }
  }

  renderScene() {
    if (this.mode === 'crossing') this.renderCrossingScene();
    else this.renderSwitchyardScene();
  }

  renderCrossingScene() {
    const warningOn = this.gateCommandClosed || this.gateClosedRatio > 0.05;
    const arrowDir = this.train ? this.train.dir : 0;
    const leverDeg = this.gateCommandClosed ? 28 : -28;

    const sleepers = Array.from({ length: 28 }, (_, i) => `
      <rect x="${12 + i * 28}" y="264" width="11" height="36" rx="4" fill="#B5835A" opacity="0.72"/>
    `).join('');

    this.sceneEl.innerHTML = `
      <!-- Clean Editorial Minimalist Sky & Rolling Hills (no messy details, zero black lines) -->
      <rect x="0" y="0" width="800" height="260" fill="url(#rc-sky)"/>
      <circle cx="156" cy="76" r="24" fill="rgba(255,255,255,0.75)"/>
      <circle cx="182" cy="70" r="30" fill="rgba(255,255,255,0.75)"/>
      <circle cx="212" cy="78" r="20" fill="rgba(255,255,255,0.75)"/>
      <circle cx="634" cy="84" r="20" fill="rgba(255,255,255,0.65)"/>
      <circle cx="658" cy="78" r="26" fill="rgba(255,255,255,0.65)"/>

      <!-- Calm Layered Sage Hills -->
      <path d="M 0 232 Q 210 170 430 222 T 800 212 V 265 H 0 Z" fill="#77C492"/>
      <path d="M 0 248 Q 260 218 520 245 T 800 238 V 268 H 0 Z" fill="#5EB37C"/>

      <!-- Meadow & Clean Gravel Track Bed -->
      <rect x="0" y="256" width="800" height="244" fill="#68B884"/>
      <rect x="0" y="260" width="800" height="46" fill="#DCE4EC"/>
      ${sleepers}

      <!-- Smooth Crossing Asphalt Road -->
      <rect x="284" y="256" width="232" height="96" fill="#6B7788"/>
      <rect x="0" y="344" width="800" height="86" fill="#535E6E"/>
      <line x1="0" y1="387" x2="800" y2="387" stroke="rgba(255,255,255,0.65)" stroke-width="4" stroke-dasharray="26 20" stroke-linecap="round"/>
      <rect x="276" y="348" width="8" height="78" rx="4" fill="#FFFFFF"/>

      <!-- Clean Satin Steel Rails -->
      <rect x="0" y="268" width="800" height="5.5" fill="#9AA7B8"/>
      <rect x="0" y="290" width="800" height="6.5" fill="#7D8B9E"/>

      <!-- Rear Fumikiri Post -->
      ${renderFumikiriPostSvg(526, 272, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'right' })}

      <!-- Sculpted Matte Japanese Train -->
      ${this.train ? renderTrainSvg(this.train.type, this.train.x, 292, this.train.dir, 1.0) : ''}

      <!-- Foreground Fumikiri Post -->
      ${renderFumikiriPostSvg(274, 348, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'left' })}

      <!-- Matte Toy Car -->
      ${renderRoadCarSvg(this.car.x, this.car.y, this.car.color, this.car.roof)}

      <!-- Sleek Lingokids-style Matte Crossing Lever Box -->
      <g data-act="toggle-gate" style="cursor:pointer;" transform="translate(566 448)">
        <rect x="-78" y="-12" width="156" height="54" rx="22" fill="rgba(0,0,0,0.14)"/>
        <rect x="-78" y="-18" width="156" height="54" rx="22" fill="#FFFFFF"/>
        <g transform="translate(-32 -18) rotate(${leverDeg})">
          <rect x="-5" y="-42" width="10" height="42" rx="5" fill="#CBD5E1"/>
          <circle cx="0" cy="-44" r="15" fill="${this.gateCommandClosed ? '#F05A5B' : '#34D399'}"/>
          <circle cx="-4.5" cy="-49" r="4" fill="rgba(255,255,255,0.55)"/>
        </g>
        <circle cx="46" cy="9" r="11" fill="${this.gateCommandClosed ? '#F05A5B' : '#34D399'}"/>
        <text x="-4" y="15" text-anchor="middle" font-size="16" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${this.gateCommandClosed ? 'あげる' : 'おろす'}</text>
      </g>

      <!-- Minimal Round Whistle Button -->
      <g data-act="call-train" style="cursor:pointer;" transform="translate(706 456)">
        <circle cx="0" cy="5" r="28" fill="#2F80B0"/>
        <circle cx="0" cy="0" r="28" fill="#4FA8D8"/>
        <polygon points="-8,-10 12,0 -8,10" fill="#FFFFFF"/>
      </g>
    `;
  }

  renderSwitchyardScene() {
    const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
    const pA = this.pointA;
    const pB = this.pointB;

    const t = this.swTrain.t;
    const path = this.swTrain.state === 'waiting' ? (pA === 'top' ? 'top' : pB) : this.swTrain.chosenPath;
    let tx = 104 + t * 556;
    let ty = 158;
    if (path === 'mid') {
      if (t < 0.25) ty = 158;
      else if (t < 0.55) ty = 158 + ((t - 0.25) / 0.30) * 116;
      else ty = 274;
    } else if (path === 'bot') {
      if (t < 0.25) ty = 158;
      else if (t < 0.55) ty = 158 + ((t - 0.25) / 0.30) * 116;
      else if (t < 0.78) ty = 274 + ((t - 0.55) / 0.23) * 116;
      else ty = 390;
    }

    const renderPointLever = (act, x, y, label, isStraight, color) => {
      const tilt = isStraight ? -26 : 26;
      return `
        <g data-act="${act}" style="cursor:pointer;" transform="translate(${x} ${y})">
          <circle cx="0" cy="6" r="30" fill="rgba(0,0,0,0.16)"/>
          <circle cx="0" cy="0" r="30" fill="#FFFFFF"/>
          <g transform="translate(0 -4) rotate(${tilt})">
            <rect x="-4.5" y="-30" width="9" height="30" rx="4.5" fill="#CBD5E1"/>
            <circle cx="0" cy="-32" r="11" fill="${color}"/>
          </g>
          <text x="0" y="13" text-anchor="middle" font-size="14" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${label}</text>
        </g>
      `;
    };

    this.sceneEl.innerHTML = `
      <!-- LogicLike-style soft background geometric accents -->
      <circle cx="100" cy="420" r="140" fill="rgba(255,255,255,0.05)"/>
      <circle cx="710" cy="70" r="120" fill="rgba(255,255,255,0.05)"/>

      <!-- Clean Rounded Color-Coded Station Platforms (zero black borders!) -->
      ${[
        { y: 84,  bg: '#F05A5B', lip: '#C43B3C', text: '#FFFFFF', label: '1ばん あか' },
        { y: 200, bg: '#4FA8D8', lip: '#2F80B0', text: '#FFFFFF', label: '2ばん あお' },
        { y: 316, bg: '#F7C948', lip: '#D19D1E', text: '#3D405B', label: '3ばん きいろ' }
      ].map((p) => `
        <rect x="588" y="${p.y + 6}" width="174" height="40" rx="16" fill="${p.lip}"/>
        <rect x="588" y="${p.y}" width="174" height="40" rx="16" fill="${p.bg}"/>
        <text x="675" y="${p.y + 26}" text-anchor="middle" font-size="16" font-weight="900" fill="${p.text}" font-family="${FONT_ROUND}">${p.label}</text>
      `).join('')}

      <!-- LogicBook-style Translucent Base Tracks -->
      <path d="M 20 158 H 768" stroke="rgba(255,255,255,0.28)" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M 248 158 C 320 158 342 274 416 274 H 768" stroke="rgba(255,255,255,0.28)" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M 416 274 C 482 274 494 390 564 390 H 768" stroke="rgba(255,255,255,0.28)" stroke-width="14" fill="none" stroke-linecap="round"/>

      <!-- Luminous Active Route Rail -->
      ${pA === 'top' ? `
        <path d="M 20 158 H 768" stroke="#FFF3A1" stroke-width="9" fill="none" stroke-linecap="round"/>
      ` : (pB === 'mid' ? `
        <path d="M 20 158 H 248 C 320 158 342 274 416 274 H 768" stroke="#FFF3A1" stroke-width="9" fill="none" stroke-linecap="round"/>
      ` : `
        <path d="M 20 158 H 248 C 320 158 342 274 416 274 C 482 274 494 390 564 390 H 768" stroke="#FFF3A1" stroke-width="9" fill="none" stroke-linecap="round"/>
      `)}

      <!-- Direct Matte Point Levers right at Rail Forks A & B -->
      ${renderPointLever('toggle-point-a', 248, 96,  'A', pA === 'top', '#F05A5B')}
      ${renderPointLever('toggle-point-b', 416, 210, 'B', pB === 'mid', '#4FA8D8')}

      <!-- Sculpted Matte Signal Tower (Tap to Launch!) -->
      <g data-act="dispatch-train" style="cursor:pointer;" transform="translate(172 38)">
        <rect x="13" y="56" width="8" height="48" rx="4" fill="rgba(255,255,255,0.7)"/>
        <rect x="0" y="4" width="34" height="66" rx="17" fill="rgba(0,0,0,0.16)"/>
        <rect x="0" y="0" width="34" height="66" rx="17" fill="#3B4252"/>
        <circle cx="17" cy="18" r="8.5" fill="${this.signalGreen ? '#5C2B2B' : '#FF5E5E'}"/>
        <circle cx="17" cy="48" r="8.5" fill="${this.signalGreen ? '#4ADE80' : '#1F4B38'}"/>
        ${this.swTrain.state === 'waiting' ? `<circle cx="17" cy="48" r="14" fill="none" stroke="#6EE7B7" stroke-width="3" stroke-dasharray="6 5"/>` : ''}
      </g>

      <!-- Clean Frosted Destination Plaque -->
      <g transform="translate(46 376)">
        <rect x="0" y="6" width="256" height="72" rx="24" fill="rgba(0,0,0,0.14)"/>
        <rect x="0" y="0" width="256" height="72" rx="24" fill="#FFFFFF"/>
        <text x="128" y="27" text-anchor="middle" font-size="13" font-weight="800" fill="#8C9BB0" font-family="${FONT_ROUND}">ゆきさき</text>
        <text x="128" y="56" text-anchor="middle" font-size="21" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${ord.label}</text>
      </g>

      <!-- Color-Matched Train -->
      <g data-act="dispatch-train" style="cursor:pointer;">
        ${renderTrainSvg(ord.color, tx, ty + 4, 1, 0.58)}
      </g>
    `;
  }

  /* Web Audio Railway Effects */
  playFumikiriBell() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [740, 785].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.36);
    });
  }

  playRailClack() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    [0, 0.085].forEach((offset, idx) => {
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 150 : 125, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.075);
    });
  }

  playPointThrow() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.11);
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.13);
  }

  playTrainHorn() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392, 493.88].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1100;
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.11, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(lp); lp.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.38);
    });
  }
}
