import { FLAT_ICONS } from "../core/flat-icons.js";

const PLUS_THEME_ICONS = ['echoDot', 'echoShow'];

export default class PlusMagicGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.mode = 'concept';

    this.cA = 2;
    this.cB = 3;
    this.cMerged = false;
    this.cCountTimer = null;

    this.stepLevel = 1;
    this.stepStreak = 0;

    this.randMax = 10;
    this.randHint = true;
    this.randScore = 0;

    this.qA = 1;
    this.qB = 1;
    this.qChoices = [];
    this.qSolved = false;
    this.qIconKey = 'echoDot';

    // Concept drag state
    this.drag = null;
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
  }

  mount() {
    this.ensureConceptDragStyles();
    this.app.setGameBackground('#22A06B');
    this.container.innerHTML = `
      <div class="pm-root">
        <div class="lb-title-area" style="margin-top:2px;">
          <h2 class="lb-circuit-name">アレクサ たしざん</h2>
          <p class="lb-circuit-tip" id="pm-tip">アレクサ を ひっぱって いれたり だしたり しよう！</p>
        </div>

        <div class="pm-mode-tabs" id="pm-tabs">
          <button class="pm-tab-btn is-active" type="button" data-mode="concept">${FLAT_ICONS.echoDot(22, 'blue')}<span>わかる</span></button>
          <button class="pm-tab-btn" type="button" data-mode="step">${FLAT_ICONS.stars(1)}<span>ステップ</span></button>
          <button class="pm-tab-btn" type="button" data-mode="random">${FLAT_ICONS.stars(2)}<span>ランダム</span></button>
        </div>

        <div class="pm-board" id="pm-board"></div>
      </div>
    `;

    this.tipEl = this.container.querySelector('#pm-tip');
    this.boardEl = this.container.querySelector('#pm-board');
    this.tabBtns = Array.from(this.container.querySelectorAll('.pm-tab-btn'));

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.switchMode(btn.dataset.mode);
      });
    });

    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.switchMode('concept');
  }

  ensureConceptDragStyles() {
    if (document.getElementById('pm-drag-styles')) return;
    const style = document.createElement('style');
    style.id = 'pm-drag-styles';
    style.textContent = `
      .pm-supply-tray {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.94);
        border: 4px solid var(--tr-border, #FFE0A3);
        border-radius: 26px;
        padding: 10px 18px;
        box-shadow: 0 7px 0 rgba(0, 0, 0, 0.14);
        cursor: grab;
        touch-action: none;
        transition: transform 0.12s ease;
      }
      .pm-supply-tray:active { cursor: grabbing; transform: scale(0.95); }
      .pm-supply-label {
        font-size: 14px;
        font-weight: 900;
        color: #475569;
        white-space: nowrap;
      }
      .pm-basket.is-drop-hover {
        transform: scale(1.06);
        box-shadow: 0 0 0 6px #FFD12E;
      }
      .pm-item.is-draggable {
        cursor: grab;
        touch-action: none;
      }
      .pm-drag-ghost {
        position: fixed;
        pointer-events: none;
        z-index: 95;
        transform: translate(-50%, -50%) scale(1.25);
        filter: drop-shadow(0 10px 14px rgba(0,0,0,0.28));
      }
    `;
    document.head.appendChild(style);
  }

  unmount() {
    clearTimeout(this.cCountTimer);
    this.cleanupDrag();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.container.innerHTML = '';
  }

  switchMode(mode) {
    clearTimeout(this.cCountTimer);
    this.cleanupDrag();
    this.mode = mode;
    this.tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
    this.sound.playPageTurn(1);

    if (mode === 'concept') {
      this.app.setGameBackground('#22A06B');
      this.cMerged = false;
      this.tipEl.textContent = 'アレクサ を ひっぱって いれたり だしたり しよう！';
      this.renderConcept();
    } else if (mode === 'step') {
      this.app.setGameBackground('#0EA5E9');
      this.tipEl.textContent = 'あわせて いくつに なるかな？';
      this.generateQuestion();
      this.renderQuiz();
    } else {
      this.app.setGameBackground('#F59E0B');
      this.tipEl.textContent = 'いろんな たしざん に ちょうせん！';
      this.generateQuestion();
      this.renderQuiz();
    }
  }

  startAppleDrag(e, { source, side }) {
    if (this.cMerged) {
      this.cMerged = false;
      this.renderConcept();
    }
    e.preventDefault();
    this.sound.unlock();
    this.cleanupDrag();

    const ghost = document.createElement('div');
    ghost.className = 'pm-drag-ghost';
    ghost.innerHTML = side === 'a' ? FLAT_ICONS.echoDot(56, 'blue') : FLAT_ICONS.echoShow(56);
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    this.drag = { pointerId: e.pointerId, source, side, ghostEl: ghost };
    this.sound.playButtonDown(side === 'a' ? 'red' : 'yellow');
    this.updateBasketHover(e.clientX, e.clientY);
  }

  hitBasket(clientX, clientY, basketEl) {
    if (!basketEl) return false;
    const r = basketEl.getBoundingClientRect();
    const pad = 22;
    return clientX >= r.left - pad && clientX <= r.right + pad && clientY >= r.top - pad && clientY <= r.bottom + pad;
  }

  updateBasketHover(clientX, clientY) {
    if (!this.drag) return;
    this.drag.ghostEl.style.left = `${clientX}px`;
    this.drag.ghostEl.style.top = `${clientY}px`;
    const bA = this.boardEl.querySelector('#pm-basket-a');
    const bB = this.boardEl.querySelector('#pm-basket-b');
    if (bA) bA.classList.toggle('is-drop-hover', this.drag.source === 'supply' && this.hitBasket(clientX, clientY, bA));
    if (bB) bB.classList.toggle('is-drop-hover', this.drag.source === 'supply' && this.hitBasket(clientX, clientY, bB));
  }

  handlePointerMove(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    e.preventDefault();
    this.updateBasketHover(e.clientX, e.clientY);
  }

  handlePointerUp(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    const d = this.drag;
    const bA = this.boardEl.querySelector('#pm-basket-a');
    const bB = this.boardEl.querySelector('#pm-basket-b');
    const inA = this.hitBasket(e.clientX, e.clientY, bA);
    const inB = this.hitBasket(e.clientX, e.clientY, bB);
    this.cleanupDrag();

    if (d.source === 'supply') {
      if (inA && this.cA < 6) {
        this.cA++;
        this.sound.playCountPip(this.cA);
      } else if (inB && this.cB < 6) {
        this.cB++;
        this.sound.playCountPip(this.cB);
      } else if (d.side === 'a' && !inB && this.cA < 6) {
        const rA = bA && bA.getBoundingClientRect();
        if (rA && e.clientY < rA.bottom + 50 && e.clientX < window.innerWidth / 2) {
          this.cA++;
          this.sound.playCountPip(this.cA);
        }
      } else if (d.side === 'b' && !inA && this.cB < 6) {
        const rB = bB && bB.getBoundingClientRect();
        if (rB && e.clientY < rB.bottom + 50 && e.clientX >= window.innerWidth / 2) {
          this.cB++;
          this.sound.playCountPip(this.cB);
        }
      }
    } else if (d.source === 'basket') {
      if (d.side === 'a' && !inA && this.cA > 0) {
        this.cA--;
        this.sound.playGearRemove();
      } else if (d.side === 'b' && !inB && this.cB > 0) {
        this.cB--;
        this.sound.playGearRemove();
      }
    }

    this.renderConcept();
  }

  cleanupDrag() {
    if (this.drag && this.drag.ghostEl) this.drag.ghostEl.remove();
    this.drag = null;
    this.boardEl && this.boardEl.querySelectorAll('.is-drop-hover').forEach((el) => el.classList.remove('is-drop-hover'));
  }

  renderConcept() {
    const sum = this.cA + this.cB;
    const itemsA = this.cA > 0
      ? Array.from({ length: this.cA }, () => `<span class="pm-item is-draggable" data-basket-apple="a">${FLAT_ICONS.echoDot(42, 'blue')}</span>`).join('')
      : `<span style="color:#CBD5E1;font-weight:900;font-size:14px;">ここに いれてね</span>`;
    const itemsB = this.cB > 0
      ? Array.from({ length: this.cB }, () => `<span class="pm-item is-draggable" data-basket-apple="b">${FLAT_ICONS.echoShow(42)}</span>`).join('')
      : `<span style="color:#CBD5E1;font-weight:900;font-size:14px;">ここに いれてね</span>`;
    const mergedItems = Array.from({ length: sum }, (_, i) =>
      `<span class="pm-item" data-count-idx="${i}">${i < this.cA ? FLAT_ICONS.echoDot(42, 'blue') : FLAT_ICONS.echoShow(42)}</span>`
    ).join('');

    this.boardEl.innerHTML = `
      <div class="pm-equation-card">
        <div class="pm-visual-groups">
          ${this.cMerged ? `
            <div class="pm-basket is-merged" id="pm-merged-basket">${mergedItems || '<span style="color:#94A3B8;font-weight:900;">0 こ</span>'}</div>
          ` : `
            <div class="pm-basket" id="pm-basket-a">${itemsA}</div>
            <span style="color:#64748B;display:inline-flex;">${FLAT_ICONS.plusSign(30)}</span>
            <div class="pm-basket is-right" id="pm-basket-b">${itemsB}</div>
          `}
        </div>

        <div class="pm-eq-text">
          <span class="pm-num-a">${this.cA}</span>
          <span>＋</span>
          <span class="pm-num-b">${this.cB}</span>
          <span>＝</span>
          <span class="pm-num-ans ${this.cMerged ? 'is-correct' : ''}" id="pm-concept-ans">${this.cMerged ? sum : '？'}</span>
        </div>
      </div>

      <div class="pm-concept-controls">
        <div class="pm-supply-tray" data-supply="a" style="--tr-border:#93C5FD;">
          ${FLAT_ICONS.echoDot(44, 'blue')}
          <span class="pm-supply-label">ひっぱる</span>
        </div>

        <button class="pm-merge-btn" type="button" data-act="toggle-merge">
          ${this.cMerged ? 'わける' : `${FLAT_ICONS.sparkle(24)}<span>あわせる！</span>`}
        </button>

        <div class="pm-supply-tray" data-supply="b" style="--tr-border:#38BDF8;">
          ${FLAT_ICONS.echoShow(44)}
          <span class="pm-supply-label">ひっぱる</span>
        </div>
      </div>
    `;

    // Drag from supply trays into baskets
    this.boardEl.querySelectorAll('[data-supply]').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        this.startAppleDrag(e, { source: 'supply', side: el.dataset.supply });
      });
    });

    // Drag apples out of baskets to remove them
    this.boardEl.querySelectorAll('[data-basket-apple]').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        this.startAppleDrag(e, { source: 'basket', side: el.dataset.basketApple });
      });
    });

    const mergeBtn = this.boardEl.querySelector('[data-act="toggle-merge"]');
    if (mergeBtn) {
      mergeBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        clearTimeout(this.cCountTimer);
        this.cMerged = !this.cMerged;
        this.renderConcept();
        if (this.cMerged) {
          if (this.cA + this.cB > 0) this.animateCountUp(this.cA + this.cB);
          else this.sound.playCountPip(0);
        } else {
          this.sound.playPageTurn(-1);
        }
      });
    }
  }

  animateCountUp(total) {
    let i = 0;
    const step = () => {
      const el = this.boardEl.querySelector(`[data-count-idx="${i}"]`);
      if (el) {
        el.classList.add('is-pop');
        setTimeout(() => el.classList.remove('is-pop'), 220);
      }
      this.sound.playCountPip(i);
      i++;
      if (i < total) {
        this.cCountTimer = setTimeout(step, 180);
      } else {
        this.cCountTimer = setTimeout(() => this.sound.playSuccessFanfare(), 200);
      }
    };
    step();
  }

  generateQuestion() {
    this.qSolved = false;
    this.qIconKey = PLUS_THEME_ICONS[Math.floor(Math.random() * PLUS_THEME_ICONS.length)];

    let a = 1, b = 1;
    if (this.mode === 'step') {
      if (this.stepLevel === 1) {
        const sum = 2 + Math.floor(Math.random() * 4);
        a = 1 + Math.floor(Math.random() * (sum - 1));
        b = sum - a;
      } else if (this.stepLevel === 2) {
        const sum = 5 + Math.floor(Math.random() * 6);
        a = 1 + Math.floor(Math.random() * (sum - 1));
        b = sum - a;
      } else {
        a = 5 + Math.floor(Math.random() * 5);
        b = Math.max(2, 10 - a) + Math.floor(Math.random() * Math.min(6, 16 - a));
        if (a + b > 15) b = 15 - a;
      }
    } else {
      const maxSum = this.randMax;
      const sum = 2 + Math.floor(Math.random() * (maxSum - 1));
      a = 1 + Math.floor(Math.random() * (sum - 1));
      b = sum - a;
    }

    this.qA = a;
    this.qB = b;

    const ans = a + b;
    const set = new Set([ans]);
    const deltas = [-2, -1, 1, 2, 3, -3];
    while (set.size < 4) {
      const d = deltas[Math.floor(Math.random() * deltas.length)];
      const cand = ans + d;
      if (cand >= 1 && cand <= 20) set.add(cand);
    }
    this.qChoices = Array.from(set).sort(() => Math.random() - 0.5);
  }

  renderQuiz() {
    const ans = this.qA + this.qB;
    const showVisuals = this.mode === 'step' || this.randHint;
    const iconHtml = FLAT_ICONS[this.qIconKey](36);
    const itemsA = Array.from({ length: this.qA }, () => `<span class="pm-item">${iconHtml}</span>`).join('');
    const itemsB = Array.from({ length: this.qB }, () => `<span class="pm-item">${iconHtml}</span>`).join('');

    const starsHtml = Array.from({ length: 3 }, (_, i) =>
      i < this.stepStreak ? FLAT_ICONS.star(22) : FLAT_ICONS.starEmpty(22)
    ).join('');

    const statusHtml = this.mode === 'step' ? `
      <div class="pm-status-row">
        <span class="pm-pill">レベル ${this.stepLevel} / 3</span>
        <span class="pm-pill">${starsHtml}</span>
      </div>
    ` : `
      <div class="pm-status-row">
        <span class="pm-pill">${FLAT_ICONS.star(22)}<span>${this.randScore}</span></span>
        <button class="pm-toggle-pill ${this.randMax === 20 ? 'is-on' : ''}" type="button" data-qact="toggle-max">
          ${this.randMax === 10 ? '10 まで' : '20 まで'}
        </button>
        <button class="pm-toggle-pill ${this.randHint ? 'is-on' : ''}" type="button" data-qact="toggle-hint">
          え：${this.randHint ? 'ON' : 'OFF'}
        </button>
      </div>
    `;

    this.boardEl.innerHTML = `
      ${statusHtml}
      <div class="pm-equation-card">
        ${showVisuals ? `
          <div class="pm-visual-groups">
            <div class="pm-basket">${itemsA}</div>
            <span style="color:#64748B;display:inline-flex;">${FLAT_ICONS.plusSign(28)}</span>
            <div class="pm-basket is-right">${itemsB}</div>
          </div>
        ` : ''}
        <div class="pm-eq-text">
          <span class="pm-num-a">${this.qA}</span>
          <span>＋</span>
          <span class="pm-num-b">${this.qB}</span>
          <span>＝</span>
          <span class="pm-num-ans ${this.qSolved ? 'is-correct' : ''}">${this.qSolved ? ans : '？'}</span>
        </div>
      </div>

      <div class="pm-choices">
        ${this.qChoices.map((n) => `
          <button class="pm-choice-btn ${this.qSolved && n === ans ? 'is-correct' : ''}" type="button" data-choice="${n}">${n}</button>
        `).join('')}
      </div>
    `;

    this.boardEl.querySelectorAll('[data-qact]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (btn.dataset.qact === 'toggle-max') {
          this.randMax = this.randMax === 10 ? 20 : 10;
          this.generateQuestion();
        } else {
          this.randHint = !this.randHint;
        }
        this.sound.playButtonDown('yellow');
        this.renderQuiz();
      });
    });

    this.boardEl.querySelectorAll('[data-choice]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.qSolved) return;
        this.sound.unlock();
        const picked = Number(btn.dataset.choice);
        if (picked === ans) {
          this.qSolved = true;
          this.sound.playSuccessFanfare();
          if (this.mode === 'step') {
            this.stepStreak++;
            if (this.stepStreak >= 3 && this.stepLevel < 3) {
              this.stepLevel++;
              this.stepStreak = 0;
              this.tipEl.textContent = `レベル ${this.stepLevel} に ステップアップ！`;
            } else {
              this.tipEl.textContent = `せいかい！ ${this.qA} ＋ ${this.qB} ＝ ${ans}`;
            }
          } else {
            this.randScore++;
            this.tipEl.textContent = `せいかい！ ${this.qA} ＋ ${this.qB} ＝ ${ans}`;
          }
          this.renderQuiz();
          this.cCountTimer = setTimeout(() => {
            this.generateQuestion();
            this.renderQuiz();
          }, 1150);
        } else {
          this.sound.playGentleNudge();
          btn.classList.remove('is-wrong');
          void btn.offsetWidth;
          btn.classList.add('is-wrong');
          this.tipEl.textContent = 'もういっかい かぞえてみよう！';
        }
      });
    });
  }
}
