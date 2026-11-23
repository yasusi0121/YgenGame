import { showCelebrationOverlay } from '../core/celebration.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function buildGearPath(cx, cy, outerR, innerR, teeth) {
  let d = '';
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.48;
    const a3 = a0 + step * 0.72;
    const pts = [
      [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR],
      [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR],
      [cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR],
      [cx + Math.cos(a3) * innerR, cy + Math.sin(a3) * innerR]
    ];
    d += (i === 0 ? `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : ` L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`)
      + ` L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`
      + ` L ${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}`
      + ` L ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
  }
  return d + ' Z';
}

function buildEscapeWheelPath(cx, cy, outerR, innerR, teeth = 15) {
  let d = '';
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.42;
    const a2 = a0 + step * 0.56;
    const a3 = a0 + step * 0.28;
    const pts = [
      [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR],
      [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR],
      [cx + Math.cos(a2) * (outerR - 1.5), cy + Math.sin(a2) * (outerR - 1.5)],
      [cx + Math.cos(a3) * (innerR + 2), cy + Math.sin(a3) * (innerR + 2)]
    ];
    d += (i === 0 ? `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : ` L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`)
      + ` L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`
      + ` L ${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}`
      + ` L ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
  }
  return d + ' Z';
}

function buildSpiralPath(cx, cy, turns, rStart, rEnd) {
  const steps = turns * 28;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const r = rStart + (rEnd - rStart) * t;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return d;
}

