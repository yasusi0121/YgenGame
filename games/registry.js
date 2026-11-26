const loadMod = (file, v = '') =>
  import(`${file}${v ? `?v=${encodeURIComponent(v)}` : ''}`).then((m) => m.default);

export const GAME_REGISTRY = [
  {
    id: 'logic-book',
    title: 'でんき ボタン',
    sub: 'LOGIC BOOK',
    desc: 'ボタンを おして でんきを つけよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#FF7043',
    shadow: '#D84315',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Push button on left -->
        <rect x="8" y="54" width="34" height="16" rx="8" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
        <rect x="13" y="42" width="24" height="16" rx="7" fill="#FF4757" stroke="#FFFFFF" stroke-width="3"/>
        <!-- Connecting wire -->
        <path d="M40 60 H52 Q62 60 62 50" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
        <!-- Glowing lightbulb on right -->
        <line x1="62" y1="10" x2="62" y2="16" stroke="#FFD12E" stroke-width="4" stroke-linecap="round"/>
        <line x1="42" y1="20" x2="47" y2="24" stroke="#FFD12E" stroke-width="4" stroke-linecap="round"/>
        <line x1="82" y1="20" x2="77" y2="24" stroke="#FFD12E" stroke-width="4" stroke-linecap="round"/>
        <circle cx="62" cy="36" r="16" fill="#FFD12E" stroke="#B45309" stroke-width="3"/>
        <circle cx="56" cy="31" r="4" fill="#FFFFFF" opacity="0.8"/>
        <rect x="54" y="50" width="16" height="10" rx="4" fill="#94A3B8" stroke="#475569" stroke-width="2.5"/>
        <rect x="56" y="60" width="12" height="5" rx="2.5" fill="#64748B"/>
      </svg>
    `,
    load: (v) => loadMod('./logic-book.js', v)
  },
  {
    id: 'big-babies',
    title: 'スイッチ かいろ',
    sub: 'LOGIC BOOK 2',
    desc: 'スイッチを パチッと きりかえよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#26A66D',
    shadow: '#18784D',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Two chunky toggle switches -->
        <rect x="10" y="18" width="28" height="24" rx="8" fill="#FF6B6B" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="24" y="22" width="10" height="16" rx="4" fill="#FFFFFF"/>
        <rect x="10" y="52" width="28" height="24" rx="8" fill="#FFD12E" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="14" y="56" width="10" height="16" rx="4" fill="#FFFFFF"/>
        <!-- Wires to LED box -->
        <path d="M38 30 H52 M38 64 H52" stroke="#18784D" stroke-width="5" stroke-linecap="round"/>
        <!-- Glowing LED lamp -->
        <rect x="50" y="22" width="36" height="52" rx="14" fill="#1E293B" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="68" cy="48" r="12" fill="#4ADE80" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="64" cy="44" r="3.5" fill="#FFFFFF" opacity="0.85"/>
      </svg>
    `,
    load: (v) => loadMod('./logic-book-2.js', v)
  },
  {
    id: 'color-mix',
    title: 'いろまぜ',
    sub: 'COLOR MIX',
    desc: 'えのぐを まぜて いろを つくろう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#8E7CF6',
    shadow: '#6351CC',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Artist wooden palette -->
        <path d="M48 16 C25 16 12 31 12 50 C12 68 26 80 46 80 C55 80 60 74 58 68 C56 62 62 58 69 58 C78 58 84 52 84 44 C84 26 68 16 48 16 Z"
          fill="#FDE68A" stroke="#B45309" stroke-width="3.5"/>
        <!-- Thumb hole -->
        <circle cx="30" cy="62" r="7" fill="#8E7CF6" stroke="#B45309" stroke-width="2.5"/>
        <!-- Paint blobs -->
        <circle cx="32" cy="38" r="9" fill="#FF595E" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="52" cy="29" r="9" fill="#FFD12E" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="70" cy="40" r="9" fill="#38BDF8" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="50" cy="48" r="7" fill="#4ADE80" stroke="#FFFFFF" stroke-width="2.2"/>
        <!-- Brush -->
        <path d="M62 78 L80 56" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
        <path d="M79 57 L86 48 C88 53 85 59 79 57 Z" fill="#FF595E" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `,
    load: (v) => loadMod('./color-mix.js', v)
  },
  {
    id: 'sound-magic',
    title: 'ピアノ',
    sub: 'SOUND MAGIC',
    desc: 'けんばんを おして たのしく えんそう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#3A86FF',
    shadow: '#1D5FD1',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Colorful floating music note -->
        <path d="M40 34 V14 L60 10 V28" stroke="#FFD12E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="35" cy="35" r="6" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
        <circle cx="55" cy="29" r="6" fill="#FF6B8B" stroke="#9F1239" stroke-width="2"/>
        <!-- Piano keyboard -->
        <rect x="12" y="42" width="72" height="42" rx="10" fill="#FFFFFF" stroke="#1E293B" stroke-width="3.5"/>
        <line x1="30" y1="42" x2="30" y2="84" stroke="#CBD5E1" stroke-width="2.5"/>
        <line x1="48" y1="42" x2="48" y2="84" stroke="#CBD5E1" stroke-width="2.5"/>
        <line x1="66" y1="42" x2="66" y2="84" stroke="#CBD5E1" stroke-width="2.5"/>
        <rect x="24" y="42" width="11" height="24" rx="4" fill="#1E293B"/>
        <rect x="42" y="42" width="11" height="24" rx="4" fill="#1E293B"/>
        <rect x="60" y="42" width="11" height="24" rx="4" fill="#1E293B"/>
      </svg>
    `,
    load: (v) => loadMod('./sound-magic.js', v)
  },
  {
    id: 'pitch-quiz',
    title: 'おとあて',
    sub: 'PITCH QUIZ',
    desc: 'おとを きいて けんばんを あてよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#E85D75',
    shadow: '#B8334C',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Sound wave + question badge -->
        <circle cx="34" cy="30" r="17" fill="#FFD12E" stroke="#B45309" stroke-width="3"/>
        <text x="34" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#78350F" font-family="sans-serif">?</text>
        <path d="M58 22 Q68 30 58 38" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M68 15 Q82 30 68 45" stroke="#FFD12E" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Mini piano keys below -->
        <rect x="14" y="52" width="68" height="32" rx="9" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
        <line x1="36" y1="52" x2="36" y2="84" stroke="#CBD5E1" stroke-width="2.5"/>
        <line x1="58" y1="52" x2="58" y2="84" stroke="#CBD5E1" stroke-width="2.5"/>
        <rect x="30" y="52" width="11" height="18" rx="3.5" fill="#1E293B"/>
        <rect x="52" y="52" width="11" height="18" rx="3.5" fill="#1E293B"/>
        <circle cx="47" cy="75" r="5" fill="#FF595E"/>
      </svg>
    `,
    load: (v) => loadMod('./pitch-quiz.js', v)
  },
  {
    id: 'plus-magic',
    title: 'アレクサ たしざん',
    sub: 'ALEXA PLUS',
    desc: 'アレクサを あわせて かぞえよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#F59E0B',
    shadow: '#C27403',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Mini Echo Dot on left -->
        <ellipse cx="27" cy="56" rx="14" ry="4.5" fill="#1E293B"/>
        <path d="M15 55 Q27 61 39 55" stroke="#00D2FF" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="27" cy="40" r="16" fill="#3B4D7A" stroke="#FFFFFF" stroke-width="2.5"/>
        <!-- Mini Echo Show 8 on right -->
        <rect x="52" y="24" width="34" height="28" rx="6" fill="#FFFFFF" stroke="#64748B" stroke-width="2.5"/>
        <rect x="56" y="28" width="26" height="20" rx="3" fill="#0C4A6E"/>
        <line x1="58" y1="46" x2="80" y2="46" stroke="#00D2FF" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Plus badge in center bottom -->
        <circle cx="48" cy="68" r="14" fill="#FFFFFF" stroke="#D97706" stroke-width="3"/>
        <line x1="48" y1="61" x2="48" y2="75" stroke="#D97706" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="41" y1="68" x2="55" y2="68" stroke="#D97706" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `,
    load: (v) => loadMod('./plus-magic.js', v)
  },
  {
    id: 'gear-machine',
    title: 'はぐるま',
    sub: 'GEAR MACHINE',
    desc: 'はぐるまを つないで まわそう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#0F766E',
    shadow: '#0B4F4A',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Big yellow gear with real teeth -->
        <g transform="translate(34 56)">
          <rect x="-5" y="-26" width="10" height="52" rx="3" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
          <rect x="-5" y="-26" width="10" height="52" rx="3" transform="rotate(45)" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
          <rect x="-5" y="-26" width="10" height="52" rx="3" transform="rotate(90)" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
          <rect x="-5" y="-26" width="10" height="52" rx="3" transform="rotate(135)" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
          <circle cx="0" cy="0" r="18" fill="#FFD12E" stroke="#B45309" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#B45309" stroke-width="2.5"/>
        </g>
        <!-- Meshing green gear with real teeth -->
        <g transform="translate(65 33)">
          <rect x="-4" y="-20" width="8" height="40" rx="2.5" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
          <rect x="-4" y="-20" width="8" height="40" rx="2.5" transform="rotate(60)" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
          <rect x="-4" y="-20" width="8" height="40" rx="2.5" transform="rotate(120)" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
          <circle cx="0" cy="0" r="14" fill="#4ADE80" stroke="#15803D" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" stroke="#15803D" stroke-width="2.2"/>
        </g>
      </svg>
    `,
    load: (v) => loadMod('./gear-machine.js', v)
  },
  {
    id: 'typing-pc',
    title: 'パソコン',
    sub: 'TYPING PC',
    desc: 'キーボードで もじを うってみよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#3B82F6',
    shadow: '#1D4ED8',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Kids monitor showing あ -->
        <rect x="14" y="12" width="68" height="46" rx="11" fill="#1E293B" stroke="#FFFFFF" stroke-width="3.5"/>
        <rect x="20" y="18" width="56" height="34" rx="6" fill="#F8FAFC"/>
        <text x="48" y="44" text-anchor="middle" font-size="25" font-weight="900" fill="#2563EB" font-family="sans-serif">あ</text>
        <!-- Colorful keyboard deck -->
        <rect x="8" y="64" width="80" height="20" rx="7" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
        <rect x="15" y="70" width="11" height="8" rx="2.5" fill="#FF6B8B"/>
        <rect x="30" y="70" width="11" height="8" rx="2.5" fill="#FFD12E"/>
        <rect x="45" y="70" width="11" height="8" rx="2.5" fill="#4ADE80"/>
        <rect x="60" y="70" width="21" height="8" rx="2.5" fill="#38BDF8"/>
      </svg>
    `,
    load: (v) => loadMod('./typing-pc.js', v)
  },
  {
    id: 'watch-maker',
    title: 'とけい つくり',
    sub: 'WATCH MAKER',
    desc: '9つの ほんもの とけいを くみたてよう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#2B4C7E',
    shadow: '#193156',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Classic wooden pendulum clock silhouette -->
        <rect x="24" y="16" width="48" height="68" rx="9" fill="#6D3224" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="48" cy="12" r="6" fill="#FFD12E" stroke="#92400E" stroke-width="2"/>
        <!-- Clock face -->
        <circle cx="48" cy="39" r="18" fill="#FFFDF7" stroke="#F59E0B" stroke-width="3.5"/>
        <line x1="48" y1="39" x2="48" y2="27" stroke="#1E293B" stroke-width="3.2" stroke-linecap="round"/>
        <line x1="48" y1="39" x2="57" y2="39" stroke="#EF4444" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="48" cy="39" r="3" fill="#E11D48"/>
        <!-- Pendulum window -->
        <rect x="34" y="60" width="28" height="20" rx="5" fill="#2C130E"/>
        <line x1="48" y1="60" x2="53" y2="71" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="54" cy="72" r="5.5" fill="#FFD12E" stroke="#B45309" stroke-width="1.8"/>
      </svg>
    `,
    load: (v) => loadMod('./watch-maker.js', v)
  },
  {
    id: 'animal-phone',
    title: 'もしもし でんわ',
    sub: 'ANIMAL PHONE',
    desc: 'ばんごうを おして どうぶつと おはなし！',
    badge: '',
    cta: 'あそぶ',
    bg: '#0EA5E9',
    shadow: '#0369A1',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Chunky kids smartphone -->
        <rect x="22" y="10" width="52" height="76" rx="14" fill="#1E293B" stroke="#FFFFFF" stroke-width="3.5"/>
        <rect x="28" y="18" width="40" height="44" rx="8" fill="#FFF3E0"/>
        <!-- Cute fox face on screen -->
        <path d="M34 36 L33 22 L45 29 Z" fill="#F97316"/>
        <path d="M62 36 L63 22 L51 29 Z" fill="#F97316"/>
        <ellipse cx="48" cy="40" rx="15" ry="13" fill="#F97316"/>
        <path d="M33 41 C35 50 41 53 48 53 C55 53 61 50 63 41 C57 45 52 44 48 45 C44 44 39 45 33 41 Z" fill="#FFEDD5"/>
        <circle cx="42" cy="39" r="2.6" fill="#292524"/>
        <circle cx="54" cy="39" r="2.6" fill="#292524"/>
        <circle cx="48" cy="44" r="2.2" fill="#292524"/>
        <!-- Big green call button -->
        <circle cx="48" cy="74" r="8" fill="#22C55E" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M44.5 72.5 C46.5 75.5 49.5 76.5 51.5 75.5" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,
    load: (v) => loadMod('./animal-phone.js', v)
  },
  {
    id: 'alexa-builder',
    title: 'アレクサ つくり',
    sub: 'ALEXA BUILDER',
    desc: 'くみたて・はいせん・しゅうり に ちょうせん！',
    badge: '',
    cta: 'あそぶ',
    bg: '#0284C7',
    shadow: '#0369A1',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Echo Show 8 in back-left -->
        <path d="M54 22 L66 30 Q68 50 60 58 L52 58 Z" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
        <rect x="8" y="16" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#64748B" stroke-width="2.5"/>
        <rect x="13" y="21" width="40" height="30" rx="4" fill="#0B556B"/>
        <text x="20" y="34" font-size="10" font-weight="900" fill="#E0F2FE" font-family="sans-serif">2:06</text>
        <line x1="15" y1="49" x2="51" y2="49" stroke="#00D2FF" stroke-width="3" stroke-linecap="round"/>
        <!-- Echo Dot in front-right -->
        <ellipse cx="66" cy="78" rx="18" ry="5.5" fill="#1E293B"/>
        <path d="M50 76 Q66 84 82 76" stroke="#00D2FF" stroke-width="4" stroke-linecap="round" fill="none"/>
        <circle cx="66" cy="59" r="20" fill="#E2E8F0" stroke="#FFFFFF" stroke-width="2.5"/>
        <path d="M48 59 A18 18 0 0 1 84 59 Q66 64 48 59 Z" fill="#F8FAFC"/>
      </svg>
    `,
    load: (v) => loadMod('./alexa-builder.js', v)
  },
  {
    id: 'wire-craft',
    title: 'はいせん クラフト',
    sub: 'WIRE CRAFT',
    desc: 'きばんに ケーブルを つないで うごかそう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#15803D',
    shadow: '#14532D',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Authentic green PCB with corner mounting holes -->
        <rect x="8" y="12" width="80" height="72" rx="10" fill="#0E4F2F" stroke="#4ADE80" stroke-width="3"/>
        <circle cx="15" cy="19" r="3" fill="#FBBF24"/>
        <circle cx="81" cy="19" r="3" fill="#FBBF24"/>
        <circle cx="15" cy="77" r="3" fill="#FBBF24"/>
        <circle cx="81" cy="77" r="3" fill="#FBBF24"/>
        <!-- 90deg / 45deg straight copper traces -->
        <path d="M18 32 H28 L34 38 H38" stroke="#FF3B4E" stroke-width="4.5" stroke-linejoin="miter" fill="none"/>
        <path d="M18 64 H28 L34 58 H38" stroke="#FFD12E" stroke-width="4.5" stroke-linejoin="miter" fill="none"/>
        <path d="M58 38 H64 L70 32 H78" stroke="#00D2FF" stroke-width="4.5" stroke-linejoin="miter" fill="none"/>
        <path d="M58 58 H64 L70 64 H78" stroke="#4ADE80" stroke-width="4.5" stroke-linejoin="miter" fill="none"/>
        <!-- Central QFP CPU chip -->
        <rect x="36" y="34" width="24" height="28" rx="4" fill="#1E293B" stroke="#CBD5E1" stroke-width="2.2"/>
        <text x="48" y="52" text-anchor="middle" font-size="10" font-weight="900" fill="#38BDF8" font-family="monospace">CPU</text>
        <!-- Gold solder pads -->
        <circle cx="18" cy="32" r="5" fill="#FF3B4E" stroke="#FBBF24" stroke-width="2"/>
        <circle cx="18" cy="64" r="5" fill="#FFD12E" stroke="#FBBF24" stroke-width="2"/>
        <circle cx="78" cy="32" r="5" fill="#00D2FF" stroke="#FBBF24" stroke-width="2"/>
        <circle cx="78" cy="64" r="5" fill="#4ADE80" stroke="#FBBF24" stroke-width="2"/>
      </svg>
    `,
    load: (v) => loadMod('./wire-craft.js', v)
  },
  {
    id: 'power-lab',
    title: 'でんき ラボ 3D',
    sub: 'HOW ITS WIRED',
    desc: '3Dの スイッチや ぶんでんばんを パチパチ そうさ！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#D97706',
    shadow: '#92400E',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Warm isometric-style breaker box & power unit -->
        <rect x="12" y="16" width="72" height="64" rx="10" fill="#FAF3E3" stroke="#1E293B" stroke-width="3.5"/>
        <rect x="19" y="23" width="58" height="44" rx="5" fill="#475569" stroke="#1E293B" stroke-width="2.5"/>
        <!-- Main red breaker + RCD + 2 sub breakers -->
        <rect x="24" y="29" width="14" height="24" rx="2.5" fill="#F8FAFC" stroke="#1E293B" stroke-width="2"/>
        <rect x="26" y="38" width="10" height="7" rx="1.5" fill="#EF4444"/>
        <rect x="41" y="29" width="14" height="24" rx="2.5" fill="#F8FAFC" stroke="#1E293B" stroke-width="2"/>
        <rect x="43" y="33" width="5" height="5" rx="1" fill="#FACC15"/>
        <rect x="44" y="40" width="8" height="6" rx="1.5" fill="#1E293B"/>
        <rect x="58" y="29" width="14" height="24" rx="2.5" fill="#F8FAFC" stroke="#1E293B" stroke-width="2"/>
        <rect x="61" y="38" width="8" height="7" rx="1.5" fill="#1E293B"/>
        <!-- Brown live & blue neutral wires -->
        <path d="M24 58 H72" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/>
        <path d="M28 58 H54" stroke="#FACC15" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>
        <!-- Lightning badge -->
        <circle cx="76" cy="72" r="13" fill="#FACC15" stroke="#1E293B" stroke-width="3"/>
        <path d="M78 64 L71 73 H76 L74 80 L81 71 H76 Z" fill="#1E293B"/>
      </svg>
    `,
    load: (v) => loadMod('./power-lab.js', v)
  },
  {
    id: 'coming-next',
    title: 'つぎの あそび',
    sub: 'COMING SOON',
    desc: 'たのしい あそびを じゅんびちゅう！',
    badge: 'もうすぐ！',
    cta: 'じゅんびちゅう',
    bg: '#EC4899',
    shadow: '#BE185D',
    available: false,
    iconSvg: `
      <svg width="88" height="88" viewBox="0 0 80 80" fill="none">
        <path d="M40 12L47.5 29.5L66 31.5L52 44L56 62.5L40 53L24 62.5L28 44L14 31.5L32.5 29.5L40 12Z" fill="#FFD12E" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
      </svg>
    `
  }
];
