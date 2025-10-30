const a = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, y = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, w = {
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
}, D = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, ue = 0.5, _ = 0.5, h = {
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
function A(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function P(e) {
  if (!e) return "";
  try {
    const o = new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, ""), n = o.split("."), s = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const i of s)
      if (o.endsWith(`.${i}`))
        return o.split(".").slice(-3).join(".");
    return n.slice(-2).join(".");
  } catch {
    const t = e.replace(/^www\./, "").split("/")[0], o = t.split("."), n = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const s of n)
      if (t.endsWith(`.${s}`))
        return t.split(".").slice(-3).join(".");
    return o.slice(-2).join(".");
  }
}
function C(e) {
  return `||${e}`;
}
async function J() {
  try {
    const t = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS] || w;
    return {
      debugDNR: t.debugDNR ?? w.debugDNR ?? !1,
      debugTracking: t.debugTracking ?? w.debugTracking ?? !1,
      debugContentAnalysis: t.debugContentAnalysis ?? w.debugContentAnalysis ?? !1,
      debugPomodoro: t.debugPomodoro ?? w.debugPomodoro ?? !1,
      debugZenMode: t.debugZenMode ?? w.debugZenMode ?? !1
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
async function Q() {
  return (await J()).debugDNR;
}
let N = null;
function ge() {
  return N === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : N;
}
async function X() {
  N = await J();
}
function v() {
  return ge().debugTracking;
}
let G = null, j = !1, W = !1;
const me = 3e3, he = 1e3;
function B(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    t = (t << 5) - t + s, t |= 0;
  }
  const o = Math.abs(t) % he;
  return me + o;
}
async function fe() {
  if (W) return;
  W = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(y.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), n = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(y.DAILY_SYNC, {
    when: n,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(n - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === y.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await pe());
  });
}
async function pe() {
  const { [a.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((o) => B(o.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (o) {
      console.error("[v0] Error clearing time limit session rules:", o);
    }
}
async function ye() {
  j || (j = !0, console.log("[v0] Initializing usage tracker module"), await X(), await chrome.alarms.clear(y.USAGE_TRACKER), await chrome.alarms.create(y.USAGE_TRACKER, {
    periodInMinutes: _
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === y.USAGE_TRACKER && await b();
  }), chrome.tabs.onActivated.addListener(Te), chrome.tabs.onUpdated.addListener(Re), chrome.windows.onFocusChanged.addListener(Se), await ee());
}
async function Te(e) {
  await b();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await k(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await I();
  }
}
async function Re(e, t) {
  e === G && t.url && t.status === "complete" && (await b(), await k(e, t.url));
}
async function Se(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await b(), await I()) : await ee();
}
async function ee() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await k(e.id, e.url) : await I();
}
async function k(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await I();
    return;
  }
  G = e;
  const o = Date.now(), n = {
    url: t,
    startTime: o,
    lastUpdate: o
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [a.CURRENTLY_TRACKING]: n });
}
async function I() {
  G = null, await chrome.storage.session.remove(a.CURRENTLY_TRACKING);
}
async function b() {
  const t = (await chrome.storage.session.get(a.CURRENTLY_TRACKING))[a.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    v() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const o = P(t.url);
  if (!o) {
    v() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await I();
    return;
  }
  const n = Date.now(), s = Math.floor((n - t.startTime) / 1e3), i = t.lastUpdate || t.startTime, r = n - i, c = _ * 60 * 1e3 * 2;
  if (r > c && (v() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(r / 1e3),
    maxGapMs: Math.floor(c / 1e3),
    domain: o,
    url: t.url
  }), t.startTime = n - _ * 60 * 1e3), v() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: o,
    timeSpent: s,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: r > c
  }), t.startTime = n, t.lastUpdate = n, await chrome.storage.session.set({ [a.CURRENTLY_TRACKING]: t }), s < 1) {
    v() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const d = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [a.DAILY_USAGE]: g = {} } = await chrome.storage.local.get(
    a.DAILY_USAGE
  ), l = {
    ...g,
    [d]: g[d] || {
      date: d,
      totalMinutes: 0,
      perDomain: {}
    }
  };
  l[d].perDomain || (l[d].perDomain = {}), l[d].perDomain[o] = (l[d].perDomain[o] || 0) + s, l[d].totalMinutes = Object.values(l[d].perDomain).reduce((m, T) => m + T, 0) / 60, await chrome.storage.local.set({ [a.DAILY_USAGE]: l }), console.log("[v0] Recorded usage:", o, s, "seconds"), await p(), await te(o, l[d].perDomain[o]);
}
async function te(e, t) {
  const { [a.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = (Array.isArray(o) ? o : []).find((c) => c.domain === e);
  if (!s) return;
  const i = s.dailyMinutes ?? s.limitMinutes ?? 0, r = i * 60;
  if (t >= r) {
    const c = B(e);
    try {
      v() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: r,
        limitMinutes: i,
        exceeded: t >= r
      });
      const d = C(e), g = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
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
      }, m = await Q();
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
        u.length > 0 && u[0].id && u[0].url && P(u[0].url) === e && (await chrome.tabs.update(u[0].id, { url: g }), console.log(`[v0] Redirected active tab ${u[0].id} to blocked page for ${e}`), v() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
          tabId: u[0].id,
          fromUrl: u[0].url,
          toUrl: g,
          domain: e
        }));
      } catch (u) {
        console.warn(`[v0] Could not redirect active tab for ${e}:`, u);
      }
      const T = await chrome.declarativeNetRequest.getSessionRules();
      console.log("[v0] Session rules after time limit rule creation:", {
        totalRules: T.length,
        timeLimitRule: T.find((u) => u.id === c),
        allRuleIds: T.map((u) => u.id)
      }), m && (console.log("[DNR-DEBUG] All session rules after time limit:", T), console.log("[DNR-DEBUG] Session rules by domain:", T.map((u) => ({
        id: u.id,
        urlFilter: u.condition.urlFilter || u.condition.regexFilter,
        priority: u.priority
      })))), console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${c} added.`
      ), await ne() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${i} minutos em ${e} hoje.`
      });
    } catch (d) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, d);
    }
  }
}
async function De(e, t) {
  const o = A(e);
  if (!o) return;
  const { [a.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = Array.isArray(n) ? n : [], i = s.findIndex((c) => c.domain === o), r = B(o);
  if (t > 0) {
    if (i >= 0)
      s[i].dailyMinutes = t;
    else {
      const l = (m) => m;
      s.push({ domain: l(o), dailyMinutes: t });
    }
    const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [a.DAILY_USAGE]: d = {} } = await chrome.storage.local.get(
      a.DAILY_USAGE
    ), g = d?.[c]?.perDomain?.[o] || 0;
    if (g >= t * 60)
      await te(o, g);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
      } catch {
      }
  } else if (i >= 0) {
    s.splice(i, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${o}`);
  }
  await chrome.storage.local.set({ [a.TIME_LIMITS]: s }), await p(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const O = "__contentSuggestNotified__", Ee = 24 * 60 * 60 * 1e3;
async function oe() {
  try {
    const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
    return (e?.contentAnalysisSuppressionMinutes || 24 * 60) * 60 * 1e3;
  } catch {
    return Ee;
  }
}
async function we() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [O]: e = {} } = await chrome.storage.session.get(O), t = Date.now(), o = await oe();
    let n = !1;
    for (const s of Object.keys(e || {}))
      (typeof e[s] != "number" || t - e[s] > o) && (delete e[s], n = !0);
    n && await chrome.storage.session.set({ [O]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function ve(e) {
  try {
    const t = await oe(), { [O]: o = {} } = await chrome.storage.session.get(O), n = o?.[e], s = Date.now();
    return n && s - n < t ? !1 : (await chrome.storage.session.set({
      [O]: { ...o || {}, [e]: s }
    }), !0);
  } catch {
    return !0;
  }
}
async function Oe(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await ne() || !(e.classification === "distracting" && e.score > ue) || !e?.url) return;
    const t = P(e.url);
    if (!t) return;
    const { [a.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      a.BLACKLIST
    );
    if (o.some((i) => i.domain === t) || !await ve(t))
      return;
    const s = `suggest-block-${t}`;
    await chrome.notifications.create(s, {
      type: "basic",
      iconUrl: "icons/icon48.png",
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
let Z = "";
async function p() {
  try {
    const e = await F(), t = JSON.stringify(e, (o, n) => {
      if (n && typeof n == "object" && !Array.isArray(n)) {
        const s = {};
        return Object.keys(n).sort().forEach((i) => {
          s[i] = n[i];
        }), s;
      }
      return n;
    });
    if (t === Z)
      return;
    Z = t, chrome.runtime.sendMessage({ type: h.STATE_UPDATED, payload: { state: e } }, (o) => {
      const n = chrome.runtime.lastError, s = n?.message ?? "", r = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((c) => s === c || s.startsWith(c));
      n && !r && console.warn("[v0] notifyStateUpdate lastError:", n.message);
    });
    try {
      for (const o of M)
        try {
          o.postMessage({ type: h.STATE_UPDATED, payload: { state: e } });
        } catch (n) {
          console.warn("[v0] Failed to post state to port:", n);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function ne() {
  try {
    const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function F() {
  const e = [
    a.BLACKLIST,
    a.TIME_LIMITS,
    a.DAILY_USAGE,
    a.POMODORO_STATUS,
    a.SITE_CUSTOMIZATIONS
  ], [t, o] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(a.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (t[a.BLACKLIST] || []).map((n) => typeof n == "string" ? n : typeof n == "object" && n !== null && "domain" in n ? String(n.domain) : String(n)),
    timeLimits: t[a.TIME_LIMITS] || [],
    dailyUsage: t[a.DAILY_USAGE] || {},
    pomodoro: t[a.POMODORO_STATUS] || {
      config: D,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[a.SITE_CUSTOMIZATIONS] || {},
    settings: o[a.SETTINGS] || w
  };
}
const M = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    M.add(e), F().then((t) => {
      try {
        e.postMessage({ type: h.STATE_UPDATED, payload: { state: t } });
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
async function Ae(e, t) {
  switch (console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", t), e.type) {
    case h.GET_INITIAL_STATE:
      return await F();
    case h.ADD_TO_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await z(o), await p(), { success: !0 };
    }
    case h.REMOVE_FROM_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await ie(o), await p(), { success: !0 };
    }
    case h.POMODORO_START: {
      const o = e.payload;
      console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(o)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(o?.config));
      const n = o?.config || o;
      return console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(n)), await Ue(n), { success: !0 };
    }
    case h.POMODORO_STOP:
      return await ce(), { success: !0 };
    case h.POMODORO_PAUSE:
      return await _e(), { success: !0 };
    case h.POMODORO_RESUME:
      return await Ne(), { success: !0 };
    case h.START_BREAK:
      return await le(), { success: !0 };
    case h.TIME_LIMIT_SET: {
      const o = e.payload, n = o?.domain, s = o?.dailyMinutes ?? o?.limitMinutes;
      return typeof n == "string" && typeof s == "number" && await De(n, s), await p(), { success: !0 };
    }
    case h.CONTENT_ANALYSIS_RESULT:
      return await Oe(e.payload?.result), await p(), { success: !0 };
    case h.STATE_PATCH: {
      const o = e.payload ?? {}, n = o.patch?.settings ?? o.settings ?? o;
      if (!n || typeof n != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [a.SETTINGS]: s } = await chrome.storage.sync.get(a.SETTINGS), i = { ...s ?? {}, ...n ?? {} }, r = JSON.stringify(s ?? {}), c = JSON.stringify(i);
      return r === c ? { success: !0 } : (await chrome.storage.sync.set({ [a.SETTINGS]: i }), await p(), { success: !0 });
    }
    case h.SITE_CUSTOMIZATION_UPDATED: {
      const { [a.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(a.SITE_CUSTOMIZATIONS), n = e.payload;
      let s = { ...o ?? {} };
      return n && typeof n == "object" && !Array.isArray(n) && (n.domain && n.config ? s = { ...s, [String(n.domain)]: n.config } : s = { ...s, ...n }), await chrome.storage.local.set({ [a.SITE_CUSTOMIZATIONS]: s }), await p(), { success: !0 };
    }
    case h.TOGGLE_ZEN_MODE: {
      const [o] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (o?.id)
        try {
          await chrome.tabs.sendMessage(o.id, {
            type: h.TOGGLE_ZEN_MODE,
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
    case h.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const o = e.type;
      throw new Error(`Unknown message type: ${o}`);
    }
  }
}
const R = 1e3, f = 2e3, E = 1e3, S = 1e4;
let U = Promise.resolve();
function x(e) {
  return U = U.then(e, e), U;
}
function H(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    t = (t << 5) - t + s, t |= 0;
  }
  const o = Math.abs(t) % E;
  return f + o;
}
async function se() {
  console.log("[v0] Initializing blocker module"), await X(), await K();
}
async function ae() {
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
async function Ie() {
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
      console.log("Regex test results:"), n.forEach((s) => {
        console.log(`  ${o.test(s) ? "✅" : "❌"} ${s}`);
      });
    }
  } catch (e) {
    console.error("DNR debug failed:", e);
  }
  console.log("=== END DNR DEBUG ===");
}
async function z(e) {
  const o = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = A(e);
  if (!n) return;
  if (o.some((r) => r.domain === n)) {
    console.log("[v0] Domain already in blacklist:", n);
    return;
  }
  const s = (r) => r, i = [
    ...o,
    { domain: s(n), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const r = o;
    if (r.length === i.length && r.every((d, g) => d.domain === i[g].domain && d.addedAt === i[g].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [a.BLACKLIST]: i }), await K(), await p(), console.log("[v0] Added to blacklist:", n);
}
async function ie(e) {
  const o = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = A(e);
  if (!n) return;
  const s = o.filter((i) => i.domain !== n);
  if (s.length !== o.length) {
    try {
      if (s.length === o.length && s.every((r, c) => r.domain === o[c].domain && r.addedAt === o[c].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [a.BLACKLIST]: s }), await K(), await p(), console.log("[v0] Removed from blacklist:", n);
  }
}
async function K() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), x(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const t = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", t.length, "existing DNR rules");
    const o = new Set(
      t.map((r) => r.id).filter(
        (r) => r >= f && r < f + E || r >= f + S && r < f + S + E
      )
    ), n = [], s = /* @__PURE__ */ new Set();
    for (const r of e) {
      const c = A(r.domain);
      if (!c) continue;
      let d = H(c), g = 0;
      const l = E;
      for (; s.has(d) || o.has(d); ) {
        if (g++, g >= l) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${c}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        d++, d >= f + E && (d = f);
      }
      if (g >= l) {
        console.warn(`[v0] Skipping rule for ${c} - no free ID found`);
        continue;
      }
      if (s.add(d), !o.has(d)) {
        const m = C(c);
        console.log("[v0] [DEBUG] Valid urlFilter for", c, ":", m);
        const T = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(c)}`);
        n.push({
          id: d,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: T
            }
          },
          condition: {
            urlFilter: m,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
        const u = d + S;
        o.has(u) || n.push({
          id: u,
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
      (r) => !s.has(r) && !s.has(r - S)
    );
    if (console.log("[v0] DEBUG: Rules to add:", n.length), console.log("[v0] DEBUG: Rules to remove:", i.length), n.length > 0 || i.length > 0) {
      const r = await Q();
      r && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((l) => l.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", n.map((l) => ({
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e.find((m) => H(m.domain) === l.id)?.domain
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
      const c = await chrome.declarativeNetRequest.getDynamicRules(), d = c.filter((l) => l.id >= f && l.id < f + E), g = c.filter((l) => l.id >= R && l.id < f);
      if (console.log(`[v0] DNR Verification: ${d.length} blacklist rules, ${g.length} pomodoro rules`), n.length > 0 && d.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), r) {
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", l), console.log("[DNR-DEBUG] Total rules count:", l.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: l.filter((m) => m.id >= R && m.id < f).length,
          blacklist: l.filter((m) => m.id >= f && m.id < f + E).length,
          other: l.filter((m) => m.id < R || m.id >= f + E).length
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
async function $() {
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = [];
  return e.forEach((o, n) => {
    const s = A(o.domain), i = C(s), r = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(s)}`);
    t.push({
      id: R + n,
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
      id: R + n + S,
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
  }), x(async () => {
    const n = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter(
      (i) => i >= R && i < f || i >= R + S && i < f + S
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
    const s = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(s, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function q() {
  return x(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter(
      (o) => o >= R && o < f || o >= R + S && o < f + S
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
const re = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: z,
  cleanupAllDNRRules: ae,
  debugDNRStatus: Ie,
  disablePomodoroBlocking: q,
  enablePomodoroBlocking: $,
  initializeBlocker: se,
  removeFromBlacklist: ie
}, Symbol.toStringTag, { value: "Module" }));
async function L() {
  const e = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
  return e?.notifications ?? e?.notificationsEnabled ?? !1;
}
async function Me() {
  console.log("[v0] Initializing Pomodoro module"), await be(), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === y.POMODORO && await Y();
  });
}
async function be() {
  try {
    const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
    if (!e?.state || e.state.phase === "idle")
      return;
    const t = e.state, o = e.config || D;
    if (!t.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await ce();
      return;
    }
    const n = /* @__PURE__ */ new Date(), s = new Date(t.endsAt), i = Math.max(0, s.getTime() - n.getTime());
    if (i <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await Y();
      return;
    }
    const r = {
      ...t,
      remainingMs: i,
      endsAt: s.toISOString()
    };
    await chrome.storage.local.set({
      [a.POMODORO_STATUS]: { config: o, state: r }
    });
    const c = i / (60 * 1e3), d = i < 6e4 ? 0 : Math.ceil(i / (60 * 1e3));
    i < 6e4 ? await chrome.alarms.create(y.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(y.POMODORO, { delayInMinutes: c }), t.phase === "focus" && await $(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${d} minutes remaining`);
  } catch (e) {
    console.error("[v0] Pomodoro recovery failed:", e);
  }
}
async function Ue(e) {
  const { [a.POMODORO_STATUS]: t } = await chrome.storage.local.get(a.POMODORO_STATUS), o = t?.config || D, n = {
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
  const s = /* @__PURE__ */ new Date(), i = new Date(s.getTime() + n.focusMinutes * 60 * 1e3), r = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (t?.state?.cycleIndex || 0) + 1,
    startedAt: s.toISOString(),
    endsAt: i.toISOString(),
    remainingMs: n.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: n, state: r } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", n.focusMinutes), await chrome.alarms.create(y.POMODORO, { delayInMinutes: n.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await $(), await p();
  const c = await L();
  if (console.log("[v0] Notification settings:", { notifyEnabled: c }), c)
    try {
      await chrome.notifications.create("pomodoro-start", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pomodoro Iniciado",
        message: `Foco por ${n.focusMinutes} minutos. Mantenha o foco!`
      }), console.log("[v0] Notification created successfully");
    } catch (d) {
      console.error("[v0] Failed to create notification:", d);
    }
  console.log("[v0] Pomodoro started:", r);
}
async function ce() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, o = e?.config || D;
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: o, state: t } }), await chrome.alarms.clear(y.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await q(), await p(), console.log("[v0] Pomodoro stopped");
}
async function _e() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || D;
  if (t.phase === "idle" || t.isPaused) return;
  const n = /* @__PURE__ */ new Date(), s = t.endsAt ? new Date(t.endsAt) : n, i = Math.max(0, s.getTime() - n.getTime()), r = {
    ...t,
    isPaused: !0,
    pausedAt: n.toISOString(),
    remainingMs: i,
    endsAt: void 0
    // Remove endsAt pois não há mais deadline
  };
  await chrome.alarms.clear(y.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await chrome.storage.local.set({
    [a.POMODORO_STATUS]: { config: o, state: r }
  }), await p(), console.log("[v0] Pomodoro paused:", r);
}
async function Ne() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state || !e.state.isPaused) return;
  const t = e.state, o = e.config || D, n = /* @__PURE__ */ new Date(), s = t.remainingMs || 0;
  if (s <= 0) {
    await Y();
    return;
  }
  const i = new Date(n.getTime() + s), r = {
    ...t,
    isPaused: !1,
    pausedAt: void 0,
    endsAt: i.toISOString(),
    remainingMs: s
  };
  await chrome.storage.local.set({
    [a.POMODORO_STATUS]: { config: o, state: r }
  });
  const c = Math.ceil(s / (60 * 1e3));
  await chrome.alarms.create(y.POMODORO, {
    delayInMinutes: Math.max(c, 0.1)
    // Min 6 segundos
  }), t.phase === "focus" && await chrome.alarms.create("pomodoro-keepalive", {
    delayInMinutes: 5,
    periodInMinutes: 5
  }), await p(), console.log("[v0] Pomodoro resumed:", r);
}
async function le() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state || e.state.phase !== "focus_complete") return;
  const t = e.state, o = e.config || D, n = t.pendingBreakType || "short", s = n === "long" ? o.longBreakMinutes : o.shortBreakMinutes, i = /* @__PURE__ */ new Date(), r = new Date(i.getTime() + s * 60 * 1e3), c = {
    ...t,
    phase: n === "long" ? "long_break" : "short_break",
    isPaused: !1,
    startedAt: i.toISOString(),
    endsAt: r.toISOString(),
    remainingMs: s * 60 * 1e3,
    pendingBreakType: void 0
  };
  await chrome.storage.local.set({
    [a.POMODORO_STATUS]: { config: o, state: c }
  }), await chrome.alarms.create(y.POMODORO, {
    delayInMinutes: s
  }), await q(), await p(), console.log("[v0] Break started:", c);
}
async function Y() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || D;
  if (t.phase === "focus") {
    const s = t.cycleIndex % o.cyclesBeforeLongBreak === 0 ? "long" : "short", i = {
      ...t,
      phase: "focus_complete",
      isPaused: !1,
      remainingMs: 0,
      endsAt: void 0,
      pendingBreakType: s
    };
    await chrome.storage.local.set({
      [a.POMODORO_STATUS]: { config: o, state: i }
    }), await chrome.alarms.clear("pomodoro-keepalive"), await p(), await L() && await chrome.notifications.create("pomodoro-focus-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Foco Completo! 🎯",
      message: `Parabéns! Você completou ${o.focusMinutes} minutos de foco. Pronto para o descanso?`,
      buttons: [{ title: "Iniciar Descanso" }],
      requireInteraction: !0
      // Força usuário a interagir
    }), console.log("[v0] Pomodoro: Focus → Focus Complete (awaiting user)");
  } else if (t.phase === "short_break" || t.phase === "long_break") {
    const n = { phase: "idle", isPaused: !1, cycleIndex: t.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: o, state: n } }), await chrome.alarms.clear("pomodoro-keepalive"), await p();
    const s = await L();
    if (console.log("[v0] Cycle complete notification settings:", { notifyEnabled: s }), s)
      try {
        await chrome.notifications.create("pomodoro-cycle-complete", {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Ciclo Completo!",
          message: "Pronto para outra sessão de foco?"
        }), console.log("[v0] Cycle complete notification created successfully");
      } catch (i) {
        console.error("[v0] Failed to create cycle complete notification:", i);
      }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function Le() {
  console.log("[v0] Initializing Firebase sync module");
  const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(y.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === y.DAILY_SYNC && await Pe();
  });
}
async function Pe() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [a.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(a.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const n = Object.values(o).reduce((i, r) => i + r, 0), s = Object.entries(o).sort(([, i], [, r]) => r - i).slice(0, 5).map(([i, r]) => ({ domain: i, time: r }));
  console.log("[v0] Daily summary:", { totalTime: n, topSites: s });
}
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function de() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Me(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await se(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await ye(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await fe(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await we(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await Le(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function Ce() {
  try {
    chrome.notifications !== void 0 ? (console.log("[v0] Notification permission granted"), await chrome.notifications.create("welcome-notification", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Focus Extension Ativada!",
      message: "As notificações estão funcionando. Você receberá alertas sobre Pomodoro e sites distrativos.",
      priority: 1
    }), console.log("[v0] Welcome notification sent")) : console.warn("[v0] Notifications API not available");
  } catch (e) {
    console.error("[v0] Failed to request notification permission:", e);
  }
}
async function V() {
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
function Ge(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), Be(e);
}
async function Be(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await ae(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
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
        config: D,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: w
    };
    console.log("[v0] DEBUG: Initial state object:", o);
    try {
      console.log("[v0] DEBUG: Writing to chrome.storage.local..."), await chrome.storage.local.set({
        [a.BLACKLIST]: o.blacklist,
        [a.TIME_LIMITS]: o.timeLimits,
        [a.DAILY_USAGE]: o.dailyUsage,
        [a.SITE_CUSTOMIZATIONS]: o.siteCustomizations,
        [a.POMODORO_STATUS]: o.pomodoro
      }), console.log("[v0] DEBUG: ✅ Local storage written successfully"), console.log("[v0] DEBUG: Writing to chrome.storage.sync..."), await chrome.storage.sync.set({
        [a.SETTINGS]: o.settings
      }), console.log("[v0] DEBUG: ✅ Sync storage written successfully"), console.log("[v0] Initial state created");
    } catch (n) {
      console.error("[v0] Failed to create initial state:", n);
    }
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await V(), console.log("[v0] DEBUG: Requesting notification permissions..."), await Ce(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await V()), console.log("[v0] DEBUG: Starting module initialization..."), await de(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => re);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => re);
  await e();
};
globalThis.verifyDNRRules = async () => {
  const e = await chrome.declarativeNetRequest.getDynamicRules(), t = await chrome.declarativeNetRequest.getSessionRules();
  console.log("=== DNR Rules Verification ==="), console.log("Dynamic rules:", e.length), console.log("Session rules:", t.length), console.log(`
Dynamic rules detail:`, e), console.log(`
Session rules detail:`, t);
  const o = "https://www.youtube.com/", n = e.filter((s) => {
    if (s.condition.regexFilter)
      try {
        return new RegExp(s.condition.regexFilter).test(o);
      } catch (i) {
        return console.error("Invalid regex in rule", s.id, i), !1;
      }
    return !1;
  });
  return console.log(`
Rules matching ${o}:`, n), { dynamic: e, session: t, matching: n };
};
function ke() {
  return console.log("[v0] Extension started on browser startup"), de();
}
function Fe() {
  chrome.runtime.onInstalled.addListener(Ge), chrome.runtime.onStartup.addListener(ke), chrome.storage.onChanged.addListener((e, t) => {
    console.log(`[v0] Storage changed in ${t}:`, e), p();
  }), chrome.runtime.onMessage.addListener((e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), console.log("[v0] DEBUG: Message sender:", t), console.log("[v0] DEBUG: Message ID:", e?.id), console.log("[v0] DEBUG: Message timestamp:", e?.ts), Promise.resolve(Ae(e, t)).then((n) => {
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
        o && (await z(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      } else e === "pomodoro-focus-complete" && t === 0 && (await le(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Fe();
console.log("[v0] Service Worker loaded and listeners attached.");
