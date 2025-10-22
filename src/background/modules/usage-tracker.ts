import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate, notificationsAllowed } from "./message-handler";
import { normalizeDomain, extractDomain } from "../../shared/url";

let activeTabId: number | null = null;

// Evita múltiplas inicializações/listeners
let usageInitialized = false;
let dailySyncInitialized = false;

// Base para IDs das regras de limite de tempo (faixa 3000..3999)
const LIMIT_RULE_BASE = 3000;

// -------------------------
// Utilidades de ID de regra
// -------------------------
function generateLimitRuleId(domain: string): number {
  // hash simples determinístico
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const c = domain.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0; // 32-bit
  }
  return LIMIT_RULE_BASE + (Math.abs(hash) % 1000); // 3000..3999
}

// -------------------------
// Daily Sync (limpa regras de sessão na virada do dia)
// -------------------------
export async function initializeDailySync() {
  if (dailySyncInitialized) return;
  dailySyncInitialized = true;

  console.log("[v0] Initializing daily sync for session rules...");

  await chrome.alarms.clear(ALARM_NAMES.DAILY_SYNC);

  // agenda para a próxima meia-noite e repete a cada 24h
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  await chrome.alarms.create(ALARM_NAMES.DAILY_SYNC, {
    when: Date.now() + msUntilMidnight,
    periodInMinutes: 60 * 24,
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.DAILY_SYNC) {
      console.log("[v0] Daily sync triggered: clearing time limit session rules.");
      await clearAllTimeLimitSessionRules();
      // (opcional) compactar DAILY_USAGE aqui se desejar
    }
  });

  console.log(
    `[v0] Daily sync scheduled in ${(msUntilMidnight / 60000).toFixed(1)} minutes, then every 24h.`
  );
}

async function clearAllTimeLimitSessionRules() {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );

  if (!timeLimits || timeLimits.length === 0) return;

  const idsToRemove = (timeLimits as TimeLimitEntry[]).map((entry) =>
    generateLimitRuleId(entry.domain)
  );

  if (idsToRemove.length) {
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: idsToRemove });
      console.log(`[v0] Cleared ${idsToRemove.length} time limit session rules.`);
    } catch (e) {
      console.error("[v0] Error clearing time limit session rules:", e);
    }
  }
}

// -------------------------
// Usage Tracker
// -------------------------
export async function initializeUsageTracker() {
  if (usageInitialized) return;
  usageInitialized = true;

  console.log("[v0] Initializing usage tracker module");

  await chrome.alarms.clear(ALARM_NAMES.USAGE_TRACKER);
  await chrome.alarms.create(ALARM_NAMES.USAGE_TRACKER, {
    periodInMinutes: USAGE_TRACKER_INTERVAL,
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.USAGE_TRACKER) {
      await recordActiveTabUsage();
    }
  });

  chrome.tabs.onActivated.addListener(handleTabActivation);
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
  chrome.windows.onFocusChanged.addListener(handleWindowFocusChange);

  await restoreTracking();
}

async function handleTabActivation(activeInfo: chrome.tabs.TabActiveInfo) {
  await recordActiveTabUsage();
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await startTrackingTab(tab.id, tab.url);
  } catch (e) {
    console.warn(`[v0] Could not get tab info for tabId: ${activeInfo.tabId}`, e);
    await stopTracking();
  }
}

async function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
  if (tabId === activeTabId && changeInfo.url) {
    await recordActiveTabUsage();
    await startTrackingTab(tabId, changeInfo.url);
  }
}

async function handleWindowFocusChange(windowId: number) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await recordActiveTabUsage();
    await stopTracking();
  } else {
    await restoreTracking();
  }
}

async function restoreTracking() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id && activeTab.url) {
    await startTrackingTab(activeTab.id, activeTab.url);
  } else {
    await stopTracking();
  }
}

async function startTrackingTab(tabId: number | undefined, url: string | undefined) {
  if (
    !tabId ||
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:")
  ) {
    await stopTracking();
    return;
  }
  activeTabId = tabId;
  const trackingInfo = {
    url,
    startTime: Date.now(),
  };
  await chrome.storage.session.set({ [STORAGE_KEYS.CURRENTLY_TRACKING]: trackingInfo });
}

async function stopTracking() {
  activeTabId = null;
  await chrome.storage.session.remove(STORAGE_KEYS.CURRENTLY_TRACKING);
}

