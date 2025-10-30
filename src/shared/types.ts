// src/shared/types.ts

/* =========================
 * Utilitários básicos
 * ========================= */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [k: string]: JSONValue };
export type JSONArray = JSONValue[];

export type RFC3339String = string;
export type ISODateString = string;

export type MessageId = Brand<string, "MessageId">;
export type UserId = Brand<string, "UserId">;
export type Domain = Brand<string, "Domain">;

export type Nullable<T> = T | null;
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type NonEmptyArray<T> = [T, ...T[]];

/* =========================
 * Domínio: Bloqueios / Limites / Uso
 * ========================= */

export interface BlacklistEntry {
  domain: Domain;
  addedAt: RFC3339String;
  addedBy?: UserId;
}

export interface TimeLimitEntry {
  domain: Domain;
  dailyMinutes: number;
  lastResetAt?: RFC3339String;
  // Legacy compatibility
  limitMinutes?: number;
}

export interface DailyUsage {
  date: ISODateString;
  totalMinutes: number;
  perDomain: Record<string, number>;
}

/* =========================
 * Domínio: Pomodoro
 * ========================= */

export type PomodoroPhase = "idle" | "focus" | "focus_complete" | "short_break" | "long_break";

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
}

export interface PomodoroState {
  phase: PomodoroPhase;
  isPaused: boolean;
  cycleIndex: number;
  startedAt?: RFC3339String;
  endsAt?: RFC3339String;
  remainingMs?: number;
  pausedAt?: RFC3339String; // Novo: timestamp quando pausou
  pendingBreakType?: "short" | "long"; // Novo: tipo de break aguardando início
}

/* =========================
 * Domínio: Análise/Customização de conteúdo
 * ========================= */

export interface ContentAnalysisResult {
  score: number; // 0..1
  categories: Record<string, number>;
  flagged: boolean;
  details?: string;
  // Compatibility fields used in some modules
  classification?: "distracting" | "neutral" | "productive";
  url?: string;
}

export interface YouTubeCustomization {
  hideHomepage: boolean;
  hideShorts: boolean;
  hideComments: boolean;
  hideRecommendations: boolean;
}
export type SiteCustomization = YouTubeCustomization;
export type SiteCustomizationMap = Record<string, SiteCustomization>;

/* =========================
 * Configurações do usuário
 * ========================= */

export interface UserSettings {
  theme: "system" | "light" | "dark";
  language?: string;
  blockMode: "soft" | "strict";
  notifications: boolean;
  syncWithCloud: boolean;
  timezone?: string;
  telemetry?: boolean;
  debugDNR?: boolean; // Debug flag for DNR (Declarative Net Request) operations
  // Backward compatibility - UI currently references these in places
  analyticsConsent?: boolean;
  notificationsEnabled?: boolean;
  productiveKeywords?: string[];
  distractingKeywords?: string[];
}

/* =========================
 * Estado global da aplicação
 * ========================= */

export interface AppState {
  isLoading: boolean;
  error: Nullable<string>;
  blacklist: string[];
  timeLimits: TimeLimitEntry[];
  dailyUsage: Record<string, DailyUsage>;
  siteCustomizations: SiteCustomizationMap;
  pomodoro: {
    config: PomodoroConfig;
    state: PomodoroState;
  };
  settings: UserSettings;
}

/* =========================
 * Mensageria (MV3) — UI <-> SW
 * ========================= */

export type ContextSource =
  | "service-worker"
  | "panel-ui"
  | "popup-ui"
  | "content-script";

export const MESSAGE = {
  // Estado
  GET_INITIAL_STATE: "GET_INITIAL_STATE",
  STATE_GET: "STATE_GET",
  STATE_UPDATED: "STATE_UPDATED",
  STATE_PATCH: "STATE_PATCH",

  // Blacklist
  ADD_TO_BLACKLIST: "ADD_TO_BLACKLIST",
  REMOVE_FROM_BLACKLIST: "REMOVE_FROM_BLACKLIST",

  // Limites de tempo
  TIME_LIMIT_SET: "TIME_LIMIT_SET",
  TIME_LIMIT_REMOVE: "TIME_LIMIT_REMOVE",

  // Customização de sites
  SITE_CUSTOMIZATION_UPDATED: "SITE_CUSTOMIZATION_UPDATED",

  // Pomodoro
  POMODORO_START: "POMODORO_START",
  POMODORO_PAUSE: "POMODORO_PAUSE",
  POMODORO_RESUME: "POMODORO_RESUME",
  POMODORO_STOP: "POMODORO_STOP",
  START_BREAK: "START_BREAK",

  // Sinalização/diagnóstico
  PING: "PING",
  PONG: "PONG",
  ERROR: "ERROR",

  // Content analysis / other
  CONTENT_ANALYSIS_RESULT: "CONTENT_ANALYSIS_RESULT",
  TOGGLE_ZEN_MODE: "TOGGLE_ZEN_MODE",
} as const;

export type MessageType = typeof MESSAGE[keyof typeof MESSAGE];

export interface BaseMessage<T extends MessageType = MessageType, P = unknown> {
  type: T;
  id: MessageId;
  source: ContextSource;
  ts: number; // epoch ms
  payload?: P;
  
