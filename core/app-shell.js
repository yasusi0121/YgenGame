import { SoundEngine } from './sound-engine.js';

const APP_VERSION = 'v26.6';

function getCacheVer() {
  return (typeof window !== 'undefined' && window.__YGEN_VER) ? String(window.__YGEN_VER) : APP_VERSION;
}

export class AppShell {
  constructor() {
    this.sound = new SoundEngine();
    this.activeGame = null;
    this.isLaunching = false;
    this.registry = [];
    this.homeScreen = document.getElementById('home-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.gameGrid = document.getElementById('game-grid');
    this.gameMount = document.getElementById('game-mount');
    this.closeGameBtn = document.getElementById('close-game-btn');
    this.reloadBtn = document.getElementById('app-reload-btn');

    const verEl = document.getElementById('app-version');
    if (verEl) verEl.textContent = APP_VERSION;

    this.initTouchGuards();
    this.initVisibilityGuards();
    this.initSoundButtons();
    this.initReloadButton();
    this.initCloseButton();
    this.loadRegistryAndRender();
  }

  async loadRegistryAndRender() {
    try {
      const ver = getCacheVer();
      const mod = await import(`../games/registry.js?v=${encodeURIComponent(ver)}`);
      this.registry = mod.GAME_REGISTRY || [];
      this.renderMenu();
    } catch (err) {
      if (this.gameGrid) {
        this.gameGrid.innerHTML = `<div class="noscript-banner" style="grid-column:1/-1;">メニューよみこみエラー: ${String(err && err.message ? err.message : err)}</div>`;
      }
    }
  }

  initVisibilityGuards() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sound.suspend();
        if (this.activeGame && typeof this.activeGame.onPause === 'function') {
          this.activeGame.onPause();
        }
      } else if (this.activeGame && typeof this.activeGame.onResume === 'function') {
        this.activeGame.onResume();
      }
    });
    window.addEventListener('pagehide', () => {
      this.sound.suspend();
      if (this.activeGame && typeof this.activeGame.onPause === 'function') {
        this.activeGame.onPause();
      }
    });
  }

  initReloadButton() {
    if (!this.reloadBtn) return;
    this.reloadBtn.addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.reloadBtn.classList.add('is-pressed');
      this.sound.playPageTurn(1);

      // Clear Cache Storage & any Service Workers (important for iPadOS 17 Standalone PWA)
      try {
        if ('caches' in window && window.caches && window.caches.keys) {
          const keys = await window.caches.keys();
          await Promise.all(keys.map((k) => window.caches.delete(k)));
        }
      } catch (_) {}
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (_) {}

      const ts = String(Date.now());
      const url = new URL(window.location.href);
      url.searchParams.set('r', ts);
      try {
        await fetch(url.toString(), { cache: 'reload' });
      } catch (_) {}

      window.location.replace(url.toString());
    });
  }

  initTouchGuards() {
    const unlockOnce = () => {
      this.sound.unlock();
    };
    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('touchstart', unlockOnce, { passive: true });

    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault());
  }

  initSoundButtons() {
    const btns = document.querySelectorAll('.js-sound-toggle');
    const syncUI = (muted) => {
      btns.forEach((btn) => {
        btn.classList.toggle('is-muted', muted);
        btn.querySelector('.icon-sound-on').style.display = muted ? 'none' : 'block';
        btn.querySelector('.icon-sound-off').style.display = muted ? 'block' : 'none';
      });
    };

    btns.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        const muted = this.sound.toggleMute();
        syncUI(muted);
        if (!muted) {
          this.sound.playButtonUp('yellow');
        }
      });
    });
  }

  initCloseButton() {
    this.closeGameBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.closeGameBtn.classList.add('is-pressed');
      this.sound.playPageTurn(-1);
      setTimeout(() => {
        this.closeGameBtn.classList.remove('is-pressed');
        this.exitGame();
      }, 90);
    });
  }

  renderMenu() {
    this.gameGrid.innerHTML = '';
    this.registry.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `game-card ${item.available ? '' : 'is-coming-soon'}`;
      card.style.setProperty('--card-bg', item.bg);
      card.style.setProperty('--card-shadow', item.shadow);

      card.innerHTML = `
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
        <div class="card-icon-wrap">${item.iconSvg}</div>
        <div class="card-heading">
          <h2 class="card-title">${item.title}</h2>
          <p class="card-desc">${item.desc}</p>
        </div>
        <span class="card-play-pill">
          ${item.available ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><polygon points="3,2 14,8 3,14"/></svg>' : ''}${item.cta}
        </span>
      `;

      card.addEventListener('click', () => {
        this.sound.unlock();
        if (item.available) {
          if (this.isLaunching) return;
          card.classList.add('is-pressed');
          this.sound.playMenuSelect();
          setTimeout(() => {
            card.classList.remove('is-pressed');
            this.launchGame(item);
          }, 120);
        } else {
          this.sound.playBoing();
          card.classList.remove('is-boing');
          void card.offsetWidth;
          card.classList.add('is-boing');
        }
      });

      this.gameGrid.appendChild(card);
    });
  }

  setGameBackground(color) {
    this.gameScreen.style.backgroundColor = color;
  }

  async launchGame(item) {
    if (this.isLaunching) return;
    this.isLaunching = true;
    try {
      if (this.activeGame) {
        this.activeGame.unmount();
        this.activeGame = null;
      }
      const GameClass = await item.load(getCacheVer());
      this.activeGame = new GameClass(this.gameMount, this);
      this.activeGame.mount();

      this.homeScreen.classList.add('is-hidden');
      this.gameScreen.classList.remove('is-hidden');
    } catch (err) {
      this.gameMount.innerHTML = `<div class="noscript-banner" style="margin:auto;">よみこみエラー: ${String(err && err.message ? err.message : err)}</div>`;
      this.homeScreen.classList.add('is-hidden');
      this.gameScreen.classList.remove('is-hidden');
    } finally {
      this.isLaunching = false;
    }
  }

  exitGame() {
    this.gameScreen.classList.add('is-hidden');
    this.homeScreen.classList.remove('is-hidden');
    setTimeout(() => {
      if (this.activeGame) {
        this.activeGame.unmount();
        this.activeGame = null;
      }
    }, 350);
  }
}

function bootApp() {
  try {
    if (!window.__ygenApp) {
      window.__ygenApp = new AppShell();
    }
  } catch (err) {
    const grid = document.getElementById('game-grid');
    if (grid) {
      grid.innerHTML = `<div class="noscript-banner" style="grid-column:1/-1;">起動エラー: ${String(err && err.message ? err.message : err)}</div>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
