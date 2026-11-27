// High-precision SVG assets & stages for Lock Lab (カギ ラボ)

export function buildLockDefsSvg() {
  return `
    <defs>
      <!-- Brushed Brass Cylinder Body -->
      <linearGradient id="ll-brass-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FCE38A"/>
        <stop offset="22%" stop-color="#E5B94E"/>
        <stop offset="55%" stop-color="#C9932B"/>
        <stop offset="85%" stop-color="#9A6B16"/>
        <stop offset="100%" stop-color="#78500D"/>
      </linearGradient>
      <!-- Lighter Brass Plug (rotates inside cylinder) -->
      <linearGradient id="ll-brass-plug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF0B3"/>
        <stop offset="35%" stop-color="#F2CC63"/>
        <stop offset="78%" stop-color="#D19B2E"/>
        <stop offset="100%" stop-color="#9C6E17"/>
      </linearGradient>
      <!-- Key Gold Metallic -->
      <linearGradient id="ll-key-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF5CC"/>
        <stop offset="30%" stop-color="#F6CE5B"/>
        <stop offset="70%" stop-color="#D49B2A"/>
        <stop offset="100%" stop-color="#986A14"/>
      </linearGradient>
      <!-- Key Silver Metallic -->
      <linearGradient id="ll-key-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="30%" stop-color="#E2E8F0"/>
        <stop offset="70%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
      <!-- Key Copper Metallic -->
      <linearGradient id="ll-key-copper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FED7AA"/>
        <stop offset="35%" stop-color="#F97316"/>
        <stop offset="75%" stop-color="#C2410C"/>
        <stop offset="100%" stop-color="#7C2D12"/>
      </linearGradient>
      <!-- Chrome Steel Deadbolt & Dial -->
      <linearGradient id="ll-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F8FAFC"/>
        <stop offset="28%" stop-color="#CBD5E1"/>
        <stop offset="52%" stop-color="#FFFFFF"/>
        <stop offset="78%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <!-- Dark Steel Housing -->
      <linearGradient id="ll-steel-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="50%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <!-- Red/Copper Driver Pin -->
      <linearGradient id="ll-driver-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#991B1B"/>
        <stop offset="30%" stop-color="#EF4444"/>
        <stop offset="55%" stop-color="#FCA5A5"/>
        <stop offset="85%" stop-color="#DC2626"/>
        <stop offset="100%" stop-color="#7F1D1D"/>
      </linearGradient>
      <!-- Gold Key Pin -->
      <linearGradient id="ll-key-pin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#92400E"/>
        <stop offset="30%" stop-color="#F59E0B"/>
        <stop offset="55%" stop-color="#FEF08A"/>
        <stop offset="85%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#78350F"/>
      </linearGradient>
      <!-- Safe Steel Door -->
      <linearGradient id="ll-safe-door" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="48%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <!-- Safe Brass Wheel -->
      <radialGradient id="ll-wheel-brass" cx="45%" cy="40%" r="58%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="55%" stop-color="#EAB308"/>
        <stop offset="100%" stop-color="#854D0E"/>
      </radialGradient>
      <!-- Safe Teal Wheel -->
      <radialGradient id="ll-wheel-teal" cx="45%" cy="40%" r="58%">
        <stop offset="0%" stop-color="#99F6E4"/>
        <stop offset="55%" stop-color="#14B8A6"/>
        <stop offset="100%" stop-color="#115E59"/>
      </radialGradient>
      <!-- Safe Coral Wheel -->
      <radialGradient id="ll-wheel-coral" cx="45%" cy="40%" r="58%">
        <stop offset="0%" stop-color="#FECDD3"/>
        <stop offset="55%" stop-color="#F43F5E"/>
        <stop offset="100%" stop-color="#881337"/>
      </radialGradient>
      <!-- Door Wood Frame -->
      <linearGradient id="ll-door-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#B47B48"/>
        <stop offset="50%" stop-color="#966133"/>
        <stop offset="100%" stop-color="#784922"/>
      </linearGradient>
    </defs>
  `;
}

