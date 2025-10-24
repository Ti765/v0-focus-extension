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
}, O = {
  // Core settings matching UserSettings
  theme: "system",
  blockMode: "soft",
  notifications: !0,
  syncWithCloud: !1,
  language: "pt-BR",
  telemetry: !1,
  debugDNR: !1,
  // Default to false for production
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
    "manual"
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
    "meme"
  ],
  // Backward compat
  analyticsConsent: !1,
  notificationsEnabled: !0
}, D = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, se = 0.5, ae = 1, m = {
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
  // Sinalização/diagnóstico
  PING: "PING",
  PONG: "PONG",
  ERROR: "ERROR",
  // Content analysis / other
  CONTENT_ANALYSIS_RESULT: "CONTENT_ANALYSIS_RESULT",
  TOGGLE_ZEN_MODE: "TOGGLE_ZEN_MODE"
};
function I(e) {
  if (!e) return "";
  const o = e.trim();
  try {
    return new URL(o.startsWith("http") ? o : `https://${o}`).hostname.replace(/^www\./, "");
  } catch {
    return o.split("/")[0].replace(/^www\./, "");
  }
}
function q(e) {
  if (!e) return "";
  try {
    const t = new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, ""), n = t.split("."), s = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const i of s)
      if (t.endsWith(`.${i}`))
        return t.split(".").slice(-3).join(".");
    return n.slice(-2).join(".");
  } catch {
    const o = e.replace(/^www\./, "").split("/")[0], t = o.split("."), n = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const s of n)
      if (o.endsWith(`.${s}`))
        return o.split(".").slice(-3).join(".");
    return t.slice(-2).join(".");
  }
}
function N(e) {
  return `||${e}`;
}
async function Y() {
  try {
    return {
      debugDNR: ((await chrome.storage.local.get(a.SETTINGS))[a.SETTINGS] || O).debugDNR ?? O.debugDNR ?? !1
    };
  } catch (e) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", e), {
      debugDNR: !1
    };
  }
}
async function j() {
  return (await Y()).debugDNR;
}
async function W() {
  await Y();
}
const ie = !0;
let b = null, F = !1, x = !1;
const re = 3e3, ce = 1e3;
function L(e) {
  let o = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % ce;
  return re + t;
}
async function le() {
  if (x) return;
  x = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(y.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), o = new Date(e);
  o.setHours(24, 0, 0, 0);
  const t = o.getTime() - e.getTime(), n = Date.now() + Math.max(t, 6e4);
  await chrome.alarms.create(y.DAILY_SYNC, {
    when: n,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(n - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === y.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await de());
  });
}
async function de() {
  const { [a.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const o = e.map((t) => L(t.domain));
  if (o.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: o }), console.log(`[v0] Cleared ${o.length} time limit session rules.`);
    } catch (t) {
      console.error("[v0] Error clearing time limit session rules:", t);
    }
}
async function ue() {
  F || (F = !0, console.log("[v0] Initializing usage tracker module"), await W(), await chrome.alarms.clear(y.USAGE_TRACKER), await chrome.alarms.create(y.USAGE_TRACKER, {
    periodInMinutes: ae
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === y.USAGE_TRACKER && await _();
  }), chrome.tabs.onActivated.addListener(ge), chrome.tabs.onUpdated.addListener(me), chrome.windows.onFocusChanged.addListener(he), await H());
}
async function ge(e) {
  await _();
  try {
    const o = await chrome.tabs.get(e.tabId);
    await M(o.id, o.url);
  } catch (o) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, o), await w();
  }
}
async function me(e, o) {
  e === b && o.url && (await _(), await M(e, o.url));
}
async function he(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await _(), await w()) : await H();
}
async function H() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await M(e.id, e.url) : await w();
}
async function M(e, o) {
  if (!e || !o || o.startsWith("chrome://") || o.startsWith("chrome-extension://") || o.startsWith("about:")) {
    await w();
    return;
  }
  b = e;
  const t = {
    url: o,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [a.CURRENTLY_TRACKING]: t });
}
async function w() {
  b = null, await chrome.storage.session.remove(a.CURRENTLY_TRACKING);
}
async function _() {
  const o = (await chrome.storage.session.get(a.CURRENTLY_TRACKING))[a.CURRENTLY_TRACKING];
  if (!o || !o.url || !o.startTime) {
    console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: o });
    return;
  }
  const t = q(o.url);
  if (!t) {
    console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: o.url }), await w();
    return;
  }
  const n = Math.floor((Date.now() - o.startTime) / 1e3);
  if (console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: t,
    timeSpent: n,
    url: o.url,
    startTime: new Date(o.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString()
  }), o.startTime = Date.now(), await chrome.storage.session.set({ [a.CURRENTLY_TRACKING]: o }), n < 1) {
    console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const s = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [a.DAILY_USAGE]: i = {} } = await chrome.storage.local.get(
    a.DAILY_USAGE
  ), r = {
    ...i,
    [s]: i[s] || {}
  };
  r[s] || (r[s] = {}), r[s][t] = (r[s][t] || 0) + n, await chrome.storage.local.set({ [a.DAILY_USAGE]: r }), console.log("[v0] Recorded usage:", t, n, "seconds"), await h(), await Z(t, r[s][t]);
}
async function Z(e, o) {
  const { [a.TIME_LIMITS]: t } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = (Array.isArray(t) ? t : []).find((l) => l.domain === e);
  if (!s) return;
  const i = s.dailyMinutes ?? s.limitMinutes ?? 0, r = i * 60;
  if (o >= r) {
    const l = L(e);
    try {
      ie && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: o,
        limitSeconds: r,
        limitMinutes: i,
        exceeded: o >= r
      });
      const d = N(e), T = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`), c = {
        id: l,
        priority: 3,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: T
          }
        },
        condition: {
          urlFilter: d,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, u = await j();
      if (u && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: c.id,
        urlFilter: c.condition.urlFilter,
        domain: e,
        totalSecondsToday: o,
        limitSeconds: r
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [l],
        // remove se já existir
        addRules: [c]
      }), u) {
        const A = await chrome.declarativeNetRequest.getSessionRules();
        console.log("[DNR-DEBUG] All session rules after time limit:", A), console.log("[DNR-DEBUG] Session rules by domain:", A.map((E) => ({
          id: E.id,
          urlFilter: E.condition.urlFilter || E.condition.regexFilter
        })));
      }
      console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${l} added.`
      ), await J() && chrome.notifications.create(`limit-exceeded-${e}`, {
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
async function Te(e, o) {
  const t = I(e);
  if (!t) return;
  const { [a.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = Array.isArray(n) ? n : [], i = s.findIndex((l) => l.domain === t), r = L(t);
  if (o > 0) {
    if (i >= 0)
      s[i].dailyMinutes = o;
    else {
      const c = (u) => u;
      s.push({ domain: c(t), dailyMinutes: o });
    }
    const l = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [a.DAILY_USAGE]: d = {} } = await chrome.storage.local.get(
      a.DAILY_USAGE
    ), T = d?.[l]?.[t] || 0;
    if (T >= o * 60)
      await Z(t, T);
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
    console.log(`[v0] Time limit removed for: ${t}`);
  }
  await chrome.storage.local.set({ [a.TIME_LIMITS]: s }), await h(), console.log("[v0] Time limit set/updated:", t, o, "minutes");
}
const p = "__contentSuggestNotified__", V = 3 * 60 * 60 * 1e3;
async function ye() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [p]: e = {} } = await chrome.storage.session.get(p), o = Date.now();
    let t = !1;
    for (const n of Object.keys(e || {}))
      (typeof e[n] != "number" || o - e[n] > V) && (delete e[n], t = !0);
    t && await chrome.storage.session.set({ [p]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function fe(e) {
  try {
    const { [p]: o = {} } = await chrome.storage.session.get(p), t = o?.[e], n = Date.now();
    return t && n - t < V ? !1 : (await chrome.storage.session.set({
      [p]: { ...o || {}, [e]: n }
    }), !0);
  } catch {
    return !0;
  }
}
async function Re(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await J() || !(e.classification === "distracting" && e.score > se) || !e?.url) return;
    const o = q(e.url);
    if (!o) return;
    const { [a.BLACKLIST]: t = [] } = await chrome.storage.local.get(
      a.BLACKLIST
    );
    if (t.some((i) => i.domain === o) || !await fe(o))
      return;
    const s = `suggest-block-${o}`;
    await chrome.notifications.create(s, {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Site Potencialmente Distrativo",
      message: `${o} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
      buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }]
      // Você pode manter a notificação até interação do usuário, se quiser:
      // requireInteraction: true,
      // priority: 0,
    });
  } catch (o) {
    console.error("[v0] Error while handling content analysis result:", o);
  }
}
let z = "";
async function h() {
  try {
    const e = await G(), o = JSON.stringify(e, (t, n) => {
      if (n && typeof n == "object" && !Array.isArray(n)) {
        const s = {};
        return Object.keys(n).sort().forEach((i) => {
          s[i] = n[i];
        }), s;
      }
      return n;
    });
    if (o === z)
      return;
    z = o, chrome.runtime.sendMessage({ type: m.STATE_UPDATED, payload: { state: e } }, (t) => {
      const n = chrome.runtime.lastError, s = n?.message ?? "", r = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((l) => s === l || s.startsWith(l));
      n && !r && console.warn("[v0] notifyStateUpdate lastError:", n.message);
    });
    try {
      for (const t of v)
        try {
          t.postMessage({ type: m.STATE_UPDATED, payload: { state: e } });
        } catch (n) {
          console.warn("[v0] Failed to post state to port:", n);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function J() {
  try {
    const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function G() {
  const e = [
    a.BLACKLIST,
    a.TIME_LIMITS,
    a.DAILY_USAGE,
    a.POMODORO_STATUS,
    a.SITE_CUSTOMIZATIONS
  ], [o, t] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(a.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (o[a.BLACKLIST] || []).map((n) => typeof n == "string" ? n : typeof n == "object" && n !== null && "domain" in n ? String(n.domain) : String(n)),
    timeLimits: o[a.TIME_LIMITS] || [],
    dailyUsage: o[a.DAILY_USAGE] || {},
    pomodoro: o[a.POMODORO_STATUS] || {
      config: D,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: o[a.SITE_CUSTOMIZATIONS] || {},
    settings: t[a.SETTINGS] || O
  };
}
const v = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    v.add(e), G().then((o) => {
      try {
        e.postMessage({ type: m.STATE_UPDATED, payload: { state: o } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      v.delete(e);
    });
  } catch {
    try {
      v.delete(e);
    } catch {
    }
  }
});
async function Se(e, o) {
  switch (console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", o), e.type) {
    case m.GET_INITIAL_STATE:
      return await G();
    case m.ADD_TO_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await B(t), await h(), { success: !0 };
    }
    case m.REMOVE_FROM_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await ee(t), await h(), { success: !0 };
    }
    case m.POMODORO_START:
      return await De(e.payload || void 0), { success: !0 };
    case m.POMODORO_STOP:
      return await Ie(), { success: !0 };
    case m.TIME_LIMIT_SET: {
      const t = e.payload, n = t?.domain, s = t?.dailyMinutes ?? t?.limitMinutes;
      return typeof n == "string" && typeof s == "number" && await Te(n, s), await h(), { success: !0 };
    }
    case m.CONTENT_ANALYSIS_RESULT:
      return await Re(e.payload?.result), await h(), { success: !0 };
    case m.STATE_PATCH: {
      const t = e.payload ?? {}, n = t.patch?.settings ?? t.settings ?? t;
      if (!n || typeof n != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [a.SETTINGS]: s } = await chrome.storage.sync.get(a.SETTINGS), i = { ...s ?? {}, ...n ?? {} }, r = JSON.stringify(s ?? {}), l = JSON.stringify(i);
      return r === l ? { success: !0 } : (await chrome.storage.sync.set({ [a.SETTINGS]: i }), await h(), { success: !0 });
    }
    case m.SITE_CUSTOMIZATION_UPDATED: {
      const { [a.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(a.SITE_CUSTOMIZATIONS), n = e.payload;
      let s = { ...t ?? {} };
      return n && typeof n == "object" && !Array.isArray(n) && (n.domain && n.config ? s = { ...s, [String(n.domain)]: n.config } : s = { ...s, ...n }), await chrome.storage.local.set({ [a.SITE_CUSTOMIZATIONS]: s }), await h(), { success: !0 };
    }
    case m.TOGGLE_ZEN_MODE: {
      const [t] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (t?.id)
        try {
          await chrome.tabs.sendMessage(t.id, {
            type: m.TOGGLE_ZEN_MODE,
            payload: e.payload
          });
        } catch (n) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${t.id}. It may be a protected page or the content script wasn't injected.`,
            n
          );
        }
      return { success: !0 };
    }
    case m.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const t = e.type;
      throw new Error(`Unknown message type: ${t}`);
    }
  }
}
const R = 1e3, g = 2e3, f = 1e3, S = 1e4;
let U = Promise.resolve();
function C(e) {
  return U = U.then(e, e), U;
}
function K(e) {
  let o = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % f;
  return g + t;
}
async function Q() {
  console.log("[v0] Initializing blocker module"), await W(), await P();
}
async function X() {
  console.log("[v0] Cleaning up all DNR rules...");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules();
    if (e.length > 0) {
      const t = e.map((n) => n.id);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: t
      }), console.log(`[v0] Removed ${t.length} dynamic rules:`, t);
    }
    const o = await chrome.declarativeNetRequest.getSessionRules();
    if (o.length > 0) {
      const t = o.map((n) => n.id);
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: t
      }), console.log(`[v0] Removed ${t.length} session rules:`, t);
    }
    console.log("[v0] DNR cleanup complete");
  } catch (e) {
    console.error("[v0] Error during DNR cleanup:", e);
  }
}
async function Ee() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules(), o = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${e.length}`), e.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    urlFilter: ${t.condition.urlFilter || t.condition.regexFilter}`);
    }), console.log(`Session rules: ${o.length}`), o.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    urlFilter: ${t.condition.urlFilter || t.condition.regexFilter}`);
    }), e.length > 0 && e[0].condition.regexFilter) {
      const t = new RegExp(e[0].condition.regexFilter), n = [
        "https://youtube.com",
        "https://youtube.com/",
        "https://www.youtube.com",
        "https://www.youtube.com/watch?v=test"
      ];
      console.log("Regex test results:"), n.forEach((s) => {
        console.log(`  ${t.test(s) ? "✅" : "❌"} ${s}`);
      });
    }
  } catch (e) {
    console.error("DNR debug failed:", e);
  }
  console.log("=== END DNR DEBUG ===");
}
async function B(e) {
  const t = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = I(e);
  if (!n) return;
  if (t.some((r) => r.domain === n)) {
    console.log("[v0] Domain already in blacklist:", n);
    return;
  }
  const s = (r) => r, i = [
    ...t,
    { domain: s(n), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const r = t;
    if (r.length === i.length && r.every((d, T) => d.domain === i[T].domain && d.addedAt === i[T].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [a.BLACKLIST]: i }), await P(), await h(), console.log("[v0] Added to blacklist:", n);
}
async function ee(e) {
  const t = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = I(e);
  if (!n) return;
  const s = t.filter((i) => i.domain !== n);
  if (s.length !== t.length) {
    try {
      if (s.length === t.length && s.every((r, l) => r.domain === t[l].domain && r.addedAt === t[l].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [a.BLACKLIST]: s }), await P(), await h(), console.log("[v0] Removed from blacklist:", n);
  }
}
async function P() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), C(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const o = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", o.length, "existing DNR rules");
    const t = new Set(
      o.map((r) => r.id).filter(
        (r) => r >= g && r < g + f || r >= g + S && r < g + S + f
      )
    ), n = [], s = /* @__PURE__ */ new Set();
    for (const r of e) {
      const l = I(r.domain);
      if (!l) continue;
      let d = K(l), T = 0;
      const c = f;
      for (; s.has(d) || t.has(d); ) {
        if (T++, T >= c) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${l}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        d++, d >= g + f && (d = g);
      }
      if (T >= c) {
        console.warn(`[v0] Skipping rule for ${l} - no free ID found`);
        continue;
      }
      if (s.add(d), !t.has(d)) {
        const u = N(l);
        console.log("[v0] [DEBUG] Valid urlFilter for", l, ":", u);
        const A = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(l)}`);
        n.push({
          id: d,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: A
            }
          },
          condition: {
            urlFilter: u,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
        const E = d + S;
        t.has(E) || n.push({
          id: E,
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
            urlFilter: u,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME
            ]
          }
        });
      }
    }
    const i = Array.from(t).filter(
      (r) => !s.has(r) && !s.has(r - S)
    );
    if (console.log("[v0] DEBUG: Rules to add:", n.length), console.log("[v0] DEBUG: Rules to remove:", i.length), n.length > 0 || i.length > 0) {
      const r = await j();
      r && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((c) => c.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", n.map((c) => ({
        id: c.id,
        regex: c.condition.regexFilter,
        domain: e.find((u) => K(u.domain) === c.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i)), console.log("[v0] DEBUG: Updating DNR rules...");
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: i,
          addRules: n
        }), console.log("[v0] DEBUG: DNR rules successfully applied");
        const c = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[v0] DEBUG: Current DNR rules count:", c.length), console.log("[v0] DEBUG: Current DNR rules:", c);
      } catch (c) {
        throw console.error("[v0] ERROR: DNR updateDynamicRules FAILED:", c), console.error("[v0] ERROR: Failed rules:", n), console.error("[v0] ERROR: Attempted to remove:", i), c;
      }
      const l = await chrome.declarativeNetRequest.getDynamicRules(), d = l.filter((c) => c.id >= g && c.id < g + f), T = l.filter((c) => c.id >= R && c.id < g);
      if (console.log(`[v0] DNR Verification: ${d.length} blacklist rules, ${T.length} pomodoro rules`), n.length > 0 && d.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), r) {
        const c = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", c), console.log("[DNR-DEBUG] Total rules count:", c.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: c.filter((u) => u.id >= R && u.id < g).length,
          blacklist: c.filter((u) => u.id >= g && u.id < g + f).length,
          other: c.filter((u) => u.id < R || u.id >= g + f).length
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
async function te() {
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const o = [];
  return e.forEach((t, n) => {
    const s = I(t.domain), i = N(s), r = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(s)}`);
    o.push({
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
    }), o.push({
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
  }), C(async () => {
    const n = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter(
      (i) => i >= R && i < g || i >= R + S && i < g + S
    );
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(o, null, 2));
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: n,
        addRules: o
      }), console.log("[v0] DEBUG: Pomodoro DNR rules successfully applied");
    } catch (i) {
      throw console.error("[v0] ERROR: Pomodoro DNR updateDynamicRules FAILED:", i), console.error("[v0] ERROR: Failed Pomodoro rules:", o), console.error("[v0] ERROR: Attempted to remove Pomodoro rules:", n), i;
    }
    const s = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(s, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function k() {
  return C(async () => {
    const o = (await chrome.declarativeNetRequest.getDynamicRules()).map((t) => t.id).filter((t) => t >= R && t < g);
    if (o.length > 0)
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: o
        }), console.log(
          "[v0] Pomodoro blocking disabled. Removed",
          o.length,
          "rules."
        );
      } catch (t) {
        throw console.error("[v0] ERROR: Failed to remove Pomodoro DNR rules:", t), console.error("[v0] ERROR: Attempted to remove Pomodoro rule IDs:", o), t;
      }
  });
}
const oe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: B,
  cleanupAllDNRRules: X,
  debugDNRStatus: Ee,
  disablePomodoroBlocking: k,
  enablePomodoroBlocking: te,
  initializeBlocker: Q,
  removeFromBlacklist: ee
}, Symbol.toStringTag, { value: "Module" }));
async function pe() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === y.POMODORO && await we();
  });
}
async function De(e) {
  const { [a.POMODORO_STATUS]: o } = await chrome.storage.local.get(a.POMODORO_STATUS), n = { ...o?.config || D, ...e || {} }, s = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (o?.state?.cycleIndex || 0) + 1,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    endsAt: void 0,
    remainingMs: n.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: n, state: s } }), await chrome.alarms.create(y.POMODORO, { delayInMinutes: n.focusMinutes }), await te(), await h();
  const i = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
  (i?.notifications ?? i?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${n.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", s);
}
async function Ie() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS), o = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, t = e?.config || D;
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: t, state: o } }), await chrome.alarms.clear(y.POMODORO), await k(), await h(), console.log("[v0] Pomodoro stopped");
}
async function we() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state) return;
  const o = e.state, t = e.config || D;
  if (o.phase === "focus") {
    const n = o.cycleIndex % t.cyclesBeforeLongBreak === 0, s = n ? t.longBreakMinutes : t.shortBreakMinutes, i = {
      ...o,
      phase: n ? "long_break" : "short_break",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingMs: s * 60 * 1e3
    };
    await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: t, state: i } }), await chrome.alarms.create(y.POMODORO, { delayInMinutes: s }), await k(), await h();
    const r = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
    (r?.notifications ?? r?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-break", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pausa!",
      message: `Descanse por ${s} minutos. Você merece!`
    }), console.log("[v0] Pomodoro: Focus → Break");
  } else if (o.phase === "short_break" || o.phase === "long_break") {
    const n = { phase: "idle", isPaused: !1, cycleIndex: o.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: t, state: n } }), await h();
    const s = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
    (s?.notifications ?? s?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-cycle-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Ciclo Completo!",
      message: "Pronto para outra sessão de foco?"
    }), console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function Ae() {
  console.log("[v0] Initializing Firebase sync module");
  const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(y.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === y.DAILY_SYNC && await ve();
  });
}
async function ve() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [a.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(a.DAILY_USAGE), o = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], t = e[o];
  if (!t) return;
  const n = Object.values(t).reduce((i, r) => i + r, 0), s = Object.entries(t).sort(([, i], [, r]) => r - i).slice(0, 5).map(([i, r]) => ({ domain: i, time: r }));
  console.log("[v0] Daily summary:", { totalTime: n, topSites: s });
}
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function ne() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await pe(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await Q(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await ue(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await le(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await ye(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await Ae(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function $() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");
    const e = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const o of e)
      if (o.id)
        try {
          const t = await chrome.scripting.executeScript({
            target: { tabId: o.id },
            func: () => globalThis.__v0ContentScriptInjected === !0
            // em MV3, func roda na página; caso bloqueado, cairá no catch abaixo
          });
          Array.isArray(t) && t[0]?.result === !0 || (await chrome.scripting.executeScript({
            target: { tabId: o.id },
            files: ["content.js"]
          }), await chrome.scripting.executeScript({
            target: { tabId: o.id },
            func: () => {
              globalThis.__v0ContentScriptInjected = !0;
            }
          }), console.log(`[v0] Injected content script into tab ${o.id}`));
        } catch (t) {
          const n = String(t?.message ?? t);
          n.includes("Cannot access contents") || n.includes("No matching signature") || n.includes("Cannot access a chrome:// URL") || n.includes("The extensions gallery cannot be scripted") || n.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${o.id}:`, t);
        }
  } catch (e) {
    console.error("[v0] Error while injecting content scripts:", e);
  }
}
function Oe(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), _e(e);
}
async function _e(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await X(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
  } catch (o) {
    console.error("[v0] Failed to cleanup DNR rules:", o);
  }
  if (e.reason === "install") {
    console.log("[v0] DEBUG: First installation - creating initial state...");
    const o = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], t = {
      isLoading: !1,
      error: null,
      blacklist: [],
      // Garantir que é array
      timeLimits: [],
      // Garantir que é array
      dailyUsage: {
        [o]: {
          date: o,
          totalMinutes: 0,
          perDomain: {}
        }
      },
      siteCustomizations: {},
      pomodoro: {
        config: D,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: O
    };
    console.log("[v0] DEBUG: Initial state object:", t);
    try {
      console.log("[v0] DEBUG: Writing to chrome.storage.local..."), await chrome.storage.local.set({
        [a.BLACKLIST]: t.blacklist,
        [a.TIME_LIMITS]: t.timeLimits,
        [a.DAILY_USAGE]: t.dailyUsage,
        [a.SITE_CUSTOMIZATIONS]: t.siteCustomizations,
        [a.POMODORO_STATUS]: t.pomodoro
      }), console.log("[v0] DEBUG: ✅ Local storage written successfully"), console.log("[v0] DEBUG: Writing to chrome.storage.sync..."), await chrome.storage.sync.set({
        [a.SETTINGS]: t.settings
      }), console.log("[v0] DEBUG: ✅ Sync storage written successfully"), console.log("[v0] Initial state created");
    } catch (n) {
      console.error("[v0] Failed to create initial state:", n);
    }
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await $();
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await $()), console.log("[v0] DEBUG: Starting module initialization..."), await ne(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => oe);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => oe);
  await e();
};
globalThis.verifyDNRRules = async () => {
  const e = await chrome.declarativeNetRequest.getDynamicRules(), o = await chrome.declarativeNetRequest.getSessionRules();
  console.log("=== DNR Rules Verification ==="), console.log("Dynamic rules:", e.length), console.log("Session rules:", o.length), console.log(`
Dynamic rules detail:`, e), console.log(`
Session rules detail:`, o);
  const t = "https://www.youtube.com/", n = e.filter((s) => {
    if (s.condition.regexFilter)
      try {
        return new RegExp(s.condition.regexFilter).test(t);
      } catch (i) {
        return console.error("Invalid regex in rule", s.id, i), !1;
      }
    return !1;
  });
  return console.log(`
Rules matching ${t}:`, n), { dynamic: e, session: o, matching: n };
};
function Ue() {
  return console.log("[v0] Extension started on browser startup"), ne();
}
function Ne() {
  chrome.runtime.onInstalled.addListener(Oe), chrome.runtime.onStartup.addListener(Ue), chrome.storage.onChanged.addListener((e, o) => {
    console.log(`[v0] Storage changed in ${o}:`, e), h();
  }), chrome.runtime.onMessage.addListener((e, o, t) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), console.log("[v0] DEBUG: Message sender:", o), console.log("[v0] DEBUG: Message ID:", e?.id), console.log("[v0] DEBUG: Message timestamp:", e?.ts), Promise.resolve(Se(e, o)).then((n) => {
        console.log("[v0] DEBUG: Message response:", n), t(n);
      }).catch((n) => {
        console.error("[v0] Error handling message:", n), t({ error: n?.message ?? String(n) });
      }), !0;
    } catch (n) {
      return console.error("[v0] onMessage top-level error:", n), t({ error: n.message }), !1;
    }
  }), chrome.notifications.onButtonClicked.addListener(async (e, o) => {
    try {
      if (console.log("[v0] Notification button clicked:", e, o), e.startsWith("suggest-block-") && o === 0) {
        const t = e.replace("suggest-block-", "");
        t && (await B(t), console.log(`[v0] Added ${t} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Ne();
console.log("[v0] Service Worker loaded and listeners attached.");
