// Debug configuration utilities
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./constants";
import type { UserSettings } from "./types";

/**
 * Gets the current debug configuration from storage
 * Falls back to default settings if not found
 */
export async function getDebugConfig(): Promise<{
  debugDNR: boolean;
  debugTracking: boolean;
  debugContentAnalysis: boolean;
  debugPomodoro: boolean;
  debugZenMode: boolean;
}> {
  try {
    const settings = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const userSettings = (settings[STORAGE_KEYS.SETTINGS] as UserSettings) || DEFAULT_SETTINGS;
    
    return {
      debugDNR: userSettings.debugDNR ?? DEFAULT_SETTINGS.debugDNR ?? false,
      debugTracking: userSettings.debugTracking ?? DEFAULT_SETTINGS.debugTracking ?? false,
      debugContentAnalysis: userSettings.debugContentAnalysis ?? DEFAULT_SETTINGS.debugContentAnalysis ?? false,
      debugPomodoro: userSettings.debugPomodoro ?? DEFAULT_SETTINGS.debugPomodoro ?? false,
      debugZenMode: userSettings.debugZenMode ?? DEFAULT_SETTINGS.debugZenMode ?? false,
    };
  } catch (error) {
    console.warn("[v0] Failed to read debug config from storage, using defaults:", error);
    return {
      debugDNR: false,
      debugTracking: false,
      debugContentAnalysis: false,
      debugPomodoro: false,
      debugZenMode: false,
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
let debugConfigCache: {
  debugDNR: boolean;
  debugTracking: boolean;
  debugContentAnalysis: boolean;
  debugPomodoro: boolean;
  debugZenMode: boolean;
} | null = null;

export function getDebugConfigSync(): {
  debugDNR: boolean;
  debugTracking: boolean;
  debugContentAnalysis: boolean;
  debugPomodoro: boolean;
  debugZenMode: boolean;
} {
  if (debugConfigCache === null) {
    // Fallback to default if cache is not initialized
    return {
      debugDNR: false,
      debugTracking: false,
      debugContentAnalysis: false,
      debugPomodoro: false,
      debugZenMode: false,
    };
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

/**
 * Helper functions for each debug flag
 */
export async function isTrackingDebugEnabled(): Promise<boolean> {
  const config = await getDebugConfig();
  return config.debugTracking;
}

export async function isContentAnalysisDebugEnabled(): Promise<boolean> {
  const config = await getDebugConfig();
  return config.debugContentAnalysis;
}

export async function isPomodoroDebugEnabled(): Promise<boolean> {
  const config = await getDebugConfig();
  return config.debugPomodoro;
}

export async function isZenModeDebugEnabled(): Promise<boolean> {
  const config = await getDebugConfig();
  return config.debugZenMode;
}

/**
 * Synchronous versions for performance-critical paths
 */
export function isTrackingDebugEnabledSync(): boolean {
  return getDebugConfigSync().debugTracking;
}

export function isContentAnalysisDebugEnabledSync(): boolean {
  return getDebugConfigSync().debugContentAnalysis;
}

export function isPomodoroDebugEnabledSync(): boolean {
  return getDebugConfigSync().debugPomodoro;
}

export function isZenModeDebugEnabledSync(): boolean {
  return getDebugConfigSync().debugZenMode;
}
