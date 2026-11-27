// Lingokids / LogicLike style matte-toy SVG assets & physics calibration for Lock Lab (カギ ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export function buildLockDefsSvg() {
  return `
    <defs>
      <!-- Matte Anodized Honey Brass (no harsh black lines, soft satin warmth) -->
      <linearGradient id="ll-brass-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FBD364"/>
        <stop offset="100%" stop-color="#E5A931"/>
      </linearGradient>
      <linearGradient id="ll-brass-plug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFE591"/>
        <stop offset="100%" stop-color="#F0B73B"/>
      </linearGradient>

      <!-- Matte Key Finishes (Honey Gold, Satin Silver, Warm Coral-Copper) -->
      <linearGradient id="ll-key-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFE484"/>
        <stop offset="100%" stop-color="#EAB338"/>
      </linearGradient>
      <linearGradient id="ll-key-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#D5DEE8"/>
      </linearGradient>
      <linearGradient id="ll-key-copper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFB088"/>
        <stop offset="100%" stop-color="#E87A48"/>
      </linearGradient>

      <!-- Satin Brushed Steel Bolt & Dial -->
      <linearGradient id="ll-satin-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="55%" stop-color="#E6EDF4"/>
        <stop offset="100%" stop-color="#C5D1DE"/>
      </linearGradient>

      <!-- Soft Sculpted Cylindrical Pins (Coral Red & Warm Gold) -->
      <linearGradient id="ll-driver-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#E85353"/>
        <stop offset="32%" stop-color="#FF8787"/>
        <stop offset="72%" stop-color="#F26464"/>
        <stop offset="100%" stop-color="#C94141"/>
      </linearGradient>
      <linearGradient id="ll-key-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#DFA023"/>
        <stop offset="32%" stop-color="#FFE58F"/>
        <stop offset="72%" stop-color="#F5BD3E"/>
        <stop offset="100%" stop-color="#C68816"/>
      </linearGradient>

      <!-- Scandinavian Warm Oak Door Jamb -->
      <linearGradient id="ll-oak" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#DFB382"/>
        <stop offset="100%" stop-color="#C5905A"/>
      </linearGradient>
    </defs>
  `;
}

// Exact calibrated pin heights (0.00px shear-line accuracy)
export const PIN_CAL = {
  shearY: 206,
  plugBottomY: 322,
  chamberTopY: 76,
  keyBottomY: 308,
  driverLen: 48,
  pinW: 28,
  restBottomY: 294,
  bittingY(level) {
    return 224 + level * 12;
  },
  keyPinLen(targetLevel) {
    return this.bittingY(targetLevel) - this.shearY;
  }
};

