const zi = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
(function() {
  if (typeof globalThis < "u" && typeof globalThis.process > "u") {
    let t = "production";
    try {
      const n = zi;
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
const y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, A = globalThis, _e = "10.22.0";
function Lt() {
  return Mt(A), A;
}
function Mt(e) {
  const t = e.__SENTRY__ = e.__SENTRY__ || {};
  return t.version = t.version || _e, t[_e] = t[_e] || {};
}
function $e(e, t, n = A) {
  const r = n.__SENTRY__ = n.__SENTRY__ || {}, o = r[_e] = r[_e] || {};
  return o[e] || (o[e] = t());
}
const ji = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
], Wi = "Sentry Logger ", Ot = {};
function kt(e) {
  if (!("console" in A))
    return e();
  const t = A.console, n = {}, r = Object.keys(Ot);
  r.forEach((o) => {
    const i = Ot[o];
    n[o] = t[o], t[o] = i;
  });
  try {
    return e();
  } finally {
    r.forEach((o) => {
      t[o] = n[o];
    });
  }
}
function Yi() {
  Pn().enabled = !0;
}
function qi() {
  Pn().enabled = !1;
}
function Co() {
  return Pn().enabled;
}
function Vi(...e) {
  xn("log", ...e);
}
function Ki(...e) {
  xn("warn", ...e);
}
function Xi(...e) {
  xn("error", ...e);
}
function xn(e, ...t) {
  y && Co() && kt(() => {
    A.console[e](`${Wi}[${e}]:`, ...t);
  });
}
function Pn() {
  return y ? $e("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
}
const _ = {
  /** Enable logging. */
  enable: Yi,
  /** Disable logging. */
  disable: qi,
  /** Check if logging is enabled. */
  isEnabled: Co,
  /** Log a message. */
  log: Vi,
  /** Log a warning. */
  warn: Ki,
  /** Log an error. */
  error: Xi
}, Do = 50, Ee = "?", Sr = /\(error: (.*)\)/, Tr = /captureMessage|captureException/;
function Zi(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map((n) => n[1]);
  return (n, r = 0, o = 0) => {
    const i = [], s = n.split(`
`);
    for (let c = r; c < s.length; c++) {
      let u = s[c];
      u.length > 1024 && (u = u.slice(0, 1024));
      const l = Sr.test(u) ? u.replace(Sr, "$1") : u;
      if (!l.match(/\S*Error: /)) {
        for (const d of t) {
          const p = d(l);
          if (p) {
            i.push(p);
            break;
          }
        }
        if (i.length >= Do + o)
          break;
      }
    }
    return Ji(i.slice(o));
  };
}
function Ji(e) {
  if (!e.length)
    return [];
  const t = Array.from(e);
  return /sentryWrapped/.test(mt(t).function || "") && t.pop(), t.reverse(), Tr.test(mt(t).function || "") && (t.pop(), Tr.test(mt(t).function || "") && t.pop()), t.slice(0, Do).map((n) => ({
    ...n,
    filename: n.filename || mt(t).filename,
    function: n.function || Ee
  }));
}
function mt(e) {
  return e[e.length - 1] || {};
}
const en = "<anonymous>";
function ue(e) {
  try {
    return !e || typeof e != "function" ? en : e.name || en;
  } catch {
    return en;
  }
}
function br(e) {
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
const Tt = {}, Ar = {};
function Te(e, t) {
  Tt[e] = Tt[e] || [], Tt[e].push(t);
}
function be(e, t) {
  if (!Ar[e]) {
    Ar[e] = !0;
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
let tn = null;
function Qi(e) {
  const t = "error";
  Te(t, e), be(t, es);
}
function es() {
  tn = A.onerror, A.onerror = function(e, t, n, r, o) {
    return X("error", {
      column: r,
      error: o,
      line: n,
      msg: e,
      url: t
    }), tn ? tn.apply(this, arguments) : !1;
  }, A.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
let nn = null;
function ts(e) {
  const t = "unhandledrejection";
  Te(t, e), be(t, ns);
}
function ns() {
  nn = A.onunhandledrejection, A.onunhandledrejection = function(e) {
    return X("unhandledrejection", e), nn ? nn.apply(this, arguments) : !0;
  }, A.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
const Lo = Object.prototype.toString;
function Fn(e) {
  switch (Lo.call(e)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return !0;
    default:
      return le(e, Error);
  }
}
function Be(e, t) {
  return Lo.call(e) === `[object ${t}]`;
}
function Mo(e) {
  return Be(e, "ErrorEvent");
}
function Ir(e) {
  return Be(e, "DOMError");
}
function rs(e) {
  return Be(e, "DOMException");
}
function se(e) {
  return Be(e, "String");
}
function Un(e) {
  return typeof e == "object" && e !== null && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function xt(e) {
  return e === null || Un(e) || typeof e != "object" && typeof e != "function";
}
function Qe(e) {
  return Be(e, "Object");
}
function Pt(e) {
  return typeof Event < "u" && le(e, Event);
}
function os(e) {
  return typeof Element < "u" && le(e, Element);
}
function is(e) {
  return Be(e, "RegExp");
}
function nt(e) {
  return !!(e?.then && typeof e.then == "function");
}
function ss(e) {
  return Qe(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function le(e, t) {
  try {
    return e instanceof t;
  } catch {
    return !1;
  }
}
function ko(e) {
  return !!(typeof e == "object" && e !== null && (e.__isVue || e._isVue));
}
function as(e) {
  return typeof Request < "u" && le(e, Request);
}
const $n = A, cs = 80;
function xo(e, t = {}) {
  if (!e)
    return "<unknown>";
  try {
    let n = e;
    const r = 5, o = [];
    let i = 0, s = 0;
    const c = " > ", u = c.length;
    let l;
    const d = Array.isArray(t) ? t : t.keyAttrs, p = !Array.isArray(t) && t.maxStringLength || cs;
    for (; n && i++ < r && (l = us(n, d), !(l === "html" || i > 1 && s + o.length * u + l.length >= p)); )
      o.push(l), s += l.length, n = n.parentNode;
    return o.reverse().join(c);
  } catch {
    return "<unknown>";
  }
}
function us(e, t) {
  const n = e, r = [];
  if (!n?.tagName)
    return "";
  if ($n.HTMLElement && n instanceof HTMLElement && n.dataset) {
    if (n.dataset.sentryComponent)
      return n.dataset.sentryComponent;
    if (n.dataset.sentryElement)
      return n.dataset.sentryElement;
  }
  r.push(n.tagName.toLowerCase());
  const o = t?.length ? t.filter((s) => n.getAttribute(s)).map((s) => [s, n.getAttribute(s)]) : null;
  if (o?.length)
    o.forEach((s) => {
      r.push(`[${s[0]}="${s[1]}"]`);
    });
  else {
    n.id && r.push(`#${n.id}`);
    const s = n.className;
    if (s && se(s)) {
      const c = s.split(/\s+/);
      for (const u of c)
        r.push(`.${u}`);
    }
  }
  const i = ["aria-label", "type", "name", "title", "alt"];
  for (const s of i) {
    const c = n.getAttribute(s);
    c && r.push(`[${s}="${c}"]`);
  }
  return r.join("");
}
function Po() {
  try {
    return $n.document.location.href;
  } catch {
    return "";
  }
}
function ls(e) {
  if (!$n.HTMLElement)
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
function Nt(e, t = 0) {
  return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function Rr(e, t) {
  if (!Array.isArray(e))
    return "";
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    try {
      ko(o) ? n.push("[VueViewModel]") : n.push(String(o));
    } catch {
      n.push("[value cannot be serialized]");
    }
  }
  return n.join(t);
}
function bt(e, t, n = !1) {
  return se(e) ? is(t) ? t.test(e) : se(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function Ft(e, t = [], n = !1) {
  return t.some((r) => bt(e, r, n));
}
function z(e, t, n) {
  if (!(t in e))
    return;
  const r = e[t];
  if (typeof r != "function")
    return;
  const o = n(r);
  typeof o == "function" && Fo(o, r);
  try {
    e[t] = o;
  } catch {
    y && _.log(`Failed to replace method "${t}" in object`, e);
  }
}
function ye(e, t, n) {
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
function Fo(e, t) {
  try {
    const n = t.prototype || {};
    e.prototype = t.prototype = n, ye(e, "__sentry_original__", t);
  } catch {
  }
}
function Bn(e) {
  return e.__sentry_original__;
}
function Uo(e) {
  if (Fn(e))
    return {
      message: e.message,
      name: e.name,
      stack: e.stack,
      ...Or(e)
    };
  if (Pt(e)) {
    const t = {
      type: e.type,
      target: vr(e.target),
      currentTarget: vr(e.currentTarget),
      ...Or(e)
    };
    return typeof CustomEvent < "u" && le(e, CustomEvent) && (t.detail = e.detail), t;
  } else
    return e;
}
function vr(e) {
  try {
    return os(e) ? xo(e) : Object.prototype.toString.call(e);
  } catch {
    return "<unknown>";
  }
}
function Or(e) {
  if (typeof e == "object" && e !== null) {
    const t = {};
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    return t;
  } else
    return {};
}
function fs(e, t = 40) {
  const n = Object.keys(Uo(e));
  n.sort();
  const r = n[0];
  if (!r)
    return "[object has no keys]";
  if (r.length >= t)
    return Nt(r, t);
  for (let o = n.length; o > 0; o--) {
    const i = n.slice(0, o).join(", ");
    if (!(i.length > t))
      return o === n.length ? i : Nt(i, t);
  }
  return "";
}
function ds() {
  const e = A;
  return e.crypto || e.msCrypto;
}
let rn;
function ps() {
  return Math.random() * 16;
}
function W(e = ds()) {
  try {
    if (e?.randomUUID)
      return e.randomUUID().replace(/-/g, "");
  } catch {
  }
  return rn || (rn = "10000000100040008000" + 1e11), rn.replace(
    /[018]/g,
    (t) => (
      // eslint-disable-next-line no-bitwise
      (t ^ (ps() & 15) >> t / 4).toString(16)
    )
  );
}
function $o(e) {
  return e.exception?.values?.[0];
}
function ge(e) {
  const { message: t, event_id: n } = e;
  if (t)
    return t;
  const r = $o(e);
  return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function En(e, t, n) {
  const r = e.exception = e.exception || {}, o = r.values = r.values || [], i = o[0] = o[0] || {};
  i.value || (i.value = t || ""), i.type || (i.type = "Error");
}
function Me(e, t) {
  const n = $o(e);
  if (!n)
    return;
  const r = { type: "generic", handled: !0 }, o = n.mechanism;
  if (n.mechanism = { ...r, ...o, ...t }, t && "data" in t) {
    const i = { ...o?.data, ...t.data };
    n.mechanism.data = i;
  }
}
function Nr(e) {
  if (ms(e))
    return !0;
  try {
    ye(e, "__sentry_captured__", !0);
  } catch {
  }
  return !1;
}
function ms(e) {
  try {
    return e.__sentry_captured__;
  } catch {
  }
}
const Bo = 1e3;
function rt() {
  return Date.now() / Bo;
}
function hs() {
  const { performance: e } = A;
  if (!e?.now || !e.timeOrigin)
    return rt;
  const t = e.timeOrigin;
  return () => (t + e.now()) / Bo;
}
let wr;
function ae() {
  return (wr ?? (wr = hs()))();
}
function gs(e) {
  const t = ae(), n = {
    sid: W(),
    init: !0,
    timestamp: t,
    started: t,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: !1,
    toJSON: () => Es(n)
  };
  return e && ke(n, e), n;
}
function ke(e, t = {}) {
  if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || ae(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : W()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration)
    e.duration = void 0;
  else if (typeof t.duration == "number")
    e.duration = t.duration;
  else {
    const n = e.timestamp - e.started;
    e.duration = n >= 0 ? n : 0;
  }
  t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function _s(e, t) {
  let n = {};
  e.status === "ok" && (n = { status: "exited" }), ke(e, n);
}
function Es(e) {
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
function Cr() {
  return W();
}
function Ho() {
  return W().substring(16);
}
const yn = "_sentrySpan";
function Dr(e, t) {
  t ? ye(e, yn, t) : delete e[yn];
}
function Lr(e) {
  return e[yn];
}
const ys = 100;
class G {
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
      traceId: Cr(),
      sampleRand: Math.random()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const t = new G();
    return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, this._contexts.flags && (t._contexts.flags = {
      values: [...this._contexts.flags.values]
    }), t._user = this._user, t._level = this._level, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t._lastEventId = this._lastEventId, Dr(t, Lr(this)), t;
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
    }, this._session && ke(this._session, { user: t }), this._notifyScopeListeners(), this;
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
    const n = typeof t == "function" ? t(this) : t, r = n instanceof G ? n.getScopeData() : Qe(n) ? t : void 0, { tags: o, extra: i, user: s, contexts: c, level: u, fingerprint: l = [], propagationContext: d } = r || {};
    return this._tags = { ...this._tags, ...o }, this._extra = { ...this._extra, ...i }, this._contexts = { ...this._contexts, ...c }, s && Object.keys(s).length && (this._user = s), u && (this._level = u), l.length && (this._fingerprint = l), d && (this._propagationContext = d), this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._session = void 0, Dr(this, void 0), this._attachments = [], this.setPropagationContext({ traceId: Cr(), sampleRand: Math.random() }), this._notifyScopeListeners(), this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(t, n) {
    const r = typeof n == "number" ? n : ys;
    if (r <= 0)
      return this;
    const o = {
      timestamp: rt(),
      ...t,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: t.message ? Nt(t.message, 2048) : t.message
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
      span: Lr(this)
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
    const r = n?.event_id || W();
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
    const o = r?.event_id || W();
    if (!this._client)
      return y && _.warn("No client configured on scope - will not capture message!"), o;
    const i = new Error(t);
    return this._client.captureMessage(
      t,
      n,
      {
        originalException: t,
        syntheticException: i,
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
    const r = n?.event_id || W();
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
function Ss() {
  return $e("defaultCurrentScope", () => new G());
}
function Ts() {
  return $e("defaultIsolationScope", () => new G());
}
class bs {
  constructor(t, n) {
    let r;
    t ? r = t : r = new G();
    let o;
    n ? o = n : o = new G(), this._stack = [{ scope: r }], this._isolationScope = o;
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
function xe() {
  const e = Lt(), t = Mt(e);
  return t.stack = t.stack || new bs(Ss(), Ts());
}
function As(e) {
  return xe().withScope(e);
}
function Is(e, t) {
  const n = xe();
  return n.withScope(() => (n.getStackTop().scope = e, t(e)));
}
function Mr(e) {
  return xe().withScope(() => e(xe().getIsolationScope()));
}
function Rs() {
  return {
    withIsolationScope: Mr,
    withScope: As,
    withSetScope: Is,
    withSetIsolationScope: (e, t) => Mr(t),
    getCurrentScope: () => xe().getScope(),
    getIsolationScope: () => xe().getIsolationScope()
  };
}
function Hn(e) {
  const t = Mt(e);
  return t.acs ? t.acs : Rs();
}
function He() {
  const e = Lt();
  return Hn(e).getCurrentScope();
}
function it() {
  const e = Lt();
  return Hn(e).getIsolationScope();
}
function vs() {
  return $e("globalScope", () => new G());
}
function Os(...e) {
  const t = Lt(), n = Hn(t);
  if (e.length === 2) {
    const [r, o] = e;
    return r ? n.withSetScope(r, o) : n.withScope(o);
  }
  return n.withScope(e[0]);
}
function B() {
  return He().getClient();
}
function Ns(e) {
  const t = e.getPropagationContext(), { traceId: n, parentSpanId: r, propagationSpanId: o } = t, i = {
    trace_id: n,
    span_id: o || Ho()
  };
  return r && (i.parent_span_id = r), i;
}
const ws = "sentry.source", Cs = "sentry.sample_rate", Ds = "sentry.previous_trace_sample_rate", Ls = "sentry.op", Ms = "sentry.origin", Go = "sentry.profile_id", zo = "sentry.exclusive_time", ks = 0, xs = 1, Ps = "_sentryScope", Fs = "_sentryIsolationScope";
function Us(e) {
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
function jo(e) {
  const t = e;
  return {
    scope: t[Ps],
    isolationScope: Us(t[Fs])
  };
}
const $s = "sentry-", Bs = /^sentry-/;
function Hs(e) {
  const t = Gs(e);
  if (!t)
    return;
  const n = Object.entries(t).reduce((r, [o, i]) => {
    if (o.match(Bs)) {
      const s = o.slice($s.length);
      r[s] = i;
    }
    return r;
  }, {});
  if (Object.keys(n).length > 0)
    return n;
}
function Gs(e) {
  if (!(!e || !se(e) && !Array.isArray(e)))
    return Array.isArray(e) ? e.reduce((t, n) => {
      const r = kr(n);
      return Object.entries(r).forEach(([o, i]) => {
        t[o] = i;
      }), t;
    }, {}) : kr(e);
}
function kr(e) {
  return e.split(",").map((t) => {
    const n = t.indexOf("=");
    if (n === -1)
      return [];
    const r = t.slice(0, n), o = t.slice(n + 1);
    return [r, o].map((i) => {
      try {
        return decodeURIComponent(i.trim());
      } catch {
        return;
      }
    });
  }).reduce((t, [n, r]) => (n && r && (t[n] = r), t), {});
}
const zs = /^o(\d+)\./, js = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function Ws(e) {
  return e === "http" || e === "https";
}
function st(e, t = !1) {
  const { host: n, path: r, pass: o, port: i, projectId: s, protocol: c, publicKey: u } = e;
  return `${c}://${u}${t && o ? `:${o}` : ""}@${n}${i ? `:${i}` : ""}/${r && `${r}/`}${s}`;
}
function Ys(e) {
  const t = js.exec(e);
  if (!t) {
    kt(() => {
      console.error(`Invalid Sentry Dsn: ${e}`);
    });
    return;
  }
  const [n, r, o = "", i = "", s = "", c = ""] = t.slice(1);
  let u = "", l = c;
  const d = l.split("/");
  if (d.length > 1 && (u = d.slice(0, -1).join("/"), l = d.pop()), l) {
    const p = l.match(/^\d+/);
    p && (l = p[0]);
  }
  return Wo({ host: i, pass: o, path: u, projectId: l, port: s, protocol: n, publicKey: r });
}
function Wo(e) {
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
function qs(e) {
  if (!y)
    return !0;
  const { port: t, projectId: n, protocol: r } = e;
  return ["protocol", "publicKey", "host", "projectId"].find((s) => e[s] ? !1 : (_.error(`Invalid Sentry Dsn: ${s} missing`), !0)) ? !1 : n.match(/^\d+$/) ? Ws(r) ? t && isNaN(parseInt(t, 10)) ? (_.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (_.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (_.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Vs(e) {
  return e.match(zs)?.[1];
}
function Ks(e) {
  const t = e.getOptions(), { host: n } = e.getDsn() || {};
  let r;
  return t.orgId ? r = String(t.orgId) : n && (r = Vs(n)), r;
}
function Xs(e) {
  const t = typeof e == "string" ? Ys(e) : Wo(e);
  if (!(!t || !qs(t)))
    return t;
}
function Zs(e) {
  if (typeof e == "boolean")
    return Number(e);
  const t = typeof e == "string" ? parseFloat(e) : e;
  if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1))
    return t;
}
const Yo = 1;
let xr = !1;
function Js(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(), o = r ? t : Gn(e).parent_span_id, i = jo(e).scope, s = r ? i?.getPropagationContext().propagationSpanId || Ho() : t;
  return {
    parent_span_id: o,
    span_id: s,
    trace_id: n
  };
}
function Qs(e) {
  if (e && e.length > 0)
    return e.map(({ context: { spanId: t, traceId: n, traceFlags: r, ...o }, attributes: i }) => ({
      span_id: t,
      trace_id: n,
      sampled: r === Yo,
      attributes: i,
      ...o
    }));
}
function Pr(e) {
  return typeof e == "number" ? Fr(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? Fr(e.getTime()) : ae();
}
function Fr(e) {
  return e > 9999999999 ? e / 1e3 : e;
}
function Gn(e) {
  if (ta(e))
    return e.getSpanJSON();
  const { spanId: t, traceId: n } = e.spanContext();
  if (ea(e)) {
    const { attributes: r, startTime: o, name: i, endTime: s, status: c, links: u } = e, l = "parentSpanId" in e ? e.parentSpanId : "parentSpanContext" in e ? e.parentSpanContext?.spanId : void 0;
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: i,
      parent_span_id: l,
      start_timestamp: Pr(o),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: Pr(s) || void 0,
      status: ra(c),
      op: r[Ls],
      origin: r[Ms],
      links: Qs(u)
    };
  }
  return {
    span_id: t,
    trace_id: n,
    start_timestamp: 0,
    data: {}
  };
}
function ea(e) {
  const t = e;
  return !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status;
}
function ta(e) {
  return typeof e.getSpanJSON == "function";
}
function na(e) {
  const { traceFlags: t } = e.spanContext();
  return t === Yo;
}
function ra(e) {
  if (!(!e || e.code === ks))
    return e.code === xs ? "ok" : e.message || "unknown_error";
}
const oa = "_sentryRootSpan";
function qo(e) {
  return e[oa] || e;
}
function Ur() {
  xr || (kt(() => {
    console.warn(
      "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
    );
  }), xr = !0);
}
function ia(e) {
  if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
    return !1;
  const t = B()?.getOptions();
  return !!t && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (t.tracesSampleRate != null || !!t.tracesSampler);
}
function $r(e) {
  _.log(`Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`);
}
function Br(e, t) {
  if (!t?.length || !e.description)
    return !1;
  for (const n of t) {
    if (aa(n)) {
      if (bt(e.description, n))
        return y && $r(e), !0;
      continue;
    }
    if (!n.name && !n.op)
      continue;
    const r = n.name ? bt(e.description, n.name) : !0, o = n.op ? e.op && bt(e.op, n.op) : !0;
    if (r && o)
      return y && $r(e), !0;
  }
  return !1;
}
function sa(e, t) {
  const n = t.parent_span_id, r = t.span_id;
  if (n)
    for (const o of e)
      o.parent_span_id === r && (o.parent_span_id = n);
}
function aa(e) {
  return typeof e == "string" || e instanceof RegExp;
}
const zn = "production", ca = "_frozenDsc";
function Vo(e, t) {
  const n = t.getOptions(), { publicKey: r } = t.getDsn() || {}, o = {
    environment: n.environment || zn,
    release: n.release,
    public_key: r,
    trace_id: e,
    org_id: Ks(t)
  };
  return t.emit("createDsc", o), o;
}
function ua(e, t) {
  const n = t.getPropagationContext();
  return n.dsc || Vo(n.traceId, e);
}
function la(e) {
  const t = B();
  if (!t)
    return {};
  const n = qo(e), r = Gn(n), o = r.data, i = n.spanContext().traceState, s = i?.get("sentry.sample_rate") ?? o[Cs] ?? o[Ds];
  function c(T) {
    return (typeof s == "number" || typeof s == "string") && (T.sample_rate = `${s}`), T;
  }
  const u = n[ca];
  if (u)
    return c(u);
  const l = i?.get("sentry.dsc"), d = l && Hs(l);
  if (d)
    return c(d);
  const p = Vo(e.spanContext().traceId, t), E = o[ws], m = r.description;
  return E !== "url" && m && (p.transaction = m), ia() && (p.sampled = String(na(n)), p.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
  // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
  i?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
  jo(n).scope?.getPropagationContext().sampleRand.toString()), c(p), t.emit("createDsc", p, n), p;
}
function ie(e, t = 100, n = 1 / 0) {
  try {
    return Sn("", e, t, n);
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` };
  }
}
function Ko(e, t = 3, n = 100 * 1024) {
  const r = ie(e, t);
  return ma(r) > n ? Ko(e, t - 1, n) : r;
}
function Sn(e, t, n = 1 / 0, r = 1 / 0, o = ha()) {
  const [i, s] = o;
  if (t == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof t) || typeof t == "number" && Number.isFinite(t))
    return t;
  const c = fa(e, t);
  if (!c.startsWith("[object "))
    return c;
  if (t.__sentry_skip_normalization__)
    return t;
  const u = typeof t.__sentry_override_normalization_depth__ == "number" ? t.__sentry_override_normalization_depth__ : n;
  if (u === 0)
    return c.replace("object ", "");
  if (i(t))
    return "[Circular ~]";
  const l = t;
  if (l && typeof l.toJSON == "function")
    try {
      const m = l.toJSON();
      return Sn("", m, u - 1, r, o);
    } catch {
    }
  const d = Array.isArray(t) ? [] : {};
  let p = 0;
  const E = Uo(t);
  for (const m in E) {
    if (!Object.prototype.hasOwnProperty.call(E, m))
      continue;
    if (p >= r) {
      d[m] = "[MaxProperties ~]";
      break;
    }
    const T = E[m];
    d[m] = Sn(m, T, u - 1, r, o), p++;
  }
  return s(t), d;
}
function fa(e, t) {
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
    if (ko(t))
      return "[VueViewModel]";
    if (ss(t))
      return "[SyntheticEvent]";
    if (typeof t == "number" && !Number.isFinite(t))
      return `[${t}]`;
    if (typeof t == "function")
      return `[Function: ${ue(t)}]`;
    if (typeof t == "symbol")
      return `[${String(t)}]`;
    if (typeof t == "bigint")
      return `[BigInt: ${String(t)}]`;
    const n = da(t);
    return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
  } catch (n) {
    return `**non-serializable** (${n})`;
  }
}
function da(e) {
  const t = Object.getPrototypeOf(e);
  return t?.constructor ? t.constructor.name : "null prototype";
}
function pa(e) {
  return ~-encodeURI(e).split(/%..|./).length;
}
function ma(e) {
  return pa(JSON.stringify(e));
}
function ha() {
  const e = /* @__PURE__ */ new WeakSet();
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1);
  }
  function n(r) {
    e.delete(r);
  }
  return [t, n];
}
function Ge(e, t = []) {
  return [e, t];
}
function ga(e, t) {
  const [n, r] = e;
  return [n, [...r, t]];
}
function Hr(e, t) {
  const n = e[1];
  for (const r of n) {
    const o = r[0].type;
    if (t(r, o))
      return !0;
  }
  return !1;
}
function Tn(e) {
  const t = Mt(A);
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
}
function _a(e) {
  const [t, n] = e;
  let r = JSON.stringify(t);
  function o(i) {
    typeof r == "string" ? r = typeof i == "string" ? r + i : [Tn(r), i] : r.push(typeof i == "string" ? Tn(i) : i);
  }
  for (const i of n) {
    const [s, c] = i;
    if (o(`
${JSON.stringify(s)}
`), typeof c == "string" || c instanceof Uint8Array)
      o(c);
    else {
      let u;
      try {
        u = JSON.stringify(c);
      } catch {
        u = JSON.stringify(ie(c));
      }
      o(u);
    }
  }
  return typeof r == "string" ? r : Ea(r);
}
function Ea(e) {
  const t = e.reduce((o, i) => o + i.length, 0), n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
function ya(e) {
  const t = typeof e.data == "string" ? Tn(e.data) : e.data;
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
const Sa = {
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
function Gr(e) {
  return Sa[e];
}
function Xo(e) {
  if (!e?.sdk)
    return;
  const { name: t, version: n } = e.sdk;
  return { name: t, version: n };
}
function Ta(e, t, n, r) {
  const o = e.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: e.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...t && { sdk: t },
    ...!!n && r && { dsn: st(r) },
    ...o && {
      trace: o
    }
  };
}
function ba(e, t) {
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
function Aa(e, t, n, r) {
  const o = Xo(n), i = {
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...o && { sdk: o },
    ...!!r && t && { dsn: st(t) }
  }, s = "aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()];
  return Ge(i, [s]);
}
function Ia(e, t, n, r) {
  const o = Xo(n), i = e.type && e.type !== "replay_event" ? e.type : "event";
  ba(e, n?.sdk);
  const s = Ta(e, o, r, t);
  return delete e.sdkProcessingMetadata, Ge(s, [[{ type: i }, e]]);
}
const on = 0, zr = 1, jr = 2;
function Ut(e) {
  return new et((t) => {
    t(e);
  });
}
function jn(e) {
  return new et((t, n) => {
    n(e);
  });
}
class et {
  constructor(t) {
    this._state = on, this._handlers = [], this._runExecutor(t);
  }
  /** @inheritdoc */
  then(t, n) {
    return new et((r, o) => {
      this._handlers.push([
        !1,
        (i) => {
          if (!t)
            r(i);
          else
            try {
              r(t(i));
            } catch (s) {
              o(s);
            }
        },
        (i) => {
          if (!n)
            o(i);
          else
            try {
              r(n(i));
            } catch (s) {
              o(s);
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
    return new et((n, r) => {
      let o, i;
      return this.then(
        (s) => {
          i = !1, o = s, t && t();
        },
        (s) => {
          i = !0, o = s, t && t();
        }
      ).then(() => {
        if (i) {
          r(o);
          return;
        }
        n(o);
      });
    });
  }
  /** Excute the resolve/reject handlers. */
  _executeHandlers() {
    if (this._state === on)
      return;
    const t = this._handlers.slice();
    this._handlers = [], t.forEach((n) => {
      n[0] || (this._state === zr && n[1](this._value), this._state === jr && n[2](this._value), n[0] = !0);
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(t) {
    const n = (i, s) => {
      if (this._state === on) {
        if (nt(s)) {
          s.then(r, o);
          return;
        }
        this._state = i, this._value = s, this._executeHandlers();
      }
    }, r = (i) => {
      n(zr, i);
    }, o = (i) => {
      n(jr, i);
    };
    try {
      t(r, o);
    } catch (i) {
      o(i);
    }
  }
}
function Ra(e, t, n, r = 0) {
  try {
    const o = bn(t, n, e, r);
    return nt(o) ? o : Ut(o);
  } catch (o) {
    return jn(o);
  }
}
function bn(e, t, n, r) {
  const o = n[r];
  if (!e || !o)
    return e;
  const i = o({ ...e }, t);
  return y && i === null && _.log(`Event processor "${o.id || "?"}" dropped event`), nt(i) ? i.then((s) => bn(s, t, n, r + 1)) : bn(i, t, n, r + 1);
}
function va(e, t) {
  const { fingerprint: n, span: r, breadcrumbs: o, sdkProcessingMetadata: i } = t;
  Oa(e, t), r && Ca(e, r), Da(e, n), Na(e, o), wa(e, i);
}
function Wr(e, t) {
  const {
    extra: n,
    tags: r,
    user: o,
    contexts: i,
    level: s,
    sdkProcessingMetadata: c,
    breadcrumbs: u,
    fingerprint: l,
    eventProcessors: d,
    attachments: p,
    propagationContext: E,
    transactionName: m,
    span: T
  } = t;
  ht(e, "extra", n), ht(e, "tags", r), ht(e, "user", o), ht(e, "contexts", i), e.sdkProcessingMetadata = ot(e.sdkProcessingMetadata, c, 2), s && (e.level = s), m && (e.transactionName = m), T && (e.span = T), u.length && (e.breadcrumbs = [...e.breadcrumbs, ...u]), l.length && (e.fingerprint = [...e.fingerprint, ...l]), d.length && (e.eventProcessors = [...e.eventProcessors, ...d]), p.length && (e.attachments = [...e.attachments, ...p]), e.propagationContext = { ...e.propagationContext, ...E };
}
function ht(e, t, n) {
  e[t] = ot(e[t], n, 1);
}
function Oa(e, t) {
  const { extra: n, tags: r, user: o, contexts: i, level: s, transactionName: c } = t;
  Object.keys(n).length && (e.extra = { ...n, ...e.extra }), Object.keys(r).length && (e.tags = { ...r, ...e.tags }), Object.keys(o).length && (e.user = { ...o, ...e.user }), Object.keys(i).length && (e.contexts = { ...i, ...e.contexts }), s && (e.level = s), c && e.type !== "transaction" && (e.transaction = c);
}
function Na(e, t) {
  const n = [...e.breadcrumbs || [], ...t];
  e.breadcrumbs = n.length ? n : void 0;
}
function wa(e, t) {
  e.sdkProcessingMetadata = {
    ...e.sdkProcessingMetadata,
    ...t
  };
}
function Ca(e, t) {
  e.contexts = {
    trace: Js(t),
    ...e.contexts
  }, e.sdkProcessingMetadata = {
    dynamicSamplingContext: la(t),
    ...e.sdkProcessingMetadata
  };
  const n = qo(t), r = Gn(n).description;
  r && !e.transaction && e.type === "transaction" && (e.transaction = r);
}
function Da(e, t) {
  e.fingerprint = e.fingerprint ? Array.isArray(e.fingerprint) ? e.fingerprint : [e.fingerprint] : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint.length || delete e.fingerprint;
}
let he, Yr, qr, ce;
function La(e) {
  const t = A._sentryDebugIds, n = A._debugIds;
  if (!t && !n)
    return {};
  const r = t ? Object.keys(t) : [], o = n ? Object.keys(n) : [];
  if (ce && r.length === Yr && o.length === qr)
    return ce;
  Yr = r.length, qr = o.length, ce = {}, he || (he = {});
  const i = (s, c) => {
    for (const u of s) {
      const l = c[u], d = he?.[u];
      if (d && ce && l)
        ce[d[0]] = l, he && (he[u] = [d[0], l]);
      else if (l) {
        const p = e(u);
        for (let E = p.length - 1; E >= 0; E--) {
          const T = p[E]?.filename;
          if (T && ce && he) {
            ce[T] = l, he[u] = [T, l];
            break;
          }
        }
      }
    }
  };
  return t && i(r, t), n && i(o, n), ce;
}
function Ma(e, t, n, r, o, i) {
  const { normalizeDepth: s = 3, normalizeMaxBreadth: c = 1e3 } = e, u = {
    ...t,
    event_id: t.event_id || n.event_id || W(),
    timestamp: t.timestamp || rt()
  }, l = n.integrations || e.integrations.map((R) => R.name);
  ka(u, e), Fa(u, l), o && o.emit("applyFrameMetadata", t), t.type === void 0 && xa(u, e.stackParser);
  const d = $a(r, n.captureContext);
  n.mechanism && Me(u, n.mechanism);
  const p = o ? o.getEventProcessors() : [], E = vs().getScopeData();
  if (i) {
    const R = i.getScopeData();
    Wr(E, R);
  }
  if (d) {
    const R = d.getScopeData();
    Wr(E, R);
  }
  const m = [...n.attachments || [], ...E.attachments];
  m.length && (n.attachments = m), va(u, E);
  const T = [
    ...p,
    // Run scope event processors _after_ all other processors
    ...E.eventProcessors
  ];
  return Ra(T, u, n).then((R) => (R && Pa(R), typeof s == "number" && s > 0 ? Ua(R, s, c) : R));
}
function ka(e, t) {
  const { environment: n, release: r, dist: o, maxValueLength: i = 250 } = t;
  e.environment = e.environment || n || zn, !e.release && r && (e.release = r), !e.dist && o && (e.dist = o);
  const s = e.request;
  s?.url && (s.url = Nt(s.url, i));
}
function xa(e, t) {
  const n = La(t);
  e.exception?.values?.forEach((r) => {
    r.stacktrace?.frames?.forEach((o) => {
      o.filename && (o.debug_id = n[o.filename]);
    });
  });
}
function Pa(e) {
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
function Fa(e, t) {
  t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Ua(e, t, n) {
  if (!e)
    return null;
  const r = {
    ...e,
    ...e.breadcrumbs && {
      breadcrumbs: e.breadcrumbs.map((o) => ({
        ...o,
        ...o.data && {
          data: ie(o.data, t, n)
        }
      }))
    },
    ...e.user && {
      user: ie(e.user, t, n)
    },
    ...e.contexts && {
      contexts: ie(e.contexts, t, n)
    },
    ...e.extra && {
      extra: ie(e.extra, t, n)
    }
  };
  return e.contexts?.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = ie(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((o) => ({
    ...o,
    ...o.data && {
      data: ie(o.data, t, n)
    }
  }))), e.contexts?.flags && r.contexts && (r.contexts.flags = ie(e.contexts.flags, 3, n)), r;
}
function $a(e, t) {
  if (!t)
    return e;
  const n = e ? e.clone() : new G();
  return n.update(t), n;
}
function Ba(e, t) {
  return He().captureException(e, void 0);
}
function Zo(e, t) {
  return He().captureEvent(e, t);
}
function Vr(e) {
  const t = it(), n = He(), { userAgent: r } = A.navigator || {}, o = gs({
    user: n.getUser() || t.getUser(),
    ...r && { userAgent: r },
    ...e
  }), i = t.getSession();
  return i?.status === "ok" && ke(i, { status: "exited" }), Jo(), t.setSession(o), o;
}
function Jo() {
  const e = it(), n = He().getSession() || e.getSession();
  n && _s(n), Qo(), e.setSession();
}
function Qo() {
  const e = it(), t = B(), n = e.getSession();
  n && t && t.captureSession(n);
}
function Kr(e = !1) {
  if (e) {
    Jo();
    return;
  }
  Qo();
}
const Ha = "7";
function Ga(e) {
  const t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function za(e) {
  return `${Ga(e)}${e.projectId}/envelope/`;
}
function ja(e, t) {
  const n = {
    sentry_version: Ha
  };
  return e.publicKey && (n.sentry_key = e.publicKey), t && (n.sentry_client = `${t.name}/${t.version}`), new URLSearchParams(n).toString();
}
function Wa(e, t, n) {
  return t || `${za(e)}?${ja(e, n)}`;
}
const Xr = [];
function Ya(e, t) {
  const n = {};
  return t.forEach((r) => {
    r && ei(e, r, n);
  }), n;
}
function Zr(e, t) {
  for (const n of t)
    n?.afterAllSetup && n.afterAllSetup(e);
}
function ei(e, t, n) {
  if (n[t.name]) {
    y && _.log(`Integration skipped because it was already installed: ${t.name}`);
    return;
  }
  if (n[t.name] = t, Xr.indexOf(t.name) === -1 && typeof t.setupOnce == "function" && (t.setupOnce(), Xr.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), typeof t.preprocessEvent == "function") {
    const r = t.preprocessEvent.bind(t);
    e.on("preprocessEvent", (o, i) => r(o, i, e));
  }
  if (typeof t.processEvent == "function") {
    const r = t.processEvent.bind(t), o = Object.assign((i, s) => r(i, s, e), {
      id: t.name
    });
    e.addEventProcessor(o);
  }
  y && _.log(`Integration installed: ${t.name}`);
}
function qa(e) {
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
function Va(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = st(r)), Ge(o, [qa(e)]);
}
function ti(e, t) {
  const n = t ?? Ka(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Va(n, r._metadata, r.tunnel, e.getDsn());
  ni().set(e, []), e.emit("flushLogs"), e.sendEnvelope(o);
}
function Ka(e) {
  return ni().get(e);
}
function ni() {
  return $e("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Xa(e) {
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
function Za(e, t, n, r) {
  const o = {};
  return t?.sdk && (o.sdk = {
    name: t.sdk.name,
    version: t.sdk.version
  }), n && r && (o.dsn = st(r)), Ge(o, [Xa(e)]);
}
function ri(e, t) {
  const n = t ?? Ja(e) ?? [];
  if (n.length === 0)
    return;
  const r = e.getOptions(), o = Za(n, r._metadata, r.tunnel, e.getDsn());
  oi().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(o);
}
function Ja(e) {
  return oi().get(e);
}
function oi() {
  return $e("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function Qa(e, t, n) {
  const r = [
    { type: "client_report" },
    {
      timestamp: rt(),
      discarded_events: e
    }
  ];
  return Ge(t ? { dsn: t } : {}, [r]);
}
function ii(e) {
  const t = [];
  e.message && t.push(e.message);
  try {
    const n = e.exception.values[e.exception.values.length - 1];
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`));
  } catch {
  }
  return t;
}
function ec(e) {
  const { trace_id: t, parent_span_id: n, span_id: r, status: o, origin: i, data: s, op: c } = e.contexts?.trace ?? {};
  return {
    data: s ?? {},
    description: e.transaction,
    op: c,
    parent_span_id: n,
    span_id: r ?? "",
    start_timestamp: e.start_timestamp ?? 0,
    status: o,
    timestamp: e.timestamp,
    trace_id: t ?? "",
    origin: i,
    profile_id: s?.[Go],
    exclusive_time: s?.[zo],
    measurements: e.measurements,
    is_segment: !0
  };
}
function tc(e) {
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
          ...e.profile_id && { [Go]: e.profile_id },
          ...e.exclusive_time && { [zo]: e.exclusive_time }
        }
      }
    },
    measurements: e.measurements
  };
}
const Jr = "Not capturing exception because it's already been captured.", Qr = "Discarded session because of missing or non-string release", si = Symbol.for("SentryInternalError"), ai = Symbol.for("SentryDoNotSendEventError"), nc = 5e3;
function At(e) {
  return {
    message: e,
    [si]: !0
  };
}
function sn(e) {
  return {
    message: e,
    [ai]: !0
  };
}
function eo(e) {
  return !!e && typeof e == "object" && si in e;
}
function to(e) {
  return !!e && typeof e == "object" && ai in e;
}
function no(e, t, n, r, o) {
  let i = 0, s;
  e.on(n, () => {
    i = 0, clearTimeout(s);
  }), e.on(t, (c) => {
    i += r(c), i >= 8e5 ? o(e) : (clearTimeout(s), s = setTimeout(() => {
      o(e);
    }, nc));
  }), e.on("flush", () => {
    o(e);
  });
}
class rc {
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
    if (this._options = t, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], t.dsn ? this._dsn = Xs(t.dsn) : y && _.warn("No DSN provided, client will not send events."), this._dsn) {
      const n = Wa(
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
    this._options.enableLogs && no(this, "afterCaptureLog", "flushLogs", ac, ti), this._options._experiments?.enableMetrics && no(
      this,
      "afterCaptureMetric",
      "flushMetrics",
      sc,
      ri
    );
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(t, n, r) {
    const o = W();
    if (Nr(t))
      return y && _.log(Jr), o;
    const i = {
      event_id: o,
      ...n
    };
    return this._process(
      this.eventFromException(t, i).then(
        (s) => this._captureEvent(s, i, r)
      )
    ), i.event_id;
  }
  /**
   * Captures a message event and sends it to Sentry.
   *
   * Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureMessage(t, n, r, o) {
    const i = {
      event_id: W(),
      ...r
    }, s = Un(t) ? t : String(t), c = xt(t) ? this.eventFromMessage(s, n, i) : this.eventFromException(t, i);
    return this._process(c.then((u) => this._captureEvent(u, i, o))), i.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(t, n, r) {
    const o = W();
    if (n?.originalException && Nr(n.originalException))
      return y && _.log(Jr), o;
    const i = {
      event_id: o,
      ...n
    }, s = t.sdkProcessingMetadata || {}, c = s.capturedSpanScope, u = s.capturedSpanIsolationScope;
    return this._process(
      this._captureEvent(t, i, c || r, u)
    ), i.event_id;
  }
  /**
   * Captures a session.
   */
  captureSession(t) {
    this.sendSession(t), ke(t, { init: !1 });
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
    ei(this, t, this._integrations), n || Zr(this, [t]);
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(t, n = {}) {
    this.emit("beforeSendEvent", t, n);
    let r = Ia(t, this._dsn, this._options._metadata, this._options.tunnel);
    for (const o of n.attachments || [])
      r = ga(r, ya(o));
    this.sendEnvelope(r).then((o) => this.emit("afterSendEvent", t, o));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(t) {
    const { release: n, environment: r = zn } = this._options;
    if ("aggregates" in t) {
      const i = t.attrs || {};
      if (!i.release && !n) {
        y && _.warn(Qr);
        return;
      }
      i.release = i.release || n, i.environment = i.environment || r, t.attrs = i;
    } else {
      if (!t.release && !n) {
        y && _.warn(Qr);
        return;
      }
      t.release = t.release || n, t.environment = t.environment || r;
    }
    this.emit("beforeSendSession", t);
    const o = Aa(t, this._dsn, this._options._metadata, this._options.tunnel);
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
    const r = this._hooks[t] = this._hooks[t] || /* @__PURE__ */ new Set(), o = (...i) => n(...i);
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
    this._integrations = Ya(this, t), Zr(this, t);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(t, n) {
    let r = n.level === "fatal", o = !1;
    const i = n.exception?.values;
    if (i) {
      o = !0;
      for (const u of i)
        if (u.mechanism?.handled === !1) {
          r = !0;
          break;
        }
    }
    const s = t.status === "ok";
    (s && t.errors === 0 || s && r) && (ke(t, {
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
    const i = this.getOptions(), s = Object.keys(this._integrations);
    return !n.integrations && s?.length && (n.integrations = s), this.emit("preprocessEvent", t, n), t.type || o.setLastEventId(t.event_id || n.event_id), Ma(i, t, n, r, this, o).then((c) => {
      if (c === null)
        return c;
      this.emit("postprocessEvent", c, n), c.contexts = {
        trace: Ns(r),
        ...c.contexts
      };
      const u = ua(this, r);
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
  _captureEvent(t, n = {}, r = He(), o = it()) {
    return y && An(t) && _.log(`Captured error event \`${ii(t)[0] || "<unknown>"}\``), this._processEvent(t, n, r, o).then(
      (i) => i.event_id,
      (i) => {
        y && (to(i) ? _.log(i.message) : eo(i) ? _.warn(i.message) : _.warn(i));
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
    const i = this.getOptions(), { sampleRate: s } = i, c = ci(t), u = An(t), l = t.type || "error", d = `before send for type \`${l}\``, p = typeof s > "u" ? void 0 : Zs(s);
    if (u && typeof p == "number" && Math.random() > p)
      return this.recordDroppedEvent("sample_rate", "error"), jn(
        sn(
          `Discarding event because it's not included in the random sample (sampling rate = ${s})`
        )
      );
    const E = l === "replay_event" ? "replay" : l;
    return this._prepareEvent(t, n, r, o).then((m) => {
      if (m === null)
        throw this.recordDroppedEvent("event_processor", E), sn("An event processor returned `null`, will not send event.");
      if (n.data && n.data.__sentry__ === !0)
        return m;
      const q = ic(this, i, m, n);
      return oc(q, d);
    }).then((m) => {
      if (m === null) {
        if (this.recordDroppedEvent("before_send", E), c) {
          const V = 1 + (t.spans || []).length;
          this.recordDroppedEvent("before_send", "span", V);
        }
        throw sn(`${d} returned \`null\`, will not send event.`);
      }
      const T = r.getSession() || o.getSession();
      if (u && T && this._updateSessionFromEvent(T, m), c) {
        const R = m.sdkProcessingMetadata?.spanCountBeforeProcessing || 0, V = m.spans ? m.spans.length : 0, j = R - V;
        j > 0 && this.recordDroppedEvent("before_send", "span", j);
      }
      const q = m.transaction_info;
      if (c && q && m.transaction !== t.transaction) {
        const R = "custom";
        m.transaction_info = {
          ...q,
          source: R
        };
      }
      return this.sendEvent(m, n), m;
    }).then(null, (m) => {
      throw to(m) || eo(m) ? m : (this.captureException(m, {
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
      const [o, i] = n.split(":");
      return {
        reason: o,
        category: i,
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
    const n = Qa(t, this._options.tunnel && st(this._dsn));
    this.sendEnvelope(n);
  }
  /**
   * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
   */
}
function oc(e, t) {
  const n = `${t} must return \`null\` or a valid event.`;
  if (nt(e))
    return e.then(
      (r) => {
        if (!Qe(r) && r !== null)
          throw At(n);
        return r;
      },
      (r) => {
        throw At(`${t} rejected with ${r}`);
      }
    );
  if (!Qe(e) && e !== null)
    throw At(n);
  return e;
}
function ic(e, t, n, r) {
  const { beforeSend: o, beforeSendTransaction: i, beforeSendSpan: s, ignoreSpans: c } = t;
  let u = n;
  if (An(u) && o)
    return o(u, r);
  if (ci(u)) {
    if (s || c) {
      const l = ec(u);
      if (c?.length && Br(l, c))
        return null;
      if (s) {
        const d = s(l);
        d ? u = ot(n, tc(d)) : Ur();
      }
      if (u.spans) {
        const d = [], p = u.spans;
        for (const m of p) {
          if (c?.length && Br(m, c)) {
            sa(p, m);
            continue;
          }
          if (s) {
            const T = s(m);
            T ? d.push(T) : (Ur(), d.push(m));
          } else
            d.push(m);
        }
        const E = u.spans.length - d.length;
        E && e.recordDroppedEvent("before_send", "span", E), u.spans = d;
      }
    }
    if (i) {
      if (u.spans) {
        const l = u.spans.length;
        u.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: l
        };
      }
      return i(u, r);
    }
  }
  return u;
}
function An(e) {
  return e.type === void 0;
}
function ci(e) {
  return e.type === "transaction";
}
function sc(e) {
  let t = 0;
  return e.name && (t += e.name.length * 2), typeof e.value == "string" ? t += e.value.length * 2 : t += 8, t + ui(e.attributes);
}
function ac(e) {
  let t = 0;
  return e.message && (t += e.message.length * 2), t + ui(e.attributes);
}
function ui(e) {
  if (!e)
    return 0;
  let t = 0;
  return Object.values(e).forEach((n) => {
    Array.isArray(n) ? t += n.length * ro(n[0]) : xt(n) ? t += ro(n) : t += 100;
  }), t;
}
function ro(e) {
  return typeof e == "string" ? e.length * 2 : typeof e == "number" ? 8 : typeof e == "boolean" ? 4 : 0;
}
const li = Symbol.for("SentryBufferFullError");
function cc(e = 100) {
  const t = /* @__PURE__ */ new Set();
  function n() {
    return t.size < e;
  }
  function r(s) {
    t.delete(s);
  }
  function o(s) {
    if (!n())
      return jn(li);
    const c = s();
    return t.add(c), c.then(
      () => r(c),
      () => r(c)
    ), c;
  }
  function i(s) {
    if (!t.size)
      return Ut(!0);
    const c = Promise.allSettled(Array.from(t)).then(() => !0);
    if (!s)
      return c;
    const u = [c, new Promise((l) => setTimeout(() => l(!1), s))];
    return Promise.race(u);
  }
  return {
    get $() {
      return Array.from(t);
    },
    add: o,
    drain: i
  };
}
const uc = 60 * 1e3;
function lc(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10);
  if (!isNaN(n))
    return n * 1e3;
  const r = Date.parse(`${e}`);
  return isNaN(r) ? uc : r - t;
}
function fc(e, t) {
  return e[t] || e.all || 0;
}
function dc(e, t, n = Date.now()) {
  return fc(e, t) > n;
}
function pc(e, { statusCode: t, headers: n }, r = Date.now()) {
  const o = {
    ...e
  }, i = n?.["x-sentry-rate-limits"], s = n?.["retry-after"];
  if (i)
    for (const c of i.trim().split(",")) {
      const [u, l, , , d] = c.split(":", 5), p = parseInt(u, 10), E = (isNaN(p) ? 60 : p) * 1e3;
      if (!l)
        o.all = r + E;
      else
        for (const m of l.split(";"))
          m === "metric_bucket" ? (!d || d.split(";").includes("custom")) && (o[m] = r + E) : o[m] = r + E;
    }
  else s ? o.all = r + lc(s, r) : t === 429 && (o.all = r + 60 * 1e3);
  return o;
}
const mc = 64;
function hc(e, t, n = cc(
  e.bufferSize || mc
)) {
  let r = {};
  const o = (s) => n.drain(s);
  function i(s) {
    const c = [];
    if (Hr(s, (p, E) => {
      const m = Gr(E);
      dc(r, m) ? e.recordDroppedEvent("ratelimit_backoff", m) : c.push(p);
    }), c.length === 0)
      return Promise.resolve({});
    const u = Ge(s[0], c), l = (p) => {
      Hr(u, (E, m) => {
        e.recordDroppedEvent(p, Gr(m));
      });
    }, d = () => t({ body: _a(u) }).then(
      (p) => (p.statusCode !== void 0 && (p.statusCode < 200 || p.statusCode >= 300) && y && _.warn(`Sentry responded with status code ${p.statusCode} to sent event.`), r = pc(r, p), p),
      (p) => {
        throw l("network_error"), y && _.error("Encountered error running transport request:", p), p;
      }
    );
    return n.add(d).then(
      (p) => p,
      (p) => {
        if (p === li)
          return y && _.error("Skipped sending event because buffer is full."), l("queue_overflow"), Promise.resolve({});
        throw p;
      }
    );
  }
  return {
    send: i,
    flush: o
  };
}
function an(e) {
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
function gc(e) {
  "aggregates" in e ? e.attrs?.ip_address === void 0 && (e.attrs = {
    ...e.attrs,
    ip_address: "{{auto}}"
  }) : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
}
function _c(e, t, n = [t], r = "npm") {
  const o = e._metadata || {};
  o.sdk || (o.sdk = {
    name: `sentry.javascript.${t}`,
    packages: n.map((i) => ({
      name: `${r}:@sentry/${i}`,
      version: _e
    })),
    version: _e
  }), e._metadata = o;
}
const Ec = 100;
function Se(e, t) {
  const n = B(), r = it();
  if (!n) return;
  const { beforeBreadcrumb: o = null, maxBreadcrumbs: i = Ec } = n.getOptions();
  if (i <= 0) return;
  const c = { timestamp: rt(), ...e }, u = o ? kt(() => o(c, t)) : c;
  u !== null && (n.emit && n.emit("beforeAddBreadcrumb", u, t), r.addBreadcrumb(u, i));
}
let oo;
const yc = "FunctionToString", io = /* @__PURE__ */ new WeakMap(), Sc = () => ({
  name: yc,
  setupOnce() {
    oo = Function.prototype.toString;
    try {
      Function.prototype.toString = function(...e) {
        const t = Bn(this), n = io.has(B()) && t !== void 0 ? t : this;
        return oo.apply(n, e);
      };
    } catch {
    }
  },
  setup(e) {
    io.set(e, !0);
  }
}), Tc = Sc, bc = [
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
], Ac = "EventFilters", Ic = (e = {}) => {
  let t;
  return {
    name: Ac,
    setup(n) {
      const r = n.getOptions();
      t = so(e, r);
    },
    processEvent(n, r, o) {
      if (!t) {
        const i = o.getOptions();
        t = so(e, i);
      }
      return vc(n, t) ? null : n;
    }
  };
}, Rc = (e = {}) => ({
  ...Ic(e),
  name: "InboundFilters"
});
function so(e = {}, t = {}) {
  return {
    allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
    denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
    ignoreErrors: [
      ...e.ignoreErrors || [],
      ...t.ignoreErrors || [],
      ...e.disableErrorDefaults ? [] : bc
    ],
    ignoreTransactions: [...e.ignoreTransactions || [], ...t.ignoreTransactions || []]
  };
}
function vc(e, t) {
  if (e.type) {
    if (e.type === "transaction" && Nc(e, t.ignoreTransactions))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${ge(e)}`
      ), !0;
  } else {
    if (Oc(e, t.ignoreErrors))
      return y && _.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${ge(e)}`
      ), !0;
    if (Lc(e))
      return y && _.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${ge(
          e
        )}`
      ), !0;
    if (wc(e, t.denyUrls))
      return y && _.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${ge(
          e
        )}.
Url: ${wt(e)}`
      ), !0;
    if (!Cc(e, t.allowUrls))
      return y && _.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${ge(
          e
        )}.
Url: ${wt(e)}`
      ), !0;
  }
  return !1;
}
function Oc(e, t) {
  return t?.length ? ii(e).some((n) => Ft(n, t)) : !1;
}
function Nc(e, t) {
  if (!t?.length)
    return !1;
  const n = e.transaction;
  return n ? Ft(n, t) : !1;
}
function wc(e, t) {
  if (!t?.length)
    return !1;
  const n = wt(e);
  return n ? Ft(n, t) : !1;
}
function Cc(e, t) {
  if (!t?.length)
    return !0;
  const n = wt(e);
  return n ? Ft(n, t) : !0;
}
function Dc(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]")
      return n.filename || null;
  }
  return null;
}
function wt(e) {
  try {
    const n = [...e.exception?.values ?? []].reverse().find((r) => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length)?.stacktrace?.frames;
    return n ? Dc(n) : null;
  } catch {
    return y && _.error(`Cannot extract url for event ${ge(e)}`), null;
  }
}
function Lc(e) {
  return e.exception?.values?.length ? (
    // No top-level message
    !e.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !e.exception.values.some((t) => t.stacktrace || t.type && t.type !== "Error" || t.value)
  ) : !1;
}
function Mc(e, t, n, r, o, i) {
  if (!o.exception?.values || !i || !le(i.originalException, Error))
    return;
  const s = o.exception.values.length > 0 ? o.exception.values[o.exception.values.length - 1] : void 0;
  s && (o.exception.values = In(
    e,
    t,
    r,
    i.originalException,
    n,
    o.exception.values,
    s,
    0
  ));
}
function In(e, t, n, r, o, i, s, c) {
  if (i.length >= n + 1)
    return i;
  let u = [...i];
  if (le(r[o], Error)) {
    ao(s, c);
    const l = e(t, r[o]), d = u.length;
    co(l, o, d, c), u = In(
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
      ao(s, c);
      const p = e(t, l), E = u.length;
      co(p, `errors[${d}]`, E, c), u = In(
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
function ao(e, t) {
  e.mechanism = {
    handled: !0,
    type: "auto.core.linked_errors",
    ...e.mechanism,
    ...e.type === "AggregateError" && { is_exception_group: !0 },
    exception_id: t
  };
}
function co(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: "chained",
    source: t,
    exception_id: n,
    parent_id: r
  };
}
function kc(e) {
  const t = "console";
  Te(t, e), be(t, xc);
}
function xc() {
  "console" in A && ji.forEach(function(e) {
    e in A.console && z(A.console, e, function(t) {
      return Ot[e] = t, function(...n) {
        X("console", { args: n, level: e }), Ot[e]?.apply(A.console, n);
      };
    });
  });
}
function Pc(e) {
  return e === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(e) ? e : "log";
}
const Fc = "Dedupe", Uc = () => {
  let e;
  return {
    name: Fc,
    processEvent(t) {
      if (t.type)
        return t;
      try {
        if (Bc(t, e))
          return y && _.warn("Event dropped due to being a duplicate of previously captured event."), null;
      } catch {
      }
      return e = t;
    }
  };
}, $c = Uc;
function Bc(e, t) {
  return t ? !!(Hc(e, t) || Gc(e, t)) : !1;
}
function Hc(e, t) {
  const n = e.message, r = t.message;
  return !(!n && !r || n && !r || !n && r || n !== r || !di(e, t) || !fi(e, t));
}
function Gc(e, t) {
  const n = uo(t), r = uo(e);
  return !(!n || !r || n.type !== r.type || n.value !== r.value || !di(e, t) || !fi(e, t));
}
function fi(e, t) {
  let n = br(e), r = br(t);
  if (!n && !r)
    return !0;
  if (n && !r || !n && r || (n = n, r = r, r.length !== n.length))
    return !1;
  for (let o = 0; o < r.length; o++) {
    const i = r[o], s = n[o];
    if (i.filename !== s.filename || i.lineno !== s.lineno || i.colno !== s.colno || i.function !== s.function)
      return !1;
  }
  return !0;
}
function di(e, t) {
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
function uo(e) {
  return e.exception?.values?.[0];
}
function pi(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
}
const tt = A;
function zc() {
  return "history" in tt && !!tt.history;
}
function jc() {
  if (!("fetch" in tt))
    return !1;
  try {
    return new Headers(), new Request("http://www.example.com"), new Response(), !0;
  } catch {
    return !1;
  }
}
function Rn(e) {
  return e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function Wc() {
  if (typeof EdgeRuntime == "string")
    return !0;
  if (!jc())
    return !1;
  if (Rn(tt.fetch))
    return !0;
  let e = !1;
  const t = tt.document;
  if (t && typeof t.createElement == "function")
    try {
      const n = t.createElement("iframe");
      n.hidden = !0, t.head.appendChild(n), n.contentWindow?.fetch && (e = Rn(n.contentWindow.fetch)), t.head.removeChild(n);
    } catch (n) {
      y && _.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", n);
    }
  return e;
}
function Yc(e, t) {
  const n = "fetch";
  Te(n, e), be(n, () => qc(void 0, t));
}
function qc(e, t = !1) {
  t && !Wc() || z(A, "fetch", function(n) {
    return function(...r) {
      const o = new Error(), { method: i, url: s } = Vc(r), c = {
        args: r,
        fetchData: {
          method: i,
          url: s
        },
        startTimestamp: ae() * 1e3,
        // // Adding the error to be able to fingerprint the failed fetch event in HttpClient instrumentation
        virtualError: o,
        headers: Kc(r)
      };
      return X("fetch", {
        ...c
      }), n.apply(A, r).then(
        async (u) => (X("fetch", {
          ...c,
          endTimestamp: ae() * 1e3,
          response: u
        }), u),
        (u) => {
          if (X("fetch", {
            ...c,
            endTimestamp: ae() * 1e3,
            error: u
          }), Fn(u) && u.stack === void 0 && (u.stack = o.stack, ye(u, "framesToPop", 1)), u instanceof TypeError && (u.message === "Failed to fetch" || u.message === "Load failed" || u.message === "NetworkError when attempting to fetch resource."))
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
function vn(e, t) {
  return !!e && typeof e == "object" && !!e[t];
}
function lo(e) {
  return typeof e == "string" ? e : e ? vn(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function Vc(e) {
  if (e.length === 0)
    return { method: "GET", url: "" };
  if (e.length === 2) {
    const [n, r] = e;
    return {
      url: lo(n),
      method: vn(r, "method") ? String(r.method).toUpperCase() : "GET"
    };
  }
  const t = e[0];
  return {
    url: lo(t),
    method: vn(t, "method") ? String(t.method).toUpperCase() : "GET"
  };
}
function Kc(e) {
  const [t, n] = e;
  try {
    if (typeof n == "object" && n !== null && "headers" in n && n.headers)
      return new Headers(n.headers);
    if (as(t))
      return new Headers(t.headers);
  } catch {
  }
}
function Xc() {
  return "npm";
}
const M = A;
let On = 0;
function mi() {
  return On > 0;
}
function Zc() {
  On++, setTimeout(() => {
    On--;
  });
}
function Pe(e, t = {}) {
  function n(o) {
    return typeof o == "function";
  }
  if (!n(e))
    return e;
  try {
    const o = e.__sentry_wrapped__;
    if (o)
      return typeof o == "function" ? o : e;
    if (Bn(e))
      return e;
  } catch {
    return e;
  }
  const r = function(...o) {
    try {
      const i = o.map((s) => Pe(s, t));
      return e.apply(this, i);
    } catch (i) {
      throw Zc(), Os((s) => {
        s.addEventProcessor((c) => (t.mechanism && (En(c, void 0), Me(c, t.mechanism)), c.extra = {
          ...c.extra,
          arguments: o
        }, c)), Ba(i);
      }), i;
    }
  };
  try {
    for (const o in e)
      Object.prototype.hasOwnProperty.call(e, o) && (r[o] = e[o]);
  } catch {
  }
  Fo(r, e), ye(e, "__sentry_wrapped__", r);
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
function Jc() {
  const e = Po(), { referrer: t } = M.document || {}, { userAgent: n } = M.navigator || {}, r = {
    ...t && { Referer: t },
    ...n && { "User-Agent": n }
  };
  return {
    url: e,
    headers: r
  };
}
function Wn(e, t) {
  const n = Yn(e, t), r = {
    type: ru(t),
    value: ou(t)
  };
  return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function Qc(e, t, n, r) {
  const i = B()?.getOptions().normalizeDepth, s = uu(t), c = {
    __serialized__: Ko(t, i)
  };
  if (s)
    return {
      exception: {
        values: [Wn(e, s)]
      },
      extra: c
    };
  const u = {
    exception: {
      values: [
        {
          type: Pt(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
          value: au(t, { isUnhandledRejection: r })
        }
      ]
    },
    extra: c
  };
  if (n) {
    const l = Yn(e, n);
    l.length && (u.exception.values[0].stacktrace = { frames: l });
  }
  return u;
}
function cn(e, t) {
  return {
    exception: {
      values: [Wn(e, t)]
    }
  };
}
function Yn(e, t) {
  const n = t.stacktrace || t.stack || "", r = tu(t), o = nu(t);
  try {
    return e(n, r, o);
  } catch {
  }
  return [];
}
const eu = /Minified React error #\d+;/i;
function tu(e) {
  return e && eu.test(e.message) ? 1 : 0;
}
function nu(e) {
  return typeof e.framesToPop == "number" ? e.framesToPop : 0;
}
function hi(e) {
  return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u" ? e instanceof WebAssembly.Exception : !1;
}
function ru(e) {
  const t = e?.name;
  return !t && hi(e) ? e.message && Array.isArray(e.message) && e.message.length == 2 ? e.message[0] : "WebAssembly.Exception" : t;
}
function ou(e) {
  const t = e?.message;
  return hi(e) ? Array.isArray(e.message) && e.message.length == 2 ? e.message[1] : "wasm exception" : t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function iu(e, t, n, r) {
  const o = n?.syntheticException || void 0, i = qn(e, t, o, r);
  return Me(i), i.level = "error", n?.event_id && (i.event_id = n.event_id), Ut(i);
}
function su(e, t, n = "info", r, o) {
  const i = r?.syntheticException || void 0, s = Nn(e, t, i, o);
  return s.level = n, r?.event_id && (s.event_id = r.event_id), Ut(s);
}
function qn(e, t, n, r, o) {
  let i;
  if (Mo(t) && t.error)
    return cn(e, t.error);
  if (Ir(t) || rs(t)) {
    const s = t;
    if ("stack" in t)
      i = cn(e, t);
    else {
      const c = s.name || (Ir(s) ? "DOMError" : "DOMException"), u = s.message ? `${c}: ${s.message}` : c;
      i = Nn(e, u, n, r), En(i, u);
    }
    return "code" in s && (i.tags = { ...i.tags, "DOMException.code": `${s.code}` }), i;
  }
  return Fn(t) ? cn(e, t) : Qe(t) || Pt(t) ? (i = Qc(e, t, n, o), Me(i, {
    synthetic: !0
  }), i) : (i = Nn(e, t, n, r), En(i, `${t}`), Me(i, {
    synthetic: !0
  }), i);
}
function Nn(e, t, n, r) {
  const o = {};
  if (r && n) {
    const i = Yn(e, n);
    i.length && (o.exception = {
      values: [{ value: t, stacktrace: { frames: i } }]
    }), Me(o, { synthetic: !0 });
  }
  if (Un(t)) {
    const { __sentry_template_string__: i, __sentry_template_values__: s } = t;
    return o.logentry = {
      message: i,
      params: s
    }, o;
  }
  return o.message = t, o;
}
function au(e, { isUnhandledRejection: t }) {
  const n = fs(e), r = t ? "promise rejection" : "exception";
  return Mo(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : Pt(e) ? `Event \`${cu(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function cu(e) {
  try {
    const t = Object.getPrototypeOf(e);
    return t ? t.constructor.name : void 0;
  } catch {
  }
}
function uu(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t];
      if (n instanceof Error)
        return n;
    }
}
class lu extends rc {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
  constructor(t) {
    const n = fu(t), r = M.SENTRY_SDK_SOURCE || Xc();
    _c(n, "browser", ["browser"], r), n._metadata?.sdk && (n._metadata.sdk.settings = {
      infer_ip: n.sendDefaultPii ? "auto" : "never",
      // purposefully allowing already passed settings to override the default
      ...n._metadata.sdk.settings
    }), super(n);
    const { sendDefaultPii: o, sendClientReports: i, enableLogs: s, _experiments: c } = this._options;
    M.document && (i || s || c?.enableMetrics) && M.document.addEventListener("visibilitychange", () => {
      M.document.visibilityState === "hidden" && (i && this._flushOutcomes(), s && ti(this), c?.enableMetrics && ri(this));
    }), o && this.on("beforeSendSession", gc);
  }
  /**
   * @inheritDoc
   */
  eventFromException(t, n) {
    return iu(this._options.stackParser, t, n, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(t, n = "info", r) {
    return su(this._options.stackParser, t, n, r, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(t, n, r, o) {
    return t.platform = t.platform || "javascript", super._prepareEvent(t, n, r, o);
  }
}
function fu(e) {
  return {
    release: typeof __SENTRY_RELEASE__ == "string" ? __SENTRY_RELEASE__ : M.SENTRY_RELEASE?.id,
    // This supports the variable that sentry-webpack-plugin injects
    sendClientReports: !0,
    // We default this to true, as it is the safer scenario
    parentSpanIsAlwaysRootSpan: !0,
    ...e
  };
}
const du = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, F = A, pu = 1e3;
let fo, wn, Cn;
function mu(e) {
  const t = "dom";
  Te(t, e), be(t, hu);
}
function hu() {
  if (!F.document)
    return;
  const e = X.bind(null, "dom"), t = po(e, !0);
  F.document.addEventListener("click", t, !1), F.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((n) => {
    const o = F[n]?.prototype;
    o?.hasOwnProperty?.("addEventListener") && (z(o, "addEventListener", function(i) {
      return function(s, c, u) {
        if (s === "click" || s == "keypress")
          try {
            const l = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {}, d = l[s] = l[s] || { refCount: 0 };
            if (!d.handler) {
              const p = po(e);
              d.handler = p, i.call(this, s, p, u);
            }
            d.refCount++;
          } catch {
          }
        return i.call(this, s, c, u);
      };
    }), z(
      o,
      "removeEventListener",
      function(i) {
        return function(s, c, u) {
          if (s === "click" || s == "keypress")
            try {
              const l = this.__sentry_instrumentation_handlers__ || {}, d = l[s];
              d && (d.refCount--, d.refCount <= 0 && (i.call(this, s, d.handler, u), d.handler = void 0, delete l[s]), Object.keys(l).length === 0 && delete this.__sentry_instrumentation_handlers__);
            } catch {
            }
          return i.call(this, s, c, u);
        };
      }
    ));
  });
}
function gu(e) {
  if (e.type !== wn)
    return !1;
  try {
    if (!e.target || e.target._sentryId !== Cn)
      return !1;
  } catch {
  }
  return !0;
}
function _u(e, t) {
  return e !== "keypress" ? !1 : t?.tagName ? !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !0;
}
function po(e, t = !1) {
  return (n) => {
    if (!n || n._sentryCaptured)
      return;
    const r = Eu(n);
    if (_u(n.type, r))
      return;
    ye(n, "_sentryCaptured", !0), r && !r._sentryId && ye(r, "_sentryId", W());
    const o = n.type === "keypress" ? "input" : n.type;
    gu(n) || (e({ event: n, name: o, global: t }), wn = n.type, Cn = r ? r._sentryId : void 0), clearTimeout(fo), fo = F.setTimeout(() => {
      Cn = void 0, wn = void 0;
    }, pu);
  };
}
function Eu(e) {
  try {
    return e.target;
  } catch {
    return null;
  }
}
let gt;
function gi(e) {
  const t = "history";
  Te(t, e), be(t, yu);
}
function yu() {
  if (F.addEventListener("popstate", () => {
    const t = F.location.href, n = gt;
    if (gt = t, n === t)
      return;
    X("history", { from: n, to: t });
  }), !zc())
    return;
  function e(t) {
    return function(...n) {
      const r = n.length > 2 ? n[2] : void 0;
      if (r) {
        const o = gt, i = Su(String(r));
        if (gt = i, o === i)
          return t.apply(this, n);
        X("history", { from: o, to: i });
      }
      return t.apply(this, n);
    };
  }
  z(F.history, "pushState", e), z(F.history, "replaceState", e);
}
function Su(e) {
  try {
    return new URL(e, F.location.origin).toString();
  } catch {
    return e;
  }
}
const It = {};
function Tu(e) {
  const t = It[e];
  if (t)
    return t;
  let n = F[e];
  if (Rn(n))
    return It[e] = n.bind(F);
  const r = F.document;
  if (r && typeof r.createElement == "function")
    try {
      const o = r.createElement("iframe");
      o.hidden = !0, r.head.appendChild(o);
      const i = o.contentWindow;
      i?.[e] && (n = i[e]), r.head.removeChild(o);
    } catch (o) {
      du && _.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `, o);
    }
  return n && (It[e] = n.bind(F));
}
function bu(e) {
  It[e] = void 0;
}
const Je = "__sentry_xhr_v3__";
function Au(e) {
  const t = "xhr";
  Te(t, e), be(t, Iu);
}
function Iu() {
  if (!F.XMLHttpRequest)
    return;
  const e = XMLHttpRequest.prototype;
  e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const o = new Error(), i = ae() * 1e3, s = se(r[0]) ? r[0].toUpperCase() : void 0, c = Ru(r[1]);
      if (!s || !c)
        return t.apply(n, r);
      n[Je] = {
        method: s,
        url: c,
        request_headers: {}
      }, s === "POST" && c.match(/sentry_key/) && (n.__sentry_own_request__ = !0);
      const u = () => {
        const l = n[Je];
        if (l && n.readyState === 4) {
          try {
            l.status_code = n.status;
          } catch {
          }
          const d = {
            endTimestamp: ae() * 1e3,
            startTimestamp: i,
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
          const [E, m] = p, T = d[Je];
          return T && se(E) && se(m) && (T.request_headers[E.toLowerCase()] = m), l.apply(d, p);
        }
      }), t.apply(n, r);
    }
  }), e.send = new Proxy(e.send, {
    apply(t, n, r) {
      const o = n[Je];
      if (!o)
        return t.apply(n, r);
      r[0] !== void 0 && (o.body = r[0]);
      const i = {
        startTimestamp: ae() * 1e3,
        xhr: n
      };
      return X("xhr", i), t.apply(n, r);
    }
  });
}
function Ru(e) {
  if (se(e))
    return e;
  try {
    return e.toString();
  } catch {
  }
}
function vu(e, t = Tu("fetch")) {
  let n = 0, r = 0;
  async function o(i) {
    const s = i.body.length;
    n += s, r++;
    const c = {
      body: i.body,
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
      throw bu("fetch"), u;
    } finally {
      n -= s, r--;
    }
  }
  return hc(e, o);
}
const Ou = 30, Nu = 50;
function Dn(e, t, n, r) {
  const o = {
    filename: e,
    function: t === "<anonymous>" ? Ee : t,
    in_app: !0
    // All browser frames are considered in_app
  };
  return n !== void 0 && (o.lineno = n), r !== void 0 && (o.colno = r), o;
}
const wu = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i, Cu = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, Du = /\((\S*)(?::(\d+))(?::(\d+))\)/, Lu = /at (.+?) ?\(data:(.+?),/, Mu = (e) => {
  const t = e.match(Lu);
  if (t)
    return {
      filename: `<data:${t[2]}>`,
      function: t[1]
    };
  const n = wu.exec(e);
  if (n) {
    const [, o, i, s] = n;
    return Dn(o, Ee, +i, +s);
  }
  const r = Cu.exec(e);
  if (r) {
    if (r[2] && r[2].indexOf("eval") === 0) {
      const c = Du.exec(r[2]);
      c && (r[2] = c[1], r[3] = c[2], r[4] = c[3]);
    }
    const [i, s] = _i(r[1] || Ee, r[2]);
    return Dn(s, i, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0);
  }
}, ku = [Ou, Mu], xu = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, Pu = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, Fu = (e) => {
  const t = xu.exec(e);
  if (t) {
    if (t[3] && t[3].indexOf(" > eval") > -1) {
      const i = Pu.exec(t[3]);
      i && (t[1] = t[1] || "eval", t[3] = i[1], t[4] = i[2], t[5] = "");
    }
    let r = t[3], o = t[1] || Ee;
    return [o, r] = _i(o, r), Dn(r, o, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
  }
}, Uu = [Nu, Fu], $u = [ku, Uu], Bu = Zi(...$u), _i = (e, t) => {
  const n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
  return n || r ? [
    e.indexOf("@") !== -1 ? e.split("@")[0] : Ee,
    n ? `safari-extension:${t}` : `safari-web-extension:${t}`
  ] : [e, t];
}, Vn = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, _t = 1024, Hu = "Breadcrumbs", Gu = (e = {}) => {
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
    name: Hu,
    setup(n) {
      t.console && kc(Yu(n)), t.dom && mu(Wu(n, t.dom)), t.xhr && Au(qu(n)), t.fetch && Yc(Vu(n)), t.history && gi(Ku(n)), t.sentry && n.on("beforeSendEvent", ju(n));
    }
  };
}, zu = Gu;
function ju(e) {
  return function(n) {
    B() === e && Se(
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
function Wu(e, t) {
  return function(r) {
    if (B() !== e)
      return;
    let o, i, s = typeof t == "object" ? t.serializeAttribute : void 0, c = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
    c && c > _t && (Vn && _.warn(
      `\`dom.maxStringLength\` cannot exceed ${_t}, but a value of ${c} was configured. Sentry will use ${_t} instead.`
    ), c = _t), typeof s == "string" && (s = [s]);
    try {
      const l = r.event, d = Xu(l) ? l.target : l;
      o = xo(d, { keyAttrs: s, maxStringLength: c }), i = ls(d);
    } catch {
      o = "<unknown>";
    }
    if (o.length === 0)
      return;
    const u = {
      category: `ui.${r.name}`,
      message: o
    };
    i && (u.data = { "ui.component_name": i }), Se(u, {
      event: r.event,
      name: r.name,
      global: r.global
    });
  };
}
function Yu(e) {
  return function(n) {
    if (B() !== e)
      return;
    const r = {
      category: "console",
      data: {
        arguments: n.args,
        logger: "console"
      },
      level: Pc(n.level),
      message: Rr(n.args, " ")
    };
    if (n.level === "assert")
      if (n.args[0] === !1)
        r.message = `Assertion failed: ${Rr(n.args.slice(1), " ") || "console.assert"}`, r.data.arguments = n.args.slice(1);
      else
        return;
    Se(r, {
      input: n.args,
      level: n.level
    });
  };
}
function qu(e) {
  return function(n) {
    if (B() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n, i = n.xhr[Je];
    if (!r || !o || !i)
      return;
    const { method: s, url: c, status_code: u, body: l } = i, d = {
      method: s,
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
      level: pi(u)
    };
    e.emit("beforeOutgoingRequestBreadcrumb", E, p), Se(E, p);
  };
}
function Vu(e) {
  return function(n) {
    if (B() !== e)
      return;
    const { startTimestamp: r, endTimestamp: o } = n;
    if (o && !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === "POST"))
      if (n.fetchData.method, n.fetchData.url, n.error) {
        const i = n.fetchData, s = {
          data: n.error,
          input: n.args,
          startTimestamp: r,
          endTimestamp: o
        }, c = {
          category: "fetch",
          data: i,
          level: "error",
          type: "http"
        };
        e.emit("beforeOutgoingRequestBreadcrumb", c, s), Se(c, s);
      } else {
        const i = n.response, s = {
          ...n.fetchData,
          status_code: i?.status
        };
        n.fetchData.request_body_size, n.fetchData.response_body_size, i?.status;
        const c = {
          input: n.args,
          response: i,
          startTimestamp: r,
          endTimestamp: o
        }, u = {
          category: "fetch",
          data: s,
          type: "http",
          level: pi(s.status_code)
        };
        e.emit("beforeOutgoingRequestBreadcrumb", u, c), Se(u, c);
      }
  };
}
function Ku(e) {
  return function(n) {
    if (B() !== e)
      return;
    let r = n.from, o = n.to;
    const i = an(M.location.href);
    let s = r ? an(r) : void 0;
    const c = an(o);
    s?.path || (s = i), i.protocol === c.protocol && i.host === c.host && (o = c.relative), i.protocol === s.protocol && i.host === s.host && (r = s.relative), Se({
      category: "navigation",
      data: {
        from: r,
        to: o
      }
    });
  };
}
function Xu(e) {
  return !!e && !!e.target;
}
const Zu = [
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
], Ju = "BrowserApiErrors", Qu = (e = {}) => {
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
    name: Ju,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      t.setTimeout && z(M, "setTimeout", mo), t.setInterval && z(M, "setInterval", mo), t.requestAnimationFrame && z(M, "requestAnimationFrame", tl), t.XMLHttpRequest && "XMLHttpRequest" in M && z(XMLHttpRequest.prototype, "send", nl);
      const n = t.eventTarget;
      n && (Array.isArray(n) ? n : Zu).forEach((o) => rl(o, t));
    }
  };
}, el = Qu;
function mo(e) {
  return function(...t) {
    const n = t[0];
    return t[0] = Pe(n, {
      mechanism: {
        handled: !1,
        type: `auto.browser.browserapierrors.${ue(e)}`
      }
    }), e.apply(this, t);
  };
}
function tl(e) {
  return function(t) {
    return e.apply(this, [
      Pe(t, {
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
function nl(e) {
  return function(...t) {
    const n = this;
    return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach((o) => {
      o in n && typeof n[o] == "function" && z(n, o, function(i) {
        const s = {
          mechanism: {
            data: {
              handler: ue(i)
            },
            handled: !1,
            type: `auto.browser.browserapierrors.xhr.${o}`
          }
        }, c = Bn(i);
        return c && (s.mechanism.data.handler = ue(c)), Pe(i, s);
      });
    }), e.apply(this, t);
  };
}
function rl(e, t) {
  const r = M[e]?.prototype;
  r?.hasOwnProperty?.("addEventListener") && (z(r, "addEventListener", function(o) {
    return function(i, s, c) {
      try {
        ol(s) && (s.handleEvent = Pe(s.handleEvent, {
          mechanism: {
            data: {
              handler: ue(s),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.handleEvent"
          }
        }));
      } catch {
      }
      return t.unregisterOriginalCallbacks && il(this, i, s), o.apply(this, [
        i,
        Pe(s, {
          mechanism: {
            data: {
              handler: ue(s),
              target: e
            },
            handled: !1,
            type: "auto.browser.browserapierrors.addEventListener"
          }
        }),
        c
      ]);
    };
  }), z(r, "removeEventListener", function(o) {
    return function(i, s, c) {
      try {
        const u = s.__sentry_wrapped__;
        u && o.call(this, i, u, c);
      } catch {
      }
      return o.call(this, i, s, c);
    };
  }));
}
function ol(e) {
  return typeof e.handleEvent == "function";
}
function il(e, t, n) {
  e && typeof e == "object" && "removeEventListener" in e && typeof e.removeEventListener == "function" && e.removeEventListener(t, n);
}
const sl = () => ({
  name: "BrowserSession",
  setupOnce() {
    if (typeof M.document > "u") {
      Vn && _.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
      return;
    }
    Vr({ ignoreDuration: !0 }), Kr(), gi(({ from: e, to: t }) => {
      e !== void 0 && e !== t && (Vr({ ignoreDuration: !0 }), Kr());
    });
  }
}), al = "GlobalHandlers", cl = (e = {}) => {
  const t = {
    onerror: !0,
    onunhandledrejection: !0,
    ...e
  };
  return {
    name: al,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(n) {
      t.onerror && (ll(n), ho("onerror")), t.onunhandledrejection && (fl(n), ho("onunhandledrejection"));
    }
  };
}, ul = cl;
function ll(e) {
  Qi((t) => {
    const { stackParser: n, attachStacktrace: r } = Ei();
    if (B() !== e || mi())
      return;
    const { msg: o, url: i, line: s, column: c, error: u } = t, l = ml(
      qn(n, u || o, void 0, r, !1),
      i,
      s,
      c
    );
    l.level = "error", Zo(l, {
      originalException: u,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onerror"
      }
    });
  });
}
function fl(e) {
  ts((t) => {
    const { stackParser: n, attachStacktrace: r } = Ei();
    if (B() !== e || mi())
      return;
    const o = dl(t), i = xt(o) ? pl(o) : qn(n, o, void 0, r, !0);
    i.level = "error", Zo(i, {
      originalException: o,
      mechanism: {
        handled: !1,
        type: "auto.browser.global_handlers.onunhandledrejection"
      }
    });
  });
}
function dl(e) {
  if (xt(e))
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
function pl(e) {
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
function ml(e, t, n, r) {
  const o = e.exception = e.exception || {}, i = o.values = o.values || [], s = i[0] = i[0] || {}, c = s.stacktrace = s.stacktrace || {}, u = c.frames = c.frames || [], l = r, d = n, p = hl(t) ?? Po();
  return u.length === 0 && u.push({
    colno: l,
    filename: p,
    function: Ee,
    in_app: !0,
    lineno: d
  }), e;
}
function ho(e) {
  Vn && _.log(`Global Handler attached: ${e}`);
}
function Ei() {
  return B()?.getOptions() || {
    stackParser: () => [],
    attachStacktrace: !1
  };
}
function hl(e) {
  if (!(!se(e) || e.length === 0)) {
    if (e.startsWith("data:")) {
      const t = e.match(/^data:([^;]+)/), n = t ? t[1] : "text/javascript", r = e.includes("base64,");
      return `<data:${n}${r ? ",base64" : ""}>`;
    }
    return e.slice(0, 1024);
  }
}
const gl = () => ({
  name: "HttpContext",
  preprocessEvent(e) {
    if (!M.navigator && !M.location && !M.document)
      return;
    const t = Jc(), n = {
      ...t.headers,
      ...e.request?.headers
    };
    e.request = {
      ...t,
      ...e.request,
      headers: n
    };
  }
}), _l = "cause", El = 5, yl = "LinkedErrors", Sl = (e = {}) => {
  const t = e.limit || El, n = e.key || _l;
  return {
    name: yl,
    preprocessEvent(r, o, i) {
      const s = i.getOptions();
      Mc(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        Wn,
        s.stackParser,
        n,
        t,
        r,
        o
      );
    }
  };
}, Tl = Sl;
function bl(e) {
  return [
    // TODO(v11): Replace with `eventFiltersIntegration` once we remove the deprecated `inboundFiltersIntegration`
    // eslint-disable-next-line deprecation/deprecation
    Rc(),
    Tc(),
    el(),
    zu(),
    ul(),
    Tl(),
    $c(),
    gl(),
    sl()
  ];
}
let Ye;
const yi = () => {
  if (Ye)
    return Ye;
  try {
    Ye = (import.meta ?? {}).env ?? {};
  } catch {
    Ye = {};
  }
  return Ye;
}, Fe = (e) => typeof e == "string" && e.length > 0 ? e : void 0, Ct = yi(), Al = Fe(Ct.VITE_SENTRY_DSN_REACT) ?? Fe(Ct.SENTRY_DSN_REACT) ?? "", Si = Fe(Ct.VITE_SENTRY_DSN_BROWSER) ?? Fe(Ct.SENTRY_DSN_BROWSER) ?? "", Ue = () => {
  const e = yi(), t = Fe(e.MODE), n = Fe(e.NODE_ENV);
  return t || n || "production";
}, Il = () => {
  try {
    if (typeof chrome < "u" && chrome?.runtime?.getManifest)
      return chrome.runtime.getManifest()?.version || "1.0.0";
  } catch (e) {
    console.warn("[Sentry] Could not read manifest version:", e);
  }
  return "1.0.0";
}, Rl = (e = "any") => {
  const t = !!Al, n = !!Si;
  let r = !1, o = [];
  if (e === "react" ? (r = t, t || (o = ["VITE_SENTRY_DSN_REACT"])) : e === "browser" ? (r = n, n || (o = ["VITE_SENTRY_DSN_BROWSER"])) : (r = t || n, !t && !n ? o = ["VITE_SENTRY_DSN_REACT", "VITE_SENTRY_DSN_BROWSER"] : t ? n || (o = ["VITE_SENTRY_DSN_BROWSER"]) : o = ["VITE_SENTRY_DSN_REACT"]), !r) {
    if (Ue() === "development") {
      const s = o.join(" and ");
      console.warn(`[Sentry] Missing ${e === "any" ? "at least one DSN" : e === "react" ? "React DSN" : "Browser DSN"} configuration. Set ${s} in .env file.`);
    }
    return !1;
  }
  return !0;
}, go = () => {
  const e = Ue();
  return {
    environment: e,
    enableLogs: !0,
    tracesSampleRate: e === "development" ? 1 : 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/.*\.sentry\.io/],
    release: Il(),
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
function vl(e) {
  return e.filter((t) => {
    const n = t.name || (typeof t == "function" ? t.name : void 0);
    return !n || ![
      "BrowserApiErrors",
      "Breadcrumbs",
      "GlobalHandlers"
    ].includes(n);
  });
}
const Ol = () => {
  const e = Ue();
  return {
    ...go(),
    tracesSampleRate: e === "development" ? 0.5 : 0.05,
    sendDefaultPii: !1,
    initialScope: {
      tags: {
        context: "content",
        type: "content-script"
      }
    },
    beforeSend(t) {
      const n = go().beforeSend?.(t) ?? t;
      return n.breadcrumbs && (n.breadcrumbs = []), n.request && (delete n.request.url, delete n.request.headers), n;
    }
  };
}, un = "__V0_SENTRY_CONTENT_INITIALIZED", _o = globalThis, b = _o.__V0_CONTENT_SENTRY_STATE__ ?? (_o.__V0_CONTENT_SENTRY_STATE__ = {
  isInitialized: !1,
  client: null,
  scope: null,
  initPromise: null
});
async function Nl(e = 3, t = 50) {
  for (let o = 0; o < e; o++) {
    if (b.isInitialized && b.client && b.scope)
      return { client: b.client, scope: b.scope };
    if (b.initPromise)
      return b.initPromise;
    o < e - 1 && await new Promise((i) => setTimeout(i, t));
  }
  return Ue() === "development" && console.warn("[v0][Sentry] Content script Sentry initialization still not ready after retries"), { client: null, scope: new G() };
}
function wl() {
  if (!Rl("browser"))
    return { client: null, scope: new G() };
  if (globalThis[un] === !0) {
    if (b.isInitialized && b.client && b.scope)
      return { client: b.client, scope: b.scope };
    b.initPromise || (b.initPromise = Nl().then((n) => (n.client && n.scope && (b.client = n.client, b.scope = n.scope, b.isInitialized = !0), b.initPromise = null, n)));
    const t = b.scope ?? new G();
    return { client: b.client, scope: t };
  }
  return globalThis[un] = !0, b.initPromise = Cl().then((t) => (b.client = t.client, b.scope = t.scope, b.isInitialized = !0, b.initPromise = null, t)).catch((t) => {
    throw globalThis[un] = !1, b.isInitialized = !1, b.client = null, b.scope = null, b.initPromise = null, t;
  }), b.initPromise.catch(() => {
  }), { client: null, scope: new G() };
}
async function Cl() {
  try {
    const e = Ol(), t = bl({}), n = vl(t), r = new lu({
      dsn: Si,
      transport: vu,
      stackParser: Bu,
      integrations: n,
      ...e
    }), o = new G();
    return o.setClient(r), e.initialScope?.tags && Object.entries(e.initialScope.tags).forEach(([s, c]) => {
      o.setTag(s, c);
    }), r.init(), Ue() === "development" && console.log("[v0][Sentry] Content script monitoring initialized with isolated client"), { client: r, scope: o };
  } catch (e) {
    throw Ue() === "development" && console.warn("[v0][Sentry] Failed to initialize Sentry in content script:", e), e instanceof Error ? e : new Error(String(e));
  }
}
wl();
const fe = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, Dl = 1e4, Dt = {
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
/*! @license DOMPurify 3.3.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.0/LICENSE */
const {
  entries: Ti,
  setPrototypeOf: Eo,
  isFrozen: Ll,
  getPrototypeOf: Ml,
  getOwnPropertyDescriptor: kl
} = Object;
let {
  freeze: U,
  seal: Y,
  create: Ln
} = Object, {
  apply: Mn,
  construct: kn
} = typeof Reflect < "u" && Reflect;
U || (U = function(t) {
  return t;
});
Y || (Y = function(t) {
  return t;
});
Mn || (Mn = function(t, n) {
  for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), i = 2; i < r; i++)
    o[i - 2] = arguments[i];
  return t.apply(n, o);
});
kn || (kn = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
    r[o - 1] = arguments[o];
  return new t(...r);
});
const Et = $(Array.prototype.forEach), xl = $(Array.prototype.lastIndexOf), yo = $(Array.prototype.pop), qe = $(Array.prototype.push), Pl = $(Array.prototype.splice), Rt = $(String.prototype.toLowerCase), ln = $(String.prototype.toString), fn = $(String.prototype.match), Ve = $(String.prototype.replace), Fl = $(String.prototype.indexOf), Ul = $(String.prototype.trim), K = $(Object.prototype.hasOwnProperty), P = $(RegExp.prototype.test), Ke = $l(TypeError);
function $(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
      r[o - 1] = arguments[o];
    return Mn(e, t, r);
  };
}
function $l(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return kn(e, n);
  };
}
function S(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Rt;
  Eo && Eo(e, null);
  let r = t.length;
  for (; r--; ) {
    let o = t[r];
    if (typeof o == "string") {
      const i = n(o);
      i !== o && (Ll(t) || (t[r] = i), o = i);
    }
    e[o] = !0;
  }
  return e;
}
function Bl(e) {
  for (let t = 0; t < e.length; t++)
    K(e, t) || (e[t] = null);
  return e;
}
function oe(e) {
  const t = Ln(null);
  for (const [n, r] of Ti(e))
    K(e, n) && (Array.isArray(r) ? t[n] = Bl(r) : r && typeof r == "object" && r.constructor === Object ? t[n] = oe(r) : t[n] = r);
  return t;
}
function Xe(e, t) {
  for (; e !== null; ) {
    const r = kl(e, t);
    if (r) {
      if (r.get)
        return $(r.get);
      if (typeof r.value == "function")
        return $(r.value);
    }
    e = Ml(e);
  }
  function n() {
    return null;
  }
  return n;
}
const So = U(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), dn = U(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), pn = U(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Hl = U(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), mn = U(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Gl = U(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), To = U(["#text"]), bo = U(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), hn = U(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ao = U(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), yt = U(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), zl = Y(/\{\{[\w\W]*|[\w\W]*\}\}/gm), jl = Y(/<%[\w\W]*|[\w\W]*%>/gm), Wl = Y(/\$\{[\w\W]*/gm), Yl = Y(/^data-[\-\w.\u00B7-\uFFFF]+$/), ql = Y(/^aria-[\-\w]+$/), bi = Y(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Vl = Y(/^(?:\w+script|data):/i), Kl = Y(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Ai = Y(/^html$/i), Xl = Y(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Io = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: ql,
  ATTR_WHITESPACE: Kl,
  CUSTOM_ELEMENT: Xl,
  DATA_ATTR: Yl,
  DOCTYPE_NAME: Ai,
  ERB_EXPR: jl,
  IS_ALLOWED_URI: bi,
  IS_SCRIPT_OR_DATA: Vl,
  MUSTACHE_EXPR: zl,
  TMPLIT_EXPR: Wl
});
const Ze = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, Zl = function() {
  return typeof window > "u" ? null : window;
}, Jl = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let r = null;
  const o = "data-tt-policy-suffix";
  n && n.hasAttribute(o) && (r = n.getAttribute(o));
  const i = "dompurify" + (r ? "#" + r : "");
  try {
    return t.createPolicy(i, {
      createHTML(s) {
        return s;
      },
      createScriptURL(s) {
        return s;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + i + " could not be created."), null;
  }
}, Ro = function() {
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
function Ii() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Zl();
  const t = (g) => Ii(g);
  if (t.version = "3.3.0", t.removed = [], !e || !e.document || e.document.nodeType !== Ze.document || !e.Element)
    return t.isSupported = !1, t;
  let {
    document: n
  } = e;
  const r = n, o = r.currentScript, {
    DocumentFragment: i,
    HTMLTemplateElement: s,
    Node: c,
    Element: u,
    NodeFilter: l,
    NamedNodeMap: d = e.NamedNodeMap || e.MozNamedAttrMap,
    HTMLFormElement: p,
    DOMParser: E,
    trustedTypes: m
  } = e, T = u.prototype, q = Xe(T, "cloneNode"), R = Xe(T, "remove"), V = Xe(T, "nextSibling"), j = Xe(T, "childNodes"), Z = Xe(T, "parentNode");
  if (typeof s == "function") {
    const g = n.createElement("template");
    g.content && g.content.ownerDocument && (n = g.content.ownerDocument);
  }
  let N, ee = "";
  const {
    implementation: de,
    createNodeIterator: Oi,
    createDocumentFragment: Ni,
    getElementsByTagName: wi
  } = n, {
    importNode: Ci
  } = r;
  let x = Ro();
  t.isSupported = typeof Ti == "function" && typeof Z == "function" && de && de.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: Bt,
    ERB_EXPR: Ht,
    TMPLIT_EXPR: Gt,
    DATA_ATTR: Di,
    ARIA_ATTR: Li,
    IS_SCRIPT_OR_DATA: Mi,
    ATTR_WHITESPACE: Kn,
    CUSTOM_ELEMENT: ki
  } = Io;
  let {
    IS_ALLOWED_URI: Xn
  } = Io, w = null;
  const Zn = S({}, [...So, ...dn, ...pn, ...mn, ...To]);
  let D = null;
  const Jn = S({}, [...bo, ...hn, ...Ao, ...yt]);
  let v = Object.seal(Ln(null, {
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
  })), ze = null, zt = null;
  const Ae = Object.seal(Ln(null, {
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
  let Qn = !0, jt = !0, er = !1, tr = !0, Ie = !1, at = !0, pe = !1, Wt = !1, Yt = !1, Re = !1, ct = !1, ut = !1, nr = !0, rr = !1;
  const xi = "user-content-";
  let qt = !0, je = !1, ve = {}, Oe = null;
  const or = S({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let ir = null;
  const sr = S({}, ["audio", "video", "img", "source", "image", "track"]);
  let Vt = null;
  const ar = S({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), lt = "http://www.w3.org/1998/Math/MathML", ft = "http://www.w3.org/2000/svg", te = "http://www.w3.org/1999/xhtml";
  let Ne = te, Kt = !1, Xt = null;
  const Pi = S({}, [lt, ft, te], ln);
  let dt = S({}, ["mi", "mo", "mn", "ms", "mtext"]), pt = S({}, ["annotation-xml"]);
  const Fi = S({}, ["title", "style", "font", "a", "script"]);
  let We = null;
  const Ui = ["application/xhtml+xml", "text/html"], $i = "text/html";
  let C = null, we = null;
  const Bi = n.createElement("form"), cr = function(a) {
    return a instanceof RegExp || a instanceof Function;
  }, Zt = function() {
    let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(we && we === a)) {
      if ((!a || typeof a != "object") && (a = {}), a = oe(a), We = // eslint-disable-next-line unicorn/prefer-includes
      Ui.indexOf(a.PARSER_MEDIA_TYPE) === -1 ? $i : a.PARSER_MEDIA_TYPE, C = We === "application/xhtml+xml" ? ln : Rt, w = K(a, "ALLOWED_TAGS") ? S({}, a.ALLOWED_TAGS, C) : Zn, D = K(a, "ALLOWED_ATTR") ? S({}, a.ALLOWED_ATTR, C) : Jn, Xt = K(a, "ALLOWED_NAMESPACES") ? S({}, a.ALLOWED_NAMESPACES, ln) : Pi, Vt = K(a, "ADD_URI_SAFE_ATTR") ? S(oe(ar), a.ADD_URI_SAFE_ATTR, C) : ar, ir = K(a, "ADD_DATA_URI_TAGS") ? S(oe(sr), a.ADD_DATA_URI_TAGS, C) : sr, Oe = K(a, "FORBID_CONTENTS") ? S({}, a.FORBID_CONTENTS, C) : or, ze = K(a, "FORBID_TAGS") ? S({}, a.FORBID_TAGS, C) : oe({}), zt = K(a, "FORBID_ATTR") ? S({}, a.FORBID_ATTR, C) : oe({}), ve = K(a, "USE_PROFILES") ? a.USE_PROFILES : !1, Qn = a.ALLOW_ARIA_ATTR !== !1, jt = a.ALLOW_DATA_ATTR !== !1, er = a.ALLOW_UNKNOWN_PROTOCOLS || !1, tr = a.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ie = a.SAFE_FOR_TEMPLATES || !1, at = a.SAFE_FOR_XML !== !1, pe = a.WHOLE_DOCUMENT || !1, Re = a.RETURN_DOM || !1, ct = a.RETURN_DOM_FRAGMENT || !1, ut = a.RETURN_TRUSTED_TYPE || !1, Yt = a.FORCE_BODY || !1, nr = a.SANITIZE_DOM !== !1, rr = a.SANITIZE_NAMED_PROPS || !1, qt = a.KEEP_CONTENT !== !1, je = a.IN_PLACE || !1, Xn = a.ALLOWED_URI_REGEXP || bi, Ne = a.NAMESPACE || te, dt = a.MATHML_TEXT_INTEGRATION_POINTS || dt, pt = a.HTML_INTEGRATION_POINTS || pt, v = a.CUSTOM_ELEMENT_HANDLING || {}, a.CUSTOM_ELEMENT_HANDLING && cr(a.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (v.tagNameCheck = a.CUSTOM_ELEMENT_HANDLING.tagNameCheck), a.CUSTOM_ELEMENT_HANDLING && cr(a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (v.attributeNameCheck = a.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), a.CUSTOM_ELEMENT_HANDLING && typeof a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (v.allowCustomizedBuiltInElements = a.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), Ie && (jt = !1), ct && (Re = !0), ve && (w = S({}, To), D = [], ve.html === !0 && (S(w, So), S(D, bo)), ve.svg === !0 && (S(w, dn), S(D, hn), S(D, yt)), ve.svgFilters === !0 && (S(w, pn), S(D, hn), S(D, yt)), ve.mathMl === !0 && (S(w, mn), S(D, Ao), S(D, yt))), a.ADD_TAGS && (typeof a.ADD_TAGS == "function" ? Ae.tagCheck = a.ADD_TAGS : (w === Zn && (w = oe(w)), S(w, a.ADD_TAGS, C))), a.ADD_ATTR && (typeof a.ADD_ATTR == "function" ? Ae.attributeCheck = a.ADD_ATTR : (D === Jn && (D = oe(D)), S(D, a.ADD_ATTR, C))), a.ADD_URI_SAFE_ATTR && S(Vt, a.ADD_URI_SAFE_ATTR, C), a.FORBID_CONTENTS && (Oe === or && (Oe = oe(Oe)), S(Oe, a.FORBID_CONTENTS, C)), qt && (w["#text"] = !0), pe && S(w, ["html", "head", "body"]), w.table && (S(w, ["tbody"]), delete ze.tbody), a.TRUSTED_TYPES_POLICY) {
        if (typeof a.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Ke('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof a.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Ke('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        N = a.TRUSTED_TYPES_POLICY, ee = N.createHTML("");
      } else
        N === void 0 && (N = Jl(m, o)), N !== null && typeof ee == "string" && (ee = N.createHTML(""));
      U && U(a), we = a;
    }
  }, ur = S({}, [...dn, ...pn, ...Hl]), lr = S({}, [...mn, ...Gl]), Hi = function(a) {
    let f = Z(a);
    (!f || !f.tagName) && (f = {
      namespaceURI: Ne,
      tagName: "template"
    });
    const h = Rt(a.tagName), I = Rt(f.tagName);
    return Xt[a.namespaceURI] ? a.namespaceURI === ft ? f.namespaceURI === te ? h === "svg" : f.namespaceURI === lt ? h === "svg" && (I === "annotation-xml" || dt[I]) : !!ur[h] : a.namespaceURI === lt ? f.namespaceURI === te ? h === "math" : f.namespaceURI === ft ? h === "math" && pt[I] : !!lr[h] : a.namespaceURI === te ? f.namespaceURI === ft && !pt[I] || f.namespaceURI === lt && !dt[I] ? !1 : !lr[h] && (Fi[h] || !ur[h]) : !!(We === "application/xhtml+xml" && Xt[a.namespaceURI]) : !1;
  }, J = function(a) {
    qe(t.removed, {
      element: a
    });
    try {
      Z(a).removeChild(a);
    } catch {
      R(a);
    }
  }, me = function(a, f) {
    try {
      qe(t.removed, {
        attribute: f.getAttributeNode(a),
        from: f
      });
    } catch {
      qe(t.removed, {
        attribute: null,
        from: f
      });
    }
    if (f.removeAttribute(a), a === "is")
      if (Re || ct)
        try {
          J(f);
        } catch {
        }
      else
        try {
          f.setAttribute(a, "");
        } catch {
        }
  }, fr = function(a) {
    let f = null, h = null;
    if (Yt)
      a = "<remove></remove>" + a;
    else {
      const O = fn(a, /^[\r\n\t ]+/);
      h = O && O[0];
    }
    We === "application/xhtml+xml" && Ne === te && (a = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + a + "</body></html>");
    const I = N ? N.createHTML(a) : a;
    if (Ne === te)
      try {
        f = new E().parseFromString(I, We);
      } catch {
      }
    if (!f || !f.documentElement) {
      f = de.createDocument(Ne, "template", null);
      try {
        f.documentElement.innerHTML = Kt ? ee : I;
      } catch {
      }
    }
    const k = f.body || f.documentElement;
    return a && h && k.insertBefore(n.createTextNode(h), k.childNodes[0] || null), Ne === te ? wi.call(f, pe ? "html" : "body")[0] : pe ? f.documentElement : k;
  }, dr = function(a) {
    return Oi.call(
      a.ownerDocument || a,
      a,
      // eslint-disable-next-line no-bitwise
      l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION,
      null
    );
  }, Jt = function(a) {
    return a instanceof p && (typeof a.nodeName != "string" || typeof a.textContent != "string" || typeof a.removeChild != "function" || !(a.attributes instanceof d) || typeof a.removeAttribute != "function" || typeof a.setAttribute != "function" || typeof a.namespaceURI != "string" || typeof a.insertBefore != "function" || typeof a.hasChildNodes != "function");
  }, pr = function(a) {
    return typeof c == "function" && a instanceof c;
  };
  function ne(g, a, f) {
    Et(g, (h) => {
      h.call(t, a, f, we);
    });
  }
  const mr = function(a) {
    let f = null;
    if (ne(x.beforeSanitizeElements, a, null), Jt(a))
      return J(a), !0;
    const h = C(a.nodeName);
    if (ne(x.uponSanitizeElement, a, {
      tagName: h,
      allowedTags: w
    }), at && a.hasChildNodes() && !pr(a.firstElementChild) && P(/<[/\w!]/g, a.innerHTML) && P(/<[/\w!]/g, a.textContent) || a.nodeType === Ze.progressingInstruction || at && a.nodeType === Ze.comment && P(/<[/\w]/g, a.data))
      return J(a), !0;
    if (!(Ae.tagCheck instanceof Function && Ae.tagCheck(h)) && (!w[h] || ze[h])) {
      if (!ze[h] && gr(h) && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, h) || v.tagNameCheck instanceof Function && v.tagNameCheck(h)))
        return !1;
      if (qt && !Oe[h]) {
        const I = Z(a) || a.parentNode, k = j(a) || a.childNodes;
        if (k && I) {
          const O = k.length;
          for (let H = O - 1; H >= 0; --H) {
            const re = q(k[H], !0);
            re.__removalCount = (a.__removalCount || 0) + 1, I.insertBefore(re, V(a));
          }
        }
      }
      return J(a), !0;
    }
    return a instanceof u && !Hi(a) || (h === "noscript" || h === "noembed" || h === "noframes") && P(/<\/no(script|embed|frames)/i, a.innerHTML) ? (J(a), !0) : (Ie && a.nodeType === Ze.text && (f = a.textContent, Et([Bt, Ht, Gt], (I) => {
      f = Ve(f, I, " ");
    }), a.textContent !== f && (qe(t.removed, {
      element: a.cloneNode()
    }), a.textContent = f)), ne(x.afterSanitizeElements, a, null), !1);
  }, hr = function(a, f, h) {
    if (nr && (f === "id" || f === "name") && (h in n || h in Bi))
      return !1;
    if (!(jt && !zt[f] && P(Di, f))) {
      if (!(Qn && P(Li, f))) {
        if (!(Ae.attributeCheck instanceof Function && Ae.attributeCheck(f, a))) {
          if (!D[f] || zt[f]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(gr(a) && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, a) || v.tagNameCheck instanceof Function && v.tagNameCheck(a)) && (v.attributeNameCheck instanceof RegExp && P(v.attributeNameCheck, f) || v.attributeNameCheck instanceof Function && v.attributeNameCheck(f, a)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              f === "is" && v.allowCustomizedBuiltInElements && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, h) || v.tagNameCheck instanceof Function && v.tagNameCheck(h)))
            ) return !1;
          } else if (!Vt[f]) {
            if (!P(Xn, Ve(h, Kn, ""))) {
              if (!((f === "src" || f === "xlink:href" || f === "href") && a !== "script" && Fl(h, "data:") === 0 && ir[a])) {
                if (!(er && !P(Mi, Ve(h, Kn, "")))) {
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
  }, gr = function(a) {
    return a !== "annotation-xml" && fn(a, ki);
  }, _r = function(a) {
    ne(x.beforeSanitizeAttributes, a, null);
    const {
      attributes: f
    } = a;
    if (!f || Jt(a))
      return;
    const h = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: D,
      forceKeepAttr: void 0
    };
    let I = f.length;
    for (; I--; ) {
      const k = f[I], {
        name: O,
        namespaceURI: H,
        value: re
      } = k, Ce = C(O), Qt = re;
      let L = O === "value" ? Qt : Ul(Qt);
      if (h.attrName = Ce, h.attrValue = L, h.keepAttr = !0, h.forceKeepAttr = void 0, ne(x.uponSanitizeAttribute, a, h), L = h.attrValue, rr && (Ce === "id" || Ce === "name") && (me(O, a), L = xi + L), at && P(/((--!?|])>)|<\/(style|title|textarea)/i, L)) {
        me(O, a);
        continue;
      }
      if (Ce === "attributename" && fn(L, "href")) {
        me(O, a);
        continue;
      }
      if (h.forceKeepAttr)
        continue;
      if (!h.keepAttr) {
        me(O, a);
        continue;
      }
      if (!tr && P(/\/>/i, L)) {
        me(O, a);
        continue;
      }
      Ie && Et([Bt, Ht, Gt], (yr) => {
        L = Ve(L, yr, " ");
      });
      const Er = C(a.nodeName);
      if (!hr(Er, Ce, L)) {
        me(O, a);
        continue;
      }
      if (N && typeof m == "object" && typeof m.getAttributeType == "function" && !H)
        switch (m.getAttributeType(Er, Ce)) {
          case "TrustedHTML": {
            L = N.createHTML(L);
            break;
          }
          case "TrustedScriptURL": {
            L = N.createScriptURL(L);
            break;
          }
        }
      if (L !== Qt)
        try {
          H ? a.setAttributeNS(H, O, L) : a.setAttribute(O, L), Jt(a) ? J(a) : yo(t.removed);
        } catch {
          me(O, a);
        }
    }
    ne(x.afterSanitizeAttributes, a, null);
  }, Gi = function g(a) {
    let f = null;
    const h = dr(a);
    for (ne(x.beforeSanitizeShadowDOM, a, null); f = h.nextNode(); )
      ne(x.uponSanitizeShadowNode, f, null), mr(f), _r(f), f.content instanceof i && g(f.content);
    ne(x.afterSanitizeShadowDOM, a, null);
  };
  return t.sanitize = function(g) {
    let a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, f = null, h = null, I = null, k = null;
    if (Kt = !g, Kt && (g = "<!-->"), typeof g != "string" && !pr(g))
      if (typeof g.toString == "function") {
        if (g = g.toString(), typeof g != "string")
          throw Ke("dirty is not a string, aborting");
      } else
        throw Ke("toString is not a function");
    if (!t.isSupported)
      return g;
    if (Wt || Zt(a), t.removed = [], typeof g == "string" && (je = !1), je) {
      if (g.nodeName) {
        const re = C(g.nodeName);
        if (!w[re] || ze[re])
          throw Ke("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (g instanceof c)
      f = fr("<!---->"), h = f.ownerDocument.importNode(g, !0), h.nodeType === Ze.element && h.nodeName === "BODY" || h.nodeName === "HTML" ? f = h : f.appendChild(h);
    else {
      if (!Re && !Ie && !pe && // eslint-disable-next-line unicorn/prefer-includes
      g.indexOf("<") === -1)
        return N && ut ? N.createHTML(g) : g;
      if (f = fr(g), !f)
        return Re ? null : ut ? ee : "";
    }
    f && Yt && J(f.firstChild);
    const O = dr(je ? g : f);
    for (; I = O.nextNode(); )
      mr(I), _r(I), I.content instanceof i && Gi(I.content);
    if (je)
      return g;
    if (Re) {
      if (ct)
        for (k = Ni.call(f.ownerDocument); f.firstChild; )
          k.appendChild(f.firstChild);
      else
        k = f;
      return (D.shadowroot || D.shadowrootmode) && (k = Ci.call(r, k, !0)), k;
    }
    let H = pe ? f.outerHTML : f.innerHTML;
    return pe && w["!doctype"] && f.ownerDocument && f.ownerDocument.doctype && f.ownerDocument.doctype.name && P(Ai, f.ownerDocument.doctype.name) && (H = "<!DOCTYPE " + f.ownerDocument.doctype.name + `>
` + H), Ie && Et([Bt, Ht, Gt], (re) => {
      H = Ve(H, re, " ");
    }), N && ut ? N.createHTML(H) : H;
  }, t.setConfig = function() {
    let g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Zt(g), Wt = !0;
  }, t.clearConfig = function() {
    we = null, Wt = !1;
  }, t.isValidAttribute = function(g, a, f) {
    we || Zt({});
    const h = C(g), I = C(a);
    return hr(h, I, f);
  }, t.addHook = function(g, a) {
    typeof a == "function" && qe(x[g], a);
  }, t.removeHook = function(g, a) {
    if (a !== void 0) {
      const f = xl(x[g], a);
      return f === -1 ? void 0 : Pl(x[g], f, 1)[0];
    }
    return yo(x[g]);
  }, t.removeHooks = function(g) {
    x[g] = [];
  }, t.removeAllHooks = function() {
    x = Ro();
  }, t;
}
var Ql = Ii();
const ef = /* @__PURE__ */ new Set([
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
]), tf = {
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
function nf(e) {
  return e ? (e.toLowerCase().match(/\b[\p{L}\p{N}]{3,}\b/gu) || []).filter(
    (t) => !ef.has(t)
  ) : [];
}
function rf(e) {
  return e.reduce((t, n) => (t[n] = (t[n] || 0) + 1, t), {});
}
function of(e, t = 10) {
  const n = nf(e), r = rf(n), o = Object.entries(r).sort(([, s], [, c]) => c - s).slice(0, t).map(([s]) => s), i = sf(o);
  return {
    keywords: o,
    keywordFrequencies: r,
    categories: i
  };
}
function sf(e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    for (const [r, o] of Object.entries(tf))
      o.includes(n) && t.add(r);
  return [...t];
}
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
const af = [
  "Receiving end does not exist",
  "The message port closed before a response was received",
  "Could not establish connection. Receiving end does not exist",
  "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
];
function Ri(e) {
  const t = e?.message ?? "";
  return af.some((n) => t === n || t.startsWith(n));
}
(async function() {
  try {
    const t = location.hostname, { [fe.BLACKLIST]: n } = await chrome.storage.local.get(fe.BLACKLIST);
    if (n && Array.isArray(n) && n.some((o) => {
      const i = typeof o == "string" ? o : o.domain;
      return t === i || t.endsWith("." + i);
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
let vo = !1;
const cf = 15e3, uf = Date.now();
let Oo = !1, Le;
lf();
document.addEventListener("visibilitychange", () => {
  document.visibilityState === "hidden" && $t("hidden");
});
window.addEventListener("pagehide", () => void $t("pagehide"));
window.addEventListener("beforeunload", () => void $t("beforeunload"));
chrome.runtime.onMessage.addListener((e, t, n) => {
  try {
    if (e?.type === Dt.TOGGLE_ZEN_MODE)
      return pf(e.payload?.preset), n?.({ success: !0 }), !0;
    if (e?.type === Dt.SITE_CUSTOMIZATION_UPDATED) {
      const r = e.payload;
      if (r?.domain === "youtube.com" && window.location.hostname.includes("youtube.com"))
        return vi(r.config), n?.({ success: !0 }), !0;
    }
  } catch (r) {
    console.warn("[v0][CS] Message handler failed:", r), n?.({ success: !1, error: String(r) });
  }
  return !1;
});
const No = async () => {
  if (!vo) {
    vo = !0;
    try {
      const e = document.body?.innerText?.slice(0, Dl) ?? "", t = location.href, n = await df(e, t), r = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: Dt.CONTENT_ANALYSIS_RESULT, id: r, source: "content-script", ts: Date.now(), payload: { result: n } }, () => {
        const o = chrome.runtime.lastError;
        o && !Ri(o) && console.warn("[v0][CS] Content analysis message error:", o.message ?? "Unknown error");
      });
    } catch (e) {
      console.error("[v0][CS] analyzePageContent error:", e);
    }
  }
};
function lf() {
  typeof Le == "number" && window.clearTimeout(Le), Le = window.setTimeout(() => {
    $t("timer");
  }, cf);
}
async function $t(e) {
  if (Oo) return;
  Oo = !0, typeof Le == "number" && (window.clearTimeout(Le), Le = void 0);
  const t = ff();
  if (t) {
    t.estimatedTimeSpent = Math.max(
      1,
      Math.round((Date.now() - uf) / 1e3)
    );
    try {
      const n = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage(
        {
          type: Dt.ANALYTICS_CONTENT_AGGREGATE,
          id: n,
          source: "content-script",
          ts: Date.now(),
          payload: t
        },
        () => {
          const r = chrome.runtime.lastError;
          r && !Ri(r) && console.warn("[v0][CS] Content insight message error:", r.message ?? "Unknown error");
        }
      );
    } catch (n) {
      console.warn(`[v0][CS] Failed to send content aggregate (${e}):`, n);
    }
  }
}
function ff() {
  const e = (document.title ?? "").trim(), t = gn('meta[name="description"]'), n = gn('meta[property="og:title"]'), r = gn('meta[property="og:description"]'), o = [e, t, n, r].filter(Boolean).join(" ").trim(), i = o ? of(o, 8) : { keywords: [], categories: [] };
  return {
    url: location.href,
    title: e,
    description: t,
    keywords: i.keywords ?? [],
    categories: i.categories ?? [],
    domain: location.hostname
  };
}
function gn(e) {
  return document.querySelector(e)?.getAttribute("content")?.trim() ?? "";
}
document.readyState === "complete" || document.readyState === "interactive" ? No() : document.addEventListener("DOMContentLoaded", No, { once: !0 });
window.location.hostname.includes("youtube.com") && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => wo(), { once: !0 }) : wo());
async function df(e, t) {
  const { [fe.SETTINGS]: n } = await chrome.storage.sync.get(fe.SETTINGS), r = n?.productiveKeywords || [], o = n?.distractingKeywords || [], i = e.toLowerCase(), s = document.title.toLowerCase(), c = document.querySelector('meta[name="description"]')?.getAttribute("content")?.toLowerCase() || "", u = `${i} ${s} ${c}`;
  let l = 0, d = 0;
  const p = (V) => V.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((V) => {
    const j = new RegExp(`\\b${p(V)}\\b`, "gi"), Z = u.match(j);
    if (Z) {
      const N = Z.length, ee = s.match(j)?.length || 0, de = c.match(j)?.length || 0;
      l += N + ee * 2 + de * 1.5;
    }
  }), o.forEach((V) => {
    const j = new RegExp(`\\b${p(V)}\\b`, "gi"), Z = u.match(j);
    if (Z) {
      const N = Z.length, ee = s.match(j)?.length || 0, de = c.match(j)?.length || 0;
      d += N + ee * 2 + de * 1.5;
    }
  });
  const E = l + d, m = E > 0 ? d / E : 0, T = u.length, q = E / Math.max(T / 1e3, 1);
  let R = "neutral";
  return m > 0.6 && q > 0.5 ? R = "distracting" : m < 0.4 && l > 0 && q > 0.3 && (R = "productive"), {
    url: t,
    classification: R,
    score: m,
    categories: {
      productiveScore: l,
      distractingScore: d,
      keywordDensity: q,
      textLength: T
    },
    flagged: R === "distracting"
  };
}
function vi(e) {
  const t = [];
  e.hideHomepage && t.push(...St.hideHomepage), e.hideShorts && t.push(...St.hideShorts), e.hideComments && t.push(...St.hideComments), e.hideRecommendations && t.push(...St.hideRecommendations);
  const n = document.getElementById("v0-youtube-customization");
  if (n && n.remove(), t.length > 0) {
    const r = document.createElement("style");
    r.id = "v0-youtube-customization", r.textContent = t.map((o) => `${o} { display: none !important; }`).join(`
`), document.head.appendChild(r);
  }
}
async function wo() {
  if (window.location.hostname.includes("youtube.com"))
    try {
      const { [fe.SITE_CUSTOMIZATIONS]: e } = await chrome.storage.local.get(fe.SITE_CUSTOMIZATIONS), t = e?.["youtube.com"];
      t && (vi(t), console.log("[v0][CS] YouTube customization applied:", t));
    } catch (e) {
      console.error("[v0][CS] Failed to load YouTube customization:", e);
    }
}
let _n = !1, De = null, vt = "", Q = null;
function pf(e) {
  if (_n) {
    const t = document.getElementById("zen-mode-styles");
    t && t.remove(), document.body.classList.remove("zen-mode"), window.location.hostname.includes("youtube.com") || (De !== null && (document.body.innerHTML = "", document.body.appendChild(De.cloneNode(!0)), document.body.style.background = vt, De = null, vt = ""), Q && (Q.remove(), Q = null)), _n = !1, console.log("[v0][CS] Zen Mode deactivated");
  } else {
    const t = document.createDocumentFragment();
    for (; document.body.firstChild; )
      t.appendChild(document.body.firstChild);
    De = t, vt = document.body.style.background || "", mf(e), _n = !0, console.log("[v0][CS] Zen Mode activated");
  }
}
function mf(e) {
  try {
    e && gf(e);
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
      const n = hf();
      if (Q && Q.remove(), Q = document.createElement("div"), Q.id = "zen-mode-container", n.trim())
        if (!/<[^>]*>/g.test(n))
          Q.textContent = n;
        else {
          const o = Ql.sanitize(n, {
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
            RETURN_DOM_FRAGMENT: !1
          });
          Q.innerHTML = o;
        }
      document.body.appendChild(Q);
    }
  } catch (t) {
    throw console.error("[v0][CS] Error applying Zen Mode:", t), De !== null && (document.body.innerHTML = "", document.body.appendChild(De.cloneNode(!0)), document.body.style.background = vt), t;
  }
}
function hf() {
  if (window.location.hostname.includes("youtube.com")) {
    const r = document.querySelector("#primary #contents") || document.querySelector("#primary") || document.querySelector("#contents");
    if (r) return r.innerHTML;
  }
  const e = document.querySelector("article"), t = document.querySelector("main"), n = document.querySelector('[role="main"]');
  return e ? e.innerHTML : t ? t.innerHTML : n ? n.innerHTML : document.body.innerHTML;
}
async function gf(e) {
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
