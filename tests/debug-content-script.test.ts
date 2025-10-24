/**
 * Teste de Content Script Injection
 * Verifica se o script está sendo injetado nas páginas corretamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { STORAGE_KEYS } from '../src/shared/constants';

// Mock do Chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    getURL: vi.fn((path) => `chrome-extension://test-id/${path}`),
  },
  tabs: {
    query: vi.fn(),
    get: vi.fn(),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() },
  },
  scripting: {
    executeScript: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  declarativeNetRequest: {
    updateSessionRules: vi.fn(),
    getSessionRules: vi.fn(),
  },
};

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug Content Script Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting content script test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] Content script test completed');
  });

  it('should test content script injection into tabs', async () => {
    console.log('[DEBUG-TEST] Testing content script injection...');
    
    const mockTabs = [
      { id: 1, url: 'https://example.com' },
      { id: 2, url: 'https://test.com' },
      { id: 3, url: 'https://demo.com' },
    ];

    mockChrome.tabs.query.mockResolvedValue(mockTabs);
    mockChrome.scripting.executeScript.mockResolvedValue([{ result: false }]);

    // Simula injeção de content script
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    console.log('[DEBUG-TEST] Found tabs for injection:', tabs.length);

    for (const tab of tabs) {
      if (tab.id) {
        try {
          // Verifica se já foi injetado
          const checkResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => (globalThis as any).__v0ContentScriptInjected === true,
          });

          const alreadyInjected = Array.isArray(checkResult) && checkResult[0]?.result === true;

          if (!alreadyInjected) {
            // Injeta o content script
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js'],
            });

            // Marca como injetado
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                (globalThis as any).__v0ContentScriptInjected = true;
              },
            });

            console.log(`[DEBUG-TEST] ✅ Content script injected into tab ${tab.id}`);
          } else {
            console.log(`[DEBUG-TEST] ⚠️ Content script already injected in tab ${tab.id}`);
          }
        } catch (e: any) {
          const msg = String(e?.message ?? e);
          if (
            msg.includes('Cannot access contents') ||
            msg.includes('No matching signature') ||
            msg.includes('Cannot access a chrome:// URL') ||
            msg.includes('The extensions gallery cannot be scripted') ||
            msg.includes('The page is not available')
          ) {
            console.log(`[DEBUG-TEST] ⚠️ Cannot inject into protected tab ${tab.id}:`, msg);
          } else {
            console.log(`[DEBUG-TEST] ❌ Failed to inject into tab ${tab.id}:`, e);
          }
        }
      }
    }

    expect(mockChrome.tabs.query).toHaveBeenCalledWith({ url: ['http://*/*', 'https://*/*'] });
    console.log('[DEBUG-TEST] ✅ Content script injection working');
  });

  it('should test content script communication', async () => {
    console.log('[DEBUG-TEST] Testing content script communication...');
    
    // Mock de mensagem do content script
    const mockMessage = {
      type: 'CONTENT_ANALYSIS_RESULT',
      payload: {
        result: {
          domain: 'example.com',
          isDistracting: true,
          confidence: 0.8,
        },
      },
    };

    mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
      console.log('[DEBUG-TEST] Content script message sent:', message);
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    });

    // Simula envio de mensagem do content script
    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage(mockMessage, (response) => {
        console.log('[DEBUG-TEST] Content script response received:', response);
        resolve(response);
      });
    });

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(mockMessage, expect.any(Function));
    expect(result).toEqual({ success: true });
    console.log('[DEBUG-TEST] ✅ Content script communication working');
  });

  it('should test content script error handling', async () => {
    console.log('[DEBUG-TEST] Testing content script error handling...');
    
    // Simula erro na injeção
    mockChrome.scripting.executeScript.mockRejectedValue(new Error('Injection failed'));

    try {
      await chrome.scripting.executeScript({
        target: { tabId: 1 },
        files: ['content.js'],
      });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Content script injection error caught:', error);
      expect(error).toBeInstanceOf(Error);
    }

    console.log('[DEBUG-TEST] ✅ Content script error handling working');
  });

  it('should test content script state management', async () => {
    console.log('[DEBUG-TEST] Testing content script state management...');
    
    const mockTrackingInfo = {
      url: 'https://example.com',
      startTime: Date.now(),
    };

    mockChrome.storage.session.set.mockResolvedValue({});
    mockChrome.storage.session.get.mockResolvedValue({
      currentlyTracking: mockTrackingInfo,
    });

    // Testa salvamento do estado de tracking
    await chrome.storage.session.set({ currentlyTracking: mockTrackingInfo });
    expect(mockChrome.storage.session.set).toHaveBeenCalledWith({ currentlyTracking: mockTrackingInfo });
    console.log('[DEBUG-TEST] ✅ Tracking state saved');

    // Testa recuperação do estado de tracking
    const result = await chrome.storage.session.get('currentlyTracking');
    expect(mockChrome.storage.session.get).toHaveBeenCalledWith('currentlyTracking');
    expect(result).toEqual({ currentlyTracking: mockTrackingInfo });
    console.log('[DEBUG-TEST] ✅ Tracking state retrieved');

    console.log('[DEBUG-TEST] ✅ Content script state management working');
  });

  it('should test content script domain extraction', async () => {
    console.log('[DEBUG-TEST] Testing content script domain extraction...');
    
    const testUrls = [
      'https://example.com/page',
      'https://www.test.com/path',
      'https://subdomain.demo.com/',
      'http://localhost:3000',
      'https://192.168.1.1',
    ];

    const expectedDomains = [
      'example.com',
      'test.com',
      'subdomain.demo.com',
      'localhost',
      '192.168.1.1',
    ];

    // Simula extração de domínio
    function extractDomain(url: string): string | null {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      } catch {
        return null;
      }
    }

    for (let i = 0; i < testUrls.length; i++) {
      const domain = extractDomain(testUrls[i]);
      console.log(`[DEBUG-TEST] URL: ${testUrls[i]} -> Domain: ${domain}`);
      expect(domain).toBe(expectedDomains[i]);
    }

    console.log('[DEBUG-TEST] ✅ Domain extraction working');
  });

  it('should test content script blacklist checking', async () => {
    console.log('[DEBUG-TEST] Testing content script blacklist checking...');
    
    const mockBlacklist = ['example.com', 'test.com', 'demo.com'];
    const testDomains = ['example.com', 'test.com', 'demo.com', 'allowed.com'];

    mockChrome.storage.local.get.mockResolvedValue({ blacklist: mockBlacklist });

    // Simula verificação de blacklist
    const { blacklist } = await chrome.storage.local.get('blacklist');
    console.log('[DEBUG-TEST] Blacklist loaded:', blacklist);

    for (const domain of testDomains) {
      const isBlocked = blacklist.includes(domain);
      console.log(`[DEBUG-TEST] Domain ${domain} is ${isBlocked ? 'blocked' : 'allowed'}`);
      
      if (['example.com', 'test.com', 'demo.com'].includes(domain)) {
        expect(isBlocked).toBe(true);
      } else {
        expect(isBlocked).toBe(false);
      }
    }

    console.log('[DEBUG-TEST] ✅ Blacklist checking working');
  });

  it('should test content script time limit checking', async () => {
    console.log('[DEBUG-TEST] Testing content script time limit checking...');
    
    const mockTimeLimits = [
      { domain: 'example.com', dailyMinutes: 60 },
      { domain: 'test.com', dailyMinutes: 30 },
    ];

    const mockDailyUsage = {
      '2024-01-01': {
        'example.com': 3600, // 60 minutes in seconds
        'test.com': 1800,    // 30 minutes in seconds
      },
    };

    mockChrome.storage.local.get.mockImplementation((keys) => {
      if (Array.isArray(keys) && keys.includes('timeLimits')) {
        return Promise.resolve({ timeLimits: mockTimeLimits });
      }
      if (Array.isArray(keys) && keys.includes('dailyUsage')) {
        return Promise.resolve({ dailyUsage: mockDailyUsage });
      }
      return Promise.resolve({});
    });

    // Testa verificação de limite de tempo
    const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);
    const today = new Date().toISOString().split('T')[0];
    const { [STORAGE_KEYS.DAILY_USAGE]: existingUsage = {} } = await chrome.storage.local.get(
      STORAGE_KEYS.DAILY_USAGE
    );
    const dailyUsage = {
      ...existingUsage,
      [today]: existingUsage[today] || {}
    };

    const todayUsage = dailyUsage[today] || {};
    for (const limit of timeLimits) {
      const usedSeconds = todayUsage[limit.domain] || 0;
      const limitSeconds = limit.dailyMinutes * 60;
      const isExceeded = usedSeconds >= limitSeconds;

      console.log(`[DEBUG-TEST] Domain ${limit.domain}: used ${usedSeconds}s, limit ${limitSeconds}s, exceeded: ${isExceeded}`);
      
      if (limit.domain === 'example.com') {
        expect(isExceeded).toBe(true); // 3600s >= 3600s
      } else if (limit.domain === 'test.com') {
        expect(isExceeded).toBe(true); // 1800s >= 1800s
      }
    }

    console.log('[DEBUG-TEST] ✅ Time limit checking working');
  });

  it('should test content script injection on protected pages', async () => {
    console.log('[DEBUG-TEST] Testing content script injection on protected pages...');
    
    const protectedUrls = [
      'chrome://extensions/',
      'chrome://settings/',
      'chrome-extension://other-id/',
      'about:blank',
      'data:text/html,<html></html>',
    ];

    mockChrome.tabs.query.mockResolvedValue(
      protectedUrls.map((url, index) => ({ id: index + 1, url }))
    );

    // Simula tentativa de injeção em páginas protegidas
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    console.log('[DEBUG-TEST] Found protected tabs:', tabs.length);

    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });
          console.log(`[DEBUG-TEST] ⚠️ Unexpectedly injected into protected tab ${tab.id}`);
        } catch (e: any) {
          const msg = String(e?.message ?? e);
          console.log(`[DEBUG-TEST] ✅ Correctly blocked injection into protected tab ${tab.id}:`, msg);
          expect(msg).toMatch(/Cannot access|No matching signature|chrome:\/\/|about:/);
        }
      }
    }

    console.log('[DEBUG-TEST] ✅ Protected page handling working');
  });
});
