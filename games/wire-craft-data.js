/* =========================================================================
   WIRE CRAFT DATA — Roguelike Random Circuit Board Generator & Flat SVG Art
   8 target machines, 5 PCB color themes, electronic parts, and guaranteed-clean
   random wiring layouts (normal, wide full-screen, and relay/switch challenge).
   ========================================================================= */

export const PCB_THEMES = [
  { id: 'green',  bg: '#166534', grid: 'rgba(134,239,172,0.16)', border: '#4ADE80', trace: '#15803D' },
  { id: 'blue',   bg: '#1E3A8A', grid: 'rgba(147,197,253,0.18)', border: '#60A5FA', trace: '#1D4ED8' },
  { id: 'purple', bg: '#4C1D95', grid: 'rgba(216,180,254,0.18)', border: '#C084FC', trace: '#6D28D9' },
  { id: 'red',    bg: '#7F1D1D', grid: 'rgba(252,165,165,0.16)', border: '#F87171', trace: '#991B1B' },
  { id: 'slate',  bg: '#1E293B', grid: 'rgba(148,163,184,0.18)', border: '#38BDF8', trace: '#334155' }
];

export const WIRE_COLORS = [
  { id: 'red',    hex: '#FF4757', dark: '#B91C1C', label: 'あか' },
  { id: 'yellow', hex: '#FFD12E', dark: '#B45309', label: 'きいろ' },
  { id: 'cyan',   hex: '#00D2FF', dark: '#0369A1', label: 'みずいろ' },
  { id: 'green',  hex: '#4ADE80', dark: '#15803D', label: 'みどり' },
  { id: 'pink',   hex: '#F472B6', dark: '#BE185D', label: 'ピンク' },
  { id: 'orange', hex: '#FB923C', dark: '#C2410C', label: 'オレンジ' },
  { id: 'purple', hex: '#C084FC', dark: '#7E22CE', label: 'むらさき' },
  { id: 'lime',   hex: '#A3E635', dark: '#4D7C0F', label: 'きみどり' }
];

export const TARGET_MACHINES = [
  { id: 'robot',   name: 'ロボット',   sound: 'and',  msg: 'ロボット が うごきだしたよ！' },
  { id: 'rocket',  name: 'ロケット',   sound: 'latch', msg: 'ロケット が はっしゃ したよ！' },
  { id: 'train',   name: 'でんしゃ',   sound: 'or',   msg: 'でんしゃ が しゅっぱつ したよ！' },
  { id: 'car',     name: 'ラジコンカー', sound: 'xor',  msg: 'ラジコンカー が はしりだしたよ！' },
  { id: 'plane',   name: 'ひこうき',   sound: 'and',  msg: 'プロペラ が グルグル まわったよ！' },
  { id: 'alexa',   name: 'アレクサ',   sound: 'latch', msg: 'アレクサ が ピカッと きどうしたよ！' },
  { id: 'lamp',    name: 'でんき',     sound: 'wire', msg: 'ライト が あかるく ひかったよ！' },
  { id: 'boombox', name: 'おんがくき', sound: 'or',   msg: 'たのしい おんがく が なったよ！' }
];

