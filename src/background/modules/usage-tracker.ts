import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";

let activeTabUrl: string | null = null;
let activeTabStartTime: number | null = null;
let activeTabId: number | null = null;

export async function initializeUsageTracker() {
  console.log("[v0] Initializing usage tracker module");

  // Limpa alarmes antigos para garantir um estado limpo
  await chrome.alarms.clear(ALARM_NAMES.USAGE_TRACKER);
  // Cria o alarme que irá periodicamente gravar o tempo de uso
  await chrome.alarms.create(ALARM_NAMES.USAGE_TRACKER, {
    periodInMinutes: USAGE_TRACKER_INTERVAL,
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.USAGE_TRACKER) {
      await recordActiveTabUsage();
    }
  });

  // Ouve a troca de abas
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await recordActiveTabUsage(); // Grava o tempo da aba anterior
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        startTrackingTab(tab.id, tab.url);
    } catch (e) {
        console.warn(`Could not get tab info for tabId: ${activeInfo.tabId}`);
        stopTracking();
    }
  });

  // Ouve atualizações na URL da aba
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Apenas se a URL mudou na aba ativa
    if (tabId === activeTabId && changeInfo.url) {
        await recordActiveTabUsage(); // Grava o tempo da URL anterior
        startTrackingTab(tab.id, tab.url);
    }
  });
  
  // Ouve quando uma janela ganha foco
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // O navegador perdeu o foco
      await recordActiveTabUsage();
      stopTracking();
    } else {
      // O navegador ganhou foco, encontra a aba ativa
      const [activeTab] = await chrome.tabs.query({ active: true, windowId: windowId });
      if (activeTab) {
        startTrackingTab(activeTab.id, activeTab.url);
      }
    }
  });

  // Inicia o rastreamento para a aba ativa no momento da inicialização
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id && activeTab.url) {
        startTrackingTab(activeTab.id, activeTab.url);
    }
  } catch(e) {
    console.warn(`Could not query for active tab on startup: ${e}`);
  }
}

function startTrackingTab(tabId: number | undefined, url: string | undefined) {
  if (!tabId || !url || url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:")) {
    stopTracking();
    return;
  }
  activeTabId = tabId;
  activeTabUrl = url;
  activeTabStartTime = Date.now();
}

function stopTracking() {
    activeTabId = null;
    activeTabUrl = null;
    activeTabStartTime = null;
}

async function recordActiveTabUsage() {
  if (!activeTabUrl || !activeTabStartTime) return;

  const domain = extractDomain(activeTabUrl);
  const timeSpent = Math.floor((Date.now() - activeTabStartTime) / 1000);

  if (timeSpent < 1) { // Não grava se for menos de 1 segundo
    activeTabStartTime = Date.now(); // Reinicia o contador
    return;
  }

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

  // Reseta o tempo de início para a próxima gravação
  activeTabStartTime = Date.now();
}

async function checkTimeLimit(domain: string, totalSeconds: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS);
  const limit = timeLimits.find((entry: TimeLimitEntry) => entry.domain === domain);

  if (!limit) return;

  const limitSeconds = limit.limitMinutes * 60;
  if (totalSeconds >= limitSeconds) {
    // Usar um ID de regra consistente para que possamos removê-lo se o limite for alterado
    const ruleId = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 3000); 
    
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
      // Se a regra já existir, ela será substituída. Se não, será adicionada.
      // Se quisermos garantir a remoção antes, podemos adicionar `removeRuleIds: [ruleId]`
    });

    chrome.notifications.create(`limit-exceeded-${domain}`, {
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
  if (limitMinutes > 0) {
    if (existingIndex >= 0) {
        timeLimits[existingIndex].limitMinutes = limitMinutes;
      } else {
        timeLimits.push({ domain, limitMinutes });
      }
  } else { // Remove o limite se for 0 ou menos
      if (existingIndex >= 0) {
        timeLimits.splice(existingIndex, 1);
        // Também remove a regra de bloqueio de sessão se existir
        const ruleId = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 3000);
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
      }
  }


  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_LIMITS]: timeLimits });
  await notifyStateUpdate();
  console.log("[v0] Time limit set/updated:", domain, limitMinutes, "minutes");
}

function extractDomain(url: string): string {
  try {
    let hostname = new URL(url).hostname;
    // Remove "www." para agrupar o uso corretamente
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
