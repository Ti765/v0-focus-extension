// src/popup/store.ts
import { create } from "zustand";
import type { AppState, Message } from "../shared/types";
import { chromeAPI } from "../shared/chrome-mock"; // mock opcional para dev fora do Chrome

// ───────────────────────────────────────────────────────────────────────────────
// Helpers de ambiente
// ───────────────────────────────────────────────────────────────────────────────
const hasChrome =
  typeof chrome !== "undefined" &&
  !!chrome.runtime &&
  // quando roda dentro da extensão, chrome.runtime.id existe
  (typeof chrome.runtime.id === "string" || typeof chrome.runtime.id === "number");

const runtimeLike: {
  sendMessage: (msg: any, cb?: (res?: any) => void) => void;
  onMessage?: { addListener?: any; removeListener?: any };
  lastError?: { message?: string };
} = hasChrome ? (chrome.runtime as any) : (chromeAPI.runtime as any);

// ───────────────────────────────────────────────────────────────────────────────
// Encapsula sendMessage em Promise + tratamento de erro/lastError
// ───────────────────────────────────────────────────────────────────────────────
async function sendMessageAsync(message: Message): Promise<any> {
  if (!runtimeLike?.sendMessage) {
    // Ambiente fora do Chrome e sem mock
    throw new Error("Chrome runtime indisponível.");
  }

  return new Promise((resolve, reject) => {
    try {
      runtimeLike.sendMessage(message, (response: any) => {
        // Quando estamos no Chrome, podemos ler lastError corretamente
        const lastErr =
          hasChrome && chrome.runtime ? chrome.runtime.lastError : runtimeLike.lastError;

        if (lastErr && lastErr.message) {
          reject(new Error(lastErr.message));
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    } catch (err: any) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// Tipagem do store
// ───────────────────────────────────────────────────────────────────────────────
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
}

// ───────────────────────────────────────────────────────────────────────────────
// Store
// ───────────────────────────────────────────────────────────────────────────────
export const useStore = create<PopupStore>((set) => ({
  // Estado inicial (fallback até GET_INITIAL_STATE chegar)
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
      set({ isLoading: true, error: null });
      const response = await sendMessageAsync({ type: "GET_INITIAL_STATE" } as Message);
      // `response` deve ser o AppState completo vindo do SW
      set({ ...(response as AppState), isLoading: false });
    } catch (error: any) {
      console.error("[v0] Error loading state:", error);
      set({ isLoading: false, error: "Falha ao carregar o estado inicial." });
    }
  },

  listenForUpdates: () => {
    // Se não estiver no ambiente da extensão, retorna um noop unsubscribe
    if (!hasChrome || !chrome.runtime?.onMessage?.addListener) {
      return () => void 0;
    }

    const listener = (message: Message) => {
      if (message?.type === "STATE_UPDATED") {
        console.log("[v0] State update received from background:", message.payload);
        // Atualiza somente os dados (mantém actions do store)
        set({ ...(message.payload as AppState), isLoading: false, error: null });
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(listener);
        console.log("[v0] Removing state update listener.");
      } catch {
        // noop
      }
    };
  },

  // Ações que disparam mensagens ao SW
  addToBlacklist: async (domain: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "ADD_TO_BLACKLIST", payload: { domain } } as Message);
      // Estado será atualizado via STATE_UPDATED
    } catch (error: any) {
      console.error("[v0] Error adding to blacklist:", error);
      set({ error: error?.message || "Falha ao adicionar à blacklist." });
      throw error;
    }
  },

  removeFromBlacklist: async (domain: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "REMOVE_FROM_BLACKLIST", payload: { domain } } as Message);
      // Atualização vem via STATE_UPDATED
    } catch (error: any) {
      console.error("[v0] Error removing from blacklist:", error);
      set({ error: error?.message || "Falha ao remover da blacklist." });
      throw error;
    }
  },

  startPomodoro: async (focusMinutes: number, breakMinutes: number) => {
    try {
      set({ error: null });
      await sendMessageAsync({
        type: "START_POMODORO",
        payload: { focusMinutes, breakMinutes },
      } as Message);
      // Atualização vem via STATE_UPDATED
    } catch (error: any) {
      console.error("[v0] Error starting pomodoro:", error);
      set({ error: error?.message || "Falha ao iniciar Pomodoro." });
      throw error;
    }
  },

  stopPomodoro: async () => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "STOP_POMODORO" } as Message);
      // Atualização vem via STATE_UPDATED
    } catch (error: any) {
      console.error("[v0] Error stopping pomodoro:", error);
      set({ error: error?.message || "Falha ao parar Pomodoro." });
      throw error;
    }
  },

  toggleZenMode: async (preset?: string) => {
    try {
      set({ error: null });
      await sendMessageAsync({ type: "TOGGLE_ZEN_MODE", payload: { preset } } as Message);
      // Sem STATE_UPDATED; efeito é no content script
    } catch (error: any) {
      console.error("[v0] Error toggling Zen Mode:", error);
      set({
        error:
          error?.message ||
          "Falha ao ativar/desativar Modo Zen. A aba pode ser protegida ou sem content script.",
      });
      throw error;
    }
  },
}));

// Nota:
// Diferente da versão anterior, não sobrescrevemos `chrome.runtime.sendMessage` aqui.
// O store usa `runtimeLike` internamente, com fallback para `chromeAPI` quando fora do Chrome.
// Isso evita ReferenceError em ambientes de build/dev sem a API de extensões.
