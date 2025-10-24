const n = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, m = {
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
}, oe = 0.5, ae = 1, d = {
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
function R(e) {
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
    const t = new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, ""), a = t.split("."), s = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const i of s)
      if (t.endsWith(`.${i}`))
        return t.split(".").slice(-3).join(".");
    return a.slice(-2).join(".");
  } catch {
    const o = e.replace(/^www\./, "").split("/")[0], t = o.split("."), a = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const s of a)
      if (o.endsWith(`.${s}`))
        return o.split(".").slice(-3).join(".");
    return t.slice(-2).join(".");
  }
}
function _(e) {
  return `^https?://([^/]*\\.)?${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`;
}
async function z() {
  try {
    return {
      debugDNR: ((await chrome.storage.local.get(n.SETTINGS))[n.SETTINGS] || A).debugDNR ?? A.debugDNR ?? !1
    };
  } catch (e) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", e), {
      debugDNR: !1
    };
  }
}
async function Y() {
  return (await z()).debugDNR;
}
async function q() {
  await z();
}
const ne = !0;
let N = null, k = !1, B = !1;
const se = 3e3, ie = 1e3;
function v(e) {
  let o = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e.charCodeAt(a);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % ie;
  return se + t;
}
async function ce() {
  if (B) return;
  B = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(m.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), o = new Date(e);
  o.setHours(24, 0, 0, 0);
  const t = o.getTime() - e.getTime(), a = Date.now() + Math.max(t, 6e4);
  await chrome.alarms.create(m.DAILY_SYNC, {
    when: a,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(a - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === m.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await re());
  });
}
async function re() {
  const { [n.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const o = e.map((t) => v(t.domain));
  if (o.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: o }), console.log(`[v0] Cleared ${o.length} time limit session rules.`);
    } catch (t) {
      console.error("[v0] Error clearing time limit session rules:", t);
    }
}
async function le() {
  k || (k = !0, console.log("[v0] Initializing usage tracker module"), await q(), await chrome.alarms.clear(m.USAGE_TRACKER), await chrome.alarms.create(m.USAGE_TRACKER, {
    periodInMinutes: ae
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === m.USAGE_TRACKER && await O();
  }), chrome.tabs.onActivated.addListener(de), chrome.tabs.onUpdated.addListener(ue), chrome.windows.onFocusChanged.addListener(ge), await j());
}
async function de(e) {
  await O();
  try {
    const o = await chrome.tabs.get(e.tabId);
    await L(o.id, o.url);
  } catch (o) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, o), await w();
  }
}
async function ue(e, o) {
  e === N && o.url && (await O(), await L(e, o.url));
}
async function ge(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await O(), await w()) : await j();
}
async function j() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await L(e.id, e.url) : await w();
}
async function L(e, o) {
  if (!e || !o || o.startsWith("chrome://") || o.startsWith("chrome-extension://") || o.startsWith("about:")) {
    await w();
    return;
  }
  N = e;
  const t = {
    url: o,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: t });
}
async function w() {
  N = null, await chrome.storage.session.remove(n.CURRENTLY_TRACKING);
}
async function O() {
  const o = (await chrome.storage.session.get(n.CURRENTLY_TRACKING))[n.CURRENTLY_TRACKING];
  if (!o || !o.url || !o.startTime) {
    console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: o });
    return;
  }
  const t = $(o.url);
  if (!t) {
    console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: o.url }), await w();
    return;
  }
  const a = Math.floor((Date.now() - o.startTime) / 1e3);
  if (console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: t,
    timeSpent: a,
    url: o.url,
    startTime: new Date(o.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString()
  }), o.startTime = Date.now(), await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: o }), a < 1) {
    console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const s = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: i = {} } = await chrome.storage.local.get(
    n.DAILY_USAGE
  ), c = {
    ...i,
    [s]: i[s] || {}
  };
  c[s] || (c[s] = {}), c[s][t] = (c[s][t] || 0) + a, await chrome.storage.local.set({ [n.DAILY_USAGE]: c }), console.log("[v0] Recorded usage:", t, a, "seconds"), await u(), await W(t, c[s][t]);
}
async function W(e, o) {
  const { [n.TIME_LIMITS]: t } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), s = (Array.isArray(t) ? t : []).find((r) => r.domain === e);
  if (!s) return;
  const i = s.dailyMinutes ?? s.limitMinutes ?? 0, c = i * 60;
  if (o >= c) {
    const r = v(e);
    try {
      ne && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: o,
        limitSeconds: c,
        limitMinutes: i,
        exceeded: o >= c
      });
      const l = _(e), g = {
        id: r,
        priority: 3,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: l,
          isUrlFilterCaseSensitive: !1,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, f = await Y();
      if (f && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: g.id,
        regex: g.condition.regexFilter,
        domain: e,
        totalSecondsToday: o,
        limitSeconds: c
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [r],
        // remove se já existir
        addRules: [g]
      }), f) {
        const h = await chrome.declarativeNetRequest.getSessionRules();
        console.log("[DNR-DEBUG] All session rules after time limit:", h), console.log("[DNR-DEBUG] Session rules by domain:", h.map((G) => ({
          id: G.id,
          regex: G.condition.regexFilter
        })));
      }
      console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${r} added.`
      ), await H() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${i} minutos em ${e} hoje.`
      });
    } catch (l) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, l);
    }
  }
}
async function me(e, o) {
  const t = R(e);
  if (!t) return;
  const { [n.TIME_LIMITS]: a = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), s = Array.isArray(a) ? a : [], i = s.findIndex((r) => r.domain === t), c = v(t);
  if (o > 0) {
    if (i >= 0)
      s[i].dailyMinutes = o;
    else {
      const f = (h) => h;
      s.push({ domain: f(t), dailyMinutes: o });
    }
    const r = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: l = {} } = await chrome.storage.local.get(
      n.DAILY_USAGE
    ), g = l?.[r]?.[t] || 0;
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
  await chrome.storage.local.set({ [n.TIME_LIMITS]: s }), await u(), console.log("[v0] Time limit set/updated:", t, o, "minutes");
}
const y = "__contentSuggestNotified__", Z = 3 * 60 * 60 * 1e3;
async function Te() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [y]: e = {} } = await chrome.storage.session.get(y), o = Date.now();
    let t = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || o - e[a] > Z) && (delete e[a], t = !0);
    t && await chrome.storage.session.set({ [y]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function fe(e) {
  try {
    const { [y]: o = {} } = await chrome.storage.session.get(y), t = o?.[e], a = Date.now();
    return t && a - t < Z ? !1 : (await chrome.storage.session.set({
      [y]: { ...o || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function he(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await H() || !(e.classification === "distracting" && e.score > oe) || !e?.url) return;
    const o = $(e.url);
    if (!o) return;
    const { [n.BLACKLIST]: t = [] } = await chrome.storage.local.get(
      n.BLACKLIST
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
let x = "";
async function u() {
  try {
    const e = await b(), o = JSON.stringify(e, (t, a) => {
      if (a && typeof a == "object" && !Array.isArray(a)) {
        const s = {};
        return Object.keys(a).sort().forEach((i) => {
          s[i] = a[i];
        }), s;
      }
      return a;
    });
    if (o === x)
      return;
    x = o, chrome.runtime.sendMessage({ type: d.STATE_UPDATED, payload: { state: e } }, () => {
      const t = chrome.runtime.lastError, a = t?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist"
      ].some((c) => a === c || a.startsWith(c));
      t && !i && console.warn("[v0] notifyStateUpdate lastError:", t.message);
    });
    try {
      for (const t of E)
        try {
          t.postMessage({ type: d.STATE_UPDATED, payload: { state: e } });
        } catch (a) {
          console.warn("[v0] Failed to post state to port:", a);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function H() {
  try {
    const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function b() {
  const e = [
    n.BLACKLIST,
    n.TIME_LIMITS,
    n.DAILY_USAGE,
    n.POMODORO_STATUS,
    n.SITE_CUSTOMIZATIONS
  ], [o, t] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(n.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (o[n.BLACKLIST] || []).map((a) => typeof a == "string" ? a : typeof a == "object" && a !== null && "domain" in a ? String(a.domain) : String(a)),
    timeLimits: o[n.TIME_LIMITS] || [],
    dailyUsage: o[n.DAILY_USAGE] || {},
    pomodoro: o[n.POMODORO_STATUS] || {
      config: p,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: o[n.SITE_CUSTOMIZATIONS] || {},
    settings: t[n.SETTINGS] || A
  };
}
const E = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    E.add(e), b().then((o) => {
      try {
        e.postMessage({ type: d.STATE_UPDATED, payload: { state: o } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      E.delete(e);
    });
  } catch {
    try {
      E.delete(e);
    } catch {
    }
  }
});
async function Se(e, o) {
  switch (e.type) {
    case d.GET_INITIAL_STATE:
      return await b();
    case d.ADD_TO_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await U(t), await u(), { success: !0 };
    }
    case d.REMOVE_FROM_BLACKLIST: {
      const t = e.payload?.domain;
      return typeof t == "string" && await Q(t), await u(), { success: !0 };
    }
    case d.POMODORO_START:
      return await pe(e.payload || void 0), { success: !0 };
    case d.POMODORO_STOP:
      return await Re(), { success: !0 };
    case d.TIME_LIMIT_SET: {
      const t = e.payload, a = t?.domain, s = t?.dailyMinutes ?? t?.limitMinutes;
      return typeof a == "string" && typeof s == "number" && await me(a, s), await u(), { success: !0 };
    }
    case d.CONTENT_ANALYSIS_RESULT:
      return await he(e.payload?.result), await u(), { success: !0 };
    case d.STATE_PATCH: {
      const t = e.payload ?? {}, a = t.patch?.settings ?? t.settings ?? t;
      if (!a || typeof a != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [n.SETTINGS]: s } = await chrome.storage.sync.get(n.SETTINGS), i = { ...s ?? {}, ...a ?? {} }, c = JSON.stringify(s ?? {}), r = JSON.stringify(i);
      return c === r ? { success: !0 } : (await chrome.storage.sync.set({ [n.SETTINGS]: i }), await u(), { success: !0 });
    }
    case d.SITE_CUSTOMIZATION_UPDATED: {
      const { [n.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(n.SITE_CUSTOMIZATIONS), a = e.payload;
      let s = { ...t ?? {} };
      return a && typeof a == "object" && !Array.isArray(a) && (a.domain && a.config ? s = { ...s, [String(a.domain)]: a.config } : s = { ...s, ...a }), await chrome.storage.local.set({ [n.SITE_CUSTOMIZATIONS]: s }), await u(), { success: !0 };
    }
    case d.TOGGLE_ZEN_MODE: {
      const [t] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (t?.id)
        try {
          await chrome.tabs.sendMessage(t.id, {
            type: d.TOGGLE_ZEN_MODE,
            payload: e.payload
          });
        } catch (a) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${t.id}. It may be a protected page or the content script wasn't injected.`,
            a
          );
        }
      return { success: !0 };
    }
    case d.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const t = e.type;
      throw new Error(`Unknown message type: ${t}`);
    }
  }
}
const I = 1e3, T = 2e3, S = 1e3;
let D = Promise.resolve();
function M(e) {
  return D = D.then(e, e), D;
}
function K(e) {
  let o = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e.charCodeAt(a);
    o = (o << 5) - o + s, o |= 0;
  }
  const t = Math.abs(o) % S;
  return T + t;
}
async function V() {
  console.log("[v0] Initializing blocker module"), await q(), await C();
}
async function J() {
  console.log("[v0] Cleaning up all DNR rules...");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules();
    if (e.length > 0) {
      const t = e.map((a) => a.id);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: t
      }), console.log(`[v0] Removed ${t.length} dynamic rules:`, t);
    }
    const o = await chrome.declarativeNetRequest.getSessionRules();
    if (o.length > 0) {
      const t = o.map((a) => a.id);
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: t
      }), console.log(`[v0] Removed ${t.length} session rules:`, t);
    }
    console.log("[v0] DNR cleanup complete");
  } catch (e) {
    console.error("[v0] Error during DNR cleanup:", e);
  }
}
async function ye() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules(), o = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${e.length}`), e.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    regex: ${t.condition.regexFilter}`);
    }), console.log(`Session rules: ${o.length}`), o.forEach((t) => {
      console.log(`  [${t.id}] priority=${t.priority} action=${t.action.type}`), console.log(`    regex: ${t.condition.regexFilter}`);
    }), e.length > 0 && e[0].condition.regexFilter) {
      const t = new RegExp(e[0].condition.regexFilter), a = [
        "https://youtube.com",
        "https://youtube.com/",
        "https://www.youtube.com",
        "https://www.youtube.com/watch?v=test"
      ];
      console.log("Regex test results:"), a.forEach((s) => {
        console.log(`  ${t.test(s) ? "✅" : "❌"} ${s}`);
      });
    }
  } catch (e) {
    console.error("DNR debug failed:", e);
  }
  console.log("=== END DNR DEBUG ===");
}
async function U(e) {
  const t = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = R(e);
  if (!a) return;
  if (t.some((c) => c.domain === a)) {
    console.log("[v0] Domain already in blacklist:", a);
    return;
  }
  const s = (c) => c, i = [
    ...t,
    { domain: s(a), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const c = t;
    if (c.length === i.length && c.every((l, g) => l.domain === i[g].domain && l.addedAt === i[g].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [n.BLACKLIST]: i }), await C(), await u(), console.log("[v0] Added to blacklist:", a);
}
async function Q(e) {
  const t = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = R(e);
  if (!a) return;
  const s = t.filter((i) => i.domain !== a);
  if (s.length !== t.length) {
    try {
      if (s.length === t.length && s.every((c, r) => c.domain === t[r].domain && c.addedAt === t[r].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [n.BLACKLIST]: s }), await C(), await u(), console.log("[v0] Removed from blacklist:", a);
  }
}
async function C() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  return M(async () => {
    const o = await chrome.declarativeNetRequest.getDynamicRules(), t = new Set(
      o.map((c) => c.id).filter(
        (c) => c >= T && c < T + S
      )
    ), a = [], s = /* @__PURE__ */ new Set();
    for (const c of e) {
      const r = R(c.domain);
      if (!r) continue;
      let l = K(r), g = 0;
      const f = S;
      for (; s.has(l) || t.has(l); ) {
        if (g++, g >= f) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${r}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        l++, l >= T + S && (l = T);
      }
      if (g >= f) {
        console.warn(`[v0] Skipping rule for ${r} - no free ID found`);
        continue;
      }
      if (s.add(l), !t.has(l)) {
        const h = _(r);
        console.log("[v0] [DEBUG] Regex pattern for", r, ":", h), a.push({
          id: l,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK
          },
          condition: {
            regexFilter: h,
            isUrlFilterCaseSensitive: !1,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
      }
    }
    const i = Array.from(t).filter(
      (c) => !s.has(c)
    );
    if (a.length > 0 || i.length > 0) {
      const c = await Y();
      if (c && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((r) => r.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", a.map((r) => ({
        id: r.id,
        regex: r.condition.regexFilter,
        domain: e.find((l) => K(l.domain) === r.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i)), await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: i,
        addRules: a
      }), c) {
        const r = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", r), console.log("[DNR-DEBUG] Total rules count:", r.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: r.filter((l) => l.id >= I && l.id < T).length,
          blacklist: r.filter((l) => l.id >= T && l.id < T + S).length,
          other: r.filter((l) => l.id < I || l.id >= T + S).length
        });
      }
      console.log(
        "[v0] User blocking rules synced:",
        a.length,
        "rules added,",
        i.length,
        "rules removed."
      );
    } else
      console.log("[v0] User blocking rules already in sync.");
  });
}
async function X() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const o = e.map(
    (t, a) => {
      const s = R(t.domain), i = _(s);
      return {
        id: I + a,
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
    const a = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter((i) => i >= I && i < T);
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(o, null, 2)), await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: a,
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
async function P() {
  return M(async () => {
    const o = (await chrome.declarativeNetRequest.getDynamicRules()).map((t) => t.id).filter((t) => t >= I && t < T);
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
  addToBlacklist: U,
  cleanupAllDNRRules: J,
  debugDNRStatus: ye,
  disablePomodoroBlocking: P,
  enablePomodoroBlocking: X,
  initializeBlocker: V,
  removeFromBlacklist: Q
}, Symbol.toStringTag, { value: "Module" }));
async function Ie() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === m.POMODORO && await we();
  });
}
async function pe(e) {
  const { [n.POMODORO_STATUS]: o } = await chrome.storage.local.get(n.POMODORO_STATUS), a = { ...o?.config || p, ...e || {} }, s = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (o?.state?.cycleIndex || 0) + 1,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    endsAt: void 0,
    remainingMs: a.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: a, state: s } }), await chrome.alarms.create(m.POMODORO, { delayInMinutes: a.focusMinutes }), await X(), await u();
  const i = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
  (i?.notifications ?? i?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${a.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", s);
}
async function Re() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS), o = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, t = e?.config || p;
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: t, state: o } }), await chrome.alarms.clear(m.POMODORO), await P(), await u(), console.log("[v0] Pomodoro stopped");
}
async function we() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS);
  if (!e?.state) return;
  const o = e.state, t = e.config || p;
  if (o.phase === "focus") {
    const a = o.cycleIndex % t.cyclesBeforeLongBreak === 0, s = a ? t.longBreakMinutes : t.shortBreakMinutes, i = {
      ...o,
      phase: a ? "long_break" : "short_break",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingMs: s * 60 * 1e3
    };
    await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: t, state: i } }), await chrome.alarms.create(m.POMODORO, { delayInMinutes: s }), await P(), await u();
    const c = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
    (c?.notifications ?? c?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-break", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pausa!",
      message: `Descanse por ${s} minutos. Você merece!`
    }), console.log("[v0] Pomodoro: Focus → Break");
  } else if (o.phase === "short_break" || o.phase === "long_break") {
    const a = { phase: "idle", isPaused: !1, cycleIndex: o.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: t, state: a } }), await u();
    const s = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
    (s?.notifications ?? s?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-cycle-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Ciclo Completo!",
      message: "Pronto para outra sessão de foco?"
    }), console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function Ee() {
  console.log("[v0] Initializing Firebase sync module");
  const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(m.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === m.DAILY_SYNC && await Ae();
  });
}
async function Ae() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [n.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(n.DAILY_USAGE), o = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], t = e[o];
  if (!t) return;
  const a = Object.values(t).reduce((i, c) => i + c, 0), s = Object.entries(t).sort(([, i], [, c]) => c - i).slice(0, 5).map(([i, c]) => ({ domain: i, time: c }));
  console.log("[v0] Daily summary:", { totalTime: a, topSites: s });
}
console.log("[v0] Service Worker starting up...");
async function te() {
  try {
    await Ie();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    await V();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    await le();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    await ce();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    await Te();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    await Ee();
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}
async function F() {
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
          const a = String(t?.message ?? t);
          a.includes("Cannot access contents") || a.includes("No matching signature") || a.includes("Cannot access a chrome:// URL") || a.includes("The extensions gallery cannot be scripted") || a.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${o.id}:`, t);
        }
  } catch (e) {
    console.error("[v0] Error while injecting content scripts:", e);
  }
}
function Oe(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), De(e);
}
async function De(e) {
  console.log("[v0] Extension installed/updated:", e.reason);
  try {
    await J();
  } catch (o) {
    console.error("[v0] Failed to cleanup DNR rules:", o);
  }
  if (e.reason === "install") {
    const o = {
      blacklist: [],
      // Garantir que é array
      timeLimits: [],
      // Garantir que é array
      dailyUsage: {
        [(/* @__PURE__ */ new Date()).toISOString().split("T")[0]]: {}
        // Inicializar com data atual
      },
      siteCustomizations: {},
      settings: A
    }, t = {
      phase: "idle",
      isPaused: !1,
      cycleIndex: 0,
      remainingMs: 0
    };
    try {
      await chrome.storage.local.set({
        [n.BLACKLIST]: o.blacklist,
        [n.TIME_LIMITS]: o.timeLimits,
        [n.DAILY_USAGE]: o.dailyUsage,
        [n.SITE_CUSTOMIZATIONS]: o.siteCustomizations,
        [n.POMODORO_STATUS]: { config: p, state: t }
      }), await chrome.storage.sync.set({
        [n.SETTINGS]: o.settings
      }), console.log("[v0] Initial state created");
    } catch (a) {
      console.error("[v0] Failed to create initial state:", a);
    }
    await F();
  }
  e.reason === "update" && await F(), await te();
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => ee);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => ee);
  await e();
};
function _e() {
  return console.log("[v0] Extension started on browser startup"), te();
}
function Ne() {
  chrome.runtime.onInstalled.addListener(Oe), chrome.runtime.onStartup.addListener(_e), chrome.storage.onChanged.addListener((e, o) => {
    console.log(`[v0] Storage changed in ${o}:`, e), u();
  }), chrome.runtime.onMessage.addListener((e, o, t) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), Promise.resolve(Se(e, o)).then((a) => t(a)).catch((a) => {
        console.error("[v0] Error handling message:", a), t({ error: a?.message ?? String(a) });
      }), !0;
    } catch (a) {
      return console.error("[v0] onMessage top-level error:", a), t({ error: a.message }), !1;
    }
  }), chrome.notifications.onButtonClicked.addListener(async (e, o) => {
    try {
      if (console.log("[v0] Notification button clicked:", e, o), e.startsWith("suggest-block-") && o === 0) {
        const t = e.replace("suggest-block-", "");
        t && (await U(t), console.log(`[v0] Added ${t} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Ne();
console.log("[v0] Service Worker loaded and listeners attached.");
