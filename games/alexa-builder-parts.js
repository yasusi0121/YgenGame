/* =========================================================================
   ALEXA BUILDER PARTS — Custom Flat-Design SVG Components for
   Echo Show 8 & Echo Dot (5th Gen: White / Black / Blue)
   Supports 3 modes: Assemble (くみたて), Wiring (はいせん), Repair (しゅうり)
   ========================================================================= */

export const DOT_COLORS = [
  { id: 'white', label: 'しろ', body: '#E2E8F0', fabric: '#F8FAFC', base: '#CBD5E1', stroke: '#94A3B8' },
  { id: 'black', label: 'くろ', body: '#27272A', fabric: '#3F3F46', base: '#18181B', stroke: '#09090B' },
  { id: 'blue',  label: 'あお', body: '#3B4D7A', fabric: '#51679E', base: '#1E293B', stroke: '#1E293B' }
];

export function renderAlexaPartSvg(kind, { dotColor = DOT_COLORS[0], powered = false, testMode = 'idle', timeStr = '2:06', broken = false } = {}) {
  const crackOverlay = broken ? `
    <path d="M-18 -14 L-4 2 L-12 12 L10 22" stroke="#EF4444" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M16 -16 L4 -2 L14 8" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <circle cx="0" cy="0" r="24" fill="rgba(239,68,68,0.16)" stroke="#EF4444" stroke-width="3" stroke-dasharray="6 4"/>
  ` : '';

  switch (kind) {
    case 'ai-chip':
      return `
        <rect x="-32" y="-32" width="64" height="64" rx="10" fill="#15803D" stroke="#14532D" stroke-width="3"/>
        <!-- Gold pins -->
        <line x1="-38" y1="-16" x2="-32" y2="-16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="-38" y1="0" x2="-32" y2="0" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="-38" y1="16" x2="-32" y2="16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="-16" x2="38" y2="-16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="0" x2="38" y2="0" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="16" x2="38" y2="16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <rect x="-20" y="-20" width="40" height="40" rx="6" fill="#1E293B" stroke="${powered ? '#38BDF8' : '#64748B'}" stroke-width="2.5"/>
        <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="900" fill="${powered ? '#38BDF8' : '#CBD5E1'}" font-family="sans-serif">AI</text>
        ${crackOverlay}
      `;

    case 'speaker':
      return `
        <circle cx="0" cy="0" r="34" fill="#334155" stroke="#0F172A" stroke-width="3"/>
        <circle cx="0" cy="0" r="26" fill="#475569" stroke="#64748B" stroke-width="2"/>
        <circle cx="0" cy="0" r="16" fill="#1E293B" stroke="${powered ? '#38BDF8' : '#94A3B8'}" stroke-width="2"/>
        <circle cx="0" cy="0" r="7" fill="${powered ? '#38BDF8' : '#64748B'}"/>
        <circle cx="-24" cy="-24" r="3" fill="#CBD5E1"/>
        <circle cx="24" cy="-24" r="3" fill="#CBD5E1"/>
        <circle cx="-24" cy="24" r="3" fill="#CBD5E1"/>
        <circle cx="24" cy="24" r="3" fill="#CBD5E1"/>
        ${crackOverlay}
      `;

    case 'mic-array':
      return `
        <rect x="-56" y="-14" width="112" height="28" rx="14" fill="#0F766E" stroke="#115E59" stroke-width="3"/>
        <circle cx="-36" cy="0" r="7" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
        <circle cx="-12" cy="0" r="7" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
        <circle cx="12" cy="0" r="7" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
        <circle cx="36" cy="0" r="7" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
        <circle cx="-36" cy="0" r="2.5" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="-12" cy="0" r="2.5" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="12" cy="0" r="2.5" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="36" cy="0" r="2.5" fill="${powered ? '#22C55E' : '#475569'}"/>
        ${crackOverlay}
      `;

    case 'led-ring': {
      const glow = powered
        ? (testMode === 'weather' ? '#FACC15' : (testMode === 'timer' ? '#FB923C' : (testMode === 'music' ? '#A855F7' : '#00D2FF')))
        : '#64748B';
      return `
        <ellipse cx="0" cy="0" rx="88" ry="18" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
        <ellipse cx="0" cy="0" rx="76" ry="11" fill="none" stroke="${glow}" stroke-width="${powered ? 8 : 5}"/>
        ${powered ? `<ellipse cx="0" cy="0" rx="76" ry="11" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>` : ''}
        ${crackOverlay}
      `;
    }

    case 'show-screen': {
      let content = '';
      if (powered) {
        if (testMode === 'weather') {
          content = `
            <rect x="-126" y="-82" width="252" height="164" rx="10" fill="#0284C7"/>
            <circle cx="-54" cy="-14" r="28" fill="#FFD12E" stroke="#F59E0B" stroke-width="4"/>
            <ellipse cx="36" cy="14" rx="44" ry="20" fill="#FFFFFF"/>
            <circle cx="20" cy="0" r="18" fill="#FFFFFF"/>
            <text x="0" y="60" text-anchor="middle" font-size="22" font-weight="900" fill="#FFFFFF" font-family="sans-serif">きょうは はれ 22°C</text>
          `;
        } else if (testMode === 'music') {
          content = `
            <rect x="-126" y="-82" width="252" height="164" rx="10" fill="#4C1D95"/>
            <rect x="-70" y="10" width="18" height="44" rx="5" fill="#38BDF8"/>
            <rect x="-40" y="-14" width="18" height="68" rx="5" fill="#FFD12E"/>
            <rect x="-10" y="-30" width="18" height="84" rx="5" fill="#4ADE80"/>
            <rect x="20" y="-8" width="18" height="62" rx="5" fill="#F472B6"/>
            <rect x="50" y="16" width="18" height="38" rx="5" fill="#38BDF8"/>
            <text x="0" y="-48" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="sans-serif">おんがく さいせいちゅう♪</text>
          `;
        } else if (testMode === 'timer') {
          content = `
            <rect x="-126" y="-82" width="252" height="164" rx="10" fill="#1E293B"/>
            <circle cx="0" cy="-6" r="52" fill="none" stroke="#38BDF8" stroke-width="8"/>
            <text id="ab-timer-text" x="0" y="10" text-anchor="middle" font-size="44" font-weight="900" fill="#FFFFFF" font-family="sans-serif">3</text>
            <text x="0" y="66" text-anchor="middle" font-size="16" font-weight="900" fill="#93C5FD" font-family="sans-serif">タイマー</text>
          `;
        } else {
          // Authentic ocean + clock wallpaper matching the Show 8 photo!
          content = `
            <rect x="-126" y="-82" width="252" height="164" rx="10" fill="#0B556B"/>
            <path d="M-126 42 Q-40 14 40 34 T126 24 L126 82 L-126 82 Z" fill="#0E7490"/>
            <path d="M24 82 Q68 22 126 42 L126 82 Z" fill="#38BDF8" opacity="0.45"/>
            <path d="M44 82 L64 46 L82 82 Z" fill="#0F172A" opacity="0.6"/>
            <path d="M74 82 L94 38 L114 82 Z" fill="#0F172A" opacity="0.7"/>
            <text x="-106" y="-36" font-size="38" font-weight="900" fill="#E0F2FE" font-family="sans-serif">${timeStr}</text>
            <circle cx="-96" cy="-14" r="7" fill="#BAE6FD"/>
            <text x="-82" y="-9" font-size="14" font-weight="800" fill="#BAE6FD" font-family="sans-serif">22°</text>
            <line x1="-116" y1="74" x2="116" y2="74" stroke="#00D2FF" stroke-width="6" stroke-linecap="round"/>
          `;
        }
      } else {
        content = `
          <rect x="-126" y="-82" width="252" height="164" rx="10" fill="#1E293B"/>
          <path d="M-92 -48 L-28 -74" stroke="rgba(255,255,255,0.16)" stroke-width="10" stroke-linecap="round"/>
        `;
      }
      return `
        <!-- White Echo Show 8 bezel -->
        <rect x="-146" y="-100" width="292" height="200" rx="22" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
        <circle cx="122" cy="-88" r="5" fill="#334155"/>
        ${content}
        ${crackOverlay}
      `;
    }

    case 'dot-shell':
      return `
        <circle cx="0" cy="0" r="108" fill="${dotColor.body}" stroke="${dotColor.stroke}" stroke-width="4"/>
        <path d="M-100 -10 A104 104 0 0 1 100 -10 Q0 24 -100 -10 Z" fill="${dotColor.fabric}" opacity="0.88"/>
        <!-- Subtle fabric mesh dots -->
        <circle cx="-46" cy="-34" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="-22" cy="-42" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="0" cy="-45" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="22" cy="-42" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="46" cy="-34" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <!-- Top 4 physical Echo Dot buttons (+, -, mic off, action) -->
        <g transform="translate(0, -84)">
          <circle cx="-32" cy="4" r="7" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>
          <line x1="-35" y1="4" x2="-29" y2="4" stroke="#334155" stroke-width="2"/>
          <circle cx="32" cy="4" r="7" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>
          <line x1="29" y1="4" x2="35" y2="4" stroke="#334155" stroke-width="2"/>
          <line x1="32" y1="1" x2="32" y2="7" stroke="#334155" stroke-width="2"/>
          <circle cx="0" cy="-6" r="7" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>
          <circle cx="0" cy="-6" r="2.6" fill="#334155"/>
          <circle cx="0" cy="12" r="7" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>
          <line x1="-3" y1="9" x2="3" y2="15" stroke="#EF4444" stroke-width="2"/>
        </g>
        ${crackOverlay}
      `;

    case 'power-plug':
      return `
        <path d="M-46 0 L-16 0" stroke="#F8FAFC" stroke-width="9" stroke-linecap="round"/>
        <rect x="-18" y="-15" width="32" height="30" rx="7" fill="#F8FAFC" stroke="#64748B" stroke-width="3"/>
        <rect x="14" y="-9" width="16" height="5" rx="2" fill="#FBBF24" stroke="#92400E" stroke-width="1.5"/>
        <rect x="14" y="4" width="16" height="5" rx="2" fill="#FBBF24" stroke="#92400E" stroke-width="1.5"/>
      `;

    default:
      return '';
  }
}

