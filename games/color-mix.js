import { FLAT_ICONS } from "../core/flat-icons.js";
import { showCelebrationOverlay } from "../core/celebration.js";

const COLOR_PAINTS = {
  red:    { id: 'red',    name: 'あか',   hex: '#FF4757', shadow: '#C81E2B', fg: '#FFFFFF', pitch: 0 },
  yellow: { id: 'yellow', name: 'きいろ', hex: '#FFD32A', shadow: '#D69600', fg: '#4D3300', pitch: 2 },
  blue:   { id: 'blue',   name: 'あお',   hex: '#1E90FF', shadow: '#0C5BB8', fg: '#FFFFFF', pitch: 4 },
  white:  { id: 'white',  name: 'しろ',   hex: '#FFFFFF', shadow: '#CBD5E1', fg: '#334155', pitch: 6 }
};

const COLOR_RECIPES = {
  '':                      { name: 'まぜてね',   hex: '#F1F5F9', icon: 'sparkle' },
  'red':                   { name: 'あか',       hex: '#FF4757', icon: 'apple' },
  'yellow':                { name: 'きいろ',     hex: '#FFD32A', icon: 'lemon' },
  'blue':                  { name: 'あお',       hex: '#1E90FF', icon: 'whale' },
  'white':                 { name: 'しろ',       hex: '#FFFFFF', icon: 'cloud' },
  'red+yellow':            { name: 'おれんじ',   hex: '#FF8C1A', icon: 'orange',    mission: true },
  'blue+yellow':           { name: 'みどり',     hex: '#2ED573', icon: 'clover',    mission: true },
  'blue+red':              { name: 'むらさき',   hex: '#9B59B6', icon: 'grape',     mission: true },
  'red+white':             { name: 'ぴんく',     hex: '#FF85B3', icon: 'peach',     mission: true },
  'blue+white':            { name: 'みずいろ',   hex: '#67E8F9', icon: 'dolphin',   mission: true },
  'white+yellow':          { name: 'くりーむ',   hex: '#FEF08A', icon: 'icecream',  mission: true },
  'blue+red+yellow':       { name: 'ちゃいろ',   hex: '#8D5524', icon: 'choco',     mission: true },
  'red+white+yellow':      { name: 'ぴーち',     hex: '#FFB07C', icon: 'flower',    mission: true },
  'blue+white+yellow':     { name: 'みんと',     hex: '#6EE7B7', icon: 'leaf',      mission: true },
  'blue+red+white':        { name: 'らべんだー', hex: '#C4B5FD', icon: 'lavender',  mission: true },
  'blue+red+white+yellow': { name: 'みるくてぃ', hex: '#C69C72', icon: 'bear',      mission: true }
};

