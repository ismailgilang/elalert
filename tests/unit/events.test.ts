import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../../src/core/events';

interface TestEvents {
  'test-event': string;
  'number-event': number;
  'void-event': undefined;
}

describe('EventEmitter', () => {
  it('should call listener when event is emitted', () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    emitter.on('test-event', listener);
    emitter.emit('test-event', 'hello');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('hello');
  });

  it('should support multiple listeners for same event', () => {
    const emitter = new EventEmitter<TestEvents>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    emitter.on('test-event', l1);
    emitter.on('test-event', l2);
    emitter.emit('test-event', 'hi');
    expect(l1).toHaveBeenCalledOnce();
    expect(l2).toHaveBeenCalledOnce();
  });

  it('should remove listener via returned unsubscribe function', () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    const unsub = emitter.on('test-event', listener);
    unsub();
    emitter.emit('test-event', 'hello');
    expect(listener).not.toHaveBeenCalled();
  });

  it('once() should only call listener one time', () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();
    emitter.once('test-event', listener);
    emitter.emit('test-event', 'a');
    emitter.emit('test-event', 'b');
    emitter.emit('test-event', 'c');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('a');
  });

  it('off() should remove all listeners for an event', () => {
    const emitter = new EventEmitter<TestEvents>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    emitter.on('test-event', l1);
    emitter.on('test-event', l2);
    emitter.off('test-event');
    emitter.emit('test-event', 'hello');
    expect(l1).not.toHaveBeenCalled();
    expect(l2).not.toHaveBeenCalled();
  });

  it('off() without argument should clear all events', () => {
    const emitter = new EventEmitter<TestEvents>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    emitter.on('test-event', l1);
    emitter.on('number-event', l2);
    emitter.off();
    emitter.emit('test-event', 'hello');
    emitter.emit('number-event', 42);
    expect(l1).not.toHaveBeenCalled();
    expect(l2).not.toHaveBeenCalled();
  });

  it('listenerCount() should return correct count', () => {
    const emitter = new EventEmitter<TestEvents>();
    expect(emitter.listenerCount('test-event')).toBe(0);
    const unsub = emitter.on('test-event', vi.fn());
    emitter.on('test-event', vi.fn());
    expect(emitter.listenerCount('test-event')).toBe(2);
    unsub();
    expect(emitter.listenerCount('test-event')).toBe(1);
  });

  it('should not throw when emitting event with no listeners', () => {
    const emitter = new EventEmitter<TestEvents>();
    expect(() => emitter.emit('test-event', 'hello')).not.toThrow();
  });
});
