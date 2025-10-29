/**
 * Unit tests for utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { deepEqual } from '../../../src/shared/utils';
import { getLogCollector } from '../../utils/log-collector';

describe('deepEqual', () => {
  beforeEach(() => {
    getLogCollector().setTestName('deepEqual');
  });

  it('should return true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('test', 'test')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('test', 'test2')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it('should handle arrays', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
  });

  it('should handle nested arrays', () => {
    expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
    expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false);
  });

  it('should handle objects', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({}, {})).toBe(true);
  });

  it('should handle nested objects', () => {
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('should handle mixed structures', () => {
    expect(deepEqual(
      { a: [1, 2], b: { c: 3 } },
      { a: [1, 2], b: { c: 3 } }
    )).toBe(true);
    expect(deepEqual(
      { a: [1, 2], b: { c: 3 } },
      { a: [1, 2], b: { c: 4 } }
    )).toBe(false);
  });

  it('should handle null and undefined', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual({ a: null }, { a: null })).toBe(true);
  });

  it('should handle different types', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual([1], { 0: 1 })).toBe(false);
  });
});

