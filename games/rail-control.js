import {
  buildRailDefsSvg,
  renderTrainSvg,
  renderFumikiriPostSvg,
  renderRoadCarSvg
} from './rail-control-assets.js';

const FUMIKIRI_TRAINS = [
  { type: 'commuter',   name: 'つうきん でんしゃ', speed: 260 },
  { type: 'shinkansen', name: 'しんかんせん',       speed: 370 },
  { type: 'freight',    name: 'かもつ れっしゃ',   speed: 215 }
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

    this.mode = 'crossing'; // 'crossing' | 'switch'
    this.score = 0;

    // Crossing mode
    this.gateCommandClosed = false;
    this.gateClosedRatio = 0;
    this.lampTimer = 0;
    this.lampPhase = 0;
    this.train = null;
    this.nextTrainTimer = 1.4;
    this.car = { x: 110, y: 382, color: '#3B82F6', roof: '#93C5FD' };
    this.trainCycleIdx = 0;

    // Switchyard mode
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
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#E0F2FE');
    }
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
        background: #E0F2FE; color: #1E293B; user-select: none; -webkit-user-select: none;
        padding: 8px 10px 10px; box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .rc-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 42px;
      }
      .rc-modes {
        display: flex; gap: 5px; background: #FFFFFF; padding: 4px;
        border-radius: 16px; border: 3px solid #1E293B; box-shadow: 0 3px 0 #1E293B;
      }
      .rc-mode-btn {
        border: none; border-radius: 11px; padding: 6px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #475569; cursor: pointer; font-family: inherit;
      }
      .rc-mode-btn.active { background: #FACC15; color: #1E293B; box-shadow: inset 0 -3px 0 #CA8A04; }

      .rc-status {
        display: flex; align-items: center; gap: 10px; background: #FFFFFF;
        border: 3px solid #1E293B; border-radius: 16px; padding: 4px 12px;
        box-shadow: 0 3px 0 #1E293B;
      }
      .rc-hint { font-size: 14px; font-weight: 900; color: #1E293B; }
      .rc-score {
        background: #22C55E; color: #FFFFFF; font-size: 13px; font-weight: 900;
        padding: 2px 10px; border-radius: 99px; border: 2px solid #1E293B;
      }

      .rc-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        border-radius: 22px; border: 4px solid #1E293B; box-shadow: 0 6px 0 rgba(30,41,59,0.2);
        overflow: hidden; background: #BAE6FD;
      }
      .rc-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .rc-root { padding: 6px; gap: 5px; }
        .rc-topbar { padding-left: 44px; padding-right: 44px; }
        .rc-mode-btn { padding: 5px 10px; font-size: 12px; }
        .rc-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="rc-root">
        <div class="rc-topbar">
          <div class="rc-modes">
            <button class="rc-mode-btn active" data-mode="crossing" type="button">ふみきり そうさ</button>
            <button class="rc-mode-btn" data-mode="switch" type="button">ポイント きりかえ</button>
          </div>
          <div class="rc-status">
            <span class="rc-hint" id="rc-hint">あかいレバー か しゃだんきを タップ！</span>
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

    // 100% Direct Diegetic SVG Clicks (Levers, Crossing Posts, Track Forks, Signal Tower!)
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
          this.hintEl.textContent = 'カンカンカン！ しゃだんきが おりているよ！';
        } else {
          this.hintEl.textContent = 'しゃだんき オープン！ くるまが とおれるよ！';
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
        this.hintEl.textContent = 'しんごう あお！ しゅっぱつ しんこう！';
        this.renderScene();
      }
    });
  }

  resetModeState() {
    if (this.mode === 'crossing') {
      this.gateCommandClosed = false;
      this.gateClosedRatio = 0;
      this.train = null;
      this.nextTrainTimer = 1.4;
      this.car = { x: 110, y: 382, color: '#3B82F6', roof: '#93C5FD' };
      this.hintEl.textContent = 'あかいレバー か しゃだんきを タップして おろそう！';
    } else {
      this.pointA = 'top';
      this.pointB = 'mid';
      this.signalGreen = false;
      this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
      const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
      this.hintEl.textContent = `せんろの レバーを きりかえて ${ord.label} へ！ しんごうを タップで しゅっぱつ！`;
    }
    this.renderScene();
  }

  spawnCrossingTrain() {
    const spec = FUMIKIRI_TRAINS[this.trainCycleIdx % FUMIKIRI_TRAINS.length];
    this.trainCycleIdx++;
    const dir = this.trainCycleIdx % 2 === 0 ? -1 : 1;
    this.train = { ...spec, dir, x: dir > 0 ? -240 : 1040, state: 'approach', clackAccum: 0 };
    this.playTrainHorn();
    this.hintEl.textContent = `${dir > 0 ? 'ひだり' : 'みぎ'}から ${spec.name}！ レバーを ひいて しゃだんきを おろそう！`;
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
          { color: '#3B82F6', roof: '#93C5FD' },
          { color: '#EF4444', roof: '#FCA5A5' },
          { color: '#F59E0B', roof: '#FDE68A' },
          { color: '#10B981', roof: '#A7F3D0' }
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
        this.hintEl.textContent = 'あぶない！ あかいレバーを タップして しゃだんきを おろそう！';
        this.playTrainHorn();
      } else if (tr.state === 'waiting-gate') {
        if (this.gateClosedRatio >= 0.85) {
          tr.state = 'passing';
          this.hintEl.textContent = `${tr.name} つうかちゅう！ ガタン・ゴトン！`;
        }
      } else {
        if (tr.state === 'approach' && reachedStop && this.gateClosedRatio >= 0.85) {
          tr.state = 'passing';
          this.hintEl.textContent = `${tr.name} つうかちゅう！ ガタン・ゴトン！`;
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
          this.hintEl.textContent = 'あんぜん つうか！ レバーを もどして くるまを とおそう！';
        }
      }
    }
  }

  stepSwitchyard(dt) {
    if (this.swTrain.state !== 'running') return;
    this.swTrain.t += dt * 0.42;
    if (Math.floor(this.swTrain.t * 8) !== Math.floor((this.swTrain.t - dt * 0.42) * 8)) {
      this.playRailClack();
    }
    if (this.swTrain.t >= 1) {
      this.swTrain.t = 1;
      const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
      if (this.swTrain.chosenPath === ord.targetPath) {
        this.score++;
        this.scoreEl.textContent = `${this.score}かい`;
        this.sound.playCrackerPop();
        this.hintEl.textContent = `だいせいこう！ ${ord.label} に とうちゃく！`;
        this.swOrderIdx++;
      } else {
        this.sound.playBoing();
        this.hintEl.textContent = `ちがう ホームだったよ！ もういちど ${ord.label} へ ゆうどうしよう！`;
      }
      this.swTrain.state = 'arrived';
      this.signalGreen = false;
      setTimeout(() => {
        if (this.destroyed || this.mode !== 'switch') return;
        this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
        const nextOrd = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
        this.hintEl.textContent = `レバーを きりかえて ${nextOrd.label} へ！ しんごうを タップで しゅっぱつ！`;
        this.renderScene();
      }, 1350);
    }
  }

  renderScene() {
    if (this.mode === 'crossing') this.renderCrossingScene();
    else this.renderSwitchyardScene();
  }

  renderCrossingScene() {
    const ink = '#1E293B';
    const warningOn = this.gateCommandClosed || this.gateClosedRatio > 0.05;
    const arrowDir = this.train ? this.train.dir : 0;
    const leverDeg = this.gateCommandClosed ? 32 : -32;

    const sleepers = Array.from({ length: 28 }, (_, i) => `
      <rect x="${12 + i * 28}" y="264" width="12" height="36" rx="2" fill="#92400E" stroke="${ink}" stroke-width="1.5"/>
    `).join('');

    this.sceneEl.innerHTML = `
      <!-- Sunlit Sky + Fluffy Clouds + Mt. Fuji & Lush Green Hills -->
      <rect x="0" y="0" width="800" height="500" fill="url(#rc-sky)"/>
      <g fill="#FFFFFF" opacity="0.9">
        <circle cx="150" cy="68" r="24"/><circle cx="178" cy="60" r="30"/><circle cx="210" cy="70" r="22"/>
        <circle cx="620" cy="76" r="22"/><circle cx="648" cy="68" r="28"/><circle cx="678" cy="78" r="20"/>
      </g>
      <!-- Distant Mt. Fuji silhouette -->
      <polygon points="310,210 410,92 510,210" fill="#60A5FA" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="382,126 410,92 438,126 422,120 410,130 398,120" fill="#FFFFFF"/>
      <!-- Rolling Green Hills & Cute 2.5D Houses -->
      <path d="M 0 218 Q 180 154 380 206 T 800 198 V 270 H 0 Z" fill="url(#rc-grass)" stroke="${ink}" stroke-width="3"/>
      <g transform="translate(88 188)">
        <rect x="-28" y="-26" width="56" height="36" rx="4" fill="#FEF3C7" stroke="${ink}" stroke-width="2.5"/>
        <polygon points="-34,-24 0,-48 34,-24" fill="#EF4444" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="-10" y="-14" width="20" height="14" rx="2" fill="#38BDF8" stroke="${ink}" stroke-width="2"/>
      </g>
      <g transform="translate(706 184)">
        <rect x="-26" y="-24" width="52" height="34" rx="4" fill="#FFFFFF" stroke="${ink}" stroke-width="2.5"/>
        <polygon points="-32,-22 0,-44 32,-22" fill="#2563EB" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="-8" y="-12" width="16" height="14" rx="2" fill="#FDE047" stroke="${ink}" stroke-width="2"/>
      </g>

      <!-- Overhead Catenary Wire & Poles -->
      <line x1="0" y1="168" x2="800" y2="168" stroke="#475569" stroke-width="2.2"/>
      <line x1="0" y1="180" x2="800" y2="180" stroke="${ink}" stroke-width="2.6"/>
      <rect x="122" y="122" width="10" height="148" fill="#64748B" stroke="${ink}" stroke-width="2"/>
      <rect x="668" y="122" width="10" height="148" fill="#64748B" stroke="${ink}" stroke-width="2"/>

      <!-- Gravel Rail Bed & Lush Lawn Foreground -->
      <rect x="0" y="252" width="800" height="248" fill="#86EFAC"/>
      <rect x="0" y="258" width="800" height="48" fill="#CBD5E1" stroke="${ink}" stroke-width="2.5"/>
      ${sleepers}

      <!-- Crossing Road & Foreground Horizontal Street -->
      <rect x="284" y="252" width="232" height="106" fill="#64748B"/>
      <rect x="0" y="342" width="800" height="90" fill="#475569" stroke="${ink}" stroke-width="3"/>
      <line x1="0" y1="387" x2="800" y2="387" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="28 18" opacity="0.8"/>
      <rect x="276" y="346" width="9" height="82" fill="#FFFFFF"/>

      <!-- Steel Rails -->
      <rect x="0" y="266" width="800" height="6" fill="url(#rc-steel-rail)" stroke="${ink}" stroke-width="1.5"/>
      <rect x="0" y="288" width="800" height="7" fill="url(#rc-steel-rail)" stroke="${ink}" stroke-width="1.5"/>

      <!-- Rear Fumikiri Post -->
      ${renderFumikiriPostSvg(526, 272, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'right' })}

      <!-- Live Moving 2.5D Train -->
      ${this.train ? renderTrainSvg(this.train.type, this.train.x, 290, this.train.dir, 1.0) : ''}

      <!-- Foreground Fumikiri Post -->
      ${renderFumikiriPostSvg(274, 348, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'left' })}

      <!-- Road Car -->
      ${renderRoadCarSvg(this.car.x, this.car.y, this.car.color, this.car.roof)}

      <!-- DIRECT DIEGETIC 2.5D TRACKSIDE CROSSING LEVER BOX (Foreground Right-Center!) -->
      <g data-act="toggle-gate" style="cursor:pointer;" transform="translate(566 444)">
        <!-- Cast shadow -->
        <ellipse cx="0" cy="40" rx="92" ry="12" fill="rgba(15,23,42,0.22)"/>
        <!-- 2.5D Steel Control Box -->
        <polygon points="-76,-12 -64,-24 76,-24 64,-12" fill="#FDE047" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="64,-12 76,-24 76,28 64,40" fill="#CA8A04" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="-76" y="-12" width="140" height="52" rx="12" fill="#FACC15" stroke="${ink}" stroke-width="3.5"/>
        <!-- Physical Chunky Red-Ball Lever pivoting left/right! -->
        <g transform="translate(-26 -14) rotate(${leverDeg})">
          <rect x="-5" y="-44" width="10" height="44" rx="4" fill="#CBD5E1" stroke="${ink}" stroke-width="3"/>
          <circle cx="0" cy="-46" r="15" fill="${this.gateCommandClosed ? '#EF4444' : '#22C55E'}" stroke="${ink}" stroke-width="3.5"/>
          <circle cx="-5" cy="-51" r="4.5" fill="rgba(255,255,255,0.65)"/>
        </g>
        <!-- Status lamp & clear short label right on the box -->
        <circle cx="38" cy="14" r="13" fill="${this.gateCommandClosed ? '#EF4444' : '#22C55E'}" stroke="${ink}" stroke-width="3"/>
        <text x="-18" y="21" text-anchor="middle" font-size="16" font-weight="900" fill="${ink}" font-family="sans-serif">${this.gateCommandClosed ? 'あげる' : 'おろす！'}</text>
      </g>

      <!-- DIRECT DIEGETIC 2.5D TRAIN WHISTLE BUTTON right beside lever box -->
      <g data-act="call-train" style="cursor:pointer;" transform="translate(716 456)">
        <ellipse cx="0" cy="24" rx="48" ry="9" fill="rgba(15,23,42,0.22)"/>
        <rect x="-46" y="-14" width="92" height="40" rx="14" fill="#1D4ED8" stroke="${ink}" stroke-width="3.5"/>
        <rect x="-46" y="-20" width="92" height="40" rx="14" fill="#3B82F6" stroke="${ink}" stroke-width="3.5"/>
        <text x="0" y="6" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF" font-family="sans-serif">でんしゃ よぶ</text>
      </g>
    `;
  }

  renderSwitchyardScene() {
    const ink = '#1E293B';
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

    const renderTracksidePointLever = (act, x, y, label, isStraight, color) => {
      const tilt = isStraight ? -28 : 28;
      return `
        <g data-act="${act}" style="cursor:pointer;" transform="translate(${x} ${y})">
          <circle cx="0" cy="0" r="34" fill="rgba(250,204,21,0.22)" stroke="#FACC15" stroke-width="3" stroke-dasharray="8 6"/>
          <!-- 2.5D Mechanical Point Box -->
          <rect x="-24" y="-8" width="48" height="24" rx="7" fill="#334155" stroke="${ink}" stroke-width="3"/>
          <g transform="translate(0 -6) rotate(${tilt})">
            <rect x="-4" y="-32" width="8" height="32" rx="3" fill="#E2E8F0" stroke="${ink}" stroke-width="2.5"/>
            <circle cx="0" cy="-34" r="11" fill="${color}" stroke="${ink}" stroke-width="3"/>
          </g>
          <text x="0" y="9" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${label}</text>
        </g>
      `;
    };

    this.sceneEl.innerHTML = `
      <!-- Sunlit 2.5D Lush Green Rail Yard (warm & bright!) -->
      <rect x="0" y="0" width="800" height="500" fill="#86EFAC"/>
      <!-- Gravel Ballast Strips under all 3 tracks -->
      <path d="M 16 158 H 780" stroke="#CBD5E1" stroke-width="34" stroke-linecap="round"/>
      <path d="M 248 158 C 320 158 342 274 416 274 H 780" stroke="#CBD5E1" stroke-width="34" fill="none" stroke-linecap="round"/>
      <path d="M 416 274 C 482 274 494 390 564 390 H 780" stroke="#CBD5E1" stroke-width="34" fill="none" stroke-linecap="round"/>

      <!-- 2.5D Elevated Color-Coded Station Platforms (with top roof bevels!) -->
      ${[
        { y: 84,  bg: '#EF4444', top: '#FCA5A5', text: '#FFFFFF', label: '1ばん（あか）' },
        { y: 200, bg: '#2563EB', top: '#93C5FD', text: '#FFFFFF', label: '2ばん（あお）' },
        { y: 316, bg: '#FACC15', top: '#FEF08A', text: ink,       label: '3ばん（きいろ）' }
      ].map((p) => `
        <polygon points="586,${p.y} 602,${p.y - 12} 782,${p.y - 12} 766,${p.y}" fill="${p.top}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="586" y="${p.y}" width="180" height="40" rx="8" fill="${p.bg}" stroke="${ink}" stroke-width="3.5"/>
        <text x="676" y="${p.y + 26}" text-anchor="middle" font-size="16" font-weight="900" fill="${p.text}" font-family="sans-serif">${p.label}</text>
      `).join('')}

      <!-- Base Steel Tracks -->
      <path d="M 20 158 H 768" stroke="#475569" stroke-width="15" stroke-linecap="round"/>
      <path d="M 248 158 C 320 158 342 274 416 274 H 768" stroke="#475569" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M 416 274 C 482 274 494 390 564 390 H 768" stroke="#475569" stroke-width="15" fill="none" stroke-linecap="round"/>

      <!-- Active Illuminated Route Rails (clearly shows where train will go!) -->
      ${pA === 'top' ? `
        <path d="M 20 158 H 768" stroke="#FACC15" stroke-width="7" fill="none" stroke-linecap="round"/>
      ` : (pB === 'mid' ? `
        <path d="M 20 158 H 248 C 320 158 342 274 416 274 H 768" stroke="#FACC15" stroke-width="7" fill="none" stroke-linecap="round"/>
      ` : `
        <path d="M 20 158 H 248 C 320 158 342 274 416 274 C 482 274 494 390 564 390 H 768" stroke="#FACC15" stroke-width="7" fill="none" stroke-linecap="round"/>
      `)}

      <!-- DIRECT DIEGETIC 2.5D POINT LEVERS RIGHT ON THE RAIL FORKS! -->
      ${renderTracksidePointLever('toggle-point-a', 248, 100, 'A', pA === 'top', '#EF4444')}
      ${renderTracksidePointLever('toggle-point-b', 416, 214, 'B', pB === 'mid', '#38BDF8')}

      <!-- DIRECT DIEGETIC 2.5D SIGNAL TOWER (Tap Signal or Train to GO!) -->
      <g data-act="dispatch-train" style="cursor:pointer;" transform="translate(174 36)">
        ${this.swTrain.state === 'waiting' ? `
          <rect x="-36" y="-26" width="104" height="24" rx="12" fill="#22C55E" stroke="${ink}" stroke-width="2.5"/>
          <text x="16" y="-9" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">しゅっぱつ！</text>
        ` : ''}
        <rect x="12" y="54" width="10" height="50" fill="#94A3B8" stroke="${ink}" stroke-width="2.5"/>
        <rect x="0" y="0" width="34" height="66" rx="14" fill="#1E293B" stroke="${ink}" stroke-width="3.5"/>
        <circle cx="17" cy="17" r="8" fill="${this.signalGreen ? '#450A0A' : '#EF4444'}" stroke="${ink}" stroke-width="2"/>
        <circle cx="17" cy="48" r="8" fill="${this.signalGreen ? '#4ADE80' : '#052E16'}" stroke="${ink}" stroke-width="2"/>
      </g>

      <!-- Destination Signboard on Grass -->
      <g transform="translate(40 370)">
        <rect x="0" y="6" width="276" height="82" rx="18" fill="#1E293B"/>
        <rect x="0" y="0" width="276" height="82" rx="18" fill="#FFFFFF" stroke="${ink}" stroke-width="4"/>
        <text x="138" y="30" text-anchor="middle" font-size="14" font-weight="900" fill="#64748B" font-family="sans-serif">この でんしゃの ゆきさき</text>
        <text x="138" y="62" text-anchor="middle" font-size="22" font-weight="900" fill="${ink}" font-family="sans-serif">${ord.label}</text>
      </g>

      <!-- Color-Matched Train (also directly tappable to launch!) -->
      <g data-act="dispatch-train" style="cursor:pointer;">
        ${renderTrainSvg(ord.color, tx, ty + 4, 1, 0.58)}
      </g>
    `;
  }

  /* =========================================================================
     Authentic Japanese Railway Web Audio Effects
     ========================================================================= */

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
