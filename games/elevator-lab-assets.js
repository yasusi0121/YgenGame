// Lingokids / LogicLike matte-toy SVG assets for Elevator Lab (エレベーター ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export const FLOORS = [
  { num: 5, label: '5F', name: 'てんぼうだい', color: '#F7C948', y: 84 },
  { num: 4, label: '4F', name: 'おもちゃ',     color: '#FF8FB1', y: 162 },
  { num: 3, label: '3F', name: 'ほんや',       color: '#5CD68D', y: 240 },
  { num: 2, label: '2F', name: 'カフェ',       color: '#FF9F5A', y: 318 },
  { num: 1, label: '1F', name: 'げんかん',     color: '#56CCF2', y: 396 }
];

export const PASSENGERS = [
  { id: 'bear',   name: 'くま',   color: '#C88D55', ear: '#9E6A3B', belly: '#F5DEC0' },
  { id: 'rabbit', name: 'うさぎ', color: '#FFFFFF', ear: '#FF8FB1', belly: '#FFF0F5' },
  { id: 'cat',    name: 'ねこ',   color: '#F7C948', ear: '#D9A320', belly: '#FFF8D6' },
  { id: 'frog',   name: 'かえる', color: '#5CD68D', ear: '#34A867', belly: '#E2FCEB' }
];

export function buildElevatorDefsSvg() {
  return `
    <defs>
      <linearGradient id="el-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFE082"/>
        <stop offset="100%" stop-color="#E5A931"/>
      </linearGradient>
      <linearGradient id="el-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#D2DCE6"/>
      </linearGradient>
      <linearGradient id="el-cabin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFDF7"/>
        <stop offset="100%" stop-color="#EFE7D8"/>
      </linearGradient>
      <linearGradient id="el-door" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#DDE6F0"/>
        <stop offset="50%" stop-color="#F2F6FA"/>
        <stop offset="100%" stop-color="#CBD6E2"/>
      </linearGradient>
    </defs>
  `;
}

/** Cute matte-toy animal passenger (zero black outlines!) */
export function renderPassengerSvg(p, x, y, scale = 1, targetFloor = null) {
  let head = '';
  if (p.id === 'rabbit') {
    head = `
      <ellipse cx="-7" cy="-24" rx="4.5" ry="12" fill="${p.color}"/>
      <ellipse cx="7"  cy="-24" rx="4.5" ry="12" fill="${p.color}"/>
      <ellipse cx="-7" cy="-24" rx="2.2" ry="8"  fill="${p.ear}"/>
      <ellipse cx="7"  cy="-24" rx="2.2" ry="8"  fill="${p.ear}"/>
    `;
  } else if (p.id === 'cat') {
    head = `
      <polygon points="-13,-12 -10,-24 -2,-15" fill="${p.color}"/>
      <polygon points="13,-12 10,-24 2,-15" fill="${p.color}"/>
    `;
  } else if (p.id === 'frog') {
    head = `
      <circle cx="-8" cy="-16" r="5.5" fill="${p.color}"/>
      <circle cx="8"  cy="-16" r="5.5" fill="${p.color}"/>
    `;
  } else {
    head = `
      <circle cx="-11" cy="-16" r="5.5" fill="${p.color}"/>
      <circle cx="11"  cy="-16" r="5.5" fill="${p.color}"/>
      <circle cx="-11" cy="-16" r="2.8" fill="${p.ear}"/>
      <circle cx="11"  cy="-16" r="2.8" fill="${p.ear}"/>
    `;
  }

  const badge = targetFloor ? `
    <g transform="translate(20 -26)">
      <circle cx="0" cy="2" r="12" fill="rgba(0,0,0,0.14)"/>
      <circle cx="0" cy="0" r="12" fill="${FLOORS.find((f) => f.num === targetFloor)?.color || '#F7C948'}"/>
      <text x="0" y="4.5" text-anchor="middle" font-size="11" font-weight="900" fill="#2D3436" font-family="${FONT_ROUND}">${targetFloor}</text>
    </g>
  ` : '';

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(2)})">
      <rect x="-12" y="-2" width="24" height="22" rx="10" fill="${p.color}"/>
      <ellipse cx="0" cy="10" rx="7" ry="8" fill="${p.belly}"/>
      ${head}
      <circle cx="0" cy="-8" r="13.5" fill="${p.color}"/>
      <circle cx="-4.5" cy="-9" r="2.1" fill="#3D405B"/>
      <circle cx="4.5"  cy="-9" r="2.1" fill="#3D405B"/>
      <ellipse cx="0" cy="-4.5" rx="3" ry="2" fill="${p.ear}"/>
      ${badge}
    </g>
  `;
}

/** Top traction machine room: spinning sheave pulley + motor */
export function renderSheaveSvg(cx, cy, angleDeg = 0) {
  const spokes = [0, 60, 120, 180, 240, 300].map((a) => `
    <line x1="0" y1="0" x2="0" y2="-21" stroke="#C48B1C" stroke-width="4" stroke-linecap="round" transform="rotate(${a})"/>
  `).join('');
  return `
    <g transform="translate(${cx} ${cy})">
      <circle cx="0" cy="0" r="26" fill="#C48B1C"/>
      <g transform="rotate(${angleDeg.toFixed(1)})">
        <circle cx="0" cy="0" r="23" fill="url(#el-brass)"/>
        <circle cx="0" cy="0" r="18" fill="#254257"/>
        ${spokes}
        <circle cx="0" cy="0" r="7" fill="#FFFFFF"/>
      </g>
    </g>
  `;
}
