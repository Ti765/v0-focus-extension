import { STORAGE_KEYS } from "../../shared/constants";
import type { BlacklistEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";

export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module");
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
  await syncBlockingRules(blacklist);
}

export async function addToBlacklist(domain: string) {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);

  if (blacklist.some((entry: BlacklistEntry) => entry.domain === domain)) {
    console.log("[v0] Domain already in blacklist:", domain);
    return;
  }

  const newEntry: BlacklistEntry = { domain, addedAt: Date.now() };
  const updatedBlacklist = [...blacklist, newEntry];
  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedBlacklist });

  await syncBlockingRules(updatedBlacklist);
  await notifyStateUpdate(); // Notifica a UI sobre a mudança
  console.log("[v0] Added to blacklist:", domain);
}

export async function removeFromBlacklist(domain: string) {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
  const updatedBlacklist = blacklist.filter((entry: BlacklistEntry) => entry.domain !== domain);

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedBlacklist });
  await syncBlockingRules(updatedBlacklist);
  await notifyStateUpdate(); // Notifica a UI sobre a mudança
  console.log("[v0] Removed from blacklist:", domain);
}

async function syncBlockingRules(blacklist: BlacklistEntry[]) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  const newRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
    condition: {
      urlFilter: `||${entry.domain}`,
      resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: newRules,
  });

  console.log("[v0] Blocking rules synced:", newRules.length);
}

export async function enablePomodoroBlocking() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
  if (blacklist.length > 0) {
    console.log('[v0] Enabling Pomodoro blocking for', blacklist.length, 'sites.');
    await syncBlockingRules(blacklist);
  }
}

export async function disablePomodoroBlocking() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);
  if (existingRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: [],
    });
    console.log('[v0] Pomodoro blocking disabled.');
  }
}

