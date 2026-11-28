import {
  FONT_ROUND,
  SHOP_ITEMS,
  buildRegisterDefsSvg,
  renderShopItemSvg
} from './register-lab-assets.js';

export default class RegisterLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.cart = []; // [{ id, name, price }]
    this.total = 0;
    this.customersServed = 0;

    // Thermal paper roll & checkout drawer state
    this.paperRemain = 1.0; // 0..1 (reduces with each scanned line & receipt!)
    this.drawerOpen = 0;    // 0 closed .. 1 open
    this.drawerTarget = 0;
    this.receiptReady = false;
    this.laserFlash = null; // { x, y, life }
    this.scanCount = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#F6EFE4');
    }
    this.injectStyles();
    this.renderShell();
    this.renderScene();
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
    const old = document.getElementById('rl-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'rl-styles';
    style.textContent = `
      .rl-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #F6EFE4; color: #3D405B; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .rl-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .rl-pill {
        display: inline-flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.88); border: 2px solid #FFFFFF;
        border-radius: 999px; padding: 5px 16px;
        box-shadow: 0 3px 0 rgba(61,64,91,0.08);
      }
      .rl-hint { font-size: 14px; font-weight: 800; color: #3D405B; }
      .rl-score {
        background: #45B5A2; color: #FFFFFF; font-size: 13px; font-weight: 900;
        padding: 2px 10px; border-radius: 999px;
      }
      .rl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .rl-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }
      @media (max-width: 640px) {
        .rl-root { padding: 8px 6px; }
        .rl-topbar { padding-left: 44px; padding-right: 44px; }
        .rl-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="rl-root">
        <div class="rl-topbar">
          <div class="rl-pill">
            <span class="rl-hint" id="rl-hint">しょうひんを タップして ピッ！と スキャンしよう</span>
            <span class="rl-score" id="rl-score">0にん</span>
          </div>
        </div>
        <div class="rl-stage-wrap">
          <svg class="rl-svg" id="rl-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildRegisterDefsSvg()}
            <g id="rl-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#rl-svg');
    this.sceneEl = this.mountEl.querySelector('#rl-scene');
    this.hintEl = this.mountEl.querySelector('#rl-hint');
    this.scoreEl = this.mountEl.querySelector('#rl-score');

    this.svgEl.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      e.preventDefault();
      this.sound.unlock();
      const act = target.dataset.act;

      if (act === 'scan-item') {
        this.scanItem(target.dataset.id);
      } else if (act === 'checkout') {
        this.pressCheckout();
      } else if (act === 'tear-receipt') {
        this.tearReceipt();
      } else if (act === 'refill-roll') {
        this.refillPaperRoll();
      } else if (act === 'toggle-drawer') {
        this.drawerTarget = this.drawerTarget > 0.5 ? 0 : 1;
        this.playDrawerBell();
        this.ensureLoop();
      } else if (act === 'clear-cart') {
        this.cart = [];
        this.total = 0;
        this.receiptReady = false;
        this.drawerTarget = 0;
        this.sound.playPageTurn(-1);
        this.hintEl.textContent = 'しょうひんを タップして ピッ！と スキャンしよう';
        this.renderScene();
        this.ensureLoop();
      }
    });
  }

  scanItem(id) {
    if (this.paperRemain <= 0.02) {
      this.sound.playBoing();
      this.hintEl.textContent = 'レシートの かみが ないよ！ ロールを タップして ほじゅうしよう！';
      return;
    }
    const idx = SHOP_ITEMS.findIndex((x) => x.id === id);
    const item = SHOP_ITEMS[idx];
    if (!item) return;

    this.cart.push(item);
    if (this.cart.length > 7) this.cart.shift();
    this.total += item.price;
    this.paperRemain = Math.max(0, this.paperRemain - 0.075);
    this.receiptReady = false;

    const ix = 104 + (idx % 2) * 116;
    const iy = 128 + Math.floor(idx / 2) * 114;
    this.laserFlash = { x: ix, y: iy, life: 1.0 };

    this.playBarcodeBeep();
    if (this.paperRemain <= 0.02) {
      this.hintEl.textContent = 'レシートが なくなった！ ロールを タップして いれよう！';
    } else {
      this.hintEl.textContent = `ピッ！ ${item.name} ${item.price}えん（ごうけい ${this.total}えん）`;
    }
    this.renderScene();
    this.ensureLoop();
  }

  pressCheckout() {
    if (this.cart.length === 0) {
      this.sound.playBoing();
      this.hintEl.textContent = 'まず しょうひんを ピッ！と スキャンしよう';
      return;
    }
    this.drawerTarget = 1;
    this.receiptReady = true;
    this.paperRemain = Math.max(0, this.paperRemain - 0.1);
    this.playDrawerBell();
    this.playPrinterBuzz();
    this.hintEl.textContent = 'チーン！ レシートを タップして ビリッと わたそう！';
    this.renderScene();
    this.ensureLoop();
  }

  tearReceipt() {
    if (!this.receiptReady) return;
    this.playPaperRip();
    this.sound.playCrackerPop();
    this.customersServed++;
    this.scoreEl.textContent = `${this.customersServed}にん`;
    this.cart = [];
    this.total = 0;
    this.receiptReady = false;
    this.drawerTarget = 0;
    this.hintEl.textContent = 'ありがとう！ つぎの おきゃくさん どうぞ！';
    this.renderScene();
    this.ensureLoop();
  }

  refillPaperRoll() {
    this.paperRemain = 1.0;
    this.sound.playSproutPop();
    this.hintEl.textContent = 'あたらしい レシート ロールを セットしたよ！';
    this.renderScene();
  }

  needsLoop() {
    return (this.laserFlash && this.laserFlash.life > 0) || Math.abs(this.drawerOpen - this.drawerTarget) > 0.01;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        if (this.laserFlash) {
          this.laserFlash.life -= dt * 3.8;
          if (this.laserFlash.life <= 0) this.laserFlash = null;
        }
        if (Math.abs(this.drawerOpen - this.drawerTarget) > 0.01) {
          const step = dt * 3.8;
          this.drawerOpen += this.drawerOpen < this.drawerTarget ? Math.min(step, this.drawerTarget - this.drawerOpen) : -Math.min(step, this.drawerOpen - this.drawerTarget);
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

  renderScene() {
    const rollR = 11 + this.paperRemain * 21; // Visibly shrinks from 32 down to 11!
    const drawerSlide = this.drawerOpen * 58;
    const receiptH = this.receiptReady ? Math.min(138, 44 + this.cart.length * 16) : Math.min(82, this.cart.length * 14);
    const scannedIds = new Set(this.cart.map((c) => c.id));

    this.sceneEl.innerHTML = `
      <!-- Soft Lingokids ambient pastel blobs -->
      <circle cx="96" cy="84" r="110" fill="#FFE29A" opacity="0.34"/>
      <circle cx="716" cy="96" r="120" fill="#C8F2D6" opacity="0.38"/>

      <!-- Warm Wooden Shop Counter Base -->
      <rect x="26" y="424" width="748" height="58" rx="22" fill="#B58352"/>
      <rect x="26" y="416" width="748" height="58" rx="22" fill="url(#rl-wood)"/>

      <!-- LEFT: Grocery Items on Counter (tap directly to scan!) -->
      ${SHOP_ITEMS.map((it, idx) => {
        const ix = 104 + (idx % 2) * 116;
        const iy = 128 + Math.floor(idx / 2) * 114;
        return renderShopItemSvg(it, ix, iy, scannedIds.has(it.id));
      }).join('')}

      <!-- Handheld Barcode Scanner Docked at Center-Left -->
      <g transform="translate(322 252)">
        <rect x="-14" y="14" width="28" height="58" rx="12" fill="#3D405B"/>
        <path d="M -30 -8 Q -30 -24 -12 -24 H 18 Q 28 -24 28 -10 V 14 Q 28 24 14 24 H -16 Q -30 24 -30 10 Z" fill="#FFFFFF"/>
        <rect x="-26" y="-12" width="12" height="24" rx="5" fill="#F05A5B"/>
      </g>

      <!-- Red Laser Scan Beam Flash! -->
      ${this.laserFlash ? `
        <line x1="296" y1="252" x2="${this.laserFlash.x}" y2="${this.laserFlash.y}"
          stroke="#FF5E5E" stroke-width="5" stroke-linecap="round" opacity="${this.laserFlash.life.toFixed(2)}"/>
        <circle cx="${this.laserFlash.x}" cy="${this.laserFlash.y}" r="${(18 + (1 - this.laserFlash.life) * 20).toFixed(1)}"
          fill="none" stroke="#FF5E5E" stroke-width="4" opacity="${this.laserFlash.life.toFixed(2)}"/>
      ` : ''}

      <!-- RIGHT: Sleek Matte Mint & Porcelain POS Cash Register (x: 382..754) -->
      <!-- 1. Top Thermal Receipt Printer + Visible Shrinking Paper Roll -->
      <g data-act="refill-roll" style="cursor:pointer;" transform="translate(468 124)">
        ${this.paperRemain <= 0.04 ? `<circle cx="0" cy="0" r="46" fill="none" stroke="#F05A5B" stroke-width="4.5" stroke-dasharray="10 7"/>` : ''}
        <rect x="-54" y="-50" width="108" height="106" rx="22" fill="#379989"/>
        <rect x="-54" y="-56" width="108" height="106" rx="22" fill="#45B5A2"/>
        <!-- Clear Cutaway Window showing paper roll thickness! -->
        <circle cx="0" cy="-2" r="36" fill="#2A3647"/>
        <circle cx="0" cy="-2" r="${rollR.toFixed(1)}" fill="#FFFFFF"/>
        <circle cx="0" cy="-2" r="9.5" fill="#D4A373"/>
        <circle cx="0" cy="-2" r="5" fill="#2A3647"/>
        ${this.paperRemain <= 0.04 ? `<text x="0" y="34" text-anchor="middle" font-size="11" font-weight="900" fill="#FFF3A1" font-family="${FONT_ROUND}">ほじゅう！</text>` : ''}
      </g>

      <!-- Printed Receipt Strip rising out of the printer slot (tap to tear!) -->
      ${receiptH > 6 ? `
        <g data-act="tear-receipt" style="cursor:pointer;" transform="translate(468 ${(124 - 52 - receiptH).toFixed(1)})">
          ${this.receiptReady ? `<rect x="-44" y="-6" width="88" height="${(receiptH + 12).toFixed(1)}" rx="12" fill="none" stroke="#34D399" stroke-width="4" stroke-dasharray="8 6"/>` : ''}
          <rect x="-38" y="0" width="76" height="${receiptH.toFixed(1)}" rx="6" fill="#FFFFFF"/>
          ${this.cart.slice(-5).map((c, ci) => `
            <text x="-30" y="${18 + ci * 15}" font-size="9.5" font-weight="800" fill="#3D405B" font-family="${FONT_ROUND}">${c.name.slice(0, 4)}</text>
            <text x="30"  y="${18 + ci * 15}" text-anchor="end" font-size="9.5" font-weight="900" fill="#45B5A2" font-family="${FONT_ROUND}">${c.price}</text>
          `).join('')}
          ${this.receiptReady ? `
            <line x1="-30" y1="${receiptH - 28}" x2="30" y2="${receiptH - 28}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 3"/>
            <text x="0" y="${receiptH - 11}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#F05A5B" font-family="${FONT_ROUND}">¥${this.total}</text>
          ` : ''}
        </g>
      ` : ''}

      <!-- 2. Digital LED Total Price Pole Display -->
      <rect x="546" y="74" width="186" height="82" rx="22" fill="#2A3647"/>
      <rect x="556" y="84" width="166" height="62" rx="14" fill="#1E2836"/>
      <text x="708" y="128" text-anchor="end" font-size="38" font-weight="900" fill="#6EE7B7" font-family="monospace">¥${this.total}</text>

      <!-- 3. Main Mint POS Body & Tactile Keypad -->
      <rect x="392" y="176" width="356" height="174" rx="28" fill="#379989"/>
      <rect x="392" y="166" width="356" height="174" rx="28" fill="url(#rl-mint)"/>

      <!-- Decorative Clean Soft Keypad + Clear & Checkout Big Keys -->
      ${[0, 1, 2, 3, 4, 5].map((k) => {
        const kx = 434 + (k % 3) * 52;
        const ky = 210 + Math.floor(k / 3) * 50;
        return `
          <rect x="${kx - 19}" y="${ky - 16}" width="38" height="38" rx="12" fill="rgba(0,0,0,0.12)"/>
          <rect x="${kx - 19}" y="${ky - 20}" width="38" height="38" rx="12" fill="#FFFFFF"/>
          <text x="${kx}" y="${ky + 4}" text-anchor="middle" font-size="16" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${k + 1}</text>
        `;
      }).join('')}

      <!-- Clear Key -->
      <g data-act="clear-cart" style="cursor:pointer;" transform="translate(486 306)">
        <rect x="-70" y="-16" width="140" height="36" rx="14" fill="#C43B3C"/>
        <rect x="-70" y="-20" width="140" height="36" rx="14" fill="#F05A5B"/>
        <text x="0" y="3" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">やりなおす</text>
      </g>

      <!-- Big Tactile Checkout Key ("おかいけい") -->
      <g data-act="checkout" style="cursor:pointer;" transform="translate(656 254)">
        <rect x="-66" y="-56" width="132" height="122" rx="24" fill="#D19D1E"/>
        <rect x="-66" y="-62" width="132" height="122" rx="24" fill="#F7C948"/>
        <text x="0" y="-6" text-anchor="middle" font-size="19" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">おかいけい</text>
        <text x="0" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="#854D0E" font-family="${FONT_ROUND}">チーン！</text>
      </g>

      <!-- 4. Sliding Cash Drawer beneath POS Body -->
      <g data-act="toggle-drawer" style="cursor:pointer;" transform="translate(0 ${drawerSlide.toFixed(1)})">
        ${this.drawerOpen > 0.1 ? `
          <!-- Inside Cash Compartment (Bills & Coins revealed as drawer opens!) -->
          <rect x="404" y="324" width="332" height="60" rx="14" fill="#2A3647"/>
          <rect x="420" y="332" width="76" height="42" rx="8" fill="#5CD68D"/>
          <rect x="506" y="332" width="76" height="42" rx="8" fill="#56CCF2"/>
          <circle cx="624" cy="354" r="14" fill="#F7C948"/>
          <circle cx="662" cy="354" r="14" fill="#E6EDF4"/>
          <circle cx="700" cy="354" r="14" fill="#E0925C"/>
        ` : ''}
        <!-- Drawer Front Plate -->
        <rect x="392" y="352" width="356" height="66" rx="20" fill="#CBD6E2"/>
        <rect x="392" y="344" width="356" height="66" rx="20" fill="#FFFFFF"/>
        <rect x="526" y="370" width="88" height="14" rx="7" fill="#CBD6E2"/>
      </g>
    `;
  }

  /* Web Audio Register & Barcode Synthesizers */
  playBarcodeBeep() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, now);
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.09);
  }

  playDrawerBell() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Classic cash register "CHING!" metallic bell
    [1567.98, 3135.96].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(idx === 0 ? 0.24 : 0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(g); g.connect(this.sound.wetBus || this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.58);
    });
  }

  playPrinterBuzz() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 3.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    src.connect(bp); bp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.26);
  }

  playPaperRip() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx || !this.sound.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.sound.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.setValueAtTime(1900, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.28, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    src.connect(hp); hp.connect(g); g.connect(this.sound.dryBus);
    src.start(now, Math.random() * 0.2, 0.12);
  }
}
