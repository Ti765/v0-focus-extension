import type { Message, AppState } from "../../shared/types";
import { STORAGE_KEYS, DEFAULT_POMODORO_CONFIG, DEFAULT_SETTINGS } from "../../shared/constants";
import { addToBlacklist, removeFromBlacklist } from "./blocker";
import { startPomodoro, stopPomodoro } from "./pomodoro";
import { setTimeLimit } from "./usage-tracker";
import { handleContentAnalysisResult } from "./content-analyzer";

export async function handleMessage(message: Message, _sender: chrome.runtime.MessageSender): Promise<any> {
  switch (message.type) {
    case "GET_INITIAL_STATE":
      return await getAppState();

    case "ADD_TO_BLACKLIST":
      await addToBlacklist(message.payload.domain);
      return { success: true };

    case "REMOVE_FROM_BLACKLIST":
      await removeFromBlacklist(message.payload.domain);
      return { success: true };

    case "START_POMODORO":
      await startPomodoro(message.payload);
      return { success: true };

    case "STOP_POMODORO":
      await stopPomodoro();
      return { success: true };

    case "SET_TIME_LIMIT":
      await setTimeLimit(message.payload.domain, message.payload.limitMinutes);
      return { success: true };

    case "CONTENT_ANALYSIS_RESULT":
      await handleContentAnalysisResult(message.payload);
      return { success: true };

    case "TOGGLE_ZEN_MODE":
      return { success: true };

    case "UPDATE_SETTINGS":
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: message.payload,
      });
      return { success: true };
      
    case "SITE_CUSTOMIZATION_UPDATED":
      await chrome.storage.local.set({ 
        [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: message.payload 
      });
      return { success: true };

    case "STATE_UPDATED":
      console.warn(`[v0] Received a 'STATE_UPDATED' message, which should not happen.`);
      return { success: false, error: "Invalid message type received." };

    default:
      const exhaustiveCheck: never = message.type;
      throw new Error(`Unknown message type: ${exhaustiveCheck}`);
  }
}

async function getAppState(): Promise<AppState> {
  const [local, sync] = await Promise.all([
    chrome.storage.local.get([
      STORAGE_KEYS.BLACKLIST,
      STORAGE_KEYS.TIME_LIMITS,
      STORAGE_KEYS.DAILY_USAGE,
      STORAGE_KEYS.POMODORO_STATUS,
      STORAGE_KEYS.SITE_CUSTOMIZATIONS,
    ]),
    chrome.storage.sync.get([STORAGE_KEYS.SETTINGS])
  ]);
  
  return {
    blacklist: local[STORAGE_KEYS.BLACKLIST] || [],
    timeLimits: local[STORAGE_KEYS.TIME_LIMITS] || [],
    dailyUsage: local[STORAGE_KEYS.DAILY_USAGE] || {},
    pomodoro: local[STORAGE_KEYS.POMODORO_STATUS] || { state: "IDLE", timeRemaining: 0, currentCycle: 0, config: DEFAULT_POMODORO_CONFIG },
    siteCustomizations: local[STORAGE_KEYS.SITE_CUSTOMIZATIONS] || {},
    settings: sync[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
  };
}
