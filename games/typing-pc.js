import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';

/* =========================================================================
   TYPING PC — Realistic Computer Display + JIS Japanese Layout Keyboard
   5 progressive modes:
     1. ごじゅうおん (50-on table with romaji furigana; auto-advances on correct input)
     2. あいうえお   (Vowels A I U E O)
     3. ローマ字     (Single kana syllables KA, SA, TA...)
     4. ことば       (Words with syllable-by-syllable kana highlight as you type!)
     5. じゆう       (Free romaji-to-hiragana live IME playground)
   ========================================================================= */

const VOWELS = new Set(['A', 'I', 'U', 'E', 'O']);

const JIS_ROWS = [
  ['1','2','3','4','5','6','7','8','9','0','-','^','BS'],
  ['Q','W','E','R','T','Y','U','I','O','P','@','['],
  ['A','S','D','F','G','H','J','K','L',';',':','ENT'],
  ['Z','X','C','V','B','N','M',',','.','/']
];

/* 10 columns (あ..わ) x 5 rows (あ段..お段), Kunrei-shiki romaji; rendered right-to-left (あ on right) */
const GOJUON_COLUMNS = [
  [
    { k: 'あ', r: 'A' }, { k: 'い', r: 'I' }, { k: 'う', r: 'U' }, { k: 'え', r: 'E' }, { k: 'お', r: 'O' }
  ],
  [
    { k: 'か', r: 'KA' }, { k: 'き', r: 'KI' }, { k: 'く', r: 'KU' }, { k: 'け', r: 'KE' }, { k: 'こ', r: 'KO' }
  ],
  [
    { k: 'さ', r: 'SA' }, { k: 'し', r: 'SI' }, { k: 'す', r: 'SU' }, { k: 'せ', r: 'SE' }, { k: 'そ', r: 'SO' }
  ],
  [
    { k: 'た', r: 'TA' }, { k: 'ち', r: 'TI' }, { k: 'つ', r: 'TU' }, { k: 'て', r: 'TE' }, { k: 'と', r: 'TO' }
  ],
  [
    { k: 'な', r: 'NA' }, { k: 'に', r: 'NI' }, { k: 'ぬ', r: 'NU' }, { k: 'ね', r: 'NE' }, { k: 'の', r: 'NO' }
  ],
  [
    { k: 'は', r: 'HA' }, { k: 'ひ', r: 'HI' }, { k: 'ふ', r: 'HU' }, { k: 'へ', r: 'HE' }, { k: 'ほ', r: 'HO' }
  ],
  [
    { k: 'ま', r: 'MA' }, { k: 'み', r: 'MI' }, { k: 'む', r: 'MU' }, { k: 'め', r: 'ME' }, { k: 'も', r: 'MO' }
  ],
  [
    { k: 'や', r: 'YA' }, null, { k: 'ゆ', r: 'YU' }, null, { k: 'よ', r: 'YO' }
  ],
  [
    { k: 'ら', r: 'RA' }, { k: 'り', r: 'RI' }, { k: 'る', r: 'RU' }, { k: 'れ', r: 'RE' }, { k: 'ろ', r: 'RO' }
  ],
  [
    { k: 'わ', r: 'WA' }, null, { k: 'を', r: 'WO' }, null, { k: 'ん', r: 'NN' }
  ]
];

const GOJUON_SEQ = [];
GOJUON_COLUMNS.forEach((col, cIdx) => {
  col.forEach((cell, rIdx) => {
    if (cell) {
      GOJUON_SEQ.push({ ...cell, col: cIdx, row: rIdx, idx: GOJUON_SEQ.length });
    }
  });
});

const LEVEL_VOWELS = [
  { icon: 'apple',      chunks: [{ k: 'あ', r: 'A' }] },
  { icon: 'strawberry', chunks: [{ k: 'い', r: 'I' }] },
  { icon: 'whale',      chunks: [{ k: 'う', r: 'U' }] },
  { icon: 'sparkle',    chunks: [{ k: 'え', r: 'E' }] },
  { icon: 'orange',     chunks: [{ k: 'お', r: 'O' }] }
];

const LEVEL_SYLLABLES = [
  { icon: 'star',     chunks: [{ k: 'か', r: 'KA' }] },
  { icon: 'leaf',     chunks: [{ k: 'き', r: 'KI' }] },
  { icon: 'cloud',    chunks: [{ k: 'く', r: 'KU' }] },
  { icon: 'sparkle',  chunks: [{ k: 'け', r: 'KE' }] },
  { icon: 'bear',     chunks: [{ k: 'こ', r: 'KO' }] },
  { icon: 'flower',   chunks: [{ k: 'さ', r: 'SA' }] },
  { icon: 'dolphin',  chunks: [{ k: 'す', r: 'SU' }] },
  { icon: 'star',     chunks: [{ k: 'た', r: 'TA' }] },
  { icon: 'clover',   chunks: [{ k: 'な', r: 'NA' }] },
  { icon: 'flower',   chunks: [{ k: 'は', r: 'HA' }] },
  { icon: 'peach',    chunks: [{ k: 'ま', r: 'MA' }] },
  { icon: 'lavender', chunks: [{ k: 'ら', r: 'RA' }] }
];

