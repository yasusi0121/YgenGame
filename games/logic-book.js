import { renderGndSvg, renderPcbPatternSvg } from "../core/circuit-helpers.js";

const LOGIC_STAGES = [
  {
    id: 'wire',
    name: 'WIRE',
    ruby: 'わいやー',
    tip: 'ぼたんを おすと らんぷが つくよ！',
    bg: '#EB5A3C',
    lightBg: false,
    pcb: false,
    ledOn: '#4ADE80',
    ledOff: '#2B3A32',
    ledGlow: 'rgba(74, 222, 128, 0.9)',
    buttons: [
      { id: 'y', color: 'yellow', x: 255, y: 240 }
    ],
    led: { x: 735, y: 240 },
    evalState: (pressed) => {
      const on = !!pressed.y;
      return {
        led: on,
        wires: { main: on },
        gates: {}
      };
    },
    renderCircuitSvg: () => `
      <g class="wire-group" data-wire="main">
        <path class="wire-base"  d="M 255 240 L 735 240"/>
        <path class="wire-power" d="M 255 240 L 735 240"/>
        <path class="wire-pulse" d="M 255 240 L 735 240"/>
      </g>
      ${renderGndSvg(735, 290)}
    `
  },
  {
    id: 'not',
    name: 'NOT',
    ruby: 'のっと',
    tip: 'おすと きえるよ！ はなすと つくよ！',
    bg: '#59B4D6',
    lightBg: false,
    pcb: false,
    ledOn: '#FFB703',
    ledOff: '#3A3A3A',
    ledGlow: 'rgba(255, 183, 3, 0.92)',
    buttons: [
      { id: 'y', color: 'yellow', x: 235, y: 240 }
    ],
    led: { x: 745, y: 240 },
    evalState: (pressed) => {
      const inp = !!pressed.y;
      const out = !inp;
      return {
        led: out,
        wires: { inY: inp, out },
        gates: { gNot: out }
      };
    },
    renderCircuitSvg: () => `
      <g class="wire-group" data-wire="inY">
        <path class="wire-base"  d="M 235 240 L 455 240"/>
        <path class="wire-power" d="M 235 240 L 455 240"/>
        <path class="wire-pulse" d="M 235 240 L 455 240"/>
      </g>
      <g class="wire-group" data-wire="out">
        <path class="wire-base"  d="M 575 240 L 745 240"/>
        <path class="wire-power" d="M 575 240 L 745 240"/>
        <path class="wire-pulse" d="M 575 240 L 745 240"/>
      </g>
      <g data-gate="gNot">
        <polygon class="gate-body" points="455,180 455,300 548,240"/>
        <circle class="gate-body" cx="562" cy="240" r="14"/>
      </g>
      ${renderGndSvg(745, 290)}
    `
  },
  {
    id: 'or',
    name: 'OR',
    ruby: 'おあ',
    tip: 'あか でも きいろ でも つくよ！',
    bg: '#E8568C',
    lightBg: false,
    pcb: false,
    ledOn: '#FF3B5C',
    ledOff: '#4A2535',
    ledGlow: 'rgba(255, 70, 105, 0.95)',
    buttons: [
      { id: 'r', color: 'red',    x: 235, y: 140 },
      { id: 'y', color: 'yellow', x: 235, y: 340 }
    ],
    led: { x: 755, y: 240 },
    evalState: (pressed) => {
      const r = !!pressed.r;
      const y = !!pressed.y;
      const out = r || y;
      return {
        led: out,
        wires: { inR: r, inY: y, out },
        gates: { gOr: out }
      };
    },
    renderCircuitSvg: () => `
      <g class="wire-group" data-wire="inR">
        <path class="wire-base"  d="M 235 140 L 365 140 L 365 210 L 458 210"/>
        <path class="wire-power" d="M 235 140 L 365 140 L 365 210 L 458 210"/>
        <path class="wire-pulse" d="M 235 140 L 365 140 L 365 210 L 458 210"/>
      </g>
      <g class="wire-group" data-wire="inY">
        <path class="wire-base"  d="M 235 340 L 365 340 L 365 270 L 458 270"/>
        <path class="wire-power" d="M 235 340 L 365 340 L 365 270 L 458 270"/>
        <path class="wire-pulse" d="M 235 340 L 365 340 L 365 270 L 458 270"/>
      </g>
      <g class="wire-group" data-wire="out">
        <path class="wire-base"  d="M 592 240 L 755 240"/>
        <path class="wire-power" d="M 592 240 L 755 240"/>
        <path class="wire-pulse" d="M 592 240 L 755 240"/>
      </g>
      <g data-gate="gOr">
        <path class="gate-body" d="M 442 178 Q 475 240 442 302 L 496 302 Q 560 302 592 240 Q 560 178 496 178 Z"/>
      </g>
      ${renderGndSvg(755, 290)}
    `
  },
  {
    id: 'and',
    name: 'AND',
    ruby: 'あんど',
    tip: 'あか と きいろ を いっしょに おしてね！',
    bg: '#F6C927',
    lightBg: true,
    pcb: false,
    ledOn: '#F43F9E',
    ledOff: '#54461B',
    ledGlow: 'rgba(244, 63, 158, 0.92)',
    buttons: [
      { id: 'r', color: 'red',    x: 235, y: 140 },
      { id: 'y', color: 'yellow', x: 235, y: 340 }
    ],
    led: { x: 755, y: 240 },
    evalState: (pressed) => {
      const r = !!pressed.r;
      const y = !!pressed.y;
      const out = r && y;
      return {
        led: out,
        wires: { inR: r, inY: y, out },
        gates: { gAnd: out }
      };
    },
    renderCircuitSvg: () => `
      <g class="wire-group" data-wire="inR">
        <path class="wire-base"  d="M 235 140 L 365 140 L 365 210 L 455 210"/>
        <path class="wire-power" d="M 235 140 L 365 140 L 365 210 L 455 210"/>
        <path class="wire-pulse" d="M 235 140 L 365 140 L 365 210 L 455 210"/>
      </g>
      <g class="wire-group" data-wire="inY">
        <path class="wire-base"  d="M 235 340 L 365 340 L 365 270 L 455 270"/>
        <path class="wire-power" d="M 235 340 L 365 340 L 365 270 L 455 270"/>
        <path class="wire-pulse" d="M 235 340 L 365 340 L 365 270 L 455 270"/>
      </g>
      <g class="wire-group" data-wire="out">
        <path class="wire-base"  d="M 585 240 L 755 240"/>
        <path class="wire-power" d="M 585 240 L 755 240"/>
        <path class="wire-pulse" d="M 585 240 L 755 240"/>
      </g>
      <g data-gate="gAnd">
        <path class="gate-body" d="M 455 178 L 522 178 A 62 62 0 0 1 522 302 L 455 302 Z"/>
      </g>
      ${renderGndSvg(755, 290)}
    `
  },
  {
    id: 'xor',
    name: 'XOR',
    ruby: 'えっくすおあ',
    tip: 'どっちか ひとつ だけ おすと つくよ！',
    bg: '#55B375',
    lightBg: false,
    pcb: true,
    ledOn: '#FFF04D',
    ledOff: '#284534',
    ledGlow: 'rgba(255, 240, 77, 0.95)',
    buttons: [
      { id: 'r', color: 'red',    x: 235, y: 140 },
      { id: 'y', color: 'yellow', x: 235, y: 340 }
    ],
    led: { x: 755, y: 240 },
    evalState: (pressed) => {
      const r = !!pressed.r;
      const y = !!pressed.y;
      const out = (r || y) && !(r && y);
      return {
        led: out,
        wires: { inR: r, inY: y, out },
        gates: { gXor: out }
      };
    },
    renderCircuitSvg: () => `
      <g class="wire-group" data-wire="inR">
        <path class="wire-base"  d="M 235 140 L 365 140 L 365 210 L 452 210"/>
        <path class="wire-power" d="M 235 140 L 365 140 L 365 210 L 452 210"/>
        <path class="wire-pulse" d="M 235 140 L 365 140 L 365 210 L 452 210"/>
      </g>
      <g class="wire-group" data-wire="inY">
        <path class="wire-base"  d="M 235 340 L 365 340 L 365 270 L 452 270"/>
        <path class="wire-power" d="M 235 340 L 365 340 L 365 270 L 452 270"/>
        <path class="wire-pulse" d="M 235 340 L 365 340 L 365 270 L 452 270"/>
      </g>
      <g class="wire-group" data-wire="out">
        <path class="wire-base"  d="M 602 240 L 755 240"/>
        <path class="wire-power" d="M 602 240 L 755 240"/>
        <path class="wire-pulse" d="M 602 240 L 755 240"/>
      </g>
      <g data-gate="gXor">
        <path class="gate-body" style="fill:none;" d="M 432 178 Q 465 240 432 302"/>
        <path class="gate-body" d="M 452 178 Q 485 240 452 302 L 506 302 Q 570 302 602 240 Q 570 178 506 178 Z"/>
      </g>
      ${renderGndSvg(755, 290)}
    `
  },
  {
    id: 'latch',
    name: 'LATCH',
    ruby: 'らっち',
    tip: 'きいろ で ついたまま！ あか で きえるよ！',
    bg: '#2D323B',
    lightBg: false,
    pcb: true,
    ledOn: '#38E8FF',
    ledOff: '#1E232B',
    ledGlow: 'rgba(56, 232, 255, 0.95)',
    buttons: [
      { id: 'r', color: 'red',    x: 265, y: 135, label: 'RESET', labelRuby: 'りせっと' },
      { id: 'y', color: 'yellow', x: 265, y: 345, label: 'SET',   labelRuby: 'せっと' }
    ],
    led: { x: 775, y: 240 },
    evalState: (pressed, memory) => {
      const reset = !!pressed.r;
      const set = !!pressed.y;
      // Dominant-Reset SR Latch: Q = (SET || Q) && !RESET
      if (reset) {
        memory.latched = false;
      } else if (set) {
        memory.latched = true;
      }
      const q = !!memory.latched;
      const notReset = !reset;
      const orOut = set || q;
      return {
        led: q,
        wires: {
          inR: reset,
          notOut: notReset,
          inY: set,
          orOut: orOut,
          out: q,
          fb: q
        },
        gates: {
          gNot: notReset,
          gOr: orOut,
          gAnd: q
        }
      };
    },
    renderCircuitSvg: () => `
      <!-- RESET button to NOT gate -->
      <g class="wire-group" data-wire="inR">
        <path class="wire-base"  d="M 265 135 L 368 135"/>
        <path class="wire-power" d="M 265 135 L 368 135"/>
        <path class="wire-pulse" d="M 265 135 L 368 135"/>
      </g>
      <!-- NOT gate output to AND gate top input -->
      <g class="wire-group" data-wire="notOut">
        <path class="wire-base"  d="M 442 135 L 495 135 L 495 212 L 542 212"/>
        <path class="wire-power" d="M 442 135 L 495 135 L 495 212 L 542 212"/>
        <path class="wire-pulse" d="M 442 135 L 495 135 L 495 212 L 542 212"/>
      </g>
      <!-- SET button to OR gate bottom input -->
      <g class="wire-group" data-wire="inY">
        <path class="wire-base"  d="M 265 345 L 375 345"/>
        <path class="wire-power" d="M 265 345 L 375 345"/>
        <path class="wire-pulse" d="M 265 345 L 375 345"/>
      </g>
      <!-- Feedback loop from AND output back to OR top input -->
      <g class="wire-group" data-wire="fb">
        <path class="wire-base"  d="M 678 240 L 678 415 L 332 415 L 332 308 L 375 308"/>
        <path class="wire-power" d="M 678 240 L 678 415 L 332 415 L 332 308 L 375 308"/>
        <path class="wire-pulse" d="M 678 240 L 678 415 L 332 415 L 332 308 L 375 308"/>
      </g>
      <!-- OR output to AND bottom input -->
      <g class="wire-group" data-wire="orOut">
        <path class="wire-base"  d="M 468 326 L 495 326 L 495 268 L 542 268"/>
        <path class="wire-power" d="M 468 326 L 495 326 L 495 268 L 542 268"/>
        <path class="wire-pulse" d="M 468 326 L 495 326 L 495 268 L 542 268"/>
      </g>
      <!-- AND output to LED -->
      <g class="wire-group" data-wire="out">
        <path class="wire-base"  d="M 642 240 L 775 240"/>
        <path class="wire-power" d="M 642 240 L 775 240"/>
        <path class="wire-pulse" d="M 642 240 L 775 240"/>
        <circle cx="678" cy="240" r="8" fill="#FFFFFF"/>
      </g>

      <!-- NOT Gate (compact) -->
      <g data-gate="gNot">
        <polygon class="gate-body" points="368,100 368,170 422,135"/>
        <circle class="gate-body" cx="432" cy="135" r="10"/>
      </g>
      <!-- OR Gate (compact) -->
      <g data-gate="gOr">
        <path class="gate-body" d="M 366 286 Q 388 326 366 366 L 405 366 Q 446 366 468 326 Q 446 286 405 286 Z"/>
      </g>
      <!-- AND Gate -->
      <g data-gate="gAnd">
        <path class="gate-body" d="M 542 190 L 592 190 A 50 50 0 0 1 592 290 L 542 290 Z"/>
      </g>
      ${renderGndSvg(775, 290)}
    `
  }
];

