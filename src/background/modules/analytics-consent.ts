import { STORAGE_KEYS } from "../../shared/constants";

type Listener = (allowed: boolean) => void;

let consentValue = false;
let initialized = false;
const listeners = new Set<Listener>();

export async function initializeAnalyticsConsentWatcher() {
  if (initialized) return;
  initialized = true;

  try {
    await refreshConsent(true);
  } catch (error) {
    console.warn("[v0][Analytics] Failed to load initial consent:", error);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (!changes[STORAGE_KEYS.SETTINGS]) return;
    const next = extractConsent(changes[STORAGE_KEYS.SETTINGS].newValue);
    updateConsent(next);
  });
}

export function isAnalyticsConsentGranted(): boolean {
  return consentValue;
}

export function subscribeToAnalyticsConsent(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function refreshConsent(silent = false) {
  try {
    const { [STORAGE_KEYS.SETTINGS]: settings } = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    updateConsent(extractConsent(settings), silent);
  } catch (error) {
    console.warn("[v0][Analytics] Failed to refresh consent from storage:", error);
    updateConsent(false, silent);
  }
}

function extractConsent(settings?: any): boolean {
  if (!settings) return false;
  return Boolean(settings.analyticsConsent ?? settings.telemetry ?? settings.syncWithCloud);
}

function updateConsent(next: boolean, silent = false) {
  const changed = consentValue !== next;
  consentValue = next;
  if (!silent && changed) {
    listeners.forEach((listener) => {
      try {
        listener(next);
      } catch (error) {
        console.warn("[v0][Analytics] consent listener failed:", error);
      }
    });
  }
}
