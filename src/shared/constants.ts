export const STORAGE_KEYS = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  ZEN_MODE_PRESETS: "zenModePresets",
  SETTINGS: "settings",
  ACTIVE_TAB_START: "activeTabStart",
} as const

export const ALARM_NAMES = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm",
} as const

export const DEFAULT_SETTINGS = {
  analyticsConsent: false,
  productiveKeywords: [
    "tutorial",
    "documentation",
    "study",
    "learn",
    "course",
    "education",
    "research",
    "guide",
    "reference",
    "manual",
  ],
  distractingKeywords: [
    "news",
    "entertainment",
    "game",
    "social",
    "video",
    "trending",
    "viral",
    "celebrity",
    "gossip",
    "meme",
  ],
  notificationsEnabled: true,
}

export const DEFAULT_POMODORO_CONFIG = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  adaptiveMode: false,
}

export const CONTENT_ANALYSIS_THRESHOLD = 0.5 // 50% distraction score
export const MAX_TEXT_LENGTH = 10000 // characters to analyze
export const USAGE_TRACKER_INTERVAL = 0.5 // minutes (30 seconds)
