import { FLAT_ICONS } from "../core/flat-icons.js";

const PIANO_WHITE_KEYS = [
  { id: 'G3', label: 'そ',   freq: 196.00, accent: '#2EC4B6' },
  { id: 'A3', label: 'ら',   freq: 220.00, accent: '#3A86FF' },
  { id: 'B3', label: 'し',   freq: 246.94, accent: '#8338EC' },
  { id: 'C4', label: 'ド',   freq: 261.63, accent: '#FF595E', isC: true },
  { id: 'D4', label: 'れ',   freq: 293.66, accent: '#FF924C' },
  { id: 'E4', label: 'み',   freq: 329.63, accent: '#FFCA3A' },
  { id: 'F4', label: 'ふぁ', freq: 349.23, accent: '#8AC926' },
  { id: 'G4', label: 'そ',   freq: 392.00, accent: '#2EC4B6' },
  { id: 'A4', label: 'ら',   freq: 440.00, accent: '#3A86FF' },
  { id: 'B4', label: 'し',   freq: 493.88, accent: '#8338EC' },
  { id: 'C5', label: 'ド',   freq: 523.25, accent: '#FF595E', isC: true },
  { id: 'D5', label: 'れ',   freq: 587.33, accent: '#FF924C' },
  { id: 'E5', label: 'み',   freq: 659.25, accent: '#FFCA3A' }
];

// Black keys positioned between white key index `afterWhite` and `afterWhite + 1`
const PIANO_BLACK_KEYS = [
  { id: 'Gs3', afterWhite: 0,  freq: 207.65 },
  { id: 'As3', afterWhite: 1,  freq: 233.08 },
  { id: 'Cs4', afterWhite: 3,  freq: 277.18 },
  { id: 'Ds4', afterWhite: 4,  freq: 311.13 },
  { id: 'Fs4', afterWhite: 6,  freq: 369.99 },
  { id: 'Gs4', afterWhite: 7,  freq: 415.30 },
  { id: 'As4', afterWhite: 8,  freq: 466.16 },
  { id: 'Cs5', afterWhite: 10, freq: 554.37 },
  { id: 'Ds5', afterWhite: 11, freq: 622.25 }
];

