import { STORAGE_KEYS, ALARM_NAMES } from "../../shared/constants"
import { chrome } from "chrome-extension-global"

// Firebase sync module (optional, requires user consent)
export async function initializeFirebaseSync() {
  console.log("[v0] Initializing Firebase sync module")

  // Check if user has given consent
  const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)

  if (!settings?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync")
    return
  }

  // Set up daily sync alarm
  await chrome.alarms.create(ALARM_NAMES.DAILY_SYNC, {
    periodInMinutes: 1440, // Once per day
  })

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.DAILY_SYNC) {
      await syncDailyData()
    }
  })
}

async function syncDailyData() {
  // This would integrate with Firebase
  // For MVP, we'll just log the intent
  console.log("[v0] Daily sync triggered (Firebase integration pending)")

  const { [STORAGE_KEYS.DAILY_USAGE]: dailyUsage = {} } = await chrome.storage.local.get(STORAGE_KEYS.DAILY_USAGE)

  const today = new Date().toISOString().split("T")[0]
  const todayData = dailyUsage[today]

  if (!todayData) return

  // Calculate summary
  const totalTime = Object.values(todayData).reduce((sum: number, time: any) => sum + time, 0)
  const topSites = Object.entries(todayData)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([domain, time]) => ({ domain, time }))

  console.log("[v0] Daily summary:", { totalTime, topSites })

  // TODO: Send to Firebase Firestore
  // await sendToFirebase({ totalTime, topSites });
}
