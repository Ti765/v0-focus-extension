import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from '../src/popup/store';

// Tipagem simples para o global chrome neste arquivo de teste
declare global {
  // eslint-disable-next-line no-var
  var chrome: any;
}

// Pequeno event bus para onMessage
const onMessageListeners = new Set<(msg: any, sender: any, sendResponse: (res?: any) => void) => void>();
const emitRuntimeMessage = (msg: any) => {
  onMessageListeners.forEach((fn) => fn(msg, {}, () => {}));
};

// Setup dos mocks do Chrome
beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: {
      sendMessage: vi.fn((msg: any, callback?: (response: any) => void) => {
        if (msg?.type === 'GET_INITIAL_STATE') {
          const mockAppState = {
            blacklist: [],
            timeLimits: [],
            dailyUsage: {},
            pomodoro: {
              state: 'IDLE',
              timeRemaining: 0,
              currentCycle: 0,
              config: {
                focusMinutes: 25,
                breakMinutes: 5,
                longBreakMinutes: 15,
                cyclesBeforeLongBreak: 4,
                adaptiveMode: false,
              },
            },
            siteCustomizations: {},
            settings: {
              notificationsEnabled: true,
              productiveKeywords: [],
              distractingKeywords: [],
              analyticsConsent: false,
            },
          };
          callback?.(mockAppState);
          return;
        }
        callback?.({ success: true });
      }),
      onMessage: {
        addListener: (fn: any) => onMessageListeners.add(fn),
        removeListener: (fn: any) => onMessageListeners.delete(fn),
        hasListener: (fn: any) => onMessageListeners.has(fn),
      },
    },
    storage: {
      sync: {
        get: vi.fn((keys: string[] | string | undefined, callback: (result: any) => void) => {
          callback({});
        }),
        set: vi.fn((items: { [key: string]: any }, callback?: () => void) => {
          callback?.();
        }),
      },
    },
  });
});

describe('popup/store', () => {
  beforeEach(() => {
    // Reseta store entre testes
    const s = useStore.getState();
    useStore.setState({
      ...s,
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      error: null,
      isLoading: true,
    });
  });

  it('loadState popula o estado inicial e remove isLoading', async () => {
    await useStore.getState().loadState();
    const s = useStore.getState();
    expect(s.isLoading).toBe(false);
    expect(Array.isArray(s.blacklist)).toBe(true);
  });

  it('addToBlacklist envia exatamente 1 mensagem e atualiza via STATE_UPDATED (sem loop)', async () => {
    const sendSpy = vi.spyOn(chrome.runtime, 'sendMessage');

    // Abre "canal" de updates e registra cleanup
    const stop = useStore.getState().listenForUpdates();

    // Dispara ação
    await useStore.getState().addToBlacklist('example.com');
    expect(sendSpy).toHaveBeenCalledTimes(1); // uma ida ao SW

    // Simula SW empurrando estado novo
    emitRuntimeMessage({
      type: 'STATE_UPDATED',
      payload: {
        blacklist: ['example.com'],
        timeLimits: [],
        dailyUsage: {},
        pomodoro: useStore.getState().pomodoro,
        siteCustomizations: {},
        settings: useStore.getState().settings,
      },
    });

    // Confere UI atualizada
    expect(useStore.getState().blacklist).toContain('example.com');

    // Heurística anti-loop: em 250ms, não deve haver avalanche de mensagens
    const countBefore = sendSpy.mock.calls.length;
    await new Promise((r) => setTimeout(r, 250));
    expect(sendSpy.mock.calls.length).toBe(countBefore);

    stop();
  });
});
