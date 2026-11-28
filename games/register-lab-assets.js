// Lingokids / LogicLike matte-toy SVG assets for Register & Barcode Lab (レジ ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export const SHOP_ITEMS = [
  { id: 'apple',  name: 'りんご',       price: 100, color: '#F05A5B', accent: '#5CD68D' },
  { id: 'milk',   name: 'ぎゅうにゅう', price: 150, color: '#56CCF2', accent: '#FFFFFF' },
  { id: 'bread',  name: 'メロンパン',   price: 120, color: '#F7C948', accent: '#D99B26' },
  { id: 'cake',   name: 'ケーキ',       price: 250, color: '#FF8FB1', accent: '#FFFDF7' },
  { id: 'juice',  name: 'ジュース',     price: 110, color: '#FF9F5A', accent: '#FFF5D6' },
  { id: 'cookie', name: 'クッキー',     price: 180, color: '#D49A6A', accent: '#784922' },
  { id: 'banana', name: 'バナナ',       price: 130, color: '#FFE066', accent: '#C89B22' },
  { id: 'donut',  name: 'ドーナツ',     price: 140, color: '#FF8FB1', accent: '#E09F5A' }
];

export const CUSTOMERS = [
  { name: 'くまさん',   color: '#C88D55', ear: '#9E6A3B' },
  { name: 'うさぎさん', color: '#FFFFFF', ear: '#FF8FB1' },
  { name: 'ねこさん',   color: '#F7C948', ear: '#D9A320' },
  { name: 'かえるさん', color: '#5CD68D', ear: '#34A867' }
];

export function buildRegisterDefsSvg() {
  return `
    <defs>
      <linearGradient id="rl-mint" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6DD5C3"/>
        <stop offset="100%" stop-color="#45B5A2"/>
      </linearGradient>
      <linearGradient id="rl-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E5BC8B"/>
        <stop offset="100%" stop-color="#CC9A64"/>
      </linearGradient>
      <linearGradient id="rl-basket-in" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#56CCF2"/>
        <stop offset="100%" stop-color="#2F9BC4"/>
      </linearGradient>
      <linearGradient id="rl-basket-out" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5CD68D"/>
        <stop offset="100%" stop-color="#34A867"/>
      </linearGradient>
    </defs>
  `;
}

