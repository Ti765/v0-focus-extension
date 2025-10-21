import { STORAGE_KEYS } from "../../shared/constants";
import type { BlacklistEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";
import { normalizeDomain } from "../../shared/url";

const POMODORO_RULE_ID_START = 1000;
const USER_BLACKLIST_RULE_ID_START = 2000;
// Range used for user blacklist stable IDs (2000..2999)
const USER_BLACKLIST_RANGE = 1000;

// Lightweight deterministic hash to map domain -> id in the USER_BLACKLIST range
const stableIdForDomain = (domain: string) => {
  const h = [...domain].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  return USER_BLACKLIST_RULE_ID_START + (h % USER_BLACKLIST_RANGE);
};

// Simple serialization queue to avoid concurrent DNR updates
let dnrQueue: Promise<any> = Promise.resolve();
function withDnrLock<T>(fn: () => Promise<T>): Promise<T> {
  dnrQueue = dnrQueue.then(fn, fn);
  return dnrQueue as Promise<T>;
}

export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module");
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  await syncBlockingRules(blacklist);
}

export async function addToBlacklist(domain: string) {
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];

  const normalizedDomain = normalizeDomain(domain);

  if (blacklist.some((entry) => entry.domain === normalizedDomain)) {
    console.log("[v0] Domain already in blacklist:", normalizedDomain);
    return;
  }

  const newEntry: BlacklistEntry = { domain: normalizedDomain, addedAt: Date.now() };
  const updatedBlacklist = [...blacklist, newEntry];
  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedBlacklist });

  await syncBlockingRules(updatedBlacklist);
  await notifyStateUpdate(); 
  console.log("[v0] Added to blacklist:", normalizedDomain);
}

export async function removeFromBlacklist(domain: string) {
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  const normalizedDomain = normalizeDomain(domain);
  const updatedBlacklist = blacklist.filter((entry) => entry.domain !== normalizedDomain);

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedBlacklist });
  await syncBlockingRules(updatedBlacklist);
  await notifyStateUpdate();
  console.log("[v0] Removed from blacklist:", normalizedDomain);
}

async function syncBlockingRules(blacklist: BlacklistEntry[]) {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    
    const rulesToRemove = existingRules
      .map((rule) => rule.id)
      .filter(id => id >= USER_BLACKLIST_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE);

    const newRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry) => {
      const d = normalizeDomain(entry.domain);
      return {
        id: stableIdForDomain(d),
        priority: 1,
        // CORREÇÃO: Asserir explicitamente os tipos esperados pelo @types/chrome
        action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
        condition: {
          urlFilter: `||${d}`,
          resourceTypes: ['main_frame' as chrome.declarativeNetRequest.ResourceType],
        },
      } as chrome.declarativeNetRequest.Rule;
    });

    await withDnrLock(() => chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesToRemove,
      addRules: newRules,
    }));
  
    console.log("[v0] User blocking rules synced:", newRules.length, "rules added,", rulesToRemove.length, "rules removed.");
}

export async function enablePomodoroBlocking() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } =
    await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);

  if (blacklist.length === 0) {
    console.log('[v0] No sites in blacklist to block for Pomodoro.');
    return;
  }

  // CORREÇÃO: Remove regras de pomodoro antigas antes de adicionar as novas para evitar conflitos.
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const oldPomodoroIds = existing
    .map(r => r.id)
    .filter(id => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);

  const pomodoroRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry: BlacklistEntry, index: number) => ({
      id: POMODORO_RULE_ID_START + index,
      priority: 2,
      action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
      condition: {
        urlFilter: `||${normalizeDomain(entry.domain)}`,
        resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
      },
  }));

  await withDnrLock(() => chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldPomodoroIds,
      addRules: pomodoroRules,
  }));
  console.log('[v0] Enabling Pomodoro blocking for', blacklist.length, 'sites.');
}

export async function disablePomodoroBlocking() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const pomodoroRuleIds = existingRules
    .map(rule => rule.id)
    .filter(id => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);
    
  if (pomodoroRuleIds.length > 0) {
    await withDnrLock(() => chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: pomodoroRuleIds,
    }));
    console.log('[v0] Pomodoro blocking disabled. Removed', pomodoroRuleIds.length, 'rules.');
  }
}
