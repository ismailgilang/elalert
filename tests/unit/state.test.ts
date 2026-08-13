import { describe, it, expect, beforeEach } from 'vitest';
import {
  addInstance,
  getInstance,
  removeInstance,
  getActiveIds,
  getTopInstance,
  enqueue,
  dequeue,
  getQueueLength,
  setConfig,
  getConfig,
  _resetState,
} from '../../src/core/state';
import { EventEmitter } from '../../src/core/events';
import type { DialogInstance } from '../../src/core/state';

function makeInstance(id: string): DialogInstance {
  return {
    id,
    options: { icon: 'none', title: 'Test' },
    state: 'entered',
    emitter: new EventEmitter(),
    elements: null,
    autoCloseTimer: null,
  };
}

describe('State management', () => {
  beforeEach(() => {
    _resetState();
  });

  describe('Instance management', () => {
    it('addInstance / getInstance', () => {
      const inst = makeInstance('dlg-1');
      addInstance(inst);
      expect(getInstance('dlg-1')).toBe(inst);
    });

    it('getInstance returns undefined for unknown id', () => {
      expect(getInstance('unknown')).toBeUndefined();
    });

    it('removeInstance removes from map', () => {
      const inst = makeInstance('dlg-1');
      addInstance(inst);
      removeInstance('dlg-1');
      expect(getInstance('dlg-1')).toBeUndefined();
    });
  });

  describe('getActiveIds / getTopInstance', () => {
    it('returns only entered/entering instances', () => {
      const i1 = makeInstance('dlg-1');
      i1.state = 'entered';
      const i2 = makeInstance('dlg-2');
      i2.state = 'exited';
      addInstance(i1);
      addInstance(i2);
      const active = getActiveIds();
      expect(active).toContain('dlg-1');
      expect(active).not.toContain('dlg-2');
    });

    it('getTopInstance returns undefined when no active dialogs', () => {
      expect(getTopInstance()).toBeUndefined();
    });
  });

  describe('Queue', () => {
    it('enqueue and dequeue work FIFO', () => {
      enqueue('a');
      enqueue('b');
      enqueue('c');
      expect(dequeue()).toBe('a');
      expect(dequeue()).toBe('b');
      expect(dequeue()).toBe('c');
      expect(dequeue()).toBeUndefined();
    });

    it('getQueueLength returns correct count', () => {
      expect(getQueueLength()).toBe(0);
      enqueue('x');
      enqueue('y');
      expect(getQueueLength()).toBe(2);
      dequeue();
      expect(getQueueLength()).toBe(1);
    });
  });

  describe('Config', () => {
    it('setConfig merges partial config', () => {
      setConfig({ theme: 'dark', baseZIndex: 2000, position: 'top-left' });
      const cfg = getConfig();
      expect(cfg.theme).toBe('dark');
      expect(cfg.baseZIndex).toBe(2000);
      expect(cfg.position).toBe('top-left');
      // Other defaults preserved
      expect(cfg.defaultConfirmText).toBe('OK');
    });
  });
});
