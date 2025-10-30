const oe = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, Jt = 1e4, Nt = {
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
  entries: wt,
  setPrototypeOf: St,
  isFrozen: Qt,
  getPrototypeOf: en,
  getOwnPropertyDescriptor: tn
} = Object;
let {
  freeze: y,
  seal: L,
  create: Xe
} = Object, {
  apply: $e,
  construct: Ve
} = typeof Reflect < "u" && Reflect;
y || (y = function(t) {
  return t;
});
L || (L = function(t) {
  return t;
});
$e || ($e = function(t, i) {
  for (var s = arguments.length, l = new Array(s > 2 ? s - 2 : 0), u = 2; u < s; u++)
    l[u - 2] = arguments[u];
  return t.apply(i, l);
});
Ve || (Ve = function(t) {
  for (var i = arguments.length, s = new Array(i > 1 ? i - 1 : 0), l = 1; l < i; l++)
    s[l - 1] = arguments[l];
  return new t(...s);
});
const ye = O(Array.prototype.forEach), nn = O(Array.prototype.lastIndexOf), yt = O(Array.prototype.pop), ce = O(Array.prototype.push), on = O(Array.prototype.splice), Re = O(String.prototype.toLowerCase), ze = O(String.prototype.toString), He = O(String.prototype.match), ue = O(String.prototype.replace), rn = O(String.prototype.indexOf), an = O(String.prototype.trim), M = O(Object.prototype.hasOwnProperty), S = O(RegExp.prototype.test), fe = sn(TypeError);
function O(r) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var i = arguments.length, s = new Array(i > 1 ? i - 1 : 0), l = 1; l < i; l++)
      s[l - 1] = arguments[l];
    return $e(r, t, s);
  };
}
function sn(r) {
  return function() {
    for (var t = arguments.length, i = new Array(t), s = 0; s < t; s++)
      i[s] = arguments[s];
    return Ve(r, i);
  };
}
function c(r, t) {
  let i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Re;
  St && St(r, null);
  let s = t.length;
  for (; s--; ) {
    let l = t[s];
    if (typeof l == "string") {
      const u = i(l);
      u !== l && (Qt(t) || (t[s] = u), l = u);
    }
    r[l] = !0;
  }
  return r;
}
function ln(r) {
  for (let t = 0; t < r.length; t++)
    M(r, t) || (r[t] = null);
  return r;
}
function U(r) {
  const t = Xe(null);
  for (const [i, s] of wt(r))
    M(r, i) && (Array.isArray(s) ? t[i] = ln(s) : s && typeof s == "object" && s.constructor === Object ? t[i] = U(s) : t[i] = s);
  return t;
}
function me(r, t) {
  for (; r !== null; ) {
    const s = tn(r, t);
    if (s) {
      if (s.get)
        return O(s.get);
      if (typeof s.value == "function")
        return O(s.value);
    }
    r = en(r);
  }
  function i() {
    return null;
  }
  return i;
}
const Ot = y(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Be = y(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), We = y(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), cn = y(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ye = y(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), un = y(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Rt = y(["#text"]), Lt = y(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Ke = y(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Mt = y(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Oe = y(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), fn = L(/\{\{[\w\W]*|[\w\W]*\}\}/gm), mn = L(/<%[\w\W]*|[\w\W]*%>/gm), dn = L(/\$\{[\w\W]*/gm), pn = L(/^data-[\-\w.\u00B7-\uFFFF]+$/), Tn = L(/^aria-[\-\w]+$/), vt = L(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), En = L(/^(?:\w+script|data):/i), _n = L(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), xt = L(/^html$/i), gn = L(/^[a-z][.\w]*(-[.\w]+)+$/i);
var It = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Tn,
  ATTR_WHITESPACE: _n,
  CUSTOM_ELEMENT: gn,
  DATA_ATTR: pn,
  DOCTYPE_NAME: xt,
  ERB_EXPR: mn,
  IS_ALLOWED_URI: vt,
  IS_SCRIPT_OR_DATA: En,
  MUSTACHE_EXPR: fn,
  TMPLIT_EXPR: dn
});
const de = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, hn = function() {
  return typeof window > "u" ? null : window;
}, An = function(t, i) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let s = null;
  const l = "data-tt-policy-suffix";
  i && i.hasAttribute(l) && (s = i.getAttribute(l));
  const u = "dompurify" + (s ? "#" + s : "");
  try {
    return t.createPolicy(u, {
      createHTML(I) {
        return I;
      },
      createScriptURL(I) {
        return I;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + u + " could not be created."), null;
  }
}, bt = function() {
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
function Pt() {
  let r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : hn();
  const t = (a) => Pt(a);
  if (t.version = "3.3.0", t.removed = [], !r || !r.document || r.document.nodeType !== de.document || !r.Element)
    return t.isSupported = !1, t;
  let {
    document: i
  } = r;
  const s = i, l = s.currentScript, {
    DocumentFragment: u,
    HTMLTemplateElement: I,
    Node: z,
    Element: K,
    NodeFilter: b,
    NamedNodeMap: Z = r.NamedNodeMap || r.MozNamedAttrMap,
    HTMLFormElement: pe,
    DOMParser: ie,
    trustedTypes: F
  } = r, G = K.prototype, re = me(G, "cloneNode"), X = me(G, "remove"), H = me(G, "nextSibling"), w = me(G, "childNodes"), C = me(G, "parentNode");
  if (typeof I == "function") {
    const a = i.createElement("template");
    a.content && a.content.ownerDocument && (i = a.content.ownerDocument);
  }
  let p, v = "";
  const {
    implementation: B,
    createNodeIterator: kt,
    createDocumentFragment: Ut,
    getElementsByTagName: Ft
  } = i, {
    importNode: Gt
  } = s;
  let A = bt();
  t.isSupported = typeof wt == "function" && typeof C == "function" && B && B.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: Me,
    ERB_EXPR: Ie,
    TMPLIT_EXPR: be,
    DATA_ATTR: zt,
    ARIA_ATTR: Ht,
    IS_SCRIPT_OR_DATA: Bt,
    ATTR_WHITESPACE: je,
    CUSTOM_ELEMENT: Wt
  } = It;
  let {
    IS_ALLOWED_URI: qe
  } = It, T = null;
  const Je = c({}, [...Ot, ...Be, ...We, ...Ye, ...Rt]);
  let _ = null;
  const Qe = c({}, [...Lt, ...Ke, ...Mt, ...Oe]);
  let m = Object.seal(Xe(null, {
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
  })), ae = null, Ce = null;
  const $ = Object.seal(Xe(null, {
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
  let et = !0, De = !0, tt = !1, nt = !0, V = !1, Te = !0, W = !1, Ne = !1, we = !1, j = !1, Ee = !1, _e = !1, ot = !0, it = !1;
  const Yt = "user-content-";
  let ve = !0, se = !1, q = {}, J = null;
  const rt = c({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let at = null;
  const st = c({}, ["audio", "video", "img", "source", "image", "track"]);
  let xe = null;
  const lt = c({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), ge = "http://www.w3.org/1998/Math/MathML", he = "http://www.w3.org/2000/svg", x = "http://www.w3.org/1999/xhtml";
  let Q = x, Pe = !1, ke = null;
  const Kt = c({}, [ge, he, x], ze);
  let Ae = c({}, ["mi", "mo", "mn", "ms", "mtext"]), Se = c({}, ["annotation-xml"]);
  const Zt = c({}, ["title", "style", "font", "a", "script"]);
  let le = null;
  const Xt = ["application/xhtml+xml", "text/html"], $t = "text/html";
  let E = null, ee = null;
  const Vt = i.createElement("form"), ct = function(e) {
    return e instanceof RegExp || e instanceof Function;
  }, Ue = function() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(ee && ee === e)) {
      if ((!e || typeof e != "object") && (e = {}), e = U(e), le = // eslint-disable-next-line unicorn/prefer-includes
      Xt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? $t : e.PARSER_MEDIA_TYPE, E = le === "application/xhtml+xml" ? ze : Re, T = M(e, "ALLOWED_TAGS") ? c({}, e.ALLOWED_TAGS, E) : Je, _ = M(e, "ALLOWED_ATTR") ? c({}, e.ALLOWED_ATTR, E) : Qe, ke = M(e, "ALLOWED_NAMESPACES") ? c({}, e.ALLOWED_NAMESPACES, ze) : Kt, xe = M(e, "ADD_URI_SAFE_ATTR") ? c(U(lt), e.ADD_URI_SAFE_ATTR, E) : lt, at = M(e, "ADD_DATA_URI_TAGS") ? c(U(st), e.ADD_DATA_URI_TAGS, E) : st, J = M(e, "FORBID_CONTENTS") ? c({}, e.FORBID_CONTENTS, E) : rt, ae = M(e, "FORBID_TAGS") ? c({}, e.FORBID_TAGS, E) : U({}), Ce = M(e, "FORBID_ATTR") ? c({}, e.FORBID_ATTR, E) : U({}), q = M(e, "USE_PROFILES") ? e.USE_PROFILES : !1, et = e.ALLOW_ARIA_ATTR !== !1, De = e.ALLOW_DATA_ATTR !== !1, tt = e.ALLOW_UNKNOWN_PROTOCOLS || !1, nt = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, V = e.SAFE_FOR_TEMPLATES || !1, Te = e.SAFE_FOR_XML !== !1, W = e.WHOLE_DOCUMENT || !1, j = e.RETURN_DOM || !1, Ee = e.RETURN_DOM_FRAGMENT || !1, _e = e.RETURN_TRUSTED_TYPE || !1, we = e.FORCE_BODY || !1, ot = e.SANITIZE_DOM !== !1, it = e.SANITIZE_NAMED_PROPS || !1, ve = e.KEEP_CONTENT !== !1, se = e.IN_PLACE || !1, qe = e.ALLOWED_URI_REGEXP || vt, Q = e.NAMESPACE || x, Ae = e.MATHML_TEXT_INTEGRATION_POINTS || Ae, Se = e.HTML_INTEGRATION_POINTS || Se, m = e.CUSTOM_ELEMENT_HANDLING || {}, e.CUSTOM_ELEMENT_HANDLING && ct(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (m.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck), e.CUSTOM_ELEMENT_HANDLING && ct(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (m.attributeNameCheck = e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), e.CUSTOM_ELEMENT_HANDLING && typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (m.allowCustomizedBuiltInElements = e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), V && (De = !1), Ee && (j = !0), q && (T = c({}, Rt), _ = [], q.html === !0 && (c(T, Ot), c(_, Lt)), q.svg === !0 && (c(T, Be), c(_, Ke), c(_, Oe)), q.svgFilters === !0 && (c(T, We), c(_, Ke), c(_, Oe)), q.mathMl === !0 && (c(T, Ye), c(_, Mt), c(_, Oe))), e.ADD_TAGS && (typeof e.ADD_TAGS == "function" ? $.tagCheck = e.ADD_TAGS : (T === Je && (T = U(T)), c(T, e.ADD_TAGS, E))), e.ADD_ATTR && (typeof e.ADD_ATTR == "function" ? $.attributeCheck = e.ADD_ATTR : (_ === Qe && (_ = U(_)), c(_, e.ADD_ATTR, E))), e.ADD_URI_SAFE_ATTR && c(xe, e.ADD_URI_SAFE_ATTR, E), e.FORBID_CONTENTS && (J === rt && (J = U(J)), c(J, e.FORBID_CONTENTS, E)), ve && (T["#text"] = !0), W && c(T, ["html", "head", "body"]), T.table && (c(T, ["tbody"]), delete ae.tbody), e.TRUSTED_TYPES_POLICY) {
        if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw fe('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw fe('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        p = e.TRUSTED_TYPES_POLICY, v = p.createHTML("");
      } else
        p === void 0 && (p = An(F, l)), p !== null && typeof v == "string" && (v = p.createHTML(""));
      y && y(e), ee = e;
    }
  }, ut = c({}, [...Be, ...We, ...cn]), ft = c({}, [...Ye, ...un]), jt = function(e) {
    let n = C(e);
    (!n || !n.tagName) && (n = {
      namespaceURI: Q,
      tagName: "template"
    });
    const o = Re(e.tagName), f = Re(n.tagName);
    return ke[e.namespaceURI] ? e.namespaceURI === he ? n.namespaceURI === x ? o === "svg" : n.namespaceURI === ge ? o === "svg" && (f === "annotation-xml" || Ae[f]) : !!ut[o] : e.namespaceURI === ge ? n.namespaceURI === x ? o === "math" : n.namespaceURI === he ? o === "math" && Se[f] : !!ft[o] : e.namespaceURI === x ? n.namespaceURI === he && !Se[f] || n.namespaceURI === ge && !Ae[f] ? !1 : !ft[o] && (Zt[o] || !ut[o]) : !!(le === "application/xhtml+xml" && ke[e.namespaceURI]) : !1;
  }, D = function(e) {
    ce(t.removed, {
      element: e
    });
    try {
      C(e).removeChild(e);
    } catch {
      X(e);
    }
  }, Y = function(e, n) {
    try {
      ce(t.removed, {
        attribute: n.getAttributeNode(e),
        from: n
      });
    } catch {
      ce(t.removed, {
        attribute: null,
        from: n
      });
    }
    if (n.removeAttribute(e), e === "is")
      if (j || Ee)
        try {
          D(n);
        } catch {
        }
      else
        try {
          n.setAttribute(e, "");
        } catch {
        }
  }, mt = function(e) {
    let n = null, o = null;
    if (we)
      e = "<remove></remove>" + e;
    else {
      const d = He(e, /^[\r\n\t ]+/);
      o = d && d[0];
    }
    le === "application/xhtml+xml" && Q === x && (e = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + e + "</body></html>");
    const f = p ? p.createHTML(e) : e;
    if (Q === x)
      try {
        n = new ie().parseFromString(f, le);
      } catch {
      }
    if (!n || !n.documentElement) {
      n = B.createDocument(Q, "template", null);
      try {
        n.documentElement.innerHTML = Pe ? v : f;
      } catch {
      }
    }
    const h = n.body || n.documentElement;
    return e && o && h.insertBefore(i.createTextNode(o), h.childNodes[0] || null), Q === x ? Ft.call(n, W ? "html" : "body")[0] : W ? n.documentElement : h;
  }, dt = function(e) {
    return kt.call(
      e.ownerDocument || e,
      e,
      // eslint-disable-next-line no-bitwise
      b.SHOW_ELEMENT | b.SHOW_COMMENT | b.SHOW_TEXT | b.SHOW_PROCESSING_INSTRUCTION | b.SHOW_CDATA_SECTION,
      null
    );
  }, Fe = function(e) {
    return e instanceof pe && (typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || !(e.attributes instanceof Z) || typeof e.removeAttribute != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function");
  }, pt = function(e) {
    return typeof z == "function" && e instanceof z;
  };
  function P(a, e, n) {
    ye(a, (o) => {
      o.call(t, e, n, ee);
    });
  }
  const Tt = function(e) {
    let n = null;
    if (P(A.beforeSanitizeElements, e, null), Fe(e))
      return D(e), !0;
    const o = E(e.nodeName);
    if (P(A.uponSanitizeElement, e, {
      tagName: o,
      allowedTags: T
    }), Te && e.hasChildNodes() && !pt(e.firstElementChild) && S(/<[/\w!]/g, e.innerHTML) && S(/<[/\w!]/g, e.textContent) || e.nodeType === de.progressingInstruction || Te && e.nodeType === de.comment && S(/<[/\w]/g, e.data))
      return D(e), !0;
    if (!($.tagCheck instanceof Function && $.tagCheck(o)) && (!T[o] || ae[o])) {
      if (!ae[o] && _t(o) && (m.tagNameCheck instanceof RegExp && S(m.tagNameCheck, o) || m.tagNameCheck instanceof Function && m.tagNameCheck(o)))
        return !1;
      if (ve && !J[o]) {
        const f = C(e) || e.parentNode, h = w(e) || e.childNodes;
        if (h && f) {
          const d = h.length;
          for (let R = d - 1; R >= 0; --R) {
            const k = re(h[R], !0);
            k.__removalCount = (e.__removalCount || 0) + 1, f.insertBefore(k, H(e));
          }
        }
      }
      return D(e), !0;
    }
    return e instanceof K && !jt(e) || (o === "noscript" || o === "noembed" || o === "noframes") && S(/<\/no(script|embed|frames)/i, e.innerHTML) ? (D(e), !0) : (V && e.nodeType === de.text && (n = e.textContent, ye([Me, Ie, be], (f) => {
      n = ue(n, f, " ");
    }), e.textContent !== n && (ce(t.removed, {
      element: e.cloneNode()
    }), e.textContent = n)), P(A.afterSanitizeElements, e, null), !1);
  }, Et = function(e, n, o) {
    if (ot && (n === "id" || n === "name") && (o in i || o in Vt))
      return !1;
    if (!(De && !Ce[n] && S(zt, n))) {
      if (!(et && S(Ht, n))) {
        if (!($.attributeCheck instanceof Function && $.attributeCheck(n, e))) {
          if (!_[n] || Ce[n]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(_t(e) && (m.tagNameCheck instanceof RegExp && S(m.tagNameCheck, e) || m.tagNameCheck instanceof Function && m.tagNameCheck(e)) && (m.attributeNameCheck instanceof RegExp && S(m.attributeNameCheck, n) || m.attributeNameCheck instanceof Function && m.attributeNameCheck(n, e)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              n === "is" && m.allowCustomizedBuiltInElements && (m.tagNameCheck instanceof RegExp && S(m.tagNameCheck, o) || m.tagNameCheck instanceof Function && m.tagNameCheck(o)))
            ) return !1;
          } else if (!xe[n]) {
            if (!S(qe, ue(o, je, ""))) {
              if (!((n === "src" || n === "xlink:href" || n === "href") && e !== "script" && rn(o, "data:") === 0 && at[e])) {
                if (!(tt && !S(Bt, ue(o, je, "")))) {
                  if (o)
                    return !1;
                }
              }
            }
          }
        }
      }
    }
    return !0;
  }, _t = function(e) {
    return e !== "annotation-xml" && He(e, Wt);
  }, gt = function(e) {
    P(A.beforeSanitizeAttributes, e, null);
    const {
      attributes: n
    } = e;
    if (!n || Fe(e))
      return;
    const o = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: _,
      forceKeepAttr: void 0
    };
    let f = n.length;
    for (; f--; ) {
      const h = n[f], {
        name: d,
        namespaceURI: R,
        value: k
      } = h, te = E(d), Ge = k;
      let g = d === "value" ? Ge : an(Ge);
      if (o.attrName = te, o.attrValue = g, o.keepAttr = !0, o.forceKeepAttr = void 0, P(A.uponSanitizeAttribute, e, o), g = o.attrValue, it && (te === "id" || te === "name") && (Y(d, e), g = Yt + g), Te && S(/((--!?|])>)|<\/(style|title|textarea)/i, g)) {
        Y(d, e);
        continue;
      }
      if (te === "attributename" && He(g, "href")) {
        Y(d, e);
        continue;
      }
      if (o.forceKeepAttr)
        continue;
      if (!o.keepAttr) {
        Y(d, e);
        continue;
      }
      if (!nt && S(/\/>/i, g)) {
        Y(d, e);
        continue;
      }
      V && ye([Me, Ie, be], (At) => {
        g = ue(g, At, " ");
      });
      const ht = E(e.nodeName);
      if (!Et(ht, te, g)) {
        Y(d, e);
        continue;
      }
      if (p && typeof F == "object" && typeof F.getAttributeType == "function" && !R)
        switch (F.getAttributeType(ht, te)) {
          case "TrustedHTML": {
            g = p.createHTML(g);
            break;
          }
          case "TrustedScriptURL": {
            g = p.createScriptURL(g);
            break;
          }
        }
      if (g !== Ge)
        try {
          R ? e.setAttributeNS(R, d, g) : e.setAttribute(d, g), Fe(e) ? D(e) : yt(t.removed);
        } catch {
          Y(d, e);
        }
    }
    P(A.afterSanitizeAttributes, e, null);
  }, qt = function a(e) {
    let n = null;
    const o = dt(e);
    for (P(A.beforeSanitizeShadowDOM, e, null); n = o.nextNode(); )
      P(A.uponSanitizeShadowNode, n, null), Tt(n), gt(n), n.content instanceof u && a(n.content);
    P(A.afterSanitizeShadowDOM, e, null);
  };
  return t.sanitize = function(a) {
    let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = null, o = null, f = null, h = null;
    if (Pe = !a, Pe && (a = "<!-->"), typeof a != "string" && !pt(a))
      if (typeof a.toString == "function") {
        if (a = a.toString(), typeof a != "string")
          throw fe("dirty is not a string, aborting");
      } else
        throw fe("toString is not a function");
    if (!t.isSupported)
      return a;
    if (Ne || Ue(e), t.removed = [], typeof a == "string" && (se = !1), se) {
      if (a.nodeName) {
        const k = E(a.nodeName);
        if (!T[k] || ae[k])
          throw fe("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (a instanceof z)
      n = mt("<!---->"), o = n.ownerDocument.importNode(a, !0), o.nodeType === de.element && o.nodeName === "BODY" || o.nodeName === "HTML" ? n = o : n.appendChild(o);
    else {
      if (!j && !V && !W && // eslint-disable-next-line unicorn/prefer-includes
      a.indexOf("<") === -1)
        return p && _e ? p.createHTML(a) : a;
      if (n = mt(a), !n)
        return j ? null : _e ? v : "";
    }
    n && we && D(n.firstChild);
    const d = dt(se ? a : n);
    for (; f = d.nextNode(); )
      Tt(f), gt(f), f.content instanceof u && qt(f.content);
    if (se)
      return a;
    if (j) {
      if (Ee)
        for (h = Ut.call(n.ownerDocument); n.firstChild; )
          h.appendChild(n.firstChild);
      else
        h = n;
      return (_.shadowroot || _.shadowrootmode) && (h = Gt.call(s, h, !0)), h;
    }
    let R = W ? n.outerHTML : n.innerHTML;
    return W && T["!doctype"] && n.ownerDocument && n.ownerDocument.doctype && n.ownerDocument.doctype.name && S(xt, n.ownerDocument.doctype.name) && (R = "<!DOCTYPE " + n.ownerDocument.doctype.name + `>
` + R), V && ye([Me, Ie, be], (k) => {
      R = ue(R, k, " ");
    }), p && _e ? p.createHTML(R) : R;
  }, t.setConfig = function() {
    let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Ue(a), Ne = !0;
  }, t.clearConfig = function() {
    ee = null, Ne = !1;
  }, t.isValidAttribute = function(a, e, n) {
    ee || Ue({});
    const o = E(a), f = E(e);
    return Et(o, f, n);
  }, t.addHook = function(a, e) {
    typeof e == "function" && ce(A[a], e);
  }, t.removeHook = function(a, e) {
    if (e !== void 0) {
      const n = nn(A[a], e);
      return n === -1 ? void 0 : on(A[a], n, 1)[0];
    }
    return yt(A[a]);
  }, t.removeHooks = function(a) {
    A[a] = [];
  }, t.removeAllHooks = function() {
    A = bt();
  }, t;
}
var Sn = Pt();
window.v0ContentScriptInjected = !0;
console.log("[v0][CS] Content script loaded");
(async function() {
  try {
    const t = location.hostname, { [oe.BLACKLIST]: i } = await chrome.storage.local.get(oe.BLACKLIST);
    if (i && Array.isArray(i) && i.some((l) => {
      const u = typeof l == "string" ? l : l.domain;
      return t === u || t.endsWith("." + u);
    })) {
      console.log("[v0][CS] Blocked domain loaded from cache, redirecting...");
      const l = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(t)}`);
      location.href = l;
      return;
    }
  } catch (t) {
    console.error("[v0][CS] Failed to check blocked domain:", t);
  }
})();
let Ct = !1;
chrome.runtime.onMessage.addListener((r, t, i) => {
  try {
    if (r?.type === Nt.TOGGLE_ZEN_MODE)
      return On(r.payload?.preset), i?.({ success: !0 }), !0;
  } catch (s) {
    console.warn("[v0][CS] TOGGLE_ZEN_MODE failed:", s), i?.({ success: !1, error: String(s) });
  }
  return !1;
});
const Dt = async () => {
  if (!Ct) {
    Ct = !0;
    try {
      const r = document.body?.innerText?.slice(0, Jt) ?? "", t = location.href, i = await yn(r, t), s = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: Nt.CONTENT_ANALYSIS_RESULT, id: s, source: "content-script", ts: Date.now(), payload: { result: i } }, (l) => {
        const u = chrome.runtime.lastError;
        u && !u.message.includes("Receiving end does not exist") && !u.message.includes("message channel closed") && console.warn("[v0][CS] Content analysis message error:", u.message);
      });
    } catch (r) {
      console.error("[v0][CS] analyzePageContent error:", r);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? Dt() : document.addEventListener("DOMContentLoaded", Dt, { once: !0 });
async function yn(r, t) {
  const { [oe.SETTINGS]: i } = await chrome.storage.sync.get(oe.SETTINGS), s = i?.productiveKeywords || [], l = i?.distractingKeywords || [], u = r.toLowerCase();
  t.toLowerCase();
  const I = document.title.toLowerCase(), z = document.querySelector('meta[name="description"]')?.getAttribute("content")?.toLowerCase() || "", K = `${u} ${I} ${z}`;
  let b = 0, Z = 0;
  const pe = (H) => H.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  s.forEach((H) => {
    const w = new RegExp(`\\b${pe(H)}\\b`, "gi"), C = K.match(w);
    if (C) {
      const p = C.length, v = I.match(w)?.length || 0, B = z.match(w)?.length || 0;
      b += p + v * 2 + B * 1.5;
    }
  }), l.forEach((H) => {
    const w = new RegExp(`\\b${pe(H)}\\b`, "gi"), C = K.match(w);
    if (C) {
      const p = C.length, v = I.match(w)?.length || 0, B = z.match(w)?.length || 0;
      Z += p + v * 2 + B * 1.5;
    }
  });
  const ie = b + Z, F = ie > 0 ? Z / ie : 0, G = K.length, re = ie / Math.max(G / 1e3, 1);
  let X = "neutral";
  return F > 0.6 && re > 0.5 ? X = "distracting" : F < 0.4 && b > 0 && re > 0.3 && (X = "productive"), {
    url: t,
    classification: X,
    score: F,
    categories: {
      productiveScore: b,
      distractingScore: Z,
      keywordDensity: re,
      textLength: G
    },
    flagged: X === "distracting"
  };
}
let Ze = !1, ne = null, Le = "", N = null;
function On(r) {
  if (Ze) {
    const t = document.getElementById("zen-mode-styles");
    t && t.remove(), document.body.classList.remove("zen-mode"), window.location.hostname.includes("youtube.com") || (ne !== null && (document.body.innerHTML = "", document.body.appendChild(ne.cloneNode(!0)), document.body.style.background = Le, ne = null, Le = ""), N && (N.remove(), N = null)), Ze = !1, console.log("[v0][CS] Zen Mode deactivated");
  } else {
    const t = document.createDocumentFragment();
    for (; document.body.firstChild; )
      t.appendChild(document.body.firstChild);
    ne = t, Le = document.body.style.background || "", Rn(r), Ze = !0, console.log("[v0][CS] Zen Mode activated");
  }
}
function Rn(r) {
  try {
    r && Mn(r);
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
      const i = Ln();
      if (N && N.remove(), N = document.createElement("div"), N.id = "zen-mode-container", i.trim())
        if (!/<[^>]*>/g.test(i))
          N.textContent = i;
        else {
          const l = Sn.sanitize(i, {
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
          N.innerHTML = l;
        }
      document.body.appendChild(N);
    }
  } catch (t) {
    throw console.error("[v0][CS] Error applying Zen Mode:", t), ne !== null && (document.body.innerHTML = "", document.body.appendChild(ne.cloneNode(!0)), document.body.style.background = Le), t;
  }
}
function Ln() {
  if (window.location.hostname.includes("youtube.com")) {
    const s = document.querySelector("#primary #contents") || document.querySelector("#primary") || document.querySelector("#contents");
    if (s) return s.innerHTML;
  }
  const r = document.querySelector("article"), t = document.querySelector("main"), i = document.querySelector('[role="main"]');
  return r ? r.innerHTML : t ? t.innerHTML : i ? i.innerHTML : document.body.innerHTML;
}
async function Mn(r) {
  try {
    const { [oe.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(
      oe.SITE_CUSTOMIZATIONS
    ), i = t?.[r];
    i?.selectorsToRemove && i.selectorsToRemove.forEach((s) => {
      document.querySelectorAll(s).forEach((l) => l.remove());
    });
  } catch (t) {
    console.warn("[v0][CS] applyPreset failed:", t);
  }
}
