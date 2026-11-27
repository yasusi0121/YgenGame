// High-precision SVG assets & drink definitions for Vending Lab (ジハンキ ラボ)

export const DRINKS = [
  { id: 'cider',  name: 'サイダー',     price: 110, temp: 'cold', shape: 'can',    body: '#38BDF8', dark: '#0284C7', accent: '#FFFFFF', label: 'CIDER' },
  { id: 'orange', name: 'オレンジ',     price: 120, temp: 'cold', shape: 'pet',    body: '#FB923C', dark: '#C2410C', accent: '#FEF08A', label: 'ORANGE' },
  { id: 'tea',    name: 'おちゃ',       price: 130, temp: 'cold', shape: 'pet',    body: '#4ADE80', dark: '#15803D', accent: '#DCFCE7', label: 'TEA' },
  { id: 'cola',   name: 'コーラ',       price: 140, temp: 'cold', shape: 'can',    body: '#EF4444', dark: '#991B1B', accent: '#FFFFFF', label: 'COLA' },
  { id: 'milk',   name: 'いちごミルク', price: 120, temp: 'cold', shape: 'bottle', body: '#F472B6', dark: '#BE185D', accent: '#FFF1F2', label: 'MILK' },
  { id: 'soup',   name: 'コーンスープ', price: 130, temp: 'hot',  shape: 'can',    body: '#FACC15', dark: '#B45309', accent: '#FEF9C3', label: 'CORN' }
];

export const COINS = [
  { value: 10,  label: '10',  r: 20, fill: 'vl-coin-bronze', edge: '#78350F', hole: false },
  { value: 50,  label: '50',  r: 18, fill: 'vl-coin-silver', edge: '#475569', hole: true },
  { value: 100, label: '100', r: 22, fill: 'vl-coin-silver', edge: '#475569', hole: false },
  { value: 500, label: '500', r: 25, fill: 'vl-coin-brass',  edge: '#854D0E', hole: false }
];

export function buildVendingDefsSvg() {
  return `
    <defs>
      <!-- Baked White Enamel Machine Body -->
      <linearGradient id="vl-body-white" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#E2E8F0"/>
        <stop offset="8%" stop-color="#FFFFFF"/>
        <stop offset="92%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
      <!-- Crimson Japanese Vending Side Trim -->
      <linearGradient id="vl-trim-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="50%" stop-color="#DC2626"/>
        <stop offset="100%" stop-color="#991B1B"/>
      </linearGradient>
      <!-- Brushed Aluminum Metal -->
      <linearGradient id="vl-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F1F5F9"/>
        <stop offset="45%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
      <!-- Showcase Dark Interior -->
      <linearGradient id="vl-showcase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E0F2FE"/>
        <stop offset="25%" stop-color="#F8FAFC"/>
        <stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
      <!-- Coin Metallic Gradients -->
      <radialGradient id="vl-coin-bronze" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#FDBA74"/>
        <stop offset="55%" stop-color="#C26D2D"/>
        <stop offset="100%" stop-color="#7C2D12"/>
      </radialGradient>
      <radialGradient id="vl-coin-silver" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="55%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#64748B"/>
      </radialGradient>
      <radialGradient id="vl-coin-brass" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="55%" stop-color="#EAB308"/>
        <stop offset="100%" stop-color="#854D0E"/>
      </radialGradient>
      <!-- Cold & Hot Temperature Bars -->
      <linearGradient id="vl-cold-bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="vl-hot-bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F87171"/>
        <stop offset="100%" stop-color="#DC2626"/>
      </linearGradient>
      <!-- Can Specular Shine Overlay -->
      <linearGradient id="vl-can-shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
        <stop offset="22%" stop-color="rgba(255,255,255,0.42)"/>
        <stop offset="42%" stop-color="rgba(255,255,255,0.05)"/>
        <stop offset="82%" stop-color="rgba(0,0,0,0.08)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.28)"/>
      </linearGradient>
    </defs>
  `;
}