export function buildSpringPath(cx, yTop, yBot, coils = 6, halfW = 9.5) {
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

const KEY_SHADOW = {
  'll-key-gold':   '#C28A1C',
  'll-key-silver': '#A6B5C6',
  'll-key-copper': '#C25B2F'
};

/** Clean Matte-Toy Key (no harsh black outlines; sculpted with same-hue bottom lip & soft specular) */
export function renderKeySvg(cuts, keyShiftX, { fillId = 'll-key-gold', bowShape = 'classic', label = '', glowReady = false } = {}) {
  const pinCount = cuts.length;
  const shoulderX = getKeyShoulderX(pinCount) + keyShiftX;
  const tipX = getPinSlotX(pinCount - 1, pinCount) + 34 + keyShiftX;
  const botY = PIN_CAL.keyBottomY;
  const lip = KEY_SHADOW[fillId] || '#C28A1C';

  let d = `M ${shoulderX.toFixed(1)} ${botY}`;
  d += ` L ${shoulderX.toFixed(1)} ${(PIN_CAL.bittingY(cuts[0]) - 8).toFixed(1)}`;
  for (let x = shoulderX + 4; x <= tipX - 4; x += 4) {
    const y = sampleKeySurfaceY(x, keyShiftX, cuts);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${tipX.toFixed(1)} ${(botY - 10).toFixed(1)}`;
  d += ` L ${(tipX - 8).toFixed(1)} ${botY} Z`;

  const bowCx = shoulderX - 56;
  const bowCy = 268;
  let bowDepth = '';
  let bowFace = '';
  if (bowShape === 'round') {
    bowDepth = `<circle cx="${bowCx.toFixed(1)}" cy="${bowCy + 7}" r="49" fill="${lip}"/>`;
    bowFace = `
      <circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="49" fill="url(#${fillId})"/>
      <path d="M ${(bowCx - 28).toFixed(1)} ${bowCy - 30} A 40 40 0 0 1 ${(bowCx + 24).toFixed(1)} ${bowCy - 32}" stroke="rgba(255,255,255,0.65)" stroke-width="5" stroke-linecap="round" fill="none"/>
      <ellipse cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" rx="9.5" ry="14.5" fill="#266867"/>
    `;
  } else if (bowShape === 'hex') {
    const pts = (oy) => `${(bowCx - 48).toFixed(1)},${bowCy + oy} ${(bowCx - 23).toFixed(1)},${bowCy - 44 + oy} ${(bowCx + 28).toFixed(1)},${bowCy - 44 + oy} ${(bowCx + 50).toFixed(1)},${bowCy + oy} ${(bowCx + 28).toFixed(1)},${bowCy + 44 + oy} ${(bowCx - 23).toFixed(1)},${bowCy + 44 + oy}`;
    bowDepth = `<polygon points="${pts(7)}" fill="${lip}" stroke="${lip}" stroke-width="6" stroke-linejoin="round"/>`;
    bowFace = `
      <polygon points="${pts(0)}" fill="url(#${fillId})" stroke="url(#${fillId})" stroke-width="6" stroke-linejoin="round"/>
      <line x1="${(bowCx - 18).toFixed(1)}" y1="${bowCy - 34}" x2="${(bowCx + 22).toFixed(1)}" y2="${bowCy - 34}" stroke="rgba(255,255,255,0.65)" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" r="11" fill="#266867"/>
    `;
  } else {
    bowDepth = `<rect x="${(bowCx - 48).toFixed(1)}" y="${bowCy - 40}" width="98" height="92" rx="28" fill="${lip}"/>`;
    bowFace = `
      <rect x="${(bowCx - 48).toFixed(1)}" y="${bowCy - 46}" width="98" height="92" rx="28" fill="url(#${fillId})"/>
      <line x1="${(bowCx - 26).toFixed(1)}" y1="${bowCy - 35}" x2="${(bowCx + 26).toFixed(1)}" y2="${bowCy - 35}" stroke="rgba(255,255,255,0.65)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" r="11" fill="#266867"/>
    `;
  }

  return `
    <g class="ll-key-group" data-key-bow="1" style="cursor:grab;">
      ${glowReady ? `<circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="60" fill="none" stroke="rgba(110,231,183,0.9)" stroke-width="6" stroke-dasharray="14 10"/>` : ''}
      <!-- Matte 3D bottom lip -->
      <path d="${d}" transform="translate(0 5)" fill="${lip}"/>
      ${bowDepth}
      <!-- Shoulder collar -->
      <rect x="${(shoulderX - 10).toFixed(1)}" y="226" width="14" height="86" rx="5" fill="${lip}"/>
      <rect x="${(shoulderX - 10).toFixed(1)}" y="223" width="14" height="84" rx="5" fill="url(#${fillId})"/>
      ${bowFace}
      ${label ? `<text x="${(bowCx + 14).toFixed(1)}" y="${bowCy + 9}" text-anchor="middle" font-size="25" font-weight="900" fill="${lip}" font-family="${FONT_ROUND}">${label}</text>` : ''}
      <!-- Smooth bitted blade -->
      <path d="${d}" fill="url(#${fillId})"/>
      <line x1="${(shoulderX + 8).toFixed(1)}" y1="${botY - 11}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 11}" stroke="${lip}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
      <line x1="${(shoulderX + 8).toFixed(1)}" y1="${botY - 15}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 15}" stroke="rgba(255,255,255,0.65)" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `;
}

/** Minimal Lingokids-style rounded tray card for selecting keys */
export function renderBenchKeySvg(keySpec, x, y, selected) {
  const lip = KEY_SHADOW[keySpec.fillId] || '#C28A1C';
  const cuts = keySpec.cuts;
  const shoulderX = 50;
  const stepX = 14;
  const tipX = shoulderX + cuts.length * stepX + 10;
  let d = `M ${shoulderX} 44 L ${shoulderX} 27`;
  cuts.forEach((h, i) => {
    const px = shoulderX + 7 + i * stepX;
    const py = 23 + h * 3.0;
    d += ` L ${px - 3.5} ${py.toFixed(1)} L ${px + 3.5} ${py.toFixed(1)}`;
    if (i < cuts.length - 1) d += ` L ${px + 7} ${(py - 3.5).toFixed(1)}`;
  });
  d += ` L ${tipX} 35 L ${tipX - 4} 44 Z`;

  const bow = keySpec.bowShape === 'round'
    ? `<circle cx="28" cy="34" r="19" fill="url(#${keySpec.fillId})"/><circle cx="19" cy="34" r="4.5" fill="${selected ? '#FFFDF7' : 'rgba(255,255,255,0.35)'}"/>`
    : keySpec.bowShape === 'hex'
    ? `<polygon points="9,34 19,16 40,16 49,34 40,52 19,52" fill="url(#${keySpec.fillId})" stroke="url(#${keySpec.fillId})" stroke-width="3" stroke-linejoin="round"/><circle cx="19" cy="34" r="4.5" fill="${selected ? '#FFFDF7' : 'rgba(255,255,255,0.35)'}"/>`
    : `<rect x="9" y="15" width="42" height="38" rx="12" fill="url(#${keySpec.fillId})"/><circle cx="19" cy="34" r="4.5" fill="${selected ? '#FFFDF7' : 'rgba(255,255,255,0.35)'}"/>`;

  return `
    <g data-pick-key="${keySpec.idx}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <rect x="0" y="6" width="142" height="64" rx="20" fill="${selected ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.12)'}"/>
      <rect x="0" y="0" width="142" height="64" rx="20"
        fill="${selected ? '#FFFFFF' : 'rgba(255,255,255,0.22)'}"
        stroke="${selected ? '#6EE7B7' : 'rgba(255,255,255,0.38)'}" stroke-width="${selected ? '4' : '2.5'}"/>
      <g transform="translate(2 -2)">
        <path d="${d}" transform="translate(0 3)" fill="${lip}" opacity="0.65"/>
        ${bow}
        <path d="${d}" fill="url(#${keySpec.fillId})"/>
        <text x="34" y="40" text-anchor="middle" font-size="15" font-weight="900" fill="${lip}" font-family="${FONT_ROUND}">${keySpec.label}</text>
      </g>
    </g>
  `;
}

export const MATCH_STAGES = [
  {
    name: '3ピン シリンダー',
    target: [2, 4, 1],
    keys: [
      { id: 'A', label: 'A', cuts: [4, 2, 3], fillId: 'll-key-silver', bowShape: 'round' },
      { id: 'B', label: 'B', cuts: [2, 4, 1], fillId: 'll-key-gold',   bowShape: 'classic' },
      { id: 'C', label: 'C', cuts: [2, 1, 4], fillId: 'll-key-copper', bowShape: 'hex' }
    ]
  },
  {
    name: '4ピン たからばこ',
    target: [4, 1, 3, 2],
    keys: [
      { id: 'A', label: 'A', cuts: [4, 2, 3, 2], fillId: 'll-key-gold',   bowShape: 'classic' },
      { id: 'B', label: 'B', cuts: [1, 4, 2, 3], fillId: 'll-key-copper', bowShape: 'hex' },
      { id: 'C', label: 'C', cuts: [4, 1, 3, 2], fillId: 'll-key-silver', bowShape: 'round' },
      { id: 'D', label: 'D', cuts: [3, 1, 4, 2], fillId: 'll-key-gold',   bowShape: 'hex' }
    ]
  },
  {
    name: '5ピン プロ シリンダー',
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
  { name: '3ピン あいかぎ', target: [3, 1, 4] },
  { name: '4ピン あいかぎ', target: [2, 5, 1, 4] },
  { name: '5ピン あいかぎ', target: [4, 1, 5, 2, 3] }
];

export const SAFE_STAGES = [
  {
    name: '2まい ダイヤル きんこ',
    wheels: [
      { targetNum: 3,  radius: 112, fill: '#F7C948', lip: '#D6A11E', label: '1' },
      { targetNum: 9,  radius: 78,  fill: '#4ECDC4', lip: '#2EA39B', label: '2' }
    ]
  },
  {
    name: '3まい ダイヤル きんこ',
    wheels: [
      { targetNum: 2,  radius: 118, fill: '#F7C948', lip: '#D6A11E', label: '1' },
      { targetNum: 7,  radius: 88,  fill: '#4ECDC4', lip: '#2EA39B', label: '2' },
      { targetNum: 10, radius: 58,  fill: '#FF7B7B', lip: '#DB5454', label: '3' }
    ]
  }
];
