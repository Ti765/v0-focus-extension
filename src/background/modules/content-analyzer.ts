import { STORAGE_KEYS, CONTENT_ANALYSIS_THRESHOLD } from "../../shared/constants"
import type { ContentAnalysisResult } from "../../shared/types"
import { extractDomain } from "../../shared/url"
import { notificationsAllowed } from "./message-handler"
// A linha 'import { chrome } from "chrome"' foi removida daqui.

export async function initializeContentAnalyzer() {
  console.log("[v0] Initializing content analyzer module")
}

export async function handleContentAnalysisResult(result: ContentAnalysisResult) {
  console.log("[v0] Content analysis result:", result)

  const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)

  if (!settings?.notificationsEnabled) return

  // If page is classified as distracting, suggest adding to blacklist
  if (result.classification === "distracting" && result.score > CONTENT_ANALYSIS_THRESHOLD) {
    const domain = extractDomain(result.url)

    // Check if already in blacklist
    const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)

    const alreadyBlocked = blacklist.some((entry: any) => entry.domain === domain)
    if (alreadyBlocked) return

    // Show notification suggesting to block
    if (await notificationsAllowed()) {
      chrome.notifications.create(`suggest-block-${domain}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Site Potencialmente Distrativo",
        message: `${domain} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
        buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }],
      })
    }
  }
}

// extractDomain moved to shared/url
