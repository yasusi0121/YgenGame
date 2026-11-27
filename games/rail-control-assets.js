// High-precision SVG assets for Rail Control Lab (ふみきり ラボ)

export function buildRailDefsSvg() {
  return `
    <defs>
      <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7DD3FC"/>
        <stop offset="65%" stop-color="#E0F2FE"/>
        <stop offset="100%" stop-color="#FEF9C3"/>
      </linearGradient>
      <linearGradient id="rc-steel-rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E2E8F0"/>
        <stop offset="45%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
      <linearGradient id="rc-road" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="50%" stop-color="#64748B"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <pattern id="rc-hazard" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="22" height="22" fill="#FACC15"/>
        <rect width="11" height="22" fill="#111827"/>
      </pattern>
      <radialGradient id="rc-red-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="35%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="rgba(239,68,68,0)"/>
      </radialGradient>
      <linearGradient id="rc-shinkansen-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="72%" stop-color="#F1F5F9"/>
        <stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
      <linearGradient id="rc-commuter-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
    </defs>
  `;
}

/** Render authentic Japanese train centered horizontally around x, sitting on railY */
export function renderTrainSvg(type, x, railY, dir = 1, scale = 1) {
  const flip = dir < 0 ? -1 : 1;
  let body = '';

  if (type === 'shinkansen') {
    // Sleek Japanese Shinkansen (N700S style aerodynamic nose + blue double stripe)
    body = `
      <!-- Bogies & wheels -->
      <rect x="-130" y="-12" width="48" height="10" rx="4" fill="#334155"/>
      <circle cx="-118" cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="-94"  cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <rect x="64" y="-12" width="48" height="10" rx="4" fill="#334155"/>
      <circle cx="76"  cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="100" cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <!-- Single-arm Pantograph -->
      <path d="M -52 -66 L -34 -84 L -64 -84" stroke="#475569" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="-76" y1="-84" x2="-24" y2="-84" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Aerodynamic Nose & Car Body -->
      <path d="M -154 -10 H 126 C 148 -10 162 -16 164 -24 C 156 -42 128 -62 96 -66 H -148 Q -156 -66 -156 -56 V -14 Z"
        fill="url(#rc-shinkansen-body)" stroke="#334155" stroke-width="3"/>
      <!-- Signature Blue Shinkansen Stripes -->
      <path d="M -154 -28 H 152" stroke="#1D4ED8" stroke-width="7"/>
      <path d="M -154 -20 H 146" stroke="#2563EB" stroke-width="3"/>
      <!-- Cockpit & Passenger Windows -->
      <path d="M 96 -54 H 122 L 136 -40 H 96 Z" fill="#0F172A"/>
      ${[-134, -104, -74, -44, -14, 16, 46].map((wx) => `
        <rect x="${wx}" y="-52" width="20" height="16" rx="4" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>
        <line x1="${wx + 3}" y1="-48" x2="${wx + 12}" y2="-48" stroke="#BAE6FD" stroke-width="2" opacity="0.7"/>
      `).join('')}
      <!-- Bright Headlight -->
      <ellipse cx="144" cy="-31" rx="7" ry="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>
    `;
  } else if (type === 'freight') {
    // Classic Red Electric Locomotive + Green Shipping Container Car
    body = `
      <!-- Container flatcar (rear) -->
      <rect x="-176" y="-16" width="128" height="10" rx="3" fill="#334155"/>
      <circle cx="-154" cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="-70"  cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <rect x="-170" y="-60" width="56" height="44" rx="4" fill="#0284C7" stroke="#0C4A6E" stroke-width="2.5"/>
      <rect x="-108" y="-60" width="56" height="44" rx="4" fill="#16A34A" stroke="#14532D" stroke-width="2.5"/>
      ${[-160, -148, -136, -124, -98, -86, -74, -62].map((rx) => `<line x1="${rx}" y1="-56" x2="${rx}" y2="-20" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>`).join('')}
      <!-- Coupler -->
      <rect x="-48" y="-16" width="16" height="6" fill="#1E293B"/>
      <!-- Red Electric Locomotive (front) -->
      <path d="M 10 -68 L 28 -84 L 46 -68" stroke="#475569" stroke-width="3" fill="none"/>
      <line x1="8" y1="-84" x2="48" y2="-84" stroke="#1E293B" stroke-width="3.5"/>
      <rect x="-34" y="-68" width="164" height="58" rx="8" fill="#DC2626" stroke="#7F1D1D" stroke-width="3"/>
      <rect x="-34" y="-26" width="164" height="8" fill="#FEF08A"/>
      <rect x="86" y="-58" width="36" height="24" rx="4" fill="#0F172A"/>
      <rect x="-14" y="-54" width="22" height="16" rx="3" fill="#BAE6FD" stroke="#7F1D1D" stroke-width="2"/>
      <rect x="18" y="-54" width="22" height="16" rx="3" fill="#BAE6FD" stroke="#7F1D1D" stroke-width="2"/>
      <circle cx="122" cy="-16" r="5.5" fill="#FEF08A"/>
      <circle cx="-12" cy="-4" r="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="24"  cy="-4" r="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="76"  cy="-4" r="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="110" cy="-4" r="8" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
    `;
  } else {
    // Classic Japanese Stainless Commuter Train (Yamanote Emerald Green stripe)
    const stripe = type === 'blue' ? '#2563EB' : (type === 'red' ? '#EF4444' : (type === 'yellow' ? '#EAB308' : '#22C55E'));
    body = `
      <!-- Pantograph -->
      <path d="M -24 -68 L -4 -86 L 16 -68" stroke="#475569" stroke-width="3" fill="none"/>
      <line x1="-22" y1="-86" x2="14" y2="-86" stroke="#1E293B" stroke-width="3.5"/>
      <!-- AC Unit on roof -->
      <rect x="-110" y="-76" width="66" height="10" rx="4" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
      <rect x="34" y="-76" width="66" height="10" rx="4" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
      <!-- Stainless Steel Car Body -->
      <rect x="-148" y="-68" width="290" height="58" rx="10" fill="url(#rc-commuter-body)" stroke="#334155" stroke-width="3"/>
      <!-- Line Color Band -->
      <rect x="-146" y="-26" width="286" height="10" fill="${stripe}"/>
      <rect x="-146" y="-66" width="286" height="6" rx="2" fill="${stripe}"/>
      <!-- Doors & Large Windows -->
      ${[-128, -42, 44].map((dx) => `
        <rect x="${dx}" y="-56" width="28" height="44" rx="3" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
        <rect x="${dx + 4}" y="-52" width="9" height="18" rx="2" fill="#1E293B"/>
        <rect x="${dx + 15}" y="-52" width="9" height="18" rx="2" fill="#1E293B"/>
      `).join('')}
      ${[-92, -6, 80].map((wx) => `
        <rect x="${wx}" y="-54" width="42" height="22" rx="4" fill="#1E293B" stroke="#475569" stroke-width="2"/>
        <line x1="${wx + 4}" y1="-48" x2="${wx + 24}" y2="-48" stroke="#BAE6FD" stroke-width="2.5" opacity="0.65"/>
      `).join('')}
      <!-- Front Headlights -->
      <circle cx="136" cy="-19" r="5" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>
      <!-- Bogie wheels -->
      <circle cx="-116" cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="-90"  cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="88"   cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
      <circle cx="114"  cy="-4" r="7" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${railY.toFixed(1)}) scale(${(flip * scale).toFixed(2)} ${scale.toFixed(2)})">
      ${body}
    </g>
  `;
}

/** Render an authentic Japanese Fumikiri Crossing Post & Rotating Striped Gate */
export function renderFumikiriPostSvg(x, baseY, { gateClosedRatio = 0, lampPhase = 0, warningOn = false, arrowDir = 0, side = 'left' } = {}) {
  // gateClosedRatio: 0 = raised straight up (~86 deg), 1 = horizontal closed (0 deg)
  const isLeft = side === 'left';
  const openDeg = isLeft ? -84 : 84;
  const barDeg = openDeg * (1 - gateClosedRatio);
  const barDir = isLeft ? 1 : -1;

  const leftLit = warningOn && lampPhase === 0;
  const rightLit = warningOn && lampPhase === 1;

  return `
    <g transform="translate(${x} ${baseY})">
      <!-- Concrete foundation -->
      <rect x="-18" y="-12" width="36" height="14" rx="4" fill="#94A3B8" stroke="#334155" stroke-width="2.5"/>
      <!-- Yellow & Black Striped Post -->
      <rect x="-7" y="-176" width="14" height="166" rx="3" fill="url(#rc-hazard)" stroke="#111827" stroke-width="2.5"/>
      <!-- Bell speaker box on top -->
      <rect x="-12" y="-190" width="24" height="16" rx="4" fill="#475569" stroke="#1E293B" stroke-width="2"/>
      <circle cx="0" cy="-182" r="4" fill="#94A3B8"/>

      <!-- Classic X Crossbuck Sign (踏切警標) -->
      <g transform="translate(0 -152)">
        <rect x="-32" y="-6" width="64" height="12" rx="3" fill="url(#rc-hazard)" stroke="#111827" stroke-width="2" transform="rotate(32)"/>
        <rect x="-32" y="-6" width="64" height="12" rx="3" fill="url(#rc-hazard)" stroke="#111827" stroke-width="2" transform="rotate(-32)"/>
      </g>

      <!-- Train Direction Indicator Box (方向指示器) -->
      <rect x="-26" y="-128" width="52" height="22" rx="5" fill="#0F172A" stroke="#475569" stroke-width="2"/>
      <polygon points="-20,-117 -8,-124 -8,-110" fill="${arrowDir < 0 ? '#FB923C' : '#334155'}"/>
      <polygon points="20,-117 8,-124 8,-110" fill="${arrowDir > 0 ? '#FB923C' : '#334155'}"/>

      <!-- Dual Alternating Crimson Warning Lamps -->
      <rect x="-30" y="-98" width="60" height="24" rx="12" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
      ${leftLit ? `<circle cx="-16" cy="-86" r="22" fill="url(#rc-red-glow)"/>` : ''}
      ${rightLit ? `<circle cx="16" cy="-86" r="22" fill="url(#rc-red-glow)"/>` : ''}
      <circle cx="-16" cy="-86" r="9" fill="${leftLit ? '#EF4444' : '#450A0A'}" stroke="#0F172A" stroke-width="2"/>
      <circle cx="16"  cy="-86" r="9" fill="${rightLit ? '#EF4444' : '#450A0A'}" stroke="#0F172A" stroke-width="2"/>
      ${leftLit ? `<circle cx="-18" cy="-88" r="3" fill="#FEF08A"/>` : ''}
      ${rightLit ? `<circle cx="14" cy="-88" r="3" fill="#FEF08A"/>` : ''}

      <!-- Gate Motor Pivot Box & Rotating Striped Barrier Arm -->
      <g transform="translate(0 -46)">
        <g transform="rotate(${barDeg.toFixed(1)})">
          <!-- Counterweight on back end -->
          <rect x="${isLeft ? -34 : 12}" y="-7" width="22" height="14" rx="5" fill="#EF4444" stroke="#7F1D1D" stroke-width="2"/>
          <!-- Long Yellow & Black Striped Gate Pole -->
          <rect x="${isLeft ? 0 : -132}" y="-5.5" width="132" height="11" rx="4" fill="url(#rc-hazard)" stroke="#111827" stroke-width="2"/>
          <!-- Red reflective end tip -->
          <rect x="${barDir > 0 ? 118 : -132}" y="-5.5" width="14" height="11" rx="3" fill="#EF4444"/>
        </g>
        <!-- Motor Pivot Housing -->
        <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#FACC15" stroke="#1E293B" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="6" fill="#334155"/>
      </g>
    </g>
  `;
}

/** Render a cute detailed vehicle waiting or crossing the road */
export function renderRoadCarSvg(x, y, color = '#3B82F6', roof = '#93C5FD') {
  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <rect x="-32" y="-12" width="64" height="24" rx="8" fill="${color}" stroke="#1E293B" stroke-width="2.5"/>
      <path d="M -20 -12 L -12 -26 H 14 L 22 -12 Z" fill="${roof}" stroke="#1E293B" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="-18" cy="12" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2"/>
      <circle cx="18"  cy="12" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2"/>
      <circle cx="28"  cy="-2" r="3.5" fill="#FEF08A"/>
    </g>
  `;
}
