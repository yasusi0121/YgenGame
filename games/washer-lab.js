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
    this.trayOut = false;
    this.hasSoap = false;
    this.courseIdx = 0;

    // Garments: { ...item, inDrum: false, dirty: true, angOffset }
    this.items = LAUNDRY_ITEMS.map((it, i) => ({ ...it, inDrum: false, dirty: true, angOffset: i * 90 }));

    // Cycle state: 'idle' | 'fill' | 'wash' | 'drain' | 'spin' | 'done'
    this.phase = 'idle';
    this.phaseT = 0;
    this.waterLevel = 0; // 0..1
    this.foamLevel = 0;  // 0..1
    this.drumAngle = 0;
    this.motorAngle = 0;
    this.drumSpeed = 0;
    this.washCount = 0;
    this.lastSloshAt = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#3A7D72');
    }
    this.injectStyles();
    this.renderShell();
    this.renderScene();
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
            <span class="wl2-hint" id="wl2-hint">どろんこ ふくを タップして いれよう</span>
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

    this.svgEl.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      e.preventDefault();
      this.sound.unlock();
      const act = target.dataset.act;

      if (act === 'load-item') {
        this.loadLaundryItem(Number(target.dataset.idx));
      } else if (act === 'toggle-door') {
        this.toggleDoor();
      } else if (act === 'toggle-tray') {
        this.toggleSoapTray();
      } else if (act === 'turn-dial') {
        if (this.isRunning()) return;
        this.courseIdx = (this.courseIdx + 1) % WASH_COURSES.length;
        this.playDialClick();
        this.hintEl.textContent = `コース：${WASH_COURSES[this.courseIdx].label}`;
        this.renderScene();
      } else if (act === 'start-stop') {
        this.pressStartStop();
      } else if (act === 'reset-dirty') {
        this.resetForNextLoad();
      }
    });
  }

  isRunning() {
    return ['fill', 'wash', 'drain', 'spin'].includes(this.phase);
  }

  loadLaundryItem(idx) {
    if (this.isRunning()) return;
    const it = this.items[idx];
    if (!it || it.inDrum) return;
    if (!this.doorOpen) {
      this.doorOpen = true;
      this.playDoorLatch();
    }
    it.inDrum = true;
    this.sound.playSproutPop();
    const inCount = this.items.filter((x) => x.inDrum).length;
    if (inCount === this.items.length) {
      this.hintEl.textContent = this.hasSoap ? 'ドアを しめて スタートを おそう！' : 'ひだりうえの せんざいトレイを いれよう！';
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
      // Unload sparkling clean laundry back to basket!
      this.items.forEach((it) => { it.inDrum = false; });
      this.sound.playCrackerPop();
      this.hintEl.textContent = 'ぴかぴかに なったよ！';
    }
    this.renderScene();
  }

  toggleSoapTray() {
    if (this.isRunning()) return;
    this.trayOut = !this.trayOut;
    this.hasSoap = true;
    this.playWaterBurst(0.5);
    this.hintEl.textContent = 'せんざい OK！ スタートを おそう！';
    this.renderScene();
  }

  pressStartStop() {
    if (this.isRunning()) {
      this.phase = 'idle';
      this.drumSpeed = 0;
      this.sound.playMetalClick();
      this.hintEl.textContent = 'いちじ ていし';
      this.renderScene();
      return;
    }
    const inCount = this.items.filter((x) => x.inDrum).length;
    if (inCount === 0) {
      this.sound.playBoing();
      this.hintEl.textContent = 'まず どろんこ ふくを いれよう！';
      return;
    }
    this.doorOpen = false;
    this.trayOut = false;
    const course = WASH_COURSES[this.courseIdx];
    this.phase = course.id === 'spin' ? 'spin' : 'fill';
    this.phaseT = 0;
    this.playStartChime();
    this.hintEl.textContent = this.phase === 'spin' ? 'こうそく だっすい スタート！' : 'きゅうすい ちゅう…（ジャー！）';
    this.renderScene();
    this.ensureLoop();
  }

  resetForNextLoad() {
    this.phase = 'idle';
    this.doorOpen = true;
    this.hasSoap = false;
    this.waterLevel = 0;
    this.foamLevel = 0;
    this.items.forEach((it) => { it.inDrum = false; it.dirty = true; });
    this.sound.playPageTurn(1);
    this.hintEl.textContent = 'どろんこ ふくを タップして いれよう';
    this.renderScene();
  }

  needsLoop() {
    return this.isRunning() || Math.abs(this.drumSpeed) > 1;
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
    const course = WASH_COURSES[this.courseIdx];
    this.phaseT += dt;

    if (this.phase === 'fill') {
      this.waterLevel = Math.min(1, this.waterLevel + dt * 0.55);
      this.drumSpeed = 48;
      if (now - this.lastSloshAt > 420) {
        this.lastSloshAt = now;
        this.playWaterBurst(0.7);
      }
      if (this.waterLevel >= 1) {
        this.phase = 'wash';
        this.phaseT = 0;
        this.hintEl.textContent = 'あわあわ あらい ちゅう…！';
      }
    } else if (this.phase === 'wash') {
      // Gentle tumble reversing direction every 1.4s
      const dir = Math.floor(this.phaseT / 1.4) % 2 === 0 ? 1 : -1;
      this.drumSpeed = dir * 135;
      if (this.hasSoap) this.foamLevel = Math.min(1, this.foamLevel + dt * 0.45);
      if (now - this.lastSloshAt > 560) {
        this.lastSloshAt = now;
        this.playWaterBurst(0.45);
      }
      if (this.phaseT >= course.washDur) {
        this.items.forEach((it) => { if (it.inDrum) it.dirty = false; });
        this.phase = 'drain';
        this.phaseT = 0;
        this.hintEl.textContent = 'はいすい ポンプ で みずを だすよ！';
      }
    } else if (this.phase === 'drain') {
      this.waterLevel = Math.max(0, this.waterLevel - dt * 0.65);
      this.foamLevel = Math.max(0, this.foamLevel - dt * 0.65);
      this.drumSpeed = 75;
      if (this.waterLevel <= 0.01) {
        this.phase = 'spin';
        this.phaseT = 0;
        this.hintEl.textContent = 'こうそく だっすい！（ブォーン！）';
      }
    } else if (this.phase === 'spin') {
      // High-speed centrifugal spin!
      this.drumSpeed = Math.min(720, this.drumSpeed + dt * 360);
      if (now - this.lastSloshAt > 260) {
        this.lastSloshAt = now;
        this.playSpinHum(this.drumSpeed / 720);
      }
      if (this.phaseT >= course.spinDur) {
        this.phase = 'done';
        this.drumSpeed = 0;
        this.washCount++;
        this.items.forEach((it) => { if (it.inDrum) it.dirty = false; });
        this.sound.playSuccessFanfare();
        this.hintEl.textContent = 'せんたく かんりょう！ ドアを あけよう！';
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
    const inDrumItems = this.items.filter((x) => x.inDrum);
    const basketItems = this.items.filter((x) => !x.inDrum);
    const allCleanOutside = basketItems.length === this.items.length && basketItems.every((x) => !x.dirty);

    // Drum center (320, 304), radius 112
    const dCx = 320;
    const dCy = 304;
    const waterH = this.waterLevel * 124;
    const waterY = dCy + 96 - waterH;

    // Tumbling clothes inside the drum
    const drumClothesSvg = inDrumItems.map((it) => {
      const a = ((this.drumAngle + it.angOffset) * Math.PI) / 180;
      const rad = this.phase === 'spin' ? 68 : 48;
      const cx = dCx + Math.cos(a) * rad;
      const cy = dCy + Math.sin(a) * rad;
      return renderLaundryItemSvg(it, cx, cy, 0.85, this.drumAngle + it.angOffset, it.dirty);
    }).join('');

    // Fluffy soap bubbles when washing with detergent
    const bubblesSvg = this.foamLevel > 0.05 ? [
      [-54, 16, 16], [-24, 24, 20], [10, 18, 18], [44, 22, 15],
      [-38, -8, 13], [26, -6, 14], [0, 36, 17]
    ].map(([bx, by, br], i) => `
      <circle cx="${(dCx + bx + Math.sin(this.drumAngle * 0.04 + i) * 8).toFixed(1)}"
        cy="${(waterY + by * 0.4).toFixed(1)}" r="${(br * this.foamLevel).toFixed(1)}"
        fill="#FFFFFF" opacity="0.72"/>
    `).join('') : '';

    // Right: Mechanical Cutaway Panel (Inlet Valve, Belt-Drive Motor, Drain Pump)
    const mechPanelSvg = this.xray ? `
      <rect x="526" y="42" width="242" height="422" rx="28" fill="#295B53"/>
      <rect x="526" y="34" width="242" height="422" rx="28" fill="#2F665D"/>

      <!-- 1. Top Water Inlet Solenoid Valve -->
      <rect x="546" y="54" width="202" height="72" rx="18" fill="#234F48"/>
      <line x1="560" y1="90" x2="734" y2="90" stroke="${this.phase === 'fill' ? '#5CE1E6' : 'rgba(255,255,255,0.22)'}" stroke-width="14" stroke-linecap="round"/>
      <rect x="628" y="72" width="38" height="36" rx="10" fill="${this.phase === 'fill' ? '#34D399' : '#F7C948'}"/>
      <text x="647" y="119" text-anchor="middle" font-size="11" font-weight="800" fill="rgba(255,255,255,0.8)" font-family="${FONT_ROUND}">きゅうすい バルブ</text>

      <!-- 2. Rear Drum Pulley + V-Belt + Drive Motor -->
      <rect x="546" y="138" width="202" height="196" rx="18" fill="#234F48"/>
      <!-- V-Belt connecting large drum pulley (647,208) to lower drive motor (647,298) -->
      <line x1="598" y1="208" x2="626" y2="298" stroke="#94A3B8" stroke-width="5.5" stroke-linecap="round"/>
      <line x1="696" y1="208" x2="668" y2="298" stroke="#94A3B8" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Large Drum Pulley -->
      <g transform="translate(647 208) rotate(${this.drumAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="48" fill="none" stroke="#DCE5EF" stroke-width="8"/>
        <line x1="-44" y1="0" x2="44" y2="0" stroke="#DCE5EF" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="-44" x2="0" y2="44" stroke="#DCE5EF" stroke-width="6" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="12" fill="#F7C948"/>
      </g>
      <!-- Lower High-Speed Motor -->
      <g transform="translate(647 298) rotate(${this.motorAngle.toFixed(1)})">
        <circle cx="0" cy="0" r="22" fill="#56CCF2"/>
        <rect x="-4" y="-16" width="8" height="32" rx="4" fill="#FFFFFF"/>
        <circle cx="0" cy="0" r="7" fill="#234F48"/>
      </g>
      <text x="647" y="330" text-anchor="middle" font-size="11" font-weight="800" fill="rgba(255,255,255,0.8)" font-family="${FONT_ROUND}">モーター ＆ Vベルト</text>

      <!-- 3. Bottom Drain Pump -->
      <rect x="546" y="346" width="202" height="90" rx="18" fill="#234F48"/>
      <line x1="560" y1="388" x2="734" y2="388" stroke="${this.phase === 'drain' || this.phase === 'spin' ? '#5CE1E6' : 'rgba(255,255,255,0.22)'}" stroke-width="14" stroke-linecap="round"/>
      <g transform="translate(647 388) rotate(${(this.phase === 'drain' || this.phase === 'spin') ? this.motorAngle.toFixed(0) : 0})">
        <circle cx="0" cy="0" r="20" fill="#FF9F5A"/>
        <rect x="-3.5" y="-14" width="7" height="28" rx="3.5" fill="#FFFFFF"/>
        <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#FFFFFF"/>
      </g>
      <text x="647" y="428" text-anchor="middle" font-size="11" font-weight="800" fill="rgba(255,255,255,0.8)" font-family="${FONT_ROUND}">はいすい ポンプ</text>
    ` : '';

    this.sceneEl.innerHTML = `
      <circle cx="96" cy="95" r="120" fill="rgba(255,255,255,0.04)"/>

      <!-- Left: Laundry Basket with Tappable Clothes -->
      <g transform="translate(88 354)">
        <ellipse cx="0" cy="108" rx="64" ry="12" fill="rgba(0,0,0,0.14)"/>
        <!-- Woven Matte Cream Laundry Basket -->
        <path d="M -56 12 H 56 L 46 102 Q 44 110 34 110 H -34 Q -44 110 -46 102 Z" fill="#E3BC8E"/>
        <rect x="-60" y="2" width="120" height="16" rx="8" fill="#F0CFA6"/>
        <line x1="-42" y1="36" x2="42" y2="36" stroke="#C99B6B" stroke-width="4" stroke-linecap="round"/>
        <line x1="-38" y1="62" x2="38" y2="62" stroke="#C99B6B" stroke-width="4" stroke-linecap="round"/>
        <line x1="-34" y1="88" x2="34" y2="88" stroke="#C99B6B" stroke-width="4" stroke-linecap="round"/>
      </g>
      ${this.items.map((it, idx) => {
        if (it.inDrum) return '';
        const bx = 66 + (idx % 2) * 46;
        const by = 274 + Math.floor(idx / 2) * 58;
        return `<g data-act="load-item" data-idx="${idx}" style="cursor:pointer;">${renderLaundryItemSvg(it, bx, by, 1.0, (idx - 1.5) * 8, it.dirty)}</g>`;
      }).join('')}
      ${allCleanOutside ? `
        <g data-act="reset-dirty" style="cursor:pointer;" transform="translate(88 214)">
          <rect x="-56" y="-18" width="112" height="40" rx="20" fill="#D19D1E"/>
          <rect x="-56" y="-22" width="112" height="40" rx="20" fill="#F7C948"/>
          <text x="0" y="3" text-anchor="middle" font-size="13" font-weight="900" fill="#2D3436" font-family="${FONT_ROUND}">もういっかい</text>
        </g>
      ` : ''}

      <!-- Center: Sculpted Matte Porcelain Drum Washing Machine (x: 168..472) -->
      <ellipse cx="320" cy="466" rx="154" ry="14" fill="rgba(0,0,0,0.14)"/>
      <rect x="168" y="44" width="304" height="422" rx="34" fill="#CBD6E2"/>
      <rect x="168" y="34" width="304" height="422" rx="34" fill="url(#wl2-body)"/>

      <!-- Top Control Fascia -->
      <line x1="184" y1="138" x2="456" y2="138" stroke="#DCE5EF" stroke-width="3" stroke-linecap="round"/>

      <!-- Left Top: Slide-Out Detergent Drawer -->
      <g data-act="toggle-tray" style="cursor:pointer;" transform="translate(${this.trayOut ? 176 : 192} 56)">
        <rect x="0" y="4" width="84" height="58" rx="14" fill="#CBD6E2"/>
        <rect x="0" y="0" width="84" height="58" rx="14" fill="#FFFFFF"/>
        <rect x="12" y="12" width="60" height="22" rx="8" fill="${this.hasSoap ? '#56CCF2' : '#EAF4FA'}"/>
        <rect x="26" y="44" width="32" height="6" rx="3" fill="#B8C4D0"/>
      </g>

      <!-- Center Top: Chunky Rotating Course Dial -->
      <g data-act="turn-dial" style="cursor:pointer;" transform="translate(322 86)">
        <circle cx="0" cy="4" r="30" fill="#CBD6E2"/>
        <circle cx="0" cy="0" r="30" fill="url(#wl2-chrome)"/>
        <g transform="rotate(${course.deg})">
          <circle cx="0" cy="0" r="22" fill="#FFFFFF"/>
          <rect x="-3.5" y="-20" width="7" height="14" rx="3.5" fill="#3A7D72"/>
        </g>
        <text x="0" y="44" text-anchor="middle" font-size="11.5" font-weight="900" fill="#3A7D72" font-family="${FONT_ROUND}">${course.label}</text>
      </g>

      <!-- Right Top: Glowing Start / Pause Push Button -->
      <g data-act="start-stop" style="cursor:pointer;" transform="translate(418 86)">
        <circle cx="0" cy="4" r="25" fill="${running ? '#C43B3C' : '#059669'}"/>
        <circle cx="0" cy="0" r="25" fill="${running ? '#F05A5B' : '#34D399'}"/>
        ${running
          ? `<rect x="-7" y="-8" width="5" height="16" rx="2.5" fill="#FFFFFF"/><rect x="2" y="-8" width="5" height="16" rx="2.5" fill="#FFFFFF"/>`
          : `<polygon points="-5,-9 11,0 -5,9" fill="#FFFFFF"/>`
        }
      </g>

      <!-- Big Round Porthole Drum Window (tap door ring to open/close!) -->
      <g data-act="toggle-door" style="cursor:pointer;">
        <circle cx="${dCx}" cy="${dCy + 6}" r="118" fill="rgba(0,0,0,0.08)"/>
        <circle cx="${dCx}" cy="${dCy}" r="118" fill="url(#wl2-chrome)"/>
        <circle cx="${dCx}" cy="${dCy}" r="96" fill="#2A3E4C"/>

        <!-- Rotating Stainless Drum Baffles -->
        <g transform="translate(${dCx} ${dCy}) rotate(${this.drumAngle.toFixed(1)})">
          <circle cx="0" cy="0" r="88" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="5" stroke-dasharray="12 10"/>
          ${[0, 120, 240].map((a) => `<rect x="-12" y="-92" width="24" height="14" rx="6" fill="#94A3B8" transform="rotate(${a})"/>`).join('')}
        </g>

        <!-- Clip Water & Clothes cleanly inside round drum! -->
        <clipPath id="wl2-drum-clip"><circle cx="${dCx}" cy="${dCy}" r="94"/></clipPath>
        <g clip-path="url(#wl2-drum-clip)">
          ${waterH > 2 ? `<rect x="${dCx - 98}" y="${waterY.toFixed(1)}" width="196" height="${(waterH + 10).toFixed(1)}" fill="#5CE1E6" opacity="0.62"/>` : ''}
          ${drumClothesSvg}
          ${bubblesSvg}
        </g>

        <!-- Glass Sheen Overlay (opens aside when doorOpen!) -->
        ${!this.doorOpen ? `
          <circle cx="${dCx}" cy="${dCy}" r="96" fill="url(#wl2-glass)"/>
          <path d="M ${dCx - 58} ${dCy - 50} A 78 78 0 0 1 ${dCx + 42} ${dCy - 62}" stroke="rgba(255,255,255,0.58)" stroke-width="7" stroke-linecap="round" fill="none"/>
        ` : `
          <!-- Open swung door edge indicator -->
          <circle cx="${dCx}" cy="${dCy}" r="96" fill="none" stroke="#34D399" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/>
        `}
        <!-- Door Handle Grip on right rim -->
        <rect x="${dCx + 96}" y="${dCy - 24}" width="14" height="48" rx="7" fill="${this.doorOpen ? '#34D399' : '#94A3B8'}"/>
      </g>

      ${mechPanelSvg}
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
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
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
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
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
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110 + ratio * 220, now);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.24);
  }
}
