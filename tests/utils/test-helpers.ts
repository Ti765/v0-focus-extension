/**
 * Test helper utilities
 */

import { mockChrome } from '../mocks/chrome-api';
import type { AppState } from '../../src/shared/types';

export function getStorageSnapshot(): {
  local: Record<string, any>;
  sync: Record<string, any>;
  session: Record<string, any>;
} {
  return {
    local: (mockChrome.storage.local as any).getData(),
    sync: (mockChrome.storage.sync as any).getData(),
    session: (mockChrome.storage.session as any).getData(),
  };
}

export function clearAllStorage(): void {
  mockChrome.storage.local.clear();
  mockChrome.storage.sync.clear();
  mockChrome.storage.session.clear();
}

export function setMockTabs(tabs: chrome.tabs.Tab[]): void {
  (mockChrome.tabs as any).setTabs(tabs);
}

export function triggerAlarm(name: string): void {
  (mockChrome.alarms as any).triggerAlarm(name);
}

export async function getDNRRules(): Promise<{
  dynamic: chrome.declarativeNetRequest.Rule[];
  session: chrome.declarativeNetRequest.Rule[];
}> {
  return {
    dynamic: await mockChrome.declarativeNetRequest.getDynamicRules(),
    session: await mockChrome.declarativeNetRequest.getSessionRules(),
  };
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createMockMessage(type: string, payload?: any): any {
  return {
    type,
    id: `test-${Date.now()}-${Math.random()}`,
    source: 'popup-ui' as const,
    ts: Date.now(),
    payload,
  };
}

export function createMockAppState(overrides?: Partial<AppState>): AppState {
  const today = new Date().toISOString().split('T')[0];
  return {
    isLoading: false,
    error: null,
    blacklist: [],
    timeLimits: [],
    dailyUsage: {
      [today]: {
        date: today,
        totalMinutes: 0,
        perDomain: {},
      },
    },
    siteCustomizations: {},
    pomodoro: {
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
    settings: {
      theme: 'system',
      blockMode: 'soft',
      notifications: true,
      syncWithCloud: false,
      language: 'pt-BR',
      telemetry: false,
    },
    ...overrides,
  };
}

