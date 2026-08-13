/**
 * Theme utilities — runtime theme switching helper.
 * Konsumer bisa panggil ini untuk override tema secara global.
 */

import type { DialogTheme } from '../types/options';

/**
 * Mengatur tema pada seluruh overlay dialog yang aktif.
 * Tambahkan data-dialog-theme pada overlay root jika perlu.
 */
export function applyTheme(element: HTMLElement, theme: DialogTheme): void {
  if (theme === 'auto') {
    element.removeAttribute('data-dialog-theme');
  } else {
    element.setAttribute('data-dialog-theme', theme);
  }
}

/**
 * Mendapatkan tema aktif saat ini berdasarkan system preference.
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}
