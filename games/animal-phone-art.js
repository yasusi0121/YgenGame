/* =========================================================================
   ANIMAL PHONE ART — Custom Flat-Design SVG Characters & Telephone Icons
   4 friendly animals (きつね・ぶた・うし・いぬ), party scene, alien,
   and interactive call action icons (Zero Unicode emojis)
   ========================================================================= */

export const PHONE_ANIMALS = [
  {
    id: 'fox',
    name: 'きつね',
    num3: '111',
    num4: '1234',
    bg: '#FF8C42',
    lightBg: '#FFF3E0',
    voice: { pitch: 1.32, rate: 1.04, fallbackPitch: 420 },
    situations: [
      { label: 'えほん を よんでるよ！', speech: 'もしもし！きつねだよ！いまね、あかい えほんを よんでるんだ！', prop: 'book' },
      { label: 'おさんぽ ちゅう！', speech: 'もしもし！きつねだよ！おそとで おさんぽ してたよ！', prop: 'flower' },
      { label: 'かくれんぼ ちゅう！', speech: 'もしもし！きつねだよ！しーっ！いま かくれんぼ してるの！', prop: 'star' }
    ],
    actions: {
      snack:  { text: 'りんご ありがとう！シャクシャク おいしいな！', speech: 'わあ、りんご ありがとう！シャクシャク おいしいな！' },
      music:  { text: 'たのしい おんがく！ルンルン おどろう！', speech: 'たのしい おんがくだね！ルンルン いっしょに おどろう！' },
      tickle: { text: 'きゃはは！しっぽが くすぐったいよ〜！', speech: 'きゃははは！しっぽが くすぐったいよー！' },
      bye:    { text: 'また でんわしてね！バイバーイ！', speech: 'また でんわしてね！バイバーイ！' }
    }
  },
  {
    id: 'pig',
    name: 'ぶた',
    num3: '222',
    num4: '2828',
    bg: '#F48FB1',
    lightBg: '#FCE4EC',
    voice: { pitch: 1.52, rate: 1.1, fallbackPitch: 480 },
    situations: [
      { label: 'おひるね ちゅう！', speech: 'ぶーぶー！もしもし！ぶただよ！いま おひるね してたんだ！', prop: 'zzz' },
      { label: 'おやつ タイム！', speech: 'ぶーぶー！もしもし！ぶただよ！あまい ケーキを たべてるよ！', prop: 'cake' },
      { label: 'しゃぼんだま あそび！', speech: 'ぶーぶー！もしもし！ぶただよ！ふわふわ しゃぼんだま とばしてるよ！', prop: 'bubble' }
    ],
    actions: {
      snack:  { text: 'もぐもぐ！おいしすぎて ほっぺが おちそう！', speech: 'もぐもぐ！おいしすぎて ほっぺが おちそうだよ！' },
      music:  { text: 'ぶーぶー リズムに のって ダンス！', speech: 'ぶーぶー！リズムに のって みんなで ダンスしよう！' },
      tickle: { text: 'ぶひゃひゃ！おなか くすぐったいよー！', speech: 'ぶひゃひゃひゃ！おなかが くすぐったいよー！' },
      bye:    { text: 'でんわ うれしかったよ！またね！', speech: 'でんわ うれしかったよ！またねー！' }
    }
  },
  {
    id: 'cow',
    name: 'うし',
    num3: '333',
    num4: '3030',
    bg: '#4DB6AC',
    lightBg: '#E0F2F1',
    voice: { pitch: 0.78, rate: 0.9, fallbackPitch: 240 },
    situations: [
      { label: 'くさ を もぐもぐ！', speech: 'もーもー！もしもし！うしだよ！おいしい くさを もぐもぐ たべてるよ！', prop: 'leaf' },
      { label: 'ミルク づくり！', speech: 'もーもー！もしもし！うしだよ！つめたい ミルクを つくってたよ！', prop: 'milk' },
      { label: 'おんがくたい！', speech: 'もーもー！もしもし！うしだよ！みんなで おんがくたい してるんだ！', prop: 'note' }
    ],
    actions: {
      snack:  { text: 'もー！とっても おいしいよ！ありがとう！', speech: 'もー！とっても おいしいよ！ありがとう！' },
      music:  { text: 'もーもー！ゆったり ステップで おどろう！', speech: 'もーもー！ゆったり ステップで おどろうね！' },
      tickle: { text: 'もふふふ！ツノの あたりが くすぐったいよ！', speech: 'もふふふ！ツノの あたりが くすぐったいよ！' },
      bye:    { text: 'もーもー！また おはなし しようね！', speech: 'もーもー！また おはなし しようね！バイバイ！' }
    }
  },
  {
    id: 'dog',
    name: 'いぬ',
    num3: '444',
    num4: '4114',
    bg: '#C68B59',
    lightBg: '#EFEBE9',
    voice: { pitch: 1.62, rate: 1.18, fallbackPitch: 520 },
    situations: [
      { label: 'ボール あそび！', speech: 'わんわん！もしもし！いぬだよ！ボールを おいかけて あそんでたよ！', prop: 'ball' },
      { label: 'しっぽ フリフリ！', speech: 'わんわん！もしもし！いぬだよ！でんわ くれて しっぽが フリフリだよ！', prop: 'star' },
      { label: 'おるすばん がんばり中！', speech: 'わんわん！もしもし！いぬだよ！おうちで おるすばん がんばってるよ！', prop: 'book' }
    ],
    actions: {
      snack:  { text: 'わんわん！サクサク おやつ だいすき！', speech: 'わんわん！サクサク おやつ だいすきだよ！ありがとう！' },
      music:  { text: 'ワン・ツー・スリー！ジャンプして おどろう！', speech: 'ワン・ツー・スリー！ジャンプして おどろう！' },
      tickle: { text: 'わははは！みみの うしろ きもちいいー！', speech: 'わははは！みみの うしろ きもちいいよー！' },
      bye:    { text: 'わんわん！また あそぼうね！バイバイ！', speech: 'わんわん！また あそぼうね！バイバイ！' }
    }
  }
];

