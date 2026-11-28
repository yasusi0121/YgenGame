import {
  FONT_ROUND,
  COMB_NOTES,
  PRESET_SONGS,
  buildMusicBoxDefsSvg,
  renderGearSvg
} from './musicbox-lab-assets.js';

const STEPS = 16;

export default class MusicBoxLabGame {
  constructor(mountEl, app) {
    this.mountEl = mountEl;
    this.app = app;
    this.sound = (app && app.sound) ? app.sound : app;

    this.mode = 'compose'; // 'compose' | 'repair'
    this.songIdx = 0;

    this.grid = Array.from({ length: STEPS }, () => Array(8).fill(false));
    this.missingTargets = [];
    this.repairCleared = false;

    this.springPower = 0.8;
    this.keyAngle = 0;
    this.windAccumDeg = 0;
    this.tempoScale = 1.0; // 0.5x .. 2.2x controlled by governor brake lever!
    this.playhead = 0;
    this.lastStepTriggered = -1;
    this.combVibrations = Array(8).fill(0);
    this.gearAngle = 0;
    this.governorAngle = 0;

    // Active drag: { kind: 'wind'|'pin'|'speed'|'gliss', lastAng?, lastNote?, x, y }
    this.drag = null;

    this.rafId = null;
    this.lastFrame = 0;
    this.paused = false;
    this.destroyed = false;

    this._onMove = (e) => this.handlePointerMove(e);
    this._onUp = (e) => this.handlePointerUp(e);
  }

  mount() {
    if (this.app && typeof this.app.setGameBackground === 'function') {
      this.app.setGameBackground('#3B3B5C');
    }
    this.injectStyles();
    this.renderShell();
    this.loadSong(0);
    this.renderScene();
    this.ensureLoop();
  }

  onPause() {
    this.paused = true;
    this.stopLoop();
  }

  onResume() {
    this.paused = false;
    if (this.needsLoop()) this.ensureLoop();
  }

  unmount() {
    this.destroyed = true;
    this.stopLoop();
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    if (this.mountEl) this.mountEl.innerHTML = '';
  }

