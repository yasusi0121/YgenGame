import {
  FONT_ROUND,
  LAUNDRY_ITEMS,
  WASH_COURSES,
  buildWasherDefsSvg,
  renderLaundryItemSvg
} from './washer-lab-assets.js';

export default class WasherLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.xray = true;
    this.doorOpen = true;
    this.trayOut = true;
    this.soapLevel = 0; // 0..1 filled by dragging detergent bottle over drawer!
    this.courseIdx = 0;

    // Garments: state 'basket' | 'drum' | 'hung'
    this.items = [];
    this.phase = 'idle'; // 'idle' | 'fill' | 'wash' | 'drain' | 'spin' | 'done'
    this.phaseT = 0;
    this.waterLevel = 0;
    this.foamLevel = 0;
    this.drumAngle = 0;
    this.motorAngle = 0;
    this.drumSpeed = 0;
    this.washCount = 0;
    this.lastSloshAt = 0;

    // Active drag: { kind: 'item'|'bottle'|'dial', idx?, x, y, lastAng? }
    this.drag = null;
    this.bottlePos = { x: 86, y: 122 };
    this.pouring = false;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#3A7D72');
    }
    this.injectStyles();
    this.renderShell();
    this.spawnDirtyBasket();
    this.ensureLoop();
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
    const old = document.getElementById('wl2-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'wl2-styles';
    style.textContent = `
      .wl2-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #3A7D72; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .wl2-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .wl2-pill {
        display: inline-flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.3);
        border-radius: 999px; padding: 5px 16px;
      }
      .wl2-hint { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .wl2-eye-btn {
        border: none; border-radius: 999px; padding: 4px 11px;
        background: rgba(255,255,255,0.25); color: #FFFFFF; font-size: 12px; font-weight: 800;
        cursor: pointer; font-family: inherit;
      }
      .wl2-eye-btn.active { background: #34D399; box-shadow: 0 2px 0 #059669; }
      .wl2-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .wl2-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }
      @media (max-width: 640px) {
        .wl2-root { padding: 8px 6px; }
        .wl2-topbar { padding-left: 44px; padding-right: 44px; }
        .wl2-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="wl2-root">
        <div class="wl2-topbar">
          <div class="wl2-pill">
            <span class="wl2-hint" id="wl2-hint">どろんこ ふくを ドラッグして ドラムへ いれよう！</span>
            <button class="wl2-eye-btn active" id="wl2-xray-btn" type="button">なか</button>
          </div>
        </div>
        <div class="wl2-stage-wrap">
          <svg class="wl2-svg" id="wl2-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildWasherDefsSvg()}
            <g id="wl2-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#wl2-svg');
    this.sceneEl = this.mountEl.querySelector('#wl2-scene');
    this.hintEl = this.mountEl.querySelector('#wl2-hint');
    this.xrayBtn = this.mountEl.querySelector('#wl2-xray-btn');

    this.xrayBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playMetalClick();
      this.xray = !this.xray;
      this.xrayBtn.classList.toggle('active', this.xray);
      this.renderScene();
    });

    this.svgEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  spawnDirtyBasket() {
    this.phase = 'idle';
    this.doorOpen = true;
    this.trayOut = true;
    this.soapLevel = 0;
    this.waterLevel = 0;
    this.foamLevel = 0;
    this.bottlePos = { x: 86, y: 122 };
    this.items = LAUNDRY_ITEMS.map((it, i) => {
      const bx = 64 + (i % 2) * 48;
      const by = 292 + Math.floor(i / 2) * 56;
      return { ...it, idx: i, state: 'basket', dirty: true, x: bx, y: by, homeX: bx, homeY: by, angOffset: i * 90 };
    });
    this.hintEl.textContent = 'どろんこ ふくを ドラッグして ドラムへ いれよう！';
    this.renderScene();
  }

  isRunning() {
    return ['fill', 'wash', 'drain', 'spin'].includes(this.phase);
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

    if (act === 'drag-item') {
      if (this.isRunning()) return;
      const idx = Number(target.dataset.idx);
      const it = this.items[idx];
      if (!it || it.state === 'hung') return;
      if (it.state === 'drum' && !this.doorOpen) {
        this.sound.playBoing();
        this.hintEl.textContent = 'まず ドアを あけてから とりだそう！';
        return;
      }
      this.drag = { kind: 'item', idx, x: pt.x, y: pt.y };
      it.x = pt.x;
      it.y = pt.y;
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'drag-bottle') {
      if (this.isRunning()) return;
      this.drag = { kind: 'bottle', x: pt.x, y: pt.y };
      this.bottlePos = { x: pt.x, y: pt.y };
      this.renderScene();
    } else if (act === 'toggle-door') {
      this.toggleDoor();
    } else if (act === 'toggle-tray') {
      if (this.isRunning()) return;
      this.trayOut = !this.trayOut;
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'turn-dial') {
      if (this.isRunning()) return;
      this.courseIdx = (this.courseIdx + 1) % WASH_COURSES.length;
      this.playDialClick();
      this.hintEl.textContent = `コース：${WASH_COURSES[this.courseIdx].label}`;
      this.renderScene();
    } else if (act === 'start-stop') {
      this.pressStartStop();
    }
  }

  handlePointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const pt = this.getSvgPoint(e);
    this.drag.x = pt.x;
    this.drag.y = pt.y;

    if (this.drag.kind === 'item') {
      const it = this.items[this.drag.idx];
      if (it) {
        it.x = pt.x;
        it.y = pt.y;
        this.renderScene();
      }
    } else if (this.drag.kind === 'bottle') {
      this.bottlePos = { x: pt.x, y: pt.y };
      // Pour detergent when held over top-left soap tray (x: 165..285, y: 35..135)!
      const overTray = this.trayOut && pt.x >= 155 && pt.x <= 290 && pt.y >= 20 && pt.y <= 140;
      this.pouring = overTray && this.soapLevel < 1;
      if (this.pouring) {
        this.ensureLoop();
      }
      this.renderScene();
    }
  }

  handlePointerUp() {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;
    this.pouring = false;

    if (d.kind === 'item') {
      const it = this.items[d.idx];
      if (it) {
        const inDrumZone = Math.hypot(d.x - 320, d.y - 310) <= 112;
        const onClothesline = d.x >= 505 && d.x <= 785 && d.y >= 30 && d.y <= 175;

        if (it.state === 'basket' && inDrumZone) {
          if (!this.doorOpen) {
            it.x = it.homeX; it.y = it.homeY;
            this.sound.playBoing();
            this.hintEl.textContent = 'ドアが しまっているよ！ ドアを あけてね！';
          } else {
            it.state = 'drum';
            this.sound.playSproutPop();
            const remaining = this.items.filter((x) => x.state === 'basket').length;
            if (remaining === 0) {
              this.hintEl.textContent = this.soapLevel < 0.8
                ? 'あおい せんざいボトルを トレイの うえで かたむけよう！'
                : 'ドアを しめて スタートボタンを おそう！';
            }
          }
        } else if (it.state === 'drum' && !it.dirty && onClothesline) {
          // Hang sparkling clean item on the clothesline!
          it.state = 'hung';
          const hungIdx = this.items.filter((x) => x.state === 'hung').length - 1;
          it.x = 562 + hungIdx * 56;
          it.y = 104;
          this.sound.playSproutPop();
          if (this.items.every((x) => x.state === 'hung')) {
            this.washCount++;
            this.sound.playCrackerPop();
            this.hintEl.textContent = 'ぜんぶ ぴかぴかに ほせたよ！ だいせいこう！';
            setTimeout(() => {
              if (!this.destroyed) this.spawnDirtyBasket();
            }, 1500);
          } else {
            this.hintEl.textContent = 'のこりの ふくも ものほしざお へ ほそう！';
          }
        } else if (it.state === 'basket') {
          it.x = it.homeX; it.y = it.homeY;
        }
      }
    } else if (d.kind === 'bottle') {
      this.bottlePos = { x: 86, y: 122 };
      if (this.soapLevel >= 0.85) {
        this.trayOut = false;
        this.hintEl.textContent = 'せんざい たっぷり OK！ ドアを しめて スタート！';
      }
    }

    this.renderScene();
  }

  toggleDoor() {
    if (this.isRunning()) {
      this.sound.playBoing();
      this.hintEl.textContent = 'うごいている あいだは ドアロックちゅう！';
      return;
    }
    this.doorOpen = !this.doorOpen;
    this.playDoorLatch();
    if (this.phase === 'done' && this.doorOpen) {
      this.hintEl.textContent = 'ぴかぴかの ふくを ドラッグして みぎうえの ものほしざお へ ほそう！';
    }
    this.renderScene();
  }

  pressStartStop() {
    if (this.isRunning()) {
      this.phase = 'idle';
      this.drumSpeed = 0;
      this.sound.playMetalClick();
      this.renderScene();
      return;
    }
    if (this.items.filter((x) => x.state === 'drum').length === 0) {
      this.sound.playBoing();
      this.hintEl.textContent = 'まず ふくを ドラッグして ドラムへ いれよう！';
      return;
    }
    if (this.doorOpen) {
      this.doorOpen = false;
      this.playDoorLatch();
    }
    this.trayOut = false;
    const course = WASH_COURSES[this.courseIdx];
    this.phase = course.id === 'spin' ? 'spin' : 'fill';
    this.phaseT = 0;
    this.playStartChime();
    this.hintEl.textContent = this.phase === 'spin' ? 'こうそく だっすい スタート！' : 'きゅうすい ちゅう…（ジャー！）';
    this.renderScene();
    this.ensureLoop();
  }

  needsLoop() {
    return this.isRunning() || this.pouring || Math.abs(this.drumSpeed) > 1;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.step(dt, now);
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

  step(dt, now) {
    if (this.pouring && this.soapLevel < 1) {
      this.soapLevel = Math.min(1, this.soapLevel + dt * 0.75);
      if (now - this.lastSloshAt > 260) {
        this.lastSloshAt = now;
        this.playWaterBurst(0.4);
      }
      if (this.soapLevel >= 1) {
        this.pouring = false;
        this.sound.playSproutPop();
      }
    }

    const course = WASH_COURSES[this.courseIdx];
    if (this.isRunning()) this.phaseT += dt;

    if (this.phase === 'fill') {
      this.waterLevel = Math.min(1, this.waterLevel + dt * 0.6);
      this.drumSpeed = 48;
      if (now - this.lastSloshAt > 420) { this.lastSloshAt = now; this.playWaterBurst(0.7); }
      if (this.waterLevel >= 1) {
        this.phase = 'wash';
        this.phaseT = 0;
        this.hintEl.textContent = 'あわあわ あらい ちゅう…！';
      }
    } else if (this.phase === 'wash') {
      const dir = Math.floor(this.phaseT / 1.4) % 2 === 0 ? 1 : -1;
      this.drumSpeed = dir * 135;
      if (this.soapLevel > 0.15) this.foamLevel = Math.min(1, this.foamLevel + dt * 0.48);
      if (now - this.lastSloshAt > 560) { this.lastSloshAt = now; this.playWaterBurst(0.45); }
      if (this.phaseT >= course.washDur) {
        this.items.forEach((it) => { if (it.state === 'drum') it.dirty = false; });
        this.phase = 'drain';
        this.phaseT = 0;
        this.hintEl.textContent = 'はいすい ポンプ で みずを だすよ！';
      }
    } else if (this.phase === 'drain') {
      this.waterLevel = Math.max(0, this.waterLevel - dt * 0.7);
      this.foamLevel = Math.max(0, this.foamLevel - dt * 0.7);
      this.drumSpeed = 75;
      if (this.waterLevel <= 0.01) {
        this.phase = 'spin';
        this.phaseT = 0;
        this.hintEl.textContent = 'こうそく だっすい！（ブォーン！）';
      }
    } else if (this.phase === 'spin') {
      this.drumSpeed = Math.min(720, this.drumSpeed + dt * 360);
      if (now - this.lastSloshAt > 260) { this.lastSloshAt = now; this.playSpinHum(this.drumSpeed / 720); }
      if (this.phaseT >= course.spinDur) {
        this.phase = 'done';
        this.drumSpeed = 0;
        this.items.forEach((it) => { if (it.state === 'drum') it.dirty = false; });
        this.sound.playSuccessFanfare();
        this.hintEl.textContent = 'せんたく かんりょう！ ドアを あけて ものほしざお へ ほそう！';
      }
    } else {
      this.drumSpeed *= 0.85;
      if (Math.abs(this.drumSpeed) < 2) this.drumSpeed = 0;
    }

    this.drumAngle = (this.drumAngle + this.drumSpeed * dt) % 360;
    this.motorAngle = (this.motorAngle + this.drumSpeed * 2.4 * dt) % 360;
    this.renderScene();
  }

  renderScene() {
    const course = WASH_COURSES[this.courseIdx];
    const running = this.isRunning();
    const dCx = 320;
    const dCy = 310;
    const waterH = this.waterLevel * 124;
    const waterY = dCy + 96 - waterH;

    const draggedItem = (this.drag && this.drag.kind === 'item') ? this.items[this.drag.idx] : null;
    const inDrumItems = this.items.filter((x) => x.state === 'drum' && (!draggedItem || draggedItem.idx !== x.idx));
    const basketItems = this.items.filter((x) => x.state === 'basket' && (!draggedItem || draggedItem.idx !== x.idx));
    const hungItems = this.items.filter((x) => x.state === 'hung');

    const drumClothesSvg = inDrumItems.map((it) => {
      const a = ((this.drumAngle + it.angOffset) * Math.PI) / 180;
      const rad = this.phase === 'spin' ? 66 : 44;
      const cx = dCx + Math.cos(a) * rad;
      const cy = dCy + Math.sin(a) * rad;
      const canPullOut = !running && this.doorOpen && !it.dirty;
      return `
        <g ${canPullOut ? `data-act="drag-item" data-idx="${it.idx}" style="cursor:grab;"` : ''}>
          ${renderLaundryItemSvg(it, cx, cy, 0.85, this.drumAngle + it.angOffset, it.dirty)}
        </g>
      `;
    }).join('');

    const bubblesSvg = this.foamLevel > 0.05 ? [
      [-52, 16, 15], [-22, 24, 19], [10, 18, 17], [42, 22, 14], [-36, -6, 12], [26, -6, 13]
    ].map(([bx, by, br], i) => `
      <circle cx="${(dCx + bx + Math.sin(this.drumAngle * 0.04 + i) * 8).toFixed(1)}"
        cy="${(waterY + by * 0.4).toFixed(1)}" r="${(br * this.foamLevel).toFixed(1)}" fill="#FFFFFF" opacity="0.72"/>
    `).join('') : '';

    // Right Top: Clothesline drying rack (drop clean clothes here!)
    const clotheslineSvg = `
      <g>
        <rect x="526" y="42" width="244" height="122" rx="22" fill="rgba(255,255,255,0.12)"
          stroke="${this.phase === 'done' && this.doorOpen ? '#FFE082' : 'rgba(255,255,255,0.22)'}" stroke-width="3" stroke-dasharray="10 7"/>
        <line x1="538" y1="74" x2="758" y2="74" stroke="#F0CFA6" stroke-width="6" stroke-linecap="round"/>
        ${[562, 618, 674, 730].map((px) => `<rect x="${px - 4}" y="66" width="8" height="16" rx="3" fill="#F7C948"/>`).join('')}
        ${hungItems.map((it) => renderLaundryItemSvg(it, it.x, it.y, 0.92, 0, false)).join('')}
        <text x="648" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="rgba(255,255,255,0.82)" font-family="${FONT_ROUND}">ものほしざお (${hungItems.length}/4)</text>
      </g>
    `;

    // Right Bottom: Mechanical Cutaway Panel (Belt-Drive Motor + Drain Pump)
    const mechPanelSvg = this.xray ? `
      <rect x="526" y="182" width="244" height="284" rx="26" fill="#295B53"/>
      <rect x="526" y="176" width="244" height="284" rx="26" fill="#2F665D"/>
      <rect x="544" y="192" width="208" height="168" rx="18" fill="#234F48"/>
      <line x1="600" y1="252" x2="628" y2="332" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
      <line x1="696" y1="252" x2="668" y2="332" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(648 252) rotate(${this.drumAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="44" fill="none" stroke="#DCE5EF" stroke-width="7"/>
        <line x1="-40" y1="0" x2="40" y2="0" stroke="#DCE5EF" stroke-width="5.5" stroke-linecap="round"/>
        <line x1="0" y1="-40" x2="0" y2="40" stroke="#DCE5EF" stroke-width="5.5" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="11" fill="#F7C948"/>
      </g>
      <g transform="translate(648 332) rotate(${this.motorAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="20" fill="#56CCF2"/>
        <rect x="-3.5" y="-14" width="7" height="28" rx="3.5" fill="#FFFFFF"/>
        <circle cx="0" cy="0" r="6" fill="#234F48"/>
      </g>
      <!-- Drain Pump -->
      <rect x="544" y="370" width="208" height="74" rx="16" fill="#234F48"/>
      <line x1="558" y1="406" x2="738" y2="406" stroke="${this.phase === 'drain' || this.phase === 'spin' ? '#5CE1E6' : 'rgba(255,255,255,0.22)'}" stroke-width="13" stroke-linecap="round"/>
      <g transform="translate(648 406) rotate(${(this.phase === 'drain' || this.phase === 'spin') ? this.motorAngle.toFixed(0) : 0})">
        <circle cx="0" cy="0" r="18" fill="#FF9F5A"/>
        <rect x="-3" y="-13" width="6" height="26" rx="3" fill="#FFFFFF"/>
        <rect x="-13" y="-3" width="26" height="6" rx="3" fill="#FFFFFF"/>
      </g>
    ` : '';

    this.sceneEl.innerHTML = `
      <!-- Left: Laundry Basket -->
      <g transform="translate(88 358)">
        <ellipse cx="0" cy="102" rx="62" ry="11" fill="rgba(0,0,0,0.14)"/>
        <path d="M -54 12 H 54 L 44 98 Q 42 106 32 106 H -32 Q -42 106 -44 98 Z" fill="#E3BC8E"/>
        <rect x="-58" y="2" width="116" height="16" rx="8" fill="#F0CFA6"/>
      </g>
      ${basketItems.map((it) => `
        <g data-act="drag-item" data-idx="${it.idx}" style="cursor:grab;">
          ${renderLaundryItemSvg(it, it.x, it.y, 1.0, (it.idx - 1.5) * 8, it.dirty)}
        </g>
      `).join('')}

      <!-- Center: Sculpted Matte Porcelain Drum Washer -->
      <ellipse cx="320" cy="468" rx="154" ry="14" fill="rgba(0,0,0,0.14)"/>
      <rect x="168" y="48" width="304" height="418" rx="34" fill="#CBD6E2"/>
      <rect x="168" y="38" width="304" height="418" rx="34" fill="url(#wl2-body)"/>
      <line x1="184" y1="142" x2="456" y2="142" stroke="#DCE5EF" stroke-width="3" stroke-linecap="round"/>

      <!-- Left Top: Slide-Out Detergent Drawer (fill with bottle!) -->
      <g data-act="toggle-tray" style="cursor:pointer;" transform="translate(${this.trayOut ? 174 : 192} 58)">
        <rect x="0" y="4" width="86" height="58" rx="14" fill="#CBD6E2"/>
        <rect x="0" y="0" width="86" height="58" rx="14" fill="#FFFFFF"/>
        <rect x="12" y="12" width="62" height="24" rx="8" fill="#EAF4FA"/>
        ${this.soapLevel > 0.02 ? `<rect x="12" y="${(36 - this.soapLevel * 24).toFixed(1)}" width="62" height="${(this.soapLevel * 24).toFixed(1)}" rx="6" fill="#56CCF2"/>` : ''}
        <rect x="26" y="44" width="34" height="6" rx="3" fill="#B8C4D0"/>
      </g>

      <!-- Center Top: Rotating Course Dial -->
      <g data-act="turn-dial" style="cursor:pointer;" transform="translate(322 90)">
        <circle cx="0" cy="4" r="29" fill="#CBD6E2"/>
        <circle cx="0" cy="0" r="29" fill="url(#wl2-chrome)"/>
        <g transform="rotate(${course.deg})">
          <circle cx="0" cy="0" r="21" fill="#FFFFFF"/>
          <rect x="-3.5" y="-19" width="7" height="13" rx="3.5" fill="#3A7D72"/>
        </g>
        <text x="0" y="43" text-anchor="middle" font-size="11.5" font-weight="900" fill="#3A7D72" font-family="${FONT_ROUND}">${course.label}</text>
      </g>

      <!-- Right Top: Start / Pause Button -->
      <g data-act="start-stop" style="cursor:pointer;" transform="translate(418 90)">
        <circle cx="0" cy="4" r="24" fill="${running ? '#C43B3C' : '#059669'}"/>
        <circle cx="0" cy="0" r="24" fill="${running ? '#F05A5B' : '#34D399'}"/>
        ${running
          ? `<rect x="-7" y="-8" width="5" height="16" rx="2.5" fill="#FFFFFF"/><rect x="2" y="-8" width="5" height="16" rx="2.5" fill="#FFFFFF"/>`
          : `<polygon points="-5,-9 11,0 -5,9" fill="#FFFFFF"/>`
        }
      </g>

      <!-- Big Round Drum Window -->
      <circle cx="${dCx}" cy="${dCy + 6}" r="116" fill="rgba(0,0,0,0.08)"/>
      <g data-act="toggle-door" style="cursor:pointer;">
        <circle cx="${dCx}" cy="${dCy}" r="116" fill="url(#wl2-chrome)"/>
        <rect x="${dCx + 94}" y="${dCy - 24}" width="14" height="48" rx="7" fill="${this.doorOpen ? '#34D399' : '#94A3B8'}"/>
      </g>
      <circle cx="${dCx}" cy="${dCy}" r="94" fill="#2A3E4C"/>

      <g transform="translate(${dCx} ${dCy}) rotate(${this.drumAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="86" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="5" stroke-dasharray="12 10"/>
        ${[0, 120, 240].map((a) => `<rect x="-12" y="-90" width="24" height="14" rx="6" fill="#94A3B8" transform="rotate(${a})"/>`).join('')}
      </g>

      <clipPath id="wl2-drum-clip"><circle cx="${dCx}" cy="${dCy}" r="92"/></clipPath>
      <g clip-path="url(#wl2-drum-clip)">
        ${waterH > 2 ? `<rect x="${dCx - 96}" y="${waterY.toFixed(1)}" width="192" height="${(waterH + 10).toFixed(1)}" fill="#5CE1E6" opacity="0.62"/>` : ''}
        ${drumClothesSvg}
        ${bubblesSvg}
      </g>

      ${!this.doorOpen ? `
        <circle cx="${dCx}" cy="${dCy}" r="94" fill="url(#wl2-glass)" pointer-events="none"/>
        <path d="M ${dCx - 56} ${dCy - 48} A 76 76 0 0 1 ${dCx + 40} ${dCy - 60}" stroke="rgba(255,255,255,0.58)" stroke-width="7" stroke-linecap="round" fill="none" pointer-events="none"/>
      ` : `
        <circle cx="${dCx}" cy="${dCy}" r="94" fill="none" stroke="#34D399" stroke-width="4.5" stroke-dasharray="14 10" stroke-linecap="round" pointer-events="none"/>
      `}

      ${clotheslineSvg}
      ${mechPanelSvg}

      <!-- Draggable Blue Liquid Detergent Bottle (tilts & pours stream when held over soap tray!) -->
      <g data-act="drag-bottle" style="cursor:grab;" transform="translate(${this.bottlePos.x.toFixed(1)} ${this.bottlePos.y.toFixed(1)}) rotate(${this.pouring ? 55 : 0})">
        <rect x="-18" y="-22" width="36" height="54" rx="12" fill="#56CCF2"/>
        <rect x="-9"  y="-34" width="18" height="14" rx="5"  fill="#FFFFFF"/>
        <rect x="-12" y="-6"  width="24" height="22" rx="6"  fill="#FFFFFF" opacity="0.9"/>
        <circle cx="0" cy="5" r="6" fill="#56CCF2"/>
        <path d="M 18 -10 Q 28 -10 28 4 Q 28 16 18 16" fill="none" stroke="#2F9BC4" stroke-width="5" stroke-linecap="round"/>
      </g>
      ${this.pouring ? `
        <line x1="${(this.bottlePos.x + 22).toFixed(1)}" y1="${(this.bottlePos.y - 10).toFixed(1)}"
          x2="215" y2="82" stroke="#5CE1E6" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 6"/>
      ` : ''}

      <!-- Actively Dragged Garment on top of everything! -->
      ${draggedItem ? renderLaundryItemSvg(draggedItem, draggedItem.x, draggedItem.y, 1.15, 0, draggedItem.dirty) : ''}
    `;
  }

  /* Web Audio Washer Effects */
  playDoorLatch() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    g.gain.setValueAtTime(0.24, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.1);
  }

  playDialClick() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.03);
    g.gain.setValueAtTime(0.14, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.04);
  }

  playStartChime() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const now = ctx.currentTime + i * 0.07;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.17);
    });
  }

  playWaterBurst(level = 0.6) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 600 + level * 450; bp.Q.value = 1.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14 * level, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    src.connect(bp); bp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.3);
  }

  playSpinHum(ratio = 0.5) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(110 + ratio * 220, now);
    g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.24);
  }
}
