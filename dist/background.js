const s = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, p = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, T = {
  // Core settings matching UserSettings
  theme: "system",
  blockMode: "soft",
  notifications: !0,
  syncWithCloud: !1,
  language: "pt-BR",
  telemetry: !1,
  debugDNR: !1,
  // Default to false for production
  debugTracking: !1,
  // Debug usage tracking
  debugContentAnalysis: !1,
  // Debug content analysis
  debugPomodoro: !1,
  // Debug Pomodoro timer
  debugZenMode: !1,
  // Debug Zen Mode
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
    "academic",
    "scholarly",
    "textbook",
    "lecture",
    "workshop",
    "seminar",
    "training",
    "skill",
    "development",
    "programming",
    "coding",
    "technical",
    "professional",
    "business",
    "finance",
    "economics",
    "science",
    "math"
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
    "funny",
    "joke",
    "comedy",
    "music",
    "movie",
    "sports",
    "gaming",
    "shopping",
    "fashion",
    "beauty",
    "lifestyle",
    "travel",
    "food",
    "recipe",
    "cooking",
    "diy",
    "craft",
    "art",
    "design",
    "photography"
  ],
  // Configurable suppression window (in minutes)
  contentAnalysisSuppressionMinutes: 30,
  // Default 30 minutes for testing
  // Backward compat
  analyticsConsent: !1,
  notificationsEnabled: !0
}, w = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, he = 0.5, P = 0.5, f = {
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
  TOGGLE_ZEN_MODE: "TOGGLE_ZEN_MODE"
};
function O(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function C(e) {
  if (!e) return "";
  try {
    const o = new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, ""), n = o.split("."), a = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const i of a)
      if (o.endsWith(`.${i}`))
        return o.split(".").slice(-3).join(".");
    return n.slice(-2).join(".");
  } catch {
    const t = e.replace(/^www\./, "").split("/")[0], o = t.split("."), n = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const a of n)
      if (t.endsWith(`.${a}`))
        return t.split(".").slice(-3).join(".");
    return o.slice(-2).join(".");
  }
}
function B(e) {
  return `||${e}`;
}
async function X() {
  try {
    const t = (await chrome.storage.sync.get(s.SETTINGS))[s.SETTINGS] || T;
    return {
      debugDNR: t.debugDNR ?? T.debugDNR ?? !1,
      debugTracking: t.debugTracking ?? T.debugTracking ?? !1,
      debugContentAnalysis: t.debugContentAnalysis ?? T.debugContentAnalysis ?? !1,
      debugPomodoro: t.debugPomodoro ?? T.debugPomodoro ?? !1,
      debugZenMode: t.debugZenMode ?? T.debugZenMode ?? !1
    };
  } catch (e) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", e), {
      debugDNR: !1,
      debugTracking: !1,
      debugContentAnalysis: !1,
      debugPomodoro: !1,
      debugZenMode: !1
    };
  }
}
async function ee() {
  return (await X()).debugDNR;
}
let G = null;
function ye() {
  return G === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : G;
}
async function te() {
  G = await X();
}
function E() {
  return ye().debugTracking;
}
let k = null, Z = !1, H = !1;
const pe = 3e3, Te = 1e3;
function F(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const a = e.charCodeAt(n);
    t = (t << 5) - t + a, t |= 0;
  }
  const o = Math.abs(t) % Te;
  return pe + o;
}
async function Re() {
  if (H) return;
  H = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(p.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), n = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(p.DAILY_SYNC, {
    when: n,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(n - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (a) => {
    a.name === p.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await Se());
  });
}
async function Se() {
  const { [s.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((o) => F(o.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (o) {
      console.error("[v0] Error clearing time limit session rules:", o);
    }
}
async function De() {
  Z || (Z = !0, console.log("[v0] Initializing usage tracker module"), await te(), await chrome.alarms.clear(p.USAGE_TRACKER), await chrome.alarms.create(p.USAGE_TRACKER, {
    periodInMinutes: P
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === p.USAGE_TRACKER && await _();
  }), chrome.tabs.onActivated.addListener(we), chrome.tabs.onUpdated.addListener(ve), chrome.windows.onFocusChanged.addListener(Ee), await oe());
}
async function we(e) {
  await _();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await x(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await A();
  }
}
async function ve(e, t) {
  e === k && t.url && t.status === "complete" && (await _(), await x(e, t.url));
}
async function Ee(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await _(), await A()) : await oe();
}
async function oe() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await x(e.id, e.url) : await A();
}
async function x(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await A();
    return;
  }
  k = e;
  const o = Date.now(), n = {
    url: t,
    startTime: o,
    lastUpdate: o
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [s.CURRENTLY_TRACKING]: n });
}
async function A() {
  k = null, await chrome.storage.session.remove(s.CURRENTLY_TRACKING);
}
async function _() {
  const t = (await chrome.storage.session.get(s.CURRENTLY_TRACKING))[s.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    E() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const o = C(t.url);
  if (!o) {
    E() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await A();
    return;
  }
  const n = Date.now(), a = Math.floor((n - t.startTime) / 1e3), i = t.lastUpdate || t.startTime, r = n - i, c = P * 60 * 1e3 * 2;
  if (r > c && (E() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(r / 1e3),
    maxGapMs: Math.floor(c / 1e3),
    domain: o,
    url: t.url
  }), t.startTime = n - P * 60 * 1e3), E() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: o,
    timeSpent: a,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: r > c
  }), t.startTime = n, t.lastUpdate = n, await chrome.storage.session.set({ [s.CURRENTLY_TRACKING]: t }), a < 1) {
    E() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const d = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [s.DAILY_USAGE]: g = {} } = await chrome.storage.local.get(
    s.DAILY_USAGE
  ), l = {
    ...g,
    [d]: g[d] || {
      date: d,
      totalMinutes: 0,
      perDomain: {}
    }
  };
  l[d].perDomain || (l[d].perDomain = {}), l[d].perDomain[o] = (l[d].perDomain[o] || 0) + a, l[d].totalMinutes = Object.values(l[d].perDomain).reduce((m, R) => m + R, 0) / 60, await chrome.storage.local.set({ [s.DAILY_USAGE]: l }), console.log("[v0] Recorded usage:", o, a, "seconds"), await y(), await ne(o, l[d].perDomain[o]);
}
async function ne(e, t) {
  const { [s.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  ), a = (Array.isArray(o) ? o : []).find((c) => c.domain === e);
  if (!a) return;
  const i = a.dailyMinutes ?? a.limitMinutes ?? 0, r = i * 60;
  if (t >= r) {
    const c = F(e);
    try {
      E() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: r,
        limitMinutes: i,
        exceeded: t >= r
      });
      const d = B(e), g = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
      console.log("[v0] Time limit rule debug:", {
        domain: e,
        urlFilter: d,
        blockedPageUrl: g,
        ruleId: c,
        totalSecondsToday: t,
        limitSeconds: r,
        redirectUrl: g
      });
      try {
        const u = new URL(g);
        console.log("[v0] Blocked page URL validation:", {
          isValid: !0,
          protocol: u.protocol,
          hostname: u.hostname,
          pathname: u.pathname,
          search: u.search
        });
      } catch (u) {
        console.error("[v0] Invalid blocked page URL:", g, u);
      }
      const l = {
        id: c,
        priority: 10,
        // Increased from 3 to 10 to ensure it overrides other rules
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: g
          }
        },
        condition: {
          urlFilter: d,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, m = await ee();
      m && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: l.id,
        urlFilter: l.condition.urlFilter,
        domain: e,
        totalSecondsToday: t,
        limitSeconds: r
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [c],
        // remove se já existir
        addRules: [l]
      });
      try {
        const u = await chrome.tabs.query({ active: !0, currentWindow: !0 });
        u.length > 0 && u[0].id && u[0].url && C(u[0].url) === e && (await chrome.tabs.update(u[0].id, { url: g }), console.log(`[v0] Redirected active tab ${u[0].id} to blocked page for ${e}`), E() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
          tabId: u[0].id,
          fromUrl: u[0].url,
          toUrl: g,
          domain: e
        }));
      } catch (u) {
        console.warn(`[v0] Could not redirect active tab for ${e}:`, u);
      }
      const R = await chrome.declarativeNetRequest.getSessionRules();
      console.log("[v0] Session rules after time limit rule creation:", {
        totalRules: R.length,
        timeLimitRule: R.find((u) => u.id === c),
        allRuleIds: R.map((u) => u.id)
      }), m && (console.log("[DNR-DEBUG] All session rules after time limit:", R), console.log("[DNR-DEBUG] Session rules by domain:", R.map((u) => ({
        id: u.id,
        urlFilter: u.condition.urlFilter || u.condition.regexFilter,
        priority: u.priority
      })))), console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${c} added.`
      );
      const { createNotification: b } = await Promise.resolve().then(() => N);
      await b({
        notificationId: `limit-exceeded-${e}`,
        type: "basic",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${i} minutos em ${e} hoje.`
      });
    } catch (d) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, d);
    }
  }
}
async function Ie(e, t) {
  const o = O(e);
  if (!o) return;
  const { [s.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  ), a = Array.isArray(n) ? n : [], i = a.findIndex((c) => c.domain === o), r = F(o);
  if (t > 0) {
    if (i >= 0)
      a[i].dailyMinutes = t;
    else {
      const l = (m) => m;
      a.push({ domain: l(o), dailyMinutes: t });
    }
    const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [s.DAILY_USAGE]: d = {} } = await chrome.storage.local.get(
      s.DAILY_USAGE
    ), g = d?.[c]?.perDomain?.[o] || 0;
    if (g >= t * 60)
      await ne(o, g);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
      } catch {
      }
  } else if (i >= 0) {
    a.splice(i, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${o}`);
  }
  await chrome.storage.local.set({ [s.TIME_LIMITS]: a }), await y(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const I = "__contentSuggestNotified__", Oe = 24 * 60 * 60 * 1e3;
async function ae() {
  try {
    const { [s.SETTINGS]: e } = await chrome.storage.sync.get(s.SETTINGS);
    return (e?.contentAnalysisSuppressionMinutes || 24 * 60) * 60 * 1e3;
  } catch {
    return Oe;
  }
}
async function Ae() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [I]: e = {} } = await chrome.storage.session.get(I), t = Date.now(), o = await ae();
    let n = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || t - e[a] > o) && (delete e[a], n = !0);
    n && await chrome.storage.session.set({ [I]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function be(e) {
  try {
    const t = await ae(), { [I]: o = {} } = await chrome.storage.session.get(I), n = o?.[e], a = Date.now();
    return n && a - n < t ? !1 : (await chrome.storage.session.set({
      [I]: { ...o || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function Me(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await Ue() || !(e.classification === "distracting" && e.score > he) || !e?.url) return;
    const t = C(e.url);
    if (!t) return;
    const { [s.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      s.BLACKLIST
    );
    if (o.some((i) => i.domain === t) || !await be(t))
      return;
    const { createNotification: a } = await Promise.resolve().then(() => N);
    await a({
      notificationId: `suggest-block-${t}`,
      type: "basic",
      title: "Site Potencialmente Distrativo",
      message: `${t} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
      buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }]
      // Você pode manter a notificação até interação do usuário, se quiser:
      // requireInteraction: true,
      // priority: 0,
    });
  } catch (t) {
    console.error("[v0] Error while handling content analysis result:", t);
  }
}
let V = "";
async function y() {
  try {
    const e = await z(), t = JSON.stringify(e, (o, n) => {
      if (n && typeof n == "object" && !Array.isArray(n)) {
        const a = {};
        return Object.keys(n).sort().forEach((i) => {
          a[i] = n[i];
        }), a;
      }
      return n;
    });
    if (t === V)
      return;
    V = t, chrome.runtime.sendMessage({ type: f.STATE_UPDATED, payload: { state: e } }, (o) => {
      const n = chrome.runtime.lastError, a = n?.message ?? "", r = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((c) => a === c || a.startsWith(c));
      n && !r && console.warn("[v0] notifyStateUpdate lastError:", n.message);
    });
    try {
      for (const o of M)
        try {
          o.postMessage({ type: f.STATE_UPDATED, payload: { state: e } });
        } catch (n) {
          console.warn("[v0] Failed to post state to port:", n);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function Ue() {
  const { getNotificationSetting: e } = await Promise.resolve().then(() => N);
  return await e();
}
async function z() {
  const e = [
    s.BLACKLIST,
    s.TIME_LIMITS,
    s.DAILY_USAGE,
    s.POMODORO_STATUS,
    s.SITE_CUSTOMIZATIONS
  ], [t, o] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(s.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (t[s.BLACKLIST] || []).map((n) => typeof n == "string" ? n : typeof n == "object" && n !== null && "domain" in n ? String(n.domain) : String(n)),
    timeLimits: t[s.TIME_LIMITS] || [],
    dailyUsage: t[s.DAILY_USAGE] || {},
    pomodoro: t[s.POMODORO_STATUS] || {
      config: w,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[s.SITE_CUSTOMIZATIONS] || {},
    settings: o[s.SETTINGS] || T
  };
}
const M = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    M.add(e), z().then((t) => {
      try {
        e.postMessage({ type: f.STATE_UPDATED, payload: { state: t } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      M.delete(e);
    });
  } catch {
    try {
      M.delete(e);
    } catch {
    }
  }
});
async function _e(e, t) {
  switch (console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", t), e.type) {
    case f.GET_INITIAL_STATE:
      return await z();
    case f.ADD_TO_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await $(o), await y(), { success: !0 };
    }
    case f.REMOVE_FROM_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await re(o), await y(), { success: !0 };
    }
    case f.POMODORO_START: {
      const o = e.payload;
      console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(o)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(o?.config));
      const n = o?.config || o;
      return console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(n)), await Ge(n), { success: !0 };
    }
    case f.POMODORO_STOP:
      return await ge(), { success: !0 };
    case f.POMODORO_PAUSE:
      return await Ce(), { success: !0 };
    case f.POMODORO_RESUME:
      return await Be(), { success: !0 };
    case f.START_BREAK:
      return await me(), { success: !0 };
    case f.TIME_LIMIT_SET: {
      const o = e.payload, n = o?.domain, a = o?.dailyMinutes ?? o?.limitMinutes;
      return typeof n == "string" && typeof a == "number" && await Ie(n, a), await y(), { success: !0 };
    }
    case f.CONTENT_ANALYSIS_RESULT:
      return await Me(e.payload?.result), await y(), { success: !0 };
    case f.STATE_PATCH: {
      const o = e.payload ?? {}, n = o.patch?.settings ?? o.settings ?? o;
      if (!n || typeof n != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [s.SETTINGS]: a } = await chrome.storage.sync.get(s.SETTINGS), i = { ...a ?? {}, ...n ?? {} }, r = JSON.stringify(a ?? {}), c = JSON.stringify(i);
      return r === c ? { success: !0 } : (await chrome.storage.sync.set({ [s.SETTINGS]: i }), await y(), { success: !0 });
    }
    case f.SITE_CUSTOMIZATION_UPDATED: {
      const { [s.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(s.SITE_CUSTOMIZATIONS), n = e.payload;
      let a = { ...o ?? {} };
      return n && typeof n == "object" && !Array.isArray(n) && (n.domain && n.config ? a = { ...a, [String(n.domain)]: n.config } : a = { ...a, ...n }), await chrome.storage.local.set({ [s.SITE_CUSTOMIZATIONS]: a }), await y(), { success: !0 };
    }
    case f.TOGGLE_ZEN_MODE: {
      const [o] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (o?.id)
        try {
          await chrome.tabs.sendMessage(o.id, {
            type: f.TOGGLE_ZEN_MODE,
            payload: e.payload
          });
        } catch (n) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${o.id}. It may be a protected page or the content script wasn't injected.`,
            n
          );
        }
      return { success: !0 };
    }
    case f.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const o = e.type;
      throw new Error(`Unknown message type: ${o}`);
    }
  }
}
const S = 1e3, h = 2e3, v = 1e3, D = 1e4;
let L = Promise.resolve();
function K(e) {
  return L = L.then(e, e), L;
}
function J(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const a = e.charCodeAt(n);
    t = (t << 5) - t + a, t |= 0;
  }
  const o = Math.abs(t) % v;
  return h + o;
}
async function se() {
  console.log("[v0] Initializing blocker module"), await te(), await q();
}
async function ie() {
  console.log("[v0] Cleaning up all DNR rules...");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules();
    if (e.length > 0) {
      const o = e.map((n) => n.id);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: o
      }), console.log(`[v0] Removed ${o.length} dynamic rules:`, o);
    }
    const t = await chrome.declarativeNetRequest.getSessionRules();
    if (t.length > 0) {
      const o = t.map((n) => n.id);
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: o
      }), console.log(`[v0] Removed ${o.length} session rules:`, o);
    }
    console.log("[v0] DNR cleanup complete");
  } catch (e) {
    console.error("[v0] Error during DNR cleanup:", e);
  }
}
async function Ne() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules(), t = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${e.length}`), e.forEach((o) => {
      console.log(`  [${o.id}] priority=${o.priority} action=${o.action.type}`), console.log(`    urlFilter: ${o.condition.urlFilter || o.condition.regexFilter}`);
    }), console.log(`Session rules: ${t.length}`), t.forEach((o) => {
      console.log(`  [${o.id}] priority=${o.priority} action=${o.action.type}`), console.log(`    urlFilter: ${o.condition.urlFilter || o.condition.regexFilter}`);
    }), e.length > 0 && e[0].condition.regexFilter) {
      const o = new RegExp(e[0].condition.regexFilter), n = [
        "https://youtube.com",
        "https://youtube.com/",
        "https://www.youtube.com",
        "https://www.youtube.com/watch?v=test"
      ];
      console.log("Regex test results:"), n.forEach((a) => {
        console.log(`  ${o.test(a) ? "✅" : "❌"} ${a}`);
      });
    }
  } catch (e) {
    console.error("DNR debug failed:", e);
  }
  console.log("=== END DNR DEBUG ===");
}
async function $(e) {
  const o = (await chrome.storage.local.get(
    s.BLACKLIST
  ))[s.BLACKLIST] ?? [], n = O(e);
  if (!n) return;
  if (o.some((r) => r.domain === n)) {
    console.log("[v0] Domain already in blacklist:", n);
    return;
  }
  const a = (r) => r, i = [
    ...o,
    { domain: a(n), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const r = o;
    if (r.length === i.length && r.every((d, g) => d.domain === i[g].domain && d.addedAt === i[g].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [s.BLACKLIST]: i }), await q(), await y(), console.log("[v0] Added to blacklist:", n);
}
async function re(e) {
  const o = (await chrome.storage.local.get(
    s.BLACKLIST
  ))[s.BLACKLIST] ?? [], n = O(e);
  if (!n) return;
  const a = o.filter((i) => i.domain !== n);
  if (a.length !== o.length) {
    try {
      if (a.length === o.length && a.every((r, c) => r.domain === o[c].domain && r.addedAt === o[c].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [s.BLACKLIST]: a }), await q(), await y(), console.log("[v0] Removed from blacklist:", n);
  }
}
async function q() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [s.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    s.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), K(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const t = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", t.length, "existing DNR rules");
    const o = new Set(
      t.map((r) => r.id).filter(
        (r) => r >= h && r < h + v || r >= h + D && r < h + D + v
      )
    ), n = [], a = /* @__PURE__ */ new Set();
    for (const r of e) {
      const c = O(r.domain);
      if (!c) continue;
      let d = J(c), g = 0;
      const l = v;
      for (; a.has(d) || o.has(d); ) {
        if (g++, g >= l) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${c}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        d++, d >= h + v && (d = h);
      }
      if (g >= l) {
        console.warn(`[v0] Skipping rule for ${c} - no free ID found`);
        continue;
      }
      if (a.add(d), !o.has(d)) {
        const m = B(c);
        console.log("[v0] [DEBUG] Valid urlFilter for", c, ":", m);
        const R = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(c)}`);
        n.push({
          id: d,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: R
            }
          },
          condition: {
            urlFilter: m,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
        const b = d + D;
        o.has(b) || n.push({
          id: b,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
              { header: "cache-control", operation: "set", value: "no-store, no-cache, must-revalidate" },
              { header: "pragma", operation: "set", value: "no-cache" },
              { header: "expires", operation: "set", value: "0" }
            ]
          },
          condition: {
            urlFilter: m,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME
            ]
          }
        });
      }
    }
    const i = Array.from(o).filter(
      (r) => !a.has(r) && !a.has(r - D)
    );
    if (console.log("[v0] DEBUG: Rules to add:", n.length), console.log("[v0] DEBUG: Rules to remove:", i.length), n.length > 0 || i.length > 0) {
      const r = await ee();
      r && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((l) => l.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", n.map((l) => ({
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e.find((m) => J(m.domain) === l.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i)), console.log("[v0] DEBUG: Updating DNR rules...");
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: i,
          addRules: n
        }), console.log("[v0] DEBUG: DNR rules successfully applied");
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[v0] DEBUG: Current DNR rules count:", l.length), console.log("[v0] DEBUG: Current DNR rules:", l);
      } catch (l) {
        throw console.error("[v0] ERROR: DNR updateDynamicRules FAILED:", l), console.error("[v0] ERROR: Failed rules:", n), console.error("[v0] ERROR: Attempted to remove:", i), l;
      }
      const c = await chrome.declarativeNetRequest.getDynamicRules(), d = c.filter((l) => l.id >= h && l.id < h + v), g = c.filter((l) => l.id >= S && l.id < h);
      if (console.log(`[v0] DNR Verification: ${d.length} blacklist rules, ${g.length} pomodoro rules`), n.length > 0 && d.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), r) {
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", l), console.log("[DNR-DEBUG] Total rules count:", l.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: l.filter((m) => m.id >= S && m.id < h).length,
          blacklist: l.filter((m) => m.id >= h && m.id < h + v).length,
          other: l.filter((m) => m.id < S || m.id >= h + v).length
        });
      }
      console.log(
        "[v0] User blocking rules synced:",
        n.length,
        "rules added,",
        i.length,
        "rules removed."
      );
    } else
      console.log("[v0] User blocking rules already in sync.");
  });
}
async function Y() {
  const { [s.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    s.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = [];
  return e.forEach((o, n) => {
    const a = O(o.domain), i = B(a), r = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(a)}`);
    t.push({
      id: S + n,
      priority: 2,
      // acima das regras de usuário
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: r
        }
      },
      condition: {
        urlFilter: i,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
      }
    }), t.push({
      id: S + n + D,
      priority: 2,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        responseHeaders: [
          { header: "cache-control", operation: "set", value: "no-store, no-cache, must-revalidate" },
          { header: "pragma", operation: "set", value: "no-cache" },
          { header: "expires", operation: "set", value: "0" }
        ]
      },
      condition: {
        urlFilter: i,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME
        ]
      }
    });
  }), K(async () => {
    const n = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter(
      (i) => i >= S && i < h || i >= S + D && i < h + D
    );
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(t, null, 2));
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: n,
        addRules: t
      }), console.log("[v0] DEBUG: Pomodoro DNR rules successfully applied");
    } catch (i) {
      throw console.error("[v0] ERROR: Pomodoro DNR updateDynamicRules FAILED:", i), console.error("[v0] ERROR: Failed Pomodoro rules:", t), console.error("[v0] ERROR: Attempted to remove Pomodoro rules:", n), i;
    }
    const a = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(a, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function j() {
  return K(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter(
      (o) => o >= S && o < h || o >= S + D && o < h + D
    );
    if (t.length > 0)
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: t
        }), console.log(
          "[v0] Pomodoro blocking disabled. Removed",
          t.length,
          "rules."
        );
      } catch (o) {
        throw console.error("[v0] ERROR: Failed to remove Pomodoro DNR rules:", o), console.error("[v0] ERROR: Attempted to remove Pomodoro rule IDs:", t), o;
      }
  });
}
const ce = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: $,
  cleanupAllDNRRules: ie,
  debugDNRStatus: Ne,
  disablePomodoroBlocking: j,
  enablePomodoroBlocking: Y,
  initializeBlocker: se,
  removeFromBlacklist: re
}, Symbol.toStringTag, { value: "Module" }));
function le() {
  return chrome.runtime.getURL("icon48.png");
}
async function de() {
  try {
    if (!chrome.notifications || typeof chrome.notifications.create != "function")
      return console.warn("[v0][Notifications] chrome.notifications API not available"), !1;
    if (chrome.permissions && chrome.permissions.contains)
      try {
        if (!await chrome.permissions.contains({
          permissions: ["notifications"]
        }))
          return console.warn("[v0][Notifications] Notification permission not granted"), !1;
      } catch {
        console.debug("[v0][Notifications] Could not check permission status, will try creating notification");
      }
    return !0;
  } catch (e) {
    return console.error("[v0][Notifications] Error verifying permission:", e), !1;
  }
}
async function ue() {
  try {
    try {
      const t = (await chrome.storage.sync.get(s.SETTINGS))[s.SETTINGS];
      if (t) {
        const o = t.notifications ?? t.notificationsEnabled;
        if (o !== void 0)
          return o;
      }
    } catch (e) {
      console.warn("[v0][Notifications] Sync storage read failed, trying local:", e);
    }
    try {
      const t = (await chrome.storage.local.get(s.SETTINGS))[s.SETTINGS];
      if (t) {
        const o = t.notifications ?? t.notificationsEnabled;
        if (o !== void 0)
          return o;
      }
    } catch (e) {
      console.warn("[v0][Notifications] Local storage read failed:", e);
    }
    return T.notifications ?? T.notificationsEnabled ?? !0;
  } catch (e) {
    return console.error("[v0][Notifications] Error getting notification setting:", e), !1;
  }
}
async function U(e) {
  try {
    if (!await de())
      return console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: e.notificationId,
        title: e.title
      }), null;
    if (!await ue())
      return console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: e.notificationId,
        title: e.title
      }), null;
    const n = {
      type: e.type || "basic",
      iconUrl: e.iconUrl || le(),
      title: e.title,
      message: e.message
    };
    e.buttons && e.buttons.length > 0 && (n.buttons = e.buttons), e.requireInteraction !== void 0 && (n.requireInteraction = e.requireInteraction), e.priority !== void 0 && (n.priority = e.priority);
    const a = await chrome.notifications.create(
      e.notificationId,
      n
    );
    return console.log("[v0][Notifications] Notification created successfully:", {
      id: a,
      notificationId: e.notificationId,
      title: e.title,
      type: e.type || "basic"
    }), a;
  } catch (t) {
    return console.error("[v0][Notifications] Failed to create notification:", {
      error: t?.message || String(t),
      stack: t?.stack,
      notificationId: e.notificationId,
      title: e.title,
      message: e.message
    }), null;
  }
}
const N = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createNotification: U,
  getNotificationIconUrl: le,
  getNotificationSetting: ue,
  verifyNotificationPermission: de
}, Symbol.toStringTag, { value: "Module" }));
async function Le() {
  console.log("[v0] Initializing Pomodoro module"), await Pe(), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === p.POMODORO && await W();
  });
}
async function Pe() {
  try {
    const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
    if (!e?.state || e.state.phase === "idle")
      return;
    const t = e.state, o = e.config || w;
    if (!t.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await ge();
      return;
    }
    const n = /* @__PURE__ */ new Date(), a = new Date(t.endsAt), i = Math.max(0, a.getTime() - n.getTime());
    if (i <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await W();
      return;
    }
    const r = {
      ...t,
      remainingMs: i,
      endsAt: a.toISOString()
    };
    await chrome.storage.local.set({
      [s.POMODORO_STATUS]: { config: o, state: r }
    });
    const c = i / (60 * 1e3), d = i < 6e4 ? 0 : Math.ceil(i / (60 * 1e3));
    i < 6e4 ? await chrome.alarms.create(p.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(p.POMODORO, { delayInMinutes: c }), t.phase === "focus" && await Y(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${d} minutes remaining`);
  } catch (e) {
    console.error("[v0] Pomodoro recovery failed:", e);
  }
}
async function Ge(e) {
  const { [s.POMODORO_STATUS]: t } = await chrome.storage.local.get(s.POMODORO_STATUS), o = t?.config || w, n = {
    ...o,
    ...e
  };
  console.log("[v0] Pomodoro config debug:", {
    incomingConfig: e,
    currentConfig: o,
    finalConfig: n,
    focusMinutes: n.focusMinutes,
    shortBreakMinutes: n.shortBreakMinutes
  });
  const a = /* @__PURE__ */ new Date(), i = new Date(a.getTime() + n.focusMinutes * 60 * 1e3), r = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (t?.state?.cycleIndex || 0) + 1,
    startedAt: a.toISOString(),
    endsAt: i.toISOString(),
    remainingMs: n.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: n, state: r } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", n.focusMinutes), await chrome.alarms.create(p.POMODORO, { delayInMinutes: n.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await Y(), await y();
  try {
    await U({
      notificationId: "pomodoro-start",
      type: "basic",
      title: "Pomodoro Iniciado",
      message: `Foco por ${n.focusMinutes} minutos. Mantenha o foco!`
    });
  } catch (c) {
    console.error("[v0] Failed to create pomodoro-start notification:", c);
  }
  console.log("[v0] Pomodoro started:", r);
}
async function ge() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, o = e?.config || w;
  await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: o, state: t } }), await chrome.alarms.clear(p.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await j(), await y(), console.log("[v0] Pomodoro stopped");
}
async function Ce() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || w;
  if (t.phase === "idle" || t.isPaused) return;
  const n = /* @__PURE__ */ new Date(), a = t.endsAt ? new Date(t.endsAt) : n, i = Math.max(0, a.getTime() - n.getTime()), r = {
    ...t,
    isPaused: !0,
    pausedAt: n.toISOString(),
    remainingMs: i,
    endsAt: void 0
    // Remove endsAt pois não há mais deadline
  };
  await chrome.alarms.clear(p.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await chrome.storage.local.set({
    [s.POMODORO_STATUS]: { config: o, state: r }
  }), await y(), console.log("[v0] Pomodoro paused:", r);
}
async function Be() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
  if (!e?.state || !e.state.isPaused) return;
  const t = e.state, o = e.config || w, n = /* @__PURE__ */ new Date(), a = t.remainingMs || 0;
  if (a <= 0) {
    await W();
    return;
  }
  const i = new Date(n.getTime() + a), r = {
    ...t,
    isPaused: !1,
    pausedAt: void 0,
    endsAt: i.toISOString(),
    remainingMs: a
  };
  await chrome.storage.local.set({
    [s.POMODORO_STATUS]: { config: o, state: r }
  });
  const c = Math.ceil(a / (60 * 1e3));
  await chrome.alarms.create(p.POMODORO, {
    delayInMinutes: Math.max(c, 0.1)
    // Min 6 segundos
  }), t.phase === "focus" && await chrome.alarms.create("pomodoro-keepalive", {
    delayInMinutes: 5,
    periodInMinutes: 5
  }), await y(), console.log("[v0] Pomodoro resumed:", r);
}
async function me() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
  if (!e?.state || e.state.phase !== "focus_complete") return;
  const t = e.state, o = e.config || w, n = t.pendingBreakType || "short", a = n === "long" ? o.longBreakMinutes : o.shortBreakMinutes, i = /* @__PURE__ */ new Date(), r = new Date(i.getTime() + a * 60 * 1e3), c = {
    ...t,
    phase: n === "long" ? "long_break" : "short_break",
    isPaused: !1,
    startedAt: i.toISOString(),
    endsAt: r.toISOString(),
    remainingMs: a * 60 * 1e3,
    pendingBreakType: void 0
  };
  await chrome.storage.local.set({
    [s.POMODORO_STATUS]: { config: o, state: c }
  }), await chrome.alarms.create(p.POMODORO, {
    delayInMinutes: a
  }), await j(), await y(), console.log("[v0] Break started:", c);
}
async function W() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || w;
  if (t.phase === "focus") {
    const a = t.cycleIndex % o.cyclesBeforeLongBreak === 0 ? "long" : "short", i = {
      ...t,
      phase: "focus_complete",
      isPaused: !1,
      remainingMs: 0,
      endsAt: void 0,
      pendingBreakType: a
    };
    await chrome.storage.local.set({
      [s.POMODORO_STATUS]: { config: o, state: i }
    }), await chrome.alarms.clear("pomodoro-keepalive"), await y();
    try {
      await U({
        notificationId: "pomodoro-focus-complete",
        type: "basic",
        title: "Foco Completo! 🎯",
        message: `Parabéns! Você completou ${o.focusMinutes} minutos de foco. Pronto para o descanso?`,
        buttons: [{ title: "Iniciar Descanso" }],
        requireInteraction: !0
        // Força usuário a interagir
      });
    } catch (r) {
      console.error("[v0] Failed to create pomodoro-focus-complete notification:", r);
    }
    console.log("[v0] Pomodoro: Focus → Focus Complete (awaiting user)");
  } else if (t.phase === "short_break" || t.phase === "long_break") {
    const n = { phase: "idle", isPaused: !1, cycleIndex: t.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: o, state: n } }), await chrome.alarms.clear("pomodoro-keepalive"), await y();
    try {
      await U({
        notificationId: "pomodoro-cycle-complete",
        type: "basic",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?"
      });
    } catch (a) {
      console.error("[v0] Failed to create pomodoro-cycle-complete notification:", a);
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function ke() {
  console.log("[v0] Initializing Firebase sync module");
  const { [s.SETTINGS]: e } = await chrome.storage.sync.get(s.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(p.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === p.DAILY_SYNC && await Fe();
  });
}
async function Fe() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [s.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(s.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const n = Object.values(o).reduce((i, r) => i + r, 0), a = Object.entries(o).sort(([, i], [, r]) => r - i).slice(0, 5).map(([i, r]) => ({ domain: i, time: r }));
  console.log("[v0] Daily summary:", { totalTime: n, topSites: a });
}
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function fe() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Le(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await se(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await De(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await Re(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await Ae(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await ke(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function xe() {
  try {
    const { verifyNotificationPermission: e, createNotification: t } = await Promise.resolve().then(() => N);
    await e() ? (console.log("[v0] Notification permission granted"), await t({
      notificationId: "welcome-notification",
      type: "basic",
      title: "Focus Extension Ativada!",
      message: "As notificações estão funcionando. Você receberá alertas sobre Pomodoro e sites distrativos.",
      priority: 1
    }), console.log("[v0] Welcome notification sent")) : console.warn("[v0] Notifications API not available or permission not granted");
  } catch (e) {
    console.error("[v0] Failed to request notification permission:", e);
  }
}
async function Q() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");
    const e = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const t of e)
      if (t.id)
        try {
          const o = await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: () => globalThis.__v0ContentScriptInjected === !0
            // em MV3, func roda na página; caso bloqueado, cairá no catch abaixo
          });
          Array.isArray(o) && o[0]?.result === !0 || (await chrome.scripting.executeScript({
            target: { tabId: t.id },
            files: ["content.js"]
          }), await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: () => {
              globalThis.__v0ContentScriptInjected = !0;
            }
          }), console.log(`[v0] Injected content script into tab ${t.id}`));
        } catch (o) {
          const n = String(o?.message ?? o);
          n.includes("Cannot access contents") || n.includes("No matching signature") || n.includes("Cannot access a chrome:// URL") || n.includes("The extensions gallery cannot be scripted") || n.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${t.id}:`, o);
        }
  } catch (e) {
    console.error("[v0] Error while injecting content scripts:", e);
  }
}
function ze(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), Ke(e);
}
async function Ke(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await ie(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
  } catch (t) {
    console.error("[v0] Failed to cleanup DNR rules:", t);
  }
  if (e.reason === "install") {
    console.log("[v0] DEBUG: First installation - creating initial state...");
    const t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = {
      isLoading: !1,
      error: null,
      blacklist: [],
      // Garantir que é array
      timeLimits: [],
      // Garantir que é array
      dailyUsage: {
        [t]: {
          date: t,
          totalMinutes: 0,
          perDomain: {}
        }
      },
      siteCustomizations: {
        "youtube.com": {
          selectorsToRemove: [
            "#secondary",
            "#related",
            "#comments",
            "#sections",
            "#chips",
            "#masthead-container",
            "#player-ads",
            "#merch-shelf",
            "#engagement-panel",
            "#watch-discussion",
            "#watch-description",
            "#watch7-sidebar-contents",
            "#watch7-sidebar-modules",
            "ytd-reel-shelf-renderer",
            "ytd-shorts",
            "ytd-compact-video-renderer",
            "ytd-video-secondary-info-renderer",
            "ytd-video-primary-info-renderer",
            "#dismissible",
            "#dismissed",
            "#dismissed-content",
            "ytd-item-section-renderer",
            "ytd-shelf-renderer"
          ]
        }
      },
      pomodoro: {
        config: w,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: T
    };
    console.log("[v0] DEBUG: Initial state object:", o);
    try {
      console.log("[v0] DEBUG: Writing to chrome.storage.local..."), await chrome.storage.local.set({
        [s.BLACKLIST]: o.blacklist,
        [s.TIME_LIMITS]: o.timeLimits,
        [s.DAILY_USAGE]: o.dailyUsage,
        [s.SITE_CUSTOMIZATIONS]: o.siteCustomizations,
        [s.POMODORO_STATUS]: o.pomodoro
      }), console.log("[v0] DEBUG: ✅ Local storage written successfully"), console.log("[v0] DEBUG: Writing to chrome.storage.sync..."), await chrome.storage.sync.set({
        [s.SETTINGS]: o.settings
      }), console.log("[v0] DEBUG: ✅ Sync storage written successfully"), console.log("[v0] Initial state created");
    } catch (n) {
      console.error("[v0] Failed to create initial state:", n);
    }
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await Q(), console.log("[v0] DEBUG: Requesting notification permissions..."), await xe(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await Q()), console.log("[v0] DEBUG: Starting module initialization..."), await fe(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => ce);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => ce);
  await e();
};
globalThis.verifyDNRRules = async () => {
  const e = await chrome.declarativeNetRequest.getDynamicRules(), t = await chrome.declarativeNetRequest.getSessionRules();
  console.log("=== DNR Rules Verification ==="), console.log("Dynamic rules:", e.length), console.log("Session rules:", t.length), console.log(`
Dynamic rules detail:`, e), console.log(`
Session rules detail:`, t);
  const o = "https://www.youtube.com/", n = e.filter((a) => {
    if (a.condition.regexFilter)
      try {
        return new RegExp(a.condition.regexFilter).test(o);
      } catch (i) {
        return console.error("Invalid regex in rule", a.id, i), !1;
      }
    return !1;
  });
  return console.log(`
Rules matching ${o}:`, n), { dynamic: e, session: t, matching: n };
};
function $e() {
  return console.log("[v0] Extension started on browser startup"), fe();
}
function qe() {
  chrome.runtime.onInstalled.addListener(ze), chrome.runtime.onStartup.addListener($e), chrome.storage.onChanged.addListener((e, t) => {
    console.log(`[v0] Storage changed in ${t}:`, e), y();
  }), chrome.runtime.onMessage.addListener((e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), console.log("[v0] DEBUG: Message sender:", t), console.log("[v0] DEBUG: Message ID:", e?.id), console.log("[v0] DEBUG: Message timestamp:", e?.ts), Promise.resolve(_e(e, t)).then((n) => {
        console.log("[v0] DEBUG: Message response:", n), o(n);
      }).catch((n) => {
        console.error("[v0] Error handling message:", n), o({ error: n?.message ?? String(n) });
      }), !0;
    } catch (n) {
      return console.error("[v0] onMessage top-level error:", n), o({ error: n.message }), !1;
    }
  }), chrome.notifications.onButtonClicked.addListener(async (e, t) => {
    try {
      if (console.log("[v0] Notification button clicked:", e, t), e.startsWith("suggest-block-") && t === 0) {
        const o = e.replace("suggest-block-", "");
        o && (await $(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      } else e === "pomodoro-focus-complete" && t === 0 && (await me(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
qe();
console.log("[v0] Service Worker loaded and listeners attached.");
