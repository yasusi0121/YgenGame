export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.dryBus = null;
    this.wetBus = null;
    this.noiseBuffer = null;
    this.muted = false;
    this.unlocked = false;
  }

  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    this.ctx = ctx;

    // Master dynamics compressor for warm, clean, non-clipping output
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 18;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.16;

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.9;

    const dryBus = ctx.createGain();
    dryBus.gain.value = 0.85;

    const wetBus = ctx.createGain();
    wetBus.gain.value = 0.28;

    // Procedural warm studio room reverb (impulse response)
    const convolver = ctx.createConvolver();
    convolver.buffer = this.createReverbIR(ctx, 1.15, 2.8);

    dryBus.connect(comp);
    wetBus.connect(convolver);
    convolver.connect(comp);
    comp.connect(master);
    master.connect(ctx.destination);

    this.master = master;
    this.dryBus = dryBus;
    this.wetBus = wetBus;
    this.noiseBuffer = this.createNoiseBuffer(ctx, 0.5);

    return ctx;
  }

  unlock() {
    const ctx = this.ensureContext();
    if (!ctx || this.unlocked) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play 1-sample silent buffer to unlock iOS Safari audio
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    try {
      src.start(0);
      this.unlocked = true;
    } catch (_) {}
  }

  createNoiseBuffer(ctx, durationSec) {
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  createReverbIR(ctx, durationSec, decay) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * durationSec);
    const ir = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        // Gentle low-pass smoothing for warm wooden room feel
        const white = Math.random() * 2 - 1;
        lp = lp * 0.72 + white * 0.28;
        data[i] = lp * env;
      }
    }
    return ir;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.02);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /** Warm Marimba / Kalimba single note with rich overtones */
  playMarimbaNote(freq, startTime, duration = 0.55, volume = 0.24, brightness = 1.0) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, startTime);
    out.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Fundamental (warm triangle + sine blend)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc1b = ctx.createOscillator();
    osc1b.type = 'triangle';
    osc1b.frequency.setValueAtTime(freq * 1.002, startTime); // subtle warmth detune
    const g1b = ctx.createGain();
    g1b.gain.value = 0.35;

    // 2nd harmonic (soft wooden body)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.18 * brightness, startTime);
    g2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.45);

    // 4th harmonic (mallet strike ping)
    const osc4 = ctx.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(freq * 4, startTime);
    const g4 = ctx.createGain();
    g4.gain.setValueAtTime(0.09 * brightness, startTime);
    g4.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.07);

    osc1.connect(out);
    osc1b.connect(g1b); g1b.connect(out);
    osc2.connect(g2);   g2.connect(out);
    osc4.connect(g4);   g4.connect(out);

    out.connect(this.dryBus);
    out.connect(this.wetBus);

    [osc1, osc1b, osc2, osc4].forEach(osc => {
      osc.start(startTime);
      osc.stop(startTime + duration + 0.04);
    });
  }

  /** Tactile toy push button DOWN sound (plastic click + resonant body thump) */
  playButtonDown(variant = 'yellow') {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    // 1. Crisp micro-switch click (bandpass filtered noise burst)
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(variant === 'red' ? 2100 : 2500, now);
    bp.Q.value = 2.4;

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.28, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    noise.connect(bp);
    bp.connect(clickGain);
    clickGain.connect(this.dryBus);
    noise.start(now);
    noise.stop(now + 0.03);

    // 2. Soft hollow plastic pop (pitched sine drop)
    const pop = ctx.createOscillator();
    pop.type = 'sine';
    const baseFreq = variant === 'red' ? 185 : 225;
    pop.frequency.setValueAtTime(baseFreq, now);
    pop.frequency.exponentialRampToValueAtTime(baseFreq * 0.44, now + 0.055);

    const popGain = ctx.createGain();
    popGain.gain.setValueAtTime(0.26, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    pop.connect(popGain);
    popGain.connect(this.dryBus);
    pop.start(now);
    pop.stop(now + 0.07);
  }

  /** Tactile toy push button UP (release) sound */
  playButtonUp(variant = 'yellow') {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = variant === 'red' ? 240 : 285;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.32, now + 0.032);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    osc.connect(g);
    g.connect(this.dryBus);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /** Lamp ON harmonic celebration tailored per circuit stage (C major pentatonic) */
  playLampOn(stageId) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    // Musical chord voicings (all consonant in C major pentatonic)
    const chords = {
      wire:  [523.25, 783.99],                   // C5, G5
      not:   [587.33, 880.00],                   // D5, A5
      or:    [659.25, 783.99, 1046.50],          // E5, G5, C6
      and:   [523.25, 659.25, 783.99, 1046.50],  // C5, E5, G5, C6 (big reward!)
      xor:   [440.00, 659.25, 880.00],           // A4, E5, A5
      latch: [523.25, 659.25, 783.99, 1174.66],  // C5, E5, G5, D6 (magical harp)
    };

    const notes = chords[stageId] || chords.wire;
    const step = stageId === 'latch' ? 0.055 : (stageId === 'and' ? 0.038 : 0.025);
    const dur = stageId === 'latch' ? 0.9 : 0.62;
    const vol = 0.21 / Math.sqrt(notes.length * 0.65);

    notes.forEach((freq, i) => {
      this.playMarimbaNote(freq, now + i * step, dur, vol, stageId === 'and' ? 1.3 : 1.0);
    });
  }

  /** Lamp OFF gentle rounded sound */
  playLampOff(isLatchReset = false) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    if (isLatchReset) {
      // Soft downward 2-note release for LATCH RESET
      this.playMarimbaNote(587.33, now, 0.26, 0.14, 0.5);
      this.playMarimbaNote(392.00, now + 0.065, 0.36, 0.16, 0.45);
    } else {
      // Subtle muted wooden drop
      this.playMarimbaNote(392.00, now, 0.2, 0.08, 0.35);
    }
  }

  /** Page turn sound (gentle paper whoosh + soft woodblock) */
  playPageTurn(direction = 1) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    // Soft paper sweep
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(direction > 0 ? 700 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(direction > 0 ? 1500 : 650, now + 0.12);
    filter.Q.value = 1.2;

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.linearRampToValueAtTime(0.11, now + 0.03);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(ng);
    ng.connect(this.dryBus);
    noise.start(now);
    noise.stop(now + 0.16);

    // Light woodblock tap
    const pitch = direction > 0 ? 659.25 : 523.25;
    this.playMarimbaNote(pitch, now + 0.02, 0.18, 0.14, 0.7);
  }

  /** Menu launch chime */
  playMenuSelect() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this.playMarimbaNote(f, now + i * 0.055, 0.42, 0.19, 1.1);
    });
  }

  /** Playful boing for Coming Soon cards */
  playBoing() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(410, now + 0.28);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(this.wetBus);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  /** Tactile mechanical rocker switch snap (ON = brighter snap, OFF = deeper clack) */
  playRockerSwitch(isOn, variant = 'red') {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    // Crisp double-click plastic snap
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(isOn ? 2800 : 1850, now);
    bp.Q.value = 3.0;

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.32, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(bp);
    bp.connect(ng);
    ng.connect(this.dryBus);
    noise.start(now);
    noise.stop(now + 0.032);

    // Resonant rocker body clack
    const body = ctx.createOscillator();
    body.type = 'triangle';
    const startF = isOn ? (variant === 'red' ? 310 : 350) : (variant === 'red' ? 230 : 260);
    const endF = isOn ? startF * 1.45 : startF * 0.62;
    body.frequency.setValueAtTime(startF, now);
    body.frequency.exponentialRampToValueAtTime(endF, now + 0.048);

    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.22, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    body.connect(bg);
    bg.connect(this.dryBus);
    body.start(now);
    body.stop(now + 0.06);
  }

  /** Shift register step chime (scales nicely with lit bits) */
  playShiftStep(litCount = 1) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const scale = [392.0, 523.25, 659.25, 783.99, 1046.5];
    const freq = scale[Math.min(scale.length - 1, Math.max(0, litCount))];
    this.playMarimbaNote(freq, now, 0.34, 0.2, 1.05);
  }

  /** Decoder / Mux selection pitch (4 distinct pentatonic notes for 0..3) */
  playSlotTone(slotIndex) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const tones = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
    const f = tones[slotIndex % 4];
    this.playMarimbaNote(f, now, 0.45, 0.2, 1.0);
  }

  /** Memory write confirmation chime */
  playMemoryWrite(isOn) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    if (isOn) {
      this.playMarimbaNote(659.25, now, 0.35, 0.2, 1.15);
      this.playMarimbaNote(987.77, now + 0.05, 0.5, 0.2, 1.2);
    } else {
      this.playMarimbaNote(523.25, now, 0.28, 0.16, 0.65);
      this.playMarimbaNote(392.00, now + 0.055, 0.36, 0.16, 0.55);
    }
  }

  /** Multi-instrument synthesizer for Sound Magic (marimba / piano / sparkle / drum) */
  playInstrumentNote(instrument, freq, index = 0) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    if (instrument === 'marimba') {
      this.playMarimbaNote(freq, now, 0.65, 0.28, 1.15);
      return;
    }

    if (instrument === 'piano') {
      // Warm Rhodes-like electric piano (fundamental + 2nd + 3rd harmonic with soft bell attack)
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, now);
      out.gain.linearRampToValueAtTime(0.24, now + 0.008);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

      [1, 2, 3].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mult, now);
        const g = ctx.createGain();
        g.gain.value = idx === 0 ? 0.7 : (idx === 1 ? 0.22 : 0.08);
        osc.connect(g);
        g.connect(out);
        osc.start(now);
        osc.stop(now + 1.2);
      });
      out.connect(this.dryBus);
      out.connect(this.wetBus);
      return;
    }

    if (instrument === 'sparkle') {
      // Music box / Celesta bell (crystal clear high overtone)
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, now);
      out.gain.linearRampToValueAtTime(0.22, now + 0.005);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);

      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(freq * 2, now);
      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(freq * 4.01, now);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.18, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      o1.connect(out);
      o2.connect(g2); g2.connect(out);
      out.connect(this.dryBus);
      out.connect(this.wetBus);
      o1.start(now); o2.start(now);
      o1.stop(now + 1.4); o2.stop(now + 0.4);
      return;
    }

    // 'drum' — playful pitched percussions (tom / bongo / woodblock / shaker)
    const pitch = 110 + index * 48;
    const osc = ctx.createOscillator();
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(pitch * 1.7, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.65, now + 0.14);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(this.wetBus);
    osc.start(now);
    osc.stop(now + 0.25);

    // Crisp rim / shaker accent
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1400 + index * 380, now);
    bp.Q.value = 2.0;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.18, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    noise.connect(bp); bp.connect(ng); ng.connect(this.dryBus);
    noise.start(now); noise.stop(now + 0.065);
  }

  /** Liquid splash plop for Color Mix */
  playSplash(pitchShift = 0) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const base = 320 + pitchShift * 55;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * 0.72, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.65, now + 0.11);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.24, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(g);
    g.connect(this.dryBus);
    g.connect(this.wetBus);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /** Happy celebratory fanfare for Color Mix mission / Plus Magic correct answer */
  playSuccessFanfare() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playMarimbaNote(f, now + i * 0.075, 0.55, 0.22, 1.25);
    });
  }

  /** Gentle, friendly nudge (never harsh buzzer) */
  playGentleNudge() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    this.playMarimbaNote(349.23, now, 0.24, 0.15, 0.5);
    this.playMarimbaNote(329.63, now + 0.08, 0.28, 0.15, 0.45);
  }

  /** Counting pip that climbs up a happy major scale */
  playCountPip(stepIndex) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];
    const freq = scale[stepIndex % scale.length];
    this.playMarimbaNote(freq, now, 0.32, 0.22, 1.05);
  }

  /** Party cracker POP + sparkle fanfare */
  playCrackerPop() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;

    // Crisp party popper burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1600, now);
    bp.frequency.exponentialRampToValueAtTime(520, now + 0.09);
    bp.Q.value = 1.4;

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.42, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    noise.connect(bp); bp.connect(ng); ng.connect(this.dryBus); ng.connect(this.wetBus);
    noise.start(now); noise.stop(now + 0.12);

    // Pop thump
    const pop = ctx.createOscillator();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(260, now);
    pop.frequency.exponentialRampToValueAtTime(70, now + 0.075);
    const pg = ctx.createGain();
    pg.gain.setValueAtTime(0.32, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    pop.connect(pg); pg.connect(this.dryBus);
    pop.start(now); pop.stop(now + 0.09);

    // Joyful celebratory chord cascade
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.playMarimbaNote(f, now + 0.06 + i * 0.055, 0.72, 0.21, 1.3);
    });
  }

  /** Mechanical gear snap-in sound */
  playGearSnap(size = 'M') {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const pitch = size === 'S' ? 520 : (size === 'L' ? 280 : 390);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.055);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc.connect(g); g.connect(this.dryBus);
    osc.start(now); osc.stop(now + 0.085);
    this.playButtonDown('yellow');
  }

  /** Soft gear pop-off sound */
  playGearRemove() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.07);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(this.dryBus);
    osc.start(now); osc.stop(now + 0.09);
  }
}
