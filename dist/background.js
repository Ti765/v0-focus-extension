const wv = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let e = "production";
    try {
      const n = wv;
      n && (e = n.MODE || n.NODE_ENV || "production");
    } catch {
    }
    globalThis.process = {
      env: {
        NODE_ENV: e
      },
      version: "",
      versions: {},
      platform: "browser",
      browser: !0
    }, e === "development" && console.log("[v0][Polyfill] process object defined:", globalThis.process);
  }
})();
const x = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, J = globalThis, Xn = "10.22.0";
function mr() {
  return Aa(J), J;
}
function Aa(t) {
  const e = t.__SENTRY__ = t.__SENTRY__ || {};
  return e.version = e.version || Xn, e[Xn] = e[Xn] || {};
}
function Zr(t, e, n = J) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, s = r[Xn] = r[Xn] || {};
  return s[t] || (s[t] = e());
}
const pm = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], bv = "Sentry Logger ", zo = {};
function ui(t) {
  if (!("console" in J))
    return t();
  const e = J.console, n = {}, r = Object.keys(zo);
  r.forEach((s) => {
    const i = zo[s];
    n[s] = e[s], e[s] = i;
  });
  try {
    return t();
  } finally {
    r.forEach((s) => {
      e[s] = n[s];
    });
  }
}
function Av() {
  el().enabled = !0;
}
function Rv() {
  el().enabled = !1;
}
function mm() {
  return el().enabled;
}
function Cv(...t) {
  Zu("log", ...t);
}
function Pv(...t) {
  Zu("warn", ...t);
}
function Dv(...t) {
  Zu("error", ...t);
}
function Zu(t, ...e) {
  x && mm() && ui(() => {
    J.console[t](`${bv}[${t}]:`, ...e);
  });
}
function el() {
  return x ? Zr("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const M = {
  /** Enable logging. */
  enable: Av,
  /** Disable logging. */
  disable: Rv,
  /** Check if logging is enabled. */
  isEnabled: mm,
  /** Log a message. */
  log: Cv,
  /** Log a warning. */
  warn: Pv,
  /** Log an error. */
  error: Dv
}, gm = 50, sr = "?", Rh = /\(error: (.*)\)/, Ch = /captureMessage|captureException/;
function kv(...t) {
  const e = t.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, s = 0) => {
    const i = [], o = n.split(`
`);
    for (let c = r; c < o.length; c++) {
      let u = o[c];
      u.length > 1024 && (u = u.slice(0, 1024));
      const d = Rh.test(u) ? u.replace(Rh, "$1") : u;
      if (!d.match(/\S*Error: /)) {
        for (const f of e) {
          const p = f(d);
          if (p) {
            i.push(p);
            break;
          }
        }
        if (i.length >= gm + s)
          break;
      }
    }
    return Nv(i.slice(s));
  };
}
function Nv(t) {
  if (!t.length)
    return [];
  const e = Array.from(t);
  return /sentryWrapped/.test(no(e).function || "") && e.pop(), e.reverse(), Ch.test(no(e).function || "") && (e.pop(), Ch.test(no(e).function || "") && e.pop()), e.slice(0, gm).map((n) => ({
    ...n,
    filename: n.filename || no(e).filename,
    function: n.function || sr
  }));
}
function no(t) {
  return t[t.length - 1] || {};
}
const Dc = "<anonymous>";
function Kt(t) {
  try {
    return !t || typeof t != "function" ? Dc : t.name || Dc;
  } catch {
    return Dc;
  }
}
function Ph(t) {
  const e = t.exception;
  if (e) {
    const n = [];
    try {
      return e.values.forEach((r) => {
        r.stacktrace.frames && n.push(...r.stacktrace.frames);
      }), n;
    } catch {
      return;
    }
  }
}
const To = {}, Dh = {};
function Nn(t, e) {
  To[t] = To[t] || [], To[t].push(e);
}
function On(t, e) {
  if (!Dh[t]) {
    Dh[t] = !0;
    try {
      e();
    } catch (n) {
      x && M.error(`Error while instrumenting ${t}`, n);
    }
  }
}
function lt(t, e) {
  const n = t && To[t];
  if (n)
    for (const r of n)
      try {
        r(e);
      } catch (s) {
        x && M.error(
          `Error while triggering instrumentation handler.
Type: ${t}
Name: ${Kt(r)}
Error:`,
          s
        );
      }
}
let kc = null;
function _m(t) {
  const e = "error";
  Nn(e, t), On(e, Ov);
}
function Ov() {
  kc = J.onerror, J.onerror = function(t, e, n, r, s) {
    return lt("error", {
      column: r,
      error: s,
      line: n,
      msg: t,
      url: e
    }), kc ? kc.apply(this, arguments) : !1;
  }, J.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let Nc = null;
function ym(t) {
  const e = "unhandledrejection";
  Nn(e, t), On(e, Mv);
}
function Mv() {
  Nc = J.onunhandledrejection, J.onunhandledrejection = function(t) {
    return lt("unhandledrejection", t), Nc ? Nc.apply(this, arguments) : !0;
  }, J.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const Em = Object.prototype.toString;
function tl(t) {
  switch (Em.call(t)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return Yt(t, Error);
  }
}
function es(t, e) {
  return Em.call(t) === `[object ${e}]`;
}
function vm(t) {
  return es(t, "ErrorEvent");
}
function kh(t) {
  return es(t, "DOMError");
}
function Lv(t) {
  return es(t, "DOMException");
}
function Ht(t) {
  return es(t, "String");
}
function Ra(t) {
  return typeof t == "object" && t !== null && "__sentry_template_string__" in t && "__sentry_template_values__" in t;
}
function ir(t) {
  return t === null || Ra(t) || typeof t != "object" && typeof t != "function";
}
function Ws(t) {
  return es(t, "Object");
}
function Ca(t) {
  return typeof Event < "u" && Yt(t, Event);
}
function xv(t) {
  return typeof Element < "u" && Yt(t, Element);
}
function Vv(t) {
  return es(t, "RegExp");
}
function ts(t) {
  return !!(t?.then && typeof t.then == "function");
}
function Uv(t) {
  return Ws(t) && "nativeEvent" in t && "preventDefault" in t && "stopPropagation" in t;
}
function Yt(t, e) {
  try {
    return t instanceof e;
  } catch {
    return !1;
  }
}
function Sm(t) {
  return !!(typeof t == "object" && t !== null && (t.__isVue || t._isVue));
}
function Tm(t) {
  return typeof Request < "u" && Yt(t, Request);
}
const nl = J, Fv = 80;
function Ot(t, e = {}) {
  if (!t)
    return "<unknown>";
  try {
    let n = t;
    const r = 5, s = [];
    let i = 0, o = 0;
    const c = " > ", u = c.length;
    let d;
    const f = Array.isArray(e) ? e : e.keyAttrs, p = !Array.isArray(e) && e.maxStringLength || Fv;
    for (; n && i++ < r && (d = Bv(n, f), !(d === "html" || i > 1 && o + s.length * u + d.length >= p)); )
      s.push(d), o += d.length, n = n.parentNode;
    return s.reverse().join(c);
  } catch {
    return "<unknown>";
  }
}
function Bv(t, e) {
  const n = t, r = [];
  if (!n?.tagName)
    return "";
  if (nl.HTMLElement && n instanceof HTMLElement && n.dataset) {
    if (n.dataset.sentryComponent)
      return n.dataset.sentryComponent;
    if (n.dataset.sentryElement)
      return n.dataset.sentryElement;
  }
  r.push(n.tagName.toLowerCase());
  const s = e?.length ? e.filter((o) => n.getAttribute(o)).map((o) => [o, n.getAttribute(o)]) : null;
  if (s?.length)
    s.forEach((o) => {
      r.push(`[${o[0]}="${o[1]}"]`);
    });
  else {
    n.id && r.push(`#${n.id}`);
    const o = n.className;
    if (o && Ht(o)) {
      const c = o.split(/\s+/);
      for (const u of c)
        r.push(`.${u}`);
    }
  }
  const i = ["aria-label", "type", "name", "title", "alt"];
  for (const o of i) {
    const c = n.getAttribute(o);
    c && r.push(`[${o}="${c}"]`);
  }
  return r.join("");
}
function Pa() {
  try {
    return nl.document.location.href;
  } catch {
    return "";
  }
}
function Im(t) {
  if (!nl.HTMLElement)
    return null;
  let e = t;
  const n = 5;
  for (let r = 0; r < n; r++) {
    if (!e)
      return null;
    if (e instanceof HTMLElement) {
      if (e.dataset.sentryComponent)
        return e.dataset.sentryComponent;
      if (e.dataset.sentryElement)
        return e.dataset.sentryElement;
    }
    e = e.parentNode;
  }
  return null;
}
function Wo(t, e = 0) {
  return typeof t != "string" || e === 0 || t.length <= e ? t : `${t.slice(0, e)}...`;
}
function Nh(t, e) {
  if (!Array.isArray(t))
    return "";
  const n = [];
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    try {
      Sm(s) ? n.push("[VueViewModel]") : n.push(String(s));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(e);
}
function Io(t, e, n = !1) {
  return Ht(t) ? Vv(e) ? e.test(t) : Ht(e) ? n ? t === e : t.includes(e) : !1 : !1;
}
function vn(t, e = [], n = !1) {
  return e.some((r) => Io(t, r, n));
}
function ot(t, e, n) {
  if (!(e in t))
    return;
  const r = t[e];
  if (typeof r != "function")
    return;
  const s = n(r);
  typeof s == "function" && wm(s, r);
  try {
    t[e] = s;
  } catch {
    x && M.log(`Failed to replace method "${e}" in object`, t);
  }
}
function at(t, e, n) {
  try {
    Object.defineProperty(t, e, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: n,
      writable: !0,
      configurable: !0
    });
  } catch {
    x && M.log(`Failed to add non-enumerable property "${e}" to object`, t);
  }
}
function wm(t, e) {
  try {
    const n = e.prototype || {};
    t.prototype = e.prototype = n, at(t, "__sentry_original__", e);
  } catch {
  }
}
function rl(t) {
  return t.__sentry_original__;
}
function bm(t) {
  if (tl(t))
    return {
      message: t.message,
      name: t.name,
      stack: t.stack,
      ...Mh(t)
    };
  if (Ca(t)) {
    const e = {
      type: t.type,
      target: Oh(t.target),
      currentTarget: Oh(t.currentTarget),
      ...Mh(t)
    };
    return typeof CustomEvent < "u" && Yt(t, CustomEvent) && (e.detail = t.detail), e;
  } else
    return t;
}
function Oh(t) {
  try {
    return xv(t) ? Ot(t) : Object.prototype.toString.call(t);
  } catch {
    return "<unknown>";
  }
}
function Mh(t) {
  if (typeof t == "object" && t !== null) {
    const e = {};
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    return e;
  } else
    return {};
}
function $v(t, e = 40) {
  const n = Object.keys(bm(t));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= e)
    return Wo(r, e);
  for (let s = n.length; s > 0; s--) {
    const i = n.slice(0, s).join(", ");
    if (!(i.length > e))
      return s === n.length ? i : Wo(i, e);
  }
  return "";
}
function jv() {
  const t = J;
  return t.crypto || t.msCrypto;
}
let Oc;
function Hv() {
  return Math.random() * 16;
}
function dt(t = jv()) {
  try {
    if (t?.randomUUID)
      return t.randomUUID().replace(/-/g, "");
  } catch {
  }
  return Oc || (Oc = "10000000100040008000" + 1e11), Oc.replace(
    /[018]/g,
    (e) => (
      // eslint-disable-next-line no-bitwise
      (e ^ (Hv() & 15) >> e / 4).toString(16)
    )
  );
}
function Am(t) {
  return t.exception?.values?.[0];
}
function Wn(t) {
  const { message: e, event_id: n } = t;
  if (e)
    return e;
  const r = Am(t);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function au(t, e, n) {
  const r = t.exception = t.exception || {}, s = r.values = r.values || [], i = s[0] = s[0] || {};
  i.value || (i.value = e || ""), i.type || (i.type = "Error");
}
function Ur(t, e) {
  const n = Am(t);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, s = n.mechanism;
  if (n.mechanism = { ...r, ...s, ...e }, e && "data" in e) {
    const i = { ...s?.data, ...e.data };
    n.mechanism.data = i;
  }
}
function Lh(t) {
  if (Gv(t))
    return !0;
  try {
    at(t, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function Gv(t) {
  try {
    return t.__sentry_captured__;
  } catch {
  }
}
const Rm = 1e3;
function gr() {
  return Date.now() / Rm;
}
function qv() {
  const { performance: t } = J;
  if (!t?.now || !t.timeOrigin)
    return gr;
  const e = t.timeOrigin;
  return () => (e + t.now()) / Rm;
}
let xh;
function be() {
  return (xh ?? (xh = qv()))();
}
let Mc;
function zv() {
  const { performance: t } = J;
  if (!t?.now)
    return [void 0, "none"];
  const e = 3600 * 1e3, n = t.now(), r = Date.now(), s = t.timeOrigin ? Math.abs(t.timeOrigin + n - r) : e, i = s < e, o = t.timing?.navigationStart, u = typeof o == "number" ? Math.abs(o + n - r) : e, d = u < e;
  return i || d ? s <= u ? [t.timeOrigin, "timeOrigin"] : [o, "navigationStart"] : [r, "dateNow"];
}
function ct() {
  return Mc || (Mc = zv()), Mc[0];
}
function Wv(t) {
  const e = be(), n = {
    sid: dt(),
    init: !0,
    timestamp: e,
    started: e,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => Yv(n)
  };
  return t && Fr(n, t), n;
}
function Fr(t, e = {}) {
  if (e.user && (!t.ipAddress && e.user.ip_address && (t.ipAddress = e.user.ip_address), !t.did && !e.did && (t.did = e.user.id || e.user.email || e.user.username)), t.timestamp = e.timestamp || be(), e.abnormal_mechanism && (t.abnormal_mechanism = e.abnormal_mechanism), e.ignoreDuration && (t.ignoreDuration = e.ignoreDuration), e.sid && (t.sid = e.sid.length === 32 ? e.sid : dt()), e.init !== void 0 && (t.init = e.init), !t.did && e.did && (t.did = `${e.did}`), typeof e.started == "number" && (t.started = e.started), t.ignoreDuration)
    t.duration = void 0;
  else if (typeof e.duration == "number")
    t.duration = e.duration;
  else {
    const n = t.timestamp - t.started;
    t.duration = n >= 0 ? n : 0;
  }
  e.release && (t.release = e.release), e.environment && (t.environment = e.environment), !t.ipAddress && e.ipAddress && (t.ipAddress = e.ipAddress), !t.userAgent && e.userAgent && (t.userAgent = e.userAgent), typeof e.errors == "number" && (t.errors = e.errors), e.status && (t.status = e.status);
}
function Kv(t, e) {
  let n = {};
  t.status === "ok" && (n = { status: "exited" }), Fr(t, n);
}
function Yv(t) {
  return {
    sid: `${t.sid}`,
    init: t.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(t.started * 1e3).toISOString(),
    timestamp: new Date(t.timestamp * 1e3).toISOString(),
    status: t.status,
    errors: t.errors,
    did: typeof t.did == "number" || typeof t.did == "string" ? `${t.did}` : void 0,
    duration: t.duration,
    abnormal_mechanism: t.abnormal_mechanism,
    attrs: {
      release: t.release,
      environment: t.environment,
      ip_address: t.ipAddress,
      user_agent: t.userAgent
    }
  };
}
function li(t, e, n = 2) {
  if (!e || typeof e != "object" || n <= 0)
    return e;
  if (t && Object.keys(e).length === 0)
    return t;
  const r = { ...t };
  for (const s in e)
    Object.prototype.hasOwnProperty.call(e, s) && (r[s] = li(r[s], e[s], n - 1));
  return r;
}
function Jt() {
  return dt();
}
function Gt() {
  return dt().substring(16);
}
const cu = "_sentrySpan";
function Br(t, e) {
  e ? at(t, cu, e) : delete t[cu];
}
function Ks(t) {
  return t[cu];
}
const Jv = 100;
class fe {
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
      traceId: Jt(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const e = new fe();
    return e._breadcrumbs = [...this._breadcrumbs], e._tags = { ...this._tags }, e._extra = { ...this._extra }, e._contexts = { ...this._contexts }, this._contexts.flags && (e._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), e._user = this._user, e._level = this._level, e._session = this._session, e._transactionName = this._transactionName, e._fingerprint = this._fingerprint, e._eventProcessors = [...this._eventProcessors], e._attachments = [...this._attachments], e._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, e._propagationContext = { ...this._propagationContext }, e._client = this._client, e._lastEventId = this._lastEventId, Br(e, Ks(this)), e;
  }
  /**
   * Update the client assigned to this scope.
   * Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
   * as well as manually created scopes.
   */
  setClient(e) {
    this._client = e;
  }
  /**
   * Set the ID of the last captured error event.
   * This is generally only captured on the isolation scope.
   */
  setLastEventId(e) {
    this._lastEventId = e;
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
  addScopeListener(e) {
    this._scopeListeners.push(e);
  }
  /**
   * Add an event processor that will be called before an event is sent.
   */
  addEventProcessor(e) {
    return this._eventProcessors.push(e), this;
  }
  /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */
  setUser(e) {
    return this._user = e || {
      email: void 0,
      id: void 0,
      ip_address: void 0,
      username: void 0
    }, this._session && Fr(this._session, { user: e }), this._notifyScopeListeners(), this;
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
  setTags(e) {
    return this._tags = {
      ...this._tags,
      ...e
    }, this._notifyScopeListeners(), this;
  }
  /**
   * Set a single tag that will be sent as tags data with the event.
   */
  setTag(e, n) {
    return this._tags = { ...this._tags, [e]: n }, this._notifyScopeListeners(), this;
  }
  /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */
  setExtras(e) {
    return this._extra = {
      ...this._extra,
      ...e
    }, this._notifyScopeListeners(), this;
  }
  /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */
  setExtra(e, n) {
    return this._extra = { ...this._extra, [e]: n }, this._notifyScopeListeners(), this;
  }
  /**
   * Sets the fingerprint on the scope to send with the events.
   * @param {string[]} fingerprint Fingerprint to group events in Sentry.
   */
  setFingerprint(e) {
    return this._fingerprint = e, this._notifyScopeListeners(), this;
  }
  /**
   * Sets the level on the scope for future events.
   */
  setLevel(e) {
    return this._level = e, this._notifyScopeListeners(), this;
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
  setTransactionName(e) {
    return this._transactionName = e, this._notifyScopeListeners(), this;
  }
  /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */
  setContext(e, n) {
    return n === null ? delete this._contexts[e] : this._contexts[e] = n, this._notifyScopeListeners(), this;
  }
  /**
   * Set the session for the scope.
   */
  setSession(e) {
    return e ? this._session = e : delete this._session, this._notifyScopeListeners(), this;
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
  update(e) {
    if (!e)
      return this;
    const n = typeof e == "function" ? e(this) : e, r = n instanceof fe ? n.getScopeData() : Ws(n) ? e : void 0, { tags: s, extra: i, user: o, contexts: c, level: u, fingerprint: d = [], propagationContext: f } = r || {};
    return this._tags = { ...this._tags, ...s }, this._extra = { ...this._extra, ...i }, this._contexts = { ...this._contexts, ...c }, o && Object.keys(o).length && (this._user = o), u && (this._level = u), d.length && (this._fingerprint = d), f && (this._propagationContext = f), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, Br(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: Jt(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(e, n) {
    const r = typeof n == "number" ? n : Jv;
    if (r <= 0)
      return this;
    const s = {
      timestamp: gr(),
      ...e,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: e.message ? Wo(e.message, 2048) : e.message
    };
    return this._breadcrumbs.push(s), this._breadcrumbs.length > r && (this._breadcrumbs = this._breadcrumbs.slice(-r), this._client?.recordDroppedEvent("buffer_overflow", "log_item")), this._notifyScopeListeners(), this;
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
  addAttachment(e) {
    return this._attachments.push(e), this;
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
      span: Ks(this)
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(e) {
    return this._sdkProcessingMetadata = li(this._sdkProcessingMetadata, e, 2), this;
  }
  /**
   * Add propagation context to the scope, used for distributed tracing
   */
  setPropagationContext(e) {
    return this._propagationContext = e, this;
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
  captureException(e, n) {
    const r = n?.event_id || dt();
    if (!this._client)
      return x && M.warn("No client configured on scope - will not capture exception!"), r;
    const s = new Error("Sentry syntheticException");
    return this._client.captureException(
      e,
      {
        originalException: e,
        syntheticException: s,
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
  captureMessage(e, n, r) {
    const s = r?.event_id || dt();
    if (!this._client)
      return x && M.warn("No client configured on scope - will not capture message!"), s;
    const i = new Error(e);
    return this._client.captureMessage(
      e,
      n,
      {
        originalException: e,
        syntheticException: i,
        ...r,
        event_id: s
      },
      this
    ), s;
  }
  /**
   * Capture a Sentry event for this scope.
   *
   * @returns {string} The id of the captured event.
   */
  captureEvent(e, n) {
    const r = n?.event_id || dt();
    return this._client ? (this._client.captureEvent(e, { ...n, event_id: r }, this), r) : (x && M.warn("No client configured on scope - will not capture event!"), r);
  }
  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    this._notifyingListeners || (this._notifyingListeners = !0, this._scopeListeners.forEach((e) => {
      e(this);
    }), this._notifyingListeners = !1);
  }
}
function Xv() {
  return Zr("defaultCurrentScope", () => new fe());
}
function Qv() {
  return Zr("defaultIsolationScope", () => new fe());
}
class Zv {
  constructor(e, n) {
    let r;
    e ? r = e : r = new fe();
    let s;
    n ? s = n : s = new fe(), this._stack = [{ scope: r }], this._isolationScope = s;
  }
  /**
   * Fork a scope for the stack.
   */
  withScope(e) {
    const n = this._pushScope();
    let r;
    try {
      r = e(n);
    } catch (s) {
      throw this._popScope(), s;
    }
    return ts(r) ? r.then(
      (s) => (this._popScope(), s),
      (s) => {
        throw this._popScope(), s;
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
    const e = this.getScope().clone();
    return this._stack.push({
      client: this.getClient(),
      scope: e
    }), e;
  }
  /**
   * Pop a scope from the stack.
   */
  _popScope() {
    return this._stack.length <= 1 ? !1 : !!this._stack.pop();
  }
}
function $r() {
  const t = mr(), e = Aa(t);
  return e.stack = e.stack || new Zv(Xv(), Qv());
}
function eS(t) {
  return $r().withScope(t);
}
function tS(t, e) {
  const n = $r();
  return n.withScope(() => (n.getStackTop().scope = t, e(t)));
}
function Vh(t) {
  return $r().withScope(() => t($r().getIsolationScope()));
}
function nS() {
  return {
    withIsolationScope: Vh,
    withScope: eS,
    withSetScope: tS,
    withSetIsolationScope: (t, e) => Vh(e),
    getCurrentScope: () => $r().getScope(),
    getIsolationScope: () => $r().getIsolationScope()
  };
}
function ns(t) {
  const e = Aa(t);
  return e.acs ? e.acs : nS();
}
function oe() {
  const t = mr();
  return ns(t).getCurrentScope();
}
function Mn() {
  const t = mr();
  return ns(t).getIsolationScope();
}
function Cm() {
  return Zr("globalScope", () => new fe());
}
function di(...t) {
  const e = mr(), n = ns(e);
  if (t.length === 2) {
    const [r, s] = t;
    return r ? n.withSetScope(r, s) : n.withScope(s);
  }
  return n.withScope(t[0]);
}
function te() {
  return oe().getClient();
}
function Pm(t) {
  const e = t.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: s } = e, i = {
    trace_id: n,
    span_id: s || Gt()
  };
  return r && (i.parent_span_id = r), i;
}
const Dt = "sentry.source", sl = "sentry.sample_rate", Dm = "sentry.previous_trace_sample_rate", Xt = "sentry.op", Ie = "sentry.origin", Ys = "sentry.idle_span_finish_reason", hi = "sentry.measurement_unit", fi = "sentry.measurement_value", Uh = "sentry.custom_span_name", il = "sentry.profile_id", rs = "sentry.exclusive_time", rS = "sentry.link.type", sS = 0, km = 1, we = 2;
function iS(t) {
  if (t < 400 && t >= 100)
    return { code: km };
  if (t >= 400 && t < 500)
    switch (t) {
      case 401:
        return { code: we, message: "unauthenticated" };
      case 403:
        return { code: we, message: "permission_denied" };
      case 404:
        return { code: we, message: "not_found" };
      case 409:
        return { code: we, message: "already_exists" };
      case 413:
        return { code: we, message: "failed_precondition" };
      case 429:
        return { code: we, message: "resource_exhausted" };
      case 499:
        return { code: we, message: "cancelled" };
      default:
        return { code: we, message: "invalid_argument" };
    }
  if (t >= 500 && t < 600)
    switch (t) {
      case 501:
        return { code: we, message: "unimplemented" };
      case 503:
        return { code: we, message: "unavailable" };
      case 504:
        return { code: we, message: "deadline_exceeded" };
      default:
        return { code: we, message: "internal_error" };
    }
  return { code: we, message: "unknown_error" };
}
function Nm(t, e) {
  t.setAttribute("http.response.status_code", e);
  const n = iS(e);
  n.message !== "unknown_error" && t.setStatus(n);
}
const Om = "_sentryScope", Mm = "_sentryIsolationScope";
function oS(t) {
  try {
    const e = J.WeakRef;
    if (typeof e == "function")
      return new e(t);
  } catch {
  }
  return t;
}
function aS(t) {
  if (t) {
    if (typeof t == "object" && "deref" in t && typeof t.deref == "function")
      try {
        return t.deref();
      } catch {
        return;
      }
    return t;
  }
}
function cS(t, e, n) {
  t && (at(t, Mm, oS(n)), at(t, Om, e));
}
function Ko(t) {
  const e = t;
  return {
    scope: e[Om],
    isolationScope: aS(e[Mm])
  };
}
const ol = "sentry-", uS = /^sentry-/, lS = 8192;
function Lm(t) {
  const e = hS(t);
  if (!e)
    return;
  const n = Object.entries(e).reduce((r, [s, i]) => {
    if (s.match(uS)) {
      const o = s.slice(ol.length);
      r[o] = i;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function dS(t) {
  if (!t)
    return;
  const e = Object.entries(t).reduce(
    (n, [r, s]) => (s && (n[`${ol}${r}`] = s), n),
    {}
  );
  return fS(e);
}
function hS(t) {
  if (!(!t || !Ht(t) && !Array.isArray(t)))
    return Array.isArray(t) ? t.reduce((e, n) => {
      const r = Fh(n);
      return Object.entries(r).forEach(([s, i]) => {
        e[s] = i;
      }), e;
    }, {}) : Fh(t);
}
function Fh(t) {
  return t.split(",").map((e) => {
    const n = e.indexOf("=");
    if (n === -1)
      return [];
    const r = e.slice(0, n), s = e.slice(n + 1);
    return [r, s].map((i) => {
      try {
        return decodeURIComponent(i.trim());
      } catch {
        return;
      }
    });
  }).reduce((e, [n, r]) => (n && r && (e[n] = r), e), {});
}
function fS(t) {
  if (Object.keys(t).length !== 0)
    return Object.entries(t).reduce((e, [n, r], s) => {
      const i = `${encodeURIComponent(n)}=${encodeURIComponent(r)}`, o = s === 0 ? i : `${e},${i}`;
      return o.length > lS ? (x && M.warn(
        `Not adding key: ${n} with val: ${r} to baggage header due to exceeding baggage size limits.`
      ), e) : o;
    }, "");
}
const pS = /^o(\d+)\./, mS = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function gS(t) {
  return t === "http" || t === "https";
}
function ss(t, e = !1) {
  const { host: n, path: r, pass: s, port: i, projectId: o, protocol: c, publicKey: u } = t;
  return `${c}://${u}${e && s ? `:${s}` : ""}@${n}${i ? `:${i}` : ""}/${r && `${r}/`}${o}`;
}
function _S(t) {
  const e = mS.exec(t);
  if (!e) {
    ui(() => {
      console.error(`Invalid Sentry Dsn: ${t}`);
    });
    return;
  }
  const [n, r, s = "", i = "", o = "", c = ""] = e.slice(1);
  let u = "", d = c;
  const f = d.split("/");
  if (f.length > 1 && (u = f.slice(0, -1).join("/"), d = f.pop()), d) {
    const p = d.match(/^\d+/);
    p && (d = p[0]);
  }
  return xm({ host: i, pass: s, path: u, projectId: d, port: o, protocol: n, publicKey: r });
}
function xm(t) {
  return {
    protocol: t.protocol,
    publicKey: t.publicKey || "",
    pass: t.pass || "",
    host: t.host,
    port: t.port || "",
    path: t.path || "",
    projectId: t.projectId
  };
}
function yS(t) {
  if (!x)
    return !0;
  const { port: e, projectId: n, protocol: r } = t;
  return ["protocol", "publicKey", "host", "projectId"].find((o) => t[o] ? !1 : (M.error(`Invalid Sentry Dsn: ${o} missing`), !0)) ? !1 : n.match(/^\d+$/) ? gS(r) ? e && isNaN(parseInt(e, 10)) ? (M.error(`Invalid Sentry Dsn: Invalid port ${e}`), !1) : !0 : (M.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (M.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function ES(t) {
  return t.match(pS)?.[1];
}
function vS(t) {
  const e = t.getOptions(), { host: n } = t.getDsn() || {};
  let r;
  return e.orgId ? r = String(e.orgId) : n && (r = ES(n)), r;
}
function SS(t) {
  const e = typeof t == "string" ? _S(t) : xm(t);
  if (!(!e || !yS(e)))
    return e;
}
function Js(t) {
  if (typeof t == "boolean")
    return Number(t);
  const e = typeof t == "string" ? parseFloat(t) : t;
  if (!(typeof e != "number" || isNaN(e) || e < 0 || e > 1))
    return e;
}
const Vm = new RegExp(
  "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
  // whitespace
);
function TS(t) {
  if (!t)
    return;
  const e = t.match(Vm);
  if (!e)
    return;
  let n;
  return e[3] === "1" ? n = !0 : e[3] === "0" && (n = !1), {
    traceId: e[1],
    parentSampled: n,
    parentSpanId: e[2]
  };
}
function IS(t, e) {
  const n = TS(t), r = Lm(e);
  if (!n?.traceId)
    return {
      traceId: Jt(),
      sampleRand: Math.random()
    };
  const s = wS(n, r);
  r && (r.sample_rand = s.toString());
  const { traceId: i, parentSpanId: o, parentSampled: c } = n;
  return {
    traceId: i,
    parentSpanId: o,
    sampled: c,
    dsc: r || {},
    // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    sampleRand: s
  };
}
function Um(t = Jt(), e = Gt(), n) {
  let r = "";
  return n !== void 0 && (r = n ? "-1" : "-0"), `${t}-${e}${r}`;
}
function Fm(t = Jt(), e = Gt(), n) {
  return `00-${t}-${e}-${n ? "01" : "00"}`;
}
function wS(t, e) {
  const n = Js(e?.sample_rand);
  if (n !== void 0)
    return n;
  const r = Js(e?.sample_rate);
  return r && t?.parentSampled !== void 0 ? t.parentSampled ? (
    // Returns a sample rand with positive sampling decision [0, sampleRate)
    Math.random() * r
  ) : (
    // Returns a sample rand with negative sampling decision [sampleRate, 1)
    r + Math.random() * (1 - r)
  ) : Math.random();
}
const Bm = 0, al = 1;
let Bh = !1;
function bS(t) {
  const { spanId: e, traceId: n } = t.spanContext(), { data: r, op: s, parent_span_id: i, status: o, origin: c, links: u } = ee(t);
  return {
    parent_span_id: i,
    span_id: e,
    trace_id: n,
    data: r,
    op: s,
    status: o,
    origin: c,
    links: u
  };
}
function $m(t) {
  const { spanId: e, traceId: n, isRemote: r } = t.spanContext(), s = r ? e : ee(t).parent_span_id, i = Ko(t).scope, o = r ? i?.getPropagationContext().propagationSpanId || Gt() : e;
  return {
    parent_span_id: s,
    span_id: o,
    trace_id: n
  };
}
function AS(t) {
  const { traceId: e, spanId: n } = t.spanContext(), r = Ln(t);
  return Um(e, n, r);
}
function RS(t) {
  const { traceId: e, spanId: n } = t.spanContext(), r = Ln(t);
  return Fm(e, n, r);
}
function jm(t) {
  if (t && t.length > 0)
    return t.map(({ context: { spanId: e, traceId: n, traceFlags: r, ...s }, attributes: i }) => ({
      span_id: e,
      trace_id: n,
      sampled: r === al,
      attributes: i,
      ...s
    }));
}
function Qn(t) {
  return typeof t == "number" ? $h(t) : Array.isArray(t) ? t[0] + t[1] / 1e9 : t instanceof Date ? $h(t.getTime()) : be();
}
function $h(t) {
  return t > 9999999999 ? t / 1e3 : t;
}
function ee(t) {
  if (PS(t))
    return t.getSpanJSON();
  const { spanId: e, traceId: n } = t.spanContext();
  if (CS(t)) {
    const { attributes: r, startTime: s, name: i, endTime: o, status: c, links: u } = t, d = "parentSpanId" in t ? t.parentSpanId : "parentSpanContext" in t ? t.parentSpanContext?.spanId : void 0;
    return {
      span_id: e,
      trace_id: n,
      data: r,
      description: i,
      parent_span_id: d,
      start_timestamp: Qn(s),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: Qn(o) || void 0,
      status: Hm(c),
      op: r[Xt],
      origin: r[Ie],
      links: jm(u)
    };
  }
  return {
    span_id: e,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function CS(t) {
  const e = t;
  return !!e.attributes && !!e.startTime && !!e.name && !!e.endTime && !!e.status;
}
function PS(t) {
  return typeof t.getSpanJSON == "function";
}
function Ln(t) {
  const { traceFlags: e } = t.spanContext();
  return e === al;
}
function Hm(t) {
  if (!(!t || t.code === sS))
    return t.code === km ? "ok" : t.message || "unknown_error";
}
const Zn = "_sentryChildSpans", uu = "_sentryRootSpan";
function Gm(t, e) {
  const n = t[uu] || t;
  at(e, uu, n), t[Zn] ? t[Zn].add(e) : at(t, Zn, /* @__PURE__ */ new Set([e]));
}
function DS(t, e) {
  t[Zn] && t[Zn].delete(e);
}
function wo(t) {
  const e = /* @__PURE__ */ new Set();
  function n(r) {
    if (!e.has(r) && Ln(r)) {
      e.add(r);
      const s = r[Zn] ? Array.from(r[Zn]) : [];
      for (const i of s)
        n(i);
    }
  }
  return n(t), Array.from(e);
}
function Je(t) {
  return t[uu] || t;
}
function nt() {
  const t = mr(), e = ns(t);
  return e.getActiveSpan ? e.getActiveSpan() : Ks(oe());
}
function lu() {
  Bh || (ui(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), Bh = !0);
}
let jh = !1;
function kS() {
  if (jh)
    return;
  function t() {
    const e = nt(), n = e && Je(e);
    if (n) {
      const r = "internal_error";
      x && M.log(`[Tracing] Root span: ${r} -> Global error occurred`), n.setStatus({ code: we, message: r });
    }
  }
  t.tag = "sentry_tracingErrorCallback", jh = !0, _m(t), ym(t);
}
function Tt(t) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const e = t || te()?.getOptions();
  return !!e && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (e.tracesSampleRate != null || !!e.tracesSampler);
}
function Hh(t) {
  M.log(`Ignoring span ${t.op} - ${t.description} because it matches \`ignoreSpans\`.`);
}
function Yo(t, e) {
  if (!e?.length || !t.description)
    return !1;
  for (const n of e) {
    if (OS(n)) {
      if (Io(t.description, n))
        return x && Hh(t), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? Io(t.description, n.name) : !0, s = n.op ? t.op && Io(t.op, n.op) : !0;
    if (r && s)
      return x && Hh(t), !0;
  }
  return !1;
}
function NS(t, e) {
  const n = e.parent_span_id, r = e.span_id;
  if (n)
    for (const s of t)
      s.parent_span_id === r && (s.parent_span_id = n);
}
function OS(t) {
  return typeof t == "string" || t instanceof RegExp;
}
const cl = "production", qm = "_frozenDsc";
function bo(t, e) {
  at(t, qm, e);
}
function zm(t, e) {
  const n = e.getOptions(), { publicKey: r } = e.getDsn() || {}, s = {
    environment: n.environment || cl,
    release: n.release,
    public_key: r,
    trace_id: t,
    org_id: vS(e)
  };
  return e.emit("createDsc", s), s;
}
function ul(t, e) {
  const n = e.getPropagationContext();
  return n.dsc || zm(n.traceId, t);
}
function Qt(t) {
  const e = te();
  if (!e)
    return {};
  const n = Je(t), r = ee(n), s = r.data, i = n.spanContext().traceState, o = i?.get("sentry.sample_rate") ?? s[sl] ?? s[Dm];
  function c(w) {
    return (typeof o == "number" || typeof o == "string") && (w.sample_rate = `${o}`), w;
  }
  const u = n[qm];
  if (u)
    return c(u);
  const d = i?.get("sentry.dsc"), f = d && Lm(d);
  if (f)
    return c(f);
  const p = zm(t.spanContext().traceId, e), _ = s[Dt], T = r.description;
  return _ !== "url" && T && (p.transaction = T), Tt() && (p.sampled = String(Ln(n)), p.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  i?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  Ko(n).scope?.getPropagationContext().sampleRand.toString()), c(p), e.emit("createDsc", p, n), p;
}
class wn {
  constructor(e = {}) {
    this._traceId = e.traceId || Jt(), this._spanId = e.spanId || Gt();
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: Bm
    };
  }
  /** @inheritdoc */
  end(e) {
  }
  /** @inheritdoc */
  setAttribute(e, n) {
    return this;
  }
  /** @inheritdoc */
  setAttributes(e) {
    return this;
  }
  /** @inheritdoc */
  setStatus(e) {
    return this;
  }
  /** @inheritdoc */
  updateName(e) {
    return this;
  }
  /** @inheritdoc */
  isRecording() {
    return !1;
  }
  /** @inheritdoc */
  addEvent(e, n, r) {
    return this;
  }
  /** @inheritDoc */
  addLink(e) {
    return this;
  }
  /** @inheritDoc */
  addLinks(e) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(e, n) {
  }
}
function At(t, e = 100, n = 1 / 0) {
  try {
    return du("", t, e, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function Wm(t, e = 3, n = 100 * 1024) {
  const r = At(t, e);
  return VS(r) > n ? Wm(t, e - 1, n) : r;
}
function du(t, e, n = 1 / 0, r = 1 / 0, s = US()) {
  const [i, o] = s;
  if (e == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof e) || typeof e == "number" && Number.isFinite(e))
    return e;
  const c = MS(t, e);
  if (!c.startsWith("[object "))
    return c;
  if (e.__sentry_skip_normalization__)
    return e;
  const u = typeof e.__sentry_override_normalization_depth__ == "number" ? e.__sentry_override_normalization_depth__ : n;
  if (u === 0)
    return c.replace("object ", "");
  if (i(e))
    return "[Circular ~]";
  const d = e;
  if (d && typeof d.toJSON == "function")
    try {
      const T = d.toJSON();
      return du("", T, u - 1, r, s);
    } catch {
    }
  const f = Array.isArray(e) ? [] : {};
  let p = 0;
  const _ = bm(e);
  for (const T in _) {
    if (!Object.prototype.hasOwnProperty.call(_, T))
      continue;
    if (p >= r) {
      f[T] = "[MaxProperties ~]";
      break;
    }
    const w = _[T];
    f[T] = du(T, w, u - 1, r, s), p++;
  }
  return o(e), f;
}
function MS(t, e) {
  try {
    if (t === "domain" && e && typeof e == "object" && e._events)
      return "[Domain]";
    if (t === "domainEmitter")
      return "[DomainEmitter]";
    if (typeof global < "u" && e === global)
      return "[Global]";
    if (typeof window < "u" && e === window)
      return "[Window]";
    if (typeof document < "u" && e === document)
      return "[Document]";
    if (Sm(e))
      return "[VueViewModel]";
    if (Uv(e))
      return "[SyntheticEvent]";
    if (typeof e == "number" && !Number.isFinite(e))
      return `[${e}]`;
    if (typeof e == "function")
      return `[Function: ${Kt(e)}]`;
    if (typeof e == "symbol")
      return `[${String(e)}]`;
    if (typeof e == "bigint")
      return `[BigInt: ${String(e)}]`;
    const n = LS(e);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function LS(t) {
  const e = Object.getPrototypeOf(t);
  return e?.constructor ? e.constructor.name : "null prototype";
}
function xS(t) {
  return ~-encodeURI(t).split(/%..|./).length;
}
function VS(t) {
  return xS(JSON.stringify(t));
}
function US() {
  const t = /* @__PURE__ */ new WeakSet();
  function e(r) {
    return t.has(r) ? !0 : (t.add(r), !1);
  }
  function n(r) {
    t.delete(r);
  }
  return [e, n];
}
function _r(t, e = []) {
  return [t, e];
}
function FS(t, e) {
  const [n, r] = t;
  return [n, [...r, e]];
}
function Gh(t, e) {
  const n = t[1];
  for (const r of n) {
    const s = r[0].type;
    if (e(r, s))
      return !0;
  }
  return !1;
}
function hu(t) {
  const e = Aa(J);
  return e.encodePolyfill ? e.encodePolyfill(t) : new TextEncoder().encode(t);
}
function BS(t) {
  const [e, n] = t;
  let r = JSON.stringify(e);
  function s(i) {
    typeof r == "string" ? r = typeof i == "string" ? r + i : [hu(r), i] : r.push(typeof i == "string" ? hu(i) : i);
  }
  for (const i of n) {
    const [o, c] = i;
    if (s(`
${JSON.stringify(o)}
`), typeof c == "string" || c instanceof Uint8Array)
      s(c);
    else {
      let u;
      try {
        u = JSON.stringify(c);
      } catch {
        u = JSON.stringify(At(c));
      }
      s(u);
    }
  }
  return typeof r == "string" ? r : $S(r);
}
function $S(t) {
  const e = t.reduce((s, i) => s + i.length, 0), n = new Uint8Array(e);
  let r = 0;
  for (const s of t)
    n.set(s, r), r += s.length;
  return n;
}
function jS(t) {
  return [{
    type: "span"
  }, t];
}
function HS(t) {
  const e = typeof t.data == "string" ? hu(t.data) : t.data;
  return [
    {
      type: "attachment",
      length: e.length,
      filename: t.filename,
      content_type: t.contentType,
      attachment_type: t.attachmentType
    },
    e
  ];
}
const GS = {
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
function qh(t) {
  return GS[t];
}
function Km(t) {
  if (!t?.sdk)
    return;
  const { name: e, version: n } = t.sdk;
  return { name: e, version: n };
}
function qS(t, e, n, r) {
  const s = t.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: t.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...e && { sdk: e },
    ...!!n && r && { dsn: ss(r) },
    ...s && {
      trace: s
    }
  };
}
function zS(t, e) {
  if (!e)
    return t;
  const n = t.sdk || {};
  return t.sdk = {
    ...n,
    name: n.name || e.name,
    version: n.version || e.version,
    integrations: [...t.sdk?.integrations || [], ...e.integrations || []],
    packages: [...t.sdk?.packages || [], ...e.packages || []],
    settings: t.sdk?.settings || e.settings ? {
      ...t.sdk?.settings,
      ...e.settings
    } : void 0
  }, t;
}
function WS(t, e, n, r) {
  const s = Km(n), i = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...s && { sdk: s },
    ...!!r && e && { dsn: ss(e) }
  }, o = "aggregates" in t ? [{ type: "sessions" }, t] : [{ type: "session" }, t.toJSON()];
  return _r(i, [o]);
}
function KS(t, e, n, r) {
  const s = Km(n), i = t.type && t.type !== "replay_event" ? t.type : "event";
  zS(t, n?.sdk);
  const o = qS(t, s, r, e);
  return delete t.sdkProcessingMetadata, _r(o, [[{ type: i }, t]]);
}
function YS(t, e) {
  function n(T) {
    return !!T.trace_id && !!T.public_key;
  }
  const r = Qt(t[0]), s = e?.getDsn(), i = e?.getOptions().tunnel, o = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...n(r) && { trace: r },
    ...!!i && s && { dsn: ss(s) }
  }, { beforeSendSpan: c, ignoreSpans: u } = e?.getOptions() || {}, d = u?.length ? t.filter((T) => !Yo(ee(T), u)) : t, f = t.length - d.length;
  f && e?.recordDroppedEvent("before_send", "span", f);
  const p = c ? (T) => {
    const w = ee(T), k = c(w);
    return k || (lu(), w);
  } : ee, _ = [];
  for (const T of d) {
    const w = p(T);
    w && _.push(jS(w));
  }
  return _r(o, _);
}
function JS(t) {
  if (!x) return;
  const { description: e = "< unknown name >", op: n = "< unknown op >", parent_span_id: r } = ee(t), { spanId: s } = t.spanContext(), i = Ln(t), o = Je(t), c = o === t, u = `[Tracing] Starting ${i ? "sampled" : "unsampled"} ${c ? "root " : ""}span`, d = [`op: ${n}`, `name: ${e}`, `ID: ${s}`];
  if (r && d.push(`parent ID: ${r}`), !c) {
    const { op: f, description: p } = ee(o);
    d.push(`root ID: ${o.spanContext().spanId}`), f && d.push(`root op: ${f}`), p && d.push(`root description: ${p}`);
  }
  M.log(`${u}
  ${d.join(`
  `)}`);
}
function XS(t) {
  if (!x) return;
  const { description: e = "< unknown name >", op: n = "< unknown op >" } = ee(t), { spanId: r } = t.spanContext(), i = Je(t) === t, o = `[Tracing] Finishing "${n}" ${i ? "root " : ""}span "${e}" with ID ${r}`;
  M.log(o);
}
function QS(t, e, n, r = nt()) {
  const s = r && Je(r);
  s && (x && M.log(`[Measurement] Setting measurement on root span: ${t} = ${e} ${n}`), s.addEvent(t, {
    [fi]: e,
    [hi]: n
  }));
}
function zh(t) {
  if (!t || t.length === 0)
    return;
  const e = {};
  return t.forEach((n) => {
    const r = n.attributes || {}, s = r[hi], i = r[fi];
    typeof s == "string" && typeof i == "number" && (e[n.name] = { value: i, unit: s });
  }), e;
}
const Wh = 1e3;
class Da {
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
  constructor(e = {}) {
    this._traceId = e.traceId || Jt(), this._spanId = e.spanId || Gt(), this._startTime = e.startTimestamp || be(), this._links = e.links, this._attributes = {}, this.setAttributes({
      [Ie]: "manual",
      [Xt]: e.op,
      ...e.attributes
    }), this._name = e.name, e.parentSpanId && (this._parentSpanId = e.parentSpanId), "sampled" in e && (this._sampled = e.sampled), e.endTimestamp && (this._endTime = e.endTimestamp), this._events = [], this._isStandaloneSpan = e.isStandalone, this._endTime && this._onSpanEnded();
  }
  /** @inheritDoc */
  addLink(e) {
    return this._links ? this._links.push(e) : this._links = [e], this;
  }
  /** @inheritDoc */
  addLinks(e) {
    return this._links ? this._links.push(...e) : this._links = e, this;
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(e, n) {
  }
  /** @inheritdoc */
  spanContext() {
    const { _spanId: e, _traceId: n, _sampled: r } = this;
    return {
      spanId: e,
      traceId: n,
      traceFlags: r ? al : Bm
    };
  }
  /** @inheritdoc */
  setAttribute(e, n) {
    return n === void 0 ? delete this._attributes[e] : this._attributes[e] = n, this;
  }
  /** @inheritdoc */
  setAttributes(e) {
    return Object.keys(e).forEach((n) => this.setAttribute(n, e[n])), this;
  }
  /**
   * This should generally not be used,
   * but we need it for browser tracing where we want to adjust the start time afterwards.
   * USE THIS WITH CAUTION!
   *
   * @hidden
   * @internal
   */
  updateStartTime(e) {
    this._startTime = Qn(e);
  }
  /**
   * @inheritDoc
   */
  setStatus(e) {
    return this._status = e, this;
  }
  /**
   * @inheritDoc
   */
  updateName(e) {
    return this._name = e, this.setAttribute(Dt, "custom"), this;
  }
  /** @inheritdoc */
  end(e) {
    this._endTime || (this._endTime = Qn(e), XS(this), this._onSpanEnded());
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
      op: this._attributes[Xt],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: Hm(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[Ie],
      profile_id: this._attributes[il],
      exclusive_time: this._attributes[rs],
      measurements: zh(this._events),
      is_segment: this._isStandaloneSpan && Je(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? Je(this).spanContext().spanId : void 0,
      links: jm(this._links)
    };
  }
  /** @inheritdoc */
  isRecording() {
    return !this._endTime && !!this._sampled;
  }
  /**
   * @inheritdoc
   */
  addEvent(e, n, r) {
    x && M.log("[Tracing] Adding an event to span:", e);
    const s = Kh(n) ? n : r || be(), i = Kh(n) ? {} : n || {}, o = {
      name: e,
      time: Qn(s),
      attributes: i
    };
    return this._events.push(o), this;
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
    const e = te();
    if (e && e.emit("spanEnd", this), !(this._isStandaloneSpan || this === Je(this)))
      return;
    if (this._isStandaloneSpan) {
      this._sampled ? eT(YS([this], e)) : (x && M.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled."), e && e.recordDroppedEvent("sample_rate", "span"));
      return;
    }
    const r = this._convertSpanToTransaction();
    r && (Ko(this).scope || oe()).captureEvent(r);
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!Yh(ee(this)))
      return;
    this._name || (x && M.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), this._name = "<unlabeled transaction>");
    const { scope: e, isolationScope: n } = Ko(this), r = e?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
    if (this._sampled !== !0)
      return;
    const i = wo(this).filter((f) => f !== this && !ZS(f)).map((f) => ee(f)).filter(Yh), o = this._attributes[Dt];
    delete this._attributes[Uh], i.forEach((f) => {
      delete f.data[Uh];
    });
    const c = {
      contexts: {
        trace: bS(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        i.length > Wh ? i.sort((f, p) => f.start_timestamp - p.start_timestamp).slice(0, Wh) : i
      ),
      start_timestamp: this._startTime,
      timestamp: this._endTime,
      transaction: this._name,
      type: "transaction",
      sdkProcessingMetadata: {
        capturedSpanScope: e,
        capturedSpanIsolationScope: n,
        dynamicSamplingContext: Qt(this)
      },
      request: r,
      ...o && {
        transaction_info: {
          source: o
        }
      }
    }, u = zh(this._events);
    return u && Object.keys(u).length && (x && M.log(
      "[Measurements] Adding measurements to transaction event",
      JSON.stringify(u, void 0, 2)
    ), c.measurements = u), c;
  }
}
function Kh(t) {
  return t && typeof t == "number" || t instanceof Date || Array.isArray(t);
}
function Yh(t) {
  return !!t.start_timestamp && !!t.timestamp && !!t.span_id && !!t.trace_id;
}
function ZS(t) {
  return t instanceof Da && t.isStandaloneSpan();
}
function eT(t) {
  const e = te();
  if (!e)
    return;
  const n = t[1];
  if (!n || n.length === 0) {
    e.recordDroppedEvent("before_send", "span");
    return;
  }
  e.sendEnvelope(t);
}
function tT(t, e, n = () => {
}, r = () => {
}) {
  let s;
  try {
    s = t();
  } catch (i) {
    throw e(i), n(), i;
  }
  return nT(s, e, n, r);
}
function nT(t, e, n, r) {
  return ts(t) ? t.then(
    (s) => (n(), r(s), s),
    (s) => {
      throw e(s), n(), s;
    }
  ) : (n(), r(t), t);
}
function rT(t, e, n) {
  if (!Tt(t))
    return [!1];
  let r, s;
  typeof t.tracesSampler == "function" ? (s = t.tracesSampler({
    ...e,
    inheritOrSampleWith: (c) => typeof e.parentSampleRate == "number" ? e.parentSampleRate : typeof e.parentSampled == "boolean" ? Number(e.parentSampled) : c
  }), r = !0) : e.parentSampled !== void 0 ? s = e.parentSampled : typeof t.tracesSampleRate < "u" && (s = t.tracesSampleRate, r = !0);
  const i = Js(s);
  if (i === void 0)
    return x && M.warn(
      `[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
        s
      )} of type ${JSON.stringify(typeof s)}.`
    ), [!1];
  if (!i)
    return x && M.log(
      `[Tracing] Discarding transaction because ${typeof t.tracesSampler == "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`
    ), [!1, i, r];
  const o = n < i;
  return o || x && M.log(
    `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
      s
    )})`
  ), [o, i, r];
}
const Ym = "__SENTRY_SUPPRESS_TRACING__";
function pi(t, e) {
  const n = dl();
  if (n.startSpan)
    return n.startSpan(t, e);
  const r = Xm(t), { forceTransaction: s, parentSpan: i, scope: o } = t, c = o?.clone();
  return di(c, () => iT(i)(() => {
    const d = oe(), f = Qm(d, i), _ = t.onlyIfParent && !f ? new wn() : Jm({
      parentSpan: f,
      spanArguments: r,
      forceTransaction: s,
      scope: d
    });
    return Br(d, _), tT(
      () => e(_),
      () => {
        const { status: T } = ee(_);
        _.isRecording() && (!T || T === "ok") && _.setStatus({ code: we, message: "internal_error" });
      },
      () => {
        _.end();
      }
    );
  }));
}
function is(t) {
  const e = dl();
  if (e.startInactiveSpan)
    return e.startInactiveSpan(t);
  const n = Xm(t), { forceTransaction: r, parentSpan: s } = t;
  return (t.scope ? (o) => di(t.scope, o) : s !== void 0 ? (o) => ll(s, o) : (o) => o())(() => {
    const o = oe(), c = Qm(o, s);
    return t.onlyIfParent && !c ? new wn() : Jm({
      parentSpan: c,
      spanArguments: n,
      forceTransaction: r,
      scope: o
    });
  });
}
function ll(t, e) {
  const n = dl();
  return n.withActiveSpan ? n.withActiveSpan(t, e) : di((r) => (Br(r, t || void 0), e(r)));
}
function Jm({
  parentSpan: t,
  spanArguments: e,
  forceTransaction: n,
  scope: r
}) {
  if (!Tt()) {
    const o = new wn();
    if (n || !t) {
      const c = {
        sampled: "false",
        sample_rate: "0",
        transaction: e.name,
        ...Qt(o)
      };
      bo(o, c);
    }
    return o;
  }
  const s = Mn();
  let i;
  if (t && !n)
    i = sT(t, r, e), Gm(t, i);
  else if (t) {
    const o = Qt(t), { traceId: c, spanId: u } = t.spanContext(), d = Ln(t);
    i = Jh(
      {
        traceId: c,
        parentSpanId: u,
        ...e
      },
      r,
      d
    ), bo(i, o);
  } else {
    const {
      traceId: o,
      dsc: c,
      parentSpanId: u,
      sampled: d
    } = {
      ...s.getPropagationContext(),
      ...r.getPropagationContext()
    };
    i = Jh(
      {
        traceId: o,
        parentSpanId: u,
        ...e
      },
      r,
      d
    ), c && bo(i, c);
  }
  return JS(i), cS(i, r, s), i;
}
function Xm(t) {
  const n = {
    isStandalone: (t.experimental || {}).standalone,
    ...t
  };
  if (t.startTime) {
    const r = { ...n };
    return r.startTimestamp = Qn(t.startTime), delete r.startTime, r;
  }
  return n;
}
function dl() {
  const t = mr();
  return ns(t);
}
function Jh(t, e, n) {
  const r = te(), s = r?.getOptions() || {}, { name: i = "" } = t, o = { spanAttributes: { ...t.attributes }, spanName: i, parentSampled: n };
  r?.emit("beforeSampling", o, { decision: !1 });
  const c = o.parentSampled ?? n, u = o.spanAttributes, d = e.getPropagationContext(), [f, p, _] = e.getScopeData().sdkProcessingMetadata[Ym] ? [!1] : rT(
    s,
    {
      name: i,
      parentSampled: c,
      attributes: u,
      parentSampleRate: Js(d.dsc?.sample_rate)
    },
    d.sampleRand
  ), T = new Da({
    ...t,
    attributes: {
      [Dt]: "custom",
      [sl]: p !== void 0 && _ ? p : void 0,
      ...u
    },
    sampled: f
  });
  return !f && r && (x && M.log("[Tracing] Discarding root span because its trace was not chosen to be sampled."), r.recordDroppedEvent("sample_rate", "transaction")), r && r.emit("spanStart", T), T;
}
function sT(t, e, n) {
  const { spanId: r, traceId: s } = t.spanContext(), i = e.getScopeData().sdkProcessingMetadata[Ym] ? !1 : Ln(t), o = i ? new Da({
    ...n,
    parentSpanId: r,
    traceId: s,
    sampled: i
  }) : new wn({ traceId: s });
  Gm(t, o);
  const c = te();
  return c && (c.emit("spanStart", o), n.endTimestamp && c.emit("spanEnd", o)), o;
}
function Qm(t, e) {
  if (e)
    return e;
  if (e === null)
    return;
  const n = Ks(t);
  if (!n)
    return;
  const r = te();
  return (r ? r.getOptions() : {}).parentSpanIsAlwaysRootSpan ? Je(n) : n;
}
function iT(t) {
  return t !== void 0 ? (e) => ll(t, e) : (e) => e();
}
const Ao = {
  idleTimeout: 1e3,
  finalTimeout: 3e4,
  childSpanTimeout: 15e3
}, oT = "heartbeatFailed", aT = "idleTimeout", cT = "finalTimeout", uT = "externalFinish";
function Zm(t, e = {}) {
  const n = /* @__PURE__ */ new Map();
  let r = !1, s, i = uT, o = !e.disableAutoFinish;
  const c = [], {
    idleTimeout: u = Ao.idleTimeout,
    finalTimeout: d = Ao.finalTimeout,
    childSpanTimeout: f = Ao.childSpanTimeout,
    beforeSpanEnd: p,
    trimIdleSpanEndTimestamp: _ = !0
  } = e, T = te();
  if (!T || !Tt()) {
    const v = new wn(), g = {
      sample_rate: "0",
      sampled: "false",
      ...Qt(v)
    };
    return bo(v, g), v;
  }
  const w = oe(), k = nt(), P = lT(t);
  P.end = new Proxy(P.end, {
    apply(v, g, E) {
      if (p && p(P), g instanceof wn)
        return;
      const [S, ...I] = E, b = S || be(), y = Qn(b), ke = wo(P).filter((W) => W !== P), rt = ee(P);
      if (!ke.length || !_)
        return ce(y), Reflect.apply(v, g, [y, ...I]);
      const st = T.getOptions().ignoreSpans, Qe = ke?.reduce((W, ze) => {
        const pe = ee(ze);
        return !pe.timestamp || st && Yo(pe, st) ? W : W ? Math.max(W, pe.timestamp) : pe.timestamp;
      }, void 0), K = rt.start_timestamp, ye = Math.min(
        K ? K + d / 1e3 : 1 / 0,
        Math.max(K || -1 / 0, Math.min(y, Qe || 1 / 0))
      );
      return ce(ye), Reflect.apply(v, g, [ye, ...I]);
    }
  });
  function B() {
    s && (clearTimeout(s), s = void 0);
  }
  function U(v) {
    B(), s = setTimeout(() => {
      !r && n.size === 0 && o && (i = aT, P.end(v));
    }, u);
  }
  function H(v) {
    s = setTimeout(() => {
      !r && o && (i = oT, P.end(v));
    }, f);
  }
  function ne(v) {
    B(), n.set(v, !0);
    const g = be();
    H(g + f / 1e3);
  }
  function De(v) {
    if (n.has(v) && n.delete(v), n.size === 0) {
      const g = be();
      U(g + u / 1e3);
    }
  }
  function ce(v) {
    r = !0, n.clear(), c.forEach((y) => y()), Br(w, k);
    const g = ee(P), { start_timestamp: E } = g;
    if (!E)
      return;
    g.data[Ys] || P.setAttribute(Ys, i), M.log(`[Tracing] Idle span "${g.op}" finished`);
    const I = wo(P).filter((y) => y !== P);
    let b = 0;
    I.forEach((y) => {
      y.isRecording() && (y.setStatus({ code: we, message: "cancelled" }), y.end(v), x && M.log("[Tracing] Cancelling span since span ended early", JSON.stringify(y, void 0, 2)));
      const ke = ee(y), { timestamp: rt = 0, start_timestamp: st = 0 } = ke, Qe = st <= v, K = (d + u) / 1e3, ye = rt - st <= K;
      if (x) {
        const W = JSON.stringify(y, void 0, 2);
        Qe ? ye || M.log("[Tracing] Discarding span since it finished after idle span final timeout", W) : M.log("[Tracing] Discarding span since it happened after idle span was finished", W);
      }
      (!ye || !Qe) && (DS(P, y), b++);
    }), b > 0 && P.setAttribute("sentry.idle_span_discarded_spans", b);
  }
  return c.push(
    T.on("spanStart", (v) => {
      if (r || v === P || ee(v).timestamp || v instanceof Da && v.isStandaloneSpan())
        return;
      wo(P).includes(v) && ne(v.spanContext().spanId);
    })
  ), c.push(
    T.on("spanEnd", (v) => {
      r || De(v.spanContext().spanId);
    })
  ), c.push(
    T.on("idleSpanEnableAutoFinish", (v) => {
      v === P && (o = !0, U(), n.size && H());
    })
  ), e.disableAutoFinish || U(), setTimeout(() => {
    r || (P.setStatus({ code: we, message: "deadline_exceeded" }), i = cT, P.end());
  }, d), P;
}
function lT(t) {
  const e = is(t);
  return Br(oe(), e), x && M.log("[Tracing] Started span is an idle span"), e;
}
const Lc = 0, Xh = 1, Qh = 2;
function ka(t) {
  return new Xs((e) => {
    e(t);
  });
}
function hl(t) {
  return new Xs((e, n) => {
    n(t);
  });
}
class Xs {
  constructor(e) {
    this._state = Lc, this._handlers = [], this._runExecutor(e);
  }
  /** @inheritdoc */
  then(e, n) {
    return new Xs((r, s) => {
      this._handlers.push([
        !1,
        (i) => {
          if (!e)
            r(i);
          else
            try {
              r(e(i));
            } catch (o) {
              s(o);
            }
        },
        (i) => {
          if (!n)
            s(i);
          else
            try {
              r(n(i));
            } catch (o) {
              s(o);
            }
        }
      ]), this._executeHandlers();
    });
  }
  /** @inheritdoc */
  catch(e) {
    return this.then((n) => n, e);
  }
  /** @inheritdoc */
  finally(e) {
    return new Xs((n, r) => {
      let s, i;
      return this.then(
        (o) => {
          i = !1, s = o, e && e();
        },
        (o) => {
          i = !0, s = o, e && e();
        }
      ).then(() => {
        if (i) {
          r(s);
          return;
        }
        n(s);
      });
    });
  }
  /** Excute the resolve/reject handlers. */
  _executeHandlers() {
    if (this._state === Lc)
      return;
    const e = this._handlers.slice();
    this._handlers = [], e.forEach((n) => {
      n[0] || (this._state === Xh && n[1](this._value), this._state === Qh && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(e) {
    const n = (i, o) => {
      if (this._state === Lc) {
        if (ts(o)) {
          o.then(r, s);
          return;
        }
        this._state = i, this._value = o, this._executeHandlers();
      }
    }, r = (i) => {
      n(Xh, i);
    }, s = (i) => {
      n(Qh, i);
    };
    try {
      e(r, s);
    } catch (i) {
      s(i);
    }
  }
}
function dT(t, e, n, r = 0) {
  try {
    const s = fu(e, n, t, r);
    return ts(s) ? s : ka(s);
  } catch (s) {
    return hl(s);
  }
}
function fu(t, e, n, r) {
  const s = n[r];
  if (!t || !s)
    return t;
  const i = s({ ...t }, e);
  return x && i === null && M.log(`Event processor "${s.id || "?"}" dropped event`), ts(i) ? i.then((o) => fu(o, e, n, r + 1)) : fu(i, e, n, r + 1);
}
function hT(t, e) {
  const { fingerprint: n, span: r, breadcrumbs: s, sdkProcessingMetadata: i } = e;
  fT(t, e), r && gT(t, r), _T(t, n), pT(t, s), mT(t, i);
}
function Jo(t, e) {
  const {
    extra: n,
    tags: r,
    user: s,
    contexts: i,
    level: o,
    sdkProcessingMetadata: c,
    breadcrumbs: u,
    fingerprint: d,
    eventProcessors: f,
    attachments: p,
    propagationContext: _,
    transactionName: T,
    span: w
  } = e;
  ro(t, "extra", n), ro(t, "tags", r), ro(t, "user", s), ro(t, "contexts", i), t.sdkProcessingMetadata = li(t.sdkProcessingMetadata, c, 2), o && (t.level = o), T && (t.transactionName = T), w && (t.span = w), u.length && (t.breadcrumbs = [...t.breadcrumbs, ...u]), d.length && (t.fingerprint = [...t.fingerprint, ...d]), f.length && (t.eventProcessors = [...t.eventProcessors, ...f]), p.length && (t.attachments = [...t.attachments, ...p]), t.propagationContext = { ...t.propagationContext, ..._ };
}
function ro(t, e, n) {
  t[e] = li(t[e], n, 1);
}
function fT(t, e) {
  const { extra: n, tags: r, user: s, contexts: i, level: o, transactionName: c } = e;
  Object.keys(n).length && (t.extra = { ...n, ...t.extra }), Object.keys(r).length && (t.tags = { ...r, ...t.tags }), Object.keys(s).length && (t.user = { ...s, ...t.user }), Object.keys(i).length && (t.contexts = { ...i, ...t.contexts }), o && (t.level = o), c && t.type !== "transaction" && (t.transaction = c);
}
function pT(t, e) {
  const n = [...t.breadcrumbs || [], ...e];
  t.breadcrumbs = n.length ? n : void 0;
}
function mT(t, e) {
  t.sdkProcessingMetadata = {
    ...t.sdkProcessingMetadata,
    ...e
  };
}
function gT(t, e) {
  t.contexts = {
    trace: $m(e),
    ...t.contexts
  }, t.sdkProcessingMetadata = {
    dynamicSamplingContext: Qt(e),
    ...t.sdkProcessingMetadata
  };
  const n = Je(e), r = ee(n).description;
  r && !t.transaction && t.type === "transaction" && (t.transaction = r);
}
function _T(t, e) {
  t.fingerprint = t.fingerprint ? Array.isArray(t.fingerprint) ? t.fingerprint : [t.fingerprint] : [], e && (t.fingerprint = t.fingerprint.concat(e)), t.fingerprint.length || delete t.fingerprint;
}
let Bn, Zh, ef, cn;
function yT(t) {
  const e = J._sentryDebugIds, n = J._debugIds;
  if (!e && !n)
    return {};
  const r = e ? Object.keys(e) : [], s = n ? Object.keys(n) : [];
  if (cn && r.length === Zh && s.length === ef)
    return cn;
  Zh = r.length, ef = s.length, cn = {}, Bn || (Bn = {});
  const i = (o, c) => {
    for (const u of o) {
      const d = c[u], f = Bn?.[u];
      if (f && cn && d)
        cn[f[0]] = d, Bn && (Bn[u] = [f[0], d]);
      else if (d) {
        const p = t(u);
        for (let _ = p.length - 1; _ >= 0; _--) {
          const w = p[_]?.filename;
          if (w && cn && Bn) {
            cn[w] = d, Bn[u] = [w, d];
            break;
          }
        }
      }
    }
  };
  return e && i(r, e), n && i(s, n), cn;
}
function ET(t, e, n, r, s, i) {
  const { normalizeDepth: o = 3, normalizeMaxBreadth: c = 1e3 } = t, u = {
    ...e,
    event_id: e.event_id || n.event_id || dt(),
    timestamp: e.timestamp || gr()
  }, d = n.integrations || t.integrations.map((P) => P.name);
  vT(u, t), IT(u, d), s && s.emit("applyFrameMetadata", e), e.type === void 0 && ST(u, t.stackParser);
  const f = bT(r, n.captureContext);
  n.mechanism && Ur(u, n.mechanism);
  const p = s ? s.getEventProcessors() : [], _ = Cm().getScopeData();
  if (i) {
    const P = i.getScopeData();
    Jo(_, P);
  }
  if (f) {
    const P = f.getScopeData();
    Jo(_, P);
  }
  const T = [...n.attachments || [], ..._.attachments];
  T.length && (n.attachments = T), hT(u, _);
  const w = [
    ...p,
    // Run scope event processors _after_ all other processors
    ..._.eventProcessors
  ];
  return dT(w, u, n).then((P) => (P && TT(P), typeof o == "number" && o > 0 ? wT(P, o, c) : P));
}
function vT(t, e) {
  const { environment: n, release: r, dist: s, maxValueLength: i = 250 } = e;
  t.environment = t.environment || n || cl, !t.release && r && (t.release = r), !t.dist && s && (t.dist = s);
  const o = t.request;
  o?.url && (o.url = Wo(o.url, i));
}
function ST(t, e) {
  const n = yT(e);
  t.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((s) => {
      s.filename && (s.debug_id = n[s.filename]);
    });
  });
}
function TT(t) {
  const e = {};
  if (t.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((s) => {
      s.debug_id && (s.abs_path ? e[s.abs_path] = s.debug_id : s.filename && (e[s.filename] = s.debug_id), delete s.debug_id);
    });
  }), Object.keys(e).length === 0)
    return;
  t.debug_meta = t.debug_meta || {}, t.debug_meta.images = t.debug_meta.images || [];
  const n = t.debug_meta.images;
  Object.entries(e).forEach(([r, s]) => {
    n.push({
      type: "sourcemap",
      code_file: r,
      debug_id: s
    });
  });
}
function IT(t, e) {
  e.length > 0 && (t.sdk = t.sdk || {}, t.sdk.integrations = [...t.sdk.integrations || [], ...e]);
}
function wT(t, e, n) {
  if (!t)
    return null;
  const r = {
    ...t,
    ...t.breadcrumbs && {
      breadcrumbs: t.breadcrumbs.map((s) => ({
        ...s,
        ...s.data && {
          data: At(s.data, e, n)
        }
      }))
    },
    ...t.user && {
      user: At(t.user, e, n)
    },
    ...t.contexts && {
      contexts: At(t.contexts, e, n)
    },
    ...t.extra && {
      extra: At(t.extra, e, n)
    }
  };
  return t.contexts?.trace && r.contexts && (r.contexts.trace = t.contexts.trace, t.contexts.trace.data && (r.contexts.trace.data = At(t.contexts.trace.data, e, n))), t.spans && (r.spans = t.spans.map((s) => ({
    ...s,
    ...s.data && {
      data: At(s.data, e, n)
    }
  }))), t.contexts?.flags && r.contexts && (r.contexts.flags = At(t.contexts.flags, 3, n)), r;
}
function bT(t, e) {
  if (!e)
    return t;
  const n = t ? t.clone() : new fe();
  return n.update(e), n;
}
function AT(t, e) {
  return oe().captureException(t, void 0);
}
function eg(t, e) {
  return oe().captureEvent(t, e);
}
function RT() {
  const t = te();
  return t?.getOptions().enabled !== !1 && !!t?.getTransport();
}
function tf(t) {
  const e = Mn(), n = oe(), { userAgent: r } = J.navigator || {}, s = Wv({
    user: n.getUser() || e.getUser(),
    ...r && { userAgent: r },
    ...t
  }), i = e.getSession();
  return i?.status === "ok" && Fr(i, { status: "exited" }), tg(), e.setSession(s), s;
}
function tg() {
  const t = Mn(), n = oe().getSession() || t.getSession();
  n && Kv(n), ng(), t.setSession();
}
function ng() {
  const t = Mn(), e = te(), n = t.getSession();
  n && e && e.captureSession(n);
}
function nf(t = !1) {
  if (t) {
    tg();
    return;
  }
  ng();
}
const CT = "7";
function PT(t) {
  const e = t.protocol ? `${t.protocol}:` : "", n = t.port ? `:${t.port}` : "";
  return `${e}//${t.host}${n}${t.path ? `/${t.path}` : ""}/api/`;
}
function DT(t) {
  return `${PT(t)}${t.projectId}/envelope/`;
}
function kT(t, e) {
  const n = {
    sentry_version: CT
  };
  return t.publicKey && (n.sentry_key = t.publicKey), e && (n.sentry_client = `${e.name}/${e.version}`), new URLSearchParams(n).toString();
}
function NT(t, e, n) {
  return e || `${DT(t)}?${kT(t, n)}`;
}
const rf = [];
function OT(t, e) {
  const n = {};
  return e.forEach((r) => {
    r && rg(t, r, n);
  }), n;
}
function sf(t, e) {
  for (const n of e)
    n?.afterAllSetup && n.afterAllSetup(t);
}
function rg(t, e, n) {
  if (n[e.name]) {
    x && M.log(`Integration skipped because it was already installed: ${e.name}`);
    return;
  }
  if (n[e.name] = e, rf.indexOf(e.name) === -1 && typeof e.setupOnce == "function" && (e.setupOnce(), rf.push(e.name)), e.setup && typeof e.setup == "function" && e.setup(t), typeof e.preprocessEvent == "function") {
    const r = e.preprocessEvent.bind(e);
    t.on("preprocessEvent", (s, i) => r(s, i, t));
  }
  if (typeof e.processEvent == "function") {
    const r = e.processEvent.bind(e), s = Object.assign((i, o) => r(i, o, t), {
      id: e.name
    });
    t.addEventProcessor(s);
  }
  x && M.log(`Integration installed: ${e.name}`);
}
function MT(t, e) {
  return e ? di(e, () => {
    const n = nt(), r = n ? $m(n) : Pm(e);
    return [n ? Qt(n) : ul(t, e), r];
  }) : [void 0, void 0];
}
const LT = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};
function xT(t) {
  return [
    {
      type: "log",
      item_count: t.length,
      content_type: "application/vnd.sentry.items.log+json"
    },
    {
      items: t
    }
  ];
}
function VT(t, e, n, r) {
  const s = {};
  return e?.sdk && (s.sdk = {
    name: e.sdk.name,
    version: e.sdk.version
  }), n && r && (s.dsn = ss(r)), _r(s, [xT(t)]);
}
const UT = 100;
function FT(t) {
  switch (typeof t) {
    case "number":
      return Number.isInteger(t) ? {
        value: t,
        type: "integer"
      } : {
        value: t,
        type: "double"
      };
    case "boolean":
      return {
        value: t,
        type: "boolean"
      };
    case "string":
      return {
        value: t,
        type: "string"
      };
    default: {
      let e = "";
      try {
        e = JSON.stringify(t) ?? "";
      } catch {
      }
      return {
        value: e,
        type: "string"
      };
    }
  }
}
function bt(t, e, n, r = !0) {
  n && (!t[e] || r) && (t[e] = n);
}
function BT(t, e) {
  const n = pl(), r = sg(t);
  r === void 0 ? n.set(t, [e]) : (n.set(t, [...r, e]), r.length >= UT && fl(t, r));
}
function of(t, e = oe(), n = BT) {
  const r = e?.getClient() ?? te();
  if (!r) {
    x && M.warn("No client available to capture log.");
    return;
  }
  const { release: s, environment: i, enableLogs: o = !1, beforeSendLog: c } = r.getOptions();
  if (!o) {
    x && M.warn("logging option not enabled, log will not be captured.");
    return;
  }
  const [, u] = MT(r, e), d = {
    ...t.attributes
  }, {
    user: { id: f, email: p, username: _ }
  } = $T(e);
  bt(d, "user.id", f, !1), bt(d, "user.email", p, !1), bt(d, "user.name", _, !1), bt(d, "sentry.release", s), bt(d, "sentry.environment", i);
  const { name: T, version: w } = r.getSdkMetadata()?.sdk ?? {};
  bt(d, "sentry.sdk.name", T), bt(d, "sentry.sdk.version", w);
  const k = r.getIntegrationByName("Replay"), P = k?.getReplayId(!0);
  bt(d, "sentry.replay_id", P), P && k?.getRecordingMode() === "buffer" && bt(d, "sentry._internal.replay_is_buffering", !0);
  const B = t.message;
  if (Ra(B)) {
    const { __sentry_template_string__: S, __sentry_template_values__: I = [] } = B;
    I?.length && (d["sentry.message.template"] = S), I.forEach((b, y) => {
      d[`sentry.message.parameter.${y}`] = b;
    });
  }
  const U = Ks(e);
  bt(d, "sentry.trace.parent_span_id", U?.spanContext().spanId);
  const H = { ...t, attributes: d };
  r.emit("beforeCaptureLog", H);
  const ne = c ? ui(() => c(H)) : H;
  if (!ne) {
    r.recordDroppedEvent("before_send", "log_item", 1), x && M.warn("beforeSendLog returned null, log will not be captured.");
    return;
  }
  const { level: De, message: ce, attributes: v = {}, severityNumber: g } = ne, E = {
    timestamp: be(),
    level: De,
    body: ce,
    trace_id: u?.trace_id,
    severity_number: g ?? LT[De],
    attributes: Object.keys(v).reduce(
      (S, I) => (S[I] = FT(v[I]), S),
      {}
    )
  };
  n(r, E), r.emit("afterCaptureLog", ne);
}
function fl(t, e) {
  const n = e ?? sg(t) ?? [];
  if (n.length === 0)
    return;
  const r = t.getOptions(), s = VT(n, r._metadata, r.tunnel, t.getDsn());
  pl().set(t, []), t.emit("flushLogs"), t.sendEnvelope(s);
}
function sg(t) {
  return pl().get(t);
}
function $T(t) {
  const e = Cm().getScopeData();
  return Jo(e, Mn().getScopeData()), Jo(e, t.getScopeData()), e;
}
function pl() {
  return Zr("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function jT(t) {
  return [
    {
      type: "trace_metric",
      item_count: t.length,
      content_type: "application/vnd.sentry.items.trace-metric+json"
    },
    {
      items: t
    }
  ];
}
function HT(t, e, n, r) {
  const s = {};
  return e?.sdk && (s.sdk = {
    name: e.sdk.name,
    version: e.sdk.version
  }), n && r && (s.dsn = ss(r)), _r(s, [jT(t)]);
}
function ig(t, e) {
  const n = e ?? GT(t) ?? [];
  if (n.length === 0)
    return;
  const r = t.getOptions(), s = HT(n, r._metadata, r.tunnel, t.getDsn());
  og().set(t, []), t.emit("flushMetrics"), t.sendEnvelope(s);
}
function GT(t) {
  return og().get(t);
}
function og() {
  return Zr("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function qT(t, e, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: gr(),
      discarded_events: t
    }
  ];
  return _r(e ? { dsn: e } : {}, [r]);
}
function ag(t) {
  const e = [];
  t.message && e.push(t.message);
  try {
    const n = t.exception.values[t.exception.values.length - 1];
    n?.value && (e.push(n.value), n.type && e.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return e;
}
function zT(t) {
  const { trace_id: e, parent_span_id: n, span_id: r, status: s, origin: i, data: o, op: c } = t.contexts?.trace ?? {};
  return {
    data: o ?? {},
    description: t.transaction,
    op: c,
    parent_span_id: n,
    span_id: r ?? "",
    start_timestamp: t.start_timestamp ?? 0,
    status: s,
    timestamp: t.timestamp,
    trace_id: e ?? "",
    origin: i,
    profile_id: o?.[il],
    exclusive_time: o?.[rs],
    measurements: t.measurements,
    is_segment: !0
  };
}
function WT(t) {
  return {
    type: "transaction",
    timestamp: t.timestamp,
    start_timestamp: t.start_timestamp,
    transaction: t.description,
    contexts: {
      trace: {
        trace_id: t.trace_id,
        span_id: t.span_id,
        parent_span_id: t.parent_span_id,
        op: t.op,
        status: t.status,
        origin: t.origin,
        data: {
          ...t.data,
          ...t.profile_id && { [il]: t.profile_id },
          ...t.exclusive_time && { [rs]: t.exclusive_time }
        }
      }
    },
    measurements: t.measurements
  };
}
const af = "Not capturing exception because it's already been captured.", cf = "Discarded session because of missing or non-string release", cg = Symbol.for("SentryInternalError"), ug = Symbol.for("SentryDoNotSendEventError"), KT = 5e3;
function Ro(t) {
  return {
    message: t,
    [cg]: !0
  };
}
function xc(t) {
  return {
    message: t,
    [ug]: !0
  };
}
function uf(t) {
  return !!t && typeof t == "object" && cg in t;
}
function lf(t) {
  return !!t && typeof t == "object" && ug in t;
}
function df(t, e, n, r, s) {
  let i = 0, o;
  t.on(n, () => {
    i = 0, clearTimeout(o);
  }), t.on(e, (c) => {
    i += r(c), i >= 8e5 ? s(t) : (clearTimeout(o), o = setTimeout(() => {
      s(t);
    }, KT));
  }), t.on("flush", () => {
    s(t);
  });
}
class YT {
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
  constructor(e) {
    if (this._options = e, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], e.dsn ? this._dsn = SS(e.dsn) : x && M.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = NT(
        this._dsn,
        e.tunnel,
        e._metadata ? e._metadata.sdk : void 0
      );
      this._transport = e.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...e.transportOptions,
        url: n
      });
    }
    this._options.enableLogs && df(this, "afterCaptureLog", "flushLogs", ZT, fl), this._options._experiments?.enableMetrics && df(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      QT,
      ig
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(e, n, r) {
    const s = dt();
    if (Lh(e))
      return x && M.log(af), s;
    const i = {
      event_id: s,
      ...n
    };
    return this._process(
      this.eventFromException(e, i).then(
        (o) => this._captureEvent(o, i, r)
      )
    ), i.event_id;
  }
  /**
   * Captures a message event and sends it to Sentry.
   *
   * Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureMessage(e, n, r, s) {
    const i = {
      event_id: dt(),
      ...r
    }, o = Ra(e) ? e : String(e), c = ir(e) ? this.eventFromMessage(o, n, i) : this.eventFromException(e, i);
    return this._process(c.then((u) => this._captureEvent(u, i, s))), i.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(e, n, r) {
    const s = dt();
    if (n?.originalException && Lh(n.originalException))
      return x && M.log(af), s;
    const i = {
      event_id: s,
      ...n
    }, o = e.sdkProcessingMetadata || {}, c = o.capturedSpanScope, u = o.capturedSpanIsolationScope;
    return this._process(
      this._captureEvent(e, i, c || r, u)
    ), i.event_id;
  }
  /**
   * Captures a session.
   */
  captureSession(e) {
    this.sendSession(e), Fr(e, { init: !1 });
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
  async flush(e) {
    const n = this._transport;
    if (!n)
      return !0;
    this.emit("flush");
    const r = await this._isClientDoneProcessing(e), s = await n.flush(e);
    return r && s;
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
  async close(e) {
    const n = await this.flush(e);
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
  addEventProcessor(e) {
    this._eventProcessors.push(e);
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
    this._options.integrations.some(({ name: e }) => e.startsWith("Spotlight"))) && this._setupIntegrations();
  }
  /**
   * Gets an installed integration by its name.
   *
   * @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
   */
  getIntegrationByName(e) {
    return this._integrations[e];
  }
  /**
   * Add an integration to the client.
   * This can be used to e.g. lazy load integrations.
   * In most cases, this should not be necessary,
   * and you're better off just passing the integrations via `integrations: []` at initialization time.
   * However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
   */
  addIntegration(e) {
    const n = this._integrations[e.name];
    rg(this, e, this._integrations), n || sf(this, [e]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(e, n = {}) {
    this.emit("beforeSendEvent", e, n);
    let r = KS(e, this._dsn, this._options._metadata, this._options.tunnel);
    for (const s of n.attachments || [])
      r = FS(r, HS(s));
    this.sendEnvelope(r).then((s) => this.emit("afterSendEvent", e, s));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(e) {
    const { release: n, environment: r = cl } = this._options;
    if ("aggregates" in e) {
      const i = e.attrs || {};
      if (!i.release && !n) {
        x && M.warn(cf);
        return;
      }
      i.release = i.release || n, i.environment = i.environment || r, e.attrs = i;
    } else {
      if (!e.release && !n) {
        x && M.warn(cf);
        return;
      }
      e.release = e.release || n, e.environment = e.environment || r;
    }
    this.emit("beforeSendSession", e);
    const s = WS(e, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(s);
  }
  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
   */
  recordDroppedEvent(e, n, r = 1) {
    if (this._options.sendClientReports) {
      const s = `${e}:${n}`;
      x && M.log(`Recording outcome: "${s}"${r > 1 ? ` (${r} times)` : ""}`), this._outcomes[s] = (this._outcomes[s] || 0) + r;
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
  on(e, n) {
    const r = this._hooks[e] = this._hooks[e] || /* @__PURE__ */ new Set(), s = (...i) => n(...i);
    return r.add(s), () => {
      r.delete(s);
    };
  }
  /** Fire a hook whenever a span starts. */
  /**
   * Emit a hook that was previously registered via `on()`.
   */
  emit(e, ...n) {
    const r = this._hooks[e];
    r && r.forEach((s) => s(...n));
  }
  /**
   * Send an envelope to Sentry.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async sendEnvelope(e) {
    if (this.emit("beforeEnvelope", e), this._isEnabled() && this._transport)
      try {
        return await this._transport.send(e);
      } catch (n) {
        return x && M.error("Error while sending envelope:", n), {};
      }
    return x && M.error("Transport disabled"), {};
  }
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Setup integrations for this client. */
  _setupIntegrations() {
    const { integrations: e } = this._options;
    this._integrations = OT(this, e), sf(this, e);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(e, n) {
    let r = n.level === "fatal", s = !1;
    const i = n.exception?.values;
    if (i) {
      s = !0;
      for (const u of i)
        if (u.mechanism?.handled === !1) {
          r = !0;
          break;
        }
    }
    const o = e.status === "ok";
    (o && e.errors === 0 || o && r) && (Fr(e, {
      ...r && { status: "crashed" },
      errors: e.errors || Number(s || r)
    }), this.captureSession(e));
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
  async _isClientDoneProcessing(e) {
    let n = 0;
    for (; !e || n < e; ) {
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
  _prepareEvent(e, n, r, s) {
    const i = this.getOptions(), o = Object.keys(this._integrations);
    return !n.integrations && o?.length && (n.integrations = o), this.emit("preprocessEvent", e, n), e.type || s.setLastEventId(e.event_id || n.event_id), ET(i, e, n, r, this, s).then((c) => {
      if (c === null)
        return c;
      this.emit("postprocessEvent", c, n), c.contexts = {
        trace: Pm(r),
        ...c.contexts
      };
      const u = ul(this, r);
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
  _captureEvent(e, n = {}, r = oe(), s = Mn()) {
    return x && pu(e) && M.log(`Captured error event \`${ag(e)[0] || "<unknown>"}\``), this._processEvent(e, n, r, s).then(
      (i) => i.event_id,
      (i) => {
        x && (lf(i) ? M.log(i.message) : uf(i) ? M.warn(i.message) : M.warn(i));
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
  _processEvent(e, n, r, s) {
    const i = this.getOptions(), { sampleRate: o } = i, c = lg(e), u = pu(e), d = e.type || "error", f = `before send for type \`${d}\``, p = typeof o > "u" ? void 0 : Js(o);
    if (u && typeof p == "number" && Math.random() > p)
      return this.recordDroppedEvent("sample_rate", "error"), hl(
        xc(
          `Discarding event because it's not included in the random sample (sampling rate = ${o})`
        )
      );
    const _ = d === "replay_event" ? "replay" : d;
    return this._prepareEvent(e, n, r, s).then((T) => {
      if (T === null)
        throw this.recordDroppedEvent("event_processor", _), xc("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return T;
      const k = XT(this, i, T, n);
      return JT(k, f);
    }).then((T) => {
      if (T === null) {
        if (this.recordDroppedEvent("before_send", _), c) {
          const B = 1 + (e.spans || []).length;
          this.recordDroppedEvent("before_send", "span", B);
        }
        throw xc(`${f} returned \`null\`, will not send event.`);
      }
      const w = r.getSession() || s.getSession();
      if (u && w && this._updateSessionFromEvent(w, T), c) {
        const P = T.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, B = T.spans ? T.spans.length : 0, U = P - B;
        U > 0 && this.recordDroppedEvent("before_send", "span", U);
      }
      const k = T.transaction_info;
      if (c && k && T.transaction !== e.transaction) {
        const P = "custom";
        T.transaction_info = {
          ...k,
          source: P
        };
      }
      return this.sendEvent(T, n), T;
    }).then(null, (T) => {
      throw lf(T) || uf(T) ? T : (this.captureException(T, {
        mechanism: {
          handled: !1,
          type: "internal"
        },
        data: {
          __sentry__: !0
        },
        originalException: T
      }), Ro(
        `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${T}`
      ));
    });
  }
  /**
   * Occupies the client with processing and event
   */
  _process(e) {
    this._numProcessing++, e.then(
      (n) => (this._numProcessing--, n),
      (n) => (this._numProcessing--, n)
    );
  }
  /**
   * Clears outcomes on this client and returns them.
   */
  _clearOutcomes() {
    const e = this._outcomes;
    return this._outcomes = {}, Object.entries(e).map(([n, r]) => {
      const [s, i] = n.split(":");
      return {
        reason: s,
        category: i,
        quantity: r
      };
    });
  }
  /**
   * Sends client reports as an envelope.
   */
  _flushOutcomes() {
    x && M.log("Flushing outcomes...");
    const e = this._clearOutcomes();
    if (e.length === 0) {
      x && M.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      x && M.log("No dsn provided, will not send outcomes");
      return;
    }
    x && M.log("Sending outcomes:", e);
    const n = qT(e, this._options.tunnel && ss(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function JT(t, e) {
  const n = `${e} must return \`null\` or a valid event.`;
  if (ts(t))
    return t.then(
      (r) => {
        if (!Ws(r) && r !== null)
          throw Ro(n);
        return r;
      },
      (r) => {
        throw Ro(`${e} rejected with ${r}`);
      }
    );
  if (!Ws(t) && t !== null)
    throw Ro(n);
  return t;
}
function XT(t, e, n, r) {
  const { beforeSend: s, beforeSendTransaction: i, beforeSendSpan: o, ignoreSpans: c } = e;
  let u = n;
  if (pu(u) && s)
    return s(u, r);
  if (lg(u)) {
    if (o || c) {
      const d = zT(u);
      if (c?.length && Yo(d, c))
        return null;
      if (o) {
        const f = o(d);
        f ? u = li(n, WT(f)) : lu();
      }
      if (u.spans) {
        const f = [], p = u.spans;
        for (const T of p) {
          if (c?.length && Yo(T, c)) {
            NS(p, T);
            continue;
          }
          if (o) {
            const w = o(T);
            w ? f.push(w) : (lu(), f.push(T));
          } else
            f.push(T);
        }
        const _ = u.spans.length - f.length;
        _ && t.recordDroppedEvent("before_send", "span", _), u.spans = f;
      }
    }
    if (i) {
      if (u.spans) {
        const d = u.spans.length;
        u.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: d
        };
      }
      return i(u, r);
    }
  }
  return u;
}
function pu(t) {
  return t.type === void 0;
}
function lg(t) {
  return t.type === "transaction";
}
function QT(t) {
  let e = 0;
  return t.name && (e += t.name.length * 2), typeof t.value == "string" ? e += t.value.length * 2 : e += 8, e + dg(t.attributes);
}
function ZT(t) {
  let e = 0;
  return t.message && (e += t.message.length * 2), e + dg(t.attributes);
}
function dg(t) {
  if (!t)
    return 0;
  let e = 0;
  return Object.values(t).forEach((n) => {
    Array.isArray(n) ? e += n.length * hf(n[0]) : ir(n) ? e += hf(n) : e += 100;
  }), e;
}
function hf(t) {
  return typeof t == "string" ? t.length * 2 : typeof t == "number" ? 8 : typeof t == "boolean" ? 4 : 0;
}
const hg = Symbol.for("SentryBufferFullError");
function eI(t = 100) {
  const e = /* @__PURE__ */ new Set();
  function n() {
    return e.size < t;
  }
  function r(o) {
    e.delete(o);
  }
  function s(o) {
    if (!n())
      return hl(hg);
    const c = o();
    return e.add(c), c.then(
      () => r(c),
      () => r(c)
    ), c;
  }
  function i(o) {
    if (!e.size)
      return ka(!0);
    const c = Promise.allSettled(Array.from(e)).then(() => !0);
    if (!o)
      return c;
    const u = [c, new Promise((d) => setTimeout(() => d(!1), o))];
    return Promise.race(u);
  }
  return {
    get $() {
      return Array.from(e);
    },
    add: s,
    drain: i
  };
}
const tI = 60 * 1e3;
function nI(t, e = Date.now()) {
  const n = parseInt(`${t}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${t}`);
  return isNaN(r) ? tI : r - e;
}
function rI(t, e) {
  return t[e] || t.all || 0;
}
function sI(t, e, n = Date.now()) {
  return rI(t, e) > n;
}
function iI(t, { statusCode: e, headers: n }, r = Date.now()) {
  const s = {
    ...t
  }, i = n?.["x-sentry-rate-limits"], o = n?.["retry-after"];
  if (i)
    for (const c of i.trim().split(",")) {
      const [u, d, , , f] = c.split(":", 5), p = parseInt(u, 10), _ = (isNaN(p) ? 60 : p) * 1e3;
      if (!d)
        s.all = r + _;
      else
        for (const T of d.split(";"))
          T === "metric_bucket" ? (!f || f.split(";").includes("custom")) && (s[T] = r + _) : s[T] = r + _;
    }
  else o ? s.all = r + nI(o, r) : e === 429 && (s.all = r + 60 * 1e3);
  return s;
}
const oI = 64;
function aI(t, e, n = eI(
  t.bufferSize || oI
)) {
  let r = {};
  const s = (o) => n.drain(o);
  function i(o) {
    const c = [];
    if (Gh(o, (p, _) => {
      const T = qh(_);
      sI(r, T) ? t.recordDroppedEvent("ratelimit_backoff", T) : c.push(p);
    }), c.length === 0)
      return Promise.resolve({});
    const u = _r(o[0], c), d = (p) => {
      Gh(u, (_, T) => {
        t.recordDroppedEvent(p, qh(T));
      });
    }, f = () => e({ body: BS(u) }).then(
      (p) => (p.statusCode !== void 0 && (p.statusCode < 200 || p.statusCode >= 300) && x && M.warn(`Sentry responded with status code ${p.statusCode} to sent event.`), r = iI(r, p), p),
      (p) => {
        throw d("network_error"), x && M.error("Encountered error running transport request:", p), p;
      }
    );
    return n.add(f).then(
      (p) => p,
      (p) => {
        if (p === hg)
          return x && M.error("Skipped sending event because buffer is full."), d("queue_overflow"), Promise.resolve({});
        throw p;
      }
    );
  }
  return {
    send: i,
    flush: s
  };
}
const cI = "thismessage:/";
function fg(t) {
  return "isRelative" in t;
}
function pg(t, e) {
  const n = t.indexOf("://") <= 0 && t.indexOf("//") !== 0, r = n ? cI : void 0;
  try {
    if ("canParse" in URL && !URL.canParse(t, r))
      return;
    const s = new URL(t, r);
    return n ? {
      isRelative: n,
      pathname: s.pathname,
      search: s.search,
      hash: s.hash
    } : s;
  } catch {
  }
}
function uI(t) {
  if (fg(t))
    return t.pathname;
  const e = new URL(t);
  return e.search = "", e.hash = "", ["80", "443"].includes(e.port) && (e.port = ""), e.password && (e.password = "%filtered%"), e.username && (e.username = "%filtered%"), e.toString();
}
function er(t) {
  if (!t)
    return {};
  const e = t.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!e)
    return {};
  const n = e[6] || "", r = e[8] || "";
  return {
    host: e[4],
    path: e[5],
    protocol: e[2],
    search: n,
    hash: r,
    relative: e[5] + n + r
    // everything minus origin
  };
}
function lI(t) {
  return t.split(/[?#]/, 1)[0];
}
function dI(t) {
  "aggregates" in t ? t.attrs?.ip_address === void 0 && (t.attrs = {
    ...t.attrs,
    ip_address: "{{auto}}"
  }) : t.ipAddress === void 0 && (t.ipAddress = "{{auto}}");
}
function hI(t, e, n = [e], r = "npm") {
  const s = t._metadata || {};
  s.sdk || (s.sdk = {
    name: `sentry.javascript.${e}`,
    packages: n.map((i) => ({
      name: `${r}:@sentry/${i}`,
      version: Xn
    })),
    version: Xn
  }), t._metadata = s;
}
function mg(t = {}) {
  const e = t.client || te();
  if (!RT() || !e)
    return {};
  const n = mr(), r = ns(n);
  if (r.getTraceData)
    return r.getTraceData(t);
  const s = t.scope || oe(), i = t.span || nt(), o = i ? AS(i) : fI(s), c = i ? Qt(i) : ul(e, s), u = dS(c);
  if (!Vm.test(o))
    return M.warn("Invalid sentry-trace data. Cannot generate trace data"), {};
  const f = {
    "sentry-trace": o,
    baggage: u
  };
  if (t.propagateTraceparent) {
    const p = i ? RS(i) : pI(s);
    p && (f.traceparent = p);
  }
  return f;
}
function fI(t) {
  const { traceId: e, sampled: n, propagationSpanId: r } = t.getPropagationContext();
  return Um(e, r, n);
}
function pI(t) {
  const { traceId: e, sampled: n, propagationSpanId: r } = t.getPropagationContext();
  return Fm(e, r, n);
}
const mI = 100;
function or(t, e) {
  const n = te(), r = Mn();
  if (!n) return;
  const { beforeBreadcrumb: s = null, maxBreadcrumbs: i = mI } = n.getOptions();
  if (i <= 0) return;
  const c = { timestamp: gr(), ...t }, u = s ? ui(() => s(c, e)) : c;
  u !== null && (n.emit && n.emit("beforeAddBreadcrumb", u, e), r.addBreadcrumb(u, i));
}
let ff;
const gI = "FunctionToString", pf = /* @__PURE__ */ new WeakMap(), _I = () => ({
  name: gI,
  setupOnce() {
    ff = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...t) {
        const e = rl(this), n = pf.has(te()) && e !== void 0 ? e : this;
        return ff.apply(n, t);
      };
    } catch {
    }
  },
  setup(t) {
    pf.set(t, !0);
  }
}), yI = _I, EI = [
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
], vI = "EventFilters", SI = (t = {}) => {
  let e;
  return {
    name: vI,
    setup(n) {
      const r = n.getOptions();
      e = mf(t, r);
    },
    processEvent(n, r, s) {
      if (!e) {
        const i = s.getOptions();
        e = mf(t, i);
      }
      return II(n, e) ? null : n;
    }
  };
}, TI = (t = {}) => ({
  ...SI(t),
  name: "InboundFilters"
});
function mf(t = {}, e = {}) {
  return {
    allowUrls: [...t.allowUrls || [], ...e.allowUrls || []],
    denyUrls: [...t.denyUrls || [], ...e.denyUrls || []],
    ignoreErrors: [
      ...t.ignoreErrors || [],
      ...e.ignoreErrors || [],
      ...t.disableErrorDefaults ? [] : EI
    ],
    ignoreTransactions: [...t.ignoreTransactions || [], ...e.ignoreTransactions || []]
  };
}
function II(t, e) {
  if (t.type) {
    if (t.type === "transaction" && bI(t, e.ignoreTransactions))
      return x && M.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${Wn(t)}`
      ), !0;
  } else {
    if (wI(t, e.ignoreErrors))
      return x && M.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${Wn(t)}`
      ), !0;
    if (PI(t))
      return x && M.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${Wn(
          t
        )}`
      ), !0;
    if (AI(t, e.denyUrls))
      return x && M.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${Wn(
          t
        )}.
Url: ${Xo(t)}`
      ), !0;
    if (!RI(t, e.allowUrls))
      return x && M.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${Wn(
          t
        )}.
Url: ${Xo(t)}`
      ), !0;
  }
  return !1;
}
function wI(t, e) {
  return e?.length ? ag(t).some((n) => vn(n, e)) : !1;
}
function bI(t, e) {
  if (!e?.length)
    return !1;
  const n = t.transaction;
  return n ? vn(n, e) : !1;
}
function AI(t, e) {
  if (!e?.length)
    return !1;
  const n = Xo(t);
  return n ? vn(n, e) : !1;
}
function RI(t, e) {
  if (!e?.length)
    return !0;
  const n = Xo(t);
  return n ? vn(n, e) : !0;
}
function CI(t = []) {
  for (let e = t.length - 1; e >= 0; e--) {
    const n = t[e];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function Xo(t) {
  try {
    const n = [...t.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? CI(n) : null;
  } catch {
    return x && M.error(`Cannot extract url for event ${Wn(t)}`), null;
  }
}
function PI(t) {
  return t.exception?.values?.length ? (
    // No top-level message
    !t.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !t.exception.values.some((e) => e.stacktrace || e.type && e.type !== "Error" || e.value)
  ) : !1;
}
function DI(t, e, n, r, s, i) {
  if (!s.exception?.values || !i || !Yt(i.originalException, Error))
    return;
  const o = s.exception.values.length > 0 ? s.exception.values[s.exception.values.length - 1] : void 0;
  o && (s.exception.values = mu(
    t,
    e,
    r,
    i.originalException,
    n,
    s.exception.values,
    o,
    0
  ));
}
function mu(t, e, n, r, s, i, o, c) {
  if (i.length >= n + 1)
    return i;
  let u = [...i];
  if (Yt(r[s], Error)) {
    gf(o, c);
    const d = t(e, r[s]), f = u.length;
    _f(d, s, f, c), u = mu(
      t,
      e,
      n,
      r[s],
      s,
      [d, ...u],
      d,
      f
    );
  }
  return Array.isArray(r.errors) && r.errors.forEach((d, f) => {
    if (Yt(d, Error)) {
      gf(o, c);
      const p = t(e, d), _ = u.length;
      _f(p, `errors[${f}]`, _, c), u = mu(
        t,
        e,
        n,
        d,
        s,
        [p, ...u],
        p,
        _
      );
    }
  }), u;
}
function gf(t, e) {
  t.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...t.mechanism,
    ...t.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: e
  };
}
function _f(t, e, n, r) {
  t.mechanism = {
    handled: !0,
    ...t.mechanism,
    type: "chained",
    source: e,
    exception_id: n,
    parent_id: r
  };
}
function gg(t) {
  const e = "console";
  Nn(e, t), On(e, kI);
}
function kI() {
  "console" in J && pm.forEach(function(t) {
    t in J.console && ot(J.console, t, function(e) {
      return zo[t] = e, function(...n) {
        lt("console", { args: n, level: t }), zo[t]?.apply(J.console, n);
      };
    });
  });
}
function NI(t) {
  return t === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(t) ? t : "log";
}
const OI = "Dedupe", MI = () => {
  let t;
  return {
    name: OI,
    processEvent(e) {
      if (e.type)
        return e;
      try {
        if (xI(e, t))
          return x && M.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return t = e;
    }
  };
}, LI = MI;
function xI(t, e) {
  return e ? !!(VI(t, e) || UI(t, e)) : !1;
}
function VI(t, e) {
  const n = t.message, r = e.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !yg(t, e) || !_g(t, e));
}
function UI(t, e) {
  const n = yf(e), r = yf(t);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !yg(t, e) || !_g(t, e));
}
function _g(t, e) {
  let n = Ph(t), r = Ph(e);
  if (!n && !r)
    return !0;
  if (n && !r || !n && r || (n = n, r = r, r.length !== n.length))
    return !1;
  for (let s = 0; s < r.length; s++) {
    const i = r[s], o = n[s];
    if (i.filename !== o.filename || i.lineno !== o.lineno || i.colno !== o.colno || i.function !== o.function)
      return !1;
  }
  return !0;
}
function yg(t, e) {
  let n = t.fingerprint, r = e.fingerprint;
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
function yf(t) {
  return t.exception?.values?.[0];
}
function FI(t, e, n, r, s) {
  if (!t.fetchData)
    return;
  const { method: i, url: o } = t.fetchData, c = Tt() && e(o);
  if (t.endTimestamp && c) {
    const T = t.fetchData.__span;
    if (!T) return;
    const w = r[T];
    w && (jI(w, t), BI(w, t, s), delete r[T]);
    return;
  }
  const { spanOrigin: u = "auto.http.browser", propagateTraceparent: d = !1 } = typeof s == "object" ? s : { spanOrigin: s }, f = !!nt(), p = c && f ? is(GI(o, i, u)) : new wn();
  if (t.fetchData.__span = p.spanContext().spanId, r[p.spanContext().spanId] = p, n(t.fetchData.url)) {
    const T = t.args[0], w = t.args[1] || {}, k = $I(
      T,
      w,
      // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
      // we do not want to use the span as base for the trace headers,
      // which means that the headers will be generated from the scope and the sampling decision is deferred
      Tt() && f ? p : void 0,
      d
    );
    k && (t.args[1] = w, w.headers = k);
  }
  const _ = te();
  if (_) {
    const T = {
      input: t.args,
      response: t.response,
      startTimestamp: t.startTimestamp,
      endTimestamp: t.endTimestamp
    };
    _.emit("beforeOutgoingRequestSpan", p, T);
  }
  return p;
}
function BI(t, e, n) {
  (typeof n == "object" && n !== null ? n.onRequestSpanEnd : void 0)?.(t, {
    headers: e.response?.headers,
    error: e.error
  });
}
function $I(t, e, n, r) {
  const s = mg({ span: n, propagateTraceparent: r }), i = s["sentry-trace"], o = s.baggage, c = s.traceparent;
  if (!i)
    return;
  const u = e.headers || (Tm(t) ? t.headers : void 0);
  if (u)
    if (HI(u)) {
      const d = new Headers(u);
      if (d.get("sentry-trace") || d.set("sentry-trace", i), r && c && !d.get("traceparent") && d.set("traceparent", c), o) {
        const f = d.get("baggage");
        f ? so(f) || d.set("baggage", `${f},${o}`) : d.set("baggage", o);
      }
      return d;
    } else if (Array.isArray(u)) {
      const d = [...u];
      u.find((p) => p[0] === "sentry-trace") || d.push(["sentry-trace", i]), r && c && !u.find((p) => p[0] === "traceparent") && d.push(["traceparent", c]);
      const f = u.find(
        (p) => p[0] === "baggage" && so(p[1])
      );
      return o && !f && d.push(["baggage", o]), d;
    } else {
      const d = "sentry-trace" in u ? u["sentry-trace"] : void 0, f = "traceparent" in u ? u.traceparent : void 0, p = "baggage" in u ? u.baggage : void 0, _ = p ? Array.isArray(p) ? [...p] : [p] : [], T = p && (Array.isArray(p) ? p.find((k) => so(k)) : so(p));
      o && !T && _.push(o);
      const w = {
        ...u,
        "sentry-trace": d ?? i,
        baggage: _.length > 0 ? _.join(",") : void 0
      };
      return r && c && !f && (w.traceparent = c), w;
    }
  else return { ...s };
}
function jI(t, e) {
  if (e.response) {
    Nm(t, e.response.status);
    const n = e.response?.headers?.get("content-length");
    if (n) {
      const r = parseInt(n);
      r > 0 && t.setAttribute("http.response_content_length", r);
    }
  } else e.error && t.setStatus({ code: we, message: "internal_error" });
  t.end();
}
function so(t) {
  return t.split(",").some((e) => e.trim().startsWith(ol));
}
function HI(t) {
  return typeof Headers < "u" && Yt(t, Headers);
}
function GI(t, e, n) {
  const r = pg(t);
  return {
    name: r ? `${e} ${uI(r)}` : e,
    attributes: qI(t, r, e, n)
  };
}
function qI(t, e, n, r) {
  const s = {
    url: t,
    type: "fetch",
    "http.method": n,
    [Ie]: r,
    [Xt]: "http.client"
  };
  return e && (fg(e) || (s["http.url"] = e.href, s["server.address"] = e.host), e.search && (s["http.query"] = e.search), e.hash && (s["http.fragment"] = e.hash)), s;
}
function Ef(t, e, n) {
  return "util" in J && typeof J.util.format == "function" ? J.util.format(...t) : zI(t, e, n);
}
function zI(t, e, n) {
  return t.map(
    (r) => ir(r) ? String(r) : JSON.stringify(At(r, e, n))
  ).join(" ");
}
function WI(t) {
  return /%[sdifocO]/.test(t);
}
function KI(t, e) {
  const n = {}, r = new Array(e.length).fill("{}").join(" ");
  return n["sentry.message.template"] = `${t} ${r}`, e.forEach((s, i) => {
    n[`sentry.message.parameter.${i}`] = s;
  }), n;
}
const YI = "ConsoleLogs", vf = {
  [Ie]: "auto.log.console"
}, JI = (t = {}) => {
  const e = t.levels || pm;
  return {
    name: YI,
    setup(n) {
      const { enableLogs: r, normalizeDepth: s = 3, normalizeMaxBreadth: i = 1e3 } = n.getOptions();
      if (!r) {
        x && M.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
        return;
      }
      gg(({ args: o, level: c }) => {
        if (te() !== n || !e.includes(c))
          return;
        const u = o[0], d = o.slice(1);
        if (c === "assert") {
          if (!u) {
            const T = d.length > 0 ? `Assertion failed: ${Ef(d, s, i)}` : "Assertion failed";
            of({ level: "error", message: T, attributes: vf });
          }
          return;
        }
        const f = c === "log", p = o.length > 1 && typeof o[0] == "string" && !WI(o[0]), _ = {
          ...vf,
          ...p ? KI(u, d) : {}
        };
        of({
          level: f ? "info" : c,
          message: Ef(o, s, i),
          severityNumber: f ? 10 : void 0,
          attributes: _
        });
      });
    }
  };
}, ml = JI;
function Eg(t) {
  if (t !== void 0)
    return t >= 400 && t < 500 ? "warning" : t >= 500 ? "error" : void 0;
}
const Qs = J;
function XI() {
  return "history" in Qs && !!Qs.history;
}
function QI() {
  if (!("fetch" in Qs))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function gu(t) {
  return t && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(t.toString());
}
function ZI() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!QI())
    return !1;
  if (gu(Qs.fetch))
    return !0;
  let t = !1;
  const e = Qs.document;
  if (e && typeof e.createElement == "function")
    try {
      const n = e.createElement("iframe");
      n.hidden = !0, e.head.appendChild(n), n.contentWindow?.fetch && (t = gu(n.contentWindow.fetch)), e.head.removeChild(n);
    } catch (n) {
      x && M.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return t;
}
function vg(t, e) {
  const n = "fetch";
  Nn(n, t), On(n, () => Sg(void 0, e));
}
function ew(t) {
  const e = "fetch-body-resolved";
  Nn(e, t), On(e, () => Sg(nw));
}
function Sg(t, e = !1) {
  e && !ZI() || ot(J, "fetch", function(n) {
    return function(...r) {
      const s = new Error(), { method: i, url: o } = rw(r), c = {
        args: r,
        fetchData: {
          method: i,
          url: o
        },
        startTimestamp: be() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: s,
        headers: sw(r)
      };
      return t || lt("fetch", {
        ...c
      }), n.apply(J, r).then(
        async (u) => (t ? t(u) : lt("fetch", {
          ...c,
          endTimestamp: be() * 1e3,
          response: u
        }), u),
        (u) => {
          if (lt("fetch", {
            ...c,
            endTimestamp: be() * 1e3,
            error: u
          }), tl(u) && u.stack === void 0 && (u.stack = s.stack, at(u, "framesToPop", 1)), u instanceof TypeError && (u.message === "Failed to fetch" || u.message === "Load failed" || u.message === "NetworkError when attempting to fetch resource."))
            try {
              const d = new URL(c.fetchData.url);
              u.message = `${u.message} (${d.host})`;
            } catch {
            }
          throw u;
        }
      );
    };
  });
}
async function tw(t, e) {
  if (t?.body) {
    const n = t.body, r = n.getReader(), s = setTimeout(
      () => {
        n.cancel().then(null, () => {
        });
      },
      90 * 1e3
      // 90s
    );
    let i = !0;
    for (; i; ) {
      let o;
      try {
        o = setTimeout(() => {
          n.cancel().then(null, () => {
          });
        }, 5e3);
        const { done: c } = await r.read();
        clearTimeout(o), c && (e(), i = !1);
      } catch {
        i = !1;
      } finally {
        clearTimeout(o);
      }
    }
    clearTimeout(s), r.releaseLock(), n.cancel().then(null, () => {
    });
  }
}
function nw(t) {
  let e;
  try {
    e = t.clone();
  } catch {
    return;
  }
  tw(e, () => {
    lt("fetch-body-resolved", {
      endTimestamp: be() * 1e3,
      response: t
    });
  });
}
function _u(t, e) {
  return !!t && typeof t == "object" && !!t[e];
}
function Sf(t) {
  return typeof t == "string" ? t : t ? _u(t, "url") ? t.url : t.toString ? t.toString() : "" : "";
}
function rw(t) {
  if (t.length === 0)
    return { method: "GET", url: "" };
  if (t.length === 2) {
    const [n, r] = t;
    return {
      url: Sf(n),
      method: _u(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const e = t[0];
  return {
    url: Sf(e),
    method: _u(e, "method") ? String(e.method).toUpperCase() : "GET"
  };
}
function sw(t) {
  const [e, n] = t;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (Tm(e))
      return new Headers(e.headers);
  } catch {
  }
}
function iw() {
  return "npm";
}
const re = J;
let yu = 0;
function Tg() {
  return yu > 0;
}
function ow() {
  yu++, setTimeout(() => {
    yu--;
  });
}
function jr(t, e = {}) {
  function n(s) {
    return typeof s == "function";
  }
  if (!n(t))
    return t;
  try {
    const s = t.__sentry_wrapped__;
    if (s)
      return typeof s == "function" ? s : t;
    if (rl(t))
      return t;
  } catch {
    return t;
  }
  const r = function(...s) {
    try {
      const i = s.map((o) => jr(o, e));
      return t.apply(this, i);
    } catch (i) {
      throw ow(), di((o) => {
        o.addEventProcessor((c) => (e.mechanism && (au(c, void 0), Ur(c, e.mechanism)), c.extra = {
          ...c.extra,
          arguments: s
        }, c)), AT(i);
      }), i;
    }
  };
  try {
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && (r[s] = t[s]);
  } catch {
  }
  wm(r, t), at(t, "__sentry_wrapped__", r);
  try {
    Object.getOwnPropertyDescriptor(r, "name").configurable && Object.defineProperty(r, "name", {
      get() {
        return t.name;
      }
    });
  } catch {
  }
  return r;
}
function gl() {
  const t = Pa(), { referrer: e } = re.document || {}, { userAgent: n } = re.navigator || {}, r = {
    ...e && { Referer: e },
    ...n && { "User-Agent": n }
  };
  return {
    url: t,
    headers: r
  };
}
function _l(t, e) {
  const n = yl(t, e), r = {
    type: dw(e),
    value: hw(e)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function aw(t, e, n, r) {
  const i = te()?.getOptions().normalizeDepth, o = _w(e), c = {
    __serialized__: Wm(e, i)
  };
  if (o)
    return {
      exception: {
        values: [_l(t, o)]
      },
      extra: c
    };
  const u = {
    exception: {
      values: [
        {
          type: Ca(e) ? e.constructor.name : r ? "UnhandledRejection" : "Error",
          value: mw(e, { isUnhandledRejection: r })
        }
      ]
    },
    extra: c
  };
  if (n) {
    const d = yl(t, n);
    d.length && (u.exception.values[0].stacktrace = { frames: d });
  }
  return u;
}
function Vc(t, e) {
  return {
    exception: {
      values: [_l(t, e)]
    }
  };
}
function yl(t, e) {
  const n = e.stacktrace || e.stack || "", r = uw(e), s = lw(e);
  try {
    return t(n, r, s);
  } catch {
  }
  return [];
}
const cw = /Minified React error #\d+;/i;
function uw(t) {
  return t && cw.test(t.message) ? 1 : 0;
}
function lw(t) {
  return typeof t.framesToPop == "number" ? t.framesToPop : 0;
}
function Ig(t) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? t instanceof WebAssembly.Exception : !1;
}
function dw(t) {
  const e = t?.name;
  return !e && Ig(t) ? t.message && Array.isArray(t.message) && t.message.length == 2 ? t.message[0] : "WebAssembly.Exception" : e;
}
function hw(t) {
  const e = t?.message;
  return Ig(t) ? Array.isArray(t.message) && t.message.length == 2 ? t.message[1] : "wasm exception" : e ? e.error && typeof e.error.message == "string" ? e.error.message : e : "No error message";
}
function fw(t, e, n, r) {
  const s = n?.syntheticException || void 0, i = El(t, e, s, r);
  return Ur(i), i.level = "error", n?.event_id && (i.event_id = n.event_id), ka(i);
}
function pw(t, e, n = "info", r, s) {
  const i = r?.syntheticException || void 0, o = Eu(t, e, i, s);
  return o.level = n, r?.event_id && (o.event_id = r.event_id), ka(o);
}
function El(t, e, n, r, s) {
  let i;
  if (vm(e) && e.error)
    return Vc(t, e.error);
  if (kh(e) || Lv(e)) {
    const o = e;
    if ("stack" in e)
      i = Vc(t, e);
    else {
      const c = o.name || (kh(o) ? "DOMError" : "DOMException"), u = o.message ? `${c}: ${o.message}` : c;
      i = Eu(t, u, n, r), au(i, u);
    }
    return "code" in o && (i.tags = { ...i.tags, "DOMException.code": `${o.code}` }), i;
  }
  return tl(e) ? Vc(t, e) : Ws(e) || Ca(e) ? (i = aw(t, e, n, s), Ur(i, {
    synthetic: !0
  }), i) : (i = Eu(t, e, n, r), au(i, `${e}`), Ur(i, {
    synthetic: !0
  }), i);
}
function Eu(t, e, n, r) {
  const s = {};
  if (r && n) {
    const i = yl(t, n);
    i.length && (s.exception = {
      values: [{ value: e, stacktrace: { frames: i } }]
    }), Ur(s, { synthetic: !0 });
  }
  if (Ra(e)) {
    const { __sentry_template_string__: i, __sentry_template_values__: o } = e;
    return s.logentry = {
      message: i,
      params: o
    }, s;
  }
  return s.message = e, s;
}
function mw(t, { isUnhandledRejection: e }) {
  const n = $v(t), r = e ? "promise rejection" : "exception";
  return vm(t) ? `Event \`ErrorEvent\` captured as ${r} with message \`${t.message}\`` : Ca(t) ? `Event \`${gw(t)}\` (type=${t.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function gw(t) {
  try {
    const e = Object.getPrototypeOf(t);
    return e ? e.constructor.name : void 0;
  } catch {
  }
}
function _w(t) {
  for (const e in t)
    if (Object.prototype.hasOwnProperty.call(t, e)) {
      const n = t[e];
      if (n instanceof Error)
        return n;
    }
}
class Na extends YT {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(e) {
    const n = yw(e), r = re.SENTRY_SDK_SOURCE || iw();
    hI(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: s, sendClientReports: i, enableLogs: o, _experiments: c } = this._options;
    re.document && (i || o || c?.enableMetrics) && re.document.addEventListener("visibilitychange", () => {
      re.document.visibilityState === "hidden" && (i && this._flushOutcomes(), o && fl(this), c?.enableMetrics && ig(this));
    }), s && this.on("beforeSendSession", dI);
  }
  /**
   * @inheritDoc
   */
  eventFromException(e, n) {
    return fw(this._options.stackParser, e, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(e, n = "info", r) {
    return pw(this._options.stackParser, e, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(e, n, r, s) {
    return e.platform = e.platform || "javascript", super._prepareEvent(e, n, r, s);
  }
}
function yw(t) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : re.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...t
  };
}
const mi = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, $ = J, Ew = (t, e) => t > e[1] ? "poor" : t > e[0] ? "needs-improvement" : "good", gi = (t, e, n, r) => {
  let s, i;
  return (o) => {
    e.value >= 0 && (o || r) && (i = e.value - (s ?? 0), (i || s === void 0) && (s = e.value, e.delta = i, e.rating = Ew(e.value, n), t(e)));
  };
}, vw = () => `v5-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`, _i = (t = !0) => {
  const e = $.performance?.getEntriesByType?.("navigation")[0];
  if (
    // sentry-specific change:
    // We don't want to check for responseStart for our own use of `getNavigationEntry`
    !t || e && e.responseStart > 0 && e.responseStart < performance.now()
  )
    return e;
}, os = () => _i()?.activationStart ?? 0, yi = (t, e = -1) => {
  const n = _i();
  let r = "navigate";
  return n && ($.document?.prerendering || os() > 0 ? r = "prerender" : $.document?.wasDiscarded ? r = "restore" : n.type && (r = n.type.replace(/_/g, "-"))), {
    name: t,
    value: e,
    rating: "good",
    // If needed, will be updated when reported. `const` to keep the type from widening to `string`.
    delta: 0,
    entries: [],
    id: vw(),
    navigationType: r
  };
}, Uc = /* @__PURE__ */ new WeakMap();
function vl(t, e) {
  return Uc.get(t) || Uc.set(t, new e()), Uc.get(t);
}
class Qo {
  constructor() {
    Qo.prototype.__init.call(this), Qo.prototype.__init2.call(this);
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
  _processEntry(e) {
    if (e.hadRecentInput) return;
    const n = this._sessionEntries[0], r = this._sessionEntries[this._sessionEntries.length - 1];
    this._sessionValue && n && r && e.startTime - r.startTime < 1e3 && e.startTime - n.startTime < 5e3 ? (this._sessionValue += e.value, this._sessionEntries.push(e)) : (this._sessionValue = e.value, this._sessionEntries = [e]), this._onAfterProcessingUnexpectedShift?.(e);
  }
}
const as = (t, e, n = {}) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(t)) {
      const r = new PerformanceObserver((s) => {
        Promise.resolve().then(() => {
          e(s.getEntries());
        });
      });
      return r.observe({ type: t, buffered: !0, ...n }), r;
    }
  } catch {
  }
}, Sl = (t) => {
  let e = !1;
  return () => {
    e || (t(), e = !0);
  };
};
let xs = -1;
const Sw = () => $.document?.visibilityState === "hidden" && !$.document?.prerendering ? 0 : 1 / 0, Zo = (t) => {
  $.document.visibilityState === "hidden" && xs > -1 && (xs = t.type === "visibilitychange" ? t.timeStamp : 0, Iw());
}, Tw = () => {
  addEventListener("visibilitychange", Zo, !0), addEventListener("prerenderingchange", Zo, !0);
}, Iw = () => {
  removeEventListener("visibilitychange", Zo, !0), removeEventListener("prerenderingchange", Zo, !0);
}, Tl = () => {
  if ($.document && xs < 0) {
    const t = os();
    xs = ($.document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").filter((n) => n.name === "hidden" && n.startTime > t)[0]?.startTime) ?? Sw(), Tw();
  }
  return {
    get firstHiddenTime() {
      return xs;
    }
  };
}, Oa = (t) => {
  $.document?.prerendering ? addEventListener("prerenderingchange", () => t(), !0) : t();
}, ww = [1800, 3e3], bw = (t, e = {}) => {
  Oa(() => {
    const n = Tl(), r = yi("FCP");
    let s;
    const o = as("paint", (c) => {
      for (const u of c)
        u.name === "first-contentful-paint" && (o.disconnect(), u.startTime < n.firstHiddenTime && (r.value = Math.max(u.startTime - os(), 0), r.entries.push(u), s(!0)));
    });
    o && (s = gi(t, r, ww, e.reportAllChanges));
  });
}, Aw = [0.1, 0.25], Rw = (t, e = {}) => {
  bw(
    Sl(() => {
      const n = yi("CLS", 0);
      let r;
      const s = vl(e, Qo), i = (c) => {
        for (const u of c)
          s._processEntry(u);
        s._sessionValue > n.value && (n.value = s._sessionValue, n.entries = s._sessionEntries, r());
      }, o = as("layout-shift", i);
      o && (r = gi(t, n, Aw, e.reportAllChanges), $.document?.addEventListener("visibilitychange", () => {
        $.document?.visibilityState === "hidden" && (i(o.takeRecords()), r(!0));
      }), $?.setTimeout?.(r));
    })
  );
};
let wg = 0, Fc = 1 / 0, io = 0;
const Cw = (t) => {
  t.forEach((e) => {
    e.interactionId && (Fc = Math.min(Fc, e.interactionId), io = Math.max(io, e.interactionId), wg = io ? (io - Fc) / 7 + 1 : 0);
  });
};
let vu;
const bg = () => vu ? wg : performance.interactionCount || 0, Pw = () => {
  "interactionCount" in performance || vu || (vu = as("event", Cw, {
    type: "event",
    buffered: !0,
    durationThreshold: 0
  }));
}, Bc = 10;
let Ag = 0;
const Dw = () => bg() - Ag;
class ea {
  constructor() {
    ea.prototype.__init.call(this), ea.prototype.__init2.call(this);
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
    Ag = bg(), this._longestInteractionList.length = 0, this._longestInteractionMap.clear();
  }
  /**
   * Returns the estimated p98 longest interaction based on the stored
   * interaction candidates and the interaction count for the current page.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _estimateP98LongestInteraction() {
    const e = Math.min(
      this._longestInteractionList.length - 1,
      Math.floor(Dw() / 50)
    );
    return this._longestInteractionList[e];
  }
  /**
   * Takes a performance entry and adds it to the list of worst interactions
   * if its duration is long enough to make it among the worst. If the
   * entry is part of an existing interaction, it is merged and the latency
   * and entries list is updated as needed.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  _processEntry(e) {
    if (this._onBeforeProcessingEntry?.(e), !(e.interactionId || e.entryType === "first-input")) return;
    const n = this._longestInteractionList.at(-1);
    let r = this._longestInteractionMap.get(e.interactionId);
    if (r || this._longestInteractionList.length < Bc || // If the above conditions are false, `minLongestInteraction` will be set.
    e.duration > n._latency) {
      if (r ? e.duration > r._latency ? (r.entries = [e], r._latency = e.duration) : e.duration === r._latency && e.startTime === r.entries[0].startTime && r.entries.push(e) : (r = {
        id: e.interactionId,
        entries: [e],
        _latency: e.duration
      }, this._longestInteractionMap.set(r.id, r), this._longestInteractionList.push(r)), this._longestInteractionList.sort((s, i) => i._latency - s._latency), this._longestInteractionList.length > Bc) {
        const s = this._longestInteractionList.splice(Bc);
        for (const i of s)
          this._longestInteractionMap.delete(i.id);
      }
      this._onAfterProcessingINPCandidate?.(r);
    }
  }
}
const Il = (t) => {
  const e = (n) => {
    (n.type === "pagehide" || $.document?.visibilityState === "hidden") && t(n);
  };
  $.document && (addEventListener("visibilitychange", e, !0), addEventListener("pagehide", e, !0));
}, Rg = (t) => {
  const e = $.requestIdleCallback || $.setTimeout;
  $.document?.visibilityState === "hidden" ? t() : (t = Sl(t), e(t), Il(t));
}, kw = [200, 500], Nw = 40, Ow = (t, e = {}) => {
  globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype && Oa(() => {
    Pw();
    const n = yi("INP");
    let r;
    const s = vl(e, ea), i = (c) => {
      Rg(() => {
        for (const d of c)
          s._processEntry(d);
        const u = s._estimateP98LongestInteraction();
        u && u._latency !== n.value && (n.value = u._latency, n.entries = u.entries, r());
      });
    }, o = as("event", i, {
      // Event Timing entries have their durations rounded to the nearest 8ms,
      // so a duration of 40ms would be any event that spans 2.5 or more frames
      // at 60Hz. This threshold is chosen to strike a balance between usefulness
      // and performance. Running this callback for any interaction that spans
      // just one or two frames is likely not worth the insight that could be
      // gained.
      durationThreshold: e.durationThreshold ?? Nw
    });
    r = gi(t, n, kw, e.reportAllChanges), o && (o.observe({ type: "first-input", buffered: !0 }), Il(() => {
      i(o.takeRecords()), r(!0);
    }));
  });
};
class Mw {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, jsdoc/require-jsdoc
  _processEntry(e) {
    this._onBeforeProcessingEntry?.(e);
  }
}
const Lw = [2500, 4e3], xw = (t, e = {}) => {
  Oa(() => {
    const n = Tl(), r = yi("LCP");
    let s;
    const i = vl(e, Mw), o = (u) => {
      e.reportAllChanges || (u = u.slice(-1));
      for (const d of u)
        i._processEntry(d), d.startTime < n.firstHiddenTime && (r.value = Math.max(d.startTime - os(), 0), r.entries = [d], s());
    }, c = as("largest-contentful-paint", o);
    if (c) {
      s = gi(t, r, Lw, e.reportAllChanges);
      const u = Sl(() => {
        o(c.takeRecords()), c.disconnect(), s(!0);
      });
      for (const d of ["keydown", "click", "visibilitychange"])
        $.document && addEventListener(d, () => Rg(u), {
          capture: !0,
          once: !0
        });
    }
  });
}, Vw = [800, 1800], Su = (t) => {
  $.document?.prerendering ? Oa(() => Su(t)) : $.document?.readyState !== "complete" ? addEventListener("load", () => Su(t), !0) : setTimeout(t);
}, Uw = (t, e = {}) => {
  const n = yi("TTFB"), r = gi(t, n, Vw, e.reportAllChanges);
  Su(() => {
    const s = _i();
    s && (n.value = Math.max(s.responseStart - os(), 0), n.entries = [s], r(!0));
  });
}, Vs = {}, ta = {};
let Cg, Pg, Dg, kg;
function Ng(t, e = !1) {
  return Ma("cls", t, $w, Cg, e);
}
function Og(t, e = !1) {
  return Ma("lcp", t, jw, Pg, e);
}
function Fw(t) {
  return Ma("ttfb", t, Hw, Dg);
}
function Bw(t) {
  return Ma("inp", t, Gw, kg);
}
function Hr(t, e) {
  return Mg(t, e), ta[t] || (qw(t), ta[t] = !0), Lg(t, e);
}
function Ei(t, e) {
  const n = Vs[t];
  if (n?.length)
    for (const r of n)
      try {
        r(e);
      } catch (s) {
        mi && M.error(
          `Error while triggering instrumentation handler.
Type: ${t}
Name: ${Kt(r)}
Error:`,
          s
        );
      }
}
function $w() {
  return Rw(
    (t) => {
      Ei("cls", {
        metric: t
      }), Cg = t;
    },
    // We want the callback to be called whenever the CLS value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function jw() {
  return xw(
    (t) => {
      Ei("lcp", {
        metric: t
      }), Pg = t;
    },
    // We want the callback to be called whenever the LCP value updates.
    // By default, the callback is only called when the tab goes to the background.
    { reportAllChanges: !0 }
  );
}
function Hw() {
  return Uw((t) => {
    Ei("ttfb", {
      metric: t
    }), Dg = t;
  });
}
function Gw() {
  return Ow((t) => {
    Ei("inp", {
      metric: t
    }), kg = t;
  });
}
function Ma(t, e, n, r, s = !1) {
  Mg(t, e);
  let i;
  return ta[t] || (i = n(), ta[t] = !0), r && e({ metric: r }), Lg(t, e, s ? i : void 0);
}
function qw(t) {
  const e = {};
  t === "event" && (e.durationThreshold = 0), as(
    t,
    (n) => {
      Ei(t, { entries: n });
    },
    e
  );
}
function Mg(t, e) {
  Vs[t] = Vs[t] || [], Vs[t].push(e);
}
function Lg(t, e, n) {
  return () => {
    n && n();
    const r = Vs[t];
    if (!r)
      return;
    const s = r.indexOf(e);
    s !== -1 && r.splice(s, 1);
  };
}
function zw(t) {
  return "duration" in t;
}
function $c(t) {
  return typeof t == "number" && isFinite(t);
}
function bn(t, e, n, { ...r }) {
  const s = ee(t).start_timestamp;
  return s && s > e && typeof t.updateStartTime == "function" && t.updateStartTime(e), ll(t, () => {
    const i = is({
      startTime: e,
      ...r
    });
    return i && i.end(n), i;
  });
}
function wl(t) {
  const e = te();
  if (!e)
    return;
  const { name: n, transaction: r, attributes: s, startTime: i } = t, { release: o, environment: c, sendDefaultPii: u } = e.getOptions(), f = e.getIntegrationByName("Replay")?.getReplayId(), p = oe(), _ = p.getUser(), T = _ !== void 0 ? _.email || _.id || _.ip_address : void 0;
  let w;
  try {
    w = p.getScopeData().contexts.profile.profile_id;
  } catch {
  }
  const k = {
    release: o,
    environment: c,
    user: T || void 0,
    profile_id: w || void 0,
    replay_id: f || void 0,
    transaction: r,
    // Web vital score calculation relies on the user agent to account for different
    // browsers setting different thresholds for what is considered a good/meh/bad value.
    // For example: Chrome vs. Chrome Mobile
    "user_agent.original": $.navigator?.userAgent,
    // This tells Sentry to infer the IP address from the request
    "client.address": u ? "{{auto}}" : void 0,
    ...s
  };
  return is({
    name: n,
    attributes: k,
    startTime: i,
    experimental: {
      standalone: !0
    }
  });
}
function vi() {
  return $.addEventListener && $.performance;
}
function ge(t) {
  return t / 1e3;
}
function Ww(t) {
  let e = "unknown", n = "unknown", r = "";
  for (const s of t) {
    if (s === "/") {
      [e, n] = t.split("/");
      break;
    }
    if (!isNaN(Number(s))) {
      e = r === "h" ? "http" : r, n = t.split(r)[1];
      break;
    }
    r += s;
  }
  return r === t && (e = r), { name: e, version: n };
}
function xg(t) {
  try {
    return PerformanceObserver.supportedEntryTypes.includes(t);
  } catch {
    return !1;
  }
}
function Vg(t, e) {
  let n, r = !1;
  function s(c) {
    !r && n && e(c, n), r = !0;
  }
  Il(() => {
    s("pagehide");
  });
  const i = t.on("beforeStartNavigationSpan", (c, u) => {
    u?.isRedirect || (s("navigation"), i(), o());
  }), o = t.on("afterStartPageLoadSpan", (c) => {
    n = c.spanContext().spanId, o();
  });
}
function Kw(t) {
  let e = 0, n;
  if (!xg("layout-shift"))
    return;
  const r = Ng(({ metric: s }) => {
    const i = s.entries[s.entries.length - 1];
    i && (e = s.value, n = i);
  }, !0);
  Vg(t, (s, i) => {
    Yw(e, n, i, s), r();
  });
}
function Yw(t, e, n, r) {
  mi && M.log(`Sending CLS span (${t})`);
  const s = e ? ge((ct() || 0) + e.startTime) : be(), i = oe().getScopeData().transactionName, o = e ? Ot(e.sources[0]?.node) : "Layout shift", c = {
    [Ie]: "auto.http.browser.cls",
    [Xt]: "ui.webvital.cls",
    [rs]: 0,
    // attach the pageload span id to the CLS span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  e?.sources && e.sources.forEach((d, f) => {
    c[`cls.source.${f + 1}`] = Ot(d.node);
  });
  const u = wl({
    name: o,
    transaction: i,
    attributes: c,
    startTime: s
  });
  u && (u.addEvent("cls", {
    [hi]: "",
    [fi]: t
  }), u.end(s));
}
function Jw(t) {
  let e = 0, n;
  if (!xg("largest-contentful-paint"))
    return;
  const r = Og(({ metric: s }) => {
    const i = s.entries[s.entries.length - 1];
    i && (e = s.value, n = i);
  }, !0);
  Vg(t, (s, i) => {
    Xw(e, n, i, s), r();
  });
}
function Xw(t, e, n, r) {
  mi && M.log(`Sending LCP span (${t})`);
  const s = ge((ct() || 0) + (e?.startTime || 0)), i = oe().getScopeData().transactionName, o = e ? Ot(e.element) : "Largest contentful paint", c = {
    [Ie]: "auto.http.browser.lcp",
    [Xt]: "ui.webvital.lcp",
    [rs]: 0,
    // LCP is a point-in-time metric
    // attach the pageload span id to the LCP span so that we can link them in the UI
    "sentry.pageload.span_id": n,
    // describes what triggered the web vital to be reported
    "sentry.report_event": r
  };
  e && (e.element && (c["lcp.element"] = Ot(e.element)), e.id && (c["lcp.id"] = e.id), e.url && (c["lcp.url"] = e.url.trim().slice(0, 200)), e.loadTime != null && (c["lcp.loadTime"] = e.loadTime), e.renderTime != null && (c["lcp.renderTime"] = e.renderTime), e.size != null && (c["lcp.size"] = e.size));
  const u = wl({
    name: o,
    transaction: i,
    attributes: c,
    startTime: s
  });
  u && (u.addEvent("lcp", {
    [hi]: "millisecond",
    [fi]: t
  }), u.end(s));
}
function ut(t) {
  return t && ((ct() || performance.timeOrigin) + t) / 1e3;
}
function Ug(t) {
  const e = {};
  if (t.nextHopProtocol != null) {
    const { name: n, version: r } = Ww(t.nextHopProtocol);
    e["network.protocol.version"] = r, e["network.protocol.name"] = n;
  }
  return ct() || vi()?.timeOrigin ? Qw({
    ...e,
    "http.request.redirect_start": ut(t.redirectStart),
    "http.request.redirect_end": ut(t.redirectEnd),
    "http.request.worker_start": ut(t.workerStart),
    "http.request.fetch_start": ut(t.fetchStart),
    "http.request.domain_lookup_start": ut(t.domainLookupStart),
    "http.request.domain_lookup_end": ut(t.domainLookupEnd),
    "http.request.connect_start": ut(t.connectStart),
    "http.request.secure_connection_start": ut(t.secureConnectionStart),
    "http.request.connection_end": ut(t.connectEnd),
    "http.request.request_start": ut(t.requestStart),
    "http.request.response_start": ut(t.responseStart),
    "http.request.response_end": ut(t.responseEnd),
    // For TTFB we actually want the relative time from timeOrigin to responseStart
    // This way, TTFB always measures the "first page load" experience.
    // see: https://web.dev/articles/ttfb#measure-resource-requests
    "http.request.time_to_first_byte": t.responseStart != null ? t.responseStart / 1e3 : void 0
  }) : e;
}
function Qw(t) {
  return Object.fromEntries(Object.entries(t).filter(([, e]) => e != null));
}
const Zw = 2147483647;
let Tf = 0, gt = {}, Ze, na;
function eb({
  recordClsStandaloneSpans: t,
  recordLcpStandaloneSpans: e,
  client: n
}) {
  const r = vi();
  if (r && ct()) {
    r.mark && $.performance.mark("sentry-tracing-init");
    const s = e ? Jw(n) : ib(), i = ob(), o = t ? Kw(n) : sb();
    return () => {
      s?.(), i(), o?.();
    };
  }
  return () => {
  };
}
function tb() {
  Hr("longtask", ({ entries: t }) => {
    const e = nt();
    if (!e)
      return;
    const { op: n, start_timestamp: r } = ee(e);
    for (const s of t) {
      const i = ge(ct() + s.startTime), o = ge(s.duration);
      n === "navigation" && r && i < r || bn(e, i, i + o, {
        name: "Main UI thread blocked",
        op: "ui.long-task",
        attributes: {
          [Ie]: "auto.ui.browser.metrics"
        }
      });
    }
  });
}
function nb() {
  new PerformanceObserver((e) => {
    const n = nt();
    if (n)
      for (const r of e.getEntries()) {
        if (!r.scripts[0])
          continue;
        const s = ge(ct() + r.startTime), { start_timestamp: i, op: o } = ee(n);
        if (o === "navigation" && i && s < i)
          continue;
        const c = ge(r.duration), u = {
          [Ie]: "auto.ui.browser.metrics"
        }, d = r.scripts[0], { invoker: f, invokerType: p, sourceURL: _, sourceFunctionName: T, sourceCharPosition: w } = d;
        u["browser.script.invoker"] = f, u["browser.script.invoker_type"] = p, _ && (u["code.filepath"] = _), T && (u["code.function"] = T), w !== -1 && (u["browser.script.source_char_position"] = w), bn(n, s, s + c, {
          name: "Main UI thread blocked",
          op: "ui.long-animation-frame",
          attributes: u
        });
      }
  }).observe({ type: "long-animation-frame", buffered: !0 });
}
function rb() {
  Hr("event", ({ entries: t }) => {
    const e = nt();
    if (e) {
      for (const n of t)
        if (n.name === "click") {
          const r = ge(ct() + n.startTime), s = ge(n.duration), i = {
            name: Ot(n.target),
            op: `ui.interaction.${n.name}`,
            startTime: r,
            attributes: {
              [Ie]: "auto.ui.browser.metrics"
            }
          }, o = Im(n.target);
          o && (i.attributes["ui.component_name"] = o), bn(e, r, r + s, i);
        }
    }
  });
}
function sb() {
  return Ng(({ metric: t }) => {
    const e = t.entries[t.entries.length - 1];
    e && (gt.cls = { value: t.value, unit: "" }, na = e);
  }, !0);
}
function ib() {
  return Og(({ metric: t }) => {
    const e = t.entries[t.entries.length - 1];
    e && (gt.lcp = { value: t.value, unit: "millisecond" }, Ze = e);
  }, !0);
}
function ob() {
  return Fw(({ metric: t }) => {
    t.entries[t.entries.length - 1] && (gt.ttfb = { value: t.value, unit: "millisecond" });
  });
}
function ab(t, e) {
  const n = vi(), r = ct();
  if (!n?.getEntries || !r)
    return;
  const s = ge(r), i = n.getEntries(), { op: o, start_timestamp: c } = ee(t);
  i.slice(Tf).forEach((u) => {
    const d = ge(u.startTime), f = ge(
      // Inexplicably, Chrome sometimes emits a negative duration. We need to work around this.
      // There is a SO post attempting to explain this, but it leaves one with open questions: https://stackoverflow.com/questions/23191918/peformance-getentries-and-negative-duration-display
      // The way we clamp the value is probably not accurate, since we have observed this happen for things that may take a while to load, like for example the replay worker.
      // TODO: Investigate why this happens and how to properly mitigate. For now, this is a workaround to prevent transactions being dropped due to negative duration spans.
      Math.max(0, u.duration)
    );
    if (!(o === "navigation" && c && s + d < c))
      switch (u.entryType) {
        case "navigation": {
          db(t, u, s);
          break;
        }
        case "mark":
        case "paint":
        case "measure": {
          ub(t, u, d, f, s, e.ignorePerformanceApiSpans);
          const p = Tl(), _ = u.startTime < p.firstHiddenTime;
          u.name === "first-paint" && _ && (gt.fp = { value: u.startTime, unit: "millisecond" }), u.name === "first-contentful-paint" && _ && (gt.fcp = { value: u.startTime, unit: "millisecond" });
          break;
        }
        case "resource": {
          pb(
            t,
            u,
            u.name,
            d,
            f,
            s,
            e.ignoreResourceSpans
          );
          break;
        }
      }
  }), Tf = Math.max(i.length - 1, 0), mb(t), o === "pageload" && (yb(gt), e.recordClsOnPageloadSpan || delete gt.cls, e.recordLcpOnPageloadSpan || delete gt.lcp, Object.entries(gt).forEach(([u, d]) => {
    QS(u, d.value, d.unit);
  }), t.setAttribute("performance.timeOrigin", s), t.setAttribute("performance.activationStart", os()), gb(t, e)), Ze = void 0, na = void 0, gt = {};
}
function cb(t) {
  if (t?.entryType === "measure")
    try {
      return t.detail.devtools.track === "Components ⚛";
    } catch {
      return;
    }
}
function ub(t, e, n, r, s, i) {
  if (cb(e) || ["mark", "measure"].includes(e.entryType) && vn(e.name, i))
    return;
  const o = _i(!1), c = ge(o ? o.requestStart : 0), u = s + Math.max(n, c), d = s + n, f = d + r, p = {
    [Ie]: "auto.resource.browser.metrics"
  };
  u !== d && (p["sentry.browser.measure_happened_before_request"] = !0, p["sentry.browser.measure_start_time"] = u), lb(p, e), u <= f && bn(t, u, f, {
    name: e.name,
    op: e.entryType,
    attributes: p
  });
}
function lb(t, e) {
  try {
    const n = e.detail;
    if (!n)
      return;
    if (typeof n == "object") {
      for (const [r, s] of Object.entries(n))
        if (s && ir(s))
          t[`sentry.browser.measure.detail.${r}`] = s;
        else if (s !== void 0)
          try {
            t[`sentry.browser.measure.detail.${r}`] = JSON.stringify(s);
          } catch {
          }
      return;
    }
    if (ir(n)) {
      t["sentry.browser.measure.detail"] = n;
      return;
    }
    try {
      t["sentry.browser.measure.detail"] = JSON.stringify(n);
    } catch {
    }
  } catch {
  }
}
function db(t, e, n) {
  ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((r) => {
    oo(t, e, r, n);
  }), oo(t, e, "secureConnection", n, "TLS/SSL"), oo(t, e, "fetch", n, "cache"), oo(t, e, "domainLookup", n, "DNS"), fb(t, e, n);
}
function oo(t, e, n, r, s = n) {
  const i = hb(n), o = e[i], c = e[`${n}Start`];
  !c || !o || bn(t, r + ge(c), r + ge(o), {
    op: `browser.${s}`,
    name: e.name,
    attributes: {
      [Ie]: "auto.ui.browser.metrics",
      ...n === "redirect" && e.redirectCount != null ? { "http.redirect_count": e.redirectCount } : {}
    }
  });
}
function hb(t) {
  return t === "secureConnection" ? "connectEnd" : t === "fetch" ? "domainLookupStart" : `${t}End`;
}
function fb(t, e, n) {
  const r = n + ge(e.requestStart), s = n + ge(e.responseEnd), i = n + ge(e.responseStart);
  e.responseEnd && (bn(t, r, s, {
    op: "browser.request",
    name: e.name,
    attributes: {
      [Ie]: "auto.ui.browser.metrics"
    }
  }), bn(t, i, s, {
    op: "browser.response",
    name: e.name,
    attributes: {
      [Ie]: "auto.ui.browser.metrics"
    }
  }));
}
function pb(t, e, n, r, s, i, o) {
  if (e.initiatorType === "xmlhttprequest" || e.initiatorType === "fetch")
    return;
  const c = e.initiatorType ? `resource.${e.initiatorType}` : "resource.other";
  if (o?.includes(c))
    return;
  const u = {
    [Ie]: "auto.resource.browser.metrics"
  }, d = er(n);
  d.protocol && (u["url.scheme"] = d.protocol.split(":").pop()), d.host && (u["server.address"] = d.host), u["url.same_origin"] = n.includes($.location.origin), _b(e, u, [
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
  const f = { ...u, ...Ug(e) }, p = i + r, _ = p + s;
  bn(t, p, _, {
    name: n.replace($.location.origin, ""),
    op: c,
    attributes: f
  });
}
function mb(t) {
  const e = $.navigator;
  if (!e)
    return;
  const n = e.connection;
  n && (n.effectiveType && t.setAttribute("effectiveConnectionType", n.effectiveType), n.type && t.setAttribute("connectionType", n.type), $c(n.rtt) && (gt["connection.rtt"] = { value: n.rtt, unit: "millisecond" })), $c(e.deviceMemory) && t.setAttribute("deviceMemory", `${e.deviceMemory} GB`), $c(e.hardwareConcurrency) && t.setAttribute("hardwareConcurrency", String(e.hardwareConcurrency));
}
function gb(t, e) {
  Ze && e.recordLcpOnPageloadSpan && (Ze.element && t.setAttribute("lcp.element", Ot(Ze.element)), Ze.id && t.setAttribute("lcp.id", Ze.id), Ze.url && t.setAttribute("lcp.url", Ze.url.trim().slice(0, 200)), Ze.loadTime != null && t.setAttribute("lcp.loadTime", Ze.loadTime), Ze.renderTime != null && t.setAttribute("lcp.renderTime", Ze.renderTime), t.setAttribute("lcp.size", Ze.size)), na?.sources && e.recordClsOnPageloadSpan && na.sources.forEach(
    (n, r) => t.setAttribute(`cls.source.${r + 1}`, Ot(n.node))
  );
}
function _b(t, e, n) {
  n.forEach(([r, s]) => {
    const i = t[r];
    i != null && (typeof i == "number" && i < Zw || typeof i == "string") && (e[s] = i);
  });
}
function yb(t) {
  const e = _i(!1);
  if (!e)
    return;
  const { responseStart: n, requestStart: r } = e;
  r <= n && (t["ttfb.requestTime"] = {
    value: n - r,
    unit: "millisecond"
  });
}
function Eb() {
  return vi() && ct() ? Hr("element", vb) : () => {
  };
}
const vb = ({ entries: t }) => {
  const e = nt(), n = e ? Je(e) : void 0, r = n ? ee(n).description : oe().getScopeData().transactionName;
  t.forEach((s) => {
    const i = s;
    if (!i.identifier)
      return;
    const o = i.name, c = i.renderTime, u = i.loadTime, [d, f] = u ? [ge(u), "load-time"] : c ? [ge(c), "render-time"] : [be(), "entry-emission"], p = o === "image-paint" ? (
      // for image paints, we can acually get a duration because image-paint entries also have a `loadTime`
      // and `renderTime`. `loadTime` is the time when the image finished loading and `renderTime` is the
      // time when the image finished rendering.
      ge(Math.max(0, (c ?? 0) - (u ?? 0)))
    ) : (
      // for `'text-paint'` entries, we can't get a duration because the `loadTime` is always zero.
      0
    ), _ = {
      [Ie]: "auto.ui.browser.elementtiming",
      [Xt]: "ui.elementtiming",
      // name must be user-entered, so we can assume low cardinality
      [Dt]: "component",
      // recording the source of the span start time, as it varies depending on available data
      "sentry.span_start_time_source": f,
      "sentry.transaction_name": r,
      "element.id": i.id,
      "element.type": i.element?.tagName?.toLowerCase() || "unknown",
      "element.size": i.naturalWidth && i.naturalHeight ? `${i.naturalWidth}x${i.naturalHeight}` : void 0,
      "element.render_time": c,
      "element.load_time": u,
      // `url` is `0`(number) for text paints (hence we fall back to undefined)
      "element.url": i.url || void 0,
      "element.identifier": i.identifier,
      "element.paint_type": o
    };
    pi(
      {
        name: `element[${i.identifier}]`,
        attributes: _,
        startTime: d,
        onlyIfParent: !0
      },
      (T) => {
        T.end(d + p);
      }
    );
  });
}, Sb = 1e3;
let If, Tu, Iu;
function Tb(t) {
  const e = "dom";
  Nn(e, t), On(e, Ib);
}
function Ib() {
  if (!$.document)
    return;
  const t = lt.bind(null, "dom"), e = wf(t, !0);
  $.document.addEventListener("click", e, !1), $.document.addEventListener("keypress", e, !1), ["EventTarget", "Node"].forEach((n) => {
    const s = $[n]?.prototype;
    s?.hasOwnProperty?.("addEventListener") && (ot(s, "addEventListener", function(i) {
      return function(o, c, u) {
        if (o === "click" || o == "keypress")
          try {
            const d = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, f = d[o] = d[o] || { refCount: 0 };
            if (!f.handler) {
              const p = wf(t);
              f.handler = p, i.call(this, o, p, u);
            }
            f.refCount++;
          } catch {
          }
        return i.call(this, o, c, u);
      };
    }), ot(
      s,
      "removeEventListener",
      function(i) {
        return function(o, c, u) {
          if (o === "click" || o == "keypress")
            try {
              const d = this.__sentry_instrumentation_handlers__ || {}, f = d[o];
              f && (f.refCount--, f.refCount <= 0 && (i.call(this, o, f.handler, u), f.handler = void 0, delete d[o]), Object.keys(d).length === 0 && delete this.__sentry_instrumentation_handlers__);
            } catch {
            }
          return i.call(this, o, c, u);
        };
      }
    ));
  });
}
function wb(t) {
  if (t.type !== Tu)
    return !1;
  try {
    if (!t.target || t.target._sentryId !== Iu)
      return !1;
  } catch {
  }
  return !0;
}
function bb(t, e) {
  return t !== "keypress" ? !1 : e?.tagName ? !(e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable) : !0;
}
function wf(t, e = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = Ab(n);
    if (bb(n.type, r))
      return;
    at(n, "_sentryCaptured", !0), r && !r._sentryId && at(r, "_sentryId", dt());
    const s = n.type === "keypress" ? "input" : n.type;
    wb(n) || (t({ event: n, name: s, global: e }), Tu = n.type, Iu = r ? r._sentryId : void 0), clearTimeout(If), If = $.setTimeout(() => {
      Iu = void 0, Tu = void 0;
    }, Sb);
  };
}
function Ab(t) {
  try {
    return t.target;
  } catch {
    return null;
  }
}
let ao;
function bl(t) {
  const e = "history";
  Nn(e, t), On(e, Rb);
}
function Rb() {
  if ($.addEventListener("popstate", () => {
    const e = $.location.href, n = ao;
    if (ao = e, n === e)
      return;
    lt("history", { from: n, to: e });
  }), !XI())
    return;
  function t(e) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const s = ao, i = Cb(String(r));
        if (ao = i, s === i)
          return e.apply(this, n);
        lt("history", { from: s, to: i });
      }
      return e.apply(this, n);
    };
  }
  ot($.history, "pushState", t), ot($.history, "replaceState", t);
}
function Cb(t) {
  try {
    return new URL(t, $.location.origin).toString();
  } catch {
    return t;
  }
}
const Co = {};
function Pb(t) {
  const e = Co[t];
  if (e)
    return e;
  let n = $[t];
  if (gu(n))
    return Co[t] = n.bind($);
  const r = $.document;
  if (r && typeof r.createElement == "function")
    try {
      const s = r.createElement("iframe");
      s.hidden = !0, r.head.appendChild(s);
      const i = s.contentWindow;
      i?.[t] && (n = i[t]), r.head.removeChild(s);
    } catch (s) {
      mi && M.warn(`Could not create sandbox iframe for ${t} check, bailing to window.${t}: `, s);
    }
  return n && (Co[t] = n.bind($));
}
function Db(t) {
  Co[t] = void 0;
}
const Pr = "__sentry_xhr_v3__";
function Fg(t) {
  const e = "xhr";
  Nn(e, t), On(e, kb);
}
function kb() {
  if (!$.XMLHttpRequest)
    return;
  const t = XMLHttpRequest.prototype;
  t.open = new Proxy(t.open, {
    apply(e, n, r) {
      const s = new Error(), i = be() * 1e3, o = Ht(r[0]) ? r[0].toUpperCase() : void 0, c = Nb(r[1]);
      if (!o || !c)
        return e.apply(n, r);
      n[Pr] = {
        method: o,
        url: c,
        request_headers: {}
      }, o === "POST" && c.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const u = () => {
        const d = n[Pr];
        if (d && n.readyState === 4) {
          try {
            d.status_code = n.status;
          } catch {
          }
          const f = {
            endTimestamp: be() * 1e3,
            startTimestamp: i,
            xhr: n,
            virtualError: s
          };
          lt("xhr", f);
        }
      };
      return "onreadystatechange" in n && typeof n.onreadystatechange == "function" ? n.onreadystatechange = new Proxy(n.onreadystatechange, {
        apply(d, f, p) {
          return u(), d.apply(f, p);
        }
      }) : n.addEventListener("readystatechange", u), n.setRequestHeader = new Proxy(n.setRequestHeader, {
        apply(d, f, p) {
          const [_, T] = p, w = f[Pr];
          return w && Ht(_) && Ht(T) && (w.request_headers[_.toLowerCase()] = T), d.apply(f, p);
        }
      }), e.apply(n, r);
    }
  }), t.send = new Proxy(t.send, {
    apply(e, n, r) {
      const s = n[Pr];
      if (!s)
        return e.apply(n, r);
      r[0] !== void 0 && (s.body = r[0]);
      const i = {
        startTimestamp: be() * 1e3,
        xhr: n
      };
      return lt("xhr", i), e.apply(n, r);
    }
  });
}
function Nb(t) {
  if (Ht(t))
    return t;
  try {
    return t.toString();
  } catch {
  }
}
function Ob(t) {
  let e;
  try {
    e = t.getAllResponseHeaders();
  } catch (n) {
    return mi && M.error(n, "Failed to get xhr response headers", t), {};
  }
  return e ? e.split(`\r
`).reduce((n, r) => {
    const [s, i] = r.split(": ");
    return i && (n[s.toLowerCase()] = i), n;
  }, {}) : {};
}
const jc = [], Po = /* @__PURE__ */ new Map(), Mb = 60;
function Lb() {
  if (vi() && ct()) {
    const e = xb();
    return () => {
      e();
    };
  }
  return () => {
  };
}
const bf = {
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
function xb() {
  return Bw(Vb);
}
const Vb = ({ metric: t }) => {
  if (t.value == null)
    return;
  const e = ge(t.value);
  if (e > Mb)
    return;
  const n = t.entries.find((w) => w.duration === t.value && bf[w.name]);
  if (!n)
    return;
  const { interactionId: r } = n, s = bf[n.name], i = ge(ct() + n.startTime), o = nt(), c = o ? Je(o) : void 0, d = (r != null ? Po.get(r) : void 0) || c, f = d ? ee(d).description : oe().getScopeData().transactionName, p = Ot(n.target), _ = {
    [Ie]: "auto.http.browser.inp",
    [Xt]: `ui.interaction.${s}`,
    [rs]: n.duration
  }, T = wl({
    name: p,
    transaction: f,
    attributes: _,
    startTime: i
  });
  T && (T.addEvent("inp", {
    [hi]: "millisecond",
    [fi]: t.value
  }), T.end(i + e));
};
function Ub() {
  const t = ({ entries: e }) => {
    const n = nt(), r = n && Je(n);
    e.forEach((s) => {
      if (!zw(s) || !r)
        return;
      const i = s.interactionId;
      if (i != null && !Po.has(i)) {
        if (jc.length > 10) {
          const o = jc.shift();
          Po.delete(o);
        }
        jc.push(i), Po.set(i, r);
      }
    });
  };
  Hr("event", t), Hr("first-input", t);
}
function La(t, e = Pb("fetch")) {
  let n = 0, r = 0;
  async function s(i) {
    const o = i.body.length;
    n += o, r++;
    const c = {
      body: i.body,
      method: "POST",
      referrerPolicy: "strict-origin",
      headers: t.headers,
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
      ...t.fetchOptions
    };
    try {
      const u = await e(t.url, c);
      return {
        statusCode: u.status,
        headers: {
          "x-sentry-rate-limits": u.headers.get("X-Sentry-Rate-Limits"),
          "retry-after": u.headers.get("Retry-After")
        }
      };
    } catch (u) {
      throw Db("fetch"), u;
    } finally {
      n -= o, r--;
    }
  }
  return aI(t, s);
}
const Fb = 30, Bb = 50;
function wu(t, e, n, r) {
  const s = {
    filename: t,
    function: e === "<anonymous>" ? sr : e,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (s.lineno = n), r !== void 0 && (s.colno = r), s;
}
const $b = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, jb = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, Hb = /\((\S*)(?::(\d+))(?::(\d+))\)/, Gb = /at (.+?) ?\(data:(.+?),/, qb = (t) => {
  const e = t.match(Gb);
  if (e)
    return {
      filename: `<data:${e[2]}>`,
      function: e[1]
    };
  const n = $b.exec(t);
  if (n) {
    const [, s, i, o] = n;
    return wu(s, sr, +i, +o);
  }
  const r = jb.exec(t);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const c = Hb.exec(r[2]);
      c && (r[2] = c[1], r[3] = c[2], r[4] = c[3]);
    }
    const [i, o] = Bg(r[1] || sr, r[2]);
    return wu(o, i, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, zb = [Fb, qb], Wb = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, Kb = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, Yb = (t) => {
  const e = Wb.exec(t);
  if (e) {
    if (e[3] && e[3].indexOf(" > eval") > -1) {
      const i = Kb.exec(e[3]);
      i && (e[1] = e[1] || "eval", e[3] = i[1], e[4] = i[2], e[5] = "");
    }
    let r = e[3], s = e[1] || sr;
    return [s, r] = Bg(s, r), wu(r, s, e[4] ? +e[4] : void 0, e[5] ? +e[5] : void 0);
  }
}, Jb = [Bb, Yb], Xb = [zb, Jb], xa = kv(...Xb), Bg = (t, e) => {
  const n = t.indexOf("safari-extension") !== -1, r = t.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    t.indexOf("@") !== -1 ? t.split("@")[0] : sr,
    n ? `safari-extension:${e}` : `safari-web-extension:${e}`
  ] : [t, e];
}, It = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, co = 1024, Qb = "Breadcrumbs", Zb = (t = {}) => {
  const e = {
    console: !0,
    dom: !0,
    fetch: !0,
    history: !0,
    sentry: !0,
    xhr: !0,
    ...t
  };
  return {
    name: Qb,
    setup(n) {
      e.console && gg(rA(n)), e.dom && Tb(nA(n, e.dom)), e.xhr && Fg(sA(n)), e.fetch && vg(iA(n)), e.history && bl(oA(n)), e.sentry && n.on("beforeSendEvent", tA(n));
    }
  };
}, eA = Zb;
function tA(t) {
  return function(n) {
    te() === t && or(
      {
        category: `sentry.${n.type === "transaction" ? "transaction" : "event"}`,
        event_id: n.event_id,
        level: n.level,
        message: Wn(n)
      },
      {
        event: n
      }
    );
  };
}
function nA(t, e) {
  return function(r) {
    if (te() !== t)
      return;
    let s, i, o = typeof e == "object" ? e.serializeAttribute : void 0, c = typeof e == "object" && typeof e.maxStringLength == "number" ? e.maxStringLength : void 0;
    c && c > co && (It && M.warn(
      `\`dom.maxStringLength\` cannot exceed ${co}, but a value of ${c} was configured. Sentry will use ${co} instead.`
    ), c = co), typeof o == "string" && (o = [o]);
    try {
      const d = r.event, f = aA(d) ? d.target : d;
      s = Ot(f, { keyAttrs: o, maxStringLength: c }), i = Im(f);
    } catch {
      s = "<unknown>";
    }
    if (s.length === 0)
      return;
    const u = {
      category: `ui.${r.name}`,
      message: s
    };
    i && (u.data = { "ui.component_name": i }), or(u, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function rA(t) {
  return function(n) {
    if (te() !== t)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: NI(n.level),
      message: Nh(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${Nh(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    or(r, {
      input: n.args,
      level: n.level
    });
  };
}
function sA(t) {
  return function(n) {
    if (te() !== t)
      return;
    const { startTimestamp: r, endTimestamp: s } = n, i = n.xhr[Pr];
    if (!r || !s || !i)
      return;
    const { method: o, url: c, status_code: u, body: d } = i, f = {
      method: o,
      url: c,
      status_code: u
    }, p = {
      xhr: n.xhr,
      input: d,
      startTimestamp: r,
      endTimestamp: s
    }, _ = {
      category: "xhr",
      data: f,
      type: "http",
      level: Eg(u)
    };
    t.emit("beforeOutgoingRequestBreadcrumb", _, p), or(_, p);
  };
}
function iA(t) {
  return function(n) {
    if (te() !== t)
      return;
    const { startTimestamp: r, endTimestamp: s } = n;
    if (s && !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === "POST"))
      if (n.fetchData.method, n.fetchData.url, n.error) {
        const i = n.fetchData, o = {
          data: n.error,
          input: n.args,
          startTimestamp: r,
          endTimestamp: s
        }, c = {
          category: "fetch",
          data: i,
          level: "error",
          type: "http"
        };
        t.emit("beforeOutgoingRequestBreadcrumb", c, o), or(c, o);
      } else {
        const i = n.response, o = {
          ...n.fetchData,
          status_code: i?.status
        };
        n.fetchData.request_body_size, n.fetchData.response_body_size, i?.status;
        const c = {
          input: n.args,
          response: i,
          startTimestamp: r,
          endTimestamp: s
        }, u = {
          category: "fetch",
          data: o,
          type: "http",
          level: Eg(o.status_code)
        };
        t.emit("beforeOutgoingRequestBreadcrumb", u, c), or(u, c);
      }
  };
}
function oA(t) {
  return function(n) {
    if (te() !== t)
      return;
    let r = n.from, s = n.to;
    const i = er(re.location.href);
    let o = r ? er(r) : void 0;
    const c = er(s);
    o?.path || (o = i), i.protocol === c.protocol && i.host === c.host && (s = c.relative), i.protocol === o.protocol && i.host === o.host && (r = o.relative), or({
      category: "navigation",
      data: {
        from: r,
        to: s
      }
    });
  };
}
function aA(t) {
  return !!t && !!t.target;
}
const cA = [
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
], uA = "BrowserApiErrors", lA = (t = {}) => {
  const e = {
    XMLHttpRequest: !0,
    eventTarget: !0,
    requestAnimationFrame: !0,
    setInterval: !0,
    setTimeout: !0,
    unregisterOriginalCallbacks: !1,
    ...t
  };
  return {
    name: uA,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      e.setTimeout && ot(re, "setTimeout", Af), e.setInterval && ot(re, "setInterval", Af), e.requestAnimationFrame && ot(re, "requestAnimationFrame", hA), e.XMLHttpRequest && "XMLHttpRequest" in re && ot(XMLHttpRequest.prototype, "send", fA);
      const n = e.eventTarget;
      n && (Array.isArray(n) ? n : cA).forEach((s) => pA(s, e));
    }
  };
}, dA = lA;
function Af(t) {
  return function(...e) {
    const n = e[0];
    return e[0] = jr(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${Kt(t)}`
      }
    }), t.apply(this, e);
  };
}
function hA(t) {
  return function(e) {
    return t.apply(this, [
      jr(e, {
        mechanism: {
          data: {
            handler: Kt(t)
          },
          handled: !1,
          type: "auto.browser.browserapierrors.requestAnimationFrame"
        }
      })
    ]);
  };
}
function fA(t) {
  return function(...e) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((s) => {
      s in n && typeof n[s] == "function" && ot(n, s, function(i) {
        const o = {
          mechanism: {
            data: {
              handler: Kt(i)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${s}`
          }
        }, c = rl(i);
        return c && (o.mechanism.data.handler = Kt(c)), jr(i, o);
      });
    }), t.apply(this, e);
  };
}
function pA(t, e) {
  const r = re[t]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (ot(r, "addEventListener", function(s) {
    return function(i, o, c) {
      try {
        mA(o) && (o.handleEvent = jr(o.handleEvent, {
          mechanism: {
            data: {
              handler: Kt(o),
              target: t
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return e.unregisterOriginalCallbacks && gA(this, i, o), s.apply(this, [
        i,
        jr(o, {
          mechanism: {
            data: {
              handler: Kt(o),
              target: t
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        c
      ]);
    };
  }), ot(r, "removeEventListener", function(s) {
    return function(i, o, c) {
      try {
        const u = o.__sentry_wrapped__;
        u && s.call(this, i, u, c);
      } catch {
      }
      return s.call(this, i, o, c);
    };
  }));
}
function mA(t) {
  return typeof t.handleEvent == "function";
}
function gA(t, e, n) {
  t && typeof t == "object" && "removeEventListener" in t && typeof t.removeEventListener == "function" && t.removeEventListener(e, n);
}
const _A = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof re.document > "u") {
      It && M.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    tf({ ignoreDuration: !0 }), nf(), bl(({ from: t, to: e }) => {
      t !== void 0 && t !== e && (tf({ ignoreDuration: !0 }), nf());
    });
  }
}), yA = "GlobalHandlers", EA = (t = {}) => {
  const e = {
    onerror: !0,
    onunhandledrejection: !0,
    ...t
  };
  return {
    name: yA,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      e.onerror && (SA(n), Rf("onerror")), e.onunhandledrejection && (TA(n), Rf("onunhandledrejection"));
    }
  };
}, vA = EA;
function SA(t) {
  _m((e) => {
    const { stackParser: n, attachStacktrace: r } = $g();
    if (te() !== t || Tg())
      return;
    const { msg: s, url: i, line: o, column: c, error: u } = e, d = bA(
      El(n, u || s, void 0, r, !1),
      i,
      o,
      c
    );
    d.level = "error", eg(d, {
      originalException: u,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function TA(t) {
  ym((e) => {
    const { stackParser: n, attachStacktrace: r } = $g();
    if (te() !== t || Tg())
      return;
    const s = IA(e), i = ir(s) ? wA(s) : El(n, s, void 0, r, !0);
    i.level = "error", eg(i, {
      originalException: s,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function IA(t) {
  if (ir(t))
    return t;
  try {
    if ("reason" in t)
      return t.reason;
    if ("detail" in t && "reason" in t.detail)
      return t.detail.reason;
  } catch {
  }
  return t;
}
function wA(t) {
  return {
    exception: {
      values: [
        {
          type: "UnhandledRejection",
          // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
          value: `Non-Error promise rejection captured with value: ${String(t)}`
        }
      ]
    }
  };
}
function bA(t, e, n, r) {
  const s = t.exception = t.exception || {}, i = s.values = s.values || [], o = i[0] = i[0] || {}, c = o.stacktrace = o.stacktrace || {}, u = c.frames = c.frames || [], d = r, f = n, p = AA(e) ?? Pa();
  return u.length === 0 && u.push({
    colno: d,
    filename: p,
    function: sr,
    in_app: !0,
    lineno: f
  }), t;
}
function Rf(t) {
  It && M.log(`Global Handler attached: ${t}`);
}
function $g() {
  return te()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function AA(t) {
  if (!(!Ht(t) || t.length === 0)) {
    if (t.startsWith("data:")) {
      const e = t.match(/^data:([^;]+)/), n = e ? e[1] : "text/javascript", r = t.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return t.slice(0, 1024);
  }
}
const RA = () => ({
  name: "HttpContext",
  preprocessEvent(t) {
    if (!re.navigator && !re.location && !re.document)
      return;
    const e = gl(), n = {
      ...e.headers,
      ...t.request?.headers
    };
    t.request = {
      ...e,
      ...t.request,
      headers: n
    };
  }
}), CA = "cause", PA = 5, DA = "LinkedErrors", kA = (t = {}) => {
  const e = t.limit || PA, n = t.key || CA;
  return {
    name: DA,
    preprocessEvent(r, s, i) {
      const o = i.getOptions();
      DI(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        _l,
        o.stackParser,
        n,
        e,
        r,
        s
      );
    }
  };
}, NA = kA;
function Va(t) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    TI(),
    yI(),
    dA(),
    eA(),
    vA(),
    NA(),
    LI(),
    RA(),
    _A()
  ];
}
function OA(t) {
  return t.split(",").some((e) => e.trim().startsWith("sentry-"));
}
function jg(t) {
  try {
    return new URL(t, re.location.origin).href;
  } catch {
    return;
  }
}
function MA(t) {
  return t.entryType === "resource" && "initiatorType" in t && typeof t.nextHopProtocol == "string" && (t.initiatorType === "fetch" || t.initiatorType === "xmlhttprequest");
}
function Hg(t) {
  try {
    return new Headers(t);
  } catch {
    return;
  }
}
const Cf = /* @__PURE__ */ new WeakMap(), Hc = /* @__PURE__ */ new Map(), Gg = {
  traceFetch: !0,
  traceXHR: !0,
  enableHTTPTimings: !0,
  trackFetchStreamPerformance: !1
};
function LA(t, e) {
  const {
    traceFetch: n,
    traceXHR: r,
    trackFetchStreamPerformance: s,
    shouldCreateSpanForRequest: i,
    enableHTTPTimings: o,
    tracePropagationTargets: c,
    onRequestSpanStart: u,
    onRequestSpanEnd: d
  } = {
    ...Gg,
    ...e
  }, f = typeof i == "function" ? i : (w) => !0, p = (w) => xA(w, c), _ = {}, T = t.getOptions().propagateTraceparent;
  n && (t.addEventProcessor((w) => (w.type === "transaction" && w.spans && w.spans.forEach((k) => {
    if (k.op === "http.client") {
      const P = Hc.get(k.span_id);
      P && (k.timestamp = P / 1e3, Hc.delete(k.span_id));
    }
  }), w)), s && ew((w) => {
    if (w.response) {
      const k = Cf.get(w.response);
      k && w.endTimestamp && Hc.set(k, w.endTimestamp);
    }
  }), vg((w) => {
    const k = FI(w, f, p, _, {
      propagateTraceparent: T,
      onRequestSpanEnd: d
    });
    if (w.response && w.fetchData.__span && Cf.set(w.response, w.fetchData.__span), k) {
      const P = jg(w.fetchData.url), B = P ? er(P).host : void 0;
      k.setAttributes({
        "http.url": P,
        "server.address": B
      }), o && Pf(k), u?.(k, { headers: w.headers });
    }
  })), r && Fg((w) => {
    const k = VA(
      w,
      f,
      p,
      _,
      T,
      d
    );
    k && (o && Pf(k), u?.(k, {
      headers: Hg(w.xhr.__sentry_xhr_v3__?.request_headers)
    }));
  });
}
function Pf(t) {
  const { url: e } = ee(t).data;
  if (!e || typeof e != "string")
    return;
  const n = Hr("resource", ({ entries: r }) => {
    r.forEach((s) => {
      MA(s) && s.name.endsWith(e) && (t.setAttributes(Ug(s)), setTimeout(n));
    });
  });
}
function xA(t, e) {
  const n = Pa();
  if (n) {
    let r, s;
    try {
      r = new URL(t, n), s = new URL(n).origin;
    } catch {
      return !1;
    }
    const i = r.origin === s;
    return e ? vn(r.toString(), e) || i && vn(r.pathname, e) : i;
  } else {
    const r = !!t.match(/^\/(?!\/)/);
    return e ? vn(t, e) : r;
  }
}
function VA(t, e, n, r, s, i) {
  const o = t.xhr, c = o?.[Pr];
  if (!o || o.__sentry_own_request__ || !c)
    return;
  const { url: u, method: d } = c, f = Tt() && e(u);
  if (t.endTimestamp && f) {
    const B = o.__sentry_xhr_span_id__;
    if (!B) return;
    const U = r[B];
    U && c.status_code !== void 0 && (Nm(U, c.status_code), U.end(), i?.(U, {
      headers: Hg(Ob(o)),
      error: t.error
    }), delete r[B]);
    return;
  }
  const p = jg(u), _ = er(p || u), T = lI(u), w = !!nt(), k = f && w ? is({
    name: `${d} ${T}`,
    attributes: {
      url: u,
      type: "xhr",
      "http.method": d,
      "http.url": p,
      "server.address": _?.host,
      [Ie]: "auto.http.browser",
      [Xt]: "http.client",
      ..._?.search && { "http.query": _?.search },
      ..._?.hash && { "http.fragment": _?.hash }
    }
  }) : new wn();
  o.__sentry_xhr_span_id__ = k.spanContext().spanId, r[o.__sentry_xhr_span_id__] = k, n(u) && UA(
    o,
    // If performance is disabled (TWP) or there's no active root span (pageload/navigation/interaction),
    // we do not want to use the span as base for the trace headers,
    // which means that the headers will be generated from the scope and the sampling decision is deferred
    Tt() && w ? k : void 0,
    s
  );
  const P = te();
  return P && P.emit("beforeOutgoingRequestSpan", k, t), k;
}
function UA(t, e, n) {
  const { "sentry-trace": r, baggage: s, traceparent: i } = mg({ span: e, propagateTraceparent: n });
  r && FA(t, r, s, i);
}
function FA(t, e, n, r) {
  const s = t.__sentry_xhr_v3__?.request_headers;
  if (!(s?.["sentry-trace"] || !t.setRequestHeader))
    try {
      if (t.setRequestHeader("sentry-trace", e), r && !s?.traceparent && t.setRequestHeader("traceparent", r), n) {
        const i = s?.baggage;
        (!i || !OA(i)) && t.setRequestHeader("baggage", n);
      }
    } catch {
    }
}
function BA() {
  re.document ? re.document.addEventListener("visibilitychange", () => {
    const t = nt();
    if (!t)
      return;
    const e = Je(t);
    if (re.document.hidden && e) {
      const n = "cancelled", { op: r, status: s } = ee(e);
      It && M.log(`[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`), s || e.setStatus({ code: we, message: n }), e.setAttribute("sentry.cancellation_reason", "document.hidden"), e.end();
    }
  }) : It && M.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
const $A = 3600, qg = "sentry_previous_trace", jA = "sentry.previous_trace";
function HA(t, {
  linkPreviousTrace: e,
  consistentTraceSampling: n
}) {
  const r = e === "session-storage";
  let s = r ? zA() : void 0;
  t.on("spanStart", (o) => {
    if (Je(o) !== o)
      return;
    const c = oe().getPropagationContext();
    s = GA(s, o, c), r && qA(s);
  });
  let i = !0;
  n && t.on("beforeSampling", (o) => {
    if (!s)
      return;
    const c = oe(), u = c.getPropagationContext();
    if (i && u.parentSpanId) {
      i = !1;
      return;
    }
    c.setPropagationContext({
      ...u,
      dsc: {
        ...u.dsc,
        sample_rate: String(s.sampleRate),
        sampled: String(bu(s.spanContext))
      },
      sampleRand: s.sampleRand
    }), o.parentSampled = bu(s.spanContext), o.parentSampleRate = s.sampleRate, o.spanAttributes = {
      ...o.spanAttributes,
      [Dm]: s.sampleRate
    };
  });
}
function GA(t, e, n) {
  const r = ee(e);
  function s() {
    try {
      return Number(n.dsc?.sample_rate) ?? Number(r.data?.[sl]);
    } catch {
      return 0;
    }
  }
  const i = {
    spanContext: e.spanContext(),
    startTimestamp: r.start_timestamp,
    sampleRate: s(),
    sampleRand: n.sampleRand
  };
  if (!t)
    return i;
  const o = t.spanContext;
  return o.traceId === r.trace_id ? t : (Date.now() / 1e3 - t.startTimestamp <= $A && (It && M.log(
    `Adding previous_trace ${o} link to span ${{
      op: r.op,
      ...e.spanContext()
    }}`
  ), e.addLink({
    context: o,
    attributes: {
      [rS]: "previous_trace"
    }
  }), e.setAttribute(
    jA,
    `${o.traceId}-${o.spanId}-${bu(o) ? 1 : 0}`
  )), i);
}
function qA(t) {
  try {
    re.sessionStorage.setItem(qg, JSON.stringify(t));
  } catch (e) {
    It && M.warn("Could not store previous trace in sessionStorage", e);
  }
}
function zA() {
  try {
    const t = re.sessionStorage?.getItem(qg);
    return JSON.parse(t);
  } catch {
    return;
  }
}
function bu(t) {
  return t.traceFlags === 1;
}
const WA = "BrowserTracing", KA = {
  ...Ao,
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
  ...Gg
}, zg = (t = {}) => {
  const e = {
    name: void 0,
    source: void 0
  }, n = re.document, {
    enableInp: r,
    enableElementTiming: s,
    enableLongTask: i,
    enableLongAnimationFrame: o,
    _experiments: { enableInteractions: c, enableStandaloneClsSpans: u, enableStandaloneLcpSpans: d },
    beforeStartSpan: f,
    idleTimeout: p,
    finalTimeout: _,
    childSpanTimeout: T,
    markBackgroundSpan: w,
    traceFetch: k,
    traceXHR: P,
    trackFetchStreamPerformance: B,
    shouldCreateSpanForRequest: U,
    enableHTTPTimings: H,
    ignoreResourceSpans: ne,
    ignorePerformanceApiSpans: De,
    instrumentPageLoad: ce,
    instrumentNavigation: v,
    detectRedirects: g,
    linkPreviousTrace: E,
    consistentTraceSampling: S,
    enableReportPageLoaded: I,
    onRequestSpanStart: b,
    onRequestSpanEnd: y
  } = {
    ...KA,
    ...t
  };
  let ke, rt, st;
  function Qe(K, ye, W = !0) {
    const ze = ye.op === "pageload", pe = ye.name, se = f ? f(ye) : ye, xt = se.attributes || {};
    if (pe !== se.name && (xt[Dt] = "custom", se.attributes = xt), !W) {
      const wt = gr();
      is({
        ...se,
        startTime: wt
      }).end(wt);
      return;
    }
    e.name = se.name, e.source = xt[Dt];
    const We = Zm(se, {
      idleTimeout: p,
      finalTimeout: _,
      childSpanTimeout: T,
      // should wait for finish signal if it's a pageload transaction
      disableAutoFinish: ze,
      beforeSpanEnd: (wt) => {
        ke?.(), ab(wt, {
          recordClsOnPageloadSpan: !u,
          recordLcpOnPageloadSpan: !d,
          ignoreResourceSpans: ne,
          ignorePerformanceApiSpans: De
        }), kf(K, void 0);
        const Vi = oe(), oc = Vi.getPropagationContext();
        Vi.setPropagationContext({
          ...oc,
          traceId: We.spanContext().traceId,
          sampled: Ln(We),
          dsc: Qt(wt)
        }), ze && (st = void 0);
      },
      trimIdleSpanEndTimestamp: !I
    });
    ze && I && (st = We), kf(K, We);
    function xi() {
      n && ["interactive", "complete"].includes(n.readyState) && K.emit("idleSpanEnableAutoFinish", We);
    }
    ze && !I && n && (n.addEventListener("readystatechange", () => {
      xi();
    }), xi());
  }
  return {
    name: WA,
    setup(K) {
      if (kS(), ke = eb({
        recordClsStandaloneSpans: u || !1,
        recordLcpStandaloneSpans: d || !1,
        client: K
      }), r && Lb(), s && Eb(), o && J.PerformanceObserver && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes("long-animation-frame") ? nb() : i && tb(), c && rb(), g && n) {
        const W = () => {
          rt = be();
        };
        addEventListener("click", W, { capture: !0 }), addEventListener("keydown", W, { capture: !0, passive: !0 });
      }
      function ye() {
        const W = Zs(K);
        W && !ee(W).timestamp && (It && M.log(`[Tracing] Finishing current active span with op: ${ee(W).op}`), W.setAttribute(Ys, "cancelled"), W.end());
      }
      K.on("startNavigationSpan", (W, ze) => {
        if (te() !== K)
          return;
        if (ze?.isRedirect) {
          It && M.warn("[Tracing] Detected redirect, navigation span will not be the root span, but a child span."), Qe(
            K,
            {
              op: "navigation.redirect",
              ...W
            },
            !1
          );
          return;
        }
        rt = void 0, ye(), Mn().setPropagationContext({
          traceId: Jt(),
          sampleRand: Math.random(),
          propagationSpanId: Tt() ? void 0 : Gt()
        });
        const pe = oe();
        pe.setPropagationContext({
          traceId: Jt(),
          sampleRand: Math.random(),
          propagationSpanId: Tt() ? void 0 : Gt()
        }), pe.setSDKProcessingMetadata({
          normalizedRequest: void 0
        }), Qe(K, {
          op: "navigation",
          ...W,
          // Navigation starts a new trace and is NOT parented under any active interaction (e.g. ui.action.click)
          parentSpan: null,
          forceTransaction: !0
        });
      }), K.on("startPageLoadSpan", (W, ze = {}) => {
        if (te() !== K)
          return;
        ye();
        const pe = ze.sentryTrace || Df("sentry-trace"), se = ze.baggage || Df("baggage"), xt = IS(pe, se), We = oe();
        We.setPropagationContext(xt), Tt() || (We.getPropagationContext().propagationSpanId = Gt()), We.setSDKProcessingMetadata({
          normalizedRequest: gl()
        }), Qe(K, {
          op: "pageload",
          ...W
        });
      }), K.on("endPageloadSpan", () => {
        I && st && (st.setAttribute(Ys, "reportPageLoaded"), st.end());
      });
    },
    afterAllSetup(K) {
      let ye = Pa();
      if (E !== "off" && HA(K, { linkPreviousTrace: E, consistentTraceSampling: S }), re.location) {
        if (ce) {
          const W = ct();
          YA(K, {
            name: re.location.pathname,
            // pageload should always start at timeOrigin (and needs to be in s, not ms)
            startTime: W ? W / 1e3 : void 0,
            attributes: {
              [Dt]: "url",
              [Ie]: "auto.pageload.browser"
            }
          });
        }
        v && bl(({ to: W, from: ze }) => {
          if (ze === void 0 && ye?.indexOf(W) !== -1) {
            ye = void 0;
            return;
          }
          ye = void 0;
          const pe = pg(W), se = Zs(K), xt = se && g && QA(se, rt);
          JA(
            K,
            {
              name: pe?.pathname || re.location.pathname,
              attributes: {
                [Dt]: "url",
                [Ie]: "auto.navigation.browser"
              }
            },
            { url: W, isRedirect: xt }
          );
        });
      }
      w && BA(), c && XA(K, p, _, T, e), r && Ub(), LA(K, {
        traceFetch: k,
        traceXHR: P,
        trackFetchStreamPerformance: B,
        tracePropagationTargets: K.getOptions().tracePropagationTargets,
        shouldCreateSpanForRequest: U,
        enableHTTPTimings: H,
        onRequestSpanStart: b,
        onRequestSpanEnd: y
      });
    }
  };
};
function YA(t, e, n) {
  t.emit("startPageLoadSpan", e, n), oe().setTransactionName(e.name);
  const r = Zs(t);
  return r && t.emit("afterStartPageLoadSpan", r), r;
}
function JA(t, e, n) {
  const { url: r, isRedirect: s } = n || {};
  t.emit("beforeStartNavigationSpan", e, { isRedirect: s }), t.emit("startNavigationSpan", e, { isRedirect: s });
  const i = oe();
  return i.setTransactionName(e.name), r && !s && i.setSDKProcessingMetadata({
    normalizedRequest: {
      ...gl(),
      url: r
    }
  }), Zs(t);
}
function Df(t) {
  return re.document?.querySelector(`meta[name=${t}]`)?.getAttribute("content") || void 0;
}
function XA(t, e, n, r, s) {
  const i = re.document;
  let o;
  const c = () => {
    const u = "ui.action.click", d = Zs(t);
    if (d) {
      const f = ee(d).op;
      if (["navigation", "pageload"].includes(f)) {
        It && M.warn(`[Tracing] Did not create ${u} span because a pageload or navigation span is in progress.`);
        return;
      }
    }
    if (o && (o.setAttribute(Ys, "interactionInterrupted"), o.end(), o = void 0), !s.name) {
      It && M.warn(`[Tracing] Did not create ${u} transaction because _latestRouteName is missing.`);
      return;
    }
    o = Zm(
      {
        name: s.name,
        op: u,
        attributes: {
          [Dt]: s.source || "url"
        }
      },
      {
        idleTimeout: e,
        finalTimeout: n,
        childSpanTimeout: r
      }
    );
  };
  i && addEventListener("click", c, { capture: !0 });
}
const Wg = "_sentry_idleSpan";
function Zs(t) {
  return t[Wg];
}
function kf(t, e) {
  at(t, Wg, e);
}
const Nf = 1.5;
function QA(t, e) {
  const n = ee(t), r = gr(), s = n.start_timestamp;
  return !(r - s > Nf || e && r - e <= Nf);
}
let Rs;
const Ua = () => {
  if (Rs)
    return Rs;
  try {
    Rs = (import.meta ?? {}).env ?? {};
  } catch {
    Rs = {};
  }
  return Rs;
}, Gr = (t) => typeof t == "string" && t.length > 0 ? t : void 0, ZA = (t) => typeof t == "boolean" ? t : t === "true", ra = Ua(), Al = Gr(ra.VITE_SENTRY_DSN_REACT) ?? Gr(ra.SENTRY_DSN_REACT) ?? "", sa = Gr(ra.VITE_SENTRY_DSN_BROWSER) ?? Gr(ra.SENTRY_DSN_BROWSER) ?? "", An = () => {
  const t = Ua(), e = Gr(t.MODE), n = Gr(t.NODE_ENV);
  return e || n || "production";
}, Kg = () => An() === "development", eR = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (t) {
    console.warn("[Sentry] Could not read manifest version:", t);
  }
  return "1.0.0";
}, Fa = (t = "any") => {
  const e = !!Al, n = !!sa;
  let r = !1, s = [];
  if (t === "react" ? (r = e, e || (s = ["VITE_SENTRY_DSN_REACT"])) : t === "browser" ? (r = n, n || (s = ["VITE_SENTRY_DSN_BROWSER"])) : (r = e || n, !e && !n ? s = ["VITE_SENTRY_DSN_REACT", "VITE_SENTRY_DSN_BROWSER"] : e ? n || (s = ["VITE_SENTRY_DSN_BROWSER"]) : s = ["VITE_SENTRY_DSN_REACT"]), !r) {
    if (An() === "development") {
      const o = s.join(" and ");
      console.warn(`[Sentry] Missing ${t === "any" ? "at least one DSN" : t === "react" ? "React DSN" : "Browser DSN"} configuration. Set ${o} in .env file.`);
    }
    return !1;
  }
  return !0;
}, ei = () => {
  const t = An();
  return {
    environment: t,
    enableLogs: !0,
    tracesSampleRate: t === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: eR(),
    sendDefaultPii: !1,
    beforeSend(e) {
      if (e.request?.url)
        try {
          const n = new URL(e.request.url);
          n.search = "", e.request.url = n.toString();
        } catch {
        }
      return e;
    },
    beforeSendLog(e) {
      return t === "development" ? e : e.level === "trace" || e.level === "debug" ? null : e;
    }
  };
};
function Ba(t) {
  return t.filter((e) => {
    const n = e.name || (typeof e == "function" ? e.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const tR = () => {
  const t = ZA(Ua().VITE_SENTRY_SEND_DEFAULT_PII);
  return {
    ...ei(),
    sendDefaultPii: t,
    // Configurable via environment variable
    initialScope: {
      tags: {
        context: "background",
        type: "service-worker"
      }
    }
  };
}, nR = () => ({
  ...ei(),
  initialScope: {
    tags: {
      context: "popup",
      type: "react-ui"
    }
  }
}), rR = () => ({
  ...ei(),
  initialScope: {
    tags: {
      context: "options",
      type: "react-ui"
    }
  }
}), sR = () => {
  const t = An();
  return {
    ...ei(),
    tracesSampleRate: t === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(e) {
      const n = ei().beforeSend?.(e) ?? e;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
};
function Rn() {
  const t = {
    setAttribute: () => t,
    setTag: () => t,
    setContext: () => t,
    setStatus: () => t,
    finish: () => {
    },
    end: () => {
    },
    startChild: () => t,
    updateName: () => t,
    isRecording: () => !1
  };
  return t;
}
function iR(t, e) {
  const n = t.clone();
  return n.setClient(e), n;
}
function ft(t, e, n, r) {
  return !t || !e ? r?.() : n(iR(e, t), t);
}
function oR(t) {
  if (t !== void 0) {
    if (t === null)
      return { value: null };
    if (typeof t == "object")
      try {
        return JSON.parse(JSON.stringify(t));
      } catch {
        return { value: "[unserializable]" };
      }
    return { value: t };
  }
}
function ht(t, e, n, r, s) {
  ft(r, s, (i) => {
    const o = oR(n);
    o && i.setContext("logger", o), i.setLevel(t), i.captureMessage(e, t);
  });
}
function $a(t, e, n, r) {
  return ft(n, r, (s) => s.captureException(t, e));
}
let Of = !1, Do = null, Us = null, uo = !1;
function aR() {
  if (Of && Do && Us)
    return { client: Do, scope: Us };
  if (!Fa("browser"))
    return { client: null, scope: new fe() };
  try {
    const t = tR(), e = Va({}), n = Ba(e);
    try {
      const c = ml({ levels: ["warn", "error"] });
      n.push(c);
    } catch (c) {
      console.warn("[v0][Sentry] Console logging integration not available:", c);
    }
    const r = new Na({
      ...t,
      dsn: sa,
      transport: La,
      stackParser: xa,
      integrations: n
    }), s = new fe();
    s.setClient(r), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([c, u]) => {
      s.setTag(c, u);
    }), r.init(), Do = r, Us = s, Of = !0;
    const o = An() === "development";
    if (o && (console.log("[v0][Sentry] Background service worker monitoring initialized with isolated client"), console.log("[v0][Sentry] Environment:", t.environment), console.log("[v0][Sentry] Release:", t.release), console.log("[v0][Sentry] DSN:", sa), console.log("[v0][Sentry] sendDefaultPii:", t.sendDefaultPii), console.log("[v0][Sentry] Client initialized:", !!r)), o && !uo)
      try {
        (async () => {
          try {
            let c = !1;
            typeof chrome < "u" && chrome.storage?.session && (c = (await chrome.storage.session.get("sentry_test_message_sent")).sentry_test_message_sent === !0), c || (s.captureMessage("[v0][Sentry] Background worker connected successfully", "info"), console.log("[v0][Sentry] Test message sent to verify connection"), uo = !0, typeof chrome < "u" && chrome.storage?.session && chrome.storage.session.set({ sentry_test_message_sent: !0 }).catch(() => {
            }));
          } catch {
            uo || (s.captureMessage("[v0][Sentry] Background worker connected successfully", "info"), console.log("[v0][Sentry] Test message sent to verify connection"), uo = !0);
          }
        })();
      } catch (c) {
        console.warn("[v0][Sentry] Test message failed:", c);
      }
    return { client: r, scope: s };
  } catch (t) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in background worker:", t), console.warn("[v0][Sentry] Extension will continue without Sentry monitoring"), { client: null, scope: new fe() };
  }
}
aR();
function $n() {
  return Do;
}
function jn() {
  return Us;
}
const le = {
  // Capture exception using isolated scope
  captureException: (t, e) => {
    const n = jn(), r = $n();
    if (!(!n || !r))
      return $a(t, e, r, n);
  },
  // Capture message using isolated scope
  captureMessage: (t, e) => {
    const n = jn(), r = $n();
    if (!(!n || !r))
      return ft(
        r,
        n,
        (s) => s.captureMessage(t, e)
      );
  },
  // Logger methods using isolated scope
  logger: {
    info: (t, e) => {
      const n = jn(), r = $n();
      !n || !r || ht("info", t, e, r, n);
    },
    warn: (t, e) => {
      const n = jn(), r = $n();
      !n || !r || ht("warning", t, e, r, n);
    },
    error: (t, e) => {
      const n = jn(), r = $n();
      !n || !r || ht("error", t, e, r, n);
    }
  },
  // Start span using isolated scope
  startSpan: (t, e) => {
    const n = jn(), r = $n();
    return !n || !r ? e(Rn()) : ft(
      r,
      n,
      () => pi(t, e),
      () => e(Rn())
    );
  },
  // Get client (for advanced usage)
  getClient: () => $n(),
  // Get scope (for advanced usage)
  getScope: () => jn()
}, Yg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: le,
  get scope() {
    return Us;
  }
}, Symbol.toStringTag, { value: "Module" })), N = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, Ge = {
  POMODORO: "pomodoroAlarm",
  USAGE_TRACKER: "usageTrackerAlarm",
  DAILY_SYNC: "dailySyncAlarm",
  ANALYTICS_SYNC: "analyticsSyncAlarm"
}, Ct = {
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
}, nn = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: !1
}, cR = 0.5, Au = 0.5, ar = {
  DAILY_SUMMARY_PREFIX: "__dailySummary",
  // armazenamos por dia: `${prefix}-${YYYY-MM-DD}`
  PENDING_QUEUE: "__pendingDailySummaryQueue",
  SYNCED_DATES: "__dailySummarySyncedDates"
}, uR = 10, ve = {
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
  TOGGLE_ZEN_MODE: "TOGGLE_ZEN_MODE",
  ANALYTICS_CONTENT_AGGREGATE: "ANALYTICS_CONTENT_AGGREGATE",
  ANALYTICS_AUTH_CHANGED: "ANALYTICS_AUTH_CHANGED"
};
function Si(t) {
  if (!t) return "";
  const e = t.trim();
  try {
    return new URL(e.startsWith("http") ? e : `https://${e}`).hostname.replace(/^www\./, "");
  } catch {
    return e.split("/")[0].replace(/^www\./, "");
  }
}
function ja(t) {
  if (!t) return "";
  try {
    const n = new URL(t.startsWith("http") ? t : `https://${t}`).hostname.replace(/^www\./, ""), r = n.split("."), s = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const i of s)
      if (n.endsWith(`.${i}`))
        return n.split(".").slice(-3).join(".");
    return r.slice(-2).join(".");
  } catch {
    const e = t.replace(/^www\./, "").split("/")[0], n = e.split("."), r = ["co.uk", "co.jp", "com.br", "com.au", "co.nz"];
    for (const s of r)
      if (e.endsWith(`.${s}`))
        return e.split(".").slice(-3).join(".");
    return n.slice(-2).join(".");
  }
}
function Rl(t) {
  return `||${t}`;
}
async function Jg() {
  try {
    const e = (await chrome.storage.sync.get(N.SETTINGS))[N.SETTINGS] || Ct;
    return {
      debugDNR: e.debugDNR ?? Ct.debugDNR ?? !1,
      debugTracking: e.debugTracking ?? Ct.debugTracking ?? !1,
      debugContentAnalysis: e.debugContentAnalysis ?? Ct.debugContentAnalysis ?? !1,
      debugPomodoro: e.debugPomodoro ?? Ct.debugPomodoro ?? !1,
      debugZenMode: e.debugZenMode ?? Ct.debugZenMode ?? !1
    };
  } catch (t) {
    return console.warn("[v0] Failed to read debug config from storage, using defaults:", t), {
      debugDNR: !1,
      debugTracking: !1,
      debugContentAnalysis: !1,
      debugPomodoro: !1,
      debugZenMode: !1
    };
  }
}
async function Xg() {
  return (await Jg()).debugDNR;
}
let Ru = null;
function lR() {
  return Ru === null ? {
    debugDNR: !1,
    debugTracking: !1,
    debugContentAnalysis: !1,
    debugPomodoro: !1,
    debugZenMode: !1
  } : Ru;
}
async function Qg() {
  Ru = await Jg();
}
function Kn() {
  return lR().debugTracking;
}
let Cu = !1, Mf = !1;
const Pu = /* @__PURE__ */ new Set();
async function dR() {
  if (!Mf) {
    Mf = !0;
    try {
      await fR(!0);
    } catch (t) {
      console.warn("[v0][Analytics] Failed to load initial consent:", t);
    }
    chrome.storage.onChanged.addListener((t, e) => {
      if (e !== "sync" || !t[N.SETTINGS]) return;
      const n = Zg(t[N.SETTINGS].newValue);
      Du(n);
    });
  }
}
function Ha() {
  return Cu;
}
function hR(t) {
  return Pu.add(t), () => Pu.delete(t);
}
async function fR(t = !1) {
  try {
    const { [N.SETTINGS]: e } = await chrome.storage.sync.get(N.SETTINGS);
    Du(Zg(e), t);
  } catch (e) {
    console.warn("[v0][Analytics] Failed to refresh consent from storage:", e), Du(!1, t);
  }
}
function Zg(t) {
  return t ? !!(t.analyticsConsent ?? t.telemetry ?? t.syncWithCloud) : !1;
}
function Du(t, e = !1) {
  const n = Cu !== t;
  Cu = t, !e && n && Pu.forEach((r) => {
    try {
      r(t);
    } catch (s) {
      console.warn("[v0][Analytics] consent listener failed:", s);
    }
  });
}
const Ti = () => (/* @__PURE__ */ new Date()).toISOString();
let Gc = null, Lf = null;
const pR = 200;
function e_(t = /* @__PURE__ */ new Date()) {
  return t.toISOString().slice(0, 10);
}
function Cl(t) {
  return `${ar.DAILY_SUMMARY_PREFIX}-${t}`;
}
function mR(t) {
  const e = Ti();
  return {
    date: t,
    totalMinutes: 0,
    totalActiveMinutes: 0,
    totalUniqueSitesVisited: 0,
    firstActivityAt: e,
    lastActivityAt: e,
    perDomain: {},
    pomodoro: {
      focusMinutes: 0,
      cyclesCompleted: 0,
      breaks: 0,
      longBreaks: 0,
      interruptions: 0
    },
    toggles: {},
    featureUsage: {},
    searchInsights: {
      topQueries: {},
      categorizedQueries: {},
      lastSearchedAt: void 0
    },
    contentInsights: {
      topDomainsConsumed: {},
      categorizedContent: {},
      topContentKeywords: {},
      lastConsumedAt: void 0
    },
    browserInfo: void 0,
    lastUpdateLocal: e
  };
}
async function Ga(t) {
  t.lastUpdateLocal = Ti();
  const e = Cl(t.date);
  await chrome.storage.local.set({ [e]: t });
}
async function qa(t = e_()) {
  if (Gc && Lf === t)
    return Gc;
  const e = Cl(t), n = await chrome.storage.local.get(e), r = n?.[e] ?? mR(t);
  return Gc = r, Lf = t, n?.[e] || await Ga(r), r;
}
function Fs(t, e, n = 1, r = uR) {
  if (!e) return;
  t[e] = (t[e] || 0) + n;
  const s = Object.entries(t).sort(([, o], [, c]) => c - o);
  s.length > r && (s.length = r);
  const i = Object.fromEntries(s);
  Object.keys(t).forEach((o) => {
    o in i || delete t[o];
  }), Object.assign(t, i);
}
function gR(t, e) {
  const n = Object.entries(t);
  if (n.length <= e)
    return;
  n.sort(([, s], [, i]) => (i?.minutes ?? 0) - (s?.minutes ?? 0));
  const r = new Set(n.slice(0, e).map(([s]) => s));
  Object.keys(t).forEach((s) => {
    r.has(s) || delete t[s];
  });
}
function t_(t, e, n) {
  if (!e || n <= 0) return;
  const r = n / 60, s = Ti(), i = t.perDomain[e] || {
    minutes: 0,
    visits: 0
  };
  i.minutes += r, i.visits += 1, i.firstVisit ?? (i.firstVisit = s), i.lastVisit = s, t.perDomain[e] = i, gR(t.perDomain, pR), t.totalUniqueSitesVisited = Object.keys(t.perDomain).length, t.totalActiveMinutes = Object.values(t.perDomain).reduce(
    (o, c) => o + (c?.minutes ?? 0),
    0
  ), t.totalMinutes = Math.max(t.totalMinutes, t.totalActiveMinutes), t.firstActivityAt ?? (t.firstActivityAt = s), t.lastActivityAt = s;
}
async function _R(t, e) {
  if (!Ha()) return;
  const n = await qa();
  t_(n, t, e), await Ga(n);
}
async function yR(t, e, n) {
  if (!Ha()) return;
  const r = await qa(), s = Ti();
  t.forEach((i) => Fs(r.searchInsights.topQueries, i)), e.forEach(
    (i) => Fs(r.searchInsights.categorizedQueries, i)
  ), r.searchInsights.lastSearchedAt = s, await Ga(r);
}
async function ER(t) {
  if (!Ha()) return;
  const e = await qa(), n = Ti(), r = t.domain;
  r && Fs(e.contentInsights.topDomainsConsumed, r), (t.categories || []).forEach(
    (s) => Fs(e.contentInsights.categorizedContent, s)
  ), (t.keywords || []).forEach(
    (s) => Fs(e.contentInsights.topContentKeywords, s)
  ), typeof t.estimatedTimeSpent == "number" && r && t_(e, r, t.estimatedTimeSpent), e.contentInsights.lastConsumedAt = n, await Ga(e);
}
async function vR() {
  const t = await qa();
  return JSON.parse(JSON.stringify(t));
}
async function SR(t) {
  const e = Cl(t);
  return (await chrome.storage.local.get(e))?.[e] ?? null;
}
function n_() {
  return e_();
}
const TR = /* @__PURE__ */ new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "um",
  "uma",
  "no",
  "na",
  "em",
  "para",
  "por",
  "com",
  "que",
  "os",
  "as",
  "se",
  "ao",
  "como",
  "mais",
  "mas",
  "sobre",
  "the",
  "and",
  "for",
  "you",
  "your",
  "from",
  "this",
  "that",
  "are",
  "was"
]), IR = {
  programacao: [
    "javascript",
    "typescript",
    "python",
    "react",
    "firebase",
    "node",
    "backend",
    "frontend",
    "api",
    "coding",
    "development",
    "software",
    "web",
    "debug",
    "algoritmo",
    "deploy"
  ],
  design: ["ui", "ux", "figma", "design", "prototype", "interface"],
  produtividade: ["pomodoro", "foco", "productivity", "habits", "planner", "task"],
  tecnologia: ["cloud", "ai", "ml", "hardware", "android", "ios", "devops"],
  noticias: ["news", "breaking", "politica", "eleicao", "journal", "headline"],
  culinaria: ["receita", "cozinha", "ingredientes", "culinaria", "chefe", "restaurante"]
};
function wR(t) {
  return t ? (t.toLowerCase().match(/\b[\p{L}\p{N}]{3,}\b/gu) || []).filter(
    (e) => !TR.has(e)
  ) : [];
}
function bR(t) {
  return t.reduce((e, n) => (e[n] = (e[n] || 0) + 1, e), {});
}
function AR(t, e = 10) {
  const n = wR(t), r = bR(n), s = Object.entries(r).sort(([, o], [, c]) => c - o).slice(0, e).map(([o]) => o), i = RR(s);
  return {
    keywords: s,
    keywordFrequencies: r,
    categories: i
  };
}
function RR(t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    for (const [r, s] of Object.entries(IR))
      s.includes(n) && e.add(r);
  return [...e];
}
const CR = [
  { hostIncludes: "google.", param: "q", pathIncludes: "/search" },
  { hostIncludes: "bing.com", param: "q", pathIncludes: "/search" },
  { hostIncludes: "duckduckgo.com", param: "q" },
  { hostIncludes: "startpage.com", param: "query" }
], PR = 500, wr = /* @__PURE__ */ new Set();
let xf = null;
function DR(t) {
  try {
    const e = new URL(t), n = CR.find((s) => e.hostname.includes(s.hostIncludes) && (!s.pathIncludes || e.pathname.includes(s.pathIncludes)));
    if (!n) return null;
    const r = e.searchParams.get(n.param);
    return r ? r.trim() : null;
  } catch {
    return null;
  }
}
function kR(t) {
  if (!t) return !1;
  const e = n_();
  xf !== e && (wr.clear(), xf = e);
  const n = `${e}:${t.toLowerCase()}`;
  if (wr.has(n))
    return !1;
  if (wr.size >= PR) {
    const r = wr.values().next().value;
    r && wr.delete(r);
  }
  return wr.add(n), !0;
}
async function NR(t) {
  const e = DR(t);
  if (!e || !kR(e))
    return;
  const n = AR(e, 5), r = [e.toLowerCase(), ...n.keywords];
  await yR(r, n.categories);
}
let Pl = null, Vf = !1, Uf = !1;
const OR = 3e3, MR = 1e3;
function Dl(t) {
  let e = 0;
  for (let r = 0; r < t.length; r++) {
    const s = t.charCodeAt(r);
    e = (e << 5) - e + s, e |= 0;
  }
  const n = Math.abs(e) % MR;
  return OR + n;
}
async function LR() {
  if (Uf) return;
  Uf = !0, console.log("[v0] Initializing daily sync for session rules..."), await chrome.alarms.clear(Ge.DAILY_SYNC);
  const t = /* @__PURE__ */ new Date(), e = new Date(t);
  e.setHours(24, 0, 0, 0);
  const n = e.getTime() - t.getTime(), r = Date.now() + Math.max(n, 6e4);
  await chrome.alarms.create(Ge.DAILY_SYNC, {
    when: r,
    periodInMinutes: 24 * 60
  }), console.log(
    `[v0] Daily sync scheduled in ${(r - Date.now()) / 6e4 >> 0} minutes, then every 24h.`
  ), chrome.alarms.onAlarm.addListener(async (s) => {
    s.name === Ge.DAILY_SYNC && (console.log("[v0] Daily sync triggered: clearing time limit session rules."), await xR());
  });
}
async function xR() {
  const { [N.TIME_LIMITS]: t = [] } = await chrome.storage.local.get(
    N.TIME_LIMITS
  );
  if (!Array.isArray(t) || t.length === 0) return;
  const e = t.map((n) => Dl(n.domain));
  if (e.length)
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: e }), console.log(`[v0] Cleared ${e.length} time limit session rules.`);
    } catch (n) {
      console.error("[v0] Error clearing time limit session rules:", n);
    }
}
async function VR() {
  Vf || (Vf = !0, console.log("[v0] Initializing usage tracker module"), await Qg(), await chrome.alarms.clear(Ge.USAGE_TRACKER), await chrome.alarms.create(Ge.USAGE_TRACKER, {
    periodInMinutes: Au
  }), chrome.alarms.onAlarm.addListener(async (t) => {
    t.name === Ge.USAGE_TRACKER && await za();
  }), chrome.tabs.onActivated.addListener(UR), chrome.tabs.onUpdated.addListener(FR), chrome.windows.onFocusChanged.addListener(BR), await r_());
}
async function UR(t) {
  await za();
  try {
    const e = await chrome.tabs.get(t.tabId);
    await kl(e.id, e.url);
  } catch (e) {
    console.warn(`[v0] Could not get tab info for tabId: ${t.tabId}`, e), await Ii();
  }
}
async function FR(t, e) {
  t === Pl && e.url && e.status === "complete" && (await za(), await kl(t, e.url));
}
async function BR(t) {
  t === chrome.windows.WINDOW_ID_NONE ? (await za(), await Ii()) : await r_();
}
async function r_() {
  const [t] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
  t?.id && t.url ? await kl(t.id, t.url) : await Ii();
}
async function kl(t, e) {
  if (!t || !e || e.startsWith("chrome://") || e.startsWith("chrome-extension://") || e.startsWith("about:")) {
    await Ii();
    return;
  }
  Pl = t;
  const n = Date.now(), r = {
    url: e,
    startTime: n,
    lastUpdate: n
    // Track last update for gap detection
  };
  await chrome.storage.session.set({ [N.CURRENTLY_TRACKING]: r });
}
async function Ii() {
  Pl = null, await chrome.storage.session.remove(N.CURRENTLY_TRACKING);
}
async function za() {
  const e = (await chrome.storage.session.get(N.CURRENTLY_TRACKING))[N.CURRENTLY_TRACKING];
  if (!e || !e.url || !e.startTime) {
    Kn() && console.log("[TRACKING-DEBUG] No active tracking info:", { trackingInfo: e });
    return;
  }
  const n = ja(e.url);
  if (!n) {
    Kn() && console.log("[TRACKING-DEBUG] Invalid domain from URL:", { url: e.url }), await Ii();
    return;
  }
  const r = Date.now(), s = Math.floor((r - e.startTime) / 1e3), i = e.lastUpdate || e.startTime, o = r - i, c = Au * 60 * 1e3 * 2;
  if (o > c && (Kn() && console.log("[TRACKING-DEBUG] Detected tracking gap:", {
    gapMs: Math.floor(o / 1e3),
    maxGapMs: Math.floor(c / 1e3),
    domain: n,
    url: e.url
  }), e.startTime = r - Au * 60 * 1e3), Kn() && console.log("[TRACKING-DEBUG] Recording usage:", {
    domain: n,
    timeSpent: s,
    url: e.url,
    startTime: new Date(e.startTime).toISOString(),
    endTime: (/* @__PURE__ */ new Date()).toISOString(),
    gapDetected: o > c
  }), e.startTime = r, e.lastUpdate = r, await chrome.storage.session.set({ [N.CURRENTLY_TRACKING]: e }), s < 1) {
    Kn() && console.log("[TRACKING-DEBUG] Skipping record, time spent < 1s");
    return;
  }
  const u = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [N.DAILY_USAGE]: d = {} } = await chrome.storage.local.get(
    N.DAILY_USAGE
  ), f = {
    ...d,
    [u]: d[u] || {
      date: u,
      totalMinutes: 0,
      perDomain: {}
    }
  };
  f[u].perDomain || (f[u].perDomain = {}), f[u].perDomain[n] = (f[u].perDomain[n] || 0) + s, f[u].totalMinutes = Object.values(f[u].perDomain).reduce((p, _) => p + (typeof _ == "number" ? _ : 0), 0) / 60, await chrome.storage.local.set({ [N.DAILY_USAGE]: f }), console.log("[v0] Recorded usage:", n, s, "seconds");
  try {
    await _R(n, s);
  } catch (p) {
    console.warn("[v0] Analytics daily summary update failed:", p);
  }
  try {
    await NR(e.url);
  } catch (p) {
    console.warn("[v0] Search insight enrichment failed:", p);
  }
  await Ce(), await s_(n, f[u].perDomain[n]);
}
async function s_(t, e) {
  const { [N.TIME_LIMITS]: n = [] } = await chrome.storage.local.get(
    N.TIME_LIMITS
  ), s = (Array.isArray(n) ? n : []).find((c) => c.domain === t);
  if (!s) return;
  const i = s.dailyMinutes ?? s.limitMinutes ?? 0, o = i * 60;
  if (e >= o) {
    const c = Dl(t);
    try {
      Kn() && console.log("[TRACKING-DEBUG] Time limit check:", {
        domain: t,
        totalSecondsToday: e,
        limitSeconds: o,
        limitMinutes: i,
        exceeded: e >= o
      });
      const u = Rl(t), d = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(t)}`);
      console.log("[v0] Time limit rule debug:", {
        domain: t,
        urlFilter: u,
        blockedPageUrl: d,
        ruleId: c,
        totalSecondsToday: e,
        limitSeconds: o,
        redirectUrl: d
      });
      try {
        const w = new URL(d);
        console.log("[v0] Blocked page URL validation:", {
          isValid: !0,
          protocol: w.protocol,
          hostname: w.hostname,
          pathname: w.pathname,
          search: w.search
        });
      } catch (w) {
        console.error("[v0] Invalid blocked page URL:", d, w);
      }
      const f = {
        id: c,
        priority: 10,
        // Increased from 3 to 10 to ensure it overrides other rules
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: d
          }
        },
        condition: {
          urlFilter: u,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }, p = await Xg();
      p && console.log("[DNR-DEBUG] Time limit session rule to add:", {
        id: f.id,
        urlFilter: f.condition.urlFilter,
        domain: t,
        totalSecondsToday: e,
        limitSeconds: o
      }), await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [c],
        // remove se já existir
        addRules: [f]
      });
      try {
        const w = await chrome.tabs.query({ active: !0, currentWindow: !0 });
        w.length > 0 && w[0].id && w[0].url && ja(w[0].url) === t && (await chrome.tabs.update(w[0].id, { url: d }), console.log(`[v0] Redirected active tab ${w[0].id} to blocked page for ${t}`), Kn() && console.log("[TRACKING-DEBUG] Active tab redirect:", {
          tabId: w[0].id,
          fromUrl: w[0].url,
          toUrl: d,
          domain: t
        }));
      } catch (w) {
        console.warn(`[v0] Could not redirect active tab for ${t}:`, w);
      }
      const _ = await chrome.declarativeNetRequest.getSessionRules();
      console.log("[v0] Session rules after time limit rule creation:", {
        totalRules: _.length,
        timeLimitRule: _.find((w) => w.id === c),
        allRuleIds: _.map((w) => w.id)
      }), p && (console.log("[DNR-DEBUG] All session rules after time limit:", _), console.log("[DNR-DEBUG] Session rules by domain:", _.map((w) => ({
        id: w.id,
        urlFilter: w.condition.urlFilter || w.condition.regexFilter,
        priority: w.priority
      })))), console.log(
        `[v0] Time limit reached for ${t}. Session block rule ${c} added.`
      );
      const { createNotification: T } = await Promise.resolve().then(() => Wa);
      await T({
        notificationId: `limit-exceeded-${t}`,
        type: "basic",
        title: "Limite de Tempo Atingido",
        message: `Você atingiu o limite de ${i} minutos em ${t} hoje.`
      });
    } catch (u) {
      console.error(`[v0] Error updating session rule for time limit on ${t}:`, u);
    }
  }
}
async function $R(t, e) {
  const n = Si(t);
  if (!n) return;
  const { [N.TIME_LIMITS]: r = [] } = await chrome.storage.local.get(
    N.TIME_LIMITS
  ), s = Array.isArray(r) ? r : [], i = s.findIndex((c) => c.domain === n), o = Dl(n);
  if (e > 0) {
    if (i >= 0)
      s[i].dailyMinutes = e;
    else {
      const f = (p) => p;
      s.push({ domain: f(n), dailyMinutes: e });
    }
    const c = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], { [N.DAILY_USAGE]: u = {} } = await chrome.storage.local.get(
      N.DAILY_USAGE
    ), d = u?.[c]?.perDomain?.[n] || 0;
    if (d >= e * 60)
      await s_(n, d);
    else
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [o] });
      } catch {
      }
  } else if (i >= 0) {
    s.splice(i, 1);
    try {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [o] });
    } catch {
    }
    console.log(`[v0] Time limit removed for: ${n}`);
  }
  await chrome.storage.local.set({ [N.TIME_LIMITS]: s }), await Ce(), console.log("[v0] Time limit set/updated:", n, e, "minutes");
}
const Nr = "__contentSuggestNotified__", jR = 24 * 60 * 60 * 1e3;
async function i_() {
  try {
    const { [N.SETTINGS]: t } = await chrome.storage.sync.get(N.SETTINGS);
    return (t?.contentAnalysisSuppressionMinutes || 24 * 60) * 60 * 1e3;
  } catch {
    return jR;
  }
}
async function HR() {
  console.log("[v0] Initializing content analyzer module");
  try {
    const { [Nr]: t = {} } = await chrome.storage.session.get(Nr), e = Date.now(), n = await i_();
    let r = !1;
    for (const s of Object.keys(t || {}))
      (typeof t[s] != "number" || e - t[s] > n) && (delete t[s], r = !0);
    r && await chrome.storage.session.set({ [Nr]: t });
  } catch (t) {
    console.warn("[v0] Unable to prune notify cache:", t);
  }
}
async function GR(t) {
  try {
    const e = await i_(), { [Nr]: n = {} } = await chrome.storage.session.get(Nr), r = n?.[t], s = Date.now();
    return r && s - r < e ? !1 : (await chrome.storage.session.set({
      [Nr]: { ...n || {}, [t]: s }
    }), !0);
  } catch {
    return !0;
  }
}
async function qR(t) {
  try {
    if (console.log("[v0] Content analysis result:", t), !await JR() || !(t.classification === "distracting" && t.score > cR) || !t?.url) return;
    const e = ja(t.url);
    if (!e) return;
    const { [N.BLACKLIST]: n = [] } = await chrome.storage.local.get(
      N.BLACKLIST
    );
    if (n.some((i) => i.domain === e) || !await GR(e))
      return;
    const { createNotification: s } = await Promise.resolve().then(() => Wa);
    await s({
      notificationId: `suggest-block-${e}`,
      type: "basic",
      title: "Site Potencialmente Distrativo",
      message: `${e} parece ser distrativo. Deseja adicioná-lo à sua lista de bloqueio?`,
      buttons: [{ title: "Sim, bloquear" }, { title: "Não, obrigado" }]
      // Você pode manter a notificação até interação do usuário, se quiser:
      // requireInteraction: true,
      // priority: 0,
    });
  } catch (e) {
    console.error("[v0] Error while handling content analysis result:", e);
  }
}
let Ff = "";
const Bf = 120, zR = 20;
function WR(t) {
  return typeof t == "string" ? t.length > Bf ? `${t.slice(0, Bf)}…` : t : typeof t == "number" || typeof t == "boolean" ? t : t == null ? "null" : `[${typeof t}]`;
}
function KR(t) {
  if (!t)
    return "unknown";
  try {
    return new URL(t).hostname || "unknown";
  } catch {
    return "invalid";
  }
}
function $f(t, e = zR) {
  if (!Array.isArray(t))
    return;
  const n = t.filter((r) => typeof r == "string").map((r) => r.trim()).filter(Boolean).slice(0, e);
  return n.length ? n : void 0;
}
function YR(t) {
  if (!t || typeof t != "object")
    return null;
  const e = t;
  if (typeof e.url != "string" || e.url.length > 2048)
    return null;
  const n = (s, i = 500) => {
    if (typeof s != "string")
      return;
    const o = s.trim();
    if (o)
      return o.length > i ? `${o.slice(0, i)}…` : o;
  }, r = {
    url: e.url,
    title: n(e.title),
    description: n(e.description),
    keywords: $f(e.keywords),
    categories: $f(e.categories),
    estimatedTimeSpent: typeof e.estimatedTimeSpent == "number" && Number.isFinite(e.estimatedTimeSpent) ? Math.max(0, e.estimatedTimeSpent) : void 0,
    source: typeof e.source == "string" ? e.source : void 0,
    domain: typeof e.domain == "string" ? e.domain : void 0
  };
  return r.domain || (r.domain = ja(e.url)), r;
}
async function Ce() {
  try {
    const t = await Nl(), e = JSON.stringify(t, (n, r) => {
      if (r && typeof r == "object" && !Array.isArray(r)) {
        const s = {};
        return Object.keys(r).sort().forEach((i) => {
          s[i] = r[i];
        }), s;
      }
      return r;
    });
    if (e === Ff)
      return;
    Ff = e, chrome.runtime.sendMessage({ type: ve.STATE_UPDATED, payload: { state: t } }, (n) => {
      const r = chrome.runtime.lastError, s = r?.message ?? "", o = [
        "Receiving end does not exist",
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ].some((c) => s === c || s.startsWith(c));
      r && !o && console.warn("[v0] notifyStateUpdate lastError:", r.message);
    });
    try {
      for (const n of ko)
        try {
          n.postMessage({ type: ve.STATE_UPDATED, payload: { state: t } });
        } catch (r) {
          console.warn("[v0] Failed to post state to port:", r);
        }
    } catch {
    }
  } catch (t) {
    console.error("[v0] Error notifying state update:", t);
  }
}
async function JR() {
  const { getNotificationSetting: t } = await Promise.resolve().then(() => Wa);
  return await t();
}
async function Nl() {
  const t = [
    N.BLACKLIST,
    N.TIME_LIMITS,
    N.DAILY_USAGE,
    N.POMODORO_STATUS,
    N.SITE_CUSTOMIZATIONS
  ], [e, n] = await Promise.all([
    chrome.storage.local.get(t),
    chrome.storage.sync.get(N.SETTINGS)
  ]);
  return {
    isLoading: !1,
    error: null,
    blacklist: (e[N.BLACKLIST] || []).map((r) => typeof r == "string" ? r : typeof r == "object" && r !== null && "domain" in r ? String(r.domain) : String(r)),
    timeLimits: e[N.TIME_LIMITS] || [],
    dailyUsage: e[N.DAILY_USAGE] || {},
    pomodoro: e[N.POMODORO_STATUS] || {
      config: nn,
      state: {
        phase: "idle",
        isPaused: !1,
        cycleIndex: 0,
        remainingMs: 0
      }
    },
    siteCustomizations: e[N.SITE_CUSTOMIZATIONS] || {},
    settings: n[N.SETTINGS] || Ct
  };
}
const ko = /* @__PURE__ */ new Set();
chrome.runtime?.onConnect?.addListener && chrome.runtime.onConnect.addListener((t) => {
  try {
    ko.add(t), Nl().then((e) => {
      try {
        t.postMessage({ type: ve.STATE_UPDATED, payload: { state: e } });
      } catch {
      }
    }).catch(() => {
    }), t.onDisconnect.addListener(() => {
      ko.delete(t);
    });
  } catch {
    try {
      ko.delete(t);
    } catch {
    }
  }
});
async function XR(t, e) {
  return le.startSpan(
    {
      op: "message.handle",
      name: `Handle Message: ${t.type}`
    },
    async (n) => {
      const r = (s, i) => {
        n && typeof n.setAttribute == "function" && n.setAttribute(s, WR(i));
      };
      try {
        r("message_type", t.type), r("has_payload", !!t.payload), r("sender_id", e.id || "unknown"), r("sender_url_host", KR(e.url));
        let s;
        switch (t.type) {
          case ve.GET_INITIAL_STATE: {
            s = await Nl();
            break;
          }
          case ve.ADD_TO_BLACKLIST: {
            const i = t.payload?.domain;
            typeof i == "string" && (await Ll(i), r("domain", i)), await Ce(), s = { success: !0 };
            break;
          }
          case ve.REMOVE_FROM_BLACKLIST: {
            const i = t.payload?.domain;
            typeof i == "string" && await c_(i), await Ce(), s = { success: !0 };
            break;
          }
          case ve.POMODORO_START: {
            const i = t.payload;
            console.log("[v0] DEBUG: POMODORO_START - full payload:", JSON.stringify(i)), console.log("[v0] DEBUG: POMODORO_START - payload.config:", JSON.stringify(i?.config));
            const o = i?.config || i;
            console.log("[v0] DEBUG: POMODORO_START - extracted config:", JSON.stringify(o)), await t0(o), s = { success: !0 };
            break;
          }
          case ve.POMODORO_STOP: {
            await f_(), s = { success: !0 };
            break;
          }
          case ve.POMODORO_PAUSE: {
            await n0(), s = { success: !0 };
            break;
          }
          case ve.POMODORO_RESUME: {
            await r0(), s = { success: !0 };
            break;
          }
          case ve.START_BREAK: {
            await p_(), s = { success: !0 };
            break;
          }
          case ve.TIME_LIMIT_SET: {
            const i = t.payload, o = i?.domain, c = i?.dailyMinutes ?? i?.limitMinutes;
            typeof o == "string" && typeof c == "number" && await $R(o, c), await Ce(), s = { success: !0 };
            break;
          }
          case ve.CONTENT_ANALYSIS_RESULT: {
            await qR(t.payload?.result), await Ce(), s = { success: !0 };
            break;
          }
          case ve.ANALYTICS_CONTENT_AGGREGATE: {
            const i = YR(t.payload);
            if (!i) {
              s = { success: !1, error: "Invalid content aggregate payload" };
              break;
            }
            await ER(i), s = { success: !0 };
            break;
          }
          case ve.ANALYTICS_AUTH_CHANGED: {
            s = { success: !0 };
            break;
          }
          case ve.STATE_PATCH: {
            const i = t.payload ?? {}, o = i.patch?.settings ?? i.settings ?? i;
            if (!o || typeof o != "object") {
              s = { success: !1, error: "Invalid STATE_PATCH payload" };
              break;
            }
            const { [N.SETTINGS]: c } = await chrome.storage.sync.get(N.SETTINGS), u = { ...c ?? {}, ...o ?? {} }, d = JSON.stringify(c ?? {}), f = JSON.stringify(u);
            if (d === f) {
              s = { success: !0 };
              break;
            }
            await chrome.storage.sync.set({ [N.SETTINGS]: u }), await Ce(), s = { success: !0 };
            break;
          }
          case ve.SITE_CUSTOMIZATION_UPDATED: {
            const { [N.SITE_CUSTOMIZATIONS]: i } = await chrome.storage.local.get(N.SITE_CUSTOMIZATIONS), o = t.payload;
            let c = { ...i ?? {} };
            o && typeof o == "object" && !Array.isArray(o) && (o.domain && o.config ? c = { ...c, [String(o.domain)]: o.config } : c = { ...c, ...o }), await chrome.storage.local.set({ [N.SITE_CUSTOMIZATIONS]: c }), await Ce(), s = { success: !0 };
            break;
          }
          case ve.TOGGLE_ZEN_MODE: {
            const [i] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
            if (i?.id)
              try {
                await chrome.tabs.sendMessage(i.id, {
                  type: ve.TOGGLE_ZEN_MODE,
                  payload: t.payload
                });
              } catch (o) {
                console.warn(
                  `[v0] Could not send TOGGLE_ZEN_MODE to tab ${i.id}. It may be a protected page or the content script wasn't injected.`,
                  o
                );
              }
            s = { success: !0 };
            break;
          }
          case ve.STATE_UPDATED: {
            console.warn(
              "[v0] Received a 'STATE_UPDATED' message from a client, which should not happen."
            ), s = { success: !1, error: "Invalid message type received." };
            break;
          }
          default: {
            const i = t.type, o = new Error(`Unknown message type: ${i}`);
            throw le.logger.error("Unknown message type received", {
              type: t.type
            }), o;
          }
        }
        return r("success", !0), s;
      } catch (s) {
        throw le.logger.error("Message handling failed", {
          type: t.type,
          error: s
        }), r("success", !1), le.captureException(s instanceof Error ? s : new Error(String(s))), s;
      }
    }
  );
}
const Ft = 1e3, Ae = 2e3, ln = 1e3, Bt = 1e4;
function Ol(t) {
  return (e, n) => {
    if (t && typeof t.setAttribute == "function") {
      const r = typeof n == "string" || typeof n == "number" || typeof n == "boolean" ? n : String(n);
      t.setAttribute(e, r);
    }
  };
}
let qc = Promise.resolve();
function Ml(t) {
  return qc = qc.then(t, t), qc;
}
function jf(t) {
  let e = 0;
  for (let r = 0; r < t.length; r++) {
    const s = t.charCodeAt(r);
    e = (e << 5) - e + s, e |= 0;
  }
  const n = Math.abs(e) % ln;
  return Ae + n;
}
async function o_() {
  return le.startSpan(
    { op: "module.init", name: "Initialize Blocker" },
    async (t) => {
      const e = Ol(t);
      try {
        console.log("[v0] Initializing blocker module"), le.logger.info("Blocker module initializing"), await Qg(), await xl(), le.logger.info("Blocker module initialized successfully"), e("success", !0);
      } catch (n) {
        throw le.logger.error("Failed to initialize blocker module", { error: n }), e("success", !1), le.captureException(n instanceof Error ? n : new Error(String(n))), n;
      }
    }
  );
}
async function a_() {
  return le.startSpan(
    { op: "dnr.cleanup", name: "Cleanup All DNR Rules" },
    async (t) => {
      const e = Ol(t);
      console.log("[v0] Cleaning up all DNR rules...");
      try {
        const n = await chrome.declarativeNetRequest.getDynamicRules();
        if (n.length > 0) {
          const s = n.map((i) => i.id);
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: s
          }), console.log(`[v0] Removed ${s.length} dynamic rules:`, s), e("dynamic_rules_removed", s.length), le.logger.info(`Removed ${s.length} dynamic DNR rules`);
        }
        const r = await chrome.declarativeNetRequest.getSessionRules();
        if (r.length > 0) {
          const s = r.map((i) => i.id);
          await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: s
          }), console.log(`[v0] Removed ${s.length} session rules:`, s), e("session_rules_removed", s.length), le.logger.info(`Removed ${s.length} session DNR rules`);
        }
        console.log("[v0] DNR cleanup complete"), e("success", !0);
      } catch (n) {
        throw console.error("[v0] Error during DNR cleanup:", n), e("success", !1), le.logger.error("DNR cleanup failed", {
          message: n instanceof Error ? n.message : String(n)
        }), le.captureException(n instanceof Error ? n : new Error(String(n))), n;
      }
    }
  );
}
async function QR() {
  console.log("=== DNR DEBUG STATUS ===");
  try {
    const t = await chrome.declarativeNetRequest.getDynamicRules(), e = await chrome.declarativeNetRequest.getSessionRules();
    if (console.log(`Dynamic rules: ${t.length}`), t.forEach((n) => {
      console.log(`  [${n.id}] priority=${n.priority} action=${n.action.type}`), console.log(`    urlFilter: ${n.condition.urlFilter || n.condition.regexFilter}`);
    }), console.log(`Session rules: ${e.length}`), e.forEach((n) => {
      console.log(`  [${n.id}] priority=${n.priority} action=${n.action.type}`), console.log(`    urlFilter: ${n.condition.urlFilter || n.condition.regexFilter}`);
    }), t.length > 0 && t[0].condition.regexFilter) {
      const n = new RegExp(t[0].condition.regexFilter), r = [
        "https://youtube.com",
        "https://youtube.com/",
        "https://www.youtube.com",
        "https://www.youtube.com/watch?v=test"
      ];
      console.log("Regex test results:"), r.forEach((s) => {
        console.log(`  ${n.test(s) ? "✅" : "❌"} ${s}`);
      });
    }
  } catch (t) {
    console.error("DNR debug failed:", t);
  }
  console.log("=== END DNR DEBUG ===");
}
async function Ll(t) {
  return le.startSpan(
    { op: "blocker.add", name: "Add to Blacklist" },
    async (e) => {
      const n = Ol(e);
      try {
        n("domain", t);
        const s = (await chrome.storage.local.get(
          N.BLACKLIST
        ))[N.BLACKLIST] ?? [], i = Si(t);
        if (!i) {
          le.logger.warn("Invalid domain for blacklist", { domain: t }), n("success", !1), n("reason", "invalid_domain");
          return;
        }
        if (n("normalized_domain", i), s.some((u) => u.domain === i)) {
          console.log("[v0] Domain already in blacklist:", i), n("success", !1), n("reason", "already_exists");
          return;
        }
        const o = (u) => u, c = [
          ...s,
          { domain: o(i), addedAt: (/* @__PURE__ */ new Date()).toISOString() }
        ];
        try {
          const u = s;
          if (u.length === c.length && u.every((f, p) => f.domain === c[p].domain && f.addedAt === c[p].addedAt)) {
            console.log("[v0] addToBlacklist: no-op, blacklist identical"), n("success", !1), n("reason", "no_change");
            return;
          }
        } catch {
        }
        await chrome.storage.local.set({ [N.BLACKLIST]: c }), await xl(), await Ce(), console.log("[v0] Added to blacklist:", i), le.logger.info("Domain added to blacklist", {
          domain: i,
          blacklist_size: c.length
        }), n("success", !0), n("blacklist_size", c.length);
      } catch (r) {
        throw le.logger.error("Failed to add domain to blacklist", { domain: t, error: r }), n("success", !1), le.captureException(r instanceof Error ? r : new Error(String(r))), r;
      }
    }
  );
}
async function c_(t) {
  const n = (await chrome.storage.local.get(
    N.BLACKLIST
  ))[N.BLACKLIST] ?? [], r = Si(t);
  if (!r) return;
  const s = n.filter((i) => i.domain !== r);
  if (s.length !== n.length) {
    try {
      if (s.length === n.length && s.every((o, c) => o.domain === n[c].domain && o.addedAt === n[c].addedAt)) {
        console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
        return;
      }
    } catch {
    }
    await chrome.storage.local.set({ [N.BLACKLIST]: s }), await xl(), await Ce(), console.log("[v0] Removed from blacklist:", r);
  }
}
async function xl() {
  console.log("[v0] DEBUG: Starting syncUserBlacklistRules...");
  const { [N.BLACKLIST]: t = [] } = await chrome.storage.local.get(
    N.BLACKLIST
  );
  return console.log("[v0] DEBUG: Blacklist from storage:", t), Ml(async () => {
    console.log("[v0] DEBUG: Getting existing DNR rules...");
    const e = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] DEBUG: Found", e.length, "existing DNR rules");
    const n = new Set(
      e.map((o) => o.id).filter(
        (o) => o >= Ae && o < Ae + ln || o >= Ae + Bt && o < Ae + Bt + ln
      )
    ), r = [], s = /* @__PURE__ */ new Set();
    for (const o of t) {
      const c = Si(o.domain);
      if (!c) continue;
      let u = jf(c), d = 0;
      const f = ln;
      for (; s.has(u) || n.has(u); ) {
        if (d++, d >= f) {
          console.error(
            `[v0] Rule ID range exhausted for domain: ${c}. Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
          );
          break;
        }
        u++, u >= Ae + ln && (u = Ae);
      }
      if (d >= f) {
        console.warn(`[v0] Skipping rule for ${c} - no free ID found`);
        continue;
      }
      if (s.add(u), !n.has(u)) {
        const p = Rl(c);
        console.log("[v0] [DEBUG] Valid urlFilter for", c, ":", p);
        const _ = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(c)}`);
        r.push({
          id: u,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
            redirect: {
              url: _
            }
          },
          condition: {
            urlFilter: p,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
          }
        });
        const T = u + Bt;
        n.has(T) || r.push({
          id: T,
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
            urlFilter: p,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME
            ]
          }
        });
      }
    }
    const i = Array.from(n).filter(
      (o) => !s.has(o) && !s.has(o - Bt)
    );
    if (console.log("[v0] DEBUG: Rules to add:", r.length), console.log("[v0] DEBUG: Rules to remove:", i.length), r.length > 0 || i.length > 0) {
      const o = await Xg();
      o && (console.log("[DNR-DEBUG] Blacklist domains:", t.map((f) => f.domain)), console.log("[DNR-DEBUG] Rules to add (with regex):", r.map((f) => ({
        id: f.id,
        regex: f.condition.regexFilter,
        domain: t.find((p) => jf(p.domain) === f.id)?.domain
      }))), console.log("[DNR-DEBUG] Rules to remove IDs:", i)), console.log("[v0] DEBUG: Updating DNR rules...");
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: i,
          addRules: r
        }), console.log("[v0] DEBUG: DNR rules successfully applied");
        const f = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[v0] DEBUG: Current DNR rules count:", f.length), console.log("[v0] DEBUG: Current DNR rules:", f);
      } catch (f) {
        throw console.error("[v0] ERROR: DNR updateDynamicRules FAILED:", f), console.error("[v0] ERROR: Failed rules:", r), console.error("[v0] ERROR: Attempted to remove:", i), f;
      }
      const c = await chrome.declarativeNetRequest.getDynamicRules(), u = c.filter((f) => f.id >= Ae && f.id < Ae + ln), d = c.filter((f) => f.id >= Ft && f.id < Ae);
      if (console.log(`[v0] DNR Verification: ${u.length} blacklist rules, ${d.length} pomodoro rules`), r.length > 0 && u.length === 0 && console.error("[v0] CRITICAL: Rules were added but not found in DNR!"), o) {
        const f = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", f), console.log("[DNR-DEBUG] Total rules count:", f.length), console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: f.filter((p) => p.id >= Ft && p.id < Ae).length,
          blacklist: f.filter((p) => p.id >= Ae && p.id < Ae + ln).length,
          other: f.filter((p) => p.id < Ft || p.id >= Ae + ln).length
        });
      }
      console.log(
        "[v0] User blocking rules synced:",
        r.length,
        "rules added,",
        i.length,
        "rules removed."
      );
    } else
      console.log("[v0] User blocking rules already in sync.");
  });
}
async function Vl() {
  const { [N.BLACKLIST]: t = [] } = await chrome.storage.local.get(
    N.BLACKLIST
  );
  if (!Array.isArray(t) || t.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }
  const e = [];
  return t.forEach((n, r) => {
    const s = Si(n.domain), i = Rl(s), o = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(s)}`);
    e.push({
      id: Ft + r,
      priority: 2,
      // acima das regras de usuário
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: o
        }
      },
      condition: {
        urlFilter: i,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
      }
    }), e.push({
      id: Ft + r + Bt,
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
        urlFilter: i,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME
        ]
      }
    });
  }), Ml(async () => {
    const r = (await chrome.declarativeNetRequest.getDynamicRules()).map((i) => i.id).filter(
      (i) => i >= Ft && i < Ae || i >= Ft + Bt && i < Ae + Bt
    );
    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(e, null, 2));
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: r,
        addRules: e
      }), console.log("[v0] DEBUG: Pomodoro DNR rules successfully applied");
    } catch (i) {
      throw console.error("[v0] ERROR: Pomodoro DNR updateDynamicRules FAILED:", i), console.error("[v0] ERROR: Failed Pomodoro rules:", e), console.error("[v0] ERROR: Attempted to remove Pomodoro rules:", r), i;
    }
    const s = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(s, null, 2)), console.log(
      "[v0] Enabling Pomodoro blocking for",
      t.length,
      "sites."
    );
  });
}
async function Ul() {
  return Ml(async () => {
    const e = (await chrome.declarativeNetRequest.getDynamicRules()).map((n) => n.id).filter(
      (n) => n >= Ft && n < Ae || n >= Ft + Bt && n < Ae + Bt
    );
    if (e.length > 0)
      try {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: e
        }), console.log(
          "[v0] Pomodoro blocking disabled. Removed",
          e.length,
          "rules."
        );
      } catch (n) {
        throw console.error("[v0] ERROR: Failed to remove Pomodoro DNR rules:", n), console.error("[v0] ERROR: Attempted to remove Pomodoro rule IDs:", e), n;
      }
  });
}
const u_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addToBlacklist: Ll,
  cleanupAllDNRRules: a_,
  debugDNRStatus: QR,
  disablePomodoroBlocking: Ul,
  enablePomodoroBlocking: Vl,
  initializeBlocker: o_,
  removeFromBlacklist: c_
}, Symbol.toStringTag, { value: "Module" }));
function l_() {
  const t = "icons/icon48.png", e = chrome.runtime.getURL(t);
  return console.debug("[v0][Notifications] Icon URL resolved:", { iconPath: t, iconUrl: e }), e;
}
async function d_() {
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
  } catch (t) {
    return console.error("[v0][Notifications] Error verifying permission:", t), !1;
  }
}
async function h_() {
  try {
    try {
      const e = (await chrome.storage.sync.get(N.SETTINGS))[N.SETTINGS];
      if (e) {
        const n = e.notifications ?? e.notificationsEnabled;
        if (n !== void 0)
          return n;
      }
    } catch (t) {
      console.warn("[v0][Notifications] Sync storage read failed, trying local:", t);
    }
    try {
      const e = (await chrome.storage.local.get(N.SETTINGS))[N.SETTINGS];
      if (e) {
        const n = e.notifications ?? e.notificationsEnabled;
        if (n !== void 0)
          return n;
      }
    } catch (t) {
      console.warn("[v0][Notifications] Local storage read failed:", t);
    }
    return Ct.notifications ?? Ct.notificationsEnabled ?? !0;
  } catch (t) {
    return console.error("[v0][Notifications] Error getting notification setting:", t), !1;
  }
}
async function ia(t) {
  console.log("[v0][Notifications] Creating notification:", {
    notificationId: t.notificationId,
    title: t.title,
    type: t.type || "basic",
    iconUrl: t.iconUrl || "(will use default)"
  });
  try {
    console.debug("[v0][Notifications] Verifying notification permission...");
    const e = await d_();
    if (console.debug("[v0][Notifications] Permission check result:", { hasPermission: e }), !e)
      return console.warn("[v0][Notifications] Permission not available, skipping notification:", {
        id: t.notificationId,
        title: t.title
      }), null;
    console.debug("[v0][Notifications] Checking notification settings...");
    const n = await h_();
    if (console.debug("[v0][Notifications] Notification setting result:", { notificationsEnabled: n }), !n)
      return console.debug("[v0][Notifications] Notifications disabled in settings, skipping:", {
        id: t.notificationId,
        title: t.title
      }), null;
    const r = t.iconUrl || l_(), s = {
      type: t.type || "basic",
      iconUrl: r,
      title: t.title,
      message: t.message
    };
    t.buttons && t.buttons.length > 0 && (s.buttons = t.buttons), t.requireInteraction !== void 0 && (s.requireInteraction = t.requireInteraction), t.priority !== void 0 && (s.priority = t.priority), console.log("[v0][Notifications] Notification options prepared:", {
      notificationId: t.notificationId,
      type: s.type,
      iconUrl: s.iconUrl,
      title: s.title,
      messageLength: s.message?.length || 0,
      hasButtons: (s.buttons?.length || 0) > 0,
      requireInteraction: s.requireInteraction,
      priority: s.priority
    }), console.debug("[v0][Notifications] Calling chrome.notifications.create...");
    const i = await chrome.notifications.create(
      s
    );
    return console.log("[v0][Notifications] Notification created successfully:", {
      id: i,
      notificationId: t.notificationId,
      title: t.title,
      type: t.type || "basic"
    }), i;
  } catch (e) {
    return console.error("[v0][Notifications] Failed to create notification:", {
      error: e?.message || String(e),
      stack: e?.stack,
      notificationId: t.notificationId,
      title: t.title,
      message: t.message
    }), null;
  }
}
const Wa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createNotification: ia,
  getNotificationIconUrl: l_,
  getNotificationSetting: h_,
  verifyNotificationPermission: d_
}, Symbol.toStringTag, { value: "Module" }));
async function ZR() {
  return le.startSpan(
    { op: "module.init", name: "Initialize Pomodoro" },
    async (t) => {
      const e = (n, r) => {
        if (t && typeof t.setAttribute == "function") {
          const s = typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? r : String(r);
          t.setAttribute(n, s);
        }
      };
      try {
        console.log("[v0] Initializing Pomodoro module"), le.logger.info("Pomodoro module initializing"), await e0(), chrome.alarms.onAlarm.addListener(async (n) => {
          n.name === Ge.POMODORO && await Fl();
        }), le.logger.info("Pomodoro module initialized successfully"), e("success", !0);
      } catch (n) {
        throw le.logger.error("Failed to initialize Pomodoro module", { error: n }), e("success", !1), le.captureException(n instanceof Error ? n : new Error(String(n))), n;
      }
    }
  );
}
async function e0() {
  try {
    const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS);
    if (!t?.state || t.state.phase === "idle")
      return;
    const e = t.state, n = t.config || nn;
    if (!e.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer"), await f_();
      return;
    }
    const r = /* @__PURE__ */ new Date(), s = new Date(e.endsAt), i = Math.max(0, s.getTime() - r.getTime());
    if (i <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm"), await Fl();
      return;
    }
    const o = {
      ...e,
      remainingMs: i,
      endsAt: s.toISOString()
    };
    await chrome.storage.local.set({
      [N.POMODORO_STATUS]: { config: n, state: o }
    });
    const c = i / (60 * 1e3), u = i < 6e4 ? 0 : Math.ceil(i / (60 * 1e3));
    i < 6e4 ? await chrome.alarms.create(Ge.POMODORO, { delayInMinutes: 0 }) : await chrome.alarms.create(Ge.POMODORO, { delayInMinutes: c }), e.phase === "focus" && await Vl(), console.log(`[v0] Pomodoro recovery: Resumed timer with ${u} minutes remaining`);
  } catch (t) {
    console.error("[v0] Pomodoro recovery failed:", t);
  }
}
async function t0(t) {
  const { [N.POMODORO_STATUS]: e } = await chrome.storage.local.get(N.POMODORO_STATUS), n = e?.config || nn, r = {
    ...n,
    ...t
  };
  console.log("[v0] Pomodoro config debug:", {
    incomingConfig: t,
    currentConfig: n,
    finalConfig: r,
    focusMinutes: r.focusMinutes,
    shortBreakMinutes: r.shortBreakMinutes
  });
  const s = /* @__PURE__ */ new Date(), i = new Date(s.getTime() + r.focusMinutes * 60 * 1e3), o = {
    phase: "focus",
    isPaused: !1,
    cycleIndex: (e?.state?.cycleIndex || 0) + 1,
    startedAt: s.toISOString(),
    endsAt: i.toISOString(),
    remainingMs: r.focusMinutes * 60 * 1e3
  };
  await chrome.storage.local.set({ [N.POMODORO_STATUS]: { config: r, state: o } }), console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", r.focusMinutes), await chrome.alarms.create(Ge.POMODORO, { delayInMinutes: r.focusMinutes }), await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 }), await Vl(), await Ce();
  try {
    await ia({
      notificationId: "pomodoro-start",
      type: "basic",
      title: "Pomodoro Iniciado",
      message: `Foco por ${r.focusMinutes} minutos. Mantenha o foco!`
    });
  } catch (c) {
    console.error("[v0] Failed to create pomodoro-start notification:", c);
  }
  console.log("[v0] Pomodoro started:", o);
}
async function f_() {
  const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS), e = {
    phase: "idle",
    isPaused: !1,
    cycleIndex: 0,
    remainingMs: 0
  }, n = t?.config || nn;
  await chrome.storage.local.set({ [N.POMODORO_STATUS]: { config: n, state: e } }), await chrome.alarms.clear(Ge.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await Ul(), await Ce(), console.log("[v0] Pomodoro stopped");
}
async function n0() {
  const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS);
  if (!t?.state) return;
  const e = t.state, n = t.config || nn;
  if (e.phase === "idle" || e.isPaused) return;
  const r = /* @__PURE__ */ new Date(), s = e.endsAt ? new Date(e.endsAt) : r, i = Math.max(0, s.getTime() - r.getTime()), o = {
    ...e,
    isPaused: !0,
    pausedAt: r.toISOString(),
    remainingMs: i,
    endsAt: void 0
    // Remove endsAt pois não há mais deadline
  };
  await chrome.alarms.clear(Ge.POMODORO), await chrome.alarms.clear("pomodoro-keepalive"), await chrome.storage.local.set({
    [N.POMODORO_STATUS]: { config: n, state: o }
  }), await Ce(), console.log("[v0] Pomodoro paused:", o);
}
async function r0() {
  const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS);
  if (!t?.state || !t.state.isPaused) return;
  const e = t.state, n = t.config || nn, r = /* @__PURE__ */ new Date(), s = e.remainingMs || 0;
  if (s <= 0) {
    await Fl();
    return;
  }
  const i = new Date(r.getTime() + s), o = {
    ...e,
    isPaused: !1,
    pausedAt: void 0,
    endsAt: i.toISOString(),
    remainingMs: s
  };
  await chrome.storage.local.set({
    [N.POMODORO_STATUS]: { config: n, state: o }
  });
  const c = Math.ceil(s / (60 * 1e3));
  await chrome.alarms.create(Ge.POMODORO, {
    delayInMinutes: Math.max(c, 0.1)
    // Min 6 segundos
  }), e.phase === "focus" && await chrome.alarms.create("pomodoro-keepalive", {
    delayInMinutes: 5,
    periodInMinutes: 5
  }), await Ce(), console.log("[v0] Pomodoro resumed:", o);
}
async function p_() {
  const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS);
  if (!t?.state || t.state.phase !== "focus_complete") return;
  const e = t.state, n = t.config || nn, r = e.pendingBreakType || "short", s = r === "long" ? n.longBreakMinutes : n.shortBreakMinutes, i = /* @__PURE__ */ new Date(), o = new Date(i.getTime() + s * 60 * 1e3), c = {
    ...e,
    phase: r === "long" ? "long_break" : "short_break",
    isPaused: !1,
    startedAt: i.toISOString(),
    endsAt: o.toISOString(),
    remainingMs: s * 60 * 1e3,
    pendingBreakType: void 0
  };
  await chrome.storage.local.set({
    [N.POMODORO_STATUS]: { config: n, state: c }
  }), await chrome.alarms.create(Ge.POMODORO, {
    delayInMinutes: s
  }), await Ul(), await Ce(), console.log("[v0] Break started:", c);
}
async function Fl() {
  const { [N.POMODORO_STATUS]: t } = await chrome.storage.local.get(N.POMODORO_STATUS);
  if (!t?.state) return;
  const e = t.state, n = t.config || nn;
  if (e.phase === "focus") {
    const s = e.cycleIndex % n.cyclesBeforeLongBreak === 0 ? "long" : "short", i = {
      ...e,
      phase: "focus_complete",
      isPaused: !1,
      remainingMs: 0,
      endsAt: void 0,
      pendingBreakType: s
    };
    await chrome.storage.local.set({
      [N.POMODORO_STATUS]: { config: n, state: i }
    }), await chrome.alarms.clear("pomodoro-keepalive"), await Ce();
    try {
      await ia({
        notificationId: "pomodoro-focus-complete",
        type: "basic",
        title: "Foco Completo! 🎯",
        message: `Parabéns! Você completou ${n.focusMinutes} minutos de foco. Pronto para o descanso?`,
        buttons: [{ title: "Iniciar Descanso" }],
        requireInteraction: !0
        // Força usuário a interagir
      });
    } catch (o) {
      console.error("[v0] Failed to create pomodoro-focus-complete notification:", o);
    }
    console.log("[v0] Pomodoro: Focus → Focus Complete (awaiting user)");
  } else if (e.phase === "short_break" || e.phase === "long_break") {
    const r = { phase: "idle", isPaused: !1, cycleIndex: e.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [N.POMODORO_STATUS]: { config: n, state: r } }), await chrome.alarms.clear("pomodoro-keepalive"), await Ce();
    try {
      await ia({
        notificationId: "pomodoro-cycle-complete",
        type: "basic",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?"
      });
    } catch (s) {
      console.error("[v0] Failed to create pomodoro-cycle-complete notification:", s);
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
const s0 = () => {
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const m_ = function(t) {
  const e = [];
  let n = 0;
  for (let r = 0; r < t.length; r++) {
    let s = t.charCodeAt(r);
    s < 128 ? e[n++] = s : s < 2048 ? (e[n++] = s >> 6 | 192, e[n++] = s & 63 | 128) : (s & 64512) === 55296 && r + 1 < t.length && (t.charCodeAt(r + 1) & 64512) === 56320 ? (s = 65536 + ((s & 1023) << 10) + (t.charCodeAt(++r) & 1023), e[n++] = s >> 18 | 240, e[n++] = s >> 12 & 63 | 128, e[n++] = s >> 6 & 63 | 128, e[n++] = s & 63 | 128) : (e[n++] = s >> 12 | 224, e[n++] = s >> 6 & 63 | 128, e[n++] = s & 63 | 128);
  }
  return e;
}, i0 = function(t) {
  const e = [];
  let n = 0, r = 0;
  for (; n < t.length; ) {
    const s = t[n++];
    if (s < 128)
      e[r++] = String.fromCharCode(s);
    else if (s > 191 && s < 224) {
      const i = t[n++];
      e[r++] = String.fromCharCode((s & 31) << 6 | i & 63);
    } else if (s > 239 && s < 365) {
      const i = t[n++], o = t[n++], c = t[n++], u = ((s & 7) << 18 | (i & 63) << 12 | (o & 63) << 6 | c & 63) - 65536;
      e[r++] = String.fromCharCode(55296 + (u >> 10)), e[r++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const i = t[n++], o = t[n++];
      e[r++] = String.fromCharCode((s & 15) << 12 | (i & 63) << 6 | o & 63);
    }
  }
  return e.join("");
}, g_ = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(t, e) {
    if (!Array.isArray(t))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const n = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
    for (let s = 0; s < t.length; s += 3) {
      const i = t[s], o = s + 1 < t.length, c = o ? t[s + 1] : 0, u = s + 2 < t.length, d = u ? t[s + 2] : 0, f = i >> 2, p = (i & 3) << 4 | c >> 4;
      let _ = (c & 15) << 2 | d >> 6, T = d & 63;
      u || (T = 64, o || (_ = 64)), r.push(n[f], n[p], n[_], n[T]);
    }
    return r.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(t) : this.encodeByteArray(m_(t), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(t) : i0(this.decodeStringToByteArray(t, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(t, e) {
    this.init_();
    const n = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
    for (let s = 0; s < t.length; ) {
      const i = n[t.charAt(s++)], c = s < t.length ? n[t.charAt(s)] : 0;
      ++s;
      const d = s < t.length ? n[t.charAt(s)] : 64;
      ++s;
      const p = s < t.length ? n[t.charAt(s)] : 64;
      if (++s, i == null || c == null || d == null || p == null)
        throw new o0();
      const _ = i << 2 | c >> 4;
      if (r.push(_), d !== 64) {
        const T = c << 4 & 240 | d >> 2;
        if (r.push(T), p !== 64) {
          const w = d << 6 & 192 | p;
          r.push(w);
        }
      }
    }
    return r;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let t = 0; t < this.ENCODED_VALS.length; t++)
        this.byteToCharMap_[t] = this.ENCODED_VALS.charAt(t), this.charToByteMap_[this.byteToCharMap_[t]] = t, this.byteToCharMapWebSafe_[t] = this.ENCODED_VALS_WEBSAFE.charAt(t), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]] = t, t >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)] = t, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)] = t);
    }
  }
};
class o0 extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const a0 = function(t) {
  const e = m_(t);
  return g_.encodeByteArray(e, !0);
}, oa = function(t) {
  return a0(t).replace(/\./g, "");
}, __ = function(t) {
  try {
    return g_.decodeString(t, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function c0() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const u0 = () => c0().__FIREBASE_DEFAULTS__, l0 = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const t = process.env.__FIREBASE_DEFAULTS__;
  if (t)
    return JSON.parse(t);
}, d0 = () => {
  if (typeof document > "u")
    return;
  let t;
  try {
    t = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = t && __(t[1]);
  return e && JSON.parse(e);
}, Ka = () => {
  try {
    return s0() || u0() || l0() || d0();
  } catch (t) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);
    return;
  }
}, y_ = (t) => {
  var e, n;
  return (n = (e = Ka()) === null || e === void 0 ? void 0 : e.emulatorHosts) === null || n === void 0 ? void 0 : n[t];
}, h0 = (t) => {
  const e = y_(t);
  if (!e)
    return;
  const n = e.lastIndexOf(":");
  if (n <= 0 || n + 1 === e.length)
    throw new Error(`Invalid host ${e} with no separate hostname and port!`);
  const r = parseInt(e.substring(n + 1), 10);
  return e[0] === "[" ? [e.substring(1, n - 1), r] : [e.substring(0, n), r];
}, E_ = () => {
  var t;
  return (t = Ka()) === null || t === void 0 ? void 0 : t.config;
}, v_ = (t) => {
  var e;
  return (e = Ka()) === null || e === void 0 ? void 0 : e[`_${t}`];
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class f0 {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (n, r) => {
      n ? this.reject(n) : this.resolve(r), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(n) : e(n, r));
    };
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function cs(t) {
  try {
    return (t.startsWith("http://") || t.startsWith("https://") ? new URL(t).hostname : t).endsWith(".cloudworkstations.dev");
  } catch {
    return !1;
  }
}
async function S_(t) {
  return (await fetch(t, {
    credentials: "include"
  })).ok;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function p0(t, e) {
  if (t.uid)
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  const n = {
    alg: "none",
    type: "JWT"
  }, r = e || "demo-project", s = t.iat || 0, i = t.sub || t.user_id;
  if (!i)
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  const o = Object.assign({
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${r}`,
    aud: r,
    iat: s,
    exp: s + 3600,
    auth_time: s,
    sub: i,
    user_id: i,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    }
  }, t);
  return [
    oa(JSON.stringify(n)),
    oa(JSON.stringify(o)),
    ""
  ].join(".");
}
const Bs = {};
function m0() {
  const t = {
    prod: [],
    emulator: []
  };
  for (const e of Object.keys(Bs))
    Bs[e] ? t.emulator.push(e) : t.prod.push(e);
  return t;
}
function g0(t) {
  let e = document.getElementById(t), n = !1;
  return e || (e = document.createElement("div"), e.setAttribute("id", t), n = !0), { created: n, element: e };
}
let Hf = !1;
function T_(t, e) {
  if (typeof window > "u" || typeof document > "u" || !cs(window.location.host) || Bs[t] === e || Bs[t] || // If already set to use emulator, can't go back to prod.
  Hf)
    return;
  Bs[t] = e;
  function n(_) {
    return `__firebase__banner__${_}`;
  }
  const r = "__firebase__banner", i = m0().prod.length > 0;
  function o() {
    const _ = document.getElementById(r);
    _ && _.remove();
  }
  function c(_) {
    _.style.display = "flex", _.style.background = "#7faaf0", _.style.position = "fixed", _.style.bottom = "5px", _.style.left = "5px", _.style.padding = ".5em", _.style.borderRadius = "5px", _.style.alignItems = "center";
  }
  function u(_, T) {
    _.setAttribute("width", "24"), _.setAttribute("id", T), _.setAttribute("height", "24"), _.setAttribute("viewBox", "0 0 24 24"), _.setAttribute("fill", "none"), _.style.marginLeft = "-6px";
  }
  function d() {
    const _ = document.createElement("span");
    return _.style.cursor = "pointer", _.style.marginLeft = "16px", _.style.fontSize = "24px", _.innerHTML = " &times;", _.onclick = () => {
      Hf = !0, o();
    }, _;
  }
  function f(_, T) {
    _.setAttribute("id", T), _.innerText = "Learn more", _.href = "https://firebase.google.com/docs/studio/preview-apps#preview-backend", _.setAttribute("target", "__blank"), _.style.paddingLeft = "5px", _.style.textDecoration = "underline";
  }
  function p() {
    const _ = g0(r), T = n("text"), w = document.getElementById(T) || document.createElement("span"), k = n("learnmore"), P = document.getElementById(k) || document.createElement("a"), B = n("preprendIcon"), U = document.getElementById(B) || document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (_.created) {
      const H = _.element;
      c(H), f(P, k);
      const ne = d();
      u(U, B), H.append(U, w, P, ne), document.body.appendChild(H);
    }
    i ? (w.innerText = "Preview backend disconnected.", U.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`) : (U.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`, w.innerText = "Preview backend running in this workspace."), w.setAttribute("id", T);
  }
  document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", p) : p();
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function qe() {
  return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function _0() {
  return typeof window < "u" && // @ts-ignore Setting up an broadly applicable index signature for Window
  // just to deal with this case would probably be a bad idea.
  !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(qe());
}
function y0() {
  var t;
  const e = (t = Ka()) === null || t === void 0 ? void 0 : t.forceEnvironment;
  if (e === "node")
    return !0;
  if (e === "browser")
    return !1;
  try {
    return Object.prototype.toString.call(global.process) === "[object process]";
  } catch {
    return !1;
  }
}
function E0() {
  return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function v0() {
  const t = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
  return typeof t == "object" && t.id !== void 0;
}
function S0() {
  return typeof navigator == "object" && navigator.product === "ReactNative";
}
function T0() {
  const t = qe();
  return t.indexOf("MSIE ") >= 0 || t.indexOf("Trident/") >= 0;
}
function I0() {
  return !y0() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function w0() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function b0() {
  return new Promise((t, e) => {
    try {
      let n = !0;
      const r = "validate-browser-context-for-indexeddb-analytics-module", s = self.indexedDB.open(r);
      s.onsuccess = () => {
        s.result.close(), n || self.indexedDB.deleteDatabase(r), t(!0);
      }, s.onupgradeneeded = () => {
        n = !1;
      }, s.onerror = () => {
        var i;
        e(((i = s.error) === null || i === void 0 ? void 0 : i.message) || "");
      };
    } catch (n) {
      e(n);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const A0 = "FirebaseError";
class rn extends Error {
  constructor(e, n, r) {
    super(n), this.code = e, this.customData = r, this.name = A0, Object.setPrototypeOf(this, rn.prototype), Error.captureStackTrace && Error.captureStackTrace(this, wi.prototype.create);
  }
}
class wi {
  constructor(e, n, r) {
    this.service = e, this.serviceName = n, this.errors = r;
  }
  create(e, ...n) {
    const r = n[0] || {}, s = `${this.service}/${e}`, i = this.errors[e], o = i ? R0(i, r) : "Error", c = `${this.serviceName}: ${o} (${s}).`;
    return new rn(s, c, r);
  }
}
function R0(t, e) {
  return t.replace(C0, (n, r) => {
    const s = e[r];
    return s != null ? String(s) : `<${r}?>`;
  });
}
const C0 = /\{\$([^}]+)}/g;
function P0(t) {
  for (const e in t)
    if (Object.prototype.hasOwnProperty.call(t, e))
      return !1;
  return !0;
}
function cr(t, e) {
  if (t === e)
    return !0;
  const n = Object.keys(t), r = Object.keys(e);
  for (const s of n) {
    if (!r.includes(s))
      return !1;
    const i = t[s], o = e[s];
    if (Gf(i) && Gf(o)) {
      if (!cr(i, o))
        return !1;
    } else if (i !== o)
      return !1;
  }
  for (const s of r)
    if (!n.includes(s))
      return !1;
  return !0;
}
function Gf(t) {
  return t !== null && typeof t == "object";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bi(t) {
  const e = [];
  for (const [n, r] of Object.entries(t))
    Array.isArray(r) ? r.forEach((s) => {
      e.push(encodeURIComponent(n) + "=" + encodeURIComponent(s));
    }) : e.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
  return e.length ? "&" + e.join("&") : "";
}
function D0(t, e) {
  const n = new k0(t, e);
  return n.subscribe.bind(n);
}
class k0 {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(e, n) {
    this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = n, this.task.then(() => {
      e(this);
    }).catch((r) => {
      this.error(r);
    });
  }
  next(e) {
    this.forEachObserver((n) => {
      n.next(e);
    });
  }
  error(e) {
    this.forEachObserver((n) => {
      n.error(e);
    }), this.close(e);
  }
  complete() {
    this.forEachObserver((e) => {
      e.complete();
    }), this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber synchronously to their
   *   call to subscribe().
   */
  subscribe(e, n, r) {
    let s;
    if (e === void 0 && n === void 0 && r === void 0)
      throw new Error("Missing Observer.");
    N0(e, [
      "next",
      "error",
      "complete"
    ]) ? s = e : s = {
      next: e,
      error: n,
      complete: r
    }, s.next === void 0 && (s.next = zc), s.error === void 0 && (s.error = zc), s.complete === void 0 && (s.complete = zc);
    const i = this.unsubscribeOne.bind(this, this.observers.length);
    return this.finalized && this.task.then(() => {
      try {
        this.finalError ? s.error(this.finalError) : s.complete();
      } catch {
      }
    }), this.observers.push(s), i;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(e) {
    this.observers === void 0 || this.observers[e] === void 0 || (delete this.observers[e], this.observerCount -= 1, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized)
      for (let n = 0; n < this.observers.length; n++)
        this.sendOne(n, e);
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(e, n) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          n(this.observers[e]);
        } catch (r) {
          typeof console < "u" && console.error && console.error(r);
        }
    });
  }
  close(e) {
    this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
      this.observers = void 0, this.onNoObservers = void 0;
    }));
  }
}
function N0(t, e) {
  if (typeof t != "object" || t === null)
    return !1;
  for (const n of e)
    if (n in t && typeof t[n] == "function")
      return !0;
  return !1;
}
function zc() {
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function pt(t) {
  return t && t._delegate ? t._delegate : t;
}
class ur {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, n, r) {
    this.name = e, this.instanceFactory = n, this.type = r, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const zn = "[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class O0 {
  constructor(e, n) {
    this.name = e, this.container = n, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const n = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(n)) {
      const r = new f0();
      if (this.instancesDeferred.set(n, r), this.isInitialized(n) || this.shouldAutoInitialize())
        try {
          const s = this.getOrInitializeService({
            instanceIdentifier: n
          });
          s && r.resolve(s);
        } catch {
        }
    }
    return this.instancesDeferred.get(n).promise;
  }
  getImmediate(e) {
    var n;
    const r = this.normalizeInstanceIdentifier(e?.identifier), s = (n = e?.optional) !== null && n !== void 0 ? n : !1;
    if (this.isInitialized(r) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: r
        });
      } catch (i) {
        if (s)
          return null;
        throw i;
      }
    else {
      if (s)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (L0(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: zn });
        } catch {
        }
      for (const [n, r] of this.instancesDeferred.entries()) {
        const s = this.normalizeInstanceIdentifier(n);
        try {
          const i = this.getOrInitializeService({
            instanceIdentifier: s
          });
          r.resolve(i);
        } catch {
        }
      }
    }
  }
  clearInstance(e = zn) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((n) => "INTERNAL" in n).map((n) => n.INTERNAL.delete()),
      ...e.filter((n) => "_delete" in n).map((n) => n._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = zn) {
    return this.instances.has(e);
  }
  getOptions(e = zn) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: n = {} } = e, r = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(r))
      throw Error(`${this.name}(${r}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const s = this.getOrInitializeService({
      instanceIdentifier: r,
      options: n
    });
    for (const [i, o] of this.instancesDeferred.entries()) {
      const c = this.normalizeInstanceIdentifier(i);
      r === c && o.resolve(s);
    }
    return s;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, n) {
    var r;
    const s = this.normalizeInstanceIdentifier(n), i = (r = this.onInitCallbacks.get(s)) !== null && r !== void 0 ? r : /* @__PURE__ */ new Set();
    i.add(e), this.onInitCallbacks.set(s, i);
    const o = this.instances.get(s);
    return o && e(o, s), () => {
      i.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, n) {
    const r = this.onInitCallbacks.get(n);
    if (r)
      for (const s of r)
        try {
          s(e, n);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: n = {} }) {
    let r = this.instances.get(e);
    if (!r && this.component && (r = this.component.instanceFactory(this.container, {
      instanceIdentifier: M0(e),
      options: n
    }), this.instances.set(e, r), this.instancesOptions.set(e, n), this.invokeOnInitCallbacks(r, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, r);
      } catch {
      }
    return r || null;
  }
  normalizeInstanceIdentifier(e = zn) {
    return this.component ? this.component.multipleInstances ? e : zn : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function M0(t) {
  return t === zn ? void 0 : t;
}
function L0(t) {
  return t.instantiationMode === "EAGER";
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class x0 {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const n = this.getProvider(e.name);
    if (n.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    n.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const n = new O0(e, this);
    return this.providers.set(e, n), n;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var z;
(function(t) {
  t[t.DEBUG = 0] = "DEBUG", t[t.VERBOSE = 1] = "VERBOSE", t[t.INFO = 2] = "INFO", t[t.WARN = 3] = "WARN", t[t.ERROR = 4] = "ERROR", t[t.SILENT = 5] = "SILENT";
})(z || (z = {}));
const V0 = {
  debug: z.DEBUG,
  verbose: z.VERBOSE,
  info: z.INFO,
  warn: z.WARN,
  error: z.ERROR,
  silent: z.SILENT
}, U0 = z.INFO, F0 = {
  [z.DEBUG]: "log",
  [z.VERBOSE]: "log",
  [z.INFO]: "info",
  [z.WARN]: "warn",
  [z.ERROR]: "error"
}, B0 = (t, e, ...n) => {
  if (e < t.logLevel)
    return;
  const r = (/* @__PURE__ */ new Date()).toISOString(), s = F0[e];
  if (s)
    console[s](`[${r}]  ${t.name}:`, ...n);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
class Bl {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = U0, this._logHandler = B0, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in z))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? V0[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, z.DEBUG, ...e), this._logHandler(this, z.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, z.VERBOSE, ...e), this._logHandler(this, z.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, z.INFO, ...e), this._logHandler(this, z.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, z.WARN, ...e), this._logHandler(this, z.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, z.ERROR, ...e), this._logHandler(this, z.ERROR, ...e);
  }
}
const $0 = (t, e) => e.some((n) => t instanceof n);
let qf, zf;
function j0() {
  return qf || (qf = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function H0() {
  return zf || (zf = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const I_ = /* @__PURE__ */ new WeakMap(), ku = /* @__PURE__ */ new WeakMap(), w_ = /* @__PURE__ */ new WeakMap(), Wc = /* @__PURE__ */ new WeakMap(), $l = /* @__PURE__ */ new WeakMap();
function G0(t) {
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("success", i), t.removeEventListener("error", o);
    }, i = () => {
      n(Sn(t.result)), s();
    }, o = () => {
      r(t.error), s();
    };
    t.addEventListener("success", i), t.addEventListener("error", o);
  });
  return e.then((n) => {
    n instanceof IDBCursor && I_.set(n, t);
  }).catch(() => {
  }), $l.set(e, t), e;
}
function q0(t) {
  if (ku.has(t))
    return;
  const e = new Promise((n, r) => {
    const s = () => {
      t.removeEventListener("complete", i), t.removeEventListener("error", o), t.removeEventListener("abort", o);
    }, i = () => {
      n(), s();
    }, o = () => {
      r(t.error || new DOMException("AbortError", "AbortError")), s();
    };
    t.addEventListener("complete", i), t.addEventListener("error", o), t.addEventListener("abort", o);
  });
  ku.set(t, e);
}
let Nu = {
  get(t, e, n) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return ku.get(t);
      if (e === "objectStoreNames")
        return t.objectStoreNames || w_.get(t);
      if (e === "store")
        return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
    }
    return Sn(t[e]);
  },
  set(t, e, n) {
    return t[e] = n, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function z0(t) {
  Nu = t(Nu);
}
function W0(t) {
  return t === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...n) {
    const r = t.call(Kc(this), e, ...n);
    return w_.set(r, e.sort ? e.sort() : [e]), Sn(r);
  } : H0().includes(t) ? function(...e) {
    return t.apply(Kc(this), e), Sn(I_.get(this));
  } : function(...e) {
    return Sn(t.apply(Kc(this), e));
  };
}
function K0(t) {
  return typeof t == "function" ? W0(t) : (t instanceof IDBTransaction && q0(t), $0(t, j0()) ? new Proxy(t, Nu) : t);
}
function Sn(t) {
  if (t instanceof IDBRequest)
    return G0(t);
  if (Wc.has(t))
    return Wc.get(t);
  const e = K0(t);
  return e !== t && (Wc.set(t, e), $l.set(e, t)), e;
}
const Kc = (t) => $l.get(t);
function Y0(t, e, { blocked: n, upgrade: r, blocking: s, terminated: i } = {}) {
  const o = indexedDB.open(t, e), c = Sn(o);
  return r && o.addEventListener("upgradeneeded", (u) => {
    r(Sn(o.result), u.oldVersion, u.newVersion, Sn(o.transaction), u);
  }), n && o.addEventListener("blocked", (u) => n(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    u.oldVersion,
    u.newVersion,
    u
  )), c.then((u) => {
    i && u.addEventListener("close", () => i()), s && u.addEventListener("versionchange", (d) => s(d.oldVersion, d.newVersion, d));
  }).catch(() => {
  }), c;
}
const J0 = ["get", "getKey", "getAll", "getAllKeys", "count"], X0 = ["put", "add", "delete", "clear"], Yc = /* @__PURE__ */ new Map();
function Wf(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (Yc.get(e))
    return Yc.get(e);
  const n = e.replace(/FromIndex$/, ""), r = e !== n, s = X0.includes(n);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || J0.includes(n))
  )
    return;
  const i = async function(o, ...c) {
    const u = this.transaction(o, s ? "readwrite" : "readonly");
    let d = u.store;
    return r && (d = d.index(c.shift())), (await Promise.all([
      d[n](...c),
      s && u.done
    ]))[0];
  };
  return Yc.set(e, i), i;
}
z0((t) => ({
  ...t,
  get: (e, n, r) => Wf(e, n) || t.get(e, n, r),
  has: (e, n) => !!Wf(e, n) || t.has(e, n)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Q0 {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((n) => {
      if (Z0(n)) {
        const r = n.getImmediate();
        return `${r.library}/${r.version}`;
      } else
        return null;
    }).filter((n) => n).join(" ");
  }
}
function Z0(t) {
  const e = t.getComponent();
  return e?.type === "VERSION";
}
const Ou = "@firebase/app", Kf = "0.13.2";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Zt = new Bl("@firebase/app"), eC = "@firebase/app-compat", tC = "@firebase/analytics-compat", nC = "@firebase/analytics", rC = "@firebase/app-check-compat", sC = "@firebase/app-check", iC = "@firebase/auth", oC = "@firebase/auth-compat", aC = "@firebase/database", cC = "@firebase/data-connect", uC = "@firebase/database-compat", lC = "@firebase/functions", dC = "@firebase/functions-compat", hC = "@firebase/installations", fC = "@firebase/installations-compat", pC = "@firebase/messaging", mC = "@firebase/messaging-compat", gC = "@firebase/performance", _C = "@firebase/performance-compat", yC = "@firebase/remote-config", EC = "@firebase/remote-config-compat", vC = "@firebase/storage", SC = "@firebase/storage-compat", TC = "@firebase/firestore", IC = "@firebase/ai", wC = "@firebase/firestore-compat", bC = "firebase", AC = "11.10.0";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Mu = "[DEFAULT]", RC = {
  [Ou]: "fire-core",
  [eC]: "fire-core-compat",
  [nC]: "fire-analytics",
  [tC]: "fire-analytics-compat",
  [sC]: "fire-app-check",
  [rC]: "fire-app-check-compat",
  [iC]: "fire-auth",
  [oC]: "fire-auth-compat",
  [aC]: "fire-rtdb",
  [cC]: "fire-data-connect",
  [uC]: "fire-rtdb-compat",
  [lC]: "fire-fn",
  [dC]: "fire-fn-compat",
  [hC]: "fire-iid",
  [fC]: "fire-iid-compat",
  [pC]: "fire-fcm",
  [mC]: "fire-fcm-compat",
  [gC]: "fire-perf",
  [_C]: "fire-perf-compat",
  [yC]: "fire-rc",
  [EC]: "fire-rc-compat",
  [vC]: "fire-gcs",
  [SC]: "fire-gcs-compat",
  [TC]: "fire-fst",
  [wC]: "fire-fst-compat",
  [IC]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [bC]: "fire-js-all"
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ti = /* @__PURE__ */ new Map(), CC = /* @__PURE__ */ new Map(), Lu = /* @__PURE__ */ new Map();
function Yf(t, e) {
  try {
    t.container.addComponent(e);
  } catch (n) {
    Zt.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`, n);
  }
}
function qr(t) {
  const e = t.name;
  if (Lu.has(e))
    return Zt.debug(`There were multiple attempts to register component ${e}.`), !1;
  Lu.set(e, t);
  for (const n of ti.values())
    Yf(n, t);
  for (const n of CC.values())
    Yf(n, t);
  return !0;
}
function jl(t, e) {
  const n = t.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return n && n.triggerHeartbeat(), t.container.getProvider(e);
}
function Pt(t) {
  return t == null ? !1 : t.settings !== void 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PC = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}'",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "server-app-deleted": "Firebase Server App has been deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  "finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  "invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}, Tn = new wi("app", "Firebase", PC);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class DC {
  constructor(e, n, r) {
    this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, n), this._name = n.name, this._automaticDataCollectionEnabled = n.automaticDataCollectionEnabled, this._container = r, this.container.addComponent(new ur(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw Tn.create("app-deleted", { appName: this._name });
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const us = AC;
function b_(t, e = {}) {
  let n = t;
  typeof e != "object" && (e = { name: e });
  const r = Object.assign({ name: Mu, automaticDataCollectionEnabled: !0 }, e), s = r.name;
  if (typeof s != "string" || !s)
    throw Tn.create("bad-app-name", {
      appName: String(s)
    });
  if (n || (n = E_()), !n)
    throw Tn.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const i = ti.get(s);
  if (i) {
    if (cr(n, i.options) && cr(r, i.config))
      return i;
    throw Tn.create("duplicate-app", { appName: s });
  }
  const o = new x0(s);
  for (const u of Lu.values())
    o.addComponent(u);
  const c = new DC(n, r, o);
  return ti.set(s, c), c;
}
function A_(t = Mu) {
  const e = ti.get(t);
  if (!e && t === Mu && E_())
    return b_();
  if (!e)
    throw Tn.create("no-app", { appName: t });
  return e;
}
function kC() {
  return Array.from(ti.values());
}
function In(t, e, n) {
  var r;
  let s = (r = RC[t]) !== null && r !== void 0 ? r : t;
  n && (s += `-${n}`);
  const i = s.match(/\s|\//), o = e.match(/\s|\//);
  if (i || o) {
    const c = [
      `Unable to register library "${s}" with version "${e}":`
    ];
    i && c.push(`library name "${s}" contains illegal characters (whitespace or "/")`), i && o && c.push("and"), o && c.push(`version name "${e}" contains illegal characters (whitespace or "/")`), Zt.warn(c.join(" "));
    return;
  }
  qr(new ur(
    `${s}-version`,
    () => ({ library: s, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const NC = "firebase-heartbeat-database", OC = 1, ni = "firebase-heartbeat-store";
let Jc = null;
function R_() {
  return Jc || (Jc = Y0(NC, OC, {
    upgrade: (t, e) => {
      switch (e) {
        case 0:
          try {
            t.createObjectStore(ni);
          } catch (n) {
            console.warn(n);
          }
      }
    }
  }).catch((t) => {
    throw Tn.create("idb-open", {
      originalErrorMessage: t.message
    });
  })), Jc;
}
async function MC(t) {
  try {
    const n = (await R_()).transaction(ni), r = await n.objectStore(ni).get(C_(t));
    return await n.done, r;
  } catch (e) {
    if (e instanceof rn)
      Zt.warn(e.message);
    else {
      const n = Tn.create("idb-get", {
        originalErrorMessage: e?.message
      });
      Zt.warn(n.message);
    }
  }
}
async function Jf(t, e) {
  try {
    const r = (await R_()).transaction(ni, "readwrite");
    await r.objectStore(ni).put(e, C_(t)), await r.done;
  } catch (n) {
    if (n instanceof rn)
      Zt.warn(n.message);
    else {
      const r = Tn.create("idb-set", {
        originalErrorMessage: n?.message
      });
      Zt.warn(r.message);
    }
  }
}
function C_(t) {
  return `${t.name}!${t.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const LC = 1024, xC = 30;
class VC {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const n = this.container.getProvider("app").getImmediate();
    this._storage = new FC(n), this._heartbeatsCachePromise = this._storage.read().then((r) => (this._heartbeatsCache = r, r));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    var e, n;
    try {
      const s = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), i = Xf();
      if (((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, ((n = this._heartbeatsCache) === null || n === void 0 ? void 0 : n.heartbeats) == null) || this._heartbeatsCache.lastSentHeartbeatDate === i || this._heartbeatsCache.heartbeats.some((o) => o.date === i))
        return;
      if (this._heartbeatsCache.heartbeats.push({ date: i, agent: s }), this._heartbeatsCache.heartbeats.length > xC) {
        const o = BC(this._heartbeatsCache.heartbeats);
        this._heartbeatsCache.heartbeats.splice(o, 1);
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (r) {
      Zt.warn(r);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    var e;
    try {
      if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, ((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0)
        return "";
      const n = Xf(), { heartbeatsToSend: r, unsentEntries: s } = UC(this._heartbeatsCache.heartbeats), i = oa(JSON.stringify({ version: 2, heartbeats: r }));
      return this._heartbeatsCache.lastSentHeartbeatDate = n, s.length > 0 ? (this._heartbeatsCache.heartbeats = s, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), i;
    } catch (n) {
      return Zt.warn(n), "";
    }
  }
}
function Xf() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function UC(t, e = LC) {
  const n = [];
  let r = t.slice();
  for (const s of t) {
    const i = n.find((o) => o.agent === s.agent);
    if (i) {
      if (i.dates.push(s.date), Qf(n) > e) {
        i.dates.pop();
        break;
      }
    } else if (n.push({
      agent: s.agent,
      dates: [s.date]
    }), Qf(n) > e) {
      n.pop();
      break;
    }
    r = r.slice(1);
  }
  return {
    heartbeatsToSend: n,
    unsentEntries: r
  };
}
class FC {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return w0() ? b0().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const n = await MC(this.app);
      return n?.heartbeats ? n : { heartbeats: [] };
    } else
      return { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    var n;
    if (await this._canUseIndexedDBPromise) {
      const s = await this.read();
      return Jf(this.app, {
        lastSentHeartbeatDate: (n = e.lastSentHeartbeatDate) !== null && n !== void 0 ? n : s.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    var n;
    if (await this._canUseIndexedDBPromise) {
      const s = await this.read();
      return Jf(this.app, {
        lastSentHeartbeatDate: (n = e.lastSentHeartbeatDate) !== null && n !== void 0 ? n : s.lastSentHeartbeatDate,
        heartbeats: [
          ...s.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function Qf(t) {
  return oa(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: t })
  ).length;
}
function BC(t) {
  if (t.length === 0)
    return -1;
  let e = 0, n = t[0].date;
  for (let r = 1; r < t.length; r++)
    t[r].date < n && (n = t[r].date, e = r);
  return e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function $C(t) {
  qr(new ur(
    "platform-logger",
    (e) => new Q0(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), qr(new ur(
    "heartbeat",
    (e) => new VC(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), In(Ou, Kf, t), In(Ou, Kf, "esm2017"), In("fire-js", "");
}
$C("");
var Zf = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var Hl;
(function() {
  var t;
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  function e(v, g) {
    function E() {
    }
    E.prototype = g.prototype, v.D = g.prototype, v.prototype = new E(), v.prototype.constructor = v, v.C = function(S, I, b) {
      for (var y = Array(arguments.length - 2), ke = 2; ke < arguments.length; ke++) y[ke - 2] = arguments[ke];
      return g.prototype[I].apply(S, y);
    };
  }
  function n() {
    this.blockSize = -1;
  }
  function r() {
    this.blockSize = -1, this.blockSize = 64, this.g = Array(4), this.B = Array(this.blockSize), this.o = this.h = 0, this.s();
  }
  e(r, n), r.prototype.s = function() {
    this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.o = this.h = 0;
  };
  function s(v, g, E) {
    E || (E = 0);
    var S = Array(16);
    if (typeof g == "string") for (var I = 0; 16 > I; ++I) S[I] = g.charCodeAt(E++) | g.charCodeAt(E++) << 8 | g.charCodeAt(E++) << 16 | g.charCodeAt(E++) << 24;
    else for (I = 0; 16 > I; ++I) S[I] = g[E++] | g[E++] << 8 | g[E++] << 16 | g[E++] << 24;
    g = v.g[0], E = v.g[1], I = v.g[2];
    var b = v.g[3], y = g + (b ^ E & (I ^ b)) + S[0] + 3614090360 & 4294967295;
    g = E + (y << 7 & 4294967295 | y >>> 25), y = b + (I ^ g & (E ^ I)) + S[1] + 3905402710 & 4294967295, b = g + (y << 12 & 4294967295 | y >>> 20), y = I + (E ^ b & (g ^ E)) + S[2] + 606105819 & 4294967295, I = b + (y << 17 & 4294967295 | y >>> 15), y = E + (g ^ I & (b ^ g)) + S[3] + 3250441966 & 4294967295, E = I + (y << 22 & 4294967295 | y >>> 10), y = g + (b ^ E & (I ^ b)) + S[4] + 4118548399 & 4294967295, g = E + (y << 7 & 4294967295 | y >>> 25), y = b + (I ^ g & (E ^ I)) + S[5] + 1200080426 & 4294967295, b = g + (y << 12 & 4294967295 | y >>> 20), y = I + (E ^ b & (g ^ E)) + S[6] + 2821735955 & 4294967295, I = b + (y << 17 & 4294967295 | y >>> 15), y = E + (g ^ I & (b ^ g)) + S[7] + 4249261313 & 4294967295, E = I + (y << 22 & 4294967295 | y >>> 10), y = g + (b ^ E & (I ^ b)) + S[8] + 1770035416 & 4294967295, g = E + (y << 7 & 4294967295 | y >>> 25), y = b + (I ^ g & (E ^ I)) + S[9] + 2336552879 & 4294967295, b = g + (y << 12 & 4294967295 | y >>> 20), y = I + (E ^ b & (g ^ E)) + S[10] + 4294925233 & 4294967295, I = b + (y << 17 & 4294967295 | y >>> 15), y = E + (g ^ I & (b ^ g)) + S[11] + 2304563134 & 4294967295, E = I + (y << 22 & 4294967295 | y >>> 10), y = g + (b ^ E & (I ^ b)) + S[12] + 1804603682 & 4294967295, g = E + (y << 7 & 4294967295 | y >>> 25), y = b + (I ^ g & (E ^ I)) + S[13] + 4254626195 & 4294967295, b = g + (y << 12 & 4294967295 | y >>> 20), y = I + (E ^ b & (g ^ E)) + S[14] + 2792965006 & 4294967295, I = b + (y << 17 & 4294967295 | y >>> 15), y = E + (g ^ I & (b ^ g)) + S[15] + 1236535329 & 4294967295, E = I + (y << 22 & 4294967295 | y >>> 10), y = g + (I ^ b & (E ^ I)) + S[1] + 4129170786 & 4294967295, g = E + (y << 5 & 4294967295 | y >>> 27), y = b + (E ^ I & (g ^ E)) + S[6] + 3225465664 & 4294967295, b = g + (y << 9 & 4294967295 | y >>> 23), y = I + (g ^ E & (b ^ g)) + S[11] + 643717713 & 4294967295, I = b + (y << 14 & 4294967295 | y >>> 18), y = E + (b ^ g & (I ^ b)) + S[0] + 3921069994 & 4294967295, E = I + (y << 20 & 4294967295 | y >>> 12), y = g + (I ^ b & (E ^ I)) + S[5] + 3593408605 & 4294967295, g = E + (y << 5 & 4294967295 | y >>> 27), y = b + (E ^ I & (g ^ E)) + S[10] + 38016083 & 4294967295, b = g + (y << 9 & 4294967295 | y >>> 23), y = I + (g ^ E & (b ^ g)) + S[15] + 3634488961 & 4294967295, I = b + (y << 14 & 4294967295 | y >>> 18), y = E + (b ^ g & (I ^ b)) + S[4] + 3889429448 & 4294967295, E = I + (y << 20 & 4294967295 | y >>> 12), y = g + (I ^ b & (E ^ I)) + S[9] + 568446438 & 4294967295, g = E + (y << 5 & 4294967295 | y >>> 27), y = b + (E ^ I & (g ^ E)) + S[14] + 3275163606 & 4294967295, b = g + (y << 9 & 4294967295 | y >>> 23), y = I + (g ^ E & (b ^ g)) + S[3] + 4107603335 & 4294967295, I = b + (y << 14 & 4294967295 | y >>> 18), y = E + (b ^ g & (I ^ b)) + S[8] + 1163531501 & 4294967295, E = I + (y << 20 & 4294967295 | y >>> 12), y = g + (I ^ b & (E ^ I)) + S[13] + 2850285829 & 4294967295, g = E + (y << 5 & 4294967295 | y >>> 27), y = b + (E ^ I & (g ^ E)) + S[2] + 4243563512 & 4294967295, b = g + (y << 9 & 4294967295 | y >>> 23), y = I + (g ^ E & (b ^ g)) + S[7] + 1735328473 & 4294967295, I = b + (y << 14 & 4294967295 | y >>> 18), y = E + (b ^ g & (I ^ b)) + S[12] + 2368359562 & 4294967295, E = I + (y << 20 & 4294967295 | y >>> 12), y = g + (E ^ I ^ b) + S[5] + 4294588738 & 4294967295, g = E + (y << 4 & 4294967295 | y >>> 28), y = b + (g ^ E ^ I) + S[8] + 2272392833 & 4294967295, b = g + (y << 11 & 4294967295 | y >>> 21), y = I + (b ^ g ^ E) + S[11] + 1839030562 & 4294967295, I = b + (y << 16 & 4294967295 | y >>> 16), y = E + (I ^ b ^ g) + S[14] + 4259657740 & 4294967295, E = I + (y << 23 & 4294967295 | y >>> 9), y = g + (E ^ I ^ b) + S[1] + 2763975236 & 4294967295, g = E + (y << 4 & 4294967295 | y >>> 28), y = b + (g ^ E ^ I) + S[4] + 1272893353 & 4294967295, b = g + (y << 11 & 4294967295 | y >>> 21), y = I + (b ^ g ^ E) + S[7] + 4139469664 & 4294967295, I = b + (y << 16 & 4294967295 | y >>> 16), y = E + (I ^ b ^ g) + S[10] + 3200236656 & 4294967295, E = I + (y << 23 & 4294967295 | y >>> 9), y = g + (E ^ I ^ b) + S[13] + 681279174 & 4294967295, g = E + (y << 4 & 4294967295 | y >>> 28), y = b + (g ^ E ^ I) + S[0] + 3936430074 & 4294967295, b = g + (y << 11 & 4294967295 | y >>> 21), y = I + (b ^ g ^ E) + S[3] + 3572445317 & 4294967295, I = b + (y << 16 & 4294967295 | y >>> 16), y = E + (I ^ b ^ g) + S[6] + 76029189 & 4294967295, E = I + (y << 23 & 4294967295 | y >>> 9), y = g + (E ^ I ^ b) + S[9] + 3654602809 & 4294967295, g = E + (y << 4 & 4294967295 | y >>> 28), y = b + (g ^ E ^ I) + S[12] + 3873151461 & 4294967295, b = g + (y << 11 & 4294967295 | y >>> 21), y = I + (b ^ g ^ E) + S[15] + 530742520 & 4294967295, I = b + (y << 16 & 4294967295 | y >>> 16), y = E + (I ^ b ^ g) + S[2] + 3299628645 & 4294967295, E = I + (y << 23 & 4294967295 | y >>> 9), y = g + (I ^ (E | ~b)) + S[0] + 4096336452 & 4294967295, g = E + (y << 6 & 4294967295 | y >>> 26), y = b + (E ^ (g | ~I)) + S[7] + 1126891415 & 4294967295, b = g + (y << 10 & 4294967295 | y >>> 22), y = I + (g ^ (b | ~E)) + S[14] + 2878612391 & 4294967295, I = b + (y << 15 & 4294967295 | y >>> 17), y = E + (b ^ (I | ~g)) + S[5] + 4237533241 & 4294967295, E = I + (y << 21 & 4294967295 | y >>> 11), y = g + (I ^ (E | ~b)) + S[12] + 1700485571 & 4294967295, g = E + (y << 6 & 4294967295 | y >>> 26), y = b + (E ^ (g | ~I)) + S[3] + 2399980690 & 4294967295, b = g + (y << 10 & 4294967295 | y >>> 22), y = I + (g ^ (b | ~E)) + S[10] + 4293915773 & 4294967295, I = b + (y << 15 & 4294967295 | y >>> 17), y = E + (b ^ (I | ~g)) + S[1] + 2240044497 & 4294967295, E = I + (y << 21 & 4294967295 | y >>> 11), y = g + (I ^ (E | ~b)) + S[8] + 1873313359 & 4294967295, g = E + (y << 6 & 4294967295 | y >>> 26), y = b + (E ^ (g | ~I)) + S[15] + 4264355552 & 4294967295, b = g + (y << 10 & 4294967295 | y >>> 22), y = I + (g ^ (b | ~E)) + S[6] + 2734768916 & 4294967295, I = b + (y << 15 & 4294967295 | y >>> 17), y = E + (b ^ (I | ~g)) + S[13] + 1309151649 & 4294967295, E = I + (y << 21 & 4294967295 | y >>> 11), y = g + (I ^ (E | ~b)) + S[4] + 4149444226 & 4294967295, g = E + (y << 6 & 4294967295 | y >>> 26), y = b + (E ^ (g | ~I)) + S[11] + 3174756917 & 4294967295, b = g + (y << 10 & 4294967295 | y >>> 22), y = I + (g ^ (b | ~E)) + S[2] + 718787259 & 4294967295, I = b + (y << 15 & 4294967295 | y >>> 17), y = E + (b ^ (I | ~g)) + S[9] + 3951481745 & 4294967295, v.g[0] = v.g[0] + g & 4294967295, v.g[1] = v.g[1] + (I + (y << 21 & 4294967295 | y >>> 11)) & 4294967295, v.g[2] = v.g[2] + I & 4294967295, v.g[3] = v.g[3] + b & 4294967295;
  }
  r.prototype.u = function(v, g) {
    g === void 0 && (g = v.length);
    for (var E = g - this.blockSize, S = this.B, I = this.h, b = 0; b < g; ) {
      if (I == 0) for (; b <= E; ) s(this, v, b), b += this.blockSize;
      if (typeof v == "string") {
        for (; b < g; )
          if (S[I++] = v.charCodeAt(b++), I == this.blockSize) {
            s(this, S), I = 0;
            break;
          }
      } else for (; b < g; ) if (S[I++] = v[b++], I == this.blockSize) {
        s(this, S), I = 0;
        break;
      }
    }
    this.h = I, this.o += g;
  }, r.prototype.v = function() {
    var v = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
    v[0] = 128;
    for (var g = 1; g < v.length - 8; ++g) v[g] = 0;
    var E = 8 * this.o;
    for (g = v.length - 8; g < v.length; ++g) v[g] = E & 255, E /= 256;
    for (this.u(v), v = Array(16), g = E = 0; 4 > g; ++g) for (var S = 0; 32 > S; S += 8) v[E++] = this.g[g] >>> S & 255;
    return v;
  };
  function i(v, g) {
    var E = c;
    return Object.prototype.hasOwnProperty.call(E, v) ? E[v] : E[v] = g(v);
  }
  function o(v, g) {
    this.h = g;
    for (var E = [], S = !0, I = v.length - 1; 0 <= I; I--) {
      var b = v[I] | 0;
      S && b == g || (E[I] = b, S = !1);
    }
    this.g = E;
  }
  var c = {};
  function u(v) {
    return -128 <= v && 128 > v ? i(v, function(g) {
      return new o([g | 0], 0 > g ? -1 : 0);
    }) : new o([v | 0], 0 > v ? -1 : 0);
  }
  function d(v) {
    if (isNaN(v) || !isFinite(v)) return p;
    if (0 > v) return P(d(-v));
    for (var g = [], E = 1, S = 0; v >= E; S++) g[S] = v / E | 0, E *= 4294967296;
    return new o(g, 0);
  }
  function f(v, g) {
    if (v.length == 0) throw Error("number format error: empty string");
    if (g = g || 10, 2 > g || 36 < g) throw Error("radix out of range: " + g);
    if (v.charAt(0) == "-") return P(f(v.substring(1), g));
    if (0 <= v.indexOf("-")) throw Error('number format error: interior "-" character');
    for (var E = d(Math.pow(g, 8)), S = p, I = 0; I < v.length; I += 8) {
      var b = Math.min(8, v.length - I), y = parseInt(v.substring(I, I + b), g);
      8 > b ? (b = d(Math.pow(g, b)), S = S.j(b).add(d(y))) : (S = S.j(E), S = S.add(d(y)));
    }
    return S;
  }
  var p = u(0), _ = u(1), T = u(16777216);
  t = o.prototype, t.m = function() {
    if (k(this)) return -P(this).m();
    for (var v = 0, g = 1, E = 0; E < this.g.length; E++) {
      var S = this.i(E);
      v += (0 <= S ? S : 4294967296 + S) * g, g *= 4294967296;
    }
    return v;
  }, t.toString = function(v) {
    if (v = v || 10, 2 > v || 36 < v) throw Error("radix out of range: " + v);
    if (w(this)) return "0";
    if (k(this)) return "-" + P(this).toString(v);
    for (var g = d(Math.pow(v, 6)), E = this, S = ""; ; ) {
      var I = ne(E, g).g;
      E = B(E, I.j(g));
      var b = ((0 < E.g.length ? E.g[0] : E.h) >>> 0).toString(v);
      if (E = I, w(E)) return b + S;
      for (; 6 > b.length; ) b = "0" + b;
      S = b + S;
    }
  }, t.i = function(v) {
    return 0 > v ? 0 : v < this.g.length ? this.g[v] : this.h;
  };
  function w(v) {
    if (v.h != 0) return !1;
    for (var g = 0; g < v.g.length; g++) if (v.g[g] != 0) return !1;
    return !0;
  }
  function k(v) {
    return v.h == -1;
  }
  t.l = function(v) {
    return v = B(this, v), k(v) ? -1 : w(v) ? 0 : 1;
  };
  function P(v) {
    for (var g = v.g.length, E = [], S = 0; S < g; S++) E[S] = ~v.g[S];
    return new o(E, ~v.h).add(_);
  }
  t.abs = function() {
    return k(this) ? P(this) : this;
  }, t.add = function(v) {
    for (var g = Math.max(this.g.length, v.g.length), E = [], S = 0, I = 0; I <= g; I++) {
      var b = S + (this.i(I) & 65535) + (v.i(I) & 65535), y = (b >>> 16) + (this.i(I) >>> 16) + (v.i(I) >>> 16);
      S = y >>> 16, b &= 65535, y &= 65535, E[I] = y << 16 | b;
    }
    return new o(E, E[E.length - 1] & -2147483648 ? -1 : 0);
  };
  function B(v, g) {
    return v.add(P(g));
  }
  t.j = function(v) {
    if (w(this) || w(v)) return p;
    if (k(this)) return k(v) ? P(this).j(P(v)) : P(P(this).j(v));
    if (k(v)) return P(this.j(P(v)));
    if (0 > this.l(T) && 0 > v.l(T)) return d(this.m() * v.m());
    for (var g = this.g.length + v.g.length, E = [], S = 0; S < 2 * g; S++) E[S] = 0;
    for (S = 0; S < this.g.length; S++) for (var I = 0; I < v.g.length; I++) {
      var b = this.i(S) >>> 16, y = this.i(S) & 65535, ke = v.i(I) >>> 16, rt = v.i(I) & 65535;
      E[2 * S + 2 * I] += y * rt, U(E, 2 * S + 2 * I), E[2 * S + 2 * I + 1] += b * rt, U(E, 2 * S + 2 * I + 1), E[2 * S + 2 * I + 1] += y * ke, U(E, 2 * S + 2 * I + 1), E[2 * S + 2 * I + 2] += b * ke, U(E, 2 * S + 2 * I + 2);
    }
    for (S = 0; S < g; S++) E[S] = E[2 * S + 1] << 16 | E[2 * S];
    for (S = g; S < 2 * g; S++) E[S] = 0;
    return new o(E, 0);
  };
  function U(v, g) {
    for (; (v[g] & 65535) != v[g]; ) v[g + 1] += v[g] >>> 16, v[g] &= 65535, g++;
  }
  function H(v, g) {
    this.g = v, this.h = g;
  }
  function ne(v, g) {
    if (w(g)) throw Error("division by zero");
    if (w(v)) return new H(p, p);
    if (k(v)) return g = ne(P(v), g), new H(P(g.g), P(g.h));
    if (k(g)) return g = ne(v, P(g)), new H(P(g.g), g.h);
    if (30 < v.g.length) {
      if (k(v) || k(g)) throw Error("slowDivide_ only works with positive integers.");
      for (var E = _, S = g; 0 >= S.l(v); ) E = De(E), S = De(S);
      var I = ce(E, 1), b = ce(S, 1);
      for (S = ce(S, 2), E = ce(E, 2); !w(S); ) {
        var y = b.add(S);
        0 >= y.l(v) && (I = I.add(E), b = y), S = ce(S, 1), E = ce(E, 1);
      }
      return g = B(v, I.j(g)), new H(I, g);
    }
    for (I = p; 0 <= v.l(g); ) {
      for (E = Math.max(1, Math.floor(v.m() / g.m())), S = Math.ceil(Math.log(E) / Math.LN2), S = 48 >= S ? 1 : Math.pow(2, S - 48), b = d(E), y = b.j(g); k(y) || 0 < y.l(v); ) E -= S, b = d(E), y = b.j(g);
      w(b) && (b = _), I = I.add(b), v = B(v, y);
    }
    return new H(I, v);
  }
  t.A = function(v) {
    return ne(this, v).h;
  }, t.and = function(v) {
    for (var g = Math.max(this.g.length, v.g.length), E = [], S = 0; S < g; S++) E[S] = this.i(S) & v.i(S);
    return new o(E, this.h & v.h);
  }, t.or = function(v) {
    for (var g = Math.max(this.g.length, v.g.length), E = [], S = 0; S < g; S++) E[S] = this.i(S) | v.i(S);
    return new o(E, this.h | v.h);
  }, t.xor = function(v) {
    for (var g = Math.max(this.g.length, v.g.length), E = [], S = 0; S < g; S++) E[S] = this.i(S) ^ v.i(S);
    return new o(E, this.h ^ v.h);
  };
  function De(v) {
    for (var g = v.g.length + 1, E = [], S = 0; S < g; S++) E[S] = v.i(S) << 1 | v.i(S - 1) >>> 31;
    return new o(E, v.h);
  }
  function ce(v, g) {
    var E = g >> 5;
    g %= 32;
    for (var S = v.g.length - E, I = [], b = 0; b < S; b++) I[b] = 0 < g ? v.i(b + E) >>> g | v.i(b + E + 1) << 32 - g : v.i(b + E);
    return new o(I, v.h);
  }
  r.prototype.digest = r.prototype.v, r.prototype.reset = r.prototype.s, r.prototype.update = r.prototype.u, o.prototype.add = o.prototype.add, o.prototype.multiply = o.prototype.j, o.prototype.modulo = o.prototype.A, o.prototype.compare = o.prototype.l, o.prototype.toNumber = o.prototype.m, o.prototype.toString = o.prototype.toString, o.prototype.getBits = o.prototype.i, o.fromNumber = d, o.fromString = f, Hl = o;
}).apply(typeof Zf < "u" ? Zf : typeof self < "u" ? self : typeof window < "u" ? window : {});
var lo = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var P_, Ms, D_, No, xu, k_, N_, O_;
(function() {
  var t, e = typeof Object.defineProperties == "function" ? Object.defineProperty : function(a, l, h) {
    return a == Array.prototype || a == Object.prototype || (a[l] = h.value), a;
  };
  function n(a) {
    a = [typeof globalThis == "object" && globalThis, a, typeof window == "object" && window, typeof self == "object" && self, typeof lo == "object" && lo];
    for (var l = 0; l < a.length; ++l) {
      var h = a[l];
      if (h && h.Math == Math) return h;
    }
    throw Error("Cannot find global object");
  }
  var r = n(this);
  function s(a, l) {
    if (l) e: {
      var h = r;
      a = a.split(".");
      for (var m = 0; m < a.length - 1; m++) {
        var A = a[m];
        if (!(A in h)) break e;
        h = h[A];
      }
      a = a[a.length - 1], m = h[a], l = l(m), l != m && l != null && e(h, a, { configurable: !0, writable: !0, value: l });
    }
  }
  function i(a, l) {
    a instanceof String && (a += "");
    var h = 0, m = !1, A = { next: function() {
      if (!m && h < a.length) {
        var R = h++;
        return { value: l(R, a[R]), done: !1 };
      }
      return m = !0, { done: !0, value: void 0 };
    } };
    return A[Symbol.iterator] = function() {
      return A;
    }, A;
  }
  s("Array.prototype.values", function(a) {
    return a || function() {
      return i(this, function(l, h) {
        return h;
      });
    };
  });
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  var o = o || {}, c = this || self;
  function u(a) {
    var l = typeof a;
    return l = l != "object" ? l : a ? Array.isArray(a) ? "array" : l : "null", l == "array" || l == "object" && typeof a.length == "number";
  }
  function d(a) {
    var l = typeof a;
    return l == "object" && a != null || l == "function";
  }
  function f(a, l, h) {
    return a.call.apply(a.bind, arguments);
  }
  function p(a, l, h) {
    if (!a) throw Error();
    if (2 < arguments.length) {
      var m = Array.prototype.slice.call(arguments, 2);
      return function() {
        var A = Array.prototype.slice.call(arguments);
        return Array.prototype.unshift.apply(A, m), a.apply(l, A);
      };
    }
    return function() {
      return a.apply(l, arguments);
    };
  }
  function _(a, l, h) {
    return _ = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? f : p, _.apply(null, arguments);
  }
  function T(a, l) {
    var h = Array.prototype.slice.call(arguments, 1);
    return function() {
      var m = h.slice();
      return m.push.apply(m, arguments), a.apply(this, m);
    };
  }
  function w(a, l) {
    function h() {
    }
    h.prototype = l.prototype, a.aa = l.prototype, a.prototype = new h(), a.prototype.constructor = a, a.Qb = function(m, A, R) {
      for (var O = Array(arguments.length - 2), ie = 2; ie < arguments.length; ie++) O[ie - 2] = arguments[ie];
      return l.prototype[A].apply(m, O);
    };
  }
  function k(a) {
    const l = a.length;
    if (0 < l) {
      const h = Array(l);
      for (let m = 0; m < l; m++) h[m] = a[m];
      return h;
    }
    return [];
  }
  function P(a, l) {
    for (let h = 1; h < arguments.length; h++) {
      const m = arguments[h];
      if (u(m)) {
        const A = a.length || 0, R = m.length || 0;
        a.length = A + R;
        for (let O = 0; O < R; O++) a[A + O] = m[O];
      } else a.push(m);
    }
  }
  class B {
    constructor(l, h) {
      this.i = l, this.j = h, this.h = 0, this.g = null;
    }
    get() {
      let l;
      return 0 < this.h ? (this.h--, l = this.g, this.g = l.next, l.next = null) : l = this.i(), l;
    }
  }
  function U(a) {
    return /^[\s\xa0]*$/.test(a);
  }
  function H() {
    var a = c.navigator;
    return a && (a = a.userAgent) ? a : "";
  }
  function ne(a) {
    return ne[" "](a), a;
  }
  ne[" "] = function() {
  };
  var De = H().indexOf("Gecko") != -1 && !(H().toLowerCase().indexOf("webkit") != -1 && H().indexOf("Edge") == -1) && !(H().indexOf("Trident") != -1 || H().indexOf("MSIE") != -1) && H().indexOf("Edge") == -1;
  function ce(a, l, h) {
    for (const m in a) l.call(h, a[m], m, a);
  }
  function v(a, l) {
    for (const h in a) l.call(void 0, a[h], h, a);
  }
  function g(a) {
    const l = {};
    for (const h in a) l[h] = a[h];
    return l;
  }
  const E = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
  function S(a, l) {
    let h, m;
    for (let A = 1; A < arguments.length; A++) {
      m = arguments[A];
      for (h in m) a[h] = m[h];
      for (let R = 0; R < E.length; R++) h = E[R], Object.prototype.hasOwnProperty.call(m, h) && (a[h] = m[h]);
    }
  }
  function I(a) {
    var l = 1;
    a = a.split(":");
    const h = [];
    for (; 0 < l && a.length; ) h.push(a.shift()), l--;
    return a.length && h.push(a.join(":")), h;
  }
  function b(a) {
    c.setTimeout(() => {
      throw a;
    }, 0);
  }
  function y() {
    var a = ye;
    let l = null;
    return a.g && (l = a.g, a.g = a.g.next, a.g || (a.h = null), l.next = null), l;
  }
  class ke {
    constructor() {
      this.h = this.g = null;
    }
    add(l, h) {
      const m = rt.get();
      m.set(l, h), this.h ? this.h.next = m : this.g = m, this.h = m;
    }
  }
  var rt = new B(() => new st(), (a) => a.reset());
  class st {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(l, h) {
      this.h = l, this.g = h, this.next = null;
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let Qe, K = !1, ye = new ke(), W = () => {
    const a = c.Promise.resolve(void 0);
    Qe = () => {
      a.then(ze);
    };
  };
  var ze = () => {
    for (var a; a = y(); ) {
      try {
        a.h.call(a.g);
      } catch (h) {
        b(h);
      }
      var l = rt;
      l.j(a), 100 > l.h && (l.h++, a.next = l.g, l.g = a);
    }
    K = !1;
  };
  function pe() {
    this.s = this.s, this.C = this.C;
  }
  pe.prototype.s = !1, pe.prototype.ma = function() {
    this.s || (this.s = !0, this.N());
  }, pe.prototype.N = function() {
    if (this.C) for (; this.C.length; ) this.C.shift()();
  };
  function se(a, l) {
    this.type = a, this.g = this.target = l, this.defaultPrevented = !1;
  }
  se.prototype.h = function() {
    this.defaultPrevented = !0;
  };
  var xt = function() {
    if (!c.addEventListener || !Object.defineProperty) return !1;
    var a = !1, l = Object.defineProperty({}, "passive", { get: function() {
      a = !0;
    } });
    try {
      const h = () => {
      };
      c.addEventListener("test", h, l), c.removeEventListener("test", h, l);
    } catch {
    }
    return a;
  }();
  function We(a, l) {
    if (se.call(this, a ? a.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, a) {
      var h = this.type = a.type, m = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
      if (this.target = a.target || a.srcElement, this.g = l, l = a.relatedTarget) {
        if (De) {
          e: {
            try {
              ne(l.nodeName);
              var A = !0;
              break e;
            } catch {
            }
            A = !1;
          }
          A || (l = null);
        }
      } else h == "mouseover" ? l = a.fromElement : h == "mouseout" && (l = a.toElement);
      this.relatedTarget = l, m ? (this.clientX = m.clientX !== void 0 ? m.clientX : m.pageX, this.clientY = m.clientY !== void 0 ? m.clientY : m.pageY, this.screenX = m.screenX || 0, this.screenY = m.screenY || 0) : (this.clientX = a.clientX !== void 0 ? a.clientX : a.pageX, this.clientY = a.clientY !== void 0 ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0), this.button = a.button, this.key = a.key || "", this.ctrlKey = a.ctrlKey, this.altKey = a.altKey, this.shiftKey = a.shiftKey, this.metaKey = a.metaKey, this.pointerId = a.pointerId || 0, this.pointerType = typeof a.pointerType == "string" ? a.pointerType : xi[a.pointerType] || "", this.state = a.state, this.i = a, a.defaultPrevented && We.aa.h.call(this);
    }
  }
  w(We, se);
  var xi = { 2: "touch", 3: "pen", 4: "mouse" };
  We.prototype.h = function() {
    We.aa.h.call(this);
    var a = this.i;
    a.preventDefault ? a.preventDefault() : a.returnValue = !1;
  };
  var wt = "closure_listenable_" + (1e6 * Math.random() | 0), Vi = 0;
  function oc(a, l, h, m, A) {
    this.listener = a, this.proxy = null, this.src = l, this.type = h, this.capture = !!m, this.ha = A, this.key = ++Vi, this.da = this.fa = !1;
  }
  function Ui(a) {
    a.da = !0, a.listener = null, a.proxy = null, a.src = null, a.ha = null;
  }
  function Fi(a) {
    this.src = a, this.g = {}, this.h = 0;
  }
  Fi.prototype.add = function(a, l, h, m, A) {
    var R = a.toString();
    a = this.g[R], a || (a = this.g[R] = [], this.h++);
    var O = cc(a, l, m, A);
    return -1 < O ? (l = a[O], h || (l.fa = !1)) : (l = new oc(l, this.src, R, !!m, A), l.fa = h, a.push(l)), l;
  };
  function ac(a, l) {
    var h = l.type;
    if (h in a.g) {
      var m = a.g[h], A = Array.prototype.indexOf.call(m, l, void 0), R;
      (R = 0 <= A) && Array.prototype.splice.call(m, A, 1), R && (Ui(l), a.g[h].length == 0 && (delete a.g[h], a.h--));
    }
  }
  function cc(a, l, h, m) {
    for (var A = 0; A < a.length; ++A) {
      var R = a[A];
      if (!R.da && R.listener == l && R.capture == !!h && R.ha == m) return A;
    }
    return -1;
  }
  var uc = "closure_lm_" + (1e6 * Math.random() | 0), lc = {};
  function Cd(a, l, h, m, A) {
    if (Array.isArray(l)) {
      for (var R = 0; R < l.length; R++) Cd(a, l[R], h, m, A);
      return null;
    }
    return h = kd(h), a && a[wt] ? a.K(l, h, d(m) ? !!m.capture : !1, A) : YE(a, l, h, !1, m, A);
  }
  function YE(a, l, h, m, A, R) {
    if (!l) throw Error("Invalid event type");
    var O = d(A) ? !!A.capture : !!A, ie = hc(a);
    if (ie || (a[uc] = ie = new Fi(a)), h = ie.add(l, h, m, O, R), h.proxy) return h;
    if (m = JE(), h.proxy = m, m.src = a, m.listener = h, a.addEventListener) xt || (A = O), A === void 0 && (A = !1), a.addEventListener(l.toString(), m, A);
    else if (a.attachEvent) a.attachEvent(Dd(l.toString()), m);
    else if (a.addListener && a.removeListener) a.addListener(m);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return h;
  }
  function JE() {
    function a(h) {
      return l.call(a.src, a.listener, h);
    }
    const l = XE;
    return a;
  }
  function Pd(a, l, h, m, A) {
    if (Array.isArray(l)) for (var R = 0; R < l.length; R++) Pd(a, l[R], h, m, A);
    else m = d(m) ? !!m.capture : !!m, h = kd(h), a && a[wt] ? (a = a.i, l = String(l).toString(), l in a.g && (R = a.g[l], h = cc(R, h, m, A), -1 < h && (Ui(R[h]), Array.prototype.splice.call(R, h, 1), R.length == 0 && (delete a.g[l], a.h--)))) : a && (a = hc(a)) && (l = a.g[l.toString()], a = -1, l && (a = cc(l, h, m, A)), (h = -1 < a ? l[a] : null) && dc(h));
  }
  function dc(a) {
    if (typeof a != "number" && a && !a.da) {
      var l = a.src;
      if (l && l[wt]) ac(l.i, a);
      else {
        var h = a.type, m = a.proxy;
        l.removeEventListener ? l.removeEventListener(h, m, a.capture) : l.detachEvent ? l.detachEvent(Dd(h), m) : l.addListener && l.removeListener && l.removeListener(m), (h = hc(l)) ? (ac(h, a), h.h == 0 && (h.src = null, l[uc] = null)) : Ui(a);
      }
    }
  }
  function Dd(a) {
    return a in lc ? lc[a] : lc[a] = "on" + a;
  }
  function XE(a, l) {
    if (a.da) a = !0;
    else {
      l = new We(l, this);
      var h = a.listener, m = a.ha || a.src;
      a.fa && dc(a), a = h.call(m, l);
    }
    return a;
  }
  function hc(a) {
    return a = a[uc], a instanceof Fi ? a : null;
  }
  var fc = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
  function kd(a) {
    return typeof a == "function" ? a : (a[fc] || (a[fc] = function(l) {
      return a.handleEvent(l);
    }), a[fc]);
  }
  function Ve() {
    pe.call(this), this.i = new Fi(this), this.M = this, this.F = null;
  }
  w(Ve, pe), Ve.prototype[wt] = !0, Ve.prototype.removeEventListener = function(a, l, h, m) {
    Pd(this, a, l, h, m);
  };
  function Ke(a, l) {
    var h, m = a.F;
    if (m) for (h = []; m; m = m.F) h.push(m);
    if (a = a.M, m = l.type || l, typeof l == "string") l = new se(l, a);
    else if (l instanceof se) l.target = l.target || a;
    else {
      var A = l;
      l = new se(m, a), S(l, A);
    }
    if (A = !0, h) for (var R = h.length - 1; 0 <= R; R--) {
      var O = l.g = h[R];
      A = Bi(O, m, !0, l) && A;
    }
    if (O = l.g = a, A = Bi(O, m, !0, l) && A, A = Bi(O, m, !1, l) && A, h) for (R = 0; R < h.length; R++) O = l.g = h[R], A = Bi(O, m, !1, l) && A;
  }
  Ve.prototype.N = function() {
    if (Ve.aa.N.call(this), this.i) {
      var a = this.i, l;
      for (l in a.g) {
        for (var h = a.g[l], m = 0; m < h.length; m++) Ui(h[m]);
        delete a.g[l], a.h--;
      }
    }
    this.F = null;
  }, Ve.prototype.K = function(a, l, h, m) {
    return this.i.add(String(a), l, !1, h, m);
  }, Ve.prototype.L = function(a, l, h, m) {
    return this.i.add(String(a), l, !0, h, m);
  };
  function Bi(a, l, h, m) {
    if (l = a.i.g[String(l)], !l) return !0;
    l = l.concat();
    for (var A = !0, R = 0; R < l.length; ++R) {
      var O = l[R];
      if (O && !O.da && O.capture == h) {
        var ie = O.listener, Ne = O.ha || O.src;
        O.fa && ac(a.i, O), A = ie.call(Ne, m) !== !1 && A;
      }
    }
    return A && !m.defaultPrevented;
  }
  function Nd(a, l, h) {
    if (typeof a == "function") h && (a = _(a, h));
    else if (a && typeof a.handleEvent == "function") a = _(a.handleEvent, a);
    else throw Error("Invalid listener argument");
    return 2147483647 < Number(l) ? -1 : c.setTimeout(a, l || 0);
  }
  function Od(a) {
    a.g = Nd(() => {
      a.g = null, a.i && (a.i = !1, Od(a));
    }, a.l);
    const l = a.h;
    a.h = null, a.m.apply(null, l);
  }
  class QE extends pe {
    constructor(l, h) {
      super(), this.m = l, this.l = h, this.h = null, this.i = !1, this.g = null;
    }
    j(l) {
      this.h = arguments, this.g ? this.i = !0 : Od(this);
    }
    N() {
      super.N(), this.g && (c.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
    }
  }
  function ps(a) {
    pe.call(this), this.h = a, this.g = {};
  }
  w(ps, pe);
  var Md = [];
  function Ld(a) {
    ce(a.g, function(l, h) {
      this.g.hasOwnProperty(h) && dc(l);
    }, a), a.g = {};
  }
  ps.prototype.N = function() {
    ps.aa.N.call(this), Ld(this);
  }, ps.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
  };
  var pc = c.JSON.stringify, ZE = c.JSON.parse, ev = class {
    stringify(a) {
      return c.JSON.stringify(a, void 0);
    }
    parse(a) {
      return c.JSON.parse(a, void 0);
    }
  };
  function mc() {
  }
  mc.prototype.h = null;
  function xd(a) {
    return a.h || (a.h = a.i());
  }
  function Vd() {
  }
  var ms = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
  function gc() {
    se.call(this, "d");
  }
  w(gc, se);
  function _c() {
    se.call(this, "c");
  }
  w(_c, se);
  var xn = {}, Ud = null;
  function $i() {
    return Ud = Ud || new Ve();
  }
  xn.La = "serverreachability";
  function Fd(a) {
    se.call(this, xn.La, a);
  }
  w(Fd, se);
  function gs(a) {
    const l = $i();
    Ke(l, new Fd(l));
  }
  xn.STAT_EVENT = "statevent";
  function Bd(a, l) {
    se.call(this, xn.STAT_EVENT, a), this.stat = l;
  }
  w(Bd, se);
  function Ye(a) {
    const l = $i();
    Ke(l, new Bd(l, a));
  }
  xn.Ma = "timingevent";
  function $d(a, l) {
    se.call(this, xn.Ma, a), this.size = l;
  }
  w($d, se);
  function _s(a, l) {
    if (typeof a != "function") throw Error("Fn must not be null and must be a function");
    return c.setTimeout(function() {
      a();
    }, l);
  }
  function ys() {
    this.g = !0;
  }
  ys.prototype.xa = function() {
    this.g = !1;
  };
  function tv(a, l, h, m, A, R) {
    a.info(function() {
      if (a.g) if (R)
        for (var O = "", ie = R.split("&"), Ne = 0; Ne < ie.length; Ne++) {
          var Q = ie[Ne].split("=");
          if (1 < Q.length) {
            var Ue = Q[0];
            Q = Q[1];
            var Fe = Ue.split("_");
            O = 2 <= Fe.length && Fe[1] == "type" ? O + (Ue + "=" + Q + "&") : O + (Ue + "=redacted&");
          }
        }
      else O = null;
      else O = R;
      return "XMLHTTP REQ (" + m + ") [attempt " + A + "]: " + l + `
` + h + `
` + O;
    });
  }
  function nv(a, l, h, m, A, R, O) {
    a.info(function() {
      return "XMLHTTP RESP (" + m + ") [ attempt " + A + "]: " + l + `
` + h + `
` + R + " " + O;
    });
  }
  function vr(a, l, h, m) {
    a.info(function() {
      return "XMLHTTP TEXT (" + l + "): " + sv(a, h) + (m ? " " + m : "");
    });
  }
  function rv(a, l) {
    a.info(function() {
      return "TIMEOUT: " + l;
    });
  }
  ys.prototype.info = function() {
  };
  function sv(a, l) {
    if (!a.g) return l;
    if (!l) return null;
    try {
      var h = JSON.parse(l);
      if (h) {
        for (a = 0; a < h.length; a++) if (Array.isArray(h[a])) {
          var m = h[a];
          if (!(2 > m.length)) {
            var A = m[1];
            if (Array.isArray(A) && !(1 > A.length)) {
              var R = A[0];
              if (R != "noop" && R != "stop" && R != "close") for (var O = 1; O < A.length; O++) A[O] = "";
            }
          }
        }
      }
      return pc(h);
    } catch {
      return l;
    }
  }
  var ji = { NO_ERROR: 0, gb: 1, tb: 2, sb: 3, nb: 4, rb: 5, ub: 6, Ia: 7, TIMEOUT: 8, xb: 9 }, jd = { lb: "complete", Hb: "success", Ja: "error", Ia: "abort", zb: "ready", Ab: "readystatechange", TIMEOUT: "timeout", vb: "incrementaldata", yb: "progress", ob: "downloadprogress", Pb: "uploadprogress" }, yc;
  function Hi() {
  }
  w(Hi, mc), Hi.prototype.g = function() {
    return new XMLHttpRequest();
  }, Hi.prototype.i = function() {
    return {};
  }, yc = new Hi();
  function sn(a, l, h, m) {
    this.j = a, this.i = l, this.l = h, this.R = m || 1, this.U = new ps(this), this.I = 45e3, this.H = null, this.o = !1, this.m = this.A = this.v = this.L = this.F = this.S = this.B = null, this.D = [], this.g = null, this.C = 0, this.s = this.u = null, this.X = -1, this.J = !1, this.O = 0, this.M = null, this.W = this.K = this.T = this.P = !1, this.h = new Hd();
  }
  function Hd() {
    this.i = null, this.g = "", this.h = !1;
  }
  var Gd = {}, Ec = {};
  function vc(a, l, h) {
    a.L = 1, a.v = Wi(Vt(l)), a.m = h, a.P = !0, qd(a, null);
  }
  function qd(a, l) {
    a.F = Date.now(), Gi(a), a.A = Vt(a.v);
    var h = a.A, m = a.R;
    Array.isArray(m) || (m = [String(m)]), ih(h.i, "t", m), a.C = 0, h = a.j.J, a.h = new Hd(), a.g = Ih(a.j, h ? l : null, !a.m), 0 < a.O && (a.M = new QE(_(a.Y, a, a.g), a.O)), l = a.U, h = a.g, m = a.ca;
    var A = "readystatechange";
    Array.isArray(A) || (A && (Md[0] = A.toString()), A = Md);
    for (var R = 0; R < A.length; R++) {
      var O = Cd(h, A[R], m || l.handleEvent, !1, l.h || l);
      if (!O) break;
      l.g[O.key] = O;
    }
    l = a.H ? g(a.H) : {}, a.m ? (a.u || (a.u = "POST"), l["Content-Type"] = "application/x-www-form-urlencoded", a.g.ea(
      a.A,
      a.u,
      a.m,
      l
    )) : (a.u = "GET", a.g.ea(a.A, a.u, null, l)), gs(), tv(a.i, a.u, a.A, a.l, a.R, a.m);
  }
  sn.prototype.ca = function(a) {
    a = a.target;
    const l = this.M;
    l && Ut(a) == 3 ? l.j() : this.Y(a);
  }, sn.prototype.Y = function(a) {
    try {
      if (a == this.g) e: {
        const Fe = Ut(this.g);
        var l = this.g.Ba();
        const Ir = this.g.Z();
        if (!(3 > Fe) && (Fe != 3 || this.g && (this.h.h || this.g.oa() || hh(this.g)))) {
          this.J || Fe != 4 || l == 7 || (l == 8 || 0 >= Ir ? gs(3) : gs(2)), Sc(this);
          var h = this.g.Z();
          this.X = h;
          t: if (zd(this)) {
            var m = hh(this.g);
            a = "";
            var A = m.length, R = Ut(this.g) == 4;
            if (!this.h.i) {
              if (typeof TextDecoder > "u") {
                Vn(this), Es(this);
                var O = "";
                break t;
              }
              this.h.i = new c.TextDecoder();
            }
            for (l = 0; l < A; l++) this.h.h = !0, a += this.h.i.decode(m[l], { stream: !(R && l == A - 1) });
            m.length = 0, this.h.g += a, this.C = 0, O = this.h.g;
          } else O = this.g.oa();
          if (this.o = h == 200, nv(this.i, this.u, this.A, this.l, this.R, Fe, h), this.o) {
            if (this.T && !this.K) {
              t: {
                if (this.g) {
                  var ie, Ne = this.g;
                  if ((ie = Ne.g ? Ne.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !U(ie)) {
                    var Q = ie;
                    break t;
                  }
                }
                Q = null;
              }
              if (h = Q) vr(this.i, this.l, h, "Initial handshake response via X-HTTP-Initial-Response"), this.K = !0, Tc(this, h);
              else {
                this.o = !1, this.s = 3, Ye(12), Vn(this), Es(this);
                break e;
              }
            }
            if (this.P) {
              h = !0;
              let mt;
              for (; !this.J && this.C < O.length; ) if (mt = iv(this, O), mt == Ec) {
                Fe == 4 && (this.s = 4, Ye(14), h = !1), vr(this.i, this.l, null, "[Incomplete Response]");
                break;
              } else if (mt == Gd) {
                this.s = 4, Ye(15), vr(this.i, this.l, O, "[Invalid Chunk]"), h = !1;
                break;
              } else vr(this.i, this.l, mt, null), Tc(this, mt);
              if (zd(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), Fe != 4 || O.length != 0 || this.h.h || (this.s = 1, Ye(16), h = !1), this.o = this.o && h, !h) vr(this.i, this.l, O, "[Invalid Chunked Response]"), Vn(this), Es(this);
              else if (0 < O.length && !this.W) {
                this.W = !0;
                var Ue = this.j;
                Ue.g == this && Ue.ba && !Ue.M && (Ue.j.info("Great, no buffering proxy detected. Bytes received: " + O.length), Cc(Ue), Ue.M = !0, Ye(11));
              }
            } else vr(this.i, this.l, O, null), Tc(this, O);
            Fe == 4 && Vn(this), this.o && !this.J && (Fe == 4 ? Eh(this.j, this) : (this.o = !1, Gi(this)));
          } else Tv(this.g), h == 400 && 0 < O.indexOf("Unknown SID") ? (this.s = 3, Ye(12)) : (this.s = 0, Ye(13)), Vn(this), Es(this);
        }
      }
    } catch {
    } finally {
    }
  };
  function zd(a) {
    return a.g ? a.u == "GET" && a.L != 2 && a.j.Ca : !1;
  }
  function iv(a, l) {
    var h = a.C, m = l.indexOf(`
`, h);
    return m == -1 ? Ec : (h = Number(l.substring(h, m)), isNaN(h) ? Gd : (m += 1, m + h > l.length ? Ec : (l = l.slice(m, m + h), a.C = m + h, l)));
  }
  sn.prototype.cancel = function() {
    this.J = !0, Vn(this);
  };
  function Gi(a) {
    a.S = Date.now() + a.I, Wd(a, a.I);
  }
  function Wd(a, l) {
    if (a.B != null) throw Error("WatchDog timer not null");
    a.B = _s(_(a.ba, a), l);
  }
  function Sc(a) {
    a.B && (c.clearTimeout(a.B), a.B = null);
  }
  sn.prototype.ba = function() {
    this.B = null;
    const a = Date.now();
    0 <= a - this.S ? (rv(this.i, this.A), this.L != 2 && (gs(), Ye(17)), Vn(this), this.s = 2, Es(this)) : Wd(this, this.S - a);
  };
  function Es(a) {
    a.j.G == 0 || a.J || Eh(a.j, a);
  }
  function Vn(a) {
    Sc(a);
    var l = a.M;
    l && typeof l.ma == "function" && l.ma(), a.M = null, Ld(a.U), a.g && (l = a.g, a.g = null, l.abort(), l.ma());
  }
  function Tc(a, l) {
    try {
      var h = a.j;
      if (h.G != 0 && (h.g == a || Ic(h.h, a))) {
        if (!a.K && Ic(h.h, a) && h.G == 3) {
          try {
            var m = h.Da.g.parse(l);
          } catch {
            m = null;
          }
          if (Array.isArray(m) && m.length == 3) {
            var A = m;
            if (A[0] == 0) {
              e:
                if (!h.u) {
                  if (h.g) if (h.g.F + 3e3 < a.F) Zi(h), Xi(h);
                  else break e;
                  Rc(h), Ye(18);
                }
            } else h.za = A[1], 0 < h.za - h.T && 37500 > A[2] && h.F && h.v == 0 && !h.C && (h.C = _s(_(h.Za, h), 6e3));
            if (1 >= Jd(h.h) && h.ca) {
              try {
                h.ca();
              } catch {
              }
              h.ca = void 0;
            }
          } else Fn(h, 11);
        } else if ((a.K || h.g == a) && Zi(h), !U(l)) for (A = h.Da.g.parse(l), l = 0; l < A.length; l++) {
          let Q = A[l];
          if (h.T = Q[0], Q = Q[1], h.G == 2) if (Q[0] == "c") {
            h.K = Q[1], h.ia = Q[2];
            const Ue = Q[3];
            Ue != null && (h.la = Ue, h.j.info("VER=" + h.la));
            const Fe = Q[4];
            Fe != null && (h.Aa = Fe, h.j.info("SVER=" + h.Aa));
            const Ir = Q[5];
            Ir != null && typeof Ir == "number" && 0 < Ir && (m = 1.5 * Ir, h.L = m, h.j.info("backChannelRequestTimeoutMs_=" + m)), m = h;
            const mt = a.g;
            if (mt) {
              const to = mt.g ? mt.g.getResponseHeader("X-Client-Wire-Protocol") : null;
              if (to) {
                var R = m.h;
                R.g || to.indexOf("spdy") == -1 && to.indexOf("quic") == -1 && to.indexOf("h2") == -1 || (R.j = R.l, R.g = /* @__PURE__ */ new Set(), R.h && (wc(R, R.h), R.h = null));
              }
              if (m.D) {
                const Pc = mt.g ? mt.g.getResponseHeader("X-HTTP-Session-Id") : null;
                Pc && (m.ya = Pc, ue(m.I, m.D, Pc));
              }
            }
            h.G = 3, h.l && h.l.ua(), h.ba && (h.R = Date.now() - a.F, h.j.info("Handshake RTT: " + h.R + "ms")), m = h;
            var O = a;
            if (m.qa = Th(m, m.J ? m.ia : null, m.W), O.K) {
              Xd(m.h, O);
              var ie = O, Ne = m.L;
              Ne && (ie.I = Ne), ie.B && (Sc(ie), Gi(ie)), m.g = O;
            } else _h(m);
            0 < h.i.length && Qi(h);
          } else Q[0] != "stop" && Q[0] != "close" || Fn(h, 7);
          else h.G == 3 && (Q[0] == "stop" || Q[0] == "close" ? Q[0] == "stop" ? Fn(h, 7) : Ac(h) : Q[0] != "noop" && h.l && h.l.ta(Q), h.v = 0);
        }
      }
      gs(4);
    } catch {
    }
  }
  var ov = class {
    constructor(a, l) {
      this.g = a, this.map = l;
    }
  };
  function Kd(a) {
    this.l = a || 10, c.PerformanceNavigationTiming ? (a = c.performance.getEntriesByType("navigation"), a = 0 < a.length && (a[0].nextHopProtocol == "hq" || a[0].nextHopProtocol == "h2")) : a = !!(c.chrome && c.chrome.loadTimes && c.chrome.loadTimes() && c.chrome.loadTimes().wasFetchedViaSpdy), this.j = a ? this.l : 1, this.g = null, 1 < this.j && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
  }
  function Yd(a) {
    return a.h ? !0 : a.g ? a.g.size >= a.j : !1;
  }
  function Jd(a) {
    return a.h ? 1 : a.g ? a.g.size : 0;
  }
  function Ic(a, l) {
    return a.h ? a.h == l : a.g ? a.g.has(l) : !1;
  }
  function wc(a, l) {
    a.g ? a.g.add(l) : a.h = l;
  }
  function Xd(a, l) {
    a.h && a.h == l ? a.h = null : a.g && a.g.has(l) && a.g.delete(l);
  }
  Kd.prototype.cancel = function() {
    if (this.i = Qd(this), this.h) this.h.cancel(), this.h = null;
    else if (this.g && this.g.size !== 0) {
      for (const a of this.g.values()) a.cancel();
      this.g.clear();
    }
  };
  function Qd(a) {
    if (a.h != null) return a.i.concat(a.h.D);
    if (a.g != null && a.g.size !== 0) {
      let l = a.i;
      for (const h of a.g.values()) l = l.concat(h.D);
      return l;
    }
    return k(a.i);
  }
  function av(a) {
    if (a.V && typeof a.V == "function") return a.V();
    if (typeof Map < "u" && a instanceof Map || typeof Set < "u" && a instanceof Set) return Array.from(a.values());
    if (typeof a == "string") return a.split("");
    if (u(a)) {
      for (var l = [], h = a.length, m = 0; m < h; m++) l.push(a[m]);
      return l;
    }
    l = [], h = 0;
    for (m in a) l[h++] = a[m];
    return l;
  }
  function cv(a) {
    if (a.na && typeof a.na == "function") return a.na();
    if (!a.V || typeof a.V != "function") {
      if (typeof Map < "u" && a instanceof Map) return Array.from(a.keys());
      if (!(typeof Set < "u" && a instanceof Set)) {
        if (u(a) || typeof a == "string") {
          var l = [];
          a = a.length;
          for (var h = 0; h < a; h++) l.push(h);
          return l;
        }
        l = [], h = 0;
        for (const m in a) l[h++] = m;
        return l;
      }
    }
  }
  function Zd(a, l) {
    if (a.forEach && typeof a.forEach == "function") a.forEach(l, void 0);
    else if (u(a) || typeof a == "string") Array.prototype.forEach.call(a, l, void 0);
    else for (var h = cv(a), m = av(a), A = m.length, R = 0; R < A; R++) l.call(void 0, m[R], h && h[R], a);
  }
  var eh = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
  function uv(a, l) {
    if (a) {
      a = a.split("&");
      for (var h = 0; h < a.length; h++) {
        var m = a[h].indexOf("="), A = null;
        if (0 <= m) {
          var R = a[h].substring(0, m);
          A = a[h].substring(m + 1);
        } else R = a[h];
        l(R, A ? decodeURIComponent(A.replace(/\+/g, " ")) : "");
      }
    }
  }
  function Un(a) {
    if (this.g = this.o = this.j = "", this.s = null, this.m = this.l = "", this.h = !1, a instanceof Un) {
      this.h = a.h, qi(this, a.j), this.o = a.o, this.g = a.g, zi(this, a.s), this.l = a.l;
      var l = a.i, h = new Ts();
      h.i = l.i, l.g && (h.g = new Map(l.g), h.h = l.h), th(this, h), this.m = a.m;
    } else a && (l = String(a).match(eh)) ? (this.h = !1, qi(this, l[1] || "", !0), this.o = vs(l[2] || ""), this.g = vs(l[3] || "", !0), zi(this, l[4]), this.l = vs(l[5] || "", !0), th(this, l[6] || "", !0), this.m = vs(l[7] || "")) : (this.h = !1, this.i = new Ts(null, this.h));
  }
  Un.prototype.toString = function() {
    var a = [], l = this.j;
    l && a.push(Ss(l, nh, !0), ":");
    var h = this.g;
    return (h || l == "file") && (a.push("//"), (l = this.o) && a.push(Ss(l, nh, !0), "@"), a.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), h = this.s, h != null && a.push(":", String(h))), (h = this.l) && (this.g && h.charAt(0) != "/" && a.push("/"), a.push(Ss(h, h.charAt(0) == "/" ? hv : dv, !0))), (h = this.i.toString()) && a.push("?", h), (h = this.m) && a.push("#", Ss(h, pv)), a.join("");
  };
  function Vt(a) {
    return new Un(a);
  }
  function qi(a, l, h) {
    a.j = h ? vs(l, !0) : l, a.j && (a.j = a.j.replace(/:$/, ""));
  }
  function zi(a, l) {
    if (l) {
      if (l = Number(l), isNaN(l) || 0 > l) throw Error("Bad port number " + l);
      a.s = l;
    } else a.s = null;
  }
  function th(a, l, h) {
    l instanceof Ts ? (a.i = l, mv(a.i, a.h)) : (h || (l = Ss(l, fv)), a.i = new Ts(l, a.h));
  }
  function ue(a, l, h) {
    a.i.set(l, h);
  }
  function Wi(a) {
    return ue(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36)), a;
  }
  function vs(a, l) {
    return a ? l ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : "";
  }
  function Ss(a, l, h) {
    return typeof a == "string" ? (a = encodeURI(a).replace(l, lv), h && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
  }
  function lv(a) {
    return a = a.charCodeAt(0), "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
  }
  var nh = /[#\/\?@]/g, dv = /[#\?:]/g, hv = /[#\?]/g, fv = /[#\?@]/g, pv = /#/g;
  function Ts(a, l) {
    this.h = this.g = null, this.i = a || null, this.j = !!l;
  }
  function on(a) {
    a.g || (a.g = /* @__PURE__ */ new Map(), a.h = 0, a.i && uv(a.i, function(l, h) {
      a.add(decodeURIComponent(l.replace(/\+/g, " ")), h);
    }));
  }
  t = Ts.prototype, t.add = function(a, l) {
    on(this), this.i = null, a = Sr(this, a);
    var h = this.g.get(a);
    return h || this.g.set(a, h = []), h.push(l), this.h += 1, this;
  };
  function rh(a, l) {
    on(a), l = Sr(a, l), a.g.has(l) && (a.i = null, a.h -= a.g.get(l).length, a.g.delete(l));
  }
  function sh(a, l) {
    return on(a), l = Sr(a, l), a.g.has(l);
  }
  t.forEach = function(a, l) {
    on(this), this.g.forEach(function(h, m) {
      h.forEach(function(A) {
        a.call(l, A, m, this);
      }, this);
    }, this);
  }, t.na = function() {
    on(this);
    const a = Array.from(this.g.values()), l = Array.from(this.g.keys()), h = [];
    for (let m = 0; m < l.length; m++) {
      const A = a[m];
      for (let R = 0; R < A.length; R++) h.push(l[m]);
    }
    return h;
  }, t.V = function(a) {
    on(this);
    let l = [];
    if (typeof a == "string") sh(this, a) && (l = l.concat(this.g.get(Sr(this, a))));
    else {
      a = Array.from(this.g.values());
      for (let h = 0; h < a.length; h++) l = l.concat(a[h]);
    }
    return l;
  }, t.set = function(a, l) {
    return on(this), this.i = null, a = Sr(this, a), sh(this, a) && (this.h -= this.g.get(a).length), this.g.set(a, [l]), this.h += 1, this;
  }, t.get = function(a, l) {
    return a ? (a = this.V(a), 0 < a.length ? String(a[0]) : l) : l;
  };
  function ih(a, l, h) {
    rh(a, l), 0 < h.length && (a.i = null, a.g.set(Sr(a, l), k(h)), a.h += h.length);
  }
  t.toString = function() {
    if (this.i) return this.i;
    if (!this.g) return "";
    const a = [], l = Array.from(this.g.keys());
    for (var h = 0; h < l.length; h++) {
      var m = l[h];
      const R = encodeURIComponent(String(m)), O = this.V(m);
      for (m = 0; m < O.length; m++) {
        var A = R;
        O[m] !== "" && (A += "=" + encodeURIComponent(String(O[m]))), a.push(A);
      }
    }
    return this.i = a.join("&");
  };
  function Sr(a, l) {
    return l = String(l), a.j && (l = l.toLowerCase()), l;
  }
  function mv(a, l) {
    l && !a.j && (on(a), a.i = null, a.g.forEach(function(h, m) {
      var A = m.toLowerCase();
      m != A && (rh(this, m), ih(this, A, h));
    }, a)), a.j = l;
  }
  function gv(a, l) {
    const h = new ys();
    if (c.Image) {
      const m = new Image();
      m.onload = T(an, h, "TestLoadImage: loaded", !0, l, m), m.onerror = T(an, h, "TestLoadImage: error", !1, l, m), m.onabort = T(an, h, "TestLoadImage: abort", !1, l, m), m.ontimeout = T(an, h, "TestLoadImage: timeout", !1, l, m), c.setTimeout(function() {
        m.ontimeout && m.ontimeout();
      }, 1e4), m.src = a;
    } else l(!1);
  }
  function _v(a, l) {
    const h = new ys(), m = new AbortController(), A = setTimeout(() => {
      m.abort(), an(h, "TestPingServer: timeout", !1, l);
    }, 1e4);
    fetch(a, { signal: m.signal }).then((R) => {
      clearTimeout(A), R.ok ? an(h, "TestPingServer: ok", !0, l) : an(h, "TestPingServer: server error", !1, l);
    }).catch(() => {
      clearTimeout(A), an(h, "TestPingServer: error", !1, l);
    });
  }
  function an(a, l, h, m, A) {
    try {
      A && (A.onload = null, A.onerror = null, A.onabort = null, A.ontimeout = null), m(h);
    } catch {
    }
  }
  function yv() {
    this.g = new ev();
  }
  function Ev(a, l, h) {
    const m = h || "";
    try {
      Zd(a, function(A, R) {
        let O = A;
        d(A) && (O = pc(A)), l.push(m + R + "=" + encodeURIComponent(O));
      });
    } catch (A) {
      throw l.push(m + "type=" + encodeURIComponent("_badmap")), A;
    }
  }
  function Ki(a) {
    this.l = a.Ub || null, this.j = a.eb || !1;
  }
  w(Ki, mc), Ki.prototype.g = function() {
    return new Yi(this.l, this.j);
  }, Ki.prototype.i = /* @__PURE__ */ function(a) {
    return function() {
      return a;
    };
  }({});
  function Yi(a, l) {
    Ve.call(this), this.D = a, this.o = l, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.u = new Headers(), this.h = null, this.B = "GET", this.A = "", this.g = !1, this.v = this.j = this.l = null;
  }
  w(Yi, Ve), t = Yi.prototype, t.open = function(a, l) {
    if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
    this.B = a, this.A = l, this.readyState = 1, ws(this);
  }, t.send = function(a) {
    if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
    this.g = !0;
    const l = { headers: this.u, method: this.B, credentials: this.m, cache: void 0 };
    a && (l.body = a), (this.D || c).fetch(new Request(this.A, l)).then(this.Sa.bind(this), this.ga.bind(this));
  }, t.abort = function() {
    this.response = this.responseText = "", this.u = new Headers(), this.status = 0, this.j && this.j.cancel("Request was aborted.").catch(() => {
    }), 1 <= this.readyState && this.g && this.readyState != 4 && (this.g = !1, Is(this)), this.readyState = 0;
  }, t.Sa = function(a) {
    if (this.g && (this.l = a, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a.headers, this.readyState = 2, ws(this)), this.g && (this.readyState = 3, ws(this), this.g))) if (this.responseType === "arraybuffer") a.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
    else if (typeof c.ReadableStream < "u" && "body" in a) {
      if (this.j = a.body.getReader(), this.o) {
        if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else this.response = this.responseText = "", this.v = new TextDecoder();
      oh(this);
    } else a.text().then(this.Ra.bind(this), this.ga.bind(this));
  };
  function oh(a) {
    a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a));
  }
  t.Pa = function(a) {
    if (this.g) {
      if (this.o && a.value) this.response.push(a.value);
      else if (!this.o) {
        var l = a.value ? a.value : new Uint8Array(0);
        (l = this.v.decode(l, { stream: !a.done })) && (this.response = this.responseText += l);
      }
      a.done ? Is(this) : ws(this), this.readyState == 3 && oh(this);
    }
  }, t.Ra = function(a) {
    this.g && (this.response = this.responseText = a, Is(this));
  }, t.Qa = function(a) {
    this.g && (this.response = a, Is(this));
  }, t.ga = function() {
    this.g && Is(this);
  };
  function Is(a) {
    a.readyState = 4, a.l = null, a.j = null, a.v = null, ws(a);
  }
  t.setRequestHeader = function(a, l) {
    this.u.append(a, l);
  }, t.getResponseHeader = function(a) {
    return this.h && this.h.get(a.toLowerCase()) || "";
  }, t.getAllResponseHeaders = function() {
    if (!this.h) return "";
    const a = [], l = this.h.entries();
    for (var h = l.next(); !h.done; ) h = h.value, a.push(h[0] + ": " + h[1]), h = l.next();
    return a.join(`\r
`);
  };
  function ws(a) {
    a.onreadystatechange && a.onreadystatechange.call(a);
  }
  Object.defineProperty(Yi.prototype, "withCredentials", { get: function() {
    return this.m === "include";
  }, set: function(a) {
    this.m = a ? "include" : "same-origin";
  } });
  function ah(a) {
    let l = "";
    return ce(a, function(h, m) {
      l += m, l += ":", l += h, l += `\r
`;
    }), l;
  }
  function bc(a, l, h) {
    e: {
      for (m in h) {
        var m = !1;
        break e;
      }
      m = !0;
    }
    m || (h = ah(h), typeof a == "string" ? h != null && encodeURIComponent(String(h)) : ue(a, l, h));
  }
  function me(a) {
    Ve.call(this), this.headers = /* @__PURE__ */ new Map(), this.o = a || null, this.h = !1, this.v = this.g = null, this.D = "", this.m = 0, this.l = "", this.j = this.B = this.u = this.A = !1, this.I = null, this.H = "", this.J = !1;
  }
  w(me, Ve);
  var vv = /^https?$/i, Sv = ["POST", "PUT"];
  t = me.prototype, t.Ha = function(a) {
    this.J = a;
  }, t.ea = function(a, l, h, m) {
    if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + a);
    l = l ? l.toUpperCase() : "GET", this.D = a, this.l = "", this.m = 0, this.A = !1, this.h = !0, this.g = this.o ? this.o.g() : yc.g(), this.v = this.o ? xd(this.o) : xd(yc), this.g.onreadystatechange = _(this.Ea, this);
    try {
      this.B = !0, this.g.open(l, String(a), !0), this.B = !1;
    } catch (R) {
      ch(this, R);
      return;
    }
    if (a = h || "", h = new Map(this.headers), m) if (Object.getPrototypeOf(m) === Object.prototype) for (var A in m) h.set(A, m[A]);
    else if (typeof m.keys == "function" && typeof m.get == "function") for (const R of m.keys()) h.set(R, m.get(R));
    else throw Error("Unknown input type for opt_headers: " + String(m));
    m = Array.from(h.keys()).find((R) => R.toLowerCase() == "content-type"), A = c.FormData && a instanceof c.FormData, !(0 <= Array.prototype.indexOf.call(Sv, l, void 0)) || m || A || h.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    for (const [R, O] of h) this.g.setRequestHeader(R, O);
    this.H && (this.g.responseType = this.H), "withCredentials" in this.g && this.g.withCredentials !== this.J && (this.g.withCredentials = this.J);
    try {
      dh(this), this.u = !0, this.g.send(a), this.u = !1;
    } catch (R) {
      ch(this, R);
    }
  };
  function ch(a, l) {
    a.h = !1, a.g && (a.j = !0, a.g.abort(), a.j = !1), a.l = l, a.m = 5, uh(a), Ji(a);
  }
  function uh(a) {
    a.A || (a.A = !0, Ke(a, "complete"), Ke(a, "error"));
  }
  t.abort = function(a) {
    this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.m = a || 7, Ke(this, "complete"), Ke(this, "abort"), Ji(this));
  }, t.N = function() {
    this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), Ji(this, !0)), me.aa.N.call(this);
  }, t.Ea = function() {
    this.s || (this.B || this.u || this.j ? lh(this) : this.bb());
  }, t.bb = function() {
    lh(this);
  };
  function lh(a) {
    if (a.h && typeof o < "u" && (!a.v[1] || Ut(a) != 4 || a.Z() != 2)) {
      if (a.u && Ut(a) == 4) Nd(a.Ea, 0, a);
      else if (Ke(a, "readystatechange"), Ut(a) == 4) {
        a.h = !1;
        try {
          const O = a.Z();
          e: switch (O) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var l = !0;
              break e;
            default:
              l = !1;
          }
          var h;
          if (!(h = l)) {
            var m;
            if (m = O === 0) {
              var A = String(a.D).match(eh)[1] || null;
              !A && c.self && c.self.location && (A = c.self.location.protocol.slice(0, -1)), m = !vv.test(A ? A.toLowerCase() : "");
            }
            h = m;
          }
          if (h) Ke(a, "complete"), Ke(a, "success");
          else {
            a.m = 6;
            try {
              var R = 2 < Ut(a) ? a.g.statusText : "";
            } catch {
              R = "";
            }
            a.l = R + " [" + a.Z() + "]", uh(a);
          }
        } finally {
          Ji(a);
        }
      }
    }
  }
  function Ji(a, l) {
    if (a.g) {
      dh(a);
      const h = a.g, m = a.v[0] ? () => {
      } : null;
      a.g = null, a.v = null, l || Ke(a, "ready");
      try {
        h.onreadystatechange = m;
      } catch {
      }
    }
  }
  function dh(a) {
    a.I && (c.clearTimeout(a.I), a.I = null);
  }
  t.isActive = function() {
    return !!this.g;
  };
  function Ut(a) {
    return a.g ? a.g.readyState : 0;
  }
  t.Z = function() {
    try {
      return 2 < Ut(this) ? this.g.status : -1;
    } catch {
      return -1;
    }
  }, t.oa = function() {
    try {
      return this.g ? this.g.responseText : "";
    } catch {
      return "";
    }
  }, t.Oa = function(a) {
    if (this.g) {
      var l = this.g.responseText;
      return a && l.indexOf(a) == 0 && (l = l.substring(a.length)), ZE(l);
    }
  };
  function hh(a) {
    try {
      if (!a.g) return null;
      if ("response" in a.g) return a.g.response;
      switch (a.H) {
        case "":
        case "text":
          return a.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in a.g) return a.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function Tv(a) {
    const l = {};
    a = (a.g && 2 <= Ut(a) && a.g.getAllResponseHeaders() || "").split(`\r
`);
    for (let m = 0; m < a.length; m++) {
      if (U(a[m])) continue;
      var h = I(a[m]);
      const A = h[0];
      if (h = h[1], typeof h != "string") continue;
      h = h.trim();
      const R = l[A] || [];
      l[A] = R, R.push(h);
    }
    v(l, function(m) {
      return m.join(", ");
    });
  }
  t.Ba = function() {
    return this.m;
  }, t.Ka = function() {
    return typeof this.l == "string" ? this.l : String(this.l);
  };
  function bs(a, l, h) {
    return h && h.internalChannelParams && h.internalChannelParams[a] || l;
  }
  function fh(a) {
    this.Aa = 0, this.i = [], this.j = new ys(), this.ia = this.qa = this.I = this.W = this.g = this.ya = this.D = this.H = this.m = this.S = this.o = null, this.Ya = this.U = 0, this.Va = bs("failFast", !1, a), this.F = this.C = this.u = this.s = this.l = null, this.X = !0, this.za = this.T = -1, this.Y = this.v = this.B = 0, this.Ta = bs("baseRetryDelayMs", 5e3, a), this.cb = bs("retryDelaySeedMs", 1e4, a), this.Wa = bs("forwardChannelMaxRetries", 2, a), this.wa = bs("forwardChannelRequestTimeoutMs", 2e4, a), this.pa = a && a.xmlHttpFactory || void 0, this.Xa = a && a.Tb || void 0, this.Ca = a && a.useFetchStreams || !1, this.L = void 0, this.J = a && a.supportsCrossDomainXhr || !1, this.K = "", this.h = new Kd(a && a.concurrentRequestLimit), this.Da = new yv(), this.P = a && a.fastHandshake || !1, this.O = a && a.encodeInitMessageHeaders || !1, this.P && this.O && (this.O = !1), this.Ua = a && a.Rb || !1, a && a.xa && this.j.xa(), a && a.forceLongPolling && (this.X = !1), this.ba = !this.P && this.X && a && a.detectBufferingProxy || !1, this.ja = void 0, a && a.longPollingTimeout && 0 < a.longPollingTimeout && (this.ja = a.longPollingTimeout), this.ca = void 0, this.R = 0, this.M = !1, this.ka = this.A = null;
  }
  t = fh.prototype, t.la = 8, t.G = 1, t.connect = function(a, l, h, m) {
    Ye(0), this.W = a, this.H = l || {}, h && m !== void 0 && (this.H.OSID = h, this.H.OAID = m), this.F = this.X, this.I = Th(this, null, this.W), Qi(this);
  };
  function Ac(a) {
    if (ph(a), a.G == 3) {
      var l = a.U++, h = Vt(a.I);
      if (ue(h, "SID", a.K), ue(h, "RID", l), ue(h, "TYPE", "terminate"), As(a, h), l = new sn(a, a.j, l), l.L = 2, l.v = Wi(Vt(h)), h = !1, c.navigator && c.navigator.sendBeacon) try {
        h = c.navigator.sendBeacon(l.v.toString(), "");
      } catch {
      }
      !h && c.Image && (new Image().src = l.v, h = !0), h || (l.g = Ih(l.j, null), l.g.ea(l.v)), l.F = Date.now(), Gi(l);
    }
    Sh(a);
  }
  function Xi(a) {
    a.g && (Cc(a), a.g.cancel(), a.g = null);
  }
  function ph(a) {
    Xi(a), a.u && (c.clearTimeout(a.u), a.u = null), Zi(a), a.h.cancel(), a.s && (typeof a.s == "number" && c.clearTimeout(a.s), a.s = null);
  }
  function Qi(a) {
    if (!Yd(a.h) && !a.s) {
      a.s = !0;
      var l = a.Ga;
      Qe || W(), K || (Qe(), K = !0), ye.add(l, a), a.B = 0;
    }
  }
  function Iv(a, l) {
    return Jd(a.h) >= a.h.j - (a.s ? 1 : 0) ? !1 : a.s ? (a.i = l.D.concat(a.i), !0) : a.G == 1 || a.G == 2 || a.B >= (a.Va ? 0 : a.Wa) ? !1 : (a.s = _s(_(a.Ga, a, l), vh(a, a.B)), a.B++, !0);
  }
  t.Ga = function(a) {
    if (this.s) if (this.s = null, this.G == 1) {
      if (!a) {
        this.U = Math.floor(1e5 * Math.random()), a = this.U++;
        const A = new sn(this, this.j, a);
        let R = this.o;
        if (this.S && (R ? (R = g(R), S(R, this.S)) : R = this.S), this.m !== null || this.O || (A.H = R, R = null), this.P) e: {
          for (var l = 0, h = 0; h < this.i.length; h++) {
            t: {
              var m = this.i[h];
              if ("__data__" in m.map && (m = m.map.__data__, typeof m == "string")) {
                m = m.length;
                break t;
              }
              m = void 0;
            }
            if (m === void 0) break;
            if (l += m, 4096 < l) {
              l = h;
              break e;
            }
            if (l === 4096 || h === this.i.length - 1) {
              l = h + 1;
              break e;
            }
          }
          l = 1e3;
        }
        else l = 1e3;
        l = gh(this, A, l), h = Vt(this.I), ue(h, "RID", a), ue(h, "CVER", 22), this.D && ue(h, "X-HTTP-Session-Id", this.D), As(this, h), R && (this.O ? l = "headers=" + encodeURIComponent(String(ah(R))) + "&" + l : this.m && bc(h, this.m, R)), wc(this.h, A), this.Ua && ue(h, "TYPE", "init"), this.P ? (ue(h, "$req", l), ue(h, "SID", "null"), A.T = !0, vc(A, h, null)) : vc(A, h, l), this.G = 2;
      }
    } else this.G == 3 && (a ? mh(this, a) : this.i.length == 0 || Yd(this.h) || mh(this));
  };
  function mh(a, l) {
    var h;
    l ? h = l.l : h = a.U++;
    const m = Vt(a.I);
    ue(m, "SID", a.K), ue(m, "RID", h), ue(m, "AID", a.T), As(a, m), a.m && a.o && bc(m, a.m, a.o), h = new sn(a, a.j, h, a.B + 1), a.m === null && (h.H = a.o), l && (a.i = l.D.concat(a.i)), l = gh(a, h, 1e3), h.I = Math.round(0.5 * a.wa) + Math.round(0.5 * a.wa * Math.random()), wc(a.h, h), vc(h, m, l);
  }
  function As(a, l) {
    a.H && ce(a.H, function(h, m) {
      ue(l, m, h);
    }), a.l && Zd({}, function(h, m) {
      ue(l, m, h);
    });
  }
  function gh(a, l, h) {
    h = Math.min(a.i.length, h);
    var m = a.l ? _(a.l.Na, a.l, a) : null;
    e: {
      var A = a.i;
      let R = -1;
      for (; ; ) {
        const O = ["count=" + h];
        R == -1 ? 0 < h ? (R = A[0].g, O.push("ofs=" + R)) : R = 0 : O.push("ofs=" + R);
        let ie = !0;
        for (let Ne = 0; Ne < h; Ne++) {
          let Q = A[Ne].g;
          const Ue = A[Ne].map;
          if (Q -= R, 0 > Q) R = Math.max(0, A[Ne].g - 100), ie = !1;
          else try {
            Ev(Ue, O, "req" + Q + "_");
          } catch {
            m && m(Ue);
          }
        }
        if (ie) {
          m = O.join("&");
          break e;
        }
      }
    }
    return a = a.i.splice(0, h), l.D = a, m;
  }
  function _h(a) {
    if (!a.g && !a.u) {
      a.Y = 1;
      var l = a.Fa;
      Qe || W(), K || (Qe(), K = !0), ye.add(l, a), a.v = 0;
    }
  }
  function Rc(a) {
    return a.g || a.u || 3 <= a.v ? !1 : (a.Y++, a.u = _s(_(a.Fa, a), vh(a, a.v)), a.v++, !0);
  }
  t.Fa = function() {
    if (this.u = null, yh(this), this.ba && !(this.M || this.g == null || 0 >= this.R)) {
      var a = 2 * this.R;
      this.j.info("BP detection timer enabled: " + a), this.A = _s(_(this.ab, this), a);
    }
  }, t.ab = function() {
    this.A && (this.A = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.M = !0, Ye(10), Xi(this), yh(this));
  };
  function Cc(a) {
    a.A != null && (c.clearTimeout(a.A), a.A = null);
  }
  function yh(a) {
    a.g = new sn(a, a.j, "rpc", a.Y), a.m === null && (a.g.H = a.o), a.g.O = 0;
    var l = Vt(a.qa);
    ue(l, "RID", "rpc"), ue(l, "SID", a.K), ue(l, "AID", a.T), ue(l, "CI", a.F ? "0" : "1"), !a.F && a.ja && ue(l, "TO", a.ja), ue(l, "TYPE", "xmlhttp"), As(a, l), a.m && a.o && bc(l, a.m, a.o), a.L && (a.g.I = a.L);
    var h = a.g;
    a = a.ia, h.L = 1, h.v = Wi(Vt(l)), h.m = null, h.P = !0, qd(h, a);
  }
  t.Za = function() {
    this.C != null && (this.C = null, Xi(this), Rc(this), Ye(19));
  };
  function Zi(a) {
    a.C != null && (c.clearTimeout(a.C), a.C = null);
  }
  function Eh(a, l) {
    var h = null;
    if (a.g == l) {
      Zi(a), Cc(a), a.g = null;
      var m = 2;
    } else if (Ic(a.h, l)) h = l.D, Xd(a.h, l), m = 1;
    else return;
    if (a.G != 0) {
      if (l.o) if (m == 1) {
        h = l.m ? l.m.length : 0, l = Date.now() - l.F;
        var A = a.B;
        m = $i(), Ke(m, new $d(m, h)), Qi(a);
      } else _h(a);
      else if (A = l.s, A == 3 || A == 0 && 0 < l.X || !(m == 1 && Iv(a, l) || m == 2 && Rc(a))) switch (h && 0 < h.length && (l = a.h, l.i = l.i.concat(h)), A) {
        case 1:
          Fn(a, 5);
          break;
        case 4:
          Fn(a, 10);
          break;
        case 3:
          Fn(a, 6);
          break;
        default:
          Fn(a, 2);
      }
    }
  }
  function vh(a, l) {
    let h = a.Ta + Math.floor(Math.random() * a.cb);
    return a.isActive() || (h *= 2), h * l;
  }
  function Fn(a, l) {
    if (a.j.info("Error code " + l), l == 2) {
      var h = _(a.fb, a), m = a.Xa;
      const A = !m;
      m = new Un(m || "//www.google.com/images/cleardot.gif"), c.location && c.location.protocol == "http" || qi(m, "https"), Wi(m), A ? gv(m.toString(), h) : _v(m.toString(), h);
    } else Ye(2);
    a.G = 0, a.l && a.l.sa(l), Sh(a), ph(a);
  }
  t.fb = function(a) {
    a ? (this.j.info("Successfully pinged google.com"), Ye(2)) : (this.j.info("Failed to ping google.com"), Ye(1));
  };
  function Sh(a) {
    if (a.G = 0, a.ka = [], a.l) {
      const l = Qd(a.h);
      (l.length != 0 || a.i.length != 0) && (P(a.ka, l), P(a.ka, a.i), a.h.i.length = 0, k(a.i), a.i.length = 0), a.l.ra();
    }
  }
  function Th(a, l, h) {
    var m = h instanceof Un ? Vt(h) : new Un(h);
    if (m.g != "") l && (m.g = l + "." + m.g), zi(m, m.s);
    else {
      var A = c.location;
      m = A.protocol, l = l ? l + "." + A.hostname : A.hostname, A = +A.port;
      var R = new Un(null);
      m && qi(R, m), l && (R.g = l), A && zi(R, A), h && (R.l = h), m = R;
    }
    return h = a.D, l = a.ya, h && l && ue(m, h, l), ue(m, "VER", a.la), As(a, m), m;
  }
  function Ih(a, l, h) {
    if (l && !a.J) throw Error("Can't create secondary domain capable XhrIo object.");
    return l = a.Ca && !a.pa ? new me(new Ki({ eb: h })) : new me(a.pa), l.Ha(a.J), l;
  }
  t.isActive = function() {
    return !!this.l && this.l.isActive(this);
  };
  function wh() {
  }
  t = wh.prototype, t.ua = function() {
  }, t.ta = function() {
  }, t.sa = function() {
  }, t.ra = function() {
  }, t.isActive = function() {
    return !0;
  }, t.Na = function() {
  };
  function eo() {
  }
  eo.prototype.g = function(a, l) {
    return new it(a, l);
  };
  function it(a, l) {
    Ve.call(this), this.g = new fh(l), this.l = a, this.h = l && l.messageUrlParams || null, a = l && l.messageHeaders || null, l && l.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" }), this.g.o = a, a = l && l.initMessageHeaders || null, l && l.messageContentType && (a ? a["X-WebChannel-Content-Type"] = l.messageContentType : a = { "X-WebChannel-Content-Type": l.messageContentType }), l && l.va && (a ? a["X-WebChannel-Client-Profile"] = l.va : a = { "X-WebChannel-Client-Profile": l.va }), this.g.S = a, (a = l && l.Sb) && !U(a) && (this.g.m = a), this.v = l && l.supportsCrossDomainXhr || !1, this.u = l && l.sendRawJson || !1, (l = l && l.httpSessionIdParam) && !U(l) && (this.g.D = l, a = this.h, a !== null && l in a && (a = this.h, l in a && delete a[l])), this.j = new Tr(this);
  }
  w(it, Ve), it.prototype.m = function() {
    this.g.l = this.j, this.v && (this.g.J = !0), this.g.connect(this.l, this.h || void 0);
  }, it.prototype.close = function() {
    Ac(this.g);
  }, it.prototype.o = function(a) {
    var l = this.g;
    if (typeof a == "string") {
      var h = {};
      h.__data__ = a, a = h;
    } else this.u && (h = {}, h.__data__ = pc(a), a = h);
    l.i.push(new ov(l.Ya++, a)), l.G == 3 && Qi(l);
  }, it.prototype.N = function() {
    this.g.l = null, delete this.j, Ac(this.g), delete this.g, it.aa.N.call(this);
  };
  function bh(a) {
    gc.call(this), a.__headers__ && (this.headers = a.__headers__, this.statusCode = a.__status__, delete a.__headers__, delete a.__status__);
    var l = a.__sm__;
    if (l) {
      e: {
        for (const h in l) {
          a = h;
          break e;
        }
        a = void 0;
      }
      (this.i = a) && (a = this.i, l = l !== null && a in l ? l[a] : void 0), this.data = l;
    } else this.data = a;
  }
  w(bh, gc);
  function Ah() {
    _c.call(this), this.status = 1;
  }
  w(Ah, _c);
  function Tr(a) {
    this.g = a;
  }
  w(Tr, wh), Tr.prototype.ua = function() {
    Ke(this.g, "a");
  }, Tr.prototype.ta = function(a) {
    Ke(this.g, new bh(a));
  }, Tr.prototype.sa = function(a) {
    Ke(this.g, new Ah());
  }, Tr.prototype.ra = function() {
    Ke(this.g, "b");
  }, eo.prototype.createWebChannel = eo.prototype.g, it.prototype.send = it.prototype.o, it.prototype.open = it.prototype.m, it.prototype.close = it.prototype.close, O_ = function() {
    return new eo();
  }, N_ = function() {
    return $i();
  }, k_ = xn, xu = { mb: 0, pb: 1, qb: 2, Jb: 3, Ob: 4, Lb: 5, Mb: 6, Kb: 7, Ib: 8, Nb: 9, PROXY: 10, NOPROXY: 11, Gb: 12, Cb: 13, Db: 14, Bb: 15, Eb: 16, Fb: 17, ib: 18, hb: 19, jb: 20 }, ji.NO_ERROR = 0, ji.TIMEOUT = 8, ji.HTTP_ERROR = 6, No = ji, jd.COMPLETE = "complete", D_ = jd, Vd.EventType = ms, ms.OPEN = "a", ms.CLOSE = "b", ms.ERROR = "c", ms.MESSAGE = "d", Ve.prototype.listen = Ve.prototype.K, Ms = Vd, me.prototype.listenOnce = me.prototype.L, me.prototype.getLastError = me.prototype.Ka, me.prototype.getLastErrorCode = me.prototype.Ba, me.prototype.getStatus = me.prototype.Z, me.prototype.getResponseJson = me.prototype.Oa, me.prototype.getResponseText = me.prototype.oa, me.prototype.send = me.prototype.ea, me.prototype.setWithCredentials = me.prototype.Ha, P_ = me;
}).apply(typeof lo < "u" ? lo : typeof self < "u" ? self : typeof window < "u" ? window : {});
const ep = "@firebase/firestore", tp = "4.8.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $e {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
$e.UNAUTHENTICATED = new $e(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
$e.GOOGLE_CREDENTIALS = new $e("google-credentials-uid"), $e.FIRST_PARTY = new $e("first-party-uid"), $e.MOCK_USER = new $e("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let ls = "11.10.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const lr = new Bl("@firebase/firestore");
function Rr() {
  return lr.logLevel;
}
function L(t, ...e) {
  if (lr.logLevel <= z.DEBUG) {
    const n = e.map(Gl);
    lr.debug(`Firestore (${ls}): ${t}`, ...n);
  }
}
function dr(t, ...e) {
  if (lr.logLevel <= z.ERROR) {
    const n = e.map(Gl);
    lr.error(`Firestore (${ls}): ${t}`, ...n);
  }
}
function zr(t, ...e) {
  if (lr.logLevel <= z.WARN) {
    const n = e.map(Gl);
    lr.warn(`Firestore (${ls}): ${t}`, ...n);
  }
}
function Gl(t) {
  if (typeof t == "string") return t;
  try {
    /**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    return function(n) {
      return JSON.stringify(n);
    }(t);
  } catch {
    return t;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function G(t, e, n) {
  let r = "Unexpected state";
  typeof e == "string" ? r = e : n = e, M_(t, r, n);
}
function M_(t, e, n) {
  let r = `FIRESTORE (${ls}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;
  if (n !== void 0) try {
    r += " CONTEXT: " + JSON.stringify(n);
  } catch {
    r += " CONTEXT: " + n;
  }
  throw dr(r), new Error(r);
}
function _e(t, e, n, r) {
  let s = "Unexpected state";
  typeof n == "string" ? s = n : r = n, t || M_(e, s, r);
}
function ae(t, e) {
  return t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const D = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
class V extends rn {
  /** @hideconstructor */
  constructor(e, n) {
    super(e, n), this.code = e, this.message = n, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tr {
  constructor() {
    this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class L_ {
  constructor(e, n) {
    this.user = n, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
}
class jC {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, n) {
    e.enqueueRetryable(() => n($e.UNAUTHENTICATED));
  }
  shutdown() {
  }
}
class HC {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, n) {
    this.changeListener = n, // Fire with initial user.
    e.enqueueRetryable(() => n(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class GC {
  constructor(e) {
    this.t = e, /** Tracks the current User. */
    this.currentUser = $e.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.i = 0, this.forceRefresh = !1, this.auth = null;
  }
  start(e, n) {
    _e(this.o === void 0, 42304);
    let r = this.i;
    const s = (u) => this.i !== r ? (r = this.i, n(u)) : Promise.resolve();
    let i = new tr();
    this.o = () => {
      this.i++, this.currentUser = this.u(), i.resolve(), i = new tr(), e.enqueueRetryable(() => s(this.currentUser));
    };
    const o = () => {
      const u = i;
      e.enqueueRetryable(async () => {
        await u.promise, await s(this.currentUser);
      });
    }, c = (u) => {
      L("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = u, this.o && (this.auth.addAuthTokenListener(this.o), o());
    };
    this.t.onInit((u) => c(u)), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout(() => {
      if (!this.auth) {
        const u = this.t.getImmediate({
          optional: !0
        });
        u ? c(u) : (
          // If auth is still not available, proceed with `null` user
          (L("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new tr())
        );
      }
    }, 0), o();
  }
  getToken() {
    const e = this.i, n = this.forceRefresh;
    return this.forceRefresh = !1, this.auth ? this.auth.getToken(n).then((r) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.i !== e ? (L("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : r ? (_e(typeof r.accessToken == "string", 31837, {
        l: r
      }), new L_(r.accessToken, this.currentUser)) : null
    )) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.auth && this.o && this.auth.removeAuthTokenListener(this.o), this.o = void 0;
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  u() {
    const e = this.auth && this.auth.getUid();
    return _e(e === null || typeof e == "string", 2055, {
      h: e
    }), new $e(e);
  }
}
class qC {
  constructor(e, n, r) {
    this.P = e, this.T = n, this.I = r, this.type = "FirstParty", this.user = $e.FIRST_PARTY, this.A = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  R() {
    return this.I ? this.I() : null;
  }
  get headers() {
    this.A.set("X-Goog-AuthUser", this.P);
    const e = this.R();
    return e && this.A.set("Authorization", e), this.T && this.A.set("X-Goog-Iam-Authorization-Token", this.T), this.A;
  }
}
class zC {
  constructor(e, n, r) {
    this.P = e, this.T = n, this.I = r;
  }
  getToken() {
    return Promise.resolve(new qC(this.P, this.T, this.I));
  }
  start(e, n) {
    e.enqueueRetryable(() => n($e.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
}
class np {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
}
class WC {
  constructor(e, n) {
    this.V = n, this.forceRefresh = !1, this.appCheck = null, this.m = null, this.p = null, Pt(e) && e.settings.appCheckToken && (this.p = e.settings.appCheckToken);
  }
  start(e, n) {
    _e(this.o === void 0, 3512);
    const r = (i) => {
      i.error != null && L("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);
      const o = i.token !== this.m;
      return this.m = i.token, L("FirebaseAppCheckTokenProvider", `Received ${o ? "new" : "existing"} token.`), o ? n(i.token) : Promise.resolve();
    };
    this.o = (i) => {
      e.enqueueRetryable(() => r(i));
    };
    const s = (i) => {
      L("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = i, this.o && this.appCheck.addTokenListener(this.o);
    };
    this.V.onInit((i) => s(i)), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout(() => {
      if (!this.appCheck) {
        const i = this.V.getImmediate({
          optional: !0
        });
        i ? s(i) : (
          // If AppCheck is still not available, proceed without it.
          L("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }, 0);
  }
  getToken() {
    if (this.p) return Promise.resolve(new np(this.p));
    const e = this.forceRefresh;
    return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then((n) => n ? (_e(typeof n.token == "string", 44558, {
      tokenResult: n
    }), this.m = n.token, new np(n.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.appCheck && this.o && this.appCheck.removeTokenListener(this.o), this.o = void 0;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function KC(t) {
  const e = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof self < "u" && (self.crypto || self.msCrypto)
  ), n = new Uint8Array(t);
  if (e && typeof e.getRandomValues == "function") e.getRandomValues(n);
  else
    for (let r = 0; r < t; r++) n[r] = Math.floor(256 * Math.random());
  return n;
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function YC() {
  return new TextEncoder();
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ql {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = 62 * Math.floor(4.129032258064516);
    let r = "";
    for (; r.length < 20; ) {
      const s = KC(40);
      for (let i = 0; i < s.length; ++i)
        r.length < 20 && s[i] < n && (r += e.charAt(s[i] % 62));
    }
    return r;
  }
}
function X(t, e) {
  return t < e ? -1 : t > e ? 1 : 0;
}
function Vu(t, e) {
  let n = 0;
  for (; n < t.length && n < e.length; ) {
    const r = t.codePointAt(n), s = e.codePointAt(n);
    if (r !== s) {
      if (r < 128 && s < 128)
        return X(r, s);
      {
        const i = YC(), o = JC(i.encode(rp(t, n)), i.encode(rp(e, n)));
        return o !== 0 ? o : X(r, s);
      }
    }
    n += r > 65535 ? 2 : 1;
  }
  return X(t.length, e.length);
}
function rp(t, e) {
  return t.codePointAt(e) > 65535 ? t.substring(e, e + 2) : t.substring(e, e + 1);
}
function JC(t, e) {
  for (let n = 0; n < t.length && n < e.length; ++n) if (t[n] !== e[n]) return X(t[n], e[n]);
  return X(t.length, e.length);
}
function Wr(t, e, n) {
  return t.length === e.length && t.every((r, s) => n(r, e[s]));
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const sp = "__name__";
class Rt {
  constructor(e, n, r) {
    n === void 0 ? n = 0 : n > e.length && G(637, {
      offset: n,
      range: e.length
    }), r === void 0 ? r = e.length - n : r > e.length - n && G(1746, {
      length: r,
      range: e.length - n
    }), this.segments = e, this.offset = n, this.len = r;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return Rt.comparator(this, e) === 0;
  }
  child(e) {
    const n = this.segments.slice(this.offset, this.limit());
    return e instanceof Rt ? e.forEach((r) => {
      n.push(r);
    }) : n.push(e), this.construct(n);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let n = 0; n < this.length; n++) if (this.get(n) !== e.get(n)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let n = 0; n < this.length; n++) if (this.get(n) !== e.get(n)) return !1;
    return !0;
  }
  forEach(e) {
    for (let n = this.offset, r = this.limit(); n < r; n++) e(this.segments[n]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  /**
   * Compare 2 paths segment by segment, prioritizing numeric IDs
   * (e.g., "__id123__") in numeric ascending order, followed by string
   * segments in lexicographical order.
   */
  static comparator(e, n) {
    const r = Math.min(e.length, n.length);
    for (let s = 0; s < r; s++) {
      const i = Rt.compareSegments(e.get(s), n.get(s));
      if (i !== 0) return i;
    }
    return X(e.length, n.length);
  }
  static compareSegments(e, n) {
    const r = Rt.isNumericId(e), s = Rt.isNumericId(n);
    return r && !s ? -1 : !r && s ? 1 : r && s ? Rt.extractNumericId(e).compare(Rt.extractNumericId(n)) : Vu(e, n);
  }
  // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
  static isNumericId(e) {
    return e.startsWith("__id") && e.endsWith("__");
  }
  static extractNumericId(e) {
    return Hl.fromString(e.substring(4, e.length - 2));
  }
}
class Ee extends Rt {
  construct(e, n, r) {
    return new Ee(e, n, r);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const n = [];
    for (const r of e) {
      if (r.indexOf("//") >= 0) throw new V(D.INVALID_ARGUMENT, `Invalid segment (${r}). Paths must not contain // in them.`);
      n.push(...r.split("/").filter((s) => s.length > 0));
    }
    return new Ee(n);
  }
  static emptyPath() {
    return new Ee([]);
  }
}
const XC = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class Le extends Rt {
  construct(e, n, r) {
    return new Le(e, n, r);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return XC.test(e);
  }
  canonicalString() {
    return this.toArray().map((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), Le.isValidIdentifier(e) || (e = "`" + e + "`"), e)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return this.length === 1 && this.get(0) === sp;
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new Le([sp]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const n = [];
    let r = "", s = 0;
    const i = () => {
      if (r.length === 0) throw new V(D.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      n.push(r), r = "";
    };
    let o = !1;
    for (; s < e.length; ) {
      const c = e[s];
      if (c === "\\") {
        if (s + 1 === e.length) throw new V(D.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const u = e[s + 1];
        if (u !== "\\" && u !== "." && u !== "`") throw new V(D.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        r += u, s += 2;
      } else c === "`" ? (o = !o, s++) : c !== "." || o ? (r += c, s++) : (i(), s++);
    }
    if (i(), o) throw new V(D.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new Le(n);
  }
  static emptyPath() {
    return new Le([]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class j {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new j(Ee.fromString(e));
  }
  static fromName(e) {
    return new j(Ee.fromString(e).popFirst(5));
  }
  static empty() {
    return new j(Ee.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && Ee.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, n) {
    return Ee.comparator(e.path, n.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new j(new Ee(e.slice()));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function QC(t, e, n) {
  if (!n) throw new V(D.INVALID_ARGUMENT, `Function ${t}() cannot be called with an empty ${e}.`);
}
function ZC(t, e, n, r) {
  if (e === !0 && r === !0) throw new V(D.INVALID_ARGUMENT, `${t} and ${n} cannot be used together.`);
}
function ip(t) {
  if (!j.isDocumentKey(t)) throw new V(D.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
}
function x_(t) {
  return typeof t == "object" && t !== null && (Object.getPrototypeOf(t) === Object.prototype || Object.getPrototypeOf(t) === null);
}
function zl(t) {
  if (t === void 0) return "undefined";
  if (t === null) return "null";
  if (typeof t == "string") return t.length > 20 && (t = `${t.substring(0, 20)}...`), JSON.stringify(t);
  if (typeof t == "number" || typeof t == "boolean") return "" + t;
  if (typeof t == "object") {
    if (t instanceof Array) return "an array";
    {
      const e = (
        /** try to get the constructor name for an object. */
        function(r) {
          return r.constructor ? r.constructor.name : null;
        }(t)
      );
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof t == "function" ? "a function" : G(12329, {
    type: typeof t
  });
}
function Uu(t, e) {
  if ("_delegate" in t && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (t = t._delegate), !(t instanceof e)) {
    if (e.name === t.constructor.name) throw new V(D.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const n = zl(t);
      throw new V(D.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
    }
  }
  return t;
}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Te(t, e) {
  const n = {
    typeString: t
  };
  return e && (n.value = e), n;
}
function Ai(t, e) {
  if (!x_(t)) throw new V(D.INVALID_ARGUMENT, "JSON must be an object");
  let n;
  for (const r in e) if (e[r]) {
    const s = e[r].typeString, i = "value" in e[r] ? {
      value: e[r].value
    } : void 0;
    if (!(r in t)) {
      n = `JSON missing required field: '${r}'`;
      break;
    }
    const o = t[r];
    if (s && typeof o !== s) {
      n = `JSON field '${r}' must be a ${s}.`;
      break;
    }
    if (i !== void 0 && o !== i.value) {
      n = `Expected '${r}' field to equal '${i.value}'`;
      break;
    }
  }
  if (n) throw new V(D.INVALID_ARGUMENT, n);
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const op = -62135596800, ap = 1e6;
class he {
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return he.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return he.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const n = Math.floor(e / 1e3), r = Math.floor((e - 1e3 * n) * ap);
    return new he(n, r);
  }
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, n) {
    if (this.seconds = e, this.nanoseconds = n, n < 0) throw new V(D.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + n);
    if (n >= 1e9) throw new V(D.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + n);
    if (e < op) throw new V(D.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new V(D.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / ap;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? X(this.nanoseconds, e.nanoseconds) : X(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /**
   * Returns a JSON-serializable representation of this `Timestamp`.
   */
  toJSON() {
    return {
      type: he._jsonSchemaVersion,
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Builds a `Timestamp` instance from a JSON object created by {@link Timestamp.toJSON}.
   */
  static fromJSON(e) {
    if (Ai(e, he._jsonSchema)) return new he(e.seconds, e.nanoseconds);
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - op;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
}
he._jsonSchemaVersion = "firestore/timestamp/1.0", he._jsonSchema = {
  type: Te("string", he._jsonSchemaVersion),
  seconds: Te("number"),
  nanoseconds: Te("number")
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class de {
  static fromTimestamp(e) {
    return new de(e);
  }
  static min() {
    return new de(new he(0, 0));
  }
  static max() {
    return new de(new he(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ri = -1;
function eP(t, e) {
  const n = t.toTimestamp().seconds, r = t.toTimestamp().nanoseconds + 1, s = de.fromTimestamp(r === 1e9 ? new he(n + 1, 0) : new he(n, r));
  return new Cn(s, j.empty(), e);
}
function tP(t) {
  return new Cn(t.readTime, t.key, ri);
}
class Cn {
  constructor(e, n, r) {
    this.readTime = e, this.documentKey = n, this.largestBatchId = r;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new Cn(de.min(), j.empty(), ri);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new Cn(de.max(), j.empty(), ri);
  }
}
function nP(t, e) {
  let n = t.readTime.compareTo(e.readTime);
  return n !== 0 ? n : (n = j.comparator(t.documentKey, e.documentKey), n !== 0 ? n : X(t.largestBatchId, e.largestBatchId));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const rP = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class sP {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Wl(t) {
  if (t.code !== D.FAILED_PRECONDITION || t.message !== rP) throw t;
  L("LocalStore", "Unexpectedly lost primary lease");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class C {
  constructor(e) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = !1, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = !1, e((n) => {
      this.isDone = !0, this.result = n, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(n);
    }, (n) => {
      this.isDone = !0, this.error = n, this.catchCallback && this.catchCallback(n);
    });
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, n) {
    return this.callbackAttached && G(59440), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(n, this.error) : this.wrapSuccess(e, this.result) : new C((r, s) => {
      this.nextCallback = (i) => {
        this.wrapSuccess(e, i).next(r, s);
      }, this.catchCallback = (i) => {
        this.wrapFailure(n, i).next(r, s);
      };
    });
  }
  toPromise() {
    return new Promise((e, n) => {
      this.next(e, n);
    });
  }
  wrapUserFunction(e) {
    try {
      const n = e();
      return n instanceof C ? n : C.resolve(n);
    } catch (n) {
      return C.reject(n);
    }
  }
  wrapSuccess(e, n) {
    return e ? this.wrapUserFunction(() => e(n)) : C.resolve(n);
  }
  wrapFailure(e, n) {
    return e ? this.wrapUserFunction(() => e(n)) : C.reject(n);
  }
  static resolve(e) {
    return new C((n, r) => {
      n(e);
    });
  }
  static reject(e) {
    return new C((n, r) => {
      r(e);
    });
  }
  static waitFor(e) {
    return new C((n, r) => {
      let s = 0, i = 0, o = !1;
      e.forEach((c) => {
        ++s, c.next(() => {
          ++i, o && i === s && n();
        }, (u) => r(u));
      }), o = !0, i === s && n();
    });
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(e) {
    let n = C.resolve(!1);
    for (const r of e) n = n.next((s) => s ? C.resolve(s) : r());
    return n;
  }
  static forEach(e, n) {
    const r = [];
    return e.forEach((s, i) => {
      r.push(n.call(this, s, i));
    }), this.waitFor(r);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(e, n) {
    return new C((r, s) => {
      const i = e.length, o = new Array(i);
      let c = 0;
      for (let u = 0; u < i; u++) {
        const d = u;
        n(e[d]).next((f) => {
          o[d] = f, ++c, c === i && r(o);
        }, (f) => s(f));
      }
    });
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(e, n) {
    return new C((r, s) => {
      const i = () => {
        e() === !0 ? n().next(() => {
          i();
        }, s) : r();
      };
      i();
    });
  }
}
function iP(t) {
  const e = t.match(/Android ([\d.]+)/i), n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(n);
}
function Ri(t) {
  return t.name === "IndexedDbTransactionError";
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Kl {
  constructor(e, n) {
    this.previousValue = e, n && (n.sequenceNumberHandler = (r) => this._e(r), this.ae = (r) => n.writeSequenceNumber(r));
  }
  _e(e) {
    return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
  }
  next() {
    const e = ++this.previousValue;
    return this.ae && this.ae(e), e;
  }
}
Kl.ue = -1;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Yl = -1;
function Jl(t) {
  return t == null;
}
function aa(t) {
  return t === 0 && 1 / t == -1 / 0;
}
function oP(t) {
  return typeof t == "number" && Number.isInteger(t) && !aa(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const V_ = "";
function aP(t) {
  let e = "";
  for (let n = 0; n < t.length; n++) e.length > 0 && (e = cp(e)), e = cP(t.get(n), e);
  return cp(e);
}
function cP(t, e) {
  let n = e;
  const r = t.length;
  for (let s = 0; s < r; s++) {
    const i = t.charAt(s);
    switch (i) {
      case "\0":
        n += "";
        break;
      case V_:
        n += "";
        break;
      default:
        n += i;
    }
  }
  return n;
}
function cp(t) {
  return t + V_ + "";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function up(t) {
  let e = 0;
  for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
  return e;
}
function ds(t, e) {
  for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
}
function U_(t) {
  for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tt {
  constructor(e, n) {
    this.comparator = e, this.root = n || Oe.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, n) {
    return new tt(this.comparator, this.root.insert(e, n, this.comparator).copy(null, null, Oe.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new tt(this.comparator, this.root.remove(e, this.comparator).copy(null, null, Oe.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let n = this.root;
    for (; !n.isEmpty(); ) {
      const r = this.comparator(e, n.key);
      if (r === 0) return n.value;
      r < 0 ? n = n.left : r > 0 && (n = n.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let n = 0, r = this.root;
    for (; !r.isEmpty(); ) {
      const s = this.comparator(e, r.key);
      if (s === 0) return n + r.left.size;
      s < 0 ? r = r.left : (
        // Count all nodes left of the node plus the node itself
        (n += r.left.size + 1, r = r.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((n, r) => (e(n, r), !1));
  }
  toString() {
    const e = [];
    return this.inorderTraversal((n, r) => (e.push(`${n}:${r}`), !1)), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new ho(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new ho(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new ho(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new ho(this.root, e, this.comparator, !0);
  }
}
class ho {
  constructor(e, n, r, s) {
    this.isReverse = s, this.nodeStack = [];
    let i = 1;
    for (; !e.isEmpty(); ) if (i = n ? r(e.key, n) : 1, // flip the comparison if we're going in reverse
    n && s && (i *= -1), i < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (i === 0) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const n = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return n;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
}
class Oe {
  constructor(e, n, r, s, i) {
    this.key = e, this.value = n, this.color = r ?? Oe.RED, this.left = s ?? Oe.EMPTY, this.right = i ?? Oe.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, n, r, s, i) {
    return new Oe(e ?? this.key, n ?? this.value, r ?? this.color, s ?? this.left, i ?? this.right);
  }
  isEmpty() {
    return !1;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, n, r) {
    let s = this;
    const i = r(e, s.key);
    return s = i < 0 ? s.copy(null, null, null, s.left.insert(e, n, r), null) : i === 0 ? s.copy(null, n, null, null, null) : s.copy(null, null, null, null, s.right.insert(e, n, r)), s.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return Oe.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, n) {
    let r, s = this;
    if (n(e, s.key) < 0) s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), s = s.copy(null, null, null, s.left.remove(e, n), null);
    else {
      if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), n(e, s.key) === 0) {
        if (s.right.isEmpty()) return Oe.EMPTY;
        r = s.right.min(), s = s.copy(r.key, r.value, null, null, s.right.removeMin());
      }
      s = s.copy(null, null, null, null, s.right.remove(e, n));
    }
    return s.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, Oe.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, Oe.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), n = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, n);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed()) throw G(43730, {
      key: this.key,
      value: this.value
    });
    if (this.right.isRed()) throw G(14113, {
      key: this.key,
      value: this.value
    });
    const e = this.left.check();
    if (e !== this.right.check()) throw G(27949);
    return e + (this.isRed() ? 0 : 1);
  }
}
Oe.EMPTY = null, Oe.RED = !0, Oe.BLACK = !1;
Oe.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw G(57766);
  }
  get value() {
    throw G(16141);
  }
  get color() {
    throw G(16727);
  }
  get left() {
    throw G(29726);
  }
  get right() {
    throw G(36894);
  }
  // Returns a copy of the current node.
  copy(e, n, r, s, i) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, n, r) {
    return new Oe(e, n);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, n) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  // For testing.
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
}();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class xe {
  constructor(e) {
    this.comparator = e, this.data = new tt(this.comparator);
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal((n, r) => (e(n), !1));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, n) {
    const r = this.data.getIteratorFrom(e[0]);
    for (; r.hasNext(); ) {
      const s = r.getNext();
      if (this.comparator(s.key, e[1]) >= 0) return;
      n(s.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, n) {
    let r;
    for (r = n !== void 0 ? this.data.getIteratorFrom(n) : this.data.getIterator(); r.hasNext(); )
      if (!e(r.getNext().key)) return;
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const n = this.data.getIteratorFrom(e);
    return n.hasNext() ? n.getNext().key : null;
  }
  getIterator() {
    return new lp(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new lp(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let n = this;
    return n.size < e.size && (n = e, e = this), e.forEach((r) => {
      n = n.add(r);
    }), n;
  }
  isEqual(e) {
    if (!(e instanceof xe) || this.size !== e.size) return !1;
    const n = this.data.getIterator(), r = e.data.getIterator();
    for (; n.hasNext(); ) {
      const s = n.getNext().key, i = r.getNext().key;
      if (this.comparator(s, i) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return this.forEach((n) => {
      e.push(n);
    }), e;
  }
  toString() {
    const e = [];
    return this.forEach((n) => e.push(n)), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const n = new xe(this.comparator);
    return n.data = e, n;
  }
}
class lp {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class vt {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(Le.comparator);
  }
  static empty() {
    return new vt([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let n = new xe(Le.comparator);
    for (const r of this.fields) n = n.add(r);
    for (const r of e) n = n.add(r);
    return new vt(n.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const n of this.fields) if (n.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return Wr(this.fields, e.fields, (n, r) => n.isEqual(r));
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class uP extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Mt {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const n = function(s) {
      try {
        return atob(s);
      } catch (i) {
        throw typeof DOMException < "u" && i instanceof DOMException ? new uP("Invalid base64 string: " + i) : i;
      }
    }(e);
    return new Mt(n);
  }
  static fromUint8Array(e) {
    const n = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function(s) {
        let i = "";
        for (let o = 0; o < s.length; ++o) i += String.fromCharCode(s[o]);
        return i;
      }(e)
    );
    return new Mt(n);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: !1
      } : {
        value: void 0,
        done: !0
      }
    };
  }
  toBase64() {
    return function(n) {
      return btoa(n);
    }(this.binaryString);
  }
  toUint8Array() {
    return function(n) {
      const r = new Uint8Array(n.length);
      for (let s = 0; s < n.length; s++) r[s] = n.charCodeAt(s);
      return r;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return X(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
Mt.EMPTY_BYTE_STRING = new Mt("");
const lP = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function hr(t) {
  if (_e(!!t, 39018), typeof t == "string") {
    let e = 0;
    const n = lP.exec(t);
    if (_e(!!n, 46558, {
      timestamp: t
    }), n[1]) {
      let s = n[1];
      s = (s + "000000000").substr(0, 9), e = Number(s);
    }
    const r = new Date(t);
    return {
      seconds: Math.floor(r.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: Me(t.seconds),
    nanos: Me(t.nanos)
  };
}
function Me(t) {
  return typeof t == "number" ? t : typeof t == "string" ? Number(t) : 0;
}
function Kr(t) {
  return typeof t == "string" ? Mt.fromBase64String(t) : Mt.fromUint8Array(t);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const F_ = "server_timestamp", B_ = "__type__", $_ = "__previous_value__", j_ = "__local_write_time__";
function Xl(t) {
  var e, n;
  return ((n = (((e = t?.mapValue) === null || e === void 0 ? void 0 : e.fields) || {})[B_]) === null || n === void 0 ? void 0 : n.stringValue) === F_;
}
function Ql(t) {
  const e = t.mapValue.fields[$_];
  return Xl(e) ? Ql(e) : e;
}
function ca(t) {
  const e = hr(t.mapValue.fields[j_].timestampValue);
  return new he(e.seconds, e.nanos);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class dP {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions Options that configure long-polling.
   * @param useFetchStreams Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, n, r, s, i, o, c, u, d, f) {
    this.databaseId = e, this.appId = n, this.persistenceKey = r, this.host = s, this.ssl = i, this.forceLongPolling = o, this.autoDetectLongPolling = c, this.longPollingOptions = u, this.useFetchStreams = d, this.isUsingEmulator = f;
  }
}
const ua = "(default)";
class la {
  constructor(e, n) {
    this.projectId = e, this.database = n || ua;
  }
  static empty() {
    return new la("", "");
  }
  get isDefaultDatabase() {
    return this.database === ua;
  }
  isEqual(e) {
    return e instanceof la && e.projectId === this.projectId && e.database === this.database;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const H_ = "__type__", hP = "__max__", fo = {
  mapValue: {}
}, G_ = "__vector__", Fu = "value";
function fr(t) {
  return "nullValue" in t ? 0 : "booleanValue" in t ? 1 : "integerValue" in t || "doubleValue" in t ? 2 : "timestampValue" in t ? 3 : "stringValue" in t ? 5 : "bytesValue" in t ? 6 : "referenceValue" in t ? 7 : "geoPointValue" in t ? 8 : "arrayValue" in t ? 9 : "mapValue" in t ? Xl(t) ? 4 : pP(t) ? 9007199254740991 : fP(t) ? 10 : 11 : G(28295, {
    value: t
  });
}
function Lt(t, e) {
  if (t === e) return !0;
  const n = fr(t);
  if (n !== fr(e)) return !1;
  switch (n) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return t.booleanValue === e.booleanValue;
    case 4:
      return ca(t).isEqual(ca(e));
    case 3:
      return function(s, i) {
        if (typeof s.timestampValue == "string" && typeof i.timestampValue == "string" && s.timestampValue.length === i.timestampValue.length)
          return s.timestampValue === i.timestampValue;
        const o = hr(s.timestampValue), c = hr(i.timestampValue);
        return o.seconds === c.seconds && o.nanos === c.nanos;
      }(t, e);
    case 5:
      return t.stringValue === e.stringValue;
    case 6:
      return function(s, i) {
        return Kr(s.bytesValue).isEqual(Kr(i.bytesValue));
      }(t, e);
    case 7:
      return t.referenceValue === e.referenceValue;
    case 8:
      return function(s, i) {
        return Me(s.geoPointValue.latitude) === Me(i.geoPointValue.latitude) && Me(s.geoPointValue.longitude) === Me(i.geoPointValue.longitude);
      }(t, e);
    case 2:
      return function(s, i) {
        if ("integerValue" in s && "integerValue" in i) return Me(s.integerValue) === Me(i.integerValue);
        if ("doubleValue" in s && "doubleValue" in i) {
          const o = Me(s.doubleValue), c = Me(i.doubleValue);
          return o === c ? aa(o) === aa(c) : isNaN(o) && isNaN(c);
        }
        return !1;
      }(t, e);
    case 9:
      return Wr(t.arrayValue.values || [], e.arrayValue.values || [], Lt);
    case 10:
    case 11:
      return function(s, i) {
        const o = s.mapValue.fields || {}, c = i.mapValue.fields || {};
        if (up(o) !== up(c)) return !1;
        for (const u in o) if (o.hasOwnProperty(u) && (c[u] === void 0 || !Lt(o[u], c[u]))) return !1;
        return !0;
      }(t, e);
    default:
      return G(52216, {
        left: t
      });
  }
}
function si(t, e) {
  return (t.values || []).find((n) => Lt(n, e)) !== void 0;
}
function Yr(t, e) {
  if (t === e) return 0;
  const n = fr(t), r = fr(e);
  if (n !== r) return X(n, r);
  switch (n) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return X(t.booleanValue, e.booleanValue);
    case 2:
      return function(i, o) {
        const c = Me(i.integerValue || i.doubleValue), u = Me(o.integerValue || o.doubleValue);
        return c < u ? -1 : c > u ? 1 : c === u ? 0 : (
          // one or both are NaN.
          isNaN(c) ? isNaN(u) ? 0 : -1 : 1
        );
      }(t, e);
    case 3:
      return dp(t.timestampValue, e.timestampValue);
    case 4:
      return dp(ca(t), ca(e));
    case 5:
      return Vu(t.stringValue, e.stringValue);
    case 6:
      return function(i, o) {
        const c = Kr(i), u = Kr(o);
        return c.compareTo(u);
      }(t.bytesValue, e.bytesValue);
    case 7:
      return function(i, o) {
        const c = i.split("/"), u = o.split("/");
        for (let d = 0; d < c.length && d < u.length; d++) {
          const f = X(c[d], u[d]);
          if (f !== 0) return f;
        }
        return X(c.length, u.length);
      }(t.referenceValue, e.referenceValue);
    case 8:
      return function(i, o) {
        const c = X(Me(i.latitude), Me(o.latitude));
        return c !== 0 ? c : X(Me(i.longitude), Me(o.longitude));
      }(t.geoPointValue, e.geoPointValue);
    case 9:
      return hp(t.arrayValue, e.arrayValue);
    case 10:
      return function(i, o) {
        var c, u, d, f;
        const p = i.fields || {}, _ = o.fields || {}, T = (c = p[Fu]) === null || c === void 0 ? void 0 : c.arrayValue, w = (u = _[Fu]) === null || u === void 0 ? void 0 : u.arrayValue, k = X(((d = T?.values) === null || d === void 0 ? void 0 : d.length) || 0, ((f = w?.values) === null || f === void 0 ? void 0 : f.length) || 0);
        return k !== 0 ? k : hp(T, w);
      }(t.mapValue, e.mapValue);
    case 11:
      return function(i, o) {
        if (i === fo.mapValue && o === fo.mapValue) return 0;
        if (i === fo.mapValue) return 1;
        if (o === fo.mapValue) return -1;
        const c = i.fields || {}, u = Object.keys(c), d = o.fields || {}, f = Object.keys(d);
        u.sort(), f.sort();
        for (let p = 0; p < u.length && p < f.length; ++p) {
          const _ = Vu(u[p], f[p]);
          if (_ !== 0) return _;
          const T = Yr(c[u[p]], d[f[p]]);
          if (T !== 0) return T;
        }
        return X(u.length, f.length);
      }(t.mapValue, e.mapValue);
    default:
      throw G(23264, {
        le: n
      });
  }
}
function dp(t, e) {
  if (typeof t == "string" && typeof e == "string" && t.length === e.length) return X(t, e);
  const n = hr(t), r = hr(e), s = X(n.seconds, r.seconds);
  return s !== 0 ? s : X(n.nanos, r.nanos);
}
function hp(t, e) {
  const n = t.values || [], r = e.values || [];
  for (let s = 0; s < n.length && s < r.length; ++s) {
    const i = Yr(n[s], r[s]);
    if (i) return i;
  }
  return X(n.length, r.length);
}
function Jr(t) {
  return Bu(t);
}
function Bu(t) {
  return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(n) {
    const r = hr(n);
    return `time(${r.seconds},${r.nanos})`;
  }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? function(n) {
    return Kr(n).toBase64();
  }(t.bytesValue) : "referenceValue" in t ? function(n) {
    return j.fromName(n).toString();
  }(t.referenceValue) : "geoPointValue" in t ? function(n) {
    return `geo(${n.latitude},${n.longitude})`;
  }(t.geoPointValue) : "arrayValue" in t ? function(n) {
    let r = "[", s = !0;
    for (const i of n.values || []) s ? s = !1 : r += ",", r += Bu(i);
    return r + "]";
  }(t.arrayValue) : "mapValue" in t ? function(n) {
    const r = Object.keys(n.fields || {}).sort();
    let s = "{", i = !0;
    for (const o of r) i ? i = !1 : s += ",", s += `${o}:${Bu(n.fields[o])}`;
    return s + "}";
  }(t.mapValue) : G(61005, {
    value: t
  });
}
function Oo(t) {
  switch (fr(t)) {
    case 0:
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
    case 8:
      return 16;
    case 4:
      const e = Ql(t);
      return e ? 16 + Oo(e) : 16;
    case 5:
      return 2 * t.stringValue.length;
    case 6:
      return Kr(t.bytesValue).approximateByteSize();
    case 7:
      return t.referenceValue.length;
    case 9:
      return function(r) {
        return (r.values || []).reduce((s, i) => s + Oo(i), 0);
      }(t.arrayValue);
    case 10:
    case 11:
      return function(r) {
        let s = 0;
        return ds(r.fields, (i, o) => {
          s += i.length + Oo(o);
        }), s;
      }(t.mapValue);
    default:
      throw G(13486, {
        value: t
      });
  }
}
function $u(t) {
  return !!t && "integerValue" in t;
}
function Zl(t) {
  return !!t && "arrayValue" in t;
}
function Mo(t) {
  return !!t && "mapValue" in t;
}
function fP(t) {
  var e, n;
  return ((n = (((e = t?.mapValue) === null || e === void 0 ? void 0 : e.fields) || {})[H_]) === null || n === void 0 ? void 0 : n.stringValue) === G_;
}
function $s(t) {
  if (t.geoPointValue) return {
    geoPointValue: Object.assign({}, t.geoPointValue)
  };
  if (t.timestampValue && typeof t.timestampValue == "object") return {
    timestampValue: Object.assign({}, t.timestampValue)
  };
  if (t.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return ds(t.mapValue.fields, (n, r) => e.mapValue.fields[n] = $s(r)), e;
  }
  if (t.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let n = 0; n < (t.arrayValue.values || []).length; ++n) e.arrayValue.values[n] = $s(t.arrayValue.values[n]);
    return e;
  }
  return Object.assign({}, t);
}
function pP(t) {
  return (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue === hP;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yt {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new yt({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let n = this.value;
      for (let r = 0; r < e.length - 1; ++r) if (n = (n.mapValue.fields || {})[e.get(r)], !Mo(n)) return null;
      return n = (n.mapValue.fields || {})[e.lastSegment()], n || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, n) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = $s(n);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let n = Le.emptyPath(), r = {}, s = [];
    e.forEach((o, c) => {
      if (!n.isImmediateParentOf(c)) {
        const u = this.getFieldsMap(n);
        this.applyChanges(u, r, s), r = {}, s = [], n = c.popLast();
      }
      o ? r[c.lastSegment()] = $s(o) : s.push(c.lastSegment());
    });
    const i = this.getFieldsMap(n);
    this.applyChanges(i, r, s);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const n = this.field(e.popLast());
    Mo(n) && n.mapValue.fields && delete n.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return Lt(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let n = this.value;
    n.mapValue.fields || (n.mapValue = {
      fields: {}
    });
    for (let r = 0; r < e.length; ++r) {
      let s = n.mapValue.fields[e.get(r)];
      Mo(s) && s.mapValue.fields || (s = {
        mapValue: {
          fields: {}
        }
      }, n.mapValue.fields[e.get(r)] = s), n = s;
    }
    return n.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, n, r) {
    ds(n, (s, i) => e[s] = i);
    for (const s of r) delete e[s];
  }
  clone() {
    return new yt($s(this.value));
  }
}
function q_(t) {
  const e = [];
  return ds(t.fields, (n, r) => {
    const s = new Le([n]);
    if (Mo(r)) {
      const i = q_(r.mapValue).fields;
      if (i.length === 0)
        e.push(s);
      else
        for (const o of i) e.push(s.child(o));
    } else
      e.push(s);
  }), new vt(e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _t {
  constructor(e, n, r, s, i, o, c) {
    this.key = e, this.documentType = n, this.version = r, this.readTime = s, this.createTime = i, this.data = o, this.documentState = c;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new _t(
      e,
      0,
      /* version */
      de.min(),
      /* readTime */
      de.min(),
      /* createTime */
      de.min(),
      yt.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, n, r, s) {
    return new _t(
      e,
      1,
      /* version */
      n,
      /* readTime */
      de.min(),
      /* createTime */
      r,
      s,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, n) {
    return new _t(
      e,
      2,
      /* version */
      n,
      /* readTime */
      de.min(),
      /* createTime */
      de.min(),
      yt.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, n) {
    return new _t(
      e,
      3,
      /* version */
      n,
      /* readTime */
      de.min(),
      /* createTime */
      de.min(),
      yt.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, n) {
    return !this.createTime.isEqual(de.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = n, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = yt.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = yt.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = de.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return e instanceof _t && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new _t(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class da {
  constructor(e, n) {
    this.position = e, this.inclusive = n;
  }
}
function fp(t, e, n) {
  let r = 0;
  for (let s = 0; s < t.position.length; s++) {
    const i = e[s], o = t.position[s];
    if (i.field.isKeyField() ? r = j.comparator(j.fromName(o.referenceValue), n.key) : r = Yr(o, n.data.field(i.field)), i.dir === "desc" && (r *= -1), r !== 0) break;
  }
  return r;
}
function pp(t, e) {
  if (t === null) return e === null;
  if (e === null || t.inclusive !== e.inclusive || t.position.length !== e.position.length) return !1;
  for (let n = 0; n < t.position.length; n++)
    if (!Lt(t.position[n], e.position[n])) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ha {
  constructor(e, n = "asc") {
    this.field = e, this.dir = n;
  }
}
function mP(t, e) {
  return t.dir === e.dir && t.field.isEqual(e.field);
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class z_ {
}
class Pe extends z_ {
  constructor(e, n, r) {
    super(), this.field = e, this.op = n, this.value = r;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, n, r) {
    return e.isKeyField() ? n === "in" || n === "not-in" ? this.createKeyFieldInFilter(e, n, r) : new _P(e, n, r) : n === "array-contains" ? new vP(e, r) : n === "in" ? new SP(e, r) : n === "not-in" ? new TP(e, r) : n === "array-contains-any" ? new IP(e, r) : new Pe(e, n, r);
  }
  static createKeyFieldInFilter(e, n, r) {
    return n === "in" ? new yP(e, r) : new EP(e, r);
  }
  matches(e) {
    const n = e.data.field(this.field);
    return this.op === "!=" ? n !== null && n.nullValue === void 0 && this.matchesComparison(Yr(n, this.value)) : n !== null && fr(this.value) === fr(n) && this.matchesComparison(Yr(n, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return e === 0;
      case "!=":
        return e !== 0;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return G(47266, {
          operator: this.op
        });
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class Pn extends z_ {
  constructor(e, n) {
    super(), this.filters = e, this.op = n, this.he = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, n) {
    return new Pn(e, n);
  }
  matches(e) {
    return W_(this) ? this.filters.find((n) => !n.matches(e)) === void 0 : this.filters.find((n) => n.matches(e)) !== void 0;
  }
  getFlattenedFilters() {
    return this.he !== null || (this.he = this.filters.reduce((e, n) => e.concat(n.getFlattenedFilters()), [])), this.he;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function W_(t) {
  return t.op === "and";
}
function K_(t) {
  return gP(t) && W_(t);
}
function gP(t) {
  for (const e of t.filters) if (e instanceof Pn) return !1;
  return !0;
}
function ju(t) {
  if (t instanceof Pe)
    return t.field.canonicalString() + t.op.toString() + Jr(t.value);
  if (K_(t))
    return t.filters.map((e) => ju(e)).join(",");
  {
    const e = t.filters.map((n) => ju(n)).join(",");
    return `${t.op}(${e})`;
  }
}
function Y_(t, e) {
  return t instanceof Pe ? function(r, s) {
    return s instanceof Pe && r.op === s.op && r.field.isEqual(s.field) && Lt(r.value, s.value);
  }(t, e) : t instanceof Pn ? function(r, s) {
    return s instanceof Pn && r.op === s.op && r.filters.length === s.filters.length ? r.filters.reduce((i, o, c) => i && Y_(o, s.filters[c]), !0) : !1;
  }(t, e) : void G(19439);
}
function J_(t) {
  return t instanceof Pe ? function(n) {
    return `${n.field.canonicalString()} ${n.op} ${Jr(n.value)}`;
  }(t) : t instanceof Pn ? function(n) {
    return n.op.toString() + " {" + n.getFilters().map(J_).join(" ,") + "}";
  }(t) : "Filter";
}
class _P extends Pe {
  constructor(e, n, r) {
    super(e, n, r), this.key = j.fromName(r.referenceValue);
  }
  matches(e) {
    const n = j.comparator(e.key, this.key);
    return this.matchesComparison(n);
  }
}
class yP extends Pe {
  constructor(e, n) {
    super(e, "in", n), this.keys = X_("in", n);
  }
  matches(e) {
    return this.keys.some((n) => n.isEqual(e.key));
  }
}
class EP extends Pe {
  constructor(e, n) {
    super(e, "not-in", n), this.keys = X_("not-in", n);
  }
  matches(e) {
    return !this.keys.some((n) => n.isEqual(e.key));
  }
}
function X_(t, e) {
  var n;
  return (((n = e.arrayValue) === null || n === void 0 ? void 0 : n.values) || []).map((r) => j.fromName(r.referenceValue));
}
class vP extends Pe {
  constructor(e, n) {
    super(e, "array-contains", n);
  }
  matches(e) {
    const n = e.data.field(this.field);
    return Zl(n) && si(n.arrayValue, this.value);
  }
}
class SP extends Pe {
  constructor(e, n) {
    super(e, "in", n);
  }
  matches(e) {
    const n = e.data.field(this.field);
    return n !== null && si(this.value.arrayValue, n);
  }
}
class TP extends Pe {
  constructor(e, n) {
    super(e, "not-in", n);
  }
  matches(e) {
    if (si(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return !1;
    const n = e.data.field(this.field);
    return n !== null && n.nullValue === void 0 && !si(this.value.arrayValue, n);
  }
}
class IP extends Pe {
  constructor(e, n) {
    super(e, "array-contains-any", n);
  }
  matches(e) {
    const n = e.data.field(this.field);
    return !(!Zl(n) || !n.arrayValue.values) && n.arrayValue.values.some((r) => si(this.value.arrayValue, r));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wP {
  constructor(e, n = null, r = [], s = [], i = null, o = null, c = null) {
    this.path = e, this.collectionGroup = n, this.orderBy = r, this.filters = s, this.limit = i, this.startAt = o, this.endAt = c, this.Pe = null;
  }
}
function mp(t, e = null, n = [], r = [], s = null, i = null, o = null) {
  return new wP(t, e, n, r, s, i, o);
}
function ed(t) {
  const e = ae(t);
  if (e.Pe === null) {
    let n = e.path.canonicalString();
    e.collectionGroup !== null && (n += "|cg:" + e.collectionGroup), n += "|f:", n += e.filters.map((r) => ju(r)).join(","), n += "|ob:", n += e.orderBy.map((r) => function(i) {
      return i.field.canonicalString() + i.dir;
    }(r)).join(","), Jl(e.limit) || (n += "|l:", n += e.limit), e.startAt && (n += "|lb:", n += e.startAt.inclusive ? "b:" : "a:", n += e.startAt.position.map((r) => Jr(r)).join(",")), e.endAt && (n += "|ub:", n += e.endAt.inclusive ? "a:" : "b:", n += e.endAt.position.map((r) => Jr(r)).join(",")), e.Pe = n;
  }
  return e.Pe;
}
function td(t, e) {
  if (t.limit !== e.limit || t.orderBy.length !== e.orderBy.length) return !1;
  for (let n = 0; n < t.orderBy.length; n++) if (!mP(t.orderBy[n], e.orderBy[n])) return !1;
  if (t.filters.length !== e.filters.length) return !1;
  for (let n = 0; n < t.filters.length; n++) if (!Y_(t.filters[n], e.filters[n])) return !1;
  return t.collectionGroup === e.collectionGroup && !!t.path.isEqual(e.path) && !!pp(t.startAt, e.startAt) && pp(t.endAt, e.endAt);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ya {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, n = null, r = [], s = [], i = null, o = "F", c = null, u = null) {
    this.path = e, this.collectionGroup = n, this.explicitOrderBy = r, this.filters = s, this.limit = i, this.limitType = o, this.startAt = c, this.endAt = u, this.Te = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.Ie = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.de = null, this.startAt, this.endAt;
  }
}
function bP(t, e, n, r, s, i, o, c) {
  return new Ya(t, e, n, r, s, i, o, c);
}
function AP(t) {
  return new Ya(t);
}
function gp(t) {
  return t.filters.length === 0 && t.limit === null && t.startAt == null && t.endAt == null && (t.explicitOrderBy.length === 0 || t.explicitOrderBy.length === 1 && t.explicitOrderBy[0].field.isKeyField());
}
function RP(t) {
  return t.collectionGroup !== null;
}
function js(t) {
  const e = ae(t);
  if (e.Te === null) {
    e.Te = [];
    const n = /* @__PURE__ */ new Set();
    for (const i of e.explicitOrderBy) e.Te.push(i), n.add(i.field.canonicalString());
    const r = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
    (function(o) {
      let c = new xe(Le.comparator);
      return o.filters.forEach((u) => {
        u.getFlattenedFilters().forEach((d) => {
          d.isInequality() && (c = c.add(d.field));
        });
      }), c;
    })(e).forEach((i) => {
      n.has(i.canonicalString()) || i.isKeyField() || e.Te.push(new ha(i, r));
    }), // Add the document key field to the last if it is not explicitly ordered.
    n.has(Le.keyField().canonicalString()) || e.Te.push(new ha(Le.keyField(), r));
  }
  return e.Te;
}
function nr(t) {
  const e = ae(t);
  return e.Ie || (e.Ie = CP(e, js(t))), e.Ie;
}
function CP(t, e) {
  if (t.limitType === "F") return mp(t.path, t.collectionGroup, e, t.filters, t.limit, t.startAt, t.endAt);
  {
    e = e.map((s) => {
      const i = s.dir === "desc" ? "asc" : "desc";
      return new ha(s.field, i);
    });
    const n = t.endAt ? new da(t.endAt.position, t.endAt.inclusive) : null, r = t.startAt ? new da(t.startAt.position, t.startAt.inclusive) : null;
    return mp(t.path, t.collectionGroup, e, t.filters, t.limit, n, r);
  }
}
function Hu(t, e, n) {
  return new Ya(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
}
function Q_(t, e) {
  return td(nr(t), nr(e)) && t.limitType === e.limitType;
}
function Z_(t) {
  return `${ed(nr(t))}|lt:${t.limitType}`;
}
function Cs(t) {
  return `Query(target=${function(n) {
    let r = n.path.canonicalString();
    return n.collectionGroup !== null && (r += " collectionGroup=" + n.collectionGroup), n.filters.length > 0 && (r += `, filters: [${n.filters.map((s) => J_(s)).join(", ")}]`), Jl(n.limit) || (r += ", limit: " + n.limit), n.orderBy.length > 0 && (r += `, orderBy: [${n.orderBy.map((s) => function(o) {
      return `${o.field.canonicalString()} (${o.dir})`;
    }(s)).join(", ")}]`), n.startAt && (r += ", startAt: ", r += n.startAt.inclusive ? "b:" : "a:", r += n.startAt.position.map((s) => Jr(s)).join(",")), n.endAt && (r += ", endAt: ", r += n.endAt.inclusive ? "a:" : "b:", r += n.endAt.position.map((s) => Jr(s)).join(",")), `Target(${r})`;
  }(nr(t))}; limitType=${t.limitType})`;
}
function nd(t, e) {
  return e.isFoundDocument() && function(r, s) {
    const i = s.key.path;
    return r.collectionGroup !== null ? s.key.hasCollectionId(r.collectionGroup) && r.path.isPrefixOf(i) : j.isDocumentKey(r.path) ? r.path.isEqual(i) : r.path.isImmediateParentOf(i);
  }(t, e) && function(r, s) {
    for (const i of js(r))
      if (!i.field.isKeyField() && s.data.field(i.field) === null) return !1;
    return !0;
  }(t, e) && function(r, s) {
    for (const i of r.filters) if (!i.matches(s)) return !1;
    return !0;
  }(t, e) && function(r, s) {
    return !(r.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    function(o, c, u) {
      const d = fp(o, c, u);
      return o.inclusive ? d <= 0 : d < 0;
    }(r.startAt, js(r), s) || r.endAt && !function(o, c, u) {
      const d = fp(o, c, u);
      return o.inclusive ? d >= 0 : d > 0;
    }(r.endAt, js(r), s));
  }(t, e);
}
function PP(t) {
  return (e, n) => {
    let r = !1;
    for (const s of js(t)) {
      const i = DP(s, e, n);
      if (i !== 0) return i;
      r = r || s.field.isKeyField();
    }
    return 0;
  };
}
function DP(t, e, n) {
  const r = t.field.isKeyField() ? j.comparator(e.key, n.key) : function(i, o, c) {
    const u = o.data.field(i), d = c.data.field(i);
    return u !== null && d !== null ? Yr(u, d) : G(42886);
  }(t.field, e, n);
  switch (t.dir) {
    case "asc":
      return r;
    case "desc":
      return -1 * r;
    default:
      return G(19790, {
        direction: t.dir
      });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yr {
  constructor(e, n) {
    this.mapKeyFn = e, this.equalsFn = n, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(e) {
    const n = this.mapKeyFn(e), r = this.inner[n];
    if (r !== void 0) {
      for (const [s, i] of r) if (this.equalsFn(s, e)) return i;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  /** Put this key and value in the map. */
  set(e, n) {
    const r = this.mapKeyFn(e), s = this.inner[r];
    if (s === void 0) return this.inner[r] = [[e, n]], void this.innerSize++;
    for (let i = 0; i < s.length; i++) if (this.equalsFn(s[i][0], e))
      return void (s[i] = [e, n]);
    s.push([e, n]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(e) {
    const n = this.mapKeyFn(e), r = this.inner[n];
    if (r === void 0) return !1;
    for (let s = 0; s < r.length; s++) if (this.equalsFn(r[s][0], e)) return r.length === 1 ? delete this.inner[n] : r.splice(s, 1), this.innerSize--, !0;
    return !1;
  }
  forEach(e) {
    ds(this.inner, (n, r) => {
      for (const [s, i] of r) e(s, i);
    });
  }
  isEmpty() {
    return U_(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kP = new tt(j.comparator);
function fa() {
  return kP;
}
const ey = new tt(j.comparator);
function po(...t) {
  let e = ey;
  for (const n of t) e = e.insert(n.key, n);
  return e;
}
function ty(t) {
  let e = ey;
  return t.forEach((n, r) => e = e.insert(n, r.overlayedDocument)), e;
}
function Jn() {
  return Hs();
}
function ny() {
  return Hs();
}
function Hs() {
  return new yr((t) => t.toString(), (t, e) => t.isEqual(e));
}
const NP = new tt(j.comparator), OP = new xe(j.comparator);
function je(...t) {
  let e = OP;
  for (const n of t) e = e.add(n);
  return e;
}
const MP = new xe(X);
function LP() {
  return MP;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function rd(t, e) {
  if (t.useProto3Json) {
    if (isNaN(e)) return {
      doubleValue: "NaN"
    };
    if (e === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (e === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: aa(e) ? "-0" : e
  };
}
function ry(t) {
  return {
    integerValue: "" + t
  };
}
function xP(t, e) {
  return oP(e) ? ry(e) : rd(t, e);
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ja {
  constructor() {
    this._ = void 0;
  }
}
function VP(t, e, n) {
  return t instanceof pa ? function(s, i) {
    const o = {
      fields: {
        [B_]: {
          stringValue: F_
        },
        [j_]: {
          timestampValue: {
            seconds: s.seconds,
            nanos: s.nanoseconds
          }
        }
      }
    };
    return i && Xl(i) && (i = Ql(i)), i && (o.fields[$_] = i), {
      mapValue: o
    };
  }(n, e) : t instanceof ii ? iy(t, e) : t instanceof oi ? oy(t, e) : function(s, i) {
    const o = sy(s, i), c = _p(o) + _p(s.Ee);
    return $u(o) && $u(s.Ee) ? ry(c) : rd(s.serializer, c);
  }(t, e);
}
function UP(t, e, n) {
  return t instanceof ii ? iy(t, e) : t instanceof oi ? oy(t, e) : n;
}
function sy(t, e) {
  return t instanceof ma ? (
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */
    function(r) {
      return $u(r) || function(i) {
        return !!i && "doubleValue" in i;
      }(r);
    }(e) ? e : {
      integerValue: 0
    }
  ) : null;
}
class pa extends Ja {
}
class ii extends Ja {
  constructor(e) {
    super(), this.elements = e;
  }
}
function iy(t, e) {
  const n = ay(e);
  for (const r of t.elements) n.some((s) => Lt(s, r)) || n.push(r);
  return {
    arrayValue: {
      values: n
    }
  };
}
class oi extends Ja {
  constructor(e) {
    super(), this.elements = e;
  }
}
function oy(t, e) {
  let n = ay(e);
  for (const r of t.elements) n = n.filter((s) => !Lt(s, r));
  return {
    arrayValue: {
      values: n
    }
  };
}
class ma extends Ja {
  constructor(e, n) {
    super(), this.serializer = e, this.Ee = n;
  }
}
function _p(t) {
  return Me(t.integerValue || t.doubleValue);
}
function ay(t) {
  return Zl(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
}
function FP(t, e) {
  return t.field.isEqual(e.field) && function(r, s) {
    return r instanceof ii && s instanceof ii || r instanceof oi && s instanceof oi ? Wr(r.elements, s.elements, Lt) : r instanceof ma && s instanceof ma ? Lt(r.Ee, s.Ee) : r instanceof pa && s instanceof pa;
  }(t.transform, e.transform);
}
class BP {
  constructor(e, n) {
    this.version = e, this.transformResults = n;
  }
}
class qt {
  constructor(e, n) {
    this.updateTime = e, this.exists = n;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new qt();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new qt(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new qt(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
}
function Lo(t, e) {
  return t.updateTime !== void 0 ? e.isFoundDocument() && e.version.isEqual(t.updateTime) : t.exists === void 0 || t.exists === e.isFoundDocument();
}
class Xa {
}
function cy(t, e) {
  if (!t.hasLocalMutations || e && e.fields.length === 0) return null;
  if (e === null) return t.isNoDocument() ? new ly(t.key, qt.none()) : new Ci(t.key, t.data, qt.none());
  {
    const n = t.data, r = yt.empty();
    let s = new xe(Le.comparator);
    for (let i of e.fields) if (!s.has(i)) {
      let o = n.field(i);
      o === null && i.length > 1 && (i = i.popLast(), o = n.field(i)), o === null ? r.delete(i) : r.set(i, o), s = s.add(i);
    }
    return new Er(t.key, r, new vt(s.toArray()), qt.none());
  }
}
function $P(t, e, n) {
  t instanceof Ci ? function(s, i, o) {
    const c = s.value.clone(), u = Ep(s.fieldTransforms, i, o.transformResults);
    c.setAll(u), i.convertToFoundDocument(o.version, c).setHasCommittedMutations();
  }(t, e, n) : t instanceof Er ? function(s, i, o) {
    if (!Lo(s.precondition, i))
      return void i.convertToUnknownDocument(o.version);
    const c = Ep(s.fieldTransforms, i, o.transformResults), u = i.data;
    u.setAll(uy(s)), u.setAll(c), i.convertToFoundDocument(o.version, u).setHasCommittedMutations();
  }(t, e, n) : function(s, i, o) {
    i.convertToNoDocument(o.version).setHasCommittedMutations();
  }(0, e, n);
}
function Gs(t, e, n, r) {
  return t instanceof Ci ? function(i, o, c, u) {
    if (!Lo(i.precondition, o))
      return c;
    const d = i.value.clone(), f = vp(i.fieldTransforms, u, o);
    return d.setAll(f), o.convertToFoundDocument(o.version, d).setHasLocalMutations(), null;
  }(t, e, n, r) : t instanceof Er ? function(i, o, c, u) {
    if (!Lo(i.precondition, o)) return c;
    const d = vp(i.fieldTransforms, u, o), f = o.data;
    return f.setAll(uy(i)), f.setAll(d), o.convertToFoundDocument(o.version, f).setHasLocalMutations(), c === null ? null : c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((p) => p.field));
  }(t, e, n, r) : function(i, o, c) {
    return Lo(i.precondition, o) ? (o.convertToNoDocument(o.version).setHasLocalMutations(), null) : c;
  }(t, e, n);
}
function jP(t, e) {
  let n = null;
  for (const r of t.fieldTransforms) {
    const s = e.data.field(r.field), i = sy(r.transform, s || null);
    i != null && (n === null && (n = yt.empty()), n.set(r.field, i));
  }
  return n || null;
}
function yp(t, e) {
  return t.type === e.type && !!t.key.isEqual(e.key) && !!t.precondition.isEqual(e.precondition) && !!function(r, s) {
    return r === void 0 && s === void 0 || !(!r || !s) && Wr(r, s, (i, o) => FP(i, o));
  }(t.fieldTransforms, e.fieldTransforms) && (t.type === 0 ? t.value.isEqual(e.value) : t.type !== 1 || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask));
}
class Ci extends Xa {
  constructor(e, n, r, s = []) {
    super(), this.key = e, this.value = n, this.precondition = r, this.fieldTransforms = s, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
}
class Er extends Xa {
  constructor(e, n, r, s, i = []) {
    super(), this.key = e, this.data = n, this.fieldMask = r, this.precondition = s, this.fieldTransforms = i, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function uy(t) {
  const e = /* @__PURE__ */ new Map();
  return t.fieldMask.fields.forEach((n) => {
    if (!n.isEmpty()) {
      const r = t.data.field(n);
      e.set(n, r);
    }
  }), e;
}
function Ep(t, e, n) {
  const r = /* @__PURE__ */ new Map();
  _e(t.length === n.length, 32656, {
    Ae: n.length,
    Re: t.length
  });
  for (let s = 0; s < n.length; s++) {
    const i = t[s], o = i.transform, c = e.data.field(i.field);
    r.set(i.field, UP(o, c, n[s]));
  }
  return r;
}
function vp(t, e, n) {
  const r = /* @__PURE__ */ new Map();
  for (const s of t) {
    const i = s.transform, o = n.data.field(s.field);
    r.set(s.field, VP(i, o, e));
  }
  return r;
}
class ly extends Xa {
  constructor(e, n) {
    super(), this.key = e, this.precondition = n, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class HP extends Xa {
  constructor(e, n) {
    super(), this.key = e, this.precondition = n, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class GP {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(e, n, r, s) {
    this.batchId = e, this.localWriteTime = n, this.baseMutations = r, this.mutations = s;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(e, n) {
    const r = n.mutationResults;
    for (let s = 0; s < this.mutations.length; s++) {
      const i = this.mutations[s];
      i.key.isEqual(e.key) && $P(i, e, r[s]);
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(e, n) {
    for (const r of this.baseMutations) r.key.isEqual(e.key) && (n = Gs(r, e, n, this.localWriteTime));
    for (const r of this.mutations) r.key.isEqual(e.key) && (n = Gs(r, e, n, this.localWriteTime));
    return n;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(e, n) {
    const r = ny();
    return this.mutations.forEach((s) => {
      const i = e.get(s.key), o = i.overlayedDocument;
      let c = this.applyToLocalView(o, i.mutatedFields);
      c = n.has(s.key) ? null : c;
      const u = cy(o, c);
      u !== null && r.set(s.key, u), o.isValidDocument() || o.convertToNoDocument(de.min());
    }), r;
  }
  keys() {
    return this.mutations.reduce((e, n) => e.add(n.key), je());
  }
  isEqual(e) {
    return this.batchId === e.batchId && Wr(this.mutations, e.mutations, (n, r) => yp(n, r)) && Wr(this.baseMutations, e.baseMutations, (n, r) => yp(n, r));
  }
}
class sd {
  constructor(e, n, r, s) {
    this.batch = e, this.commitVersion = n, this.mutationResults = r, this.docVersions = s;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(e, n, r) {
    _e(e.mutations.length === r.length, 58842, {
      Ve: e.mutations.length,
      me: r.length
    });
    let s = /* @__PURE__ */ function() {
      return NP;
    }();
    const i = e.mutations;
    for (let o = 0; o < i.length; o++) s = s.insert(i[o].key, r[o].version);
    return new sd(e, n, r, s);
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class qP {
  constructor(e, n) {
    this.largestBatchId = e, this.mutation = n;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Se, Y;
function zP(t) {
  switch (t) {
    case D.OK:
      return G(64938);
    case D.CANCELLED:
    case D.UNKNOWN:
    case D.DEADLINE_EXCEEDED:
    case D.RESOURCE_EXHAUSTED:
    case D.INTERNAL:
    case D.UNAVAILABLE:
    case D.UNAUTHENTICATED:
      return !1;
    case D.INVALID_ARGUMENT:
    case D.NOT_FOUND:
    case D.ALREADY_EXISTS:
    case D.PERMISSION_DENIED:
    case D.FAILED_PRECONDITION:
    case D.ABORTED:
    case D.OUT_OF_RANGE:
    case D.UNIMPLEMENTED:
    case D.DATA_LOSS:
      return !0;
    default:
      return G(15467, {
        code: t
      });
  }
}
function WP(t) {
  if (t === void 0)
    return dr("GRPC error has no .code"), D.UNKNOWN;
  switch (t) {
    case Se.OK:
      return D.OK;
    case Se.CANCELLED:
      return D.CANCELLED;
    case Se.UNKNOWN:
      return D.UNKNOWN;
    case Se.DEADLINE_EXCEEDED:
      return D.DEADLINE_EXCEEDED;
    case Se.RESOURCE_EXHAUSTED:
      return D.RESOURCE_EXHAUSTED;
    case Se.INTERNAL:
      return D.INTERNAL;
    case Se.UNAVAILABLE:
      return D.UNAVAILABLE;
    case Se.UNAUTHENTICATED:
      return D.UNAUTHENTICATED;
    case Se.INVALID_ARGUMENT:
      return D.INVALID_ARGUMENT;
    case Se.NOT_FOUND:
      return D.NOT_FOUND;
    case Se.ALREADY_EXISTS:
      return D.ALREADY_EXISTS;
    case Se.PERMISSION_DENIED:
      return D.PERMISSION_DENIED;
    case Se.FAILED_PRECONDITION:
      return D.FAILED_PRECONDITION;
    case Se.ABORTED:
      return D.ABORTED;
    case Se.OUT_OF_RANGE:
      return D.OUT_OF_RANGE;
    case Se.UNIMPLEMENTED:
      return D.UNIMPLEMENTED;
    case Se.DATA_LOSS:
      return D.DATA_LOSS;
    default:
      return G(39323, {
        code: t
      });
  }
}
(Y = Se || (Se = {}))[Y.OK = 0] = "OK", Y[Y.CANCELLED = 1] = "CANCELLED", Y[Y.UNKNOWN = 2] = "UNKNOWN", Y[Y.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", Y[Y.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", Y[Y.NOT_FOUND = 5] = "NOT_FOUND", Y[Y.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", Y[Y.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", Y[Y.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", Y[Y.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", Y[Y.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", Y[Y.ABORTED = 10] = "ABORTED", Y[Y.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", Y[Y.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", Y[Y.INTERNAL = 13] = "INTERNAL", Y[Y.UNAVAILABLE = 14] = "UNAVAILABLE", Y[Y.DATA_LOSS = 15] = "DATA_LOSS";
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
new Hl([4294967295, 4294967295], 0);
class KP {
  constructor(e, n) {
    this.databaseId = e, this.useProto3Json = n;
  }
}
function Gu(t, e) {
  return t.useProto3Json ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z` : {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function YP(t, e) {
  return t.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function JP(t, e) {
  return Gu(t, e.toTimestamp());
}
function Or(t) {
  return _e(!!t, 49232), de.fromTimestamp(function(n) {
    const r = hr(n);
    return new he(r.seconds, r.nanos);
  }(t));
}
function dy(t, e) {
  return qu(t, e).canonicalString();
}
function qu(t, e) {
  const n = function(s) {
    return new Ee(["projects", s.projectId, "databases", s.database]);
  }(t).child("documents");
  return e === void 0 ? n : n.child(e);
}
function XP(t) {
  const e = Ee.fromString(t);
  return _e(iD(e), 10190, {
    key: e.toString()
  }), e;
}
function zu(t, e) {
  return dy(t.databaseId, e.path);
}
function QP(t) {
  const e = XP(t);
  return e.length === 4 ? Ee.emptyPath() : eD(e);
}
function ZP(t) {
  return new Ee(["projects", t.databaseId.projectId, "databases", t.databaseId.database]).canonicalString();
}
function eD(t) {
  return _e(t.length > 4 && t.get(4) === "documents", 29091, {
    key: t.toString()
  }), t.popFirst(5);
}
function Sp(t, e, n) {
  return {
    name: zu(t, e),
    fields: n.value.mapValue.fields
  };
}
function tD(t, e) {
  let n;
  if (e instanceof Ci) n = {
    update: Sp(t, e.key, e.value)
  };
  else if (e instanceof ly) n = {
    delete: zu(t, e.key)
  };
  else if (e instanceof Er) n = {
    update: Sp(t, e.key, e.data),
    updateMask: sD(e.fieldMask)
  };
  else {
    if (!(e instanceof HP)) return G(16599, {
      Rt: e.type
    });
    n = {
      verify: zu(t, e.key)
    };
  }
  return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((r) => function(i, o) {
    const c = o.transform;
    if (c instanceof pa) return {
      fieldPath: o.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (c instanceof ii) return {
      fieldPath: o.field.canonicalString(),
      appendMissingElements: {
        values: c.elements
      }
    };
    if (c instanceof oi) return {
      fieldPath: o.field.canonicalString(),
      removeAllFromArray: {
        values: c.elements
      }
    };
    if (c instanceof ma) return {
      fieldPath: o.field.canonicalString(),
      increment: c.Ee
    };
    throw G(20930, {
      transform: o.transform
    });
  }(0, r))), e.precondition.isNone || (n.currentDocument = function(s, i) {
    return i.updateTime !== void 0 ? {
      updateTime: JP(s, i.updateTime)
    } : i.exists !== void 0 ? {
      exists: i.exists
    } : G(27497);
  }(t, e.precondition)), n;
}
function nD(t, e) {
  return t && t.length > 0 ? (_e(e !== void 0, 14353), t.map((n) => function(s, i) {
    let o = s.updateTime ? Or(s.updateTime) : Or(i);
    return o.isEqual(de.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (o = Or(i)), new BP(o, s.transformResults || []);
  }(n, e))) : [];
}
function rD(t) {
  let e = QP(t.parent);
  const n = t.structuredQuery, r = n.from ? n.from.length : 0;
  let s = null;
  if (r > 0) {
    _e(r === 1, 65062);
    const f = n.from[0];
    f.allDescendants ? s = f.collectionId : e = e.child(f.collectionId);
  }
  let i = [];
  n.where && (i = function(p) {
    const _ = hy(p);
    return _ instanceof Pn && K_(_) ? _.getFilters() : [_];
  }(n.where));
  let o = [];
  n.orderBy && (o = function(p) {
    return p.map((_) => function(w) {
      return new ha(
        Cr(w.field),
        // visible for testing
        function(P) {
          switch (P) {
            case "ASCENDING":
              return "asc";
            case "DESCENDING":
              return "desc";
            default:
              return;
          }
        }(w.direction)
      );
    }(_));
  }(n.orderBy));
  let c = null;
  n.limit && (c = function(p) {
    let _;
    return _ = typeof p == "object" ? p.value : p, Jl(_) ? null : _;
  }(n.limit));
  let u = null;
  n.startAt && (u = function(p) {
    const _ = !!p.before, T = p.values || [];
    return new da(T, _);
  }(n.startAt));
  let d = null;
  return n.endAt && (d = function(p) {
    const _ = !p.before, T = p.values || [];
    return new da(T, _);
  }(n.endAt)), bP(e, s, o, i, c, "F", u, d);
}
function hy(t) {
  return t.unaryFilter !== void 0 ? function(n) {
    switch (n.unaryFilter.op) {
      case "IS_NAN":
        const r = Cr(n.unaryFilter.field);
        return Pe.create(r, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const s = Cr(n.unaryFilter.field);
        return Pe.create(s, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const i = Cr(n.unaryFilter.field);
        return Pe.create(i, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const o = Cr(n.unaryFilter.field);
        return Pe.create(o, "!=", {
          nullValue: "NULL_VALUE"
        });
      case "OPERATOR_UNSPECIFIED":
        return G(61313);
      default:
        return G(60726);
    }
  }(t) : t.fieldFilter !== void 0 ? function(n) {
    return Pe.create(Cr(n.fieldFilter.field), function(s) {
      switch (s) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        case "OPERATOR_UNSPECIFIED":
          return G(58110);
        default:
          return G(50506);
      }
    }(n.fieldFilter.op), n.fieldFilter.value);
  }(t) : t.compositeFilter !== void 0 ? function(n) {
    return Pn.create(n.compositeFilter.filters.map((r) => hy(r)), function(s) {
      switch (s) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return G(1026);
      }
    }(n.compositeFilter.op));
  }(t) : G(30097, {
    filter: t
  });
}
function Cr(t) {
  return Le.fromServerFormat(t.fieldPath);
}
function sD(t) {
  const e = [];
  return t.fields.forEach((n) => e.push(n.canonicalString())), {
    fieldPaths: e
  };
}
function iD(t) {
  return t.length >= 4 && t.get(0) === "projects" && t.get(2) === "databases";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class oD {
  constructor(e) {
    this.gt = e;
  }
}
function aD(t) {
  const e = rD({
    parent: t.parent,
    structuredQuery: t.structuredQuery
  });
  return t.limitType === "LAST" ? Hu(
    e,
    e.limit,
    "L"
    /* LimitType.Last */
  ) : e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cD {
  constructor() {
    this.Dn = new uD();
  }
  addToCollectionParentIndex(e, n) {
    return this.Dn.add(n), C.resolve();
  }
  getCollectionParents(e, n) {
    return C.resolve(this.Dn.getEntries(n));
  }
  addFieldIndex(e, n) {
    return C.resolve();
  }
  deleteFieldIndex(e, n) {
    return C.resolve();
  }
  deleteAllFieldIndexes(e) {
    return C.resolve();
  }
  createTargetIndexes(e, n) {
    return C.resolve();
  }
  getDocumentsMatchingTarget(e, n) {
    return C.resolve(null);
  }
  getIndexType(e, n) {
    return C.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(e, n) {
    return C.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return C.resolve(null);
  }
  getMinOffset(e, n) {
    return C.resolve(Cn.min());
  }
  getMinOffsetFromCollectionGroup(e, n) {
    return C.resolve(Cn.min());
  }
  updateCollectionGroup(e, n, r) {
    return C.resolve();
  }
  updateIndexEntries(e, n) {
    return C.resolve();
  }
}
class uD {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(e) {
    const n = e.lastSegment(), r = e.popLast(), s = this.index[n] || new xe(Ee.comparator), i = !s.has(r);
    return this.index[n] = s.add(r), i;
  }
  has(e) {
    const n = e.lastSegment(), r = e.popLast(), s = this.index[n];
    return s && s.has(r);
  }
  getEntries(e) {
    return (this.index[e] || new xe(Ee.comparator)).toArray();
  }
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Tp = {
  didRun: !1,
  sequenceNumbersCollected: 0,
  targetsRemoved: 0,
  documentsRemoved: 0
}, fy = 41943040;
class et {
  static withCacheSize(e) {
    return new et(e, et.DEFAULT_COLLECTION_PERCENTILE, et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
  }
  constructor(e, n, r) {
    this.cacheSizeCollectionThreshold = e, this.percentileToCollect = n, this.maximumSequenceNumbersToCollect = r;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
et.DEFAULT_COLLECTION_PERCENTILE = 10, et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, et.DEFAULT = new et(fy, et.DEFAULT_COLLECTION_PERCENTILE, et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), et.DISABLED = new et(-1, 0, 0);
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xr {
  constructor(e) {
    this._r = e;
  }
  next() {
    return this._r += 2, this._r;
  }
  static ar() {
    return new Xr(0);
  }
  static ur() {
    return new Xr(-1);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ip = "LruGarbageCollector", lD = 1048576;
function wp([t, e], [n, r]) {
  const s = X(t, n);
  return s === 0 ? X(e, r) : s;
}
class dD {
  constructor(e) {
    this.Tr = e, this.buffer = new xe(wp), this.Ir = 0;
  }
  dr() {
    return ++this.Ir;
  }
  Er(e) {
    const n = [e, this.dr()];
    if (this.buffer.size < this.Tr) this.buffer = this.buffer.add(n);
    else {
      const r = this.buffer.last();
      wp(n, r) < 0 && (this.buffer = this.buffer.delete(r).add(n));
    }
  }
  get maxValue() {
    return this.buffer.last()[0];
  }
}
class hD {
  constructor(e, n, r) {
    this.garbageCollector = e, this.asyncQueue = n, this.localStore = r, this.Ar = null;
  }
  start() {
    this.garbageCollector.params.cacheSizeCollectionThreshold !== -1 && this.Rr(6e4);
  }
  stop() {
    this.Ar && (this.Ar.cancel(), this.Ar = null);
  }
  get started() {
    return this.Ar !== null;
  }
  Rr(e) {
    L(Ip, `Garbage collection scheduled in ${e}ms`), this.Ar = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection", e, async () => {
      this.Ar = null;
      try {
        await this.localStore.collectGarbage(this.garbageCollector);
      } catch (n) {
        Ri(n) ? L(Ip, "Ignoring IndexedDB error during garbage collection: ", n) : await Wl(n);
      }
      await this.Rr(3e5);
    });
  }
}
class fD {
  constructor(e, n) {
    this.Vr = e, this.params = n;
  }
  calculateTargetCount(e, n) {
    return this.Vr.mr(e).next((r) => Math.floor(n / 100 * r));
  }
  nthSequenceNumber(e, n) {
    if (n === 0) return C.resolve(Kl.ue);
    const r = new dD(n);
    return this.Vr.forEachTarget(e, (s) => r.Er(s.sequenceNumber)).next(() => this.Vr.gr(e, (s) => r.Er(s))).next(() => r.maxValue);
  }
  removeTargets(e, n, r) {
    return this.Vr.removeTargets(e, n, r);
  }
  removeOrphanedDocuments(e, n) {
    return this.Vr.removeOrphanedDocuments(e, n);
  }
  collect(e, n) {
    return this.params.cacheSizeCollectionThreshold === -1 ? (L("LruGarbageCollector", "Garbage collection skipped; disabled"), C.resolve(Tp)) : this.getCacheSize(e).next((r) => r < this.params.cacheSizeCollectionThreshold ? (L("LruGarbageCollector", `Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), Tp) : this.pr(e, n));
  }
  getCacheSize(e) {
    return this.Vr.getCacheSize(e);
  }
  pr(e, n) {
    let r, s, i, o, c, u, d;
    const f = Date.now();
    return this.calculateTargetCount(e, this.params.percentileToCollect).next((p) => (
      // Cap at the configured max
      (p > this.params.maximumSequenceNumbersToCollect ? (L("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`), s = this.params.maximumSequenceNumbersToCollect) : s = p, o = Date.now(), this.nthSequenceNumber(e, s))
    )).next((p) => (r = p, c = Date.now(), this.removeTargets(e, r, n))).next((p) => (i = p, u = Date.now(), this.removeOrphanedDocuments(e, r))).next((p) => (d = Date.now(), Rr() <= z.DEBUG && L("LruGarbageCollector", `LRU Garbage Collection
	Counted targets in ${o - f}ms
	Determined least recently used ${s} in ` + (c - o) + `ms
	Removed ${i} targets in ` + (u - c) + `ms
	Removed ${p} documents in ` + (d - u) + `ms
Total Duration: ${d - f}ms`), C.resolve({
      didRun: !0,
      sequenceNumbersCollected: s,
      targetsRemoved: i,
      documentsRemoved: p
    })));
  }
}
function pD(t, e) {
  return new fD(t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class mD {
  constructor() {
    this.changes = new yr((e) => e.toString(), (e, n) => e.isEqual(n)), this.changesApplied = !1;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(e) {
    this.assertNotApplied(), this.changes.set(e.key, e);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(e, n) {
    this.assertNotApplied(), this.changes.set(e, _t.newInvalidDocument(e).setReadTime(n));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(e, n) {
    this.assertNotApplied();
    const r = this.changes.get(n);
    return r !== void 0 ? C.resolve(r) : this.getFromCache(e, n);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(e, n) {
    return this.getAllFromCache(e, n);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(e) {
    return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gD {
  constructor(e, n) {
    this.overlayedDocument = e, this.mutatedFields = n;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _D {
  constructor(e, n, r, s) {
    this.remoteDocumentCache = e, this.mutationQueue = n, this.documentOverlayCache = r, this.indexManager = s;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(e, n) {
    let r = null;
    return this.documentOverlayCache.getOverlay(e, n).next((s) => (r = s, this.remoteDocumentCache.getEntry(e, n))).next((s) => (r !== null && Gs(r.mutation, s, vt.empty(), he.now()), s));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(e, n) {
    return this.remoteDocumentCache.getEntries(e, n).next((r) => this.getLocalViewOfDocuments(e, r, je()).next(() => r));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(e, n, r = je()) {
    const s = Jn();
    return this.populateOverlays(e, s, n).next(() => this.computeViews(e, n, s, r).next((i) => {
      let o = po();
      return i.forEach((c, u) => {
        o = o.insert(c, u.overlayedDocument);
      }), o;
    }));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(e, n) {
    const r = Jn();
    return this.populateOverlays(e, r, n).next(() => this.computeViews(e, n, r, je()));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(e, n, r) {
    const s = [];
    return r.forEach((i) => {
      n.has(i) || s.push(i);
    }), this.documentOverlayCache.getOverlays(e, s).next((i) => {
      i.forEach((o, c) => {
        n.set(o, c);
      });
    });
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @return A map represents the local documents view.
   */
  computeViews(e, n, r, s) {
    let i = fa();
    const o = Hs(), c = function() {
      return Hs();
    }();
    return n.forEach((u, d) => {
      const f = r.get(d.key);
      s.has(d.key) && (f === void 0 || f.mutation instanceof Er) ? i = i.insert(d.key, d) : f !== void 0 ? (o.set(d.key, f.mutation.getFieldMask()), Gs(f.mutation, d, f.mutation.getFieldMask(), he.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        o.set(d.key, vt.empty())
      );
    }), this.recalculateAndSaveOverlays(e, i).next((u) => (u.forEach((d, f) => o.set(d, f)), n.forEach((d, f) => {
      var p;
      return c.set(d, new gD(f, (p = o.get(d)) !== null && p !== void 0 ? p : null));
    }), c));
  }
  recalculateAndSaveOverlays(e, n) {
    const r = Hs();
    let s = new tt((o, c) => o - c), i = je();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, n).next((o) => {
      for (const c of o) c.keys().forEach((u) => {
        const d = n.get(u);
        if (d === null) return;
        let f = r.get(u) || vt.empty();
        f = c.applyToLocalView(d, f), r.set(u, f);
        const p = (s.get(c.batchId) || je()).add(u);
        s = s.insert(c.batchId, p);
      });
    }).next(() => {
      const o = [], c = s.getReverseIterator();
      for (; c.hasNext(); ) {
        const u = c.getNext(), d = u.key, f = u.value, p = ny();
        f.forEach((_) => {
          if (!i.has(_)) {
            const T = cy(n.get(_), r.get(_));
            T !== null && p.set(_, T), i = i.add(_);
          }
        }), o.push(this.documentOverlayCache.saveOverlays(e, d, p));
      }
      return C.waitFor(o);
    }).next(() => r);
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(e, n) {
    return this.remoteDocumentCache.getEntries(e, n).next((r) => this.recalculateAndSaveOverlays(e, r));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   * @param context - A optional tracker to keep a record of important details
   *   during database local query execution.
   */
  getDocumentsMatchingQuery(e, n, r, s) {
    return function(o) {
      return j.isDocumentKey(o.path) && o.collectionGroup === null && o.filters.length === 0;
    }(n) ? this.getDocumentsMatchingDocumentQuery(e, n.path) : RP(n) ? this.getDocumentsMatchingCollectionGroupQuery(e, n, r, s) : this.getDocumentsMatchingCollectionQuery(e, n, r, s);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup The collection group for the documents.
   * @param offset The offset to index into.
   * @param count The number of documents to return
   * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(e, n, r, s) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, n, r, s).next((i) => {
      const o = s - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, n, r.largestBatchId, s - i.size) : C.resolve(Jn());
      let c = ri, u = i;
      return o.next((d) => C.forEach(d, (f, p) => (c < p.largestBatchId && (c = p.largestBatchId), i.get(f) ? C.resolve() : this.remoteDocumentCache.getEntry(e, f).next((_) => {
        u = u.insert(f, _);
      }))).next(() => this.populateOverlays(e, d, i)).next(() => this.computeViews(e, u, d, je())).next((f) => ({
        batchId: c,
        changes: ty(f)
      })));
    });
  }
  getDocumentsMatchingDocumentQuery(e, n) {
    return this.getDocument(e, new j(n)).next((r) => {
      let s = po();
      return r.isFoundDocument() && (s = s.insert(r.key, r)), s;
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, n, r, s) {
    const i = n.collectionGroup;
    let o = po();
    return this.indexManager.getCollectionParents(e, i).next((c) => C.forEach(c, (u) => {
      const d = function(p, _) {
        return new Ya(
          _,
          /*collectionGroup=*/
          null,
          p.explicitOrderBy.slice(),
          p.filters.slice(),
          p.limit,
          p.limitType,
          p.startAt,
          p.endAt
        );
      }(n, u.child(i));
      return this.getDocumentsMatchingCollectionQuery(e, d, r, s).next((f) => {
        f.forEach((p, _) => {
          o = o.insert(p, _);
        });
      });
    }).next(() => o));
  }
  getDocumentsMatchingCollectionQuery(e, n, r, s) {
    let i;
    return this.documentOverlayCache.getOverlaysForCollection(e, n.path, r.largestBatchId).next((o) => (i = o, this.remoteDocumentCache.getDocumentsMatchingQuery(e, n, r, i, s))).next((o) => {
      i.forEach((u, d) => {
        const f = d.getKey();
        o.get(f) === null && (o = o.insert(f, _t.newInvalidDocument(f)));
      });
      let c = po();
      return o.forEach((u, d) => {
        const f = i.get(u);
        f !== void 0 && Gs(f.mutation, d, vt.empty(), he.now()), // Finally, insert the documents that still match the query
        nd(n, d) && (c = c.insert(u, d));
      }), c;
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yD {
  constructor(e) {
    this.serializer = e, this.Br = /* @__PURE__ */ new Map(), this.Lr = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(e, n) {
    return C.resolve(this.Br.get(n));
  }
  saveBundleMetadata(e, n) {
    return this.Br.set(
      n.id,
      /** Decodes a BundleMetadata proto into a BundleMetadata object. */
      function(s) {
        return {
          id: s.id,
          version: s.version,
          createTime: Or(s.createTime)
        };
      }(n)
    ), C.resolve();
  }
  getNamedQuery(e, n) {
    return C.resolve(this.Lr.get(n));
  }
  saveNamedQuery(e, n) {
    return this.Lr.set(n.name, function(s) {
      return {
        name: s.name,
        query: aD(s.bundledQuery),
        readTime: Or(s.readTime)
      };
    }(n)), C.resolve();
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ED {
  constructor() {
    this.overlays = new tt(j.comparator), this.kr = /* @__PURE__ */ new Map();
  }
  getOverlay(e, n) {
    return C.resolve(this.overlays.get(n));
  }
  getOverlays(e, n) {
    const r = Jn();
    return C.forEach(n, (s) => this.getOverlay(e, s).next((i) => {
      i !== null && r.set(s, i);
    })).next(() => r);
  }
  saveOverlays(e, n, r) {
    return r.forEach((s, i) => {
      this.wt(e, n, i);
    }), C.resolve();
  }
  removeOverlaysForBatchId(e, n, r) {
    const s = this.kr.get(r);
    return s !== void 0 && (s.forEach((i) => this.overlays = this.overlays.remove(i)), this.kr.delete(r)), C.resolve();
  }
  getOverlaysForCollection(e, n, r) {
    const s = Jn(), i = n.length + 1, o = new j(n.child("")), c = this.overlays.getIteratorFrom(o);
    for (; c.hasNext(); ) {
      const u = c.getNext().value, d = u.getKey();
      if (!n.isPrefixOf(d.path)) break;
      d.path.length === i && u.largestBatchId > r && s.set(u.getKey(), u);
    }
    return C.resolve(s);
  }
  getOverlaysForCollectionGroup(e, n, r, s) {
    let i = new tt((d, f) => d - f);
    const o = this.overlays.getIterator();
    for (; o.hasNext(); ) {
      const d = o.getNext().value;
      if (d.getKey().getCollectionGroup() === n && d.largestBatchId > r) {
        let f = i.get(d.largestBatchId);
        f === null && (f = Jn(), i = i.insert(d.largestBatchId, f)), f.set(d.getKey(), d);
      }
    }
    const c = Jn(), u = i.getIterator();
    for (; u.hasNext() && (u.getNext().value.forEach((d, f) => c.set(d, f)), !(c.size() >= s)); )
      ;
    return C.resolve(c);
  }
  wt(e, n, r) {
    const s = this.overlays.get(r.key);
    if (s !== null) {
      const o = this.kr.get(s.largestBatchId).delete(r.key);
      this.kr.set(s.largestBatchId, o);
    }
    this.overlays = this.overlays.insert(r.key, new qP(n, r));
    let i = this.kr.get(n);
    i === void 0 && (i = je(), this.kr.set(n, i)), this.kr.set(n, i.add(r.key));
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class vD {
  constructor() {
    this.sessionToken = Mt.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return C.resolve(this.sessionToken);
  }
  setSessionToken(e, n) {
    return this.sessionToken = n, C.resolve();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class id {
  constructor() {
    this.qr = new xe(Re.Qr), // A set of outstanding references to a document sorted by target id.
    this.$r = new xe(Re.Ur);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.qr.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(e, n) {
    const r = new Re(e, n);
    this.qr = this.qr.add(r), this.$r = this.$r.add(r);
  }
  /** Add references to the given document keys for the given ID. */
  Kr(e, n) {
    e.forEach((r) => this.addReference(r, n));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(e, n) {
    this.Wr(new Re(e, n));
  }
  Gr(e, n) {
    e.forEach((r) => this.removeReference(r, n));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  zr(e) {
    const n = new j(new Ee([])), r = new Re(n, e), s = new Re(n, e + 1), i = [];
    return this.$r.forEachInRange([r, s], (o) => {
      this.Wr(o), i.push(o.key);
    }), i;
  }
  jr() {
    this.qr.forEach((e) => this.Wr(e));
  }
  Wr(e) {
    this.qr = this.qr.delete(e), this.$r = this.$r.delete(e);
  }
  Jr(e) {
    const n = new j(new Ee([])), r = new Re(n, e), s = new Re(n, e + 1);
    let i = je();
    return this.$r.forEachInRange([r, s], (o) => {
      i = i.add(o.key);
    }), i;
  }
  containsKey(e) {
    const n = new Re(e, 0), r = this.qr.firstAfterOrEqual(n);
    return r !== null && e.isEqual(r.key);
  }
}
class Re {
  constructor(e, n) {
    this.key = e, this.Hr = n;
  }
  /** Compare by key then by ID */
  static Qr(e, n) {
    return j.comparator(e.key, n.key) || X(e.Hr, n.Hr);
  }
  /** Compare by ID then by key */
  static Ur(e, n) {
    return X(e.Hr, n.Hr) || j.comparator(e.key, n.key);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class SD {
  constructor(e, n) {
    this.indexManager = e, this.referenceDelegate = n, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.er = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.Yr = new xe(Re.Qr);
  }
  checkEmpty(e) {
    return C.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, n, r, s) {
    const i = this.er;
    this.er++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const o = new GP(i, n, r, s);
    this.mutationQueue.push(o);
    for (const c of s) this.Yr = this.Yr.add(new Re(c.key, i)), this.indexManager.addToCollectionParentIndex(e, c.key.path.popLast());
    return C.resolve(o);
  }
  lookupMutationBatch(e, n) {
    return C.resolve(this.Zr(n));
  }
  getNextMutationBatchAfterBatchId(e, n) {
    const r = n + 1, s = this.Xr(r), i = s < 0 ? 0 : s;
    return C.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return C.resolve(this.mutationQueue.length === 0 ? Yl : this.er - 1);
  }
  getAllMutationBatches(e) {
    return C.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, n) {
    const r = new Re(n, 0), s = new Re(n, Number.POSITIVE_INFINITY), i = [];
    return this.Yr.forEachInRange([r, s], (o) => {
      const c = this.Zr(o.Hr);
      i.push(c);
    }), C.resolve(i);
  }
  getAllMutationBatchesAffectingDocumentKeys(e, n) {
    let r = new xe(X);
    return n.forEach((s) => {
      const i = new Re(s, 0), o = new Re(s, Number.POSITIVE_INFINITY);
      this.Yr.forEachInRange([i, o], (c) => {
        r = r.add(c.Hr);
      });
    }), C.resolve(this.ei(r));
  }
  getAllMutationBatchesAffectingQuery(e, n) {
    const r = n.path, s = r.length + 1;
    let i = r;
    j.isDocumentKey(i) || (i = i.child(""));
    const o = new Re(new j(i), 0);
    let c = new xe(X);
    return this.Yr.forEachWhile((u) => {
      const d = u.key.path;
      return !!r.isPrefixOf(d) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (d.length === s && (c = c.add(u.Hr)), !0);
    }, o), C.resolve(this.ei(c));
  }
  ei(e) {
    const n = [];
    return e.forEach((r) => {
      const s = this.Zr(r);
      s !== null && n.push(s);
    }), n;
  }
  removeMutationBatch(e, n) {
    _e(this.ti(n.batchId, "removed") === 0, 55003), this.mutationQueue.shift();
    let r = this.Yr;
    return C.forEach(n.mutations, (s) => {
      const i = new Re(s.key, n.batchId);
      return r = r.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, s.key);
    }).next(() => {
      this.Yr = r;
    });
  }
  rr(e) {
  }
  containsKey(e, n) {
    const r = new Re(n, 0), s = this.Yr.firstAfterOrEqual(r);
    return C.resolve(n.isEqual(s && s.key));
  }
  performConsistencyCheck(e) {
    return this.mutationQueue.length, C.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  ti(e, n) {
    return this.Xr(e);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been removed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  Xr(e) {
    return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficient.
   */
  Zr(e) {
    const n = this.Xr(e);
    return n < 0 || n >= this.mutationQueue.length ? null : this.mutationQueue[n];
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class TD {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(e) {
    this.ni = e, /** Underlying cache of documents and their read times. */
    this.docs = function() {
      return new tt(j.comparator);
    }(), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(e, n) {
    const r = n.key, s = this.docs.get(r), i = s ? s.size : 0, o = this.ni(n);
    return this.docs = this.docs.insert(r, {
      document: n.mutableCopy(),
      size: o
    }), this.size += o - i, this.indexManager.addToCollectionParentIndex(e, r.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(e) {
    const n = this.docs.get(e);
    n && (this.docs = this.docs.remove(e), this.size -= n.size);
  }
  getEntry(e, n) {
    const r = this.docs.get(n);
    return C.resolve(r ? r.document.mutableCopy() : _t.newInvalidDocument(n));
  }
  getEntries(e, n) {
    let r = fa();
    return n.forEach((s) => {
      const i = this.docs.get(s);
      r = r.insert(s, i ? i.document.mutableCopy() : _t.newInvalidDocument(s));
    }), C.resolve(r);
  }
  getDocumentsMatchingQuery(e, n, r, s) {
    let i = fa();
    const o = n.path, c = new j(o.child("__id-9223372036854775808__")), u = this.docs.getIteratorFrom(c);
    for (; u.hasNext(); ) {
      const { key: d, value: { document: f } } = u.getNext();
      if (!o.isPrefixOf(d.path)) break;
      d.path.length > o.length + 1 || nP(tP(f), r) <= 0 || (s.has(f.key) || nd(n, f)) && (i = i.insert(f.key, f.mutableCopy()));
    }
    return C.resolve(i);
  }
  getAllFromCollectionGroup(e, n, r, s) {
    G(9500);
  }
  ri(e, n) {
    return C.forEach(this.docs, (r) => n(r));
  }
  newChangeBuffer(e) {
    return new ID(this);
  }
  getSize(e) {
    return C.resolve(this.size);
  }
}
class ID extends mD {
  constructor(e) {
    super(), this.Or = e;
  }
  applyChanges(e) {
    const n = [];
    return this.changes.forEach((r, s) => {
      s.isValidDocument() ? n.push(this.Or.addEntry(e, s)) : this.Or.removeEntry(r);
    }), C.waitFor(n);
  }
  getFromCache(e, n) {
    return this.Or.getEntry(e, n);
  }
  getAllFromCache(e, n) {
    return this.Or.getEntries(e, n);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wD {
  constructor(e) {
    this.persistence = e, /**
     * Maps a target to the data about that target
     */
    this.ii = new yr((n) => ed(n), td), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = de.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.si = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this.oi = new id(), this.targetCount = 0, this._i = Xr.ar();
  }
  forEachTarget(e, n) {
    return this.ii.forEach((r, s) => n(s)), C.resolve();
  }
  getLastRemoteSnapshotVersion(e) {
    return C.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return C.resolve(this.si);
  }
  allocateTargetId(e) {
    return this.highestTargetId = this._i.next(), C.resolve(this.highestTargetId);
  }
  setTargetsMetadata(e, n, r) {
    return r && (this.lastRemoteSnapshotVersion = r), n > this.si && (this.si = n), C.resolve();
  }
  hr(e) {
    this.ii.set(e.target, e);
    const n = e.targetId;
    n > this.highestTargetId && (this._i = new Xr(n), this.highestTargetId = n), e.sequenceNumber > this.si && (this.si = e.sequenceNumber);
  }
  addTargetData(e, n) {
    return this.hr(n), this.targetCount += 1, C.resolve();
  }
  updateTargetData(e, n) {
    return this.hr(n), C.resolve();
  }
  removeTargetData(e, n) {
    return this.ii.delete(n.target), this.oi.zr(n.targetId), this.targetCount -= 1, C.resolve();
  }
  removeTargets(e, n, r) {
    let s = 0;
    const i = [];
    return this.ii.forEach((o, c) => {
      c.sequenceNumber <= n && r.get(c.targetId) === null && (this.ii.delete(o), i.push(this.removeMatchingKeysForTargetId(e, c.targetId)), s++);
    }), C.waitFor(i).next(() => s);
  }
  getTargetCount(e) {
    return C.resolve(this.targetCount);
  }
  getTargetData(e, n) {
    const r = this.ii.get(n) || null;
    return C.resolve(r);
  }
  addMatchingKeys(e, n, r) {
    return this.oi.Kr(n, r), C.resolve();
  }
  removeMatchingKeys(e, n, r) {
    this.oi.Gr(n, r);
    const s = this.persistence.referenceDelegate, i = [];
    return s && n.forEach((o) => {
      i.push(s.markPotentiallyOrphaned(e, o));
    }), C.waitFor(i);
  }
  removeMatchingKeysForTargetId(e, n) {
    return this.oi.zr(n), C.resolve();
  }
  getMatchingKeysForTargetId(e, n) {
    const r = this.oi.Jr(n);
    return C.resolve(r);
  }
  containsKey(e, n) {
    return C.resolve(this.oi.containsKey(n));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class py {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(e, n) {
    this.ai = {}, this.overlays = {}, this.ui = new Kl(0), this.ci = !1, this.ci = !0, this.li = new vD(), this.referenceDelegate = e(this), this.hi = new wD(this), this.indexManager = new cD(), this.remoteDocumentCache = function(s) {
      return new TD(s);
    }((r) => this.referenceDelegate.Pi(r)), this.serializer = new oD(n), this.Ti = new yD(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.ci = !1, Promise.resolve();
  }
  get started() {
    return this.ci;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let n = this.overlays[e.toKey()];
    return n || (n = new ED(), this.overlays[e.toKey()] = n), n;
  }
  getMutationQueue(e, n) {
    let r = this.ai[e.toKey()];
    return r || (r = new SD(n, this.referenceDelegate), this.ai[e.toKey()] = r), r;
  }
  getGlobalsCache() {
    return this.li;
  }
  getTargetCache() {
    return this.hi;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Ti;
  }
  runTransaction(e, n, r) {
    L("MemoryPersistence", "Starting transaction:", e);
    const s = new bD(this.ui.next());
    return this.referenceDelegate.Ii(), r(s).next((i) => this.referenceDelegate.di(s).next(() => i)).toPromise().then((i) => (s.raiseOnCommittedEvent(), i));
  }
  Ei(e, n) {
    return C.or(Object.values(this.ai).map((r) => () => r.containsKey(e, n)));
  }
}
class bD extends sP {
  constructor(e) {
    super(), this.currentSequenceNumber = e;
  }
}
class od {
  constructor(e) {
    this.persistence = e, /** Tracks all documents that are active in Query views. */
    this.Ai = new id(), /** The list of documents that are potentially GCed after each transaction. */
    this.Ri = null;
  }
  static Vi(e) {
    return new od(e);
  }
  get mi() {
    if (this.Ri) return this.Ri;
    throw G(60996);
  }
  addReference(e, n, r) {
    return this.Ai.addReference(r, n), this.mi.delete(r.toString()), C.resolve();
  }
  removeReference(e, n, r) {
    return this.Ai.removeReference(r, n), this.mi.add(r.toString()), C.resolve();
  }
  markPotentiallyOrphaned(e, n) {
    return this.mi.add(n.toString()), C.resolve();
  }
  removeTarget(e, n) {
    this.Ai.zr(n.targetId).forEach((s) => this.mi.add(s.toString()));
    const r = this.persistence.getTargetCache();
    return r.getMatchingKeysForTargetId(e, n.targetId).next((s) => {
      s.forEach((i) => this.mi.add(i.toString()));
    }).next(() => r.removeTargetData(e, n));
  }
  Ii() {
    this.Ri = /* @__PURE__ */ new Set();
  }
  di(e) {
    const n = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return C.forEach(this.mi, (r) => {
      const s = j.fromPath(r);
      return this.fi(e, s).next((i) => {
        i || n.removeEntry(s, de.min());
      });
    }).next(() => (this.Ri = null, n.apply(e)));
  }
  updateLimboDocument(e, n) {
    return this.fi(e, n).next((r) => {
      r ? this.mi.delete(n.toString()) : this.mi.add(n.toString());
    });
  }
  Pi(e) {
    return 0;
  }
  fi(e, n) {
    return C.or([() => C.resolve(this.Ai.containsKey(n)), () => this.persistence.getTargetCache().containsKey(e, n), () => this.persistence.Ei(e, n)]);
  }
}
class ga {
  constructor(e, n) {
    this.persistence = e, this.gi = new yr((r) => aP(r.path), (r, s) => r.isEqual(s)), this.garbageCollector = pD(this, n);
  }
  static Vi(e, n) {
    return new ga(e, n);
  }
  // No-ops, present so memory persistence doesn't have to care which delegate
  // it has.
  Ii() {
  }
  di(e) {
    return C.resolve();
  }
  forEachTarget(e, n) {
    return this.persistence.getTargetCache().forEachTarget(e, n);
  }
  mr(e) {
    const n = this.yr(e);
    return this.persistence.getTargetCache().getTargetCount(e).next((r) => n.next((s) => r + s));
  }
  yr(e) {
    let n = 0;
    return this.gr(e, (r) => {
      n++;
    }).next(() => n);
  }
  gr(e, n) {
    return C.forEach(this.gi, (r, s) => this.Sr(e, r, s).next((i) => i ? C.resolve() : n(s)));
  }
  removeTargets(e, n, r) {
    return this.persistence.getTargetCache().removeTargets(e, n, r);
  }
  removeOrphanedDocuments(e, n) {
    let r = 0;
    const s = this.persistence.getRemoteDocumentCache(), i = s.newChangeBuffer();
    return s.ri(e, (o) => this.Sr(e, o, n).next((c) => {
      c || (r++, i.removeEntry(o, de.min()));
    })).next(() => i.apply(e)).next(() => r);
  }
  markPotentiallyOrphaned(e, n) {
    return this.gi.set(n, e.currentSequenceNumber), C.resolve();
  }
  removeTarget(e, n) {
    const r = n.withSequenceNumber(e.currentSequenceNumber);
    return this.persistence.getTargetCache().updateTargetData(e, r);
  }
  addReference(e, n, r) {
    return this.gi.set(r, e.currentSequenceNumber), C.resolve();
  }
  removeReference(e, n, r) {
    return this.gi.set(r, e.currentSequenceNumber), C.resolve();
  }
  updateLimboDocument(e, n) {
    return this.gi.set(n, e.currentSequenceNumber), C.resolve();
  }
  Pi(e) {
    let n = e.key.toString().length;
    return e.isFoundDocument() && (n += Oo(e.data.value)), n;
  }
  Sr(e, n, r) {
    return C.or([() => this.persistence.Ei(e, n), () => this.persistence.getTargetCache().containsKey(e, n), () => {
      const s = this.gi.get(n);
      return C.resolve(s !== void 0 && s > r);
    }]);
  }
  getCacheSize(e) {
    return this.persistence.getRemoteDocumentCache().getSize(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ad {
  constructor(e, n, r, s) {
    this.targetId = e, this.fromCache = n, this.Is = r, this.ds = s;
  }
  static Es(e, n) {
    let r = je(), s = je();
    for (const i of n.docChanges) switch (i.type) {
      case 0:
        r = r.add(i.doc.key);
        break;
      case 1:
        s = s.add(i.doc.key);
    }
    return new ad(e, n.fromCache, r, s);
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AD {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class RD {
  constructor() {
    this.As = !1, this.Rs = !1, /**
     * SDK only decides whether it should create index when collection size is
     * larger than this.
     */
    this.Vs = 100, this.fs = /**
    * This cost represents the evaluation result of
    * (([index, docKey] + [docKey, docContent]) per document in the result set)
    * / ([docKey, docContent] per documents in full collection scan) coming from
    * experiment [enter PR experiment URL here].
    */
    function() {
      return I0() ? 8 : iP(qe()) > 0 ? 6 : 4;
    }();
  }
  /** Sets the document view to query against. */
  initialize(e, n) {
    this.gs = e, this.indexManager = n, this.As = !0;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(e, n, r, s) {
    const i = {
      result: null
    };
    return this.ps(e, n).next((o) => {
      i.result = o;
    }).next(() => {
      if (!i.result) return this.ys(e, n, s, r).next((o) => {
        i.result = o;
      });
    }).next(() => {
      if (i.result) return;
      const o = new AD();
      return this.ws(e, n, o).next((c) => {
        if (i.result = c, this.Rs) return this.Ss(e, n, o, c.size);
      });
    }).next(() => i.result);
  }
  Ss(e, n, r, s) {
    return r.documentReadCount < this.Vs ? (Rr() <= z.DEBUG && L("QueryEngine", "SDK will not create cache indexes for query:", Cs(n), "since it only creates cache indexes for collection contains", "more than or equal to", this.Vs, "documents"), C.resolve()) : (Rr() <= z.DEBUG && L("QueryEngine", "Query:", Cs(n), "scans", r.documentReadCount, "local documents and returns", s, "documents as results."), r.documentReadCount > this.fs * s ? (Rr() <= z.DEBUG && L("QueryEngine", "The SDK decides to create cache indexes for query:", Cs(n), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, nr(n))) : C.resolve());
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  ps(e, n) {
    if (gp(n))
      return C.resolve(null);
    let r = nr(n);
    return this.indexManager.getIndexType(e, r).next((s) => s === 0 ? null : (n.limit !== null && s === 1 && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (n = Hu(
      n,
      null,
      "F"
      /* LimitType.First */
    ), r = nr(n)), this.indexManager.getDocumentsMatchingTarget(e, r).next((i) => {
      const o = je(...i);
      return this.gs.getDocuments(e, o).next((c) => this.indexManager.getMinOffset(e, r).next((u) => {
        const d = this.bs(n, c);
        return this.Ds(n, d, o, u.readTime) ? this.ps(e, Hu(
          n,
          null,
          "F"
          /* LimitType.First */
        )) : this.vs(e, d, n, u);
      }));
    })));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  ys(e, n, r, s) {
    return gp(n) || s.isEqual(de.min()) ? C.resolve(null) : this.gs.getDocuments(e, r).next((i) => {
      const o = this.bs(n, i);
      return this.Ds(n, o, r, s) ? C.resolve(null) : (Rr() <= z.DEBUG && L("QueryEngine", "Re-using previous result from %s to execute query: %s", s.toString(), Cs(n)), this.vs(e, o, n, eP(s, ri)).next((c) => c));
    });
  }
  /** Applies the query filter and sorting to the provided documents.  */
  bs(e, n) {
    let r = new xe(PP(e));
    return n.forEach((s, i) => {
      nd(e, i) && (r = r.add(i));
    }), r;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  Ds(e, n, r, s) {
    if (e.limit === null)
      return !1;
    if (r.size !== n.size)
      return !0;
    const i = e.limitType === "F" ? n.last() : n.first();
    return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
  }
  ws(e, n, r) {
    return Rr() <= z.DEBUG && L("QueryEngine", "Using full collection scan to execute query:", Cs(n)), this.gs.getDocumentsMatchingQuery(e, n, Cn.min(), r);
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  vs(e, n, r, s) {
    return this.gs.getDocumentsMatchingQuery(e, r, s).next((i) => (
      // Merge with existing results
      (n.forEach((o) => {
        i = i.insert(o.key, o);
      }), i)
    ));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const CD = "LocalStore";
class PD {
  constructor(e, n, r, s) {
    this.persistence = e, this.Cs = n, this.serializer = s, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.Fs = new tt(X), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this.Ms = new yr((i) => ed(i), td), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.xs = /* @__PURE__ */ new Map(), this.Os = e.getRemoteDocumentCache(), this.hi = e.getTargetCache(), this.Ti = e.getBundleCache(), this.Ns(r);
  }
  Ns(e) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new _D(this.Os, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Os.setIndexManager(this.indexManager), this.Cs.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(e) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (n) => e.collect(n, this.Fs));
  }
}
function DD(t, e, n, r) {
  return new PD(t, e, n, r);
}
async function my(t, e) {
  const n = ae(t);
  return await n.persistence.runTransaction("Handle user change", "readonly", (r) => {
    let s;
    return n.mutationQueue.getAllMutationBatches(r).next((i) => (s = i, n.Ns(e), n.mutationQueue.getAllMutationBatches(r))).next((i) => {
      const o = [], c = [];
      let u = je();
      for (const d of s) {
        o.push(d.batchId);
        for (const f of d.mutations) u = u.add(f.key);
      }
      for (const d of i) {
        c.push(d.batchId);
        for (const f of d.mutations) u = u.add(f.key);
      }
      return n.localDocuments.getDocuments(r, u).next((d) => ({
        Bs: d,
        removedBatchIds: o,
        addedBatchIds: c
      }));
    });
  });
}
function kD(t, e) {
  const n = ae(t);
  return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (r) => {
    const s = e.batch.keys(), i = n.Os.newChangeBuffer({
      trackRemovals: !0
    });
    return function(c, u, d, f) {
      const p = d.batch, _ = p.keys();
      let T = C.resolve();
      return _.forEach((w) => {
        T = T.next(() => f.getEntry(u, w)).next((k) => {
          const P = d.docVersions.get(w);
          _e(P !== null, 48541), k.version.compareTo(P) < 0 && (p.applyToRemoteDocument(k, d), k.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (k.setReadTime(d.commitVersion), f.addEntry(k)));
        });
      }), T.next(() => c.mutationQueue.removeMutationBatch(u, p));
    }(n, r, e, i).next(() => i.apply(r)).next(() => n.mutationQueue.performConsistencyCheck(r)).next(() => n.documentOverlayCache.removeOverlaysForBatchId(r, s, e.batch.batchId)).next(() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r, function(c) {
      let u = je();
      for (let d = 0; d < c.mutationResults.length; ++d)
        c.mutationResults[d].transformResults.length > 0 && (u = u.add(c.batch.mutations[d].key));
      return u;
    }(e))).next(() => n.localDocuments.getDocuments(r, s));
  });
}
function ND(t) {
  const e = ae(t);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (n) => e.hi.getLastRemoteSnapshotVersion(n));
}
function OD(t, e) {
  const n = ae(t);
  return n.persistence.runTransaction("Get next mutation batch", "readonly", (r) => (e === void 0 && (e = Yl), n.mutationQueue.getNextMutationBatchAfterBatchId(r, e)));
}
class bp {
  constructor() {
    this.activeTargetIds = LP();
  }
  Gs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  zs(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  Ws() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(e);
  }
}
class MD {
  constructor() {
    this.Fo = new bp(), this.Mo = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(e) {
  }
  updateMutationState(e, n, r) {
  }
  addLocalQueryTarget(e, n = !0) {
    return n && this.Fo.Gs(e), this.Mo[e] || "not-current";
  }
  updateQueryState(e, n, r) {
    this.Mo[e] = n;
  }
  removeLocalQueryTarget(e) {
    this.Fo.zs(e);
  }
  isLocalQueryTarget(e) {
    return this.Fo.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.Mo[e];
  }
  getAllActiveQueryTargets() {
    return this.Fo.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.Fo.activeTargetIds.has(e);
  }
  start() {
    return this.Fo = new bp(), Promise.resolve();
  }
  handleUserChange(e, n, r) {
  }
  setOnlineState(e) {
  }
  shutdown() {
  }
  writeSequenceNumber(e) {
  }
  notifyBundleLoaded(e) {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class LD {
  xo(e) {
  }
  shutdown() {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ap = "ConnectivityMonitor";
class Rp {
  constructor() {
    this.Oo = () => this.No(), this.Bo = () => this.Lo(), this.ko = [], this.qo();
  }
  xo(e) {
    this.ko.push(e);
  }
  shutdown() {
    window.removeEventListener("online", this.Oo), window.removeEventListener("offline", this.Bo);
  }
  qo() {
    window.addEventListener("online", this.Oo), window.addEventListener("offline", this.Bo);
  }
  No() {
    L(Ap, "Network connectivity changed: AVAILABLE");
    for (const e of this.ko) e(
      0
      /* NetworkStatus.AVAILABLE */
    );
  }
  Lo() {
    L(Ap, "Network connectivity changed: UNAVAILABLE");
    for (const e of this.ko) e(
      1
      /* NetworkStatus.UNAVAILABLE */
    );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static C() {
    return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let mo = null;
function Wu() {
  return mo === null ? mo = function() {
    return 268435456 + Math.round(2147483648 * Math.random());
  }() : mo++, "0x" + mo.toString(16);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Xc = "RestConnection", xD = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery"
};
class VD {
  get Qo() {
    return !1;
  }
  constructor(e) {
    this.databaseInfo = e, this.databaseId = e.databaseId;
    const n = e.ssl ? "https" : "http", r = encodeURIComponent(this.databaseId.projectId), s = encodeURIComponent(this.databaseId.database);
    this.$o = n + "://" + e.host, this.Uo = `projects/${r}/databases/${s}`, this.Ko = this.databaseId.database === ua ? `project_id=${r}` : `project_id=${r}&database_id=${s}`;
  }
  Wo(e, n, r, s, i) {
    const o = Wu(), c = this.Go(e, n.toUriEncodedString());
    L(Xc, `Sending RPC '${e}' ${o}:`, c, r);
    const u = {
      "google-cloud-resource-prefix": this.Uo,
      "x-goog-request-params": this.Ko
    };
    this.zo(u, s, i);
    const { host: d } = new URL(c), f = cs(d);
    return this.jo(e, c, u, r, f).then((p) => (L(Xc, `Received RPC '${e}' ${o}: `, p), p), (p) => {
      throw zr(Xc, `RPC '${e}' ${o} failed with error: `, p, "url: ", c, "request:", r), p;
    });
  }
  Jo(e, n, r, s, i, o) {
    return this.Wo(e, n, r, s, i);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  zo(e, n, r) {
    e["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    function() {
      return "gl-js/ fire/" + ls;
    }(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), n && n.headers.forEach((s, i) => e[i] = s), r && r.headers.forEach((s, i) => e[i] = s);
  }
  Go(e, n) {
    const r = xD[e];
    return `${this.$o}/v1/${n}:${r}`;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class UD {
  constructor(e) {
    this.Ho = e.Ho, this.Yo = e.Yo;
  }
  Zo(e) {
    this.Xo = e;
  }
  e_(e) {
    this.t_ = e;
  }
  n_(e) {
    this.r_ = e;
  }
  onMessage(e) {
    this.i_ = e;
  }
  close() {
    this.Yo();
  }
  send(e) {
    this.Ho(e);
  }
  s_() {
    this.Xo();
  }
  o_() {
    this.t_();
  }
  __(e) {
    this.r_(e);
  }
  a_(e) {
    this.i_(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Be = "WebChannelConnection";
class FD extends VD {
  constructor(e) {
    super(e), /** A collection of open WebChannel instances */
    this.u_ = [], this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
  }
  jo(e, n, r, s, i) {
    const o = Wu();
    return new Promise((c, u) => {
      const d = new P_();
      d.setWithCredentials(!0), d.listenOnce(D_.COMPLETE, () => {
        try {
          switch (d.getLastErrorCode()) {
            case No.NO_ERROR:
              const p = d.getResponseJson();
              L(Be, `XHR for RPC '${e}' ${o} received:`, JSON.stringify(p)), c(p);
              break;
            case No.TIMEOUT:
              L(Be, `RPC '${e}' ${o} timed out`), u(new V(D.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case No.HTTP_ERROR:
              const _ = d.getStatus();
              if (L(Be, `RPC '${e}' ${o} failed with status:`, _, "response text:", d.getResponseText()), _ > 0) {
                let T = d.getResponseJson();
                Array.isArray(T) && (T = T[0]);
                const w = T?.error;
                if (w && w.status && w.message) {
                  const k = function(B) {
                    const U = B.toLowerCase().replace(/_/g, "-");
                    return Object.values(D).indexOf(U) >= 0 ? U : D.UNKNOWN;
                  }(w.status);
                  u(new V(k, w.message));
                } else u(new V(D.UNKNOWN, "Server responded with status " + d.getStatus()));
              } else
                u(new V(D.UNAVAILABLE, "Connection failed."));
              break;
            default:
              G(9055, {
                c_: e,
                streamId: o,
                l_: d.getLastErrorCode(),
                h_: d.getLastError()
              });
          }
        } finally {
          L(Be, `RPC '${e}' ${o} completed.`);
        }
      });
      const f = JSON.stringify(s);
      L(Be, `RPC '${e}' ${o} sending request:`, s), d.send(n, "POST", f, r, 15);
    });
  }
  P_(e, n, r) {
    const s = Wu(), i = [this.$o, "/", "google.firestore.v1.Firestore", "/", e, "/channel"], o = O_(), c = N_(), u = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: !0,
      supportsCrossDomainXhr: !0,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, d = this.longPollingOptions.timeoutSeconds;
    d !== void 0 && (u.longPollingTimeout = Math.round(1e3 * d)), this.useFetchStreams && (u.useFetchStreams = !0), this.zo(u.initMessageHeaders, n, r), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    u.encodeInitMessageHeaders = !0;
    const f = i.join("");
    L(Be, `Creating RPC '${e}' stream ${s}: ${f}`, u);
    const p = o.createWebChannel(f, u);
    this.T_(p);
    let _ = !1, T = !1;
    const w = new UD({
      Ho: (P) => {
        T ? L(Be, `Not sending because RPC '${e}' stream ${s} is closed:`, P) : (_ || (L(Be, `Opening RPC '${e}' stream ${s} transport.`), p.open(), _ = !0), L(Be, `RPC '${e}' stream ${s} sending:`, P), p.send(P));
      },
      Yo: () => p.close()
    }), k = (P, B, U) => {
      P.listen(B, (H) => {
        try {
          U(H);
        } catch (ne) {
          setTimeout(() => {
            throw ne;
          }, 0);
        }
      });
    };
    return k(p, Ms.EventType.OPEN, () => {
      T || (L(Be, `RPC '${e}' stream ${s} transport opened.`), w.s_());
    }), k(p, Ms.EventType.CLOSE, () => {
      T || (T = !0, L(Be, `RPC '${e}' stream ${s} transport closed`), w.__(), this.I_(p));
    }), k(p, Ms.EventType.ERROR, (P) => {
      T || (T = !0, zr(Be, `RPC '${e}' stream ${s} transport errored. Name:`, P.name, "Message:", P.message), w.__(new V(D.UNAVAILABLE, "The operation could not be completed")));
    }), k(p, Ms.EventType.MESSAGE, (P) => {
      var B;
      if (!T) {
        const U = P.data[0];
        _e(!!U, 16349);
        const H = U, ne = H?.error || ((B = H[0]) === null || B === void 0 ? void 0 : B.error);
        if (ne) {
          L(Be, `RPC '${e}' stream ${s} received error:`, ne);
          const De = ne.status;
          let ce = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            function(E) {
              const S = Se[E];
              if (S !== void 0) return WP(S);
            }(De)
          ), v = ne.message;
          ce === void 0 && (ce = D.INTERNAL, v = "Unknown error status: " + De + " with message " + ne.message), // Mark closed so no further events are propagated
          T = !0, w.__(new V(ce, v)), p.close();
        } else L(Be, `RPC '${e}' stream ${s} received:`, U), w.a_(U);
      }
    }), k(c, k_.STAT_EVENT, (P) => {
      P.stat === xu.PROXY ? L(Be, `RPC '${e}' stream ${s} detected buffering proxy`) : P.stat === xu.NOPROXY && L(Be, `RPC '${e}' stream ${s} detected no buffering proxy`);
    }), setTimeout(() => {
      w.o_();
    }, 0), w;
  }
  /**
   * Closes and cleans up any resources associated with the connection.
   */
  terminate() {
    this.u_.forEach((e) => e.close()), this.u_ = [];
  }
  /**
   * Add a WebChannel instance to the collection of open instances.
   * @param webChannel
   */
  T_(e) {
    this.u_.push(e);
  }
  /**
   * Remove a WebChannel instance from the collection of open instances.
   * @param webChannel
   */
  I_(e) {
    this.u_ = this.u_.filter((n) => n === e);
  }
}
function Qc() {
  return typeof document < "u" ? document : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Qa(t) {
  return new KP(
    t,
    /* useProto3Json= */
    !0
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gy {
  constructor(e, n, r = 1e3, s = 1.5, i = 6e4) {
    this.Fi = e, this.timerId = n, this.d_ = r, this.E_ = s, this.A_ = i, this.R_ = 0, this.V_ = null, /** The last backoff attempt, as epoch milliseconds. */
    this.m_ = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.R_ = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  f_() {
    this.R_ = this.A_;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  g_(e) {
    this.cancel();
    const n = Math.floor(this.R_ + this.p_()), r = Math.max(0, Date.now() - this.m_), s = Math.max(0, n - r);
    s > 0 && L("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`), this.V_ = this.Fi.enqueueAfterDelay(this.timerId, s, () => (this.m_ = Date.now(), e())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.R_ *= this.E_, this.R_ < this.d_ && (this.R_ = this.d_), this.R_ > this.A_ && (this.R_ = this.A_);
  }
  y_() {
    this.V_ !== null && (this.V_.skipDelay(), this.V_ = null);
  }
  cancel() {
    this.V_ !== null && (this.V_.cancel(), this.V_ = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  p_() {
    return (Math.random() - 0.5) * this.R_;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Cp = "PersistentStream";
class BD {
  constructor(e, n, r, s, i, o, c, u) {
    this.Fi = e, this.w_ = r, this.S_ = s, this.connection = i, this.authCredentialsProvider = o, this.appCheckCredentialsProvider = c, this.listener = u, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.b_ = 0, this.D_ = null, this.v_ = null, this.stream = null, /**
     * Count of response messages received.
     */
    this.C_ = 0, this.F_ = new gy(e, n);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  M_() {
    return this.state === 1 || this.state === 5 || this.x_();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  x_() {
    return this.state === 2 || this.state === 3;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    this.C_ = 0, this.state !== 4 ? this.auth() : this.O_();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.M_() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  N_() {
    this.state = 0, this.F_.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  B_() {
    this.x_() && this.D_ === null && (this.D_ = this.Fi.enqueueAfterDelay(this.w_, 6e4, () => this.L_()));
  }
  /** Sends a message to the underlying stream. */
  k_(e) {
    this.q_(), this.stream.send(e);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async L_() {
    if (this.x_())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  q_() {
    this.D_ && (this.D_.cancel(), this.D_ = null);
  }
  /** Cancels the health check delayed operation. */
  Q_() {
    this.v_ && (this.v_.cancel(), this.v_ = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(e, n) {
    this.q_(), this.Q_(), this.F_.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.b_++, e !== 4 ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.F_.reset()
    ) : n && n.code === D.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (dr(n.toString()), dr("Using maximum backoff delay to prevent overloading the backend."), this.F_.f_())
    ) : n && n.code === D.UNAUTHENTICATED && this.state !== 3 && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    this.stream !== null && (this.U_(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = e, // Notify the listener that the stream closed.
    await this.listener.n_(n);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  U_() {
  }
  auth() {
    this.state = 1;
    const e = this.K_(this.b_), n = this.b_;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then(([r, s]) => {
      this.b_ === n && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.W_(r, s);
    }, (r) => {
      e(() => {
        const s = new V(D.UNKNOWN, "Fetching auth token failed: " + r.message);
        return this.G_(s);
      });
    });
  }
  W_(e, n) {
    const r = this.K_(this.b_);
    this.stream = this.z_(e, n), this.stream.Zo(() => {
      r(() => this.listener.Zo());
    }), this.stream.e_(() => {
      r(() => (this.state = 2, this.v_ = this.Fi.enqueueAfterDelay(this.S_, 1e4, () => (this.x_() && (this.state = 3), Promise.resolve())), this.listener.e_()));
    }), this.stream.n_((s) => {
      r(() => this.G_(s));
    }), this.stream.onMessage((s) => {
      r(() => ++this.C_ == 1 ? this.j_(s) : this.onNext(s));
    });
  }
  O_() {
    this.state = 5, this.F_.g_(async () => {
      this.state = 0, this.start();
    });
  }
  // Visible for tests
  G_(e) {
    return L(Cp, `close with error: ${e}`), this.stream = null, this.close(4, e);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  K_(e) {
    return (n) => {
      this.Fi.enqueueAndForget(() => this.b_ === e ? n() : (L(Cp, "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
}
class $D extends BD {
  constructor(e, n, r, s, i, o) {
    super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", n, r, s, o), this.serializer = i;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get Z_() {
    return this.C_ > 0;
  }
  // Override of PersistentStream.start
  start() {
    this.lastStreamToken = void 0, super.start();
  }
  U_() {
    this.Z_ && this.X_([]);
  }
  z_(e, n) {
    return this.connection.P_("Write", e, n);
  }
  j_(e) {
    return _e(!!e.streamToken, 31322), this.lastStreamToken = e.streamToken, // The first response is always the handshake response
    _e(!e.writeResults || e.writeResults.length === 0, 55816), this.listener.ea();
  }
  onNext(e) {
    _e(!!e.streamToken, 12678), this.lastStreamToken = e.streamToken, // A successful first write response means the stream is healthy,
    // Note, that we could consider a successful handshake healthy, however,
    // the write itself might be causing an error we want to back off from.
    this.F_.reset();
    const n = nD(e.writeResults, e.commitTime), r = Or(e.commitTime);
    return this.listener.ta(r, n);
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  na() {
    const e = {};
    e.database = ZP(this.serializer), this.k_(e);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  X_(e) {
    const n = {
      streamToken: this.lastStreamToken,
      writes: e.map((r) => tD(this.serializer, r))
    };
    this.k_(n);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class jD {
}
class HD extends jD {
  constructor(e, n, r, s) {
    super(), this.authCredentials = e, this.appCheckCredentials = n, this.connection = r, this.serializer = s, this.ra = !1;
  }
  ia() {
    if (this.ra) throw new V(D.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  Wo(e, n, r, s) {
    return this.ia(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([i, o]) => this.connection.Wo(e, qu(n, r), s, i, o)).catch((i) => {
      throw i.name === "FirebaseError" ? (i.code === D.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), i) : new V(D.UNKNOWN, i.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  Jo(e, n, r, s, i) {
    return this.ia(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([o, c]) => this.connection.Jo(e, qu(n, r), s, o, c, i)).catch((o) => {
      throw o.name === "FirebaseError" ? (o.code === D.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), o) : new V(D.UNKNOWN, o.toString());
    });
  }
  terminate() {
    this.ra = !0, this.connection.terminate();
  }
}
class GD {
  constructor(e, n) {
    this.asyncQueue = e, this.onlineStateHandler = n, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.sa = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this.oa = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this._a = !0;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  aa() {
    this.sa === 0 && (this.ua(
      "Unknown"
      /* OnlineState.Unknown */
    ), this.oa = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this.oa = null, this.ca("Backend didn't respond within 10 seconds."), this.ua(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve())));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  la(e) {
    this.state === "Online" ? this.ua(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.sa++, this.sa >= 1 && (this.ha(), this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.ua(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(e) {
    this.ha(), this.sa = 0, e === "Online" && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this._a = !1), this.ua(e);
  }
  ua(e) {
    e !== this.state && (this.state = e, this.onlineStateHandler(e));
  }
  ca(e) {
    const n = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this._a ? (dr(n), this._a = !1) : L("OnlineStateTracker", n);
  }
  ha() {
    this.oa !== null && (this.oa.cancel(), this.oa = null);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Pi = "RemoteStore";
class qD {
  constructor(e, n, r, s, i) {
    this.localStore = e, this.datastore = n, this.asyncQueue = r, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.Pa = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.Ta = /* @__PURE__ */ new Map(), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.Ia = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.da = [], this.Ea = i, this.Ea.xo((o) => {
      r.enqueueAndForget(async () => {
        ki(this) && (L(Pi, "Restarting streams for network reachability change."), await async function(u) {
          const d = ae(u);
          d.Ia.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Di(d), d.Aa.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), d.Ia.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Za(d);
        }(this));
      });
    }), this.Aa = new GD(r, s);
  }
}
async function Za(t) {
  if (ki(t)) for (const e of t.da) await e(
    /* enabled= */
    !0
  );
}
async function Di(t) {
  for (const e of t.da) await e(
    /* enabled= */
    !1
  );
}
function ki(t) {
  return ae(t).Ia.size === 0;
}
async function _y(t, e, n) {
  if (!Ri(e)) throw e;
  t.Ia.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await Di(t), t.Aa.set(
    "Offline"
    /* OnlineState.Offline */
  ), n || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (n = () => ND(t.localStore)), // Probe IndexedDB periodically and re-enable network
  t.asyncQueue.enqueueRetryable(async () => {
    L(Pi, "Retrying IndexedDB access"), await n(), t.Ia.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await Za(t);
  });
}
function yy(t, e) {
  return e().catch((n) => _y(t, n, e));
}
async function ec(t) {
  const e = ae(t), n = Dn(e);
  let r = e.Pa.length > 0 ? e.Pa[e.Pa.length - 1].batchId : Yl;
  for (; zD(e); ) try {
    const s = await OD(e.localStore, r);
    if (s === null) {
      e.Pa.length === 0 && n.B_();
      break;
    }
    r = s.batchId, WD(e, s);
  } catch (s) {
    await _y(e, s);
  }
  Ey(e) && vy(e);
}
function zD(t) {
  return ki(t) && t.Pa.length < 10;
}
function WD(t, e) {
  t.Pa.push(e);
  const n = Dn(t);
  n.x_() && n.Z_ && n.X_(e.mutations);
}
function Ey(t) {
  return ki(t) && !Dn(t).M_() && t.Pa.length > 0;
}
function vy(t) {
  Dn(t).start();
}
async function KD(t) {
  Dn(t).na();
}
async function YD(t) {
  const e = Dn(t);
  for (const n of t.Pa) e.X_(n.mutations);
}
async function JD(t, e, n) {
  const r = t.Pa.shift(), s = sd.from(r, e, n);
  await yy(t, () => t.remoteSyncer.applySuccessfulWrite(s)), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await ec(t);
}
async function XD(t, e) {
  e && Dn(t).Z_ && // This error affects the actual write.
  await async function(r, s) {
    if (function(o) {
      return zP(o) && o !== D.ABORTED;
    }(s.code)) {
      const i = r.Pa.shift();
      Dn(r).N_(), await yy(r, () => r.remoteSyncer.rejectFailedWrite(i.batchId, s)), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await ec(r);
    }
  }(t, e), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  Ey(t) && vy(t);
}
async function Pp(t, e) {
  const n = ae(t);
  n.asyncQueue.verifyOperationInProgress(), L(Pi, "RemoteStore received new credentials");
  const r = ki(n);
  n.Ia.add(
    3
    /* OfflineCause.CredentialChange */
  ), await Di(n), r && // Don't set the network status to Unknown if we are offline.
  n.Aa.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await n.remoteSyncer.handleCredentialChange(e), n.Ia.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await Za(n);
}
async function QD(t, e) {
  const n = ae(t);
  e ? (n.Ia.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await Za(n)) : e || (n.Ia.add(
    2
    /* OfflineCause.IsSecondary */
  ), await Di(n), n.Aa.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function Dn(t) {
  return t.ma || // Create stream (but note that it is not started yet).
  (t.ma = function(n, r, s) {
    const i = ae(n);
    return i.ia(), new $D(r, i.connection, i.authCredentials, i.appCheckCredentials, i.serializer, s);
  }(t.datastore, t.asyncQueue, {
    Zo: () => Promise.resolve(),
    e_: KD.bind(null, t),
    n_: XD.bind(null, t),
    ea: YD.bind(null, t),
    ta: JD.bind(null, t)
  }), t.da.push(async (e) => {
    e ? (t.ma.N_(), // This will start the write stream if necessary.
    await ec(t)) : (await t.ma.stop(), t.Pa.length > 0 && (L(Pi, `Stopping write stream with ${t.Pa.length} pending writes`), t.Pa = []));
  })), t.ma;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cd {
  constructor(e, n, r, s, i) {
    this.asyncQueue = e, this.timerId = n, this.targetTimeMs = r, this.op = s, this.removalCallback = i, this.deferred = new tr(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((o) => {
    });
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(e, n, r, s, i) {
    const o = Date.now() + r, c = new cd(e, n, o, s, i);
    return c.start(r), c;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(e) {
    this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new V(D.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => this.timerHandle !== null ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e))) : Promise.resolve());
  }
  clearTimeout() {
    this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
}
function Sy(t, e) {
  if (dr("AsyncQueue", `${e}: ${t}`), Ri(t)) return new V(D.UNAVAILABLE, `${e}: ${t}`);
  throw t;
}
class ZD {
  constructor() {
    this.queries = Dp(), this.onlineState = "Unknown", this.Da = /* @__PURE__ */ new Set();
  }
  terminate() {
    (function(n, r) {
      const s = ae(n), i = s.queries;
      s.queries = Dp(), i.forEach((o, c) => {
        for (const u of c.wa) u.onError(r);
      });
    })(this, new V(D.ABORTED, "Firestore shutting down"));
  }
}
function Dp() {
  return new yr((t) => Z_(t), Q_);
}
function ek(t) {
  t.Da.forEach((e) => {
    e.next();
  });
}
var kp, Np;
(Np = kp || (kp = {})).Fa = "default", /** Listen to changes in cache only */
Np.Cache = "cache";
const tk = "SyncEngine";
class nk {
  constructor(e, n, r, s, i, o) {
    this.localStore = e, this.remoteStore = n, this.eventManager = r, this.sharedClientState = s, this.currentUser = i, this.maxConcurrentLimboResolutions = o, this.hu = {}, this.Pu = new yr((c) => Z_(c), Q_), this.Tu = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.Iu = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.du = new tt(j.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.Eu = /* @__PURE__ */ new Map(), this.Au = new id(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Ru = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.Vu = /* @__PURE__ */ new Map(), this.mu = Xr.ur(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.fu = void 0;
  }
  get isPrimaryClient() {
    return this.fu === !0;
  }
}
async function rk(t, e, n) {
  const r = ak(t);
  try {
    const s = await function(o, c) {
      const u = ae(o), d = he.now(), f = c.reduce((T, w) => T.add(w.key), je());
      let p, _;
      return u.persistence.runTransaction("Locally write mutations", "readwrite", (T) => {
        let w = fa(), k = je();
        return u.Os.getEntries(T, f).next((P) => {
          w = P, w.forEach((B, U) => {
            U.isValidDocument() || (k = k.add(B));
          });
        }).next(() => u.localDocuments.getOverlayedDocuments(T, w)).next((P) => {
          p = P;
          const B = [];
          for (const U of c) {
            const H = jP(U, p.get(U.key).overlayedDocument);
            H != null && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            B.push(new Er(U.key, H, q_(H.value.mapValue), qt.exists(!0)));
          }
          return u.mutationQueue.addMutationBatch(T, d, B, c);
        }).next((P) => {
          _ = P;
          const B = P.applyToLocalDocumentSet(p, k);
          return u.documentOverlayCache.saveOverlays(T, P.batchId, B);
        });
      }).then(() => ({
        batchId: _.batchId,
        changes: ty(p)
      }));
    }(r.localStore, e);
    r.sharedClientState.addPendingMutation(s.batchId), function(o, c, u) {
      let d = o.Ru[o.currentUser.toKey()];
      d || (d = new tt(X)), d = d.insert(c, u), o.Ru[o.currentUser.toKey()] = d;
    }(r, s.batchId, n), await tc(r, s.changes), await ec(r.remoteStore);
  } catch (s) {
    const i = Sy(s, "Failed to persist write");
    n.reject(i);
  }
}
function Op(t, e, n) {
  const r = ae(t);
  if (r.isPrimaryClient && n === 0 || !r.isPrimaryClient && n === 1) {
    const s = [];
    r.Pu.forEach((i, o) => {
      const c = o.view.va(e);
      c.snapshot && s.push(c.snapshot);
    }), function(o, c) {
      const u = ae(o);
      u.onlineState = c;
      let d = !1;
      u.queries.forEach((f, p) => {
        for (const _ of p.wa)
          _.va(c) && (d = !0);
      }), d && ek(u);
    }(r.eventManager, e), s.length && r.hu.J_(s), r.onlineState = e, r.isPrimaryClient && r.sharedClientState.setOnlineState(e);
  }
}
async function sk(t, e) {
  const n = ae(t), r = e.batch.batchId;
  try {
    const s = await kD(n.localStore, e);
    Iy(
      n,
      r,
      /*error=*/
      null
    ), Ty(n, r), n.sharedClientState.updateMutationState(r, "acknowledged"), await tc(n, s);
  } catch (s) {
    await Wl(s);
  }
}
async function ik(t, e, n) {
  const r = ae(t);
  try {
    const s = await function(o, c) {
      const u = ae(o);
      return u.persistence.runTransaction("Reject batch", "readwrite-primary", (d) => {
        let f;
        return u.mutationQueue.lookupMutationBatch(d, c).next((p) => (_e(p !== null, 37113), f = p.keys(), u.mutationQueue.removeMutationBatch(d, p))).next(() => u.mutationQueue.performConsistencyCheck(d)).next(() => u.documentOverlayCache.removeOverlaysForBatchId(d, f, c)).next(() => u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d, f)).next(() => u.localDocuments.getDocuments(d, f));
      });
    }(r.localStore, e);
    Iy(r, e, n), Ty(r, e), r.sharedClientState.updateMutationState(e, "rejected", n), await tc(r, s);
  } catch (s) {
    await Wl(s);
  }
}
function Ty(t, e) {
  (t.Vu.get(e) || []).forEach((n) => {
    n.resolve();
  }), t.Vu.delete(e);
}
function Iy(t, e, n) {
  const r = ae(t);
  let s = r.Ru[r.currentUser.toKey()];
  if (s) {
    const i = s.get(e);
    i && (n ? i.reject(n) : i.resolve(), s = s.remove(e)), r.Ru[r.currentUser.toKey()] = s;
  }
}
async function tc(t, e, n) {
  const r = ae(t), s = [], i = [], o = [];
  r.Pu.isEmpty() || (r.Pu.forEach((c, u) => {
    o.push(r.gu(u, e, n).then((d) => {
      var f;
      if ((d || n) && r.isPrimaryClient) {
        const p = d ? !d.fromCache : (f = void 0) === null || f === void 0 ? void 0 : f.current;
        r.sharedClientState.updateQueryState(u.targetId, p ? "current" : "not-current");
      }
      if (d) {
        s.push(d);
        const p = ad.Es(u.targetId, d);
        i.push(p);
      }
    }));
  }), await Promise.all(o), r.hu.J_(s), await async function(u, d) {
    const f = ae(u);
    try {
      await f.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (p) => C.forEach(d, (_) => C.forEach(_.Is, (T) => f.persistence.referenceDelegate.addReference(p, _.targetId, T)).next(() => C.forEach(_.ds, (T) => f.persistence.referenceDelegate.removeReference(p, _.targetId, T)))));
    } catch (p) {
      if (!Ri(p)) throw p;
      L(CD, "Failed to update sequence numbers: " + p);
    }
    for (const p of d) {
      const _ = p.targetId;
      if (!p.fromCache) {
        const T = f.Fs.get(_), w = T.snapshotVersion, k = T.withLastLimboFreeSnapshotVersion(w);
        f.Fs = f.Fs.insert(_, k);
      }
    }
  }(r.localStore, i));
}
async function ok(t, e) {
  const n = ae(t);
  if (!n.currentUser.isEqual(e)) {
    L(tk, "User change. New user:", e.toKey());
    const r = await my(n.localStore, e);
    n.currentUser = e, // Fails tasks waiting for pending writes requested by previous user.
    function(i, o) {
      i.Vu.forEach((c) => {
        c.forEach((u) => {
          u.reject(new V(D.CANCELLED, o));
        });
      }), i.Vu.clear();
    }(n, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    n.sharedClientState.handleUserChange(e, r.removedBatchIds, r.addedBatchIds), await tc(n, r.Bs);
  }
}
function ak(t) {
  const e = ae(t);
  return e.remoteStore.remoteSyncer.applySuccessfulWrite = sk.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = ik.bind(null, e), e;
}
class _a {
  constructor() {
    this.kind = "memory", this.synchronizeTabs = !1;
  }
  async initialize(e) {
    this.serializer = Qa(e.databaseInfo.databaseId), this.sharedClientState = this.bu(e), this.persistence = this.Du(e), await this.persistence.start(), this.localStore = this.vu(e), this.gcScheduler = this.Cu(e, this.localStore), this.indexBackfillerScheduler = this.Fu(e, this.localStore);
  }
  Cu(e, n) {
    return null;
  }
  Fu(e, n) {
    return null;
  }
  vu(e) {
    return DD(this.persistence, new RD(), e.initialUser, this.serializer);
  }
  Du(e) {
    return new py(od.Vi, this.serializer);
  }
  bu(e) {
    return new MD();
  }
  async terminate() {
    var e, n;
    (e = this.gcScheduler) === null || e === void 0 || e.stop(), (n = this.indexBackfillerScheduler) === null || n === void 0 || n.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
}
_a.provider = {
  build: () => new _a()
};
class ck extends _a {
  constructor(e) {
    super(), this.cacheSizeBytes = e;
  }
  Cu(e, n) {
    _e(this.persistence.referenceDelegate instanceof ga, 46915);
    const r = this.persistence.referenceDelegate.garbageCollector;
    return new hD(r, e.asyncQueue, n);
  }
  Du(e) {
    const n = this.cacheSizeBytes !== void 0 ? et.withCacheSize(this.cacheSizeBytes) : et.DEFAULT;
    return new py((r) => ga.Vi(r, n), this.serializer);
  }
}
class Ku {
  async initialize(e, n) {
    this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(n), this.remoteStore = this.createRemoteStore(n), this.eventManager = this.createEventManager(n), this.syncEngine = this.createSyncEngine(
      n,
      /* startAsPrimary=*/
      !e.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (r) => Op(
      this.syncEngine,
      r,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = ok.bind(null, this.syncEngine), await QD(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return function() {
      return new ZD();
    }();
  }
  createDatastore(e) {
    const n = Qa(e.databaseInfo.databaseId), r = function(i) {
      return new FD(i);
    }(e.databaseInfo);
    return function(i, o, c, u) {
      return new HD(i, o, c, u);
    }(e.authCredentials, e.appCheckCredentials, r, n);
  }
  createRemoteStore(e) {
    return function(r, s, i, o, c) {
      return new qD(r, s, i, o, c);
    }(this.localStore, this.datastore, e.asyncQueue, (n) => Op(
      this.syncEngine,
      n,
      0
      /* OnlineStateSource.RemoteStore */
    ), function() {
      return Rp.C() ? new Rp() : new LD();
    }());
  }
  createSyncEngine(e, n) {
    return function(s, i, o, c, u, d, f) {
      const p = new nk(s, i, o, c, u, d);
      return f && (p.fu = !0), p;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, n);
  }
  async terminate() {
    var e, n;
    await async function(s) {
      const i = ae(s);
      L(Pi, "RemoteStore shutting down."), i.Ia.add(
        5
        /* OfflineCause.Shutdown */
      ), await Di(i), i.Ea.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      i.Aa.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    }(this.remoteStore), (e = this.datastore) === null || e === void 0 || e.terminate(), (n = this.eventManager) === null || n === void 0 || n.terminate();
  }
}
Ku.provider = {
  build: () => new Ku()
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kn = "FirestoreClient";
class uk {
  constructor(e, n, r, s, i) {
    this.authCredentials = e, this.appCheckCredentials = n, this.asyncQueue = r, this.databaseInfo = s, this.user = $e.UNAUTHENTICATED, this.clientId = ql.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = i, this.authCredentials.start(r, async (o) => {
      L(kn, "Received user=", o.uid), await this.authCredentialListener(o), this.user = o;
    }), this.appCheckCredentials.start(r, (o) => (L(kn, "Received new app check token=", o), this.appCheckCredentialListener(o, this.user)));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new tr();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
      } catch (n) {
        const r = Sy(n, "Failed to shutdown persistence");
        e.reject(r);
      }
    }), e.promise;
  }
}
async function Zc(t, e) {
  t.asyncQueue.verifyOperationInProgress(), L(kn, "Initializing OfflineComponentProvider");
  const n = t.configuration;
  await e.initialize(n);
  let r = n.initialUser;
  t.setCredentialChangeListener(async (s) => {
    r.isEqual(s) || (await my(e.localStore, s), r = s);
  }), e.persistence.setDatabaseDeletedListener(() => {
    zr("Terminating Firestore due to IndexedDb database deletion"), t.terminate().then(() => {
      L("Terminating Firestore due to IndexedDb database deletion completed successfully");
    }).catch((s) => {
      zr("Terminating Firestore due to IndexedDb database deletion failed", s);
    });
  }), t._offlineComponents = e;
}
async function Mp(t, e) {
  t.asyncQueue.verifyOperationInProgress();
  const n = await lk(t);
  L(kn, "Initializing OnlineComponentProvider"), await e.initialize(n, t.configuration), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  t.setCredentialChangeListener((r) => Pp(e.remoteStore, r)), t.setAppCheckTokenChangeListener((r, s) => Pp(e.remoteStore, s)), t._onlineComponents = e;
}
async function lk(t) {
  if (!t._offlineComponents) if (t._uninitializedComponentsProvider) {
    L(kn, "Using user provided OfflineComponentProvider");
    try {
      await Zc(t, t._uninitializedComponentsProvider._offline);
    } catch (e) {
      const n = e;
      if (!function(s) {
        return s.name === "FirebaseError" ? s.code === D.FAILED_PRECONDITION || s.code === D.UNIMPLEMENTED : !(typeof DOMException < "u" && s instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
        // or an aborted error depending on whether the error happened during
        // schema migration.
        s.code === 22 || s.code === 20 || // Firefox Private Browsing mode disables IndexedDb and returns
        // INVALID_STATE for any usage.
        s.code === 11;
      }(n)) throw n;
      zr("Error using user provided cache. Falling back to memory cache: " + n), await Zc(t, new _a());
    }
  } else L(kn, "Using default OfflineComponentProvider"), await Zc(t, new ck(void 0));
  return t._offlineComponents;
}
async function dk(t) {
  return t._onlineComponents || (t._uninitializedComponentsProvider ? (L(kn, "Using user provided OnlineComponentProvider"), await Mp(t, t._uninitializedComponentsProvider._online)) : (L(kn, "Using default OnlineComponentProvider"), await Mp(t, new Ku()))), t._onlineComponents;
}
function hk(t) {
  return dk(t).then((e) => e.syncEngine);
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function wy(t) {
  const e = {};
  return t.timeoutSeconds !== void 0 && (e.timeoutSeconds = t.timeoutSeconds), e;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Lp = /* @__PURE__ */ new Map();
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const by = "firestore.googleapis.com", xp = !0;
class Vp {
  constructor(e) {
    var n, r;
    if (e.host === void 0) {
      if (e.ssl !== void 0) throw new V(D.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = by, this.ssl = xp;
    } else this.host = e.host, this.ssl = (n = e.ssl) !== null && n !== void 0 ? n : xp;
    if (this.isUsingEmulator = e.emulatorOptions !== void 0, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e.cacheSizeBytes === void 0) this.cacheSizeBytes = fy;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < lD) throw new V(D.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    ZC("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : e.experimentalAutoDetectLongPolling === void 0 ? this.experimentalAutoDetectLongPolling = !0 : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = wy((r = e.experimentalLongPollingOptions) !== null && r !== void 0 ? r : {}), function(i) {
      if (i.timeoutSeconds !== void 0) {
        if (isNaN(i.timeoutSeconds)) throw new V(D.INVALID_ARGUMENT, `invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);
        if (i.timeoutSeconds < 5) throw new V(D.INVALID_ARGUMENT, `invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);
        if (i.timeoutSeconds > 30) throw new V(D.INVALID_ARGUMENT, `invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function(r, s) {
      return r.timeoutSeconds === s.timeoutSeconds;
    }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
  }
}
class ud {
  /** @hideconstructor */
  constructor(e, n, r, s) {
    this._authCredentials = e, this._appCheckCredentials = n, this._databaseId = r, this._app = s, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new Vp({}), this._settingsFrozen = !1, this._emulatorOptions = {}, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new V(D.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== "notTerminated";
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new V(D.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new Vp(e), this._emulatorOptions = e.emulatorOptions || {}, e.credentials !== void 0 && (this._authCredentials = function(r) {
      if (!r) return new jC();
      switch (r.type) {
        case "firstParty":
          return new zC(r.sessionIndex || "0", r.iamToken || null, r.authTokenFactory || null);
        case "provider":
          return r.client;
        default:
          throw new V(D.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return this._settingsFrozen = !0, this._settings;
  }
  _delete() {
    return this._terminateTask === "notTerminated" && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    this._terminateTask === "notTerminated" ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function(n) {
      const r = Lp.get(n);
      r && (L("ComponentProvider", "Removing Datastore"), Lp.delete(n), r.terminate());
    }(this), Promise.resolve();
  }
}
function Ay(t, e, n, r = {}) {
  var s;
  t = Uu(t, ud);
  const i = cs(e), o = t._getSettings(), c = Object.assign(Object.assign({}, o), {
    emulatorOptions: t._getEmulatorOptions()
  }), u = `${e}:${n}`;
  i && (S_(`https://${u}`), T_("Firestore", !0)), o.host !== by && o.host !== u && zr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
  const d = Object.assign(Object.assign({}, o), {
    host: u,
    ssl: i,
    emulatorOptions: r
  });
  if (!cr(d, c) && (t._setSettings(d), r.mockUserToken)) {
    let f, p;
    if (typeof r.mockUserToken == "string") f = r.mockUserToken, p = $e.MOCK_USER;
    else {
      f = p0(r.mockUserToken, (s = t._app) === null || s === void 0 ? void 0 : s.options.projectId);
      const _ = r.mockUserToken.sub || r.mockUserToken.user_id;
      if (!_) throw new V(D.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      p = new $e(_);
    }
    t._authCredentials = new HC(new L_(f, p));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ld {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, n, r) {
    this.converter = n, this._query = r, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new ld(this.firestore, e, this._query);
  }
}
class He {
  /** @hideconstructor */
  constructor(e, n, r) {
    this.converter = n, this._key = r, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new ai(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new He(this.firestore, e, this._key);
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentReference` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: He._jsonSchemaVersion,
      referencePath: this._key.toString()
    };
  }
  static fromJSON(e, n, r) {
    if (Ai(n, He._jsonSchema)) return new He(e, r || null, new j(Ee.fromString(n.referencePath)));
  }
}
He._jsonSchemaVersion = "firestore/documentReference/1.0", He._jsonSchema = {
  type: Te("string", He._jsonSchemaVersion),
  referencePath: Te("string")
};
class ai extends ld {
  /** @hideconstructor */
  constructor(e, n, r) {
    super(e, n, AP(r)), this._path = r, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new He(
      this.firestore,
      /* converter= */
      null,
      new j(e)
    );
  }
  withConverter(e) {
    return new ai(this.firestore, e, this._path);
  }
}
function fk(t, e, ...n) {
  if (t = pt(t), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  arguments.length === 1 && (e = ql.newId()), QC("doc", "path", e), t instanceof ud) {
    const r = Ee.fromString(e, ...n);
    return ip(r), new He(
      t,
      /* converter= */
      null,
      new j(r)
    );
  }
  {
    if (!(t instanceof He || t instanceof ai)) throw new V(D.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r = t._path.child(Ee.fromString(e, ...n));
    return ip(r), new He(t.firestore, t instanceof ai ? t.converter : null, new j(r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Up = "AsyncQueue";
class Fp {
  constructor(e = Promise.resolve()) {
    this.Zu = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.Xu = !1, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.ec = [], // visible for testing
    this.tc = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.nc = !1, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.rc = !1, // List of TimerIds to fast-forward delays for.
    this.sc = [], // Backoff timer used to schedule retries for retryable operations
    this.F_ = new gy(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.oc = () => {
      const r = Qc();
      r && L(Up, "Visibility state changed to " + r.visibilityState), this.F_.y_();
    }, this._c = e;
    const n = Qc();
    n && typeof n.addEventListener == "function" && n.addEventListener("visibilitychange", this.oc);
  }
  get isShuttingDown() {
    return this.Xu;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    this.ac(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.uc(e);
  }
  enterRestrictedMode(e) {
    if (!this.Xu) {
      this.Xu = !0, this.rc = e || !1;
      const n = Qc();
      n && typeof n.removeEventListener == "function" && n.removeEventListener("visibilitychange", this.oc);
    }
  }
  enqueue(e) {
    if (this.ac(), this.Xu)
      return new Promise(() => {
      });
    const n = new tr();
    return this.uc(() => this.Xu && this.rc ? Promise.resolve() : (e().then(n.resolve, n.reject), n.promise)).then(() => n.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Zu.push(e), this.cc()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async cc() {
    if (this.Zu.length !== 0) {
      try {
        await this.Zu[0](), this.Zu.shift(), this.F_.reset();
      } catch (e) {
        if (!Ri(e)) throw e;
        L(Up, "Operation failed with retryable error: " + e);
      }
      this.Zu.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.F_.g_(() => this.cc());
    }
  }
  uc(e) {
    const n = this._c.then(() => (this.nc = !0, e().catch((r) => {
      throw this.tc = r, this.nc = !1, dr("INTERNAL UNHANDLED ERROR: ", Bp(r)), r;
    }).then((r) => (this.nc = !1, r))));
    return this._c = n, n;
  }
  enqueueAfterDelay(e, n, r) {
    this.ac(), // Fast-forward delays for timerIds that have been overridden.
    this.sc.indexOf(e) > -1 && (n = 0);
    const s = cd.createAndSchedule(this, e, n, r, (i) => this.lc(i));
    return this.ec.push(s), s;
  }
  ac() {
    this.tc && G(47125, {
      hc: Bp(this.tc)
    });
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async Pc() {
    let e;
    do
      e = this._c, await e;
    while (e !== this._c);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  Tc(e) {
    for (const n of this.ec) if (n.timerId === e) return !0;
    return !1;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  Ic(e) {
    return this.Pc().then(() => {
      this.ec.sort((n, r) => n.targetTimeMs - r.targetTimeMs);
      for (const n of this.ec) if (n.skipDelay(), e !== "all" && n.timerId === e) break;
      return this.Pc();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  dc(e) {
    this.sc.push(e);
  }
  /** Called once a DelayedOperation is run or canceled. */
  lc(e) {
    const n = this.ec.indexOf(e);
    this.ec.splice(n, 1);
  }
}
function Bp(t) {
  let e = t.message || "";
  return t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + `
` + t.stack), e;
}
class Ry extends ud {
  /** @hideconstructor */
  constructor(e, n, r, s) {
    super(e, n, r, s), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new Fp(), this._persistenceKey = s?.name || "[DEFAULT]";
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      this._queue = new Fp(e), this._firestoreClient = void 0, await e;
    }
  }
}
function pk(t, e) {
  const n = typeof t == "object" ? t : A_(), r = typeof t == "string" ? t : ua, s = jl(n, "firestore").getImmediate({
    identifier: r
  });
  if (!s._initialized) {
    const i = h0("firestore");
    i && Ay(s, ...i);
  }
  return s;
}
function mk(t) {
  if (t._terminated) throw new V(D.FAILED_PRECONDITION, "The client has already been terminated.");
  return t._firestoreClient || gk(t), t._firestoreClient;
}
function gk(t) {
  var e, n, r;
  const s = t._freezeSettings(), i = function(c, u, d, f) {
    return new dP(c, u, d, f.host, f.ssl, f.experimentalForceLongPolling, f.experimentalAutoDetectLongPolling, wy(f.experimentalLongPollingOptions), f.useFetchStreams, f.isUsingEmulator);
  }(t._databaseId, ((e = t._app) === null || e === void 0 ? void 0 : e.options.appId) || "", t._persistenceKey, s);
  t._componentsProvider || !((n = s.localCache) === null || n === void 0) && n._offlineComponentProvider && (!((r = s.localCache) === null || r === void 0) && r._onlineComponentProvider) && (t._componentsProvider = {
    _offline: s.localCache._offlineComponentProvider,
    _online: s.localCache._onlineComponentProvider
  }), t._firestoreClient = new uk(t._authCredentials, t._appCheckCredentials, t._queue, i, t._componentsProvider && function(c) {
    const u = c?._online.build();
    return {
      _offline: c?._offline.build(u),
      _online: u
    };
  }(t._componentsProvider));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Et {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new Et(Mt.fromBase64String(e));
    } catch (n) {
      throw new V(D.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + n);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new Et(Mt.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  /**
   * Returns a JSON-serializable representation of this `Bytes` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: Et._jsonSchemaVersion,
      bytes: this.toBase64()
    };
  }
  /**
   * Builds a `Bytes` instance from a JSON object created by {@link Bytes.toJSON}.
   *
   * @param json a JSON object represention of a `Bytes` instance
   * @returns an instance of {@link Bytes} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (Ai(e, Et._jsonSchema)) return Et.fromBase64String(e.bytes);
  }
}
Et._jsonSchemaVersion = "firestore/bytes/1.0", Et._jsonSchema = {
  type: Te("string", Et._jsonSchemaVersion),
  bytes: Te("string")
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class dd {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let n = 0; n < e.length; ++n) if (e[n].length === 0) throw new V(D.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new Le(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Cy {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class zt {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, n) {
    if (!isFinite(e) || e < -90 || e > 90) throw new V(D.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(n) || n < -180 || n > 180) throw new V(D.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + n);
    this._lat = e, this._long = n;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return X(this._lat, e._lat) || X(this._long, e._long);
  }
  /**
   * Returns a JSON-serializable representation of this `GeoPoint` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long,
      type: zt._jsonSchemaVersion
    };
  }
  /**
   * Builds a `GeoPoint` instance from a JSON object created by {@link GeoPoint.toJSON}.
   *
   * @param json a JSON object represention of a `GeoPoint` instance
   * @returns an instance of {@link GeoPoint} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (Ai(e, zt._jsonSchema)) return new zt(e.latitude, e.longitude);
  }
}
zt._jsonSchemaVersion = "firestore/geoPoint/1.0", zt._jsonSchema = {
  type: Te("string", zt._jsonSchemaVersion),
  latitude: Te("number"),
  longitude: Te("number")
};
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Wt {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map((n) => n);
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map((e) => e);
  }
  /**
   * Returns `true` if the two `VectorValue` values have the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return function(r, s) {
      if (r.length !== s.length) return !1;
      for (let i = 0; i < r.length; ++i) if (r[i] !== s[i]) return !1;
      return !0;
    }(this._values, e._values);
  }
  /**
   * Returns a JSON-serializable representation of this `VectorValue` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: Wt._jsonSchemaVersion,
      vectorValues: this._values
    };
  }
  /**
   * Builds a `VectorValue` instance from a JSON object created by {@link VectorValue.toJSON}.
   *
   * @param json a JSON object represention of a `VectorValue` instance.
   * @returns an instance of {@link VectorValue} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (Ai(e, Wt._jsonSchema)) {
      if (Array.isArray(e.vectorValues) && e.vectorValues.every((n) => typeof n == "number")) return new Wt(e.vectorValues);
      throw new V(D.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
    }
  }
}
Wt._jsonSchemaVersion = "firestore/vectorValue/1.0", Wt._jsonSchema = {
  type: Te("string", Wt._jsonSchemaVersion),
  vectorValues: Te("object")
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _k = /^__.*__$/;
class yk {
  constructor(e, n, r) {
    this.data = e, this.fieldMask = n, this.fieldTransforms = r;
  }
  toMutation(e, n) {
    return this.fieldMask !== null ? new Er(e, this.data, this.fieldMask, n, this.fieldTransforms) : new Ci(e, this.data, n, this.fieldTransforms);
  }
}
function Py(t) {
  switch (t) {
    case 0:
    case 2:
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw G(40011, {
        Ec: t
      });
  }
}
class hd {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, n, r, s, i, o) {
    this.settings = e, this.databaseId = n, this.serializer = r, this.ignoreUndefinedProperties = s, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    i === void 0 && this.Ac(), this.fieldTransforms = i || [], this.fieldMask = o || [];
  }
  get path() {
    return this.settings.path;
  }
  get Ec() {
    return this.settings.Ec;
  }
  /** Returns a new context with the specified settings overwritten. */
  Rc(e) {
    return new hd(Object.assign(Object.assign({}, this.settings), e), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  Vc(e) {
    var n;
    const r = (n = this.path) === null || n === void 0 ? void 0 : n.child(e), s = this.Rc({
      path: r,
      mc: !1
    });
    return s.fc(e), s;
  }
  gc(e) {
    var n;
    const r = (n = this.path) === null || n === void 0 ? void 0 : n.child(e), s = this.Rc({
      path: r,
      mc: !1
    });
    return s.Ac(), s;
  }
  yc(e) {
    return this.Rc({
      path: void 0,
      mc: !0
    });
  }
  wc(e) {
    return ya(e, this.settings.methodName, this.settings.Sc || !1, this.path, this.settings.bc);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return this.fieldMask.find((n) => e.isPrefixOf(n)) !== void 0 || this.fieldTransforms.find((n) => e.isPrefixOf(n.field)) !== void 0;
  }
  Ac() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.fc(this.path.get(e));
  }
  fc(e) {
    if (e.length === 0) throw this.wc("Document fields must not be empty");
    if (Py(this.Ec) && _k.test(e)) throw this.wc('Document fields cannot begin and end with "__"');
  }
}
class Ek {
  constructor(e, n, r) {
    this.databaseId = e, this.ignoreUndefinedProperties = n, this.serializer = r || Qa(e);
  }
  /** Creates a new top-level parse context. */
  Dc(e, n, r, s = !1) {
    return new hd({
      Ec: e,
      methodName: n,
      bc: r,
      path: Le.emptyPath(),
      mc: !1,
      Sc: s
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
}
function vk(t) {
  const e = t._freezeSettings(), n = Qa(t._databaseId);
  return new Ek(t._databaseId, !!e.ignoreUndefinedProperties, n);
}
function Sk(t, e, n, r, s, i = {}) {
  const o = t.Dc(i.merge || i.mergeFields ? 2 : 0, e, n, s);
  Oy("Data must be an object, but it was:", o, r);
  const c = ky(r, o);
  let u, d;
  if (i.merge) u = new vt(o.fieldMask), d = o.fieldTransforms;
  else if (i.mergeFields) {
    const f = [];
    for (const p of i.mergeFields) {
      const _ = Tk(e, p, n);
      if (!o.contains(_)) throw new V(D.INVALID_ARGUMENT, `Field '${_}' is specified in your field mask but missing from your input data.`);
      wk(f, _) || f.push(_);
    }
    u = new vt(f), d = o.fieldTransforms.filter((p) => u.covers(p.field));
  } else u = null, d = o.fieldTransforms;
  return new yk(new yt(c), u, d);
}
function Dy(t, e) {
  if (Ny(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    t = pt(t)
  )) return Oy("Unsupported field value:", e, t), ky(t, e);
  if (t instanceof Cy)
    return function(r, s) {
      if (!Py(s.Ec)) throw s.wc(`${r._methodName}() can only be used with update() and set()`);
      if (!s.path) throw s.wc(`${r._methodName}() is not currently supported inside arrays`);
      const i = r._toFieldTransform(s);
      i && s.fieldTransforms.push(i);
    }(t, e), null;
  if (t === void 0 && e.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), t instanceof Array
  ) {
    if (e.settings.mc && e.Ec !== 4) throw e.wc("Nested arrays are not supported");
    return function(r, s) {
      const i = [];
      let o = 0;
      for (const c of r) {
        let u = Dy(c, s.yc(o));
        u == null && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (u = {
          nullValue: "NULL_VALUE"
        }), i.push(u), o++;
      }
      return {
        arrayValue: {
          values: i
        }
      };
    }(t, e);
  }
  return function(r, s) {
    if ((r = pt(r)) === null) return {
      nullValue: "NULL_VALUE"
    };
    if (typeof r == "number") return xP(s.serializer, r);
    if (typeof r == "boolean") return {
      booleanValue: r
    };
    if (typeof r == "string") return {
      stringValue: r
    };
    if (r instanceof Date) {
      const i = he.fromDate(r);
      return {
        timestampValue: Gu(s.serializer, i)
      };
    }
    if (r instanceof he) {
      const i = new he(r.seconds, 1e3 * Math.floor(r.nanoseconds / 1e3));
      return {
        timestampValue: Gu(s.serializer, i)
      };
    }
    if (r instanceof zt) return {
      geoPointValue: {
        latitude: r.latitude,
        longitude: r.longitude
      }
    };
    if (r instanceof Et) return {
      bytesValue: YP(s.serializer, r._byteString)
    };
    if (r instanceof He) {
      const i = s.databaseId, o = r.firestore._databaseId;
      if (!o.isEqual(i)) throw s.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);
      return {
        referenceValue: dy(r.firestore._databaseId || s.databaseId, r._key.path)
      };
    }
    if (r instanceof Wt)
      return function(o, c) {
        return {
          mapValue: {
            fields: {
              [H_]: {
                stringValue: G_
              },
              [Fu]: {
                arrayValue: {
                  values: o.toArray().map((d) => {
                    if (typeof d != "number") throw c.wc("VectorValues must only contain numeric values.");
                    return rd(c.serializer, d);
                  })
                }
              }
            }
          }
        };
      }(r, s);
    throw s.wc(`Unsupported field value: ${zl(r)}`);
  }(t, e);
}
function ky(t, e) {
  const n = {};
  return U_(t) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path)
  ) : ds(t, (r, s) => {
    const i = Dy(s, e.Vc(r));
    i != null && (n[r] = i);
  }), {
    mapValue: {
      fields: n
    }
  };
}
function Ny(t) {
  return !(typeof t != "object" || t === null || t instanceof Array || t instanceof Date || t instanceof he || t instanceof zt || t instanceof Et || t instanceof He || t instanceof Cy || t instanceof Wt);
}
function Oy(t, e, n) {
  if (!Ny(n) || !x_(n)) {
    const r = zl(n);
    throw r === "an object" ? e.wc(t + " a custom object") : e.wc(t + " " + r);
  }
}
function Tk(t, e, n) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (e = pt(e)) instanceof dd
  ) return e._internalPath;
  if (typeof e == "string") return My(t, e);
  throw ya(
    "Field path arguments must be of type string or ",
    t,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    n
  );
}
const Ik = new RegExp("[~\\*/\\[\\]]");
function My(t, e, n) {
  if (e.search(Ik) >= 0) throw ya(
    `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
    t,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    n
  );
  try {
    return new dd(...e.split("."))._internalPath;
  } catch {
    throw ya(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      t,
      /* hasConverter= */
      !1,
      /* path= */
      void 0,
      n
    );
  }
}
function ya(t, e, n, r, s) {
  const i = r && !r.isEmpty(), o = s !== void 0;
  let c = `Function ${e}() called with invalid data`;
  n && (c += " (via `toFirestore()`)"), c += ". ";
  let u = "";
  return (i || o) && (u += " (found", i && (u += ` in field ${r}`), o && (u += ` in document ${s}`), u += ")"), new V(D.INVALID_ARGUMENT, c + t + u);
}
function wk(t, e) {
  return t.some((n) => n.isEqual(e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ly {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(e, n, r, s, i) {
    this._firestore = e, this._userDataWriter = n, this._key = r, this._document = s, this._converter = i;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new He(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return this._document !== null;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new bk(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e) {
    if (this._document) {
      const n = this._document.data.field(xy("DocumentSnapshot.get", e));
      if (n !== null) return this._userDataWriter.convertValue(n);
    }
  }
}
class bk extends Ly {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
}
function xy(t, e) {
  return typeof e == "string" ? My(t, e) : e instanceof dd ? e._internalPath : e._delegate._internalPath;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ak(t, e, n) {
  let r;
  return r = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, r;
}
class go {
  /** @hideconstructor */
  constructor(e, n) {
    this.hasPendingWrites = e, this.fromCache = n;
  }
  /**
   * Returns true if this `SnapshotMetadata` is equal to the provided one.
   *
   * @param other - The `SnapshotMetadata` to compare against.
   * @returns true if this `SnapshotMetadata` is equal to the provided one.
   */
  isEqual(e) {
    return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
  }
}
class Mr extends Ly {
  /** @hideconstructor protected */
  constructor(e, n, r, s, i, o) {
    super(e, n, r, s, o), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
  }
  /**
   * Returns whether or not the data exists. True if the document exists.
   */
  exists() {
    return super.exists();
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document or `undefined` if
   * the document doesn't exist.
   */
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const n = new xo(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(n, e);
      }
      return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @param options - An options object to configure how the field is retrieved
   * from the snapshot (for example the desired behavior for server timestamps
   * that have not yet been set to their final value).
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e, n = {}) {
    if (this._document) {
      const r = this._document.data.field(xy("DocumentSnapshot.get", e));
      if (r !== null) return this._userDataWriter.convertValue(r, n.serverTimestamps);
    }
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentSnapshot` instance.
   *
   * @returns a JSON representation of this object.  Throws a {@link FirestoreError} if this
   * `DocumentSnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new V(D.FAILED_PRECONDITION, "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = this._document, n = {};
    return n.type = Mr._jsonSchemaVersion, n.bundle = "", n.bundleSource = "DocumentSnapshot", n.bundleName = this._key.toString(), !e || !e.isValidDocument() || !e.isFoundDocument() ? n : (this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields, "previous"), n.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED"), n);
  }
}
Mr._jsonSchemaVersion = "firestore/documentSnapshot/1.0", Mr._jsonSchema = {
  type: Te("string", Mr._jsonSchemaVersion),
  bundleSource: Te("string", "DocumentSnapshot"),
  bundleName: Te("string"),
  bundle: Te("string")
};
class xo extends Mr {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document.
   */
  data(e = {}) {
    return super.data(e);
  }
}
class qs {
  /** @hideconstructor */
  constructor(e, n, r, s) {
    this._firestore = e, this._userDataWriter = n, this._snapshot = s, this.metadata = new go(s.hasPendingWrites, s.fromCache), this.query = r;
  }
  /** An array of all the documents in the `QuerySnapshot`. */
  get docs() {
    const e = [];
    return this.forEach((n) => e.push(n)), e;
  }
  /** The number of documents in the `QuerySnapshot`. */
  get size() {
    return this._snapshot.docs.size;
  }
  /** True if there are no documents in the `QuerySnapshot`. */
  get empty() {
    return this.size === 0;
  }
  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg - The `this` binding for the callback.
   */
  forEach(e, n) {
    this._snapshot.docs.forEach((r) => {
      e.call(n, new xo(this._firestore, this._userDataWriter, r.key, r, new go(this._snapshot.mutatedKeys.has(r.key), this._snapshot.fromCache), this.query.converter));
    });
  }
  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as 'added'
   * changes.
   *
   * @param options - `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  docChanges(e = {}) {
    const n = !!e.includeMetadataChanges;
    if (n && this._snapshot.excludesMetadataChanges) throw new V(D.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
    return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === n || (this._cachedChanges = /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
    function(s, i) {
      if (s._snapshot.oldDocs.isEmpty()) {
        let o = 0;
        return s._snapshot.docChanges.map((c) => {
          const u = new xo(s._firestore, s._userDataWriter, c.doc.key, c.doc, new go(s._snapshot.mutatedKeys.has(c.doc.key), s._snapshot.fromCache), s.query.converter);
          return c.doc, {
            type: "added",
            doc: u,
            oldIndex: -1,
            newIndex: o++
          };
        });
      }
      {
        let o = s._snapshot.oldDocs;
        return s._snapshot.docChanges.filter((c) => i || c.type !== 3).map((c) => {
          const u = new xo(s._firestore, s._userDataWriter, c.doc.key, c.doc, new go(s._snapshot.mutatedKeys.has(c.doc.key), s._snapshot.fromCache), s.query.converter);
          let d = -1, f = -1;
          return c.type !== 0 && (d = o.indexOf(c.doc.key), o = o.delete(c.doc.key)), c.type !== 1 && (o = o.add(c.doc), f = o.indexOf(c.doc.key)), {
            type: Rk(c.type),
            doc: u,
            oldIndex: d,
            newIndex: f
          };
        });
      }
    }(this, n), this._cachedChangesIncludeMetadataChanges = n), this._cachedChanges;
  }
  /**
   * Returns a JSON-serializable representation of this `QuerySnapshot` instance.
   *
   * @returns a JSON representation of this object. Throws a {@link FirestoreError} if this
   * `QuerySnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new V(D.FAILED_PRECONDITION, "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = {};
    e.type = qs._jsonSchemaVersion, e.bundleSource = "QuerySnapshot", e.bundleName = ql.newId(), this._firestore._databaseId.database, this._firestore._databaseId.projectId;
    const n = [], r = [], s = [];
    return this.docs.forEach((i) => {
      i._document !== null && (n.push(i._document), r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields, "previous")), s.push(i.ref.path));
    }), e.bundle = (this._firestore, this.query._query, e.bundleName, "NOT SUPPORTED"), e;
  }
}
function Rk(t) {
  switch (t) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return G(61501, {
        type: t
      });
  }
}
qs._jsonSchemaVersion = "firestore/querySnapshot/1.0", qs._jsonSchema = {
  type: Te("string", qs._jsonSchemaVersion),
  bundleSource: Te("string", "QuerySnapshot"),
  bundleName: Te("string"),
  bundle: Te("string")
};
function Ck(t, e, n) {
  t = Uu(t, He);
  const r = Uu(t.firestore, Ry), s = Ak(t.converter, e, n);
  return Pk(r, [Sk(vk(r), "setDoc", t._key, s, t.converter !== null, n).toMutation(t._key, qt.none())]);
}
function Pk(t, e) {
  return function(r, s) {
    const i = new tr();
    return r.asyncQueue.enqueueAndForget(async () => rk(await hk(r), s, i)), i.promise;
  }(mk(t), e);
}
(function(e, n = !0) {
  (function(s) {
    ls = s;
  })(us), qr(new ur("firestore", (r, { instanceIdentifier: s, options: i }) => {
    const o = r.getProvider("app").getImmediate(), c = new Ry(new GC(r.getProvider("auth-internal")), new WC(o, r.getProvider("app-check-internal")), function(d, f) {
      if (!Object.prototype.hasOwnProperty.apply(d.options, ["projectId"])) throw new V(D.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new la(d.options.projectId, f);
    }(o, s), o);
    return i = Object.assign({
      useFetchStreams: n
    }, i), c._setSettings(i), c;
  }, "PUBLIC").setMultipleInstances(!0)), In(ep, tp, e), // BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
  In(ep, tp, "esm2017");
})();
const Dk = ["apiKey", "projectId", "appId"];
let eu = null;
function Hn(t, e = "") {
  const r = (import.meta?.env ?? {})?.[t];
  if (typeof r == "string" && r.length > 0) return r;
  const s = globalThis?.__VITE_ENV__?.[t];
  return typeof s == "string" && s.length > 0 ? s : e;
}
function kk() {
  return {
    apiKey: Hn("VITE_FIREBASE_API_KEY"),
    authDomain: Hn("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: Hn("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: Hn("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: Hn("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: Hn("VITE_FIREBASE_APP_ID"),
    measurementId: Hn("VITE_FIREBASE_MEASUREMENT_ID") || void 0
  };
}
function Vy() {
  return eu || (eu = kk()), eu;
}
function Uy() {
  const t = Vy();
  return Dk.every((e) => {
    const n = t[e];
    return typeof n == "string" && n.length > 0;
  });
}
var Nk = "firebase", Ok = "11.10.0";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
In(Nk, Ok, "app");
function fd(t, e) {
  var n = {};
  for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, r = Object.getOwnPropertySymbols(t); s < r.length; s++)
      e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[s]) && (n[r[s]] = t[r[s]]);
  return n;
}
function Fy() {
  return {
    "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."
  };
}
const Mk = Fy, By = new wi("auth", "Firebase", Fy());
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ea = new Bl("@firebase/auth");
function Lk(t, ...e) {
  Ea.logLevel <= z.WARN && Ea.warn(`Auth (${us}): ${t}`, ...e);
}
function Vo(t, ...e) {
  Ea.logLevel <= z.ERROR && Ea.error(`Auth (${us}): ${t}`, ...e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function en(t, ...e) {
  throw pd(t, ...e);
}
function kt(t, ...e) {
  return pd(t, ...e);
}
function $y(t, e, n) {
  const r = Object.assign(Object.assign({}, Mk()), { [e]: n });
  return new wi("auth", "Firebase", r).create(e, {
    appName: t.name
  });
}
function rr(t) {
  return $y(t, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function pd(t, ...e) {
  if (typeof t != "string") {
    const n = e[0], r = [...e.slice(1)];
    return r[0] && (r[0].appName = t.name), t._errorFactory.create(n, ...r);
  }
  return By.create(t, ...e);
}
function F(t, e, ...n) {
  if (!t)
    throw pd(e, ...n);
}
function $t(t) {
  const e = "INTERNAL ASSERTION FAILED: " + t;
  throw Vo(e), new Error(e);
}
function tn(t, e) {
  t || $t(e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Yu() {
  var t;
  return typeof self < "u" && ((t = self.location) === null || t === void 0 ? void 0 : t.href) || "";
}
function xk() {
  return $p() === "http:" || $p() === "https:";
}
function $p() {
  var t;
  return typeof self < "u" && ((t = self.location) === null || t === void 0 ? void 0 : t.protocol) || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Vk() {
  return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && // Apply only for traditional web apps and Chrome extensions.
  // This is especially true for Cordova apps which have unreliable
  // navigator.onLine behavior unless cordova-plugin-network-information is
  // installed which overwrites the native navigator.onLine value and
  // defines navigator.connection.
  (xk() || v0() || "connection" in navigator) ? navigator.onLine : !0;
}
function Uk() {
  if (typeof navigator > "u")
    return null;
  const t = navigator;
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    t.languages && t.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    t.language || // Couldn't determine language.
    null
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ni {
  constructor(e, n) {
    this.shortDelay = e, this.longDelay = n, tn(n > e, "Short delay should be less than long delay!"), this.isMobile = _0() || S0();
  }
  get() {
    return Vk() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function md(t, e) {
  tn(t.emulator, "Emulator should always be set here");
  const { url: n } = t.emulator;
  return e ? `${n}${e.startsWith("/") ? e.slice(1) : e}` : n;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class jy {
  static initialize(e, n, r) {
    this.fetchImpl = e, n && (this.headersImpl = n), r && (this.responseImpl = r);
  }
  static fetch() {
    if (this.fetchImpl)
      return this.fetchImpl;
    if (typeof self < "u" && "fetch" in self)
      return self.fetch;
    if (typeof globalThis < "u" && globalThis.fetch)
      return globalThis.fetch;
    if (typeof fetch < "u")
      return fetch;
    $t("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static headers() {
    if (this.headersImpl)
      return this.headersImpl;
    if (typeof self < "u" && "Headers" in self)
      return self.Headers;
    if (typeof globalThis < "u" && globalThis.Headers)
      return globalThis.Headers;
    if (typeof Headers < "u")
      return Headers;
    $t("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static response() {
    if (this.responseImpl)
      return this.responseImpl;
    if (typeof self < "u" && "Response" in self)
      return self.Response;
    if (typeof globalThis < "u" && globalThis.Response)
      return globalThis.Response;
    if (typeof Response < "u")
      return Response;
    $t("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Fk = {
  // Custom token errors.
  CREDENTIAL_MISMATCH: "custom-token-mismatch",
  // This can only happen if the SDK sends a bad request.
  MISSING_CUSTOM_TOKEN: "internal-error",
  // Create Auth URI errors.
  INVALID_IDENTIFIER: "invalid-email",
  // This can only happen if the SDK sends a bad request.
  MISSING_CONTINUE_URI: "internal-error",
  // Sign in with email and password errors (some apply to sign up too).
  INVALID_PASSWORD: "wrong-password",
  // This can only happen if the SDK sends a bad request.
  MISSING_PASSWORD: "missing-password",
  // Thrown if Email Enumeration Protection is enabled in the project and the email or password is
  // invalid.
  INVALID_LOGIN_CREDENTIALS: "invalid-credential",
  // Sign up with email and password errors.
  EMAIL_EXISTS: "email-already-in-use",
  PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
  // Verify assertion for sign in with credential errors:
  INVALID_IDP_RESPONSE: "invalid-credential",
  INVALID_PENDING_TOKEN: "invalid-credential",
  FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
  // This can only happen if the SDK sends a bad request.
  MISSING_REQ_TYPE: "internal-error",
  // Send Password reset email errors:
  EMAIL_NOT_FOUND: "user-not-found",
  RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
  EXPIRED_OOB_CODE: "expired-action-code",
  INVALID_OOB_CODE: "invalid-action-code",
  // This can only happen if the SDK sends a bad request.
  MISSING_OOB_CODE: "internal-error",
  // Operations that require ID token in request:
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
  INVALID_ID_TOKEN: "invalid-user-token",
  TOKEN_EXPIRED: "user-token-expired",
  USER_NOT_FOUND: "user-token-expired",
  // Other errors.
  TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
  // Phone Auth related errors.
  INVALID_CODE: "invalid-verification-code",
  INVALID_SESSION_INFO: "invalid-verification-id",
  INVALID_TEMPORARY_PROOF: "invalid-credential",
  MISSING_SESSION_INFO: "missing-verification-id",
  SESSION_EXPIRED: "code-expired",
  // Other action code errors when additional settings passed.
  // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
  // This is OK as this error will be caught by client side validation.
  MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
  UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
  // getProjectConfig errors when clientId is passed.
  INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
  // User actions (sign-up or deletion) disabled errors.
  ADMIN_ONLY_OPERATION: "admin-restricted-operation",
  // Multi factor related errors.
  INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
  MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
  MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
  MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
  SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
  SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
  // Blocking functions related errors.
  BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
  // Recaptcha related errors.
  RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
  MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
  INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
  INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
  MISSING_CLIENT_TYPE: "missing-client-type",
  MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
  INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
  INVALID_REQ_TYPE: "invalid-req-type"
  /* AuthErrorCode.INVALID_REQ_TYPE */
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Bk = [
  "/v1/accounts:signInWithCustomToken",
  "/v1/accounts:signInWithEmailLink",
  "/v1/accounts:signInWithIdp",
  "/v1/accounts:signInWithPassword",
  "/v1/accounts:signInWithPhoneNumber",
  "/v1/token"
  /* Endpoint.TOKEN */
], $k = new Ni(3e4, 6e4);
function gd(t, e) {
  return t.tenantId && !e.tenantId ? Object.assign(Object.assign({}, e), { tenantId: t.tenantId }) : e;
}
async function hs(t, e, n, r, s = {}) {
  return Hy(t, s, async () => {
    let i = {}, o = {};
    r && (e === "GET" ? o = r : i = {
      body: JSON.stringify(r)
    });
    const c = bi(Object.assign({ key: t.config.apiKey }, o)).slice(1), u = await t._getAdditionalHeaders();
    u[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/json", t.languageCode && (u[
      "X-Firebase-Locale"
      /* HttpHeader.X_FIREBASE_LOCALE */
    ] = t.languageCode);
    const d = Object.assign({
      method: e,
      headers: u
    }, i);
    return E0() || (d.referrerPolicy = "no-referrer"), t.emulatorConfig && cs(t.emulatorConfig.host) && (d.credentials = "include"), jy.fetch()(await Gy(t, t.config.apiHost, n, c), d);
  });
}
async function Hy(t, e, n) {
  t._canInitEmulator = !1;
  const r = Object.assign(Object.assign({}, Fk), e);
  try {
    const s = new Hk(t), i = await Promise.race([
      n(),
      s.promise
    ]);
    s.clearNetworkTimeout();
    const o = await i.json();
    if ("needConfirmation" in o)
      throw _o(t, "account-exists-with-different-credential", o);
    if (i.ok && !("errorMessage" in o))
      return o;
    {
      const c = i.ok ? o.errorMessage : o.error.message, [u, d] = c.split(" : ");
      if (u === "FEDERATED_USER_ID_ALREADY_LINKED")
        throw _o(t, "credential-already-in-use", o);
      if (u === "EMAIL_EXISTS")
        throw _o(t, "email-already-in-use", o);
      if (u === "USER_DISABLED")
        throw _o(t, "user-disabled", o);
      const f = r[u] || u.toLowerCase().replace(/[_\s]+/g, "-");
      if (d)
        throw $y(t, f, d);
      en(t, f);
    }
  } catch (s) {
    if (s instanceof rn)
      throw s;
    en(t, "network-request-failed", { message: String(s) });
  }
}
async function jk(t, e, n, r, s = {}) {
  const i = await hs(t, e, n, r, s);
  return "mfaPendingCredential" in i && en(t, "multi-factor-auth-required", {
    _serverResponse: i
  }), i;
}
async function Gy(t, e, n, r) {
  const s = `${e}${n}?${r}`, i = t, o = i.config.emulator ? md(t.config, s) : `${t.config.apiScheme}://${s}`;
  return Bk.includes(n) && (await i._persistenceManagerAvailable, i._getPersistenceType() === "COOKIE") ? i._getPersistence()._getFinalTarget(o).toString() : o;
}
class Hk {
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
  constructor(e) {
    this.auth = e, this.timer = null, this.promise = new Promise((n, r) => {
      this.timer = setTimeout(() => r(kt(
        this.auth,
        "network-request-failed"
        /* AuthErrorCode.NETWORK_REQUEST_FAILED */
      )), $k.get());
    });
  }
}
function _o(t, e, n) {
  const r = {
    appName: t.name
  };
  n.email && (r.email = n.email), n.phoneNumber && (r.phoneNumber = n.phoneNumber);
  const s = kt(t, e, r);
  return s.customData._tokenResponse = n, s;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Gk(t, e) {
  return hs(t, "POST", "/v1/accounts:delete", e);
}
async function va(t, e) {
  return hs(t, "POST", "/v1/accounts:lookup", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function zs(t) {
  if (t)
    try {
      const e = new Date(Number(t));
      if (!isNaN(e.getTime()))
        return e.toUTCString();
    } catch {
    }
}
async function qk(t, e = !1) {
  const n = pt(t), r = await n.getIdToken(e), s = _d(r);
  F(
    s && s.exp && s.auth_time && s.iat,
    n.auth,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const i = typeof s.firebase == "object" ? s.firebase : void 0, o = i?.sign_in_provider;
  return {
    claims: s,
    token: r,
    authTime: zs(tu(s.auth_time)),
    issuedAtTime: zs(tu(s.iat)),
    expirationTime: zs(tu(s.exp)),
    signInProvider: o || null,
    signInSecondFactor: i?.sign_in_second_factor || null
  };
}
function tu(t) {
  return Number(t) * 1e3;
}
function _d(t) {
  const [e, n, r] = t.split(".");
  if (e === void 0 || n === void 0 || r === void 0)
    return Vo("JWT malformed, contained fewer than 3 sections"), null;
  try {
    const s = __(n);
    return s ? JSON.parse(s) : (Vo("Failed to decode base64 JWT payload"), null);
  } catch (s) {
    return Vo("Caught error parsing JWT payload as JSON", s?.toString()), null;
  }
}
function jp(t) {
  const e = _d(t);
  return F(
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), F(
    typeof e.exp < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), F(
    typeof e.iat < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Number(e.exp) - Number(e.iat);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function ci(t, e, n = !1) {
  if (n)
    return e;
  try {
    return await e;
  } catch (r) {
    throw r instanceof rn && zk(r) && t.auth.currentUser === t && await t.auth.signOut(), r;
  }
}
function zk({ code: t }) {
  return t === "auth/user-disabled" || t === "auth/user-token-expired";
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Wk {
  constructor(e) {
    this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
  }
  _start() {
    this.isRunning || (this.isRunning = !0, this.schedule());
  }
  _stop() {
    this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    var n;
    if (e) {
      const r = this.errorBackoff;
      return this.errorBackoff = Math.min(
        this.errorBackoff * 2,
        96e4
        /* Duration.RETRY_BACKOFF_MAX */
      ), r;
    } else {
      this.errorBackoff = 3e4;
      const s = ((n = this.user.stsTokenManager.expirationTime) !== null && n !== void 0 ? n : 0) - Date.now() - 3e5;
      return Math.max(0, s);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning)
      return;
    const n = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, n);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      e?.code === "auth/network-request-failed" && this.schedule(
        /* wasError */
        !0
      );
      return;
    }
    this.schedule();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ju {
  constructor(e, n) {
    this.createdAt = e, this.lastLoginAt = n, this._initializeTime();
  }
  _initializeTime() {
    this.lastSignInTime = zs(this.lastLoginAt), this.creationTime = zs(this.createdAt);
  }
  _copy(e) {
    this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
  }
  toJSON() {
    return {
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Sa(t) {
  var e;
  const n = t.auth, r = await t.getIdToken(), s = await ci(t, va(n, { idToken: r }));
  F(
    s?.users.length,
    n,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const i = s.users[0];
  t._notifyReloadListener(i);
  const o = !((e = i.providerUserInfo) === null || e === void 0) && e.length ? qy(i.providerUserInfo) : [], c = Yk(t.providerData, o), u = t.isAnonymous, d = !(t.email && i.passwordHash) && !c?.length, f = u ? d : !1, p = {
    uid: i.localId,
    displayName: i.displayName || null,
    photoURL: i.photoUrl || null,
    email: i.email || null,
    emailVerified: i.emailVerified || !1,
    phoneNumber: i.phoneNumber || null,
    tenantId: i.tenantId || null,
    providerData: c,
    metadata: new Ju(i.createdAt, i.lastLoginAt),
    isAnonymous: f
  };
  Object.assign(t, p);
}
async function Kk(t) {
  const e = pt(t);
  await Sa(e), await e.auth._persistUserIfCurrent(e), e.auth._notifyListenersIfCurrent(e);
}
function Yk(t, e) {
  return [...t.filter((r) => !e.some((s) => s.providerId === r.providerId)), ...e];
}
function qy(t) {
  return t.map((e) => {
    var { providerId: n } = e, r = fd(e, ["providerId"]);
    return {
      providerId: n,
      uid: r.rawId || "",
      displayName: r.displayName || null,
      email: r.email || null,
      phoneNumber: r.phoneNumber || null,
      photoURL: r.photoUrl || null
    };
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Jk(t, e) {
  const n = await Hy(t, {}, async () => {
    const r = bi({
      grant_type: "refresh_token",
      refresh_token: e
    }).slice(1), { tokenApiHost: s, apiKey: i } = t.config, o = await Gy(t, s, "/v1/token", `key=${i}`), c = await t._getAdditionalHeaders();
    c[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/x-www-form-urlencoded";
    const u = {
      method: "POST",
      headers: c,
      body: r
    };
    return t.emulatorConfig && cs(t.emulatorConfig.host) && (u.credentials = "include"), jy.fetch()(o, u);
  });
  return {
    accessToken: n.access_token,
    expiresIn: n.expires_in,
    refreshToken: n.refresh_token
  };
}
async function Xk(t, e) {
  return hs(t, "POST", "/v2/accounts:revokeToken", gd(t, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Lr {
  constructor() {
    this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    F(
      e.idToken,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), F(
      typeof e.idToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), F(
      typeof e.refreshToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const n = "expiresIn" in e && typeof e.expiresIn < "u" ? Number(e.expiresIn) : jp(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, n);
  }
  updateFromIdToken(e) {
    F(
      e.length !== 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const n = jp(e);
    this.updateTokensAndExpiration(e, null, n);
  }
  async getToken(e, n = !1) {
    return !n && this.accessToken && !this.isExpired ? this.accessToken : (F(
      this.refreshToken,
      e,
      "user-token-expired"
      /* AuthErrorCode.TOKEN_EXPIRED */
    ), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, n) {
    const { accessToken: r, refreshToken: s, expiresIn: i } = await Jk(e, n);
    this.updateTokensAndExpiration(r, s, Number(i));
  }
  updateTokensAndExpiration(e, n, r) {
    this.refreshToken = n || null, this.accessToken = e || null, this.expirationTime = Date.now() + r * 1e3;
  }
  static fromJSON(e, n) {
    const { refreshToken: r, accessToken: s, expirationTime: i } = n, o = new Lr();
    return r && (F(typeof r == "string", "internal-error", {
      appName: e
    }), o.refreshToken = r), s && (F(typeof s == "string", "internal-error", {
      appName: e
    }), o.accessToken = s), i && (F(typeof i == "number", "internal-error", {
      appName: e
    }), o.expirationTime = i), o;
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime
    };
  }
  _assign(e) {
    this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
  }
  _clone() {
    return Object.assign(new Lr(), this.toJSON());
  }
  _performRefresh() {
    return $t("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function un(t, e) {
  F(typeof t == "string" || typeof t > "u", "internal-error", { appName: e });
}
class St {
  constructor(e) {
    var { uid: n, auth: r, stsTokenManager: s } = e, i = fd(e, ["uid", "auth", "stsTokenManager"]);
    this.providerId = "firebase", this.proactiveRefresh = new Wk(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = n, this.auth = r, this.stsTokenManager = s, this.accessToken = s.accessToken, this.displayName = i.displayName || null, this.email = i.email || null, this.emailVerified = i.emailVerified || !1, this.phoneNumber = i.phoneNumber || null, this.photoURL = i.photoURL || null, this.isAnonymous = i.isAnonymous || !1, this.tenantId = i.tenantId || null, this.providerData = i.providerData ? [...i.providerData] : [], this.metadata = new Ju(i.createdAt || void 0, i.lastLoginAt || void 0);
  }
  async getIdToken(e) {
    const n = await ci(this, this.stsTokenManager.getToken(this.auth, e));
    return F(
      n,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.accessToken !== n && (this.accessToken = n, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), n;
  }
  getIdTokenResult(e) {
    return qk(this, e);
  }
  reload() {
    return Kk(this);
  }
  _assign(e) {
    this !== e && (F(
      this.uid === e.uid,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((n) => Object.assign({}, n)), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const n = new St(Object.assign(Object.assign({}, this), { auth: e, stsTokenManager: this.stsTokenManager._clone() }));
    return n.metadata._copy(this.metadata), n;
  }
  _onReload(e) {
    F(
      !this.reloadListener,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null);
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, n = !1) {
    let r = !1;
    e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), r = !0), n && await Sa(this), await this.auth._persistUserIfCurrent(this), r && this.auth._notifyListenersIfCurrent(this);
  }
  async delete() {
    if (Pt(this.auth.app))
      return Promise.reject(rr(this.auth));
    const e = await this.getIdToken();
    return await ci(this, Gk(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
  }
  toJSON() {
    return Object.assign(Object.assign({
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((e) => Object.assign({}, e)),
      stsTokenManager: this.stsTokenManager.toJSON(),
      // Redirect event ID must be maintained in case there is a pending
      // redirect event.
      _redirectEventId: this._redirectEventId
    }, this.metadata.toJSON()), {
      // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name
    });
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(e, n) {
    var r, s, i, o, c, u, d, f;
    const p = (r = n.displayName) !== null && r !== void 0 ? r : void 0, _ = (s = n.email) !== null && s !== void 0 ? s : void 0, T = (i = n.phoneNumber) !== null && i !== void 0 ? i : void 0, w = (o = n.photoURL) !== null && o !== void 0 ? o : void 0, k = (c = n.tenantId) !== null && c !== void 0 ? c : void 0, P = (u = n._redirectEventId) !== null && u !== void 0 ? u : void 0, B = (d = n.createdAt) !== null && d !== void 0 ? d : void 0, U = (f = n.lastLoginAt) !== null && f !== void 0 ? f : void 0, { uid: H, emailVerified: ne, isAnonymous: De, providerData: ce, stsTokenManager: v } = n;
    F(
      H && v,
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const g = Lr.fromJSON(this.name, v);
    F(
      typeof H == "string",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), un(p, e.name), un(_, e.name), F(
      typeof ne == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), F(
      typeof De == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), un(T, e.name), un(w, e.name), un(k, e.name), un(P, e.name), un(B, e.name), un(U, e.name);
    const E = new St({
      uid: H,
      auth: e,
      email: _,
      emailVerified: ne,
      displayName: p,
      isAnonymous: De,
      photoURL: w,
      phoneNumber: T,
      tenantId: k,
      stsTokenManager: g,
      createdAt: B,
      lastLoginAt: U
    });
    return ce && Array.isArray(ce) && (E.providerData = ce.map((S) => Object.assign({}, S))), P && (E._redirectEventId = P), E;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromIdTokenResponse(e, n, r = !1) {
    const s = new Lr();
    s.updateFromServerResponse(n);
    const i = new St({
      uid: n.localId,
      auth: e,
      stsTokenManager: s,
      isAnonymous: r
    });
    return await Sa(i), i;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromGetAccountInfoResponse(e, n, r) {
    const s = n.users[0];
    F(
      s.localId !== void 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const i = s.providerUserInfo !== void 0 ? qy(s.providerUserInfo) : [], o = !(s.email && s.passwordHash) && !i?.length, c = new Lr();
    c.updateFromIdToken(r);
    const u = new St({
      uid: s.localId,
      auth: e,
      stsTokenManager: c,
      isAnonymous: o
    }), d = {
      uid: s.localId,
      displayName: s.displayName || null,
      photoURL: s.photoUrl || null,
      email: s.email || null,
      emailVerified: s.emailVerified || !1,
      phoneNumber: s.phoneNumber || null,
      tenantId: s.tenantId || null,
      providerData: i,
      metadata: new Ju(s.createdAt, s.lastLoginAt),
      isAnonymous: !(s.email && s.passwordHash) && !i?.length
    };
    return Object.assign(u, d), u;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Hp = /* @__PURE__ */ new Map();
function jt(t) {
  tn(t instanceof Function, "Expected a class definition");
  let e = Hp.get(t);
  return e ? (tn(e instanceof t, "Instance stored in cache mismatched with class"), e) : (e = new t(), Hp.set(t, e), e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class zy {
  constructor() {
    this.type = "NONE", this.storage = {};
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, n) {
    this.storage[e] = n;
  }
  async _get(e) {
    const n = this.storage[e];
    return n === void 0 ? null : n;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, n) {
  }
  _removeListener(e, n) {
  }
}
zy.type = "NONE";
const Gp = zy;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Uo(t, e, n) {
  return `firebase:${t}:${e}:${n}`;
}
class xr {
  constructor(e, n, r) {
    this.persistence = e, this.auth = n, this.userKey = r;
    const { config: s, name: i } = this.auth;
    this.fullUserKey = Uo(this.userKey, s.apiKey, i), this.fullPersistenceKey = Uo("persistence", s.apiKey, i), this.boundEventHandler = n._onStorageEvent.bind(n), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    if (!e)
      return null;
    if (typeof e == "string") {
      const n = await va(this.auth, { idToken: e }).catch(() => {
      });
      return n ? St._fromGetAccountInfoResponse(this.auth, n, e) : null;
    }
    return St._fromJSON(this.auth, e);
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(e) {
    if (this.persistence === e)
      return;
    const n = await this.getCurrentUser();
    if (await this.removeCurrentUser(), this.persistence = e, n)
      return this.setCurrentUser(n);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, n, r = "authUser") {
    if (!n.length)
      return new xr(jt(Gp), e, r);
    const s = (await Promise.all(n.map(async (d) => {
      if (await d._isAvailable())
        return d;
    }))).filter((d) => d);
    let i = s[0] || jt(Gp);
    const o = Uo(r, e.config.apiKey, e.name);
    let c = null;
    for (const d of n)
      try {
        const f = await d._get(o);
        if (f) {
          let p;
          if (typeof f == "string") {
            const _ = await va(e, {
              idToken: f
            }).catch(() => {
            });
            if (!_)
              break;
            p = await St._fromGetAccountInfoResponse(e, _, f);
          } else
            p = St._fromJSON(e, f);
          d !== i && (c = p), i = d;
          break;
        }
      } catch {
      }
    const u = s.filter((d) => d._shouldAllowMigration);
    return !i._shouldAllowMigration || !u.length ? new xr(i, e, r) : (i = u[0], c && await i._set(o, c.toJSON()), await Promise.all(n.map(async (d) => {
      if (d !== i)
        try {
          await d._remove(o);
        } catch {
        }
    })), new xr(i, e, r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function qp(t) {
  const e = t.toLowerCase();
  if (e.includes("opera/") || e.includes("opr/") || e.includes("opios/"))
    return "Opera";
  if (Jy(e))
    return "IEMobile";
  if (e.includes("msie") || e.includes("trident/"))
    return "IE";
  if (e.includes("edge/"))
    return "Edge";
  if (Wy(e))
    return "Firefox";
  if (e.includes("silk/"))
    return "Silk";
  if (Qy(e))
    return "Blackberry";
  if (Zy(e))
    return "Webos";
  if (Ky(e))
    return "Safari";
  if ((e.includes("chrome/") || Yy(e)) && !e.includes("edge/"))
    return "Chrome";
  if (Xy(e))
    return "Android";
  {
    const n = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, r = t.match(n);
    if (r?.length === 2)
      return r[1];
  }
  return "Other";
}
function Wy(t = qe()) {
  return /firefox\//i.test(t);
}
function Ky(t = qe()) {
  const e = t.toLowerCase();
  return e.includes("safari/") && !e.includes("chrome/") && !e.includes("crios/") && !e.includes("android");
}
function Yy(t = qe()) {
  return /crios\//i.test(t);
}
function Jy(t = qe()) {
  return /iemobile/i.test(t);
}
function Xy(t = qe()) {
  return /android/i.test(t);
}
function Qy(t = qe()) {
  return /blackberry/i.test(t);
}
function Zy(t = qe()) {
  return /webos/i.test(t);
}
function yd(t = qe()) {
  return /iphone|ipad|ipod/i.test(t) || /macintosh/i.test(t) && /mobile/i.test(t);
}
function Qk(t = qe()) {
  var e;
  return yd(t) && !!(!((e = window.navigator) === null || e === void 0) && e.standalone);
}
function Zk() {
  return T0() && document.documentMode === 10;
}
function eE(t = qe()) {
  return yd(t) || Xy(t) || Zy(t) || Qy(t) || /windows phone/i.test(t) || Jy(t);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function tE(t, e = []) {
  let n;
  switch (t) {
    case "Browser":
      n = qp(qe());
      break;
    case "Worker":
      n = `${qp(qe())}-${t}`;
      break;
    default:
      n = t;
  }
  const r = e.length ? e.join(",") : "FirebaseCore-web";
  return `${n}/JsCore/${us}/${r}`;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class eN {
  constructor(e) {
    this.auth = e, this.queue = [];
  }
  pushCallback(e, n) {
    const r = (i) => new Promise((o, c) => {
      try {
        const u = e(i);
        o(u);
      } catch (u) {
        c(u);
      }
    });
    r.onAbort = n, this.queue.push(r);
    const s = this.queue.length - 1;
    return () => {
      this.queue[s] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e)
      return;
    const n = [];
    try {
      for (const r of this.queue)
        await r(e), r.onAbort && n.push(r.onAbort);
    } catch (r) {
      n.reverse();
      for (const s of n)
        try {
          s();
        } catch {
        }
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: r?.message
      });
    }
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function tN(t, e = {}) {
  return hs(t, "GET", "/v2/passwordPolicy", gd(t, e));
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const nN = 6;
class rN {
  constructor(e) {
    var n, r, s, i;
    const o = e.customStrengthOptions;
    this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = (n = o.minPasswordLength) !== null && n !== void 0 ? n : nN, o.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = o.maxPasswordLength), o.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = o.containsLowercaseCharacter), o.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = o.containsUppercaseCharacter), o.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = o.containsNumericCharacter), o.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = o.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = (s = (r = e.allowedNonAlphanumericCharacters) === null || r === void 0 ? void 0 : r.join("")) !== null && s !== void 0 ? s : "", this.forceUpgradeOnSignin = (i = e.forceUpgradeOnSignin) !== null && i !== void 0 ? i : !1, this.schemaVersion = e.schemaVersion;
  }
  validatePassword(e) {
    var n, r, s, i, o, c;
    const u = {
      isValid: !0,
      passwordPolicy: this
    };
    return this.validatePasswordLengthOptions(e, u), this.validatePasswordCharacterOptions(e, u), u.isValid && (u.isValid = (n = u.meetsMinPasswordLength) !== null && n !== void 0 ? n : !0), u.isValid && (u.isValid = (r = u.meetsMaxPasswordLength) !== null && r !== void 0 ? r : !0), u.isValid && (u.isValid = (s = u.containsLowercaseLetter) !== null && s !== void 0 ? s : !0), u.isValid && (u.isValid = (i = u.containsUppercaseLetter) !== null && i !== void 0 ? i : !0), u.isValid && (u.isValid = (o = u.containsNumericCharacter) !== null && o !== void 0 ? o : !0), u.isValid && (u.isValid = (c = u.containsNonAlphanumericCharacter) !== null && c !== void 0 ? c : !0), u;
  }
  /**
   * Validates that the password meets the length options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordLengthOptions(e, n) {
    const r = this.customStrengthOptions.minPasswordLength, s = this.customStrengthOptions.maxPasswordLength;
    r && (n.meetsMinPasswordLength = e.length >= r), s && (n.meetsMaxPasswordLength = e.length <= s);
  }
  /**
   * Validates that the password meets the character options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordCharacterOptions(e, n) {
    this.updatePasswordCharacterOptionsStatuses(
      n,
      /* containsLowercaseCharacter= */
      !1,
      /* containsUppercaseCharacter= */
      !1,
      /* containsNumericCharacter= */
      !1,
      /* containsNonAlphanumericCharacter= */
      !1
    );
    let r;
    for (let s = 0; s < e.length; s++)
      r = e.charAt(s), this.updatePasswordCharacterOptionsStatuses(
        n,
        /* containsLowercaseCharacter= */
        r >= "a" && r <= "z",
        /* containsUppercaseCharacter= */
        r >= "A" && r <= "Z",
        /* containsNumericCharacter= */
        r >= "0" && r <= "9",
        /* containsNonAlphanumericCharacter= */
        this.allowedNonAlphanumericCharacters.includes(r)
      );
  }
  /**
   * Updates the running validation status with the statuses for the character options.
   * Expected to be called each time a character is processed to update each option status
   * based on the current character.
   *
   * @param status Validation status.
   * @param containsLowercaseCharacter Whether the character is a lowercase letter.
   * @param containsUppercaseCharacter Whether the character is an uppercase letter.
   * @param containsNumericCharacter Whether the character is a numeric character.
   * @param containsNonAlphanumericCharacter Whether the character is a non-alphanumeric character.
   */
  updatePasswordCharacterOptionsStatuses(e, n, r, s, i) {
    this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter || (e.containsLowercaseLetter = n)), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter || (e.containsUppercaseLetter = r)), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter || (e.containsNumericCharacter = s)), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = i));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sN {
  constructor(e, n, r, s) {
    this.app = e, this.heartbeatServiceProvider = n, this.appCheckServiceProvider = r, this.config = s, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new zp(this), this.idTokenSubscription = new zp(this), this.beforeStateQueue = new eN(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = By, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this._resolvePersistenceManagerAvailable = void 0, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = s.sdkClientVersion, this._persistenceManagerAvailable = new Promise((i) => this._resolvePersistenceManagerAvailable = i);
  }
  _initializeWithPersistence(e, n) {
    return n && (this._popupRedirectResolver = jt(n)), this._initializationPromise = this.queue(async () => {
      var r, s, i;
      if (!this._deleted && (this.persistenceManager = await xr.create(this, e), (r = this._resolvePersistenceManagerAvailable) === null || r === void 0 || r.call(this), !this._deleted)) {
        if (!((s = this._popupRedirectResolver) === null || s === void 0) && s._shouldInitProactively)
          try {
            await this._popupRedirectResolver._initialize(this);
          } catch {
          }
        await this.initializeCurrentUser(n), this.lastNotifiedUid = ((i = this.currentUser) === null || i === void 0 ? void 0 : i.uid) || null, !this._deleted && (this._isInitialized = !0);
      }
    }), this._initializationPromise;
  }
  /**
   * If the persistence is changed in another window, the user manager will let us know
   */
  async _onStorageEvent() {
    if (this._deleted)
      return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        this._currentUser._assign(e), await this.currentUser.getIdToken();
        return;
      }
      await this._updateCurrentUser(
        e,
        /* skipBeforeStateCallbacks */
        !0
      );
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const n = await va(this, { idToken: e }), r = await St._fromGetAccountInfoResponse(this, n, e);
      await this.directlySetCurrentUser(r);
    } catch (n) {
      console.warn("FirebaseServerApp could not login user with provided authIdToken: ", n), await this.directlySetCurrentUser(null);
    }
  }
  async initializeCurrentUser(e) {
    var n;
    if (Pt(this.app)) {
      const o = this.app.settings.authIdToken;
      return o ? new Promise((c) => {
        setTimeout(() => this.initializeCurrentUserFromIdToken(o).then(c, c));
      }) : this.directlySetCurrentUser(null);
    }
    const r = await this.assertedPersistence.getCurrentUser();
    let s = r, i = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const o = (n = this.redirectUser) === null || n === void 0 ? void 0 : n._redirectEventId, c = s?._redirectEventId, u = await this.tryRedirectSignIn(e);
      (!o || o === c) && u?.user && (s = u.user, i = !0);
    }
    if (!s)
      return this.directlySetCurrentUser(null);
    if (!s._redirectEventId) {
      if (i)
        try {
          await this.beforeStateQueue.runMiddleware(s);
        } catch (o) {
          s = r, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(o));
        }
      return s ? this.reloadAndSetCurrentUserOrClear(s) : this.directlySetCurrentUser(null);
    }
    return F(
      this._popupRedirectResolver,
      this,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === s._redirectEventId ? this.directlySetCurrentUser(s) : this.reloadAndSetCurrentUserOrClear(s);
  }
  async tryRedirectSignIn(e) {
    let n = null;
    try {
      n = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return n;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await Sa(e);
    } catch (n) {
      if (n?.code !== "auth/network-request-failed")
        return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = Uk();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (Pt(this.app))
      return Promise.reject(rr(this));
    const n = e ? pt(e) : null;
    return n && F(
      n.auth.config.apiKey === this.config.apiKey,
      this,
      "invalid-user-token"
      /* AuthErrorCode.INVALID_AUTH */
    ), this._updateCurrentUser(n && n._clone(this));
  }
  async _updateCurrentUser(e, n = !1) {
    if (!this._deleted)
      return e && F(
        this.tenantId === e.tenantId,
        this,
        "tenant-id-mismatch"
        /* AuthErrorCode.TENANT_ID_MISMATCH */
      ), n || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
        await this.directlySetCurrentUser(e), this.notifyAuthListeners();
      });
  }
  async signOut() {
    return Pt(this.app) ? Promise.reject(rr(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(
      null,
      /* skipBeforeStateCallbacks */
      !0
    ));
  }
  setPersistence(e) {
    return Pt(this.app) ? Promise.reject(rr(this)) : this.queue(async () => {
      await this.assertedPersistence.setPersistence(jt(e));
    });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
    const n = this._getPasswordPolicyInternal();
    return n.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {})) : n.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await tN(this), n = new rN(e);
    this.tenantId === null ? this._projectPasswordPolicy = n : this._tenantPasswordPolicies[this.tenantId] = n;
  }
  _getPersistenceType() {
    return this.assertedPersistence.persistence.type;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence;
  }
  _updateErrorMap(e) {
    this._errorFactory = new wi("auth", "Firebase", e());
  }
  onAuthStateChanged(e, n, r) {
    return this.registerStateListener(this.authStateSubscription, e, n, r);
  }
  beforeAuthStateChanged(e, n) {
    return this.beforeStateQueue.pushCallback(e, n);
  }
  onIdTokenChanged(e, n, r) {
    return this.registerStateListener(this.idTokenSubscription, e, n, r);
  }
  authStateReady() {
    return new Promise((e, n) => {
      if (this.currentUser)
        e();
      else {
        const r = this.onAuthStateChanged(() => {
          r(), e();
        }, n);
      }
    });
  }
  /**
   * Revokes the given access token. Currently only supports Apple OAuth access tokens.
   */
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const n = await this.currentUser.getIdToken(), r = {
        providerId: "apple.com",
        tokenType: "ACCESS_TOKEN",
        token: e,
        idToken: n
      };
      this.tenantId != null && (r.tenantId = this.tenantId), await Xk(this, r);
    }
  }
  toJSON() {
    var e;
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: (e = this._currentUser) === null || e === void 0 ? void 0 : e.toJSON()
    };
  }
  async _setRedirectUser(e, n) {
    const r = await this.getOrInitRedirectPersistenceManager(n);
    return e === null ? r.removeCurrentUser() : r.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const n = e && jt(e) || this._popupRedirectResolver;
      F(
        n,
        this,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      ), this.redirectPersistenceManager = await xr.create(
        this,
        [jt(n._redirectPersistence)],
        "redirectUser"
        /* KeyName.REDIRECT_USER */
      ), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    var n, r;
    return this._isInitialized && await this.queue(async () => {
    }), ((n = this._currentUser) === null || n === void 0 ? void 0 : n._redirectEventId) === e ? this._currentUser : ((r = this.redirectUser) === null || r === void 0 ? void 0 : r._redirectEventId) === e ? this.redirectUser : null;
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser)
      return this.queue(async () => this.directlySetCurrentUser(e));
  }
  /** Notifies listeners only if the user is current */
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
  }
  _stopProactiveRefresh() {
    this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
  }
  /** Returns the current user cast as the internal type */
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    var e, n;
    if (!this._isInitialized)
      return;
    this.idTokenSubscription.next(this.currentUser);
    const r = (n = (e = this.currentUser) === null || e === void 0 ? void 0 : e.uid) !== null && n !== void 0 ? n : null;
    this.lastNotifiedUid !== r && (this.lastNotifiedUid = r, this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, n, r, s) {
    if (this._deleted)
      return () => {
      };
    const i = typeof n == "function" ? n : n.next.bind(n);
    let o = !1;
    const c = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    if (F(
      c,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), c.then(() => {
      o || i(this.currentUser);
    }), typeof n == "function") {
      const u = e.addObserver(n, r, s);
      return () => {
        o = !0, u();
      };
    } else {
      const u = e.addObserver(n);
      return () => {
        o = !0, u();
      };
    }
  }
  /**
   * Unprotected (from race conditions) method to set the current user. This
   * should only be called from within a queued callback. This is necessary
   * because the queue shouldn't rely on another queued callback.
   */
  async directlySetCurrentUser(e) {
    this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
  }
  queue(e) {
    return this.operations = this.operations.then(e, e), this.operations;
  }
  get assertedPersistence() {
    return F(
      this.persistenceManager,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.persistenceManager;
  }
  _logFramework(e) {
    !e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = tE(this.config.clientPlatform, this._getFrameworks()));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    var e;
    const n = {
      "X-Client-Version": this.clientVersion
    };
    this.app.options.appId && (n[
      "X-Firebase-gmpid"
      /* HttpHeader.X_FIREBASE_GMPID */
    ] = this.app.options.appId);
    const r = await ((e = this.heartbeatServiceProvider.getImmediate({
      optional: !0
    })) === null || e === void 0 ? void 0 : e.getHeartbeatsHeader());
    r && (n[
      "X-Firebase-Client"
      /* HttpHeader.X_FIREBASE_CLIENT */
    ] = r);
    const s = await this._getAppCheckToken();
    return s && (n[
      "X-Firebase-AppCheck"
      /* HttpHeader.X_FIREBASE_APP_CHECK */
    ] = s), n;
  }
  async _getAppCheckToken() {
    var e;
    if (Pt(this.app) && this.app.settings.appCheckToken)
      return this.app.settings.appCheckToken;
    const n = await ((e = this.appCheckServiceProvider.getImmediate({ optional: !0 })) === null || e === void 0 ? void 0 : e.getToken());
    return n?.error && Lk(`Error while retrieving App Check token: ${n.error}`), n?.token;
  }
}
function Ed(t) {
  return pt(t);
}
class zp {
  constructor(e) {
    this.auth = e, this.observer = null, this.addObserver = D0((n) => this.observer = n);
  }
  get next() {
    return F(
      this.observer,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.observer.next.bind(this.observer);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let vd = {
  async loadJS() {
    throw new Error("Unable to load external scripts");
  },
  recaptchaV2Script: "",
  recaptchaEnterpriseScript: "",
  gapiScript: ""
};
function iN(t) {
  vd = t;
}
function oN(t) {
  return vd.loadJS(t);
}
function aN() {
  return vd.gapiScript;
}
function cN(t) {
  return `__${t}${Math.floor(Math.random() * 1e6)}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function uN(t, e) {
  const n = jl(t, "auth");
  if (n.isInitialized()) {
    const s = n.getImmediate(), i = n.getOptions();
    if (cr(i, e ?? {}))
      return s;
    en(
      s,
      "already-initialized"
      /* AuthErrorCode.ALREADY_INITIALIZED */
    );
  }
  return n.initialize({ options: e });
}
function lN(t, e) {
  const n = e?.persistence || [], r = (Array.isArray(n) ? n : [n]).map(jt);
  e?.errorMap && t._updateErrorMap(e.errorMap), t._initializeWithPersistence(r, e?.popupRedirectResolver);
}
function nE(t, e, n) {
  const r = Ed(t);
  F(
    /^https?:\/\//.test(e),
    r,
    "invalid-emulator-scheme"
    /* AuthErrorCode.INVALID_EMULATOR_SCHEME */
  );
  const s = !!n?.disableWarnings, i = rE(e), { host: o, port: c } = dN(e), u = c === null ? "" : `:${c}`, d = { url: `${i}//${o}${u}/` }, f = Object.freeze({
    host: o,
    port: c,
    protocol: i.replace(":", ""),
    options: Object.freeze({ disableWarnings: s })
  });
  if (!r._canInitEmulator) {
    F(
      r.config.emulator && r.emulatorConfig,
      r,
      "emulator-config-failed"
      /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
    ), F(
      cr(d, r.config.emulator) && cr(f, r.emulatorConfig),
      r,
      "emulator-config-failed"
      /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
    );
    return;
  }
  r.config.emulator = d, r.emulatorConfig = f, r.settings.appVerificationDisabledForTesting = !0, cs(o) ? (S_(`${i}//${o}${u}`), T_("Auth", !0)) : s || hN();
}
function rE(t) {
  const e = t.indexOf(":");
  return e < 0 ? "" : t.substr(0, e + 1);
}
function dN(t) {
  const e = rE(t), n = /(\/\/)?([^?#/]+)/.exec(t.substr(e.length));
  if (!n)
    return { host: "", port: null };
  const r = n[2].split("@").pop() || "", s = /^(\[[^\]]+\])(:|$)/.exec(r);
  if (s) {
    const i = s[1];
    return { host: i, port: Wp(r.substr(i.length + 1)) };
  } else {
    const [i, o] = r.split(":");
    return { host: i, port: Wp(o) };
  }
}
function Wp(t) {
  if (!t)
    return null;
  const e = Number(t);
  return isNaN(e) ? null : e;
}
function hN() {
  function t() {
    const e = document.createElement("p"), n = e.style;
    e.innerText = "Running in emulator mode. Do not use with production credentials.", n.position = "fixed", n.width = "100%", n.backgroundColor = "#ffffff", n.border = ".1em solid #000000", n.color = "#b50000", n.bottom = "0px", n.left = "0px", n.margin = "0px", n.zIndex = "10000", n.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
  }
  typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", t) : t());
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sE {
  /** @internal */
  constructor(e, n) {
    this.providerId = e, this.signInMethod = n;
  }
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns a JSON-serializable representation of this object.
   */
  toJSON() {
    return $t("not implemented");
  }
  /** @internal */
  _getIdTokenResponse(e) {
    return $t("not implemented");
  }
  /** @internal */
  _linkToIdToken(e, n) {
    return $t("not implemented");
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return $t("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Vr(t, e) {
  return jk(t, "POST", "/v1/accounts:signInWithIdp", gd(t, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fN = "http://localhost";
class pr extends sE {
  constructor() {
    super(...arguments), this.pendingToken = null;
  }
  /** @internal */
  static _fromParams(e) {
    const n = new pr(e.providerId, e.signInMethod);
    return e.idToken || e.accessToken ? (e.idToken && (n.idToken = e.idToken), e.accessToken && (n.accessToken = e.accessToken), e.nonce && !e.pendingToken && (n.nonce = e.nonce), e.pendingToken && (n.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (n.accessToken = e.oauthToken, n.secret = e.oauthTokenSecret) : en(
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), n;
  }
  /** {@inheritdoc AuthCredential.toJSON}  */
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an
   * {@link  AuthCredential}.
   *
   * @param json - Input can be either Object or the stringified representation of the object.
   * When string is provided, JSON.parse would be called first.
   *
   * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const n = typeof e == "string" ? JSON.parse(e) : e, { providerId: r, signInMethod: s } = n, i = fd(n, ["providerId", "signInMethod"]);
    if (!r || !s)
      return null;
    const o = new pr(r, s);
    return o.idToken = i.idToken || void 0, o.accessToken = i.accessToken || void 0, o.secret = i.secret, o.nonce = i.nonce, o.pendingToken = i.pendingToken || null, o;
  }
  /** @internal */
  _getIdTokenResponse(e) {
    const n = this.buildRequest();
    return Vr(e, n);
  }
  /** @internal */
  _linkToIdToken(e, n) {
    const r = this.buildRequest();
    return r.idToken = n, Vr(e, r);
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    const n = this.buildRequest();
    return n.autoCreate = !1, Vr(e, n);
  }
  buildRequest() {
    const e = {
      requestUri: fN,
      returnSecureToken: !0
    };
    if (this.pendingToken)
      e.pendingToken = this.pendingToken;
    else {
      const n = {};
      this.idToken && (n.id_token = this.idToken), this.accessToken && (n.access_token = this.accessToken), this.secret && (n.oauth_token_secret = this.secret), n.providerId = this.providerId, this.nonce && !this.pendingToken && (n.nonce = this.nonce), e.postBody = bi(n);
    }
    return e;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class iE {
  /**
   * Constructor for generic OAuth providers.
   *
   * @param providerId - Provider for which credentials should be generated.
   */
  constructor(e) {
    this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
  }
  /**
   * Set the language gode.
   *
   * @param languageCode - language code
   */
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  /**
   * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
   * operations.
   *
   * @remarks
   * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
   * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
   *
   * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
   */
  setCustomParameters(e) {
    return this.customParameters = e, this;
  }
  /**
   * Retrieve the current list of {@link CustomParameters}.
   */
  getCustomParameters() {
    return this.customParameters;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Oi extends iE {
  constructor() {
    super(...arguments), this.scopes = [];
  }
  /**
   * Add an OAuth scope to the credential.
   *
   * @param scope - Provider OAuth scope to add.
   */
  addScope(e) {
    return this.scopes.includes(e) || this.scopes.push(e), this;
  }
  /**
   * Retrieve the current list of OAuth scopes.
   */
  getScopes() {
    return [...this.scopes];
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class mn extends Oi {
  constructor() {
    super(
      "facebook.com"
      /* ProviderId.FACEBOOK */
    );
  }
  /**
   * Creates a credential for Facebook.
   *
   * @example
   * ```javascript
   * // `event` from the Facebook auth.authResponseChange callback.
   * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param accessToken - Facebook access token.
   */
  static credential(e) {
    return pr._fromParams({
      providerId: mn.PROVIDER_ID,
      signInMethod: mn.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return mn.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return mn.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return mn.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
mn.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
mn.PROVIDER_ID = "facebook.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gn extends Oi {
  constructor() {
    super(
      "google.com"
      /* ProviderId.GOOGLE */
    ), this.addScope("profile");
  }
  /**
   * Creates a credential for Google. At least one of ID token and access token is required.
   *
   * @example
   * ```javascript
   * // \`googleUser\` from the onsuccess Google Sign In callback.
   * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param idToken - Google ID token.
   * @param accessToken - Google access token.
   */
  static credential(e, n) {
    return pr._fromParams({
      providerId: gn.PROVIDER_ID,
      signInMethod: gn.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: n
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return gn.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return gn.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthIdToken: n, oauthAccessToken: r } = e;
    if (!n && !r)
      return null;
    try {
      return gn.credential(n, r);
    } catch {
      return null;
    }
  }
}
gn.GOOGLE_SIGN_IN_METHOD = "google.com";
gn.PROVIDER_ID = "google.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _n extends Oi {
  constructor() {
    super(
      "github.com"
      /* ProviderId.GITHUB */
    );
  }
  /**
   * Creates a credential for GitHub.
   *
   * @param accessToken - GitHub access token.
   */
  static credential(e) {
    return pr._fromParams({
      providerId: _n.PROVIDER_ID,
      signInMethod: _n.GITHUB_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return _n.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return _n.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return _n.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
_n.GITHUB_SIGN_IN_METHOD = "github.com";
_n.PROVIDER_ID = "github.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yn extends Oi {
  constructor() {
    super(
      "twitter.com"
      /* ProviderId.TWITTER */
    );
  }
  /**
   * Creates a credential for Twitter.
   *
   * @param token - Twitter access token.
   * @param secret - Twitter secret.
   */
  static credential(e, n) {
    return pr._fromParams({
      providerId: yn.PROVIDER_ID,
      signInMethod: yn.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: n
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return yn.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return yn.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthAccessToken: n, oauthTokenSecret: r } = e;
    if (!n || !r)
      return null;
    try {
      return yn.credential(n, r);
    } catch {
      return null;
    }
  }
}
yn.TWITTER_SIGN_IN_METHOD = "twitter.com";
yn.PROVIDER_ID = "twitter.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qr {
  constructor(e) {
    this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
  }
  static async _fromIdTokenResponse(e, n, r, s = !1) {
    const i = await St._fromIdTokenResponse(e, r, s), o = Kp(r);
    return new Qr({
      user: i,
      providerId: o,
      _tokenResponse: r,
      operationType: n
    });
  }
  static async _forOperation(e, n, r) {
    await e._updateTokensIfNecessary(
      r,
      /* reload */
      !0
    );
    const s = Kp(r);
    return new Qr({
      user: e,
      providerId: s,
      _tokenResponse: r,
      operationType: n
    });
  }
}
function Kp(t) {
  return t.providerId ? t.providerId : "phoneNumber" in t ? "phone" : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ta extends rn {
  constructor(e, n, r, s) {
    var i;
    super(n.code, n.message), this.operationType = r, this.user = s, Object.setPrototypeOf(this, Ta.prototype), this.customData = {
      appName: e.name,
      tenantId: (i = e.tenantId) !== null && i !== void 0 ? i : void 0,
      _serverResponse: n.customData._serverResponse,
      operationType: r
    };
  }
  static _fromErrorAndOperation(e, n, r, s) {
    return new Ta(e, n, r, s);
  }
}
function oE(t, e, n, r) {
  return (e === "reauthenticate" ? n._getReauthenticationResolver(t) : n._getIdTokenResponse(t)).catch((i) => {
    throw i.code === "auth/multi-factor-auth-required" ? Ta._fromErrorAndOperation(t, i, e, r) : i;
  });
}
async function pN(t, e, n = !1) {
  const r = await ci(t, e._linkToIdToken(t.auth, await t.getIdToken()), n);
  return Qr._forOperation(t, "link", r);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function mN(t, e, n = !1) {
  const { auth: r } = t;
  if (Pt(r.app))
    return Promise.reject(rr(r));
  const s = "reauthenticate";
  try {
    const i = await ci(t, oE(r, s, e, t), n);
    F(
      i.idToken,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const o = _d(i.idToken);
    F(
      o,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const { sub: c } = o;
    return F(
      t.uid === c,
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), Qr._forOperation(t, s, i);
  } catch (i) {
    throw i?.code === "auth/user-not-found" && en(
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), i;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function gN(t, e, n = !1) {
  if (Pt(t.app))
    return Promise.reject(rr(t));
  const r = "signIn", s = await oE(t, r, e), i = await Qr._fromIdTokenResponse(t, r, s);
  return n || await t._updateCurrentUser(i.user), i;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _N(t, e) {
  return pt(t).setPersistence(e);
}
function yN(t, e, n, r) {
  return pt(t).onIdTokenChanged(e, n, r);
}
function EN(t, e, n) {
  return pt(t).beforeAuthStateChanged(e, n);
}
function vN(t, e, n, r) {
  return pt(t).onAuthStateChanged(e, n, r);
}
const Ia = "__sak";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class aE {
  constructor(e, n) {
    this.storageRetriever = e, this.type = n;
  }
  _isAvailable() {
    try {
      return this.storage ? (this.storage.setItem(Ia, "1"), this.storage.removeItem(Ia), Promise.resolve(!0)) : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, n) {
    return this.storage.setItem(e, JSON.stringify(n)), Promise.resolve();
  }
  _get(e) {
    const n = this.storage.getItem(e);
    return Promise.resolve(n ? JSON.parse(n) : null);
  }
  _remove(e) {
    return this.storage.removeItem(e), Promise.resolve();
  }
  get storage() {
    return this.storageRetriever();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const SN = 1e3, TN = 10;
class cE extends aE {
  constructor() {
    super(
      () => window.localStorage,
      "LOCAL"
      /* PersistenceType.LOCAL */
    ), this.boundEventHandler = (e, n) => this.onStorageEvent(e, n), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = eE(), this._shouldAllowMigration = !0;
  }
  forAllChangedKeys(e) {
    for (const n of Object.keys(this.listeners)) {
      const r = this.storage.getItem(n), s = this.localCache[n];
      r !== s && e(n, s, r);
    }
  }
  onStorageEvent(e, n = !1) {
    if (!e.key) {
      this.forAllChangedKeys((o, c, u) => {
        this.notifyListeners(o, u);
      });
      return;
    }
    const r = e.key;
    n ? this.detachListener() : this.stopPolling();
    const s = () => {
      const o = this.storage.getItem(r);
      !n && this.localCache[r] === o || this.notifyListeners(r, o);
    }, i = this.storage.getItem(r);
    Zk() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(s, TN) : s();
  }
  notifyListeners(e, n) {
    this.localCache[e] = n;
    const r = this.listeners[e];
    if (r)
      for (const s of Array.from(r))
        s(n && JSON.parse(n));
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(() => {
      this.forAllChangedKeys((e, n, r) => {
        this.onStorageEvent(
          new StorageEvent("storage", {
            key: e,
            oldValue: n,
            newValue: r
          }),
          /* poll */
          !0
        );
      });
    }, SN);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(e, n) {
    Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(n);
  }
  _removeListener(e, n) {
    this.listeners[e] && (this.listeners[e].delete(n), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
  }
  // Update local cache on base operations:
  async _set(e, n) {
    await super._set(e, n), this.localCache[e] = JSON.stringify(n);
  }
  async _get(e) {
    const n = await super._get(e);
    return this.localCache[e] = JSON.stringify(n), n;
  }
  async _remove(e) {
    await super._remove(e), delete this.localCache[e];
  }
}
cE.type = "LOCAL";
const uE = cE;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class lE extends aE {
  constructor() {
    super(
      () => window.sessionStorage,
      "SESSION"
      /* PersistenceType.SESSION */
    );
  }
  _addListener(e, n) {
  }
  _removeListener(e, n) {
  }
}
lE.type = "SESSION";
const dE = lE;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function IN(t) {
  return Promise.all(t.map(async (e) => {
    try {
      return {
        fulfilled: !0,
        value: await e
      };
    } catch (n) {
      return {
        fulfilled: !1,
        reason: n
      };
    }
  }));
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class nc {
  constructor(e) {
    this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
  }
  /**
   * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
   *
   * @param eventTarget - An event target (such as window or self) through which the underlying
   * messages will be received.
   */
  static _getInstance(e) {
    const n = this.receivers.find((s) => s.isListeningto(e));
    if (n)
      return n;
    const r = new nc(e);
    return this.receivers.push(r), r;
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  /**
   * Fans out a MessageEvent to the appropriate listeners.
   *
   * @remarks
   * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
   * finished processing.
   *
   * @param event - The MessageEvent.
   *
   */
  async handleEvent(e) {
    const n = e, { eventId: r, eventType: s, data: i } = n.data, o = this.handlersMap[s];
    if (!o?.size)
      return;
    n.ports[0].postMessage({
      status: "ack",
      eventId: r,
      eventType: s
    });
    const c = Array.from(o).map(async (d) => d(n.origin, i)), u = await IN(c);
    n.ports[0].postMessage({
      status: "done",
      eventId: r,
      eventType: s,
      response: u
    });
  }
  /**
   * Subscribe an event handler for a particular event.
   *
   * @param eventType - Event name to subscribe to.
   * @param eventHandler - The event handler which should receive the events.
   *
   */
  _subscribe(e, n) {
    Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(n);
  }
  /**
   * Unsubscribe an event handler from a particular event.
   *
   * @param eventType - Event name to unsubscribe from.
   * @param eventHandler - Optional event handler, if none provided, unsubscribe all handlers on this event.
   *
   */
  _unsubscribe(e, n) {
    this.handlersMap[e] && n && this.handlersMap[e].delete(n), (!n || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
  }
}
nc.receivers = [];
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Sd(t = "", e = 10) {
  let n = "";
  for (let r = 0; r < e; r++)
    n += Math.floor(Math.random() * 10);
  return t + n;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wN {
  constructor(e) {
    this.target = e, this.handlers = /* @__PURE__ */ new Set();
  }
  /**
   * Unsubscribe the handler and remove it from our tracking Set.
   *
   * @param handler - The handler to unsubscribe.
   */
  removeMessageHandler(e) {
    e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
  }
  /**
   * Send a message to the Receiver located at {@link target}.
   *
   * @remarks
   * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
   * receiver has had a chance to fully process the event.
   *
   * @param eventType - Type of event to send.
   * @param data - The payload of the event.
   * @param timeout - Timeout for waiting on an ACK from the receiver.
   *
   * @returns An array of settled promises from all the handlers that were listening on the receiver.
   */
  async _send(e, n, r = 50) {
    const s = typeof MessageChannel < "u" ? new MessageChannel() : null;
    if (!s)
      throw new Error(
        "connection_unavailable"
        /* _MessageError.CONNECTION_UNAVAILABLE */
      );
    let i, o;
    return new Promise((c, u) => {
      const d = Sd("", 20);
      s.port1.start();
      const f = setTimeout(() => {
        u(new Error(
          "unsupported_event"
          /* _MessageError.UNSUPPORTED_EVENT */
        ));
      }, r);
      o = {
        messageChannel: s,
        onMessage(p) {
          const _ = p;
          if (_.data.eventId === d)
            switch (_.data.status) {
              case "ack":
                clearTimeout(f), i = setTimeout(
                  () => {
                    u(new Error(
                      "timeout"
                      /* _MessageError.TIMEOUT */
                    ));
                  },
                  3e3
                  /* _TimeoutDuration.COMPLETION */
                );
                break;
              case "done":
                clearTimeout(i), c(_.data.response);
                break;
              default:
                clearTimeout(f), clearTimeout(i), u(new Error(
                  "invalid_response"
                  /* _MessageError.INVALID_RESPONSE */
                ));
                break;
            }
        }
      }, this.handlers.add(o), s.port1.addEventListener("message", o.onMessage), this.target.postMessage({
        eventType: e,
        eventId: d,
        data: n
      }, [s.port2]);
    }).finally(() => {
      o && this.removeMessageHandler(o);
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Nt() {
  return window;
}
function bN(t) {
  Nt().location.href = t;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function hE() {
  return typeof Nt().WorkerGlobalScope < "u" && typeof Nt().importScripts == "function";
}
async function AN() {
  if (!navigator?.serviceWorker)
    return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function RN() {
  var t;
  return ((t = navigator?.serviceWorker) === null || t === void 0 ? void 0 : t.controller) || null;
}
function CN() {
  return hE() ? self : null;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fE = "firebaseLocalStorageDb", PN = 1, wa = "firebaseLocalStorage", pE = "fbase_key";
class Mi {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, n) => {
      this.request.addEventListener("success", () => {
        e(this.request.result);
      }), this.request.addEventListener("error", () => {
        n(this.request.error);
      });
    });
  }
}
function rc(t, e) {
  return t.transaction([wa], e ? "readwrite" : "readonly").objectStore(wa);
}
function DN() {
  const t = indexedDB.deleteDatabase(fE);
  return new Mi(t).toPromise();
}
function Xu() {
  const t = indexedDB.open(fE, PN);
  return new Promise((e, n) => {
    t.addEventListener("error", () => {
      n(t.error);
    }), t.addEventListener("upgradeneeded", () => {
      const r = t.result;
      try {
        r.createObjectStore(wa, { keyPath: pE });
      } catch (s) {
        n(s);
      }
    }), t.addEventListener("success", async () => {
      const r = t.result;
      r.objectStoreNames.contains(wa) ? e(r) : (r.close(), await DN(), e(await Xu()));
    });
  });
}
async function Yp(t, e, n) {
  const r = rc(t, !0).put({
    [pE]: e,
    value: n
  });
  return new Mi(r).toPromise();
}
async function kN(t, e) {
  const n = rc(t, !1).get(e), r = await new Mi(n).toPromise();
  return r === void 0 ? null : r.value;
}
function Jp(t, e) {
  const n = rc(t, !0).delete(e);
  return new Mi(n).toPromise();
}
const NN = 800, ON = 3;
class mE {
  constructor() {
    this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {
    }, () => {
    });
  }
  async _openDb() {
    return this.db ? this.db : (this.db = await Xu(), this.db);
  }
  async _withRetries(e) {
    let n = 0;
    for (; ; )
      try {
        const r = await this._openDb();
        return await e(r);
      } catch (r) {
        if (n++ > ON)
          throw r;
        this.db && (this.db.close(), this.db = void 0);
      }
  }
  /**
   * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
   * postMessage interface to send these events to the worker ourselves.
   */
  async initializeServiceWorkerMessaging() {
    return hE() ? this.initializeReceiver() : this.initializeSender();
  }
  /**
   * As the worker we should listen to events from the main window.
   */
  async initializeReceiver() {
    this.receiver = nc._getInstance(CN()), this.receiver._subscribe("keyChanged", async (e, n) => ({
      keyProcessed: (await this._poll()).includes(n.key)
    })), this.receiver._subscribe("ping", async (e, n) => [
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ]);
  }
  /**
   * As the main window, we should let the worker know when keys change (set and remove).
   *
   * @remarks
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
   * may not resolve.
   */
  async initializeSender() {
    var e, n;
    if (this.activeServiceWorker = await AN(), !this.activeServiceWorker)
      return;
    this.sender = new wN(this.activeServiceWorker);
    const r = await this.sender._send(
      "ping",
      {},
      800
      /* _TimeoutDuration.LONG_ACK */
    );
    r && !((e = r[0]) === null || e === void 0) && e.fulfilled && !((n = r[0]) === null || n === void 0) && n.value.includes(
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ) && (this.serviceWorkerReceiverAvailable = !0);
  }
  /**
   * Let the worker know about a changed key, the exact key doesn't technically matter since the
   * worker will just trigger a full sync anyway.
   *
   * @remarks
   * For now, we only support one service worker per page.
   *
   * @param key - Storage key which changed.
   */
  async notifyServiceWorker(e) {
    if (!(!this.sender || !this.activeServiceWorker || RN() !== this.activeServiceWorker))
      try {
        await this.sender._send(
          "keyChanged",
          { key: e },
          // Use long timeout if receiver has previously responded to a ping from us.
          this.serviceWorkerReceiverAvailable ? 800 : 50
          /* _TimeoutDuration.ACK */
        );
      } catch {
      }
  }
  async _isAvailable() {
    try {
      if (!indexedDB)
        return !1;
      const e = await Xu();
      return await Yp(e, Ia, "1"), await Jp(e, Ia), !0;
    } catch {
    }
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, n) {
    return this._withPendingWrite(async () => (await this._withRetries((r) => Yp(r, e, n)), this.localCache[e] = n, this.notifyServiceWorker(e)));
  }
  async _get(e) {
    const n = await this._withRetries((r) => kN(r, e));
    return this.localCache[e] = n, n;
  }
  async _remove(e) {
    return this._withPendingWrite(async () => (await this._withRetries((n) => Jp(n, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
  }
  async _poll() {
    const e = await this._withRetries((s) => {
      const i = rc(s, !1).getAll();
      return new Mi(i).toPromise();
    });
    if (!e)
      return [];
    if (this.pendingWrites !== 0)
      return [];
    const n = [], r = /* @__PURE__ */ new Set();
    if (e.length !== 0)
      for (const { fbase_key: s, value: i } of e)
        r.add(s), JSON.stringify(this.localCache[s]) !== JSON.stringify(i) && (this.notifyListeners(s, i), n.push(s));
    for (const s of Object.keys(this.localCache))
      this.localCache[s] && !r.has(s) && (this.notifyListeners(s, null), n.push(s));
    return n;
  }
  notifyListeners(e, n) {
    this.localCache[e] = n;
    const r = this.listeners[e];
    if (r)
      for (const s of Array.from(r))
        s(n);
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), NN);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  _addListener(e, n) {
    Object.keys(this.listeners).length === 0 && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(n);
  }
  _removeListener(e, n) {
    this.listeners[e] && (this.listeners[e].delete(n), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && this.stopPolling();
  }
}
mE.type = "LOCAL";
const MN = mE;
new Ni(3e4, 6e4);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function LN(t, e) {
  return e ? jt(e) : (F(
    t._popupRedirectResolver,
    t,
    "argument-error"
    /* AuthErrorCode.ARGUMENT_ERROR */
  ), t._popupRedirectResolver);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Td extends sE {
  constructor(e) {
    super(
      "custom",
      "custom"
      /* ProviderId.CUSTOM */
    ), this.params = e;
  }
  _getIdTokenResponse(e) {
    return Vr(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, n) {
    return Vr(e, this._buildIdpRequest(n));
  }
  _getReauthenticationResolver(e) {
    return Vr(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const n = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0
    };
    return e && (n.idToken = e), n;
  }
}
function xN(t) {
  return gN(t.auth, new Td(t), t.bypassAuthState);
}
function VN(t) {
  const { auth: e, user: n } = t;
  return F(
    n,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), mN(n, new Td(t), t.bypassAuthState);
}
async function UN(t) {
  const { auth: e, user: n } = t;
  return F(
    n,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), pN(n, new Td(t), t.bypassAuthState);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gE {
  constructor(e, n, r, s, i = !1) {
    this.auth = e, this.resolver = r, this.user = s, this.bypassAuthState = i, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(n) ? n : [n];
  }
  execute() {
    return new Promise(async (e, n) => {
      this.pendingPromise = { resolve: e, reject: n };
      try {
        this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
      } catch (r) {
        this.reject(r);
      }
    });
  }
  async onAuthEvent(e) {
    const { urlResponse: n, sessionId: r, postBody: s, tenantId: i, error: o, type: c } = e;
    if (o) {
      this.reject(o);
      return;
    }
    const u = {
      auth: this.auth,
      requestUri: n,
      sessionId: r,
      tenantId: i || void 0,
      postBody: s || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState
    };
    try {
      this.resolve(await this.getIdpTask(c)(u));
    } catch (d) {
      this.reject(d);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return xN;
      case "linkViaPopup":
      case "linkViaRedirect":
        return UN;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return VN;
      default:
        en(
          this.auth,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  resolve(e) {
    tn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
  }
  reject(e) {
    tn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
  }
  unregisterAndCleanUp() {
    this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const FN = new Ni(2e3, 1e4);
class Dr extends gE {
  constructor(e, n, r, s, i) {
    super(e, n, s, i), this.provider = r, this.authWindow = null, this.pollId = null, Dr.currentPopupAction && Dr.currentPopupAction.cancel(), Dr.currentPopupAction = this;
  }
  async executeNotNull() {
    const e = await this.execute();
    return F(
      e,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), e;
  }
  async onExecution() {
    tn(this.filter.length === 1, "Popup operations only handle one event");
    const e = Sd();
    this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      // There's always one, see constructor
      e
    ), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((n) => {
      this.reject(n);
    }), this.resolver._isIframeWebStorageSupported(this.auth, (n) => {
      n || this.reject(kt(
        this.auth,
        "web-storage-unsupported"
        /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */
      ));
    }), this.pollUserCancellation();
  }
  get eventId() {
    var e;
    return ((e = this.authWindow) === null || e === void 0 ? void 0 : e.associatedEvent) || null;
  }
  cancel() {
    this.reject(kt(
      this.auth,
      "cancelled-popup-request"
      /* AuthErrorCode.EXPIRED_POPUP_REQUEST */
    ));
  }
  cleanUp() {
    this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, Dr.currentPopupAction = null;
  }
  pollUserCancellation() {
    const e = () => {
      var n, r;
      if (!((r = (n = this.authWindow) === null || n === void 0 ? void 0 : n.window) === null || r === void 0) && r.closed) {
        this.pollId = window.setTimeout(
          () => {
            this.pollId = null, this.reject(kt(
              this.auth,
              "popup-closed-by-user"
              /* AuthErrorCode.POPUP_CLOSED_BY_USER */
            ));
          },
          8e3
          /* _Timeout.AUTH_EVENT */
        );
        return;
      }
      this.pollId = window.setTimeout(e, FN.get());
    };
    e();
  }
}
Dr.currentPopupAction = null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const BN = "pendingRedirect", Fo = /* @__PURE__ */ new Map();
class $N extends gE {
  constructor(e, n, r = !1) {
    super(e, [
      "signInViaRedirect",
      "linkViaRedirect",
      "reauthViaRedirect",
      "unknown"
      /* AuthEventType.UNKNOWN */
    ], n, void 0, r), this.eventId = null;
  }
  /**
   * Override the execute function; if we already have a redirect result, then
   * just return it.
   */
  async execute() {
    let e = Fo.get(this.auth._key());
    if (!e) {
      try {
        const r = await jN(this.resolver, this.auth) ? await super.execute() : null;
        e = () => Promise.resolve(r);
      } catch (n) {
        e = () => Promise.reject(n);
      }
      Fo.set(this.auth._key(), e);
    }
    return this.bypassAuthState || Fo.set(this.auth._key(), () => Promise.resolve(null)), e();
  }
  async onAuthEvent(e) {
    if (e.type === "signInViaRedirect")
      return super.onAuthEvent(e);
    if (e.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const n = await this.auth._redirectUserForId(e.eventId);
      if (n)
        return this.user = n, super.onAuthEvent(e);
      this.resolve(null);
    }
  }
  async onExecution() {
  }
  cleanUp() {
  }
}
async function jN(t, e) {
  const n = qN(e), r = GN(t);
  if (!await r._isAvailable())
    return !1;
  const s = await r._get(n) === "true";
  return await r._remove(n), s;
}
function HN(t, e) {
  Fo.set(t._key(), e);
}
function GN(t) {
  return jt(t._redirectPersistence);
}
function qN(t) {
  return Uo(BN, t.config.apiKey, t.name);
}
async function zN(t, e, n = !1) {
  if (Pt(t.app))
    return Promise.reject(rr(t));
  const r = Ed(t), s = LN(r, e), o = await new $N(r, s, n).execute();
  return o && !n && (delete o.user._redirectEventId, await r._persistUserIfCurrent(o.user), await r._setRedirectUser(null, e)), o;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const WN = 10 * 60 * 1e3;
class KN {
  constructor(e) {
    this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
  }
  registerConsumer(e) {
    this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e))
      return !1;
    let n = !1;
    return this.consumers.forEach((r) => {
      this.isEventForConsumer(e, r) && (n = !0, this.sendToConsumer(e, r), this.saveEventToCache(e));
    }), this.hasHandledPotentialRedirect || !YN(e) || (this.hasHandledPotentialRedirect = !0, n || (this.queuedRedirectEvent = e, n = !0)), n;
  }
  sendToConsumer(e, n) {
    var r;
    if (e.error && !_E(e)) {
      const s = ((r = e.error.code) === null || r === void 0 ? void 0 : r.split("auth/")[1]) || "internal-error";
      n.onError(kt(this.auth, s));
    } else
      n.onAuthEvent(e);
  }
  isEventForConsumer(e, n) {
    const r = n.eventId === null || !!e.eventId && e.eventId === n.eventId;
    return n.filter.includes(e.type) && r;
  }
  hasEventBeenHandled(e) {
    return Date.now() - this.lastProcessedEventTime >= WN && this.cachedEventUids.clear(), this.cachedEventUids.has(Xp(e));
  }
  saveEventToCache(e) {
    this.cachedEventUids.add(Xp(e)), this.lastProcessedEventTime = Date.now();
  }
}
function Xp(t) {
  return [t.type, t.eventId, t.sessionId, t.tenantId].filter((e) => e).join("-");
}
function _E({ type: t, error: e }) {
  return t === "unknown" && e?.code === "auth/no-auth-event";
}
function YN(t) {
  switch (t.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return !0;
    case "unknown":
      return _E(t);
    default:
      return !1;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function JN(t, e = {}) {
  return hs(t, "GET", "/v1/projects", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const XN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, QN = /^https?/;
async function ZN(t) {
  if (t.config.emulator)
    return;
  const { authorizedDomains: e } = await JN(t);
  for (const n of e)
    try {
      if (eO(n))
        return;
    } catch {
    }
  en(
    t,
    "unauthorized-domain"
    /* AuthErrorCode.INVALID_ORIGIN */
  );
}
function eO(t) {
  const e = Yu(), { protocol: n, hostname: r } = new URL(e);
  if (t.startsWith("chrome-extension://")) {
    const o = new URL(t);
    return o.hostname === "" && r === "" ? n === "chrome-extension:" && t.replace("chrome-extension://", "") === e.replace("chrome-extension://", "") : n === "chrome-extension:" && o.hostname === r;
  }
  if (!QN.test(n))
    return !1;
  if (XN.test(t))
    return r === t;
  const s = t.replace(/\./g, "\\.");
  return new RegExp("^(.+\\." + s + "|" + s + ")$", "i").test(r);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const tO = new Ni(3e4, 6e4);
function Qp() {
  const t = Nt().___jsl;
  if (t?.H) {
    for (const e of Object.keys(t.H))
      if (t.H[e].r = t.H[e].r || [], t.H[e].L = t.H[e].L || [], t.H[e].r = [...t.H[e].L], t.CP)
        for (let n = 0; n < t.CP.length; n++)
          t.CP[n] = null;
  }
}
function nO(t) {
  return new Promise((e, n) => {
    var r, s, i;
    function o() {
      Qp(), gapi.load("gapi.iframes", {
        callback: () => {
          e(gapi.iframes.getContext());
        },
        ontimeout: () => {
          Qp(), n(kt(
            t,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        },
        timeout: tO.get()
      });
    }
    if (!((s = (r = Nt().gapi) === null || r === void 0 ? void 0 : r.iframes) === null || s === void 0) && s.Iframe)
      e(gapi.iframes.getContext());
    else if (!((i = Nt().gapi) === null || i === void 0) && i.load)
      o();
    else {
      const c = cN("iframefcb");
      return Nt()[c] = () => {
        gapi.load ? o() : n(kt(
          t,
          "network-request-failed"
          /* AuthErrorCode.NETWORK_REQUEST_FAILED */
        ));
      }, oN(`${aN()}?onload=${c}`).catch((u) => n(u));
    }
  }).catch((e) => {
    throw Bo = null, e;
  });
}
let Bo = null;
function rO(t) {
  return Bo = Bo || nO(t), Bo;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const sO = new Ni(5e3, 15e3), iO = "__/auth/iframe", oO = "emulator/auth/iframe", aO = {
  style: {
    position: "absolute",
    top: "-100px",
    width: "1px",
    height: "1px"
  },
  "aria-hidden": "true",
  tabindex: "-1"
}, cO = /* @__PURE__ */ new Map([
  ["identitytoolkit.googleapis.com", "p"],
  // production
  ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
  // staging
  ["test-identitytoolkit.sandbox.googleapis.com", "t"]
  // test
]);
function uO(t) {
  const e = t.config;
  F(
    e.authDomain,
    t,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  const n = e.emulator ? md(e, oO) : `https://${t.config.authDomain}/${iO}`, r = {
    apiKey: e.apiKey,
    appName: t.name,
    v: us
  }, s = cO.get(t.config.apiHost);
  s && (r.eid = s);
  const i = t._getFrameworks();
  return i.length && (r.fw = i.join(",")), `${n}?${bi(r).slice(1)}`;
}
async function lO(t) {
  const e = await rO(t), n = Nt().gapi;
  return F(
    n,
    t,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), e.open({
    where: document.body,
    url: uO(t),
    messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    attributes: aO,
    dontclear: !0
  }, (r) => new Promise(async (s, i) => {
    await r.restyle({
      // Prevent iframe from closing on mouse out.
      setHideOnLeave: !1
    });
    const o = kt(
      t,
      "network-request-failed"
      /* AuthErrorCode.NETWORK_REQUEST_FAILED */
    ), c = Nt().setTimeout(() => {
      i(o);
    }, sO.get());
    function u() {
      Nt().clearTimeout(c), s(r);
    }
    r.ping(u).then(u, () => {
      i(o);
    });
  }));
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const dO = {
  location: "yes",
  resizable: "yes",
  statusbar: "yes",
  toolbar: "no"
}, hO = 500, fO = 600, pO = "_blank", mO = "http://localhost";
class Zp {
  constructor(e) {
    this.window = e, this.associatedEvent = null;
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {
      }
  }
}
function gO(t, e, n, r = hO, s = fO) {
  const i = Math.max((window.screen.availHeight - s) / 2, 0).toString(), o = Math.max((window.screen.availWidth - r) / 2, 0).toString();
  let c = "";
  const u = Object.assign(Object.assign({}, dO), {
    width: r.toString(),
    height: s.toString(),
    top: i,
    left: o
  }), d = qe().toLowerCase();
  n && (c = Yy(d) ? pO : n), Wy(d) && (e = e || mO, u.scrollbars = "yes");
  const f = Object.entries(u).reduce((_, [T, w]) => `${_}${T}=${w},`, "");
  if (Qk(d) && c !== "_self")
    return _O(e || "", c), new Zp(null);
  const p = window.open(e || "", c, f);
  F(
    p,
    t,
    "popup-blocked"
    /* AuthErrorCode.POPUP_BLOCKED */
  );
  try {
    p.focus();
  } catch {
  }
  return new Zp(p);
}
function _O(t, e) {
  const n = document.createElement("a");
  n.href = t, n.target = e;
  const r = document.createEvent("MouseEvent");
  r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(r);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const yO = "__/auth/handler", EO = "emulator/auth/handler", vO = encodeURIComponent("fac");
async function em(t, e, n, r, s, i) {
  F(
    t.config.authDomain,
    t,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  ), F(
    t.config.apiKey,
    t,
    "invalid-api-key"
    /* AuthErrorCode.INVALID_API_KEY */
  );
  const o = {
    apiKey: t.config.apiKey,
    appName: t.name,
    authType: n,
    redirectUrl: r,
    v: us,
    eventId: s
  };
  if (e instanceof iE) {
    e.setDefaultLanguage(t.languageCode), o.providerId = e.providerId || "", P0(e.getCustomParameters()) || (o.customParameters = JSON.stringify(e.getCustomParameters()));
    for (const [f, p] of Object.entries({}))
      o[f] = p;
  }
  if (e instanceof Oi) {
    const f = e.getScopes().filter((p) => p !== "");
    f.length > 0 && (o.scopes = f.join(","));
  }
  t.tenantId && (o.tid = t.tenantId);
  const c = o;
  for (const f of Object.keys(c))
    c[f] === void 0 && delete c[f];
  const u = await t._getAppCheckToken(), d = u ? `#${vO}=${encodeURIComponent(u)}` : "";
  return `${SO(t)}?${bi(c).slice(1)}${d}`;
}
function SO({ config: t }) {
  return t.emulator ? md(t, EO) : `https://${t.authDomain}/${yO}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const nu = "webStorageSupport";
class TO {
  constructor() {
    this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = dE, this._completeRedirectFn = zN, this._overrideRedirectResult = HN;
  }
  // Wrapping in async even though we don't await anywhere in order
  // to make sure errors are raised as promise rejections
  async _openPopup(e, n, r, s) {
    var i;
    tn((i = this.eventManagers[e._key()]) === null || i === void 0 ? void 0 : i.manager, "_initialize() not called before _openPopup()");
    const o = await em(e, n, r, Yu(), s);
    return gO(e, o, Sd());
  }
  async _openRedirect(e, n, r, s) {
    await this._originValidation(e);
    const i = await em(e, n, r, Yu(), s);
    return bN(i), new Promise(() => {
    });
  }
  _initialize(e) {
    const n = e._key();
    if (this.eventManagers[n]) {
      const { manager: s, promise: i } = this.eventManagers[n];
      return s ? Promise.resolve(s) : (tn(i, "If manager is not set, promise should be"), i);
    }
    const r = this.initAndGetManager(e);
    return this.eventManagers[n] = { promise: r }, r.catch(() => {
      delete this.eventManagers[n];
    }), r;
  }
  async initAndGetManager(e) {
    const n = await lO(e), r = new KN(e);
    return n.register("authEvent", (s) => (F(
      s?.authEvent,
      e,
      "invalid-auth-event"
      /* AuthErrorCode.INVALID_AUTH_EVENT */
    ), {
      status: r.onEvent(s.authEvent) ? "ACK" : "ERROR"
      /* GapiOutcome.ERROR */
    }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: r }, this.iframes[e._key()] = n, r;
  }
  _isIframeWebStorageSupported(e, n) {
    this.iframes[e._key()].send(nu, { type: nu }, (s) => {
      var i;
      const o = (i = s?.[0]) === null || i === void 0 ? void 0 : i[nu];
      o !== void 0 && n(!!o), en(
        e,
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
  }
  _originValidation(e) {
    const n = e._key();
    return this.originValidationPromises[n] || (this.originValidationPromises[n] = ZN(e)), this.originValidationPromises[n];
  }
  get _shouldInitProactively() {
    return eE() || Ky() || yd();
  }
}
const IO = TO;
var tm = "@firebase/auth", nm = "1.10.8";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wO {
  constructor(e) {
    this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
  }
  getUid() {
    var e;
    return this.assertAuthConfigured(), ((e = this.auth.currentUser) === null || e === void 0 ? void 0 : e.uid) || null;
  }
  async getToken(e) {
    return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
  }
  addAuthTokenListener(e) {
    if (this.assertAuthConfigured(), this.internalListeners.has(e))
      return;
    const n = this.auth.onIdTokenChanged((r) => {
      e(r?.stsTokenManager.accessToken || null);
    });
    this.internalListeners.set(e, n), this.updateProactiveRefresh();
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const n = this.internalListeners.get(e);
    n && (this.internalListeners.delete(e), n(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    F(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    );
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bO(t) {
  switch (t) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    case "WebExtension":
      return "web-extension";
    default:
      return;
  }
}
function AO(t) {
  qr(new ur(
    "auth",
    (e, { options: n }) => {
      const r = e.getProvider("app").getImmediate(), s = e.getProvider("heartbeat"), i = e.getProvider("app-check-internal"), { apiKey: o, authDomain: c } = r.options;
      F(o && !o.includes(":"), "invalid-api-key", { appName: r.name });
      const u = {
        apiKey: o,
        authDomain: c,
        clientPlatform: t,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: tE(t)
      }, d = new sN(r, s, i, u);
      return lN(d, n), d;
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((e, n, r) => {
    e.getProvider(
      "auth-internal"
      /* _ComponentName.AUTH_INTERNAL */
    ).initialize();
  })), qr(new ur(
    "auth-internal",
    (e) => {
      const n = Ed(e.getProvider(
        "auth"
        /* _ComponentName.AUTH */
      ).getImmediate());
      return ((r) => new wO(r))(n);
    },
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  )), In(tm, nm, bO(t)), In(tm, nm, "esm2017");
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const RO = 5 * 60, CO = v_("authIdTokenMaxAge") || RO;
let rm = null;
const PO = (t) => async (e) => {
  const n = e && await e.getIdTokenResult(), r = n && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(n.issuedAtTime)) / 1e3;
  if (r && r > CO)
    return;
  const s = n?.token;
  rm !== s && (rm = s, await fetch(t, {
    method: s ? "POST" : "DELETE",
    headers: s ? {
      Authorization: `Bearer ${s}`
    } : {}
  }));
};
function DO(t = A_()) {
  const e = jl(t, "auth");
  if (e.isInitialized())
    return e.getImmediate();
  const n = uN(t, {
    popupRedirectResolver: IO,
    persistence: [
      MN,
      uE,
      dE
    ]
  }), r = v_("authTokenSyncURL");
  if (r && typeof isSecureContext == "boolean" && isSecureContext) {
    const i = new URL(r, location.origin);
    if (location.origin === i.origin) {
      const o = PO(i.toString());
      EN(n, o, () => o(n.currentUser)), yN(n, (c) => o(c));
    }
  }
  const s = y_("auth");
  return s && nE(n, `http://${s}`), n;
}
function kO() {
  var t, e;
  return (e = (t = document.getElementsByTagName("head")) === null || t === void 0 ? void 0 : t[0]) !== null && e !== void 0 ? e : document;
}
iN({
  loadJS(t) {
    return new Promise((e, n) => {
      const r = document.createElement("script");
      r.setAttribute("src", t), r.onload = e, r.onerror = (s) => {
        const i = kt(
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
        i.customData = s, n(i);
      }, r.type = "text/javascript", r.charset = "UTF-8", kO().appendChild(r);
    });
  },
  gapiScript: "https://apis.google.com/js/api.js",
  recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
  recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
});
AO(
  "Browser"
  /* ClientPlatform.BROWSER */
);
const sc = import.meta?.env ?? {}, yE = sc?.VITE_FIREBASE_USE_EMULATORS === "true", NO = sc?.VITE_FIREBASE_AUTH_EMULATOR_URL || "http://127.0.0.1:9099", OO = sc?.VITE_FIRESTORE_EMULATOR_HOST || "127.0.0.1", MO = (t, e) => {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}, LO = MO(sc?.VITE_FIRESTORE_EMULATOR_PORT, 8080);
let br = null, Ar = null, yo = null;
function EE() {
  if (!Uy())
    return console.warn("[v0][Firebase] Missing config — skipping initialization"), null;
  if (br)
    return br;
  const t = kC().find((e) => e.name === "focus-extension");
  return t ? (br = t, br) : (br = b_(Vy(), "focus-extension"), br);
}
function xO() {
  const t = EE();
  if (!t) return null;
  if (!Ar && (Ar = DO(t), Ar.useDeviceLanguage(), _N(Ar, uE).catch((e) => {
    console.warn("[v0][Firebase] Failed to set auth persistence:", e);
  }), yE))
    try {
      nE(Ar, NO, { disableWarnings: !0 });
    } catch (e) {
      console.warn("[v0][Firebase] Failed to connect auth emulator:", e);
    }
  return Ar;
}
function VO() {
  const t = EE();
  if (!t) return null;
  if (!yo && (yo = pk(t), yE))
    try {
      Ay(yo, OO, LO);
    } catch (e) {
      console.warn("[v0][Firebase] Failed to connect firestore emulator:", e);
    }
  return yo;
}
let sm = !1, vE = null;
const Qu = /* @__PURE__ */ new Set();
let $o = null;
const UO = new Promise((t) => {
  $o = t;
});
function FO() {
  if (sm) return;
  sm = !0;
  const t = xO();
  if (!t) {
    console.warn("[v0][Firebase] Auth not configured – analytics will remain disabled."), $o?.();
    return;
  }
  vN(t, (e) => {
    vE = e, $o?.(), $o = null, Qu.forEach((n) => {
      try {
        n(e?.uid ?? null, e);
      } catch (r) {
        console.warn("[v0][Firebase] Auth listener error:", r);
      }
    });
  });
}
function BO() {
  return vE?.uid ?? null;
}
function $O(t) {
  return Qu.add(t), () => Qu.delete(t);
}
async function jO() {
  await UO;
}
let Eo = !1, ru = !1;
const HO = 5;
async function GO() {
  if (!Eo) {
    Eo = !0;
    try {
      if (!Uy()) {
        console.warn("[v0][Analytics] Firebase config not provided — sync disabled."), Eo = !1;
        return;
      }
      await SE(), chrome.alarms.create(Ge.ANALYTICS_SYNC, {
        periodInMinutes: 10,
        delayInMinutes: 1
      }), chrome.alarms.onAlarm.addListener((t) => {
        t.name === Ge.ANALYTICS_SYNC && vo();
      }), hR(() => {
        vo();
      }), $O(() => {
        vo();
      }), vo();
    } catch (t) {
      console.warn("[v0][Analytics] Firebase sync initialization failed:", t), Eo = !1;
    }
  }
}
async function vo() {
  if (!ru && Ha()) {
    ru = !0;
    try {
      await jO();
      const t = BO();
      if (!t) return;
      const e = VO();
      if (!e) {
        console.warn("[v0][Analytics] Firestore instance not available.");
        return;
      }
      const n = e;
      await SE(), await zO(t, n), await qO(t, n);
    } catch (t) {
      console.warn("[v0][Analytics] Sync tick failed:", t);
    } finally {
      ru = !1;
    }
  }
}
async function qO(t, e) {
  const n = await vR();
  Id(n) && await TE(t, n, e);
}
async function SE() {
  const t = WO(-1);
  if (!t) return;
  const e = await IE();
  if (e.some((r) => r.date === t) || await KO(t))
    return;
  const n = await SR(t);
  !n || !Id(n) || (e.push({
    date: t,
    summary: n,
    retries: 0
  }), await wE(e));
}
async function zO(t, e) {
  const n = await IE();
  if (n.length === 0) return;
  const r = [];
  for (const s of n)
    if (await TE(t, s.summary, e))
      await YO(s.date);
    else {
      const o = s.retries + 1;
      if (o >= HO) {
        console.warn("[v0][Analytics] Dropping summary after max retries:", s.date);
        continue;
      }
      r.push({
        ...s,
        retries: o,
        lastTriedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  await wE(r);
}
async function TE(t, e, n) {
  if (!Id(e))
    return !0;
  try {
    const r = fk(n, "userUsage", t, "dailySummaries", e.date);
    return await Ck(r, e, { merge: !0 }), console.log("[v0][Analytics] Synced summary for", e.date), !0;
  } catch (r) {
    return console.warn("[v0][Analytics] Failed to sync summary:", e.date, r), !1;
  }
}
function Id(t) {
  return t ? t.totalActiveMinutes > 0 || Object.keys(t.perDomain || {}).length > 0 || Object.keys(t.searchInsights.topQueries || {}).length > 0 || Object.keys(t.contentInsights.topDomainsConsumed || {}).length > 0 : !1;
}
async function IE() {
  const { [ar.PENDING_QUEUE]: t } = await chrome.storage.local.get(
    ar.PENDING_QUEUE
  );
  return Array.isArray(t) ? t : [];
}
async function wE(t) {
  await chrome.storage.local.set({ [ar.PENDING_QUEUE]: t });
}
function WO(t) {
  const e = new Date(n_());
  return Number.isNaN(e.getTime()) ? null : (e.setDate(e.getDate() + t), e.toISOString().slice(0, 10));
}
async function bE() {
  const { [ar.SYNCED_DATES]: t } = await chrome.storage.local.get(
    ar.SYNCED_DATES
  );
  return t && typeof t == "object" ? t : {};
}
async function KO(t) {
  return !!(await bE())[t];
}
async function YO(t) {
  const e = await bE();
  e[t] = (/* @__PURE__ */ new Date()).toISOString(), await chrome.storage.local.set({ [ar.SYNCED_DATES]: e });
}
const JO = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
console.log("[v0] Service Worker starting up...");
console.log("[v0] DEBUG: Extension version:", chrome.runtime.getManifest().version);
console.log("[v0] DEBUG: Manifest permissions:", chrome.runtime.getManifest().permissions);
dR().catch((t) => {
  console.warn("[v0] Analytics consent watcher failed to start:", t);
});
Promise.resolve().then(() => FO()).catch((t) => {
  console.warn("[v0] Firebase auth watcher failed to start:", t);
});
async function AE() {
  console.log("[v0] DEBUG: Starting bootstrap process...");
  try {
    console.log("[v0] DEBUG: Initializing Pomodoro module..."), await ZR(), console.log("[v0] DEBUG: ✅ Pomodoro module initialized successfully");
  } catch (t) {
    console.error("[v0] Failed to initialize Pomodoro:", t);
  }
  try {
    console.log("[v0] DEBUG: Initializing Blocker module..."), await o_(), console.log("[v0] DEBUG: ✅ Blocker module initialized successfully");
  } catch (t) {
    console.error("[v0] Failed to initialize Blocker:", t);
  }
  try {
    console.log("[v0] DEBUG: Initializing Usage Tracker module..."), await VR(), console.log("[v0] DEBUG: ✅ Usage Tracker module initialized successfully");
  } catch (t) {
    console.error("[v0] Failed to initialize Usage Tracker:", t);
  }
  try {
    console.log("[v0] DEBUG: Initializing Daily Sync module..."), await LR(), console.log("[v0] DEBUG: ✅ Daily Sync module initialized successfully");
  } catch (t) {
    console.error("[v0] Failed to initialize Daily Sync:", t);
  }
  try {
    console.log("[v0] DEBUG: Initializing Content Analyzer module..."), await HR(), console.log("[v0] DEBUG: ✅ Content Analyzer module initialized successfully");
  } catch (t) {
    console.error("[v0] Failed to initialize Content Analyzer:", t);
  }
  try {
    console.log("[v0] DEBUG: Initializing Firebase Sync module..."), await GO(), console.log("[v0] DEBUG: ✅ Firebase Sync module initialized successfully");
  } catch (t) {
    console.warn("[v0] Firebase sync skipped/failed:", t);
  }
  console.log("[v0] DEBUG: Bootstrap process completed");
}
async function XO() {
  try {
    const { verifyNotificationPermission: t, createNotification: e } = await Promise.resolve().then(() => Wa);
    await t() ? (console.log("[v0] Notification permission granted"), await e({
      notificationId: "welcome-notification",
      type: "basic",
      title: "Focus Extension Ativada!",
      message: "As notificações estão funcionando. Você receberá alertas sobre Pomodoro e sites distrativos.",
      priority: 1
    }), console.log("[v0] Welcome notification sent")) : console.warn("[v0] Notifications API not available or permission not granted");
  } catch (t) {
    console.error("[v0] Failed to request notification permission:", t);
  }
}
async function im() {
  try {
    console.log("[v0] Attempting to inject content scripts into existing tabs.");
    const t = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
    for (const e of t)
      if (e.id)
        try {
          const n = await chrome.scripting.executeScript({
            target: { tabId: e.id },
            func: () => globalThis.__v0ContentScriptInjected === !0
            // em MV3, func roda na página; caso bloqueado, cairá no catch abaixo
          });
          Array.isArray(n) && n[0]?.result === !0 || (await chrome.scripting.executeScript({
            target: { tabId: e.id },
            files: ["content.js"]
          }), await chrome.scripting.executeScript({
            target: { tabId: e.id },
            func: () => {
              globalThis.__v0ContentScriptInjected = !0;
            }
          }), console.log(`[v0] Injected content script into tab ${e.id}`));
        } catch (n) {
          const r = String(n?.message ?? n);
          r.includes("Cannot access contents") || r.includes("No matching signature") || r.includes("Cannot access a chrome:// URL") || r.includes("The extensions gallery cannot be scripted") || r.includes("The page is not available") || console.warn(`[v0] Failed to inject in tab ${e.id}:`, n);
        }
  } catch (t) {
    console.error("[v0] Error while injecting content scripts:", t);
  }
}
function QO(t) {
  return console.log("[v0] Extension installed/updated:", t.reason), ZO(t);
}
async function ZO(t) {
  console.log("[v0] Extension installed/updated:", t.reason), console.log("[v0] DEBUG: Installation reason:", t.reason);
  try {
    console.log("[v0] DEBUG: Cleaning up old DNR rules..."), await a_(), console.log("[v0] DEBUG: ✅ DNR cleanup completed");
  } catch (e) {
    console.error("[v0] Failed to cleanup DNR rules:", e);
  }
  if (t.reason === "install") {
    console.log("[v0] DEBUG: First installation - creating initial state...");
    const e = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], n = {
      isLoading: !1,
      error: null,
      blacklist: [],
      // Garantir que é array
      timeLimits: [],
      // Garantir que é array
      dailyUsage: {
        [e]: {
          date: e,
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
        config: nn,
        state: {
          phase: "idle",
          isPaused: !1,
          cycleIndex: 0,
          remainingMs: 0
        }
      },
      settings: Ct
    };
    console.log("[v0] DEBUG: Initial state object:", n);
    try {
      console.log("[v0] DEBUG: Writing to chrome.storage.local..."), await chrome.storage.local.set({
        [N.BLACKLIST]: n.blacklist,
        [N.TIME_LIMITS]: n.timeLimits,
        [N.DAILY_USAGE]: n.dailyUsage,
        [N.SITE_CUSTOMIZATIONS]: n.siteCustomizations,
        [N.POMODORO_STATUS]: n.pomodoro
      }), console.log("[v0] DEBUG: ✅ Local storage written successfully"), console.log("[v0] DEBUG: Writing to chrome.storage.sync..."), await chrome.storage.sync.set({
        [N.SETTINGS]: n.settings
      }), console.log("[v0] DEBUG: ✅ Sync storage written successfully"), console.log("[v0] Initial state created");
    } catch (r) {
      console.error("[v0] Failed to create initial state:", r);
    }
    console.log("[v0] DEBUG: Injecting content scripts into existing tabs..."), await im(), console.log("[v0] DEBUG: Requesting notification permissions..."), await XO(), console.log("[v0] DEBUG: ✅ Notification permission request completed");
  }
  t.reason === "update" && (console.log("[v0] DEBUG: Extension update - re-injecting content scripts..."), await im()), console.log("[v0] DEBUG: Starting module initialization..."), await AE(), console.log("[v0] DEBUG: ✅ Extension initialization completed");
}
globalThis.debugDNR = async () => {
  const { debugDNRStatus: t } = await Promise.resolve().then(() => u_);
  await t();
};
globalThis.cleanupDNR = async () => {
  const { cleanupAllDNRRules: t } = await Promise.resolve().then(() => u_);
  await t();
};
globalThis.verifyDNRRules = async () => {
  const t = await chrome.declarativeNetRequest.getDynamicRules(), e = await chrome.declarativeNetRequest.getSessionRules();
  console.log("=== DNR Rules Verification ==="), console.log("Dynamic rules:", t.length), console.log("Session rules:", e.length), console.log(`
Dynamic rules detail:`, t), console.log(`
Session rules detail:`, e);
  const n = "https://www.youtube.com/", r = t.filter((s) => {
    if (s.condition.regexFilter)
      try {
        return new RegExp(s.condition.regexFilter).test(n);
      } catch (i) {
        return console.error("Invalid regex in rule", s.id, i), !1;
      }
    return !1;
  });
  return console.log(`
Rules matching ${n}:`, r), { dynamic: t, session: e, matching: r };
};
const e1 = (() => {
  try {
    const t = JO;
    if (t) {
      const e = t.MODE, n = t.NODE_ENV;
      if (e === "development" || n === "development" || t.VITE_SENTRY_TEST_EXPOSE === "true" || t.SENTRY_TEST_EXPOSE === "true") return !0;
    }
  } catch {
  }
  return !1;
})();
e1 && (globalThis.testSentryBackground = async () => {
  const { testSentryBackground: t } = await Promise.resolve().then(() => am);
  await t();
}, globalThis.testSentryComprehensive = async () => {
  const { testSentryComprehensive: t } = await Promise.resolve().then(() => am);
  await t("background");
});
function t1() {
  return console.log("[v0] Extension started on browser startup"), AE();
}
function n1() {
  chrome.runtime.onInstalled.addListener(QO), chrome.runtime.onStartup.addListener(t1), chrome.storage.onChanged.addListener((t, e) => {
    console.log(`[v0] Storage changed in ${e}:`, t), Ce();
  }), chrome.runtime.onMessage.addListener((t, e, n) => {
    try {
      return console.log("[v0] Message received:", t?.type, t?.payload), console.log("[v0] DEBUG: Message sender:", e), console.log("[v0] DEBUG: Message ID:", t?.id), console.log("[v0] DEBUG: Message timestamp:", t?.ts), Promise.resolve(XR(t, e)).then((r) => {
        console.log("[v0] DEBUG: Message response:", r), n(r);
      }).catch((r) => {
        console.error("[v0] Error handling message:", r), n({ error: r?.message ?? String(r) });
      }), !0;
    } catch (r) {
      return console.error("[v0] onMessage top-level error:", r), n({ error: r.message }), !1;
    }
  }), chrome.notifications.onButtonClicked.addListener(async (t, e) => {
    try {
      if (console.log("[v0] Notification button clicked:", t, e), t.startsWith("suggest-block-") && e === 0) {
        const n = t.replace("suggest-block-", "");
        n && (await Ll(n), console.log(`[v0] Added ${n} to blacklist from notification.`));
      } else t === "pomodoro-focus-complete" && e === 0 && (await p_(), console.log("[v0] Break started from notification"));
    } finally {
      chrome.notifications.clear(t);
    }
  });
}
n1();
console.log("[v0] Service Worker loaded and listeners attached.");
const om = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
let Ps = null, Ds = null, ks = null, Ns = null;
async function RE() {
  let t = null;
  Ps !== null && (clearTimeout(Ps), Ps = null);
  const e = await Promise.resolve().then(() => Yg), { Sentry: n } = e;
  t = n, console.log("[Sentry Test] Testing background error tracking...");
  try {
    n.startSpan(
      { op: "test", name: "Background Test Span" },
      (r) => {
        r.setAttribute("test_attribute", "test_value"), r.setAttribute("context", "background"), console.log("[Sentry Test] Span created"), n.logger.info("Background test log", {
          test: !0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }), console.log("[Sentry Test] Log sent");
      }
    ), Ps = setTimeout(() => {
      try {
        throw new Error("Sentry Test Error - Background Context");
      } catch (r) {
        t ? (t.captureException(r instanceof Error ? r : new Error(String(r))), console.log("[Sentry Test] Error captured")) : console.warn("[Sentry Test] Background Sentry unavailable; skipped error capture");
      }
      Ps = null;
    }, 100);
  } catch (r) {
    t ? (t.captureException(r instanceof Error ? r : new Error(String(r))), console.log("[Sentry Test] Error captured")) : console.error("[Sentry Test] Background test failed before Sentry loaded", r);
  }
  console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Dashboard: https://sentry.io/issues/");
}
async function CE() {
  Ds !== null && (clearTimeout(Ds), Ds = null);
  const { Sentry: t } = await Promise.resolve().then(() => qE);
  console.log("[Sentry Test] Testing popup error tracking..."), t.startSpan(
    { op: "ui.click", name: "Popup Test Button Click" },
    (e) => {
      e.setAttribute("context", "popup"), e.setAttribute("test", !0), t.logger.info("Popup test log", {
        test: !0,
        ui_element: "test_button"
      }), Ds = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Popup Context");
        } catch (n) {
          typeof t.getClient == "function" && !!t.getClient() ? (t.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from popup")) : console.warn("[Sentry Test] Popup Sentry unavailable; skipped error capture");
        }
        Ds = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function PE() {
  ks !== null && (clearTimeout(ks), ks = null);
  const { Sentry: t } = await Promise.resolve().then(() => WE);
  console.log("[Sentry Test] Testing options error tracking..."), t.startSpan(
    { op: "ui.settings", name: "Options Test Action" },
    (e) => {
      e.setAttribute("context", "options"), e.setAttribute("test", !0), t.logger.info("Options test log", {
        test: !0,
        settings_modified: !1
      }), ks = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Options Context");
        } catch (n) {
          typeof t.getClient == "function" && !!t.getClient() ? (t.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from options")) : console.warn("[Sentry Test] Options Sentry unavailable; skipped error capture");
        }
        ks = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds");
}
async function DE() {
  Ns !== null && (clearTimeout(Ns), Ns = null);
  const { Sentry: t } = await Promise.resolve().then(() => KE);
  console.log("[Sentry Test] Testing content script error tracking..."), t.startSpan(
    { op: "test", name: "Content Script Test" },
    (e) => {
      e.setAttribute("context", "content"), e.setAttribute("test", !0), Ns = setTimeout(() => {
        try {
          throw new Error("Sentry Test Error - Content Script Context");
        } catch (n) {
          typeof t.getClient == "function" && !!t.getClient() ? (t.captureException(n instanceof Error ? n : new Error(String(n))), console.log("[Sentry Test] Error captured from content script")) : console.warn("[Sentry Test] Content script Sentry unavailable; skipped error capture");
        }
        Ns = null;
      }, 100);
    }
  ), console.log("[Sentry Test] Check Sentry dashboard in 10-15 seconds"), console.log("[Sentry Test] Note: Content script tracking is minimal for privacy");
}
async function kE(t) {
  let e;
  switch (t) {
    case "background":
      e = (await Promise.resolve().then(() => Yg)).Sentry;
      break;
    case "popup":
      e = (await Promise.resolve().then(() => qE)).Sentry;
      break;
    case "options":
      e = (await Promise.resolve().then(() => WE)).Sentry;
      break;
    case "content":
      e = (await Promise.resolve().then(() => KE)).Sentry;
      break;
    default:
      throw new Error(`[Sentry Test] Unsupported context: ${t}`);
  }
  console.log(`[Sentry Test] Running comprehensive test for ${t}...`), e.startSpan(
    { op: "test.comprehensive", name: "Comprehensive Sentry Test" },
    async (n) => {
      n.setAttribute("context", t), n.setAttribute("test_type", "comprehensive"), e.logger.info("Test info log", { level: "info", context: t }), e.logger.warn("Test warn log", { level: "warn", context: t }), e.logger.error("Test error log", { level: "error", context: t }), await e.startSpan(
        { op: "test.nested", name: "Nested Test Span" },
        async (r) => {
          r.setAttribute("nested", !0), r.setAttribute("parent", "comprehensive_test"), await new Promise((s) => setTimeout(s, 50));
        }
      );
      try {
        throw new Error(`Comprehensive Test Error - ${t}`);
      } catch (r) {
        e.captureException(r);
      }
      console.log(`[Sentry Test] Comprehensive test complete for ${t}`), console.log("[Sentry Test] Expected results:"), console.log("  - 3 log entries (info, warn, error)"), console.log("  - 2 spans (comprehensive + nested)"), console.log("  - 1 error issue"), console.log("  - Check dashboard: https://sentry.io/issues/");
    }
  );
}
if (typeof globalThis < "u") {
  let t = !1;
  try {
    const r = om;
    if (r) {
      const s = r.MODE, i = r.NODE_ENV;
      t = s === "development" || i === "development";
    }
  } catch {
  }
  if (!t)
    try {
      typeof chrome < "u" && chrome?.runtime?.getManifest && chrome.runtime.getManifest()?.version?.includes("dev") && (t = !0);
    } catch {
    }
  let e = !1;
  try {
    const r = om;
    r && (e = r.VITE_SENTRY_TEST_EXPOSE === "true" || // Also check without prefix for legacy support
    r.SENTRY_TEST_EXPOSE === "true");
  } catch {
  }
  (t || e) && (globalThis.testSentryBackground = RE, globalThis.testSentryPopup = CE, globalThis.testSentryOptions = PE, globalThis.testSentryContent = DE, globalThis.testSentryComprehensive = kE, console.log("[Sentry Test] Test functions exposed to globalThis (development mode)"));
}
const am = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  testSentryBackground: RE,
  testSentryComprehensive: kE,
  testSentryContent: DE,
  testSentryOptions: PE,
  testSentryPopup: CE
}, Symbol.toStringTag, { value: "Module" }));
function r1(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var NE = { exports: {} }, ic = {}, OE = { exports: {} }, q = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Li = Symbol.for("react.element"), s1 = Symbol.for("react.portal"), i1 = Symbol.for("react.fragment"), o1 = Symbol.for("react.strict_mode"), a1 = Symbol.for("react.profiler"), c1 = Symbol.for("react.provider"), u1 = Symbol.for("react.context"), l1 = Symbol.for("react.forward_ref"), d1 = Symbol.for("react.suspense"), h1 = Symbol.for("react.memo"), f1 = Symbol.for("react.lazy"), cm = Symbol.iterator;
function p1(t) {
  return t === null || typeof t != "object" ? null : (t = cm && t[cm] || t["@@iterator"], typeof t == "function" ? t : null);
}
var ME = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, LE = Object.assign, xE = {};
function fs(t, e, n) {
  this.props = t, this.context = e, this.refs = xE, this.updater = n || ME;
}
fs.prototype.isReactComponent = {};
fs.prototype.setState = function(t, e) {
  if (typeof t != "object" && typeof t != "function" && t != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, t, e, "setState");
};
fs.prototype.forceUpdate = function(t) {
  this.updater.enqueueForceUpdate(this, t, "forceUpdate");
};
function VE() {
}
VE.prototype = fs.prototype;
function wd(t, e, n) {
  this.props = t, this.context = e, this.refs = xE, this.updater = n || ME;
}
var bd = wd.prototype = new VE();
bd.constructor = wd;
LE(bd, fs.prototype);
bd.isPureReactComponent = !0;
var um = Array.isArray, UE = Object.prototype.hasOwnProperty, Ad = { current: null }, FE = { key: !0, ref: !0, __self: !0, __source: !0 };
function BE(t, e, n) {
  var r, s = {}, i = null, o = null;
  if (e != null) for (r in e.ref !== void 0 && (o = e.ref), e.key !== void 0 && (i = "" + e.key), e) UE.call(e, r) && !FE.hasOwnProperty(r) && (s[r] = e[r]);
  var c = arguments.length - 2;
  if (c === 1) s.children = n;
  else if (1 < c) {
    for (var u = Array(c), d = 0; d < c; d++) u[d] = arguments[d + 2];
    s.children = u;
  }
  if (t && t.defaultProps) for (r in c = t.defaultProps, c) s[r] === void 0 && (s[r] = c[r]);
  return { $$typeof: Li, type: t, key: i, ref: o, props: s, _owner: Ad.current };
}
function m1(t, e) {
  return { $$typeof: Li, type: t.type, key: e, ref: t.ref, props: t.props, _owner: t._owner };
}
function Rd(t) {
  return typeof t == "object" && t !== null && t.$$typeof === Li;
}
function g1(t) {
  var e = { "=": "=0", ":": "=2" };
  return "$" + t.replace(/[=:]/g, function(n) {
    return e[n];
  });
}
var lm = /\/+/g;
function su(t, e) {
  return typeof t == "object" && t !== null && t.key != null ? g1("" + t.key) : e.toString(36);
}
function jo(t, e, n, r, s) {
  var i = typeof t;
  (i === "undefined" || i === "boolean") && (t = null);
  var o = !1;
  if (t === null) o = !0;
  else switch (i) {
    case "string":
    case "number":
      o = !0;
      break;
    case "object":
      switch (t.$$typeof) {
        case Li:
        case s1:
          o = !0;
      }
  }
  if (o) return o = t, s = s(o), t = r === "" ? "." + su(o, 0) : r, um(s) ? (n = "", t != null && (n = t.replace(lm, "$&/") + "/"), jo(s, e, n, "", function(d) {
    return d;
  })) : s != null && (Rd(s) && (s = m1(s, n + (!s.key || o && o.key === s.key ? "" : ("" + s.key).replace(lm, "$&/") + "/") + t)), e.push(s)), 1;
  if (o = 0, r = r === "" ? "." : r + ":", um(t)) for (var c = 0; c < t.length; c++) {
    i = t[c];
    var u = r + su(i, c);
    o += jo(i, e, n, u, s);
  }
  else if (u = p1(t), typeof u == "function") for (t = u.call(t), c = 0; !(i = t.next()).done; ) i = i.value, u = r + su(i, c++), o += jo(i, e, n, u, s);
  else if (i === "object") throw e = String(t), Error("Objects are not valid as a React child (found: " + (e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e) + "). If you meant to render a collection of children, use an array instead.");
  return o;
}
function So(t, e, n) {
  if (t == null) return t;
  var r = [], s = 0;
  return jo(t, r, "", "", function(i) {
    return e.call(n, i, s++);
  }), r;
}
function _1(t) {
  if (t._status === -1) {
    var e = t._result;
    e = e(), e.then(function(n) {
      (t._status === 0 || t._status === -1) && (t._status = 1, t._result = n);
    }, function(n) {
      (t._status === 0 || t._status === -1) && (t._status = 2, t._result = n);
    }), t._status === -1 && (t._status = 0, t._result = e);
  }
  if (t._status === 1) return t._result.default;
  throw t._result;
}
var Xe = { current: null }, Ho = { transition: null }, y1 = { ReactCurrentDispatcher: Xe, ReactCurrentBatchConfig: Ho, ReactCurrentOwner: Ad };
function $E() {
  throw Error("act(...) is not supported in production builds of React.");
}
q.Children = { map: So, forEach: function(t, e, n) {
  So(t, function() {
    e.apply(this, arguments);
  }, n);
}, count: function(t) {
  var e = 0;
  return So(t, function() {
    e++;
  }), e;
}, toArray: function(t) {
  return So(t, function(e) {
    return e;
  }) || [];
}, only: function(t) {
  if (!Rd(t)) throw Error("React.Children.only expected to receive a single React element child.");
  return t;
} };
q.Component = fs;
q.Fragment = i1;
q.Profiler = a1;
q.PureComponent = wd;
q.StrictMode = o1;
q.Suspense = d1;
q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = y1;
q.act = $E;
q.cloneElement = function(t, e, n) {
  if (t == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + t + ".");
  var r = LE({}, t.props), s = t.key, i = t.ref, o = t._owner;
  if (e != null) {
    if (e.ref !== void 0 && (i = e.ref, o = Ad.current), e.key !== void 0 && (s = "" + e.key), t.type && t.type.defaultProps) var c = t.type.defaultProps;
    for (u in e) UE.call(e, u) && !FE.hasOwnProperty(u) && (r[u] = e[u] === void 0 && c !== void 0 ? c[u] : e[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    c = Array(u);
    for (var d = 0; d < u; d++) c[d] = arguments[d + 2];
    r.children = c;
  }
  return { $$typeof: Li, type: t.type, key: s, ref: i, props: r, _owner: o };
};
q.createContext = function(t) {
  return t = { $$typeof: u1, _currentValue: t, _currentValue2: t, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, t.Provider = { $$typeof: c1, _context: t }, t.Consumer = t;
};
q.createElement = BE;
q.createFactory = function(t) {
  var e = BE.bind(null, t);
  return e.type = t, e;
};
q.createRef = function() {
  return { current: null };
};
q.forwardRef = function(t) {
  return { $$typeof: l1, render: t };
};
q.isValidElement = Rd;
q.lazy = function(t) {
  return { $$typeof: f1, _payload: { _status: -1, _result: t }, _init: _1 };
};
q.memo = function(t, e) {
  return { $$typeof: h1, type: t, compare: e === void 0 ? null : e };
};
q.startTransition = function(t) {
  var e = Ho.transition;
  Ho.transition = {};
  try {
    t();
  } finally {
    Ho.transition = e;
  }
};
q.unstable_act = $E;
q.useCallback = function(t, e) {
  return Xe.current.useCallback(t, e);
};
q.useContext = function(t) {
  return Xe.current.useContext(t);
};
q.useDebugValue = function() {
};
q.useDeferredValue = function(t) {
  return Xe.current.useDeferredValue(t);
};
q.useEffect = function(t, e) {
  return Xe.current.useEffect(t, e);
};
q.useId = function() {
  return Xe.current.useId();
};
q.useImperativeHandle = function(t, e, n) {
  return Xe.current.useImperativeHandle(t, e, n);
};
q.useInsertionEffect = function(t, e) {
  return Xe.current.useInsertionEffect(t, e);
};
q.useLayoutEffect = function(t, e) {
  return Xe.current.useLayoutEffect(t, e);
};
q.useMemo = function(t, e) {
  return Xe.current.useMemo(t, e);
};
q.useReducer = function(t, e, n) {
  return Xe.current.useReducer(t, e, n);
};
q.useRef = function(t) {
  return Xe.current.useRef(t);
};
q.useState = function(t) {
  return Xe.current.useState(t);
};
q.useSyncExternalStore = function(t, e, n) {
  return Xe.current.useSyncExternalStore(t, e, n);
};
q.useTransition = function() {
  return Xe.current.useTransition();
};
q.version = "18.3.1";
OE.exports = q;
var jE = OE.exports;
const ba = /* @__PURE__ */ r1(jE);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var E1 = jE, v1 = Symbol.for("react.element"), S1 = Symbol.for("react.fragment"), T1 = Object.prototype.hasOwnProperty, I1 = E1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, w1 = { key: !0, ref: !0, __self: !0, __source: !0 };
function HE(t, e, n) {
  var r, s = {}, i = null, o = null;
  n !== void 0 && (i = "" + n), e.key !== void 0 && (i = "" + e.key), e.ref !== void 0 && (o = e.ref);
  for (r in e) T1.call(e, r) && !w1.hasOwnProperty(r) && (s[r] = e[r]);
  if (t && t.defaultProps) for (r in e = t.defaultProps, e) s[r] === void 0 && (s[r] = e[r]);
  return { $$typeof: v1, type: t, key: i, ref: o, props: s, _owner: I1.current };
}
ic.Fragment = S1;
ic.jsx = HE;
ic.jsxs = HE;
NE.exports = ic;
var En = NE.exports;
let dm = !1, Go = null, qo = null, Os = null;
const Yn = () => Kg(), b1 = (t) => t === !0 || t === "true";
async function A1() {
  return dm && Go && qo ? { client: Go, scope: qo } : Os || (Fa("react") ? (Os = (async () => {
    try {
      const t = nR(), e = Va({}), n = Ba(e);
      if (b1(Ua().VITE_SENTRY_ENABLE_BROWSER_TRACING))
        try {
          const o = zg();
          n.push(o);
        } catch (o) {
          console.warn("[v0][Sentry] Browser tracing integration not available:", o);
        }
      else
        Yn() && console.log(
          "[v0][Sentry] Browser tracing disabled for popup (isolation mode). Set VITE_SENTRY_ENABLE_BROWSER_TRACING=true to enable."
        );
      try {
        const o = ml({ levels: ["warn", "error"] });
        n.push(o);
      } catch (o) {
        console.warn("[v0][Sentry] Console logging integration not available:", o);
      }
      const s = new Na({
        ...t,
        dsn: Al,
        transport: La,
        stackParser: xa,
        integrations: n
      }), i = new fe();
      return i.setClient(s), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([o, c]) => {
        i.setTag(o, c);
      }), s.init(), Go = s, qo = i, dm = !0, Yn() && console.log("[v0][Sentry] Popup monitoring initialized with isolated client"), { client: s, scope: i };
    } catch (t) {
      return console.error("[v0][Sentry] Failed to initialize Sentry in popup:", t), console.warn("[v0][Sentry] Popup will continue without Sentry monitoring"), { client: null, scope: new fe() };
    } finally {
      Os = null;
    }
  })(), Os) : { client: null, scope: new fe() });
}
A1();
let GE = class extends ba.Component {
  constructor(e) {
    super(e), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(e, n) {
    const r = dn(), s = hn();
    r && s && ft(r, s, (i) => {
      i.setContext("react", {
        componentStack: n.componentStack
      }), i.captureException(e);
    });
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ En.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ En.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ En.jsx(
        "button",
        {
          onClick: () => this.setState((e) => ({ hasError: !1, retryKey: e.retryKey + 1 })),
          children: "Try again"
        }
      )
    ] }) : /* @__PURE__ */ En.jsx(ba.Fragment, { children: this.props.children }, this.state.retryKey);
  }
};
const R1 = {
  // ErrorBoundary component
  ErrorBoundary: GE,
  // Capture exception using isolated scope
  captureException: (t, e) => {
    const n = hn(), r = dn();
    if (!n || !r) {
      Yn() && console.warn("[v0][Sentry] captureException called but Sentry is not initialized in popup", { error: t, hint: e });
      return;
    }
    return $a(t, e, r, n);
  },
  // Capture message using isolated scope
  captureMessage: (t, e) => {
    const n = hn(), r = dn();
    if (!n || !r) {
      Yn() && console.warn("[v0][Sentry] captureMessage called but Sentry is not initialized in popup", { message: t, level: e });
      return;
    }
    return ft(
      r,
      n,
      (s) => s.captureMessage(t, e)
    );
  },
  // Logger methods using isolated scope
  logger: {
    info: (t, e) => {
      const n = hn(), r = dn();
      if (!n || !r) {
        Yn() && console.warn("[v0][Sentry] logger.info called but Sentry is not initialized in popup", { message: t, data: e });
        return;
      }
      ht("info", t, e, r, n);
    },
    warn: (t, e) => {
      const n = hn(), r = dn();
      if (!n || !r) {
        Yn() && console.warn("[v0][Sentry] logger.warn called but Sentry is not initialized in popup", { message: t, data: e });
        return;
      }
      ht("warning", t, e, r, n);
    },
    error: (t, e) => {
      const n = hn(), r = dn();
      if (!n || !r) {
        Yn() && console.warn("[v0][Sentry] logger.error called but Sentry is not initialized in popup", { message: t, data: e });
        return;
      }
      ht("error", t, e, r, n);
    }
  },
  // Start span using isolated scope
  startSpan: (t, e) => {
    const n = hn(), r = dn();
    return !n || !r ? e(Rn()) : ft(
      r,
      n,
      () => pi(t, e),
      () => e(Rn())
    );
  },
  // Get client (for advanced usage)
  getClient: () => dn(),
  // Get scope (for advanced usage)
  getScope: () => hn()
};
function dn() {
  return Go;
}
function hn() {
  return qo;
}
const qE = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: GE,
  Sentry: R1
}, Symbol.toStringTag, { value: "Module" }));
let hm = !1, Ls = null, kr = null, iu = null;
const C1 = () => Kg();
function P1() {
  if (hm && Ls && kr)
    return { client: Ls, scope: kr };
  if (iu) {
    const t = kr ?? new fe();
    return { client: Ls, scope: t };
  }
  if (!Fa("react"))
    return { client: null, scope: new fe() };
  iu = Promise.resolve();
  try {
    const t = rR(), e = Va({}), n = Ba(e);
    try {
      const i = zg();
      n.push(i);
    } catch (i) {
      console.warn("[v0][Sentry] Browser tracing integration not available:", i);
    }
    try {
      const i = ml({ levels: ["warn", "error"] });
      n.push(i);
    } catch (i) {
      console.warn("[v0][Sentry] Console logging integration not available:", i);
    }
    const r = new Na({
      ...t,
      dsn: Al,
      transport: La,
      stackParser: xa,
      integrations: n
    }), s = new fe();
    return s.setClient(r), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([i, o]) => {
      s.setTag(i, o);
    }), r.init(), Ls = r, kr = s, hm = !0, C1() && console.log("[v0][Sentry] Options page monitoring initialized with isolated client"), { client: r, scope: s };
  } catch (t) {
    return console.error("[v0][Sentry] Failed to initialize Sentry in options page:", t), console.warn("[v0][Sentry] Options page will continue without Sentry monitoring"), { client: null, scope: new fe() };
  } finally {
    const t = () => {
      iu = null;
    };
    typeof queueMicrotask == "function" ? queueMicrotask(t) : setTimeout(t, 0);
  }
}
P1();
class zE extends ba.Component {
  constructor(e) {
    super(e), this.state = { hasError: !1, retryKey: 0 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(e, n) {
    const r = fn(), s = pn();
    r && s && ft(r, s, (i) => {
      i.setContext("react", {
        componentStack: n.componentStack
      }), i.captureException(e);
    });
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ En.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ En.jsx("h2", { children: "Something went wrong" }),
      /* @__PURE__ */ En.jsx(
        "button",
        {
          onClick: () => this.setState((e) => ({ hasError: !1, retryKey: e.retryKey + 1 })),
          children: "Try again"
        }
      )
    ] }) : /* @__PURE__ */ En.jsx(ba.Fragment, { children: this.props.children }, this.state.retryKey);
  }
}
const D1 = {
  // ErrorBoundary component
  ErrorBoundary: zE,
  // Capture exception using isolated scope
  captureException: (t, e) => {
    const n = pn(), r = fn();
    if (!(!n || !r))
      return $a(t, e, r, n);
  },
  // Capture message using isolated scope
  captureMessage: (t, e) => {
    const n = pn(), r = fn();
    if (!(!n || !r))
      return ft(
        r,
        n,
        (s) => s.captureMessage(t, e)
      );
  },
  // Logger methods using isolated scope
  logger: {
    info: (t, e) => {
      const n = pn(), r = fn();
      !n || !r || ht("info", t, e, r, n);
    },
    warn: (t, e) => {
      const n = pn(), r = fn();
      !n || !r || ht("warning", t, e, r, n);
    },
    error: (t, e) => {
      const n = pn(), r = fn();
      !n || !r || ht("error", t, e, r, n);
    }
  },
  // Start span using isolated scope
  startSpan: (t, e) => {
    const n = pn(), r = fn();
    return !n || !r ? e(Rn()) : ft(
      r,
      n,
      () => pi(t, e),
      () => e(Rn())
    );
  },
  // Get client (for advanced usage)
  getClient: () => fn(),
  // Get scope (for advanced usage)
  getScope: () => pn()
};
function fn() {
  return Ls;
}
function pn() {
  return kr;
}
const WE = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: zE,
  Sentry: D1,
  get scope() {
    return kr;
  }
}, Symbol.toStringTag, { value: "Module" })), ou = "__V0_SENTRY_CONTENT_INITIALIZED", fm = globalThis, Z = fm.__V0_CONTENT_SENTRY_STATE__ ?? (fm.__V0_CONTENT_SENTRY_STATE__ = {
  isInitialized: !1,
  client: null,
  scope: null,
  initPromise: null
});
async function k1(t = 3, e = 50) {
  for (let s = 0; s < t; s++) {
    if (Z.isInitialized && Z.client && Z.scope)
      return { client: Z.client, scope: Z.scope };
    if (Z.initPromise)
      return Z.initPromise;
    s < t - 1 && await new Promise((i) => setTimeout(i, e));
  }
  return An() === "development" && console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries"), { client: null, scope: new fe() };
}
function N1() {
  if (!Fa("browser"))
    return { client: null, scope: new fe() };
  if (globalThis[ou] === !0) {
    if (Z.isInitialized && Z.client && Z.scope)
      return { client: Z.client, scope: Z.scope };
    Z.initPromise || (Z.initPromise = k1().then((n) => (n.client && n.scope && (Z.client = n.client, Z.scope = n.scope, Z.isInitialized = !0), Z.initPromise = null, n)));
    const e = Z.scope ?? new fe();
    return { client: Z.client, scope: e };
  }
  return globalThis[ou] = !0, Z.initPromise = O1().then((e) => (Z.client = e.client, Z.scope = e.scope, Z.isInitialized = !0, Z.initPromise = null, e)).catch((e) => {
    throw globalThis[ou] = !1, Z.isInitialized = !1, Z.client = null, Z.scope = null, Z.initPromise = null, e;
  }), Z.initPromise.catch(() => {
  }), { client: null, scope: new fe() };
}
async function O1() {
  try {
    const t = sR(), e = Va({}), n = Ba(e), r = new Na({
      dsn: sa,
      transport: La,
      stackParser: xa,
      integrations: n,
      ...t
    }), s = new fe();
    return s.setClient(r), t.initialScope?.tags && Object.entries(t.initialScope.tags).forEach(([o, c]) => {
      s.setTag(o, c);
    }), r.init(), An() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: r, scope: s };
  } catch (t) {
    throw An() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", t), t instanceof Error ? t : new Error(String(t));
  }
}
N1();
function Gn() {
  return Z.client;
}
function qn() {
  return Z.scope;
}
const M1 = {
  // Capture exception using isolated scope
  captureException: (t, e) => {
    const n = qn(), r = Gn();
    if (!(!n || !r))
      return $a(t, e, r, n);
  },
  // Capture message using isolated scope
  captureMessage: (t, e) => {
    const n = qn(), r = Gn();
    if (!(!n || !r))
      return ft(r, n, (s) => s.captureMessage(t, e));
  },
  // Logger methods using isolated scope
  logger: {
    info: (t, e) => {
      const n = qn(), r = Gn();
      !n || !r || ht("info", t, e, r, n);
    },
    warn: (t, e) => {
      const n = qn(), r = Gn();
      !n || !r || ht("warning", t, e, r, n);
    },
    error: (t, e) => {
      const n = qn(), r = Gn();
      !n || !r || ht("error", t, e, r, n);
    }
  },
  // Start span using isolated scope
  startSpan: (t, e) => {
    const n = qn(), r = Gn();
    return !n || !r ? e(Rn()) : ft(
      r,
      n,
      () => pi(t, e),
      () => e(Rn())
    );
  },
  // Get client (for advanced usage)
  getClient: () => Gn(),
  // Get scope (for advanced usage)
  getScope: () => qn()
}, KE = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Sentry: M1
}, Symbol.toStringTag, { value: "Module" }));