function renderPartSvg(kind, r = 36) {
  switch (kind) {
    case 'dial': {
      let ticks = '';
      for (let i = 0; i < 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180;
        const r1 = i % 3 === 0 ? 114 : 122;
        const r2 = 132;
        ticks += `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}" stroke="#1E293B" stroke-width="${i % 3 === 0 ? 5 : 2.5}" stroke-linecap="round"/>`;
      }
      return `
        <circle cx="0" cy="0" r="142" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="4"/>
        <circle cx="0" cy="0" r="134" fill="none" stroke="#E2E8F0" stroke-width="2"/>
        ${ticks}
        <text x="0" y="-86" text-anchor="middle" font-size="28" font-weight="900" fill="#1E293B" font-family="sans-serif">12</text>
        <text x="96" y="10" text-anchor="middle" font-size="28" font-weight="900" fill="#1E293B" font-family="sans-serif">3</text>
        <text x="0" y="108" text-anchor="middle" font-size="28" font-weight="900" fill="#1E293B" font-family="sans-serif">6</text>
        <text x="-96" y="10" text-anchor="middle" font-size="28" font-weight="900" fill="#1E293B" font-family="sans-serif">9</text>
        <circle cx="0" cy="0" r="8" fill="#D97706"/>
      `;
    }
    case 'hour':
      return `
        <rect x="-7" y="-76" width="14" height="86" rx="7" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
        <rect x="-3" y="-66" width="6" height="44" rx="3" fill="#F8FAFC"/>
        <circle cx="0" cy="0" r="11" fill="#1E293B" stroke="#F59E0B" stroke-width="3"/>
      `;
    case 'minute':
      return `
        <rect x="-5" y="-110" width="10" height="122" rx="5" fill="#334155" stroke="#0F172A" stroke-width="2"/>
        <rect x="-2" y="-98" width="4" height="64" rx="2" fill="#F8FAFC"/>
        <circle cx="0" cy="0" r="9" fill="#334155" stroke="#F8FAFC" stroke-width="2.5"/>
      `;
    case 'second':
      return `
        <line x1="0" y1="28" x2="0" y2="-118" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
        <circle cx="0" cy="22" r="6" fill="#EF4444"/>
        <circle cx="0" cy="0" r="7" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
      `;
    case 'crystal':
      return `
        <circle cx="0" cy="0" r="146" fill="rgba(186,230,253,0.18)" stroke="#F59E0B" stroke-width="8"/>
        <circle cx="0" cy="0" r="140" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="3"/>
        <path d="M -92 -72 Q -30 -122 52 -96" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="10" stroke-linecap="round"/>
        <path d="M -104 -46 Q -78 -72 -52 -84" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="6" stroke-linecap="round"/>
      `;
    case 'barrel': {
      const path = buildGearPath(0, 0, r + 5, r - 1, 24);
      const spiral = buildSpiralPath(0, 0, 3.2, 8, r - 10);
      return `
        <path d="${path}" fill="#D97706" stroke="#92400E" stroke-width="2"/>
        <circle cx="0" cy="0" r="${r - 4}" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
        <path d="${spiral}" fill="none" stroke="#1E3A8A" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="9" fill="#94A3B8" stroke="#475569" stroke-width="2"/>
        <circle cx="0" cy="0" r="3.5" fill="#E11D48"/>
      `;
    }
    case 'ratchet': {
      const path = buildGearPath(0, 0, r + 3, r - 3, 20);
      return `
        <path d="${path}" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
        <circle cx="0" cy="0" r="${r - 8}" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
        <circle cx="0" cy="0" r="8" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.8"/>
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#DBEAFE" stroke-width="2"/>
      `;
    }
    case 'click':
      return `
        <path d="M -16 -6 C -6 -16 14 -12 18 4 C 14 12 2 10 -4 4 L -16 8 Z" fill="#E2E8F0" stroke="#475569" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="-4" cy="-1" r="5" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.5"/>
        <line x1="-7" y1="-1" x2="-1" y2="-1" stroke="#DBEAFE" stroke-width="1.5"/>
      `;
    case 'wheel-gold':
    case 'wheel-brass':
    case 'wheel-silver': {
      const fill = kind === 'wheel-silver' ? '#CBD5E1' : (kind === 'wheel-brass' ? '#F59E0B' : '#FBBF24');
      const stroke = kind === 'wheel-silver' ? '#475569' : '#92400E';
      const teeth = Math.max(14, Math.round(r * 0.55));
      const path = buildGearPath(0, 0, r + 4, r - 2, teeth);
      const innerRim = r - 7;
      let spokes = '';
      for (let i = 0; i < 5; i++) {
        const a = (i * 72) * Math.PI / 180;
        spokes += `<line x1="0" y1="0" x2="${(Math.cos(a) * innerRim).toFixed(1)}" y2="${(Math.sin(a) * innerRim).toFixed(1)}" stroke="${fill}" stroke-width="4.5" stroke-linecap="round"/>`;
      }
      return `
        <path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="${innerRim}" fill="#1E293B" fill-opacity="0.22" stroke="${stroke}" stroke-width="1.6"/>
        ${spokes}
        <circle cx="0" cy="0" r="8" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="4" fill="#E11D48"/>
      `;
    }
    case 'escape': {
      const path = buildEscapeWheelPath(0, 0, r + 4, r - 5, 15);
      return `
        <path d="${path}" fill="#E2E8F0" stroke="#475569" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="0" cy="0" r="${r - 8}" fill="#0F172A" fill-opacity="0.25" stroke="#475569" stroke-width="1.6"/>
        <line x1="0" y1="${-(r - 8)}" x2="0" y2="${r - 8}" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="${-(r - 8)}" y1="0" x2="${r - 8}" y2="0" stroke="#CBD5E1" stroke-width="3"/>
        <circle cx="0" cy="0" r="6" fill="#F8FAFC" stroke="#475569" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="3" fill="#E11D48"/>
      `;
    }
    case 'pallet':
      return `
        <path d="M -22 -4 L 4 -4 L 16 -18 L 21 -14 L 10 0 L 21 14 L 16 18 L 4 4 L -22 4 Z" fill="#E2E8F0" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
        <rect x="13" y="-19" width="8" height="5" rx="1.5" transform="rotate(-35 17 -16)" fill="#E11D48"/>
        <rect x="13" y="14" width="8" height="5" rx="1.5" transform="rotate(35 17 16)" fill="#E11D48"/>
        <circle cx="2" cy="0" r="4.5" fill="#1E293B" stroke="#F8FAFC" stroke-width="1.5"/>
      `;
    case 'balance': {
      const spiral = buildSpiralPath(0, 0, 3.6, 7, r - 11);
      let weights = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * 45) * Math.PI / 180;
        weights += `<circle cx="${(Math.cos(a) * (r + 1)).toFixed(1)}" cy="${(Math.sin(a) * (r + 1)).toFixed(1)}" r="2.6" fill="#B45309"/>`;
      }
      return `
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="#F59E0B" stroke-width="6.5"/>
        <circle cx="0" cy="0" r="${r - 3.5}" fill="none" stroke="#FEF3C7" stroke-width="1.5"/>
        ${weights}
        <line x1="${-(r - 3)}" y1="0" x2="${r - 3}" y2="0" stroke="#F59E0B" stroke-width="4.5"/>
        <path class="wm-hairspring" d="${spiral}" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="8" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
        <circle cx="0" cy="0" r="4.2" fill="#E11D48"/>
      `;
    }
    case 'bridge':
      return `
        <path d="M -98 -44 C -40 -74 52 -74 92 -28 C 110 -8 106 54 66 84 C 34 106 -16 96 -34 62 C -50 32 -98 18 -98 -44 Z"
          fill="rgba(226,232,240,0.48)" stroke="#94A3B8" stroke-width="3.5"/>
        <circle cx="0" cy="0" r="9" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="0" cy="0" r="4.5" fill="#E11D48"/>
        <circle cx="66" cy="-46" r="7" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="66" cy="-46" r="3.8" fill="#E11D48"/>
        <circle cx="72" cy="36" r="7" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="72" cy="36" r="3.8" fill="#E11D48"/>
        <circle cx="-68" cy="-34" r="7" fill="#1D4ED8" stroke="#1E293B" stroke-width="2"/>
        <line x1="-73" y1="-34" x2="-63" y2="-34" stroke="#DBEAFE" stroke-width="1.8"/>
        <circle cx="52" cy="70" r="7" fill="#1D4ED8" stroke="#1E293B" stroke-width="2"/>
        <line x1="47" y1="70" x2="57" y2="70" stroke="#DBEAFE" stroke-width="1.8"/>
      `;
    default:
      return '';
  }
}

