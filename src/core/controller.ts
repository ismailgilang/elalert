import { generateId } from './id';
import {
  addInstance,
  getInstance,
  removeInstance,
  getTopInstance,
  getAllInstances,
  getConfig,
  enqueue,
  dequeue,
  getQueueLength,
} from './state';
import type { DialogInstance, DialogInstanceEvents } from './state';
import { EventEmitter } from './events';
import { restoreFocus } from '../a11y/focus-restore';
import type { DialogOptions, PartialDialogOptions } from '../types/options';
import type { DialogHandle, DialogResult } from '../types/result';

import type * as RendererModule from '../render/renderer';
import type * as A11yModule from '../a11y/aria';

// Lazy import renderer & a11y untuk menghindari circular dep saat testing
let _renderer: typeof RendererModule | null = null;
let _a11y: typeof A11yModule | null = null;

async function getRenderer() {
  if (_renderer === null) {
    _renderer = await import('../render/renderer');
  }
  return _renderer;
}

async function getA11y() {
  if (_a11y === null) {
    _a11y = await import('../a11y/aria');
  }
  return _a11y;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildHandle<T = unknown>(
  id: string,
  resultPromise: Promise<DialogResult<T>>,
): DialogHandle<T> {
  return {
    id,
    result: resultPromise,
    close(value?: T) {
      closeDialog(id, { isConfirmed: false, isDismissed: true, dismissReason: 'close', value });
    },
    update(options: PartialDialogOptions) {
      updateDialog(id, options);
    },
  };
}

function mergeWithDefaults(options: DialogOptions): DialogOptions {
  const config = getConfig();
  return {
    icon: 'none',
    showConfirmButton: true,
    confirmText: config.defaultConfirmText,
    cancelText: config.defaultCancelText,
    showCancelButton: false,
    allowOutsideClick: true,
    allowEscapeKey: true,
    autoClose: 0,
    theme: config.theme,
    position: config.position,
    style: 'modal',
    showOverlay: true,
    ...options,
  };
}

// ---------------------------------------------------------------------------
// Core: openDialog
// ---------------------------------------------------------------------------

/**
 * Membuka dialog baru dan mengembalikan handle + promise result.
 * Jika config.queueBehavior === 'queue' dan ada dialog aktif, dialog baru akan menunggu.
 */
export function openDialog<T = unknown>(
  rawOptions: DialogOptions,
): DialogHandle<T> {
  const id = generateId();
  const options = mergeWithDefaults(rawOptions);

  let resolveResult!: (result: DialogResult<T>) => void;
  const resultPromise = new Promise<DialogResult<T>>((resolve) => {
    resolveResult = resolve;
  });

  const instance: DialogInstance = {
    id,
    options,
    state: 'exited',
    emitter: new EventEmitter<DialogInstanceEvents>(),
    elements: null,
    autoCloseTimer: null,
  };

  addInstance(instance);

  const config = getConfig();

  // Toast selalu tampil langsung & bertumpuk di tray (tidak perlu antri)
  const isToast = options.style === 'toast';

  // Modal menunggu giliran jika ada modal lain yang aktif/menutup
  const hasBusyModal = [...getAllInstances().values()].some(
    (i) => i.options.style !== 'toast'
      && (i.state === 'entering' || i.state === 'entered' || i.state === 'exiting'),
  );

  const shouldQueue = !isToast && hasBusyModal && config.queueBehavior === 'queue';

  if (shouldQueue) {
    // Masukkan ke antrian
    enqueue(id);
  } else {
    // Render langsung
    void mountDialog(instance);
  }

  // Listen ke resolve event dari instance
  instance.emitter.once('resolve', (result) => {
    resolveResult(result as DialogResult<T>);
  });

  return buildHandle<T>(id, resultPromise);
}

// ---------------------------------------------------------------------------
// Core: mountDialog
// ---------------------------------------------------------------------------

async function mountDialog(
  instance: DialogInstance,
): Promise<void> {
  const renderer = await getRenderer();
  const a11y = await getA11y();

  // Set state & render DOM
  instance.state = 'entering';
  instance.emitter.emit('stateChange', 'entering');

  const elements = renderer.renderDialog(instance);
  instance.elements = elements;

  // Setup accessibility
  a11y.setupAria(elements, instance.options);

  // Call onOpen callback
  const handle = buildHandle(instance.id, Promise.resolve({
    isConfirmed: false,
    isDismissed: false,
  }));
  instance.options.onOpen?.(handle);

  // Trigger entering animation (next frame)
  requestAnimationFrame(() => {
    elements.overlay.setAttribute('data-state', 'entering');
    elements.container.setAttribute('data-state', 'entering');

    // Setelah animasi selesai — dengan fallback jika animationend tidak terjadi
    // (reduced motion / animasi di-skip) agar state tidak terjebak 'entering'
    let settled = false;
    const markEntered = () => {
      if (settled) return;
      settled = true;
      if (instance.state !== 'entering') return;
      instance.state = 'entered';
      instance.emitter.emit('stateChange', 'entered');
      elements.overlay.setAttribute('data-state', 'entered');
      elements.container.setAttribute('data-state', 'entered');
    };
    elements.container.addEventListener('animationend', markEntered, { once: true });
    setTimeout(markEntered, 250); // fallback
  });

  // Setup autoClose
  const autoClose = instance.options.autoClose ?? 0;
  if (autoClose > 0) {
    instance.autoCloseTimer = setTimeout(() => {
      closeDialog(instance.id, {
        isConfirmed: false,
        isDismissed: true,
        dismissReason: 'close',
      });
    }, autoClose);
  }

  // Listen resolve
  instance.emitter.once('resolve', () => {
    void unmountDialog(instance);
  });
}

// ---------------------------------------------------------------------------
// Core: closeDialog
// ---------------------------------------------------------------------------

export function closeDialog(id: string, result: DialogResult): void {
  const instance = getInstance(id);
  if (instance === undefined) return;
  if (instance.state === 'exiting' || instance.state === 'exited') return;

  // Clear autoClose timer
  if (instance.autoCloseTimer !== null) {
    clearTimeout(instance.autoCloseTimer);
    instance.autoCloseTimer = null;
  }

  instance.state = 'exiting';
  instance.emitter.emit('stateChange', 'exiting');
  instance.emitter.emit('resolve', result);

  instance.options.onClose?.(result);
}

// ---------------------------------------------------------------------------
// Core: unmountDialog
// ---------------------------------------------------------------------------

async function unmountDialog(instance: DialogInstance): Promise<void> {
  const elements = instance.elements;

  if (elements !== null) {
    elements.overlay.setAttribute('data-state', 'exiting');
    elements.container.setAttribute('data-state', 'exiting');

    // Tunggu animasi exit
    await new Promise<void>((resolve) => {
      const onEnd = () => {
        resolve();
      };
      elements.container.addEventListener('animationend', onEnd, { once: true });
      // Fallback jika animasi tidak terjadi (reduced motion)
      setTimeout(resolve, 300);
    });

    // Restore focus hanya untuk modal (toast tidak mencuri fokus)
    if (instance.options.style !== 'toast') {
      restoreFocus(elements);
    }

    const toastTray = elements.overlay.parentElement;
    elements.overlay.remove();

    // Bersihkan tray toast yang sudah kosong
    if (instance.options.style === 'toast' && toastTray !== null) {
      const renderer = await getRenderer();
      renderer.cleanupToastTray(toastTray);
    }
  }

  instance.state = 'exited';
  instance.emitter.emit('stateChange', 'exited');
  removeInstance(instance.id);

  // Proses antrian berikutnya
  void processQueue();
}

// ---------------------------------------------------------------------------
// Core: updateDialog
// ---------------------------------------------------------------------------

export function updateDialog(id: string, options: PartialDialogOptions): void {
  const instance = getInstance(id);
  if (instance === undefined) return;

  // Mutate options — options di instance bukan immutable untuk keperluan update
  Object.assign(instance.options as DialogOptions, options);
  instance.emitter.emit('update', options);
}

// ---------------------------------------------------------------------------
// Core: closeTopDialog
// ---------------------------------------------------------------------------

export function closeTopDialog(): void {
  const top = getTopInstance();
  if (top === undefined) return;
  closeDialog(top.id, {
    isConfirmed: false,
    isDismissed: true,
    dismissReason: 'close',
  });
}

// ---------------------------------------------------------------------------
// Queue processor
// ---------------------------------------------------------------------------

async function processQueue(): Promise<void> {
  if (getQueueLength() === 0) return;

  const nextId = dequeue();
  if (nextId === undefined) return;

  const nextInstance = getInstance(nextId);
  if (nextInstance === undefined) {
    void processQueue(); // skip instance yang sudah dihapus
    return;
  }

  await mountDialog(nextInstance);
}
