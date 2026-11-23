import { SoundEngine } from './sound-engine.js';
import { GAME_REGISTRY } from '../games/registry.js';

export class AppShell {
  constructor() {
    this.sound = new SoundEngine();
    this.activeGame = null;
    this.isLaunching = false;
    this.homeScreen = document.getElementById('home-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.gameGrid = document.getElementById('game-grid');
    this.gameMount = document.getElementById('game-mount');
    this.closeGameBtn = document.getElementById('close-game-btn');
    this.reloadBtn = document.getElementById('app-reload-btn');

    this.initTouchGuards();
    this.initSoundButtons();
    this.initReloadButton();
    this.initCloseButton();
    this.renderMenu();
  }

  initReloadButton() {
    if (!this.reloadBtn) return;
    this.reloadBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.unlock();
      this.reloadBtn.classList.add('is-pressed');
      this.sound.playPageTurn(1);
      const url = new URL(window.location.href);
      url.searchParams.set('r', String(Date.now()));
      setTimeout(() => {
        window.location.replace(url.toString());
      }, 120);
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
    GAME_REGISTRY.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `game-card ${item.available ? '' : 'is-coming-soon'}`;
      card.style.setProperty('--card-bg', item.bg);
      card.style.setProperty('--card-shadow', item.shadow);

      card.innerHTML = `
        <span class="card-badge">${item.badge}</span>
        <div class="card-icon-wrap">${item.iconSvg}</div>
        <div>
          <h2 class="card-title"><ruby>${item.title}<rt>${item.ruby}</rt></ruby></h2>
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
      const GameClass = await item.load();
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
