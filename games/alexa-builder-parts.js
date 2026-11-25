/* =========================================================================
   ALEXA BUILDER PARTS — Detailed Multi-Step Hardware Components for
   Echo Show 8 (10 parts) & Echo Dot 5th Gen (10 parts, 3 colors)
   Includes 90/45-degree PCB wiring specs & multi-fault repair definitions.
   ========================================================================= */

export const DOT_COLORS = [
  { id: 'white', label: 'しろ', body: '#E2E8F0', fabric: '#F8FAFC', base: '#CBD5E1', stroke: '#94A3B8' },
  { id: 'black', label: 'くろ', body: '#27272A', fabric: '#3F3F46', base: '#18181B', stroke: '#09090B' },
  { id: 'blue',  label: 'あお', body: '#3B4D7A', fabric: '#51679E', base: '#1E293B', stroke: '#1E293B' }
];

/** Authentic 90deg / 45deg octilinear PCB wire path */
export function buildAlexaPcbPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 5 || Math.abs(dy) < 5) {
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  const midX = (x1 + x2) * 0.5;
  const s1 = midX >= x1 ? 1 : -1;
  const s2 = x2 >= midX ? 1 : -1;
  const sy = dy >= 0 ? 1 : -1;
  const ch = Math.min(18, Math.abs(dy) * 0.35, Math.abs(midX - x1) * 0.6);
  if (ch < 4) {
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${midX.toFixed(1)} ${y1.toFixed(1)} L ${midX.toFixed(1)} ${y2.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${(midX - s1 * ch).toFixed(1)} ${y1.toFixed(1)} L ${midX.toFixed(1)} ${(y1 + sy * ch).toFixed(1)} L ${midX.toFixed(1)} ${(y2 - sy * ch).toFixed(1)} L ${(midX + s2 * ch).toFixed(1)} ${y2.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function renderAlexaPartSvg(kind, { dotColor = DOT_COLORS[0], powered = false, testMode = 'idle', timeStr = '2:06', broken = false } = {}) {
  const crackOverlay = broken ? `
    <circle cx="0" cy="0" r="24" fill="rgba(239,68,68,0.22)" stroke="#EF4444" stroke-width="3.5" stroke-dasharray="6 4"/>
    <line x1="-12" y1="-12" x2="12" y2="12" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="12" y1="-12" x2="-12" y2="12" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round"/>
  ` : '';

  switch (kind) {
    case 'power-board':
      return `
        <rect x="-34" y="-22" width="68" height="44" rx="6" fill="#0F766E" stroke="#115E59" stroke-width="2.5"/>
        <circle cx="-16" cy="-4" r="10" fill="#1E3A8A" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="-21" y1="-4" x2="-11" y2="-4" stroke="#CBD5E1" stroke-width="2"/>
        <rect x="4" y="-12" width="20" height="24" rx="3" fill="#1E293B" stroke="#FBBF24" stroke-width="2"/>
        <text x="14" y="3" text-anchor="middle" font-size="9" font-weight="900" fill="#FDE68A" font-family="monospace">5V</text>
        ${crackOverlay}
      `;

    case 'ai-chip':
      return `
        <rect x="-32" y="-32" width="64" height="64" rx="8" fill="#15803D" stroke="#14532D" stroke-width="3"/>
        <line x1="-38" y1="-16" x2="-32" y2="-16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="-38" y1="0" x2="-32" y2="0" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="-38" y1="16" x2="-32" y2="16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="-16" x2="38" y2="-16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="0" x2="38" y2="0" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <line x1="32" y1="16" x2="38" y2="16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <rect x="-20" y="-20" width="40" height="40" rx="5" fill="#1E293B" stroke="${powered ? '#38BDF8' : '#64748B'}" stroke-width="2.5"/>
        <text x="0" y="6" text-anchor="middle" font-size="15" font-weight="900" fill="${powered ? '#38BDF8' : '#CBD5E1'}" font-family="monospace">AI</text>
        ${crackOverlay}
      `;

    case 'heatsink':
      return `
        <rect x="-30" y="-22" width="60" height="44" rx="5" fill="#CBD5E1" stroke="#475569" stroke-width="2.5"/>
        <line x1="-22" y1="-20" x2="-22" y2="20" stroke="#64748B" stroke-width="3.5"/>
        <line x1="-11" y1="-20" x2="-11" y2="20" stroke="#64748B" stroke-width="3.5"/>
        <line x1="0"   y1="-20" x2="0"   y2="20" stroke="#64748B" stroke-width="3.5"/>
        <line x1="11"  y1="-20" x2="11"  y2="20" stroke="#64748B" stroke-width="3.5"/>
        <line x1="22"  y1="-20" x2="22"  y2="20" stroke="#64748B" stroke-width="3.5"/>
        ${crackOverlay}
      `;

    case 'wifi-ant':
      return `
        <rect x="-26" y="-14" width="52" height="28" rx="5" fill="#1D4ED8" stroke="#1E3A8A" stroke-width="2.5"/>
        <path d="M-16 6 V-6 H-8 V6 H0 V-6 H8 V6 H16" fill="none" stroke="#FBBF24" stroke-width="3" stroke-linecap="square"/>
        <circle cx="-18" cy="0" r="3" fill="${powered ? '#4ADE80' : '#94A3B8'}"/>
        ${crackOverlay}
      `;

    case 'temp-sensor':
      return `
        <rect x="-22" y="-18" width="44" height="36" rx="6" fill="#334155" stroke="#94A3B8" stroke-width="2.2"/>
        <rect x="-5" y="-12" width="10" height="18" rx="5" fill="#E2E8F0"/>
        <circle cx="0" cy="8" r="6.5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5"/>
        <line x1="0" y1="6" x2="0" y2="-6" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round"/>
        ${crackOverlay}
      `;

    case 'camera-mod':
      return `
        <rect x="-24" y="-16" width="48" height="32" rx="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="5" fill="#38BDF8"/>
        <circle cx="3" cy="-3" r="1.8" fill="#FFFFFF"/>
        ${crackOverlay}
      `;

    case 'top-buttons':
      return `
        <rect x="-44" y="-14" width="88" height="28" rx="14" fill="#E2E8F0" stroke="#64748B" stroke-width="2.5"/>
        <circle cx="-27" cy="0" r="8" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
        <line x1="-30" y1="0" x2="-24" y2="0" stroke="#334155" stroke-width="2"/>
        <circle cx="-9" cy="0" r="8" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
        <circle cx="-9" cy="0" r="3" fill="#334155"/>
        <circle cx="9" cy="0" r="8" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
        <line x1="6" y1="-3" x2="12" y2="3" stroke="#EF4444" stroke-width="2"/>
        <circle cx="27" cy="0" r="8" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
        <line x1="24" y1="0" x2="30" y2="0" stroke="#334155" stroke-width="2"/>
        <line x1="27" y1="-3" x2="27" y2="3" stroke="#334155" stroke-width="2"/>
        ${crackOverlay}
      `;

    case 'speaker':
      return `
        <circle cx="0" cy="0" r="30" fill="#334155" stroke="#0F172A" stroke-width="3"/>
        <circle cx="0" cy="0" r="22" fill="#475569" stroke="#64748B" stroke-width="2"/>
        <circle cx="0" cy="0" r="13" fill="#1E293B" stroke="${powered ? '#38BDF8' : '#94A3B8'}" stroke-width="2"/>
        <circle cx="0" cy="0" r="6" fill="${powered ? '#38BDF8' : '#64748B'}"/>
        ${crackOverlay}
      `;

    case 'mic-array':
      return `
        <rect x="-52" y="-12" width="104" height="24" rx="12" fill="#0F766E" stroke="#115E59" stroke-width="2.5"/>
        <circle cx="-32" cy="0" r="6" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
        <circle cx="-10" cy="0" r="6" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
        <circle cx="10"  cy="0" r="6" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
        <circle cx="32"  cy="0" r="6" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
        <circle cx="-32" cy="0" r="2.2" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="-10" cy="0" r="2.2" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="10"  cy="0" r="2.2" fill="${powered ? '#22C55E' : '#475569'}"/>
        <circle cx="32"  cy="0" r="2.2" fill="${powered ? '#22C55E' : '#475569'}"/>
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
        <circle cx="-46" cy="-34" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="-22" cy="-42" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="0" cy="-45" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="22" cy="-42" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
        <circle cx="46" cy="-34" r="2.2" fill="${dotColor.stroke}" opacity="0.35"/>
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
        <path d="M350 96 L432 132 Q450 228 408 292 L348 292 Z" fill="#CBD5E1" stroke="#64748B" stroke-width="4"/>
        <rect x="104" y="92" width="292" height="200" rx="22" fill="#334155" stroke="#94A3B8" stroke-width="5"/>
        <rect x="470" y="176" width="54" height="56" rx="12" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3.5"/>
        <rect x="486" y="192" width="6" height="24" rx="2" fill="#334155"/>
        <rect x="502" y="192" width="6" height="24" rx="2" fill="#334155"/>
        <text x="497" y="250" text-anchor="middle" font-size="12" font-weight="900" fill="#E2E8F0" font-family="sans-serif">コンセント</text>
      `;
    },
    /* 10 authentic hardware components for Echo Show 8! */
    assembleParts: [
      { id: 'pwrboard', label: 'でんげんきばん', kind: 'power-board', x: 250, y: 256, r: 34, thumbBox: '-42 -28 84 56', req: null },
      { id: 'ai',       label: 'メインCPU',      kind: 'ai-chip',     x: 250, y: 188, r: 36, thumbBox: '-44 -44 88 88', req: 'pwrboard' },
      { id: 'heatsink', label: 'ヒートシンク',   kind: 'heatsink',    x: 250, y: 188, r: 34, thumbBox: '-38 -28 76 56', req: 'ai' },
      { id: 'wifi',     label: 'Wi-Fiアンテナ',  kind: 'wifi-ant',    x: 158, y: 256, r: 30, thumbBox: '-34 -22 68 44', req: 'heatsink' },
      { id: 'spkL',     label: 'ひだりスピーカー', kind: 'speaker',   x: 156, y: 182, r: 32, thumbBox: '-38 -38 76 76', req: 'wifi' },
      { id: 'spkR',     label: 'みぎスピーカー',  kind: 'speaker',    x: 344, y: 182, r: 32, thumbBox: '-38 -38 76 76', req: 'spkL' },
      { id: 'mic',      label: '4れんマイク',    kind: 'mic-array',   x: 222, y: 118, r: 42, thumbBox: '-60 -20 120 40', req: 'spkR' },
      { id: 'camera',   label: 'カメラ',         kind: 'camera-mod',  x: 346, y: 120, r: 28, thumbBox: '-30 -22 60 44', req: 'mic' },
      { id: 'screen',   label: 'えきしょうがめん', kind: 'show-screen', x: 250, y: 192, r: 120, thumbBox: '-156 -110 312 220', req: 'camera' },
      { id: 'plug',     label: 'でんげんプラグ',  kind: 'power-plug',  x: 472, y: 204, r: 42, thumbBox: '-52 -24 88 48', req: 'screen' }
    ],
    /* 6 authentic 90/45-degree internal flat cable routes */
    wireNodes: [
      { id: 'spkL',   label: 'ひだりおと', kind: 'speaker',   x: 148, y: 170, color: '#FFD12E', from: [216, 178], to: [148, 170] },
      { id: 'spkR',   label: 'みぎおと',   kind: 'speaker',   x: 352, y: 170, color: '#FB923C', from: [284, 178], to: [352, 170] },
      { id: 'mic',    label: 'マイク',   kind: 'mic-array',   x: 204, y: 118, color: '#4ADE80', from: [236, 158], to: [204, 118] },
      { id: 'camera', label: 'カメラ',   kind: 'camera-mod',  x: 344, y: 118, color: '#C084FC', from: [272, 158], to: [344, 118] },
      { id: 'wifi',   label: 'Wi-Fi',    kind: 'wifi-ant',    x: 158, y: 258, color: '#00D2FF', from: [226, 220], to: [158, 258] },
      { id: 'power',  label: 'でんげん', kind: 'power-board', x: 342, y: 258, color: '#FF3B4E', from: [274, 220], to: [342, 258] }
    ]
  },

  dot: {
    id: 'dot',
    name: 'Echo Dot',
    kana: 'まるい アレクサ',
    renderChassis() {
      return `
        <ellipse cx="260" cy="296" rx="92" ry="20" fill="#1E293B" stroke="#64748B" stroke-width="3.5"/>
        <circle cx="260" cy="186" r="112" fill="#334155" stroke="#94A3B8" stroke-width="5"/>
        <rect x="454" y="236" width="54" height="56" rx="12" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3.5"/>
        <rect x="470" y="252" width="6" height="24" rx="2" fill="#334155"/>
        <rect x="486" y="252" width="6" height="24" rx="2" fill="#334155"/>
        <text x="481" y="310" text-anchor="middle" font-size="12" font-weight="900" fill="#E2E8F0" font-family="sans-serif">コンセント</text>
      `;
    },
    /* 10 authentic hardware components for Echo Dot 5th Gen! */
    assembleParts: [
      { id: 'led',      label: 'LEDリング',      kind: 'led-ring',    x: 260, y: 294, r: 54, thumbBox: '-94 -26 188 52', req: null },
      { id: 'pwrboard', label: 'でんげんきばん', kind: 'power-board', x: 260, y: 252, r: 32, thumbBox: '-42 -28 84 56', req: 'led' },
      { id: 'ai',       label: 'メインCPU',      kind: 'ai-chip',     x: 260, y: 196, r: 34, thumbBox: '-44 -44 88 88', req: 'pwrboard' },
      { id: 'temp',     label: 'おんどセンサー', kind: 'temp-sensor', x: 192, y: 214, r: 26, thumbBox: '-28 -24 56 48', req: 'ai' },
      { id: 'wifi',     label: 'Wi-Fiアンテナ',  kind: 'wifi-ant',    x: 328, y: 214, r: 28, thumbBox: '-34 -22 68 44', req: 'temp' },
      { id: 'speaker',  label: 'おおきいスピーカー', kind: 'speaker', x: 260, y: 142, r: 32, thumbBox: '-38 -38 76 76', req: 'wifi' },
      { id: 'mic',      label: 'じょうぶマイク', kind: 'mic-array',   x: 260, y: 102, r: 38, thumbBox: '-60 -20 120 40', req: 'speaker' },
      { id: 'shell',    label: 'ファブリック',   kind: 'dot-shell',   x: 260, y: 186, r: 108, thumbBox: '-116 -116 232 232', req: 'mic' },
      { id: 'buttons',  label: '4れんボタン',    kind: 'top-buttons', x: 260, y: 106, r: 36, thumbBox: '-50 -20 100 40', req: 'shell' },
      { id: 'plug',     label: 'でんげんプラグ', kind: 'power-plug',  x: 456, y: 264, r: 42, thumbBox: '-52 -24 88 48', req: 'buttons' }
    ],
    wireNodes: [
      { id: 'speaker', label: 'スピーカー', kind: 'speaker',     x: 260, y: 112, color: '#FFD12E', from: [260, 166], to: [260, 112] },
      { id: 'temp',    label: 'おんど',     kind: 'temp-sensor', x: 176, y: 174, color: '#4ADE80', from: [228, 190], to: [176, 174] },
      { id: 'wifi',    label: 'Wi-Fi',      kind: 'wifi-ant',    x: 344, y: 174, color: '#C084FC', from: [292, 190], to: [344, 174] },
      { id: 'mic',     label: 'マイク',     kind: 'mic-array',   x: 184, y: 244, color: '#FB923C', from: [232, 214], to: [184, 244] },
      { id: 'led',     label: 'LEDリング',  kind: 'led-ring',    x: 260, y: 292, color: '#00D2FF', from: [260, 228], to: [260, 292] },
      { id: 'power',   label: 'でんげん',   kind: 'power-board', x: 336, y: 244, color: '#FF3B4E', from: [288, 214], to: [336, 244] }
    ]
  }
};