const STAGES = [
  {
    id: 'exterior',
    tabLabel: '1. がいけん',
    title: 'うでどけい の がいけん を つくろう！',
    clearTitle: 'とけい かんせい！',
    clearSub: 'じかん が チクタク うごきだしたよ！',
    plateStyle: 'case',
    parts: [
      { id: 'dial', label: 'もじばん', kind: 'dial', x: 280, y: 200, r: 142, thumbBox: '-155 -155 310 310', req: null },
      { id: 'hour', label: 'たんしん', kind: 'hour', x: 280, y: 200, r: 44, thumbBox: '-50 -90 100 115', req: 'dial', initAngle: -60 },
      { id: 'minute', label: 'ちょうしん', kind: 'minute', x: 280, y: 200, r: 52, thumbBox: '-50 -120 100 140', req: 'hour', initAngle: 60 },
      { id: 'second', label: 'びょうしん', kind: 'second', x: 280, y: 200, r: 52, thumbBox: '-50 -125 100 160', req: 'minute', initAngle: 0 },
      { id: 'crystal', label: 'がらす', kind: 'crystal', x: 280, y: 200, r: 146, thumbBox: '-160 -160 320 320', req: 'second' }
    ]
  },
  {
    id: 'geartrain',
    tabLabel: '2. はぐるま',
    title: 'とけい の なか の はぐるま を くみたてよう！',
    clearTitle: 'はぐるま かんせい！',
    clearSub: 'ぜんぶ の はぐるま が かみあって まわったよ！',
    plateStyle: 'mainplate',
    parts: [
      { id: 'barrel', label: 'こうばこ', kind: 'barrel', x: 190, y: 158, r: 45, thumbBox: '-56 -56 112 112', req: null, speed: 0.45 },
      { id: 'center', label: 'にばんしゃ', kind: 'wheel-gold', x: 280, y: 200, r: 41, thumbBox: '-52 -52 104 104', req: 'barrel', speed: -0.75 },
      { id: 'third', label: 'さんばんしゃ', kind: 'wheel-brass', x: 346, y: 154, r: 31, thumbBox: '-42 -42 84 84', req: 'center', speed: 1.15 },
      { id: 'fourth', label: 'よんばんしゃ', kind: 'wheel-silver', x: 356, y: 230, r: 29, thumbBox: '-40 -40 80 80', req: 'third', speed: -1.65 },
      { id: 'escape', label: 'がんぎしゃ', kind: 'escape', x: 296, y: 282, r: 24, thumbBox: '-34 -34 68 68', req: 'fourth', speed: 2.4 },
      { id: 'bridge', label: 'うけいた', kind: 'bridge', x: 280, y: 200, r: 72, thumbBox: '-110 -80 220 185', req: 'escape', speed: 0 }
    ]
  },
  {
    id: 'movement',
    tabLabel: '3. ほんもの',
    title: 'ほんもの の きかいしき ムーブメント に ちょうせん！',
    clearTitle: 'とけい しょくにん！',
    clearSub: 'てんぷ と あんくる が チクタク きざんでるよ！',
    plateStyle: 'caliber',
    parts: [
      { id: 'barrel', label: 'こうばこ', ruby: '香箱', kind: 'barrel', x: 190, y: 156, r: 44, thumbBox: '-54 -54 108 108', req: null, speed: 0.35 },
      { id: 'ratchet', label: 'かくあなぐるま', ruby: '角穴車', kind: 'ratchet', x: 190, y: 156, r: 28, thumbBox: '-38 -38 76 76', req: 'barrel', speed: 0.35 },
      { id: 'click', label: 'こはぜ', ruby: 'コハゼ', kind: 'click', x: 160, y: 132, r: 18, thumbBox: '-26 -24 52 48', req: 'ratchet', speed: 0 },
      { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 200, r: 41, thumbBox: '-52 -52 104 104', req: null, speed: -0.65 },
      { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-brass', x: 346, y: 152, r: 30, thumbBox: '-40 -40 80 80', req: 'center', speed: 1.05 },
      { id: 'fourth', label: 'よんばんしゃ', ruby: '四番車', kind: 'wheel-silver', x: 358, y: 224, r: 28, thumbBox: '-38 -38 76 76', req: 'third', speed: -1.55 },
      { id: 'escape', label: 'がんぎしゃ', ruby: 'ガンギ車', kind: 'escape', x: 306, y: 274, r: 22, thumbBox: '-32 -32 64 64', req: 'fourth', speed: 0 },
      { id: 'pallet', label: 'あんくる', ruby: 'アンクル', kind: 'pallet', x: 258, y: 274, r: 22, thumbBox: '-30 -26 60 52', req: 'escape', speed: 0 },
      { id: 'balance', label: 'てんぷ', ruby: 'テンプ', kind: 'balance', x: 206, y: 256, r: 37, thumbBox: '-46 -46 92 92', req: 'pallet', speed: 0 }
    ]
  }
];

export default class WatchMakerGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.sound = app.sound;

    this.stageIndex = 0;
    this.installed = new Set();
    this.completed = false;

    this.dragState = null;
    this.rafId = null;
    this.celebTimer = null;
    this.lastFrameTime = 0;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.escapeStepAngle = 0;
    this.gearAngles = {};

    this.boundMove = (e) => this.onPointerMove(e);
    this.boundUp = (e) => this.onPointerUp(e);
  }

  injectStyles() {
    if (document.getElementById('watch-maker-styles')) return;
    const style = document.createElement('style');
    style.id = 'watch-maker-styles';
    style.textContent = `
      .wm-root {
        width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center;
        padding: 10px 14px 12px; gap: 8px;
        user-select: none; -webkit-user-select: none;
        touch-action: none;
      }
      .wm-topbar {
        width: 100%; max-width: 820px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap;
        padding-left: 56px; padding-right: 56px;
      }
      .wm-progress-pill {
        background: rgba(255,255,255,0.14);
        border: 2px solid rgba(255,255,255,0.28);
        color: #FEF3C7;
        font-weight: 900; font-size: 15px;
        padding: 6px 14px; border-radius: 999px;
        white-space: nowrap;
      }
      .wm-banner {
        background: rgba(255,255,255,0.12);
        border: 2px solid rgba(255,255,255,0.2);
        color: #F8FAFC;
        font-size: clamp(15px, 2.2vw, 20px);
        font-weight: 900;
        padding: 6px 18px;
        border-radius: 999px;
        text-align: center;
      }
      .wm-stage-wrap {
        flex: 1 1 auto; min-height: 0;
        width: 100%; max-width: 720px;
        display: flex; align-items: center; justify-content: center;
        position: relative;
      }
      .wm-svg {
        width: 100%; height: 100%;
        max-height: 410px;
        filter: drop-shadow(0 12px 26px rgba(0,0,0,0.42));
      }
      .wm-tray {
        width: 100%; max-width: 860px;
        background: rgba(15, 23, 42, 0.72);
        border: 2.5px solid rgba(255,255,255,0.18);
        border-radius: 22px;
        padding: 10px 12px;
        display: flex; align-items: center; justify-content: center;
        gap: 10px; flex-wrap: wrap;
        min-height: 104px;
      }
      .wm-part-card {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        width: 96px; min-height: 84px;
        padding: 6px 6px 5px;
        background: #F8FAFC;
        border: 3px solid #CBD5E1;
        border-bottom: 6px solid #94A3B8;
        border-radius: 16px;
        cursor: grab;
        transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
        touch-action: none;
      }
      .wm-part-card:active { cursor: grabbing; transform: scale(0.95); }
      .wm-part-card.is-next {
        border-color: #F59E0B;
        border-bottom-color: #B45309;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.45);
        animation: wmPulseCard 1.4s ease-in-out infinite;
      }
      .wm-part-card.is-locked {
        opacity: 0.48;
        filter: grayscale(0.45);
      }
      .wm-part-card.is-dragging { opacity: 0.25; }
      .wm-part-label {
        font-size: 12px; font-weight: 900; color: #1E293B;
        line-height: 1.15; text-align: center; margin-top: 2px;
      }
      .wm-part-sub {
        font-size: 10px; font-weight: 700; color: #64748B;
      }
      .wm-ghost {
        position: fixed; pointer-events: none; z-index: 9999;
        transform: translate(-50%, -50%) scale(1.1);
        filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45));
      }
      .wm-target-pulse {
        animation: wmPulseRing 1.15s ease-in-out infinite;
      }
      .wm-replay-btn {
        background: #F59E0B; color: #FFFFFF;
        border: none; border-bottom: 5px solid #B45309;
        border-radius: 16px; padding: 10px 22px;
        font-size: 18px; font-weight: 900; cursor: pointer;
      }
      .wm-replay-btn:active { transform: translateY(2px); }
      @keyframes wmPulseCard {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes wmPulseRing {
        0%, 100% { opacity: 0.95; stroke-width: 4; }
        50% { opacity: 0.4; stroke-width: 2; }
      }
    `;
    document.head.appendChild(style);
  }

  mount() {
    this.injectStyles();
    this.app.setGameBackground('#1B2A41');
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'wm-root';
    root.innerHTML = `
      <div class="wm-topbar">
        <div class="pm-mode-tabs" id="wm-tabs">
          ${STAGES.map((st, idx) => `
            <button class="pm-tab-btn ${idx === this.stageIndex ? 'active' : ''}" data-idx="${idx}" type="button">${st.tabLabel}</button>
          `).join('')}
        </div>
        <div class="wm-progress-pill" id="wm-progress">0 / 5</div>
      </div>
      <div class="wm-banner" id="wm-banner"></div>
      <div class="wm-stage-wrap">
        <svg class="wm-svg" id="wm-svg" viewBox="0 0 560 400" aria-label="とけい くみたて"></svg>
      </div>
      <div class="wm-tray" id="wm-tray"></div>
    `;
    this.container.appendChild(root);

    this.rootEl = root;
    this.svgEl = root.querySelector('#wm-svg');
    this.trayEl = root.querySelector('#wm-tray');
    this.bannerEl = root.querySelector('#wm-banner');
    this.progressEl = root.querySelector('#wm-progress');

    root.querySelectorAll('#wm-tabs .pm-tab-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.idx);
        if (idx === this.stageIndex) return;
        this.sound.playPageTurn(1);
        this.loadStage(idx);
      });
    });

    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('pointercancel', this.boundUp);

    this.loadStage(0);
  }

  unmount() {
    this.stopAnimation();
    if (this.celebTimer) {
      clearTimeout(this.celebTimer);
      this.celebTimer = null;
    }
    this.clearDrag();
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('pointercancel', this.boundUp);
  }

  getStage() {
    return STAGES[this.stageIndex];
  }

  getNextPart() {
    const stage = this.getStage();
    return stage.parts.find((p) => !this.installed.has(p.id)) || null;
  }

  isPartUnlocked(part) {
    return !part.req || this.installed.has(part.req);
  }

  loadStage(index) {
    this.stopAnimation();
    if (this.celebTimer) {
      clearTimeout(this.celebTimer);
      this.celebTimer = null;
    }
    this.clearDrag();

    this.stageIndex = index;
    this.installed.clear();
    this.completed = false;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.escapeStepAngle = 0;
    this.gearAngles = {};

    this.rootEl.querySelectorAll('#wm-tabs .pm-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.idx) === index);
    });

    const existingOverlay = this.container.querySelector('.celeb-overlay');
    if (existingOverlay) existingOverlay.remove();

    this.renderAll();
  }

  renderAll() {
    const stage = this.getStage();
    this.progressEl.textContent = `${this.installed.size} / ${stage.parts.length}`;

    if (this.completed) {
      this.bannerEl.textContent = stage.clearSub;
    } else {
      const next = this.getNextPart();
      this.bannerEl.textContent = next
        ? `「${next.label}」 を ドラッグ して はめよう！`
        : stage.title;
    }

    this.renderWatchSvg();
    this.renderTray();
  }

  renderWatchSvg() {
    const stage = this.getStage();
    const nextPart = this.getNextPart();

    // Case & lugs & winding crown
    let plateSvg = '';
    if (stage.plateStyle === 'case') {
      plateSvg = `
        <circle cx="280" cy="200" r="144" fill="#334155" stroke="#94A3B8" stroke-width="4"/>
        <circle cx="280" cy="200" r="12" fill="#475569" stroke="#94A3B8" stroke-width="2"/>
      `;
    } else {
      const plateFill = stage.plateStyle === 'caliber' ? '#CBD5E1' : '#DCE4EE';
      const innerPlate = stage.plateStyle === 'caliber' ? '#94A3B8' : '#B8C5D6';
      plateSvg = `
        <circle cx="280" cy="200" r="150" fill="${plateFill}" stroke="#64748B" stroke-width="4"/>
        <circle cx="280" cy="200" r="138" fill="none" stroke="${innerPlate}" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="280" y="92" text-anchor="middle" font-size="11" font-weight="900" fill="#475569" letter-spacing="2" font-family="sans-serif">CAL. YGEN-01 • 17 JEWELS</text>
      `;
      // Draw recessed jewel bearings for each part position
      const seenPos = new Set();
      for (const p of stage.parts) {
        if (p.kind === 'bridge') continue;
        const key = `${p.x},${p.y}`;
        if (seenPos.has(key)) continue;
        seenPos.add(key);
        plateSvg += `
          <circle cx="${p.x}" cy="${p.y}" r="${Math.min(p.r + 3, 46)}" fill="#0F172A" fill-opacity="0.11"/>
          <circle cx="${p.x}" cy="${p.y}" r="8" fill="#F8FAFC" stroke="#64748B" stroke-width="1.8"/>
          <circle cx="${p.x}" cy="${p.y}" r="4.2" fill="#E11D48"/>
        `;
      }
    }

    // Installed parts in layer order
    let installedSvg = '';
    for (const p of stage.parts) {
      if (!this.installed.has(p.id)) continue;
      const angle = this.gearAngles[p.id] ?? p.initAngle ?? 0;
      installedSvg += `
        <g id="wm-part-${p.id}" transform="translate(${p.x} ${p.y}) rotate(${angle})">
          ${renderPartSvg(p.kind, p.r)}
        </g>
      `;
    }

    // Target snap guide ring for next part (or dragged part)
    let guideSvg = '';
    const activeTarget = this.dragState
      ? stage.parts.find((p) => p.id === this.dragState.partId)
      : nextPart;

    if (!this.completed && activeTarget) {
      const ringR = Math.min(Math.max(activeTarget.r, 24), 146);
      guideSvg = `
        <g class="wm-target-pulse" pointer-events="none">
          <circle cx="${activeTarget.x}" cy="${activeTarget.y}" r="${ringR}"
            fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="4" stroke-dasharray="10 7"/>
          <circle cx="${activeTarget.x}" cy="${activeTarget.y}" r="7" fill="#FBBF24"/>
        </g>
      `;
    }

    this.svgEl.innerHTML = `
      <!-- Top & bottom watch lugs + strap hint -->
      <rect x="218" y="8" width="124" height="58" rx="14" fill="#3B2F2F" stroke="#1E1B18" stroke-width="4"/>
      <rect x="218" y="334" width="124" height="58" rx="14" fill="#3B2F2F" stroke="#1E1B18" stroke-width="4"/>
      <path d="M 192 52 L 222 52 L 228 96 L 182 110 Z" fill="#94A3B8" stroke="#475569" stroke-width="3"/>
      <path d="M 368 52 L 338 52 L 332 96 L 378 110 Z" fill="#94A3B8" stroke="#475569" stroke-width="3"/>
      <path d="M 192 348 L 222 348 L 228 304 L 182 290 Z" fill="#94A3B8" stroke="#475569" stroke-width="3"/>
      <path d="M 368 348 L 338 348 L 332 304 L 378 290 Z" fill="#94A3B8" stroke="#475569" stroke-width="3"/>

      <!-- Winding crown (りゅうず) -->
      <rect x="434" y="182" width="24" height="36" rx="7" fill="#F59E0B" stroke="#92400E" stroke-width="3.5"/>
      <line x1="442" y1="186" x2="442" y2="214" stroke="#92400E" stroke-width="2.5"/>
      <line x1="450" y1="186" x2="450" y2="214" stroke="#92400E" stroke-width="2.5"/>

      <!-- Watch case bezel -->
      <circle cx="280" cy="200" r="164" fill="#CBD5E1" stroke="#475569" stroke-width="6"/>
      <circle cx="280" cy="200" r="154" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3"/>

      ${plateSvg}
      ${installedSvg}
      ${guideSvg}
    `;
  }

  renderTray() {
    const stage = this.getStage();
    const nextPart = this.getNextPart();

    if (this.completed) {
      this.trayEl.innerHTML = `
        <button class="wm-replay-btn" id="wm-replay-btn" type="button">もういっかい つくる</button>
      `;
      this.trayEl.querySelector('#wm-replay-btn').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.playPageTurn(1);
        this.loadStage(this.stageIndex);
      });
      return;
    }

    const remaining = stage.parts.filter((p) => !this.installed.has(p.id));
    this.trayEl.innerHTML = remaining.map((p) => {
      const unlocked = this.isPartUnlocked(p);
      const isNext = nextPart && nextPart.id === p.id;
      return `
        <div class="wm-part-card ${isNext ? 'is-next' : ''} ${unlocked ? '' : 'is-locked'}"
          data-part-id="${p.id}" role="button" aria-label="${p.label}">
          <svg width="52" height="52" viewBox="${p.thumbBox}">
            ${renderPartSvg(p.kind, p.r)}
          </svg>
          <div class="wm-part-label">${p.label}</div>
          ${p.ruby ? `<div class="wm-part-sub">${p.ruby}</div>` : ''}
        </div>
      `;
    }).join('');

    this.trayEl.querySelectorAll('.wm-part-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const partId = card.dataset.partId;
        const part = stage.parts.find((p) => p.id === partId);
        if (!part) return;
        if (!this.isPartUnlocked(part)) {
          this.sound.playGentleNudge();
          return;
        }
        this.startDrag(e, part, card);
      });
    });
  }

  startDrag(e, part, cardEl) {
    this.clearDrag();
    this.sound.playButtonDown();

    const ghost = document.createElement('div');
    ghost.className = 'wm-ghost';
    ghost.innerHTML = `
      <svg width="86" height="86" viewBox="${part.thumbBox}">
        ${renderPartSvg(part.kind, part.r)}
      </svg>
    `;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    cardEl.classList.add('is-dragging');
    this.dragState = { partId: part.id, ghost, cardEl };
    this.renderWatchSvg();
  }

  onPointerMove(e) {
    if (!this.dragState) return;
    this.dragState.ghost.style.left = `${e.clientX}px`;
    this.dragState.ghost.style.top = `${e.clientY}px`;
  }

  onPointerUp(e) {
    if (!this.dragState) return;
    const { partId } = this.dragState;
    const stage = this.getStage();
    const part = stage.parts.find((p) => p.id === partId);
    this.clearDrag();

    if (!part) return;

    const svgPt = this.clientToSvg(e.clientX, e.clientY);
    const dist = Math.hypot(svgPt.x - part.x, svgPt.y - part.y);
    const snapRadius = Math.max(66, Math.min(part.r + 24, 140));

    if (dist <= snapRadius) {
      this.installed.add(part.id);
      this.gearAngles[part.id] = part.initAngle ?? 0;
      this.sound.playMetalClick();

      if (this.installed.size === stage.parts.length) {
        this.onStageComplete();
      } else {
        this.renderAll();
      }
    } else {
      this.sound.playGentleNudge();
      this.renderWatchSvg();
    }
  }

  clearDrag() {
    if (!this.dragState) return;
    if (this.dragState.ghost) this.dragState.ghost.remove();
    if (this.dragState.cardEl) this.dragState.cardEl.classList.remove('is-dragging');
    this.dragState = null;
  }

  clientToSvg(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 560,
      y: ((clientY - rect.top) / rect.height) * 400
    };
  }

  onStageComplete() {
    this.completed = true;
    this.runTime = 0;
    this.lastBeatIndex = -1;
    this.renderAll();
    this.startWatchAnimation();

    const stage = this.getStage();
    const hasNext = this.stageIndex < STAGES.length - 1;
    this.celebTimer = setTimeout(() => {
      showCelebrationOverlay(this.container, {
        title: stage.clearTitle,
        subtitle: stage.clearSub,
        centerHtml: `
          <svg width="68" height="68" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="28" fill="#FEF3C7" stroke="#F59E0B" stroke-width="5"/>
            <line x1="40" y1="40" x2="40" y2="22" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="40" y1="40" x2="54" y2="40" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="40" cy="40" r="4.5" fill="#E11D48"/>
          </svg>
        `,
        btnLabel: hasNext ? 'つぎの レベルへ' : 'もういっかい つくる',
        sound: this.sound,
        onNext: () => {
          this.loadStage(hasNext ? this.stageIndex + 1 : 0);
        }
      });
    }, 2000);
  }

  startWatchAnimation() {
    this.stopAnimation();
    this.lastFrameTime = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = now;
      this.runTime += dt;

      const stage = this.getStage();

      if (stage.id === 'exterior') {
        const beat = Math.floor(this.runTime * 2);
        if (beat !== this.lastBeatIndex) {
          this.lastBeatIndex = beat;
          this.sound.playWatchTick(beat % 2 === 1);
          this.gearAngles.second = (beat * 6) % 360;
          this.gearAngles.minute = 60 + beat * 0.25;
          this.gearAngles.hour = -60 + beat * 0.02;
          this.updatePartTransform('second', 280, 200, this.gearAngles.second);
          this.updatePartTransform('minute', 280, 200, this.gearAngles.minute);
          this.updatePartTransform('hour', 280, 200, this.gearAngles.hour);
        }
      } else if (stage.id === 'geartrain') {
        const beat = Math.floor(this.runTime * 3);
        if (beat !== this.lastBeatIndex) {
          this.lastBeatIndex = beat;
          this.sound.playWatchTick(beat % 2 === 1);
        }
        for (const p of stage.parts) {
          if (!p.speed) continue;
          this.gearAngles[p.id] = ((this.gearAngles[p.id] || 0) + p.speed * 40 * dt) % 360;
          this.updatePartTransform(p.id, p.x, p.y, this.gearAngles[p.id]);
        }
      } else if (stage.id === 'movement') {
        // Real mechanical escapement: 2.5Hz balance oscillation (5 beats/sec)
        const freq = 2.0;
        const phase = this.runTime * freq * Math.PI * 2;
        const balanceAngle = Math.sin(phase) * 38;
        const beat = Math.floor(this.runTime * freq * 2);

        if (beat !== this.lastBeatIndex) {
          this.lastBeatIndex = beat;
          this.sound.playWatchTick(beat % 2 === 1);
          this.escapeStepAngle = (this.escapeStepAngle + 12) % 360;
        }

        const palletAngle = (beat % 2 === 0 ? -11 : 11);

        // Continuous gear train
        for (const p of stage.parts) {
          if (p.speed) {
            this.gearAngles[p.id] = ((this.gearAngles[p.id] || 0) + p.speed * 34 * dt) % 360;
            this.updatePartTransform(p.id, p.x, p.y, this.gearAngles[p.id]);
          }
        }

        // Stepped escape wheel, rocking pallet fork, oscillating balance wheel
        const esc = stage.parts.find((p) => p.id === 'escape');
        const pal = stage.parts.find((p) => p.id === 'pallet');
        const bal = stage.parts.find((p) => p.id === 'balance');
        if (esc) this.updatePartTransform('escape', esc.x, esc.y, this.escapeStepAngle);
        if (pal) this.updatePartTransform('pallet', pal.x, pal.y, palletAngle);
        if (bal) this.updatePartTransform('balance', bal.x, bal.y, balanceAngle);
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  updatePartTransform(partId, x, y, angle) {
    const el = this.svgEl && this.svgEl.querySelector(`#wm-part-${partId}`);
    if (el) {
      el.setAttribute('transform', `translate(${x} ${y}) rotate(${angle.toFixed(2)})`);
    }
  }

  stopAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
