import { FLAT_ICONS } from '../core/flat-icons.js';
import { showCelebrationOverlay } from '../core/celebration.js';
import {
  PHONE_ANIMALS,
  PHONE_ICONS,
  renderAnimalFaceSvg,
  renderPartySceneSvg
} from './animal-phone-art.js';

const KEYPAD_KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

function ensurePhoneStyles() {
  if (document.getElementById('ap-styles-v1')) return;
  const style = document.createElement('style');
  style.id = 'ap-styles-v1';
  style.textContent = `
    .ap-root {
      position: relative;
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center;
      padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) calc(12px + var(--safe-bottom)) calc(12px + var(--safe-left));
      gap: 8px;
      user-select: none; -webkit-user-select: none;
      touch-action: none;
    }
    .ap-topbar {
      width: 100%; max-width: 980px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; flex-wrap: wrap;
      padding: 0 56px;
    }
    .ap-ring-now-btn {
      display: inline-flex; align-items: center; gap: 6px;
      min-height: 42px; padding: 6px 14px;
      background: #FFD12E; color: #4D3300;
      border: 3px solid #FFFFFF; border-radius: 18px;
      box-shadow: 0 5px 0 #C28A00;
      font-family: var(--font-rounded); font-size: 14px; font-weight: 900;
      cursor: pointer; white-space: nowrap;
      transition: transform 0.1s ease;
    }
    .ap-ring-now-btn:active { transform: translateY(3px); }
    .ap-mission-banner {
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #FFFFFF;
      box-shadow: 0 5px 0 rgba(15, 23, 42, 0.15);
      border-radius: 999px;
      padding: 6px 20px;
      font-size: clamp(15px, 2vw, 20px); font-weight: 900;
      display: inline-flex; align-items: center; gap: 10px;
    }
    .ap-main {
      flex: 1 1 auto; min-height: 0;
      width: 100%; max-width: 960px;
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: clamp(10px, 2vw, 20px);
      align-items: stretch;
    }
    /* Left: Animal Phonebook */
    .ap-book {
      background: rgba(255, 251, 235, 0.95);
      border: 4px solid #FFFFFF;
      box-shadow: 0 8px 0 rgba(15, 23, 42, 0.16);
      border-radius: 28px;
      padding: 12px;
      display: flex; flex-direction: column; gap: 8px;
      min-height: 0;
    }
    .ap-book-title {
      font-size: clamp(14px, 1.7vw, 17px); font-weight: 900;
      color: #78350F; text-align: center;
    }
    .ap-book-grid {
      flex: 1; min-height: 0;
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .ap-contact-card {
      background: #FFFFFF;
      border: 3px solid #E2E8F0; border-bottom: 6px solid #CBD5E1;
      border-radius: 22px;
      padding: 8px 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; cursor: pointer;
      transition: transform 0.12s ease, border-color 0.14s ease, background 0.14s ease;
    }
    .ap-contact-card:active { transform: translateY(3px); }
    .ap-contact-card.is-hint {
      background: #FEF9C3; border-color: #F59E0B; border-bottom-color: #B45309;
      transform: scale(1.03);
    }
    .ap-contact-name {
      font-size: clamp(15px, 1.8vw, 19px); font-weight: 900; color: #1E293B;
    }
    .ap-contact-num {
      background: #EFF6FF; border: 2px solid #93C5FD; color: #1D4ED8;
      border-radius: 999px; padding: 2px 12px;
      font-size: clamp(15px, 2vw, 20px); font-weight: 900; letter-spacing: 0.1em;
    }
    .ap-secret-hint {
      text-align: center; font-size: 12px; font-weight: 900; color: #92400E;
      background: #FEF3C7; border-radius: 999px; padding: 4px 10px;
    }
    /* Right: Realistic Toy Phone Handset */
    .ap-phone {
      background: #1E293B;
      border: 5px solid #FFFFFF;
      box-shadow: 0 9px 0 #0F172A;
      border-radius: 34px;
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 0;
    }
    .ap-lcd {
      background: #ECFDF5;
      border: 4px solid #334155;
      border-radius: 18px;
      min-height: 58px;
      padding: 6px 14px;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .ap-lcd-digits {
      flex: 1; text-align: center;
      font-size: clamp(26px, 3.6vw, 38px); font-weight: 900;
      color: #065F46; letter-spacing: 0.16em;
      min-height: 1.2em;
    }
    .ap-lcd-placeholder {
      font-size: clamp(14px, 1.7vw, 17px); color: #64748B; letter-spacing: 0.04em;
    }
    .ap-keypad {
      flex: 1; min-height: 0;
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .ap-key {
      border: 3px solid #FFFFFF; border-radius: 18px;
      background: #F8FAFC; color: #1E293B;
      font-family: var(--font-rounded);
      font-size: clamp(22px, 3vw, 30px); font-weight: 900;
      box-shadow: 0 5px 0 #94A3B8;
      cursor: pointer; min-height: 46px;
      display: grid; place-items: center;
      transition: transform 0.08s ease, background 0.1s ease;
    }
    .ap-key:active, .ap-key.is-pressed {
      transform: translateY(4px); box-shadow: 0 1px 0 #64748B;
      background: #FFD12E; color: #4D3300;
    }
    .ap-key.is-sym { background: #E2E8F0; color: #475569; }
    .ap-phone-actions {
      display: grid; grid-template-columns: 1fr 2fr; gap: 10px;
    }
    .ap-del-btn {
      border: 3px solid #FFFFFF; border-radius: 20px;
      background: #F97316; color: #FFFFFF;
      box-shadow: 0 5px 0 #C2410C;
      min-height: 54px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-family: var(--font-rounded); font-size: 16px; font-weight: 900;
    }
    .ap-del-btn:active { transform: translateY(3px); }
    .ap-call-btn {
      border: 3px solid #FFFFFF; border-radius: 20px;
      background: #22C55E; color: #FFFFFF;
      box-shadow: 0 6px 0 #15803D;
      min-height: 54px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: var(--font-rounded); font-size: clamp(18px, 2.2vw, 22px); font-weight: 900;
    }
    .ap-call-btn:active { transform: translateY(4px); }

    /* Video Call Overlay Screen */
    .ap-call-overlay {
      position: absolute; inset: 0; z-index: 40;
      background: rgba(15, 23, 42, 0.72);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .ap-call-card {
      width: min(94vw, 560px);
      background: #FFFFFF;
      border: 6px solid #FFFFFF;
      border-radius: 34px;
      box-shadow: 0 12px 0 rgba(15, 23, 42, 0.3);
      overflow: hidden;
      display: flex; flex-direction: column;
    }
    .ap-call-stage {
      padding: 18px 16px 14px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      text-align: center;
    }
    .ap-call-tag {
      background: rgba(255,255,255,0.92); color: #1E293B;
      border-radius: 999px; padding: 4px 14px;
      font-size: 14px; font-weight: 900;
    }
    .ap-call-avatar {
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease;
    }
    .ap-call-avatar.is-bounce { animation: apBounce 0.45s ease-in-out 2; }
    .ap-call-avatar.is-dance  { animation: apDance 0.42s ease-in-out 4; }
    .ap-call-avatar.is-wiggle { animation: apWiggle 0.26s ease-in-out 5; }
    .ap-call-avatar.is-ring   { animation: apWiggle 0.3s ease-in-out infinite; }
    .ap-speech-bubble {
      background: #FFFFFF; color: #1E293B;
      border: 3px solid #F59E0B;
      border-radius: 22px;
      padding: 10px 16px;
      font-size: clamp(16px, 2.2vw, 21px); font-weight: 900;
      line-height: 1.35; min-height: 54px;
      display: flex; align-items: center; justify-content: center;
      width: 100%;
    }
    .ap-call-controls {
      background: #F8FAFC;
      padding: 12px 14px 16px;
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .ap-call-controls.is-incoming {
      grid-template-columns: 1fr 1fr;
    }
    .ap-act-btn {
      border: 3px solid #FFFFFF; border-radius: 18px;
      padding: 8px 4px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
      font-family: var(--font-rounded); font-size: 13px; font-weight: 900;
      color: #FFFFFF;
      transition: transform 0.1s ease;
    }
    .ap-act-btn:active { transform: translateY(3px); }
    .ap-act-snack  { background: #F59E0B; box-shadow: 0 5px 0 #B45309; }
    .ap-act-music  { background: #8B5CF6; box-shadow: 0 5px 0 #6D28D9; }
    .ap-act-tickle { background: #0EA5E9; box-shadow: 0 5px 0 #0369A1; }
    .ap-act-bye    { background: #EF4444; box-shadow: 0 5px 0 #B91C1C; }
    .ap-act-answer { background: #22C55E; box-shadow: 0 5px 0 #15803D; font-size: 18px; padding: 12px; }
    @media (max-width: 720px) {
      .ap-main { grid-template-columns: 1fr; }
      .ap-book-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    @keyframes apBounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-16px) scale(1.06); }
    }
    @keyframes apDance {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(-10deg) translateY(-8px); }
      75% { transform: rotate(10deg) translateY(-8px); }
    }
    @keyframes apWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      75% { transform: rotate(8deg); }
    }
  `;
  document.head.appendChild(style);
}

