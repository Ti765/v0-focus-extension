const Mc = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = Mc;
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
const _ = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, v = globalThis, ot = "10.22.0";
function dt() {
  return zn(v), v;
}
function zn(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || ot, t[ot] = t[ot] || {};
}
function Rt(e, t, n = v) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[ot] = r[ot] || {};
  return o[e] || (o[e] = t());
}
const pi = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], Lc = "Sentry Logger ", Cn = {};
function Xt(e) {
  if (!("console" in v))
    return e();
  const t = v.console, n = {}, r = Object.keys(Cn);
  r.forEach((o) => {
    const s = Cn[o];
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
function xc() {
  oo().enabled = !0;
}
function Uc() {
  oo().enabled = !1;
}
function mi() {
  return oo().enabled;
}
function $c(...e) {
  ro("log", ...e);
}
function Bc(...e) {
  ro("warn", ...e);
}
function Fc(...e) {
  ro("error", ...e);
}
function ro(e, ...t) {
  _ && mi() && Xt(() => {
    v.console[e](`${Lc}[${e}]:`, ...t);
  });
}
function oo() {
  return _ ? Rt("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const h = {
  /** Enable logging. */
  enable: xc,
  /** Disable logging. */
  disable: Uc,
  /** Check if logging is enabled. */
  isEnabled: mi,
  /** Log a message. */
  log: $c,
  /** Log a warning. */
  warn: Bc,
  /** Log an error. */
  error: Fc
}, gi = 50, ct = "?", Jo = /\(error: (.*)\)/, Xo = /captureMessage|captureException/;
function Gc(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const s = [], i = n.split(`
`);
    for (let a = r; a < i.length; a++) {
      let c = i[a];
      c.length > 1024 && (c = c.slice(0, 1024));
      const u = Jo.test(c) ? c.replace(Jo, "$1") : c;
      if (!u.match(/\S*Error: /)) {
        for (const l of t) {
          const d = l(u);
          if (d) {
            s.push(d);
            break;
          }
        }
        if (s.length >= gi + o)
          break;
      }
    }
    return Hc(s.slice(o));
  };
}
function Hc(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(pn(t).function || "") && t.pop(), t.reverse(), Xo.test(pn(t).function || "") && (t.pop(), Xo.test(pn(t).function || "") && t.pop()), t.slice(0, gi).map((n) => ({
    ...n,
    filename: n.filename || pn(t).filename,
    function: n.function || ct
  }));
}
function pn(e) {
  return e[e.length - 1] || {};
}
const dr = "<anonymous>";
function Re(e) {
  try {
    return !e || typeof e != "function" ? dr : e.name || dr;
  } catch {
    return dr;
  }
}
function Zo(e) {
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
const Tn = {}, Qo = {};
function je(e, t) {
  Tn[e] = Tn[e] || [], Tn[e].push(t);
}
function qe(e, t) {
  if (!Qo[e]) {
    Qo[e] = !0;
    try {
      t();
    } catch (n) {
      _ && h.error(`Error while instrumenting ${e}`, n);
    }
  }
}
function ie(e, t) {
  const n = e && Tn[e];
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
let fr = null;
function hi(e) {
  const t = "error";
  je(t, e), qe(t, jc);
}
function jc() {
  fr = v.onerror, v.onerror = function(e, t, n, r, o) {
    return ie("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), fr ? fr.apply(this, arguments) : !1;
  }, v.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let pr = null;
function _i(e) {
  const t = "unhandledrejection";
  je(t, e), qe(t, qc);
}
function qc() {
  pr = v.onunhandledrejection, v.onunhandledrejection = function(e) {
    return ie("unhandledrejection", e), pr ? pr.apply(this, arguments) : !0;
  }, v.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const yi = Object.prototype.toString;
function so(e) {
  switch (yi.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return we(e, Error);
  }
}
function wt(e, t) {
  return yi.call(e) === `[object ${t}]`;
}
function Si(e) {
  return wt(e, "ErrorEvent");
}
function es(e) {
  return wt(e, "DOMError");
}
function zc(e) {
  return wt(e, "DOMException");
}
function ve(e) {
  return wt(e, "String");
}
function Wn(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function ut(e) {
  return e === null || Wn(e) || typeof e != "object" && typeof e != "function";
}
function jt(e) {
  return wt(e, "Object");
}
function Yn(e) {
  return typeof Event < "u" && we(e, Event);
}
function Wc(e) {
  return typeof Element < "u" && we(e, Element);
}
function Yc(e) {
  return wt(e, "RegExp");
}
function At(e) {
  return !!(e?.then && typeof e.then == "function");
}
function Kc(e) {
  return jt(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function we(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function Ei(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function Ti(e) {
  return typeof Request < "u" && we(e, Request);
}
const io = v, Vc = 80;
function _e(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let s = 0, i = 0;
    const a = " > ", c = a.length;
    let u;
    const l = Array.isArray(t) ? t : t.keyAttrs, d = !Array.isArray(t) && t.maxStringLength || Vc;
    for (; n && s++ < r && (u = Jc(n, l), !(u === "html" || s > 1 && i + o.length * c + u.length >= d)); )
      o.push(u), i += u.length, n = n.parentNode;
    return o.reverse().join(a);
  } catch {
    return "<unknown>";
  }
}
function Jc(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if (io.HTMLElement && n instanceof HTMLElement && n.dataset) {
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
function Kn() {
  try {
    return io.document.location.href;
  } catch {
    return "";
  }
}
function bi(e) {
  if (!io.HTMLElement)
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
function Pn(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function ts(e, t) {
  if (!Array.isArray(e))
    return "";
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    try {
      Ei(o) ? n.push("[VueViewModel]") : n.push(String(o));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(t);
}
function bn(e, t, n = !1) {
  return ve(e) ? Yc(t) ? t.test(e) : ve(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function Fe(e, t = [], n = !1) {
  return t.some((r) => bn(e, r, n));
}
function ne(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && vi(o, r);
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
function vi(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, re(e, "__sentry_original__", t);
  } catch {
  }
}
function ao(e) {
  return e.__sentry_original__;
}
function Ii(e) {
  if (so(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...rs(e)
    };
  if (Yn(e)) {
    const t = {
      type: e.type,
      target: ns(e.target),
      currentTarget: ns(e.currentTarget),
      ...rs(e)
    };
    return typeof CustomEvent < "u" && we(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function ns(e) {
  try {
    return Wc(e) ? _e(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function rs(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function Xc(e, t = 40) {
  const n = Object.keys(Ii(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return Pn(r, t);
  for (let o = n.length; o > 0; o--) {
    const s = n.slice(0, o).join(", ");
    if (!(s.length > t))
      return o === n.length ? s : Pn(s, t);
  }
  return "";
}
function Zc() {
  const e = v;
  return e.crypto || e.msCrypto;
}
let mr;
function Qc() {
  return Math.random() * 16;
}
function ae(e = Zc()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return mr || (mr = "10000000100040008000" + 1e11), mr.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (Qc() & 15) >> t / 4).toString(16)
    )
  );
}
function Ri(e) {
  return e.exception?.values?.[0];
}
function et(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = Ri(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function Mr(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], s = o[0] = o[0] || {};
  s.value || (s.value = t || ""), s.type || (s.type = "Error");
}
function yt(e, t) {
  const n = Ri(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const s = { ...o?.data, ...t.data };
    n.mechanism.data = s;
  }
}
function os(e) {
  if (eu(e))
    return !0;
  try {
    re(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function eu(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const wi = 1e3;
function ft() {
  return Date.now() / wi;
}
function tu() {
  const { performance: e } = v;
  if (!e?.now || !e.timeOrigin)
    return ft;
  const t = e.timeOrigin;
  return () => (t + e.now()) / wi;
}
let ss;
function U() {
  return (ss ?? (ss = tu()))();
}
let gr;
function nu() {
  const { performance: e } = v;
  if (!e?.now)
    return [void 0, "none"];
  const t = 3600 * 1e3, n = e.now(), r = Date.now(), o = e.timeOrigin ? Math.abs(e.timeOrigin + n - r) : t, s = o < t, i = e.timing?.navigationStart, c = typeof i == "number" ? Math.abs(i + n - r) : t, u = c < t;
  return s || u ? o <= c ? [e.timeOrigin, "timeOrigin"] : [i, "navigationStart"] : [r, "dateNow"];
}
function oe() {
  return gr || (gr = nu()), gr[0];
}
function ru(e) {
  const t = U(), n = {
    sid: ae(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => su(n)
  };
  return e && St(n, e), n;
}
function St(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || U(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : ae()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function ou(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), St(e, n);
}
function su(e) {
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
function Zt(e, t, n = 2) {
  if (!t || typeof t != "object" || n <= 0)
    return t;
  if (e && Object.keys(t).length === 0)
    return e;
  const r = { ...e };
  for (const o in t)
    Object.prototype.hasOwnProperty.call(t, o) && (r[o] = Zt(r[o], t[o], n - 1));
  return r;
}
function Ae() {
  return ae();
}
function Ie() {
  return ae().substring(16);
}
const Lr = "_sentrySpan";
function Et(e, t) {
  t ? re(e, Lr, t) : delete e[Lr];
}
function qt(e) {
  return e[Lr];
}
const iu = 100;
class C {
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
    const t = new C();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, Et(t, qt(this)), t;
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
    }, this._session && St(this._session, { user: t }), this._notifyScopeListeners(), this;
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
    const n = typeof t == "function" ? t(this) : t, r = n instanceof C ? n.getScopeData() : jt(n) ? t : void 0, { tags: o, extra: s, user: i, contexts: a, level: c, fingerprint: u = [], propagationContext: l } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...s }, this._contexts = { ...this._contexts, ...a }, i && Object.keys(i).length && (this._user = i), c && (this._level = c), u.length && (this._fingerprint = u), l && (this._propagationContext = l), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, Et(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: Ae(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : iu;
    if (r <= 0)
      return this;
    const o = {
      timestamp: ft(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? Pn(t.message, 2048) : t.message
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
      span: qt(this)
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(t) {
    return this._sdkProcessingMetadata = Zt(this._sdkProcessingMetadata, t, 2), this;
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
    const r = n?.event_id || ae();
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
    const o = r?.event_id || ae();
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
    const r = n?.event_id || ae();
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
function au() {
  return Rt("defaultCurrentScope", () => new C());
}
function cu() {
  return Rt("defaultIsolationScope", () => new C());
}
class uu {
  constructor(t, n) {
    let r;
    t ? r = t : r = new C();
    let o;
    n ? o = n : o = new C(), this._stack = [{ scope: r }], this._isolationScope = o;
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
    return At(r) ? r.then(
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
function Tt() {
  const e = dt(), t = zn(e);
  return t.stack = t.stack || new uu(au(), cu());
}
function lu(e) {
  return Tt().withScope(e);
}
function du(e, t) {
  const n = Tt();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function is(e) {
  return Tt().withScope(() => e(Tt().getIsolationScope()));
}
function fu() {
  return {
    withIsolationScope: is,
    withScope: lu,
    withSetScope: du,
    withSetIsolationScope: (e, t) => is(t),
    getCurrentScope: () => Tt().getScope(),
    getIsolationScope: () => Tt().getIsolationScope()
  };
}
function Ot(e) {
  const t = zn(e);
  return t.acs ? t.acs : fu();
}
function D() {
  const e = dt();
  return Ot(e).getCurrentScope();
}
function ze() {
  const e = dt();
  return Ot(e).getIsolationScope();
}
function Ai() {
  return Rt("globalScope", () => new C());
}
function Qt(...e) {
  const t = dt(), n = Ot(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function w() {
  return D().getClient();
}
function Oi(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, s = {
    trace_id: n,
    span_id: o || Ie()
  };
  return r && (s.parent_span_id = r), s;
}
const he = "sentry.source", co = "sentry.sample_rate", Di = "sentry.previous_trace_sample_rate", Oe = "sentry.op", P = "sentry.origin", zt = "sentry.idle_span_finish_reason", en = "sentry.measurement_unit", tn = "sentry.measurement_value", as = "sentry.custom_span_name", uo = "sentry.profile_id", Dt = "sentry.exclusive_time", pu = "sentry.link.type", mu = 0, Ni = 1, x = 2;
function gu(e) {
  if (e < 400 && e >= 100)
    return { code: Ni };
  if (e >= 400 && e < 500)
    switch (e) {
      case 401:
        return { code: x, message: "unauthenticated" };
      case 403:
        return { code: x, message: "permission_denied" };
      case 404:
        return { code: x, message: "not_found" };
      case 409:
        return { code: x, message: "already_exists" };
      case 413:
        return { code: x, message: "failed_precondition" };
      case 429:
        return { code: x, message: "resource_exhausted" };
      case 499:
        return { code: x, message: "cancelled" };
      default:
        return { code: x, message: "invalid_argument" };
    }
  if (e >= 500 && e < 600)
    switch (e) {
      case 501:
        return { code: x, message: "unimplemented" };
      case 503:
        return { code: x, message: "unavailable" };
      case 504:
        return { code: x, message: "deadline_exceeded" };
      default:
        return { code: x, message: "internal_error" };
    }
  return { code: x, message: "unknown_error" };
}
function ki(e, t) {
  e.setAttribute("http.response.status_code", t);
  const n = gu(t);
  n.message !== "unknown_error" && e.setStatus(n);
}
const Ci = "_sentryScope", Pi = "_sentryIsolationScope";
function hu(e) {
  try {
    const t = v.WeakRef;
    if (typeof t == "function")
      return new t(e);
  } catch {
  }
  return e;
}
function _u(e) {
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
function yu(e, t, n) {
  e && (re(e, Pi, hu(n)), re(e, Ci, t));
}
function Mn(e) {
  const t = e;
  return {
    scope: t[Ci],
    isolationScope: _u(t[Pi])
  };
}
const lo = "sentry-", Su = /^sentry-/, Eu = 8192;
function Mi(e) {
  const t = bu(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, s]) => {
    if (o.match(Su)) {
      const i = o.slice(lo.length);
      r[i] = s;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function Tu(e) {
  if (!e)
    return;
  const t = Object.entries(e).reduce(
    (n, [r, o]) => (o && (n[`${lo}${r}`] = o), n),
    {}
  );
  return vu(t);
}
function bu(e) {
  if (!(!e || !ve(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = cs(n);
      return Object.entries(r).forEach(([o, s]) => {
        t[o] = s;
      }), t;
    }, {}) : cs(e);
}
function cs(e) {
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
function vu(e) {
  if (Object.keys(e).length !== 0)
    return Object.entries(e).reduce((t, [n, r], o) => {
      const s = `${encodeURIComponent(n)}=${encodeURIComponent(r)}`, i = o === 0 ? s : `${t},${s}`;
      return i.length > Eu ? (_ && h.warn(
        `Not adding key: ${n} with val: ${r} to baggage header due to exceeding baggage size limits.`
      ), t) : i;
    }, "");
}
const Iu = /^o(\d+)\./, Ru = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function wu(e) {
  return e === "http" || e === "https";
}
function Nt(e, t = !1) {
  const { host: n, path: r, pass: o, port: s, projectId: i, protocol: a, publicKey: c } = e;
  return `${a}://${c}${t && o ? `:${o}` : ""}@${n}${s ? `:${s}` : ""}/${r && `${r}/`}${i}`;
}
function Au(e) {
  const t = Ru.exec(e);
  if (!t) {
    Xt(() => {
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
  return Li({ host: s, pass: o, path: c, projectId: u, port: i, protocol: n, publicKey: r });
}
function Li(e) {
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
function Ou(e) {
  if (!_)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((i) => e[i] ? !1 : (h.error(`Invalid Sentry Dsn: ${i} missing`), !0)) ? !1 : n.match(/^\d+$/) ? wu(r) ? t && isNaN(parseInt(t, 10)) ? (h.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (h.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (h.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Du(e) {
  return e.match(Iu)?.[1];
}
function Nu(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = Du(n)), r;
}
function ku(e) {
  const t = typeof e == "string" ? Au(e) : Li(e);
  if (!(!t || !Ou(t)))
    return t;
}
function Wt(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const xi = new RegExp(
  "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
  // whitespace
);
function Cu(e) {
  if (!e)
    return;
  const t = e.match(xi);
  if (!t)
    return;
  let n;
  return t[3] === "1" ? n = !0 : t[3] === "0" && (n = !1), {
    traceId: t[1],
    parentSampled: n,
    parentSpanId: t[2]
  };
}
function Pu(e, t) {
  const n = Cu(e), r = Mi(t);
  if (!n?.traceId)
    return {
      traceId: Ae(),
      sampleRand: Math.random()
    };
  const o = Mu(n, r);
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
function Ui(e = Ae(), t = Ie(), n) {
  let r = "";
  return n !== void 0 && (r = n ? "-1" : "-0"), `${e}-${t}${r}`;
}
function $i(e = Ae(), t = Ie(), n) {
  return `00-${e}-${t}-${n ? "01" : "00"}`;
}
function Mu(e, t) {
  const n = Wt(t?.sample_rand);
  if (n !== void 0)
    return n;
  const r = Wt(t?.sample_rate);
  return r && e?.parentSampled !== void 0 ? e.parentSampled ? (
    // Returns a sample rand with positive sampling decision [0, sampleRate)
    Math.random() * r
  ) : (
    // Returns a sample rand with negative sampling decision [sampleRate, 1)
    r + Math.random() * (1 - r)
  ) : Math.random();
}
const Bi = 0, fo = 1;
let us = !1;
function Lu(e) {
  const { spanId: t, traceId: n } = e.spanContext(), { data: r, op: o, parent_span_id: s, status: i, origin: a, links: c } = R(e);
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
function Fi(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : R(e).parent_span_id, s = Mn(e).scope, i = r ? s?.getPropagationContext().propagationSpanId || Ie() : t;
  return {
    parent_span_id: o,
    span_id: i,
    trace_id: n
  };
}
function xu(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = We(e);
  return Ui(t, n, r);
}
function Uu(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = We(e);
  return $i(t, n, r);
}
function Gi(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: s }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === fo,
      attributes: s,
      ...o
    }));
}
function st(e) {
  return typeof e == "number" ? ls(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? ls(e.getTime()) : U();
}
function ls(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function R(e) {
  if (Bu(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if ($u(e)) {
    const { attributes: r, startTime: o, name: s, endTime: i, status: a, links: c } = e, u = "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: s,
      parent_span_id: u,
      start_timestamp: st(o),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: st(i) || void 0,
      status: Hi(a),
      op: r[Oe],
      origin: r[P],
      links: Gi(c)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function $u(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function Bu(e) {
  return typeof e.getSpanJSON == "function";
}
function We(e) {
  const { traceFlags: t } = e.spanContext();
  return t === fo;
}
function Hi(e) {
  if (!(!e || e.code === mu))
    return e.code === Ni ? "ok" : e.message || "unknown_error";
}
const it = "_sentryChildSpans", xr = "_sentryRootSpan";
function ji(e, t) {
  const n = e[xr] || e;
  re(t, xr, n), e[it] ? e[it].add(t) : re(e, it, /* @__PURE__ */ new Set([t]));
}
function Fu(e, t) {
  e[it] && e[it].delete(t);
}
function vn(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    if (!t.has(r) && We(r)) {
      t.add(r);
      const o = r[it] ? Array.from(r[it]) : [];
      for (const s of o)
        n(s);
    }
  }
  return n(e), Array.from(t);
}
function K(e) {
  return e[xr] || e;
}
function Q() {
  const e = dt(), t = Ot(e);
  return t.getActiveSpan ? t.getActiveSpan() : qt(D());
}
function Ur() {
  us || (Xt(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), us = !0);
}
let ds = !1;
function Gu() {
  if (ds)
    return;
  function e() {
    const t = Q(), n = t && K(t);
    if (n) {
      const r = "internal_error";
      _ && h.log(`[Tracing] Root span: ${r} -> Global error occurred`), n.setStatus({ code: x, message: r });
    }
  }
  e.tag = "sentry_tracingErrorCallback", ds = !0, hi(e), _i(e);
}
function de(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = e || w()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function fs(e) {
  h.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function Ln(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (ju(n)) {
      if (bn(e.description, n))
        return _ && fs(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? bn(e.description, n.name) : !0, o = n.op ? e.op && bn(e.op, n.op) : !0;
    if (r && o)
      return _ && fs(e), !0;
  }
  return !1;
}
function Hu(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function ju(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const po = "production", qi = "_frozenDsc";
function In(e, t) {
  re(e, qi, t);
}
function zi(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || po,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: Nu(t)
  };
  return t.emit("createDsc", o), o;
}
function mo(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || zi(n.traceId, e);
}
function De(e) {
  const t = w();
  if (!t)
    return {};
  const n = K(e), r = R(n), o = r.data, s = n.spanContext().traceState, i = s?.get("sentry.sample_rate") ?? o[co] ?? o[Di];
  function a(p) {
    return (typeof i == "number" || typeof i == "string") && (p.sample_rate = `${i}`), p;
  }
  const c = n[qi];
  if (c)
    return a(c);
  const u = s?.get("sentry.dsc"), l = u && Mi(u);
  if (l)
    return a(l);
  const d = zi(e.spanContext().traceId, t), m = o[he], f = r.description;
  return m !== "url" && f && (d.transaction = f), de() && (d.sampled = String(We(n)), d.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  s?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  Mn(n).scope?.getPropagationContext().sampleRand.toString()), a(d), t.emit("createDsc", d, n), d;
}
class Ge {
  constructor(t = {}) {
    this._traceId = t.traceId || Ae(), this._spanId = t.spanId || Ie();
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: Bi
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
    return $r("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function Wi(e, t = 3, n = 100 * 1024) {
  const r = me(e, t);
  return Yu(r) > n ? Wi(e, t - 1, n) : r;
}
function $r(e, t, n = 1 / 0, r = 1 / 0, o = Ku()) {
  const [s, i] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const a = qu(e, t);
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
      return $r("", f, c - 1, r, o);
    } catch {
    }
  const l = Array.isArray(t) ? [] : {};
  let d = 0;
  const m = Ii(t);
  for (const f in m) {
    if (!Object.prototype.hasOwnProperty.call(m, f))
      continue;
    if (d >= r) {
      l[f] = "[MaxProperties ~]";
      break;
    }
    const p = m[f];
    l[f] = $r(f, p, c - 1, r, o), d++;
  }
  return i(t), l;
}
function qu(e, t) {
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
    if (Ei(t))
      return "[VueViewModel]";
    if (Kc(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${Re(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = zu(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function zu(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function Wu(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function Yu(e) {
  return Wu(JSON.stringify(e));
}
function Ku() {
  const e = /* @__PURE__ */ new WeakSet();
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1);
  }
  function n(r) {
    e.delete(r);
  }
  return [t, n];
}
function pt(e, t = []) {
  return [e, t];
}
function Vu(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function ps(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function Br(e) {
  const t = zn(v);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function Ju(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(s) {
    typeof r == "string" ? r = typeof s == "string" ? r + s : [Br(r), s] : r.push(typeof s == "string" ? Br(s) : s);
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
  return typeof r == "string" ? r : Xu(r);
}
function Xu(e) {
  const t = e.reduce((o, s) => o + s.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function Zu(e) {
  return [{
    type: "span"
  }, e];
}
function Qu(e) {
  const t = typeof e.data == "string" ? Br(e.data) : e.data;
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
const el = {
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
function ms(e) {
  return el[e];
}
function Yi(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function tl(e, t, n, r) {
  const o = e.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: e.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...t && { sdk: t },
    ...!!n && r && { dsn: Nt(r) },
    ...o && {
      trace: o
    }
  };
}
function nl(e, t) {
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
function rl(e, t, n, r) {
  const o = Yi(n), s = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: Nt(t) }
  }, i = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return pt(s, [i]);
}
function ol(e, t, n, r) {
  const o = Yi(n), s = e.type && e.type !== "replay_event" ? e.type : "event";
  nl(e, n?.sdk);
  const i = tl(e, o, r, t);
  return delete e.sdkProcessingMetadata, pt(i, [[{ type: s }, e]]);
}
function sl(e, t) {
  function n(f) {
    return !!f.trace_id && !!f.public_key;
  }
  const r = De(e[0]), o = t?.getDsn(), s = t?.getOptions().tunnel, i = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...n(r) && { trace: r },
    ...!!s && o && { dsn: Nt(o) }
  }, { beforeSendSpan: a, ignoreSpans: c } = t?.getOptions() || {}, u = c?.length ? e.filter((f) => !Ln(R(f), c)) : e, l = e.length - u.length;
  l && t?.recordDroppedEvent("before_send", "span", l);
  const d = a ? (f) => {
    const p = R(f), S = a(p);
    return S || (Ur(), p);
  } : R, m = [];
  for (const f of u) {
    const p = d(f);
    p && m.push(Zu(p));
  }
  return pt(i, m);
}
function il(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >", parent_span_id: r } = R(e), { spanId: o } = e.spanContext(), s = We(e), i = K(e), a = i === e, c = `[Tracing] Starting ${s ? "sampled" : "unsampled"} ${a ? "root " : ""}span`, u = [`op: ${n}`, `name: ${t}`, `ID: ${o}`];
  if (r && u.push(`parent ID: ${r}`), !a) {
    const { op: l, description: d } = R(i);
    u.push(`root ID: ${i.spanContext().spanId}`), l && u.push(`root op: ${l}`), d && u.push(`root description: ${d}`);
  }
  h.log(`${c}
  ${u.join(`
  `)}`);
}
function al(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >" } = R(e), { spanId: r } = e.spanContext(), s = K(e) === e, i = `[Tracing] Finishing "${n}" ${s ? "root " : ""}span "${t}" with ID ${r}`;
  h.log(i);
}
function cl(e, t, n, r = Q()) {
  const o = r && K(r);
  o && (_ && h.log(`[Measurement] Setting measurement on root span: ${e} = ${t} ${n}`), o.addEvent(e, {
    [tn]: t,
    [en]: n
  }));
}
function gs(e) {
  if (!e || e.length === 0)
    return;
  const t = {};
  return e.forEach((n) => {
    const r = n.attributes || {}, o = r[en], s = r[tn];
    typeof o == "string" && typeof s == "number" && (t[n.name] = { value: s, unit: o });
  }), t;
}
const hs = 1e3;
class Vn {
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
    this._traceId = t.traceId || Ae(), this._spanId = t.spanId || Ie(), this._startTime = t.startTimestamp || U(), this._links = t.links, this._attributes = {}, this.setAttributes({
      [P]: "manual",
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
      traceFlags: r ? fo : Bi
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
    this._startTime = st(t);
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
    this._endTime || (this._endTime = st(t), al(this), this._onSpanEnded());
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
      status: Hi(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[P],
      profile_id: this._attributes[uo],
      exclusive_time: this._attributes[Dt],
      measurements: gs(this._events),
      is_segment: this._isStandaloneSpan && K(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? K(this).spanContext().spanId : void 0,
      links: Gi(this._links)
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
    const o = _s(n) ? n : r || U(), s = _s(n) ? {} : n || {}, i = {
      name: t,
      time: st(o),
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
    if (t && t.emit("spanEnd", this), !(this._isStandaloneSpan || this === K(this)))
      return;
    if (this._isStandaloneSpan) {
      this._sampled ? ll(sl([this], t)) : (_ && h.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled."), t && t.recordDroppedEvent("sample_rate", "span"));
      return;
    }
    const r = this._convertSpanToTransaction();
    r && (Mn(this).scope || D()).captureEvent(r);
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!ys(R(this)))
      return;
    this._name || (_ && h.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), this._name = "<unlabeled transaction>");
    const { scope: t, isolationScope: n } = Mn(this), r = t?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
    if (this._sampled !== !0)
      return;
    const s = vn(this).filter((l) => l !== this && !ul(l)).map((l) => R(l)).filter(ys), i = this._attributes[he];
    delete this._attributes[as], s.forEach((l) => {
      delete l.data[as];
    });
    const a = {
      contexts: {
        trace: Lu(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        s.length > hs ? s.sort((l, d) => l.start_timestamp - d.start_timestamp).slice(0, hs) : s
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
    }, c = gs(this._events);
    return c && Object.keys(c).length && (_ && h.log(
      "[Measurements] Adding measurements to transaction event",
      JSON.stringify(c, void 0, 2)
    ), a.measurements = c), a;
  }
}
function _s(e) {
  return e && typeof e == "number" || e instanceof Date || Array.isArray(e);
}
function ys(e) {
  return !!e.start_timestamp && !!e.timestamp && !!e.span_id && !!e.trace_id;
}
function ul(e) {
  return e instanceof Vn && e.isStandaloneSpan();
}
function ll(e) {
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
function dl(e, t, n = () => {
}, r = () => {
}) {
  let o;
  try {
    o = e();
  } catch (s) {
    throw t(s), n(), s;
  }
  return fl(o, t, n, r);
}
function fl(e, t, n, r) {
  return At(e) ? e.then(
    (o) => (n(), r(o), o),
    (o) => {
      throw t(o), n(), o;
    }
  ) : (n(), r(e), e);
}
function pl(e, t, n) {
  if (!de(e))
    return [!1];
  let r, o;
  typeof e.tracesSampler == "function" ? (o = e.tracesSampler({
    ...t,
    inheritOrSampleWith: (a) => typeof t.parentSampleRate == "number" ? t.parentSampleRate : typeof t.parentSampled == "boolean" ? Number(t.parentSampled) : a
  }), r = !0) : t.parentSampled !== void 0 ? o = t.parentSampled : typeof e.tracesSampleRate < "u" && (o = e.tracesSampleRate, r = !0);
  const s = Wt(o);
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
const Ki = "__SENTRY_SUPPRESS_TRACING__";
function nn(e, t) {
  const n = ho();
  if (n.startSpan)
    return n.startSpan(e, t);
  const r = Ji(e), { forceTransaction: o, parentSpan: s, scope: i } = e, a = i?.clone();
  return Qt(a, () => gl(s)(() => {
    const u = D(), l = Xi(u, s), m = e.onlyIfParent && !l ? new Ge() : Vi({
      parentSpan: l,
      spanArguments: r,
      forceTransaction: o,
      scope: u
    });
    return Et(u, m), dl(
      () => t(m),
      () => {
        const { status: f } = R(m);
        m.isRecording() && (!f || f === "ok") && m.setStatus({ code: x, message: "internal_error" });
      },
      () => {
        m.end();
      }
    );
  }));
}
function kt(e) {
  const t = ho();
  if (t.startInactiveSpan)
    return t.startInactiveSpan(e);
  const n = Ji(e), { forceTransaction: r, parentSpan: o } = e;
  return (e.scope ? (i) => Qt(e.scope, i) : o !== void 0 ? (i) => go(o, i) : (i) => i())(() => {
    const i = D(), a = Xi(i, o);
    return e.onlyIfParent && !a ? new Ge() : Vi({
      parentSpan: a,
      spanArguments: n,
      forceTransaction: r,
      scope: i
    });
  });
}
function go(e, t) {
  const n = ho();
  return n.withActiveSpan ? n.withActiveSpan(e, t) : Qt((r) => (Et(r, e || void 0), t(r)));
}
function Vi({
  parentSpan: e,
  spanArguments: t,
  forceTransaction: n,
  scope: r
}) {
  if (!de()) {
    const i = new Ge();
    if (n || !e) {
      const a = {
        sampled: "false",
        sample_rate: "0",
        transaction: t.name,
        ...De(i)
      };
      In(i, a);
    }
    return i;
  }
  const o = ze();
  let s;
  if (e && !n)
    s = ml(e, r, t), ji(e, s);
  else if (e) {
    const i = De(e), { traceId: a, spanId: c } = e.spanContext(), u = We(e);
    s = Ss(
      {
        traceId: a,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), In(s, i);
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
    s = Ss(
      {
        traceId: i,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), a && In(s, a);
  }
  return il(s), yu(s, r, o), s;
}
function Ji(e) {
  const n = {
    isStandalone: (e.experimental || {}).standalone,
    ...e
  };
  if (e.startTime) {
    const r = { ...n };
    return r.startTimestamp = st(e.startTime), delete r.startTime, r;
  }
  return n;
}
function ho() {
  const e = dt();
  return Ot(e);
}
function Ss(e, t, n) {
  const r = w(), o = r?.getOptions() || {}, { name: s = "" } = e, i = { spanAttributes: { ...e.attributes }, spanName: s, parentSampled: n };
  r?.emit("beforeSampling", i, { decision: !1 });
  const a = i.parentSampled ?? n, c = i.spanAttributes, u = t.getPropagationContext(), [l, d, m] = t.getScopeData().sdkProcessingMetadata[Ki] ? [!1] : pl(
    o,
    {
      name: s,
      parentSampled: a,
      attributes: c,
      parentSampleRate: Wt(u.dsc?.sample_rate)
    },
    u.sampleRand
  ), f = new Vn({
    ...e,
    attributes: {
      [he]: "custom",
      [co]: d !== void 0 && m ? d : void 0,
      ...c
    },
    sampled: l
  });
  return !l && r && (_ && h.log("[Tracing] Discarding root span because its trace was not chosen to be sampled."), r.recordDroppedEvent("sample_rate", "transaction")), r && r.emit("spanStart", f), f;
}
function ml(e, t, n) {
  const { spanId: r, traceId: o } = e.spanContext(), s = t.getScopeData().sdkProcessingMetadata[Ki] ? !1 : We(e), i = s ? new Vn({
    ...n,
    parentSpanId: r,
    traceId: o,
    sampled: s
  }) : new Ge({ traceId: o });
  ji(e, i);
  const a = w();
  return a && (a.emit("spanStart", i), n.endTimestamp && a.emit("spanEnd", i)), i;
}
function Xi(e, t) {
  if (t)
    return t;
  if (t === null)
    return;
  const n = qt(e);
  if (!n)
    return;
  const r = w();
  return (r ? r.getOptions() : {}).parentSpanIsAlwaysRootSpan ? K(n) : n;
}
function gl(e) {
  return e !== void 0 ? (t) => go(e, t) : (t) => t();
}
const Rn = {
  idleTimeout: 1e3,
  finalTimeout: 3e4,
  childSpanTimeout: 15e3
}, hl = "heartbeatFailed", _l = "idleTimeout", yl = "finalTimeout", Sl = "externalFinish";
function Zi(e, t = {}) {
  const n = /* @__PURE__ */ new Map();
  let r = !1, o, s = Sl, i = !t.disableAutoFinish;
  const a = [], {
    idleTimeout: c = Rn.idleTimeout,
    finalTimeout: u = Rn.finalTimeout,
    childSpanTimeout: l = Rn.childSpanTimeout,
    beforeSpanEnd: d,
    trimIdleSpanEndTimestamp: m = !0
  } = t, f = w();
  if (!f || !de()) {
    const b = new Ge(), M = {
      sample_rate: "0",
      sampled: "false",
      ...De(b)
    };
    return In(b, M), b;
  }
  const p = D(), S = Q(), y = El(e);
  y.end = new Proxy(y.end, {
    apply(b, M, Ce) {
      if (d && d(y), M instanceof Ge)
        return;
      const [ye, ...Y] = Ce, Se = ye || U(), L = st(Se), Ke = vn(y).filter((I) => I !== y), Ve = R(y);
      if (!Ke.length || !m)
        return gt(L), Reflect.apply(b, M, [L, ...Y]);
      const ce = f.getOptions().ignoreSpans, Pe = Ke?.reduce((I, ee) => {
        const te = R(ee);
        return !te.timestamp || ce && Ln(te, ce) ? I : I ? Math.max(I, te.timestamp) : te.timestamp;
      }, void 0), O = Ve.start_timestamp, H = Math.min(
        O ? O + u / 1e3 : 1 / 0,
        Math.max(O || -1 / 0, Math.min(L, Pe || 1 / 0))
      );
      return gt(H), Reflect.apply(b, M, [H, ...Y]);
    }
  });
  function G() {
    o && (clearTimeout(o), o = void 0);
  }
  function W(b) {
    G(), o = setTimeout(() => {
      !r && n.size === 0 && i && (s = _l, y.end(b));
    }, c);
  }
  function ke(b) {
    o = setTimeout(() => {
      !r && i && (s = hl, y.end(b));
    }, l);
  }
  function Ye(b) {
    G(), n.set(b, !0);
    const M = U();
    ke(M + l / 1e3);
  }
  function mt(b) {
    if (n.has(b) && n.delete(b), n.size === 0) {
      const M = U();
      W(M + c / 1e3);
    }
  }
  function gt(b) {
    r = !0, n.clear(), a.forEach((L) => L()), Et(p, S);
    const M = R(y), { start_timestamp: Ce } = M;
    if (!Ce)
      return;
    M.data[zt] || y.setAttribute(zt, s), h.log(`[Tracing] Idle span "${M.op}" finished`);
    const Y = vn(y).filter((L) => L !== y);
    let Se = 0;
    Y.forEach((L) => {
      L.isRecording() && (L.setStatus({ code: x, message: "cancelled" }), L.end(b), _ && h.log("[Tracing] Cancelling span since span ended early", JSON.stringify(L, void 0, 2)));
      const Ke = R(L), { timestamp: Ve = 0, start_timestamp: ce = 0 } = Ke, Pe = ce <= b, O = (u + c) / 1e3, H = Ve - ce <= O;
      if (_) {
        const I = JSON.stringify(L, void 0, 2);
        Pe ? H || h.log("[Tracing] Discarding span since it finished after idle span final timeout", I) : h.log("[Tracing] Discarding span since it happened after idle span was finished", I);
      }
      (!H || !Pe) && (Fu(y, L), Se++);
    }), Se > 0 && y.setAttribute("sentry.idle_span_discarded_spans", Se);
  }
  return a.push(
    f.on("spanStart", (b) => {
      if (r || b === y || R(b).timestamp || b instanceof Vn && b.isStandaloneSpan())
        return;
      vn(y).includes(b) && Ye(b.spanContext().spanId);
    })
  ), a.push(
    f.on("spanEnd", (b) => {
      r || mt(b.spanContext().spanId);
    })
  ), a.push(
    f.on("idleSpanEnableAutoFinish", (b) => {
      b === y && (i = !0, W(), n.size && ke());
    })
  ), t.disableAutoFinish || W(), setTimeout(() => {
    r || (y.setStatus({ code: x, message: "deadline_exceeded" }), s = yl, y.end());
  }, u), y;
}
function El(e) {
  const t = kt(e);
  return Et(D(), t), _ && h.log("[Tracing] Started span is an idle span"), t;
}
const hr = 0, Es = 1, Ts = 2;
function Jn(e) {
  return new Yt((t) => {
    t(e);
  });
}
function _o(e) {
  return new Yt((t, n) => {
    n(e);
  });
}
class Yt {
  constructor(t) {
    this._state = hr, this._handlers = [], this._runExecutor(t);
  }
  /** @inheritdoc */
  then(t, n) {
    return new Yt((r, o) => {
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
    return new Yt((n, r) => {
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
    if (this._state === hr)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === Es && n[1](this._value), this._state === Ts && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (s, i) => {
      if (this._state === hr) {
        if (At(i)) {
          i.then(r, o);
          return;
        }
        this._state = s, this._value = i, this._executeHandlers();
      }
    }, r = (s) => {
      n(Es, s);
    }, o = (s) => {
      n(Ts, s);
    };
    try {
      t(r, o);
    } catch (s) {
      o(s);
    }
  }
}
function Tl(e, t, n, r = 0) {
  try {
    const o = Fr(t, n, e, r);
    return At(o) ? o : Jn(o);
  } catch (o) {
    return _o(o);
  }
}
function Fr(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const s = o({ ...e }, t);
  return _ && s === null && h.log(`Event processor "${o.id || "?"}" dropped event`), At(s) ? s.then((i) => Fr(i, t, n, r + 1)) : Fr(s, t, n, r + 1);
}
function bl(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: s } = t;
  vl(e, t), r && wl(e, r), Al(e, n), Il(e, o), Rl(e, s);
}
function xn(e, t) {
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
  mn(e, "extra", n), mn(e, "tags", r), mn(e, "user", o), mn(e, "contexts", s), e.sdkProcessingMetadata = Zt(e.sdkProcessingMetadata, a, 2), i && (e.level = i), f && (e.transactionName = f), p && (e.span = p), c.length && (e.breadcrumbs = [...e.breadcrumbs, ...c]), u.length && (e.fingerprint = [...e.fingerprint, ...u]), l.length && (e.eventProcessors = [...e.eventProcessors, ...l]), d.length && (e.attachments = [...e.attachments, ...d]), e.propagationContext = { ...e.propagationContext, ...m };
}
function mn(e, t, n) {
  e[t] = Zt(e[t], n, 1);
}
function vl(e, t) {
  const { extra: n, tags: r, user: o, contexts: s, level: i, transactionName: a } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(s).length && (e.contexts = { ...s, ...e.contexts }), i && (e.level = i), a && e.type !== "transaction" && (e.transaction = a);
}
function Il(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function Rl(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function wl(e, t) {
  e.contexts = {
    trace: Fi(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: De(t),
    ...e.sdkProcessingMetadata
  };
  const n = K(t), r = R(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function Al(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let Xe, bs, vs, Me;
function Ol(e) {
  const t = v._sentryDebugIds, n = v._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (Me && r.length === bs && o.length === vs)
    return Me;
  bs = r.length, vs = o.length, Me = {}, Xe || (Xe = {});
  const s = (i, a) => {
    for (const c of i) {
      const u = a[c], l = Xe?.[c];
      if (l && Me && u)
        Me[l[0]] = u, Xe && (Xe[c] = [l[0], u]);
      else if (u) {
        const d = e(c);
        for (let m = d.length - 1; m >= 0; m--) {
          const p = d[m]?.filename;
          if (p && Me && Xe) {
            Me[p] = u, Xe[c] = [p, u];
            break;
          }
        }
      }
    }
  };
  return t && s(r, t), n && s(o, n), Me;
}
function Dl(e, t, n, r, o, s) {
  const { normalizeDepth: i = 3, normalizeMaxBreadth: a = 1e3 } = e, c = {
    ...t,
    event_id: t.event_id || n.event_id || ae(),
    timestamp: t.timestamp || ft()
  }, u = n.integrations || e.integrations.map((y) => y.name);
  Nl(c, e), Pl(c, u), o && o.emit("applyFrameMetadata", t), t.type === void 0 && kl(c, e.stackParser);
  const l = Ll(r, n.captureContext);
  n.mechanism && yt(c, n.mechanism);
  const d = o ? o.getEventProcessors() : [], m = Ai().getScopeData();
  if (s) {
    const y = s.getScopeData();
    xn(m, y);
  }
  if (l) {
    const y = l.getScopeData();
    xn(m, y);
  }
  const f = [...n.attachments || [], ...m.attachments];
  f.length && (n.attachments = f), bl(c, m);
  const p = [
    ...d,
    // Run scope event processors _after_ all other processors
    ...m.eventProcessors
  ];
  return Tl(p, c, n).then((y) => (y && Cl(y), typeof i == "number" && i > 0 ? Ml(y, i, a) : y));
}
function Nl(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: s = 250 } = t;
  e.environment = e.environment || n || po, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const i = e.request;
  i?.url && (i.url = Pn(i.url, s));
}
function kl(e, t) {
  const n = Ol(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function Cl(e) {
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
function Pl(e, t) {
  t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Ml(e, t, n) {
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
function Ll(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new C();
  return n.update(t), n;
}
function xl(e, t) {
  return D().captureException(e, void 0);
}
function Qi(e, t) {
  return D().captureEvent(e, t);
}
function Ul() {
  const e = w();
  return e?.getOptions().enabled !== !1 && !!e?.getTransport();
}
function Is(e) {
  const t = ze(), n = D(), { userAgent: r } = v.navigator || {}, o = ru({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), s = t.getSession();
  return s?.status === "ok" && St(s, { status: "exited" }), ea(), t.setSession(o), o;
}
function ea() {
  const e = ze(), n = D().getSession() || e.getSession();
  n && ou(n), ta(), e.setSession();
}
function ta() {
  const e = ze(), t = w(), n = e.getSession();
  n && t && t.captureSession(n);
}
function Rs(e = !1) {
  if (e) {
    ea();
    return;
  }
  ta();
}
const $l = "7";
function Bl(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function Fl(e) {
  return `${Bl(e)}${e.projectId}/envelope/`;
}
function Gl(e, t) {
  const n = {
    sentry_version: $l
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function Hl(e, t, n) {
  return t || `${Fl(e)}?${Gl(e, n)}`;
}
const ws = [];
function jl(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && na(e, r, n);
  }), n;
}
function As(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function na(e, t, n) {
  if (n[t.name]) {
    _ && h.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, ws.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), ws.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
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
function ql(e, t) {
  return t ? Qt(t, () => {
    const n = Q(), r = n ? Fi(n) : Oi(t);
    return [n ? De(n) : mo(e, t), r];
  }) : [void 0, void 0];
}
const zl = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};
function Wl(e) {
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
function Yl(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = Nt(r)), pt(o, [Wl(e)]);
}
const Kl = 100;
function Vl(e) {
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
function Jl(e, t) {
  const n = So(), r = ra(e);
  r === void 0 ? n.set(e, [t]) : (n.set(e, [...r, t]), r.length >= Kl && yo(e, r));
}
function Gr(e, t = D(), n = Jl) {
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
  const [, c] = ql(r, t), u = {
    ...e.attributes
  }, {
    user: { id: l, email: d, username: m }
  } = Xl(t);
  pe(u, "user.id", l, !1), pe(u, "user.email", d, !1), pe(u, "user.name", m, !1), pe(u, "sentry.release", o), pe(u, "sentry.environment", s);
  const { name: f, version: p } = r.getSdkMetadata()?.sdk ?? {};
  pe(u, "sentry.sdk.name", f), pe(u, "sentry.sdk.version", p);
  const S = r.getIntegrationByName("Replay"), y = S?.getReplayId(!0);
  pe(u, "sentry.replay_id", y), y && S?.getRecordingMode() === "buffer" && pe(u, "sentry._internal.replay_is_buffering", !0);
  const G = e.message;
  if (Wn(G)) {
    const { __sentry_template_string__: ye, __sentry_template_values__: Y = [] } = G;
    Y?.length && (u["sentry.message.template"] = ye), Y.forEach((Se, L) => {
      u[`sentry.message.parameter.${L}`] = Se;
    });
  }
  const W = qt(t);
  pe(u, "sentry.trace.parent_span_id", W?.spanContext().spanId);
  const ke = { ...e, attributes: u };
  r.emit("beforeCaptureLog", ke);
  const Ye = a ? Xt(() => a(ke)) : ke;
  if (!Ye) {
    r.recordDroppedEvent("before_send", "log_item", 1), _ && h.warn("beforeSendLog returned null, log will not be captured.");
    return;
  }
  const { level: mt, message: gt, attributes: b = {}, severityNumber: M } = Ye, Ce = {
    timestamp: U(),
    level: mt,
    body: gt,
    trace_id: c?.trace_id,
    severity_number: M ?? zl[mt],
    attributes: Object.keys(b).reduce(
      (ye, Y) => (ye[Y] = Vl(b[Y]), ye),
      {}
    )
  };
  n(r, Ce), r.emit("afterCaptureLog", Ye);
}
function yo(e, t) {
  const n = t ?? ra(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Yl(n, r._metadata, r.tunnel, e.getDsn());
  So().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function ra(e) {
  return So().get(e);
}
function Xl(e) {
  const t = Ai().getScopeData();
  return xn(t, ze().getScopeData()), xn(t, e.getScopeData()), t;
}
function So() {
  return Rt("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Zl(e) {
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
function Ql(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = Nt(r)), pt(o, [Zl(e)]);
}
function oa(e, t) {
  const n = t ?? ed(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Ql(n, r._metadata, r.tunnel, e.getDsn());
  sa().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function ed(e) {
  return sa().get(e);
}
function sa() {
  return Rt("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function td(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: ft(),
      discarded_events: e
    }
  ];
  return pt(t ? { dsn: t } : {}, [r]);
}
function ia(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function nd(e) {
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
    profile_id: i?.[uo],
    exclusive_time: i?.[Dt],
    measurements: e.measurements,
    is_segment: !0
  };
}
function rd(e) {
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
          ...e.profile_id && { [uo]: e.profile_id },
          ...e.exclusive_time && { [Dt]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const Os = "Not capturing exception because it's already been captured.", Ds = "Discarded session because of missing or non-string release", aa = Symbol.for("SentryInternalError"), ca = Symbol.for("SentryDoNotSendEventError"), od = 5e3;
function wn(e) {
  return {
    message: e,
    [aa]: !0
  };
}
function _r(e) {
  return {
    message: e,
    [ca]: !0
  };
}
function Ns(e) {
  return !!e && typeof e == "object" && aa in e;
}
function ks(e) {
  return !!e && typeof e == "object" && ca in e;
}
function Cs(e, t, n, r, o) {
  let s = 0, i;
  e.on(n, () => {
    s = 0, clearTimeout(i);
  }), e.on(t, (a) => {
    s += r(a), s >= 8e5 ? o(e) : (clearTimeout(i), i = setTimeout(() => {
      o(e);
    }, od));
  }), e.on("flush", () => {
    o(e);
  });
}
class sd {
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
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = ku(t.dsn) : _ && h.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = Hl(
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
    this._options.enableLogs && Cs(this, "afterCaptureLog", "flushLogs", ud, yo), this._options._experiments?.enableMetrics && Cs(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      cd,
      oa
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = ae();
    if (os(t))
      return _ && h.log(Os), o;
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
      event_id: ae(),
      ...r
    }, i = Wn(t) ? t : String(t), a = ut(t) ? this.eventFromMessage(i, n, s) : this.eventFromException(t, s);
    return this._process(a.then((c) => this._captureEvent(c, s, o))), s.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = ae();
    if (n?.originalException && os(n.originalException))
      return _ && h.log(Os), o;
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
    this.sendSession(t), St(t, { init: !1 });
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
    na(this, t, this._integrations), n || As(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = ol(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = Vu(r, Qu(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = po } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        _ && h.warn(Ds);
        return;
      }
      s.release = s.release || n, s.environment = s.environment || r, t.attrs = s;
    } else {
      if (!t.release && !n) {
        _ && h.warn(Ds);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = rl(t, this._dsn, this._options._metadata, this._options.tunnel);
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
    this._integrations = jl(this, t), As(this, t);
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
    (i && t.errors === 0 || i && r) && (St(t, {
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
    return !n.integrations && i?.length && (n.integrations = i), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Dl(s, t, n, r, this, o).then((a) => {
      if (a === null)
        return a;
      this.emit("postprocessEvent", a, n), a.contexts = {
        trace: Oi(r),
        ...a.contexts
      };
      const c = mo(this, r);
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
  _captureEvent(t, n = {}, r = D(), o = ze()) {
    return _ && Hr(t) && h.log(`Captured error event \`${ia(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (s) => s.event_id,
      (s) => {
        _ && (ks(s) ? h.log(s.message) : Ns(s) ? h.warn(s.message) : h.warn(s));
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
    const s = this.getOptions(), { sampleRate: i } = s, a = ua(t), c = Hr(t), u = t.type || "error", l = `before send for type \`${u}\``, d = typeof i > "u" ? void 0 : Wt(i);
    if (c && typeof d == "number" && Math.random() > d)
      return this.recordDroppedEvent("sample_rate", "error"), _o(
        _r(
          `Discarding event because it's not included in the random sample (sampling rate = ${i})`
        )
      );
    const m = u === "replay_event" ? "replay" : u;
    return this._prepareEvent(t, n, r, o).then((f) => {
      if (f === null)
        throw this.recordDroppedEvent("event_processor", m), _r("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return f;
      const S = ad(this, s, f, n);
      return id(S, l);
    }).then((f) => {
      if (f === null) {
        if (this.recordDroppedEvent("before_send", m), a) {
          const G = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", G);
        }
        throw _r(`${l} returned \`null\`, will not send event.`);
      }
      const p = r.getSession() || o.getSession();
      if (c && p && this._updateSessionFromEvent(p, f), a) {
        const y = f.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, G = f.spans ? f.spans.length : 0, W = y - G;
        W > 0 && this.recordDroppedEvent("before_send", "span", W);
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
      throw ks(f) || Ns(f) ? f : (this.captureException(f, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: f
      }), wn(
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
    const n = td(t, this._options.tunnel && Nt(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function id(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (At(e))
    return e.then(
      (r) => {
        if (!jt(r) && r !== null)
          throw wn(n);
        return r;
      },
      (r) => {
        throw wn(`${t} rejected with ${r}`);
      }
    );
  if (!jt(e) && e !== null)
    throw wn(n);
  return e;
}
function ad(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i, ignoreSpans: a } = t;
  let c = n;
  if (Hr(c) && o)
    return o(c, r);
  if (ua(c)) {
    if (i || a) {
      const u = nd(c);
      if (a?.length && Ln(u, a))
        return null;
      if (i) {
        const l = i(u);
        l ? c = Zt(n, rd(l)) : Ur();
      }
      if (c.spans) {
        const l = [], d = c.spans;
        for (const f of d) {
          if (a?.length && Ln(f, a)) {
            Hu(d, f);
            continue;
          }
          if (i) {
            const p = i(f);
            p ? l.push(p) : (Ur(), l.push(f));
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
function Hr(e) {
  return e.type === void 0;
}
function ua(e) {
  return e.type === "transaction";
}
function cd(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + la(e.attributes);
}
function ud(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + la(e.attributes);
}
function la(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * Ps(n[0]) : ut(n) ? t += Ps(n) : t += 100;
  }), t;
}
function Ps(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const da = Symbol.for("SentryBufferFullError");
function ld(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(i) {
    t.delete(i);
  }
  function o(i) {
    if (!n())
      return _o(da);
    const a = i();
    return t.add(a), a.then(
      () => r(a),
      () => r(a)
    ), a;
  }
  function s(i) {
    if (!t.size)
      return Jn(!0);
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
const dd = 60 * 1e3;
function fd(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? dd : r - t;
}
function pd(e, t) {
  return e[t] || e.all || 0;
}
function md(e, t, n = Date.now()) {
  return pd(e, t) > n;
}
function gd(e, { statusCode: t, headers: n }, r = Date.now()) {
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
  else i ? o.all = r + fd(i, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const hd = 64;
function _d(e, t, n = ld(
  e.bufferSize || hd
)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const a = [];
    if (ps(i, (d, m) => {
      const f = ms(m);
      md(r, f) ? e.recordDroppedEvent("ratelimit_backoff", f) : a.push(d);
    }), a.length === 0)
      return Promise.resolve({});
    const c = pt(i[0], a), u = (d) => {
      ps(c, (m, f) => {
        e.recordDroppedEvent(d, ms(f));
      });
    }, l = () => t({ body: Ju(c) }).then(
      (d) => (d.statusCode !== void 0 && (d.statusCode < 200 || d.statusCode >= 300) && _ && h.warn(`Sentry responded with status code ${d.statusCode} to sent event.`), r = gd(r, d), d),
      (d) => {
        throw u("network_error"), _ && h.error("Encountered error running transport request:", d), d;
      }
    );
    return n.add(l).then(
      (d) => d,
      (d) => {
        if (d === da)
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
const yd = "thismessage:/";
function fa(e) {
  return "isRelative" in e;
}
function pa(e, t) {
  const n = e.indexOf("://") <= 0 && e.indexOf("//") !== 0, r = n ? yd : void 0;
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
function Sd(e) {
  if (fa(e))
    return e.pathname;
  const t = new URL(e);
  return t.search = "", t.hash = "", ["80", "443"].includes(t.port) && (t.port = ""), t.password && (t.password = "%filtered%"), t.username && (t.username = "%filtered%"), t.toString();
}
function at(e) {
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
function Ed(e) {
  return e.split(/[?#]/, 1)[0];
}
function Td(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function bd(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  o.sdk || (o.sdk = {
    name: `sentry.javascript.${t}`,
    packages: n.map((s) => ({
      name: `${r}:@sentry/${s}`,
      version: ot
    })),
    version: ot
  }), e._metadata = o;
}
function ma(e = {}) {
  const t = e.client || w();
  if (!Ul() || !t)
    return {};
  const n = dt(), r = Ot(n);
  if (r.getTraceData)
    return r.getTraceData(e);
  const o = e.scope || D(), s = e.span || Q(), i = s ? xu(s) : vd(o), a = s ? De(s) : mo(t, o), c = Tu(a);
  if (!xi.test(i))
    return h.warn("Invalid sentry-trace data. Cannot generate trace data"), {};
  const l = {
    "sentry-trace": i,
    baggage: c
  };
  if (e.propagateTraceparent) {
    const d = s ? Uu(s) : Id(o);
    d && (l.traceparent = d);
  }
  return l;
}
function vd(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return Ui(t, r, n);
}
function Id(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return $i(t, r, n);
}
const Rd = 100;
function lt(e, t) {
  const n = w(), r = ze();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = Rd } = n.getOptions();
  if (s <= 0) return;
  const a = { timestamp: ft(), ...e }, c = o ? Xt(() => o(a, t)) : a;
  c !== null && (n.emit && n.emit("beforeAddBreadcrumb", c, t), r.addBreadcrumb(c, s));
}
let Ms;
const wd = "FunctionToString", Ls = /* @__PURE__ */ new WeakMap(), Ad = () => ({
  name: wd,
  setupOnce() {
    Ms = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = ao(this), n = Ls.has(w()) && t !== void 0 ? t : this;
        return Ms.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    Ls.set(e, !0);
  }
}), Od = Ad, Dd = [
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
], Nd = "EventFilters", kd = (e = {}) => {
  let t;
  return {
    name: Nd,
    setup(n) {
      const r = n.getOptions();
      t = xs(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const s = o.getOptions();
        t = xs(e, s);
      }
      return Pd(n, t) ? null : n;
    }
  };
}, Cd = (e = {}) => ({
  ...kd(e),
  name: "InboundFilters"
});
function xs(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : Dd
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function Pd(e, t) {
  if (e.type) {
    if (e.type === "transaction" && Ld(e, t.ignoreTransactions))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${et(e)}`
      ), !0;
  } else {
    if (Md(e, t.ignoreErrors))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${et(e)}`
      ), !0;
    if (Bd(e))
      return _ && h.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${et(
          e
        )}`
      ), !0;
    if (xd(e, t.denyUrls))
      return _ && h.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${et(
          e
        )}.
Url: ${Un(e)}`
      ), !0;
    if (!Ud(e, t.allowUrls))
      return _ && h.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${et(
          e
        )}.
Url: ${Un(e)}`
      ), !0;
  }
  return !1;
}
function Md(e, t) {
  return t?.length ? ia(e).some((n) => Fe(n, t)) : !1;
}
function Ld(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? Fe(n, t) : !1;
}
function xd(e, t) {
  if (!t?.length)
    return !1;
  const n = Un(e);
  return n ? Fe(n, t) : !1;
}
function Ud(e, t) {
  if (!t?.length)
    return !0;
  const n = Un(e);
  return n ? Fe(n, t) : !0;
}
function $d(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function Un(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? $d(n) : null;
  } catch {
    return _ && h.error(`Cannot extract url for event ${et(e)}`), null;
  }
}
function Bd(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Fd(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !we(s.originalException, Error))
    return;
  const i = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  i && (o.exception.values = jr(
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
function jr(e, t, n, r, o, s, i, a) {
  if (s.length >= n + 1)
    return s;
  let c = [...s];
  if (we(r[o], Error)) {
    Us(i, a);
    const u = e(t, r[o]), l = c.length;
    $s(u, o, l, a), c = jr(
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
      Us(i, a);
      const d = e(t, u), m = c.length;
      $s(d, `errors[${l}]`, m, a), c = jr(
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
function Us(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function $s(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: "chained",
    source: t,
    exception_id: n,
    parent_id: r
  };
}
function ga(e) {
  const t = "console";
  je(t, e), qe(t, Gd);
}
function Gd() {
  "console" in v && pi.forEach(function(e) {
    e in v.console && ne(v.console, e, function(t) {
      return Cn[e] = t, function(...n) {
        ie("console", { args: n, level: e }), Cn[e]?.apply(v.console, n);
      };
    });
  });
}
function Hd(e) {
  return e === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e) ? e : "log";
}
const jd = "Dedupe", qd = () => {
  let e;
  return {
    name: jd,
    processEvent(t) {
      if (t.type)
        return t;
      try {
        if (Wd(t, e))
          return _ && h.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, zd = qd;
function Wd(e, t) {
  return t ? !!(Yd(e, t) || Kd(e, t)) : !1;
}
function Yd(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !_a(e, t) || !ha(e, t));
}
function Kd(e, t) {
  const n = Bs(t), r = Bs(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !_a(e, t) || !ha(e, t));
}
function ha(e, t) {
  let n = Zo(e), r = Zo(t);
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
function _a(e, t) {
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
function Bs(e) {
  return e.exception?.values?.[0];
}
function Vd(e, t, n, r, o) {
  if (!e.fetchData)
    return;
  const { method: s, url: i } = e.fetchData, a = de() && t(i);
  if (e.endTimestamp && a) {
    const f = e.fetchData.__span;
    if (!f) return;
    const p = r[f];
    p && (Zd(p, e), Jd(p, e, o), delete r[f]);
    return;
  }
  const { spanOrigin: c = "auto.http.browser", propagateTraceparent: u = !1 } = typeof o == "object" ? o : { spanOrigin: o }, l = !!Q(), d = a && l ? kt(ef(i, s, c)) : new Ge();
  if (e.fetchData.__span = d.spanContext().spanId, r[d.spanContext().spanId] = d, n(e.fetchData.url)) {
    const f = e.args[0], p = e.args[1] || {}, S = Xd(
      f,
      p,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      de() && l ? d : void 0,
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
function Jd(e, t, n) {
  (typeof n == "object" && n !== null ? n.onRequestSpanEnd : void 0)?.(e, {
    headers: t.response?.headers,
    error: t.error
  });
}
function Xd(e, t, n, r) {
  const o = ma({ span: n, propagateTraceparent: r }), s = o["sentry-trace"], i = o.baggage, a = o.traceparent;
  if (!s)
    return;
  const c = t.headers || (Ti(e) ? e.headers : void 0);
  if (c)
    if (Qd(c)) {
      const u = new Headers(c);
      if (u.get("sentry-trace") || u.set("sentry-trace", s), r && a && !u.get("traceparent") && u.set("traceparent", a), i) {
        const l = u.get("baggage");
        l ? gn(l) || u.set("baggage", `${l},${i}`) : u.set("baggage", i);
      }
      return u;
    } else if (Array.isArray(c)) {
      const u = [...c];
      c.find((d) => d[0] === "sentry-trace") || u.push(["sentry-trace", s]), r && a && !c.find((d) => d[0] === "traceparent") && u.push(["traceparent", a]);
      const l = c.find(
        (d) => d[0] === "baggage" && gn(d[1])
      );
      return i && !l && u.push(["baggage", i]), u;
    } else {
      const u = "sentry-trace" in c ? c["sentry-trace"] : void 0, l = "traceparent" in c ? c.traceparent : void 0, d = "baggage" in c ? c.baggage : void 0, m = d ? Array.isArray(d) ? [...d] : [d] : [], f = d && (Array.isArray(d) ? d.find((S) => gn(S)) : gn(d));
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
function Zd(e, t) {
  if (t.response) {
    ki(e, t.response.status);
    const n = t.response?.headers?.get("content-length");
    if (n) {
      const r = parseInt(n);
      r > 0 && e.setAttribute("http.response_content_length", r);
    }
  } else t.error && e.setStatus({ code: x, message: "internal_error" });
  e.end();
}
function gn(e) {
  return e.split(",").some((t) => t.trim().startsWith(lo));
}
function Qd(e) {
  return typeof Headers < "u" && we(e, Headers);
}
function ef(e, t, n) {
  const r = pa(e);
  return {
    name: r ? `${t} ${Sd(r)}` : t,
    attributes: tf(e, r, t, n)
  };
}
function tf(e, t, n, r) {
  const o = {
    url: e,
    type: "fetch",
    "http.method": n,
    [P]: r,
    [Oe]: "http.client"
  };
  return t && (fa(t) || (o["http.url"] = t.href, o["server.address"] = t.host), t.search && (o["http.query"] = t.search), t.hash && (o["http.fragment"] = t.hash)), o;
}
function Eo(e, t, n, r, o) {
  Gr({ level: e, message: t, attributes: n, severityNumber: o }, r);
}
function Xn(e, t, { scope: n } = {}) {
  Eo("info", e, t, n);
}
function Zn(e, t, { scope: n } = {}) {
  Eo("warn", e, t, n);
}
function Qn(e, t, { scope: n } = {}) {
  Eo("error", e, t, n);
}
function Fs(e, t, n) {
  return "util" in v && typeof v.util.format == "function" ? v.util.format(...e) : nf(e, t, n);
}
function nf(e, t, n) {
  return e.map(
    (r) => ut(r) ? String(r) : JSON.stringify(me(r, t, n))
  ).join(" ");
}
function rf(e) {
  return /%[sdifocO]/.test(e);
}
function of(e, t) {
  const n = {}, r = new Array(t.length).fill("{}").join(" ");
  return n["sentry.message.template"] = `${e} ${r}`, t.forEach((o, s) => {
    n[`sentry.message.parameter.${s}`] = o;
  }), n;
}
const sf = "ConsoleLogs", Gs = {
  [P]: "auto.log.console"
}, af = (e = {}) => {
  const t = e.levels || pi;
  return {
    name: sf,
    setup(n) {
      const { enableLogs: r, normalizeDepth: o = 3, normalizeMaxBreadth: s = 1e3 } = n.getOptions();
      if (!r) {
        _ && h.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
        return;
      }
      ga(({ args: i, level: a }) => {
        if (w() !== n || !t.includes(a))
          return;
        const c = i[0], u = i.slice(1);
        if (a === "assert") {
          if (!c) {
            const f = u.length > 0 ? `Assertion failed: ${Fs(u, o, s)}` : "Assertion failed";
            Gr({ level: "error", message: f, attributes: Gs });
          }
          return;
        }
        const l = a === "log", d = i.length > 1 && typeof i[0] == "string" && !rf(i[0]), m = {
          ...Gs,
          ...d ? of(c, u) : {}
        };
        Gr({
          level: l ? "info" : a,
          message: Fs(i, o, s),
          severityNumber: l ? 10 : void 0,
          attributes: m
        });
      });
    }
  };
}, To = af;
function ya(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const Kt = v;
function cf() {
  return "history" in Kt && !!Kt.history;
}
function uf() {
  if (!("fetch" in Kt))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function qr(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function lf() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!uf())
    return !1;
  if (qr(Kt.fetch))
    return !0;
  let e = !1;
  const t = Kt.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = qr(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      _ && h.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function Sa(e, t) {
  const n = "fetch";
  je(n, e), qe(n, () => Ea(void 0, t));
}
function df(e) {
  const t = "fetch-body-resolved";
  je(t, e), qe(t, () => Ea(pf));
}
function Ea(e, t = !1) {
  t && !lf() || ne(v, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: s, url: i } = mf(r), a = {
        args: r,
        fetchData: {
          method: s,
          url: i
        },
        startTimestamp: U() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: gf(r)
      };
      return e || ie("fetch", {
        ...a
      }), n.apply(v, r).then(
        async (c) => (e ? e(c) : ie("fetch", {
          ...a,
          endTimestamp: U() * 1e3,
          response: c
        }), c),
        (c) => {
          if (ie("fetch", {
            ...a,
            endTimestamp: U() * 1e3,
            error: c
          }), so(c) && c.stack === void 0 && (c.stack = o.stack, re(c, "framesToPop", 1)), c instanceof TypeError && (c.message === "Failed to fetch" || c.message === "Load failed" || c.message === "NetworkError when attempting to fetch resource."))
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
async function ff(e, t) {
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
function pf(e) {
  let t;
  try {
    t = e.clone();
  } catch {
    return;
  }
  ff(t, () => {
    ie("fetch-body-resolved", {
      endTimestamp: U() * 1e3,
      response: e
    });
  });
}
function zr(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function Hs(e) {
  return typeof e == "string" ? e : e ? zr(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function mf(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: Hs(n),
      method: zr(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: Hs(t),
    method: zr(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function gf(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (Ti(t))
      return new Headers(t.headers);
  } catch {
  }
}
function hf() {
  return "npm";
}
const A = v;
let Wr = 0;
function Ta() {
  return Wr > 0;
}
function _f() {
  Wr++, setTimeout(() => {
    Wr--;
  });
}
function bt(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (ao(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const s = o.map((i) => bt(i, t));
      return e.apply(this, s);
    } catch (s) {
      throw _f(), Qt((i) => {
        i.addEventProcessor((a) => (t.mechanism && (Mr(a, void 0), yt(a, t.mechanism)), a.extra = {
          ...a.extra,
          arguments: o
        }, a)), xl(s);
      }), s;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  vi(r, e), re(e, "__sentry_wrapped__", r);
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
function bo() {
  const e = Kn(), { referrer: t } = A.document || {}, { userAgent: n } = A.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function vo(e, t) {
  const n = Io(e, t), r = {
    type: bf(t),
    value: vf(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function yf(e, t, n, r) {
  const s = w()?.getOptions().normalizeDepth, i = Of(t), a = {
    __serialized__: Wi(t, s)
  };
  if (i)
    return {
      exception: {
        values: [vo(e, i)]
      },
      extra: a
    };
  const c = {
    exception: {
      values: [
        {
          type: Yn(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: wf(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: a
  };
  if (n) {
    const u = Io(e, n);
    u.length && (c.exception.values[0].stacktrace = { frames: u });
  }
  return c;
}
function yr(e, t) {
  return {
    exception: {
      values: [vo(e, t)]
    }
  };
}
function Io(e, t) {
  const n = t.stacktrace || t.stack || "", r = Ef(t), o = Tf(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const Sf = /Minified React error #\d+;/i;
function Ef(e) {
  return e && Sf.test(e.message) ? 1 : 0;
}
function Tf(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function ba(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function bf(e) {
  const t = e?.name;
  return !t && ba(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function vf(e) {
  const t = e?.message;
  return ba(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function If(e, t, n, r) {
  const o = n?.syntheticException || void 0, s = Ro(e, t, o, r);
  return yt(s), s.level = "error", n?.event_id && (s.event_id = n.event_id), Jn(s);
}
function Rf(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0, i = Yr(e, t, s, o);
  return i.level = n, r?.event_id && (i.event_id = r.event_id), Jn(i);
}
function Ro(e, t, n, r, o) {
  let s;
  if (Si(t) && t.error)
    return yr(e, t.error);
  if (es(t) || zc(t)) {
    const i = t;
    if ("stack" in t)
      s = yr(e, t);
    else {
      const a = i.name || (es(i) ? "DOMError" : "DOMException"), c = i.message ? `${a}: ${i.message}` : a;
      s = Yr(e, c, n, r), Mr(s, c);
    }
    return "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }), s;
  }
  return so(t) ? yr(e, t) : jt(t) || Yn(t) ? (s = yf(e, t, n, o), yt(s, {
    synthetic: !0
  }), s) : (s = Yr(e, t, n, r), Mr(s, `${t}`), yt(s, {
    synthetic: !0
  }), s);
}
function Yr(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = Io(e, n);
    s.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: s } }]
    }), yt(o, { synthetic: !0 });
  }
  if (Wn(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return o.logentry = {
      message: s,
      params: i
    }, o;
  }
  return o.message = t, o;
}
function wf(e, { isUnhandledRejection: t }) {
  const n = Xc(e), r = t ? "promise rejection" : "exception";
  return Si(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : Yn(e) ? `Event \`${Af(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function Af(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function Of(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class er extends sd {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = Df(t), r = A.SENTRY_SDK_SOURCE || hf();
    bd(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: s, enableLogs: i, _experiments: a } = this._options;
    A.document && (s || i || a?.enableMetrics) && A.document.addEventListener("visibilitychange", () => {
      A.document.visibilityState === "hidden" && (s && this._flushOutcomes(), i && yo(this), a?.enableMetrics && oa(this));
    }), o && this.on("beforeSendSession", Td);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return If(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return Rf(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function Df(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : A.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const rn = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, E = v, Nf = (e, t) => e > t[1] ? "poor" : e > t[0] ? "needs-improvement" : "good", on = (e, t, n, r) => {
  let o, s;
  return (i) => {
    t.value >= 0 && (i || r) && (s = t.value - (o ?? 0), (s || o === void 0) && (o = t.value, t.delta = s, t.rating = Nf(t.value, n), e(t)));
  };
}, kf = () => `v5-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`, sn = (e = !0) => {
  const t = E.performance?.getEntriesByType?.("navigation")[0];
  if (
    // sentry-specific change:
    // We don't want to check for responseStart for our own use of `getNavigationEntry`
    !e || t && t.responseStart > 0 && t.responseStart < performance.now()
  )
    return t;
}, Ct = () => sn()?.activationStart ?? 0, an = (e, t = -1) => {
  const n = sn();
  let r = "navigate";
  return n && (E.document?.prerendering || Ct() > 0 ? r = "prerender" : E.document?.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), {
    name: e,
    value: t,
    rating: "good",
    // If needed, will be updated when reported. `const` to keep the type from widening to `string`.
    delta: 0,
    entries: [],
    id: kf(),
    navigationType: r
  };
}, Sr = /* @__PURE__ */ new WeakMap();
function wo(e, t) {
  return Sr.get(e) || Sr.set(e, new t()), Sr.get(e);
}
class $n {
  constructor() {
    $n.prototype.__init.call(this), $n.prototype.__init2.call(this);
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
const Pt = (e, t, n = {}) => {
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
}, Ao = (e) => {
  let t = !1;
  return () => {
    t || (e(), t = !0);
  };
};
let Gt = -1;
const Cf = () => E.document?.visibilityState === "hidden" && !E.document?.prerendering ? 0 : 1 / 0, Bn = (e) => {
  E.document.visibilityState === "hidden" && Gt > -1 && (Gt = e.type === "visibilitychange" ? e.timeStamp : 0, Mf());
}, Pf = () => {
  addEventListener("visibilitychange", Bn, !0), addEventListener("prerenderingchange", Bn, !0);
}, Mf = () => {
  removeEventListener("visibilitychange", Bn, !0), removeEventListener("prerenderingchange", Bn, !0);
}, Oo = () => {
  if (E.document && Gt < 0) {
    const e = Ct();
    Gt = (E.document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((n) => n.name === "hidden" && n.startTime > e)[0]?.startTime) ?? Cf(), Pf();
  }
  return {
    get firstHiddenTime() {
      return Gt;
    }
  };
}, tr = (e) => {
  E.document?.prerendering ? addEventListener("prerenderingchange", () => e(), !0) : e();
}, Lf = [1800, 3e3], xf = (e, t = {}) => {
  tr(() => {
    const n = Oo(), r = an("FCP");
    let o;
    const i = Pt("paint", (a) => {
      for (const c of a)
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < n.firstHiddenTime && (r.value = Math.max(c.startTime - Ct(), 0), r.entries.push(c), o(!0)));
    });
    i && (o = on(e, r, Lf, t.reportAllChanges));
  });
}, Uf = [0.1, 0.25], $f = (e, t = {}) => {
  xf(
    Ao(() => {
      const n = an("CLS", 0);
      let r;
      const o = wo(t, $n), s = (a) => {
        for (const c of a)
          o._processEntry(c);
        o._sessionValue > n.value && (n.value = o._sessionValue, n.entries = o._sessionEntries, r());
      }, i = Pt("layout-shift", s);
      i && (r = on(e, n, Uf, t.reportAllChanges), E.document?.addEventListener("visibilitychange", () => {
        E.document?.visibilityState === "hidden" && (s(i.takeRecords()), r(!0));
      }), E?.setTimeout?.(r));
    })
  );
};
let va = 0, Er = 1 / 0, hn = 0;
const Bf = (e) => {
  e.forEach((t) => {
    t.interactionId && (Er = Math.min(Er, t.interactionId), hn = Math.max(hn, t.interactionId), va = hn ? (hn - Er) / 7 + 1 : 0);
  });
};
let Kr;
const Ia = () => Kr ? va : performance.interactionCount || 0, Ff = () => {
  "interactionCount" in performance || Kr || (Kr = Pt("event", Bf, {
    type: "event",
    buffered: !0,
    durationThreshold: 0
  }));
}, Tr = 10;
let Ra = 0;
const Gf = () => Ia() - Ra;
class Fn {
  constructor() {
    Fn.prototype.__init.call(this), Fn.prototype.__init2.call(this);
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
    Ra = Ia(), this._longestInteractionList.length = 0, this._longestInteractionMap.clear();
  }
  /**
   * Returns the estimated p98 longest interaction based on the stored
   * interaction candidates and the interaction count for the current page.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _estimateP98LongestInteraction() {
    const t = Math.min(
      this._longestInteractionList.length - 1,
      Math.floor(Gf() / 50)
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
    if (r || this._longestInteractionList.length < Tr || // If the above conditions are false, `minLongestInteraction` will be set.
    t.duration > n._latency) {
      if (r ? t.duration > r._latency ? (r.entries = [t], r._latency = t.duration) : t.duration === r._latency && t.startTime === r.entries[0].startTime && r.entries.push(t) : (r = {
        id: t.interactionId,
        entries: [t],
        _latency: t.duration
      }, this._longestInteractionMap.set(r.id, r), this._longestInteractionList.push(r)), this._longestInteractionList.sort((o, s) => s._latency - o._latency), this._longestInteractionList.length > Tr) {
        const o = this._longestInteractionList.splice(Tr);
        for (const s of o)
          this._longestInteractionMap.delete(s.id);
      }
      this._onAfterProcessingINPCandidate?.(r);
    }
  }
}
const Do = (e) => {
  const t = (n) => {
    (n.type === "pagehide" || E.document?.visibilityState === "hidden") && e(n);
  };
  E.document && (addEventListener("visibilitychange", t, !0), addEventListener("pagehide", t, !0));
}, wa = (e) => {
  const t = E.requestIdleCallback || E.setTimeout;
  E.document?.visibilityState === "hidden" ? e() : (e = Ao(e), t(e), Do(e));
}, Hf = [200, 500], jf = 40, qf = (e, t = {}) => {
  globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype && tr(() => {
    Ff();
    const n = an("INP");
    let r;
    const o = wo(t, Fn), s = (a) => {
      wa(() => {
        for (const u of a)
          o._processEntry(u);
        const c = o._estimateP98LongestInteraction();
        c && c._latency !== n.value && (n.value = c._latency, n.entries = c.entries, r());
      });
    }, i = Pt("event", s, {
      // Event Timing entries have their durations rounded to the nearest 8ms,
      // so a duration of 40ms would be any event that spans 2.5 or more frames
      // at 60Hz. This threshold is chosen to strike a balance between usefulness
      // and performance. Running this callback for any interaction that spans
      // just one or two frames is likely not worth the insight that could be
      // gained.
      durationThreshold: t.durationThreshold ?? jf
    });
    r = on(e, n, Hf, t.reportAllChanges), i && (i.observe({ type: "first-input", buffered: !0 }), Do(() => {
      s(i.takeRecords()), r(!0);
    }));
  });
};
class zf {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, jsdoc/require-jsdoc
  _processEntry(t) {
    this._onBeforeProcessingEntry?.(t);
  }
}
const Wf = [2500, 4e3], Yf = (e, t = {}) => {
  tr(() => {
    const n = Oo(), r = an("LCP");
    let o;
    const s = wo(t, zf), i = (c) => {
      t.reportAllChanges || (c = c.slice(-1));
      for (const u of c)
        s._processEntry(u), u.startTime < n.firstHiddenTime && (r.value = Math.max(u.startTime - Ct(), 0), r.entries = [u], o());
    }, a = Pt("largest-contentful-paint", i);
    if (a) {
      o = on(e, r, Wf, t.reportAllChanges);
      const c = Ao(() => {
        i(a.takeRecords()), a.disconnect(), o(!0);
      });
      for (const u of ["keydown", "click", "visibilitychange"])
        E.document && addEventListener(u, () => wa(c), {
          capture: !0,
          once: !0
        });
    }
  });
}, Kf = [800, 1800], Vr = (e) => {
  E.document?.prerendering ? tr(() => Vr(e)) : E.document?.readyState !== "complete" ? addEventListener("load", () => Vr(e), !0) : setTimeout(e);
}, Vf = (e, t = {}) => {
  const n = an("TTFB"), r = on(e, n, Kf, t.reportAllChanges);
  Vr(() => {
    const o = sn();
    o && (n.value = Math.max(o.responseStart - Ct(), 0), n.entries = [o], r(!0));
  });
}, Ht = {}, Gn = {};
let Aa, Oa, Da, Na;
function ka(e, t = !1) {
  return nr("cls", e, Zf, Aa, t);
}
function Ca(e, t = !1) {
  return nr("lcp", e, Qf, Oa, t);
}
function Jf(e) {
  return nr("ttfb", e, ep, Da);
}
function Xf(e) {
  return nr("inp", e, tp, Na);
}
function vt(e, t) {
  return Pa(e, t), Gn[e] || (np(e), Gn[e] = !0), Ma(e, t);
}
function cn(e, t) {
  const n = Ht[e];
  if (n?.length)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        rn && h.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${Re(r)}
Error:`,
          o
        );
      }
}
function Zf() {
  return $f(
    (e) => {
      cn("cls", {
        metric: e
      }), Aa = e;
    },
    // We want the callback to be called whenever the CLS value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function Qf() {
  return Yf(
    (e) => {
      cn("lcp", {
        metric: e
      }), Oa = e;
    },
    // We want the callback to be called whenever the LCP value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function ep() {
  return Vf((e) => {
    cn("ttfb", {
      metric: e
    }), Da = e;
  });
}
function tp() {
  return qf((e) => {
    cn("inp", {
      metric: e
    }), Na = e;
  });
}
function nr(e, t, n, r, o = !1) {
  Pa(e, t);
  let s;
  return Gn[e] || (s = n(), Gn[e] = !0), r && t({ metric: r }), Ma(e, t, o ? s : void 0);
}
function np(e) {
  const t = {};
  e === "event" && (t.durationThreshold = 0), Pt(
    e,
    (n) => {
      cn(e, { entries: n });
    },
    t
  );
}
function Pa(e, t) {
  Ht[e] = Ht[e] || [], Ht[e].push(t);
}
function Ma(e, t, n) {
  return () => {
    n && n();
    const r = Ht[e];
    if (!r)
      return;
    const o = r.indexOf(t);
    o !== -1 && r.splice(o, 1);
  };
}
function rp(e) {
  return "duration" in e;
}
function br(e) {
  return typeof e == "number" && isFinite(e);
}
function He(e, t, n, { ...r }) {
  const o = R(e).start_timestamp;
  return o && o > t && typeof e.updateStartTime == "function" && e.updateStartTime(t), go(e, () => {
    const s = kt({
      startTime: t,
      ...r
    });
    return s && s.end(n), s;
  });
}
function No(e) {
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
  return kt({
    name: n,
    attributes: S,
    startTime: s,
    experimental: {
      standalone: !0
    }
  });
}
function un() {
  return E.addEventListener && E.performance;
}
function k(e) {
  return e / 1e3;
}
function op(e) {
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
function La(e) {
  try {
    return PerformanceObserver.supportedEntryTypes.includes(e);
  } catch {
    return !1;
  }
}
function xa(e, t) {
  let n, r = !1;
  function o(a) {
    !r && n && t(a, n), r = !0;
  }
  Do(() => {
    o("pagehide");
  });
  const s = e.on("beforeStartNavigationSpan", (a, c) => {
    c?.isRedirect || (o("navigation"), s(), i());
  }), i = e.on("afterStartPageLoadSpan", (a) => {
    n = a.spanContext().spanId, i();
  });
}
function sp(e) {
  let t = 0, n;
  if (!La("layout-shift"))
    return;
  const r = ka(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  xa(e, (o, s) => {
    ip(t, n, s, o), r();
  });
}
function ip(e, t, n, r) {
  rn && h.log(`Sending CLS span (${e})`);
  const o = t ? k((oe() || 0) + t.startTime) : U(), s = D().getScopeData().transactionName, i = t ? _e(t.sources[0]?.node) : "Layout shift", a = {
    [P]: "auto.http.browser.cls",
    [Oe]: "ui.webvital.cls",
    [Dt]: 0,
    // attach the pageload span id to the CLS span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t?.sources && t.sources.forEach((u, l) => {
    a[`cls.source.${l + 1}`] = _e(u.node);
  });
  const c = No({
    name: i,
    transaction: s,
    attributes: a,
    startTime: o
  });
  c && (c.addEvent("cls", {
    [en]: "",
    [tn]: e
  }), c.end(o));
}
function ap(e) {
  let t = 0, n;
  if (!La("largest-contentful-paint"))
    return;
  const r = Ca(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  xa(e, (o, s) => {
    cp(t, n, s, o), r();
  });
}
function cp(e, t, n, r) {
  rn && h.log(`Sending LCP span (${e})`);
  const o = k((oe() || 0) + (t?.startTime || 0)), s = D().getScopeData().transactionName, i = t ? _e(t.element) : "Largest contentful paint", a = {
    [P]: "auto.http.browser.lcp",
    [Oe]: "ui.webvital.lcp",
    [Dt]: 0,
    // LCP is a point-in-time metric
    // attach the pageload span id to the LCP span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t && (t.element && (a["lcp.element"] = _e(t.element)), t.id && (a["lcp.id"] = t.id), t.url && (a["lcp.url"] = t.url.trim().slice(0, 200)), t.loadTime != null && (a["lcp.loadTime"] = t.loadTime), t.renderTime != null && (a["lcp.renderTime"] = t.renderTime), t.size != null && (a["lcp.size"] = t.size));
  const c = No({
    name: i,
    transaction: s,
    attributes: a,
    startTime: o
  });
  c && (c.addEvent("lcp", {
    [en]: "millisecond",
    [tn]: e
  }), c.end(o));
}
function se(e) {
  return e && ((oe() || performance.timeOrigin) + e) / 1e3;
}
function Ua(e) {
  const t = {};
  if (e.nextHopProtocol != null) {
    const { name: n, version: r } = op(e.nextHopProtocol);
    t["network.protocol.version"] = r, t["network.protocol.name"] = n;
  }
  return oe() || un()?.timeOrigin ? up({
    ...t,
    "http.request.redirect_start": se(e.redirectStart),
    "http.request.redirect_end": se(e.redirectEnd),
    "http.request.worker_start": se(e.workerStart),
    "http.request.fetch_start": se(e.fetchStart),
    "http.request.domain_lookup_start": se(e.domainLookupStart),
    "http.request.domain_lookup_end": se(e.domainLookupEnd),
    "http.request.connect_start": se(e.connectStart),
    "http.request.secure_connection_start": se(e.secureConnectionStart),
    "http.request.connection_end": se(e.connectEnd),
    "http.request.request_start": se(e.requestStart),
    "http.request.response_start": se(e.responseStart),
    "http.request.response_end": se(e.responseEnd),
    // For TTFB we actually want the relative time from timeOrigin to responseStart
    // This way, TTFB always measures the "first page load" experience.
    // see: https://web.dev/articles/ttfb#measure-resource-requests
    "http.request.time_to_first_byte": e.responseStart != null ? e.responseStart / 1e3 : void 0
  }) : t;
}
function up(e) {
  return Object.fromEntries(Object.entries(e).filter(([, t]) => t != null));
}
const lp = 2147483647;
let js = 0, le = {}, Z, Hn;
function dp({
  recordClsStandaloneSpans: e,
  recordLcpStandaloneSpans: t,
  client: n
}) {
  const r = un();
  if (r && oe()) {
    r.mark && E.performance.mark("sentry-tracing-init");
    const o = t ? ap(n) : hp(), s = _p(), i = e ? sp(n) : gp();
    return () => {
      o?.(), s(), i?.();
    };
  }
  return () => {
  };
}
function fp() {
  vt("longtask", ({ entries: e }) => {
    const t = Q();
    if (!t)
      return;
    const { op: n, start_timestamp: r } = R(t);
    for (const o of e) {
      const s = k(oe() + o.startTime), i = k(o.duration);
      n === "navigation" && r && s < r || He(t, s, s + i, {
        name: "Main UI thread blocked",
        op: "ui.long-task",
        attributes: {
          [P]: "auto.ui.browser.metrics"
        }
      });
    }
  });
}
function pp() {
  new PerformanceObserver((t) => {
    const n = Q();
    if (n)
      for (const r of t.getEntries()) {
        if (!r.scripts[0])
          continue;
        const o = k(oe() + r.startTime), { start_timestamp: s, op: i } = R(n);
        if (i === "navigation" && s && o < s)
          continue;
        const a = k(r.duration), c = {
          [P]: "auto.ui.browser.metrics"
        }, u = r.scripts[0], { invoker: l, invokerType: d, sourceURL: m, sourceFunctionName: f, sourceCharPosition: p } = u;
        c["browser.script.invoker"] = l, c["browser.script.invoker_type"] = d, m && (c["code.filepath"] = m), f && (c["code.function"] = f), p !== -1 && (c["browser.script.source_char_position"] = p), He(n, o, o + a, {
          name: "Main UI thread blocked",
          op: "ui.long-animation-frame",
          attributes: c
        });
      }
  }).observe({ type: "long-animation-frame", buffered: !0 });
}
function mp() {
  vt("event", ({ entries: e }) => {
    const t = Q();
    if (t) {
      for (const n of e)
        if (n.name === "click") {
          const r = k(oe() + n.startTime), o = k(n.duration), s = {
            name: _e(n.target),
            op: `ui.interaction.${n.name}`,
            startTime: r,
            attributes: {
              [P]: "auto.ui.browser.metrics"
            }
          }, i = bi(n.target);
          i && (s.attributes["ui.component_name"] = i), He(t, r, r + o, s);
        }
    }
  });
}
function gp() {
  return ka(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (le.cls = { value: e.value, unit: "" }, Hn = t);
  }, !0);
}
function hp() {
  return Ca(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (le.lcp = { value: e.value, unit: "millisecond" }, Z = t);
  }, !0);
}
function _p() {
  return Jf(({ metric: e }) => {
    e.entries[e.entries.length - 1] && (le.ttfb = { value: e.value, unit: "millisecond" });
  });
}
function yp(e, t) {
  const n = un(), r = oe();
  if (!n?.getEntries || !r)
    return;
  const o = k(r), s = n.getEntries(), { op: i, start_timestamp: a } = R(e);
  s.slice(js).forEach((c) => {
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
          bp(e, c, o);
          break;
        }
        case "mark":
        case "paint":
        case "measure": {
          Ep(e, c, u, l, o, t.ignorePerformanceApiSpans);
          const d = Oo(), m = c.startTime < d.firstHiddenTime;
          c.name === "first-paint" && m && (le.fp = { value: c.startTime, unit: "millisecond" }), c.name === "first-contentful-paint" && m && (le.fcp = { value: c.startTime, unit: "millisecond" });
          break;
        }
        case "resource": {
          Rp(
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
  }), js = Math.max(s.length - 1, 0), wp(e), i === "pageload" && (Dp(le), t.recordClsOnPageloadSpan || delete le.cls, t.recordLcpOnPageloadSpan || delete le.lcp, Object.entries(le).forEach(([c, u]) => {
    cl(c, u.value, u.unit);
  }), e.setAttribute("performance.timeOrigin", o), e.setAttribute("performance.activationStart", Ct()), Ap(e, t)), Z = void 0, Hn = void 0, le = {};
}
function Sp(e) {
  if (e?.entryType === "measure")
    try {
      return e.detail.devtools.track === "Components ⚛";
    } catch {
      return;
    }
}
function Ep(e, t, n, r, o, s) {
  if (Sp(t) || ["mark", "measure"].includes(t.entryType) && Fe(t.name, s))
    return;
  const i = sn(!1), a = k(i ? i.requestStart : 0), c = o + Math.max(n, a), u = o + n, l = u + r, d = {
    [P]: "auto.resource.browser.metrics"
  };
  c !== u && (d["sentry.browser.measure_happened_before_request"] = !0, d["sentry.browser.measure_start_time"] = c), Tp(d, t), c <= l && He(e, c, l, {
    name: t.name,
    op: t.entryType,
    attributes: d
  });
}
function Tp(e, t) {
  try {
    const n = t.detail;
    if (!n)
      return;
    if (typeof n == "object") {
      for (const [r, o] of Object.entries(n))
        if (o && ut(o))
          e[`sentry.browser.measure.detail.${r}`] = o;
        else if (o !== void 0)
          try {
            e[`sentry.browser.measure.detail.${r}`] = JSON.stringify(o);
          } catch {
          }
      return;
    }
    if (ut(n)) {
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
function bp(e, t, n) {
  ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((r) => {
    _n(e, t, r, n);
  }), _n(e, t, "secureConnection", n, "TLS/SSL"), _n(e, t, "fetch", n, "cache"), _n(e, t, "domainLookup", n, "DNS"), Ip(e, t, n);
}
function _n(e, t, n, r, o = n) {
  const s = vp(n), i = t[s], a = t[`${n}Start`];
  !a || !i || He(e, r + k(a), r + k(i), {
    op: `browser.${o}`,
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics",
      ...n === "redirect" && t.redirectCount != null ? { "http.redirect_count": t.redirectCount } : {}
    }
  });
}
function vp(e) {
  return e === "secureConnection" ? "connectEnd" : e === "fetch" ? "domainLookupStart" : `${e}End`;
}
function Ip(e, t, n) {
  const r = n + k(t.requestStart), o = n + k(t.responseEnd), s = n + k(t.responseStart);
  t.responseEnd && (He(e, r, o, {
    op: "browser.request",
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics"
    }
  }), He(e, s, o, {
    op: "browser.response",
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics"
    }
  }));
}
function Rp(e, t, n, r, o, s, i) {
  if (t.initiatorType === "xmlhttprequest" || t.initiatorType === "fetch")
    return;
  const a = t.initiatorType ? `resource.${t.initiatorType}` : "resource.other";
  if (i?.includes(a))
    return;
  const c = {
    [P]: "auto.resource.browser.metrics"
  }, u = at(n);
  u.protocol && (c["url.scheme"] = u.protocol.split(":").pop()), u.host && (c["server.address"] = u.host), c["url.same_origin"] = n.includes(E.location.origin), Op(t, c, [
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
  const l = { ...c, ...Ua(t) }, d = s + r, m = d + o;
  He(e, d, m, {
    name: n.replace(E.location.origin, ""),
    op: a,
    attributes: l
  });
}
function wp(e) {
  const t = E.navigator;
  if (!t)
    return;
  const n = t.connection;
  n && (n.effectiveType && e.setAttribute("effectiveConnectionType", n.effectiveType), n.type && e.setAttribute("connectionType", n.type), br(n.rtt) && (le["connection.rtt"] = { value: n.rtt, unit: "millisecond" })), br(t.deviceMemory) && e.setAttribute("deviceMemory", `${t.deviceMemory} GB`), br(t.hardwareConcurrency) && e.setAttribute("hardwareConcurrency", String(t.hardwareConcurrency));
}
function Ap(e, t) {
  Z && t.recordLcpOnPageloadSpan && (Z.element && e.setAttribute("lcp.element", _e(Z.element)), Z.id && e.setAttribute("lcp.id", Z.id), Z.url && e.setAttribute("lcp.url", Z.url.trim().slice(0, 200)), Z.loadTime != null && e.setAttribute("lcp.loadTime", Z.loadTime), Z.renderTime != null && e.setAttribute("lcp.renderTime", Z.renderTime), e.setAttribute("lcp.size", Z.size)), Hn?.sources && t.recordClsOnPageloadSpan && Hn.sources.forEach(
    (n, r) => e.setAttribute(`cls.source.${r + 1}`, _e(n.node))
  );
}
function Op(e, t, n) {
  n.forEach(([r, o]) => {
    const s = e[r];
    s != null && (typeof s == "number" && s < lp || typeof s == "string") && (t[o] = s);
  });
}
function Dp(e) {
  const t = sn(!1);
  if (!t)
    return;
  const { responseStart: n, requestStart: r } = t;
  r <= n && (e["ttfb.requestTime"] = {
    value: n - r,
    unit: "millisecond"
  });
}
function Np() {
  return un() && oe() ? vt("element", kp) : () => {
  };
}
const kp = ({ entries: e }) => {
  const t = Q(), n = t ? K(t) : void 0, r = n ? R(n).description : D().getScopeData().transactionName;
  e.forEach((o) => {
    const s = o;
    if (!s.identifier)
      return;
    const i = s.name, a = s.renderTime, c = s.loadTime, [u, l] = c ? [k(c), "load-time"] : a ? [k(a), "render-time"] : [U(), "entry-emission"], d = i === "image-paint" ? (
      // for image paints, we can acually get a duration because image-paint entries also have a `loadTime`
      // and `renderTime`. `loadTime` is the time when the image finished loading and `renderTime` is the
      // time when the image finished rendering.
      k(Math.max(0, (a ?? 0) - (c ?? 0)))
    ) : (
      // for `'text-paint'` entries, we can't get a duration because the `loadTime` is always zero.
      0
    ), m = {
      [P]: "auto.ui.browser.elementtiming",
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
    nn(
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
}, Cp = 1e3;
let qs, Jr, Xr;
function Pp(e) {
  const t = "dom";
  je(t, e), qe(t, Mp);
}
function Mp() {
  if (!E.document)
    return;
  const e = ie.bind(null, "dom"), t = zs(e, !0);
  E.document.addEventListener("click", t, !1), E.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = E[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (ne(o, "addEventListener", function(s) {
      return function(i, a, c) {
        if (i === "click" || i == "keypress")
          try {
            const u = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, l = u[i] = u[i] || { refCount: 0 };
            if (!l.handler) {
              const d = zs(e);
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
function Lp(e) {
  if (e.type !== Jr)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== Xr)
      return !1;
  } catch {
  }
  return !0;
}
function xp(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function zs(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = Up(n);
    if (xp(n.type, r))
      return;
    re(n, "_sentryCaptured", !0), r && !r._sentryId && re(r, "_sentryId", ae());
    const o = n.type === "keypress" ? "input" : n.type;
    Lp(n) || (e({ event: n, name: o, global: t }), Jr = n.type, Xr = r ? r._sentryId : void 0), clearTimeout(qs), qs = E.setTimeout(() => {
      Xr = void 0, Jr = void 0;
    }, Cp);
  };
}
function Up(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let yn;
function ko(e) {
  const t = "history";
  je(t, e), qe(t, $p);
}
function $p() {
  if (E.addEventListener("popstate", () => {
    const t = E.location.href, n = yn;
    if (yn = t, n === t)
      return;
    ie("history", { from: n, to: t });
  }), !cf())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = yn, s = Bp(String(r));
        if (yn = s, o === s)
          return t.apply(this, n);
        ie("history", { from: o, to: s });
      }
      return t.apply(this, n);
    };
  }
  ne(E.history, "pushState", e), ne(E.history, "replaceState", e);
}
function Bp(e) {
  try {
    return new URL(e, E.location.origin).toString();
  } catch {
    return e;
  }
}
const An = {};
function Fp(e) {
  const t = An[e];
  if (t)
    return t;
  let n = E[e];
  if (qr(n))
    return An[e] = n.bind(E);
  const r = E.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      o.hidden = !0, r.head.appendChild(o);
      const s = o.contentWindow;
      s?.[e] && (n = s[e]), r.head.removeChild(o);
    } catch (o) {
      rn && h.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, o);
    }
  return n && (An[e] = n.bind(E));
}
function Gp(e) {
  An[e] = void 0;
}
const ht = "__sentry_xhr_v3__";
function $a(e) {
  const t = "xhr";
  je(t, e), qe(t, Hp);
}
function Hp() {
  if (!E.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), s = U() * 1e3, i = ve(r[0]) ? r[0].toUpperCase() : void 0, a = jp(r[1]);
      if (!i || !a)
        return t.apply(n, r);
      n[ht] = {
        method: i,
        url: a,
        request_headers: {}
      }, i === "POST" && a.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const c = () => {
        const u = n[ht];
        if (u && n.readyState === 4) {
          try {
            u.status_code = n.status;
          } catch {
          }
          const l = {
            endTimestamp: U() * 1e3,
            startTimestamp: s,
            xhr: n,
            virtualError: o
          };
          ie("xhr", l);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(u, l, d) {
          return c(), u.apply(l, d);
        }
      }) : n.addEventListener("readystatechange", c), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(u, l, d) {
          const [m, f] = d, p = l[ht];
          return p && ve(m) && ve(f) && (p.request_headers[m.toLowerCase()] = f), u.apply(l, d);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[ht];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const s = {
        startTimestamp: U() * 1e3,
        xhr: n
      };
      return ie("xhr", s), t.apply(n, r);
    }
  });
}
function jp(e) {
  if (ve(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function qp(e) {
  let t;
  try {
    t = e.getAllResponseHeaders();
  } catch (n) {
    return rn && h.error(n, "Failed to get xhr response headers", e), {};
  }
  return t ? t.split(`\r
`).reduce((n, r) => {
    const [o, s] = r.split(": ");
    return s && (n[o.toLowerCase()] = s), n;
  }, {}) : {};
}
const vr = [], On = /* @__PURE__ */ new Map(), zp = 60;
function Wp() {
  if (un() && oe()) {
    const t = Yp();
    return () => {
      t();
    };
  }
  return () => {
  };
}
const Ws = {
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
function Yp() {
  return Xf(Kp);
}
const Kp = ({ metric: e }) => {
  if (e.value == null)
    return;
  const t = k(e.value);
  if (t > zp)
    return;
  const n = e.entries.find((p) => p.duration === e.value && Ws[p.name]);
  if (!n)
    return;
  const { interactionId: r } = n, o = Ws[n.name], s = k(oe() + n.startTime), i = Q(), a = i ? K(i) : void 0, u = (r != null ? On.get(r) : void 0) || a, l = u ? R(u).description : D().getScopeData().transactionName, d = _e(n.target), m = {
    [P]: "auto.http.browser.inp",
    [Oe]: `ui.interaction.${o}`,
    [Dt]: n.duration
  }, f = No({
    name: d,
    transaction: l,
    attributes: m,
    startTime: s
  });
  f && (f.addEvent("inp", {
    [en]: "millisecond",
    [tn]: e.value
  }), f.end(s + t));
};
function Vp() {
  const e = ({ entries: t }) => {
    const n = Q(), r = n && K(n);
    t.forEach((o) => {
      if (!rp(o) || !r)
        return;
      const s = o.interactionId;
      if (s != null && !On.has(s)) {
        if (vr.length > 10) {
          const i = vr.shift();
          On.delete(i);
        }
        vr.push(s), On.set(s, r);
      }
    });
  };
  vt("event", e), vt("first-input", e);
}
function rr(e, t = Fp("fetch")) {
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
      throw Gp("fetch"), c;
    } finally {
      n -= i, r--;
    }
  }
  return _d(e, o);
}
const Jp = 30, Xp = 50;
function Zr(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? ct : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const Zp = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, Qp = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, em = /\((\S*)(?::(\d+))(?::(\d+))\)/, tm = /at (.+?) ?\(data:(.+?),/, nm = (e) => {
  const t = e.match(tm);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = Zp.exec(e);
  if (n) {
    const [, o, s, i] = n;
    return Zr(o, ct, +s, +i);
  }
  const r = Qp.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const a = em.exec(r[2]);
      a && (r[2] = a[1], r[3] = a[2], r[4] = a[3]);
    }
    const [s, i] = Ba(r[1] || ct, r[2]);
    return Zr(i, s, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, rm = [Jp, nm], om = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, sm = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, im = (e) => {
  const t = om.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const s = sm.exec(t[3]);
      s && (t[1] = t[1] || "eval", t[3] = s[1], t[4] = s[2], t[5] = "");
    }
    let r = t[3], o = t[1] || ct;
    return [o, r] = Ba(o, r), Zr(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, am = [Xp, im], cm = [rm, am], or = Gc(...cm), Ba = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : ct,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, fe = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, Sn = 1024, um = "Breadcrumbs", lm = (e = {}) => {
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
    name: um,
    setup(n) {
      t.console && ga(mm(n)), t.dom && Pp(pm(n, t.dom)), t.xhr && $a(gm(n)), t.fetch && Sa(hm(n)), t.history && ko(_m(n)), t.sentry && n.on("beforeSendEvent", fm(n));
    }
  };
}, dm = lm;
function fm(e) {
  return function(n) {
    w() === e && lt(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: et(n)
      },
      {
        event: n
      }
    );
  };
}
function pm(e, t) {
  return function(r) {
    if (w() !== e)
      return;
    let o, s, i = typeof t == "object" ? t.serializeAttribute : void 0, a = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    a && a > Sn && (fe && h.warn(
      `\`dom.maxStringLength\` cannot exceed ${Sn}, but a value of ${a} was configured. Sentry will use ${Sn} instead.`
    ), a = Sn), typeof i == "string" && (i = [i]);
    try {
      const u = r.event, l = ym(u) ? u.target : u;
      o = _e(l, { keyAttrs: i, maxStringLength: a }), s = bi(l);
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0)
      return;
    const c = {
      category: `ui.${r.name}`,
      message: o
    };
    s && (c.data = { "ui.component_name": s }), lt(c, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function mm(e) {
  return function(n) {
    if (w() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: Hd(n.level),
      message: ts(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${ts(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    lt(r, {
      input: n.args,
      level: n.level
    });
  };
}
function gm(e) {
  return function(n) {
    if (w() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, s = n.xhr[ht];
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
      level: ya(c)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", m, d), lt(m, d);
  };
}
function hm(e) {
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
        e.emit("beforeOutgoingRequestBreadcrumb", a, i), lt(a, i);
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
          level: ya(i.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", c, a), lt(c, a);
      }
  };
}
function _m(e) {
  return function(n) {
    if (w() !== e)
      return;
    let r = n.from, o = n.to;
    const s = at(A.location.href);
    let i = r ? at(r) : void 0;
    const a = at(o);
    i?.path || (i = s), s.protocol === a.protocol && s.host === a.host && (o = a.relative), s.protocol === i.protocol && s.host === i.host && (r = i.relative), lt({
      category: "navigation",
      data: {
        from: r,
        to: o
      }
    });
  };
}
function ym(e) {
  return !!e && !!e.target;
}
const Sm = [
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
], Em = "BrowserApiErrors", Tm = (e = {}) => {
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
    name: Em,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && ne(A, "setTimeout", Ys), t.setInterval && ne(A, "setInterval", Ys), t.requestAnimationFrame && ne(A, "requestAnimationFrame", vm), t.XMLHttpRequest && "XMLHttpRequest" in A && ne(XMLHttpRequest.prototype, "send", Im);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : Sm).forEach((o) => Rm(o, t));
    }
  };
}, bm = Tm;
function Ys(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = bt(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${Re(e)}`
      }
    }), e.apply(this, t);
  };
}
function vm(e) {
  return function(t) {
    return e.apply(this, [
      bt(t, {
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
function Im(e) {
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
        }, a = ao(s);
        return a && (i.mechanism.data.handler = Re(a)), bt(s, i);
      });
    }), e.apply(this, t);
  };
}
function Rm(e, t) {
  const r = A[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (ne(r, "addEventListener", function(o) {
    return function(s, i, a) {
      try {
        wm(i) && (i.handleEvent = bt(i.handleEvent, {
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
      return t.unregisterOriginalCallbacks && Am(this, s, i), o.apply(this, [
        s,
        bt(i, {
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
function wm(e) {
  return typeof e.handleEvent == "function";
}
function Am(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const Om = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof A.document > "u") {
      fe && h.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    Is({ ignoreDuration: !0 }), Rs(), ko(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (Is({ ignoreDuration: !0 }), Rs());
    });
  }
}), Dm = "GlobalHandlers", Nm = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: Dm,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (Cm(n), Ks("onerror")), t.onunhandledrejection && (Pm(n), Ks("onunhandledrejection"));
    }
  };
}, km = Nm;
function Cm(e) {
  hi((t) => {
    const { stackParser: n, attachStacktrace: r } = Fa();
    if (w() !== e || Ta())
      return;
    const { msg: o, url: s, line: i, column: a, error: c } = t, u = xm(
      Ro(n, c || o, void 0, r, !1),
      s,
      i,
      a
    );
    u.level = "error", Qi(u, {
      originalException: c,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function Pm(e) {
  _i((t) => {
    const { stackParser: n, attachStacktrace: r } = Fa();
    if (w() !== e || Ta())
      return;
    const o = Mm(t), s = ut(o) ? Lm(o) : Ro(n, o, void 0, r, !0);
    s.level = "error", Qi(s, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function Mm(e) {
  if (ut(e))
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
function Lm(e) {
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
function xm(e, t, n, r) {
  const o = e.exception = e.exception || {}, s = o.values = o.values || [], i = s[0] = s[0] || {}, a = i.stacktrace = i.stacktrace || {}, c = a.frames = a.frames || [], u = r, l = n, d = Um(t) ?? Kn();
  return c.length === 0 && c.push({
    colno: u,
    filename: d,
    function: ct,
    in_app: !0,
    lineno: l
  }), e;
}
function Ks(e) {
  fe && h.log(`Global Handler attached: ${e}`);
}
function Fa() {
  return w()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function Um(e) {
  if (!(!ve(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const $m = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!A.navigator && !A.location && !A.document)
      return;
    const t = bo(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), Bm = "cause", Fm = 5, Gm = "LinkedErrors", Hm = (e = {}) => {
  const t = e.limit || Fm, n = e.key || Bm;
  return {
    name: Gm,
    preprocessEvent(r, o, s) {
      const i = s.getOptions();
      Fd(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        vo,
        i.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, jm = Hm;
function sr(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    Cd(),
    Od(),
    bm(),
    dm(),
    km(),
    jm(),
    zd(),
    $m(),
    Om()
  ];
}
function qm(e) {
  return e.split(",").some((t) => t.trim().startsWith("sentry-"));
}
function Ga(e) {
  try {
    return new URL(e, A.location.origin).href;
  } catch {
    return;
  }
}
function zm(e) {
  return e.entryType === "resource" && "initiatorType" in e && typeof e.nextHopProtocol == "string" && (e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest");
}
function Ha(e) {
  try {
    return new Headers(e);
  } catch {
    return;
  }
}
const Vs = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new Map(), ja = {
  traceFetch: !0,
  traceXHR: !0,
  enableHTTPTimings: !0,
  trackFetchStreamPerformance: !1
};
function Wm(e, t) {
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
    ...ja,
    ...t
  }, l = typeof s == "function" ? s : (p) => !0, d = (p) => Ym(p, a), m = {}, f = e.getOptions().propagateTraceparent;
  n && (e.addEventProcessor((p) => (p.type === "transaction" && p.spans && p.spans.forEach((S) => {
    if (S.op === "http.client") {
      const y = Ir.get(S.span_id);
      y && (S.timestamp = y / 1e3, Ir.delete(S.span_id));
    }
  }), p)), o && df((p) => {
    if (p.response) {
      const S = Vs.get(p.response);
      S && p.endTimestamp && Ir.set(S, p.endTimestamp);
    }
  }), Sa((p) => {
    const S = Vd(p, l, d, m, {
      propagateTraceparent: f,
      onRequestSpanEnd: u
    });
    if (p.response && p.fetchData.__span && Vs.set(p.response, p.fetchData.__span), S) {
      const y = Ga(p.fetchData.url), G = y ? at(y).host : void 0;
      S.setAttributes({
        "http.url": y,
        "server.address": G
      }), i && Js(S), c?.(S, { headers: p.headers });
    }
  })), r && $a((p) => {
    const S = Km(
      p,
      l,
      d,
      m,
      f,
      u
    );
    S && (i && Js(S), c?.(S, {
      headers: Ha(p.xhr.__sentry_xhr_v3__?.request_headers)
    }));
  });
}
function Js(e) {
  const { url: t } = R(e).data;
  if (!t || typeof t != "string")
    return;
  const n = vt("resource", ({ entries: r }) => {
    r.forEach((o) => {
      zm(o) && o.name.endsWith(t) && (e.setAttributes(Ua(o)), setTimeout(n));
    });
  });
}
function Ym(e, t) {
  const n = Kn();
  if (n) {
    let r, o;
    try {
      r = new URL(e, n), o = new URL(n).origin;
    } catch {
      return !1;
    }
    const s = r.origin === o;
    return t ? Fe(r.toString(), t) || s && Fe(r.pathname, t) : s;
  } else {
    const r = !!e.match(/^\/(?!\/)/);
    return t ? Fe(e, t) : r;
  }
}
function Km(e, t, n, r, o, s) {
  const i = e.xhr, a = i?.[ht];
  if (!i || i.__sentry_own_request__ || !a)
    return;
  const { url: c, method: u } = a, l = de() && t(c);
  if (e.endTimestamp && l) {
    const G = i.__sentry_xhr_span_id__;
    if (!G) return;
    const W = r[G];
    W && a.status_code !== void 0 && (ki(W, a.status_code), W.end(), s?.(W, {
      headers: Ha(qp(i)),
      error: e.error
    }), delete r[G]);
    return;
  }
  const d = Ga(c), m = at(d || c), f = Ed(c), p = !!Q(), S = l && p ? kt({
    name: `${u} ${f}`,
    attributes: {
      url: c,
      type: "xhr",
      "http.method": u,
      "http.url": d,
      "server.address": m?.host,
      [P]: "auto.http.browser",
      [Oe]: "http.client",
      ...m?.search && { "http.query": m?.search },
      ...m?.hash && { "http.fragment": m?.hash }
    }
  }) : new Ge();
  i.__sentry_xhr_span_id__ = S.spanContext().spanId, r[i.__sentry_xhr_span_id__] = S, n(c) && Vm(
    i,
    // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
    // we do not want to use the span as base for the trace headers,
    // which means that the headers will be generated from the scope and the sampling decision is deferred
    de() && p ? S : void 0,
    o
  );
  const y = w();
  return y && y.emit("beforeOutgoingRequestSpan", S, e), S;
}
function Vm(e, t, n) {
  const { "sentry-trace": r, baggage: o, traceparent: s } = ma({ span: t, propagateTraceparent: n });
  r && Jm(e, r, o, s);
}
function Jm(e, t, n, r) {
  const o = e.__sentry_xhr_v3__?.request_headers;
  if (!(o?.["sentry-trace"] || !e.setRequestHeader))
    try {
      if (e.setRequestHeader("sentry-trace", t), r && !o?.traceparent && e.setRequestHeader("traceparent", r), n) {
        const s = o?.baggage;
        (!s || !qm(s)) && e.setRequestHeader("baggage", n);
      }
    } catch {
    }
}
function Xm() {
  A.document ? A.document.addEventListener("visibilitychange", () => {
    const e = Q();
    if (!e)
      return;
    const t = K(e);
    if (A.document.hidden && t) {
      const n = "cancelled", { op: r, status: o } = R(t);
      fe && h.log(`[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`), o || t.setStatus({ code: x, message: n }), t.setAttribute("sentry.cancellation_reason", "document.hidden"), t.end();
    }
  }) : fe && h.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
const Zm = 3600, qa = "sentry_previous_trace", Qm = "sentry.previous_trace";
function eg(e, {
  linkPreviousTrace: t,
  consistentTraceSampling: n
}) {
  const r = t === "session-storage";
  let o = r ? rg() : void 0;
  e.on("spanStart", (i) => {
    if (K(i) !== i)
      return;
    const a = D().getPropagationContext();
    o = tg(o, i, a), r && ng(o);
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
        sampled: String(Qr(o.spanContext))
      },
      sampleRand: o.sampleRand
    }), i.parentSampled = Qr(o.spanContext), i.parentSampleRate = o.sampleRate, i.spanAttributes = {
      ...i.spanAttributes,
      [Di]: o.sampleRate
    };
  });
}
function tg(e, t, n) {
  const r = R(t);
  function o() {
    try {
      return Number(n.dsc?.sample_rate) ?? Number(r.data?.[co]);
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
  return i.traceId === r.trace_id ? e : (Date.now() / 1e3 - e.startTimestamp <= Zm && (fe && h.log(
    `Adding previous_trace ${i} link to span ${{
      op: r.op,
      ...t.spanContext()
    }}`
  ), t.addLink({
    context: i,
    attributes: {
      [pu]: "previous_trace"
    }
  }), t.setAttribute(
    Qm,
    `${i.traceId}-${i.spanId}-${Qr(i) ? 1 : 0}`
  )), s);
}
function ng(e) {
  try {
    A.sessionStorage.setItem(qa, JSON.stringify(e));
  } catch (t) {
    fe && h.warn("Could not store previous trace in sessionStorage", t);
  }
}
function rg() {
  try {
    const e = A.sessionStorage?.getItem(qa);
    return JSON.parse(e);
  } catch {
    return;
  }
}
function Qr(e) {
  return e.traceFlags === 1;
}
const og = "BrowserTracing", sg = {
  ...Rn,
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
  ...ja
}, za = (e = {}) => {
  const t = {
    name: void 0,
    source: void 0
  }, n = A.document, {
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
    shouldCreateSpanForRequest: W,
    enableHTTPTimings: ke,
    ignoreResourceSpans: Ye,
    ignorePerformanceApiSpans: mt,
    instrumentPageLoad: gt,
    instrumentNavigation: b,
    detectRedirects: M,
    linkPreviousTrace: Ce,
    consistentTraceSampling: ye,
    enableReportPageLoaded: Y,
    onRequestSpanStart: Se,
    onRequestSpanEnd: L
  } = {
    ...sg,
    ...e
  };
  let Ke, Ve, ce;
  function Pe(O, H, I = !0) {
    const ee = H.op === "pageload", te = H.name, ue = l ? l(H) : H, Je = ue.attributes || {};
    if (te !== ue.name && (Je[he] = "custom", ue.attributes = Je), !I) {
      const Lt = ft();
      kt({
        ...ue,
        startTime: Lt
      }).end(Lt);
      return;
    }
    t.name = ue.name, t.source = Je[he];
    const Ee = Zi(ue, {
      idleTimeout: d,
      finalTimeout: m,
      childSpanTimeout: f,
      // should wait for finish signal if it's a pageload transaction
      disableAutoFinish: ee,
      beforeSpanEnd: (Lt) => {
        Ke?.(), yp(Lt, {
          recordClsOnPageloadSpan: !c,
          recordLcpOnPageloadSpan: !u,
          ignoreResourceSpans: Ye,
          ignorePerformanceApiSpans: mt
        }), Zs(O, void 0);
        const Vo = D(), Pc = Vo.getPropagationContext();
        Vo.setPropagationContext({
          ...Pc,
          traceId: Ee.spanContext().traceId,
          sampled: We(Ee),
          dsc: De(Lt)
        }), ee && (ce = void 0);
      },
      trimIdleSpanEndTimestamp: !Y
    });
    ee && Y && (ce = Ee), Zs(O, Ee);
    function Ko() {
      n && ["interactive", "complete"].includes(n.readyState) && O.emit("idleSpanEnableAutoFinish", Ee);
    }
    ee && !Y && n && (n.addEventListener("readystatechange", () => {
      Ko();
    }), Ko());
  }
  return {
    name: og,
    setup(O) {
      if (Gu(), Ke = dp({
        recordClsStandaloneSpans: c || !1,
        recordLcpStandaloneSpans: u || !1,
        client: O
      }), r && Wp(), o && Np(), i && v.PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("long-animation-frame") ? pp() : s && fp(), a && mp(), M && n) {
        const I = () => {
          Ve = U();
        };
        addEventListener("click", I, { capture: !0 }), addEventListener("keydown", I, { capture: !0, passive: !0 });
      }
      function H() {
        const I = Vt(O);
        I && !R(I).timestamp && (fe && h.log(`[Tracing] Finishing current active span with op: ${R(I).op}`), I.setAttribute(zt, "cancelled"), I.end());
      }
      O.on("startNavigationSpan", (I, ee) => {
        if (w() !== O)
          return;
        if (ee?.isRedirect) {
          fe && h.warn("[Tracing] Detected redirect, navigation span will not be the root span, but a child span."), Pe(
            O,
            {
              op: "navigation.redirect",
              ...I
            },
            !1
          );
          return;
        }
        Ve = void 0, H(), ze().setPropagationContext({
          traceId: Ae(),
          sampleRand: Math.random(),
          propagationSpanId: de() ? void 0 : Ie()
        });
        const te = D();
        te.setPropagationContext({
          traceId: Ae(),
          sampleRand: Math.random(),
          propagationSpanId: de() ? void 0 : Ie()
        }), te.setSDKProcessingMetadata({
          normalizedRequest: void 0
        }), Pe(O, {
          op: "navigation",
          ...I,
          // Navigation starts a new trace and is NOT parented under any active interaction (e.g. ui.action.click)
          parentSpan: null,
          forceTransaction: !0
        });
      }), O.on("startPageLoadSpan", (I, ee = {}) => {
        if (w() !== O)
          return;
        H();
        const te = ee.sentryTrace || Xs("sentry-trace"), ue = ee.baggage || Xs("baggage"), Je = Pu(te, ue), Ee = D();
        Ee.setPropagationContext(Je), de() || (Ee.getPropagationContext().propagationSpanId = Ie()), Ee.setSDKProcessingMetadata({
          normalizedRequest: bo()
        }), Pe(O, {
          op: "pageload",
          ...I
        });
      }), O.on("endPageloadSpan", () => {
        Y && ce && (ce.setAttribute(zt, "reportPageLoaded"), ce.end());
      });
    },
    afterAllSetup(O) {
      let H = Kn();
      if (Ce !== "off" && eg(O, { linkPreviousTrace: Ce, consistentTraceSampling: ye }), A.location) {
        if (gt) {
          const I = oe();
          ig(O, {
            name: A.location.pathname,
            // pageload should always start at timeOrigin (and needs to be in s, not ms)
            startTime: I ? I / 1e3 : void 0,
            attributes: {
              [he]: "url",
              [P]: "auto.pageload.browser"
            }
          });
        }
        b && ko(({ to: I, from: ee }) => {
          if (ee === void 0 && H?.indexOf(I) !== -1) {
            H = void 0;
            return;
          }
          H = void 0;
          const te = pa(I), ue = Vt(O), Je = ue && M && ug(ue, Ve);
          ag(
            O,
            {
              name: te?.pathname || A.location.pathname,
              attributes: {
                [he]: "url",
                [P]: "auto.navigation.browser"
              }
            },
            { url: I, isRedirect: Je }
          );
        });
      }
      p && Xm(), a && cg(O, d, m, f, t), r && Vp(), Wm(O, {
        traceFetch: S,
        traceXHR: y,
        trackFetchStreamPerformance: G,
        tracePropagationTargets: O.getOptions().tracePropagationTargets,
        shouldCreateSpanForRequest: W,
        enableHTTPTimings: ke,
        onRequestSpanStart: Se,
        onRequestSpanEnd: L
      });
    }
  };
};
function ig(e, t, n) {
  e.emit("startPageLoadSpan", t, n), D().setTransactionName(t.name);
  const r = Vt(e);
  return r && e.emit("afterStartPageLoadSpan", r), r;
}
function ag(e, t, n) {
  const { url: r, isRedirect: o } = n || {};
  e.emit("beforeStartNavigationSpan", t, { isRedirect: o }), e.emit("startNavigationSpan", t, { isRedirect: o });
  const s = D();
  return s.setTransactionName(t.name), r && !o && s.setSDKProcessingMetadata({
    normalizedRequest: {
      ...bo(),
      url: r
    }
  }), Vt(e);
}
function Xs(e) {
  return A.document?.querySelector(`meta[name=${e}]`)?.getAttribute("content") || void 0;
}
function cg(e, t, n, r, o) {
  const s = A.document;
  let i;
  const a = () => {
    const c = "ui.action.click", u = Vt(e);
    if (u) {
      const l = R(u).op;
      if (["navigation", "pageload"].includes(l)) {
        fe && h.warn(`[Tracing] Did not create ${c} span because a pageload or navigation span is in progress.`);
        return;
      }
    }
    if (i && (i.setAttribute(zt, "interactionInterrupted"), i.end(), i = void 0), !o.name) {
      fe && h.warn(`[Tracing] Did not create ${c} transaction because _latestRouteName is missing.`);
      return;
    }
    i = Zi(
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
const Wa = "_sentry_idleSpan";
function Vt(e) {
  return e[Wa];
}
function Zs(e, t) {
  re(e, Wa, t);
}
const Qs = 1.5;
function ug(e, t) {
  const n = R(e), r = ft(), o = n.start_timestamp;
  return !(r - o > Qs || t && r - t <= Qs);
}
const lg = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 }, Ya = "https://58e161b5578429493e2034e4dadd3f58@o4510270313660416.ingest.us.sentry.io/4510293785640960", eo = "https://817f965a1b1055130ff59d97bef82e5f@o4510270313660416.ingest.us.sentry.io/4510294325198848", It = () => {
  try {
    const e = lg;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t || n)
        return t || n || "production";
    }
  } catch {
  }
  return "production";
}, dg = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (e) {
    console.warn("[Sentry] Could not read manifest version:", e);
  }
  return "1.0.0";
}, Jt = () => {
  const e = It();
  return {
    environment: e,
    enableLogs: !0,
    tracesSampleRate: e === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: dg(),
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
function ir(e) {
  return e.filter((t) => {
    const n = t.name || (typeof t == "function" ? t.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const fg = () => ({
  ...Jt(),
  sendDefaultPii: !0,
  // Enable PII collection for background worker (safe context)
  initialScope: {
    tags: {
      context: "background",
      type: "service-worker"
    }
  }
}), pg = () => ({
  ...Jt(),
  initialScope: {
    tags: {
      context: "popup",
      type: "react-ui"
    }
  }
}), mg = () => ({
  ...Jt(),
  initialScope: {
    tags: {
      context: "options",
      type: "react-ui"
    }
  }
}), gg = () => {
  const e = It();
  return {
    ...Jt(),
    tracesSampleRate: e === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(t) {
      const n = Jt().beforeSend?.(t) ?? t;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
};
function ar() {
  const e = {
    setAttribute: () => e,
    setTag: () => e,
    setContext: () => e,
    setStatus: () => e,
    finish: () => {
    },
    end: () => {
    },
    startChild: () => e,
    updateName: () => e,
    isRecording: () => !1
  };
  return e;
}
let ei = !1, Rr = null, wr = null;
function hg() {
  if (ei && Rr && wr)
    return { client: Rr, scope: wr };
  try {
    const e = fg(), t = sr({}), n = ir(t);
    try {
      const a = To({ levels: ["warn", "error"] });
      n.push(a);
    } catch (a) {
      console.warn("[v0][Sentry] Console logging integration not available:", a);
    }
    const r = new er({
      dsn: eo,
      transport: rr,
      stackParser: or,
      integrations: n,
      ...e
    }), o = new C();
    o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([a, c]) => {
      o.setTag(a, c);
    }), r.init(), Rr = r, wr = o, ei = !0;
    const i = It() === "development";
    if (i && (console.log("[v0][Sentry] Background service worker monitoring initialized with isolated client"), console.log("[v0][Sentry] Environment:", e.environment), console.log("[v0][Sentry] Release:", e.release), console.log("[v0][Sentry] DSN:", eo), console.log("[v0][Sentry] sendDefaultPii:", e.sendDefaultPii), console.log("[v0][Sentry] Client initialized:", !!r)), i)
      try {
        o.captureMessage("[v0][Sentry] Background worker connected successfully", "info"), console.log("[v0][Sentry] Test message sent to verify connection");
      } catch (a) {
        console.warn("[v0][Sentry] Test message failed:", a);
      }
    return { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in background worker:", e), console.warn("[v0][Sentry] Extension will continue without Sentry monitoring"), { client: null, scope: new C() };
  }
}
const { client: Ze, scope: J } = hg(), N = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!J || !Ze))
      return J.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!J || !Ze))
      return J.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!J || !Ze))
        return Xn(e, t, { scope: J });
    },
    warn: (e, t) => {
      if (!(!J || !Ze))
        return Zn(e, t, { scope: J });
    },
    error: (e, t) => {
      if (!(!J || !Ze))
        return Qn(e, t, { scope: J });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !J || !Ze ? t(ar()) : nn({ ...e, scope: J }, t),
  // Get client (for advanced usage)
  getClient: () => Ze,
  // Get scope (for advanced usage)
  getScope: () => J
}, Ka = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: N,
  scope: J
}, Symbol.toStringTag, { value: "Module" })), g = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, z = {
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
}, Ne = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, _g = 0.5, to = 0.5, $ = {
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
function ln(e) {
  if (!e) return "";
  const t = e.trim();
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, "");
  } catch {
    return t.split("/")[0].replace(/^www\./, "");
  }
}
function Co(e) {
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
function Po(e) {
  return `||${e}`;
}
async function Va() {
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
async function Ja() {
  return (await Va()).debugDNR;
}
let no = null;
function yg() {
  return no === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : no;
}
async function Xa() {
  no = await Va();
}
function tt() {
  return yg().debugTracking;
}
let Mo = null, ti = !1, ni = !1;
const Sg = 3e3, Eg = 1e3;
function Lo(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % Eg;
  return Sg + n;
}
async function Tg() {
  if (ni) return;
  ni = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(z.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const n = t.getTime() - e.getTime(), r = Date.now() + Math.max(n, 6e4);
  await chrome.alarms.create(z.DAILY_SYNC, {
    when: r,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(r - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === z.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await bg());
  });
}
async function bg() {
  const { [g.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((n) => Lo(n.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (n) {
      console.error("[v0] Error clearing time limit session rules:", n);
    }
}
async function vg() {
  ti || (ti = !0, console.log("[v0] Initializing usage tracker module"), await Xa(), await chrome.alarms.clear(z.USAGE_TRACKER), await chrome.alarms.create(z.USAGE_TRACKER, {
    periodInMinutes: to
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === z.USAGE_TRACKER && await cr();
  }), chrome.tabs.onActivated.addListener(Ig), chrome.tabs.onUpdated.addListener(Rg), chrome.windows.onFocusChanged.addListener(wg), await Za());
}
async function Ig(e) {
  await cr();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await xo(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await dn();
  }
}
async function Rg(e, t) {
  e === Mo && t.url && t.status === "complete" && (await cr(), await xo(e, t.url));
}
async function wg(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await cr(), await dn()) : await Za();
}
async function Za() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await xo(e.id, e.url) : await dn();
}
async function xo(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await dn();
    return;
  }
  Mo = e;
  const n = Date.now(), r = {
    url: t,
    startTime: n,
    lastUpdate: n
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: r });
}
async function dn() {
  Mo = null, await chrome.storage.session.remove(g.CURRENTLY_TRACKING);
}
async function cr() {
  const t = (await chrome.storage.session.get(g.CURRENTLY_TRACKING))[g.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    tt() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const n = Co(t.url);
  if (!n) {
    tt() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await dn();
    return;
  }
  const r = Date.now(), o = Math.floor((r - t.startTime) / 1e3), s = t.lastUpdate || t.startTime, i = r - s, a = to * 60 * 1e3 * 2;
  if (i > a && (tt() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(i / 1e3),
    maxGapMs: Math.floor(a / 1e3),
    domain: n,
    url: t.url
  }), t.startTime = r - to * 60 * 1e3), tt() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: n,
    timeSpent: o,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: i > a
  }), t.startTime = r, t.lastUpdate = r, await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: t }), o < 1) {
    tt() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
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
  l[c].perDomain || (l[c].perDomain = {}), l[c].perDomain[n] = (l[c].perDomain[n] || 0) + o, l[c].totalMinutes = Object.values(l[c].perDomain).reduce((d, m) => d + m, 0) / 60, await chrome.storage.local.set({ [g.DAILY_USAGE]: l }), console.log("[v0] Recorded usage:", n, o, "seconds"), await F(), await Qa(n, l[c].perDomain[n]);
}
async function Qa(e, t) {
  const { [g.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = (Array.isArray(n) ? n : []).find((a) => a.domain === e);
  if (!o) return;
  const s = o.dailyMinutes ?? o.limitMinutes ?? 0, i = s * 60;
  if (t >= i) {
    const a = Lo(e);
    try {
      tt() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i,
        limitMinutes: s,
        exceeded: t >= i
      });
      const c = Po(e), u = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
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
      }, d = await Ja();
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
        p.length > 0 && p[0].id && p[0].url && Co(p[0].url) === e && (await chrome.tabs.update(p[0].id, { url: u }), console.log(`[v0] Redirected active tab ${p[0].id} to blocked page for ${e}`), tt() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
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
      const { createNotification: f } = await Promise.resolve().then(() => ur);
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
async function Ag(e, t) {
  const n = ln(e);
  if (!n) return;
  const { [g.TIME_LIMITS]: r = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = Array.isArray(r) ? r : [], s = o.findIndex((a) => a.domain === n), i = Lo(n);
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
      await Qa(n, u);
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
  await chrome.storage.local.set({ [g.TIME_LIMITS]: o }), await F(), console.log("[v0] Time limit set/updated:", n, t, "minutes");
}
const _t = "__contentSuggestNotified__", Og = 24 * 60 * 60 * 1e3;
async function ec() {
  try {
    const { [g.SETTINGS]: e } = await chrome.storage.sync.get(g.SETTINGS);
    return (e?.contentAnalysisSuppressionMinutes || 24 * 60) * 60 * 1e3;
  } catch {
    return Og;
  }
}
async function Dg() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [_t]: e = {} } = await chrome.storage.session.get(_t), t = Date.now(), n = await ec();
    let r = !1;
    for (const o of Object.keys(e || {}))
      (typeof e[o] != "number" || t - e[o] > n) && (delete e[o], r = !0);
    r && await chrome.storage.session.set({ [_t]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function Ng(e) {
  try {
    const t = await ec(), { [_t]: n = {} } = await chrome.storage.session.get(_t), r = n?.[e], o = Date.now();
    return r && o - r < t ? !1 : (await chrome.storage.session.set({
      [_t]: { ...n || {}, [e]: o }
    }), !0);
  } catch {
    return !0;
  }
}
async function kg(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await Cg() || !(e.classification === "distracting" && e.score > _g) || !e?.url) return;
    const t = Co(e.url);
    if (!t) return;
    const { [g.BLACKLIST]: n = [] } = await chrome.storage.local.get(
      g.BLACKLIST
    );
    if (n.some((s) => s.domain === t) || !await Ng(t))
      return;
    const { createNotification: o } = await Promise.resolve().then(() => ur);
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
let ri = "";
async function F() {
  try {
    const e = await Uo(), t = JSON.stringify(e, (n, r) => {
      if (r && typeof r == "object" && !Array.isArray(r)) {
        const o = {};
        return Object.keys(r).sort().forEach((s) => {
          o[s] = r[s];
        }), o;
      }
      return r;
    });
    if (t === ri)
      return;
    ri = t, chrome.runtime.sendMessage({ type: $.STATE_UPDATED, payload: { state: e } }, (n) => {
      const r = chrome.runtime.lastError, o = r?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((a) => o === a || o.startsWith(a));
      r && !i && console.warn("[v0] notifyStateUpdate lastError:", r.message);
    });
    try {
      for (const n of Dn)
        try {
          n.postMessage({ type: $.STATE_UPDATED, payload: { state: e } });
        } catch (r) {
          console.warn("[v0] Failed to post state to port:", r);
        }
    } catch {
    }
  } catch (e) {
    console.error("[v0] Error notifying state update:", e);
  }
}
async function Cg() {
  const { getNotificationSetting: e } = await Promise.resolve().then(() => ur);
  return await e();
}
async function Uo() {
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
      config: Ne,
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
const Dn = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    Dn.add(e), Uo().then((t) => {
      try {
        e.postMessage({ type: $.STATE_UPDATED, payload: { state: t } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      Dn.delete(e);
    });
  } catch {
    try {
      Dn.delete(e);
    } catch {
    }
  }
});
async function Pg(e, t) {
  return N.startSpan(
    {
      op: "message.handle",
      name: `Handle Message: ${e.type}`
    },
    async (n) => {
      const r = (o, s) => {
        n && typeof n.setAttribute == "function" && n.setAttribute(o, s);
      };
      try {
        console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", t), r("message_type", e.type), r("has_payload", !!e.payload), r("sender_id", t.id || "unknown"), r("sender_url", t.url || "unknown");
        let o;
        switch (e.type) {
          case $.GET_INITIAL_STATE: {
            o = await Uo();
            break;
          }
          case $.ADD_TO_BLACKLIST: {
            const s = e.payload?.domain;
            typeof s == "string" && (await Bo(s), r("domain", s)), await F(), o = { success: !0 };
            break;
          }
          case $.REMOVE_FROM_BLACKLIST: {
            const s = e.payload?.domain;
            typeof s == "string" && await rc(s), await F(), o = { success: !0 };
            break;
          }
          case $.POMODORO_START: {
            const s = e.payload;
            console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(s)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(s?.config));
            const i = s?.config || s;
            console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(i)), await Ug(i), o = { success: !0 };
            break;
          }
          case $.POMODORO_STOP: {
            await cc(), o = { success: !0 };
            break;
          }
          case $.POMODORO_PAUSE: {
            await $g(), o = { success: !0 };
            break;
          }
          case $.POMODORO_RESUME: {
            await Bg(), o = { success: !0 };
            break;
          }
          case $.START_BREAK: {
            await uc(), o = { success: !0 };
            break;
          }
          case $.TIME_LIMIT_SET: {
            const s = e.payload, i = s?.domain, a = s?.dailyMinutes ?? s?.limitMinutes;
            typeof i == "string" && typeof a == "number" && await Ag(i, a), await F(), o = { success: !0 };
            break;
          }
          case $.CONTENT_ANALYSIS_RESULT: {
            await kg(e.payload?.result), await F(), o = { success: !0 };
            break;
          }
          case $.STATE_PATCH: {
            const s = e.payload ?? {}, i = s.patch?.settings ?? s.settings ?? s;
            if (!i || typeof i != "object") {
              o = { success: !1, error: "Invalid STATE_PATCH payload" };
              break;
            }
            const { [g.SETTINGS]: a } = await chrome.storage.sync.get(g.SETTINGS), c = { ...a ?? {}, ...i ?? {} }, u = JSON.stringify(a ?? {}), l = JSON.stringify(c);
            if (u === l) {
              o = { success: !0 };
              break;
            }
            await chrome.storage.sync.set({ [g.SETTINGS]: c }), await F(), o = { success: !0 };
            break;
          }
          case $.SITE_CUSTOMIZATION_UPDATED: {
            const { [g.SITE_CUSTOMIZATIONS]: s } = await chrome.storage.local.get(g.SITE_CUSTOMIZATIONS), i = e.payload;
            let a = { ...s ?? {} };
            i && typeof i == "object" && !Array.isArray(i) && (i.domain && i.config ? a = { ...a, [String(i.domain)]: i.config } : a = { ...a, ...i }), await chrome.storage.local.set({ [g.SITE_CUSTOMIZATIONS]: a }), await F(), o = { success: !0 };
            break;
          }
          case $.TOGGLE_ZEN_MODE: {
            const [s] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
            if (s?.id)
              try {
                await chrome.tabs.sendMessage(s.id, {
                  type: $.TOGGLE_ZEN_MODE,
                  payload: e.payload
                });
              } catch (i) {
                console.warn(
                  `[v0] Could not send TOGGLE_ZEN_MODE to tab ${s.id}. It may be a protected page or the content script wasn't injected.`,
                  i
                );
              }
            o = { success: !0 };
            break;
          }
          case $.STATE_UPDATED: {
            console.warn(
              "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
            ), o = { success: !1, error: "Invalid message type received." };
            break;
          }
          default: {
            const s = e.type, i = new Error(`Unknown message type: ${s}`);
            throw N.logger.error("Unknown message type received", {
              type: e.type
            }), i;
          }
        }
        return r("success", !0), o;
      } catch (o) {
        throw N.logger.error("Message handling failed", {
          type: e.type,
          error: o
        }), r("success", !1), N.captureException(o), o;
      }
    }
  );
}
const Te = 1e3, B = 2e3, xe = 1e3, be = 1e4;
let Ar = Promise.resolve();
function $o(e) {
  return Ar = Ar.then(e, e), Ar;
}
function oi(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % xe;
  return B + n;
}
async function tc() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Blocker" },
    async (e) => {
      const t = (n, r) => {
        e && typeof e.setAttribute == "function" && e.setAttribute(n, r);
      };
      try {
        console.log("[v0] Initializing blocker module"), N.logger.info("Blocker module initializing"), await Xa(), await Fo(), N.logger.info("Blocker module initialized successfully"), t("success", !0);
      } catch (n) {
        throw N.logger.error("Failed to initialize blocker module", { error: n }), t("success", !1), N.captureException(n), n;
      }
    }
  );
}
async function nc() {
  return N.startSpan(
    { op: "dnr.cleanup", name: "Cleanup All DNR Rules" },
    async (e) => {
      const t = (n, r) => {
        e && typeof e.setAttribute == "function" && e.setAttribute(n, r);
      };
      console.log("[v0] Cleaning up all DNR rules...");
      try {
        const n = await chrome.declarativeNetRequest.getDynamicRules();
        if (n.length > 0) {
          const o = n.map((s) => s.id);
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: o
          }), console.log(`[v0] Removed ${o.length} dynamic rules:`, o), t("dynamic_rules_removed", o.length), N.logger.info(`Removed ${o.length} dynamic DNR rules`);
        }
        const r = await chrome.declarativeNetRequest.getSessionRules();
        if (r.length > 0) {
          const o = r.map((s) => s.id);
          await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: o
          }), console.log(`[v0] Removed ${o.length} session rules:`, o), t("session_rules_removed", o.length), N.logger.info(`Removed ${o.length} session DNR rules`);
        }
        console.log("[v0] DNR cleanup complete"), t("success", !0);
      } catch (n) {
        console.error("[v0] Error during DNR cleanup:", n), t("success", !1), N.logger.error("DNR cleanup failed", { error: n }), N.captureException(n);
      }
    }
  );
}
async function Mg() {
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
async function Bo(e) {
  return N.startSpan(
    { op: "blocker.add", name: "Add to Blacklist" },
    async (t) => {
      const n = (r, o) => {
        t && typeof t.setAttribute == "function" && t.setAttribute(r, o);
      };
      try {
        n("domain", e);
        const o = (await chrome.storage.local.get(
          g.BLACKLIST
        ))[g.BLACKLIST] ?? [], s = ln(e);
        if (!s) {
          N.logger.warn("Invalid domain for blacklist", { domain: e }), n("success", !1), n("reason", "invalid_domain");
          return;
        }
        if (n("normalized_domain", s), o.some((c) => c.domain === s)) {
          console.log("[v0] Domain already in blacklist:", s), n("success", !1), n("reason", "already_exists");
          return;
        }
        const i = (c) => c, a = [
          ...o,
          { domain: i(s), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
        ];
        try {
          const c = o;
          if (c.length === a.length && c.every((l, d) => l.domain === a[d].domain && l.addedAt === a[d].addedAt)) {
            console.log("[v0] addToBlacklist: no-op, blacklist identical"), n("success", !1), n("reason", "no_change");
            return;
          }
        } catch {
        }
        await chrome.storage.local.set({ [g.BLACKLIST]: a }), await Fo(), await F(), console.log("[v0] Added to blacklist:", s), N.logger.info("Domain added to blacklist", {
          domain: s,
          blacklist_size: a.length
        }), n("success", !0), n("blacklist_size", a.length);
      } catch (r) {
        throw N.logger.error("Failed to add domain to blacklist", { domain: e, error: r }), n("success", !1), N.captureException(r), r;
      }
    }
  );
}
async function rc(e) {
  const n = (await chrome.storage.local.get(
    g.BLACKLIST
  ))[g.BLACKLIST] ?? [], r = ln(e);
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
    await chrome.storage.local.set({ [g.BLACKLIST]: o }), await Fo(), await F(), console.log("[v0] Removed from blacklist:", r);
  }
}
async function Fo() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), $o(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const t = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", t.length, "existing DNR rules");
    const n = new Set(
      t.map((i) => i.id).filter(
        (i) => i >= B && i < B + xe || i >= B + be && i < B + be + xe
      )
    ), r = [], o = /* @__PURE__ */ new Set();
    for (const i of e) {
      const a = ln(i.domain);
      if (!a) continue;
      let c = oi(a), u = 0;
      const l = xe;
      for (; o.has(c) || n.has(c); ) {
        if (u++, u >= l) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${a}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        c++, c >= B + xe && (c = B);
      }
      if (u >= l) {
        console.warn(`[v0] Skipping rule for ${a} - no free ID found`);
        continue;
      }
      if (o.add(c), !n.has(c)) {
        const d = Po(a);
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
      const i = await Ja();
      i && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((l) => l.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", r.map((l) => ({
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e.find((d) => oi(d.domain) === l.id)?.domain
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
      const a = await chrome.declarativeNetRequest.getDynamicRules(), c = a.filter((l) => l.id >= B && l.id < B + xe), u = a.filter((l) => l.id >= Te && l.id < B);
      if (console.log(`[v0] DNR Verification: ${c.length} blacklist rules, ${u.length} pomodoro rules`), r.length > 0 && c.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), i) {
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", l), console.log("[DNR-DEBUG] Total rules count:", l.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: l.filter((d) => d.id >= Te && d.id < B).length,
          blacklist: l.filter((d) => d.id >= B && d.id < B + xe).length,
          other: l.filter((d) => d.id < Te || d.id >= B + xe).length
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
async function Go() {
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = [];
  return e.forEach((n, r) => {
    const o = ln(n.domain), s = Po(o), i = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(o)}`);
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
  }), $o(async () => {
    const r = (await chrome.declarativeNetRequest.getDynamicRules()).map((s) => s.id).filter(
      (s) => s >= Te && s < B || s >= Te + be && s < B + be
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
async function Ho() {
  return $o(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter(
      (n) => n >= Te && n < B || n >= Te + be && n < B + be
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
const oc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: Bo,
  cleanupAllDNRRules: nc,
  debugDNRStatus: Mg,
  disablePomodoroBlocking: Ho,
  enablePomodoroBlocking: Go,
  initializeBlocker: tc,
  removeFromBlacklist: rc
}, Symbol.toStringTag, { value: "Module" }));
function sc() {
  const e = "icons/icon48.png", t = chrome.runtime.getURL(e);
  return console.debug("[v0][Notifications] Icon URL resolved:", { iconPath: e, iconUrl: t }), t;
}
async function ic() {
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
async function ac() {
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
async function jn(e) {
  console.log("[v0][Notifications] Creating notification:", {
    notificationId: e.notificationId,
    title: e.title,
    type: e.type || "basic",
    iconUrl: e.iconUrl || "(will use default)"
  });
  try {
    console.debug("[v0][Notifications] Verifying notification permission...");
    const t = await ic();
    if (console.debug("[v0][Notifications] Permission check result:", { hasPermission: t }), !t)
      return console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: e.notificationId,
        title: e.title
      }), null;
    console.debug("[v0][Notifications] Checking notification settings...");
    const n = await ac();
    if (console.debug("[v0][Notifications] Notification setting result:", { notificationsEnabled: n }), !n)
      return console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: e.notificationId,
        title: e.title
      }), null;
    const r = e.iconUrl || sc(), o = {
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
const ur = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createNotification: jn,
  getNotificationIconUrl: sc,
  getNotificationSetting: ac,
  verifyNotificationPermission: ic
}, Symbol.toStringTag, { value: "Module" }));
async function Lg() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Pomodoro" },
    async (e) => {
      const t = (n, r) => {
        e && typeof e.setAttribute == "function" && e.setAttribute(n, r);
      };
      try {
        console.log("[v0] Initializing Pomodoro module"), N.logger.info("Pomodoro module initializing"), await xg(), chrome.alarms.onAlarm.addListener(async (n) => {
          n.name === z.POMODORO && await jo();
        }), N.logger.info("Pomodoro module initialized successfully"), t("success", !0);
      } catch (n) {
        throw N.logger.error("Failed to initialize Pomodoro module", { error: n }), t("success", !1), N.captureException(n), n;
      }
    }
  );
}
async function xg() {
  try {
    const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
    if (!e?.state || e.state.phase === "idle")
      return;
    const t = e.state, n = e.config || Ne;
    if (!t.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await cc();
      return;
    }
    const r = /* @__PURE__ */ new Date(), o = new Date(t.endsAt), s = Math.max(0, o.getTime() - r.getTime());
    if (s <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await jo();
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
    s < 6e4 ? await chrome.alarms.create(z.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(z.POMODORO, { delayInMinutes: a }), t.phase === "focus" && await Go(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${c} minutes remaining`);
  } catch (e) {
    console.error("[v0] Pomodoro recovery failed:", e);
  }
}
async function Ug(e) {
  const { [g.POMODORO_STATUS]: t } = await chrome.storage.local.get(g.POMODORO_STATUS), n = t?.config || Ne, r = {
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
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: r, state: i } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", r.focusMinutes), await chrome.alarms.create(z.POMODORO, { delayInMinutes: r.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await Go(), await F();
  try {
    await jn({
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
async function cc() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, n = e?.config || Ne;
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: n, state: t } }), await chrome.alarms.clear(z.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await Ho(), await F(), console.log("[v0] Pomodoro stopped");
}
async function $g() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || Ne;
  if (t.phase === "idle" || t.isPaused) return;
  const r = /* @__PURE__ */ new Date(), o = t.endsAt ? new Date(t.endsAt) : r, s = Math.max(0, o.getTime() - r.getTime()), i = {
    ...t,
    isPaused: !0,
    pausedAt: r.toISOString(),
    remainingMs: s,
    endsAt: void 0
    // Remove endsAt pois não há mais deadline
  };
  await chrome.alarms.clear(z.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await chrome.storage.local.set({
    [g.POMODORO_STATUS]: { config: n, state: i }
  }), await F(), console.log("[v0] Pomodoro paused:", i);
}
async function Bg() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || !e.state.isPaused) return;
  const t = e.state, n = e.config || Ne, r = /* @__PURE__ */ new Date(), o = t.remainingMs || 0;
  if (o <= 0) {
    await jo();
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
  await chrome.alarms.create(z.POMODORO, {
    delayInMinutes: Math.max(a, 0.1)
    // Min 6 segundos
  }), t.phase === "focus" && await chrome.alarms.create("pomodoro-keepalive", {
    delayInMinutes: 5,
    periodInMinutes: 5
  }), await F(), console.log("[v0] Pomodoro resumed:", i);
}
async function uc() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || e.state.phase !== "focus_complete") return;
  const t = e.state, n = e.config || Ne, r = t.pendingBreakType || "short", o = r === "long" ? n.longBreakMinutes : n.shortBreakMinutes, s = /* @__PURE__ */ new Date(), i = new Date(s.getTime() + o * 60 * 1e3), a = {
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
  }), await chrome.alarms.create(z.POMODORO, {
    delayInMinutes: o
  }), await Ho(), await F(), console.log("[v0] Break started:", a);
}
async function jo() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || Ne;
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
    }), await chrome.alarms.clear("pomodoro-keepalive"), await F();
    try {
      await jn({
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
    await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: n, state: r } }), await chrome.alarms.clear("pomodoro-keepalive"), await F();
    try {
      await jn({
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
async function Fg() {
  console.log("[v0] Initializing Firebase sync module");
  const { [g.SETTINGS]: e } = await chrome.storage.sync.get(g.SETTINGS);
  if (!e?.analyticsConsent) {
    console.log("[v0] Analytics consent not given, skipping Firebase sync");
    return;
  }
  await chrome.alarms.create(z.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === z.DAILY_SYNC && await Gg();
  });
}
async function Gg() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [g.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(g.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = e[t];
  if (!n) return;
  const r = Object.values(n).reduce((s, i) => s + i, 0), o = Object.entries(n).sort(([, s], [, i]) => i - s).slice(0, 5).map(([s, i]) => ({ domain: s, time: i }));
  console.log("[v0] Daily summary:", { totalTime: r, topSites: o });
}
const Hg = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function lc() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Lg(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await tc(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Blocker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await vg(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Usage Tracker:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await Tg(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Daily Sync:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await Dg(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Content Analyzer:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await Fg(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (e) {
    console.warn("[v0] Firebase sync skipped/failed:", e);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function jg() {
  try {
    const { verifyNotificationPermission: e, createNotification: t } = await Promise.resolve().then(() => ur);
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
async function si() {
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
function qg(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), zg(e);
}
async function zg(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await nc(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
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
        config: Ne,
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
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await si(), console.log("[v0] DEBUG: Requesting notification permissions..."), await jg(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await si()), console.log("[v0] DEBUG: Starting module initialization..."), await lc(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => oc);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => oc);
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
const Wg = (() => {
  try {
    const e = Hg;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t === "development" || n === "development" || e.VITE_SENTRY_TEST_EXPOSE === "true" || e.SENTRY_TEST_EXPOSE === "true") return !0;
    }
  } catch {
  }
  return !1;
})();
Wg && (globalThis.testSentryBackground = async () => {
  const { testSentryBackground: e } = await Promise.resolve().then(() => ai);
  await e();
}, globalThis.testSentryComprehensive = async () => {
  const { testSentryComprehensive: e } = await Promise.resolve().then(() => ai);
  await e("background");
});
function Yg() {
  return console.log("[v0] Extension started on browser startup"), lc();
}
function Kg() {
  chrome.runtime.onInstalled.addListener(qg), chrome.runtime.onStartup.addListener(Yg), chrome.storage.onChanged.addListener((e, t) => {
    console.log(`[v0] Storage changed in ${t}:`, e), F();
  }), chrome.runtime.onMessage.addListener((e, t, n) => {
    try {
      return console.log("[v0] Message received:", e?.type, e?.payload), console.log("[v0] DEBUG: Message sender:", t), console.log("[v0] DEBUG: Message ID:", e?.id), console.log("[v0] DEBUG: Message timestamp:", e?.ts), Promise.resolve(Pg(e, t)).then((r) => {
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
        n && (await Bo(n), console.log(`[v0] Added ${n} to blacklist from notification.`));
      } else e === "pomodoro-focus-complete" && t === 0 && (await uc(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Kg();
console.log("[v0] Service Worker loaded and listeners attached.");
const ii = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
let xt = null, Ut = null, $t = null, Bt = null;
async function dc() {
  xt !== null && (clearTimeout(xt), xt = null);
  const { Sentry: e } = await Promise.resolve().then(() => Ka);
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
    ), xt = setTimeout(() => {
      try {
        throw new Error("Sentry Test Error - Background Context");
      } catch (t) {
        e.captureException(t instanceof Error ? t : new Error(String(t))), console.log("[Sentry Test] Error captured");
      }
      xt = null;
    }, 100);
  } catch (t) {
    e.captureException(t instanceof Error ? t : new Error(String(t))), console.log("[Sentry Test] Error captured");
  }
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Dashboard: https://sentry.io/issues/");
}
async function fc() {
  Ut !== null && (clearTimeout(Ut), Ut = null);
  const { Sentry: e } = await Promise.resolve().then(() => Dc);
  console.log("[Sentry Test] Testing popup error tracking..."), e.startSpan(
    { op: "ui.click", name: "Popup Test Button Click" },
    (t) => {
      t.setAttribute("context", "popup"), t.setAttribute("test", !0), e.logger.info("Popup test log", {
        test: !0,
        ui_element: "test_button"
      }), Ut = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Popup Context");
        } catch (n) {
          e.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from popup");
        }
        Ut = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function pc() {
  $t !== null && (clearTimeout($t), $t = null);
  const { Sentry: e } = await Promise.resolve().then(() => kc);
  console.log("[Sentry Test] Testing options error tracking..."), e.startSpan(
    { op: "ui.settings", name: "Options Test Action" },
    (t) => {
      t.setAttribute("context", "options"), t.setAttribute("test", !0), e.logger.info("Options test log", {
        test: !0,
        settings_modified: !1
      }), $t = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Options Context");
        } catch (n) {
          e.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from options");
        }
        $t = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function mc() {
  Bt !== null && (clearTimeout(Bt), Bt = null);
  const { Sentry: e } = await Promise.resolve().then(() => Cc);
  console.log("[Sentry Test] Testing content script error tracking..."), e.startSpan(
    { op: "test", name: "Content Script Test" },
    (t) => {
      t.setAttribute("context", "content"), t.setAttribute("test", !0), Bt = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Content Script Context");
        } catch (n) {
          e.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from content script");
        }
        Bt = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Note: Content script tracking is minimal for privacy");
}
async function gc(e) {
  let t;
  switch (e) {
    case "background":
      t = (await Promise.resolve().then(() => Ka)).Sentry;
      break;
    case "popup":
      t = (await Promise.resolve().then(() => Dc)).Sentry;
      break;
    case "options":
      t = (await Promise.resolve().then(() => kc)).Sentry;
      break;
    case "content":
      t = (await Promise.resolve().then(() => Cc)).Sentry;
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
    const r = ii;
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
    const r = ii;
    r && (t = r.VITE_SENTRY_TEST_EXPOSE === "true" || // Also check without prefix for legacy support
    r.SENTRY_TEST_EXPOSE === "true");
  } catch {
  }
  (e || t) && (globalThis.testSentryBackground = dc, globalThis.testSentryPopup = fc, globalThis.testSentryOptions = pc, globalThis.testSentryContent = mc, globalThis.testSentryComprehensive = gc, console.log("[Sentry Test] Test functions exposed to globalThis (development mode)"));
}
const ai = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  testSentryBackground: dc,
  testSentryComprehensive: gc,
  testSentryContent: mc,
  testSentryOptions: pc,
  testSentryPopup: fc
}, Symbol.toStringTag, { value: "Module" }));
function Vg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var hc = { exports: {} }, lr = {}, _c = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fn = Symbol.for("react.element"), Jg = Symbol.for("react.portal"), Xg = Symbol.for("react.fragment"), Zg = Symbol.for("react.strict_mode"), Qg = Symbol.for("react.profiler"), eh = Symbol.for("react.provider"), th = Symbol.for("react.context"), nh = Symbol.for("react.forward_ref"), rh = Symbol.for("react.suspense"), oh = Symbol.for("react.memo"), sh = Symbol.for("react.lazy"), ci = Symbol.iterator;
function ih(e) {
  return e === null || typeof e != "object" ? null : (e = ci && e[ci] || e["@@iterator"], typeof e == "function" ? e : null);
}
var yc = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Sc = Object.assign, Ec = {};
function Mt(e, t, n) {
  this.props = e, this.context = t, this.refs = Ec, this.updater = n || yc;
}
Mt.prototype.isReactComponent = {};
Mt.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Mt.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Tc() {
}
Tc.prototype = Mt.prototype;
function qo(e, t, n) {
  this.props = e, this.context = t, this.refs = Ec, this.updater = n || yc;
}
var zo = qo.prototype = new Tc();
zo.constructor = qo;
Sc(zo, Mt.prototype);
zo.isPureReactComponent = !0;
var ui = Array.isArray, bc = Object.prototype.hasOwnProperty, Wo = { current: null }, vc = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ic(e, t, n) {
  var r, o = {}, s = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (s = "" + t.key), t) bc.call(t, r) && !vc.hasOwnProperty(r) && (o[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) o.children = n;
  else if (1 < a) {
    for (var c = Array(a), u = 0; u < a; u++) c[u] = arguments[u + 2];
    o.children = c;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) o[r] === void 0 && (o[r] = a[r]);
  return { $$typeof: fn, type: e, key: s, ref: i, props: o, _owner: Wo.current };
}
function ah(e, t) {
  return { $$typeof: fn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Yo(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fn;
}
function ch(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var li = /\/+/g;
function Or(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? ch("" + e.key) : t.toString(36);
}
function Nn(e, t, n, r, o) {
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
        case fn:
        case Jg:
          i = !0;
      }
  }
  if (i) return i = e, o = o(i), e = r === "" ? "." + Or(i, 0) : r, ui(o) ? (n = "", e != null && (n = e.replace(li, "$&/") + "/"), Nn(o, t, n, "", function(u) {
    return u;
  })) : o != null && (Yo(o) && (o = ah(o, n + (!o.key || i && i.key === o.key ? "" : ("" + o.key).replace(li, "$&/") + "/") + e)), t.push(o)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", ui(e)) for (var a = 0; a < e.length; a++) {
    s = e[a];
    var c = r + Or(s, a);
    i += Nn(s, t, n, c, o);
  }
  else if (c = ih(e), typeof c == "function") for (e = c.call(e), a = 0; !(s = e.next()).done; ) s = s.value, c = r + Or(s, a++), i += Nn(s, t, n, c, o);
  else if (s === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function En(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return Nn(e, r, "", "", function(s) {
    return t.call(n, s, o++);
  }), r;
}
function uh(e) {
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
var V = { current: null }, kn = { transition: null }, lh = { ReactCurrentDispatcher: V, ReactCurrentBatchConfig: kn, ReactCurrentOwner: Wo };
function Rc() {
  throw Error("act(...) is not supported in production builds of React.");
}
T.Children = { map: En, forEach: function(e, t, n) {
  En(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return En(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return En(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Yo(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
T.Component = Mt;
T.Fragment = Xg;
T.Profiler = Qg;
T.PureComponent = qo;
T.StrictMode = Zg;
T.Suspense = rh;
T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = lh;
T.act = Rc;
T.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Sc({}, e.props), o = e.key, s = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (s = t.ref, i = Wo.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (c in t) bc.call(t, c) && !vc.hasOwnProperty(c) && (r[c] = t[c] === void 0 && a !== void 0 ? a[c] : t[c]);
  }
  var c = arguments.length - 2;
  if (c === 1) r.children = n;
  else if (1 < c) {
    a = Array(c);
    for (var u = 0; u < c; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: fn, type: e.type, key: o, ref: s, props: r, _owner: i };
};
T.createContext = function(e) {
  return e = { $$typeof: th, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: eh, _context: e }, e.Consumer = e;
};
T.createElement = Ic;
T.createFactory = function(e) {
  var t = Ic.bind(null, e);
  return t.type = e, t;
};
T.createRef = function() {
  return { current: null };
};
T.forwardRef = function(e) {
  return { $$typeof: nh, render: e };
};
T.isValidElement = Yo;
T.lazy = function(e) {
  return { $$typeof: sh, _payload: { _status: -1, _result: e }, _init: uh };
};
T.memo = function(e, t) {
  return { $$typeof: oh, type: e, compare: t === void 0 ? null : t };
};
T.startTransition = function(e) {
  var t = kn.transition;
  kn.transition = {};
  try {
    e();
  } finally {
    kn.transition = t;
  }
};
T.unstable_act = Rc;
T.useCallback = function(e, t) {
  return V.current.useCallback(e, t);
};
T.useContext = function(e) {
  return V.current.useContext(e);
};
T.useDebugValue = function() {
};
T.useDeferredValue = function(e) {
  return V.current.useDeferredValue(e);
};
T.useEffect = function(e, t) {
  return V.current.useEffect(e, t);
};
T.useId = function() {
  return V.current.useId();
};
T.useImperativeHandle = function(e, t, n) {
  return V.current.useImperativeHandle(e, t, n);
};
T.useInsertionEffect = function(e, t) {
  return V.current.useInsertionEffect(e, t);
};
T.useLayoutEffect = function(e, t) {
  return V.current.useLayoutEffect(e, t);
};
T.useMemo = function(e, t) {
  return V.current.useMemo(e, t);
};
T.useReducer = function(e, t, n) {
  return V.current.useReducer(e, t, n);
};
T.useRef = function(e) {
  return V.current.useRef(e);
};
T.useState = function(e) {
  return V.current.useState(e);
};
T.useSyncExternalStore = function(e, t, n) {
  return V.current.useSyncExternalStore(e, t, n);
};
T.useTransition = function() {
  return V.current.useTransition();
};
T.version = "18.3.1";
_c.exports = T;
var wc = _c.exports;
const qn = /* @__PURE__ */ Vg(wc);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var dh = wc, fh = Symbol.for("react.element"), ph = Symbol.for("react.fragment"), mh = Object.prototype.hasOwnProperty, gh = dh.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, hh = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ac(e, t, n) {
  var r, o = {}, s = null, i = null;
  n !== void 0 && (s = "" + n), t.key !== void 0 && (s = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) mh.call(t, r) && !hh.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: fh, type: e, key: s, ref: i, props: o, _owner: gh.current };
}
lr.Fragment = ph;
lr.jsx = Ac;
lr.jsxs = Ac;
hc.exports = lr;
var Be = hc.exports;
let di = !1, Dr = null, Nr = null;
function _h() {
  if (di && Dr && Nr)
    return { client: Dr, scope: Nr };
  try {
    const e = pg(), t = sr({}), n = ir(t);
    try {
      const s = za();
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", s);
    }
    try {
      const s = To({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new er({
      dsn: Ya,
      transport: rr,
      stackParser: or,
      integrations: n,
      ...e
    }), o = new C();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), Dr = r, Nr = o, di = !0, console.log("[v0][Sentry] Popup monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in popup:", e), console.warn("[v0][Sentry] Popup will continue without Sentry monitoring"), { client: null, scope: new C() };
  }
}
const { client: Ue, scope: j } = _h();
let Oc = class extends qn.Component {
  constructor(t) {
    super(t), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(t, n) {
    Ue && j && (j.setContext("react", {
      componentStack: n.componentStack
    }), j.captureException(t));
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ Be.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ Be.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ Be.jsx("button", { onClick: () => this.setState({ hasError: !1, retryKey: this.state.retryKey + 1 }), children: "Try again" })
    ] }) : /* @__PURE__ */ Be.jsx(qn.Fragment, { children: this.props.children }, this.state.retryKey);
  }
};
const yh = {
  // ErrorBoundary component
  ErrorBoundary: Oc,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!j || !Ue))
      return j.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!j || !Ue))
      return j.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!j || !Ue))
        return Xn(e, t, { scope: j });
    },
    warn: (e, t) => {
      if (!(!j || !Ue))
        return Zn(e, t, { scope: j });
    },
    error: (e, t) => {
      if (!(!j || !Ue))
        return Qn(e, t, { scope: j });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !j || !Ue ? t(ar()) : nn({ ...e, scope: j }, t),
  // Get client (for advanced usage)
  getClient: () => Ue,
  // Get scope (for advanced usage)
  getScope: () => j
}, Dc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: Oc,
  Sentry: yh,
  scope: j
}, Symbol.toStringTag, { value: "Module" }));
let fi = !1, kr = null, Cr = null;
function Sh() {
  if (fi && kr && Cr)
    return { client: kr, scope: Cr };
  try {
    const e = mg(), t = sr({}), n = ir(t);
    try {
      const s = za();
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", s);
    }
    try {
      const s = To({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new er({
      dsn: Ya,
      transport: rr,
      stackParser: or,
      integrations: n,
      ...e
    }), o = new C();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), kr = r, Cr = o, fi = !0, console.log("[v0][Sentry] Options page monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in options page:", e), console.warn("[v0][Sentry] Options page will continue without Sentry monitoring"), { client: null, scope: new C() };
  }
}
const { client: $e, scope: q } = Sh();
class Nc extends qn.Component {
  constructor(t) {
    super(t), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(t, n) {
    $e && q && (q.setContext("react", {
      componentStack: n.componentStack
    }), q.captureException(t));
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ Be.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ Be.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ Be.jsx("button", { onClick: () => this.setState({ hasError: !1, retryKey: this.state.retryKey + 1 }), children: "Try again" })
    ] }) : /* @__PURE__ */ Be.jsx(qn.Fragment, { children: this.props.children }, this.state.retryKey);
  }
}
const Eh = {
  // ErrorBoundary component
  ErrorBoundary: Nc,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!q || !$e))
      return q.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!q || !$e))
      return q.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!q || !$e))
        return Xn(e, t, { scope: q });
    },
    warn: (e, t) => {
      if (!(!q || !$e))
        return Zn(e, t, { scope: q });
    },
    error: (e, t) => {
      if (!(!q || !$e))
        return Qn(e, t, { scope: q });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !q || !$e ? t(ar()) : nn({ ...e, scope: q }, t),
  // Get client (for advanced usage)
  getClient: () => $e,
  // Get scope (for advanced usage)
  getScope: () => q
}, kc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: Nc,
  Sentry: Eh,
  scope: q
}, Symbol.toStringTag, { value: "Module" })), Pr = "__V0_SENTRY_CONTENT_INITIALIZED";
let Ft = !1, nt = null, rt = null, Le = null;
async function Th(e = 3, t = 50) {
  for (let o = 0; o < e; o++) {
    if (Ft && nt && rt)
      return { client: nt, scope: rt };
    o < e - 1 && await new Promise((s) => setTimeout(s, t));
  }
  return It() === "development" && console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries"), { client: null, scope: new C() };
}
function bh() {
  return globalThis[Pr] === !0 ? Ft && nt && rt ? { client: nt, scope: rt } : (Le || (Le = Th(), Le.then((n) => {
    n.client && n.scope && (nt = n.client, rt = n.scope, Ft = !0), Le = null;
  }).catch(() => {
    Le = null;
  })), { client: null, scope: new C() }) : (globalThis[Pr] = !0, Le = vh().then(
    (t) => (nt = t.client, rt = t.scope, Ft = !0, Le = null, t),
    (t) => {
      throw globalThis[Pr] = !1, Ft = !1, nt = null, rt = null, Le = null, t;
    }
  ), { client: null, scope: new C() });
}
async function vh() {
  try {
    const e = gg(), t = sr({}), n = ir(t), r = new er({
      dsn: eo,
      transport: rr,
      stackParser: or,
      integrations: n,
      ...e
    }), o = new C();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([i, a]) => {
      o.setTag(i, a);
    }), r.init(), It() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return It() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", e), { client: null, scope: new C() };
  }
}
const { client: Qe, scope: X } = bh(), Ih = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!X || !Qe))
      return X.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!X || !Qe))
      return X.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!X || !Qe))
        return Xn(e, t, { scope: X });
    },
    warn: (e, t) => {
      if (!(!X || !Qe))
        return Zn(e, t, { scope: X });
    },
    error: (e, t) => {
      if (!(!X || !Qe))
        return Qn(e, t, { scope: X });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !X || !Qe ? t(ar()) : nn({ ...e, scope: X }, t),
  // Get client (for advanced usage)
  getClient: () => Qe,
  // Get scope (for advanced usage)
  getScope: () => X
}, Cc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: Ih,
  scope: X
}, Symbol.toStringTag, { value: "Module" }));
