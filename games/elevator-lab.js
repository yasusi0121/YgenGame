import {
  FONT_ROUND,
  FLOORS,
  PASSENGERS,
  buildElevatorDefsSvg,
  renderPassengerSvg,
  renderSheaveSvg
} from './elevator-lab-assets.js';

export default class ElevatorLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'mission'; // 'mission' | 'free'
    this.xray = true;
    this.delivered = 0;

    // Elevator physical state
    this.carFloor = 1.0; // continuous 1.0 .. 5.0
    this.targetQueue = [];
    this.movingDir = 0; // -1 down, 0 idle, 1 up
    this.doorOpen = 1.0; // 0 closed .. 1 open
    this.doorTarget = 1.0;
    this.doorHoldTimer = 0;
    this.sheaveAngle = 0;

    // Passengers
    this.waitingPassenger = null; // { p, floor, dest }
    this.ridingPassenger = null;  // { p, dest }
    this.paxCycle = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#315772');
    }
    this.injectStyles();
    this.renderShell();
    this.spawnMissionPassenger();
    this.renderScene();
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
    const old = document.getElementById('el-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'el-styles';
    style.textContent = `
      .el-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #315772; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .el-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .el-modes {
        display: flex; gap: 4px; background: rgba(255,255,255,0.18); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.28);
      }
      .el-mode-btn {
        border: none; border-radius: 999px; padding: 6px 15px; font-size: 14px; font-weight: 800;
        background: transparent; color: rgba(255,255,255,0.88); cursor: pointer; font-family: inherit;
      }
      .el-mode-btn.active { background: #FFFFFF; color: #315772; box-shadow: 0 3px 0 rgba(0,0,0,0.12); }

      .el-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.28);
        border-radius: 999px; padding: 5px 14px;
      }
      .el-hint { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .el-score {
        background: #FFFFFF; color: #315772; font-size: 13px; font-weight: 900;
        padding: 2px 10px; border-radius: 999px;
      }
      .el-eye-btn {
        border: none; border-radius: 999px; padding: 4px 11px;
        background: rgba(255,255,255,0.25); color: #FFFFFF; font-size: 12px; font-weight: 800;
        cursor: pointer; font-family: inherit;
      }
      .el-eye-btn.active { background: #34D399; box-shadow: 0 2px 0 #059669; }

      .el-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .el-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .el-root { padding: 8px 6px; }
        .el-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
        .el-mode-btn { padding: 5px 10px; font-size: 12px; }
        .el-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="el-root">
        <div class="el-topbar">
          <div class="el-modes">
            <button class="el-mode-btn active" data-mode="mission" type="button">おとどけ</button>
            <button class="el-mode-btn" data-mode="free" type="button">じゆう</button>
          </div>
          <div class="el-pill">
            <span class="el-hint" id="el-hint">ボタンを おして うごかそう</span>
            <span class="el-score" id="el-score">0にん</span>
            <button class="el-eye-btn active" id="el-xray-btn" type="button">なか</button>
          </div>
        </div>

        <div class="el-stage-wrap">
          <svg class="el-svg" id="el-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildElevatorDefsSvg()}
            <g id="el-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#el-svg');
    this.sceneEl = this.mountEl.querySelector('#el-scene');
    this.hintEl = this.mountEl.querySelector('#el-hint');
    this.scoreEl = this.mountEl.querySelector('#el-score');
    this.xrayBtn = this.mountEl.querySelector('#el-xray-btn');

    this.mountEl.querySelectorAll('.el-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.mountEl.querySelectorAll('.el-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        if (m === 'mission') {
          this.spawnMissionPassenger();
        } else {
          this.waitingPassenger = null;
          this.ridingPassenger = null;
          this.hintEl.textContent = 'すきな かいの ボタンを おしてみよう';
        }
        this.renderScene();
      });
    });

    this.xrayBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playMetalClick();
      this.xray = !this.xray;
      this.xrayBtn.classList.toggle('active', this.xray);
      this.renderScene();
    });

    this.svgEl.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      e.preventDefault();
      this.sound.unlock();
      const act = target.dataset.act;
      if (act === 'press-floor') {
        this.pressFloorButton(Number(target.dataset.floor));
      } else if (act === 'door-open') {
        if (this.movingDir === 0) {
          this.doorTarget = 1;
          this.doorHoldTimer = 1.8;
          this.playDoorSlide();
        }
      } else if (act === 'door-close') {
        if (this.movingDir === 0) {
          this.doorTarget = 0;
          this.doorHoldTimer = 0;
          this.playDoorSlide();
        }
      }
    });
  }

  spawnMissionPassenger() {
    const curFloor = Math.round(this.carFloor);
    const p = PASSENGERS[this.paxCycle % PASSENGERS.length];
    this.paxCycle++;
    const floors = [1, 2, 3, 4, 5].filter((f) => f !== curFloor);
    const startFloor = floors[this.paxCycle % floors.length];
    const destPool = [1, 2, 3, 4, 5].filter((f) => f !== startFloor);
    const destFloor = destPool[(this.paxCycle * 2 + 1) % destPool.length];
    this.waitingPassenger = { p, floor: startFloor, dest: destFloor };
    this.ridingPassenger = null;
    this.hintEl.textContent = `${startFloor}F で ${p.name} が まってるよ！`;
  }

  pressFloorButton(floorNum) {
    this.playElevButton();
    if (Math.abs(this.carFloor - floorNum) < 0.05 && this.movingDir === 0) {
      this.doorTarget = 1;
      this.doorHoldTimer = 1.6;
      this.playArriveChime();
      this.handleFloorStop(floorNum);
      return;
    }
    if (!this.targetQueue.includes(floorNum)) {
      this.targetQueue.push(floorNum);
    }
    // If idle with doors open, close doors promptly to depart
    if (this.movingDir === 0 && this.doorOpen > 0.05) {
      this.doorTarget = 0;
      this.doorHoldTimer = 0;
      this.playDoorSlide();
    }
    this.renderScene();
  }

  handleFloorStop(floorNum) {
    if (this.mode !== 'mission') return;
    if (this.ridingPassenger && this.ridingPassenger.dest === floorNum) {
      const doneName = this.ridingPassenger.p.name;
      this.ridingPassenger = null;
      this.delivered++;
      this.scoreEl.textContent = `${this.delivered}にん`;
      this.sound.playCrackerPop();
      this.hintEl.textContent = `${doneName} が ${floorNum}F に とうちゃく！`;
      setTimeout(() => {
        if (!this.destroyed && this.mode === 'mission' && !this.waitingPassenger && !this.ridingPassenger) {
          this.spawnMissionPassenger();
          this.renderScene();
        }
      }, 1300);
    } else if (this.waitingPassenger && this.waitingPassenger.floor === floorNum) {
      this.ridingPassenger = { p: this.waitingPassenger.p, dest: this.waitingPassenger.dest };
      this.waitingPassenger = null;
      this.sound.playSproutPop();
      this.hintEl.textContent = `${this.ridingPassenger.p.name} は ${this.ridingPassenger.dest}F へ いきたいよ！`;
    }
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
    let dirty = false;

    // 1. Door motion
    if (Math.abs(this.doorOpen - this.doorTarget) > 0.01) {
      const stepD = dt * 2.2;
      this.doorOpen += this.doorOpen < this.doorTarget ? Math.min(stepD, this.doorTarget - this.doorOpen) : -Math.min(stepD, this.doorOpen - this.doorTarget);
      dirty = true;
    } else if (this.doorHoldTimer > 0) {
      this.doorHoldTimer -= dt;
      if (this.doorHoldTimer <= 0 && this.targetQueue.length > 0) {
        this.doorTarget = 0;
        this.playDoorSlide();
        dirty = true;
      }
    }

    // 2. Vertical shaft travel once doors are safely closed
    if (this.doorOpen <= 0.02 && this.targetQueue.length > 0) {
      const nextFloor = this.targetQueue[0];
      const diff = nextFloor - this.carFloor;
      const speed = 1.35; // floors per second
      if (Math.abs(diff) <= speed * dt) {
        this.carFloor = nextFloor;
        this.movingDir = 0;
        this.targetQueue.shift();
        this.doorTarget = 1;
        this.doorHoldTimer = 1.6;
        this.playArriveChime();
        this.playDoorSlide();
        this.handleFloorStop(nextFloor);
      } else {
        this.movingDir = diff > 0 ? 1 : -1;
        const deltaF = this.movingDir * speed * dt;
        this.carFloor += deltaF;
        this.sheaveAngle = (this.sheaveAngle + deltaF * 190) % 360;
      }
      dirty = true;
    } else if (this.targetQueue.length === 0 && this.movingDir !== 0) {
      this.movingDir = 0;
      dirty = true;
    }

    if (dirty) this.renderScene();
  }

  floorToY(f) {
    // 1F = 396, 5F = 84 -> linear interpolation
    return 396 - (f - 1) * 78;
  }

  renderScene() {
    const carY = this.floorToY(this.carFloor);
    // Counterweight moves strictly OPPOSITE to the elevator car!
    const cwFloor = 6 - this.carFloor;
    const cwY = this.floorToY(cwFloor);
    const curFloorInt = Math.round(this.carFloor);

    // Left Building Floors & Waiting Passenger
    const floorsSvg = FLOORS.map((fl) => {
      const isHere = curFloorInt === fl.num && this.movingDir === 0;
      const hasWait = this.waitingPassenger && this.waitingPassenger.floor === fl.num;
      return `
        <g transform="translate(0 ${fl.y})">
          <!-- Floor slab -->
          <rect x="44" y="34" width="210" height="10" rx="5" fill="rgba(255,255,255,0.22)"/>
          <!-- Floor color badge -->
          <rect x="52" y="-14" width="44" height="28" rx="14" fill="${fl.color}"/>
          <text x="74" y="5" text-anchor="middle" font-size="13" font-weight="900" fill="#2D3436" font-family="${FONT_ROUND}">${fl.label}</text>
          <text x="108" y="4" font-size="12" font-weight="800" fill="rgba(255,255,255,0.78)" font-family="${FONT_ROUND}">${fl.name}</text>
          <!-- Hall call button (also directly clickable!) -->
          <g data-act="press-floor" data-floor="${fl.num}" style="cursor:pointer;" transform="translate(236 4)">
            <circle cx="0" cy="0" r="11" fill="${this.targetQueue.includes(fl.num) ? '#F7C948' : 'rgba(255,255,255,0.28)'}"/>
            <circle cx="0" cy="0" r="5" fill="${isHere ? '#34D399' : '#FFFFFF'}"/>
          </g>
          ${hasWait ? renderPassengerSvg(this.waitingPassenger.p, 184, 15, 0.92, this.waitingPassenger.dest) : ''}
        </g>
      `;
    }).join('');

    // Elevator Car Sliding Doors
    const doorHalfW = 48 * (1 - this.doorOpen * 0.86);

    // Right: Authentic Elevator Button Panel (5F..1F + Open/Close)
    const panelButtonsSvg = FLOORS.map((fl, idx) => {
      const by = 178 + idx * 50;
      const lit = this.targetQueue.includes(fl.num);
      const isDestHint = (this.ridingPassenger && this.ridingPassenger.dest === fl.num) ||
                         (this.waitingPassenger && this.waitingPassenger.floor === fl.num);
      return `
        <g data-act="press-floor" data-floor="${fl.num}" style="cursor:pointer;" transform="translate(658 ${by})">
          ${isDestHint && !lit ? `<circle cx="0" cy="0" r="24" fill="none" stroke="rgba(255,243,161,0.8)" stroke-width="3.5" stroke-dasharray="7 6"/>` : ''}
          <circle cx="0" cy="4" r="20" fill="${lit ? '#D19D1E' : '#B8C4D0'}"/>
          <circle cx="0" cy="0" r="20" fill="${lit ? '#F7C948' : '#FFFFFF'}"/>
          <text x="0" y="6" text-anchor="middle" font-size="17" font-weight="900" fill="${lit ? '#FFFFFF' : '#315772'}" font-family="${FONT_ROUND}">${fl.num}</text>
        </g>
      `;
    }).join('');

    this.sceneEl.innerHTML = `
      <!-- Subtle ambient background circles -->
      <circle cx="105" cy="95" r="120" fill="rgba(255,255,255,0.04)"/>
      <circle cx="715" cy="420" r="130" fill="rgba(255,255,255,0.04)"/>

      <!-- Left Floor Gallery -->
      ${floorsSvg}

      <!-- Center Elevator Shaft Tower (x: 266..514) -->
      <rect x="266" y="22" width="248" height="456" rx="28" fill="#234156"/>

      <!-- Top Machine Room (Visible when X-ray ON) -->
      ${this.xray ? `
        <rect x="280" y="32" width="220" height="58" rx="18" fill="#1B3446"/>
        <!-- Steel Traction Cables linking Car & Counterweight over the Sheave! -->
        <line x1="342" y1="60" x2="342" y2="${(carY - 34).toFixed(1)}" stroke="#CBD5E1" stroke-width="3.5"/>
        <line x1="352" y1="60" x2="352" y2="${(carY - 34).toFixed(1)}" stroke="#94A3B8" stroke-width="2.5"/>
        <line x1="454" y1="60" x2="454" y2="${(cwY - 26).toFixed(1)}" stroke="#CBD5E1" stroke-width="3.5"/>
        <line x1="347" y1="38" x2="454" y2="38" stroke="#CBD5E1" stroke-width="3.5"/>
        ${renderSheaveSvg(347, 60, this.sheaveAngle)}
        ${renderSheaveSvg(454, 60, this.sheaveAngle)}
        <!-- Guide Rails -->
        <line x1="292" y1="90" x2="292" y2="462" stroke="rgba(255,255,255,0.14)" stroke-width="4"/>
        <line x1="402" y1="90" x2="402" y2="462" stroke="rgba(255,255,255,0.14)" stroke-width="4"/>
        <!-- Counterweight Block (moves opposite to cabin!) -->
        <g transform="translate(454 ${cwY.toFixed(1)})">
          <rect x="-24" y="-26" width="48" height="52" rx="10" fill="#547188"/>
          <rect x="-20" y="-18" width="40" height="9" rx="4" fill="#7D9BB2"/>
          <rect x="-20" y="-4"  width="40" height="9" rx="4" fill="#7D9BB2"/>
          <rect x="-20" y="10"  width="40" height="9" rx="4" fill="#7D9BB2"/>
        </g>
      ` : ''}

      <!-- Elevator Car Cabin (moves smoothly from 1F to 5F!) -->
      <g transform="translate(347 ${carY.toFixed(1)})">
        <!-- Soft cabin roof & interior -->
        <rect x="-54" y="-32" width="108" height="72" rx="14" fill="#D5C8B4"/>
        <rect x="-50" y="-28" width="100" height="64" rx="11" fill="url(#el-cabin)"/>
        <!-- Warm ceiling light -->
        <rect x="-26" y="-26" width="52" height="6" rx="3" fill="#FFF3A1"/>
        <!-- Riding Passenger inside cabin -->
        ${this.ridingPassenger ? renderPassengerSvg(this.ridingPassenger.p, 0, 16, 0.92, this.ridingPassenger.dest) : ''}
        <!-- Smooth Sliding Left & Right Satin Doors -->
        <rect x="-50" y="-28" width="${doorHalfW.toFixed(1)}" height="64" rx="6" fill="url(#el-door)"/>
        <rect x="${(50 - doorHalfW).toFixed(1)}" y="-28" width="${doorHalfW.toFixed(1)}" height="64" rx="6" fill="url(#el-door)"/>
      </g>

      <!-- Right: Sleek Matte Elevator Control Panel (x: 564..752) -->
      <rect x="564" y="42" width="188" height="428" rx="32" fill="#234156"/>
      <rect x="564" y="34" width="188" height="428" rx="32" fill="url(#el-steel)"/>

      <!-- Top Digital Floor Indicator Display -->
      <rect x="588" y="54" width="140" height="84" rx="20" fill="#233747"/>
      <!-- Up / Down Direction Arrows -->
      <polygon points="618,76 607,92 629,92" fill="${this.movingDir > 0 ? '#4ADE80' : '#3C5468'}"/>
      <polygon points="618,120 607,104 629,104" fill="${this.movingDir < 0 ? '#F7C948' : '#3C5468'}"/>
      <text x="680" y="112" text-anchor="middle" font-size="44" font-weight="900" fill="#FFE082" font-family="${FONT_ROUND}">${curFloorInt}</text>

      <!-- Glowing Floor Push Buttons 5..1 -->
      ${panelButtonsSvg}

      <!-- Bottom Open / Close Door Buttons -->
      <g data-act="door-open" style="cursor:pointer;" transform="translate(618 424)">
        <circle cx="0" cy="4" r="20" fill="#B8C4D0"/>
        <circle cx="0" cy="0" r="20" fill="#FFFFFF"/>
        <polygon points="-9,0 -3,-6 -3,6" fill="#315772"/>
        <polygon points="9,0 3,-6 3,6" fill="#315772"/>
      </g>
      <g data-act="door-close" style="cursor:pointer;" transform="translate(698 424)">
        <circle cx="0" cy="4" r="20" fill="#B8C4D0"/>
        <circle cx="0" cy="0" r="20" fill="#FFFFFF"/>
        <polygon points="-3,0 -9,-6 -9,6" fill="#315772"/>
        <polygon points="3,0 9,-6 9,6" fill="#315772"/>
      </g>
    `;
  }

  /* Web Audio Elevator Synthesizers */
  playElevButton() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now);
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.09);
  }

  playArriveChime() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    // Authentic warm 2-tone elevator arrival chime ("Pin-Pon!")
    [880, 659.25].forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(g); g.connect(this.sound.wetBus || this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.44);
    });
  }

  playDoorSlide() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 650;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    src.connect(lp); lp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.26);
  }
}
