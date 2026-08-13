import { describe, it, expect, beforeEach } from 'vitest';
import { generateId, _resetCounter } from '../../src/core/id';

describe('generateId', () => {
  beforeEach(() => {
    _resetCounter();
  });

  it('should return a string starting with "dlg-"', () => {
    const id = generateId();
    expect(id).toMatch(/^dlg-/);
  });

  it('should return unique IDs on subsequent calls', () => {
    const ids = new Set([generateId(), generateId(), generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(5);
  });

  it('should include a counter in the ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    const counter1 = parseInt(id1.split('-')[2]!);
    const counter2 = parseInt(id2.split('-')[2]!);
    expect(counter2).toBe(counter1 + 1);
  });

  it('should reset counter when _resetCounter is called', () => {
    generateId(); // counter = 1
    generateId(); // counter = 2
    _resetCounter();
    const id = generateId(); // counter = 1 again
    expect(id.endsWith('-1')).toBe(true);
  });
});
