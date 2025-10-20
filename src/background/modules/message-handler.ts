import type { Message, AppState } from "../../shared/types"
import { STORAGE_KEYS } from "../../shared/constants"
import { addToBlacklist, removeFromBlacklist } from "./blocker"
import { startPomodoro, stopPomodoro } from "./pomodoro"
import { setTimeLimit } from "./usage-tracker"
import { handleContentAnalysisResult } from "./content-analyzer"
import { chrome } from "chrome"

export async function handleMessage(message: Message, sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case "GET_INITIAL_STATE":
      return await getAppState()

    case "ADD_TO_BLACKLIST":
      await addToBlacklist(message.payload.domain)
      return { success: true }

    case "REMOVE_FROM_BLACKLIST":
      await removeFromBlacklist(message.payload.domain)
      return { success: true }

    case "START_POMODORO":
      await startPomodoro(message.payload)
      return { success: true }

    case "STOP_POMODORO":
      await stopPomodoro()
      return { success: true }

    case "SET_TIME_LIMIT":
      await setTimeLimit(message.payload.domain, message.payload.limitMinutes)
      return { success: true }

    case "CONTENT_ANALYSIS_RESULT":
      await handleContentAnalysisResult(message.payload)
      return { success: true }

    case "TOGGLE_ZEN_MODE":
      // Zen mode is handled directly in content script
      return { success: true }

    case "UPDATE_SETTINGS":
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: message.payload,
      })
      return { success: true }

    default:
      throw new Error(`Unknown message type: ${message.type}`)
  }
}

async function getAppState(): Promise<AppState> {
  const local = await chrome.storage.local.get([
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.TIME_LIMITS,
    STORAGE_KEYS.DAILY_USAGE,
    STORAGE_KEYS.POMODORO_STATUS,
    STORAGE_KEYS.ZEN_MODE_PRESETS,
  ])

  const sync = await chrome.storage.sync.get([STORAGE_KEYS.SETTINGS])

  return {
    blacklist: local[STORAGE_KEYS.BLACKLIST] || [],
    timeLimits: local[STORAGE_KEYS.TIME_LIMITS] || [],
    dailyUsage: local[STORAGE_KEYS.DAILY_USAGE] || {},
    pomodoro: local[STORAGE_KEYS.POMODORO_STATUS],
    zenModePresets: local[STORAGE_KEYS.ZEN_MODE_PRESETS] || [],
    settings: sync[STORAGE_KEYS.SETTINGS],
  }
}
