import type { Message, ContentAnalysisResult, MessageId } from "../shared/types";
import { MAX_TEXT_LENGTH, STORAGE_KEYS } from "../shared/constants";
import { MESSAGE } from "../shared/types";

// Import DOMPurify with proper browser support
import DOMPurify from "dompurify";

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
  const lowerUrl = url.toLowerCase();
  
  // Also analyze page title and meta description
  const title = document.title.toLowerCase();
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')?.toLowerCase() || '';
  
  // Combine all text sources
  const allText = `${lowerText} ${title} ${metaDescription}`;
  
  let productiveScore = 0;
  let distractingScore = 0;
  let productiveWeight = 0;
  let distractingWeight = 0;

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Analyze productive keywords with context weighting
  productiveKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const matches = allText.match(regex);
    if (matches) {
      const count = matches.length;
      productiveScore += count;
      
      // Weight by context: title and meta description are more important
      const titleMatches = title.match(regex)?.length || 0;
      const metaMatches = metaDescription.match(regex)?.length || 0;
      productiveWeight += count + (titleMatches * 2) + (metaMatches * 1.5);
    }
  });

  // Analyze distracting keywords with context weighting
  distractingKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const matches = allText.match(regex);
    if (matches) {
      const count = matches.length;
      distractingScore += count;
      
      // Weight by context: title and meta description are more important
      const titleMatches = title.match(regex)?.length || 0;
      const metaMatches = metaDescription.match(regex)?.length || 0;
      distractingWeight += count + (titleMatches * 2) + (metaMatches * 1.5);
    }
  });

  // Calculate weighted scores
  const totalWeight = productiveWeight + distractingWeight;
  const distractingRatio = totalWeight > 0 ? distractingWeight / totalWeight : 0;
  
  // Consider text density and length
  const textLength = allText.length;
  const keywordDensity = totalWeight / Math.max(textLength / 1000, 1); // keywords per 1000 chars
  
  // Adjust classification based on density and context
  let classification: "productive" | "distracting" | "neutral" = "neutral";
  
  if (distractingRatio > 0.6 && keywordDensity > 0.5) {
    classification = "distracting";
  } else if (distractingRatio < 0.4 && productiveWeight > 0 && keywordDensity > 0.3) {
    classification = "productive";
  }

  return {
    url,
    classification,
    score: distractingRatio,
    categories: {
      productiveScore: productiveWeight,
      distractingScore: distractingWeight,
      keywordDensity: keywordDensity,
      textLength: textLength
    },
    flagged: classification === "distracting",
  };
}

// ─────────────────────────────────────────────────────────────
// Zen Mode (idempotente) - XSS Safe Implementation
// ─────────────────────────────────────────────────────────────
// Security Note: This implementation uses DOMPurify for robust XSS protection.
// DOMPurify is a battle-tested library that sanitizes HTML content by removing
// dangerous tags, attributes, and protocols. For plain text content, we use
// textContent to avoid any HTML parsing. Original content is stored as DocumentFragment
// and restored using cloneNode() for safe DOM manipulation.
let zenModeActive = false;
let originalContent: DocumentFragment | null = null;
let originalBackground = "";
let zenContainer: HTMLElement | null = null;

function toggleZenMode(preset?: string) {
  if (zenModeActive) {
    // Remove CSS styles and classes
    const zenStyle = document.getElementById('zen-mode-styles');
    if (zenStyle) {
      zenStyle.remove();
    }
    
    document.body.classList.remove('zen-mode');
    
    // Restaurar estado original para sites não-YouTube
    if (!window.location.hostname.includes('youtube.com')) {
    if (originalContent !== null) {
        // Safely restore original content using DOM nodes instead of innerHTML
        document.body.innerHTML = ""; // Clear current content
        document.body.appendChild(originalContent.cloneNode(true));
      document.body.style.background = originalBackground;
      originalContent = null;
      originalBackground = "";
    }

    if (zenContainer) {
      zenContainer.remove();
      zenContainer = null;
      }
    }

    zenModeActive = false;
    console.log("[v0][CS] Zen Mode deactivated");
  } else {
    // Salvar estado atual e ativar
    // Safely save original content as DOM nodes instead of innerHTML
    const bodyFragment = document.createDocumentFragment();
    while (document.body.firstChild) {
      bodyFragment.appendChild(document.body.firstChild);
    }
    originalContent = bodyFragment;
    originalBackground = document.body.style.background || "";
    applyZenMode(preset);
    zenModeActive = true;
    console.log("[v0][CS] Zen Mode activated");
  }
}