const LEVEL_WORDS = [
  { icon: 'bear',       chunks: [{ k: 'く', r: 'KU' }, { k: 'ま', r: 'MA' }] },
  { icon: 'cloud',      chunks: [{ k: 'く', r: 'KU' }, { k: 'も', r: 'MO' }] },
  { icon: 'peach',      chunks: [{ k: 'も', r: 'MO' }, { k: 'も', r: 'MO' }] },
  { icon: 'star',       chunks: [{ k: 'ほ', r: 'HO' }, { k: 'し', r: 'SI' }] },
  { icon: 'flower',     chunks: [{ k: 'は', r: 'HA' }, { k: 'な', r: 'NA' }] },
  { icon: 'grape',      chunks: [{ k: 'ぶ', r: 'BU' }, { k: 'ど', r: 'DO' }, { k: 'う', r: 'U' }] },
  { icon: 'apple',      chunks: [{ k: 'り', r: 'RI' }, { k: 'ん', r: 'NN' }, { k: 'ご', r: 'GO' }] },
  { icon: 'orange',     chunks: [{ k: 'み', r: 'MI' }, { k: 'か', r: 'KA' }, { k: 'ん', r: 'NN' }] },
  { icon: 'lemon',      chunks: [{ k: 'れ', r: 'RE' }, { k: 'も', r: 'MO' }, { k: 'ん', r: 'NN' }] },
  { icon: 'strawberry', chunks: [{ k: 'い', r: 'I'  }, { k: 'ち', r: 'TI' }, { k: 'ご', r: 'GO' }] },
  { icon: 'dolphin',    chunks: [{ k: 'い', r: 'I'  }, { k: 'る', r: 'RU' }, { k: 'か', r: 'KA' }] },
  { icon: 'whale',      chunks: [{ k: 'く', r: 'KU' }, { k: 'じ', r: 'ZI' }, { k: 'ら', r: 'RA' }] },
  { icon: 'chick',      chunks: [{ k: 'ひ', r: 'HI' }, { k: 'よ', r: 'YO' }, { k: 'こ', r: 'KO' }] },
  { icon: 'icecream',   chunks: [{ k: 'あ', r: 'A'  }, { k: 'い', r: 'I'  }, { k: 'す', r: 'SU' }] }
];

const ROMAJI_TABLE = {
  A:'あ', I:'い', U:'う', E:'え', O:'お',
  KA:'か', KI:'き', KU:'く', KE:'け', KO:'こ',
  SA:'さ', SI:'し', SHI:'し', SU:'す', SE:'せ', SO:'そ',
  TA:'た', TI:'ち', CHI:'ち', TU:'つ', TSU:'つ', TE:'て', TO:'と',
  NA:'な', NI:'に', NU:'ぬ', NE:'ね', NO:'の',
  HA:'は', HI:'ひ', HU:'ふ', FU:'ふ', HE:'へ', HO:'ほ',
  MA:'ま', MI:'み', MU:'む', ME:'め', MO:'も',
  YA:'や', YU:'ゆ', YO:'よ',
  RA:'ら', RI:'り', RU:'る', RE:'れ', RO:'ろ',
  WA:'わ', WO:'を', NN:'ん',
  GA:'が', GI:'ぎ', GU:'ぐ', GE:'げ', GO:'ご',
  ZA:'ざ', ZI:'じ', JI:'じ', ZU:'ず', ZE:'ぜ', ZO:'ぞ',
  DA:'だ', DI:'ぢ', DU:'づ', DE:'で', DO:'ど',
  BA:'ば', BI:'び', BU:'ぶ', BE:'べ', BO:'ぼ',
  PA:'ぱ', PI:'ぴ', PU:'ぷ', PE:'ぺ', PO:'ぽ',
  KYA:'きゃ', KYU:'きゅ', KYO:'きょ',
  SHA:'しゃ', SHU:'しゅ', SHO:'しょ',
  CHA:'ちゃ', CHU:'ちゅ', CHO:'ちょ',
  NYA:'にゃ', NYU:'にゅ', NYO:'にょ',
  HYA:'ひゃ', HYU:'ひゅ', HYO:'ひょ',
  MYA:'みゃ', MYU:'みゅ', MYO:'みょ',
  RYA:'りゃ', RYU:'りゅ', RYO:'りょ',
  GYA:'ぎゃ', GYU:'ぎゅ', GYO:'ぎょ',
  JA:'じゃ',  JU:'じゅ',  JO:'じょ',
  BYA:'びゃ', BYU:'びゅ', BYO:'びょ',
  PYA:'ぴゃ', PYU:'ぴゅ', PYO:'ぴょ'
};

