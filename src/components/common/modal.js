/**
 * Modal and drawer overlay components.
 */
let activeOverlay = null;

function createOverlay(type = 'modal') {
    closeOverlay();
    const overlay = document.createElement('div');
    overlay.className = `overlay overlay-${type}`;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
        <div class="${type}-panel" tabindex="-1">
            <div class="${type}-header">
                <h2 class="${type}-title"></h2>
                <button type="button" class="${type}-close" aria-label="Close">&times;</button>
            </div>
            <div class="${type}-body"></div>
            <div class="${type}-footer"></div>
        </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    activeOverlay = overlay;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
    overlay.querySelector(`.${type}-close`)?.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', onEscape);

    return overlay;
}

function onEscape(e) {
    if (e.key === 'Escape') closeOverlay();
}

export function closeOverlay() {
    if (!activeOverlay) return;
    document.removeEventListener('keydown', onEscape);
    activeOverlay.remove();
    activeOverlay = null;
    document.body.style.overflow = '';
}

export function openModal({ title = '', content = '', footer = '', size = 'md' }) {
    const overlay = createOverlay('modal');
    overlay.querySelector('.modal-panel').classList.add(`modal-${size}`);
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-body').innerHTML = content;
    overlay.querySelector('.modal-footer').innerHTML = footer;
    if (!footer) overlay.querySelector('.modal-footer').style.display = 'none';
    overlay.querySelector('.modal-panel').focus();
    return overlay;
}

export function openDrawer({ title = '', content = '', footer = '' }) {
    const overlay = createOverlay('drawer');
    overlay.querySelector('.drawer-title').textContent = title;
    overlay.querySelector('.drawer-body').innerHTML = content;
    overlay.querySelector('.drawer-footer').innerHTML = footer;
    if (!footer) overlay.querySelector('.drawer-footer').style.display = 'none';
    requestAnimationFrame(() => overlay.classList.add('open'));
    overlay.querySelector('.drawer-panel').focus();
    return overlay;
}
