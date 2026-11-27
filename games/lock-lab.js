import {
  FONT_ROUND,
  buildLockDefsSvg,
  PIN_CAL,
  buildSpringPath,
  getPinSlotX,
  getKeyShoulderX,
  sampleKeySurfaceY,
  renderKeySvg,
  renderBenchKeySvg,
  MATCH_STAGES,
  CRAFT_STAGES,
  SAFE_STAGES
} from './lock-lab-assets.js';

export default class LockLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'match';
    this.stageIdx = 0;
    this.cutaway = true;

    this.selectedKeyIdx = 0;
    this.customCuts = [3, 3, 3];
    this.keyInsert = 0;
    this.boltOpen = 0;
    this.unlocked = false;
    this.jamShake = 0;
    this.lastPinHeights = [];
    this.sparks = [];

    this.draggingKey = false;
    this.dragOriginX = 0;
    this.dragOriginInsert = 0;
    this.dragMoved = false;

    this.activeWheelIdx = 0;
    this.wheelNums = [0, 0, 0];
    this.safeHandleTurn = 0;
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
    const old = document.getElementById('ll-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'll-styles';
    style.textContent = `
      .ll-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #266867; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
        transition: background 0.35s ease;
      }
      .ll-root.is-safe { background: #EAE2D3; color: #3D405B; }

      .ll-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .ll-modes {
        display: flex; gap: 4px; background: rgba(255,255,255,0.18); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.28);
      }
      .ll-root.is-safe .ll-modes { background: rgba(61,64,91,0.09); border-color: rgba(61,64,91,0.14); }
      .ll-mode-btn {
        border: none; border-radius: 999px; padding: 6px 15px; font-size: 14px; font-weight: 800;
        background: transparent; color: rgba(255,255,255,0.88); cursor: pointer; font-family: inherit;
        transition: background 0.18s ease, color 0.18s ease;
      }
      .ll-root.is-safe .ll-mode-btn { color: #5C627A; }
      .ll-mode-btn.active { background: #FFFFFF; color: #266867; box-shadow: 0 3px 0 rgba(0,0,0,0.12); }
      .ll-root.is-safe .ll-mode-btn.active { background: #FFFFFF; color: #3D405B; }

      .ll-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.3);
        border-radius: 999px; padding: 5px 14px;
      }
      .ll-root.is-safe .ll-pill { background: rgba(255,255,255,0.72); border-color: rgba(255,255,255,0.9); }
      .ll-hint { font-size: 14px; font-weight: 800; letter-spacing: 0.02em; }

      .ll-eye-btn {
        border: none; border-radius: 999px; padding: 4px 11px;
        background: rgba(255,255,255,0.25); color: inherit; font-size: 12px; font-weight: 800;
        cursor: pointer; font-family: inherit;
      }
      .ll-eye-btn.active { background: #34D399; color: #FFFFFF; box-shadow: 0 2px 0 #059669; }

      .ll-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .ll-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .ll-root { padding: 8px 6px; }
        .ll-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
        .ll-mode-btn { padding: 5px 10px; font-size: 12px; }
        .ll-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="ll-root" id="ll-root">
        <div class="ll-topbar">
          <div class="ll-modes">
            <button class="ll-mode-btn active" data-mode="match" type="button">かぎ あわせ</button>
            <button class="ll-mode-btn" data-mode="craft" type="button">かぎ つくり</button>
            <button class="ll-mode-btn" data-mode="safe" type="button">ダイヤル きんこ</button>
          </div>
          <div class="ll-pill">
            <span class="ll-hint" id="ll-hint">カギを みぎへ スライドしよう</span>
            <button class="ll-eye-btn active" id="ll-cutaway-btn" type="button">なか</button>
          </div>
        </div>

        <div class="ll-stage-wrap">
          <svg class="ll-svg" id="ll-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildLockDefsSvg()}
            <g id="ll-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.rootEl = this.mountEl.querySelector('#ll-root');
    this.svgEl = this.mountEl.querySelector('#ll-svg');
    this.sceneEl = this.mountEl.querySelector('#ll-scene');
    this.hintEl = this.mountEl.querySelector('#ll-hint');
    this.cutawayBtn = this.mountEl.querySelector('#ll-cutaway-btn');

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
    if (this.mode === 'match') return st.keys[this.selectedKeyIdx % st.keys.length];
    return { id: 'custom', label: '', cuts: this.customCuts, fillId: 'll-key-gold', bowShape: 'classic' };
  }

  loadStage() {
    const isSafe = this.mode === 'safe';
    this.rootEl.classList.toggle('is-safe', isSafe);
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground(isSafe ? '#EAE2D3' : '#266867');
    }

    this.unlocked = false;
    this.boltOpen = 0;
    this.jamShake = 0;
    this.keyInsert = this.mode === 'craft' ? 1.0 : 0;
    this.selectedKeyIdx = 0;
    this.lastPinHeights = [];
    this.sparks = [];

    const st = this.getStage();
    if (this.mode === 'craft') {
      this.customCuts = st.target.map((t) => (t === 3 ? 2 : 3));
      this.hintEl.textContent = 'ピンを せんに そろえよう';
    } else if (this.mode === 'match') {
      this.hintEl.textContent = 'あう カギを みぎへ さしこもう';
    } else {
      this.activeWheelIdx = 0;
      this.wheelNums = st.wheels.map((w, i) => (w.targetNum + 4 + i * 3) % 12);
      this.safeHandleTurn = 0;
      this.hintEl.textContent = 'ダイヤルを まわして みぞを そろえよう';
    }
    this.renderScene();
  }

  isPinAligned() {
    if (this.keyInsert < 0.96) return false;
    const target = this.getStage().target;
    const cuts = this.getActiveKeySpec().cuts;
    return target.every((h, i) => cuts[i] === h);
  }

  isSafeAligned() {
    const st = this.getStage();
    return st.wheels.every((w, i) => this.wheelNums[i] === w.targetNum);
  }

  setKeyInsert(val) {
    this.keyInsert = Math.max(0, Math.min(1, val));
    const st = this.getStage();
    const cuts = this.getActiveKeySpec().cuts;
    const pinCount = st.target.length;
    const shiftX = -(1 - this.keyInsert) * 245;

    let clinked = false;
    for (let i = 0; i < pinCount; i++) {
      const px = getPinSlotX(i, pinCount);
      const surfY = sampleKeySurfaceY(px, shiftX, cuts);
      if (this.lastPinHeights[i] !== undefined && Math.abs(surfY - this.lastPinHeights[i]) > 6) clinked = true;
      this.lastPinHeights[i] = surfY;
    }
    if (clinked) this.playPinClink(0.85 + this.keyInsert * 0.45);
    if (this.isPinAligned()) this.hintEl.textContent = 'そろった！ つまみを まわそう';
    this.renderScene();
  }

  attemptTurnCylinder() {
    if (this.unlocked) return;
    if (this.keyInsert < 0.95) {
      this.hintEl.textContent = 'もっと おくまで さしこもう';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    if (!this.isPinAligned()) {
      this.hintEl.textContent = 'ピンが ひっかかっているよ';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ かぎが あいたよ！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.spawnSparks(592, 240, '#6EE7B7', 10);
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
      this.spawnSparks(514, 128, '#6EE7B7', 8);
      const next = st.wheels.findIndex((w, i) => this.wheelNums[i] !== w.targetNum);
      if (next !== -1) {
        this.activeWheelIdx = next;
        this.hintEl.textContent = `コトン！ つぎは わ ${next + 1}`;
      } else {
        this.hintEl.textContent = 'ぜんぶ そろった！ ハンドルを まわそう';
      }
    }
    this.renderScene();
  }

  attemptOpenSafe() {
    if (this.unlocked) return;
    if (!this.isSafeAligned()) {
      this.hintEl.textContent = 'みぞを ぜんぶ うえに そろえよう';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ きんこ オープン！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.spawnSparks(668, 244, '#F7C948', 12);
    this.ensureLoop();
  }

  spawnSparks(x, y, color = '#FFE484', count = 6) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const sp = 2.4 + Math.random() * 3.8;
      this.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2, color, life: 1 });
    }
    this.ensureLoop();
  }

  getSvgPoint(e) {
    const rect = this.svgEl.getBoundingClientRect();
    const aspectView = 800 / 500;
    const aspectRect = rect.width / Math.max(1, rect.height);
    let x, y;
    if (aspectRect > aspectView) {
      const rw = rect.height * aspectView;
      x = ((e.clientX - rect.left - (rect.width - rw) / 2) / rw) * 800;
      y = ((e.clientY - rect.top) / rect.height) * 500;
    } else {
      const rh = rect.width / aspectView;
      x = ((e.clientX - rect.left) / rect.width) * 800;
      y = ((e.clientY - rect.top - (rect.height - rh) / 2) / rh) * 500;
    }
    return { x, y };
  }

  handlePointerDown(e) {
    const nextEl = e.target.closest('[data-next-stage]');
    if (nextEl) {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.stageIdx++;
      this.loadStage();
      return;
    }
    if (this.unlocked) return;

    const pickEl = e.target.closest('[data-pick-key]');
    if (pickEl) {
      e.preventDefault();
      this.sound.unlock();
      this.playPinClink(1.15);
      this.selectedKeyIdx = Number(pickEl.dataset.pickKey);
      this.keyInsert = 0;
      this.lastPinHeights = [];
      this.renderScene();
      return;
    }

    const fileEl = e.target.closest('[data-file-pin]');
    if (fileEl) {
      e.preventDefault();
      this.sound.unlock();
      const pinIdx = Number(fileEl.dataset.filePin);
      const delta = Number(fileEl.dataset.fileDelta);
      const next = Math.max(1, Math.min(5, this.customCuts[pinIdx] + delta));
      if (next !== this.customCuts[pinIdx]) {
        this.customCuts[pinIdx] = next;
        this.playFileScrape();
        this.spawnSparks(getPinSlotX(pinIdx, this.customCuts.length), PIN_CAL.bittingY(next), '#FFE484', 6);
        if (this.isPinAligned()) this.hintEl.textContent = 'そろった！ つまみを まわそう';
        this.renderScene();
      }
      return;
    }

    const turnEl = e.target.closest('[data-turn-lock]');
    if (turnEl) {
      e.preventDefault();
      this.sound.unlock();
      this.attemptTurnCylinder();
      return;
    }

    const wheelEl = e.target.closest('[data-safe-wheel]');
    if (wheelEl) {
      e.preventDefault();
      this.sound.unlock();
      this.playDialTick(false);
      this.activeWheelIdx = Number(wheelEl.dataset.safeWheel);
      this.renderScene();
      return;
    }
    const dialStepEl = e.target.closest('[data-dial-step]');
    if (dialStepEl) {
      e.preventDefault();
      this.sound.unlock();
      this.stepSafeWheel(Number(dialStepEl.dataset.dialStep));
      return;
    }
    const safeHandleEl = e.target.closest('[data-safe-handle]');
    if (safeHandleEl) {
      e.preventDefault();
      this.sound.unlock();
      this.attemptOpenSafe();
      return;
    }

    e.preventDefault();
    this.sound.unlock();
    const pt = this.getSvgPoint(e);

    if (this.mode === 'safe') {
      if (Math.hypot(pt.x - 216, pt.y - 248) <= 135) {
        this.draggingDial = true;
        this.lastDialAngle = Math.atan2(pt.y - 248, pt.x - 216);
        this.dialAccumDeg = 0;
      }
      return;
    }

    this.draggingKey = true;
    this.dragOriginX = pt.x;
    this.dragOriginInsert = this.keyInsert;
    this.dragMoved = false;
  }

  handlePointerMove(e) {
    if (this.draggingKey) {
      e.preventDefault();
      const pt = this.getSvgPoint(e);
      if (Math.abs(pt.x - this.dragOriginX) > 6) this.dragMoved = true;
      this.setKeyInsert(this.dragOriginInsert + (pt.x - this.dragOriginX) / 245);
      return;
    }
    if (this.draggingDial) {
      e.preventDefault();
      const pt = this.getSvgPoint(e);
      const ang = Math.atan2(pt.y - 248, pt.x - 216);
      let diff = ((ang - this.lastDialAngle) * 180) / Math.PI;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      this.lastDialAngle = ang;
      this.dialAccumDeg += diff;
      if (Math.abs(this.dialAccumDeg) >= 25) {
        const step = this.dialAccumDeg > 0 ? 1 : -1;
        this.dialAccumDeg -= step * 25;
        this.stepSafeWheel(step);
      }
    }
  }

  handlePointerUp() {
    if (this.draggingKey && !this.dragMoved && this.isPinAligned()) {
      this.attemptTurnCylinder();
    }
    this.draggingKey = false;
    this.draggingDial = false;
  }

  needsLoop() {
    if (this.jamShake > 0.01 || this.sparks.length > 0) return true;
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
        if (this.unlocked && this.mode !== 'safe' && this.boltOpen < 1) this.boltOpen = Math.min(1, this.boltOpen + dt * 2.4);
        if (this.unlocked && this.mode === 'safe' && this.safeHandleTurn < 1) this.safeHandleTurn = Math.min(1, this.safeHandleTurn + dt * 2.0);
        if (this.sparks.length > 0) {
          this.sparks.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.22; s.life -= dt * 2.4; });
          this.sparks = this.sparks.filter((s) => s.life > 0);
        }
        this.renderScene();
      }
      if (this.needsLoop()) this.rafId = requestAnimationFrame(tick);
      else this.rafId = null;
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  renderSparksSvg() {
    return this.sparks.map((s) => `
      <circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${(3.5 + s.life * 3.5).toFixed(1)}" fill="${s.color}" opacity="${s.life.toFixed(2)}"/>
    `).join('');
  }

  renderScene() {
    if (this.mode === 'safe') this.renderSafeScene();
    else this.renderCylinderScene();
  }

  renderCylinderScene() {
    const st = this.getStage();
    const target = st.target;
    const keySpec = this.getActiveKeySpec();
    const pinCount = target.length;
    const shiftX = -(1 - this.keyInsert) * 245;
    const aligned = this.isPinAligned();
    const shakeY = this.jamShake > 0 ? Math.sin(this.jamShake * Math.PI * 6) * 4 : 0;
    const boltRetract = this.boltOpen * 102;
    const camAngle = this.boltOpen * 90;

    let pinsSvg = '';
    let craftHandlesSvg = '';

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

      pinsSvg += `
        <!-- Recessed matte chamber shaft -->
        <rect x="${cx - 17}" y="${PIN_CAL.chamberTopY}" width="34" height="${PIN_CAL.plugBottomY - PIN_CAL.chamberTopY - 14}" rx="10" fill="#1C4747"/>
        <!-- Soft coiled spring -->
        <path d="${buildSpringPath(cx, PIN_CAL.chamberTopY + 5, driverTopY, 6, 9)}" stroke="rgba(255,255,255,0.72)" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Sculpted Coral Driver Pin -->
        <rect x="${cx - 13.5}" y="${driverTopY.toFixed(1)}" width="27" height="${PIN_CAL.driverLen}" rx="7"
          fill="url(#ll-driver-pin)" stroke="${isJammed ? '#FFE484' : 'none'}" stroke-width="${isJammed ? '3.5' : '0'}"/>
        <!-- Sculpted Honey-Gold Key Pin -->
        <path d="M ${cx - 13.5} ${keyPinTopY.toFixed(1)} H ${cx + 13.5} V ${(keyPinBotY - 7).toFixed(1)} L ${cx + 5} ${keyPinBotY.toFixed(1)} H ${cx - 5} L ${cx - 13.5} ${(keyPinBotY - 7).toFixed(1)} Z"
          fill="url(#ll-key-pin)"/>
        ${isThisAligned ? `<circle cx="${cx}" cy="46" r="10" fill="#4ADE80"/>` : `<circle cx="${cx}" cy="46" r="7" fill="rgba(255,255,255,0.28)"/>`}
      `;

      if (this.mode === 'craft' && !this.unlocked) {
        craftHandlesSvg += `
          <g transform="translate(${cx} 422)">
            <g data-file-pin="${i}" data-file-delta="-1" style="cursor:pointer;">
              <circle cx="0" cy="-22" r="20" fill="rgba(0,0,0,0.14)"/>
              <circle cx="0" cy="-25" r="20" fill="#FFE484"/>
              <path d="M -7 -22 L 0 -30 L 7 -22" fill="none" stroke="#9A6B16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <g data-file-pin="${i}" data-file-delta="1" style="cursor:pointer;">
              <circle cx="0" cy="28" r="20" fill="rgba(0,0,0,0.14)"/>
              <circle cx="0" cy="25" r="20" fill="#FFFFFF"/>
              <path d="M -7 22 L 0 30 L 7 22" fill="none" stroke="#266867" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </g>
        `;
      }
    }

    const lockLeftX = getKeyShoulderX(pinCount) + 4;
    const lockW = 556 - lockLeftX;

    let benchKeysSvg = '';
    if (this.mode === 'match' && !this.unlocked) {
      const keys = st.keys;
      const totalW = keys.length * 156 - 14;
      const startKx = Math.max(24, (800 - totalW) / 2);
      benchKeysSvg = keys.map((k, idx) => renderBenchKeySvg({ ...k, idx }, startKx + idx * 156, 408, idx === this.selectedKeyIdx)).join('');
    }

    this.sceneEl.innerHTML = `
      <!-- Subtle soft geometric studio rings (LogicLike / Lingokids calm negative space) -->
      <circle cx="110" cy="95" r="140" fill="rgba(255,255,255,0.04)"/>
      <circle cx="710" cy="410" r="160" fill="rgba(255,255,255,0.04)"/>

      <!-- Soft grounded shadow beneath the lock -->
      <ellipse cx="448" cy="378" rx="220" ry="18" fill="rgba(0,0,0,0.14)"/>

      <!-- Warm Scandinavian Oak Door Jamb on right (rounded, zero black outlines) -->
      <rect x="652" y="42" width="114" height="332" rx="26" fill="#A57242"/>
      <rect x="652" y="34" width="114" height="332" rx="26" fill="url(#ll-oak)"/>
      <!-- Satin Steel Strike Pocket -->
      <rect x="646" y="168" width="22" height="142" rx="8" fill="url(#ll-satin-steel)"/>
      <rect x="668" y="188" width="76" height="102" rx="18" fill="#1C4747"/>

      <!-- Sculpted Satin-Chrome Deadbolt (glides smoothly out when unlocked!) -->
      <g transform="translate(${(-boltRetract).toFixed(1)} 0)">
        <rect x="554" y="206" width="168" height="72" rx="18" fill="#A7B6C7"/>
        <rect x="554" y="198" width="168" height="72" rx="18" fill="url(#ll-satin-steel)"/>
        <line x1="572" y1="212" x2="704" y2="212" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
        <rect x="598" y="226" width="88" height="16" rx="8" fill="#B6C4D4"/>
      </g>

      <!-- Sculpted Matte Honey-Brass Lock Body (bottom 3D lip + rounded soft front face) -->
      <rect x="${lockLeftX}" y="76" width="${lockW}" height="292" rx="28" fill="#C2881A"/>
      <rect x="${lockLeftX}" y="66" width="${lockW}" height="292" rx="28" fill="url(#ll-brass-face)"/>
      <!-- Subtle satin top sheen -->
      <line x1="${lockLeftX + 26}" y1="78" x2="${lockLeftX + lockW - 26}" y2="78" stroke="rgba(255,255,255,0.45)" stroke-width="5" stroke-linecap="round"/>

      <!-- Cylinder Plug -->
      <g transform="translate(0 ${shakeY.toFixed(1)})">
        <rect x="${lockLeftX + 10}" y="${PIN_CAL.shearY}" width="${lockW - 46}" height="${PIN_CAL.plugBottomY - PIN_CAL.shearY}" rx="14"
          fill="url(#ll-brass-plug)"/>
        <rect x="${lockLeftX + 8}" y="234" width="${lockW - 54}" height="78" rx="10" fill="#1C4747"/>
      </g>

      <!-- Cutaway Pins OR Smooth Brass Cover -->
      ${this.cutaway ? `
        ${pinsSvg}
        <!-- Clean Shear Line -->
        <line x1="${lockLeftX + 6}" y1="${PIN_CAL.shearY}" x2="528" y2="${PIN_CAL.shearY}"
          stroke="${aligned ? '#4ADE80' : 'rgba(255,255,255,0.65)'}" stroke-width="${aligned ? '5.5' : '3'}"
          stroke-dasharray="${aligned ? 'none' : '10 8'}" stroke-linecap="round"/>
      ` : `
        <rect x="${lockLeftX + 4}" y="70" width="${lockW - 8}" height="284" rx="24" fill="url(#ll-brass-face)"/>
        <circle cx="404" cy="212" r="64" fill="url(#ll-brass-plug)"/>
      `}

      <!-- Sleek Matte Thumb-Turn Dial right on Lock Body -->
      <g data-turn-lock="1" style="cursor:pointer;" transform="translate(556 262)">
        ${aligned && !this.unlocked ? `<circle cx="0" cy="0" r="46" fill="none" stroke="#6EE7B7" stroke-width="5" stroke-dasharray="14 9" stroke-linecap="round"/>` : ''}
        <circle cx="0" cy="6" r="35" fill="rgba(0,0,0,0.18)"/>
        <circle cx="0" cy="0" r="35" fill="${aligned ? '#34D399' : 'url(#ll-satin-steel)'}"/>
        <g transform="rotate(${camAngle.toFixed(1)})">
          <rect x="-10" y="-42" width="20" height="54" rx="10" fill="#FFFFFF"/>
          <circle cx="0" cy="0" r="7" fill="${aligned ? '#059669' : '#94A3B8'}"/>
        </g>
      </g>

      <!-- Sliding Matte Key -->
      <g transform="translate(0 ${shakeY.toFixed(1)})">
        ${renderKeySvg(keySpec.cuts, shiftX, { fillId: keySpec.fillId, bowShape: keySpec.bowShape, label: keySpec.label, glowReady: aligned && !this.unlocked })}
      </g>

      <!-- Minimal soft white slide chevron when key is waiting outside -->
      ${this.keyInsert < 0.2 && !this.unlocked && this.mode === 'match' ? `
        <g pointer-events="none" opacity="0.72">
          <path d="M 166 254 L 182 268 L 166 282" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 188 254 L 204 268 L 188 282" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      ` : ''}

      ${benchKeysSvg}
      ${craftHandlesSvg}

      <!-- Clean Lingokids-style Next Pill -->
      ${this.unlocked ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(400 438)">
          <rect x="-112" y="-22" width="224" height="54" rx="27" fill="#059669"/>
          <rect x="-112" y="-28" width="224" height="54" rx="27" fill="#34D399"/>
          <text x="0" y="6" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">つぎの カギへ</text>
        </g>
      ` : ''}

      ${this.renderSparksSvg()}
    `;
  }

  renderSafeScene() {
    const st = this.getStage();
    const allAligned = this.isSafeAligned();
    const boltSlide = this.safeHandleTurn * 66;
    const handleDeg = this.safeHandleTurn * 110;
    const shakeX = this.jamShake > 0 ? Math.sin(this.jamShake * Math.PI * 6) * 5 : 0;

    const activeNum = this.wheelNums[this.activeWheelIdx] || 0;
    const dialDeg = activeNum * 30;
    const tickMarks = Array.from({ length: 12 }, (_, n) => {
      const a = ((n * 30 - 90) * Math.PI) / 180;
      const x1 = 216 + Math.cos(a) * 86;
      const y1 = 246 + Math.sin(a) * 86;
      const x2 = 216 + Math.cos(a) * 98;
      const y2 = 246 + Math.sin(a) * 98;
      const tx = 216 + Math.cos(a) * 69;
      const ty = 246 + Math.sin(a) * 69 + 5.5;
      return `
        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(255,255,255,0.65)" stroke-width="3" stroke-linecap="round"/>
        <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="14" font-weight="800" fill="#FFFFFF" font-family="${FONT_ROUND}">${n}</text>
      `;
    }).join('');

    const wCx = 514;
    const wCy = 264;
    const wheelsSvg = st.wheels.map((w, i) => {
      const diffSteps = (this.wheelNums[i] - w.targetNum + 12) % 12;
      const rotDeg = diffSteps * 30;
      const isSel = i === this.activeWheelIdx;
      const isHit = diffSteps === 0;
      return `
        <g data-safe-wheel="${i}" style="cursor:pointer;" transform="translate(${wCx} ${wCy}) rotate(${rotDeg})">
          <circle cx="0" cy="4" r="${w.radius}" fill="${w.lip}"/>
          <circle cx="0" cy="0" r="${w.radius}" fill="${w.fill}" stroke="${isSel ? '#FFFFFF' : 'none'}" stroke-width="${isSel ? '4' : '0'}"/>
          <rect x="-13" y="${-w.radius - 2}" width="26" height="24" rx="7" fill="#2A3444"/>
          ${isHit ? `<circle cx="0" cy="${-w.radius + 10}" r="5" fill="#4ADE80"/>` : ''}
        </g>
      `;
    }).join('');

    const fenceDropY = allAligned ? (this.unlocked ? 24 : 14) : 0;

    this.sceneEl.innerHTML = `
      <!-- Soft grounded shadow -->
      <ellipse cx="400" cy="456" rx="330" ry="20" fill="rgba(61,64,91,0.12)"/>

      <!-- 3 Satin Chrome Locking Bolts -->
      ${[132, 244, 356].map((by) => `
        <g transform="translate(${(-boltSlide).toFixed(1)} 0)">
          <rect x="696" y="${by - 15}" width="72" height="36" rx="14" fill="#A6B5C6"/>
          <rect x="696" y="${by - 20}" width="72" height="36" rx="14" fill="url(#ll-satin-steel)"/>
        </g>
      `).join('')}

      <!-- Sleek Matte Nordic Slate-Indigo Vault Body (rounded, zero black outlines!) -->
      <rect x="52" y="54" width="676" height="394" rx="36" fill="#2A3444"/>
      <rect x="52" y="42" width="676" height="394" rx="36" fill="#3D4A5C"/>
      <line x1="94" y1="56" x2="686" y2="56" stroke="rgba(255,255,255,0.14)" stroke-width="5" stroke-linecap="round"/>

      <!-- Left: Matte Satin Combination Dial -->
      <g transform="translate(${shakeX.toFixed(1)} 0)">
        <circle cx="216" cy="254" r="116" fill="rgba(0,0,0,0.18)"/>
        <circle cx="216" cy="246" r="116" fill="url(#ll-satin-steel)"/>
        <polygon points="216,120 205,100 227,100" fill="#FF6B6B"/>
        <g transform="rotate(${(-dialDeg)} 216 246)" style="cursor:grab;">
          <circle cx="216" cy="246" r="102" fill="#2A3444"/>
          ${tickMarks}
          <circle cx="216" cy="246" r="40" fill="url(#ll-satin-steel)"/>
          <circle cx="216" cy="246" r="22" fill="#3D4A5C"/>
          <circle cx="216" cy="230" r="5" fill="#F7C948"/>
        </g>
        <!-- Minimal soft rounded step buttons -->
        <g data-dial-step="-1" style="cursor:pointer;" transform="translate(154 392)">
          <circle cx="0" cy="4" r="22" fill="rgba(0,0,0,0.2)"/>
          <circle cx="0" cy="0" r="22" fill="#FFFFFF"/>
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#3D4A5C" font-family="${FONT_ROUND}">↺</text>
        </g>
        <g data-dial-step="1" style="cursor:pointer;" transform="translate(278 392)">
          <circle cx="0" cy="4" r="22" fill="rgba(0,0,0,0.2)"/>
          <circle cx="0" cy="0" r="22" fill="#FFFFFF"/>
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#3D4A5C" font-family="${FONT_ROUND}">↻</text>
        </g>
      </g>

      <!-- Right: Recessed Cutaway Wheel Pack -->
      ${this.cutaway ? `
        <rect x="372" y="84" width="284" height="320" rx="28" fill="#2A3444"/>
        ${wheelsSvg}
        <circle cx="${wCx}" cy="${wCy}" r="18" fill="url(#ll-satin-steel)"/>
        <circle cx="${wCx}" cy="${wCy}" r="6" fill="#3D4A5C"/>
        <g transform="translate(0 ${fenceDropY})">
          <rect x="${wCx - 10}" y="114" width="20" height="26" rx="6" fill="${allAligned ? '#4ADE80' : '#FF6B6B'}"/>
          <rect x="${wCx - 60}" y="106" width="120" height="14" rx="7" fill="url(#ll-satin-steel)"/>
        </g>
      ` : ''}

      <!-- Right Edge: Sculpted 3-Spoke Vault Handle -->
      <g data-safe-handle="1" style="cursor:pointer;" transform="translate(682 244)">
        ${allAligned && !this.unlocked ? `<circle cx="0" cy="0" r="46" fill="none" stroke="#4ADE80" stroke-width="5" stroke-dasharray="12 8" stroke-linecap="round"/>` : ''}
        <g transform="rotate(${handleDeg.toFixed(1)})">
          ${[0, 120, 240].map((a) => `
            <rect x="-6.5" y="-36" width="13" height="36" rx="6.5" fill="url(#ll-satin-steel)" transform="rotate(${a})"/>
            <circle cx="0" cy="-36" r="9.5" fill="${allAligned ? '#4ADE80' : '#FF6B6B'}" transform="rotate(${a})"/>
          `).join('')}
          <circle cx="0" cy="0" r="17" fill="#F7C948"/>
        </g>
      </g>

      ${this.unlocked ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(514 264)">
          <rect x="-112" y="-42" width="224" height="90" rx="26" fill="#059669"/>
          <rect x="-112" y="-48" width="224" height="90" rx="26" fill="#34D399"/>
          <polygon points="-20,-6 0,-34 20,-6" fill="#FFF7A8"/>
          <text x="0" y="24" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">オープン！ つぎへ</text>
        </g>
      ` : ''}

      ${this.renderSparksSvg()}
    `;
  }

  /* Web Audio Lock Synthesizers */
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
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.045);
  }

  playFileScrape() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(2800, now); bp.Q.value = 5.0;
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
    osc.start(now); osc.stop(now + (isGateHit ? 0.13 : 0.035));
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
    osc.start(now); osc.stop(now + 0.11);
  }

  playBoltUnlock() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
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
      osc.start(now); osc.stop(now + 0.15);
    });
  }
}
