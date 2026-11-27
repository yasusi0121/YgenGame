// High-craft 2.5D Toon-Shaded SVG assets & physics calibration for Lock Lab (カギ ラボ)

export function buildLockDefsSvg() {
  return `
    <defs>
      <!-- Warm Sunlit Workshop Wall & Oak Workbench -->
      <linearGradient id="ll-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FDF8EE"/>
        <stop offset="100%" stop-color="#F2E4CC"/>
      </linearGradient>
      <linearGradient id="ll-bench" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E4B884"/>
        <stop offset="14%" stop-color="#D29B63"/>
        <stop offset="100%" stop-color="#A8703E"/>
      </linearGradient>

      <!-- Cel-Shaded 2.5D Brass (Front, Top Bevel, Side Extrusion) -->
      <linearGradient id="ll-brass-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="48%" stop-color="#EAB308"/>
        <stop offset="50%" stop-color="#D99B07"/>
        <stop offset="100%" stop-color="#B47B09"/>
      </linearGradient>
      <linearGradient id="ll-brass-top" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FEF9C3"/>
        <stop offset="100%" stop-color="#FACC15"/>
      </linearGradient>
      <linearGradient id="ll-brass-plug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="52%" stop-color="#FACC15"/>
        <stop offset="54%" stop-color="#CA8A04"/>
        <stop offset="100%" stop-color="#A16207"/>
      </linearGradient>

      <!-- Cel-Shaded Key Materials -->
      <linearGradient id="ll-key-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="48%" stop-color="#FACC15"/>
        <stop offset="52%" stop-color="#D99B07"/>
        <stop offset="100%" stop-color="#B47B09"/>
      </linearGradient>
      <linearGradient id="ll-key-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="48%" stop-color="#E2E8F0"/>
        <stop offset="52%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <linearGradient id="ll-key-copper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FED7AA"/>
        <stop offset="48%" stop-color="#FB923C"/>
        <stop offset="52%" stop-color="#EA580C"/>
        <stop offset="100%" stop-color="#C2410C"/>
      </linearGradient>

      <!-- Cel-Shaded Chrome Steel (hard toon specular bands) -->
      <linearGradient id="ll-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="28%" stop-color="#E2E8F0"/>
        <stop offset="30%" stop-color="#FFFFFF"/>
        <stop offset="44%" stop-color="#CBD5E1"/>
        <stop offset="76%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>

      <!-- 2.5D Cylindrical Pin Cel-Shading (Vertical 3-band highlight/mid/shadow) -->
      <linearGradient id="ll-driver-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#DC2626"/>
        <stop offset="20%" stop-color="#F87171"/>
        <stop offset="38%" stop-color="#FECACA"/>
        <stop offset="48%" stop-color="#EF4444"/>
        <stop offset="80%" stop-color="#DC2626"/>
        <stop offset="100%" stop-color="#991B1B"/>
      </linearGradient>
      <linearGradient id="ll-key-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#D97706"/>
        <stop offset="20%" stop-color="#FBBF24"/>
        <stop offset="38%" stop-color="#FEF9C3"/>
        <stop offset="48%" stop-color="#F59E0B"/>
        <stop offset="80%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#92400E"/>
      </linearGradient>

      <!-- 2.5D Toon Safe Body (Teal-Slate Industrial Enamel) -->
      <linearGradient id="ll-safe-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="50%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
      <linearGradient id="ll-door-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#D2955B"/>
        <stop offset="28%" stop-color="#C08046"/>
        <stop offset="100%" stop-color="#8C5425"/>
      </linearGradient>
    </defs>
  `;
}

// Calibrated 2.5D cylinder pin math (exact 0.00px shear line alignment!)
export const PIN_CAL = {
  shearY: 204,
  plugBottomY: 320,
  chamberTopY: 74,
  keyBottomY: 306,
  driverLen: 48,
  pinW: 28,
  restBottomY: 292,
  // Level 1 (high ridge) = 234 .. Level 5 (deep valley) = 282
  bittingY(level) {
    return 222 + level * 12;
  },
  keyPinLen(targetLevel) {
    return this.bittingY(targetLevel) - this.shearY;
  }
};

