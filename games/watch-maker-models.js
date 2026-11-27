/* =========================================================================
   WATCH MAKER MODELS — 8 Faithfully Crafted Clock Variations
   Each clock has its own faithful case, dial, hands, unique internal
   mechanism, and 3 difficulty levels (1.がいけん / 2.はぐるま / 3.ほんもの).
   ========================================================================= */

function buildRadialNumbers(cx, cy, r, labels, fontSize = 18, color = '#1E293B', fontWeight = '900', fontFamily = 'sans-serif') {
  return labels.map((lbl, i) => {
    const a = ((i + 1) * 30 - 90) * Math.PI / 180;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r + fontSize * 0.35;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" font-family="${fontFamily}">${lbl}</text>`;
  }).join('');
}

function renderDialWoodHygro() {
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    if (i % 5 === 0) {
      const x = Math.cos(a) * 101;
      const y = Math.sin(a) * 101;
      ticks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="none" stroke="#1E293B" stroke-width="1.8"/>`;
    } else {
      const r1 = 97, r2 = 105;
      ticks += `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}" stroke="#334155" stroke-width="1.4"/>`;
    }
  }
  const nums = buildRadialNumbers(0, 0, 78, ['1','2','3','4','5','6','7','8','9','10','11','12'], 22, '#1E293B', '800');
  return `
    <circle cx="0" cy="0" r="113" fill="#FAF7EE" stroke="#CBD5E1" stroke-width="3"/>
    ${ticks}
    ${nums}
    <text x="0" y="42" text-anchor="middle" font-size="9" font-weight="800" fill="#475569" letter-spacing="1.5" font-family="sans-serif">QUARTZ</text>
    <circle cx="0" cy="0" r="6" fill="#D97706"/>
  `;
}

function renderDialSquareBrown() {
  let ticks = '';
  const trackR = 114;
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    // Superellipse (squircle) track matching the square clock
    const cos = Math.cos(a), sin = Math.sin(a);
    const scale = 1 / Math.pow(Math.pow(Math.abs(cos), 3.6) + Math.pow(Math.abs(sin), 3.6), 1 / 3.6);
    const x2 = cos * scale * trackR;
    const y2 = sin * scale * trackR;
    const x1 = cos * scale * (trackR - 7);
    const y1 = sin * scale * (trackR - 7);
    if (i % 5 === 0) {
      ticks += `<circle cx="${((x1 + x2) / 2).toFixed(1)}" cy="${((y1 + y2) / 2).toFixed(1)}" r="2.8" fill="#18181B"/>`;
    } else {
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#3F3F46" stroke-width="1.3"/>`;
    }
  }
  const nums = ['1','2','3','4','5','6','7','8','9','10','11','12'].map((lbl, i) => {
    const a = ((i + 1) * 30 - 90) * Math.PI / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    const scale = 1 / Math.pow(Math.pow(Math.abs(cos), 3.2) + Math.pow(Math.abs(sin), 3.2), 1 / 3.2);
    const x = cos * scale * 88;
    const y = sin * scale * 88 + 9;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="26" font-weight="700" fill="#18181B" font-family="Georgia, serif">${lbl}</text>`;
  }).join('');
  return `
    <rect x="-126" y="-126" width="252" height="252" rx="8" fill="#FAF9F5" stroke="#D4D4D8" stroke-width="2.5"/>
    ${ticks}
    ${nums}
    <text x="0" y="54" text-anchor="middle" font-size="9" font-weight="700" fill="#52525B" letter-spacing="1.8" font-family="sans-serif">QUARTZ</text>
    <circle cx="0" cy="0" r="6" fill="#D4AF37"/>
  `;
}

function renderDialCuckooWhite() {
  const nums = buildRadialNumbers(0, 0, 68, ['1','2','3','4','5','6','7','8','9','10','11','12'], 20, '#18181B', '800');
  return `
    <circle cx="0" cy="0" r="88" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2.5"/>
    ${nums}
    <circle cx="0" cy="0" r="7" fill="#D4AF37" stroke="#78350F" stroke-width="1.5"/>
  `;
}

function renderDialSteampunk() {
  let wedges = '';
  for (let i = 0; i < 12; i++) {
    if (i % 3 === 0) continue;
    const a = (i * 30 - 90) * Math.PI / 180;
    const ax = Math.cos(a), ay = Math.sin(a);
    const px = -ay * 3.5, py = ax * 3.5;
    wedges += `<polygon points="${(ax * 58 - px).toFixed(1)},${(ay * 58 - py).toFixed(1)} ${(ax * 58 + px).toFixed(1)},${(ay * 58 + py).toFixed(1)} ${(ax * 38).toFixed(1)},${(ay * 38).toFixed(1)}" fill="#27272A"/>`;
  }
  let fine = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    fine += `<line x1="${(Math.cos(a) * 63).toFixed(1)}" y1="${(Math.sin(a) * 63).toFixed(1)}" x2="${(Math.cos(a) * 68).toFixed(1)}" y2="${(Math.sin(a) * 68).toFixed(1)}" stroke="#52525B" stroke-width="${i % 5 === 0 ? 1.8 : 0.9}"/>`;
  }
  return `
    <circle cx="0" cy="0" r="72" fill="#F4F4F5" stroke="#52525B" stroke-width="4"/>
    ${fine}
    ${wedges}
    <circle cx="0" cy="0" r="24" fill="none" stroke="#71717A" stroke-width="1.4" stroke-dasharray="3 2"/>
    <text x="0" y="-39" text-anchor="middle" font-size="22" font-weight="900" fill="#18181B" font-family="sans-serif">12</text>
    <text x="48" y="8" text-anchor="middle" font-size="22" font-weight="900" fill="#18181B" font-family="sans-serif">3</text>
    <text x="0" y="55" text-anchor="middle" font-size="22" font-weight="900" fill="#18181B" font-family="sans-serif">6</text>
    <text x="-48" y="8" text-anchor="middle" font-size="22" font-weight="900" fill="#18181B" font-family="sans-serif">9</text>
    <text x="0" y="34" text-anchor="middle" font-size="7" font-weight="800" fill="#71717A" font-family="sans-serif">BAR / PSI</text>
    <circle cx="0" cy="0" r="6" fill="#D97706"/>
  `;
}

function renderDialModernBlack() {
  let innerTicks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    const isHour = i % 5 === 0;
    const r1 = isHour ? 68 : 71;
    const r2 = 76;
    innerTicks += `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}" stroke="#18181B" stroke-width="${isHour ? 3.2 : 1.2}"/>`;
  }
  const nums = buildRadialNumbers(0, 0, 99, ['1','2','3','4','5','6','7','8','9','10','11','12'], 22, '#18181B', '800');
  return `
    <circle cx="0" cy="0" r="122" fill="#FFFFFF" stroke="#27272A" stroke-width="3"/>
    ${innerTicks}
    ${nums}
    <circle cx="0" cy="0" r="7" fill="#18181B"/>
  `;
}

function renderDialPendulum() {
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const nums = buildRadialNumbers(0, 0, 48, romans, 12, '#1E293B', '900', 'Georgia, serif');
  return `
    <circle cx="0" cy="0" r="64" fill="#FEFCE8" stroke="#D4AF37" stroke-width="5"/>
    <circle cx="0" cy="0" r="57" fill="none" stroke="#1E293B" stroke-width="1.4"/>
    <circle cx="0" cy="0" r="36" fill="none" stroke="#92400E" stroke-width="1.2"/>
    ${nums}
    <circle cx="0" cy="-16" r="9" fill="none" stroke="#94A3B8" stroke-width="1"/>
    <circle cx="0" cy="0" r="5" fill="#D4AF37"/>
  `;
}

function renderDialVintageGold() {
  let bars = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    if (i % 5 === 0) {
      const deg = i * 6;
      const isCardinal = i % 15 === 0;
      const w = isCardinal ? 11 : 8;
      const h = isCardinal ? 28 : 24;
      bars += `
        <g transform="rotate(${deg}) translate(0, -88)">
          <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.5" fill="#E2E8F0" stroke="#475569" stroke-width="1.6"/>
          <line x1="0" y1="${-h / 2 + 2}" x2="0" y2="${h / 2 - 2}" stroke="#FFFFFF" stroke-width="2.2"/>
        </g>
      `;
    } else {
      bars += `<line x1="${(Math.cos(a) * 95).toFixed(1)}" y1="${(Math.sin(a) * 95).toFixed(1)}" x2="${(Math.cos(a) * 101).toFixed(1)}" y2="${(Math.sin(a) * 101).toFixed(1)}" stroke="#57534E" stroke-width="1.2"/>`;
    }
  }
  return `
    <rect x="-124" y="-124" width="248" height="248" rx="4" fill="#DFD7B6" stroke="#94A3B8" stroke-width="3"/>
    <rect x="-112" y="-112" width="224" height="224" fill="none" stroke="#57534E" stroke-width="1.5"/>
    <!-- Subtle linen weave lines -->
    <line x1="-112" y1="-56" x2="112" y2="-56" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    <line x1="-112" y1="0" x2="112" y2="0" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    <line x1="-112" y1="56" x2="112" y2="56" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    <line x1="-56" y1="-112" x2="-56" y2="112" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    <line x1="0" y1="-112" x2="0" y2="112" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    <line x1="56" y1="-112" x2="56" y2="112" stroke="rgba(120,113,108,0.14)" stroke-width="1"/>
    ${bars}
    <text x="0" y="48" text-anchor="middle" font-size="9" font-weight="800" fill="#57534E" letter-spacing="1.6" font-family="sans-serif">CLASSIC</text>
    <circle cx="0" cy="0" r="6" fill="#D4AF37"/>
  `;
}

