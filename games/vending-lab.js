import {
  DRINKS,
  COINS,
  buildVendingDefsSvg,
  renderDrinkItemSvg,
  renderDiegeticCoinSvg
} from './vending-lab-assets.js';

export default class VendingLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'buy'; // 'buy' | 'restock'
    this.xray = true;
    this.credit = 0;
    this.stock = DRINKS.map((_, i) => (i === 3 ? 1 : 3));
    this.coinTubes = { 10: 4, 50: 3, 100: 4, 500: 1 };
    this.jammedCoin = false;

    this.collectedDrinks = [];
    this.pickupDrink = null;
    this.changeReturnVal = 0;

    // Live 2.5D animations
    this.flyingCoin = null; // { coin, t, startX, startY, targetTubeX }
    this.dispensing = null; // { drinkIdx, t }
    this.leverTilt = 0;
    this.fanAngle = 0;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#FEF3C7');
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
    const old = document.getElementById('vl-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'vl-styles';
    style.textContent = `
      .vl-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #FEF3C7; color: #1E293B; user-select: none; -webkit-user-select: none;
        padding: 8px 10px 10px; box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .vl-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
        flex-wrap: wrap; padding-left: 52px; padding-right: 52px; min-height: 42px;
      }
      .vl-modes {
        display: flex; gap: 5px; background: #FFFFFF; padding: 4px;
        border-radius: 16px; border: 3px solid #1E293B; box-shadow: 0 3px 0 #1E293B;
      }
      .vl-mode-btn {
        border: none; border-radius: 11px; padding: 6px 14px; font-size: 14px; font-weight: 900;
        background: transparent; color: #475569; cursor: pointer; font-family: inherit;
      }
      .vl-mode-btn.active { background: #EF4444; color: #FFFFFF; box-shadow: inset 0 -3px 0 #991B1B; }

      .vl-status {
        display: flex; align-items: center; gap: 8px; background: #FFFFFF;
        border: 3px solid #1E293B; border-radius: 16px; padding: 4px 12px;
        box-shadow: 0 3px 0 #1E293B;
      }
      .vl-hint { font-size: 14px; font-weight: 900; color: #1E293B; }
      .vl-xray-btn {
        border: 2.5px solid #1E293B; border-radius: 10px; padding: 4px 10px;
        background: #E2E8F0; color: #1E293B; font-size: 12px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .vl-xray-btn.active { background: #0EA5E9; color: #FFFFFF; }

      .vl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
        border-radius: 22px; border: 4px solid #1E293B; box-shadow: 0 6px 0 rgba(30,41,59,0.2);
        overflow: hidden; background: #BAE6FD;
      }
      .vl-svg { width: 100%; height: 100%; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .vl-root { padding: 6px; gap: 5px; }
        .vl-topbar { padding-left: 44px; padding-right: 44px; }
        .vl-mode-btn { padding: 5px 10px; font-size: 12px; }
        .vl-hint { font-size: 12px; }
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
            <span class="vl-hint" id="vl-hint">みぎの コインを タップして いれよう！</span>
            <button class="vl-xray-btn active" id="vl-xray-btn" type="button">なかの メカ</button>
          </div>
        </div>

        <div class="vl-stage-wrap">
          <svg class="vl-svg" id="vl-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildVendingDefsSvg()}
            <g id="vl-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#vl-svg');
    this.sceneEl = this.mountEl.querySelector('#vl-scene');
    this.hintEl = this.mountEl.querySelector('#vl-hint');
    this.xrayBtn = this.mountEl.querySelector('#vl-xray-btn');

    this.mountEl.querySelectorAll('.vl-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.setMode(btn.dataset.mode);
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
      if (act === 'insert-coin') {
        this.insertCoin(Number(target.dataset.val), Number(target.dataset.sx), Number(target.dataset.sy));
      } else if (act === 'buy-drink') {
        this.buyDrink(Number(target.dataset.idx));
      } else if (act === 'pickup') {
        this.collectPickupDrink();
      } else if (act === 'return-lever') {
        this.pressReturnLever();
      } else if (act === 'restock-lane') {
        this.restockLane(Number(target.dataset.idx));
      } else if (act === 'restock-all') {
        this.stock = DRINKS.map(() => 5);
        this.playRestockClack();
        this.sound.playSuccessFanfare();
        this.hintEl.textContent = 'ぜんぶ まんたん！ とびらの カギを おして しめよう！';
        this.renderScene();
      } else if (act === 'toggle-door') {
        this.setMode(this.mode === 'buy' ? 'restock' : 'buy');
      } else if (act === 'collect-cash') {
        this.coinTubes = { 10: 1, 50: 1, 100: 1, 500: 0 };
        this.playCoinCascade();
        this.hintEl.textContent = 'ジャララッ！ うりあげ コインを かいしゅう！';
        this.renderScene();
      } else if (act === 'make-jam') {
        this.jammedCoin = true;
        this.sound.playBoing();
        this.hintEl.textContent = 'あ！ コインがつまった！ あかいマルを タップして なおそう！';
        this.renderScene();
      } else if (act === 'clear-jam') {
        this.clearCoinJam();
      }
    });
  }

  setMode(m) {
    if (m === this.mode) return;
    this.mode = m;
    this.playDoorOpen();
    this.mountEl.querySelectorAll('.vl-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
    this.hintEl.textContent = m === 'restock'
      ? 'とびら オープン！ レールや はこを タップして ほじゅうしよう！'
      : 'みぎの コインを タップして いれよう！';
    this.renderScene();
  }

  insertCoin(value, sx = 560, sy = 430) {
    if (this.jammedCoin) {
      this.sound.playBoing();
      this.hintEl.textContent = 'コインが つまっているよ！ あかいマルを タップして なおそう！';
      return;
    }
    const coin = COINS.find((c) => c.value === value);
    if (!coin) return;
    if (this.credit + value > 990) {
      this.sound.playBoing();
      this.hintEl.textContent = 'いっぱい はいったよ！ みどりの ボタンを おしてね！';
      return;
    }
    this.credit += value;
    this.coinTubes[value] = Math.min(8, (this.coinTubes[value] || 0) + 1);
    const tubeIdx = { 10: 0, 50: 1, 100: 2, 500: 3 }[value] || 0;
    this.flyingCoin = { coin, t: 0, startX: sx, startY: sy, targetTubeX: 540 + tubeIdx * 48 };
    this.changeReturnVal = 0;
    this.playCoinClink(value);
    this.hintEl.textContent = `${this.credit}えん！ 光った ボタンを ぽちっと おそう！`;
    this.renderScene();
    this.ensureLoop();
  }

  buyDrink(idx) {
    if (this.dispensing) return;
    const drink = DRINKS[idx];
    if (!drink) return;
    if (this.stock[idx] <= 0) {
      this.sound.playBoing();
      this.hintEl.textContent = `${drink.name}は うりきれ！ カギを おして ほじゅうしよう！`;
      return;
    }
    if (this.credit < drink.price) {
      this.sound.playBoing();
      this.hintEl.textContent = `あと ${drink.price - this.credit}えん コインを いれよう！`;
      return;
    }
    if (this.pickupDrink) this.collectPickupDrink();
    this.credit -= drink.price;
    this.stock[idx]--;
    this.playButtonBeep();
    this.dispensing = { drinkIdx: idx, t: 0 };
    this.hintEl.textContent = `${drink.name}が ガタン・ゴトンと おちてくるよ！`;
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
    this.hintEl.textContent = `ジャララッ！ おつり ${this.changeReturnVal}えん！`;
    this.renderScene();
    this.ensureLoop();
  }

  restockLane(idx) {
    if (this.stock[idx] >= 5) {
      this.sound.playMetalClick();
      this.hintEl.textContent = `${DRINKS[idx].name}は まんたんだよ！`;
      return;
    }
    this.stock[idx]++;
    this.playRestockClack();
    this.hintEl.textContent = `${DRINKS[idx].name}を ほじゅう！（${this.stock[idx]}ほん）`;
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
    return this.xray || !!this.flyingCoin || !!this.dispensing || this.leverTilt > 0.01;
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 34) {
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
    if (this.flyingCoin) {
      this.flyingCoin.t += dt * 1.45;
      if (this.flyingCoin.t >= 1) this.flyingCoin = null;
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
        this.hintEl.textContent = `ガコン！ とりだしぐちの ${this.pickupDrink.name}を タップしよう！`;
      }
      dirty = true;
    }
    if (dirty) this.renderScene();
  }

  renderScene() {
    const ink = '#1E293B';
    const isRestock = this.mode === 'restock';
    const creditStr = String(this.credit).padStart(3, '0');

    // Drink slots inside 2.5D showcase (x: 56..412)
    const slotsSvg = DRINKS.map((d, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const sx = 114 + col * 108;
      const sy = 104 + row * 124;
      const stock = this.stock[i];
      const canBuy = !isRestock && stock > 0 && this.credit >= d.price;
      const soldOut = stock <= 0;

      return `
        <!-- 2.5D Shelf Stage -->
        <rect x="${sx - 46}" y="${sy - 44}" width="92" height="86" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <ellipse cx="${sx}" cy="${sy + 26}" rx="20" ry="5" fill="rgba(30,41,59,0.16)"/>
        ${renderDrinkItemSvg(d, sx, sy - 6, 0.86)}
        <!-- Cold / Hot Bar -->
        <rect x="${sx - 44}" y="${sy + 32}" width="88" height="13" rx="4" fill="${d.temp === 'hot' ? '#EF4444' : '#0EA5E9'}" stroke="${ink}" stroke-width="1.8"/>
        <text x="${sx}" y="${sy + 42}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${d.temp === 'hot' ? 'あったか〜い' : 'つめた〜い'}</text>

        <!-- 2.5D Chunky Tactile Push Button right beneath the drink! -->
        <g data-act="${isRestock ? 'restock-lane' : 'buy-drink'}" data-idx="${i}" style="cursor:pointer;">
          <rect x="${sx - 43}" y="${sy + 52}" width="86" height="24" rx="9" fill="${ink}"/>
          <rect x="${sx - 43}" y="${sy + 48}" width="86" height="24" rx="9"
            fill="${isRestock ? '#38BDF8' : (soldOut ? '#991B1B' : (canBuy ? '#22C55E' : '#475569'))}"
            stroke="${ink}" stroke-width="2.5"/>
          <circle cx="${sx - 30}" cy="${sy + 60}" r="4.8" fill="${soldOut ? '#FCA5A5' : (canBuy ? '#FEF08A' : '#94A3B8')}" stroke="${ink}" stroke-width="1.5"/>
          <text x="${sx + 7}" y="${sy + 64}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">
            ${isRestock ? `＋いれる(${stock})` : (soldOut ? 'うりきれ' : `${d.price}円`)}
          </text>
        </g>
      `;
    }).join('');

    // Falling drink animation inside chute
    let fallingDrinkSvg = '';
    if (this.dispensing) {
      const d = DRINKS[this.dispensing.drinkIdx];
      const t = this.dispensing.t;
      const fx = 140 + (this.dispensing.drinkIdx % 3) * 80 * (1 - t) + 70 * t;
      const fy = 264 + t * 172;
      fallingDrinkSvg = renderDrinkItemSvg(d, fx, fy, 0.78, t * 110);
    }

    // Flying coin arc from right wooden tray -> chrome slot (274, 348) -> X-ray coin rail!
    let flyingCoinSvg = '';
    if (this.flyingCoin) {
      const fc = this.flyingCoin;
      if (fc.t < 0.42) {
        const u = fc.t / 0.42;
        const cx = fc.startX + (274 - fc.startX) * u;
        const cy = fc.startY + (348 - fc.startY) * u - Math.sin(u * Math.PI) * 75;
        flyingCoinSvg = renderDiegeticCoinSvg(fc.coin, cx, cy, 0.85 - u * 0.25);
      } else if (this.xray) {
        const u = (fc.t - 0.42) / 0.58;
        const cx = u < 0.55 ? (510 + (fc.targetTubeX - 510) * (u / 0.55)) : fc.targetTubeX;
        const cy = u < 0.55 ? (230 + (u / 0.55) * 14) : (244 + ((u - 0.55) / 0.45) * 52);
        flyingCoinSvg = renderDiegeticCoinSvg(fc.coin, cx, cy, 0.44);
      }
    }

    // Right Lower Diegetic Counter: Coin Tray (Buy Mode) OR Refill Crate (Restock Mode)
    const rightBottomTraySvg = !isRestock ? `
      <!-- 2.5D Wooden Coin Counter Stand right beside the Coin Slot! -->
      <polygon points="484,386 502,374 786,374 768,386" fill="#E4B884" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="484" y="386" width="284" height="86" rx="16" fill="#D29B63" stroke="${ink}" stroke-width="3.5"/>
      <rect x="498" y="394" width="256" height="66" rx="12" fill="#FEF3C7" stroke="#92400E" stroke-width="2.5"/>
      ${COINS.map((c, ci) => {
        const cx = 532 + ci * 62;
        const cy = 426;
        return `
          <g data-act="insert-coin" data-val="${c.value}" data-sx="${cx}" data-sy="${cy}" style="cursor:pointer;">
            ${renderDiegeticCoinSvg(c, cx, cy, 0.96)}
          </g>
        `;
      }).join('')}
      <!-- Visual curved arrow showing coins go straight into the slot! -->
      <path d="M 480 412 Q 430 412 414 366" stroke="#F59E0B" stroke-width="5" stroke-dasharray="8 6" fill="none" stroke-linecap="round"/>
      <polygon points="410,354 404,372 422,368" fill="#F59E0B" stroke="${ink}" stroke-width="2"/>
    ` : `
      <!-- 2.5D Technician Service Crate (Refill All / Cashbox / Jam Test) -->
      <polygon points="484,386 502,374 786,374 768,386" fill="#7DD3FC" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="484" y="386" width="284" height="86" rx="16" fill="#0EA5E9" stroke="${ink}" stroke-width="3.5"/>
      <g data-act="restock-all" style="cursor:pointer;" transform="translate(556 428)">
        <rect x="-58" y="-22" width="116" height="44" rx="12" fill="#15803D" stroke="${ink}" stroke-width="3"/>
        <rect x="-58" y="-26" width="116" height="44" rx="12" fill="#22C55E" stroke="${ink}" stroke-width="3"/>
        <text x="0" y="1" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="sans-serif">ぜんぶ ほじゅう</text>
      </g>
      <g data-act="collect-cash" style="cursor:pointer;" transform="translate(658 428)">
        <rect x="-38" y="-22" width="76" height="44" rx="12" fill="#B45309" stroke="${ink}" stroke-width="3"/>
        <rect x="-38" y="-26" width="76" height="44" rx="12" fill="#FACC15" stroke="${ink}" stroke-width="3"/>
        <text x="0" y="1" text-anchor="middle" font-size="12" font-weight="900" fill="${ink}" font-family="sans-serif">かいしゅう</text>
      </g>
      <g data-act="make-jam" style="cursor:pointer;" transform="translate(734 428)">
        <rect x="-26" y="-22" width="52" height="44" rx="12" fill="#991B1B" stroke="${ink}" stroke-width="3"/>
        <rect x="-26" y="-26" width="52" height="44" rx="12" fill="#EF4444" stroke="${ink}" stroke-width="3"/>
        <text x="0" y="1" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">つまり</text>
      </g>
    `;

    // Right Upper Panel: 2.5D Cutaway Mech Window OR Collected Drinks Shelf
    const rightTopPanelSvg = this.xray ? `
      <polygon points="488,36 506,22 786,22 768,36" fill="#64748B" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="768,36 786,22 786,348 768,362" fill="#1E293B" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="488" y="36" width="280" height="326" rx="18" fill="#1E293B" stroke="${ink}" stroke-width="4"/>

      <!-- 1. Serpentine Can Rack -->
      <rect x="502" y="50" width="252" height="134" rx="12" fill="#0F172A" stroke="#475569" stroke-width="2"/>
      ${DRINKS.map((d, idx) => {
        const lx = 522 + idx * 41;
        const cnt = this.stock[idx];
        const kicking = this.dispensing && this.dispensing.drinkIdx === idx && this.dispensing.t < 0.45;
        return `
          <g data-act="${isRestock ? 'restock-lane' : ''}" data-idx="${idx}" style="${isRestock ? 'cursor:pointer;' : ''}">
            <rect x="${lx - 14}" y="58" width="28" height="104" rx="5" fill="#1E293B" stroke="#475569" stroke-width="1.8"/>
            ${Array.from({ length: cnt }, (_, c) => `
              <rect x="${lx - 11}" y="${142 - c * 18}" width="22" height="14" rx="4" fill="${d.body}" stroke="${ink}" stroke-width="1.8"/>
            `).join('')}
            <line x1="${lx - 12}" y1="166" x2="${lx + 12}" y2="${kicking ? '178' : '166'}" stroke="${kicking ? '#FACC15' : '#CBD5E1'}" stroke-width="4.5" stroke-linecap="round"/>
          </g>
        `;
      }).join('')}
      ${this.dispensing ? renderDrinkItemSvg(DRINKS[this.dispensing.drinkIdx], 522 + this.dispensing.drinkIdx * 41 + this.dispensing.t * 48, 168 + this.dispensing.t * 14, 0.34, this.dispensing.t * 180) : ''}

      <!-- 2. Coin Sorter Tubes -->
      <rect x="502" y="194" width="252" height="110" rx="12" fill="#0F172A" stroke="#475569" stroke-width="2"/>
      <line x1="510" y1="226" x2="732" y2="240" stroke="#CBD5E1" stroke-width="4.5" stroke-linecap="round"/>
      ${[10, 50, 100, 500].map((val, ti) => {
        const tx = 540 + ti * 48;
        const cnt = this.coinTubes[val] || 0;
        const fillCol = val === 10 ? '#D97736' : (val === 500 ? '#FACC15' : '#E2E8F0');
        return `
          <rect x="${tx - 14}" y="242" width="28" height="48" rx="5" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
          ${Array.from({ length: Math.min(6, cnt) }, (_, k) => `<rect x="${tx - 11}" y="${282 - k * 6.5}" width="22" height="5" rx="2" fill="${fillCol}"/>`).join('')}
          <text x="${tx}" y="300" text-anchor="middle" font-size="9.5" font-weight="900" fill="#CBD5E1" font-family="sans-serif">${val}円</text>
        `;
      }).join('')}
      ${this.jammedCoin ? `
        <g data-act="clear-jam" style="cursor:pointer;">
          <circle cx="606" cy="232" r="17" fill="#EF4444" stroke="#FEF08A" stroke-width="3.5"/>
          <text x="606" y="237" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">なおす</text>
        </g>
      ` : ''}

      <!-- 3. Cooling Fan & Heater Coil -->
      <g transform="translate(534 332)">
        <circle cx="0" cy="0" r="19" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
        <g transform="rotate(${this.fanAngle.toFixed(0)})">
          <rect x="-3.5" y="-14" width="7" height="28" rx="3.5" fill="#38BDF8"/>
          <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#38BDF8"/>
        </g>
        <circle cx="0" cy="0" r="5" fill="#FFFFFF"/>
      </g>
      <path d="M 578 334 Q 594 322 610 334 T 642 334 T 674 334 T 706 334" stroke="#F87171" stroke-width="5" fill="none" stroke-linecap="round"/>
    ` : `
      <!-- Collected Drinks Display Shelf -->
      <rect x="488" y="36" width="280" height="326" rx="20" fill="#FFFFFF" stroke="${ink}" stroke-width="4"/>
      <text x="628" y="68" text-anchor="middle" font-size="16" font-weight="900" fill="${ink}" font-family="sans-serif">かった ドリンク (${this.collectedDrinks.length})</text>
      <rect x="506" y="84" width="244" height="122" rx="14" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5"/>
      <rect x="506" y="220" width="244" height="122" rx="14" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5"/>
      ${this.collectedDrinks.map((d, i) => renderDrinkItemSvg(d, 554 + (i % 3) * 74, 152 + Math.floor(i / 3) * 136, 0.84)).join('')}
    `;

    this.sceneEl.innerHTML = `
      <!-- Sunlit Japanese Street Corner Backdrop -->
      <rect x="0" y="0" width="800" height="422" fill="url(#vl-sky)"/>
      <!-- Soft clouds -->
      <g fill="#FFFFFF" opacity="0.85">
        <circle cx="520" cy="70" r="24"/><circle cx="548" cy="64" r="30"/><circle cx="578" cy="72" r="22"/>
      </g>
      <!-- Sidewalk Pavement -->
      <rect x="0" y="422" width="800" height="78" fill="#CBD5E1"/>
      <line x1="0" y1="422" x2="800" y2="422" stroke="${ink}" stroke-width="4"/>
      <!-- Hard-edged 2.5D Cast Ground Shadow under Vending Machine -->
      <ellipse cx="264" cy="482" rx="218" ry="15" fill="rgba(30,41,59,0.22)"/>

      <!-- 2.5D Extruded Japanese Vending Machine (Top Roof + Thick Red Right Side + White Front!) -->
      <polygon points="32,26 58,10 462,10 436,26" fill="#EF4444" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="436,26 462,10 462,458 436,474" fill="url(#vl-side-red)" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>
      <!-- Feet -->
      <rect x="64" y="472" width="44" height="14" rx="4" fill="#334155" stroke="${ink}" stroke-width="3"/>
      <rect x="364" y="472" width="44" height="14" rx="4" fill="#334155" stroke="${ink}" stroke-width="3"/>
      <!-- Main Enamel Front Face -->
      <rect x="32" y="26" width="404" height="448" rx="18" fill="url(#vl-body-white)" stroke="${ink}" stroke-width="4"/>
      <rect x="34" y="28" width="14" height="444" rx="6" fill="#EF4444"/>

      <!-- Illuminated Showcase -->
      <rect x="58" y="38" width="356" height="268" rx="12" fill="#E0F2FE" stroke="${isRestock ? '#0284C7' : ink}" stroke-width="3.5"/>
      ${slotsSvg}
      ${!isRestock ? `<path d="M 70 46 L 128 46 L 78 296 L 64 296 Z" fill="rgba(255,255,255,0.34)" pointer-events="none"/>` : ''}

      <!-- Direct Diegetic Brass Service Keyhole right on machine side door! -->
      <g data-act="toggle-door" style="cursor:pointer;" transform="translate(449 266)">
        <rect x="-10" y="-22" width="20" height="44" rx="6" fill="#FACC15" stroke="${ink}" stroke-width="2.8"/>
        <circle cx="0" cy="-4" r="5" fill="${ink}"/>
        <rect x="-2.5" y="-2" width="5" height="12" rx="2" fill="${ink}"/>
      </g>

      <!-- Middle Control Deck: LED Counter, Chrome Return Lever, Glowing Coin Slot, Return Cup -->
      <rect x="58" y="316" width="356" height="66" rx="12" fill="#334155" stroke="${ink}" stroke-width="3.5"/>
      <rect x="72" y="326" width="90" height="46" rx="8" fill="#0F172A" stroke="${ink}" stroke-width="2.5"/>
      <text x="115" y="358" text-anchor="middle" font-size="25" font-weight="900" fill="#4ADE80" font-family="monospace">${creditStr}</text>

      <!-- Direct 2.5D Chrome Return Lever -->
      <g data-act="return-lever" style="cursor:pointer;" transform="translate(204 349)">
        <circle cx="0" cy="0" r="20" fill="url(#vl-chrome)" stroke="${ink}" stroke-width="3"/>
        <g transform="rotate(${(this.leverTilt * -52).toFixed(1)})">
          <rect x="-6" y="-14" width="12" height="28" rx="5" fill="#FFFFFF" stroke="${ink}" stroke-width="2.5"/>
        </g>
      </g>

      <!-- Glowing Chrome Coin Slot -->
      <g transform="translate(274 349)">
        <circle cx="0" cy="0" r="20" fill="url(#vl-chrome)" stroke="${this.credit === 0 ? '#FACC15' : ink}" stroke-width="3.5"/>
        <rect x="-3.5" y="-12" width="7" height="24" rx="2.5" fill="${ink}"/>
      </g>

      <!-- Change Return Cup -->
      <rect x="314" y="326" width="88" height="46" rx="10" fill="#0F172A" stroke="${ink}" stroke-width="2.5"/>
      ${this.changeReturnVal > 0 ? `
        <circle cx="342" cy="356" r="9" fill="#E2E8F0" stroke="${ink}" stroke-width="2"/>
        <circle cx="360" cy="358" r="9" fill="#D97736" stroke="${ink}" stroke-width="2"/>
        <text x="382" y="352" text-anchor="middle" font-size="11" font-weight="900" fill="#FACC15" font-family="sans-serif">${this.changeReturnVal}円</text>
      ` : `<text x="358" y="353" text-anchor="middle" font-size="10" font-weight="900" fill="#94A3B8" font-family="sans-serif">おつり</text>`}

      <!-- Pickup Flap Box -->
      <rect x="62" y="392" width="348" height="72" rx="14" fill="#1E293B" stroke="${ink}" stroke-width="3.5"/>
      <rect x="74" y="400" width="324" height="18" rx="6" fill="rgba(255,255,255,0.16)"/>
      ${fallingDrinkSvg}
      ${this.pickupDrink ? `
        <g data-act="pickup" style="cursor:pointer;">
          <rect x="74" y="398" width="324" height="60" rx="10" fill="rgba(34,197,94,0.22)" stroke="#4ADE80" stroke-width="3"/>
          ${renderDrinkItemSvg(this.pickupDrink, 168, 430, 0.84, 76)}
          <rect x="242" y="410" width="140" height="36" rx="18" fill="#22C55E" stroke="${ink}" stroke-width="3"/>
          <text x="312" y="434" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF" font-family="sans-serif">タップで とる！</text>
        </g>
      ` : ''}

      ${rightTopPanelSvg}
      ${rightBottomTraySvg}
      ${flyingCoinSvg}
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
      setTimeout(() => { if (!this.destroyed) this.playCoinClink(i % 2 === 0 ? 100 : 10); }, d * 1000);
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
