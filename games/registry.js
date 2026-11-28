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
    desc: '11この ほんもの とけいを くみたてよう！',
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
    badge: '',
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
    id: 'tape-craft',
    title: 'ぺたぺた テープ',
    sub: 'TAPE CRAFT',
    desc: 'ベリベリ のばして ペタッと はって ビリッと きろう！',
    badge: '',
    cta: 'あそぶ',
    bg: '#EA580C',
    shadow: '#9A3412',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Pulled craft tape strip with hand-torn jagged right edge -->
        <path d="M36 52 H82 L78 57 L84 62 L78 67 L84 72 L79 76 H36 Z" fill="#FACC15" stroke="#92400E" stroke-width="3" stroke-linejoin="round"/>
        <line x1="44" y1="59" x2="74" y2="59" stroke="rgba(255,255,255,0.65)" stroke-width="3" stroke-linecap="round"/>
        <!-- Secondary colorful strip stuck diagonally -->
        <path d="M52 22 L80 34 L74 48 L46 36 Z" fill="#38BDF8" stroke="#0369A1" stroke-width="2.5" stroke-linejoin="round" opacity="0.92"/>
        <!-- Chunky craft tape roll on left -->
        <circle cx="36" cy="48" r="26" fill="#C88D55" stroke="#78350F" stroke-width="3.5"/>
        <circle cx="36" cy="48" r="20" fill="#DDA974" stroke="#92400E" stroke-width="2" stroke-dasharray="6 5"/>
        <circle cx="36" cy="48" r="12" fill="#F5E6D3" stroke="#78350F" stroke-width="3"/>
        <circle cx="36" cy="48" r="7" fill="#FFFFFF"/>
      </svg>
    `,
    load: (v) => loadMod('./tape-craft.js', v)
  },
  {
    id: 'lock-lab',
    title: 'カギ ラボ',
    sub: 'LOCK MECHANISM',
    desc: 'ピンを そろえて カギや きんこを ガチャンと あけよう！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#CA8A04',
    shadow: '#854D0E',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Brass Cutaway Lock Cylinder -->
        <rect x="26" y="16" width="56" height="62" rx="12" fill="#F6CE5B" stroke="#78350F" stroke-width="3.5"/>
        <!-- 3 Visible Cutaway Pin Stacks (Red Driver + Gold Key Pin) -->
        <rect x="35" y="22" width="10" height="20" rx="2.5" fill="#EF4444" stroke="#7F1D1D" stroke-width="1.8"/>
        <rect x="35" y="44" width="10" height="14" rx="2.5" fill="#FACC15" stroke="#78350F" stroke-width="1.8"/>
        <rect x="50" y="26" width="10" height="16" rx="2.5" fill="#EF4444" stroke="#7F1D1D" stroke-width="1.8"/>
        <rect x="50" y="44" width="10" height="18" rx="2.5" fill="#FACC15" stroke="#78350F" stroke-width="1.8"/>
        <rect x="65" y="20" width="10" height="22" rx="2.5" fill="#EF4444" stroke="#7F1D1D" stroke-width="1.8"/>
        <rect x="65" y="44" width="10" height="12" rx="2.5" fill="#FACC15" stroke="#78350F" stroke-width="1.8"/>
        <!-- Emerald Shear Line -->
        <line x1="28" y1="43" x2="80" y2="43" stroke="#4ADE80" stroke-width="3"/>
        <!-- Bitted Key entering from left -->
        <circle cx="20" cy="64" r="14" fill="#FDE047" stroke="#78350F" stroke-width="3"/>
        <circle cx="15" cy="64" r="4" fill="#CA8A04"/>
        <path d="M32 58 H40 L44 62 L52 57 L58 63 L68 58 L76 64 L72 70 H32 Z" fill="#FDE047" stroke="#78350F" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>
    `,
    load: (v) => loadMod('./lock-lab.js', v)
  },
  {
    id: 'vending-lab',
    title: 'ジハンキ ラボ',
    sub: 'VENDING MACHINE',
    desc: 'おかねを いれて ドリンク ゲット！なかの メカも まるみえ！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#DC2626',
    shadow: '#991B1B',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Japanese Vending Machine Body -->
        <rect x="20" y="10" width="56" height="76" rx="10" fill="#FFFFFF" stroke="#1E293B" stroke-width="3.5"/>
        <rect x="22" y="12" width="6" height="72" rx="3" fill="#EF4444"/>
        <!-- Illuminated Showcase Window -->
        <rect x="31" y="17" width="38" height="36" rx="5" fill="#E0F2FE" stroke="#475569" stroke-width="2"/>
        <!-- 3 Mini Cans -->
        <rect x="35" y="24" width="8" height="16" rx="2" fill="#38BDF8" stroke="#0369A1" stroke-width="1.5"/>
        <rect x="46" y="24" width="8" height="16" rx="2" fill="#FB923C" stroke="#C2410C" stroke-width="1.5"/>
        <rect x="57" y="24" width="8" height="16" rx="2" fill="#4ADE80" stroke="#15803D" stroke-width="1.5"/>
        <!-- Cold Blue Bar & Lit Green Buttons -->
        <rect x="34" y="42" width="32" height="4" rx="1.5" fill="#0284C7"/>
        <rect x="35" y="48" width="8" height="3.5" rx="1.5" fill="#22C55E"/>
        <rect x="46" y="48" width="8" height="3.5" rx="1.5" fill="#22C55E"/>
        <rect x="57" y="48" width="8" height="3.5" rx="1.5" fill="#22C55E"/>
        <!-- Coin Slot & LED Display -->
        <rect x="31" y="57" width="20" height="8" rx="2.5" fill="#0F172A"/>
        <rect x="34" y="59.5" width="14" height="3" rx="1" fill="#4ADE80"/>
        <circle cx="62" cy="61" r="4.5" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
        <!-- Pickup Box -->
        <rect x="31" y="69" width="38" height="12" rx="4" fill="#1E293B"/>
      </svg>
    `,
    load: (v) => loadMod('./vending-lab.js', v)
  },
  {
    id: 'rail-control',
    title: 'ふみきり ラボ',
    sub: 'RAIL CONTROL',
    desc: 'カンカン しゃだんき と せんろの ポイントを そうさ！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#1D4ED8',
    shadow: '#1E3A8A',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Fumikiri Post -->
        <rect x="26" y="18" width="10" height="64" rx="3" fill="#FACC15" stroke="#111827" stroke-width="2.5"/>
        <!-- X Crossbuck -->
        <rect x="14" y="24" width="34" height="7" rx="2.5" fill="#FACC15" stroke="#111827" stroke-width="2" transform="rotate(30 31 27.5)"/>
        <rect x="14" y="24" width="34" height="7" rx="2.5" fill="#FACC15" stroke="#111827" stroke-width="2" transform="rotate(-30 31 27.5)"/>
        <!-- Flashing Red Warning Lamps -->
        <rect x="14" y="42" width="34" height="14" rx="7" fill="#1E293B"/>
        <circle cx="23" cy="49" r="5" fill="#EF4444"/>
        <circle cx="39" cy="49" r="5" fill="#7F1D1D"/>
        <!-- Lowered Striped Crossing Gate Bar -->
        <rect x="28" y="64" width="56" height="9" rx="3.5" fill="#FACC15" stroke="#111827" stroke-width="2.5"/>
        <path d="M40 64 L48 73 M54 64 L62 73 M68 64 L76 73" stroke="#111827" stroke-width="4"/>
        <!-- Mini Shinkansen nose peeking behind -->
        <path d="M52 46 H78 C86 46 88 38 78 32 H52 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
        <line x1="53" y1="41" x2="82" y2="41" stroke="#2563EB" stroke-width="3.5"/>
      </svg>
    `,
    load: (v) => loadMod('./rail-control.js', v)
  },
  {
    id: 'water-lab',
    title: 'すいどう ラボ',
    sub: 'WATER & VALVES',
    desc: 'あかい バルブと パイプで みずぐるまや タンクへ みずを ながそう！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#0284C7',
    shadow: '#075985',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Transparent Pipe with Flowing Blue Water -->
        <path d="M12 58 H74 Q82 58 82 66 V82" stroke="#334155" stroke-width="20" stroke-linecap="round" fill="none"/>
        <path d="M12 58 H74 Q82 58 82 66 V82" stroke="#38BDF8" stroke-width="13" stroke-linecap="round" fill="none"/>
        <path d="M18 54 H70" stroke="rgba(255,255,255,0.65)" stroke-width="3" stroke-linecap="round"/>
        <!-- Brass Valve Stem -->
        <rect x="40" y="34" width="12" height="18" rx="3" fill="#F59E0B" stroke="#78350F" stroke-width="2.5"/>
        <!-- Red Industrial 5-Spoke Valve Handwheel -->
        <circle cx="46" cy="28" r="18" fill="none" stroke="#EF4444" stroke-width="6.5"/>
        <circle cx="46" cy="28" r="18" fill="none" stroke="#7F1D1D" stroke-width="1.5"/>
        <line x1="30" y1="28" x2="62" y2="28" stroke="#EF4444" stroke-width="4.5"/>
        <line x1="46" y1="12" x2="46" y2="44" stroke="#EF4444" stroke-width="4.5"/>
        <circle cx="46" cy="28" r="5" fill="#CBD5E1" stroke="#334155" stroke-width="2"/>
        <!-- Water Splash Droplets -->
        <circle cx="72" cy="84" r="4" fill="#BAE6FD"/>
        <circle cx="88" cy="80" r="3.5" fill="#BAE6FD"/>
      </svg>
    `,
    load: (v) => loadMod('./water-lab.js', v)
  },
  {
    id: 'elevator-lab',
    title: 'エレベーター ラボ',
    sub: 'ELEVATOR LAB',
    desc: 'ボタンと かっしゃの しくみで おきゃくさんを はこぼう！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#315772',
    shadow: '#1E3A50',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Traction sheave pulley at top -->
        <circle cx="48" cy="18" r="10" fill="#F7C948"/>
        <circle cx="48" cy="18" r="4.5" fill="#315772"/>
        <line x1="48" y1="26" x2="48" y2="38" stroke="#E2E8F0" stroke-width="3.5"/>
        <!-- Matte Elevator Cabin & Sliding Doors -->
        <rect x="20" y="34" width="56" height="50" rx="12" fill="#FFFFFF"/>
        <rect x="26" y="40" width="20" height="38" rx="6" fill="#D5E0EB"/>
        <rect x="50" y="40" width="20" height="38" rx="6" fill="#D5E0EB"/>
        <!-- Glowing Up/Down Call Arrows -->
        <polygon points="82,46 77,54 87,54" fill="#4ADE80"/>
        <polygon points="82,68 77,60 87,60" fill="#F7C948"/>
      </svg>
    `,
    load: (v) => loadMod('./elevator-lab.js', v)
  },
  {
    id: 'washer-lab',
    title: 'せんたくき ラボ',
    sub: 'WASHER LAB',
    desc: 'あわあわ あらい と こうそく だっすい の メカ！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#3A7D72',
    shadow: '#25554D',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <rect x="18" y="12" width="60" height="72" rx="14" fill="#FFFFFF"/>
        <rect x="25" y="19" width="18" height="10" rx="5" fill="#D5E0EB"/>
        <circle cx="54" cy="24" r="6" fill="#56CCF2"/>
        <circle cx="68" cy="24" r="5" fill="#34D399"/>
        <!-- Round Drum Glass Door with Water & Bubbles -->
        <circle cx="48" cy="56" r="22" fill="#CBD6E2"/>
        <circle cx="48" cy="56" r="16" fill="#2A3E4C"/>
        <path d="M 33 60 Q 48 52 63 60 A 16 16 0 0 1 33 60 Z" fill="#5CE1E6"/>
        <circle cx="42" cy="54" r="4" fill="#FFFFFF" opacity="0.85"/>
        <circle cx="53" cy="52" r="3.5" fill="#FFFFFF" opacity="0.85"/>
      </svg>
    `,
    load: (v) => loadMod('./washer-lab.js', v)
  },
  {
    id: 'musicbox-lab',
    title: 'オルゴール ラボ',
    sub: 'MUSIC BOX LAB',
    desc: 'ぜんまいを まいて ピンで きれいな メロディを かなでよう！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#5B4B8A',
    shadow: '#3B2F63',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <rect x="14" y="18" width="68" height="62" rx="14" fill="#D9A36A"/>
        <rect x="21" y="25" width="54" height="48" rx="9" fill="#2B2B45"/>
        <!-- Brass Pin Cylinder -->
        <rect x="27" y="30" width="42" height="22" rx="6" fill="#F7C948"/>
        <circle cx="35" cy="38" r="2.8" fill="#F05A5B"/>
        <circle cx="45" cy="44" r="2.8" fill="#5CD68D"/>
        <circle cx="55" cy="36" r="2.8" fill="#56CCF2"/>
        <circle cx="62" cy="43" r="2.8" fill="#FF8FB1"/>
        <!-- Steel Comb Teeth -->
        <rect x="29" y="54" width="5" height="16" rx="2.5" fill="#E2E8F0"/>
        <rect x="37" y="54" width="5" height="14" rx="2.5" fill="#E2E8F0"/>
        <rect x="45" y="54" width="5" height="12" rx="2.5" fill="#E2E8F0"/>
        <rect x="53" y="54" width="5" height="10" rx="2.5" fill="#E2E8F0"/>
        <rect x="61" y="54" width="5" height="8"  rx="2.5" fill="#E2E8F0"/>
      </svg>
    `,
    load: (v) => loadMod('./musicbox-lab.js', v)
  },
  {
    id: 'register-lab',
    title: 'レジ ラボ',
    sub: 'REGISTER LAB',
    desc: 'ピッ！と スキャンして チーン！と おかいけい ＆ ロールほじゅう！',
    badge: 'NEW!',
    cta: 'あそぶ',
    bg: '#45B5A2',
    shadow: '#2C8575',
    available: true,
    iconSvg: `
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <!-- Receipt Strip & Thermal Roll -->
        <rect x="24" y="10" width="18" height="24" rx="4" fill="#FFFFFF"/>
        <line x1="28" y1="16" x2="38" y2="16" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="28" y1="22" x2="36" y2="22" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Digital Display -->
        <rect x="48" y="16" width="30" height="18" rx="6" fill="#2A3647"/>
        <rect x="54" y="22" width="18" height="6" rx="3" fill="#6EE7B7"/>
        <!-- Matte Mint Register Body & Gold Checkout Key -->
        <rect x="16" y="34" width="64" height="32" rx="10" fill="#6DD5C3"/>
        <rect x="24" y="42" width="22" height="16" rx="5" fill="#FFFFFF"/>
        <rect x="52" y="42" width="20" height="16" rx="5" fill="#F7C948"/>
        <!-- Cash Drawer -->
        <rect x="16" y="68" width="64" height="16" rx="7" fill="#FFFFFF"/>
        <rect x="38" y="74" width="20" height="5" rx="2.5" fill="#CBD6E2"/>
      </svg>
    `,
    load: (v) => loadMod('./register-lab.js', v)
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