/** Render one of the 4 animals (or alien / party) in Lingokids-inspired flat SVG */
export function renderAnimalFaceSvg(id, size = 100) {
  switch (id) {
    case 'fox':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <!-- Fluffy tail peek -->
          <path d="M84 82 C108 74 114 50 96 42 C96 58 88 68 78 72 Z" fill="#F97316"/>
          <path d="M96 42 C106 46 110 56 104 62 C98 56 95 50 96 42 Z" fill="#FFF7ED"/>
          <!-- Ears -->
          <path d="M26 50 L22 14 L52 32 Z" fill="#EA580C" stroke="#9A3412" stroke-width="3" stroke-linejoin="round"/>
          <path d="M29 44 L27 22 L45 33 Z" fill="#FFEDD5"/>
          <path d="M94 50 L98 14 L68 32 Z" fill="#EA580C" stroke="#9A3412" stroke-width="3" stroke-linejoin="round"/>
          <path d="M91 44 L93 22 L75 33 Z" fill="#FFEDD5"/>
          <!-- Body -->
          <ellipse cx="60" cy="98" rx="24" ry="18" fill="#F97316"/>
          <ellipse cx="60" cy="100" rx="14" ry="13" fill="#FFEDD5"/>
          <!-- Head -->
          <ellipse cx="60" cy="58" rx="37" ry="31" fill="#F97316"/>
          <!-- Cream cheeks -->
          <path d="M23 58 C24 78 40 89 60 89 C80 89 96 78 97 58 C86 68 72 64 60 66 C48 64 34 68 23 58 Z" fill="#FFEDD5"/>
          <!-- Big friendly eyes -->
          <circle cx="44" cy="56" r="8.5" fill="#FFFFFF"/>
          <circle cx="76" cy="56" r="8.5" fill="#FFFFFF"/>
          <circle cx="45" cy="56" r="5.5" fill="#451A03"/>
          <circle cx="75" cy="56" r="5.5" fill="#451A03"/>
          <circle cx="47" cy="54" r="2.1" fill="#FFFFFF"/>
          <circle cx="77" cy="54" r="2.1" fill="#FFFFFF"/>
          <!-- Eyebrows -->
          <path d="M37 44 Q44 41 49 44" stroke="#9A3412" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M71 44 Q76 41 83 44" stroke="#9A3412" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Nose & happy smile -->
          <ellipse cx="60" cy="69" rx="5.5" ry="4" fill="#292524"/>
          <path d="M54 76 Q60 82 66 76" stroke="#7C2D12" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      `;

    case 'pig':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <!-- Curly tail -->
          <path d="M20 84 C10 82 10 70 18 72 C24 74 20 84 28 84" stroke="#F48FB1" stroke-width="4" stroke-linecap="round"/>
          <!-- Round pink body -->
          <ellipse cx="60" cy="96" rx="28" ry="18" fill="#F8BBD0"/>
          <!-- Ears -->
          <path d="M28 46 L18 22 L46 30 Z" fill="#F48FB1" stroke="#EC407A" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M92 46 L102 22 L74 30 Z" fill="#F48FB1" stroke="#EC407A" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Head -->
          <circle cx="60" cy="58" r="34" fill="#FBCFE8"/>
          <!-- Rosy cheeks -->
          <circle cx="34" cy="66" r="6" fill="#F472B6" opacity="0.45"/>
          <circle cx="86" cy="66" r="6" fill="#F472B6" opacity="0.45"/>
          <!-- Big friendly eyes -->
          <circle cx="44" cy="53" r="8" fill="#FFFFFF"/>
          <circle cx="76" cy="53" r="8" fill="#FFFFFF"/>
          <circle cx="45" cy="53" r="5" fill="#1E293B"/>
          <circle cx="75" cy="53" r="5" fill="#1E293B"/>
          <circle cx="47" cy="51" r="2" fill="#FFFFFF"/>
          <circle cx="77" cy="51" r="2" fill="#FFFFFF"/>
          <!-- Pig snout -->
          <ellipse cx="60" cy="67" rx="13" ry="9.5" fill="#F472B6" stroke="#DB2777" stroke-width="2"/>
          <ellipse cx="55.5" cy="67" rx="2.5" ry="3.5" fill="#9D174D"/>
          <ellipse cx="64.5" cy="67" rx="2.5" ry="3.5" fill="#9D174D"/>
          <!-- Smile -->
          <path d="M51 80 Q60 87 69 80" stroke="#9D174D" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      `;

    case 'cow':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <!-- Body with cow spots -->
          <ellipse cx="60" cy="96" rx="28" ry="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
          <ellipse cx="44" cy="94" rx="9" ry="7" fill="#334155"/>
          <ellipse cx="75" cy="99" rx="8" ry="6" fill="#334155"/>
          <!-- Ears -->
          <ellipse cx="22" cy="44" rx="13" ry="8" transform="rotate(-18 22 44)" fill="#334155"/>
          <ellipse cx="23" cy="45" rx="8" ry="4.5" transform="rotate(-18 23 45)" fill="#F9A8D4"/>
          <ellipse cx="98" cy="44" rx="13" ry="8" transform="rotate(18 98 44)" fill="#334155"/>
          <ellipse cx="97" cy="45" rx="8" ry="4.5" transform="rotate(18 97 45)" fill="#F9A8D4"/>
          <!-- Little yellow horns -->
          <path d="M40 30 Q36 16 44 18 Q47 24 48 30 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
          <path d="M80 30 Q84 16 76 18 Q73 24 72 30 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
          <!-- Head -->
          <ellipse cx="60" cy="58" rx="34" ry="31" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
          <!-- Forehead cow spot -->
          <path d="M62 28 C78 28 90 38 92 50 C80 54 70 46 66 38 Z" fill="#334155"/>
          <!-- Eyes -->
          <circle cx="44" cy="54" r="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <circle cx="76" cy="54" r="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <circle cx="45" cy="54" r="5" fill="#451A03"/>
          <circle cx="75" cy="54" r="5" fill="#451A03"/>
          <circle cx="47" cy="52" r="2" fill="#FFFFFF"/>
          <circle cx="77" cy="52" r="2" fill="#FFFFFF"/>
          <!-- Pink muzzle -->
          <ellipse cx="60" cy="74" rx="22" ry="14" fill="#FBCFE8" stroke="#F472B6" stroke-width="2"/>
          <circle cx="51" cy="71" r="2.6" fill="#9D174D"/>
          <circle cx="69" cy="71" r="2.6" fill="#9D174D"/>
          <path d="M52 79 Q60 85 68 79" stroke="#9D174D" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      `;

    case 'dog':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <!-- Wagging tail -->
          <path d="M24 92 Q12 80 18 68" stroke="#B45309" stroke-width="7" stroke-linecap="round"/>
          <!-- Body -->
          <ellipse cx="60" cy="96" rx="25" ry="17" fill="#C68B59"/>
          <ellipse cx="60" cy="96" rx="13" ry="10" fill="#FEF3C7"/>
          <!-- Floppy puppy ears -->
          <ellipse cx="25" cy="50" rx="12" ry="20" transform="rotate(16 25 50)" fill="#78350F"/>
          <ellipse cx="95" cy="50" rx="12" ry="20" transform="rotate(-16 95 50)" fill="#78350F"/>
          <!-- Head -->
          <ellipse cx="60" cy="57" rx="33" ry="29" fill="#C68B59"/>
          <!-- Eyes -->
          <circle cx="45" cy="53" r="8" fill="#FFFFFF"/>
          <circle cx="75" cy="53" r="8" fill="#FFFFFF"/>
          <circle cx="46" cy="53" r="5.2" fill="#292524"/>
          <circle cx="74" cy="53" r="5.2" fill="#292524"/>
          <circle cx="48" cy="51" r="2" fill="#FFFFFF"/>
          <circle cx="76" cy="51" r="2" fill="#FFFFFF"/>
          <!-- Cream snout -->
          <ellipse cx="60" cy="70" rx="17" ry="13" fill="#FEF3C7"/>
          <ellipse cx="60" cy="65" rx="6" ry="4.5" fill="#451A03"/>
          <path d="M52 73 Q60 80 68 73" stroke="#451A03" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      `;

    case 'alien':
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <!-- Antennae -->
          <line x1="42" y1="30" x2="34" y2="12" stroke="#4ADE80" stroke-width="4" stroke-linecap="round"/>
          <circle cx="34" cy="12" r="6" fill="#FFD12E" stroke="#15803D" stroke-width="2"/>
          <line x1="78" y1="30" x2="86" y2="12" stroke="#4ADE80" stroke-width="4" stroke-linecap="round"/>
          <circle cx="86" cy="12" r="6" fill="#FFD12E" stroke="#15803D" stroke-width="2"/>
          <!-- UFO / body -->
          <ellipse cx="60" cy="98" rx="38" ry="12" fill="#94A3B8" stroke="#475569" stroke-width="3"/>
          <circle cx="40" cy="98" r="3.5" fill="#FFD12E"/>
          <circle cx="60" cy="100" r="3.5" fill="#38BDF8"/>
          <circle cx="80" cy="98" r="3.5" fill="#FF6B8B"/>
          <!-- Green friendly alien head -->
          <ellipse cx="60" cy="58" rx="32" ry="29" fill="#4ADE80" stroke="#15803D" stroke-width="3"/>
          <!-- 3 cute eyes -->
          <circle cx="42" cy="56" r="7" fill="#FFFFFF"/>
          <circle cx="60" cy="48" r="7.5" fill="#FFFFFF"/>
          <circle cx="78" cy="56" r="7" fill="#FFFFFF"/>
          <circle cx="42" cy="56" r="3.8" fill="#1E293B"/>
          <circle cx="60" cy="48" r="4" fill="#1E293B"/>
          <circle cx="78" cy="56" r="3.8" fill="#1E293B"/>
          <path d="M48 72 Q60 80 72 72" stroke="#14532D" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;

    default:
      return '';
  }
}

