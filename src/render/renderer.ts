import type { DialogInstance, DialogElements } from '../core/state';
import type { PartialDialogOptions } from '../types/options';
import { getConfig } from '../core/state';
import {
  buildIconElement,
  buildTitleElement,
  buildMessageElement,
  buildActionsElement,
} from './template';
import { closeDialog } from '../core/controller';
import { trapFocus } from '../a11y/focus-trap';
import { saveFocus } from '../a11y/focus-restore';
import { isReducedMotion } from '../animation/reduced-motion';

// Root container — dibuat lazy saat dialog pertama dipanggil
let _rootContainer: HTMLElement | null = null;

function getRootContainer(): HTMLElement {
  if (_rootContainer !== null && document.body.contains(_rootContainer)) {
    return _rootContainer;
  }
  const root = document.createElement('div');
  root.setAttribute('data-dialog-root', '');
  document.body.appendChild(root);
  _rootContainer = root;
  return root;
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

/**
 * Membangun dan me-mount DOM untuk sebuah dialog instance.
 * Mengembalikan referensi ke semua elemen yang dibuat.
 */
export function renderDialog(instance: DialogInstance): DialogElements {
  const { id, options } = instance;
  const config = getConfig();

  // Simpan fokus aktif saat ini sebelum membuka dialog
  saveFocus();

  // Z-index berdasarkan jumlah dialog aktif
  const activeCount = getRootContainer().childElementCount;
  const zOverlay = config.baseZIndex + activeCount * 2;
  const zDialog = zOverlay + 1;

  // ----- Overlay -----
  const overlay = document.createElement('div');
  overlay.className = 'dlg-overlay';
  overlay.setAttribute('data-dialog-id', id);
  overlay.setAttribute('data-state', 'exited');
  overlay.style.zIndex = String(zOverlay);

  // Position attribute
  const position = options.position ?? config.position ?? 'center';
  overlay.setAttribute('data-dialog-position', position);

  // Theme attribute
  const theme = options.theme ?? config.theme;
  if (theme !== 'auto') {
    overlay.setAttribute('data-dialog-theme', theme);
  }

  // Reduced motion attribute
  if (isReducedMotion()) {
    overlay.setAttribute('data-reduced-motion', '');
  }

  // Backdrop blur
  if (config.backdropBlur) {
    overlay.setAttribute('data-backdrop-blur', '');
  }

  // ----- Container -----
  const container = document.createElement('div');
  container.className = 'dlg-container';
  container.setAttribute('data-state', 'exited');
  container.setAttribute('data-dialog-id', id);
  container.style.zIndex = String(zDialog);

  // ----- Body (icon + title + message) -----
  const body = document.createElement('div');
  body.className = 'dlg-body';

  const iconEl = buildIconElement(options);
  if (iconEl !== null) body.appendChild(iconEl);

  const titleEl = buildTitleElement(options, id);
  if (titleEl !== null) body.appendChild(titleEl);

  const messageEl = buildMessageElement(options, id);
  if (messageEl !== null) body.appendChild(messageEl);

  // ----- Content slot (untuk custom content) -----
  const contentSlot = document.createElement('div');
  contentSlot.className = 'dlg-content';

  // ----- Actions -----
  const { container: actionsEl, confirmBtn, cancelBtn } = buildActionsElement(options);

  // ----- Assemble -----
  container.appendChild(body);
  container.appendChild(contentSlot);
  if (actionsEl.childElementCount > 0) {
    container.appendChild(actionsEl);
  }
  overlay.appendChild(container);

  const elements: DialogElements = {
    overlay,
    container,
    title: titleEl,
    message: messageEl,
    contentSlot,
    confirmBtn,
    cancelBtn,
    iconContainer: iconEl,
  };

  // ----- Event listeners -----
  attachEventListeners(instance, elements);

  // ----- Mount ke DOM -----
  const root = getRootContainer();
  root.appendChild(overlay);

  // ----- Focus management -----
  const focusable = confirmBtn ?? cancelBtn ?? container;
  // Delay focus untuk memberi waktu animasi enter
  requestAnimationFrame(() => {
    focusable.focus({ preventScroll: true });
  });

  // Setup focus trap
  trapFocus(container);

  // Listen update event untuk update DOM
  instance.emitter.on('update', (opts: PartialDialogOptions) => {
    applyUpdate(elements, opts);
  });

  return elements;
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function attachEventListeners(
  instance: DialogInstance,
  elements: DialogElements,
): void {
  const { overlay, confirmBtn, cancelBtn } = elements;
  const { id, options } = instance;

  // Confirm button
  confirmBtn?.addEventListener('click', () => {
    closeDialog(id, { isConfirmed: true, isDismissed: false });
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => {
    closeDialog(id, {
      isConfirmed: false,
      isDismissed: true,
      dismissReason: 'cancel',
    });
  });

  // Outside click (klik overlay, bukan container)
  overlay.addEventListener('click', (e) => {
    if (
      options.allowOutsideClick !== false &&
      e.target === overlay
    ) {
      closeDialog(id, {
        isConfirmed: false,
        isDismissed: true,
        dismissReason: 'outside',
      });
    }
  });

  // ESC key
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && options.allowEscapeKey !== false) {
      e.preventDefault();
      closeDialog(id, {
        isConfirmed: false,
        isDismissed: true,
        dismissReason: 'escape',
      });
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // Cleanup listener saat dialog resolve
  instance.emitter.once('resolve', () => {
    document.removeEventListener('keydown', onKeyDown);
  });
}

// ---------------------------------------------------------------------------
// Apply update ke DOM
// ---------------------------------------------------------------------------

function applyUpdate(elements: DialogElements, opts: PartialDialogOptions): void {
  if (opts.title !== undefined && elements.title !== null) {
    elements.title.textContent = opts.title;
  }
  if (opts.message !== undefined && elements.message !== null) {
    elements.message.textContent = opts.message;
  }
  if (opts.confirmText !== undefined && elements.confirmBtn !== null) {
    elements.confirmBtn.textContent = opts.confirmText;
  }
  if (opts.cancelText !== undefined && elements.cancelBtn !== null) {
    elements.cancelBtn.textContent = opts.cancelText;
  }
  if (opts.position !== undefined) {
    elements.overlay.setAttribute('data-dialog-position', opts.position);
  }
}

// ---------------------------------------------------------------------------
// Cleanup root jika kosong
// ---------------------------------------------------------------------------

export function cleanupRootIfEmpty(): void {
  if (_rootContainer !== null && _rootContainer.childElementCount === 0) {
    _rootContainer.remove();
    _rootContainer = null;
  }
}
