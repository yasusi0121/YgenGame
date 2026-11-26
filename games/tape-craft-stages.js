// Data & flat-design SVG definitions for Tape Craft (ぺたぺた テープ クラフト)

export const TAPE_CATALOG = [
  { id: 'kraft',   name: 'クラフト',   color: '#C88D55', edge: '#A46A35', fiber: 'rgba(120,66,18,0.18)', pattern: 'kraft' },
  { id: 'red',     name: 'あか',       color: '#EF4444', edge: '#B91C1C', fiber: 'rgba(255,255,255,0.22)', pattern: 'solid' },
  { id: 'orange',  name: 'オレンジ',   color: '#F97316', edge: '#C2410C', fiber: 'rgba(255,255,255,0.22)', pattern: 'solid' },
  { id: 'yellow',  name: 'きいろ',     color: '#FACC15', edge: '#CA8A04', fiber: 'rgba(161,98,7,0.16)', pattern: 'solid' },
  { id: 'green',   name: 'みどり',     color: '#22C55E', edge: '#15803D', fiber: 'rgba(255,255,255,0.22)', pattern: 'solid' },
  { id: 'sky',     name: 'みずいろ',   color: '#38BDF8', edge: '#0284C7', fiber: 'rgba(255,255,255,0.24)', pattern: 'solid' },
  { id: 'blue',    name: 'あお',       color: '#3B82F6', edge: '#1D4ED8', fiber: 'rgba(255,255,255,0.22)', pattern: 'solid' },
  { id: 'pink',    name: 'ピンク',     color: '#F472B6', edge: '#BE185D', fiber: 'rgba(255,255,255,0.25)', pattern: 'solid' },
  { id: 'purple',  name: 'むらさき',   color: '#A855F7', edge: '#7E22CE', fiber: 'rgba(255,255,255,0.22)', pattern: 'solid' },
  { id: 'hazard',  name: 'しましま',   color: '#FACC15', edge: '#1E293B', fiber: 'rgba(0,0,0,0.1)', pattern: 'hazard' },
  { id: 'dots',    name: 'みずたま',   color: '#FB7185', edge: '#BE123C', fiber: 'rgba(255,255,255,0.25)', pattern: 'dots' },
  { id: 'stars',   name: 'ほし',       color: '#1E3A8A', edge: '#172554', fiber: 'rgba(255,255,255,0.2)', pattern: 'stars' },
  { id: 'rainbow', name: 'にじ',       color: '#F472B6', edge: '#9333EA', fiber: 'rgba(255,255,255,0.2)', pattern: 'rainbow' },
  { id: 'road',    name: 'どうろ',     color: '#475569', edge: '#1E293B', fiber: 'rgba(255,255,255,0.15)', pattern: 'road' }
];

export const TAPE_WIDTHS = [
  { id: 'wide',   label: 'ふとい', px: 42 },
  { id: 'narrow', label: 'ほそい', px: 24 }
];

