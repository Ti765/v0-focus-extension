import type { Message, AppState } from "../../shared/types";
import {
  STORAGE_KEYS,
  DEFAULT_POMODORO_CONFIG,
  DEFAULT_SETTINGS,
} from "../../shared/constants";
import { addToBlacklist, removeFromBlacklist } from "./blocker";
import { startPomodoro, stopPomodoro } from "./pomodoro";
import { setTimeLimit } from "./usage-tracker";
import { handleContentAnalysisResult } from "./content-analyzer";
import { deepEqual } from "../../shared/utils";

/** Notifica todas as UIs (popup/options) que o state mudou */
export async function notifyStateUpdate() {
  try {
    const appState = await getAppState();
    // Guard: avoid broadcasting identical state repeatedly (which can cause UI echo loops)
    try {
      if ((notifyStateUpdate as any)._lastEmitted && deepEqual((notifyStateUpdate as any)._lastEmitted, appState)) {
        // no-op: state identical to last emitted
        return;
      }
      (notifyStateUpdate as any)._lastEmitted = appState;
    } catch (e) {
      // if deepEqual fails for any reason, proceed with broadcast
    }
    // broadcast: use callback and check chrome.runtime.lastError to avoid
    // noisy "Receiving end does not exist" when no UI is open.
    chrome.runtime.sendMessage({ type: "STATE_UPDATED", payload: appState }, () => {
      const err = chrome.runtime.lastError;
      if (err && !/Receiving end does not exist/.test(err.message || "")) {
        console.warn("[v0] notifyStateUpdate lastError:", err.message);
      }
    });
    // Also push to any connected ports (popup/options) for more reliable updates.
    try {
      // connectedPorts is populated by chrome.runtime.onConnect below.
      for (const port of connectedPorts) {
        try {
          port.postMessage({ type: "STATE_UPDATED", payload: appState });
        } catch (e) {
          // ignore per-port failures; cleanup will occur on disconnect
          console.warn("[v0] Failed to post state to port:", e);
        }
      }
    } catch (e) {
      // Defensive: do not fail notify flow due to port posting
    }
  } catch (error) {
    console.error("[v0] Error notifying state update:", error);
  }
}

/** Leitura de settings para gate de notificações (usado por outros módulos) */
export async function notificationsAllowed(): Promise<boolean> {
  try {
    const { [STORAGE_KEYS.SETTINGS]: settings } =
      await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    // default: true (para não suprimir alertas caso falhe leitura)
    return settings?.notificationsEnabled !== false;
  } catch {
    return true;
  }
}

/** Agrega todo o estado atual da extensão */
export async function getAppState(): Promise<AppState> {
  const localKeys = [
    STORAGE_KEYS.BLACKLIST,
    STORAGE_KEYS.TIME_LIMITS,
    STORAGE_KEYS.DAILY_USAGE,
    STORAGE_KEYS.POMODORO_STATUS,
    STORAGE_KEYS.SITE_CUSTOMIZATIONS,
  ];

  const [local, sync] = await Promise.all([
    chrome.storage.local.get(localKeys),
    chrome.storage.sync.get(STORAGE_KEYS.SETTINGS),
  ]);

  return {
    blacklist: local[STORAGE_KEYS.BLACKLIST] || [],
    timeLimits: local[STORAGE_KEYS.TIME_LIMITS] || [],
    dailyUsage: local[STORAGE_KEYS.DAILY_USAGE] || {},
    pomodoro:
      local[STORAGE_KEYS.POMODORO_STATUS] || {
        state: "IDLE",
        timeRemaining: 0,
        currentCycle: 0,
        config: DEFAULT_POMODORO_CONFIG,
      },
    siteCustomizations: local[STORAGE_KEYS.SITE_CUSTOMIZATIONS] || {},
    settings: sync[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
  };
}

// ----------------
// Port-based messaging (Opção B)
// ----------------
// We maintain a Set of connected Ports so the SW can push state updates directly
// to open popups/options without relying on chrome.runtime.sendMessage.
const connectedPorts = new Set<chrome.runtime.Port>();

if (chrome.runtime?.onConnect?.addListener) {
  chrome.runtime.onConnect.addListener((port) => {
    try {
      // Accept only ports from extension pages (optional filtering by name)
      connectedPorts.add(port);

      // Send initial state immediately to the newly connected port
      getAppState()
        .then((st) => {
          try {
            port.postMessage({ type: "STATE_UPDATED", payload: st });
          } catch (e) {
            // ignore
          }
        })
        .catch(() => {
          // ignore
        });

      port.onDisconnect.addListener(() => {
        connectedPorts.delete(port);
      });
    } catch (e) {
      // defensive: if anything goes wrong, ensure port is not left referenced
      try {
        connectedPorts.delete(port);
      } catch {
        // noop
      }
    }
  });
}

/** Roteador central de mensagens oriundas do popup/options/content */
export async function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender
): Promise<any> {
  switch (message.type) {
    case "GET_INITIAL_STATE": {
      return await getAppState();
    }

    case "ADD_TO_BLACKLIST": {
      await addToBlacklist(message.payload?.domain);
      return { success: true };
    }

    case "REMOVE_FROM_BLACKLIST": {
      await removeFromBlacklist(message.payload?.domain);
      return { success: true };
    }

    case "START_POMODORO": {
      await startPomodoro(message.payload);
      return { success: true };
    }

    case "STOP_POMODORO": {
      await stopPomodoro();
      return { success: true };
    }

    case "SET_TIME_LIMIT": {
      await setTimeLimit(message.payload?.domain, message.payload?.limitMinutes);
      return { success: true };
    }

    case "CONTENT_ANALYSIS_RESULT": {
      await handleContentAnalysisResult(message.payload);
      return { success: true };
    }

    case "UPDATE_SETTINGS": {
      const { [STORAGE_KEYS.SETTINGS]: settings } =
        await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const updatedSettings = { ...(settings ?? {}), ...(message.payload ?? {}) };
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updatedSettings });
      await notifyStateUpdate();
      return { success: true };
    }

    case "SITE_CUSTOMIZATION_UPDATED": {
      const { [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: siteCustomizations } =
        await chrome.storage.local.get(STORAGE_KEYS.SITE_CUSTOMIZATIONS);
      const updatedCustomizations = {
        ...(siteCustomizations ?? {}),
        ...(message.payload ?? {}),
      };
      await chrome.storage.local.set({
        [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: updatedCustomizations,
      });
      await notifyStateUpdate();
      return { success: true };
    }

    case "TOGGLE_ZEN_MODE": {
      // Envia ao content script da aba ativa (pode falhar em páginas protegidas)
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "TOGGLE_ZEN_MODE",
            payload: message.payload,
          });
        } catch (error) {
          // Evita derrubar o SW em páginas que não aceitam mensagens
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${tab.id}. ` +
              `It may be a protected page or the content script wasn't injected.`,
            error
          );
          // Retornamos sucesso para não quebrar a UI; a ação simplesmente não ocorreu.
        }
      }
      return { success: true };
    }

    case "STATE_UPDATED": {
      // Não deve vir de clientes; logamos para visibilidade
      console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      );
      return { success: false, error: "Invalid message type received." };
    }

    default: {
      // Checagem exaustiva em tempo de compilação
      const exhaustiveCheck: never = message.type as never;
      throw new Error(`Unknown message type: ${exhaustiveCheck}`);
    }
  }
}
