// High-precision SVG assets & plumbing stages for Water Lab (すいどう ラボ)

export function buildWaterDefsSvg() {
  return `
    <defs>
      <!-- Brushed Copper/Brass Collar -->
      <linearGradient id="wl-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="45%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#78350F"/>
      </linearGradient>
      <!-- Steel Flange -->
      <linearGradient id="wl-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F1F5F9"/>
        <stop offset="50%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <!-- Vivid Pressurized Water -->
      <linearGradient id="wl-water-h" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7DD3FC"/>
        <stop offset="40%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#0369A1"/>
      </linearGradient>
      <linearGradient id="wl-water-v" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#7DD3FC"/>
        <stop offset="40%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#0369A1"/>
      </linearGradient>
      <!-- Red Valve Wheel -->
      <radialGradient id="wl-red-wheel" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#FCA5A5"/>
        <stop offset="45%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="#991B1B"/>
      </radialGradient>
      <!-- Tank Glass Gradient -->
      <linearGradient id="wl-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.08)"/>
        <stop offset="85%" stop-color="rgba(255,255,255,0.05)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.35)"/>
      </linearGradient>
    </defs>
  `;
}

/** Render an industrial red 5-spoke gate valve centered at (x, y) */
export function renderValveSvg(id, x, y, open, spinDeg = 0) {
  const spokes = [0, 72, 144, 216, 288].map((a) => `
    <line x1="0" y1="0" x2="0" y2="-25" stroke="#B91C1C" stroke-width="5.5" stroke-linecap="round" transform="rotate(${a})"/>
    <line x1="0" y1="0" x2="0" y2="-25" stroke="#FCA5A5" stroke-width="1.8" stroke-linecap="round" transform="rotate(${a})"/>
  `).join('');

  return `
    <g data-valve="${id}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <!-- Brass Valve Body & Flanges -->
      <rect x="-24" y="-18" width="48" height="36" rx="8" fill="url(#wl-brass)" stroke="#78350F" stroke-width="2.5"/>
      <!-- Internal Gate Indicator Strip (green open / red closed) -->
      <rect x="-8" y="-12" width="16" height="24" rx="4" fill="${open ? '#22C55E' : '#EF4444'}" stroke="#FFFFFF" stroke-width="1.8"/>
      <!-- Rotating Red Handwheel -->
      <g transform="rotate(${spinDeg.toFixed(1)})">
        ${spokes}
        <circle cx="0" cy="0" r="26" fill="none" stroke="url(#wl-red-wheel)" stroke-width="7.5"/>
        <circle cx="0" cy="0" r="26" fill="none" stroke="#7F1D1D" stroke-width="1.6"/>
        <circle cx="0" cy="0" r="9" fill="url(#wl-steel)" stroke="#334155" stroke-width="2"/>
      </g>
      <!-- Status pill below valve -->
      <rect x="-28" y="29" width="56" height="19" rx="9.5" fill="${open ? '#16A34A' : '#DC2626'}" stroke="#FFFFFF" stroke-width="1.8"/>
      <text x="0" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${open ? 'ひらき' : 'とじ'}</text>
    </g>
  `;
}

/** Render an authentic brass-bezel analog water pressure gauge */
export function renderPressureGaugeSvg(x, y, pressureRatio = 0) {
  // Needle sweeps from -125 deg (0 MPa) to +125 deg (1.0 MPa)
  const deg = -125 + Math.max(0, Math.min(1, pressureRatio)) * 250;
  return `
    <g transform="translate(${x} ${y})">
      <rect x="-6" y="28" width="12" height="18" fill="url(#wl-brass)" stroke="#78350F" stroke-width="2"/>
      <circle cx="0" cy="0" r="32" fill="url(#wl-brass)" stroke="#78350F" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="26" fill="#FFFFFF" stroke="#475569" stroke-width="1.8"/>
      <!-- Green & Red Pressure Arcs -->
      <path d="M -18 12 A 21 21 0 1 1 18 12" fill="none" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
      <path d="M -18 12 A 21 21 0 0 1 6 -20" fill="none" stroke="#22C55E" stroke-width="4" stroke-linecap="round"/>
      <path d="M 6 -20 A 21 21 0 0 1 18 12" fill="none" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
      <!-- Needle -->
      <g transform="rotate(${deg.toFixed(1)})">
        <polygon points="-2.5,5 0,-21 2.5,5" fill="#DC2626"/>
        <circle cx="0" cy="0" r="4.5" fill="#1E293B"/>
      </g>
      <text x="0" y="18" text-anchor="middle" font-size="8" font-weight="900" fill="#334155" font-family="sans-serif">MPa</text>
    </g>
  `;
}

