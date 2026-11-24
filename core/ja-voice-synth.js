/* =========================================================================
   JAPANESE MORA FORMANT VOICE SYNTHESIZER (Klatt-style 3-Formant + Consonants)
   Renders full Hiragana / Katakana sentences into clear Japanese speech
   using OfflineAudioContext (zero real-time CPU overhead, battery-friendly).
   Supports all Gojuon, Dakuon, Handakuon, Yoon, Sokuon (っ), Hatsuon (ん),
   Choonpu (ー), punctuation pauses, and Japanese pitch accent contours.
   ========================================================================= */

// Standard Japanese 5-vowel 3-formant targets [F1, F2, F3] (Hz) & relative gains
const VOWEL_FORMANTS = {
  a: [780, 1260, 2650],
  i: [290, 2320, 3100],
  u: [340, 1320, 2450],
  e: [480, 1980, 2750],
  o: [460,  880, 2520],
  N: [260, 1180, 2250] // Hatsuon (ん) nasal resonance
};

// Consonant locus F2/F3 transition starting points (Hz)
const CONSONANT_LOCUS = {
  k:  [2300, 2800], g:  [2300, 2800],
  s:  [1750, 2700], z:  [1750, 2700],
  sh: [2150, 2900], j:  [2150, 2900],
  t:  [1800, 2750], d:  [1800, 2750],
  ts: [1800, 2750], ch: [2150, 2900],
  n:  [1750, 2650], ny: [2150, 2900],
  h:  [1500, 2550], f:  [1000, 2400],
  b:  [ 750, 2200], p:  [ 750, 2200],
  m:  [ 750, 2200],
  y:  [2250, 3000],
  r:  [1650, 1950],
  w:  [ 720, 2300]
};

// Complete Hiragana -> { c: consonant|null, v: vowel|null, y: glide? } table
const KANA_MAP = {
  'あ': { c: null, v: 'a' }, 'い': { c: null, v: 'i' }, 'う': { c: null, v: 'u' }, 'え': { c: null, v: 'e' }, 'お': { c: null, v: 'o' },
  'か': { c: 'k',  v: 'a' }, 'き': { c: 'k',  v: 'i' }, 'く': { c: 'k',  v: 'u' }, 'け': { c: 'k',  v: 'e' }, 'こ': { c: 'k',  v: 'o' },
  'さ': { c: 's',  v: 'a' }, 'し': { c: 'sh', v: 'i' }, 'す': { c: 's',  v: 'u' }, 'せ': { c: 's',  v: 'e' }, 'そ': { c: 's',  v: 'o' },
  'た': { c: 't',  v: 'a' }, 'ち': { c: 'ch', v: 'i' }, 'つ': { c: 'ts', v: 'u' }, 'て': { c: 't',  v: 'e' }, 'と': { c: 't',  v: 'o' },
  'な': { c: 'n',  v: 'a' }, 'に': { c: 'n',  v: 'i' }, 'ぬ': { c: 'n',  v: 'u' }, 'ね': { c: 'n',  v: 'e' }, 'の': { c: 'n',  v: 'o' },
  'は': { c: 'h',  v: 'a' }, 'ひ': { c: 'h',  v: 'i' }, 'ふ': { c: 'f',  v: 'u' }, 'へ': { c: 'h',  v: 'e' }, 'ほ': { c: 'h',  v: 'o' },
  'ま': { c: 'm',  v: 'a' }, 'み': { c: 'm',  v: 'i' }, 'む': { c: 'm',  v: 'u' }, 'め': { c: 'm',  v: 'e' }, 'も': { c: 'm',  v: 'o' },
  'や': { c: 'y',  v: 'a' }, 'ゆ': { c: 'y',  v: 'u' }, 'よ': { c: 'y',  v: 'o' },
  'ら': { c: 'r',  v: 'a' }, 'り': { c: 'r',  v: 'i' }, 'る': { c: 'r',  v: 'u' }, 'れ': { c: 'r',  v: 'e' }, 'ろ': { c: 'r',  v: 'o' },
  'わ': { c: 'w',  v: 'a' }, 'を': { c: null, v: 'o' }, 'ん': { c: null, v: 'N' },

  'が': { c: 'g',  v: 'a' }, 'ぎ': { c: 'g',  v: 'i' }, 'ぐ': { c: 'g',  v: 'u' }, 'げ': { c: 'g',  v: 'e' }, 'ご': { c: 'g',  v: 'o' },
  'ざ': { c: 'z',  v: 'a' }, 'じ': { c: 'j',  v: 'i' }, 'ず': { c: 'z',  v: 'u' }, 'ぜ': { c: 'z',  v: 'e' }, 'ぞ': { c: 'z',  v: 'o' },
  'だ': { c: 'd',  v: 'a' }, 'ぢ': { c: 'j',  v: 'i' }, 'づ': { c: 'z',  v: 'u' }, 'で': { c: 'd',  v: 'e' }, 'ど': { c: 'd',  v: 'o' },
  'ば': { c: 'b',  v: 'a' }, 'び': { c: 'b',  v: 'i' }, 'ぶ': { c: 'b',  v: 'u' }, 'べ': { c: 'b',  v: 'e' }, 'ぼ': { c: 'b',  v: 'o' },
  'ぱ': { c: 'p',  v: 'a' }, 'ぴ': { c: 'p',  v: 'i' }, 'ぷ': { c: 'p',  v: 'u' }, 'ぺ': { c: 'p',  v: 'e' }, 'ぽ': { c: 'p',  v: 'o' },

  'ぁ': { c: null, v: 'a' }, 'ぃ': { c: null, v: 'i' }, 'ぅ': { c: null, v: 'u' }, 'ぇ': { c: null, v: 'e' }, 'ぉ': { c: null, v: 'o' }
};

