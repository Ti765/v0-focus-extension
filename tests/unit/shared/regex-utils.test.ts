/**
 * Unit tests for regex utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createDomainUrlFilter } from '../../../src/shared/regex-utils';
import { getLogCollector } from '../../utils/log-collector';

describe('createDomainUrlFilter', () => {
  beforeEach(() => {
    getLogCollector().setTestName('createDomainUrlFilter');
  });

  it('should create correct urlFilter pattern', () => {
    expect(createDomainUrlFilter('youtube.com')).toBe('||youtube.com');
    expect(createDomainUrlFilter('example.com')).toBe('||example.com');
  });

  it('should handle domains with subdomains', () => {
    expect(createDomainUrlFilter('www.youtube.com')).toBe('||www.youtube.com');
    expect(createDomainUrlFilter('subdomain.example.com')).toBe('||subdomain.example.com');
  });

  it('should handle edge cases', () => {
    expect(createDomainUrlFilter('localhost')).toBe('||localhost');
    expect(createDomainUrlFilter('localhost:3000')).toBe('||localhost:3000');
  });
});

