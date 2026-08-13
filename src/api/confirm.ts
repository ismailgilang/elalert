import { openDialog } from '../core/controller';
import type { DialogOptions } from '../types/options';
import type { DialogHandle, DialogResult } from '../types/result';

export interface ConfirmOptions extends Omit<DialogOptions, 'showCancelButton'> {
  confirmText?: string;
  cancelText?: string;
}

/**
 * Membuka dialog konfirmasi dan mengembalikan Promise yang resolve
 * dengan DialogResult saat pengguna memilih.
 *
 * @example
 * ```ts
 * const result = await Dialog.confirm({
 *   title: 'Hapus data?',
 *   message: 'Tindakan ini tidak dapat dibatalkan.',
 *   confirmText: 'Ya, Hapus',
 *   cancelText: 'Batal',
 * });
 * if (result.isConfirmed) {
 *   // lanjut hapus
 * }
 * ```
 */
export function confirm(
  options: ConfirmOptions | string,
): Promise<DialogResult> & { handle: DialogHandle } {
  const opts: DialogOptions =
    typeof options === 'string'
      ? { message: options, icon: 'question', showCancelButton: true }
      : { icon: 'question', showCancelButton: true, ...options };

  const handle = openDialog(opts);

  // Kembalikan Promise yang juga membawa handle untuk keperluan update/close
  const promise = handle.result as Promise<DialogResult> & { handle: DialogHandle };
  promise.handle = handle;
  return promise;
}
