/**
 * Integration tests for storage synchronization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mockChrome } from '../mocks/chrome-api';
import { getLogCollector } from '../utils/log-collector';
import { createStateSnapshot } from '../utils/state-helpers';
import { verifyStorageConsistency } from '../utils/state-helpers';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../../src/shared/constants';

describe('Storage Synchronization', () => {
  beforeEach(async () => {
    getLogCollector().setTestName('storage-sync');
    await mockChrome.storage.local.clear();
    await mockChrome.storage.sync.clear();
  });

  describe('Local Storage', () => {
    it('should persist blacklist data', async () => {
      const stateBefore = createStateSnapshot('before set');
      
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      const stored = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      expect(stored[STORAGE_KEYS.BLACKLIST]).toBeDefined();
      expect(stored[STORAGE_KEYS.BLACKLIST].length).toBe(1);

      const stateAfter = createStateSnapshot('after set');
      getLogCollector().logStateChange('Blacklist persisted', stateBefore, stateAfter);
    });

    it('should persist time limits', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.TIME_LIMITS]: [
          { domain: 'facebook.com', dailyMinutes: 30 },
        ],
      });

      const stored = await mockChrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);
      expect(stored[STORAGE_KEYS.TIME_LIMITS]).toBeDefined();
      expect(stored[STORAGE_KEYS.TIME_LIMITS][0].domain).toBe('facebook.com');
      
      getLogCollector().log('info', 'Time limits persisted');
    });

    it('should persist daily usage', async () => {
      const today = new Date().toISOString().split('T')[0];
      const usage = {
        [today]: {
          date: today,
          totalMinutes: 120,
          perDomain: {
            'youtube.com': 3600,
          },
        },
      };

      await mockChrome.storage.local.set({
        [STORAGE_KEYS.DAILY_USAGE]: usage,
      });

      const stored = await mockChrome.storage.local.get(STORAGE_KEYS.DAILY_USAGE);
      expect(stored[STORAGE_KEYS.DAILY_USAGE][today]).toBeDefined();
      expect(stored[STORAGE_KEYS.DAILY_USAGE][today].totalMinutes).toBe(120);
      
      getLogCollector().log('info', 'Daily usage persisted', {
        date: today,
        totalMinutes: stored[STORAGE_KEYS.DAILY_USAGE][today].totalMinutes,
      });
    });
  });

  describe('Sync Storage', () => {
    it('should persist settings', async () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        theme: 'dark',
        notifications: false,
      };

      await mockChrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: settings,
      });

      const stored = await mockChrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      expect(stored[STORAGE_KEYS.SETTINGS].theme).toBe('dark');
      expect(stored[STORAGE_KEYS.SETTINGS].notifications).toBe(false);
      
      getLogCollector().log('info', 'Settings persisted', {
        theme: stored[STORAGE_KEYS.SETTINGS].theme,
      });
    });
  });

  describe('Storage Consistency', () => {
    it('should verify storage consistency', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      const result = await verifyStorageConsistency({
        blacklist: ['youtube.com'],
      });

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      
      getLogCollector().log('info', 'Storage consistency verified', {
        valid: result.valid,
        errors: result.errors,
      });
    });

    it('should detect inconsistencies', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      const result = await verifyStorageConsistency({
        blacklist: ['facebook.com'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      getLogCollector().log('warn', 'Storage inconsistency detected', {
        valid: result.valid,
        errors: result.errors,
      });
    });
  });

  describe('Storage Events', () => {
    it('should trigger onChanged events', async () => {
      let changeDetected = false;
      let changedKey = '';

      mockChrome.storage.onChanged.addListener((changes, areaName) => {
        changeDetected = true;
        changedKey = Object.keys(changes)[0];
      });

      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      // Wait for async event
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(changeDetected).toBe(true);
      expect(changedKey).toBe(STORAGE_KEYS.BLACKLIST);
      
      getLogCollector().log('info', 'Storage change event triggered', {
        key: changedKey,
        area: 'local',
      });
    });
  });
});

