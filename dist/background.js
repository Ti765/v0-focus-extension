const n = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, u = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, U = {
  analyticsConsent: !1,
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
  notificationsEnabled: !0
}, f = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  adaptiveMode: !1
}, z = 0.5, $ = 1;
function y(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function N(e) {
  if (!e) return "";
  try {
    return new URL(e).hostname.replace(/^www\./, "");
  } catch {
    return y(e);
  }
}
let E = null, M = !1, C = !1;
const q = 3e3, x = 1e3;
function R(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const i = e.charCodeAt(a);
    t = (t << 5) - t + i, t |= 0;
  }
  const o = Math.abs(t) % x;
  return q + o;
}
async function j() {
  if (C) return;
  C = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(u.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), a = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(u.DAILY_SYNC, {
    when: a,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(a - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (i) => {
    i.name === u.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await W());
  });
}
async function W() {
  const { [n.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((o) => R(o.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (o) {
      console.error("[v0] Error clearing time limit session rules:", o);
    }
}
async function Z() {
  M || (M = !0, console.log("[v0] Initializing usage tracker module"), await chrome.alarms.clear(u.USAGE_TRACKER), await chrome.alarms.create(u.USAGE_TRACKER, {
    periodInMinutes: $
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === u.USAGE_TRACKER && await S();
  }), chrome.tabs.onActivated.addListener(H), chrome.tabs.onUpdated.addListener(V), chrome.windows.onFocusChanged.addListener(J), await k());
}
async function H(e) {
  await S();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await O(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await h();
  }
}
async function V(e, t) {
  e === E && t.url && (await S(), await O(e, t.url));
}
async function J(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await S(), await h()) : await k();
}
async function k() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await O(e.id, e.url) : await h();
}
async function O(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await h();
    return;
  }
  E = e;
  const o = {
    url: t,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: o });
}
async function h() {
  E = null, await chrome.storage.session.remove(n.CURRENTLY_TRACKING);
}
async function S() {
  const t = (await chrome.storage.session.get(n.CURRENTLY_TRACKING))[n.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) return;
  const o = N(t.url);
  if (!o) {
    await h();
    return;
  }
  const a = Math.floor((Date.now() - t.startTime) / 1e3);
  if (t.startTime = Date.now(), await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: t }), a < 1) return;
  const i = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: s = {} } = await chrome.storage.local.get(
    n.DAILY_USAGE
  );
  s[i] || (s[i] = {}), s[i][o] = (s[i][o] || 0) + a, await chrome.storage.local.set({ [n.DAILY_USAGE]: s }), console.log("[v0] Recorded usage:", o, a, "seconds"), await l(), await P(o, s[i][o]);
}
async function P(e, t) {
  const { [n.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), a = o.find((s) => s.domain === e);
  if (!a) return;
  const i = a.limitMinutes * 60;
  if (t >= i) {
    const s = R(e);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [s],
        // remove se já existir
        addRules: [
          {
            id: s,
            priority: 3,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter: `||${e}`,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
            }
          }
        ]
      }), console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${s} added.`
      ), await G() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${a.limitMinutes} minutos em ${e} hoje.`
      });
    } catch (r) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, r);
    }
  }
}
async function Q(e, t) {
  const o = y(e);
  if (!o) return;
  const { [n.TIME_LIMITS]: a = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), i = Array.isArray(a) ? a : [], s = i.findIndex((d) => d.domain === o), r = R(o);
  if (t > 0) {
    s >= 0 ? i[s].limitMinutes = t : i.push({ domain: o, limitMinutes: t });
    const d = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: c = {} } = await chrome.storage.local.get(
      n.DAILY_USAGE
    ), D = c?.[d]?.[o] || 0;
    if (D >= t * 60)
      await P(o, D);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
      } catch {
      }
  } else if (s >= 0) {
    i.splice(s, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [r] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${o}`);
  }
  await chrome.storage.local.set({ [n.TIME_LIMITS]: i }), await l(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const g = "__contentSuggestNotified__", B = 3 * 60 * 60 * 1e3;
async function X() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [g]: e = {} } = await chrome.storage.session.get(g), t = Date.now();
    let o = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || t - e[a] > B) && (delete e[a], o = !0);
    o && await chrome.storage.session.set({ [g]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function ee(e) {
  try {
    const { [g]: t = {} } = await chrome.storage.session.get(g), o = t?.[e], a = Date.now();
    return o && a - o < B ? !1 : (await chrome.storage.session.set({
      [g]: { ...t || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function te(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await G() || !(e.classification === "distracting" && e.score > z))
      return;
    const t = N(e.url);
    if (!t) return;
    const { [n.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      n.BLACKLIST
    );
    if (o.some((s) => s.domain === t) || !await ee(t))
      return;
    const i = `suggest-block-${t}`;
    await chrome.notifications.create(i, {
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
function I(e, t) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != typeof t) return !1;
  if (Array.isArray(e)) {
    if (!Array.isArray(t) || e.length !== t.length) return !1;
    for (let o = 0; o < e.length; o++)
      if (!I(e[o], t[o])) return !1;
    return !0;
  }
  if (typeof e == "object") {
    const o = Object.keys(e).sort(), a = Object.keys(t).sort();
    if (o.length !== a.length) return !1;
    for (let i = 0; i < o.length; i++)
      if (o[i] !== a[i] || !I(e[o[i]], t[a[i]])) return !1;
    return !0;
  }
  return !1;
}
async function l() {
  try {
    const e = await L();
    try {
      if (l._lastEmitted && I(l._lastEmitted, e))
        return;
      try {
        l._lastEmitted = JSON.parse(JSON.stringify(e));
      } catch {
        l._lastEmitted = e;
      }
    } catch {
    }
    chrome.runtime.sendMessage({ type: "STATE_UPDATED", payload: e }, () => {
      const t = chrome.runtime.lastError;
      t && !/Receiving end does not exist/.test(t.message || "") && console.warn("[v0] notifyStateUpdate lastError:", t.message);
    });
    try {
      for (const t of T)
        try {
          t.postMessage({ type: "STATE_UPDATED", payload: e });
        } catch (o) {
          console.warn("[v0] Failed to post state to port:", o);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function G() {
  try {
    const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
    return e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function L() {
  const e = [
    n.BLACKLIST,
    n.TIME_LIMITS,
    n.DAILY_USAGE,
    n.POMODORO_STATUS,
    n.SITE_CUSTOMIZATIONS
  ], [t, o] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(n.SETTINGS)
  ]);
  return {
    blacklist: t[n.BLACKLIST] || [],
    timeLimits: t[n.TIME_LIMITS] || [],
    dailyUsage: t[n.DAILY_USAGE] || {},
    pomodoro: t[n.POMODORO_STATUS] || {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: f
    },
    siteCustomizations: t[n.SITE_CUSTOMIZATIONS] || {},
    settings: o[n.SETTINGS] || U
  };
}
const T = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    T.add(e), L().then((t) => {
      try {
        e.postMessage({ type: "STATE_UPDATED", payload: t });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      T.delete(e);
    });
  } catch {
    try {
      T.delete(e);
    } catch {
    }
  }
});
async function oe(e, t) {
  const o = e.skipNotify === !0, a = () => !o && l();
  switch (e.type) {
    case "GET_INITIAL_STATE":
      return await L();
    case "ADD_TO_BLACKLIST":
      return await K(e.payload?.domain), await a(), { success: !0 };
    case "REMOVE_FROM_BLACKLIST":
      return await ie(e.payload?.domain), await a(), { success: !0 };
    case "START_POMODORO":
      return await ce(e.payload), { success: !0 };
    case "STOP_POMODORO":
      return await le(), { success: !0 };
    case "SET_TIME_LIMIT":
      return await Q(e.payload?.domain, e.payload?.limitMinutes), await a(), { success: !0 };
    case "CONTENT_ANALYSIS_RESULT":
      return await te(e.payload), await a(), { success: !0 };
    case "UPDATE_SETTINGS": {
      const { [n.SETTINGS]: i } = await chrome.storage.sync.get(n.SETTINGS), s = { ...i ?? {}, ...e.payload ?? {} };
      return await chrome.storage.sync.set({ [n.SETTINGS]: s }), await a(), { success: !0 };
    }
    case "SITE_CUSTOMIZATION_UPDATED": {
      const { [n.SITE_CUSTOMIZATIONS]: i } = await chrome.storage.local.get(n.SITE_CUSTOMIZATIONS), s = {
        ...i ?? {},
        ...e.payload ?? {}
      };
      return await chrome.storage.local.set({
        [n.SITE_CUSTOMIZATIONS]: s
      }), await l(), { success: !0 };
    }
    case "TOGGLE_ZEN_MODE": {
      const [i] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (i?.id)
        try {
          await chrome.tabs.sendMessage(i.id, {
            type: "TOGGLE_ZEN_MODE",
            payload: e.payload
          });
        } catch (s) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${i.id}. It may be a protected page or the content script wasn't injected.`,
            s
          );
        }
      return { success: !0 };
    }
    case "STATE_UPDATED":
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const i = e.type;
      throw new Error(`Unknown message type: ${i}`);
    }
  }
}
const A = 1e3, m = 2e3, p = 1e3;
let w = Promise.resolve();
function _(e) {
  return w = w.then(e, e), w;
}
function ae(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const i = e.charCodeAt(a);
    t = (t << 5) - t + i, t |= 0;
  }
  const o = Math.abs(t) % p;
  return m + o;
}
async function ne() {
  console.log("[v0] Initializing blocker module"), await v();
}
async function K(e) {
  const o = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = y(e);
  if (!a) return;
  if (o.some((s) => s.domain === a)) {
    console.log("[v0] Domain already in blacklist:", a);
    return;
  }
  const i = [
    ...o,
    { domain: a, addedAt: Date.now() }
  ];
  try {
    const s = o;
    if (s.length === i.length && s.every((d, c) => d.domain === i[c].domain && d.addedAt === i[c].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [n.BLACKLIST]: i }), await v(), await l(), console.log("[v0] Added to blacklist:", a);
}
async function ie(e) {
  const o = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = y(e);
  if (!a) return;
  const i = o.filter((s) => s.domain !== a);
  if (i.length !== o.length) {
    try {
      if (i.length === o.length && i.every((r, d) => r.domain === o[d].domain && r.addedAt === o[d].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [n.BLACKLIST]: i }), await v(), await l(), console.log("[v0] Removed from blacklist:", a);
  }
}
async function v() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  return _(async () => {
    const t = await chrome.declarativeNetRequest.getDynamicRules(), o = new Set(
      t.map((r) => r.id).filter(
        (r) => r >= m && r < m + p
      )
    ), a = [], i = /* @__PURE__ */ new Set();
    for (const r of e) {
      const d = y(r.domain);
      if (!d) continue;
      let c = ae(d);
      for (; (i.has(c) || o.has(c)) && (c++, c >= m + p && (c = m), i.has(c) || o.has(c), !(!i.has(c) && !o.has(c))); )
        ;
      i.add(c), o.has(c) || a.push({
        id: c,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK
        },
        condition: {
          urlFilter: `||${d}`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
          ]
        }
      });
    }
    const s = Array.from(o).filter(
      (r) => !i.has(r)
    );
    a.length > 0 || s.length > 0 ? (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: s,
      addRules: a
    }), console.log(
      "[v0] User blocking rules synced:",
      a.length,
      "rules added,",
      s.length,
      "rules removed."
    )) : console.log("[v0] User blocking rules already in sync.");
  });
}
async function se() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = e.map(
    (o, a) => {
      const i = y(o.domain);
      return {
        id: A + a,
        // sequência simples e previsível
        priority: 2,
        // acima das regras de usuário
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK
        },
        condition: {
          urlFilter: `||${i}`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
          ]
        }
      };
    }
  );
  return _(async () => {
    const a = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter((i) => i >= A && i < m);
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
  return _(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter((o) => o >= A && o < m);
    t.length > 0 && (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: t
    }), console.log(
      "[v0] Pomodoro blocking disabled. Removed",
      t.length,
      "rules."
    ));
  });
}
async function re() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === u.POMODORO && await de();
  });
}
async function ce(e) {
  const { [n.POMODORO_STATUS]: t } = await chrome.storage.local.get(n.POMODORO_STATUS), o = { ...t?.config || f, ...e }, a = {
    state: "FOCUS",
    startTime: Date.now(),
    timeRemaining: o.focusMinutes * 60,
    currentCycle: (t?.currentCycle || 0) + 1,
    config: o
  };
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: a }), await chrome.alarms.create(u.POMODORO, { delayInMinutes: o.focusMinutes }), await se(), await l(), o.notificationsEnabled && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${o.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", a);
}
async function le() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS), t = {
    state: "IDLE",
    timeRemaining: 0,
    currentCycle: 0,
    // Reseta o ciclo ao parar
    config: e?.config || f,
    startTime: void 0
  };
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: t }), await chrome.alarms.clear(u.POMODORO), await F(), await l(), console.log("[v0] Pomodoro stopped");
}
async function de() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS);
  if (e) {
    if (e.state === "FOCUS") {
      const o = e.currentCycle % e.config.cyclesBeforeLongBreak === 0 ? e.config.longBreakMinutes : e.config.breakMinutes, a = { ...e, state: "BREAK", startTime: Date.now(), timeRemaining: o * 60 };
      await chrome.storage.local.set({ [n.POMODORO_STATUS]: a }), await chrome.alarms.create(u.POMODORO, { delayInMinutes: o }), await F(), await l(), e.config.notificationsEnabled && chrome.notifications.create("pomodoro-break", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pausa!",
        message: `Descanse por ${o} minutos. Você merece!`
      }), console.log("[v0] Pomodoro: Focus → Break");
    } else if (e.state === "BREAK") {
      e.config.adaptiveMode && e.currentCycle % e.config.cyclesBeforeLongBreak === 0 && (e.config.focusMinutes += 5, console.log("[v0] Adaptive mode: Focus time increased to", e.config.focusMinutes));
      const t = { ...e, state: "IDLE", timeRemaining: 0, startTime: void 0 };
      await chrome.storage.local.set({ [n.POMODORO_STATUS]: t }), await l(), e.config.notificationsEnabled && chrome.notifications.create("pomodoro-cycle-complete", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?"
      }), console.log("[v0] Pomodoro: Break → Idle");
    }
  }
}
async function ue() {
  console.log("[v0] Initializing Firebase sync module");
  const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(u.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === u.DAILY_SYNC && await me();
  });
}
async function me() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [n.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(n.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const a = Object.values(o).reduce((s, r) => s + r, 0), i = Object.entries(o).sort(([, s], [, r]) => r - s).slice(0, 5).map(([s, r]) => ({ domain: s, time: r }));
  console.log("[v0] Daily summary:", { totalTime: a, topSites: i });
}
console.log("[v0] Service Worker starting up...");
async function Y() {
  try {
    await re();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    await ne();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    await Z();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    await j();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    await X();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    await ue();
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}
async function b() {
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
          a.includes("Cannot access contents of url") || a.includes("No matching signature") || a.includes("Cannot access a chrome:// URL") || a.includes("The extensions gallery cannot be scripted") || console.warn(`[v0] Failed to inject in tab ${t.id}:`, o);
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
      settings: U
    }, o = {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: f
    };
    try {
      await chrome.storage.local.set({
        [n.BLACKLIST]: t.blacklist,
        [n.TIME_LIMITS]: t.timeLimits,
        [n.DAILY_USAGE]: t.dailyUsage,
        [n.SITE_CUSTOMIZATIONS]: t.siteCustomizations,
        [n.POMODORO_STATUS]: o
      }), await chrome.storage.sync.set({
        [n.SETTINGS]: t.settings
      }), console.log("[v0] Initial state created");
    } catch (a) {
      console.error("[v0] Failed to create initial state:", a);
    }
    await b();
  }
  e.reason === "update" && await b(), await Y();
});
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup"), await Y();
});
chrome.runtime.onMessage.addListener(
  (e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), Promise.resolve(oe(e, t)).then((a) => o(a)).catch((a) => {
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
        o && (await K(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  }
);
console.log("[v0] Service Worker loaded and listeners attached.");