/** Generate SVG <defs> patterns for specialty tapes */
export function buildTapeDefsSvg() {
  return `
    <defs>
      <pattern id="tc-pat-hazard" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="28" height="28" fill="#FACC15"/>
        <rect width="14" height="28" fill="#1E293B"/>
      </pattern>
      <pattern id="tc-pat-dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#FB7185"/>
        <circle cx="7" cy="7" r="4" fill="#FFF1F2"/>
        <circle cx="19" cy="19" r="4" fill="#FDE047"/>
      </pattern>
      <pattern id="tc-pat-stars" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="#1E3A8A"/>
        <polygon points="10,4 11.8,8.2 16.4,8.6 12.8,11.6 14,16 10,13.6 6,16 7.2,11.6 3.6,8.6 8.2,8.2" fill="#FDE047"/>
        <circle cx="25" cy="24" r="2.5" fill="#93C5FD"/>
      </pattern>
      <linearGradient id="tc-pat-rainbow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="22%" stop-color="#F97316"/>
        <stop offset="44%" stop-color="#FACC15"/>
        <stop offset="66%" stop-color="#22C55E"/>
        <stop offset="84%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#A855F7"/>
      </linearGradient>
      <pattern id="tc-pat-road" width="36" height="44" patternUnits="userSpaceOnUse">
        <rect width="36" height="44" fill="#475569"/>
        <rect x="0" y="2" width="36" height="3" fill="#CBD5E1"/>
        <rect x="0" y="39" width="36" height="3" fill="#CBD5E1"/>
        <rect x="6" y="20" width="16" height="4" rx="2" fill="#F8FAFC"/>
      </pattern>
      <pattern id="tc-pat-kraft" width="40" height="16" patternUnits="userSpaceOnUse">
        <rect width="40" height="16" fill="#C88D55"/>
        <line x1="0" y1="4" x2="40" y2="4" stroke="rgba(120,66,18,0.16)" stroke-width="1"/>
        <line x1="0" y1="11" x2="40" y2="11" stroke="rgba(255,245,230,0.16)" stroke-width="1"/>
      </pattern>
      <pattern id="tc-wood-bg" width="120" height="40" patternUnits="userSpaceOnUse">
        <rect width="120" height="40" fill="#F5E6D3"/>
        <line x1="0" y1="39" x2="120" y2="39" stroke="#E7CFAF" stroke-width="2"/>
        <path d="M0 16 Q60 12 120 18" stroke="#EBD6BC" stroke-width="1.5" fill="none"/>
      </pattern>
    </defs>
  `;
}

export function getTapeFill(tape) {
  if (tape.pattern === 'hazard') return 'url(#tc-pat-hazard)';
  if (tape.pattern === 'dots') return 'url(#tc-pat-dots)';
  if (tape.pattern === 'stars') return 'url(#tc-pat-stars)';
  if (tape.pattern === 'rainbow') return 'url(#tc-pat-rainbow)';
  if (tape.pattern === 'road') return 'url(#tc-pat-road)';
  if (tape.pattern === 'kraft') return 'url(#tc-pat-kraft)';
  return tape.color;
}