export default class LogicBookGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.stageIndex = 0;
    this.pressed = {};
    this.memory = { latched: false };
    this.lastLedOn = false;
    this.pointerMap = new Map(); // pointerId -> buttonId
    this.isTransitioning = false;
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
  }

  mount() {
    this.container.innerHTML = `
      <div class="lb-root" id="lb-root">
        ${renderPcbPatternSvg()}

        <div class="lb-stage-header">
          <div class="lb-stage-pill" id="lb-page-counter">1 / 6</div>
        </div>

        <div class="lb-title-area">
          <h2 class="lb-circuit-name" id="lb-circuit-name"></h2>
          <p class="lb-circuit-tip" id="lb-circuit-tip"></p>
        </div>

        <div class="lb-stage-viewport">
          <div class="lb-board" id="lb-board"></div>
        </div>

        <nav class="lb-nav" aria-label="ページきりかえ">
          <button class="nav-arrow-btn" id="lb-prev-btn" type="button" aria-label="まえの ページ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div class="lb-dots" id="lb-dots"></div>

          <button class="nav-arrow-btn" id="lb-next-btn" type="button" aria-label="つぎの ページ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </nav>
      </div>
    `;

    this.rootEl = this.container.querySelector('#lb-root');
    this.pcbEl = this.container.querySelector('.lb-pcb-bg');
    this.boardEl = this.container.querySelector('#lb-board');
    this.counterEl = this.container.querySelector('#lb-page-counter');
    this.nameEl = this.container.querySelector('#lb-circuit-name');
    this.tipEl = this.container.querySelector('#lb-circuit-tip');
    this.prevBtn = this.container.querySelector('#lb-prev-btn');
    this.nextBtn = this.container.querySelector('#lb-next-btn');
    this.dotsEl = this.container.querySelector('#lb-dots');

    this.buildDots();

    this.prevBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.goToStage(this.stageIndex - 1, -1);
    });

    this.nextBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.goToStage(this.stageIndex + 1, 1);
    });

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.renderStage(0, false);
  }

  unmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.pointerMap.clear();
    this.container.innerHTML = '';
  }

  buildDots() {
    this.dotsEl.innerHTML = '';
    LOGIC_STAGES.forEach((st, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'lb-dot';
      dot.setAttribute('aria-label', `${st.ruby} ページへ`);
      dot.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        if (idx !== this.stageIndex) {
          this.goToStage(idx, idx > this.stageIndex ? 1 : -1);
        }
      });
      this.dotsEl.appendChild(dot);
    });
  }

  goToStage(nextIndex, direction) {
    if (this.isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= LOGIC_STAGES.length) return;

    this.isTransitioning = true;
    this.sound.playPageTurn(direction);
    this.boardEl.classList.add(direction > 0 ? 'slide-out-left' : 'slide-out-right');

    setTimeout(() => {
      this.renderStage(nextIndex, true);
      this.boardEl.classList.remove('slide-out-left', 'slide-out-right');
      this.isTransitioning = false;
    }, 190);
  }

  renderStage(index, playNotInitSound = false) {
    this.stageIndex = index;
    const stage = LOGIC_STAGES[index];

    // Reset transient state
    this.pressed = {};
    this.memory = { latched: false };
    this.pointerMap.clear();

    // Update shell & theme
    this.app.setGameBackground(stage.bg);
    this.rootEl.classList.toggle('is-light-bg', !!stage.lightBg);
    this.pcbEl.classList.toggle('is-visible', !!stage.pcb);

    this.counterEl.textContent = `${index + 1} / ${LOGIC_STAGES.length}`;
    this.nameEl.innerHTML = `<ruby>${stage.name}<rt>${stage.ruby}</rt></ruby>`;
    this.tipEl.textContent = stage.tip;

    this.prevBtn.classList.toggle('is-disabled', index === 0);
    this.nextBtn.classList.toggle('is-disabled', index === LOGIC_STAGES.length - 1);

    Array.from(this.dotsEl.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    // Build interactive board HTML (SVG wires + tactile HTML buttons + LED)
    let buttonsHtml = '';
    stage.buttons.forEach((btn) => {
      const leftPct = (btn.x / 900) * 100;
      const topPct = (btn.y / 480) * 100;
      if (btn.label) {
        const labelLeftPct = ((btn.x - 86) / 900) * 100;
        buttonsHtml += `
          <div class="btn-side-label" style="left:${labelLeftPct}%; top:${topPct}%;">
            <ruby>${btn.label}<rt>${btn.labelRuby}</rt></ruby>
          </div>
        `;
      }
      buttonsHtml += `
        <div class="toy-push-btn btn-${btn.color}"
             data-btn-id="${btn.id}"
             data-btn-color="${btn.color}"
             style="left:${leftPct}%; top:${topPct}%;"
             role="button"
             aria-label="${btn.color === 'red' ? 'あかい ぼたん' : 'きいろい ぼたん'}">
          <div class="btn-ripple"></div>
          <div class="toy-push-btn-well">
            <div class="toy-push-btn-cap"></div>
          </div>
        </div>
      `;
    });

    const ledLeftPct = (stage.led.x / 900) * 100;
    const ledTopPct = (stage.led.y / 480) * 100;

    this.boardEl.innerHTML = `
      <svg class="lb-circuit-svg" viewBox="0 0 900 480" aria-hidden="true">
        ${stage.renderCircuitSvg()}
      </svg>
      ${buttonsHtml}
      <div class="toy-led" id="lb-led"
           style="left:${ledLeftPct}%; top:${ledTopPct}%; --led-on:${stage.ledOn}; --led-off:${stage.ledOff}; --led-glow:${stage.ledGlow};">
        <svg class="led-sparkles" viewBox="0 0 140 140" aria-hidden="true">
          <g stroke="${stage.ledOn}" stroke-width="7" stroke-linecap="round">
            <line x1="70" y1="6"  x2="70" y2="20"/>
            <line x1="70" y1="120" x2="70" y2="134"/>
            <line x1="6"  y1="70" x2="20" y2="70"/>
            <line x1="120" y1="70" x2="134" y2="70"/>
            <line x1="22" y1="22" x2="32" y2="32"/>
            <line x1="108" y1="108" x2="118" y2="118"/>
            <line x1="118" y1="22" x2="108" y2="32"/>
            <line x1="32" y1="108" x2="22" y2="118"/>
          </g>
        </svg>
        <div class="toy-led-bulb"></div>
      </div>
    `;

    this.bindButtonEvents();

    // Evaluate initial state silently (so NOT starts lit without extra noise unless desired)
    const initial = stage.evalState(this.pressed, this.memory);
    this.lastLedOn = initial.led;
    this.applyVisualState(initial);

    if (playNotInitSound && stage.id === 'not') {
      setTimeout(() => {
        if (this.stageIndex === index && this.lastLedOn) {
          this.sound.playLampOn('not');
        }
      }, 140);
    }
  }

  bindButtonEvents() {
    const btnEls = this.boardEl.querySelectorAll('.toy-push-btn');
    btnEls.forEach((el) => {
      const btnId = el.dataset.btnId;
      const color = el.dataset.btnColor;
      const activePointers = new Set();

      const updateBtnPressed = () => {
        const isDown = activePointers.size > 0;
        const wasDown = !!this.pressed[btnId];
        if (isDown === wasDown) return;

        this.pressed[btnId] = isDown;
        el.classList.toggle('is-pressed', isDown);

        if (isDown) {
          this.sound.playButtonDown(color);
        } else {
          this.sound.playButtonUp(color);
        }
        this.evaluateAndRender();
      };

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        activePointers.add(e.pointerId);
        this.pointerMap.set(e.pointerId, btnId);
        updateBtnPressed();
      });

      const releasePointer = (e) => {
        if (!activePointers.has(e.pointerId)) return;
        activePointers.delete(e.pointerId);
        this.pointerMap.delete(e.pointerId);
        updateBtnPressed();
      };

      el.addEventListener('pointerup', releasePointer);
      el.addEventListener('pointercancel', releasePointer);
      el.addEventListener('lostpointercapture', releasePointer);
    });
  }

  /* Optional keyboard support for desktop testing (1 = red, 2 = yellow, arrows = pages) */
  handleKeyDown(e) {
    if (e.repeat) return;
    if (e.key === 'ArrowRight') {
      this.goToStage(this.stageIndex + 1, 1);
      return;
    }
    if (e.key === 'ArrowLeft') {
      this.goToStage(this.stageIndex - 1, -1);
      return;
    }
    const btnId = e.key === '1' ? 'r' : (e.key === '2' || e.key === ' ' ? 'y' : null);
    if (!btnId) return;
    const btnEl = this.boardEl.querySelector(`.toy-push-btn[data-btn-id="${btnId}"]`);
    if (!btnEl || this.pressed[btnId]) return;
    this.sound.unlock();
    this.pressed[btnId] = true;
    btnEl.classList.add('is-pressed');
    this.sound.playButtonDown(btnEl.dataset.btnColor);
    this.evaluateAndRender();
  }

  handleKeyUp(e) {
    const btnId = e.key === '1' ? 'r' : (e.key === '2' || e.key === ' ' ? 'y' : null);
    if (!btnId) return;
    const btnEl = this.boardEl.querySelector(`.toy-push-btn[data-btn-id="${btnId}"]`);
    if (!btnEl || !this.pressed[btnId]) return;
    this.pressed[btnId] = false;
    btnEl.classList.remove('is-pressed');
    this.sound.playButtonUp(btnEl.dataset.btnColor);
    this.evaluateAndRender();
  }

  evaluateAndRender() {
    const stage = LOGIC_STAGES[this.stageIndex];
    const state = stage.evalState(this.pressed, this.memory);
    this.applyVisualState(state);

    if (state.led !== this.lastLedOn) {
      if (state.led) {
        this.sound.playLampOn(stage.id);
      } else {
        this.sound.playLampOff(stage.id === 'latch');
      }
      this.lastLedOn = state.led;
    }
  }

  applyVisualState(state) {
    const ledEl = this.boardEl.querySelector('#lb-led');
    if (ledEl) {
      ledEl.classList.toggle('is-on', !!state.led);
    }

    Object.entries(state.wires).forEach(([wireId, isOn]) => {
      const group = this.boardEl.querySelector(`.wire-group[data-wire="${wireId}"]`);
      if (!group) return;
      group.querySelectorAll('.wire-power, .wire-pulse').forEach((path) => {
        path.classList.toggle('is-on', !!isOn);
      });
    });

    Object.entries(state.gates).forEach(([gateId, isActive]) => {
      const group = this.boardEl.querySelector(`[data-gate="${gateId}"]`);
      if (!group) return;
      group.querySelectorAll('.gate-body').forEach((shape) => {
        shape.classList.toggle('is-active', !!isActive);
      });
    });
  }
}
