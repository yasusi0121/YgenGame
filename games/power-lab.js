/* =========================================================================
   POWER LAB — 3D Electrical Circuit & Distribution Board Sandbox
   "How It's Wired" inspired interactive 3D workbench for kids.
   Features nyoki-nyoki sprouting entrances, direct 3D switch/breaker taps,
   orbit camera, live V/A/kW pills, overload trips, and RCD leak tests.
   ========================================================================= */

import { FLAT_ICONS } from '../core/flat-icons.js';
import { showSideCelebration } from '../core/pseudo-3d-viewer.js';
import { buildWorkbenchFloor, buildPowerLabStage } from './power-lab-scene.js';

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const STAGES = [
  { id: 'basic',  label: 'はじめて',     stars: 1, title: 'はじめての かいろ' },
  { id: 'series', label: 'ちょく・へい', stars: 2, title: 'ちょくれつ ＆ へいれつ' },
  { id: 'stairs', label: 'かいだん',     stars: 3, title: 'かいだん スイッチ' },
  { id: 'panel',  label: 'ぶんでんばん', stars: 4, title: 'ぶんでんばん ブレーカー' }
];

const BREAKER_AMPS = { b32: 14, b20: 10, b16: 6, b6: 2 };
const OVERLOAD_LIMIT = 25;

let cachedThree = null;

function ensurePowerLabStyles() {
  if (document.getElementById('pl-styles-v1')) return;
  const style = document.createElement('style');
  style.id = 'pl-styles-v1';
  style.textContent = `
    .pl-root {
      position: relative;
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) calc(10px + var(--safe-bottom)) calc(12px + var(--safe-left));
      gap: 7px;
      user-select: none; -webkit-user-select: none;
      touch-action: none;
      background: #FAF3E3;
    }
    .pl-topbar {
      width: 100%; max-width: 1040px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      padding: 0 56px;
      z-index: 5;
    }
    .pl-util-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #1E293B; border-bottom: 5px solid #1E293B;
      border-radius: 16px; padding: 5px 12px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 13px; font-weight: 900;
      transition: transform 0.1s ease;
    }
    .pl-util-btn:active { transform: translateY(2px); }
    .pl-banner {
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #1E293B;
      box-shadow: 0 4px 0 rgba(30, 41, 59, 0.2);
      border-radius: 999px;
      padding: 6px 18px;
      font-size: clamp(13.5px, 1.8vw, 17px); font-weight: 900;
      display: inline-flex; align-items: center; gap: 10px;
      text-align: center; z-index: 5;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .pl-banner.is-ok {
      background: #DCFCE7; border-color: #15803D; color: #14532D;
    }
    .pl-banner.is-trip {
      background: #FEE2E2; border-color: #DC2626; color: #7F1D1D;
    }
    .pl-viewport {
      flex: 1 1 auto; min-height: 0;
      width: 100%; max-width: 1020px;
      position: relative;
      border-radius: 24px;
      border: 3px solid #DFD3BC;
      overflow: hidden;
      background: #FAF3E3;
      box-shadow: inset 0 2px 12px rgba(120, 90, 40, 0.08);
    }
    .pl-canvas {
      width: 100%; height: 100%;
      display: block;
      cursor: grab;
      touch-action: none;
    }
    .pl-canvas:active { cursor: grabbing; }
    .pl-meters {
      position: absolute; inset: 0;
      pointer-events: none; overflow: hidden;
    }
    .pl-meter-pill {
      position: absolute;
      transform: translate(-50%, -100%);
      background: #0F172A; color: #F8FAFC;
      border: 2.5px solid #FFFFFF;
      border-radius: 999px;
      padding: 4px 13px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13.5px; font-weight: 900;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.28);
      display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.2s ease;
    }
    .pl-meter-pill.is-hot {
      background: #DC2626;
    }
    .pl-loading {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; background: #FAF3E3; color: #1E293B;
      font-family: var(--font-rounded); font-size: 18px; font-weight: 900;
      z-index: 10;
    }
    .pl-controls {
      width: 100%; max-width: 1020px;
      background: #FFFFFF;
      border: 3px solid #1E293B;
      box-shadow: 0 5px 0 rgba(30, 41, 59, 0.16);
      border-radius: 22px;
      padding: 8px 10px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      min-height: 62px;
      z-index: 5;
    }
    .pl-ctrl-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #F1F5F9; color: #1E293B;
      border: 3px solid #1E293B; border-bottom: 5px solid #1E293B;
      border-radius: 16px; padding: 7px 14px; cursor: pointer;
      font-family: var(--font-rounded); font-size: 14px; font-weight: 900;
      transition: transform 0.1s ease, background 0.14s ease;
    }
    .pl-ctrl-btn:active { transform: translateY(2px); }
    .pl-ctrl-btn.is-on {
      background: #22C55E; color: #FFFFFF; border-color: #14532D; border-bottom-color: #14532D;
    }
    .pl-ctrl-btn.is-red.is-on {
      background: #EF4444; color: #FFFFFF; border-color: #7F1D1D; border-bottom-color: #7F1D1D;
    }
    .pl-ctrl-btn.is-warn {
      background: #FACC15; color: #422006; border-color: #854D0E; border-bottom-color: #854D0E;
    }
    .pl-ctrl-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #94A3B8; display: inline-block;
    }
    .pl-ctrl-btn.is-on .pl-ctrl-dot {
      background: #FEF08A;
    }
  `;
  document.head.appendChild(style);
}

