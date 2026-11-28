// Lingokids / LogicLike matte-toy SVG assets for Register & Barcode Lab (レジ ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export const SHOP_ITEMS = [
  { id: 'apple',  name: 'りんご',       price: 100, color: '#F05A5B', accent: '#5CD68D' },
  { id: 'milk',   name: 'ぎゅうにゅう', price: 150, color: '#56CCF2', accent: '#FFFFFF' },
  { id: 'bread',  name: 'メロンパン',   price: 120, color: '#F7C948', accent: '#D99B26' },
  { id: 'cake',   name: 'ケーキ',       price: 250, color: '#FF8FB1', accent: '#FFFDF7' },
  { id: 'juice',  name: 'ジュース',     price: 110, color: '#FF9F5A', accent: '#FFF5D6' },
  { id: 'cookie', name: 'クッキー',     price: 180, color: '#D49A6A', accent: '#784922' }
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
    </defs>
  `;
}

/** Cute matte-toy grocery item with mini barcode tag (zero black outlines!) */
export function renderShopItemSvg(item, x, y, scanned = false) {
  let art = '';
  if (item.id === 'apple') {
    art = `
      <circle cx="0" cy="4" r="22" fill="${item.color}"/>
      <ellipse cx="-8" cy="-3" rx="5" ry="9" transform="rotate(-20 -8 -3)" fill="rgba(255,255,255,0.35)"/>
      <rect x="-2" y="-22" width="4" height="9" rx="2" fill="#9A6B3B"/>
      <ellipse cx="9" cy="-19" rx="9" ry="5" transform="rotate(-24 9 -19)" fill="${item.accent}"/>
    `;
  } else if (item.id === 'milk') {
    art = `
      <rect x="-17" y="-12" width="34" height="38" rx="6" fill="#FFFFFF"/>
      <polygon points="-17,-12 0,-26 17,-12" fill="${item.color}"/>
      <rect x="-17" y="4" width="34" height="14" fill="${item.color}"/>
      <circle cx="0" cy="11" r="4" fill="#FFFFFF"/>
    `;
  } else if (item.id === 'bread') {
    art = `
      <ellipse cx="0" cy="4" rx="25" ry="20" fill="${item.color}"/>
      <path d="M -14 -8 L 12 16 M 0 -12 L 20 8 M -18 4 L 2 20 M -12 16 L 14 -8 M -20 6 L 2 -12" stroke="${item.accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
    `;
  } else if (item.id === 'cake') {
    art = `
      <rect x="-22" y="-2" width="44" height="28" rx="7" fill="${item.accent}"/>
      <rect x="-22" y="8" width="44" height="7" fill="${item.color}"/>
      <circle cx="0" cy="-11" r="9" fill="#F05A5B"/>
      <ellipse cx="6" cy="-18" rx="5" ry="3" fill="#5CD68D"/>
    `;
  } else if (item.id === 'juice') {
    art = `
      <rect x="-15" y="-18" width="30" height="44" rx="8" fill="${item.color}"/>
      <rect x="-15" y="-4" width="30" height="16" fill="${item.accent}"/>
      <circle cx="0" cy="4" r="5" fill="${item.color}"/>
      <rect x="-8" y="-24" width="16" height="7" rx="3" fill="#FFFFFF"/>
    `;
  } else {
    art = `
      <circle cx="0" cy="4" r="22" fill="${item.color}"/>
      <circle cx="-8" cy="-2" r="3.5" fill="${item.accent}"/>
      <circle cx="8"  cy="-4" r="3.2" fill="${item.accent}"/>
      <circle cx="-4" cy="12" r="3.5" fill="${item.accent}"/>
      <circle cx="9"  cy="10" r="3"   fill="${item.accent}"/>
      <circle cx="1"  cy="3"  r="2.8" fill="${item.accent}"/>
    `;
  }

  return `
    <g data-act="scan-item" data-id="${item.id}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <!-- Soft porcelain shelf card -->
      <rect x="-46" y="-36" width="92" height="92" rx="20" fill="rgba(61,64,91,0.08)"/>
      <rect x="-46" y="-40" width="92" height="92" rx="20" fill="${scanned ? '#E8FFF1' : '#FFFFFF'}"/>
      ${art}
      <!-- Crisp mini barcode lines at bottom of item -->
      <g transform="translate(-14 34)">
        <rect x="0"  y="0" width="2.5" height="10" fill="#3D405B"/>
        <rect x="5"  y="0" width="1.5" height="10" fill="#3D405B"/>
        <rect x="9"  y="0" width="3"   height="10" fill="#3D405B"/>
        <rect x="14" y="0" width="1.5" height="10" fill="#3D405B"/>
        <rect x="18" y="0" width="2.5" height="10" fill="#3D405B"/>
        <rect x="23" y="0" width="3"   height="10" fill="#3D405B"/>
      </g>
      <!-- Price pill -->
      <rect x="14" y="-34" width="32" height="18" rx="9" fill="#F7C948"/>
      <text x="30" y="-21" text-anchor="middle" font-size="10" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${item.price}</text>
    </g>
  `;
}
