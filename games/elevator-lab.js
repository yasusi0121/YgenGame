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

    this.mode = 'mission'; // 'mission' | 'manual'
    this.xray = true;
    this.delivered = 0;

    this.carFloor = 1.0; // continuous 1.0 .. 5.0
    this.targetQueue = [];
    this.movingDir = 0;
    this.doorOpen = 1.0;
    this.doorTarget = 1.0;
    this.sheaveAngle = 0;

    // Multiple simultaneous passengers: { uid, p, state: 'waiting'|'riding', floor, dest, x, y }
    this.pax = [];
    this.nextUid = 1;
    this.paxCycle = 0;

    // Active drag: { kind: 'pax'|'sheave', uid?, lastAng?, x, y }
    this.drag = null;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#315772');
    }
    this.injectStyles();
    this.renderShell();
    this.fillWaitingPassengers();
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
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
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
            <button class="el-mode-btn" data-mode="manual" type="button">しゅどう かっしゃ</button>
          </div>
          <div class="el-pill">
            <span class="el-hint" id="el-hint">どうぶつを ドラッグして カゴへ のせよう！</span>
            <span class="el-score" id="el-score">0にん</span>
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

    this.mountEl.querySelectorAll('.el-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.targetQueue = [];
        this.movingDir = 0;
        this.mountEl.querySelectorAll('.el-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        if (m === 'manual') {
          this.doorTarget = 0;
          this.hintEl.textContent = 'みぎの おおきい かっしゃハンドルを グルグル まわそう！';
        } else {
          this.doorTarget = 1;
          this.fillWaitingPassengers();
          this.hintEl.textContent = 'どうぶつを ドラッグして カゴへ のせて はこぼう！';
        }
        this.renderScene();
      });
    });

    this.svgEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  fillWaitingPassengers() {
    // Keep 3 passengers on distinct floors so child can plan multi-stop trips!
    while (this.pax.length < 3) {
      const usedFloors = new Set(this.pax.filter((x) => x.state === 'waiting').map((x) => x.floor));
      const avail = [1, 2, 3, 4, 5].filter((f) => !usedFloors.has(f));
      if (!avail.length) break;
      const floor = this.pax.length === 0 ? Math.round(this.carFloor) : avail[Math.floor(Math.random() * avail.length)];
      const destPool = [1, 2, 3, 4, 5].filter((f) => f !== floor);
      const dest = destPool[Math.floor(Math.random() * destPool.length)];
      const p = PASSENGERS[this.paxCycle % PASSENGERS.length];
      this.paxCycle++;
      this.pax.push({ uid: this.nextUid++, p, state: 'waiting', floor, dest, x: 184, y: this.floorToY(floor) + 15 });
    }
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
    const target = e.target.closest('[data-act]');
    if (!target) return;
    e.preventDefault();
    this.sound.unlock();
    const act = target.dataset.act;
    const pt = this.getSvgPoint(e);

    if (act === 'drag-pax') {
      const uid = Number(target.dataset.uid);
      const px = this.pax.find((x) => x.uid === uid);
      if (!px) return;
      const curFloor = Math.round(this.carFloor);
      if (this.movingDir !== 0 || this.doorOpen < 0.7) {
        this.sound.playBoing();
        this.hintEl.textContent = 'エレベーターが とまって ドアが あいてから のせよう！';
        return;
      }
      if (px.state === 'waiting' && px.floor !== curFloor) {
        this.sound.playBoing();
        this.hintEl.textContent = `まず ${px.floor}F の ボタンを おして むかえに いこう！`;
        return;
      }
      this.drag = { kind: 'pax', uid, x: pt.x, y: pt.y };
      px.x = pt.x;
      px.y = pt.y;
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'drag-sheave') {
      this.drag = { kind: 'sheave', lastAng: Math.atan2(pt.y - 252, pt.x - 658), x: pt.x, y: pt.y };
    } else if (act === 'press-floor') {
      this.pressFloorButton(Number(target.dataset.floor));
    } else if (act === 'door-open') {
      if (this.movingDir === 0) { this.doorTarget = 1; this.playDoorSlide(); }
    } else if (act === 'door-close') {
      if (this.movingDir === 0) { this.doorTarget = 0; this.playDoorSlide(); }
    }
  }

  handlePointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const pt = this.getSvgPoint(e);

    if (this.drag.kind === 'pax') {
      const px = this.pax.find((x) => x.uid === this.drag.uid);
      if (px) {
        px.x = pt.x;
        px.y = pt.y;
        this.renderScene();
      }
    } else if (this.drag.kind === 'sheave') {
      // Hand-crank traction sheave wheel directly moves elevator car & counterweight!
      const ang = Math.atan2(pt.y - 252, pt.x - 658);
      let diff = ((ang - this.drag.lastAng) * 180) / Math.PI;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      this.drag.lastAng = ang;

      this.sheaveAngle = (this.sheaveAngle + diff) % 360;
      const prevF = Math.round(this.carFloor);
      this.carFloor = Math.max(1, Math.min(5, this.carFloor + diff / 180));
      if (Math.round(this.carFloor) !== prevF) {
        this.playArriveChime();
      }
      this.renderScene();
    }
  }

  handlePointerUp() {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;

    if (d.kind === 'pax') {
      const px = this.pax.find((x) => x.uid === d.uid);
      if (px) {
        const curFloor = Math.round(this.carFloor);
        const carY = this.floorToY(this.carFloor);
        const inCar = px.x >= 280 && px.x <= 415 && Math.abs(px.y - carY) <= 64;
        const onFloorHall = px.x >= 44 && px.x <= 260;

        if (px.state === 'waiting' && inCar) {
          const ridingCount = this.pax.filter((x) => x.state === 'riding').length;
          if (ridingCount >= 3) {
            this.sound.playBoing();
            this.hintEl.textContent = 'まんいん ブザー！ 3にん までしか のれないよ！';
          } else {
            px.state = 'riding';
            this.sound.playSproutPop();
            this.hintEl.textContent = `${px.p.name} が のったよ！ ${px.dest}F の ボタンを おそう！`;
          }
        } else if (px.state === 'riding' && onFloorHall) {
          if (curFloor === px.dest) {
            // Delivered to correct floor!
            this.pax = this.pax.filter((x) => x.uid !== px.uid);
            this.delivered++;
            this.scoreEl.textContent = `${this.delivered}にん`;
            this.sound.playCrackerPop();
            this.hintEl.textContent = `${px.p.name} が ${curFloor}F に とうちゃく！ ありがとう！`;
            this.fillWaitingPassengers();
          } else {
            // Dropped off on wrong floor -> waits there
            px.state = 'waiting';
            px.floor = curFloor;
            this.sound.playMetalClick();
            this.hintEl.textContent = `${px.p.name} は ${px.dest}F へ いきたいよ！`;
          }
        }
      }
      this.renderScene();
    }
  }

  pressFloorButton(floorNum) {
    if (this.mode === 'manual') return;
    this.playElevButton();
    if (Math.abs(this.carFloor - floorNum) < 0.05 && this.movingDir === 0) {
      this.doorTarget = 1;
      this.playArriveChime();
      return;
    }
    if (!this.targetQueue.includes(floorNum)) this.targetQueue.push(floorNum);
    if (this.movingDir === 0 && this.doorOpen > 0.05) {
      this.doorTarget = 0;
      this.playDoorSlide();
    }
    this.renderScene();
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
    if (Math.abs(this.doorOpen - this.doorTarget) > 0.01) {
      const stepD = dt * 2.4;
      this.doorOpen += this.doorOpen < this.doorTarget ? Math.min(stepD, this.doorTarget - this.doorOpen) : -Math.min(stepD, this.doorOpen - this.doorTarget);
      dirty = true;
    }

    if (this.mode === 'mission' && this.doorOpen <= 0.02 && this.targetQueue.length > 0) {
      const nextFloor = this.targetQueue[0];
      const diff = nextFloor - this.carFloor;
      const speed = 1.4;
      if (Math.abs(diff) <= speed * dt) {
        this.carFloor = nextFloor;
        this.movingDir = 0;
        this.targetQueue.shift();
        this.doorTarget = 1;
        this.playArriveChime();
        this.playDoorSlide();
        const hasDrop = this.pax.some((x) => x.state === 'riding' && x.dest === nextFloor);
        const hasWait = this.pax.some((x) => x.state === 'waiting' && x.floor === nextFloor);
        if (hasDrop) this.hintEl.textContent = `${nextFloor}F に とうちゃく！ どうぶつを ひだりへ ドラッグして おろそう！`;
        else if (hasWait) this.hintEl.textContent = `${nextFloor}F に とうちゃく！ どうぶつを ドラッグして カゴへ のせよう！`;
      } else {
        this.movingDir = diff > 0 ? 1 : -1;
        const deltaF = this.movingDir * speed * dt;
        this.carFloor += deltaF;
        this.sheaveAngle = (this.sheaveAngle + deltaF * 190) % 360;
      }
      dirty = true;
    }

    if (dirty) this.renderScene();
  }

  floorToY(f) {
    return 396 - (f - 1) * 78;
  }

  renderScene() {
    const carY = this.floorToY(this.carFloor);
    const cwY = this.floorToY(6 - this.carFloor);
    const curFloorInt = Math.round(this.carFloor);
    const ridingList = this.pax.filter((x) => x.state === 'riding');
    const draggedPax = (this.drag && this.drag.kind === 'pax') ? this.pax.find((x) => x.uid === this.drag.uid) : null;

    const floorsSvg = FLOORS.map((fl) => {
      const waiters = this.pax.filter((x) => x.state === 'waiting' && x.floor === fl.num && (!draggedPax || draggedPax.uid !== x.uid));
      return `
        <g transform="translate(0 ${fl.y})">
          <rect x="44" y="34" width="210" height="10" rx="5" fill="rgba(255,255,255,0.22)"/>
          <rect x="52" y="-14" width="44" height="28" rx="14" fill="${fl.color}"/>
          <text x="74" y="5" text-anchor="middle" font-size="13" font-weight="900" fill="#2D3436" font-family="${FONT_ROUND}">${fl.label}</text>
          <text x="108" y="4" font-size="11.5" font-weight="800" fill="rgba(255,255,255,0.78)" font-family="${FONT_ROUND}">${fl.name}</text>
          ${waiters.map((w) => `
            <g data-act="drag-pax" data-uid="${w.uid}" style="cursor:grab;">
              ${renderPassengerSvg(w.p, 190, 15, 0.92, w.dest)}
            </g>
          `).join('')}
        </g>
      `;
    }).join('');

    const doorHalfW = 48 * (1 - this.doorOpen * 0.86);

    // Right panel: Either Push-Button Panel OR Big Hand-Crank Traction Wheel in Manual Mode!
    const rightPanelSvg = this.mode === 'manual' ? `
      <rect x="560" y="42" width="196" height="428" rx="32" fill="#234156"/>
      <rect x="560" y="34" width="196" height="428" rx="32" fill="url(#el-steel)"/>
      <rect x="586" y="56" width="144" height="72" rx="20" fill="#233747"/>
      <text x="658" y="106" text-anchor="middle" font-size="38" font-weight="900" fill="#FFE082" font-family="${FONT_ROUND}">${this.carFloor.toFixed(1)}F</text>
      <!-- Giant Hand-Crank Sheave Wheel (drag circularly!) -->
      <g data-act="drag-sheave" style="cursor:grab;" transform="translate(658 252)">
        <circle cx="0" cy="0" r="82" fill="none" stroke="rgba(49,87,114,0.2)" stroke-width="5" stroke-dasharray="10 8"/>
        <g transform="rotate(${this.sheaveAngle.toFixed(1)})">
          <circle cx="0" cy="0" r="68" fill="#E5A931"/>
          <circle cx="0" cy="0" r="56" fill="#234156"/>
          ${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="0" y1="0" x2="0" y2="-56" stroke="#F7C948" stroke-width="8" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}
          <circle cx="0" cy="0" r="16" fill="#FFFFFF"/>
          <!-- Red crank grip handle -->
          <circle cx="0" cy="-46" r="15" fill="#F05A5B"/>
          <circle cx="-4" cy="-50" r="4.5" fill="rgba(255,255,255,0.6)"/>
        </g>
      </g>
      <text x="658" y="376" text-anchor="middle" font-size="14" font-weight="900" fill="#315772" font-family="${FONT_ROUND}">グルグル まわして</text>
      <text x="658" y="398" text-anchor="middle" font-size="14" font-weight="900" fill="#315772" font-family="${FONT_ROUND}">うごかそう！</text>
    ` : `
      <rect x="564" y="42" width="188" height="428" rx="32" fill="#234156"/>
      <rect x="564" y="34" width="188" height="428" rx="32" fill="url(#el-steel)"/>
      <rect x="588" y="54" width="140" height="80" rx="20" fill="#233747"/>
      <polygon points="618,74 607,90 629,90" fill="${this.movingDir > 0 ? '#4ADE80' : '#3C5468'}"/>
      <polygon points="618,116 607,100 629,100" fill="${this.movingDir < 0 ? '#F7C948' : '#3C5468'}"/>
      <text x="680" y="109" text-anchor="middle" font-size="42" font-weight="900" fill="#FFE082" font-family="${FONT_ROUND}">${curFloorInt}</text>
      <!-- Capacity / Weight Gauge (3 dots) -->
      ${[0, 1, 2].map((i) => `<circle cx="${626 + i * 32}" cy="150" r="6" fill="${i < ridingList.length ? '#34D399' : '#CBD6E2'}"/>`).join('')}

      ${FLOORS.map((fl, idx) => {
        const by = 186 + idx * 46;
        const lit = this.targetQueue.includes(fl.num);
        return `
          <g data-act="press-floor" data-floor="${fl.num}" style="cursor:pointer;" transform="translate(658 ${by})">
            <circle cx="0" cy="4" r="19" fill="${lit ? '#D19D1E' : '#B8C4D0'}"/>
            <circle cx="0" cy="0" r="19" fill="${lit ? '#F7C948' : '#FFFFFF'}"/>
            <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="900" fill="${lit ? '#FFFFFF' : '#315772'}" font-family="${FONT_ROUND}">${fl.num}</text>
          </g>
        `;
      }).join('')}

      <g data-act="door-open" style="cursor:pointer;" transform="translate(618 424)">
        <circle cx="0" cy="4" r="20" fill="#B8C4D0"/><circle cx="0" cy="0" r="20" fill="#FFFFFF"/>
        <polygon points="-9,0 -3,-6 -3,6" fill="#315772"/><polygon points="9,0 3,-6 3,6" fill="#315772"/>
      </g>
      <g data-act="door-close" style="cursor:pointer;" transform="translate(698 424)">
        <circle cx="0" cy="4" r="20" fill="#B8C4D0"/><circle cx="0" cy="0" r="20" fill="#FFFFFF"/>
        <polygon points="-3,0 -9,-6 -9,6" fill="#315772"/><polygon points="3,0 9,-6 9,6" fill="#315772"/>
      </g>
    `;

    this.sceneEl.innerHTML = `
      ${floorsSvg}

      <!-- Center Shaft Tower -->
      <rect x="266" y="22" width="248" height="456" rx="28" fill="#234156"/>
      <rect x="280" y="32" width="220" height="58" rx="18" fill="#1B3446"/>
      <line x1="342" y1="60" x2="342" y2="${(carY - 34).toFixed(1)}" stroke="#CBD5E1" stroke-width="3.5"/>
      <line x1="352" y1="60" x2="352" y2="${(carY - 34).toFixed(1)}" stroke="#94A3B8" stroke-width="2.5"/>
      <line x1="454" y1="60" x2="454" y2="${(cwY - 26).toFixed(1)}" stroke="#CBD5E1" stroke-width="3.5"/>
      <line x1="347" y1="38" x2="454" y2="38" stroke="#CBD5E1" stroke-width="3.5"/>
      ${renderSheaveSvg(347, 60, this.sheaveAngle)}
      ${renderSheaveSvg(454, 60, this.sheaveAngle)}

      <!-- Counterweight -->
      <g transform="translate(454 ${cwY.toFixed(1)})">
        <rect x="-24" y="-26" width="48" height="52" rx="10" fill="#547188"/>
        <rect x="-20" y="-18" width="40" height="9" rx="4" fill="#7D9BB2"/>
        <rect x="-20" y="-4"  width="40" height="9" rx="4" fill="#7D9BB2"/>
        <rect x="-20" y="10"  width="40" height="9" rx="4" fill="#7D9BB2"/>
      </g>

      <!-- Elevator Car Cabin -->
      <g transform="translate(347 ${carY.toFixed(1)})">
        <rect x="-54" y="-32" width="108" height="72" rx="14" fill="#D5C8B4"/>
        <rect x="-50" y="-28" width="100" height="64" rx="11" fill="url(#el-cabin)"/>
        <rect x="-26" y="-26" width="52" height="6" rx="3" fill="#FFF3A1"/>
        ${ridingList.filter((r) => !draggedPax || draggedPax.uid !== r.uid).map((r, ri) => {
          const rx = (ri - (ridingList.length - 1) / 2) * 30;
          return `<g data-act="drag-pax" data-uid="${r.uid}" style="cursor:grab;">${renderPassengerSvg(r.p, rx, 16, 0.8, r.dest)}</g>`;
        }).join('')}
        <rect x="-50" y="-28" width="${doorHalfW.toFixed(1)}" height="64" rx="6" fill="url(#el-door)" pointer-events="none"/>
        <rect x="${(50 - doorHalfW).toFixed(1)}" y="-28" width="${doorHalfW.toFixed(1)}" height="64" rx="6" fill="url(#el-door)" pointer-events="none"/>
      </g>

      ${rightPanelSvg}

      <!-- Actively Dragged Passenger rendered on top -->
      ${draggedPax ? renderPassengerSvg(draggedPax.p, draggedPax.x, draggedPax.y, 1.05, draggedPax.dest) : ''}
    `;
  }

  /* Web Audio Elevator Synthesizers */
  playElevButton() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(1046.5, now);
    g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.09);
  }

  playArriveChime() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    [880, 659.25].forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
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
