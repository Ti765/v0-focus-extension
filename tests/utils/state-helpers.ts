/**
 * State helper utilities for testing
 */

import { mockChrome } from '../mocks/chrome-api';
import type { AppState } from '../../src/shared/types';
import { STORAGE_KEYS } from '../../src/shared/constants';

export async function getAppStateFromStorage(): Promise<AppState> {
  const localKeys = [
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.TIME_LIMITS,
    STORAGE_KEYS.DAILY_USAGE,
    STORAGE_KEYS.POMODORO_STATUS,
    STORAGE_KEYS.SITE_CUSTOMIZATIONS,
  ];

  const [local, sync] = await Promise.all([
    mockChrome.storage.local.get(localKeys),
    mockChrome.storage.sync.get(STORAGE_KEYS.SETTINGS),
  ]);

  const today = new Date().toISOString().split('T')[0];

  return {
    isLoading: false,
    error: null,
    blacklist: (local[STORAGE_KEYS.BLACKLIST] || []).map((entry: any) => {
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'object' && entry?.domain) return String(entry.domain);
      return String(entry);
    }),
    timeLimits: local[STORAGE_KEYS.TIME_LIMITS] || [],
    dailyUsage: local[STORAGE_KEYS.DAILY_USAGE] || {
      [today]: {
        date: today,
        totalMinutes: 0,
        perDomain: {},
      },
    },
    pomodoro: local[STORAGE_KEYS.POMODORO_STATUS] || {
      config: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        cyclesBeforeLongBreak: 4,
        autoStartBreaks: false,
      },
      state: {
        phase: 'idle',
        isPaused: false,
        cycleIndex: 0,
        remainingMs: 0,
      },
    },
    siteCustomizations: local[STORAGE_KEYS.SITE_CUSTOMIZATIONS] || {},
    settings: sync[STORAGE_KEYS.SETTINGS] || {
      theme: 'system',
      blockMode: 'soft',
      notifications: true,
      syncWithCloud: false,
      language: 'pt-BR',
      telemetry: false,
    },
  };
}

export async function verifyStorageConsistency(expectedState: Partial<AppState>): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const actualState = await getAppStateFromStorage();
  const errors: string[] = [];

  if (expectedState.blacklist !== undefined) {
    const actualBlacklist = actualState.blacklist.sort();
    const expectedBlacklist = expectedState.blacklist.sort();
    if (JSON.stringify(actualBlacklist) !== JSON.stringify(expectedBlacklist)) {
      errors.push(`Blacklist mismatch: expected ${JSON.stringify(expectedBlacklist)}, got ${JSON.stringify(actualBlacklist)}`);
    }
  }

  if (expectedState.timeLimits !== undefined) {
    const actualLimits = JSON.stringify(actualState.timeLimits);
    const expectedLimits = JSON.stringify(expectedState.timeLimits);
    if (actualLimits !== expectedLimits) {
      errors.push(`Time limits mismatch: expected ${expectedLimits}, got ${actualLimits}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createStateSnapshot(label: string): Record<string, any> {
  return {
    label,
    timestamp: new Date().toISOString(),
    storage: {
      local: (mockChrome.storage.local as any).getData(),
      sync: (mockChrome.storage.sync as any).getData(),
      session: (mockChrome.storage.session as any).getData(),
    },
  };
}

