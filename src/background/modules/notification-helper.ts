/**
 * Centralized notification utility for Chrome Extension
 * Provides consistent icon paths, error handling, and permission verification
 */

import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { UserSettings } from "../../shared/types";
import { STORAGE_KEYS } from "../../shared/constants";

/**
 * Gets the correct icon URL for notifications using chrome.runtime.getURL()
 * Uses icons/icon48.png to match the physical file structure
 */
export function getNotificationIconUrl(): string {
  const iconPath = "icons/icon48.png";
  const iconUrl = chrome.runtime.getURL(iconPath);
  console.debug("[v0][Notifications] Icon URL resolved:", { iconPath, iconUrl });
  return iconUrl;
}

/**
 * Verifies if notification API is available and permissions are granted
 * @returns true if notifications can be created, false otherwise
 */
export async function verifyNotificationPermission(): Promise<boolean> {
  try {
    // Check if notifications API exists
    if (!chrome.notifications || typeof chrome.notifications.create !== "function") {
      console.warn("[v0][Notifications] chrome.notifications API not available");
      return false;
    }

    // Try to check permission explicitly (if permissions API is available)
    if (chrome.permissions && chrome.permissions.contains) {
      try {
        const hasPermission = await chrome.permissions.contains({
          permissions: ["notifications"],
        });
        if (!hasPermission) {
          console.warn("[v0][Notifications] Notification permission not granted");
          return false;
        }
      } catch (error) {
        // permissions.contains might not work for declared permissions
        // Fall through to try creating a notification
        console.debug("[v0][Notifications] Could not check permission status, will try creating notification");
      }
    }

    return true;
  } catch (error) {
    console.error("[v0][Notifications] Error verifying permission:", error);
    return false;
  }
}

/**
 * Gets notification setting from storage with robust fallback chain
 * Fallback order: sync → local → DEFAULT_SETTINGS
 */
export async function getNotificationSetting(): Promise<boolean> {
  try {
    // Try sync storage first
    try {
      const syncResult = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const settings = syncResult[STORAGE_KEYS.SETTINGS] as UserSettings | undefined;
      
      if (settings) {
        const enabled = settings.notifications ?? settings.notificationsEnabled;
        if (enabled !== undefined) {
          return enabled;
        }
      }
    } catch (syncError) {
      console.warn("[v0][Notifications] Sync storage read failed, trying local:", syncError);
    }

    // Fallback to local storage
    try {
      const localResult = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      const settings = localResult[STORAGE_KEYS.SETTINGS] as UserSettings | undefined;
      
      if (settings) {
        const enabled = settings.notifications ?? settings.notificationsEnabled;
        if (enabled !== undefined) {
          return enabled;
        }
      }
    } catch (localError) {
      console.warn("[v0][Notifications] Local storage read failed:", localError);
    }

    // Final fallback to DEFAULT_SETTINGS
    return DEFAULT_SETTINGS.notifications ?? DEFAULT_SETTINGS.notificationsEnabled ?? true;
  } catch (error) {
    console.error("[v0][Notifications] Error getting notification setting:", error);
    // Return false on error to avoid sending notifications when settings cannot be reliably retrieved
    return false;
  }
}

/**
 * Interface for notification creation options
 */
export interface CreateNotificationOptions {
  notificationId: string;
  type?: chrome.notifications.TemplateType;
  iconUrl?: string;
  title: string;
  message: string;
  buttons?: chrome.notifications.ButtonOptions[];
  requireInteraction?: boolean;
  priority?: number;
}

/**
 * Creates a notification with proper error handling and logging
 * @param options Notification creation options
 * @returns Promise resolving to notification ID, or null if creation failed
 */
export async function createNotification(
  options: CreateNotificationOptions
): Promise<string | null> {
  console.log("[v0][Notifications] Creating notification:", {
    notificationId: options.notificationId,
    title: options.title,
    type: options.type || "basic",
    iconUrl: options.iconUrl || "(will use default)",
  });

  try {
    // Verify permission first
    console.debug("[v0][Notifications] Verifying notification permission...");
    const hasPermission = await verifyNotificationPermission();
    console.debug("[v0][Notifications] Permission check result:", { hasPermission });
    
    if (!hasPermission) {
      console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: options.notificationId,
        title: options.title,
      });
      return null;
    }

    // Check if notifications are enabled in settings
    console.debug("[v0][Notifications] Checking notification settings...");
    const notificationsEnabled = await getNotificationSetting();
    console.debug("[v0][Notifications] Notification setting result:", { notificationsEnabled });
    
    if (!notificationsEnabled) {
      console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: options.notificationId,
        title: options.title,
      });
      return null;
    }

    // Prepare notification options
    const finalIconUrl = options.iconUrl || getNotificationIconUrl();
    const notificationOptions: chrome.notifications.NotificationOptions = {
      type: options.type || "basic",
      iconUrl: finalIconUrl,
      title: options.title,
      message: options.message,
    };

    // Add optional fields
    if (options.buttons && options.buttons.length > 0) {
      notificationOptions.buttons = options.buttons;
    }
    if (options.requireInteraction !== undefined) {
      notificationOptions.requireInteraction = options.requireInteraction;
    }
    if (options.priority !== undefined) {
      notificationOptions.priority = options.priority;
    }

    console.log("[v0][Notifications] Notification options prepared:", {
      notificationId: options.notificationId,
      type: notificationOptions.type,
      iconUrl: notificationOptions.iconUrl,
      title: notificationOptions.title,
      messageLength: notificationOptions.message?.length || 0,
      hasButtons: (notificationOptions.buttons?.length || 0) > 0,
      requireInteraction: notificationOptions.requireInteraction,
      priority: notificationOptions.priority,
    });

    // Create notification
    console.debug("[v0][Notifications] Calling chrome.notifications.create...");
    const notificationId = await chrome.notifications.create(
      notificationOptions
    );

    console.log("[v0][Notifications] Notification created successfully:", {
      id: notificationId,
      notificationId: options.notificationId,
      title: options.title,
      type: options.type || "basic",
    });

    return notificationId;
  } catch (error: any) {
    console.error("[v0][Notifications] Failed to create notification:", {
      error: error?.message || String(error),
      stack: error?.stack,
      notificationId: options.notificationId,
      title: options.title,
      message: options.message,
    });
    return null;
  }
}

