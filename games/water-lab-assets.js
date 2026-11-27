// High-craft 2.5D Toon-Shaded SVG assets for Water Lab (すいどう ラボ)

export function buildWaterDefsSvg() {
  return `
    <defs>
      <!-- Sunlit Ceramic Tile Waterworks Wall -->
      <pattern id="wl-tiles" width="44" height="44" patternUnits="userSpaceOnUse">
        <rect width="44" height="44" fill="#F0F9FF"/>
        <path d="M 44 0 H 0 V 44" fill="none" stroke="#BAE6FD" stroke-width="2"/>
      </pattern>
      <linearGradient id="wl-bench" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E4B884"/>
        <stop offset="16%" stop-color="#D29B63"/>
        <stop offset="100%" stop-color="#A8703E"/>
      </linearGradient>
      <linearGradient id="wl-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="48%" stop-color="#F59E0B"/>
        <stop offset="52%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#92400E"/>
      </linearGradient>
      <linearGradient id="wl-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="46%" stop-color="#CBD5E1"/>
        <stop offset="50%" stop-color="#94A3B8"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
      <linearGradient id="wl-water-h" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#BAE6FD"/>
        <stop offset="35%" stop-color="#38BDF8"/>
        <stop offset="52%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="wl-water-v" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#BAE6FD"/>
        <stop offset="35%" stop-color="#38BDF8"/>
        <stop offset="52%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="wl-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
        <stop offset="22%" stop-color="rgba(255,255,255,0.12)"/>
        <stop offset="85%" stop-color="rgba(255,255,255,0.06)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.45)"/>
      </linearGradient>
    </defs>
  `;
}

/** 2.5D Industrial Red 5-Spoke Handwheel Gate Valve with cel depth & bold ink outline */
export function renderValveSvg(id, x, y, open, spinDeg = 0) {
  const ink = '#1E293B';
  const spokes = [0, 72, 144, 216, 288].map((a) => `
    <line x1="0" y1="0" x2="0" y2="-26" stroke="#DC2626" stroke-width="7" stroke-linecap="round" transform="rotate(${a})"/>
    <line x1="0" y1="0" x2="0" y2="-26" stroke="#FCA5A5" stroke-width="2.2" stroke-linecap="round" transform="rotate(${a})"/>
  `).join('');

  return `
    <g data-valve="${id}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <!-- Cast wall shadow -->
      <circle cx="5" cy="7" r="30" fill="rgba(15,23,42,0.18)"/>
      <!-- 2.5D Brass Valve Housing -->
      <rect x="-25" y="-19" width="50" height="38" rx="9" fill="url(#wl-brass)" stroke="${ink}" stroke-width="3.2"/>
      <!-- Open/Close Gate Indicator Window -->
      <rect x="-9" y="-13" width="18" height="26" rx="4" fill="${open ? '#22C55E' : '#EF4444'}" stroke="${ink}" stroke-width="2.2"/>
      <!-- 2.5D Handwheel Extrusion Rim -->
      <circle cx="0" cy="4" r="28" fill="none" stroke="#7F1D1D" stroke-width="8"/>
      <!-- Rotating Red 5-Spoke Handwheel -->
      <g transform="rotate(${spinDeg.toFixed(1)})">
        ${spokes}
        <circle cx="0" cy="0" r="28" fill="none" stroke="#EF4444" stroke-width="8"/>
        <circle cx="0" cy="0" r="28" fill="none" stroke="${ink}" stroke-width="2.4"/>
        <path d="M -20 -18 A 28 28 0 0 1 18 -20" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="10" fill="url(#wl-steel)" stroke="${ink}" stroke-width="2.8"/>
      </g>
      <!-- Status Badge -->
      <rect x="-28" y="33" width="56" height="21" rx="10.5" fill="${open ? '#22C55E' : '#EF4444'}" stroke="${ink}" stroke-width="2.5"/>
      <text x="0" y="48" text-anchor="middle" font-size="11.5" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${open ? 'ひらき' : 'とじ'}</text>
    </g>
  `;
}