function applyZenMode(preset?: string) {
  try {
    // Apply CSS-based hiding instead of DOM replacement
    if (preset) {
      void applyPreset(preset);
    }

    // Create and inject CSS for Zen Mode
    const zenStyle = document.createElement('style');
    zenStyle.id = 'zen-mode-styles';
    zenStyle.textContent = `
      /* YouTube-specific Zen Mode styles */
      #secondary, #related, #comments, #sections, #chips, 
      #masthead-container, #player-ads, #merch-shelf,
      #engagement-panel, #watch-discussion, #watch-description,
      #watch7-sidebar-contents, #watch7-sidebar-modules,
      ytd-reel-shelf-renderer, ytd-shorts, ytd-compact-video-renderer,
      ytd-video-secondary-info-renderer, ytd-video-primary-info-renderer,
      #dismissible, #dismissed, #dismissed-content,
      ytd-item-section-renderer, ytd-shelf-renderer,
      #contents > ytd-rich-item-renderer:not(:first-child),
      #contents > ytd-video-renderer:not(:first-child),
      #contents > ytd-compact-video-renderer:not(:first-child) {
        display: none !important;
      }
      
      /* Focus on main content */
      #primary {
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 20px !important;
      }
      
      /* Clean up video player area */
      #player {
        margin: 0 auto !important;
        max-width: 1200px !important;
      }
      
      /* Hide distracting elements */
      .ytd-video-primary-info-renderer #above-the-fold,
      .ytd-video-primary-info-renderer #below,
      .ytd-video-primary-info-renderer #secondary,
      .ytd-video-primary-info-renderer #related,
      .ytd-video-primary-info-renderer #comments {
        display: none !important;
      }
      
      /* General Zen Mode styles for other sites */
      .zen-mode-hidden {
        display: none !important;
      }
      
      /* Focus mode styles */
      body.zen-mode {
        background: #f5f5f5 !important;
        font-family: Georgia, serif !important;
        line-height: 1.6 !important;
      }
      
      .zen-mode #zen-mode-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
    `;
    
    document.head.appendChild(zenStyle);
    document.body.classList.add('zen-mode');
    
    // For non-YouTube sites, create a focused container
    if (!window.location.hostname.includes('youtube.com')) {
      const mainContent = extractMainContent();
      
    if (zenContainer) {
      zenContainer.remove();
    }

    zenContainer = document.createElement("div");
    zenContainer.id = "zen-mode-container";
      
      // Safely set content using DOMPurify for robust XSS protection
      if (mainContent.trim()) {
        // Check if content is plain text (no HTML tags)
        const isPlainText = !/<[^>]*>/g.test(mainContent);
        
        if (isPlainText) {
          // Use textContent for plain text to avoid any HTML parsing
          zenContainer.textContent = mainContent;
        } else {
          // Use DOMPurify with strict configuration for HTML content
          const sanitizedHTML = DOMPurify.sanitize(mainContent, {
            // Only allow safe protocols
            ALLOWED_URI_REGEXP: /^(https?:|mailto:|data:image\/)/i,
            // Forbid dangerous tags
            FORBID_TAGS: ['base', 'meta', 'link', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
            // Forbid dangerous attributes
            FORBID_ATTR: ['style', 'formaction', 'action', 'srcdoc', 'onload', 'onerror', 'onclick', 'onmouseover'],
            // Additional security measures
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            SANITIZE_DOM: true,
            KEEP_CONTENT: true,
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            RETURN_DOM_IMPORT: false
          });
          
          // Set the sanitized HTML
          zenContainer.innerHTML = sanitizedHTML;
        }
      }
      
    document.body.appendChild(zenContainer);
    }
    
  } catch (e) {
    console.error("[v0][CS] Error applying Zen Mode:", e);
    // Tenta restaurar o estado original em caso de erro
    if (originalContent !== null) {
      // Safely restore original content using DOM nodes
      document.body.innerHTML = ""; // Clear current content
      document.body.appendChild(originalContent.cloneNode(true));
      document.body.style.background = originalBackground;
    }
    throw e; // será capturado pelo listener de mensagem
  }
}

function extractMainContent(): string {
  // YouTube-specific content extraction
  if (window.location.hostname.includes('youtube.com')) {
    // Try to find the main video content
    const videoContainer = document.querySelector('#primary #contents') || 
                          document.querySelector('#primary') ||
                          document.querySelector('#contents');
    if (videoContainer) return (videoContainer as HTMLElement).innerHTML;
  }
  
  // Generic content extraction
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
