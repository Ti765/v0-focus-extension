/**
 * Utilitários compartilhados para testes
 */

// Mock do Chrome API
export const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    onConnect: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
    },
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
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
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
    updateDynamicRules: vi.fn(),
    getDynamicRules: vi.fn(),
    RuleActionType: {
      BLOCK: 1,
      ALLOW: 2,
      REDIRECT: 3,
    },
    ResourceType: {
      MAIN_FRAME: 1,
      SUB_FRAME: 2,
      SCRIPT: 4,
      IMAGE: 5,
    },
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

// Função para inicializar listeners
export function initializeListeners() {
  // Registra os listeners principais
  const installedHandler = vi.fn();
  mockChrome.runtime.onInstalled.addListener(installedHandler);
  
  const startupHandler = vi.fn();
  mockChrome.runtime.onStartup.addListener(startupHandler);
  
  // Storage change listener
  const storageHandler = vi.fn();
  mockChrome.storage.onChanged.addListener(storageHandler);
  
  // Message listener
  const messageHandler = vi.fn();
  mockChrome.runtime.onMessage.addListener(messageHandler);
  
  // Notification button listener
  const notificationHandler = vi.fn();
  mockChrome.notifications.onButtonClicked.addListener(notificationHandler);
  
  return {
    installedHandler,
    startupHandler,
    storageHandler,
    messageHandler,
    notificationHandler
  };
}

// Função para limpar mocks
export function clearMocks() {
  vi.clearAllMocks();
  
  // Recursively clear all nested mock functions
  function clearNestedMocks(obj: any, visited = new Set()) {
    if (visited.has(obj) || obj === null || typeof obj !== 'object') {
      return;
    }
    visited.add(obj);
    
    Object.keys(obj).forEach(key => {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'function' && (value.mockClear || value.mockReset)) {
          if (value.mockReset) {
            value.mockReset();
          } else if (value.mockClear) {
            value.mockClear();
          }
        } else if (typeof value === 'object' && value !== null) {
          clearNestedMocks(value, visited);
        }
      }
    });
  }
  
  clearNestedMocks(mockChrome);
}

// Função para configurar ambiente de teste
export function setupTestEnvironment() {
  Object.defineProperty(global, 'chrome', {
    value: mockChrome,
    writable: true,
  });
  
  beforeEach(() => {
    clearMocks();
  });
  
  afterEach(() => {
    clearMocks();
  });
}