// Registra o uso acumulado no domínio atual e verifica limites
async function recordActiveTabUsage() {
  const result = await chrome.storage.session.get(STORAGE_KEYS.CURRENTLY_TRACKING);
  const trackingInfo = result[STORAGE_KEYS.CURRENTLY_TRACKING];

  if (!trackingInfo || !trackingInfo.url || !trackingInfo.startTime) return;

  const domain = extractDomain(trackingInfo.url);
  if (!domain) {
    await stopTracking();
    return;
  }

  const timeSpent = Math.floor((Date.now() - trackingInfo.startTime) / 1000);

  // reinicia janela de medição
  trackingInfo.startTime = Date.now();
  await chrome.storage.session.set({ [STORAGE_KEYS.CURRENTLY_TRACKING]: trackingInfo });

  if (timeSpent < 1) return;

  const today = new Date().toISOString().split("T")[0];
  const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(
    STORAGE_KEYS.DAILY_USAGE
  );

  if (!dailyUsage[today]) dailyUsage[today] = {};
  dailyUsage[today][domain] = (dailyUsage[today][domain] || 0) + timeSpent;

  await chrome.storage.local.set({ [STORAGE_KEYS.DAILY_USAGE]: dailyUsage });

  console.log("[v0] Recorded usage:", domain, timeSpent, "seconds");

  await notifyStateUpdate();

  await checkTimeLimit(domain, dailyUsage[today][domain]);
}

// Aplica/atualiza regra de sessão se o limite foi excedido
async function checkTimeLimit(domain: string, totalSecondsToday: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  const limit = (timeLimits as TimeLimitEntry[]).find((e) => e.domain === domain);
  if (!limit) return;

  const limitSeconds = limit.limitMinutes * 60;

  if (totalSecondsToday >= limitSeconds) {
    const ruleId = generateLimitRuleId(domain);

    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId], // remove antes para idempotência
        addRules: [
          {
            id: ruleId,
            priority: 3,
            action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
            condition: {
              urlFilter: `||${domain}`,
              resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
            },
          },
        ],
      });

      console.log(`[v0] Time limit reached for ${domain}. Session block rule ${ruleId} added.`);

      if (await notificationsAllowed()) {
        chrome.notifications.create(`limit-exceeded-${domain}`, {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Limite de Tempo Atingido",
          message: `Você atingiu o limite de ${limit.limitMinutes} minutos em ${domain} hoje.`,
        });
      }
    } catch (e) {
      console.error(`[v0] Error updating session rule for time limit on ${domain}:`, e);
    }
  }
}

// -------------------------
// API chamada pelo message-handler
// -------------------------
export async function setTimeLimit(domain: string, limitMinutes: number) {
  const d = normalizeDomain(domain);
  if (!d) return;

  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  const list = timeLimits as TimeLimitEntry[];

  const existingIndex = list.findIndex((e) => e.domain === d);
  const ruleId = generateLimitRuleId(d);

  if (limitMinutes > 0) {
    if (existingIndex >= 0) {
      list[existingIndex].limitMinutes = limitMinutes;
    } else {
      list.push({ domain: d, limitMinutes });
    }
    console.log("[v0] Time limit set/updated:", d, limitMinutes, "minutes");

    // Se já excedeu hoje, aplica a regra de sessão imediatamente
    const today = new Date().toISOString().split("T")[0];
    const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(
      STORAGE_KEYS.DAILY_USAGE
    );
    const currentUsage = dailyUsage[today]?.[d] || 0;

    if (currentUsage >= limitMinutes * 60) {
      await checkTimeLimit(d, currentUsage);
    } else {
      // Remover eventual regra de sessão antiga se o limite foi aumentado
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
        console.log(
          `[v0] Removed session block rule ${ruleId} for ${d} (limit increased/updated).`
        );
      } catch (e) {
        // pode não existir — tudo bem
        console.warn(`[v0] No prior session rule to remove for ${d}:`, e?.toString?.());
      }
    }
  } else {
    // Remover limite
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      console.log("[v0] Time limit removed for:", d);
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
        console.log(`[v0] Removed session block rule ${ruleId} for ${d}.`);
      } catch (e) {
        console.warn(`[v0] No prior session rule to remove for ${d}:`, e?.toString?.());
      }
    }
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: list });
  await notifyStateUpdate();
}
