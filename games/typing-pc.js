import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';

/* =========================================================================
   TYPING PC — Realistic Computer Display + JIS Japanese Layout Keyboard
   4 progressive levels for preschool -> kindergarten typing readiness:
     1. あいうえお (Vowels: A, I, U, E, O)
     2. ローマ字   (Single kana syllables: KA, SA, TA, NA...)
     3. ことば     (Familiar words with custom flat SVG illustrations)
     4. じゆう     (Free romaji-to-hiragana live IME playground)
   Supports both iPad touch AND physical Bluetooth/USB keyboards!
   ========================================================================= */

const VOWELS = new Set(['A', 'I', 'U', 'E', 'O']);

const JIS_ROWS = [
  ['1','2','3','4','5','6','7','8','9','0','-','^','BS'],
  ['Q','W','E','R','T','Y','U','I','O','P','@','['],
  ['A','S','D','F','G','H','J','K','L',';',':','ENT'],
  ['Z','X','C','V','B','N','M',',','.','/']
];

const LEVEL_1_VOWELS = [
  { kana: 'あ', romaji: 'A', icon: 'apple' },
  { kana: 'い', romaji: 'I', icon: 'strawberry' },
  { kana: 'う', romaji: 'U', icon: 'whale' },
  { kana: 'え', romaji: 'E', icon: 'sparkle' },
  { kana: 'お', romaji: 'O', icon: 'orange' }
];

const LEVEL_2_SYLLABLES = [
  { kana: 'か', romaji: 'KA', icon: 'star' },
  { kana: 'き', romaji: 'KI', icon: 'leaf' },
  { kana: 'く', romaji: 'KU', icon: 'cloud' },
  { kana: 'け', romaji: 'KE', icon: 'sparkle' },
  { kana: 'こ', romaji: 'KO', icon: 'bear' },
  { kana: 'さ', romaji: 'SA', icon: 'flower' },
  { kana: 'す', romaji: 'SU', icon: 'dolphin' },
  { kana: 'た', romaji: 'TA', icon: 'star' },
  { kana: 'な', romaji: 'NA', icon: 'clover' },
  { kana: 'は', romaji: 'HA', icon: 'flower' },
  { kana: 'ま', romaji: 'MA', icon: 'peach' },
  { kana: 'ら', romaji: 'RA', icon: 'lavender' }
];

