/**
 * Integration tests for message handler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleMessage, getAppState, notifyStateUpdate } from '../../src/background/modules/message-handler';
import { MESSAGE } from '../../src/shared/types';
import { mockChrome } from '../mocks/chrome-api';
import { getLogCollector } from '../utils/log-collector';
import { createMockMessage } from '../utils/test-helpers';
import { createStateSnapshot } from '../utils/state-helpers';
import { STORAGE_KEYS } from '../../src/shared/constants';

describe('Message Handler', () => {
  beforeEach(async () => {
    getLogCollector().setTestName('message-handler');
    await mockChrome.storage.local.clear();
    await mockChrome.storage.sync.clear();
  });

  describe('GET_INITIAL_STATE', () => {
    it('should return initial app state', async () => {
      const message = createMockMessage(MESSAGE.GET_INITIAL_STATE);
      const sender = {} as chrome.runtime.MessageSender;
      
      const state = await handleMessage(message, sender);
      
      expect(state).toBeDefined();
      expect(state.blacklist).toBeDefined();
      expect(state.timeLimits).toBeDefined();
      expect(state.pomodoro).toBeDefined();
      expect(state.settings).toBeDefined();
      
      getLogCollector().log('info', 'Initial state retrieved', {
        stateKeys: Object.keys(state),
      });
    });
  });

  describe('ADD_TO_BLACKLIST', () => {
    it('should add domain to blacklist', async () => {
      const message = createMockMessage(MESSAGE.ADD_TO_BLACKLIST, {
        domain: 'youtube.com',
      });
      const sender = {} as chrome.runtime.MessageSender;
      
      const stateBefore = createStateSnapshot('before add');
      const response = await handleMessage(message, sender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      expect(blacklist.length).toBeGreaterThan(0);
      
      const stateAfter = createStateSnapshot('after add');
      getLogCollector().logStateChange('Domain added via message', stateBefore, stateAfter, {
        domain: 'youtube.com',
      });
    });

    it('should handle invalid payload gracefully', async () => {
      const message = createMockMessage(MESSAGE.ADD_TO_BLACKLIST, {
        domain: null,
      });
      const sender = {} as chrome.runtime.MessageSender;
      
      await expect(handleMessage(message, sender)).resolves.not.toThrow();
      
      getLogCollector().log('info', 'Invalid payload handled gracefully');
    });
  });

  describe('REMOVE_FROM_BLACKLIST', () => {
    it('should remove domain from blacklist', async () => {
      // First add a domain
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
      });

      const message = createMockMessage(MESSAGE.REMOVE_FROM_BLACKLIST, {
        domain: 'youtube.com',
      });
      const sender = {} as chrome.runtime.MessageSender;
      
      const stateBefore = createStateSnapshot('before remove');
      const response = await handleMessage(message, sender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const blacklist = storage[STORAGE_KEYS.BLACKLIST] || [];
      
      expect(blacklist.length).toBe(0);
      
      const stateAfter = createStateSnapshot('after remove');
      getLogCollector().logStateChange('Domain removed via message', stateBefore, stateAfter);
    });
  });

  describe('POMODORO_START', () => {
    it('should start Pomodoro timer', async () => {
      const message = createMockMessage(MESSAGE.POMODORO_START);
      const sender = {} as chrome.runtime.MessageSender;
      
      const response = await handleMessage(message, sender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS);
      const pomodoro = storage[STORAGE_KEYS.POMODORO_STATUS];
      
      expect(pomodoro.state.phase).toBe('focus');
      
      getLogCollector().log('info', 'Pomodoro started via message', {
        phase: pomodoro.state.phase,
      });
    });
  });

  describe('POMODORO_STOP', () => {
    it('should stop Pomodoro timer', async () => {
      // First start Pomodoro
      const startMessage = createMockMessage(MESSAGE.POMODORO_START);
      await handleMessage(startMessage, {} as chrome.runtime.MessageSender);

      const stopMessage = createMockMessage(MESSAGE.POMODORO_STOP);
      const response = await handleMessage(stopMessage, {} as chrome.runtime.MessageSender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS);
      const pomodoro = storage[STORAGE_KEYS.POMODORO_STATUS];
      
      expect(pomodoro.state.phase).toBe('idle');
      
      getLogCollector().log('info', 'Pomodoro stopped via message');
    });
  });

  describe('TIME_LIMIT_SET', () => {
    it('should set time limit', async () => {
      const message = createMockMessage(MESSAGE.TIME_LIMIT_SET, {
        domain: 'youtube.com',
        dailyMinutes: 60,
      });
      const sender = {} as chrome.runtime.MessageSender;
      
      const response = await handleMessage(message, sender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);
      const timeLimits = storage[STORAGE_KEYS.TIME_LIMITS] || [];
      
      const limit = timeLimits.find((entry: any) => entry.domain === 'youtube.com');
      expect(limit).toBeDefined();
      expect(limit.dailyMinutes).toBe(60);
      
      getLogCollector().log('info', 'Time limit set via message', {
        domain: 'youtube.com',
        limitMinutes: 60,
      });
    });
  });

  describe('STATE_PATCH', () => {
    it('should update settings', async () => {
      const message = createMockMessage(MESSAGE.STATE_PATCH, {
        patch: {
          settings: {
            theme: 'dark',
            notifications: false,
          },
        },
      });
      const sender = {} as chrome.runtime.MessageSender;
      
      const response = await handleMessage(message, sender);
      
      expect(response.success).toBe(true);
      
      const storage = await mockChrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const settings = storage[STORAGE_KEYS.SETTINGS];
      
      expect(settings.theme).toBe('dark');
      expect(settings.notifications).toBe(false);
      
      getLogCollector().log('info', 'Settings updated via STATE_PATCH', {
        theme: settings.theme,
        notifications: settings.notifications,
      });
    });
  });

  describe('notifyStateUpdate', () => {
    it('should notify state changes', async () => {
      const stateBefore = createStateSnapshot('before notify');
      
      await notifyStateUpdate();
      
      // Should not throw
      expect(true).toBe(true);
      
      const stateAfter = createStateSnapshot('after notify');
      getLogCollector().logStateChange('State update notified', stateBefore, stateAfter);
    });
  });

  describe('getAppState', () => {
    it('should aggregate state from storage', async () => {
      await mockChrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: [
          { domain: 'youtube.com', addedAt: new Date().toISOString() },
        ],
        [STORAGE_KEYS.TIME_LIMITS]: [
          { domain: 'facebook.com', dailyMinutes: 30 },
        ],
      });

      const state = await getAppState();
      
      expect(state.blacklist.length).toBe(1);
      expect(state.timeLimits.length).toBe(1);
      
      getLogCollector().log('info', 'App state aggregated', {
        blacklistCount: state.blacklist.length,
        timeLimitsCount: state.timeLimits.length,
      });
    });
  });
});