/** Render a flat-design tape roll icon whose outer ring shrinks with remaining ratio (0..1) */
export function renderRollIconSvg(tape, ratio = 1, size = 44) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const coreR = 9;
  const outerR = coreR + 3 + clamped * 12; // shrinks smoothly from 24 down to 12
  const fill = tape.pattern === 'rainbow' ? '#F472B6' : tape.color;
  const accent = tape.pattern === 'hazard'
    ? `<path d="M12 24 L24 12 M20 36 L36 20 M32 44 L44 32" stroke="#1E293B" stroke-width="3.5"/>`
    : tape.pattern === 'dots'
    ? `<circle cx="19" cy="18" r="2.4" fill="#FFF"/><circle cx="37" cy="20" r="2.4" fill="#FDE047"/><circle cx="28" cy="39" r="2.4" fill="#FFF"/>`
    : tape.pattern === 'stars'
    ? `<circle cx="18" cy="19" r="2.5" fill="#FDE047"/><circle cx="38" cy="22" r="2.2" fill="#FDE047"/><circle cx="28" cy="39" r="2.4" fill="#93C5FD"/>`
    : tape.pattern === 'rainbow'
    ? `<path d="M14 28 A14 14 0 0 1 42 28" stroke="#38BDF8" stroke-width="4" fill="none"/><path d="M18 28 A10 10 0 0 1 38 28" stroke="#FACC15" stroke-width="3.5" fill="none"/>`
    : tape.pattern === 'road'
    ? `<path d="M15 28 H22 M34 28 H41" stroke="#F8FAFC" stroke-width="2.5" stroke-linecap="round"/>`
    : '';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="${outerR.toFixed(1)}" fill="${fill}" stroke="${tape.edge}" stroke-width="2.5"/>
      ${clamped > 0.15 ? accent : ''}
      <!-- Cardboard inner core -->
      <circle cx="28" cy="28" r="${coreR}" fill="#E2C7A4" stroke="#9A7146" stroke-width="2.5"/>
      <circle cx="28" cy="28" r="6" fill="#FFFFFF"/>
      <!-- Little loose tape tab -->
      ${clamped > 0.05 ? `<rect x="${(28 + outerR - 4).toFixed(1)}" y="22" width="7" height="11" rx="2" fill="${fill}" stroke="${tape.edge}" stroke-width="1.8"/>` : ''}
    </svg>
  `;
}

/** Build a jagged hand-torn tape strip polygon centered at origin along +X axis (length L, width W) */
export function buildTornStripPath(length, width, seed = 1) {
  const L = Math.max(12, length);
  const hw = width / 2;
  const teeth = Math.max(3, Math.round(width / 8));
  const step = width / teeth;

  // Deterministic tiny jagged offsets from seed
  const j = (i, side) => {
    const v = Math.sin(seed * 12.9898 + i * 78.233 + side * 37.719) * 43758.5453;
    return (v - Math.floor(v)) * 4.5 + 1.5;
  };

  let d = `M 0 ${-hw.toFixed(1)} L ${L.toFixed(1)} ${-hw.toFixed(1)}`;
  // Right torn edge (top -> bottom)
  for (let i = 0; i < teeth; i++) {
    const yMid = -hw + (i + 0.5) * step;
    const yEnd = -hw + (i + 1) * step;
    const xTip = L + (i % 2 === 0 ? j(i, 1) : -j(i, 1) * 0.55);
    d += ` L ${xTip.toFixed(1)} ${yMid.toFixed(1)} L ${L.toFixed(1)} ${yEnd.toFixed(1)}`;
  }
  d += ` L 0 ${hw.toFixed(1)}`;
  // Left torn edge (bottom -> top)
  for (let i = teeth - 1; i >= 0; i--) {
    const yMid = -hw + (i + 0.5) * step;
    const yEnd = -hw + i * step;
    const xTip = -(i % 2 === 0 ? j(i, 2) : -j(i, 2) * 0.55);
    d += ` L ${xTip.toFixed(1)} ${yMid.toFixed(1)} L 0 ${yEnd.toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

/** Packing mode stages: cardboard boxes on a conveyor belt */
export const PACKING_STAGES = [
  {
    id: 'cat-box',
    name: 'くろねこ ぬいぐるみ',
    hint: 'まんなかの すきまを ペタッと とじよう！',
    seams: [{ x1: 245, y1: 255, x2: 555, y2: 255 }],
    renderOpen() {
      return `
        <!-- Box shadow -->
        <rect x="232" y="136" width="348" height="252" rx="18" fill="rgba(15,23,42,0.14)"/>
        <!-- Box body -->
        <rect x="225" y="125" width="350" height="260" rx="14" fill="#D4A373" stroke="#8B5A2B" stroke-width="5"/>
        <!-- Inner dark cavity showing cute plushie peeking out -->
        <rect x="242" y="218" width="316" height="74" rx="6" fill="#5C3A21"/>
        <!-- Cute black cat plushie peeking -->
        <g transform="translate(400 256)">
          <polygon points="-24,-10 -18,-30 -6,-14" fill="#1E293B"/>
          <polygon points="24,-10 18,-30 6,-14" fill="#1E293B"/>
          <circle cx="0" cy="-2" r="24" fill="#1E293B"/>
          <circle cx="-8" cy="-4" r="4" fill="#FDE047"/>
          <circle cx="8" cy="-4" r="4" fill="#FDE047"/>
          <polygon points="-3,4 3,4 0,8" fill="#F472B6"/>
        </g>
        <!-- Top & bottom flaps slightly parted -->
        <rect x="232" y="132" width="336" height="106" rx="6" fill="#E3B98D" stroke="#8B5A2B" stroke-width="3.5"/>
        <rect x="232" y="272" width="336" height="106" rx="6" fill="#DDA974" stroke="#8B5A2B" stroke-width="3.5"/>
        <!-- Fragile / label sticker -->
        <rect x="480" y="318" width="70" height="44" rx="6" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/>
        <path d="M495 332 H535 M495 344 H525" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
      `;
    },
    renderClosed() {
      return `
        <rect x="232" y="136" width="348" height="252" rx="18" fill="rgba(15,23,42,0.14)"/>
        <rect x="225" y="125" width="350" height="260" rx="14" fill="#D4A373" stroke="#8B5A2B" stroke-width="5"/>
        <rect x="232" y="132" width="336" height="122" rx="4" fill="#E3B98D" stroke="#8B5A2B" stroke-width="3"/>
        <rect x="232" y="256" width="336" height="122" rx="4" fill="#DDA974" stroke="#8B5A2B" stroke-width="3"/>
        <rect x="480" y="318" width="70" height="44" rx="6" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/>
        <path d="M495 332 H535 M495 344 H525" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
      `;
    }
  },
  {
    id: 'cake-box',
    name: 'いちご ケーキ',
    hint: 'たての すきまを ビリッと とじよう！',
    seams: [{ x1: 400, y1: 112, x2: 400, y2: 392 }],
    renderOpen() {
      return `
        <rect x="262" y="106" width="290" height="304" rx="18" fill="rgba(15,23,42,0.14)"/>
        <rect x="255" y="96" width="290" height="308" rx="14" fill="#FDE68A" stroke="#B45309" stroke-width="5"/>
        <rect x="364" y="108" width="72" height="284" rx="6" fill="#78350F"/>
        <!-- Strawberry cake peeking -->
        <g transform="translate(400 250)">
          <rect x="-26" y="-8" width="52" height="34" rx="6" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2.5"/>
          <rect x="-26" y="4" width="52" height="8" fill="#FB7185"/>
          <circle cx="0" cy="-16" r="11" fill="#EF4444"/>
          <path d="M-5 -25 L0 -20 L5 -25" stroke="#22C55E" stroke-width="3" stroke-linecap="round" fill="none"/>
        </g>
        <rect x="262" y="103" width="114" height="294" rx="6" fill="#FEF3C7" stroke="#B45309" stroke-width="3.5"/>
        <rect x="424" y="103" width="114" height="294" rx="6" fill="#FDE68A" stroke="#B45309" stroke-width="3.5"/>
      `;
    },
    renderClosed() {
      return `
        <rect x="262" y="106" width="290" height="304" rx="18" fill="rgba(15,23,42,0.14)"/>
        <rect x="255" y="96" width="290" height="308" rx="14" fill="#FDE68A" stroke="#B45309" stroke-width="5"/>
        <rect x="262" y="103" width="137" height="294" rx="4" fill="#FEF3C7" stroke="#B45309" stroke-width="3"/>
        <rect x="401" y="103" width="137" height="294" rx="4" fill="#FDE68A" stroke="#B45309" stroke-width="3"/>
      `;
    }
  },
  {
    id: 'car-box',
    name: 'おおきい くるま（Hはり）',
    hint: 'まんなかと りょうはしを がんじょうに！',
    seams: [
      { x1: 205, y1: 252, x2: 595, y2: 252 },
      { x1: 215, y1: 122, x2: 215, y2: 382 },
      { x1: 585, y1: 122, x2: 585, y2: 382 }
    ],
    renderOpen() {
      return `
        <rect x="196" y="120" width="420" height="276" rx="18" fill="rgba(15,23,42,0.14)"/>
        <rect x="190" y="110" width="420" height="284" rx="14" fill="#C99665" stroke="#7C4D23" stroke-width="5"/>
        <rect x="206" y="216" width="388" height="72" rx="6" fill="#523218"/>
        <!-- Red toy car peeking -->
        <g transform="translate(400 256)">
          <rect x="-42" y="-12" width="84" height="24" rx="8" fill="#EF4444"/>
          <path d="M-24 -12 L-14 -26 H16 L26 -12 Z" fill="#FCA5A5"/>
          <circle cx="-24" cy="14" r="10" fill="#1E293B"/>
          <circle cx="24" cy="14" r="10" fill="#1E293B"/>
        </g>
        <rect x="202" y="118" width="396" height="114" rx="6" fill="#DFB487" stroke="#7C4D23" stroke-width="3.5"/>
        <rect x="202" y="272" width="396" height="114" rx="6" fill="#D5A371" stroke="#7C4D23" stroke-width="3.5"/>
      `;
    },
    renderClosed() {
      return `
        <rect x="196" y="120" width="420" height="276" rx="18" fill="rgba(15,23,42,0.14)"/>
        <rect x="190" y="110" width="420" height="284" rx="14" fill="#C99665" stroke="#7C4D23" stroke-width="5"/>
        <rect x="202" y="118" width="396" height="133" rx="4" fill="#DFB487" stroke="#7C4D23" stroke-width="3"/>
        <rect x="202" y="253" width="396" height="133" rx="4" fill="#D5A371" stroke="#7C4D23" stroke-width="3"/>
      `;
    }
  },
  {
    id: 'gift-box',
    name: 'プレゼント（じゅうじ はり）',
    hint: 'たて と よこ を クロスで ペタペタ！',
    seams: [
      { x1: 240, y1: 252, x2: 560, y2: 252 },
      { x1: 400, y1: 108, x2: 400, y2: 396 }
    ],
    renderOpen() {
      return `
        <rect x="242" y="112" width="328" height="292" rx="20" fill="rgba(15,23,42,0.14)"/>
        <rect x="234" y="102" width="332" height="296" rx="16" fill="#FBCFE8" stroke="#BE185D" stroke-width="5"/>
        <rect x="366" y="220" width="68" height="64" rx="8" fill="#831843"/>
        <!-- Golden crown peeking -->
        <polygon points="376,264 382,236 394,250 400,232 406,250 418,236 424,264" fill="#FACC15" stroke="#B45309" stroke-width="2.5"/>
        <rect x="242" y="110" width="144" height="128" rx="6" fill="#FCE7F3" stroke="#BE185D" stroke-width="3"/>
        <rect x="414" y="110" width="144" height="128" rx="6" fill="#FCE7F3" stroke="#BE185D" stroke-width="3"/>
        <rect x="242" y="266" width="144" height="124" rx="6" fill="#F9A8D4" stroke="#BE185D" stroke-width="3"/>
        <rect x="414" y="266" width="144" height="124" rx="6" fill="#F9A8D4" stroke="#BE185D" stroke-width="3"/>
      `;
    },
    renderClosed() {
      return `
        <rect x="242" y="112" width="328" height="292" rx="20" fill="rgba(15,23,42,0.14)"/>
        <rect x="234" y="102" width="332" height="296" rx="16" fill="#FBCFE8" stroke="#BE185D" stroke-width="5"/>
        <rect x="242" y="110" width="316" height="280" rx="8" fill="#FCE7F3" stroke="#BE185D" stroke-width="3"/>
      `;
    }
  },
  {
    id: 'long-box',
    name: 'なが〜い はこ（きりん）',
    hint: 'はしから はしまで なが〜く のばそう！',
    seams: [{ x1: 120, y1: 252, x2: 680, y2: 252 }],
    renderOpen() {
      return `
        <rect x="108" y="168" width="596" height="184" rx="16" fill="rgba(15,23,42,0.14)"/>
        <rect x="100" y="158" width="600" height="188" rx="14" fill="#D4A373" stroke="#8B5A2B" stroke-width="5"/>
        <rect x="116" y="220" width="568" height="64" rx="6" fill="#5C3A21"/>
        <!-- Giraffe neck peeking -->
        <rect x="240" y="236" width="320" height="28" rx="12" fill="#FACC15"/>
        <circle cx="290" cy="250" r="7" fill="#B45309"/>
        <circle cx="360" cy="248" r="8" fill="#B45309"/>
        <circle cx="440" cy="252" r="7" fill="#B45309"/>
        <circle cx="536" cy="250" r="14" fill="#FACC15"/>
        <circle cx="540" cy="246" r="3" fill="#1E293B"/>
        <rect x="110" y="166" width="580" height="68" rx="5" fill="#E3B98D" stroke="#8B5A2B" stroke-width="3.5"/>
        <rect x="110" y="270" width="580" height="68" rx="5" fill="#DDA974" stroke="#8B5A2B" stroke-width="3.5"/>
      `;
    },
    renderClosed() {
      return `
        <rect x="108" y="168" width="596" height="184" rx="16" fill="rgba(15,23,42,0.14)"/>
        <rect x="100" y="158" width="600" height="188" rx="14" fill="#D4A373" stroke="#8B5A2B" stroke-width="5"/>
        <rect x="110" y="166" width="580" height="85" rx="4" fill="#E3B98D" stroke="#8B5A2B" stroke-width="3"/>
        <rect x="110" y="253" width="580" height="85" rx="4" fill="#DDA974" stroke="#8B5A2B" stroke-width="3"/>
      `;
    }
  }
];

/** Repair mode stages: broken items that come alive when taped up! */
export const REPAIR_STAGES = [
  {
    id: 'bridge',
    name: 'でんしゃの はし',
    hint: 'われた はしを テープで つなごう！',
    seams: [
      { x1: 315, y1: 270, x2: 485, y2: 270 },
      { x1: 315, y1: 315, x2: 485, y2: 315 }
    ],
    renderBase() {
      return `
        <!-- Sky & river -->
        <rect x="0" y="0" width="800" height="500" fill="#E0F2FE"/>
        <rect x="0" y="340" width="800" height="160" fill="#38BDF8"/>
        <path d="M40 390 Q100 375 160 390 T280 390 T400 390 T520 390 T640 390 T760 390" stroke="#BAE6FD" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Left & right banks -->
        <rect x="0" y="265" width="325" height="235" fill="#86EFAC" stroke="#15803D" stroke-width="4"/>
        <rect x="475" y="265" width="325" height="235" fill="#86EFAC" stroke="#15803D" stroke-width="4"/>
        <!-- Broken wooden bridge piers -->
        <rect x="20" y="260" width="315" height="68" rx="8" fill="#D97706" stroke="#78350F" stroke-width="4"/>
        <rect x="465" y="260" width="315" height="68" rx="8" fill="#D97706" stroke="#78350F" stroke-width="4"/>
        <!-- Broken jagged edges -->
        <polygon points="335,260 355,278 338,296 358,312 335,328" fill="#B45309"/>
        <polygon points="465,260 445,278 462,296 442,312 465,328" fill="#B45309"/>
        <!-- Rails -->
        <line x1="0" y1="274" x2="335" y2="274" stroke="#475569" stroke-width="6"/>
        <line x1="0" y1="312" x2="335" y2="312" stroke="#475569" stroke-width="6"/>
        <line x1="465" y1="274" x2="800" y2="274" stroke="#475569" stroke-width="6"/>
        <line x1="465" y1="312" x2="800" y2="312" stroke="#475569" stroke-width="6"/>
      `;
    },
    renderReward(t) {
      const x = -140 + t * 1080;
      return `
        <g transform="translate(${x.toFixed(1)} 228)">
          <rect x="0" y="0" width="128" height="58" rx="14" fill="#2563EB" stroke="#1E3A8A" stroke-width="4"/>
          <rect x="14" y="10" width="28" height="22" rx="4" fill="#BAE6FD"/>
          <rect x="50" y="10" width="28" height="22" rx="4" fill="#BAE6FD"/>
          <rect x="86" y="10" width="28" height="22" rx="4" fill="#BAE6FD"/>
          <rect x="0" y="38" width="128" height="8" fill="#FACC15"/>
          <circle cx="28" cy="58" r="11" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
          <circle cx="100" cy="58" r="11" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
        </g>
      `;
    }
  },
  {
    id: 'robot',
    name: 'ダンボール ロボット',
    hint: 'ロボットの ひびと うでを ペタペタ なおそう！',
    seams: [
      { x1: 318, y1: 270, x2: 482, y2: 270 },
      { x1: 235, y1: 235, x2: 310, y2: 235 }
    ],
    renderBase() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="#FEF9C3"/>
        <!-- Robot legs -->
        <rect x="330" y="368" width="46" height="90" rx="10" fill="#B45309" stroke="#78350F" stroke-width="4"/>
        <rect x="424" y="368" width="46" height="90" rx="10" fill="#B45309" stroke="#78350F" stroke-width="4"/>
        <!-- Right arm -->
        <rect x="498" y="212" width="88" height="44" rx="14" fill="#D4A373" stroke="#78350F" stroke-width="4"/>
        <!-- Left arm detached slightly -->
        <rect x="195" y="216" width="86" height="44" rx="14" fill="#D4A373" stroke="#78350F" stroke-width="4" transform="rotate(-12 240 238)"/>
        <!-- Robot body with crack -->
        <rect x="296" y="190" width="208" height="184" rx="18" fill="#E3B98D" stroke="#78350F" stroke-width="5"/>
        <path d="M306 270 L345 256 L386 284 L424 254 L466 282 L494 268" stroke="#451A03" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Robot head -->
        <rect x="328" y="64" width="144" height="114" rx="18" fill="#E3B98D" stroke="#78350F" stroke-width="5"/>
        <line x1="400" y1="64" x2="400" y2="34" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
        <circle cx="400" cy="28" r="12" fill="#EF4444" stroke="#78350F" stroke-width="3"/>
        <circle cx="368" cy="112" r="14" fill="#1E293B"/>
        <circle cx="432" cy="112" r="14" fill="#1E293B"/>
        <rect x="372" y="142" width="56" height="12" rx="6" fill="#78350F"/>
      `;
    },
    renderReward(t) {
      const glow = 0.5 + 0.5 * Math.sin(t * Math.PI * 6);
      return `
        <circle cx="368" cy="112" r="10" fill="#4ADE80" opacity="${glow.toFixed(2)}"/>
        <circle cx="432" cy="112" r="10" fill="#4ADE80" opacity="${glow.toFixed(2)}"/>
        <circle cx="400" cy="28" r="${(14 + glow * 8).toFixed(1)}" fill="none" stroke="#FACC15" stroke-width="5" opacity="${glow.toFixed(2)}"/>
        <path d="M372 142 Q400 162 428 142" stroke="#EF4444" stroke-width="6" fill="none" stroke-linecap="round"/>
      `;
    }
  },
  {
    id: 'pipe',
    name: 'みずもれ パイプ',
    hint: 'みずが もれている あなを テープで ふさごう！',
    seams: [
      { x1: 350, y1: 195, x2: 350, y2: 305 },
      { x1: 455, y1: 195, x2: 455, y2: 305 }
    ],
    renderBase() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="#ECFDF5"/>
        <!-- Main blue water pipe -->
        <rect x="40" y="210" width="720" height="80" rx="16" fill="#38BDF8" stroke="#0369A1" stroke-width="5"/>
        <rect x="40" y="222" width="720" height="18" fill="rgba(255,255,255,0.3)"/>
        <!-- Two cracks leaking water -->
        <path d="M350 212 L342 248 L358 272 L348 288" stroke="#0C4A6E" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M455 212 L464 246 L448 268 L456 288" stroke="#0C4A6E" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Water splashes -->
        <path d="M350 198 Q336 160 318 152 M350 198 Q364 154 382 146" stroke="#0EA5E9" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M455 198 Q440 158 422 148 M455 198 Q472 156 492 146" stroke="#0EA5E9" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Flower pot on the right waiting for water -->
        <rect x="650" y="340" width="74" height="62" rx="8" fill="#D97706" stroke="#78350F" stroke-width="4"/>
      `;
    },
    renderReward(t) {
      const s = Math.min(1, t * 1.6);
      return `
        <g transform="translate(687 340) scale(${s.toFixed(2)})">
          <line x1="0" y1="0" x2="0" y2="-68" stroke="#22C55E" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="-18" cy="-30" rx="16" ry="8" fill="#4ADE80" transform="rotate(-25 -18 -30)"/>
          <ellipse cx="18" cy="-36" rx="16" ry="8" fill="#4ADE80" transform="rotate(25 18 -36)"/>
          <circle cx="0" cy="-78" r="20" fill="#F472B6"/>
          <circle cx="-18" cy="-72" r="14" fill="#F472B6"/>
          <circle cx="18" cy="-72" r="14" fill="#F472B6"/>
          <circle cx="0" cy="-74" r="11" fill="#FACC15"/>
        </g>
      `;
    }
  },
  {
    id: 'book',
    name: 'やぶれた えほん',
    hint: 'ビリビリに やぶれた ページを なおそう！',
    seams: [{ x1: 400, y1: 118, x2: 400, y2: 382 }],
    renderBase() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="#FFF7ED"/>
        <!-- Open picture book -->
        <rect x="148" y="88" width="504" height="328" rx="18" fill="#EF4444" stroke="#991B1B" stroke-width="5"/>
        <rect x="164" y="102" width="224" height="300" rx="8" fill="#FFFBEB" stroke="#CBD5E1" stroke-width="3"/>
        <rect x="412" y="102" width="224" height="300" rx="8" fill="#FFFBEB" stroke="#CBD5E1" stroke-width="3"/>
        <!-- Torn zig-zag center spine -->
        <path d="M388 104 L404 134 L388 168 L408 202 L386 244 L408 286 L388 326 L406 364 L390 398" stroke="#78350F" stroke-width="5" fill="none"/>
        <!-- Cute sun & rainbow on pages -->
        <circle cx="255" cy="186" r="34" fill="#FACC15"/>
        <path d="M470 250 A58 58 0 0 1 586 250" stroke="#EF4444" stroke-width="12" fill="none"/>
        <path d="M482 250 A46 46 0 0 1 574 250" stroke="#38BDF8" stroke-width="12" fill="none"/>
      `;
    },
    renderReward(t) {
      const y = -t * 40;
      const op = 0.4 + 0.6 * Math.sin(t * Math.PI);
      return `
        <g transform="translate(400 ${(180 + y).toFixed(1)})" opacity="${op.toFixed(2)}">
          <polygon points="0,-24 7,-7 25,-7 10,4 16,22 0,11 -16,22 -10,4 -25,-7 -7,-7" fill="#FACC15" stroke="#B45309" stroke-width="2.5"/>
          <polygon points="-90,10 -86,20 -75,20 -84,27 -80,38 -90,31 -100,38 -96,27 -105,20 -94,20" fill="#F472B6"/>
          <polygon points="90,10 94,20 105,20 96,27 100,38 90,31 80,38 84,27 75,20 86,20" fill="#38BDF8"/>
        </g>
      `;
    }
  }
];

/** Free-play backgrounds */
export const FREE_BACKGROUNDS = [
  {
    id: 'desk',
    label: 'つくえ',
    render() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="url(#tc-wood-bg)"/>
        <rect x="28" y="24" width="744" height="452" rx="22" fill="#FFFDF7" stroke="#D6B98C" stroke-width="4"/>
      `;
    }
  },
  {
    id: 'house',
    label: 'ダンボール',
    render() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="#E0F2FE"/>
        <polygon points="120,210 400,56 680,210" fill="#C99665" stroke="#7C4D23" stroke-width="6" stroke-linejoin="round"/>
        <rect x="156" y="206" width="488" height="270" rx="8" fill="#DFB487" stroke="#7C4D23" stroke-width="6"/>
        <rect x="348" y="320" width="104" height="156" rx="10" fill="#B47B48" stroke="#7C4D23" stroke-width="4"/>
        <rect x="206" y="254" width="96" height="86" rx="8" fill="#FEF3C7" stroke="#7C4D23" stroke-width="4"/>
        <rect x="498" y="254" width="96" height="86" rx="8" fill="#FEF3C7" stroke="#7C4D23" stroke-width="4"/>
      `;
    }
  },
  {
    id: 'floor',
    label: 'ゆか',
    render() {
      return `
        <rect x="0" y="0" width="800" height="500" fill="url(#tc-wood-bg)"/>
        <rect x="40" y="34" width="720" height="432" rx="18" fill="none" stroke="rgba(180,130,80,0.35)" stroke-width="4" stroke-dasharray="14 10"/>
      `;
    }
  }
];
