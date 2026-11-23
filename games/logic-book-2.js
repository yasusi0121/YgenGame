import { renderGndSvg, renderPcbPatternSvg, renderSparklesSvg } from "../core/circuit-helpers.js";

const BIG_BABIES_STAGES = [
  {
    id: 'd-latch',
    name: 'D-LATCH',
    ruby: 'でぃー らっち',
    tip: 'きいろ が オンの ときだけ あか が つたわるよ！ オフで おぼえるよ！',
    bg: '#249E6B',
    lightBg: false,
    pcb: true,
    ledOn: '#4ADE80',
    ledOff: '#174A34',
    ledGlow: 'rgba(74, 222, 128, 0.95)',
    switches: [
      { id: 'r', color: 'red',    x: 165, y: 155, label: 'DATA',   labelRuby: 'でーた' },
      { id: 'y', color: 'yellow', x: 165, y: 335, label: 'ENABLE', labelRuby: 'いねーぶる' }
    ],
    renderStage: (game) => {
      const data = !!game.sw.r;
      const en = !!game.sw.y;
      if (en) {
        game.dLatchQ = data;
      }
      const q = !!game.dLatchQ;
      return {
        svg: `
          <g class="wire-group" data-wire="wData">
            <path class="wire-base"  d="M 165 155 L 435 155"/>
            <path class="wire-power ${data ? 'is-on' : ''}" d="M 165 155 L 435 155"/>
            <path class="wire-pulse ${data ? 'is-on' : ''}" d="M 165 155 L 435 155"/>
          </g>
          <g class="wire-group" data-wire="wEn">
            <path class="wire-base"  d="M 165 335 L 350 335 L 350 305 L 435 305"/>
            <path class="wire-power ${en ? 'is-on' : ''}" d="M 165 335 L 350 335 L 350 305 L 435 305"/>
            <path class="wire-pulse ${en ? 'is-on' : ''}" d="M 165 335 L 350 335 L 350 305 L 435 305"/>
          </g>
          <g class="wire-group" data-wire="wOut">
            <path class="wire-base"  d="M 615 230 L 765 230"/>
            <path class="wire-power ${q ? 'is-on' : ''}" d="M 615 230 L 765 230"/>
            <path class="wire-pulse ${q ? 'is-on' : ''}" d="M 615 230 L 765 230"/>
          </g>
          <rect class="gate-body ${en ? 'is-active' : ''}" x="435" y="120" width="180" height="225" rx="22"/>
          <text class="bb-svg-label" x="452" y="162">DATA</text>
          <text class="bb-svg-label" x="452" y="312">ENABLE</text>
          <text class="bb-svg-label" x="562" y="236">OUT</text>
          <text class="bb-svg-sublabel" x="525" y="218" text-anchor="middle">${en ? 'うけつけ中' : 'おぼえたよ！'}</text>
          ${renderGndSvg(765, 282)}
        `,
        extrasHtml: `
          <div class="toy-led ${q ? 'is-on' : ''}"
               style="left:${(765 / 900) * 100}%; top:${(230 / 480) * 100}%; --led-on:#4ADE80; --led-off:#174A34; --led-glow:rgba(74,222,128,0.95);">
            ${renderSparklesSvg('#4ADE80')}
            <div class="toy-led-bulb"></div>
          </div>
        `,
        soundKey: `q:${q ? 1 : 0}`,
        onSoundChange: () => {
          if (q) game.sound.playLampOn('latch');
          else game.sound.playLampOff(true);
        }
      };
    }
  },
  {
    id: 'shift-register',
    name: 'SHIFT REGISTER',
    ruby: 'しふと れじすた',
    tip: 'あか で ひかり を きめて、きいろ を おすと 1つずつ すすむよ！',
    bg: '#4FA8D8',
    lightBg: false,
    pcb: false,
    switches: [
      { id: 'r', color: 'red',    x: 165, y: 165, label: 'DATA',  labelRuby: 'でーた' },
      { id: 'y', color: 'yellow', x: 165, y: 345, label: 'CLOCK', labelRuby: 'すすむ', isPulseAction: true }
    ],
    onPulse: (game) => {
      const data = !!game.sw.r;
      game.shiftBits = [data, game.shiftBits[0], game.shiftBits[1]];
      const litCount = game.shiftBits.filter(Boolean).length;
      game.sound.playShiftStep(litCount);
    },
    renderStage: (game) => {
      const data = !!game.sw.r;
      const [b0, b1, b2] = game.shiftBits;
      const clkFlash = !!game.clkFlash;
      const ys = [135, 245, 355];
      return {
        svg: `
          <!-- DATA into top input and first stage -->
          <g class="wire-group">
            <path class="wire-base"  d="M 165 165 L 330 165 L 330 62 L 545 62 L 545 96"/>
            <path class="wire-power ${data ? 'is-on' : ''}" d="M 165 165 L 330 165 L 330 62 L 545 62 L 545 96"/>
            <path class="wire-pulse ${data ? 'is-on' : ''}" d="M 165 165 L 330 165 L 330 62 L 545 62 L 545 96"/>
          </g>
          <!-- Stage 0 -> Stage 1 -->
          <g class="wire-group">
            <path class="wire-base"  d="M 545 174 L 545 206"/>
            <path class="wire-power ${b0 ? 'is-on' : ''}" d="M 545 174 L 545 206"/>
          </g>
          <!-- Stage 1 -> Stage 2 -->
          <g class="wire-group">
            <path class="wire-base"  d="M 545 284 L 545 316"/>
            <path class="wire-power ${b1 ? 'is-on' : ''}" d="M 545 284 L 545 316"/>
          </g>
          <!-- CLOCK bus to all 3 boxes -->
          <g class="wire-group">
            <path class="wire-base"  d="M 165 345 L 405 345 L 405 135 L 485 135 M 405 245 L 485 245 M 405 355 L 485 355"/>
            <path class="wire-power ${clkFlash ? 'is-on' : ''}" d="M 165 345 L 405 345 L 405 135 L 485 135 M 405 245 L 485 245 M 405 355 L 485 355"/>
          </g>
          <!-- Output wire from Stage 2 to right indicator -->
          <g class="wire-group">
            <path class="wire-base"  d="M 605 355 L 745 355"/>
            <path class="wire-power ${b2 ? 'is-on' : ''}" d="M 605 355 L 745 355"/>
            <path class="wire-pulse ${b2 ? 'is-on' : ''}" d="M 605 355 L 745 355"/>
          </g>
          <!-- 3 Flip-Flop Boxes -->
          ${ys.map((y, idx) => `
            <rect class="gate-body ${game.shiftBits[idx] ? 'is-active' : ''}" x="485" y="${y - 39}" width="120" height="78" rx="16"/>
            <text class="bb-svg-sublabel" x="625" y="${y + 6}">${idx + 1}だんめ</text>
          `).join('')}
        `,
        extrasHtml: `
          <!-- Top DATA preview LED -->
          <div class="toy-mini-led ${data ? 'is-on' : ''}"
               style="left:${(545 / 900) * 100}%; top:${(62 / 480) * 100}%; --led-on:#FF6B6B; --led-off:#244B63; --led-glow:rgba(255,107,107,0.9);">
            <div class="toy-mini-led-bulb"></div>
          </div>
          ${ys.map((y, idx) => `
            <div class="toy-mini-led ${game.shiftBits[idx] ? 'is-on' : ''}"
                 style="left:${(545 / 900) * 100}%; top:${(y / 480) * 100}%; width:7.2%; --led-on:#FFF04D; --led-off:#244B63; --led-glow:rgba(255,240,77,0.95);">
              <div class="toy-mini-led-bulb"></div>
            </div>
          `).join('')}
          <div class="toy-led ${b2 ? 'is-on' : ''}"
               style="left:${(745 / 900) * 100}%; top:${(355 / 480) * 100}%; --led-on:#FFF04D; --led-off:#244B63; --led-glow:rgba(255,240,77,0.95);">
            ${renderSparklesSvg('#FFF04D')}
            <div class="toy-led-bulb"></div>
          </div>
        `,
        soundKey: null
      };
    }
  },
  {
    id: 'decoder',
    name: 'DECODER',
    ruby: 'でこーだー',
    tip: 'あか と きいろ の くみあわせ で 4つの らんぷ を えらぶよ！',
    bg: '#DCD8C8',
    lightBg: true,
    pcb: false,
    switches: [
      { id: 'r', color: 'red',    x: 165, y: 165, label: 'S1', labelRuby: 'うえ' },
      { id: 'y', color: 'yellow', x: 165, y: 335, label: 'S0', labelRuby: 'した' }
    ],
    renderStage: (game) => {
      const s1 = !!game.sw.r;
      const s0 = !!game.sw.y;
      const sel = (s1 ? 2 : 0) + (s0 ? 1 : 0);
      const outYs = [105, 195, 285, 375];
      const ledColors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4'];
      return {
        svg: `
          <g class="wire-group">
            <path class="wire-base"  d="M 165 165 L 365 165"/>
            <path class="wire-power ${s1 ? 'is-on' : ''}" d="M 165 165 L 365 165"/>
            <path class="wire-pulse ${s1 ? 'is-on' : ''}" d="M 165 165 L 365 165"/>
          </g>
          <g class="wire-group">
            <path class="wire-base"  d="M 165 335 L 365 335"/>
            <path class="wire-power ${s0 ? 'is-on' : ''}" d="M 165 335 L 365 335"/>
            <path class="wire-pulse ${s0 ? 'is-on' : ''}" d="M 165 335 L 365 335"/>
          </g>
          ${outYs.map((y, idx) => {
            const active = idx === sel;
            return `
              <g class="wire-group">
                <path class="wire-base"  d="M 525 ${y} L 705 ${y}"/>
                <path class="wire-power ${active ? 'is-on' : ''}" d="M 525 ${y} L 705 ${y}"/>
                <path class="wire-pulse ${active ? 'is-on' : ''}" d="M 525 ${y} L 705 ${y}"/>
              </g>
              <text class="bb-svg-label" x="752" y="${y + 7}">${idx}</text>
            `;
          }).join('')}
          <rect class="gate-body is-active" x="365" y="75" width="160" height="330" rx="22"/>
          <text class="bb-svg-label" x="445" y="232" text-anchor="middle">DECODER</text>
          <text class="bb-svg-sublabel" x="445" y="262" text-anchor="middle">${s1 ? '1' : '0'}${s0 ? '1' : '0'} → ${sel}ばん</text>
        `,
        extrasHtml: outYs.map((y, idx) => {
          const active = idx === sel;
          const col = ledColors[idx];
          return `
            <div class="toy-mini-led ${active ? 'is-on' : ''}"
                 style="left:${(705 / 900) * 100}%; top:${(y / 480) * 100}%; width:8.6%; --led-on:${col}; --led-off:#635E4E; --led-glow:${col};">
              <div class="toy-mini-led-bulb"></div>
            </div>
          `;
        }).join(''),
        soundKey: `sel:${sel}`,
        onSoundChange: () => game.sound.playSlotTone(sel)
      };
    }
  },
  {
    id: 'mux',
    name: 'MUX',
    ruby: 'まっくす',
    tip: '4つの まる（0〜3）から、すいっちで えらんだ 1つ だけ つくよ！',
    bg: '#4A6FE3',
    lightBg: false,
    pcb: true,
    switches: [
      { id: 'r', color: 'red',    x: 155, y: 165, label: 'S1', labelRuby: 'えらぶ1' },
      { id: 'y', color: 'yellow', x: 155, y: 335, label: 'S0', labelRuby: 'えらぶ0' }
    ],
    renderStage: (game) => {
      const s1 = !!game.sw.r;
      const s0 = !!game.sw.y;
      const sel = (s1 ? 2 : 0) + (s0 ? 1 : 0);
      const inYs = [105, 195, 285, 375];
      const outVal = !!game.muxInputs[sel];
      return {
        svg: `
          <!-- Select wires into bottom of MUX trapezoid -->
          <g class="wire-group">
            <path class="wire-base"  d="M 155 165 L 250 165 L 250 432 L 545 432 L 545 368"/>
            <path class="wire-power ${s1 ? 'is-on' : ''}" d="M 155 165 L 250 165 L 250 432 L 545 432 L 545 368"/>
          </g>
          <g class="wire-group">
            <path class="wire-base"  d="M 155 335 L 222 335 L 222 456 L 595 456 L 595 346"/>
            <path class="wire-power ${s0 ? 'is-on' : ''}" d="M 155 335 L 222 335 L 222 456 L 595 456 L 595 346"/>
          </g>
          <!-- 4 Input wires -->
          ${inYs.map((y, idx) => {
            const val = !!game.muxInputs[idx];
            const isSel = idx === sel;
            return `
              <g class="wire-group">
                <path class="wire-base"  d="M 360 ${y} L 505 ${y}"/>
                <path class="wire-power ${val ? 'is-on' : ''}" d="M 360 ${y} L 505 ${y}"/>
                <path class="wire-pulse ${val && isSel ? 'is-on' : ''}" d="M 360 ${y} L 505 ${y}"/>
              </g>
            `;
          }).join('')}
          <!-- MUX Output wire -->
          <g class="wire-group">
            <path class="wire-base"  d="M 635 240 L 775 240"/>
            <path class="wire-power ${outVal ? 'is-on' : ''}" d="M 635 240 L 775 240"/>
            <path class="wire-pulse ${outVal ? 'is-on' : ''}" d="M 635 240 L 775 240"/>
          </g>
          <!-- MUX Trapezoid -->
          <polygon class="gate-body ${outVal ? 'is-active' : ''}" points="505,72 635,142 635,338 505,408"/>
          <text class="bb-svg-label" x="568" y="232" text-anchor="middle">MUX</text>
          <text class="bb-svg-sublabel" x="568" y="260" text-anchor="middle">${sel}ばん</text>
        `,
        extrasHtml: `
          ${inYs.map((y, idx) => {
            const val = !!game.muxInputs[idx];
            const isSel = idx === sel;
            return `
              <div class="toy-tap-node ${val ? 'is-on' : ''} ${isSel ? 'is-selected' : ''}"
                   data-tap-kind="mux" data-tap-idx="${idx}"
                   style="left:${(360 / 900) * 100}%; top:${(y / 480) * 100}%; --led-on:#4ADE80; --led-glow:rgba(74,222,128,0.9);">
                <div class="toy-tap-node-inner">${idx}</div>
              </div>
            `;
          }).join('')}
          <div class="toy-led ${outVal ? 'is-on' : ''}"
               style="left:${(775 / 900) * 100}%; top:${(240 / 480) * 100}%; --led-on:#4ADE80; --led-off:#223573; --led-glow:rgba(74,222,128,0.95);">
            ${renderSparklesSvg('#4ADE80')}
            <div class="toy-led-bulb"></div>
          </div>
        `,
        soundKey: `sel:${sel}|out:${outVal ? 1 : 0}`,
        onSoundChange: () => {
          if (outVal) game.sound.playSlotTone(sel);
          else game.sound.playLampOff(false);
        }
      };
    }
  },
  {
    id: 'memory-write',
    name: 'MEMORY WRITE',
    ruby: 'めもりー らいと',
    tip: 'すいっちで ばしょを えらんで、「かく！」ぼたんで ひかりを おぼえさせるよ！',
    bg: '#E6632E',
    lightBg: false,
    pcb: true,
    switches: [
      { id: 'r', color: 'red',    x: 155, y: 165, label: 'A1', labelRuby: 'ばしょ1' },
      { id: 'y', color: 'yellow', x: 155, y: 335, label: 'A0', labelRuby: 'ばしょ0' }
    ],
    renderStage: (game) => {
      const a1 = !!game.sw.r;
      const a0 = !!game.sw.y;
      const addr = (a1 ? 2 : 0) + (a0 ? 1 : 0);
      const cellYs = [100, 193, 286, 379];
      return {
        svg: `
          <!-- Address wires into Decoder -->
          <g class="wire-group">
            <path class="wire-base"  d="M 155 165 L 305 165"/>
            <path class="wire-power ${a1 ? 'is-on' : ''}" d="M 155 165 L 305 165"/>
          </g>
          <g class="wire-group">
            <path class="wire-base"  d="M 155 335 L 305 335"/>
            <path class="wire-power ${a0 ? 'is-on' : ''}" d="M 155 335 L 305 335"/>
          </g>
          <!-- Address Decoder block -->
          <rect class="gate-body is-active" x="305" y="110" width="96" height="270" rx="18"/>
          <text class="bb-svg-sublabel" x="353" y="242" text-anchor="middle">ばしょ</text>
          <text class="bb-svg-label" x="353" y="268" text-anchor="middle">${addr}</text>

          <!-- Wires from Address Decoder to 4 Memory Cells -->
          ${cellYs.map((y, idx) => {
            const isSel = idx === addr;
            return `
              <g class="wire-group">
                <path class="wire-base"  d="M 401 ${y} L 530 ${y}"/>
                <path class="wire-power ${isSel ? 'is-on' : ''}" d="M 401 ${y} L 530 ${y}"/>
                <path class="wire-pulse ${isSel ? 'is-on' : ''}" d="M 401 ${y} L 530 ${y}"/>
              </g>
              <rect class="gate-body ${isSel ? 'is-active' : ''}" x="530" y="${y - 36}" width="110" height="72" rx="16"/>
            `;
          }).join('')}
          <!-- Write bus from action button to selected cell -->
          <g class="wire-group">
            <path class="wire-base"  d="M 760 240 L 680 240 L 680 ${cellYs[addr]} L 640 ${cellYs[addr]}"/>
            <path class="wire-power is-on" d="M 760 240 L 680 240 L 680 ${cellYs[addr]} L 640 ${cellYs[addr]}"/>
          </g>
        `,
        extrasHtml: `
          ${cellYs.map((y, idx) => {
            const val = !!game.sharedMemory[idx];
            const isSel = idx === addr;
            return `
              <div class="toy-tap-node ${val ? 'is-on' : ''} ${isSel ? 'is-selected' : ''}"
                   data-tap-kind="mem" data-tap-idx="${idx}"
                   style="left:${(585 / 900) * 100}%; top:${(y / 480) * 100}%; --led-on:#FFF04D; --led-glow:rgba(255,240,77,0.95);">
                <div class="toy-tap-node-inner">${idx}</div>
              </div>
            `;
          }).join('')}
          <div class="toy-action-btn" data-action="write-mem"
               style="left:${(775 / 900) * 100}%; top:${(240 / 480) * 100}%; --act-bg:#38BDF8; --act-depth:#0284C7;">
            <div class="toy-action-cap"><span><ruby>WRITE<rt>かく！</rt></ruby></span></div>
          </div>
        `,
        soundKey: `addr:${addr}`,
        onSoundChange: () => game.sound.playSlotTone(addr)
      };
    }
  },
  {
    id: 'memory-read',
    name: 'MEMORY READ',
    ruby: 'めもりー りーど',
    tip: 'まえの ページで おぼえた ひかり を すいっちで よみだすよ！',
    bg: '#233B2E',
    lightBg: false,
    pcb: true,
    switches: [
      { id: 'r', color: 'red',    x: 155, y: 165, label: 'A1', labelRuby: 'ばしょ1' },
      { id: 'y', color: 'yellow', x: 155, y: 335, label: 'A0', labelRuby: 'ばしょ0' }
    ],
    renderStage: (game) => {
      const a1 = !!game.sw.r;
      const a0 = !!game.sw.y;
      const addr = (a1 ? 2 : 0) + (a0 ? 1 : 0);
      const cellYs = [100, 193, 286, 379];
      const outVal = !!game.sharedMemory[addr];
      return {
        svg: `
          <!-- Select wires to Read MUX -->
          <g class="wire-group">
            <path class="wire-base"  d="M 155 165 L 245 165 L 245 432 L 560 432 L 560 365"/>
            <path class="wire-power ${a1 ? 'is-on' : ''}" d="M 155 165 L 245 165 L 245 432 L 560 432 L 560 365"/>
          </g>
          <g class="wire-group">
            <path class="wire-base"  d="M 155 335 L 218 335 L 218 456 L 608 456 L 608 345"/>
            <path class="wire-power ${a0 ? 'is-on' : ''}" d="M 155 335 L 218 335 L 218 456 L 608 456 L 608 345"/>
          </g>
          <!-- 4 Memory cells into MUX -->
          ${cellYs.map((y, idx) => {
            const val = !!game.sharedMemory[idx];
            const isSel = idx === addr;
            return `
              <rect class="gate-body ${isSel ? 'is-active' : ''}" x="310" y="${y - 34}" width="104" height="68" rx="16"/>
              <g class="wire-group">
                <path class="wire-base"  d="M 414 ${y} L 520 ${y}"/>
                <path class="wire-power ${val ? 'is-on' : ''}" d="M 414 ${y} L 520 ${y}"/>
                <path class="wire-pulse ${val && isSel ? 'is-on' : ''}" d="M 414 ${y} L 520 ${y}"/>
              </g>
            `;
          }).join('')}
          <!-- Output wire -->
          <g class="wire-group">
            <path class="wire-base"  d="M 650 240 L 780 240"/>
            <path class="wire-power ${outVal ? 'is-on' : ''}" d="M 650 240 L 780 240"/>
            <path class="wire-pulse ${outVal ? 'is-on' : ''}" d="M 650 240 L 780 240"/>
          </g>
          <!-- Read MUX Trapezoid -->
          <polygon class="gate-body ${outVal ? 'is-active' : ''}" points="520,72 650,142 650,338 520,408"/>
          <text class="bb-svg-label" x="582" y="232" text-anchor="middle">READ</text>
          <text class="bb-svg-sublabel" x="582" y="260" text-anchor="middle">${addr}ばん</text>
        `,
        extrasHtml: `
          ${cellYs.map((y, idx) => {
            const val = !!game.sharedMemory[idx];
            const isSel = idx === addr;
            return `
              <div class="toy-mini-led ${val ? 'is-on' : ''} ${isSel ? 'is-selected' : ''}"
                   style="left:${(362 / 900) * 100}%; top:${(y / 480) * 100}%; width:7.2%; --led-on:#FFF04D; --led-off:#17271E; --led-glow:rgba(255,240,77,0.95);">
                <div class="toy-mini-led-bulb"></div>
              </div>
            `;
          }).join('')}
          <div class="toy-led ${outVal ? 'is-on' : ''}"
               style="left:${(780 / 900) * 100}%; top:${(240 / 480) * 100}%; --led-on:#38E8FF; --led-off:#17271E; --led-glow:rgba(56,232,255,0.95);">
            ${renderSparklesSvg('#38E8FF')}
            <div class="toy-led-bulb"></div>
          </div>
        `,
        soundKey: `addr:${addr}|out:${outVal ? 1 : 0}`,
        onSoundChange: () => {
          if (outVal) game.sound.playLampOn('latch');
          else game.sound.playLampOff(false);
        }
      };
    }
  }
];

