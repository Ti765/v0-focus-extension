import type { Message, ContentAnalysisResult } from "../shared/types"
import { MAX_TEXT_LENGTH } from "../shared/constants"

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

  const lowerText = text.toLowerCase()

  // Count keyword matches
  let productiveScore = 0
  let distractingScore = 0

  productiveKeywords.forEach((keyword: string) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) productiveScore += matches.length
  })

  distractingKeywords.forEach((keyword: string) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi")
    const matches = lowerText.match(regex)
    if (matches) distractingScore += matches.length
  })

  const totalScore = productiveScore + distractingScore
  const distractingRatio = totalScore > 0 ? distractingScore / totalScore : 0

  let classification: "productive" | "distracting" | "neutral" = "neutral"
  if (distractingRatio > 0.6) classification = "distracting"
  else if (distractingRatio < 0.4 && productiveScore > 0) classification = "productive"

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

function toggleZenMode(preset?: string) {
  if (zenModeActive) {
    // Restore original content
    if (originalContent) {
      document.body.innerHTML = originalContent
      originalContent = null
    }
    zenModeActive = false
    console.log("[v0] Zen Mode deactivated")
  } else {
    // Save original content
    originalContent = document.body.innerHTML

    // Apply Zen Mode transformation
    applyZenMode(preset)
    zenModeActive = true
    console.log("[v0] Zen Mode activated")
  }
}

function applyZenMode(preset?: string) {
  // Simple Zen Mode: extract main content and apply clean styling
  const mainContent = extractMainContent()

  // Apply user preset if available
  if (preset) {
    applyPreset(preset)
  }

  // Create clean container
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
  zenContainer.innerHTML = mainContent

  // Replace body content
  document.body.innerHTML = ""
  document.body.appendChild(zenContainer)
  document.body.style.background = "#f5f5f5"
}

function extractMainContent(): string {
  // Simple content extraction (Readability.js would be more sophisticated)
  const article = document.querySelector("article")
  const main = document.querySelector("main")
  const content = document.querySelector('[role="main"]')

  if (article) return article.innerHTML
  if (main) return main.innerHTML
  if (content) return content.innerHTML

  // Fallback: return body content
  return document.body.innerHTML
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