/** Render spinning wooden/brass Waterwheel */
export function renderWaterwheelSvg(x, y, angleDeg = 0, wet = false) {
  const paddles = Array.from({ length: 8 }, (_, i) => `
    <g transform="rotate(${i * 45})">
      <line x1="0" y1="0" x2="0" y2="-44" stroke="#92400E" stroke-width="5"/>
      <rect x="-8" y="-48" width="16" height="10" rx="2.5" fill="#D97706" stroke="#78350F" stroke-width="2"/>
    </g>
  `).join('');

  return `
    <g transform="translate(${x} ${y})">
      ${wet ? `
        <!-- Falling waterfall stream hitting paddles -->
        <rect x="-12" y="-76" width="24" height="54" rx="8" fill="#38BDF8" opacity="0.82"/>
        <circle cx="-18" cy="-32" r="5" fill="#BAE6FD"/>
        <circle cx="18"  cy="-26" r="6" fill="#BAE6FD"/>
      ` : ''}
      <g transform="rotate(${angleDeg.toFixed(1)})">
        ${paddles}
        <circle cx="0" cy="0" r="32" fill="none" stroke="#B45309" stroke-width="5"/>
        <circle cx="0" cy="0" r="12" fill="url(#wl-brass)" stroke="#78350F" stroke-width="2.5"/>
      </g>
      <text x="0" y="64" text-anchor="middle" font-size="13" font-weight="900" fill="#F8FAFC" font-family="sans-serif">みずぐるま</text>
    </g>
  `;
}

/** Render Glass Tank with floating Rubber Duck that rises with fillRatio (0..1) */
export function renderDuckTankSvg(x, y, fillRatio = 0) {
  const h = Math.max(0, Math.min(1, fillRatio)) * 82;
  const waterY = 44 - h;
  const duckY = waterY - 8;

  return `
    <g transform="translate(${x} ${y})">
      <rect x="-46" y="-48" width="92" height="96" rx="10" fill="#0F172A" opacity="0.45" stroke="#94A3B8" stroke-width="3.5"/>
      ${h > 2 ? `
        <rect x="-43" y="${waterY.toFixed(1)}" width="86" height="${h.toFixed(1)}" rx="6" fill="#0EA5E9" opacity="0.88"/>
        <line x1="-40" y1="${(waterY + 3).toFixed(1)}" x2="40" y2="${(waterY + 3).toFixed(1)}" stroke="#BAE6FD" stroke-width="3" stroke-linecap="round"/>
      ` : ''}
      <!-- Floating Cute Yellow Rubber Duck -->
      <g transform="translate(0 ${Math.min(34, duckY).toFixed(1)})">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#FACC15" stroke="#A16207" stroke-width="2"/>
        <circle cx="11" cy="-10" r="9" fill="#FACC15" stroke="#A16207" stroke-width="2"/>
        <polygon points="18,-11 26,-8 18,-5" fill="#F97316"/>
        <circle cx="14" cy="-12" r="2" fill="#0F172A"/>
      </g>
      <!-- Glass Reflection Overlay -->
      <rect x="-44" y="-46" width="88" height="92" rx="8" fill="url(#wl-glass)" pointer-events="none"/>
      <text x="0" y="66" text-anchor="middle" font-size="13" font-weight="900" fill="#F8FAFC" font-family="sans-serif">あひる タンク</text>
    </g>
  `;
}

