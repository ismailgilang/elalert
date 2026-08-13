/**
 * Deteksi prefers-reduced-motion media query.
 * Hasil di-cache karena query tidak berubah sering,
 * tapi bisa di-reset untuk testing.
 */

let _cached: boolean | null = null;

/**
 * Mengembalikan true jika user telah mengaktifkan reduced motion preference.
 * Memakai media query `(prefers-reduced-motion: reduce)`.
 */
export function isReducedMotion(): boolean {
  if (_cached !== null) return _cached;

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    _cached = false;
    return false;
  }

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  _cached = mq.matches;

  // Listen untuk perubahan (user bisa toggle di settings)
  mq.addEventListener('change', (e) => {
    _cached = e.matches;
  });

  return _cached;
}

/** Reset cache — hanya untuk testing */
export function _resetReducedMotionCache(): void {
  _cached = null;
}
