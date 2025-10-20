import { STORAGE_KEYS } from "../../shared/constants"
import type { BlacklistEntry } from "../../shared/types"
import { chrome } from "chrome-extension-api"

// MV3 compliant blocking using declarativeNetRequest
export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module")

  // Load existing blacklist and create rules
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)

  await syncBlockingRules(blacklist)
}

export async function addToBlacklist(domain: string) {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)

  // Check if already exists
  if (blacklist.some((entry: BlacklistEntry) => entry.domain === domain)) {
    console.log("[v0] Domain already in blacklist:", domain)
    return
  }

  const newEntry: BlacklistEntry = {
    domain,
    addedAt: Date.now(),
  }

  const updatedBlacklist = [...blacklist, newEntry]
  await chrome.storage.local.set({
    [STORAGE_KEYS.BLACKLIST]: updatedBlacklist,
  })

  await syncBlockingRules(updatedBlacklist)
  console.log("[v0] Added to blacklist:", domain)
}

export async function removeFromBlacklist(domain: string) {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)

  const updatedBlacklist = blacklist.filter((entry: BlacklistEntry) => entry.domain !== domain)

  await chrome.storage.local.set({
    [STORAGE_KEYS.BLACKLIST]: updatedBlacklist,
  })

  await syncBlockingRules(updatedBlacklist)
  console.log("[v0] Removed from blacklist:", domain)
}

async function syncBlockingRules(blacklist: BlacklistEntry[]) {
  // Get existing dynamic rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingRuleIds = existingRules.map((rule) => rule.id)

  // Create new rules for blacklist
  const newRules: chrome.declarativeNetRequest.Rule[] = blacklist.map((entry, index) => ({
    id: index + 1, // Simple ID generation (1-based)
    priority: 1,
    action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
    condition: {
      urlFilter: `||${entry.domain}`, // AdBlock Plus syntax for domain matching
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  }))

  // Update rules: remove all existing, add new ones
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: newRules,
  })

  console.log("[v0] Blocking rules synced:", newRules.length)
}

// Enable blocking during Pomodoro focus sessions
export async function enablePomodoroBlocking() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)
  await syncBlockingRules(blacklist)
  console.log("[v0] Pomodoro blocking enabled")
}

// Disable blocking after Pomodoro session
export async function disablePomodoroBlocking() {
  // Remove all dynamic rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingRuleIds = existingRules.map((rule) => rule.id)

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: [],
  })

  console.log("[v0] Pomodoro blocking disabled")
}
