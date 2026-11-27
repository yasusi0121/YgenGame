// High-craft 2.5D Toon-Shaded SVG assets for Rail Control Lab (ふみきり ラボ)

export function buildRailDefsSvg() {
  return `
    <defs>
      <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="55%" stop-color="#BAE6FD"/>
        <stop offset="100%" stop-color="#FEF9C3"/>
      </linearGradient>
      <linearGradient id="rc-grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4ADE80"/>
        <stop offset="100%" stop-color="#22C55E"/>
      </linearGradient>
      <linearGradient id="rc-steel-rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <pattern id="rc-hazard" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="22" height="22" fill="#FACC15"/>
        <rect width="11" height="22" fill="#1E293B"/>
      </pattern>
      <radialGradient id="rc-red-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="38%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="rgba(239,68,68,0)"/>
      </radialGradient>
      <linearGradient id="rc-shinkansen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="68%" stop-color="#F1F5F9"/>
        <stop offset="70%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <linearGradient id="rc-commuter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="52%" stop-color="#E2E8F0"/>
        <stop offset="55%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
    </defs>
  `;
}

/** 2.5D Toon-Shaded Japanese Train with roof bevel, bold ink outlines & crisp cel highlights */
export function renderTrainSvg(type, x, railY, dir = 1, scale = 1) {
  const flip = dir < 0 ? -1 : 1;
  const ink = '#1E293B';
  let body = '';

  if (type === 'shinkansen') {
    body = `
      <!-- Track shadow -->
      <ellipse cx="0" cy="4" rx="156" ry="8" fill="rgba(15,23,42,0.22)"/>
      <!-- Bogies -->
      <rect x="-130" y="-13" width="50" height="11" rx="4" fill="#334155" stroke="${ink}" stroke-width="2.5"/>
      <circle cx="-118" cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="-94"  cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <rect x="64" y="-13" width="50" height="11" rx="4" fill="#334155" stroke="${ink}" stroke-width="2.5"/>
      <circle cx="76"  cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="100" cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <!-- Pantograph -->
      <path d="M -52 -70 L -34 -88 L -64 -88" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <line x1="-78" y1="-88" x2="-22" y2="-88" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
      <!-- 2.5D Roof Bevel -->
      <path d="M -146 -68 L -134 -76 H 96 L 106 -68 Z" fill="#E2E8F0" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <!-- Sleek Shinkansen Body -->
      <path d="M -156 -10 H 126 C 148 -10 162 -16 166 -24 C 158 -44 128 -64 96 -68 H -148 Q -156 -68 -156 -56 V -14 Z"
        fill="url(#rc-shinkansen)" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- Double Blue Stripes -->
      <path d="M -154 -28 H 154" stroke="#1D4ED8" stroke-width="7.5"/>
      <path d="M -154 -20 H 148" stroke="#38BDF8" stroke-width="3.5"/>
      <!-- Cockpit & Windows -->
      <path d="M 96 -56 H 124 L 138 -40 H 96 Z" fill="#1E293B" stroke="${ink}" stroke-width="2"/>
      <line x1="102" y1="-51" x2="122" y2="-51" stroke="#7DD3FC" stroke-width="3" stroke-linecap="round"/>
      ${[-134, -104, -74, -44, -14, 16, 46].map((wx) => `
        <rect x="${wx}" y="-54" width="21" height="17" rx="5" fill="#1E293B" stroke="${ink}" stroke-width="2"/>
        <line x1="${wx + 4}" y1="-49" x2="${wx + 13}" y2="-49" stroke="#BAE6FD" stroke-width="2.5" stroke-linecap="round"/>
      `).join('')}
      <ellipse cx="145" cy="-31" rx="8" ry="4.5" fill="#FEF08A" stroke="${ink}" stroke-width="2"/>
    `;
  } else if (type === 'freight') {
    body = `
      <ellipse cx="-24" cy="4" rx="164" ry="8" fill="rgba(15,23,42,0.22)"/>
      <!-- Rear Container Flatcar -->
      <rect x="-178" y="-17" width="130" height="11" rx="3" fill="#475569" stroke="${ink}" stroke-width="2.5"/>
      <circle cx="-156" cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="-72"  cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <!-- 2.5D Blue & Green Containers with Top Bevels -->
      <polygon points="-172,-62 -162,-70 -106,-70 -116,-62" fill="#7DD3FC" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="-172" y="-62" width="56" height="45" rx="4" fill="#0284C7" stroke="${ink}" stroke-width="3"/>
      <polygon points="-110,-62 -100,-70 -44,-70 -54,-62" fill="#86EFAC" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="-110" y="-62" width="56" height="45" rx="4" fill="#16A34A" stroke="${ink}" stroke-width="3"/>
      <rect x="-48" y="-16" width="16" height="6" fill="${ink}"/>
      <!-- Red Electric Locomotive with 2.5D Roof -->
      <path d="M 10 -76 L 28 -92 L 46 -76" stroke="${ink}" stroke-width="3.5" fill="none"/>
      <line x1="8" y1="-92" x2="48" y2="-92" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
      <polygon points="-34,-68 -22,-78 120,-78 130,-68" fill="#F87171" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="-34" y="-68" width="164" height="58" rx="8" fill="#DC2626" stroke="${ink}" stroke-width="3.5"/>
      <rect x="-32" y="-26" width="160" height="9" fill="#FACC15"/>
      <rect x="86" y="-58" width="36" height="24" rx="5" fill="#1E293B" stroke="${ink}" stroke-width="2.2"/>
      <line x1="92" y1="-52" x2="114" y2="-52" stroke="#BAE6FD" stroke-width="3" stroke-linecap="round"/>
      <rect x="-14" y="-54" width="22" height="17" rx="4" fill="#BAE6FD" stroke="${ink}" stroke-width="2.5"/>
      <rect x="18"  y="-54" width="22" height="17" rx="4" fill="#BAE6FD" stroke="${ink}" stroke-width="2.5"/>
      <circle cx="122" cy="-16" r="6" fill="#FEF08A" stroke="${ink}" stroke-width="2"/>
      <circle cx="-12" cy="-4" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="24"  cy="-4" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="76"  cy="-4" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="110" cy="-4" r="8" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
    `;
  } else {
    const stripe = type === 'blue' ? '#2563EB' : (type === 'red' ? '#EF4444' : (type === 'yellow' ? '#EAB308' : '#22C55E'));
    body = `
      <ellipse cx="0" cy="4" rx="146" ry="8" fill="rgba(15,23,42,0.22)"/>
      <path d="M -24 -76 L -4 -94 L 16 -76" stroke="${ink}" stroke-width="3.5" fill="none"/>
      <line x1="-22" y1="-94" x2="14" y2="-94" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
      <!-- 2.5D Roof Bevel & AC units -->
      <polygon points="-146,-68 -134,-78 130,-78 142,-68" fill="#F1F5F9" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="-108" y="-84" width="64" height="11" rx="4" fill="#CBD5E1" stroke="${ink}" stroke-width="2.5"/>
      <rect x="34"   y="-84" width="64" height="11" rx="4" fill="#CBD5E1" stroke="${ink}" stroke-width="2.5"/>
      <!-- Main Stainless Car Body -->
      <rect x="-148" y="-68" width="290" height="58" rx="10" fill="url(#rc-commuter)" stroke="${ink}" stroke-width="3.5"/>
      <rect x="-146" y="-27" width="286" height="11" fill="${stripe}"/>
      <rect x="-146" y="-66" width="286" height="6" rx="2" fill="${stripe}"/>
      ${[-128, -42, 44].map((dx) => `
        <rect x="${dx}" y="-56" width="28" height="44" rx="4" fill="#FFFFFF" stroke="${ink}" stroke-width="2.2"/>
        <rect x="${dx + 4}" y="-51" width="8.5" height="18" rx="2" fill="#1E293B"/>
        <rect x="${dx + 15.5}" y="-51" width="8.5" height="18" rx="2" fill="#1E293B"/>
      `).join('')}
      ${[-92, -6, 80].map((wx) => `
        <rect x="${wx}" y="-54" width="42" height="22" rx="5" fill="#1E293B" stroke="${ink}" stroke-width="2.2"/>
        <line x1="${wx + 5}" y1="-48" x2="${wx + 24}" y2="-48" stroke="#BAE6FD" stroke-width="2.8" stroke-linecap="round"/>
      `).join('')}
      <circle cx="136" cy="-19" r="5.5" fill="#FEF08A" stroke="${ink}" stroke-width="2"/>
      <circle cx="-116" cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="-90"  cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="88"   cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
      <circle cx="114"  cy="-4" r="7.5" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
    `;
  }

  return `
    <g transform="translate(${x.toFixed(1)} ${railY.toFixed(1)}) scale(${(flip * scale).toFixed(2)} ${scale.toFixed(2)})">
      ${body}
    </g>
  `;
}

