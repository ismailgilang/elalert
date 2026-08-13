import { openDialog } from '../core/controller';
import type { DialogOptions } from '../types/options';
import type { DialogHandle } from '../types/result';

/** Membuka dialog alert generik */
export function alert(options: DialogOptions | string): DialogHandle {
  const opts = typeof options === 'string' ? { message: options } : options;
  return openDialog({ icon: 'none', ...opts });
}

/** Membuka dialog dengan icon success */
export function success(options: DialogOptions | string): DialogHandle {
  const opts = typeof options === 'string' ? { message: options } : options;
  return openDialog({ icon: 'success', ...opts });
}

/** Membuka dialog dengan icon error */
export function error(options: DialogOptions | string): DialogHandle {
  const opts = typeof options === 'string' ? { message: options } : options;
  return openDialog({ icon: 'error', ...opts });
}

/** Membuka dialog dengan icon warning */
export function warning(options: DialogOptions | string): DialogHandle {
  const opts = typeof options === 'string' ? { message: options } : options;
  return openDialog({ icon: 'warning', ...opts });
}

/** Membuka dialog dengan icon info */
export function info(options: DialogOptions | string): DialogHandle {
  const opts = typeof options === 'string' ? { message: options } : options;
  return openDialog({ icon: 'info', ...opts });
}
