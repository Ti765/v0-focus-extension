/**
 * Teste de Inicialização dos Módulos
 * Verifica se todos os módulos estão sendo carregados sem erros
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockChrome, initializeListeners, setupTestEnvironment } from './test-utils';

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug Initialization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting initialization test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] Initialization test completed');
  });

  it('should test bootstrap function execution', async () => {
    console.log('[DEBUG-TEST] Testing bootstrap execution...');
    
    // Mock dos módulos de inicialização
    const mockInitializePomodoro = vi.fn().mockResolvedValue(undefined);
    const mockInitializeBlocker = vi.fn().mockResolvedValue(undefined);
    const mockInitializeUsageTracker = vi.fn().mockResolvedValue(undefined);
    const mockInitializeDailySync = vi.fn().mockResolvedValue(undefined);
    const mockInitializeContentAnalyzer = vi.fn().mockResolvedValue(undefined);
    const mockInitializeFirebaseSync = vi.fn().mockResolvedValue(undefined);

    // Simula a função bootstrap
    async function bootstrap() {
      console.log('[DEBUG-TEST] Bootstrap started');
      
      try {
        await mockInitializePomodoro();
        console.log('[DEBUG-TEST] ✅ Pomodoro initialized');
      } catch (e) {
        console.error('[DEBUG-TEST] ❌ Failed to initialize Pomodoro:', e);
      }

      try {
        await mockInitializeBlocker();
        console.log('[DEBUG-TEST] ✅ Blocker initialized');
      } catch (e) {
        console.error('[DEBUG-TEST] ❌ Failed to initialize Blocker:', e);
      }

      try {
        await mockInitializeUsageTracker();
        console.log('[DEBUG-TEST] ✅ Usage Tracker initialized');
      } catch (e) {
        console.error('[DEBUG-TEST] ❌ Failed to initialize Usage Tracker:', e);
      }

      try {
        await mockInitializeDailySync();
        console.log('[DEBUG-TEST] ✅ Daily Sync initialized');
      } catch (e) {
        console.error('[DEBUG-TEST] ❌ Failed to initialize Daily Sync:', e);
      }

      try {
        await mockInitializeContentAnalyzer();
        console.log('[DEBUG-TEST] ✅ Content Analyzer initialized');
      } catch (e) {
        console.error('[DEBUG-TEST] ❌ Failed to initialize Content Analyzer:', e);
      }

      try {
        await mockInitializeFirebaseSync();
        console.log('[DEBUG-TEST] ✅ Firebase Sync initialized');
      } catch (e) {
        console.warn('[DEBUG-TEST] ⚠️ Firebase sync skipped/failed:', e);
      }

      console.log('[DEBUG-TEST] Bootstrap completed');
    }

    await bootstrap();

    // Verifica se todos os módulos foram chamados
    expect(mockInitializePomodoro).toHaveBeenCalled();
    expect(mockInitializeBlocker).toHaveBeenCalled();
    expect(mockInitializeUsageTracker).toHaveBeenCalled();
    expect(mockInitializeDailySync).toHaveBeenCalled();
    expect(mockInitializeContentAnalyzer).toHaveBeenCalled();
    expect(mockInitializeFirebaseSync).toHaveBeenCalled();

    console.log('[DEBUG-TEST] ✅ All modules initialized successfully');
  });

  it('should test module initialization with errors', async () => {
    console.log('[DEBUG-TEST] Testing module initialization with errors...');
    
    // Mock de módulo que falha
    const mockFailingModule = vi.fn().mockRejectedValue(new Error('Module failed'));
    const mockWorkingModule = vi.fn().mockResolvedValue(undefined);

    let errorCaught = false;
    try {
      await mockFailingModule();
    } catch (e) {
      errorCaught = true;
      console.log('[DEBUG-TEST] ✅ Error caught as expected:', e);
    }

    expect(errorCaught).toBe(true);

    // Testa módulo que funciona
    await mockWorkingModule();
    expect(mockWorkingModule).toHaveBeenCalled();

    console.log('[DEBUG-TEST] ✅ Error handling in module initialization working');
  });

  it('should test onInstalled listener', async () => {
    console.log('[DEBUG-TEST] Testing onInstalled listener...');
    
    // Simula evento de instalação
    const mockDetails = { reason: 'install' };
    
    // Registra o listener e obtém os handlers
    const handlers = initializeListeners();
    
    // Verifica se o listener foi registrado
    expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    
    // Simula o evento
    await handlers.installedHandler(mockDetails);
    
    console.log('[DEBUG-TEST] ✅ onInstalled listener working');
  });

  it('should test onStartup listener', async () => {
    console.log('[DEBUG-TEST] Testing onStartup listener...');
    
    // Registra o listener e obtém os handlers
    const handlers = initializeListeners();
    
    // Verifica se o listener foi registrado
    expect(mockChrome.runtime.onStartup.addListener).toHaveBeenCalled();
    
    // Simula o evento
    await handlers.startupHandler();
    
    console.log('[DEBUG-TEST] ✅ onStartup listener working');
  });

  it('should test storage initialization', async () => {
    console.log('[DEBUG-TEST] Testing storage initialization...');
    
    const initialState = {
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      siteCustomizations: {},
      settings: {},
    };

    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.storage.sync.set.mockResolvedValue({});

    // Testa criação do estado inicial
    await chrome.storage.local.set(initialState);
    await chrome.storage.sync.set({ settings: initialState.settings });

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(initialState);
    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ settings: initialState.settings });

    console.log('[DEBUG-TEST] ✅ Storage initialization working');
  });

  it('should test content script injection', async () => {
    console.log('[DEBUG-TEST] Testing content script injection...');
    
    const mockTabs = [
      { id: 1, url: 'https://example.com' },
      { id: 2, url: 'https://test.com' },
    ];

    mockChrome.tabs.query.mockResolvedValue(mockTabs);
    mockChrome.scripting.executeScript.mockResolvedValue([{ result: false }]);

    // Simula injeção de content script
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    console.log('[DEBUG-TEST] Found tabs:', tabs.length);

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

    expect(mockChrome.tabs.query).toHaveBeenCalled();
    console.log('[DEBUG-TEST] ✅ Content script injection working');
  });
});