  injectStyles() {
    const old = document.getElementById('mb-styles');
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = 'mb-styles';
    style.textContent = `
      .mb-root {
        display: flex; flex-direction: column; width: 100%; height: 100%;
        background: #3B3B5C; color: #FFFFFF; user-select: none; -webkit-user-select: none;
        padding: calc(12px + var(--safe-top, 0px)) 16px calc(10px + var(--safe-bottom, 0px));
        box-sizing: border-box; gap: 6px; overflow: hidden;
      }
      .mb-topbar {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        flex-wrap: wrap; padding-left: 56px; padding-right: 56px; min-height: 44px;
      }
      .mb-modes {
        display: flex; gap: 4px; background: rgba(255,255,255,0.16); padding: 4px;
        border-radius: 999px; border: 2px solid rgba(255,255,255,0.26);
      }
      .mb-mode-btn {
        border: none; border-radius: 999px; padding: 6px 15px; font-size: 14px; font-weight: 800;
        background: transparent; color: rgba(255,255,255,0.88); cursor: pointer; font-family: inherit;
      }
      .mb-mode-btn.active { background: #FFFFFF; color: #3B3B5C; box-shadow: 0 3px 0 rgba(0,0,0,0.12); }

      .mb-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.16); border: 2px solid rgba(255,255,255,0.26);
        border-radius: 999px; padding: 5px 14px;
      }
      .mb-hint { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .mb-song-btn {
        border: none; border-radius: 999px; padding: 4px 12px;
        background: #F7C948; color: #3B3B5C; font-size: 12px; font-weight: 900;
        cursor: pointer; font-family: inherit;
      }
      .mb-stage-wrap {
        position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
      }
      .mb-svg { width: 100%; height: 100%; max-width: 980px; display: block; touch-action: none; }
      @media (max-width: 640px) {
        .mb-root { padding: 8px 6px; }
        .mb-topbar { padding-left: 44px; padding-right: 44px; gap: 6px; }
        .mb-mode-btn { padding: 5px 10px; font-size: 12px; }
        .mb-hint { font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
  }

  renderShell() {
    this.mountEl.innerHTML = `
      <div class="mb-root">
        <div class="mb-topbar">
          <div class="mb-modes">
            <button class="mb-mode-btn active" data-mode="compose" type="button">じゆう さっきょく</button>
            <button class="mb-mode-btn" data-mode="repair" type="button">めいきょく しゅうり</button>
          </div>
          <div class="mb-pill">
            <span class="mb-hint" id="mb-hint">カギを グルグル まいて ピンを ドラッグで さそう！</span>
            <button class="mb-song-btn" id="mb-song-btn" type="button">きらきらぼし</button>
          </div>
        </div>
        <div class="mb-stage-wrap">
          <svg class="mb-svg" id="mb-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            ${buildMusicBoxDefsSvg()}
            <g id="mb-scene"></g>
          </svg>
        </div>
      </div>
    `;

    this.svgEl = this.mountEl.querySelector('#mb-svg');
    this.sceneEl = this.mountEl.querySelector('#mb-scene');
    this.hintEl = this.mountEl.querySelector('#mb-hint');
    this.songBtn = this.mountEl.querySelector('#mb-song-btn');

    this.mountEl.querySelectorAll('.mb-mode-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.sound.playPageTurn(1);
        const m = btn.dataset.mode;
        if (m === this.mode) return;
        this.mode = m;
        this.mountEl.querySelectorAll('.mb-mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
        this.loadSong(this.songIdx);
      });
    });

    this.songBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.sound.playPageTurn(1);
      this.songIdx = (this.songIdx + 1) % PRESET_SONGS.length;
      this.loadSong(this.songIdx);
    });

    this.svgEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  getSvgPoint(e) {
    const rect = this.svgEl.getBoundingClientRect();
    const aspectView = 800 / 500;
    const aspectRect = rect.width / Math.max(1, rect.height);
    let x, y;
    if (aspectRect > aspectView) {
      const rw = rect.height * aspectView;
      x = ((e.clientX - rect.left - (rect.width - rw) / 2) / rw) * 800;
      y = ((e.clientY - rect.top) / rect.height) * 500;
    } else {
      const rh = rect.width / aspectView;
      x = ((e.clientX - rect.left) / rect.width) * 800;
      y = ((e.clientY - rect.top - (rect.height - rh) / 2) / rh) * 500;
    }
    return { x, y };
  }

  handlePointerDown(e) {
    const target = e.target.closest('[data-act]');
    if (!target) return;
    e.preventDefault();
    this.sound.unlock();
    const act = target.dataset.act;
    const pt = this.getSvgPoint(e);

    if (act === 'wind-key') {
      // Circular rotary drag winding on the brass butterfly key (cx=138, cy=162)!
      this.drag = { kind: 'wind', lastAng: Math.atan2(pt.y - 162, pt.x - 138), x: pt.x, y: pt.y };
      this.windAccumDeg = 0;
    } else if (act === 'grab-pin') {
      // Grab a fresh brass pin from the left pin dish to insert into any cylinder hole!
      this.drag = { kind: 'pin', x: pt.x, y: pt.y };
      this.sound.playMetalClick();
      this.renderScene();
    } else if (act === 'drag-speed') {
      this.drag = { kind: 'speed', x: pt.x, y: pt.y };
      this.updateSpeedFromY(pt.y);
    } else if (act === 'toggle-pin') {
      const s = Number(target.dataset.step);
      const n = Number(target.dataset.note);
      this.togglePin(s, n);
    } else if (act === 'pluck-tooth') {
      const n = Number(target.dataset.note);
      this.drag = { kind: 'gliss', lastNote: n, x: pt.x, y: pt.y };
      this.combVibrations[n] = 1.0;
      this.playMusicBoxNote(COMB_NOTES[n].freq);
      this.renderScene();
      this.ensureLoop();
    } else if (act === 'clear-pins') {
      this.grid = Array.from({ length: STEPS }, () => Array(8).fill(false));
      this.sound.playPageTurn(-1);
      this.hintEl.textContent = 'まっさら！ さらから ピンを ドラッグして さそう！';
      this.renderScene();
    }
  }

  handlePointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const pt = this.getSvgPoint(e);
    this.drag.x = pt.x;
    this.drag.y = pt.y;

    if (this.drag.kind === 'wind') {
      const ang = Math.atan2(pt.y - 162, pt.x - 138);
      let diff = ((ang - this.drag.lastAng) * 180) / Math.PI;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      this.drag.lastAng = ang;

      const absDiff = Math.abs(diff);
      this.keyAngle = (this.keyAngle + diff) % 360;
      this.springPower = Math.min(1, this.springPower + absDiff / 420);
      this.windAccumDeg += absDiff;
      if (this.windAccumDeg >= 32) {
        this.windAccumDeg -= 32;
        this.playWindRatchet();
      }
      this.renderScene();
      this.ensureLoop();
    } else if (this.drag.kind === 'pin') {
      this.renderScene();
    } else if (this.drag.kind === 'speed') {
      this.updateSpeedFromY(pt.y);
    } else if (this.drag.kind === 'gliss') {
      // Glissando strumming across the 8 steel comb teeth (x: 216..584, y: 318..435)!
      if (pt.x >= 216 && pt.x <= 584 && pt.y >= 312 && pt.y <= 440) {
        const noteIdx = Math.max(0, Math.min(7, Math.floor((pt.x - 216) / (368 / 8))));
        if (noteIdx !== this.drag.lastNote) {
          this.drag.lastNote = noteIdx;
          this.combVibrations[noteIdx] = 1.0;
          this.playMusicBoxNote(COMB_NOTES[noteIdx].freq);
          this.renderScene();
          this.ensureLoop();
        }
      }
    }
  }

  handlePointerUp() {
    if (!this.drag) return;
    const d = this.drag;
    this.drag = null;

    if (d.kind === 'pin') {
      // Snap dragged brass pin into the nearest cylinder hole (x: 216..584, y: 66..314)
      if (d.x >= 216 && d.x <= 584 && d.y >= 66 && d.y <= 314) {
        const n = Math.max(0, Math.min(7, Math.floor((d.x - 216) / (368 / 8))));
        const s = Math.max(0, Math.min(STEPS - 1, Math.floor((d.y - 66) / (248 / STEPS))));
        if (!this.grid[s][n]) {
          this.togglePin(s, n);
        }
      }
      this.renderScene();
    }
  }

  updateSpeedFromY(y) {
    // Vertical governor speed slider on right (y: 266 slow -> 394 fast)
    const ratio = Math.max(0, Math.min(1, (y - 266) / 128));
    this.tempoScale = 0.5 + ratio * 1.7;
    this.renderScene();
  }

  loadSong(idx) {
    const song = PRESET_SONGS[idx % PRESET_SONGS.length];
    this.songBtn.textContent = song.name;
    this.grid = Array.from({ length: STEPS }, () => Array(8).fill(false));
    this.repairCleared = false;
    this.missingTargets = [];

    const missingSet = new Set(song.missing.map(([s, n]) => `${s},${n}`));
    song.pins.forEach(([s, n]) => {
      if (this.mode === 'repair' && missingSet.has(`${s},${n}`)) {
        this.missingTargets.push([s, n]);
      } else {
        this.grid[s][n] = true;
      }
    });

    this.springPower = Math.max(0.65, this.springPower);
    this.hintEl.textContent = this.mode === 'repair'
      ? `${song.name}：さらから ピンを ドラッグして てんせんに さそう！`
      : `${song.name}：カギを グルグル まいて ピンを さしてみよう！`;
    this.renderScene();
    this.ensureLoop();
  }

  togglePin(s, n) {
    if (this.mode === 'repair') {
      const isMissing = this.missingTargets.some(([ms, mn]) => ms === s && mn === n);
      if (!isMissing && this.grid[s][n]) return;
    }
    this.grid[s][n] = !this.grid[s][n];
    if (this.grid[s][n]) {
      this.combVibrations[n] = 1.0;
      this.playMusicBoxNote(COMB_NOTES[n].freq);
    } else {
      this.sound.playMetalClick();
    }

    if (this.mode === 'repair' && !this.repairCleared) {
      if (this.missingTargets.every(([ms, mn]) => this.grid[ms][mn])) {
        this.repairCleared = true;
        this.springPower = 1.0;
        this.sound.playCrackerPop();
        this.hintEl.textContent = 'なおった！ きれいな メロディが ながれるよ♪';
      }
    }
    this.renderScene();
    this.ensureLoop();
  }

  needsLoop() {
    return this.springPower > 0.005 || this.combVibrations.some((v) => v > 0.01);
  }

  ensureLoop() {
    if (this.rafId || this.paused || this.destroyed) return;
    this.lastFrame = performance.now();
    const tick = (now) => {
      if (this.destroyed || this.paused) { this.rafId = null; return; }
      if (now - this.lastFrame >= 32) {
        const dt = Math.min(0.06, (now - this.lastFrame) / 1000);
        this.lastFrame = now;
        this.step(dt);
      }
      if (this.needsLoop()) this.rafId = requestAnimationFrame(tick);
      else this.rafId = null;
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  step(dt) {
    if (this.springPower > 0.005) {
      const lowSlow = this.springPower < 0.12 ? (0.4 + this.springPower * 5) : 1.0;
      const spd = this.tempoScale * lowSlow;
      this.springPower = Math.max(0, this.springPower - dt * 0.02 * spd);
      this.playhead = (this.playhead + dt * 3.4 * spd) % STEPS;
      this.gearAngle = (this.gearAngle + dt * 55 * spd) % 360;
      this.governorAngle = (this.governorAngle + dt * 560 * spd) % 360;

      const curStep = Math.floor(this.playhead);
      if (curStep !== this.lastStepTriggered) {
        this.lastStepTriggered = curStep;
        for (let n = 0; n < 8; n++) {
          if (this.grid[curStep][n]) {
            this.combVibrations[n] = 1.0;
            this.playMusicBoxNote(COMB_NOTES[n].freq);
          }
        }
      }
      if (this.springPower <= 0.005) {
        this.hintEl.textContent = 'ぜんまいが きれたよ！ カギを グルグル まこう！';
      }
    }

    for (let n = 0; n < 8; n++) {
      if (this.combVibrations[n] > 0) this.combVibrations[n] = Math.max(0, this.combVibrations[n] - dt * 3.8);
    }
    this.renderScene();
  }

  renderScene() {
    const activeStep = Math.floor(this.playhead);
    const cylX = 216;
    const cylY = 66;
    const cylW = 368;
    const cylH = 248;
    const colW = cylW / 8;
    const rowH = cylH / STEPS;

    let pinCellsSvg = '';
    for (let s = 0; s < STEPS; s++) {
      const ry = cylY + s * rowH;
      if (s === activeStep && this.springPower > 0.005) {
        pinCellsSvg += `<rect x="${cylX + 4}" y="${ry.toFixed(1)}" width="${cylW - 8}" height="${rowH.toFixed(1)}" rx="5" fill="rgba(255,255,255,0.34)"/>`;
      }
      for (let n = 0; n < 8; n++) {
        const cx = cylX + n * colW + colW / 2;
        const cy = ry + rowH / 2;
        const hasPin = this.grid[s][n];
        const isMissing = this.mode === 'repair' && !hasPin && this.missingTargets.some(([ms, mn]) => ms === s && mn === n);
        pinCellsSvg += `
          <g data-act="toggle-pin" data-step="${s}" data-note="${n}" style="cursor:pointer;">
            <rect x="${(cx - colW / 2 + 2).toFixed(1)}" y="${ry.toFixed(1)}" width="${(colW - 4).toFixed(1)}" height="${rowH.toFixed(1)}" fill="transparent"/>
            ${hasPin ? `
              <circle cx="${cx.toFixed(1)}" cy="${(cy + 1.5).toFixed(1)}" r="5.5" fill="rgba(120,70,10,0.35)"/>
              <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5.5" fill="${COMB_NOTES[n].color}"/>
              <circle cx="${(cx - 1.5).toFixed(1)}" cy="${(cy - 1.5).toFixed(1)}" r="1.8" fill="#FFFFFF" opacity="0.8"/>
            ` : isMissing ? `
              <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-dasharray="3 2"/>
            ` : `
              <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2" fill="rgba(146,100,20,0.28)"/>
            `}
          </g>
        `;
      }
    }

    const combSvg = COMB_NOTES.map((note, n) => {
      const cx = cylX + n * colW + colW / 2;
      const vib = this.combVibrations[n];
      const wobble = vib > 0 ? Math.sin(vib * Math.PI * 6) * 3.5 : 0;
      const topY = 324;
      return `
        <g data-act="pluck-tooth" data-note="${n}" style="cursor:pointer;">
          <rect x="${(cx - 11 + wobble).toFixed(1)}" y="${topY}" width="22" height="${note.toothLen}" rx="7"
            fill="${vib > 0.15 ? note.color : 'url(#mb-steel)'}"/>
          <circle cx="${(cx + wobble).toFixed(1)}" cy="${topY + 12}" r="4.5" fill="${note.color}"/>
          <text x="${cx.toFixed(1)}" y="${topY + note.toothLen + 18}" text-anchor="middle" font-size="12" font-weight="900" fill="rgba(255,255,255,0.88)" font-family="${FONT_ROUND}">${note.name}</text>
        </g>
      `;
    }).join('');

    const govScale = Math.cos((this.governorAngle * Math.PI) / 180);
    const speedKnobY = 266 + ((this.tempoScale - 0.5) / 1.7) * 128;

    this.sceneEl.innerHTML = `
      <rect x="44" y="42" width="712" height="422" rx="34" fill="#8C5A2B"/>
      <rect x="44" y="32" width="712" height="422" rx="34" fill="url(#mb-wood)"/>
      <rect x="66" y="52" width="668" height="382" rx="24" fill="#2B2B45"/>

      <!-- LEFT TOP: Rotary Drag Brass Winding Key (drag in circles!) -->
      <g data-act="wind-key" style="cursor:grab;" transform="translate(138 162)">
        ${this.springPower < 0.18 ? `<circle cx="0" cy="0" r="56" fill="none" stroke="#FFE484" stroke-width="4" stroke-dasharray="10 8"/>` : ''}
        <circle cx="0" cy="0" r="46" fill="#212138"/>
        <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="8"/>
        <circle cx="0" cy="0" r="40" fill="none" stroke="#F7C948" stroke-width="8" stroke-linecap="round"
          stroke-dasharray="${(this.springPower * 251).toFixed(1)} 251" transform="rotate(-90)"/>
        <g transform="rotate(${this.keyAngle.toFixed(0)})">
          <ellipse cx="-20" cy="0" rx="18" ry="12" fill="#E5A931"/>
          <ellipse cx="20"  cy="0" rx="18" ry="12" fill="#E5A931"/>
          <ellipse cx="-20" cy="-2" rx="15" ry="9" fill="#FFE484"/>
          <ellipse cx="20"  cy="-2" rx="15" ry="9" fill="#FFE484"/>
          <circle cx="0" cy="0" r="10" fill="#FFFFFF"/>
        </g>
        <text x="0" y="64" text-anchor="middle" font-size="12" font-weight="900" fill="#FFE484" font-family="${FONT_ROUND}">グルグル まこう</text>
      </g>

      <!-- LEFT BOTTOM: Brass Pin Dish (grab & drag a pin directly onto the cylinder!) -->
      <g data-act="grab-pin" style="cursor:grab;" transform="translate(138 308)">
        <circle cx="0" cy="4" r="38" fill="#1E1E33"/>
        <circle cx="0" cy="0" r="38" fill="#3B3B5C" stroke="rgba(255,228,132,0.4)" stroke-width="2.5"/>
        <circle cx="-12" cy="-8" r="6" fill="#F05A5B"/>
        <circle cx="10"  cy="-10" r="6" fill="#F7C948"/>
        <circle cx="0"   cy="6"   r="6" fill="#56CCF2"/>
        <circle cx="-12" cy="12"  r="6" fill="#5CD68D"/>
        <circle cx="14"  cy="10"  r="6" fill="#FF8FB1"/>
        <text x="0" y="54" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="${FONT_ROUND}">ピン さら</text>
      </g>

      ${this.mode === 'compose' ? `
        <g data-act="clear-pins" style="cursor:pointer;" transform="translate(138 398)">
          <rect x="-44" y="-14" width="88" height="30" rx="15" fill="rgba(255,255,255,0.14)"/>
          <text x="0" y="5" text-anchor="middle" font-size="11.5" font-weight="800" fill="#FFFFFF" font-family="${FONT_ROUND}">ぜんぶ けす</text>
        </g>
      ` : ''}

      <!-- CENTER: Rotating Brass Pin Cylinder + Plucking Steel Comb -->
      <rect x="${cylX}" y="${cylY}" width="${cylW}" height="${cylH}" rx="18" fill="url(#mb-brass-cyl)"/>
      <rect x="${cylX - 10}" y="${cylY + 14}" width="12" height="${cylH - 28}" rx="6" fill="#C89322"/>
      <rect x="${cylX + cylW - 2}" y="${cylY + 14}" width="12" height="${cylH - 28}" rx="6" fill="#C89322"/>
      ${pinCellsSvg}
      <rect x="${cylX + 4}" y="318" width="${cylW - 8}" height="16" rx="8" fill="#94A3B8"/>
      ${combSvg}

      <!-- RIGHT: Gear Train + Spinning Governor + Direct Speed Brake Lever! -->
      ${renderGearSvg(650, 126, 30, 12, '#F7C948', this.gearAngle)}
      ${renderGearSvg(684, 188, 22, 10, '#E2E8F0', -this.gearAngle * 1.4)}
      <!-- Governor Air-Brake Vane -->
      <g transform="translate(636 218)">
        <rect x="-3.5" y="-26" width="7" height="52" rx="3.5" fill="#CBD5E1"/>
        <rect x="${(-22 * Math.abs(govScale)).toFixed(1)}" y="-12" width="${(44 * Math.abs(govScale)).toFixed(1)}" height="24" rx="5" fill="#56CCF2" opacity="0.88"/>
        <circle cx="0" cy="0" r="6" fill="#F7C948"/>
      </g>

      <!-- Direct Sliding Speed Control Lever (drag UP/DOWN to change tempo live!) -->
      <g data-act="drag-speed" style="cursor:ns-resize;">
        <rect x="654" y="262" width="16" height="136" rx="8" fill="#212138"/>
        <rect x="658" y="266" width="8" height="${(speedKnobY - 266).toFixed(1)}" rx="4" fill="#56CCF2"/>
        <circle cx="662" cy="${speedKnobY.toFixed(1)}" r="16" fill="#FFFFFF"/>
        <circle cx="662" cy="${speedKnobY.toFixed(1)}" r="7" fill="#56CCF2"/>
        <text x="662" y="418" text-anchor="middle" font-size="11.5" font-weight="900" fill="rgba(255,255,255,0.85)" font-family="${FONT_ROUND}">はやさ</text>
      </g>

      <!-- Actively Dragged Brass Pin -->
      ${this.drag && this.drag.kind === 'pin' ? `
        <g transform="translate(${this.drag.x.toFixed(1)} ${this.drag.y.toFixed(1)})" pointer-events="none">
          <circle cx="0" cy="0" r="9" fill="#FFE484"/>
          <circle cx="-2.5" cy="-2.5" r="3" fill="#FFFFFF"/>
        </g>
      ` : ''}
    `;
  }

  /* Authentic Bell-Like Music Box Comb Web Audio Synthesizer */
  playMusicBoxNote(freq) {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { mult: 1, gain: 0.22, dur: 0.72 },
      { mult: 2.756, gain: 0.06, dur: 0.22 }
    ].forEach((p) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.mult, now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(p.gain, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, now + p.dur);
      osc.connect(g); g.connect(this.sound.wetBus || this.sound.dryBus);
      osc.start(now); osc.stop(now + p.dur + 0.02);
    });
  }

  playWindRatchet() {
    const ctx = this.sound && this.sound.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(860, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.03);
    g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(g); g.connect(this.sound.dryBus);
    osc.start(now); osc.stop(now + 0.04);
  }
}
