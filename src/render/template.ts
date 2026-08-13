import type { DialogOptions } from '../types/options';
import { getIconSvg } from './icons';

/**
 * Membangun elemen icon container.
 * Mengembalikan null jika icon === 'none'.
 */
export function buildIconElement(options: DialogOptions): HTMLElement | null {
  const iconType = options.icon ?? 'none';
  if (iconType === 'none') return null;

  const wrapper = document.createElement('div');
  wrapper.className = `dlg-icon-wrap dlg-icon-wrap--${iconType}`;
  wrapper.innerHTML = getIconSvg(iconType);
  return wrapper;
}

/**
 * Membangun elemen judul dialog.
 * Mengembalikan null jika tidak ada title.
 */
export function buildTitleElement(
  options: DialogOptions,
  dialogId: string,
): HTMLElement | null {
  if (options.title === undefined || options.title.trim() === '') return null;

  const el = document.createElement('h2');
  el.id = `${dialogId}-title`;
  el.className = 'dlg-title';
  el.textContent = options.title; // plain text, bukan innerHTML — aman dari XSS
  return el;
}

/**
 * Membangun elemen pesan dialog.
 * Mengembalikan null jika tidak ada message.
 */
export function buildMessageElement(
  options: DialogOptions,
  dialogId: string,
): HTMLElement | null {
  if (options.message === undefined || options.message.trim() === '') return null;

  const el = document.createElement('p');
  el.id = `${dialogId}-desc`;
  el.className = 'dlg-message';
  el.textContent = options.message; // plain text — aman dari XSS
  return el;
}

/**
 * Membangun section action buttons.
 */
export function buildActionsElement(options: DialogOptions): {
  container: HTMLElement;
  confirmBtn: HTMLButtonElement | null;
  cancelBtn: HTMLButtonElement | null;
} {
  const container = document.createElement('div');
  container.className = 'dlg-actions';

  const iconType = options.icon ?? 'none';
  const isLoading = iconType === 'loading';

  let confirmBtn: HTMLButtonElement | null = null;
  let cancelBtn: HTMLButtonElement | null = null;

  // Tombol cancel (kiri/secondary)
  if (options.showCancelButton === true && !isLoading) {
    cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'dlg-btn dlg-btn--cancel';
    cancelBtn.textContent = options.cancelText ?? 'Batal';
    cancelBtn.setAttribute('data-dialog-action', 'cancel');
    container.appendChild(cancelBtn);
  }

  // Tombol confirm (kanan/primary) — tidak ditampilkan untuk loading atau jika showConfirmButton false
  if (!isLoading && options.showConfirmButton !== false) {
    confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'dlg-btn dlg-btn--confirm';
    confirmBtn.setAttribute(
      'data-variant',
      options.icon ?? 'default',
    );
    confirmBtn.textContent = options.confirmText ?? 'OK';
    confirmBtn.setAttribute('data-dialog-action', 'confirm');
    container.appendChild(confirmBtn);
  }

  return { container, confirmBtn, cancelBtn };
}
