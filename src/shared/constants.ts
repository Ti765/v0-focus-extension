// Constantes de chaves para o chrome.storage
export const STORAGE_KEYS = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations", // Renomeado de ZEN_MODE_PRESETS
  SETTINGS: "settings",
} as const;

// Nomes dos alarmes para o chrome.alarms
export const ALARM_NAMES = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm",
} as const;

// Configurações padrão do usuário
export const DEFAULT_SETTINGS = {
  analyticsConsent: false,
  productiveKeywords: [
    "tutorial", "documentation", "study", "learn", "course",
    "education", "research", "guide", "reference", "manual",
  ],
  distractingKeywords: [
    "news", "entertainment", "game", "social", "video",
    "trending", "viral", "celebrity", "gossip", "meme",
  ],
  notificationsEnabled: true,
};

// Configuração padrão do Pomodoro
export const DEFAULT_POMODORO_CONFIG = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  adaptiveMode: false,
};

// Constantes para a análise de conteúdo
export const CONTENT_ANALYSIS_THRESHOLD = 0.5; // Limite de 50% para considerar distrativo
export const MAX_TEXT_LENGTH = 10000; // Analisar os primeiros 10000 caracteres

// Intervalo do rastreador de uso em minutos
export const USAGE_TRACKER_INTERVAL = 0.5; // 30 segundos