const DIGIT_KANA = {
  '0': 'ぜろ', '1': 'いち', '2': 'に', '3': 'さん', '4': 'よん',
  '5': 'ご',   '6': 'ろく', '7': 'なな', '8': 'はち', '9': 'きゅう'
};

/** Normalize Katakana & digits into Hiragana string */
function toHiragana(str) {
  let out = '';
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (code >= 0x30A1 && code <= 0x30F6) {
      out += String.fromCharCode(code - 0x60);
    } else if (DIGIT_KANA[ch]) {
      out += DIGIT_KANA[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

/** Parse Japanese text into timed mora tokens */
export function parseJapaneseMoras(text) {
  const hira = toHiragana(text);
  const moras = [];
  const chars = Array.from(hira);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (ch === 'っ') {
      moras.push({ type: 'sokuon', dur: 0.095 });
      continue;
    }
    if (ch === 'ー' || ch === '〜' || ch === '~') {
      // Extend previous vowel if available
      for (let j = moras.length - 1; j >= 0; j--) {
        if (moras[j].type === 'mora') {
          moras[j].dur += 0.11;
          break;
        }
      }
      continue;
    }
    if ('、，, 　・'.includes(ch)) {
      moras.push({ type: 'pause', dur: 0.085, q: false });
      continue;
    }
    if ('。！!？?'.includes(ch)) {
      const isQ = ch === '？' || ch === '?';
      if (isQ && moras.length > 0) {
        for (let j = moras.length - 1; j >= 0; j--) {
          if (moras[j].type === 'mora') { moras[j].rise = true; break; }
        }
      }
      moras.push({ type: 'pause', dur: 0.16, q: isQ });
      continue;
    }

    const base = KANA_MAP[ch];
    if (!base) continue;

    // Check Yoon (拗音: きゃ/しゃ/ちゃ/にゃ/ひゃ/みゃ/りゃ/ぎゃ/じゃ/びゃ/ぴゃ)
    if (next && 'ゃゅょぁぃぅぇぉ'.includes(next)) {
      const smallV = { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o', 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o' }[next];
      const pal = base.c === 's' ? 'sh' : (base.c === 't' ? 'ch' : (base.c === 'z' ? 'j' : (base.c === 'n' ? 'ny' : base.c)));
      moras.push({
        type: 'mora',
        c: pal,
        glide: 'ゃゅょ'.includes(next) && pal !== 'sh' && pal !== 'ch' && pal !== 'j',
        v: smallV,
        dur: 0.145
      });
      i++;
      continue;
    }

    moras.push({
      type: 'mora',
      c: base.c,
      glide: false,
      v: base.v,
      dur: base.v === 'N' ? 0.115 : 0.135
    });
  }
  return moras;
}

/** Create a soft glottal-like periodic wave (rich harmonics, warmer than raw sawtooth) */
function createGlottalWave(ctx) {
  const N = 28;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let k = 1; k < N; k++) {
    // Spectral tilt ~1/k^1.15 approximates human vocal fold spectrum
    imag[k] = 1 / Math.pow(k, 1.12);
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

/** Schedule a single consonant acoustic event (burst / frication / nasal) */
function scheduleConsonant(ctx, noiseBuf, outBus, c, vowel, tStart, fScale, baseF0, glottalWave) {
  if (!c) return 0;

  // 1. Unvoiced plosives: k, t, p
  if (c === 'k' || c === 't' || c === 'p') {
    const burstFreq = c === 't' ? 4200 : (c === 'k' ? (vowel === 'i' || vowel === 'e' ? 2900 : 1850) : 950);
    const burstDur = 0.024;
    const vot = 0.022;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(burstFreq, tStart + 0.014);
    bp.Q.value = c === 'p' ? 1.5 : 2.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, tStart + 0.012);
    g.gain.linearRampToValueAtTime(c === 'p' ? 0.34 : 0.42, tStart + 0.018);
    g.gain.exponentialRampToValueAtTime(0.001, tStart + 0.014 + burstDur + vot);
    src.connect(bp); bp.connect(g); g.connect(outBus);
    src.start(tStart + 0.012);
    src.stop(tStart + 0.016 + burstDur + vot + 0.01);
    return 0.044;
  }

  // 2. Voiced plosives: g, d, b
  if (c === 'g' || c === 'd' || c === 'b') {
    const burstFreq = c === 'd' ? 3600 : (c === 'g' ? 1900 : 850);
    // Low voice bar
    const vo = ctx.createOscillator();
    vo.type = 'sine';
    vo.frequency.setValueAtTime(baseF0 * 0.9, tStart);
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(0.001, tStart);
    vg.gain.linearRampToValueAtTime(0.28, tStart + 0.012);
    vg.gain.exponentialRampToValueAtTime(0.001, tStart + 0.036);
    vo.connect(vg); vg.connect(outBus);
    vo.start(tStart); vo.stop(tStart + 0.04);

    // Gentle release burst
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(burstFreq, tStart + 0.02); bp.Q.value = 2.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, tStart + 0.018);
    g.gain.linearRampToValueAtTime(0.24, tStart + 0.024);
    g.gain.exponentialRampToValueAtTime(0.001, tStart + 0.044);
    src.connect(bp); bp.connect(g); g.connect(outBus);
    src.start(tStart + 0.018); src.stop(tStart + 0.048);
    return 0.034;
  }

  // 3. Fricatives & Affricates: s, sh, ts, ch, h, f, z, j
  if (c === 's' || c === 'sh' || c === 'ts' || c === 'ch' || c === 'h' || c === 'f' || c === 'z' || c === 'j') {
    const isAffr = c === 'ts' || c === 'ch';
    const isVoiced = c === 'z' || c === 'j';
    const dur = isAffr ? 0.056 : (c === 'h' || c === 'f' ? 0.048 : 0.062);
    const freq =
      (c === 's' || c === 'ts' || c === 'z') ? 5400 :
      (c === 'sh' || c === 'ch' || c === 'j') ? 2950 :
      (c === 'f') ? 1450 :
      (VOWEL_FORMANTS[vowel][1] * fScale);

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = (c === 's' || c === 'ts') ? 'highpass' : 'bandpass';
    bp.frequency.setValueAtTime(freq, tStart);
    bp.Q.value = (c === 'h' || c === 'f') ? 1.8 : 3.0;

    const g = ctx.createGain();
    const onset = isAffr ? 0.016 : 0.004;
    g.gain.setValueAtTime(0.001, tStart + onset);
    g.gain.linearRampToValueAtTime(c === 'h' ? 0.24 : 0.36, tStart + onset + 0.014);
    g.gain.exponentialRampToValueAtTime(0.001, tStart + dur);
    src.connect(bp); bp.connect(g); g.connect(outBus);
    src.start(tStart + onset); src.stop(tStart + dur + 0.01);

    if (isVoiced) {
      const vo = ctx.createOscillator();
      vo.setPeriodicWave(glottalWave);
      vo.frequency.setValueAtTime(baseF0 * 0.94, tStart);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(600, tStart);
      const vg = ctx.createGain();
      vg.gain.setValueAtTime(0.001, tStart);
      vg.gain.linearRampToValueAtTime(0.28, tStart + 0.015);
      vg.gain.exponentialRampToValueAtTime(0.001, tStart + dur);
      vo.connect(lp); lp.connect(vg); vg.connect(outBus);
      vo.start(tStart); vo.stop(tStart + dur + 0.01);
    }
    return dur * 0.85;
  }

  // 4. Nasals: m, n, ny
  if (c === 'm' || c === 'n' || c === 'ny') {
    const dur = 0.046;
    const vo = ctx.createOscillator();
    vo.setPeriodicWave(glottalWave);
    vo.frequency.setValueAtTime(baseF0 * 0.96, tStart);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(280 * fScale, tStart);
    bp.Q.value = 2.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, tStart);
    g.gain.linearRampToValueAtTime(0.45, tStart + 0.012);
    g.gain.exponentialRampToValueAtTime(0.05, tStart + dur);
    vo.connect(bp); bp.connect(g); g.connect(outBus);
    vo.start(tStart); vo.stop(tStart + dur + 0.01);
    return dur * 0.8;
  }

  // 5. Japanese tap (r): short dip before vowel
  if (c === 'r') {
    return 0.022;
  }

  // 6. Glides (y, w) are handled by formant transition inside vowel
  return 0.008;
}

