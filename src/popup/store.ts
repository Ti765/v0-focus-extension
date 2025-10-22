// src/popup/store.ts
import { create } from "zustand";
import type { AppState, Message } from "../shared/types";

// ───────────────────────────────────────────────────────────────
// Wrapper: sendMessage como Promise + tratamento de lastError
// ───────────────────────────────────────────────────────────────
function sendMessageAsync<T = any>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) return reject(new Error(err.message));
        if (response?.error) return reject(new Error(response.error));
        resolve(response);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ───────────────────────────────────────────────────────────────
// Tipos do store
// ───────────────────────────────────────────────────────────────
interface PopupStore extends AppState {
  isLoading: boolean;
  error: string | null;
  loadState: () => Promise<void>;
  listenForUpdates: () => () => void;
  setError: (error: string | null) => void;
  addToBlacklist: (domain: string) => Promise<void>;
  removeFromBlacklist: (domain: string) => Promise<void>;
  startPomodoro: (focusMinutes: number, breakMinutes: number) => Promise<void>;
  stopPomodoro: () => Promise<void>;
  toggleZenMode: (preset?: string) => Promise<void>;
  setTimeLimit: (domain: string, limitMinutes: number) => Promise<void>;
}

// ───────────────────────────────────────────────────────────────
// Implementação do store
// ───────────────────────────────────────────────────────────────
export const useStore = create<PopupStore>((set) => ({
  // Estado inicial (fallback até o GET_INITIAL_STATE chegar)
  blacklist: [],
  timeLimits: [],
  dailyUsage: {},
  pomodoro: {
    state: "IDLE",
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
    analyticsConsent: false,
    productiveKeywords: [],
    distractingKeywords: [],
    notificationsEnabled: true,
  },
  isLoading: true,
  error: null,

  // Ações base
  setError: (error: string | null) => set({ error }),

  loadState: async () => {
    try {
      const response = await sendMessageAsync<AppState>({ type: "GET_INITIAL_STATE" });
      set({ ...response, isLoading: false, error: null });
    } catch (e) {
      console.error("[v0][Store] loadState failed:", e);
      set({ error: "Falha ao carregar o estado inicial.", isLoading: false });
    }
  },

  listenForUpdates: () => {
    // Se não estiver no ambiente da extensão (tests/dev), retorna um noop
    if (typeof chrome === "undefined" || !chrome.runtime?.onMessage?.addListener) {
      return () => void 0;
    }

    const handler = (msg: Message) => {
      if (msg?.type === "STATE_UPDATED" && msg.payload) {
        set({ ...(msg.payload as AppState), isLoading: false, error: null });
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  },

  // Ações que conversam com o Service Worker
  addToBlacklist: async (domain: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "ADD_TO_BLACKLIST", payload: { domain } });
      // Atualização de estado virá via STATE_UPDATED
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] addToBlacklist failed:", error);
      set({ error: "Falha ao adicionar à blacklist: " + error });
      throw e;
    }
  },

  removeFromBlacklist: async (domain: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "REMOVE_FROM_BLACKLIST", payload: { domain } });
      // Atualização de estado virá via STATE_UPDATED
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] removeFromBlacklist failed:", error);
      set({ error: "Falha ao remover da blacklist: " + error });
      throw e;
    }
  },

  startPomodoro: async (focusMinutes: number, breakMinutes: number) => {
    try {
      set({ error: null });
      await sendMessageAsync({
        type: "START_POMODORO",
        payload: { focusMinutes, breakMinutes },
      });
      // Atualização via STATE_UPDATED
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] startPomodoro failed:", error);
      set({ error: "Falha ao iniciar Pomodoro: " + error });
      throw e;
    }
  },

  stopPomodoro: async () => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "STOP_POMODORO" });
      // Atualização via STATE_UPDATED
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] stopPomodoro failed:", error);
      set({ error: "Falha ao parar Pomodoro: " + error });
      throw e;
    }
  },

  toggleZenMode: async (preset?: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "TOGGLE_ZEN_MODE", payload: { preset } });
      // Não há STATE_UPDATED aqui; ação ocorre no content script
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] toggleZenMode failed:", error);
      set({ error: "Falha ao alternar Modo Zen: " + error });
      throw e;
    }
  },

  setTimeLimit: async (domain: string, limitMinutes: number) => {
    try {
      set({ error: null });
      await sendMessageAsync({
        type: "SET_TIME_LIMIT",
        payload: { domain, limitMinutes }, // ⚠️ chave correta esperada pelo SW
      });
      // Atualização virá via STATE_UPDATED
    } catch (e) {
      const error = String(e);
      console.error("[v0][Store] setTimeLimit failed:", error);
      set({ error: "Falha ao definir limite de tempo: " + error });
      throw e;
    }
  },
}));
