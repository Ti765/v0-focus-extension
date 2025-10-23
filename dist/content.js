const l = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, f = 1e4, A = {
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
window.v0ContentScriptInjected = !0;
console.log("[v0][CS] Content script loaded");
let y = !1;
chrome.runtime.onMessage.addListener((e, t, n) => {
  try {
    if (e?.type === A.TOGGLE_ZEN_MODE)
      return C(e.payload?.preset), n?.({ success: !0 }), !0;
  } catch (r) {
    console.warn("[v0][CS] TOGGLE_ZEN_MODE failed:", r), n?.({ success: !1, error: String(r) });
  }
  return !1;
});
const g = async () => {
  if (!y) {
    y = !0;
    try {
      const e = document.body?.innerText?.slice(0, f) ?? "", t = location.href, n = await L(e, t), r = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: A.CONTENT_ANALYSIS_RESULT, id: r, source: "content-script", ts: Date.now(), payload: { result: n } });
    } catch (e) {
      console.error("[v0][CS] analyzePageContent error:", e);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? g() : document.addEventListener("DOMContentLoaded", g, { once: !0 });
async function L(e, t) {
  const { [l.SETTINGS]: n } = await chrome.storage.sync.get(l.SETTINGS), r = n?.productiveKeywords || [], d = n?.distractingKeywords || [], M = e.toLowerCase();
  let E = 0, S = 0;
  const I = (a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((a) => {
    const u = new RegExp(`\\b${I(a)}\\b`, "gi"), i = M.match(u);
    i && (E += i.length);
  }), d.forEach((a) => {
    const u = new RegExp(`\\b${I(a)}\\b`, "gi"), i = M.match(u);
    i && (S += i.length);
  });
  const m = E + S, O = m > 0 ? S / m : 0;
  let T = "neutral";
  return O > 0.6 ? T = "distracting" : O < 0.4 && E > 0 && (T = "productive"), {
    url: t,
    classification: T,
    score: O,
    categories: {},
    flagged: T === "distracting"
  };
}
let _ = !1, c = null, s = "", o = null;
function C(e) {
  _ ? (c !== null && (document.body.innerHTML = c, document.body.style.background = s, c = null, s = ""), o && (o.remove(), o = null), _ = !1, console.log("[v0][CS] Zen Mode deactivated")) : (c = document.body.innerHTML, s = document.body.style.background || "", R(e), _ = !0, console.log("[v0][CS] Zen Mode activated"));
}
function R(e) {
  try {
    const t = p();
    e && D(e), o && o.remove(), o = document.createElement("div"), o.id = "zen-mode-container", o.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: Georgia, serif;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    `, o.innerHTML = t, document.body.innerHTML = "", document.body.appendChild(o), document.body.style.background = "#f5f5f5";
  } catch (t) {
    throw console.error("[v0][CS] Error applying Zen Mode:", t), c !== null && (document.body.innerHTML = c, document.body.style.background = s), t;
  }
}
function p() {
  const e = document.querySelector("article"), t = document.querySelector("main"), n = document.querySelector('[role="main"]');
  return e ? e.innerHTML : t ? t.innerHTML : n ? n.innerHTML : document.body.innerHTML;
}
async function D(e) {
  try {
    const { [l.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(
      l.SITE_CUSTOMIZATIONS
    ), n = t?.[e];
    n?.selectorsToRemove && n.selectorsToRemove.forEach((r) => {
      document.querySelectorAll(r).forEach((d) => d.remove());
    });
  } catch (t) {
    console.warn("[v0][CS] applyPreset failed:", t);
  }
}
