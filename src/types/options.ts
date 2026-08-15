import type { DialogHandle, DialogResult } from './result';

/** Tipe icon yang tersedia pada dialog */
export type DialogIconType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'question'
  | 'loading'
  | 'none';

/** Preferensi tema tampilan dialog */
export type DialogTheme = 'light' | 'dark' | 'auto';

/** Gaya tampilan dialog */
export type DialogStyle = 'modal' | 'toast';

/** Posisi tata letak dialog di layar */
export type DialogPosition =
  | 'center'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';

/** Konfigurasi opsi untuk membuka dialog */
export interface DialogOptions {
  /** Posisi dialog di layar. Default: 'center' ('top-right' untuk toast) */
  position?: DialogPosition;

  /**
   * Gaya tampilan dialog.
   * - 'modal': centered dengan backdrop (default)
   * - 'toast': notification tanpa backdrop, halaman tetap interaktif
   */
  style?: DialogStyle;

  /**
   * Apakah backdrop/overlay ditampilkan. Default: true.
   * Set false untuk dialog tanpa dim — halaman tetap terlihat (klik luar masih menutup).
   */
  showOverlay?: boolean;

  /** Warna custom backdrop (CSS color). Default: mengikuti tema (--dlg-color-overlay). */
  overlayColor?: string;

  /** Judul dialog. Jika tidak diset, section judul tidak dirender. */
  title?: string;

  /** Pesan utama dialog. Diperlakukan sebagai plain text (bukan HTML). */
  message?: string;

  /** Tipe icon yang ditampilkan. Default: 'none' */
  icon?: DialogIconType;

  /** Teks tombol konfirmasi/primary. Default: 'OK' */
  confirmText?: string;

  /** Teks tombol batal/secondary. Default: 'Batal' */
  cancelText?: string;

  /** Apakah tombol konfirmasi/primary ditampilkan. Default: true */
  showConfirmButton?: boolean;

  /** Apakah tombol batal ditampilkan. Default: false */
  showCancelButton?: boolean;

  /** Apakah klik overlay menutup dialog. Default: true */
  allowOutsideClick?: boolean;

  /** Apakah ESC menutup dialog. Default: true */
  allowEscapeKey?: boolean;

  /**
   * Durasi otomatis tutup dalam ms. 0 = tidak otomatis.
   * Default: 0
   */
  autoClose?: number;

  /** Preferensi tema. Default: 'auto' (ikuti system) */
  theme?: DialogTheme;

  /** Callback saat dialog selesai dibuka & animasi selesai */
  onOpen?: (handle: DialogHandle) => void;

  /** Callback saat dialog sudah tertutup & animasi selesai */
  onClose?: (result: DialogResult) => void;
}

/** Opsi khusus untuk Dialog.custom() */
export interface CustomDialogOptions extends Omit<DialogOptions, 'message' | 'icon'> {
  /**
   * Fungsi untuk merender konten kustom ke dalam container.
   * Konsumer bertanggung jawab atas sanitasi HTML yang dimasukkan.
   */
  render: (container: HTMLElement) => void;
}

/** Konfigurasi global library (lewat Dialog.setConfig) */
export interface DialogConfig {
  /** Default theme. Default: 'auto' */
  theme?: DialogTheme;

  /** Default teks konfirmasi. Default: 'OK' */
  defaultConfirmText?: string;

  /** Default teks batal. Default: 'Batal' */
  defaultCancelText?: string;

  /** Apakah backdrop blur aktif. Default: false (performa) */
  backdropBlur?: boolean;

  /**
   * Perilaku saat dialog baru muncul ketika sudah ada dialog aktif.
   * - 'queue': dialog baru menunggu giliran (default)
   * - 'stack': dialog baru menumpuk di atas
   */
  queueBehavior?: 'queue' | 'stack';

  /**
   * Z-index base untuk overlay.
   * Tiap dialog baru mendapat +2 dari nilai ini.
   * Default: 1000
   */
  baseZIndex?: number;

  /** Default posisi dialog. Default: 'center' */
  position?: DialogPosition;
}

/** Subset dari DialogOptions yang dapat diupdate setelah dialog dibuka */
export type PartialDialogOptions = Pick<
  DialogOptions,
  'title' | 'message' | 'confirmText' | 'cancelText' | 'autoClose' | 'position'
>;