/** Render Garden Flower Bed that blooms when watered */
export function renderFlowerBedSvg(x, y, bloomRatio = 0) {
  const s = 0.35 + Math.max(0, Math.min(1, bloomRatio)) * 0.75;
  return `
    <g transform="translate(${x} ${y})">
      ${bloomRatio > 0.1 ? `
        <path d="M -22 -64 L -30 -32 M 0 -64 L 0 -28 M 22 -64 L 30 -32" stroke="#38BDF8" stroke-width="3.5" stroke-dasharray="6 6" stroke-linecap="round"/>
      ` : ''}
      <!-- Wooden Planter Box -->
      <rect x="-48" y="16" width="96" height="32" rx="8" fill="#B45309" stroke="#78350F" stroke-width="3"/>
      <!-- Blooming Flowers -->
      ${[-26, 0, 26].map((fx, i) => {
        const colors = ['#F472B6', '#FACC15', '#38BDF8'];
        return `
          <g transform="translate(${fx} 16) scale(${s.toFixed(2)})">
            <line x1="0" y1="0" x2="0" y2="-38" stroke="#22C55E" stroke-width="5" stroke-linecap="round"/>
            <ellipse cx="-10" cy="-18" rx="9" ry="5" fill="#4ADE80" transform="rotate(-25 -10 -18)"/>
            <circle cx="0" cy="-42" r="12" fill="${colors[i]}" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="0" cy="-42" r="5" fill="#FEF08A"/>
          </g>
        `;
      }).join('')}
      <text x="0" y="66" text-anchor="middle" font-size="13" font-weight="900" fill="#F8FAFC" font-family="sans-serif">おはな ばたけ</text>
    </g>
  `;
}

/** 3 Valve-Routing Puzzle Stages */
export const VALVE_STAGES = [
  {
    name: 'ステージ1：みずぐるまを まわそう！',
    hint: 'あかい バルブを ひらいて みずぐるまへ みずを おくろう！',
    goalIds: ['wheel'],
    valves: [
      { id: 'v1', x: 300, y: 240, open: false },
      { id: 'v2', x: 515, y: 140, open: false },
      { id: 'v3', x: 515, y: 340, open: true }
    ]
  },
  {
    name: 'ステージ2：あひる タンクを いっぱいに！',
    hint: 'うえの バルブを とじて したの あひるタンクへ ながそう！',
    goalIds: ['tank'],
    valves: [
      { id: 'v1', x: 300, y: 240, open: false },
      { id: 'v2', x: 515, y: 140, open: true },
      { id: 'v3', x: 515, y: 340, open: false }
    ]
  },
  {
    name: 'ステージ3：ぜんぶに みずを とどけよう！',
    hint: '3つの バルブを ぜんぶ ひらいて だいせいこう！',
    goalIds: ['wheel', 'tank'],
    valves: [
      { id: 'v1', x: 300, y: 240, open: false },
      { id: 'v2', x: 515, y: 140, open: false },
      { id: 'v3', x: 515, y: 340, open: false }
    ]
  }
];

/** Pipe Builder Grid Tile definitions: open ports [Top, Right, Bottom, Left] at rot=0 */
export const PIPE_PORT_MAP = {
  straight: [0, 1, 0, 1],
  elbow:    [0, 1, 1, 0],
  tee:      [0, 1, 1, 1],
  cross:    [1, 1, 1, 1]
};

export function getRotatedPorts(type, rotSteps) {
  const base = PIPE_PORT_MAP[type] || [0, 0, 0, 0];
  const r = ((rotSteps % 4) + 4) % 4;
  return [0, 1, 2, 3].map((i) => base[(i - r + 4) % 4]);
}
