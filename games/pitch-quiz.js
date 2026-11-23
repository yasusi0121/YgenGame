import { FLAT_ICONS } from "../core/flat-icons.js";
import { showCelebrationOverlay } from "../core/celebration.js";

const PQ_LEVELS = {
  easy:   { label: 'かんたん', notes: ['C4', 'E4', 'G4'] },
  normal: { label: 'ふつう',   notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
  hard:   { label: 'むずかしい', notes: ['C4', 'Cs4', 'D4', 'Ds4', 'E4', 'F4', 'Fs4', 'G4', 'Gs4', 'A4', 'As4', 'B4', 'C5'] }
};

const PQ_WHITE_KEYS = [
  { id: 'C4', label: 'ド',   freq: 261.63, accent: '#FF595E', isC: true },
  { id: 'D4', label: 'れ',   freq: 293.66, accent: '#FF924C' },
  { id: 'E4', label: 'み',   freq: 329.63, accent: '#FFCA3A' },
  { id: 'F4', label: 'ふぁ', freq: 349.23, accent: '#8AC926' },
  { id: 'G4', label: 'そ',   freq: 392.00, accent: '#2EC4B6' },
  { id: 'A4', label: 'ら',   freq: 440.00, accent: '#3A86FF' },
  { id: 'B4', label: 'し',   freq: 493.88, accent: '#8338EC' },
  { id: 'C5', label: 'ド',   freq: 523.25, accent: '#FF595E', isC: true }
];

const PQ_BLACK_KEYS = [
  { id: 'Cs4', label: 'ド♯', afterWhite: 0, freq: 277.18 },
  { id: 'Ds4', label: 'れ♯', afterWhite: 1, freq: 311.13 },
  { id: 'Fs4', label: 'ふぁ♯', afterWhite: 3, freq: 369.99 },
  { id: 'Gs4', label: 'そ♯', afterWhite: 4, freq: 415.30 },
  { id: 'As4', label: 'ら♯', afterWhite: 5, freq: 466.16 }
];

const PQ_ALL_MAP = {};
PQ_WHITE_KEYS.forEach((k) => { PQ_ALL_MAP[k.id] = k; });
PQ_BLACK_KEYS.forEach((k) => { PQ_ALL_MAP[k.id] = k; });

export default class PitchQuizGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.level = 'easy';
    this.phase = 'listen'; // 'listen' | 'answer' | 'solved'
    this.targetId = 'C4';
    this.score = 0;
    this.timer = null;
  }

  mount() {
    this.app.setGameBackground('#E85D75');
    const whiteCount = PQ_WHITE_KEYS.length;
    const blackWidthPct = (100 / whiteCount) * 0.62;

    this.container.innerHTML = `
      <div class="pq-root" id="pq-root">
        <div class="lb-title-area" style="margin-top:2px;">
          <h2 class="lb-circuit-name"><ruby>PITCH QUIZ<rt>ぜったい おんかん</rt></ruby></h2>
        </div>

        <div class="pm-status-row">
          <div class="pm-mode-tabs" id="pq-levels">
            <button class="pm-tab-btn is-active" type="button" data-lv="easy">かんたん</button>
            <button class="pm-tab-btn" type="button" data-lv="normal">ふつう</button>
            <button class="pm-tab-btn" type="button" data-lv="hard">むずかしい</button>
          </div>
          <span class="pm-pill" id="pq-score">${FLAT_ICONS.star(22)}<span>0</span></span>
        </div>

        <div class="pq-stage">
          <button class="pq-listen-btn" type="button" id="pq-listen-btn" aria-label="おとを きく">
            ${FLAT_ICONS.speaker(48, '#4D3300')}
            <span id="pq-listen-label">きく</span>
          </button>
          <div class="pq-phase-pill" id="pq-phase-pill">おとを きいてね！</div>
        </div>

        <div class="sm-piano-frame" id="pq-piano-frame">
          <div class="sm-piano-scroll" style="max-width:780px;">
            <div class="sm-piano" id="pq-piano" style="min-width:520px;">
              ${PQ_WHITE_KEYS.map((k, idx) => `
                <button class="piano-white-key ${k.isC ? 'is-c-key' : ''}" type="button"
                        data-note-id="${k.id}" data-freq="${k.freq}" data-idx="${idx}"
                        style="--key-accent:${k.accent};">
                  ${k.isC ? FLAT_ICONS.star(18) : ''}
                  <span class="piano-key-name">${k.label}</span>
                </button>
              `).join('')}
              ${PQ_BLACK_KEYS.map((bk, bIdx) => {
                const leftPct = ((bk.afterWhite + 1) / whiteCount) * 100;
                return `
                  <button class="piano-black-key" type="button"
                          data-note-id="${bk.id}" data-freq="${bk.freq}" data-idx="${bIdx + 10}"
                          style="left:${leftPct}%; width:${blackWidthPct}%;"
                          aria-label="黒鍵"></button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#pq-root');
    this.scoreEl = this.container.querySelector('#pq-score');
    this.listenBtn = this.container.querySelector('#pq-listen-btn');
    this.listenLabel = this.container.querySelector('#pq-listen-label');
    this.phasePill = this.container.querySelector('#pq-phase-pill');
    this.pianoFrame = this.container.querySelector('#pq-piano-frame');
    this.levelBtns = Array.from(this.container.querySelectorAll('[data-lv]'));
    this.keyEls = Array.from(this.container.querySelectorAll('[data-note-id]'));

    this.levelBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.level = btn.dataset.lv;
        this.levelBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        this.startRound();
      });
    });

    this.listenBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.phase === 'solved') return;
      this.sound.unlock();
      this.playTargetPhase();
    });

    this.keyEls.forEach((keyEl) => {
      keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.phase !== 'answer') return;
        this.sound.unlock();
        const noteId = keyEl.dataset.noteId;
        const freq = Number(keyEl.dataset.freq);

        keyEl.classList.add('is-pressed');
        setTimeout(() => keyEl.classList.remove('is-pressed'), 180);
        this.sound.playInstrumentNote('piano', freq, 0);

        if (noteId === this.targetId) {
          this.phase = 'solved';
          this.score++;
          this.scoreEl.innerHTML = `${FLAT_ICONS.star(22)}<span>${this.score}</span>`;
          const info = PQ_ALL_MAP[this.targetId];
          setTimeout(() => {
            showCelebrationOverlay(this.rootEl, {
              title: 'せいかい！',
              subtitle: `「${info.label}」の おと だったよ！`,
              centerHtml: FLAT_ICONS.note(60, '#FF595E'),
              btnLabel: 'つぎの おとへ',
              sound: this.sound,
              onNext: () => this.startRound()
            });
          }, 260);
        } else {
          keyEl.classList.remove('is-wrong-key');
          void keyEl.offsetWidth;
          keyEl.classList.add('is-wrong-key');
          setTimeout(() => keyEl.classList.remove('is-wrong-key'), 420);
          this.phasePill.textContent = 'もういっかい きいてみよう！';
        }
      });
    });

    this.startRound();
  }

  unmount() {
    clearTimeout(this.timer);
    this.container.innerHTML = '';
  }

  startRound() {
    clearTimeout(this.timer);
    const pool = PQ_LEVELS[this.level].notes;
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && next === this.targetId) {
      next = pool[(pool.indexOf(next) + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length];
    }
    this.targetId = next;
    this.playTargetPhase();
  }

  playTargetPhase() {
    clearTimeout(this.timer);
    this.phase = 'listen';
    this.pianoFrame.classList.add('pq-piano-locked');
    this.listenBtn.classList.add('is-playing');
    this.listenLabel.textContent = 'きいてね';
    this.phasePill.textContent = 'おとが なるよ…';

    const info = PQ_ALL_MAP[this.targetId];
    this.sound.playInstrumentNote('piano', info.freq, 0);

    this.timer = setTimeout(() => {
      this.phase = 'answer';
      this.listenBtn.classList.remove('is-playing');
      this.listenLabel.textContent = 'もういちど';
      this.pianoFrame.classList.remove('pq-piano-locked');
      this.phasePill.textContent = 'どの けんばん かな？ おしてね！';
    }, 950);
  }
}
