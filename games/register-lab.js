import {
  FONT_ROUND,
  SHOP_ITEMS,
  CUSTOMERS,
  buildRegisterDefsSvg,
  renderDraggableItemSvg,
  renderCustomerHeadSvg
} from './register-lab-assets.js';

export default class RegisterLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.customersServed = 0;
    this.customerIdx = 0;

    // Customer's basket items: { uid, ...item, x, y, homeX, homeY, state: 'in-basket'|'bagged', scanned: false }
    this.items = [];
    this.scannedLines = [];
    this.total = 0;

    // Checkout flow phase: 'scanning' | 'ready-pay' | 'collect-cash' | 'tear-receipt'
    this.phase = 'scanning';
    this.paperRemain = 1.0;
    this.drawerOpen = 0;
    this.drawerTarget = 0;
    this.laserFlash = 0;

    // Customer payment bill/coin waiting to be dragged into drawer
    this.paymentMoney = null; // { x, y, homeX, homeY, amount }

    // Active drag state: { kind: 'item'|'money'|'receipt'|'roll', uid?, startY?, x, y }
    this.drag = null;
    this.receiptPull = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#F6EFE4');
    }
    this.injectStyles();
    this.renderShell();
    this.spawnCustomer();
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
        background: rgba(255,255,255,0.9); border: 2px solid #FFFFFF;
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
            <span class="rl-hint" id="rl-hint">カゴから しょうひんを とって スキャナーで ピッ！</span>
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

    this.svgEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  spawnCustomer() {
    const cust = CUSTOMERS[this.customerIdx % CUSTOMERS.length];
    this.customerIdx++;
    const count = 3 + (this.customerIdx % 2); // 3 or 4 random items per customer
    const pool = [...SHOP_ITEMS].sort(() => Math.random() - 0.5).slice(0, count);

    // Arrange neatly inside left blue customer basket (x: 68..224, y: 312..392)
    this.items = pool.map((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const hx = 104 + col * 72 + (row ? 10 : 0);
      const hy = 326 + row * 46;
      return { uid: i + 1, ...it, x: hx, y: hy, homeX: hx, homeY: hy, state: 'in-basket', scanned: false };
    });

    this.scannedLines = [];
    this.total = 0;
    this.phase = 'scanning';
    this.drawerTarget = 0;
    this.paymentMoney = null;
    this.receiptPull = 0;
    this.hintEl.textContent = `${cust.name} が きたよ！ カゴから だして ピッ → みぎのカゴへ！`;
    this.renderScene();
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
    const target = e.target.closest('[data-act]');
    if (!target) return;
    e.preventDefault();
    this.sound.unlock();
    const act = target.dataset.act;
    const pt = this.getSvgPoint(e);

    if (act === 'drag-item') {
      const uid = Number(target.dataset.uid);
      const item = this.items.find((it) => it.uid === uid);
      if (!item || item.state === 'bagged') return;
      this.drag = { kind: 'item', uid, x: pt.x, y: pt.y };
      item.x = pt.x;
      item.y = pt.y;
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'drag-roll') {
      if (this.paperRemain > 0.25) {
        this.sound.playMetalClick();
        return;
      }
      this.drag = { kind: 'roll', x: pt.x, y: pt.y };
      this.renderScene();
    } else if (act === 'checkout') {
      this.pressCheckout();
    } else if (act === 'drag-money') {
      if (!this.paymentMoney) return;
      this.drag = { kind: 'money', x: pt.x, y: pt.y };
      this.paymentMoney.x = pt.x;
      this.paymentMoney.y = pt.y;
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'drag-receipt') {
      if (this.phase !== 'tear-receipt') return;
      this.drag = { kind: 'receipt', startY: pt.y, x: pt.x, y: pt.y };
    }
  }

  handlePointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const pt = this.getSvgPoint(e);
    this.drag.x = pt.x;
    this.drag.y = pt.y;

    if (this.drag.kind === 'item') {
      const item = this.items.find((it) => it.uid === this.drag.uid);
      if (!item) return;
      item.x = pt.x;
      item.y = pt.y;

      // Live barcode scanner detection when dragged over the red scanner glass (cx=340, cy=325)!
      if (!item.scanned && Math.hypot(pt.x - 340, pt.y - 325) <= 68) {
        if (this.paperRemain <= 0.02) {
          this.sound.playBoing();
          this.hintEl.textContent = 'レシートが ないよ！ よびの ロールを ドラッグして いれよう！';
        } else {
          item.scanned = true;
          this.scannedLines.push(item);
          this.total += item.price;
          this.paperRemain = Math.max(0, this.paperRemain - 0.08);
          this.laserFlash = 1.0;
          this.playBarcodeBeep();
          this.hintEl.textContent = `ピッ！ ${item.name} ${item.price}えん → みぎの カゴへ いれよう！`;
          this.ensureLoop();
        }
      }
      this.renderScene();
    } else if (this.drag.kind === 'money') {
      if (this.paymentMoney) {
        this.paymentMoney.x = pt.x;
        this.paymentMoney.y = pt.y;
        this.renderScene();
      }
    } else if (this.drag.kind === 'receipt') {
      const pull = Math.max(0, this.drag.startY - pt.y);
      this.receiptPull = Math.min(54, pull);
      if (pull >= 44) {
        this.drag = null;
        this.completeReceiptTear();
        return;
      }
      this.renderScene();
    } else if (this.drag.kind === 'roll') {
      this.renderScene();
    }
  }

  handlePointerUp() {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;

    if (d.kind === 'item') {
      const item = this.items.find((it) => it.uid === d.uid);
      if (item) {
        // Right green "My Basket" drop zone: x 460..630, y 280..450
        const inRightBasket = d.x >= 440 && d.x <= 650 && d.y >= 260 && d.y <= 460;
        if (inRightBasket) {
          if (item.scanned) {
            item.state = 'bagged';
            const baggedCount = this.items.filter((x) => x.state === 'bagged').length;
            item.x = 502 + ((baggedCount - 1) % 2) * 62;
            item.y = 338 + Math.floor((baggedCount - 1) / 2) * 38;
            this.sound.playSproutPop();
            if (this.items.every((x) => x.state === 'bagged')) {
              this.phase = 'ready-pay';
              this.hintEl.textContent = 'ぜんぶ スキャンしたよ！「おかいけい」を おそう！';
            } else {
              this.hintEl.textContent = 'つぎの しょうひんも ピッ！と スキャンしよう';
            }
          } else {
            // Tried to bag without scanning! Bounce back nicely
            item.x = item.homeX;
            item.y = item.homeY;
            this.sound.playBoing();
            this.hintEl.textContent = 'まだ ピッ！してないよ！ まんなかの スキャナーを とおしてね！';
          }
        } else {
          // Snap back gently to left customer basket
          item.x = item.homeX;
          item.y = item.homeY;
        }
      }
    } else if (d.kind === 'money') {
      // Dropped into open cash drawer (x: 495..770, y: 215..360)
      if (d.x >= 490 && d.x <= 775 && d.y >= 210 && d.y <= 370) {
        this.paymentMoney = null;
        this.phase = 'tear-receipt';
        this.drawerTarget = 0;
        this.playCoinClink();
        this.playPrinterBuzz();
        this.hintEl.textContent = 'レシートを うえに ひっぱって ビリッと ちぎろう！';
        this.ensureLoop();
      } else if (this.paymentMoney) {
        this.paymentMoney.x = this.paymentMoney.homeX;
        this.paymentMoney.y = this.paymentMoney.homeY;
      }
    } else if (d.kind === 'receipt') {
      this.receiptPull = 0;
    } else if (d.kind === 'roll') {
      // Dropped onto thermal printer roll housing (cx=544, cy=104)
      if (Math.hypot(d.x - 544, d.y - 104) <= 72) {
        this.paperRemain = 1.0;
        this.sound.playSproutPop();
        this.hintEl.textContent = 'あたらしい レシート ロールを セットしたよ！';
      }
    }

    this.renderScene();
  }

  pressCheckout() {
    if (this.phase !== 'ready-pay') {
      this.sound.playBoing();
      this.hintEl.textContent = 'ぜんぶの しょうひんを ピッ！して みぎのカゴへ いれてね！';
      return;
    }
    this.phase = 'collect-cash';
    this.drawerTarget = 1;
    this.paymentMoney = { x: 340, y: 196, homeX: 340, homeY: 196, amount: this.total };
    this.playDrawerBell();
    this.hintEl.textContent = 'チーン！ おかねを ドラッグして レジの ひきだしへ いれよう！';
    this.renderScene();
    this.ensureLoop();
  }

  completeReceiptTear() {
    this.playPaperRip();
    this.sound.playCrackerPop();
    this.customersServed++;
    this.scoreEl.textContent = `${this.customersServed}にん`;
    this.receiptPull = 0;
    this.hintEl.textContent = 'ありがとう！ つぎの おきゃくさんが くるよ！';
    this.renderScene();
    setTimeout(() => {
      if (!this.destroyed) this.spawnCustomer();
    }, 1100);
  }

  needsLoop() {
    return this.laserFlash > 0.01 || Math.abs(this.drawerOpen - this.drawerTarget) > 0.01;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        if (this.laserFlash > 0) this.laserFlash = Math.max(0, this.laserFlash - dt * 3.5);
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
    const cust = CUSTOMERS[(this.customerIdx - 1 + CUSTOMERS.length) % CUSTOMERS.length];
    const rollR = 10 + this.paperRemain * 20;
    const drawerSlide = this.drawerOpen * 46;
    const receiptH = this.phase === 'tear-receipt' ? 92 : Math.min(54, this.scannedLines.length * 13);

    // Draw items in clean depth order: bagged -> in-basket -> currently dragged on top!
    const baggedItems = this.items.filter((x) => x.state === 'bagged');
    const basketItems = this.items.filter((x) => x.state === 'in-basket' && !(this.drag && this.drag.kind === 'item' && this.drag.uid === x.uid));
    const draggedItem = (this.drag && this.drag.kind === 'item') ? this.items.find((x) => x.uid === this.drag.uid) : null;

    this.sceneEl.innerHTML = `
      <!-- Soft pastel studio circles -->
      <circle cx="90" cy="84" r="105" fill="#FFE29A" opacity="0.34"/>
      <circle cx="716" cy="94" r="115" fill="#C8F2D6" opacity="0.36"/>

      <!-- Customer peeking happily behind the counter -->
      ${renderCustomerHeadSvg(cust, 150, 128)}
      <rect x="74" y="152" width="152" height="32" rx="16" fill="#FFFFFF"/>
      <text x="150" y="173" text-anchor="middle" font-size="13" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${cust.name} の カゴ</text>

      <!-- Warm Wooden Shop Counter Surface -->
      <rect x="24" y="246" width="752" height="232" rx="28" fill="#C28F5B"/>
      <rect x="24" y="236" width="752" height="232" rx="28" fill="url(#rl-wood)"/>

      <!-- 1. LEFT BLUE BASKET (Customer's Unscanned Basket) -->
      <g transform="translate(52 284)">
        <rect x="0" y="6" width="194" height="156" rx="24" fill="#237C9E"/>
        <rect x="0" y="0" width="194" height="156" rx="24" fill="url(#rl-basket-in)"/>
        <rect x="14" y="14" width="166" height="128" rx="16" fill="#DCF4FC"/>
        <text x="97" y="136" text-anchor="middle" font-size="12" font-weight="900" fill="#237C9E" font-family="${FONT_ROUND}">ここから だそう</text>
      </g>

      <!-- 2. CENTER BUILT-IN BARCODE SCANNER PAD (drag items across the red beam!) -->
      <g transform="translate(274 268)">
        <rect x="0" y="6" width="132" height="126" rx="24" fill="#CBD6E2"/>
        <rect x="0" y="0" width="132" height="126" rx="24" fill="#FFFFFF"/>
        <!-- Dark Optical Glass Window -->
        <rect x="18" y="18" width="96" height="72" rx="14" fill="#2A3647"/>
        <!-- Live Red Laser Crosshair -->
        <line x1="26" y1="54" x2="106" y2="54" stroke="#FF5E5E" stroke-width="${this.laserFlash > 0.1 ? '7' : '3.5'}" stroke-linecap="round" opacity="${this.laserFlash > 0.1 ? '1' : '0.78'}"/>
        <line x1="66" y1="28" x2="66" y2="80" stroke="#FF5E5E" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
        <text x="66" y="112" text-anchor="middle" font-size="12" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">ここで ピッ！</text>
      </g>

      <!-- 3. RIGHT MINT BASKET (Scanned "My Basket" Drop Zone) -->
      <g transform="translate(442 294)">
        <rect x="0" y="6" width="194" height="146" rx="24" fill="#298752"/>
        <rect x="0" y="0" width="194" height="146" rx="24" fill="url(#rl-basket-out)"/>
        <rect x="14" y="14" width="166" height="118" rx="16" fill="#E6FAF0"/>
        <text x="97" y="124" text-anchor="middle" font-size="12" font-weight="900" fill="#298752" font-family="${FONT_ROUND}">ピッ！のあと ここ</text>
      </g>

      <!-- 4. TOP-RIGHT MATTE MINT POS REGISTER & THERMAL PAPER ROLL -->
      <!-- Spare Paper Roll sitting on shelf when low (drag onto printer!) -->
      ${this.paperRemain <= 0.25 ? `
        <g data-act="drag-roll" style="cursor:grab;" transform="translate(414 114)">
          <circle cx="0" cy="4" r="28" fill="rgba(61,64,91,0.12)"/>
          <circle cx="0" cy="0" r="28" fill="#FFFFFF"/>
          <circle cx="0" cy="0" r="9" fill="#D4A373"/>
          <text x="0" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="#F05A5B" font-family="${FONT_ROUND}">よびロール</text>
        </g>
      ` : ''}

      <!-- Thermal Printer Cutaway Housing -->
      <g transform="translate(544 108)">
        <rect x="-46" y="-44" width="92" height="92" rx="22" fill="#379989"/>
        <rect x="-46" y="-50" width="92" height="92" rx="22" fill="#45B5A2"/>
        <circle cx="0" cy="-4" r="32" fill="#2A3647"/>
        <circle cx="0" cy="-4" r="${rollR.toFixed(1)}" fill="#FFFFFF"/>
        <circle cx="0" cy="-4" r="8.5" fill="#D4A373"/>
        <circle cx="0" cy="-4" r="4" fill="#2A3647"/>
      </g>

      <!-- Printed Receipt Strip rising from printer (drag UP to tear!) -->
      ${receiptH > 6 ? `
        <g data-act="drag-receipt" style="cursor:${this.phase === 'tear-receipt' ? 'ns-resize' : 'default'};"
           transform="translate(544 ${(64 - receiptH - this.receiptPull).toFixed(1)})">
          ${this.phase === 'tear-receipt' ? `<rect x="-42" y="-6" width="84" height="${(receiptH + 12).toFixed(1)}" rx="12" fill="none" stroke="#34D399" stroke-width="4" stroke-dasharray="8 6"/>` : ''}
          <rect x="-36" y="0" width="72" height="${receiptH.toFixed(1)}" rx="6" fill="#FFFFFF"/>
          ${this.scannedLines.slice(-4).map((c, ci) => `
            <text x="-28" y="${16 + ci * 14}" font-size="9" font-weight="800" fill="#3D405B" font-family="${FONT_ROUND}">${c.name.slice(0, 4)}</text>
            <text x="28"  y="${16 + ci * 14}" text-anchor="end" font-size="9" font-weight="900" fill="#45B5A2" font-family="${FONT_ROUND}">${c.price}</text>
          `).join('')}
          ${this.phase === 'tear-receipt' ? `<text x="0" y="${receiptH - 10}" text-anchor="middle" font-size="11" font-weight="900" fill="#F05A5B" font-family="${FONT_ROUND}">↑ ひっぱる</text>` : ''}
        </g>
      ` : ''}

      <!-- Digital Price Display & Checkout Button -->
      <rect x="606" y="56" width="164" height="62" rx="18" fill="#2A3647"/>
      <text x="754" y="100" text-anchor="end" font-size="32" font-weight="900" fill="#6EE7B7" font-family="monospace">¥${this.total}</text>

      <g data-act="checkout" style="cursor:pointer;" transform="translate(688 164)">
        ${this.phase === 'ready-pay' ? `<rect x="-86" y="-36" width="172" height="72" rx="24" fill="none" stroke="#34D399" stroke-width="4.5" stroke-dasharray="10 7"/>` : ''}
        <rect x="-80" y="-26" width="160" height="58" rx="20" fill="${this.phase === 'ready-pay' ? '#D19D1E' : '#379989'}"/>
        <rect x="-80" y="-32" width="160" height="58" rx="20" fill="${this.phase === 'ready-pay' ? '#F7C948' : 'url(#rl-mint)'}"/>
        <text x="0" y="4" text-anchor="middle" font-size="18" font-weight="900" fill="${this.phase === 'ready-pay' ? '#3D405B' : '#FFFFFF'}" font-family="${FONT_ROUND}">おかいけい</text>
      </g>

      <!-- Sliding Cash Drawer on Right -->
      <g transform="translate(0 ${drawerSlide.toFixed(1)})">
        ${this.drawerOpen > 0.1 ? `
          <rect x="604" y="198" width="166" height="52" rx="14" fill="#2A3647"/>
          <rect x="614" y="206" width="66" height="36" rx="8" fill="#5CD68D"/>
          <circle cx="708" cy="224" r="12" fill="#F7C948"/>
          <circle cx="742" cy="224" r="12" fill="#E6EDF4"/>
        ` : ''}
        <rect x="604" y="218" width="166" height="46" rx="16" fill="#CBD6E2"/>
        <rect x="604" y="212" width="166" height="46" rx="16" fill="#FFFFFF"/>
        <rect x="662" y="230" width="50" height="10" rx="5" fill="#CBD6E2"/>
      </g>

      <!-- Bagged Items & Unscanned Basket Items -->
      ${baggedItems.map((it) => renderDraggableItemSvg(it, it.x, it.y, { scale: 0.82, scanned: true })).join('')}
      ${basketItems.map((it) => `
        <g data-act="drag-item" data-uid="${it.uid}" style="cursor:grab;">
          ${renderDraggableItemSvg(it, it.x, it.y, { scale: 0.96, scanned: it.scanned })}
        </g>
      `).join('')}

      <!-- Customer Payment Money (drag into open cash drawer!) -->
      ${this.paymentMoney ? `
        <g data-act="drag-money" style="cursor:grab;" transform="translate(${this.paymentMoney.x.toFixed(1)} ${this.paymentMoney.y.toFixed(1)})">
          <rect x="-42" y="-20" width="84" height="46" rx="12" fill="#34A867"/>
          <rect x="-42" y="-25" width="84" height="46" rx="12" fill="#5CD68D"/>
          <circle cx="0" cy="-2" r="13" fill="#E8FFF1"/>
          <text x="0" y="3" text-anchor="middle" font-size="13" font-weight="900" fill="#298752" font-family="${FONT_ROUND}">¥${this.paymentMoney.amount}</text>
        </g>
      ` : ''}

      <!-- Actively Dragged Item / Spare Roll rendered on very top! -->
      ${draggedItem ? renderDraggableItemSvg(draggedItem, draggedItem.x, draggedItem.y, { scale: 1.0, scanned: draggedItem.scanned, dragging: true }) : ''}
      ${this.drag && this.drag.kind === 'roll' ? `
        <g transform="translate(${this.drag.x.toFixed(1)} ${this.drag.y.toFixed(1)})" pointer-events="none">
          <circle cx="0" cy="0" r="30" fill="#FFFFFF"/>
          <circle cx="0" cy="0" r="9.5" fill="#D4A373"/>
        </g>
      ` : ''}
    `;
  }

  /* Web Audio Register Effects */
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
    [1567.98, 3135.96].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(idx === 0 ? 0.24 : 0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(g); g.connect(this.sound.wetBus || this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.58);
    });
  }

  playCoinClink() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    [0, 0.06].forEach((d, i) => {
      const now = ctx.currentTime + d;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(i === 0 ? 2200 : 2650, now);
      g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.15);
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
    g.gain.linearRampToValueAtTime(0.15, now + 0.02);
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
