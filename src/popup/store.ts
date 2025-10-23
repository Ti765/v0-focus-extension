// src/popup/store.ts
import { create } from "zustand";
import type { AppState, Message } from "../shared/types";
import { chromeAPI } from "../shared/chrome-mock";
import { deepEqual } from "../shared/utils";

// Store instance-specific message listener state using WeakMap
type MessageListenerState = {
  listenerCount: number;
  processedIds: Set<string>;
  lastStateHash: string;
  listener?: (message: Message, sender: chrome.runtime.MessageSender, sendResponse?: (response?: any) => void) => void;
};


// Create a new listener state for a store instance
function createListenerState(): MessageListenerState {
  return {
    listenerCount: 0,
    processedIds: new Set<string>(),
    lastStateHash: "",
    listener: undefined
  };
}
// (per-store listener state is defined after the exported `useStore` so it may reference its type)

// ───────────────────────────────────────────────────────────────
// Utils de mensageria e deduplicação
// ───────────────────────────────────────────────────────────────

/** Wrapper (callback→Promise) com tratamento de runtime.lastError */
function sendMessageAsync<T = any>(message: Message): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      // Marque a mensagem com um ID para dedupe no receiver
      const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
      const msg: Message = { ...message, id, ts: Date.now(), source: message.source ?? "popup-ui" } as any;

      // MV3 suporta Promise; porém manter callback aumenta compatibilidade
      chromeAPI.runtime.sendMessage(msg as any, (response: T) => {
        const err = (chromeAPI.runtime as any).lastError;
        if (err) return reject(new Error(err.message));
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Stringify estável (chaves ordenadas) p/ hashing de conteúdo */
function stableStringify(value: any): string {
  const seen = new WeakSet();
  const sort = (v: any): any => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(sort);
      return Object.keys(v)
        .sort()
        .reduce((acc: any, k) => {
          acc[k] = sort(v[k]);
          return acc;
        }, {});
    }
    return v;
  };
  return JSON.stringify(sort(value));
}

function pickComparable(s: AppState) {
  return {
    blacklist: s.blacklist,
    timeLimits: s.timeLimits,
    dailyUsage: s.dailyUsage,
    pomodoro: s.pomodoro,
    siteCustomizations: s.siteCustomizations,
    settings: s.settings,
  };
}

// ───────────────────────────────────────────────────────────────
// Tipagem do store
// ───────────────────────────────────────────────────────────────

interface PopupStore extends AppState {
  isLoading: boolean;
  error: string | null;

  // ciclo de vida
  loadState: () => Promise<void>;
  listenForUpdates: () => () => void;

  // util
  setError: (err: string | null) => void;

  // ações
  addToBlacklist: (domain: string) => Promise<void>;
  removeFromBlacklist: (domain: string) => Promise<void>;
  setTimeLimit: (domain: string, limitMinutes: number) => Promise<void>;
  startPomodoro: (focusMinutes: number, breakMinutes: number) => Promise<void>;
  stopPomodoro: () => Promise<void>;
  toggleZenMode: (preset?: string) => Promise<void>;
  updateSettings: (partial: Partial<AppState["settings"]>) => Promise<void>;
}

// ───────────────────────────────────────────────────────────────
// Estado inicial (fallback até o SW hidratar)
// ───────────────────────────────────────────────────────────────

  const initialState: AppState = {
  isLoading: false,
  error: null,
  blacklist: [],
  timeLimits: [],
  dailyUsage: {},
  siteCustomizations: {},
  pomodoro: {
    config: { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cyclesBeforeLongBreak: 4, autoStartBreaks: false },
    state: { phase: "idle", isPaused: false, cycleIndex: 0 },
  },
  settings: { theme: "system", language: "pt-BR", blockMode: "soft", notifications: true, syncWithCloud: false },
};

// ───────────────────────────────────────────────────────────────
// Store (Zustand)
// ───────────────────────────────────────────────────────────────