/** Render the 4-animal meadow party scene (secret number 000 / 7777!) */
export function renderPartySceneSvg() {
  return `
    <svg width="280" height="176" viewBox="0 0 280 176" fill="none" aria-hidden="true">
      <rect width="280" height="176" rx="22" fill="#7DD3FC"/>
      <!-- Soft clouds -->
      <ellipse cx="52" cy="36" rx="28" ry="13" fill="#FFFFFF" opacity="0.9"/>
      <ellipse cx="148" cy="28" rx="34" ry="14" fill="#FFFFFF" opacity="0.9"/>
      <!-- Party garland flags -->
      <path d="M180 6 Q230 34 276 54" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
      <polygon points="196,15 212,24 198,34" fill="#38BDF8"/>
      <polygon points="222,28 238,37 224,48" fill="#4ADE80"/>
      <polygon points="248,41 264,50 250,61" fill="#F472B6"/>
      <!-- Green meadow hill -->
      <ellipse cx="140" cy="168" rx="165" ry="52" fill="#4ADE80"/>
      <!-- Little red picture book on grass -->
      <polygon points="148,144 172,140 182,150 158,154" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
      <!-- All 4 animals together -->
      <g transform="translate(94 26) scale(0.78)">${renderAnimalFaceSvg('fox', 120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      <g transform="translate(22 66) scale(0.62)">${renderAnimalFaceSvg('pig', 120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      <g transform="translate(180 62) scale(0.66)">${renderAnimalFaceSvg('cow', 120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      <g transform="translate(76 92) scale(0.55)">${renderAnimalFaceSvg('dog', 120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    </svg>
  `;
}

