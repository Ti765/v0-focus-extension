const xs = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = xs;
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
const y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, b = globalThis, ye = "10.22.0";
function Nt() {
  return Dt(b), b;
}
function Dt(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || ye, t[ye] = t[ye] || {};
}
function Ue(e, t, n = b) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[ye] = r[ye] || {};
  return o[e] || (o[e] = t());
}
const Ps = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], Fs = "Sentry Logger ", vt = {};
function Lt(e) {
  if (!("console" in b))
    return e();
  const t = b.console, n = {}, r = Object.keys(vt);
  r.forEach((o) => {
    const s = vt[o];
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
function Us() {
  Mn().enabled = !0;
}
function $s() {
  Mn().enabled = !1;
}
function Ro() {
  return Mn().enabled;
}
function Hs(...e) {
  Ln("log", ...e);
}
function Bs(...e) {
  Ln("warn", ...e);
}
function Gs(...e) {
  Ln("error", ...e);
}
function Ln(e, ...t) {
  y && Ro() && Lt(() => {
    b.console[e](`${Fs}[${e}]:`, ...t);
  });
}
function Mn() {
  return y ? Ue("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const _ = {
  /** Enable logging. */
  enable: Us,
  /** Disable logging. */
  disable: $s,
  /** Check if logging is enabled. */
  isEnabled: Ro,
  /** Log a message. */
  log: Hs,
  /** Log a warning. */
  warn: Bs,
  /** Log an error. */
  error: Gs
}, Oo = 50, Se = "?", _r = /\(error: (.*)\)/, Er = /captureMessage|captureException/;
function zs(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const s = [], i = n.split(`
`);
    for (let c = r; c < i.length; c++) {
      let u = i[c];
      u.length > 1024 && (u = u.slice(0, 1024));
      const l = _r.test(u) ? u.replace(_r, "$1") : u;
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
    return js(s.slice(o));
  };
}
function js(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(mt(t).function || "") && t.pop(), t.reverse(), Er.test(mt(t).function || "") && (t.pop(), Er.test(mt(t).function || "") && t.pop()), t.slice(0, Oo).map((n) => ({
    ...n,
    filename: n.filename || mt(t).filename,
    function: n.function || Se
  }));
}
function mt(e) {
  return e[e.length - 1] || {};
}
const Zt = "<anonymous>";
function ue(e) {
  try {
    return !e || typeof e != "function" ? Zt : e.name || Zt;
  } catch {
    return Zt;
  }
}
function yr(e) {
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
const Tt = {}, Sr = {};
function Ae(e, t) {
  Tt[e] = Tt[e] || [], Tt[e].push(t);
}
function Ie(e, t) {
  if (!Sr[e]) {
    Sr[e] = !0;
    try {
      t();
    } catch (n) {
      y && _.error(`Error while instrumenting ${e}`, n);
    }
  }
}
function X(e, t) {
  const n = e && Tt[e];
  if (n)
    for (const r of n)
      try {
        r(t);
      } catch (o) {
        y && _.error(
          `Error while triggering instrumentation handler.
Type: ${e}
Name: ${ue(r)}
Error:`,
          o
        );
      }
}
let Jt = null;
function Ws(e) {
  const t = "error";
  Ae(t, e), Ie(t, Ys);
}
function Ys() {
  Jt = b.onerror, b.onerror = function(e, t, n, r, o) {
    return X("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), Jt ? Jt.apply(this, arguments) : !1;
  }, b.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let Qt = null;
function qs(e) {
  const t = "unhandledrejection";
  Ae(t, e), Ie(t, Ks);
}
function Ks() {
  Qt = b.onunhandledrejection, b.onunhandledrejection = function(e) {
    return X("unhandledrejection", e), Qt ? Qt.apply(this, arguments) : !0;
  }, b.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const vo = Object.prototype.toString;
function kn(e) {
  switch (vo.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return le(e, Error);
  }
}
function $e(e, t) {
  return vo.call(e) === `[object ${t}]`;
}
function wo(e) {
  return $e(e, "ErrorEvent");
}
function Tr(e) {
  return $e(e, "DOMError");
}
function Xs(e) {
  return $e(e, "DOMException");
}
function se(e) {
  return $e(e, "String");
}
function xn(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function Mt(e) {
  return e === null || xn(e) || typeof e != "object" && typeof e != "function";
}
function Je(e) {
  return $e(e, "Object");
}
function kt(e) {
  return typeof Event < "u" && le(e, Event);
}
function Vs(e) {
  return typeof Element < "u" && le(e, Element);
}
function Zs(e) {
  return $e(e, "RegExp");
}
function nt(e) {
  return !!(e?.then && typeof e.then == "function");
}
function Js(e) {
  return Je(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function le(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function Co(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function Qs(e) {
  return typeof Request < "u" && le(e, Request);
}
const Pn = b, ei = 80;
function No(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let s = 0, i = 0;
    const c = " > ", u = c.length;
    let l;
    const d = Array.isArray(t) ? t : t.keyAttrs, p = !Array.isArray(t) && t.maxStringLength || ei;
    for (; n && s++ < r && (l = ti(n, d), !(l === "html" || s > 1 && i + o.length * u + l.length >= p)); )
      o.push(l), i += l.length, n = n.parentNode;
    return o.reverse().join(c);
  } catch {
    return "<unknown>";
  }
}
function ti(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if (Pn.HTMLElement && n instanceof HTMLElement && n.dataset) {
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
function Do() {
  try {
    return Pn.document.location.href;
  } catch {
    return "";
  }
}
function ni(e) {
  if (!Pn.HTMLElement)
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
function wt(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function br(e, t) {
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
function bt(e, t, n = !1) {
  return se(e) ? Zs(t) ? t.test(e) : se(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function xt(e, t = [], n = !1) {
  return t.some((r) => bt(e, r, n));
}
function G(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && Lo(o, r);
  try {
    e[t] = o;
  } catch {
    y && _.log(`Failed to replace method "${t}" in object`, e);
  }
}
function Te(e, t, n) {
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
function Lo(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, Te(e, "__sentry_original__", t);
  } catch {
  }
}
function Fn(e) {
  return e.__sentry_original__;
}
function Mo(e) {
  if (kn(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...Ir(e)
    };
  if (kt(e)) {
    const t = {
      type: e.type,
      target: Ar(e.target),
      currentTarget: Ar(e.currentTarget),
      ...Ir(e)
    };
    return typeof CustomEvent < "u" && le(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function Ar(e) {
  try {
    return Vs(e) ? No(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function Ir(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function ri(e, t = 40) {
  const n = Object.keys(Mo(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return wt(r, t);
  for (let o = n.length; o > 0; o--) {
    const s = n.slice(0, o).join(", ");
    if (!(s.length > t))
      return o === n.length ? s : wt(s, t);
  }
  return "";
}
function oi() {
  const e = b;
  return e.crypto || e.msCrypto;
}
let en;
function si() {
  return Math.random() * 16;
}
function j(e = oi()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return en || (en = "10000000100040008000" + 1e11), en.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (si() & 15) >> t / 4).toString(16)
    )
  );
}
function ko(e) {
  return e.exception?.values?.[0];
}
function ge(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = ko(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function mn(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], s = o[0] = o[0] || {};
  s.value || (s.value = t || ""), s.type || (s.type = "Error");
}
function ke(e, t) {
  const n = ko(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const s = { ...o?.data, ...t.data };
    n.mechanism.data = s;
  }
}
function Rr(e) {
  if (ii(e))
    return !0;
  try {
    Te(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function ii(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const xo = 1e3;
function rt() {
  return Date.now() / xo;
}
function ai() {
  const { performance: e } = b;
  if (!e?.now || !e.timeOrigin)
    return rt;
  const t = e.timeOrigin;
  return () => (t + e.now()) / xo;
}
let Or;
function ie() {
  return (Or ?? (Or = ai()))();
}
function ci(e) {
  const t = ie(), n = {
    sid: j(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => li(n)
  };
  return e && xe(n, e), n;
}
function xe(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || ie(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : j()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function ui(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), xe(e, n);
}
function li(e) {
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
function ot(e, t, n = 2) {
  if (!t || typeof t != "object" || n <= 0)
    return t;
  if (e && Object.keys(t).length === 0)
    return e;
  const r = { ...e };
  for (const o in t)
    Object.prototype.hasOwnProperty.call(t, o) && (r[o] = ot(r[o], t[o], n - 1));
  return r;
}
function vr() {
  return j();
}
function Po() {
  return j().substring(16);
}
const hn = "_sentrySpan";
function wr(e, t) {
  t ? Te(e, hn, t) : delete e[hn];
}
function Cr(e) {
  return e[hn];
}
const fi = 100;
class B {
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
      traceId: vr(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const t = new B();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, wr(t, Cr(this)), t;
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
    }, this._session && xe(this._session, { user: t }), this._notifyScopeListeners(), this;
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
    const n = typeof t == "function" ? t(this) : t, r = n instanceof B ? n.getScopeData() : Je(n) ? t : void 0, { tags: o, extra: s, user: i, contexts: c, level: u, fingerprint: l = [], propagationContext: d } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...s }, this._contexts = { ...this._contexts, ...c }, i && Object.keys(i).length && (this._user = i), u && (this._level = u), l.length && (this._fingerprint = l), d && (this._propagationContext = d), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, wr(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: vr(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : fi;
    if (r <= 0)
      return this;
    const o = {
      timestamp: rt(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? wt(t.message, 2048) : t.message
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
      span: Cr(this)
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(t) {
    return this._sdkProcessingMetadata = ot(this._sdkProcessingMetadata, t, 2), this;
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
    const r = n?.event_id || j();
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
    const o = r?.event_id || j();
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
    const r = n?.event_id || j();
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
function di() {
  return Ue("defaultCurrentScope", () => new B());
}
function pi() {
  return Ue("defaultIsolationScope", () => new B());
}
class mi {
  constructor(t, n) {
    let r;
    t ? r = t : r = new B();
    let o;
    n ? o = n : o = new B(), this._stack = [{ scope: r }], this._isolationScope = o;
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
    return nt(r) ? r.then(
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
function Pe() {
  const e = Nt(), t = Dt(e);
  return t.stack = t.stack || new mi(di(), pi());
}
function hi(e) {
  return Pe().withScope(e);
}
function gi(e, t) {
  const n = Pe();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function Nr(e) {
  return Pe().withScope(() => e(Pe().getIsolationScope()));
}
function _i() {
  return {
    withIsolationScope: Nr,
    withScope: hi,
    withSetScope: gi,
    withSetIsolationScope: (e, t) => Nr(t),
    getCurrentScope: () => Pe().getScope(),
    getIsolationScope: () => Pe().getIsolationScope()
  };
}
function Un(e) {
  const t = Dt(e);
  return t.acs ? t.acs : _i();
}
function He() {
  const e = Nt();
  return Un(e).getCurrentScope();
}
function st() {
  const e = Nt();
  return Un(e).getIsolationScope();
}
function Ei() {
  return Ue("globalScope", () => new B());
}
function yi(...e) {
  const t = Nt(), n = Un(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function $() {
  return He().getClient();
}
function Si(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, s = {
    trace_id: n,
    span_id: o || Po()
  };
  return r && (s.parent_span_id = r), s;
}
const Ti = "sentry.source", bi = "sentry.sample_rate", Ai = "sentry.previous_trace_sample_rate", Ii = "sentry.op", Ri = "sentry.origin", Fo = "sentry.profile_id", Uo = "sentry.exclusive_time", Oi = 0, vi = 1, wi = "_sentryScope", Ci = "_sentryIsolationScope";
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
function $o(e) {
  const t = e;
  return {
    scope: t[wi],
    isolationScope: Ni(t[Ci])
  };
}
const Di = "sentry-", Li = /^sentry-/;
function Mi(e) {
  const t = ki(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, s]) => {
    if (o.match(Li)) {
      const i = o.slice(Di.length);
      r[i] = s;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function ki(e) {
  if (!(!e || !se(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = Dr(n);
      return Object.entries(r).forEach(([o, s]) => {
        t[o] = s;
      }), t;
    }, {}) : Dr(e);
}
function Dr(e) {
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
const xi = /^o(\d+)\./, Pi = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Fi(e) {
  return e === "http" || e === "https";
}
function it(e, t = !1) {
  const { host: n, path: r, pass: o, port: s, projectId: i, protocol: c, publicKey: u } = e;
  return `${c}://${u}${t && o ? `:${o}` : ""}@${n}${s ? `:${s}` : ""}/${r && `${r}/`}${i}`;
}
function Ui(e) {
  const t = Pi.exec(e);
  if (!t) {
    Lt(() => {
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
  return Ho({ host: s, pass: o, path: u, projectId: l, port: i, protocol: n, publicKey: r });
}
function Ho(e) {
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
function $i(e) {
  if (!y)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((i) => e[i] ? !1 : (_.error(`Invalid Sentry Dsn: ${i} missing`), !0)) ? !1 : n.match(/^\d+$/) ? Fi(r) ? t && isNaN(parseInt(t, 10)) ? (_.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (_.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (_.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Hi(e) {
  return e.match(xi)?.[1];
}
function Bi(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = Hi(n)), r;
}
function Gi(e) {
  const t = typeof e == "string" ? Ui(e) : Ho(e);
  if (!(!t || !$i(t)))
    return t;
}
function zi(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const Bo = 1;
let Lr = !1;
function ji(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : $n(e).parent_span_id, s = $o(e).scope, i = r ? s?.getPropagationContext().propagationSpanId || Po() : t;
  return {
    parent_span_id: o,
    span_id: i,
    trace_id: n
  };
}
function Wi(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: s }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === Bo,
      attributes: s,
      ...o
    }));
}
function Mr(e) {
  return typeof e == "number" ? kr(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? kr(e.getTime()) : ie();
}
function kr(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function $n(e) {
  if (qi(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if (Yi(e)) {
    const { attributes: r, startTime: o, name: s, endTime: i, status: c, links: u } = e, l = "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: s,
      parent_span_id: l,
      start_timestamp: Mr(o),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: Mr(i) || void 0,
      status: Xi(c),
      op: r[Ii],
      origin: r[Ri],
      links: Wi(u)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function Yi(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function qi(e) {
  return typeof e.getSpanJSON == "function";
}
function Ki(e) {
  const { traceFlags: t } = e.spanContext();
  return t === Bo;
}
function Xi(e) {
  if (!(!e || e.code === Oi))
    return e.code === vi ? "ok" : e.message || "unknown_error";
}
const Vi = "_sentryRootSpan";
function Go(e) {
  return e[Vi] || e;
}
function xr() {
  Lr || (Lt(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), Lr = !0);
}
function Zi(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = $()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function Pr(e) {
  _.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function Fr(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (Qi(n)) {
      if (bt(e.description, n))
        return y && Pr(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? bt(e.description, n.name) : !0, o = n.op ? e.op && bt(e.op, n.op) : !0;
    if (r && o)
      return y && Pr(e), !0;
  }
  return !1;
}
function Ji(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function Qi(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const Hn = "production", ea = "_frozenDsc";
function zo(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || Hn,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: Bi(t)
  };
  return t.emit("createDsc", o), o;
}
function ta(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || zo(n.traceId, e);
}
function na(e) {
  const t = $();
  if (!t)
    return {};
  const n = Go(e), r = $n(n), o = r.data, s = n.spanContext().traceState, i = s?.get("sentry.sample_rate") ?? o[bi] ?? o[Ai];
  function c(T) {
    return (typeof i == "number" || typeof i == "string") && (T.sample_rate = `${i}`), T;
  }
  const u = n[ea];
  if (u)
    return c(u);
  const l = s?.get("sentry.dsc"), d = l && Mi(l);
  if (d)
    return c(d);
  const p = zo(e.spanContext().traceId, t), E = o[Ti], m = r.description;
  return E !== "url" && m && (p.transaction = m), Zi() && (p.sampled = String(Ki(n)), p.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  s?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  $o(n).scope?.getPropagationContext().sampleRand.toString()), c(p), t.emit("createDsc", p, n), p;
}
function oe(e, t = 100, n = 1 / 0) {
  try {
    return gn("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function jo(e, t = 3, n = 100 * 1024) {
  const r = oe(e, t);
  return ia(r) > n ? jo(e, t - 1, n) : r;
}
function gn(e, t, n = 1 / 0, r = 1 / 0, o = aa()) {
  const [s, i] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const c = ra(e, t);
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
      return gn("", m, u - 1, r, o);
    } catch {
    }
  const d = Array.isArray(t) ? [] : {};
  let p = 0;
  const E = Mo(t);
  for (const m in E) {
    if (!Object.prototype.hasOwnProperty.call(E, m))
      continue;
    if (p >= r) {
      d[m] = "[MaxProperties ~]";
      break;
    }
    const T = E[m];
    d[m] = gn(m, T, u - 1, r, o), p++;
  }
  return i(t), d;
}
function ra(e, t) {
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
    if (Js(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${ue(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = oa(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function oa(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function sa(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function ia(e) {
  return sa(JSON.stringify(e));
}
function aa() {
  const e = /* @__PURE__ */ new WeakSet();
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1);
  }
  function n(r) {
    e.delete(r);
  }
  return [t, n];
}
function Be(e, t = []) {
  return [e, t];
}
function ca(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function Ur(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function _n(e) {
  const t = Dt(b);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function ua(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(s) {
    typeof r == "string" ? r = typeof s == "string" ? r + s : [_n(r), s] : r.push(typeof s == "string" ? _n(s) : s);
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
  return typeof r == "string" ? r : la(r);
}
function la(e) {
  const t = e.reduce((o, s) => o + s.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function fa(e) {
  const t = typeof e.data == "string" ? _n(e.data) : e.data;
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
const da = {
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
function $r(e) {
  return da[e];
}
function Wo(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function pa(e, t, n, r) {
  const o = e.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: e.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...t && { sdk: t },
    ...!!n && r && { dsn: it(r) },
    ...o && {
      trace: o
    }
  };
}
function ma(e, t) {
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
function ha(e, t, n, r) {
  const o = Wo(n), s = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: it(t) }
  }, i = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return Be(s, [i]);
}
function ga(e, t, n, r) {
  const o = Wo(n), s = e.type && e.type !== "replay_event" ? e.type : "event";
  ma(e, n?.sdk);
  const i = pa(e, o, r, t);
  return delete e.sdkProcessingMetadata, Be(i, [[{ type: s }, e]]);
}
const tn = 0, Hr = 1, Br = 2;
function Pt(e) {
  return new Qe((t) => {
    t(e);
  });
}
function Bn(e) {
  return new Qe((t, n) => {
    n(e);
  });
}
class Qe {
  constructor(t) {
    this._state = tn, this._handlers = [], this._runExecutor(t);
  }
  /** @inheritdoc */
  then(t, n) {
    return new Qe((r, o) => {
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
    return new Qe((n, r) => {
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
    if (this._state === tn)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === Hr && n[1](this._value), this._state === Br && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (s, i) => {
      if (this._state === tn) {
        if (nt(i)) {
          i.then(r, o);
          return;
        }
        this._state = s, this._value = i, this._executeHandlers();
      }
    }, r = (s) => {
      n(Hr, s);
    }, o = (s) => {
      n(Br, s);
    };
    try {
      t(r, o);
    } catch (s) {
      o(s);
    }
  }
}
function _a(e, t, n, r = 0) {
  try {
    const o = En(t, n, e, r);
    return nt(o) ? o : Pt(o);
  } catch (o) {
    return Bn(o);
  }
}
function En(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const s = o({ ...e }, t);
  return y && s === null && _.log(`Event processor "${o.id || "?"}" dropped event`), nt(s) ? s.then((i) => En(i, t, n, r + 1)) : En(s, t, n, r + 1);
}
function Ea(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: s } = t;
  ya(e, t), r && ba(e, r), Aa(e, n), Sa(e, o), Ta(e, s);
}
function Gr(e, t) {
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
  ht(e, "extra", n), ht(e, "tags", r), ht(e, "user", o), ht(e, "contexts", s), e.sdkProcessingMetadata = ot(e.sdkProcessingMetadata, c, 2), i && (e.level = i), m && (e.transactionName = m), T && (e.span = T), u.length && (e.breadcrumbs = [...e.breadcrumbs, ...u]), l.length && (e.fingerprint = [...e.fingerprint, ...l]), d.length && (e.eventProcessors = [...e.eventProcessors, ...d]), p.length && (e.attachments = [...e.attachments, ...p]), e.propagationContext = { ...e.propagationContext, ...E };
}
function ht(e, t, n) {
  e[t] = ot(e[t], n, 1);
}
function ya(e, t) {
  const { extra: n, tags: r, user: o, contexts: s, level: i, transactionName: c } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(s).length && (e.contexts = { ...s, ...e.contexts }), i && (e.level = i), c && e.type !== "transaction" && (e.transaction = c);
}
function Sa(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function Ta(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function ba(e, t) {
  e.contexts = {
    trace: ji(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: na(t),
    ...e.sdkProcessingMetadata
  };
  const n = Go(t), r = $n(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function Aa(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let he, zr, jr, ae;
function Ia(e) {
  const t = b._sentryDebugIds, n = b._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (ae && r.length === zr && o.length === jr)
    return ae;
  zr = r.length, jr = o.length, ae = {}, he || (he = {});
  const s = (i, c) => {
    for (const u of i) {
      const l = c[u], d = he?.[u];
      if (d && ae && l)
        ae[d[0]] = l, he && (he[u] = [d[0], l]);
      else if (l) {
        const p = e(u);
        for (let E = p.length - 1; E >= 0; E--) {
          const T = p[E]?.filename;
          if (T && ae && he) {
            ae[T] = l, he[u] = [T, l];
            break;
          }
        }
      }
    }
  };
  return t && s(r, t), n && s(o, n), ae;
}
function Ra(e, t, n, r, o, s) {
  const { normalizeDepth: i = 3, normalizeMaxBreadth: c = 1e3 } = e, u = {
    ...t,
    event_id: t.event_id || n.event_id || j(),
    timestamp: t.timestamp || rt()
  }, l = n.integrations || e.integrations.map((I) => I.name);
  Oa(u, e), Ca(u, l), o && o.emit("applyFrameMetadata", t), t.type === void 0 && va(u, e.stackParser);
  const d = Da(r, n.captureContext);
  n.mechanism && ke(u, n.mechanism);
  const p = o ? o.getEventProcessors() : [], E = Ei().getScopeData();
  if (s) {
    const I = s.getScopeData();
    Gr(E, I);
  }
  if (d) {
    const I = d.getScopeData();
    Gr(E, I);
  }
  const m = [...n.attachments || [], ...E.attachments];
  m.length && (n.attachments = m), Ea(u, E);
  const T = [
    ...p,
    // Run scope event processors _after_ all other processors
    ...E.eventProcessors
  ];
  return _a(T, u, n).then((I) => (I && wa(I), typeof i == "number" && i > 0 ? Na(I, i, c) : I));
}
function Oa(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: s = 250 } = t;
  e.environment = e.environment || n || Hn, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const i = e.request;
  i?.url && (i.url = wt(i.url, s));
}
function va(e, t) {
  const n = Ia(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function wa(e) {
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
function Da(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new B();
  return n.update(t), n;
}
function La(e, t) {
  return He().captureException(e, void 0);
}
function Yo(e, t) {
  return He().captureEvent(e, t);
}
function Wr(e) {
  const t = st(), n = He(), { userAgent: r } = b.navigator || {}, o = ci({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), s = t.getSession();
  return s?.status === "ok" && xe(s, { status: "exited" }), qo(), t.setSession(o), o;
}
function qo() {
  const e = st(), n = He().getSession() || e.getSession();
  n && ui(n), Ko(), e.setSession();
}
function Ko() {
  const e = st(), t = $(), n = e.getSession();
  n && t && t.captureSession(n);
}
function Yr(e = !1) {
  if (e) {
    qo();
    return;
  }
  Ko();
}
const Ma = "7";
function ka(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function xa(e) {
  return `${ka(e)}${e.projectId}/envelope/`;
}
function Pa(e, t) {
  const n = {
    sentry_version: Ma
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function Fa(e, t, n) {
  return t || `${xa(e)}?${Pa(e, n)}`;
}
const qr = [];
function Ua(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && Xo(e, r, n);
  }), n;
}
function Kr(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function Xo(e, t, n) {
  if (n[t.name]) {
    y && _.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, qr.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), qr.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
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
function $a(e) {
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
function Ha(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = it(r)), Be(o, [$a(e)]);
}
function Vo(e, t) {
  const n = t ?? Ba(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Ha(n, r._metadata, r.tunnel, e.getDsn());
  Zo().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function Ba(e) {
  return Zo().get(e);
}
function Zo() {
  return Ue("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Ga(e) {
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
function za(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = it(r)), Be(o, [Ga(e)]);
}
function Jo(e, t) {
  const n = t ?? ja(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = za(n, r._metadata, r.tunnel, e.getDsn());
  Qo().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function ja(e) {
  return Qo().get(e);
}
function Qo() {
  return Ue("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Wa(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: rt(),
      discarded_events: e
    }
  ];
  return Be(t ? { dsn: t } : {}, [r]);
}
function es(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function Ya(e) {
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
    profile_id: i?.[Fo],
    exclusive_time: i?.[Uo],
    measurements: e.measurements,
    is_segment: !0
  };
}
function qa(e) {
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
          ...e.profile_id && { [Fo]: e.profile_id },
          ...e.exclusive_time && { [Uo]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const Xr = "Not capturing exception because it's already been captured.", Vr = "Discarded session because of missing or non-string release", ts = Symbol.for("SentryInternalError"), ns = Symbol.for("SentryDoNotSendEventError"), Ka = 5e3;
function At(e) {
  return {
    message: e,
    [ts]: !0
  };
}
function nn(e) {
  return {
    message: e,
    [ns]: !0
  };
}
function Zr(e) {
  return !!e && typeof e == "object" && ts in e;
}
function Jr(e) {
  return !!e && typeof e == "object" && ns in e;
}
function Qr(e, t, n, r, o) {
  let s = 0, i;
  e.on(n, () => {
    s = 0, clearTimeout(i);
  }), e.on(t, (c) => {
    s += r(c), s >= 8e5 ? o(e) : (clearTimeout(i), i = setTimeout(() => {
      o(e);
    }, Ka));
  }), e.on("flush", () => {
    o(e);
  });
}
class Xa {
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
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = Gi(t.dsn) : y && _.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = Fa(
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
    this._options.enableLogs && Qr(this, "afterCaptureLog", "flushLogs", Qa, Vo), this._options._experiments?.enableMetrics && Qr(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      Ja,
      Jo
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = j();
    if (Rr(t))
      return y && _.log(Xr), o;
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
      event_id: j(),
      ...r
    }, i = xn(t) ? t : String(t), c = Mt(t) ? this.eventFromMessage(i, n, s) : this.eventFromException(t, s);
    return this._process(c.then((u) => this._captureEvent(u, s, o))), s.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = j();
    if (n?.originalException && Rr(n.originalException))
      return y && _.log(Xr), o;
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
    this.sendSession(t), xe(t, { init: !1 });
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
    Xo(this, t, this._integrations), n || Kr(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = ga(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = ca(r, fa(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = Hn } = this._options;
    if ("aggregates" in t) {
      const s = t.attrs || {};
      if (!s.release && !n) {
        y && _.warn(Vr);
        return;
      }
      s.release = s.release || n, s.environment = s.environment || r, t.attrs = s;
    } else {
      if (!t.release && !n) {
        y && _.warn(Vr);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = ha(t, this._dsn, this._options._metadata, this._options.tunnel);
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
    this._integrations = Ua(this, t), Kr(this, t);
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
    (i && t.errors === 0 || i && r) && (xe(t, {
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
    return !n.integrations && i?.length && (n.integrations = i), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Ra(s, t, n, r, this, o).then((c) => {
      if (c === null)
        return c;
      this.emit("postprocessEvent", c, n), c.contexts = {
        trace: Si(r),
        ...c.contexts
      };
      const u = ta(this, r);
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
  _captureEvent(t, n = {}, r = He(), o = st()) {
    return y && yn(t) && _.log(`Captured error event \`${es(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (s) => s.event_id,
      (s) => {
        y && (Jr(s) ? _.log(s.message) : Zr(s) ? _.warn(s.message) : _.warn(s));
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
    const s = this.getOptions(), { sampleRate: i } = s, c = rs(t), u = yn(t), l = t.type || "error", d = `before send for type \`${l}\``, p = typeof i > "u" ? void 0 : zi(i);
    if (u && typeof p == "number" && Math.random() > p)
      return this.recordDroppedEvent("sample_rate", "error"), Bn(
        nn(
          `Discarding event because it's not included in the random sample (sampling rate = ${i})`
        )
      );
    const E = l === "replay_event" ? "replay" : l;
    return this._prepareEvent(t, n, r, o).then((m) => {
      if (m === null)
        throw this.recordDroppedEvent("event_processor", E), nn("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return m;
      const Y = Za(this, s, m, n);
      return Va(Y, d);
    }).then((m) => {
      if (m === null) {
        if (this.recordDroppedEvent("before_send", E), c) {
          const q = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", q);
        }
        throw nn(`${d} returned \`null\`, will not send event.`);
      }
      const T = r.getSession() || o.getSession();
      if (u && T && this._updateSessionFromEvent(T, m), c) {
        const I = m.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, q = m.spans ? m.spans.length : 0, z = I - q;
        z > 0 && this.recordDroppedEvent("before_send", "span", z);
      }
      const Y = m.transaction_info;
      if (c && Y && m.transaction !== t.transaction) {
        const I = "custom";
        m.transaction_info = {
          ...Y,
          source: I
        };
      }
      return this.sendEvent(m, n), m;
    }).then(null, (m) => {
      throw Jr(m) || Zr(m) ? m : (this.captureException(m, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: m
      }), At(
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
    const n = Wa(t, this._options.tunnel && it(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function Va(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (nt(e))
    return e.then(
      (r) => {
        if (!Je(r) && r !== null)
          throw At(n);
        return r;
      },
      (r) => {
        throw At(`${t} rejected with ${r}`);
      }
    );
  if (!Je(e) && e !== null)
    throw At(n);
  return e;
}
function Za(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: s, beforeSendSpan: i, ignoreSpans: c } = t;
  let u = n;
  if (yn(u) && o)
    return o(u, r);
  if (rs(u)) {
    if (i || c) {
      const l = Ya(u);
      if (c?.length && Fr(l, c))
        return null;
      if (i) {
        const d = i(l);
        d ? u = ot(n, qa(d)) : xr();
      }
      if (u.spans) {
        const d = [], p = u.spans;
        for (const m of p) {
          if (c?.length && Fr(m, c)) {
            Ji(p, m);
            continue;
          }
          if (i) {
            const T = i(m);
            T ? d.push(T) : (xr(), d.push(m));
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
function yn(e) {
  return e.type === void 0;
}
function rs(e) {
  return e.type === "transaction";
}
function Ja(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + os(e.attributes);
}
function Qa(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + os(e.attributes);
}
function os(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * eo(n[0]) : Mt(n) ? t += eo(n) : t += 100;
  }), t;
}
function eo(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const ss = Symbol.for("SentryBufferFullError");
function ec(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(i) {
    t.delete(i);
  }
  function o(i) {
    if (!n())
      return Bn(ss);
    const c = i();
    return t.add(c), c.then(
      () => r(c),
      () => r(c)
    ), c;
  }
  function s(i) {
    if (!t.size)
      return Pt(!0);
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
const tc = 60 * 1e3;
function nc(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? tc : r - t;
}
function rc(e, t) {
  return e[t] || e.all || 0;
}
function oc(e, t, n = Date.now()) {
  return rc(e, t) > n;
}
function sc(e, { statusCode: t, headers: n }, r = Date.now()) {
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
  else i ? o.all = r + nc(i, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const ic = 64;
function ac(e, t, n = ec(
  e.bufferSize || ic
)) {
  let r = {};
  const o = (i) => n.drain(i);
  function s(i) {
    const c = [];
    if (Ur(i, (p, E) => {
      const m = $r(E);
      oc(r, m) ? e.recordDroppedEvent("ratelimit_backoff", m) : c.push(p);
    }), c.length === 0)
      return Promise.resolve({});
    const u = Be(i[0], c), l = (p) => {
      Ur(u, (E, m) => {
        e.recordDroppedEvent(p, $r(m));
      });
    }, d = () => t({ body: ua(u) }).then(
      (p) => (p.statusCode !== void 0 && (p.statusCode < 200 || p.statusCode >= 300) && y && _.warn(`Sentry responded with status code ${p.statusCode} to sent event.`), r = sc(r, p), p),
      (p) => {
        throw l("network_error"), y && _.error("Encountered error running transport request:", p), p;
      }
    );
    return n.add(d).then(
      (p) => p,
      (p) => {
        if (p === ss)
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
function rn(e) {
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
function cc(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function uc(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  o.sdk || (o.sdk = {
    name: `sentry.javascript.${t}`,
    packages: n.map((s) => ({
      name: `${r}:@sentry/${s}`,
      version: ye
    })),
    version: ye
  }), e._metadata = o;
}
const lc = 100;
function be(e, t) {
  const n = $(), r = st();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: s = lc } = n.getOptions();
  if (s <= 0) return;
  const c = { timestamp: rt(), ...e }, u = o ? Lt(() => o(c, t)) : c;
  u !== null && (n.emit && n.emit("beforeAddBreadcrumb", u, t), r.addBreadcrumb(u, s));
}
let to;
const fc = "FunctionToString", no = /* @__PURE__ */ new WeakMap(), dc = () => ({
  name: fc,
  setupOnce() {
    to = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = Fn(this), n = no.has($()) && t !== void 0 ? t : this;
        return to.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    no.set(e, !0);
  }
}), pc = dc, mc = [
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
], hc = "EventFilters", gc = (e = {}) => {
  let t;
  return {
    name: hc,
    setup(n) {
      const r = n.getOptions();
      t = ro(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const s = o.getOptions();
        t = ro(e, s);
      }
      return Ec(n, t) ? null : n;
    }
  };
}, _c = (e = {}) => ({
  ...gc(e),
  name: "InboundFilters"
});
function ro(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : mc
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function Ec(e, t) {
  if (e.type) {
    if (e.type === "transaction" && Sc(e, t.ignoreTransactions))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${ge(e)}`
      ), !0;
  } else {
    if (yc(e, t.ignoreErrors))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${ge(e)}`
      ), !0;
    if (Ic(e))
      return y && _.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${ge(
          e
        )}`
      ), !0;
    if (Tc(e, t.denyUrls))
      return y && _.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${ge(
          e
        )}.
Url: ${Ct(e)}`
      ), !0;
    if (!bc(e, t.allowUrls))
      return y && _.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${ge(
          e
        )}.
Url: ${Ct(e)}`
      ), !0;
  }
  return !1;
}
function yc(e, t) {
  return t?.length ? es(e).some((n) => xt(n, t)) : !1;
}
function Sc(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? xt(n, t) : !1;
}
function Tc(e, t) {
  if (!t?.length)
    return !1;
  const n = Ct(e);
  return n ? xt(n, t) : !1;
}
function bc(e, t) {
  if (!t?.length)
    return !0;
  const n = Ct(e);
  return n ? xt(n, t) : !0;
}
function Ac(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function Ct(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? Ac(n) : null;
  } catch {
    return y && _.error(`Cannot extract url for event ${ge(e)}`), null;
  }
}
function Ic(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Rc(e, t, n, r, o, s) {
  if (!o.exception?.values || !s || !le(s.originalException, Error))
    return;
  const i = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  i && (o.exception.values = Sn(
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
function Sn(e, t, n, r, o, s, i, c) {
  if (s.length >= n + 1)
    return s;
  let u = [...s];
  if (le(r[o], Error)) {
    oo(i, c);
    const l = e(t, r[o]), d = u.length;
    so(l, o, d, c), u = Sn(
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
    if (le(l, Error)) {
      oo(i, c);
      const p = e(t, l), E = u.length;
      so(p, `errors[${d}]`, E, c), u = Sn(
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
function oo(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function so(e, t, n, r) {
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
  Ae(t, e), Ie(t, vc);
}
function vc() {
  "console" in b && Ps.forEach(function(e) {
    e in b.console && G(b.console, e, function(t) {
      return vt[e] = t, function(...n) {
        X("console", { args: n, level: e }), vt[e]?.apply(b.console, n);
      };
    });
  });
}
function wc(e) {
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
        if (Lc(t, e))
          return y && _.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, Dc = Nc;
function Lc(e, t) {
  return t ? !!(Mc(e, t) || kc(e, t)) : !1;
}
function Mc(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !as(e, t) || !is(e, t));
}
function kc(e, t) {
  const n = io(t), r = io(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !as(e, t) || !is(e, t));
}
function is(e, t) {
  let n = yr(e), r = yr(t);
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
function as(e, t) {
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
function io(e) {
  return e.exception?.values?.[0];
}
function cs(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const et = b;
function xc() {
  return "history" in et && !!et.history;
}
function Pc() {
  if (!("fetch" in et))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function Tn(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function Fc() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!Pc())
    return !1;
  if (Tn(et.fetch))
    return !0;
  let e = !1;
  const t = et.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = Tn(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      y && _.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function Uc(e, t) {
  const n = "fetch";
  Ae(n, e), Ie(n, () => $c(void 0, t));
}
function $c(e, t = !1) {
  t && !Fc() || G(b, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: s, url: i } = Hc(r), c = {
        args: r,
        fetchData: {
          method: s,
          url: i
        },
        startTimestamp: ie() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: Bc(r)
      };
      return X("fetch", {
        ...c
      }), n.apply(b, r).then(
        async (u) => (X("fetch", {
          ...c,
          endTimestamp: ie() * 1e3,
          response: u
        }), u),
        (u) => {
          if (X("fetch", {
            ...c,
            endTimestamp: ie() * 1e3,
            error: u
          }), kn(u) && u.stack === void 0 && (u.stack = o.stack, Te(u, "framesToPop", 1)), u instanceof TypeError && (u.message === "Failed to fetch" || u.message === "Load failed" || u.message === "NetworkError when attempting to fetch resource."))
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
function bn(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function ao(e) {
  return typeof e == "string" ? e : e ? bn(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function Hc(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: ao(n),
      method: bn(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: ao(t),
    method: bn(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function Bc(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (Qs(t))
      return new Headers(t.headers);
  } catch {
  }
}
function Gc() {
  return "npm";
}
const L = b;
let An = 0;
function us() {
  return An > 0;
}
function zc() {
  An++, setTimeout(() => {
    An--;
  });
}
function Fe(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (Fn(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const s = o.map((i) => Fe(i, t));
      return e.apply(this, s);
    } catch (s) {
      throw zc(), yi((i) => {
        i.addEventProcessor((c) => (t.mechanism && (mn(c, void 0), ke(c, t.mechanism)), c.extra = {
          ...c.extra,
          arguments: o
        }, c)), La(s);
      }), s;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  Lo(r, e), Te(e, "__sentry_wrapped__", r);
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
function jc() {
  const e = Do(), { referrer: t } = L.document || {}, { userAgent: n } = L.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function Gn(e, t) {
  const n = zn(e, t), r = {
    type: Xc(t),
    value: Vc(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function Wc(e, t, n, r) {
  const s = $()?.getOptions().normalizeDepth, i = tu(t), c = {
    __serialized__: jo(t, s)
  };
  if (i)
    return {
      exception: {
        values: [Gn(e, i)]
      },
      extra: c
    };
  const u = {
    exception: {
      values: [
        {
          type: kt(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: Qc(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: c
  };
  if (n) {
    const l = zn(e, n);
    l.length && (u.exception.values[0].stacktrace = { frames: l });
  }
  return u;
}
function on(e, t) {
  return {
    exception: {
      values: [Gn(e, t)]
    }
  };
}
function zn(e, t) {
  const n = t.stacktrace || t.stack || "", r = qc(t), o = Kc(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const Yc = /Minified React error #\d+;/i;
function qc(e) {
  return e && Yc.test(e.message) ? 1 : 0;
}
function Kc(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function ls(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function Xc(e) {
  const t = e?.name;
  return !t && ls(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function Vc(e) {
  const t = e?.message;
  return ls(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function Zc(e, t, n, r) {
  const o = n?.syntheticException || void 0, s = jn(e, t, o, r);
  return ke(s), s.level = "error", n?.event_id && (s.event_id = n.event_id), Pt(s);
}
function Jc(e, t, n = "info", r, o) {
  const s = r?.syntheticException || void 0, i = In(e, t, s, o);
  return i.level = n, r?.event_id && (i.event_id = r.event_id), Pt(i);
}
function jn(e, t, n, r, o) {
  let s;
  if (wo(t) && t.error)
    return on(e, t.error);
  if (Tr(t) || Xs(t)) {
    const i = t;
    if ("stack" in t)
      s = on(e, t);
    else {
      const c = i.name || (Tr(i) ? "DOMError" : "DOMException"), u = i.message ? `${c}: ${i.message}` : c;
      s = In(e, u, n, r), mn(s, u);
    }
    return "code" in i && (s.tags = { ...s.tags, "DOMException.code": `${i.code}` }), s;
  }
  return kn(t) ? on(e, t) : Je(t) || kt(t) ? (s = Wc(e, t, n, o), ke(s, {
    synthetic: !0
  }), s) : (s = In(e, t, n, r), mn(s, `${t}`), ke(s, {
    synthetic: !0
  }), s);
}
function In(e, t, n, r) {
  const o = {};
  if (r && n) {
    const s = zn(e, n);
    s.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: s } }]
    }), ke(o, { synthetic: !0 });
  }
  if (xn(t)) {
    const { __sentry_template_string__: s, __sentry_template_values__: i } = t;
    return o.logentry = {
      message: s,
      params: i
    }, o;
  }
  return o.message = t, o;
}
function Qc(e, { isUnhandledRejection: t }) {
  const n = ri(e), r = t ? "promise rejection" : "exception";
  return wo(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : kt(e) ? `Event \`${eu(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function eu(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function tu(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class nu extends Xa {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = ru(t), r = L.SENTRY_SDK_SOURCE || Gc();
    uc(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: s, enableLogs: i, _experiments: c } = this._options;
    L.document && (s || i || c?.enableMetrics) && L.document.addEventListener("visibilitychange", () => {
      L.document.visibilityState === "hidden" && (s && this._flushOutcomes(), i && Vo(this), c?.enableMetrics && Jo(this));
    }), o && this.on("beforeSendSession", cc);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return Zc(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return Jc(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function ru(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : L.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const ou = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, P = b, su = 1e3;
let co, Rn, On;
function iu(e) {
  const t = "dom";
  Ae(t, e), Ie(t, au);
}
function au() {
  if (!P.document)
    return;
  const e = X.bind(null, "dom"), t = uo(e, !0);
  P.document.addEventListener("click", t, !1), P.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = P[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (G(o, "addEventListener", function(s) {
      return function(i, c, u) {
        if (i === "click" || i == "keypress")
          try {
            const l = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, d = l[i] = l[i] || { refCount: 0 };
            if (!d.handler) {
              const p = uo(e);
              d.handler = p, s.call(this, i, p, u);
            }
            d.refCount++;
          } catch {
          }
        return s.call(this, i, c, u);
      };
    }), G(
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
function cu(e) {
  if (e.type !== Rn)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== On)
      return !1;
  } catch {
  }
  return !0;
}
function uu(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function uo(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = lu(n);
    if (uu(n.type, r))
      return;
    Te(n, "_sentryCaptured", !0), r && !r._sentryId && Te(r, "_sentryId", j());
    const o = n.type === "keypress" ? "input" : n.type;
    cu(n) || (e({ event: n, name: o, global: t }), Rn = n.type, On = r ? r._sentryId : void 0), clearTimeout(co), co = P.setTimeout(() => {
      On = void 0, Rn = void 0;
    }, su);
  };
}
function lu(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let gt;
function fs(e) {
  const t = "history";
  Ae(t, e), Ie(t, fu);
}
function fu() {
  if (P.addEventListener("popstate", () => {
    const t = P.location.href, n = gt;
    if (gt = t, n === t)
      return;
    X("history", { from: n, to: t });
  }), !xc())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = gt, s = du(String(r));
        if (gt = s, o === s)
          return t.apply(this, n);
        X("history", { from: o, to: s });
      }
      return t.apply(this, n);
    };
  }
  G(P.history, "pushState", e), G(P.history, "replaceState", e);
}
function du(e) {
  try {
    return new URL(e, P.location.origin).toString();
  } catch {
    return e;
  }
}
const It = {};
function pu(e) {
  const t = It[e];
  if (t)
    return t;
  let n = P[e];
  if (Tn(n))
    return It[e] = n.bind(P);
  const r = P.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      o.hidden = !0, r.head.appendChild(o);
      const s = o.contentWindow;
      s?.[e] && (n = s[e]), r.head.removeChild(o);
    } catch (o) {
      ou && _.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, o);
    }
  return n && (It[e] = n.bind(P));
}
function mu(e) {
  It[e] = void 0;
}
const Ve = "__sentry_xhr_v3__";
function hu(e) {
  const t = "xhr";
  Ae(t, e), Ie(t, gu);
}
function gu() {
  if (!P.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), s = ie() * 1e3, i = se(r[0]) ? r[0].toUpperCase() : void 0, c = _u(r[1]);
      if (!i || !c)
        return t.apply(n, r);
      n[Ve] = {
        method: i,
        url: c,
        request_headers: {}
      }, i === "POST" && c.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const u = () => {
        const l = n[Ve];
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
          X("xhr", d);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(l, d, p) {
          return u(), l.apply(d, p);
        }
      }) : n.addEventListener("readystatechange", u), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(l, d, p) {
          const [E, m] = p, T = d[Ve];
          return T && se(E) && se(m) && (T.request_headers[E.toLowerCase()] = m), l.apply(d, p);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[Ve];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const s = {
        startTimestamp: ie() * 1e3,
        xhr: n
      };
      return X("xhr", s), t.apply(n, r);
    }
  });
}
function _u(e) {
  if (se(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function Eu(e, t = pu("fetch")) {
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
      throw mu("fetch"), u;
    } finally {
      n -= i, r--;
    }
  }
  return ac(e, o);
}
const yu = 30, Su = 50;
function vn(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? Se : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const Tu = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, bu = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, Au = /\((\S*)(?::(\d+))(?::(\d+))\)/, Iu = /at (.+?) ?\(data:(.+?),/, Ru = (e) => {
  const t = e.match(Iu);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = Tu.exec(e);
  if (n) {
    const [, o, s, i] = n;
    return vn(o, Se, +s, +i);
  }
  const r = bu.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const c = Au.exec(r[2]);
      c && (r[2] = c[1], r[3] = c[2], r[4] = c[3]);
    }
    const [s, i] = ds(r[1] || Se, r[2]);
    return vn(i, s, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, Ou = [yu, Ru], vu = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, wu = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, Cu = (e) => {
  const t = vu.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const s = wu.exec(t[3]);
      s && (t[1] = t[1] || "eval", t[3] = s[1], t[4] = s[2], t[5] = "");
    }
    let r = t[3], o = t[1] || Se;
    return [o, r] = ds(o, r), vn(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, Nu = [Su, Cu], Du = [Ou, Nu], Lu = zs(...Du), ds = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : Se,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, Wn = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, _t = 1024, Mu = "Breadcrumbs", ku = (e = {}) => {
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
    name: Mu,
    setup(n) {
      t.console && Oc(Uu(n)), t.dom && iu(Fu(n, t.dom)), t.xhr && hu($u(n)), t.fetch && Uc(Hu(n)), t.history && fs(Bu(n)), t.sentry && n.on("beforeSendEvent", Pu(n));
    }
  };
}, xu = ku;
function Pu(e) {
  return function(n) {
    $() === e && be(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: ge(n)
      },
      {
        event: n
      }
    );
  };
}
function Fu(e, t) {
  return function(r) {
    if ($() !== e)
      return;
    let o, s, i = typeof t == "object" ? t.serializeAttribute : void 0, c = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    c && c > _t && (Wn && _.warn(
      `\`dom.maxStringLength\` cannot exceed ${_t}, but a value of ${c} was configured. Sentry will use ${_t} instead.`
    ), c = _t), typeof i == "string" && (i = [i]);
    try {
      const l = r.event, d = Gu(l) ? l.target : l;
      o = No(d, { keyAttrs: i, maxStringLength: c }), s = ni(d);
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0)
      return;
    const u = {
      category: `ui.${r.name}`,
      message: o
    };
    s && (u.data = { "ui.component_name": s }), be(u, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function Uu(e) {
  return function(n) {
    if ($() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: wc(n.level),
      message: br(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${br(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    be(r, {
      input: n.args,
      level: n.level
    });
  };
}
function $u(e) {
  return function(n) {
    if ($() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, s = n.xhr[Ve];
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
      level: cs(u)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", E, p), be(E, p);
  };
}
function Hu(e) {
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
        e.emit("beforeOutgoingRequestBreadcrumb", c, i), be(c, i);
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
          level: cs(i.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", u, c), be(u, c);
      }
  };
}
function Bu(e) {
  return function(n) {
    if ($() !== e)
      return;
    let r = n.from, o = n.to;
    const s = rn(L.location.href);
    let i = r ? rn(r) : void 0;
    const c = rn(o);
    i?.path || (i = s), s.protocol === c.protocol && s.host === c.host && (o = c.relative), s.protocol === i.protocol && s.host === i.host && (r = i.relative), be({
      category: "navigation",
      data: {
        from: r,
        to: o
      }
    });
  };
}
function Gu(e) {
  return !!e && !!e.target;
}
const zu = [
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
], ju = "BrowserApiErrors", Wu = (e = {}) => {
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
    name: ju,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && G(L, "setTimeout", lo), t.setInterval && G(L, "setInterval", lo), t.requestAnimationFrame && G(L, "requestAnimationFrame", qu), t.XMLHttpRequest && "XMLHttpRequest" in L && G(XMLHttpRequest.prototype, "send", Ku);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : zu).forEach((o) => Xu(o, t));
    }
  };
}, Yu = Wu;
function lo(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = Fe(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${ue(e)}`
      }
    }), e.apply(this, t);
  };
}
function qu(e) {
  return function(t) {
    return e.apply(this, [
      Fe(t, {
        mechanism: {
          data: {
            handler: ue(e)
          },
          handled: !1,
          type: "auto.browser.browserapierrors.requestAnimationFrame"
        }
      })
    ]);
  };
}
function Ku(e) {
  return function(...t) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
      o in n && typeof n[o] == "function" && G(n, o, function(s) {
        const i = {
          mechanism: {
            data: {
              handler: ue(s)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${o}`
          }
        }, c = Fn(s);
        return c && (i.mechanism.data.handler = ue(c)), Fe(s, i);
      });
    }), e.apply(this, t);
  };
}
function Xu(e, t) {
  const r = L[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (G(r, "addEventListener", function(o) {
    return function(s, i, c) {
      try {
        Vu(i) && (i.handleEvent = Fe(i.handleEvent, {
          mechanism: {
            data: {
              handler: ue(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return t.unregisterOriginalCallbacks && Zu(this, s, i), o.apply(this, [
        s,
        Fe(i, {
          mechanism: {
            data: {
              handler: ue(i),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        c
      ]);
    };
  }), G(r, "removeEventListener", function(o) {
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
function Vu(e) {
  return typeof e.handleEvent == "function";
}
function Zu(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const Ju = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof L.document > "u") {
      Wn && _.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    Wr({ ignoreDuration: !0 }), Yr(), fs(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (Wr({ ignoreDuration: !0 }), Yr());
    });
  }
}), Qu = "GlobalHandlers", el = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: Qu,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (nl(n), fo("onerror")), t.onunhandledrejection && (rl(n), fo("onunhandledrejection"));
    }
  };
}, tl = el;
function nl(e) {
  Ws((t) => {
    const { stackParser: n, attachStacktrace: r } = ps();
    if ($() !== e || us())
      return;
    const { msg: o, url: s, line: i, column: c, error: u } = t, l = il(
      jn(n, u || o, void 0, r, !1),
      s,
      i,
      c
    );
    l.level = "error", Yo(l, {
      originalException: u,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function rl(e) {
  qs((t) => {
    const { stackParser: n, attachStacktrace: r } = ps();
    if ($() !== e || us())
      return;
    const o = ol(t), s = Mt(o) ? sl(o) : jn(n, o, void 0, r, !0);
    s.level = "error", Yo(s, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function ol(e) {
  if (Mt(e))
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
function sl(e) {
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
function il(e, t, n, r) {
  const o = e.exception = e.exception || {}, s = o.values = o.values || [], i = s[0] = s[0] || {}, c = i.stacktrace = i.stacktrace || {}, u = c.frames = c.frames || [], l = r, d = n, p = al(t) ?? Do();
  return u.length === 0 && u.push({
    colno: l,
    filename: p,
    function: Se,
    in_app: !0,
    lineno: d
  }), e;
}
function fo(e) {
  Wn && _.log(`Global Handler attached: ${e}`);
}
function ps() {
  return $()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function al(e) {
  if (!(!se(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const cl = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!L.navigator && !L.location && !L.document)
      return;
    const t = jc(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), ul = "cause", ll = 5, fl = "LinkedErrors", dl = (e = {}) => {
  const t = e.limit || ll, n = e.key || ul;
  return {
    name: fl,
    preprocessEvent(r, o, s) {
      const i = s.getOptions();
      Rc(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        Gn,
        i.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, pl = dl;
function ml(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    _c(),
    pc(),
    Yu(),
    xu(),
    tl(),
    pl(),
    Dc(),
    cl(),
    Ju()
  ];
}
const hl = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 }, gl = "https://817f965a1b1055130ff59d97bef82e5f@o4510270313660416.ingest.us.sentry.io/4510294325198848", tt = () => {
  try {
    const e = hl;
    if (e) {
      const t = e.MODE, n = e.NODE_ENV;
      if (t || n)
        return t || n || "production";
    }
  } catch {
  }
  return "production";
}, _l = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (e) {
    console.warn("[Sentry] Could not read manifest version:", e);
  }
  return "1.0.0";
}, po = () => {
  const e = tt();
  return {
    environment: e,
    enableLogs: !0,
    tracesSampleRate: e === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: _l(),
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
function El(e) {
  return e.filter((t) => {
    const n = t.name || (typeof t == "function" ? t.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const yl = () => {
  const e = tt();
  return {
    ...po(),
    tracesSampleRate: e === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(t) {
      const n = po().beforeSend?.(t) ?? t;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
}, sn = "__V0_SENTRY_CONTENT_INITIALIZED";
let Ze = !1, _e = null, Ee = null, ce = null;
async function Sl(e = 3, t = 50) {
  for (let o = 0; o < e; o++) {
    if (Ze && _e && Ee)
      return { client: _e, scope: Ee };
    o < e - 1 && await new Promise((s) => setTimeout(s, t));
  }
  return tt() === "development" && console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries"), { client: null, scope: new B() };
}
function Tl() {
  return globalThis[sn] === !0 ? Ze && _e && Ee ? { client: _e, scope: Ee } : (ce || (ce = Sl(), ce.then((n) => {
    n.client && n.scope && (_e = n.client, Ee = n.scope, Ze = !0), ce = null;
  }).catch(() => {
    ce = null;
  })), { client: null, scope: new B() }) : (globalThis[sn] = !0, ce = bl().then(
    (t) => (_e = t.client, Ee = t.scope, Ze = !0, ce = null, t),
    (t) => {
      throw globalThis[sn] = !1, Ze = !1, _e = null, Ee = null, ce = null, t;
    }
  ), { client: null, scope: new B() });
}
async function bl() {
  try {
    const e = yl(), t = ml({}), n = El(t), r = new nu({
      dsn: gl,
      transport: Eu,
      stackParser: Lu,
      integrations: n,
      ...e
    }), o = new B();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([i, c]) => {
      o.setTag(i, c);
    }), r.init(), tt() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    return tt() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", e), { client: null, scope: new B() };
  }
}
const { client: Zl, scope: Jl } = Tl(), fe = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, Al = 1e4, wn = {
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
  entries: ms,
  setPrototypeOf: mo,
  isFrozen: Il,
  getPrototypeOf: Rl,
  getOwnPropertyDescriptor: Ol
} = Object;
let {
  freeze: F,
  seal: W,
  create: Cn
} = Object, {
  apply: Nn,
  construct: Dn
} = typeof Reflect < "u" && Reflect;
F || (F = function(t) {
  return t;
});
W || (W = function(t) {
  return t;
});
Nn || (Nn = function(t, n) {
  for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), s = 2; s < r; s++)
    o[s - 2] = arguments[s];
  return t.apply(n, o);
});
Dn || (Dn = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
    r[o - 1] = arguments[o];
  return new t(...r);
});
const Et = U(Array.prototype.forEach), vl = U(Array.prototype.lastIndexOf), ho = U(Array.prototype.pop), We = U(Array.prototype.push), wl = U(Array.prototype.splice), Rt = U(String.prototype.toLowerCase), an = U(String.prototype.toString), cn = U(String.prototype.match), Ye = U(String.prototype.replace), Cl = U(String.prototype.indexOf), Nl = U(String.prototype.trim), K = U(Object.prototype.hasOwnProperty), x = U(RegExp.prototype.test), qe = Dl(TypeError);
function U(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
      r[o - 1] = arguments[o];
    return Nn(e, t, r);
  };
}
function Dl(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return Dn(e, n);
  };
}
function S(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rt;
  mo && mo(e, null);
  let r = t.length;
  for (; r--; ) {
    let o = t[r];
    if (typeof o == "string") {
      const s = n(o);
      s !== o && (Il(t) || (t[r] = s), o = s);
    }
    e[o] = !0;
  }
  return e;
}
function Ll(e) {
  for (let t = 0; t < e.length; t++)
    K(e, t) || (e[t] = null);
  return e;
}
function re(e) {
  const t = Cn(null);
  for (const [n, r] of ms(e))
    K(e, n) && (Array.isArray(r) ? t[n] = Ll(r) : r && typeof r == "object" && r.constructor === Object ? t[n] = re(r) : t[n] = r);
  return t;
}
function Ke(e, t) {
  for (; e !== null; ) {
    const r = Ol(e, t);
    if (r) {
      if (r.get)
        return U(r.get);
      if (typeof r.value == "function")
        return U(r.value);
    }
    e = Rl(e);
  }
  function n() {
    return null;
  }
  return n;
}
const go = F(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), un = F(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), ln = F(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Ml = F(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), fn = F(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), kl = F(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), _o = F(["#text"]), Eo = F(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), dn = F(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), yo = F(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), yt = F(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), xl = W(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Pl = W(/<%[\w\W]*|[\w\W]*%>/gm), Fl = W(/\$\{[\w\W]*/gm), Ul = W(/^data-[\-\w.\u00B7-\uFFFF]+$/), $l = W(/^aria-[\-\w]+$/), hs = W(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Hl = W(/^(?:\w+script|data):/i), Bl = W(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), gs = W(/^html$/i), Gl = W(/^[a-z][.\w]*(-[.\w]+)+$/i);
var So = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: $l,
  ATTR_WHITESPACE: Bl,
  CUSTOM_ELEMENT: Gl,
  DATA_ATTR: Ul,
  DOCTYPE_NAME: gs,
  ERB_EXPR: Pl,
  IS_ALLOWED_URI: hs,
  IS_SCRIPT_OR_DATA: Hl,
  MUSTACHE_EXPR: xl,
  TMPLIT_EXPR: Fl
});
const Xe = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, zl = function() {
  return typeof window > "u" ? null : window;
}, jl = function(t, n) {
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
}, To = function() {
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
function _s() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : zl();
  const t = (g) => _s(g);
  if (t.version = "3.3.0", t.removed = [], !e || !e.document || e.document.nodeType !== Xe.document || !e.Element)
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
  } = e, T = u.prototype, Y = Ke(T, "cloneNode"), I = Ke(T, "remove"), q = Ke(T, "nextSibling"), z = Ke(T, "childNodes"), V = Ke(T, "parentNode");
  if (typeof i == "function") {
    const g = n.createElement("template");
    g.content && g.content.ownerDocument && (n = g.content.ownerDocument);
  }
  let v, Q = "";
  const {
    implementation: de,
    createNodeIterator: ys,
    createDocumentFragment: Ss,
    getElementsByTagName: Ts
  } = n, {
    importNode: bs
  } = r;
  let k = To();
  t.isSupported = typeof ms == "function" && typeof V == "function" && de && de.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: Ft,
    ERB_EXPR: Ut,
    TMPLIT_EXPR: $t,
    DATA_ATTR: As,
    ARIA_ATTR: Is,
    IS_SCRIPT_OR_DATA: Rs,
    ATTR_WHITESPACE: Yn,
    CUSTOM_ELEMENT: Os
  } = So;
  let {
    IS_ALLOWED_URI: qn
  } = So, w = null;
  const Kn = S({}, [...go, ...un, ...ln, ...fn, ..._o]);
  let N = null;
  const Xn = S({}, [...Eo, ...dn, ...yo, ...yt]);
  let R = Object.seal(Cn(null, {
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
  })), Ge = null, Ht = null;
  const Re = Object.seal(Cn(null, {
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
  let Vn = !0, Bt = !0, Zn = !1, Jn = !0, Oe = !1, at = !0, pe = !1, Gt = !1, zt = !1, ve = !1, ct = !1, ut = !1, Qn = !0, er = !1;
  const vs = "user-content-";
  let jt = !0, ze = !1, we = {}, Ce = null;
  const tr = S({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let nr = null;
  const rr = S({}, ["audio", "video", "img", "source", "image", "track"]);
  let Wt = null;
  const or = S({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), lt = "http://www.w3.org/1998/Math/MathML", ft = "http://www.w3.org/2000/svg", ee = "http://www.w3.org/1999/xhtml";
  let Ne = ee, Yt = !1, qt = null;
  const ws = S({}, [lt, ft, ee], an);
  let dt = S({}, ["mi", "mo", "mn", "ms", "mtext"]), pt = S({}, ["annotation-xml"]);
  const Cs = S({}, ["title", "style", "font", "a", "script"]);
  let je = null;
  const Ns = ["application/xhtml+xml", "text/html"], Ds = "text/html";
  let C = null, De = null;
  const Ls = n.createElement("form"), sr = function(a) {
    return a instanceof RegExp || a instanceof Function;
  }, Kt = function() {
    let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(De && De === a)) {
      if ((!a || typeof a != "object") && (a = {}), a = re(a), je = // eslint-disable-next-line unicorn/prefer-includes
      Ns.indexOf(a.PARSER_MEDIA_TYPE) === -1 ? Ds : a.PARSER_MEDIA_TYPE, C = je === "application/xhtml+xml" ? an : Rt, w = K(a, "ALLOWED_TAGS") ? S({}, a.ALLOWED_TAGS, C) : Kn, N = K(a, "ALLOWED_ATTR") ? S({}, a.ALLOWED_ATTR, C) : Xn, qt = K(a, "ALLOWED_NAMESPACES") ? S({}, a.ALLOWED_NAMESPACES, an) : ws, Wt = K(a, "ADD_URI_SAFE_ATTR") ? S(re(or), a.ADD_URI_SAFE_ATTR, C) : or, nr = K(a, "ADD_DATA_URI_TAGS") ? S(re(rr), a.ADD_DATA_URI_TAGS, C) : rr, Ce = K(a, "FORBID_CONTENTS") ? S({}, a.FORBID_CONTENTS, C) : tr, Ge = K(a, "FORBID_TAGS") ? S({}, a.FORBID_TAGS, C) : re({}), Ht = K(a, "FORBID_ATTR") ? S({}, a.FORBID_ATTR, C) : re({}), we = K(a, "USE_PROFILES") ? a.USE_PROFILES : !1, Vn = a.ALLOW_ARIA_ATTR !== !1, Bt = a.ALLOW_DATA_ATTR !== !1, Zn = a.ALLOW_UNKNOWN_PROTOCOLS || !1, Jn = a.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Oe = a.SAFE_FOR_TEMPLATES || !1, at = a.SAFE_FOR_XML !== !1, pe = a.WHOLE_DOCUMENT || !1, ve = a.RETURN_DOM || !1, ct = a.RETURN_DOM_FRAGMENT || !1, ut = a.RETURN_TRUSTED_TYPE || !1, zt = a.FORCE_BODY || !1, Qn = a.SANITIZE_DOM !== !1, er = a.SANITIZE_NAMED_PROPS || !1, jt = a.KEEP_CONTENT !== !1, ze = a.IN_PLACE || !1, qn = a.ALLOWED_URI_REGEXP || hs, Ne = a.NAMESPACE || ee, dt = a.MATHML_TEXT_INTEGRATION_POINTS || dt, pt = a.HTML_INTEGRATION_POINTS || pt, R = a.CUSTOM_ELEMENT_HANDLING || {}, a.CUSTOM_ELEMENT_HANDLING && sr(a.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (R.tagNameCheck = a.CUSTOM_ELEMENT_HANDLING.tagNameCheck), a.CUSTOM_ELEMENT_HANDLING && sr(a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (R.attributeNameCheck = a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), a.CUSTOM_ELEMENT_HANDLING && typeof a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (R.allowCustomizedBuiltInElements = a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), Oe && (Bt = !1), ct && (ve = !0), we && (w = S({}, _o), N = [], we.html === !0 && (S(w, go), S(N, Eo)), we.svg === !0 && (S(w, un), S(N, dn), S(N, yt)), we.svgFilters === !0 && (S(w, ln), S(N, dn), S(N, yt)), we.mathMl === !0 && (S(w, fn), S(N, yo), S(N, yt))), a.ADD_TAGS && (typeof a.ADD_TAGS == "function" ? Re.tagCheck = a.ADD_TAGS : (w === Kn && (w = re(w)), S(w, a.ADD_TAGS, C))), a.ADD_ATTR && (typeof a.ADD_ATTR == "function" ? Re.attributeCheck = a.ADD_ATTR : (N === Xn && (N = re(N)), S(N, a.ADD_ATTR, C))), a.ADD_URI_SAFE_ATTR && S(Wt, a.ADD_URI_SAFE_ATTR, C), a.FORBID_CONTENTS && (Ce === tr && (Ce = re(Ce)), S(Ce, a.FORBID_CONTENTS, C)), jt && (w["#text"] = !0), pe && S(w, ["html", "head", "body"]), w.table && (S(w, ["tbody"]), delete Ge.tbody), a.TRUSTED_TYPES_POLICY) {
        if (typeof a.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw qe('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof a.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw qe('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        v = a.TRUSTED_TYPES_POLICY, Q = v.createHTML("");
      } else
        v === void 0 && (v = jl(m, o)), v !== null && typeof Q == "string" && (Q = v.createHTML(""));
      F && F(a), De = a;
    }
  }, ir = S({}, [...un, ...ln, ...Ml]), ar = S({}, [...fn, ...kl]), Ms = function(a) {
    let f = V(a);
    (!f || !f.tagName) && (f = {
      namespaceURI: Ne,
      tagName: "template"
    });
    const h = Rt(a.tagName), A = Rt(f.tagName);
    return qt[a.namespaceURI] ? a.namespaceURI === ft ? f.namespaceURI === ee ? h === "svg" : f.namespaceURI === lt ? h === "svg" && (A === "annotation-xml" || dt[A]) : !!ir[h] : a.namespaceURI === lt ? f.namespaceURI === ee ? h === "math" : f.namespaceURI === ft ? h === "math" && pt[A] : !!ar[h] : a.namespaceURI === ee ? f.namespaceURI === ft && !pt[A] || f.namespaceURI === lt && !dt[A] ? !1 : !ar[h] && (Cs[h] || !ir[h]) : !!(je === "application/xhtml+xml" && qt[a.namespaceURI]) : !1;
  }, Z = function(a) {
    We(t.removed, {
      element: a
    });
    try {
      V(a).removeChild(a);
    } catch {
      I(a);
    }
  }, me = function(a, f) {
    try {
      We(t.removed, {
        attribute: f.getAttributeNode(a),
        from: f
      });
    } catch {
      We(t.removed, {
        attribute: null,
        from: f
      });
    }
    if (f.removeAttribute(a), a === "is")
      if (ve || ct)
        try {
          Z(f);
        } catch {
        }
      else
        try {
          f.setAttribute(a, "");
        } catch {
        }
  }, cr = function(a) {
    let f = null, h = null;
    if (zt)
      a = "<remove></remove>" + a;
    else {
      const O = cn(a, /^[\r\n\t ]+/);
      h = O && O[0];
    }
    je === "application/xhtml+xml" && Ne === ee && (a = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + a + "</body></html>");
    const A = v ? v.createHTML(a) : a;
    if (Ne === ee)
      try {
        f = new E().parseFromString(A, je);
      } catch {
      }
    if (!f || !f.documentElement) {
      f = de.createDocument(Ne, "template", null);
      try {
        f.documentElement.innerHTML = Yt ? Q : A;
      } catch {
      }
    }
    const M = f.body || f.documentElement;
    return a && h && M.insertBefore(n.createTextNode(h), M.childNodes[0] || null), Ne === ee ? Ts.call(f, pe ? "html" : "body")[0] : pe ? f.documentElement : M;
  }, ur = function(a) {
    return ys.call(
      a.ownerDocument || a,
      a,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Xt = function(a) {
    return a instanceof p && (typeof a.nodeName != "string" || typeof a.textContent != "string" || typeof a.removeChild != "function" || !(a.attributes instanceof d) || typeof a.removeAttribute != "function" || typeof a.setAttribute != "function" || typeof a.namespaceURI != "string" || typeof a.insertBefore != "function" || typeof a.hasChildNodes != "function");
  }, lr = function(a) {
    return typeof c == "function" && a instanceof c;
  };
  function te(g, a, f) {
    Et(g, (h) => {
      h.call(t, a, f, De);
    });
  }
  const fr = function(a) {
    let f = null;
    if (te(k.beforeSanitizeElements, a, null), Xt(a))
      return Z(a), !0;
    const h = C(a.nodeName);
    if (te(k.uponSanitizeElement, a, {
      tagName: h,
      allowedTags: w
    }), at && a.hasChildNodes() && !lr(a.firstElementChild) && x(/<[/\w!]/g, a.innerHTML) && x(/<[/\w!]/g, a.textContent) || a.nodeType === Xe.progressingInstruction || at && a.nodeType === Xe.comment && x(/<[/\w]/g, a.data))
      return Z(a), !0;
    if (!(Re.tagCheck instanceof Function && Re.tagCheck(h)) && (!w[h] || Ge[h])) {
      if (!Ge[h] && pr(h) && (R.tagNameCheck instanceof RegExp && x(R.tagNameCheck, h) || R.tagNameCheck instanceof Function && R.tagNameCheck(h)))
        return !1;
      if (jt && !Ce[h]) {
        const A = V(a) || a.parentNode, M = z(a) || a.childNodes;
        if (M && A) {
          const O = M.length;
          for (let H = O - 1; H >= 0; --H) {
            const ne = Y(M[H], !0);
            ne.__removalCount = (a.__removalCount || 0) + 1, A.insertBefore(ne, q(a));
          }
        }
      }
      return Z(a), !0;
    }
    return a instanceof u && !Ms(a) || (h === "noscript" || h === "noembed" || h === "noframes") && x(/<\/no(script|embed|frames)/i, a.innerHTML) ? (Z(a), !0) : (Oe && a.nodeType === Xe.text && (f = a.textContent, Et([Ft, Ut, $t], (A) => {
      f = Ye(f, A, " ");
    }), a.textContent !== f && (We(t.removed, {
      element: a.cloneNode()
    }), a.textContent = f)), te(k.afterSanitizeElements, a, null), !1);
  }, dr = function(a, f, h) {
    if (Qn && (f === "id" || f === "name") && (h in n || h in Ls))
      return !1;
    if (!(Bt && !Ht[f] && x(As, f))) {
      if (!(Vn && x(Is, f))) {
        if (!(Re.attributeCheck instanceof Function && Re.attributeCheck(f, a))) {
          if (!N[f] || Ht[f]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(pr(a) && (R.tagNameCheck instanceof RegExp && x(R.tagNameCheck, a) || R.tagNameCheck instanceof Function && R.tagNameCheck(a)) && (R.attributeNameCheck instanceof RegExp && x(R.attributeNameCheck, f) || R.attributeNameCheck instanceof Function && R.attributeNameCheck(f, a)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              f === "is" && R.allowCustomizedBuiltInElements && (R.tagNameCheck instanceof RegExp && x(R.tagNameCheck, h) || R.tagNameCheck instanceof Function && R.tagNameCheck(h)))
            ) return !1;
          } else if (!Wt[f]) {
            if (!x(qn, Ye(h, Yn, ""))) {
              if (!((f === "src" || f === "xlink:href" || f === "href") && a !== "script" && Cl(h, "data:") === 0 && nr[a])) {
                if (!(Zn && !x(Rs, Ye(h, Yn, "")))) {
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
  }, pr = function(a) {
    return a !== "annotation-xml" && cn(a, Os);
  }, mr = function(a) {
    te(k.beforeSanitizeAttributes, a, null);
    const {
      attributes: f
    } = a;
    if (!f || Xt(a))
      return;
    const h = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: N,
      forceKeepAttr: void 0
    };
    let A = f.length;
    for (; A--; ) {
      const M = f[A], {
        name: O,
        namespaceURI: H,
        value: ne
      } = M, Le = C(O), Vt = ne;
      let D = O === "value" ? Vt : Nl(Vt);
      if (h.attrName = Le, h.attrValue = D, h.keepAttr = !0, h.forceKeepAttr = void 0, te(k.uponSanitizeAttribute, a, h), D = h.attrValue, er && (Le === "id" || Le === "name") && (me(O, a), D = vs + D), at && x(/((--!?|])>)|<\/(style|title|textarea)/i, D)) {
        me(O, a);
        continue;
      }
      if (Le === "attributename" && cn(D, "href")) {
        me(O, a);
        continue;
      }
      if (h.forceKeepAttr)
        continue;
      if (!h.keepAttr) {
        me(O, a);
        continue;
      }
      if (!Jn && x(/\/>/i, D)) {
        me(O, a);
        continue;
      }
      Oe && Et([Ft, Ut, $t], (gr) => {
        D = Ye(D, gr, " ");
      });
      const hr = C(a.nodeName);
      if (!dr(hr, Le, D)) {
        me(O, a);
        continue;
      }
      if (v && typeof m == "object" && typeof m.getAttributeType == "function" && !H)
        switch (m.getAttributeType(hr, Le)) {
          case "TrustedHTML": {
            D = v.createHTML(D);
            break;
          }
          case "TrustedScriptURL": {
            D = v.createScriptURL(D);
            break;
          }
        }
      if (D !== Vt)
        try {
          H ? a.setAttributeNS(H, O, D) : a.setAttribute(O, D), Xt(a) ? Z(a) : ho(t.removed);
        } catch {
          me(O, a);
        }
    }
    te(k.afterSanitizeAttributes, a, null);
  }, ks = function g(a) {
    let f = null;
    const h = ur(a);
    for (te(k.beforeSanitizeShadowDOM, a, null); f = h.nextNode(); )
      te(k.uponSanitizeShadowNode, f, null), fr(f), mr(f), f.content instanceof s && g(f.content);
    te(k.afterSanitizeShadowDOM, a, null);
  };
  return t.sanitize = function(g) {
    let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, f = null, h = null, A = null, M = null;
    if (Yt = !g, Yt && (g = "<!-->"), typeof g != "string" && !lr(g))
      if (typeof g.toString == "function") {
        if (g = g.toString(), typeof g != "string")
          throw qe("dirty is not a string, aborting");
      } else
        throw qe("toString is not a function");
    if (!t.isSupported)
      return g;
    if (Gt || Kt(a), t.removed = [], typeof g == "string" && (ze = !1), ze) {
      if (g.nodeName) {
        const ne = C(g.nodeName);
        if (!w[ne] || Ge[ne])
          throw qe("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (g instanceof c)
      f = cr("<!---->"), h = f.ownerDocument.importNode(g, !0), h.nodeType === Xe.element && h.nodeName === "BODY" || h.nodeName === "HTML" ? f = h : f.appendChild(h);
    else {
      if (!ve && !Oe && !pe && // eslint-disable-next-line unicorn/prefer-includes
      g.indexOf("<") === -1)
        return v && ut ? v.createHTML(g) : g;
      if (f = cr(g), !f)
        return ve ? null : ut ? Q : "";
    }
    f && zt && Z(f.firstChild);
    const O = ur(ze ? g : f);
    for (; A = O.nextNode(); )
      fr(A), mr(A), A.content instanceof s && ks(A.content);
    if (ze)
      return g;
    if (ve) {
      if (ct)
        for (M = Ss.call(f.ownerDocument); f.firstChild; )
          M.appendChild(f.firstChild);
      else
        M = f;
      return (N.shadowroot || N.shadowrootmode) && (M = bs.call(r, M, !0)), M;
    }
    let H = pe ? f.outerHTML : f.innerHTML;
    return pe && w["!doctype"] && f.ownerDocument && f.ownerDocument.doctype && f.ownerDocument.doctype.name && x(gs, f.ownerDocument.doctype.name) && (H = "<!DOCTYPE " + f.ownerDocument.doctype.name + `>
` + H), Oe && Et([Ft, Ut, $t], (ne) => {
      H = Ye(H, ne, " ");
    }), v && ut ? v.createHTML(H) : H;
  }, t.setConfig = function() {
    let g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Kt(g), Gt = !0;
  }, t.clearConfig = function() {
    De = null, Gt = !1;
  }, t.isValidAttribute = function(g, a, f) {
    De || Kt({});
    const h = C(g), A = C(a);
    return dr(h, A, f);
  }, t.addHook = function(g, a) {
    typeof a == "function" && We(k[g], a);
  }, t.removeHook = function(g, a) {
    if (a !== void 0) {
      const f = vl(k[g], a);
      return f === -1 ? void 0 : wl(k[g], f, 1)[0];
    }
    return ho(k[g]);
  }, t.removeHooks = function(g) {
    k[g] = [];
  }, t.removeAllHooks = function() {
    k = To();
  }, t;
}
var Wl = _s();
const St = {
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
    const t = location.hostname, { [fe.BLACKLIST]: n } = await chrome.storage.local.get(fe.BLACKLIST);
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
let bo = !1;
chrome.runtime.onMessage.addListener((e, t, n) => {
  try {
    if (e?.type === wn.TOGGLE_ZEN_MODE)
      return ql(e.payload?.preset), n?.({ success: !0 }), !0;
    if (e?.type === wn.SITE_CUSTOMIZATION_UPDATED) {
      const r = e.payload;
      if (r?.domain === "youtube.com" && window.location.hostname.includes("youtube.com"))
        return Es(r.config), n?.({ success: !0 }), !0;
    }
  } catch (r) {
    console.warn("[v0][CS] Message handler failed:", r), n?.({ success: !1, error: String(r) });
  }
  return !1;
});
const Ao = async () => {
  if (!bo) {
    bo = !0;
    try {
      const e = document.body?.innerText?.slice(0, Al) ?? "", t = location.href, n = await Yl(e, t), r = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: wn.CONTENT_ANALYSIS_RESULT, id: r, source: "content-script", ts: Date.now(), payload: { result: n } }, (o) => {
        const s = chrome.runtime.lastError;
        s && !s.message.includes("Receiving end does not exist") && !s.message.includes("message channel closed") && console.warn("[v0][CS] Content analysis message error:", s.message);
      });
    } catch (e) {
      console.error("[v0][CS] analyzePageContent error:", e);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? Ao() : document.addEventListener("DOMContentLoaded", Ao, { once: !0 });
window.location.hostname.includes("youtube.com") && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => Io(), { once: !0 }) : Io());
async function Yl(e, t) {
  const { [fe.SETTINGS]: n } = await chrome.storage.sync.get(fe.SETTINGS), r = n?.productiveKeywords || [], o = n?.distractingKeywords || [], s = e.toLowerCase();
  t.toLowerCase();
  const i = document.title.toLowerCase(), c = document.querySelector('meta[name="description"]')?.getAttribute("content")?.toLowerCase() || "", u = `${s} ${i} ${c}`;
  let l = 0, d = 0;
  const p = (q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((q) => {
    const z = new RegExp(`\\b${p(q)}\\b`, "gi"), V = u.match(z);
    if (V) {
      const v = V.length, Q = i.match(z)?.length || 0, de = c.match(z)?.length || 0;
      l += v + Q * 2 + de * 1.5;
    }
  }), o.forEach((q) => {
    const z = new RegExp(`\\b${p(q)}\\b`, "gi"), V = u.match(z);
    if (V) {
      const v = V.length, Q = i.match(z)?.length || 0, de = c.match(z)?.length || 0;
      d += v + Q * 2 + de * 1.5;
    }
  });
  const E = l + d, m = E > 0 ? d / E : 0, T = u.length, Y = E / Math.max(T / 1e3, 1);
  let I = "neutral";
  return m > 0.6 && Y > 0.5 ? I = "distracting" : m < 0.4 && l > 0 && Y > 0.3 && (I = "productive"), {
    url: t,
    classification: I,
    score: m,
    categories: {
      productiveScore: l,
      distractingScore: d,
      keywordDensity: Y,
      textLength: T
    },
    flagged: I === "distracting"
  };
}
function Es(e) {
  const t = [];
  e.hideHomepage && t.push(...St.hideHomepage), e.hideShorts && t.push(...St.hideShorts), e.hideComments && t.push(...St.hideComments), e.hideRecommendations && t.push(...St.hideRecommendations);
  const n = document.getElementById("v0-youtube-customization");
  if (n && n.remove(), t.length > 0) {
    const r = document.createElement("style");
    r.id = "v0-youtube-customization", r.textContent = t.map((o) => `${o} { display: none !important; }`).join(`
`), document.head.appendChild(r);
  }
}
async function Io() {
  if (window.location.hostname.includes("youtube.com"))
    try {
      const { [fe.SITE_CUSTOMIZATIONS]: e } = await chrome.storage.local.get(fe.SITE_CUSTOMIZATIONS), t = e?.["youtube.com"];
      t && (Es(t), console.log("[v0][CS] YouTube customization applied:", t));
    } catch (e) {
      console.error("[v0][CS] Failed to load YouTube customization:", e);
    }
}
let pn = !1, Me = null, Ot = "", J = null;
function ql(e) {
  if (pn) {
    const t = document.getElementById("zen-mode-styles");
    t && t.remove(), document.body.classList.remove("zen-mode"), window.location.hostname.includes("youtube.com") || (Me !== null && (document.body.innerHTML = "", document.body.appendChild(Me.cloneNode(!0)), document.body.style.background = Ot, Me = null, Ot = ""), J && (J.remove(), J = null)), pn = !1, console.log("[v0][CS] Zen Mode deactivated");
  } else {
    const t = document.createDocumentFragment();
    for (; document.body.firstChild; )
      t.appendChild(document.body.firstChild);
    Me = t, Ot = document.body.style.background || "", Kl(e), pn = !0, console.log("[v0][CS] Zen Mode activated");
  }
}
function Kl(e) {
  try {
    e && Vl(e);
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
      const n = Xl();
      if (J && J.remove(), J = document.createElement("div"), J.id = "zen-mode-container", n.trim())
        if (!/<[^>]*>/g.test(n))
          J.textContent = n;
        else {
          const o = Wl.sanitize(n, {
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
    throw console.error("[v0][CS] Error applying Zen Mode:", t), Me !== null && (document.body.innerHTML = "", document.body.appendChild(Me.cloneNode(!0)), document.body.style.background = Ot), t;
  }
}
function Xl() {
  if (window.location.hostname.includes("youtube.com")) {
    const r = document.querySelector("#primary #contents") || document.querySelector("#primary") || document.querySelector("#contents");
    if (r) return r.innerHTML;
  }
  const e = document.querySelector("article"), t = document.querySelector("main"), n = document.querySelector('[role="main"]');
  return e ? e.innerHTML : t ? t.innerHTML : n ? n.innerHTML : document.body.innerHTML;
}
async function Vl(e) {
  try {
    const { [fe.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(
      fe.SITE_CUSTOMIZATIONS
    ), n = t?.[e];
    n?.selectorsToRemove && n.selectorsToRemove.forEach((r) => {
      document.querySelectorAll(r).forEach((o) => o.remove());
    });
  } catch (t) {
    console.warn("[v0][CS] applyPreset failed:", t);
  }
}
