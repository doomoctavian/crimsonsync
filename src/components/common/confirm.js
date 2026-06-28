/**
 * Confirmation modal helper.
 */
import { openModal, closeOverlay } from './modal.js';

export function confirmAction({ title = 'Confirm Action', message = 'Are you sure?', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
        openModal({
            title,
            content: `<p class="confirm-message">${message}</p>`,
            footer: `
                <button type="button" class="btn btn-ghost" id="confirmCancel">${cancelLabel}</button>
                <button type="button" class="btn ${danger ? 'btn-primary' : 'btn-primary'}" id="confirmOk">${confirmLabel}</button>`,
        });

        document.getElementById('confirmCancel')?.addEventListener('click', () => {
            closeOverlay();
            resolve(false);
        });
        document.getElementById('confirmOk')?.addEventListener('click', () => {
            closeOverlay();
            resolve(true);
        });
    });
}