const LEVEL_3_WORDS = [
  { kana: 'くま',     romaji: 'KUMA',    icon: 'bear' },
  { kana: 'くも',     romaji: 'KUMO',    icon: 'cloud' },
  { kana: 'もも',     romaji: 'MOMO',    icon: 'peach' },
  { kana: 'ほし',     romaji: 'HOSHI',   icon: 'star' },
  { kana: 'はな',     romaji: 'HANA',    icon: 'flower' },
  { kana: 'りんご',   romaji: 'RINGO',   icon: 'apple' },
  { kana: 'みかん',   romaji: 'MIKANN',  icon: 'orange' },
  { kana: 'れもん',   romaji: 'REMONN',  icon: 'lemon' },
  { kana: 'ぶどう',   romaji: 'BUDOU',   icon: 'grape' },
  { kana: 'いちご',   romaji: 'ICHIGO',  icon: 'strawberry' },
  { kana: 'いるか',   romaji: 'IRUKA',   icon: 'dolphin' },
  { kana: 'くじら',   romaji: 'KUJIRA',  icon: 'whale' },
  { kana: 'ひよこ',   romaji: 'HIYOKO',  icon: 'chick' },
  { kana: 'あいす',   romaji: 'AISU',    icon: 'icecream' }
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
  if (document.getElementById('tp-styles')) return;
  const style = document.createElement('style');
  style.id = 'tp-styles';
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
      gap: 8px;
      flex-wrap: wrap;
      padding: 0 64px;
      z-index: 15;
    }
    /* Upper half: Realistic Computer Monitor */
    .tp-monitor {
      width: min(96vw, 940px);
      flex: 1;
      min-height: 138px;
      max-height: 280px;
      background: #1E293B;
      border-radius: 26px 26px 18px 18px;
      padding: 12px 14px 14px;
      box-shadow: 0 10px 0 #0F172A, 0 16px 30px rgba(0,0,0,0.28);
      display: flex;
      flex-direction: column;
      gap: 8px;
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
      width: 11px;
      height: 11px;
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
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(14px, 3vw, 32px);
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
      gap: 8px;
    }
    .tp-kana-word {
      font-size: clamp(32px, 5.2vw, 56px);
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #1E293B;
      line-height: 1.1;
    }
    .tp-romaji-slots {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tp-slot {
      min-width: clamp(34px, 4.4vw, 48px);
      height: clamp(40px, 5.4vh, 52px);
      padding: 0 8px;
      border-radius: 12px;
      border: 3px solid #CBD5E1;
      background: #FFFFFF;
      color: #64748B;
      font-size: clamp(20px, 2.8vw, 28px);
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
      padding: clamp(8px, 1.3vw, 14px);
      box-shadow: 0 10px 0 #94A3B8, 0 16px 26px rgba(0,0,0,0.22);
      display: flex;
      flex-direction: column;
      gap: clamp(5px, 0.9vh, 8px);
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
      height: clamp(42px, 6.4vh, 58px);
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
      height: clamp(36px, 5.2vh, 48px);
      background: #F1F5F9;
      color: #64748B;
      font-size: clamp(12px, 1.4vw, 15px);
    }
    /* Home-row tactile bumps on F and J */
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
  `;
  document.head.appendChild(style);
}

export default class TypingPCGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.level = 1; // 1: vowels, 2: syllables, 3: words, 4: free IME
    this.hintOn = true;
    this.streak = 0;
    this.score = 0;
    this.current = LEVEL_1_VOWELS[0];
    this.charIdx = 0;
    this.locked = false;

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
            <button class="pm-tab-btn is-active" type="button" data-lv="1">1. あいうえお</button>
            <button class="pm-tab-btn" type="button" data-lv="2">2. ローマ字</button>
            <button class="pm-tab-btn" type="button" data-lv="3">3. ことば</button>
            <button class="pm-tab-btn" type="button" data-lv="4">4. じゆう</button>
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
            <div class="tp-cam-led" aria-hidden="true"></div>
            <span style="color:#94A3B8;font-size:12px;font-weight:900;letter-spacing:0.08em;">KIDS PC</span>
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
    this.scoreEl = this.container.querySelector('#tp-score');
    this.hintBtn = this.container.querySelector('#tp-hint-btn');
    this.levelBtns = Array.from(this.container.querySelectorAll('[data-lv]'));
    this.keyBtns = Array.from(this.container.querySelectorAll('.tp-key'));

    this.levelBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.switchLevel(Number(btn.dataset.lv));
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
    this.switchLevel(1);
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

  switchLevel(lv) {
    this.level = lv;
    this.locked = false;
    this.streak = 0;
    this.levelBtns.forEach((b) => b.classList.toggle('is-active', Number(b.dataset.lv) === lv));
    this.sound.playPageTurn(1);

    if (lv === 4) {
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
    this.charIdx = 0;
    const pool = this.level === 1 ? LEVEL_1_VOWELS : (this.level === 2 ? LEVEL_2_SYLLABLES : LEVEL_3_WORDS);
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && next === this.current) {
      next = pool[(pool.indexOf(next) + 1) % pool.length];
    }
    this.current = next;
    this.renderScreen();
    this.updateGuideKey();
  }

  pressKey(key, btnEl) {
    if (this.locked) return;

    // Visual key press animation
    if (btnEl) {
      btnEl.classList.add('is-pressed');
      setTimeout(() => btnEl.classList.remove('is-pressed'), 130);
    }

    if (this.level === 4) {
      this.handleFreeInput(key);
      return;
    }

    const expected = this.current.romaji[this.charIdx];
    if (key === expected) {
      this.sound.playKeyClick(false);
      this.sound.playCountPip(this.charIdx + 4);
      this.charIdx++;

      if (this.charIdx >= this.current.romaji.length) {
        this.locked = true;
        this.score++;
        this.streak++;
        this.scoreEl.innerHTML = `${FLAT_ICONS.star(20)}<span>${this.score}</span>`;
        this.renderScreen();
        this.updateGuideKey();

        setTimeout(() => {
          const canLevelUp = this.streak >= 4 && this.level < 3;
          showCelebrationOverlay(this.rootEl, {
            title: canLevelUp ? 'レベルアップ！' : 'せいかい！',
            subtitle: `「${this.current.kana}」が うてたよ！`,
            centerHtml: FLAT_ICONS[this.current.icon](62),
            btnLabel: canLevelUp ? 'つぎの レベルへ' : 'つぎへ',
            sound: this.sound,
            onNext: () => {
              if (canLevelUp) this.switchLevel(this.level + 1);
              else this.nextQuestion();
            }
          });
        }, 220);
      } else {
        this.renderScreen();
        this.updateGuideKey();
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

  /** Real-time Romaji -> Hiragana IME for Level 4 (Free Play) */
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

    // Handle small tsu (っ) on doubled consonants like KK, TT, PP, SS
    if (this.romajiBuf.length === 2 && this.romajiBuf[0] === this.romajiBuf[1] && !VOWELS.has(this.romajiBuf[0]) && this.romajiBuf[0] !== 'N') {
      this.freeText += 'っ';
      this.romajiBuf = this.romajiBuf[1];
    }

    // Handle single N followed by non-vowel/non-Y/non-N -> ん
    if (this.romajiBuf.length === 2 && this.romajiBuf[0] === 'N' && !VOWELS.has(this.romajiBuf[1]) && this.romajiBuf[1] !== 'Y' && this.romajiBuf[1] !== 'N') {
      this.freeText += 'ん';
      this.romajiBuf = this.romajiBuf[1];
    }

    if (ROMAJI_TABLE[this.romajiBuf]) {
      this.freeText += ROMAJI_TABLE[this.romajiBuf];
      this.romajiBuf = '';
      this.sound.playCountPip(this.freeText.length % 12);
    } else if (this.romajiBuf.length >= 3) {
      // Check if any valid romaji starts with current buffer
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
    if (this.level === 4) {
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

    const chars = this.current.romaji.split('');
    const slotsHtml = chars.map((ch, idx) => {
      const cls = idx < this.charIdx ? 'is-done' : (idx === this.charIdx ? 'is-current' : '');
      return `<span class="tp-slot ${cls}">${ch}</span>`;
    }).join('');

    this.screenEl.innerHTML = `
      <div class="tp-icon-box">${FLAT_ICONS[this.current.icon](64)}</div>
      <div class="tp-prompt-col">
        <div class="tp-kana-word">${this.current.kana}</div>
        <div class="tp-romaji-slots">${slotsHtml}</div>
      </div>
    `;
  }

  updateGuideKey() {
    this.keyBtns.forEach((b) => b.classList.remove('is-guide'));
    if (this.level === 4 || !this.hintOn || this.locked) return;
    const expected = this.current.romaji[this.charIdx];
    const targetBtn = this.container.querySelector(`.tp-key[data-key="${expected}"]`);
    if (targetBtn) targetBtn.classList.add('is-guide');
  }
}