export default class PowerLabGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.stageIdx = 0;
    this.THREE = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.stageRoot = null;
    this.stageData = null;

    // Orbit camera spherical state
    this.camTheta = 0.58;
    this.camPhi = 0.92;
    this.camDist = 9.2;
    this.targetTheta = 0.58;
    this.targetPhi = 0.92;
    this.camTarget = { x: 0, y: 0.9, z: 0.1 };

    // Electrical simulation state
    this.state = {
      power: true,
      sw1: false,
      sw2: false,
      parallel: false,
      b1On: true,
      b2On: true,
      doorOpen: true,
      brkMain: true,
      brkRcd: true,
      brkB32: true,
      brkB20: false,
      brkB16: true,
      brkB6: true,
      trippedReason: null // 'overload' | 'rcd' | null
    };

    // Animated lever angles
    this.animAngles = { power: 0, sw1: 0, sw2: 0, mode: 0, door: -2.15 };
    this.missionDone = false;

    this.pointerDown = false;
    this.dragMoved = false;
    this.downX = 0;
    this.downY = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.paused = false;
    this.unmounted = false;
    this.rafId = null;
    this.lastFrame = 0;
    this.tripTimer = null;

    this._onResize = () => this.handleResize();
    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    ensurePowerLabStyles();
    this.app.setGameBackground('#FAF3E3');

    this.container.innerHTML = `
      <div class="pl-root" id="pl-root">
        <div class="pl-topbar">
          <div class="pm-mode-tabs" id="pl-tabs">
            ${STAGES.map((st, idx) => `
              <button class="pm-tab-btn ${idx === 0 ? 'is-active' : ''}" type="button" data-stage="${idx}">
                ${FLAT_ICONS.stars(st.stars, 13)}<span>${st.label}</span>
              </button>
            `).join('')}
          </div>
          <button class="pl-util-btn" type="button" id="pl-sprout-btn">にょきにょき</button>
          <button class="pl-util-btn" type="button" id="pl-cam-btn">しょうめん</button>
        </div>

        <div class="pl-banner" id="pl-banner">でんきを いれたり おとしたり してみよう！</div>

        <div class="pl-viewport" id="pl-viewport">
          <div class="pl-loading" id="pl-loading">
            ${FLAT_ICONS.sparkle(42)}
            <div>3D ワークベンチを じゅんびちゅう…</div>
          </div>
          <div class="pl-meters" id="pl-meters"></div>
        </div>

        <div class="pl-controls" id="pl-controls"></div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#pl-root');
    this.bannerEl = this.container.querySelector('#pl-banner');
    this.viewportEl = this.container.querySelector('#pl-viewport');
    this.loadingEl = this.container.querySelector('#pl-loading');
    this.metersEl = this.container.querySelector('#pl-meters');
    this.controlsEl = this.container.querySelector('#pl-controls');

    this.container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const idx = Number(btn.dataset.stage);
        if (idx === this.stageIdx) return;
        this.sound.playPageTurn(1);
        this.loadStage(idx);
      });
    });

    this.container.querySelector('#pl-sprout-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      if (this.stageData) {
        this.stageData.replaySprouts();
      }
    });

    this.container.querySelector('#pl-cam-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playButtonDown('yellow');
      this.resetCameraForStage();
    });

    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);

    this.initThree();
  }

  async initThree() {
    try {
      if (!cachedThree) {
        cachedThree = await import(THREE_CDN);
      }
      if (this.unmounted) return;
      this.THREE = cachedThree;
      this.setupRenderer();
      if (this.loadingEl) this.loadingEl.remove();
      this.loadStage(0);
      this.startLoop();
    } catch (err) {
      if (this.loadingEl) {
        this.loadingEl.innerHTML = `
          <div>3Dの よみこみに しっぱいしました</div>
          <button class="pl-util-btn" type="button" id="pl-retry-btn">もういちど よみこむ</button>
        `;
        const retry = this.loadingEl.querySelector('#pl-retry-btn');
        if (retry) retry.addEventListener('pointerdown', () => this.initThree());
      }
    }
  }

  setupRenderer() {
    const THREE = this.THREE;
    const rect = this.viewportEl.getBoundingClientRect();
    const w = Math.max(300, rect.width);
    const h = Math.max(240, rect.height);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'pl-canvas';
    this.viewportEl.insertBefore(this.renderer.domElement, this.metersEl);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFAF3E3);

    this.camera = new THREE.PerspectiveCamera(34, w / h, 0.2, 60);

    // Warm studio lighting matching the cream workbench aesthetic
    const hemi = new THREE.HemisphereLight(0xFFFDF5, 0xD6C8AC, 0.92);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xFFFBEB, 1.05);
    dir.position.set(6, 11, 7);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 28;
    const d = 6.5;
    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;
    dir.shadow.bias = -0.001;
    this.scene.add(dir);

    buildWorkbenchFloor(THREE, this.scene);

    this.stageRoot = new THREE.Group();
    this.scene.add(this.stageRoot);

    this.raycaster = new THREE.Raycaster();
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
  }

  resetCameraForStage() {
    const st = STAGES[this.stageIdx];
    if (st.id === 'panel') {
      this.targetTheta = 0.22;
      this.targetPhi = 1.24;
      this.camDist = 8.4;
      this.camTarget = { x: -0.15, y: 1.85, z: -0.2 };
    } else {
      this.targetTheta = 0.56;
      this.targetPhi = 0.92;
      this.camDist = 9.0;
      this.camTarget = { x: 0.0, y: 0.75, z: 0.1 };
    }
  }

  loadStage(idx) {
    if (!this.THREE || !this.stageRoot) return;
    if (this.tripTimer) { clearTimeout(this.tripTimer); this.tripTimer = null; }

    this.stageIdx = idx;
    this.missionDone = false;
    this.state.trippedReason = null;

    // Reset per-stage defaults so kids get a fun first action
    if (STAGES[idx].id === 'basic') {
      this.state.power = true;
      this.state.sw1 = false;
    } else if (STAGES[idx].id === 'series') {
      this.state.power = true;
      this.state.parallel = false;
      this.state.b1On = true;
      this.state.b2On = true;
    } else if (STAGES[idx].id === 'stairs') {
      this.state.power = true;
      this.state.sw1 = false;
      this.state.sw2 = true;
    } else if (STAGES[idx].id === 'panel') {
      this.state.doorOpen = true;
      this.state.brkMain = true;
      this.state.brkRcd = true;
      this.state.brkB32 = true;
      this.state.brkB20 = false;
      this.state.brkB16 = true;
      this.state.brkB6 = true;
    }

    this.container.querySelectorAll('[data-stage]').forEach((b) =>
      b.classList.toggle('is-active', Number(b.dataset.stage) === idx)
    );

    // Clear previous 3D objects cleanly
    while (this.stageRoot.children.length > 0) {
      const obj = this.stageRoot.children[0];
      this.stageRoot.remove(obj);
      this.disposeObject(obj);
    }

    this.stageData = buildPowerLabStage(this.THREE, this.stageRoot, STAGES[idx].id, (popIdx) => {
      this.sound.playSproutPop(popIdx);
    });

    this.resetCameraForStage();
    this.camTheta = this.targetTheta;
    this.camPhi = this.targetPhi;

    this.buildMeterPills();
    this.evaluateCircuit(false);
    this.renderControls();
  }

  buildMeterPills() {
    this.metersEl.innerHTML = '';
    this.meterEls = {};
    if (!this.stageData) return;
    for (const a of this.stageData.meterAnchors) {
      const el = document.createElement('div');
      el.className = 'pl-meter-pill';
      el.innerHTML = '';
      this.metersEl.appendChild(el);
      this.meterEls[a.id] = el;
    }
  }

  handleAction(hitId) {
    this.sound.unlock();
    const st = STAGES[this.stageIdx].id;

    if (hitId === 'power') {
      this.state.power = !this.state.power;
      this.sound.playBreakerClack(this.state.power);
    } else if (hitId === 'sw1') {
      this.state.sw1 = !this.state.sw1;
      this.sound.playBreakerClack(this.state.sw1);
    } else if (hitId === 'sw2') {
      this.state.sw2 = !this.state.sw2;
      this.sound.playBreakerClack(this.state.sw2);
    } else if (hitId === 'mode') {
      this.state.parallel = !this.state.parallel;
      this.sound.playBreakerClack(this.state.parallel);
    } else if (hitId === 'b1-toggle') {
      this.state.b1On = !this.state.b1On;
      this.sound.playButtonDown('yellow');
    } else if (hitId === 'b2-toggle') {
      this.state.b2On = !this.state.b2On;
      this.sound.playButtonDown('yellow');
    } else if (hitId === 'door') {
      this.state.doorOpen = !this.state.doorOpen;
      this.sound.playPageTurn(this.state.doorOpen ? 1 : -1);
    } else if (hitId === 'brk-main') {
      this.state.brkMain = !this.state.brkMain;
      if (this.state.brkMain) this.state.trippedReason = null;
      this.sound.playBreakerClack(this.state.brkMain);
    } else if (hitId === 'brk-rcd') {
      this.state.brkRcd = !this.state.brkRcd;
      if (this.state.brkRcd) this.state.trippedReason = null;
      this.sound.playBreakerClack(this.state.brkRcd);
    } else if (hitId === 'rcd-test') {
      if (this.state.brkMain && this.state.brkRcd) {
        this.state.brkRcd = false;
        this.state.trippedReason = 'rcd';
        this.sound.playBreakerTrip();
      } else {
        this.sound.playButtonDown('yellow');
      }
    } else if (hitId.startsWith('brk-b')) {
      const key = 'brkB' + hitId.slice(5);
      this.state[key] = !this.state[key];
      this.sound.playBreakerClack(this.state[key]);
    } else {
      return;
    }

    this.evaluateCircuit(true, st);
    this.renderControls();
  }

  evaluateCircuit(fromUser = false) {
    if (!this.stageData) return;
    const st = STAGES[this.stageIdx].id;
    const { wires, bulbs, panel } = this.stageData;

    this.bannerEl.classList.remove('is-ok', 'is-trip');

    if (st === 'basic') {
      const lit = this.state.power && this.state.sw1;
      bulbs.b1.targetGlow = lit ? 1.0 : 0;
      wires.wLive1.active = lit;
      wires.wLive2.active = lit;
      wires.wNeut.active = lit;
      if (this.meterEls.m1) {
        this.meterEls.m1.textContent = lit ? '100 V ・ 0.26 A' : '0 V ・ 0.00 A';
      }
      if (lit) {
        this.bannerEl.textContent = 'でんきゅうが ついたよ！ スイッチで いれたり きったり しよう！';
        this.bannerEl.classList.add('is-ok');
        if (fromUser && !this.missionDone) {
          this.missionDone = true;
          this.sound.playLampOn('and');
          showSideCelebration(this.rootEl);
        }
      } else {
        this.bannerEl.textContent = this.state.power
          ? 'しろい スイッチを パチッと おして でんきを つけよう！'
          : 'あかい でんげんスイッチを いれよう！';
      }
    } else if (st === 'series') {
      const par = this.state.parallel;
      let g1 = 0, g2 = 0, v1 = 0, a1 = 0, v2 = 0, a2 = 0;
      if (this.state.power) {
        if (!par) {
          // Series: both bulbs must be ON, split voltage 50V each
          if (this.state.b1On && this.state.b2On) {
            g1 = 0.55; g2 = 0.55;
            v1 = 50; a1 = 0.13; v2 = 50; a2 = 0.13;
          }
        } else {
          // Parallel: independent 100V full brightness!
          if (this.state.b1On) { g1 = 1.0; v1 = 100; a1 = 0.26; }
          if (this.state.b2On) { g2 = 1.0; v2 = 100; a2 = 0.26; }
        }
      }
      bulbs.b1.targetGlow = g1;
      bulbs.b2.targetGlow = g2;
      const anyFlow = g1 > 0 || g2 > 0;
      const spd = par ? 0.62 : 0.34;
      wires.wSupply.active = anyFlow; wires.wSupply.speed = spd;
      wires.wToB1.active = g1 > 0;    wires.wToB1.speed = spd;
      wires.wMid.active = !par && anyFlow; wires.wMid.speed = spd;
      wires.wPar.active = par && g2 > 0;   wires.wPar.speed = spd;
      wires.wRet.active = anyFlow;    wires.wRet.speed = spd;

      if (this.meterEls.m1) this.meterEls.m1.textContent = `${v1} V ・ ${a1.toFixed(2)} A`;
      if (this.meterEls.m2) this.meterEls.m2.textContent = `${v2} V ・ ${a2.toFixed(2)} A`;

      if (par && g1 > 0 && g2 > 0) {
        this.bannerEl.textContent = 'へいれつ（100V）！ ピカピカ あかるいね！ かたほう きっても だいじょうぶ！';
        this.bannerEl.classList.add('is-ok');
        if (fromUser && !this.missionDone) {
          this.missionDone = true;
          this.sound.playLampOn('and');
          showSideCelebration(this.rootEl);
        }
      } else if (!par && g1 > 0) {
        this.bannerEl.textContent = 'ちょくれつ（50Vずつ）！ みどりの スイッチで「へいれつ」に かえてみよう！';
      } else {
        this.bannerEl.textContent = 'でんきが きれているよ！ でんげんや でんきゅうを いれてみよう！';
      }
    } else if (st === 'stairs') {
      const lit = this.state.power && (this.state.sw1 === this.state.sw2);
      bulbs.b1.targetGlow = lit ? 1.0 : 0;
      wires.wIn.active = lit;
      wires.wTrA.active = lit && !this.state.sw1;
      wires.wTrB.active = lit && this.state.sw1;
      wires.wOut.active = lit;
      wires.wRet.active = lit;
      if (this.meterEls.m1) {
        this.meterEls.m1.textContent = lit ? '100 V ・ 0.26 A' : '0 V ・ 0.00 A';
      }
      if (lit) {
        this.bannerEl.textContent = 'かいだんの でんきが ついたよ！ 1かい・2かい どっちでも けせるよ！';
        this.bannerEl.classList.add('is-ok');
        if (fromUser && !this.missionDone) {
          this.missionDone = true;
          this.sound.playLampOn('and');
          showSideCelebration(this.rootEl);
        }
      } else {
        this.bannerEl.textContent = '1かい か 2かいの スイッチを おして でんきを つけよう！';
      }
    } else if (st === 'panel' && panel) {
      const powered = this.state.brkMain && this.state.brkRcd;
      let totalA = 0;
      if (powered) {
        if (this.state.brkB32) totalA += BREAKER_AMPS.b32;
        if (this.state.brkB20) totalA += BREAKER_AMPS.b20;
        if (this.state.brkB16) totalA += BREAKER_AMPS.b16;
        if (this.state.brkB6)  totalA += BREAKER_AMPS.b6;
      }

      // Trigger realistic overload trip when exceeding 25A!
      if (this.tripTimer) { clearTimeout(this.tripTimer); this.tripTimer = null; }
      if (powered && totalA > OVERLOAD_LIMIT) {
        this.tripTimer = setTimeout(() => {
          this.tripTimer = null;
          this.state.brkMain = false;
          this.state.trippedReason = 'overload';
          this.sound.playBreakerTrip();
          this.evaluateCircuit(false);
          this.renderControls();
        }, 380);
      }

      const flowSpeed = Math.min(1.1, 0.25 + totalA * 0.03);
      wires.supply.active = powered && totalA > 0; wires.supply.speed = flowSpeed;
      wires.rcdBus.active = powered && totalA > 0; wires.rcdBus.speed = flowSpeed;
      wires.topBus.active = powered && totalA > 0; wires.topBus.speed = flowSpeed;
      wires.neutral.active = powered && totalA > 0; wires.neutral.speed = flowSpeed;
      wires.earth.active = false;

      // Update breaker indicator window colors & lever target angles
      const map = [
        ['main', this.state.brkMain],
        ['rcd',  this.state.brkRcd],
        ['b32',  this.state.brkB32],
        ['b20',  this.state.brkB20],
        ['b16',  this.state.brkB16],
        ['b6',   this.state.brkB6]
      ];
      for (const [k, on] of map) {
        const b = panel.breakers[k];
        b.targetAngle = on ? -0.46 : 0.46;
        b.winMat.color.setHex(on ? 0xEF4444 : 0x22C55E);
      }

      const kw = (totalA * 100) / 1000;
      if (this.meterEls.m1) {
        this.meterEls.m1.textContent = `${totalA.toFixed(1)} A ・ ${kw.toFixed(1)} kW`;
        this.meterEls.m1.classList.toggle('is-hot', totalA > OVERLOAD_LIMIT || !!this.state.trippedReason);
      }

      if (this.state.trippedReason === 'overload') {
        this.bannerEl.textContent = 'つかいすぎ（25Aオーバー）！ ブレーカーが おちたよ！ へらして メインを あげよう！';
        this.bannerEl.classList.add('is-trip');
      } else if (this.state.trippedReason === 'rcd') {
        this.bannerEl.textContent = 'ろうでん テスト OK！ RCDが バチンと とめたよ！ レバーを あげて もどそう！';
        this.bannerEl.classList.add('is-trip');
        if (fromUser && !this.missionDone) {
          this.missionDone = true;
          showSideCelebration(this.rootEl);
        }
      } else if (powered && totalA > 0) {
        this.bannerEl.textContent = `ぶんでんばん うごいてるよ！（25A こえると おちるよ・きいろで テスト！）`;
        this.bannerEl.classList.add('is-ok');
      } else {
        this.bannerEl.textContent = 'メイン や RCD ブレーカーを あげて でんきを いれよう！';
      }
    }
  }

  renderControls() {
    const st = STAGES[this.stageIdx].id;
    let btns = [];
    if (st === 'basic') {
      btns = [
        { id: 'power', label: 'あかい でんげん', on: this.state.power, cls: 'is-red' },
        { id: 'sw1',   label: 'しろい スイッチ', on: this.state.sw1 }
      ];
    } else if (st === 'series') {
      btns = [
        { id: 'power',     label: 'でんげん', on: this.state.power, cls: 'is-red' },
        { id: 'mode',      label: this.state.parallel ? 'いま：へいれつ' : 'いま：ちょくれつ', on: this.state.parallel },
        { id: 'b1-toggle', label: 'ひだり でんきゅう', on: this.state.b1On },
        { id: 'b2-toggle', label: 'みぎ でんきゅう', on: this.state.b2On }
      ];
    } else if (st === 'stairs') {
      btns = [
        { id: 'power', label: 'でんげん', on: this.state.power, cls: 'is-red' },
        { id: 'sw1',   label: '1かい スイッチ', on: this.state.sw1 },
        { id: 'sw2',   label: '2かい スイッチ', on: this.state.sw2 }
      ];
    } else if (st === 'panel') {
      btns = [
        { id: 'door',     label: this.state.doorOpen ? 'とびら しめる' : 'とびら あける', on: false },
        { id: 'brk-main', label: 'メイン', on: this.state.brkMain, cls: 'is-red' },
        { id: 'brk-rcd',  label: 'RCD', on: this.state.brkRcd },
        { id: 'rcd-test', label: 'ろうでんテスト', on: false, cls: 'is-warn' },
        { id: 'brk-b32',  label: 'エアコン(14A)', on: this.state.brkB32 },
        { id: 'brk-b20',  label: 'キッチン(10A)', on: this.state.brkB20 },
        { id: 'brk-b16',  label: 'リビング(6A)', on: this.state.brkB16 },
        { id: 'brk-b6',   label: 'あかり(2A)', on: this.state.brkB6 }
      ];
    }

    this.controlsEl.innerHTML = btns.map((b) => `
      <button class="pl-ctrl-btn ${b.on ? 'is-on' : ''} ${b.cls || ''}" type="button" data-hit="${b.id}">
        <span class="pl-ctrl-dot"></span><span>${b.label}</span>
      </button>
    `).join('');

    this.controlsEl.querySelectorAll('[data-hit]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleAction(btn.dataset.hit);
      });
    });
  }

  handlePointerDown(e) {
    e.preventDefault();
    this.sound.unlock();
    this.pointerDown = true;
    this.dragMoved = false;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  handlePointerMove(e) {
    if (!this.pointerDown) return;
    e.preventDefault();
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    if (Math.hypot(e.clientX - this.downX, e.clientY - this.downY) > 10) {
      this.dragMoved = true;
    }
    if (this.dragMoved) {
      this.targetTheta -= dx * 0.009;
      this.targetPhi = Math.max(0.35, Math.min(1.42, this.targetPhi - dy * 0.007));
    }
  }

  handlePointerUp(e) {
    if (!this.pointerDown) return;
    this.pointerDown = false;
    if (!this.dragMoved && this.renderer && this.camera && this.stageRoot) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const ndc = new this.THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, this.camera);
      const hits = this.raycaster.intersectObjects(this.stageRoot.children, true);
      for (const h of hits) {
        let obj = h.object;
        while (obj) {
          if (obj.userData && obj.userData.hitId) {
            this.handleAction(obj.userData.hitId);
            return;
          }
          obj = obj.parent;
        }
      }
    }
  }

  startLoop() {
    this.stopLoop();
    this.lastFrame = performance.now();
    const MIN_FRAME_MS = 32; // ~30fps cap for iPad battery/thermal health

    const tick = (now) => {
      if (this.paused || this.unmounted) {
        this.rafId = null;
        return;
      }
      const elapsed = now - this.lastFrame;
      if (elapsed < MIN_FRAME_MS) {
        this.rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(elapsed / 1000, 0.06);
      this.lastFrame = now;

      this.updateScene(dt);
      this.renderer.render(this.scene, this.camera);
      this.updateMeterPositions();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  updateScene(dt) {
    // Smooth orbit camera damping
    this.camTheta += (this.targetTheta - this.camTheta) * 0.16;
    this.camPhi += (this.targetPhi - this.camPhi) * 0.16;
    const sinPhi = Math.sin(this.camPhi);
    this.camera.position.set(
      this.camTarget.x + this.camDist * sinPhi * Math.sin(this.camTheta),
      this.camTarget.y + this.camDist * Math.cos(this.camPhi),
      this.camTarget.z + this.camDist * sinPhi * Math.cos(this.camTheta)
    );
    this.camera.lookAt(this.camTarget.x, this.camTarget.y, this.camTarget.z);

    if (!this.stageData) return;

    // 1. Nyoki-nyoki sprouting entrance animation
    this.stageData.updateSprouts(dt);

    // 2. Smooth spring-like switch & door animations
    const { switches, bulbs, wires, panel } = this.stageData;
    const lerp = (a, b, f) => a + (b - a) * f;

    if (switches.power) {
      const target = this.state.power ? -0.35 : 0.35;
      this.animAngles.power = lerp(this.animAngles.power, target, 0.25);
      switches.power.leverPivot.rotation.z = this.animAngles.power;
      switches.power.ledMat.emissiveIntensity = this.state.power ? 1.4 : 0;
    }
    if (switches.sw1) {
      const target = this.state.sw1 ? -0.36 : 0.36;
      this.animAngles.sw1 = lerp(this.animAngles.sw1, target, 0.25);
      switches.sw1.leverPivot.rotation.z = this.animAngles.sw1;
    }
    if (switches.sw2) {
      const target = this.state.sw2 ? -0.36 : 0.36;
      this.animAngles.sw2 = lerp(this.animAngles.sw2, target, 0.25);
      switches.sw2.leverPivot.rotation.z = this.animAngles.sw2;
    }
    if (switches.mode) {
      const target = this.state.parallel ? -0.38 : 0.38;
      this.animAngles.mode = lerp(this.animAngles.mode, target, 0.25);
      switches.mode.leverPivot.rotation.z = this.animAngles.mode;
    }

    if (panel) {
      const doorTarget = this.state.doorOpen ? -2.25 : 0;
      this.animAngles.door = lerp(this.animAngles.door, doorTarget, 0.16);
      panel.doorPivot.rotation.y = this.animAngles.door;
      for (const b of Object.values(panel.breakers)) {
        b.angle = lerp(b.angle, b.targetAngle, 0.28);
        b.leverPivot.rotation.x = b.angle;
      }
    }

    // 3. Smooth filament & glass glow
    for (const b of Object.values(bulbs)) {
      b.glow = lerp(b.glow, b.targetGlow, 0.18);
      b.filMat.emissiveIntensity = b.glow * 2.4;
      b.glassMat.emissiveIntensity = b.glow * 0.95;
      b.haloMat.opacity = b.glow * 0.32;
    }

    // 4. Flowing 3D current pulses along active wire curves
    for (const w of Object.values(wires)) {
      if (w.active) {
        w.phase = (w.phase + dt * w.speed) % 1;
        const n = w.pulses.length;
        for (let i = 0; i < n; i++) {
          const u = (i / n + w.phase) % 1;
          const pt = w.curve.getPointAt(u);
          w.pulses[i].position.copy(pt);
          w.pulses[i].visible = true;
        }
      } else {
        for (const p of w.pulses) p.visible = false;
      }
    }
  }

  updateMeterPositions() {
    if (!this.stageData || !this.camera || !this.renderer) return;
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    for (const a of this.stageData.meterAnchors) {
      const el = this.meterEls[a.id];
      if (!el) continue;
      const v = a.pos.clone().project(this.camera);
      const sx = (v.x * 0.5 + 0.5) * w;
      const sy = (-v.y * 0.5 + 0.5) * h;
      el.style.left = `${sx.toFixed(1)}px`;
      el.style.top = `${sy.toFixed(1)}px`;
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera || !this.viewportEl) return;
    const rect = this.viewportEl.getBoundingClientRect();
    const w = Math.max(300, rect.width);
    const h = Math.max(240, rect.height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  onPause() {
    this.paused = true;
    this.stopLoop();
  }

  onResume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.renderer) this.startLoop();
  }

  disposeObject(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  unmount() {
    this.unmounted = true;
    this.stopLoop();
    if (this.tripTimer) { clearTimeout(this.tripTimer); this.tripTimer = null; }
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    if (this.scene) this.disposeObject(this.scene);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.container.innerHTML = '';
  }
}