export default class BigBabiesGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;
    this.stageIndex = 0;
    this.sw = { r: false, y: false };
    this.dLatchQ = false;
    this.shiftBits = [false, false, false];
    this.muxInputs = [false, true, false, true];
    this.sharedMemory = [true, false, true, false];
    this.clkFlash = false;
    this.lastSoundKey = null;
    this.isTransitioning = false;
    this.onKeyDown = this.handleKeyDown.bind(this);
  }

  mount() {
    this.container.innerHTML = `
      <div class="lb-root" id="bb-root">
        ${renderPcbPatternSvg()}

        <div class="lb-stage-header">
          <div class="lb-stage-pill" id="bb-page-counter">1 / 6</div>
        </div>

        <div class="lb-title-area">
          <h2 class="lb-circuit-name" id="bb-circuit-name"></h2>
          <p class="lb-circuit-tip" id="bb-circuit-tip"></p>
        </div>

        <div class="lb-stage-viewport">
          <div class="lb-board" id="bb-board"></div>
        </div>

        <nav class="lb-nav" aria-label="ページきりかえ">
          <button class="nav-arrow-btn" id="bb-prev-btn" type="button" aria-label="まえの ページ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div class="lb-dots" id="bb-dots"></div>

          <button class="nav-arrow-btn" id="bb-next-btn" type="button" aria-label="つぎの ページ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </nav>
      </div>
    `;

    this.rootEl = this.container.querySelector('#bb-root');
    this.pcbEl = this.container.querySelector('.lb-pcb-bg');
    this.boardEl = this.container.querySelector('#bb-board');
    this.counterEl = this.container.querySelector('#bb-page-counter');
    this.nameEl = this.container.querySelector('#bb-circuit-name');
    this.tipEl = this.container.querySelector('#bb-circuit-tip');
    this.prevBtn = this.container.querySelector('#bb-prev-btn');
    this.nextBtn = this.container.querySelector('#bb-next-btn');
    this.dotsEl = this.container.querySelector('#bb-dots');

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
    this.loadStage(0);
  }

  unmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    this.container.innerHTML = '';
  }

  buildDots() {
    this.dotsEl.innerHTML = '';
    BIG_BABIES_STAGES.forEach((st, idx) => {
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
    if (nextIndex < 0 || nextIndex >= BIG_BABIES_STAGES.length) return;

    this.isTransitioning = true;
    this.sound.playPageTurn(direction);
    this.boardEl.classList.add(direction > 0 ? 'slide-out-left' : 'slide-out-right');

    setTimeout(() => {
      this.loadStage(nextIndex);
      this.boardEl.classList.remove('slide-out-left', 'slide-out-right');
      this.isTransitioning = false;
    }, 190);
  }

  loadStage(index) {
    this.stageIndex = index;
    const stage = BIG_BABIES_STAGES[index];
    this.sw = { r: false, y: false };
    this.clkFlash = false;
    this.lastSoundKey = null;

    this.app.setGameBackground(stage.bg);
    this.rootEl.classList.toggle('is-light-bg', !!stage.lightBg);
    this.pcbEl.classList.toggle('is-visible', !!stage.pcb);

    this.counterEl.textContent = `${index + 1} / ${BIG_BABIES_STAGES.length}`;
    this.nameEl.innerHTML = `<ruby>${stage.name}<rt>${stage.ruby}</rt></ruby>`;
    this.tipEl.textContent = stage.tip;

    this.prevBtn.classList.toggle('is-disabled', index === 0);
    this.nextBtn.classList.toggle('is-disabled', index === BIG_BABIES_STAGES.length - 1);

    Array.from(this.dotsEl.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    this.renderBoard(true);
  }

  renderBoard(silent = false) {
    const stage = BIG_BABIES_STAGES[this.stageIndex];
    const res = stage.renderStage(this);

    let switchesHtml = '';
    stage.switches.forEach((swCfg) => {
      const isOn = !!this.sw[swCfg.id];
      const leftPct = (swCfg.x / 900) * 100;
      const topPct = (swCfg.y / 480) * 100;
      const labelLeftPct = ((swCfg.x - 66) / 900) * 100;

      switchesHtml += `
        <div class="btn-side-label" style="left:${labelLeftPct}%; top:${topPct}%; color:${stage.lightBg ? '#3B2E00' : '#FFFFFF'};">
          <ruby>${swCfg.label}<rt style="color:${stage.lightBg ? '#5C4800' : 'rgba(255,255,255,0.88)'};">${swCfg.labelRuby}</rt></ruby>
        </div>
        <div class="toy-rocker sw-${swCfg.color} ${isOn ? 'is-on' : ''}"
             data-sw-id="${swCfg.id}"
             data-sw-color="${swCfg.color}"
             data-is-pulse="${swCfg.isPulseAction ? '1' : '0'}"
             style="left:${leftPct}%; top:${topPct}%;"
             role="switch"
             aria-checked="${isOn ? 'true' : 'false'}">
          <div class="toy-rocker-well">
            <div class="toy-rocker-paddle">
              <div class="rocker-mark-on"></div>
              <div class="rocker-mark-off"></div>
            </div>
          </div>
          <div class="rocker-state-pill">${swCfg.isPulseAction ? 'おす！' : (isOn ? 'ON' : 'OFF')}</div>
        </div>
      `;
    });

    this.boardEl.innerHTML = `
      <svg class="lb-circuit-svg" viewBox="0 0 900 480" aria-hidden="true">
        ${res.svg}
      </svg>
      ${switchesHtml}
      ${res.extrasHtml || ''}
    `;

    this.bindBoardInteractions();

    if (!silent && res.soundKey !== null && res.soundKey !== this.lastSoundKey) {
      if (res.onSoundChange) res.onSoundChange();
    }
    this.lastSoundKey = res.soundKey;
  }

  bindBoardInteractions() {
    const stage = BIG_BABIES_STAGES[this.stageIndex];

    // Rocker switches
    this.boardEl.querySelectorAll('.toy-rocker').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const swId = el.dataset.swId;
        const color = el.dataset.swColor;
        const isPulse = el.dataset.isPulse === '1';

        if (isPulse && stage.onPulse) {
          this.sw[swId] = true;
          this.clkFlash = true;
          this.sound.playRockerSwitch(true, color);
          stage.onPulse(this);
          this.renderBoard(false);
          setTimeout(() => {
            if (BIG_BABIES_STAGES[this.stageIndex] === stage) {
              this.sw[swId] = false;
              this.clkFlash = false;
              this.renderBoard(true);
            }
          }, 220);
        } else {
          this.sw[swId] = !this.sw[swId];
          this.sound.playRockerSwitch(this.sw[swId], color);
          this.renderBoard(false);
        }
      });
    });

    // Interactive tap nodes (MUX inputs & Memory cells)
    this.boardEl.querySelectorAll('.toy-tap-node').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const kind = el.dataset.tapKind;
        const idx = Number(el.dataset.tapIdx);
        if (kind === 'mux') {
          this.muxInputs[idx] = !this.muxInputs[idx];
          this.sound.playButtonDown('yellow');
          this.renderBoard(false);
        } else if (kind === 'mem') {
          this.sharedMemory[idx] = !this.sharedMemory[idx];
          this.sound.playMemoryWrite(this.sharedMemory[idx]);
          this.renderBoard(true);
        }
      });
    });

    // Action button (MEMORY WRITE)
    const writeBtn = this.boardEl.querySelector('[data-action="write-mem"]');
    if (writeBtn) {
      writeBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const addr = (this.sw.r ? 2 : 0) + (this.sw.y ? 1 : 0);
        this.sharedMemory[addr] = !this.sharedMemory[addr];
        this.sound.playMemoryWrite(this.sharedMemory[addr]);
        this.renderBoard(true);
        const freshBtn = this.boardEl.querySelector('[data-action="write-mem"]');
        if (freshBtn) {
          freshBtn.classList.add('is-pressed');
          setTimeout(() => freshBtn.classList.remove('is-pressed'), 140);
        }
      });
    }
  }

  handleKeyDown(e) {
    if (e.repeat) return;
    if (e.key === 'ArrowRight') this.goToStage(this.stageIndex + 1, 1);
    if (e.key === 'ArrowLeft')  this.goToStage(this.stageIndex - 1, -1);
  }
}
