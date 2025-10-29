import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants";
import type { TimeLimitEntry } from "../../shared/types";
import { notifyStateUpdate, notificationsAllowed } from "./message-handler";
import { normalizeDomain, extractDomain } from "../../shared/url";
import { createDomainUrlFilter } from "../../shared/regex-utils";
import { isDNRDebugEnabled, updateDebugConfigCache } from "../../shared/debug-config";

// Import debug configuration
import { isTrackingDebugEnabledSync } from "../../shared/debug-config";

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
  // Initialize debug configuration cache
  await updateDebugConfigCache();

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
  const now = Date.now();
  const trackingInfo = {
    url,
    startTime: now,
    lastUpdate: now, // Track last update for gap detection
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

  if (!trackingInfo || !trackingInfo.url || !trackingInfo.startTime) {
    if (isTrackingDebugEnabledSync()) {
      console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo });
    }
    return;
  }

  const domain = extractDomain(trackingInfo.url);
  if (!domain) {
    if (isTrackingDebugEnabledSync()) {
      console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: trackingInfo.url });
    }
    await stopTracking();
    return;
  }

  const now = Date.now();
  const timeSpent = Math.floor((now - trackingInfo.startTime) / 1000);
  
  // Check for gaps in tracking (service worker restarts)
  const lastUpdate = trackingInfo.lastUpdate || trackingInfo.startTime;
  const gapMs = now - lastUpdate;
  const maxGapMs = USAGE_TRACKER_INTERVAL * 60 * 1000 * 2; // 2x the interval
  
  if (gapMs > maxGapMs) {
    if (isTrackingDebugEnabledSync()) {
      console.log("[TRACKING-DEBUG] Detected tracking gap:", {
        gapMs: Math.floor(gapMs / 1000),
        maxGapMs: Math.floor(maxGapMs / 1000),
        domain,
        url: trackingInfo.url
      });
    }
    // Reset start time to avoid recording excessive time
    trackingInfo.startTime = now - (USAGE_TRACKER_INTERVAL * 60 * 1000);
  }

  if (isTrackingDebugEnabledSync()) {
    console.log("[TRACKING-DEBUG] Recording usage:", {
      domain,
      timeSpent,
      url: trackingInfo.url,
      startTime: new Date(trackingInfo.startTime).toISOString(),
      endTime: new Date().toISOString(),
      gapDetected: gapMs > maxGapMs
    });
  }

  // Update tracking info
  trackingInfo.startTime = now;
  trackingInfo.lastUpdate = now;
  await chrome.storage.session.set({ [STORAGE_KEYS.CURRENTLY_TRACKING]: trackingInfo });

  if (timeSpent < 1) {
    if (isTrackingDebugEnabledSync()) {
      console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    }
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const { [STORAGE_KEYS.DAILY_USAGE]: existingUsage = {} } = await chrome.storage.local.get(
    STORAGE_KEYS.DAILY_USAGE
  );
  
  // Garante que temos uma estrutura para o dia atual com perDomain
  const dailyUsage = {
    ...existingUsage,
    [today]: existingUsage[today] || {
      date: today,
      totalMinutes: 0,
      perDomain: {}
    }
  };

  if (!dailyUsage[today].perDomain) {
    dailyUsage[today].perDomain = {};
  }
  
  // Update perDomain tracking
  dailyUsage[today].perDomain[domain] = (dailyUsage[today].perDomain[domain] || 0) + timeSpent;
  
  // Update total minutes for the day
  dailyUsage[today].totalMinutes = Object.values(dailyUsage[today].perDomain).reduce((sum: number, time: any) => sum + time, 0) / 60;

  await chrome.storage.local.set({ [STORAGE_KEYS.DAILY_USAGE]: dailyUsage });

  console.log("[v0] Recorded usage:", domain, timeSpent, "seconds");

  await notifyStateUpdate();

  // aplica/atualiza bloqueio por limite de tempo, se necessário
  await checkTimeLimit(domain, dailyUsage[today].perDomain[domain]);
}

// ---- Verifica limite e aplica regra de sessão se excedido ----
async function checkTimeLimit(domain: string, totalSecondsToday: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: existingLimits = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.TIME_LIMITS
  );
  const timeLimits = Array.isArray(existingLimits) ? existingLimits : [];
  const limit = (timeLimits as TimeLimitEntry[]).find((e) => e.domain === domain);
  if (!limit) return;

  const limitMinutes = (limit.dailyMinutes ?? (limit as any).limitMinutes ?? 0);
  const limitSeconds = limitMinutes * 60;
  if (totalSecondsToday >= limitSeconds) {
    const ruleId = generateLimitRuleId(domain);

    try {
        if (isTrackingDebugEnabledSync()) {
          console.log("[TRACKING-DEBUG] Time limit check:", {
            domain,
            totalSecondsToday,
            limitSeconds,
            limitMinutes,
            exceeded: totalSecondsToday >= limitSeconds
          });
        }

        const urlFilter = createDomainUrlFilter(domain);
        const blockedPageUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(domain)}`);
        
        // Debug logging for rule creation
        console.log("[v0] Time limit rule debug:", {
          domain,
          urlFilter,
          blockedPageUrl,
          ruleId,
          totalSecondsToday,
          limitSeconds,
          redirectUrl: blockedPageUrl
        });
        
        // Verify the blocked page URL is valid
        try {
          const testUrl = new URL(blockedPageUrl);
          console.log("[v0] Blocked page URL validation:", {
            isValid: true,
            protocol: testUrl.protocol,
            hostname: testUrl.hostname,
            pathname: testUrl.pathname,
            search: testUrl.search
          });
        } catch (error) {
          console.error("[v0] Invalid blocked page URL:", blockedPageUrl, error);
        }
        
        const rule = {
          id: ruleId,
          priority: 10, // Increased from 3 to 10 to ensure it overrides other rules
          action: { 
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: blockedPageUrl
            }
          },
          condition: {
            urlFilter: urlFilter,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
          },
        };
        
        const debugEnabled = await isDNRDebugEnabled();
        if (debugEnabled) {
          console.log("[DNR-DEBUG] Time limit session rule to add:", {
            id: rule.id,
            urlFilter: rule.condition.urlFilter,
            domain,
            totalSecondsToday,
            limitSeconds
          });
        }
        
        await chrome.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [ruleId], // remove se já existir
          addRules: [rule],
        });
        
        // Always log session rules after creation for debugging
        const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
        console.log("[v0] Session rules after time limit rule creation:", {
          totalRules: sessionRules.length,
          timeLimitRule: sessionRules.find(r => r.id === ruleId),
          allRuleIds: sessionRules.map(r => r.id)
        });
        
        if (debugEnabled) {
          console.log("[DNR-DEBUG] All session rules after time limit:", sessionRules);
          console.log("[DNR-DEBUG] Session rules by domain:", sessionRules.map(r => ({
            id: r.id,
            urlFilter: r.condition.urlFilter || r.condition.regexFilter,
            priority: r.priority
          })));
        }

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
    const used = dailyUsage?.[today]?.perDomain?.[normalizedDomain] || 0;

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
