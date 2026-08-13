/**
 * Animation transition helpers.
 * Semua animasi berbasis CSS class/data-attribute toggling — tidak ada JS animation library.
 * 
 * State machine: exited → entering → entered → exiting → exited
 * CSS akan merespons [data-state] attribute untuk menentukan animasi.
 */

import { isReducedMotion } from './reduced-motion';

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 * Mengatur data-state pada elemen dan mengembalikan Promise yang resolve
 * setelah transisi selesai (atau segera jika reduced-motion aktif).
 */
export function setTransitionState(
  element: HTMLElement,
  state: TransitionState,
): Promise<void> {
  return new Promise((resolve) => {
    element.setAttribute('data-state', state);

    if (isReducedMotion() || state === 'entered' || state === 'exited') {
      // Tidak perlu menunggu animasi
      resolve();
      return;
    }

    const onEnd = (e: AnimationEvent | TransitionEvent) => {
      if (e.target !== element) return;
      element.removeEventListener('animationend', onEnd as EventListener);
      element.removeEventListener('transitionend', onEnd as EventListener);
      resolve();
    };

    element.addEventListener('animationend', onEnd as EventListener, { once: true });
    element.addEventListener('transitionend', onEnd as EventListener, { once: true });

    // Fallback timeout jika event tidak fired (mis. animasi CSS di-skip)
    const fallbackDuration = state === 'entering' ? 250 : 200;
    setTimeout(resolve, fallbackDuration);
  });
}
