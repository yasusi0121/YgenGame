// Lingokids / LogicLike matte-toy SVG assets for Washer Lab (せんたくき ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export const LAUNDRY_ITEMS = [
  { id: 'shirt', name: 'シャツ',   color: '#FF8FB1', accent: '#FFFFFF' },
  { id: 'pants', name: 'ズボン',   color: '#56CCF2', accent: '#2F9BC4' },
  { id: 'socks', name: 'くつした', color: '#F7C948', accent: '#FF9F5A' },
  { id: 'towel', name: 'タオル',   color: '#5CD68D', accent: '#E8FFF1' }
];

export const WASH_COURSES = [
  { id: 'standard', label: 'ひょうじゅん', deg: -40, washDur: 4.5, spinDur: 3.5 },
  { id: 'quick',    label: 'いそぎ',       deg: 0,   washDur: 2.6, spinDur: 2.4 },
  { id: 'spin',     label: 'だっすい',     deg: 40,  washDur: 0.4, spinDur: 3.8 }
];

export function buildWasherDefsSvg() {
  return `
    <defs>
      <linearGradient id="wl2-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#ECF2F7"/>
      </linearGradient>
      <linearGradient id="wl2-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#C6D2DF"/>
      </linearGradient>
      <radialGradient id="wl2-glass" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.42)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.08)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.22)"/>
      </radialGradient>
    </defs>
  `;
}

/** Cute matte-toy laundry garment (with mud spots when dirty, sparkles when clean!) */
export function renderLaundryItemSvg(item, x, y, scale = 1, rotDeg = 0, dirty = true) {
  let shape = '';
  if (item.id === 'shirt') {
    shape = `
      <path d="M -16 -22 L -28 -10 L -20 0 L -14 -6 V 20 H 14 V -6 L 20 0 L 28 -10 L 16 -22 Q 0 -14 -16 -22 Z" fill="${item.color}"/>
      <circle cx="0" cy="-2" r="5" fill="${item.accent}" opacity="0.85"/>
    `;
  } else if (item.id === 'pants') {
    shape = `
      <path d="M -15 -20 H 15 L 18 22 H 4 L 0 0 L -4 22 H -18 Z" fill="${item.color}"/>
      <rect x="-15" y="-20" width="30" height="6" rx="2" fill="${item.accent}"/>
    `;
  } else if (item.id === 'socks') {
    shape = `
      <path d="M -6 -20 H 8 V 4 L 18 12 Q 20 20 12 22 L -4 14 Q -8 10 -6 4 Z" fill="${item.color}"/>
      <rect x="-6" y="-20" width="14" height="6" rx="2" fill="${item.accent}"/>
    `;
  } else {
    shape = `
      <rect x="-18" y="-16" width="36" height="32" rx="8" fill="${item.color}"/>
      <rect x="-18" y="4" width="36" height="7" fill="${item.accent}" opacity="0.85"/>
    `;
  }

  const mud = dirty ? `
    <circle cx="-6" cy="5" r="4.5" fill="#9C6B3B" opacity="0.72"/>
    <circle cx="6"  cy="-4" r="3.5" fill="#9C6B3B" opacity="0.65"/>
  ` : `
    <polygon points="14,-18 16,-13 21,-11 16,-9 14,-4 12,-9 7,-11 12,-13" fill="#FFF3A1"/>
  `;

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${scale.toFixed(2)})">
      ${shape}
      ${mud}
    </g>
  `;
}