/**
 * Pin tumbler geometry constants (in SVG 800x480 viewBox):
 * - Shear line sits cleanly at Y = 236.
 * - Plug spans Y = 236 .. 332 (height 96).
 * - Key baseline (bottom edge of blade) sits at Y = 314.
 * - Cut level h in [1..5] sets the top of the key bitting notch at:
 *     bittingTopY(h) = 250 + (h - 1) * 10   (so h=1 is shallow/high ridge at y=250, h=5 is deep valley at y=290)
 * - For a target cut `targetH`, the key pin length is `shearY - bittingTopY(targetH)`:
 *     Wait: when key sits under pin with cut `actualH`, the key pin bottom rests on `bittingTopY(actualH)`.
 *     So key pin top = bittingTopY(actualH) - keyPinLength.
 *     If actualH === targetH, then keyPinTop === shearY (236) -> PERFECT SHEAR LINE!
 */
export const LOCK_GEO = {
  shearY: 236,
  plugBottomY: 332,
  chamberTopY: 96,
  keyBottomY: 314,
  driverPinLen: 52,
  pinWidth: 26,
  bittingTopY(level) {
    // level 1 (high ridge) -> y=250, level 5 (deep cut) -> y=290
    return 240 + level * 10;
  },
  keyPinLen(targetLevel) {
    return this.bittingTopY(targetLevel) - this.shearY + 14; // wait: let's keep keyPinTop exact!
  }
};

// Exact calibrated pin height:
// At rest (no key), pin bottom rests at Y = 296 (inside keyway).
// With key level h (1..5), key ridge surface is at Y = 252 + (h - 1) * 10 -> [252, 262, 272, 282, 292].
// So keyPinHeight = bittingY(targetH) - shearY = [16, 26, 36, 46, 56] -> let's give thicker visual pins!
export const PIN_CAL = {
  shearY: 222,
  plugBottomY: 342,
  chamberTopY: 88,
  keyBottomY: 326,
  driverLen: 50,
  pinW: 26,
  restBottomY: 310,
  // Level 1 (tall ridge) = 252, Level 2 = 264, Level 3 = 276, Level 4 = 288, Level 5 (deep cut) = 300
  bittingY(level) {
    return 240 + level * 12;
  },
  keyPinLen(targetLevel) {
    return this.bittingY(targetLevel) - this.shearY; // 30, 42, 54, 66, 78 -> crisp, super legible heights!
  }
};

