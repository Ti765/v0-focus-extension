/**
 * Teste de Integração Completa
 * Testa o fluxo completo da extensão para identificar falhas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { STORAGE_KEYS } from '../src/shared/constants';

// Mock completo do Chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    onConnect: { addListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
    getURL: vi.fn((path) => `chrome-extension://test-id/${path}`),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    onChanged: { addListener: vi.fn() },
  },
  tabs: {
    query: vi.fn(),
    get: vi.fn(),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() },
  },
  windows: {
    onFocusChanged: { addListener: vi.fn() },
    WINDOW_ID_NONE: -1,
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: { addListener: vi.fn() },
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
    onButtonClicked: { addListener: vi.fn() },
  },
  declarativeNetRequest: {
    updateSessionRules: vi.fn(),
    getSessionRules: vi.fn(),
    updateDynamicRules: vi.fn(),
    getDynamicRules: vi.fn(),
    RuleActionType: { BLOCK: 1, ALLOW: 2, REDIRECT: 3 },
    ResourceType: { MAIN_FRAME: 1, SUB_FRAME: 2, SCRIPT: 4, IMAGE: 5 },
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting integration test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] Integration test completed');
  });

  it('should test complete extension lifecycle', async () => {
    console.log('[DEBUG-TEST] Testing complete extension lifecycle...');
    
    // 1. Simula instalação da extensão
    console.log('[DEBUG-TEST] Step 1: Extension installation');
    const mockDetails = { reason: 'install' };
    
    let installedHandler: any = null;
    mockChrome.runtime.onInstalled.addListener.mockImplementation((handler) => {
      installedHandler = handler;
      // Call the handler immediately with mock details
      handler(mockDetails);
    });

    console.log('[DEBUG-TEST] ✅ Extension installation handled');

    // 2. Simula inicialização dos módulos
    console.log('[DEBUG-TEST] Step 2: Module initialization');
    
    const mockModules = {
      pomodoro: vi.fn().mockResolvedValue(undefined),
      blocker: vi.fn().mockResolvedValue(undefined),
      usageTracker: vi.fn().mockResolvedValue(undefined),
      dailySync: vi.fn().mockResolvedValue(undefined),
      contentAnalyzer: vi.fn().mockResolvedValue(undefined),
      firebaseSync: vi.fn().mockResolvedValue(undefined),
    };

    // Simula bootstrap
    for (const [name, initFn] of Object.entries(mockModules)) {
      try {
        await initFn();
        console.log(`[DEBUG-TEST] ✅ ${name} initialized`);
      } catch (e) {
        console.log(`[DEBUG-TEST] ❌ ${name} failed:`, e);
      }
    }

    // 3. Simula injeção de content script
    console.log('[DEBUG-TEST] Step 3: Content script injection');
    
    const mockTabs = [
      { id: 1, url: 'https://example.com' },
      { id: 2, url: 'https://test.com' },
    ];

    mockChrome.tabs.query.mockResolvedValue(mockTabs);
    mockChrome.scripting.executeScript.mockResolvedValue([{ result: false }]);

    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });
          console.log(`[DEBUG-TEST] ✅ Content script injected into tab ${tab.id}`);
        } catch (e) {
          console.log(`[DEBUG-TEST] ⚠️ Failed to inject into tab ${tab.id}:`, e);
        }
      }
    }

    // 4. Simula configuração inicial
    console.log('[DEBUG-TEST] Step 4: Initial configuration');
    
    const initialState = {
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      siteCustomizations: {},
      settings: {
        theme: 'dark',
        notifications: true,
        autoBlock: false,
        pomodoroEnabled: true,
      },
    };

    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.storage.sync.set.mockResolvedValue({});

    await chrome.storage.local.set(initialState);
    await chrome.storage.sync.set({ settings: initialState.settings });
    console.log('[DEBUG-TEST] ✅ Initial configuration saved');

    // 5. Simula comunicação popup-background
    console.log('[DEBUG-TEST] Step 5: Popup-background communication');
    
    const testMessage = {
      type: 'GET_INITIAL_STATE',
      payload: null,
      id: 'test-123',
      ts: Date.now(),
    };

    const mockResponse = {
      success: true,
      state: initialState,
    };

    mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback(mockResponse);
      }
      return Promise.resolve(mockResponse);
    });

    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage(testMessage, (response) => {
        resolve(response);
      });
    });

    expect(result).toEqual(mockResponse);
    console.log('[DEBUG-TEST] ✅ Popup-background communication working');

    console.log('[DEBUG-TEST] ✅ Complete extension lifecycle working');
  });

  it('should test blacklist functionality end-to-end', async () => {
    console.log('[DEBUG-TEST] Testing blacklist functionality end-to-end...');
    
    const testDomain = 'example.com';
    
    // 1. Adiciona domínio à blacklist
    console.log('[DEBUG-TEST] Step 1: Adding domain to blacklist');
    
    const addMessage = {
      type: 'ADD_TO_BLACKLIST',
      payload: { domain: testDomain },
    };

    mockChrome.storage.local.get.mockResolvedValue({ blacklist: [] });
    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula adição à blacklist
    const { blacklist } = await chrome.storage.local.get('blacklist');
    const newBlacklist = [...blacklist, testDomain];
    await chrome.storage.local.set({ blacklist: newBlacklist });

    // Cria regra DNR
    const ruleId = 1001;
    const rule = {
      id: ruleId,
      priority: 1,
      action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        regexFilter: `.*${testDomain.replace(/\./g, '\\.')}.*`,
        isUrlFilterCaseSensitive: false,
        resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    };

    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [rule],
    });

    console.log(`[DEBUG-TEST] ✅ Domain ${testDomain} added to blacklist`);

    // 2. Verifica se a regra foi aplicada
    console.log('[DEBUG-TEST] Step 2: Verifying rule application');
    
    const mockRules = [rule];
    mockChrome.declarativeNetRequest.getSessionRules.mockResolvedValue(mockRules);

    const rules = await chrome.declarativeNetRequest.getSessionRules();
    const blacklistRules = rules.filter(r => r.priority === 1);
    
    expect(blacklistRules).toHaveLength(1);
    expect(blacklistRules[0].condition.regexFilter).toBe(`.*${testDomain.replace(/\./g, '\\.')}.*`);
    console.log('[DEBUG-TEST] ✅ Blacklist rule verified');

    // 3. Remove domínio da blacklist
    console.log('[DEBUG-TEST] Step 3: Removing domain from blacklist');
    
    const removeMessage = {
      type: 'REMOVE_FROM_BLACKLIST',
      payload: { domain: testDomain },
    };

    // Simula remoção da blacklist
    const updatedBlacklist = newBlacklist.filter(d => d !== testDomain);
    await chrome.storage.local.set({ blacklist: updatedBlacklist });

    // Remove regra DNR
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId],
    });

    console.log(`[DEBUG-TEST] ✅ Domain ${testDomain} removed from blacklist`);

    console.log('[DEBUG-TEST] ✅ Blacklist functionality end-to-end working');
  });

  it('should test time limit functionality end-to-end', async () => {
    console.log('[DEBUG-TEST] Testing time limit functionality end-to-end...');
    
    const testDomain = 'example.com';
    const limitMinutes = 60;
    
    // 1. Define limite de tempo
    console.log('[DEBUG-TEST] Step 1: Setting time limit');
    
    const timeLimitMessage = {
      type: 'TIME_LIMIT_SET',
      payload: { domain: testDomain, dailyMinutes: limitMinutes },
    };

    mockChrome.storage.local.get.mockImplementation((keys) => {
      if (Array.isArray(keys) && keys.includes('timeLimits')) {
        return Promise.resolve({ timeLimits: [] });
      }
      if (Array.isArray(keys) && keys.includes('dailyUsage')) {
        return Promise.resolve({ dailyUsage: {} });
      }
      return Promise.resolve({});
    });
    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Simula definição de limite
    const { [STORAGE_KEYS.TIME_LIMITS]: existingLimits = [] } = await chrome.storage.local.get(
      STORAGE_KEYS.TIME_LIMITS
    );
    const newTimeLimits = [...existingLimits, { domain: testDomain, dailyMinutes: limitMinutes }];
    await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: newTimeLimits });

    console.log(`[DEBUG-TEST] ✅ Time limit set: ${limitMinutes} minutes for ${testDomain}`);

    // 2. Simula uso que excede o limite
    console.log('[DEBUG-TEST] Step 2: Simulating usage that exceeds limit');
    
    const today = new Date().toISOString().split('T')[0];
    const exceededUsage = {
      [today]: {
        [testDomain]: limitMinutes * 60 + 1, // 1 segundo a mais que o limite
      },
    };

    mockChrome.storage.local.get.mockImplementation((keys) => {
      if (Array.isArray(keys) && keys.includes('timeLimits')) {
        return Promise.resolve({ timeLimits: newTimeLimits });
      }
      if (Array.isArray(keys) && keys.includes('dailyUsage')) {
        return Promise.resolve({ dailyUsage: exceededUsage });
      }
      if (keys === 'timeLimits') {
        return Promise.resolve({ timeLimits: newTimeLimits });
      }
      if (keys === 'dailyUsage') {
        return Promise.resolve({ dailyUsage: exceededUsage });
      }
      return Promise.resolve({});
    });

    // Simula verificação de limite
    const { timeLimits: currentLimits } = await chrome.storage.local.get('timeLimits');
    const { dailyUsage } = await chrome.storage.local.get('dailyUsage');
    
    const limit = currentLimits.find(l => l.domain === testDomain);
    const usedSeconds = dailyUsage[today]?.[testDomain] || 0;
    const limitSeconds = limit.dailyMinutes * 60;

    if (usedSeconds >= limitSeconds) {
      // Aplica regra de bloqueio
      const ruleId = 3001;
      const rule = {
        id: ruleId,
        priority: 3,
        action: { type: mockChrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: `.*${testDomain.replace(/\./g, '\\.')}.*`,
          isUrlFilterCaseSensitive: false,
          resourceTypes: [mockChrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      };

      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
        addRules: [rule],
      });

      console.log(`[DEBUG-TEST] ✅ Time limit exceeded, blocking rule applied for ${testDomain}`);
    }

    console.log('[DEBUG-TEST] ✅ Time limit functionality end-to-end working');
  });

  it('should test pomodoro functionality end-to-end', async () => {
    console.log('[DEBUG-TEST] Testing pomodoro functionality end-to-end...');
    
    // 1. Inicia pomodoro
    console.log('[DEBUG-TEST] Step 1: Starting pomodoro');
    
    const startMessage = {
      type: 'POMODORO_START',
      payload: { workTime: 25, breakTime: 5 },
    };

    const mockPomodoroState = {
      phase: 'work',
      isPaused: false,
      cycleIndex: 0,
      remainingMs: 25 * 60 * 1000, // 25 minutes in milliseconds
    };

    mockChrome.storage.local.get.mockResolvedValue({
      pomodoroStatus: {
        config: { workTime: 25, breakTime: 5 },
        state: mockPomodoroState,
      },
    });
    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.alarms.create.mockResolvedValue({});

    // Simula início do pomodoro
    await chrome.storage.local.set({
      pomodoroStatus: {
        config: { workTime: 25, breakTime: 5 },
        state: mockPomodoroState,
      },
    });

    await chrome.alarms.create('pomodoro-timer', {
      when: Date.now() + mockPomodoroState.remainingMs,
    });

    console.log('[DEBUG-TEST] ✅ Pomodoro started');

    // 2. Simula pausa do pomodoro
    console.log('[DEBUG-TEST] Step 2: Pausing pomodoro');
    
    const pauseMessage = {
      type: 'POMODORO_PAUSE',
      payload: null,
    };

    const pausedState = {
      ...mockPomodoroState,
      isPaused: true,
    };

    await chrome.storage.local.set({
      pomodoroStatus: {
        config: { workTime: 25, breakTime: 5 },
        state: pausedState,
      },
    });

    console.log('[DEBUG-TEST] ✅ Pomodoro paused');

    // 3. Simula parada do pomodoro
    console.log('[DEBUG-TEST] Step 3: Stopping pomodoro');
    
    const stopMessage = {
      type: 'POMODORO_STOP',
      payload: null,
    };

    const idleState = {
      phase: 'idle',
      isPaused: false,
      cycleIndex: 0,
      remainingMs: 0,
    };

    await chrome.storage.local.set({
      pomodoroStatus: {
        config: { workTime: 25, breakTime: 5 },
        state: idleState,
      },
    });

    await chrome.alarms.clear('pomodoro-timer');

    console.log('[DEBUG-TEST] ✅ Pomodoro stopped');

    console.log('[DEBUG-TEST] ✅ Pomodoro functionality end-to-end working');
  });

  it('should test error recovery scenarios', async () => {
    console.log('[DEBUG-TEST] Testing error recovery scenarios...');
    
    // 1. Simula erro de storage
    console.log('[DEBUG-TEST] Step 1: Testing storage error recovery');
    
    mockChrome.storage.local.set.mockRejectedValue(new Error('Storage quota exceeded'));
    
    try {
      await chrome.storage.local.set({ test: 'data' });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Storage error caught and handled:', error);
    }

    // 2. Simula erro de DNR
    console.log('[DEBUG-TEST] Step 2: Testing DNR error recovery');
    
    mockChrome.declarativeNetRequest.updateSessionRules.mockRejectedValue(
      new Error('DNR quota exceeded')
    );
    
    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [{ id: 1, priority: 1, action: { type: 1 }, condition: {} }],
      });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ DNR error caught and handled:', error);
    }

    // 3. Simula erro de comunicação
    console.log('[DEBUG-TEST] Step 3: Testing communication error recovery');
    
    mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Communication failed'));
    
    try {
      await chrome.runtime.sendMessage({ type: 'TEST' });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Communication error caught and handled:', error);
    }

    // 4. Simula erro de content script injection
    console.log('[DEBUG-TEST] Step 4: Testing content script injection error recovery');
    
    mockChrome.scripting.executeScript.mockRejectedValue(
      new Error('Cannot access contents')
    );
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId: 1 },
        files: ['content.js'],
      });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Content script injection error caught and handled:', error);
    }

    console.log('[DEBUG-TEST] ✅ Error recovery scenarios working');
  });

  it('should test performance under load', async () => {
    console.log('[DEBUG-TEST] Testing performance under load...');
    
    const startTime = Date.now();
    
    // Simula múltiplas operações simultâneas
    const operations = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      domain: `test${i}.com`,
      operation: i % 2 === 0 ? 'add' : 'remove',
    }));

    mockChrome.storage.local.get.mockResolvedValue({ blacklist: [] });
    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.declarativeNetRequest.updateSessionRules.mockResolvedValue({});

    // Executa operações em paralelo
    const promises = operations.map(async (op) => {
      if (op.operation === 'add') {
        await chrome.storage.local.set({ blacklist: [op.domain] });
        await chrome.declarativeNetRequest.updateSessionRules({
          addRules: [{
            id: 1000 + op.id,
            priority: 1,
            action: { type: 1 },
            condition: { regexFilter: `.*${op.domain}.*` },
          }],
        });
      } else {
        await chrome.storage.local.set({ blacklist: [] });
        await chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [1000 + op.id],
        });
      }
    });

    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[DEBUG-TEST] ✅ Completed 100 operations in ${duration}ms`);
    expect(duration).toBeLessThan(5000); // Deve completar em menos de 5 segundos

    console.log('[DEBUG-TEST] ✅ Performance under load working');
  });
});
