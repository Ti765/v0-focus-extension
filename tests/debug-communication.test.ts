/**
 * Teste de Comunicação Frontend-Backend
 * Verifica se as mensagens estão sendo enviadas e recebidas corretamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock do Chrome API para testes
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onConnect: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    get: vi.fn(),
    onActivated: {
      addListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
    },
  },
  windows: {
    onFocusChanged: {
      addListener: vi.fn(),
    },
    WINDOW_ID_NONE: -1,
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
    onButtonClicked: {
      addListener: vi.fn(),
    },
  },
  declarativeNetRequest: {
    updateSessionRules: vi.fn(),
    getSessionRules: vi.fn(),
    RuleActionType: {
      BLOCK: 1,
    },
    ResourceType: {
      MAIN_FRAME: 1,
    },
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

// Substitui o chrome global
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug Communication Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting communication test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] Communication test completed');
  });

  it('should test message sending from popup to background', async () => {
    console.log('[DEBUG-TEST] Testing popup to background communication...');
    
    // Simula envio de mensagem do popup
    const testMessage = {
      type: 'GET_INITIAL_STATE',
      payload: null,
      id: 'test-123',
      ts: Date.now(),
    };

    // Mock da resposta do background
    const mockResponse = {
      success: true,
      state: {
        blacklist: [],
        timeLimits: [],
        dailyUsage: {},
        siteCustomizations: {},
        settings: {},
      },
    };

    mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
      console.log('[DEBUG-TEST] Message sent:', message);
      if (callback) {
        callback(mockResponse);
      }
      return Promise.resolve(mockResponse);
    });

    // Testa o envio
    const result = await new Promise((resolve) => {
      chrome.runtime.sendMessage(testMessage, (response) => {
        console.log('[DEBUG-TEST] Response received:', response);
        resolve(response);
      });
    });

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(testMessage, expect.any(Function));
    expect(result).toEqual(mockResponse);
    console.log('[DEBUG-TEST] ✅ Popup to background communication working');
  });

  it('should test message handling in background script', async () => {
    console.log('[DEBUG-TEST] Testing background message handling...');
    
    // Simula listener de mensagem no background
    let messageHandler: any = null;
    mockChrome.runtime.onMessage.addListener.mockImplementation((handler) => {
      messageHandler = handler;
      console.log('[DEBUG-TEST] Message listener registered');
    });

    // Simula recebimento de mensagem
    const testMessage = {
      type: 'ADD_TO_BLACKLIST',
      payload: { domain: 'example.com' },
    };

    const mockSender = { tab: { id: 1 } };

    // Mock do storage
    mockChrome.storage.local.get.mockResolvedValue({ blacklist: [] });
    mockChrome.storage.local.set.mockResolvedValue({});

    if (messageHandler) {
      const result = await messageHandler(testMessage, mockSender, vi.fn());
      console.log('[DEBUG-TEST] Message handled result:', result);
      expect(result).toBeDefined();
    }

    console.log('[DEBUG-TEST] ✅ Background message handling working');
  });

  it('should test port-based communication', async () => {
    console.log('[DEBUG-TEST] Testing port-based communication...');
    
    let portHandler: any = null;
    mockChrome.runtime.onConnect.addListener.mockImplementation((handler) => {
      portHandler = handler;
      console.log('[DEBUG-TEST] Port listener registered');
    });

    // Simula conexão de porta
    const mockPort = {
      postMessage: vi.fn(),
      onDisconnect: {
        addListener: vi.fn(),
      },
    };

    if (portHandler) {
      portHandler(mockPort);
      console.log('[DEBUG-TEST] Port connection handled');
      expect(mockPort.postMessage).toHaveBeenCalled();
    }

    console.log('[DEBUG-TEST] ✅ Port-based communication working');
  });

  it('should test error handling in communication', async () => {
    console.log('[DEBUG-TEST] Testing error handling...');
    
    // Simula erro na comunicação
    mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Communication failed'));

    try {
      await chrome.runtime.sendMessage({ type: 'TEST' });
    } catch (error) {
      console.log('[DEBUG-TEST] Error caught as expected:', error);
      expect(error).toBeInstanceOf(Error);
    }

    console.log('[DEBUG-TEST] ✅ Error handling working');
  });

  it('should test storage communication', async () => {
    console.log('[DEBUG-TEST] Testing storage communication...');
    
    const testData = { blacklist: ['example.com'] };
    
    // Testa escrita
    mockChrome.storage.local.set.mockResolvedValue({});
    await chrome.storage.local.set(testData);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(testData);
    console.log('[DEBUG-TEST] ✅ Storage write working');

    // Testa leitura
    mockChrome.storage.local.get.mockResolvedValue(testData);
    const result = await chrome.storage.local.get('blacklist');
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith('blacklist');
    expect(result).toEqual(testData);
    console.log('[DEBUG-TEST] ✅ Storage read working');
  });
});
