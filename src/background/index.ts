// src/background/index.ts

// Logs de inicialização do SW (ajuda a diagnosticar carregamento/recarga)
console.log("[v0] Service Worker starting up...");

import { initializePomodoro } from "./modules/pomodoro";
import { addToBlacklist, initializeBlocker } from "./modules/blocker";
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
import type { AppState, PomodoroStatus } from "../shared/types";

// -----------------------------------------------------------------------------
// Bootstrap: inicializa todos os módulos do backend (SW)
// -----------------------------------------------------------------------------
async function bootstrap() {
  await initializePomodoro();
  await initializeBlocker();
  await initializeUsageTracker();
  await initializeDailySync();
  await initializeContentAnalyzer();
  await initializeFirebaseSync();
}

// -----------------------------------------------------------------------------
// Utilitário: injeta content.js em todas as abas http/https abertas
//  - Evita o erro "Receiving end does not exist" em abas já abertas
//  - Usa uma flag no window para não reinjetar desnecessariamente
// -----------------------------------------------------------------------------
async function injectContentScriptIntoAllTabs() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");

    const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });

    for (const tab of tabs) {
      if (!tab.id) continue;

      try {
        // Verifica se já sinalizamos a injeção previamente
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => (globalThis as any).v0ContentScriptInjected === true,
        });

        const alreadyInjected = Array.isArray(results) && results[0]?.result === true;

        if (!alreadyInjected) {
          // Injeta o arquivo gerado pelo build (dist/content.js)
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });

          // Marca no contexto da página que já injetamos
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              (globalThis as any).v0ContentScriptInjected = true;
            },
          });

          console.log(`[v0] Injected content script into tab ${tab.id}`);
        }
      } catch (e: any) {
        // Abas protegidas ou páginas sem permissão podem disparar estes erros
        const msg = String(e?.message || e);
        if (
          msg.includes("Cannot access contents of url") ||
          msg.includes("No matching signature") ||
          msg.includes("Cannot access a chrome:// URL") ||
          msg.includes("The extensions gallery cannot be scripted")
        ) {
          // Silencia erros esperados
          // console.warn(`[v0] Skipped injecting script into protected tab ${tab.id}: ${msg}`);
        } else {
          console.error(`[v0] Failed to inject script into tab ${tab.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.error("[v0] Unexpected error while injecting content scripts:", err);
  }
}

// -----------------------------------------------------------------------------
// onInstalled: cria estado inicial (install) e re-injeta content.js (install/update)
// -----------------------------------------------------------------------------
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

    const initialPomodoroStatus: PomodoroStatus = {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: DEFAULT_POMODORO_CONFIG,
    };

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLACKLIST]: initialState.blacklist,
      [STORAGE_KEYS.TIME_LIMITS]: initialState.timeLimits,
      [STORAGE_KEYS.DAILY_USAGE]: initialState.dailyUsage,
      [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: initialState.siteCustomizations,
      [STORAGE_KEYS.POMODORO_STATUS]: initialPomodoroStatus,
    });

    await chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: initialState.settings,
    });

    console.log("[v0] Initial state created");

    // Injeta o content script em abas já abertas na instalação
    await injectContentScriptIntoAllTabs();
  }

  if (details.reason === "update") {
    // Reinjeta o content script em todas as abas (corrige "Receiving end does not exist")
    await injectContentScriptIntoAllTabs();
  }

  // Inicializa módulos (em ambos os casos)
  await bootstrap();
});

// -----------------------------------------------------------------------------
// onStartup: re-inicializa módulos quando o navegador inicia
// -----------------------------------------------------------------------------
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup");
  await bootstrap();
});

// -----------------------------------------------------------------------------
// Hub de mensagens: UI (popup/options) ↔ SW
// -----------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(
  (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log("[v0] Message received:", message?.type, message?.payload);

    // Processa de forma assíncrona
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error("[v0] Error handling message:", error);
        sendResponse({ error: error?.message ?? String(error) });
      });

    // Indica que vamos responder de forma assíncrona
    return true;
  }
);

// -----------------------------------------------------------------------------
// Botões das notificações (ex.: sugestão de bloquear site distrativo)
// -----------------------------------------------------------------------------
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  console.log("[v0] Notification button clicked:", notificationId, buttonIndex);

  if (notificationId.startsWith("suggest-block-") && buttonIndex === 0) {
    const domain = notificationId.replace("suggest-block-", "");
    if (domain) {
      await addToBlacklist(domain);
      console.log(`[v0] Added ${domain} to blacklist from notification.`);
    }
  }

  // Limpa a notificação após o clique
  chrome.notifications.clear(notificationId);
});

console.log("[v0] Service Worker loaded and listeners attached.");
