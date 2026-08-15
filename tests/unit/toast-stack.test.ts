import { describe, it, expect, beforeEach } from 'vitest';
import { success } from '../../src/api/index';
import { _resetState } from '../../src/core/state';

globalThis.requestAnimationFrame ??= ((cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16)) as typeof requestAnimationFrame;

// jsdom belum menyediakan PointerEvent — polyfill minimal berbasis MouseEvent
class PointerEventPolyfill extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
globalThis.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tick = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const fireAnimationEnd = (el: HTMLElement) => el.dispatchEvent(new Event('animationend', { bubbles: true }));
const toastItems = () => document.querySelectorAll<HTMLElement>('.dlg-toast-item');
const trays = () => document.querySelectorAll<HTMLElement>('.dlg-toast-tray');

describe('toast stacking & swipe', () => {
  beforeEach(() => {
    _resetState();
    document.body.innerHTML = '';
  });

  it('toast bertumpuk di tray yang sama tanpa saling menimpa', async () => {
    success({ message: 'one', style: 'toast' });
    await wait(60);
    await tick();

    success({ message: 'two', style: 'toast' });
    await wait(60);
    await tick();

    expect(trays().length).toBe(1);
    expect(toastItems().length).toBe(2);
    expect(document.body.textContent).toContain('one');
    expect(document.body.textContent).toContain('two');
  });

  it('tutup satu toast, lainnya tetap tampil; tray dibersihkan saat kosong', async () => {
    success({ message: 'one', style: 'toast' });
    await wait(60);
    await tick();
    success({ message: 'two', style: 'toast' });
    await wait(60);
    await tick();

    const first = toastItems()[0]!;
    first.querySelector<HTMLButtonElement>('button')!.click();
    fireAnimationEnd(first);
    await wait(80);
    await tick();

    expect(toastItems().length).toBe(1);
    expect(document.body.textContent).toContain('two');

    const last = toastItems()[0]!;
    last.querySelector<HTMLButtonElement>('button')!.click();
    fireAnimationEnd(last);
    await wait(80);
    await tick();

    expect(toastItems().length).toBe(0);
    expect(trays().length).toBe(0); // tray dibersihkan saat kosong
  });

  it('swipe horizontal melebihi threshold menutup toast', async () => {
    success({ message: 'one', style: 'toast' });
    await wait(60);
    await tick();

    const item = toastItems()[0]!;
    const pointer = (type: string, x: number, y: number) =>
      item.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y }));

    pointer('pointerdown', 200, 10);
    pointer('pointermove', 60, 12); // drag ke kiri
    pointer('pointerup', 60, 12);
    await wait(40);

    // transitionend → closeDialog → animationend sintetik → item terhapus
    item.dispatchEvent(new Event('transitionend', { bubbles: true }));
    await wait(80);

    expect(toastItems().length).toBe(0);
    expect(trays().length).toBe(0);
  });

  it('toast bertumpuk (collapsed) dan membuka saat hover', async () => {
    success({ message: 'one', style: 'toast' });
    await wait(60);
    await tick();
    success({ message: 'two', style: 'toast' });
    await wait(80);
    await tick();

    const items = toastItems();
    expect(items.length).toBe(2);

    // Collapsed: item kedua punya margin-top ter-set (overlap ke item pertama)
    expect(items[1]!.style.marginTop).not.toBe('');

    // Hover → expanded (margin dibersihkan, semua terbuka)
    items[0]!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await wait(30);
    expect(items[1]!.style.marginTop).toBe('');

    // Pointer keluar tray → collapse lagi (setelah grace 150ms)
    items[0]!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, relatedTarget: document.body }));
    await wait(250);
    expect(items[1]!.style.marginTop).not.toBe('');
  });
});
