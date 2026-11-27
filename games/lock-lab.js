import {
  buildLockDefsSvg,
  PIN_CAL,
  buildSpringPath,
  getPinSlotX,
  getKeyShoulderX,
  sampleKeySurfaceY,
  renderKeySvg,
  renderKeyThumbSvg,
  MATCH_STAGES,
  CRAFT_STAGES,
  SAFE_STAGES
} from './lock-lab-assets.js';

export default class LockLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'match'; // 'match' | 'craft' | 'safe'
    this.stageIdx = 0;
    this.cutaway = true; // Shows authentic internal cutaway by default!

    // Pin tumbler state
    this.selectedKeyIdx = 0;
    this.customCuts = [3, 3, 3];
    this.keyInsert = 0; // 0 (pulled out) -> 1 (fully inserted)
    this.boltOpen = 0;  // 0 (locked) -> 1 (unlocked)
    this.unlocked = false;
    this.jamShake = 0;
    this.lastPinHeights = [];

    // Dragging key horizontally
    this.draggingKey = false;
    this.dragOriginX = 0;
    this.dragOriginInsert = 0;

    // Safe dial state
    this.activeWheelIdx = 0;
    this.wheelNums = [0, 0, 0]; // current 0..11 position of each wheel
    this.safeHandleTurn = 0; // 0 -> 1
    this.draggingDial = false;
    this.lastDialAngle = 0;
    this.dialAccumDeg = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#0F172A');
    }
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

  unmount() {
    this.destroyed = true;
    this.stopLoop();
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    if (this.mountEl) this.mountEl.innerHTML = '';
  }

  injectStyles() {
    if (document.getElementById('ll-styles')) return;
    const style = document.createElement('style');
    style.id = 'll-styles';
    style.textContent = `
      .ll-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 20%, #1E293B 0%, #0F172A 100%);
        color: #F8FAFC; user-select: none; -webkit-user-select: none;
        padding: 8px 12px 10px; box-sizing: border-box; gap: 8px; overflow: hidden;
      }
      .ll-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 44px;
      }
      .ll-modes {
        display: flex; gap: 6px; background: rgba(15,23,42,0.75);
        padding: 4px; border-radius: 16px; border: 2px solid #334155;
      }
      .ll-mode-btn {
        border: none; border-radius: 12px; padding: 7px 13px; font-size: 14px; font-weight: 900;
        background: transparent; color: #CBD5E1; cursor: pointer; font-family: inherit;
      }
      .ll-mode-btn.active { background: #EAB308; color: #0F172A; box-shadow: 0 3px 0 #A16207; }

      .ll-status {
        display: flex; align-items: center; gap: 8px;
        background: rgba(30,41,59,0.92); border: 2px solid #475569;
        border-radius: 16px; padding: 5px 12px;
      }
      .ll-hint { font-size: 14px; font-weight: 800; color: #FEF08A; }
      .ll-toggle-btn {
        border: 2px solid #64748B; border-radius: 11px; padding: 5px 10px;
        background: #334155; color: #F8FAFC; font-size: 12px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .ll-toggle-btn.active { background: #10B981; border-color: #059669; color: #FFFFFF; }

      .ll-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(180deg, #162033 0%, #0B1220 100%);
        border-radius: 22px; border: 3px solid #334155; overflow: hidden;
      }
      .ll-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      .ll-action-bar {
        display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
        background: rgba(30,41,59,0.92); border: 2.5px solid #475569;
        border-radius: 20px; padding: 8px 12px; min-height: 68px;
      }
      .ll-key-btn {
        display: flex; align-items: center; gap: 4px; border: 2.5px solid #475569;
        border-radius: 14px; padding: 4px 8px; background: #0F172A; cursor: pointer;
        transition: transform 0.12s;
      }
      .ll-key-btn.selected {
        border-color: #FACC15; background: #1E293B; transform: translateY(-2px);
        box-shadow: 0 3px 0 #A16207;
      }

      .ll-slider-wrap {
        display: flex; align-items: center; gap: 8px; background: #0F172A;
        border: 2px solid #475569; border-radius: 14px; padding: 6px 12px;
      }
      .ll-slider-label { font-size: 13px; font-weight: 900; color: #CBD5E1; white-space: nowrap; }
      .ll-range { width: 140px; accent-color: #FACC15; height: 28px; cursor: pointer; }

      .ll-turn-btn {
        border: 3px solid #FEF08A; border-radius: 16px; padding: 10px 22px;
        background: linear-gradient(180deg, #FACC15 0%, #CA8A04 100%);
        color: #0F172A; font-size: 16px; font-weight: 900; cursor: pointer; font-family: inherit;
        box-shadow: 0 4px 0 #854D0E; transition: transform 0.12s;
      }
      .ll-turn-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #854D0E; }
      .ll-turn-btn.ready {
        background: linear-gradient(180deg, #4ADE80 0%, #16A34A 100%);
        border-color: #DCFCE7; color: #FFFFFF; box-shadow: 0 4px 0 #166534;
      }
      .ll-next-btn {
        border: 3px solid #FFFFFF; border-radius: 16px; padding: 10px 22px;
        background: #22C55E; color: #FFFFFF; font-size: 16px; font-weight: 900;
        cursor: pointer; font-family: inherit; box-shadow: 0 4px 0 #15803D;
      }
      .ll-next-btn:active { transform: translateY(3px); }

      .ll-cut-col {
        display: flex; flex-direction: column; align-items: center; gap: 3px;
        background: #0F172A; border: 2px solid #475569; border-radius: 12px; padding: 4px 8px;
      }
      .ll-cut-row { display: flex; align-items: center; gap: 5px; }
      .ll-cut-btn {
        width: 30px; height: 30px; border: none; border-radius: 8px;
        background: #334155; color: #FFFFFF; font-size: 18px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .ll-cut-btn:active { background: #FACC15; color: #0F172A; }
      .ll-cut-val { font-size: 15px; font-weight: 900; color: #FACC15; min-width: 18px; text-align: center; }
      .ll-cut-title { font-size: 11px; font-weight: 800; color: #94A3B8; }

      .ll-wheel-pill {
        border: 2.5px solid #475569; border-radius: 14px; padding: 7px 14px;
        background: #0F172A; color: #F8FAFC; font-size: 14px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .ll-wheel-pill.active { border-color: #FACC15; background: #1E293B; box-shadow: 0 3px 0 #A16207; }
      .ll-wheel-pill.aligned { border-color: #4ADE80; color: #4ADE80; }

      @media (max-width: 640px) {
        .ll-root { padding: 6px; gap: 6px; }
        .ll-topbar { padding-left: 44px; padding-right: 44px; }
        .ll-mode-btn { padding: 5px 9px; font-size: 12px; }
        .ll-hint { font-size: 12px; }
        .ll-action-bar { padding: 6px; gap: 6px; min-height: 58px; }
        .ll-range { width: 105px; }
        .ll-turn-btn, .ll-next-btn { padding: 8px 14px; font-size: 14px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="ll-root">
        <div class="ll-topbar">
          <div class="ll-modes">
            <button class="ll-mode-btn active" data-mode="match" type="button">かぎ あわせ</button>
            <button class="ll-mode-btn" data-mode="craft" type="button">かぎ つくり</button>
            <button class="ll-mode-btn" data-mode="safe" type="button">ダイヤル きんこ</button>
          </div>
          <div class="ll-status">
            <span class="ll-hint" id="ll-hint">カギを さしこんで ピンを そろえよう！</span>
            <button class="ll-toggle-btn active" id="ll-cutaway-btn" type="button">なかを みる</button>
          </div>
        </div>

        <div class="ll-stage-wrap">
          <svg class="ll-svg" id="ll-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
            ${buildLockDefsSvg()}
            <g id="ll-scene"></g>
          </svg>
        </div>

        <div class="ll-action-bar" id="ll-action-bar"></div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#ll-svg');
    this.sceneEl = this.mountEl.querySelector('#ll-scene');
    this.hintEl = this.mountEl.querySelector('#ll-hint');
    this.cutawayBtn = this.mountEl.querySelector('#ll-cutaway-btn');
    this.actionBar = this.mountEl.querySelector('#ll-action-bar');

    this.mountEl.querySelectorAll('.ll-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.stageIdx = 0;
        this.mountEl.querySelectorAll('.ll-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        this.loadStage();
      });
    });

    this.cutawayBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playMetalClick();
      this.cutaway = !this.cutaway;
      this.cutawayBtn.classList.toggle('active', this.cutaway);
      this.renderScene();
    });

    this.svgEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  getStage() {
    if (this.mode === 'match') return MATCH_STAGES[this.stageIdx % MATCH_STAGES.length];
    if (this.mode === 'craft') return CRAFT_STAGES[this.stageIdx % CRAFT_STAGES.length];
    return SAFE_STAGES[this.stageIdx % SAFE_STAGES.length];
  }

  getActiveKeySpec() {
    const st = this.getStage();
    if (this.mode === 'match') {
      return st.keys[this.selectedKeyIdx % st.keys.length];
    }
    return { id: 'custom', label: '', cuts: this.customCuts, fillId: 'll-key-gold', bowShape: 'classic' };
  }

  loadStage() {
    this.unlocked = false;
    this.boltOpen = 0;
    this.jamShake = 0;
    this.keyInsert = 0;
    this.selectedKeyIdx = 0;
    this.lastPinHeights = [];

    const st = this.getStage();
    if (this.mode === 'craft') {
      this.customCuts = st.target.map(() => 3);
      this.keyInsert = 0.0;
      this.hintEl.textContent = `${st.name}：やまを けずって さしこもう！`;
    } else if (this.mode === 'match') {
      this.hintEl.textContent = `${st.name}：カギを えらんで みぎへ さしこもう！`;
    } else {
      this.activeWheelIdx = 0;
      this.wheelNums = st.wheels.map((w, i) => (w.targetNum + 4 + i * 3) % 12);
      this.safeHandleTurn = 0;
      this.hintEl.textContent = `${st.name}：ダイヤルを まわして みぞを そろえよう！`;
    }

    this.renderActionBar();
    this.renderScene();
  }

  isPinAligned() {
    if (this.keyInsert < 0.97) return false;
    const target = this.getStage().target;
    const cuts = this.getActiveKeySpec().cuts;
    return target.every((h, i) => cuts[i] === h);
  }

  isSafeAligned() {
    const st = this.getStage();
    return st.wheels.every((w, i) => this.wheelNums[i] === w.targetNum);
  }

  renderActionBar() {
    if (this.unlocked) {
      this.actionBar.innerHTML = `
        <span style="font-size:17px;font-weight:900;color:#4ADE80;">ガチャン！ かぎが あいたよ！</span>
        <button class="ll-next-btn" id="ll-next-btn" type="button">つぎの かぎへ</button>
      `;
      this.actionBar.querySelector('#ll-next-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        this.stageIdx++;
        this.loadStage();
      });
      return;
    }

    if (this.mode === 'match') {
      const st = this.getStage();
      const ready = this.isPinAligned();
      this.actionBar.innerHTML = `
        ${st.keys.map((k, idx) => `
          <button class="ll-key-btn ${idx === this.selectedKeyIdx ? 'selected' : ''}" data-kidx="${idx}" type="button">
            ${renderKeyThumbSvg(k.cuts, k.fillId, k.bowShape, k.label)}
          </button>
        `).join('')}
        <div class="ll-slider-wrap">
          <span class="ll-slider-label">さしこむ</span>
          <input class="ll-range" id="ll-insert-range" type="range" min="0" max="100" value="${Math.round(this.keyInsert * 100)}">
        </div>
        <button class="ll-turn-btn ${ready ? 'ready' : ''}" id="ll-turn-btn" type="button">まわす！</button>
      `;

      this.actionBar.querySelectorAll('.ll-key-btn').forEach((btn) => {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.unlock();
          this.playPinClink(1.1);
          this.selectedKeyIdx = Number(btn.dataset.kidx);
          this.keyInsert = 0;
          this.lastPinHeights = [];
          this.renderActionBar();
          this.renderScene();
        });
      });

      const range = this.actionBar.querySelector('#ll-insert-range');
      range.addEventListener('input', () => {
        this.sound.unlock();
        this.setKeyInsert(Number(range.value) / 100);
      });

      this.actionBar.querySelector('#ll-turn-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.attemptTurnCylinder();
      });
      return;
    }

    if (this.mode === 'craft') {
      const ready = this.isPinAligned();
      this.actionBar.innerHTML = `
        ${this.customCuts.map((val, i) => `
          <div class="ll-cut-col">
            <span class="ll-cut-title">ピン ${i + 1}</span>
            <div class="ll-cut-row">
              <button class="ll-cut-btn" data-pin="${i}" data-dir="-1" type="button">−</button>
              <span class="ll-cut-val">${val}</span>
              <button class="ll-cut-btn" data-pin="${i}" data-dir="1" type="button">＋</button>
            </div>
          </div>
        `).join('')}
        <div class="ll-slider-wrap">
          <span class="ll-slider-label">さす</span>
          <input class="ll-range" id="ll-insert-range" type="range" min="0" max="100" value="${Math.round(this.keyInsert * 100)}">
        </div>
        <button class="ll-turn-btn ${ready ? 'ready' : ''}" id="ll-turn-btn" type="button">まわす！</button>
      `;

      this.actionBar.querySelectorAll('.ll-cut-btn').forEach((btn) => {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.unlock();
          const idx = Number(btn.dataset.pin);
          const dir = Number(btn.dataset.dir);
          const next = Math.max(1, Math.min(5, this.customCuts[idx] + dir));
          if (next !== this.customCuts[idx]) {
            this.customCuts[idx] = next;
            this.playFileScrape();
            this.renderActionBar();
            this.renderScene();
          }
        });
      });

      const range = this.actionBar.querySelector('#ll-insert-range');
      range.addEventListener('input', () => {
        this.sound.unlock();
        this.setKeyInsert(Number(range.value) / 100);
      });

      this.actionBar.querySelector('#ll-turn-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.attemptTurnCylinder();
      });
      return;
    }

    // Safe dial mode controls
    const st = this.getStage();
    const allAligned = this.isSafeAligned();
    this.actionBar.innerHTML = `
      ${st.wheels.map((w, i) => {
        const aligned = this.wheelNums[i] === w.targetNum;
        return `
          <button class="ll-wheel-pill ${i === this.activeWheelIdx ? 'active' : ''} ${aligned ? 'aligned' : ''}" data-widx="${i}" type="button">
            わ ${i + 1} (${this.wheelNums[i]})
          </button>
        `;
      }).join('')}
      <button class="ll-cut-btn" style="width:44px;height:40px;" id="ll-dial-ccw" type="button">↺</button>
      <button class="ll-cut-btn" style="width:44px;height:40px;" id="ll-dial-cw" type="button">↻</button>
      <button class="ll-turn-btn ${allAligned ? 'ready' : ''}" id="ll-safe-open" type="button">あける！</button>
    `;

    this.actionBar.querySelectorAll('.ll-wheel-pill').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.playDialTick(false);
        this.activeWheelIdx = Number(btn.dataset.widx);
        this.renderActionBar();
        this.renderScene();
      });
    });

    this.actionBar.querySelector('#ll-dial-ccw').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.stepSafeWheel(-1);
    });
    this.actionBar.querySelector('#ll-dial-cw').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.stepSafeWheel(1);
    });
    this.actionBar.querySelector('#ll-safe-open').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.attemptOpenSafe();
    });
  }

  setKeyInsert(val) {
    this.keyInsert = Math.max(0, Math.min(1, val));
    const st = this.getStage();
    const cuts = this.getActiveKeySpec().cuts;
    const pinCount = st.target.length;
    const maxPull = 260;
    const shiftX = -(1 - this.keyInsert) * maxPull;

    // Detect pins jumping over ridges to play authentic metallic clinks!
    let clinked = false;
    for (let i = 0; i < pinCount; i++) {
      const px = getPinSlotX(i, pinCount);
      const surfY = sampleKeySurfaceY(px, shiftX, cuts);
      const prevY = this.lastPinHeights[i];
      if (prevY !== undefined && Math.abs(surfY - prevY) > 6) {
        clinked = true;
      }
      this.lastPinHeights[i] = surfY;
    }
    if (clinked) {
      this.playPinClink(0.85 + this.keyInsert * 0.45);
    }

    const turnBtn = this.actionBar.querySelector('#ll-turn-btn');
    if (turnBtn) turnBtn.classList.toggle('ready', this.isPinAligned());

    const range = this.actionBar.querySelector('#ll-insert-range');
    if (range && document.activeElement !== range) {
      range.value = String(Math.round(this.keyInsert * 100));
    }

    if (this.isPinAligned()) {
      this.hintEl.textContent = 'ピンが 一直線に そろった！「まわす！」を おそう！';
    }
    this.renderScene();
  }

  attemptTurnCylinder() {
    if (this.unlocked) return;
    if (this.keyInsert < 0.95) {
      this.hintEl.textContent = 'もっと おくまで カギを さしこもう！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    if (!this.isPinAligned()) {
      this.hintEl.textContent = 'ピンが せんに そろっていないから ひっかかるよ！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    // SUCCESS! Smoothly slide deadbolt open!
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ カンヌキが ひっこんで あいたよ！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.renderActionBar();
    this.ensureLoop();
  }

  stepSafeWheel(delta) {
    if (this.unlocked) return;
    const st = this.getStage();
    const idx = this.activeWheelIdx;
    this.wheelNums[idx] = (this.wheelNums[idx] + delta + 12) % 12;
    const hit = this.wheelNums[idx] === st.wheels[idx].targetNum;
    this.playDialTick(hit);
    if (hit) {
      this.hintEl.textContent = `コトン！ わ ${idx + 1} の みぞが ピタッと あったよ！`;
      // Auto-advance to next unaligned wheel for super kid-friendly flow
      const nextUnaligned = st.wheels.findIndex((w, i) => this.wheelNums[i] !== w.targetNum);
      if (nextUnaligned !== -1) {
        this.activeWheelIdx = nextUnaligned;
      } else {
        this.hintEl.textContent = 'ぜんぶの みぞが そろった！「あける！」を おそう！';
      }
    }
    this.renderActionBar();
    this.renderScene();
  }

  attemptOpenSafe() {
    if (this.unlocked) return;
    if (!this.isSafeAligned()) {
      this.hintEl.textContent = 'うえの みぞが ぜんぶ まっすぐ そろうまで まわそう！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ きんこの とびらが あいたよ！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.renderActionBar();
    this.ensureLoop();
  }

  getSvgPoint(e) {
    const rect = this.svgEl.getBoundingClientRect();
    const aspectView = 800 / 480;
    const aspectRect = rect.width / Math.max(1, rect.height);
    let x, y;
    if (aspectRect > aspectView) {
      const rw = rect.height * aspectView;
      x = ((e.clientX - rect.left - (rect.width - rw) / 2) / rw) * 800;
      y = ((e.clientY - rect.top) / rect.height) * 480;
    } else {
      const rh = rect.width / aspectView;
      x = ((e.clientX - rect.left) / rect.width) * 800;
      y = ((e.clientY - rect.top - (rect.height - rh) / 2) / rh) * 480;
    }
    return { x, y };
  }

  handlePointerDown(e) {
    if (this.unlocked) return;
    e.preventDefault();
    this.sound.unlock();
    const pt = this.getSvgPoint(e);

    if (this.mode === 'safe') {
      // Check if grabbing the chrome dial on left (cx=230, cy=245, r=125)
      const dist = Math.hypot(pt.x - 230, pt.y - 245);
      if (dist <= 135) {
        this.draggingDial = true;
        this.lastDialAngle = Math.atan2(pt.y - 245, pt.x - 230);
        this.dialAccumDeg = 0;
      }
      return;
    }

    // In match / craft mode: drag anywhere on key/cylinder horizontally to slide the key smoothly!
    this.draggingKey = true;
    this.dragOriginX = pt.x;
    this.dragOriginInsert = this.keyInsert;
  }

  handlePointerMove(e) {
    if (this.draggingKey) {
      e.preventDefault();
      const pt = this.getSvgPoint(e);
      const deltaInsert = (pt.x - this.dragOriginX) / 260;
      this.setKeyInsert(this.dragOriginInsert + deltaInsert);
      return;
    }
    if (this.draggingDial) {
      e.preventDefault();
      const pt = this.getSvgPoint(e);
      const ang = Math.atan2(pt.y - 245, pt.x - 230);
      let diff = ((ang - this.lastDialAngle) * 180) / Math.PI;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      this.lastDialAngle = ang;
      this.dialAccumDeg += diff;
      if (Math.abs(this.dialAccumDeg) >= 26) {
        const step = this.dialAccumDeg > 0 ? 1 : -1;
        this.dialAccumDeg -= step * 26;
        this.stepSafeWheel(step);
      }
    }
  }

  handlePointerUp() {
    this.draggingKey = false;
    this.draggingDial = false;
  }

  needsLoop() {
    if (this.jamShake > 0.01) return true;
    if (this.unlocked && this.mode !== 'safe' && this.boltOpen < 1) return true;
    if (this.unlocked && this.mode === 'safe' && this.safeHandleTurn < 1) return true;
    return false;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        if (this.jamShake > 0) this.jamShake = Math.max(0, this.jamShake - dt * 4.2);
        if (this.unlocked && this.mode !== 'safe' && this.boltOpen < 1) {
          this.boltOpen = Math.min(1, this.boltOpen + dt * 2.4);
        }
        if (this.unlocked && this.mode === 'safe' && this.safeHandleTurn < 1) {
          this.safeHandleTurn = Math.min(1, this.safeHandleTurn + dt * 2.0);
        }
        this.renderScene();
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

  renderScene() {
    if (this.mode === 'safe') {
      this.renderSafeScene();
    } else {
      this.renderCylinderScene();
    }
  }

  renderCylinderScene() {
    const st = this.getStage();
    const target = st.target;
    const keySpec = this.getActiveKeySpec();
    const pinCount = target.length;
    const maxPull = 260;
    const shiftX = -(1 - this.keyInsert) * maxPull;
    const aligned = this.isPinAligned();
    const shakeY = this.jamShake > 0 ? Math.sin(this.jamShake * Math.PI * 6) * 4 : 0;

    // Deadbolt retracts smoothly to the left when unlocked
    const boltRetract = this.boltOpen * 108;
    const camAngle = this.boltOpen * 90;

    // Build all pin stacks (spring + red driver pin + gold key pin)
    let pinsSvg = '';
    for (let i = 0; i < pinCount; i++) {
      const cx = getPinSlotX(i, pinCount);
      const surfY = sampleKeySurfaceY(cx, shiftX, keySpec.cuts);
      const keyPinH = PIN_CAL.keyPinLen(target[i]);
      const keyPinBotY = surfY;
      const keyPinTopY = keyPinBotY - keyPinH;
      const driverBotY = keyPinTopY - 1.5;
      const driverTopY = driverBotY - PIN_CAL.driverLen;

      const isThisAligned = Math.abs(keyPinTopY - PIN_CAL.shearY) <= 2.2;
      const isJammed = this.jamShake > 0 && !isThisAligned;

      // Bore shaft cavity
      pinsSvg += `
        <rect x="${cx - 16}" y="${PIN_CAL.chamberTopY}" width="32" height="${PIN_CAL.plugBottomY - PIN_CAL.chamberTopY - 16}" rx="4" fill="#0B1220" stroke="#334155" stroke-width="1.5"/>
        <!-- Top brass plug cap -->
        <rect x="${cx - 17}" y="${PIN_CAL.chamberTopY - 8}" width="34" height="10" rx="3" fill="url(#ll-brass-body)" stroke="#78500D" stroke-width="1.5"/>
        <!-- Coiled helical steel spring -->
        <path d="${buildSpringPath(cx, PIN_CAL.chamberTopY + 3, driverTopY, 6, 9)}" stroke="#CBD5E1" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
        <!-- Red anodized driver pin -->
        <rect x="${cx - 13}" y="${driverTopY.toFixed(1)}" width="26" height="${PIN_CAL.driverLen}" rx="4"
          fill="url(#ll-driver-pin)" stroke="${isJammed ? '#FACC15' : '#450A0A'}" stroke-width="${isJammed ? '3' : '1.8'}"/>
        <!-- Gold key pin with chamfered conical bottom tip -->
        <path d="M ${cx - 13} ${keyPinTopY.toFixed(1)} H ${cx + 13} V ${(keyPinBotY - 7).toFixed(1)} L ${cx + 5} ${keyPinBotY.toFixed(1)} H ${cx - 5} L ${cx - 13} ${(keyPinBotY - 7).toFixed(1)} Z"
          fill="url(#ll-key-pin)" stroke="${isThisAligned ? '#4ADE80' : '#78350F'}" stroke-width="${isThisAligned ? '2.8' : '1.8'}"/>
        <!-- Pin number tag above lock -->
        <circle cx="${cx}" cy="64" r="13" fill="${isThisAligned ? '#22C55E' : '#1E293B'}" stroke="${isThisAligned ? '#DCFCE7' : '#64748B'}" stroke-width="2"/>
        <text x="${cx}" y="69" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${i + 1}</text>
      `;
    }

    const strokeCol = keySpec.fillId === 'll-key-silver' ? '#475569' : (keySpec.fillId === 'll-key-copper' ? '#7C2D12' : '#78500D');
    const lockLeftX = getKeyShoulderX(pinCount) + 4;

    this.sceneEl.innerHTML = `
      <!-- Wooden door jamb & strike plate on right -->
      <rect x="650" y="34" width="128" height="412" rx="14" fill="url(#ll-door-wood)" stroke="#451A03" stroke-width="4"/>
      <!-- Steel strike plate cavity where deadbolt locks into -->
      <rect x="646" y="182" width="20" height="148" rx="4" fill="url(#ll-chrome)" stroke="#334155" stroke-width="2.5"/>
      <rect x="664" y="206" width="84" height="100" rx="10" fill="#0F172A" stroke="#475569" stroke-width="3"/>
      <text x="716" y="156" text-anchor="middle" font-size="15" font-weight="900" fill="#FEF3C7" font-family="sans-serif">ドアわく</text>

      <!-- Heavy Chrome Deadbolt (slides out of strike plate when unlocked!) -->
      <g transform="translate(${(-boltRetract).toFixed(1)} 0)">
        <rect x="556" y="218" width="182" height="76" rx="10" fill="url(#ll-chrome)" stroke="#334155" stroke-width="3.5"/>
        <line x1="570" y1="234" x2="722" y2="234" stroke="#FFFFFF" stroke-width="4" opacity="0.7" stroke-linecap="round"/>
        <line x1="570" y1="278" x2="722" y2="278" stroke="#475569" stroke-width="3" opacity="0.5" stroke-linecap="round"/>
        <!-- Hardened steel anti-saw core pin inside deadbolt -->
        <rect x="605" y="248" width="102" height="16" rx="8" fill="#64748B" stroke="#1E293B" stroke-width="2"/>
      </g>

      <!-- Lock Cylinder Outer Brass Housing -->
      <rect x="${lockLeftX}" y="80" width="${574 - lockLeftX}" height="296" rx="18" fill="url(#ll-brass-body)" stroke="#78500D" stroke-width="4"/>
      <!-- Machined bevel highlight -->
      <rect x="${lockLeftX + 6}" y="86" width="${562 - lockLeftX}" height="284" rx="14" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2.5"/>

      <!-- Tailpiece Cam Actuator (rotates to pull deadbolt!) -->
      <g transform="translate(556 276) rotate(${camAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="24" fill="url(#ll-steel-dark)" stroke="#94A3B8" stroke-width="3"/>
        <rect x="-10" y="-44" width="20" height="44" rx="8" fill="url(#ll-chrome)" stroke="#334155" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="8" fill="#FACC15"/>
      </g>

      <!-- Rotating Cylinder Plug (shakes slightly on bind, glows on unlock) -->
      <g transform="translate(0 ${shakeY.toFixed(1)})">
        <rect x="${lockLeftX + 6}" y="${PIN_CAL.shearY}" width="${536 - lockLeftX}" height="${PIN_CAL.plugBottomY - PIN_CAL.shearY}" rx="8"
          fill="url(#ll-brass-plug)" stroke="${this.unlocked ? '#4ADE80' : '#78500D'}" stroke-width="3"/>
        <!-- Dark keyway channel inside plug -->
        <rect x="${lockLeftX + 4}" y="248" width="${518 - lockLeftX}" height="82" rx="6" fill="#0F172A" opacity="0.82"/>
      </g>

      <!-- Cutaway Pin Chambers & Live Physics Pins -->
      ${this.cutaway ? `
        ${pinsSvg}
        <!-- Shear Line visual guide (glows crisp emerald when every pin aligns!) -->
        <line x1="${lockLeftX + 2}" y1="${PIN_CAL.shearY}" x2="544" y2="${PIN_CAL.shearY}"
          stroke="${aligned ? '#4ADE80' : '#38BDF8'}" stroke-width="${aligned ? '4.5' : '2.2'}"
          stroke-dasharray="${aligned ? 'none' : '10 6'}" opacity="${aligned ? '0.96' : '0.68'}"/>
        <rect x="42" y="${PIN_CAL.shearY - 14}" width="118" height="28" rx="14" fill="${aligned ? '#16A34A' : '#1E293B'}" stroke="${aligned ? '#DCFCE7' : '#38BDF8'}" stroke-width="2"/>
        <text x="101" y="${PIN_CAL.shearY + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${aligned ? 'そろった！' : 'シアライン'}</text>
      ` : `
        <!-- Solid brass outer faceplate when cutaway is OFF -->
        <rect x="${lockLeftX + 4}" y="84" width="${566 - lockLeftX}" height="288" rx="16" fill="url(#ll-brass-body)" stroke="#78500D" stroke-width="3.5"/>
        <circle cx="400" cy="228" r="70" fill="url(#ll-brass-plug)" stroke="#78500D" stroke-width="4"/>
        <text x="400" y="138" text-anchor="middle" font-size="18" font-weight="900" fill="#78350F" font-family="sans-serif">YGEN LOCK CO.</text>
      `}

      <!-- Sliding Key Blade (always draggable!) -->
      <g transform="translate(0 ${shakeY.toFixed(1)})" style="cursor:ew-resize;">
        ${renderKeySvg(keySpec.cuts, shiftX, { fillId: keySpec.fillId, bowShape: keySpec.bowShape, label: keySpec.label, stroke: strokeCol })}
      </g>

      <!-- Right-arrow drag affordance when key is still outside -->
      ${this.keyInsert < 0.2 && !this.unlocked ? `
        <g opacity="0.9">
          <rect x="82" y="368" width="166" height="36" rx="18" fill="#FACC15" stroke="#854D0E" stroke-width="2.5"/>
          <text x="165" y="392" text-anchor="middle" font-size="15" font-weight="900" fill="#0F172A" font-family="sans-serif">みぎへ さしこもう →</text>
        </g>
      ` : ''}

      <!-- Status plaque at bottom right -->
      <rect x="336" y="400" width="236" height="44" rx="14" fill="${this.unlocked ? '#16A34A' : '#1E293B'}" stroke="${this.unlocked ? '#DCFCE7' : '#475569'}" stroke-width="2.5"/>
      <text x="454" y="428" text-anchor="middle" font-size="18" font-weight="900" fill="#FFFFFF" font-family="sans-serif">
        ${this.unlocked ? 'かいじょう（オープン！）' : 'ロックちゅう'}
      </text>
    `;
  }

  renderSafeScene() {
    const st = this.getStage();
    const allAligned = this.isSafeAligned();
    const boltSlide = this.safeHandleTurn * 72;
    const handleDeg = this.safeHandleTurn * 90;
    const shakeX = this.jamShake > 0 ? Math.sin(this.jamShake * Math.PI * 6) * 5 : 0;

    // Left: Knurled Chrome Combination Dial (cx=230, cy=245)
    const activeNum = this.wheelNums[this.activeWheelIdx] || 0;
    const dialDeg = activeNum * 30;
    const tickMarks = Array.from({ length: 12 }, (_, n) => {
      const a = ((n * 30 - 90) * Math.PI) / 180;
      const x1 = 230 + Math.cos(a) * 92;
      const y1 = 245 + Math.sin(a) * 92;
      const x2 = 230 + Math.cos(a) * 106;
      const y2 = 245 + Math.sin(a) * 106;
      const tx = 230 + Math.cos(a) * 76;
      const ty = 245 + Math.sin(a) * 76 + 6;
      return `
        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round"/>
        <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="16" font-weight="900" fill="#F8FAFC" font-family="sans-serif">${n}</text>
      `;
    }).join('');

    // Right: Internal Cutaway Wheel Pack (cx=535, cy=255)
    // Each wheel has a U-shaped gate notch at top (12 o'clock) when wheelNums[i] === targetNum!
    const wCx = 535;
    const wCy = 255;
    const wheelsSvg = st.wheels.map((w, i) => {
      const diffSteps = (this.wheelNums[i] - w.targetNum + 12) % 12;
      const rotDeg = diffSteps * 30;
      const isSelected = i === this.activeWheelIdx;
      const isHit = diffSteps === 0;
      const r = w.radius;
      return `
        <g transform="translate(${wCx} ${wCy}) rotate(${rotDeg})">
          <circle cx="0" cy="0" r="${r}" fill="url(#${w.fill})" stroke="${isSelected ? '#FFFFFF' : '#0F172A'}" stroke-width="${isSelected ? '4.5' : '3'}"/>
          <!-- Machined ring groove -->
          <circle cx="0" cy="0" r="${(r - 12).toFixed(1)}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2" stroke-dasharray="8 6"/>
          <!-- Gate Notch at 12 o'clock (aligns with top fence when rotDeg === 0!) -->
          <rect x="-12" y="${(-r - 2).toFixed(1)}" width="24" height="24" rx="4" fill="#0F172A" stroke="${isHit ? '#4ADE80' : '#FACC15'}" stroke-width="2.5"/>
        </g>
      `;
    }).join('');

    // Locking fence lever above wheel pack drops into the aligned notches!
    const fenceDropY = allAligned ? (this.unlocked ? 22 : 14) : 0;

    this.sceneEl.innerHTML = `
      <!-- Heavy Safe Steel Vault Door -->
      <rect x="34" y="28" width="732" height="424" rx="26" fill="url(#ll-safe-door)" stroke="#64748B" stroke-width="5"/>
      <rect x="50" y="44" width="700" height="392" rx="18" fill="none" stroke="#334155" stroke-width="3"/>

      <!-- 3 Giant Chrome Vault Locking Bolts on right edge -->
      ${[126, 246, 366].map((by) => `
        <g transform="translate(${(-boltSlide).toFixed(1)} 0)">
          <rect x="698" y="${by - 22}" width="92" height="44" rx="10" fill="url(#ll-chrome)" stroke="#334155" stroke-width="3"/>
          <line x1="708" y1="${by - 8}" x2="778" y2="${by - 8}" stroke="#FFFFFF" stroke-width="3.5" opacity="0.7"/>
        </g>
      `).join('')}

      <!-- Left: Chrome Combination Dial (drag circularly!) -->
      <g transform="translate(${shakeX.toFixed(1)} 0)" style="cursor:grab;">
        <circle cx="230" cy="245" r="126" fill="url(#ll-chrome)" stroke="#334155" stroke-width="4"/>
        <!-- Top red index pointer -->
        <polygon points="230,114 218,94 242,94" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
        <!-- Rotating black anodized dial face -->
        <g transform="rotate(${(-dialDeg)} 230 245)">
          <circle cx="230" cy="245" r="110" fill="#0F172A" stroke="#475569" stroke-width="3"/>
          ${tickMarks}
          <!-- Center knurled chrome knob -->
          <circle cx="230" cy="245" r="44" fill="url(#ll-chrome)" stroke="#475569" stroke-width="3"/>
          <circle cx="230" cy="245" r="30" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="230" cy="224" r="5" fill="#FACC15"/>
        </g>
        <text x="230" y="406" text-anchor="middle" font-size="16" font-weight="900" fill="#CBD5E1" font-family="sans-serif">わ ${this.activeWheelIdx + 1}：いま「${activeNum}」</text>
      </g>

      <!-- Right: Cutaway Safe Mechanism Chamber (or closed vault handle when cutaway OFF) -->
      ${this.cutaway ? `
        <rect x="382" y="70" width="306" height="346" rx="20" fill="#0B1220" stroke="#475569" stroke-width="3"/>
        <text x="535" y="96" text-anchor="middle" font-size="14" font-weight="900" fill="#94A3B8" font-family="sans-serif">きんこの なか（みぞを うえに そろえよう）</text>
        ${wheelsSvg}
        <!-- Center spindle axle -->
        <circle cx="${wCx}" cy="${wCy}" r="22" fill="url(#ll-chrome)" stroke="#334155" stroke-width="3"/>
        <circle cx="${wCx}" cy="${wCy}" r="8" fill="#0F172A"/>
        <!-- Spring-loaded Locking Fence Bar at 12 o'clock -->
        <g transform="translate(0 ${fenceDropY})">
          <rect x="${wCx - 10}" y="106" width="20" height="26" rx="4" fill="${allAligned ? '#4ADE80' : '#EF4444'}" stroke="#FFFFFF" stroke-width="2.5"/>
          <rect x="${wCx - 66}" y="100" width="132" height="12" rx="6" fill="url(#ll-chrome)" stroke="#334155" stroke-width="2"/>
        </g>
      ` : `
        <!-- Vault Spoke Wheel Handle -->
        <g transform="translate(535 245) rotate(${handleDeg.toFixed(1)})">
          <circle cx="0" cy="0" r="106" fill="none" stroke="url(#ll-chrome)" stroke-width="18"/>
          <line x1="-100" y1="0" x2="100" y2="0" stroke="url(#ll-chrome)" stroke-width="16" stroke-linecap="round"/>
          <line x1="0" y1="-100" x2="0" y2="100" stroke="url(#ll-chrome)" stroke-width="16" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="34" fill="url(#ll-chrome)" stroke="#334155" stroke-width="4"/>
        </g>
      `}

      <!-- Treasure reveal banner when unlocked -->
      ${this.unlocked ? `
        <g transform="translate(535 245)">
          <rect x="-126" y="-56" width="252" height="112" rx="22" fill="#16A34A" stroke="#FEF08A" stroke-width="4"/>
          <polygon points="-64,-12 -52,-36 -40,-12 -64,-12" fill="#FACC15"/>
          <polygon points="40,-12 52,-36 64,-12 40,-12" fill="#FACC15"/>
          <polygon points="-24,6 0,-32 24,6" fill="#38BDF8" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
          <text x="0" y="38" text-anchor="middle" font-size="22" font-weight="900" fill="#FFFFFF" font-family="sans-serif">きんこ オープン！</text>
        </g>
      ` : ''}
    `;
  }

  /* =========================================================================
     Authentic Metallic Lock Web Audio Synthesizers
     ========================================================================= */

  playPinClink(pitch = 1.0) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1650 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(920 * pitch, now + 0.032);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g);
    g.connect(this.sound.dryBus);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  playFileScrape() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2800, now);
    bp.Q.value = 5.0;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    src.connect(bp); bp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.09);
  }

  playDialTick(isGateHit = false) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = isGateHit ? 'sine' : 'square';
    osc.frequency.setValueAtTime(isGateHit ? 460 : 1200, now);
    osc.frequency.exponentialRampToValueAtTime(isGateHit ? 140 : 600, now + (isGateHit ? 0.11 : 0.025));
    g.gain.setValueAtTime(isGateHit ? 0.34 : 0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (isGateHit ? 0.12 : 0.03));
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now);
    osc.stop(now + (isGateHit ? 0.13 : 0.035));
  }

  playJamClunk() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playBoltUnlock() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    // Two-stage heavy deadbolt mechanical "GA-CHAN!"
    [0, 0.09].forEach((offset, idx) => {
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 320 : 540, now);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 110 : 210, now + 0.12);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now);
      osc.stop(now + 0.15);
    });
  }
}