/** Render a crisp, authentic aluminum can or PET bottle centered at (x, y) */
export function renderDrinkItemSvg(drink, x, y, scale = 1, rotDeg = 0) {
  let bodySvg = '';
  if (drink.shape === 'pet') {
    bodySvg = `
      <!-- Bottle cap -->
      <rect x="-8" y="-44" width="16" height="8" rx="2.5" fill="${drink.dark}" stroke="#1E293B" stroke-width="1.4"/>
      <!-- Clear PET shoulder -->
      <path d="M -8 -36 L -18 -20 V 32 Q -18 38 -12 38 H 12 Q 18 38 18 32 V -20 L 8 -36 Z"
        fill="${drink.body}" stroke="${drink.dark}" stroke-width="2"/>
      <!-- Wrap-around label band -->
      <rect x="-18" y="-12" width="36" height="32" fill="${drink.accent}" opacity="0.92"/>
      <text x="0" y="9" text-anchor="middle" font-size="8.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <!-- Glossy PET highlight -->
      <path d="M -18 -20 V 32 Q -18 38 -12 38 H 12 Q 18 38 18 32 V -20 Z" fill="url(#vl-can-shine)"/>
      <line x1="-10" y1="-28" x2="-10" y2="28" stroke="rgba(255,255,255,0.55)" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (drink.shape === 'bottle') {
    bodySvg = `
      <rect x="-9" y="-42" width="18" height="8" rx="3" fill="#FFFFFF" stroke="${drink.dark}" stroke-width="1.6"/>
      <path d="M -9 -34 C -9 -24 -18 -18 -18 -6 V 32 Q -18 38 -12 38 H 12 Q 18 38 18 32 V -6 C 18 -18 9 -24 9 -34 Z"
        fill="${drink.body}" stroke="${drink.dark}" stroke-width="2"/>
      <circle cx="0" cy="8" r="11" fill="${drink.accent}" opacity="0.9"/>
      <text x="0" y="11" text-anchor="middle" font-size="7.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <path d="M -18 -6 V 32 Q -18 38 -12 38 H 12 Q 18 38 18 32 V -6 Z" fill="url(#vl-can-shine)"/>
    `;
  } else {
    // Classic Japanese Aluminum Can (top rim + tapered neck + glossy cylinder)
    bodySvg = `
      <rect x="-14" y="-36" width="28" height="5" rx="2" fill="#E2E8F0" stroke="#64748B" stroke-width="1.4"/>
      <rect x="-18" y="-31" width="36" height="68" rx="5" fill="${drink.body}" stroke="${drink.dark}" stroke-width="2"/>
      <!-- Diagonal graphic stripe -->
      <path d="M -17 4 L 17 -14 V 2 L -17 20 Z" fill="${drink.accent}" opacity="0.88"/>
      <text x="0" y="-2" text-anchor="middle" font-size="8.5" font-weight="900" fill="${drink.dark}" font-family="sans-serif">${drink.label}</text>
      <rect x="-18" y="-31" width="36" height="68" rx="5" fill="url(#vl-can-shine)"/>
      <rect x="-15" y="34" width="30" height="4" rx="2" fill="#94A3B8"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${scale.toFixed(2)})">
      ${bodySvg}
    </g>
  `;
}

/** Render a Japanese coin icon (with center hole for 50-yen!) */
export function renderCoinSvg(coin, size = 44) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="${coin.r + 3}" fill="url(#${coin.fill})" stroke="${coin.edge}" stroke-width="2.5"/>
      <circle cx="28" cy="28" r="${coin.r - 1.5}" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.6" stroke-dasharray="4 3"/>
      ${coin.hole ? `<circle cx="28" cy="28" r="5.5" fill="#1E293B" stroke="${coin.edge}" stroke-width="1.6"/>` : ''}
      <text x="28" y="${coin.hole ? '19' : '33'}" text-anchor="middle" font-size="${coin.value >= 100 ? '13' : '12'}" font-weight="900" fill="#1E293B" font-family="sans-serif">${coin.label}</text>
    </svg>
  `;
}