/** Generate helical steel spring SVG path between yTop and yBot centered at cx */
export function buildSpringPath(cx, yTop, yBot, coils = 7, halfW = 10) {
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

/**
 * Sample the exact top surface Y of a key blade at local blade coordinate `lx` (0 = shoulder, bladeLen = tip).
 * Each pin slot i sits at `slotLocalX(i, pinCount)`.
 * Between slots are smooth beveled ridges so pins physically bounce as the key slides in!
 */
export function getPinSlotX(index, pinCount) {
  const startX = pinCount === 3 ? 330 : (pinCount === 4 ? 305 : 284);
  const spacing = pinCount === 5 ? 52 : 60;
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

  // Before tip reaches the pin, pin rests at bottom of keyway
  if (worldX > tipX || worldX < curShoulderX) {
    return PIN_CAL.restBottomY;
  }

  // Tapered nose ramp at tip (last 20px of blade)
  if (worldX > tipX - 20) {
    const t = (tipX - worldX) / 20; // 0 at tip -> 1 at first ridge
    const lastY = PIN_CAL.bittingY(cuts[pinCount - 1]);
    return PIN_CAL.restBottomY + (lastY - PIN_CAL.restBottomY) * t;
  }

  // Find surrounding bitting stations
  const spacing = pinCount === 5 ? 52 : 60;
  const firstSlotX = getPinSlotX(0, pinCount) + keyShiftX;
  const rel = (worldX - firstSlotX) / spacing;

  if (rel <= 0) {
    // Between shoulder and first cut
    return PIN_CAL.bittingY(cuts[0]);
  }
  const idx = Math.floor(rel);
  const frac = rel - idx;
  if (idx >= pinCount - 1) {
    return PIN_CAL.bittingY(cuts[pinCount - 1]);
  }

  const yA = PIN_CAL.bittingY(cuts[idx]);
  const yB = PIN_CAL.bittingY(cuts[idx + 1]);
  // Realistic flat valley at each cut center (width ~0.36) with a raised triangular ridge between cuts!
  const ridgeY = Math.min(yA, yB) - 9;
  if (frac < 0.22) return yA;
  if (frac < 0.5) {
    const t = (frac - 0.22) / 0.28;
    return yA + (ridgeY - yA) * t;
  }
  if (frac < 0.78) {
    const t = (frac - 0.5) / 0.28;
    return ridgeY + (yB - ridgeY) * t;
  }
  return yB;
}

/** Build detailed realistic SVG for a key positioned at `keyShiftX` (0 = fully inserted) */
export function renderKeySvg(cuts, keyShiftX, { fillId = 'll-key-gold', bowShape = 'classic', label = '', stroke = '#78500D' } = {}) {
  const pinCount = cuts.length;
  const shoulderX = getKeyShoulderX(pinCount) + keyShiftX;
  const tipX = getPinSlotX(pinCount - 1, pinCount) + 34 + keyShiftX;
  const botY = PIN_CAL.keyBottomY;

  // Sample dense smooth top silhouette so blade matches physics 1-to-1
  let d = `M ${shoulderX.toFixed(1)} ${botY}`;
  d += ` L ${shoulderX.toFixed(1)} ${(PIN_CAL.bittingY(cuts[0]) - 8).toFixed(1)}`;
  const step = 4;
  for (let x = shoulderX + 4; x <= tipX - 4; x += step) {
    const y = sampleKeySurfaceY(x, keyShiftX, cuts);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L ${tipX.toFixed(1)} ${(botY - 10).toFixed(1)}`;
  d += ` L ${(tipX - 8).toFixed(1)} ${botY} Z`;

  // Key Bow (grip head) to the left of shoulder
  const bowCx = shoulderX - 54;
  const bowCy = 286;
  let bowSvg = '';
  if (bowShape === 'round') {
    bowSvg = `
      <circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="50" fill="url(#${fillId})" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="${bowCx.toFixed(1)}" cy="${bowCy}" r="40" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.5"/>
      <ellipse cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" rx="10" ry="15" fill="#F8FAFC" stroke="${stroke}" stroke-width="2.5"/>
    `;
  } else if (bowShape === 'hex') {
    bowSvg = `
      <polygon points="${(bowCx - 50).toFixed(1)},${bowCy} ${(bowCx - 26).toFixed(1)},${bowCy - 46} ${(bowCx + 30).toFixed(1)},${bowCy - 46} ${(bowCx + 52).toFixed(1)},${bowCy} ${(bowCx + 30).toFixed(1)},${bowCy + 46} ${(bowCx - 26).toFixed(1)},${bowCy + 46}"
        fill="url(#${fillId})" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="${(bowCx - 24).toFixed(1)}" cy="${bowCy}" r="11" fill="#F8FAFC" stroke="${stroke}" stroke-width="2.5"/>
    `;
  } else {
    // Classic brass house-key bow
    bowSvg = `
      <rect x="${(bowCx - 50).toFixed(1)}" y="${bowCy - 48}" width="102" height="96" rx="26" fill="url(#${fillId})" stroke="${stroke}" stroke-width="3.5"/>
      <rect x="${(bowCx - 41).toFixed(1)}" y="${bowCy - 39}" width="84" height="78" rx="18" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.5"/>
      <circle cx="${(bowCx - 22).toFixed(1)}" cy="${bowCy}" r="11" fill="#F8FAFC" stroke="${stroke}" stroke-width="2.5"/>
    `;
  }

  return `
    <g class="ll-key-group">
      <!-- Shoulder collar -->
      <rect x="${(shoulderX - 10).toFixed(1)}" y="242" width="14" height="88" rx="4" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.5"/>
      ${bowSvg}
      ${label ? `<text x="${(bowCx + 12).toFixed(1)}" y="${bowCy + 8}" text-anchor="middle" font-size="24" font-weight="900" fill="${stroke}" font-family="sans-serif">${label}</text>` : ''}
      <!-- Precision bitted blade -->
      <path d="${d}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Machined longitudinal keyway milling groove -->
      <line x1="${(shoulderX + 6).toFixed(1)}" y1="${botY - 12}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 12}"
        stroke="${stroke}" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
      <line x1="${(shoulderX + 6).toFixed(1)}" y1="${botY - 15}" x2="${(tipX - 14).toFixed(1)}" y2="${botY - 15}"
        stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-linecap="round"/>
    </g>
  `;
}

/** Mini SVG preview of a key for the key selector tray */
export function renderKeyThumbSvg(cuts, fillId = 'll-key-gold', bowShape = 'classic', label = '') {
  const stroke = fillId === 'll-key-silver' ? '#475569' : (fillId === 'll-key-copper' ? '#7C2D12' : '#78500D');
  const pinCount = cuts.length;
  const shoulderX = 56;
  const stepX = 16;
  const tipX = shoulderX + pinCount * stepX + 12;
  let d = `M ${shoulderX} 46 L ${shoulderX} 26`;
  cuts.forEach((h, i) => {
    const x = shoulderX + 8 + i * stepX;
    const y = 22 + h * 3.2;
    d += ` L ${x - 4} ${y.toFixed(1)} L ${x + 4} ${y.toFixed(1)}`;
    if (i < pinCount - 1) d += ` L ${x + 8} ${(y - 4).toFixed(1)}`;
  });
  d += ` L ${tipX} 36 L ${tipX - 5} 46 Z`;

  const bow = bowShape === 'round'
    ? `<circle cx="30" cy="34" r="22" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.8"/><circle cx="20" cy="34" r="5" fill="#FFFFFF" stroke="${stroke}" stroke-width="2"/>`
    : bowShape === 'hex'
    ? `<polygon points="8,34 20,14 44,14 54,34 44,54 20,54" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="20" cy="34" r="5" fill="#FFFFFF" stroke="${stroke}" stroke-width="2"/>`
    : `<rect x="8" y="13" width="46" height="42" rx="12" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.8"/><circle cx="20" cy="34" r="5" fill="#FFFFFF" stroke="${stroke}" stroke-width="2"/>`;

  return `
    <svg width="108" height="48" viewBox="0 0 156 68" fill="none">
      ${bow}
      <path d="${d}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="${shoulderX + 4}" y1="41" x2="${tipX - 8}" y2="41" stroke="${stroke}" stroke-width="2.5" opacity="0.45"/>
      ${label ? `<text x="36" y="40" text-anchor="middle" font-size="16" font-weight="900" fill="${stroke}" font-family="sans-serif">${label}</text>` : ''}
    </svg>
  `;
}

/** Match stages (3-pin -> 4-pin -> 5-pin) */
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

/** Key-cutting custom stages */
export const CRAFT_STAGES = [
  { name: '3ピン あいかぎ つくり', target: [3, 1, 4] },
  { name: '4ピン あいかぎ つくり', target: [2, 5, 1, 4] },
  { name: '5ピン プロの あいかぎ', target: [4, 1, 5, 2, 3] }
];

/** Safe Combination Dial stages (angle 0..360 in 12 steps of 30 deg = numbers 0..11) */
export const SAFE_STAGES = [
  {
    name: '2まい ホイール きんこ',
    wheels: [
      { targetNum: 3,  radius: 126, fill: 'll-wheel-brass', color: '#EAB308', label: '1' },
      { targetNum: 9,  radius: 92,  fill: 'll-wheel-teal',  color: '#14B8A6', label: '2' }
    ]
  },
  {
    name: '3まい ホイール ぎんこう きんこ',
    wheels: [
      { targetNum: 2,  radius: 132, fill: 'll-wheel-brass', color: '#EAB308', label: '1' },
      { targetNum: 7,  radius: 100, fill: 'll-wheel-teal',  color: '#14B8A6', label: '2' },
      { targetNum: 10, radius: 68,  fill: 'll-wheel-coral', color: '#F43F5E', label: '3' }
    ]
  }
];