function renderDialRoundRadio() {
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    const x = Math.cos(a) * 124;
    const y = Math.sin(a) * 124;
    if (i % 5 === 0) {
      ticks += `<rect x="${(x - 2.6).toFixed(1)}" y="${(y - 2.6).toFixed(1)}" width="5.2" height="5.2" rx="1" fill="#1E293B"/>`;
    } else {
      ticks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#475569"/>`;
    }
  }
  const nums = buildRadialNumbers(0, 0, 99, ['1','2','3','4','5','6','7','8','9','10','11','12'], 25, '#27272A', '800');
  return `
    <circle cx="0" cy="0" r="136" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
    ${ticks}
    ${nums}
    <!-- Radio controlled antenna icon -->
    <g transform="translate(0, 48)">
      <line x1="0" y1="-8" x2="0" y2="4" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
      <path d="M -6 -6 Q -10 -2 -6 2" fill="none" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M 6 -6 Q 10 -2 6 2" fill="none" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/>
      <text x="0" y="14" text-anchor="middle" font-size="7" font-weight="800" fill="#475569" font-family="sans-serif">RADIO CONTROLLED</text>
    </g>
    <circle cx="0" cy="0" r="6" fill="#1E293B"/>
  `;
}

function renderGlassCircle(r, stroke = '#94A3B8') {
  return `
    <circle cx="0" cy="0" r="${r}" fill="rgba(186,230,253,0.14)" stroke="${stroke}" stroke-width="5"/>
    <path d="M ${(-r * 0.62).toFixed(1)} ${(-r * 0.48).toFixed(1)} Q ${(-r * 0.2).toFixed(1)} ${(-r * 0.84).toFixed(1)} ${(r * 0.36).toFixed(1)} ${(-r * 0.64).toFixed(1)}"
      fill="none" stroke="rgba(255,255,255,0.68)" stroke-width="8" stroke-linecap="round"/>
  `;
}

function renderGlassSquare(half, stroke = '#CBD5E1') {
  return `
    <rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="8"
      fill="rgba(186,230,253,0.14)" stroke="${stroke}" stroke-width="5"/>
    <path d="M ${(-half * 0.72).toFixed(1)} ${(-half * 0.52).toFixed(1)} L ${(-half * 0.16).toFixed(1)} ${(-half * 0.78).toFixed(1)}"
      stroke="rgba(255,255,255,0.65)" stroke-width="10" stroke-linecap="round"/>
  `;
}