/** 2.5D Toon-Shaded Japanese Fumikiri Post (directly clickable to raise/lower gate!) */
export function renderFumikiriPostSvg(x, baseY, { gateClosedRatio = 0, lampPhase = 0, warningOn = false, arrowDir = 0, side = 'left' } = {}) {
  const ink = '#1E293B';
  const isLeft = side === 'left';
  const openDeg = isLeft ? -84 : 84;
  const barDeg = openDeg * (1 - gateClosedRatio);
  const leftLit = warningOn && lampPhase === 0;
  const rightLit = warningOn && lampPhase === 1;

  return `
    <g data-act="toggle-gate" style="cursor:pointer;" transform="translate(${x} ${baseY})">
      <ellipse cx="4" cy="2" rx="26" ry="7" fill="rgba(15,23,42,0.22)"/>
      <rect x="-20" y="-14" width="40" height="16" rx="5" fill="#94A3B8" stroke="${ink}" stroke-width="3"/>
      <rect x="-8" y="-176" width="16" height="164" rx="4" fill="url(#rc-hazard)" stroke="${ink}" stroke-width="3"/>
      <rect x="-14" y="-192" width="28" height="18" rx="5" fill="#475569" stroke="${ink}" stroke-width="2.8"/>
      <circle cx="0" cy="-183" r="4.5" fill="#E2E8F0"/>

      <!-- X Crossbuck -->
      <g transform="translate(0 -152)">
        <rect x="-34" y="-6.5" width="68" height="13" rx="3.5" fill="url(#rc-hazard)" stroke="${ink}" stroke-width="2.6" transform="rotate(32)"/>
        <rect x="-34" y="-6.5" width="68" height="13" rx="3.5" fill="url(#rc-hazard)" stroke="${ink}" stroke-width="2.6" transform="rotate(-32)"/>
      </g>

      <!-- Direction Arrow Box -->
      <rect x="-28" y="-128" width="56" height="23" rx="6" fill="#0F172A" stroke="${ink}" stroke-width="2.5"/>
      <polygon points="-21,-116.5 -8,-124 -8,-109" fill="${arrowDir < 0 ? '#FB923C' : '#334155'}"/>
      <polygon points="21,-116.5 8,-124 8,-109" fill="${arrowDir > 0 ? '#FB923C' : '#334155'}"/>

      <!-- Dual Flashing Crimson Lamps -->
      <rect x="-32" y="-98" width="64" height="26" rx="13" fill="#1E293B" stroke="${ink}" stroke-width="2.8"/>
      ${leftLit ? `<circle cx="-16" cy="-85" r="24" fill="url(#rc-red-glow)"/>` : ''}
      ${rightLit ? `<circle cx="16" cy="-85" r="24" fill="url(#rc-red-glow)"/>` : ''}
      <circle cx="-16" cy="-85" r="9.5" fill="${leftLit ? '#EF4444' : '#450A0A'}" stroke="${ink}" stroke-width="2.2"/>
      <circle cx="16"  cy="-85" r="9.5" fill="${rightLit ? '#EF4444' : '#450A0A'}" stroke="${ink}" stroke-width="2.2"/>
      ${leftLit ? `<circle cx="-18" cy="-88" r="3.5" fill="#FEF08A"/>` : ''}
      ${rightLit ? `<circle cx="14" cy="-88" r="3.5" fill="#FEF08A"/>` : ''}

      <!-- Rotating Striped Barrier Arm -->
      <g transform="translate(0 -46)">
        <g transform="rotate(${barDeg.toFixed(1)})">
          <rect x="${isLeft ? -36 : 12}" y="-8" width="24" height="16" rx="6" fill="#EF4444" stroke="${ink}" stroke-width="2.8"/>
          <rect x="${isLeft ? 0 : -136}" y="-6" width="136" height="12" rx="4" fill="url(#rc-hazard)" stroke="${ink}" stroke-width="2.8"/>
          <rect x="${isLeft ? 120 : -136}" y="-6" width="16" height="12" rx="3" fill="#EF4444" stroke="${ink}" stroke-width="2"/>
        </g>
        <rect x="-15" y="-15" width="30" height="30" rx="7" fill="#FACC15" stroke="${ink}" stroke-width="3"/>
        <circle cx="0" cy="0" r="6.5" fill="#334155"/>
      </g>
    </g>
  `;
}

/** 2.5D Chunky Toon Car */
export function renderRoadCarSvg(x, y, color = '#3B82F6', roof = '#93C5FD') {
  const ink = '#1E293B';
  return `
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="0" cy="18" rx="34" ry="6" fill="rgba(15,23,42,0.24)"/>
      <rect x="-34" y="-12" width="68" height="26" rx="9" fill="${color}" stroke="${ink}" stroke-width="3"/>
      <path d="M -20 -12 L -11 -28 H 15 L 24 -12 Z" fill="${roof}" stroke="${ink}" stroke-width="2.8" stroke-linejoin="round"/>
      <line x1="-26" y1="-5" x2="22" y2="-5" stroke="rgba(255,255,255,0.45)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-19" cy="14" r="9" fill="#1E293B" stroke="#E2E8F0" stroke-width="2.5"/>
      <circle cx="19"  cy="14" r="9" fill="#1E293B" stroke="#E2E8F0" stroke-width="2.5"/>
      <circle cx="29"  cy="-1" r="4" fill="#FEF08A" stroke="${ink}" stroke-width="1.5"/>
    </g>
  `;
}
