const l = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, h = 1e4;
window.v0ContentScriptInjected = !0;
console.log("[v0][CS] Content script loaded");
let M = !1;
chrome.runtime.onMessage.addListener((e, t, n) => {
  try {
    if (e?.type === "TOGGLE_ZEN_MODE")
      return L(e.payload?.preset), n?.({ success: !0 }), !0;
  } catch (r) {
    console.warn("[v0][CS] TOGGLE_ZEN_MODE failed:", r), n?.({ success: !1, error: String(r) });
  }
  return !1;
});
const C = async () => {
  if (!M) {
    M = !0;
    try {
      const e = document.body?.innerText?.slice(0, h) ?? "", t = location.href, n = await v(e, t);
      await chrome.runtime.sendMessage({ type: "CONTENT_ANALYSIS_RESULT", payload: n });
    } catch (e) {
      console.error("[v0][CS] analyzePageContent error:", e);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? C() : document.addEventListener("DOMContentLoaded", C, { once: !0 });
async function v(e, t) {
  const { [l.SETTINGS]: n } = await chrome.storage.sync.get(l.SETTINGS), r = n?.productiveKeywords || [], d = n?.distractingKeywords || [], S = e.toLowerCase();
  let u = 0, m = 0;
  const p = (a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((a) => {
    const f = new RegExp(`\\b${p(a)}\\b`, "gi"), i = S.match(f);
    i && (u += i.length);
  }), d.forEach((a) => {
    const f = new RegExp(`\\b${p(a)}\\b`, "gi"), i = S.match(f);
    i && (m += i.length);
  });
  const E = u + m, y = E > 0 ? m / E : 0;
  let T = "neutral";
  return y > 0.6 ? T = "distracting" : y < 0.4 && u > 0 && (T = "productive"), {
    url: t,
    classification: T,
    score: y,
    timestamp: Date.now()
  };
}
let g = !1, c = null, s = "", o = null;
function L(e) {
  g ? (c !== null && (document.body.innerHTML = c, document.body.style.background = s, c = null, s = ""), o && (o.remove(), o = null), g = !1, console.log("[v0][CS] Zen Mode deactivated")) : (c = document.body.innerHTML, s = document.body.style.background || "", b(e), g = !0, console.log("[v0][CS] Zen Mode activated"));
}
function b(e) {
  try {
    const t = I();
    e && w(e), o && o.remove(), o = document.createElement("div"), o.id = "zen-mode-container", o.style.cssText = `
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
function I() {
  const e = document.querySelector("article"), t = document.querySelector("main"), n = document.querySelector('[role="main"]');
  return e ? e.innerHTML : t ? t.innerHTML : n ? n.innerHTML : document.body.innerHTML;
}
async function w(e) {
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
