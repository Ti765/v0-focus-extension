// Logs de inicialização bem no topo (aparecem mesmo se algo falhar depois)
console.log("[v0] Service Worker starting up...");

import { initializePomodoro } from "./modules/pomodoro";
import {
  initializeBlocker,
  addToBlacklist,
} from "./modules/blocker";
import {
  initializeUsageTracker,
  initializeDailySync,
} from "./modules/usage-tracker";
import { initializeContentAnalyzer } from "./modules/content-analyzer";
import { initializeFirebaseSync } from "./modules/firebase-sync";
import { handleMessage } from "./modules/message-handler";
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_POMODORO_CONFIG,
} from "../shared/constants";
import type { AppState, PomodoroState } from "../shared/types";

/** Bootstrap de todos os módulos do SW */
async function bootstrap() {
  try {
    await initializePomodoro();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }

  try {
    await initializeBlocker();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }

  try {
    await initializeUsageTracker();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }

  try {
    await initializeDailySync();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }

  try {
    await initializeContentAnalyzer();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }

  try {
    await initializeFirebaseSync();
  } catch (e) {
    // Firebase é opcional: apenas log
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}

/**
 * Injeta content.js em todas as abas http/https abertas (idempotente).
 * Exigências cumpridas:
 *  - manifest.json contém web_accessible_resources com "content.js"
 *  - este arquivo é gerado pelo build (vite.content.config.ts)
 */
async function injectContentScriptIntoAllTabs() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");
    const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });

    for (const tab of tabs) {
      if (!tab.id) continue;

      try {
        // Verifica se já foi injetado (flag na janela da página)
        const check = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => (globalThis as any).__v0ContentScriptInjected === true,
          // em MV3, func roda na página; caso bloqueado, cairá no catch abaixo
        });

        const already = Array.isArray(check) && check[0]?.result === true;

        if (!already) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              (globalThis as any).__v0ContentScriptInjected = true;
            },
          });
          console.log(`[v0] Injected content script into tab ${tab.id}`);
        }
      } catch (e: any) {
        // Ignora abas protegidas/exceções esperadas
        const msg = String(e?.message ?? e);
        if (
          msg.includes("Cannot access contents of url") ||
          msg.includes("No matching signature") ||
          msg.includes("Cannot access a chrome:// URL") ||
          msg.includes("The extensions gallery cannot be scripted")
        ) {
          // ok, apenas não é possível injetar nessa aba
        } else {
          console.warn(`[v0] Failed to inject in tab ${tab.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.error("[v0] Error while injecting content scripts:", err);
  }
}

/** onInstalled: cria estado inicial e injeta CS em abas existentes */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[v0] Extension installed/updated:", details.reason);

  if (details.reason === "install") {
    // Estado inicial completo
    const initialState: Partial<AppState> = {
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      siteCustomizations: {},
      settings: DEFAULT_SETTINGS,
    };

    const initialPomodoroStatus: PomodoroState = {
      phase: "idle",
      isPaused: false,
      cycleIndex: 0,
      remainingMs: 0,
    };

    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.BLACKLIST]: initialState.blacklist,
        [STORAGE_KEYS.TIME_LIMITS]: initialState.timeLimits,
        [STORAGE_KEYS.DAILY_USAGE]: initialState.dailyUsage,
        [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: initialState.siteCustomizations,
  [STORAGE_KEYS.POMODORO_STATUS]: { config: DEFAULT_POMODORO_CONFIG, state: initialPomodoroStatus },
      });

      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: initialState.settings,
      });

      console.log("[v0] Initial state created");
    } catch (e) {
      console.error("[v0] Failed to create initial state:", e);
    }

    // Instalação: injeta content.js nas abas já abertas
    await injectContentScriptIntoAllTabs();
  }

  if (details.reason === "update") {
    // Atualização: re-injeta para evitar "Receiving end does not exist"
    await injectContentScriptIntoAllTabs();
  }

  // Inicializa módulos em ambos os casos
  await bootstrap();
});

/** onStartup: re-inicializa módulos (navegador aberto) */
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup");
  await bootstrap();
});

/** Hub de mensagens */
chrome.runtime.onMessage.addListener(
  (message: any, sender: chrome.runtime.MessageSender, sendResponse) => {
    try {
      console.log("[v0] Message received:", message?.type, message?.payload);

      // handleMessage já retorna uma Promise; garantimos resposta assíncrona
      Promise.resolve(handleMessage(message, sender))
        .then((res) => sendResponse(res))
        .catch((err) => {
          console.error("[v0] Error handling message:", err);
          sendResponse({ error: err?.message ?? String(err) });
        });

      return true; // mantém o canal aberto para resposta assíncrona
    } catch (e) {
      console.error("[v0] onMessage top-level error:", e);
      sendResponse({ error: (e as Error).message });
      return false;
    }
  }
);

/** Botões de notificação (sugestão de bloqueio) */
chrome.notifications.onButtonClicked.addListener(
  async (notificationId, buttonIndex) => {
    try {
      console.log("[v0] Notification button clicked:", notificationId, buttonIndex);

      if (notificationId.startsWith("suggest-block-") && buttonIndex === 0) {
        // Botão "Sim, bloquear"
        const domain = notificationId.replace("suggest-block-", "");
        if (domain) {
          await addToBlacklist(domain);
          console.log(`[v0] Added ${domain} to blacklist from notification.`);
        }
      }
    } finally {
      // Sempre limpa a notificação
      chrome.notifications.clear(notificationId);
    }
  }
);

console.log("[v0] Service Worker loaded and listeners attached.");
