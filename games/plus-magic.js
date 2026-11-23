import { FLAT_ICONS } from "../core/flat-icons.js";

const PLUS_THEME_ICONS = ['apple', 'strawberry', 'orange', 'star', 'chick'];

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
    this.qIconKey = 'apple';
  }

  mount() {
    this.app.setGameBackground('#22A06B');
    this.container.innerHTML = `
      <div class="pm-root">
        <div class="lb-title-area" style="margin-top:2px;">
          <h2 class="lb-circuit-name"><ruby>PLUS MAGIC<rt>たしざん の まほう</rt></ruby></h2>
          <p class="lb-circuit-tip" id="pm-tip">あわせると いくつ？</p>
        </div>

        <div class="pm-mode-tabs" id="pm-tabs">
          <button class="pm-tab-btn is-active" type="button" data-mode="concept">1. わかる</button>
          <button class="pm-tab-btn" type="button" data-mode="step">2. ステップ</button>
          <button class="pm-tab-btn" type="button" data-mode="random">3. ランダム</button>
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

    this.switchMode('concept');
  }

  unmount() {
    clearTimeout(this.cCountTimer);
    this.container.innerHTML = '';
  }

  switchMode(mode) {
    clearTimeout(this.cCountTimer);
    this.mode = mode;
    this.tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
    this.sound.playPageTurn(1);

    if (mode === 'concept') {
      this.app.setGameBackground('#22A06B');
      this.cMerged = false;
      this.tipEl.textContent = '「あわせる！」を おしてみよう！';
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

  renderConcept() {
    const sum = this.cA + this.cB;
    const itemsA = Array.from({ length: this.cA }, () => `<span class="pm-item">${FLAT_ICONS.apple(38)}</span>`).join('');
    const itemsB = Array.from({ length: this.cB }, () => `<span class="pm-item">${FLAT_ICONS.greenApple(38)}</span>`).join('');
    const mergedItems = Array.from({ length: sum }, (_, i) =>
      `<span class="pm-item" data-count-idx="${i}">${i < this.cA ? FLAT_ICONS.apple(38) : FLAT_ICONS.greenApple(38)}</span>`
    ).join('');

    this.boardEl.innerHTML = `
      <div class="pm-equation-card">
        <div class="pm-visual-groups">
          ${this.cMerged ? `
            <div class="pm-basket is-merged" id="pm-merged-basket">${mergedItems}</div>
          ` : `
            <div class="pm-basket">${itemsA}</div>
            <span style="color:#64748B;display:inline-flex;">${FLAT_ICONS.plusSign(30)}</span>
            <div class="pm-basket is-right">${itemsB}</div>
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
        <div class="pm-stepper">
          ${FLAT_ICONS.apple(30)}
          <button class="pm-step-btn" type="button" data-act="a-dec" aria-label="へらす" style="--s-bg:#FF7043;--s-sh:#D84315;">${FLAT_ICONS.minusSign(24)}</button>
          <span style="font-size:24px;font-weight:900;min-width:26px;text-align:center;">${this.cA}</span>
          <button class="pm-step-btn" type="button" data-act="a-inc" aria-label="ふやす" style="--s-bg:#FF7043;--s-sh:#D84315;">${FLAT_ICONS.plusSign(24)}</button>
        </div>

        <button class="pm-merge-btn" type="button" data-act="toggle-merge">
          ${this.cMerged ? 'わける' : `${FLAT_ICONS.sparkle(24)}<span>あわせる！</span>`}
        </button>

        <div class="pm-stepper">
          ${FLAT_ICONS.greenApple(30)}
          <button class="pm-step-btn" type="button" data-act="b-dec" aria-label="へらす" style="--s-bg:#0EA5E9;--s-sh:#0369A1;">${FLAT_ICONS.minusSign(24)}</button>
          <span style="font-size:24px;font-weight:900;min-width:26px;text-align:center;">${this.cB}</span>
          <button class="pm-step-btn" type="button" data-act="b-inc" aria-label="ふやす" style="--s-bg:#0EA5E9;--s-sh:#0369A1;">${FLAT_ICONS.plusSign(24)}</button>
        </div>
      </div>
    `;

    this.boardEl.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        clearTimeout(this.cCountTimer);
        const act = btn.dataset.act;
        if (act === 'a-dec' && this.cA > 1) { this.cA--; this.cMerged = false; this.sound.playButtonDown('red'); }
        if (act === 'a-inc' && this.cA < 5) { this.cA++; this.cMerged = false; this.sound.playButtonDown('red'); }
        if (act === 'b-dec' && this.cB > 1) { this.cB--; this.cMerged = false; this.sound.playButtonDown('yellow'); }
        if (act === 'b-inc' && this.cB < 5) { this.cB++; this.cMerged = false; this.sound.playButtonDown('yellow'); }
        if (act === 'toggle-merge') {
          this.cMerged = !this.cMerged;
          this.renderConcept();
          if (this.cMerged) {
            this.animateCountUp(this.cA + this.cB);
          } else {
            this.sound.playPageTurn(-1);
          }
          return;
        }
        this.renderConcept();
      });
    });
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
