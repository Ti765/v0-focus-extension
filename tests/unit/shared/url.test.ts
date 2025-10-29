/**
 * Unit tests for url utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeDomain, extractDomain } from '../../../src/shared/url';
import { getLogCollector } from '../../utils/log-collector';

describe('normalizeDomain', () => {
  beforeEach(() => {
    getLogCollector().setTestName('normalizeDomain');
  });

  it('should normalize domain with www prefix', () => {
    expect(normalizeDomain('www.youtube.com')).toBe('youtube.com');
    expect(normalizeDomain('www.example.com')).toBe('example.com');
  });

  it('should normalize full URLs', () => {
    expect(normalizeDomain('https://www.youtube.com/watch?v=test')).toBe('youtube.com');
    expect(normalizeDomain('http://www.example.com/path')).toBe('example.com');
    expect(normalizeDomain('https://example.com')).toBe('example.com');
  });

  it('should handle domains without www', () => {
    expect(normalizeDomain('youtube.com')).toBe('youtube.com');
    expect(normalizeDomain('github.com')).toBe('github.com');
  });

  it('should handle URLs without protocol', () => {
    expect(normalizeDomain('youtube.com/foo')).toBe('youtube.com');
    expect(normalizeDomain('subdomain.example.com/path')).toBe('subdomain.example.com');
  });

  it('should handle localhost', () => {
    expect(normalizeDomain('localhost:3000')).toBe('localhost');
    expect(normalizeDomain('http://localhost:3000')).toBe('localhost');
  });

  it('should handle empty or invalid input', () => {
    expect(normalizeDomain('')).toBe('');
    expect(normalizeDomain('   ')).toBe('');
  });

  it('should handle edge cases', () => {
    expect(normalizeDomain('www.www.example.com')).toBe('www.example.com');
    expect(normalizeDomain('http://www.www.example.com')).toBe('www.example.com');
  });
});

describe('extractDomain', () => {
  beforeEach(() => {
    getLogCollector().setTestName('extractDomain');
  });

  it('should extract domain from full URLs', () => {
    expect(extractDomain('https://www.youtube.com/watch?v=test')).toBe('youtube.com');
    expect(extractDomain('http://www.example.com/path')).toBe('example.com');
  });

  it('should extract domain from subdomains', () => {
    expect(extractDomain('https://subdomain.example.com')).toBe('example.com');
    expect(extractDomain('https://www.blog.example.com')).toBe('example.com');
  });

  it('should handle special TLDs', () => {
    expect(extractDomain('https://www.example.co.uk')).toBe('example.co.uk');
    expect(extractDomain('https://www.example.com.br')).toBe('example.com.br');
    expect(extractDomain('https://www.example.co.jp')).toBe('example.co.jp');
  });

  it('should handle domains without www', () => {
    expect(extractDomain('youtube.com')).toBe('youtube.com');
    expect(extractDomain('https://github.com')).toBe('github.com');
  });

  it('should handle URLs without protocol', () => {
    expect(extractDomain('youtube.com/foo')).toBe('youtube.com');
    expect(extractDomain('subdomain.example.com/path')).toBe('example.com');
  });

  it('should handle empty or invalid input', () => {
    expect(extractDomain('')).toBe('');
    // extractDomain doesn't trim whitespace - this is expected behavior
    expect(extractDomain('   ')).toBe('   ');
  });

  it('should handle edge cases', () => {
    expect(extractDomain('localhost:3000')).toBe('localhost');
    expect(extractDomain('http://localhost:3000')).toBe('localhost');
  });
});

