import type { Message, ContentAnalysisResult, MessageId } from "../shared/types";
import { MAX_TEXT_LENGTH, STORAGE_KEYS } from "../shared/constants";
import { MESSAGE } from "../shared/types";

// ─────────────────────────────────────────────────────────────
// Anti-reinjeção: marca que o CS já está presente
// ─────────────────────────────────────────────────────────────
(window as any).v0ContentScriptInjected = true;

console.log("[v0][CS] Content script loaded");

// ─────────────────────────────────────────────────────────────
// Verificação imediata de domínios bloqueados (cache bypass)
// ─────────────────────────────────────────────────────────────
(async function checkIfBlockedDomain() {
  try {
    const currentDomain = location.hostname;
    const { [STORAGE_KEYS.BLACKLIST]: blacklist } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
    
    if (blacklist && Array.isArray(blacklist)) {
      const isBlocked = blacklist.some((entry: any) => {
        const domain = typeof entry === 'string' ? entry : entry.domain;
        return currentDomain === domain || currentDomain.endsWith('.' + domain);
      });
      
      if (isBlocked) {
        console.log('[v0][CS] Blocked domain loaded from cache, redirecting...');
        // Redirecionar para página de bloqueio customizada
        const blockedPageUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(currentDomain)}`);
        location.href = blockedPageUrl;
        return; // Para execução do resto do script
      }
    }
  } catch (e) {
    console.error('[v0][CS] Failed to check blocked domain:', e);
  }
})();

// Evita múltiplas análises na mesma navegação
let hasAnalyzed = false;

// ─────────────────────────────────────────────────────────────
// Listener robusto de mensagens vindas do Service Worker
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  try {
    if (message?.type === MESSAGE.TOGGLE_ZEN_MODE) {
      toggleZenMode((message as any).payload?.preset);
      sendResponse?.({ success: true });
      return true; // mantém a porta aberta caso algo seja async
    }
  } catch (e) {
    console.warn("[v0][CS] TOGGLE_ZEN_MODE failed:", e);
    sendResponse?.({ success: false, error: String(e) });
  }
  return false;
});

// ─────────────────────────────────────────────────────────────
// Análise de conteúdo com guard p/ não rodar múltiplas vezes
// ─────────────────────────────────────────────────────────────
const analyzePageContent = async () => {
  if (hasAnalyzed) return;
  hasAnalyzed = true;
  try {
    const text = document.body?.innerText?.slice(0, MAX_TEXT_LENGTH) ?? "";
    const url = location.href;
      const result = await analyzeText(text, url);
      const id: MessageId = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`) as any;
      await chrome.runtime.sendMessage({ type: MESSAGE.CONTENT_ANALYSIS_RESULT, id, source: "content-script", ts: Date.now(), payload: { result } } as unknown as Message, (response) => {
        // Handle response or ignore errors
        const err = chrome.runtime.lastError;
        if (err && !err.message.includes("Receiving end does not exist") && !err.message.includes("message channel closed")) {
          console.warn("[v0][CS] Content analysis message error:", err.message);
        }
      });
  } catch (e) {
    console.error("[v0][CS] analyzePageContent error:", e);
  }
};

// Dispara análise quando o DOM estiver pronto (sem duplicar)
if (document.readyState === "complete" || document.readyState === "interactive") {
  analyzePageContent();
} else {
  document.addEventListener("DOMContentLoaded", analyzePageContent, { once: true });
}

// ─────────────────────────────────────────────────────────────
// Scoring simples de conteúdo com keywords do usuário
// ─────────────────────────────────────────────────────────────
async function analyzeText(text: string, url: string): Promise<ContentAnalysisResult> {
  const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const productiveKeywords: string[] = settings?.productiveKeywords || [];
  const distractingKeywords: string[] = settings?.distractingKeywords || [];

  const lowerText = text.toLowerCase();
  let productiveScore = 0;
  let distractingScore = 0;

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  productiveKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) productiveScore += matches.length;
  });

  distractingKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) distractingScore += matches.length;
  });

  const totalScore = productiveScore + distractingScore;
  const distractingRatio = totalScore > 0 ? distractingScore / totalScore : 0;

  let classification: "productive" | "distracting" | "neutral" = "neutral";
  if (distractingRatio > 0.6) classification = "distracting";
  else if (distractingRatio < 0.4 && productiveScore > 0) classification = "productive";

  return {
    url,
    classification,
    score: distractingRatio,
    categories: {},
    flagged: classification === "distracting",
  };
}

// ─────────────────────────────────────────────────────────────
// Zen Mode (idempotente)
// ─────────────────────────────────────────────────────────────
let zenModeActive = false;
let originalContent: string | null = null;
let originalBackground = "";
let zenContainer: HTMLElement | null = null;

function toggleZenMode(preset?: string) {
  if (zenModeActive) {
    // Restaurar estado original
    if (originalContent !== null) {
      document.body.innerHTML = originalContent;
      document.body.style.background = originalBackground;
      originalContent = null;
      originalBackground = "";
    }

    if (zenContainer) {
      zenContainer.remove();
      zenContainer = null;
    }

    zenModeActive = false;
    console.log("[v0][CS] Zen Mode deactivated");
  } else {
    // Salvar estado atual e ativar
    originalContent = document.body.innerHTML;
    originalBackground = document.body.style.background || "";
    applyZenMode(preset);
    zenModeActive = true;
    console.log("[v0][CS] Zen Mode activated");
  }
}

function applyZenMode(preset?: string) {
  try {
    const mainContent = extractMainContent();

    if (preset) {
      // aplica preset antes de reescrever o body
      void applyPreset(preset);
    }

    // Remove container anterior, se existir
    if (zenContainer) {
      zenContainer.remove();
    }

    zenContainer = document.createElement("div");
    zenContainer.id = "zen-mode-container";
    zenContainer.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: Georgia, serif;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    `;
    zenContainer.innerHTML = mainContent;

    document.body.innerHTML = "";
    document.body.appendChild(zenContainer);
    document.body.style.background = "#f5f5f5";
  } catch (e) {
    console.error("[v0][CS] Error applying Zen Mode:", e);
    // Tenta restaurar o estado original em caso de erro
    if (originalContent !== null) {
      document.body.innerHTML = originalContent;
      document.body.style.background = originalBackground;
    }
    throw e; // será capturado pelo listener de mensagem
  }
}

function extractMainContent(): string {
  const article = document.querySelector("article");
  const main = document.querySelector("main");
  const content = document.querySelector('[role="main"]');

  if (article) return (article as HTMLElement).innerHTML;
  if (main) return (main as HTMLElement).innerHTML;
  if (content) return (content as HTMLElement).innerHTML;

  // Fallback simples
  return document.body.innerHTML;
}

async function applyPreset(presetDomain: string) {
  try {
    const { [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: siteCustomizations } = await chrome.storage.local.get(
      STORAGE_KEYS.SITE_CUSTOMIZATIONS
    );
    const preset = siteCustomizations?.[presetDomain];

    if (preset?.selectorsToRemove) {
      preset.selectorsToRemove.forEach((selector: string) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      });
    }
  } catch (e) {
    console.warn("[v0][CS] applyPreset failed:", e);
  }
}
