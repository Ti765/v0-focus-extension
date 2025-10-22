import type { Message, ContentAnalysisResult } from "../shared/types";
import { MAX_TEXT_LENGTH, STORAGE_KEYS } from "../shared/constants";

console.log("[v0] Content script loaded");

// Evita múltiplas análises na mesma navegação
let hasAnalyzed = false;

// Recebe mensagens do Service Worker (ex.: TOGGLE_ZEN_MODE)
chrome.runtime.onMessage.addListener(
  (message: Message, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === "TOGGLE_ZEN_MODE") {
      toggleZenMode(message.payload?.preset);
      sendResponse({ success: true });
    }
    return true; // mantém canal aberto para respostas assíncronas (boa prática)
  }
);

const analyzePageContent = async () => {
  if (hasAnalyzed) return;
  hasAnalyzed = true;

  try {
    const text = document.body?.innerText?.slice(0, MAX_TEXT_LENGTH) ?? "";
    const url = window.location.href;
    const result = await analyzeText(text, url);

    chrome.runtime.sendMessage({
      type: "CONTENT_ANALYSIS_RESULT",
      payload: result,
    } as Message);

    console.log("[v0] Content analyzed:", result.classification);
  } catch (error) {
    console.error("[v0] Error analyzing content:", error);
  }
};

// Dispara análise quando o DOM estiver pronto (sem duplicar)
if (document.readyState === "complete" || document.readyState === "interactive") {
  analyzePageContent();
} else {
  document.addEventListener("DOMContentLoaded", analyzePageContent, { once: true });
}

// --- Scoring simples de conteúdo com keywords das settings ---
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
    timestamp: Date.now(),
  };
}

// --- Zen Mode ---
let zenModeActive = false;
let originalContent: string | null = null;
let originalBackground = "";

function toggleZenMode(preset?: string) {
  if (zenModeActive) {
    // Restore
    if (originalContent !== null) {
      document.body.innerHTML = originalContent;
      document.body.style.background = originalBackground;
      originalContent = null;
    }
    zenModeActive = false;
    console.log("[v0] Zen Mode deactivated");
  } else {
    // Activate
    originalContent = document.body.innerHTML;
    originalBackground = document.body.style.background;
    applyZenMode(preset);
    zenModeActive = true;
    console.log("[v0] Zen Mode activated");
  }
}

function applyZenMode(preset?: string) {
  const mainContent = extractMainContent();

  if (preset) {
    applyPreset(preset);
  }

  const zenContainer = document.createElement("div");
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
  const { [STORAGE_KEYS.SITE_CUSTOMIZATIONS]: siteCustomizations } = await chrome.storage.local.get(
    STORAGE_KEYS.SITE_CUSTOMIZATIONS
  );
  const preset = siteCustomizations?.[presetDomain];

  if (preset?.selectorsToRemove) {
    preset.selectorsToRemove.forEach((selector: string) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }
}
