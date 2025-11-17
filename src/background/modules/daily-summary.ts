import { ANALYTICS_STORAGE, ANALYTICS_TOP_ITEM_LIMIT } from "../../shared/constants";
import type {
  ContentAggregatePayload,
  DailySummary,
  DomainUsageStats,
  FeatureUsageEntry,
} from "../../shared/types";
import { isAnalyticsConsentGranted } from "./analytics-consent";

const nowIso = () => new Date().toISOString();

let cachedSummary: DailySummary | null = null;
let currentKey: string | null = null;
const MAX_DOMAIN_STATS = 200;
const MAX_TOGGLE_ENTRIES = 100;
const MAX_FEATURE_USAGE_ENTRIES = 100;

function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getStorageKey(dateKey: string): string {
  return `${ANALYTICS_STORAGE.DAILY_SUMMARY_PREFIX}-${dateKey}`;
}

function createEmptySummary(dateKey: string): DailySummary {
  const iso = nowIso();
  return {
    date: dateKey,
    totalMinutes: 0,
    totalActiveMinutes: 0,
    totalUniqueSitesVisited: 0,
    firstActivityAt: iso,
    lastActivityAt: iso,
    perDomain: {},
    pomodoro: {
      focusMinutes: 0,
      cyclesCompleted: 0,
      breaks: 0,
      longBreaks: 0,
      interruptions: 0,
    },
    toggles: {},
    featureUsage: {},
    searchInsights: {
      topQueries: {},
      categorizedQueries: {},
      lastSearchedAt: undefined,
    },
    contentInsights: {
      topDomainsConsumed: {},
      categorizedContent: {},
      topContentKeywords: {},
      lastConsumedAt: undefined,
    },
    browserInfo: undefined,
    lastUpdateLocal: iso,
  };
}

async function persistSummary(summary: DailySummary) {
  summary.lastUpdateLocal = nowIso();
  const storageKey = getStorageKey(summary.date);
  await chrome.storage.local.set({ [storageKey]: summary });
}

async function ensureSummary(dateKey = getDateKey()): Promise<DailySummary> {
  if (cachedSummary && currentKey === dateKey) {
    return cachedSummary;
  }

  const storageKey = getStorageKey(dateKey);
  const stored = await chrome.storage.local.get(storageKey);
  const summary: DailySummary = stored?.[storageKey] ?? createEmptySummary(dateKey);
  cachedSummary = summary;
  currentKey = dateKey;
  if (!stored?.[storageKey]) {
    await persistSummary(summary);
  }
  return summary;
}

function incrementMapCounter(
  map: Record<string, number>,
  key: string,
  increment = 1,
  limit = ANALYTICS_TOP_ITEM_LIMIT
) {
  if (!key) return;
  map[key] = (map[key] || 0) + increment;
  const entries = Object.entries(map).sort(([, a], [, b]) => b - a);
  if (entries.length > limit) {
    entries.length = limit;
  }
  const trimmed = Object.fromEntries(entries);
  Object.keys(map).forEach((existing) => {
    if (!(existing in trimmed)) {
      delete map[existing];
    }
  });
  Object.assign(map, trimmed);
}

function trimDomainStats(map: Record<string, DomainUsageStats>, limit: number) {
  const entries = Object.entries(map);
  if (entries.length <= limit) {
    return;
  }
  entries.sort(([, a], [, b]) => (b?.minutes ?? 0) - (a?.minutes ?? 0));
  const keep = new Set(entries.slice(0, limit).map(([domain]) => domain));
  Object.keys(map).forEach((domain) => {
    if (!keep.has(domain)) {
      delete map[domain];
    }
  });
}

function trimNumericMap(map: Record<string, number>, limit: number) {
  const entries = Object.entries(map);
  if (entries.length <= limit) {
    return;
  }
  entries.sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  const keep = new Set(entries.slice(0, limit).map(([key]) => key));
  Object.keys(map).forEach((key) => {
    if (!keep.has(key)) {
      delete map[key];
    }
  });
}

function trimFeatureUsageMap(map: Record<string, FeatureUsageEntry>, limit: number) {
  const entries = Object.entries(map);
  if (entries.length <= limit) {
    return;
  }
  entries.sort(([, a], [, b]) => (b.count ?? 0) - (a.count ?? 0));
  const keep = new Set(entries.slice(0, limit).map(([key]) => key));
  Object.keys(map).forEach((key) => {
    if (!keep.has(key)) {
      delete map[key];
    }
  });
}

