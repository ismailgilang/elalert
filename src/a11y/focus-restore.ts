/**
 * Focus restoration — menyimpan dan mengembalikan fokus ke elemen
 * yang aktif sebelum dialog dibuka.
 */

import type { DialogElements } from '../core/state';

let _savedElement: HTMLElement | null = null;

/**
 * Menyimpan elemen yang sedang difokus saat ini.
 * Dipanggil sebelum dialog di-mount.
 */
export function saveFocus(): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    _savedElement = active;
  }
}

/**
 * Mengembalikan fokus ke elemen yang tersimpan.
 * Dipanggil saat dialog di-unmount.
 */
export function restoreFocus(_elements: DialogElements): void {
  if (_savedElement !== null && document.body.contains(_savedElement)) {
    try {
      _savedElement.focus({ preventScroll: true });
    } catch {
      // Abaikan error jika elemen tidak bisa difokus
    }
  }
  _savedElement = null;
}
