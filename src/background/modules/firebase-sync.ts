import { doc, setDoc, type Firestore } from "firebase/firestore";
import { ALARM_NAMES, ANALYTICS_STORAGE } from "../../shared/constants";
import type { DailySummary, PendingDailySummarySync } from "../../shared/types";
import { getFirestore, hasValidFirebaseConfig } from "../../lib/firebase";
import {
  getDailySummarySnapshot,
  getCurrentSummaryDate,
  readDailySummaryForDate,
} from "./daily-summary";
import {
  isAnalyticsConsentGranted,
  subscribeToAnalyticsConsent,
} from "./analytics-consent";
import {
  getCurrentUserId,
  subscribeToAuthChanges,
  waitForAuthReady,
} from "./firebase-auth";

let initialized = false;
let syncing = false;
const MAX_SYNC_RETRIES = 5;

export async function initializeFirebaseSync() {
  if (initialized) return;
  initialized = true;

  try {
    if (!hasValidFirebaseConfig()) {
      console.warn("[v0][Analytics] Firebase config not provided — sync disabled.");
      initialized = false;
      return;
    }

    await enqueuePreviousDayIfNeeded();

    chrome.alarms.create(ALARM_NAMES.ANALYTICS_SYNC, {
      periodInMinutes: 10,
      delayInMinutes: 1,
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === ALARM_NAMES.ANALYTICS_SYNC) {
        void handleSyncTick();
      }
    });

    subscribeToAnalyticsConsent(() => {
      void handleSyncTick();
    });
    subscribeToAuthChanges(() => {
      void handleSyncTick();
    });

    void handleSyncTick();
  } catch (error) {
    console.warn("[v0][Analytics] Firebase sync initialization failed:", error);
    initialized = false;
  }
}

async function handleSyncTick() {
  if (syncing) return;
  if (!isAnalyticsConsentGranted()) return;

  syncing = true;
  try {
    await waitForAuthReady();
    const uid = getCurrentUserId();
    if (!uid) return;

    const dbInstance = getFirestore();
    if (!dbInstance) {
      console.warn("[v0][Analytics] Firestore instance not available.");
      return;
    }
    const db = dbInstance;

    await enqueuePreviousDayIfNeeded();
    await processPendingQueue(uid, db);
    await syncTodaySnapshot(uid, db);
  } catch (error) {
    console.warn("[v0][Analytics] Sync tick failed:", error);
  } finally {
    syncing = false;
  }
}

async function syncTodaySnapshot(uid: string, db: Firestore) {
  const summary = await getDailySummarySnapshot();
  if (!hasSyncableData(summary)) return;
  await uploadSummary(uid, summary, db);
}

async function enqueuePreviousDayIfNeeded() {
  const yesterdayKey = getDateKeyOffset(-1);
  if (!yesterdayKey) return;
  const queue = await loadPendingQueue();
  if (queue.some((entry) => entry.date === yesterdayKey)) {
    return;
  }
  if (await isDateSynced(yesterdayKey)) {
    return;
  }

  const summary = await readDailySummaryForDate(yesterdayKey);
  if (!summary || !hasSyncableData(summary)) return;
  queue.push({
    date: yesterdayKey,
    summary,
    retries: 0,
  });
  await savePendingQueue(queue);
}

async function processPendingQueue(uid: string, db: Firestore) {
  const queue = await loadPendingQueue();
  if (queue.length === 0) return;

  const remaining: PendingDailySummarySync[] = [];

  for (const entry of queue) {
    const success = await uploadSummary(uid, entry.summary, db);
    if (!success) {
      const nextRetryCount = entry.retries + 1;
      if (nextRetryCount >= MAX_SYNC_RETRIES) {
        console.warn("[v0][Analytics] Dropping summary after max retries:", entry.date);
        continue;
      }
      remaining.push({
        ...entry,
        retries: nextRetryCount,
        lastTriedAt: new Date().toISOString(),
      });
    } else {
      await markDateSynced(entry.date);
    }
  }

  await savePendingQueue(remaining);
}

async function uploadSummary(uid: string, summary: DailySummary, db: Firestore): Promise<boolean> {
  if (!hasSyncableData(summary)) {
    return true;
  }

  try {
    const ref = doc(db!, "userUsage", uid, "dailySummaries", summary.date);
    await setDoc(ref, summary, { merge: true });
    console.log("[v0][Analytics] Synced summary for", summary.date);
    return true;
  } catch (error) {
    console.warn("[v0][Analytics] Failed to sync summary:", summary.date, error);
    return false;
  }
}

function hasSyncableData(summary: DailySummary | null | undefined): summary is DailySummary {
  if (!summary) return false;
  if (summary.totalActiveMinutes > 0) return true;
  if (Object.keys(summary.perDomain || {}).length > 0) return true;
  if (Object.keys(summary.searchInsights.topQueries || {}).length > 0) return true;
  if (Object.keys(summary.contentInsights.topDomainsConsumed || {}).length > 0) return true;
  return false;
}

async function loadPendingQueue(): Promise<PendingDailySummarySync[]> {
  const { [ANALYTICS_STORAGE.PENDING_QUEUE]: stored } = await chrome.storage.local.get(
    ANALYTICS_STORAGE.PENDING_QUEUE
  );
  if (Array.isArray(stored)) {
    return stored as PendingDailySummarySync[];
  }
  return [];
}

async function savePendingQueue(queue: PendingDailySummarySync[]) {
  await chrome.storage.local.set({ [ANALYTICS_STORAGE.PENDING_QUEUE]: queue });
}

function getDateKeyOffset(offset: number): string | null {
  const date = new Date(getCurrentSummaryDate());
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function loadSyncedDates(): Promise<Record<string, string>> {
  const { [ANALYTICS_STORAGE.SYNCED_DATES]: stored } = await chrome.storage.local.get(
    ANALYTICS_STORAGE.SYNCED_DATES
  );
  if (stored && typeof stored === "object") {
    return stored as Record<string, string>;
  }
  return {};
}

async function isDateSynced(dateKey: string): Promise<boolean> {
  const map = await loadSyncedDates();
  return Boolean(map[dateKey]);
}

async function markDateSynced(dateKey: string) {
  const map = await loadSyncedDates();
  map[dateKey] = new Date().toISOString();
  await chrome.storage.local.set({ [ANALYTICS_STORAGE.SYNCED_DATES]: map });
}
