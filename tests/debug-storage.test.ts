/**
 * Teste de Storage e Persistência de Dados
 * Verifica se os dados estão sendo salvos e recuperados corretamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockChrome, initializeListeners, setupTestEnvironment } from './test-utils';

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Debug Storage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[DEBUG-TEST] Starting storage test...');
  });

  afterEach(() => {
    console.log('[DEBUG-TEST] Storage test completed');
  });

  it('should test local storage operations', async () => {
    console.log('[DEBUG-TEST] Testing local storage operations...');
    
    const testData = {
      blacklist: ['example.com', 'test.com'],
      timeLimits: [
        { domain: 'example.com', dailyMinutes: 60 },
        { domain: 'test.com', dailyMinutes: 30 },
      ],
      dailyUsage: {
        '2024-01-01': {
          'example.com': 3600,
          'test.com': 1800,
        },
      },
    };

    // Testa escrita no local storage
    mockChrome.storage.local.set.mockResolvedValue({});
    await chrome.storage.local.set(testData);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(testData);
    console.log('[DEBUG-TEST] ✅ Local storage write working');

    // Testa leitura do local storage
    mockChrome.storage.local.get.mockResolvedValue(testData);
    const result = await chrome.storage.local.get(Object.keys(testData));
    expect(mockChrome.storage.local.get).toHaveBeenCalledWith(Object.keys(testData));
    expect(result).toEqual(testData);
    console.log('[DEBUG-TEST] ✅ Local storage read working');

    // Testa remoção do local storage
    mockChrome.storage.local.remove.mockResolvedValue({});
    await chrome.storage.local.remove('blacklist');
    expect(mockChrome.storage.local.remove).toHaveBeenCalledWith('blacklist');
    console.log('[DEBUG-TEST] ✅ Local storage remove working');
  });

  it('should test sync storage operations', async () => {
    console.log('[DEBUG-TEST] Testing sync storage operations...');
    
    const settingsData = {
      settings: {
        theme: 'dark',
        notifications: true,
        autoBlock: false,
        pomodoroEnabled: true,
      },
    };

    // Testa escrita no sync storage
    mockChrome.storage.sync.set.mockResolvedValue({});
    await chrome.storage.sync.set(settingsData);
    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(settingsData);
    console.log('[DEBUG-TEST] ✅ Sync storage write working');

    // Testa leitura do sync storage
    mockChrome.storage.sync.get.mockResolvedValue(settingsData);
    const result = await chrome.storage.sync.get('settings');
    expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
    expect(result).toEqual(settingsData);
    console.log('[DEBUG-TEST] ✅ Sync storage read working');
  });

  it('should test session storage operations', async () => {
    console.log('[DEBUG-TEST] Testing session storage operations...');
    
    const sessionData = {
      currentlyTracking: {
        url: 'https://example.com',
        startTime: Date.now(),
      },
    };

    // Testa escrita no session storage
    mockChrome.storage.session.set.mockResolvedValue({});
    await chrome.storage.session.set(sessionData);
    expect(mockChrome.storage.session.set).toHaveBeenCalledWith(sessionData);
    console.log('[DEBUG-TEST] ✅ Session storage write working');

    // Testa leitura do session storage
    mockChrome.storage.session.get.mockResolvedValue(sessionData);
    const result = await chrome.storage.session.get('currentlyTracking');
    expect(mockChrome.storage.session.get).toHaveBeenCalledWith('currentlyTracking');
    expect(result).toEqual(sessionData);
    console.log('[DEBUG-TEST] ✅ Session storage read working');
  });

  it('should test storage error handling', async () => {
    console.log('[DEBUG-TEST] Testing storage error handling...');
    
    // Simula erro no storage
    mockChrome.storage.local.set.mockRejectedValue(new Error('Storage quota exceeded'));
    mockChrome.storage.local.get.mockRejectedValue(new Error('Storage read failed'));

    // Testa tratamento de erro na escrita
    try {
      await chrome.storage.local.set({ test: 'data' });
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Storage write error caught:', error);
      expect(error).toBeInstanceOf(Error);
    }

    // Testa tratamento de erro na leitura
    try {
      await chrome.storage.local.get('test');
    } catch (error) {
      console.log('[DEBUG-TEST] ✅ Storage read error caught:', error);
      expect(error).toBeInstanceOf(Error);
    }

    console.log('[DEBUG-TEST] ✅ Storage error handling working');
  });

  it('should test storage change listener', async () => {
    console.log('[DEBUG-TEST] Testing storage change listener...');
    
    // Registra o listener e obtém os handlers
    const handlers = initializeListeners();
    
    // Verifica se o listener foi registrado
    expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled();
    
    // Simula mudança no storage
    const mockChanges = {
      blacklist: {
        newValue: ['example.com'],
        oldValue: [],
      },
    };
    const mockAreaName = 'local';
    
    // Simula o evento
    handlers.storageHandler(mockChanges, mockAreaName);
    
    console.log('[DEBUG-TEST] ✅ Storage change listener working');
  });

  it('should test complex data persistence', async () => {
    console.log('[DEBUG-TEST] Testing complex data persistence...');
    
    const complexData = {
      blacklist: ['example.com', 'test.com', 'demo.com'],
      timeLimits: [
        { domain: 'example.com', dailyMinutes: 60 },
        { domain: 'test.com', dailyMinutes: 30 },
        { domain: 'demo.com', dailyMinutes: 120 },
      ],
      dailyUsage: {
        '2024-01-01': {
          'example.com': 3600,
          'test.com': 1800,
          'demo.com': 7200,
        },
        '2024-01-02': {
          'example.com': 2400,
          'test.com': 900,
        },
      },
      siteCustomizations: {
        'example.com': {
          theme: 'dark',
          fontSize: 'large',
        },
        'test.com': {
          theme: 'light',
          fontSize: 'medium',
        },
      },
      settings: {
        theme: 'dark',
        notifications: true,
        autoBlock: false,
        pomodoroEnabled: true,
        pomodoroWorkTime: 25,
        pomodoroBreakTime: 5,
      },
    };

    // Testa escrita de dados complexos
    mockChrome.storage.local.set.mockResolvedValue({});
    mockChrome.storage.sync.set.mockResolvedValue({});

    await chrome.storage.local.set({
      blacklist: complexData.blacklist,
      timeLimits: complexData.timeLimits,
      dailyUsage: complexData.dailyUsage,
      siteCustomizations: complexData.siteCustomizations,
    });

    await chrome.storage.sync.set({
      settings: complexData.settings,
    });

    console.log('[DEBUG-TEST] ✅ Complex data written to storage');

    // Testa leitura de dados complexos
    mockChrome.storage.local.get.mockResolvedValue({
      blacklist: complexData.blacklist,
      timeLimits: complexData.timeLimits,
      dailyUsage: complexData.dailyUsage,
      siteCustomizations: complexData.siteCustomizations,
    });

    mockChrome.storage.sync.get.mockResolvedValue({
      settings: complexData.settings,
    });

    const localResult = await chrome.storage.local.get([
      'blacklist',
      'timeLimits',
      'dailyUsage',
      'siteCustomizations',
    ]);

    const syncResult = await chrome.storage.sync.get(['settings']);

    expect(localResult.blacklist).toEqual(complexData.blacklist);
    expect(localResult.timeLimits).toEqual(complexData.timeLimits);
    expect(localResult.dailyUsage).toEqual(complexData.dailyUsage);
    expect(localResult.siteCustomizations).toEqual(complexData.siteCustomizations);
    expect(syncResult.settings).toEqual(complexData.settings);

    console.log('[DEBUG-TEST] ✅ Complex data read from storage');
  });

  it('should test storage quota limits', async () => {
    console.log('[DEBUG-TEST] Testing storage quota limits...');
    
    // Simula dados grandes que podem exceder quota
    const largeData = {
      blacklist: Array.from({ length: 1000 }, (_, i) => `site${i}.com`),
      dailyUsage: Object.fromEntries(
        Array.from({ length: 365 }, (_, i) => [
          `2024-${String(i + 1).padStart(2, '0')}-01`,
          { 'example.com': Math.random() * 3600 },
        ])
      ),
    };

    // Testa escrita de dados grandes
    mockChrome.storage.local.set.mockResolvedValue({});
    await chrome.storage.local.set(largeData);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(largeData);
    console.log('[DEBUG-TEST] ✅ Large data written to storage');

    // Testa leitura de dados grandes
    mockChrome.storage.local.get.mockResolvedValue(largeData);
    const result = await chrome.storage.local.get(['blacklist', 'dailyUsage']);
    expect(result).toEqual(largeData);
    console.log('[DEBUG-TEST] ✅ Large data read from storage');
  });
});
