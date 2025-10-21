import { STORAGE_KEYS, ALARM_NAMES, USAGE_TRACKER_INTERVAL } from "../../shared/constants"
import type { TimeLimitEntry } from "../../shared/types"
import chrome from "chrome" // Declare the chrome variable

let activeTabUrl: string | null = null
let activeTabStartTime: number | null = null

export async function initializeUsageTracker() {
  console.log("[v0] Initializing usage tracker module")

  // Set up periodic tracking alarm (every 30 seconds)
  await chrome.alarms.create(ALARM_NAMES.USAGE_TRACKER, {
    periodInMinutes: USAGE_TRACKER_INTERVAL,
  })

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.USAGE_TRACKER) {
      await recordActiveTabUsage()
    }
  })

  // Track tab changes
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await recordActiveTabUsage() // Record time for previous tab
    const tab = await chrome.tabs.get(activeInfo.tabId)
    startTrackingTab(tab.url)
  })

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id === tabId) {
        await recordActiveTabUsage() // Record time for previous URL
        startTrackingTab(changeInfo.url)
      }
    }
  })

  // Start tracking current active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (activeTab?.url) {
    startTrackingTab(activeTab.url)
  }
}

function startTrackingTab(url: string | undefined) {
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    activeTabUrl = null
    activeTabStartTime = null
    return
  }

  activeTabUrl = url
  activeTabStartTime = Date.now()
  console.log("[v0] Started tracking:", extractDomain(url))
}

async function recordActiveTabUsage() {
  if (!activeTabUrl || !activeTabStartTime) return

  const domain = extractDomain(activeTabUrl)
  const timeSpent = Math.floor((Date.now() - activeTabStartTime) / 1000) // seconds

  if (timeSpent < 1) return // Ignore very short visits

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(STORAGE_KEYS.DAILY_USAGE)

  if (!dailyUsage[today]) {
    dailyUsage[today] = {}
  }

  dailyUsage[today][domain] = (dailyUsage[today][domain] || 0) + timeSpent

  await chrome.storage.local.set({
    [STORAGE_KEYS.DAILY_USAGE]: dailyUsage,
  })

  console.log("[v0] Recorded usage:", domain, timeSpent, "seconds")

  // Check time limits
  await checkTimeLimit(domain, dailyUsage[today][domain])

  // Reset start time for continuous tracking
  activeTabStartTime = Date.now()
}

async function checkTimeLimit(domain: string, totalSeconds: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS)

  const limit = timeLimits.find((entry: TimeLimitEntry) => entry.domain === domain)
  if (!limit) return

  const limitSeconds = limit.limitMinutes * 60

  if (totalSeconds >= limitSeconds) {
    const ruleId = Math.floor(Math.random() * Date.now())

    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [
        {
          id: ruleId,
          priority: 2, // High priority to override other rules
          action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
          },
        },
      ],
    })

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Limite de Tempo Atingido",
      message: `Você atingiu o limite de ${limit.limitMinutes} minutos em ${domain} hoje.`,
    })

    console.log(`[v0] Limite de tempo atingido para: ${domain}. Regra de sessão adicionada.`)
  }
}

export async function setTimeLimit(domain: string, limitMinutes: number) {
  const { [STORAGE_KEYS.TIME_LIMITS]: timeLimits = [] } = await chrome.storage.local.get(STORAGE_KEYS.TIME_LIMITS)

  const existingIndex = timeLimits.findIndex((entry: TimeLimitEntry) => entry.domain === domain)

  if (existingIndex >= 0) {
    timeLimits[existingIndex].limitMinutes = limitMinutes
  } else {
    timeLimits.push({ domain, limitMinutes })
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.TIME_LIMITS]: timeLimits,
  })

  console.log("[v0] Time limit set:", domain, limitMinutes, "minutes")
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}