export function buildSpringPath(cx, yTop, yBot, coils = 6, halfW = 10) {
  const h = Math.max(10, yBot - yTop);
  const step = h / (coils * 2);
  let d = `M ${cx.toFixed(1)} ${yTop.toFixed(1)}`;
  for (let i = 0; i < coils * 2; i++) {
    const y = yTop + (i + 1) * step;
    const x = cx + (i % 2 === 0 ? halfW : -halfW);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${cx.toFixed(1)} ${yBot.toFixed(1)}`;
  return d;
}

export function getPinSlotX(index, pinCount) {
  const startX = pinCount === 3 ? 344 : (pinCount === 4 ? 320 : 298);
  const spacing = pinCount === 5 ? 50 : 58;
  return startX + index * spacing;
}

export function getKeyShoulderX(pinCount) {
  return getPinSlotX(0, pinCount) - 48;
}

export function sampleKeySurfaceY(worldX, keyShiftX, cuts) {
  const pinCount = cuts.length;
  const shoulderFullX = getKeyShoulderX(pinCount);
  const curShoulderX = shoulderFullX + keyShiftX;
  const lastSlotFullX = getPinSlotX(pinCount - 1, pinCount);
  const tipX = lastSlotFullX + 34 + keyShiftX;

  if (worldX > tipX || worldX < curShoulderX) return PIN_CAL.restBottomY;
  if (worldX > tipX - 20) {
    const t = (tipX - worldX) / 20;
    const lastY = PIN_CAL.bittingY(cuts[pinCount - 1]);
    return PIN_CAL.restBottomY + (lastY - PIN_CAL.restBottomY) * t;
  }

  const spacing = pinCount === 5 ? 50 : 58;
  const firstSlotX = getPinSlotX(0, pinCount) + keyShiftX;
  const rel = (worldX - firstSlotX) / spacing;
  if (rel <= 0) return PIN_CAL.bittingY(cuts[0]);
  const idx = Math.floor(rel);
  const frac = rel - idx;
  if (idx >= pinCount - 1) return PIN_CAL.bittingY(cuts[pinCount - 1]);

  const yA = PIN_CAL.bittingY(cuts[idx]);
  const yB = PIN_CAL.bittingY(cuts[idx + 1]);
  const ridgeY = Math.min(yA, yB) - 9;
  if (frac < 0.22) return yA;
  if (frac < 0.5) return yA + (ridgeY - yA) * ((frac - 0.22) / 0.28);
  if (frac < 0.78) return ridgeY + (yB - ridgeY) * ((frac - 0.5) / 0.28);
  return yB;
}

/** 2.5D Toon-Shaded Key with thick extruded bottom edge & bold dark ink outline */
export function renderKeySvg(cuts, keyShiftX, { fillId = 'll-key-gold', bowShape = 'classic', label = '', glowReady = false } = {}) {
  const pinCount = cuts.length;
  const shoulderX = getKeyShoulderX(pinCount) + keyShiftX;
  const tipX = getPinSlotX(pinCount - 1, pinCount) + 34 + keyShiftX;
  const botY = PIN_CAL.keyBottomY;
  const ink = '#1E293B';

  let d = `M ${shoulderX.toFixed(1)} ${botY}`;
  d += ` L ${shoulderX.toFixed(1)} ${(PIN_CAL.bittingY(cuts[0]) - 8).toFixed(1)}`;
  for (let x = shoulderX + 4; x <= tipX - 4; x += 4) {
    const y = sampleKeySurfaceY(x, keyShiftX, cuts);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${tipX.toFixed(1)} ${(botY - 10).toFixed(1)}`;
  d += ` L ${(tipX - 8).toFixed(1)} ${botY} Z`;

  const bowCx = shoulderX - 56;
  const bowCy = 266;
  let bowDepth = '';
  let bowFace = '';
  if (bowShape === 'round') {
    bowDepth = `<circle cx="${(bowCx - 4).toFixed(1)}" cy="${bowCy + 7}" r="50" fill="#78350F" stroke="${ink}" stroke-width="3.5"/>`;
    bowFace = `
      <circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="50" fill="url(#${fillId})" stroke="${ink}" stroke-width="3.5"/>
      <path d="M ${(bowCx - 30).toFixed(1)} ${bowCy - 30} A 42 42 0 0 1 ${(bowCx + 24).toFixed(1)} ${bowCy - 34}" stroke="rgba(255,255,255,0.72)" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" rx="10" ry="15" fill="#F2E4CC" stroke="${ink}" stroke-width="3"/>
    `;
  } else if (bowShape === 'hex') {
    const pts = (ox, oy) => `${(bowCx - 50 + ox).toFixed(1)},${bowCy + oy} ${(bowCx - 24 + ox).toFixed(1)},${bowCy - 46 + oy} ${(bowCx + 30 + ox).toFixed(1)},${bowCy - 46 + oy} ${(bowCx + 52 + ox).toFixed(1)},${bowCy + oy} ${(bowCx + 30 + ox).toFixed(1)},${bowCy + 46 + oy} ${(bowCx - 24 + ox).toFixed(1)},${bowCy + 46 + oy}`;
    bowDepth = `<polygon points="${pts(-4, 7)}" fill="#78350F" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>`;
    bowFace = `
      <polygon points="${pts(0, 0)}" fill="url(#${fillId})" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="${(bowCx - 20).toFixed(1)}" y1="${bowCy - 36}" x2="${(bowCx + 24).toFixed(1)}" y2="${bowCy - 36}" stroke="rgba(255,255,255,0.7)" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" r="11" fill="#F2E4CC" stroke="${ink}" stroke-width="3"/>
    `;
  } else {
    bowDepth = `<rect x="${(bowCx - 54).toFixed(1)}" y="${bowCy - 41}" width="102" height="96" rx="26" fill="#78350F" stroke="${ink}" stroke-width="3.5"/>`;
    bowFace = `
      <rect x="${(bowCx - 50).toFixed(1)}" y="${bowCy - 48}" width="102" height="96" rx="26" fill="url(#${fillId})" stroke="${ink}" stroke-width="3.5"/>
      <line x1="${(bowCx - 28).toFixed(1)}" y1="${bowCy - 37}" x2="${(bowCx + 28).toFixed(1)}" y2="${bowCy - 37}" stroke="rgba(255,255,255,0.72)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" r="11" fill="#F2E4CC" stroke="${ink}" stroke-width="3"/>
    `;
  }

  return `
    <g class="ll-key-group" data-key-bow="1" style="cursor:grab;">
      <!-- Soft cast shadow on workbench -->
      <ellipse cx="${(bowCx + 10).toFixed(1)}" cy="${botY + 34}" rx="56" ry="12" fill="rgba(30,41,59,0.16)"/>
      <!-- 2.5D Extruded Blade Thickness -->
      <path d="${d}" transform="translate(-3 5)" fill="#78350F" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- 2.5D Extruded Bow Thickness -->
      ${bowDepth}
      <!-- Shoulder Collar -->
      <rect x="${(shoulderX - 11).toFixed(1)}" y="222" width="15" height="90" rx="5" fill="url(#${fillId})" stroke="${ink}" stroke-width="3"/>
      <!-- Main Bow Face -->
      ${bowFace}
      ${glowReady ? `<circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="58" fill="none" stroke="#22C55E" stroke-width="5" stroke-dasharray="14 8"/>` : ''}
      ${label ? `<text x="${(bowCx + 14).toFixed(1)}" y="${bowCy + 9}" text-anchor="middle" font-size="26" font-weight="900" fill="${ink}" font-family="sans-serif">${label}</text>` : ''}
      <!-- Main Precision Blade -->
      <path d="${d}" fill="url(#${fillId})" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
      <!-- Machined Groove + Cel Specular -->
      <line x1="${(shoulderX + 6).toFixed(1)}" y1="${botY - 12}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 12}" stroke="${ink}" stroke-width="4.5" stroke-linecap="round" opacity="0.35"/>
      <line x1="${(shoulderX + 6).toFixed(1)}" y1="${botY - 16}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 16}" stroke="rgba(255,255,255,0.75)" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `;
}

/** 2.5D Diegetic Key Peg resting right on the wooden workbench */
export function renderBenchKeySvg(keySpec, x, y, selected) {
  const ink = '#1E293B';
  const cuts = keySpec.cuts;
  const shoulderX = 52;
  const stepX = 14;
  const tipX = shoulderX + cuts.length * stepX + 10;
  let d = `M ${shoulderX} 44 L ${shoulderX} 26`;
  cuts.forEach((h, i) => {
    const px = shoulderX + 7 + i * stepX;
    const py = 22 + h * 3.0;
    d += ` L ${px - 3.5} ${py.toFixed(1)} L ${px + 3.5} ${py.toFixed(1)}`;
    if (i < cuts.length - 1) d += ` L ${px + 7} ${(py - 3.5).toFixed(1)}`;
  });
  d += ` L ${tipX} 35 L ${tipX - 4} 44 Z`;

  const bow = keySpec.bowShape === 'round'
    ? `<circle cx="28" cy="34" r="20" fill="url(#${keySpec.fillId})" stroke="${ink}" stroke-width="3"/><circle cx="19" cy="34" r="4.5" fill="#D29B63" stroke="${ink}" stroke-width="2"/>`
    : keySpec.bowShape === 'hex'
    ? `<polygon points="8,34 19,15 41,15 51,34 41,53 19,53" fill="url(#${keySpec.fillId})" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><circle cx="19" cy="34" r="4.5" fill="#D29B63" stroke="${ink}" stroke-width="2"/>`
    : `<rect x="8" y="14" width="44" height="40" rx="11" fill="url(#${keySpec.fillId})" stroke="${ink}" stroke-width="3"/><circle cx="19" cy="34" r="4.5" fill="#D29B63" stroke="${ink}" stroke-width="2"/>`;

  return `
    <g data-pick-key="${keySpec.idx}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <!-- Raised wooden coaster slot -->
      <rect x="-4" y="6" width="144" height="64" rx="16" fill="${selected ? '#FEF08A' : '#B9804A'}" stroke="${selected ? '#16A34A' : '#784922'}" stroke-width="${selected ? '4' : '2.5'}"/>
      <rect x="-4" y="0" width="144" height="64" rx="16" fill="${selected ? '#FFFBEB' : '#E5BA88'}" stroke="${selected ? '#16A34A' : '#784922'}" stroke-width="${selected ? '4' : '2.5'}"/>
      <g transform="translate(2 -2)">
        <path d="${d}" transform="translate(-1 3)" fill="#78350F" opacity="0.45"/>
        ${bow}
        <path d="${d}" fill="url(#${keySpec.fillId})" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
        <text x="34" y="40" text-anchor="middle" font-size="16" font-weight="900" fill="${ink}" font-family="sans-serif">${keySpec.label}</text>
      </g>
    </g>
  `;
}

export const MATCH_STAGES = [
  {
    name: '3ピン げんかん カギ',
    target: [2, 4, 1],
    keys: [
      { id: 'A', label: 'A', cuts: [4, 2, 3], fillId: 'll-key-silver', bowShape: 'round' },
      { id: 'B', label: 'B', cuts: [2, 4, 1], fillId: 'll-key-gold',   bowShape: 'classic' },
      { id: 'C', label: 'C', cuts: [2, 1, 4], fillId: 'll-key-copper', bowShape: 'hex' }
    ]
  },
  {
    name: '4ピン たからばこ カギ',
    target: [4, 1, 3, 2],
    keys: [
      { id: 'A', label: 'A', cuts: [4, 2, 3, 2], fillId: 'll-key-gold',   bowShape: 'classic' },
      { id: 'B', label: 'B', cuts: [1, 4, 2, 3], fillId: 'll-key-copper', bowShape: 'hex' },
      { id: 'C', label: 'C', cuts: [4, 1, 3, 2], fillId: 'll-key-silver', bowShape: 'round' },
      { id: 'D', label: 'D', cuts: [3, 1, 4, 2], fillId: 'll-key-gold',   bowShape: 'hex' }
    ]
  },
  {
    name: '5ピン ほんかく シリンダー',
    target: [1, 4, 2, 5, 3],
    keys: [
      { id: 'A', label: 'A', cuts: [1, 4, 3, 5, 3], fillId: 'll-key-silver', bowShape: 'classic' },
      { id: 'B', label: 'B', cuts: [2, 4, 2, 5, 1], fillId: 'll-key-copper', bowShape: 'round' },
      { id: 'C', label: 'C', cuts: [1, 4, 2, 5, 3], fillId: 'll-key-gold',   bowShape: 'hex' },
      { id: 'D', label: 'D', cuts: [5, 2, 4, 1, 3], fillId: 'll-key-silver', bowShape: 'round' }
    ]
  }
];

export const CRAFT_STAGES = [
  { name: '3ピン あいかぎ つくり', target: [3, 1, 4] },
  { name: '4ピン あいかぎ つくり', target: [2, 5, 1, 4] },
  { name: '5ピン プロの あいかぎ', target: [4, 1, 5, 2, 3] }
];

export const SAFE_STAGES = [
  {
    name: '2まい ホイール きんこ',
    wheels: [
      { targetNum: 3,  radius: 112, fill: '#FACC15', rim: '#CA8A04', label: '1' },
      { targetNum: 9,  radius: 78,  fill: '#2DD4BF', rim: '#0D9488', label: '2' }
    ]
  },
  {
    name: '3まい ホイール ぎんこう きんこ',
    wheels: [
      { targetNum: 2,  radius: 118, fill: '#FACC15', rim: '#CA8A04', label: '1' },
      { targetNum: 7,  radius: 88,  fill: '#2DD4BF', rim: '#0D9488', label: '2' },
      { targetNum: 10, radius: 58,  fill: '#FB7185', rim: '#E11D48', label: '3' }
    ]
  }
];