// Follow-along melodies using white key IDs around middle C (C4)
const SOUND_SONGS = [
  { name: 'きらきらぼし', notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'] },
  { name: 'かえるのうた', notes: ['C4', 'D4', 'E4', 'F4', 'E4', 'D4', 'C4', 'E4', 'F4', 'G4', 'A4', 'G4', 'F4', 'E4'] },
  { name: 'ちょうちょう', notes: ['G4', 'E4', 'E4', 'F4', 'D4', 'D4', 'C4', 'D4', 'E4', 'F4', 'G4', 'G4', 'G4'] }
];

export default class SoundMagicGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.instrument = 'piano';
    this.songIndex = -1;
    this.songStep = 0;
  }

  mount() {
    this.app.setGameBackground('#3A86FF');
    const whiteCount = PIANO_WHITE_KEYS.length;
    const blackWidthPct = (100 / whiteCount) * 0.64;

    this.container.innerHTML = `
      <div class="sm-root">
        <div class="lb-title-area" style="margin-top:4px;">
          <h2 class="lb-circuit-name"><ruby>SOUND MAGIC<rt>おとの まほう</rt></ruby></h2>
          <p class="lb-circuit-tip" id="sm-tip">ぴあのを ひいてみよう！</p>
        </div>

        <div class="sm-controls" id="sm-inst-bar">
          <button class="sm-inst-btn is-active" type="button" data-inst="piano">${FLAT_ICONS.piano(22)}<span>ぴあの</span></button>
          <button class="sm-inst-btn" type="button" data-inst="marimba">${FLAT_ICONS.marimba(22)}<span>もっきん</span></button>
          <button class="sm-inst-btn" type="button" data-inst="sparkle">${FLAT_ICONS.sparkle(22)}<span>きらきら</span></button>
          <button class="sm-inst-btn" type="button" data-inst="drum">${FLAT_ICONS.drum(22)}<span>たいこ</span></button>
          <button class="sm-inst-btn" type="button" id="sm-song-btn" style="background:#FFD12E;color:#4D3300;border-color:#FFFFFF;">
            ${FLAT_ICONS.note(20, '#4D3300')}<span id="sm-song-label">まねっこ</span>
          </button>
        </div>

        <div class="sm-piano-frame">
          <div class="sm-piano-scroll">
            <div class="sm-piano" id="sm-piano">
              ${PIANO_WHITE_KEYS.map((k, idx) => `
                <button class="piano-white-key ${k.isC ? 'is-c-key' : ''}" type="button"
                        data-note-id="${k.id}" data-freq="${k.freq}" data-idx="${idx}"
                        style="--key-accent:${k.accent};">
                  ${k.isC ? FLAT_ICONS.star(18) : ''}
                  <span class="piano-key-name">${k.label}</span>
                </button>
              `).join('')}
              ${PIANO_BLACK_KEYS.map((bk, bIdx) => {
                const leftPct = ((bk.afterWhite + 1) / whiteCount) * 100;
                return `
                  <button class="piano-black-key" type="button"
                          data-note-id="${bk.id}" data-freq="${bk.freq}" data-idx="${bIdx + 3}"
                          style="left:${leftPct}%; width:${blackWidthPct}%;"
                          aria-label="黒鍵"></button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.tipEl = this.container.querySelector('#sm-tip');
    this.songBtn = this.container.querySelector('#sm-song-btn');
    this.songLabelEl = this.container.querySelector('#sm-song-label');
    this.keyEls = Array.from(this.container.querySelectorAll('[data-note-id]'));

    // Instrument switcher
    this.container.querySelectorAll('[data-inst]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.instrument = btn.dataset.inst;
        this.container.querySelectorAll('[data-inst]').forEach((b) => b.classList.toggle('is-active', b === btn));
        this.sound.playInstrumentNote(this.instrument, 261.63, 0);
      });
    });

    // Follow-along song mode toggle
    this.songBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.songIndex = this.songIndex + 1;
      if (this.songIndex >= SOUND_SONGS.length) {
        this.songIndex = -1;
      }
      this.songStep = 0;
      this.sound.playPageTurn(1);
      this.updateSongGuide();
    });

    // Multi-touch playable piano keys (white + black)
    this.keyEls.forEach((keyEl) => {
      const noteId = keyEl.dataset.noteId;
      const freq = Number(keyEl.dataset.freq);
      const idx = Number(keyEl.dataset.idx);
      const activePointers = new Set();

      keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sound.unlock();
        try { keyEl.setPointerCapture(e.pointerId); } catch (_) {}
        activePointers.add(e.pointerId);
        keyEl.classList.add('is-pressed');

        this.sound.playInstrumentNote(this.instrument, freq, idx);
        this.spawnFloatingNote(keyEl);

        if (this.songIndex >= 0) {
          const song = SOUND_SONGS[this.songIndex];
          if (song.notes[this.songStep] === noteId) {
            this.songStep++;
            if (this.songStep >= song.notes.length) {
              this.songStep = 0;
              setTimeout(() => this.sound.playSuccessFanfare(), 240);
              this.tipEl.textContent = `すごい！「${song.name}」ひけたよ！`;
            }
            this.updateSongGuide(true);
          }
        }
      });

      const release = (e) => {
        activePointers.delete(e.pointerId);
        if (activePointers.size === 0) {
          keyEl.classList.remove('is-pressed');
        }
      };
      keyEl.addEventListener('pointerup', release);
      keyEl.addEventListener('pointercancel', release);
      keyEl.addEventListener('lostpointercapture', release);
    });

    this.updateSongGuide();
  }

  unmount() {
    this.container.innerHTML = '';
  }

  spawnFloatingNote(keyEl) {
    const note = document.createElement('span');
    note.className = 'sm-float-note';
    const colors = ['#FF595E', '#FFD12E', '#4ADE80', '#38BDF8', '#A78BFA'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    note.innerHTML = Math.random() > 0.35 ? FLAT_ICONS.note(30, col) : FLAT_ICONS.star(28);
    keyEl.appendChild(note);
    setTimeout(() => note.remove(), 740);
  }

  updateSongGuide(keepSuccessTip = false) {
    this.keyEls.forEach((el) => el.classList.remove('is-guide'));
    if (this.songIndex < 0) {
      this.songLabelEl.textContent = 'まねっこ';
      if (!keepSuccessTip) this.tipEl.textContent = 'ぴあのを ひいてみよう！';
      return;
    }
    const song = SOUND_SONGS[this.songIndex];
    this.songLabelEl.textContent = song.name;
    if (!keepSuccessTip) {
      this.tipEl.textContent = `ひかる けんばん を おそう！（${song.name}）`;
    }
    const targetId = song.notes[this.songStep];
    const targetEl = this.container.querySelector(`[data-note-id="${targetId}"]`);
    if (targetEl) {
      targetEl.classList.add('is-guide');
    }
  }
}
