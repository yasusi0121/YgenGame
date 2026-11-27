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
  { color: 'red',    label: '1ばんせん（あか）',   targetPath: 'top' },
  { color: 'blue',   label: '2ばんせん（あお）',   targetPath: 'mid' },
  { color: 'yellow', label: '3ばんせん（きいろ）', targetPath: 'bot' }
];

export default class RailControlGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'crossing'; // 'crossing' | 'switch'
    this.score = 0;

    // Crossing mode state
    this.gateCommandClosed = false;
    this.gateClosedRatio = 0; // 0 (open) -> 1 (closed)
    this.lampTimer = 0;
    this.lampPhase = 0;
    this.train = null; // { type, name, dir, x, speed, state: 'approach'|'waiting-gate'|'passing', clackAccum }
    this.nextTrainTimer = 1.6;
    this.car = { x: 110, y: 394, color: '#3B82F6', roof: '#93C5FD', crossed: false };
    this.trainCycleIdx = 0;

    // Switchyard mode state
    this.pointA = 'top'; // 'top' (to platform 1) | 'branch' (to point B)
    this.pointB = 'mid'; // 'mid' (to platform 2) | 'bot' (to platform 3)
    this.signalGreen = false;
    this.swOrderIdx = 0;
    this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' }; // 'waiting' | 'running' | 'arrived'

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#0F172A');
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
    if (document.getElementById('rc-styles')) return;
    const style = document.createElement('style');
    style.id = 'rc-styles';
    style.textContent = `
      .rc-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #0F172A; color: #F8FAFC; user-select: none; -webkit-user-select: none;
        padding: 8px 12px 10px; box-sizing: border-box; gap: 8px; overflow: hidden;
      }
      .rc-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 44px;
      }
      .rc-modes {
        display: flex; gap: 6px; background: rgba(30,41,59,0.9);
        padding: 4px; border-radius: 16px; border: 2px solid #475569;
      }
      .rc-mode-btn {
        border: none; border-radius: 12px; padding: 7px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #CBD5E1; cursor: pointer; font-family: inherit;
      }
      .rc-mode-btn.active { background: #FACC15; color: #0F172A; box-shadow: 0 3px 0 #A16207; }

      .rc-status {
        display: flex; align-items: center; gap: 10px; background: #1E293B;
        border: 2px solid #475569; border-radius: 16px; padding: 5px 12px;
      }
      .rc-hint { font-size: 14px; font-weight: 800; color: #FEF08A; }
      .rc-score {
        background: #16A34A; color: #FFFFFF; font-size: 13px; font-weight: 900;
        padding: 3px 10px; border-radius: 99px;
      }

      .rc-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        background: #1E293B; border-radius: 22px; border: 3px solid #475569; overflow: hidden;
      }
      .rc-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      /* Railway Dispatcher Steel Control Console */
      .rc-console {
        display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
        background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
        border: 3px solid #64748B; border-radius: 20px; padding: 8px 14px; min-height: 70px;
      }
      .rc-lever-btn {
        display: inline-flex; align-items: center; gap: 8px;
        border: 3px solid #94A3B8; border-radius: 16px; padding: 10px 20px;
        background: #0F172A; color: #F8FAFC; font-size: 16px; font-weight: 900;
        cursor: pointer; font-family: inherit; box-shadow: 0 4px 0 #020617;
        transition: transform 0.1s;
      }
      .rc-lever-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #020617; }
      .rc-lever-btn.danger { background: #DC2626; border-color: #FCA5A5; box-shadow: 0 4px 0 #7F1D1D; }
      .rc-lever-btn.safe   { background: #16A34A; border-color: #86EFAC; box-shadow: 0 4px 0 #14532D; }
      .rc-lever-btn.amber  { background: #D97706; border-color: #FDE68A; box-shadow: 0 4px 0 #78350F; }
      .rc-lever-btn.blue   { background: #2563EB; border-color: #93C5FD; box-shadow: 0 4px 0 #1E3A8A; }

      .rc-led {
        width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF;
        background: #475569; display: inline-block;
      }
      .rc-led.red { background: #EF4444; }
      .rc-led.green { background: #4ADE80; }
      .rc-led.yellow { background: #FACC15; }

      @media (max-width: 640px) {
        .rc-root { padding: 6px; gap: 6px; }
        .rc-topbar { padding-left: 44px; padding-right: 44px; }
        .rc-mode-btn { padding: 5px 10px; font-size: 12px; }
        .rc-hint { font-size: 12px; }
        .rc-console { padding: 6px; gap: 6px; min-height: 58px; }
        .rc-lever-btn { padding: 8px 12px; font-size: 13px; }
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
            <span class="rc-hint" id="rc-hint">でんしゃが きたら しゃだんきを おろそう！</span>
            <span class="rc-score" id="rc-score">0かい</span>
          </div>
        </div>

        <div class="rc-stage-wrap">
          <svg class="rc-svg" id="rc-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
            ${buildRailDefsSvg()}
            <g id="rc-scene"></g>
          </svg>
        </div>

        <div class="rc-console" id="rc-console"></div>
      </div>
    `;

    this.sceneEl = this.mountEl.querySelector('#rc-scene');
    this.hintEl = this.mountEl.querySelector('#rc-hint');
    this.scoreEl = this.mountEl.querySelector('#rc-score');
    this.consoleEl = this.mountEl.querySelector('#rc-console');

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
  }

  resetModeState() {
    if (this.mode === 'crossing') {
      this.gateCommandClosed = false;
      this.gateClosedRatio = 0;
      this.train = null;
      this.nextTrainTimer = 1.4;
      this.car = { x: 120, y: 404, color: '#3B82F6', roof: '#93C5FD', crossed: false };
      this.hintEl.textContent = 'やじるしが 光ったら しゃだんきを おろそう！';
    } else {
      this.pointA = 'top';
      this.pointB = 'mid';
      this.signalGreen = false;
      this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
      const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
      this.hintEl.textContent = `${ord.label} へ ポイントを きりかえて しゅっぱつ！`;
    }
    this.renderConsole();
    this.renderScene();
  }

  renderConsole() {
    if (this.mode === 'crossing') {
      const closed = this.gateCommandClosed;
      this.consoleEl.innerHTML = `
        <button class="rc-lever-btn ${closed ? 'danger' : 'safe'}" id="rc-gate-btn" type="button">
          <span class="rc-led ${closed ? 'red' : 'green'}"></span>
          <span>${closed ? 'しゃだんき：しまっている（あげる）' : 'しゃだんき：あいている（おろす！）'}</span>
        </button>
        <button class="rc-lever-btn amber" id="rc-call-train" type="button">でんしゃを よぶ</button>
      `;

      this.consoleEl.querySelector('#rc-gate-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.gateCommandClosed = !this.gateCommandClosed;
        this.sound.playBreakerClack();
        if (this.gateCommandClosed) {
          this.playFumikiriBell();
          this.hintEl.textContent = 'カンカンカン！ しゃだんきが おりているよ！';
        } else {
          this.hintEl.textContent = 'しゃだんきが あがったよ！ くるまが とおれるよ！';
        }
        this.renderConsole();
      });

      this.consoleEl.querySelector('#rc-call-train').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (!this.train) {
          this.spawnCrossingTrain();
        } else {
          this.playTrainHorn();
        }
      });
      return;
    }

    // Switchyard Console
    const running = this.swTrain.state === 'running';
    this.consoleEl.innerHTML = `
      <button class="rc-lever-btn ${this.pointA === 'top' ? 'danger' : 'blue'}" id="rc-pt-a" type="button">
        <span class="rc-led ${this.pointA === 'top' ? 'red' : 'yellow'}"></span>
        <span>ポイントA：${this.pointA === 'top' ? 'まっすぐ (1ばん)' : 'したへ ぶんき'}</span>
      </button>
      <button class="rc-lever-btn ${this.pointB === 'mid' ? 'blue' : 'amber'}" id="rc-pt-b" type="button">
        <span class="rc-led ${this.pointB === 'mid' ? 'green' : 'yellow'}"></span>
        <span>ポイントB：${this.pointB === 'mid' ? '2ばん (あお)' : '3ばん (きいろ)'}</span>
      </button>
      <button class="rc-lever-btn ${this.signalGreen ? 'safe' : 'danger'}" id="rc-sig-go" type="button" ${running ? 'disabled' : ''}>
        <span class="rc-led ${this.signalGreen ? 'green' : 'red'}"></span>
        <span>${running ? 'うんてんちゅう…' : 'しんごう あお（しゅっぱつ！）'}</span>
      </button>
    `;

    this.consoleEl.querySelector('#rc-pt-a').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.swTrain.state === 'running') return;
      this.sound.unlock();
      this.pointA = this.pointA === 'top' ? 'branch' : 'top';
      this.playPointThrow();
      this.renderConsole();
      this.renderScene();
    });

    this.consoleEl.querySelector('#rc-pt-b').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.swTrain.state === 'running') return;
      this.sound.unlock();
      this.pointB = this.pointB === 'mid' ? 'bot' : 'mid';
      this.playPointThrow();
      this.renderConsole();
      this.renderScene();
    });

    this.consoleEl.querySelector('#rc-sig-go').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.swTrain.state !== 'waiting') return;
      this.sound.unlock();
      const chosen = this.pointA === 'top' ? 'top' : this.pointB;
      this.signalGreen = true;
      this.swTrain = { t: 0, state: 'running', chosenPath: chosen };
      this.playTrainHorn();
      this.hintEl.textContent = 'しゅっぱつ しんこう！ ガタン・ゴトン！';
      this.renderConsole();
    });
  }

  spawnCrossingTrain() {
    const spec = FUMIKIRI_TRAINS[this.trainCycleIdx % FUMIKIRI_TRAINS.length];
    this.trainCycleIdx++;
    const dir = this.trainCycleIdx % 2 === 0 ? -1 : 1;
    this.train = {
      ...spec,
      dir,
      x: dir > 0 ? -240 : 1040,
      state: 'approach',
      clackAccum: 0
    };
    this.playTrainHorn();
    this.hintEl.textContent = `${dir > 0 ? 'ひだり' : 'みぎ'}から ${spec.name}が くるよ！しゃだんきを おろそう！`;
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
    if (this.mode === 'crossing') {
      this.stepCrossing(dt);
    } else {
      this.stepSwitchyard(dt);
    }
    this.renderScene();
  }

  stepCrossing(dt) {
    // 1. Move striped gate arms smoothly
    const target = this.gateCommandClosed ? 1 : 0;
    if (this.gateClosedRatio < target) {
      this.gateClosedRatio = Math.min(1, this.gateClosedRatio + dt * 1.15);
    } else if (this.gateClosedRatio > target) {
      this.gateClosedRatio = Math.max(0, this.gateClosedRatio - dt * 1.45);
    }

    // 2. Fumikiri alternating red warning lamps & authentic "KAN-KAN-KAN" bell!
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

    // 3. Road vehicle polite traffic behavior
    const stopX = 248;
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
        this.car = { x: -70, y: 404, color: next.color, roof: next.roof, crossed: false };
      }
    }

    // 4. Train arrival, safety hold if gate open, and crossing pass
    if (!this.train) {
      this.nextTrainTimer -= dt;
      if (this.nextTrainTimer <= 0) {
        this.spawnCrossingTrain();
      }
    } else {
      const tr = this.train;
      const stopBeforeCrossing = tr.dir > 0 ? 110 : 690;
      const reachedStop = tr.dir > 0 ? (tr.x >= stopBeforeCrossing) : (tr.x <= stopBeforeCrossing);
      const passedCrossing = tr.dir > 0 ? (tr.x > 1060) : (tr.x < -260);

      if (tr.state === 'approach' && reachedStop && this.gateClosedRatio < 0.85) {
        // Automatic safety ATS stop before crossing if gate isn't closed yet!
        tr.state = 'waiting-gate';
        this.hintEl.textContent = 'ATS あんぜん ていし！ しゃだんきを おろしてね！';
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
        if (passedCrossing) {
          this.train = null;
          this.score++;
          this.scoreEl.textContent = `${this.score}かい`;
          this.nextTrainTimer = 3.2;
          this.sound.playSuccessFanfare();
          this.hintEl.textContent = 'あんぜん つうか！ しゃだんきを あげて くるまを とおそう！';
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
      this.renderConsole();
      setTimeout(() => {
        if (this.destroyed || this.mode !== 'switch') return;
        this.swTrain = { t: 0, state: 'waiting', chosenPath: 'top' };
        const nextOrd = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
        this.hintEl.textContent = `${nextOrd.label} へ ポイントを きりかえて しゅっぱつ！`;
        this.renderConsole();
        this.renderScene();
      }, 1350);
    }
  }

  renderScene() {
    if (this.mode === 'crossing') {
      this.renderCrossingScene();
    } else {
      this.renderSwitchyardScene();
    }
  }

  renderCrossingScene() {
    const warningOn = this.gateCommandClosed || this.gateClosedRatio > 0.05;
    const arrowDir = this.train ? this.train.dir : 0;

    // Sleepers along rail bed
    const sleepers = Array.from({ length: 28 }, (_, i) => `
      <rect x="${12 + i * 28}" y="278" width="12" height="36" rx="2" fill="#78350F" opacity="0.85"/>
    `).join('');

    this.sceneEl.innerHTML = `
      <!-- Bright daytime Japanese suburb sky & distant hills -->
      <rect x="0" y="0" width="800" height="480" fill="url(#rc-sky)"/>
      <path d="M 0 215 Q 160 155 340 205 T 660 185 T 800 210 V 290 H 0 Z" fill="#86EFAC"/>
      <!-- Overhead catenary wire & poles -->
      <line x1="0" y1="184" x2="800" y2="184" stroke="#475569" stroke-width="2"/>
      <line x1="0" y1="196" x2="800" y2="196" stroke="#334155" stroke-width="2.5"/>
      <rect x="112" y="130" width="10" height="160" fill="#64748B"/>
      <rect x="678" y="130" width="10" height="160" fill="#64748B"/>

      <!-- Gravel ballast & Ground -->
      <rect x="0" y="264" width="800" height="216" fill="#CBD5E1"/>
      <rect x="0" y="274" width="800" height="46" fill="#94A3B8"/>
      ${sleepers}

      <!-- Crossing Asphalt Road cutting vertically/diagonally into foreground road -->
      <rect x="284" y="264" width="232" height="110" fill="url(#rc-road)"/>
      <!-- Foreground Horizontal Road where cars drive & stop at white stop line -->
      <rect x="0" y="362" width="800" height="96" fill="#475569"/>
      <line x1="0" y1="410" x2="800" y2="410" stroke="#F8FAFC" stroke-width="4" stroke-dasharray="28 18" opacity="0.7"/>
      <!-- White stop line before left crossing post -->
      <rect x="278" y="366" width="8" height="88" fill="#FFFFFF"/>

      <!-- Steel Rails -->
      <rect x="0" y="280" width="800" height="6" fill="url(#rc-steel-rail)"/>
      <rect x="0" y="302" width="800" height="7" fill="url(#rc-steel-rail)"/>

      <!-- Rear Fumikiri Post (far side of track) -->
      ${renderFumikiriPostSvg(526, 286, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'right' })}

      <!-- Live Moving Train on Track -->
      ${this.train ? renderTrainSvg(this.train.type, this.train.x, 304, this.train.dir, 1.0) : ''}

      <!-- Foreground Fumikiri Post (near side of track) -->
      ${renderFumikiriPostSvg(274, 368, { gateClosedRatio: this.gateClosedRatio, lampPhase: this.lampPhase, warningOn, arrowDir, side: 'left' })}

      <!-- Road Car politely stopping when gate closes -->
      ${renderRoadCarSvg(this.car.x, this.car.y, this.car.color, this.car.roof)}
    `;
  }

  renderSwitchyardScene() {
    const ord = SWITCH_ORDERS[this.swOrderIdx % SWITCH_ORDERS.length];
    const pA = this.pointA; // 'top' | 'branch'
    const pB = this.pointB; // 'mid' | 'bot'

    // Compute exact train position along the active route spline
    const t = this.swTrain.t;
    const path = this.swTrain.state === 'waiting' ? (pA === 'top' ? 'top' : pB) : this.swTrain.chosenPath;
    let tx = 105 + t * 560;
    let ty = 152;
    if (path === 'mid') {
      if (t < 0.25) ty = 152;
      else if (t < 0.55) ty = 152 + ((t - 0.25) / 0.30) * 108;
      else ty = 260;
    } else if (path === 'bot') {
      if (t < 0.25) ty = 152;
      else if (t < 0.55) ty = 152 + ((t - 0.25) / 0.30) * 108;
      else if (t < 0.78) ty = 260 + ((t - 0.55) / 0.23) * 108;
      else ty = 368;
    }

    const activeTrackColor = '#FACC15';
    const inactiveTrackColor = '#475569';

    this.sceneEl.innerHTML = `
      <!-- Gravel Rail Yard Backdrop -->
      <rect x="0" y="0" width="800" height="480" fill="#1E293B"/>
      <rect x="20" y="20" width="760" height="440" rx="20" fill="#334155" stroke="#475569" stroke-width="3"/>

      <!-- 3 Color-Coded Station Platforms on Right -->
      <!-- Platform 1: Red -->
      <rect x="576" y="102" width="188" height="36" rx="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="670" y="126" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF" font-family="sans-serif">1ばんせん（あか）</text>
      <!-- Platform 2: Blue -->
      <rect x="576" y="210" width="188" height="36" rx="8" fill="#2563EB" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="670" y="234" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF" font-family="sans-serif">2ばんせん（あお）</text>
      <!-- Platform 3: Yellow -->
      <rect x="576" y="318" width="188" height="36" rx="8" fill="#EAB308" stroke="#FFFFFF" stroke-width="2.5"/>
      <text x="670" y="342" text-anchor="middle" font-size="15" font-weight="900" fill="#0F172A" font-family="sans-serif">3ばんせん（きいろ）</text>

      <!-- Base Steel Tracks (all 3 routes) -->
      <path d="M 30 152 H 756" stroke="${inactiveTrackColor}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 245 152 C 320 152 340 260 410 260 H 756" stroke="${inactiveTrackColor}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M 410 260 C 480 260 492 368 560 368 H 756" stroke="${inactiveTrackColor}" stroke-width="14" fill="none" stroke-linecap="round"/>

      <!-- Active Illuminated Route Highlight showing exact current point routing! -->
      ${pA === 'top' ? `
        <path d="M 30 152 H 756" stroke="${activeTrackColor}" stroke-width="6" fill="none" stroke-linecap="round"/>
      ` : (pB === 'mid' ? `
        <path d="M 30 152 H 245 C 320 152 340 260 410 260 H 756" stroke="${activeTrackColor}" stroke-width="6" fill="none" stroke-linecap="round"/>
      ` : `
        <path d="M 30 152 H 245 C 320 152 340 260 410 260 C 480 260 492 368 560 368 H 756" stroke="${activeTrackColor}" stroke-width="6" fill="none" stroke-linecap="round"/>
      `)}

      <!-- Physical Switch Point Motors & Tongue Blades (Point A & Point B) -->
      <g transform="translate(245 152)">
        <circle cx="0" cy="0" r="18" fill="#0F172A" stroke="#FACC15" stroke-width="3"/>
        <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="900" fill="#FACC15" font-family="sans-serif">A</text>
      </g>
      <g transform="translate(410 260)">
        <circle cx="0" cy="0" r="18" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
        <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="900" fill="#38BDF8" font-family="sans-serif">B</text>
      </g>

      <!-- 3-Aspect Japanese Railway Signal Tower before Point A -->
      <g transform="translate(186 42)">
        <rect x="6" y="48" width="8" height="44" fill="#94A3B8"/>
        <rect x="0" y="0" width="20" height="54" rx="10" fill="#0F172A" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="10" cy="12" r="5.5" fill="${this.signalGreen ? '#450A0A' : '#EF4444'}"/>
        <circle cx="10" cy="27" r="5.5" fill="#422006"/>
        <circle cx="10" cy="42" r="5.5" fill="${this.signalGreen ? '#4ADE80' : '#052E16'}"/>
      </g>

      <!-- Destination Order Banner -->
      <rect x="44" y="388" width="332" height="48" rx="14" fill="#0F172A" stroke="#FACC15" stroke-width="2.5"/>
      <text x="210" y="418" text-anchor="middle" font-size="16" font-weight="900" fill="#FEF08A" font-family="sans-serif">ゆきさき：${ord.label}</text>

      <!-- Color-Matched Commuter Train -->
      ${renderTrainSvg(ord.color, tx, ty + 4, 1, 0.56)}
    `;
  }

  /* =========================================================================
     Authentic Japanese Railway Web Audio Effects
     ========================================================================= */

  playFumikiriBell() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Signature Japanese fumikiri dual-harmonic metallic ring (~740Hz + 785Hz beat)
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
    // "GA-TAN GO-TON" double bogie rail joint pulse
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
      lp.type = 'lowpass';
      lp.frequency.value = 1100;
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.11, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(lp); lp.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.38);
    });
  }
}