export const ALEXA_DEVICES = {
  show8: {
    id: 'show8',
    name: 'Echo Show 8',
    kana: 'がめん アレクサ',
    renderChassis() {
      return `
        <!-- Rear fabric trapezoid speaker enclosure -->
        <path d="M350 96 L432 132 Q450 228 408 292 L348 292 Z" fill="#CBD5E1" stroke="#64748B" stroke-width="4"/>
        <!-- Main cavity -->
        <rect x="104" y="92" width="292" height="200" rx="22" fill="#334155" stroke="#94A3B8" stroke-width="5"/>
        <!-- Outlet on right -->
        <rect x="470" y="176" width="54" height="56" rx="12" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3.5"/>
        <rect x="486" y="192" width="6" height="24" rx="2" fill="#334155"/>
        <rect x="502" y="192" width="6" height="24" rx="2" fill="#334155"/>
        <text x="497" y="250" text-anchor="middle" font-size="12" font-weight="900" fill="#E2E8F0" font-family="sans-serif">コンセント</text>
      `;
    },
    assembleParts: [
      { id: 'ai',      label: 'AIチップ',  kind: 'ai-chip',     x: 250, y: 192, r: 36, thumbBox: '-44 -44 88 88', req: null },
      { id: 'speaker', label: 'スピーカー', kind: 'speaker',     x: 164, y: 192, r: 36, thumbBox: '-42 -42 84 84', req: 'ai' },
      { id: 'mic',     label: 'マイク',    kind: 'mic-array',   x: 250, y: 120, r: 44, thumbBox: '-64 -24 128 48', req: 'speaker' },
      { id: 'screen',  label: 'がめん',    kind: 'show-screen', x: 250, y: 192, r: 120, thumbBox: '-156 -110 312 220', req: 'mic' },
      { id: 'plug',    label: 'でんげん',  kind: 'power-plug',  x: 472, y: 204, r: 42, thumbBox: '-52 -24 88 48', req: 'screen' }
    ],
    wireNodes: [
      { id: 'speaker', label: 'スピーカー', kind: 'speaker',   x: 152, y: 152, color: '#FACC15', dark: '#A16207', from: [250, 192], to: [152, 152] },
      { id: 'mic',     label: 'マイク',    kind: 'mic-array', x: 250, y: 118, color: '#4ADE80', dark: '#15803D', from: [250, 192], to: [250, 118] },
      { id: 'screen',  label: 'がめん',    kind: 'led-ring',  x: 250, y: 268, color: '#38BDF8', dark: '#0369A1', from: [250, 192], to: [250, 268] },
      { id: 'power',   label: 'でんげん',  kind: 'power-plug', x: 356, y: 192, color: '#F87171', dark: '#B91C1C', from: [250, 192], to: [356, 192] }
    ],
    repairs: [
      { targetId: 'speaker', symptom: 'おとが でないよ！ スピーカーを なおそう！', kind: 'speaker',   label: 'あたらしい スピーカー' },
      { targetId: 'mic',     symptom: 'こえが きこえないよ！ マイクを なおそう！', kind: 'mic-array', label: 'あたらしい マイク' },
      { targetId: 'screen',  symptom: 'がめんが まっくらだよ！ がめんを なおそう！', kind: 'show-screen', label: 'あたらしい がめん' }
    ]
  },

  dot: {
    id: 'dot',
    name: 'Echo Dot',
    kana: 'まるい アレクサ',
    renderChassis() {
      return `
        <!-- Spherical housing cavity -->
        <ellipse cx="260" cy="296" rx="92" ry="20" fill="#1E293B" stroke="#64748B" stroke-width="3.5"/>
        <circle cx="260" cy="186" r="112" fill="#334155" stroke="#94A3B8" stroke-width="5"/>
        <!-- Outlet on right -->
        <rect x="454" y="236" width="54" height="56" rx="12" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3.5"/>
        <rect x="470" y="252" width="6" height="24" rx="2" fill="#334155"/>
        <rect x="486" y="252" width="6" height="24" rx="2" fill="#334155"/>
        <text x="481" y="310" text-anchor="middle" font-size="12" font-weight="900" fill="#E2E8F0" font-family="sans-serif">コンセント</text>
      `;
    },
    assembleParts: [
      { id: 'led',     label: 'LEDリング',  kind: 'led-ring',   x: 260, y: 294, r: 54, thumbBox: '-94 -26 188 52', req: null },
      { id: 'ai',      label: 'AIチップ',   kind: 'ai-chip',    x: 260, y: 214, r: 36, thumbBox: '-44 -44 88 88', req: 'led' },
      { id: 'speaker', label: 'スピーカー', kind: 'speaker',    x: 260, y: 138, r: 36, thumbBox: '-42 -42 84 84', req: 'ai' },
      { id: 'shell',   label: 'カバー',     kind: 'dot-shell',  x: 260, y: 186, r: 108, thumbBox: '-116 -116 232 232', req: 'speaker' },
      { id: 'plug',    label: 'でんげん',   kind: 'power-plug', x: 456, y: 264, r: 42, thumbBox: '-52 -24 88 48', req: 'shell' }
    ],
    wireNodes: [
      { id: 'speaker', label: 'スピーカー', kind: 'speaker',   x: 260, y: 118, color: '#FACC15', dark: '#A16207', from: [260, 198], to: [260, 118] },
      { id: 'mic',     label: 'マイク',    kind: 'mic-array', x: 184, y: 184, color: '#4ADE80', dark: '#15803D', from: [260, 198], to: [184, 184] },
      { id: 'led',     label: 'LEDライト', kind: 'led-ring',  x: 260, y: 288, color: '#38BDF8', dark: '#0369A1', from: [260, 198], to: [260, 288] },
      { id: 'power',   label: 'でんげん',  kind: 'power-plug', x: 344, y: 198, color: '#F87171', dark: '#B91C1C', from: [260, 198], to: [344, 198] }
    ],
    repairs: [
      { targetId: 'speaker', symptom: 'おとが でないよ！ スピーカーを なおそう！', kind: 'speaker',  label: 'あたらしい スピーカー' },
      { targetId: 'led',     symptom: 'ライトが ひからないよ！ LEDを なおそう！', kind: 'led-ring', label: 'あたらしい LED' },
      { targetId: 'ai',      symptom: 'おへんじ できないよ！ AIチップを なおそう！', kind: 'ai-chip',  label: 'あたらしい AIチップ' }
    ]
  }
};
