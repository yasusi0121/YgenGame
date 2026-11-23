export function renderGndSvg(x, topY) {
  return `
    <g class="gnd-symbol">
      <line class="gnd-line" x1="${x}" y1="${topY}" x2="${x}" y2="${topY + 42}"/>
      <line class="gnd-line" x1="${x - 24}" y1="${topY + 42}" x2="${x + 24}" y2="${topY + 42}"/>
      <line class="gnd-line" x1="${x - 15}" y1="${topY + 55}" x2="${x + 15}" y2="${topY + 55}"/>
      <line class="gnd-line" x1="${x - 7}"  y1="${topY + 68}" x2="${x + 7}"  y2="${topY + 68}"/>
    </g>
  `;
}

export function renderPcbPatternSvg() {
  return `
    <svg class="lb-pcb-bg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.09)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 40 120 H 180 L 230 170 H 360"/>
        <path d="M 80 260 H 160 L 200 220 H 290"/>
        <path d="M 60 660 H 240 L 290 610 H 420"/>
        <path d="M 840 90 H 980 L 1030 140 H 1160"/>
        <path d="M 920 240 H 1040 L 1090 190 H 1180"/>
        <path d="M 780 680 H 960 L 1020 620 H 1160"/>
        <path d="M 450 70 V 140 L 500 190"/>
        <path d="M 680 740 V 660 L 730 610"/>
        <circle cx="180" cy="120" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="360" cy="170" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="290" cy="220" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="420" cy="610" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="840" cy="90"  r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="1090" cy="190" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="780" cy="680" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="500" cy="190" r="8" fill="rgba(255,255,255,0.09)"/>
        <circle cx="730" cy="610" r="8" fill="rgba(255,255,255,0.09)"/>
      </g>
    </svg>
  `;
}

export function renderSparklesSvg(color) {
  return `
    <svg class="led-sparkles" viewBox="0 0 140 140" aria-hidden="true">
      <g stroke="${color}" stroke-width="7" stroke-linecap="round">
        <line x1="70" y1="6"  x2="70" y2="20"/>
        <line x1="70" y1="120" x2="70" y2="134"/>
        <line x1="6"  y1="70" x2="20" y2="70"/>
        <line x1="120" y1="70" x2="134" y2="70"/>
        <line x1="22" y1="22" x2="32" y2="32"/>
        <line x1="108" y1="108" x2="118" y2="118"/>
        <line x1="118" y1="22" x2="108" y2="32"/>
        <line x1="32" y1="108" x2="22" y2="118"/>
      </g>
    </svg>
  `;
}
