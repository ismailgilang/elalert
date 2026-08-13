/** Hasil dari interaksi pengguna dengan dialog */
export interface DialogResult<T = unknown> {
  /** true jika pengguna menekan tombol konfirmasi/primary */
  isConfirmed: boolean;

  /** true jika pengguna menutup dialog (ESC, outside click, tombol batal) */
  isDismissed: boolean;

  /** Nilai yang dikirim saat menutup dialog — umumnya undefined kecuali custom dialog */
  value?: T;

  /**
   * Alasan dismissal. Hanya diisi jika isDismissed === true.
   * - 'escape': ESC ditekan
   * - 'outside': klik di luar dialog
   * - 'cancel': tombol batal ditekan
   * - 'close': Dialog.close() dipanggil programatik
   */
  dismissReason?: 'escape' | 'outside' | 'cancel' | 'close';
}

/** Handle yang dikembalikan oleh setiap pemanggilan Dialog.* */
export interface DialogHandle<T = unknown> {
  /** ID unik dialog instance ini */
  id: string;

  /**
   * Menutup dialog secara programatik.
   * @param value - Nilai opsional yang akan masuk ke DialogResult.value
   */
  close: (value?: T) => void;

  /**
   * Memperbarui opsi dialog yang sedang tampil.
   * Hanya opsi yang diberikan yang akan diupdate.
   */
  update: (options: import('./options').PartialDialogOptions) => void;

  /**
   * Promise yang resolve saat dialog ditutup.
   * Berguna untuk await Dialog.confirm().
   */
  result: Promise<DialogResult<T>>;
}

/** Status internal sebuah dialog instance */
export type DialogState =
  | 'entering'   // animasi masuk sedang berjalan
  | 'entered'    // dialog aktif & fully visible
  | 'exiting'    // animasi keluar sedang berjalan
  | 'exited';    // dialog sudah keluar & dihapus dari DOM