export const useStore = create<PopupStore>()((set, get) => ({
  ...initialState,
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),

  // Hidrata via GET_INITIAL_STATE (Service Worker deve responder)
  loadState: async () => {
    set({ isLoading: true, error: null });
    try {
  const state = await sendMessageAsync<AppState>({ type: "GET_INITIAL_STATE", source: "popup-ui" } as unknown as Message);
      if (!state) {
        set({ isLoading: false });
        return;
      }
      const next = state as AppState;
      set({ ...(next as any), isLoading: false, error: null });
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] loadState failed:", msg);
      set({ isLoading: false, error: "Falha ao carregar estado: " + msg });
    }
  },

  // Assina STATE_UPDATED uma única vez; retorna unsubscribe por componente
  listenForUpdates: () => {
    const listenerState = getListenerState(useStore);
    
    // já registrado?
    if (!listenerState.listener) {
      const handler = (msg: Message, _sender: chrome.runtime.MessageSender) => {
        if (!msg || typeof msg !== "object") return;

        // Dedupe por id
        if (msg.id && listenerState.processedIds.has(msg.id)) return;
        if (msg.id) {
          listenerState.processedIds.add(msg.id);
          // limpeza tardia evita leak: 5 min
          setTimeout(() => listenerState.processedIds.delete(msg.id), 300000);
        }

        if (msg.type === "STATE_UPDATED" && msg.payload) {
          const incoming: AppState = (msg.payload && (msg.payload as any).state) ? (msg.payload as any).state : (msg.payload as any);

          // Comparação simétrica (subset comparável) + hash
          const curr = pickComparable(get());
          const next = pickComparable(incoming);
          const equal = deepEqual(curr, next);
          if (equal) return;

          // Se o conteúdo não mudou, não atualize (evita eco)
          const hash = stableStringify(next);
          if (hash === listenerState.lastStateHash) return;

          listenerState.lastStateHash = hash;
          set({ ...(incoming as any), isLoading: false, error: null });
        }
      };

      try {
        chromeAPI.runtime.onMessage.addListener?.(handler);
        listenerState.listener = handler;
      } catch (e) {
        console.error("[store] failed to register onMessage listener", e);
        listenerState.listener = undefined;
      }
    }

    listenerState.listenerCount++;
    let done = false;
    return () => {
      if (done) return;
      done = true;
      // Fix decrementing from 0 issue
      const currentCount = listenerState.listenerCount ?? 0;
      if (currentCount === 0) {
        console.warn("[store] Attempted to decrement listener count below 0 - possible ref-count bug");
      } else {
        listenerState.listenerCount = Math.max(0, currentCount - 1);
      }
      if (listenerState.listenerCount === 0 && listenerState.listener) {
        try {
          chromeAPI.runtime.onMessage.removeListener?.(listenerState.listener);
        } catch {}
        listenerState.listener = undefined;
        listenerState.lastStateHash = "";
        listenerState.processedIds.clear?.();
      }
    };
  },

  // ── Ações (sempre via SW; UI não escreve storage) ─────────────

  addToBlacklist: async (domain) => {
    set({ error: null });
      try {
  await sendMessageAsync({ type: "ADD_TO_BLACKLIST", payload: { domain }, source: "popup-ui" } as unknown as Message);
      // estado final virá por STATE_UPDATED
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] addToBlacklist failed:", msg);
      set({ error: "Falha ao adicionar à blacklist: " + msg });
      throw e;
    }
  },

  removeFromBlacklist: async (domain) => {
    set({ error: null });
  try {
  await sendMessageAsync({ type: "REMOVE_FROM_BLACKLIST", payload: { domain }, source: "popup-ui" } as unknown as Message);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] removeFromBlacklist failed:", msg);
      set({ error: "Falha ao remover da blacklist: " + msg });
      throw e;
    }
  },

  setTimeLimit: async (domain, limitMinutes) => {
    set({ error: null });
  try {
  await sendMessageAsync({ type: "TIME_LIMIT_SET", payload: { domain, dailyMinutes: limitMinutes }, source: "popup-ui" } as unknown as Message);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] setTimeLimit failed:", msg);
      set({ error: "Falha ao definir limite de tempo: " + msg });
      throw e;
    }
  },

  startPomodoro: async (focusMinutes, breakMinutes) => {
    set({ error: null });
      try {
  await sendMessageAsync({ type: "POMODORO_START", payload: { config: { focusMinutes, shortBreakMinutes: breakMinutes } }, source: "popup-ui" } as unknown as Message);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] startPomodoro failed:", msg);
      set({ error: "Falha ao iniciar Pomodoro: " + msg });
      throw e;
    }
  },

  stopPomodoro: async () => {
    set({ error: null });
  try {
  await sendMessageAsync({ type: "POMODORO_STOP", source: "popup-ui" } as unknown as Message);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] stopPomodoro failed:", msg);
      set({ error: "Falha ao parar Pomodoro: " + msg });
      throw e;
    }
  },

  toggleZenMode: async (preset) => {
    set({ error: null });
  try {
  await sendMessageAsync({ type: "TOGGLE_ZEN_MODE", payload: { preset }, source: "popup-ui" } as unknown as Message);
      // ação pode atuar em content scripts; SW deve emitir STATE_UPDATED se necessário
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] toggleZenMode failed:", msg);
      set({ error: "Falha ao alternar Modo Zen: " + msg });
      throw e;
    }
  },

  updateSettings: async (partial) => {
    set({ error: null });
  try {
  await sendMessageAsync({ type: "STATE_PATCH", payload: { patch: { settings: partial } }, source: "popup-ui" } as unknown as Message);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      console.error("[store] updateSettings failed:", msg);
      set({ error: "Falha ao atualizar configurações: " + msg });
      throw e;
    }
  },
}));

// Per-store instance message listener state keyed by the exported useStore hook type
const storeListenerStates = new WeakMap<ReturnType<typeof useStore> & object, MessageListenerState>();

function getListenerState(storeInstance: ReturnType<typeof useStore> & object): MessageListenerState {
  let state = storeListenerStates.get(storeInstance);
  if (!state) {
    state = createListenerState();
    storeListenerStates.set(storeInstance, state);
  }
  return state;
}
