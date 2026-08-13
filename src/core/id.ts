/**
 * ID generator — menghasilkan ID unik berformat `dlg-{timestamp}-{counter}`.
 * Cukup deterministik untuk debugging, tidak butuh crypto random.
 */

let counter = 0;

/**
 * Menghasilkan ID unik untuk dialog instance.
 * @returns string dalam format `dlg-{timestamp}-{counter}`
 */
export function generateId(): string {
  counter = (counter + 1) % 1_000_000;
  return `dlg-${Date.now()}-${counter}`;
}

/** Reset counter — hanya untuk keperluan testing */
export function _resetCounter(): void {
  counter = 0;
}
