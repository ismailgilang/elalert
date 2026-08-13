/**
 * Focus trap — membatasi Tab/Shift+Tab hanya di dalam elemen container.
 * Implementasi manual tanpa library eksternal.
 */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Mendapatkan semua elemen yang bisa di-fokus di dalam container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)].filter(
    (el) => !el.closest('[hidden]') && !el.closest('[inert]'),
  );
}

/**
 * Mengaktifkan focus trap pada container.
 * Mengembalikan fungsi cleanup untuk menghapus listener.
 */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement as HTMLElement;

    if (e.shiftKey) {
      // Shift+Tab: jika sudah di elemen pertama, pindah ke terakhir
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: jika sudah di elemen terakhir, pindah ke pertama
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);

  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
  };
}
