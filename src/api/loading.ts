import { openDialog } from '../core/controller';
import type { DialogOptions } from '../types/options';
import type { DialogHandle } from '../types/result';

export interface LoadingOptions extends Pick<DialogOptions, 'title' | 'message' | 'theme' | 'allowEscapeKey'> {}

/**
 * Membuka dialog loading (spinner) tanpa tombol.
 * Harus ditutup secara manual lewat `handle.close()`.
 *
 * @example
 * ```ts
 * const loading = Dialog.loading({ message: 'Menyimpan...' });
 * await save();
 * loading.close();
 * Dialog.success('Data berhasil disimpan!');
 * ```
 */
export function loading(options: LoadingOptions | string = 'Memuat...'): DialogHandle {
  const opts: DialogOptions =
    typeof options === 'string'
      ? { message: options }
      : { ...options };

  return openDialog({
    icon: 'loading',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCancelButton: false,
    ...opts,
  });
}
