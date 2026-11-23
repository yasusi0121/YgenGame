export const GAME_REGISTRY = [
  {
    id: 'logic-book',
    title: 'LOGIC BOOK',
    ruby: 'ろじっく えほん',
    desc: 'ぼたんと らんぷの 6つの ひみつ',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#FF7043',
    shadow: '#D84315',
    available: true,
    iconSvg: `
      <svg width="78" height="78" viewBox="0 0 80 80" fill="none">
        <line x1="22" y1="40" x2="58" y2="40" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
        <circle cx="22" cy="40" r="14" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4.5"/>
        <circle cx="58" cy="40" r="11" fill="#4ADE80" stroke="#FFFFFF" stroke-width="4.5"/>
        <line x1="58" y1="53" x2="58" y2="63" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="63" x2="66" y2="63" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
        <line x1="53" y1="69" x2="63" y2="69" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `,
    load: () => import('./logic-book.js').then((m) => m.default)
  },
  {
    id: 'big-babies',
    title: 'LOGIC BOOK 2',
    ruby: 'ろじっく えほん 2',
    desc: 'すいっちと めもりーの 6つの かいろ',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#26A66D',
    shadow: '#18784D',
    available: true,
    iconSvg: `
      <svg width="78" height="78" viewBox="0 0 80 80" fill="none">
        <rect x="14" y="14" width="16" height="22" rx="5" fill="#FF4747" stroke="#FFFFFF" stroke-width="3.5"/>
        <rect x="14" y="44" width="16" height="22" rx="5" fill="#FFD12E" stroke="#FFFFFF" stroke-width="3.5"/>
        <path d="M 30 25 H 44 M 30 55 H 44" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
        <rect x="44" y="20" width="22" height="40" rx="7" fill="rgba(255,255,255,0.28)" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="55" cy="40" r="6" fill="#4ADE80"/>
      </svg>
    `,
    load: () => import('./logic-book-2.js').then((m) => m.default)
  },
  {
    id: 'color-mix',
    title: 'COLOR MIX',
    ruby: 'いろの まほう',
    desc: 'いろを まぜて あたらしい いろ！',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#8E7CF6',
    shadow: '#6351CC',
    available: true,
    iconSvg: `
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <circle cx="32" cy="34" r="16" fill="#FF6B8B" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="50" cy="38" r="16" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4" opacity="0.92"/>
        <circle cx="38" cy="50" r="15" fill="#4DD0E1" stroke="#FFFFFF" stroke-width="4" opacity="0.92"/>
      </svg>
    `,
    load: () => import('./color-mix.js').then((m) => m.default)
  },
  {
    id: 'sound-magic',
    title: 'SOUND MAGIC',
    ruby: 'おとの まほう',
    desc: 'ぴあの けんばんで たのしく えんそう！',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#3A86FF',
    shadow: '#1D5FD1',
    available: true,
    iconSvg: `
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <rect x="12" y="18" width="56" height="44" rx="10" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
        <line x1="31" y1="18" x2="31" y2="62" stroke="#CBD5E1" stroke-width="3"/>
        <line x1="49" y1="18" x2="49" y2="62" stroke="#CBD5E1" stroke-width="3"/>
        <rect x="24" y="18" width="12" height="26" rx="4" fill="#1E293B"/>
        <rect x="43" y="18" width="12" height="26" rx="4" fill="#1E293B"/>
      </svg>
    `,
    load: () => import('./sound-magic.js').then((m) => m.default)
  },
  {
    id: 'pitch-quiz',
    title: 'PITCH QUIZ',
    ruby: 'ぜったい おんかん',
    desc: 'おとを きいて けんばんを あてよう！',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#E85D75',
    shadow: '#B8334C',
    available: true,
    iconSvg: `
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <polygon points="16,32 28,32 42,20 42,60 28,48 16,48" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 30 Q58 40 50 50" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
        <path d="M58 22 Q70 40 58 58" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `,
    load: () => import('./pitch-quiz.js').then((m) => m.default)
  },
  {
    id: 'plus-magic',
    title: 'PLUS MAGIC',
    ruby: 'たしざん の まほう',
    desc: 'わかる・ステップ・ランダムの 3モード！',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#F59E0B',
    shadow: '#C27403',
    available: true,
    iconSvg: `
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <rect x="14" y="14" width="52" height="52" rx="16" fill="rgba(255,255,255,0.24)" stroke="#FFFFFF" stroke-width="4"/>
        <line x1="40" y1="25" x2="40" y2="55" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
        <line x1="25" y1="40" x2="55" y2="40" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `,
    load: () => import('./plus-magic.js').then((m) => m.default)
  },
  {
    id: 'gear-machine',
    title: 'GEAR MACHINE',
    ruby: 'はぐるま マシン',
    desc: 'はぐるま を つないで きかいを うごかそう！',
    badge: 'あそべるよ！',
    cta: 'あそぶ',
    bg: '#0F766E',
    shadow: '#0B4F4A',
    available: true,
    iconSvg: `
      <svg width="76" height="76" viewBox="0 0 80 80" fill="none">
        <circle cx="30" cy="44" r="16" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="30" cy="44" r="6" fill="#FFFFFF"/>
        <circle cx="54" cy="30" r="12" fill="#4ADE80" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="54" cy="30" r="4.5" fill="#FFFFFF"/>
      </svg>
    `,
    load: () => import('./gear-machine.js').then((m) => m.default)
  },
  {
    id: 'coming-next',
    title: 'NEXT GAME',
    ruby: 'つぎの あそび',
    desc: 'たのしい あそびを じゅんびちゅう！',
    badge: 'もうすぐ！',
    cta: 'じゅんびちゅう',
    bg: '#EC4899',
    shadow: '#BE185D',
    available: false,
    iconSvg: `
      <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
        <path d="M40 16L46.5 31.5L63 33L50.5 44L54.2 60.5L40 52L25.8 60.5L29.5 44L17 33L33.5 31.5L40 16Z" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `
  }
];
