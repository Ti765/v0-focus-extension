import { STORAGE_KEYS } from "../../shared/constants";
import type { BlacklistEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";

const POMODORO_RULE_ID_START = 1000;
const USER_BLACKLIST_RULE_ID_START = 2000;

export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module");
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  await syncBlockingRules(blacklist);
}

export async function addToBlacklist(domain: string) {
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];

  // Normaliza o domínio para evitar duplicatas como "youtube.com" e "www.youtube.com"
  const normalizedDomain = domain.replace(/^www\./, '');

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
  const normalizedDomain = domain.replace(/^www\./, '');
  const updatedBlacklist = blacklist.filter((entry) => entry.domain !== normalizedDomain);

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedBlacklist });
  await syncBlockingRules(updatedBlacklist);
  await notifyStateUpdate();
  console.log("[v0] Removed from blacklist:", normalizedDomain);
}

async function syncBlockingRules(blacklist: BlacklistEntry[]) {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map((rule) => rule.id);
  
    const newRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry, index) => ({
      id: USER_BLACKLIST_RULE_ID_START + index, // Usa um range de IDs para evitar conflitos
      priority: 1,
      action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
      condition: {
        urlFilter: `||${entry.domain}`,
        resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
      },
    }));
  
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds.filter(id => id >= USER_BLACKLIST_RULE_ID_START && id < POMODORO_RULE_ID_START), // Remove apenas as regras de blacklist
      addRules: newRules,
    });
  
    console.log("[v0] User blocking rules synced:", newRules.length);
}

export async function enablePomodoroBlocking() {
  const storageData = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  if (blacklist.length === 0) {
      console.log('[v0] No sites in blacklist to block for Pomodoro.');
      return;
  }
  
  const pomodoroRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry: BlacklistEntry, index: number) => ({
      id: POMODORO_RULE_ID_START + index,
      priority: 2, // Prioridade maior para sobrepor outras regras se necessário
      action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
      condition: {
        urlFilter: `||${entry.domain}`,
        resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
      },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: pomodoroRules,
  });
  console.log('[v0] Enabling Pomodoro blocking for', blacklist.length, 'sites.');
}

export async function disablePomodoroBlocking() {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const pomodoroRuleIds = existingRules
        .map(rule => rule.id)
        .filter(id => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);
    
    if (pomodoroRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: pomodoroRuleIds,
        });
        console.log('[v0] Pomodoro blocking disabled. Removed', pomodoroRuleIds.length, 'rules.');
    }
}

