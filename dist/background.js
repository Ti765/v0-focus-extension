const a = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, T = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, A = {
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
}, p = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, oe = 0.5, ne = 1, m = {
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
function D(e) {
  if (!e) return "";
  const o = e.trim();
  try {
    return new URL(o.startsWith("http") ? o : `https://${o}`).hostname.replace(/^www\./, "");
  } catch {
    return o.split("/")[0].replace(/^www\./, "");
  }
}
function $(e) {
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
function _(e) {
  return `^https?://([^/]*\\.)?${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`;
}
function se(e) {
  if (e.length > 2048)
    return { valid: !1, error: `Regex too long: ${e.length} > 2048` };
  try {
    return new RegExp(e), { valid: !0 };
  } catch (t) {
    return { valid: !1, error: `Invalid regex: ${t}` };
  }
}
async function K() {
  try {
    return {
      debugDNR: ((await chrome.storage.local.get(a.SETTINGS))[a.SETTINGS] || A).debugDNR ?? A.debugDNR ?? !1
    };
  } catch (e) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", e), {
      debugDNR: !1
    };
  }
}
async function Y() {
  return (await K()).debugDNR;
}
async function q() {
  await K();
}
const ae = !0;
let N = null, P = !1, k = !1;
const ie = 3e3, ce = 1e3;
function U(e) {
  let o = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % ce;
  return ie + t;
}
async function re() {
  if (k) return;
  k = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(T.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), o = new Date(e);
  o.setHours(24, 0, 0, 0);
  const t = o.getTime() - e.getTime(), n = Date.now() + Math.max(t, 6e4);
  await chrome.alarms.create(T.DAILY_SYNC, {
    when: n,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(n - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === T.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await le());
  });
}
async function le() {
  const { [a.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const o = e.map((t) => U(t.domain));
  if (o.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: o }), console.log(`[v0] Cleared ${o.length} time limit session rules.`);
    } catch (t) {
      console.error("[v0] Error clearing time limit session rules:", t);
    }
}
async function de() {
  P || (P = !0, console.log("[v0] Initializing usage tracker module"), await q(), await chrome.alarms.clear(T.USAGE_TRACKER), await chrome.alarms.create(T.USAGE_TRACKER, {
    periodInMinutes: ne
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === T.USAGE_TRACKER && await v();
  }), chrome.tabs.onActivated.addListener(ue), chrome.tabs.onUpdated.addListener(ge), chrome.windows.onFocusChanged.addListener(me), await j());
}
async function ue(e) {
  await v();
  try {
    const o = await chrome.tabs.get(e.tabId);
    await b(o.id, o.url);
  } catch (o) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, o), await I();
  }
}
async function ge(e, o) {
  e === N && o.url && (await v(), await b(e, o.url));
}
async function me(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await v(), await I()) : await j();
}
async function j() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await b(e.id, e.url) : await I();
}
async function b(e, o) {
  if (!e || !o || o.startsWith("chrome://") || o.startsWith("chrome-extension://") || o.startsWith("about:")) {
    await I();
    return;
  }
  N = e;
  const t = {
    url: o,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [a.CURRENTLY_TRACKING]: t });
}
async function I() {
  N = null, await chrome.storage.session.remove(a.CURRENTLY_TRACKING);
}
async function v() {
  const o = (await chrome.storage.session.get(a.CURRENTLY_TRACKING))[a.CURRENTLY_TRACKING];
  if (!o || !o.url || !o.startTime) {
    console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: o });
    return;
  }
  const t = $(o.url);
  if (!t) {
    console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: o.url }), await I();
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
  ), c = {
    ...i,
    [s]: i[s] || {}
  };
  c[s] || (c[s] = {}), c[s][t] = (c[s][t] || 0) + n, await chrome.storage.local.set({ [a.DAILY_USAGE]: c }), console.log("[v0] Recorded usage:", t, n, "seconds"), await h(), await W(t, c[s][t]);
}
async function W(e, o) {
  const { [a.TIME_LIMITS]: t } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = (Array.isArray(t) ? t : []).find((l) => l.domain === e);
  if (!s) return;
  const i = s.dailyMinutes ?? s.limitMinutes ?? 0, c = i * 60;
  if (o >= c) {
    const l = U(e);
    try {
      ae && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: o,
        limitSeconds: c,
        limitMinutes: i,
        exceeded: o >= c
      });
      const d = _(e), g = {
        id: l,
        priority: 3,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: d,
          isUrlFilterCaseSensitive: !1,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, r = await Y();
      if (r && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: g.id,
        regex: g.condition.regexFilter,
        domain: e,
        totalSecondsToday: o,
        limitSeconds: c
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [l],
        // remove se já existir
        addRules: [g]
      }), r) {
        const u = await chrome.declarativeNetRequest.getSessionRules();
        console.log("[DNR-DEBUG] All session rules after time limit:", u), console.log("[DNR-DEBUG] Session rules by domain:", u.map((E) => ({
          id: E.id,
          regex: E.condition.regexFilter
        })));
      }
      console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${l} added.`
      ), await V() && chrome.notifications.create(`limit-exceeded-${e}`, {
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
async function he(e, o) {
  const t = D(e);
  if (!t) return;
  const { [a.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    a.TIME_LIMITS
  ), s = Array.isArray(n) ? n : [], i = s.findIndex((l) => l.domain === t), c = U(t);
  if (o > 0) {
    if (i >= 0)
      s[i].dailyMinutes = o;
    else {
      const r = (u) => u;
      s.push({ domain: r(t), dailyMinutes: o });
    }
    const l = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [a.DAILY_USAGE]: d = {} } = await chrome.storage.local.get(
      a.DAILY_USAGE
    ), g = d?.[l]?.[t] || 0;
    if (g >= o * 60)
      await W(t, g);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [c] });
      } catch {
      }
  } else if (i >= 0) {
    s.splice(i, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [c] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${t}`);
  }
  await chrome.storage.local.set({ [a.TIME_LIMITS]: s }), await h(), console.log("[v0] Time limit set/updated:", t, o, "minutes");
}
const S = "__contentSuggestNotified__", Z = 3 * 60 * 60 * 1e3;
async function fe() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [S]: e = {} } = await chrome.storage.session.get(S), o = Date.now();
    let t = !1;
    for (const n of Object.keys(e || {}))
      (typeof e[n] != "number" || o - e[n] > Z) && (delete e[n], t = !0);
    t && await chrome.storage.session.set({ [S]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function Te(e) {
  try {
    const { [S]: o = {} } = await chrome.storage.session.get(S), t = o?.[e], n = Date.now();
    return t && n - t < Z ? !1 : (await chrome.storage.session.set({
      [S]: { ...o || {}, [e]: n }
    }), !0);
  } catch {
    return !0;
  }
}
async function ye(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await V() || !(e.classification === "distracting" && e.score > oe) || !e?.url) return;
    const o = $(e.url);
    if (!o) return;
    const { [a.BLACKLIST]: t = [] } = await chrome.storage.local.get(
      a.BLACKLIST
    );
    if (t.some((i) => i.domain === o) || !await Te(o))
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
let x = "";
async function h() {
  try {
    const e = await L(), o = JSON.stringify(e, (t, n) => {
      if (n && typeof n == "object" && !Array.isArray(n)) {
        const s = {};
        return Object.keys(n).sort().forEach((i) => {
          s[i] = n[i];
        }), s;
      }
      return n;
    });
    if (o === x)
      return;
    x = o, chrome.runtime.sendMessage({ type: m.STATE_UPDATED, payload: { state: e } }, () => {
      const t = chrome.runtime.lastError, n = t?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist"
      ].some((c) => n === c || n.startsWith(c));
      t && !i && console.warn("[v0] notifyStateUpdate lastError:", t.message);
    });
    try {
      for (const t of w)
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
async function V() {
  try {
    const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function L() {
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
      config: p,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: o[a.SITE_CUSTOMIZATIONS] || {},
    settings: t[a.SETTINGS] || A
  };
}
const w = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    w.add(e), L().then((o) => {
      try {
        e.postMessage({ type: m.STATE_UPDATED, payload: { state: o } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      w.delete(e);
    });
  } catch {
    try {
      w.delete(e);
    } catch {
    }
  }
});
async function Se(e, o) {
  switch (console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", o), e.type) {
    case m.GET_INITIAL_STATE:
      return await L();
    case m.ADD_TO_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await G(t), await h(), { success: !0 };
    }
    case m.REMOVE_FROM_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await Q(t), await h(), { success: !0 };
    }
    case m.POMODORO_START:
      return await pe(e.payload || void 0), { success: !0 };
    case m.POMODORO_STOP:
      return await De(), { success: !0 };
    case m.TIME_LIMIT_SET: {
      const t = e.payload, n = t?.domain, s = t?.dailyMinutes ?? t?.limitMinutes;
      return typeof n == "string" && typeof s == "number" && await he(n, s), await h(), { success: !0 };
    }
    case m.CONTENT_ANALYSIS_RESULT:
      return await ye(e.payload?.result), await h(), { success: !0 };
    case m.STATE_PATCH: {
      const t = e.payload ?? {}, n = t.patch?.settings ?? t.settings ?? t;
      if (!n || typeof n != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [a.SETTINGS]: s } = await chrome.storage.sync.get(a.SETTINGS), i = { ...s ?? {}, ...n ?? {} }, c = JSON.stringify(s ?? {}), l = JSON.stringify(i);
      return c === l ? { success: !0 } : (await chrome.storage.sync.set({ [a.SETTINGS]: i }), await h(), { success: !0 });
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
const R = 1e3, f = 2e3, y = 1e3;
let O = Promise.resolve();
function M(e) {
  return O = O.then(e, e), O;
}
function F(e) {
  let o = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % y;
  return f + t;
}
async function H() {
  console.log("[v0] Initializing blocker module"), await q(), await C();
}
async function J() {
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
async function Re() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules(), o = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${e.length}`), e.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    regex: ${t.condition.regexFilter}`);
    }), console.log(`Session rules: ${o.length}`), o.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    regex: ${t.condition.regexFilter}`);
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
async function G(e) {
  const t = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = D(e);
  if (!n) return;
  if (t.some((c) => c.domain === n)) {
    console.log("[v0] Domain already in blacklist:", n);
    return;
  }
  const s = (c) => c, i = [
    ...t,
    { domain: s(n), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const c = t;
    if (c.length === i.length && c.every((d, g) => d.domain === i[g].domain && d.addedAt === i[g].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [a.BLACKLIST]: i }), await C(), await h(), console.log("[v0] Added to blacklist:", n);
}
async function Q(e) {
  const t = (await chrome.storage.local.get(
    a.BLACKLIST
  ))[a.BLACKLIST] ?? [], n = D(e);
  if (!n) return;
  const s = t.filter((i) => i.domain !== n);
  if (s.length !== t.length) {
    try {
      if (s.length === t.length && s.every((c, l) => c.domain === t[l].domain && c.addedAt === t[l].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [a.BLACKLIST]: s }), await C(), await h(), console.log("[v0] Removed from blacklist:", n);
  }
}
async function C() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), M(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const o = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", o.length, "existing DNR rules");
    const t = new Set(
      o.map((c) => c.id).filter(
        (c) => c >= f && c < f + y
      )
    ), n = [], s = /* @__PURE__ */ new Set();
    for (const c of e) {
      const l = D(c.domain);
      if (!l) continue;
      let d = F(l), g = 0;
      const r = y;
      for (; s.has(d) || t.has(d); ) {
        if (g++, g >= r) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${l}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        d++, d >= f + y && (d = f);
      }
      if (g >= r) {
        console.warn(`[v0] Skipping rule for ${l} - no free ID found`);
        continue;
      }
      if (s.add(d), !t.has(d)) {
        const u = _(l), E = se(u);
        if (!E.valid) {
          console.error(`[v0] Invalid DNR regex for ${l}:`, E.error);
          continue;
        }
        console.log("[v0] [DEBUG] Valid regex pattern for", l, ":", u), n.push({
          id: d,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK
          },
          condition: {
            regexFilter: u,
            isUrlFilterCaseSensitive: !1,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
      }
    }
    const i = Array.from(t).filter(
      (c) => !s.has(c)
    );
    if (console.log("[v0] DEBUG: Rules to add:", n.length), console.log("[v0] DEBUG: Rules to remove:", i.length), n.length > 0 || i.length > 0) {
      const c = await Y();
      c && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((r) => r.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", n.map((r) => ({
        id: r.id,
        regex: r.condition.regexFilter,
        domain: e.find((u) => F(u.domain) === r.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i)), console.log("[v0] DEBUG: Updating DNR rules...");
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: i,
          addRules: n
        }), console.log("[v0] DEBUG: DNR rules successfully applied");
        const r = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[v0] DEBUG: Current DNR rules count:", r.length), console.log("[v0] DEBUG: Current DNR rules:", r);
      } catch (r) {
        throw console.error("[v0] ERROR: DNR updateDynamicRules FAILED:", r), console.error("[v0] ERROR: Failed rules:", n), console.error("[v0] ERROR: Attempted to remove:", i), r;
      }
      const l = await chrome.declarativeNetRequest.getDynamicRules(), d = l.filter((r) => r.id >= f && r.id < f + y), g = l.filter((r) => r.id >= R && r.id < f);
      if (console.log(`[v0] DNR Verification: ${d.length} blacklist rules, ${g.length} pomodoro rules`), n.length > 0 && d.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), c) {
        const r = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", r), console.log("[DNR-DEBUG] Total rules count:", r.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: r.filter((u) => u.id >= R && u.id < f).length,
          blacklist: r.filter((u) => u.id >= f && u.id < f + y).length,
          other: r.filter((u) => u.id < R || u.id >= f + y).length
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
async function X() {
  const { [a.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    a.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const o = e.map(
    (t, n) => {
      const s = D(t.domain), i = _(s);
      return {
        id: R + n,
        // sequência simples e previsível
        priority: 2,
        // acima das regras de usuário
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK
        },
        condition: {
          // Bloqueia navegações para o domínio (e subdomínios)
          regexFilter: i,
          isUrlFilterCaseSensitive: !1,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      };
    }
  );
  return M(async () => {
    const n = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter((i) => i >= R && i < f);
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(o, null, 2)), await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: n,
      addRules: o
    });
    const s = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(s, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function B() {
  return M(async () => {
    const o = (await chrome.declarativeNetRequest.getDynamicRules()).map((t) => t.id).filter((t) => t >= R && t < f);
    o.length > 0 && (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: o
    }), console.log(
      "[v0] Pomodoro blocking disabled. Removed",
      o.length,
      "rules."
    ));
  });
}
const ee = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: G,
  cleanupAllDNRRules: J,
  debugDNRStatus: Re,
  disablePomodoroBlocking: B,
  enablePomodoroBlocking: X,
  initializeBlocker: H,
  removeFromBlacklist: Q
}, Symbol.toStringTag, { value: "Module" }));
async function Ee() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === T.POMODORO && await Ie();
  });
}
async function pe(e) {
  const { [a.POMODORO_STATUS]: o } = await chrome.storage.local.get(a.POMODORO_STATUS), n = { ...o?.config || p, ...e || {} }, s = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (o?.state?.cycleIndex || 0) + 1,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    endsAt: void 0,
    remainingMs: n.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: n, state: s } }), await chrome.alarms.create(T.POMODORO, { delayInMinutes: n.focusMinutes }), await X(), await h();
  const i = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
  (i?.notifications ?? i?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${n.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", s);
}
async function De() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS), o = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, t = e?.config || p;
  await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: t, state: o } }), await chrome.alarms.clear(T.POMODORO), await B(), await h(), console.log("[v0] Pomodoro stopped");
}
async function Ie() {
  const { [a.POMODORO_STATUS]: e } = await chrome.storage.local.get(a.POMODORO_STATUS);
  if (!e?.state) return;
  const o = e.state, t = e.config || p;
  if (o.phase === "focus") {
    const n = o.cycleIndex % t.cyclesBeforeLongBreak === 0, s = n ? t.longBreakMinutes : t.shortBreakMinutes, i = {
      ...o,
      phase: n ? "long_break" : "short_break",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingMs: s * 60 * 1e3
    };
    await chrome.storage.local.set({ [a.POMODORO_STATUS]: { config: t, state: i } }), await chrome.alarms.create(T.POMODORO, { delayInMinutes: s }), await B(), await h();
    const c = (await chrome.storage.sync.get(a.SETTINGS))[a.SETTINGS];
    (c?.notifications ?? c?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-break", {
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
async function we() {
  console.log("[v0] Initializing Firebase sync module");
  const { [a.SETTINGS]: e } = await chrome.storage.sync.get(a.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(T.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === T.DAILY_SYNC && await Ae();
  });
}
async function Ae() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [a.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(a.DAILY_USAGE), o = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], t = e[o];
  if (!t) return;
  const n = Object.values(t).reduce((i, c) => i + c, 0), s = Object.entries(t).sort(([, i], [, c]) => c - i).slice(0, 5).map(([i, c]) => ({ domain: i, time: c }));
  console.log("[v0] Daily summary:", { totalTime: n, topSites: s });
}
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function te() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Ee(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await H(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await de(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await re(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await fe(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await we(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function z() {
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
function ve(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), Oe(e);
}
async function Oe(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await J(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
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
        config: p,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: A
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
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await z();
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await z()), console.log("[v0] DEBUG: Starting module initialization..."), await te(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => ee);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => ee);
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
function _e() {
  return console.log("[v0] Extension started on browser startup"), te();
}
function Ne() {
  chrome.runtime.onInstalled.addListener(ve), chrome.runtime.onStartup.addListener(_e), chrome.storage.onChanged.addListener((e, o) => {
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
        t && (await G(t), console.log(`[v0] Added ${t} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Ne();
console.log("[v0] Service Worker loaded and listeners attached.");
