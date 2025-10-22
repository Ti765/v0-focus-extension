import { STORAGE_KEYS, CONTENT_ANALYSIS_THRESHOLD } from "../../shared/constants";
import type { BlacklistEntry, ContentAnalysisResult } from "../../shared/types";
import { extractDomain } from "../../shared/url";

export async function initializeContentAnalyzer() {
  console.log("[v0] Initializing content analyzer module");
}

export async function handleContentAnalysisResult(result: ContentAnalysisResult) {
  console.log("[v0] Content analysis result:", result);

  const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(
    STORAGE_KEYS.SETTINGS
  );

  // Gate único para notificações (evita dependência circular com message-handler)
  if (!settings?.notificationsEnabled) return;

  if (result.classification === "distracting" && result.score > CONTENT_ANALYSIS_THRESHOLD) {
    const domain = extractDomain(result.url);
    if (!domain) return;

    const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(
      STORAGE_KEYS.BLACKLIST
    );

    const alreadyBlocked = (blacklist as BlacklistEntry[]).some(
      (entry) => entry.domain === domain
    );
    if (alreadyBlocked) return;

    chrome.notifications.create(`suggest-block-${domain}`, {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Site Potencialmente Distrativo",
      message: `${domain} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
      buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }],
    });
  }
}