  /**
   * Se true, o Service Worker NÃO emitirá STATE_UPDATED após processar.
   * 
   * USE APENAS quando:
   * - A UI que enviou já fez update otimista do seu estado
   * - A operação é parte de um batch (evitar múltiplas broadcasts)
   * 
   * CUIDADO: Outras UIs abertas NÃO serão notificadas se usar skipNotify!
   * 
   * Exemplos corretos de uso:
   * - addToBlacklist: true (UI já atualizou lista localmente)
   * - removeFromBlacklist: true (UI já removeu localmente)
   * - updateSettings: true (UI já aplicou mudanças)
   * 
   * Exemplos onde NÃO usar:
   * - startPomodoro: false (timer gerenciado pelo backend)
   * - setTimeLimit: false (pode causar bloqueio imediato)
   * - toggleZenMode: false (afeta outras UIs)
   */
  skipNotify?: boolean;
}

/* ===== Payloads ===== */

export interface StateUpdatedPayload { state: AppState; }
export interface StatePatchPayload { patch: DeepPartial<AppState>; }

export interface AddToBlacklistPayload { domain: string; }
export interface RemoveFromBlacklistPayload { domain: string; }

export interface TimeLimitSetPayload extends TimeLimitEntry {}
export interface TimeLimitRemovePayload { domain: string; }

export interface SiteCustomizationUpdatedPayload {
  domain: string; // ex.: "youtube.com"
  config: YouTubeCustomization;
}

export interface PomodoroStartPayload {
  config?: Partial<PomodoroConfig>;
  focusMinutesOverride?: number;
}
export type PomodoroSimplePayload = Record<string, never>;

// Ampliado: aceita payload antigo (direto) ou novo ({ result })
export type ContentAnalysisResultPayload =
  | ContentAnalysisResult
  | { result: ContentAnalysisResult };

export interface ToggleZenPayload { preset?: string }

export interface ErrorPayload { code: string; message: string; details?: JSONValue; }
export type PingPayload = { echo?: JSONValue };
export type PongPayload = { echo?: JSONValue };

/* ===== Mensagens (unions discriminadas) ===== */

export type Message =
  | BaseMessage<typeof MESSAGE.GET_INITIAL_STATE>
  | BaseMessage<typeof MESSAGE.STATE_GET>
  | BaseMessage<typeof MESSAGE.STATE_UPDATED, StateUpdatedPayload>
  | BaseMessage<typeof MESSAGE.STATE_PATCH, StatePatchPayload>
  | BaseMessage<typeof MESSAGE.ADD_TO_BLACKLIST, AddToBlacklistPayload>
  | BaseMessage<typeof MESSAGE.REMOVE_FROM_BLACKLIST, RemoveFromBlacklistPayload>
  | BaseMessage<typeof MESSAGE.TIME_LIMIT_SET, TimeLimitSetPayload>
  | BaseMessage<typeof MESSAGE.TIME_LIMIT_REMOVE, TimeLimitRemovePayload>
  | BaseMessage<typeof MESSAGE.SITE_CUSTOMIZATION_UPDATED, SiteCustomizationUpdatedPayload>
  | BaseMessage<typeof MESSAGE.POMODORO_START, PomodoroStartPayload>
  | BaseMessage<typeof MESSAGE.POMODORO_PAUSE, PomodoroSimplePayload>
  | BaseMessage<typeof MESSAGE.POMODORO_RESUME, PomodoroSimplePayload>
  | BaseMessage<typeof MESSAGE.POMODORO_STOP, PomodoroSimplePayload>
  | BaseMessage<typeof MESSAGE.START_BREAK, PomodoroSimplePayload>
  | BaseMessage<typeof MESSAGE.PING, PingPayload>
  | BaseMessage<typeof MESSAGE.PONG, PongPayload>
  | BaseMessage<typeof MESSAGE.ERROR, ErrorPayload>
  | BaseMessage<typeof MESSAGE.CONTENT_ANALYSIS_RESULT, ContentAnalysisResultPayload>
  | BaseMessage<typeof MESSAGE.TOGGLE_ZEN_MODE, ToggleZenPayload>;

/** Respostas opcionais do SW (shape genérico) */
export type MessageResponse<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: ErrorPayload };

/* =========================
 * Storage (chaves canônicas)
 * ========================= */

export type StorageKey =
  | "blacklist"
  | "timeLimits"
  | "dailyUsage"
  | "siteCustomizations"
  | "pomodoro"
  | "settings";

export type StorageSnapshot = Partial<{
  blacklist: string[];
  timeLimits: TimeLimitEntry[];
  dailyUsage: Record<string, DailyUsage>;
  siteCustomizations: SiteCustomizationMap;
  pomodoro: { config: PomodoroConfig; state: PomodoroState };
  settings: UserSettings;
}>;

/* =========================
 * Firebase (modelos de dados)
 * ========================= */

export interface FirebaseUserProfile {
  uid: UserId;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: RFC3339String;
  lastLoginAt?: RFC3339String;
  pro?: boolean;
}

export interface FirebaseDailySummary {
  uid: UserId;
  date: ISODateString;
  totalMinutes: number;
  perDomain: Record<string, number>;
}

/* =========================
 * Type Guards helpers
 * ========================= */

export function isMessageOfType<T extends MessageType>(
  msg: Message,
  type: T
): msg is Extract<Message, { type: T }> {
  return msg?.type === type;
}

export function isJsonValue(_: unknown): _ is JSONValue {
  return _ !== undefined && typeof _ !== "function";
}
