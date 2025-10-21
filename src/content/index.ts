import type { Message, ContentAnalysisResult } from "../shared/types"
import { MAX_TEXT_LENGTH } from "../shared/constants"
import { Readability } from "@mozilla/readability"
import winkNLP from "wink-nlp"
import model from "wink-eng-lite-web-model"

declare const chrome: typeof import("chrome-types").chrome

console.log("[v0] Content script loaded")

// Listen for Zen Mode toggle messages
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === "TOGGLE_ZEN_MODE") {
    toggleZenMode(message.payload?.preset)
    sendResponse({ success: true })
  }
  return true
})

// Analyze page content on load
document.addEventListener("DOMContentLoaded", async () => {
  await analyzePageContent()
})

// If page is already loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
  analyzePageContent()
}

async function analyzePageContent() {
  try {
    const text = document.body.innerText.slice(0, MAX_TEXT_LENGTH)
    const url = window.location.href

    // Simple keyword-based analysis (wink-nlp would be more sophisticated)
    const result = await analyzeText(text, url)

    // Send result to service worker
    chrome.runtime.sendMessage({
      type: "CONTENT_ANALYSIS_RESULT",
      payload: result,
    } as Message)

    console.log("[v0] Content analyzed:", result.classification)
  } catch (error) {
    console.error("[v0] Error analyzing content:", error)
  }
}

async function analyzeText(text: string, url: string): Promise<ContentAnalysisResult> {
  // Get keywords from storage
  const { settings } = await chrome.storage.sync.get("settings")
  const productiveKeywords = settings?.productiveKeywords || []
  const distractingKeywords = settings?.distractingKeywords || []

  // Instantiate wink-nlp with the model
  const nlp = winkNLP(model)
  const its = nlp.its
  const as = nlp.as

  // Process the text
  const doc = nlp.readDoc(text)

  // Extract lemmas, removing stop words and punctuation
  const lemmas = doc
    .tokens()
    .filter((t) => !t.out(its.stopWordFlag) && t.out(its.type) === "word")
    .out(its.lemma, as.array)

  // Calculate scores by comparing lemmas with keyword lists
  let productiveScore = 0
  let distractingScore = 0

  const productiveSet = new Set(productiveKeywords.map((k: string) => k.toLowerCase()))
  const distractingSet = new Set(distractingKeywords.map((k: string) => k.toLowerCase()))

  lemmas.forEach((lemma: string) => {
    if (productiveSet.has(lemma.toLowerCase())) {
      productiveScore++
    }
    if (distractingSet.has(lemma.toLowerCase())) {
      distractingScore++
    }
  })

  const totalScore = productiveScore + distractingScore
  const distractingRatio = totalScore > 0 ? distractingScore / totalScore : 0

  let classification: "productive" | "distracting" | "neutral" = "neutral"
  if (distractingRatio > 0.6) {
    classification = "distracting"
  } else if (distractingRatio < 0.4 && productiveScore > 0) {
    classification = "productive"
  }

  return {
    url,
    classification,
    score: distractingRatio,
    timestamp: Date.now(),
  }
}

// Zen Mode implementation
let zenModeActive = false
let originalContent: string | null = null
let observer: MutationObserver | null = null

function toggleZenMode(preset?: string) {
  if (zenModeActive) {
    restoreOriginalContent()
    zenModeActive = false
    console.log("[v0] Zen Mode deactivated")
  } else {
    originalContent = document.body.innerHTML
    applyZenMode(preset)
    zenModeActive = true
    console.log("[v0] Zen Mode activated")
  }
}

function applyZenMode(preset?: string) {
  const documentClone = document.cloneNode(true) as Document
  const reader = new Readability(documentClone)
  const article = reader.parse()

  if (article && article.content) {
    if (preset) {
      applyPreset(preset)
    }

    const zenContainer = document.createElement("div")
    zenContainer.id = "zen-mode-container"
    zenContainer.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: Georgia, serif;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    `
    zenContainer.innerHTML = article.content

    document.body.innerHTML = ""
    document.body.appendChild(zenContainer)
    document.body.style.background = "#f5f5f5"

    setupMutationObserver()
  } else {
    console.warn("[v0] Readability could not extract article content")
  }
}

function restoreOriginalContent() {
  if (originalContent) {
    document.body.innerHTML = originalContent
    originalContent = null
  }

  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function setupMutationObserver() {
  if (observer) {
    observer.disconnect()
  }

  const targetNode = document.body
  const config = { childList: true, subtree: true }

  let debounceTimeout: ReturnType<typeof setTimeout>

  const callback = (mutationsList: MutationRecord[]) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      console.log("[v0] DOM changes detected, reapplying Zen Mode")
      applyZenMode()
    }, 500)
  }

  observer = new MutationObserver(callback)
  observer.observe(targetNode, config)
}

async function applyPreset(presetDomain: string) {
  const { zenModePresets } = await chrome.storage.local.get("zenModePresets")
  const preset = zenModePresets?.find((p: any) => p.domain === presetDomain)

  if (preset?.selectorsToRemove) {
    preset.selectorsToRemove.forEach((selector: string) => {
      document.querySelectorAll(selector).forEach((el) => el.remove())
    })
  }
}

// YouTube element hiding functionality
async function applyYouTubeCustomizations() {
  if (!window.location.hostname.includes("youtube.com")) return

  const { siteCustomizations } = await chrome.storage.sync.get("siteCustomizations")
  const ytSettings = siteCustomizations?.["youtube.com"]
  if (!ytSettings) return

  const selectors: { [key: string]: string } = {
    hideHomepage: "ytd-browse[page-subtype='home'] ytd-rich-grid-renderer",
    hideShorts: "ytd-rich-section-renderer[is-shorts], ytd-reel-shelf-renderer",
    hideComments: "#comments, ytd-comments",
    hideRecommendations: "#related, #secondary",
  }

  const styles: string[] = []

  Object.entries(ytSettings).forEach(([key, value]) => {
    if (value && selectors[key]) {
      styles.push(`${selectors[key]} { display: none !important; }`)
    }
  })

  if (styles.length > 0) {
    const existingStyle = document.getElementById("focus-extension-yt-styles")
    if (existingStyle) {
      existingStyle.remove()
    }

    const styleSheet = document.createElement("style")
    styleSheet.id = "focus-extension-yt-styles"
    styleSheet.innerText = styles.join("\n")
    document.head.appendChild(styleSheet)

    console.log("[v0] YouTube customizations applied")
  }
}

// Apply YouTube customizations on load
if (window.location.hostname.includes("youtube.com")) {
  applyYouTubeCustomizations()

  // Reapply on navigation (YouTube is a SPA)
  const ytObserver = new MutationObserver(() => {
    applyYouTubeCustomizations()
  })

  ytObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}
