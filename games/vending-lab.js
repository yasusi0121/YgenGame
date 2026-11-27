import {
  FONT_ROUND,
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

    this.mode = 'buy';
    this.xray = true;
    this.credit = 0;
    this.stock = DRINKS.map((_, i) => (i === 3 ? 1 : 3));
    this.coinTubes = { 10: 4, 50: 3, 100: 4, 500: 1 };
    this.jammedCoin = false;

    this.collectedDrinks = [];
    this.pickupDrink = null;
    this.changeReturnVal = 0;

    this.flyingCoin = null;
    this.dispensing = null;
    this.leverTilt = 0;
    this.fanAngle = 0;

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
        background: #F6EFE4; color: #3D405B; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .vl-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .vl-modes {
        display: flex; gap: 4px; background: rgba(61,64,91,0.08); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.7);
      }
      .vl-mode-btn {
        border: none; border-radius: 999px; padding: 6px 16px; font-size: 14px; font-weight: 800;
        background: transparent; color: #6B7280; cursor: pointer; font-family: inherit;
      }
      .vl-mode-btn.active { background: #F05A5B; color: #FFFFFF; box-shadow: 0 3px 0 #C43B3C; }

      .vl-pill {
        display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.85);
        border: 2px solid #FFFFFF; border-radius: 999px; padding: 5px 14px;
        box-shadow: 0 3px 0 rgba(61,64,91,0.07);
      }
      .vl-hint { font-size: 14px; font-weight: 800; color: #3D405B; }
      .vl-xray-btn {
        border: none; border-radius: 999px; padding: 4px 11px;
        background: #E2E8F0; color: #475569; font-size: 12px; font-weight: 800;
        cursor: pointer; font-family: inherit;
      }
      .vl-xray-btn.active { background: #4FA8D8; color: #FFFFFF; box-shadow: 0 2px 0 #2F80B0; }

      .vl-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .vl-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }

      @media (max-width: 640px) {
        .vl-root { padding: 8px 6px; }
        .vl-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
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
            <button class="vl-mode-btn active" data-mode="buy" type="button">かう</button>
            <button class="vl-mode-btn" data-mode="restock" type="button">ほじゅう</button>
          </div>
          <div class="vl-pill">
            <span class="vl-hint" id="vl-hint">コインを タップして いれよう</span>
            <button class="vl-xray-btn active" id="vl-xray-btn" type="button">なか</button>
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
        this.hintEl.textContent = 'ぜんぶ まんたんに なったよ！';
        this.renderScene();
      } else if (act === 'toggle-door') {
        this.setMode(this.mode === 'buy' ? 'restock' : 'buy');
      } else if (act === 'collect-cash') {
        this.coinTubes = { 10: 1, 50: 1, 100: 1, 500: 0 };
        this.playCoinCascade();
        this.hintEl.textContent = 'ジャララッ！ コインを かいしゅう！';
        this.renderScene();
      } else if (act === 'make-jam') {
        this.jammedCoin = true;
        this.sound.playBoing();
        this.hintEl.textContent = 'コインが つまったよ！ タップして なおそう';
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
      ? 'レールを タップして ドリンクを いれよう'
      : 'コインを タップして いれよう';
    this.renderScene();
  }

  insertCoin(value, sx = 560, sy = 430) {
    if (this.jammedCoin) {
      this.sound.playBoing();
      this.hintEl.textContent = 'コインが つまっているよ！ タップして なおそう';
      return;
    }
    const coin = COINS.find((c) => c.value === value);
    if (!coin) return;
    if (this.credit + value > 990) {
      this.sound.playBoing();
      this.hintEl.textContent = 'いっぱい はいったよ！ ボタンを おそう';
      return;
    }
    this.credit += value;
    this.coinTubes[value] = Math.min(8, (this.coinTubes[value] || 0) + 1);
    const tubeIdx = { 10: 0, 50: 1, 100: 2, 500: 3 }[value] || 0;
    this.flyingCoin = { coin, t: 0, startX: sx, startY: sy, targetTubeX: 540 + tubeIdx * 48 };
    this.changeReturnVal = 0;
    this.playCoinClink(value);
    this.hintEl.textContent = `${this.credit}えん！ 光った ボタンを おそう`;
    this.renderScene();
    this.ensureLoop();
  }

  buyDrink(idx) {
    if (this.dispensing) return;
    const drink = DRINKS[idx];
    if (!drink) return;
    if (this.stock[idx] <= 0) {
      this.sound.playBoing();
      this.hintEl.textContent = `${drink.name}は うりきれ！ ほじゅうしよう`;
      return;
    }
    if (this.credit < drink.price) {
      this.sound.playBoing();
      this.hintEl.textContent = `あと ${drink.price - this.credit}えん いれよう`;
      return;
    }
    if (this.pickupDrink) this.collectPickupDrink();
    this.credit -= drink.price;
    this.stock[idx]--;
    this.playButtonBeep();
    this.dispensing = { drinkIdx: idx, t: 0 };
    this.hintEl.textContent = `${drink.name} が おちてくるよ！`;
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
    this.hintEl.textContent = `${d.name} を ゲット！`;
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
    this.hintEl.textContent = `おつり ${this.changeReturnVal}えん！`;
    this.renderScene();
    this.ensureLoop();
  }

  restockLane(idx) {
    if (this.stock[idx] >= 5) {
      this.sound.playMetalClick();
      this.hintEl.textContent = `${DRINKS[idx].name} は まんたんだよ`;
      return;
    }
    this.stock[idx]++;
    this.playRestockClack();
    this.hintEl.textContent = `${DRINKS[idx].name} を ほじゅう（${this.stock[idx]}ほん）`;
    this.renderScene();
  }

  clearCoinJam() {
    if (!this.jammedCoin) return;
    this.jammedCoin = false;
    this.playCoinClink(100);
    this.sound.playSuccessFanfare();
    this.hintEl.textContent = 'コインづまり なおったよ！';
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

  stepAnimations(dt) {
    let dirty = false;
    if (this.xray) { this.fanAngle = (this.fanAngle + dt * 200) % 360; dirty = true; }
    if (this.leverTilt > 0) { this.leverTilt = Math.max(0, this.leverTilt - dt * 3.2); dirty = true; }
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
        this.hintEl.textContent = `ガコン！ ${this.pickupDrink.name} を とりだそう`;
      }
      dirty = true;
    }
    if (dirty) this.renderScene();
  }

  renderScene() {
    const isRestock = this.mode === 'restock';
    const creditStr = String(this.credit).padStart(3, '0');

    const slotsSvg = DRINKS.map((d, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const sx = 114 + col * 108;
      const sy = 104 + row * 124;
      const stock = this.stock[i];
      const canBuy = !isRestock && stock > 0 && this.credit >= d.price;
      const soldOut = stock <= 0;

      const btnBg = isRestock ? '#4FA8D8' : (soldOut ? '#D6A3A3' : (canBuy ? '#34D399' : '#B8C4D0'));
      const btnLip = isRestock ? '#2F80B0' : (soldOut ? '#B87E7E' : (canBuy ? '#10B981' : '#94A3B8'));

      return `
        <rect x="${sx - 46}" y="${sy - 44}" width="92" height="86" rx="12" fill="#FFFFFF"/>
        <ellipse cx="${sx}" cy="${sy + 26}" rx="18" ry="4.5" fill="rgba(61,64,91,0.1)"/>
        ${renderDrinkItemSvg(d, sx, sy - 6, 0.86)}
        <!-- Soft Temperature Bar -->
        <rect x="${sx - 42}" y="${sy + 32}" width="84" height="12" rx="6" fill="${d.temp === 'hot' ? '#F05A5B' : '#4FA8D8'}"/>
        <text x="${sx}" y="${sy + 41}" text-anchor="middle" font-size="8" font-weight="800" fill="#FFFFFF" font-family="${FONT_ROUND}">${d.temp === 'hot' ? 'あったかい' : 'つめたい'}</text>

        <!-- Tactile Matte Toy Push Button (same-hue 3D bottom lip, zero black outline!) -->
        <g data-act="${isRestock ? 'restock-lane' : 'buy-drink'}" data-idx="${i}" style="cursor:pointer;">
          <rect x="${sx - 42}" y="${sy + 52}" width="84" height="24" rx="12" fill="${btnLip}"/>
          <rect x="${sx - 42}" y="${sy + 48}" width="84" height="24" rx="12" fill="${btnBg}"/>
          <circle cx="${sx - 28}" cy="${sy + 60}" r="4.5" fill="${soldOut ? '#F05A5B' : (canBuy ? '#FFF7A8' : 'rgba(255,255,255,0.5)')}"/>
          <text x="${sx + 6}" y="${sy + 64}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">
            ${isRestock ? `＋${stock}/5` : (soldOut ? 'うりきれ' : `${d.price}円`)}
          </text>
        </g>
      `;
    }).join('');

    let fallingDrinkSvg = '';
    if (this.dispensing) {
      const d = DRINKS[this.dispensing.drinkIdx];
      const t = this.dispensing.t;
      const fx = 140 + (this.dispensing.drinkIdx % 3) * 80 * (1 - t) + 70 * t;
      const fy = 264 + t * 172;
      fallingDrinkSvg = renderDrinkItemSvg(d, fx, fy, 0.78, t * 110);
    }

    let flyingCoinSvg = '';
    if (this.flyingCoin) {
      const fc = this.flyingCoin;
      if (fc.t < 0.42) {
        const u = fc.t / 0.42;
        const cx = fc.startX + (274 - fc.startX) * u;
        const cy = fc.startY + (348 - fc.startY) * u - Math.sin(u * Math.PI) * 70;
        flyingCoinSvg = renderDiegeticCoinSvg(fc.coin, cx, cy, 0.85 - u * 0.25);
      } else if (this.xray) {
        const u = (fc.t - 0.42) / 0.58;
        const cx = u < 0.55 ? (510 + (fc.targetTubeX - 510) * (u / 0.55)) : fc.targetTubeX;
        const cy = u < 0.55 ? (230 + (u / 0.55) * 14) : (244 + ((u - 0.55) / 0.45) * 52);
        flyingCoinSvg = renderDiegeticCoinSvg(fc.coin, cx, cy, 0.44);
      }
    }

    const rightBottomTraySvg = !isRestock ? `
      <!-- Soft Warm Oak Coin Tray -->
      <rect x="488" y="392" width="280" height="82" rx="24" fill="#C99B6B"/>
      <rect x="488" y="384" width="280" height="82" rx="24" fill="#E3BC8E"/>
      <rect x="500" y="394" width="256" height="62" rx="18" fill="#F4E8D4"/>
      ${COINS.map((c, ci) => {
        const cx = 534 + ci * 62;
        const cy = 424;
        return `<g data-act="insert-coin" data-val="${c.value}" data-sx="${cx}" data-sy="${cy}" style="cursor:pointer;">${renderDiegeticCoinSvg(c, cx, cy, 0.96)}</g>`;
      }).join('')}
    ` : `
      <!-- Soft Matte Service Tray -->
      <rect x="488" y="392" width="280" height="82" rx="24" fill="#327FA8"/>
      <rect x="488" y="384" width="280" height="82" rx="24" fill="#4FA8D8"/>
      <g data-act="restock-all" style="cursor:pointer;" transform="translate(556 425)">
        <rect x="-56" y="-20" width="112" height="44" rx="16" fill="#059669"/>
        <rect x="-56" y="-24" width="112" height="44" rx="16" fill="#34D399"/>
        <text x="0" y="3" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">ぜんぶ ほじゅう</text>
      </g>
      <g data-act="collect-cash" style="cursor:pointer;" transform="translate(656 425)">
        <rect x="-36" y="-20" width="72" height="44" rx="16" fill="#D19D1E"/>
        <rect x="-36" y="-24" width="72" height="44" rx="16" fill="#F7C948"/>
        <text x="0" y="3" text-anchor="middle" font-size="12" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">かいしゅう</text>
      </g>
      <g data-act="make-jam" style="cursor:pointer;" transform="translate(730 425)">
        <rect x="-26" y="-20" width="52" height="44" rx="16" fill="#C43B3C"/>
        <rect x="-26" y="-24" width="52" height="44" rx="16" fill="#F05A5B"/>
        <text x="0" y="3" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">つまり</text>
      </g>
    `;

    const rightTopPanelSvg = this.xray ? `
      <!-- Sleek Matte Nordic-Slate Cutaway Cabinet (no harsh black lines!) -->
      <rect x="488" y="42" width="280" height="328" rx="26" fill="#2A3647"/>
      <rect x="488" y="34" width="280" height="328" rx="26" fill="#39485C"/>

      <!-- 1. Serpentine Can Rack -->
      <rect x="502" y="48" width="252" height="134" rx="16" fill="#2A3647"/>
      ${DRINKS.map((d, idx) => {
        const lx = 522 + idx * 41;
        const cnt = this.stock[idx];
        const kicking = this.dispensing && this.dispensing.drinkIdx === idx && this.dispensing.t < 0.45;
        return `
          <g data-act="${isRestock ? 'restock-lane' : ''}" data-idx="${idx}" style="${isRestock ? 'cursor:pointer;' : ''}">
            <rect x="${lx - 14}" y="58" width="28" height="102" rx="8" fill="#1F2A38"/>
            ${Array.from({ length: cnt }, (_, c) => `<rect x="${lx - 11}" y="${141 - c * 18}" width="22" height="14" rx="5" fill="${d.body}"/>`).join('')}
            <line x1="${lx - 11}" y1="166" x2="${lx + 11}" y2="${kicking ? '177' : '166'}" stroke="${kicking ? '#F7C948' : '#94A3B8'}" stroke-width="4.5" stroke-linecap="round"/>
          </g>
        `;
      }).join('')}
      ${this.dispensing ? renderDrinkItemSvg(DRINKS[this.dispensing.drinkIdx], 522 + this.dispensing.drinkIdx * 41 + this.dispensing.t * 48, 168 + this.dispensing.t * 14, 0.34, this.dispensing.t * 180) : ''}

      <!-- 2. Coin Sorter Tubes -->
      <rect x="502" y="192" width="252" height="108" rx="16" fill="#2A3647"/>
      <line x1="510" y1="224" x2="732" y2="238" stroke="#CBD5E1" stroke-width="4.5" stroke-linecap="round"/>
      ${[10, 50, 100, 500].map((val, ti) => {
        const tx = 540 + ti * 48;
        const cnt = this.coinTubes[val] || 0;
        const fillCol = val === 10 ? '#E0925C' : (val === 500 ? '#F7CE5B' : '#E6EDF4');
        return `
          <rect x="${tx - 14}" y="240" width="28" height="46" rx="7" fill="#1F2A38"/>
          ${Array.from({ length: Math.min(6, cnt) }, (_, k) => `<rect x="${tx - 11}" y="${279 - k * 6.5}" width="22" height="4.8" rx="2.4" fill="${fillCol}"/>`).join('')}
          <text x="${tx}" y="296" text-anchor="middle" font-size="9.5" font-weight="800" fill="#CBD5E1" font-family="${FONT_ROUND}">${val}</text>
        `;
      }).join('')}
      ${this.jammedCoin ? `
        <g data-act="clear-jam" style="cursor:pointer;">
          <circle cx="606" cy="230" r="17" fill="#F05A5B"/>
          <text x="606" y="235" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">なおす</text>
        </g>
      ` : ''}

      <!-- 3. Cooling Fan & Warm Coil -->
      <g transform="translate(534 330)">
        <circle cx="0" cy="0" r="19" fill="#2A3647"/>
        <g transform="rotate(${this.fanAngle.toFixed(0)})">
          <rect x="-3.5" y="-14" width="7" height="28" rx="3.5" fill="#56CCF2"/>
          <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#56CCF2"/>
        </g>
        <circle cx="0" cy="0" r="5" fill="#FFFFFF"/>
      </g>
      <path d="M 578 332 Q 594 320 610 332 T 642 332 T 674 332 T 706 332" stroke="#FF8585" stroke-width="5" fill="none" stroke-linecap="round"/>
    ` : `
      <!-- Clean Porcelain Display Shelf -->
      <rect x="488" y="42" width="280" height="328" rx="26" fill="#E3D7C5"/>
      <rect x="488" y="34" width="280" height="328" rx="26" fill="#FFFFFF"/>
      <text x="628" y="68" text-anchor="middle" font-size="16" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">かった ドリンク (${this.collectedDrinks.length})</text>
      <rect x="506" y="84" width="244" height="122" rx="18" fill="#F6EFE4"/>
      <rect x="506" y="220" width="244" height="122" rx="18" fill="#F6EFE4"/>
      ${this.collectedDrinks.map((d, i) => renderDrinkItemSvg(d, 554 + (i % 3) * 74, 152 + Math.floor(i / 3) * 136, 0.84)).join('')}
    `;

    this.sceneEl.innerHTML = `
      <!-- Soft Lingokids pastel studio backdrop blobs -->
      <circle cx="96" cy="84" r="110" fill="#FFE29A" opacity="0.32"/>
      <circle cx="716" cy="96" r="120" fill="#B8E8FC" opacity="0.32"/>

      <!-- Soft grounded studio shadow -->
      <ellipse cx="250" cy="480" rx="212" ry="14" fill="rgba(61,64,91,0.12)"/>

      <!-- Iconic Matte Porcelain & Coral-Red Vending Machine (zero black outlines!) -->
      <!-- Coral-red subtle right side thickness -->
      <rect x="54" y="26" width="404" height="448" rx="26" fill="#D94647"/>
      <rect x="44" y="26" width="404" height="448" rx="26" fill="#F05A5B"/>
      <!-- Clean porcelain white front body -->
      <rect x="34" y="26" width="404" height="448" rx="26" fill="url(#vl-body)"/>
      <!-- Signature coral left accent stripe -->
      <rect x="34" y="26" width="16" height="448" rx="8" fill="#F05A5B"/>

      <!-- Soft Showcase Window -->
      <rect x="60" y="40" width="354" height="266" rx="18" fill="#EAF4FA" stroke="${isRestock ? '#4FA8D8' : 'none'}" stroke-width="${isRestock ? '4' : '0'}"/>
      ${slotsSvg}
      ${!isRestock ? `<path d="M 74 46 L 130 46 L 82 296 L 66 296 Z" fill="rgba(255,255,255,0.42)" pointer-events="none"/>` : ''}

      <!-- Direct Brass Service Keyhole on Coral Side -->
      <g data-act="toggle-door" style="cursor:pointer;" transform="translate(446 266)">
        <rect x="-8" y="-20" width="16" height="40" rx="8" fill="#F7C948"/>
        <circle cx="0" cy="-4" r="4.5" fill="#B88314"/>
        <rect x="-2" y="-2" width="4" height="10" rx="2" fill="#B88314"/>
      </g>

      <!-- Middle Control Deck (Soft Matte Slate) -->
      <rect x="60" y="316" width="354" height="66" rx="18" fill="#39485C"/>
      <!-- 7-Segment LED Counter -->
      <rect x="74" y="326" width="88" height="46" rx="12" fill="#232E3D"/>
      <text x="118" y="358" text-anchor="middle" font-size="25" font-weight="900" fill="#6EE7B7" font-family="monospace">${creditStr}</text>

      <!-- Direct Satin Return Lever -->
      <g data-act="return-lever" style="cursor:pointer;" transform="translate(204 349)">
        <circle cx="0" cy="0" r="19" fill="url(#vl-chrome)"/>
        <g transform="rotate(${(this.leverTilt * -52).toFixed(1)})">
          <rect x="-5.5" y="-13" width="11" height="26" rx="5.5" fill="#FFFFFF"/>
        </g>
      </g>

      <!-- Glowing Chrome Coin Slot -->
      <g transform="translate(274 349)">
        ${this.credit === 0 ? `<circle cx="0" cy="0" r="24" fill="none" stroke="#F7C948" stroke-width="3.5" opacity="0.85"/>` : ''}
        <circle cx="0" cy="0" r="19" fill="url(#vl-chrome)"/>
        <rect x="-3" y="-11" width="6" height="22" rx="3" fill="#232E3D"/>
      </g>

      <!-- Change Return Pocket -->
      <rect x="314" y="326" width="88" height="46" rx="12" fill="#232E3D"/>
      ${this.changeReturnVal > 0 ? `
        <circle cx="340" cy="355" r="8.5" fill="#E6EDF4"/>
        <circle cx="358" cy="357" r="8.5" fill="#E0925C"/>
        <text x="382" y="352" text-anchor="middle" font-size="11" font-weight="900" fill="#F7C948" font-family="${FONT_ROUND}">${this.changeReturnVal}円</text>
      ` : `<text x="358" y="353" text-anchor="middle" font-size="10" font-weight="800" fill="#8C9BB0" font-family="${FONT_ROUND}">おつり</text>`}

      <!-- Bottom Pickup Flap -->
      <rect x="64" y="392" width="346" height="72" rx="18" fill="#2A3647"/>
      <rect x="76" y="400" width="322" height="16" rx="8" fill="rgba(255,255,255,0.12)"/>
      ${fallingDrinkSvg}
      ${this.pickupDrink ? `
        <g data-act="pickup" style="cursor:pointer;">
          <rect x="74" y="398" width="326" height="60" rx="14" fill="rgba(52,211,153,0.18)" stroke="#6EE7B7" stroke-width="3"/>
          ${renderDrinkItemSvg(this.pickupDrink, 174, 430, 0.84, 76)}
          <rect x="256" y="410" width="124" height="36" rx="18" fill="#34D399"/>
          <text x="318" y="434" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">とる</text>
        </g>
      ` : ''}

      ${rightTopPanelSvg}
      ${rightBottomTraySvg}
      ${flyingCoinSvg}
    `;
  }

  /* Web Audio Vending Effects */
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
