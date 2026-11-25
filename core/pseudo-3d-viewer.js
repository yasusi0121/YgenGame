/* =========================================================================
   PSEUDO 3D VIEWER & NON-BLOCKING SIDE CELEBRATION
   Lightweight CSS 3D layered viewer (preserve-3d + translateZ) for iPad.
   Uses only transform/opacity updates (no WebGL, no drop-shadow filters).
   ========================================================================= */

import { FLAT_ICONS } from './flat-icons.js';

export function ensurePseudo3DStyles() {
  if (document.getElementById('p3d-styles-v1')) return;
  const style = document.createElement('style');
  style.id = 'p3d-styles-v1';
  style.textContent = `
    .p3d-scene {
      position: relative;
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      perspective: 920px;
      touch-action: none;
    }
    .p3d-scene.is-3d-ready {
      cursor: grab;
    }
    .p3d-scene.is-3d-ready:active {
      cursor: grabbing;
    }
    .p3d-rig {
      position: relative;
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .p3d-layer {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
      transform-style: preserve-3d;
      transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .p3d-layer > svg {
      width: 100%; height: 100%;
      display: block;
    }
    .p3d-slice {
      opacity: 0.55;
    }
    .p3d-slice-deep {
      opacity: 0.35;
    }
    .p3d-glare-wrap {
      position: absolute;
      inset: 10% 18%;
      border-radius: 28px;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .p3d-scene.is-3d-ready .p3d-glare-wrap {
      opacity: 1;
    }
    .p3d-glare {
      position: absolute;
      inset: -40%;
      background: linear-gradient(120deg, rgba(255,255,255,0) 36%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 64%);
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }
    .p3d-hint-chip {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.72);
      color: #F8FAFC;
      border: 2px solid rgba(255, 255, 255, 0.65);
      border-radius: 999px;
      padding: 4px 14px;
      font-family: var(--font-rounded);
      font-size: 12.5px;
      font-weight: 900;
      pointer-events: none;
      white-space: nowrap;
      transition: opacity 0.4s ease;
      z-index: 5;
    }
    .p3d-hint-chip.is-hidden {
      opacity: 0;
    }

    /* Non-blocking side cracker celebration (never covers center!) */
    .p3d-side-celeb {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 25;
    }
    .p3d-side-burst {
      position: absolute;
      top: 22%;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      animation: p3dBurst 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .p3d-side-burst.is-left  { left: 16px; }
    .p3d-side-burst.is-right { right: 16px; }
    @keyframes p3dBurst {
      0%   { opacity: 0; transform: translateY(24px) scale(0.5); }
      18%  { opacity: 1; transform: translateY(-6px) scale(1.12); }
      72%  { opacity: 1; transform: translateY(-12px) scale(1); }
      100% { opacity: 0; transform: translateY(-28px) scale(0.92); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show lightweight cracker & star celebration on left/right edges only,
 * leaving the completed creation in the center 100% unobstructed.
 */
export function showSideCelebration(rootEl) {
  if (!rootEl) return;
  ensurePseudo3DStyles();
  const prev = rootEl.querySelector('.p3d-side-celeb');
  if (prev) prev.remove();

  const wrap = document.createElement('div');
  wrap.className = 'p3d-side-celeb';
  wrap.innerHTML = `
    <div class="p3d-side-burst is-left">
      ${FLAT_ICONS.sparkle(34)}
      ${FLAT_ICONS.cracker(58)}
    </div>
    <div class="p3d-side-burst is-right">
      ${FLAT_ICONS.sparkle(34)}
      <div style="transform:scaleX(-1);">${FLAT_ICONS.cracker(58)}</div>
    </div>
  `;
  rootEl.appendChild(wrap);
  setTimeout(() => {
    if (wrap.parentNode) wrap.remove();
  }, 2350);
}

/**
 * Build stacked Z-axis SVG layers inside a preserve-3d rig.
 * layers: [{ z: number, html: string, cls?: string }]
 */
export function buildLayeredRigHtml(layers, viewBox, svgClass = '') {
  const layerHtml = layers.map((l) => `
    <div class="p3d-layer ${l.cls || ''}" data-z="${l.z}" style="transform:translateZ(${l.z}px);">
      <svg class="${svgClass}" viewBox="${viewBox}" aria-hidden="true">${l.html}</svg>
    </div>
  `).join('');

  return `
    ${layerHtml}
    <div class="p3d-layer" data-z="44" style="transform:translateZ(44px);">
      <div class="p3d-glare-wrap"><div class="p3d-glare"></div></div>
    </div>
  `;
}

/**
 * Interactive pointer-drag 3D turntable / tilt controller with smooth inertia.
 * Throttled to ~30fps (32ms) during inertia and stops rAF completely at rest.
 */
export class Pseudo3DController {
  constructor(sceneEl, rigEl, { maxYaw = 58, maxPitch = 36, onFirstDrag = null } = {}) {
    ensurePseudo3DStyles();
    this.sceneEl = sceneEl;
    this.rigEl = rigEl;
    this.maxYaw = maxYaw;
    this.maxPitch = maxPitch;
    this.onFirstDrag = onFirstDrag;

    this.enabled = false;
    this.exploded = false;
    this.dragging = false;
    this.hasDragged = false;

    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.velYaw = 0;
    this.velPitch = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.rafId = null;
    this.lastTick = 0;

    this._onDown = (e) => this.handleDown(e);
    this._onMove = (e) => this.handleMove(e);
    this._onUp = () => this.handleUp();

    this.sceneEl.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    this.sceneEl.classList.toggle('is-3d-ready', this.enabled);
    if (!this.enabled) {
      this.stopLoop();
      this.dragging = false;
      this.hasDragged = false;
      this.exploded = false;
      this.yaw = 0;
      this.pitch = 0;
      this.targetYaw = 0;
      this.targetPitch = 0;
      this.velYaw = 0;
      this.velPitch = 0;
      this.rigEl.style.transform = '';
    }
  }

  introPose(yaw = -18, pitch = 10) {
    if (!this.enabled) return;
    this.targetYaw = this.clamp(yaw, -this.maxYaw, this.maxYaw);
    this.targetPitch = this.clamp(pitch, -this.maxPitch, this.maxPitch);
    this.velYaw = 0;
    this.velPitch = 0;
    this.startLoop();
  }

  resetView() {
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.velYaw = 0;
    this.velPitch = 0;
    if (this.enabled) this.startLoop();
  }

  setExploded(exploded) {
    this.exploded = !!exploded;
    this.applyLayerDepths();
  }

  applyLayerDepths() {
    const mult = this.exploded ? 2.15 : 1.0;
    this.rigEl.querySelectorAll('.p3d-layer[data-z]').forEach((el) => {
      const baseZ = Number(el.dataset.z) || 0;
      el.style.transform = `translateZ(${(baseZ * mult).toFixed(1)}px)`;
    });
  }

  applyTransform() {
    this.rigEl.style.transform = `rotateX(${this.pitch.toFixed(2)}deg) rotateY(${this.yaw.toFixed(2)}deg)`;
    const glare = this.rigEl.querySelector('.p3d-glare');
    if (glare) {
      const gx = (-this.yaw * 1.1).toFixed(1);
      const gy = (this.pitch * 1.1).toFixed(1);
      glare.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    }
  }

  handleDown(e) {
    if (!this.enabled) return;
    e.preventDefault();
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.velYaw = 0;
    this.velPitch = 0;
    if (!this.hasDragged) {
      this.hasDragged = true;
      if (this.onFirstDrag) this.onFirstDrag();
    }
  }

  handleMove(e) {
    if (!this.dragging || !this.enabled) return;
    e.preventDefault();
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    this.yaw = this.clamp(this.yaw + dx * 0.42, -this.maxYaw, this.maxYaw);
    this.pitch = this.clamp(this.pitch - dy * 0.34, -this.maxPitch, this.maxPitch);
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;
    this.velYaw = dx * 0.28;
    this.velPitch = -dy * 0.22;
    this.applyTransform();
  }

  handleUp() {
    if (!this.dragging) return;
    this.dragging = false;
    if (Math.abs(this.velYaw) > 0.25 || Math.abs(this.velPitch) > 0.25) {
      this.startLoop();
    }
  }

  startLoop() {
    if (this.rafId) return;
    this.lastTick = performance.now();
    const step = (now) => {
      if (!this.enabled || document.hidden) {
        this.rafId = null;
        return;
      }
      if (now - this.lastTick < 32) {
        this.rafId = requestAnimationFrame(step);
        return;
      }
      this.lastTick = now;

      let moving = false;
      if (!this.dragging) {
        if (Math.abs(this.velYaw) > 0.12 || Math.abs(this.velPitch) > 0.12) {
          this.yaw = this.clamp(this.yaw + this.velYaw, -this.maxYaw, this.maxYaw);
          this.pitch = this.clamp(this.pitch + this.velPitch, -this.maxPitch, this.maxPitch);
          this.targetYaw = this.yaw;
          this.targetPitch = this.pitch;
          this.velYaw *= 0.84;
          this.velPitch *= 0.84;
          moving = true;
        } else {
          const dyaw = this.targetYaw - this.yaw;
          const dpitch = this.targetPitch - this.pitch;
          if (Math.abs(dyaw) > 0.15 || Math.abs(dpitch) > 0.15) {
            this.yaw += dyaw * 0.24;
            this.pitch += dpitch * 0.24;
            moving = true;
          } else {
            this.yaw = this.targetYaw;
            this.pitch = this.targetPitch;
          }
        }
        this.applyTransform();
      }

      if (moving) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  destroy() {
    this.stopLoop();
    this.sceneEl.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
  }
}
