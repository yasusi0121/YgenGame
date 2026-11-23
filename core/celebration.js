import { FLAT_ICONS } from "./flat-icons.js";

export function showCelebrationOverlay(parentEl, { title = 'せいかい！', subtitle = '', centerHtml = '', btnLabel = 'つぎへ', sound, onNext }) {
  const existing = parentEl.querySelector('.celeb-overlay');
  if (existing) existing.remove();

  if (sound) sound.playCrackerPop();

  const overlay = document.createElement('div');
  overlay.className = 'celeb-overlay';
  overlay.innerHTML = `
    <div class="celeb-card">
      <div class="celeb-icons-row">
        <span class="celeb-cracker-l">${FLAT_ICONS.cracker(58)}</span>
        ${centerHtml || FLAT_ICONS.star(62)}
        <span class="celeb-cracker-r">${FLAT_ICONS.cracker(58)}</span>
      </div>
      <h3 class="celeb-title">${title}</h3>
      ${subtitle ? `<p class="celeb-sub">${subtitle}</p>` : ''}
      <button class="celeb-next-btn" type="button">
        <span>${btnLabel}</span>
        ${FLAT_ICONS.arrowRight(28)}
      </button>
    </div>
  `;

  const btn = overlay.querySelector('.celeb-next-btn');
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (sound) sound.playPageTurn(1);
    overlay.remove();
    if (onNext) onNext();
  });

  parentEl.appendChild(overlay);
}
