const Lc = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = Lc;
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
function ft() {
  return Wn(v), v;
}
function Wn(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || ot, t[ot] = t[ot] || {};
}
function Rt(e, t, n = v) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[ot] = r[ot] || {};
  return o[e] || (o[e] = t());
}
const gi = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], xc = "Sentry Logger ", Pn = {};
function Xt(e) {
  if (!("console" in v))
    return e();
  const t = v.console, n = {}, r = Object.keys(Pn);
  r.forEach((o) => {
    const s = Pn[o];
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
function Uc() {
  io().enabled = !0;
}
function $c() {
  io().enabled = !1;
}
function hi() {
  return io().enabled;
}
function Bc(...e) {
  so("log", ...e);
}
function Fc(...e) {
  so("warn", ...e);
}
function Gc(...e) {
  so("error", ...e);
}
function so(e, ...t) {
  _ && hi() && Xt(() => {
    v.console[e](`${xc}[${e}]:`, ...t);
  });
}
function io() {
  return _ ? Rt("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const h = {
  /** Enable logging. */
  enable: Uc,
  /** Disable logging. */
  disable: $c,
  /** Check if logging is enabled. */
  isEnabled: hi,
  /** Log a message. */
  log: Bc,
  /** Log a warning. */
  warn: Fc,
  /** Log an error. */
  error: Gc
}, _i = 50, ct = "?", Zo = /\(error: (.*)\)/, Qo = /captureMessage|captureException/;
function Hc(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const s = [], i = n.split(`
`);
    for (let a = r; a < i.length; a++) {
      let c = i[a];
      c.length > 1024 && (c = c.slice(0, 1024));
      const u = Zo.test(c) ? c.replace(Zo, "$1") : c;
      if (!u.match(/\S*Error: /)) {
        for (const l of t) {
          const d = l(u);
          if (d) {
            s.push(d);
            break;
          }
        }
        if (s.length >= _i + o)
          break;
      }
    }
    return jc(s.slice(o));
  };
}
function jc(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(pn(t).function || "") && t.pop(), t.reverse(), Qo.test(pn(t).function || "") && (t.pop(), Qo.test(pn(t).function || "") && t.pop()), t.slice(0, _i).map((n) => ({
    ...n,
    filename: n.filename || pn(t).filename,
    function: n.function || ct
  }));
}
function pn(e) {
  return e[e.length - 1] || {};
}
const pr = "<anonymous>";
function Ie(e) {
  try {
    return !e || typeof e != "function" ? pr : e.name || pr;
  } catch {
    return pr;
  }
}
function es(e) {
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
const bn = {}, ts = {};
function qe(e, t) {
  bn[e] = bn[e] || [], bn[e].push(t);
}
function ze(e, t) {
  if (!ts[e]) {
    ts[e] = !0;
    try {
      t();
    } catch (n) {
      _ && h.error(`Error while instrumenting ${e}`, n);
    }
  }
}
function se(e, t) {
  const n = e && bn[e];
  if (n)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        _ && h.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${Ie(r)}
Error:`,
          o
        );
      }
}
let mr = null;
function yi(e) {
  const t = "error";
  qe(t, e), ze(t, qc);
}
function qc() {
  mr = v.onerror, v.onerror = function(e, t, n, r, o) {
    return se("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), mr ? mr.apply(this, arguments) : !1;
  }, v.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let gr = null;
function Si(e) {
  const t = "unhandledrejection";
  qe(t, e), ze(t, zc);
}
function zc() {
  gr = v.onunhandledrejection, v.onunhandledrejection = function(e) {
    return se("unhandledrejection", e), gr ? gr.apply(this, arguments) : !0;
  }, v.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const Ei = Object.prototype.toString;
function ao(e) {
  switch (Ei.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return Re(e, Error);
  }
}
function wt(e, t) {
  return Ei.call(e) === `[object ${t}]`;
}
function Ti(e) {
  return wt(e, "ErrorEvent");
}
function ns(e) {
  return wt(e, "DOMError");
}
function Wc(e) {
  return wt(e, "DOMException");
}
function be(e) {
  return wt(e, "String");
}
function Yn(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function ut(e) {
  return e === null || Yn(e) || typeof e != "object" && typeof e != "function";
}
function jt(e) {
  return wt(e, "Object");
}
function Vn(e) {
  return typeof Event < "u" && Re(e, Event);
}
function Yc(e) {
  return typeof Element < "u" && Re(e, Element);
}
function Vc(e) {
  return wt(e, "RegExp");
}
function At(e) {
  return !!(e?.then && typeof e.then == "function");
}
function Kc(e) {
  return jt(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function Re(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function bi(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function vi(e) {
  return typeof Request < "u" && Re(e, Request);
}
const co = v, Jc = 80;
function he(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let s = 0, i = 0;
    const a = " > ", c = a.length;
    let u;
    const l = Array.isArray(t) ? t : t.keyAttrs, d = !Array.isArray(t) && t.maxStringLength || Jc;
    for (; n && s++ < r && (u = Xc(n, l), !(u === "html" || s > 1 && i + o.length * c + u.length >= d)); )
      o.push(u), i += u.length, n = n.parentNode;
    return o.reverse().join(a);
  } catch {
    return "<unknown>";
  }
}
function Xc(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if (co.HTMLElement && n instanceof HTMLElement && n.dataset) {
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
    if (i && be(i)) {
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
    return co.document.location.href;
  } catch {
    return "";
  }
}
function Ii(e) {
  if (!co.HTMLElement)
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
function Mn(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function rs(e, t) {
  if (!Array.isArray(e))
    return "";
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    try {
      bi(o) ? n.push("[VueViewModel]") : n.push(String(o));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(t);
}
function vn(e, t, n = !1) {
  return be(e) ? Vc(t) ? t.test(e) : be(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function Ge(e, t = [], n = !1) {
  return t.some((r) => vn(e, r, n));
}
function te(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && Ri(o, r);
  try {
    e[t] = o;
  } catch {
    _ && h.log(`Failed to replace method "${t}" in object`, e);
  }
}
function ne(e, t, n) {
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
function Ri(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, ne(e, "__sentry_original__", t);
  } catch {
  }
}
function uo(e) {
  return e.__sentry_original__;
}
function wi(e) {
  if (ao(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...ss(e)
    };
  if (Vn(e)) {
    const t = {
      type: e.type,
      target: os(e.target),
      currentTarget: os(e.currentTarget),
      ...ss(e)
    };
    return typeof CustomEvent < "u" && Re(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function os(e) {
  try {
    return Yc(e) ? he(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function ss(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function Zc(e, t = 40) {
  const n = Object.keys(wi(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return Mn(r, t);
  for (let o = n.length; o > 0; o--) {
    const s = n.slice(0, o).join(", ");
    if (!(s.length > t))
      return o === n.length ? s : Mn(s, t);
  }
  return "";
}
function Qc() {
  const e = v;
  return e.crypto || e.msCrypto;
}
let hr;
function eu() {
  return Math.random() * 16;
}
function ie(e = Qc()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return hr || (hr = "10000000100040008000" + 1e11), hr.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (eu() & 15) >> t / 4).toString(16)
    )
  );
}
function Ai(e) {
  return e.exception?.values?.[0];
}
function nt(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = Ai(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function xr(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], s = o[0] = o[0] || {};
  s.value || (s.value = t || ""), s.type || (s.type = "Error");
}
function St(e, t) {
  const n = Ai(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const s = { ...o?.data, ...t.data };
    n.mechanism.data = s;
  }
}
function is(e) {
  if (tu(e))
    return !0;
  try {
    ne(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function tu(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const Oi = 1e3;
function pt() {
  return Date.now() / Oi;
}
function nu() {
  const { performance: e } = v;
  if (!e?.now || !e.timeOrigin)
    return pt;
  const t = e.timeOrigin;
  return () => (t + e.now()) / Oi;
}
let as;
function U() {
  return (as ?? (as = nu()))();
}
let _r;
function ru() {
  const { performance: e } = v;
  if (!e?.now)
    return [void 0, "none"];
  const t = 3600 * 1e3, n = e.now(), r = Date.now(), o = e.timeOrigin ? Math.abs(e.timeOrigin + n - r) : t, s = o < t, i = e.timing?.navigationStart, c = typeof i == "number" ? Math.abs(i + n - r) : t, u = c < t;
  return s || u ? o <= c ? [e.timeOrigin, "timeOrigin"] : [i, "navigationStart"] : [r, "dateNow"];
}
function re() {
  return _r || (_r = ru()), _r[0];
}
function ou(e) {
  const t = U(), n = {
    sid: ie(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => iu(n)
  };
  return e && Et(n, e), n;
}
function Et(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || U(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : ie()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function su(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), Et(e, n);
}
function iu(e) {
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
function we() {
  return ie();
}
function ve() {
  return ie().substring(16);
}
const Ur = "_sentrySpan";
function Tt(e, t) {
  t ? ne(e, Ur, t) : delete e[Ur];
}
function qt(e) {
  return e[Ur];
}
const au = 100;
class k {
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
      traceId: we(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const t = new k();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, Tt(t, qt(this)), t;
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
    }, this._session && Et(this._session, { user: t }), this._notifyScopeListeners(), this;
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
    const n = typeof t == "function" ? t(this) : t, r = n instanceof k ? n.getScopeData() : jt(n) ? t : void 0, { tags: o, extra: s, user: i, contexts: a, level: c, fingerprint: u = [], propagationContext: l } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...s }, this._contexts = { ...this._contexts, ...a }, i && Object.keys(i).length && (this._user = i), c && (this._level = c), u.length && (this._fingerprint = u), l && (this._propagationContext = l), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, Tt(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: we(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : au;
    if (r <= 0)
      return this;
    const o = {
      timestamp: pt(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? Mn(t.message, 2048) : t.message
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
    const r = n?.event_id || ie();
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
    const o = r?.event_id || ie();
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
    const r = n?.event_id || ie();
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
function cu() {
  return Rt("defaultCurrentScope", () => new k());
}
function uu() {
  return Rt("defaultIsolationScope", () => new k());
}
class lu {
  constructor(t, n) {
    let r;
    t ? r = t : r = new k();
    let o;
    n ? o = n : o = new k(), this._stack = [{ scope: r }], this._isolationScope = o;
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
function bt() {
  const e = ft(), t = Wn(e);
  return t.stack = t.stack || new lu(cu(), uu());
}
function du(e) {
  return bt().withScope(e);
}
function fu(e, t) {
  const n = bt();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function cs(e) {
  return bt().withScope(() => e(bt().getIsolationScope()));
}
function pu() {
  return {
    withIsolationScope: cs,
    withScope: du,
    withSetScope: fu,
    withSetIsolationScope: (e, t) => cs(t),
    getCurrentScope: () => bt().getScope(),
    getIsolationScope: () => bt().getIsolationScope()
  };
}
function Ot(e) {
  const t = Wn(e);
  return t.acs ? t.acs : pu();
}
function D() {
  const e = ft();
  return Ot(e).getCurrentScope();
}
function We() {
  const e = ft();
  return Ot(e).getIsolationScope();
}
function Di() {
  return Rt("globalScope", () => new k());
}
function Qt(...e) {
  const t = ft(), n = Ot(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function w() {
  return D().getClient();
}
function Ni(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, s = {
    trace_id: n,
    span_id: o || ve()
  };
  return r && (s.parent_span_id = r), s;
}
const ge = "sentry.source", lo = "sentry.sample_rate", ki = "sentry.previous_trace_sample_rate", Ae = "sentry.op", P = "sentry.origin", zt = "sentry.idle_span_finish_reason", en = "sentry.measurement_unit", tn = "sentry.measurement_value", us = "sentry.custom_span_name", fo = "sentry.profile_id", Dt = "sentry.exclusive_time", mu = "sentry.link.type", gu = 0, Ci = 1, x = 2;
function hu(e) {
  if (e < 400 && e >= 100)
    return { code: Ci };
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
function Pi(e, t) {
  e.setAttribute("http.response.status_code", t);
  const n = hu(t);
  n.message !== "unknown_error" && e.setStatus(n);
}
const Mi = "_sentryScope", Li = "_sentryIsolationScope";
function _u(e) {
  try {
    const t = v.WeakRef;
    if (typeof t == "function")
      return new t(e);
  } catch {
  }
  return e;
}
function yu(e) {
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
function Su(e, t, n) {
  e && (ne(e, Li, _u(n)), ne(e, Mi, t));
}
function Ln(e) {
  const t = e;
  return {
    scope: t[Mi],
    isolationScope: yu(t[Li])
  };
}
const po = "sentry-", Eu = /^sentry-/, Tu = 8192;
function xi(e) {
  const t = vu(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, s]) => {
    if (o.match(Eu)) {
      const i = o.slice(po.length);
      r[i] = s;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function bu(e) {
  if (!e)
    return;
  const t = Object.entries(e).reduce(
    (n, [r, o]) => (o && (n[`${po}${r}`] = o), n),
    {}
  );
  return Iu(t);
}
function vu(e) {
  if (!(!e || !be(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = ls(n);
      return Object.entries(r).forEach(([o, s]) => {
        t[o] = s;
      }), t;
    }, {}) : ls(e);
}
function ls(e) {
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
function Iu(e) {
  if (Object.keys(e).length !== 0)
    return Object.entries(e).reduce((t, [n, r], o) => {
      const s = `${encodeURIComponent(n)}=${encodeURIComponent(r)}`, i = o === 0 ? s : `${t},${s}`;
      return i.length > Tu ? (_ && h.warn(
        `Not adding key: ${n} with val: ${r} to baggage header due to exceeding baggage size limits.`
      ), t) : i;
    }, "");
}
const Ru = /^o(\d+)\./, wu = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Au(e) {
  return e === "http" || e === "https";
}
function Nt(e, t = !1) {
  const { host: n, path: r, pass: o, port: s, projectId: i, protocol: a, publicKey: c } = e;
  return `${a}://${c}${t && o ? `:${o}` : ""}@${n}${s ? `:${s}` : ""}/${r && `${r}/`}${i}`;
}
function Ou(e) {
  const t = wu.exec(e);
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
  return Ui({ host: s, pass: o, path: c, projectId: u, port: i, protocol: n, publicKey: r });
}
function Ui(e) {
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
function Du(e) {
  if (!_)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((i) => e[i] ? !1 : (h.error(`Invalid Sentry Dsn: ${i} missing`), !0)) ? !1 : n.match(/^\d+$/) ? Au(r) ? t && isNaN(parseInt(t, 10)) ? (h.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (h.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (h.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Nu(e) {
  return e.match(Ru)?.[1];
}
function ku(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = Nu(n)), r;
}
function Cu(e) {
  const t = typeof e == "string" ? Ou(e) : Ui(e);
  if (!(!t || !Du(t)))
    return t;
}
function Wt(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const $i = new RegExp(
  "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
  // whitespace
);
function Pu(e) {
  if (!e)
    return;
  const t = e.match($i);
  if (!t)
    return;
  let n;
  return t[3] === "1" ? n = !0 : t[3] === "0" && (n = !1), {
    traceId: t[1],
    parentSampled: n,
    parentSpanId: t[2]
  };
}
function Mu(e, t) {
  const n = Pu(e), r = xi(t);
  if (!n?.traceId)
    return {
      traceId: we(),
      sampleRand: Math.random()
    };
  const o = Lu(n, r);
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
function Bi(e = we(), t = ve(), n) {
  let r = "";
  return n !== void 0 && (r = n ? "-1" : "-0"), `${e}-${t}${r}`;
}
function Fi(e = we(), t = ve(), n) {
  return `00-${e}-${t}-${n ? "01" : "00"}`;
}
function Lu(e, t) {
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
const Gi = 0, mo = 1;
let ds = !1;
function xu(e) {
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
function Hi(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : R(e).parent_span_id, s = Ln(e).scope, i = r ? s?.getPropagationContext().propagationSpanId || ve() : t;
  return {
    parent_span_id: o,
    span_id: i,
    trace_id: n
  };
}
function Uu(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = Ye(e);
  return Bi(t, n, r);
}
function $u(e) {
  const { traceId: t, spanId: n } = e.spanContext(), r = Ye(e);
  return Fi(t, n, r);
}
function ji(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: s }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === mo,
      attributes: s,
      ...o
    }));
}
function st(e) {
  return typeof e == "number" ? fs(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? fs(e.getTime()) : U();
}
function fs(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function R(e) {
  if (Fu(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if (Bu(e)) {
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
      status: qi(a),
      op: r[Ae],
      origin: r[P],
      links: ji(c)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function Bu(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function Fu(e) {
  return typeof e.getSpanJSON == "function";
}
function Ye(e) {
  const { traceFlags: t } = e.spanContext();
  return t === mo;
}
function qi(e) {
  if (!(!e || e.code === gu))
    return e.code === Ci ? "ok" : e.message || "unknown_error";
}
const it = "_sentryChildSpans", $r = "_sentryRootSpan";
function zi(e, t) {
  const n = e[$r] || e;
  ne(t, $r, n), e[it] ? e[it].add(t) : ne(e, it, /* @__PURE__ */ new Set([t]));
}
function Gu(e, t) {
  e[it] && e[it].delete(t);
}
function In(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    if (!t.has(r) && Ye(r)) {
      t.add(r);
      const o = r[it] ? Array.from(r[it]) : [];
      for (const s of o)
        n(s);
    }
  }
  return n(e), Array.from(t);
}
function V(e) {
  return e[$r] || e;
}
function Z() {
  const e = ft(), t = Ot(e);
  return t.getActiveSpan ? t.getActiveSpan() : qt(D());
}
function Br() {
  ds || (Xt(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), ds = !0);
}
let ps = !1;
function Hu() {
  if (ps)
    return;
  function e() {
    const t = Z(), n = t && V(t);
    if (n) {
      const r = "internal_error";
      _ && h.log(`[Tracing] Root span: ${r} -> Global error occurred`), n.setStatus({ code: x, message: r });
    }
  }
  e.tag = "sentry_tracingErrorCallback", ps = !0, yi(e), Si(e);
}
function le(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = e || w()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function ms(e) {
  h.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function xn(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (qu(n)) {
      if (vn(e.description, n))
        return _ && ms(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? vn(e.description, n.name) : !0, o = n.op ? e.op && vn(e.op, n.op) : !0;
    if (r && o)
      return _ && ms(e), !0;
  }
  return !1;
}
function ju(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function qu(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const go = "production", Wi = "_frozenDsc";
function Rn(e, t) {
  ne(e, Wi, t);
}
function Yi(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || go,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: ku(t)
  };
  return t.emit("createDsc", o), o;
}
function ho(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || Yi(n.traceId, e);
}
function Oe(e) {
  const t = w();
  if (!t)
    return {};
  const n = V(e), r = R(n), o = r.data, s = n.spanContext().traceState, i = s?.get("sentry.sample_rate") ?? o[lo] ?? o[ki];
  function a(p) {
    return (typeof i == "number" || typeof i == "string") && (p.sample_rate = `${i}`), p;
  }
  const c = n[Wi];
  if (c)
    return a(c);
  const u = s?.get("sentry.dsc"), l = u && xi(u);
  if (l)
    return a(l);
  const d = Yi(e.spanContext().traceId, t), m = o[ge], f = r.description;
  return m !== "url" && f && (d.transaction = f), le() && (d.sampled = String(Ye(n)), d.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  s?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  Ln(n).scope?.getPropagationContext().sampleRand.toString()), a(d), t.emit("createDsc", d, n), d;
}
class He {
  constructor(t = {}) {
    this._traceId = t.traceId || we(), this._spanId = t.spanId || ve();
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: Gi
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
function pe(e, t = 100, n = 1 / 0) {
  try {
    return Fr("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function Vi(e, t = 3, n = 100 * 1024) {
  const r = pe(e, t);
  return Vu(r) > n ? Vi(e, t - 1, n) : r;
}
function Fr(e, t, n = 1 / 0, r = 1 / 0, o = Ku()) {
  const [s, i] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const a = zu(e, t);
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
      return Fr("", f, c - 1, r, o);
    } catch {
    }
  const l = Array.isArray(t) ? [] : {};
  let d = 0;
  const m = wi(t);
  for (const f in m) {
    if (!Object.prototype.hasOwnProperty.call(m, f))
      continue;
    if (d >= r) {
      l[f] = "[MaxProperties ~]";
      break;
    }
    const p = m[f];
    l[f] = Fr(f, p, c - 1, r, o), d++;
  }
  return i(t), l;
}
function zu(e, t) {
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
    if (bi(t))
      return "[VueViewModel]";
    if (Kc(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${Ie(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = Wu(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function Wu(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function Yu(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function Vu(e) {
  return Yu(JSON.stringify(e));
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
function mt(e, t = []) {
  return [e, t];
}
function Ju(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function gs(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function Gr(e) {
  const t = Wn(v);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function Xu(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(s) {
    typeof r == "string" ? r = typeof s == "string" ? r + s : [Gr(r), s] : r.push(typeof s == "string" ? Gr(s) : s);
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
        c = JSON.stringify(pe(a));
      }
      o(c);
    }
  }
  return typeof r == "string" ? r : Zu(r);
}
function Zu(e) {
  const t = e.reduce((o, s) => o + s.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function Qu(e) {
  return [{
    type: "span"
  }, e];
}
function el(e) {
  const t = typeof e.data == "string" ? Gr(e.data) : e.data;
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
const tl = {
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
function hs(e) {
  return tl[e];
}
function Ki(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function nl(e, t, n, r) {
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
function rl(e, t) {
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
function ol(e, t, n, r) {
  const o = Ki(n), s = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: Nt(t) }
  }, i = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return mt(s, [i]);
}
function sl(e, t, n, r) {
  const o = Ki(n), s = e.type && e.type !== "replay_event" ? e.type : "event";
  rl(e, n?.sdk);
  const i = nl(e, o, r, t);
  return delete e.sdkProcessingMetadata, mt(i, [[{ type: s }, e]]);
}
function il(e, t) {
  function n(f) {
    return !!f.trace_id && !!f.public_key;
  }
  const r = Oe(e[0]), o = t?.getDsn(), s = t?.getOptions().tunnel, i = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...n(r) && { trace: r },
    ...!!s && o && { dsn: Nt(o) }
  }, { beforeSendSpan: a, ignoreSpans: c } = t?.getOptions() || {}, u = c?.length ? e.filter((f) => !xn(R(f), c)) : e, l = e.length - u.length;
  l && t?.recordDroppedEvent("before_send", "span", l);
  const d = a ? (f) => {
    const p = R(f), S = a(p);
    return S || (Br(), p);
  } : R, m = [];
  for (const f of u) {
    const p = d(f);
    p && m.push(Qu(p));
  }
  return mt(i, m);
}
function al(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >", parent_span_id: r } = R(e), { spanId: o } = e.spanContext(), s = Ye(e), i = V(e), a = i === e, c = `[Tracing] Starting ${s ? "sampled" : "unsampled"} ${a ? "root " : ""}span`, u = [`op: ${n}`, `name: ${t}`, `ID: ${o}`];
  if (r && u.push(`parent ID: ${r}`), !a) {
    const { op: l, description: d } = R(i);
    u.push(`root ID: ${i.spanContext().spanId}`), l && u.push(`root op: ${l}`), d && u.push(`root description: ${d}`);
  }
  h.log(`${c}
  ${u.join(`
  `)}`);
}
function cl(e) {
  if (!_) return;
  const { description: t = "< unknown name >", op: n = "< unknown op >" } = R(e), { spanId: r } = e.spanContext(), s = V(e) === e, i = `[Tracing] Finishing "${n}" ${s ? "root " : ""}span "${t}" with ID ${r}`;
  h.log(i);
}
function ul(e, t, n, r = Z()) {
  const o = r && V(r);
  o && (_ && h.log(`[Measurement] Setting measurement on root span: ${e} = ${t} ${n}`), o.addEvent(e, {
    [tn]: t,
    [en]: n
  }));
}
function _s(e) {
  if (!e || e.length === 0)
    return;
  const t = {};
  return e.forEach((n) => {
    const r = n.attributes || {}, o = r[en], s = r[tn];
    typeof o == "string" && typeof s == "number" && (t[n.name] = { value: s, unit: o });
  }), t;
}
const ys = 1e3;
class Jn {
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
    this._traceId = t.traceId || we(), this._spanId = t.spanId || ve(), this._startTime = t.startTimestamp || U(), this._links = t.links, this._attributes = {}, this.setAttributes({
      [P]: "manual",
      [Ae]: t.op,
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
      traceFlags: r ? mo : Gi
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
    return this._name = t, this.setAttribute(ge, "custom"), this;
  }
  /** @inheritdoc */
  end(t) {
    this._endTime || (this._endTime = st(t), cl(this), this._onSpanEnded());
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
      op: this._attributes[Ae],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: qi(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[P],
      profile_id: this._attributes[fo],
      exclusive_time: this._attributes[Dt],
      measurements: _s(this._events),
      is_segment: this._isStandaloneSpan && V(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? V(this).spanContext().spanId : void 0,
      links: ji(this._links)
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
    const o = Ss(n) ? n : r || U(), s = Ss(n) ? {} : n || {}, i = {
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
    if (t && t.emit("spanEnd", this), !(this._isStandaloneSpan || this === V(this)))
      return;
    if (this._isStandaloneSpan) {
      this._sampled ? dl(il([this], t)) : (_ && h.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled."), t && t.recordDroppedEvent("sample_rate", "span"));
      return;
    }
    const r = this._convertSpanToTransaction();
    r && (Ln(this).scope || D()).captureEvent(r);
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!Es(R(this)))
      return;
    this._name || (_ && h.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), this._name = "<unlabeled transaction>");
    const { scope: t, isolationScope: n } = Ln(this), r = t?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
    if (this._sampled !== !0)
      return;
    const s = In(this).filter((l) => l !== this && !ll(l)).map((l) => R(l)).filter(Es), i = this._attributes[ge];
    delete this._attributes[us], s.forEach((l) => {
      delete l.data[us];
    });
    const a = {
      contexts: {
        trace: xu(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        s.length > ys ? s.sort((l, d) => l.start_timestamp - d.start_timestamp).slice(0, ys) : s
      ),
      start_timestamp: this._startTime,
      timestamp: this._endTime,
      transaction: this._name,
      type: "transaction",
      sdkProcessingMetadata: {
        capturedSpanScope: t,
        capturedSpanIsolationScope: n,
        dynamicSamplingContext: Oe(this)
      },
      request: r,
      ...i && {
        transaction_info: {
          source: i
        }
      }
    }, c = _s(this._events);
    return c && Object.keys(c).length && (_ && h.log(
      "[Measurements] Adding measurements to transaction event",
      JSON.stringify(c, void 0, 2)
    ), a.measurements = c), a;
  }
}
function Ss(e) {
  return e && typeof e == "number" || e instanceof Date || Array.isArray(e);
}
function Es(e) {
  return !!e.start_timestamp && !!e.timestamp && !!e.span_id && !!e.trace_id;
}
function ll(e) {
  return e instanceof Jn && e.isStandaloneSpan();
}
function dl(e) {
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
function fl(e, t, n = () => {
}, r = () => {
}) {
  let o;
  try {
    o = e();
  } catch (s) {
    throw t(s), n(), s;
  }
  return pl(o, t, n, r);
}
function pl(e, t, n, r) {
  return At(e) ? e.then(
    (o) => (n(), r(o), o),
    (o) => {
      throw t(o), n(), o;
    }
  ) : (n(), r(e), e);
}
function ml(e, t, n) {
  if (!le(e))
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
const Ji = "__SENTRY_SUPPRESS_TRACING__";
function nn(e, t) {
  const n = yo();
  if (n.startSpan)
    return n.startSpan(e, t);
  const r = Zi(e), { forceTransaction: o, parentSpan: s, scope: i } = e, a = i?.clone();
  return Qt(a, () => hl(s)(() => {
    const u = D(), l = Qi(u, s), m = e.onlyIfParent && !l ? new He() : Xi({
      parentSpan: l,
      spanArguments: r,
      forceTransaction: o,
      scope: u
    });
    return Tt(u, m), fl(
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
  const t = yo();
  if (t.startInactiveSpan)
    return t.startInactiveSpan(e);
  const n = Zi(e), { forceTransaction: r, parentSpan: o } = e;
  return (e.scope ? (i) => Qt(e.scope, i) : o !== void 0 ? (i) => _o(o, i) : (i) => i())(() => {
    const i = D(), a = Qi(i, o);
    return e.onlyIfParent && !a ? new He() : Xi({
      parentSpan: a,
      spanArguments: n,
      forceTransaction: r,
      scope: i
    });
  });
}
function _o(e, t) {
  const n = yo();
  return n.withActiveSpan ? n.withActiveSpan(e, t) : Qt((r) => (Tt(r, e || void 0), t(r)));
}
function Xi({
  parentSpan: e,
  spanArguments: t,
  forceTransaction: n,
  scope: r
}) {
  if (!le()) {
    const i = new He();
    if (n || !e) {
      const a = {
        sampled: "false",
        sample_rate: "0",
        transaction: t.name,
        ...Oe(i)
      };
      Rn(i, a);
    }
    return i;
  }
  const o = We();
  let s;
  if (e && !n)
    s = gl(e, r, t), zi(e, s);
  else if (e) {
    const i = Oe(e), { traceId: a, spanId: c } = e.spanContext(), u = Ye(e);
    s = Ts(
      {
        traceId: a,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), Rn(s, i);
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
    s = Ts(
      {
        traceId: i,
        parentSpanId: c,
        ...t
      },
      r,
      u
    ), a && Rn(s, a);
  }
  return al(s), Su(s, r, o), s;
}
function Zi(e) {
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
function yo() {
  const e = ft();
  return Ot(e);
}
function Ts(e, t, n) {
  const r = w(), o = r?.getOptions() || {}, { name: s = "" } = e, i = { spanAttributes: { ...e.attributes }, spanName: s, parentSampled: n };
  r?.emit("beforeSampling", i, { decision: !1 });
  const a = i.parentSampled ?? n, c = i.spanAttributes, u = t.getPropagationContext(), [l, d, m] = t.getScopeData().sdkProcessingMetadata[Ji] ? [!1] : ml(
    o,
    {
      name: s,
      parentSampled: a,
      attributes: c,
      parentSampleRate: Wt(u.dsc?.sample_rate)
    },
    u.sampleRand
  ), f = new Jn({
    ...e,
    attributes: {
      [ge]: "custom",
      [lo]: d !== void 0 && m ? d : void 0,
      ...c
    },
    sampled: l
  });
  return !l && r && (_ && h.log("[Tracing] Discarding root span because its trace was not chosen to be sampled."), r.recordDroppedEvent("sample_rate", "transaction")), r && r.emit("spanStart", f), f;
}
function gl(e, t, n) {
  const { spanId: r, traceId: o } = e.spanContext(), s = t.getScopeData().sdkProcessingMetadata[Ji] ? !1 : Ye(e), i = s ? new Jn({
    ...n,
    parentSpanId: r,
    traceId: o,
    sampled: s
  }) : new He({ traceId: o });
  zi(e, i);
  const a = w();
  return a && (a.emit("spanStart", i), n.endTimestamp && a.emit("spanEnd", i)), i;
}
function Qi(e, t) {
  if (t)
    return t;
  if (t === null)
    return;
  const n = qt(e);
  if (!n)
    return;
  const r = w();
  return (r ? r.getOptions() : {}).parentSpanIsAlwaysRootSpan ? V(n) : n;
}
function hl(e) {
  return e !== void 0 ? (t) => _o(e, t) : (t) => t();
}
const wn = {
  idleTimeout: 1e3,
  finalTimeout: 3e4,
  childSpanTimeout: 15e3
}, _l = "heartbeatFailed", yl = "idleTimeout", Sl = "finalTimeout", El = "externalFinish";
function ea(e, t = {}) {
  const n = /* @__PURE__ */ new Map();
  let r = !1, o, s = El, i = !t.disableAutoFinish;
  const a = [], {
    idleTimeout: c = wn.idleTimeout,
    finalTimeout: u = wn.finalTimeout,
    childSpanTimeout: l = wn.childSpanTimeout,
    beforeSpanEnd: d,
    trimIdleSpanEndTimestamp: m = !0
  } = t, f = w();
  if (!f || !le()) {
    const b = new He(), M = {
      sample_rate: "0",
      sampled: "false",
      ...Oe(b)
    };
    return Rn(b, M), b;
  }
  const p = D(), S = Z(), y = Tl(e);
  y.end = new Proxy(y.end, {
    apply(b, M, ke) {
      if (d && d(y), M instanceof He)
        return;
      const [_e, ...Y] = ke, ye = _e || U(), L = st(ye), Ke = In(y).filter((I) => I !== y), Je = R(y);
      if (!Ke.length || !m)
        return ht(L), Reflect.apply(b, M, [L, ...Y]);
      const ae = f.getOptions().ignoreSpans, Ce = Ke?.reduce((I, Q) => {
        const ee = R(Q);
        return !ee.timestamp || ae && xn(ee, ae) ? I : I ? Math.max(I, ee.timestamp) : ee.timestamp;
      }, void 0), O = Je.start_timestamp, H = Math.min(
        O ? O + u / 1e3 : 1 / 0,
        Math.max(O || -1 / 0, Math.min(L, Ce || 1 / 0))
      );
      return ht(H), Reflect.apply(b, M, [H, ...Y]);
    }
  });
  function G() {
    o && (clearTimeout(o), o = void 0);
  }
  function W(b) {
    G(), o = setTimeout(() => {
      !r && n.size === 0 && i && (s = yl, y.end(b));
    }, c);
  }
  function Ne(b) {
    o = setTimeout(() => {
      !r && i && (s = _l, y.end(b));
    }, l);
  }
  function Ve(b) {
    G(), n.set(b, !0);
    const M = U();
    Ne(M + l / 1e3);
  }
  function gt(b) {
    if (n.has(b) && n.delete(b), n.size === 0) {
      const M = U();
      W(M + c / 1e3);
    }
  }
  function ht(b) {
    r = !0, n.clear(), a.forEach((L) => L()), Tt(p, S);
    const M = R(y), { start_timestamp: ke } = M;
    if (!ke)
      return;
    M.data[zt] || y.setAttribute(zt, s), h.log(`[Tracing] Idle span "${M.op}" finished`);
    const Y = In(y).filter((L) => L !== y);
    let ye = 0;
    Y.forEach((L) => {
      L.isRecording() && (L.setStatus({ code: x, message: "cancelled" }), L.end(b), _ && h.log("[Tracing] Cancelling span since span ended early", JSON.stringify(L, void 0, 2)));
      const Ke = R(L), { timestamp: Je = 0, start_timestamp: ae = 0 } = Ke, Ce = ae <= b, O = (u + c) / 1e3, H = Je - ae <= O;
      if (_) {
        const I = JSON.stringify(L, void 0, 2);
        Ce ? H || h.log("[Tracing] Discarding span since it finished after idle span final timeout", I) : h.log("[Tracing] Discarding span since it happened after idle span was finished", I);
      }
      (!H || !Ce) && (Gu(y, L), ye++);
    }), ye > 0 && y.setAttribute("sentry.idle_span_discarded_spans", ye);
  }
  return a.push(
    f.on("spanStart", (b) => {
      if (r || b === y || R(b).timestamp || b instanceof Jn && b.isStandaloneSpan())
        return;
      In(y).includes(b) && Ve(b.spanContext().spanId);
    })
  ), a.push(
    f.on("spanEnd", (b) => {
      r || gt(b.spanContext().spanId);
    })
  ), a.push(
    f.on("idleSpanEnableAutoFinish", (b) => {
      b === y && (i = !0, W(), n.size && Ne());
    })
  ), t.disableAutoFinish || W(), setTimeout(() => {
    r || (y.setStatus({ code: x, message: "deadline_exceeded" }), s = Sl, y.end());
  }, u), y;
}
function Tl(e) {
  const t = kt(e);
  return Tt(D(), t), _ && h.log("[Tracing] Started span is an idle span"), t;
}
const yr = 0, bs = 1, vs = 2;
function Xn(e) {
  return new Yt((t) => {
    t(e);
  });
}
function So(e) {
  return new Yt((t, n) => {
    n(e);
  });
}
class Yt {
  constructor(t) {
    this._state = yr, this._handlers = [], this._runExecutor(t);
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
    if (this._state === yr)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === bs && n[1](this._value), this._state === vs && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (s, i) => {
      if (this._state === yr) {
        if (At(i)) {
          i.then(r, o);
          return;
        }
        this._state = s, this._value = i, this._executeHandlers();
      }
    }, r = (s) => {
      n(bs, s);
    }, o = (s) => {
      n(vs, s);
    };
    try {
      t(r, o);
    } catch (s) {
      o(s);
    }
  }
}
function bl(e, t, n, r = 0) {
  try {
    const o = Hr(t, n, e, r);
    return At(o) ? o : Xn(o);
  } catch (o) {
    return So(o);
  }
}
function Hr(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const s = o({ ...e }, t);
  return _ && s === null && h.log(`Event processor "${o.id || "?"}" dropped event`), At(s) ? s.then((i) => Hr(i, t, n, r + 1)) : Hr(s, t, n, r + 1);
}
function vl(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: s } = t;
  Il(e, t), r && Al(e, r), Ol(e, n), Rl(e, o), wl(e, s);
}
function Un(e, t) {
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
function Il(e, t) {
  const { extra: n, tags: r, user: o, contexts: s, level: i, transactionName: a } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(s).length && (e.contexts = { ...s, ...e.contexts }), i && (e.level = i), a && e.type !== "transaction" && (e.transaction = a);
}
function Rl(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function wl(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function Al(e, t) {
  e.contexts = {
    trace: Hi(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: Oe(t),
    ...e.sdkProcessingMetadata
  };
  const n = V(t), r = R(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function Ol(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let Ze, Is, Rs, Pe;
function Dl(e) {
  const t = v._sentryDebugIds, n = v._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (Pe && r.length === Is && o.length === Rs)
    return Pe;
  Is = r.length, Rs = o.length, Pe = {}, Ze || (Ze = {});
  const s = (i, a) => {
    for (const c of i) {
      const u = a[c], l = Ze?.[c];
      if (l && Pe && u)
        Pe[l[0]] = u, Ze && (Ze[c] = [l[0], u]);
      else if (u) {
        const d = e(c);
        for (let m = d.length - 1; m >= 0; m--) {
          const p = d[m]?.filename;
          if (p && Pe && Ze) {
            Pe[p] = u, Ze[c] = [p, u];
            break;
          }
        }
      }
    }
  };
  return t && s(r, t), n && s(o, n), Pe;
}
function Nl(e, t, n, r, o, s) {
  const { normalizeDepth: i = 3, normalizeMaxBreadth: a = 1e3 } = e, c = {
    ...t,
    event_id: t.event_id || n.event_id || ie(),
    timestamp: t.timestamp || pt()
  }, u = n.integrations || e.integrations.map((y) => y.name);
  kl(c, e), Ml(c, u), o && o.emit("applyFrameMetadata", t), t.type === void 0 && Cl(c, e.stackParser);
  const l = xl(r, n.captureContext);
  n.mechanism && St(c, n.mechanism);
  const d = o ? o.getEventProcessors() : [], m = Di().getScopeData();
  if (s) {
    const y = s.getScopeData();
    Un(m, y);
  }
  if (l) {
    const y = l.getScopeData();
    Un(m, y);
  }
  const f = [...n.attachments || [], ...m.attachments];
  f.length && (n.attachments = f), vl(c, m);
  const p = [
    ...d,
    // Run scope event processors _after_ all other processors
    ...m.eventProcessors
  ];
  return bl(p, c, n).then((y) => (y && Pl(y), typeof i == "number" && i > 0 ? Ll(y, i, a) : y));
}
function kl(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: s = 250 } = t;
  e.environment = e.environment || n || go, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const i = e.request;
  i?.url && (i.url = Mn(i.url, s));
}
function Cl(e, t) {
  const n = Dl(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function Pl(e) {
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
function Ml(e, t) {
  t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Ll(e, t, n) {
  if (!e)
    return null;
  const r = {
    ...e,
    ...e.breadcrumbs && {
      breadcrumbs: e.breadcrumbs.map((o) => ({
        ...o,
        ...o.data && {
          data: pe(o.data, t, n)
        }
      }))
    },
    ...e.user && {
      user: pe(e.user, t, n)
    },
    ...e.contexts && {
      contexts: pe(e.contexts, t, n)
    },
    ...e.extra && {
      extra: pe(e.extra, t, n)
    }
  };
  return e.contexts?.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = pe(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((o) => ({
    ...o,
    ...o.data && {
      data: pe(o.data, t, n)
    }
  }))), e.contexts?.flags && r.contexts && (r.contexts.flags = pe(e.contexts.flags, 3, n)), r;
}
function xl(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new k();
  return n.update(t), n;
}
function Ul(e, t) {
  return D().captureException(e, void 0);
}
function ta(e, t) {
  return D().captureEvent(e, t);
}
function $l() {
  const e = w();
  return e?.getOptions().enabled !== !1 && !!e?.getTransport();
}
function ws(e) {
  const t = We(), n = D(), { userAgent: r } = v.navigator || {}, o = ou({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), s = t.getSession();
  return s?.status === "ok" && Et(s, { status: "exited" }), na(), t.setSession(o), o;
}
function na() {
  const e = We(), n = D().getSession() || e.getSession();
  n && su(n), ra(), e.setSession();
}
function ra() {
  const e = We(), t = w(), n = e.getSession();
  n && t && t.captureSession(n);
}
function As(e = !1) {
  if (e) {
    na();
    return;
  }
  ra();
}
const Bl = "7";
function Fl(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function Gl(e) {
  return `${Fl(e)}${e.projectId}/envelope/`;
}
function Hl(e, t) {
  const n = {
    sentry_version: Bl
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function jl(e, t, n) {
  return t || `${Gl(e)}?${Hl(e, n)}`;
}
const Os = [];
function ql(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && oa(e, r, n);
  }), n;
}
function Ds(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function oa(e, t, n) {
  if (n[t.name]) {
    _ && h.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, Os.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), Os.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
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
function zl(e, t) {
  return t ? Qt(t, () => {
    const n = Z(), r = n ? Hi(n) : Ni(t);
    return [n ? Oe(n) : ho(e, t), r];
  }) : [void 0, void 0];
}
const Wl = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};
function Yl(e) {
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
  }), n && r && (o.dsn = Nt(r)), mt(o, [Yl(e)]);
}
const Kl = 100;
function Jl(e) {
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
function fe(e, t, n, r = !0) {
  n && (!e[t] || r) && (e[t] = n);
}
function Xl(e, t) {
  const n = To(), r = sa(e);
  r === void 0 ? n.set(e, [t]) : (n.set(e, [...r, t]), r.length >= Kl && Eo(e, r));
}
function jr(e, t = D(), n = Xl) {
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
  const [, c] = zl(r, t), u = {
    ...e.attributes
  }, {
    user: { id: l, email: d, username: m }
  } = Zl(t);
  fe(u, "user.id", l, !1), fe(u, "user.email", d, !1), fe(u, "user.name", m, !1), fe(u, "sentry.release", o), fe(u, "sentry.environment", s);
  const { name: f, version: p } = r.getSdkMetadata()?.sdk ?? {};
  fe(u, "sentry.sdk.name", f), fe(u, "sentry.sdk.version", p);
  const S = r.getIntegrationByName("Replay"), y = S?.getReplayId(!0);
  fe(u, "sentry.replay_id", y), y && S?.getRecordingMode() === "buffer" && fe(u, "sentry._internal.replay_is_buffering", !0);
  const G = e.message;
  if (Yn(G)) {
    const { __sentry_template_string__: _e, __sentry_template_values__: Y = [] } = G;
    Y?.length && (u["sentry.message.template"] = _e), Y.forEach((ye, L) => {
      u[`sentry.message.parameter.${L}`] = ye;
    });
  }
  const W = qt(t);
  fe(u, "sentry.trace.parent_span_id", W?.spanContext().spanId);
  const Ne = { ...e, attributes: u };
  r.emit("beforeCaptureLog", Ne);
  const Ve = a ? Xt(() => a(Ne)) : Ne;
  if (!Ve) {
    r.recordDroppedEvent("before_send", "log_item", 1), _ && h.warn("beforeSendLog returned null, log will not be captured.");
    return;
  }
  const { level: gt, message: ht, attributes: b = {}, severityNumber: M } = Ve, ke = {
    timestamp: U(),
    level: gt,
    body: ht,
    trace_id: c?.trace_id,
    severity_number: M ?? Wl[gt],
    attributes: Object.keys(b).reduce(
      (_e, Y) => (_e[Y] = Jl(b[Y]), _e),
      {}
    )
  };
  n(r, ke), r.emit("afterCaptureLog", Ve);
}
function Eo(e, t) {
  const n = t ?? sa(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Vl(n, r._metadata, r.tunnel, e.getDsn());
  To().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function sa(e) {
  return To().get(e);
}
function Zl(e) {
  const t = Di().getScopeData();
  return Un(t, We().getScopeData()), Un(t, e.getScopeData()), t;
}
function To() {
  return Rt("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Ql(e) {
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
function ed(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = Nt(r)), mt(o, [Ql(e)]);
}
function ia(e, t) {
  const n = t ?? td(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = ed(n, r._metadata, r.tunnel, e.getDsn());
  aa().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function td(e) {
  return aa().get(e);
}
function aa() {
  return Rt("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function nd(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: pt(),
      discarded_events: e
    }
  ];
  return mt(t ? { dsn: t } : {}, [r]);
}
function ca(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function rd(e) {
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
    profile_id: i?.[fo],
    exclusive_time: i?.[Dt],
    measurements: e.measurements,
    is_segment: !0
  };
}
function od(e) {
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
          ...e.profile_id && { [fo]: e.profile_id },
          ...e.exclusive_time && { [Dt]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const Ns = "Not capturing exception because it's already been captured.", ks = "Discarded session because of missing or non-string release", ua = Symbol.for("SentryInternalError"), la = Symbol.for("SentryDoNotSendEventError"), sd = 5e3;
function An(e) {
  return {
    message: e,
    [ua]: !0
  };
}
function Sr(e) {
  return {
    message: e,
    [la]: !0
  };
}
function Cs(e) {
  return !!e && typeof e == "object" && ua in e;
}
function Ps(e) {
  return !!e && typeof e == "object" && la in e;
}
function Ms(e, t, n, r, o) {
  let s = 0, i;
  e.on(n, () => {
    s = 0, clearTimeout(i);
  }), e.on(t, (a) => {
    s += r(a), s >= 8e5 ? o(e) : (clearTimeout(i), i = setTimeout(() => {
      o(e);
    }, sd));
  }), e.on("flush", () => {
    o(e);
  });
}
class id {
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
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = Cu(t.dsn) : _ && h.warn("No DSN provided, client will not send events."), this._dsn) {
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
    this._options.enableLogs && Ms(this, "afterCaptureLog", "flushLogs", ld, Eo), this._options._experiments?.enableMetrics && Ms(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      ud,
      ia
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = ie();
    if (is(t))
      return _ && h.log(Ns), o;
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
      event_id: ie(),
      ...r
    }, i = Yn(t) ? t : String(t), a = ut(t) ? this.eventFromMessage(i, n, s) : this.eventFromException(t, s);
    return this._process(a.then((c) => this._captureEvent(c, s, o))), s.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = ie();
    if (n?.originalException && is(n.originalException))
      return _ && h.log(Ns), o;
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
    this.sendSession(t), Et(t, { init: !1 });
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
    oa(this, t, this._integrations), n || Ds(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = sl(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = Ju(r, el(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = go } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        _ && h.warn(ks);
        return;
      }
      s.release = s.release || n, s.environment = s.environment || r, t.attrs = s;
    } else {
      if (!t.release && !n) {
        _ && h.warn(ks);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = ol(t, this._dsn, this._options._metadata, this._options.tunnel);
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
    this._integrations = ql(this, t), Ds(this, t);
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
    (i && t.errors === 0 || i && r) && (Et(t, {
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
    return !n.integrations && i?.length && (n.integrations = i), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Nl(s, t, n, r, this, o).then((a) => {
      if (a === null)
        return a;
      this.emit("postprocessEvent", a, n), a.contexts = {
        trace: Ni(r),
        ...a.contexts
      };
      const c = ho(this, r);
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
  _captureEvent(t, n = {}, r = D(), o = We()) {
    return _ && qr(t) && h.log(`Captured error event \`${ca(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (s) => s.event_id,
      (s) => {
        _ && (Ps(s) ? h.log(s.message) : Cs(s) ? h.warn(s.message) : h.warn(s));
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
    const s = this.getOptions(), { sampleRate: i } = s, a = da(t), c = qr(t), u = t.type || "error", l = `before send for type \`${u}\``, d = typeof i > "u" ? void 0 : Wt(i);
    if (c && typeof d == "number" && Math.random() > d)
      return this.recordDroppedEvent("sample_rate", "error"), So(
        Sr(
          `Discarding event because it's not included in the random sample (sampling rate = ${i})`
        )
      );
    const m = u === "replay_event" ? "replay" : u;
    return this._prepareEvent(t, n, r, o).then((f) => {
      if (f === null)
        throw this.recordDroppedEvent("event_processor", m), Sr("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return f;
      const S = cd(this, s, f, n);
      return ad(S, l);
    }).then((f) => {
      if (f === null) {
        if (this.recordDroppedEvent("before_send", m), a) {
          const G = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", G);
        }
        throw Sr(`${l} returned \`null\`, will not send event.`);
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
      throw Ps(f) || Cs(f) ? f : (this.captureException(f, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: f
      }), An(
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
    const n = nd(t, this._options.tunnel && Nt(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function ad(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (At(e))
    return e.then(
      (r) => {
        if (!jt(r) && r !== null)
          throw An(n);
        return r;
      },
      (r) => {
        throw An(`${t} rejected with ${r}`);
      }
    );
  if (!jt(e) && e !== null)
    throw An(n);
  return e;
}
function cd(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i, ignoreSpans: a } = t;
  let c = n;
  if (qr(c) && o)
    return o(c, r);
  if (da(c)) {
    if (i || a) {
      const u = rd(c);
      if (a?.length && xn(u, a))
        return null;
      if (i) {
        const l = i(u);
        l ? c = Zt(n, od(l)) : Br();
      }
      if (c.spans) {
        const l = [], d = c.spans;
        for (const f of d) {
          if (a?.length && xn(f, a)) {
            ju(d, f);
            continue;
          }
          if (i) {
            const p = i(f);
            p ? l.push(p) : (Br(), l.push(f));
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
function qr(e) {
  return e.type === void 0;
}
function da(e) {
  return e.type === "transaction";
}
function ud(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + fa(e.attributes);
}
function ld(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + fa(e.attributes);
}
function fa(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * Ls(n[0]) : ut(n) ? t += Ls(n) : t += 100;
  }), t;
}
function Ls(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const pa = Symbol.for("SentryBufferFullError");
function dd(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(i) {
    t.delete(i);
  }
  function o(i) {
    if (!n())
      return So(pa);
    const a = i();
    return t.add(a), a.then(
      () => r(a),
      () => r(a)
    ), a;
  }
  function s(i) {
    if (!t.size)
      return Xn(!0);
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
const fd = 60 * 1e3;
function pd(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? fd : r - t;
}
function md(e, t) {
  return e[t] || e.all || 0;
}
function gd(e, t, n = Date.now()) {
  return md(e, t) > n;
}
function hd(e, { statusCode: t, headers: n }, r = Date.now()) {
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
  else i ? o.all = r + pd(i, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const _d = 64;
function yd(e, t, n = dd(
  e.bufferSize || _d
)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const a = [];
    if (gs(i, (d, m) => {
      const f = hs(m);
      gd(r, f) ? e.recordDroppedEvent("ratelimit_backoff", f) : a.push(d);
    }), a.length === 0)
      return Promise.resolve({});
    const c = mt(i[0], a), u = (d) => {
      gs(c, (m, f) => {
        e.recordDroppedEvent(d, hs(f));
      });
    }, l = () => t({ body: Xu(c) }).then(
      (d) => (d.statusCode !== void 0 && (d.statusCode < 200 || d.statusCode >= 300) && _ && h.warn(`Sentry responded with status code ${d.statusCode} to sent event.`), r = hd(r, d), d),
      (d) => {
        throw u("network_error"), _ && h.error("Encountered error running transport request:", d), d;
      }
    );
    return n.add(l).then(
      (d) => d,
      (d) => {
        if (d === pa)
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
const Sd = "thismessage:/";
function ma(e) {
  return "isRelative" in e;
}
function ga(e, t) {
  const n = e.indexOf("://") <= 0 && e.indexOf("//") !== 0, r = n ? Sd : void 0;
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
function Ed(e) {
  if (ma(e))
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
function Td(e) {
  return e.split(/[?#]/, 1)[0];
}
function bd(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function vd(e, t, n = [t], r = "npm") {
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
function ha(e = {}) {
  const t = e.client || w();
  if (!$l() || !t)
    return {};
  const n = ft(), r = Ot(n);
  if (r.getTraceData)
    return r.getTraceData(e);
  const o = e.scope || D(), s = e.span || Z(), i = s ? Uu(s) : Id(o), a = s ? Oe(s) : ho(t, o), c = bu(a);
  if (!$i.test(i))
    return h.warn("Invalid sentry-trace data. Cannot generate trace data"), {};
  const l = {
    "sentry-trace": i,
    baggage: c
  };
  if (e.propagateTraceparent) {
    const d = s ? $u(s) : Rd(o);
    d && (l.traceparent = d);
  }
  return l;
}
function Id(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return Bi(t, r, n);
}
function Rd(e) {
  const { traceId: t, sampled: n, propagationSpanId: r } = e.getPropagationContext();
  return Fi(t, r, n);
}
const wd = 100;
function lt(e, t) {
  const n = w(), r = We();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = wd } = n.getOptions();
  if (s <= 0) return;
  const a = { timestamp: pt(), ...e }, c = o ? Xt(() => o(a, t)) : a;
  c !== null && (n.emit && n.emit("beforeAddBreadcrumb", c, t), r.addBreadcrumb(c, s));
}
let xs;
const Ad = "FunctionToString", Us = /* @__PURE__ */ new WeakMap(), Od = () => ({
  name: Ad,
  setupOnce() {
    xs = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = uo(this), n = Us.has(w()) && t !== void 0 ? t : this;
        return xs.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    Us.set(e, !0);
  }
}), Dd = Od, Nd = [
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
], kd = "EventFilters", Cd = (e = {}) => {
  let t;
  return {
    name: kd,
    setup(n) {
      const r = n.getOptions();
      t = $s(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const s = o.getOptions();
        t = $s(e, s);
      }
      return Md(n, t) ? null : n;
    }
  };
}, Pd = (e = {}) => ({
  ...Cd(e),
  name: "InboundFilters"
});
function $s(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : Nd
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function Md(e, t) {
  if (e.type) {
    if (e.type === "transaction" && xd(e, t.ignoreTransactions))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${nt(e)}`
      ), !0;
  } else {
    if (Ld(e, t.ignoreErrors))
      return _ && h.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${nt(e)}`
      ), !0;
    if (Fd(e))
      return _ && h.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${nt(
          e
        )}`
      ), !0;
    if (Ud(e, t.denyUrls))
      return _ && h.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${nt(
          e
        )}.
Url: ${$n(e)}`
      ), !0;
    if (!$d(e, t.allowUrls))
      return _ && h.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${nt(
          e
        )}.
Url: ${$n(e)}`
      ), !0;
  }
  return !1;
}
function Ld(e, t) {
  return t?.length ? ca(e).some((n) => Ge(n, t)) : !1;
}
function xd(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? Ge(n, t) : !1;
}
function Ud(e, t) {
  if (!t?.length)
    return !1;
  const n = $n(e);
  return n ? Ge(n, t) : !1;
}
function $d(e, t) {
  if (!t?.length)
    return !0;
  const n = $n(e);
  return n ? Ge(n, t) : !0;
}
function Bd(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function $n(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? Bd(n) : null;
  } catch {
    return _ && h.error(`Cannot extract url for event ${nt(e)}`), null;
  }
}
function Fd(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Gd(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !Re(s.originalException, Error))
    return;
  const i = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  i && (o.exception.values = zr(
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
function zr(e, t, n, r, o, s, i, a) {
  if (s.length >= n + 1)
    return s;
  let c = [...s];
  if (Re(r[o], Error)) {
    Bs(i, a);
    const u = e(t, r[o]), l = c.length;
    Fs(u, o, l, a), c = zr(
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
    if (Re(u, Error)) {
      Bs(i, a);
      const d = e(t, u), m = c.length;
      Fs(d, `errors[${l}]`, m, a), c = zr(
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
function Bs(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function Fs(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: "chained",
    source: t,
    exception_id: n,
    parent_id: r
  };
}
function _a(e) {
  const t = "console";
  qe(t, e), ze(t, Hd);
}
function Hd() {
  "console" in v && gi.forEach(function(e) {
    e in v.console && te(v.console, e, function(t) {
      return Pn[e] = t, function(...n) {
        se("console", { args: n, level: e }), Pn[e]?.apply(v.console, n);
      };
    });
  });
}
function jd(e) {
  return e === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e) ? e : "log";
}
const qd = "Dedupe", zd = () => {
  let e;
  return {
    name: qd,
    processEvent(t) {
      if (t.type)
        return t;
      try {
        if (Yd(t, e))
          return _ && h.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, Wd = zd;
function Yd(e, t) {
  return t ? !!(Vd(e, t) || Kd(e, t)) : !1;
}
function Vd(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !Sa(e, t) || !ya(e, t));
}
function Kd(e, t) {
  const n = Gs(t), r = Gs(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !Sa(e, t) || !ya(e, t));
}
function ya(e, t) {
  let n = es(e), r = es(t);
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
function Sa(e, t) {
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
function Gs(e) {
  return e.exception?.values?.[0];
}
function Jd(e, t, n, r, o) {
  if (!e.fetchData)
    return;
  const { method: s, url: i } = e.fetchData, a = le() && t(i);
  if (e.endTimestamp && a) {
    const f = e.fetchData.__span;
    if (!f) return;
    const p = r[f];
    p && (Qd(p, e), Xd(p, e, o), delete r[f]);
    return;
  }
  const { spanOrigin: c = "auto.http.browser", propagateTraceparent: u = !1 } = typeof o == "object" ? o : { spanOrigin: o }, l = !!Z(), d = a && l ? kt(tf(i, s, c)) : new He();
  if (e.fetchData.__span = d.spanContext().spanId, r[d.spanContext().spanId] = d, n(e.fetchData.url)) {
    const f = e.args[0], p = e.args[1] || {}, S = Zd(
      f,
      p,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      le() && l ? d : void 0,
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
function Xd(e, t, n) {
  (typeof n == "object" && n !== null ? n.onRequestSpanEnd : void 0)?.(e, {
    headers: t.response?.headers,
    error: t.error
  });
}
function Zd(e, t, n, r) {
  const o = ha({ span: n, propagateTraceparent: r }), s = o["sentry-trace"], i = o.baggage, a = o.traceparent;
  if (!s)
    return;
  const c = t.headers || (vi(e) ? e.headers : void 0);
  if (c)
    if (ef(c)) {
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
function Qd(e, t) {
  if (t.response) {
    Pi(e, t.response.status);
    const n = t.response?.headers?.get("content-length");
    if (n) {
      const r = parseInt(n);
      r > 0 && e.setAttribute("http.response_content_length", r);
    }
  } else t.error && e.setStatus({ code: x, message: "internal_error" });
  e.end();
}
function gn(e) {
  return e.split(",").some((t) => t.trim().startsWith(po));
}
function ef(e) {
  return typeof Headers < "u" && Re(e, Headers);
}
function tf(e, t, n) {
  const r = ga(e);
  return {
    name: r ? `${t} ${Ed(r)}` : t,
    attributes: nf(e, r, t, n)
  };
}
function nf(e, t, n, r) {
  const o = {
    url: e,
    type: "fetch",
    "http.method": n,
    [P]: r,
    [Ae]: "http.client"
  };
  return t && (ma(t) || (o["http.url"] = t.href, o["server.address"] = t.host), t.search && (o["http.query"] = t.search), t.hash && (o["http.fragment"] = t.hash)), o;
}
function bo(e, t, n, r, o) {
  jr({ level: e, message: t, attributes: n, severityNumber: o }, r);
}
function Zn(e, t, { scope: n } = {}) {
  bo("info", e, t, n);
}
function Qn(e, t, { scope: n } = {}) {
  bo("warn", e, t, n);
}
function er(e, t, { scope: n } = {}) {
  bo("error", e, t, n);
}
function Hs(e, t, n) {
  return "util" in v && typeof v.util.format == "function" ? v.util.format(...e) : rf(e, t, n);
}
function rf(e, t, n) {
  return e.map(
    (r) => ut(r) ? String(r) : JSON.stringify(pe(r, t, n))
  ).join(" ");
}
function of(e) {
  return /%[sdifocO]/.test(e);
}
function sf(e, t) {
  const n = {}, r = new Array(t.length).fill("{}").join(" ");
  return n["sentry.message.template"] = `${e} ${r}`, t.forEach((o, s) => {
    n[`sentry.message.parameter.${s}`] = o;
  }), n;
}
const af = "ConsoleLogs", js = {
  [P]: "auto.log.console"
}, cf = (e = {}) => {
  const t = e.levels || gi;
  return {
    name: af,
    setup(n) {
      const { enableLogs: r, normalizeDepth: o = 3, normalizeMaxBreadth: s = 1e3 } = n.getOptions();
      if (!r) {
        _ && h.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
        return;
      }
      _a(({ args: i, level: a }) => {
        if (w() !== n || !t.includes(a))
          return;
        const c = i[0], u = i.slice(1);
        if (a === "assert") {
          if (!c) {
            const f = u.length > 0 ? `Assertion failed: ${Hs(u, o, s)}` : "Assertion failed";
            jr({ level: "error", message: f, attributes: js });
          }
          return;
        }
        const l = a === "log", d = i.length > 1 && typeof i[0] == "string" && !of(i[0]), m = {
          ...js,
          ...d ? sf(c, u) : {}
        };
        jr({
          level: l ? "info" : a,
          message: Hs(i, o, s),
          severityNumber: l ? 10 : void 0,
          attributes: m
        });
      });
    }
  };
}, vo = cf;
function Ea(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const Vt = v;
function uf() {
  return "history" in Vt && !!Vt.history;
}
function lf() {
  if (!("fetch" in Vt))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function Wr(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function df() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!lf())
    return !1;
  if (Wr(Vt.fetch))
    return !0;
  let e = !1;
  const t = Vt.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = Wr(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      _ && h.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function Ta(e, t) {
  const n = "fetch";
  qe(n, e), ze(n, () => ba(void 0, t));
}
function ff(e) {
  const t = "fetch-body-resolved";
  qe(t, e), ze(t, () => ba(mf));
}
function ba(e, t = !1) {
  t && !df() || te(v, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: s, url: i } = gf(r), a = {
        args: r,
        fetchData: {
          method: s,
          url: i
        },
        startTimestamp: U() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: hf(r)
      };
      return e || se("fetch", {
        ...a
      }), n.apply(v, r).then(
        async (c) => (e ? e(c) : se("fetch", {
          ...a,
          endTimestamp: U() * 1e3,
          response: c
        }), c),
        (c) => {
          if (se("fetch", {
            ...a,
            endTimestamp: U() * 1e3,
            error: c
          }), ao(c) && c.stack === void 0 && (c.stack = o.stack, ne(c, "framesToPop", 1)), c instanceof TypeError && (c.message === "Failed to fetch" || c.message === "Load failed" || c.message === "NetworkError when attempting to fetch resource."))
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
async function pf(e, t) {
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
function mf(e) {
  let t;
  try {
    t = e.clone();
  } catch {
    return;
  }
  pf(t, () => {
    se("fetch-body-resolved", {
      endTimestamp: U() * 1e3,
      response: e
    });
  });
}
function Yr(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function qs(e) {
  return typeof e == "string" ? e : e ? Yr(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function gf(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: qs(n),
      method: Yr(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: qs(t),
    method: Yr(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function hf(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (vi(t))
      return new Headers(t.headers);
  } catch {
  }
}
function _f() {
  return "npm";
}
const A = v;
let Vr = 0;
function va() {
  return Vr > 0;
}
function yf() {
  Vr++, setTimeout(() => {
    Vr--;
  });
}
function vt(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (uo(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const s = o.map((i) => vt(i, t));
      return e.apply(this, s);
    } catch (s) {
      throw yf(), Qt((i) => {
        i.addEventProcessor((a) => (t.mechanism && (xr(a, void 0), St(a, t.mechanism)), a.extra = {
          ...a.extra,
          arguments: o
        }, a)), Ul(s);
      }), s;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  Ri(r, e), ne(e, "__sentry_wrapped__", r);
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
function Io() {
  const e = Kn(), { referrer: t } = A.document || {}, { userAgent: n } = A.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function Ro(e, t) {
  const n = wo(e, t), r = {
    type: vf(t),
    value: If(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function Sf(e, t, n, r) {
  const s = w()?.getOptions().normalizeDepth, i = Df(t), a = {
    __serialized__: Vi(t, s)
  };
  if (i)
    return {
      exception: {
        values: [Ro(e, i)]
      },
      extra: a
    };
  const c = {
    exception: {
      values: [
        {
          type: Vn(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: Af(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: a
  };
  if (n) {
    const u = wo(e, n);
    u.length && (c.exception.values[0].stacktrace = { frames: u });
  }
  return c;
}
function Er(e, t) {
  return {
    exception: {
      values: [Ro(e, t)]
    }
  };
}
function wo(e, t) {
  const n = t.stacktrace || t.stack || "", r = Tf(t), o = bf(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const Ef = /Minified React error #\d+;/i;
function Tf(e) {
  return e && Ef.test(e.message) ? 1 : 0;
}
function bf(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function Ia(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function vf(e) {
  const t = e?.name;
  return !t && Ia(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function If(e) {
  const t = e?.message;
  return Ia(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function Rf(e, t, n, r) {
  const o = n?.syntheticException || void 0, s = Ao(e, t, o, r);
  return St(s), s.level = "error", n?.event_id && (s.event_id = n.event_id), Xn(s);
}
function wf(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0, i = Kr(e, t, s, o);
  return i.level = n, r?.event_id && (i.event_id = r.event_id), Xn(i);
}
function Ao(e, t, n, r, o) {
  let s;
  if (Ti(t) && t.error)
    return Er(e, t.error);
  if (ns(t) || Wc(t)) {
    const i = t;
    if ("stack" in t)
      s = Er(e, t);
    else {
      const a = i.name || (ns(i) ? "DOMError" : "DOMException"), c = i.message ? `${a}: ${i.message}` : a;
      s = Kr(e, c, n, r), xr(s, c);
    }
    return "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }), s;
  }
  return ao(t) ? Er(e, t) : jt(t) || Vn(t) ? (s = Sf(e, t, n, o), St(s, {
    synthetic: !0
  }), s) : (s = Kr(e, t, n, r), xr(s, `${t}`), St(s, {
    synthetic: !0
  }), s);
}
function Kr(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = wo(e, n);
    s.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: s } }]
    }), St(o, { synthetic: !0 });
  }
  if (Yn(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return o.logentry = {
      message: s,
      params: i
    }, o;
  }
  return o.message = t, o;
}
function Af(e, { isUnhandledRejection: t }) {
  const n = Zc(e), r = t ? "promise rejection" : "exception";
  return Ti(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : Vn(e) ? `Event \`${Of(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function Of(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function Df(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class tr extends id {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = Nf(t), r = A.SENTRY_SDK_SOURCE || _f();
    vd(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: s, enableLogs: i, _experiments: a } = this._options;
    A.document && (s || i || a?.enableMetrics) && A.document.addEventListener("visibilitychange", () => {
      A.document.visibilityState === "hidden" && (s && this._flushOutcomes(), i && Eo(this), a?.enableMetrics && ia(this));
    }), o && this.on("beforeSendSession", bd);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return Rf(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return wf(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function Nf(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : A.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const rn = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, E = v, kf = (e, t) => e > t[1] ? "poor" : e > t[0] ? "needs-improvement" : "good", on = (e, t, n, r) => {
  let o, s;
  return (i) => {
    t.value >= 0 && (i || r) && (s = t.value - (o ?? 0), (s || o === void 0) && (o = t.value, t.delta = s, t.rating = kf(t.value, n), e(t)));
  };
}, Cf = () => `v5-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`, sn = (e = !0) => {
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
    id: Cf(),
    navigationType: r
  };
}, Tr = /* @__PURE__ */ new WeakMap();
function Oo(e, t) {
  return Tr.get(e) || Tr.set(e, new t()), Tr.get(e);
}
class Bn {
  constructor() {
    Bn.prototype.__init.call(this), Bn.prototype.__init2.call(this);
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
}, Do = (e) => {
  let t = !1;
  return () => {
    t || (e(), t = !0);
  };
};
let Gt = -1;
const Pf = () => E.document?.visibilityState === "hidden" && !E.document?.prerendering ? 0 : 1 / 0, Fn = (e) => {
  E.document.visibilityState === "hidden" && Gt > -1 && (Gt = e.type === "visibilitychange" ? e.timeStamp : 0, Lf());
}, Mf = () => {
  addEventListener("visibilitychange", Fn, !0), addEventListener("prerenderingchange", Fn, !0);
}, Lf = () => {
  removeEventListener("visibilitychange", Fn, !0), removeEventListener("prerenderingchange", Fn, !0);
}, No = () => {
  if (E.document && Gt < 0) {
    const e = Ct();
    Gt = (E.document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((n) => n.name === "hidden" && n.startTime > e)[0]?.startTime) ?? Pf(), Mf();
  }
  return {
    get firstHiddenTime() {
      return Gt;
    }
  };
}, nr = (e) => {
  E.document?.prerendering ? addEventListener("prerenderingchange", () => e(), !0) : e();
}, xf = [1800, 3e3], Uf = (e, t = {}) => {
  nr(() => {
    const n = No(), r = an("FCP");
    let o;
    const i = Pt("paint", (a) => {
      for (const c of a)
        c.name === "first-contentful-paint" && (i.disconnect(), c.startTime < n.firstHiddenTime && (r.value = Math.max(c.startTime - Ct(), 0), r.entries.push(c), o(!0)));
    });
    i && (o = on(e, r, xf, t.reportAllChanges));
  });
}, $f = [0.1, 0.25], Bf = (e, t = {}) => {
  Uf(
    Do(() => {
      const n = an("CLS", 0);
      let r;
      const o = Oo(t, Bn), s = (a) => {
        for (const c of a)
          o._processEntry(c);
        o._sessionValue > n.value && (n.value = o._sessionValue, n.entries = o._sessionEntries, r());
      }, i = Pt("layout-shift", s);
      i && (r = on(e, n, $f, t.reportAllChanges), E.document?.addEventListener("visibilitychange", () => {
        E.document?.visibilityState === "hidden" && (s(i.takeRecords()), r(!0));
      }), E?.setTimeout?.(r));
    })
  );
};
let Ra = 0, br = 1 / 0, hn = 0;
const Ff = (e) => {
  e.forEach((t) => {
    t.interactionId && (br = Math.min(br, t.interactionId), hn = Math.max(hn, t.interactionId), Ra = hn ? (hn - br) / 7 + 1 : 0);
  });
};
let Jr;
const wa = () => Jr ? Ra : performance.interactionCount || 0, Gf = () => {
  "interactionCount" in performance || Jr || (Jr = Pt("event", Ff, {
    type: "event",
    buffered: !0,
    durationThreshold: 0
  }));
}, vr = 10;
let Aa = 0;
const Hf = () => wa() - Aa;
class Gn {
  constructor() {
    Gn.prototype.__init.call(this), Gn.prototype.__init2.call(this);
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
    Aa = wa(), this._longestInteractionList.length = 0, this._longestInteractionMap.clear();
  }
  /**
   * Returns the estimated p98 longest interaction based on the stored
   * interaction candidates and the interaction count for the current page.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _estimateP98LongestInteraction() {
    const t = Math.min(
      this._longestInteractionList.length - 1,
      Math.floor(Hf() / 50)
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
    if (r || this._longestInteractionList.length < vr || // If the above conditions are false, `minLongestInteraction` will be set.
    t.duration > n._latency) {
      if (r ? t.duration > r._latency ? (r.entries = [t], r._latency = t.duration) : t.duration === r._latency && t.startTime === r.entries[0].startTime && r.entries.push(t) : (r = {
        id: t.interactionId,
        entries: [t],
        _latency: t.duration
      }, this._longestInteractionMap.set(r.id, r), this._longestInteractionList.push(r)), this._longestInteractionList.sort((o, s) => s._latency - o._latency), this._longestInteractionList.length > vr) {
        const o = this._longestInteractionList.splice(vr);
        for (const s of o)
          this._longestInteractionMap.delete(s.id);
      }
      this._onAfterProcessingINPCandidate?.(r);
    }
  }
}
const ko = (e) => {
  const t = (n) => {
    (n.type === "pagehide" || E.document?.visibilityState === "hidden") && e(n);
  };
  E.document && (addEventListener("visibilitychange", t, !0), addEventListener("pagehide", t, !0));
}, Oa = (e) => {
  const t = E.requestIdleCallback || E.setTimeout;
  E.document?.visibilityState === "hidden" ? e() : (e = Do(e), t(e), ko(e));
}, jf = [200, 500], qf = 40, zf = (e, t = {}) => {
  globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype && nr(() => {
    Gf();
    const n = an("INP");
    let r;
    const o = Oo(t, Gn), s = (a) => {
      Oa(() => {
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
      durationThreshold: t.durationThreshold ?? qf
    });
    r = on(e, n, jf, t.reportAllChanges), i && (i.observe({ type: "first-input", buffered: !0 }), ko(() => {
      s(i.takeRecords()), r(!0);
    }));
  });
};
class Wf {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, jsdoc/require-jsdoc
  _processEntry(t) {
    this._onBeforeProcessingEntry?.(t);
  }
}
const Yf = [2500, 4e3], Vf = (e, t = {}) => {
  nr(() => {
    const n = No(), r = an("LCP");
    let o;
    const s = Oo(t, Wf), i = (c) => {
      t.reportAllChanges || (c = c.slice(-1));
      for (const u of c)
        s._processEntry(u), u.startTime < n.firstHiddenTime && (r.value = Math.max(u.startTime - Ct(), 0), r.entries = [u], o());
    }, a = Pt("largest-contentful-paint", i);
    if (a) {
      o = on(e, r, Yf, t.reportAllChanges);
      const c = Do(() => {
        i(a.takeRecords()), a.disconnect(), o(!0);
      });
      for (const u of ["keydown", "click", "visibilitychange"])
        E.document && addEventListener(u, () => Oa(c), {
          capture: !0,
          once: !0
        });
    }
  });
}, Kf = [800, 1800], Xr = (e) => {
  E.document?.prerendering ? nr(() => Xr(e)) : E.document?.readyState !== "complete" ? addEventListener("load", () => Xr(e), !0) : setTimeout(e);
}, Jf = (e, t = {}) => {
  const n = an("TTFB"), r = on(e, n, Kf, t.reportAllChanges);
  Xr(() => {
    const o = sn();
    o && (n.value = Math.max(o.responseStart - Ct(), 0), n.entries = [o], r(!0));
  });
}, Ht = {}, Hn = {};
let Da, Na, ka, Ca;
function Pa(e, t = !1) {
  return rr("cls", e, Qf, Da, t);
}
function Ma(e, t = !1) {
  return rr("lcp", e, ep, Na, t);
}
function Xf(e) {
  return rr("ttfb", e, tp, ka);
}
function Zf(e) {
  return rr("inp", e, np, Ca);
}
function It(e, t) {
  return La(e, t), Hn[e] || (rp(e), Hn[e] = !0), xa(e, t);
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
Name: ${Ie(r)}
Error:`,
          o
        );
      }
}
function Qf() {
  return Bf(
    (e) => {
      cn("cls", {
        metric: e
      }), Da = e;
    },
    // We want the callback to be called whenever the CLS value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function ep() {
  return Vf(
    (e) => {
      cn("lcp", {
        metric: e
      }), Na = e;
    },
    // We want the callback to be called whenever the LCP value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function tp() {
  return Jf((e) => {
    cn("ttfb", {
      metric: e
    }), ka = e;
  });
}
function np() {
  return zf((e) => {
    cn("inp", {
      metric: e
    }), Ca = e;
  });
}
function rr(e, t, n, r, o = !1) {
  La(e, t);
  let s;
  return Hn[e] || (s = n(), Hn[e] = !0), r && t({ metric: r }), xa(e, t, o ? s : void 0);
}
function rp(e) {
  const t = {};
  e === "event" && (t.durationThreshold = 0), Pt(
    e,
    (n) => {
      cn(e, { entries: n });
    },
    t
  );
}
function La(e, t) {
  Ht[e] = Ht[e] || [], Ht[e].push(t);
}
function xa(e, t, n) {
  return () => {
    n && n();
    const r = Ht[e];
    if (!r)
      return;
    const o = r.indexOf(t);
    o !== -1 && r.splice(o, 1);
  };
}
function op(e) {
  return "duration" in e;
}
function Ir(e) {
  return typeof e == "number" && isFinite(e);
}
function je(e, t, n, { ...r }) {
  const o = R(e).start_timestamp;
  return o && o > t && typeof e.updateStartTime == "function" && e.updateStartTime(t), _o(e, () => {
    const s = kt({
      startTime: t,
      ...r
    });
    return s && s.end(n), s;
  });
}
function Co(e) {
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
function C(e) {
  return e / 1e3;
}
function sp(e) {
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
function Ua(e) {
  try {
    return PerformanceObserver.supportedEntryTypes.includes(e);
  } catch {
    return !1;
  }
}
function $a(e, t) {
  let n, r = !1;
  function o(a) {
    !r && n && t(a, n), r = !0;
  }
  ko(() => {
    o("pagehide");
  });
  const s = e.on("beforeStartNavigationSpan", (a, c) => {
    c?.isRedirect || (o("navigation"), s(), i());
  }), i = e.on("afterStartPageLoadSpan", (a) => {
    n = a.spanContext().spanId, i();
  });
}
function ip(e) {
  let t = 0, n;
  if (!Ua("layout-shift"))
    return;
  const r = Pa(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  $a(e, (o, s) => {
    ap(t, n, s, o), r();
  });
}
function ap(e, t, n, r) {
  rn && h.log(`Sending CLS span (${e})`);
  const o = t ? C((re() || 0) + t.startTime) : U(), s = D().getScopeData().transactionName, i = t ? he(t.sources[0]?.node) : "Layout shift", a = {
    [P]: "auto.http.browser.cls",
    [Ae]: "ui.webvital.cls",
    [Dt]: 0,
    // attach the pageload span id to the CLS span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t?.sources && t.sources.forEach((u, l) => {
    a[`cls.source.${l + 1}`] = he(u.node);
  });
  const c = Co({
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
function cp(e) {
  let t = 0, n;
  if (!Ua("largest-contentful-paint"))
    return;
  const r = Ma(({ metric: o }) => {
    const s = o.entries[o.entries.length - 1];
    s && (t = o.value, n = s);
  }, !0);
  $a(e, (o, s) => {
    up(t, n, s, o), r();
  });
}
function up(e, t, n, r) {
  rn && h.log(`Sending LCP span (${e})`);
  const o = C((re() || 0) + (t?.startTime || 0)), s = D().getScopeData().transactionName, i = t ? he(t.element) : "Largest contentful paint", a = {
    [P]: "auto.http.browser.lcp",
    [Ae]: "ui.webvital.lcp",
    [Dt]: 0,
    // LCP is a point-in-time metric
    // attach the pageload span id to the LCP span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  t && (t.element && (a["lcp.element"] = he(t.element)), t.id && (a["lcp.id"] = t.id), t.url && (a["lcp.url"] = t.url.trim().slice(0, 200)), t.loadTime != null && (a["lcp.loadTime"] = t.loadTime), t.renderTime != null && (a["lcp.renderTime"] = t.renderTime), t.size != null && (a["lcp.size"] = t.size));
  const c = Co({
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
function oe(e) {
  return e && ((re() || performance.timeOrigin) + e) / 1e3;
}
function Ba(e) {
  const t = {};
  if (e.nextHopProtocol != null) {
    const { name: n, version: r } = sp(e.nextHopProtocol);
    t["network.protocol.version"] = r, t["network.protocol.name"] = n;
  }
  return re() || un()?.timeOrigin ? lp({
    ...t,
    "http.request.redirect_start": oe(e.redirectStart),
    "http.request.redirect_end": oe(e.redirectEnd),
    "http.request.worker_start": oe(e.workerStart),
    "http.request.fetch_start": oe(e.fetchStart),
    "http.request.domain_lookup_start": oe(e.domainLookupStart),
    "http.request.domain_lookup_end": oe(e.domainLookupEnd),
    "http.request.connect_start": oe(e.connectStart),
    "http.request.secure_connection_start": oe(e.secureConnectionStart),
    "http.request.connection_end": oe(e.connectEnd),
    "http.request.request_start": oe(e.requestStart),
    "http.request.response_start": oe(e.responseStart),
    "http.request.response_end": oe(e.responseEnd),
    // For TTFB we actually want the relative time from timeOrigin to responseStart
    // This way, TTFB always measures the "first page load" experience.
    // see: https://web.dev/articles/ttfb#measure-resource-requests
    "http.request.time_to_first_byte": e.responseStart != null ? e.responseStart / 1e3 : void 0
  }) : t;
}
function lp(e) {
  return Object.fromEntries(Object.entries(e).filter(([, t]) => t != null));
}
const dp = 2147483647;
let zs = 0, ue = {}, X, jn;
function fp({
  recordClsStandaloneSpans: e,
  recordLcpStandaloneSpans: t,
  client: n
}) {
  const r = un();
  if (r && re()) {
    r.mark && E.performance.mark("sentry-tracing-init");
    const o = t ? cp(n) : _p(), s = yp(), i = e ? ip(n) : hp();
    return () => {
      o?.(), s(), i?.();
    };
  }
  return () => {
  };
}
function pp() {
  It("longtask", ({ entries: e }) => {
    const t = Z();
    if (!t)
      return;
    const { op: n, start_timestamp: r } = R(t);
    for (const o of e) {
      const s = C(re() + o.startTime), i = C(o.duration);
      n === "navigation" && r && s < r || je(t, s, s + i, {
        name: "Main UI thread blocked",
        op: "ui.long-task",
        attributes: {
          [P]: "auto.ui.browser.metrics"
        }
      });
    }
  });
}
function mp() {
  new PerformanceObserver((t) => {
    const n = Z();
    if (n)
      for (const r of t.getEntries()) {
        if (!r.scripts[0])
          continue;
        const o = C(re() + r.startTime), { start_timestamp: s, op: i } = R(n);
        if (i === "navigation" && s && o < s)
          continue;
        const a = C(r.duration), c = {
          [P]: "auto.ui.browser.metrics"
        }, u = r.scripts[0], { invoker: l, invokerType: d, sourceURL: m, sourceFunctionName: f, sourceCharPosition: p } = u;
        c["browser.script.invoker"] = l, c["browser.script.invoker_type"] = d, m && (c["code.filepath"] = m), f && (c["code.function"] = f), p !== -1 && (c["browser.script.source_char_position"] = p), je(n, o, o + a, {
          name: "Main UI thread blocked",
          op: "ui.long-animation-frame",
          attributes: c
        });
      }
  }).observe({ type: "long-animation-frame", buffered: !0 });
}
function gp() {
  It("event", ({ entries: e }) => {
    const t = Z();
    if (t) {
      for (const n of e)
        if (n.name === "click") {
          const r = C(re() + n.startTime), o = C(n.duration), s = {
            name: he(n.target),
            op: `ui.interaction.${n.name}`,
            startTime: r,
            attributes: {
              [P]: "auto.ui.browser.metrics"
            }
          }, i = Ii(n.target);
          i && (s.attributes["ui.component_name"] = i), je(t, r, r + o, s);
        }
    }
  });
}
function hp() {
  return Pa(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (ue.cls = { value: e.value, unit: "" }, jn = t);
  }, !0);
}
function _p() {
  return Ma(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1];
    t && (ue.lcp = { value: e.value, unit: "millisecond" }, X = t);
  }, !0);
}
function yp() {
  return Xf(({ metric: e }) => {
    e.entries[e.entries.length - 1] && (ue.ttfb = { value: e.value, unit: "millisecond" });
  });
}
function Sp(e, t) {
  const n = un(), r = re();
  if (!n?.getEntries || !r)
    return;
  const o = C(r), s = n.getEntries(), { op: i, start_timestamp: a } = R(e);
  s.slice(zs).forEach((c) => {
    const u = C(c.startTime), l = C(
      // Inexplicably, Chrome sometimes emits a negative duration. We need to work around this.
      // There is a SO post attempting to explain this, but it leaves one with open questions: https://stackoverflow.com/questions/23191918/peformance-getentries-and-negative-duration-display
      // The way we clamp the value is probably not accurate, since we have observed this happen for things that may take a while to load, like for example the replay worker.
      // TODO: Investigate why this happens and how to properly mitigate. For now, this is a workaround to prevent transactions being dropped due to negative duration spans.
      Math.max(0, c.duration)
    );
    if (!(i === "navigation" && a && o + u < a))
      switch (c.entryType) {
        case "navigation": {
          vp(e, c, o);
          break;
        }
        case "mark":
        case "paint":
        case "measure": {
          Tp(e, c, u, l, o, t.ignorePerformanceApiSpans);
          const d = No(), m = c.startTime < d.firstHiddenTime;
          c.name === "first-paint" && m && (ue.fp = { value: c.startTime, unit: "millisecond" }), c.name === "first-contentful-paint" && m && (ue.fcp = { value: c.startTime, unit: "millisecond" });
          break;
        }
        case "resource": {
          wp(
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
  }), zs = Math.max(s.length - 1, 0), Ap(e), i === "pageload" && (Np(ue), t.recordClsOnPageloadSpan || delete ue.cls, t.recordLcpOnPageloadSpan || delete ue.lcp, Object.entries(ue).forEach(([c, u]) => {
    ul(c, u.value, u.unit);
  }), e.setAttribute("performance.timeOrigin", o), e.setAttribute("performance.activationStart", Ct()), Op(e, t)), X = void 0, jn = void 0, ue = {};
}
function Ep(e) {
  if (e?.entryType === "measure")
    try {
      return e.detail.devtools.track === "Components ⚛";
    } catch {
      return;
    }
}
function Tp(e, t, n, r, o, s) {
  if (Ep(t) || ["mark", "measure"].includes(t.entryType) && Ge(t.name, s))
    return;
  const i = sn(!1), a = C(i ? i.requestStart : 0), c = o + Math.max(n, a), u = o + n, l = u + r, d = {
    [P]: "auto.resource.browser.metrics"
  };
  c !== u && (d["sentry.browser.measure_happened_before_request"] = !0, d["sentry.browser.measure_start_time"] = c), bp(d, t), c <= l && je(e, c, l, {
    name: t.name,
    op: t.entryType,
    attributes: d
  });
}
function bp(e, t) {
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
function vp(e, t, n) {
  ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((r) => {
    _n(e, t, r, n);
  }), _n(e, t, "secureConnection", n, "TLS/SSL"), _n(e, t, "fetch", n, "cache"), _n(e, t, "domainLookup", n, "DNS"), Rp(e, t, n);
}
function _n(e, t, n, r, o = n) {
  const s = Ip(n), i = t[s], a = t[`${n}Start`];
  !a || !i || je(e, r + C(a), r + C(i), {
    op: `browser.${o}`,
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics",
      ...n === "redirect" && t.redirectCount != null ? { "http.redirect_count": t.redirectCount } : {}
    }
  });
}
function Ip(e) {
  return e === "secureConnection" ? "connectEnd" : e === "fetch" ? "domainLookupStart" : `${e}End`;
}
function Rp(e, t, n) {
  const r = n + C(t.requestStart), o = n + C(t.responseEnd), s = n + C(t.responseStart);
  t.responseEnd && (je(e, r, o, {
    op: "browser.request",
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics"
    }
  }), je(e, s, o, {
    op: "browser.response",
    name: t.name,
    attributes: {
      [P]: "auto.ui.browser.metrics"
    }
  }));
}
function wp(e, t, n, r, o, s, i) {
  if (t.initiatorType === "xmlhttprequest" || t.initiatorType === "fetch")
    return;
  const a = t.initiatorType ? `resource.${t.initiatorType}` : "resource.other";
  if (i?.includes(a))
    return;
  const c = {
    [P]: "auto.resource.browser.metrics"
  }, u = at(n);
  u.protocol && (c["url.scheme"] = u.protocol.split(":").pop()), u.host && (c["server.address"] = u.host), c["url.same_origin"] = n.includes(E.location.origin), Dp(t, c, [
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
  const l = { ...c, ...Ba(t) }, d = s + r, m = d + o;
  je(e, d, m, {
    name: n.replace(E.location.origin, ""),
    op: a,
    attributes: l
  });
}
function Ap(e) {
  const t = E.navigator;
  if (!t)
    return;
  const n = t.connection;
  n && (n.effectiveType && e.setAttribute("effectiveConnectionType", n.effectiveType), n.type && e.setAttribute("connectionType", n.type), Ir(n.rtt) && (ue["connection.rtt"] = { value: n.rtt, unit: "millisecond" })), Ir(t.deviceMemory) && e.setAttribute("deviceMemory", `${t.deviceMemory} GB`), Ir(t.hardwareConcurrency) && e.setAttribute("hardwareConcurrency", String(t.hardwareConcurrency));
}
function Op(e, t) {
  X && t.recordLcpOnPageloadSpan && (X.element && e.setAttribute("lcp.element", he(X.element)), X.id && e.setAttribute("lcp.id", X.id), X.url && e.setAttribute("lcp.url", X.url.trim().slice(0, 200)), X.loadTime != null && e.setAttribute("lcp.loadTime", X.loadTime), X.renderTime != null && e.setAttribute("lcp.renderTime", X.renderTime), e.setAttribute("lcp.size", X.size)), jn?.sources && t.recordClsOnPageloadSpan && jn.sources.forEach(
    (n, r) => e.setAttribute(`cls.source.${r + 1}`, he(n.node))
  );
}
function Dp(e, t, n) {
  n.forEach(([r, o]) => {
    const s = e[r];
    s != null && (typeof s == "number" && s < dp || typeof s == "string") && (t[o] = s);
  });
}
function Np(e) {
  const t = sn(!1);
  if (!t)
    return;
  const { responseStart: n, requestStart: r } = t;
  r <= n && (e["ttfb.requestTime"] = {
    value: n - r,
    unit: "millisecond"
  });
}
function kp() {
  return un() && re() ? It("element", Cp) : () => {
  };
}
const Cp = ({ entries: e }) => {
  const t = Z(), n = t ? V(t) : void 0, r = n ? R(n).description : D().getScopeData().transactionName;
  e.forEach((o) => {
    const s = o;
    if (!s.identifier)
      return;
    const i = s.name, a = s.renderTime, c = s.loadTime, [u, l] = c ? [C(c), "load-time"] : a ? [C(a), "render-time"] : [U(), "entry-emission"], d = i === "image-paint" ? (
      // for image paints, we can acually get a duration because image-paint entries also have a `loadTime`
      // and `renderTime`. `loadTime` is the time when the image finished loading and `renderTime` is the
      // time when the image finished rendering.
      C(Math.max(0, (a ?? 0) - (c ?? 0)))
    ) : (
      // for `'text-paint'` entries, we can't get a duration because the `loadTime` is always zero.
      0
    ), m = {
      [P]: "auto.ui.browser.elementtiming",
      [Ae]: "ui.elementtiming",
      // name must be user-entered, so we can assume low cardinality
      [ge]: "component",
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
}, Pp = 1e3;
let Ws, Zr, Qr;
function Mp(e) {
  const t = "dom";
  qe(t, e), ze(t, Lp);
}
function Lp() {
  if (!E.document)
    return;
  const e = se.bind(null, "dom"), t = Ys(e, !0);
  E.document.addEventListener("click", t, !1), E.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = E[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (te(o, "addEventListener", function(s) {
      return function(i, a, c) {
        if (i === "click" || i == "keypress")
          try {
            const u = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, l = u[i] = u[i] || { refCount: 0 };
            if (!l.handler) {
              const d = Ys(e);
              l.handler = d, s.call(this, i, d, c);
            }
            l.refCount++;
          } catch {
          }
        return s.call(this, i, a, c);
      };
    }), te(
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
function xp(e) {
  if (e.type !== Zr)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== Qr)
      return !1;
  } catch {
  }
  return !0;
}
function Up(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function Ys(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = $p(n);
    if (Up(n.type, r))
      return;
    ne(n, "_sentryCaptured", !0), r && !r._sentryId && ne(r, "_sentryId", ie());
    const o = n.type === "keypress" ? "input" : n.type;
    xp(n) || (e({ event: n, name: o, global: t }), Zr = n.type, Qr = r ? r._sentryId : void 0), clearTimeout(Ws), Ws = E.setTimeout(() => {
      Qr = void 0, Zr = void 0;
    }, Pp);
  };
}
function $p(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let yn;
function Po(e) {
  const t = "history";
  qe(t, e), ze(t, Bp);
}
function Bp() {
  if (E.addEventListener("popstate", () => {
    const t = E.location.href, n = yn;
    if (yn = t, n === t)
      return;
    se("history", { from: n, to: t });
  }), !uf())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = yn, s = Fp(String(r));
        if (yn = s, o === s)
          return t.apply(this, n);
        se("history", { from: o, to: s });
      }
      return t.apply(this, n);
    };
  }
  te(E.history, "pushState", e), te(E.history, "replaceState", e);
}
function Fp(e) {
  try {
    return new URL(e, E.location.origin).toString();
  } catch {
    return e;
  }
}
const On = {};
function Gp(e) {
  const t = On[e];
  if (t)
    return t;
  let n = E[e];
  if (Wr(n))
    return On[e] = n.bind(E);
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
  return n && (On[e] = n.bind(E));
}
function Hp(e) {
  On[e] = void 0;
}
const _t = "__sentry_xhr_v3__";
function Fa(e) {
  const t = "xhr";
  qe(t, e), ze(t, jp);
}
function jp() {
  if (!E.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), s = U() * 1e3, i = be(r[0]) ? r[0].toUpperCase() : void 0, a = qp(r[1]);
      if (!i || !a)
        return t.apply(n, r);
      n[_t] = {
        method: i,
        url: a,
        request_headers: {}
      }, i === "POST" && a.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const c = () => {
        const u = n[_t];
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
          se("xhr", l);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(u, l, d) {
          return c(), u.apply(l, d);
        }
      }) : n.addEventListener("readystatechange", c), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(u, l, d) {
          const [m, f] = d, p = l[_t];
          return p && be(m) && be(f) && (p.request_headers[m.toLowerCase()] = f), u.apply(l, d);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[_t];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const s = {
        startTimestamp: U() * 1e3,
        xhr: n
      };
      return se("xhr", s), t.apply(n, r);
    }
  });
}
function qp(e) {
  if (be(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function zp(e) {
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
const Rr = [], Dn = /* @__PURE__ */ new Map(), Wp = 60;
function Yp() {
  if (un() && re()) {
    const t = Vp();
    return () => {
      t();
    };
  }
  return () => {
  };
}
const Vs = {
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
  return Zf(Kp);
}
const Kp = ({ metric: e }) => {
  if (e.value == null)
    return;
  const t = C(e.value);
  if (t > Wp)
    return;
  const n = e.entries.find((p) => p.duration === e.value && Vs[p.name]);
  if (!n)
    return;
  const { interactionId: r } = n, o = Vs[n.name], s = C(re() + n.startTime), i = Z(), a = i ? V(i) : void 0, u = (r != null ? Dn.get(r) : void 0) || a, l = u ? R(u).description : D().getScopeData().transactionName, d = he(n.target), m = {
    [P]: "auto.http.browser.inp",
    [Ae]: `ui.interaction.${o}`,
    [Dt]: n.duration
  }, f = Co({
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
function Jp() {
  const e = ({ entries: t }) => {
    const n = Z(), r = n && V(n);
    t.forEach((o) => {
      if (!op(o) || !r)
        return;
      const s = o.interactionId;
      if (s != null && !Dn.has(s)) {
        if (Rr.length > 10) {
          const i = Rr.shift();
          Dn.delete(i);
        }
        Rr.push(s), Dn.set(s, r);
      }
    });
  };
  It("event", e), It("first-input", e);
}
function or(e, t = Gp("fetch")) {
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
      throw Hp("fetch"), c;
    } finally {
      n -= i, r--;
    }
  }
  return yd(e, o);
}
const Xp = 30, Zp = 50;
function eo(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? ct : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const Qp = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, em = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, tm = /\((\S*)(?::(\d+))(?::(\d+))\)/, nm = /at (.+?) ?\(data:(.+?),/, rm = (e) => {
  const t = e.match(nm);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = Qp.exec(e);
  if (n) {
    const [, o, s, i] = n;
    return eo(o, ct, +s, +i);
  }
  const r = em.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const a = tm.exec(r[2]);
      a && (r[2] = a[1], r[3] = a[2], r[4] = a[3]);
    }
    const [s, i] = Ga(r[1] || ct, r[2]);
    return eo(i, s, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, om = [Xp, rm], sm = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, im = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, am = (e) => {
  const t = sm.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const s = im.exec(t[3]);
      s && (t[1] = t[1] || "eval", t[3] = s[1], t[4] = s[2], t[5] = "");
    }
    let r = t[3], o = t[1] || ct;
    return [o, r] = Ga(o, r), eo(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, cm = [Zp, am], um = [om, cm], sr = Hc(...um), Ga = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : ct,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, de = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, Sn = 1024, lm = "Breadcrumbs", dm = (e = {}) => {
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
    name: lm,
    setup(n) {
      t.console && _a(gm(n)), t.dom && Mp(mm(n, t.dom)), t.xhr && Fa(hm(n)), t.fetch && Ta(_m(n)), t.history && Po(ym(n)), t.sentry && n.on("beforeSendEvent", pm(n));
    }
  };
}, fm = dm;
function pm(e) {
  return function(n) {
    w() === e && lt(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: nt(n)
      },
      {
        event: n
      }
    );
  };
}
function mm(e, t) {
  return function(r) {
    if (w() !== e)
      return;
    let o, s, i = typeof t == "object" ? t.serializeAttribute : void 0, a = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    a && a > Sn && (de && h.warn(
      `\`dom.maxStringLength\` cannot exceed ${Sn}, but a value of ${a} was configured. Sentry will use ${Sn} instead.`
    ), a = Sn), typeof i == "string" && (i = [i]);
    try {
      const u = r.event, l = Sm(u) ? u.target : u;
      o = he(l, { keyAttrs: i, maxStringLength: a }), s = Ii(l);
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
function gm(e) {
  return function(n) {
    if (w() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: jd(n.level),
      message: rs(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${rs(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    lt(r, {
      input: n.args,
      level: n.level
    });
  };
}
function hm(e) {
  return function(n) {
    if (w() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, s = n.xhr[_t];
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
      level: Ea(c)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", m, d), lt(m, d);
  };
}
function _m(e) {
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
          level: Ea(i.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", c, a), lt(c, a);
      }
  };
}
function ym(e) {
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
function Sm(e) {
  return !!e && !!e.target;
}
const Em = [
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
], Tm = "BrowserApiErrors", bm = (e = {}) => {
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
    name: Tm,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && te(A, "setTimeout", Ks), t.setInterval && te(A, "setInterval", Ks), t.requestAnimationFrame && te(A, "requestAnimationFrame", Im), t.XMLHttpRequest && "XMLHttpRequest" in A && te(XMLHttpRequest.prototype, "send", Rm);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : Em).forEach((o) => wm(o, t));
    }
  };
}, vm = bm;
function Ks(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = vt(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${Ie(e)}`
      }
    }), e.apply(this, t);
  };
}
function Im(e) {
  return function(t) {
    return e.apply(this, [
      vt(t, {
        mechanism: {
          data: {
            handler: Ie(e)
          },
          handled: !1,
          type: "auto.browser.browserapierrors.requestAnimationFrame"
        }
      })
    ]);
  };
}
function Rm(e) {
  return function(...t) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
      o in n && typeof n[o] == "function" && te(n, o, function(s) {
        const i = {
          mechanism: {
            data: {
              handler: Ie(s)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${o}`
          }
        }, a = uo(s);
        return a && (i.mechanism.data.handler = Ie(a)), vt(s, i);
      });
    }), e.apply(this, t);
  };
}
function wm(e, t) {
  const r = A[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (te(r, "addEventListener", function(o) {
    return function(s, i, a) {
      try {
        Am(i) && (i.handleEvent = vt(i.handleEvent, {
          mechanism: {
            data: {
              handler: Ie(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return t.unregisterOriginalCallbacks && Om(this, s, i), o.apply(this, [
        s,
        vt(i, {
          mechanism: {
            data: {
              handler: Ie(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        a
      ]);
    };
  }), te(r, "removeEventListener", function(o) {
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
function Am(e) {
  return typeof e.handleEvent == "function";
}
function Om(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const Dm = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof A.document > "u") {
      de && h.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    ws({ ignoreDuration: !0 }), As(), Po(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (ws({ ignoreDuration: !0 }), As());
    });
  }
}), Nm = "GlobalHandlers", km = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: Nm,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (Pm(n), Js("onerror")), t.onunhandledrejection && (Mm(n), Js("onunhandledrejection"));
    }
  };
}, Cm = km;
function Pm(e) {
  yi((t) => {
    const { stackParser: n, attachStacktrace: r } = Ha();
    if (w() !== e || va())
      return;
    const { msg: o, url: s, line: i, column: a, error: c } = t, u = Um(
      Ao(n, c || o, void 0, r, !1),
      s,
      i,
      a
    );
    u.level = "error", ta(u, {
      originalException: c,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function Mm(e) {
  Si((t) => {
    const { stackParser: n, attachStacktrace: r } = Ha();
    if (w() !== e || va())
      return;
    const o = Lm(t), s = ut(o) ? xm(o) : Ao(n, o, void 0, r, !0);
    s.level = "error", ta(s, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function Lm(e) {
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
function xm(e) {
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
function Um(e, t, n, r) {
  const o = e.exception = e.exception || {}, s = o.values = o.values || [], i = s[0] = s[0] || {}, a = i.stacktrace = i.stacktrace || {}, c = a.frames = a.frames || [], u = r, l = n, d = $m(t) ?? Kn();
  return c.length === 0 && c.push({
    colno: u,
    filename: d,
    function: ct,
    in_app: !0,
    lineno: l
  }), e;
}
function Js(e) {
  de && h.log(`Global Handler attached: ${e}`);
}
function Ha() {
  return w()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function $m(e) {
  if (!(!be(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const Bm = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!A.navigator && !A.location && !A.document)
      return;
    const t = Io(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), Fm = "cause", Gm = 5, Hm = "LinkedErrors", jm = (e = {}) => {
  const t = e.limit || Gm, n = e.key || Fm;
  return {
    name: Hm,
    preprocessEvent(r, o, s) {
      const i = s.getOptions();
      Gd(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        Ro,
        i.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, qm = jm;
function ir(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    Pd(),
    Dd(),
    vm(),
    fm(),
    Cm(),
    qm(),
    Wd(),
    Bm(),
    Dm()
  ];
}
function zm(e) {
  return e.split(",").some((t) => t.trim().startsWith("sentry-"));
}
function ja(e) {
  try {
    return new URL(e, A.location.origin).href;
  } catch {
    return;
  }
}
function Wm(e) {
  return e.entryType === "resource" && "initiatorType" in e && typeof e.nextHopProtocol == "string" && (e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest");
}
function qa(e) {
  try {
    return new Headers(e);
  } catch {
    return;
  }
}
const Xs = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new Map(), za = {
  traceFetch: !0,
  traceXHR: !0,
  enableHTTPTimings: !0,
  trackFetchStreamPerformance: !1
};
function Ym(e, t) {
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
    ...za,
    ...t
  }, l = typeof s == "function" ? s : (p) => !0, d = (p) => Vm(p, a), m = {}, f = e.getOptions().propagateTraceparent;
  n && (e.addEventProcessor((p) => (p.type === "transaction" && p.spans && p.spans.forEach((S) => {
    if (S.op === "http.client") {
      const y = wr.get(S.span_id);
      y && (S.timestamp = y / 1e3, wr.delete(S.span_id));
    }
  }), p)), o && ff((p) => {
    if (p.response) {
      const S = Xs.get(p.response);
      S && p.endTimestamp && wr.set(S, p.endTimestamp);
    }
  }), Ta((p) => {
    const S = Jd(p, l, d, m, {
      propagateTraceparent: f,
      onRequestSpanEnd: u
    });
    if (p.response && p.fetchData.__span && Xs.set(p.response, p.fetchData.__span), S) {
      const y = ja(p.fetchData.url), G = y ? at(y).host : void 0;
      S.setAttributes({
        "http.url": y,
        "server.address": G
      }), i && Zs(S), c?.(S, { headers: p.headers });
    }
  })), r && Fa((p) => {
    const S = Km(
      p,
      l,
      d,
      m,
      f,
      u
    );
    S && (i && Zs(S), c?.(S, {
      headers: qa(p.xhr.__sentry_xhr_v3__?.request_headers)
    }));
  });
}
function Zs(e) {
  const { url: t } = R(e).data;
  if (!t || typeof t != "string")
    return;
  const n = It("resource", ({ entries: r }) => {
    r.forEach((o) => {
      Wm(o) && o.name.endsWith(t) && (e.setAttributes(Ba(o)), setTimeout(n));
    });
  });
}
function Vm(e, t) {
  const n = Kn();
  if (n) {
    let r, o;
    try {
      r = new URL(e, n), o = new URL(n).origin;
    } catch {
      return !1;
    }
    const s = r.origin === o;
    return t ? Ge(r.toString(), t) || s && Ge(r.pathname, t) : s;
  } else {
    const r = !!e.match(/^\/(?!\/)/);
    return t ? Ge(e, t) : r;
  }
}
function Km(e, t, n, r, o, s) {
  const i = e.xhr, a = i?.[_t];
  if (!i || i.__sentry_own_request__ || !a)
    return;
  const { url: c, method: u } = a, l = le() && t(c);
  if (e.endTimestamp && l) {
    const G = i.__sentry_xhr_span_id__;
    if (!G) return;
    const W = r[G];
    W && a.status_code !== void 0 && (Pi(W, a.status_code), W.end(), s?.(W, {
      headers: qa(zp(i)),
      error: e.error
    }), delete r[G]);
    return;
  }
  const d = ja(c), m = at(d || c), f = Td(c), p = !!Z(), S = l && p ? kt({
    name: `${u} ${f}`,
    attributes: {
      url: c,
      type: "xhr",
      "http.method": u,
      "http.url": d,
      "server.address": m?.host,
      [P]: "auto.http.browser",
      [Ae]: "http.client",
      ...m?.search && { "http.query": m?.search },
      ...m?.hash && { "http.fragment": m?.hash }
    }
  }) : new He();
  i.__sentry_xhr_span_id__ = S.spanContext().spanId, r[i.__sentry_xhr_span_id__] = S, n(c) && Jm(
    i,
    // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
    // we do not want to use the span as base for the trace headers,
    // which means that the headers will be generated from the scope and the sampling decision is deferred
    le() && p ? S : void 0,
    o
  );
  const y = w();
  return y && y.emit("beforeOutgoingRequestSpan", S, e), S;
}
function Jm(e, t, n) {
  const { "sentry-trace": r, baggage: o, traceparent: s } = ha({ span: t, propagateTraceparent: n });
  r && Xm(e, r, o, s);
}
function Xm(e, t, n, r) {
  const o = e.__sentry_xhr_v3__?.request_headers;
  if (!(o?.["sentry-trace"] || !e.setRequestHeader))
    try {
      if (e.setRequestHeader("sentry-trace", t), r && !o?.traceparent && e.setRequestHeader("traceparent", r), n) {
        const s = o?.baggage;
        (!s || !zm(s)) && e.setRequestHeader("baggage", n);
      }
    } catch {
    }
}
function Zm() {
  A.document ? A.document.addEventListener("visibilitychange", () => {
    const e = Z();
    if (!e)
      return;
    const t = V(e);
    if (A.document.hidden && t) {
      const n = "cancelled", { op: r, status: o } = R(t);
      de && h.log(`[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`), o || t.setStatus({ code: x, message: n }), t.setAttribute("sentry.cancellation_reason", "document.hidden"), t.end();
    }
  }) : de && h.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
const Qm = 3600, Wa = "sentry_previous_trace", eg = "sentry.previous_trace";
function tg(e, {
  linkPreviousTrace: t,
  consistentTraceSampling: n
}) {
  const r = t === "session-storage";
  let o = r ? og() : void 0;
  e.on("spanStart", (i) => {
    if (V(i) !== i)
      return;
    const a = D().getPropagationContext();
    o = ng(o, i, a), r && rg(o);
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
        sampled: String(to(o.spanContext))
      },
      sampleRand: o.sampleRand
    }), i.parentSampled = to(o.spanContext), i.parentSampleRate = o.sampleRate, i.spanAttributes = {
      ...i.spanAttributes,
      [ki]: o.sampleRate
    };
  });
}
function ng(e, t, n) {
  const r = R(t);
  function o() {
    try {
      return Number(n.dsc?.sample_rate) ?? Number(r.data?.[lo]);
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
  return i.traceId === r.trace_id ? e : (Date.now() / 1e3 - e.startTimestamp <= Qm && (de && h.log(
    `Adding previous_trace ${i} link to span ${{
      op: r.op,
      ...t.spanContext()
    }}`
  ), t.addLink({
    context: i,
    attributes: {
      [mu]: "previous_trace"
    }
  }), t.setAttribute(
    eg,
    `${i.traceId}-${i.spanId}-${to(i) ? 1 : 0}`
  )), s);
}
function rg(e) {
  try {
    A.sessionStorage.setItem(Wa, JSON.stringify(e));
  } catch (t) {
    de && h.warn("Could not store previous trace in sessionStorage", t);
  }
}
function og() {
  try {
    const e = A.sessionStorage?.getItem(Wa);
    return JSON.parse(e);
  } catch {
    return;
  }
}
function to(e) {
  return e.traceFlags === 1;
}
const sg = "BrowserTracing", ig = {
  ...wn,
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
  ...za
}, ag = (e = {}) => {
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
    enableHTTPTimings: Ne,
    ignoreResourceSpans: Ve,
    ignorePerformanceApiSpans: gt,
    instrumentPageLoad: ht,
    instrumentNavigation: b,
    detectRedirects: M,
    linkPreviousTrace: ke,
    consistentTraceSampling: _e,
    enableReportPageLoaded: Y,
    onRequestSpanStart: ye,
    onRequestSpanEnd: L
  } = {
    ...ig,
    ...e
  };
  let Ke, Je, ae;
  function Ce(O, H, I = !0) {
    const Q = H.op === "pageload", ee = H.name, ce = l ? l(H) : H, Xe = ce.attributes || {};
    if (ee !== ce.name && (Xe[ge] = "custom", ce.attributes = Xe), !I) {
      const Lt = pt();
      kt({
        ...ce,
        startTime: Lt
      }).end(Lt);
      return;
    }
    t.name = ce.name, t.source = Xe[ge];
    const Se = ea(ce, {
      idleTimeout: d,
      finalTimeout: m,
      childSpanTimeout: f,
      // should wait for finish signal if it's a pageload transaction
      disableAutoFinish: Q,
      beforeSpanEnd: (Lt) => {
        Ke?.(), Sp(Lt, {
          recordClsOnPageloadSpan: !c,
          recordLcpOnPageloadSpan: !u,
          ignoreResourceSpans: Ve,
          ignorePerformanceApiSpans: gt
        }), ei(O, void 0);
        const Xo = D(), Mc = Xo.getPropagationContext();
        Xo.setPropagationContext({
          ...Mc,
          traceId: Se.spanContext().traceId,
          sampled: Ye(Se),
          dsc: Oe(Lt)
        }), Q && (ae = void 0);
      },
      trimIdleSpanEndTimestamp: !Y
    });
    Q && Y && (ae = Se), ei(O, Se);
    function Jo() {
      n && ["interactive", "complete"].includes(n.readyState) && O.emit("idleSpanEnableAutoFinish", Se);
    }
    Q && !Y && n && (n.addEventListener("readystatechange", () => {
      Jo();
    }), Jo());
  }
  return {
    name: sg,
    setup(O) {
      if (Hu(), Ke = fp({
        recordClsStandaloneSpans: c || !1,
        recordLcpStandaloneSpans: u || !1,
        client: O
      }), r && Yp(), o && kp(), i && v.PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("long-animation-frame") ? mp() : s && pp(), a && gp(), M && n) {
        const I = () => {
          Je = U();
        };
        addEventListener("click", I, { capture: !0 }), addEventListener("keydown", I, { capture: !0, passive: !0 });
      }
      function H() {
        const I = Kt(O);
        I && !R(I).timestamp && (de && h.log(`[Tracing] Finishing current active span with op: ${R(I).op}`), I.setAttribute(zt, "cancelled"), I.end());
      }
      O.on("startNavigationSpan", (I, Q) => {
        if (w() !== O)
          return;
        if (Q?.isRedirect) {
          de && h.warn("[Tracing] Detected redirect, navigation span will not be the root span, but a child span."), Ce(
            O,
            {
              op: "navigation.redirect",
              ...I
            },
            !1
          );
          return;
        }
        Je = void 0, H(), We().setPropagationContext({
          traceId: we(),
          sampleRand: Math.random(),
          propagationSpanId: le() ? void 0 : ve()
        });
        const ee = D();
        ee.setPropagationContext({
          traceId: we(),
          sampleRand: Math.random(),
          propagationSpanId: le() ? void 0 : ve()
        }), ee.setSDKProcessingMetadata({
          normalizedRequest: void 0
        }), Ce(O, {
          op: "navigation",
          ...I,
          // Navigation starts a new trace and is NOT parented under any active interaction (e.g. ui.action.click)
          parentSpan: null,
          forceTransaction: !0
        });
      }), O.on("startPageLoadSpan", (I, Q = {}) => {
        if (w() !== O)
          return;
        H();
        const ee = Q.sentryTrace || Qs("sentry-trace"), ce = Q.baggage || Qs("baggage"), Xe = Mu(ee, ce), Se = D();
        Se.setPropagationContext(Xe), le() || (Se.getPropagationContext().propagationSpanId = ve()), Se.setSDKProcessingMetadata({
          normalizedRequest: Io()
        }), Ce(O, {
          op: "pageload",
          ...I
        });
      }), O.on("endPageloadSpan", () => {
        Y && ae && (ae.setAttribute(zt, "reportPageLoaded"), ae.end());
      });
    },
    afterAllSetup(O) {
      let H = Kn();
      if (ke !== "off" && tg(O, { linkPreviousTrace: ke, consistentTraceSampling: _e }), A.location) {
        if (ht) {
          const I = re();
          cg(O, {
            name: A.location.pathname,
            // pageload should always start at timeOrigin (and needs to be in s, not ms)
            startTime: I ? I / 1e3 : void 0,
            attributes: {
              [ge]: "url",
              [P]: "auto.pageload.browser"
            }
          });
        }
        b && Po(({ to: I, from: Q }) => {
          if (Q === void 0 && H?.indexOf(I) !== -1) {
            H = void 0;
            return;
          }
          H = void 0;
          const ee = ga(I), ce = Kt(O), Xe = ce && M && dg(ce, Je);
          ug(
            O,
            {
              name: ee?.pathname || A.location.pathname,
              attributes: {
                [ge]: "url",
                [P]: "auto.navigation.browser"
              }
            },
            { url: I, isRedirect: Xe }
          );
        });
      }
      p && Zm(), a && lg(O, d, m, f, t), r && Jp(), Ym(O, {
        traceFetch: S,
        traceXHR: y,
        trackFetchStreamPerformance: G,
        tracePropagationTargets: O.getOptions().tracePropagationTargets,
        shouldCreateSpanForRequest: W,
        enableHTTPTimings: Ne,
        onRequestSpanStart: ye,
        onRequestSpanEnd: L
      });
    }
  };
};
function cg(e, t, n) {
  e.emit("startPageLoadSpan", t, n), D().setTransactionName(t.name);
  const r = Kt(e);
  return r && e.emit("afterStartPageLoadSpan", r), r;
}
function ug(e, t, n) {
  const { url: r, isRedirect: o } = n || {};
  e.emit("beforeStartNavigationSpan", t, { isRedirect: o }), e.emit("startNavigationSpan", t, { isRedirect: o });
  const s = D();
  return s.setTransactionName(t.name), r && !o && s.setSDKProcessingMetadata({
    normalizedRequest: {
      ...Io(),
      url: r
    }
  }), Kt(e);
}
function Qs(e) {
  return A.document?.querySelector(`meta[name=${e}]`)?.getAttribute("content") || void 0;
}
function lg(e, t, n, r, o) {
  const s = A.document;
  let i;
  const a = () => {
    const c = "ui.action.click", u = Kt(e);
    if (u) {
      const l = R(u).op;
      if (["navigation", "pageload"].includes(l)) {
        de && h.warn(`[Tracing] Did not create ${c} span because a pageload or navigation span is in progress.`);
        return;
      }
    }
    if (i && (i.setAttribute(zt, "interactionInterrupted"), i.end(), i = void 0), !o.name) {
      de && h.warn(`[Tracing] Did not create ${c} transaction because _latestRouteName is missing.`);
      return;
    }
    i = ea(
      {
        name: o.name,
        op: c,
        attributes: {
          [ge]: o.source || "url"
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
const Ya = "_sentry_idleSpan";
function Kt(e) {
  return e[Ya];
}
function ei(e, t) {
  ne(e, Ya, t);
}
const ti = 1.5;
function dg(e, t) {
  const n = R(e), r = pt(), o = n.start_timestamp;
  return !(r - o > ti || t && r - t <= ti);
}
const fg = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 }, Va = "", no = "", dt = () => {
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
}, ar = () => (dt() === "development" && console.warn("[Sentry] Missing DSN configuration. Set VITE_SENTRY_DSN_REACT and VITE_SENTRY_DSN_BROWSER in .env file."), !1), Jt = () => {
  const e = dt();
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
function cr(e) {
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
  ...Jt(),
  sendDefaultPii: !1,
  // Configurable via environment variable
  initialScope: {
    tags: {
      context: "background",
      type: "service-worker"
    }
  }
}), gg = () => ({
  ...Jt(),
  initialScope: {
    tags: {
      context: "popup",
      type: "react-ui"
    }
  }
}), hg = () => ({
  ...Jt(),
  initialScope: {
    tags: {
      context: "options",
      type: "react-ui"
    }
  }
}), _g = () => {
  const e = dt();
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
function ur() {
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
let ni = !1, Ar = null, Or = null, En = !1;
function yg() {
  if (ni && Ar && Or)
    return { client: Ar, scope: Or };
  if (!ar())
    return { client: null, scope: new k() };
  try {
    const e = mg(), t = ir({}), n = cr(t);
    try {
      const a = vo({ levels: ["warn", "error"] });
      n.push(a);
    } catch (a) {
      console.warn("[v0][Sentry] Console logging integration not available:", a);
    }
    const r = new tr({
      dsn: no,
      transport: or,
      stackParser: sr,
      integrations: n,
      ...e
    }), o = new k();
    o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([a, c]) => {
      o.setTag(a, c);
    }), r.init(), Ar = r, Or = o, ni = !0;
    const i = dt() === "development";
    if (i && (console.log("[v0][Sentry] Background service worker monitoring initialized with isolated client"), console.log("[v0][Sentry] Environment:", e.environment), console.log("[v0][Sentry] Release:", e.release), console.log("[v0][Sentry] DSN:", no), console.log("[v0][Sentry] sendDefaultPii:", e.sendDefaultPii), console.log("[v0][Sentry] Client initialized:", !!r)), i && !En)
      try {
        (async () => {
          try {
            let a = !1;
            typeof chrome < "u" && chrome.storage?.session && (a = (await chrome.storage.session.get("sentry_test_message_sent")).sentry_test_message_sent === !0), a || (o.captureMessage("[v0][Sentry] Background worker connected successfully", "info"), console.log("[v0][Sentry] Test message sent to verify connection"), En = !0, typeof chrome < "u" && chrome.storage?.session && chrome.storage.session.set({ sentry_test_message_sent: !0 }).catch(() => {
            }));
          } catch {
            En || (o.captureMessage("[v0][Sentry] Background worker connected successfully", "info"), console.log("[v0][Sentry] Test message sent to verify connection"), En = !0);
          }
        })();
      } catch (a) {
        console.warn("[v0][Sentry] Test message failed:", a);
      }
    return { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in background worker:", e), console.warn("[v0][Sentry] Extension will continue without Sentry monitoring"), { client: null, scope: new k() };
  }
}
const { client: Qe, scope: J } = yg(), N = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!J || !Qe))
      return J.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!J || !Qe))
      return J.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!J || !Qe))
        return Zn(e, t, { scope: J });
    },
    warn: (e, t) => {
      if (!(!J || !Qe))
        return Qn(e, t, { scope: J });
    },
    error: (e, t) => {
      if (!(!J || !Qe))
        return er(e, t, { scope: J });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !J || !Qe ? t(ur()) : nn({ ...e, scope: J }, t),
  // Get client (for advanced usage)
  getClient: () => Qe,
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
}, me = {
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
}, De = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, Sg = 0.5, ro = 0.5, $ = {
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
function Mo(e) {
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
function Lo(e) {
  return `||${e}`;
}
async function Ja() {
  try {
    const t = (await chrome.storage.sync.get(g.SETTINGS))[g.SETTINGS] || me;
    return {
      debugDNR: t.debugDNR ?? me.debugDNR ?? !1,
      debugTracking: t.debugTracking ?? me.debugTracking ?? !1,
      debugContentAnalysis: t.debugContentAnalysis ?? me.debugContentAnalysis ?? !1,
      debugPomodoro: t.debugPomodoro ?? me.debugPomodoro ?? !1,
      debugZenMode: t.debugZenMode ?? me.debugZenMode ?? !1
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
async function Xa() {
  return (await Ja()).debugDNR;
}
let oo = null;
function Eg() {
  return oo === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : oo;
}
async function Za() {
  oo = await Ja();
}
function rt() {
  return Eg().debugTracking;
}
let xo = null, ri = !1, oi = !1;
const Tg = 3e3, bg = 1e3;
function Uo(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % bg;
  return Tg + n;
}
async function vg() {
  if (oi) return;
  oi = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(z.DAILY_SYNC);
  const e = /* @__PURE__ */ new Date(), t = new Date(e);
  t.setHours(24, 0, 0, 0);
  const n = t.getTime() - e.getTime(), r = Date.now() + Math.max(n, 6e4);
  await chrome.alarms.create(z.DAILY_SYNC, {
    when: r,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(r - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (o) => {
    o.name === z.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await Ig());
  });
}
async function Ig() {
  const { [g.TIME_LIMITS]: e = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  );
  if (!Array.isArray(e) || e.length === 0) return;
  const t = e.map((n) => Uo(n.domain));
  if (t.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: t }), console.log(`[v0] Cleared ${t.length} time limit session rules.`);
    } catch (n) {
      console.error("[v0] Error clearing time limit session rules:", n);
    }
}
async function Rg() {
  ri || (ri = !0, console.log("[v0] Initializing usage tracker module"), await Za(), await chrome.alarms.clear(z.USAGE_TRACKER), await chrome.alarms.create(z.USAGE_TRACKER, {
    periodInMinutes: ro
  }), chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === z.USAGE_TRACKER && await lr();
  }), chrome.tabs.onActivated.addListener(wg), chrome.tabs.onUpdated.addListener(Ag), chrome.windows.onFocusChanged.addListener(Og), await Qa());
}
async function wg(e) {
  await lr();
  try {
    const t = await chrome.tabs.get(e.tabId);
    await $o(t.id, t.url);
  } catch (t) {
    console.warn(`[v0] Could not get tab info for tabId: ${e.tabId}`, t), await dn();
  }
}
async function Ag(e, t) {
  e === xo && t.url && t.status === "complete" && (await lr(), await $o(e, t.url));
}
async function Og(e) {
  e === chrome.windows.WINDOW_ID_NONE ? (await lr(), await dn()) : await Qa();
}
async function Qa() {
  const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  e?.id && e.url ? await $o(e.id, e.url) : await dn();
}
async function $o(e, t) {
  if (!e || !t || t.startsWith("chrome://") || t.startsWith("chrome-extension://") || t.startsWith("about:")) {
    await dn();
    return;
  }
  xo = e;
  const n = Date.now(), r = {
    url: t,
    startTime: n,
    lastUpdate: n
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: r });
}
async function dn() {
  xo = null, await chrome.storage.session.remove(g.CURRENTLY_TRACKING);
}
async function lr() {
  const t = (await chrome.storage.session.get(g.CURRENTLY_TRACKING))[g.CURRENTLY_TRACKING];
  if (!t || !t.url || !t.startTime) {
    rt() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: t });
    return;
  }
  const n = Mo(t.url);
  if (!n) {
    rt() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: t.url }), await dn();
    return;
  }
  const r = Date.now(), o = Math.floor((r - t.startTime) / 1e3), s = t.lastUpdate || t.startTime, i = r - s, a = ro * 60 * 1e3 * 2;
  if (i > a && (rt() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(i / 1e3),
    maxGapMs: Math.floor(a / 1e3),
    domain: n,
    url: t.url
  }), t.startTime = r - ro * 60 * 1e3), rt() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: n,
    timeSpent: o,
    url: t.url,
    startTime: new Date(t.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: i > a
  }), t.startTime = r, t.lastUpdate = r, await chrome.storage.session.set({ [g.CURRENTLY_TRACKING]: t }), o < 1) {
    rt() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
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
  l[c].perDomain || (l[c].perDomain = {}), l[c].perDomain[n] = (l[c].perDomain[n] || 0) + o, l[c].totalMinutes = Object.values(l[c].perDomain).reduce((d, m) => d + (typeof m == "number" ? m : 0), 0) / 60, await chrome.storage.local.set({ [g.DAILY_USAGE]: l }), console.log("[v0] Recorded usage:", n, o, "seconds"), await F(), await ec(n, l[c].perDomain[n]);
}
async function ec(e, t) {
  const { [g.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = (Array.isArray(n) ? n : []).find((a) => a.domain === e);
  if (!o) return;
  const s = o.dailyMinutes ?? o.limitMinutes ?? 0, i = s * 60;
  if (t >= i) {
    const a = Uo(e);
    try {
      rt() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: e,
        totalSecondsToday: t,
        limitSeconds: i,
        limitMinutes: s,
        exceeded: t >= i
      });
      const c = Lo(e), u = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(e)}`);
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
      }, d = await Xa();
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
        p.length > 0 && p[0].id && p[0].url && Mo(p[0].url) === e && (await chrome.tabs.update(p[0].id, { url: u }), console.log(`[v0] Redirected active tab ${p[0].id} to blocked page for ${e}`), rt() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
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
      const { createNotification: f } = await Promise.resolve().then(() => dr);
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
  const n = ln(e);
  if (!n) return;
  const { [g.TIME_LIMITS]: r = [] } = await chrome.storage.local.get(
    g.TIME_LIMITS
  ), o = Array.isArray(r) ? r : [], s = o.findIndex((a) => a.domain === n), i = Uo(n);
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
      await ec(n, u);
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
const yt = "__contentSuggestNotified__", Ng = 24 * 60 * 60 * 1e3;
async function tc() {
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
    const { [yt]: e = {} } = await chrome.storage.session.get(yt), t = Date.now(), n = await tc();
    let r = !1;
    for (const o of Object.keys(e || {}))
      (typeof e[o] != "number" || t - e[o] > n) && (delete e[o], r = !0);
    r && await chrome.storage.session.set({ [yt]: e });
  } catch (e) {
    console.warn("[v0] Unable to prune notify cache:", e);
  }
}
async function Cg(e) {
  try {
    const t = await tc(), { [yt]: n = {} } = await chrome.storage.session.get(yt), r = n?.[e], o = Date.now();
    return r && o - r < t ? !1 : (await chrome.storage.session.set({
      [yt]: { ...n || {}, [e]: o }
    }), !0);
  } catch {
    return !0;
  }
}
async function Pg(e) {
  try {
    if (console.log("[v0] Content analysis result:", e), !await Mg() || !(e.classification === "distracting" && e.score > Sg) || !e?.url) return;
    const t = Mo(e.url);
    if (!t) return;
    const { [g.BLACKLIST]: n = [] } = await chrome.storage.local.get(
      g.BLACKLIST
    );
    if (n.some((s) => s.domain === t) || !await Cg(t))
      return;
    const { createNotification: o } = await Promise.resolve().then(() => dr);
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
let si = "";
async function F() {
  try {
    const e = await Bo(), t = JSON.stringify(e, (n, r) => {
      if (r && typeof r == "object" && !Array.isArray(r)) {
        const o = {};
        return Object.keys(r).sort().forEach((s) => {
          o[s] = r[s];
        }), o;
      }
      return r;
    });
    if (t === si)
      return;
    si = t, chrome.runtime.sendMessage({ type: $.STATE_UPDATED, payload: { state: e } }, (n) => {
      const r = chrome.runtime.lastError, o = r?.message ?? "", i = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((a) => o === a || o.startsWith(a));
      r && !i && console.warn("[v0] notifyStateUpdate lastError:", r.message);
    });
    try {
      for (const n of Nn)
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
async function Mg() {
  const { getNotificationSetting: e } = await Promise.resolve().then(() => dr);
  return await e();
}
async function Bo() {
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
      config: De,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: t[g.SITE_CUSTOMIZATIONS] || {},
    settings: n[g.SETTINGS] || me
  };
}
const Nn = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((e) => {
  try {
    Nn.add(e), Bo().then((t) => {
      try {
        e.postMessage({ type: $.STATE_UPDATED, payload: { state: t } });
      } catch {
      }
    }).catch(() => {
    }), e.onDisconnect.addListener(() => {
      Nn.delete(e);
    });
  } catch {
    try {
      Nn.delete(e);
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
      const r = (o, s) => {
        if (n && typeof n.setAttribute == "function") {
          const i = typeof s == "string" || typeof s == "number" || typeof s == "boolean" ? s : String(s);
          n.setAttribute(o, i);
        }
      };
      try {
        console.log("[v0] DEBUG: Message handler - type:", e.type), console.log("[v0] DEBUG: Message handler - payload:", e.payload), console.log("[v0] DEBUG: Message handler - sender:", t), r("message_type", e.type), r("has_payload", !!e.payload), r("sender_id", t.id || "unknown"), r("sender_url", t.url || "unknown");
        let o;
        switch (e.type) {
          case $.GET_INITIAL_STATE: {
            o = await Bo();
            break;
          }
          case $.ADD_TO_BLACKLIST: {
            const s = e.payload?.domain;
            typeof s == "string" && (await Go(s), r("domain", s)), await F(), o = { success: !0 };
            break;
          }
          case $.REMOVE_FROM_BLACKLIST: {
            const s = e.payload?.domain;
            typeof s == "string" && await oc(s), await F(), o = { success: !0 };
            break;
          }
          case $.POMODORO_START: {
            const s = e.payload;
            console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(s)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(s?.config));
            const i = s?.config || s;
            console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(i)), await Bg(i), o = { success: !0 };
            break;
          }
          case $.POMODORO_STOP: {
            await uc(), o = { success: !0 };
            break;
          }
          case $.POMODORO_PAUSE: {
            await Fg(), o = { success: !0 };
            break;
          }
          case $.POMODORO_RESUME: {
            await Gg(), o = { success: !0 };
            break;
          }
          case $.START_BREAK: {
            await lc(), o = { success: !0 };
            break;
          }
          case $.TIME_LIMIT_SET: {
            const s = e.payload, i = s?.domain, a = s?.dailyMinutes ?? s?.limitMinutes;
            typeof i == "string" && typeof a == "number" && await Dg(i, a), await F(), o = { success: !0 };
            break;
          }
          case $.CONTENT_ANALYSIS_RESULT: {
            await Pg(e.payload?.result), await F(), o = { success: !0 };
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
        }), r("success", !1), N.captureException(o instanceof Error ? o : new Error(String(o))), o;
      }
    }
  );
}
const Ee = 1e3, B = 2e3, Le = 1e3, Te = 1e4;
let Dr = Promise.resolve();
function Fo(e) {
  return Dr = Dr.then(e, e), Dr;
}
function ii(e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e.charCodeAt(r);
    t = (t << 5) - t + o, t |= 0;
  }
  const n = Math.abs(t) % Le;
  return B + n;
}
async function nc() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Blocker" },
    async (e) => {
      const t = (n, r) => {
        if (e && typeof e.setAttribute == "function") {
          const o = typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? r : String(r);
          e.setAttribute(n, o);
        }
      };
      try {
        console.log("[v0] Initializing blocker module"), N.logger.info("Blocker module initializing"), await Za(), await Ho(), N.logger.info("Blocker module initialized successfully"), t("success", !0);
      } catch (n) {
        throw N.logger.error("Failed to initialize blocker module", { error: n }), t("success", !1), N.captureException(n instanceof Error ? n : new Error(String(n))), n;
      }
    }
  );
}
async function rc() {
  return N.startSpan(
    { op: "dnr.cleanup", name: "Cleanup All DNR Rules" },
    async (e) => {
      const t = (n, r) => {
        if (e && typeof e.setAttribute == "function") {
          const o = typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? r : String(r);
          e.setAttribute(n, o);
        }
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
        console.error("[v0] Error during DNR cleanup:", n), t("success", !1), N.logger.error("DNR cleanup failed", { error: n }), N.captureException(n instanceof Error ? n : new Error(String(n)));
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
async function Go(e) {
  return N.startSpan(
    { op: "blocker.add", name: "Add to Blacklist" },
    async (t) => {
      const n = (r, o) => {
        if (t && typeof t.setAttribute == "function") {
          const s = typeof o == "string" || typeof o == "number" || typeof o == "boolean" ? o : String(o);
          t.setAttribute(r, s);
        }
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
        await chrome.storage.local.set({ [g.BLACKLIST]: a }), await Ho(), await F(), console.log("[v0] Added to blacklist:", s), N.logger.info("Domain added to blacklist", {
          domain: s,
          blacklist_size: a.length
        }), n("success", !0), n("blacklist_size", a.length);
      } catch (r) {
        throw N.logger.error("Failed to add domain to blacklist", { domain: e, error: r }), n("success", !1), N.captureException(r instanceof Error ? r : new Error(String(r))), r;
      }
    }
  );
}
async function oc(e) {
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
    await chrome.storage.local.set({ [g.BLACKLIST]: o }), await Ho(), await F(), console.log("[v0] Removed from blacklist:", r);
  }
}
async function Ho() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", e), Fo(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const t = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", t.length, "existing DNR rules");
    const n = new Set(
      t.map((i) => i.id).filter(
        (i) => i >= B && i < B + Le || i >= B + Te && i < B + Te + Le
      )
    ), r = [], o = /* @__PURE__ */ new Set();
    for (const i of e) {
      const a = ln(i.domain);
      if (!a) continue;
      let c = ii(a), u = 0;
      const l = Le;
      for (; o.has(c) || n.has(c); ) {
        if (u++, u >= l) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${a}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        c++, c >= B + Le && (c = B);
      }
      if (u >= l) {
        console.warn(`[v0] Skipping rule for ${a} - no free ID found`);
        continue;
      }
      if (o.add(c), !n.has(c)) {
        const d = Lo(a);
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
        const f = c + Te;
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
      (i) => !o.has(i) && !o.has(i - Te)
    );
    if (console.log("[v0] DEBUG: Rules to add:", r.length), console.log("[v0] DEBUG: Rules to remove:", s.length), r.length > 0 || s.length > 0) {
      const i = await Xa();
      i && (console.log("[DNR-DEBUG] Blacklist domains:", e.map((l) => l.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", r.map((l) => ({
        id: l.id,
        regex: l.condition.regexFilter,
        domain: e.find((d) => ii(d.domain) === l.id)?.domain
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
      const a = await chrome.declarativeNetRequest.getDynamicRules(), c = a.filter((l) => l.id >= B && l.id < B + Le), u = a.filter((l) => l.id >= Ee && l.id < B);
      if (console.log(`[v0] DNR Verification: ${c.length} blacklist rules, ${u.length} pomodoro rules`), r.length > 0 && c.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), i) {
        const l = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", l), console.log("[DNR-DEBUG] Total rules count:", l.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: l.filter((d) => d.id >= Ee && d.id < B).length,
          blacklist: l.filter((d) => d.id >= B && d.id < B + Le).length,
          other: l.filter((d) => d.id < Ee || d.id >= B + Le).length
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
async function jo() {
  const { [g.BLACKLIST]: e = [] } = await chrome.storage.local.get(
    g.BLACKLIST
  );
  if (!Array.isArray(e) || e.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const t = [];
  return e.forEach((n, r) => {
    const o = ln(n.domain), s = Lo(o), i = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(o)}`);
    t.push({
      id: Ee + r,
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
      id: Ee + r + Te,
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
  }), Fo(async () => {
    const r = (await chrome.declarativeNetRequest.getDynamicRules()).map((s) => s.id).filter(
      (s) => s >= Ee && s < B || s >= Ee + Te && s < B + Te
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
async function qo() {
  return Fo(async () => {
    const t = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter(
      (n) => n >= Ee && n < B || n >= Ee + Te && n < B + Te
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
const sc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: Go,
  cleanupAllDNRRules: rc,
  debugDNRStatus: xg,
  disablePomodoroBlocking: qo,
  enablePomodoroBlocking: jo,
  initializeBlocker: nc,
  removeFromBlacklist: oc
}, Symbol.toStringTag, { value: "Module" }));
function ic() {
  const e = "icons/icon48.png", t = chrome.runtime.getURL(e);
  return console.debug("[v0][Notifications] Icon URL resolved:", { iconPath: e, iconUrl: t }), t;
}
async function ac() {
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
async function cc() {
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
    return me.notifications ?? me.notificationsEnabled ?? !0;
  } catch (e) {
    return console.error("[v0][Notifications] Error getting notification setting:", e), !1;
  }
}
async function qn(e) {
  console.log("[v0][Notifications] Creating notification:", {
    notificationId: e.notificationId,
    title: e.title,
    type: e.type || "basic",
    iconUrl: e.iconUrl || "(will use default)"
  });
  try {
    console.debug("[v0][Notifications] Verifying notification permission...");
    const t = await ac();
    if (console.debug("[v0][Notifications] Permission check result:", { hasPermission: t }), !t)
      return console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: e.notificationId,
        title: e.title
      }), null;
    console.debug("[v0][Notifications] Checking notification settings...");
    const n = await cc();
    if (console.debug("[v0][Notifications] Notification setting result:", { notificationsEnabled: n }), !n)
      return console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: e.notificationId,
        title: e.title
      }), null;
    const r = e.iconUrl || ic(), o = {
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
const dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createNotification: qn,
  getNotificationIconUrl: ic,
  getNotificationSetting: cc,
  verifyNotificationPermission: ac
}, Symbol.toStringTag, { value: "Module" }));
async function Ug() {
  return N.startSpan(
    { op: "module.init", name: "Initialize Pomodoro" },
    async (e) => {
      const t = (n, r) => {
        if (e && typeof e.setAttribute == "function") {
          const o = typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? r : String(r);
          e.setAttribute(n, o);
        }
      };
      try {
        console.log("[v0] Initializing Pomodoro module"), N.logger.info("Pomodoro module initializing"), await $g(), chrome.alarms.onAlarm.addListener(async (n) => {
          n.name === z.POMODORO && await zo();
        }), N.logger.info("Pomodoro module initialized successfully"), t("success", !0);
      } catch (n) {
        throw N.logger.error("Failed to initialize Pomodoro module", { error: n }), t("success", !1), N.captureException(n instanceof Error ? n : new Error(String(n))), n;
      }
    }
  );
}
async function $g() {
  try {
    const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
    if (!e?.state || e.state.phase === "idle")
      return;
    const t = e.state, n = e.config || De;
    if (!t.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await uc();
      return;
    }
    const r = /* @__PURE__ */ new Date(), o = new Date(t.endsAt), s = Math.max(0, o.getTime() - r.getTime());
    if (s <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await zo();
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
    s < 6e4 ? await chrome.alarms.create(z.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(z.POMODORO, { delayInMinutes: a }), t.phase === "focus" && await jo(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${c} minutes remaining`);
  } catch (e) {
    console.error("[v0] Pomodoro recovery failed:", e);
  }
}
async function Bg(e) {
  const { [g.POMODORO_STATUS]: t } = await chrome.storage.local.get(g.POMODORO_STATUS), n = t?.config || De, r = {
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
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: r, state: i } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", r.focusMinutes), await chrome.alarms.create(z.POMODORO, { delayInMinutes: r.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await jo(), await F();
  try {
    await qn({
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
async function uc() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS), t = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, n = e?.config || De;
  await chrome.storage.local.set({ [g.POMODORO_STATUS]: { config: n, state: t } }), await chrome.alarms.clear(z.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await qo(), await F(), console.log("[v0] Pomodoro stopped");
}
async function Fg() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || De;
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
async function Gg() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || !e.state.isPaused) return;
  const t = e.state, n = e.config || De, r = /* @__PURE__ */ new Date(), o = t.remainingMs || 0;
  if (o <= 0) {
    await zo();
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
async function lc() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state || e.state.phase !== "focus_complete") return;
  const t = e.state, n = e.config || De, r = t.pendingBreakType || "short", o = r === "long" ? n.longBreakMinutes : n.shortBreakMinutes, s = /* @__PURE__ */ new Date(), i = new Date(s.getTime() + o * 60 * 1e3), a = {
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
  }), await qo(), await F(), console.log("[v0] Break started:", a);
}
async function zo() {
  const { [g.POMODORO_STATUS]: e } = await chrome.storage.local.get(g.POMODORO_STATUS);
  if (!e?.state) return;
  const t = e.state, n = e.config || De;
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
      await qn({
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
      await qn({
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
  await chrome.alarms.create(z.DAILY_SYNC, {
    periodInMinutes: 1440
    // Once per day
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === z.DAILY_SYNC && await jg();
  });
}
async function jg() {
  console.log("[v0] Daily sync triggered (Firebase integration pending)");
  const { [g.DAILY_USAGE]: e = {} } = await chrome.storage.local.get(g.DAILY_USAGE), t = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = e[t];
  if (!n) return;
  const r = Object.values(n).reduce((s, i) => s + i, 0), o = Object.entries(n).sort(([, s], [, i]) => i - s).slice(0, 5).map(([s, i]) => ({ domain: s, time: i }));
  console.log("[v0] Daily summary:", { totalTime: r, topSites: o });
}
const qg = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
async function dc() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await Ug(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (e) {
    console.error("[v0] Failed to initialize Pomodoro:", e);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await nc(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
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
async function zg() {
  try {
    const { verifyNotificationPermission: e, createNotification: t } = await Promise.resolve().then(() => dr);
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
async function ai() {
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
function Wg(e) {
  return console.log("[v0] Extension installed/updated:", e.reason), Yg(e);
}
async function Yg(e) {
  console.log("[v0] Extension installed/updated:", e.reason), console.log("[v0] DEBUG: Installation reason:", e.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await rc(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
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
        config: De,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: me
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
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await ai(), console.log("[v0] DEBUG: Requesting notification permissions..."), await zg(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  e.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await ai()), console.log("[v0] DEBUG: Starting module initialization..."), await dc(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: e } = await Promise.resolve().then(() => sc);
  await e();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: e } = await Promise.resolve().then(() => sc);
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
const Vg = (() => {
  try {
    const e = qg;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t === "development" || n === "development" || e.VITE_SENTRY_TEST_EXPOSE === "true" || e.SENTRY_TEST_EXPOSE === "true") return !0;
    }
  } catch {
  }
  return !1;
})();
Vg && (globalThis.testSentryBackground = async () => {
  const { testSentryBackground: e } = await Promise.resolve().then(() => ui);
  await e();
}, globalThis.testSentryComprehensive = async () => {
  const { testSentryComprehensive: e } = await Promise.resolve().then(() => ui);
  await e("background");
});
function Kg() {
  return console.log("[v0] Extension started on browser startup"), dc();
}
function Jg() {
  chrome.runtime.onInstalled.addListener(Wg), chrome.runtime.onStartup.addListener(Kg), chrome.storage.onChanged.addListener((e, t) => {
    console.log(`[v0] Storage changed in ${t}:`, e), F();
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
        n && (await Go(n), console.log(`[v0] Added ${n} to blacklist from notification.`));
      } else e === "pomodoro-focus-complete" && t === 0 && (await lc(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(e);
    }
  });
}
Jg();
console.log("[v0] Service Worker loaded and listeners attached.");
const ci = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
let xt = null, Ut = null, $t = null, Bt = null;
async function fc() {
  let e = null;
  xt !== null && (clearTimeout(xt), xt = null);
  const t = await Promise.resolve().then(() => Ka), { Sentry: n } = t;
  e = n, console.log("[Sentry Test] Testing background error tracking...");
  try {
    n.startSpan(
      { op: "test", name: "Background Test Span" },
      (r) => {
        r.setAttribute("test_attribute", "test_value"), r.setAttribute("context", "background"), console.log("[Sentry Test] Span created"), n.logger.info("Background test log", {
          test: !0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }), console.log("[Sentry Test] Log sent");
      }
    ), xt = setTimeout(() => {
      try {
        throw new Error("Sentry Test Error - Background Context");
      } catch (r) {
        n.captureException(r instanceof Error ? r : new Error(String(r))), console.log("[Sentry Test] Error captured");
      }
      xt = null;
    }, 100);
  } catch (r) {
    e ? e.captureException(r instanceof Error ? r : new Error(String(r))) : console.error("[Sentry Test] Background test failed before Sentry loaded", r), console.log("[Sentry Test] Error captured");
  }
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Dashboard: https://sentry.io/issues/");
}
async function pc() {
  Ut !== null && (clearTimeout(Ut), Ut = null);
  const { Sentry: e } = await Promise.resolve().then(() => Nc);
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
async function mc() {
  $t !== null && (clearTimeout($t), $t = null);
  const { Sentry: e } = await Promise.resolve().then(() => Cc);
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
async function gc() {
  Bt !== null && (clearTimeout(Bt), Bt = null);
  const { Sentry: e } = await Promise.resolve().then(() => Pc);
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
async function hc(e) {
  let t;
  switch (e) {
    case "background":
      t = (await Promise.resolve().then(() => Ka)).Sentry;
      break;
    case "popup":
      t = (await Promise.resolve().then(() => Nc)).Sentry;
      break;
    case "options":
      t = (await Promise.resolve().then(() => Cc)).Sentry;
      break;
    case "content":
      t = (await Promise.resolve().then(() => Pc)).Sentry;
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
    const r = ci;
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
    const r = ci;
    r && (t = r.VITE_SENTRY_TEST_EXPOSE === "true" || // Also check without prefix for legacy support
    r.SENTRY_TEST_EXPOSE === "true");
  } catch {
  }
  (e || t) && (globalThis.testSentryBackground = fc, globalThis.testSentryPopup = pc, globalThis.testSentryOptions = mc, globalThis.testSentryContent = gc, globalThis.testSentryComprehensive = hc, console.log("[Sentry Test] Test functions exposed to globalThis (development mode)"));
}
const ui = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  testSentryBackground: fc,
  testSentryComprehensive: hc,
  testSentryContent: gc,
  testSentryOptions: mc,
  testSentryPopup: pc
}, Symbol.toStringTag, { value: "Module" }));
function Xg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var _c = { exports: {} }, fr = {}, yc = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fn = Symbol.for("react.element"), Zg = Symbol.for("react.portal"), Qg = Symbol.for("react.fragment"), eh = Symbol.for("react.strict_mode"), th = Symbol.for("react.profiler"), nh = Symbol.for("react.provider"), rh = Symbol.for("react.context"), oh = Symbol.for("react.forward_ref"), sh = Symbol.for("react.suspense"), ih = Symbol.for("react.memo"), ah = Symbol.for("react.lazy"), li = Symbol.iterator;
function ch(e) {
  return e === null || typeof e != "object" ? null : (e = li && e[li] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Sc = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, Ec = Object.assign, Tc = {};
function Mt(e, t, n) {
  this.props = e, this.context = t, this.refs = Tc, this.updater = n || Sc;
}
Mt.prototype.isReactComponent = {};
Mt.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Mt.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function bc() {
}
bc.prototype = Mt.prototype;
function Wo(e, t, n) {
  this.props = e, this.context = t, this.refs = Tc, this.updater = n || Sc;
}
var Yo = Wo.prototype = new bc();
Yo.constructor = Wo;
Ec(Yo, Mt.prototype);
Yo.isPureReactComponent = !0;
var di = Array.isArray, vc = Object.prototype.hasOwnProperty, Vo = { current: null }, Ic = { key: !0, ref: !0, __self: !0, __source: !0 };
function Rc(e, t, n) {
  var r, o = {}, s = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (s = "" + t.key), t) vc.call(t, r) && !Ic.hasOwnProperty(r) && (o[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) o.children = n;
  else if (1 < a) {
    for (var c = Array(a), u = 0; u < a; u++) c[u] = arguments[u + 2];
    o.children = c;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) o[r] === void 0 && (o[r] = a[r]);
  return { $$typeof: fn, type: e, key: s, ref: i, props: o, _owner: Vo.current };
}
function uh(e, t) {
  return { $$typeof: fn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Ko(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fn;
}
function lh(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var fi = /\/+/g;
function Nr(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? lh("" + e.key) : t.toString(36);
}
function kn(e, t, n, r, o) {
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
        case Zg:
          i = !0;
      }
  }
  if (i) return i = e, o = o(i), e = r === "" ? "." + Nr(i, 0) : r, di(o) ? (n = "", e != null && (n = e.replace(fi, "$&/") + "/"), kn(o, t, n, "", function(u) {
    return u;
  })) : o != null && (Ko(o) && (o = uh(o, n + (!o.key || i && i.key === o.key ? "" : ("" + o.key).replace(fi, "$&/") + "/") + e)), t.push(o)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", di(e)) for (var a = 0; a < e.length; a++) {
    s = e[a];
    var c = r + Nr(s, a);
    i += kn(s, t, n, c, o);
  }
  else if (c = ch(e), typeof c == "function") for (e = c.call(e), a = 0; !(s = e.next()).done; ) s = s.value, c = r + Nr(s, a++), i += kn(s, t, n, c, o);
  else if (s === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function Tn(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return kn(e, r, "", "", function(s) {
    return t.call(n, s, o++);
  }), r;
}
function dh(e) {
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
var K = { current: null }, Cn = { transition: null }, fh = { ReactCurrentDispatcher: K, ReactCurrentBatchConfig: Cn, ReactCurrentOwner: Vo };
function wc() {
  throw Error("act(...) is not supported in production builds of React.");
}
T.Children = { map: Tn, forEach: function(e, t, n) {
  Tn(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return Tn(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return Tn(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Ko(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
T.Component = Mt;
T.Fragment = Qg;
T.Profiler = th;
T.PureComponent = Wo;
T.StrictMode = eh;
T.Suspense = sh;
T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = fh;
T.act = wc;
T.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = Ec({}, e.props), o = e.key, s = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (s = t.ref, i = Vo.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (c in t) vc.call(t, c) && !Ic.hasOwnProperty(c) && (r[c] = t[c] === void 0 && a !== void 0 ? a[c] : t[c]);
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
  return e = { $$typeof: rh, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: nh, _context: e }, e.Consumer = e;
};
T.createElement = Rc;
T.createFactory = function(e) {
  var t = Rc.bind(null, e);
  return t.type = e, t;
};
T.createRef = function() {
  return { current: null };
};
T.forwardRef = function(e) {
  return { $$typeof: oh, render: e };
};
T.isValidElement = Ko;
T.lazy = function(e) {
  return { $$typeof: ah, _payload: { _status: -1, _result: e }, _init: dh };
};
T.memo = function(e, t) {
  return { $$typeof: ih, type: e, compare: t === void 0 ? null : t };
};
T.startTransition = function(e) {
  var t = Cn.transition;
  Cn.transition = {};
  try {
    e();
  } finally {
    Cn.transition = t;
  }
};
T.unstable_act = wc;
T.useCallback = function(e, t) {
  return K.current.useCallback(e, t);
};
T.useContext = function(e) {
  return K.current.useContext(e);
};
T.useDebugValue = function() {
};
T.useDeferredValue = function(e) {
  return K.current.useDeferredValue(e);
};
T.useEffect = function(e, t) {
  return K.current.useEffect(e, t);
};
T.useId = function() {
  return K.current.useId();
};
T.useImperativeHandle = function(e, t, n) {
  return K.current.useImperativeHandle(e, t, n);
};
T.useInsertionEffect = function(e, t) {
  return K.current.useInsertionEffect(e, t);
};
T.useLayoutEffect = function(e, t) {
  return K.current.useLayoutEffect(e, t);
};
T.useMemo = function(e, t) {
  return K.current.useMemo(e, t);
};
T.useReducer = function(e, t, n) {
  return K.current.useReducer(e, t, n);
};
T.useRef = function(e) {
  return K.current.useRef(e);
};
T.useState = function(e) {
  return K.current.useState(e);
};
T.useSyncExternalStore = function(e, t, n) {
  return K.current.useSyncExternalStore(e, t, n);
};
T.useTransition = function() {
  return K.current.useTransition();
};
T.version = "18.3.1";
yc.exports = T;
var Ac = yc.exports;
const zn = /* @__PURE__ */ Xg(Ac);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ph = Ac, mh = Symbol.for("react.element"), gh = Symbol.for("react.fragment"), hh = Object.prototype.hasOwnProperty, _h = ph.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, yh = { key: !0, ref: !0, __self: !0, __source: !0 };
function Oc(e, t, n) {
  var r, o = {}, s = null, i = null;
  n !== void 0 && (s = "" + n), t.key !== void 0 && (s = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) hh.call(t, r) && !yh.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: mh, type: e, key: s, ref: i, props: o, _owner: _h.current };
}
fr.Fragment = gh;
fr.jsx = Oc;
fr.jsxs = Oc;
_c.exports = fr;
var Fe = _c.exports;
let pi = !1, kr = null, Cr = null;
function Sh() {
  if (pi && kr && Cr)
    return { client: kr, scope: Cr };
  if (!ar())
    return { client: null, scope: new k() };
  try {
    const e = gg(), t = ir({}), n = cr(t), r = !1;
    try {
      const i = vo({ levels: ["warn", "error"] });
      n.push(i);
    } catch (i) {
      console.warn("[v0][Sentry] Console logging integration not available:", i);
    }
    const o = new tr({
      dsn: Va,
      transport: or,
      stackParser: sr,
      integrations: n,
      ...e
    }), s = new k();
    return s.setClient(o), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([i, a]) => {
      s.setTag(i, a);
    }), o.init(), kr = o, Cr = s, pi = !0, console.log("[v0][Sentry] Popup monitoring initialized with isolated client"), { client: o, scope: s };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in popup:", e), console.warn("[v0][Sentry] Popup will continue without Sentry monitoring"), { client: null, scope: new k() };
  }
}
const { client: xe, scope: j } = Sh();
let Dc = class extends zn.Component {
  constructor(t) {
    super(t), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(t, n) {
    xe && j && (j.setContext("react", {
      componentStack: n.componentStack
    }), j.captureException(t));
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ Fe.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ Fe.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ Fe.jsx("button", { onClick: () => this.setState({ hasError: !1, retryKey: this.state.retryKey + 1 }), children: "Try again" })
    ] }) : /* @__PURE__ */ Fe.jsx(zn.Fragment, { children: this.props.children }, this.state.retryKey);
  }
};
const Eh = {
  // ErrorBoundary component
  ErrorBoundary: Dc,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!j || !xe))
      return j.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!j || !xe))
      return j.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!j || !xe))
        return Zn(e, t, { scope: j });
    },
    warn: (e, t) => {
      if (!(!j || !xe))
        return Qn(e, t, { scope: j });
    },
    error: (e, t) => {
      if (!(!j || !xe))
        return er(e, t, { scope: j });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !j || !xe ? t(ur()) : nn({ ...e, scope: j }, t),
  // Get client (for advanced usage)
  getClient: () => xe,
  // Get scope (for advanced usage)
  getScope: () => j
}, Nc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: Dc,
  Sentry: Eh,
  scope: j
}, Symbol.toStringTag, { value: "Module" }));
let mi = !1, Pr = null, Mr = null;
function Th() {
  if (mi && Pr && Mr)
    return { client: Pr, scope: Mr };
  if (!ar())
    return { client: null, scope: new k() };
  try {
    const e = hg(), t = ir({}), n = cr(t);
    try {
      const s = ag();
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", s);
    }
    try {
      const s = vo({ levels: ["warn", "error"] });
      n.push(s);
    } catch (s) {
      console.warn("[v0][Sentry] Console logging integration not available:", s);
    }
    const r = new tr({
      dsn: Va,
      transport: or,
      stackParser: sr,
      integrations: n,
      ...e
    }), o = new k();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, i]) => {
      o.setTag(s, i);
    }), r.init(), Pr = r, Mr = o, mi = !0, console.log("[v0][Sentry] Options page monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in options page:", e), console.warn("[v0][Sentry] Options page will continue without Sentry monitoring"), { client: null, scope: new k() };
  }
}
const { client: Ue, scope: q } = Th();
class kc extends zn.Component {
  constructor(t) {
    super(t), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(t, n) {
    Ue && q && (q.setContext("react", {
      componentStack: n.componentStack
    }), q.captureException(t));
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ Fe.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ Fe.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ Fe.jsx("button", { onClick: () => this.setState({ hasError: !1, retryKey: this.state.retryKey + 1 }), children: "Try again" })
    ] }) : /* @__PURE__ */ Fe.jsx(zn.Fragment, { children: this.props.children }, this.state.retryKey);
  }
}
const bh = {
  // ErrorBoundary component
  ErrorBoundary: kc,
  // Capture exception using isolated scope
  captureException: (e, t) => {
    if (!(!q || !Ue))
      return q.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    if (!(!q || !Ue))
      return q.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      if (!(!q || !Ue))
        return Zn(e, t, { scope: q });
    },
    warn: (e, t) => {
      if (!(!q || !Ue))
        return Qn(e, t, { scope: q });
    },
    error: (e, t) => {
      if (!(!q || !Ue))
        return er(e, t, { scope: q });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => !q || !Ue ? t(ur()) : nn({ ...e, scope: q }, t),
  // Get client (for advanced usage)
  getClient: () => Ue,
  // Get scope (for advanced usage)
  getScope: () => q
}, Cc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: kc,
  Sentry: bh,
  scope: q
}, Symbol.toStringTag, { value: "Module" })), Lr = "__V0_SENTRY_CONTENT_INITIALIZED";
let Ft = !1, $e = null, Be = null, Me = null;
async function vh(e = 3, t = 50) {
  for (let o = 0; o < e; o++) {
    if (Ft && $e && Be)
      return { client: $e, scope: Be };
    o < e - 1 && await new Promise((s) => setTimeout(s, t));
  }
  return dt() === "development" && console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries"), { client: null, scope: new k() };
}
function Ih() {
  return ar() ? globalThis[Lr] === !0 ? Ft && $e && Be ? { client: $e, scope: Be } : (Me || (Me = vh(), Me.then((n) => {
    n.client && n.scope && ($e = n.client, Be = n.scope, Ft = !0), Me = null;
  }).catch(() => {
    Me = null;
  })), { client: null, scope: new k() }) : (globalThis[Lr] = !0, Me = Rh().then(
    (t) => ($e = t.client, Be = t.scope, Ft = !0, Me = null, t),
    (t) => {
      throw globalThis[Lr] = !1, Ft = !1, $e = null, Be = null, Me = null, t;
    }
  ), { client: null, scope: new k() }) : { client: null, scope: new k() };
}
async function Rh() {
  try {
    const e = _g(), t = ir({}), n = cr(t), r = new tr({
      dsn: no,
      transport: or,
      stackParser: sr,
      integrations: n,
      ...e
    }), o = new k();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([i, a]) => {
      o.setTag(i, a);
    }), r.init(), dt() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return dt() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", e), { client: null, scope: new k() };
  }
}
Ih();
function et() {
  return $e;
}
function tt() {
  return Be;
}
const wh = {
  // Capture exception using isolated scope
  captureException: (e, t) => {
    const n = tt(), r = et();
    if (!(!n || !r))
      return n.captureException(e, t);
  },
  // Capture message using isolated scope
  captureMessage: (e, t) => {
    const n = tt(), r = et();
    if (!(!n || !r))
      return n.captureMessage(e, t);
  },
  // Logger methods using isolated scope
  logger: {
    info: (e, t) => {
      const n = tt(), r = et();
      if (!(!n || !r))
        return Zn(e, t, { scope: n });
    },
    warn: (e, t) => {
      const n = tt(), r = et();
      if (!(!n || !r))
        return Qn(e, t, { scope: n });
    },
    error: (e, t) => {
      const n = tt(), r = et();
      if (!(!n || !r))
        return er(e, t, { scope: n });
    }
  },
  // Start span using isolated scope
  startSpan: (e, t) => {
    const n = tt(), r = et();
    return !n || !r ? t(ur()) : nn({ ...e, scope: n }, t);
  },
  // Get client (for advanced usage)
  getClient: () => et(),
  // Get scope (for advanced usage)
  getScope: () => tt()
}, Pc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: wh
}, Symbol.toStringTag, { value: "Module" }));
