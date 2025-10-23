const s = {
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
}, P = {
  // Core settings matching UserSettings
  theme: "system",
  blockMode: "soft",
  notifications: !0,
  syncWithCloud: !1,
  language: "pt-BR",
  telemetry: !1,
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
}, y = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, q = 0.5, j = 1, d = {
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
function S(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function k(e) {
  if (!e) return "";
  try {
    return new URL(e).hostname.replace(/^www\./, "");
  } catch {
    return S(e);
  }
}
let R = null, N = !1, C = !1;
const W = 3e3, Z = 1e3;
function L(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const n = e.charCodeAt(a);
    t = (t << 5) - t + n, t |= 0;
  }
  const o = Math.abs(t) % Z;
  return W + o;
}
async function H() {
  if (C) return;
  C = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(m.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), a = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(m.DAILY_SYNC, {
    when: a,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(a - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (n) => {
    n.name === m.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await V());
  });
}
async function V() {
  const { [s.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((o) => L(o.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (o) {
      console.error("[v0] Error clearing time limit session rules:", o);
    }
}
async function J() {
  N || (N = !0, console.log("[v0] Initializing usage tracker module"), await chrome.alarms.clear(m.USAGE_TRACKER), await chrome.alarms.create(m.USAGE_TRACKER, {
    periodInMinutes: j
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === m.USAGE_TRACKER && await E();
  }), chrome.tabs.onActivated.addListener(Q), chrome.tabs.onUpdated.addListener(X), chrome.windows.onFocusChanged.addListener(ee), await G());
}
async function Q(e) {
  await E();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await M(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await h();
  }
}
async function X(e, t) {
  e === R && t.url && (await E(), await M(e, t.url));
}
async function ee(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await E(), await h()) : await G();
}
async function G() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await M(e.id, e.url) : await h();
}
async function M(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await h();
    return;
  }
  R = e;
  const o = {
    url: t,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [s.CURRENTLY_TRACKING]: o });
}
async function h() {
  R = null, await chrome.storage.session.remove(s.CURRENTLY_TRACKING);
}
async function E() {
  const t = (await chrome.storage.session.get(s.CURRENTLY_TRACKING))[s.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) return;
  const o = k(t.url);
  if (!o) {
    await h();
    return;
  }
  const a = Math.floor((Date.now() - t.startTime) / 1e3);
  if (t.startTime = Date.now(), await chrome.storage.session.set({ [s.CURRENTLY_TRACKING]: t }), a < 1) return;
  const n = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [s.DAILY_USAGE]: i = {} } = await chrome.storage.local.get(
    s.DAILY_USAGE
  );
  i[n] || (i[n] = {}), i[n][o] = (i[n][o] || 0) + a, await chrome.storage.local.set({ [s.DAILY_USAGE]: i }), console.log("[v0] Recorded usage:", o, a, "seconds"), await u(), await B(o, i[n][o]);
}
async function B(e, t) {
  const { [s.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  ), a = o.find((r) => r.domain === e);
  if (!a) return;
  const n = a.dailyMinutes ?? a.limitMinutes ?? 0, i = n * 60;
  if (t >= i) {
    const r = L(e);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [r],
        // remove se já existir
        addRules: [
          {
            id: r,
            priority: 3,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter: `||${e}`,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
            }
          }
        ]
      }), console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${r} added.`
      ), await Y() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${n} minutos em ${e} hoje.`
      });
    } catch (c) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, c);
    }
  }
}
async function te(e, t) {
  const o = S(e);
  if (!o) return;
  const { [s.TIME_LIMITS]: a = [] } = await chrome.storage.local.get(
    s.TIME_LIMITS
  ), n = Array.isArray(a) ? a : [], i = n.findIndex((c) => c.domain === o), r = L(o);
  if (t > 0) {
    if (i >= 0)
      n[i].dailyMinutes = t;
    else {
      const w = ($) => $;
      n.push({ domain: w(o), dailyMinutes: t });
    }
    const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [s.DAILY_USAGE]: l = {} } = await chrome.storage.local.get(
      s.DAILY_USAGE
    ), g = l?.[c]?.[o] || 0;
    if (g >= t * 60)
      await B(o, g);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
      } catch {
      }
  } else if (i >= 0) {
    n.splice(i, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${o}`);
  }
  await chrome.storage.local.set({ [s.TIME_LIMITS]: n }), await u(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const f = "__contentSuggestNotified__", K = 3 * 60 * 60 * 1e3;
async function oe() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [f]: e = {} } = await chrome.storage.session.get(f), t = Date.now();
    let o = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || t - e[a] > K) && (delete e[a], o = !0);
    o && await chrome.storage.session.set({ [f]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function ae(e) {
  try {
    const { [f]: t = {} } = await chrome.storage.session.get(f), o = t?.[e], a = Date.now();
    return o && a - o < K ? !1 : (await chrome.storage.session.set({
      [f]: { ...t || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function ne(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await Y() || !(e.classification === "distracting" && e.score > q) || !e?.url) return;
    const t = k(e.url);
    if (!t) return;
    const { [s.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      s.BLACKLIST
    );
    if (o.some((i) => i.domain === t) || !await ae(t))
      return;
    const n = `suggest-block-${t}`;
    await chrome.notifications.create(n, {
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
function p(e, t) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != typeof t) return !1;
  if (Array.isArray(e)) {
    if (!Array.isArray(t) || e.length !== t.length) return !1;
    for (let o = 0; o < e.length; o++)
      if (!p(e[o], t[o])) return !1;
    return !0;
  }
  if (typeof e == "object") {
    const o = Object.keys(e).sort(), a = Object.keys(t).sort();
    if (o.length !== a.length) return !1;
    for (let n = 0; n < o.length; n++)
      if (o[n] !== a[n] || !p(e[o[n]], t[a[n]])) return !1;
    return !0;
  }
  return !1;
}
async function u() {
  try {
    const e = await D();
    try {
      if (u._lastEmitted && p(u._lastEmitted, e))
        return;
      try {
        u._lastEmitted = JSON.parse(JSON.stringify(e));
      } catch {
        u._lastEmitted = e;
      }
    } catch {
    }
    chrome.runtime.sendMessage({ type: d.STATE_UPDATED, payload: { state: e } }, () => {
      const t = chrome.runtime.lastError, o = t?.message ?? "", n = [
        "Receiving end does not exist",
        "The message port closed before a response was received"
      ].some((i) => o === i || o.startsWith(i));
      t && !n && console.warn("[v0] notifyStateUpdate lastError:", t.message);
    });
    try {
      for (const t of I)
        try {
          t.postMessage({ type: d.STATE_UPDATED, payload: { state: e } });
        } catch (o) {
          console.warn("[v0] Failed to post state to port:", o);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function Y() {
  try {
    const { [s.SETTINGS]: e } = await chrome.storage.sync.get(s.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function D() {
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
    blacklist: (t[s.BLACKLIST] || []).map(
      (a) => typeof a == "object" && a !== null && "domain" in a ? String(a.domain) : String(a)
    ),
    timeLimits: t[s.TIME_LIMITS] || [],
    dailyUsage: t[s.DAILY_USAGE] || {},
    pomodoro: t[s.POMODORO_STATUS] || {
      config: y,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[s.SITE_CUSTOMIZATIONS] || {},
    settings: o[s.SETTINGS] || P
  };
}
const I = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    I.add(e), D().then((t) => {
      try {
        e.postMessage({ type: d.STATE_UPDATED, payload: { state: t } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      I.delete(e);
    });
  } catch {
    try {
      I.delete(e);
    } catch {
    }
  }
});
async function se(e, t) {
  const o = e.skipNotify === !0, a = () => !o && u();
  switch (e.type) {
    case d.GET_INITIAL_STATE:
      return await D();
    case d.ADD_TO_BLACKLIST: {
      const n = e.payload?.domain;
      return typeof n == "string" && await x(n), await a(), { success: !0 };
    }
    case d.REMOVE_FROM_BLACKLIST: {
      const n = e.payload?.domain;
      return typeof n == "string" && await ce(n), await a(), { success: !0 };
    }
    case d.POMODORO_START:
      return await ue(e.payload || void 0), { success: !0 };
    case d.POMODORO_STOP:
      return await me(), { success: !0 };
    case d.TIME_LIMIT_SET: {
      const n = e.payload, i = n?.domain, r = n?.dailyMinutes ?? n?.limitMinutes;
      return typeof i == "string" && typeof r == "number" && await te(i, r), await a(), { success: !0 };
    }
    case d.CONTENT_ANALYSIS_RESULT:
      return await ne(e.payload?.result), await a(), { success: !0 };
    case d.STATE_PATCH: {
      const n = e.payload ?? {}, i = n && n.patch && n.patch.settings ? n.patch.settings : n.settings ?? n;
      if (!i || typeof i != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [s.SETTINGS]: r } = await chrome.storage.sync.get(s.SETTINGS), c = { ...r ?? {}, ...i ?? {} }, l = JSON.stringify(r ?? {}), g = JSON.stringify(c);
      return l === g ? { success: !0 } : (await chrome.storage.sync.set({ [s.SETTINGS]: c }), await a(), { success: !0 });
    }
    case d.SITE_CUSTOMIZATION_UPDATED: {
      const { [s.SITE_CUSTOMIZATIONS]: n } = await chrome.storage.local.get(s.SITE_CUSTOMIZATIONS), i = e.payload;
      let r = { ...n ?? {} };
      return i && typeof i == "object" && !Array.isArray(i) && (i.domain && i.config ? r = { ...r, [String(i.domain)]: i.config } : r = { ...r, ...i }), await chrome.storage.local.set({ [s.SITE_CUSTOMIZATIONS]: r }), await u(), { success: !0 };
    }
    case d.TOGGLE_ZEN_MODE: {
      const [n] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (n?.id)
        try {
          await chrome.tabs.sendMessage(n.id, {
            type: d.TOGGLE_ZEN_MODE,
            payload: e.payload
          });
        } catch (i) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${n.id}. It may be a protected page or the content script wasn't injected.`,
            i
          );
        }
      return { success: !0 };
    }
    case d.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const n = e.type;
      throw new Error(`Unknown message type: ${n}`);
    }
  }
}
const _ = 1e3, T = 2e3, A = 1e3;
let O = Promise.resolve();
function v(e) {
  return O = O.then(e, e), O;
}
function ie(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const n = e.charCodeAt(a);
    t = (t << 5) - t + n, t |= 0;
  }
  const o = Math.abs(t) % A;
  return T + o;
}
async function re() {
  console.log("[v0] Initializing blocker module"), await b();
}
async function x(e) {
  const o = (await chrome.storage.local.get(
    s.BLACKLIST
  ))[s.BLACKLIST] ?? [], a = S(e);
  if (!a) return;
  if (o.some((r) => r.domain === a)) {
    console.log("[v0] Domain already in blacklist:", a);
    return;
  }
  const n = (r) => r, i = [
    ...o,
    { domain: n(a), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const r = o;
    if (r.length === i.length && r.every((l, g) => l.domain === i[g].domain && l.addedAt === i[g].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [s.BLACKLIST]: i }), await b(), await u(), console.log("[v0] Added to blacklist:", a);
}
async function ce(e) {
  const o = (await chrome.storage.local.get(
    s.BLACKLIST
  ))[s.BLACKLIST] ?? [], a = S(e);
  if (!a) return;
  const n = o.filter((i) => i.domain !== a);
  if (n.length !== o.length) {
    try {
      if (n.length === o.length && n.every((r, c) => r.domain === o[c].domain && r.addedAt === o[c].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [s.BLACKLIST]: n }), await b(), await u(), console.log("[v0] Removed from blacklist:", a);
  }
}
async function b() {
  const { [s.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    s.BLACKLIST
  );
  return v(async () => {
    const t = await chrome.declarativeNetRequest.getDynamicRules(), o = new Set(
      t.map((r) => r.id).filter(
        (r) => r >= T && r < T + A
      )
    ), a = [], n = /* @__PURE__ */ new Set();
    for (const r of e) {
      const c = S(r.domain);
      if (!c) continue;
      let l = ie(c), g = 0;
      const w = A;
      for (; n.has(l) || o.has(l); ) {
        if (g++, g >= w)
          throw console.error("[v0] Unable to find free rule ID in USER_BLACKLIST range; aborting sync for domain:", c), new Error("USER_BLACKLIST_RULE_ID_RANGE_EXHAUSTED");
        if (l++, l >= T + A && (l = T), !n.has(l) && !o.has(l)) break;
      }
      n.add(l), o.has(l) || a.push({
        id: l,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK
        },
        condition: {
          urlFilter: `||${c}`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
          ]
        }
      });
    }
    const i = Array.from(o).filter(
      (r) => !n.has(r)
    );
    a.length > 0 || i.length > 0 ? (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: i,
      addRules: a
    }), console.log(
      "[v0] User blocking rules synced:",
      a.length,
      "rules added,",
      i.length,
      "rules removed."
    )) : console.log("[v0] User blocking rules already in sync.");
  });
}
async function le() {
  const { [s.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    s.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = e.map(
    (o, a) => {
      const n = S(o.domain);
      return {
        id: _ + a,
        // sequência simples e previsível
        priority: 2,
        // acima das regras de usuário
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK
        },
        condition: {
          urlFilter: `||${n}`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
          ]
        }
      };
    }
  );
  return v(async () => {
    const a = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter((n) => n >= _ && n < T);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: a,
      addRules: t
    }), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function F() {
  return v(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter((o) => o >= _ && o < T);
    t.length > 0 && (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: t
    }), console.log(
      "[v0] Pomodoro blocking disabled. Removed",
      t.length,
      "rules."
    ));
  });
}
async function de() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === m.POMODORO && await ge();
  });
}
async function ue(e) {
  const { [s.POMODORO_STATUS]: t } = await chrome.storage.local.get(s.POMODORO_STATUS), a = { ...t?.config || y, ...e || {} }, n = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (t?.state?.cycleIndex || 0) + 1,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    endsAt: void 0,
    remainingMs: a.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: a, state: n } }), await chrome.alarms.create(m.POMODORO, { delayInMinutes: a.focusMinutes }), await le(), await u();
  const i = (await chrome.storage.sync.get(s.SETTINGS))[s.SETTINGS];
  (i?.notifications ?? i?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${a.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", n);
}
async function me() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, o = e?.config || y;
  await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: o, state: t } }), await chrome.alarms.clear(m.POMODORO), await F(), await u(), console.log("[v0] Pomodoro stopped");
}
async function ge() {
  const { [s.POMODORO_STATUS]: e } = await chrome.storage.local.get(s.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || y;
  if (t.phase === "focus") {
    const a = t.cycleIndex % o.cyclesBeforeLongBreak === 0, n = a ? o.longBreakMinutes : o.shortBreakMinutes, i = {
      ...t,
      phase: a ? "long_break" : "short_break",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingMs: n * 60 * 1e3
    };
    await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: o, state: i } }), await chrome.alarms.create(m.POMODORO, { delayInMinutes: n }), await F(), await u();
    const r = (await chrome.storage.sync.get(s.SETTINGS))[s.SETTINGS];
    (r?.notifications ?? r?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-break", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pausa!",
      message: `Descanse por ${n} minutos. Você merece!`
    }), console.log("[v0] Pomodoro: Focus → Break");
  } else if (t.phase === "short_break" || t.phase === "long_break") {
    const a = { phase: "idle", isPaused: !1, cycleIndex: t.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [s.POMODORO_STATUS]: { config: o, state: a } }), await u();
    const n = (await chrome.storage.sync.get(s.SETTINGS))[s.SETTINGS];
    (n?.notifications ?? n?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-cycle-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Ciclo Completo!",
      message: "Pronto para outra sessão de foco?"
    }), console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function Te() {
  console.log("[v0] Initializing Firebase sync module");
  const { [s.SETTINGS]: e } = await chrome.storage.sync.get(s.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(m.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === m.DAILY_SYNC && await fe();
  });
}
async function fe() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [s.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(s.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const a = Object.values(o).reduce((i, r) => i + r, 0), n = Object.entries(o).sort(([, i], [, r]) => r - i).slice(0, 5).map(([i, r]) => ({ domain: i, time: r }));
  console.log("[v0] Daily summary:", { totalTime: a, topSites: n });
}
console.log("[v0] Service Worker starting up...");
async function z() {
  try {
    await de();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    await re();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    await J();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    await H();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    await oe();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    await Te();
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}
async function U() {
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
          const a = String(o?.message ?? o);
          a.includes("Cannot access contents") || a.includes("No matching signature") || a.includes("Cannot access a chrome:// URL") || a.includes("The extensions gallery cannot be scripted") || a.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${t.id}:`, o);
        }
  } catch (e) {
    console.error("[v0] Error while injecting content scripts:", e);
  }
}
chrome.runtime.onInstalled.addListener(async (e) => {
  if (console.log("[v0] Extension installed/updated:", e.reason), e.reason === "install") {
    const t = {
      blacklist: [],
      timeLimits: [],
      dailyUsage: {},
      siteCustomizations: {},
      settings: P
    }, o = {
      phase: "idle",
      isPaused: !1,
      cycleIndex: 0,
      remainingMs: 0
    };
    try {
      await chrome.storage.local.set({
        [s.BLACKLIST]: t.blacklist,
        [s.TIME_LIMITS]: t.timeLimits,
        [s.DAILY_USAGE]: t.dailyUsage,
        [s.SITE_CUSTOMIZATIONS]: t.siteCustomizations,
        [s.POMODORO_STATUS]: { config: y, state: o }
      }), await chrome.storage.sync.set({
        [s.SETTINGS]: t.settings
      }), console.log("[v0] Initial state created");
    } catch (a) {
      console.error("[v0] Failed to create initial state:", a);
    }
    await U();
  }
  e.reason === "update" && await U(), await z();
});
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup"), await z();
});
chrome.runtime.onMessage.addListener(
  (e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), Promise.resolve(se(e, t)).then((a) => o(a)).catch((a) => {
        console.error("[v0] Error handling message:", a), o({ error: a?.message ?? String(a) });
      }), !0;
    } catch (a) {
      return console.error("[v0] onMessage top-level error:", a), o({ error: a.message }), !1;
    }
  }
);
chrome.notifications.onButtonClicked.addListener(
  async (e, t) => {
    try {
      if (console.log("[v0] Notification button clicked:", e, t), e.startsWith("suggest-block-") && t === 0) {
        const o = e.replace("suggest-block-", "");
        o && (await x(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  }
);
console.log("[v0] Service Worker loaded and listeners attached.");
