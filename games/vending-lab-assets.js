// Lingokids / LogicLike matte-toy SVG assets for Vending Lab (ジハンキ ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export const DRINKS = [
  { id: 'cider',  name: 'サイダー',     price: 110, temp: 'cold', shape: 'can',    body: '#56CCF2', dark: '#2F9BC4', accent: '#FFFFFF', label: 'CIDER' },
  { id: 'orange', name: 'オレンジ',     price: 120, temp: 'cold', shape: 'pet',    body: '#FF9F5A', dark: '#D97732', accent: '#FFF5D6', label: 'ORANGE' },
  { id: 'tea',    name: 'おちゃ',       price: 130, temp: 'cold', shape: 'pet',    body: '#5CD68D', dark: '#34A867', accent: '#E8FFF1', label: 'TEA' },
  { id: 'cola',   name: 'コーラ',       price: 140, temp: 'cold', shape: 'can',    body: '#F05A5B', dark: '#C43B3C', accent: '#FFFFFF', label: 'COLA' },
  { id: 'milk',   name: 'いちごミルク', price: 120, temp: 'cold', shape: 'bottle', body: '#FF8FB1', dark: '#D66388', accent: '#FFF3F7', label: 'MILK' },
  { id: 'soup',   name: 'コーンスープ', price: 130, temp: 'hot',  shape: 'can',    body: '#F7C948', dark: '#D19D1E', accent: '#FFFBE6', label: 'CORN' }
];

export const COINS = [
  { value: 10,  label: '10',  r: 20, fill: '#E0925C', lip: '#B86B38', shine: 'rgba(255,255,255,0.45)', hole: false },
  { value: 50,  label: '50',  r: 18, fill: '#E6EDF4', lip: '#B3C1D1', shine: 'rgba(255,255,255,0.75)', hole: true },
  { value: 100, label: '100', r: 22, fill: '#E6EDF4', lip: '#B3C1D1', shine: 'rgba(255,255,255,0.75)', hole: false },
  { value: 500, label: '500', r: 24, fill: '#F7CE5B', lip: '#CFA02A', shine: 'rgba(255,255,255,0.6)',  hole: false }
];

export function buildVendingDefsSvg() {
  return `
    <defs>
      <linearGradient id="vl-body" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="88%" stop-color="#FAFBFD"/>
        <stop offset="100%" stop-color="#EBF0F5"/>
      </linearGradient>
      <linearGradient id="vl-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#C8D3DF"/>
      </linearGradient>
      <!-- Soft matte cylindrical shading (zero harsh black) -->
      <linearGradient id="vl-can-matte" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(0,0,0,0.06)"/>
        <stop offset="22%" stop-color="rgba(255,255,255,0.34)"/>
        <stop offset="42%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.12)"/>
      </linearGradient>
    </defs>
  `;
}

/** Clean Matte-Toy Aluminum Can or PET Bottle (zero black outlines!) */
export function renderDrinkItemSvg(drink, x, y, scale = 1, rotDeg = 0) {
  let bodySvg = '';
  if (drink.shape === 'pet') {
    bodySvg = `
      <rect x="-7.5" y="-43" width="15" height="9" rx="3.5" fill="${drink.dark}"/>
      <path d="M -7.5 -35 L -17.5 -19 V 30 Q -17.5 37 -10.5 37 H 10.5 Q 17.5 37 17.5 30 V -19 L 7.5 -35 Z" fill="${drink.body}"/>
      <rect x="-17.5" y="-11" width="35" height="30" fill="${drink.accent}"/>
      <text x="0" y="8" text-anchor="middle" font-size="8" font-weight="900" fill="${drink.dark}" font-family="${FONT_ROUND}">${drink.label}</text>
      <path d="M -17.5 -19 V 30 Q -17.5 37 -10.5 37 H 10.5 Q 17.5 37 17.5 30 V -19 Z" fill="url(#vl-can-matte)"/>
      <line x1="-10" y1="-25" x2="-10" y2="25" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (drink.shape === 'bottle') {
    bodySvg = `
      <rect x="-8.5" y="-41" width="17" height="9" rx="4" fill="#FFFFFF"/>
      <path d="M -8.5 -33 C -8.5 -23 -17.5 -17 -17.5 -5 V 30 Q -17.5 37 -10.5 37 H 10.5 Q 17.5 37 17.5 30 V -5 C 17.5 -17 8.5 -23 8.5 -33 Z" fill="${drink.body}"/>
      <circle cx="0" cy="8" r="11" fill="${drink.accent}"/>
      <text x="0" y="11" text-anchor="middle" font-size="7.5" font-weight="900" fill="${drink.dark}" font-family="${FONT_ROUND}">${drink.label}</text>
      <path d="M -17.5 -5 V 30 Q -17.5 37 -10.5 37 H 10.5 Q 17.5 37 17.5 30 V -5 Z" fill="url(#vl-can-matte)"/>
      <line x1="-10" y1="-12" x2="-10" y2="24" stroke="rgba(255,255,255,0.58)" stroke-width="3" stroke-linecap="round"/>
    `;
  } else {
    bodySvg = `
      <ellipse cx="0" cy="-31" rx="14.5" ry="4" fill="#DFE7F0"/>
      <rect x="-17.5" y="-30" width="35" height="65" rx="7" fill="${drink.body}"/>
      <path d="M -17.5 4 L 17.5 -14 V 2 L -17.5 20 Z" fill="${drink.accent}" opacity="0.92"/>
      <text x="0" y="-1" text-anchor="middle" font-size="8" font-weight="900" fill="${drink.dark}" font-family="${FONT_ROUND}">${drink.label}</text>
      <rect x="-17.5" y="-30" width="35" height="65" rx="7" fill="url(#vl-can-matte)"/>
      <line x1="-10.5" y1="-22" x2="-10.5" y2="25" stroke="rgba(255,255,255,0.62)" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${scale.toFixed(2)})">
      ${bodySvg}
    </g>
  `;
}

/** Tactile Matte Japanese Coin (zero black outlines, soft same-hue 3D edge) */
export function renderDiegeticCoinSvg(coin, cx, cy, scale = 1) {
  return `
    <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(2)})">
      <circle cx="0" cy="5" r="${coin.r}" fill="${coin.lip}"/>
      <circle cx="0" cy="0" r="${coin.r}" fill="${coin.fill}"/>
      <path d="M ${(-coin.r * 0.55).toFixed(1)} ${(-coin.r * 0.52).toFixed(1)} A ${(coin.r * 0.76).toFixed(1)} ${(coin.r * 0.76).toFixed(1)} 0 0 1 ${(coin.r * 0.52).toFixed(1)} ${(-coin.r * 0.52).toFixed(1)}"
        stroke="${coin.shine}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      ${coin.hole ? `<circle cx="0" cy="0" r="5" fill="#F4E8D4"/>` : ''}
      <text x="0" y="${coin.hole ? '-7' : '5'}" text-anchor="middle" font-size="${coin.value >= 100 ? '11.5' : '11'}" font-weight="900" fill="#3D405B" font-family="${FONT_ROUND}">${coin.label}</text>
    </g>
  `;
}
