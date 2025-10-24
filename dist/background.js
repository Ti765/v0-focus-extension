const n = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, g = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, x = {
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
}, A = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, Z = 0.5, H = 1, d = {
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
function y(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function K(e) {
  if (!e) return "";
  try {
    return new URL(e).hostname.replace(/^www\./, "");
  } catch {
    return y(e);
  }
}
function _(e) {
  return `^https?://([^/]+\\.)?${e.replace(/\./g, "\\.")}(/|$)`;
}
const U = !0, V = !0;
let D = null, C = !1, P = !1;
const J = 3e3, Q = 1e3;
function L(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e.charCodeAt(a);
    t = (t << 5) - t + s, t |= 0;
  }
  const o = Math.abs(t) % Q;
  return J + o;
}
async function X() {
  if (P) return;
  P = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(g.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const o = t.getTime() - e.getTime(), a = Date.now() + Math.max(o, 6e4);
  await chrome.alarms.create(g.DAILY_SYNC, {
    when: a,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(a - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === g.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await ee());
  });
}
async function ee() {
  const { [n.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
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
async function te() {
  C || (C = !0, console.log("[v0] Initializing usage tracker module"), await chrome.alarms.clear(g.USAGE_TRACKER), await chrome.alarms.create(g.USAGE_TRACKER, {
    periodInMinutes: H
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === g.USAGE_TRACKER && await O();
  }), chrome.tabs.onActivated.addListener(oe), chrome.tabs.onUpdated.addListener(ae), chrome.windows.onFocusChanged.addListener(ne), await F());
}
async function oe(e) {
  await O();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await M(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await E();
  }
}
async function ae(e, t) {
  e === D && t.url && (await O(), await M(e, t.url));
}
async function ne(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await O(), await E()) : await F();
}
async function F() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await M(e.id, e.url) : await E();
}
async function M(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await E();
    return;
  }
  D = e;
  const o = {
    url: t,
    startTime: Date.now()
  };
  await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: o });
}
async function E() {
  D = null, await chrome.storage.session.remove(n.CURRENTLY_TRACKING);
}
async function O() {
  const t = (await chrome.storage.session.get(n.CURRENTLY_TRACKING))[n.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const o = K(t.url);
  if (!o) {
    console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await E();
    return;
  }
  const a = Math.floor((Date.now() - t.startTime) / 1e3);
  if (console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: o,
    timeSpent: a,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString()
  }), t.startTime = Date.now(), await chrome.storage.session.set({ [n.CURRENTLY_TRACKING]: t }), a < 1) {
    console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const s = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: i = {} } = await chrome.storage.local.get(
    n.DAILY_USAGE
  );
  i[s] || (i[s] = {}), i[s][o] = (i[s][o] || 0) + a, await chrome.storage.local.set({ [n.DAILY_USAGE]: i }), console.log("[v0] Recorded usage:", o, a, "seconds"), await u(), await Y(o, i[s][o]);
}
async function Y(e, t) {
  const { [n.TIME_LIMITS]: o = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), a = o.find((r) => r.domain === e);
  if (!a) return;
  const s = a.dailyMinutes ?? a.limitMinutes ?? 0, i = s * 60;
  if (t >= i) {
    const r = L(e);
    try {
      V && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i,
        limitMinutes: s,
        exceeded: t >= i
      });
      const c = _(e), l = {
        id: r,
        priority: 3,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          regexFilter: c,
          isUrlFilterCaseSensitive: !1,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      };
      if (U && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [r],
        // remove se já existir
        addRules: [l]
      }), U) {
        const m = await chrome.declarativeNetRequest.getSessionRules();
        console.log("[DNR-DEBUG] All session rules after time limit:", m), console.log("[DNR-DEBUG] Session rules by domain:", m.map((S) => ({
          id: S.id,
          regex: S.condition.regexFilter
        })));
      }
      console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${r} added.`
      ), await q() && chrome.notifications.create(`limit-exceeded-${e}`, {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${s} minutos em ${e} hoje.`
      });
    } catch (c) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, c);
    }
  }
}
async function se(e, t) {
  const o = y(e);
  if (!o) return;
  const { [n.TIME_LIMITS]: a = [] } = await chrome.storage.local.get(
    n.TIME_LIMITS
  ), s = Array.isArray(a) ? a : [], i = s.findIndex((c) => c.domain === o), r = L(o);
  if (t > 0) {
    if (i >= 0)
      s[i].dailyMinutes = t;
    else {
      const S = (p) => p;
      s.push({ domain: S(o), dailyMinutes: t });
    }
    const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [n.DAILY_USAGE]: l = {} } = await chrome.storage.local.get(
      n.DAILY_USAGE
    ), m = l?.[c]?.[o] || 0;
    if (m >= t * 60)
      await Y(o, m);
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
  await chrome.storage.local.set({ [n.TIME_LIMITS]: s }), await u(), console.log("[v0] Time limit set/updated:", o, t, "minutes");
}
const h = "__contentSuggestNotified__", z = 3 * 60 * 60 * 1e3;
async function ie() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [h]: e = {} } = await chrome.storage.session.get(h), t = Date.now();
    let o = !1;
    for (const a of Object.keys(e || {}))
      (typeof e[a] != "number" || t - e[a] > z) && (delete e[a], o = !0);
    o && await chrome.storage.session.set({ [h]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function re(e) {
  try {
    const { [h]: t = {} } = await chrome.storage.session.get(h), o = t?.[e], a = Date.now();
    return o && a - o < z ? !1 : (await chrome.storage.session.set({
      [h]: { ...t || {}, [e]: a }
    }), !0);
  } catch {
    return !0;
  }
}
async function ce(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await q() || !(e.classification === "distracting" && e.score > Z) || !e?.url) return;
    const t = K(e.url);
    if (!t) return;
    const { [n.BLACKLIST]: o = [] } = await chrome.storage.local.get(
      n.BLACKLIST
    );
    if (o.some((i) => i.domain === t) || !await re(t))
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
let G = "";
async function u() {
  try {
    const e = await v(), t = JSON.stringify(e, (o, a) => {
      if (a && typeof a == "object" && !Array.isArray(a)) {
        const s = {};
        return Object.keys(a).sort().forEach((i) => {
          s[i] = a[i];
        }), s;
      }
      return a;
    });
    if (t === G)
      return;
    G = t, chrome.runtime.sendMessage({ type: d.STATE_UPDATED, payload: { state: e } }, () => {
      const o = chrome.runtime.lastError, a = o?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist"
      ].some((r) => a === r || a.startsWith(r));
      o && !i && console.warn("[v0] notifyStateUpdate lastError:", o.message);
    });
    try {
      for (const o of w)
        try {
          o.postMessage({ type: d.STATE_UPDATED, payload: { state: e } });
        } catch (a) {
          console.warn("[v0] Failed to post state to port:", a);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function q() {
  try {
    const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
    return e?.notifications ?? e?.notificationsEnabled !== !1;
  } catch {
    return !0;
  }
}
async function v() {
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
    isLoading: !1,
    error: null,
    blacklist: (t[n.BLACKLIST] || []).map((a) => typeof a == "string" ? a : typeof a == "object" && a !== null && "domain" in a ? String(a.domain) : String(a)),
    timeLimits: t[n.TIME_LIMITS] || [],
    dailyUsage: t[n.DAILY_USAGE] || {},
    pomodoro: t[n.POMODORO_STATUS] || {
      config: A,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[n.SITE_CUSTOMIZATIONS] || {},
    settings: o[n.SETTINGS] || x
  };
}
const w = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    w.add(e), v().then((t) => {
      try {
        e.postMessage({ type: d.STATE_UPDATED, payload: { state: t } });
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
async function le(e, t) {
  switch (e.type) {
    case d.GET_INITIAL_STATE:
      return await v();
    case d.ADD_TO_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await $(o), await u(), { success: !0 };
    }
    case d.REMOVE_FROM_BLACKLIST: {
      const o = e.payload?.domain;
      return typeof o == "string" && await ue(o), await u(), { success: !0 };
    }
    case d.POMODORO_START:
      return await Te(e.payload || void 0), { success: !0 };
    case d.POMODORO_STOP:
      return await Se(), { success: !0 };
    case d.TIME_LIMIT_SET: {
      const o = e.payload, a = o?.domain, s = o?.dailyMinutes ?? o?.limitMinutes;
      return typeof a == "string" && typeof s == "number" && await se(a, s), await u(), { success: !0 };
    }
    case d.CONTENT_ANALYSIS_RESULT:
      return await ce(e.payload?.result), await u(), { success: !0 };
    case d.STATE_PATCH: {
      const o = e.payload ?? {}, a = o.patch?.settings ?? o.settings ?? o;
      if (!a || typeof a != "object")
        return { success: !1, error: "Invalid STATE_PATCH payload" };
      const { [n.SETTINGS]: s } = await chrome.storage.sync.get(n.SETTINGS), i = { ...s ?? {}, ...a ?? {} }, r = JSON.stringify(s ?? {}), c = JSON.stringify(i);
      return r === c ? { success: !0 } : (await chrome.storage.sync.set({ [n.SETTINGS]: i }), await u(), { success: !0 });
    }
    case d.SITE_CUSTOMIZATION_UPDATED: {
      const { [n.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(n.SITE_CUSTOMIZATIONS), a = e.payload;
      let s = { ...o ?? {} };
      return a && typeof a == "object" && !Array.isArray(a) && (a.domain && a.config ? s = { ...s, [String(a.domain)]: a.config } : s = { ...s, ...a }), await chrome.storage.local.set({ [n.SITE_CUSTOMIZATIONS]: s }), await u(), { success: !0 };
    }
    case d.TOGGLE_ZEN_MODE: {
      const [o] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
      if (o?.id)
        try {
          await chrome.tabs.sendMessage(o.id, {
            type: d.TOGGLE_ZEN_MODE,
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
    case d.STATE_UPDATED:
      return console.warn(
        "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
      ), { success: !1, error: "Invalid message type received." };
    default: {
      const o = e.type;
      throw new Error(`Unknown message type: ${o}`);
    }
  }
}
const I = 1e3, T = 2e3, f = 1e3;
let R = Promise.resolve();
function N(e) {
  return R = R.then(e, e), R;
}
function k(e) {
  let t = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e.charCodeAt(a);
    t = (t << 5) - t + s, t |= 0;
  }
  const o = Math.abs(t) % f;
  return T + o;
}
async function de() {
  console.log("[v0] Initializing blocker module"), await b();
}
async function $(e) {
  const o = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = y(e);
  if (!a) return;
  if (o.some((r) => r.domain === a)) {
    console.log("[v0] Domain already in blacklist:", a);
    return;
  }
  const s = (r) => r, i = [
    ...o,
    { domain: s(a), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  try {
    const r = o;
    if (r.length === i.length && r.every((l, m) => l.domain === i[m].domain && l.addedAt === i[m].addedAt)) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch {
  }
  await chrome.storage.local.set({ [n.BLACKLIST]: i }), await b(), await u(), console.log("[v0] Added to blacklist:", a);
}
async function ue(e) {
  const o = (await chrome.storage.local.get(
    n.BLACKLIST
  ))[n.BLACKLIST] ?? [], a = y(e);
  if (!a) return;
  const s = o.filter((i) => i.domain !== a);
  if (s.length !== o.length) {
    try {
      if (s.length === o.length && s.every((r, c) => r.domain === o[c].domain && r.addedAt === o[c].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [n.BLACKLIST]: s }), await b(), await u(), console.log("[v0] Removed from blacklist:", a);
  }
}
async function b() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  return N(async () => {
    const t = await chrome.declarativeNetRequest.getDynamicRules(), o = new Set(
      t.map((r) => r.id).filter(
        (r) => r >= T && r < T + f
      )
    ), a = [], s = /* @__PURE__ */ new Set();
    for (const r of e) {
      const c = y(r.domain);
      if (!c) continue;
      let l = k(c), m = 0;
      const S = f;
      for (; s.has(l) || o.has(l); ) {
        if (m++, m >= S) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${c}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        l++, l >= T + f && (l = T);
      }
      if (m >= S) {
        console.warn(`[v0] Skipping rule for ${c} - no free ID found`);
        continue;
      }
      if (s.add(l), !o.has(l)) {
        const p = _(c);
        a.push({
          id: l,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK
          },
          condition: {
            regexFilter: p,
            isUrlFilterCaseSensitive: !1,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
      }
    }
    const i = Array.from(o).filter(
      (r) => !s.has(r)
    );
    if (a.length > 0 || i.length > 0) {
      console.log("[DNR-DEBUG] Blacklist domains:", e.map((r) => r.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", a.map((r) => ({
        id: r.id,
        regex: r.condition.regexFilter,
        domain: e.find((c) => k(c.domain) === r.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i), await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: i,
        addRules: a
      });
      {
        const r = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", r), console.log("[DNR-DEBUG] Total rules count:", r.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: r.filter((c) => c.id >= I && c.id < T).length,
          blacklist: r.filter((c) => c.id >= T && c.id < T + f).length,
          other: r.filter((c) => c.id < I || c.id >= T + f).length
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
async function me() {
  const { [n.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    n.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = e.map(
    (o, a) => {
      const s = y(o.domain), i = _(s);
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
  return N(async () => {
    const a = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter((i) => i >= I && i < T);
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(t, null, 2)), await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: a,
      addRules: t
    });
    const s = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(s, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function j() {
  return N(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((o) => o.id).filter((o) => o >= I && o < T);
    t.length > 0 && (await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: t
    }), console.log(
      "[v0] Pomodoro blocking disabled. Removed",
      t.length,
      "rules."
    ));
  });
}
async function ge() {
  console.log("[v0] Initializing Pomodoro module"), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === g.POMODORO && await fe();
  });
}
async function Te(e) {
  const { [n.POMODORO_STATUS]: t } = await chrome.storage.local.get(n.POMODORO_STATUS), a = { ...t?.config || A, ...e || {} }, s = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (t?.state?.cycleIndex || 0) + 1,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    endsAt: void 0,
    remainingMs: a.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: a, state: s } }), await chrome.alarms.create(g.POMODORO, { delayInMinutes: a.focusMinutes }), await me(), await u();
  const i = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
  (i?.notifications ?? i?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-start", {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Pomodoro Iniciado",
    message: `Foco por ${a.focusMinutes} minutos. Mantenha o foco!`
  }), console.log("[v0] Pomodoro started:", s);
}
async function Se() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, o = e?.config || A;
  await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: o, state: t } }), await chrome.alarms.clear(g.POMODORO), await j(), await u(), console.log("[v0] Pomodoro stopped");
}
async function fe() {
  const { [n.POMODORO_STATUS]: e } = await chrome.storage.local.get(n.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, o = e.config || A;
  if (t.phase === "focus") {
    const a = t.cycleIndex % o.cyclesBeforeLongBreak === 0, s = a ? o.longBreakMinutes : o.shortBreakMinutes, i = {
      ...t,
      phase: a ? "long_break" : "short_break",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      remainingMs: s * 60 * 1e3
    };
    await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: o, state: i } }), await chrome.alarms.create(g.POMODORO, { delayInMinutes: s }), await j(), await u();
    const r = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
    (r?.notifications ?? r?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-break", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pausa!",
      message: `Descanse por ${s} minutos. Você merece!`
    }), console.log("[v0] Pomodoro: Focus → Break");
  } else if (t.phase === "short_break" || t.phase === "long_break") {
    const a = { phase: "idle", isPaused: !1, cycleIndex: t.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [n.POMODORO_STATUS]: { config: o, state: a } }), await u();
    const s = (await chrome.storage.sync.get(n.SETTINGS))[n.SETTINGS];
    (s?.notifications ?? s?.notificationsEnabled ?? !1) && chrome.notifications.create("pomodoro-cycle-complete", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Ciclo Completo!",
      message: "Pronto para outra sessão de foco?"
    }), console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function he() {
  console.log("[v0] Initializing Firebase sync module");
  const { [n.SETTINGS]: e } = await chrome.storage.sync.get(n.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(g.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === g.DAILY_SYNC && await ye();
  });
}
async function ye() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [n.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(n.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], o = e[t];
  if (!o) return;
  const a = Object.values(o).reduce((i, r) => i + r, 0), s = Object.entries(o).sort(([, i], [, r]) => r - i).slice(0, 5).map(([i, r]) => ({ domain: i, time: r }));
  console.log("[v0] Daily summary:", { totalTime: a, topSites: s });
}
console.log("[v0] Service Worker starting up...");
async function W() {
  try {
    await ge();
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    await de();
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    await te();
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    await X();
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    await ie();
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    await he();
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
}
async function B() {
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
      settings: x
    }, o = {
      phase: "idle",
      isPaused: !1,
      cycleIndex: 0,
      remainingMs: 0
    };
    try {
      await chrome.storage.local.set({
        [n.BLACKLIST]: t.blacklist,
        [n.TIME_LIMITS]: t.timeLimits,
        [n.DAILY_USAGE]: t.dailyUsage,
        [n.SITE_CUSTOMIZATIONS]: t.siteCustomizations,
        [n.POMODORO_STATUS]: { config: A, state: o }
      }), await chrome.storage.sync.set({
        [n.SETTINGS]: t.settings
      }), console.log("[v0] Initial state created");
    } catch (a) {
      console.error("[v0] Failed to create initial state:", a);
    }
    await B();
  }
  e.reason === "update" && await B(), await W();
});
chrome.runtime.onStartup.addListener(async () => {
  console.log("[v0] Extension started on browser startup"), await W();
});
chrome.runtime.onMessage.addListener(
  (e, t, o) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), Promise.resolve(le(e, t)).then((a) => o(a)).catch((a) => {
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
        o && (await $(o), console.log(`[v0] Added ${o} to blacklist from notification.`));
      }
    } finally {
      chrome.notifications.clear(e);
    }
  }
);
console.log("[v0] Service Worker loaded and listeners attached.");
