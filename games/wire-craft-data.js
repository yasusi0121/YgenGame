/* =========================================================================
   WIRE CRAFT DATA — Authentic PCB (Printed Circuit Board) Generator & Art
   Real octilinear (90deg + 45deg) PCB trace routing, silkscreen markings,
   gold-plated through-hole solder pads, and large realistic components:
   QFP CPU, Electrolytic Capacitor, Color-Band Resistor, Crystal Oscillator,
   Power Unit, Speaker, DC Motor, and LED Array.
   ========================================================================= */

export const PCB_THEMES = [
  { id: 'green', name: 'みどり きばん', bg: '#0E4F2F', silk: 'rgba(255,255,255,0.55)', grid: 'rgba(134,239,172,0.11)', copper: '#166534', border: '#4ADE80' },
  { id: 'blue',  name: 'あお きばん',   bg: '#102A63', silk: 'rgba(255,255,255,0.55)', grid: 'rgba(147,197,253,0.12)', copper: '#1D4ED8', border: '#60A5FA' },
  { id: 'black', name: 'くろ きばん',   bg: '#181C24', silk: 'rgba(251,191,36,0.65)',  grid: 'rgba(251,191,36,0.09)',  copper: '#272E3B', border: '#FBBF24' },
  { id: 'red',   name: 'あか きばん',   bg: '#6B1419', silk: 'rgba(255,255,255,0.55)', grid: 'rgba(252,165,165,0.11)', copper: '#881B22', border: '#F87171' }
];

export const WIRE_COLORS = [
  { id: 'red',    hex: '#FF3B4E', dark: '#991B1B', copper: '#FCA5A5', label: 'VCC' },
  { id: 'yellow', hex: '#FFD12E', dark: '#A16207', copper: '#FEF08A', label: 'CLK' },
  { id: 'cyan',   hex: '#00D2FF', dark: '#0369A1', copper: '#BAE6FD', label: 'DAT' },
  { id: 'green',  hex: '#22C55E', dark: '#15803D', copper: '#BBF7D0', label: 'SIG' },
  { id: 'orange', hex: '#FB923C', dark: '#C2410C', copper: '#FED7AA', label: 'PWM' },
  { id: 'pink',   hex: '#F472B6', dark: '#BE185D', copper: '#FBCFE8', label: 'AUD' },
  { id: 'purple', hex: '#C084FC', dark: '#7E22CE', copper: '#E9D5FF', label: 'BUS' },
  { id: 'lime',   hex: '#A3E635', dark: '#4D7C0F', copper: '#ECFCCB', label: 'IO'  }
];

export const TARGET_MACHINES = [
  { id: 'robot',   name: 'ロボット',     sound: 'and',   msg: 'ロボット が うごきだしたよ！' },
  { id: 'rocket',  name: 'ロケット',     sound: 'latch', msg: 'ロケット が はっしゃ したよ！' },
  { id: 'train',   name: 'でんしゃ',     sound: 'or',    msg: 'でんしゃ が しゅっぱつ したよ！' },
  { id: 'car',     name: 'ラジコンカー', sound: 'xor',   msg: 'ラジコンカー が はしりだしたよ！' },
  { id: 'plane',   name: 'ひこうき',     sound: 'and',   msg: 'プロペラ が グルグル まわったよ！' },
  { id: 'alexa',   name: 'アレクサ',     sound: 'latch', msg: 'アレクサ が ピカッと きどうしたよ！' },
  { id: 'lamp',    name: 'でんき',       sound: 'wire',  msg: 'ライト が あかるく ひかったよ！' },
  { id: 'boombox', name: 'おんがくき',   sound: 'or',    msg: 'たのしい おんがく が なったよ！' }
];

/**
 * Compute authentic PCB octilinear (horizontal / vertical + 45-degree chamfered)
 * trace coordinates between (x1, y1) and (x2, y2).
 */
