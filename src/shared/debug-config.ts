// Debug configuration utilities
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./constants";
import type { UserSettings } from "./types";

/**
 * Gets the current debug configuration from storage
 * Falls back to default settings if not found
 */
export async function getDebugConfig(): Promise<{
  debugDNR: boolean;
}> {
  try {
    const settings = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const userSettings = (settings[STORAGE_KEYS.SETTINGS] as UserSettings) || DEFAULT_SETTINGS;
    
    return {
      debugDNR: userSettings.debugDNR ?? DEFAULT_SETTINGS.debugDNR ?? false,
    };
  } catch (error) {
    console.warn("[v0] Failed to read debug config from storage, using defaults:", error);
    return {
      debugDNR: false,
    };
  }
}

/**
 * Checks if DNR debugging is enabled
 * This is the main function to use for gating debug logs
 */
export async function isDNRDebugEnabled(): Promise<boolean> {
  const config = await getDebugConfig();
  return config.debugDNR;
}

/**
 * Synchronous version that uses a cached value
 * Use this when you need immediate access without async overhead
 * Call updateDebugConfigCache() to refresh the cache
 */
let debugConfigCache: { debugDNR: boolean } | null = null;

export function getDebugConfigSync(): { debugDNR: boolean } {
  if (debugConfigCache === null) {
    // Fallback to default if cache is not initialized
    return { debugDNR: false };
  }
  return debugConfigCache;
}

/**
 * Updates the debug configuration cache
 * Call this when settings change or at startup
 */
export async function updateDebugConfigCache(): Promise<void> {
  debugConfigCache = await getDebugConfig();
}

/**
 * Synchronous check for DNR debugging
 * Use this for performance-critical paths where async is not acceptable
 */
export function isDNRDebugEnabledSync(): boolean {
  return getDebugConfigSync().debugDNR;
}
