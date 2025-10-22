const i = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, l = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, b = {
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
}, S = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  adaptiveMode: !1
}, F = 0.5, z = 1;
function T(e) {
  if (!e) return "";
  let t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function U(e) {
  if (!e) return "";
  try {
    return new URL(e).hostname.replace(/^www\./, "");
  } catch {
    return T(e);
  }
}
let p = null, D = !1, M = !1;
const $ = 3e3, q = 1e3;
function R(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const n = e.charCodeAt(a);
    t = (t << 5) - t + n, t |= 0;
  }
  const o = Math.abs(t) % q;
  return $ + o;
}
async function x() {
  if (M) return;
  M = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(l.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), a = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(l.DAILY_SYNC, {
    when: a,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(a - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (n) => {
    n.name === l.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await j());
  });
}
async function j() {
  const { [i.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    i.TIME_LIMITS
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
async function W() {
  D || (D = !0, console.log("[v0] Initializing usage tracker module"), await chrome.alarms.clear(l.USAGE_TRACKER), await chrome.alarms.create(l.USAGE_TRACKER, {
    periodInMinutes: z
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === l.USAGE_TRACKER && await f();
  }), chrome.tabs.onActivated.addListener(Z), chrome.tabs.onUpdated.addListener(H), chrome.windows.onFocusChanged.addListener(V), await N());
}
async function Z(e) {
  await f();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await E(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await y();
  }
}
async function H(e, t) {
  e === p && t.url && (await f(), await E(e, t.url));
}
async function V(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await f(), await y()) : await N();
}
async function N() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await E(e.id, e.url) : await y();
}
async function E(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await y();
    return;
  }
  p = e;
  const o = {
    url: t,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [i.CURRENTLY_TRACKING]: o });
}
async function y() {
  p = null, await chrome.storage.session.remove(i.CURRENTLY_TRACKING);
}
async function f() {
  const t = (await chrome.storage.session.get(i.CURRENTLY_TRACKING))[i.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) return;
  const o = U(t.url);
  if (!o) {
    await y();
    return;
  }
  const a = Math.floor((Date.now() - t.startTime) / 1e3);
  if (t.startTime = Date.now(), await chrome.storage.session.set({ [i.CURRENTLY_TRACKING]: t }), a < 1) return;
  const n = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [i.DAILY_USAGE]: s = {} } = await chrome.storage.local.get(
    i.DAILY_USAGE
  );
  s[n] || (s[n] = {}), s[n][o] = (s[n][o] || 0) + a, await chrome.storage.local.set({ [i.DAILY_USAGE]: s }), console.log("[v0] Recorded usage:", o, a, "seconds"), await u(), await k(o, s[n][o]);
}
async function k(e, t) {
  const { [i.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    i.TIME_LIMITS
  ), a = o.find((s) => s.domain === e);
  if (!a) return;
  const n = a.limitMinutes * 60;
  if (t >= n) {
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
      ), await B() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${a.limitMinutes} minutos em ${e} hoje.`
      });
    } catch (c) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, c);
    }
  }
}
async function Q(e, t) {
  const o = T(e);
  if (!o) return;
  const { [i.TIME_LIMITS]: a = [] } = await chrome.storage.local.get(
    i.TIME_LIMITS
  ), n = Array.isArray(a) ? a : [], s = n.findIndex((d) => d.domain === o), c = R(o);
  if (t > 0) {
    s >= 0 ? n[s].limitMinutes = t : n.push({ domain: o, limitMinutes: t });
    const d = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [i.DAILY_USAGE]: r = {} } = await chrome.storage.local.get(
      i.DAILY_USAGE
    ), v = r?.[d]?.[o] || 0;
    if (v >= t * 60)
      await k(o, v);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [c] });
      } catch {
      }
  } else if (s >= 0) {
    n.splice(s, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [c] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${o}`);
  }
  await chrome.storage.local.set({ [i.TIME_LIMITS]: n }), await u(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const g = "__contentSuggestNotified__", P = 3 * 60 * 60 * 1e3;
async function J() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [g]: e = {} } = await chrome.storage.session.get(g), t = Date.now();
    let o = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || t - e[a] > P) && (delete e[a], o = !0);
    o && await chrome.storage.session.set({ [g]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function X(e) {
  try {
    const { [g]: t = {} } = await chrome.storage.session.get(g), o = t?.[e], a = Date.now();
    return o && a - o < P ? !1 : (await chrome.storage.session.set({
      [g]: { ...t || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function ee(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await B() || !(e.classification === "distracting" && e.score > F))
      return;
    const t = U(e.url);
    if (!t) return;
    const { [i.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      i.BLACKLIST
    );
    if (o.some((s) => s.domain === t) || !await X(t))
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
async function u() {
  try {
    const e = await L();
    chrome.runtime.sendMessage({ type: "STATE_UPDATED", payload: e }, () => {
      const t = chrome.runtime.lastError;
      t && !/Receiving end does not exist/.test(t.message || "") && console.warn("[v0] notifyStateUpdate lastError:", t.message);
    });
    try {
      for (const t of h)
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
async function B() {
  try {
    const { [i.SETTINGS]: e } = await chrome.storage.sync.get(i.SETTINGS);
    return e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function L() {
  const e = [
    i.BLACKLIST,
    i.TIME_LIMITS,
    i.DAILY_USAGE,
    i.POMODORO_STATUS,
    i.SITE_CUSTOMIZATIONS
  ], [t, o] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(i.SETTINGS)
  ]);
  return {
    blacklist: t[i.BLACKLIST] || [],
    timeLimits: t[i.TIME_LIMITS] || [],
    dailyUsage: t[i.DAILY_USAGE] || {},
    pomodoro: t[i.POMODORO_STATUS] || {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: S
    },
    siteCustomizations: t[i.SITE_CUSTOMIZATIONS] || {},
    settings: o[i.SETTINGS] || b
  };
}
const h = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    h.add(e), L().then((t) => {
      try {
        e.postMessage({ type: "STATE_UPDATED", payload: t });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      h.delete(e);
    });
  } catch {
    try {
      h.delete(e);
    } catch {
    }
  }
});
async function te(e, t) {
  switch (e.type) {
    case "GET_INITIAL_STATE":
      return await L();
    case "ADD_TO_BLACKLIST":
      return await G(e.payload?.domain), { success: !0 };
    case "REMOVE_FROM_BLACKLIST":
      return await ie(e.payload?.domain), { success: !0 };
    case "START_POMODORO":
      return await ce(e.payload), { success: !0 };
    case "STOP_POMODORO":
      return await re(), { success: !0 };
    case "SET_TIME_LIMIT":
      return await Q(e.payload?.domain, e.payload?.limitMinutes), { success: !0 };
    case "CONTENT_ANALYSIS_RESULT":
      return await ee(e.payload), { success: !0 };
    case "UPDATE_SETTINGS": {
      const { [i.SETTINGS]: o } = await chrome.storage.sync.get(i.SETTINGS), a = { ...o ?? {}, ...e.payload ?? {} };
      return await chrome.storage.sync.set({ [i.SETTINGS]: a }), await u(), { success: !0 };
    }
    case "SITE_CUSTOMIZATION_UPDATED": {
      const { [i.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(i.SITE_CUSTOMIZATIONS), a = {
        ...o ?? {},
        ...e.payload ?? {}
      };
      return await chrome.storage.local.set({
        [i.SITE_CUSTOMIZATIONS]: a
      }), await u(), { success: !0 };
    }
    case "TOGGLE_ZEN_MODE": {
      const [o] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (o?.id)
        try {
          await chrome.tabs.sendMessage(o.id, {
            type: "TOGGLE_ZEN_MODE",
            payload: e.payload
          });
        } catch (a) {
          console.warn(
            `[v0] Could not send TOGGLE_ZEN_MODE to tab ${o.id}. It may be a protected page or the content script wasn't injected.`,
            a
          );
        }
      return { success: !0 };
    }
    case "STATE_UPDATED":
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const o = e.type;
      throw new Error(`Unknown message type: ${o}`);
    }
  }
}
const I = 1e3, m = 2e3, A = 1e3;
let w = Promise.resolve();
function O(e) {
  return w = w.then(e, e), w;
}
function oe(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const n = e.charCodeAt(a);
    t = (t << 5) - t + n, t |= 0;
  }
  const o = Math.abs(t) % A;
  return m + o;
}
async function ae() {
  console.log("[v0] Initializing blocker module"), await _();
}
async function G(e) {
  const o = (await chrome.storage.local.get(
    i.BLACKLIST
  ))[i.BLACKLIST] ?? [], a = T(e);
  if (!a) return;
  if (o.some((s) => s.domain === a)) {
    console.log("[v0] Domain already in blacklist:", a);
    return;
  }
  const n = [
    ...o,
    { domain: a, addedAt: Date.now() }
  ];
  await chrome.storage.local.set({ [i.BLACKLIST]: n }), await _(), await u(), console.log("[v0] Added to blacklist:", a);
}
async function ie(e) {
  const o = (await chrome.storage.local.get(
    i.BLACKLIST
  ))[i.BLACKLIST] ?? [], a = T(e);
  if (!a) return;
  const n = o.filter((s) => s.domain !== a);
  n.length !== o.length && (await chrome.storage.local.set({ [i.BLACKLIST]: n }), await _(), await u(), console.log("[v0] Removed from blacklist:", a));
}
async function _() {
  const { [i.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    i.BLACKLIST
  );
  return O(async () => {
    const t = await chrome.declarativeNetRequest.getDynamicRules(), o = new Set(
      t.map((c) => c.id).filter(
        (c) => c >= m && c < m + A
      )
    ), a = [], n = /* @__PURE__ */ new Set();
    for (const c of e) {
      const d = T(c.domain);
      if (!d) continue;
      let r = oe(d);
      for (; (n.has(r) || o.has(r)) && (r++, r >= m + A && (r = m), n.has(r) || o.has(r), !(!n.has(r) && !o.has(r))); )
        ;
      n.add(r), o.has(r) || a.push({
        id: r,
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
      (c) => !n.has(c)
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
async function ne() {
  const { [i.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    i.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = e.map(
    (o, a) => {
      const n = T(o.domain);
      return {
        id: I + a,
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
  return O(async () => {
    const a = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter((n) => n >= I && n < m);
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
async function K() {
  return O(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter((o) => o >= I && o < m);
    t.length > 0 && (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: t
    }), console.log(
      "[v0] Pomodoro blocking disabled. Removed",
      t.length,
      "rules."
    ));
  });
}
async function se() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === l.POMODORO && await le();
  });
}
async function ce(e) {
  const { [i.POMODORO_STATUS]: t } = await chrome.storage.local.get(i.POMODORO_STATUS), o = { ...t?.config || S, ...e }, a = {
    state: "FOCUS",
    startTime: Date.now(),
    timeRemaining: o.focusMinutes * 60,
    currentCycle: (t?.currentCycle || 0) + 1,
    config: o
  };
  await chrome.storage.local.set({ [i.POMODORO_STATUS]: a }), await chrome.alarms.create(l.POMODORO, { delayInMinutes: o.focusMinutes }), await ne(), await u(), o.notificationsEnabled && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${o.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", a);
}
async function re() {
  const { [i.POMODORO_STATUS]: e } = await chrome.storage.local.get(i.POMODORO_STATUS), t = {
    state: "IDLE",
    timeRemaining: 0,
    currentCycle: 0,
    // Reseta o ciclo ao parar
    config: e?.config || S,
    startTime: void 0
  };
  await chrome.storage.local.set({ [i.POMODORO_STATUS]: t }), await chrome.alarms.clear(l.POMODORO), await K(), await u(), console.log("[v0] Pomodoro stopped");
}
async function le() {
  const { [i.POMODORO_STATUS]: e } = await chrome.storage.local.get(i.POMODORO_STATUS);
  if (e) {
    if (e.state === "FOCUS") {
      const o = e.currentCycle % e.config.cyclesBeforeLongBreak === 0 ? e.config.longBreakMinutes : e.config.breakMinutes, a = { ...e, state: "BREAK", startTime: Date.now(), timeRemaining: o * 60 };
      await chrome.storage.local.set({ [i.POMODORO_STATUS]: a }), await chrome.alarms.create(l.POMODORO, { delayInMinutes: o }), await K(), await u(), e.config.notificationsEnabled && chrome.notifications.create("pomodoro-break", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pausa!",
        message: `Descanse por ${o} minutos. Você merece!`
      }), console.log("[v0] Pomodoro: Focus → Break");
    } else if (e.state === "BREAK") {
      e.config.adaptiveMode && e.currentCycle % e.config.cyclesBeforeLongBreak === 0 && (e.config.focusMinutes += 5, console.log("[v0] Adaptive mode: Focus time increased to", e.config.focusMinutes));
      const t = { ...e, state: "IDLE", timeRemaining: 0, startTime: void 0 };
      await chrome.storage.local.set({ [i.POMODORO_STATUS]: t }), await u(), e.config.notificationsEnabled && chrome.notifications.create("pomodoro-cycle-complete", {
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
  const { [i.SETTINGS]: e } = await chrome.storage.sync.get(i.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(l.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === l.DAILY_SYNC && await de();
  });
}
async function de() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [i.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(i.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const a = Object.values(o).reduce((s, c) => s + c, 0), n = Object.entries(o).sort(([, s], [, c]) => c - s).slice(0, 5).map(([s, c]) => ({ domain: s, time: c }));
  console.log("[v0] Daily summary:", { totalTime: a, topSites: n });
}
console.log("[v0] Service Worker starting up...");
async function Y() {
  try {
    await se();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    await ae();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    await W();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    await x();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    await J();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    await ue();
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}
async function C() {
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
      settings: b
    }, o = {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: 0,
      config: S
    };
    try {
      await chrome.storage.local.set({
        [i.BLACKLIST]: t.blacklist,
        [i.TIME_LIMITS]: t.timeLimits,
        [i.DAILY_USAGE]: t.dailyUsage,
        [i.SITE_CUSTOMIZATIONS]: t.siteCustomizations,
        [i.POMODORO_STATUS]: o
      }), await chrome.storage.sync.set({
        [i.SETTINGS]: t.settings
      }), console.log("[v0] Initial state created");
    } catch (a) {
      console.error("[v0] Failed to create initial state:", a);
    }
    await C();
  }
  e.reason === "update" && await C(), await Y();
});
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup"), await Y();
});
chrome.runtime.onMessage.addListener(
  (e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), Promise.resolve(te(e, t)).then((a) => o(a)).catch((a) => {
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
        o && (await G(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  }
);
console.log("[v0] Service Worker loaded and listeners attached.");