export function buildPcbTracePoints(x1, y1, x2, y2, laneX = null) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dy) < 4) return [[x1, y1], [x2, y2]];
  if (Math.abs(dx) < 4) return [[x1, y1], [x2, y2]];

  const midX = laneX !== null ? laneX : (x1 + x2) * 0.5;
  const signY = dy >= 0 ? 1 : -1;
  const sign1 = midX >= x1 ? 1 : -1;
  const sign2 = x2 >= midX ? 1 : -1;
  const cham = Math.min(22, Math.abs(dy) * 0.36, Math.abs(midX - x1) * 0.65, Math.abs(x2 - midX) * 0.65);

  if (cham < 4) {
    return [[x1, y1], [midX, y1], [midX, y2], [x2, y2]];
  }
  return [
    [x1, y1],
    [midX - sign1 * cham, y1],
    [midX, y1 + signY * cham],
    [midX, y2 - signY * cham],
    [midX + sign2 * cham, y2],
    [x2, y2]
  ];
}

export function pointsToSvgPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

export function renderMachineSvg(id, powered = false, size = 64) {
  const glow = powered ? '#FFD12E' : '#94A3B8';
  const led = powered ? '#4ADE80' : '#475569';
  switch (id) {
    case 'robot':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <line x1="40" y1="8" x2="40" y2="18" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
        <circle cx="40" cy="8" r="5" fill="${powered ? '#FF4757' : '#94A3B8'}"/>
        <rect x="18" y="18" width="44" height="34" rx="10" fill="#60A5FA" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="31" cy="34" r="6" fill="${glow}"/>
        <circle cx="49" cy="34" r="6" fill="${glow}"/>
        <rect x="29" y="44" width="22" height="4" rx="2" fill="#FFFFFF"/>
        <rect x="24" y="54" width="32" height="18" rx="6" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="40" cy="63" r="4" fill="${led}"/>
      </svg>`;
    case 'rocket':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        ${powered ? '<polygon points="30,62 40,78 50,62" fill="#FF7043"/><polygon points="34,62 40,73 46,62" fill="#FFD12E"/>' : ''}
        <path d="M22 52 L12 64 L26 60 Z" fill="#EF4444"/>
        <path d="M58 52 L68 64 L54 60 Z" fill="#EF4444"/>
        <path d="M40 8 C54 22 56 44 52 60 H28 C24 44 26 22 40 8 Z" fill="#F8FAFC" stroke="#334155" stroke-width="3"/>
        <circle cx="40" cy="34" r="9" fill="${powered ? '#38BDF8' : '#94A3B8'}" stroke="#1E293B" stroke-width="3"/>
      </svg>`;
    case 'train':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="10" y="22" width="60" height="36" rx="10" fill="#22C55E" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="18" y="28" width="20" height="16" rx="4" fill="#E0F2FE"/>
        <rect x="44" y="28" width="18" height="16" rx="4" fill="#E0F2FE"/>
        <circle cx="64" cy="48" r="5" fill="${glow}"/>
        <circle cx="24" cy="62" r="7" fill="#334155" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="56" cy="62" r="7" fill="#334155" stroke="#FFFFFF" stroke-width="2.5"/>
      </svg>`;
    case 'car':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <path d="M18 42 L26 24 H54 L62 42 Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
        <rect x="10" y="40" width="60" height="18" rx="7" fill="#EF4444" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="28" y="28" width="24" height="11" rx="3" fill="#E0F2FE"/>
        <circle cx="63" cy="49" r="4" fill="${glow}"/>
        <circle cx="24" cy="60" r="8" fill="#1E293B" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="56" cy="60" r="8" fill="#1E293B" stroke="#FFFFFF" stroke-width="2.5"/>
      </svg>`;
    case 'plane':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <ellipse cx="40" cy="42" rx="28" ry="12" fill="#38BDF8" stroke="#FFFFFF" stroke-width="3"/>
        <polygon points="34,32 46,32 52,14 28,14" fill="#0284C7" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="14" cy="42" r="6" fill="${powered ? '#FFD12E' : '#94A3B8'}"/>
        <rect x="11" y="24" width="6" height="36" rx="3" fill="${powered ? '#FFD12E' : '#CBD5E1'}"/>
        <circle cx="42" cy="40" r="5" fill="#E0F2FE"/>
      </svg>`;
    case 'alexa':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <ellipse cx="40" cy="62" rx="24" ry="7" fill="#1E293B"/>
        <path d="M18 60 Q40 70 62 60" stroke="${powered ? '#00D2FF' : '#64748B'}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <circle cx="40" cy="39" r="24" fill="#E2E8F0" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M18 39 A22 22 0 0 1 62 39 Q40 46 18 39 Z" fill="#F8FAFC"/>
      </svg>`;
    case 'lamp':
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="32" r="20" fill="${glow}" stroke="#FFFFFF" stroke-width="3.5"/>
        <rect x="30" y="50" width="20" height="12" rx="4" fill="#94A3B8" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="33" y="62" width="14" height="6" rx="3" fill="#64748B"/>
      </svg>`;
    case 'boombox':
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <path d="M24 24 V16 H56 V24" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
        <rect x="10" y="24" width="60" height="40" rx="10" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="26" cy="44" r="11" fill="#1E293B" stroke="${glow}" stroke-width="3"/>
        <circle cx="54" cy="44" r="11" fill="#1E293B" stroke="${glow}" stroke-width="3"/>
        <rect x="36" y="34" width="8" height="10" rx="2" fill="${led}"/>
      </svg>`;
  }
}

