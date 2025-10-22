import '@testing-library/jest-dom';

// Pequeno event bus p/ simular add/remove/dispatch de listeners
function makeEvent<T extends (...args: any[]) => void>() {
  const listeners = new Set<T>();
  return {
    addListener: (fn: T) => listeners.add(fn),
    removeListener: (fn: T) => listeners.delete(fn),
    hasListener: (fn: T) => listeners.has(fn),
    _dispatch: (...args: Parameters<T>) => listeners.forEach(l => l(...args)),
  };
}

// Base do mock usando sua implementação existente quando útil
// (src/shared/chrome-mock.ts expõe um chromeAPI, mas o código do popup usa "chrome")
const onMessage = makeEvent<(msg: any, sender: any, sendResponse: (res?: any) => void) => void>();
const storageOnChanged = makeEvent<(changes: any, area: 'local' | 'sync') => void>();

// Estado em memória p/ storage
const _local: Record<string, any> = {};
const _sync: Record<string, any> = {};

(globalThis as any).chrome = {
  runtime: {
    lastError: undefined as undefined | { message: string },
    // Callback style, como no código real
    sendMessage: (message: any, cb?: (res: any) => void) => {
      // Resposta padrão p/ GET_INITIAL_STATE nos testes
      if (message?.type === 'GET_INITIAL_STATE') {
        const mockAppState = {
          blacklist: ['twitter.com'],
          timeLimits: [{ domain: 'reddit.com', limitMinutes: 30 }],
          dailyUsage: {},
          pomodoro: { state: 'IDLE', timeRemaining: 0, currentCycle: 0, config: { focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, cyclesBeforeLongBreak: 4, adaptiveMode: false } },
          siteCustomizations: {},
          settings: { notificationsEnabled: true, productiveKeywords: [], distractingKeywords: [], analyticsConsent: false },
        };
        cb?.(mockAppState);
        return;
      }
      // Para outros tipos, apenas ecoa success; os testes podem espionar esta função
      cb?.({ success: true });
    },
    onMessage,
    onConnect: { addListener: () => {}, removeListener: () => {} },
  },
  storage: {
    local: {
      get: async (keys?: any) => {
        if (!keys) return { ..._local };
        if (typeof keys === 'string') return { [keys]: _local[keys] };
        if (Array.isArray(keys)) return Object.fromEntries(keys.map((k: string) => [k, _local[k]]));
        // objeto com defaults
        const out: Record<string, any> = {};
        Object.keys(keys).forEach(k => (out[k] = _local[k] ?? keys[k]));
        return out;
      },
      set: async (items: Record<string, any>) => {
        Object.assign(_local, items);
        storageOnChanged._dispatch(Object.fromEntries(Object.keys(items).map(k => [k, { newValue: items[k] }])) , 'local');
      },
      onChanged: storageOnChanged,
    },
    sync: {
      get: async (keys?: any) => {
        if (!keys) return { ..._sync };
        if (typeof keys === 'string') return { [keys]: _sync[keys] };
        if (Array.isArray(keys)) return Object.fromEntries(keys.map((k: string) => [k, _sync[k]]));
        const out: Record<string, any> = {};
        Object.keys(keys).forEach(k => (out[k] = _sync[k] ?? keys[k]));
        return out;
      },
      set: async (items: Record<string, any>) => {
        Object.assign(_sync, items);
        storageOnChanged._dispatch(Object.fromEntries(Object.keys(items).map(k => [k, { newValue: items[k] }])) , 'sync');
      },
      onChanged: storageOnChanged,
    },
  },
  tabs: { query: async () => [] },
  scripting: { executeScript: async () => [{ result: false }] },
  notifications: { onButtonClicked: { addListener: () => {} }, clear: () => {} },
};

// Expor helpers para testes que quiserem emitir mensagens do SW -> UI
(globalThis as any).__emitRuntimeMessage = (msg: any) => {
  onMessage._dispatch(msg, {}, () => {});
};