function updateDomainStats(summary: DailySummary, domain: string, seconds: number) {
  if (!domain || seconds <= 0) return;
  const minutes = seconds / 60;
  const now = nowIso();
  const stats: DomainUsageStats = summary.perDomain[domain] || {
    minutes: 0,
    visits: 0,
  };
  stats.minutes += minutes;
  stats.visits += 1;
  stats.firstVisit ??= now;
  stats.lastVisit = now;
  summary.perDomain[domain] = stats;
  trimDomainStats(summary.perDomain, MAX_DOMAIN_STATS);

  summary.totalUniqueSitesVisited = Object.keys(summary.perDomain).length;
  summary.totalActiveMinutes = Object.values(summary.perDomain).reduce(
    (acc, domainStats) => acc + (domainStats?.minutes ?? 0),
    0
  );
  summary.totalMinutes = Math.max(summary.totalMinutes, summary.totalActiveMinutes);
  summary.firstActivityAt ??= now;
  summary.lastActivityAt = now;
}

export async function recordDomainUsage(domain: string, seconds: number) {
  if (!isAnalyticsConsentGranted()) return;
  const summary = await ensureSummary();
  updateDomainStats(summary, domain, seconds);
  await persistSummary(summary);
}

export async function recordSearchInsights(
  keywords: string[],
  categories: string[],
  timestamp?: string
) {
  if (!isAnalyticsConsentGranted()) return;
  const summary = await ensureSummary();
  const ts = timestamp ?? nowIso();

  keywords.forEach((keyword) => incrementMapCounter(summary.searchInsights.topQueries, keyword));
  categories.forEach((category) =>
    incrementMapCounter(summary.searchInsights.categorizedQueries, category)
  );

  summary.searchInsights.lastSearchedAt = ts;
  await persistSummary(summary);
}

export async function recordContentAggregate(payload: ContentAggregatePayload & { domain?: string }) {
  if (!isAnalyticsConsentGranted()) return;
  const summary = await ensureSummary();
  const ts = nowIso();
  const domain = payload.domain;

  if (domain) {
    incrementMapCounter(summary.contentInsights.topDomainsConsumed, domain);
  }

  (payload.categories || []).forEach((category) =>
    incrementMapCounter(summary.contentInsights.categorizedContent, category)
  );
  (payload.keywords || []).forEach((keyword) =>
    incrementMapCounter(summary.contentInsights.topContentKeywords, keyword)
  );

  if (typeof payload.estimatedTimeSpent === "number" && domain) {
    updateDomainStats(summary, domain, payload.estimatedTimeSpent);
  }

  summary.contentInsights.lastConsumedAt = ts;
  await persistSummary(summary);
}

export async function incrementToggleUsage(flag: string) {
  if (!isAnalyticsConsentGranted()) return;
  const summary = await ensureSummary();
  summary.toggles[flag] = (summary.toggles[flag] || 0) + 1;
  trimNumericMap(summary.toggles, MAX_TOGGLE_ENTRIES);
  await persistSummary(summary);
}

export async function incrementFeatureUsage(feature: string, timeSpentSeconds?: number) {
  if (!isAnalyticsConsentGranted()) return;
  const summary = await ensureSummary();
  const featureEntry = summary.featureUsage[feature] || { count: 0 };
  featureEntry.count += 1;
  if (typeof timeSpentSeconds === "number") {
    featureEntry.totalTime = (featureEntry.totalTime || 0) + timeSpentSeconds / 60;
  }
  summary.featureUsage[feature] = featureEntry;
  trimFeatureUsageMap(summary.featureUsage, MAX_FEATURE_USAGE_ENTRIES);
  await persistSummary(summary);
}

export async function getDailySummarySnapshot(): Promise<DailySummary> {
  const summary = await ensureSummary();
  return JSON.parse(JSON.stringify(summary));
}

export async function rolloverDailySummaryIfNeeded(): Promise<DailySummary | null> {
  const today = getDateKey();
  if (!cachedSummary) {
    await ensureSummary(today);
    return null;
  }

  if (cachedSummary.date === today) {
    return null;
  }

  await persistSummary(cachedSummary);
  const previous = JSON.parse(JSON.stringify(cachedSummary));
  cachedSummary = null;
  currentKey = null;
  await ensureSummary(today);
  return previous;
}

export function getCachedDailySummary(): DailySummary | null {
  return cachedSummary ? JSON.parse(JSON.stringify(cachedSummary)) : null;
}

export async function readDailySummaryForDate(dateKey: string): Promise<DailySummary | null> {
  const storageKey = getStorageKey(dateKey);
  const stored = await chrome.storage.local.get(storageKey);
  return stored?.[storageKey] ?? null;
}

export function getCurrentSummaryDate(): string {
  return getDateKey();
}
