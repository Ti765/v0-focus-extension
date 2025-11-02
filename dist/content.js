const ks = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = ks;
      n && (t = n.MODE || n.NODE_ENV || "production");
    } catch {
    }
    globalThis.process = {
      env: {
        NODE_ENV: t
      },
      version: "",
      versions: {},
      platform: "browser",
      browser: !0
    }, t === "development" && console.log("[v0][Polyfill] process object defined:", globalThis.process);
  }
})();
const y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, b = globalThis, ge = "10.22.0";
function Rt() {
  return vt(b), b;
}
function vt(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || ge, t[ge] = t[ge] || {};
}
function xe(e, t, n = b) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[ge] = r[ge] || {};
  return o[e] || (o[e] = t());
}
const xs = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], Ps = "Sentry Logger ", bt = {};
function Ct(e) {
  if (!("console" in b))
    return e();
  const t = b.console, n = {}, r = Object.keys(bt);
  r.forEach((o) => {
    const s = bt[o];
    n[o] = t[o], t[o] = s;
  });
  try {
    return e();
  } finally {
    r.forEach((o) => {
      t[o] = n[o];
    });
  }
}
function Fs() {
  Dn().enabled = !0;
}
function Us() {
  Dn().enabled = !1;
}
function Io() {
  return Dn().enabled;
}
function $s(...e) {
  wn("log", ...e);
}
function Hs(...e) {
  wn("warn", ...e);
}
function Bs(...e) {
  wn("error", ...e);
}
function wn(e, ...t) {
  y && Io() && Ct(() => {
    b.console[e](`${Ps}[${e}]:`, ...t);
  });
}
function Dn() {
  return y ? xe("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const _ = {
  /** Enable logging. */
  enable: Fs,
  /** Disable logging. */
  disable: Us,
  /** Check if logging is enabled. */
  isEnabled: Io,
  /** Log a message. */
  log: $s,
  /** Log a warning. */
  warn: Hs,
  /** Log an error. */
  error: Bs
}, Oo = 50, _e = "?", hr = /\(error: (.*)\)/, gr = /captureMessage|captureException/;
function Gs(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const s = [], i = n.split(`
`);
    for (let c = r; c < i.length; c++) {
      let u = i[c];
      u.length > 1024 && (u = u.slice(0, 1024));
      const l = hr.test(u) ? u.replace(hr, "$1") : u;
      if (!l.match(/\S*Error: /)) {
        for (const d of t) {
          const p = d(l);
          if (p) {
            s.push(p);
            break;
          }
        }
        if (s.length >= Oo + o)
          break;
      }
    }
    return zs(s.slice(o));
  };
}
function zs(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(ut(t).function || "") && t.pop(), t.reverse(), gr.test(ut(t).function || "") && (t.pop(), gr.test(ut(t).function || "") && t.pop()), t.slice(0, Oo).map((n) => ({
    ...n,
    filename: n.filename || ut(t).filename,
    function: n.function || _e
  }));
}
function ut(e) {
  return e[e.length - 1] || {};
}
const qt = "<anonymous>";
function ce(e) {
  try {
    return !e || typeof e != "function" ? qt : e.name || qt;
  } catch {
    return qt;
  }
}
function _r(e) {
  const t = e.exception;
  if (t) {
    const n = [];
    try {
      return t.values.forEach((r) => {
        r.stacktrace.frames && n.push(...r.stacktrace.frames);
      }), n;
    } catch {
      return;
    }
  }
}
const gt = {}, Er = {};
function Se(e, t) {
  gt[e] = gt[e] || [], gt[e].push(t);
}
function Te(e, t) {
  if (!Er[e]) {
    Er[e] = !0;
    try {
      t();
    } catch (n) {
      y && _.error(`Error while instrumenting ${e}`, n);
    }
  }
}
function K(e, t) {
  const n = e && gt[e];
  if (n)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        y && _.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${ce(r)}
Error:`,
          o
        );
      }
}
let Kt = null;
function js(e) {
  const t = "error";
  Se(t, e), Te(t, Ws);
}
function Ws() {
  Kt = b.onerror, b.onerror = function(e, t, n, r, o) {
    return K("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), Kt ? Kt.apply(this, arguments) : !1;
  }, b.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let Xt = null;
function Ys(e) {
  const t = "unhandledrejection";
  Se(t, e), Te(t, qs);
}
function qs() {
  Xt = b.onunhandledrejection, b.onunhandledrejection = function(e) {
    return K("unhandledrejection", e), Xt ? Xt.apply(this, arguments) : !0;
  }, b.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const Ro = Object.prototype.toString;
function Ln(e) {
  switch (Ro.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return ue(e, Error);
  }
}
function Pe(e, t) {
  return Ro.call(e) === `[object ${t}]`;
}
function vo(e) {
  return Pe(e, "ErrorEvent");
}
function yr(e) {
  return Pe(e, "DOMError");
}
function Ks(e) {
  return Pe(e, "DOMException");
}
function se(e) {
  return Pe(e, "String");
}
function Mn(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function Nt(e) {
  return e === null || Mn(e) || typeof e != "object" && typeof e != "function";
}
function Ke(e) {
  return Pe(e, "Object");
}
function wt(e) {
  return typeof Event < "u" && ue(e, Event);
}
function Xs(e) {
  return typeof Element < "u" && ue(e, Element);
}
function Vs(e) {
  return Pe(e, "RegExp");
}
function Ze(e) {
  return !!(e?.then && typeof e.then == "function");
}
function Zs(e) {
  return Ke(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function ue(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function Co(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function Js(e) {
  return typeof Request < "u" && ue(e, Request);
}
const kn = b, Qs = 80;
function No(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let s = 0, i = 0;
    const c = " > ", u = c.length;
    let l;
    const d = Array.isArray(t) ? t : t.keyAttrs, p = !Array.isArray(t) && t.maxStringLength || Qs;
    for (; n && s++ < r && (l = ei(n, d), !(l === "html" || s > 1 && i + o.length * u + l.length >= p)); )
      o.push(l), i += l.length, n = n.parentNode;
    return o.reverse().join(c);
  } catch {
    return "<unknown>";
  }
}
function ei(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if (kn.HTMLElement && n instanceof HTMLElement && n.dataset) {
    if (n.dataset.sentryComponent)
      return n.dataset.sentryComponent;
    if (n.dataset.sentryElement)
      return n.dataset.sentryElement;
  }
  r.push(n.tagName.toLowerCase());
  const o = t?.length ? t.filter((i) => n.getAttribute(i)).map((i) => [i, n.getAttribute(i)]) : null;
  if (o?.length)
    o.forEach((i) => {
      r.push(`[${i[0]}="${i[1]}"]`);
    });
  else {
    n.id && r.push(`#${n.id}`);
    const i = n.className;
    if (i && se(i)) {
      const c = i.split(/\s+/);
      for (const u of c)
        r.push(`.${u}`);
    }
  }
  const s = ["aria-label", "type", "name", "title", "alt"];
  for (const i of s) {
    const c = n.getAttribute(i);
    c && r.push(`[${i}="${c}"]`);
  }
  return r.join("");
}
function wo() {
  try {
    return kn.document.location.href;
  } catch {
    return "";
  }
}
function ti(e) {
  if (!kn.HTMLElement)
    return null;
  let t = e;
  const n = 5;
  for (let r = 0; r < n; r++) {
    if (!t)
      return null;
    if (t instanceof HTMLElement) {
      if (t.dataset.sentryComponent)
        return t.dataset.sentryComponent;
      if (t.dataset.sentryElement)
        return t.dataset.sentryElement;
    }
    t = t.parentNode;
  }
  return null;
}
function At(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function Sr(e, t) {
  if (!Array.isArray(e))
    return "";
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    try {
      Co(o) ? n.push("[VueViewModel]") : n.push(String(o));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(t);
}
function _t(e, t, n = !1) {
  return se(e) ? Vs(t) ? t.test(e) : se(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function Dt(e, t = [], n = !1) {
  return t.some((r) => _t(e, r, n));
}
function B(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && Do(o, r);
  try {
    e[t] = o;
  } catch {
    y && _.log(`Failed to replace method "${t}" in object`, e);
  }
}
function Ee(e, t, n) {
  try {
    Object.defineProperty(e, t, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: n,
      writable: !0,
      configurable: !0
    });
  } catch {
    y && _.log(`Failed to add non-enumerable property "${t}" to object`, e);
  }
}
function Do(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, Ee(e, "__sentry_original__", t);
  } catch {
  }
}
function xn(e) {
  return e.__sentry_original__;
}
function Lo(e) {
  if (Ln(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...br(e)
    };
  if (wt(e)) {
    const t = {
      type: e.type,
      target: Tr(e.target),
      currentTarget: Tr(e.currentTarget),
      ...br(e)
    };
    return typeof CustomEvent < "u" && ue(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function Tr(e) {
  try {
    return Xs(e) ? No(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function br(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function ni(e, t = 40) {
  const n = Object.keys(Lo(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return At(r, t);
  for (let o = n.length; o > 0; o--) {
    const s = n.slice(0, o).join(", ");
    if (!(s.length > t))
      return o === n.length ? s : At(s, t);
  }
  return "";
}
function ri() {
  const e = b;
  return e.crypto || e.msCrypto;
}
let Vt;
function oi() {
  return Math.random() * 16;
}
function z(e = ri()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return Vt || (Vt = "10000000100040008000" + 1e11), Vt.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (oi() & 15) >> t / 4).toString(16)
    )
  );
}
function Mo(e) {
  return e.exception?.values?.[0];
}
function he(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = Mo(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function dn(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], s = o[0] = o[0] || {};
  s.value || (s.value = t || ""), s.type || (s.type = "Error");
}
function De(e, t) {
  const n = Mo(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const s = { ...o?.data, ...t.data };
    n.mechanism.data = s;
  }
}
function Ar(e) {
  if (si(e))
    return !0;
  try {
    Ee(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function si(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const ko = 1e3;
function Je() {
  return Date.now() / ko;
}
function ii() {
  const { performance: e } = b;
  if (!e?.now || !e.timeOrigin)
    return Je;
  const t = e.timeOrigin;
  return () => (t + e.now()) / ko;
}
let Ir;
function ie() {
  return (Ir ?? (Ir = ii()))();
}
function ai(e) {
  const t = ie(), n = {
    sid: z(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => ui(n)
  };
  return e && Le(n, e), n;
}
function Le(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || ie(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : z()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function ci(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), Le(e, n);
}
function ui(e) {
  return {
    sid: `${e.sid}`,
    init: e.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(e.started * 1e3).toISOString(),
    timestamp: new Date(e.timestamp * 1e3).toISOString(),
    status: e.status,
    errors: e.errors,
    did: typeof e.did == "number" || typeof e.did == "string" ? `${e.did}` : void 0,
    duration: e.duration,
    abnormal_mechanism: e.abnormal_mechanism,
    attrs: {
      release: e.release,
      environment: e.environment,
      ip_address: e.ipAddress,
      user_agent: e.userAgent
    }
  };
}
function Qe(e, t, n = 2) {
  if (!t || typeof t != "object" || n <= 0)
    return t;
  if (e && Object.keys(t).length === 0)
    return e;
  const r = { ...e };
  for (const o in t)
    Object.prototype.hasOwnProperty.call(t, o) && (r[o] = Qe(r[o], t[o], n - 1));
  return r;
}
function Or() {
  return z();
}
function xo() {
  return z().substring(16);
}
const pn = "_sentrySpan";
function Rr(e, t) {
  t ? Ee(e, pn, t) : delete e[pn];
}
function vr(e) {
  return e[pn];
}
const li = 100;
class X {
  /** Flag if notifying is happening. */
  /** Callback for client to receive scope changes. */
  /** Callback list that will be called during event processing. */
  /** Array of breadcrumbs. */
  /** User */
  /** Tags */
  /** Extra */
  /** Contexts */
  /** Attachments */
  /** Propagation Context for distributed tracing */
  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */
  /** Fingerprint */
  /** Severity */
  /**
   * Transaction Name
   *
   * IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
   * It's purpose is to assign a transaction to the scope that's added to non-transaction events.
   */
  /** Session */
  /** The client on this scope */
  /** Contains the last event id of a captured event.  */
  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
  constructor() {
    this._notifyingListeners = !1, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, this._propagationContext = {
      traceId: Or(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const t = new X();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, Rr(t, vr(this)), t;
  }
  /**
   * Update the client assigned to this scope.
   * Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
   * as well as manually created scopes.
   */
  setClient(t) {
    this._client = t;
  }
  /**
   * Set the ID of the last captured error event.
   * This is generally only captured on the isolation scope.
   */
  setLastEventId(t) {
    this._lastEventId = t;
  }
  /**
   * Get the client assigned to this scope.
   */
  getClient() {
    return this._client;
  }
  /**
   * Get the ID of the last captured error event.
   * This is generally only available on the isolation scope.
   */
  lastEventId() {
    return this._lastEventId;
  }
  /**
   * @inheritDoc
   */
  addScopeListener(t) {
    this._scopeListeners.push(t);
  }
  /**
   * Add an event processor that will be called before an event is sent.
   */
  addEventProcessor(t) {
    return this._eventProcessors.push(t), this;
  }
  /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */
  setUser(t) {
    return this._user = t || {
      email: void 0,
      id: void 0,
      ip_address: void 0,
      username: void 0
    }, this._session && Le(this._session, { user: t }), this._notifyScopeListeners(), this;
  }
  /**
   * Get the user from this scope.
   */
  getUser() {
    return this._user;
  }
  /**
   * Set an object that will be merged into existing tags on the scope,
   * and will be sent as tags data with the event.
   */
  setTags(t) {
    return this._tags = {
      ...this._tags,
      ...t
    }, this._notifyScopeListeners(), this;
  }
  /**
   * Set a single tag that will be sent as tags data with the event.
   */
  setTag(t, n) {
    return this._tags = { ...this._tags, [t]: n }, this._notifyScopeListeners(), this;
  }
  /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */
  setExtras(t) {
    return this._extra = {
      ...this._extra,
      ...t
    }, this._notifyScopeListeners(), this;
  }
  /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */
  setExtra(t, n) {
    return this._extra = { ...this._extra, [t]: n }, this._notifyScopeListeners(), this;
  }
  /**
   * Sets the fingerprint on the scope to send with the events.
   * @param {string[]} fingerprint Fingerprint to group events in Sentry.
   */
  setFingerprint(t) {
    return this._fingerprint = t, this._notifyScopeListeners(), this;
  }
  /**
   * Sets the level on the scope for future events.
   */
  setLevel(t) {
    return this._level = t, this._notifyScopeListeners(), this;
  }
  /**
   * Sets the transaction name on the scope so that the name of e.g. taken server route or
   * the page location is attached to future events.
   *
   * IMPORTANT: Calling this function does NOT change the name of the currently active
   * root span. If you want to change the name of the active root span, use
   * `Sentry.updateSpanName(rootSpan, 'new name')` instead.
   *
   * By default, the SDK updates the scope's transaction name automatically on sensible
   * occasions, such as a page navigation or when handling a new request on the server.
   */
  setTransactionName(t) {
    return this._transactionName = t, this._notifyScopeListeners(), this;
  }
  /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */
  setContext(t, n) {
    return n === null ? delete this._contexts[t] : this._contexts[t] = n, this._notifyScopeListeners(), this;
  }
  /**
   * Set the session for the scope.
   */
  setSession(t) {
    return t ? this._session = t : delete this._session, this._notifyScopeListeners(), this;
  }
  /**
   * Get the session from the scope.
   */
  getSession() {
    return this._session;
  }
  /**
   * Updates the scope with provided data. Can work in three variations:
   * - plain object containing updatable attributes
   * - Scope instance that'll extract the attributes from
   * - callback function that'll receive the current scope as an argument and allow for modifications
   */
  update(t) {
    if (!t)
      return this;
    const n = typeof t == "function" ? t(this) : t, r = n instanceof X ? n.getScopeData() : Ke(n) ? t : void 0, { tags: o, extra: s, user: i, contexts: c, level: u, fingerprint: l = [], propagationContext: d } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...s }, this._contexts = { ...this._contexts, ...c }, i && Object.keys(i).length && (this._user = i), u && (this._level = u), l.length && (this._fingerprint = l), d && (this._propagationContext = d), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, Rr(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: Or(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : li;
    if (r <= 0)
      return this;
    const o = {
      timestamp: Je(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? At(t.message, 2048) : t.message
    };
    return this._breadcrumbs.push(o), this._breadcrumbs.length > r && (this._breadcrumbs = this._breadcrumbs.slice(-r), this._client?.recordDroppedEvent("buffer_overflow", "log_item")), this._notifyScopeListeners(), this;
  }
  /**
   * Get the last breadcrumb of the scope.
   */
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  /**
   * Clear all breadcrumbs from the scope.
   */
  clearBreadcrumbs() {
    return this._breadcrumbs = [], this._notifyScopeListeners(), this;
  }
  /**
   * Add an attachment to the scope.
   */
  addAttachment(t) {
    return this._attachments.push(t), this;
  }
  /**
   * Clear all attachments from the scope.
   */
  clearAttachments() {
    return this._attachments = [], this;
  }
  /**
   * Get the data of this scope, which should be applied to an event during processing.
   */
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: vr(this)
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(t) {
    return this._sdkProcessingMetadata = Qe(this._sdkProcessingMetadata, t, 2), this;
  }
  /**
   * Add propagation context to the scope, used for distributed tracing
   */
  setPropagationContext(t) {
    return this._propagationContext = t, this;
  }
  /**
   * Get propagation context from the scope, used for distributed tracing
   */
  getPropagationContext() {
    return this._propagationContext;
  }
  /**
   * Capture an exception for this scope.
   *
   * @returns {string} The id of the captured Sentry event.
   */
  captureException(t, n) {
    const r = n?.event_id || z();
    if (!this._client)
      return y && _.warn("No client configured on scope - will not capture exception!"), r;
    const o = new Error("Sentry syntheticException");
    return this._client.captureException(
      t,
      {
        originalException: t,
        syntheticException: o,
        ...n,
        event_id: r
      },
      this
    ), r;
  }
  /**
   * Capture a message for this scope.
   *
   * @returns {string} The id of the captured message.
   */
  captureMessage(t, n, r) {
    const o = r?.event_id || z();
    if (!this._client)
      return y && _.warn("No client configured on scope - will not capture message!"), o;
    const s = new Error(t);
    return this._client.captureMessage(
      t,
      n,
      {
        originalException: t,
        syntheticException: s,
        ...r,
        event_id: o
      },
      this
    ), o;
  }
  /**
   * Capture a Sentry event for this scope.
   *
   * @returns {string} The id of the captured event.
   */
  captureEvent(t, n) {
    const r = n?.event_id || z();
    return this._client ? (this._client.captureEvent(t, { ...n, event_id: r }, this), r) : (y && _.warn("No client configured on scope - will not capture event!"), r);
  }
  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    this._notifyingListeners || (this._notifyingListeners = !0, this._scopeListeners.forEach((t) => {
      t(this);
    }), this._notifyingListeners = !1);
  }
}
function fi() {
  return xe("defaultCurrentScope", () => new X());
}
function di() {
  return xe("defaultIsolationScope", () => new X());
}
class pi {
  constructor(t, n) {
    let r;
    t ? r = t : r = new X();
    let o;
    n ? o = n : o = new X(), this._stack = [{ scope: r }], this._isolationScope = o;
  }
  /**
   * Fork a scope for the stack.
   */
  withScope(t) {
    const n = this._pushScope();
    let r;
    try {
      r = t(n);
    } catch (o) {
      throw this._popScope(), o;
    }
    return Ze(r) ? r.then(
      (o) => (this._popScope(), o),
      (o) => {
        throw this._popScope(), o;
      }
    ) : (this._popScope(), r);
  }
  /**
   * Get the client of the stack.
   */
  getClient() {
    return this.getStackTop().client;
  }
  /**
   * Returns the scope of the top stack.
   */
  getScope() {
    return this.getStackTop().scope;
  }
  /**
   * Get the isolation scope for the stack.
   */
  getIsolationScope() {
    return this._isolationScope;
  }
  /**
   * Returns the topmost scope layer in the order domain > local > process.
   */
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  /**
   * Push a scope to the stack.
   */
  _pushScope() {
    const t = this.getScope().clone();
    return this._stack.push({
      client: this.getClient(),
      scope: t
    }), t;
  }
  /**
   * Pop a scope from the stack.
   */
  _popScope() {
    return this._stack.length <= 1 ? !1 : !!this._stack.pop();
  }
}
function Me() {
  const e = Rt(), t = vt(e);
  return t.stack = t.stack || new pi(fi(), di());
}
function mi(e) {
  return Me().withScope(e);
}
function hi(e, t) {
  const n = Me();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function Cr(e) {
  return Me().withScope(() => e(Me().getIsolationScope()));
}
function gi() {
  return {
    withIsolationScope: Cr,
    withScope: mi,
    withSetScope: hi,
    withSetIsolationScope: (e, t) => Cr(t),
    getCurrentScope: () => Me().getScope(),
    getIsolationScope: () => Me().getIsolationScope()
  };
}
function Pn(e) {
  const t = vt(e);
  return t.acs ? t.acs : gi();
}
function Fe() {
  const e = Rt();
  return Pn(e).getCurrentScope();
}
function et() {
  const e = Rt();
  return Pn(e).getIsolationScope();
}
function _i() {
  return xe("globalScope", () => new X());
}
function Ei(...e) {
  const t = Rt(), n = Pn(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function $() {
  return Fe().getClient();
}
function yi(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, s = {
    trace_id: n,
    span_id: o || xo()
  };
  return r && (s.parent_span_id = r), s;
}
const Si = "sentry.source", Ti = "sentry.sample_rate", bi = "sentry.previous_trace_sample_rate", Ai = "sentry.op", Ii = "sentry.origin", Po = "sentry.profile_id", Fo = "sentry.exclusive_time", Oi = 0, Ri = 1, vi = "_sentryScope", Ci = "_sentryIsolationScope";
function Ni(e) {
  if (e) {
    if (typeof e == "object" && "deref" in e && typeof e.deref == "function")
      try {
        return e.deref();
      } catch {
        return;
      }
    return e;
  }
}
function Uo(e) {
  const t = e;
  return {
    scope: t[vi],
    isolationScope: Ni(t[Ci])
  };
}
const wi = "sentry-", Di = /^sentry-/;
function Li(e) {
  const t = Mi(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, s]) => {
    if (o.match(Di)) {
      const i = o.slice(wi.length);
      r[i] = s;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function Mi(e) {
  if (!(!e || !se(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = Nr(n);
      return Object.entries(r).forEach(([o, s]) => {
        t[o] = s;
      }), t;
    }, {}) : Nr(e);
}
function Nr(e) {
  return e.split(",").map((t) => {
    const n = t.indexOf("=");
    if (n === -1)
      return [];
    const r = t.slice(0, n), o = t.slice(n + 1);
    return [r, o].map((s) => {
      try {
        return decodeURIComponent(s.trim());
      } catch {
        return;
      }
    });
  }).reduce((t, [n, r]) => (n && r && (t[n] = r), t), {});
}
const ki = /^o(\d+)\./, xi = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Pi(e) {
  return e === "http" || e === "https";
}
function tt(e, t = !1) {
  const { host: n, path: r, pass: o, port: s, projectId: i, protocol: c, publicKey: u } = e;
  return `${c}://${u}${t && o ? `:${o}` : ""}@${n}${s ? `:${s}` : ""}/${r && `${r}/`}${i}`;
}
function Fi(e) {
  const t = xi.exec(e);
  if (!t) {
    Ct(() => {
      console.error(`Invalid Sentry Dsn: ${e}`);
    });
    return;
  }
  const [n, r, o = "", s = "", i = "", c = ""] = t.slice(1);
  let u = "", l = c;
  const d = l.split("/");
  if (d.length > 1 && (u = d.slice(0, -1).join("/"), l = d.pop()), l) {
    const p = l.match(/^\d+/);
    p && (l = p[0]);
  }
  return $o({ host: s, pass: o, path: u, projectId: l, port: i, protocol: n, publicKey: r });
}
function $o(e) {
  return {
    protocol: e.protocol,
    publicKey: e.publicKey || "",
    pass: e.pass || "",
    host: e.host,
    port: e.port || "",
    path: e.path || "",
    projectId: e.projectId
  };
}
function Ui(e) {
  if (!y)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((i) => e[i] ? !1 : (_.error(`Invalid Sentry Dsn: ${i} missing`), !0)) ? !1 : n.match(/^\d+$/) ? Pi(r) ? t && isNaN(parseInt(t, 10)) ? (_.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (_.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (_.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function $i(e) {
  return e.match(ki)?.[1];
}
function Hi(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = $i(n)), r;
}
function Bi(e) {
  const t = typeof e == "string" ? Fi(e) : $o(e);
  if (!(!t || !Ui(t)))
    return t;
}
function Gi(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const Ho = 1;
let wr = !1;
function zi(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : Fn(e).parent_span_id, s = Uo(e).scope, i = r ? s?.getPropagationContext().propagationSpanId || xo() : t;
  return {
    parent_span_id: o,
    span_id: i,
    trace_id: n
  };
}
function ji(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: s }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === Ho,
      attributes: s,
      ...o
    }));
}
function Dr(e) {
  return typeof e == "number" ? Lr(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? Lr(e.getTime()) : ie();
}
function Lr(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function Fn(e) {
  if (Yi(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if (Wi(e)) {
    const { attributes: r, startTime: o, name: s, endTime: i, status: c, links: u } = e, l = "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: s,
      parent_span_id: l,
      start_timestamp: Dr(o),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: Dr(i) || void 0,
      status: Ki(c),
      op: r[Ai],
      origin: r[Ii],
      links: ji(u)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function Wi(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function Yi(e) {
  return typeof e.getSpanJSON == "function";
}
function qi(e) {
  const { traceFlags: t } = e.spanContext();
  return t === Ho;
}
function Ki(e) {
  if (!(!e || e.code === Oi))
    return e.code === Ri ? "ok" : e.message || "unknown_error";
}
const Xi = "_sentryRootSpan";
function Bo(e) {
  return e[Xi] || e;
}
function Mr() {
  wr || (Ct(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), wr = !0);
}
function Vi(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = $()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function kr(e) {
  _.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function xr(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (Ji(n)) {
      if (_t(e.description, n))
        return y && kr(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? _t(e.description, n.name) : !0, o = n.op ? e.op && _t(e.op, n.op) : !0;
    if (r && o)
      return y && kr(e), !0;
  }
  return !1;
}
function Zi(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function Ji(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const Un = "production", Qi = "_frozenDsc";
function Go(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || Un,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: Hi(t)
  };
  return t.emit("createDsc", o), o;
}
function ea(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || Go(n.traceId, e);
}
function ta(e) {
  const t = $();
  if (!t)
    return {};
  const n = Bo(e), r = Fn(n), o = r.data, s = n.spanContext().traceState, i = s?.get("sentry.sample_rate") ?? o[Ti] ?? o[bi];
  function c(T) {
    return (typeof i == "number" || typeof i == "string") && (T.sample_rate = `${i}`), T;
  }
  const u = n[Qi];
  if (u)
    return c(u);
  const l = s?.get("sentry.dsc"), d = l && Li(l);
  if (d)
    return c(d);
  const p = Go(e.spanContext().traceId, t), E = o[Si], m = r.description;
  return E !== "url" && m && (p.transaction = m), Vi() && (p.sampled = String(qi(n)), p.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  s?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  Uo(n).scope?.getPropagationContext().sampleRand.toString()), c(p), t.emit("createDsc", p, n), p;
}
function oe(e, t = 100, n = 1 / 0) {
  try {
    return mn("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function zo(e, t = 3, n = 100 * 1024) {
  const r = oe(e, t);
  return sa(r) > n ? zo(e, t - 1, n) : r;
}
function mn(e, t, n = 1 / 0, r = 1 / 0, o = ia()) {
  const [s, i] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const c = na(e, t);
  if (!c.startsWith("[object "))
    return c;
  if (t.__sentry_skip_normalization__)
    return t;
  const u = typeof t.__sentry_override_normalization_depth__ == "number" ? t.__sentry_override_normalization_depth__ : n;
  if (u === 0)
    return c.replace("object ", "");
  if (s(t))
    return "[Circular ~]";
  const l = t;
  if (l && typeof l.toJSON == "function")
    try {
      const m = l.toJSON();
      return mn("", m, u - 1, r, o);
    } catch {
    }
  const d = Array.isArray(t) ? [] : {};
  let p = 0;
  const E = Lo(t);
  for (const m in E) {
    if (!Object.prototype.hasOwnProperty.call(E, m))
      continue;
    if (p >= r) {
      d[m] = "[MaxProperties ~]";
      break;
    }
    const T = E[m];
    d[m] = mn(m, T, u - 1, r, o), p++;
  }
  return i(t), d;
}
function na(e, t) {
  try {
    if (e === "domain" && t && typeof t == "object" && t._events)
      return "[Domain]";
    if (e === "domainEmitter")
      return "[DomainEmitter]";
    if (typeof global < "u" && t === global)
      return "[Global]";
    if (typeof window < "u" && t === window)
      return "[Window]";
    if (typeof document < "u" && t === document)
      return "[Document]";
    if (Co(t))
      return "[VueViewModel]";
    if (Zs(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${ce(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = ra(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function ra(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function oa(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function sa(e) {
  return oa(JSON.stringify(e));
}
function ia() {
  const e = /* @__PURE__ */ new WeakSet();
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1);
  }
  function n(r) {
    e.delete(r);
  }
  return [t, n];
}
function Ue(e, t = []) {
  return [e, t];
}
function aa(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function Pr(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function hn(e) {
  const t = vt(b);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function ca(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(s) {
    typeof r == "string" ? r = typeof s == "string" ? r + s : [hn(r), s] : r.push(typeof s == "string" ? hn(s) : s);
  }
  for (const s of n) {
    const [i, c] = s;
    if (o(`
${JSON.stringify(i)}
`), typeof c == "string" || c instanceof Uint8Array)
      o(c);
    else {
      let u;
      try {
        u = JSON.stringify(c);
      } catch {
        u = JSON.stringify(oe(c));
      }
      o(u);
    }
  }
  return typeof r == "string" ? r : ua(r);
}
function ua(e) {
  const t = e.reduce((o, s) => o + s.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function la(e) {
  const t = typeof e.data == "string" ? hn(e.data) : e.data;
  return [
    {
      type: "attachment",
      length: t.length,
      filename: e.filename,
      content_type: e.contentType,
      attachment_type: e.attachmentType
    },
    t
  ];
}
const fa = {
  session: "session",
  sessions: "session",
  attachment: "attachment",
  transaction: "transaction",
  event: "error",
  client_report: "internal",
  user_report: "default",
  profile: "profile",
  profile_chunk: "profile",
  replay_event: "replay",
  replay_recording: "replay",
  check_in: "monitor",
  feedback: "feedback",
  span: "span",
  raw_security: "security",
  log: "log_item",
  metric: "metric",
  trace_metric: "metric"
};
function Fr(e) {
  return fa[e];
}
function jo(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function da(e, t, n, r) {
  const o = e.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: e.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...t && { sdk: t },
    ...!!n && r && { dsn: tt(r) },
    ...o && {
      trace: o
    }
  };
}
function pa(e, t) {
  if (!t)
    return e;
  const n = e.sdk || {};
  return e.sdk = {
    ...n,
    name: n.name || t.name,
    version: n.version || t.version,
    integrations: [...e.sdk?.integrations || [], ...t.integrations || []],
    packages: [...e.sdk?.packages || [], ...t.packages || []],
    settings: e.sdk?.settings || t.settings ? {
      ...e.sdk?.settings,
      ...t.settings
    } : void 0
  }, e;
}
function ma(e, t, n, r) {
  const o = jo(n), s = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: tt(t) }
  }, i = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return Ue(s, [i]);
}
function ha(e, t, n, r) {
  const o = jo(n), s = e.type && e.type !== "replay_event" ? e.type : "event";
  pa(e, n?.sdk);
  const i = da(e, o, r, t);
  return delete e.sdkProcessingMetadata, Ue(i, [[{ type: s }, e]]);
}
const Zt = 0, Ur = 1, $r = 2;
function Lt(e) {
  return new Xe((t) => {
    t(e);
  });
}
function $n(e) {
  return new Xe((t, n) => {
    n(e);
  });
}
class Xe {
  constructor(t) {
    this._state = Zt, this._handlers = [], this._runExecutor(t);
  }
  /** @inheritdoc */
  then(t, n) {
    return new Xe((r, o) => {
      this._handlers.push([
        !1,
        (s) => {
          if (!t)
            r(s);
          else
            try {
              r(t(s));
            } catch (i) {
              o(i);
            }
        },
        (s) => {
          if (!n)
            o(s);
          else
            try {
              r(n(s));
            } catch (i) {
              o(i);
            }
        }
      ]), this._executeHandlers();
    });
  }
  /** @inheritdoc */
  catch(t) {
    return this.then((n) => n, t);
  }
  /** @inheritdoc */
  finally(t) {
    return new Xe((n, r) => {
      let o, s;
      return this.then(
        (i) => {
          s = !1, o = i, t && t();
        },
        (i) => {
          s = !0, o = i, t && t();
        }
      ).then(() => {
        if (s) {
          r(o);
          return;
        }
        n(o);
      });
    });
  }
  /** Excute the resolve/reject handlers. */
  _executeHandlers() {
    if (this._state === Zt)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === Ur && n[1](this._value), this._state === $r && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (s, i) => {
      if (this._state === Zt) {
        if (Ze(i)) {
          i.then(r, o);
          return;
        }
        this._state = s, this._value = i, this._executeHandlers();
      }
    }, r = (s) => {
      n(Ur, s);
    }, o = (s) => {
      n($r, s);
    };
    try {
      t(r, o);
    } catch (s) {
      o(s);
    }
  }
}
function ga(e, t, n, r = 0) {
  try {
    const o = gn(t, n, e, r);
    return Ze(o) ? o : Lt(o);
  } catch (o) {
    return $n(o);
  }
}
function gn(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const s = o({ ...e }, t);
  return y && s === null && _.log(`Event processor "${o.id || "?"}" dropped event`), Ze(s) ? s.then((i) => gn(i, t, n, r + 1)) : gn(s, t, n, r + 1);
}
function _a(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: s } = t;
  Ea(e, t), r && Ta(e, r), ba(e, n), ya(e, o), Sa(e, s);
}
function Hr(e, t) {
  const {
    extra: n,
    tags: r,
    user: o,
    contexts: s,
    level: i,
    sdkProcessingMetadata: c,
    breadcrumbs: u,
    fingerprint: l,
    eventProcessors: d,
    attachments: p,
    propagationContext: E,
    transactionName: m,
    span: T
  } = t;
  lt(e, "extra", n), lt(e, "tags", r), lt(e, "user", o), lt(e, "contexts", s), e.sdkProcessingMetadata = Qe(e.sdkProcessingMetadata, c, 2), i && (e.level = i), m && (e.transactionName = m), T && (e.span = T), u.length && (e.breadcrumbs = [...e.breadcrumbs, ...u]), l.length && (e.fingerprint = [...e.fingerprint, ...l]), d.length && (e.eventProcessors = [...e.eventProcessors, ...d]), p.length && (e.attachments = [...e.attachments, ...p]), e.propagationContext = { ...e.propagationContext, ...E };
}
function lt(e, t, n) {
  e[t] = Qe(e[t], n, 1);
}
function Ea(e, t) {
  const { extra: n, tags: r, user: o, contexts: s, level: i, transactionName: c } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(s).length && (e.contexts = { ...s, ...e.contexts }), i && (e.level = i), c && e.type !== "transaction" && (e.transaction = c);
}
function ya(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function Sa(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function Ta(e, t) {
  e.contexts = {
    trace: zi(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: ta(t),
    ...e.sdkProcessingMetadata
  };
  const n = Bo(t), r = Fn(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function ba(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let me, Br, Gr, ae;
function Aa(e) {
  const t = b._sentryDebugIds, n = b._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (ae && r.length === Br && o.length === Gr)
    return ae;
  Br = r.length, Gr = o.length, ae = {}, me || (me = {});
  const s = (i, c) => {
    for (const u of i) {
      const l = c[u], d = me?.[u];
      if (d && ae && l)
        ae[d[0]] = l, me && (me[u] = [d[0], l]);
      else if (l) {
        const p = e(u);
        for (let E = p.length - 1; E >= 0; E--) {
          const T = p[E]?.filename;
          if (T && ae && me) {
            ae[T] = l, me[u] = [T, l];
            break;
          }
        }
      }
    }
  };
  return t && s(r, t), n && s(o, n), ae;
}
function Ia(e, t, n, r, o, s) {
  const { normalizeDepth: i = 3, normalizeMaxBreadth: c = 1e3 } = e, u = {
    ...t,
    event_id: t.event_id || n.event_id || z(),
    timestamp: t.timestamp || Je()
  }, l = n.integrations || e.integrations.map((I) => I.name);
  Oa(u, e), Ca(u, l), o && o.emit("applyFrameMetadata", t), t.type === void 0 && Ra(u, e.stackParser);
  const d = wa(r, n.captureContext);
  n.mechanism && De(u, n.mechanism);
  const p = o ? o.getEventProcessors() : [], E = _i().getScopeData();
  if (s) {
    const I = s.getScopeData();
    Hr(E, I);
  }
  if (d) {
    const I = d.getScopeData();
    Hr(E, I);
  }
  const m = [...n.attachments || [], ...E.attachments];
  m.length && (n.attachments = m), _a(u, E);
  const T = [
    ...p,
    // Run scope event processors _after_ all other processors
    ...E.eventProcessors
  ];
  return ga(T, u, n).then((I) => (I && va(I), typeof i == "number" && i > 0 ? Na(I, i, c) : I));
}
function Oa(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: s = 250 } = t;
  e.environment = e.environment || n || Un, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const i = e.request;
  i?.url && (i.url = At(i.url, s));
}
function Ra(e, t) {
  const n = Aa(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function va(e) {
  const t = {};
  if (e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.debug_id && (o.abs_path ? t[o.abs_path] = o.debug_id : o.filename && (t[o.filename] = o.debug_id), delete o.debug_id);
    });
  }), Object.keys(t).length === 0)
    return;
  e.debug_meta = e.debug_meta || {}, e.debug_meta.images = e.debug_meta.images || [];
  const n = e.debug_meta.images;
  Object.entries(t).forEach(([r, o]) => {
    n.push({
      type: "sourcemap",
      code_file: r,
      debug_id: o
    });
  });
}
function Ca(e, t) {
  t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Na(e, t, n) {
  if (!e)
    return null;
  const r = {
    ...e,
    ...e.breadcrumbs && {
      breadcrumbs: e.breadcrumbs.map((o) => ({
        ...o,
        ...o.data && {
          data: oe(o.data, t, n)
        }
      }))
    },
    ...e.user && {
      user: oe(e.user, t, n)
    },
    ...e.contexts && {
      contexts: oe(e.contexts, t, n)
    },
    ...e.extra && {
      extra: oe(e.extra, t, n)
    }
  };
  return e.contexts?.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = oe(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((o) => ({
    ...o,
    ...o.data && {
      data: oe(o.data, t, n)
    }
  }))), e.contexts?.flags && r.contexts && (r.contexts.flags = oe(e.contexts.flags, 3, n)), r;
}
function wa(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new X();
  return n.update(t), n;
}
function Da(e, t) {
  return Fe().captureException(e, void 0);
}
function Wo(e, t) {
  return Fe().captureEvent(e, t);
}
function zr(e) {
  const t = et(), n = Fe(), { userAgent: r } = b.navigator || {}, o = ai({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), s = t.getSession();
  return s?.status === "ok" && Le(s, { status: "exited" }), Yo(), t.setSession(o), o;
}
function Yo() {
  const e = et(), n = Fe().getSession() || e.getSession();
  n && ci(n), qo(), e.setSession();
}
function qo() {
  const e = et(), t = $(), n = e.getSession();
  n && t && t.captureSession(n);
}
function jr(e = !1) {
  if (e) {
    Yo();
    return;
  }
  qo();
}
const La = "7";
function Ma(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function ka(e) {
  return `${Ma(e)}${e.projectId}/envelope/`;
}
function xa(e, t) {
  const n = {
    sentry_version: La
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function Pa(e, t, n) {
  return t || `${ka(e)}?${xa(e, n)}`;
}
const Wr = [];
function Fa(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && Ko(e, r, n);
  }), n;
}
function Yr(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function Ko(e, t, n) {
  if (n[t.name]) {
    y && _.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, Wr.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), Wr.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
    const r = t.preprocessEvent.bind(t);
    e.on("preprocessEvent", (o, s) => r(o, s, e));
  }
  if (typeof t.processEvent == "function") {
    const r = t.processEvent.bind(t), o = Object.assign((s, i) => r(s, i, e), {
      id: t.name
    });
    e.addEventProcessor(o);
  }
  y && _.log(`Integration installed: ${t.name}`);
}
function Ua(e) {
  return [
    {
      type: "log",
      item_count: e.length,
      content_type: "application/vnd.sentry.items.log+json"
    },
    {
      items: e
    }
  ];
}
function $a(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = tt(r)), Ue(o, [Ua(e)]);
}
function Xo(e, t) {
  const n = t ?? Ha(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = $a(n, r._metadata, r.tunnel, e.getDsn());
  Vo().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function Ha(e) {
  return Vo().get(e);
}
function Vo() {
  return xe("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Ba(e) {
  return [
    {
      type: "trace_metric",
      item_count: e.length,
      content_type: "application/vnd.sentry.items.trace-metric+json"
    },
    {
      items: e
    }
  ];
}
function Ga(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = tt(r)), Ue(o, [Ba(e)]);
}
function Zo(e, t) {
  const n = t ?? za(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Ga(n, r._metadata, r.tunnel, e.getDsn());
  Jo().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function za(e) {
  return Jo().get(e);
}
function Jo() {
  return xe("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function ja(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: Je(),
      discarded_events: e
    }
  ];
  return Ue(t ? { dsn: t } : {}, [r]);
}
function Qo(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function Wa(e) {
  const { trace_id: t, parent_span_id: n, span_id: r, status: o, origin: s, data: i, op: c } = e.contexts?.trace ?? {};
  return {
    data: i ?? {},
    description: e.transaction,
    op: c,
    parent_span_id: n,
    span_id: r ?? "",
    start_timestamp: e.start_timestamp ?? 0,
    status: o,
    timestamp: e.timestamp,
    trace_id: t ?? "",
    origin: s,
    profile_id: i?.[Po],
    exclusive_time: i?.[Fo],
    measurements: e.measurements,
    is_segment: !0
  };
}
function Ya(e) {
  return {
    type: "transaction",
    timestamp: e.timestamp,
    start_timestamp: e.start_timestamp,
    transaction: e.description,
    contexts: {
      trace: {
        trace_id: e.trace_id,
        span_id: e.span_id,
        parent_span_id: e.parent_span_id,
        op: e.op,
        status: e.status,
        origin: e.origin,
        data: {
          ...e.data,
          ...e.profile_id && { [Po]: e.profile_id },
          ...e.exclusive_time && { [Fo]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const qr = "Not capturing exception because it's already been captured.", Kr = "Discarded session because of missing or non-string release", es = Symbol.for("SentryInternalError"), ts = Symbol.for("SentryDoNotSendEventError"), qa = 5e3;
function Et(e) {
  return {
    message: e,
    [es]: !0
  };
}
function Jt(e) {
  return {
    message: e,
    [ts]: !0
  };
}
function Xr(e) {
  return !!e && typeof e == "object" && es in e;
}
function Vr(e) {
  return !!e && typeof e == "object" && ts in e;
}
function Zr(e, t, n, r, o) {
  let s = 0, i;
  e.on(n, () => {
    s = 0, clearTimeout(i);
  }), e.on(t, (c) => {
    s += r(c), s >= 8e5 ? o(e) : (clearTimeout(i), i = setTimeout(() => {
      o(e);
    }, qa));
  }), e.on("flush", () => {
    o(e);
  });
}
class Ka {
  /** Options passed to the SDK. */
  /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
  /** Array of set up integrations. */
  /** Number of calls being processed */
  /** Holds flushable  */
  // eslint-disable-next-line @typescript-eslint/ban-types
  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
  constructor(t) {
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = Bi(t.dsn) : y && _.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = Pa(
        this._dsn,
        t.tunnel,
        t._metadata ? t._metadata.sdk : void 0
      );
      this._transport = t.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...t.transportOptions,
        url: n
      });
    }
    this._options.enableLogs && Zr(this, "afterCaptureLog", "flushLogs", Ja, Xo), this._options._experiments?.enableMetrics && Zr(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      Za,
      Zo
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = z();
    if (Ar(t))
      return y && _.log(qr), o;
    const s = {
      event_id: o,
      ...n
    };
    return this._process(
      this.eventFromException(t, s).then(
        (i) => this._captureEvent(i, s, r)
      )
    ), s.event_id;
  }
  /**
   * Captures a message event and sends it to Sentry.
   *
   * Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureMessage(t, n, r, o) {
    const s = {
      event_id: z(),
      ...r
    }, i = Mn(t) ? t : String(t), c = Nt(t) ? this.eventFromMessage(i, n, s) : this.eventFromException(t, s);
    return this._process(c.then((u) => this._captureEvent(u, s, o))), s.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = z();
    if (n?.originalException && Ar(n.originalException))
      return y && _.log(qr), o;
    const s = {
      event_id: o,
      ...n
    }, i = t.sdkProcessingMetadata || {}, c = i.capturedSpanScope, u = i.capturedSpanIsolationScope;
    return this._process(
      this._captureEvent(t, s, c || r, u)
    ), s.event_id;
  }
  /**
   * Captures a session.
   */
  captureSession(t) {
    this.sendSession(t), Le(t, { init: !1 });
  }
  /**
   * Create a cron monitor check in and send it to Sentry. This method is not available on all clients.
   *
   * @param checkIn An object that describes a check in.
   * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
   * to create a monitor automatically when sending a check in.
   * @param scope An optional scope containing event metadata.
   * @returns A string representing the id of the check in.
   */
  /**
   * Get the current Dsn.
   */
  getDsn() {
    return this._dsn;
  }
  /**
   * Get the current options.
   */
  getOptions() {
    return this._options;
  }
  /**
   * Get the SDK metadata.
   * @see SdkMetadata
   */
  getSdkMetadata() {
    return this._options._metadata;
  }
  /**
   * Returns the transport that is used by the client.
   * Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
   */
  getTransport() {
    return this._transport;
  }
  /**
   * Wait for all events to be sent or the timeout to expire, whichever comes first.
   *
   * @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
   *   cause the client to wait until all events are sent before resolving the promise.
   * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
   * still events in the queue when the timeout is reached.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async flush(t) {
    const n = this._transport;
    if (!n)
      return !0;
    this.emit("flush");
    const r = await this._isClientDoneProcessing(t), o = await n.flush(t);
    return r && o;
  }
  /**
   * Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
   *
   * @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
   *   the client to wait until all events are sent before disabling itself.
   * @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
   * it doesn't.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async close(t) {
    const n = await this.flush(t);
    return this.getOptions().enabled = !1, this.emit("close"), n;
  }
  /**
   * Get all installed event processors.
   */
  getEventProcessors() {
    return this._eventProcessors;
  }
  /**
   * Adds an event processor that applies to any event processed by this client.
   */
  addEventProcessor(t) {
    this._eventProcessors.push(t);
  }
  /**
   * Initialize this client.
   * Call this after the client was set on a scope.
   */
  init() {
    (this._isEnabled() || // Force integrations to be setup even if no DSN was set when we have
    // Spotlight enabled. This is particularly important for browser as we
    // don't support the `spotlight` option there and rely on the users
    // adding the `spotlightBrowserIntegration()` to their integrations which
    // wouldn't get initialized with the check below when there's no DSN set.
    this._options.integrations.some(({ name: t }) => t.startsWith("Spotlight"))) && this._setupIntegrations();
  }
  /**
   * Gets an installed integration by its name.
   *
   * @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
   */
  getIntegrationByName(t) {
    return this._integrations[t];
  }
  /**
   * Add an integration to the client.
   * This can be used to e.g. lazy load integrations.
   * In most cases, this should not be necessary,
   * and you're better off just passing the integrations via `integrations: []` at initialization time.
   * However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
   */
  addIntegration(t) {
    const n = this._integrations[t.name];
    Ko(this, t, this._integrations), n || Yr(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = ha(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = aa(r, la(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = Un } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        y && _.warn(Kr);
        return;
      }
      s.release = s.release || n, s.environment = s.environment || r, t.attrs = s;
    } else {
      if (!t.release && !n) {
        y && _.warn(Kr);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = ma(t, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(o);
  }
  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
   */
  recordDroppedEvent(t, n, r = 1) {
    if (this._options.sendClientReports) {
      const o = `${t}:${n}`;
      y && _.log(`Recording outcome: "${o}"${r > 1 ? ` (${r} times)` : ""}`), this._outcomes[o] = (this._outcomes[o] || 0) + r;
    }
  }
  /* eslint-disable @typescript-eslint/unified-signatures */
  /**
   * Register a callback for whenever a span is started.
   * Receives the span as argument.
   * @returns {() => void} A function that, when executed, removes the registered callback.
   */
  /**
   * Register a hook on this client.
   */
  on(t, n) {
    const r = this._hooks[t] = this._hooks[t] || /* @__PURE__ */ new Set(), o = (...s) => n(...s);
    return r.add(o), () => {
      r.delete(o);
    };
  }
  /** Fire a hook whenever a span starts. */
  /**
   * Emit a hook that was previously registered via `on()`.
   */
  emit(t, ...n) {
    const r = this._hooks[t];
    r && r.forEach((o) => o(...n));
  }
  /**
   * Send an envelope to Sentry.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async sendEnvelope(t) {
    if (this.emit("beforeEnvelope", t), this._isEnabled() && this._transport)
      try {
        return await this._transport.send(t);
      } catch (n) {
        return y && _.error("Error while sending envelope:", n), {};
      }
    return y && _.error("Transport disabled"), {};
  }
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Setup integrations for this client. */
  _setupIntegrations() {
    const { integrations: t } = this._options;
    this._integrations = Fa(this, t), Yr(this, t);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(t, n) {
    let r = n.level === "fatal", o = !1;
    const s = n.exception?.values;
    if (s) {
      o = !0;
      for (const u of s)
        if (u.mechanism?.handled === !1) {
          r = !0;
          break;
        }
    }
    const i = t.status === "ok";
    (i && t.errors === 0 || i && r) && (Le(t, {
      ...r && { status: "crashed" },
      errors: t.errors || Number(o || r)
    }), this.captureSession(t));
  }
  /**
   * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
   * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
   * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
   * `false` otherwise
   */
  async _isClientDoneProcessing(t) {
    let n = 0;
    for (; !t || n < t; ) {
      if (await new Promise((r) => setTimeout(r, 1)), !this._numProcessing)
        return !0;
      n++;
    }
    return !1;
  }
  /** Determines whether this SDK is enabled and a transport is present. */
  _isEnabled() {
    return this.getOptions().enabled !== !1 && this._transport !== void 0;
  }
  /**
   * Adds common information to events.
   *
   * The information includes release and environment from `options`,
   * breadcrumbs and context (extra, tags and user) from the scope.
   *
   * Information that is already present in the event is never overwritten. For
   * nested objects, such as the context, keys are merged.
   *
   * @param event The original event.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A new event with more information.
   */
  _prepareEvent(t, n, r, o) {
    const s = this.getOptions(), i = Object.keys(this._integrations);
    return !n.integrations && i?.length && (n.integrations = i), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Ia(s, t, n, r, this, o).then((c) => {
      if (c === null)
        return c;
      this.emit("postprocessEvent", c, n), c.contexts = {
        trace: yi(r),
        ...c.contexts
      };
      const u = ea(this, r);
      return c.sdkProcessingMetadata = {
        dynamicSamplingContext: u,
        ...c.sdkProcessingMetadata
      }, c;
    });
  }
  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
  _captureEvent(t, n = {}, r = Fe(), o = et()) {
    return y && _n(t) && _.log(`Captured error event \`${Qo(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (s) => s.event_id,
      (s) => {
        y && (Vr(s) ? _.log(s.message) : Xr(s) ? _.warn(s.message) : _.warn(s));
      }
    );
  }
  /**
   * Processes an event (either error or message) and sends it to Sentry.
   *
   * This also adds breadcrumbs and context information to the event. However,
   * platform specific meta data (such as the User's IP address) must be added
   * by the SDK implementor.
   *
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
   */
  _processEvent(t, n, r, o) {
    const s = this.getOptions(), { sampleRate: i } = s, c = ns(t), u = _n(t), l = t.type || "error", d = `before send for type \`${l}\``, p = typeof i > "u" ? void 0 : Gi(i);
    if (u && typeof p == "number" && Math.random() > p)
      return this.recordDroppedEvent("sample_rate", "error"), $n(
        Jt(
          `Discarding event because it's not included in the random sample (sampling rate = ${i})`
        )
      );
    const E = l === "replay_event" ? "replay" : l;
    return this._prepareEvent(t, n, r, o).then((m) => {
      if (m === null)
        throw this.recordDroppedEvent("event_processor", E), Jt("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return m;
      const W = Va(this, s, m, n);
      return Xa(W, d);
    }).then((m) => {
      if (m === null) {
        if (this.recordDroppedEvent("before_send", E), c) {
          const Y = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", Y);
        }
        throw Jt(`${d} returned \`null\`, will not send event.`);
      }
      const T = r.getSession() || o.getSession();
      if (u && T && this._updateSessionFromEvent(T, m), c) {
        const I = m.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, Y = m.spans ? m.spans.length : 0, G = I - Y;
        G > 0 && this.recordDroppedEvent("before_send", "span", G);
      }
      const W = m.transaction_info;
      if (c && W && m.transaction !== t.transaction) {
        const I = "custom";
        m.transaction_info = {
          ...W,
          source: I
        };
      }
      return this.sendEvent(m, n), m;
    }).then(null, (m) => {
      throw Vr(m) || Xr(m) ? m : (this.captureException(m, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: m
      }), Et(
        `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${m}`
      ));
    });
  }
  /**
   * Occupies the client with processing and event
   */
  _process(t) {
    this._numProcessing++, t.then(
      (n) => (this._numProcessing--, n),
      (n) => (this._numProcessing--, n)
    );
  }
  /**
   * Clears outcomes on this client and returns them.
   */
  _clearOutcomes() {
    const t = this._outcomes;
    return this._outcomes = {}, Object.entries(t).map(([n, r]) => {
      const [o, s] = n.split(":");
      return {
        reason: o,
        category: s,
        quantity: r
      };
    });
  }
  /**
   * Sends client reports as an envelope.
   */
  _flushOutcomes() {
    y && _.log("Flushing outcomes...");
    const t = this._clearOutcomes();
    if (t.length === 0) {
      y && _.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      y && _.log("No dsn provided, will not send outcomes");
      return;
    }
    y && _.log("Sending outcomes:", t);
    const n = ja(t, this._options.tunnel && tt(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function Xa(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (Ze(e))
    return e.then(
      (r) => {
        if (!Ke(r) && r !== null)
          throw Et(n);
        return r;
      },
      (r) => {
        throw Et(`${t} rejected with ${r}`);
      }
    );
  if (!Ke(e) && e !== null)
    throw Et(n);
  return e;
}
function Va(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i, ignoreSpans: c } = t;
  let u = n;
  if (_n(u) && o)
    return o(u, r);
  if (ns(u)) {
    if (i || c) {
      const l = Wa(u);
      if (c?.length && xr(l, c))
        return null;
      if (i) {
        const d = i(l);
        d ? u = Qe(n, Ya(d)) : Mr();
      }
      if (u.spans) {
        const d = [], p = u.spans;
        for (const m of p) {
          if (c?.length && xr(m, c)) {
            Zi(p, m);
            continue;
          }
          if (i) {
            const T = i(m);
            T ? d.push(T) : (Mr(), d.push(m));
          } else
            d.push(m);
        }
        const E = u.spans.length - d.length;
        E && e.recordDroppedEvent("before_send", "span", E), u.spans = d;
      }
    }
    if (s) {
      if (u.spans) {
        const l = u.spans.length;
        u.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: l
        };
      }
      return s(u, r);
    }
  }
  return u;
}
function _n(e) {
  return e.type === void 0;
}
function ns(e) {
  return e.type === "transaction";
}
function Za(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + rs(e.attributes);
}
function Ja(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + rs(e.attributes);
}
function rs(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * Jr(n[0]) : Nt(n) ? t += Jr(n) : t += 100;
  }), t;
}
function Jr(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const os = Symbol.for("SentryBufferFullError");
function Qa(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(i) {
    t.delete(i);
  }
  function o(i) {
    if (!n())
      return $n(os);
    const c = i();
    return t.add(c), c.then(
      () => r(c),
      () => r(c)
    ), c;
  }
  function s(i) {
    if (!t.size)
      return Lt(!0);
    const c = Promise.allSettled(Array.from(t)).then(() => !0);
    if (!i)
      return c;
    const u = [c, new Promise((l) => setTimeout(() => l(!1), i))];
    return Promise.race(u);
  }
  return {
    get $() {
      return Array.from(t);
    },
    add: o,
    drain: s
  };
}
const ec = 60 * 1e3;
function tc(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? ec : r - t;
}
function nc(e, t) {
  return e[t] || e.all || 0;
}
function rc(e, t, n = Date.now()) {
  return nc(e, t) > n;
}
function oc(e, { statusCode: t, headers: n }, r = Date.now()) {
  const o = {
    ...e
  }, s = n?.["x-sentry-rate-limits"], i = n?.["retry-after"];
  if (s)
    for (const c of s.trim().split(",")) {
      const [u, l, , , d] = c.split(":", 5), p = parseInt(u, 10), E = (isNaN(p) ? 60 : p) * 1e3;
      if (!l)
        o.all = r + E;
      else
        for (const m of l.split(";"))
          m === "metric_bucket" ? (!d || d.split(";").includes("custom")) && (o[m] = r + E) : o[m] = r + E;
    }
  else i ? o.all = r + tc(i, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const sc = 64;
function ic(e, t, n = Qa(
  e.bufferSize || sc
)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const c = [];
    if (Pr(i, (p, E) => {
      const m = Fr(E);
      rc(r, m) ? e.recordDroppedEvent("ratelimit_backoff", m) : c.push(p);
    }), c.length === 0)
      return Promise.resolve({});
    const u = Ue(i[0], c), l = (p) => {
      Pr(u, (E, m) => {
        e.recordDroppedEvent(p, Fr(m));
      });
    }, d = () => t({ body: ca(u) }).then(
      (p) => (p.statusCode !== void 0 && (p.statusCode < 200 || p.statusCode >= 300) && y && _.warn(`Sentry responded with status code ${p.statusCode} to sent event.`), r = oc(r, p), p),
      (p) => {
        throw l("network_error"), y && _.error("Encountered error running transport request:", p), p;
      }
    );
    return n.add(d).then(
      (p) => p,
      (p) => {
        if (p === os)
          return y && _.error("Skipped sending event because buffer is full."), l("queue_overflow"), Promise.resolve({});
        throw p;
      }
    );
  }
  return {
    send: s,
    flush: o
  };
}
function Qt(e) {
  if (!e)
    return {};
  const t = e.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!t)
    return {};
  const n = t[6] || "", r = t[8] || "";
  return {
    host: t[4],
    path: t[5],
    protocol: t[2],
    search: n,
    hash: r,
    relative: t[5] + n + r
    // everything minus origin
  };
}
function ac(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function cc(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  o.sdk || (o.sdk = {
    name: `sentry.javascript.${t}`,
    packages: n.map((s) => ({
      name: `${r}:@sentry/${s}`,
      version: ge
    })),
    version: ge
  }), e._metadata = o;
}
const uc = 100;
function ye(e, t) {
  const n = $(), r = et();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = uc } = n.getOptions();
  if (s <= 0) return;
  const c = { timestamp: Je(), ...e }, u = o ? Ct(() => o(c, t)) : c;
  u !== null && (n.emit && n.emit("beforeAddBreadcrumb", u, t), r.addBreadcrumb(u, s));
}
let Qr;
const lc = "FunctionToString", eo = /* @__PURE__ */ new WeakMap(), fc = () => ({
  name: lc,
  setupOnce() {
    Qr = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = xn(this), n = eo.has($()) && t !== void 0 ? t : this;
        return Qr.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    eo.set(e, !0);
  }
}), dc = fc, pc = [
  /^Script error\.?$/,
  /^Javascript error: Script error\.? on line 0$/,
  /^ResizeObserver loop completed with undelivered notifications.$/,
  // The browser logs this when a ResizeObserver handler takes a bit longer. Usually this is not an actual issue though. It indicates slowness.
  /^Cannot redefine property: googletag$/,
  // This is thrown when google tag manager is used in combination with an ad blocker
  /^Can't find variable: gmo$/,
  // Error from Google Search App https://issuetracker.google.com/issues/396043331
  /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
  // Random error that happens but not actionable or noticeable to end-users.
  `can't redefine non-configurable property "solana"`,
  // Probably a browser extension or custom browser (Brave) throwing this error
  "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
  // Error thrown by GTM, seemingly not affecting end-users
  "Can't find variable: _AutofillCallbackHandler",
  // Unactionable error in instagram webview https://developers.facebook.com/community/threads/320013549791141/
  /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
  // unactionable error from CEFSharp, a .NET library that embeds chromium in .NET apps
  /^Java exception was raised during method invocation$/
  // error from Facebook Mobile browser (https://github.com/getsentry/sentry-javascript/issues/15065)
], mc = "EventFilters", hc = (e = {}) => {
  let t;
  return {
    name: mc,
    setup(n) {
      const r = n.getOptions();
      t = to(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const s = o.getOptions();
        t = to(e, s);
      }
      return _c(n, t) ? null : n;
    }
  };
}, gc = (e = {}) => ({
  ...hc(e),
  name: "InboundFilters"
});
function to(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : pc
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function _c(e, t) {
  if (e.type) {
    if (e.type === "transaction" && yc(e, t.ignoreTransactions))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${he(e)}`
      ), !0;
  } else {
    if (Ec(e, t.ignoreErrors))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${he(e)}`
      ), !0;
    if (Ac(e))
      return y && _.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${he(
          e
        )}`
      ), !0;
    if (Sc(e, t.denyUrls))
      return y && _.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${he(
          e
        )}.
Url: ${It(e)}`
      ), !0;
    if (!Tc(e, t.allowUrls))
      return y && _.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${he(
          e
        )}.
Url: ${It(e)}`
      ), !0;
  }
  return !1;
}
function Ec(e, t) {
  return t?.length ? Qo(e).some((n) => Dt(n, t)) : !1;
}
function yc(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? Dt(n, t) : !1;
}
function Sc(e, t) {
  if (!t?.length)
    return !1;
  const n = It(e);
  return n ? Dt(n, t) : !1;
}
function Tc(e, t) {
  if (!t?.length)
    return !0;
  const n = It(e);
  return n ? Dt(n, t) : !0;
}
function bc(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function It(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? bc(n) : null;
  } catch {
    return y && _.error(`Cannot extract url for event ${he(e)}`), null;
  }
}
function Ac(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Ic(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !ue(s.originalException, Error))
    return;
  const i = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  i && (o.exception.values = En(
    e,
    t,
    r,
    s.originalException,
    n,
    o.exception.values,
    i,
    0
  ));
}
function En(e, t, n, r, o, s, i, c) {
  if (s.length >= n + 1)
    return s;
  let u = [...s];
  if (ue(r[o], Error)) {
    no(i, c);
    const l = e(t, r[o]), d = u.length;
    ro(l, o, d, c), u = En(
      e,
      t,
      n,
      r[o],
      o,
      [l, ...u],
      l,
      d
    );
  }
  return Array.isArray(r.errors) && r.errors.forEach((l, d) => {
    if (ue(l, Error)) {
      no(i, c);
      const p = e(t, l), E = u.length;
      ro(p, `errors[${d}]`, E, c), u = En(
        e,
        t,
        n,
        l,
        o,
        [p, ...u],
        p,
        E
      );
    }
  }), u;
}
function no(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function ro(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: "chained",
    source: t,
    exception_id: n,
    parent_id: r
  };
}
function Oc(e) {
  const t = "console";
  Se(t, e), Te(t, Rc);
}
function Rc() {
  "console" in b && xs.forEach(function(e) {
    e in b.console && B(b.console, e, function(t) {
      return bt[e] = t, function(...n) {
        K("console", { args: n, level: e }), bt[e]?.apply(b.console, n);
      };
    });
  });
}
function vc(e) {
  return e === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e) ? e : "log";
}
const Cc = "Dedupe", Nc = () => {
  let e;
  return {
    name: Cc,
    processEvent(t) {
      if (t.type)
        return t;
      try {
        if (Dc(t, e))
          return y && _.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, wc = Nc;
function Dc(e, t) {
  return t ? !!(Lc(e, t) || Mc(e, t)) : !1;
}
function Lc(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !is(e, t) || !ss(e, t));
}
function Mc(e, t) {
  const n = oo(t), r = oo(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !is(e, t) || !ss(e, t));
}
function ss(e, t) {
  let n = _r(e), r = _r(t);
  if (!n && !r)
    return !0;
  if (n && !r || !n && r || (n = n, r = r, r.length !== n.length))
    return !1;
  for (let o = 0; o < r.length; o++) {
    const s = r[o], i = n[o];
    if (s.filename !== i.filename || s.lineno !== i.lineno || s.colno !== i.colno || s.function !== i.function)
      return !1;
  }
  return !0;
}
function is(e, t) {
  let n = e.fingerprint, r = t.fingerprint;
  if (!n && !r)
    return !0;
  if (n && !r || !n && r)
    return !1;
  n = n, r = r;
  try {
    return n.join("") === r.join("");
  } catch {
    return !1;
  }
}
function oo(e) {
  return e.exception?.values?.[0];
}
function as(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const Ve = b;
function kc() {
  return "history" in Ve && !!Ve.history;
}
function xc() {
  if (!("fetch" in Ve))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function yn(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function Pc() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!xc())
    return !1;
  if (yn(Ve.fetch))
    return !0;
  let e = !1;
  const t = Ve.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = yn(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      y && _.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function Fc(e, t) {
  const n = "fetch";
  Se(n, e), Te(n, () => Uc(void 0, t));
}
function Uc(e, t = !1) {
  t && !Pc() || B(b, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: s, url: i } = $c(r), c = {
        args: r,
        fetchData: {
          method: s,
          url: i
        },
        startTimestamp: ie() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: Hc(r)
      };
      return K("fetch", {
        ...c
      }), n.apply(b, r).then(
        async (u) => (K("fetch", {
          ...c,
          endTimestamp: ie() * 1e3,
          response: u
        }), u),
        (u) => {
          if (K("fetch", {
            ...c,
            endTimestamp: ie() * 1e3,
            error: u
          }), Ln(u) && u.stack === void 0 && (u.stack = o.stack, Ee(u, "framesToPop", 1)), u instanceof TypeError && (u.message === "Failed to fetch" || u.message === "Load failed" || u.message === "NetworkError when attempting to fetch resource."))
            try {
              const l = new URL(c.fetchData.url);
              u.message = `${u.message} (${l.host})`;
            } catch {
            }
          throw u;
        }
      );
    };
  });
}
function Sn(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function so(e) {
  return typeof e == "string" ? e : e ? Sn(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function $c(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: so(n),
      method: Sn(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: so(t),
    method: Sn(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function Hc(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (Js(t))
      return new Headers(t.headers);
  } catch {
  }
}
function Bc() {
  return "npm";
}
const L = b;
let Tn = 0;
function cs() {
  return Tn > 0;
}
function Gc() {
  Tn++, setTimeout(() => {
    Tn--;
  });
}
function ke(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (xn(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const s = o.map((i) => ke(i, t));
      return e.apply(this, s);
    } catch (s) {
      throw Gc(), Ei((i) => {
        i.addEventProcessor((c) => (t.mechanism && (dn(c, void 0), De(c, t.mechanism)), c.extra = {
          ...c.extra,
          arguments: o
        }, c)), Da(s);
      }), s;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  Do(r, e), Ee(e, "__sentry_wrapped__", r);
  try {
    Object.getOwnPropertyDescriptor(r, "name").configurable && Object.defineProperty(r, "name", {
      get() {
        return e.name;
      }
    });
  } catch {
  }
  return r;
}
function zc() {
  const e = wo(), { referrer: t } = L.document || {}, { userAgent: n } = L.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function Hn(e, t) {
  const n = Bn(e, t), r = {
    type: Kc(t),
    value: Xc(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function jc(e, t, n, r) {
  const s = $()?.getOptions().normalizeDepth, i = eu(t), c = {
    __serialized__: zo(t, s)
  };
  if (i)
    return {
      exception: {
        values: [Hn(e, i)]
      },
      extra: c
    };
  const u = {
    exception: {
      values: [
        {
          type: wt(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: Jc(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: c
  };
  if (n) {
    const l = Bn(e, n);
    l.length && (u.exception.values[0].stacktrace = { frames: l });
  }
  return u;
}
function en(e, t) {
  return {
    exception: {
      values: [Hn(e, t)]
    }
  };
}
function Bn(e, t) {
  const n = t.stacktrace || t.stack || "", r = Yc(t), o = qc(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const Wc = /Minified React error #\d+;/i;
function Yc(e) {
  return e && Wc.test(e.message) ? 1 : 0;
}
function qc(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function us(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function Kc(e) {
  const t = e?.name;
  return !t && us(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function Xc(e) {
  const t = e?.message;
  return us(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function Vc(e, t, n, r) {
  const o = n?.syntheticException || void 0, s = Gn(e, t, o, r);
  return De(s), s.level = "error", n?.event_id && (s.event_id = n.event_id), Lt(s);
}
function Zc(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0, i = bn(e, t, s, o);
  return i.level = n, r?.event_id && (i.event_id = r.event_id), Lt(i);
}
function Gn(e, t, n, r, o) {
  let s;
  if (vo(t) && t.error)
    return en(e, t.error);
  if (yr(t) || Ks(t)) {
    const i = t;
    if ("stack" in t)
      s = en(e, t);
    else {
      const c = i.name || (yr(i) ? "DOMError" : "DOMException"), u = i.message ? `${c}: ${i.message}` : c;
      s = bn(e, u, n, r), dn(s, u);
    }
    return "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }), s;
  }
  return Ln(t) ? en(e, t) : Ke(t) || wt(t) ? (s = jc(e, t, n, o), De(s, {
    synthetic: !0
  }), s) : (s = bn(e, t, n, r), dn(s, `${t}`), De(s, {
    synthetic: !0
  }), s);
}
function bn(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = Bn(e, n);
    s.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: s } }]
    }), De(o, { synthetic: !0 });
  }
  if (Mn(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return o.logentry = {
      message: s,
      params: i
    }, o;
  }
  return o.message = t, o;
}
function Jc(e, { isUnhandledRejection: t }) {
  const n = ni(e), r = t ? "promise rejection" : "exception";
  return vo(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : wt(e) ? `Event \`${Qc(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function Qc(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function eu(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class tu extends Ka {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = nu(t), r = L.SENTRY_SDK_SOURCE || Bc();
    cc(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: s, enableLogs: i, _experiments: c } = this._options;
    L.document && (s || i || c?.enableMetrics) && L.document.addEventListener("visibilitychange", () => {
      L.document.visibilityState === "hidden" && (s && this._flushOutcomes(), i && Xo(this), c?.enableMetrics && Zo(this));
    }), o && this.on("beforeSendSession", ac);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return Vc(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return Zc(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function nu(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : L.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const ru = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, P = b, ou = 1e3;
let io, An, In;
function su(e) {
  const t = "dom";
  Se(t, e), Te(t, iu);
}
function iu() {
  if (!P.document)
    return;
  const e = K.bind(null, "dom"), t = ao(e, !0);
  P.document.addEventListener("click", t, !1), P.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = P[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (B(o, "addEventListener", function(s) {
      return function(i, c, u) {
        if (i === "click" || i == "keypress")
          try {
            const l = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, d = l[i] = l[i] || { refCount: 0 };
            if (!d.handler) {
              const p = ao(e);
              d.handler = p, s.call(this, i, p, u);
            }
            d.refCount++;
          } catch {
          }
        return s.call(this, i, c, u);
      };
    }), B(
      o,
      "removeEventListener",
      function(s) {
        return function(i, c, u) {
          if (i === "click" || i == "keypress")
            try {
              const l = this.__sentry_instrumentation_handlers__ || {}, d = l[i];
              d && (d.refCount--, d.refCount <= 0 && (s.call(this, i, d.handler, u), d.handler = void 0, delete l[i]), Object.keys(l).length === 0 && delete this.__sentry_instrumentation_handlers__);
            } catch {
            }
          return s.call(this, i, c, u);
        };
      }
    ));
  });
}
function au(e) {
  if (e.type !== An)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== In)
      return !1;
  } catch {
  }
  return !0;
}
function cu(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function ao(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = uu(n);
    if (cu(n.type, r))
      return;
    Ee(n, "_sentryCaptured", !0), r && !r._sentryId && Ee(r, "_sentryId", z());
    const o = n.type === "keypress" ? "input" : n.type;
    au(n) || (e({ event: n, name: o, global: t }), An = n.type, In = r ? r._sentryId : void 0), clearTimeout(io), io = P.setTimeout(() => {
      In = void 0, An = void 0;
    }, ou);
  };
}
function uu(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let ft;
function ls(e) {
  const t = "history";
  Se(t, e), Te(t, lu);
}
function lu() {
  if (P.addEventListener("popstate", () => {
    const t = P.location.href, n = ft;
    if (ft = t, n === t)
      return;
    K("history", { from: n, to: t });
  }), !kc())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = ft, s = fu(String(r));
        if (ft = s, o === s)
          return t.apply(this, n);
        K("history", { from: o, to: s });
      }
      return t.apply(this, n);
    };
  }
  B(P.history, "pushState", e), B(P.history, "replaceState", e);
}
function fu(e) {
  try {
    return new URL(e, P.location.origin).toString();
  } catch {
    return e;
  }
}
const yt = {};
function du(e) {
  const t = yt[e];
  if (t)
    return t;
  let n = P[e];
  if (yn(n))
    return yt[e] = n.bind(P);
  const r = P.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      o.hidden = !0, r.head.appendChild(o);
      const s = o.contentWindow;
      s?.[e] && (n = s[e]), r.head.removeChild(o);
    } catch (o) {
      ru && _.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, o);
    }
  return n && (yt[e] = n.bind(P));
}
function pu(e) {
  yt[e] = void 0;
}
const qe = "__sentry_xhr_v3__";
function mu(e) {
  const t = "xhr";
  Se(t, e), Te(t, hu);
}
function hu() {
  if (!P.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), s = ie() * 1e3, i = se(r[0]) ? r[0].toUpperCase() : void 0, c = gu(r[1]);
      if (!i || !c)
        return t.apply(n, r);
      n[qe] = {
        method: i,
        url: c,
        request_headers: {}
      }, i === "POST" && c.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const u = () => {
        const l = n[qe];
        if (l && n.readyState === 4) {
          try {
            l.status_code = n.status;
          } catch {
          }
          const d = {
            endTimestamp: ie() * 1e3,
            startTimestamp: s,
            xhr: n,
            virtualError: o
          };
          K("xhr", d);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(l, d, p) {
          return u(), l.apply(d, p);
        }
      }) : n.addEventListener("readystatechange", u), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(l, d, p) {
          const [E, m] = p, T = d[qe];
          return T && se(E) && se(m) && (T.request_headers[E.toLowerCase()] = m), l.apply(d, p);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[qe];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const s = {
        startTimestamp: ie() * 1e3,
        xhr: n
      };
      return K("xhr", s), t.apply(n, r);
    }
  });
}
function gu(e) {
  if (se(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function _u(e, t = du("fetch")) {
  let n = 0, r = 0;
  async function o(s) {
    const i = s.body.length;
    n += i, r++;
    const c = {
      body: s.body,
      method: "POST",
      referrerPolicy: "strict-origin",
      headers: e.headers,
      // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
      // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
      // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
      // frequently sending events right before the user is switching pages (eg. when finishing navigation transactions).
      // Gotchas:
      // - `keepalive` isn't supported by Firefox
      // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
      //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
      //   We will therefore only activate the flag when we're below that limit.
      // There is also a limit of requests that can be open at the same time, so we also limit this to 15
      // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
      keepalive: n <= 6e4 && r < 15,
      ...e.fetchOptions
    };
    try {
      const u = await t(e.url, c);
      return {
        statusCode: u.status,
        headers: {
          "x-sentry-rate-limits": u.headers.get("X-Sentry-Rate-Limits"),
          "retry-after": u.headers.get("Retry-After")
        }
      };
    } catch (u) {
      throw pu("fetch"), u;
    } finally {
      n -= i, r--;
    }
  }
  return ic(e, o);
}
const Eu = 30, yu = 50;
function On(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? _e : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const Su = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, Tu = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, bu = /\((\S*)(?::(\d+))(?::(\d+))\)/, Au = /at (.+?) ?\(data:(.+?),/, Iu = (e) => {
  const t = e.match(Au);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = Su.exec(e);
  if (n) {
    const [, o, s, i] = n;
    return On(o, _e, +s, +i);
  }
  const r = Tu.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const c = bu.exec(r[2]);
      c && (r[2] = c[1], r[3] = c[2], r[4] = c[3]);
    }
    const [s, i] = fs(r[1] || _e, r[2]);
    return On(i, s, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, Ou = [Eu, Iu], Ru = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, vu = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, Cu = (e) => {
  const t = Ru.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const s = vu.exec(t[3]);
      s && (t[1] = t[1] || "eval", t[3] = s[1], t[4] = s[2], t[5] = "");
    }
    let r = t[3], o = t[1] || _e;
    return [o, r] = fs(o, r), On(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, Nu = [yu, Cu], wu = [Ou, Nu], Du = Gs(...wu), fs = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : _e,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, zn = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, dt = 1024, Lu = "Breadcrumbs", Mu = (e = {}) => {
  const t = {
    console: !0,
    dom: !0,
    fetch: !0,
    history: !0,
    sentry: !0,
    xhr: !0,
    ...e
  };
  return {
    name: Lu,
    setup(n) {
      t.console && Oc(Fu(n)), t.dom && su(Pu(n, t.dom)), t.xhr && mu(Uu(n)), t.fetch && Fc($u(n)), t.history && ls(Hu(n)), t.sentry && n.on("beforeSendEvent", xu(n));
    }
  };
}, ku = Mu;
function xu(e) {
  return function(n) {
    $() === e && ye(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: he(n)
      },
      {
        event: n
      }
    );
  };
}
function Pu(e, t) {
  return function(r) {
    if ($() !== e)
      return;
    let o, s, i = typeof t == "object" ? t.serializeAttribute : void 0, c = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    c && c > dt && (zn && _.warn(
      `\`dom.maxStringLength\` cannot exceed ${dt}, but a value of ${c} was configured. Sentry will use ${dt} instead.`
    ), c = dt), typeof i == "string" && (i = [i]);
    try {
      const l = r.event, d = Bu(l) ? l.target : l;
      o = No(d, { keyAttrs: i, maxStringLength: c }), s = ti(d);
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0)
      return;
    const u = {
      category: `ui.${r.name}`,
      message: o
    };
    s && (u.data = { "ui.component_name": s }), ye(u, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function Fu(e) {
  return function(n) {
    if ($() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: vc(n.level),
      message: Sr(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${Sr(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    ye(r, {
      input: n.args,
      level: n.level
    });
  };
}
function Uu(e) {
  return function(n) {
    if ($() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, s = n.xhr[qe];
    if (!r || !o || !s)
      return;
    const { method: i, url: c, status_code: u, body: l } = s, d = {
      method: i,
      url: c,
      status_code: u
    }, p = {
      xhr: n.xhr,
      input: l,
      startTimestamp: r,
      endTimestamp: o
    }, E = {
      category: "xhr",
      data: d,
      type: "http",
      level: as(u)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", E, p), ye(E, p);
  };
}
function $u(e) {
  return function(n) {
    if ($() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n;
    if (o && !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === "POST"))
      if (n.fetchData.method, n.fetchData.url, n.error) {
        const s = n.fetchData, i = {
          data: n.error,
          input: n.args,
          startTimestamp: r,
          endTimestamp: o
        }, c = {
          category: "fetch",
          data: s,
          level: "error",
          type: "http"
        };
        e.emit("beforeOutgoingRequestBreadcrumb", c, i), ye(c, i);
      } else {
        const s = n.response, i = {
          ...n.fetchData,
          status_code: s?.status
        };
        n.fetchData.request_body_size, n.fetchData.response_body_size, s?.status;
        const c = {
          input: n.args,
          response: s,
          startTimestamp: r,
          endTimestamp: o
        }, u = {
          category: "fetch",
          data: i,
          type: "http",
          level: as(i.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", u, c), ye(u, c);
      }
  };
}
function Hu(e) {
  return function(n) {
    if ($() !== e)
      return;
    let r = n.from, o = n.to;
    const s = Qt(L.location.href);
    let i = r ? Qt(r) : void 0;
    const c = Qt(o);
    i?.path || (i = s), s.protocol === c.protocol && s.host === c.host && (o = c.relative), s.protocol === i.protocol && s.host === i.host && (r = i.relative), ye({
      category: "navigation",
      data: {
        from: r,
        to: o
      }
    });
  };
}
function Bu(e) {
  return !!e && !!e.target;
}
const Gu = [
  "EventTarget",
  "Window",
  "Node",
  "ApplicationCache",
  "AudioTrackList",
  "BroadcastChannel",
  "ChannelMergerNode",
  "CryptoOperation",
  "EventSource",
  "FileReader",
  "HTMLUnknownElement",
  "IDBDatabase",
  "IDBRequest",
  "IDBTransaction",
  "KeyOperation",
  "MediaController",
  "MessagePort",
  "ModalWindow",
  "Notification",
  "SVGElementInstance",
  "Screen",
  "SharedWorker",
  "TextTrack",
  "TextTrackCue",
  "TextTrackList",
  "WebSocket",
  "WebSocketWorker",
  "Worker",
  "XMLHttpRequest",
  "XMLHttpRequestEventTarget",
  "XMLHttpRequestUpload"
], zu = "BrowserApiErrors", ju = (e = {}) => {
  const t = {
    XMLHttpRequest: !0,
    eventTarget: !0,
    requestAnimationFrame: !0,
    setInterval: !0,
    setTimeout: !0,
    unregisterOriginalCallbacks: !1,
    ...e
  };
  return {
    name: zu,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && B(L, "setTimeout", co), t.setInterval && B(L, "setInterval", co), t.requestAnimationFrame && B(L, "requestAnimationFrame", Yu), t.XMLHttpRequest && "XMLHttpRequest" in L && B(XMLHttpRequest.prototype, "send", qu);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : Gu).forEach((o) => Ku(o, t));
    }
  };
}, Wu = ju;
function co(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = ke(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${ce(e)}`
      }
    }), e.apply(this, t);
  };
}
function Yu(e) {
  return function(t) {
    return e.apply(this, [
      ke(t, {
        mechanism: {
          data: {
            handler: ce(e)
          },
          handled: !1,
          type: "auto.browser.browserapierrors.requestAnimationFrame"
        }
      })
    ]);
  };
}
function qu(e) {
  return function(...t) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
      o in n && typeof n[o] == "function" && B(n, o, function(s) {
        const i = {
          mechanism: {
            data: {
              handler: ce(s)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${o}`
          }
        }, c = xn(s);
        return c && (i.mechanism.data.handler = ce(c)), ke(s, i);
      });
    }), e.apply(this, t);
  };
}
function Ku(e, t) {
  const r = L[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (B(r, "addEventListener", function(o) {
    return function(s, i, c) {
      try {
        Xu(i) && (i.handleEvent = ke(i.handleEvent, {
          mechanism: {
            data: {
              handler: ce(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return t.unregisterOriginalCallbacks && Vu(this, s, i), o.apply(this, [
        s,
        ke(i, {
          mechanism: {
            data: {
              handler: ce(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        c
      ]);
    };
  }), B(r, "removeEventListener", function(o) {
    return function(s, i, c) {
      try {
        const u = i.__sentry_wrapped__;
        u && o.call(this, s, u, c);
      } catch {
      }
      return o.call(this, s, i, c);
    };
  }));
}
function Xu(e) {
  return typeof e.handleEvent == "function";
}
function Vu(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const Zu = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof L.document > "u") {
      zn && _.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    zr({ ignoreDuration: !0 }), jr(), ls(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (zr({ ignoreDuration: !0 }), jr());
    });
  }
}), Ju = "GlobalHandlers", Qu = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: Ju,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (tl(n), uo("onerror")), t.onunhandledrejection && (nl(n), uo("onunhandledrejection"));
    }
  };
}, el = Qu;
function tl(e) {
  js((t) => {
    const { stackParser: n, attachStacktrace: r } = ds();
    if ($() !== e || cs())
      return;
    const { msg: o, url: s, line: i, column: c, error: u } = t, l = sl(
      Gn(n, u || o, void 0, r, !1),
      s,
      i,
      c
    );
    l.level = "error", Wo(l, {
      originalException: u,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function nl(e) {
  Ys((t) => {
    const { stackParser: n, attachStacktrace: r } = ds();
    if ($() !== e || cs())
      return;
    const o = rl(t), s = Nt(o) ? ol(o) : Gn(n, o, void 0, r, !0);
    s.level = "error", Wo(s, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function rl(e) {
  if (Nt(e))
    return e;
  try {
    if ("reason" in e)
      return e.reason;
    if ("detail" in e && "reason" in e.detail)
      return e.detail.reason;
  } catch {
  }
  return e;
}
function ol(e) {
  return {
    exception: {
      values: [
        {
          type: "UnhandledRejection",
          // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
          value: `Non-Error promise rejection captured with value: ${String(e)}`
        }
      ]
    }
  };
}
function sl(e, t, n, r) {
  const o = e.exception = e.exception || {}, s = o.values = o.values || [], i = s[0] = s[0] || {}, c = i.stacktrace = i.stacktrace || {}, u = c.frames = c.frames || [], l = r, d = n, p = il(t) ?? wo();
  return u.length === 0 && u.push({
    colno: l,
    filename: p,
    function: _e,
    in_app: !0,
    lineno: d
  }), e;
}
function uo(e) {
  zn && _.log(`Global Handler attached: ${e}`);
}
function ds() {
  return $()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function il(e) {
  if (!(!se(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const al = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!L.navigator && !L.location && !L.document)
      return;
    const t = zc(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), cl = "cause", ul = 5, ll = "LinkedErrors", fl = (e = {}) => {
  const t = e.limit || ul, n = e.key || cl;
  return {
    name: ll,
    preprocessEvent(r, o, s) {
      const i = s.getOptions();
      Ic(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        Hn,
        i.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, dl = fl;
function pl(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    gc(),
    dc(),
    Wu(),
    ku(),
    el(),
    dl(),
    wc(),
    al(),
    Zu()
  ];
}
const ml = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 }, hl = "https://817f965a1b1055130ff59d97bef82e5f@o4510270313660416.ingest.us.sentry.io/4510294325198848", Ot = () => {
  try {
    const e = ml;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t || n)
        return t || n || "production";
    }
  } catch {
  }
  return "production";
}, gl = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (e) {
    console.warn("[Sentry] Could not read manifest version:", e);
  }
  return "1.0.0";
}, lo = () => {
  const e = Ot();
  return {
    environment: e,
    enableLogs: !0,
    tracesSampleRate: e === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: gl(),
    sendDefaultPii: !1,
    beforeSend(t) {
      if (t.request?.url)
        try {
          const n = new URL(t.request.url);
          n.search = "", t.request.url = n.toString();
        } catch {
        }
      return t;
    },
    beforeSendLog(t) {
      return e === "development" ? t : t.level === "trace" || t.level === "debug" ? null : t;
    }
  };
};
function _l(e) {
  return e.filter((t) => {
    const n = t.name || (typeof t == "function" ? t.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const El = () => {
  const e = Ot();
  return {
    ...lo(),
    tracesSampleRate: e === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(t) {
      const n = lo().beforeSend?.(t) ?? t;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
}, tn = "__V0_SENTRY_CONTENT_INITIALIZED";
let fo = !1, nn = null, rn = null;
function yl() {
  if (globalThis[tn] === !0 && fo && nn && rn)
    return { client: nn, scope: rn };
  globalThis[tn] = !0;
  try {
    const t = El(), n = pl({}), r = _l(n), o = new tu({
      dsn: hl,
      transport: _u,
      stackParser: Du,
      integrations: r,
      ...t
    }), s = new X();
    return s.setClient(o), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([c, u]) => {
      s.setTag(c, u);
    }), o.init(), nn = o, rn = s, fo = !0, Ot() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: o, scope: s };
  } catch (t) {
    return globalThis[tn] = !1, Ot() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", t), { client: null, scope: new X() };
  }
}
const { client: Kl, scope: Xl } = yl(), le = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, Sl = 1e4, Rn = {
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
  START_BREAK: "START_BREAK",
  // Sinalização/diagnóstico
  PING: "PING",
  PONG: "PONG",
  ERROR: "ERROR",
  // Content analysis / other
  CONTENT_ANALYSIS_RESULT: "CONTENT_ANALYSIS_RESULT",
  TOGGLE_ZEN_MODE: "TOGGLE_ZEN_MODE"
};
/*! @license DOMPurify 3.3.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.0/LICENSE */
const {
  entries: ps,
  setPrototypeOf: po,
  isFrozen: Tl,
  getPrototypeOf: bl,
  getOwnPropertyDescriptor: Al
} = Object;
let {
  freeze: F,
  seal: j,
  create: vn
} = Object, {
  apply: Cn,
  construct: Nn
} = typeof Reflect < "u" && Reflect;
F || (F = function(t) {
  return t;
});
j || (j = function(t) {
  return t;
});
Cn || (Cn = function(t, n) {
  for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), s = 2; s < r; s++)
    o[s - 2] = arguments[s];
  return t.apply(n, o);
});
Nn || (Nn = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
    r[o - 1] = arguments[o];
  return new t(...r);
});
const pt = U(Array.prototype.forEach), Il = U(Array.prototype.lastIndexOf), mo = U(Array.prototype.pop), Ge = U(Array.prototype.push), Ol = U(Array.prototype.splice), St = U(String.prototype.toLowerCase), on = U(String.prototype.toString), sn = U(String.prototype.match), ze = U(String.prototype.replace), Rl = U(String.prototype.indexOf), vl = U(String.prototype.trim), q = U(Object.prototype.hasOwnProperty), x = U(RegExp.prototype.test), je = Cl(TypeError);
function U(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
      r[o - 1] = arguments[o];
    return Cn(e, t, r);
  };
}
function Cl(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return Nn(e, n);
  };
}
function S(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : St;
  po && po(e, null);
  let r = t.length;
  for (; r--; ) {
    let o = t[r];
    if (typeof o == "string") {
      const s = n(o);
      s !== o && (Tl(t) || (t[r] = s), o = s);
    }
    e[o] = !0;
  }
  return e;
}
function Nl(e) {
  for (let t = 0; t < e.length; t++)
    q(e, t) || (e[t] = null);
  return e;
}
function re(e) {
  const t = vn(null);
  for (const [n, r] of ps(e))
    q(e, n) && (Array.isArray(r) ? t[n] = Nl(r) : r && typeof r == "object" && r.constructor === Object ? t[n] = re(r) : t[n] = r);
  return t;
}
function We(e, t) {
  for (; e !== null; ) {
    const r = Al(e, t);
    if (r) {
      if (r.get)
        return U(r.get);
      if (typeof r.value == "function")
        return U(r.value);
    }
    e = bl(e);
  }
  function n() {
    return null;
  }
  return n;
}
const ho = F(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), an = F(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), cn = F(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), wl = F(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), un = F(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Dl = F(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), go = F(["#text"]), _o = F(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), ln = F(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Eo = F(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), mt = F(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Ll = j(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Ml = j(/<%[\w\W]*|[\w\W]*%>/gm), kl = j(/\$\{[\w\W]*/gm), xl = j(/^data-[\-\w.\u00B7-\uFFFF]+$/), Pl = j(/^aria-[\-\w]+$/), ms = j(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Fl = j(/^(?:\w+script|data):/i), Ul = j(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), hs = j(/^html$/i), $l = j(/^[a-z][.\w]*(-[.\w]+)+$/i);
var yo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Pl,
  ATTR_WHITESPACE: Ul,
  CUSTOM_ELEMENT: $l,
  DATA_ATTR: xl,
  DOCTYPE_NAME: hs,
  ERB_EXPR: Ml,
  IS_ALLOWED_URI: ms,
  IS_SCRIPT_OR_DATA: Fl,
  MUSTACHE_EXPR: Ll,
  TMPLIT_EXPR: kl
});
const Ye = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, Hl = function() {
  return typeof window > "u" ? null : window;
}, Bl = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let r = null;
  const o = "data-tt-policy-suffix";
  n && n.hasAttribute(o) && (r = n.getAttribute(o));
  const s = "dompurify" + (r ? "#" + r : "");
  try {
    return t.createPolicy(s, {
      createHTML(i) {
        return i;
      },
      createScriptURL(i) {
        return i;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + s + " could not be created."), null;
  }
}, So = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function gs() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Hl();
  const t = (g) => gs(g);
  if (t.version = "3.3.0", t.removed = [], !e || !e.document || e.document.nodeType !== Ye.document || !e.Element)
    return t.isSupported = !1, t;
  let {
    document: n
  } = e;
  const r = n, o = r.currentScript, {
    DocumentFragment: s,
    HTMLTemplateElement: i,
    Node: c,
    Element: u,
    NodeFilter: l,
    NamedNodeMap: d = e.NamedNodeMap || e.MozNamedAttrMap,
    HTMLFormElement: p,
    DOMParser: E,
    trustedTypes: m
  } = e, T = u.prototype, W = We(T, "cloneNode"), I = We(T, "remove"), Y = We(T, "nextSibling"), G = We(T, "childNodes"), V = We(T, "parentNode");
  if (typeof i == "function") {
    const g = n.createElement("template");
    g.content && g.content.ownerDocument && (n = g.content.ownerDocument);
  }
  let v, Q = "";
  const {
    implementation: fe,
    createNodeIterator: Es,
    createDocumentFragment: ys,
    getElementsByTagName: Ss
  } = n, {
    importNode: Ts
  } = r;
  let k = So();
  t.isSupported = typeof ps == "function" && typeof V == "function" && fe && fe.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: Mt,
    ERB_EXPR: kt,
    TMPLIT_EXPR: xt,
    DATA_ATTR: bs,
    ARIA_ATTR: As,
    IS_SCRIPT_OR_DATA: Is,
    ATTR_WHITESPACE: jn,
    CUSTOM_ELEMENT: Os
  } = yo;
  let {
    IS_ALLOWED_URI: Wn
  } = yo, C = null;
  const Yn = S({}, [...ho, ...an, ...cn, ...un, ...go]);
  let w = null;
  const qn = S({}, [..._o, ...ln, ...Eo, ...mt]);
  let O = Object.seal(vn(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), $e = null, Pt = null;
  const be = Object.seal(vn(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let Kn = !0, Ft = !0, Xn = !1, Vn = !0, Ae = !1, nt = !0, de = !1, Ut = !1, $t = !1, Ie = !1, rt = !1, ot = !1, Zn = !0, Jn = !1;
  const Rs = "user-content-";
  let Ht = !0, He = !1, Oe = {}, Re = null;
  const Qn = S({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let er = null;
  const tr = S({}, ["audio", "video", "img", "source", "image", "track"]);
  let Bt = null;
  const nr = S({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), st = "http://www.w3.org/1998/Math/MathML", it = "http://www.w3.org/2000/svg", ee = "http://www.w3.org/1999/xhtml";
  let ve = ee, Gt = !1, zt = null;
  const vs = S({}, [st, it, ee], on);
  let at = S({}, ["mi", "mo", "mn", "ms", "mtext"]), ct = S({}, ["annotation-xml"]);
  const Cs = S({}, ["title", "style", "font", "a", "script"]);
  let Be = null;
  const Ns = ["application/xhtml+xml", "text/html"], ws = "text/html";
  let N = null, Ce = null;
  const Ds = n.createElement("form"), rr = function(a) {
    return a instanceof RegExp || a instanceof Function;
  }, jt = function() {
    let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(Ce && Ce === a)) {
      if ((!a || typeof a != "object") && (a = {}), a = re(a), Be = // eslint-disable-next-line unicorn/prefer-includes
      Ns.indexOf(a.PARSER_MEDIA_TYPE) === -1 ? ws : a.PARSER_MEDIA_TYPE, N = Be === "application/xhtml+xml" ? on : St, C = q(a, "ALLOWED_TAGS") ? S({}, a.ALLOWED_TAGS, N) : Yn, w = q(a, "ALLOWED_ATTR") ? S({}, a.ALLOWED_ATTR, N) : qn, zt = q(a, "ALLOWED_NAMESPACES") ? S({}, a.ALLOWED_NAMESPACES, on) : vs, Bt = q(a, "ADD_URI_SAFE_ATTR") ? S(re(nr), a.ADD_URI_SAFE_ATTR, N) : nr, er = q(a, "ADD_DATA_URI_TAGS") ? S(re(tr), a.ADD_DATA_URI_TAGS, N) : tr, Re = q(a, "FORBID_CONTENTS") ? S({}, a.FORBID_CONTENTS, N) : Qn, $e = q(a, "FORBID_TAGS") ? S({}, a.FORBID_TAGS, N) : re({}), Pt = q(a, "FORBID_ATTR") ? S({}, a.FORBID_ATTR, N) : re({}), Oe = q(a, "USE_PROFILES") ? a.USE_PROFILES : !1, Kn = a.ALLOW_ARIA_ATTR !== !1, Ft = a.ALLOW_DATA_ATTR !== !1, Xn = a.ALLOW_UNKNOWN_PROTOCOLS || !1, Vn = a.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ae = a.SAFE_FOR_TEMPLATES || !1, nt = a.SAFE_FOR_XML !== !1, de = a.WHOLE_DOCUMENT || !1, Ie = a.RETURN_DOM || !1, rt = a.RETURN_DOM_FRAGMENT || !1, ot = a.RETURN_TRUSTED_TYPE || !1, $t = a.FORCE_BODY || !1, Zn = a.SANITIZE_DOM !== !1, Jn = a.SANITIZE_NAMED_PROPS || !1, Ht = a.KEEP_CONTENT !== !1, He = a.IN_PLACE || !1, Wn = a.ALLOWED_URI_REGEXP || ms, ve = a.NAMESPACE || ee, at = a.MATHML_TEXT_INTEGRATION_POINTS || at, ct = a.HTML_INTEGRATION_POINTS || ct, O = a.CUSTOM_ELEMENT_HANDLING || {}, a.CUSTOM_ELEMENT_HANDLING && rr(a.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (O.tagNameCheck = a.CUSTOM_ELEMENT_HANDLING.tagNameCheck), a.CUSTOM_ELEMENT_HANDLING && rr(a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (O.attributeNameCheck = a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), a.CUSTOM_ELEMENT_HANDLING && typeof a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (O.allowCustomizedBuiltInElements = a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), Ae && (Ft = !1), rt && (Ie = !0), Oe && (C = S({}, go), w = [], Oe.html === !0 && (S(C, ho), S(w, _o)), Oe.svg === !0 && (S(C, an), S(w, ln), S(w, mt)), Oe.svgFilters === !0 && (S(C, cn), S(w, ln), S(w, mt)), Oe.mathMl === !0 && (S(C, un), S(w, Eo), S(w, mt))), a.ADD_TAGS && (typeof a.ADD_TAGS == "function" ? be.tagCheck = a.ADD_TAGS : (C === Yn && (C = re(C)), S(C, a.ADD_TAGS, N))), a.ADD_ATTR && (typeof a.ADD_ATTR == "function" ? be.attributeCheck = a.ADD_ATTR : (w === qn && (w = re(w)), S(w, a.ADD_ATTR, N))), a.ADD_URI_SAFE_ATTR && S(Bt, a.ADD_URI_SAFE_ATTR, N), a.FORBID_CONTENTS && (Re === Qn && (Re = re(Re)), S(Re, a.FORBID_CONTENTS, N)), Ht && (C["#text"] = !0), de && S(C, ["html", "head", "body"]), C.table && (S(C, ["tbody"]), delete $e.tbody), a.TRUSTED_TYPES_POLICY) {
        if (typeof a.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw je('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof a.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw je('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        v = a.TRUSTED_TYPES_POLICY, Q = v.createHTML("");
      } else
        v === void 0 && (v = Bl(m, o)), v !== null && typeof Q == "string" && (Q = v.createHTML(""));
      F && F(a), Ce = a;
    }
  }, or = S({}, [...an, ...cn, ...wl]), sr = S({}, [...un, ...Dl]), Ls = function(a) {
    let f = V(a);
    (!f || !f.tagName) && (f = {
      namespaceURI: ve,
      tagName: "template"
    });
    const h = St(a.tagName), A = St(f.tagName);
    return zt[a.namespaceURI] ? a.namespaceURI === it ? f.namespaceURI === ee ? h === "svg" : f.namespaceURI === st ? h === "svg" && (A === "annotation-xml" || at[A]) : !!or[h] : a.namespaceURI === st ? f.namespaceURI === ee ? h === "math" : f.namespaceURI === it ? h === "math" && ct[A] : !!sr[h] : a.namespaceURI === ee ? f.namespaceURI === it && !ct[A] || f.namespaceURI === st && !at[A] ? !1 : !sr[h] && (Cs[h] || !or[h]) : !!(Be === "application/xhtml+xml" && zt[a.namespaceURI]) : !1;
  }, Z = function(a) {
    Ge(t.removed, {
      element: a
    });
    try {
      V(a).removeChild(a);
    } catch {
      I(a);
    }
  }, pe = function(a, f) {
    try {
      Ge(t.removed, {
        attribute: f.getAttributeNode(a),
        from: f
      });
    } catch {
      Ge(t.removed, {
        attribute: null,
        from: f
      });
    }
    if (f.removeAttribute(a), a === "is")
      if (Ie || rt)
        try {
          Z(f);
        } catch {
        }
      else
        try {
          f.setAttribute(a, "");
        } catch {
        }
  }, ir = function(a) {
    let f = null, h = null;
    if ($t)
      a = "<remove></remove>" + a;
    else {
      const R = sn(a, /^[\r\n\t ]+/);
      h = R && R[0];
    }
    Be === "application/xhtml+xml" && ve === ee && (a = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + a + "</body></html>");
    const A = v ? v.createHTML(a) : a;
    if (ve === ee)
      try {
        f = new E().parseFromString(A, Be);
      } catch {
      }
    if (!f || !f.documentElement) {
      f = fe.createDocument(ve, "template", null);
      try {
        f.documentElement.innerHTML = Gt ? Q : A;
      } catch {
      }
    }
    const M = f.body || f.documentElement;
    return a && h && M.insertBefore(n.createTextNode(h), M.childNodes[0] || null), ve === ee ? Ss.call(f, de ? "html" : "body")[0] : de ? f.documentElement : M;
  }, ar = function(a) {
    return Es.call(
      a.ownerDocument || a,
      a,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Wt = function(a) {
    return a instanceof p && (typeof a.nodeName != "string" || typeof a.textContent != "string" || typeof a.removeChild != "function" || !(a.attributes instanceof d) || typeof a.removeAttribute != "function" || typeof a.setAttribute != "function" || typeof a.namespaceURI != "string" || typeof a.insertBefore != "function" || typeof a.hasChildNodes != "function");
  }, cr = function(a) {
    return typeof c == "function" && a instanceof c;
  };
  function te(g, a, f) {
    pt(g, (h) => {
      h.call(t, a, f, Ce);
    });
  }
  const ur = function(a) {
    let f = null;
    if (te(k.beforeSanitizeElements, a, null), Wt(a))
      return Z(a), !0;
    const h = N(a.nodeName);
    if (te(k.uponSanitizeElement, a, {
      tagName: h,
      allowedTags: C
    }), nt && a.hasChildNodes() && !cr(a.firstElementChild) && x(/<[/\w!]/g, a.innerHTML) && x(/<[/\w!]/g, a.textContent) || a.nodeType === Ye.progressingInstruction || nt && a.nodeType === Ye.comment && x(/<[/\w]/g, a.data))
      return Z(a), !0;
    if (!(be.tagCheck instanceof Function && be.tagCheck(h)) && (!C[h] || $e[h])) {
      if (!$e[h] && fr(h) && (O.tagNameCheck instanceof RegExp && x(O.tagNameCheck, h) || O.tagNameCheck instanceof Function && O.tagNameCheck(h)))
        return !1;
      if (Ht && !Re[h]) {
        const A = V(a) || a.parentNode, M = G(a) || a.childNodes;
        if (M && A) {
          const R = M.length;
          for (let H = R - 1; H >= 0; --H) {
            const ne = W(M[H], !0);
            ne.__removalCount = (a.__removalCount || 0) + 1, A.insertBefore(ne, Y(a));
          }
        }
      }
      return Z(a), !0;
    }
    return a instanceof u && !Ls(a) || (h === "noscript" || h === "noembed" || h === "noframes") && x(/<\/no(script|embed|frames)/i, a.innerHTML) ? (Z(a), !0) : (Ae && a.nodeType === Ye.text && (f = a.textContent, pt([Mt, kt, xt], (A) => {
      f = ze(f, A, " ");
    }), a.textContent !== f && (Ge(t.removed, {
      element: a.cloneNode()
    }), a.textContent = f)), te(k.afterSanitizeElements, a, null), !1);
  }, lr = function(a, f, h) {
    if (Zn && (f === "id" || f === "name") && (h in n || h in Ds))
      return !1;
    if (!(Ft && !Pt[f] && x(bs, f))) {
      if (!(Kn && x(As, f))) {
        if (!(be.attributeCheck instanceof Function && be.attributeCheck(f, a))) {
          if (!w[f] || Pt[f]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(fr(a) && (O.tagNameCheck instanceof RegExp && x(O.tagNameCheck, a) || O.tagNameCheck instanceof Function && O.tagNameCheck(a)) && (O.attributeNameCheck instanceof RegExp && x(O.attributeNameCheck, f) || O.attributeNameCheck instanceof Function && O.attributeNameCheck(f, a)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              f === "is" && O.allowCustomizedBuiltInElements && (O.tagNameCheck instanceof RegExp && x(O.tagNameCheck, h) || O.tagNameCheck instanceof Function && O.tagNameCheck(h)))
            ) return !1;
          } else if (!Bt[f]) {
            if (!x(Wn, ze(h, jn, ""))) {
              if (!((f === "src" || f === "xlink:href" || f === "href") && a !== "script" && Rl(h, "data:") === 0 && er[a])) {
                if (!(Xn && !x(Is, ze(h, jn, "")))) {
                  if (h)
                    return !1;
                }
              }
            }
          }
        }
      }
    }
    return !0;
  }, fr = function(a) {
    return a !== "annotation-xml" && sn(a, Os);
  }, dr = function(a) {
    te(k.beforeSanitizeAttributes, a, null);
    const {
      attributes: f
    } = a;
    if (!f || Wt(a))
      return;
    const h = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: w,
      forceKeepAttr: void 0
    };
    let A = f.length;
    for (; A--; ) {
      const M = f[A], {
        name: R,
        namespaceURI: H,
        value: ne
      } = M, Ne = N(R), Yt = ne;
      let D = R === "value" ? Yt : vl(Yt);
      if (h.attrName = Ne, h.attrValue = D, h.keepAttr = !0, h.forceKeepAttr = void 0, te(k.uponSanitizeAttribute, a, h), D = h.attrValue, Jn && (Ne === "id" || Ne === "name") && (pe(R, a), D = Rs + D), nt && x(/((--!?|])>)|<\/(style|title|textarea)/i, D)) {
        pe(R, a);
        continue;
      }
      if (Ne === "attributename" && sn(D, "href")) {
        pe(R, a);
        continue;
      }
      if (h.forceKeepAttr)
        continue;
      if (!h.keepAttr) {
        pe(R, a);
        continue;
      }
      if (!Vn && x(/\/>/i, D)) {
        pe(R, a);
        continue;
      }
      Ae && pt([Mt, kt, xt], (mr) => {
        D = ze(D, mr, " ");
      });
      const pr = N(a.nodeName);
      if (!lr(pr, Ne, D)) {
        pe(R, a);
        continue;
      }
      if (v && typeof m == "object" && typeof m.getAttributeType == "function" && !H)
        switch (m.getAttributeType(pr, Ne)) {
          case "TrustedHTML": {
            D = v.createHTML(D);
            break;
          }
          case "TrustedScriptURL": {
            D = v.createScriptURL(D);
            break;
          }
        }
      if (D !== Yt)
        try {
          H ? a.setAttributeNS(H, R, D) : a.setAttribute(R, D), Wt(a) ? Z(a) : mo(t.removed);
        } catch {
          pe(R, a);
        }
    }
    te(k.afterSanitizeAttributes, a, null);
  }, Ms = function g(a) {
    let f = null;
    const h = ar(a);
    for (te(k.beforeSanitizeShadowDOM, a, null); f = h.nextNode(); )
      te(k.uponSanitizeShadowNode, f, null), ur(f), dr(f), f.content instanceof s && g(f.content);
    te(k.afterSanitizeShadowDOM, a, null);
  };
  return t.sanitize = function(g) {
    let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, f = null, h = null, A = null, M = null;
    if (Gt = !g, Gt && (g = "<!-->"), typeof g != "string" && !cr(g))
      if (typeof g.toString == "function") {
        if (g = g.toString(), typeof g != "string")
          throw je("dirty is not a string, aborting");
      } else
        throw je("toString is not a function");
    if (!t.isSupported)
      return g;
    if (Ut || jt(a), t.removed = [], typeof g == "string" && (He = !1), He) {
      if (g.nodeName) {
        const ne = N(g.nodeName);
        if (!C[ne] || $e[ne])
          throw je("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (g instanceof c)
      f = ir("<!---->"), h = f.ownerDocument.importNode(g, !0), h.nodeType === Ye.element && h.nodeName === "BODY" || h.nodeName === "HTML" ? f = h : f.appendChild(h);
    else {
      if (!Ie && !Ae && !de && // eslint-disable-next-line unicorn/prefer-includes
      g.indexOf("<") === -1)
        return v && ot ? v.createHTML(g) : g;
      if (f = ir(g), !f)
        return Ie ? null : ot ? Q : "";
    }
    f && $t && Z(f.firstChild);
    const R = ar(He ? g : f);
    for (; A = R.nextNode(); )
      ur(A), dr(A), A.content instanceof s && Ms(A.content);
    if (He)
      return g;
    if (Ie) {
      if (rt)
        for (M = ys.call(f.ownerDocument); f.firstChild; )
          M.appendChild(f.firstChild);
      else
        M = f;
      return (w.shadowroot || w.shadowrootmode) && (M = Ts.call(r, M, !0)), M;
    }
    let H = de ? f.outerHTML : f.innerHTML;
    return de && C["!doctype"] && f.ownerDocument && f.ownerDocument.doctype && f.ownerDocument.doctype.name && x(hs, f.ownerDocument.doctype.name) && (H = "<!DOCTYPE " + f.ownerDocument.doctype.name + `>
` + H), Ae && pt([Mt, kt, xt], (ne) => {
      H = ze(H, ne, " ");
    }), v && ot ? v.createHTML(H) : H;
  }, t.setConfig = function() {
    let g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    jt(g), Ut = !0;
  }, t.clearConfig = function() {
    Ce = null, Ut = !1;
  }, t.isValidAttribute = function(g, a, f) {
    Ce || jt({});
    const h = N(g), A = N(a);
    return lr(h, A, f);
  }, t.addHook = function(g, a) {
    typeof a == "function" && Ge(k[g], a);
  }, t.removeHook = function(g, a) {
    if (a !== void 0) {
      const f = Il(k[g], a);
      return f === -1 ? void 0 : Ol(k[g], f, 1)[0];
    }
    return mo(k[g]);
  }, t.removeHooks = function(g) {
    k[g] = [];
  }, t.removeAllHooks = function() {
    k = So();
  }, t;
}
var Gl = gs();
const ht = {
  hideHomepage: [
    "ytd-rich-grid-renderer",
    // Main video grid
    'ytd-browse[page-subtype="home"]',
    // Home container
    "#contents.ytd-rich-grid-renderer"
    // Grid contents
  ],
  hideShorts: [
    "ytd-reel-shelf-renderer",
    // Shorts shelf on home
    "ytd-shorts",
    // Shorts player
    "ytd-rich-shelf-renderer[is-shorts]",
    // Shorts shelf
    "[is-shorts]",
    // Any shorts element
    'a[href^="/shorts/"]'
    // Shorts links
  ],
  hideComments: [
    "#comments",
    // Main comments container
    "ytd-comments",
    // Comments component
    "#comment-teaser"
    // Comment teaser
  ],
  hideRecommendations: [
    "#secondary",
    // Main sidebar
    "#related",
    // Related videos
    "ytd-watch-next-secondary-results-renderer"
    // Modern renderer
  ]
};
window.v0ContentScriptInjected = !0;
console.log("[v0][CS] Content script loaded");
(async function() {
  try {
    const t = location.hostname, { [le.BLACKLIST]: n } = await chrome.storage.local.get(le.BLACKLIST);
    if (n && Array.isArray(n) && n.some((o) => {
      const s = typeof o == "string" ? o : o.domain;
      return t === s || t.endsWith("." + s);
    })) {
      console.log("[v0][CS] Blocked domain loaded from cache, redirecting...");
      const o = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(t)}`);
      location.href = o;
      return;
    }
  } catch (t) {
    console.error("[v0][CS] Failed to check blocked domain:", t);
  }
})();
let To = !1;
chrome.runtime.onMessage.addListener((e, t, n) => {
  try {
    if (e?.type === Rn.TOGGLE_ZEN_MODE)
      return jl(e.payload?.preset), n?.({ success: !0 }), !0;
    if (e?.type === Rn.SITE_CUSTOMIZATION_UPDATED) {
      const r = e.payload;
      if (r?.domain === "youtube.com" && window.location.hostname.includes("youtube.com"))
        return _s(r.config), n?.({ success: !0 }), !0;
    }
  } catch (r) {
    console.warn("[v0][CS] Message handler failed:", r), n?.({ success: !1, error: String(r) });
  }
  return !1;
});
const bo = async () => {
  if (!To) {
    To = !0;
    try {
      const e = document.body?.innerText?.slice(0, Sl) ?? "", t = location.href, n = await zl(e, t), r = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: Rn.CONTENT_ANALYSIS_RESULT, id: r, source: "content-script", ts: Date.now(), payload: { result: n } }, (o) => {
        const s = chrome.runtime.lastError;
        s && !s.message.includes("Receiving end does not exist") && !s.message.includes("message channel closed") && console.warn("[v0][CS] Content analysis message error:", s.message);
      });
    } catch (e) {
      console.error("[v0][CS] analyzePageContent error:", e);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? bo() : document.addEventListener("DOMContentLoaded", bo, { once: !0 });
window.location.hostname.includes("youtube.com") && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => Ao(), { once: !0 }) : Ao());
async function zl(e, t) {
  const { [le.SETTINGS]: n } = await chrome.storage.sync.get(le.SETTINGS), r = n?.productiveKeywords || [], o = n?.distractingKeywords || [], s = e.toLowerCase();
  t.toLowerCase();
  const i = document.title.toLowerCase(), c = document.querySelector('meta[name="description"]')?.getAttribute("content")?.toLowerCase() || "", u = `${s} ${i} ${c}`;
  let l = 0, d = 0;
  const p = (Y) => Y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((Y) => {
    const G = new RegExp(`\\b${p(Y)}\\b`, "gi"), V = u.match(G);
    if (V) {
      const v = V.length, Q = i.match(G)?.length || 0, fe = c.match(G)?.length || 0;
      l += v + Q * 2 + fe * 1.5;
    }
  }), o.forEach((Y) => {
    const G = new RegExp(`\\b${p(Y)}\\b`, "gi"), V = u.match(G);
    if (V) {
      const v = V.length, Q = i.match(G)?.length || 0, fe = c.match(G)?.length || 0;
      d += v + Q * 2 + fe * 1.5;
    }
  });
  const E = l + d, m = E > 0 ? d / E : 0, T = u.length, W = E / Math.max(T / 1e3, 1);
  let I = "neutral";
  return m > 0.6 && W > 0.5 ? I = "distracting" : m < 0.4 && l > 0 && W > 0.3 && (I = "productive"), {
    url: t,
    classification: I,
    score: m,
    categories: {
      productiveScore: l,
      distractingScore: d,
      keywordDensity: W,
      textLength: T
    },
    flagged: I === "distracting"
  };
}
function _s(e) {
  const t = [];
  e.hideHomepage && t.push(...ht.hideHomepage), e.hideShorts && t.push(...ht.hideShorts), e.hideComments && t.push(...ht.hideComments), e.hideRecommendations && t.push(...ht.hideRecommendations);
  const n = document.getElementById("v0-youtube-customization");
  if (n && n.remove(), t.length > 0) {
    const r = document.createElement("style");
    r.id = "v0-youtube-customization", r.textContent = t.map((o) => `${o} { display: none !important; }`).join(`
`), document.head.appendChild(r);
  }
}
async function Ao() {
  if (window.location.hostname.includes("youtube.com"))
    try {
      const { [le.SITE_CUSTOMIZATIONS]: e } = await chrome.storage.local.get(le.SITE_CUSTOMIZATIONS), t = e?.["youtube.com"];
      t && (_s(t), console.log("[v0][CS] YouTube customization applied:", t));
    } catch (e) {
      console.error("[v0][CS] Failed to load YouTube customization:", e);
    }
}
let fn = !1, we = null, Tt = "", J = null;
function jl(e) {
  if (fn) {
    const t = document.getElementById("zen-mode-styles");
    t && t.remove(), document.body.classList.remove("zen-mode"), window.location.hostname.includes("youtube.com") || (we !== null && (document.body.innerHTML = "", document.body.appendChild(we.cloneNode(!0)), document.body.style.background = Tt, we = null, Tt = ""), J && (J.remove(), J = null)), fn = !1, console.log("[v0][CS] Zen Mode deactivated");
  } else {
    const t = document.createDocumentFragment();
    for (; document.body.firstChild; )
      t.appendChild(document.body.firstChild);
    we = t, Tt = document.body.style.background || "", Wl(e), fn = !0, console.log("[v0][CS] Zen Mode activated");
  }
}
function Wl(e) {
  try {
    e && ql(e);
    const t = document.createElement("style");
    if (t.id = "zen-mode-styles", t.textContent = `
      /* YouTube-specific Zen Mode styles */
      #secondary, #related, #comments, #sections, #chips, 
      #masthead-container, #player-ads, #merch-shelf,
      #engagement-panel, #watch-discussion, #watch-description,
      #watch7-sidebar-contents, #watch7-sidebar-modules,
      ytd-reel-shelf-renderer, ytd-shorts, ytd-compact-video-renderer,
      ytd-video-secondary-info-renderer, ytd-video-primary-info-renderer,
      #dismissible, #dismissed, #dismissed-content,
      ytd-item-section-renderer, ytd-shelf-renderer,
      #contents > ytd-rich-item-renderer:not(:first-child),
      #contents > ytd-video-renderer:not(:first-child),
      #contents > ytd-compact-video-renderer:not(:first-child) {
        display: none !important;
      }
      
      /* Focus on main content */
      #primary {
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 20px !important;
      }
      
      /* Clean up video player area */
      #player {
        margin: 0 auto !important;
        max-width: 1200px !important;
      }
      
      /* Hide distracting elements */
      .ytd-video-primary-info-renderer #above-the-fold,
      .ytd-video-primary-info-renderer #below,
      .ytd-video-primary-info-renderer #secondary,
      .ytd-video-primary-info-renderer #related,
      .ytd-video-primary-info-renderer #comments {
        display: none !important;
      }
      
      /* General Zen Mode styles for other sites */
      .zen-mode-hidden {
        display: none !important;
      }
      
      /* Focus mode styles */
      body.zen-mode {
        background: #f5f5f5 !important;
        font-family: Georgia, serif !important;
        line-height: 1.6 !important;
      }
      
      .zen-mode #zen-mode-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
    `, document.head.appendChild(t), document.body.classList.add("zen-mode"), !window.location.hostname.includes("youtube.com")) {
      const n = Yl();
      if (J && J.remove(), J = document.createElement("div"), J.id = "zen-mode-container", n.trim())
        if (!/<[^>]*>/g.test(n))
          J.textContent = n;
        else {
          const o = Gl.sanitize(n, {
            // Only allow safe protocols
            ALLOWED_URI_REGEXP: /^(https?:|mailto:|data:image\/)/i,
            // Forbid dangerous tags
            FORBID_TAGS: ["base", "meta", "link", "script", "iframe", "object", "embed", "form", "input", "button"],
            // Forbid dangerous attributes
            FORBID_ATTR: ["style", "formaction", "action", "srcdoc", "onload", "onerror", "onclick", "onmouseover"],
            // Additional security measures
            ALLOW_DATA_ATTR: !1,
            ALLOW_UNKNOWN_PROTOCOLS: !1,
            SANITIZE_DOM: !0,
            KEEP_CONTENT: !0,
            RETURN_DOM: !1,
            RETURN_DOM_FRAGMENT: !1,
            RETURN_DOM_IMPORT: !1
          });
          J.innerHTML = o;
        }
      document.body.appendChild(J);
    }
  } catch (t) {
    throw console.error("[v0][CS] Error applying Zen Mode:", t), we !== null && (document.body.innerHTML = "", document.body.appendChild(we.cloneNode(!0)), document.body.style.background = Tt), t;
  }
}
function Yl() {
  if (window.location.hostname.includes("youtube.com")) {
    const r = document.querySelector("#primary #contents") || document.querySelector("#primary") || document.querySelector("#contents");
    if (r) return r.innerHTML;
  }
  const e = document.querySelector("article"), t = document.querySelector("main"), n = document.querySelector('[role="main"]');
  return e ? e.innerHTML : t ? t.innerHTML : n ? n.innerHTML : document.body.innerHTML;
}
async function ql(e) {
  try {
    const { [le.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(
      le.SITE_CUSTOMIZATIONS
    ), n = t?.[e];
    n?.selectorsToRemove && n.selectorsToRemove.forEach((r) => {
      document.querySelectorAll(r).forEach((o) => o.remove());
    });
  } catch (t) {
    console.warn("[v0][CS] applyPreset failed:", t);
  }
}