export const CLOCK_MODELS = [
  /* 1. 温湿度計付き木枠時計 */
  {
    id: 'wood-hygro',
    name: 'おんど とけい',
    mechLabel: 'バイメタル・クォーツ',
    animType: 'quartz-step',
    dialCenter: { x: 280, y: 152, r: 114 },
    handStyle: 'wood-hygro',
    handScale: 0.92,
    hasSecond: true,
    renderCaseBg() {
      return `
        <rect x="136" y="14" width="288" height="372" rx="18" fill="#A65E18" stroke="#6B3A0B" stroke-width="5"/>
        <rect x="148" y="24" width="264" height="352" rx="12" fill="#B86B20" opacity="0.45"/>
        <line x1="168" y1="20" x2="168" y2="380" stroke="#854810" stroke-width="2" opacity="0.4"/>
        <line x1="392" y1="20" x2="392" y2="380" stroke="#854810" stroke-width="2" opacity="0.4"/>
        <circle cx="280" cy="152" r="118" fill="#3B2410" stroke="#78350F" stroke-width="4"/>
        <circle cx="202" cy="318" r="47" fill="#3B2410" stroke="#78350F" stroke-width="3.5"/>
        <circle cx="358" cy="318" r="47" fill="#3B2410" stroke="#78350F" stroke-width="3.5"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="280" cy="152" r="112" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
        <circle cx="202" cy="318" r="43" fill="#CBD5E1" stroke="#64748B" stroke-width="2.5"/>
        <circle cx="358" cy="318" r="43" fill="#CBD5E1" stroke="#64748B" stroke-width="2.5"/>
      `;
    },
    renderDialSvg: renderDialWoodHygro,
    renderGlassSvg: () => renderGlassCircle(115, '#D4A373'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="14" y="4" width="52" height="72" rx="6" fill="#A65E18" stroke="#6B3A0B" stroke-width="2.5"/>
        <circle cx="40" cy="30" r="20" fill="#FAF7EE" stroke="#78350F" stroke-width="2"/>
        <line x1="40" y1="30" x2="40" y2="18" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="40" y1="30" x2="50" y2="34" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        <circle cx="27" cy="61" r="9" fill="#FAF7EE" stroke="#78350F" stroke-width="1.6"/>
        <circle cx="53" cy="61" r="9" fill="#FAF7EE" stroke="#78350F" stroke-width="1.6"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'quartz', label: 'すいしょう', ruby: '水晶', kind: 'quartz-ic', x: 230, y: 112, r: 30, thumbBox: '-38 -28 76 56', req: null, phase: 'mech' },
        { id: 'coil', label: 'こいる', ruby: 'コイル', kind: 'motor-coil', x: 332, y: 118, r: 30, thumbBox: '-38 -24 76 48', req: 'quartz', phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 152, r: 34, thumbBox: '-42 -42 84 84', req: 'coil', speed: -0.9, phase: 'mech' },
        { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-silver', x: 332, y: 184, r: 24, thumbBox: '-32 -32 64 64', req: 'center', speed: 1.5, phase: 'mech' },
        { id: 'hygrocoil', label: 'しつどバネ', ruby: '湿度バネ', kind: 'hygro-coil', x: 202, y: 318, r: 28, thumbBox: '-34 -34 68 68', req: 'third', phase: 'mech' },
        { id: 'bimetal', label: 'バイメタル', ruby: '温度バネ', kind: 'bimetal', x: 358, y: 318, r: 28, thumbBox: '-34 -34 68 68', req: 'hygrocoil', phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 152, r: 114, thumbBox: '-122 -122 244 244', req: prevReq, phase: 'face' },
        { id: 'sub-hygro', label: 'しつどけい', kind: 'sub-hygro', x: 202, y: 318, r: 44, thumbBox: '-48 -48 96 96', req: 'dial', phase: 'face' },
        { id: 'sub-thermo', label: 'おんどけい', kind: 'sub-thermo', x: 358, y: 318, r: 44, thumbBox: '-48 -48 96 96', req: 'sub-hygro', phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 152, r: 46, thumbBox: '-36 -82 72 96', req: 'sub-thermo', initAngle: -125, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 152, r: 52, thumbBox: '-36 -102 72 116', req: 'hour', initAngle: 175, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 152, r: 52, thumbBox: '-36 -104 72 126', req: 'minute', initAngle: -35, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 152, r: 115, thumbBox: '-124 -124 248 248', req: 'second', phase: 'face' }
      ];
    }
  },

  /* 2. 濃い茶の四角い掛け時計 */
  {
    id: 'square-brown',
    name: 'ちゃいろ しかく',
    mechLabel: 'ハイトルク・クォーツ',
    animType: 'quartz-step',
    dialCenter: { x: 280, y: 200, r: 126 },
    handStyle: 'square-brown',
    handScale: 0.96,
    hasSecond: true,
    renderCaseBg() {
      return `
        <rect x="114" y="34" width="332" height="332" rx="10" fill="#2C130E" stroke="#180A07" stroke-width="6"/>
        <line x1="114" y1="34" x2="152" y2="72" stroke="#4A2118" stroke-width="3"/>
        <line x1="446" y1="34" x2="408" y2="72" stroke="#4A2118" stroke-width="3"/>
        <line x1="114" y1="366" x2="152" y2="328" stroke="#4A2118" stroke-width="3"/>
        <line x1="446" y1="366" x2="408" y2="328" stroke="#4A2118" stroke-width="3"/>
        <rect x="152" y="72" width="256" height="256" rx="6" fill="#3F221C" stroke="#5C2D22" stroke-width="3"/>
      `;
    },
    renderMovementPlate() {
      return `
        <rect x="158" y="78" width="244" height="244" rx="10" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
        <rect x="172" y="92" width="216" height="216" rx="6" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 4"/>
      `;
    },
    renderDialSvg: renderDialSquareBrown,
    renderGlassSvg: () => renderGlassSquare(127, '#78350F'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="8" y="8" width="64" height="64" rx="5" fill="#2C130E" stroke="#180A07" stroke-width="2.5"/>
        <rect x="16" y="16" width="48" height="48" rx="3" fill="#FAF9F5"/>
        <line x1="40" y1="40" x2="28" y2="50" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="32" y2="58" stroke="#18181B" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="20" y2="36" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'battery', label: 'でんち', ruby: '電池', kind: 'battery', x: 224, y: 122, r: 32, thumbBox: '-40 -22 80 44', req: null, phase: 'mech' },
        { id: 'quartz', label: 'すいしょう', ruby: '水晶', kind: 'quartz-ic', x: 336, y: 124, r: 30, thumbBox: '-38 -28 76 56', req: 'battery', phase: 'mech' },
        { id: 'coil', label: 'こいる', ruby: 'コイル', kind: 'motor-coil', x: 214, y: 268, r: 30, thumbBox: '-38 -24 76 48', req: 'quartz', phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 200, r: 38, thumbBox: '-46 -46 92 92', req: 'coil', speed: -0.8, phase: 'mech' },
        { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-brass', x: 344, y: 214, r: 26, thumbBox: '-34 -34 68 68', req: 'center', speed: 1.35, phase: 'mech' },
        { id: 'fourth', label: 'よんばんしゃ', ruby: '四番車', kind: 'wheel-silver', x: 324, y: 274, r: 24, thumbBox: '-32 -32 64 64', req: 'third', speed: -2.0, phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 200, r: 126, thumbBox: '-134 -134 268 268', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 200, r: 46, thumbBox: '-36 -80 72 96', req: 'dial', initAngle: -135, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 200, r: 54, thumbBox: '-36 -112 72 130', req: 'hour', initAngle: -155, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 200, r: 54, thumbBox: '-36 -114 72 146', req: 'minute', initAngle: -80, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 200, r: 127, thumbBox: '-134 -134 268 268', req: 'second', phase: 'face' }
      ];
    }
  },

  /* 3. 白い鳩時計 */
  {
    id: 'cuckoo-white',
    name: 'はと どけい',
    mechLabel: 'ふいご・はと しかけ',
    animType: 'cuckoo',
    dialCenter: { x: 280, y: 278, r: 88 },
    handStyle: 'cuckoo-white',
    handScale: 0.92,
    hasSecond: false,
    renderCaseBg() {
      return `
        <!-- Minimalist white cuckoo house body -->
        <rect x="166" y="106" width="228" height="278" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="5"/>
        <!-- Pitched overhanging white roof -->
        <polygon points="128,122 280,18 432,122 414,138 280,46 146,138" fill="#FFFFFF" stroke="#94A3B8" stroke-width="4" stroke-linejoin="round"/>
        <!-- Recessed cuckoo nest box -->
        <path d="M 256 160 L 256 130 Q 280 112 304 130 L 304 160 Z" fill="#334155" stroke="#94A3B8" stroke-width="2.5"/>
      `;
    },
    renderMovementPlate() {
      return `
        <rect x="180" y="114" width="200" height="256" rx="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3"/>
        <circle cx="280" cy="278" r="82" fill="#CBD5E1" stroke="#64748B" stroke-width="2.5"/>
      `;
    },
    renderDialSvg: renderDialCuckooWhite,
    renderGlassSvg: () => renderGlassCircle(89, '#CBD5E1'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="18" y="24" width="44" height="50" rx="3" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2.5"/>
        <polygon points="10,28 40,6 70,28 65,33 40,14 15,33" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="33" y="26" width="14" height="12" rx="2" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.6"/>
        <circle cx="40" cy="56" r="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
        <line x1="40" y1="56" x2="32" y2="64" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="40" y1="56" x2="40" y2="69" stroke="#334155" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'barrel', label: 'こうばこ', ruby: '香箱', kind: 'barrel', x: 224, y: 242, r: 30, thumbBox: '-38 -38 76 76', req: null, speed: 0.5, phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 278, r: 32, thumbBox: '-40 -40 80 80', req: 'barrel', speed: -0.9, phase: 'mech' },
        { id: 'escape', label: 'がんぎしゃ', ruby: 'ガンギ車', kind: 'escape', x: 334, y: 256, r: 22, thumbBox: '-30 -30 60 60', req: 'center', speed: 2.0, phase: 'mech' },
        { id: 'bellows', label: 'ふいご', ruby: 'ふいご', kind: 'bellows', x: 224, y: 172, r: 30, thumbBox: '-36 -30 72 60', req: 'escape', phase: 'mech' },
        { id: 'bird', label: 'はと', ruby: 'はと', kind: 'cuckoo-bird', x: 280, y: 146, r: 26, thumbBox: '-32 -28 64 64', req: 'bellows', phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'door', label: 'とびら', kind: 'cuckoo-door', x: 280, y: 142, r: 30, thumbBox: '-32 -30 64 56', req: prevReq, phase: 'face' },
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 278, r: 88, thumbBox: '-94 -94 188 188', req: 'door', phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 278, r: 44, thumbBox: '-32 -64 64 82', req: 'dial', initAngle: -135, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 278, r: 50, thumbBox: '-32 -84 64 104', req: 'hour', initAngle: 180, phase: 'face' }
      ];
    }
  },

  /* 4. スチームパンク圧力計パイプ時計 */
  {
    id: 'steampunk-pipe',
    name: 'パイプ どけい',
    mechLabel: 'ブルドンかん・じょうき',
    animType: 'steampunk',
    dialCenter: { x: 396, y: 112, r: 72 },
    handStyle: 'steampunk-pipe',
    handScale: 0.92,
    hasSecond: false,
    renderCaseBg() {
      let rivets = '';
      for (let i = 0; i < 12; i++) {
        const a = (i * 30) * Math.PI / 180;
        rivets += `<circle cx="${(246 + Math.cos(a) * 94).toFixed(1)}" cy="${(224 + Math.sin(a) * 94).toFixed(1)}" r="4.2" fill="#94A3B8" stroke="#18181B" stroke-width="1.5"/>`;
      }
      return `
        <!-- Boiler stand -->
        <path d="M 166 348 L 184 304 L 308 304 L 326 348 Z" fill="#27272A" stroke="#18181B" stroke-width="4"/>
        <!-- Right vertical iron pipe supporting gauge clock -->
        <rect x="382" y="182" width="28" height="162" rx="6" fill="#52525B" stroke="#18181B" stroke-width="4"/>
        <rect x="266" y="330" width="144" height="24" rx="8" fill="#52525B" stroke="#18181B" stroke-width="4"/>
        <!-- Left looping brass/copper pipe -->
        <path d="M 186 196 L 186 92 Q 186 64 156 64 L 116 64 Q 88 64 88 92 L 88 320 Q 88 342 114 342 L 210 342"
          fill="none" stroke="#B45309" stroke-width="11" stroke-linecap="round"/>
        <path d="M 186 196 L 186 92 Q 186 64 156 64 L 116 64 Q 88 64 88 92 L 88 320 Q 88 342 114 342 L 210 342"
          fill="none" stroke="#FBBF24" stroke-width="5" stroke-linecap="round"/>
        <!-- Silver pipe fittings -->
        <rect x="74" y="200" width="32" height="52" rx="6" fill="#94A3B8" stroke="#334155" stroke-width="3"/>
        <rect x="372" y="200" width="48" height="44" rx="6" fill="#94A3B8" stroke="#334155" stroke-width="3"/>
        <rect x="372" y="320" width="48" height="42" rx="10" fill="#94A3B8" stroke="#334155" stroke-width="3"/>
        <!-- Riveted gunmetal boiler drum -->
        <circle cx="246" cy="224" r="106" fill="#27272A" stroke="#71717A" stroke-width="6"/>
        <circle cx="246" cy="224" r="84" fill="#18181B" stroke="#52525B" stroke-width="3"/>
        ${rivets}
        <!-- Horizontal brass manifold across boiler -->
        <path d="M 106 226 L 392 226" fill="none" stroke="#D97706" stroke-width="9" stroke-linecap="round"/>
        <path d="M 106 226 L 392 226" fill="none" stroke="#FDE68A" stroke-width="3" stroke-linecap="round"/>
        <!-- Top-right pressure gauge outer ring -->
        <circle cx="396" cy="112" r="80" fill="#A1A1AA" stroke="#27272A" stroke-width="5"/>
        <circle cx="396" cy="112" r="72" fill="#27272A" stroke="#52525B" stroke-width="3"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="246" cy="224" r="82" fill="#3F3F46" stroke="#71717A" stroke-width="3"/>
        <circle cx="396" cy="112" r="68" fill="#52525B" stroke="#A1A1AA" stroke-width="2.5"/>
      `;
    },
    renderDialSvg: renderDialSteampunk,
    renderGlassSvg: () => renderGlassCircle(73, '#A1A1AA'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <path d="M 12 64 L 12 16 Q 12 10 20 10 L 30 10 L 30 34" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
        <circle cx="34" cy="46" r="20" fill="#27272A" stroke="#71717A" stroke-width="3"/>
        <line x1="12" y1="46" x2="60" y2="46" stroke="#F59E0B" stroke-width="3"/>
        <line x1="58" y1="32" x2="58" y2="66" stroke="#52525B" stroke-width="5"/>
        <circle cx="58" cy="22" r="15" fill="#F4F4F5" stroke="#52525B" stroke-width="3"/>
        <line x1="58" y1="22" x2="58" y2="12" stroke="#18181B" stroke-width="2"/>
        <circle cx="34" cy="64" r="6" fill="#DC2626" stroke="#7F1D1D" stroke-width="2"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'bourdon', label: 'ブルドンかん', ruby: '圧力パイプ', kind: 'bourdon', x: 244, y: 218, r: 44, thumbBox: '-60 -58 116 116', req: null, phase: 'mech' },
        { id: 'sector', label: 'おうぎギア', ruby: '扇歯車', kind: 'sector-gear', x: 254, y: 224, r: 28, thumbBox: '-22 -24 68 56', req: 'bourdon', phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-copper', x: 214, y: 234, r: 28, thumbBox: '-36 -36 72 72', req: 'sector', speed: -1.1, phase: 'mech' },
        { id: 'gaugegear', label: 'めもりギア', ruby: '計器車', kind: 'wheel-gold', x: 396, y: 112, r: 30, thumbBox: '-38 -38 76 76', req: 'center', speed: 1.5, phase: 'mech' },
        { id: 'valve', label: 'あかいバルブ', ruby: 'バルブ', kind: 'valve', x: 242, y: 316, r: 28, thumbBox: '-36 -36 72 72', req: 'gaugegear', speed: 0.7, phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 396, y: 112, r: 72, thumbBox: '-78 -78 156 156', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 396, y: 112, r: 42, thumbBox: '-28 -58 56 72', req: 'dial', initAngle: -135, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 396, y: 112, r: 46, thumbBox: '-28 -74 56 92', req: 'hour', initAngle: 180, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 396, y: 112, r: 73, thumbBox: '-78 -78 156 156', req: 'minute', phase: 'face' }
      ];
    }
  },

  /* 5. 黒い四角いシンプル時計 */
  {
    id: 'modern-black',
    name: 'くろい しかく',
    mechLabel: 'スイープ・わくせいギア',
    animType: 'sweep',
    dialCenter: { x: 280, y: 200, r: 122 },
    handStyle: 'modern-black',
    handScale: 0.95,
    hasSecond: true,
    renderCaseBg() {
      return `
        <rect x="120" y="40" width="320" height="320" rx="16" fill="#18181B" stroke="#09090B" stroke-width="5"/>
        <circle cx="280" cy="200" r="134" fill="#27272A" stroke="#3F3F46" stroke-width="4"/>
        <circle cx="280" cy="200" r="124" fill="#09090B"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="280" cy="200" r="120" fill="#334155" stroke="#64748B" stroke-width="3"/>
        <circle cx="280" cy="200" r="102" fill="none" stroke="#475569" stroke-width="10" stroke-dasharray="10 6"/>
      `;
    },
    renderDialSvg: renderDialModernBlack,
    renderGlassSvg: () => renderGlassCircle(123, '#3F3F46'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="10" y="10" width="60" height="60" rx="6" fill="#18181B"/>
        <circle cx="40" cy="40" r="24" fill="#FFFFFF" stroke="#3F3F46" stroke-width="2.5"/>
        <circle cx="40" cy="40" r="14" fill="none" stroke="#18181B" stroke-width="1.5" stroke-dasharray="2 3"/>
        <line x1="40" y1="40" x2="30" y2="49" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="32" y2="57" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'battery', label: 'でんち', ruby: '電池', kind: 'battery', x: 280, y: 118, r: 30, thumbBox: '-40 -22 80 44', req: null, phase: 'mech' },
        { id: 'coil', label: 'スイープこいる', ruby: '静音コイル', kind: 'motor-coil', x: 280, y: 278, r: 30, thumbBox: '-38 -24 76 48', req: 'battery', phase: 'mech' },
        { id: 'sun', label: 'たいようギア', ruby: '太陽車', kind: 'wheel-gold', x: 280, y: 200, r: 34, thumbBox: '-42 -42 84 84', req: 'coil', speed: 1.4, phase: 'mech' },
        { id: 'planet1', label: 'わくせいギア1', ruby: '遊星車', kind: 'wheel-silver', x: 214, y: 200, r: 24, thumbBox: '-32 -32 64 64', req: 'sun', speed: -2.0, phase: 'mech' },
        { id: 'planet2', label: 'わくせいギア2', ruby: '遊星車', kind: 'wheel-silver', x: 346, y: 200, r: 24, thumbBox: '-32 -32 64 64', req: 'planet1', speed: -2.0, phase: 'mech' },
        { id: 'bridge', label: 'うけいた', ruby: '受け板', kind: 'bridge', x: 280, y: 200, r: 62, thumbBox: '-90 -68 180 156', req: 'planet2', phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 200, r: 122, thumbBox: '-128 -128 256 256', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 200, r: 46, thumbBox: '-36 -78 72 94', req: 'dial', initAngle: -135, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 200, r: 52, thumbBox: '-36 -108 72 126', req: 'hour', initAngle: -150, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 200, r: 52, thumbBox: '-36 -110 72 138', req: 'minute', initAngle: 38, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 200, r: 123, thumbBox: '-128 -128 256 256', req: 'second', phase: 'face' }
      ];
    }
  },

  /* 6. 振り子付きアンティーク柱時計 */
  {
    id: 'pendulum-clock',
    name: 'ふりこ どけい',
    mechLabel: 'ふりこ・いかりあんくる',
    animType: 'pendulum',
    dialCenter: { x: 280, y: 146, r: 64 },
    handStyle: 'pendulum-clock',
    handScale: 0.94,
    hasSecond: true,
    renderCaseBg() {
      return `
        <!-- 3 turned finials on crown -->
        <ellipse cx="280" cy="26" rx="14" ry="11" fill="#5C281E" stroke="#2C130E" stroke-width="3"/>
        <circle cx="280" cy="14" r="5" fill="#D4AF37"/>
        <ellipse cx="196" cy="48" rx="9" ry="12" fill="#5C281E" stroke="#2C130E" stroke-width="2.5"/>
        <circle cx="196" cy="35" r="4" fill="#D4AF37"/>
        <ellipse cx="364" cy="48" rx="9" ry="12" fill="#5C281E" stroke="#2C130E" stroke-width="2.5"/>
        <circle cx="364" cy="35" r="4" fill="#D4AF37"/>

        <!-- Ornate mahogany grandfather body -->
        <rect x="178" y="60" width="204" height="314" rx="8" fill="#52241B" stroke="#2C130E" stroke-width="5"/>
        <rect x="164" y="366" width="232" height="22" rx="6" fill="#431C14" stroke="#2C130E" stroke-width="4"/>

        <!-- Gold crown emblem & decorative filigree trim -->
        <rect x="196" y="64" width="168" height="12" rx="3" fill="#D4AF37" stroke="#78350F" stroke-width="2"/>
        <circle cx="280" cy="70" r="12" fill="#F3D678" stroke="#78350F" stroke-width="2"/>
        <circle cx="280" cy="70" r="4.5" fill="#2C130E"/>
        <rect x="186" y="90" width="10" height="260" rx="4" fill="#D4AF37" opacity="0.85"/>
        <rect x="364" y="90" width="10" height="260" rx="4" fill="#D4AF37" opacity="0.85"/>

        <!-- Gold decorative dial wreath -->
        <circle cx="280" cy="146" r="74" fill="#E5C158" stroke="#78350F" stroke-width="3"/>
        <circle cx="280" cy="146" r="65" fill="#2C130E"/>

        <!-- Open lower skeleton pendulum window -->
        <rect x="208" y="226" width="144" height="124" rx="8" fill="#1C0E0B" stroke="#78350F" stroke-width="3.5"/>
        <!-- Gold bottom flourish -->
        <rect x="218" y="346" width="124" height="14" rx="5" fill="#E5C158" stroke="#78350F" stroke-width="2"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="280" cy="146" r="62" fill="#3B2318" stroke="#D4AF37" stroke-width="2.5"/>
        <rect x="212" y="230" width="136" height="116" rx="6" fill="#1C0E0B" stroke="#92400E" stroke-width="2"/>
      `;
    },
    renderDialSvg: renderDialPendulum,
    renderGlassSvg: () => renderGlassCircle(65, '#D4AF37'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="20" y="12" width="40" height="62" rx="4" fill="#52241B" stroke="#2C130E" stroke-width="2.5"/>
        <circle cx="40" cy="7" r="4" fill="#52241B"/>
        <circle cx="40" cy="29" r="14" fill="#FEFCE8" stroke="#D4AF37" stroke-width="3"/>
        <rect x="26" y="47" width="28" height="22" rx="3" fill="#1C0E0B"/>
        <line x1="40" y1="47" x2="40" y2="60" stroke="#D4AF37" stroke-width="2"/>
        <circle cx="40" cy="61" r="7" fill="#E5C158" stroke="#92400E" stroke-width="1.5"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'barrel', label: 'こうばこ', ruby: '香箱', kind: 'barrel', x: 244, y: 274, r: 26, thumbBox: '-34 -34 68 68', req: null, speed: 0.45, phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-dark', x: 298, y: 266, r: 26, thumbBox: '-34 -34 68 68', req: 'barrel', speed: -0.8, phase: 'mech' },
        { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-gold', x: 326, y: 300, r: 21, thumbBox: '-28 -28 56 56', req: 'center', speed: 1.3, phase: 'mech' },
        { id: 'escape', label: 'がんぎしゃ', ruby: 'ガンギ車', kind: 'escape', x: 280, y: 146, r: 26, thumbBox: '-34 -34 68 68', req: 'third', speed: 0, phase: 'mech' },
        { id: 'anchor', label: 'いかりあんくる', ruby: 'アンクル', kind: 'anchor', x: 280, y: 112, r: 24, thumbBox: '-34 -18 68 38', req: 'escape', phase: 'mech' },
        { id: 'pendulum', label: 'ふりこ', ruby: '振り子', kind: 'pendulum', x: 280, y: 226, r: 42, thumbBox: '-42 -6 84 132', req: 'anchor', phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 146, r: 64, thumbBox: '-72 -72 144 144', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 146, r: 40, thumbBox: '-24 -56 48 68', req: 'dial', initAngle: -145, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 146, r: 44, thumbBox: '-24 -68 48 82', req: 'hour', initAngle: 180, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 146, r: 44, thumbBox: '-24 -68 48 90', req: 'minute', initAngle: 32, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 146, r: 65, thumbBox: '-72 -72 144 144', req: 'second', phase: 'face' }
      ];
    }
  },

  /* 7. 昭和レトロ木目・バーインデックス角型時計 */
  {
    id: 'vintage-gold',
    name: 'クラシック かく',
    mechLabel: 'おんさ・きんめっき',
    animType: 'tuning-fork',
    dialCenter: { x: 280, y: 200, r: 124 },
    handStyle: 'vintage-gold',
    handScale: 0.94,
    hasSecond: true,
    renderCaseBg() {
      return `
        <!-- Deep rosewood wide mitered frame -->
        <rect x="104" y="28" width="352" height="344" rx="6" fill="#3B1310" stroke="#1E0806" stroke-width="6"/>
        <line x1="104" y1="28" x2="148" y2="72" stroke="#5E211C" stroke-width="3"/>
        <line x1="456" y1="28" x2="412" y2="72" stroke="#5E211C" stroke-width="3"/>
        <line x1="104" y1="372" x2="148" y2="328" stroke="#5E211C" stroke-width="3"/>
        <line x1="456" y1="372" x2="412" y2="328" stroke="#5E211C" stroke-width="3"/>
        <!-- Polished silver-chrome inner bezel -->
        <rect x="144" y="66" width="272" height="268" rx="4" fill="#E2E8F0" stroke="#64748B" stroke-width="4"/>
        <rect x="156" y="76" width="248" height="248" rx="2" fill="#44403C"/>
      `;
    },
    renderMovementPlate() {
      return `
        <rect x="158" y="78" width="244" height="244" rx="6" fill="#FEF3C7" stroke="#B45309" stroke-width="3"/>
        <circle cx="280" cy="200" r="108" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="6 4"/>
      `;
    },
    renderDialSvg: renderDialVintageGold,
    renderGlassSvg: () => renderGlassSquare(125, '#E2E8F0'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <rect x="6" y="8" width="68" height="64" rx="3" fill="#3B1310" stroke="#1E0806" stroke-width="2"/>
        <rect x="15" y="16" width="50" height="48" fill="#DFD7B6" stroke="#CBD5E1" stroke-width="3"/>
        <rect x="38" y="20" width="4" height="7" fill="#94A3B8"/>
        <rect x="38" y="53" width="4" height="7" fill="#94A3B8"/>
        <rect x="20" y="38" width="7" height="4" fill="#94A3B8"/>
        <rect x="53" y="38" width="7" height="4" fill="#94A3B8"/>
        <line x1="40" y1="40" x2="31" y2="50" stroke="#18181B" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="40" y2="56" stroke="#18181B" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'barrel', label: 'こうばこ', ruby: '香箱', kind: 'barrel', x: 214, y: 150, r: 34, thumbBox: '-42 -42 84 84', req: null, speed: 0.4, phase: 'mech' },
        { id: 'ratchet', label: 'かくあなぐるま', ruby: '角穴車', kind: 'ratchet', x: 214, y: 150, r: 22, thumbBox: '-30 -30 60 60', req: 'barrel', speed: 0.4, phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 200, r: 36, thumbBox: '-44 -44 88 88', req: 'ratchet', speed: -0.75, phase: 'mech' },
        { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-brass', x: 342, y: 158, r: 25, thumbBox: '-34 -34 68 68', req: 'center', speed: 1.25, phase: 'mech' },
        { id: 'fork', label: 'おんさ', ruby: '音叉', kind: 'tuning-fork', x: 336, y: 254, r: 32, thumbBox: '-32 -44 64 88', req: 'third', phase: 'mech' },
        { id: 'bridge', label: 'きんうけいた', ruby: '金受け板', kind: 'bridge-gold', x: 280, y: 200, r: 66, thumbBox: '-90 -68 180 156', req: 'fork', phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 200, r: 124, thumbBox: '-132 -132 264 264', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 200, r: 46, thumbBox: '-36 -84 72 104', req: 'dial', initAngle: -140, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 200, r: 54, thumbBox: '-36 -112 72 132', req: 'hour', initAngle: 180, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 200, r: 54, thumbBox: '-36 -114 72 144', req: 'minute', initAngle: 122, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 200, r: 125, thumbBox: '-132 -132 264 264', req: 'second', phase: 'face' }
      ];
    }
  },

  /* 8. ナチュラル木枠の丸い電波時計 */
  {
    id: 'round-radio',
    name: 'まるい でんぱ',
    mechLabel: 'でんぱ・フェライトアンテナ',
    animType: 'radio',
    dialCenter: { x: 280, y: 200, r: 136 },
    handStyle: 'round-radio',
    handScale: 0.96,
    hasSecond: true,
    renderCaseBg() {
      return `
        <!-- Natural light-oak round wooden frame -->
        <circle cx="280" cy="200" r="158" fill="#C7A672" stroke="#9A7B4F" stroke-width="6"/>
        <circle cx="280" cy="200" r="147" fill="none" stroke="#DFC597" stroke-width="4" opacity="0.7"/>
        <circle cx="280" cy="200" r="138" fill="#475569"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="280" cy="200" r="134" fill="#DCE4EE" stroke="#94A3B8" stroke-width="3"/>
        <circle cx="280" cy="200" r="118" fill="none" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="6 4"/>
      `;
    },
    renderDialSvg: renderDialRoundRadio,
    renderGlassSvg: () => renderGlassCircle(137, '#C7A672'),
    thumbSvg: `
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="#FFFFFF" stroke="#C7A672" stroke-width="7"/>
        <line x1="40" y1="40" x2="27" y2="52" stroke="#27272A" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="40" x2="36" y2="62" stroke="#18181B" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="40" cy="40" r="2.5" fill="#18181B"/>
      </svg>
    `,
    getMechParts() {
      return [
        { id: 'antenna', label: 'でんぱアンテナ', ruby: 'フェライト棒', kind: 'ferrite-ant', x: 280, y: 112, r: 44, thumbBox: '-58 -20 116 40', req: null, phase: 'mech' },
        { id: 'quartz', label: 'でんぱチップ', ruby: '受信IC', kind: 'quartz-ic', x: 214, y: 204, r: 30, thumbBox: '-38 -28 76 56', req: 'antenna', phase: 'mech' },
        { id: 'coil', label: 'こいる', ruby: 'モーター', kind: 'motor-coil', x: 280, y: 280, r: 30, thumbBox: '-38 -24 76 48', req: 'quartz', phase: 'mech' },
        { id: 'center', label: 'にばんしゃ', ruby: '二番車', kind: 'wheel-gold', x: 280, y: 200, r: 36, thumbBox: '-44 -44 88 88', req: 'coil', speed: -0.85, phase: 'mech' },
        { id: 'third', label: 'さんばんしゃ', ruby: '三番車', kind: 'wheel-brass', x: 344, y: 186, r: 26, thumbBox: '-34 -34 68 68', req: 'center', speed: 1.4, phase: 'mech' },
        { id: 'fourth', label: 'よんばんしゃ', ruby: '四番車', kind: 'wheel-silver', x: 342, y: 244, r: 24, thumbBox: '-32 -32 64 64', req: 'third', speed: -2.0, phase: 'mech' }
      ];
    },
    getFaceParts(prevReq) {
      return [
        { id: 'dial', label: 'もじばん', kind: 'custom-dial', x: 280, y: 200, r: 136, thumbBox: '-142 -142 284 284', req: prevReq, phase: 'face' },
        { id: 'hour', label: 'たんしん', kind: 'hand-hour', x: 280, y: 200, r: 48, thumbBox: '-36 -86 72 114', req: 'dial', initAngle: -135, phase: 'face' },
        { id: 'minute', label: 'ちょうしん', kind: 'hand-minute', x: 280, y: 200, r: 54, thumbBox: '-36 -120 72 152', req: 'hour', initAngle: -175, phase: 'face' },
        { id: 'second', label: 'びょうしん', kind: 'hand-second', x: 280, y: 200, r: 54, thumbBox: '-36 -120 72 152', req: 'minute', initAngle: -155, phase: 'face' },
        { id: 'glass', label: 'がらす', kind: 'custom-glass', x: 280, y: 200, r: 137, thumbBox: '-142 -142 284 284', req: 'second', phase: 'face' }
      ];
    }
  },

  /* =========================================================================
     9. Apple Watch — Midnight Aluminum + Numerals Duo LTPO OLED + S10 SiP
        Internal layout modeled after real iFixit / TechInsights teardowns:
        Optical Heart/SpO2 Sensor, Wireless Charging Coil, S10 SiP, Taptic Engine,
        Waterproof Speaker, 327mAh Li-ion Battery, Digital Crown, Side Button.
     ========================================================================= */
  {
    id: 'apple-watch',
    name: 'アップルウォッチ',
    mechLabel: 'S10 SiP ＋ タプティック',
    handStyle: 'smartwatch',
    handScale: 1.0,
    animType: 'smartwatch',
    dialCenter: { x: 280, y: 200, r: 96 },
    thumbSvg: `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M 22 4 H 42 L 45 14 H 19 Z" fill="#334155"/>
        <path d="M 19 50 H 45 L 42 60 H 22 Z" fill="#334155"/>
        <rect x="14" y="11" width="36" height="42" rx="10" fill="#1E293B" stroke="#0F172A" stroke-width="2.5"/>
        <rect x="18" y="15" width="28" height="17" rx="5" fill="#0EA5E9"/>
        <rect x="18" y="32" width="28" height="17" rx="5" fill="#93C5FD"/>
        <text x="32" y="29" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF" font-family="sans-serif">10</text>
        <text x="32" y="46" text-anchor="middle" font-size="14" font-weight="900" fill="#0F172A" font-family="sans-serif">09</text>
        <rect x="50" y="20" width="4" height="9" rx="2" fill="#334155"/>
        <rect x="50" y="34" width="3" height="11" rx="1.5" fill="#475569"/>
      </svg>
    `,
    renderCaseBg() {
      return `
        <!-- Midnight Aluminum Unibody Case (Series 10 rounded squircle silhouette) -->
        <rect x="190" y="84" width="180" height="232" rx="48" fill="#1E293B" stroke="#0F172A" stroke-width="5"/>
        <rect x="198" y="92" width="164" height="216" rx="42" fill="#27272A" stroke="#475569" stroke-width="2.5"/>
        <!-- Upper & lower band slide-lock channels -->
        <rect x="226" y="79"  width="108" height="10" rx="4" fill="#0F172A"/>
        <rect x="226" y="311" width="108" height="10" rx="4" fill="#0F172A"/>
        <!-- Left-side dual speaker acoustic slits -->
        <rect x="185" y="156" width="6" height="26" rx="3" fill="#0F172A"/>
        <rect x="185" y="192" width="6" height="26" rx="3" fill="#0F172A"/>
        <!-- Inner CNC aluminum cavity -->
        <rect x="206" y="100" width="148" height="200" rx="36" fill="#0F172A" stroke="#334155" stroke-width="2"/>
      `;
    },
    renderMovementPlate() {
      return `
        <!-- Internal black PCB shielding + gold flex connector seats -->
        <rect x="210" y="106" width="140" height="188" rx="32" fill="#18181B" stroke="#334155" stroke-width="2"/>
        <circle cx="280" cy="200" r="48" fill="#0F172A" stroke="#334155" stroke-width="1.5" stroke-dasharray="5 4"/>
        <rect x="220" y="120" width="120" height="10" rx="3" fill="#27272A"/>
        <rect x="220" y="270" width="120" height="10" rx="3" fill="#27272A"/>
      `;
    },
    renderDialSvg() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return `
        <!-- LTPO OLED Retina Display: Iconic Numerals Duo (Cyan + Light Blue) -->
        <defs>
          <clipPath id="aw-screen-clip">
            <rect x="-74" y="-98" width="148" height="196" rx="34"/>
          </clipPath>
        </defs>
        <rect x="-78" y="-102" width="156" height="204" rx="38" fill="#09090B" stroke="#334155" stroke-width="3"/>
        <g clip-path="url(#aw-screen-clip)">
          <rect x="-74" y="-98" width="148" height="98" fill="#0EA5E9"/>
          <rect x="-74" y="0"   width="148" height="98" fill="#93C5FD"/>
          <text id="wm-aw-hour" x="0" y="-14" text-anchor="middle" font-size="88" font-weight="900" fill="#F8FAFC" font-family="sans-serif" letter-spacing="-4">${hh}</text>
          <text id="wm-aw-min"  x="0" y="76"  text-anchor="middle" font-size="88" font-weight="900" fill="#09090B" font-family="sans-serif" letter-spacing="-4">${mm}</text>
          <circle id="wm-aw-sec-dot" cx="54" cy="-76" r="5" fill="#4ADE80"/>
        </g>
      `;
    },
    renderGlassSvg() {
      return `
        <rect x="-78" y="-102" width="156" height="204" rx="38" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.45)" stroke-width="2.5"/>
        <path d="M -52 -82 C -24 -94 18 -94 46 -78" stroke="rgba(255,255,255,0.42)" stroke-width="7" stroke-linecap="round" fill="none"/>
      `;
    },
    getMechParts() {
      return [
        { id: 'sensor',  label: 'しんぱくセンサー',   ruby: '光学LED',     kind: 'aw-sensor',  x: 280, y: 200, r: 36, thumbBox: '-42 -42 84 84',   req: null,      phase: 'mech' },
        { id: 'coil',    label: 'じゅうでんコイル',   ruby: 'ワイヤレス',   kind: 'aw-coil',    x: 280, y: 200, r: 46, thumbBox: '-56 -56 112 114', req: 'sensor',  phase: 'mech' },
        { id: 'sip',     label: 'S10 チップ',         ruby: 'SiP基板',     kind: 'aw-sip',     x: 280, y: 154, r: 42, thumbBox: '-52 -42 104 84',  req: 'coil',    phase: 'mech' },
        { id: 'taptic',  label: 'タプティック',       ruby: '振動モーター', kind: 'aw-taptic',  x: 280, y: 256, r: 44, thumbBox: '-62 -26 124 52',  req: 'sip',     phase: 'mech' },
        { id: 'speaker', label: 'スピーカー',         ruby: '防水音響',     kind: 'aw-speaker', x: 226, y: 196, r: 28, thumbBox: '-24 -42 48 84',   req: 'taptic',  phase: 'mech' },
        { id: 'battery', label: 'バッテリー',         ruby: '327mAh',      kind: 'aw-battery', x: 288, y: 194, r: 44, thumbBox: '-56 -40 120 80',  req: 'speaker', phase: 'mech' },
        { id: 'crown',   label: 'デジタルクラウン',   ruby: '回転りゅうず', kind: 'aw-crown',   x: 372, y: 152, r: 24, thumbBox: '-22 -24 46 48',   req: 'battery', phase: 'mech' },
        { id: 'sidebtn', label: 'サイドボタン',       ruby: 'マイク付き',   kind: 'aw-sidebtn', x: 372, y: 232, r: 24, thumbBox: '-20 -38 36 72',   req: 'crown',   phase: 'mech' }
      ];
    },
    getFaceParts(prevReq = null) {
      return [
        { id: 'dial',    label: 'OLED がめん',     ruby: '数字デュオ',   kind: 'custom-dial',  x: 280, y: 200, r: 96, thumbBox: '-86 -108 172 216', req: prevReq,   phase: 'face' },
        { id: 'gasket',  label: 'ぼうすいシール',  ruby: 'WR50防水',     kind: 'aw-gasket',    x: 280, y: 200, r: 98, thumbBox: '-86 -108 172 216', req: 'dial',    phase: 'face' },
        { id: 'glass',   label: 'イオンX がらす',  ruby: '全面ガラス',   kind: 'custom-glass', x: 280, y: 200, r: 98, thumbBox: '-86 -108 172 216', req: 'gasket',  phase: 'face' },
        { id: 'bandTop', label: 'うえ バンド',     ruby: 'スポーツ',     kind: 'aw-band-top',  x: 280, y: 58,  r: 46, thumbBox: '-60 -50 120 84',   req: 'glass',   phase: 'face' },
        { id: 'bandBot', label: 'した バンド',     ruby: 'スポーツ',     kind: 'aw-band-bot',  x: 280, y: 342, r: 46, thumbBox: '-60 -36 120 86',   req: 'bandTop', phase: 'face' }
      ];
    }
  },

  /* =========================================================================
     10. Beaded Bracelet Watch — Child's Personal Glossy 11-Bead Watch
         Faithful 1-to-1 reproduction of IMG_3294.jpeg:
         Exact 11 glossy pastel/vivid beads on elastic loop, mirror chrome
         round case with top/bottom lug rings & 3 o'clock crown, white dial
         with bold black numerals 1-12 + QUARTZ, and silver dauphine hands.
     ========================================================================= */
  {
    id: 'bead-watch',
    name: 'ビーズ うでどけい',
    mechLabel: 'クォーツ ＋ 11ビーズ',
    handStyle: 'bead-watch',
    handScale: 0.92,
    hasSecond: true,
    animType: 'quartz-step',
    dialCenter: { x: 382, y: 200, r: 78 },
    thumbSvg: `
      <svg viewBox="0 0 64 64" fill="none">
        <!-- 11 beads in exact color order -->
        <circle cx="44" cy="15" r="5.5" fill="#DF4B9B"/>
        <circle cx="34" cy="10" r="5.5" fill="#6E9ED2"/>
        <circle cx="22" cy="11" r="5.5" fill="#DF4B9B"/>
        <circle cx="13" cy="17" r="5.5" fill="#F8A39A"/>
        <circle cx="9"  cy="27" r="5.5" fill="#F7F1D5"/>
        <circle cx="10" cy="38" r="5.5" fill="#DF4B9B"/>
        <circle cx="16" cy="48" r="5.5" fill="#ECE459"/>
        <circle cx="26" cy="54" r="5.5" fill="#DF4B9B"/>
        <circle cx="37" cy="53" r="5.5" fill="#ECE459"/>
        <circle cx="46" cy="47" r="5.5" fill="#B2E39E"/>
        <circle cx="51" cy="39" r="5.5" fill="#F6C8D2"/>
        <!-- Chrome round watch head on right -->
        <circle cx="47" cy="28" r="12" fill="#E2E8F0" stroke="#475569" stroke-width="2.5"/>
        <circle cx="47" cy="28" r="8.5" fill="#FFFFFF"/>
        <line x1="47" y1="28" x2="47" y2="22" stroke="#475569" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="47" y1="28" x2="52" y2="28" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
    `,
    renderCaseBg() {
      return `
        <!-- Top & bottom silver lug rings for the elastic bead loop -->
        <circle cx="382" cy="100" r="13" fill="#CBD5E1" stroke="#475569" stroke-width="3.5"/>
        <circle cx="382" cy="100" r="5"  fill="#1E293B"/>
        <circle cx="382" cy="300" r="13" fill="#CBD5E1" stroke="#475569" stroke-width="3.5"/>
        <circle cx="382" cy="300" r="5"  fill="#1E293B"/>
        <!-- Mirror-polished chrome round bezel case -->
        <circle cx="382" cy="200" r="98" fill="#CBD5E1" stroke="#475569" stroke-width="4.5"/>
        <circle cx="382" cy="200" r="90" fill="none" stroke="#F8FAFC" stroke-width="5" opacity="0.85"/>
        <circle cx="382" cy="200" r="82" fill="#334155" stroke="#64748B" stroke-width="2.5"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="382" cy="200" r="78" fill="#E2E8F0" stroke="#64748B" stroke-width="2.5"/>
        <circle cx="382" cy="200" r="64" fill="none" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="5 4"/>
      `;
    },
    renderDialSvg() {
      const nums = buildRadialNumbers(0, 0, 56, ['1','2','3','4','5','6','7','8','9','10','11','12'], 18, '#18181B', '900', 'Georgia, serif');
      return `
        <circle cx="0" cy="0" r="76" fill="#FAFAFA" stroke="#CBD5E1" stroke-width="2.5"/>
        ${nums}
        <text x="0" y="32" text-anchor="middle" font-size="9.5" font-weight="800" fill="#27272A" letter-spacing="1.2" font-family="sans-serif">QUARTZ</text>
        <circle cx="0" cy="0" r="5" fill="#94A3B8"/>
      `;
    },
    renderGlassSvg() {
      return `
        <circle cx="0" cy="0" r="78" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" stroke-width="2.5"/>
        <path d="M -46 -44 A 62 62 0 0 1 36 -52" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linecap="round" fill="none"/>
      `;
    },
    getMechParts() {
      return [
        { id: 'battery', label: 'ぼたんでんち', ruby: 'SR626',    kind: 'battery',      x: 356, y: 224, r: 22, thumbBox: '-30 -30 60 60', req: null,      phase: 'mech' },
        { id: 'quartz',  label: 'クォーツIC',   ruby: 'すいしょう', kind: 'quartz-ic',  x: 354, y: 170, r: 22, thumbBox: '-36 -26 72 52', req: 'battery', phase: 'mech' },
        { id: 'coil',    label: 'こいる',       ruby: 'モーター',   kind: 'motor-coil', x: 412, y: 228, r: 22, thumbBox: '-36 -24 72 48', req: 'quartz',  phase: 'mech' },
        { id: 'center',  label: 'にばんしゃ',   ruby: '二番車',     kind: 'wheel-gold', x: 382, y: 200, r: 26, thumbBox: '-36 -36 72 72', req: 'coil',    speed: -0.9, phase: 'mech' },
        { id: 'third',   label: 'さんばんしゃ', ruby: '三番車',     kind: 'wheel-silver', x: 418, y: 176, r: 19, thumbBox: '-28 -28 56 56', req: 'center', speed: 1.6, phase: 'mech' },
        { id: 'crown',   label: 'りゅうず',     ruby: 'じこくあわせ', kind: 'bead-crown', x: 482, y: 200, r: 18, thumbBox: '-12 -18 32 36', req: 'third',  phase: 'mech' }
      ];
    },
    getFaceParts(prevReq = null) {
      return [
        { id: 'dial',   label: 'もじばん',      kind: 'custom-dial',  x: 382, y: 200, r: 76, thumbBox: '-82 -82 164 164', req: prevReq, phase: 'face' },
        { id: 'hour',   label: 'たんしん',      kind: 'hand-hour',    x: 382, y: 200, r: 34, thumbBox: '-24 -64 48 80',   req: 'dial',  initAngle: 75,  phase: 'face' },
        { id: 'minute', label: 'ちょうしん',    kind: 'hand-minute',  x: 382, y: 200, r: 42, thumbBox: '-24 -84 48 100',  req: 'hour',  initAngle: 82,  phase: 'face' },
        { id: 'second', label: 'びょうしん',    kind: 'hand-second',  x: 382, y: 200, r: 44, thumbBox: '-24 -86 48 108',  req: 'minute', initAngle: 126, phase: 'face' },
        { id: 'glass',  label: 'ドームがらす',  kind: 'custom-glass', x: 382, y: 200, r: 78, thumbBox: '-84 -84 168 168', req: 'second', phase: 'face' },
        { id: 'beads',  label: '11ビーズバンド', ruby: 'カラフル',    kind: 'bead-band', x: 244, y: 200, r: 138, thumbBox: '-174 -174 328 352', req: 'glass', phase: 'face' }
      ];
    }
  },

  /* =========================================================================
     11. Aqua Drop & Gold Leaf Charm Strap Watch — Child's Favorite Watch
         Faithful 1-to-1 reproduction of IMG_3300.jpeg:
         Sky-blue strap loop + gold clasp + olive-green glass leaf at top,
         mirror-chrome round mini watch head with white 1-12 QUARTZ dial &
         silver dauphine hands, hanging cluster of translucent aqua-blue
         teardrop glass beads on gold wire + curved gold laurel leaf charm!
     ========================================================================= */
  {
    id: 'charm-watch',
    name: 'しずく チャーム とけい',
    mechLabel: 'クォーツ ＋ チャーム',
    handStyle: 'bead-watch',
    handScale: 0.78,
    hasSecond: true,
    animType: 'quartz-step',
    dialCenter: { x: 280, y: 192, r: 64 },
    thumbSvg: `
      <svg viewBox="0 0 64 64" fill="none">
        <!-- Sky-blue strap loop & gold clasp -->
        <path d="M32 16 C26 8 27 2 32 2 C37 2 38 8 32 16" stroke="#5B9BD5" stroke-width="2" fill="none"/>
        <rect x="30" y="13" width="4" height="5" rx="1.2" fill="#D8A93A"/>
        <!-- Olive green glass leaf on top-left -->
        <ellipse cx="26" cy="21" rx="4.5" ry="2.2" transform="rotate(-15 26 21)" fill="#7AA324"/>
        <!-- Chrome round mini watch head -->
        <circle cx="32" cy="30" r="11" fill="#E2E8F0" stroke="#64748B" stroke-width="2.2"/>
        <circle cx="32" cy="30" r="8" fill="#FFFFFF"/>
        <line x1="32" y1="30" x2="32" y2="25" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="32" y1="30" x2="36.5" y2="30" stroke="#64748B" stroke-width="1.3" stroke-linecap="round"/>
        <!-- Translucent aqua-blue teardrop bead cluster (bottom-left) -->
        <circle cx="28" cy="45" r="3.4" fill="#38A8D8"/>
        <circle cx="23" cy="49" r="3.4" fill="#55C4EB"/>
        <circle cx="30" cy="51" r="3.4" fill="#2FA4D6"/>
        <circle cx="21" cy="55" r="3.4" fill="#38A8D8"/>
        <circle cx="27" cy="57" r="3.4" fill="#55C4EB"/>
        <!-- Curved gold leaf charm (bottom-right) -->
        <path d="M35 42 Q44 48 41 59" stroke="#D8A93A" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      </svg>
    `,
    renderCaseBg() {
      return `
        <!-- Top & bottom silver jump-ring lugs -->
        <circle cx="280" cy="108" r="10" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
        <circle cx="280" cy="108" r="4"  fill="#1E293B"/>
        <circle cx="280" cy="276" r="10" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
        <circle cx="280" cy="276" r="4"  fill="#1E293B"/>
        <!-- Mirror-polished chrome round bezel case -->
        <circle cx="280" cy="192" r="82" fill="#CBD5E1" stroke="#64748B" stroke-width="4"/>
        <circle cx="280" cy="192" r="75" fill="none" stroke="#F8FAFC" stroke-width="4.5" opacity="0.9"/>
        <circle cx="280" cy="192" r="68" fill="#334155" stroke="#64748B" stroke-width="2.2"/>
      `;
    },
    renderMovementPlate() {
      return `
        <circle cx="280" cy="192" r="64" fill="#E2E8F0" stroke="#64748B" stroke-width="2.2"/>
        <circle cx="280" cy="192" r="52" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5 4"/>
      `;
    },
    renderDialSvg() {
      const nums = buildRadialNumbers(0, 0, 47, ['1','2','3','4','5','6','7','8','9','10','11','12'], 15, '#18181B', '900', 'Georgia, serif');
      return `
        <circle cx="0" cy="0" r="63" fill="#FAFAFA" stroke="#CBD5E1" stroke-width="2"/>
        ${nums}
        <text x="0" y="27" text-anchor="middle" font-size="8.5" font-weight="800" fill="#27272A" letter-spacing="1.1" font-family="sans-serif">QUARTZ</text>
        <circle cx="0" cy="0" r="4.5" fill="#94A3B8"/>
      `;
    },
    renderGlassSvg() {
      return `
        <circle cx="0" cy="0" r="65" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.58)" stroke-width="2.2"/>
        <path d="M -38 -36 A 52 52 0 0 1 30 -44" stroke="rgba(255,255,255,0.52)" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      `;
    },
    getMechParts() {
      return [
        { id: 'battery', label: 'ぼたんでんち', ruby: 'SR626',      kind: 'battery',      x: 258, y: 212, r: 20, thumbBox: '-30 -30 60 60', req: null,      phase: 'mech' },
        { id: 'quartz',  label: 'クォーツIC',   ruby: 'すいしょう', kind: 'quartz-ic',    x: 256, y: 168, r: 20, thumbBox: '-36 -26 72 52', req: 'battery', phase: 'mech' },
        { id: 'coil',    label: 'こいる',       ruby: 'モーター',   kind: 'motor-coil',   x: 304, y: 214, r: 20, thumbBox: '-36 -24 72 48', req: 'quartz',  phase: 'mech' },
        { id: 'center',  label: 'にばんしゃ',   ruby: '二番車',     kind: 'wheel-gold',   x: 280, y: 192, r: 23, thumbBox: '-36 -36 72 72', req: 'coil',    speed: -0.9, phase: 'mech' },
        { id: 'third',   label: 'さんばんしゃ', ruby: '三番車',     kind: 'wheel-silver', x: 310, y: 172, r: 17, thumbBox: '-28 -28 56 56', req: 'center',  speed: 1.6, phase: 'mech' },
        { id: 'crown',   label: 'りゅうず',     ruby: 'じこくあわせ', kind: 'bead-crown', x: 363, y: 200, r: 16, thumbBox: '-12 -18 32 36', req: 'third',   phase: 'mech' }
      ];
    },
    getFaceParts(prevReq = null) {
      return [
        { id: 'dial',      label: 'もじばん',       kind: 'custom-dial',      x: 280, y: 192, r: 64, thumbBox: '-70 -70 140 140',  req: prevReq,    phase: 'face' },
        { id: 'hour',      label: 'たんしん',       kind: 'hand-hour',        x: 280, y: 192, r: 30, thumbBox: '-22 -56 44 70',    req: 'dial',     initAngle: 285, phase: 'face' },
        { id: 'minute',    label: 'ちょうしん',     kind: 'hand-minute',      x: 280, y: 192, r: 38, thumbBox: '-22 -74 44 88',    req: 'hour',     initAngle: 122, phase: 'face' },
        { id: 'second',    label: 'びょうしん',     kind: 'hand-second',      x: 280, y: 192, r: 40, thumbBox: '-22 -76 44 96',    req: 'minute',   initAngle: 78,  phase: 'face' },
        { id: 'glass',     label: 'ドームがらす',   kind: 'custom-glass',     x: 280, y: 192, r: 66, thumbBox: '-72 -72 144 144',  req: 'second',   phase: 'face' },
        { id: 'strapTop',  label: 'みずいろストラップ', ruby: 'はっぱ付き',   kind: 'charm-strap-top',  x: 280, y: 74,  r: 48, thumbBox: '-48 -92 92 142',  req: 'glass',    phase: 'face' },
        { id: 'blueBeads', label: 'しずくビーズ',   ruby: 'アクアブルー',     kind: 'charm-blue-beads', x: 248, y: 332, r: 54, thumbBox: '-46 -62 94 114',  req: 'strapTop', phase: 'face' },
        { id: 'goldLeaf',  label: 'ゴールドリーフ', ruby: 'はっぱチャーム',   kind: 'charm-gold-leaf',  x: 310, y: 326, r: 46, thumbBox: '-34 -54 74 116',  req: 'blueBeads', phase: 'face' }
      ];
    }
  }
];