export const PHONE_ICONS = {
  handset(size = 26, color = '#FFFFFF') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.36 2.3.55 3.6.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.55 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z" fill="${color}"/>
    </svg>`;
  },
  hangup(size = 26, color = '#FFFFFF') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 14.5 C7.5 10.5 16.5 10.5 20.5 14.5 L18.5 17.5 C17.9 18.2 16.9 18.2 16.2 17.6 L14.5 16 C13 15.4 11 15.4 9.5 16 L7.8 17.6 C7.1 18.2 6.1 18.2 5.5 17.5 Z" fill="${color}"/>
    </svg>`;
  },
  backspace(size = 24, color = '#FFFFFF') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6 H20 A2 2 0 0 1 22 8 V16 A2 2 0 0 1 20 18 H9 L3 12 Z" fill="${color}" opacity="0.22" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
      <line x1="12" y1="9.5" x2="17" y2="14.5" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="17" y1="9.5" x2="12" y2="14.5" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`;
  },
  bell(size = 20, color = '#4D3300') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 C8.5 3 6 5.8 6 9.5 V14 L4 17 H20 L18 14 V9.5 C18 5.8 15.5 3 12 3 Z" fill="${color}"/>
      <circle cx="12" cy="19.5" r="2.2" fill="${color}"/>
    </svg>`;
  },
  smile(size = 24) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FFD12E" stroke="#B45309" stroke-width="2"/>
      <circle cx="8.5" cy="9.5" r="1.6" fill="#451A03"/>
      <circle cx="15.5" cy="9.5" r="1.6" fill="#451A03"/>
      <path d="M7.5 13.5 Q12 18.5 16.5 13.5" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </svg>`;
  }
};