export default class ColorMixGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.drops = new Set();
    this.missionKeys = Object.keys(COLOR_RECIPES).filter((k) => COLOR_RECIPES[k].mission);
    this.missionIndex = 0;
    this.locked = false;
  }

  mount() {
    this.app.setGameBackground('#7C6AEF');
    this.container.innerHTML = `
      <div class="cm-root" id="cm-root">
        <div class="lb-title-area" style="margin-top:4px;">
          <h2 class="lb-circuit-name">いろまぜ</h2>
        </div>

        <div class="cm-stage">
          <div class="cm-compare-row">
            <!-- LEFT: Huge visual target color -->
            <div class="cm-target-box">
              <div class="cm-big-circle is-target">
                <div class="cm-liquid" id="cm-target-liquid">
                  <div class="cm-result-icon" id="cm-target-icon"></div>
                  <div class="cm-result-name" id="cm-target-name"></div>
                </div>
              </div>
              <button class="cm-skip-btn" type="button" id="cm-skip-btn">べつの いろ</button>
            </div>

            <div class="cm-arrow-mid" aria-hidden="true">
              ${FLAT_ICONS.arrowRight(34)}
            </div>

            <!-- RIGHT: Mixing bowl -->
            <div class="cm-target-box">
              <div class="cm-big-circle" id="cm-bowl">
                <div class="cm-liquid" id="cm-liquid">
                  <div class="cm-result-icon" id="cm-icon"></div>
                  <div class="cm-result-name" id="cm-name">まぜてね</div>
                </div>
              </div>
              <div class="cm-formula" id="cm-formula"></div>
            </div>
          </div>
        </div>

        <div class="cm-palette" id="cm-palette">
          ${Object.values(COLOR_PAINTS).map((p) => `
            <button class="cm-paint-btn" type="button" data-paint="${p.id}"
                    style="--p-bg:${p.hex}; --p-shadow:${p.shadow}; --p-fg:${p.fg};">
              ${FLAT_ICONS.drop(34, p.id === 'white' ? '#F8FAFC' : 'rgba(255,255,255,0.38)', p.id === 'white' ? '#CBD5E1' : '#FFFFFF')}
              <span>${p.name}</span>
            </button>
          `).join('')}
          <button class="cm-paint-btn" type="button" data-paint="clear"
                  style="--p-bg:#475569; --p-shadow:#1E293B; --p-fg:#FFFFFF;">
            ${FLAT_ICONS.wash(34)}
            <span>あらう</span>
          </button>
        </div>
      </div>
    `;

    this.rootEl = this.container.querySelector('#cm-root');
    this.targetLiquidEl = this.container.querySelector('#cm-target-liquid');
    this.targetIconEl = this.container.querySelector('#cm-target-icon');
    this.targetNameEl = this.container.querySelector('#cm-target-name');
    this.bowlEl = this.container.querySelector('#cm-bowl');
    this.liquidEl = this.container.querySelector('#cm-liquid');
    this.iconEl = this.container.querySelector('#cm-icon');
    this.nameEl = this.container.querySelector('#cm-name');
    this.formulaEl = this.container.querySelector('#cm-formula');
    this.paintBtns = Array.from(this.container.querySelectorAll('.cm-paint-btn'));

    this.container.querySelector('#cm-skip-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.locked) return;
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.nextMission();
    });

    this.paintBtns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.locked) return;
        this.sound.unlock();
        const id = btn.dataset.paint;
        if (id === 'clear') {
          this.drops.clear();
          this.sound.playPageTurn(-1);
          this.updateUI(true);
          return;
        }
        if (this.drops.has(id)) {
          this.drops.delete(id);
        } else {
          this.drops.add(id);
        }
        this.sound.playSplash(COLOR_PAINTS[id].pitch);
        this.updateUI(true);
      });
    });

    this.updateUI(false);
  }

  unmount() {
    this.container.innerHTML = '';
  }

  nextMission() {
    this.missionIndex = (this.missionIndex + 1) % this.missionKeys.length;
    this.drops.clear();
    this.locked = false;
    this.updateUI(false);
  }

  getRecipeKey() {
    return Array.from(this.drops).sort().join('+');
  }

  updateUI(animate) {
    const key = this.getRecipeKey();
    const result = COLOR_RECIPES[key] || COLOR_RECIPES[''];
    const targetKey = this.missionKeys[this.missionIndex];
    const target = COLOR_RECIPES[targetKey];

    // Target circle (huge & unmistakable)
    this.targetLiquidEl.style.backgroundColor = target.hex;
    this.targetIconEl.innerHTML = FLAT_ICONS[target.icon](68);
    this.targetNameEl.textContent = target.name;

    // Mixing bowl circle
    this.liquidEl.style.backgroundColor = result.hex;
    this.iconEl.innerHTML = FLAT_ICONS[result.icon](68);
    this.nameEl.textContent = result.name;

    this.paintBtns.forEach((btn) => {
      btn.classList.toggle('is-picked', this.drops.has(btn.dataset.paint));
    });

    if (animate) {
      this.bowlEl.classList.remove('is-splash');
      void this.bowlEl.offsetWidth;
      this.bowlEl.classList.add('is-splash');
    }

    if (this.drops.size === 0) {
      this.formulaEl.innerHTML = '';
    } else {
      const orbs = Array.from(this.drops).map((id) =>
        `<span class="cm-drop-orb" style="background:${COLOR_PAINTS[id].hex};"></span>`
      );
      this.formulaEl.innerHTML = orbs.join(`<span style="color:#FFFFFF;display:inline-flex;">${FLAT_ICONS.plusSign(20)}</span>`);
    }

    // Match! Launch big celebratory cracker modal
    if (key === targetKey && !this.locked) {
      this.locked = true;
      setTimeout(() => {
        showCelebrationOverlay(this.rootEl, {
          title: 'せいかい！',
          subtitle: `${target.name} が できたよ！`,
          centerHtml: `<div style="width:76px;height:76px;border-radius:50%;background:${target.hex};display:grid;place-items:center;border:4px solid #fff;box-shadow:0 6px 0 rgba(0,0,0,0.14);">${FLAT_ICONS[target.icon](52)}</div>`,
          btnLabel: 'つぎの いろへ',
          sound: this.sound,
          onNext: () => this.nextMission()
        });
      }, 260);
    }
  }
}
