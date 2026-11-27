// High-craft 2.5D Toon-Shaded SVG assets for Vending Lab (ジハンキ ラボ)

export const DRINKS = [
  { id: 'cider',  name: 'サイダー',     price: 110, temp: 'cold', shape: 'can',    body: '#38BDF8', dark: '#0284C7', accent: '#FFFFFF', label: 'CIDER' },
  { id: 'orange', name: 'オレンジ',     price: 120, temp: 'cold', shape: 'pet',    body: '#FB923C', dark: '#C2410C', accent: '#FEF08A', label: 'ORANGE' },
  { id: 'tea',    name: 'おちゃ',       price: 130, temp: 'cold', shape: 'pet',    body: '#4ADE80', dark: '#15803D', accent: '#DCFCE7', label: 'TEA' },
  { id: 'cola',   name: 'コーラ',       price: 140, temp: 'cold', shape: 'can',    body: '#EF4444', dark: '#991B1B', accent: '#FFFFFF', label: 'COLA' },
  { id: 'milk',   name: 'いちごミルク', price: 120, temp: 'cold', shape: 'bottle', body: '#F472B6', dark: '#BE185D', accent: '#FFF1F2', label: 'MILK' },
  { id: 'soup',   name: 'コーンスープ', price: 130, temp: 'hot',  shape: 'can',    body: '#FACC15', dark: '#B45309', accent: '#FEF9C3', label: 'CORN' }
];

export const COINS = [
  { value: 10,  label: '10',  r: 20, fill: '#D97736', rim: '#92400E', shine: '#FDBA74', hole: false },
  { value: 50,  label: '50',  r: 18, fill: '#E2E8F0', rim: '#64748B', shine: '#FFFFFF', hole: true },
  { value: 100, label: '100', r: 22, fill: '#E2E8F0', rim: '#64748B', shine: '#FFFFFF', hole: false },
  { value: 500, label: '500', r: 24, fill: '#FACC15', rim: '#A16207', shine: '#FEF9C3', hole: false }
];

export function buildVendingDefsSvg() {
  return `
    <defs>
      <linearGradient id="vl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#BAE6FD"/>
        <stop offset="72%" stop-color="#FEF3C7"/>
        <stop offset="100%" stop-color="#FDE68A"/>
      </linearGradient>
      <linearGradient id="vl-body-white" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="85%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E2E8F0"/>
      </linearGradient>
      <linearGradient id="vl-side-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="55%" stop-color="#DC2626"/>
        <stop offset="100%" stop-color="#991B1B"/>
      </linearGradient>
      <linearGradient id="vl-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="48%" stop-color="#CBD5E1"/>
        <stop offset="52%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
      <!-- Cel-Shaded Cylindrical Can Overlay -->
      <linearGradient id="vl-can-cel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(15,23,42,0.2)"/>
        <stop offset="18%" stop-color="rgba(255,255,255,0.48)"/>
        <stop offset="34%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="76%" stop-color="rgba(15,23,42,0.08)"/>
        <stop offset="100%" stop-color="rgba(15,23,42,0.28)"/>
      </linearGradient>
    </defs>
  `;
}

/** 2.5D Toon-Shaded Japanese Can or PET Bottle with crisp ink outline & cel specular */
export function renderDrinkItemSvg(drink, x, y, scale = 1, rotDeg = 0) {
  const ink = '#1E293B';
  let bodySvg = '';
  if (drink.shape === 'pet') {
    bodySvg = `
      <rect x="-8" y="-44" width="16" height="9" rx="3" fill="${drink.dark}" stroke="${ink}" stroke-width="2.2"/>
      <path d="M -8 -35 L -18 -19 V 31 Q -18 38 -11 38 H 11 Q 18 38 18 31 V -19 L 8 -35 Z"
        fill="${drink.body}" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/>
      <rect x="-17" y="-11" width="34" height="31" fill="${drink.accent}"/>
      <text x="0" y="9" text-anchor="middle" font-size="8.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <path d="M -17 -19 V 31 Q -17 37 -11 37 H 11 Q 17 37 17 31 V -19 Z" fill="url(#vl-can-cel)"/>
      <line x1="-10" y1="-26" x2="-10" y2="26" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.72"/>
    `;
  } else if (drink.shape === 'bottle') {
    bodySvg = `
      <rect x="-9" y="-42" width="18" height="9" rx="3.5" fill="#FFFFFF" stroke="${ink}" stroke-width="2.2"/>
      <path d="M -9 -33 C -9 -23 -18 -17 -18 -5 V 31 Q -18 38 -11 38 H 11 Q 18 38 18 31 V -5 C 18 -17 9 -23 9 -33 Z"
        fill="${drink.body}" stroke="${ink}" stroke-width="2.6"/>
      <circle cx="0" cy="8" r="11" fill="${drink.accent}" stroke="${drink.dark}" stroke-width="1.5"/>
      <text x="0" y="11" text-anchor="middle" font-size="7.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <path d="M -17 -5 V 31 Q -17 37 -11 37 H 11 Q 17 37 17 31 V -5 Z" fill="url(#vl-can-cel)"/>
      <line x1="-10" y1="-12" x2="-10" y2="24" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" opacity="0.68"/>
    `;
  } else {
    bodySvg = `
      <ellipse cx="0" cy="-32" rx="15" ry="4.5" fill="#E2E8F0" stroke="${ink}" stroke-width="2.2"/>
      <rect x="-18" y="-31" width="36" height="67" rx="6" fill="${drink.body}" stroke="${ink}" stroke-width="2.6"/>
      <path d="M -16 4 L 16 -14 V 2 L -16 20 Z" fill="${drink.accent}"/>
      <text x="0" y="-1" text-anchor="middle" font-size="8.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <rect x="-17" y="-30" width="34" height="65" rx="5" fill="url(#vl-can-cel)"/>
      <line x1="-11" y1="-23" x2="-11" y2="26" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" opacity="0.72"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${scale.toFixed(2)})">
      ${bodySvg}
    </g>
  `;
}

/** 2.5D Chunky Extruded Japanese Coin inside SVG scene */
export function renderDiegeticCoinSvg(coin, cx, cy, scale = 1) {
  const ink = '#1E293B';
  return `
    <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(2)})">
      <!-- 2.5D coin edge thickness -->
      <circle cx="0" cy="5" r="${coin.r}" fill="${coin.rim}" stroke="${ink}" stroke-width="2.8"/>
      <!-- Top metallic face -->
      <circle cx="0" cy="0" r="${coin.r}" fill="${coin.fill}" stroke="${ink}" stroke-width="2.8"/>
      <path d="M ${(-coin.r * 0.6).toFixed(1)} ${(-coin.r * 0.5).toFixed(1)} A ${(coin.r * 0.78).toFixed(1)} ${(coin.r * 0.78).toFixed(1)} 0 0 1 ${(coin.r * 0.55).toFixed(1)} ${(-coin.r * 0.55).toFixed(1)}"
        stroke="${coin.shine}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      ${coin.hole ? `<circle cx="0" cy="0" r="5" fill="#FDE68A" stroke="${ink}" stroke-width="2"/>` : ''}
      <text x="0" y="${coin.hole ? '-7' : '5'}" text-anchor="middle" font-size="${coin.value >= 100 ? '11.5' : '11'}" font-weight="900" fill="${ink}" font-family="sans-serif">${coin.label}</text>
    </g>
  `;
}
