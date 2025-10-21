import { initializePomodoro } from "./modules/pomodoro"
import { initializeBlocker } from "./modules/blocker"
import { initializeUsageTracker } from "./modules/usage-tracker"
import { initializeContentAnalyzer } from "./modules/content-analyzer"
import { initializeFirebaseSync } from "./modules/firebase-sync"
import { handleMessage } from "./modules/message-handler"
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_POMODORO_CONFIG } from "../shared/constants"
import type { AppState, PomodoroStatus } from "../shared/types"

// Service Worker initialization
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  console.log("[v0] Extension installed/updated:", details.reason)

  // Initialize default state on first install
  if (details.reason === "install") {
    // CORREÇÃO: Removido 'zenModePresets' e adicionado 'siteCustomizations' para corresponder ao tipo AppState.
    const initialState: Partial<AppState> = {
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      siteCustomizations: {}, // Corrigido
      settings: DEFAULT_SETTINGS,
    }

    const initialPomodoroStatus: PomodoroStatus = {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: DEFAULT_POMODORO_CONFIG,
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLACKLIST]: initialState.blacklist,
      [STORAGE_KEYS.TIME_LIMITS]: initialState.timeLimits,
      [STORAGE_KEYS.DAILY_USAGE]: initialState.dailyUsage,
      // CORREÇÃO: Usando a chave correta 'SITE_CUSTOMIZATIONS'.
      [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: initialState.siteCustomizations,
      [STORAGE_KEYS.POMODORO_STATUS]: initialPomodoroStatus,
    })

    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: initialState.settings,
    })

    console.log("[v0] Initial state created")
  }

  // Initialize all modules
  await initializePomodoro()
  await initializeBlocker()
  await initializeUsageTracker()
  await initializeContentAnalyzer()
  await initializeFirebaseSync()
})

// Service Worker startup
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started")

  // Re-initialize modules on browser startup
  await initializePomodoro()
  await initializeBlocker()
  await initializeUsageTracker()
  await initializeContentAnalyzer()
  await initializeFirebaseSync()
})

// Message handling - central communication hub
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log("[v0] Message received:", message.type, message.payload)

  // Handle message asynchronously
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error("[v0] Error handling message:", error)
      sendResponse({ error: error.message })
    })

  // Return true to indicate async response
  return true
})

console.log("[v0] Service Worker loaded")