/**
 * Render an entire Japanese sentence into an AudioBuffer using OfflineAudioContext.
 * Returns Promise<AudioBuffer | null>.
 */
export async function renderJapaneseSpeechBuffer(text, { pitch = 1.25, rate = 1.0 } = {}) {
  const OfflineCtx = typeof window !== 'undefined' && (window.OfflineAudioContext || window.webkitOfflineAudioContext);
  if (!OfflineCtx) return null;

  const moras = parseJapaneseMoras(text);
  if (!moras.length) return null;

  const speedScale = 1 / Math.max(0.7, Math.min(1.4, rate));
  // Map TTS pitch (0.75..1.85) to clear child-friendly fundamental frequency F0 (165Hz..340Hz)
  const baseF0 = Math.max(150, Math.min(360, 215 * pitch));
  // Subtle vocal tract scaling matching character size
  const fScale = Math.max(0.90, Math.min(1.18, 0.92 + (pitch - 0.8) * 0.24));

  // Pre-compute total duration
  let totalDur = 0.06;
  for (const m of moras) totalDur += m.dur * speedScale;
  totalDur += 0.14;

  const sampleRate = 22050;
  const offCtx = new OfflineCtx(1, Math.ceil(totalDur * sampleRate), sampleRate);

  // Reusable white noise buffer for consonant bursts & fricatives
  const nLen = Math.floor(sampleRate * 0.15);
  const noiseBuf = offCtx.createBuffer(1, nLen, sampleRate);
  const nData = noiseBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;

  const glottalWave = createGlottalWave(offCtx);

  // Master gentle compressor + presence boost for crystal-clear intelligibility
  const master = offCtx.createGain();
  master.gain.value = 0.88;
  master.connect(offCtx.destination);

  let t = 0.03;
  let phraseIdx = 0;

  for (let i = 0; i < moras.length; i++) {
    const m = moras[i];
    const dur = m.dur * speedScale;

    if (m.type === 'pause' || m.type === 'sokuon') {
      t += dur;
      if (m.type === 'pause') phraseIdx = 0;
      continue;
    }

    // Japanese phrase pitch accent contour (low start -> high second mora -> gentle fall)
    const accentMult =
      m.rise ? 1.18 :
      phraseIdx === 0 ? 0.94 :
      phraseIdx === 1 ? 1.09 :
      Math.max(0.88, 1.07 - (phraseIdx - 1) * 0.028);

    const f0 = baseF0 * accentMult;
    const cOffset = scheduleConsonant(offCtx, noiseBuf, master, m.c, m.v, t, fScale, f0, glottalWave);

    // Vowel / nasal nucleus with 3 parallel formant filters (F1, F2, F3)
    const vStart = t + cOffset;
    const vDur = Math.max(0.055, dur - cOffset + 0.015);
    const [tF1, tF2, tF3] = VOWEL_FORMANTS[m.v] || VOWEL_FORMANTS.a;
    const targetF1 = tF1 * fScale;
    const targetF2 = tF2 * fScale;
    const targetF3 = tF3 * fScale;

    // Starting formants for consonant-to-vowel coarticulation transition
    let startF1 = targetF1;
    let startF2 = targetF2;
    let startF3 = targetF3;
    if (m.glide) {
      startF1 = VOWEL_FORMANTS.i[0] * fScale;
      startF2 = VOWEL_FORMANTS.i[1] * fScale;
      startF3 = VOWEL_FORMANTS.i[2] * fScale;
    } else if (m.c && CONSONANT_LOCUS[m.c]) {
      startF1 = (m.c === 'w' || m.c === 'y') ? 320 * fScale : Math.min(targetF1, 380 * fScale);
      startF2 = CONSONANT_LOCUS[m.c][0] * fScale;
      startF3 = CONSONANT_LOCUS[m.c][1] * fScale;
    }
    const transDur = (m.c === 'y' || m.c === 'w' || m.glide) ? 0.055 : 0.032;

    const osc = offCtx.createOscillator();
    osc.setPeriodicWave(glottalWave);
    osc.frequency.setValueAtTime(f0, vStart);
    osc.frequency.linearRampToValueAtTime(m.rise ? f0 * 1.15 : f0 * 0.96, vStart + vDur);

    const vGain = offCtx.createGain();
    vGain.gain.setValueAtTime(0.001, vStart);
    vGain.gain.linearRampToValueAtTime(m.v === 'N' ? 0.42 : 0.68, vStart + 0.014);
    vGain.gain.setValueAtTime(m.v === 'N' ? 0.36 : 0.62, vStart + vDur - 0.022);
    vGain.gain.exponentialRampToValueAtTime(0.001, vStart + vDur);

    // 3 parallel bandpass formant resonators (F1, F2, F3)
    const fSpecs = [
      { s: startF1, e: targetF1, q: 5.5, gain: 1.0 },
      { s: startF2, e: targetF2, q: 7.5, gain: 0.78 },
      { s: startF3, e: targetF3, q: 9.0, gain: 0.34 }
    ];

    fSpecs.forEach((fs) => {
      const bp = offCtx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = fs.q;
      bp.frequency.setValueAtTime(fs.s, vStart);
      bp.frequency.exponentialRampToValueAtTime(Math.max(120, fs.e), vStart + Math.min(transDur, vDur * 0.65));
      const fg = offCtx.createGain();
      fg.gain.value = fs.gain;
      osc.connect(bp);
      bp.connect(fg);
      fg.connect(vGain);
    });

    vGain.connect(master);
    osc.start(vStart);
    osc.stop(vStart + vDur + 0.012);

    t += dur;
    phraseIdx++;
  }

  return offCtx.startRendering();
}
