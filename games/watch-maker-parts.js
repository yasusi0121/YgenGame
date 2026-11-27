/* =========================================================================
   WATCH MAKER PARTS — Precision SVG Generators for Mechanical, Quartz,
   Pendulum, Cuckoo, Steampunk, Radio & Vintage Clock Components
   (Zero Unicode emojis — 100% custom flat-design SVG)
   ========================================================================= */

export function buildGearPath(cx, cy, outerR, innerR, teeth) {
  let d = '';
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.48;
    const a3 = a0 + step * 0.72;
    const pts = [
      [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR],
      [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR],
      [cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR],
      [cx + Math.cos(a3) * innerR, cy + Math.sin(a3) * innerR]
    ];
    d += (i === 0 ? `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : ` L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`)
      + ` L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`
      + ` L ${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}`
      + ` L ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
  }
  return d + ' Z';
}

export function buildEscapeWheelPath(cx, cy, outerR, innerR, teeth = 15) {
  let d = '';
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.42;
    const a2 = a0 + step * 0.56;
    const a3 = a0 + step * 0.28;
    const pts = [
      [cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR],
      [cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR],
      [cx + Math.cos(a2) * (outerR - 1.5), cy + Math.sin(a2) * (outerR - 1.5)],
      [cx + Math.cos(a3) * (innerR + 2), cy + Math.sin(a3) * (innerR + 2)]
    ];
    d += (i === 0 ? `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : ` L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`)
      + ` L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`
      + ` L ${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}`
      + ` L ${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
  }
  return d + ' Z';
}

export function buildSpiralPath(cx, cy, turns, rStart, rEnd) {
  const steps = Math.round(turns * 28);
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const r = rStart + (rEnd - rStart) * t;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return d;
}

/** Render internal mechanism parts (centered at 0,0) */
export function renderMechPartSvg(kind, r = 34) {
  switch (kind) {
    case 'barrel': {
      const path = buildGearPath(0, 0, r + 4, r - 1, 22);
      const spiral = buildSpiralPath(0, 0, 3.0, 7, r - 9);
      return `
        <path d="${path}" fill="#D97706" stroke="#92400E" stroke-width="2"/>
        <circle cx="0" cy="0" r="${r - 4}" fill="#FDE68A" stroke="#B45309" stroke-width="2.2"/>
        <path d="${spiral}" fill="none" stroke="#1E3A8A" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="8" fill="#94A3B8" stroke="#475569" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="3.2" fill="#E11D48"/>
      `;
    }
    case 'ratchet': {
      const path = buildGearPath(0, 0, r + 3, r - 3, 18);
      return `
        <path d="${path}" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
        <circle cx="0" cy="0" r="${r - 7}" fill="#E2E8F0" stroke="#64748B" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="7" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.6"/>
        <line x1="-5" y1="0" x2="5" y2="0" stroke="#DBEAFE" stroke-width="1.8"/>
      `;
    }
    case 'click':
      return `
        <path d="M -15 -5 C -5 -15 13 -11 17 4 C 13 11 2 9 -4 4 L -15 7 Z" fill="#E2E8F0" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="-4" cy="-1" r="4.5" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.5"/>
      `;
    case 'wheel-gold':
    case 'wheel-brass':
    case 'wheel-silver':
    case 'wheel-dark':
    case 'wheel-copper': {
      const palette = {
        'wheel-gold': ['#FBBF24', '#92400E'],
        'wheel-brass': ['#F59E0B', '#78350F'],
        'wheel-silver': ['#CBD5E1', '#475569'],
        'wheel-dark': ['#52525B', '#18181B'],
        'wheel-copper': ['#EA580C', '#7C2D12']
      };
      const [fill, stroke] = palette[kind];
      const teeth = Math.max(12, Math.round(r * 0.54));
      const path = buildGearPath(0, 0, r + 3.5, r - 2, teeth);
      const innerRim = Math.max(8, r - 6.5);
      let spokes = '';
      for (let i = 0; i < 5; i++) {
        const a = (i * 72) * Math.PI / 180;
        spokes += `<line x1="0" y1="0" x2="${(Math.cos(a) * innerRim).toFixed(1)}" y2="${(Math.sin(a) * innerRim).toFixed(1)}" stroke="${fill}" stroke-width="4" stroke-linecap="round"/>`;
      }
      return `
        <path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="0" cy="0" r="${innerRim}" fill="#0F172A" fill-opacity="0.22" stroke="${stroke}" stroke-width="1.4"/>
        ${spokes}
        <circle cx="0" cy="0" r="7" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
        <circle cx="0" cy="0" r="3.4" fill="#E11D48"/>
      `;
    }
    case 'escape': {
      const path = buildEscapeWheelPath(0, 0, r + 3.5, r - 4.5, 15);
      return `
        <path d="${path}" fill="#E2E8F0" stroke="#475569" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="0" cy="0" r="${r - 7}" fill="#0F172A" fill-opacity="0.22" stroke="#475569" stroke-width="1.4"/>
        <line x1="0" y1="${-(r - 7)}" x2="0" y2="${r - 7}" stroke="#CBD5E1" stroke-width="2.6"/>
        <line x1="${-(r - 7)}" y1="0" x2="${r - 7}" y2="0" stroke="#CBD5E1" stroke-width="2.6"/>
        <circle cx="0" cy="0" r="5.5" fill="#F8FAFC" stroke="#475569" stroke-width="1.6"/>
        <circle cx="0" cy="0" r="2.8" fill="#E11D48"/>
      `;
    }
    case 'pallet':
      return `
        <path d="M -20 -4 L 4 -4 L 15 -16 L 19 -12 L 9 0 L 19 12 L 15 16 L 4 4 L -20 4 Z" fill="#E2E8F0" stroke="#475569" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="12" y="-17" width="7" height="4.5" rx="1.2" transform="rotate(-35 15 -15)" fill="#E11D48"/>
        <rect x="12" y="13" width="7" height="4.5" rx="1.2" transform="rotate(35 15 15)" fill="#E11D48"/>
        <circle cx="2" cy="0" r="4" fill="#1E293B" stroke="#F8FAFC" stroke-width="1.4"/>
      `;
    case 'anchor':
      return `
        <path d="M -28 10 C -22 -14 22 -14 28 10 L 22 14 C 16 -4 -16 -4 -22 14 Z" fill="#F59E0B" stroke="#78350F" stroke-width="2" stroke-linejoin="round"/>
        <rect x="-4" y="-12" width="8" height="24" rx="3" fill="#FBBF24" stroke="#78350F" stroke-width="1.8"/>
        <circle cx="0" cy="-2" r="4.5" fill="#E11D48" stroke="#FFFFFF" stroke-width="1.5"/>
      `;
    case 'balance': {
      const spiral = buildSpiralPath(0, 0, 3.4, 6, r - 9);
      let weights = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * 45) * Math.PI / 180;
        weights += `<circle cx="${(Math.cos(a) * (r + 1)).toFixed(1)}" cy="${(Math.sin(a) * (r + 1)).toFixed(1)}" r="2.4" fill="#B45309"/>`;
      }
      return `
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="#F59E0B" stroke-width="6"/>
        <circle cx="0" cy="0" r="${r - 3}" fill="none" stroke="#FEF3C7" stroke-width="1.4"/>
        ${weights}
        <line x1="${-(r - 2)}" y1="0" x2="${r - 2}" y2="0" stroke="#F59E0B" stroke-width="4"/>
        <path d="${spiral}" fill="none" stroke="#2563EB" stroke-width="1.9" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="7.5" fill="#FDE68A" stroke="#B45309" stroke-width="1.8"/>
        <circle cx="0" cy="0" r="3.8" fill="#E11D48"/>
      `;
    }
    case 'pendulum':
      return `
        <rect x="-6" y="0" width="12" height="72" rx="4" fill="#D4AF37" stroke="#78350F" stroke-width="2"/>
        <circle cx="0" cy="14" r="3.2" fill="#4A2118"/>
        <circle cx="0" cy="28" r="3.2" fill="#4A2118"/>
        <circle cx="0" cy="42" r="3.2" fill="#4A2118"/>
        <circle cx="0" cy="56" r="3.2" fill="#4A2118"/>
        <circle cx="0" cy="84" r="36" fill="#E5C158" stroke="#92400E" stroke-width="3.5"/>
        <circle cx="0" cy="84" r="28" fill="#F3D678" opacity="0.55"/>
        <path d="M -18 68 Q 0 56 18 68" fill="none" stroke="#FFFBEB" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
        <circle cx="0" cy="84" r="7" fill="#B45309" stroke="#78350F" stroke-width="2"/>
      `;
    case 'bellows':
      return `
        <polygon points="-24,-18 24,-26 24,26 -24,18" fill="#FEF3C7" stroke="#92400E" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="-22" y1="-10" x2="22" y2="-14" stroke="#B45309" stroke-width="2"/>
        <line x1="-22" y1="0" x2="22" y2="0" stroke="#B45309" stroke-width="2"/>
        <line x1="-22" y1="10" x2="22" y2="14" stroke="#B45309" stroke-width="2"/>
        <rect x="-32" y="-14" width="10" height="28" rx="3" fill="#B45309" stroke="#78350F" stroke-width="2"/>
        <rect x="22" y="-28" width="8" height="56" rx="3" fill="#D97706" stroke="#78350F" stroke-width="2"/>
      `;
    case 'cuckoo-bird':
      return `
        <rect x="-5" y="10" width="10" height="24" rx="3" fill="#94A3B8" stroke="#475569" stroke-width="1.8"/>
        <ellipse cx="0" cy="2" rx="18" ry="13" fill="#FFFFFF" stroke="#475569" stroke-width="2.4"/>
        <circle cx="11" cy="-9" r="10" fill="#FFFFFF" stroke="#475569" stroke-width="2.4"/>
        <polygon points="19,-11 29,-8 19,-4" fill="#F59E0B" stroke="#B45309" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="13" cy="-11" r="2.2" fill="#1E293B"/>
        <path d="M -8 2 Q -2 -6 7 2" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
      `;
    case 'cuckoo-door':
      return `
        <path d="M -26 20 L -26 -10 Q 0 -28 26 -10 L 26 20 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2.5"/>
        <rect x="-22" y="-10" width="20" height="28" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <rect x="2" y="-10" width="20" height="28" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="-19" y1="-3" x2="-5" y2="-3" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="-19" y1="4" x2="-5" y2="4" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="-19" y1="11" x2="-5" y2="11" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="5" y1="-3" x2="19" y2="-3" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="5" y1="4" x2="19" y2="4" stroke="#CBD5E1" stroke-width="2"/>
        <line x1="5" y1="11" x2="19" y2="11" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="-24" cy="4" r="2.6" fill="#64748B"/>
        <circle cx="24" cy="4" r="2.6" fill="#64748B"/>
      `;
    case 'bourdon':
      return `
        <path d="M -10 42 A 48 48 0 1 1 40 -14" fill="none" stroke="#B45309" stroke-width="14" stroke-linecap="round"/>
        <path d="M -10 42 A 48 48 0 1 1 40 -14" fill="none" stroke="#FBBF24" stroke-width="8" stroke-linecap="round"/>
        <rect x="-18" y="34" width="18" height="16" rx="4" fill="#94A3B8" stroke="#475569" stroke-width="2"/>
        <circle cx="40" cy="-14" r="5" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
      `;
    case 'sector-gear':
      return `
        <path d="M -10 20 L 22 -14 A 34 34 0 0 1 36 16 Z" fill="#F59E0B" stroke="#78350F" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="2" cy="12" r="7" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
        <circle cx="2" cy="12" r="3" fill="#E11D48"/>
      `;
    case 'valve':
      return `
        <circle cx="0" cy="0" r="28" fill="none" stroke="#991B1B" stroke-width="9"/>
        <circle cx="0" cy="0" r="28" fill="none" stroke="#DC2626" stroke-width="4.5"/>
        <line x1="-26" y1="0" x2="26" y2="0" stroke="#7F1D1D" stroke-width="5"/>
        <line x1="0" y1="-26" x2="0" y2="26" stroke="#7F1D1D" stroke-width="5"/>
        <circle cx="0" cy="0" r="9" fill="#52525B" stroke="#18181B" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="4" fill="#CBD5E1"/>
      `;
    case 'quartz-ic':
      return `
        <rect x="-32" y="-22" width="64" height="44" rx="7" fill="#15803D" stroke="#14532D" stroke-width="2.5"/>
        <rect x="-10" y="-12" width="24" height="24" rx="3" fill="#1E293B" stroke="#64748B" stroke-width="1.8"/>
        <rect x="-27" y="-8" width="12" height="16" rx="5" fill="#E2E8F0" stroke="#64748B" stroke-width="1.8"/>
        <line x1="14" y1="-7" x2="26" y2="-7" stroke="#FBBF24" stroke-width="2.5"/>
        <line x1="14" y1="0" x2="26" y2="0" stroke="#FBBF24" stroke-width="2.5"/>
        <line x1="14" y1="7" x2="26" y2="7" stroke="#FBBF24" stroke-width="2.5"/>
      `;
    case 'motor-coil':
      return `
        <rect x="-32" y="-18" width="64" height="36" rx="8" fill="#94A3B8" stroke="#475569" stroke-width="2.2"/>
        <rect x="-20" y="-14" width="40" height="28" rx="5" fill="#EA580C" stroke="#9A3412" stroke-width="2"/>
        <line x1="-14" y1="-14" x2="-14" y2="14" stroke="#FDBA74" stroke-width="2"/>
        <line x1="-6" y1="-14" x2="-6" y2="14" stroke="#FDBA74" stroke-width="2"/>
        <line x1="2" y1="-14" x2="2" y2="14" stroke="#FDBA74" stroke-width="2"/>
        <line x1="10" y1="-14" x2="10" y2="14" stroke="#FDBA74" stroke-width="2"/>
        <circle cx="-26" cy="0" r="4" fill="#FBBF24"/>
        <circle cx="26" cy="0" r="4" fill="#FBBF24"/>
      `;
    case 'battery':
      return `
        <rect x="-34" y="-16" width="64" height="32" rx="6" fill="#0EA5E9" stroke="#0369A1" stroke-width="2.5"/>
        <rect x="-34" y="-16" width="22" height="32" rx="5" fill="#F59E0B" stroke="#B45309" stroke-width="2.2"/>
        <rect x="30" y="-7" width="6" height="14" rx="2" fill="#CBD5E1" stroke="#64748B" stroke-width="1.6"/>
        <line x1="-23" y1="-5" x2="-23" y2="5" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="-28" y1="0" x2="-18" y2="0" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="12" y1="0" x2="22" y2="0" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
      `;
    case 'ferrite-ant':
      return `
        <rect x="-52" y="-11" width="104" height="22" rx="5" fill="#334155" stroke="#0F172A" stroke-width="2.4"/>
        <rect x="-28" y="-13" width="56" height="26" rx="4" fill="#D97706" stroke="#92400E" stroke-width="2"/>
        <line x1="-18" y1="-13" x2="-18" y2="13" stroke="#FDE68A" stroke-width="2"/>
        <line x1="-8" y1="-13" x2="-8" y2="13" stroke="#FDE68A" stroke-width="2"/>
        <line x1="2" y1="-13" x2="2" y2="13" stroke="#FDE68A" stroke-width="2"/>
        <line x1="12" y1="-13" x2="12" y2="13" stroke="#FDE68A" stroke-width="2"/>
        <line x1="22" y1="-13" x2="22" y2="13" stroke="#FDE68A" stroke-width="2"/>
      `;
    case 'bimetal': {
      const sp = buildSpiralPath(0, 0, 3.2, 4, 24);
      return `
        <circle cx="0" cy="0" r="28" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/>
        <path d="${sp}" fill="none" stroke="#DC2626" stroke-width="3.2" stroke-linecap="round"/>
        <path d="${sp}" fill="none" stroke="#94A3B8" stroke-width="1.4" stroke-dasharray="4 4"/>
        <circle cx="0" cy="0" r="5" fill="#1E293B"/>
      `;
    }
    case 'hygro-coil': {
      const sp = buildSpiralPath(0, 0, 3.2, 4, 24);
      return `
        <circle cx="0" cy="0" r="28" fill="#E0F2FE" stroke="#0284C7" stroke-width="2.5"/>
        <path d="${sp}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="5" fill="#1E293B"/>
      `;
    }
    case 'tuning-fork':
      return `
        <path d="M -16 -34 L -16 6 C -16 20 16 20 16 6 L 16 -34" fill="none" stroke="#E2E8F0" stroke-width="9" stroke-linecap="round"/>
        <path d="M -16 -34 L -16 6 C -16 20 16 20 16 6 L 16 -34" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
        <line x1="0" y1="16" x2="0" y2="36" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
        <circle cx="-16" cy="-24" r="6" fill="#EA580C" stroke="#7C2D12" stroke-width="1.8"/>
        <circle cx="16" cy="-24" r="6" fill="#EA580C" stroke="#7C2D12" stroke-width="1.8"/>
      `;
    case 'bridge':
    case 'bridge-gold': {
      const fill = kind === 'bridge-gold' ? 'rgba(251,191,36,0.45)' : 'rgba(226,232,240,0.46)';
      const stroke = kind === 'bridge-gold' ? '#B45309' : '#64748B';
      return `
        <path d="M -78 -36 C -32 -60 44 -60 76 -22 C 92 -6 88 44 54 68 C 28 84 -14 78 -28 48 C -42 26 -78 14 -78 -36 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="3"/>
        <circle cx="0" cy="0" r="8" fill="#F8FAFC" stroke="${stroke}" stroke-width="2"/>
        <circle cx="0" cy="0" r="4" fill="#E11D48"/>
        <circle cx="52" cy="-36" r="6" fill="#F8FAFC" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="52" cy="-36" r="3.2" fill="#E11D48"/>
        <circle cx="-54" cy="-26" r="6" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.8"/>
        <line x1="-58" y1="-26" x2="-50" y2="-26" stroke="#DBEAFE" stroke-width="1.6"/>
        <circle cx="42" cy="54" r="6" fill="#1D4ED8" stroke="#1E293B" stroke-width="1.8"/>
        <line x1="38" y1="54" x2="46" y2="54" stroke="#DBEAFE" stroke-width="1.6"/>
      `;
    }
    case 'sub-hygro': {
      let ticks = '';
      for (let i = 0; i <= 10; i++) {
        const a = (135 + i * 27) * Math.PI / 180;
        ticks += `<line x1="${(Math.cos(a) * 28).toFixed(1)}" y1="${(Math.sin(a) * 28).toFixed(1)}" x2="${(Math.cos(a) * 34).toFixed(1)}" y2="${(Math.sin(a) * 34).toFixed(1)}" stroke="#334155" stroke-width="1.8"/>`;
      }
      return `
        <circle cx="0" cy="0" r="44" fill="#FAF8F0" stroke="#78350F" stroke-width="3.5"/>
        <circle cx="0" cy="0" r="39" fill="none" stroke="#CBD5E1" stroke-width="1.5"/>
        ${ticks}
        <text x="0" y="-19" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="sans-serif">50</text>
        <text x="-24" y="20" text-anchor="middle" font-size="8" font-weight="800" fill="#334155" font-family="sans-serif">0%</text>
        <text x="23" y="20" text-anchor="middle" font-size="8" font-weight="800" fill="#334155" font-family="sans-serif">100</text>
        <text x="0" y="33" text-anchor="middle" font-size="7" font-weight="900" fill="#475569" font-family="sans-serif">HUMIDITY</text>
        <line x1="0" y1="4" x2="18" y2="-20" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#334155"/>
      `;
    }
    case 'sub-thermo': {
      let ticks = '';
      for (let i = 0; i <= 10; i++) {
        const a = (135 + i * 27) * Math.PI / 180;
        ticks += `<line x1="${(Math.cos(a) * 28).toFixed(1)}" y1="${(Math.sin(a) * 28).toFixed(1)}" x2="${(Math.cos(a) * 34).toFixed(1)}" y2="${(Math.sin(a) * 34).toFixed(1)}" stroke="#334155" stroke-width="1.8"/>`;
      }
      return `
        <circle cx="0" cy="0" r="44" fill="#FAF8F0" stroke="#78350F" stroke-width="3.5"/>
        <circle cx="0" cy="0" r="39" fill="none" stroke="#CBD5E1" stroke-width="1.5"/>
        ${ticks}
        <text x="0" y="-19" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="sans-serif">20°C</text>
        <text x="-23" y="20" text-anchor="middle" font-size="8" font-weight="800" fill="#334155" font-family="sans-serif">-20</text>
        <text x="23" y="20" text-anchor="middle" font-size="8" font-weight="800" fill="#334155" font-family="sans-serif">50</text>
        <text x="0" y="33" text-anchor="middle" font-size="7" font-weight="900" fill="#475569" font-family="sans-serif">TEMP</text>
        <line x1="0" y1="4" x2="4" y2="-26" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#334155"/>
      `;
    }
    case 'ruby-jewels':
      return `
        <circle cx="-24" cy="-12" r="10" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="-24" cy="-12" r="6" fill="#E11D48" stroke="#9F1239" stroke-width="1.5"/>
        <circle cx="24" cy="-12" r="10" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="24" cy="-12" r="6" fill="#E11D48" stroke="#9F1239" stroke-width="1.5"/>
        <circle cx="0" cy="18" r="11" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
        <circle cx="0" cy="18" r="6.5" fill="#E11D48" stroke="#9F1239" stroke-width="1.5"/>
      `;
    case 'rotor-magnet':
      return `
        <circle cx="0" cy="0" r="20" fill="#E2E8F0" stroke="#475569" stroke-width="2.4"/>
        <path d="M -16 0 A 16 16 0 0 1 16 0 Z" fill="#EF4444"/>
        <path d="M 16 0 A 16 16 0 0 1 -16 0 Z" fill="#2563EB"/>
        <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="#334155" stroke-width="2"/>
      `;
    case 'oil-drop':
      return `
        <line x1="-24" y1="-24" x2="6" y2="6" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
        <line x1="-26" y1="-26" x2="-12" y2="-12" stroke="#1D4ED8" stroke-width="7" stroke-linecap="round"/>
        <path d="M 12 4 C 12 4 22 15 22 21 C 22 27 17.5 31 12 31 C 6.5 31 2 27 2 21 C 2 15 12 4 12 4 Z"
          fill="#FBBF24" stroke="#B45309" stroke-width="2.2"/>
        <circle cx="9" cy="20" r="2.5" fill="#FFFBEB"/>
      `;
    case 'gasket':
      return `
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="#18181B" stroke-width="7"/>
        <circle cx="0" cy="0" r="${r}" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="10 8"/>
      `;
    case 'screw-set':
      return `
        <g transform="translate(-44, -22)">
          <circle cx="0" cy="0" r="9" fill="#1D4ED8" stroke="#0F172A" stroke-width="2"/>
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#DBEAFE" stroke-width="2.4"/>
        </g>
        <g transform="translate(44, -22)">
          <circle cx="0" cy="0" r="9" fill="#1D4ED8" stroke="#0F172A" stroke-width="2"/>
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#DBEAFE" stroke-width="2.4"/>
        </g>
        <g transform="translate(0, 38)">
          <circle cx="0" cy="0" r="9" fill="#1D4ED8" stroke="#0F172A" stroke-width="2"/>
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#DBEAFE" stroke-width="2.4"/>
        </g>
      `;
    case 'aw-sensor': // Optical Heart Rate + Blood Oxygen back sapphire sensor cluster
      return `
        <circle cx="0" cy="0" r="36" fill="#0F172A" stroke="#475569" stroke-width="3"/>
        <circle cx="0" cy="0" r="29" fill="#1E293B" stroke="#64748B" stroke-width="1.8"/>
        <circle id="wm-aw-hr-led1" cx="-12" cy="-12" r="5" fill="#22C55E"/>
        <circle id="wm-aw-hr-led2" cx="12"  cy="-12" r="5" fill="#22C55E"/>
        <circle id="wm-aw-hr-led3" cx="-12" cy="12"  r="5" fill="#EF4444"/>
        <circle id="wm-aw-hr-led4" cx="12"  cy="12"  r="5" fill="#EF4444"/>
        <rect x="-6" y="-6" width="12" height="12" rx="3" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="18" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 4"/>
      `;
    case 'aw-coil': // Wireless magnetic fast-charging copper coil
      return `
        <circle cx="0" cy="0" r="46" fill="none" stroke="#B45309" stroke-width="10"/>
        <circle cx="0" cy="0" r="46" fill="none" stroke="#F59E0B" stroke-width="5.5"/>
        <circle cx="0" cy="0" r="46" fill="none" stroke="#FEF08A" stroke-width="1.5" stroke-dasharray="7 5"/>
        <circle cx="0" cy="0" r="36" fill="none" stroke="#D97706" stroke-width="2.5"/>
        <rect x="-8" y="38" width="16" height="14" rx="3" fill="#1E293B" stroke="#FBBF24" stroke-width="1.6"/>
      `;
    case 'aw-sip': // Apple S10 SiP (System in Package) encapsulated logic board
      return `
        <rect x="-46" y="-36" width="92" height="72" rx="10" fill="#18181B" stroke="#64748B" stroke-width="2.6"/>
        <rect x="-36" y="-26" width="72" height="52" rx="6" fill="#27272A" stroke="#94A3B8" stroke-width="1.8"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" font-weight="900" fill="#E2E8F0" font-family="sans-serif">S10</text>
        <text x="0" y="18" text-anchor="middle" font-size="7.5" font-weight="800" fill="#38BDF8" font-family="monospace">SiP 64-BIT</text>
        <rect x="-42" y="-12" width="6" height="24" rx="2" fill="#FBBF24"/>
        <rect x="36"  y="-12" width="6" height="24" rx="2" fill="#FBBF24"/>
        <rect x="-14" y="30"  width="28" height="6" rx="2" fill="#FBBF24"/>
      `;
    case 'aw-taptic': // Linear resonant actuator (Taptic Engine)
      return `
        <rect x="-56" y="-18" width="112" height="36" rx="8" fill="#CBD5E1" stroke="#475569" stroke-width="2.6"/>
        <rect x="-46" y="-11" width="38" height="22" rx="4" fill="#334155" stroke="#64748B" stroke-width="1.5"/>
        <rect x="8"   y="-11" width="38" height="22" rx="4" fill="#334155" stroke="#64748B" stroke-width="1.5"/>
        <rect x="-6"  y="-13" width="12" height="26" rx="2" fill="#F59E0B" stroke="#92400E" stroke-width="1.5"/>
        <text x="-27" y="4" text-anchor="middle" font-size="7.5" font-weight="900" fill="#E2E8F0" font-family="monospace">TAPTIC</text>
        <circle cx="-50" cy="0" r="3" fill="#475569"/>
        <circle cx="50"  cy="0" r="3" fill="#475569"/>
      `;
    case 'aw-battery': // 327mAh 1.266Wh thin Li-ion soft-pouch battery
      return `
        <rect x="-48" y="-34" width="96" height="68" rx="8" fill="#18181B" stroke="#52525B" stroke-width="2.6"/>
        <rect x="-42" y="-28" width="84" height="56" rx="5" fill="#27272A"/>
        <text x="0" y="-6" text-anchor="middle" font-size="11" font-weight="900" fill="#E2E8F0" font-family="monospace">Li-ion</text>
        <text x="0" y="9" text-anchor="middle" font-size="9.5" font-weight="800" fill="#4ADE80" font-family="monospace">327mAh</text>
        <text x="0" y="21" text-anchor="middle" font-size="7.5" font-weight="700" fill="#94A3B8" font-family="monospace">1.266 Wh</text>
        <path d="M 48 -6 H 58 V 10 H 48" fill="none" stroke="#FBBF24" stroke-width="3.5" stroke-linejoin="round"/>
      `;
    case 'aw-speaker': // Dual-slit waterproof speaker module
      return `
        <rect x="-14" y="-36" width="28" height="72" rx="7" fill="#334155" stroke="#0F172A" stroke-width="2.4"/>
        <rect x="-8" y="-24" width="16" height="20" rx="4" fill="#1E293B" stroke="#94A3B8" stroke-width="1.6"/>
        <circle cx="0" cy="-14" r="5" fill="#38BDF8"/>
        <line x1="-6" y1="8"  x2="6" y2="8"  stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-6" y1="15" x2="6" y2="15" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="-6" y1="22" x2="6" y2="22" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
      `;
    case 'aw-crown': // Digital Crown with knurled grooves & optical encoder shaft
      return `
        <rect x="-18" y="-7" width="18" height="14" rx="3" fill="#94A3B8" stroke="#475569" stroke-width="2"/>
        <rect x="0" y="-17" width="18" height="34" rx="6" fill="#27272A" stroke="#0F172A" stroke-width="2.4"/>
        <line x1="3" y1="-11" x2="15" y2="-11" stroke="#64748B" stroke-width="2"/>
        <line x1="3" y1="-5"  x2="15" y2="-5"  stroke="#64748B" stroke-width="2"/>
        <line x1="3" y1="1"   x2="15" y2="1"   stroke="#64748B" stroke-width="2"/>
        <line x1="3" y1="7"   x2="15" y2="7"   stroke="#64748B" stroke-width="2"/>
        <line x1="3" y1="13"  x2="15" y2="13"  stroke="#64748B" stroke-width="2"/>
      `;
    case 'aw-sidebtn': // Side pill button + microphone flex
      return `
        <rect x="-12" y="-26" width="12" height="52" rx="4" fill="#475569" stroke="#1E293B" stroke-width="2"/>
        <rect x="0" y="-20" width="9" height="40" rx="4.5" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
        <circle cx="-6" cy="-32" r="3.5" fill="#0F172A" stroke="#94A3B8" stroke-width="1.4"/>
      `;
    case 'aw-gasket': // Rounded-rectangle WR50 waterproof adhesive seal
      return `
        <rect x="-78" y="-102" width="156" height="204" rx="38" fill="none" stroke="#18181B" stroke-width="7"/>
        <rect x="-78" y="-102" width="156" height="204" rx="38" fill="none" stroke="#38BDF8" stroke-width="2" stroke-dasharray="10 7"/>
      `;
    case 'aw-band-top': // Midnight Fluoroelastomer Sport Band (Upper strap + stainless pin)
      return `
        <path d="M -52 28 C -52 6 -44 -20 -40 -44 L 40 -44 C 44 -20 52 6 52 28 Z" fill="#334155" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
        <rect x="-54" y="20" width="108" height="10" rx="4" fill="#1E293B"/>
        <circle cx="0" cy="-16" r="10" fill="#94A3B8" stroke="#475569" stroke-width="2.5"/>
        <circle cx="0" cy="-16" r="4" fill="#CBD5E1"/>
      `;
    case 'aw-band-bot': // Midnight Fluoroelastomer Sport Band (Lower strap + sizing holes)
      return `
        <path d="M -52 -28 C -52 -6 -44 20 -40 44 L 40 44 C 44 20 52 -6 52 -28 Z" fill="#334155" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
        <rect x="-54" y="-30" width="108" height="10" rx="4" fill="#1E293B"/>
        <circle cx="0" cy="4"  r="4.5" fill="#0F172A"/>
        <circle cx="0" cy="18" r="4.5" fill="#0F172A"/>
        <circle cx="0" cy="32" r="4.5" fill="#0F172A"/>
      `;
    case 'bead-crown': // Shiny chrome watch crown at 3 o'clock
      return `
        <rect x="-8" y="-5" width="8" height="10" rx="2" fill="#94A3B8" stroke="#475569" stroke-width="1.6"/>
        <rect x="0" y="-12" width="13" height="24" rx="4" fill="#E2E8F0" stroke="#475569" stroke-width="2"/>
        <line x1="2" y1="-7" x2="11" y2="-7" stroke="#64748B" stroke-width="1.8"/>
        <line x1="2" y1="-2" x2="11" y2="-2" stroke="#64748B" stroke-width="1.8"/>
        <line x1="2" y1="3"  x2="11" y2="3"  stroke="#64748B" stroke-width="1.8"/>
        <line x1="2" y1="8"  x2="11" y2="8"  stroke="#64748B" stroke-width="1.8"/>
      `;
    case 'bead-band': {
      // Exact 11 glossy beads in the exact color order from top lug counter-clockwise to bottom lug!
      const beads = [
        { x: 112, y: -96,  c: '#DF4B9B', s: '#B02870' }, // 1. Magenta pink (top lug)
        { x: 52,  y: -128, c: '#6E9ED2', s: '#4874A8' }, // 2. Pastel blue
        { x: -16, y: -136, c: '#DF4B9B', s: '#B02870' }, // 3. Magenta pink (top)
        { x: -80, y: -112, c: '#F8A39A', s: '#D4766C' }, // 4. Coral peach
        { x: -124,y: -60,  c: '#F7F1D5', s: '#C8BE94' }, // 5. Cream white
        { x: -138,y: 6,    c: '#DF4B9B', s: '#B02870' }, // 6. Magenta pink (left)
        { x: -122,y: 72,   c: '#ECE459', s: '#BFB628' }, // 7. Lemon yellow
        { x: -80, y: 120,  c: '#DF4B9B', s: '#B02870' }, // 8. Magenta pink
        { x: -16, y: 142,  c: '#ECE459', s: '#BFB628' }, // 9. Lemon yellow
        { x: 52,  y: 136,  c: '#B2E39E', s: '#7BB366' }, // 10. Pastel mint green
        { x: 112, y: 98,   c: '#F6C8D2', s: '#CA93A0' }  // 11. Baby pink (bottom lug)
      ];
      return `
        <circle cx="-4" cy="4" r="136" fill="none" stroke="#E2E8F0" stroke-width="6" stroke-dasharray="10 6"/>
        ${beads.map((b) => `
          <circle cx="${b.x}" cy="${b.y}" r="31" fill="${b.c}" stroke="${b.s}" stroke-width="2.5"/>
          <ellipse cx="${b.x - 10}" cy="${b.y - 11}" rx="9" ry="5.5" transform="rotate(-32 ${b.x - 10} ${b.y - 11})" fill="#FFFFFF" opacity="0.58"/>
        `).join('')}
      `;
    }
    case 'charm-strap-top':
      // Sky-blue thin cord loop + gold crimp barrel + gold lobster clasp + translucent olive-green glass leaf on left!
      return `
        <!-- Thin sky-blue strap cord loop -->
        <path d="M 0 -5 C -22 -42 -20 -82 0 -86 C 20 -82 22 -42 0 -5"
          fill="none" stroke="#5B9BD5" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M -2 -8 C -18 -40 -16 -76 -1 -82"
          fill="none" stroke="#93C5FD" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
        <!-- Gold crimp barrel & jump ring -->
        <rect x="-6.5" y="-12" width="13" height="19" rx="3" fill="#D8A93A" stroke="#926A16" stroke-width="1.8"/>
        <line x1="-2.5" y1="-9" x2="-2.5" y2="4" stroke="#FEF08A" stroke-width="2" opacity="0.8"/>
        <circle cx="0" cy="11" r="6" fill="none" stroke="#D8A93A" stroke-width="2.8"/>
        <!-- Gold lobster clasp -->
        <path d="M 0 16 C 10 16 12 31 0 36 C -9 34 -10 23 -3 21"
          fill="none" stroke="#D8A93A" stroke-width="4" stroke-linecap="round"/>
        <line x1="-6" y1="26" x2="2" y2="29" stroke="#926A16" stroke-width="2" stroke-linecap="round"/>
        <!-- Translucent olive-green glass leaf charm jutting left at top lug -->
        <g transform="translate(-14 38) rotate(-14)">
          <path d="M 10 0 C 0 -10 -18 -9 -28 0 C -18 9 0 10 10 0 Z"
            fill="#7AA324" stroke="#4D6B12" stroke-width="1.8" opacity="0.92"/>
          <path d="M 6 0 L -22 0" stroke="#B7E048" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>
          <ellipse cx="-8" cy="-3" rx="8" ry="2.2" fill="#FFFFFF" opacity="0.45"/>
        </g>
      `;
    case 'charm-blue-beads': {
      // Wisteria/grape-like cluster of 18 translucent aqua-blue teardrop glass beads on fine gold wire!
      const drops = [
        { x: 26, y: -44, r: 16 }, { x: 14, y: -36, r: 24 }, { x: 34, y: -30, r: -10 },
        { x: 4,  y: -24, r: 30 }, { x: 22, y: -22, r: 12 }, { x: 38, y: -14, r: -18 },
        { x: -10,y: -12, r: 38 }, { x: 10, y: -8,  r: 22 }, { x: 28, y: -4,  r: -6 },
        { x: -24,y: 0,   r: 44 }, { x: -4, y: 4,   r: 26 }, { x: 16, y: 8,   r: 8 },
        { x: 34, y: 12,  r: -22 },{ x: -34,y: 16,  r: 46 }, { x: -16,y: 18,  r: 28 },
        { x: 4,  y: 22,  r: 14 }, { x: 22, y: 26,  r: -12 },{ x: -10,y: 36,  r: 20 }
      ];
      return `
        <!-- Fine gold wire branches linking the cluster to the 6 o'clock lug -->
        <path d="M 32 -56 C 24 -30 8 -8 -12 28 M 24 -34 L 36 10 M 14 -16 L -28 12"
          fill="none" stroke="#D8A93A" stroke-width="2.2" stroke-linecap="round"/>
        ${drops.map((d) => `
          <g transform="translate(${d.x} ${d.y}) rotate(${d.r})">
            <!-- Teardrop clear aqua glass bead -->
            <path d="M 0 -10 C 6 -3 9 2 8 7 C 7 12 -7 12 -8 7 C -9 2 -6 -3 0 -10 Z"
              fill="#38A8D8" stroke="#1B6E99" stroke-width="1.4" opacity="0.88"/>
            <path d="M -2 -4 C -5 0 -5 5 -2 7" fill="none" stroke="#BAE6FD" stroke-width="2.4" stroke-linecap="round" opacity="0.82"/>
            <circle cx="-2.5" cy="2" r="1.8" fill="#FFFFFF" opacity="0.72"/>
          </g>
        `).join('')}
      `;
    }
    case 'charm-gold-leaf': {
      // Graceful curved mirror-gold laurel/wheat leaf metal charm hanging down-right!
      const pairs = [
        { x: -18, y: -38, a: 28 },
        { x: -8,  y: -26, a: 42 },
        { x: 0,   y: -12, a: 54 },
        { x: 6,   y: 4,   a: 66 },
        { x: 8,   y: 20,  a: 76 },
        { x: 6,   y: 36,  a: 86 }
      ];
      return `
        <!-- Curved central gold stem -->
        <path d="M -26 -46 Q 12 -18 4 50" fill="none" stroke="#C6921E" stroke-width="4" stroke-linecap="round"/>
        <path d="M -26 -46 Q 12 -18 4 50" fill="none" stroke="#F7D56B" stroke-width="2" stroke-linecap="round"/>
        <!-- Paired glossy gold leaflets -->
        ${pairs.map((p) => `
          <g transform="translate(${p.x} ${p.y}) rotate(${p.a})">
            <path d="M 0 0 C 5 -7 14 -9 20 -4 C 14 2 6 3 0 0 Z" fill="#E5B946" stroke="#926A16" stroke-width="1.3"/>
            <path d="M 0 0 C 5 7 14 9 20 4 C 14 -2 6 -3 0 0 Z" fill="#D4A12A" stroke="#926A16" stroke-width="1.3"/>
            <line x1="4" y1="-3" x2="13" y2="-4" stroke="#FEF9C3" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>
          </g>
        `).join('')}
        <!-- Pointed gold tip leaf -->
        <g transform="translate(4 48) rotate(98)">
          <path d="M 0 0 C 5 -5 13 -5 18 0 C 13 5 5 5 0 0 Z" fill="#E5B946" stroke="#926A16" stroke-width="1.3"/>
        </g>
      `;
    }
    default:
      return '';
  }
}

