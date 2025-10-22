// Logs de inicialização
console.log("[v0] Service Worker starting up...");

import { initializePomodoro } from "./modules/pomodoro";
import { addToBlacklist, initializeBlocker } from "./modules/blocker";
import { initializeUsageTracker, initializeDailySync } from "./modules/usage-tracker";
import { initializeContentAnalyzer } from "./modules/content-analyzer";
import { initializeFirebaseSync } from "./modules/firebase-sync";
import { handleMessage } from "./modules/message-handler";
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_POMODORO_CONFIG } from "../shared/constants";
import type { AppState, PomodoroStatus } from "../shared/types";

// Função de bootstrap para inicializar todos os módulos
async function bootstrap() {
  await initializePomodoro();
  await initializeBlocker();
  await initializeUsageTracker();
  await initializeDailySync();      // reset diário de regras de limite
  await initializeContentAnalyzer();
  await initializeFirebaseSync();
}

// onInstalled: cria estado inicial e reinjeta content.js após update
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  console.log("[v0] Extension installed/updated:", details.reason);

  if (details.reason === "install") {
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
  }

  // Após update, reinjeta o content script nas abas abertas
  if (details.reason === "update") {
    console.log("[v0] Re-injecting content scripts after update.");
    const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"] // precisa existir em dist/ (gerado por vite.content.config.ts)
          });
        } catch (e) {
          console.warn(`[v0] Failed to re-inject script into tab ${tab.id}:`, e);
        }
      }
    }
  }

  await bootstrap();
});

// onStartup: re-inicializa módulos ao iniciar o navegador
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup");
  await bootstrap();
});

// Hub central de mensagens
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log("[v0] Message received:", message?.type, message?.payload);

  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error("[v0] Error handling message:", error);
      sendResponse({ error: error?.message ?? String(error) });
    });

  return true; // resposta assíncrona
});

// Listener para botões de notificação (ex.: sugestão de bloquear site distrativo)
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  console.log("[v0] Notification button clicked:", notificationId, buttonIndex);

  // Botão "Sim, bloquear" da sugestão do analisador de conteúdo
  if (notificationId.startsWith("suggest-block-") && buttonIndex === 0) {
    const domain = notificationId.replace("suggest-block-", "");
    if (domain) {
      await addToBlacklist(domain);
      console.log(`[v0] Added ${domain} to blacklist from notification.`);
    }
  }

  // Limpa a notificação após clique
  chrome.notifications.clear(notificationId);
});

console.log("[v0] Service Worker loaded and listeners attached.");
