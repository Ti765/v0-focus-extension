import type { Message, AppState } from "../../shared/types";
import { MESSAGE } from "../../shared/types";
import {
  STORAGE_KEYS,
  DEFAULT_POMODORO_CONFIG,
  DEFAULT_SETTINGS,
} from "../../shared/constants";
import { addToBlacklist, removeFromBlacklist } from "./blocker";
import { startPomodoro, stopPomodoro } from "./pomodoro";
import { setTimeLimit } from "./usage-tracker";
import { handleContentAnalysisResult } from "./content-analyzer";

// Hash do último estado emitido para evitar broadcasts desnecessários
let lastEmittedHash: string = "";

/** Notifica todas as UIs (popup/options) que o state mudou */
export async function notifyStateUpdate() {
  try {
    const appState = await getAppState();
    
    // Hash determinístico para evitar false negatives
    // Use deterministic serialization that sorts all nested object keys recursively
    const currentHash = JSON.stringify(appState, (_, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sortedObj: any = {};
        Object.keys(value).sort().forEach(k => {
          sortedObj[k] = value[k];
        });
        return sortedObj;
      }
      return value;
    });
    if (currentHash === lastEmittedHash) {
      return; // Evita broadcast desnecessário
    }
    lastEmittedHash = currentHash;
    
    // broadcast: use callback and check chrome.runtime.lastError to avoid
    // noisy benign errors when UIs close (like popup/options). Ignore both
    // "Receiving end does not exist" and the port-closed message.
    chrome.runtime.sendMessage({ type: MESSAGE.STATE_UPDATED, payload: { state: appState } }, () => {
      const err = chrome.runtime.lastError;
      // Use an explicit, anchored whitelist of ignorable error message prefixes so changes
      // in Chrome's exact text won't accidentally bypass the filter.
      const errMsg = err?.message ?? "";
      const ignorablePrefixes = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
      ];
      const isIgnorable = ignorablePrefixes.some((p) => errMsg === p || errMsg.startsWith(p));
      // Only warn if there's an error AND it's NOT one of the expected "no receiver" errors
      if (err && !isIgnorable) {
        console.warn("[v0] notifyStateUpdate lastError:", err.message);
      }
    });
    // Also push to any connected ports (popup/options) for more reliable updates.
    try {
      // connectedPorts is populated by chrome.runtime.onConnect below.
      for (const port of connectedPorts) {
        try {
          port.postMessage({ type: MESSAGE.STATE_UPDATED, payload: { state: appState } });
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
    return settings?.notifications ?? settings?.notificationsEnabled !== false;
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
    isLoading: false,
    error: null,
    blacklist: ((local[STORAGE_KEYS.BLACKLIST] || []) as any[]).map((entry) => {
      // Ensure we always return a string, handling both legacy objects and strings
      if (typeof entry === "string") {
        return entry;
      }
      if (typeof entry === "object" && entry !== null && "domain" in entry) {
        return String((entry as any).domain);
      }
      // Fallback: convert anything else to string
      return String(entry);
    }),
    timeLimits: local[STORAGE_KEYS.TIME_LIMITS] || [],
    dailyUsage: local[STORAGE_KEYS.DAILY_USAGE] || {},
    pomodoro:
        local[STORAGE_KEYS.POMODORO_STATUS] || {
          config: DEFAULT_POMODORO_CONFIG,
          state: {
            phase: "idle",
            isPaused: false,
            cycleIndex: 0,
            remainingMs: 0,
          },
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
            port.postMessage({ type: MESSAGE.STATE_UPDATED, payload: { state: st } });
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
  message: Message & { skipNotify?: boolean },
  _sender: chrome.runtime.MessageSender
): Promise<any> {

  switch (message.type) {
    case MESSAGE.GET_INITIAL_STATE: {
      return await getAppState();
    }

    case MESSAGE.ADD_TO_BLACKLIST: {
      const domain = (message.payload as any)?.domain;
      if (typeof domain === "string") await addToBlacklist(domain);
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.REMOVE_FROM_BLACKLIST: {
      const domain = (message.payload as any)?.domain;
      if (typeof domain === "string") await removeFromBlacklist(domain);
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.POMODORO_START: {
      await startPomodoro((message.payload as any) || undefined);
      return { success: true };
    }

    case MESSAGE.POMODORO_STOP: {
      await stopPomodoro();
      return { success: true };
    }

    case MESSAGE.TIME_LIMIT_SET: {
      const payload = message.payload as any;
      const domain = payload?.domain;
      const minutes = payload?.dailyMinutes ?? payload?.limitMinutes;
      if (typeof domain === "string" && typeof minutes === "number") {
        await setTimeLimit(domain, minutes);
      }
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.CONTENT_ANALYSIS_RESULT: {
      await handleContentAnalysisResult((message.payload as any)?.result);
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.STATE_PATCH: {
      const raw = message.payload ?? {};
      // Simplified payload extraction with defensive handling
      const patch = (raw as any).patch?.settings ?? (raw as any).settings ?? raw;

      if (!patch || typeof patch !== 'object') {
        return { success: false, error: "Invalid STATE_PATCH payload" };
      }

      const { [STORAGE_KEYS.SETTINGS]: current } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const next = { ...(current ?? {}), ...(patch ?? {}) };

      // Avoid writing identical settings which can cause UI echo loops
      const currentJson = JSON.stringify(current ?? {});
      const nextJson = JSON.stringify(next);
      if (currentJson === nextJson) {
        // nothing changed
        return { success: true };
      }

      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: next });
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.SITE_CUSTOMIZATION_UPDATED: {
      const { [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: siteCustomizations } =
        await chrome.storage.local.get(STORAGE_KEYS.SITE_CUSTOMIZATIONS);
      // Payload may be either a map of domain->config or { domain, config }
      const payload = message.payload as any;
      let updatedCustomizations: Record<string, any> = { ...(siteCustomizations ?? {}) };
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        if (payload.domain && payload.config) {
          // single entry
          updatedCustomizations = { ...updatedCustomizations, [String(payload.domain)]: payload.config };
        } else {
          // assume a map of domain->config and merge
          updatedCustomizations = { ...updatedCustomizations, ...payload };
        }
      }
      await chrome.storage.local.set({ [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: updatedCustomizations });
      await notifyStateUpdate();
      return { success: true };
    }

    case MESSAGE.TOGGLE_ZEN_MODE: {
      // Envia ao content script da aba ativa (pode falhar em páginas protegidas)
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: MESSAGE.TOGGLE_ZEN_MODE,
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

    case MESSAGE.STATE_UPDATED: {
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
