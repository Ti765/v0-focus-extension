import { STORAGE_KEYS, CONTENT_ANALYSIS_THRESHOLD } from "../../shared/constants";
import type { ContentAnalysisResult, BlacklistEntry } from "../../shared/types";
import { extractDomain } from "../../shared/url";
import { notificationsAllowed } from "./message-handler";

/**
 * Guardamos no storage de sessão os domínios já notificados recentemente
 * para evitar múltiplas notificações repetidas.
 */
const NOTIFY_CACHE_KEY = "__contentSuggestNotified__";

// Default suppression window (24 hours) - can be overridden by settings
const DEFAULT_NOTIFY_SUPPRESS_MS = 24 * 60 * 60 * 1000;

/**
 * Get the suppression window in milliseconds from settings or use default
 */
async function getSuppressMs(): Promise<number> {
  try {
    const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const minutes = settings?.contentAnalysisSuppressionMinutes || (24 * 60);
    return minutes * 60 * 1000;
  } catch {
    return DEFAULT_NOTIFY_SUPPRESS_MS;
  }
}

export async function initializeContentAnalyzer() {
  console.log("[v0] Initializing content analyzer module");
  // Opcional: limpar entradas expiradas do cache ao iniciar
  try {
    const { [NOTIFY_CACHE_KEY]: cache = {} } = await chrome.storage.session.get(NOTIFY_CACHE_KEY);
    const now = Date.now();
    const NOTIFY_SUPPRESS_MS = await getSuppressMs();
    let changed = false;
    for (const d of Object.keys(cache || {})) {
      if (typeof cache[d] !== "number" || now - cache[d] > NOTIFY_SUPPRESS_MS) {
        delete cache[d];
        changed = true;
      }
    }
    if (changed) {
      await chrome.storage.session.set({ [NOTIFY_CACHE_KEY]: cache });
    }
  } catch (e) {
    // se falhar, não é crítico
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}

/**
 * Decide se devemos notificar sobre um domínio agora.
 * Usa storage.session para lembrar o último envio.
 */
async function shouldNotifyDomain(domain: string): Promise<boolean> {
  try {
    // Use shared suppression logic via getSuppressMs()
    const NOTIFY_SUPPRESS_MS = await getSuppressMs();
    
    const { [NOTIFY_CACHE_KEY]: cache = {} } = await chrome.storage.session.get(NOTIFY_CACHE_KEY);
    const last = cache?.[domain] as number | undefined;
    const now = Date.now();
    if (last && now - last < NOTIFY_SUPPRESS_MS) {
      return false;
    }
    // marca como notificado agora
    await chrome.storage.session.set({
      [NOTIFY_CACHE_KEY]: { ...(cache || {}), [domain]: now },
    });
    return true;
  } catch {
    // Em caso de erro no storage, ainda tentamos notificar uma vez
    return true;
  }
}

/**
 * Processa o resultado da análise de conteúdo enviada pelo content script.
 * Se o site parecer distrativo, e não estiver na blacklist, sugere bloqueio via notificação.
 */
export async function handleContentAnalysisResult(result: ContentAnalysisResult) {
  try {
    console.log("[v0] Content analysis result:", result);

    // Respeita a configuração global do usuário
    if (!(await notificationsAllowed())) {
      return;
    }

    // Checa classificação + threshold
    if (!(result.classification === "distracting" && result.score > CONTENT_ANALYSIS_THRESHOLD)) {
      return;
    }

  // Extrai domínio da URL analisada
  if (!result?.url) return;
  const domain = extractDomain(result.url);
  if (!domain) return;

    // Evita sugerir se o domínio já estiver na blacklist
    const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(
      STORAGE_KEYS.BLACKLIST
    );
    const alreadyBlocked = (blacklist as BlacklistEntry[]).some((e) => e.domain === domain);
    if (alreadyBlocked) return;

    // Evita spam de notificações para o mesmo domínio
    if (!(await shouldNotifyDomain(domain))) {
      return;
    }

    // Cria notificação com ação para bloquear
    const notificationId = `suggest-block-${domain}`;
    await chrome.notifications.create(notificationId, {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Site Potencialmente Distrativo",
      message: `${domain} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
      buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }],
      // Você pode manter a notificação até interação do usuário, se quiser:
      // requireInteraction: true,
      // priority: 0,
    });
  } catch (e) {
    console.error("[v0] Error while handling content analysis result:", e);
  }
}
