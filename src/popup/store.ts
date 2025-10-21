import { create } from "zustand"
import type { AppState, Message } from "../shared/types"
import { chromeAPI } from "../shared/chrome-mock"

declare const chrome: any;

interface PopupStore extends AppState {
  isLoading: boolean;
  loadState: () => Promise<void>;
  listenForUpdates: () => () => void; // Função para ouvir atualizações
  addToBlacklist: (domain: string) => Promise<void>;
  removeFromBlacklist: (domain: string) => Promise<void>;
  startPomodoro: (focusMinutes: number, breakMinutes: number) => Promise<void>;
  stopPomodoro: () => Promise<void>;
}

export const useStore = create<PopupStore>((set) => ({
  // Initial state
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

  // Actions
  loadState: async () => {
    try {
      set({ isLoading: true });
      const response = await chromeAPI.runtime.sendMessage({
        type: "GET_INITIAL_STATE",
      } as Message);

      if (response && !response.error) {
        set({ ...response, isLoading: false });
      } else {
        console.error("[v0] Failed to get initial state:", response?.error);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("[v0] Error loading state:", error);
      set({ isLoading: false });
    }
  },

  listenForUpdates: () => {
    const listener = (message: Message) => {
      if (message.type === 'STATE_UPDATED') {
        console.log('[v0] State update received from background:', message.payload);
        set({ ...message.payload });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    // Retorna uma função para remover o listener quando o componente desmontar
    return () => chrome.runtime.onMessage.removeListener(listener);
  },

  addToBlacklist: async (domain: string) => {
    await chromeAPI.runtime.sendMessage({
      type: "ADD_TO_BLACKLIST",
      payload: { domain },
    } as Message)
    // Não precisa de loadState(), o background vai notificar
  },

  removeFromBlacklist: async (domain: string) => {
    await chromeAPI.runtime.sendMessage({
      type: "REMOVE_FROM_BLACKLIST",
      payload: { domain },
    } as Message)
    // Não precisa de loadState(), o background vai notificar
  },

  startPomodoro: async (focusMinutes: number, breakMinutes: number) => {
    await chromeAPI.runtime.sendMessage({
      type: "START_POMODORO",
      payload: { focusMinutes, breakMinutes },
    } as Message)
    // Não precisa de loadState(), o background vai notificar
  },

  stopPomodoro: async () => {
    await chromeAPI.runtime.sendMessage({
      type: "STOP_POMODORO",
    } as Message)
    // Não precisa de loadState(), o background vai notificar
  },
}));
