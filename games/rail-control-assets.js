// Lingokids / LogicLike editorial matte-toy SVG assets for Rail Control Lab (ふみきり ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export function buildRailDefsSvg() {
  return `
    <defs>
      <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7BC0DF"/>
        <stop offset="100%" stop-color="#CBE8F4"/>
      </linearGradient>
      <pattern id="rc-hazard" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="22" height="22" fill="#F7C948"/>
        <rect width="11" height="22" fill="#3B4252"/>
      </pattern>
      <radialGradient id="rc-red-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFF0A8"/>
        <stop offset="40%" stop-color="#FF5E5E"/>
        <stop offset="100%" stop-color="rgba(255,94,94,0)"/>
      </radialGradient>
      <linearGradient id="rc-shinkansen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="72%" stop-color="#F1F5F9"/>
        <stop offset="100%" stop-color="#D8E2EC"/>
      </linearGradient>
      <linearGradient id="rc-commuter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="68%" stop-color="#E8EEF5"/>
        <stop offset="100%" stop-color="#CCD7E4"/>
      </linearGradient>
    </defs>
  `;
}

/** Clean Sculpted Matte-Toy Japanese Train (zero black outlines!) */
export function renderTrainSvg(type, x, railY, dir = 1, scale = 1) {
  const flip = dir < 0 ? -1 : 1;
  let body = '';

  if (type === 'shinkansen') {
    body = `
      <ellipse cx="0" cy="4" rx="154" ry="7" fill="rgba(30,41,59,0.14)"/>
      <rect x="-128" y="-12" width="48" height="10" rx="5" fill="#4C566A"/>
      <circle cx="-116" cy="-4" r="6.5" fill="#3B4252"/><circle cx="-92" cy="-4" r="6.5" fill="#3B4252"/>
      <rect x="64" y="-12" width="48" height="10" rx="5" fill="#4C566A"/>
      <circle cx="76" cy="-4" r="6.5" fill="#3B4252"/><circle cx="100" cy="-4" r="6.5" fill="#3B4252"/>
      <path d="M -52 -66 L -34 -82 L -64 -82" stroke="#64748B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <line x1="-74" y1="-82" x2="-24" y2="-82" stroke="#4C566A" stroke-width="4" stroke-linecap="round"/>
      <!-- Sleek Rounded Aerodynamic Body -->
      <path d="M -154 -10 H 126 C 148 -10 162 -16 165 -24 C 157 -43 128 -62 96 -66 H -146 Q -154 -66 -154 -54 V -14 Z" fill="url(#rc-shinkansen)"/>
      <!-- Signature Cobalt Blue Stripes -->
      <path d="M -154 -28 H 153" stroke="#3B82F6" stroke-width="7"/>
      <path d="M -154 -20 H 146" stroke="#60A5FA" stroke-width="3"/>
      <!-- Soft Rounded Windows -->
      <path d="M 96 -54 H 122 L 136 -40 H 96 Z" fill="#3B4252"/>
      ${[-134, -104, -74, -44, -14, 16, 46].map((wx) => `
        <rect x="${wx}" y="-52" width="21" height="16" rx="6" fill="#3B4252"/>
        <line x1="${wx + 4}" y1="-47" x2="${wx + 12}" y2="-47" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-linecap="round"/>
      `).join('')}
      <ellipse cx="144" cy="-31" rx="7.5" ry="4" fill="#FFF3A1"/>
    `;
  } else if (type === 'freight') {
    body = `
      <ellipse cx="-24" cy="4" rx="162" ry="7" fill="rgba(30,41,59,0.14)"/>
      <rect x="-176" y="-16" width="128" height="10" rx="5" fill="#4C566A"/>
      <circle cx="-154" cy="-4" r="6.5" fill="#3B4252"/><circle cx="-72" cy="-4" r="6.5" fill="#3B4252"/>
      <rect x="-170" y="-60" width="56" height="44" rx="8" fill="#4FA8D8"/>
      <rect x="-108" y="-60" width="56" height="44" rx="8" fill="#45B87B"/>
      <rect x="-48" y="-15" width="16" height="5" rx="2.5" fill="#3B4252"/>
      <path d="M 10 -66 L 28 -82 L 46 -66" stroke="#64748B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <line x1="10" y1="-82" x2="46" y2="-82" stroke="#4C566A" stroke-width="4" stroke-linecap="round"/>
      <rect x="-34" y="-66" width="164" height="56" rx="14" fill="#F05A5B"/>
      <rect x="-34" y="-25" width="164" height="8" fill="#F7C948"/>
      <rect x="86" y="-56" width="34" height="23" rx="6" fill="#3B4252"/>
      <rect x="-14" y="-52" width="22" height="16" rx="5" fill="#D8F0FA"/>
      <rect x="18"  y="-52" width="22" height="16" rx="5" fill="#D8F0FA"/>
      <circle cx="122" cy="-16" r="5.5" fill="#FFF3A1"/>
      <circle cx="-12" cy="-4" r="7" fill="#3B4252"/><circle cx="24" cy="-4" r="7" fill="#3B4252"/>
      <circle cx="76"  cy="-4" r="7" fill="#3B4252"/><circle cx="110" cy="-4" r="7" fill="#3B4252"/>
    `;
  } else {
    const stripe = type === 'blue' ? '#4FA8D8' : (type === 'red' ? '#F05A5B' : (type === 'yellow' ? '#F7C948' : '#34C77B'));
    body = `
      <ellipse cx="0" cy="4" rx="144" ry="7" fill="rgba(30,41,59,0.14)"/>
      <path d="M -24 -66 L -4 -84 L 16 -66" stroke="#64748B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <line x1="-22" y1="-84" x2="14" y2="-84" stroke="#4C566A" stroke-width="4" stroke-linecap="round"/>
      <rect x="-106" y="-74" width="62" height="9" rx="4.5" fill="#DCE5EF"/>
      <rect x="34"   y="-74" width="62" height="9" rx="4.5" fill="#DCE5EF"/>
      <rect x="-146" y="-66" width="288" height="56" rx="14" fill="url(#rc-commuter)"/>
      <rect x="-146" y="-26" width="288" height="10" fill="${stripe}"/>
      <rect x="-140" y="-66" width="276" height="6" rx="3" fill="${stripe}"/>
      ${[-126, -40, 46].map((dx) => `
        <rect x="${dx}" y="-54" width="26" height="42" rx="6" fill="#FFFFFF"/>
        <rect x="${dx + 3.5}" y="-50" width="8.5" height="17" rx="3" fill="#3B4252"/>
        <rect x="${dx + 14}"  y="-50" width="8.5" height="17" rx="3" fill="#3B4252"/>
      `).join('')}
      ${[-90, -4, 82].map((wx) => `
        <rect x="${wx}" y="-52" width="40" height="21" rx="6" fill="#3B4252"/>
        <line x1="${wx + 5}" y1="-46" x2="${wx + 22}" y2="-46" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-linecap="round"/>
      `).join('')}
      <circle cx="135" cy="-19" r="5" fill="#FFF3A1"/>
      <circle cx="-114" cy="-4" r="6.5" fill="#3B4252"/><circle cx="-88" cy="-4" r="6.5" fill="#3B4252"/>
      <circle cx="88"   cy="-4" r="6.5" fill="#3B4252"/><circle cx="114" cy="-4" r="6.5" fill="#3B4252"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${railY.toFixed(1)}) scale(${(flip * scale).toFixed(2)} ${scale.toFixed(2)})">
      ${body}
    </g>
  `;
}

/** Iconic Clean Matte Japanese Fumikiri Post (zero harsh black strokes!) */
export function renderFumikiriPostSvg(x, baseY, { gateClosedRatio = 0, lampPhase = 0, warningOn = false, arrowDir = 0, side = 'left' } = {}) {
  const isLeft = side === 'left';
  const openDeg = isLeft ? -84 : 84;
  const barDeg = openDeg * (1 - gateClosedRatio);
  const leftLit = warningOn && lampPhase === 0;
  const rightLit = warningOn && lampPhase === 1;

  return `
    <g data-act="toggle-gate" style="cursor:pointer;" transform="translate(${x} ${baseY})">
      <ellipse cx="0" cy="3" rx="24" ry="6" fill="rgba(30,41,59,0.14)"/>
      <rect x="-18" y="-12" width="36" height="14" rx="7" fill="#CBD5E1"/>
      <rect x="-7.5" y="-176" width="15" height="166" rx="7.5" fill="url(#rc-hazard)"/>
      <rect x="-13" y="-190" width="26" height="16" rx="7" fill="#4C566A"/>
      <circle cx="0" cy="-182" r="4" fill="#CBD5E1"/>

      <!-- Rounded X Crossbuck -->
      <g transform="translate(0 -152)">
        <rect x="-32" y="-6" width="64" height="12" rx="6" fill="url(#rc-hazard)" transform="rotate(32)"/>
        <rect x="-32" y="-6" width="64" height="12" rx="6" fill="url(#rc-hazard)" transform="rotate(-32)"/>
      </g>

      <!-- Direction Indicator -->
      <rect x="-26" y="-128" width="52" height="22" rx="9" fill="#3B4252"/>
      <polygon points="-20,-117 -8,-123 -8,-111" fill="${arrowDir < 0 ? '#FFA94D' : '#566175'}"/>
      <polygon points="20,-117 8,-123 8,-111" fill="${arrowDir > 0 ? '#FFA94D' : '#566175'}"/>

      <!-- Dual Crimson Warning Lamps -->
      <rect x="-31" y="-98" width="62" height="26" rx="13" fill="#3B4252"/>
      ${leftLit ? `<circle cx="-16" cy="-85" r="24" fill="url(#rc-red-glow)"/>` : ''}
      ${rightLit ? `<circle cx="16" cy="-85" r="24" fill="url(#rc-red-glow)"/>` : ''}
      <circle cx="-16" cy="-85" r="9" fill="${leftLit ? '#FF5E5E' : '#5C2B2B'}"/>
      <circle cx="16"  cy="-85" r="9" fill="${rightLit ? '#FF5E5E' : '#5C2B2B'}"/>
      ${leftLit ? `<circle cx="-18" cy="-88" r="3" fill="#FFF3A1"/>` : ''}
      ${rightLit ? `<circle cx="14" cy="-88" r="3" fill="#FFF3A1"/>` : ''}

      <!-- Rotating Striped Barrier Pole -->
      <g transform="translate(0 -46)">
        <g transform="rotate(${barDeg.toFixed(1)})">
          <rect x="${isLeft ? -34 : 12}" y="-7.5" width="22" height="15" rx="7.5" fill="#F05A5B"/>
          <rect x="${isLeft ? 0 : -136}" y="-6" width="136" height="12" rx="6" fill="url(#rc-hazard)"/>
          <rect x="${isLeft ? 120 : -136}" y="-6" width="16" height="12" rx="5" fill="#F05A5B"/>
        </g>
        <rect x="-15" y="-15" width="30" height="30" rx="10" fill="#F7C948"/>
        <circle cx="0" cy="0" r="6" fill="#3B4252"/>
      </g>
    </g>
  `;
}

/** Cute Matte-Toy Compact Car (zero black strokes!) */
export function renderRoadCarSvg(x, y, color = '#4FA8D8', roof = '#A8DDF5') {
  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="0" cy="17" rx="32" ry="5.5" fill="rgba(30,41,59,0.16)"/>
      <rect x="-33" y="-12" width="66" height="25" rx="11" fill="${color}"/>
      <path d="M -20 -12 L -11 -27 H 15 L 24 -12 Z" fill="${roof}"/>
      <line x1="-24" y1="-5" x2="20" y2="-5" stroke="rgba(255,255,255,0.42)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-18" cy="13" r="8.5" fill="#3B4252"/>
      <circle cx="-18" cy="13" r="4" fill="#E2E8F0"/>
      <circle cx="18"  cy="13" r="8.5" fill="#3B4252"/>
      <circle cx="18"  cy="13" r="4" fill="#E2E8F0"/>
      <circle cx="28"  cy="-1" r="3.5" fill="#FFF3A1"/>
    </g>
  `;
}
