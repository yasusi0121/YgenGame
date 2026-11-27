import {
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

    this.mode = 'match'; // 'match' | 'craft' | 'safe'
    this.stageIdx = 0;
    this.cutaway = true;

    this.selectedKeyIdx = 0;
    this.customCuts = [3, 3, 3];
    this.keyInsert = 0; // 0..1
    this.boltOpen = 0;  // 0..1
    this.unlocked = false;
    this.jamShake = 0;
    this.lastPinHeights = [];
    this.sparks = []; // { x, y, vx, vy, life }

    // Direct key drag vs tap-to-turn
    this.draggingKey = false;
    this.dragOriginX = 0;
    this.dragOriginInsert = 0;
    this.dragMoved = false;

    // Safe dial state
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
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#F6EFE2');
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
    const old = document.getElementById('ll-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'll-styles';
    style.textContent = `
      .ll-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #F6EFE2; color: #1E293B; user-select: none; -webkit-user-select: none;
        padding: 8px 10px 10px; box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .ll-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 42px;
      }
      .ll-modes {
        display: flex; gap: 5px; background: #FFFFFF; padding: 4px;
        border-radius: 16px; border: 3px solid #1E293B; box-shadow: 0 3px 0 #1E293B;
      }
      .ll-mode-btn {
        border: none; border-radius: 11px; padding: 6px 13px; font-size: 14px; font-weight: 900;
        background: transparent; color: #475569; cursor: pointer; font-family: inherit;
      }
      .ll-mode-btn.active { background: #FACC15; color: #1E293B; box-shadow: inset 0 -3px 0 #CA8A04; }

      .ll-status {
        display: flex; align-items: center; gap: 8px; background: #FFFFFF;
        border: 3px solid #1E293B; border-radius: 16px; padding: 4px 12px;
        box-shadow: 0 3px 0 #1E293B;
      }
      .ll-hint { font-size: 14px; font-weight: 900; color: #1E293B; }
      .ll-toggle-btn {
        border: 2.5px solid #1E293B; border-radius: 10px; padding: 4px 10px;
        background: #E2E8F0; color: #1E293B; font-size: 12px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .ll-toggle-btn.active { background: #22C55E; color: #FFFFFF; }

      .ll-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        border-radius: 22px; border: 4px solid #1E293B; box-shadow: 0 6px 0 rgba(30,41,59,0.2);
        overflow: hidden; background: #FDF8EE;
      }
      .ll-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .ll-root { padding: 6px; gap: 5px; }
        .ll-topbar { padding-left: 44px; padding-right: 44px; }
        .ll-mode-btn { padding: 5px 9px; font-size: 12px; }
        .ll-hint { font-size: 12px; }
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
            <span class="ll-hint" id="ll-hint">カギを みぎへ スライド！</span>
            <button class="ll-toggle-btn active" id="ll-cutaway-btn" type="button">なかを みる</button>
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
    this.unlocked = false;
    this.boltOpen = 0;
    this.jamShake = 0;
    this.keyInsert = this.mode === 'craft' ? 1.0 : 0; // In craft mode, key sits right under pins so child sees each cut align LIVE!
    this.selectedKeyIdx = 0;
    this.lastPinHeights = [];
    this.sparks = [];

    const st = this.getStage();
    if (this.mode === 'craft') {
      this.customCuts = st.target.map((t) => (t === 3 ? 2 : 3));
      this.hintEl.textContent = 'ピンを タップして カギの やまを けずろう！';
    } else if (this.mode === 'match') {
      this.hintEl.textContent = 'したの カギを えらんで みぎへ さしこもう！';
    } else {
      this.activeWheelIdx = 0;
      this.wheelNums = st.wheels.map((w, i) => (w.targetNum + 4 + i * 3) % 12);
      this.safeHandleTurn = 0;
      this.hintEl.textContent = 'ダイヤルを ぐるぐる まわして みぞを そろえよう！';
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
      if (this.lastPinHeights[i] !== undefined && Math.abs(surfY - this.lastPinHeights[i]) > 6) {
        clinked = true;
      }
      this.lastPinHeights[i] = surfY;
    }
    if (clinked) this.playPinClink(0.85 + this.keyInsert * 0.45);

    if (this.isPinAligned()) {
      this.hintEl.textContent = 'ピタッと そろった！ つまみ か カギを タップして まわそう！';
    }
    this.renderScene();
  }

  attemptTurnCylinder() {
    if (this.unlocked) return;
    if (this.keyInsert < 0.95) {
      this.hintEl.textContent = 'カギを おくまで みぎへ さしこもう！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    if (!this.isPinAligned()) {
      this.hintEl.textContent = 'あかいピンが ひっかかっているよ！ べつの カギを ためそう！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ カンヌキが あいたよ！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.spawnSparks(600, 240, '#4ADE80', 12);
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
      this.spawnSparks(518, 128, '#4ADE80', 8);
      const next = st.wheels.findIndex((w, i) => this.wheelNums[i] !== w.targetNum);
      if (next !== -1) {
        this.activeWheelIdx = next;
        this.hintEl.textContent = `コトン！ わ ${idx + 1} が そろった！ つぎは わ ${next + 1}！`;
      } else {
        this.hintEl.textContent = 'ぜんぶ そろった！ みぎの ハンドルを まわして あけよう！';
      }
    }
    this.renderScene();
  }

  attemptOpenSafe() {
    if (this.unlocked) return;
    if (!this.isSafeAligned()) {
      this.hintEl.textContent = 'みぞが ぜんぶ うえに そろうまで ダイヤルを まわそう！';
      this.playJamClunk();
      this.jamShake = 1;
      this.ensureLoop();
      return;
    }
    this.unlocked = true;
    this.hintEl.textContent = 'ガチャン！ おたから きんこ オープン！';
    this.playBoltUnlock();
    this.sound.playCrackerPop();
    this.spawnSparks(670, 240, '#FACC15', 14);
    this.ensureLoop();
  }

  spawnSparks(x, y, color = '#FACC15', count = 6) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const sp = 2.5 + Math.random() * 4;
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

    // Direct Workbench Key Selection
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

    // Direct On-Key Tooth Filing in Craft Mode
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
        const px = getPinSlotX(pinIdx, this.customCuts.length);
        this.spawnSparks(px, PIN_CAL.bittingY(next), '#FACC15', 7);
        if (this.isPinAligned()) {
          this.hintEl.textContent = 'ピッタリ けずれた！ つまみを タップして まわそう！';
        }
        this.renderScene();
      }
      return;
    }

    // Direct On-Lock Thumb-Turn / Cam Twist Trigger
    const turnEl = e.target.closest('[data-turn-lock]');
    if (turnEl) {
      e.preventDefault();
      this.sound.unlock();
      this.attemptTurnCylinder();
      return;
    }

    // Safe Mode Direct Controls: wheel ring select, dial arrows, vault handle
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

    // Direct slide on key/cylinder
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

  handlePointerUp(e) {
    if (this.draggingKey && !this.dragMoved && this.isPinAligned()) {
      // Quick tap on already-inserted aligned key bow turns it immediately!
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
        if (this.unlocked && this.mode !== 'safe' && this.boltOpen < 1) {
          this.boltOpen = Math.min(1, this.boltOpen + dt * 2.4);
        }
        if (this.unlocked && this.mode === 'safe' && this.safeHandleTurn < 1) {
          this.safeHandleTurn = Math.min(1, this.safeHandleTurn + dt * 2.0);
        }
        if (this.sparks.length > 0) {
          this.sparks.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += 0.24; s.life -= dt * 2.4; });
          this.sparks = this.sparks.filter((s) => s.life > 0);
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

  renderSparksSvg() {
    return this.sparks.map((s) => `
      <circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${(3.5 + s.life * 3).toFixed(1)}" fill="${s.color}" stroke="#1E293B" stroke-width="1.5" opacity="${s.life.toFixed(2)}"/>
    `).join('');
  }

  renderScene() {
    if (this.mode === 'safe') {
      this.renderSafeScene();
    } else {
      this.renderCylinderScene();
    }
  }

  renderCylinderScene() {
    const ink = '#1E293B';
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
        <!-- Dark cutaway bore shaft -->
        <rect x="${cx - 17}" y="${PIN_CAL.chamberTopY}" width="34" height="${PIN_CAL.plugBottomY - PIN_CAL.chamberTopY - 14}" rx="5" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
        <!-- Brass top screw cap -->
        <rect x="${cx - 18}" y="${PIN_CAL.chamberTopY - 9}" width="36" height="11" rx="4" fill="url(#ll-brass-top)" stroke="${ink}" stroke-width="2.5"/>
        <!-- Helical Steel Spring -->
        <path d="${buildSpringPath(cx, PIN_CAL.chamberTopY + 3, driverTopY, 6, 10)}" stroke="#E2E8F0" stroke-width="3.2" fill="none" stroke-linejoin="round"/>
        <!-- 2.5D Red Cel-Shaded Driver Pin -->
        <rect x="${cx - 13.5}" y="${driverTopY.toFixed(1)}" width="27" height="${PIN_CAL.driverLen}" rx="5"
          fill="url(#ll-driver-pin)" stroke="${isJammed ? '#FACC15' : ink}" stroke-width="${isJammed ? '3.5' : '2.5'}"/>
        <!-- 2.5D Gold Cel-Shaded Key Pin -->
        <path d="M ${cx - 13.5} ${keyPinTopY.toFixed(1)} H ${cx + 13.5} V ${(keyPinBotY - 7).toFixed(1)} L ${cx + 5} ${keyPinBotY.toFixed(1)} H ${cx - 5} L ${cx - 13.5} ${(keyPinBotY - 7).toFixed(1)} Z"
          fill="url(#ll-key-pin)" stroke="${isThisAligned ? '#4ADE80' : ink}" stroke-width="${isThisAligned ? '3.5' : '2.5'}"/>
        <!-- Check LED badge above each pin -->
        <circle cx="${cx}" cy="44" r="13" fill="${isThisAligned ? '#22C55E' : '#FFFFFF'}" stroke="${ink}" stroke-width="3"/>
        <text x="${cx}" y="49" text-anchor="middle" font-size="13" font-weight="900" fill="${isThisAligned ? '#FFFFFF' : ink}" font-family="sans-serif">${i + 1}</text>
      `;

      // Direct diegetic up/down file buttons right below each key tooth in Craft mode!
      if (this.mode === 'craft' && !this.unlocked) {
        craftHandlesSvg += `
          <g transform="translate(${cx} 398)">
            <g data-file-pin="${i}" data-file-delta="-1" style="cursor:pointer;">
              <rect x="-20" y="-34" width="40" height="30" rx="10" fill="#FACC15" stroke="${ink}" stroke-width="3"/>
              <polygon points="0,-27 -10,-12 10,-12" fill="${ink}"/>
            </g>
            <g data-file-pin="${i}" data-file-delta="1" style="cursor:pointer;">
              <rect x="-20" y="6" width="40" height="30" rx="10" fill="#38BDF8" stroke="${ink}" stroke-width="3"/>
              <polygon points="0,29 -10,14 10,14" fill="${ink}"/>
            </g>
          </g>
        `;
      }
    }

    const lockLeftX = getKeyShoulderX(pinCount) + 4;
    const lockW = 558 - lockLeftX;

    // Bottom workbench keys (Match mode)
    let benchKeysSvg = '';
    if (this.mode === 'match' && !this.unlocked) {
      const keys = st.keys;
      const totalW = keys.length * 158 - 14;
      const startKx = Math.max(24, (800 - totalW) / 2);
      benchKeysSvg = keys.map((k, idx) => renderBenchKeySvg({ ...k, idx }, startKx + idx * 158, 404, idx === this.selectedKeyIdx)).join('');
    }

    this.sceneEl.innerHTML = `
      <!-- Warm Sunlit Studio Wall + 2.5D Wooden Workbench Surface -->
      <rect x="0" y="0" width="800" height="388" fill="url(#ll-wall)"/>
      <rect x="0" y="374" width="800" height="126" fill="url(#ll-bench)"/>
      <line x1="0" y1="374" x2="800" y2="374" stroke="${ink}" stroke-width="4"/>
      <!-- Hard-edged 2.5D cast shadow under lock housing -->
      <ellipse cx="450" cy="382" rx="230" ry="18" fill="rgba(30,41,59,0.18)"/>

      <!-- 2.5D Extruded Wooden Door Jamb on Right -->
      <polygon points="646,24 670,12 784,12 784,380 760,392 646,392" fill="#784922" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="646" y="24" width="114" height="368" rx="10" fill="url(#ll-door-wood)" stroke="${ink}" stroke-width="3.5"/>
      <!-- Chrome Strike Plate & Bolt Pocket -->
      <rect x="642" y="164" width="22" height="148" rx="5" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3"/>
      <rect x="664" y="186" width="82" height="104" rx="12" fill="#1E293B" stroke="${ink}" stroke-width="3"/>

      <!-- 2.5D Extruded Heavy Chrome Deadbolt -->
      <g transform="translate(${(-boltRetract).toFixed(1)} 0)">
        <!-- Top bevel of deadbolt -->
        <polygon points="554,200 568,188 738,188 724,200" fill="#FFFFFF" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="554" y="200" width="170" height="76" rx="10" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3.5"/>
        <rect x="598" y="228" width="96" height="18" rx="9" fill="#64748B" stroke="${ink}" stroke-width="2.5"/>
      </g>

      <!-- 2.5D Extruded Brass Lock Housing (Top Bevel + Right Extrusion + Front Face) -->
      <polygon points="${lockLeftX},66 ${lockLeftX + 18},50 ${576},50 558,66" fill="url(#ll-brass-top)" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="558,66 576,50 576,342 558,358" fill="#92400E" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="${lockLeftX}" y="66" width="${lockW}" height="292" rx="16" fill="url(#ll-brass-front)" stroke="${ink}" stroke-width="4"/>

      <!-- Rotating Cylinder Plug -->
      <g transform="translate(0 ${shakeY.toFixed(1)})">
        <rect x="${lockLeftX + 8}" y="${PIN_CAL.shearY}" width="${lockW - 44}" height="${PIN_CAL.plugBottomY - PIN_CAL.shearY}" rx="10"
          fill="url(#ll-brass-plug)" stroke="${this.unlocked ? '#22C55E' : ink}" stroke-width="3.5"/>
        <rect x="${lockLeftX + 6}" y="232" width="${lockW - 54}" height="80" rx="6" fill="#1E293B" opacity="0.86"/>
      </g>

      <!-- Cutaway Pins OR Solid Faceplate -->
      ${this.cutaway ? `
        ${pinsSvg}
        <line x1="${lockLeftX + 2}" y1="${PIN_CAL.shearY}" x2="528" y2="${PIN_CAL.shearY}"
          stroke="${aligned ? '#22C55E' : '#0284C7'}" stroke-width="${aligned ? '5' : '2.8'}"
          stroke-dasharray="${aligned ? 'none' : '10 6'}"/>
      ` : `
        <rect x="${lockLeftX + 4}" y="70" width="${lockW - 8}" height="284" rx="14" fill="url(#ll-brass-front)" stroke="${ink}" stroke-width="3.5"/>
        <circle cx="404" cy="212" r="68" fill="url(#ll-brass-plug)" stroke="${ink}" stroke-width="4"/>
        <text x="404" y="122" text-anchor="middle" font-size="18" font-weight="900" fill="#78350F" font-family="sans-serif">YGEN LOCK</text>
      `}

      <!-- Direct Diegetic 2.5D Brass Thumb-Turn / Cam Knob right on the lock body! -->
      <g data-turn-lock="1" style="cursor:pointer;" transform="translate(556 260)">
        ${aligned && !this.unlocked ? `
          <circle cx="0" cy="0" r="48" fill="none" stroke="#22C55E" stroke-width="5" stroke-dasharray="12 8"/>
          <rect x="-42" y="-76" width="84" height="26" rx="13" fill="#22C55E" stroke="${ink}" stroke-width="2.5"/>
          <text x="0" y="-58" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">まわす！</text>
        ` : ''}
        <!-- 2.5D Knob shadow & depth -->
        <circle cx="4" cy="6" r="34" fill="#78350F" stroke="${ink}" stroke-width="3"/>
        <circle cx="0" cy="0" r="34" fill="${aligned ? '#4ADE80' : 'url(#ll-chrome)'}" stroke="${ink}" stroke-width="3.5"/>
        <g transform="rotate(${camAngle.toFixed(1)})">
          <rect x="-11" y="-44" width="22" height="58" rx="10" fill="url(#ll-brass-top)" stroke="${ink}" stroke-width="3"/>
          <circle cx="0" cy="0" r="9" fill="${ink}"/>
        </g>
      </g>

      <!-- Sliding 2.5D Key -->
      <g transform="translate(0 ${shakeY.toFixed(1)})">
        ${renderKeySvg(keySpec.cuts, shiftX, { fillId: keySpec.fillId, bowShape: keySpec.bowShape, label: keySpec.label, glowReady: aligned && !this.unlocked })}
      </g>

      <!-- Direct drag cue arrow when key is out -->
      ${this.keyInsert < 0.22 && !this.unlocked && this.mode === 'match' ? `
        <g pointer-events="none">
          <path d="M 152 266 H 214" stroke="#22C55E" stroke-width="8" stroke-linecap="round"/>
          <polygon points="228,266 206,252 206,280" fill="#22C55E" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
        </g>
      ` : ''}

      <!-- Workbench Diegetic Keys / Craft Cutters / Next Stage Pill -->
      ${benchKeysSvg}
      ${craftHandlesSvg}
      ${this.unlocked ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(400 436)">
          <rect x="-126" y="-24" width="252" height="54" rx="20" fill="#15803D" stroke="${ink}" stroke-width="3.5"/>
          <rect x="-126" y="-30" width="252" height="54" rx="20" fill="#22C55E" stroke="${ink}" stroke-width="3.5"/>
          <text x="0" y="4" text-anchor="middle" font-size="21" font-weight="900" fill="#FFFFFF" font-family="sans-serif">あいた！ つぎの カギへ</text>
        </g>
      ` : ''}

      ${this.renderSparksSvg()}
    `;
  }

  renderSafeScene() {
    const ink = '#1E293B';
    const st = this.getStage();
    const allAligned = this.isSafeAligned();
    const boltSlide = this.safeHandleTurn * 68;
    const handleDeg = this.safeHandleTurn * 110;
    const shakeX = this.jamShake > 0 ? Math.sin(this.jamShake * Math.PI * 6) * 5 : 0;

    const activeNum = this.wheelNums[this.activeWheelIdx] || 0;
    const dialDeg = activeNum * 30;
    const tickMarks = Array.from({ length: 12 }, (_, n) => {
      const a = ((n * 30 - 90) * Math.PI) / 180;
      const x1 = 216 + Math.cos(a) * 86;
      const y1 = 248 + Math.sin(a) * 86;
      const x2 = 216 + Math.cos(a) * 100;
      const y2 = 248 + Math.sin(a) * 100;
      const tx = 216 + Math.cos(a) * 70;
      const ty = 248 + Math.sin(a) * 70 + 6;
      return `
        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round"/>
        <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${n}</text>
      `;
    }).join('');

    const wCx = 516;
    const wCy = 266;
    const wheelsSvg = st.wheels.map((w, i) => {
      const diffSteps = (this.wheelNums[i] - w.targetNum + 12) % 12;
      const rotDeg = diffSteps * 30;
      const isSel = i === this.activeWheelIdx;
      const isHit = diffSteps === 0;
      return `
        <g data-safe-wheel="${i}" style="cursor:pointer;" transform="translate(${wCx} ${wCy}) rotate(${rotDeg})">
          <circle cx="0" cy="4" r="${w.radius}" fill="${w.rim}" stroke="${ink}" stroke-width="3"/>
          <circle cx="0" cy="0" r="${w.radius}" fill="${w.fill}" stroke="${isSel ? '#FFFFFF' : ink}" stroke-width="${isSel ? '4.5' : '3'}"/>
          <circle cx="0" cy="0" r="${w.radius - 11}" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-dasharray="10 7"/>
          <!-- Gate Notch at 12 o'clock -->
          <rect x="-13" y="${-w.radius - 2}" width="26" height="24" rx="5" fill="#1E293B" stroke="${isHit ? '#4ADE80' : '#FFFFFF'}" stroke-width="2.8"/>
        </g>
      `;
    }).join('');

    const fenceDropY = allAligned ? (this.unlocked ? 24 : 14) : 0;

    this.sceneEl.innerHTML = `
      <!-- Warm Sunlit Floor & Wall -->
      <rect x="0" y="0" width="800" height="415" fill="url(#ll-wall)"/>
      <rect x="0" y="406" width="800" height="94" fill="url(#ll-bench)"/>
      <line x1="0" y1="406" x2="800" y2="406" stroke="${ink}" stroke-width="4"/>
      <ellipse cx="408" cy="442" rx="345" ry="24" fill="rgba(30,41,59,0.2)"/>

      <!-- 2.5D Extruded Steel Bank Vault Box (Top & Right Depth Faces!) -->
      <polygon points="48,46 76,26 756,26 728,46" fill="#64748B" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="728,46 756,26 756,418 728,438" fill="#1E293B" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="48" y="46" width="680" height="392" rx="24" fill="url(#ll-safe-front)" stroke="${ink}" stroke-width="4.5"/>
      <rect x="64" y="62" width="648" height="360" rx="16" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="3"/>

      <!-- Brass Heavy Hinges on Left Edge -->
      <rect x="34" y="102" width="22" height="58" rx="6" fill="url(#ll-brass-front)" stroke="${ink}" stroke-width="3.5"/>
      <rect x="34" y="318" width="22" height="58" rx="6" fill="url(#ll-brass-front)" stroke="${ink}" stroke-width="3.5"/>

      <!-- 3 Massive 2.5D Chrome Locking Bolts on Right Edge -->
      ${[130, 242, 354].map((by) => `
        <g transform="translate(${(-boltSlide).toFixed(1)} 0)">
          <rect x="702" y="${by - 20}" width="78" height="40" rx="10" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3.5"/>
          <line x1="712" y1="${by - 8}" x2="768" y2="${by - 8}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        </g>
      `).join('')}

      <!-- Left: Giant 2.5D Chrome Combination Dial + Direct Turn Ears -->
      <g transform="translate(${shakeX.toFixed(1)} 0)">
        <circle cx="220" cy="256" r="118" fill="#0F172A" opacity="0.45"/>
        <circle cx="216" cy="248" r="118" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="4"/>
        <polygon points="216,120 202,96 230,96" fill="#EF4444" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
        <g transform="rotate(${(-dialDeg)} 216 248)" style="cursor:grab;">
          <circle cx="216" cy="248" r="104" fill="#1E293B" stroke="${ink}" stroke-width="3.5"/>
          ${tickMarks}
          <circle cx="216" cy="248" r="42" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3.5"/>
          <circle cx="216" cy="248" r="24" fill="#334155" stroke="${ink}" stroke-width="2.5"/>
          <circle cx="216" cy="230" r="5.5" fill="#FACC15"/>
        </g>
        <!-- Direct Diegetic CCW / CW step buttons tucked right below the dial -->
        <g data-dial-step="-1" style="cursor:pointer;" transform="translate(152 390)">
          <rect x="-32" y="-18" width="64" height="36" rx="12" fill="#FACC15" stroke="${ink}" stroke-width="3"/>
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}" font-family="sans-serif">↺</text>
        </g>
        <g data-dial-step="1" style="cursor:pointer;" transform="translate(280 390)">
          <rect x="-32" y="-18" width="64" height="36" rx="12" fill="#FACC15" stroke="${ink}" stroke-width="3"/>
          <text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="${ink}" font-family="sans-serif">↻</text>
        </g>
      </g>

      <!-- Center-Right: Cutaway Wheel Pack Chamber (tap wheels directly!) -->
      ${this.cutaway ? `
        <rect x="374" y="82" width="284" height="324" rx="22" fill="#0F172A" stroke="${ink}" stroke-width="4"/>
        ${wheelsSvg}
        <circle cx="${wCx}" cy="${wCy}" r="20" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3"/>
        <circle cx="${wCx}" cy="${wCy}" r="7" fill="${ink}"/>
        <!-- Spring-Loaded Locking Fence -->
        <g transform="translate(0 ${fenceDropY})">
          <rect x="${wCx - 11}" y="114" width="22" height="28" rx="5" fill="${allAligned ? '#22C55E' : '#EF4444'}" stroke="${ink}" stroke-width="3"/>
          <rect x="${wCx - 64}" y="106" width="128" height="14" rx="7" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3"/>
        </g>
      ` : ''}

      <!-- Far-Right: Direct 2.5D Chrome 3-Spoke Vault Handle (tap to unlock!) -->
      <g data-safe-handle="1" style="cursor:pointer;" transform="translate(684 242)">
        ${allAligned && !this.unlocked ? `
          <circle cx="0" cy="0" r="46" fill="none" stroke="#4ADE80" stroke-width="5" stroke-dasharray="10 7"/>
          <rect x="-40" y="-76" width="80" height="26" rx="13" fill="#22C55E" stroke="${ink}" stroke-width="2.5"/>
          <text x="0" y="-58" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">あける！</text>
        ` : ''}
        <g transform="rotate(${handleDeg.toFixed(1)})">
          ${[0, 120, 240].map((a) => `
            <rect x="-7" y="-38" width="14" height="38" rx="6" fill="url(#ll-chrome)" stroke="${ink}" stroke-width="3" transform="rotate(${a})"/>
            <circle cx="0" cy="-38" r="9" fill="${allAligned ? '#4ADE80' : '#EF4444'}" stroke="${ink}" stroke-width="2.5" transform="rotate(${a})"/>
          `).join('')}
          <circle cx="0" cy="0" r="18" fill="url(#ll-brass-front)" stroke="${ink}" stroke-width="3.5"/>
        </g>
      </g>

      ${this.unlocked ? `
        <g data-next-stage="1" style="cursor:pointer;" transform="translate(516 266)">
          <rect x="-126" y="-54" width="252" height="108" rx="22" fill="#15803D" stroke="${ink}" stroke-width="4"/>
          <rect x="-126" y="-60" width="252" height="108" rx="22" fill="#22C55E" stroke="${ink}" stroke-width="4"/>
          <polygon points="-24,-6 0,-42 24,-6" fill="#38BDF8" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
          <text x="0" y="30" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="sans-serif">オープン！ つぎへ</text>
        </g>
      ` : ''}

      ${this.renderSparksSvg()}
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
