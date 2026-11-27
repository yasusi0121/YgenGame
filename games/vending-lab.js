import {
  DRINKS,
  COINS,
  buildVendingDefsSvg,
  renderDrinkItemSvg,
  renderCoinSvg
} from './vending-lab-assets.js';

export default class VendingLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'buy'; // 'buy' | 'restock'
    this.xray = true;  // Show live internal mechanism cutaway on right panel & interior
    this.credit = 0;
    this.stock = DRINKS.map((_, i) => (i === 3 ? 1 : 3)); // Cola starts at 1 so kids naturally discover restocking!
    this.coinTubes = { 10: 4, 50: 3, 100: 4, 500: 1 };
    this.jammedCoin = false;

    this.collectedDrinks = [];
    this.pickupDrink = null; // Drink waiting in bottom flap
    this.changeReturnVal = 0;

    // Live animations
    this.fallingCoin = null; // { coin, t, targetTubeX }
    this.dispensing = null;  // { drinkIdx, t, x, y, rot }
    this.leverTilt = 0;
    this.fanAngle = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#E2E8F0');
    }
    this.injectStyles();
    this.renderShell();
    this.renderAll();
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
    if (document.getElementById('vl-styles')) return;
    const style = document.createElement('style');
    style.id = 'vl-styles';
    style.textContent = `
      .vl-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%);
        color: #0F172A; user-select: none; -webkit-user-select: none;
        padding: 8px 12px 10px; box-sizing: border-box; gap: 8px; overflow: hidden;
      }
      .vl-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 44px;
      }
      .vl-modes {
        display: flex; gap: 6px; background: rgba(255,255,255,0.85);
        padding: 4px; border-radius: 16px; border: 2px solid #94A3B8;
      }
      .vl-mode-btn {
        border: none; border-radius: 12px; padding: 7px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #334155; cursor: pointer; font-family: inherit;
      }
      .vl-mode-btn.active { background: #DC2626; color: #FFFFFF; box-shadow: 0 3px 0 #991B1B; }

      .vl-status {
        display: flex; align-items: center; gap: 8px; background: #FFFFFF;
        border: 2px solid #94A3B8; border-radius: 16px; padding: 5px 12px;
      }
      .vl-hint { font-size: 14px; font-weight: 800; color: #1E293B; }
      .vl-xray-btn {
        border: 2px solid #64748B; border-radius: 11px; padding: 5px 10px;
        background: #F1F5F9; color: #1E293B; font-size: 12px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .vl-xray-btn.active { background: #0284C7; border-color: #0369A1; color: #FFFFFF; }

      .vl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%);
        border-radius: 22px; border: 3px solid #94A3B8; overflow: hidden;
      }
      .vl-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      .vl-dock {
        display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
        background: rgba(255,255,255,0.92); border: 2.5px solid #94A3B8;
        border-radius: 20px; padding: 6px 12px; min-height: 64px;
      }
      .vl-coin-btn {
        display: flex; flex-direction: column; align-items: center; gap: 1px;
        border: 2.5px solid #CBD5E1; border-radius: 14px; padding: 4px 10px;
        background: #F8FAFC; cursor: pointer; font-family: inherit; transition: transform 0.1s;
      }
      .vl-coin-btn:active { transform: translateY(3px) scale(0.95); }
      .vl-coin-lbl { font-size: 11px; font-weight: 900; color: #334155; }

      .vl-action-btn {
        border: 2.5px solid #0284C7; border-radius: 14px; padding: 9px 16px;
        background: #0EA5E9; color: #FFFFFF; font-size: 14px; font-weight: 900;
        cursor: pointer; font-family: inherit; box-shadow: 0 3px 0 #0369A1;
      }
      .vl-action-btn.red { background: #EF4444; border-color: #B91C1C; box-shadow: 0 3px 0 #991B1B; }
      .vl-action-btn.green { background: #22C55E; border-color: #15803D; box-shadow: 0 3px 0 #15803D; }
      .vl-action-btn:active { transform: translateY(2px); }

      @media (max-width: 640px) {
        .vl-root { padding: 6px; gap: 6px; }
        .vl-topbar { padding-left: 44px; padding-right: 44px; }
        .vl-mode-btn { padding: 5px 10px; font-size: 12px; }
        .vl-hint { font-size: 12px; }
        .vl-dock { padding: 5px; gap: 6px; min-height: 56px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="vl-root">
        <div class="vl-topbar">
          <div class="vl-modes">
            <button class="vl-mode-btn active" data-mode="buy" type="button">かう モード</button>
            <button class="vl-mode-btn" data-mode="restock" type="button">ほじゅう・しゅうり</button>
          </div>
          <div class="vl-status">
            <span class="vl-hint" id="vl-hint">おかねを いれて 光ったボタンを おそう！</span>
            <button class="vl-xray-btn active" id="vl-xray-btn" type="button">なかの メカ</button>
          </div>
        </div>

        <div class="vl-stage-wrap">
          <svg class="vl-svg" id="vl-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildVendingDefsSvg()}
            <g id="vl-scene"></g>
          </svg>
        </div>

        <div class="vl-dock" id="vl-dock"></div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#vl-svg');
    this.sceneEl = this.mountEl.querySelector('#vl-scene');
    this.hintEl = this.mountEl.querySelector('#vl-hint');
    this.xrayBtn = this.mountEl.querySelector('#vl-xray-btn');
    this.dockEl = this.mountEl.querySelector('#vl-dock');

    this.mountEl.querySelectorAll('.vl-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.mountEl.querySelectorAll('.vl-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        if (m === 'restock') {
          this.hintEl.textContent = 'とびらが あいたよ！すきな レールを おして ほじゅうしよう！';
          this.playDoorOpen();
        } else {
          this.hintEl.textContent = 'おかねを いれて 光ったボタンを おそう！';
          this.playDoorOpen();
        }
        this.renderAll();
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

    // Delegate SVG interactive taps cleanly via data-act attributes
    this.svgEl.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      e.preventDefault();
      this.sound.unlock();
      const act = target.dataset.act;
      if (act === 'buy-drink') {
        this.buyDrink(Number(target.dataset.idx));
      } else if (act === 'pickup') {
        this.collectPickupDrink();
      } else if (act === 'return-lever') {
        this.pressReturnLever();
      } else if (act === 'restock-lane') {
        this.restockLane(Number(target.dataset.idx));
      } else if (act === 'clear-jam') {
        this.clearCoinJam();
      }
    });
  }

  renderAll() {
    this.renderDock();
    this.renderScene();
  }

  renderDock() {
    if (this.mode === 'restock') {
      this.dockEl.innerHTML = `
        <button class="vl-action-btn green" id="vl-restock-all" type="button">ぜんぶ まんたんに する！</button>
        <button class="vl-action-btn red" id="vl-make-jam" type="button">コインづまり テスト</button>
        <button class="vl-action-btn" id="vl-collect-cash" type="button">うりあげ コイン かいしゅう</button>
      `;
      this.dockEl.querySelector('#vl-restock-all').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.stock = DRINKS.map(() => 5);
        this.playRestockClack();
        this.sound.playSuccessFanfare();
        this.hintEl.textContent = 'ぜんぶの ドリンクが まんたんに なったよ！';
        this.renderScene();
      });
      this.dockEl.querySelector('#vl-make-jam').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.jammedCoin = true;
        this.sound.playBoing();
        this.hintEl.textContent = 'あ！ コインメックに コインが つまったよ！タップして なおそう！';
        this.renderScene();
      });
      this.dockEl.querySelector('#vl-collect-cash').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.coinTubes = { 10: 1, 50: 1, 100: 1, 500: 0 };
        this.playCoinCascade();
        this.hintEl.textContent = 'コインチューブから うりあげを かいしゅうしたよ！';
        this.renderScene();
      });
      return;
    }

    this.dockEl.innerHTML = `
      ${COINS.map((c) => `
        <button class="vl-coin-btn" data-coin="${c.value}" type="button">
          ${renderCoinSvg(c, 38)}
          <span class="vl-coin-lbl">${c.value}えん</span>
        </button>
      `).join('')}
      <button class="vl-action-btn" id="vl-return-btn" type="button">おつり レバー</button>
    `;

    this.dockEl.querySelectorAll('.vl-coin-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.insertCoin(Number(btn.dataset.coin));
      });
    });

    this.dockEl.querySelector('#vl-return-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.pressReturnLever();
    });
  }

  insertCoin(value) {
    if (this.jammedCoin) {
      this.sound.playBoing();
      this.hintEl.textContent = 'コインが つまっているよ！「ほじゅう・しゅうり」で なおそう！';
      return;
    }
    const coin = COINS.find((c) => c.value === value);
    if (!coin) return;
    if (this.credit + value > 990) {
      this.sound.playBoing();
      this.hintEl.textContent = 'これいじょう はいらないよ！ボタンを おしてね！';
      return;
    }
    this.credit += value;
    this.coinTubes[value] = Math.min(8, (this.coinTubes[value] || 0) + 1);
    const tubeIdx = { 10: 0, 50: 1, 100: 2, 500: 3 }[value] || 0;
    this.fallingCoin = { coin, t: 0, targetTubeX: 540 + tubeIdx * 48 };
    this.changeReturnVal = 0;
    this.playCoinClink(value);
    this.hintEl.textContent = `${this.credit}えん はいったよ！みどりに 光ったボタンを おそう！`;
    this.renderScene();
    this.ensureLoop();
  }

  buyDrink(idx) {
    if (this.dispensing) return;
    const drink = DRINKS[idx];
    if (!drink) return;
    if (this.stock[idx] <= 0) {
      this.sound.playBoing();
      this.hintEl.textContent = `${drink.name}は うりきれ！「ほじゅう・しゅうり」で いれよう！`;
      return;
    }
    if (this.credit < drink.price) {
      this.sound.playBoing();
      this.hintEl.textContent = `あと ${drink.price - this.credit}えん たらないよ！コインを いれよう！`;
      return;
    }
    if (this.pickupDrink) {
      this.collectPickupDrink();
    }

    this.credit -= drink.price;
    this.stock[idx]--;
    this.playButtonBeep();
    this.dispensing = { drinkIdx: idx, t: 0 };
    this.hintEl.textContent = `${drink.name}が ガタン、ゴトンと おちてくるよ！`;
    this.renderScene();
    this.ensureLoop();
  }

  collectPickupDrink() {
    if (!this.pickupDrink) return;
    const d = this.pickupDrink;
    this.pickupDrink = null;
    this.collectedDrinks.push(d);
    if (this.collectedDrinks.length > 6) this.collectedDrinks.shift();
    this.sound.playCrackerPop();
    this.hintEl.textContent = `${d.name}を ゲット！ つぎは なにを かう？`;
    this.renderScene();
  }

  pressReturnLever() {
    this.leverTilt = 1.0;
    if (this.credit <= 0) {
      this.sound.playMetalClick();
      this.ensureLoop();
      return;
    }
    this.changeReturnVal = this.credit;
    this.credit = 0;
    this.playCoinCascade();
    this.hintEl.textContent = `ジャララッ！ おつり ${this.changeReturnVal}えん が でたよ！`;
    this.renderScene();
    this.ensureLoop();
  }

  restockLane(idx) {
    if (this.stock[idx] >= 5) {
      this.sound.playMetalClick();
      this.hintEl.textContent = `${DRINKS[idx].name}は もう まんたんだよ！`;
      return;
    }
    this.stock[idx]++;
    this.playRestockClack();
    this.hintEl.textContent = `${DRINKS[idx].name}を ほじゅう！（のこり ${this.stock[idx]}ほん）`;
    this.renderScene();
  }

  clearCoinJam() {
    if (!this.jammedCoin) return;
    this.jammedCoin = false;
    this.playCoinClink(100);
    this.sound.playSuccessFanfare();
    this.hintEl.textContent = 'コインづまりが なおったよ！';
    this.renderScene();
  }

  needsLoop() {
    return this.xray || !!this.fallingCoin || !!this.dispensing || this.leverTilt > 0.01;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 36) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.stepAnimations(dt);
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

  stepAnimations(dt) {
    let dirty = false;

    if (this.xray) {
      this.fanAngle = (this.fanAngle + dt * 210) % 360;
      dirty = true;
    }
    if (this.leverTilt > 0) {
      this.leverTilt = Math.max(0, this.leverTilt - dt * 3.2);
      dirty = true;
    }
    if (this.fallingCoin) {
      this.fallingCoin.t += dt * 1.9;
      if (this.fallingCoin.t >= 1) {
        this.fallingCoin = null;
      }
      dirty = true;
    }
    if (this.dispensing) {
      const prev = this.dispensing.t;
      this.dispensing.t += dt * 1.15;
      if (prev < 0.35 && this.dispensing.t >= 0.35) this.playDispenseThud(1.0);
      if (prev < 0.85 && this.dispensing.t >= 0.85) this.playDispenseThud(0.72);
      if (this.dispensing.t >= 1.0) {
        this.pickupDrink = DRINKS[this.dispensing.drinkIdx];
        this.dispensing = null;
        this.hintEl.textContent = `ガコン！ とりだしぐちの ${this.pickupDrink.name}を タップして とろう！`;
      }
      dirty = true;
    }

    if (dirty) this.renderScene();
  }

  renderScene() {
    const isRestock = this.mode === 'restock';
    const creditStr = String(this.credit).padStart(3, '0');

    // Showcase drink slots (2 rows x 3 columns on left vending machine chassis x: 46..454)
    const slotsSvg = DRINKS.map((d, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const sx = 122 + col * 114;
      const sy = 104 + row * 124;
      const stock = this.stock[i];
      const canBuy = !isRestock && stock > 0 && this.credit >= d.price;
      const soldOut = stock <= 0;

      return `
        <!-- Shelf backdrop -->
        <rect x="${sx - 48}" y="${sy - 46}" width="96" height="90" rx="6" fill="rgba(255,255,255,0.65)" stroke="#CBD5E1" stroke-width="1.5"/>
        ${renderDrinkItemSvg(d, sx, sy - 6, 0.88)}
        <!-- Cold / Hot indicator bar -->
        <rect x="${sx - 46}" y="${sy + 34}" width="92" height="12" rx="3" fill="url(#${d.temp === 'hot' ? 'vl-hot-bar' : 'vl-cold-bar'})"/>
        <text x="${sx}" y="${sy + 43}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${d.temp === 'hot' ? 'あったか〜い' : 'つめた〜い'}</text>

        <!-- Tactile push button below display -->
        <g data-act="${isRestock ? 'restock-lane' : 'buy-drink'}" data-idx="${i}" style="cursor:pointer;">
          <rect x="${sx - 44}" y="${sy + 49}" width="88" height="24" rx="8"
            fill="${isRestock ? '#38BDF8' : (soldOut ? '#7F1D1D' : (canBuy ? '#22C55E' : '#334155'))}"
            stroke="${canBuy ? '#DCFCE7' : '#0F172A'}" stroke-width="2.2"/>
          <!-- Glowing LED indicator dot -->
          <circle cx="${sx - 31}" cy="${sy + 61}" r="4.5" fill="${soldOut ? '#EF4444' : (canBuy ? '#FEF08A' : '#64748B')}"/>
          <text x="${sx + 6}" y="${sy + 65}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">
            ${isRestock ? `＋ほじゅう(${stock})` : (soldOut ? 'うりきれ' : `${d.price}えん`)}
          </text>
        </g>
      `;
    }).join('');

    // Falling drink animation inside chute
    let fallingDrinkSvg = '';
    if (this.dispensing) {
      const d = DRINKS[this.dispensing.drinkIdx];
      const t = this.dispensing.t;
      // Front pickup chute drop
      const fx = 160 + (this.dispensing.drinkIdx % 3) * 80 * (1 - t) + 70 * t;
      const fy = 260 + t * 175;
      const frot = t * 110;
      fallingDrinkSvg = renderDrinkItemSvg(d, fx, fy, 0.78, frot);
    }

    // Internal X-ray mechanism panel on the right (x: 494..774)
    const internalPanelSvg = this.xray ? `
      <rect x="492" y="24" width="286" height="452" rx="20" fill="#0F172A" stroke="#475569" stroke-width="4"/>
      <rect x="506" y="36" width="258" height="28" rx="10" fill="#1E293B"/>
      <text x="635" y="55" text-anchor="middle" font-size="13" font-weight="900" fill="#38BDF8" font-family="sans-serif">じはんきの なか（メカ だんめん）</text>

      <!-- 1. Serpentine Drink Rack (スネークラック) -->
      <rect x="508" y="74" width="254" height="162" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <text x="520" y="92" font-size="11" font-weight="800" fill="#94A3B8" font-family="sans-serif">スネーク ラック（のこり かん）</text>
      ${DRINKS.map((d, idx) => {
        const lx = 526 + idx * 41;
        const cnt = this.stock[idx];
        const kicking = this.dispensing && this.dispensing.drinkIdx === idx && this.dispensing.t < 0.45;
        return `
          <g data-act="${isRestock ? 'restock-lane' : ''}" data-idx="${idx}" style="${isRestock ? 'cursor:pointer;' : ''}">
            <rect x="${lx - 14}" y="100" width="28" height="108" rx="5" fill="#0B1220" stroke="#475569" stroke-width="1.5"/>
            ${Array.from({ length: cnt }, (_, c) => `
              <rect x="${lx - 11}" y="${188 - c * 19}" width="22" height="15" rx="4" fill="${d.body}" stroke="${d.dark}" stroke-width="1.5"/>
            `).join('')}
            <!-- Solenoid ejector flapper at bottom of column -->
            <line x1="${lx - 12}" y1="212" x2="${lx + 12}" y2="${kicking ? '224' : '212'}" stroke="${kicking ? '#FACC15' : '#94A3B8'}" stroke-width="4" stroke-linecap="round"/>
          </g>
        `;
      }).join('')}
      <!-- Delivery chute ramp below serpentine rack -->
      <path d="M 516 226 L 754 234" stroke="#64748B" stroke-width="5" stroke-linecap="round"/>
      ${this.dispensing ? renderDrinkItemSvg(
        DRINKS[this.dispensing.drinkIdx],
        526 + this.dispensing.drinkIdx * 41 + this.dispensing.t * 50,
        214 + this.dispensing.t * 20,
        0.36,
        this.dispensing.t * 180
      ) : ''}

      <!-- 2. Coin Mechanism & Size Sorter Tubes (コインメック) -->
      <rect x="508" y="248" width="254" height="140" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <text x="520" y="266" font-size="11" font-weight="800" fill="#94A3B8" font-family="sans-serif">コインメック（おおきさ わけ）</text>
      <!-- Angled coin sorting rail -->
      <line x1="518" y1="278" x2="732" y2="294" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
      ${[10, 50, 100, 500].map((val, ti) => {
        const tx = 540 + ti * 48;
        const cnt = this.coinTubes[val] || 0;
        const fillCol = val === 10 ? '#C26D2D' : (val === 500 ? '#EAB308' : '#CBD5E1');
        return `
          <rect x="${tx - 14}" y="298" width="28" height="66" rx="5" fill="#0B1220" stroke="#475569" stroke-width="1.5"/>
          ${Array.from({ length: cnt }, (_, k) => `
            <rect x="${tx - 11}" y="${355 - k * 7}" width="22" height="5" rx="2" fill="${fillCol}"/>
          `).join('')}
          <text x="${tx}" y="379" text-anchor="middle" font-size="10" font-weight="900" fill="#CBD5E1" font-family="sans-serif">${val}円</text>
        `;
      }).join('')}

      <!-- Animated falling coin rolling down rail into its tube! -->
      ${this.fallingCoin ? (() => {
        const t = this.fallingCoin.t;
        const cx = t < 0.55 ? (518 + (this.fallingCoin.targetTubeX - 518) * (t / 0.55)) : this.fallingCoin.targetTubeX;
        const cy = t < 0.55 ? (274 + (t / 0.55) * 14) : (288 + ((t - 0.55) / 0.45) * 60);
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="9" fill="url(#${this.fallingCoin.coin.fill})" stroke="${this.fallingCoin.coin.edge}" stroke-width="2"/>`;
      })() : ''}

      <!-- Jammed coin alert (tap to clear!) -->
      ${this.jammedCoin ? `
        <g data-act="clear-jam" style="cursor:pointer;">
          <circle cx="605" cy="285" r="16" fill="#EF4444" stroke="#FEF08A" stroke-width="3"/>
          <text x="605" y="290" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">つまり</text>
        </g>
      ` : ''}

      <!-- 3. Cooling Fan & Heater Unit -->
      <rect x="508" y="398" width="254" height="64" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <!-- Spinning Cooling Fan -->
      <g transform="translate(556 430)">
        <circle cx="0" cy="0" r="24" fill="#0B1220" stroke="#38BDF8" stroke-width="2.5"/>
        <g transform="rotate(${this.fanAngle.toFixed(0)})">
          <rect x="-4" y="-19" width="8" height="38" rx="4" fill="#38BDF8"/>
          <rect x="-19" y="-4" width="38" height="8" rx="4" fill="#38BDF8"/>
        </g>
        <circle cx="0" cy="0" r="6" fill="#E2E8F0"/>
      </g>
      <text x="594" y="425" font-size="11" font-weight="900" fill="#38BDF8" font-family="sans-serif">れいきゃく ファン</text>
      <!-- Warm Heater Coil on right -->
      <path d="M 604 446 Q 618 434 632 446 T 660 446 T 688 446 T 716 446" stroke="#F87171" stroke-width="5" fill="none" stroke-linecap="round"/>
      <text x="734" y="449" text-anchor="middle" font-size="10" font-weight="900" fill="#FCA5A5" font-family="sans-serif">ヒーター</text>
    ` : `
      <!-- Collected Drinks Shelf when X-ray is OFF -->
      <rect x="498" y="48" width="276" height="404" rx="22" fill="#FFFFFF" stroke="#94A3B8" stroke-width="4"/>
      <text x="636" y="84" text-anchor="middle" font-size="17" font-weight="900" fill="#334155" font-family="sans-serif">かった ドリンク (${this.collectedDrinks.length})</text>
      <rect x="518" y="106" width="236" height="140" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="518" y="264" width="236" height="140" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
      ${this.collectedDrinks.map((d, i) => renderDrinkItemSvg(d, 566 + (i % 3) * 70, 184 + Math.floor(i / 3) * 158, 0.85)).join('')}
    `;

    this.sceneEl.innerHTML = `
      <!-- Main Japanese Vending Machine Exterior Chassis -->
      <rect x="34" y="20" width="436" height="460" rx="20" fill="url(#vl-body-white)" stroke="#475569" stroke-width="4"/>
      <!-- Red side accents -->
      <rect x="36" y="22" width="16" height="456" rx="8" fill="url(#vl-trim-red)"/>
      <rect x="452" y="22" width="16" height="456" rx="8" fill="url(#vl-trim-red)"/>
      <!-- Machine feet -->
      <rect x="64" y="478" width="44" height="12" rx="4" fill="#334155"/>
      <rect x="396" y="478" width="44" height="12" rx="4" fill="#334155"/>

      <!-- Upper Illuminated Drink Showcase -->
      <rect x="62" y="34" width="380" height="270" rx="12" fill="url(#vl-showcase)" stroke="${isRestock ? '#0284C7' : '#334155'}" stroke-width="${isRestock ? '4' : '3'}"/>
      ${slotsSvg}
      <!-- Subtle glass shine streak (removed when service door open) -->
      ${!isRestock ? `<path d="M 74 44 L 136 44 L 84 294 L 68 294 Z" fill="rgba(255,255,255,0.28)" pointer-events="none"/>` : `
        <rect x="148" y="26" width="208" height="24" rx="12" fill="#0284C7"/>
        <text x="252" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">とびら オープン（ほじゅうちゅう）</text>
      `}

      <!-- Middle Control Deck: LED Digital Display, Coin Slot, Return Lever -->
      <rect x="62" y="314" width="380" height="66" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2.5"/>
      <!-- 7-Segment LED Money Counter -->
      <rect x="78" y="325" width="96" height="44" rx="8" fill="#09090B" stroke="#475569" stroke-width="2"/>
      <text x="126" y="356" text-anchor="middle" font-size="26" font-weight="900" fill="#4ADE80" font-family="monospace">${creditStr}</text>
      <text x="164" y="358" font-size="11" font-weight="900" fill="#86EFAC" font-family="sans-serif">円</text>

      <!-- Chrome Return Lever (click to return change!) -->
      <g data-act="return-lever" style="cursor:pointer;" transform="translate(220 347)">
        <circle cx="0" cy="0" r="19" fill="url(#vl-metal)" stroke="#334155" stroke-width="2.5"/>
        <g transform="rotate(${(this.leverTilt * -48).toFixed(1)})">
          <rect x="-5" y="-14" width="10" height="28" rx="4" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
        </g>
        <text x="0" y="29" text-anchor="middle" font-size="9.5" font-weight="900" fill="#CBD5E1" font-family="sans-serif">おつり</text>
      </g>

      <!-- Chrome Coin Insertion Slot -->
      <g transform="translate(290 347)">
        <circle cx="0" cy="0" r="18" fill="url(#vl-metal)" stroke="#334155" stroke-width="2.5"/>
        <rect x="-3" y="-11" width="6" height="22" rx="2" fill="#0F172A"/>
      </g>

      <!-- Change Return Cup -->
      <rect x="334" y="324" width="94" height="46" rx="8" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
      ${this.changeReturnVal > 0 ? `
        <circle cx="364" cy="354" r="9" fill="url(#vl-coin-silver)" stroke="#475569" stroke-width="1.5"/>
        <circle cx="382" cy="356" r="9" fill="url(#vl-coin-bronze)" stroke="#78350F" stroke-width="1.5"/>
        <text x="404" y="350" text-anchor="middle" font-size="11" font-weight="900" fill="#FACC15" font-family="sans-serif">${this.changeReturnVal}円</text>
      ` : `<text x="381" y="351" text-anchor="middle" font-size="10" font-weight="800" fill="#64748B" font-family="sans-serif">おつりぐち</text>`}

      <!-- Bottom Pickup Flap (とりだしぐち) -->
      <rect x="66" y="392" width="372" height="76" rx="12" fill="#0F172A" stroke="#475569" stroke-width="3"/>
      <rect x="78" y="400" width="348" height="22" rx="6" fill="rgba(255,255,255,0.12)"/>
      ${fallingDrinkSvg}
      ${this.pickupDrink ? `
        <g data-act="pickup" style="cursor:pointer;">
          <rect x="86" y="398" width="332" height="64" rx="10" fill="rgba(34,197,94,0.16)" stroke="#4ADE80" stroke-width="2.5"/>
          ${renderDrinkItemSvg(this.pickupDrink, 180, 434, 0.85, 76)}
          <rect x="252" y="414" width="144" height="34" rx="17" fill="#22C55E" stroke="#FFFFFF" stroke-width="2.5"/>
          <text x="324" y="436" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF" font-family="sans-serif">タップして とる！</text>
        </g>
      ` : `<text x="252" y="446" text-anchor="middle" font-size="14" font-weight="900" fill="#475569" font-family="sans-serif">とりだしぐち</text>`}

      ${internalPanelSvg}
    `;
  }

  /* =========================================================================
     Realistic Vending Machine Web Audio Effects
     ========================================================================= */

  playCoinClink(value = 100) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const base = value === 500 ? 1900 : (value === 100 ? 2400 : (value === 50 ? 2750 : 2100));
    [0, 0.055].forEach((delay, idx) => {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * (idx === 0 ? 1 : 1.18), now);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g); g.connect(this.sound.dryBus);
      osc.start(now); osc.stop(now + 0.17);
    });
  }

  playButtonBeep() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1480, now);
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.1);
  }

  playDispenseThud(pitch = 1.0) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(52 * pitch, now + 0.14);
    g.gain.setValueAtTime(0.36, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.17);
  }

  playCoinCascade() {
    [0, 0.06, 0.11, 0.17, 0.23].forEach((d, i) => {
      setTimeout(() => {
        if (!this.destroyed) this.playCoinClink(i % 2 === 0 ? 100 : 10);
      }, d * 1000);
    });
  }

  playRestockClack() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.09);
  }

  playDoorOpen() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.14);
  }
}
