import { create } from "zustand"
import type { AppState, Message } from "../shared/types"
import { chromeAPI } from "../shared/chrome-mock"

interface PopupStore extends AppState {
  isLoading: boolean
  loadState: () => Promise<void>
  addToBlacklist: (domain: string) => Promise<void>
  removeFromBlacklist: (domain: string) => Promise<void>
  startPomodoro: (focusMinutes: number, breakMinutes: number) => Promise<void>
  stopPomodoro: () => Promise<void>
}

export const useStore = create<PopupStore>((set, get) => ({
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
  zenModePresets: [],
  settings: {
    analyticsConsent: false,
    productiveKeywords: [],
    distractingKeywords: [],
    notificationsEnabled: true,
  },
  // CORREÇÃO: Adicionado o campo 'siteCustomizations' que estava faltando no estado inicial.
  siteCustomizations: {},
  isLoading: true,

  // Actions
  loadState: async () => {
    try {
      const response = await chromeAPI.runtime.sendMessage({
        type: "GET_INITIAL_STATE",
      } as Message)

      if (response) {
        set({
          ...response,
          isLoading: false,
        })
      } else {
        // Lida com o caso de a resposta ser undefined, talvez por erro na comunicação
        console.error("[v0] Failed to get initial state, response was empty.");
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("[v0] Error loading state:", error)
      set({ isLoading: false })
    }
  },

  addToBlacklist: async (domain: string) => {
    await chromeAPI.runtime.sendMessage({
      type: "ADD_TO_BLACKLIST",
      payload: { domain },
    } as Message)

    // Reload state
    await get().loadState()
  },

  removeFromBlacklist: async (domain: string) => {
    await chromeAPI.runtime.sendMessage({
      type: "REMOVE_FROM_BLACKLIST",
      payload: { domain },
    } as Message)

    // Reload state
    await get().loadState()
  },

  startPomodoro: async (focusMinutes: number, breakMinutes: number) => {
    await chromeAPI.runtime.sendMessage({
      type: "START_POMODORO",
      payload: { focusMinutes, breakMinutes },
    } as Message)

    // Reload state
    await get().loadState()
  },

  stopPomodoro: async () => {
    await chromeAPI.runtime.sendMessage({
      type: "STOP_POMODORO",
    } as Message)

    // Reload state
    await get().loadState()
  },
}))
