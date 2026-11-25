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
