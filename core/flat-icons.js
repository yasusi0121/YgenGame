export const FLAT_ICONS = {
  svg(inner, size = 36) {
    return `<svg class="flat-ic" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">${inner}</svg>`;
  },
  apple(size = 38) {
    return this.svg(`
      <path d="M32 18 C22 14, 12 22, 13 36 C14 48, 22 56, 32 54 C42 56, 50 48, 51 36 C52 22, 42 14, 32 18 Z" fill="#FF4D5A" stroke="#FFFFFF" stroke-width="3.5"/>
      <path d="M32 18 C32 12, 35 8, 39 8" stroke="#8D5524" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="41" cy="14" rx="7" ry="4" transform="rotate(-24 41 14)" fill="#4ADE80"/>
      <ellipse cx="23" cy="29" rx="4" ry="7" transform="rotate(-18 23 29)" fill="#FFFFFF" opacity="0.45"/>
    `, size);
  },
  greenApple(size = 38) {
    return this.svg(`
      <path d="M32 18 C22 14, 12 22, 13 36 C14 48, 22 56, 32 54 C42 56, 50 48, 51 36 C52 22, 42 14, 32 18 Z" fill="#4ADE80" stroke="#FFFFFF" stroke-width="3.5"/>
      <path d="M32 18 C32 12, 35 8, 39 8" stroke="#8D5524" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="41" cy="14" rx="7" ry="4" transform="rotate(-24 41 14)" fill="#16A34A"/>
      <ellipse cx="23" cy="29" rx="4" ry="7" transform="rotate(-18 23 29)" fill="#FFFFFF" opacity="0.48"/>
    `, size);
  },
  strawberry(size = 38) {
    return this.svg(`
      <path d="M32 55 C20 50, 14 36, 17 24 C19 17, 26 16, 32 18 C38 16, 45 17, 47 24 C50 36, 44 50, 32 55 Z" fill="#FF4769" stroke="#FFFFFF" stroke-width="3.5"/>
      <path d="M22 19 L32 24 L42 19 L37 13 L32 17 L27 13 Z" fill="#2ED573"/>
      <circle cx="25" cy="30" r="2.2" fill="#FFF3B0"/>
      <circle cx="39" cy="30" r="2.2" fill="#FFF3B0"/>
      <circle cx="32" cy="37" r="2.2" fill="#FFF3B0"/>
      <circle cx="27" cy="44" r="2.2" fill="#FFF3B0"/>
      <circle cx="37" cy="44" r="2.2" fill="#FFF3B0"/>
    `, size);
  },
  orange(size = 38) {
    return this.svg(`
      <circle cx="32" cy="35" r="20" fill="#FF8C1A" stroke="#FFFFFF" stroke-width="3.5"/>
      <ellipse cx="38" cy="14" rx="8" ry="4.5" transform="rotate(-22 38 14)" fill="#2ED573"/>
      <circle cx="24" cy="28" r="4" fill="#FFFFFF" opacity="0.45"/>
    `, size);
  },
  lemon(size = 38) {
    return this.svg(`
      <ellipse cx="32" cy="34" rx="22" ry="16" transform="rotate(-18 32 34)" fill="#FFD32A" stroke="#FFFFFF" stroke-width="3.5"/>
      <ellipse cx="26" cy="27" rx="7" ry="3.5" transform="rotate(-22 26 27)" fill="#FFFFFF" opacity="0.5"/>
    `, size);
  },
  grape(size = 38) {
    return this.svg(`
      <path d="M32 12 V20" stroke="#8D5524" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="39" cy="14" rx="7" ry="4" transform="rotate(-15 39 14)" fill="#4ADE80"/>
      <circle cx="24" cy="26" r="8" fill="#9B59B6" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="40" cy="26" r="8" fill="#9B59B6" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="32" cy="26" r="8" fill="#A855F7" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="27" cy="37" r="8" fill="#9B59B6" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="37" cy="37" r="8" fill="#9B59B6" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="32" cy="47" r="8" fill="#A855F7" stroke="#FFFFFF" stroke-width="2.5"/>
    `, size);
  },
  peach(size = 38) {
    return this.svg(`
      <path d="M32 54 C18 50, 12 36, 16 24 C20 15, 29 15, 32 22 C35 15, 44 15, 48 24 C52 36, 46 50, 32 54 Z" fill="#FF85B3" stroke="#FFFFFF" stroke-width="3.5"/>
      <ellipse cx="42" cy="14" rx="8" ry="4" transform="rotate(-25 42 14)" fill="#4ADE80"/>
      <circle cx="24" cy="29" r="4" fill="#FFFFFF" opacity="0.45"/>
    `, size);
  },
  clover(size = 38) {
    return this.svg(`
      <path d="M32 34 Q32 48 26 56" stroke="#16A34A" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="10" fill="#2ED573" stroke="#FFFFFF" stroke-width="2.8"/>
      <circle cx="40" cy="24" r="10" fill="#2ED573" stroke="#FFFFFF" stroke-width="2.8"/>
      <circle cx="24" cy="38" r="10" fill="#2ED573" stroke="#FFFFFF" stroke-width="2.8"/>
      <circle cx="40" cy="38" r="10" fill="#2ED573" stroke="#FFFFFF" stroke-width="2.8"/>
    `, size);
  },
  whale(size = 38) {
    return this.svg(`
      <path d="M12 38 C12 24, 24 18, 38 20 C48 22, 52 30, 52 38 C52 44, 46 48, 34 48 L22 48 C15 48, 12 44, 12 38 Z" fill="#1E90FF" stroke="#FFFFFF" stroke-width="3.2"/>
      <path d="M14 38 C8 34, 8 28, 14 26" stroke="#1E90FF" stroke-width="6" stroke-linecap="round"/>
      <circle cx="40" cy="33" r="3" fill="#FFFFFF"/>
      <circle cx="41" cy="33" r="1.4" fill="#1E293B"/>
      <path d="M34 18 Q34 10 29 10 M34 18 Q34 10 39 10" stroke="#67E8F9" stroke-width="3.5" stroke-linecap="round"/>
    `, size);
  },
  cloud(size = 38) {
    return this.svg(`
      <path d="M18 46 H47 C53 46, 56 41, 56 36 C56 31, 52 27, 46 27 C45 19, 38 15, 31 16 C24 17, 20 22, 19 28 C13 28, 10 33, 10 38 C10 43, 13 46, 18 46 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3.5"/>
    `, size);
  },
  dolphin(size = 38) {
    return this.svg(`
      <path d="M14 42 C16 24, 30 16, 44 22 C50 25, 54 32, 54 36 C48 38, 42 36, 36 40 C28 46, 20 48, 14 42 Z" fill="#38BDF8" stroke="#FFFFFF" stroke-width="3.2"/>
      <circle cx="44" cy="29" r="2.6" fill="#0F172A"/>
    `, size);
  },
  icecream(size = 38) {
    return this.svg(`
      <polygon points="22,34 42,34 32,56" fill="#F59E0B" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="26" r="13" fill="#FEF08A" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="32" cy="13" r="4" fill="#FF4757"/>
    `, size);
  },
  choco(size = 38) {
    return this.svg(`
      <rect x="16" y="12" width="32" height="40" rx="7" fill="#8D5524" stroke="#FFFFFF" stroke-width="3.2"/>
      <line x1="32" y1="14" x2="32" y2="50" stroke="#6B3E17" stroke-width="3"/>
      <line x1="18" y1="26" x2="46" y2="26" stroke="#6B3E17" stroke-width="3"/>
      <line x1="18" y1="38" x2="46" y2="38" stroke="#6B3E17" stroke-width="3"/>
    `, size);
  },
  flower(size = 38) {
    return this.svg(`
      <circle cx="32" cy="18" r="9" fill="#FFB07C" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="45" cy="28" r="9" fill="#FFB07C" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="40" cy="43" r="9" fill="#FFB07C" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="24" cy="43" r="9" fill="#FFB07C" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="19" cy="28" r="9" fill="#FFB07C" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="9" fill="#FFD32A"/>
    `, size);
  },
  leaf(size = 38) {
    return this.svg(`
      <path d="M16 48 C16 24, 34 14, 50 14 C50 32, 40 48, 16 48 Z" fill="#6EE7B7" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M16 48 L40 24" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
    `, size);
  },
  lavender(size = 38) {
    return this.svg(`
      <line x1="32" y1="20" x2="32" y2="54" stroke="#4ADE80" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="32" cy="16" r="7" fill="#C4B5FD" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="25" cy="25" r="7" fill="#A78BFA" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="39" cy="25" r="7" fill="#A78BFA" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="26" cy="35" r="7" fill="#C4B5FD" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="38" cy="35" r="7" fill="#C4B5FD" stroke="#FFFFFF" stroke-width="2.5"/>
    `, size);
  },
  bear(size = 38) {
    return this.svg(`
      <circle cx="18" cy="20" r="9" fill="#C69C72" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="46" cy="20" r="9" fill="#C69C72" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="32" cy="35" r="19" fill="#C69C72" stroke="#FFFFFF" stroke-width="3.5"/>
      <ellipse cx="32" cy="40" rx="9" ry="7" fill="#FDE6C4"/>
      <circle cx="25" cy="32" r="2.6" fill="#2D3436"/>
      <circle cx="39" cy="32" r="2.6" fill="#2D3436"/>
      <ellipse cx="32" cy="38" rx="3.5" ry="2.5" fill="#4A2E1B"/>
    `, size);
  },
  chick(size = 38) {
    return this.svg(`
      <circle cx="32" cy="35" r="19" fill="#FFD32A" stroke="#FFFFFF" stroke-width="3.5"/>
      <circle cx="25" cy="31" r="2.8" fill="#2D3436"/>
      <circle cx="39" cy="31" r="2.8" fill="#2D3436"/>
      <polygon points="28,37 36,37 32,43" fill="#FF7043"/>
      <circle cx="19" cy="37" r="3.5" fill="#FF85B3" opacity="0.65"/>
      <circle cx="45" cy="37" r="3.5" fill="#FF85B3" opacity="0.65"/>
    `, size);
  },
  star(size = 26) {
    return this.svg(`
      <path d="M32 7 L39.5 23 L57 25.5 L44 37.5 L47.5 55 L32 46.5 L16.5 55 L20 37.5 L7 25.5 L24.5 23 Z" fill="#FFD12E" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
    `, size);
  },
  stars(count = 1, size = 15) {
    const one = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.5 L14.9 8.6 L21.6 9.5 L16.7 14.1 L17.9 20.8 L12 17.6 L6.1 20.8 L7.3 14.1 L2.4 9.5 L9.1 8.6 Z" fill="#F59E0B" stroke="#92400E" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    return `<span class="toy-stars" aria-hidden="true">${one.repeat(count)}</span>`;
  },
  starEmpty(size = 26) {
    return this.svg(`
      <path d="M32 7 L39.5 23 L57 25.5 L44 37.5 L47.5 55 L32 46.5 L16.5 55 L20 37.5 L7 25.5 L24.5 23 Z" fill="rgba(148,163,184,0.28)" stroke="#94A3B8" stroke-width="3.5" stroke-linejoin="round"/>
    `, size);
  },
  sparkle(size = 30) {
    return this.svg(`
      <path d="M32 8 Q34 30 56 32 Q34 34 32 56 Q30 34 8 32 Q30 30 32 8 Z" fill="#FFD12E" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>
    `, size);
  },
  note(size = 26, color = '#FFD12E') {
    return this.svg(`
      <path d="M26 44 V18 L48 13 V39" stroke="${color}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="20" cy="45" r="7.5" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
      <circle cx="42" cy="40" r="7.5" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
    `, size);
  },
  drop(size = 34, fill = '#FFFFFF', stroke = 'rgba(0,0,0,0.14)') {
    return this.svg(`
      <path d="M32 8 C32 8, 50 28, 50 40 C50 50, 42 56, 32 56 C22 56, 14 50, 14 40 C14 28, 32 8, 32 8 Z" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="25" cy="38" rx="3.5" ry="7" transform="rotate(-15 25 38)" fill="#FFFFFF" opacity="0.55"/>
    `, size);
  },
  wash(size = 34) {
    return this.svg(`
      <path d="M22 14 C22 14, 30 24, 30 30 C30 35, 26 38, 22 38 C18 38, 14 35, 14 30 C14 24, 22 14, 22 14 Z" fill="#38BDF8" stroke="#FFFFFF" stroke-width="3"/>
      <path d="M42 24 C42 24, 50 34, 50 40 C50 45, 46 48, 42 48 C38 48, 34 45, 34 40 C34 34, 42 24, 42 24 Z" fill="#67E8F9" stroke="#FFFFFF" stroke-width="3"/>
    `, size);
  },
  marimba(size = 22) {
    return this.svg(`
      <rect x="8"  y="12" width="10" height="40" rx="5" fill="#FF595E"/>
      <rect x="21" y="16" width="10" height="34" rx="5" fill="#FFCA3A"/>
      <rect x="34" y="20" width="10" height="28" rx="5" fill="#4ADE80"/>
      <rect x="47" y="24" width="10" height="22" rx="5" fill="#38BDF8"/>
    `, size);
  },
  piano(size = 22) {
    return this.svg(`
      <rect x="8" y="14" width="48" height="36" rx="7" fill="#FFFFFF" stroke="#334155" stroke-width="4"/>
      <line x1="24" y1="14" x2="24" y2="50" stroke="#CBD5E1" stroke-width="3"/>
      <line x1="40" y1="14" x2="40" y2="50" stroke="#CBD5E1" stroke-width="3"/>
      <rect x="19" y="14" width="10" height="21" rx="3" fill="#1E293B"/>
      <rect x="35" y="14" width="10" height="21" rx="3" fill="#1E293B"/>
    `, size);
  },
  drum(size = 22) {
    return this.svg(`
      <ellipse cx="32" cy="24" rx="22" ry="9" fill="#FEF3C7" stroke="#D97706" stroke-width="4"/>
      <path d="M10 24 V42 C10 47, 20 52, 32 52 C44 52, 54 47, 54 42 V24" fill="#FF595E" stroke="#B91C1C" stroke-width="4"/>
    `, size);
  },
  plusSign(size = 26) {
    return this.svg(`
      <line x1="32" y1="14" x2="32" y2="50" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
    `, size);
  },
  minusSign(size = 26) {
    return this.svg(`
      <line x1="14" y1="32" x2="50" y2="32" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
    `, size);
  },
  cracker(size = 56) {
    return this.svg(`
      <polygon points="10,54 24,22 42,40" fill="#FF595E" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>
      <line x1="17" y1="38" x2="29" y2="50" stroke="#FFD12E" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="21" y1="29" x2="35" y2="43" stroke="#38BDF8" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M36 22 Q44 12 52 14" stroke="#FFD12E" stroke-width="4" stroke-linecap="round"/>
      <path d="M40 28 Q50 24 56 30" stroke="#4ADE80" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="12" r="4" fill="#38BDF8"/>
      <circle cx="52" cy="20" r="4" fill="#FF85B3"/>
      <circle cx="48" cy="38" r="3.5" fill="#FFD12E"/>
    `, size);
  },
  speaker(size = 44, color = '#4D3300') {
    return this.svg(`
      <polygon points="12,24 24,24 36,14 36,50 24,40 12,40" fill="${color}" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 23 Q51 32 44 41" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M50 16 Q60 32 50 48" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>
    `, size);
  },
  arrowRight(size = 32) {
    return this.svg(`
      <line x1="12" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
      <polyline points="36,18 50,32 36,46" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    `, size);
  },
  gearMini(size = 26, color = '#FF924C') {
    return this.svg(`
      <circle cx="32" cy="32" r="16" fill="${color}" stroke="#FFFFFF" stroke-width="4"/>
      <circle cx="32" cy="32" r="6" fill="#FFFFFF"/>
      <g stroke="${color}" stroke-width="7" stroke-linecap="round">
        <line x1="32" y1="8" x2="32" y2="14"/>
        <line x1="32" y1="50" x2="32" y2="56"/>
        <line x1="8" y1="32" x2="14" y2="32"/>
        <line x1="50" y1="32" x2="56" y2="32"/>
        <line x1="15" y1="15" x2="20" y2="20"/>
        <line x1="44" y1="44" x2="49" y2="49"/>
        <line x1="49" y1="15" x2="44" y2="20"/>
        <line x1="20" y1="44" x2="15" y2="49"/>
      </g>
    `, size);
  },
  eraser(size = 24) {
    return this.svg(`
      <rect x="14" y="20" width="36" height="24" rx="7" transform="rotate(-24 32 32)" fill="#FF85B3" stroke="#FFFFFF" stroke-width="3.5"/>
      <rect x="14" y="20" width="15" height="24" rx="5" transform="rotate(-24 32 32)" fill="#FFFFFF"/>
    `, size);
  },
  refresh(size = 24) {
    return this.svg(`
      <path d="M50 32 A18 18 0 1 1 44 18" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <polyline points="36,10 46,19 34,24" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    `, size);
  }
};