function ensureTypingStyles() {
  if (document.getElementById('tp-styles-v2')) return;
  const old = document.getElementById('tp-styles');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'tp-styles-v2';
  style.textContent = `
    .tp-root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: calc(10px + var(--safe-top)) calc(14px + var(--safe-right)) calc(12px + var(--safe-bottom)) calc(14px + var(--safe-left));
      gap: 8px;
    }
    .tp-top-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
      padding: 0 60px;
      z-index: 15;
    }
    /* Upper half: Realistic Computer Monitor */
    .tp-monitor {
      width: min(96vw, 960px);
      flex: 1;
      min-height: 165px;
      max-height: 315px;
      background: #1E293B;
      border-radius: 26px 26px 18px 18px;
      padding: 10px 12px 12px;
      box-shadow: 0 10px 0 #0F172A, 0 16px 30px rgba(0,0,0,0.28);
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
    }
    .tp-monitor-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
    }
    .tp-dots-win {
      display: flex;
      gap: 7px;
    }
    .tp-dots-win span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .tp-cam-led {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #4ADE80;
      box-shadow: 0 0 8px #4ADE80;
    }
    .tp-screen {
      flex: 1;
      min-height: 0;
      background: #F8FAFC;
      border-radius: 14px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(12px, 2.5vw, 28px);
      color: #1E293B;
      box-shadow: inset 0 4px 10px rgba(15, 23, 42, 0.1);
      overflow: hidden;
    }
    .tp-icon-box {
      width: clamp(68px, 11vh, 108px);
      height: clamp(68px, 11vh, 108px);
      border-radius: 24px;
      background: #EFF6FF;
      border: 4px solid #DBEAFE;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .tp-prompt-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    /* Syllable-mapped kana & romaji groups */
    .tp-chunk-row {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: clamp(10px, 2vw, 20px);
      flex-wrap: wrap;
    }
    .tp-chunk {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .tp-kana-pill {
      font-size: clamp(32px, 5vw, 52px);
      font-weight: 900;
      line-height: 1.05;
      padding: 4px 14px;
      border-radius: 18px;
      color: #475569;
      background: transparent;
      border: 4px solid transparent;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    }
    .tp-kana-pill.is-active {
      background: #FEF9C3;
      border-color: #F59E0B;
      color: #92400E;
      transform: translateY(-2px);
    }
    .tp-kana-pill.is-done {
      background: #22C55E;
      border-color: #16A34A;
      color: #FFFFFF;
      transform: scale(1.08);
      box-shadow: 0 5px 0 #15803D;
    }
    .tp-romaji-slots {
      display: flex;
      align-items: center;
      gap: 5px;
      justify-content: center;
    }
    .tp-slot {
      min-width: clamp(30px, 3.8vw, 44px);
      height: clamp(34px, 4.6vh, 46px);
      padding: 0 6px;
      border-radius: 11px;
      border: 3px solid #CBD5E1;
      background: #FFFFFF;
      color: #64748B;
      font-size: clamp(18px, 2.4vw, 25px);
      font-weight: 900;
      display: grid;
      place-items: center;
      transition: transform 0.14s ease, background 0.14s ease, border-color 0.14s ease;
    }
    .tp-slot.is-done {
      background: #4ADE80;
      border-color: #16A34A;
      color: #FFFFFF;
    }
    .tp-slot.is-current {
      background: #FEF08A;
      border-color: #F59E0B;
      color: #92400E;
      transform: scale(1.1);
    }

    /* Gojuon (50-on) Table inside Computer Monitor */
    .tp-gojuon-wrap {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(10, minmax(0, 1fr));
      grid-template-rows: repeat(5, minmax(0, 1fr));
      gap: clamp(3px, 0.5vw, 6px);
    }
    .tp-gcell {
      border: 2px solid #E2E8F0;
      border-radius: 10px;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
      cursor: pointer;
      padding: 1px;
      transition: transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.14s ease, border-color 0.14s ease;
    }
    .tp-gcell.is-empty {
      background: transparent;
      border-color: transparent;
      pointer-events: none;
    }
    .tp-gcell-r {
      font-size: clamp(9px, 1.1vw, 12px);
      font-weight: 900;
      color: #64748B;
      letter-spacing: 0.02em;
    }
    .tp-gcell-k {
      font-size: clamp(14px, 2vw, 22px);
      font-weight: 900;
      color: #1E293B;
      margin-top: 1px;
    }
    .tp-gcell.is-done {
      background: #DCFCE7;
      border-color: #4ADE80;
    }
    .tp-gcell.is-done .tp-gcell-k { color: #15803D; }
    .tp-gcell.is-done .tp-gcell-r { color: #16A34A; }
    .tp-gcell.is-active {
      background: #FFD12E;
      border-color: #D97706;
      transform: scale(1.12);
      z-index: 4;
      box-shadow: 0 4px 10px rgba(217, 119, 6, 0.35);
    }
    .tp-gcell.is-active .tp-gcell-k { color: #4D3300; }
    .tp-gcell.is-active .tp-gcell-r { color: #92400E; }

    /* Free typing notepad mode */
    .tp-free-pad {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
    }
    .tp-free-text {
      font-size: clamp(26px, 4vw, 42px);
      font-weight: 900;
      color: #1E293B;
      line-height: 1.35;
      word-break: break-all;
      overflow-y: auto;
    }
    .tp-free-buf {
      color: #2563EB;
      text-decoration: underline;
    }
    .tp-cursor {
      display: inline-block;
      width: 4px;
      height: 1em;
      background: #3B82F6;
      vertical-align: -0.12em;
      margin-left: 2px;
      animation: tpBlink 0.9s steps(2) infinite;
    }
    @keyframes tpBlink {
      0% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Lower half: Realistic JIS Japanese Layout Keyboard Deck */
    .tp-kbd-deck {
      width: min(98vw, 960px);
      background: #CBD5E1;
      border: 5px solid #FFFFFF;
      border-radius: 24px;
      padding: clamp(7px, 1.2vw, 13px);
      box-shadow: 0 10px 0 #94A3B8, 0 16px 26px rgba(0,0,0,0.22);
      display: flex;
      flex-direction: column;
      gap: clamp(5px, 0.85vh, 8px);
    }
    .tp-kbd-row {
      display: flex;
      gap: clamp(4px, 0.7vw, 7px);
      justify-content: center;
      width: 100%;
    }
    .tp-key {
      position: relative;
      flex: 1 1 0;
      min-width: 0;
      height: clamp(40px, 6.2vh, 56px);
      border: none;
      border-radius: 11px;
      background: #FFFFFF;
      color: #1E293B;
      font-family: var(--font-rounded);
      font-size: clamp(14px, 2vw, 22px);
      font-weight: 900;
      box-shadow: 0 5px 0 #94A3B8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: none;
      padding: 0;
      transition: transform 0.06s ease, box-shadow 0.06s ease, background 0.1s ease;
    }
    .tp-key.is-vowel {
      background: #FFF1F2;
      color: #BE123C;
      box-shadow: 0 5px 0 #FDA4AF;
    }
    .tp-key.is-special {
      flex: 1.55 1 0;
      background: #E2E8F0;
      color: #334155;
      font-size: clamp(11px, 1.4vw, 15px);
    }
    .tp-key.is-space {
      flex: 0 1 46%;
      height: clamp(34px, 4.8vh, 46px);
      background: #F1F5F9;
      color: #64748B;
      font-size: clamp(12px, 1.4vw, 15px);
    }
    .tp-key.is-home::after {
      content: "";
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 34%;
      height: 3px;
      border-radius: 999px;
      background: #94A3B8;
    }
    .tp-key.is-guide {
      background: #FFD12E !important;
      color: #4D3300 !important;
      box-shadow: 0 0 0 4px #FFF04D, 0 5px 0 #C28A00 !important;
      animation: tpKeyPulse 0.65s ease-in-out infinite alternate;
      z-index: 3;
    }
    @keyframes tpKeyPulse {
      from { transform: translateY(0) scale(1); }
      to   { transform: translateY(-2px) scale(1.06); }
    }
    .tp-key.is-pressed {
      transform: translateY(4px) !important;
      box-shadow: 0 1px 0 #64748B !important;
      background: #4ADE80 !important;
      color: #FFFFFF !important;
    }
    .tp-key.is-wrong {
      background: #FCA5A5 !important;
      color: #7F1D1D !important;
    }
    .tp-sub-tabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.12);
      padding: 3px;
      border-radius: 999px;
    }
    .tp-sub-btn {
      border: none;
      border-radius: 999px;
      background: transparent;
      color: #CBD5E1;
      font-family: var(--font-rounded);
      font-size: clamp(11px, 1.3vw, 13px);
      font-weight: 900;
      padding: 4px 12px;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }
    .tp-sub-btn.is-active {
      background: #FFD12E;
      color: #4D3300;
    }
    .tp-gojuon-col {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tp-gojuon-lcd {
      flex-shrink: 0;
      height: clamp(32px, 4.4vh, 42px);
      background: #0F172A;
      border: 3px solid #334155;
      border-radius: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
    }
    .tp-gojuon-lcd-text {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;
      font-size: clamp(16px, 2.2vw, 22px);
      font-weight: 900;
      color: #4ADE80;
      letter-spacing: 0.1em;
      text-align: left;
    }
    .tp-gojuon-lcd-text::-webkit-scrollbar { display: none; }
    .tp-gojuon-lcd-buf {
      color: #FFD12E;
      text-decoration: underline;
    }
    .tp-lcd-clear {
      border: none;
      border-radius: 999px;
      background: #334155;
      color: #E2E8F0;
      font-family: var(--font-rounded);
      font-size: 11px;
      font-weight: 900;
      padding: 3px 10px;
      cursor: pointer;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

export default class TypingPCGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.mode = 'gojuon'; // 'gojuon' | 'vowels' | 'syllables' | 'words' | 'free'
    this.gojuonSub = 'order'; // 'order' (あから順) | 'random' (ランダム) | 'pick' (自分で押してヒント)
    this.hintOn = true;
    this.score = 0;
    this.streak = 0;
    this.locked = false;

    // Gojuon state
    this.gojuonIdx = 0;
    this.gojuonCharIdx = 0;
    this.gojuonDone = new Set();
    this.gojuonTypedText = '';

    // Chunked prompt state (vowels / syllables / words)
    this.current = LEVEL_WORDS[0];
    this.chunkIdx = 0;
    this.charInChunk = 0;

    // Free IME state
    this.freeText = '';
    this.romajiBuf = '';

    this.onPhysicalKeyDown = this.handlePhysicalKeyDown.bind(this);
  }

  mount() {
    ensureTypingStyles();
    this.app.setGameBackground('#334155');

    this.container.innerHTML = `
      <div class="tp-root" id="tp-root">
        <div class="tp-top-controls">
          <div class="pm-mode-tabs" id="tp-levels">
            <button class="pm-tab-btn is-active" type="button" data-mode="gojuon">1. ごじゅうおん</button>
            <button class="pm-tab-btn" type="button" data-mode="vowels">2. あいうえお</button>
            <button class="pm-tab-btn" type="button" data-mode="syllables">3. ローマ字</button>
            <button class="pm-tab-btn" type="button" data-mode="words">4. ことば</button>
            <button class="pm-tab-btn" type="button" data-mode="free">5. じゆう</button>
          </div>
          <button class="pm-toggle-pill is-on" type="button" id="tp-hint-btn">ひんと：ON</button>
          <span class="pm-pill" id="tp-score">${FLAT_ICONS.star(20)}<span>0</span></span>
        </div>

        <!-- Realistic Computer Display -->
        <div class="tp-monitor">
          <div class="tp-monitor-bar">
            <div class="tp-dots-win">
              <span style="background:#FF5F56;"></span>
              <span style="background:#FFBD2E;"></span>
              <span style="background:#27C93F;"></span>
            </div>
            <div class="tp-sub-tabs" id="tp-gojuon-subs">
              <button class="tp-sub-btn is-active" type="button" data-gsub="order">あから じゅん</button>
              <button class="tp-sub-btn" type="button" data-gsub="random">ランダム</button>
              <button class="tp-sub-btn" type="button" data-gsub="pick">じぶんで えらぶ</button>
            </div>
            <span id="tp-monitor-status" style="color:#94A3B8;font-size:12px;font-weight:900;letter-spacing:0.06em;">KIDS PC</span>
          </div>
          <div class="tp-screen" id="tp-screen"></div>
        </div>

        <!-- Realistic JIS Japanese Keyboard -->
        <div class="tp-kbd-deck" id="tp-kbd">
          ${JIS_ROWS.map((row) => `
            <div class="tp-kbd-row">
              ${row.map((k) => {
                const isSpec = k === 'BS' || k === 'ENT';
                const isVowel = VOWELS.has(k);
                const isHome = k === 'F' || k === 'J';
                const label = k === 'BS' ? 'けす' : (k === 'ENT' ? 'Enter' : k);
                return `<button class="tp-key ${isSpec ? 'is-special' : ''} ${isVowel ? 'is-vowel' : ''} ${isHome ? 'is-home' : ''}" type="button" data-key="${k}">${label}</button>`;
              }).join('')}
            </div>
          `).join('')}
          <div class="tp-kbd-row">
            <button class="tp-key is-space" type="button" data-key="SPACE">スペース</button>
          </div>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#tp-root');
    this.screenEl = this.container.querySelector('#tp-screen');
    this.monitorStatusEl = this.container.querySelector('#tp-monitor-status');
    this.gojuonSubsWrap = this.container.querySelector('#tp-gojuon-subs');
    this.gojuonSubBtns = Array.from(this.container.querySelectorAll('[data-gsub]'));
    this.scoreEl = this.container.querySelector('#tp-score');
    this.hintBtn = this.container.querySelector('#tp-hint-btn');
    this.modeBtns = Array.from(this.container.querySelectorAll('[data-mode]'));
    this.keyBtns = Array.from(this.container.querySelectorAll('.tp-key'));

    this.modeBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.switchMode(btn.dataset.mode);
      });
    });

    this.gojuonSubBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.switchGojuonSub(btn.dataset.gsub);
      });
    });

    this.hintBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.hintOn = !this.hintOn;
      this.hintBtn.classList.toggle('is-on', this.hintOn);
      this.hintBtn.textContent = `ひんと：${this.hintOn ? 'ON' : 'OFF'}`;
      this.sound.playButtonDown('yellow');
      this.updateGuideKey();
    });

    this.keyBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.pressKey(btn.dataset.key, btn);
      });
    });

    window.addEventListener('keydown', this.onPhysicalKeyDown);
    this.switchMode('gojuon');
  }

  unmount() {
    window.removeEventListener('keydown', this.onPhysicalKeyDown);
    this.container.innerHTML = '';
  }

  handlePhysicalKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    let mapped = null;
    if (e.key === 'Backspace') mapped = 'BS';
    else if (e.key === 'Enter') mapped = 'ENT';
    else if (e.key === ' ') mapped = 'SPACE';
    else if (e.key.length === 1) mapped = e.key.toUpperCase();
    if (!mapped) return;

    const btn = this.container.querySelector(`.tp-key[data-key="${CSS.escape(mapped)}"]`);
    if (btn) {
      e.preventDefault();
      this.sound.unlock();
      this.pressKey(mapped, btn);
    }
  }

  switchGojuonSub(sub) {
    this.gojuonSub = sub;
    this.gojuonCharIdx = 0;
    this.gojuonDone.clear();
    this.locked = false;
    this.gojuonSubBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.gsub === sub));
    this.sound.playButtonDown('yellow');

    if (sub === 'order') {
      this.gojuonIdx = 0;
    } else if (sub === 'random') {
      this.gojuonIdx = Math.floor(Math.random() * GOJUON_SEQ.length);
    } else {
      // 'pick': user taps any cell on the 50-on table to show hint & type it
      this.gojuonIdx = -1;
    }
    this.renderScreen();
    this.updateGuideKey();
  }

  switchMode(mode) {
    this.mode = mode;
    this.locked = false;
    this.streak = 0;
    this.modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
    this.gojuonSubsWrap.style.display = mode === 'gojuon' ? 'inline-flex' : 'none';
    this.sound.playPageTurn(1);

    if (mode === 'gojuon') {
      this.gojuonCharIdx = 0;
      if (this.gojuonSub === 'order' && this.gojuonIdx < 0) this.gojuonIdx = 0;
      this.renderScreen();
      this.updateGuideKey();
    } else if (mode === 'free') {
      this.freeText = '';
      this.romajiBuf = '';
      this.renderScreen();
      this.updateGuideKey();
    } else {
      this.nextQuestion();
    }
  }

  nextQuestion() {
    this.locked = false;
    this.chunkIdx = 0;
    this.charInChunk = 0;
    const pool = this.mode === 'vowels' ? LEVEL_VOWELS : (this.mode === 'syllables' ? LEVEL_SYLLABLES : LEVEL_WORDS);
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && next === this.current) {
      next = pool[(pool.indexOf(next) + 1) % pool.length];
    }
    this.current = next;
    this.renderScreen();
    this.updateGuideKey();
  }

  getExpectedKey() {
    if (this.mode === 'free' || this.locked) return null;
    if (this.mode === 'gojuon') {
      if (this.gojuonIdx < 0) return null;
      const target = GOJUON_SEQ[this.gojuonIdx];
      return target ? target.r[this.gojuonCharIdx] : null;
    }
    const chunk = this.current.chunks[this.chunkIdx];
    return chunk ? chunk.r[this.charInChunk] : null;
  }

  pressKey(key, btnEl) {
    if (this.locked) return;

    if (btnEl) {
      btnEl.classList.add('is-pressed');
      setTimeout(() => btnEl.classList.remove('is-pressed'), 130);
    }

    if (this.mode === 'free') {
      this.handleFreeInput(key);
      return;
    }

    if (this.mode === 'gojuon' && key === 'BS') {
      this.sound.playKeyClick(true);
      if (this.gojuonCharIdx > 0) {
        this.gojuonCharIdx--;
      } else if (this.gojuonTypedText.length > 0) {
        this.gojuonTypedText = this.gojuonTypedText.slice(0, -1);
      }
      this.renderScreen();
      this.updateGuideKey();
      return;
    }

    if (this.mode === 'gojuon' && key === 'SPACE') {
      this.sound.playKeyClick(true);
      this.gojuonTypedText = (this.gojuonTypedText + '　').slice(-48);
      this.renderScreen();
      return;
    }

    const expected = this.getExpectedKey();
    if (!expected) {
      this.sound.playKeyClick(false);
      return;
    }

    if (key === expected) {
      this.sound.playKeyClick(false);

      if (this.mode === 'gojuon') {
        this.handleGojuonCorrect();
      } else {
        this.handleChunkCorrect();
      }
    } else if (key.length === 1 && /[A-Z]/.test(key)) {
      this.sound.playGentleNudge();
      if (btnEl) {
        btnEl.classList.remove('is-pressed');
        btnEl.classList.add('is-wrong');
        setTimeout(() => btnEl.classList.remove('is-wrong'), 260);
      }
    } else {
      this.sound.playKeyClick(true);
    }
  }

  /** Gojuon mode: supports 'order', 'random', and 'pick' sub-modes */
  handleGojuonCorrect() {
    const target = GOJUON_SEQ[this.gojuonIdx];
    this.gojuonCharIdx++;
    if (this.gojuonCharIdx >= target.r.length) {
      this.gojuonDone.add(this.gojuonIdx);
      this.gojuonTypedText = (this.gojuonTypedText + target.k).slice(-48);
      this.score++;
      this.scoreEl.innerHTML = `${FLAT_ICONS.star(20)}<span>${this.score}</span>`;
      this.gojuonCharIdx = 0;

      if (this.gojuonSub === 'pick') {
        this.sound.playSuccessFanfare();
        this.gojuonIdx = -1;
        this.renderScreen();
        this.updateGuideKey();
        return;
      }

      if (this.gojuonSub === 'random') {
        this.sound.playCountPip((this.score % 12) + 2);
        let next = Math.floor(Math.random() * GOJUON_SEQ.length);
        if (next === this.gojuonIdx) next = (next + 1) % GOJUON_SEQ.length;
        this.gojuonIdx = next;
        this.renderScreen();
        this.updateGuideKey();
        return;
      }

      // 'order': advance sequentially あ -> ん
      this.sound.playCountPip((this.gojuonIdx % 12) + 2);
      const nextIdx = this.gojuonIdx + 1;

      if (nextIdx >= GOJUON_SEQ.length) {
        this.locked = true;
        this.renderScreen();
        this.updateGuideKey();
        setTimeout(() => {
          showCelebrationOverlay(this.rootEl, {
            title: 'ぜんぶ できた！',
            subtitle: 'あ〜ん まで マスターしたよ！',
            centerHtml: FLAT_ICONS.star(64),
            btnLabel: 'もういっかい',
            sound: this.sound,
            onNext: () => {
              this.gojuonIdx = 0;
              this.gojuonCharIdx = 0;
              this.gojuonDone.clear();
              this.locked = false;
              this.renderScreen();
              this.updateGuideKey();
            }
          });
        }, 200);
      } else {
        if (GOJUON_SEQ[nextIdx].col !== target.col) {
          this.sound.playSuccessFanfare();
        }
        this.gojuonIdx = nextIdx;
        this.renderScreen();
        this.updateGuideKey();
      }
    } else {
      this.sound.playCountPip(this.gojuonCharIdx + 2);
      this.renderScreen();
      this.updateGuideKey();
    }
  }

  /** Vowels / Syllables / Words mode: highlights each kana chunk as its romaji completes! */
  handleChunkCorrect() {
    const chunk = this.current.chunks[this.chunkIdx];
    this.charInChunk++;

    if (this.charInChunk >= chunk.r.length) {
      this.sound.playCountPip(this.chunkIdx + 5);
      this.chunkIdx++;
      this.charInChunk = 0;

      if (this.chunkIdx >= this.current.chunks.length) {
        this.locked = true;
        this.score++;
        this.streak++;
        this.scoreEl.innerHTML = `${FLAT_ICONS.star(20)}<span>${this.score}</span>`;
        this.renderScreen();
        this.updateGuideKey();

        const fullKana = this.current.chunks.map((c) => c.k).join('');
        setTimeout(() => {
          const nextModeMap = { vowels: 'syllables', syllables: 'words', words: null };
          const canLevelUp = this.streak >= 4 && nextModeMap[this.mode];
          showCelebrationOverlay(this.rootEl, {
            title: canLevelUp ? 'レベルアップ！' : 'せいかい！',
            subtitle: `「${fullKana}」が うてたよ！`,
            centerHtml: FLAT_ICONS[this.current.icon](62),
            btnLabel: canLevelUp ? 'つぎの レベルへ' : 'つぎへ',
            sound: this.sound,
            onNext: () => {
              if (canLevelUp) this.switchMode(nextModeMap[this.mode]);
              else this.nextQuestion();
            }
          });
        }, 260);
        return;
      }
    } else {
      this.sound.playCountPip(this.chunkIdx + 2);
    }

    this.renderScreen();
    this.updateGuideKey();
  }

  handleFreeInput(key) {
    if (key === 'BS') {
      this.sound.playKeyClick(true);
      if (this.romajiBuf.length > 0) this.romajiBuf = this.romajiBuf.slice(0, -1);
      else if (this.freeText.length > 0) this.freeText = this.freeText.slice(0, -1);
      this.renderScreen();
      return;
    }
    if (key === 'SPACE') {
      this.sound.playKeyClick(true);
      this.freeText += '　';
      this.romajiBuf = '';
      this.renderScreen();
      return;
    }
    if (key === 'ENT') {
      this.sound.playKeyClick(true);
      if (this.romajiBuf === 'N') this.freeText += 'ん';
      this.romajiBuf = '';
      this.freeText += ' ';
      this.sound.playMenuSelect();
      this.renderScreen();
      return;
    }

    if (/^[0-9\-^@\[\];:,./]$/.test(key)) {
      this.sound.playKeyClick(false);
      this.freeText += key;
      this.romajiBuf = '';
      this.renderScreen();
      return;
    }

    if (!/^[A-Z]$/.test(key)) return;
    this.sound.playKeyClick(false);
    this.romajiBuf += key;

    if (this.romajiBuf.length === 2 && this.romajiBuf[0] === this.romajiBuf[1] && !VOWELS.has(this.romajiBuf[0]) && this.romajiBuf[0] !== 'N') {
      this.freeText += 'っ';
      this.romajiBuf = this.romajiBuf[1];
    }

    if (this.romajiBuf.length === 2 && this.romajiBuf[0] === 'N' && !VOWELS.has(this.romajiBuf[1]) && this.romajiBuf[1] !== 'Y' && this.romajiBuf[1] !== 'N') {
      this.freeText += 'ん';
      this.romajiBuf = this.romajiBuf[1];
    }

    if (ROMAJI_TABLE[this.romajiBuf]) {
      this.freeText += ROMAJI_TABLE[this.romajiBuf];
      this.romajiBuf = '';
      this.sound.playCountPip(this.freeText.length % 12);
    } else if (this.romajiBuf.length >= 3) {
      const hasPrefix = Object.keys(ROMAJI_TABLE).some((k) => k.startsWith(this.romajiBuf));
      if (!hasPrefix) {
        this.romajiBuf = key;
        if (ROMAJI_TABLE[this.romajiBuf]) {
          this.freeText += ROMAJI_TABLE[this.romajiBuf];
          this.romajiBuf = '';
        }
      }
    }

    if (this.freeText.length > 48) {
      this.freeText = this.freeText.slice(-48);
    }
    this.renderScreen();
  }

  renderScreen() {
    if (this.mode === 'gojuon') {
      if (this.gojuonIdx >= 0) {
        const target = GOJUON_SEQ[this.gojuonIdx];
        const typedPart = target.r.slice(0, this.gojuonCharIdx);
        const restPart = target.r.slice(this.gojuonCharIdx);
        this.monitorStatusEl.textContent = `「${target.k}」 ${typedPart}[${restPart[0] || ''}]${restPart.slice(1)}`;
      } else {
        this.monitorStatusEl.textContent = 'すきな もじを タップ！';
      }

      // Standard Japanese Gojuon layout: あ-column on the RIGHT (c = 9 down to 0)
      let cellsHtml = '';
      for (let r = 0; r < 5; r++) {
        for (let c = 9; c >= 0; c--) {
          const item = GOJUON_COLUMNS[c][r];
          if (!item) {
            cellsHtml += `<div class="tp-gcell is-empty"></div>`;
            continue;
          }
          const seqItem = GOJUON_SEQ.find((s) => s.col === c && s.row === r);
          const isActive = seqItem.idx === this.gojuonIdx;
          const isDone = this.gojuonDone.has(seqItem.idx);
          cellsHtml += `
            <button class="tp-gcell ${isActive ? 'is-active' : ''} ${isDone && !isActive ? 'is-done' : ''}"
                    type="button" data-gidx="${seqItem.idx}">
              <span class="tp-gcell-r">${item.r}</span>
              <span class="tp-gcell-k">${item.k}</span>
            </button>
          `;
        }
      }

      const bufStr = this.gojuonIdx >= 0 ? GOJUON_SEQ[this.gojuonIdx].r.slice(0, this.gojuonCharIdx) : '';
      const lcdDisplay = (this.gojuonTypedText || bufStr)
        ? `${this.gojuonTypedText}<span class="tp-gojuon-lcd-buf">${bufStr}</span><span class="tp-cursor" style="background:#4ADE80;"></span>`
        : `<span style="color:#64748B;">にゅうりょくした もじが ここに でるよ</span>`;

      this.screenEl.innerHTML = `
        <div class="tp-gojuon-col">
          <div class="tp-gojuon-lcd">
            <div class="tp-gojuon-lcd-text" id="tp-gojuon-lcd-text">${lcdDisplay}</div>
            <button class="tp-lcd-clear" type="button" id="tp-lcd-clear">けす</button>
          </div>
          <div class="tp-gojuon-wrap" style="flex:1;min-height:0;">${cellsHtml}</div>
        </div>
      `;
      const lcdTextEl = this.screenEl.querySelector('#tp-gojuon-lcd-text');
      if (lcdTextEl) lcdTextEl.scrollLeft = lcdTextEl.scrollWidth;
      this.screenEl.querySelector('#tp-lcd-clear').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.gojuonTypedText = '';
        this.sound.playPageTurn(-1);
        this.renderScreen();
      });
      this.screenEl.querySelectorAll('[data-gidx]').forEach((btn) => {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.unlock();
          this.gojuonIdx = Number(btn.dataset.gidx);
          this.gojuonCharIdx = 0;
          this.sound.playButtonDown('yellow');
          this.renderScreen();
          this.updateGuideKey();
        });
      });
      return;
    }

    if (this.mode === 'free') {
      this.monitorStatusEl.textContent = 'じゆう にゅうりょく';
      this.screenEl.innerHTML = `
        <div class="tp-free-pad">
          <div class="tp-free-text">
            ${this.freeText || '<span style="color:#94A3B8;">すきな キーを おしてみよう！</span>'}<span class="tp-free-buf">${this.romajiBuf}</span><span class="tp-cursor"></span>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <button class="cm-mission-btn" type="button" id="tp-clear-free">ぜんぶ けす</button>
          </div>
        </div>
      `;
      this.screenEl.querySelector('#tp-clear-free').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.freeText = '';
        this.romajiBuf = '';
        this.sound.playPageTurn(-1);
        this.renderScreen();
      });
      return;
    }

    // Vowels / Syllables / Words: syllable-by-syllable paired kana + romaji highlight!
    this.monitorStatusEl.textContent = 'KIDS PC';
    const chunksHtml = this.current.chunks.map((ch, cIdx) => {
      const isChunkDone = cIdx < this.chunkIdx;
      const isChunkActive = cIdx === this.chunkIdx;
      const slotsHtml = ch.r.split('').map((letter, lIdx) => {
        let cls = '';
        if (isChunkDone || (isChunkActive && lIdx < this.charInChunk)) cls = 'is-done';
        else if (isChunkActive && lIdx === this.charInChunk) cls = 'is-current';
        return `<span class="tp-slot ${cls}">${letter}</span>`;
      }).join('');

      return `
        <div class="tp-chunk">
          <div class="tp-kana-pill ${isChunkDone ? 'is-done' : (isChunkActive ? 'is-active' : '')}">${ch.k}</div>
          <div class="tp-romaji-slots">${slotsHtml}</div>
        </div>
      `;
    }).join('');

    this.screenEl.innerHTML = `
      <div class="tp-icon-box">${FLAT_ICONS[this.current.icon](64)}</div>
      <div class="tp-prompt-col">
        <div class="tp-chunk-row">${chunksHtml}</div>
      </div>
    `;
  }

  updateGuideKey() {
    this.keyBtns.forEach((b) => b.classList.remove('is-guide'));
    if (this.mode === 'free' || this.locked) return;
    // In 'pick' sub-mode, always show the keyboard hint for the chosen character
    const showHint = this.hintOn || (this.mode === 'gojuon' && this.gojuonSub === 'pick');
    if (!showHint) return;
    const expected = this.getExpectedKey();
    if (!expected) return;
    const targetBtn = this.container.querySelector(`.tp-key[data-key="${expected}"]`);
    if (targetBtn) targetBtn.classList.add('is-guide');
  }
}
