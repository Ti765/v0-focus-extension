import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";

let activeTabUrl: string | null = null;
let activeTabStartTime: number | null = null;

export async function initializeUsageTracker() {
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

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await recordActiveTabUsage();
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        startTrackingTab(tab.url);
    } catch (e) {
        console.warn(`Could not get tab info for tabId: ${activeInfo.tabId}`);
        activeTabUrl = null;
        activeTabStartTime = null;
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.url) {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id === tabId) {
                await recordActiveTabUsage();
                startTrackingTab(changeInfo.url);
            }
        } catch(e) {
            console.warn(`Could not query for active tab: ${e}`);
        }
    }
  });
  
  // Inicia o rastreamento para a aba ativa no momento da inicialização
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.url) {
        startTrackingTab(activeTab.url);
    }
  } catch(e) {
    console.warn(`Could not query for active tab on startup: ${e}`);
  }
}

function startTrackingTab(url: string | undefined) {
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    activeTabUrl = null;
    activeTabStartTime = null;
    return;
  }
  activeTabUrl = url;
  activeTabStartTime = Date.now();
}

async function recordActiveTabUsage() {
  if (!activeTabUrl || !activeTabStartTime) return;

  const domain = extractDomain(activeTabUrl);
  const timeSpent = Math.floor((Date.now() - activeTabStartTime) / 1000);

  if (timeSpent < 1) return;

  const today = new Date().toISOString().split("T")[0];
  const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(STORAGE_KEYS.DAILY_USAGE);

  if (!dailyUsage[today]) {
    dailyUsage[today] = {};
  }
  dailyUsage[today][domain] = (dailyUsage[today][domain] || 0) + timeSpent;

  await chrome.storage.local.set({ [STORAGE_KEYS.DAILY_USAGE]: dailyUsage });
  
  console.log("[v0] Recorded usage:", domain, timeSpent, "seconds");
  
  await notifyStateUpdate(); // Notifica a UI que os dados de uso foram atualizados

  await checkTimeLimit(domain, dailyUsage[today][domain]);

  activeTabStartTime = Date.now();
}

async function checkTimeLimit(domain: string, totalSeconds: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);
  const limit = timeLimits.find((entry: TimeLimitEntry) => entry.domain === domain);

  if (!limit) return;

  const limitSeconds = limit.limitMinutes * 60;
  if (totalSeconds >= limitSeconds) {
    const ruleId = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000); 
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [{
        id: ruleId,
        priority: 2,
        action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
        },
      }],
      removeRuleIds: [ruleId]
    });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Limite de Tempo Atingido",
      message: `Você atingiu o limite de ${limit.limitMinutes} minutos em ${domain} hoje.`,
    });
    console.log(`[v0] Limite de tempo atingido para: ${domain}. Regra de sessão adicionada.`);
  }
}

export async function setTimeLimit(domain: string, limitMinutes: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);

  const existingIndex = timeLimits.findIndex((entry: TimeLimitEntry) => entry.domain === domain);
  if (existingIndex >= 0) {
    timeLimits[existingIndex].limitMinutes = limitMinutes;
  } else {
    timeLimits.push({ domain, limitMinutes });
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: timeLimits });
  await notifyStateUpdate();
  console.log("[v0] Time limit set:", domain, limitMinutes, "minutes");
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

