import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiteBlockingView from '../src/options/views/SiteBlockingView';
import { chromeAPI } from '../src/shared/chrome-mock';
import { useStore } from '../src/popup/store';
import { DEFAULT_SETTINGS, DEFAULT_POMODORO_CONFIG } from '../src/shared/constants';

// Test suite for loop prevention
describe('Loop Prevention Tests', () => {
  // Set up fresh state before each test
  beforeEach(() => {
    vi.restoreAllMocks();
    
    // Reset store between tests
    const store = useStore.getState();
    useStore.setState({
      ...store,
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      error: null,
      isLoading: false,
      pomodoro: {
        state: 'IDLE',
        timeRemaining: 0,
        currentCycle: 0,
        config: DEFAULT_POMODORO_CONFIG
      },
      settings: DEFAULT_SETTINGS,
      siteCustomizations: {}
    });

    // Mock do chrome.storage para os testes
    vi.spyOn(chromeAPI.storage.local, 'get').mockResolvedValue({});
    vi.spyOn(chromeAPI.storage.local, 'set').mockResolvedValue(undefined);
  });

  // Test para prevenção de loop na adição de sites bloqueados
  it('previne loop infinito ao adicionar site bloqueado', async () => {
    // Setup: spy no sendMessage
    const sendMessageSpy = vi.fn().mockResolvedValue({ success: true });
    const originalSendMessage = chromeAPI.runtime.sendMessage;
    chromeAPI.runtime.sendMessage = sendMessageSpy;

    // Renderiza componente
    render(<SiteBlockingView />);

    // Simula adição de site
    const input = await screen.findByPlaceholderText('exemplo.com');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }));
    });

    // Garante que sendMessage foi chamado apenas uma vez com skipNotify
    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: 'ADD_TO_BLACKLIST',
        payload: { domain: 'test.com' },
        skipNotify: true
      });
    });

    // Cleanup
    chromeAPI.runtime.sendMessage = originalSendMessage;
  });

  // Test para prevenção de loop no recebimento de STATE_UPDATED
  it('previne loop infinito no store ao receber STATE_UPDATED', async () => {
    const store = useStore.getState();
    let updateCounter = { count: 0 };
    
    // Configura o listener de updates
    const stopListening = useStore.subscribe(() => {
      updateCounter.count++;
    });

    // Configura o listener de mensagens
    store.listenForUpdates();

    // Simula múltiplos STATE_UPDATED em rápida sucessão
    const stateUpdate = {
      type: 'STATE_UPDATED',
      payload: {
        blacklist: ['test.com'],
        timeLimits: [],
        dailyUsage: {},
        pomodoro: store.pomodoro,
        siteCustomizations: {},
        settings: DEFAULT_SETTINGS
      }
    };

    // Envia 5 updates em sequência
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        chromeAPI.runtime.onMessage.emit(stateUpdate);
      }
    });

    // Espera um momento para processamento
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Limpa a subscription
    stopListening();

    // Deve ter número limitado de updates devido ao controle de loop
    expect(updateCounter.count).toBeLessThan(3);
  });
});