/** Build the ordered part list for any (clock, level) combination */
export function getClockStageParts(clock, levelId) {
  const dc = clock.dialCenter;

  // Apple Watch uses authentic electronic precision assembly (no mechanical ruby jewels / oiling!)
  if (clock.id === 'apple-watch') {
    const buildAwMech = () => {
      const base = clock.getMechParts();
      const lastId = base[base.length - 1].id;
      const screws = {
        id: 'screws',
        label: 'せいみつネジ',
        ruby: 'Yじネジ固定',
        kind: 'screw-set',
        x: dc.x,
        y: dc.y,
        r: 52,
        thumbBox: '-60 -42 120 96',
        req: lastId,
        phase: 'mech'
      };
      return [...base, screws];
    };

    if (levelId === 'exterior') {
      const crown = { id: 'crown', label: 'デジタルクラウン', ruby: '回転りゅうず', kind: 'aw-crown', x: 372, y: 152, r: 24, thumbBox: '-22 -24 46 48', req: null, phase: 'face' };
      const sidebtn = { id: 'sidebtn', label: 'サイドボタン', ruby: 'マイク付き', kind: 'aw-sidebtn', x: 372, y: 232, r: 24, thumbBox: '-20 -38 36 72', req: 'crown', phase: 'face' };
      return [crown, sidebtn, ...clock.getFaceParts('sidebtn')];
    }
    if (levelId === 'geartrain') {
      return buildAwMech();
    }
    if (levelId === 'repair') {
      return clock.getMechParts();
    }
    const mech = buildAwMech();
    return [...mech, ...clock.getFaceParts(mech[mech.length - 1].id)];
  }

  const buildExtendedFace = (prevReq) => {
    const face = clock.getFaceParts(prevReq);
    // Insert waterproof O-ring gasket right before the glass (or at end if no glass)
    const glassIdx = face.findIndex((p) => p.kind === 'custom-glass');
    if (glassIdx > 0) {
      const prevId = face[glassIdx - 1].id;
      const gasket = {
        id: 'gasket',
        label: 'ぼうすいパッキン',
        ruby: 'ゴム輪',
        kind: 'gasket',
        x: dc.x,
        y: dc.y,
        r: Math.min(dc.r - 2, 130),
        thumbBox: `${-(dc.r + 6)} ${-(dc.r + 6)} ${(dc.r + 6) * 2} ${(dc.r + 6) * 2}`,
        req: prevId,
        phase: 'face'
      };
      const glassPatched = { ...face[glassIdx], req: 'gasket' };
      return [...face.slice(0, glassIdx), gasket, glassPatched, ...face.slice(glassIdx + 1)];
    }
    return face;
  };

  const buildExtendedMech = () => {
    const base = clock.getMechParts();
    // Prepend ruby jewel bearing press-fit step at dial center
    const jewels = {
      id: 'jewels',
      label: 'ルビーじくうけ',
      ruby: '人工ルビー',
      kind: 'ruby-jewels',
      x: dc.x,
      y: dc.y,
      r: 34,
      thumbBox: '-42 -32 84 68',
      req: null,
      phase: 'mech'
    };
    const shifted = base.map((p, idx) => (idx === 0 ? { ...p, req: 'jewels' } : p));
    const lastId = shifted[shifted.length - 1].id;

    // Append rotor/lubrication + precision blued screws fastening step!
    const oil = {
      id: 'oiler',
      label: 'ちゅうゆ(あぶら)',
      ruby: 'オイラー',
      kind: 'oil-drop',
      x: dc.x,
      y: dc.y,
      r: 32,
      thumbBox: '-34 -34 68 70',
      req: lastId,
      phase: 'mech'
    };
    const screws = {
      id: 'screws',
      label: 'せいみつネジ',
      ruby: '3ほん 固定',
      kind: 'screw-set',
      x: dc.x,
      y: dc.y,
      r: 52,
      thumbBox: '-60 -42 120 96',
      req: 'oiler',
      phase: 'mech'
    };
    return [jewels, ...shifted, oil, screws];
  };

  if (levelId === 'exterior') {
    const face = buildExtendedFace(null);
    if (clock.id === 'steampunk-pipe') {
      const valve = { id: 'valve', label: 'あかいバルブ', kind: 'valve', x: 242, y: 316, r: 28, thumbBox: '-36 -36 72 72', req: face[face.length - 1].id, phase: 'face' };
      return [...face, valve];
    }
    if (clock.id === 'pendulum-clock') {
      const pend = { id: 'pendulum', label: 'ふりこ', kind: 'pendulum', x: 280, y: 226, r: 42, thumbBox: '-42 -6 84 132', req: null, phase: 'face' };
      const shifted = face.map((p, idx) => (idx === 0 ? { ...p, req: 'pendulum' } : p));
      return [pend, ...shifted];
    }
    return face;
  }

  if (levelId === 'geartrain') {
    return buildExtendedMech();
  }

  if (levelId === 'repair') {
    // Multi-fault overhaul mode uses the full internal mechanism!
    return clock.getMechParts();
  }

  // 'movement' (3. ほんもの): Full extended internal mechanism (8-9 parts) + extended dial/hands/gasket/glass (6-8 parts) = 14-17 steps!
  const mech = buildExtendedMech();
  const lastMechId = mech[mech.length - 1].id;
  const face = buildExtendedFace(lastMechId);
  return [...mech, ...face];
}
