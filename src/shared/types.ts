// Message types for inter-component communication
export type MessageType =
  | "GET_INITIAL_STATE"
  | "STATE_UPDATED"
  | "ADD_TO_BLACKLIST"
  | "REMOVE_FROM_BLACKLIST"
  | "START_POMODORO"
  | "STOP_POMODORO"
  | "CONTENT_ANALYSIS_RESULT"
  | "TOGGLE_ZEN_MODE"
  | "SET_TIME_LIMIT"
  | "UPDATE_SETTINGS"
  | "SITE_CUSTOMIZATION_UPDATED"

export interface Message<T = any> {
  type: MessageType
  payload?: T
}

// Pomodoro states
export type PomodoroState = "IDLE" | "FOCUS" | "BREAK"

export interface PomodoroConfig {
  focusMinutes: number
  breakMinutes: number
  longBreakMinutes: number
  cyclesBeforeLongBreak: number
  adaptiveMode: boolean
}

export interface PomodoroStatus {
  state: PomodoroState
  timeRemaining: number
  currentCycle: number
  config: PomodoroConfig
}

// Blacklist and time tracking
export interface BlacklistEntry {
  domain: string
  addedAt: number
}

export interface TimeLimitEntry {
  domain: string
  limitMinutes: number
}

export interface DomainUsage {
  [domain: string]: number // time in seconds
}

export interface DailyUsage {
  [date: string]: DomainUsage
}

// Content analysis
export interface ContentAnalysisResult {
  url: string
  classification: "productive" | "distracting" | "neutral"
  score: number
  timestamp: number
}

// Zen mode
export interface ZenModePreset {
  domain: string
  selectorsToRemove: string[]
}

// Site customization types
export interface SiteCustomization {
  [domain: string]: {
    [key: string]: boolean
  }
}

export interface YouTubeCustomization {
  hideHomepage: boolean
  hideShorts: boolean
  hideComments: boolean
  hideRecommendations: boolean
}

// App state
export interface AppState {
  blacklist: BlacklistEntry[]
  timeLimits: TimeLimitEntry[]
  dailyUsage: DailyUsage
  pomodoro: PomodoroStatus
  zenModePresets: ZenModePreset[]
  settings: UserSettings
  siteCustomizations: SiteCustomization
}

export interface UserSettings {
  analyticsConsent: boolean
  productiveKeywords: string[]
  distractingKeywords: string[]
  notificationsEnabled: boolean
}

// Firebase data model
export interface FirebaseUserProfile {
  createdAt: number
  consentGivenAt: number
  appVersion: string
  userProperties?: {
    ageRange?: string
    goals?: string
  }
}

export interface FirebaseDailySummary {
  totalFocusTime: number
  pomodorosCompleted: number
  topDistractingSites: Array<{
    domain: string
    time: number
  }>
}
