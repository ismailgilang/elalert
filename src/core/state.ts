import type { DialogOptions, DialogConfig, PartialDialogOptions } from '../types/options';
import type { DialogResult, DialogState } from '../types/result';
import { EventEmitter } from './events';

/** Event map untuk lifecycle tiap dialog instance */
export interface DialogInstanceEvents {
  [key: string]: unknown;
  stateChange: DialogState;
  update: PartialDialogOptions;
  resolve: DialogResult;
}

/** Internal representation dari satu dialog yang aktif atau antri */
export interface DialogInstance {
  readonly id: string;
  readonly options: Readonly<DialogOptions>;
  state: DialogState;
  readonly emitter: EventEmitter<DialogInstanceEvents>;
  /** DOM elements — diisi oleh renderer setelah mount */
  elements: DialogElements | null;
  /** Timer ID untuk autoClose */
  autoCloseTimer: ReturnType<typeof setTimeout> | null;
}

/** Referensi ke elemen-elemen DOM dialog */
export interface DialogElements {
  overlay: HTMLElement;
  container: HTMLElement;
  title: HTMLElement | null;
  message: HTMLElement | null;
  contentSlot: HTMLElement;
  confirmBtn: HTMLButtonElement | null;
  cancelBtn: HTMLButtonElement | null;
  iconContainer: HTMLElement | null;
}

/** Internal state management module */

const _instances = new Map<string, DialogInstance>();
const _queue: string[] = [];

let _config: Required<DialogConfig> = {
  theme: 'auto',
  defaultConfirmText: 'OK',
  defaultCancelText: 'Batal',
  backdropBlur: false,
  queueBehavior: 'queue',
  baseZIndex: 1000,
  position: 'center',
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export function getConfig(): Readonly<Required<DialogConfig>> {
  return _config;
}

export function setConfig(partial: DialogConfig): void {
  _config = { ..._config, ...partial };
}

// ---------------------------------------------------------------------------
// Instance management
// ---------------------------------------------------------------------------

export function addInstance(instance: DialogInstance): void {
  _instances.set(instance.id, instance);
}

export function getInstance(id: string): DialogInstance | undefined {
  return _instances.get(id);
}

export function removeInstance(id: string): void {
  _instances.delete(id);
  const queueIdx = _queue.indexOf(id);
  if (queueIdx !== -1) {
    _queue.splice(queueIdx, 1);
  }
}

export function getAllInstances(): ReadonlyMap<string, DialogInstance> {
  return _instances;
}

/** Mengembalikan ID dialog yang sedang tampil (state entered/entering), dari terbaru */
export function getActiveIds(): string[] {
  return [..._instances.values()]
    .filter((i) => i.state === 'entered' || i.state === 'entering')
    .map((i) => i.id)
    .reverse();
}

/** Mengembalikan dialog paling atas (paling baru dirender) */
export function getTopInstance(): DialogInstance | undefined {
  const active = getActiveIds();
  if (active.length === 0) return undefined;
  return _instances.get(active[0]!);
}

// ---------------------------------------------------------------------------
// Queue management
// ---------------------------------------------------------------------------

export function enqueue(id: string): void {
  _queue.push(id);
}

export function dequeue(): string | undefined {
  return _queue.shift();
}

export function getQueueLength(): number {
  return _queue.length;
}

// ---------------------------------------------------------------------------
// Reset — hanya untuk testing
// ---------------------------------------------------------------------------

export function _resetState(): void {
  _instances.clear();
  _queue.length = 0;
  _config = {
    theme: 'auto',
    defaultConfirmText: 'OK',
    defaultCancelText: 'Batal',
    backdropBlur: false,
    queueBehavior: 'queue',
    baseZIndex: 1000,
    position: 'center',
  };
}
