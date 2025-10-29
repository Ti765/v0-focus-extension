/**
 * Integration tests for blocker module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initializeBlocker, 
  addToBlacklist, 
  removeFromBlacklist,
  enablePomodoroBlocking,
  disablePomodoroBlocking,
  cleanupAllDNRRules,
} from '../../src/background/modules/blocker';
import { mockChrome } from '../mocks/chrome-api';
import { getLogCollector } from '../utils/log-collector';
import { getDNRRules, getStorageSnapshot } from '../utils/test-helpers';
import { createStateSnapshot } from '../utils/state-helpers';
import { STORAGE_KEYS } from '../../src/shared/constants';

describe('Blocker Module', () => {
  beforeEach(async () => {
    getLogCollector().setTestName('blocker');
    await cleanupAllDNRRules();
    await mockChrome.storage.local.clear();
    await mockChrome.storage.sync.clear();
  });

  describe('initializeBlocker', () => {
    it('should initialize without errors', async () => {
      const stateBefore = createStateSnapshot('before init');
      await expect(initializeBlocker()).resolves.not.toThrow();
      const stateAfter = createStateSnapshot('after init');
      
      getLogCollector().logStateChange('Blocker initialized', stateBefore, stateAfter);
    });

    it('should sync existing blacklist rules', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      await initializeBlocker();

      const rules = await getDNRRules();
      expect(rules.dynamic.length).toBeGreaterThan(0);
      
      getLogCollector().log('info', 'Blacklist rules synced', {
        ruleCount: rules.dynamic.length,
      });
    });
  });

  describe('addToBlacklist', () => {
    it('should add domain to blacklist', async () => {
      const domain = 'youtube.com';
      const stateBefore = createStateSnapshot('before add');
      
      await addToBlacklist(domain);

      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      expect(blacklist.some((entry: any) => {
        const entryDomain = typeof entry === 'string' ? entry : entry.domain;
        return entryDomain === domain;
      })).toBe(true);

      const stateAfter = createStateSnapshot('after add');
      getLogCollector().logStateChange('Domain added to blacklist', stateBefore, stateAfter, {
        domain,
      });
    });

    it('should create DNR rule for added domain', async () => {
      const domain = 'example.com';
      
      await addToBlacklist(domain);

      const rules = await getDNRRules();
      // The urlFilter format is ||domain, so we check for domain in urlFilter
      const domainRule = rules.dynamic.find(rule => {
        const urlFilter = rule.condition.urlFilter || '';
        const regexFilter = rule.condition.regexFilter || '';
        return urlFilter.includes(domain) || regexFilter.includes(domain);
      });
      
      expect(domainRule).toBeDefined();
      
      getLogCollector().log('info', 'DNR rule created', {
        domain,
        ruleId: domainRule?.id,
        urlFilter: domainRule?.condition.urlFilter,
        regexFilter: domainRule?.condition.regexFilter,
        allRules: rules.dynamic,
      });
    });

    it('should not add duplicate domains', async () => {
      const domain = 'youtube.com';
      
      await addToBlacklist(domain);
      const storage1 = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const count1 = (storage1[STORAGE_KEYS.BLACKLIST] || []).length;
      
      await addToBlacklist(domain);
      const storage2 = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const count2 = (storage2[STORAGE_KEYS.BLACKLIST] || []).length;
      
      expect(count2).toBe(count1);
      
      getLogCollector().log('info', 'Duplicate domain not added', { domain });
    });

    it('should normalize domain before adding', async () => {
      await addToBlacklist('www.youtube.com');
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      const hasYoutube = blacklist.some((entry: any) => {
        const entryDomain = typeof entry === 'string' ? entry : entry.domain;
        return entryDomain === 'youtube.com';
      });
      
      expect(hasYoutube).toBe(true);
    });

    it('should handle invalid domains gracefully', async () => {
      const stateBefore = createStateSnapshot('before invalid add');
      
      await addToBlacklist('');
      await addToBlacklist('   ');
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      expect(blacklist.length).toBe(0);
      
      const stateAfter = createStateSnapshot('after invalid add');
      getLogCollector().logStateChange('Invalid domains handled', stateBefore, stateAfter);
    });
  });

  describe('removeFromBlacklist', () => {
    it('should remove domain from blacklist', async () => {
      const domain = 'youtube.com';
      await addToBlacklist(domain);
      
      const stateBefore = createStateSnapshot('before remove');
      await removeFromBlacklist(domain);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      expect(blacklist.some((entry: any) => {
        const entryDomain = typeof entry === 'string' ? entry : entry.domain;
        return entryDomain === domain;
      })).toBe(false);
      
      const stateAfter = createStateSnapshot('after remove');
      getLogCollector().logStateChange('Domain removed from blacklist', stateBefore, stateAfter, {
        domain,
      });
    });

    it('should remove DNR rule when domain is removed', async () => {
      const domain = 'example.com';
      await addToBlacklist(domain);
      
      const rulesBefore = await getDNRRules();
      const ruleCountBefore = rulesBefore.dynamic.length;
      
      await removeFromBlacklist(domain);
      
      const rulesAfter = await getDNRRules();
      const ruleCountAfter = rulesAfter.dynamic.length;
      
      expect(ruleCountAfter).toBeLessThan(ruleCountBefore);
      
      getLogCollector().log('info', 'DNR rule removed', {
        domain,
        rulesBefore: ruleCountBefore,
        rulesAfter: ruleCountAfter,
      });
    });

    it('should handle removing non-existent domain gracefully', async () => {
      await removeFromBlacklist('nonexistent.com');
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Pomodoro Blocking', () => {
    it('should enable Pomodoro blocking', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
          { domain: 'facebook.com', addedAt: new Date().toISOString() },
        ],
      });

      await enablePomodoroBlocking();

      const rules = await getDNRRules();
      const pomodoroRules = rules.dynamic.filter(r => r.id >= 1000 && r.id < 2000);
      
      expect(pomodoroRules.length).toBeGreaterThan(0);
      
      getLogCollector().log('info', 'Pomodoro blocking enabled', {
        pomodoroRuleCount: pomodoroRules.length,
      });
    });

    it('should disable Pomodoro blocking', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      await enablePomodoroBlocking();
      const rulesBefore = await getDNRRules();
      const pomodoroRedirectRulesBefore = rulesBefore.dynamic.filter(r => r.id >= 1000 && r.id < 2000);
      const pomodoroCacheRulesBefore = rulesBefore.dynamic.filter(r => r.id >= 11000 && r.id < 12000);
      
      await disablePomodoroBlocking();
      
      const rulesAfter = await getDNRRules();
      const pomodoroRedirectRulesAfter = rulesAfter.dynamic.filter(r => r.id >= 1000 && r.id < 2000);
      const pomodoroCacheRulesAfter = rulesAfter.dynamic.filter(r => r.id >= 11000 && r.id < 12000);
      
      expect(pomodoroRedirectRulesAfter.length).toBe(0);
      expect(pomodoroCacheRulesAfter.length).toBe(0);
      expect(pomodoroRedirectRulesBefore.length).toBeGreaterThan(0);
      expect(pomodoroCacheRulesBefore.length).toBeGreaterThan(0);
      
      getLogCollector().log('info', 'Pomodoro blocking disabled', {
        redirectRulesBefore: pomodoroRedirectRulesBefore.length,
        redirectRulesAfter: pomodoroRedirectRulesAfter.length,
        cacheRulesBefore: pomodoroCacheRulesBefore.length,
        cacheRulesAfter: pomodoroCacheRulesAfter.length,
      });
    });
  });

  describe('cleanupAllDNRRules', () => {
    it('should remove all DNR rules', async () => {
      await addToBlacklist('youtube.com');
      await addToBlacklist('facebook.com');
      await enablePomodoroBlocking();
      
      const rulesBefore = await getDNRRules();
      expect(rulesBefore.dynamic.length).toBeGreaterThan(0);
      
      await cleanupAllDNRRules();
      
      const rulesAfter = await getDNRRules();
      expect(rulesAfter.dynamic.length).toBe(0);
      expect(rulesAfter.session.length).toBe(0);
      
      getLogCollector().log('info', 'All DNR rules cleaned up', {
        rulesBefore: rulesBefore.dynamic.length,
        rulesAfter: rulesAfter.dynamic.length,
      });
    });
  });
});

