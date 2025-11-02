const Pc = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = Pc;
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
const _ = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, v = globalThis, et = "10.22.0";
function at() {
  return Un(v), v;
}
function Un(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || et, t[et] = t[et] || {};
}
function vt(e, t, n = v) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[et] = r[et] || {};
  return o[e] || (o[e] = t());
}
const ci = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], Mc = "Sentry Logger ", In = {};
function qt(e) {
  if (!("console" in v))
    return e();
  const t = v.console, n = {}, r = Object.keys(In);
  r.forEach((o) => {
    const s = In[o];
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
function Lc() {
  Qr().enabled = !0;
}
function xc() {
  Qr().enabled = !1;
}
function ui() {
  return Qr().enabled;
}
function Uc(...e) {
  Zr("log", ...e);
}
function $c(...e) {
  Zr("warn", ...e);
}
function Bc(...e) {
  Zr("error", ...e);
}
function Zr(e, ...t) {
  _ && ui() && qt(() => {
    v.console[e](`${Mc}[${e}]:`, ...t);
  });
}
function Qr() {
  return _ ? vt("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const h = {
  /** Enable logging. */
  enable: Lc,
  /** Disable logging. */
  disable: xc,
  /** Check if logging is enabled. */
  isEnabled: ui,
  /** Log a message. */
  log: Uc,
  /** Log a warning. */
  warn: $c,
  /** Log an error. */
  error: Bc
}, li = 50, ot = "?", qo = /\(error: (.*)\)/, zo = /captureMessage|captureException/;
function Fc(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const s = [], i = n.split(`
`);
    for (let a = r; a < i.length; a++) {
      let c = i[a];
      c.length > 1024 && (c = c.slice(0, 1024));
      const u = qo.test(c) ? c.replace(qo, "$1") : c;
      if (!u.match(/\S*Error: /)) {
        for (const l of t) {
          const d = l(u);
          if (d) {
            s.push(d);
            break;
          }
        }
        if (s.length >= li + o)
          break;
      }
    }
    return Gc(s.slice(o));
  };
}
function Gc(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(on(t).function || "") && t.pop(), t.reverse(), zo.test(on(t).function || "") && (t.pop(), zo.test(on(t).function || "") && t.pop()), t.slice(0, li).map((n) => ({
    ...n,
    filename: n.filename || on(t).filename,
    function: n.function || ot
  }));
}
function on(e) {
  return e[e.length - 1] || {};
}
const rr = "<anonymous>";
function Re(e) {
  try {
    return !e || typeof e != "function" ? rr : e.name || rr;
  } catch {
    return rr;
  }
}
function Wo(e) {
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
const pn = {}, Yo = {};
function He(e, t) {
  pn[e] = pn[e] || [], pn[e].push(t);
}
function je(e, t) {
  if (!Yo[e]) {
    Yo[e] = !0;
    try {
      t();
    } catch (n) {
      _ && h.error(`Error while instrumenting ${e}`, n);
    }
  }
}
function ae(e, t) {
  const n = e && pn[e];
  if (n)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        _ && h.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${Re(r)}
Error:`,
          o
        );
      }
}
let or = null;
function di(e) {
  const t = "error";
  He(t, e), je(t, Hc);
}
function Hc() {
  or = v.onerror, v.onerror = function(e, t, n, r, o) {
    return ae("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), or ? or.apply(this, arguments) : !1;
  }, v.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let sr = null;
function fi(e) {
  const t = "unhandledrejection";
  He(t, e), je(t, jc);
}
function jc() {
  sr = v.onunhandledrejection, v.onunhandledrejection = function(e) {
    return ae("unhandledrejection", e), sr ? sr.apply(this, arguments) : !0;
  }, v.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const pi = Object.prototype.toString;
function $n(e) {
  switch (pi.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return we(e, Error);
  }
}
function It(e, t) {
  return pi.call(e) === `[object ${t}]`;
}
function mi(e) {
  return It(e, "ErrorEvent");
}
function Ko(e) {
  return It(e, "DOMError");
}
function qc(e) {
  return It(e, "DOMException");
}
function ve(e) {
  return It(e, "String");
}
function Bn(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function st(e) {
  return e === null || Bn(e) || typeof e != "object" && typeof e != "function";
}
function xt(e) {
  return It(e, "Object");
}
function Fn(e) {
  return typeof Event < "u" && we(e, Event);
}
function zc(e) {
  return typeof Element < "u" && we(e, Element);
}
function Wc(e) {
  return It(e, "RegExp");
}
function Rt(e) {
  return !!(e?.then && typeof e.then == "function");
}
function Yc(e) {
  return xt(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function we(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function gi(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function hi(e) {
  return typeof Request < "u" && we(e, Request);
}
const eo = v, Kc = 80;
function _e(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let s = 0, i = 0;
    const a = " > ", c = a.length;
    let u;
    const l = Array.isArray(t) ? t : t.keyAttrs, d = !Array.isArray(t) && t.maxStringLength || Kc;
    for (; n && s++ < r && (u = Vc(n, l), !(u === "html" || s > 1 && i + o.length * c + u.length >= d)); )
      o.push(u), i += u.length, n = n.parentNode;
    return o.reverse().join(a);
  } catch {
    return "<unknown>";
  }
}
function Vc(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if (eo.HTMLElement && n instanceof HTMLElement && n.dataset) {
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
    if (i && ve(i)) {
      const a = i.split(/\s+/);
      for (const c of a)
        r.push(`.${c}`);
    }
  }
  const s = ["aria-label", "type", "name", "title", "alt"];
  for (const i of s) {
    const a = n.getAttribute(i);
    a && r.push(`[${i}="${a}"]`);
  }
  return r.join("");
}
function Gn() {
  try {
    return eo.document.location.href;
  } catch {
    return "";
  }
}
function _i(e) {
  if (!eo.HTMLElement)
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
function Rn(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function Vo(e, t) {
  if (!Array.isArray(e))
    return "";
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    try {
      gi(o) ? n.push("[VueViewModel]") : n.push(String(o));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(t);
}
function mn(e, t, n = !1) {
  return ve(e) ? Wc(t) ? t.test(e) : ve(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function Be(e, t = [], n = !1) {
  return t.some((r) => mn(e, r, n));
}
function ne(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && yi(o, r);
  try {
    e[t] = o;
  } catch {
    _ && h.log(`Failed to replace method "${t}" in object`, e);
  }
}
function re(e, t, n) {
  try {
    Object.defineProperty(e, t, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: n,
      writable: !0,
      configurable: !0
    });
  } catch {
    _ && h.log(`Failed to add non-enumerable property "${t}" to object`, e);
  }
}
function yi(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, re(e, "__sentry_original__", t);
  } catch {
  }
}
function to(e) {
  return e.__sentry_original__;
}
function Si(e) {
  if ($n(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...Xo(e)
    };
  if (Fn(e)) {
    const t = {
      type: e.type,
      target: Jo(e.target),
      currentTarget: Jo(e.currentTarget),
      ...Xo(e)
    };
    return typeof CustomEvent < "u" && we(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function Jo(e) {
  try {
    return zc(e) ? _e(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function Xo(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function Jc(e, t = 40) {
  const n = Object.keys(Si(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return Rn(r, t);
  for (let o = n.length; o > 0; o--) {
    const s = n.slice(0, o).join(", ");
    if (!(s.length > t))
      return o === n.length ? s : Rn(s, t);
  }
  return "";
}
function Xc() {
  const e = v;
  return e.crypto || e.msCrypto;
}
let ir;
function Zc() {
  return Math.random() * 16;
}
function ce(e = Xc()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return ir || (ir = "10000000100040008000" + 1e11), ir.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (Zc() & 15) >> t / 4).toString(16)
    )
  );
}
function Ei(e) {
  return e.exception?.values?.[0];
}
function Ze(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = Ei(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function Dr(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], s = o[0] = o[0] || {};
  s.value || (s.value = t || ""), s.type || (s.type = "Error");
}
function _t(e, t) {
  const n = Ei(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const s = { ...o?.data, ...t.data };
    n.mechanism.data = s;
  }
}
function Zo(e) {
  if (Qc(e))
    return !0;
  try {
    re(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function Qc(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const Ti = 1e3;
function ct() {
  return Date.now() / Ti;
}
function eu() {
  const { performance: e } = v;
  if (!e?.now || !e.timeOrigin)
    return ct;
  const t = e.timeOrigin;
  return () => (t + e.now()) / Ti;
}
let Qo;
function x() {
  return (Qo ?? (Qo = eu()))();
}
let ar;
function tu() {
  const { performance: e } = v;
  if (!e?.now)
    return [void 0, "none"];
  const t = 3600 * 1e3, n = e.now(), r = Date.now(), o = e.timeOrigin ? Math.abs(e.timeOrigin + n - r) : t, s = o < t, i = e.timing?.navigationStart, c = typeof i == "number" ? Math.abs(i + n - r) : t, u = c < t;
  return s || u ? o <= c ? [e.timeOrigin, "timeOrigin"] : [i, "navigationStart"] : [r, "dateNow"];
}
function se() {
  return ar || (ar = tu()), ar[0];
}
function nu(e) {
  const t = x(), n = {
    sid: ce(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => ou(n)
  };
  return e && yt(n, e), n;
}
function yt(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || x(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : ce()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function ru(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), yt(e, n);
}
function ou(e) {
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
function zt(e, t, n = 2) {
  if (!t || typeof t != "object" || n <= 0)
    return t;
  if (e && Object.keys(t).length === 0)
    return e;
  const r = { ...e };
  for (const o in t)
    Object.prototype.hasOwnProperty.call(t, o) && (r[o] = zt(r[o], t[o], n - 1));
  return r;
}
function Ae() {
  return ce();
}
function Ie() {
  return ce().substring(16);
}
const Nr = "_sentrySpan";
function St(e, t) {
  t ? re(e, Nr, t) : delete e[Nr];
}
function Ut(e) {
  return e[Nr];
}
const su = 100;
class F {
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
      traceId: Ae(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const t = new F();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, St(t, Ut(this)), t;
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
    }, this._session && yt(this._session, { user: t }), this._notifyScopeListeners(), this;
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
    const n = typeof t == "function" ? t(this) : t, r = n instanceof F ? n.getScopeData() : xt(n) ? t : void 0, { tags: o, extra: s, user: i, contexts: a, level: c, fingerprint: u = [], propagationContext: l } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...s }, this._contexts = { ...this._contexts, ...a }, i && Object.keys(i).length && (this._user = i), c && (this._level = c), u.length && (this._fingerprint = u), l && (this._propagationContext = l), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, St(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: Ae(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : su;
    if (r <= 0)
      return this;
    const o = {
      timestamp: ct(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? Rn(t.message, 2048) : t.message
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
      span: Ut(this)
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(t) {
    return this._sdkProcessingMetadata = zt(this._sdkProcessingMetadata, t, 2), this;
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
    const r = n?.event_id || ce();
    if (!this._client)
      return _ && h.warn("No client configured on scope - will not capture exception!"), r;
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
    const o = r?.event_id || ce();
    if (!this._client)
      return _ && h.warn("No client configured on scope - will not capture message!"), o;
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
    const r = n?.event_id || ce();
    return this._client ? (this._client.captureEvent(t, { ...n, event_id: r }, this), r) : (_ && h.warn("No client configured on scope - will not capture event!"), r);
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
function iu() {
  return vt("defaultCurrentScope", () => new F());
}
function au() {
  return vt("defaultIsolationScope", () => new F());
}
class cu {
  constructor(t, n) {
    let r;
    t ? r = t : r = new F();
    let o;
    n ? o = n : o = new F(), this._stack = [{ scope: r }], this._isolationScope = o;
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
    return Rt(r) ? r.then(
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
function Et() {
  const e = at(), t = Un(e);
  return t.stack = t.stack || new cu(iu(), au());
}
function uu(e) {
  return Et().withScope(e);
}
function lu(e, t) {
  const n = Et();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function es(e) {
  return Et().withScope(() => e(Et().getIsolationScope()));
}
function du() {
  return {
    withIsolationScope: es,
    withScope: uu,
    withSetScope: lu,
    withSetIsolationScope: (e, t) => es(t),
    getCurrentScope: () => Et().getScope(),
    getIsolationScope: () => Et().getIsolationScope()
  };
}
function wt(e) {
  const t = Un(e);
  return t.acs ? t.acs : du();
}
function D() {
  const e = at();
  return wt(e).getCurrentScope();
}
function Ne() {
  const e = at();
  return wt(e).getIsolationScope();
}
function bi() {
  return vt("globalScope", () => new F());
}
function ut(...e) {
  const t = at(), n = wt(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function w() {
  return D().getClient();
}
function vi(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, s = {
    trace_id: n,
    span_id: o || Ie()
  };
  return r && (s.parent_span_id = r), s;
}
const he = "sentry.source", no = "sentry.sample_rate", Ii = "sentry.previous_trace_sample_rate", Oe = "sentry.op", C = "sentry.origin", $t = "sentry.idle_span_finish_reason", Wt = "sentry.measurement_unit", Yt = "sentry.measurement_value", ts = "sentry.custom_span_name", ro = "sentry.profile_id", At = "sentry.exclusive_time", fu = "sentry.link.type", pu = 0, Ri = 1, L = 2;
function mu(e) {
  if (e < 400 && e >= 100)
    return { code: Ri };
  if (e >= 400 && e < 500)
    switch (e) {
      case 401:
        return { code: L, message: "unauthenticated" };
      case 403:
        return { code: L, message: "permission_denied" };
      case 404:
        return { code: L, message: "not_found" };
      case 409:
        return { code: L, message: "already_exists" };
      case 413:
        return { code: L, message: "failed_precondition" };
      case 429:
        return { code: L, message: "resource_exhausted" };
      case 499:
        return { code: L, message: "cancelled" };
      default:
        return { code: L, message: "invalid_argument" };
    }
  if (e >= 500 && e < 600)
    switch (e) {
      case 501:
        return { code: L, message: "unimplemented" };
      case 503:
        return { code: L, message: "unavailable" };
      case 504:
        return { code: L, message: "deadline_exceeded" };
      default:
        return { code: L, message: "internal_error" };
    }
  return { code: L, message: "unknown_error" };
}
function wi(e, t) {
  e.setAttribute("http.response.status_code", t);
  const n = mu(t);
  n.message !== "unknown_error" && e.setStatus(n);
}
const Ai = "_sentryScope", Oi = "_sentryIsolationScope";
function gu(e) {
  try {
    const t = v.WeakRef;
    if (typeof t == "function")
      return new t(e);
  } catch {
  }
  return e;
}
function hu(e) {
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
function _u(e, t, n) {
  e && (re(e, Oi, gu(n)), re(e, Ai, t));
}
function wn(e) {
  const t = e;
  return {
    scope: t[Ai],
    isolationScope: hu(t[Oi])
  };
}
const oo = "sentry-", yu = /^sentry-/, Su = 8192;
function Di(e) {
  const t = Tu(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, s]) => {
    if (o.match(yu)) {
      const i = o.slice(oo.length);
      r[i] = s;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function Eu(e) {
  if (!e)
    return;
  const t = Object.entries(e).reduce(
    (n, [r, o]) => (o && (n[`${oo}${r}`] = o), n),
    {}
  );
  return bu(t);
}
function Tu(e) {
  if (!(!e || !ve(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = ns(n);
      return Object.entries(r).forEach(([o, s]) => {
        t[o] = s;
      }), t;
    }, {}) : ns(e);
}
function ns(e) {
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
function bu(e) {
  if (Object.keys(e).length !== 0)
    return Object.entries(e).reduce((t, [n, r], o) => {
      const s = `${encodeURIComponent(n)}=${encodeURIComponent(r)}`, i = o === 0 ? s : `${t},${s}`;
      return i.length > Su ? (_ && h.warn(
        `Not adding key: ${n} with val: ${r} to baggage header due to exceeding baggage size limits.`
      ), t) : i;
    }, "");
}
const vu = /^o(\d+)\./, Iu = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Ru(e) {
  return e === "http" || e === "https";
}
function lt(e, t = !1) {
  const { host: n, path: r, pass: o, port: s, projectId: i, protocol: a, publicKey: c } = e;
  return `${a}://${c}${t && o ? `:${o}` : ""}@${n}${s ? `:${s}` : ""}/${r && `${r}/`}${i}`;
}
function wu(e) {
  const t = Iu.exec(e);
  if (!t) {
    qt(() => {
      console.error(`Invalid Sentry Dsn: ${e}`);
    });
    return;
  }
  const [n, r, o = "", s = "", i = "", a = ""] = t.slice(1);
  let c = "", u = a;
  const l = u.split("/");
  if (l.length > 1 && (c = l.slice(0, -1).join("/"), u = l.pop()), u) {
    const d = u.match(/^\d+/);
    d && (u = d[0]);
  }
  return Ni({ host: s, pass: o, path: c, projectId: u, port: i, protocol: n, publicKey: r });
}
function Ni(e) {
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
function Au(e) {
  if (!_)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((i) => e[i] ? !1 : (h.error(`Invalid Sentry Dsn: ${i} missing`), !0)) ? !1 : n.match(/^\d+$/) ? Ru(r) ? t && isNaN(parseInt(t, 10)) ? (h.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (h.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (h.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Ou(e) {
  return e.match(vu)?.[1];
}
function Du(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = Ou(n)), r;
}
function ki(e) {
  const t = typeof e == "string" ? wu(e) : Ni(e);
  if (!(!t || !Au(t)))
    return t;
}
function Bt(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const Ci = new RegExp(
  "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
  // whitespace
);
function Nu(e) {
  if (!e)
    return;
  const t = e.match(Ci);
  if (!t)
    return;
  let n;
  return t[3] === "1" ? n = !0 : t[3] === "0" && (n = !1), {
    traceId: t[1],
    parentSampled: n,
    parentSpanId: t[2]
  };
}
function ku(e, t) {
  const n = Nu(e), r = Di(t);
  if (!n?.traceId)
    return {
      traceId: Ae(),
      sampleRand: Math.random()
    };
  const o = Cu(n, r);
  r && (r.sample_rand = o.toString());
  const { traceId: s, parentSpanId: i, parentSampled: a } = n;
  return {
    traceId: s,
    parentSpanId: i,
    sampled: a,
    dsc: r || {},
    // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    sampleRand: o
  };
}
function Pi(e = Ae(), t = Ie(), n) {
  let r = "";
  return n !== void 0 && (r = n ? "-1" : "-0"), `${e}-${t}${r}`;
}
function Mi(e = Ae(), t = Ie(), n) {
  return `00-${e}-${t}-${n ? "01" : "00"}`;
}
function Cu(e, t) {
  const n = Bt(t?.sample_rand);
  if (n !== void 0)
    return n;
  const r = Bt(t?.sample_rate);
  return r && e?.parentSampled !== void 0 ? e.parentSampled ? (
    // Returns a sample rand with positive sampling decision [0, sampleRate)
    Math.random() * r
  ) : (
    // Returns a sample rand with negative sampling decision [sampleRate, 1)
    r + Math.random() * (1 - r)
  ) : Math.random();
}
const Li = 0, so = 1;
let rs = !1;
function Pu(e) {
  const { spanId: t, traceId: n } = e.spanContext(), { data: r, op: o, parent_span_id: s, status: i, origin: a, links: c } = A(e);
  return {
    parent_span_id: s,
    span_id: t,
    trace_id: n,
    data: r,
    op: o,
    status: i,
    origin: a,
    links: c
  };
}
function xi(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : A(e).parent_span_id, s = wn(e).scope, i = r ? s?.getPropagationContext().propagationSpanId || Ie() : t;
  return {
    parent_span_id: o,
    span_id: i,
    trace_id: n
  };
}
function Mu(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = qe(e);
  return Pi(t, n, r);
}
function Lu(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = qe(e);
  return Mi(t, n, r);
}
function Ui(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: s }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === so,
      attributes: s,
      ...o
    }));
}
function tt(e) {
  return typeof e == "number" ? os(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? os(e.getTime()) : x();
}
function os(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function A(e) {
  if (Uu(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if (xu(e)) {
    const { attributes: r, startTime: o, name: s, endTime: i, status: a, links: c } = e, u = "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: s,
      parent_span_id: u,
      start_timestamp: tt(o),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: tt(i) || void 0,
      status: $i(a),
      op: r[Oe],
      origin: r[C],
      links: Ui(c)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function xu(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function Uu(e) {
  return typeof e.getSpanJSON == "function";
}
function qe(e) {
  const { traceFlags: t } = e.spanContext();
  return t === so;
}
function $i(e) {
  if (!(!e || e.code === pu))
    return e.code === Ri ? "ok" : e.message || "unknown_error";
}
const nt = "_sentryChildSpans", kr = "_sentryRootSpan";
function Bi(e, t) {
  const n = e[kr] || e;
  re(t, kr, n), e[nt] ? e[nt].add(t) : re(e, nt, /* @__PURE__ */ new Set([t]));
}
function $u(e, t) {
  e[nt] && e[nt].delete(t);
}
function gn(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    if (!t.has(r) && qe(r)) {
      t.add(r);
      const o = r[nt] ? Array.from(r[nt]) : [];
      for (const s of o)
        n(s);
    }
  }
  return n(e), Array.from(t);
}
function W(e) {
  return e[kr] || e;
}
function Q() {
  const e = at(), t = wt(e);
  return t.getActiveSpan ? t.getActiveSpan() : Ut(D());
}
function Cr() {
  rs || (qt(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), rs = !0);
}
let ss = !1;
function Bu() {
  if (ss)
    return;
  function e() {
    const t = Q(), n = t && W(t);
    if (n) {
      const r = "internal_error";
      _ && h.log(`[Tracing] Root span: ${r} -> Global error occurred`), n.setStatus({ code: L, message: r });
    }
  }
  e.tag = "sentry_tracingErrorCallback", ss = !0, di(e), fi(e);
}
function fe(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = e || w()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function is(e) {
  h.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function An(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (Gu(n)) {
      if (mn(e.description, n))
        return _ && is(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? mn(e.description, n.name) : !0, o = n.op ? e.op && mn(e.op, n.op) : !0;
    if (r && o)
      return _ && is(e), !0;
  }
  return !1;
}
function Fu(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function Gu(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const io = "production", Fi = "_frozenDsc";
function hn(e, t) {
  re(e, Fi, t);
}
function Gi(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || io,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: Du(t)
  };
  return t.emit("createDsc", o), o;
}
function ao(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || Gi(n.traceId, e);
}
function De(e) {
  const t = w();
  if (!t)
    return {};
  const n = W(e), r = A(n), o = r.data, s = n.spanContext().traceState, i = s?.get("sentry.sample_rate") ?? o[no] ?? o[Ii];
  function a(p) {
    return (typeof i == "number" || typeof i == "string") && (p.sample_rate = `${i}`), p;
  }
  const c = n[Fi];
  if (c)
    return a(c);
  const u = s?.get("sentry.dsc"), l = u && Di(u);
  if (l)
    return a(l);
  const d = Gi(e.spanContext().traceId, t), m = o[he], f = r.description;
  return m !== "url" && f && (d.transaction = f), fe() && (d.sampled = String(qe(n)), d.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  s?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  wn(n).scope?.getPropagationContext().sampleRand.toString()), a(d), t.emit("createDsc", d, n), d;
}
class Fe {
  constructor(t = {}) {
    this._traceId = t.traceId || Ae(), this._spanId = t.spanId || Ie();
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: Li
    };
  }
  /** @inheritdoc */
  end(t) {
  }
  /** @inheritdoc */
  setAttribute(t, n) {
    return this;
  }
  /** @inheritdoc */
  setAttributes(t) {
    return this;
  }
  /** @inheritdoc */
  setStatus(t) {
    return this;
  }
  /** @inheritdoc */
  updateName(t) {
    return this;
  }
  /** @inheritdoc */
  isRecording() {
    return !1;
  }
  /** @inheritdoc */
  addEvent(t, n, r) {
    return this;
  }
  /** @inheritDoc */
  addLink(t) {
    return this;
  }
  /** @inheritDoc */
  addLinks(t) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(t, n) {
  }
}
function me(e, t = 100, n = 1 / 0) {
  try {
    return Pr("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function Hi(e, t = 3, n = 100 * 1024) {
  const r = me(e, t);
  return zu(r) > n ? Hi(e, t - 1, n) : r;
}
function Pr(e, t, n = 1 / 0, r = 1 / 0, o = Wu()) {
  const [s, i] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const a = Hu(e, t);
  if (!a.startsWith("[object "))
    return a;
  if (t.__sentry_skip_normalization__)
    return t;
  const c = typeof t.__sentry_override_normalization_depth__ == "number" ? t.__sentry_override_normalization_depth__ : n;
  if (c === 0)
    return a.replace("object ", "");
  if (s(t))
    return "[Circular ~]";
  const u = t;
  if (u && typeof u.toJSON == "function")
    try {
      const f = u.toJSON();
      return Pr("", f, c - 1, r, o);
    } catch {
    }
  const l = Array.isArray(t) ? [] : {};
  let d = 0;
  const m = Si(t);
  for (const f in m) {
    if (!Object.prototype.hasOwnProperty.call(m, f))
      continue;
    if (d >= r) {
      l[f] = "[MaxProperties ~]";
      break;
    }
    const p = m[f];
    l[f] = Pr(f, p, c - 1, r, o), d++;
  }
  return i(t), l;
}
function Hu(e, t) {
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
    if (gi(t))
      return "[VueViewModel]";
    if (Yc(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${Re(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = ju(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function ju(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function qu(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function zu(e) {
  return qu(JSON.stringify(e));
}
function Wu() {
  const e = /* @__PURE__ */ new WeakSet();
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1);
  }
  function n(r) {
    e.delete(r);
  }
  return [t, n];
}
function dt(e, t = []) {
  return [e, t];
}
function Yu(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function as(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function Mr(e) {
  const t = Un(v);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function Ku(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(s) {
    typeof r == "string" ? r = typeof s == "string" ? r + s : [Mr(r), s] : r.push(typeof s == "string" ? Mr(s) : s);
  }
  for (const s of n) {
    const [i, a] = s;
    if (o(`
${JSON.stringify(i)}
`), typeof a == "string" || a instanceof Uint8Array)
      o(a);
    else {
      let c;
      try {
        c = JSON.stringify(a);
      } catch {
        c = JSON.stringify(me(a));
      }
      o(c);
    }
  }
  return typeof r == "string" ? r : Vu(r);
}
function Vu(e) {
  const t = e.reduce((o, s) => o + s.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function Ju(e) {
  return [{
    type: "span"
  }, e];
}
function Xu(e) {
  const t = typeof e.data == "string" ? Mr(e.data) : e.data;
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
const Zu = {
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
function cs(e) {
  return Zu[e];
}
function ji(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function Qu(e, t, n, r) {
  const o = e.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: e.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...t && { sdk: t },
    ...!!n && r && { dsn: lt(r) },
    ...o && {
      trace: o
    }
  };
}
function el(e, t) {
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
function tl(e, t, n, r) {
  const o = ji(n), s = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: lt(t) }
  }, i = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return dt(s, [i]);
}
function nl(e, t, n, r) {
  const o = ji(n), s = e.type && e.type !== "replay_event" ? e.type : "event";
  el(e, n?.sdk);
  const i = Qu(e, o, r, t);
  return delete e.sdkProcessingMetadata, dt(i, [[{ type: s }, e]]);
}
function rl(e, t) {
  function n(f) {
    return !!f.trace_id && !!f.public_key;
  }
  const r = De(e[0]), o = t?.getDsn(), s = t?.getOptions().tunnel, i = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...n(r) && { trace: r },
    ...!!s && o && { dsn: lt(o) }
  }, { beforeSendSpan: a, ignoreSpans: c } = t?.getOptions() || {}, u = c?.length ? e.filter((f) => !An(A(f), c)) : e, l = e.length - u.length;
  l && t?.recordDroppedEvent("before_send", "span", l);
  const d = a ? (f) => {
    const p = A(f), S = a(p);
    return S || (Cr(), p);
  } : A, m = [];
  for (const f of u) {
    const p = d(f);
    p && m.push(Ju(p));
  }
  return dt(i, m);
}
function ol(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >", parent_span_id: r } = A(e), { spanId: o } = e.spanContext(), s = qe(e), i = W(e), a = i === e, c = `[Tracing] Starting ${s ? "sampled" : "unsampled"} ${a ? "root " : ""}span`, u = [`op: ${n}`, `name: ${t}`, `ID: ${o}`];
  if (r && u.push(`parent ID: ${r}`), !a) {
    const { op: l, description: d } = A(i);
    u.push(`root ID: ${i.spanContext().spanId}`), l && u.push(`root op: ${l}`), d && u.push(`root description: ${d}`);
  }
  h.log(`${c}
  ${u.join(`
  `)}`);
}
function sl(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >" } = A(e), { spanId: r } = e.spanContext(), s = W(e) === e, i = `[Tracing] Finishing "${n}" ${s ? "root " : ""}span "${t}" with ID ${r}`;
  h.log(i);
}
function il(e, t, n, r = Q()) {
  const o = r && W(r);
  o && (_ && h.log(`[Measurement] Setting measurement on root span: ${e} = ${t} ${n}`), o.addEvent(e, {
    [Yt]: t,
    [Wt]: n
  }));
}
function us(e) {
  if (!e || e.length === 0)
    return;
  const t = {};
  return e.forEach((n) => {
    const r = n.attributes || {}, o = r[Wt], s = r[Yt];
    typeof o == "string" && typeof s == "number" && (t[n.name] = { value: s, unit: o });
  }), t;
}
const ls = 1e3;
class Hn {
  /** Epoch timestamp in seconds when the span started. */
  /** Epoch timestamp in seconds when the span ended. */
  /** Internal keeper of the status */
  /** The timed events added to this span. */
  /** if true, treat span as a standalone span (not part of a transaction) */
  /**
   * You should never call the constructor manually, always use `Sentry.startSpan()`
   * or other span methods.
   * @internal
   * @hideconstructor
   * @hidden
   */
  constructor(t = {}) {
    this._traceId = t.traceId || Ae(), this._spanId = t.spanId || Ie(), this._startTime = t.startTimestamp || x(), this._links = t.links, this._attributes = {}, this.setAttributes({
      [C]: "manual",
      [Oe]: t.op,
      ...t.attributes
    }), this._name = t.name, t.parentSpanId && (this._parentSpanId = t.parentSpanId), "sampled" in t && (this._sampled = t.sampled), t.endTimestamp && (this._endTime = t.endTimestamp), this._events = [], this._isStandaloneSpan = t.isStandalone, this._endTime && this._onSpanEnded();
  }
  /** @inheritDoc */
  addLink(t) {
    return this._links ? this._links.push(t) : this._links = [t], this;
  }
  /** @inheritDoc */
  addLinks(t) {
    return this._links ? this._links.push(...t) : this._links = t, this;
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(t, n) {
  }
  /** @inheritdoc */
  spanContext() {
    const { _spanId: t, _traceId: n, _sampled: r } = this;
    return {
      spanId: t,
      traceId: n,
      traceFlags: r ? so : Li
    };
  }
  /** @inheritdoc */
  setAttribute(t, n) {
    return n === void 0 ? delete this._attributes[t] : this._attributes[t] = n, this;
  }
  /** @inheritdoc */
  setAttributes(t) {
    return Object.keys(t).forEach((n) => this.setAttribute(n, t[n])), this;
  }
  /**
   * This should generally not be used,
   * but we need it for browser tracing where we want to adjust the start time afterwards.
   * USE THIS WITH CAUTION!
   *
   * @hidden
   * @internal
   */
  updateStartTime(t) {
    this._startTime = tt(t);
  }
  /**
   * @inheritDoc
   */
  setStatus(t) {
    return this._status = t, this;
  }
  /**
   * @inheritDoc
   */
  updateName(t) {
    return this._name = t, this.setAttribute(he, "custom"), this;
  }
  /** @inheritdoc */
  end(t) {
    this._endTime || (this._endTime = tt(t), sl(this), this._onSpanEnded());
  }
  /**
   * Get JSON representation of this span.
   *
   * @hidden
   * @internal This method is purely for internal purposes and should not be used outside
   * of SDK code. If you need to get a JSON representation of a span,
   * use `spanToJSON(span)` instead.
   */
  getSpanJSON() {
    return {
      data: this._attributes,
      description: this._name,
      op: this._attributes[Oe],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: $i(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[C],
      profile_id: this._attributes[ro],
      exclusive_time: this._attributes[At],
      measurements: us(this._events),
      is_segment: this._isStandaloneSpan && W(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? W(this).spanContext().spanId : void 0,
      links: Ui(this._links)
    };
  }
  /** @inheritdoc */
  isRecording() {
    return !this._endTime && !!this._sampled;
  }
  /**
   * @inheritdoc
   */
  addEvent(t, n, r) {
    _ && h.log("[Tracing] Adding an event to span:", t);
    const o = ds(n) ? n : r || x(), s = ds(n) ? {} : n || {}, i = {
      name: t,
      time: tt(o),
      attributes: s
    };
    return this._events.push(i), this;
  }
  /**
   * This method should generally not be used,
   * but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
   * USE THIS WITH CAUTION!
   * @internal
   * @hidden
   * @experimental
   */
  isStandaloneSpan() {
    return !!this._isStandaloneSpan;
  }
  /** Emit `spanEnd` when the span is ended. */
  _onSpanEnded() {
    const t = w();
    if (t && t.emit("spanEnd", this), !(this._isStandaloneSpan || this === W(this)))
      return;
    if (this._isStandaloneSpan) {
      this._sampled ? cl(rl([this], t)) : (_ && h.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled."), t && t.recordDroppedEvent("sample_rate", "span"));
      return;
    }
    const r = this._convertSpanToTransaction();
    r && (wn(this).scope || D()).captureEvent(r);
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!fs(A(this)))
      return;
    this._name || (_ && h.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), this._name = "<unlabeled transaction>");
    const { scope: t, isolationScope: n } = wn(this), r = t?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
    if (this._sampled !== !0)
      return;
    const s = gn(this).filter((l) => l !== this && !al(l)).map((l) => A(l)).filter(fs), i = this._attributes[he];
    delete this._attributes[ts], s.forEach((l) => {
      delete l.data[ts];
    });
    const a = {
      contexts: {
        trace: Pu(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        s.length > ls ? s.sort((l, d) => l.start_timestamp - d.start_timestamp).slice(0, ls) : s
      ),
      start_timestamp: this._startTime,
      timestamp: this._endTime,
      transaction: this._name,
      type: "transaction",
      sdkProcessingMetadata: {
        capturedSpanScope: t,
        capturedSpanIsolationScope: n,
        dynamicSamplingContext: De(this)
      },
      request: r,
      ...i && {
        transaction_info: {
          source: i
        }
      }
    }, c = us(this._events);
    return c && Object.keys(c).length && (_ && h.log(
      "[Measurements] Adding measurements to transaction event",
      JSON.stringify(c, void 0, 2)
    ), a.measurements = c), a;
  }
}
function ds(e) {
  return e && typeof e == "number" || e instanceof Date || Array.isArray(e);
}
function fs(e) {
  return !!e.start_timestamp && !!e.timestamp && !!e.span_id && !!e.trace_id;
}
function al(e) {
  return e instanceof Hn && e.isStandaloneSpan();
}
function cl(e) {
  const t = w();
  if (!t)
    return;
  const n = e[1];
  if (!n || n.length === 0) {
    t.recordDroppedEvent("before_send", "span");
    return;
  }
  t.sendEnvelope(e);
}
function ul(e, t, n = () => {
}, r = () => {
}) {
  let o;
  try {
    o = e();
  } catch (s) {
    throw t(s), n(), s;
  }
  return ll(o, t, n, r);
}
function ll(e, t, n, r) {
  return Rt(e) ? e.then(
    (o) => (n(), r(o), o),
    (o) => {
      throw t(o), n(), o;
    }
  ) : (n(), r(e), e);
}
function dl(e, t, n) {
  if (!fe(e))
    return [!1];
  let r, o;
  typeof e.tracesSampler == "function" ? (o = e.tracesSampler({
    ...t,
    inheritOrSampleWith: (a) => typeof t.parentSampleRate == "number" ? t.parentSampleRate : typeof t.parentSampled == "boolean" ? Number(t.parentSampled) : a
  }), r = !0) : t.parentSampled !== void 0 ? o = t.parentSampled : typeof e.tracesSampleRate < "u" && (o = e.tracesSampleRate, r = !0);
  const s = Bt(o);
  if (s === void 0)
    return _ && h.warn(
      `[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
        o
      )} of type ${JSON.stringify(typeof o)}.`
    ), [!1];
  if (!s)
    return _ && h.log(
      `[Tracing] Discarding transaction because ${typeof e.tracesSampler == "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`
    ), [!1, s, r];
  const i = n < s;
  return i || _ && h.log(
    `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
      o
    )})`
  ), [i, s, r];
}
const qi = "__SENTRY_SUPPRESS_TRACING__";
function Kt(e, t) {
  const n = uo();
  if (n.startSpan)
    return n.startSpan(e, t);
  const r = Wi(e), { forceTransaction: o, parentSpan: s, scope: i } = e, a = i?.clone();
  return ut(a, () => pl(s)(() => {
    const u = D(), l = Yi(u, s), m = e.onlyIfParent && !l ? new Fe() : zi({
      parentSpan: l,
      spanArguments: r,
      forceTransaction: o,
      scope: u
    });
    return St(u, m), ul(
      () => t(m),
      () => {
        const { status: f } = A(m);
        m.isRecording() && (!f || f === "ok") && m.setStatus({ code: L, message: "internal_error" });
      },
      () => {
        m.end();
      }
    );
  }));
}
function Ot(e) {
  const t = uo();
  if (t.startInactiveSpan)
    return t.startInactiveSpan(e);
  const n = Wi(e), { forceTransaction: r, parentSpan: o } = e;
  return (e.scope ? (i) => ut(e.scope, i) : o !== void 0 ? (i) => co(o, i) : (i) => i())(() => {
    const i = D(), a = Yi(i, o);
    return e.onlyIfParent && !a ? new Fe() : zi({
      parentSpan: a,
      spanArguments: n,
      forceTransaction: r,
      scope: i
    });
  });
}
function co(e, t) {
  const n = uo();
  return n.withActiveSpan ? n.withActiveSpan(e, t) : ut((r) => (St(r, e || void 0), t(r)));
}
function zi({
  parentSpan: e,
  spanArguments: t,
  forceTransaction: n,
  scope: r
}) {
  if (!fe()) {
    const i = new Fe();
    if (n || !e) {
      const a = {
        sampled: "false",
        sample_rate: "0",
        transaction: t.name,
        ...De(i)
      };
      hn(i, a);
    }
    return i;
  }
  const o = Ne();
  let s;
  if (e && !n)
    s = fl(e, r, t), Bi(e, s);
  else if (e) {
    const i = De(e), { traceId: a, spanId: c } = e.spanContext(), u = qe(e);
    s = ps(
      {
        traceId: a,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), hn(s, i);
  } else {
    const {
      traceId: i,
      dsc: a,
      parentSpanId: c,
      sampled: u
    } = {
      ...o.getPropagationContext(),
      ...r.getPropagationContext()
    };
    s = ps(
      {
        traceId: i,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), a && hn(s, a);
  }
  return ol(s), _u(s, r, o), s;
}
function Wi(e) {
  const n = {
    isStandalone: (e.experimental || {}).standalone,
    ...e
  };
  if (e.startTime) {
    const r = { ...n };
    return r.startTimestamp = tt(e.startTime), delete r.startTime, r;
  }
  return n;
}
function uo() {
  const e = at();
  return wt(e);
}
function ps(e, t, n) {
  const r = w(), o = r?.getOptions() || {}, { name: s = "" } = e, i = { spanAttributes: { ...e.attributes }, spanName: s, parentSampled: n };
  r?.emit("beforeSampling", i, { decision: !1 });
  const a = i.parentSampled ?? n, c = i.spanAttributes, u = t.getPropagationContext(), [l, d, m] = t.getScopeData().sdkProcessingMetadata[qi] ? [!1] : dl(
    o,
    {
      name: s,
      parentSampled: a,
      attributes: c,
      parentSampleRate: Bt(u.dsc?.sample_rate)
    },
    u.sampleRand
  ), f = new Hn({
    ...e,
    attributes: {
      [he]: "custom",
      [no]: d !== void 0 && m ? d : void 0,
      ...c
    },
    sampled: l
  });
  return !l && r && (_ && h.log("[Tracing] Discarding root span because its trace was not chosen to be sampled."), r.recordDroppedEvent("sample_rate", "transaction")), r && r.emit("spanStart", f), f;
}
function fl(e, t, n) {
  const { spanId: r, traceId: o } = e.spanContext(), s = t.getScopeData().sdkProcessingMetadata[qi] ? !1 : qe(e), i = s ? new Hn({
    ...n,
    parentSpanId: r,
    traceId: o,
    sampled: s
  }) : new Fe({ traceId: o });
  Bi(e, i);
  const a = w();
  return a && (a.emit("spanStart", i), n.endTimestamp && a.emit("spanEnd", i)), i;
}
function Yi(e, t) {
  if (t)
    return t;
  if (t === null)
    return;
  const n = Ut(e);
  if (!n)
    return;
  const r = w();
  return (r ? r.getOptions() : {}).parentSpanIsAlwaysRootSpan ? W(n) : n;
}
function pl(e) {
  return e !== void 0 ? (t) => co(e, t) : (t) => t();
}
const _n = {
  idleTimeout: 1e3,
  finalTimeout: 3e4,
  childSpanTimeout: 15e3
}, ml = "heartbeatFailed", gl = "idleTimeout", hl = "finalTimeout", _l = "externalFinish";
function Ki(e, t = {}) {
  const n = /* @__PURE__ */ new Map();
  let r = !1, o, s = _l, i = !t.disableAutoFinish;
  const a = [], {
    idleTimeout: c = _n.idleTimeout,
    finalTimeout: u = _n.finalTimeout,
    childSpanTimeout: l = _n.childSpanTimeout,
    beforeSpanEnd: d,
    trimIdleSpanEndTimestamp: m = !0
  } = t, f = w();
  if (!f || !fe()) {
    const b = new Fe(), P = {
      sample_rate: "0",
      sampled: "false",
      ...De(b)
    };
    return hn(b, P), b;
  }
  const p = D(), S = Q(), y = yl(e);
  y.end = new Proxy(y.end, {
    apply(b, P, Pe) {
      if (d && d(y), P instanceof Fe)
        return;
      const [ye, ...z] = Pe, Se = ye || x(), M = tt(Se), We = gn(y).filter((R) => R !== y), Ye = A(y);
      if (!We.length || !m)
        return pt(M), Reflect.apply(b, P, [M, ...z]);
      const ue = f.getOptions().ignoreSpans, Me = We?.reduce((R, ee) => {
        const te = A(ee);
        return !te.timestamp || ue && An(te, ue) ? R : R ? Math.max(R, te.timestamp) : te.timestamp;
      }, void 0), O = Ye.start_timestamp, H = Math.min(
        O ? O + u / 1e3 : 1 / 0,
        Math.max(O || -1 / 0, Math.min(M, Me || 1 / 0))
      );
      return pt(H), Reflect.apply(b, P, [H, ...z]);
    }
  });
  function G() {
    o && (clearTimeout(o), o = void 0);
  }
  function q(b) {
    G(), o = setTimeout(() => {
      !r && n.size === 0 && i && (s = gl, y.end(b));
    }, c);
  }
  function Ce(b) {
    o = setTimeout(() => {
      !r && i && (s = ml, y.end(b));
    }, l);
  }
  function ze(b) {
    G(), n.set(b, !0);
    const P = x();
    Ce(P + l / 1e3);
  }
  function ft(b) {
    if (n.has(b) && n.delete(b), n.size === 0) {
      const P = x();
      q(P + c / 1e3);
    }
  }
  function pt(b) {
    r = !0, n.clear(), a.forEach((M) => M()), St(p, S);
    const P = A(y), { start_timestamp: Pe } = P;
    if (!Pe)
      return;
    P.data[$t] || y.setAttribute($t, s), h.log(`[Tracing] Idle span "${P.op}" finished`);
    const z = gn(y).filter((M) => M !== y);
    let Se = 0;
    z.forEach((M) => {
      M.isRecording() && (M.setStatus({ code: L, message: "cancelled" }), M.end(b), _ && h.log("[Tracing] Cancelling span since span ended early", JSON.stringify(M, void 0, 2)));
      const We = A(M), { timestamp: Ye = 0, start_timestamp: ue = 0 } = We, Me = ue <= b, O = (u + c) / 1e3, H = Ye - ue <= O;
      if (_) {
        const R = JSON.stringify(M, void 0, 2);
        Me ? H || h.log("[Tracing] Discarding span since it finished after idle span final timeout", R) : h.log("[Tracing] Discarding span since it happened after idle span was finished", R);
      }
      (!H || !Me) && ($u(y, M), Se++);
    }), Se > 0 && y.setAttribute("sentry.idle_span_discarded_spans", Se);
  }
  return a.push(
    f.on("spanStart", (b) => {
      if (r || b === y || A(b).timestamp || b instanceof Hn && b.isStandaloneSpan())
        return;
      gn(y).includes(b) && ze(b.spanContext().spanId);
    })
  ), a.push(
    f.on("spanEnd", (b) => {
      r || ft(b.spanContext().spanId);
    })
  ), a.push(
    f.on("idleSpanEnableAutoFinish", (b) => {
      b === y && (i = !0, q(), n.size && Ce());
    })
  ), t.disableAutoFinish || q(), setTimeout(() => {
    r || (y.setStatus({ code: L, message: "deadline_exceeded" }), s = hl, y.end());
  }, u), y;
}
function yl(e) {
  const t = Ot(e);
  return St(D(), t), _ && h.log("[Tracing] Started span is an idle span"), t;
}
const cr = 0, ms = 1, gs = 2;
function jn(e) {
  return new Ft((t) => {
    t(e);
  });
}
function lo(e) {
  return new Ft((t, n) => {
    n(e);
  });
}
class Ft {
  constructor(t) {
    this._state = cr, this._handlers = [], this._runExecutor(t);
  }
  /** @inheritdoc */
  then(t, n) {
    return new Ft((r, o) => {
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
    return new Ft((n, r) => {
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
    if (this._state === cr)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === ms && n[1](this._value), this._state === gs && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (s, i) => {
      if (this._state === cr) {
        if (Rt(i)) {
          i.then(r, o);
          return;
        }
        this._state = s, this._value = i, this._executeHandlers();
      }
    }, r = (s) => {
      n(ms, s);
    }, o = (s) => {
      n(gs, s);
    };
    try {
      t(r, o);
    } catch (s) {
      o(s);
    }
  }
}
function Sl(e, t, n, r = 0) {
  try {
    const o = Lr(t, n, e, r);
    return Rt(o) ? o : jn(o);
  } catch (o) {
    return lo(o);
  }
}
function Lr(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const s = o({ ...e }, t);
  return _ && s === null && h.log(`Event processor "${o.id || "?"}" dropped event`), Rt(s) ? s.then((i) => Lr(i, t, n, r + 1)) : Lr(s, t, n, r + 1);
}
function El(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: s } = t;
  Tl(e, t), r && Il(e, r), Rl(e, n), bl(e, o), vl(e, s);
}
function On(e, t) {
  const {
    extra: n,
    tags: r,
    user: o,
    contexts: s,
    level: i,
    sdkProcessingMetadata: a,
    breadcrumbs: c,
    fingerprint: u,
    eventProcessors: l,
    attachments: d,
    propagationContext: m,
    transactionName: f,
    span: p
  } = t;
  sn(e, "extra", n), sn(e, "tags", r), sn(e, "user", o), sn(e, "contexts", s), e.sdkProcessingMetadata = zt(e.sdkProcessingMetadata, a, 2), i && (e.level = i), f && (e.transactionName = f), p && (e.span = p), c.length && (e.breadcrumbs = [...e.breadcrumbs, ...c]), u.length && (e.fingerprint = [...e.fingerprint, ...u]), l.length && (e.eventProcessors = [...e.eventProcessors, ...l]), d.length && (e.attachments = [...e.attachments, ...d]), e.propagationContext = { ...e.propagationContext, ...m };
}
function sn(e, t, n) {
  e[t] = zt(e[t], n, 1);
}
function Tl(e, t) {
  const { extra: n, tags: r, user: o, contexts: s, level: i, transactionName: a } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(s).length && (e.contexts = { ...s, ...e.contexts }), i && (e.level = i), a && e.type !== "transaction" && (e.transaction = a);
}
function bl(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function vl(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function Il(e, t) {
  e.contexts = {
    trace: xi(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: De(t),
    ...e.sdkProcessingMetadata
  };
  const n = W(t), r = A(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function Rl(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let Ve, hs, _s, Le;
function wl(e) {
  const t = v._sentryDebugIds, n = v._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (Le && r.length === hs && o.length === _s)
    return Le;
  hs = r.length, _s = o.length, Le = {}, Ve || (Ve = {});
  const s = (i, a) => {
    for (const c of i) {
      const u = a[c], l = Ve?.[c];
      if (l && Le && u)
        Le[l[0]] = u, Ve && (Ve[c] = [l[0], u]);
      else if (u) {
        const d = e(c);
        for (let m = d.length - 1; m >= 0; m--) {
          const p = d[m]?.filename;
          if (p && Le && Ve) {
            Le[p] = u, Ve[c] = [p, u];
            break;
          }
        }
      }
    }
  };
  return t && s(r, t), n && s(o, n), Le;
}
function Al(e, t, n, r, o, s) {
  const { normalizeDepth: i = 3, normalizeMaxBreadth: a = 1e3 } = e, c = {
    ...t,
    event_id: t.event_id || n.event_id || ce(),
    timestamp: t.timestamp || ct()
  }, u = n.integrations || e.integrations.map((y) => y.name);
  Ol(c, e), kl(c, u), o && o.emit("applyFrameMetadata", t), t.type === void 0 && Dl(c, e.stackParser);
  const l = Pl(r, n.captureContext);
  n.mechanism && _t(c, n.mechanism);
  const d = o ? o.getEventProcessors() : [], m = bi().getScopeData();
  if (s) {
    const y = s.getScopeData();
    On(m, y);
  }
  if (l) {
    const y = l.getScopeData();
    On(m, y);
  }
  const f = [...n.attachments || [], ...m.attachments];
  f.length && (n.attachments = f), El(c, m);
  const p = [
    ...d,
    // Run scope event processors _after_ all other processors
    ...m.eventProcessors
  ];
  return Sl(p, c, n).then((y) => (y && Nl(y), typeof i == "number" && i > 0 ? Cl(y, i, a) : y));
}
function Ol(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: s = 250 } = t;
  e.environment = e.environment || n || io, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const i = e.request;
  i?.url && (i.url = Rn(i.url, s));
}
function Dl(e, t) {
  const n = wl(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function Nl(e) {
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
function kl(e, t) {
  t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Cl(e, t, n) {
  if (!e)
    return null;
  const r = {
    ...e,
    ...e.breadcrumbs && {
      breadcrumbs: e.breadcrumbs.map((o) => ({
        ...o,
        ...o.data && {
          data: me(o.data, t, n)
        }
      }))
    },
    ...e.user && {
      user: me(e.user, t, n)
    },
    ...e.contexts && {
      contexts: me(e.contexts, t, n)
    },
    ...e.extra && {
      extra: me(e.extra, t, n)
    }
  };
  return e.contexts?.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = me(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((o) => ({
    ...o,
    ...o.data && {
      data: me(o.data, t, n)
    }
  }))), e.contexts?.flags && r.contexts && (r.contexts.flags = me(e.contexts.flags, 3, n)), r;
}
function Pl(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new F();
  return n.update(t), n;
}
function Ml(e) {
  if (e)
    return Ll(e) ? { captureContext: e } : Ul(e) ? {
      captureContext: e
    } : e;
}
function Ll(e) {
  return e instanceof F || typeof e == "function";
}
const xl = [
  "user",
  "level",
  "extra",
  "contexts",
  "tags",
  "fingerprint",
  "propagationContext"
];
function Ul(e) {
  return Object.keys(e).some((t) => xl.includes(t));
}
function Vi(e, t) {
  return D().captureException(e, Ml(t));
}
function Ji(e, t) {
  return D().captureEvent(e, t);
}
function $l() {
  return Ne().lastEventId();
}
function Bl() {
  const e = w();
  return e?.getOptions().enabled !== !1 && !!e?.getTransport();
}
function ys(e) {
  const t = Ne(), n = D(), { userAgent: r } = v.navigator || {}, o = nu({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), s = t.getSession();
  return s?.status === "ok" && yt(s, { status: "exited" }), Xi(), t.setSession(o), o;
}
function Xi() {
  const e = Ne(), n = D().getSession() || e.getSession();
  n && ru(n), Zi(), e.setSession();
}
function Zi() {
  const e = Ne(), t = w(), n = e.getSession();
  n && t && t.captureSession(n);
}
function Ss(e = !1) {
  if (e) {
    Xi();
    return;
  }
  Zi();
}
const Fl = "7";
function Qi(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function Gl(e) {
  return `${Qi(e)}${e.projectId}/envelope/`;
}
function Hl(e, t) {
  const n = {
    sentry_version: Fl
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function jl(e, t, n) {
  return t || `${Gl(e)}?${Hl(e, n)}`;
}
function ql(e, t) {
  const n = ki(e);
  if (!n)
    return "";
  const r = `${Qi(n)}embed/error-page/`;
  let o = `dsn=${lt(n)}`;
  for (const s in t)
    if (s !== "dsn" && s !== "onClose")
      if (s === "user") {
        const i = t.user;
        if (!i)
          continue;
        i.name && (o += `&name=${encodeURIComponent(i.name)}`), i.email && (o += `&email=${encodeURIComponent(i.email)}`);
      } else
        o += `&${encodeURIComponent(s)}=${encodeURIComponent(t[s])}`;
  return `${r}?${o}`;
}
const Es = [];
function zl(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && ea(e, r, n);
  }), n;
}
function Ts(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function ea(e, t, n) {
  if (n[t.name]) {
    _ && h.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, Es.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), Es.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
    const r = t.preprocessEvent.bind(t);
    e.on("preprocessEvent", (o, s) => r(o, s, e));
  }
  if (typeof t.processEvent == "function") {
    const r = t.processEvent.bind(t), o = Object.assign((s, i) => r(s, i, e), {
      id: t.name
    });
    e.addEventProcessor(o);
  }
  _ && h.log(`Integration installed: ${t.name}`);
}
function Wl(e, t) {
  return t ? ut(t, () => {
    const n = Q(), r = n ? xi(n) : vi(t);
    return [n ? De(n) : ao(e, t), r];
  }) : [void 0, void 0];
}
const Yl = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};
function Kl(e) {
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
function Vl(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = lt(r)), dt(o, [Kl(e)]);
}
const Jl = 100;
function Xl(e) {
  switch (typeof e) {
    case "number":
      return Number.isInteger(e) ? {
        value: e,
        type: "integer"
      } : {
        value: e,
        type: "double"
      };
    case "boolean":
      return {
        value: e,
        type: "boolean"
      };
    case "string":
      return {
        value: e,
        type: "string"
      };
    default: {
      let t = "";
      try {
        t = JSON.stringify(e) ?? "";
      } catch {
      }
      return {
        value: t,
        type: "string"
      };
    }
  }
}
function pe(e, t, n, r = !0) {
  n && (!e[t] || r) && (e[t] = n);
}
function Zl(e, t) {
  const n = po(), r = ta(e);
  r === void 0 ? n.set(e, [t]) : (n.set(e, [...r, t]), r.length >= Jl && fo(e, r));
}
function xr(e, t = D(), n = Zl) {
  const r = t?.getClient() ?? w();
  if (!r) {
    _ && h.warn("No client available to capture log.");
    return;
  }
  const { release: o, environment: s, enableLogs: i = !1, beforeSendLog: a } = r.getOptions();
  if (!i) {
    _ && h.warn("logging option not enabled, log will not be captured.");
    return;
  }
  const [, c] = Wl(r, t), u = {
    ...e.attributes
  }, {
    user: { id: l, email: d, username: m }
  } = Ql(t);
  pe(u, "user.id", l, !1), pe(u, "user.email", d, !1), pe(u, "user.name", m, !1), pe(u, "sentry.release", o), pe(u, "sentry.environment", s);
  const { name: f, version: p } = r.getSdkMetadata()?.sdk ?? {};
  pe(u, "sentry.sdk.name", f), pe(u, "sentry.sdk.version", p);
  const S = r.getIntegrationByName("Replay"), y = S?.getReplayId(!0);
  pe(u, "sentry.replay_id", y), y && S?.getRecordingMode() === "buffer" && pe(u, "sentry._internal.replay_is_buffering", !0);
  const G = e.message;
  if (Bn(G)) {
    const { __sentry_template_string__: ye, __sentry_template_values__: z = [] } = G;
    z?.length && (u["sentry.message.template"] = ye), z.forEach((Se, M) => {
      u[`sentry.message.parameter.${M}`] = Se;
    });
  }
  const q = Ut(t);
  pe(u, "sentry.trace.parent_span_id", q?.spanContext().spanId);
  const Ce = { ...e, attributes: u };
  r.emit("beforeCaptureLog", Ce);
  const ze = a ? qt(() => a(Ce)) : Ce;
  if (!ze) {
    r.recordDroppedEvent("before_send", "log_item", 1), _ && h.warn("beforeSendLog returned null, log will not be captured.");
    return;
  }
  const { level: ft, message: pt, attributes: b = {}, severityNumber: P } = ze, Pe = {
    timestamp: x(),
    level: ft,
    body: pt,
    trace_id: c?.trace_id,
    severity_number: P ?? Yl[ft],
    attributes: Object.keys(b).reduce(
      (ye, z) => (ye[z] = Xl(b[z]), ye),
      {}
    )
  };
  n(r, Pe), r.emit("afterCaptureLog", ze);
}
function fo(e, t) {
  const n = t ?? ta(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Vl(n, r._metadata, r.tunnel, e.getDsn());
  po().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function ta(e) {
  return po().get(e);
}
function Ql(e) {
  const t = bi().getScopeData();
  return On(t, Ne().getScopeData()), On(t, e.getScopeData()), t;
}
function po() {
  return vt("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function ed(e) {
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
function td(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = lt(r)), dt(o, [ed(e)]);
}
function na(e, t) {
  const n = t ?? nd(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = td(n, r._metadata, r.tunnel, e.getDsn());
  ra().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function nd(e) {
  return ra().get(e);
}
function ra() {
  return vt("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function rd(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: ct(),
      discarded_events: e
    }
  ];
  return dt(t ? { dsn: t } : {}, [r]);
}
function oa(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function od(e) {
  const { trace_id: t, parent_span_id: n, span_id: r, status: o, origin: s, data: i, op: a } = e.contexts?.trace ?? {};
  return {
    data: i ?? {},
    description: e.transaction,
    op: a,
    parent_span_id: n,
    span_id: r ?? "",
    start_timestamp: e.start_timestamp ?? 0,
    status: o,
    timestamp: e.timestamp,
    trace_id: t ?? "",
    origin: s,
    profile_id: i?.[ro],
    exclusive_time: i?.[At],
    measurements: e.measurements,
    is_segment: !0
  };
}
function sd(e) {
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
          ...e.profile_id && { [ro]: e.profile_id },
          ...e.exclusive_time && { [At]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const bs = "Not capturing exception because it's already been captured.", vs = "Discarded session because of missing or non-string release", sa = Symbol.for("SentryInternalError"), ia = Symbol.for("SentryDoNotSendEventError"), id = 5e3;
function yn(e) {
  return {
    message: e,
    [sa]: !0
  };
}
function ur(e) {
  return {
    message: e,
    [ia]: !0
  };
}
function Is(e) {
  return !!e && typeof e == "object" && sa in e;
}
function Rs(e) {
  return !!e && typeof e == "object" && ia in e;
}
function ws(e, t, n, r, o) {
  let s = 0, i;
  e.on(n, () => {
    s = 0, clearTimeout(i);
  }), e.on(t, (a) => {
    s += r(a), s >= 8e5 ? o(e) : (clearTimeout(i), i = setTimeout(() => {
      o(e);
    }, id));
  }), e.on("flush", () => {
    o(e);
  });
}
class ad {
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
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = ki(t.dsn) : _ && h.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = jl(
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
    this._options.enableLogs && ws(this, "afterCaptureLog", "flushLogs", dd, fo), this._options._experiments?.enableMetrics && ws(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      ld,
      na
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = ce();
    if (Zo(t))
      return _ && h.log(bs), o;
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
      event_id: ce(),
      ...r
    }, i = Bn(t) ? t : String(t), a = st(t) ? this.eventFromMessage(i, n, s) : this.eventFromException(t, s);
    return this._process(a.then((c) => this._captureEvent(c, s, o))), s.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = ce();
    if (n?.originalException && Zo(n.originalException))
      return _ && h.log(bs), o;
    const s = {
      event_id: o,
      ...n
    }, i = t.sdkProcessingMetadata || {}, a = i.capturedSpanScope, c = i.capturedSpanIsolationScope;
    return this._process(
      this._captureEvent(t, s, a || r, c)
    ), s.event_id;
  }
  /**
   * Captures a session.
   */
  captureSession(t) {
    this.sendSession(t), yt(t, { init: !1 });
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
    ea(this, t, this._integrations), n || Ts(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = nl(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = Yu(r, Xu(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = io } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        _ && h.warn(vs);
        return;
      }
      s.release = s.release || n, s.environment = s.environment || r, t.attrs = s;
    } else {
      if (!t.release && !n) {
        _ && h.warn(vs);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = tl(t, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(o);
  }
  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
   */
  recordDroppedEvent(t, n, r = 1) {
    if (this._options.sendClientReports) {
      const o = `${t}:${n}`;
      _ && h.log(`Recording outcome: "${o}"${r > 1 ? ` (${r} times)` : ""}`), this._outcomes[o] = (this._outcomes[o] || 0) + r;
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
        return _ && h.error("Error while sending envelope:", n), {};
      }
    return _ && h.error("Transport disabled"), {};
  }
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Setup integrations for this client. */
  _setupIntegrations() {
    const { integrations: t } = this._options;
    this._integrations = zl(this, t), Ts(this, t);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(t, n) {
    let r = n.level === "fatal", o = !1;
    const s = n.exception?.values;
    if (s) {
      o = !0;
      for (const c of s)
        if (c.mechanism?.handled === !1) {
          r = !0;
          break;
        }
    }
    const i = t.status === "ok";
    (i && t.errors === 0 || i && r) && (yt(t, {
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
    return !n.integrations && i?.length && (n.integrations = i), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Al(s, t, n, r, this, o).then((a) => {
      if (a === null)
        return a;
      this.emit("postprocessEvent", a, n), a.contexts = {
        trace: vi(r),
        ...a.contexts
      };
      const c = ao(this, r);
      return a.sdkProcessingMetadata = {
        dynamicSamplingContext: c,
        ...a.sdkProcessingMetadata
      }, a;
    });
  }
  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
  _captureEvent(t, n = {}, r = D(), o = Ne()) {
    return _ && Ur(t) && h.log(`Captured error event \`${oa(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (s) => s.event_id,
      (s) => {
        _ && (Rs(s) ? h.log(s.message) : Is(s) ? h.warn(s.message) : h.warn(s));
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
    const s = this.getOptions(), { sampleRate: i } = s, a = aa(t), c = Ur(t), u = t.type || "error", l = `before send for type \`${u}\``, d = typeof i > "u" ? void 0 : Bt(i);
    if (c && typeof d == "number" && Math.random() > d)
      return this.recordDroppedEvent("sample_rate", "error"), lo(
        ur(
          `Discarding event because it's not included in the random sample (sampling rate = ${i})`
        )
      );
    const m = u === "replay_event" ? "replay" : u;
    return this._prepareEvent(t, n, r, o).then((f) => {
      if (f === null)
        throw this.recordDroppedEvent("event_processor", m), ur("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return f;
      const S = ud(this, s, f, n);
      return cd(S, l);
    }).then((f) => {
      if (f === null) {
        if (this.recordDroppedEvent("before_send", m), a) {
          const G = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", G);
        }
        throw ur(`${l} returned \`null\`, will not send event.`);
      }
      const p = r.getSession() || o.getSession();
      if (c && p && this._updateSessionFromEvent(p, f), a) {
        const y = f.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, G = f.spans ? f.spans.length : 0, q = y - G;
        q > 0 && this.recordDroppedEvent("before_send", "span", q);
      }
      const S = f.transaction_info;
      if (a && S && f.transaction !== t.transaction) {
        const y = "custom";
        f.transaction_info = {
          ...S,
          source: y
        };
      }
      return this.sendEvent(f, n), f;
    }).then(null, (f) => {
      throw Rs(f) || Is(f) ? f : (this.captureException(f, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: f
      }), yn(
        `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${f}`
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
    _ && h.log("Flushing outcomes...");
    const t = this._clearOutcomes();
    if (t.length === 0) {
      _ && h.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      _ && h.log("No dsn provided, will not send outcomes");
      return;
    }
    _ && h.log("Sending outcomes:", t);
    const n = rd(t, this._options.tunnel && lt(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function cd(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (Rt(e))
    return e.then(
      (r) => {
        if (!xt(r) && r !== null)
          throw yn(n);
        return r;
      },
      (r) => {
        throw yn(`${t} rejected with ${r}`);
      }
    );
  if (!xt(e) && e !== null)
    throw yn(n);
  return e;
}
function ud(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i, ignoreSpans: a } = t;
  let c = n;
  if (Ur(c) && o)
    return o(c, r);
  if (aa(c)) {
    if (i || a) {
      const u = od(c);
      if (a?.length && An(u, a))
        return null;
      if (i) {
        const l = i(u);
        l ? c = zt(n, sd(l)) : Cr();
      }
      if (c.spans) {
        const l = [], d = c.spans;
        for (const f of d) {
          if (a?.length && An(f, a)) {
            Fu(d, f);
            continue;
          }
          if (i) {
            const p = i(f);
            p ? l.push(p) : (Cr(), l.push(f));
          } else
            l.push(f);
        }
        const m = c.spans.length - l.length;
        m && e.recordDroppedEvent("before_send", "span", m), c.spans = l;
      }
    }
    if (s) {
      if (c.spans) {
        const u = c.spans.length;
        c.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: u
        };
      }
      return s(c, r);
    }
  }
  return c;
}
function Ur(e) {
  return e.type === void 0;
}
function aa(e) {
  return e.type === "transaction";
}
function ld(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + ca(e.attributes);
}
function dd(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + ca(e.attributes);
}
function ca(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * As(n[0]) : st(n) ? t += As(n) : t += 100;
  }), t;
}
function As(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const ua = Symbol.for("SentryBufferFullError");
function fd(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(i) {
    t.delete(i);
  }
  function o(i) {
    if (!n())
      return lo(ua);
    const a = i();
    return t.add(a), a.then(
      () => r(a),
      () => r(a)
    ), a;
  }
  function s(i) {
    if (!t.size)
      return jn(!0);
    const a = Promise.allSettled(Array.from(t)).then(() => !0);
    if (!i)
      return a;
    const c = [a, new Promise((u) => setTimeout(() => u(!1), i))];
    return Promise.race(c);
  }
  return {
    get $() {
      return Array.from(t);
    },
    add: o,
    drain: s
  };
}
const pd = 60 * 1e3;
function md(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? pd : r - t;
}
function gd(e, t) {
  return e[t] || e.all || 0;
}
function hd(e, t, n = Date.now()) {
  return gd(e, t) > n;
}
function _d(e, { statusCode: t, headers: n }, r = Date.now()) {
  const o = {
    ...e
  }, s = n?.["x-sentry-rate-limits"], i = n?.["retry-after"];
  if (s)
    for (const a of s.trim().split(",")) {
      const [c, u, , , l] = a.split(":", 5), d = parseInt(c, 10), m = (isNaN(d) ? 60 : d) * 1e3;
      if (!u)
        o.all = r + m;
      else
        for (const f of u.split(";"))
          f === "metric_bucket" ? (!l || l.split(";").includes("custom")) && (o[f] = r + m) : o[f] = r + m;
    }
  else i ? o.all = r + md(i, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const yd = 64;
function Sd(e, t, n = fd(
  e.bufferSize || yd
)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const a = [];
    if (as(i, (d, m) => {
      const f = cs(m);
      hd(r, f) ? e.recordDroppedEvent("ratelimit_backoff", f) : a.push(d);
    }), a.length === 0)
      return Promise.resolve({});
    const c = dt(i[0], a), u = (d) => {
      as(c, (m, f) => {
        e.recordDroppedEvent(d, cs(f));
      });
    }, l = () => t({ body: Ku(c) }).then(
      (d) => (d.statusCode !== void 0 && (d.statusCode < 200 || d.statusCode >= 300) && _ && h.warn(`Sentry responded with status code ${d.statusCode} to sent event.`), r = _d(r, d), d),
      (d) => {
        throw u("network_error"), _ && h.error("Encountered error running transport request:", d), d;
      }
    );
    return n.add(l).then(
      (d) => d,
      (d) => {
        if (d === ua)
          return _ && h.error("Skipped sending event because buffer is full."), u("queue_overflow"), Promise.resolve({});
        throw d;
      }
    );
  }
  return {
    send: s,
    flush: o
  };
}
const Ed = "thismessage:/";
function la(e) {
  return "isRelative" in e;
}
function da(e, t) {
  const n = e.indexOf("://") <= 0 && e.indexOf("//") !== 0, r = n ? Ed : void 0;
  try {
    if ("canParse" in URL && !URL.canParse(e, r))
      return;
    const o = new URL(e, r);
    return n ? {
      isRelative: n,
      pathname: o.pathname,
      search: o.search,
      hash: o.hash
    } : o;
  } catch {
  }
}
function Td(e) {
  if (la(e))
    return e.pathname;
  const t = new URL(e);
  return t.search = "", t.hash = "", ["80", "443"].includes(t.port) && (t.port = ""), t.password && (t.password = "%filtered%"), t.username && (t.username = "%filtered%"), t.toString();
}
function rt(e) {
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
function bd(e) {
  return e.split(/[?#]/, 1)[0];
}
function vd(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function Id(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  o.sdk || (o.sdk = {
    name: `sentry.javascript.${t}`,
    packages: n.map((s) => ({
      name: `${r}:@sentry/${s}`,
      version: et
    })),
    version: et
  }), e._metadata = o;
}
function fa(e = {}) {
  const t = e.client || w();
  if (!Bl() || !t)
    return {};
  const n = at(), r = wt(n);
  if (r.getTraceData)
    return r.getTraceData(e);
  const o = e.scope || D(), s = e.span || Q(), i = s ? Mu(s) : Rd(o), a = s ? De(s) : ao(t, o), c = Eu(a);
  if (!Ci.test(i))
    return h.warn("Invalid sentry-trace data. Cannot generate trace data"), {};
  const l = {
    "sentry-trace": i,
    baggage: c
  };
  if (e.propagateTraceparent) {
    const d = s ? Lu(s) : wd(o);
    d && (l.traceparent = d);
  }
  return l;
}
function Rd(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return Pi(t, r, n);
}
function wd(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return Mi(t, r, n);
}
const Ad = 100;
function it(e, t) {
  const n = w(), r = Ne();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = Ad } = n.getOptions();
  if (s <= 0) return;
  const a = { timestamp: ct(), ...e }, c = o ? qt(() => o(a, t)) : a;
  c !== null && (n.emit && n.emit("beforeAddBreadcrumb", c, t), r.addBreadcrumb(c, s));
}
let Os;
const Od = "FunctionToString", Ds = /* @__PURE__ */ new WeakMap(), Dd = () => ({
  name: Od,
  setupOnce() {
    Os = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = to(this), n = Ds.has(w()) && t !== void 0 ? t : this;
        return Os.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    Ds.set(e, !0);
  }
}), Nd = Dd, kd = [
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
], Cd = "EventFilters", Pd = (e = {}) => {
  let t;
  return {
    name: Cd,
    setup(n) {
      const r = n.getOptions();
      t = Ns(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const s = o.getOptions();
        t = Ns(e, s);
      }
      return Ld(n, t) ? null : n;
    }
  };
}, Md = (e = {}) => ({
  ...Pd(e),
  name: "InboundFilters"
});
function Ns(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : kd
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function Ld(e, t) {
  if (e.type) {
    if (e.type === "transaction" && Ud(e, t.ignoreTransactions))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${Ze(e)}`
      ), !0;
  } else {
    if (xd(e, t.ignoreErrors))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${Ze(e)}`
      ), !0;
    if (Gd(e))
      return _ && h.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${Ze(
          e
        )}`
      ), !0;
    if ($d(e, t.denyUrls))
      return _ && h.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${Ze(
          e
        )}.
Url: ${Dn(e)}`
      ), !0;
    if (!Bd(e, t.allowUrls))
      return _ && h.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${Ze(
          e
        )}.
Url: ${Dn(e)}`
      ), !0;
  }
  return !1;
}
function xd(e, t) {
  return t?.length ? oa(e).some((n) => Be(n, t)) : !1;
}
function Ud(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? Be(n, t) : !1;
}
function $d(e, t) {
  if (!t?.length)
    return !1;
  const n = Dn(e);
  return n ? Be(n, t) : !1;
}
function Bd(e, t) {
  if (!t?.length)
    return !0;
  const n = Dn(e);
  return n ? Be(n, t) : !0;
}
function Fd(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function Dn(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? Fd(n) : null;
  } catch {
    return _ && h.error(`Cannot extract url for event ${Ze(e)}`), null;
  }
}
function Gd(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Hd(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !we(s.originalException, Error))
    return;
  const i = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  i && (o.exception.values = $r(
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
function $r(e, t, n, r, o, s, i, a) {
  if (s.length >= n + 1)
    return s;
  let c = [...s];
  if (we(r[o], Error)) {
    ks(i, a);
    const u = e(t, r[o]), l = c.length;
    Cs(u, o, l, a), c = $r(
      e,
      t,
      n,
      r[o],
      o,
      [u, ...c],
      u,
      l
    );
  }
  return Array.isArray(r.errors) && r.errors.forEach((u, l) => {
    if (we(u, Error)) {
      ks(i, a);
      const d = e(t, u), m = c.length;
      Cs(d, `errors[${l}]`, m, a), c = $r(
        e,
        t,
        n,
        u,
        o,
        [d, ...c],
        d,
        m
      );
    }
  }), c;
}
function ks(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function Cs(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: "chained",
    source: t,
    exception_id: n,
    parent_id: r
  };
}
function pa(e) {
  const t = "console";
  He(t, e), je(t, jd);
}
function jd() {
  "console" in v && ci.forEach(function(e) {
    e in v.console && ne(v.console, e, function(t) {
      return In[e] = t, function(...n) {
        ae("console", { args: n, level: e }), In[e]?.apply(v.console, n);
      };
    });
  });
}
function qd(e) {
  return e === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e) ? e : "log";
}
const zd = "Dedupe", Wd = () => {
  let e;
  return {
    name: zd,
    processEvent(t) {
      if (t.type)
        return t;
      try {
        if (Kd(t, e))
          return _ && h.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, Yd = Wd;
function Kd(e, t) {
  return t ? !!(Vd(e, t) || Jd(e, t)) : !1;
}
function Vd(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !ga(e, t) || !ma(e, t));
}
function Jd(e, t) {
  const n = Ps(t), r = Ps(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !ga(e, t) || !ma(e, t));
}
function ma(e, t) {
  let n = Wo(e), r = Wo(t);
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
function ga(e, t) {
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
function Ps(e) {
  return e.exception?.values?.[0];
}
function Xd(e, t, n, r, o) {
  if (!e.fetchData)
    return;
  const { method: s, url: i } = e.fetchData, a = fe() && t(i);
  if (e.endTimestamp && a) {
    const f = e.fetchData.__span;
    if (!f) return;
    const p = r[f];
    p && (ef(p, e), Zd(p, e, o), delete r[f]);
    return;
  }
  const { spanOrigin: c = "auto.http.browser", propagateTraceparent: u = !1 } = typeof o == "object" ? o : { spanOrigin: o }, l = !!Q(), d = a && l ? Ot(nf(i, s, c)) : new Fe();
  if (e.fetchData.__span = d.spanContext().spanId, r[d.spanContext().spanId] = d, n(e.fetchData.url)) {
    const f = e.args[0], p = e.args[1] || {}, S = Qd(
      f,
      p,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      fe() && l ? d : void 0,
      u
    );
    S && (e.args[1] = p, p.headers = S);
  }
  const m = w();
  if (m) {
    const f = {
      input: e.args,
      response: e.response,
      startTimestamp: e.startTimestamp,
      endTimestamp: e.endTimestamp
    };
    m.emit("beforeOutgoingRequestSpan", d, f);
  }
  return d;
}
function Zd(e, t, n) {
  (typeof n == "object" && n !== null ? n.onRequestSpanEnd : void 0)?.(e, {
    headers: t.response?.headers,
    error: t.error
  });
}
function Qd(e, t, n, r) {
  const o = fa({ span: n, propagateTraceparent: r }), s = o["sentry-trace"], i = o.baggage, a = o.traceparent;
  if (!s)
    return;
  const c = t.headers || (hi(e) ? e.headers : void 0);
  if (c)
    if (tf(c)) {
      const u = new Headers(c);
      if (u.get("sentry-trace") || u.set("sentry-trace", s), r && a && !u.get("traceparent") && u.set("traceparent", a), i) {
        const l = u.get("baggage");
        l ? an(l) || u.set("baggage", `${l},${i}`) : u.set("baggage", i);
      }
      return u;
    } else if (Array.isArray(c)) {
      const u = [...c];
      c.find((d) => d[0] === "sentry-trace") || u.push(["sentry-trace", s]), r && a && !c.find((d) => d[0] === "traceparent") && u.push(["traceparent", a]);
      const l = c.find(
        (d) => d[0] === "baggage" && an(d[1])
      );
      return i && !l && u.push(["baggage", i]), u;
    } else {
      const u = "sentry-trace" in c ? c["sentry-trace"] : void 0, l = "traceparent" in c ? c.traceparent : void 0, d = "baggage" in c ? c.baggage : void 0, m = d ? Array.isArray(d) ? [...d] : [d] : [], f = d && (Array.isArray(d) ? d.find((S) => an(S)) : an(d));
      i && !f && m.push(i);
      const p = {
        ...c,
        "sentry-trace": u ?? s,
        baggage: m.length > 0 ? m.join(",") : void 0
      };
      return r && a && !l && (p.traceparent = a), p;
    }
  else return { ...o };
}
function ef(e, t) {
  if (t.response) {
    wi(e, t.response.status);
    const n = t.response?.headers?.get("content-length");
    if (n) {
      const r = parseInt(n);
      r > 0 && e.setAttribute("http.response_content_length", r);
    }
  } else t.error && e.setStatus({ code: L, message: "internal_error" });
  e.end();
}
function an(e) {
  return e.split(",").some((t) => t.trim().startsWith(oo));
}
function tf(e) {
  return typeof Headers < "u" && we(e, Headers);
}
function nf(e, t, n) {
  const r = da(e);
  return {
    name: r ? `${t} ${Td(r)}` : t,
    attributes: rf(e, r, t, n)
  };
}
function rf(e, t, n, r) {
  const o = {
    url: e,
    type: "fetch",
    "http.method": n,
    [C]: r,
    [Oe]: "http.client"
  };
  return t && (la(t) || (o["http.url"] = t.href, o["server.address"] = t.host), t.search && (o["http.query"] = t.search), t.hash && (o["http.fragment"] = t.hash)), o;
}
function mo(e, t, n, r, o) {
  xr({ level: e, message: t, attributes: n, severityNumber: o }, r);
}
function qn(e, t, { scope: n } = {}) {
  mo("info", e, t, n);
}
function zn(e, t, { scope: n } = {}) {
  mo("warn", e, t, n);
}
function Wn(e, t, { scope: n } = {}) {
  mo("error", e, t, n);
}
function Ms(e, t, n) {
  return "util" in v && typeof v.util.format == "function" ? v.util.format(...e) : of(e, t, n);
}
function of(e, t, n) {
  return e.map(
    (r) => st(r) ? String(r) : JSON.stringify(me(r, t, n))
  ).join(" ");
}
function sf(e) {
  return /%[sdifocO]/.test(e);
}
function af(e, t) {
  const n = {}, r = new Array(t.length).fill("{}").join(" ");
  return n["sentry.message.template"] = `${e} ${r}`, t.forEach((o, s) => {
    n[`sentry.message.parameter.${s}`] = o;
  }), n;
}
const cf = "ConsoleLogs", Ls = {
  [C]: "auto.log.console"
}, uf = (e = {}) => {
  const t = e.levels || ci;
  return {
    name: cf,
    setup(n) {
      const { enableLogs: r, normalizeDepth: o = 3, normalizeMaxBreadth: s = 1e3 } = n.getOptions();
      if (!r) {
        _ && h.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
        return;
      }
      pa(({ args: i, level: a }) => {
        if (w() !== n || !t.includes(a))
          return;
        const c = i[0], u = i.slice(1);
        if (a === "assert") {
          if (!c) {
            const f = u.length > 0 ? `Assertion failed: ${Ms(u, o, s)}` : "Assertion failed";
            xr({ level: "error", message: f, attributes: Ls });
          }
          return;
        }
        const l = a === "log", d = i.length > 1 && typeof i[0] == "string" && !sf(i[0]), m = {
          ...Ls,
          ...d ? af(c, u) : {}
        };
        xr({
          level: l ? "info" : a,
          message: Ms(i, o, s),
          severityNumber: l ? 10 : void 0,
          attributes: m
        });
      });
    }
  };
}, go = uf;
function ha(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const Gt = v;
function lf() {
  return "history" in Gt && !!Gt.history;
}
function df() {
  if (!("fetch" in Gt))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function Br(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function ff() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!df())
    return !1;
  if (Br(Gt.fetch))
    return !0;
  let e = !1;
  const t = Gt.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = Br(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      _ && h.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function _a(e, t) {
  const n = "fetch";
  He(n, e), je(n, () => ya(void 0, t));
}
function pf(e) {
  const t = "fetch-body-resolved";
  He(t, e), je(t, () => ya(gf));
}
function ya(e, t = !1) {
  t && !ff() || ne(v, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: s, url: i } = hf(r), a = {
        args: r,
        fetchData: {
          method: s,
          url: i
        },
        startTimestamp: x() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: _f(r)
      };
      return e || ae("fetch", {
        ...a
      }), n.apply(v, r).then(
        async (c) => (e ? e(c) : ae("fetch", {
          ...a,
          endTimestamp: x() * 1e3,
          response: c
        }), c),
        (c) => {
          if (ae("fetch", {
            ...a,
            endTimestamp: x() * 1e3,
            error: c
          }), $n(c) && c.stack === void 0 && (c.stack = o.stack, re(c, "framesToPop", 1)), c instanceof TypeError && (c.message === "Failed to fetch" || c.message === "Load failed" || c.message === "NetworkError when attempting to fetch resource."))
            try {
              const u = new URL(a.fetchData.url);
              c.message = `${c.message} (${u.host})`;
            } catch {
            }
          throw c;
        }
      );
    };
  });
}
async function mf(e, t) {
  if (e?.body) {
    const n = e.body, r = n.getReader(), o = setTimeout(
      () => {
        n.cancel().then(null, () => {
        });
      },
      90 * 1e3
      // 90s
    );
    let s = !0;
    for (; s; ) {
      let i;
      try {
        i = setTimeout(() => {
          n.cancel().then(null, () => {
          });
        }, 5e3);
        const { done: a } = await r.read();
        clearTimeout(i), a && (t(), s = !1);
      } catch {
        s = !1;
      } finally {
        clearTimeout(i);
      }
    }
    clearTimeout(o), r.releaseLock(), n.cancel().then(null, () => {
    });
  }
}
function gf(e) {
  let t;
  try {
    t = e.clone();
  } catch {
    return;
  }
  mf(t, () => {
    ae("fetch-body-resolved", {
      endTimestamp: x() * 1e3,
      response: e
    });
  });
}
function Fr(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function xs(e) {
  return typeof e == "string" ? e : e ? Fr(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function hf(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: xs(n),
      method: Fr(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: xs(t),
    method: Fr(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function _f(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (hi(t))
      return new Headers(t.headers);
  } catch {
  }
}
function yf() {
  return "npm";
}
const I = v;
let Gr = 0;
function Sa() {
  return Gr > 0;
}
function Sf() {
  Gr++, setTimeout(() => {
    Gr--;
  });
}
function Tt(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (to(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const s = o.map((i) => Tt(i, t));
      return e.apply(this, s);
    } catch (s) {
      throw Sf(), ut((i) => {
        i.addEventProcessor((a) => (t.mechanism && (Dr(a, void 0), _t(a, t.mechanism)), a.extra = {
          ...a.extra,
          arguments: o
        }, a)), Vi(s);
      }), s;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  yi(r, e), re(e, "__sentry_wrapped__", r);
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
function ho() {
  const e = Gn(), { referrer: t } = I.document || {}, { userAgent: n } = I.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function _o(e, t) {
  const n = yo(e, t), r = {
    type: If(t),
    value: Rf(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function Ef(e, t, n, r) {
  const s = w()?.getOptions().normalizeDepth, i = Nf(t), a = {
    __serialized__: Hi(t, s)
  };
  if (i)
    return {
      exception: {
        values: [_o(e, i)]
      },
      extra: a
    };
  const c = {
    exception: {
      values: [
        {
          type: Fn(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: Of(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: a
  };
  if (n) {
    const u = yo(e, n);
    u.length && (c.exception.values[0].stacktrace = { frames: u });
  }
  return c;
}
function lr(e, t) {
  return {
    exception: {
      values: [_o(e, t)]
    }
  };
}
function yo(e, t) {
  const n = t.stacktrace || t.stack || "", r = bf(t), o = vf(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const Tf = /Minified React error #\d+;/i;
function bf(e) {
  return e && Tf.test(e.message) ? 1 : 0;
}
function vf(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function Ea(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function If(e) {
  const t = e?.name;
  return !t && Ea(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function Rf(e) {
  const t = e?.message;
  return Ea(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function wf(e, t, n, r) {
  const o = n?.syntheticException || void 0, s = So(e, t, o, r);
  return _t(s), s.level = "error", n?.event_id && (s.event_id = n.event_id), jn(s);
}
function Af(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0, i = Hr(e, t, s, o);
  return i.level = n, r?.event_id && (i.event_id = r.event_id), jn(i);
}
function So(e, t, n, r, o) {
  let s;
  if (mi(t) && t.error)
    return lr(e, t.error);
  if (Ko(t) || qc(t)) {
    const i = t;
    if ("stack" in t)
      s = lr(e, t);
    else {
      const a = i.name || (Ko(i) ? "DOMError" : "DOMException"), c = i.message ? `${a}: ${i.message}` : a;
      s = Hr(e, c, n, r), Dr(s, c);
    }
    return "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }), s;
  }
  return $n(t) ? lr(e, t) : xt(t) || Fn(t) ? (s = Ef(e, t, n, o), _t(s, {
    synthetic: !0
  }), s) : (s = Hr(e, t, n, r), Dr(s, `${t}`), _t(s, {
    synthetic: !0
  }), s);
}
function Hr(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = yo(e, n);
    s.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: s } }]
    }), _t(o, { synthetic: !0 });
  }
  if (Bn(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return o.logentry = {
      message: s,
      params: i
    }, o;
  }
  return o.message = t, o;
}
function Of(e, { isUnhandledRejection: t }) {
  const n = Jc(e), r = t ? "promise rejection" : "exception";
  return mi(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : Fn(e) ? `Event \`${Df(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function Df(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function Nf(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class Yn extends ad {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = kf(t), r = I.SENTRY_SDK_SOURCE || yf();
    Id(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: s, enableLogs: i, _experiments: a } = this._options;
    I.document && (s || i || a?.enableMetrics) && I.document.addEventListener("visibilitychange", () => {
      I.document.visibilityState === "hidden" && (s && this._flushOutcomes(), i && fo(this), a?.enableMetrics && na(this));
    }), o && this.on("beforeSendSession", vd);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return wf(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return Af(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function kf(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : I.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const Vt = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, E = v, Cf = (e, t) => e > t[1] ? "poor" : e > t[0] ? "needs-improvement" : "good", Jt = (e, t, n, r) => {
  let o, s;
  return (i) => {
    t.value >= 0 && (i || r) && (s = t.value - (o ?? 0), (s || o === void 0) && (o = t.value, t.delta = s, t.rating = Cf(t.value, n), e(t)));
  };
}, Pf = () => `v5-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`, Xt = (e = !0) => {
  const t = E.performance?.getEntriesByType?.("navigation")[0];
  if (
    // sentry-specific change:
    // We don't want to check for responseStart for our own use of `getNavigationEntry`
    !e || t && t.responseStart > 0 && t.responseStart < performance.now()
  )
    return t;
}, Dt = () => Xt()?.activationStart ?? 0, Zt = (e, t = -1) => {
  const n = Xt();
  let r = "navigate";
  return n && (E.document?.prerendering || Dt() > 0 ? r = "prerender" : E.document?.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), {
    name: e,
    value: t,
    rating: "good",
    // If needed, will be updated when reported. `const` to keep the type from widening to `string`.
    delta: 0,
    entries: [],
    id: Pf(),
    navigationType: r
  };
}, dr = /* @__PURE__ */ new WeakMap();
function Eo(e, t) {
  return dr.get(e) || dr.set(e, new t()), dr.get(e);
}
class Nn {
  constructor() {
    Nn.prototype.__init.call(this), Nn.prototype.__init2.call(this);
  }
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @sentry-internal/sdk/no-class-field-initializers, @typescript-eslint/explicit-member-accessibility
  __init() {
    this._sessionValue = 0;
  }
  // eslint-disable-next-line @sentry-internal/sdk/no-class-field-initializers, @typescript-eslint/explicit-member-accessibility
  __init2() {
    this._sessionEntries = [];
  }
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _processEntry(t) {
    if (t.hadRecentInput) return;
    const n = this._sessionEntries[0], r = this._sessionEntries[this._sessionEntries.length - 1];
    this._sessionValue && n && r && t.startTime - r.startTime < 1e3 && t.startTime - n.startTime < 5e3 ? (this._sessionValue += t.value, this._sessionEntries.push(t)) : (this._sessionValue = t.value, this._sessionEntries = [t]), this._onAfterProcessingUnexpectedShift?.(t);
  }
}
const Nt = (e, t, n = {}) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(e)) {
      const r = new PerformanceObserver((o) => {
        Promise.resolve().then(() => {
          t(o.getEntries());
        });
      });
      return r.observe({ type: e, buffered: !0, ...n }), r;
    }
  } catch {
  }
}, To = (e) => {
  let t = !1;
  return () => {
    t || (e(), t = !0);
  };
};
let Pt = -1;
const Mf = () => E.document?.visibilityState === "hidden" && !E.document?.prerendering ? 0 : 1 / 0, kn = (e) => {
  E.document.visibilityState === "hidden" && Pt > -1 && (Pt = e.type === "visibilitychange" ? e.timeStamp : 0, xf());
}, Lf = () => {
  addEventListener("visibilitychange", kn, !0), addEventListener("prerenderingchange", kn, !0);
}, xf = () => {
  removeEventListener("visibilitychange", kn, !0), removeEventListener("prerenderingchange", kn, !0);
}, bo = () => {
  if (E.document && Pt < 0) {
    const e = Dt();
    Pt = (E.document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((n) => n.name === "hidden" && n.startTime > e)[0]?.startTime) ?? Mf(), Lf();
  }
  return {
    get firstHiddenTime() {
      return Pt;
    }
  };
}, Kn = (e) => {
  E.document?.prerendering ? addEventListener("prerenderingchange", () => e(), !0) : e();
}, Uf = [1800, 3e3], $f = (e, t = {}) => {
  Kn(() => {
    const n = bo(), r = Zt("FCP");
    let o;
    const i = Nt("paint", (a) => {
      for (const c of a)
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < n.firstHiddenTime && (r.value = Math.max(c.startTime - Dt(), 0), r.entries.push(c), o(!0)));
    });
    i && (o = Jt(e, r, Uf, t.reportAllChanges));
  });
}, Bf = [0.1, 0.25], Ff = (e, t = {}) => {
  $f(
    To(() => {
      const n = Zt("CLS", 0);
      let r;
      const o = Eo(t, Nn), s = (a) => {
        for (const c of a)
          o._processEntry(c);
        o._sessionValue > n.value && (n.value = o._sessionValue, n.entries = o._sessionEntries, r());
      }, i = Nt("layout-shift", s);
      i && (r = Jt(e, n, Bf, t.reportAllChanges), E.document?.addEventListener("visibilitychange", () => {
        E.document?.visibilityState === "hidden" && (s(i.takeRecords()), r(!0));
      }), E?.setTimeout?.(r));
    })
  );
};
let Ta = 0, fr = 1 / 0, cn = 0;
const Gf = (e) => {
  e.forEach((t) => {
    t.interactionId && (fr = Math.min(fr, t.interactionId), cn = Math.max(cn, t.interactionId), Ta = cn ? (cn - fr) / 7 + 1 : 0);
  });
};
let jr;
const ba = () => jr ? Ta : performance.interactionCount || 0, Hf = () => {
  "interactionCount" in performance || jr || (jr = Nt("event", Gf, {
    type: "event",
    buffered: !0,
    durationThreshold: 0
  }));
}, pr = 10;
let va = 0;
const jf = () => ba() - va;
class Cn {
  constructor() {
    Cn.prototype.__init.call(this), Cn.prototype.__init2.call(this);
  }
  /**
   * A list of longest interactions on the page (by latency) sorted so the
   * longest one is first. The list is at most MAX_INTERACTIONS_TO_CONSIDER
   * long.
   */
  // eslint-disable-next-line @sentry-internal/sdk/no-class-field-initializers, @typescript-eslint/explicit-member-accessibility
  __init() {
    this._longestInteractionList = [];
  }
  /**
   * A mapping of longest interactions by their interaction ID.
   * This is used for faster lookup.
   */
  // eslint-disable-next-line @sentry-internal/sdk/no-class-field-initializers, @typescript-eslint/explicit-member-accessibility
  __init2() {
    this._longestInteractionMap = /* @__PURE__ */ new Map();
  }
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, jsdoc/require-jsdoc
  _resetInteractions() {
    va = ba(), this._longestInteractionList.length = 0, this._longestInteractionMap.clear();
  }
  /**
   * Returns the estimated p98 longest interaction based on the stored
   * interaction candidates and the interaction count for the current page.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _estimateP98LongestInteraction() {
    const t = Math.min(
      this._longestInteractionList.length - 1,
      Math.floor(jf() / 50)
    );
    return this._longestInteractionList[t];
  }
  /**
   * Takes a performance entry and adds it to the list of worst interactions
   * if its duration is long enough to make it among the worst. If the
   * entry is part of an existing interaction, it is merged and the latency
   * and entries list is updated as needed.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _processEntry(t) {
    if (this._onBeforeProcessingEntry?.(t), !(t.interactionId || t.entryType === "first-input")) return;
    const n = this._longestInteractionList.at(-1);
    let r = this._longestInteractionMap.get(t.interactionId);
    if (r || this._longestInteractionList.length < pr || // If the above conditions are false, `minLongestInteraction` will be set.
    t.duration > n._latency) {
      if (r ? t.duration > r._latency ? (r.entries = [t], r._latency = t.duration) : t.duration === r._latency && t.startTime === r.entries[0].startTime && r.entries.push(t) : (r = {
        id: t.interactionId,
        entries: [t],
        _latency: t.duration
      }, this._longestInteractionMap.set(r.id, r), this._longestInteractionList.push(r)), this._longestInteractionList.sort((o, s) => s._latency - o._latency), this._longestInteractionList.length > pr) {
        const o = this._longestInteractionList.splice(pr);
        for (const s of o)
          this._longestInteractionMap.delete(s.id);
      }
      this._onAfterProcessingINPCandidate?.(r);
    }
  }
}
const vo = (e) => {
  const t = (n) => {
    (n.type === "pagehide" || E.document?.visibilityState === "hidden") && e(n);
  };
  E.document && (addEventListener("visibilitychange", t, !0), addEventListener("pagehide", t, !0));
}, Ia = (e) => {
  const t = E.requestIdleCallback || E.setTimeout;
  E.document?.visibilityState === "hidden" ? e() : (e = To(e), t(e), vo(e));
}, qf = [200, 500], zf = 40, Wf = (e, t = {}) => {
  globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype && Kn(() => {
    Hf();
    const n = Zt("INP");
    let r;
    const o = Eo(t, Cn), s = (a) => {
      Ia(() => {
        for (const u of a)
          o._processEntry(u);
        const c = o._estimateP98LongestInteraction();
        c && c._latency !== n.value && (n.value = c._latency, n.entries = c.entries, r());
      });
    }, i = Nt("event", s, {
      // Event Timing entries have their durations rounded to the nearest 8ms,
      // so a duration of 40ms would be any event that spans 2.5 or more frames
      // at 60Hz. This threshold is chosen to strike a balance between usefulness
      // and performance. Running this callback for any interaction that spans
      // just one or two frames is likely not worth the insight that could be
      // gained.
      durationThreshold: t.durationThreshold ?? zf
    });
    r = Jt(e, n, qf, t.reportAllChanges), i && (i.observe({ type: "first-input", buffered: !0 }), vo(() => {
      s(i.takeRecords()), r(!0);
    }));
  });
};
class Yf {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, jsdoc/require-jsdoc
  _processEntry(t) {
    this._onBeforeProcessingEntry?.(t);
  }
}
const Kf = [2500, 4e3], Vf = (e, t = {}) => {
  Kn(() => {
    const n = bo(), r = Zt("LCP");
    let o;
    const s = Eo(t, Yf), i = (c) => {
      t.reportAllChanges || (c = c.slice(-1));
      for (const u of c)
        s._processEntry(u), u.startTime < n.firstHiddenTime && (r.value = Math.max(u.startTime - Dt(), 0), r.entries = [u], o());
    }, a = Nt("largest-contentful-paint", i);
    if (a) {
      o = Jt(e, r, Kf, t.reportAllChanges);
      const c = To(() => {
        i(a.takeRecords()), a.disconnect(), o(!0);
      });
      for (const u of ["keydown", "click", "visibilitychange"])
        E.document && addEventListener(u, () => Ia(c), {
          capture: !0,
          once: !0
        });
    }
  });
}, Jf = [800, 1800], qr = (e) => {
  E.document?.prerendering ? Kn(() => qr(e)) : E.document?.readyState !== "complete" ? addEventListener("load", () => qr(e), !0) : setTimeout(e);
}, Xf = (e, t = {}) => {
  const n = Zt("TTFB"), r = Jt(e, n, Jf, t.reportAllChanges);
  qr(() => {
    const o = Xt();
    o && (n.value = Math.max(o.responseStart - Dt(), 0), n.entries = [o], r(!0));
  });
}, Mt = {}, Pn = {};
let Ra, wa, Aa, Oa;
function Da(e, t = !1) {
  return Vn("cls", e, ep, Ra, t);
}
function Na(e, t = !1) {
  return Vn("lcp", e, tp, wa, t);
}
function Zf(e) {
  return Vn("ttfb", e, np, Aa);
}
function Qf(e) {
  return Vn("inp", e, rp, Oa);
}
function bt(e, t) {
  return ka(e, t), Pn[e] || (op(e), Pn[e] = !0), Ca(e, t);
}
function Qt(e, t) {
  const n = Mt[e];
  if (n?.length)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        Vt && h.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${Re(r)}
Error:`,
          o
        );
      }
}
function ep() {
  return Ff(
    (e) => {
      Qt("cls", {
        metric: e
      }), Ra = e;
    },
    // We want the callback to be called whenever the CLS value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function tp() {
  return Vf(
    (e) => {
      Qt("lcp", {
        metric: e
      }), wa = e;
    },
    // We want the callback to be called whenever the LCP value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function np() {
  return Xf((e) => {
    Qt("ttfb", {
      metric: e
    }), Aa = e;
  });
}
function rp() {
  return Wf((e) => {
    Qt("inp", {
      metric: e
    }), Oa = e;
  });
}
function Vn(e, t, n, r, o = !1) {
  ka(e, t);
  let s;
  return Pn[e] || (s = n(), Pn[e] = !0), r && t({ metric: r }), Ca(e, t, o ? s : void 0);
}
function op(e) {
  const t = {};
  e === "event" && (t.durationThreshold = 0), Nt(
    e,
    (n) => {
      Qt(e, { entries: n });
    },
    t
  );
}
function ka(e, t) {
  Mt[e] = Mt[e] || [], Mt[e].push(t);
}
function Ca(e, t, n) {
  return () => {
    n && n();
    const r = Mt[e];
    if (!r)
      return;
    const o = r.indexOf(t);
    o !== -1 && r.splice(o, 1);
  };
}
function sp(e) {
  return "duration" in e;
}
function mr(e) {
  return typeof e == "number" && isFinite(e);
}
function Ge(e, t, n, { ...r }) {
  const o = A(e).start_timestamp;
  return o && o > t && typeof e.updateStartTime == "function" && e.updateStartTime(t), co(e, () => {
    const s = Ot({
      startTime: t,
      ...r
    });
    return s && s.end(n), s;
  });
}
function Io(e) {
  const t = w();
  if (!t)
    return;
  const { name: n, transaction: r, attributes: o, startTime: s } = e, { release: i, environment: a, sendDefaultPii: c } = t.getOptions(), l = t.getIntegrationByName("Replay")?.getReplayId(), d = D(), m = d.getUser(), f = m !== void 0 ? m.email || m.id || m.ip_address : void 0;
  let p;
  try {
    p = d.getScopeData().contexts.profile.profile_id;
  } catch {
  }
  const S = {
    release: i,
    environment: a,
    user: f || void 0,
    profile_id: p || void 0,
    replay_id: l || void 0,
    transaction: r,
    // Web vital score calculation relies on the user agent to account for different
    // browsers setting different thresholds for what is considered a good/meh/bad value.
    // For example: Chrome vs. Chrome Mobile
    "user_agent.original": E.navigator?.userAgent,
    // This tells Sentry to infer the IP address from the request
    "client.address": c ? "{{auto}}" : void 0,
    ...o
  };
  return Ot({
    name: n,
    attributes: S,
    startTime: s,
    experimental: {
      standalone: !0
    }
  });
}
function en() {
  return E.addEventListener && E.performance;
}
function k(e) {
  return e / 1e3;
}
function ip(e) {
  let t = "unknown", n = "unknown", r = "";
  for (const o of e) {
    if (o === "/") {
      [t, n] = e.split("/");
      break;
    }
    if (!isNaN(Number(o))) {
      t = r === "h" ? "http" : r, n = e.split(r)[1];
      break;
    }
    r += o;
  }
  return r === e && (t = r), { name: t, version: n };
}
function Pa(e) {
  try {
    return PerformanceObserver.supportedEntryTypes.includes(e);
  } catch {
    return !1;
  }
}
function Ma(e, t) {
  let n, r = !1;
  function o(a) {
    !r && n && t(a, n), r = !0;
  }
  vo(() => {
    o("pagehide");
  });
  const s = e.on("beforeStartNavigationSpan", (a, c) => {
    c?.isRedirect || (o("navigation"), s(), i());
  }), i = e.on("afterStartPageLoadSpan", (a) => {
    n = a.spanContext().spanId, i();
  });
}
function ap(e) {
  let t = 0, n;
  if (!Pa("layout-shift"))
    return;
  const r = Da(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  Ma(e, (o, s) => {
    cp(t, n, s, o), r();
  });
}
function cp(e, t, n, r) {
  Vt && h.log(`Sending CLS span (${e})`);
  const o = t ? k((se() || 0) + t.startTime) : x(), s = D().getScopeData().transactionName, i = t ? _e(t.sources[0]?.node) : "Layout shift", a = {
    [C]: "auto.http.browser.cls",
    [Oe]: "ui.webvital.cls",
    [At]: 0,
    // attach the pageload span id to the CLS span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t?.sources && t.sources.forEach((u, l) => {
    a[`cls.source.${l + 1}`] = _e(u.node);
  });
  const c = Io({
    name: i,
    transaction: s,
    attributes: a,
    startTime: o
  });
  c && (c.addEvent("cls", {
    [Wt]: "",
    [Yt]: e
  }), c.end(o));
}
function up(e) {
  let t = 0, n;
  if (!Pa("largest-contentful-paint"))
    return;
  const r = Na(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  Ma(e, (o, s) => {
    lp(t, n, s, o), r();
  });
}
function lp(e, t, n, r) {
  Vt && h.log(`Sending LCP span (${e})`);
  const o = k((se() || 0) + (t?.startTime || 0)), s = D().getScopeData().transactionName, i = t ? _e(t.element) : "Largest contentful paint", a = {
    [C]: "auto.http.browser.lcp",
    [Oe]: "ui.webvital.lcp",
    [At]: 0,
    // LCP is a point-in-time metric
    // attach the pageload span id to the LCP span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t && (t.element && (a["lcp.element"] = _e(t.element)), t.id && (a["lcp.id"] = t.id), t.url && (a["lcp.url"] = t.url.trim().slice(0, 200)), t.loadTime != null && (a["lcp.loadTime"] = t.loadTime), t.renderTime != null && (a["lcp.renderTime"] = t.renderTime), t.size != null && (a["lcp.size"] = t.size));
  const c = Io({
    name: i,
    transaction: s,
    attributes: a,
    startTime: o
  });
  c && (c.addEvent("lcp", {
    [Wt]: "millisecond",
    [Yt]: e
  }), c.end(o));
}
function ie(e) {
  return e && ((se() || performance.timeOrigin) + e) / 1e3;
}
function La(e) {
  const t = {};
  if (e.nextHopProtocol != null) {
    const { name: n, version: r } = ip(e.nextHopProtocol);
    t["network.protocol.version"] = r, t["network.protocol.name"] = n;
  }
  return se() || en()?.timeOrigin ? dp({
    ...t,
    "http.request.redirect_start": ie(e.redirectStart),
    "http.request.redirect_end": ie(e.redirectEnd),
    "http.request.worker_start": ie(e.workerStart),
    "http.request.fetch_start": ie(e.fetchStart),
    "http.request.domain_lookup_start": ie(e.domainLookupStart),
    "http.request.domain_lookup_end": ie(e.domainLookupEnd),
    "http.request.connect_start": ie(e.connectStart),
    "http.request.secure_connection_start": ie(e.secureConnectionStart),
    "http.request.connection_end": ie(e.connectEnd),
    "http.request.request_start": ie(e.requestStart),
    "http.request.response_start": ie(e.responseStart),
    "http.request.response_end": ie(e.responseEnd),
    // For TTFB we actually want the relative time from timeOrigin to responseStart
    // This way, TTFB always measures the "first page load" experience.
    // see: https://web.dev/articles/ttfb#measure-resource-requests
    "http.request.time_to_first_byte": e.responseStart != null ? e.responseStart / 1e3 : void 0
  }) : t;
}
function dp(e) {
  return Object.fromEntries(Object.entries(e).filter(([, t]) => t != null));
}
const fp = 2147483647;
let Us = 0, de = {}, Z, Mn;
function pp({
  recordClsStandaloneSpans: e,
  recordLcpStandaloneSpans: t,
  client: n
}) {
  const r = en();
  if (r && se()) {
    r.mark && E.performance.mark("sentry-tracing-init");
    const o = t ? up(n) : yp(), s = Sp(), i = e ? ap(n) : _p();
    return () => {
      o?.(), s(), i?.();
    };
  }
  return () => {
  };
}
function mp() {
  bt("longtask", ({ entries: e }) => {
    const t = Q();
    if (!t)
      return;
    const { op: n, start_timestamp: r } = A(t);
    for (const o of e) {
      const s = k(se() + o.startTime), i = k(o.duration);
      n === "navigation" && r && s < r || Ge(t, s, s + i, {
        name: "Main UI thread blocked",
        op: "ui.long-task",
        attributes: {
          [C]: "auto.ui.browser.metrics"
        }
      });
    }
  });
}
function gp() {
  new PerformanceObserver((t) => {
    const n = Q();
    if (n)
      for (const r of t.getEntries()) {
        if (!r.scripts[0])
          continue;
        const o = k(se() + r.startTime), { start_timestamp: s, op: i } = A(n);
        if (i === "navigation" && s && o < s)
          continue;
        const a = k(r.duration), c = {
          [C]: "auto.ui.browser.metrics"
        }, u = r.scripts[0], { invoker: l, invokerType: d, sourceURL: m, sourceFunctionName: f, sourceCharPosition: p } = u;
        c["browser.script.invoker"] = l, c["browser.script.invoker_type"] = d, m && (c["code.filepath"] = m), f && (c["code.function"] = f), p !== -1 && (c["browser.script.source_char_position"] = p), Ge(n, o, o + a, {
          name: "Main UI thread blocked",
          op: "ui.long-animation-frame",
          attributes: c
        });
      }
  }).observe({ type: "long-animation-frame", buffered: !0 });
}
function hp() {
  bt("event", ({ entries: e }) => {
    const t = Q();
    if (t) {
      for (const n of e)
        if (n.name === "click") {
          const r = k(se() + n.startTime), o = k(n.duration), s = {
            name: _e(n.target),
            op: `ui.interaction.${n.name}`,
            startTime: r,
            attributes: {
              [C]: "auto.ui.browser.metrics"
            }
          }, i = _i(n.target);
          i && (s.attributes["ui.component_name"] = i), Ge(t, r, r + o, s);
        }
    }
  });
}
function _p() {
  return Da(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (de.cls = { value: e.value, unit: "" }, Mn = t);
  }, !0);
}
function yp() {
  return Na(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (de.lcp = { value: e.value, unit: "millisecond" }, Z = t);
  }, !0);
}
function Sp() {
  return Zf(({ metric: e }) => {
    e.entries[e.entries.length - 1] && (de.ttfb = { value: e.value, unit: "millisecond" });
  });
}
function Ep(e, t) {
  const n = en(), r = se();
  if (!n?.getEntries || !r)
    return;
  const o = k(r), s = n.getEntries(), { op: i, start_timestamp: a } = A(e);
  s.slice(Us).forEach((c) => {
    const u = k(c.startTime), l = k(
      // Inexplicably, Chrome sometimes emits a negative duration. We need to work around this.
      // There is a SO post attempting to explain this, but it leaves one with open questions: https://stackoverflow.com/questions/23191918/peformance-getentries-and-negative-duration-display
      // The way we clamp the value is probably not accurate, since we have observed this happen for things that may take a while to load, like for example the replay worker.
      // TODO: Investigate why this happens and how to properly mitigate. For now, this is a workaround to prevent transactions being dropped due to negative duration spans.
      Math.max(0, c.duration)
    );
    if (!(i === "navigation" && a && o + u < a))
      switch (c.entryType) {
        case "navigation": {
          Ip(e, c, o);
          break;
        }
        case "mark":
        case "paint":
        case "measure": {
          bp(e, c, u, l, o, t.ignorePerformanceApiSpans);
          const d = bo(), m = c.startTime < d.firstHiddenTime;
          c.name === "first-paint" && m && (de.fp = { value: c.startTime, unit: "millisecond" }), c.name === "first-contentful-paint" && m && (de.fcp = { value: c.startTime, unit: "millisecond" });
          break;
        }
        case "resource": {
          Ap(
            e,
            c,
            c.name,
            u,
            l,
            o,
            t.ignoreResourceSpans
          );
          break;
        }
      }
  }), Us = Math.max(s.length - 1, 0), Op(e), i === "pageload" && (kp(de), t.recordClsOnPageloadSpan || delete de.cls, t.recordLcpOnPageloadSpan || delete de.lcp, Object.entries(de).forEach(([c, u]) => {
    il(c, u.value, u.unit);
  }), e.setAttribute("performance.timeOrigin", o), e.setAttribute("performance.activationStart", Dt()), Dp(e, t)), Z = void 0, Mn = void 0, de = {};
}
function Tp(e) {
  if (e?.entryType === "measure")
    try {
      return e.detail.devtools.track === "Components ⚛";
    } catch {
      return;
    }
}
function bp(e, t, n, r, o, s) {
  if (Tp(t) || ["mark", "measure"].includes(t.entryType) && Be(t.name, s))
    return;
  const i = Xt(!1), a = k(i ? i.requestStart : 0), c = o + Math.max(n, a), u = o + n, l = u + r, d = {
    [C]: "auto.resource.browser.metrics"
  };
  c !== u && (d["sentry.browser.measure_happened_before_request"] = !0, d["sentry.browser.measure_start_time"] = c), vp(d, t), c <= l && Ge(e, c, l, {
    name: t.name,
    op: t.entryType,
    attributes: d
  });
}
function vp(e, t) {
  try {
    const n = t.detail;
    if (!n)
      return;
    if (typeof n == "object") {
      for (const [r, o] of Object.entries(n))
        if (o && st(o))
          e[`sentry.browser.measure.detail.${r}`] = o;
        else if (o !== void 0)
          try {
            e[`sentry.browser.measure.detail.${r}`] = JSON.stringify(o);
          } catch {
          }
      return;
    }
    if (st(n)) {
      e["sentry.browser.measure.detail"] = n;
      return;
    }
    try {
      e["sentry.browser.measure.detail"] = JSON.stringify(n);
    } catch {
    }
  } catch {
  }
}
function Ip(e, t, n) {
  ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((r) => {
    un(e, t, r, n);
  }), un(e, t, "secureConnection", n, "TLS/SSL"), un(e, t, "fetch", n, "cache"), un(e, t, "domainLookup", n, "DNS"), wp(e, t, n);
}
function un(e, t, n, r, o = n) {
  const s = Rp(n), i = t[s], a = t[`${n}Start`];
  !a || !i || Ge(e, r + k(a), r + k(i), {
    op: `browser.${o}`,
    name: t.name,
    attributes: {
      [C]: "auto.ui.browser.metrics",
      ...n === "redirect" && t.redirectCount != null ? { "http.redirect_count": t.redirectCount } : {}
    }
  });
}
function Rp(e) {
  return e === "secureConnection" ? "connectEnd" : e === "fetch" ? "domainLookupStart" : `${e}End`;
}
function wp(e, t, n) {
  const r = n + k(t.requestStart), o = n + k(t.responseEnd), s = n + k(t.responseStart);
  t.responseEnd && (Ge(e, r, o, {
    op: "browser.request",
    name: t.name,
    attributes: {
      [C]: "auto.ui.browser.metrics"
    }
  }), Ge(e, s, o, {
    op: "browser.response",
    name: t.name,
    attributes: {
      [C]: "auto.ui.browser.metrics"
    }
  }));
}
function Ap(e, t, n, r, o, s, i) {
  if (t.initiatorType === "xmlhttprequest" || t.initiatorType === "fetch")
    return;
  const a = t.initiatorType ? `resource.${t.initiatorType}` : "resource.other";
  if (i?.includes(a))
    return;
  const c = {
    [C]: "auto.resource.browser.metrics"
  }, u = rt(n);
  u.protocol && (c["url.scheme"] = u.protocol.split(":").pop()), u.host && (c["server.address"] = u.host), c["url.same_origin"] = n.includes(E.location.origin), Np(t, c, [
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/responseStatus
    ["responseStatus", "http.response.status_code"],
    ["transferSize", "http.response_transfer_size"],
    ["encodedBodySize", "http.response_content_length"],
    ["decodedBodySize", "http.decoded_response_content_length"],
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/renderBlockingStatus
    ["renderBlockingStatus", "resource.render_blocking_status"],
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/deliveryType
    ["deliveryType", "http.response_delivery_type"]
  ]);
  const l = { ...c, ...La(t) }, d = s + r, m = d + o;
  Ge(e, d, m, {
    name: n.replace(E.location.origin, ""),
    op: a,
    attributes: l
  });
}
function Op(e) {
  const t = E.navigator;
  if (!t)
    return;
  const n = t.connection;
  n && (n.effectiveType && e.setAttribute("effectiveConnectionType", n.effectiveType), n.type && e.setAttribute("connectionType", n.type), mr(n.rtt) && (de["connection.rtt"] = { value: n.rtt, unit: "millisecond" })), mr(t.deviceMemory) && e.setAttribute("deviceMemory", `${t.deviceMemory} GB`), mr(t.hardwareConcurrency) && e.setAttribute("hardwareConcurrency", String(t.hardwareConcurrency));
}
function Dp(e, t) {
  Z && t.recordLcpOnPageloadSpan && (Z.element && e.setAttribute("lcp.element", _e(Z.element)), Z.id && e.setAttribute("lcp.id", Z.id), Z.url && e.setAttribute("lcp.url", Z.url.trim().slice(0, 200)), Z.loadTime != null && e.setAttribute("lcp.loadTime", Z.loadTime), Z.renderTime != null && e.setAttribute("lcp.renderTime", Z.renderTime), e.setAttribute("lcp.size", Z.size)), Mn?.sources && t.recordClsOnPageloadSpan && Mn.sources.forEach(
    (n, r) => e.setAttribute(`cls.source.${r + 1}`, _e(n.node))
  );
}
function Np(e, t, n) {
  n.forEach(([r, o]) => {
    const s = e[r];
    s != null && (typeof s == "number" && s < fp || typeof s == "string") && (t[o] = s);
  });
}
function kp(e) {
  const t = Xt(!1);
  if (!t)
    return;
  const { responseStart: n, requestStart: r } = t;
  r <= n && (e["ttfb.requestTime"] = {
    value: n - r,
    unit: "millisecond"
  });
}
function Cp() {
  return en() && se() ? bt("element", Pp) : () => {
  };
}
const Pp = ({ entries: e }) => {
  const t = Q(), n = t ? W(t) : void 0, r = n ? A(n).description : D().getScopeData().transactionName;
  e.forEach((o) => {
    const s = o;
    if (!s.identifier)
      return;
    const i = s.name, a = s.renderTime, c = s.loadTime, [u, l] = c ? [k(c), "load-time"] : a ? [k(a), "render-time"] : [x(), "entry-emission"], d = i === "image-paint" ? (
      // for image paints, we can acually get a duration because image-paint entries also have a `loadTime`
      // and `renderTime`. `loadTime` is the time when the image finished loading and `renderTime` is the
      // time when the image finished rendering.
      k(Math.max(0, (a ?? 0) - (c ?? 0)))
    ) : (
      // for `'text-paint'` entries, we can't get a duration because the `loadTime` is always zero.
      0
    ), m = {
      [C]: "auto.ui.browser.elementtiming",
      [Oe]: "ui.elementtiming",
      // name must be user-entered, so we can assume low cardinality
      [he]: "component",
      // recording the source of the span start time, as it varies depending on available data
      "sentry.span_start_time_source": l,
      "sentry.transaction_name": r,
      "element.id": s.id,
      "element.type": s.element?.tagName?.toLowerCase() || "unknown",
      "element.size": s.naturalWidth && s.naturalHeight ? `${s.naturalWidth}x${s.naturalHeight}` : void 0,
      "element.render_time": a,
      "element.load_time": c,
      // `url` is `0`(number) for text paints (hence we fall back to undefined)
      "element.url": s.url || void 0,
      "element.identifier": s.identifier,
      "element.paint_type": i
    };
    Kt(
      {
        name: `element[${s.identifier}]`,
        attributes: m,
        startTime: u,
        onlyIfParent: !0
      },
      (f) => {
        f.end(u + d);
      }
    );
  });
}, Mp = 1e3;
let $s, zr, Wr;
function Lp(e) {
  const t = "dom";
  He(t, e), je(t, xp);
}
function xp() {
  if (!E.document)
    return;
  const e = ae.bind(null, "dom"), t = Bs(e, !0);
  E.document.addEventListener("click", t, !1), E.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = E[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (ne(o, "addEventListener", function(s) {
      return function(i, a, c) {
        if (i === "click" || i == "keypress")
          try {
            const u = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, l = u[i] = u[i] || { refCount: 0 };
            if (!l.handler) {
              const d = Bs(e);
              l.handler = d, s.call(this, i, d, c);
            }
            l.refCount++;
          } catch {
          }
        return s.call(this, i, a, c);
      };
    }), ne(
      o,
      "removeEventListener",
      function(s) {
        return function(i, a, c) {
          if (i === "click" || i == "keypress")
            try {
              const u = this.__sentry_instrumentation_handlers__ || {}, l = u[i];
              l && (l.refCount--, l.refCount <= 0 && (s.call(this, i, l.handler, c), l.handler = void 0, delete u[i]), Object.keys(u).length === 0 && delete this.__sentry_instrumentation_handlers__);
            } catch {
            }
          return s.call(this, i, a, c);
        };
      }
    ));
  });
}
function Up(e) {
  if (e.type !== zr)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== Wr)
      return !1;
  } catch {
  }
  return !0;
}
function $p(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function Bs(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = Bp(n);
    if ($p(n.type, r))
      return;
    re(n, "_sentryCaptured", !0), r && !r._sentryId && re(r, "_sentryId", ce());
    const o = n.type === "keypress" ? "input" : n.type;
    Up(n) || (e({ event: n, name: o, global: t }), zr = n.type, Wr = r ? r._sentryId : void 0), clearTimeout($s), $s = E.setTimeout(() => {
      Wr = void 0, zr = void 0;
    }, Mp);
  };
}
function Bp(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let ln;
function Ro(e) {
  const t = "history";
  He(t, e), je(t, Fp);
}
function Fp() {
  if (E.addEventListener("popstate", () => {
    const t = E.location.href, n = ln;
    if (ln = t, n === t)
      return;
    ae("history", { from: n, to: t });
  }), !lf())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = ln, s = Gp(String(r));
        if (ln = s, o === s)
          return t.apply(this, n);
        ae("history", { from: o, to: s });
      }
      return t.apply(this, n);
    };
  }
  ne(E.history, "pushState", e), ne(E.history, "replaceState", e);
}
function Gp(e) {
  try {
    return new URL(e, E.location.origin).toString();
  } catch {
    return e;
  }
}
const Sn = {};
function Hp(e) {
  const t = Sn[e];
  if (t)
    return t;
  let n = E[e];
  if (Br(n))
    return Sn[e] = n.bind(E);
  const r = E.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      o.hidden = !0, r.head.appendChild(o);
      const s = o.contentWindow;
      s?.[e] && (n = s[e]), r.head.removeChild(o);
    } catch (o) {
      Vt && h.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, o);
    }
  return n && (Sn[e] = n.bind(E));
}
function jp(e) {
  Sn[e] = void 0;
}
const mt = "__sentry_xhr_v3__";
function xa(e) {
  const t = "xhr";
  He(t, e), je(t, qp);
}
function qp() {
  if (!E.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), s = x() * 1e3, i = ve(r[0]) ? r[0].toUpperCase() : void 0, a = zp(r[1]);
      if (!i || !a)
        return t.apply(n, r);
      n[mt] = {
        method: i,
        url: a,
        request_headers: {}
      }, i === "POST" && a.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const c = () => {
        const u = n[mt];
        if (u && n.readyState === 4) {
          try {
            u.status_code = n.status;
          } catch {
          }
          const l = {
            endTimestamp: x() * 1e3,
            startTimestamp: s,
            xhr: n,
            virtualError: o
          };
          ae("xhr", l);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(u, l, d) {
          return c(), u.apply(l, d);
        }
      }) : n.addEventListener("readystatechange", c), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(u, l, d) {
          const [m, f] = d, p = l[mt];
          return p && ve(m) && ve(f) && (p.request_headers[m.toLowerCase()] = f), u.apply(l, d);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[mt];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const s = {
        startTimestamp: x() * 1e3,
        xhr: n
      };
      return ae("xhr", s), t.apply(n, r);
    }
  });
}
function zp(e) {
  if (ve(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function Wp(e) {
  let t;
  try {
    t = e.getAllResponseHeaders();
  } catch (n) {
    return Vt && h.error(n, "Failed to get xhr response headers", e), {};
  }
  return t ? t.split(`\r
`).reduce((n, r) => {
    const [o, s] = r.split(": ");
    return s && (n[o.toLowerCase()] = s), n;
  }, {}) : {};
}
const gr = [], En = /* @__PURE__ */ new Map(), Yp = 60;
function Kp() {
  if (en() && se()) {
    const t = Vp();
    return () => {
      t();
    };
  }
  return () => {
  };
}
const Fs = {
  click: "click",
  pointerdown: "click",
  pointerup: "click",
  mousedown: "click",
  mouseup: "click",
  touchstart: "click",
  touchend: "click",
  mouseover: "hover",
  mouseout: "hover",
  mouseenter: "hover",
  mouseleave: "hover",
  pointerover: "hover",
  pointerout: "hover",
  pointerenter: "hover",
  pointerleave: "hover",
  dragstart: "drag",
  dragend: "drag",
  drag: "drag",
  dragenter: "drag",
  dragleave: "drag",
  dragover: "drag",
  drop: "drag",
  keydown: "press",
  keyup: "press",
  keypress: "press",
  input: "press"
};
function Vp() {
  return Qf(Jp);
}
const Jp = ({ metric: e }) => {
  if (e.value == null)
    return;
  const t = k(e.value);
  if (t > Yp)
    return;
  const n = e.entries.find((p) => p.duration === e.value && Fs[p.name]);
  if (!n)
    return;
  const { interactionId: r } = n, o = Fs[n.name], s = k(se() + n.startTime), i = Q(), a = i ? W(i) : void 0, u = (r != null ? En.get(r) : void 0) || a, l = u ? A(u).description : D().getScopeData().transactionName, d = _e(n.target), m = {
    [C]: "auto.http.browser.inp",
    [Oe]: `ui.interaction.${o}`,
    [At]: n.duration
  }, f = Io({
    name: d,
    transaction: l,
    attributes: m,
    startTime: s
  });
  f && (f.addEvent("inp", {
    [Wt]: "millisecond",
    [Yt]: e.value
  }), f.end(s + t));
};
function Xp() {
  const e = ({ entries: t }) => {
    const n = Q(), r = n && W(n);
    t.forEach((o) => {
      if (!sp(o) || !r)
        return;
      const s = o.interactionId;
      if (s != null && !En.has(s)) {
        if (gr.length > 10) {
          const i = gr.shift();
          En.delete(i);
        }
        gr.push(s), En.set(s, r);
      }
    });
  };
  bt("event", e), bt("first-input", e);
}
function Jn(e, t = Hp("fetch")) {
  let n = 0, r = 0;
  async function o(s) {
    const i = s.body.length;
    n += i, r++;
    const a = {
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
      const c = await t(e.url, a);
      return {
        statusCode: c.status,
        headers: {
          "x-sentry-rate-limits": c.headers.get("X-Sentry-Rate-Limits"),
          "retry-after": c.headers.get("Retry-After")
        }
      };
    } catch (c) {
      throw jp("fetch"), c;
    } finally {
      n -= i, r--;
    }
  }
  return Sd(e, o);
}
const Zp = 30, Qp = 50;
function Yr(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? ot : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const em = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, tm = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, nm = /\((\S*)(?::(\d+))(?::(\d+))\)/, rm = /at (.+?) ?\(data:(.+?),/, om = (e) => {
  const t = e.match(rm);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = em.exec(e);
  if (n) {
    const [, o, s, i] = n;
    return Yr(o, ot, +s, +i);
  }
  const r = tm.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const a = nm.exec(r[2]);
      a && (r[2] = a[1], r[3] = a[2], r[4] = a[3]);
    }
    const [s, i] = Ua(r[1] || ot, r[2]);
    return Yr(i, s, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, sm = [Zp, om], im = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, am = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, cm = (e) => {
  const t = im.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const s = am.exec(t[3]);
      s && (t[1] = t[1] || "eval", t[3] = s[1], t[4] = s[2], t[5] = "");
    }
    let r = t[3], o = t[1] || ot;
    return [o, r] = Ua(o, r), Yr(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, um = [Qp, cm], lm = [sm, um], Xn = Fc(...lm), Ua = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : ot,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, oe = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, dn = 1024, dm = "Breadcrumbs", fm = (e = {}) => {
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
    name: dm,
    setup(n) {
      t.console && pa(hm(n)), t.dom && Lp(gm(n, t.dom)), t.xhr && xa(_m(n)), t.fetch && _a(ym(n)), t.history && Ro(Sm(n)), t.sentry && n.on("beforeSendEvent", mm(n));
    }
  };
}, pm = fm;
function mm(e) {
  return function(n) {
    w() === e && it(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: Ze(n)
      },
      {
        event: n
      }
    );
  };
}
function gm(e, t) {
  return function(r) {
    if (w() !== e)
      return;
    let o, s, i = typeof t == "object" ? t.serializeAttribute : void 0, a = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    a && a > dn && (oe && h.warn(
      `\`dom.maxStringLength\` cannot exceed ${dn}, but a value of ${a} was configured. Sentry will use ${dn} instead.`
    ), a = dn), typeof i == "string" && (i = [i]);
    try {
      const u = r.event, l = Em(u) ? u.target : u;
      o = _e(l, { keyAttrs: i, maxStringLength: a }), s = _i(l);
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0)
      return;
    const c = {
      category: `ui.${r.name}`,
      message: o
    };
    s && (c.data = { "ui.component_name": s }), it(c, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function hm(e) {
  return function(n) {
    if (w() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: qd(n.level),
      message: Vo(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${Vo(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    it(r, {
      input: n.args,
      level: n.level
    });
  };
}
function _m(e) {
  return function(n) {
    if (w() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, s = n.xhr[mt];
    if (!r || !o || !s)
      return;
    const { method: i, url: a, status_code: c, body: u } = s, l = {
      method: i,
      url: a,
      status_code: c
    }, d = {
      xhr: n.xhr,
      input: u,
      startTimestamp: r,
      endTimestamp: o
    }, m = {
      category: "xhr",
      data: l,
      type: "http",
      level: ha(c)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", m, d), it(m, d);
  };
}
function ym(e) {
  return function(n) {
    if (w() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n;
    if (o && !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === "POST"))
      if (n.fetchData.method, n.fetchData.url, n.error) {
        const s = n.fetchData, i = {
          data: n.error,
          input: n.args,
          startTimestamp: r,
          endTimestamp: o
        }, a = {
          category: "fetch",
          data: s,
          level: "error",
          type: "http"
        };
        e.emit("beforeOutgoingRequestBreadcrumb", a, i), it(a, i);
      } else {
        const s = n.response, i = {
          ...n.fetchData,
          status_code: s?.status
        };
        n.fetchData.request_body_size, n.fetchData.response_body_size, s?.status;
        const a = {
          input: n.args,
          response: s,
          startTimestamp: r,
          endTimestamp: o
        }, c = {
          category: "fetch",
          data: i,
          type: "http",
          level: ha(i.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", c, a), it(c, a);
      }
  };
}
function Sm(e) {
  return function(n) {
    if (w() !== e)
      return;
    let r = n.from, o = n.to;
    const s = rt(I.location.href);
    let i = r ? rt(r) : void 0;
    const a = rt(o);
    i?.path || (i = s), s.protocol === a.protocol && s.host === a.host && (o = a.relative), s.protocol === i.protocol && s.host === i.host && (r = i.relative), it({
      category: "navigation",
      data: {
        from: r,
        to: o
      }
    });
  };
}
function Em(e) {
  return !!e && !!e.target;
}
const Tm = [
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
], bm = "BrowserApiErrors", vm = (e = {}) => {
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
    name: bm,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && ne(I, "setTimeout", Gs), t.setInterval && ne(I, "setInterval", Gs), t.requestAnimationFrame && ne(I, "requestAnimationFrame", Rm), t.XMLHttpRequest && "XMLHttpRequest" in I && ne(XMLHttpRequest.prototype, "send", wm);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : Tm).forEach((o) => Am(o, t));
    }
  };
}, Im = vm;
function Gs(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = Tt(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${Re(e)}`
      }
    }), e.apply(this, t);
  };
}
function Rm(e) {
  return function(t) {
    return e.apply(this, [
      Tt(t, {
        mechanism: {
          data: {
            handler: Re(e)
          },
          handled: !1,
          type: "auto.browser.browserapierrors.requestAnimationFrame"
        }
      })
    ]);
  };
}
function wm(e) {
  return function(...t) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
      o in n && typeof n[o] == "function" && ne(n, o, function(s) {
        const i = {
          mechanism: {
            data: {
              handler: Re(s)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${o}`
          }
        }, a = to(s);
        return a && (i.mechanism.data.handler = Re(a)), Tt(s, i);
      });
    }), e.apply(this, t);
  };
}
function Am(e, t) {
  const r = I[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (ne(r, "addEventListener", function(o) {
    return function(s, i, a) {
      try {
        Om(i) && (i.handleEvent = Tt(i.handleEvent, {
          mechanism: {
            data: {
              handler: Re(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return t.unregisterOriginalCallbacks && Dm(this, s, i), o.apply(this, [
        s,
        Tt(i, {
          mechanism: {
            data: {
              handler: Re(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        a
      ]);
    };
  }), ne(r, "removeEventListener", function(o) {
    return function(s, i, a) {
      try {
        const c = i.__sentry_wrapped__;
        c && o.call(this, s, c, a);
      } catch {
      }
      return o.call(this, s, i, a);
    };
  }));
}
function Om(e) {
  return typeof e.handleEvent == "function";
}
function Dm(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const Nm = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof I.document > "u") {
      oe && h.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    ys({ ignoreDuration: !0 }), Ss(), Ro(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (ys({ ignoreDuration: !0 }), Ss());
    });
  }
}), km = "GlobalHandlers", Cm = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: km,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (Mm(n), Hs("onerror")), t.onunhandledrejection && (Lm(n), Hs("onunhandledrejection"));
    }
  };
}, Pm = Cm;
function Mm(e) {
  di((t) => {
    const { stackParser: n, attachStacktrace: r } = $a();
    if (w() !== e || Sa())
      return;
    const { msg: o, url: s, line: i, column: a, error: c } = t, u = $m(
      So(n, c || o, void 0, r, !1),
      s,
      i,
      a
    );
    u.level = "error", Ji(u, {
      originalException: c,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function Lm(e) {
  fi((t) => {
    const { stackParser: n, attachStacktrace: r } = $a();
    if (w() !== e || Sa())
      return;
    const o = xm(t), s = st(o) ? Um(o) : So(n, o, void 0, r, !0);
    s.level = "error", Ji(s, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function xm(e) {
  if (st(e))
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
function Um(e) {
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
function $m(e, t, n, r) {
  const o = e.exception = e.exception || {}, s = o.values = o.values || [], i = s[0] = s[0] || {}, a = i.stacktrace = i.stacktrace || {}, c = a.frames = a.frames || [], u = r, l = n, d = Bm(t) ?? Gn();
  return c.length === 0 && c.push({
    colno: u,
    filename: d,
    function: ot,
    in_app: !0,
    lineno: l
  }), e;
}
function Hs(e) {
  oe && h.log(`Global Handler attached: ${e}`);
}
function $a() {
  return w()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function Bm(e) {
  if (!(!ve(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const Fm = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!I.navigator && !I.location && !I.document)
      return;
    const t = ho(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), Gm = "cause", Hm = 5, jm = "LinkedErrors", qm = (e = {}) => {
  const t = e.limit || Hm, n = e.key || Gm;
  return {
    name: jm,
    preprocessEvent(r, o, s) {
      const i = s.getOptions();
      Hd(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        _o,
        i.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, zm = qm;
function Zn(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    Md(),
    Nd(),
    Im(),
    pm(),
    Pm(),
    zm(),
    Yd(),
    Fm(),
    Nm()
  ];
}
function js(e = {}) {
  const t = I.document, n = t?.head || t?.body;
  if (!n) {
    oe && h.error("[showReportDialog] Global document not defined");
    return;
  }
  const r = D(), s = w()?.getDsn();
  if (!s) {
    oe && h.error("[showReportDialog] DSN not configured");
    return;
  }
  const i = {
    ...e,
    user: {
      ...r.getUser(),
      ...e.user
    },
    eventId: e.eventId || $l()
  }, a = I.document.createElement("script");
  a.async = !0, a.crossOrigin = "anonymous", a.src = ql(s, i);
  const { onLoad: c, onClose: u } = i;
  if (c && (a.onload = c), u) {
    const l = (d) => {
      if (d.data === "__sentry_reportdialog_closed__")
        try {
          u();
        } finally {
          I.removeEventListener("message", l);
        }
    };
    I.addEventListener("message", l);
  }
  n.appendChild(a);
}
function Wm(e) {
  return e.split(",").some((t) => t.trim().startsWith("sentry-"));
}
function Ba(e) {
  try {
    return new URL(e, I.location.origin).href;
  } catch {
    return;
  }
}
function Ym(e) {
  return e.entryType === "resource" && "initiatorType" in e && typeof e.nextHopProtocol == "string" && (e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest");
}
function Fa(e) {
  try {
    return new Headers(e);
  } catch {
    return;
  }
}
const qs = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new Map(), Ga = {
  traceFetch: !0,
  traceXHR: !0,
  enableHTTPTimings: !0,
  trackFetchStreamPerformance: !1
};
function Km(e, t) {
  const {
    traceFetch: n,
    traceXHR: r,
    trackFetchStreamPerformance: o,
    shouldCreateSpanForRequest: s,
    enableHTTPTimings: i,
    tracePropagationTargets: a,
    onRequestSpanStart: c,
    onRequestSpanEnd: u
  } = {
    ...Ga,
    ...t
  }, l = typeof s == "function" ? s : (p) => !0, d = (p) => Vm(p, a), m = {}, f = e.getOptions().propagateTraceparent;
  n && (e.addEventProcessor((p) => (p.type === "transaction" && p.spans && p.spans.forEach((S) => {
    if (S.op === "http.client") {
      const y = hr.get(S.span_id);
      y && (S.timestamp = y / 1e3, hr.delete(S.span_id));
    }
  }), p)), o && pf((p) => {
    if (p.response) {
      const S = qs.get(p.response);
      S && p.endTimestamp && hr.set(S, p.endTimestamp);
    }
  }), _a((p) => {
    const S = Xd(p, l, d, m, {
      propagateTraceparent: f,
      onRequestSpanEnd: u
    });
    if (p.response && p.fetchData.__span && qs.set(p.response, p.fetchData.__span), S) {
      const y = Ba(p.fetchData.url), G = y ? rt(y).host : void 0;
      S.setAttributes({
        "http.url": y,
        "server.address": G
      }), i && zs(S), c?.(S, { headers: p.headers });
    }
  })), r && xa((p) => {
    const S = Jm(
      p,
      l,
      d,
      m,
      f,
      u
    );
    S && (i && zs(S), c?.(S, {
      headers: Fa(p.xhr.__sentry_xhr_v3__?.request_headers)
    }));
  });
}
function zs(e) {
  const { url: t } = A(e).data;
  if (!t || typeof t != "string")
    return;
  const n = bt("resource", ({ entries: r }) => {
    r.forEach((o) => {
      Ym(o) && o.name.endsWith(t) && (e.setAttributes(La(o)), setTimeout(n));
    });
  });
}
function Vm(e, t) {
  const n = Gn();
  if (n) {
    let r, o;
    try {
      r = new URL(e, n), o = new URL(n).origin;
    } catch {
      return !1;
    }
    const s = r.origin === o;
    return t ? Be(r.toString(), t) || s && Be(r.pathname, t) : s;
  } else {
    const r = !!e.match(/^\/(?!\/)/);
    return t ? Be(e, t) : r;
  }
}
function Jm(e, t, n, r, o, s) {
  const i = e.xhr, a = i?.[mt];
  if (!i || i.__sentry_own_request__ || !a)
    return;
  const { url: c, method: u } = a, l = fe() && t(c);
  if (e.endTimestamp && l) {
    const G = i.__sentry_xhr_span_id__;
    if (!G) return;
    const q = r[G];
    q && a.status_code !== void 0 && (wi(q, a.status_code), q.end(), s?.(q, {
      headers: Fa(Wp(i)),
      error: e.error
    }), delete r[G]);
    return;
  }
  const d = Ba(c), m = rt(d || c), f = bd(c), p = !!Q(), S = l && p ? Ot({
    name: `${u} ${f}`,
    attributes: {
      url: c,
      type: "xhr",
      "http.method": u,
      "http.url": d,
      "server.address": m?.host,
      [C]: "auto.http.browser",
      [Oe]: "http.client",
      ...m?.search && { "http.query": m?.search },
      ...m?.hash && { "http.fragment": m?.hash }
    }
  }) : new Fe();
  i.__sentry_xhr_span_id__ = S.spanContext().spanId, r[i.__sentry_xhr_span_id__] = S, n(c) && Xm(
    i,
    // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
    // we do not want to use the span as base for the trace headers,
    // which means that the headers will be generated from the scope and the sampling decision is deferred
    fe() && p ? S : void 0,
    o
  );
  const y = w();
  return y && y.emit("beforeOutgoingRequestSpan", S, e), S;
}
function Xm(e, t, n) {
  const { "sentry-trace": r, baggage: o, traceparent: s } = fa({ span: t, propagateTraceparent: n });
  r && Zm(e, r, o, s);
}
function Zm(e, t, n, r) {
  const o = e.__sentry_xhr_v3__?.request_headers;
  if (!(o?.["sentry-trace"] || !e.setRequestHeader))
    try {
      if (e.setRequestHeader("sentry-trace", t), r && !o?.traceparent && e.setRequestHeader("traceparent", r), n) {
        const s = o?.baggage;
        (!s || !Wm(s)) && e.setRequestHeader("baggage", n);
      }
    } catch {
    }
}
function Qm() {
  I.document ? I.document.addEventListener("visibilitychange", () => {
    const e = Q();
    if (!e)
      return;
    const t = W(e);
    if (I.document.hidden && t) {
      const n = "cancelled", { op: r, status: o } = A(t);
      oe && h.log(`[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`), o || t.setStatus({ code: L, message: n }), t.setAttribute("sentry.cancellation_reason", "document.hidden"), t.end();
    }
  }) : oe && h.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
const eg = 3600, Ha = "sentry_previous_trace", tg = "sentry.previous_trace";
function ng(e, {
  linkPreviousTrace: t,
  consistentTraceSampling: n
}) {
  const r = t === "session-storage";
  let o = r ? sg() : void 0;
  e.on("spanStart", (i) => {
    if (W(i) !== i)
      return;
    const a = D().getPropagationContext();
    o = rg(o, i, a), r && og(o);
  });
  let s = !0;
  n && e.on("beforeSampling", (i) => {
    if (!o)
      return;
    const a = D(), c = a.getPropagationContext();
    if (s && c.parentSpanId) {
      s = !1;
      return;
    }
    a.setPropagationContext({
      ...c,
      dsc: {
        ...c.dsc,
        sample_rate: String(o.sampleRate),
        sampled: String(Kr(o.spanContext))
      },
      sampleRand: o.sampleRand
    }), i.parentSampled = Kr(o.spanContext), i.parentSampleRate = o.sampleRate, i.spanAttributes = {
      ...i.spanAttributes,
      [Ii]: o.sampleRate
    };
  });
}
function rg(e, t, n) {
  const r = A(t);
  function o() {
    try {
      return Number(n.dsc?.sample_rate) ?? Number(r.data?.[no]);
    } catch {
      return 0;
    }
  }
  const s = {
    spanContext: t.spanContext(),
    startTimestamp: r.start_timestamp,
    sampleRate: o(),
    sampleRand: n.sampleRand
  };
  if (!e)
    return s;
  const i = e.spanContext;
  return i.traceId === r.trace_id ? e : (Date.now() / 1e3 - e.startTimestamp <= eg && (oe && h.log(
    `Adding previous_trace ${i} link to span ${{
      op: r.op,
      ...t.spanContext()
    }}`
  ), t.addLink({
    context: i,
    attributes: {
      [fu]: "previous_trace"
    }
  }), t.setAttribute(
    tg,
    `${i.traceId}-${i.spanId}-${Kr(i) ? 1 : 0}`
  )), s);
}
function og(e) {
  try {
    I.sessionStorage.setItem(Ha, JSON.stringify(e));
  } catch (t) {
    oe && h.warn("Could not store previous trace in sessionStorage", t);
  }
}
function sg() {
  try {
    const e = I.sessionStorage?.getItem(Ha);
    return JSON.parse(e);
  } catch {
    return;
  }
}
function Kr(e) {
  return e.traceFlags === 1;
}
const ig = "BrowserTracing", ag = {
  ..._n,
  instrumentNavigation: !0,
  instrumentPageLoad: !0,
  markBackgroundSpan: !0,
  enableLongTask: !0,
  enableLongAnimationFrame: !0,
  enableInp: !0,
  enableElementTiming: !0,
  ignoreResourceSpans: [],
  ignorePerformanceApiSpans: [],
  detectRedirects: !0,
  linkPreviousTrace: "in-memory",
  consistentTraceSampling: !1,
  enableReportPageLoaded: !1,
  _experiments: {},
  ...Ga
}, ja = (e = {}) => {
  const t = {
    name: void 0,
    source: void 0
  }, n = I.document, {
    enableInp: r,
    enableElementTiming: o,
    enableLongTask: s,
    enableLongAnimationFrame: i,
    _experiments: { enableInteractions: a, enableStandaloneClsSpans: c, enableStandaloneLcpSpans: u },
    beforeStartSpan: l,
    idleTimeout: d,
    finalTimeout: m,
    childSpanTimeout: f,
    markBackgroundSpan: p,
    traceFetch: S,
    traceXHR: y,
    trackFetchStreamPerformance: G,
    shouldCreateSpanForRequest: q,
    enableHTTPTimings: Ce,
    ignoreResourceSpans: ze,
    ignorePerformanceApiSpans: ft,
    instrumentPageLoad: pt,
    instrumentNavigation: b,
    detectRedirects: P,
    linkPreviousTrace: Pe,
    consistentTraceSampling: ye,
    enableReportPageLoaded: z,
    onRequestSpanStart: Se,
    onRequestSpanEnd: M
  } = {
    ...ag,
    ...e
  };
  let We, Ye, ue;
  function Me(O, H, R = !0) {
    const ee = H.op === "pageload", te = H.name, le = l ? l(H) : H, Ke = le.attributes || {};
    if (te !== le.name && (Ke[he] = "custom", le.attributes = Ke), !R) {
      const Ct = ct();
      Ot({
        ...le,
        startTime: Ct
      }).end(Ct);
      return;
    }
    t.name = le.name, t.source = Ke[he];
    const Ee = Ki(le, {
      idleTimeout: d,
      finalTimeout: m,
      childSpanTimeout: f,
      // should wait for finish signal if it's a pageload transaction
      disableAutoFinish: ee,
      beforeSpanEnd: (Ct) => {
        We?.(), Ep(Ct, {
          recordClsOnPageloadSpan: !c,
          recordLcpOnPageloadSpan: !u,
          ignoreResourceSpans: ze,
          ignorePerformanceApiSpans: ft
        }), Ys(O, void 0);
        const jo = D(), Cc = jo.getPropagationContext();
        jo.setPropagationContext({
          ...Cc,
          traceId: Ee.spanContext().traceId,
          sampled: qe(Ee),
          dsc: De(Ct)
        }), ee && (ue = void 0);
      },
      trimIdleSpanEndTimestamp: !z
    });
    ee && z && (ue = Ee), Ys(O, Ee);
    function Ho() {
      n && ["interactive", "complete"].includes(n.readyState) && O.emit("idleSpanEnableAutoFinish", Ee);
    }
    ee && !z && n && (n.addEventListener("readystatechange", () => {
      Ho();
    }), Ho());
  }
  return {
    name: ig,
    setup(O) {
      if (Bu(), We = pp({
        recordClsStandaloneSpans: c || !1,
        recordLcpStandaloneSpans: u || !1,
        client: O
      }), r && Kp(), o && Cp(), i && v.PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("long-animation-frame") ? gp() : s && mp(), a && hp(), P && n) {
        const R = () => {
          Ye = x();
        };
        addEventListener("click", R, { capture: !0 }), addEventListener("keydown", R, { capture: !0, passive: !0 });
      }
      function H() {
        const R = Ht(O);
        R && !A(R).timestamp && (oe && h.log(`[Tracing] Finishing current active span with op: ${A(R).op}`), R.setAttribute($t, "cancelled"), R.end());
      }
      O.on("startNavigationSpan", (R, ee) => {
        if (w() !== O)
          return;
        if (ee?.isRedirect) {
          oe && h.warn("[Tracing] Detected redirect, navigation span will not be the root span, but a child span."), Me(
            O,
            {
              op: "navigation.redirect",
              ...R
            },
            !1
          );
          return;
        }
        Ye = void 0, H(), Ne().setPropagationContext({
          traceId: Ae(),
          sampleRand: Math.random(),
          propagationSpanId: fe() ? void 0 : Ie()
        });
        const te = D();
        te.setPropagationContext({
          traceId: Ae(),
          sampleRand: Math.random(),
          propagationSpanId: fe() ? void 0 : Ie()
        }), te.setSDKProcessingMetadata({
          normalizedRequest: void 0
        }), Me(O, {
          op: "navigation",
          ...R,
          // Navigation starts a new trace and is NOT parented under any active interaction (e.g. ui.action.click)
          parentSpan: null,
          forceTransaction: !0
        });
      }), O.on("startPageLoadSpan", (R, ee = {}) => {
        if (w() !== O)
          return;
        H();
        const te = ee.sentryTrace || Ws("sentry-trace"), le = ee.baggage || Ws("baggage"), Ke = ku(te, le), Ee = D();
        Ee.setPropagationContext(Ke), fe() || (Ee.getPropagationContext().propagationSpanId = Ie()), Ee.setSDKProcessingMetadata({
          normalizedRequest: ho()
        }), Me(O, {
          op: "pageload",
          ...R
        });
      }), O.on("endPageloadSpan", () => {
        z && ue && (ue.setAttribute($t, "reportPageLoaded"), ue.end());
      });
    },
    afterAllSetup(O) {
      let H = Gn();
      if (Pe !== "off" && ng(O, { linkPreviousTrace: Pe, consistentTraceSampling: ye }), I.location) {
        if (pt) {
          const R = se();
          cg(O, {
            name: I.location.pathname,
            // pageload should always start at timeOrigin (and needs to be in s, not ms)
            startTime: R ? R / 1e3 : void 0,
            attributes: {
              [he]: "url",
              [C]: "auto.pageload.browser"
            }
          });
        }
        b && Ro(({ to: R, from: ee }) => {
          if (ee === void 0 && H?.indexOf(R) !== -1) {
            H = void 0;
            return;
          }
          H = void 0;
          const te = da(R), le = Ht(O), Ke = le && P && dg(le, Ye);
          ug(
            O,
            {
              name: te?.pathname || I.location.pathname,
              attributes: {
                [he]: "url",
                [C]: "auto.navigation.browser"
              }
            },
            { url: R, isRedirect: Ke }
          );
        });
      }
      p && Qm(), a && lg(O, d, m, f, t), r && Xp(), Km(O, {
        traceFetch: S,
        traceXHR: y,
        trackFetchStreamPerformance: G,
        tracePropagationTargets: O.getOptions().tracePropagationTargets,
        shouldCreateSpanForRequest: q,
        enableHTTPTimings: Ce,
        onRequestSpanStart: Se,
        onRequestSpanEnd: M
      });
    }
  };
};
function cg(e, t, n) {
  e.emit("startPageLoadSpan", t, n), D().setTransactionName(t.name);
  const r = Ht(e);
  return r && e.emit("afterStartPageLoadSpan", r), r;
}
function ug(e, t, n) {
  const { url: r, isRedirect: o } = n || {};
  e.emit("beforeStartNavigationSpan", t, { isRedirect: o }), e.emit("startNavigationSpan", t, { isRedirect: o });
  const s = D();
  return s.setTransactionName(t.name), r && !o && s.setSDKProcessingMetadata({
    normalizedRequest: {
      ...ho(),
      url: r
    }
  }), Ht(e);
}
function Ws(e) {
  return I.document?.querySelector(`meta[name=${e}]`)?.getAttribute("content") || void 0;
}
function lg(e, t, n, r, o) {
  const s = I.document;
  let i;
  const a = () => {
    const c = "ui.action.click", u = Ht(e);
    if (u) {
      const l = A(u).op;
      if (["navigation", "pageload"].includes(l)) {
        oe && h.warn(`[Tracing] Did not create ${c} span because a pageload or navigation span is in progress.`);
        return;
      }
    }
    if (i && (i.setAttribute($t, "interactionInterrupted"), i.end(), i = void 0), !o.name) {
      oe && h.warn(`[Tracing] Did not create ${c} transaction because _latestRouteName is missing.`);
      return;
    }
    i = Ki(
      {
        name: o.name,
        op: c,
        attributes: {
          [he]: o.source || "url"
        }
      },
      {
        idleTimeout: t,
        finalTimeout: n,
        childSpanTimeout: r
      }
    );
  };
  s && addEventListener("click", a, { capture: !0 });
}
const qa = "_sentry_idleSpan";
function Ht(e) {
  return e[qa];
}
function Ys(e, t) {
  re(e, qa, t);
}
const Ks = 1.5;
function dg(e, t) {
  const n = A(e), r = ct(), o = n.start_timestamp;
  return !(r - o > Ks || t && r - t <= Ks);
}
const fg = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 }, za = "https://58e161b5578429493e2034e4dadd3f58@o4510270313660416.ingest.us.sentry.io/4510293785640960", Vr = "https://817f965a1b1055130ff59d97bef82e5f@o4510270313660416.ingest.us.sentry.io/4510294325198848", Ln = () => {
  try {
    const e = fg;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t || n)
        return t || n || "production";
    }
  } catch {
  }
  return "production";
}, pg = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (e) {
    console.warn("[Sentry] Could not read manifest version:", e);
  }
  return "1.0.0";
}, jt = () => {
  const e = Ln();
  return {
    environment: e,
    enableLogs: !0,
    tracesSampleRate: e === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: pg(),
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
function Qn(e) {
  return e.filter((t) => {
    const n = t.name || (typeof t == "function" ? t.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const mg = () => ({
  ...jt(),
  sendDefaultPii: !0,
  // Enable PII collection for background worker (safe context)
  initialScope: {
    tags: {
      context: "background",
      type: "service-worker"
    }
  }
}), gg = () => ({
  ...jt(),
  initialScope: {
    tags: {
      context: "popup",
      type: "react-ui"
    }
  }
}), hg = () => ({
  ...jt(),
  initialScope: {
    tags: {
      context: "options",
      type: "react-ui"
    }
  }
}), _g = () => {
  const e = Ln();
  return {
    ...jt(),
    tracesSampleRate: e === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(t) {
      const n = jt().beforeSend?.(t) ?? t;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
};
let Vs = !1, _r = null, yr = null;
function yg() {
  if (Vs && _r && yr)
    return { client: _r, scope: yr };
  try {
    const e = mg(), t = Zn({}), n = Qn(t);
    try {
      const s = go({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new Yn({
      dsn: Vr,
      transport: Jn,
      stackParser: Xn,
      integrations: n,
      ...e
    }), o = new F();
    o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), _r = r, yr = o, Vs = !0, console.log("[v0][Sentry] Background service worker monitoring initialized with isolated client"), console.log("[v0][Sentry] Environment:", e.environment), console.log("[v0][Sentry] Release:", e.release), console.log("[v0][Sentry] DSN:", Vr), console.log("[v0][Sentry] sendDefaultPii:", e.sendDefaultPii), console.log("[v0][Sentry] Client initialized:", !!r);
    try {
      o.captureMessage("[v0][Sentry] Background worker connected successfully", { level: "info" }), console.log("[v0][Sentry] Test message sent to verify connection");
    } catch (s) {
      console.warn("[v0][Sentry] Test message failed:", s);
    }
    return { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in background worker:", e), console.warn("[v0][Sentry] Extension will continue without Sentry monitoring"), { client: null, scope: new F() };
  }
}
const { client: Je, scope: K } = yg(), N = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!K || !Je))
      return K.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!K || !Je))
      return K.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!K || !Je))
        return qn(e, t, { scope: K });
    },
    warn: (e, t) => {
      if (!(!K || !Je))
        return zn(e, t, { scope: K });
    },
    error: (e, t) => {
      if (!(!K || !Je))
        return Wn(e, t, { scope: K });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !K || !Je ? t({}) : Kt({ ...e, scope: K }, t),
  // Get client (for advanced usage)
  getClient: () => Je,
  // Get scope (for advanced usage)
  getScope: () => K
}, Wa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: N,
  scope: K
}, Symbol.toStringTag, { value: "Module" })), g = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, j = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm"
}, ge = {
  // Core settings matching UserSettings
  theme: "system",
  blockMode: "soft",
  notifications: !0,
  syncWithCloud: !1,
  language: "pt-BR",
  telemetry: !1,
  debugDNR: !1,
  // Default to false for production
  debugTracking: !1,
  // Debug usage tracking
  debugContentAnalysis: !1,
  // Debug content analysis
  debugPomodoro: !1,
  // Debug Pomodoro timer
  debugZenMode: !1,
  // Debug Zen Mode
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
    "manual",
    "academic",
    "scholarly",
    "textbook",
    "lecture",
    "workshop",
    "seminar",
    "training",
    "skill",
    "development",
    "programming",
    "coding",
    "technical",
    "professional",
    "business",
    "finance",
    "economics",
    "science",
    "math"
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
    "meme",
    "funny",
    "joke",
    "comedy",
    "music",
    "movie",
    "sports",
    "gaming",
    "shopping",
    "fashion",
    "beauty",
    "lifestyle",
    "travel",
    "food",
    "recipe",
    "cooking",
    "diy",
    "craft",
    "art",
    "design",
    "photography"
  ],
  // Configurable suppression window (in minutes)
  contentAnalysisSuppressionMinutes: 30,
  // Default 30 minutes for testing
  // Backward compat
  analyticsConsent: !1,
  notificationsEnabled: !0
}, ke = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, Sg = 0.5, Jr = 0.5, U = {
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
function tn(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function wo(e) {
  if (!e) return "";
  try {
    const n = new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, ""), r = n.split("."), o = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const s of o)
      if (n.endsWith(`.${s}`))
        return n.split(".").slice(-3).join(".");
    return r.slice(-2).join(".");
  } catch {
    const t = e.replace(/^www\./, "").split("/")[0], n = t.split("."), r = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const o of r)
      if (t.endsWith(`.${o}`))
        return t.split(".").slice(-3).join(".");
    return n.slice(-2).join(".");
  }
}
function Ao(e) {
  return `||${e}`;
}
async function Ya() {
  try {
    const t = (await chrome.storage.sync.get(g.SETTINGS))[g.SETTINGS] || ge;
    return {
      debugDNR: t.debugDNR ?? ge.debugDNR ?? !1,
      debugTracking: t.debugTracking ?? ge.debugTracking ?? !1,
      debugContentAnalysis: t.debugContentAnalysis ?? ge.debugContentAnalysis ?? !1,
      debugPomodoro: t.debugPomodoro ?? ge.debugPomodoro ?? !1,
      debugZenMode: t.debugZenMode ?? ge.debugZenMode ?? !1
    };
  } catch (e) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", e), {
      debugDNR: !1,
      debugTracking: !1,
      debugContentAnalysis: !1,
      debugPomodoro: !1,
      debugZenMode: !1
    };
  }
}
async function Ka() {
  return (await Ya()).debugDNR;
}
let Xr = null;
function Eg() {
  return Xr === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : Xr;
}
async function Va() {
  Xr = await Ya();
}
function Qe() {
  return Eg().debugTracking;
}
let Oo = null, Js = !1, Xs = !1;
const Tg = 3e3, bg = 1e3;
function Do(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % bg;
  return Tg + n;
}
async function vg() {
  if (Xs) return;
  Xs = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(j.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const n = t.getTime() - e.getTime(), r = Date.now() + Math.max(n, 6e4);
  await chrome.alarms.create(j.DAILY_SYNC, {
    when: r,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(r - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === j.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await Ig());
  });
}
async function Ig() {
  const { [g.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((n) => Do(n.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (n) {
      console.error("[v0] Error clearing time limit session rules:", n);
    }
}
async function Rg() {
  Js || (Js = !0, console.log("[v0] Initializing usage tracker module"), await Va(), await chrome.alarms.clear(j.USAGE_TRACKER), await chrome.alarms.create(j.USAGE_TRACKER, {
    periodInMinutes: Jr
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === j.USAGE_TRACKER && await er();
  }), chrome.tabs.onActivated.addListener(wg), chrome.tabs.onUpdated.addListener(Ag), chrome.windows.onFocusChanged.addListener(Og), await Ja());
}
async function wg(e) {
  await er();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await No(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await nn();
  }
}
async function Ag(e, t) {
  e === Oo && t.url && t.status === "complete" && (await er(), await No(e, t.url));
}
async function Og(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await er(), await nn()) : await Ja();
}
async function Ja() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await No(e.id, e.url) : await nn();
}
async function No(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await nn();
    return;
  }
  Oo = e;
  const n = Date.now(), r = {
    url: t,
    startTime: n,
    lastUpdate: n
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: r });
}
async function nn() {
  Oo = null, await chrome.storage.session.remove(g.CURRENTLY_TRACKING);
}
async function er() {
  const t = (await chrome.storage.session.get(g.CURRENTLY_TRACKING))[g.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    Qe() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const n = wo(t.url);
  if (!n) {
    Qe() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await nn();
    return;
  }
  const r = Date.now(), o = Math.floor((r - t.startTime) / 1e3), s = t.lastUpdate || t.startTime, i = r - s, a = Jr * 60 * 1e3 * 2;
  if (i > a && (Qe() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(i / 1e3),
    maxGapMs: Math.floor(a / 1e3),
    domain: n,
    url: t.url
  }), t.startTime = r - Jr * 60 * 1e3), Qe() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: n,
    timeSpent: o,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: i > a
  }), t.startTime = r, t.lastUpdate = r, await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: t }), o < 1) {
    Qe() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [g.DAILY_USAGE]: u = {} } = await chrome.storage.local.get(
    g.DAILY_USAGE
  ), l = {
    ...u,
    [c]: u[c] || {
      date: c,
      totalMinutes: 0,
      perDomain: {}
    }
  };
  l[c].perDomain || (l[c].perDomain = {}), l[c].perDomain[n] = (l[c].perDomain[n] || 0) + o, l[c].totalMinutes = Object.values(l[c].perDomain).reduce((d, m) => d + m, 0) / 60, await chrome.storage.local.set({ [g.DAILY_USAGE]: l }), console.log("[v0] Recorded usage:", n, o, "seconds"), await B(), await Xa(n, l[c].perDomain[n]);
}
async function Xa(e, t) {
  const { [g.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = (Array.isArray(n) ? n : []).find((a) => a.domain === e);
  if (!o) return;
  const s = o.dailyMinutes ?? o.limitMinutes ?? 0, i = s * 60;
  if (t >= i) {
    const a = Do(e);
    try {
      Qe() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i,
        limitMinutes: s,
        exceeded: t >= i
      });
      const c = Ao(e), u = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
      console.log("[v0] Time limit rule debug:", {
        domain: e,
        urlFilter: c,
        blockedPageUrl: u,
        ruleId: a,
        totalSecondsToday: t,
        limitSeconds: i,
        redirectUrl: u
      });
      try {
        const p = new URL(u);
        console.log("[v0] Blocked page URL validation:", {
          isValid: !0,
          protocol: p.protocol,
          hostname: p.hostname,
          pathname: p.pathname,
          search: p.search
        });
      } catch (p) {
        console.error("[v0] Invalid blocked page URL:", u, p);
      }
      const l = {
        id: a,
        priority: 10,
        // Increased from 3 to 10 to ensure it overrides other rules
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: u
          }
        },
        condition: {
          urlFilter: c,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, d = await Ka();
      d && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: l.id,
        urlFilter: l.condition.urlFilter,
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [a],
        // remove se já existir
        addRules: [l]
      });
      try {
        const p = await chrome.tabs.query({ active: !0, currentWindow: !0 });
        p.length > 0 && p[0].id && p[0].url && wo(p[0].url) === e && (await chrome.tabs.update(p[0].id, { url: u }), console.log(`[v0] Redirected active tab ${p[0].id} to blocked page for ${e}`), Qe() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
          tabId: p[0].id,
          fromUrl: p[0].url,
          toUrl: u,
          domain: e
        }));
      } catch (p) {
        console.warn(`[v0] Could not redirect active tab for ${e}:`, p);
      }
      const m = await chrome.declarativeNetRequest.getSessionRules();
      console.log("[v0] Session rules after time limit rule creation:", {
        totalRules: m.length,
        timeLimitRule: m.find((p) => p.id === a),
        allRuleIds: m.map((p) => p.id)
      }), d && (console.log("[DNR-DEBUG] All session rules after time limit:", m), console.log("[DNR-DEBUG] Session rules by domain:", m.map((p) => ({
        id: p.id,
        urlFilter: p.condition.urlFilter || p.condition.regexFilter,
        priority: p.priority
      })))), console.log(
        `[v0] Time limit reached for ${e}. Session block rule ${a} added.`
      );
      const { createNotification: f } = await Promise.resolve().then(() => tr);
      await f({
        notificationId: `limit-exceeded-${e}`,
        type: "basic",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${s} minutos em ${e} hoje.`
      });
    } catch (c) {
      console.error(`[v0] Error updating session rule for time limit on ${e}:`, c);
    }
  }
}
async function Dg(e, t) {
  const n = tn(e);
  if (!n) return;
  const { [g.TIME_LIMITS]: r = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = Array.isArray(r) ? r : [], s = o.findIndex((a) => a.domain === n), i = Do(n);
  if (t > 0) {
    if (s >= 0)
      o[s].dailyMinutes = t;
    else {
      const l = (d) => d;
      o.push({ domain: l(n), dailyMinutes: t });
    }
    const a = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [g.DAILY_USAGE]: c = {} } = await chrome.storage.local.get(
      g.DAILY_USAGE
    ), u = c?.[a]?.perDomain?.[n] || 0;
    if (u >= t * 60)
      await Xa(n, u);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [i] });
      } catch {
      }
  } else if (s >= 0) {
    o.splice(s, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [i] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${n}`);
  }
  await chrome.storage.local.set({ [g.TIME_LIMITS]: o }), await B(), console.log("[v0] Time limit set/updated:", n, t, "minutes");
}
const gt = "__contentSuggestNotified__", Ng = 24 * 60 * 60 * 1e3;
async function Za() {
  try {
    const { [g.SETTINGS]: e } = await chrome.storage.sync.get(g.SETTINGS);
    return (e?.contentAnalysisSuppressionMinutes || 24 * 60) * 60 * 1e3;
  } catch {
    return Ng;
  }
}
async function kg() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [gt]: e = {} } = await chrome.storage.session.get(gt), t = Date.now(), n = await Za();
    let r = !1;
    for (const o of Object.keys(e || {}))
      (typeof e[o] != "number" || t - e[o] > n) && (delete e[o], r = !0);
    r && await chrome.storage.session.set({ [gt]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function Cg(e) {
  try {
    const t = await Za(), { [gt]: n = {} } = await chrome.storage.session.get(gt), r = n?.[e], o = Date.now();
    return r && o - r < t ? !1 : (await chrome.storage.session.set({
      [gt]: { ...n || {}, [e]: o }
    }), !0);
  } catch {
    return !0;
  }
}
async function Pg(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await Mg() || !(e.classification === "distracting" && e.score > Sg) || !e?.url) return;
    const t = wo(e.url);
    if (!t) return;
    const { [g.BLACKLIST]: n = [] } = await chrome.storage.local.get(
      g.BLACKLIST
    );
    if (n.some((s) => s.domain === t) || !await Cg(t))
      return;
    const { createNotification: o } = await Promise.resolve().then(() => tr);
    await o({
      notificationId: `suggest-block-${t}`,
      type: "basic",
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
let Zs = "";
async function B() {
  try {
    const e = await ko(), t = JSON.stringify(e, (n, r) => {
      if (r && typeof r == "object" && !Array.isArray(r)) {
        const o = {};
        return Object.keys(r).sort().forEach((s) => {
          o[s] = r[s];
        }), o;
      }
      return r;
    });
    if (t === Zs)
      return;
    Zs = t, chrome.runtime.sendMessage({ type: U.STATE_UPDATED, payload: { state: e } }, (n) => {
      const r = chrome.runtime.lastError, o = r?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((a) => o === a || o.startsWith(a));
      r && !i && console.warn("[v0] notifyStateUpdate lastError:", r.message);
    });
    try {
      for (const n of Tn)
        try {
          n.postMessage({ type: U.STATE_UPDATED, payload: { state: e } });
        } catch (r) {
          console.warn("[v0] Failed to post state to port:", r);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function Mg() {
  const { getNotificationSetting: e } = await Promise.resolve().then(() => tr);
  return await e();
}
async function ko() {
  const e = [
    g.BLACKLIST,
    g.TIME_LIMITS,
    g.DAILY_USAGE,
    g.POMODORO_STATUS,
    g.SITE_CUSTOMIZATIONS
  ], [t, n] = await Promise.all([
    chrome.storage.local.get(e),
    chrome.storage.sync.get(g.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (t[g.BLACKLIST] || []).map((r) => typeof r == "string" ? r : typeof r == "object" && r !== null && "domain" in r ? String(r.domain) : String(r)),
    timeLimits: t[g.TIME_LIMITS] || [],
    dailyUsage: t[g.DAILY_USAGE] || {},
    pomodoro: t[g.POMODORO_STATUS] || {
      config: ke,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[g.SITE_CUSTOMIZATIONS] || {},
    settings: n[g.SETTINGS] || ge
  };
}
const Tn = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    Tn.add(e), ko().then((t) => {
      try {
        e.postMessage({ type: U.STATE_UPDATED, payload: { state: t } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      Tn.delete(e);
    });
  } catch {
    try {
      Tn.delete(e);
    } catch {
    }
  }
});
async function Lg(e, t) {
  return N.startSpan(
    {
      op: "message.handle",
      name: `Handle Message: ${e.type}`
    },
    async (n) => {
      try {
        console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", t), n.setAttribute("message_type", e.type), n.setAttribute("has_payload", !!e.payload), n.setAttribute("sender_id", t.id || "unknown"), n.setAttribute("sender_url", t.url || "unknown");
        let r;
        switch (e.type) {
          case U.GET_INITIAL_STATE: {
            r = await ko();
            break;
          }
          case U.ADD_TO_BLACKLIST: {
            const o = e.payload?.domain;
            typeof o == "string" && (await Po(o), n.setAttribute("domain", o)), await B(), r = { success: !0 };
            break;
          }
          case U.REMOVE_FROM_BLACKLIST: {
            const o = e.payload?.domain;
            typeof o == "string" && await tc(o), await B(), r = { success: !0 };
            break;
          }
          case U.POMODORO_START: {
            const o = e.payload;
            console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(o)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(o?.config));
            const s = o?.config || o;
            console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(s)), await Bg(s), r = { success: !0 };
            break;
          }
          case U.POMODORO_STOP: {
            await ic(), r = { success: !0 };
            break;
          }
          case U.POMODORO_PAUSE: {
            await Fg(), r = { success: !0 };
            break;
          }
          case U.POMODORO_RESUME: {
            await Gg(), r = { success: !0 };
            break;
          }
          case U.START_BREAK: {
            await ac(), r = { success: !0 };
            break;
          }
          case U.TIME_LIMIT_SET: {
            const o = e.payload, s = o?.domain, i = o?.dailyMinutes ?? o?.limitMinutes;
            typeof s == "string" && typeof i == "number" && await Dg(s, i), await B(), r = { success: !0 };
            break;
          }
          case U.CONTENT_ANALYSIS_RESULT: {
            await Pg(e.payload?.result), await B(), r = { success: !0 };
            break;
          }
          case U.STATE_PATCH: {
            const o = e.payload ?? {}, s = o.patch?.settings ?? o.settings ?? o;
            if (!s || typeof s != "object") {
              r = { success: !1, error: "Invalid STATE_PATCH payload" };
              break;
            }
            const { [g.SETTINGS]: i } = await chrome.storage.sync.get(g.SETTINGS), a = { ...i ?? {}, ...s ?? {} }, c = JSON.stringify(i ?? {}), u = JSON.stringify(a);
            if (c === u) {
              r = { success: !0 };
              break;
            }
            await chrome.storage.sync.set({ [g.SETTINGS]: a }), await B(), r = { success: !0 };
            break;
          }
          case U.SITE_CUSTOMIZATION_UPDATED: {
            const { [g.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(g.SITE_CUSTOMIZATIONS), s = e.payload;
            let i = { ...o ?? {} };
            s && typeof s == "object" && !Array.isArray(s) && (s.domain && s.config ? i = { ...i, [String(s.domain)]: s.config } : i = { ...i, ...s }), await chrome.storage.local.set({ [g.SITE_CUSTOMIZATIONS]: i }), await B(), r = { success: !0 };
            break;
          }
          case U.TOGGLE_ZEN_MODE: {
            const [o] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
            if (o?.id)
              try {
                await chrome.tabs.sendMessage(o.id, {
                  type: U.TOGGLE_ZEN_MODE,
                  payload: e.payload
                });
              } catch (s) {
                console.warn(
                  `[v0] Could not send TOGGLE_ZEN_MODE to tab ${o.id}. It may be a protected page or the content script wasn't injected.`,
                  s
                );
              }
            r = { success: !0 };
            break;
          }
          case U.STATE_UPDATED: {
            console.warn(
              "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
            ), r = { success: !1, error: "Invalid message type received." };
            break;
          }
          default: {
            const o = e.type, s = new Error(`Unknown message type: ${o}`);
            throw N.logger.error("Unknown message type received", {
              type: e.type
            }), s;
          }
        }
        return n.setAttribute("success", !0), r;
      } catch (r) {
        throw N.logger.error("Message handling failed", {
          type: e.type,
          error: r
        }), n.setAttribute("success", !1), N.captureException(r), r;
      }
    }
  );
}
const Te = 1e3, $ = 2e3, xe = 1e3, be = 1e4;
let Sr = Promise.resolve();
function Co(e) {
  return Sr = Sr.then(e, e), Sr;
}
function Qs(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % xe;
  return $ + n;
}
async function Qa() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Blocker" },
    async (e) => {
      try {
        console.log("[v0] Initializing blocker module"), N.logger.info("Blocker module initializing"), await Va(), await Mo(), N.logger.info("Blocker module initialized successfully"), e.setAttribute("success", !0);
      } catch (t) {
        throw N.logger.error("Failed to initialize blocker module", { error: t }), e.setAttribute("success", !1), N.captureException(t), t;
      }
    }
  );
}
async function ec() {
  return N.startSpan(
    { op: "dnr.cleanup", name: "Cleanup All DNR Rules" },
    async (e) => {
      console.log("[v0] Cleaning up all DNR rules...");
      try {
        const t = await chrome.declarativeNetRequest.getDynamicRules();
        if (t.length > 0) {
          const r = t.map((o) => o.id);
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: r
          }), console.log(`[v0] Removed ${r.length} dynamic rules:`, r), e.setAttribute("dynamic_rules_removed", r.length), N.logger.info(`Removed ${r.length} dynamic DNR rules`);
        }
        const n = await chrome.declarativeNetRequest.getSessionRules();
        if (n.length > 0) {
          const r = n.map((o) => o.id);
          await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: r
          }), console.log(`[v0] Removed ${r.length} session rules:`, r), e.setAttribute("session_rules_removed", r.length), N.logger.info(`Removed ${r.length} session DNR rules`);
        }
        console.log("[v0] DNR cleanup complete"), e.setAttribute("success", !0);
      } catch (t) {
        console.error("[v0] Error during DNR cleanup:", t), e.setAttribute("success", !1), N.logger.error("DNR cleanup failed", { error: t }), N.captureException(t);
      }
    }
  );
}
async function xg() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const e = await chrome.declarativeNetRequest.getDynamicRules(), t = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${e.length}`), e.forEach((n) => {
      console.log(`  [${n.id}] priority=${n.priority} action=${n.action.type}`), console.log(`    urlFilter: ${n.condition.urlFilter || n.condition.regexFilter}`);
    }), console.log(`Session rules: ${t.length}`), t.forEach((n) => {
      console.log(`  [${n.id}] priority=${n.priority} action=${n.action.type}`), console.log(`    urlFilter: ${n.condition.urlFilter || n.condition.regexFilter}`);
    }), e.length > 0 && e[0].condition.regexFilter) {
      const n = new RegExp(e[0].condition.regexFilter), r = [
        "https://youtube.com",
        "https://youtube.com/",
        "https://www.youtube.com",
        "https://www.youtube.com/watch?v=test"
      ];
      console.log("Regex test results:"), r.forEach((o) => {
        console.log(`  ${n.test(o) ? "✅" : "❌"} ${o}`);
      });
    }
  } catch (e) {
    console.error("DNR debug failed:", e);
  }
  console.log("=== END DNR DEBUG ===");
}
async function Po(e) {
  return N.startSpan(
    { op: "blocker.add", name: "Add to Blacklist" },
    async (t) => {
      try {
        t.setAttribute("domain", e);
        const r = (await chrome.storage.local.get(
          g.BLACKLIST
        ))[g.BLACKLIST] ?? [], o = tn(e);
        if (!o) {
          N.logger.warn("Invalid domain for blacklist", { domain: e }), t.setAttribute("success", !1), t.setAttribute("reason", "invalid_domain");
          return;
        }
        if (t.setAttribute("normalized_domain", o), r.some((a) => a.domain === o)) {
          console.log("[v0] Domain already in blacklist:", o), t.setAttribute("success", !1), t.setAttribute("reason", "already_exists");
          return;
        }
        const s = (a) => a, i = [
          ...r,
          { domain: s(o), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
        ];
        try {
          const a = r;
          if (a.length === i.length && a.every((u, l) => u.domain === i[l].domain && u.addedAt === i[l].addedAt)) {
            console.log("[v0] addToBlacklist: no-op, blacklist identical"), t.setAttribute("success", !1), t.setAttribute("reason", "no_change");
            return;
          }
        } catch {
        }
        await chrome.storage.local.set({ [g.BLACKLIST]: i }), await Mo(), await B(), console.log("[v0] Added to blacklist:", o), N.logger.info("Domain added to blacklist", {
          domain: o,
          blacklist_size: i.length
        }), t.setAttribute("success", !0), t.setAttribute("blacklist_size", i.length);
      } catch (n) {
        throw N.logger.error("Failed to add domain to blacklist", { domain: e, error: n }), t.setAttribute("success", !1), N.captureException(n), n;
      }
    }
  );
}
async function tc(e) {
  const n = (await chrome.storage.local.get(
    g.BLACKLIST
  ))[g.BLACKLIST] ?? [], r = tn(e);
  if (!r) return;
  const o = n.filter((s) => s.domain !== r);
  if (o.length !== n.length) {
    try {
      if (o.length === n.length && o.every((i, a) => i.domain === n[a].domain && i.addedAt === n[a].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [g.BLACKLIST]: o }), await Mo(), await B(), console.log("[v0] Removed from blacklist:", r);
  }
}
async function Mo() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), Co(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const t = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", t.length, "existing DNR rules");
    const n = new Set(
      t.map((i) => i.id).filter(
        (i) => i >= $ && i < $ + xe || i >= $ + be && i < $ + be + xe
      )
    ), r = [], o = /* @__PURE__ */ new Set();
    for (const i of e) {
      const a = tn(i.domain);
      if (!a) continue;
      let c = Qs(a), u = 0;
      const l = xe;
      for (; o.has(c) || n.has(c); ) {
        if (u++, u >= l) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${a}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        c++, c >= $ + xe && (c = $);
      }
      if (u >= l) {
        console.warn(`[v0] Skipping rule for ${a} - no free ID found`);
        continue;
      }
      if (o.add(c), !n.has(c)) {
        const d = Ao(a);
        console.log("[v0] [DEBUG] Valid urlFilter for", a, ":", d);
        const m = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(a)}`);
        r.push({
          id: c,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: m
            }
          },
          condition: {
            urlFilter: d,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
        const f = c + be;
        n.has(f) || r.push({
          id: f,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            responseHeaders: [
              { header: "cache-control", operation: "set", value: "no-store, no-cache, must-revalidate" },
              { header: "pragma", operation: "set", value: "no-cache" },
              { header: "expires", operation: "set", value: "0" }
            ]
          },
          condition: {
            urlFilter: d,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME
            ]
          }
        });
      }
    }
    const s = Array.from(n).filter(
      (i) => !o.has(i) && !o.has(i - be)
    );
    if (console.log("[v0] DEBUG: Rules to add:", r.length), console.log("[v0] DEBUG: Rules to remove:", s.length), r.length > 0 || s.length > 0) {
      const i = await Ka();
      i && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((l) => l.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", r.map((l) => ({
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e.find((d) => Qs(d.domain) === l.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", s)), console.log("[v0] DEBUG: Updating DNR rules...");
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: s,
          addRules: r
        }), console.log("[v0] DEBUG: DNR rules successfully applied");
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[v0] DEBUG: Current DNR rules count:", l.length), console.log("[v0] DEBUG: Current DNR rules:", l);
      } catch (l) {
        throw console.error("[v0] ERROR: DNR updateDynamicRules FAILED:", l), console.error("[v0] ERROR: Failed rules:", r), console.error("[v0] ERROR: Attempted to remove:", s), l;
      }
      const a = await chrome.declarativeNetRequest.getDynamicRules(), c = a.filter((l) => l.id >= $ && l.id < $ + xe), u = a.filter((l) => l.id >= Te && l.id < $);
      if (console.log(`[v0] DNR Verification: ${c.length} blacklist rules, ${u.length} pomodoro rules`), r.length > 0 && c.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), i) {
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", l), console.log("[DNR-DEBUG] Total rules count:", l.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: l.filter((d) => d.id >= Te && d.id < $).length,
          blacklist: l.filter((d) => d.id >= $ && d.id < $ + xe).length,
          other: l.filter((d) => d.id < Te || d.id >= $ + xe).length
        });
      }
      console.log(
        "[v0] User blocking rules synced:",
        r.length,
        "rules added,",
        s.length,
        "rules removed."
      );
    } else
      console.log("[v0] User blocking rules already in sync.");
  });
}
async function Lo() {
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = [];
  return e.forEach((n, r) => {
    const o = tn(n.domain), s = Ao(o), i = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(o)}`);
    t.push({
      id: Te + r,
      priority: 2,
      // acima das regras de usuário
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: i
        }
      },
      condition: {
        urlFilter: s,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
      }
    }), t.push({
      id: Te + r + be,
      priority: 2,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        responseHeaders: [
          { header: "cache-control", operation: "set", value: "no-store, no-cache, must-revalidate" },
          { header: "pragma", operation: "set", value: "no-cache" },
          { header: "expires", operation: "set", value: "0" }
        ]
      },
      condition: {
        urlFilter: s,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME
        ]
      }
    });
  }), Co(async () => {
    const r = (await chrome.declarativeNetRequest.getDynamicRules()).map((s) => s.id).filter(
      (s) => s >= Te && s < $ || s >= Te + be && s < $ + be
    );
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(t, null, 2));
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: r,
        addRules: t
      }), console.log("[v0] DEBUG: Pomodoro DNR rules successfully applied");
    } catch (s) {
      throw console.error("[v0] ERROR: Pomodoro DNR updateDynamicRules FAILED:", s), console.error("[v0] ERROR: Failed Pomodoro rules:", t), console.error("[v0] ERROR: Attempted to remove Pomodoro rules:", r), s;
    }
    const o = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(o, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      e.length,
      "sites."
    );
  });
}
async function xo() {
  return Co(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter(
      (n) => n >= Te && n < $ || n >= Te + be && n < $ + be
    );
    if (t.length > 0)
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: t
        }), console.log(
          "[v0] Pomodoro blocking disabled. Removed",
          t.length,
          "rules."
        );
      } catch (n) {
        throw console.error("[v0] ERROR: Failed to remove Pomodoro DNR rules:", n), console.error("[v0] ERROR: Attempted to remove Pomodoro rule IDs:", t), n;
      }
  });
}
const nc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: Po,
  cleanupAllDNRRules: ec,
  debugDNRStatus: xg,
  disablePomodoroBlocking: xo,
  enablePomodoroBlocking: Lo,
  initializeBlocker: Qa,
  removeFromBlacklist: tc
}, Symbol.toStringTag, { value: "Module" }));
function rc() {
  const e = "icons/icon48.png", t = chrome.runtime.getURL(e);
  return console.debug("[v0][Notifications] Icon URL resolved:", { iconPath: e, iconUrl: t }), t;
}
async function oc() {
  try {
    if (!chrome.notifications || typeof chrome.notifications.create != "function")
      return console.warn("[v0][Notifications] chrome.notifications API not available"), !1;
    if (chrome.permissions && chrome.permissions.contains)
      try {
        if (!await chrome.permissions.contains({
          permissions: ["notifications"]
        }))
          return console.warn("[v0][Notifications] Notification permission not granted"), !1;
      } catch {
        console.debug("[v0][Notifications] Could not check permission status, will try creating notification");
      }
    return !0;
  } catch (e) {
    return console.error("[v0][Notifications] Error verifying permission:", e), !1;
  }
}
async function sc() {
  try {
    try {
      const t = (await chrome.storage.sync.get(g.SETTINGS))[g.SETTINGS];
      if (t) {
        const n = t.notifications ?? t.notificationsEnabled;
        if (n !== void 0)
          return n;
      }
    } catch (e) {
      console.warn("[v0][Notifications] Sync storage read failed, trying local:", e);
    }
    try {
      const t = (await chrome.storage.local.get(g.SETTINGS))[g.SETTINGS];
      if (t) {
        const n = t.notifications ?? t.notificationsEnabled;
        if (n !== void 0)
          return n;
      }
    } catch (e) {
      console.warn("[v0][Notifications] Local storage read failed:", e);
    }
    return ge.notifications ?? ge.notificationsEnabled ?? !0;
  } catch (e) {
    return console.error("[v0][Notifications] Error getting notification setting:", e), !1;
  }
}
async function xn(e) {
  console.log("[v0][Notifications] Creating notification:", {
    notificationId: e.notificationId,
    title: e.title,
    type: e.type || "basic",
    iconUrl: e.iconUrl || "(will use default)"
  });
  try {
    console.debug("[v0][Notifications] Verifying notification permission...");
    const t = await oc();
    if (console.debug("[v0][Notifications] Permission check result:", { hasPermission: t }), !t)
      return console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: e.notificationId,
        title: e.title
      }), null;
    console.debug("[v0][Notifications] Checking notification settings...");
    const n = await sc();
    if (console.debug("[v0][Notifications] Notification setting result:", { notificationsEnabled: n }), !n)
      return console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: e.notificationId,
        title: e.title
      }), null;
    const r = e.iconUrl || rc(), o = {
      type: e.type || "basic",
      iconUrl: r,
      title: e.title,
      message: e.message
    };
    e.buttons && e.buttons.length > 0 && (o.buttons = e.buttons), e.requireInteraction !== void 0 && (o.requireInteraction = e.requireInteraction), e.priority !== void 0 && (o.priority = e.priority), console.log("[v0][Notifications] Notification options prepared:", {
      notificationId: e.notificationId,
      type: o.type,
      iconUrl: o.iconUrl,
      title: o.title,
      messageLength: o.message?.length || 0,
      hasButtons: (o.buttons?.length || 0) > 0,
      requireInteraction: o.requireInteraction,
      priority: o.priority
    }), console.debug("[v0][Notifications] Calling chrome.notifications.create...");
    const s = await chrome.notifications.create(
      e.notificationId,
      o
    );
    return console.log("[v0][Notifications] Notification created successfully:", {
      id: s,
      notificationId: e.notificationId,
      title: e.title,
      type: e.type || "basic"
    }), s;
  } catch (t) {
    return console.error("[v0][Notifications] Failed to create notification:", {
      error: t?.message || String(t),
      stack: t?.stack,
      notificationId: e.notificationId,
      title: e.title,
      message: e.message
    }), null;
  }
}
const tr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createNotification: xn,
  getNotificationIconUrl: rc,
  getNotificationSetting: sc,
  verifyNotificationPermission: oc
}, Symbol.toStringTag, { value: "Module" }));
async function Ug() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Pomodoro" },
    async (e) => {
      try {
        console.log("[v0] Initializing Pomodoro module"), N.logger.info("Pomodoro module initializing"), await $g(), chrome.alarms.onAlarm.addListener(async (t) => {
          t.name === j.POMODORO && await Uo();
        }), N.logger.info("Pomodoro module initialized successfully"), e.setAttribute("success", !0);
      } catch (t) {
        throw N.logger.error("Failed to initialize Pomodoro module", { error: t }), e.setAttribute("success", !1), N.captureException(t), t;
      }
    }
  );
}
async function $g() {
  try {
    const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
    if (!e?.state || e.state.phase === "idle")
      return;
    const t = e.state, n = e.config || ke;
    if (!t.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await ic();
      return;
    }
    const r = /* @__PURE__ */ new Date(), o = new Date(t.endsAt), s = Math.max(0, o.getTime() - r.getTime());
    if (s <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await Uo();
      return;
    }
    const i = {
      ...t,
      remainingMs: s,
      endsAt: o.toISOString()
    };
    await chrome.storage.local.set({
      [g.POMODORO_STATUS]: { config: n, state: i }
    });
    const a = s / (60 * 1e3), c = s < 6e4 ? 0 : Math.ceil(s / (60 * 1e3));
    s < 6e4 ? await chrome.alarms.create(j.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(j.POMODORO, { delayInMinutes: a }), t.phase === "focus" && await Lo(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${c} minutes remaining`);
  } catch (e) {
    console.error("[v0] Pomodoro recovery failed:", e);
  }
}
async function Bg(e) {
  const { [g.POMODORO_STATUS]: t } = await chrome.storage.local.get(g.POMODORO_STATUS), n = t?.config || ke, r = {
    ...n,
    ...e
  };
  console.log("[v0] Pomodoro config debug:", {
    incomingConfig: e,
    currentConfig: n,
    finalConfig: r,
    focusMinutes: r.focusMinutes,
    shortBreakMinutes: r.shortBreakMinutes
  });
  const o = /* @__PURE__ */ new Date(), s = new Date(o.getTime() + r.focusMinutes * 60 * 1e3), i = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (t?.state?.cycleIndex || 0) + 1,
    startedAt: o.toISOString(),
    endsAt: s.toISOString(),
    remainingMs: r.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: r, state: i } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", r.focusMinutes), await chrome.alarms.create(j.POMODORO, { delayInMinutes: r.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await Lo(), await B();
  try {
    await xn({
      notificationId: "pomodoro-start",
      type: "basic",
      title: "Pomodoro Iniciado",
      message: `Foco por ${r.focusMinutes} minutos. Mantenha o foco!`
    });
  } catch (a) {
    console.error("[v0] Failed to create pomodoro-start notification:", a);
  }
  console.log("[v0] Pomodoro started:", i);
}
async function ic() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, n = e?.config || ke;
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: n, state: t } }), await chrome.alarms.clear(j.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await xo(), await B(), console.log("[v0] Pomodoro stopped");
}
async function Fg() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || ke;
  if (t.phase === "idle" || t.isPaused) return;
  const r = /* @__PURE__ */ new Date(), o = t.endsAt ? new Date(t.endsAt) : r, s = Math.max(0, o.getTime() - r.getTime()), i = {
    ...t,
    isPaused: !0,
    pausedAt: r.toISOString(),
    remainingMs: s,
    endsAt: void 0
    // Remove endsAt pois não há mais deadline
  };
  await chrome.alarms.clear(j.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await chrome.storage.local.set({
    [g.POMODORO_STATUS]: { config: n, state: i }
  }), await B(), console.log("[v0] Pomodoro paused:", i);
}
async function Gg() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || !e.state.isPaused) return;
  const t = e.state, n = e.config || ke, r = /* @__PURE__ */ new Date(), o = t.remainingMs || 0;
  if (o <= 0) {
    await Uo();
    return;
  }
  const s = new Date(r.getTime() + o), i = {
    ...t,
    isPaused: !1,
    pausedAt: void 0,
    endsAt: s.toISOString(),
    remainingMs: o
  };
  await chrome.storage.local.set({
    [g.POMODORO_STATUS]: { config: n, state: i }
  });
  const a = Math.ceil(o / (60 * 1e3));
  await chrome.alarms.create(j.POMODORO, {
    delayInMinutes: Math.max(a, 0.1)
    // Min 6 segundos
  }), t.phase === "focus" && await chrome.alarms.create("pomodoro-keepalive", {
    delayInMinutes: 5,
    periodInMinutes: 5
  }), await B(), console.log("[v0] Pomodoro resumed:", i);
}
async function ac() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || e.state.phase !== "focus_complete") return;
  const t = e.state, n = e.config || ke, r = t.pendingBreakType || "short", o = r === "long" ? n.longBreakMinutes : n.shortBreakMinutes, s = /* @__PURE__ */ new Date(), i = new Date(s.getTime() + o * 60 * 1e3), a = {
    ...t,
    phase: r === "long" ? "long_break" : "short_break",
    isPaused: !1,
    startedAt: s.toISOString(),
    endsAt: i.toISOString(),
    remainingMs: o * 60 * 1e3,
    pendingBreakType: void 0
  };
  await chrome.storage.local.set({
    [g.POMODORO_STATUS]: { config: n, state: a }
  }), await chrome.alarms.create(j.POMODORO, {
    delayInMinutes: o
  }), await xo(), await B(), console.log("[v0] Break started:", a);
}
async function Uo() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || ke;
  if (t.phase === "focus") {
    const o = t.cycleIndex % n.cyclesBeforeLongBreak === 0 ? "long" : "short", s = {
      ...t,
      phase: "focus_complete",
      isPaused: !1,
      remainingMs: 0,
      endsAt: void 0,
      pendingBreakType: o
    };
    await chrome.storage.local.set({
      [g.POMODORO_STATUS]: { config: n, state: s }
    }), await chrome.alarms.clear("pomodoro-keepalive"), await B();
    try {
      await xn({
        notificationId: "pomodoro-focus-complete",
        type: "basic",
        title: "Foco Completo! 🎯",
        message: `Parabéns! Você completou ${n.focusMinutes} minutos de foco. Pronto para o descanso?`,
        buttons: [{ title: "Iniciar Descanso" }],
        requireInteraction: !0
        // Força usuário a interagir
      });
    } catch (i) {
      console.error("[v0] Failed to create pomodoro-focus-complete notification:", i);
    }
    console.log("[v0] Pomodoro: Focus → Focus Complete (awaiting user)");
  } else if (t.phase === "short_break" || t.phase === "long_break") {
    const r = { phase: "idle", isPaused: !1, cycleIndex: t.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: n, state: r } }), await chrome.alarms.clear("pomodoro-keepalive"), await B();
    try {
      await xn({
        notificationId: "pomodoro-cycle-complete",
        type: "basic",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?"
      });
    } catch (o) {
      console.error("[v0] Failed to create pomodoro-cycle-complete notification:", o);
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
async function Hg() {
  console.log("[v0] Initializing Firebase sync module");
  const { [g.SETTINGS]: e } = await chrome.storage.sync.get(g.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(j.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === j.DAILY_SYNC && await jg();
  });
}
async function jg() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [g.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(g.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = e[t];
  if (!n) return;
  const r = Object.values(n).reduce((s, i) => s + i, 0), o = Object.entries(n).sort(([, s], [, i]) => i - s).slice(0, 5).map(([s, i]) => ({ domain: s, time: i }));
  console.log("[v0] Daily summary:", { totalTime: r, topSites: o });
}
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function cc() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Ug(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await Qa(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await Rg(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await vg(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await kg(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await Hg(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function qg() {
  try {
    const { verifyNotificationPermission: e, createNotification: t } = await Promise.resolve().then(() => tr);
    await e() ? (console.log("[v0] Notification permission granted"), await t({
      notificationId: "welcome-notification",
      type: "basic",
      title: "Focus Extension Ativada!",
      message: "As notificações estão funcionando. Você receberá alertas sobre Pomodoro e sites distrativos.",
      priority: 1
    }), console.log("[v0] Welcome notification sent")) : console.warn("[v0] Notifications API not available or permission not granted");
  } catch (e) {
    console.error("[v0] Failed to request notification permission:", e);
  }
}
async function ei() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");
    const e = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const t of e)
      if (t.id)
        try {
          const n = await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: () => globalThis.__v0ContentScriptInjected === !0
            // em MV3, func roda na página; caso bloqueado, cairá no catch abaixo
          });
          Array.isArray(n) && n[0]?.result === !0 || (await chrome.scripting.executeScript({
            target: { tabId: t.id },
            files: ["content.js"]
          }), await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: () => {
              globalThis.__v0ContentScriptInjected = !0;
            }
          }), console.log(`[v0] Injected content script into tab ${t.id}`));
        } catch (n) {
          const r = String(n?.message ?? n);
          r.includes("Cannot access contents") || r.includes("No matching signature") || r.includes("Cannot access a chrome:// URL") || r.includes("The extensions gallery cannot be scripted") || r.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${t.id}:`, n);
        }
  } catch (e) {
    console.error("[v0] Error while injecting content scripts:", e);
  }
}
function zg(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), Wg(e);
}
async function Wg(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await ec(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
  } catch (t) {
    console.error("[v0] Failed to cleanup DNR rules:", t);
  }
  if (e.reason === "install") {
    console.log("[v0] DEBUG: First installation - creating initial state...");
    const t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = {
      isLoading: !1,
      error: null,
      blacklist: [],
      // Garantir que é array
      timeLimits: [],
      // Garantir que é array
      dailyUsage: {
        [t]: {
          date: t,
          totalMinutes: 0,
          perDomain: {}
        }
      },
      siteCustomizations: {
        "youtube.com": {
          selectorsToRemove: [
            "#secondary",
            "#related",
            "#comments",
            "#sections",
            "#chips",
            "#masthead-container",
            "#player-ads",
            "#merch-shelf",
            "#engagement-panel",
            "#watch-discussion",
            "#watch-description",
            "#watch7-sidebar-contents",
            "#watch7-sidebar-modules",
            "ytd-reel-shelf-renderer",
            "ytd-shorts",
            "ytd-compact-video-renderer",
            "ytd-video-secondary-info-renderer",
            "ytd-video-primary-info-renderer",
            "#dismissible",
            "#dismissed",
            "#dismissed-content",
            "ytd-item-section-renderer",
            "ytd-shelf-renderer"
          ]
        }
      },
      pomodoro: {
        config: ke,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: ge
    };
    console.log("[v0] DEBUG: Initial state object:", n);
    try {
      console.log("[v0] DEBUG: Writing to chrome.storage.local..."), await chrome.storage.local.set({
        [g.BLACKLIST]: n.blacklist,
        [g.TIME_LIMITS]: n.timeLimits,
        [g.DAILY_USAGE]: n.dailyUsage,
        [g.SITE_CUSTOMIZATIONS]: n.siteCustomizations,
        [g.POMODORO_STATUS]: n.pomodoro
      }), console.log("[v0] DEBUG: ✅ Local storage written successfully"), console.log("[v0] DEBUG: Writing to chrome.storage.sync..."), await chrome.storage.sync.set({
        [g.SETTINGS]: n.settings
      }), console.log("[v0] DEBUG: ✅ Sync storage written successfully"), console.log("[v0] Initial state created");
    } catch (r) {
      console.error("[v0] Failed to create initial state:", r);
    }
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await ei(), console.log("[v0] DEBUG: Requesting notification permissions..."), await qg(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await ei()), console.log("[v0] DEBUG: Starting module initialization..."), await cc(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => nc);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => nc);
  await e();
};
globalThis.verifyDNRRules = async () => {
  const e = await chrome.declarativeNetRequest.getDynamicRules(), t = await chrome.declarativeNetRequest.getSessionRules();
  console.log("=== DNR Rules Verification ==="), console.log("Dynamic rules:", e.length), console.log("Session rules:", t.length), console.log(`
Dynamic rules detail:`, e), console.log(`
Session rules detail:`, t);
  const n = "https://www.youtube.com/", r = e.filter((o) => {
    if (o.condition.regexFilter)
      try {
        return new RegExp(o.condition.regexFilter).test(n);
      } catch (s) {
        return console.error("Invalid regex in rule", o.id, s), !1;
      }
    return !1;
  });
  return console.log(`
Rules matching ${n}:`, r), { dynamic: e, session: t, matching: r };
};
globalThis.testSentryBackground = async () => {
  const { testSentryBackground: e, testSentryComprehensive: t } = await Promise.resolve().then(() => mc);
  e();
};
globalThis.testSentryComprehensive = async () => {
  const { testSentryComprehensive: e } = await Promise.resolve().then(() => mc);
  e("background");
};
function Yg() {
  return console.log("[v0] Extension started on browser startup"), cc();
}
function Kg() {
  chrome.runtime.onInstalled.addListener(zg), chrome.runtime.onStartup.addListener(Yg), chrome.storage.onChanged.addListener((e, t) => {
    console.log(`[v0] Storage changed in ${t}:`, e), B();
  }), chrome.runtime.onMessage.addListener((e, t, n) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), console.log("[v0] DEBUG: Message sender:", t), console.log("[v0] DEBUG: Message ID:", e?.id), console.log("[v0] DEBUG: Message timestamp:", e?.ts), Promise.resolve(Lg(e, t)).then((r) => {
        console.log("[v0] DEBUG: Message response:", r), n(r);
      }).catch((r) => {
        console.error("[v0] Error handling message:", r), n({ error: r?.message ?? String(r) });
      }), !0;
    } catch (r) {
      return console.error("[v0] onMessage top-level error:", r), n({ error: r.message }), !1;
    }
  }), chrome.notifications.onButtonClicked.addListener(async (e, t) => {
    try {
      if (console.log("[v0] Notification button clicked:", e, t), e.startsWith("suggest-block-") && t === 0) {
        const n = e.replace("suggest-block-", "");
        n && (await Po(n), console.log(`[v0] Added ${n} to blacklist from notification.`));
      } else e === "pomodoro-focus-complete" && t === 0 && (await ac(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Kg();
console.log("[v0] Service Worker loaded and listeners attached.");
const ti = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
async function uc() {
  const { Sentry: e } = await Promise.resolve().then(() => Wa);
  console.log("[Sentry Test] Testing background error tracking...");
  try {
    e.startSpan(
      { op: "test", name: "Background Test Span" },
      (t) => {
        t.setAttribute("test_attribute", "test_value"), t.setAttribute("context", "background"), console.log("[Sentry Test] Span created"), e.logger.info("Background test log", {
          test: !0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }), console.log("[Sentry Test] Log sent");
      }
    ), setTimeout(() => {
      try {
        throw new Error("Sentry Test Error - Background Context");
      } catch (t) {
        e.captureException(t), console.log("[Sentry Test] Error captured");
      }
    }, 100);
  } catch (t) {
    e.captureException(t), console.log("[Sentry Test] Error captured");
  }
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Dashboard: https://sentry.io/issues/");
}
async function lc() {
  const { Sentry: e } = await Promise.resolve().then(() => Oc);
  console.log("[Sentry Test] Testing popup error tracking..."), e.startSpan(
    { op: "ui.click", name: "Popup Test Button Click" },
    (t) => {
      t.setAttribute("context", "popup"), t.setAttribute("test", !0), e.logger.info("Popup test log", {
        test: !0,
        ui_element: "test_button"
      }), setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Popup Context");
        } catch (n) {
          e.captureException(n), console.log("[Sentry Test] Error captured from popup");
        }
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function dc() {
  const { Sentry: e } = await Promise.resolve().then(() => Nc);
  console.log("[Sentry Test] Testing options error tracking..."), e.startSpan(
    { op: "ui.settings", name: "Options Test Action" },
    (t) => {
      t.setAttribute("context", "options"), t.setAttribute("test", !0), e.logger.info("Options test log", {
        test: !0,
        settings_modified: !1
      }), setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Options Context");
        } catch (n) {
          e.captureException(n), console.log("[Sentry Test] Error captured from options");
        }
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function fc() {
  const { Sentry: e } = await Promise.resolve().then(() => kc);
  console.log("[Sentry Test] Testing content script error tracking..."), e.startSpan(
    { op: "test", name: "Content Script Test" },
    (t) => {
      t.setAttribute("context", "content"), t.setAttribute("test", !0), setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Content Script Context");
        } catch (n) {
          e.captureException(n), console.log("[Sentry Test] Error captured from content script");
        }
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Note: Content script tracking is minimal for privacy");
}
async function pc(e) {
  let t;
  switch (e) {
    case "background":
      t = (await Promise.resolve().then(() => Wa)).Sentry;
      break;
    case "popup":
      t = (await Promise.resolve().then(() => Oc)).Sentry;
      break;
    case "options":
      t = (await Promise.resolve().then(() => Nc)).Sentry;
      break;
    case "content":
      t = (await Promise.resolve().then(() => kc)).Sentry;
      break;
  }
  console.log(`[Sentry Test] Running comprehensive test for ${e}...`), t.startSpan(
    { op: "test.comprehensive", name: "Comprehensive Sentry Test" },
    async (n) => {
      n.setAttribute("context", e), n.setAttribute("test_type", "comprehensive"), t.logger.info("Test info log", { level: "info", context: e }), t.logger.warn("Test warn log", { level: "warn", context: e }), t.logger.error("Test error log", { level: "error", context: e }), await t.startSpan(
        { op: "test.nested", name: "Nested Test Span" },
        async (r) => {
          r.setAttribute("nested", !0), r.setAttribute("parent", "comprehensive_test"), await new Promise((o) => setTimeout(o, 50));
        }
      );
      try {
        throw new Error(`Comprehensive Test Error - ${e}`);
      } catch (r) {
        t.captureException(r);
      }
      console.log(`[Sentry Test] Comprehensive test complete for ${e}`), console.log("[Sentry Test] Expected results:"), console.log("  - 3 log entries (info, warn, error)"), console.log("  - 2 spans (comprehensive + nested)"), console.log("  - 1 error issue"), console.log("  - Check dashboard: https://sentry.io/issues/");
    }
  );
}
if (typeof globalThis < "u") {
  let e = !1;
  try {
    const r = ti;
    if (r) {
      const o = r.MODE, s = r.NODE_ENV;
      e = o === "development" || s === "development";
    }
  } catch {
  }
  if (!e)
    try {
      typeof chrome < "u" && chrome?.runtime?.getManifest && chrome.runtime.getManifest()?.version?.includes("dev") && (e = !0);
    } catch {
    }
  let t = !1;
  try {
    const r = ti;
    r && (t = r.VITE_SENTRY_TEST_EXPOSE === "true" || // Also check without prefix for legacy support
    r.SENTRY_TEST_EXPOSE === "true");
  } catch {
  }
  (e || t) && (globalThis.testSentryBackground = uc, globalThis.testSentryPopup = lc, globalThis.testSentryOptions = dc, globalThis.testSentryContent = fc, globalThis.testSentryComprehensive = pc, console.log("[Sentry Test] Test functions exposed to globalThis (development mode)"));
}
const mc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  testSentryBackground: uc,
  testSentryComprehensive: pc,
  testSentryContent: fc,
  testSentryOptions: dc,
  testSentryPopup: lc
}, Symbol.toStringTag, { value: "Module" }));
var gc = { exports: {} }, nr = {}, hc = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rn = Symbol.for("react.element"), Vg = Symbol.for("react.portal"), Jg = Symbol.for("react.fragment"), Xg = Symbol.for("react.strict_mode"), Zg = Symbol.for("react.profiler"), Qg = Symbol.for("react.provider"), eh = Symbol.for("react.context"), th = Symbol.for("react.forward_ref"), nh = Symbol.for("react.suspense"), rh = Symbol.for("react.memo"), oh = Symbol.for("react.lazy"), ni = Symbol.iterator;
function sh(e) {
  return e === null || typeof e != "object" ? null : (e = ni && e[ni] || e["@@iterator"], typeof e == "function" ? e : null);
}
var _c = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, yc = Object.assign, Sc = {};
function kt(e, t, n) {
  this.props = e, this.context = t, this.refs = Sc, this.updater = n || _c;
}
kt.prototype.isReactComponent = {};
kt.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
kt.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Ec() {
}
Ec.prototype = kt.prototype;
function $o(e, t, n) {
  this.props = e, this.context = t, this.refs = Sc, this.updater = n || _c;
}
var Bo = $o.prototype = new Ec();
Bo.constructor = $o;
yc(Bo, kt.prototype);
Bo.isPureReactComponent = !0;
var ri = Array.isArray, Tc = Object.prototype.hasOwnProperty, Fo = { current: null }, bc = { key: !0, ref: !0, __self: !0, __source: !0 };
function vc(e, t, n) {
  var r, o = {}, s = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (s = "" + t.key), t) Tc.call(t, r) && !bc.hasOwnProperty(r) && (o[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) o.children = n;
  else if (1 < a) {
    for (var c = Array(a), u = 0; u < a; u++) c[u] = arguments[u + 2];
    o.children = c;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) o[r] === void 0 && (o[r] = a[r]);
  return { $$typeof: rn, type: e, key: s, ref: i, props: o, _owner: Fo.current };
}
function ih(e, t) {
  return { $$typeof: rn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Go(e) {
  return typeof e == "object" && e !== null && e.$$typeof === rn;
}
function ah(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var oi = /\/+/g;
function Er(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? ah("" + e.key) : t.toString(36);
}
function bn(e, t, n, r, o) {
  var s = typeof e;
  (s === "undefined" || s === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else switch (s) {
    case "string":
    case "number":
      i = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case rn:
        case Vg:
          i = !0;
      }
  }
  if (i) return i = e, o = o(i), e = r === "" ? "." + Er(i, 0) : r, ri(o) ? (n = "", e != null && (n = e.replace(oi, "$&/") + "/"), bn(o, t, n, "", function(u) {
    return u;
  })) : o != null && (Go(o) && (o = ih(o, n + (!o.key || i && i.key === o.key ? "" : ("" + o.key).replace(oi, "$&/") + "/") + e)), t.push(o)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", ri(e)) for (var a = 0; a < e.length; a++) {
    s = e[a];
    var c = r + Er(s, a);
    i += bn(s, t, n, c, o);
  }
  else if (c = sh(e), typeof c == "function") for (e = c.call(e), a = 0; !(s = e.next()).done; ) s = s.value, c = r + Er(s, a++), i += bn(s, t, n, c, o);
  else if (s === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function fn(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return bn(e, r, "", "", function(s) {
    return t.call(n, s, o++);
  }), r;
}
function ch(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Y = { current: null }, vn = { transition: null }, uh = { ReactCurrentDispatcher: Y, ReactCurrentBatchConfig: vn, ReactCurrentOwner: Fo };
function Ic() {
  throw Error("act(...) is not supported in production builds of React.");
}
T.Children = { map: fn, forEach: function(e, t, n) {
  fn(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return fn(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return fn(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Go(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
T.Component = kt;
T.Fragment = Jg;
T.Profiler = Zg;
T.PureComponent = $o;
T.StrictMode = Xg;
T.Suspense = nh;
T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = uh;
T.act = Ic;
T.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = yc({}, e.props), o = e.key, s = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (s = t.ref, i = Fo.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (c in t) Tc.call(t, c) && !bc.hasOwnProperty(c) && (r[c] = t[c] === void 0 && a !== void 0 ? a[c] : t[c]);
  }
  var c = arguments.length - 2;
  if (c === 1) r.children = n;
  else if (1 < c) {
    a = Array(c);
    for (var u = 0; u < c; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: rn, type: e.type, key: o, ref: s, props: r, _owner: i };
};
T.createContext = function(e) {
  return e = { $$typeof: eh, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Qg, _context: e }, e.Consumer = e;
};
T.createElement = vc;
T.createFactory = function(e) {
  var t = vc.bind(null, e);
  return t.type = e, t;
};
T.createRef = function() {
  return { current: null };
};
T.forwardRef = function(e) {
  return { $$typeof: th, render: e };
};
T.isValidElement = Go;
T.lazy = function(e) {
  return { $$typeof: oh, _payload: { _status: -1, _result: e }, _init: ch };
};
T.memo = function(e, t) {
  return { $$typeof: rh, type: e, compare: t === void 0 ? null : t };
};
T.startTransition = function(e) {
  var t = vn.transition;
  vn.transition = {};
  try {
    e();
  } finally {
    vn.transition = t;
  }
};
T.unstable_act = Ic;
T.useCallback = function(e, t) {
  return Y.current.useCallback(e, t);
};
T.useContext = function(e) {
  return Y.current.useContext(e);
};
T.useDebugValue = function() {
};
T.useDeferredValue = function(e) {
  return Y.current.useDeferredValue(e);
};
T.useEffect = function(e, t) {
  return Y.current.useEffect(e, t);
};
T.useId = function() {
  return Y.current.useId();
};
T.useImperativeHandle = function(e, t, n) {
  return Y.current.useImperativeHandle(e, t, n);
};
T.useInsertionEffect = function(e, t) {
  return Y.current.useInsertionEffect(e, t);
};
T.useLayoutEffect = function(e, t) {
  return Y.current.useLayoutEffect(e, t);
};
T.useMemo = function(e, t) {
  return Y.current.useMemo(e, t);
};
T.useReducer = function(e, t, n) {
  return Y.current.useReducer(e, t, n);
};
T.useRef = function(e) {
  return Y.current.useRef(e);
};
T.useState = function(e) {
  return Y.current.useState(e);
};
T.useSyncExternalStore = function(e, t, n) {
  return Y.current.useSyncExternalStore(e, t, n);
};
T.useTransition = function() {
  return Y.current.useTransition();
};
T.version = "18.3.1";
hc.exports = T;
var Lt = hc.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lh = Lt, dh = Symbol.for("react.element"), fh = Symbol.for("react.fragment"), ph = Object.prototype.hasOwnProperty, mh = lh.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, gh = { key: !0, ref: !0, __self: !0, __source: !0 };
function Rc(e, t, n) {
  var r, o = {}, s = null, i = null;
  n !== void 0 && (s = "" + n), t.key !== void 0 && (s = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) ph.call(t, r) && !gh.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: dh, type: e, key: s, ref: i, props: o, _owner: mh.current };
}
nr.Fragment = fh;
nr.jsx = Rc;
nr.jsxs = Rc;
gc.exports = nr;
var ht = gc.exports;
function hh(e) {
  const t = e.match(/^([^.]+)/);
  return t !== null && parseInt(t[0]) >= 17;
}
function _h(e, t) {
  const n = /* @__PURE__ */ new WeakSet();
  function r(o, s) {
    if (!n.has(o)) {
      if (o.cause)
        return n.add(o), r(o.cause, s);
      o.cause = s;
    }
  }
  r(e, t);
}
function yh(e, { componentStack: t }, n) {
  if (hh(Lt.version) && $n(e) && t) {
    const r = new Error(e.message);
    r.name = `React ErrorBoundary ${e.name}`, r.stack = t, _h(e, r);
  }
  return ut((r) => (r.setContext("react", { componentStack: t }), Vi(e, n)));
}
const Sh = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, Tr = {
  componentStack: null,
  error: null,
  eventId: null
};
let wc = class extends Lt.Component {
  constructor(t) {
    super(t), this.state = Tr, this._openFallbackReportDialog = !0;
    const n = w();
    n && t.showDialog && (this._openFallbackReportDialog = !1, this._cleanupHook = n.on("afterSendEvent", (r) => {
      !r.type && this._lastEventId && r.event_id === this._lastEventId && js({ ...t.dialogOptions, eventId: this._lastEventId });
    }));
  }
  componentDidCatch(t, n) {
    const { componentStack: r } = n, { beforeCapture: o, onError: s, showDialog: i, dialogOptions: a } = this.props;
    ut((c) => {
      o && o(c, t, r);
      const u = this.props.handled != null ? this.props.handled : !!this.props.fallback, l = yh(t, n, {
        mechanism: { handled: u, type: "auto.function.react.error_boundary" }
      });
      s && s(t, r, l), i && (this._lastEventId = l, this._openFallbackReportDialog && js({ ...a, eventId: l })), this.setState({ error: t, componentStack: r, eventId: l });
    });
  }
  componentDidMount() {
    const { onMount: t } = this.props;
    t && t();
  }
  componentWillUnmount() {
    const { error: t, componentStack: n, eventId: r } = this.state, { onUnmount: o } = this.props;
    o && (this.state === Tr ? o(null, null, null) : o(t, n, r)), this._cleanupHook && (this._cleanupHook(), this._cleanupHook = void 0);
  }
  resetErrorBoundary() {
    const { onReset: t } = this.props, { error: n, componentStack: r, eventId: o } = this.state;
    t && t(n, r, o), this.setState(Tr);
  }
  render() {
    const { fallback: t, children: n } = this.props, r = this.state;
    if (r.componentStack === null)
      return typeof n == "function" ? n() : n;
    const o = typeof t == "function" ? Lt.createElement(t, {
      error: r.error,
      componentStack: r.componentStack,
      resetError: () => this.resetErrorBoundary(),
      eventId: r.eventId
    }) : t;
    return Lt.isValidElement(o) ? o : (t && Sh && h.warn("fallback did not produce a valid ReactElement"), null);
  }
}, si = !1, br = null, vr = null;
function Eh() {
  if (si && br && vr)
    return { client: br, scope: vr };
  try {
    const e = gg(), t = Zn({
      browserTracingIntegrationOptions: {
        // Configure browser tracing if needed
      }
    }), n = Qn(t);
    try {
      const s = ja();
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", s);
    }
    try {
      const s = go({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new Yn({
      dsn: za,
      transport: Jn,
      stackParser: Xn,
      integrations: n,
      ...e
    }), o = new F();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), br = r, vr = o, si = !0, console.log("[v0][Sentry] Popup monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in popup:", e), console.warn("[v0][Sentry] Popup will continue without Sentry monitoring"), { client: null, scope: new F() };
  }
}
const { client: Ue, scope: V } = Eh(), Ac = (e) => Ue ? /* @__PURE__ */ ht.jsx(wc, { ...e }) : /* @__PURE__ */ ht.jsx(ht.Fragment, { children: e.children }), Th = {
  // ErrorBoundary component
  ErrorBoundary: Ac,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!V || !Ue))
      return V.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!V || !Ue))
      return V.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!V || !Ue))
        return qn(e, t, { scope: V });
    },
    warn: (e, t) => {
      if (!(!V || !Ue))
        return zn(e, t, { scope: V });
    },
    error: (e, t) => {
      if (!(!V || !Ue))
        return Wn(e, t, { scope: V });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !V || !Ue ? t({}) : Kt({ ...e, scope: V }, t),
  // Get client (for advanced usage)
  getClient: () => Ue,
  // Get scope (for advanced usage)
  getScope: () => V
}, Oc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: Ac,
  Sentry: Th,
  scope: V
}, Symbol.toStringTag, { value: "Module" }));
let ii = !1, Ir = null, Rr = null;
function bh() {
  if (ii && Ir && Rr)
    return { client: Ir, scope: Rr };
  try {
    const e = hg(), t = Zn({
      browserTracingIntegrationOptions: {
        // Configure browser tracing if needed
      }
    }), n = Qn(t);
    try {
      const s = ja();
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", s);
    }
    try {
      const s = go({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new Yn({
      dsn: za,
      transport: Jn,
      stackParser: Xn,
      integrations: n,
      ...e
    }), o = new F();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), Ir = r, Rr = o, ii = !0, console.log("[v0][Sentry] Options page monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in options page:", e), console.warn("[v0][Sentry] Options page will continue without Sentry monitoring"), { client: null, scope: new F() };
  }
}
const { client: $e, scope: J } = bh(), Dc = (e) => $e ? /* @__PURE__ */ ht.jsx(wc, { ...e }) : /* @__PURE__ */ ht.jsx(ht.Fragment, { children: e.children }), vh = {
  // ErrorBoundary component
  ErrorBoundary: Dc,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!J || !$e))
      return J.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!J || !$e))
      return J.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!J || !$e))
        return qn(e, t, { scope: J });
    },
    warn: (e, t) => {
      if (!(!J || !$e))
        return zn(e, t, { scope: J });
    },
    error: (e, t) => {
      if (!(!J || !$e))
        return Wn(e, t, { scope: J });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !J || !$e ? t({}) : Kt({ ...e, scope: J }, t),
  // Get client (for advanced usage)
  getClient: () => $e,
  // Get scope (for advanced usage)
  getScope: () => J
}, Nc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: Dc,
  Sentry: vh,
  scope: J
}, Symbol.toStringTag, { value: "Module" })), wr = "__V0_SENTRY_CONTENT_INITIALIZED";
let ai = !1, Ar = null, Or = null;
function Ih() {
  if (globalThis[wr] === !0 && ai && Ar && Or)
    return { client: Ar, scope: Or };
  globalThis[wr] = !0;
  try {
    const t = _g(), n = Zn({}), r = Qn(n), o = new Yn({
      dsn: Vr,
      transport: Jn,
      stackParser: Xn,
      integrations: r,
      ...t
    }), s = new F();
    return s.setClient(o), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([a, c]) => {
      s.setTag(a, c);
    }), o.init(), Ar = o, Or = s, ai = !0, Ln() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: o, scope: s };
  } catch (t) {
    return globalThis[wr] = !1, Ln() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", t), { client: null, scope: new F() };
  }
}
const { client: Xe, scope: X } = Ih(), Rh = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!X || !Xe))
      return X.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!X || !Xe))
      return X.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!X || !Xe))
        return qn(e, t, { scope: X });
    },
    warn: (e, t) => {
      if (!(!X || !Xe))
        return zn(e, t, { scope: X });
    },
    error: (e, t) => {
      if (!(!X || !Xe))
        return Wn(e, t, { scope: X });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !X || !Xe ? t({}) : Kt({ ...e, scope: X }, t),
  // Get client (for advanced usage)
  getClient: () => Xe,
  // Get scope (for advanced usage)
  getScope: () => X
}, kc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: Rh,
  scope: X
}, Symbol.toStringTag, { value: "Module" }));
