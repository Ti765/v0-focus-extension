import { vi } from 'vitest';
import { beforeAll, afterEach, beforeEach } from 'vitest';
import type { Chrome } from './mocks/chrome-api';

// Make Chrome API available globally
declare global {
  var chrome: any;
}

// Setup Chrome mocks synchronously before any imports
import { setupChromeMocks } from './mocks/chrome-api';
setupChromeMocks();

// Setup before all tests
beforeAll(async () => {
  // Ensure Chrome is available
  if (!global.chrome) {
    setupChromeMocks();
  }
});

// Reset mocks before each test
beforeEach(async () => {
  // Clear all mocks and reset state
  vi.clearAllMocks();
  
  // Reset Chrome storage (all return Promise<void>)
  if (global.chrome?.storage?.local) {
    await (global.chrome.storage.local as any).clear();
  }
  if (global.chrome?.storage?.sync) {
    await (global.chrome.storage.sync as any).clear();
  }
  if (global.chrome?.storage?.session) {
    await (global.chrome.storage.session as any).clear();
  }
  
  // Reset DNR rules (synchronous)
  if (global.chrome?.declarativeNetRequest) {
    (global.chrome.declarativeNetRequest as any).reset();
  }
  
  // Reset alarms (returns Promise<void>)
  if (global.chrome?.alarms) {
    await (global.chrome.alarms as any).clearAll();
  }
  
  // Reset tabs (synchronous)
  if (global.chrome?.tabs) {
    (global.chrome.tabs as any).reset();
  }
  
  // Reset runtime (synchronous)
  if (global.chrome?.runtime) {
    (global.chrome.runtime as any).reset();
  }
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Export test utilities
export * from './utils/test-helpers';
export * from './utils/log-collector';
export * from './utils/state-helpers';

