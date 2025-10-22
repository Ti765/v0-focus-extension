import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate, notificationsAllowed } from "./message-handler";
import { normalizeDomain, extractDomain } from "../../shared/url";

let activeTabId: number | null = null;
let usageInitialized = false;
let dailySyncInitialized = false;

const LIMIT_RULE_BASE = 3000;

export async function initializeDailySync() {
  if (dailySyncInitialized) return;
  dailySyncInitialized = true;

  await chrome.alarms.clear(ALARM_NAMES.DAILY_SYNC);
  const minutesInDay = 60 * 24;
  await chrome.alarms.create(ALARM_NAMES.DAILY_SYNC, { periodInMinutes: minutesInDay });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAMES.DAILY_SYNC) return;
    await clearAllTimeLimitSessionRules();
    // (opcional) compactar dailyUsage aqui
  });
}

async function clearAllTimeLimitSessionRules() {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  if (!timeLimits || timeLimits.length === 0) return;

  const ids = timeLimits.map((e: TimeLimitEntry) =>
    e.domain.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), LIMIT_RULE_BASE)
  );

  if (ids.length) {
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: ids });
  }
}

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
    console.warn(`[v0] Could not get tab info for tabId: ${activeInfo.tabId}`);
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

async function recordActiveTabUsage() {
  const result = await chrome.storage.session.get(STORAGE_KEYS.CURRENTLY_TRACKING);
  const trackingInfo = result[STORAGE_KEYS.CURRENTLY_TRACKING];

  if (!trackingInfo || !trackingInfo.url || !trackingInfo.startTime) return;

  const domain = extractDomain(trackingInfo.url);
  const timeSpent = Math.floor((Date.now() - trackingInfo.startTime) / 1000);

  // Reinicia p/ próximo ciclo
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

  await checkTimeLimit(domain, dailyUsage[today][domain]);
}

async function checkTimeLimit(domain: string, totalSeconds: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  const limit = timeLimits.find((entry: TimeLimitEntry) => entry.domain === domain);

  if (!limit) return;

  const limitSeconds = limit.limitMinutes * 60;
  if (totalSeconds >= limitSeconds) {
    const ruleId = domain
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), LIMIT_RULE_BASE);

    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ruleId],
      addRules: [
        {
          id: ruleId,
          priority: 3,
          action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
          },
        },
      ],
    });

    if (await notificationsAllowed()) {
      chrome.notifications.create(`limit-exceeded-${domain}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${limit.limitMinutes} minutos em ${domain} hoje.`,
      });
    }
    console.log(`[v0] Limite de tempo atingido para: ${domain}. Regra de sessão adicionada.`);
  }
}

export async function setTimeLimit(domain: string, limitMinutes: number) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) return;

  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );

  const existingIndex = timeLimits.findIndex(
    (entry: TimeLimitEntry) => entry.domain === normalizedDomain
  );

  if (limitMinutes > 0) {
    if (existingIndex >= 0) {
      timeLimits[existingIndex].limitMinutes = limitMinutes;
    } else {
      timeLimits.push({ domain: normalizedDomain, limitMinutes });
    }
  } else {
    if (existingIndex >= 0) {
      timeLimits.splice(existingIndex, 1);
      const ruleId = normalizedDomain
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), LIMIT_RULE_BASE);
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
    }
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: timeLimits });
  await notifyStateUpdate();
  console.log("[v0] Time limit set/updated:", normalizedDomain, limitMinutes, "minutes");
}