/** Render authentic clock hands matching each of the 8 photographed clocks */
export function renderClockHandSvg(handStyle, role, scale = 1) {
  const s = scale;
  switch (handStyle) {
    case 'wood-hygro': // Breguet hollow-circle hour hand, baton minute, thin needle w/ circle tip
      if (role === 'hour') {
        return `
          <line x1="0" y1="8" x2="0" y2="${(-34 * s).toFixed(1)}" stroke="#1E293B" stroke-width="5.5" stroke-linecap="round"/>
          <circle cx="0" cy="${(-48 * s).toFixed(1)}" r="${(14 * s).toFixed(1)}" fill="none" stroke="#1E293B" stroke-width="4.5"/>
          <line x1="0" y1="${(-62 * s).toFixed(1)}" x2="0" y2="${(-72 * s).toFixed(1)}" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="7" fill="#D97706" stroke="#78350F" stroke-width="2"/>
        `;
      }
      if (role === 'minute') {
        return `
          <rect x="-3.5" y="${(-92 * s).toFixed(1)}" width="7" height="${(102 * s).toFixed(1)}" rx="3" fill="#1E293B"/>
          <circle cx="0" cy="0" r="6" fill="#D97706" stroke="#78350F" stroke-width="1.8"/>
        `;
      }
      return `
        <line x1="0" y1="18" x2="0" y2="${(-96 * s).toFixed(1)}" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="${(-84 * s).toFixed(1)}" r="4.5" fill="none" stroke="#1E293B" stroke-width="2"/>
        <circle cx="0" cy="0" r="5" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      `;

    case 'square-brown': // Bold dark tapered hands + sleek gold second hand
      if (role === 'hour') {
        return `
          <polygon points="-5,10 -6,${(-62 * s).toFixed(1)} 0,${(-70 * s).toFixed(1)} 6,${(-62 * s).toFixed(1)} 5,10" fill="#18181B"/>
          <circle cx="0" cy="0" r="8" fill="#18181B"/>
        `;
      }
      if (role === 'minute') {
        return `
          <polygon points="-3.8,12 -4.5,${(-96 * s).toFixed(1)} 0,${(-104 * s).toFixed(1)} 4.5,${(-96 * s).toFixed(1)} 3.8,12" fill="#18181B"/>
          <circle cx="0" cy="0" r="6" fill="#27272A"/>
        `;
      }
      return `
        <line x1="0" y1="26" x2="0" y2="${(-106 * s).toFixed(1)}" stroke="#D4AF37" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="-2.2" y="10" width="4.4" height="18" rx="1.5" fill="#D4AF37"/>
        <circle cx="0" cy="0" r="5" fill="#D4AF37" stroke="#92400E" stroke-width="1.5"/>
      `;

    case 'cuckoo-white': // Matte charcoal-gray rectangular paddle hands w/ rounded hub
      if (role === 'hour') {
        return `
          <rect x="-5.5" y="${(-52 * s).toFixed(1)}" width="11" height="${(66 * s).toFixed(1)}" rx="3" fill="#475569"/>
          <circle cx="0" cy="0" r="9" fill="#334155"/>
        `;
      }
      return `
        <rect x="-4.5" y="${(-76 * s).toFixed(1)}" width="9" height="${(92 * s).toFixed(1)}" rx="3" fill="#334155"/>
        <circle cx="0" cy="0" r="8.5" fill="#475569" stroke="#1E293B" stroke-width="2"/>
      `;

    case 'steampunk-pipe': // Vintage pressure-gauge dark needle hands w/ brass cap
      if (role === 'hour') {
        return `
          <polygon points="-4,10 -2,${(-42 * s).toFixed(1)} 0,${(-48 * s).toFixed(1)} 2,${(-42 * s).toFixed(1)} 4,10" fill="#18181B"/>
          <circle cx="0" cy="0" r="7" fill="#D97706" stroke="#78350F" stroke-width="2"/>
        `;
      }
      return `
        <polygon points="-3,14 -1.5,${(-60 * s).toFixed(1)} 0,${(-66 * s).toFixed(1)} 1.5,${(-60 * s).toFixed(1)} 3,14" fill="#27272A"/>
        <circle cx="0" cy="0" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.8"/>
      `;

    case 'modern-black': // Bold rounded-tip matte black hands + thin sweep needle
      if (role === 'hour') {
        return `
          <rect x="-5.5" y="${(-64 * s).toFixed(1)}" width="11" height="${(76 * s).toFixed(1)}" rx="5.5" fill="#0F172A"/>
          <circle cx="0" cy="0" r="9" fill="#0F172A"/>
        `;
      }
      if (role === 'minute') {
        return `
          <rect x="-4" y="${(-96 * s).toFixed(1)}" width="8" height="${(108 * s).toFixed(1)}" rx="4" fill="#1E293B"/>
          <circle cx="0" cy="0" r="7.5" fill="#1E293B"/>
        `;
      }
      return `
        <line x1="0" y1="22" x2="0" y2="${(-102 * s).toFixed(1)}" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="5" fill="#0F172A" stroke="#64748B" stroke-width="1.6"/>
      `;

    case 'pendulum-clock': // Ornate antique dark hands + red-accented slim second hand
      if (role === 'hour') {
        return `
          <path d="M -3 8 L -3 ${(-30 * s).toFixed(1)} Q -9 ${(-36 * s).toFixed(1)} 0 ${(-48 * s).toFixed(1)} Q 9 ${(-36 * s).toFixed(1)} 3 ${(-30 * s).toFixed(1)} L 3 8 Z" fill="#18181B"/>
          <circle cx="0" cy="0" r="6.5" fill="#D4AF37" stroke="#78350F" stroke-width="1.8"/>
        `;
      }
      if (role === 'minute') {
        return `
          <path d="M -2.5 10 L -2.5 ${(-46 * s).toFixed(1)} Q -6 ${(-52 * s).toFixed(1)} 0 ${(-62 * s).toFixed(1)} Q 6 ${(-52 * s).toFixed(1)} 2.5 ${(-46 * s).toFixed(1)} L 2.5 10 Z" fill="#18181B"/>
          <circle cx="0" cy="0" r="5.5" fill="#D4AF37" stroke="#78350F" stroke-width="1.6"/>
        `;
      }
      return `
        <line x1="0" y1="16" x2="0" y2="${(-62 * s).toFixed(1)}" stroke="#DC2626" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="0" cy="12" r="3.5" fill="#DC2626"/>
        <circle cx="0" cy="0" r="4.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.4"/>
      `;

    case 'vintage-gold': // Intricate black baroque scrollwork filigree hands + slim silver second
      if (role === 'hour') {
        return `
          <path d="M 0 12 C -9 6 -12 -14 -4 -22 C -14 -28 -10 -44 0 -46 C 10 -44 14 -28 4 -22 C 12 -14 9 6 0 12 Z" fill="none" stroke="#18181B" stroke-width="3.6"/>
          <path d="M 0 -42 L -5 -58 L 0 ${(-76 * s).toFixed(1)} L 5 -58 Z" fill="#18181B"/>
          <circle cx="0" cy="-28" r="5" fill="none" stroke="#18181B" stroke-width="2.4"/>
          <circle cx="0" cy="0" r="7" fill="#18181B"/>
        `;
      }
      if (role === 'minute') {
        return `
          <path d="M 0 14 C -7 6 -8 -16 0 -24 C 8 -16 7 6 0 14 Z" fill="none" stroke="#18181B" stroke-width="3"/>
          <path d="M -2.5 -22 L -4 -66 L 0 ${(-104 * s).toFixed(1)} L 4 -66 L 2.5 -22 Z" fill="#18181B"/>
          <circle cx="0" cy="-44" r="5" fill="none" stroke="#18181B" stroke-width="2.4"/>
          <circle cx="0" cy="0" r="6" fill="#D4AF37" stroke="#18181B" stroke-width="1.8"/>
        `;
      }
      return `
        <line x1="0" y1="24" x2="0" y2="${(-108 * s).toFixed(1)}" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4.8" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
      `;

    case 'bead-watch': // Pointed polished-silver dauphine hands + ultra-slim silver second hand
      if (role === 'hour') {
        return `
          <polygon points="-4,10 -5,${(-38 * s).toFixed(1)} 0,${(-52 * s).toFixed(1)} 5,${(-38 * s).toFixed(1)} 4,10" fill="#94A3B8" stroke="#475569" stroke-width="1.6"/>
          <circle cx="0" cy="0" r="6" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
        `;
      }
      if (role === 'minute') {
        return `
          <polygon points="-3,12 -3.8,${(-56 * s).toFixed(1)} 0,${(-72 * s).toFixed(1)} 3.8,${(-56 * s).toFixed(1)} 3,12" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="#E2E8F0" stroke="#475569" stroke-width="1.4"/>
        `;
      }
      return `
        <line x1="0" y1="16" x2="0" y2="${(-76 * s).toFixed(1)}" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#94A3B8" stroke="#334155" stroke-width="1.4"/>
      `;

    case 'round-radio': // Sleek tapered charcoal hands w/ rear counterweights
    default:
      if (role === 'hour') {
        return `
          <polygon points="-4,22 -5.5,${(-68 * s).toFixed(1)} 0,${(-76 * s).toFixed(1)} 5.5,${(-68 * s).toFixed(1)} 4,22" fill="#27272A"/>
          <circle cx="0" cy="0" r="8" fill="#18181B"/>
        `;
      }
      if (role === 'minute') {
        return `
          <polygon points="-3,28 -4,${(-106 * s).toFixed(1)} 0,${(-114 * s).toFixed(1)} 4,${(-106 * s).toFixed(1)} 3,28" fill="#18181B"/>
          <circle cx="0" cy="0" r="6.5" fill="#27272A"/>
        `;
      }
      return `
        <line x1="0" y1="28" x2="0" y2="${(-112 * s).toFixed(1)}" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4.8" fill="#18181B" stroke="#94A3B8" stroke-width="1.5"/>
      `;
  }
}
