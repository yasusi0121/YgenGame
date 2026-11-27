// Lingokids / LogicLike matte-toy SVG assets for Water Lab (すいどう ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

export function buildWaterDefsSvg() {
  return `
    <defs>
      <linearGradient id="wl-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFE082"/>
        <stop offset="100%" stop-color="#E5A931"/>
      </linearGradient>
      <linearGradient id="wl-porcelain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E4EDF5"/>
      </linearGradient>
      <linearGradient id="wl-water-h" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#B8F3FF"/>
        <stop offset="50%" stop-color="#5CE1E6"/>
        <stop offset="100%" stop-color="#2BB8D6"/>
      </linearGradient>
      <linearGradient id="wl-water-v" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#B8F3FF"/>
        <stop offset="50%" stop-color="#5CE1E6"/>
        <stop offset="100%" stop-color="#2BB8D6"/>
      </linearGradient>
    </defs>
  `;
}

/** Sculpted Matte Coral-Red 5-Spoke Gate Valve (zero black outlines!) */
export function renderValveSvg(id, x, y, open, spinDeg = 0) {
  const spokes = [0, 72, 144, 216, 288].map((a) => `
    <line x1="0" y1="0" x2="0" y2="-26" stroke="#F05A5B" stroke-width="6.5" stroke-linecap="round" transform="rotate(${a})"/>
  `).join('');

  return `
    <g data-valve="${id}" style="cursor:pointer;" transform="translate(${x} ${y})">
      <circle cx="0" cy="8" r="30" fill="rgba(0,0,0,0.14)"/>
      <!-- Honey-Brass Valve Body -->
      <rect x="-24" y="-17" width="48" height="36" rx="12" fill="#C48B1C"/>
      <rect x="-24" y="-20" width="48" height="36" rx="12" fill="url(#wl-brass)"/>
      <rect x="-8" y="-12" width="16" height="22" rx="6" fill="${open ? '#34D399' : '#F05A5B'}"/>
      <!-- Same-hue 3D bottom lip on red handwheel -->
      <circle cx="0" cy="4" r="27" fill="none" stroke="#C43B3C" stroke-width="7.5"/>
      <g transform="rotate(${spinDeg.toFixed(1)})">
        ${spokes}
        <circle cx="0" cy="0" r="27" fill="none" stroke="#F05A5B" stroke-width="7.5"/>
        <path d="M -19 -18 A 27 27 0 0 1 18 -19" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="9.5" fill="#FFFFFF"/>
        <circle cx="0" cy="0" r="4" fill="#94A3B8"/>
      </g>
      <rect x="-26" y="34" width="52" height="20" rx="10" fill="${open ? '#34D399' : '#F05A5B'}"/>
      <text x="0" y="48" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">${open ? 'ひらき' : 'とじ'}</text>
    </g>
  `;
}

/** Clean Matte Porcelain & Brass Analog Pressure Gauge */
export function renderPressureGaugeSvg(x, y, pressureRatio = 0) {
  const deg = -125 + Math.max(0, Math.min(1, pressureRatio)) * 250;
  return `
    <g transform="translate(${x} ${y})">
      <rect x="-6" y="28" width="12" height="22" rx="4" fill="#E5A931"/>
      <circle cx="0" cy="5" r="32" fill="rgba(0,0,0,0.14)"/>
      <circle cx="0" cy="0" r="32" fill="url(#wl-brass)"/>
      <circle cx="0" cy="0" r="25" fill="#FFFFFF"/>
      <path d="M -17 11 A 20 20 0 1 1 17 11" fill="none" stroke="#E4EDF5" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M -17 11 A 20 20 0 0 1 6 -19" fill="none" stroke="#34D399" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 6 -19 A 20 20 0 0 1 17 11" fill="none" stroke="#F05A5B" stroke-width="4.5" stroke-linecap="round"/>
      <g transform="rotate(${deg.toFixed(1)})">
        <polygon points="-2.5,5 0,-20 2.5,5" fill="#F05A5B"/>
        <circle cx="0" cy="0" r="4.5" fill="#3D405B"/>
      </g>
    </g>
  `;
}

/** Clean Matte Honey-Wood Waterwheel */
export function renderWaterwheelSvg(x, y, angleDeg = 0, wet = false, isGoal = false) {
  const paddles = Array.from({ length: 8 }, (_, i) => `
    <g transform="rotate(${i * 45})">
      <line x1="0" y1="0" x2="0" y2="-43" stroke="#C88B44" stroke-width="5.5" stroke-linecap="round"/>
      <rect x="-8.5" y="-48" width="17" height="10" rx="5" fill="#F7C948"/>
    </g>
  `).join('');

  return `
    <g transform="translate(${x} ${y})">
      ${isGoal ? `<circle cx="0" cy="0" r="56" fill="none" stroke="rgba(255,243,161,0.75)" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/>` : ''}
      ${wet ? `
        <rect x="-11" y="-76" width="22" height="54" rx="11" fill="#6BE5FA" opacity="0.88"/>
        <circle cx="-20" cy="-28" r="5.5" fill="#C9F7FF"/>
        <circle cx="20"  cy="-22" r="6.5" fill="#C9F7FF"/>
      ` : ''}
      <g transform="rotate(${angleDeg.toFixed(1)})">
        ${paddles}
        <circle cx="0" cy="0" r="32" fill="none" stroke="#DF9E4C" stroke-width="6"/>
        <circle cx="0" cy="0" r="13" fill="url(#wl-brass)"/>
        <circle cx="0" cy="0" r="5" fill="#FFFFFF"/>
      </g>
      <text x="0" y="68" text-anchor="middle" font-size="13" font-weight="800" fill="rgba(255,255,255,0.9)" font-family="${FONT_ROUND}">みずぐるま</text>
    </g>
  `;
}

