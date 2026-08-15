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

  // Toast dirender ke shared tray (bertumpuk + swipe to dismiss)
  if (options.style === 'toast') {
    return renderToast(instance, config);
  }

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

  overlay.setAttribute('data-dialog-style', 'modal');

  // Position attribute
  const position = options.position ?? config.position ?? 'center';
  overlay.setAttribute('data-dialog-position', position);

  // Overlay visibility & custom color
  if (options.showOverlay === false) {
    overlay.setAttribute('data-show-overlay', 'false');
  }
  if (options.overlayColor !== undefined && options.overlayColor !== '') {
    overlay.style.backgroundColor = options.overlayColor;
  }

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
// Toast rendering — bertumpuk di shared tray per posisi
// ---------------------------------------------------------------------------

const _toastTrays = new Map<string, HTMLElement>();
const _expandedTrays = new Set<HTMLElement>();
const _collapseTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
const TOAST_SLIVER = 20; // px sliver yang terlihat saat bertumpuk

function getToastTray(position: string, baseZIndex: number): HTMLElement {
  const existing = _toastTrays.get(position);
  if (existing !== undefined && document.body.contains(existing)) {
    return existing;
  }
  _toastTrays.delete(position);
  const tray = document.createElement('div');
  tray.className = 'dlg-toast-tray';
  tray.setAttribute('data-dialog-position', position);
  tray.style.zIndex = String(baseZIndex + 100);
  getRootContainer().appendChild(tray);
  _toastTrays.set(position, tray);
  return tray;
}

/** Susun ulang tumpukan toast; hapus tray dari DOM & cache jika sudah kosong */
export function cleanupToastTray(tray: HTMLElement): void {
  if (tray.childElementCount > 0) {
    applyToastCollapse(tray); // item berkurang → susun ulang tumpukan
    return;
  }
  const timer = _collapseTimers.get(tray);
  if (timer !== undefined) {
    clearTimeout(timer);
    _collapseTimers.delete(tray);
  }
  _expandedTrays.delete(tray);
  for (const [position, t] of _toastTrays) {
    if (t === tray) {
      _toastTrays.delete(position);
    }
  }
  tray.remove();
}

/**
 * Susun tumpukan toast: item kedua dst. di-overlap ke item pertama,
 * hanya menyisakan sliver 20px. Saat expanded (hover), semua dibuka penuh.
 */
function applyToastCollapse(tray: HTMLElement, depth = 0): void {
  const expanded = _expandedTrays.has(tray);
  let needsRetry = false;
  [...tray.children].forEach((child, index) => {
    const item = child as HTMLElement;
    if (expanded || index === 0) {
      item.style.marginTop = '';
      return;
    }
    const height = item.offsetHeight;
    if (height === 0) needsRetry = true;
    item.style.marginTop = `${TOAST_SLIVER - height}px`;
  });
  // Tinggi baru tersedia setelah item dirender (bukan display:none)
  if (needsRetry && depth < 3) {
    requestAnimationFrame(() => applyToastCollapse(tray, depth + 1));
  }
}

/** Buka tumpukan saat hover item; tutup lagi saat pointer keluar tray */
function attachHoverExpand(item: HTMLElement, tray: HTMLElement): void {
  item.addEventListener('mouseenter', () => {
    const timer = _collapseTimers.get(tray);
    if (timer !== undefined) {
      clearTimeout(timer);
      _collapseTimers.delete(tray);
    }
    _expandedTrays.add(tray);
    applyToastCollapse(tray);
  });

  item.addEventListener('mouseleave', (e) => {
    const related = e.relatedTarget as Node | null;
    if (related !== null && tray.contains(related)) return; // masih di dalam tray
    const timer = _collapseTimers.get(tray);
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    _collapseTimers.set(tray, setTimeout(() => {
      _collapseTimers.delete(tray);
      _expandedTrays.delete(tray);
      applyToastCollapse(tray);
    }, 150));
  });
}

function renderToast(instance: DialogInstance, config: ReturnType<typeof getConfig>): DialogElements {
  const { id, options } = instance;

  const position = options.position
    ?? (config.position === 'center' ? 'top-right' : config.position)
    ?? 'top-right';
  const tray = getToastTray(position, config.baseZIndex);

  const item = document.createElement('div');
  item.className = 'dlg-toast-item';
  item.setAttribute('data-dialog-id', id);
  item.setAttribute('data-state', 'exited');

  const theme = options.theme ?? config.theme;
  if (theme !== 'auto') {
    item.setAttribute('data-dialog-theme', theme);
  }
  if (isReducedMotion()) {
    item.setAttribute('data-reduced-motion', '');
  }

  // Body: icon + title + message
  const body = document.createElement('div');
  body.className = 'dlg-body';

  const iconEl = buildIconElement(options);
  if (iconEl !== null) body.appendChild(iconEl);

  const titleEl = buildTitleElement(options, id);
  if (titleEl !== null) body.appendChild(titleEl);

  const messageEl = buildMessageElement(options, id);
  if (messageEl !== null) body.appendChild(messageEl);

  const contentSlot = document.createElement('div');
  contentSlot.className = 'dlg-content';

  const { container: actionsEl, confirmBtn, cancelBtn } = buildActionsElement(options);

  item.appendChild(body);
  item.appendChild(contentSlot);
  if (actionsEl.childElementCount > 0) {
    item.appendChild(actionsEl);
  }

  const elements: DialogElements = {
    overlay: item,
    container: item,
    title: titleEl,
    message: messageEl,
    contentSlot,
    confirmBtn,
    cancelBtn,
    iconContainer: iconEl,
  };

  attachEventListeners(instance, elements);
  attachSwipeDismiss(item, id);

  tray.appendChild(item);
  attachHoverExpand(item, tray);
  applyToastCollapse(tray);

  // Listen update event
  instance.emitter.on('update', (opts: PartialDialogOptions) => {
    applyUpdate(elements, opts);
  });

  return elements;
}

// ---------------------------------------------------------------------------
// Swipe to dismiss — drag horizontal untuk membuang toast
// ---------------------------------------------------------------------------

function attachSwipeDismiss(item: HTMLElement, id: string): void {
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let currentDx = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    currentDx = 0;
    dragging = true;
    item.style.transition = 'none';
    item.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) {
      currentDx = dx;
      item.style.transform = `translateX(${dx}px)`;
      item.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 240));
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    const width = item.offsetWidth || 360;
    if (Math.abs(currentDx) > Math.max(80, width * 0.25)) {
      dismissBySwipe(item, id, Math.sign(currentDx));
    } else {
      // Kembali ke posisi semula
      item.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
      item.style.transform = '';
      item.style.opacity = '1';
    }
  };

  item.addEventListener('pointerdown', onPointerDown);
  item.addEventListener('pointermove', onPointerMove);
  item.addEventListener('pointerup', onPointerUp);
  item.addEventListener('pointercancel', onPointerUp);
}

function dismissBySwipe(item: HTMLElement, id: string, direction: number): void {
  item.classList.add('dlg-toast-item--swiped');
  item.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  item.style.transform = `translateX(${direction > 0 ? '120%' : '-120%'})`;
  item.style.opacity = '0';
  item.addEventListener(
    'transitionend',
    () => {
      closeDialog(id, { isConfirmed: false, isDismissed: true, dismissReason: 'close' });
      // Selesaikan unmount segera (animasi exit di-skip oleh class --swiped)
      item.dispatchEvent(new Event('animationend', { bubbles: true }));
    },
    { once: true },
  );
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