/** Large, authentic, unmistakably recognizable electronic PCB components */
export function renderComponentSvg(comp, powered = false) {
  const { kind, ref, label } = comp;
  const ledColor = powered ? '#4ADE80' : '#475569';
  switch (kind) {
    case 'cpu': {
      let pins = '';
      for (let i = -30; i <= 30; i += 12) {
        pins += `<rect x="${i - 2.5}" y="-54" width="5" height="12" rx="1" fill="#CBD5E1" stroke="#475569" stroke-width="1"/>`;
        pins += `<rect x="${i - 2.5}" y="42" width="5" height="12" rx="1" fill="#CBD5E1" stroke="#475569" stroke-width="1"/>`;
        pins += `<rect x="-54" y="${i - 2.5}" width="12" height="5" rx="1" fill="#CBD5E1" stroke="#475569" stroke-width="1"/>`;
        pins += `<rect x="42" y="${i - 2.5}" width="12" height="5" rx="1" fill="#CBD5E1" stroke="#475569" stroke-width="1"/>`;
      }
      return `
        <rect x="-50" y="-50" width="100" height="100" rx="6" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.6" stroke-dasharray="4 3"/>
        ${pins}
        <rect x="-42" y="-42" width="84" height="84" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
        <rect x="-34" y="-34" width="68" height="68" rx="4" fill="#273244" stroke="#475569" stroke-width="1.5"/>
        <circle cx="-26" cy="-26" r="4" fill="#CBD5E1"/>
        <circle cx="24" cy="-24" r="4.5" fill="${ledColor}"/>
        <text x="0" y="-2" text-anchor="middle" font-size="18" font-weight="900" fill="${powered ? '#38BDF8' : '#E2E8F0'}" font-family="monospace">CPU</text>
        <text x="0" y="16" text-anchor="middle" font-size="10" font-weight="800" fill="#94A3B8" font-family="monospace">${ref}</text>
        <text x="0" y="68" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${label}</text>
      `;
    }
    case 'battery':
      return `
        <rect x="-46" y="-32" width="92" height="64" rx="8" fill="#1E293B" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
        <rect x="-38" y="-22" width="68" height="44" rx="5" fill="#F59E0B" stroke="#92400E" stroke-width="2.5"/>
        <rect x="-38" y="-22" width="24" height="44" rx="4" fill="#1E293B"/>
        <rect x="30" y="-10" width="8" height="20" rx="2" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
        <line x1="8" y1="-8" x2="8" y2="8" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        <line x1="0" y1="0" x2="16" y2="0" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        <text x="-26" y="4" text-anchor="middle" font-size="10" font-weight="900" fill="#FDE68A" font-family="monospace">5V</text>
        <text x="0" y="48" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'capacitor':
      return `
        <circle cx="0" cy="0" r="34" fill="#1E3A8A" stroke="rgba(255,255,255,0.6)" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="26" fill="#CBD5E1" stroke="#64748B" stroke-width="2.5"/>
        <!-- Authentic electrolytic capacitor cross vent -->
        <line x1="-15" y1="-15" x2="15" y2="15" stroke="#64748B" stroke-width="2.5"/>
        <line x1="15" y1="-15" x2="-15" y2="15" stroke="#64748B" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="5" fill="${ledColor}"/>
        <text x="0" y="50" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'resistor':
      return `
        <line x1="-46" y1="0" x2="46" y2="0" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/>
        <rect x="-32" y="-15" width="64" height="30" rx="11" fill="#E7C9A9" stroke="#78350F" stroke-width="2.5"/>
        <!-- Authentic 4-band color code -->
        <rect x="-20" y="-14" width="7" height="28" fill="#B91C1C"/>
        <rect x="-8"  y="-14" width="7" height="28" fill="#1E293B"/>
        <rect x="4"   y="-14" width="7" height="28" fill="#EA580C"/>
        <rect x="18"  y="-14" width="6" height="28" fill="#F59E0B"/>
        <text x="0" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'crystal':
      return `
        <rect x="-38" y="-20" width="76" height="40" rx="20" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
        <rect x="-28" y="-13" width="56" height="26" rx="13" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.8"/>
        <text x="0" y="4" text-anchor="middle" font-size="12" font-weight="900" fill="#334155" font-family="monospace">16MHz</text>
        <text x="0" y="38" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'speaker':
      return `
        <rect x="-38" y="-38" width="76" height="76" rx="12" fill="#1E293B" stroke="rgba(255,255,255,0.5)" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="29" fill="#334155" stroke="#64748B" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="18" fill="#0F172A" stroke="${powered ? '#38BDF8' : '#64748B'}" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="7" fill="${powered ? '#38BDF8' : '#94A3B8'}"/>
        <circle cx="-29" cy="-29" r="3" fill="#CBD5E1"/>
        <circle cx="29" cy="-29" r="3" fill="#CBD5E1"/>
        <circle cx="-29" cy="29" r="3" fill="#CBD5E1"/>
        <circle cx="29" cy="29" r="3" fill="#CBD5E1"/>
        <text x="0" y="54" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'motor':
      return `
        <rect x="-42" y="-28" width="76" height="56" rx="8" fill="#64748B" stroke="#1E293B" stroke-width="3"/>
        <rect x="-34" y="-20" width="60" height="40" rx="4" fill="#94A3B8"/>
        <rect x="34" y="-8" width="16" height="16" rx="3" fill="#F59E0B" stroke="#92400E" stroke-width="2"/>
        <circle cx="-4" cy="0" r="11" fill="#1E293B" stroke="${ledColor}" stroke-width="3"/>
        <text x="-4" y="4" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF" font-family="monospace">M</text>
        <text x="0" y="46" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
    case 'ledbar':
    default:
      return `
        <rect x="-42" y="-24" width="84" height="48" rx="8" fill="#1E293B" stroke="rgba(255,255,255,0.55)" stroke-width="2.5"/>
        <circle cx="-22" cy="0" r="10" fill="${powered ? '#FF4757' : '#475569'}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="0"   cy="0" r="10" fill="${powered ? '#FFD12E' : '#475569'}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="22"  cy="0" r="10" fill="${powered ? '#4ADE80' : '#475569'}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="0" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="sans-serif">${ref} ${label}</text>
      `;
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a realistic, non-overlapping roguelike PCB layout with real components
 * placed in structured hardware zones and octilinear pin-to-pin wiring tasks.
 */
export function generateCircuitStage(stageNum, mode = 'normal', prevMachineId = null) {
  const theme = PCB_THEMES[Math.floor(Math.random() * PCB_THEMES.length)];
  const machinePool = TARGET_MACHINES.filter((m) => m.id !== prevMachineId);
  const machine = machinePool[Math.floor(Math.random() * machinePool.length)];

  const isWide = mode === 'wide';
  const isChallenge = mode === 'challenge';
  const W = isWide ? 960 : 740;
  const H = isWide ? 500 : 420;

  const cx = Math.round(W * 0.5);
  const cy = Math.round(H * 0.5);

  // Authentic hardware components mounted around the central CPU
  const leftPool = shuffle([
    { id: 'pwr', kind: 'battery',   ref: 'PWR1', label: 'でんげん' },
    { id: 'cap', kind: 'capacitor', ref: 'C1',   label: 'コンデンサ' },
    { id: 'res', kind: 'resistor',  ref: 'R1',   label: 'ていこう' },
    { id: 'xtl', kind: 'crystal',   ref: 'X1',   label: 'すいしょう' }
  ]);
  const rightPool = shuffle([
    { id: 'mot', kind: 'motor',     ref: 'M1',   label: 'モーター' },
    { id: 'spk', kind: 'speaker',   ref: 'SP1',  label: 'スピーカー' },
    { id: 'led', kind: 'ledbar',    ref: 'D1',   label: 'LEDライト' },
    { id: 'cap2', kind: 'capacitor', ref: 'C2',  label: 'コンデンサ' }
  ]);

  const leftCount = isWide ? 4 : (stageNum >= 2 ? 3 : 2);
  const rightCount = isWide ? 4 : (stageNum >= 3 || isChallenge ? 3 : 2);

  const components = [
    { id: 'cpu', kind: 'cpu', ref: 'U1', label: 'マイコン', x: cx, y: cy }
  ];

  const placeColumn = (list, count, colX, side) => {
    const chosen = list.slice(0, count);
    const topPad = 76;
    const botPad = H - 76;
    const step = count > 1 ? (botPad - topPad) / (count - 1) : 0;
    return chosen.map((c, idx) => {
      const y = count === 1 ? cy : Math.round(topPad + idx * step);
      const comp = { ...c, x: colX, y, side };
      components.push(comp);
      return comp;
    });
  };

  const leftComps = placeColumn(leftPool, leftCount, isWide ? 116 : 102, 'left');
  const rightComps = placeColumn(rightPool, rightCount, isWide ? W - 116 : W - 102, 'right');

  // Wire connections: each peripheral connects cleanly to a distinct CPU pin via 90/45deg PCB traces
  const totalWires = leftComps.length + rightComps.length;
  const colors = shuffle(WIRE_COLORS).slice(0, totalWires);
  const pairs = [];

  const leftPinYs = shuffle(leftComps.map((_, i) => cy - 30 + Math.round((60 / Math.max(1, leftComps.length - 1)) * i)));
  const rightPinYs = shuffle(rightComps.map((_, i) => cy - 30 + Math.round((60 / Math.max(1, rightComps.length - 1)) * i)));

  leftComps.forEach((c, i) => {
    const col = colors[i];
    const ax = c.x + 56;
    const ay = c.y;
    const bx = cx - 64;
    const by = leftComps.length === 1 ? cy : leftPinYs[i];
    // Dedicated non-overlapping vertical routing channel lane
    const laneX = Math.round(ax + 44 + i * ((bx - ax - 88) / Math.max(1, leftComps.length - 1 || 1)));
    pairs.push({
      id: `L-${c.id}`,
      color: col,
      a: { x: ax, y: ay, compId: c.id },
      b: { x: bx, y: by, compId: 'cpu' },
      laneX
    });
  });

  rightComps.forEach((c, i) => {
    const col = colors[leftComps.length + i];
    const ax = cx + 64;
    const ay = rightComps.length === 1 ? cy : rightPinYs[i];
    const bx = c.x - 56;
    const by = c.y;
    const laneX = Math.round(ax + 44 + i * ((bx - ax - 88) / Math.max(1, rightComps.length - 1 || 1)));
    pairs.push({
      id: `R-${c.id}`,
      color: col,
      a: { x: ax, y: ay, compId: 'cpu' },
      b: { x: bx, y: by, compId: c.id },
      laneX
    });
  });

  // Authentic decorative background copper traces (strictly 90deg + 45deg!)
  const traces = [];
  for (let i = 0; i < 8; i++) {
    const x1 = 48 + Math.round(Math.random() * (W - 96));
    const y1 = 36 + Math.round(Math.random() * (H - 72));
    const dx = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.round(Math.random() * 80));
    const dy = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.round(Math.random() * 60));
    traces.push(pointsToSvgPath(buildPcbTracePoints(x1, y1, x1 + dx, y1 + dy)));
  }

  const hasSwitch = isChallenge || stageNum >= 2;

  return {
    stageNum,
    mode,
    width: W,
    height: H,
    theme,
    machine,
    components,
    pairs,
    hasSwitch,
    traces
  };
}