/** 2.5D Brass-Bezel Analog Pressure Gauge */
export function renderPressureGaugeSvg(x, y, pressureRatio = 0) {
  const ink = '#1E293B';
  const deg = -125 + Math.max(0, Math.min(1, pressureRatio)) * 250;
  return `
    <g transform="translate(${x} ${y})">
      <circle cx="4" cy="6" r="33" fill="rgba(15,23,42,0.16)"/>
      <rect x="-7" y="28" width="14" height="22" fill="url(#wl-brass)" stroke="${ink}" stroke-width="2.8"/>
      <circle cx="0" cy="0" r="33" fill="url(#wl-brass)" stroke="${ink}" stroke-width="3.2"/>
      <circle cx="0" cy="0" r="26" fill="#FFFFFF" stroke="${ink}" stroke-width="2.2"/>
      <path d="M -18 12 A 21 21 0 1 1 18 12" fill="none" stroke="#E2E8F0" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M -18 12 A 21 21 0 0 1 6 -20" fill="none" stroke="#22C55E" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 6 -20 A 21 21 0 0 1 18 12" fill="none" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round"/>
      <g transform="rotate(${deg.toFixed(1)})">
        <polygon points="-3,6 0,-22 3,6" fill="#EF4444" stroke="${ink}" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="5" fill="${ink}"/>
      </g>
      <text x="0" y="18" text-anchor="middle" font-size="8.5" font-weight="900" fill="${ink}" font-family="sans-serif">MPa</text>
    </g>
  `;
}

/** 2.5D Spinning Wooden/Brass Waterwheel */
export function renderWaterwheelSvg(x, y, angleDeg = 0, wet = false) {
  const ink = '#1E293B';
  const paddles = Array.from({ length: 8 }, (_, i) => `
    <g transform="rotate(${i * 45})">
      <line x1="0" y1="0" x2="0" y2="-44" stroke="#92400E" stroke-width="6"/>
      <rect x="-9" y="-49" width="18" height="11" rx="3" fill="#F59E0B" stroke="${ink}" stroke-width="2.4"/>
    </g>
  `).join('');

  return `
    <g transform="translate(${x} ${y})">
      ${wet ? `
        <rect x="-13" y="-76" width="26" height="54" rx="9" fill="#38BDF8" stroke="#0284C7" stroke-width="2" opacity="0.88"/>
        <circle cx="-22" cy="-30" r="6" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.5"/>
        <circle cx="22"  cy="-24" r="7" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.5"/>
      ` : ''}
      <circle cx="4" cy="6" r="46" fill="rgba(15,23,42,0.14)"/>
      <g transform="rotate(${angleDeg.toFixed(1)})">
        ${paddles}
        <circle cx="0" cy="0" r="33" fill="none" stroke="#B45309" stroke-width="6.5"/>
        <circle cx="0" cy="0" r="33" fill="none" stroke="${ink}" stroke-width="2"/>
        <circle cx="0" cy="0" r="13" fill="url(#wl-brass)" stroke="${ink}" stroke-width="2.8"/>
      </g>
      <rect x="-44" y="52" width="88" height="22" rx="11" fill="#FFFFFF" stroke="${ink}" stroke-width="2.5"/>
      <text x="0" y="67" text-anchor="middle" font-size="12" font-weight="900" fill="${ink}" font-family="sans-serif">みずぐるま</text>
    </g>
  `;
}