/** Draggable matte-toy grocery item with visible mini barcode label & scanned check */
export function renderDraggableItemSvg(item, x, y, { scale = 1, scanned = false, dragging = false } = {}) {
  let art = '';
  if (item.id === 'apple') {
    art = `
      <circle cx="0" cy="2" r="21" fill="${item.color}"/>
      <ellipse cx="-7" cy="-4" rx="4.5" ry="8" transform="rotate(-20 -7 -4)" fill="rgba(255,255,255,0.35)"/>
      <rect x="-2" y="-23" width="4" height="8" rx="2" fill="#9A6B3B"/>
      <ellipse cx="9" cy="-20" rx="8.5" ry="4.5" transform="rotate(-24 9 -20)" fill="${item.accent}"/>
    `;
  } else if (item.id === 'milk') {
    art = `
      <rect x="-15" y="-12" width="30" height="34" rx="6" fill="#FFFFFF"/>
      <polygon points="-15,-12 0,-25 15,-12" fill="${item.color}"/>
      <rect x="-15" y="3" width="30" height="12" fill="${item.color}"/>
      <circle cx="0" cy="9" r="3.5" fill="#FFFFFF"/>
    `;
  } else if (item.id === 'bread') {
    art = `
      <ellipse cx="0" cy="3" rx="23" ry="18" fill="${item.color}"/>
      <path d="M -12 -8 L 10 14 M 0 -11 L 18 7 M -16 3 L 2 18 M -10 14 L 12 -8" stroke="${item.accent}" stroke-width="2.4" stroke-linecap="round" opacity="0.65"/>
    `;
  } else if (item.id === 'cake') {
    art = `
      <rect x="-20" y="-2" width="40" height="25" rx="6" fill="${item.accent}"/>
      <rect x="-20" y="7" width="40" height="6" fill="${item.color}"/>
      <circle cx="0" cy="-10" r="8" fill="#F05A5B"/>
      <ellipse cx="5" cy="-16" rx="4.5" ry="2.5" fill="#5CD68D"/>
    `;
  } else if (item.id === 'juice') {
    art = `
      <rect x="-14" y="-17" width="28" height="40" rx="7" fill="${item.color}"/>
      <rect x="-14" y="-4" width="28" height="14" fill="${item.accent}"/>
      <circle cx="0" cy="3" r="4.5" fill="${item.color}"/>
      <rect x="-7" y="-23" width="14" height="6" rx="3" fill="#FFFFFF"/>
    `;
  } else if (item.id === 'banana') {
    art = `
      <path d="M -18 8 Q 0 24 20 -12 Q 12 -18 4 -8 Q -4 6 -16 0 Z" fill="${item.color}"/>
      <circle cx="17" cy="-12" r="3" fill="${item.accent}"/>
    `;
  } else if (item.id === 'donut') {
    art = `
      <circle cx="0" cy="2" r="20" fill="${item.accent}"/>
      <circle cx="0" cy="0" r="17" fill="${item.color}"/>
      <circle cx="0" cy="2" r="7" fill="#F6EFE4"/>
    `;
  } else {
    art = `
      <circle cx="0" cy="2" r="20" fill="${item.color}"/>
      <circle cx="-7" cy="-3" r="3" fill="${item.accent}"/>
      <circle cx="7"  cy="-4" r="2.8" fill="${item.accent}"/>
      <circle cx="-3" cy="10" r="3" fill="${item.accent}"/>
      <circle cx="8"  cy="8"  r="2.6" fill="${item.accent}"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(dragging ? scale * 1.15 : scale).toFixed(2)})">
      ${dragging ? `<ellipse cx="0" cy="34" rx="22" ry="7" fill="rgba(61,64,91,0.16)"/>` : ''}
      ${art}
      <!-- Crisp white barcode sticker on the item -->
      <rect x="-13" y="13" width="26" height="11" rx="3" fill="#FFFFFF"/>
      <g transform="translate(-10 15)">
        <rect x="0"  y="0" width="2"   height="7" fill="#3D405B"/>
        <rect x="4"  y="0" width="1.3" height="7" fill="#3D405B"/>
        <rect x="7"  y="0" width="2.5" height="7" fill="#3D405B"/>
        <rect x="11" y="0" width="1.3" height="7" fill="#3D405B"/>
        <rect x="14" y="0" width="2"   height="7" fill="#3D405B"/>
        <rect x="18" y="0" width="2.2" height="7" fill="#3D405B"/>
      </g>
      <!-- Green scanned checkmark badge once scanned! -->
      ${scanned ? `
        <g transform="translate(18 -16)">
          <circle cx="0" cy="0" r="10" fill="#34D399"/>
          <path d="M -4.5 0 L -1.2 3.5 L 5 -3.5" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      ` : ''}
    </g>
  `;
}

/** Cute customer head peeking behind counter */
export function renderCustomerHeadSvg(cust, x, y) {
  return `
    <g transform="translate(${x} ${y})">
      <circle cx="-16" cy="-16" r="8" fill="${cust.color}"/>
      <circle cx="16"  cy="-16" r="8" fill="${cust.color}"/>
      <circle cx="-16" cy="-16" r="4" fill="${cust.ear}"/>
      <circle cx="16"  cy="-16" r="4" fill="${cust.ear}"/>
      <circle cx="0"   cy="0"   r="22" fill="${cust.color}"/>
      <circle cx="-7"  cy="-2"  r="3"  fill="#3D405B"/>
      <circle cx="7"   cy="-2"  r="3"  fill="#3D405B"/>
      <path d="M -5 7 Q 0 12 5 7" fill="none" stroke="#3D405B" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `;
}
