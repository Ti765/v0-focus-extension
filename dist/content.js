const s = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, A = 1e4, y = {
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
(async function() {
  try {
    const e = location.hostname, { [s.BLACKLIST]: o } = await chrome.storage.local.get(s.BLACKLIST);
    if (o && Array.isArray(o) && o.some((n) => {
      const c = typeof n == "string" ? n : n.domain;
      return e === c || e.endsWith("." + c);
    })) {
      console.log("[v0][CS] Blocked domain loaded from cache, redirecting...");
      const n = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
      location.href = n;
      return;
    }
  } catch (e) {
    console.error("[v0][CS] Failed to check blocked domain:", e);
  }
})();
let I = !1;
chrome.runtime.onMessage.addListener((t, e, o) => {
  try {
    if (t?.type === y.TOGGLE_ZEN_MODE)
      return C(t.payload?.preset), o?.({ success: !0 }), !0;
  } catch (a) {
    console.warn("[v0][CS] TOGGLE_ZEN_MODE failed:", a), o?.({ success: !1, error: String(a) });
  }
  return !1;
});
const f = async () => {
  if (!I) {
    I = !0;
    try {
      const t = document.body?.innerText?.slice(0, A) ?? "", e = location.href, o = await L(t, e), a = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: y.CONTENT_ANALYSIS_RESULT, id: a, source: "content-script", ts: Date.now(), payload: { result: o } }, (n) => {
        const c = chrome.runtime.lastError;
        c && !c.message.includes("Receiving end does not exist") && !c.message.includes("message channel closed") && console.warn("[v0][CS] Content analysis message error:", c.message);
      });
    } catch (t) {
      console.error("[v0][CS] analyzePageContent error:", t);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? f() : document.addEventListener("DOMContentLoaded", f, { once: !0 });
async function L(t, e) {
  const { [s.SETTINGS]: o } = await chrome.storage.sync.get(s.SETTINGS), a = o?.productiveKeywords || [], n = o?.distractingKeywords || [], c = t.toLowerCase();
  let S = 0, u = 0;
  const g = (l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  a.forEach((l) => {
    const m = new RegExp(`\\b${g(l)}\\b`, "gi"), d = c.match(m);
    d && (S += d.length);
  }), n.forEach((l) => {
    const m = new RegExp(`\\b${g(l)}\\b`, "gi"), d = c.match(m);
    d && (u += d.length);
  });
  const M = S + u, O = M > 0 ? u / M : 0;
  let T = "neutral";
  return O > 0.6 ? T = "distracting" : O < 0.4 && S > 0 && (T = "productive"), {
    url: e,
    classification: T,
    score: O,
    categories: {},
    flagged: T === "distracting"
  };
}
let _ = !1, i = null, E = "", r = null;
function C(t) {
  _ ? (i !== null && (document.body.innerHTML = i, document.body.style.background = E, i = null, E = ""), r && (r.remove(), r = null), _ = !1, console.log("[v0][CS] Zen Mode deactivated")) : (i = document.body.innerHTML, E = document.body.style.background || "", R(t), _ = !0, console.log("[v0][CS] Zen Mode activated"));
}
function R(t) {
  try {
    const e = h();
    t && p(t), r && r.remove(), r = document.createElement("div"), r.id = "zen-mode-container", r.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: Georgia, serif;
      font-size: 18px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    `, r.innerHTML = e, document.body.innerHTML = "", document.body.appendChild(r), document.body.style.background = "#f5f5f5";
  } catch (e) {
    throw console.error("[v0][CS] Error applying Zen Mode:", e), i !== null && (document.body.innerHTML = i, document.body.style.background = E), e;
  }
}
function h() {
  const t = document.querySelector("article"), e = document.querySelector("main"), o = document.querySelector('[role="main"]');
  return t ? t.innerHTML : e ? e.innerHTML : o ? o.innerHTML : document.body.innerHTML;
}
async function p(t) {
  try {
    const { [s.SITE_CUSTOMIZATIONS]: e } = await chrome.storage.local.get(
      s.SITE_CUSTOMIZATIONS
    ), o = e?.[t];
    o?.selectorsToRemove && o.selectorsToRemove.forEach((a) => {
      document.querySelectorAll(a).forEach((n) => n.remove());
    });
  } catch (e) {
    console.warn("[v0][CS] applyPreset failed:", e);
  }
}