export function renderMachineSvg(id, powered = false, size = 76) {
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

export function renderPartIconSvg(kind, powered = false) {
  switch (kind) {
    case 'battery':
      return `<rect x="-18" y="-12" width="34" height="24" rx="5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="16" y="-5" width="5" height="10" rx="2" fill="#CBD5E1"/>
        <line x1="-6" y1="-5" x2="-6" y2="5" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <line x1="-11" y1="0" x2="-1" y2="0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`;
    case 'cpu':
      return `<rect x="-18" y="-18" width="36" height="36" rx="7" fill="#0F172A" stroke="${powered ? '#38BDF8' : '#94A3B8'}" stroke-width="3"/>
        <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="900" fill="${powered ? '#38BDF8' : '#CBD5E1'}" font-family="sans-serif">CPU</text>`;
    case 'relay':
      return `<polygon points="0,-18 18,0 0,18 -18,0" fill="#334155" stroke="${powered ? '#FFD12E' : '#CBD5E1'}" stroke-width="3"/>
        <circle cx="0" cy="0" r="6" fill="${powered ? '#FFD12E' : '#94A3B8'}"/>`;
    case 'motor':
      return `<circle cx="0" cy="0" r="17" fill="#334155" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="8" fill="${powered ? '#4ADE80' : '#94A3B8'}"/>`;
    case 'speaker':
      return `<circle cx="0" cy="0" r="17" fill="#1E293B" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="10" fill="#475569"/>
        <circle cx="0" cy="0" r="4.5" fill="${powered ? '#38BDF8' : '#CBD5E1'}"/>`;
    default:
      return `<rect x="-16" y="-14" width="32" height="28" rx="6" fill="#334155" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="6" fill="${powered ? '#FFD12E' : '#94A3B8'}"/>`;
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
 * Roguelike procedural circuit generator:
 * Every stage generates a fresh PCB theme, random target machine,
 * random non-overlapping port layout, and optional relay/switch gimmicks.
 */
export function generateCircuitStage(stageNum, mode = 'normal', prevMachineId = null) {
  const theme = PCB_THEMES[Math.floor(Math.random() * PCB_THEMES.length)];
  const machinePool = TARGET_MACHINES.filter((m) => m.id !== prevMachineId);
  const machine = machinePool[Math.floor(Math.random() * machinePool.length)];

  const isWide = mode === 'wide';
  const isChallenge = mode === 'challenge';
  const W = isWide ? 920 : 680;
  const H = isWide ? 480 : 400;

  // Wire count scales smoothly with roguelike stage progression
  const wireCount = isWide
    ? Math.min(8, 5 + Math.floor((stageNum - 1) / 2))
    : Math.min(6, 3 + Math.floor((stageNum - 1) / 2));

  const colors = shuffle(WIRE_COLORS).slice(0, wireCount);
  const hasSwitch = isChallenge || (stageNum >= 3 && Math.random() < 0.55);
  const useRelay = isChallenge || (stageNum >= 2 && Math.random() < 0.5);

  // Build randomized left (source) and right (destination) anchor columns with jitter
  const leftOrder = shuffle(Array.from({ length: wireCount }, (_, i) => i));
  const rightOrder = shuffle(Array.from({ length: wireCount }, (_, i) => i));

  const padY = 56;
  const usableH = H - padY * 2;
  const stepY = wireCount > 1 ? usableH / (wireCount - 1) : 0;

  const leftXBase = isWide ? 115 : 105;
  const rightXBase = isWide ? W - 115 : W - 105;
  const partKinds = ['battery', 'cpu', 'motor', 'speaker', 'relay'];

  const pairs = [];
  for (let i = 0; i < wireCount; i++) {
    const col = colors[i];
    const lIdx = leftOrder[i];
    const rIdx = rightOrder[i];
    const jx1 = (Math.random() - 0.5) * (isWide ? 70 : 38);
    const jx2 = (Math.random() - 0.5) * (isWide ? 70 : 38);
    const jy1 = (Math.random() - 0.5) * 16;
    const jy2 = (Math.random() - 0.5) * 16;

    const ax = Math.round(leftXBase + jx1);
    const ay = Math.round(padY + lIdx * stepY + jy1);
    const bx = Math.round(rightXBase + jx2);
    const by = Math.round(padY + rIdx * stepY + jy2);

    // Optional relay midpoint for first 1-2 wires in relay/challenge stages
    const needsRelay = useRelay && i < (isChallenge ? 2 : 1);
    const mx = Math.round(W * 0.5 + (Math.random() - 0.5) * (isWide ? 140 : 80));
    const my = Math.round(padY + ((lIdx + rIdx) / 2) * stepY + (Math.random() - 0.5) * 34);

    if (needsRelay) {
      // Split into 2 sequential segments through a central Relay Hub!
      pairs.push({
        id: `${col.id}-1`,
        color: col,
        a: { x: ax, y: ay, kind: partKinds[i % partKinds.length] },
        b: { x: mx, y: my, kind: 'relay' },
        isRelaySeg: true
      });
      pairs.push({
        id: `${col.id}-2`,
        color: col,
        a: { x: mx, y: my, kind: 'relay' },
        b: { x: bx, y: by, kind: partKinds[(i + 2) % partKinds.length] },
        isRelaySeg: true
      });
    } else {
      pairs.push({
        id: col.id,
        color: col,
        a: { x: ax, y: ay, kind: partKinds[i % partKinds.length] },
        b: { x: bx, y: by, kind: partKinds[(i + 1) % partKinds.length] },
        isRelaySeg: false
      });
    }
  }

  // Decorative PCB background traces (pure visual authenticity)
  const traces = [];
  for (let i = 0; i < 10; i++) {
    const x1 = 40 + Math.random() * (W - 80);
    const y1 = 30 + Math.random() * (H - 60);
    const x2 = x1 + (Math.random() - 0.5) * 180;
    const y2 = y1;
    const y3 = y2 + (Math.random() - 0.5) * 120;
    traces.push(`M ${x1.toFixed(0)} ${y1.toFixed(0)} L ${x2.toFixed(0)} ${y2.toFixed(0)} L ${x2.toFixed(0)} ${y3.toFixed(0)}`);
  }

  return {
    stageNum,
    mode,
    width: W,
    height: H,
    theme,
    machine,
    pairs,
    hasSwitch,
    useRelay,
    traces
  };
}
