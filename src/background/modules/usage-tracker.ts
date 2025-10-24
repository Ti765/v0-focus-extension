import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate, notificationsAllowed } from "./message-handler";
import { normalizeDomain, extractDomain } from "../../shared/url";

// --- Estado interno ---
let activeTabId: number | null = null;
let usageInitialized = false;
let dailySyncInitialized = false;

// Base para IDs das regras de sessão (time limits). Usamos um range separado (3000..3999).
const LIMIT_RULE_BASE = 3000;
const LIMIT_RULE_RANGE = 1000;

// ---- Util: gera ID determinístico para uma regra de sessão de limite de tempo ----
function generateLimitRuleId(domain: string): number {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const c = domain.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0; // 32 bits
  }
  const offset = Math.abs(hash) % LIMIT_RULE_RANGE;
  return LIMIT_RULE_BASE + offset;
}

function escapeForRegex(domain: string): string {
  return domain.replace(/[+?^${}()|[\]\\\.-]/g, "\\$&");
}

// ---- Agendamento diário: limpar regras de sessão (reseta bloqueios de limite de tempo) ----
export async function initializeDailySync() {
  if (dailySyncInitialized) return;
  dailySyncInitialized = true;

  console.log("[v0] Initializing daily sync for session rules...");

  // cancela um eventual alarme antigo
  await chrome.alarms.clear(ALARM_NAMES.DAILY_SYNC);

  // agenda para a próxima meia-noite (e repete a cada 24h)
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();
  const startWhen = Date.now() + Math.max(msUntilMidnight, 60_000); // no mínimo 1 min para evitar disparo imediato

  await chrome.alarms.create(ALARM_NAMES.DAILY_SYNC, {
    when: startWhen,
    periodInMinutes: 24 * 60,
  });

  console.log(
    `[v0] Daily sync scheduled in ${(startWhen - Date.now()) / 60000 >> 0} minutes, then every 24h.`
  );

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAMES.DAILY_SYNC) return;
    console.log("[v0] Daily sync triggered: clearing time limit session rules.");
    await clearAllTimeLimitSessionRules();
  });
}

async function clearAllTimeLimitSessionRules() {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );

  if (!Array.isArray(timeLimits) || timeLimits.length === 0) return;

  const ids = (timeLimits as TimeLimitEntry[]).map((e) => generateLimitRuleId(e.domain));

  if (ids.length) {
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: ids });
      console.log(`[v0] Cleared ${ids.length} time limit session rules.`);
    } catch (e) {
      console.error("[v0] Error clearing time limit session rules:", e);
    }
  }
}

// ---- Inicialização do rastreador de uso (idempotente) ----
export async function initializeUsageTracker() {
  if (usageInitialized) return;
  usageInitialized = true;

  console.log("[v0] Initializing usage tracker module");

  // agenda o batimento do tracker
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

  await restoreTracking(); // tenta rastrear a aba ativa atual
}

// ---- Listeners de aba/janela ----
async function handleTabActivation(activeInfo: chrome.tabs.TabActiveInfo) {
  // fecha período anterior (se houver) antes de mudar
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

// ---- Coração do tracker: registra uso e aplica limites ----
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

  // reinicia período
  trackingInfo.startTime = Date.now();
  await chrome.storage.session.set({ [STORAGE_KEYS.CURRENTLY_TRACKING]: trackingInfo });

  if (timeSpent < 1) return;

  const today = new Date().toISOString().split("T")[0];
  const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(
    STORAGE_KEYS.DAILY_USAGE
  );

  if (!dailyUsage[today]) {
    dailyUsage[today] = {};
  }
  dailyUsage[today][domain] = (dailyUsage[today][domain] || 0) + timeSpent;

  await chrome.storage.local.set({ [STORAGE_KEYS.DAILY_USAGE]: dailyUsage });

  console.log("[v0] Recorded usage:", domain, timeSpent, "seconds");

  await notifyStateUpdate();

  // aplica/atualiza bloqueio por limite de tempo, se necessário
  await checkTimeLimit(domain, dailyUsage[today][domain]);
}

// ---- Verifica limite e aplica regra de sessão se excedido ----
async function checkTimeLimit(domain: string, totalSecondsToday: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  const limit = (timeLimits as TimeLimitEntry[]).find((e) => e.domain === domain);
  if (!limit) return;

  const limitMinutes = (limit.dailyMinutes ?? (limit as any).limitMinutes ?? 0);
  const limitSeconds = limitMinutes * 60;
  if (totalSecondsToday >= limitSeconds) {
    const ruleId = generateLimitRuleId(domain);

    try {
      const regex = `^https?:\\/\\/([^\\/]+\\.)?${escapeForRegex(domain)}(\\/|$)`;
      const rule = {
        id: ruleId,
        priority: 3,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: regex,
          isUrlFilterCaseSensitive: false,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      };
      
      console.log("[v0] [DEBUG] Time limit rule to add:", JSON.stringify(rule, null, 2));
      
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId], // remove se já existir
        addRules: [rule],
      });
      
      const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
      console.log("[v0] [DEBUG] All session rules after time limit:", JSON.stringify(sessionRules, null, 2));

      console.log(
        `[v0] Time limit reached for ${domain}. Session block rule ${ruleId} added.`
      );

      if (await notificationsAllowed()) {
        chrome.notifications.create(`limit-exceeded-${domain}`, {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Limite de Tempo Atingido",
          message: `Você atingiu o limite de ${limitMinutes} minutos em ${domain} hoje.`,
        });
      }
    } catch (e) {
      console.error(`[v0] Error updating session rule for time limit on ${domain}:`, e);
    }
  }
}

// ---- API pública chamada pela UI (message-handler) ----
export async function setTimeLimit(domain: string, limitMinutes: number) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) return;

  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );

  const list = Array.isArray(timeLimits) ? (timeLimits as TimeLimitEntry[]) : [];
  const existingIndex = list.findIndex((e) => e.domain === normalizedDomain);
  const ruleId = generateLimitRuleId(normalizedDomain);

  if (limitMinutes > 0) {
    // adiciona/atualiza
    if (existingIndex >= 0) {
      (list[existingIndex] as any).dailyMinutes = limitMinutes;
    } else {
      const brandDomain = (d: string) => d as any as import("../../shared/types").Domain;
      list.push({ domain: brandDomain(normalizedDomain), dailyMinutes: limitMinutes } as any);
    }

    // se já excedeu hoje, aplica regra agora; se não, garante que não fique regra presa
    const today = new Date().toISOString().split("T")[0];
    const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(
      STORAGE_KEYS.DAILY_USAGE
    );
    const used = dailyUsage?.[today]?.[normalizedDomain] || 0;

    if (used >= limitMinutes * 60) {
      await checkTimeLimit(normalizedDomain, used);
    } else {
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
      } catch {
        // ok se já não existir
      }
    }
  } else {
    // remover limite (<= 0)
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
      } catch {
        // ok se não existir
      }
      console.log(`[v0] Time limit removed for: ${normalizedDomain}`);
    }
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: list });
  await notifyStateUpdate();

  console.log("[v0] Time limit set/updated:", normalizedDomain, limitMinutes, "minutes");
}
