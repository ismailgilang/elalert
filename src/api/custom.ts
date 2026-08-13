import { openDialog } from '../core/controller';
import type { CustomDialogOptions } from '../types/options';
import type { DialogHandle } from '../types/result';

/**
 * Membuka dialog dengan konten kustom.
 * Fungsi `render` menerima container HTMLElement dan bertanggung jawab
 * atas semua konten yang dimasukkan ke dalamnya.
 *
 * ⚠️ **Security**: Konsumer bertanggung jawab atas sanitasi HTML yang dimasukkan
 * lewat `render` callback. Gunakan DOMPurify atau sanitasi manual jika konten
 * berasal dari input pengguna.
 *
 * @example
 * ```ts
 * Dialog.custom({
 *   title: 'Upload File',
 *   render: (container) => {
 *     const input = document.createElement('input');
 *     input.type = 'file';
 *     container.appendChild(input);
 *   },
 *   onOpen: (handle) => {
 *     // attach additional listeners
 *   },
 * });
 * ```
 */
export function custom(options: CustomDialogOptions): DialogHandle {
  const { render, ...rest } = options;

  const handle = openDialog({
    icon: 'none',
    ...rest,
    onOpen: (h) => {
      // Render custom content ke content slot setelah mount
      if (h !== undefined && 'id' in h) {
        const overlay = document.querySelector<HTMLElement>(
          `[data-dialog-id="${h.id}"] .dlg-content`,
        );
        if (overlay !== null) {
          render(overlay);
        }
      }
      options.onOpen?.(h);
    },
  });

  return handle;
}