/** 2.5D Glass Tank with Floating Yellow Rubber Duck */
export function renderDuckTankSvg(x, y, fillRatio = 0) {
  const ink = '#1E293B';
  const h = Math.max(0, Math.min(1, fillRatio)) * 80;
  const waterY = 44 - h;
  const duckY = waterY - 8;

  return `
    <g transform="translate(${x} ${y})">
      <!-- 2.5D Tank top rim & back shadow -->
      <rect x="-44" y="-44" width="96" height="96" rx="12" fill="rgba(15,23,42,0.15)"/>
      <rect x="-48" y="-48" width="96" height="96" rx="12" fill="#E0F2FE" stroke="${ink}" stroke-width="3.5"/>
      ${h > 2 ? `
        <rect x="-44" y="${waterY.toFixed(1)}" width="88" height="${h.toFixed(1)}" rx="6" fill="#0EA5E9" opacity="0.9"/>
        <line x1="-40" y1="${(waterY + 4).toFixed(1)}" x2="40" y2="${(waterY + 4).toFixed(1)}" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round"/>
      ` : ''}
      <!-- Floating Rubber Duck -->
      <g transform="translate(0 ${Math.min(32, duckY).toFixed(1)})">
        <ellipse cx="0" cy="0" rx="17" ry="11.5" fill="#FACC15" stroke="${ink}" stroke-width="2.6"/>
        <circle cx="12" cy="-11" r="9.5" fill="#FACC15" stroke="${ink}" stroke-width="2.6"/>
        <polygon points="19,-12 28,-8.5 19,-5" fill="#F97316" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="15" cy="-13" r="2.2" fill="${ink}"/>
      </g>
      <rect x="-45" y="-45" width="90" height="90" rx="9" fill="url(#wl-glass)" pointer-events="none"/>
      <rect x="-48" y="54" width="96" height="22" rx="11" fill="#FFFFFF" stroke="${ink}" stroke-width="2.5"/>
      <text x="0" y="69" text-anchor="middle" font-size="12" font-weight="900" fill="${ink}" font-family="sans-serif">あひる タンク</text>
    </g>
  `;
}

/** 2.5D Garden Planter Box with Blooming Flowers */
export function renderFlowerBedSvg(x, y, bloomRatio = 0) {
  const ink = '#1E293B';
  const s = 0.35 + Math.max(0, Math.min(1, bloomRatio)) * 0.75;
  return `
    <g transform="translate(${x} ${y})">
      ${bloomRatio > 0.1 ? `
        <path d="M -22 -64 L -30 -30 M 0 -64 L 0 -26 M 22 -64 L 30 -30" stroke="#0EA5E9" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/>
      ` : ''}
      <rect x="-48" y="14" width="96" height="34" rx="9" fill="#D97706" stroke="${ink}" stroke-width="3.2"/>
      <rect x="-52" y="10" width="104" height="10" rx="4" fill="#F59E0B" stroke="${ink}" stroke-width="2.8"/>
      ${[-26, 0, 26].map((fx, i) => {
        const colors = ['#F472B6', '#FACC15', '#38BDF8'];
        return `
          <g transform="translate(${fx} 10) scale(${s.toFixed(2)})">
            <line x1="0" y1="0" x2="0" y2="-38" stroke="#16A34A" stroke-width="5.5" stroke-linecap="round"/>
            <ellipse cx="-10" cy="-18" rx="9" ry="5" fill="#4ADE80" stroke="${ink}" stroke-width="1.8" transform="rotate(-25 -10 -18)"/>
            <circle cx="0" cy="-42" r="13" fill="${colors[i]}" stroke="${ink}" stroke-width="2.5"/>
            <circle cx="0" cy="-42" r="5" fill="#FEF08A" stroke="${ink}" stroke-width="1.5"/>
          </g>
        `;
      }).join('')}
    </g>
  `;
}

export const VALVE_STAGES = [
  {
    name: 'ステージ1：みずぐるまを まわそう！',
    hint: 'あかい バルブを タップして みずぐるまへ みずを おくろう！',
    goalIds: ['wheel'],
    valves: [
      { id: 'v1', x: 300, y: 230, open: false },
      { id: 'v2', x: 515, y: 132, open: false },
      { id: 'v3', x: 515, y: 332, open: true }
    ]
  },
  {
    name: 'ステージ2：あひる タンクを いっぱいに！',
    hint: 'うえの バルブを とじて したの あひるタンクへ ながそう！',
    goalIds: ['tank'],
    valves: [
      { id: 'v1', x: 300, y: 230, open: false },
      { id: 'v2', x: 515, y: 132, open: true },
      { id: 'v3', x: 515, y: 332, open: false }
    ]
  },
  {
    name: 'ステージ3：ぜんぶに みずを とどけよう！',
    hint: '3つの バルブを ぜんぶ ひらいて だいせいこう！',
    goalIds: ['wheel', 'tank'],
    valves: [
      { id: 'v1', x: 300, y: 230, open: false },
      { id: 'v2', x: 515, y: 132, open: false },
      { id: 'v3', x: 515, y: 332, open: false }
    ]
  }
];

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