export default class AnimalPhoneGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.mode = 'd3'; // 'd3' (3 digits) | 'd4' (4 digits) | 'mission' (お願いモード)
    this.digits = '';
    this.missionTarget = null;
    this.missionScore = 0;
    this.callState = null; // null | { type, animal?, situation?, incoming? }
    this.timers = [];
    this.autoRingTimer = null;
    this.ringLoopTimer = null;
  }

  mount() {
    ensurePhoneStyles();
    this.app.setGameBackground('#0EA5E9');

    this.container.innerHTML = `
      <div class="ap-root" id="ap-root">
        <div class="ap-topbar">
          <div class="pm-mode-tabs" id="ap-tabs">
            <button class="pm-tab-btn is-active" type="button" data-apmode="d3">${FLAT_ICONS.stars(1, 14)}<span>3けた</span></button>
            <button class="pm-tab-btn" type="button" data-apmode="d4">${FLAT_ICONS.stars(2, 14)}<span>4けた</span></button>
            <button class="pm-tab-btn" type="button" data-apmode="mission">${FLAT_ICONS.stars(3, 13)}<span>おねがい</span></button>
          </div>
          <button class="ap-ring-now-btn" type="button" id="ap-ring-now">
            ${PHONE_ICONS.bell(18, '#4D3300')}<span>でんわが くる！</span>
          </button>
        </div>

        <div class="ap-mission-banner" id="ap-banner">すきな どうぶつに でんわしよう！</div>

        <div class="ap-main">
          <div class="ap-book">
            <div class="ap-book-title">どうぶつ でんわちょう</div>
            <div class="ap-book-grid" id="ap-book-grid"></div>
            <div class="ap-secret-hint" id="ap-secret-hint">ひみつの ばんごう「000」も かけてみてね！</div>
          </div>

          <div class="ap-phone">
            <div class="ap-lcd">
              <div class="ap-lcd-digits" id="ap-lcd"></div>
            </div>
            <div class="ap-keypad" id="ap-keypad">
              ${KEYPAD_KEYS.map((k) => {
                const isSym = k === '*' || k === '#';
                return `<button class="ap-key ${isSym ? 'is-sym' : ''}" type="button" data-digit="${k}">${k}</button>`;
              }).join('')}
            </div>
            <div class="ap-phone-actions">
              <button class="ap-del-btn" type="button" id="ap-del-btn">
                ${PHONE_ICONS.backspace(22, '#FFFFFF')}<span>けす</span>
              </button>
              <button class="ap-call-btn" type="button" id="ap-call-btn">
                ${PHONE_ICONS.handset(24, '#FFFFFF')}<span>かける</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#ap-root');
    this.bannerEl = this.container.querySelector('#ap-banner');
    this.bookGridEl = this.container.querySelector('#ap-book-grid');
    this.secretHintEl = this.container.querySelector('#ap-secret-hint');
    this.lcdEl = this.container.querySelector('#ap-lcd');
    this.tabBtns = Array.from(this.container.querySelectorAll('[data-apmode]'));

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.setMode(btn.dataset.apmode);
      });
    });

    this.container.querySelector('#ap-ring-now').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.triggerIncomingCall();
    });

    this.container.querySelectorAll('[data-digit]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.pressDigit(btn.dataset.digit, btn);
      });
    });

    this.container.querySelector('#ap-del-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      if (this.digits.length > 0) {
        this.digits = this.digits.slice(0, -1);
        this.sound.playKeyClick(true);
        this.renderLcd();
      }
    });

    this.container.querySelector('#ap-call-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.placeCall();
    });

    this.setMode('d3');
  }

  unmount() {
    this.clearTimers();
    this.sound.stopSpeech();
    this.container.innerHTML = '';
  }

  onPause() {
    this.clearTimers();
    this.sound.stopSpeech();
  }

  onResume() {
    if (!this.callState && this.mode !== 'mission') {
      this.scheduleAutoIncoming();
    }
  }

  clearTimers() {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
    if (this.autoRingTimer) {
      clearTimeout(this.autoRingTimer);
      this.autoRingTimer = null;
    }
    if (this.ringLoopTimer) {
      clearInterval(this.ringLoopTimer);
      this.ringLoopTimer = null;
    }
  }

  addTimer(fn, ms) {
    const id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  }

  getNumberFor(animal) {
    return this.mode === 'd4' ? animal.num4 : animal.num3;
  }

  getSecretNumber() {
    return this.mode === 'd4' ? '7777' : '000';
  }

  setMode(mode) {
    this.clearTimers();
    this.sound.stopSpeech();
    this.closeCallOverlay();
    this.mode = mode;
    this.digits = '';
    this.tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.apmode === mode));
    this.sound.playPageTurn(1);

    this.secretHintEl.textContent = `ひみつの ばんごう「${this.getSecretNumber()}」も かけてみてね！`;

    if (mode === 'mission') {
      this.pickNextMission();
    } else {
      this.missionTarget = null;
      this.bannerEl.textContent = 'すきな どうぶつに でんわしよう！';
      this.scheduleAutoIncoming();
    }
    this.renderBook();
    this.renderLcd();
  }

  pickNextMission() {
    const pool = PHONE_ANIMALS.filter((a) => !this.missionTarget || a.id !== this.missionTarget.id);
    this.missionTarget = pool[Math.floor(Math.random() * pool.length)];
    const num = this.getNumberFor(this.missionTarget);
    this.bannerEl.innerHTML = `
      ${renderAnimalFaceSvg(this.missionTarget.id, 34)}
      <span>「${this.missionTarget.name}（${num}）」に でんわしてね！</span>
    `;
    this.sound.speakJapanese(`${this.missionTarget.name}さんに でんわしてね！`, { pitch: 1.28, rate: 1.04 });
  }

  scheduleAutoIncoming() {
    if (this.autoRingTimer) clearTimeout(this.autoRingTimer);
    this.autoRingTimer = setTimeout(() => {
      if (!this.callState && this.mode !== 'mission' && !document.hidden) {
        this.triggerIncomingCall();
      }
    }, 24000);
  }

  renderBook() {
    this.bookGridEl.innerHTML = PHONE_ANIMALS.map((a) => {
      const num = this.getNumberFor(a);
      const isTarget = this.missionTarget && this.missionTarget.id === a.id;
      return `
        <button class="ap-contact-card ${isTarget ? 'is-hint' : ''}" type="button" data-cid="${a.id}">
          ${renderAnimalFaceSvg(a.id, 66)}
          <div class="ap-contact-name">${a.name}</div>
          <div class="ap-contact-num">${num}</div>
        </button>
      `;
    }).join('');

    this.bookGridEl.querySelectorAll('[data-cid]').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const a = PHONE_ANIMALS.find((x) => x.id === card.dataset.cid);
        if (!a) return;
        this.sound.playAnimalCry(a.id);
        const num = this.getNumberFor(a);
        this.addTimer(() => {
          this.sound.speakJapanese(`${a.name}だよ！ばんごうは ${num.split('').join('、')} だよ！`, a.voice);
        }, 260);
      });
    });
  }

  renderLcd() {
    if (!this.digits) {
      this.lcdEl.innerHTML = `<span class="ap-lcd-placeholder">ばんごうを おしてね</span>`;
    } else {
      this.lcdEl.textContent = this.digits;
    }
  }

  pressDigit(d, btnEl) {
    if (this.callState) return;
    if (btnEl) {
      btnEl.classList.add('is-pressed');
      setTimeout(() => btnEl.classList.remove('is-pressed'), 120);
    }
    this.sound.playDtmf(d);
    const maxLen = this.mode === 'd4' ? 4 : 3;
    if (this.digits.length >= maxLen) {
      this.digits = this.digits.slice(1) + d;
    } else {
      this.digits += d;
    }
    this.renderLcd();
  }

  placeCall() {
    if (this.callState) return;
    if (!this.digits) {
      this.sound.playGentleNudge();
      this.sound.speakJapanese('ばんごうを おしてから かけてね！', { pitch: 1.25, rate: 1.04 });
      return;
    }

    this.clearTimers();
    const dialed = this.digits;
    const matchedAnimal = PHONE_ANIMALS.find((a) => this.getNumberFor(a) === dialed);
    const isSecret = dialed === this.getSecretNumber() || dialed === '000' || dialed === '777' || dialed === '7777';

    // Show calling ringback state first ("Purururu...")
    this.callState = { type: 'calling', dialed };
    this.showCallOverlay({
      bg: '#38BDF8',
      tag: `${dialed} に でんわちゅう…`,
      avatarHtml: PHONE_ICONS.handset(74, '#FFFFFF'),
      avatarClass: 'is-ring',
      speech: 'プルルルル… プルルルル…',
      controlsHtml: `
        <button class="ap-act-btn ap-act-bye" style="grid-column:1/-1;" type="button" id="ap-cancel-call">
          ${PHONE_ICONS.hangup(26, '#FFFFFF')}<span>やめる</span>
        </button>
      `
    });
    this.sound.playPhoneRing();

    const cancelBtn = this.rootEl.querySelector('#ap-cancel-call');
    if (cancelBtn) {
      cancelBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.endCall();
      });
    }

    this.addTimer(() => {
      if (!this.callState) return;
      this.sound.playPhonePickup();
      if (isSecret) {
        this.connectPartyCall();
      } else if (matchedAnimal) {
        this.connectAnimalCall(matchedAnimal);
      } else {
        this.connectSurpriseCall();
      }
    }, 1050);
  }

  connectAnimalCall(animal) {
    const sit = animal.situations[Math.floor(Math.random() * animal.situations.length)];
    this.callState = { type: 'animal', animal, situation: sit };
    const isMissionClear = this.mode === 'mission' && this.missionTarget && this.missionTarget.id === animal.id;

    this.showCallOverlay({
      bg: animal.bg,
      tag: `${animal.name} ・ ${sit.label}`,
      avatarHtml: renderAnimalFaceSvg(animal.id, 148),
      avatarClass: 'is-bounce',
      speech: `「${sit.speech}」`,
      controlsHtml: `
        <button class="ap-act-btn ap-act-snack" type="button" data-act="snack">${FLAT_ICONS.apple(24)}<span>おやつ</span></button>
        <button class="ap-act-btn ap-act-music" type="button" data-act="music">${FLAT_ICONS.note(24, '#FFFFFF')}<span>おんがく</span></button>
        <button class="ap-act-btn ap-act-tickle" type="button" data-act="tickle">${PHONE_ICONS.smile(24)}<span>くすぐる</span></button>
        <button class="ap-act-btn ap-act-bye" type="button" data-act="bye">${PHONE_ICONS.hangup(24, '#FFFFFF')}<span>バイバイ</span></button>
      `
    });

    this.sound.playAnimalCry(animal.id);
    this.addTimer(() => {
      this.sound.speakJapanese(sit.speech, animal.voice);
    }, 360);

    this.bindCallActions(animal, isMissionClear);
  }

  connectPartyCall() {
    this.callState = { type: 'party' };
    const speech = 'わーい！ひみつの ばんごう だいせいかい！みんなで パーティしよう！';
    this.showCallOverlay({
      bg: '#8B5CF6',
      tag: 'ひみつの パーティ！',
      avatarHtml: renderPartySceneSvg(),
      avatarClass: 'is-dance',
      speech: `「${speech}」`,
      controlsHtml: `
        <button class="ap-act-btn ap-act-music" style="grid-column:1/3;" type="button" id="ap-party-cheer">${FLAT_ICONS.note(24, '#FFFFFF')}<span>みんなで うたう</span></button>
        <button class="ap-act-btn ap-act-bye" style="grid-column:3/5;" type="button" id="ap-party-bye">${PHONE_ICONS.hangup(24, '#FFFFFF')}<span>バイバイ</span></button>
      `
    });

    this.sound.playSuccessFanfare();
    this.addTimer(() => {
      this.sound.speakJapanese(speech, { pitch: 1.38, rate: 1.06, fallbackPitch: 440 });
    }, 450);

    const cheerBtn = this.rootEl.querySelector('#ap-party-cheer');
    if (cheerBtn) {
      cheerBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.playCrackerPop();
        this.triggerAvatarAnim('is-dance');
        this.sound.speakJapanese('ハッピー パーティ！みんなで たのしいね！', { pitch: 1.45, rate: 1.1 });
      });
    }
    const byeBtn = this.rootEl.querySelector('#ap-party-bye');
    if (byeBtn) {
      byeBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.speakJapanese('また あそぼうね！バイバーイ！', { pitch: 1.38, rate: 1.06 });
        this.addTimer(() => this.endCall(), 900);
      });
    }
  }

  connectSurpriseCall() {
    this.callState = { type: 'surprise' };
    const isAlien = Math.random() < 0.65;
    if (isAlien) {
      const speech = 'ピポパポ！もしもし、うちゅうじん だよ！ちきゅうは たのしいかい？';
      this.showCallOverlay({
        bg: '#6366F1',
        tag: 'うちゅう に つながった！？',
        avatarHtml: renderAnimalFaceSvg('alien', 142),
        avatarClass: 'is-wiggle',
        speech: `「${speech}」`,
        controlsHtml: `
          <button class="ap-act-btn ap-act-music" style="grid-column:1/3;" type="button" id="ap-alien-talk">${FLAT_ICONS.sparkle(24)}<span>ピポパポ！</span></button>
          <button class="ap-act-btn ap-act-bye" style="grid-column:3/5;" type="button" id="ap-alien-bye">${PHONE_ICONS.hangup(24, '#FFFFFF')}<span>バイバイ</span></button>
        `
      });
      this.sound.playAnimalCry('alien');
      this.addTimer(() => {
        this.sound.speakJapanese(speech, { pitch: 1.85, rate: 1.2, fallbackPitch: 640 });
      }, 380);
      const talkBtn = this.rootEl.querySelector('#ap-alien-talk');
      if (talkBtn) {
        talkBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.sound.playAnimalCry('alien');
          this.triggerAvatarAnim('is-bounce');
          this.sound.speakJapanese('ピポパポ！また うちゅうから みてるよー！', { pitch: 1.85, rate: 1.22 });
        });
      }
      const byeBtn = this.rootEl.querySelector('#ap-alien-bye');
      if (byeBtn) {
        byeBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.endCall();
        });
      }
    } else {
      const speech = 'あれれ？いま おでかけちゅう みたい！でんわちょうの ばんごうを みてね！';
      this.showCallOverlay({
        bg: '#64748B',
        tag: 'おるすばん かな？',
        avatarHtml: PHONE_ICONS.bell(84, '#FFD12E'),
        avatarClass: 'is-wiggle',
        speech: `「${speech}」`,
        controlsHtml: `
          <button class="ap-act-btn ap-act-bye" style="grid-column:1/-1;" type="button" id="ap-away-bye">${PHONE_ICONS.hangup(24, '#FFFFFF')}<span>もどる</span></button>
        `
      });
      this.sound.playGentleNudge();
      this.sound.speakJapanese(speech, { pitch: 1.22, rate: 1.02 });
      const byeBtn = this.rootEl.querySelector('#ap-away-bye');
      if (byeBtn) {
        byeBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.endCall();
        });
      }
    }
  }

  triggerIncomingCall() {
    if (this.callState) return;
    this.clearTimers();
    const animal = PHONE_ANIMALS[Math.floor(Math.random() * PHONE_ANIMALS.length)];
    this.callState = { type: 'incoming', animal };

    this.showCallOverlay({
      bg: animal.bg,
      tag: `${animal.name} から でんわだよ！`,
      avatarHtml: renderAnimalFaceSvg(animal.id, 138),
      avatarClass: 'is-ring',
      speech: `プルルルル！${animal.name} から でんわが かかってきたよ！`,
      controlsHtml: `
        <button class="ap-act-btn ap-act-answer" type="button" id="ap-answer-btn">
          ${PHONE_ICONS.handset(26, '#FFFFFF')}<span>もしもし！</span>
        </button>
        <button class="ap-act-btn ap-act-bye" type="button" id="ap-decline-btn">
          ${PHONE_ICONS.hangup(26, '#FFFFFF')}<span>あとで</span>
        </button>
      `,
      isIncoming: true
    });

    this.sound.playPhoneRing();
    this.ringLoopTimer = setInterval(() => {
      if (this.callState && this.callState.type === 'incoming' && !document.hidden) {
        this.sound.playPhoneRing();
      }
    }, 1800);

    const ansBtn = this.rootEl.querySelector('#ap-answer-btn');
    if (ansBtn) {
      ansBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.clearTimers();
        this.sound.playPhonePickup();
        this.connectAnimalCall(animal);
      });
    }
    const decBtn = this.rootEl.querySelector('#ap-decline-btn');
    if (decBtn) {
      decBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.endCall();
      });
    }
  }

  bindCallActions(animal, isMissionClear) {
    this.rootEl.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const act = btn.dataset.act;
        const info = animal.actions[act];
        if (!info) return;

        const bubble = this.rootEl.querySelector('#ap-speech-bubble');
        if (bubble) {
          bubble.textContent = `「${info.text}」`;
          bubble.dataset.speech = info.speech;
        }

        if (act === 'snack') {
          this.sound.playCountPip(6);
          this.triggerAvatarAnim('is-bounce');
          this.sound.speakJapanese(info.speech, animal.voice);
        } else if (act === 'music') {
          this.sound.playSuccessFanfare();
          this.triggerAvatarAnim('is-dance');
          this.sound.speakJapanese(info.speech, animal.voice);
        } else if (act === 'tickle') {
          this.sound.playAnimalCry(animal.id);
          this.triggerAvatarAnim('is-wiggle');
          this.sound.speakJapanese(info.speech, animal.voice);
        } else if (act === 'bye') {
          this.sound.speakJapanese(info.speech, animal.voice);
          this.triggerAvatarAnim('is-wiggle');
          this.addTimer(() => {
            this.endCall();
            if (isMissionClear) {
              this.showMissionCelebration(animal);
            }
          }, 1250);
        }
      });
    });
  }

  showMissionCelebration(animal) {
    this.missionScore++;
    showCelebrationOverlay(this.rootEl, {
      title: 'でんわ できたよ！',
      subtitle: `${animal.name} と たのしく おはなし できたね！`,
      centerHtml: renderAnimalFaceSvg(animal.id, 72),
      btnLabel: 'つぎの おねがいへ',
      sound: this.sound,
      onNext: () => {
        this.digits = '';
        this.renderLcd();
        this.pickNextMission();
        this.renderBook();
      }
    });
  }

  triggerAvatarAnim(cls) {
    const el = this.rootEl.querySelector('#ap-call-avatar');
    if (!el) return;
    el.classList.remove('is-bounce', 'is-dance', 'is-wiggle', 'is-ring');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  showCallOverlay({ bg, tag, avatarHtml, avatarClass = '', speech, controlsHtml, isIncoming = false }) {
    this.closeCallOverlay();
    const rawSpeech = speech.replace(/^「|」$/g, '');
    const overlay = document.createElement('div');
    overlay.className = 'ap-call-overlay';
    overlay.id = 'ap-call-overlay';
    overlay.innerHTML = `
      <div class="ap-call-card">
        <div class="ap-call-stage" style="background:${bg};">
          <div class="ap-call-tag">${tag}</div>
          <div class="ap-call-avatar ${avatarClass}" id="ap-call-avatar">${avatarHtml}</div>
          <button class="ap-speech-bubble" id="ap-speech-bubble" type="button" data-speech="${rawSpeech}" style="cursor:pointer;">${speech}</button>
        </div>
        <div class="ap-call-controls ${isIncoming ? 'is-incoming' : ''}">
          ${controlsHtml}
        </div>
      </div>
    `;
    const bubbleBtn = overlay.querySelector('#ap-speech-bubble');
    if (bubbleBtn) {
      bubbleBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const text = bubbleBtn.dataset.speech || rawSpeech;
        const voice = (this.callState && this.callState.animal) ? this.callState.animal.voice : { pitch: 1.32, rate: 1.04 };
        this.triggerAvatarAnim('is-bounce');
        this.sound.speakJapanese(text, voice);
      });
    }
    this.rootEl.appendChild(overlay);
  }

  closeCallOverlay() {
    const existing = this.rootEl && this.rootEl.querySelector('#ap-call-overlay');
    if (existing) existing.remove();
  }

  endCall() {
    this.clearTimers();
    this.sound.stopSpeech();
    this.sound.playPhoneHangup();
    this.callState = null;
    this.digits = '';
    this.closeCallOverlay();
    this.renderLcd();
    if (this.mode !== 'mission') {
      this.scheduleAutoIncoming();
    }
  }
}
