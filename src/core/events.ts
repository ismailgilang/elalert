/**
 * Tiny synchronous event emitter (~600 bytes minified).
 * Dipakai internal untuk lifecycle events: open, close, confirm, cancel.
 * Tidak di-expose ke public API agar API tetap sederhana.
 */

type Listener<T = unknown> = (payload: T) => void;

interface EventMap {
  [event: string]: unknown;
}

export class EventEmitter<TMap extends EventMap = EventMap> {
  private readonly listeners = new Map<string, Set<Listener>>();

  /**
   * Mendaftarkan listener untuk event tertentu.
   * @returns fungsi untuk menghapus listener (unsubscribe)
   */
  on<K extends keyof TMap & string>(
    event: K,
    listener: Listener<TMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener);

    return () => {
      set.delete(listener as Listener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Mendaftarkan listener yang hanya berjalan sekali.
   */
  once<K extends keyof TMap & string>(
    event: K,
    listener: Listener<TMap[K]>,
  ): () => void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe();
      listener(payload as TMap[K]);
    });
    return unsubscribe;
  }

  /**
   * Memancarkan event ke semua listener yang terdaftar.
   */
  emit<K extends keyof TMap & string>(event: K, payload: TMap[K]): void {
    const set = this.listeners.get(event);
    if (set === undefined) return;
    for (const listener of [...set]) {
      listener(payload);
    }
  }

  /**
   * Menghapus semua listener untuk satu event, atau semua event jika tanpa argumen.
   */
  off(event?: string): void {
    if (event === undefined) {
      this.listeners.clear();
    } else {
      this.listeners.delete(event);
    }
  }

  /** Jumlah listener yang aktif untuk debugging */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
