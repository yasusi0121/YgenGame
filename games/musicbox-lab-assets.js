// Lingokids / LogicLike matte-toy SVG assets & melodies for Music Box Lab (オルゴール ラボ)

export const FONT_ROUND = "'Hiragino Maru Gothic ProN','Rounded Mplus 1c','Arial Rounded MT Bold',sans-serif";

// 8-note C-major scale (C5 .. C6) matching comb teeth from left (longest/lowest) to right (shortest/highest)
export const COMB_NOTES = [
  { idx: 0, name: 'ド',   freq: 523.25, color: '#F05A5B', toothLen: 92 },
  { idx: 1, name: 'レ',   freq: 587.33, color: '#FF9F5A', toothLen: 85 },
  { idx: 2, name: 'ミ',   freq: 659.25, color: '#F7C948', toothLen: 79 },
  { idx: 3, name: 'ファ', freq: 698.46, color: '#5CD68D', toothLen: 73 },
  { idx: 4, name: 'ソ',   freq: 783.99, color: '#56CCF2', toothLen: 67 },
  { idx: 5, name: 'ラ',   freq: 880.00, color: '#6E9ED2', toothLen: 61 },
  { idx: 6, name: 'シ',   freq: 987.77, color: '#A78BFA', toothLen: 55 },
  { idx: 7, name: 'ド↑',  freq: 1046.5, color: '#FF8FB1', toothLen: 49 }
];

// Preset 16-step melodies: array of [step, noteIdx]
export const PRESET_SONGS = [
  {
    id: 'twinkle',
    name: 'きらきらぼし',
    pins: [
      [0,0],[2,0],[4,4],[6,4],[8,5],[10,5],[12,4],
      [14,3]
    ],
    missing: [[4,4],[10,5],[12,4]]
  },
  {
    id: 'tulip',
    name: 'チューリップ',
    pins: [
      [0,0],[2,1],[4,2],[8,0],[10,1],[12,2],[14,4]
    ],
    missing: [[2,1],[10,1],[14,4]]
  },
  {
    id: 'rainbow',
    name: 'にじの おんかい',
    pins: [
      [0,0],[2,1],[4,2],[6,3],[8,4],[10,5],[12,6],[14,7]
    ],
    missing: [[4,2],[8,4],[12,6]]
  }
];

export function buildMusicBoxDefsSvg() {
  return `
    <defs>
      <linearGradient id="mb-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D9A36A"/>
        <stop offset="100%" stop-color="#B87E45"/>
      </linearGradient>
      <linearGradient id="mb-brass-cyl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C89322"/>
        <stop offset="22%" stop-color="#FFE484"/>
        <stop offset="52%" stop-color="#F7C948"/>
        <stop offset="82%" stop-color="#DDA228"/>
        <stop offset="100%" stop-color="#B07A14"/>
      </linearGradient>
      <linearGradient id="mb-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#C8D3E0"/>
      </linearGradient>
    </defs>
  `;
}

/** Simple matte gear wheel SVG centered at (cx, cy) */
export function renderGearSvg(cx, cy, r, teeth, fill, rotDeg = 0) {
  const step = 360 / teeth;
  const toothRects = Array.from({ length: teeth }, (_, i) => `
    <rect x="-3.5" y="${(-r - 5).toFixed(1)}" width="7" height="${(r * 2 + 10).toFixed(1)}" rx="3" fill="${fill}" transform="rotate(${(i * step).toFixed(1)})"/>
  `).join('');
  return `
    <g transform="translate(${cx} ${cy}) rotate(${rotDeg.toFixed(1)})">
      ${toothRects}
      <circle cx="0" cy="0" r="${r}" fill="${fill}"/>
      <circle cx="0" cy="0" r="${(r * 0.42).toFixed(1)}" fill="#2B2B45"/>
    </g>
  `;
}
