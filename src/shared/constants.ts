// Constantes de chaves para o chrome.storage
export const STORAGE_KEYS = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking", // Chave para persistir a aba ativa na sessão
} as const;

// SUGESTÃO APLICADA: Exporta o tipo de chave para utilitários genéricos.
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Nomes dos alarmes para o chrome.alarms
export const ALARM_NAMES = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm",
} as const;

// Configurações padrão do usuário
import type { UserSettings } from "./types";

export const DEFAULT_SETTINGS: UserSettings = {
  // Core settings matching UserSettings
  theme: "system",
  blockMode: "soft",
  notifications: true,
  syncWithCloud: false,
  language: "pt-BR",
  telemetry: false,
  debugDNR: false, // Default to false for production
  debugTracking: false, // Debug usage tracking
  debugContentAnalysis: false, // Debug content analysis
  debugPomodoro: false, // Debug Pomodoro timer
  debugZenMode: false, // Debug Zen Mode
  productiveKeywords: [
    "tutorial", "documentation", "study", "learn", "course", "education", "research", 
    "guide", "reference", "manual", "academic", "scholarly", "textbook", "lecture",
    "workshop", "seminar", "training", "skill", "development", "programming", "coding",
    "technical", "professional", "business", "finance", "economics", "science", "math"
  ],
  distractingKeywords: [
    "news", "entertainment", "game", "social", "video", "trending", "viral", 
    "celebrity", "gossip", "meme", "funny", "joke", "comedy", "music", "movie",
    "sports", "gaming", "shopping", "fashion", "beauty", "lifestyle", "travel",
    "food", "recipe", "cooking", "diy", "craft", "art", "design", "photography"
  ],
  // Configurable suppression window (in minutes)
  contentAnalysisSuppressionMinutes: 30, // Default 30 minutes for testing
  // Backward compat
  analyticsConsent: false,
  notificationsEnabled: true,
};

// Configuração padrão do Pomodoro
export const DEFAULT_POMODORO_CONFIG = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
};

// Constantes para a análise de conteúdo
export const CONTENT_ANALYSIS_THRESHOLD = 0.5; // Limite de 50% para considerar distrativo
export const MAX_TEXT_LENGTH = 10000; // Analisar os primeiros 10000 caracteres

// Intervalo do rastreador de uso em minutos (reduzido para melhor consistência)
export const USAGE_TRACKER_INTERVAL = 0.5; // 30 segundos
