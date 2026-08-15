/**
 * @el-alert/dialog
 * Lightweight, accessible, framework-agnostic dialog/modal/alert library.
 *
 * @example
 * ```ts
 * import { Dialog } from '@el-alert/dialog';
 * import '@el-alert/dialog/style.css';
 *
 * // Simple alert
 * Dialog.success('Data berhasil disimpan!');
 *
 * // Confirm dengan await
 * const result = await Dialog.confirm({
 *   title: 'Hapus data?',
 *   message: 'Tindakan ini tidak dapat dibatalkan.',
 * });
 * if (result.isConfirmed) { ... }
 * ```
 */

import * as _api from './api/index';
import './theme/tokens.css';

/** Namespace utama library — semua method tersedia di sini */
export const Dialog = _api;

// Named re-exports untuk tree-shaking
export {
  alert,
  success,
  error,
  warning,
  info,
  confirm,
  loading,
  custom,
  close,
  closeDialog,
  update,
  setConfig,
  getConfig,
} from './api/index';

// Type exports
export type {
  DialogOptions,
  CustomDialogOptions,
  DialogConfig,
  DialogIconType,
  DialogTheme,
  DialogStyle,
  PartialDialogOptions,
} from './types/options';

export type {
  DialogResult,
  DialogHandle,
  DialogState,
} from './types/result';
