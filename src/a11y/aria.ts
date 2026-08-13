/**
 * ARIA attribute management untuk dialog elements.
 * Memastikan setiap dialog memenuhi WAI-ARIA Dialog Pattern.
 */

import type { DialogElements } from '../core/state';
import type { DialogOptions } from '../types/options';

/**
 * Mengaplikasikan semua ARIA attributes yang diperlukan ke container dialog.
 *
 * - `role="alertdialog"` untuk dialog kritikal (error, confirm destruktif)
 * - `role="dialog"` untuk dialog non-kritikal
 * - `aria-modal="true"` untuk memberitahu screen reader bahwa konten luar tidak relevan
 * - `aria-labelledby` mengarah ke elemen judul
 * - `aria-describedby` mengarah ke elemen pesan
 */
export function setupAria(elements: DialogElements, options: DialogOptions): void {
  const { container, title, message } = elements;
  const icon = options.icon ?? 'none';

  // Pilih role berdasarkan tipe dialog
  const isAlertDialog = icon === 'error' || icon === 'warning';
  container.setAttribute('role', isAlertDialog ? 'alertdialog' : 'dialog');
  container.setAttribute('aria-modal', 'true');

  if (title !== null) {
    container.setAttribute('aria-labelledby', title.id);
  }

  if (message !== null) {
    container.setAttribute('aria-describedby', message.id);
  }

  // Live region untuk loading dialog agar screen reader membaca update
  if (icon === 'loading') {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'dlg-sr-only';
    liveRegion.textContent = options.message ?? '';
    container.appendChild(liveRegion);
  }
}