/** Frosted Glass Tank with Cute Matte Yellow Rubber Duck (zero black outlines!) */
export function renderDuckTankSvg(x, y, fillRatio = 0, isGoal = false) {
  const h = Math.max(0, Math.min(1, fillRatio)) * 78;
  const waterY = 44 - h;
  const duckY = waterY - 8;

  return `
    <g transform="translate(${x} ${y})">
      ${isGoal ? `<rect x="-56" y="-56" width="112" height="112" rx="26" fill="none" stroke="rgba(255,243,161,0.75)" stroke-width="4" stroke-dasharray="10 8"/>` : ''}
      <rect x="-46" y="-46" width="92" height="92" rx="20" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" stroke-width="3.5"/>
      ${h > 2 ? `
        <rect x="-42" y="${waterY.toFixed(1)}" width="84" height="${h.toFixed(1)}" rx="14" fill="#5CE1E6" opacity="0.9"/>
        <line x1="-36" y1="${(waterY + 4).toFixed(1)}" x2="36" y2="${(waterY + 4).toFixed(1)}" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
      ` : ''}
      <g transform="translate(0 ${Math.min(30, duckY).toFixed(1)})">
        <ellipse cx="0" cy="0" rx="16.5" ry="11" fill="#F7C948"/>
        <circle cx="11.5" cy="-10.5" r="9.5" fill="#F7C948"/>
        <polygon points="19,-11.5 27,-8.5 19,-5.5" fill="#FF8C42"/>
        <circle cx="14.5" cy="-12.5" r="2" fill="#3D405B"/>
      </g>
      <text x="0" y="68" text-anchor="middle" font-size="13" font-weight="800" fill="rgba(255,255,255,0.9)" font-family="${FONT_ROUND}">あひる タンク</text>
    </g>
  `;
}

/** Soft Matte Planter with Blooming Pastel Flowers */
export function renderFlowerBedSvg(x, y, bloomRatio = 0) {
  const s = 0.35 + Math.max(0, Math.min(1, bloomRatio)) * 0.75;
  return `
    <g transform="translate(${x} ${y})">
      ${bloomRatio > 0.1 ? `
        <path d="M -20 -62 L -28 -30 M 0 -62 L 0 -26 M 20 -62 L 28 -30" stroke="#B8F3FF" stroke-width="3.5" stroke-dasharray="6 6" stroke-linecap="round"/>
      ` : ''}
      <rect x="-46" y="16" width="92" height="32" rx="12" fill="#D9834C"/>
      <rect x="-50" y="10" width="100" height="10" rx="5" fill="#ED9C66"/>
      ${[-25, 0, 25].map((fx, i) => {
        const colors = ['#FF8FB1', '#F7C948', '#89CFF0'];
        return `
          <g transform="translate(${fx} 10) scale(${s.toFixed(2)})">
            <line x1="0" y1="0" x2="0" y2="-36" stroke="#5CD68D" stroke-width="5.5" stroke-linecap="round"/>
            <ellipse cx="-10" cy="-17" rx="9" ry="5" fill="#7CE3A6" transform="rotate(-25 -10 -17)"/>
            <circle cx="0" cy="-40" r="12.5" fill="${colors[i]}"/>
            <circle cx="0" cy="-40" r="5" fill="#FFF7A8"/>
          </g>
        `;
      }).join('')}
    </g>
  `;
}

export const VALVE_STAGES = [
  {
    name: 'ステージ1',
    hint: 'バルブを ひらいて みずぐるまを まわそう',
    goalIds: ['wheel'],
    valves: [
      { id: 'v1', x: 300, y: 230, open: false },
      { id: 'v2', x: 515, y: 132, open: false },
      { id: 'v3', x: 515, y: 332, open: true }
    ]
  },
  {
    name: 'ステージ2',
    hint: 'あひる タンクに みずを いれよう',
    goalIds: ['tank'],
    valves: [
      { id: 'v1', x: 300, y: 230, open: false },
      { id: 'v2', x: 515, y: 132, open: true },
      { id: 'v3', x: 515, y: 332, open: false }
    ]
  },
  {
    name: 'ステージ3',
    hint: 'ぜんぶの バルブを ひらこう！',
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
