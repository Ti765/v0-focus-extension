const H = {
  BLACKLIST: "blacklist",
  TIME_LIMITS: "timeLimits",
  DAILY_USAGE: "dailyUsage",
  POMODORO_STATUS: "pomodoroStatus",
  SITE_CUSTOMIZATIONS: "siteCustomizations",
  SETTINGS: "settings",
  CURRENTLY_TRACKING: "currentlyTracking"
  // Chave para persistir a aba ativa na sessão
}, tn = 1e4, $e = {
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
  entries: xt,
  setPrototypeOf: Ot,
  isFrozen: nn,
  getPrototypeOf: on,
  getOwnPropertyDescriptor: rn
} = Object;
let {
  freeze: y,
  seal: L,
  create: je
} = Object, {
  apply: Ve,
  construct: qe
} = typeof Reflect < "u" && Reflect;
y || (y = function(t) {
  return t;
});
L || (L = function(t) {
  return t;
});
Ve || (Ve = function(t, i) {
  for (var r = arguments.length, l = new Array(r > 2 ? r - 2 : 0), u = 2; u < r; u++)
    l[u - 2] = arguments[u];
  return t.apply(i, l);
});
qe || (qe = function(t) {
  for (var i = arguments.length, r = new Array(i > 1 ? i - 1 : 0), l = 1; l < i; l++)
    r[l - 1] = arguments[l];
  return new t(...r);
});
const ye = O(Array.prototype.forEach), an = O(Array.prototype.lastIndexOf), Rt = O(Array.prototype.pop), ce = O(Array.prototype.push), sn = O(Array.prototype.splice), Le = O(String.prototype.toLowerCase), Ge = O(String.prototype.toString), Be = O(String.prototype.match), ue = O(String.prototype.replace), ln = O(String.prototype.indexOf), cn = O(String.prototype.trim), b = O(Object.prototype.hasOwnProperty), S = O(RegExp.prototype.test), me = un(TypeError);
function O(o) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var i = arguments.length, r = new Array(i > 1 ? i - 1 : 0), l = 1; l < i; l++)
      r[l - 1] = arguments[l];
    return Ve(o, t, r);
  };
}
function un(o) {
  return function() {
    for (var t = arguments.length, i = new Array(t), r = 0; r < t; r++)
      i[r] = arguments[r];
    return qe(o, i);
  };
}
function c(o, t) {
  let i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Le;
  Ot && Ot(o, null);
  let r = t.length;
  for (; r--; ) {
    let l = t[r];
    if (typeof l == "string") {
      const u = i(l);
      u !== l && (nn(t) || (t[r] = u), l = u);
    }
    o[l] = !0;
  }
  return o;
}
function mn(o) {
  for (let t = 0; t < o.length; t++)
    b(o, t) || (o[t] = null);
  return o;
}
function k(o) {
  const t = je(null);
  for (const [i, r] of xt(o))
    b(o, i) && (Array.isArray(r) ? t[i] = mn(r) : r && typeof r == "object" && r.constructor === Object ? t[i] = k(r) : t[i] = r);
  return t;
}
function de(o, t) {
  for (; o !== null; ) {
    const r = rn(o, t);
    if (r) {
      if (r.get)
        return O(r.get);
      if (typeof r.value == "function")
        return O(r.value);
    }
    o = on(o);
  }
  function i() {
    return null;
  }
  return i;
}
const Lt = y(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), We = y(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Ye = y(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), dn = y(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ke = y(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), fn = y(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), bt = y(["#text"]), It = y(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Ze = y(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ct = y(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Oe = y(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), pn = L(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Tn = L(/<%[\w\W]*|[\w\W]*%>/gm), hn = L(/\$\{[\w\W]*/gm), En = L(/^data-[\-\w.\u00B7-\uFFFF]+$/), gn = L(/^aria-[\-\w]+$/), Pt = L(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), _n = L(/^(?:\w+script|data):/i), An = L(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Ut = L(/^html$/i), Sn = L(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Mt = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: gn,
  ATTR_WHITESPACE: An,
  CUSTOM_ELEMENT: Sn,
  DATA_ATTR: En,
  DOCTYPE_NAME: Ut,
  ERB_EXPR: Tn,
  IS_ALLOWED_URI: Pt,
  IS_SCRIPT_OR_DATA: _n,
  MUSTACHE_EXPR: pn,
  TMPLIT_EXPR: hn
});
const fe = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, yn = function() {
  return typeof window > "u" ? null : window;
}, On = function(t, i) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let r = null;
  const l = "data-tt-policy-suffix";
  i && i.hasAttribute(l) && (r = i.getAttribute(l));
  const u = "dompurify" + (r ? "#" + r : "");
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
}, Dt = function() {
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
function kt() {
  let o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : yn();
  const t = (s) => kt(s);
  if (t.version = "3.3.0", t.removed = [], !o || !o.document || o.document.nodeType !== fe.document || !o.Element)
    return t.isSupported = !1, t;
  let {
    document: i
  } = o;
  const r = i, l = r.currentScript, {
    DocumentFragment: u,
    HTMLTemplateElement: I,
    Node: G,
    Element: Z,
    NodeFilter: C,
    NamedNodeMap: X = o.NamedNodeMap || o.MozNamedAttrMap,
    HTMLFormElement: pe,
    DOMParser: ie,
    trustedTypes: F
  } = o, z = Z.prototype, re = de(z, "cloneNode"), $ = de(z, "remove"), B = de(z, "nextSibling"), w = de(z, "childNodes"), M = de(z, "parentNode");
  if (typeof I == "function") {
    const s = i.createElement("template");
    s.content && s.content.ownerDocument && (i = s.content.ownerDocument);
  }
  let p, v = "";
  const {
    implementation: W,
    createNodeIterator: zt,
    createDocumentFragment: Ht,
    getElementsByTagName: Gt
  } = i, {
    importNode: Bt
  } = r;
  let A = Dt();
  t.isSupported = typeof xt == "function" && typeof M == "function" && W && W.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: Ie,
    ERB_EXPR: Ce,
    TMPLIT_EXPR: Me,
    DATA_ATTR: Wt,
    ARIA_ATTR: Yt,
    IS_SCRIPT_OR_DATA: Kt,
    ATTR_WHITESPACE: Je,
    CUSTOM_ELEMENT: Zt
  } = Mt;
  let {
    IS_ALLOWED_URI: Qe
  } = Mt, T = null;
  const et = c({}, [...Lt, ...We, ...Ye, ...Ke, ...bt]);
  let E = null;
  const tt = c({}, [...It, ...Ze, ...Ct, ...Oe]);
  let d = Object.seal(je(null, {
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
  })), ae = null, De = null;
  const j = Object.seal(je(null, {
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
  let nt = !0, Ne = !0, ot = !1, it = !0, V = !1, Te = !0, Y = !1, we = !1, ve = !1, q = !1, he = !1, Ee = !1, rt = !0, at = !1;
  const Xt = "user-content-";
  let xe = !0, se = !1, J = {}, Q = null;
  const st = c({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let lt = null;
  const ct = c({}, ["audio", "video", "img", "source", "image", "track"]);
  let Pe = null;
  const ut = c({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), ge = "http://www.w3.org/1998/Math/MathML", _e = "http://www.w3.org/2000/svg", x = "http://www.w3.org/1999/xhtml";
  let ee = x, Ue = !1, ke = null;
  const $t = c({}, [ge, _e, x], Ge);
  let Ae = c({}, ["mi", "mo", "mn", "ms", "mtext"]), Se = c({}, ["annotation-xml"]);
  const jt = c({}, ["title", "style", "font", "a", "script"]);
  let le = null;
  const Vt = ["application/xhtml+xml", "text/html"], qt = "text/html";
  let h = null, te = null;
  const Jt = i.createElement("form"), mt = function(e) {
    return e instanceof RegExp || e instanceof Function;
  }, Fe = function() {
    let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(te && te === e)) {
      if ((!e || typeof e != "object") && (e = {}), e = k(e), le = // eslint-disable-next-line unicorn/prefer-includes
      Vt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? qt : e.PARSER_MEDIA_TYPE, h = le === "application/xhtml+xml" ? Ge : Le, T = b(e, "ALLOWED_TAGS") ? c({}, e.ALLOWED_TAGS, h) : et, E = b(e, "ALLOWED_ATTR") ? c({}, e.ALLOWED_ATTR, h) : tt, ke = b(e, "ALLOWED_NAMESPACES") ? c({}, e.ALLOWED_NAMESPACES, Ge) : $t, Pe = b(e, "ADD_URI_SAFE_ATTR") ? c(k(ut), e.ADD_URI_SAFE_ATTR, h) : ut, lt = b(e, "ADD_DATA_URI_TAGS") ? c(k(ct), e.ADD_DATA_URI_TAGS, h) : ct, Q = b(e, "FORBID_CONTENTS") ? c({}, e.FORBID_CONTENTS, h) : st, ae = b(e, "FORBID_TAGS") ? c({}, e.FORBID_TAGS, h) : k({}), De = b(e, "FORBID_ATTR") ? c({}, e.FORBID_ATTR, h) : k({}), J = b(e, "USE_PROFILES") ? e.USE_PROFILES : !1, nt = e.ALLOW_ARIA_ATTR !== !1, Ne = e.ALLOW_DATA_ATTR !== !1, ot = e.ALLOW_UNKNOWN_PROTOCOLS || !1, it = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, V = e.SAFE_FOR_TEMPLATES || !1, Te = e.SAFE_FOR_XML !== !1, Y = e.WHOLE_DOCUMENT || !1, q = e.RETURN_DOM || !1, he = e.RETURN_DOM_FRAGMENT || !1, Ee = e.RETURN_TRUSTED_TYPE || !1, ve = e.FORCE_BODY || !1, rt = e.SANITIZE_DOM !== !1, at = e.SANITIZE_NAMED_PROPS || !1, xe = e.KEEP_CONTENT !== !1, se = e.IN_PLACE || !1, Qe = e.ALLOWED_URI_REGEXP || Pt, ee = e.NAMESPACE || x, Ae = e.MATHML_TEXT_INTEGRATION_POINTS || Ae, Se = e.HTML_INTEGRATION_POINTS || Se, d = e.CUSTOM_ELEMENT_HANDLING || {}, e.CUSTOM_ELEMENT_HANDLING && mt(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (d.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck), e.CUSTOM_ELEMENT_HANDLING && mt(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (d.attributeNameCheck = e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), e.CUSTOM_ELEMENT_HANDLING && typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (d.allowCustomizedBuiltInElements = e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), V && (Ne = !1), he && (q = !0), J && (T = c({}, bt), E = [], J.html === !0 && (c(T, Lt), c(E, It)), J.svg === !0 && (c(T, We), c(E, Ze), c(E, Oe)), J.svgFilters === !0 && (c(T, Ye), c(E, Ze), c(E, Oe)), J.mathMl === !0 && (c(T, Ke), c(E, Ct), c(E, Oe))), e.ADD_TAGS && (typeof e.ADD_TAGS == "function" ? j.tagCheck = e.ADD_TAGS : (T === et && (T = k(T)), c(T, e.ADD_TAGS, h))), e.ADD_ATTR && (typeof e.ADD_ATTR == "function" ? j.attributeCheck = e.ADD_ATTR : (E === tt && (E = k(E)), c(E, e.ADD_ATTR, h))), e.ADD_URI_SAFE_ATTR && c(Pe, e.ADD_URI_SAFE_ATTR, h), e.FORBID_CONTENTS && (Q === st && (Q = k(Q)), c(Q, e.FORBID_CONTENTS, h)), xe && (T["#text"] = !0), Y && c(T, ["html", "head", "body"]), T.table && (c(T, ["tbody"]), delete ae.tbody), e.TRUSTED_TYPES_POLICY) {
        if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw me('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        p = e.TRUSTED_TYPES_POLICY, v = p.createHTML("");
      } else
        p === void 0 && (p = On(F, l)), p !== null && typeof v == "string" && (v = p.createHTML(""));
      y && y(e), te = e;
    }
  }, dt = c({}, [...We, ...Ye, ...dn]), ft = c({}, [...Ke, ...fn]), Qt = function(e) {
    let n = M(e);
    (!n || !n.tagName) && (n = {
      namespaceURI: ee,
      tagName: "template"
    });
    const a = Le(e.tagName), m = Le(n.tagName);
    return ke[e.namespaceURI] ? e.namespaceURI === _e ? n.namespaceURI === x ? a === "svg" : n.namespaceURI === ge ? a === "svg" && (m === "annotation-xml" || Ae[m]) : !!dt[a] : e.namespaceURI === ge ? n.namespaceURI === x ? a === "math" : n.namespaceURI === _e ? a === "math" && Se[m] : !!ft[a] : e.namespaceURI === x ? n.namespaceURI === _e && !Se[m] || n.namespaceURI === ge && !Ae[m] ? !1 : !ft[a] && (jt[a] || !dt[a]) : !!(le === "application/xhtml+xml" && ke[e.namespaceURI]) : !1;
  }, D = function(e) {
    ce(t.removed, {
      element: e
    });
    try {
      M(e).removeChild(e);
    } catch {
      $(e);
    }
  }, K = function(e, n) {
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
      if (q || he)
        try {
          D(n);
        } catch {
        }
      else
        try {
          n.setAttribute(e, "");
        } catch {
        }
  }, pt = function(e) {
    let n = null, a = null;
    if (ve)
      e = "<remove></remove>" + e;
    else {
      const f = Be(e, /^[\r\n\t ]+/);
      a = f && f[0];
    }
    le === "application/xhtml+xml" && ee === x && (e = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + e + "</body></html>");
    const m = p ? p.createHTML(e) : e;
    if (ee === x)
      try {
        n = new ie().parseFromString(m, le);
      } catch {
      }
    if (!n || !n.documentElement) {
      n = W.createDocument(ee, "template", null);
      try {
        n.documentElement.innerHTML = Ue ? v : m;
      } catch {
      }
    }
    const _ = n.body || n.documentElement;
    return e && a && _.insertBefore(i.createTextNode(a), _.childNodes[0] || null), ee === x ? Gt.call(n, Y ? "html" : "body")[0] : Y ? n.documentElement : _;
  }, Tt = function(e) {
    return zt.call(
      e.ownerDocument || e,
      e,
      // eslint-disable-next-line no-bitwise
      C.SHOW_ELEMENT | C.SHOW_COMMENT | C.SHOW_TEXT | C.SHOW_PROCESSING_INSTRUCTION | C.SHOW_CDATA_SECTION,
      null
    );
  }, ze = function(e) {
    return e instanceof pe && (typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || !(e.attributes instanceof X) || typeof e.removeAttribute != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function");
  }, ht = function(e) {
    return typeof G == "function" && e instanceof G;
  };
  function P(s, e, n) {
    ye(s, (a) => {
      a.call(t, e, n, te);
    });
  }
  const Et = function(e) {
    let n = null;
    if (P(A.beforeSanitizeElements, e, null), ze(e))
      return D(e), !0;
    const a = h(e.nodeName);
    if (P(A.uponSanitizeElement, e, {
      tagName: a,
      allowedTags: T
    }), Te && e.hasChildNodes() && !ht(e.firstElementChild) && S(/<[/\w!]/g, e.innerHTML) && S(/<[/\w!]/g, e.textContent) || e.nodeType === fe.progressingInstruction || Te && e.nodeType === fe.comment && S(/<[/\w]/g, e.data))
      return D(e), !0;
    if (!(j.tagCheck instanceof Function && j.tagCheck(a)) && (!T[a] || ae[a])) {
      if (!ae[a] && _t(a) && (d.tagNameCheck instanceof RegExp && S(d.tagNameCheck, a) || d.tagNameCheck instanceof Function && d.tagNameCheck(a)))
        return !1;
      if (xe && !Q[a]) {
        const m = M(e) || e.parentNode, _ = w(e) || e.childNodes;
        if (_ && m) {
          const f = _.length;
          for (let R = f - 1; R >= 0; --R) {
            const U = re(_[R], !0);
            U.__removalCount = (e.__removalCount || 0) + 1, m.insertBefore(U, B(e));
          }
        }
      }
      return D(e), !0;
    }
    return e instanceof Z && !Qt(e) || (a === "noscript" || a === "noembed" || a === "noframes") && S(/<\/no(script|embed|frames)/i, e.innerHTML) ? (D(e), !0) : (V && e.nodeType === fe.text && (n = e.textContent, ye([Ie, Ce, Me], (m) => {
      n = ue(n, m, " ");
    }), e.textContent !== n && (ce(t.removed, {
      element: e.cloneNode()
    }), e.textContent = n)), P(A.afterSanitizeElements, e, null), !1);
  }, gt = function(e, n, a) {
    if (rt && (n === "id" || n === "name") && (a in i || a in Jt))
      return !1;
    if (!(Ne && !De[n] && S(Wt, n))) {
      if (!(nt && S(Yt, n))) {
        if (!(j.attributeCheck instanceof Function && j.attributeCheck(n, e))) {
          if (!E[n] || De[n]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(_t(e) && (d.tagNameCheck instanceof RegExp && S(d.tagNameCheck, e) || d.tagNameCheck instanceof Function && d.tagNameCheck(e)) && (d.attributeNameCheck instanceof RegExp && S(d.attributeNameCheck, n) || d.attributeNameCheck instanceof Function && d.attributeNameCheck(n, e)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              n === "is" && d.allowCustomizedBuiltInElements && (d.tagNameCheck instanceof RegExp && S(d.tagNameCheck, a) || d.tagNameCheck instanceof Function && d.tagNameCheck(a)))
            ) return !1;
          } else if (!Pe[n]) {
            if (!S(Qe, ue(a, Je, ""))) {
              if (!((n === "src" || n === "xlink:href" || n === "href") && e !== "script" && ln(a, "data:") === 0 && lt[e])) {
                if (!(ot && !S(Kt, ue(a, Je, "")))) {
                  if (a)
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
    return e !== "annotation-xml" && Be(e, Zt);
  }, At = function(e) {
    P(A.beforeSanitizeAttributes, e, null);
    const {
      attributes: n
    } = e;
    if (!n || ze(e))
      return;
    const a = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: E,
      forceKeepAttr: void 0
    };
    let m = n.length;
    for (; m--; ) {
      const _ = n[m], {
        name: f,
        namespaceURI: R,
        value: U
      } = _, ne = h(f), He = U;
      let g = f === "value" ? He : cn(He);
      if (a.attrName = ne, a.attrValue = g, a.keepAttr = !0, a.forceKeepAttr = void 0, P(A.uponSanitizeAttribute, e, a), g = a.attrValue, at && (ne === "id" || ne === "name") && (K(f, e), g = Xt + g), Te && S(/((--!?|])>)|<\/(style|title|textarea)/i, g)) {
        K(f, e);
        continue;
      }
      if (ne === "attributename" && Be(g, "href")) {
        K(f, e);
        continue;
      }
      if (a.forceKeepAttr)
        continue;
      if (!a.keepAttr) {
        K(f, e);
        continue;
      }
      if (!it && S(/\/>/i, g)) {
        K(f, e);
        continue;
      }
      V && ye([Ie, Ce, Me], (yt) => {
        g = ue(g, yt, " ");
      });
      const St = h(e.nodeName);
      if (!gt(St, ne, g)) {
        K(f, e);
        continue;
      }
      if (p && typeof F == "object" && typeof F.getAttributeType == "function" && !R)
        switch (F.getAttributeType(St, ne)) {
          case "TrustedHTML": {
            g = p.createHTML(g);
            break;
          }
          case "TrustedScriptURL": {
            g = p.createScriptURL(g);
            break;
          }
        }
      if (g !== He)
        try {
          R ? e.setAttributeNS(R, f, g) : e.setAttribute(f, g), ze(e) ? D(e) : Rt(t.removed);
        } catch {
          K(f, e);
        }
    }
    P(A.afterSanitizeAttributes, e, null);
  }, en = function s(e) {
    let n = null;
    const a = Tt(e);
    for (P(A.beforeSanitizeShadowDOM, e, null); n = a.nextNode(); )
      P(A.uponSanitizeShadowNode, n, null), Et(n), At(n), n.content instanceof u && s(n.content);
    P(A.afterSanitizeShadowDOM, e, null);
  };
  return t.sanitize = function(s) {
    let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = null, a = null, m = null, _ = null;
    if (Ue = !s, Ue && (s = "<!-->"), typeof s != "string" && !ht(s))
      if (typeof s.toString == "function") {
        if (s = s.toString(), typeof s != "string")
          throw me("dirty is not a string, aborting");
      } else
        throw me("toString is not a function");
    if (!t.isSupported)
      return s;
    if (we || Fe(e), t.removed = [], typeof s == "string" && (se = !1), se) {
      if (s.nodeName) {
        const U = h(s.nodeName);
        if (!T[U] || ae[U])
          throw me("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (s instanceof G)
      n = pt("<!---->"), a = n.ownerDocument.importNode(s, !0), a.nodeType === fe.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? n = a : n.appendChild(a);
    else {
      if (!q && !V && !Y && // eslint-disable-next-line unicorn/prefer-includes
      s.indexOf("<") === -1)
        return p && Ee ? p.createHTML(s) : s;
      if (n = pt(s), !n)
        return q ? null : Ee ? v : "";
    }
    n && ve && D(n.firstChild);
    const f = Tt(se ? s : n);
    for (; m = f.nextNode(); )
      Et(m), At(m), m.content instanceof u && en(m.content);
    if (se)
      return s;
    if (q) {
      if (he)
        for (_ = Ht.call(n.ownerDocument); n.firstChild; )
          _.appendChild(n.firstChild);
      else
        _ = n;
      return (E.shadowroot || E.shadowrootmode) && (_ = Bt.call(r, _, !0)), _;
    }
    let R = Y ? n.outerHTML : n.innerHTML;
    return Y && T["!doctype"] && n.ownerDocument && n.ownerDocument.doctype && n.ownerDocument.doctype.name && S(Ut, n.ownerDocument.doctype.name) && (R = "<!DOCTYPE " + n.ownerDocument.doctype.name + `>
` + R), V && ye([Ie, Ce, Me], (U) => {
      R = ue(R, U, " ");
    }), p && Ee ? p.createHTML(R) : R;
  }, t.setConfig = function() {
    let s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Fe(s), we = !0;
  }, t.clearConfig = function() {
    te = null, we = !1;
  }, t.isValidAttribute = function(s, e, n) {
    te || Fe({});
    const a = h(s), m = h(e);
    return gt(a, m, n);
  }, t.addHook = function(s, e) {
    typeof e == "function" && ce(A[s], e);
  }, t.removeHook = function(s, e) {
    if (e !== void 0) {
      const n = an(A[s], e);
      return n === -1 ? void 0 : sn(A[s], n, 1)[0];
    }
    return Rt(A[s]);
  }, t.removeHooks = function(s) {
    A[s] = [];
  }, t.removeAllHooks = function() {
    A = Dt();
  }, t;
}
var Rn = kt();
const Re = {
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
    const t = location.hostname, { [H.BLACKLIST]: i } = await chrome.storage.local.get(H.BLACKLIST);
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
let Nt = !1;
chrome.runtime.onMessage.addListener((o, t, i) => {
  try {
    if (o?.type === $e.TOGGLE_ZEN_MODE)
      return bn(o.payload?.preset), i?.({ success: !0 }), !0;
    if (o?.type === $e.SITE_CUSTOMIZATION_UPDATED) {
      const r = o.payload;
      if (r?.domain === "youtube.com" && window.location.hostname.includes("youtube.com"))
        return Ft(r.config), i?.({ success: !0 }), !0;
    }
  } catch (r) {
    console.warn("[v0][CS] Message handler failed:", r), i?.({ success: !1, error: String(r) });
  }
  return !1;
});
const wt = async () => {
  if (!Nt) {
    Nt = !0;
    try {
      const o = document.body?.innerText?.slice(0, tn) ?? "", t = location.href, i = await Ln(o, t), r = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      await chrome.runtime.sendMessage({ type: $e.CONTENT_ANALYSIS_RESULT, id: r, source: "content-script", ts: Date.now(), payload: { result: i } }, (l) => {
        const u = chrome.runtime.lastError;
        u && !u.message.includes("Receiving end does not exist") && !u.message.includes("message channel closed") && console.warn("[v0][CS] Content analysis message error:", u.message);
      });
    } catch (o) {
      console.error("[v0][CS] analyzePageContent error:", o);
    }
  }
};
document.readyState === "complete" || document.readyState === "interactive" ? wt() : document.addEventListener("DOMContentLoaded", wt, { once: !0 });
window.location.hostname.includes("youtube.com") && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => vt(), { once: !0 }) : vt());
async function Ln(o, t) {
  const { [H.SETTINGS]: i } = await chrome.storage.sync.get(H.SETTINGS), r = i?.productiveKeywords || [], l = i?.distractingKeywords || [], u = o.toLowerCase();
  t.toLowerCase();
  const I = document.title.toLowerCase(), G = document.querySelector('meta[name="description"]')?.getAttribute("content")?.toLowerCase() || "", Z = `${u} ${I} ${G}`;
  let C = 0, X = 0;
  const pe = (B) => B.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  r.forEach((B) => {
    const w = new RegExp(`\\b${pe(B)}\\b`, "gi"), M = Z.match(w);
    if (M) {
      const p = M.length, v = I.match(w)?.length || 0, W = G.match(w)?.length || 0;
      C += p + v * 2 + W * 1.5;
    }
  }), l.forEach((B) => {
    const w = new RegExp(`\\b${pe(B)}\\b`, "gi"), M = Z.match(w);
    if (M) {
      const p = M.length, v = I.match(w)?.length || 0, W = G.match(w)?.length || 0;
      X += p + v * 2 + W * 1.5;
    }
  });
  const ie = C + X, F = ie > 0 ? X / ie : 0, z = Z.length, re = ie / Math.max(z / 1e3, 1);
  let $ = "neutral";
  return F > 0.6 && re > 0.5 ? $ = "distracting" : F < 0.4 && C > 0 && re > 0.3 && ($ = "productive"), {
    url: t,
    classification: $,
    score: F,
    categories: {
      productiveScore: C,
      distractingScore: X,
      keywordDensity: re,
      textLength: z
    },
    flagged: $ === "distracting"
  };
}
function Ft(o) {
  const t = [];
  o.hideHomepage && t.push(...Re.hideHomepage), o.hideShorts && t.push(...Re.hideShorts), o.hideComments && t.push(...Re.hideComments), o.hideRecommendations && t.push(...Re.hideRecommendations);
  const i = document.getElementById("v0-youtube-customization");
  if (i && i.remove(), t.length > 0) {
    const r = document.createElement("style");
    r.id = "v0-youtube-customization", r.textContent = t.map((l) => `${l} { display: none !important; }`).join(`
`), document.head.appendChild(r);
  }
}
async function vt() {
  if (window.location.hostname.includes("youtube.com"))
    try {
      const { [H.SITE_CUSTOMIZATIONS]: o } = await chrome.storage.local.get(H.SITE_CUSTOMIZATIONS), t = o?.["youtube.com"];
      t && (Ft(t), console.log("[v0][CS] YouTube customization applied:", t));
    } catch (o) {
      console.error("[v0][CS] Failed to load YouTube customization:", o);
    }
}
let Xe = !1, oe = null, be = "", N = null;
function bn(o) {
  if (Xe) {
    const t = document.getElementById("zen-mode-styles");
    t && t.remove(), document.body.classList.remove("zen-mode"), window.location.hostname.includes("youtube.com") || (oe !== null && (document.body.innerHTML = "", document.body.appendChild(oe.cloneNode(!0)), document.body.style.background = be, oe = null, be = ""), N && (N.remove(), N = null)), Xe = !1, console.log("[v0][CS] Zen Mode deactivated");
  } else {
    const t = document.createDocumentFragment();
    for (; document.body.firstChild; )
      t.appendChild(document.body.firstChild);
    oe = t, be = document.body.style.background || "", In(o), Xe = !0, console.log("[v0][CS] Zen Mode activated");
  }
}
function In(o) {
  try {
    o && Mn(o);
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
      const i = Cn();
      if (N && N.remove(), N = document.createElement("div"), N.id = "zen-mode-container", i.trim())
        if (!/<[^>]*>/g.test(i))
          N.textContent = i;
        else {
          const l = Rn.sanitize(i, {
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
    throw console.error("[v0][CS] Error applying Zen Mode:", t), oe !== null && (document.body.innerHTML = "", document.body.appendChild(oe.cloneNode(!0)), document.body.style.background = be), t;
  }
}
function Cn() {
  if (window.location.hostname.includes("youtube.com")) {
    const r = document.querySelector("#primary #contents") || document.querySelector("#primary") || document.querySelector("#contents");
    if (r) return r.innerHTML;
  }
  const o = document.querySelector("article"), t = document.querySelector("main"), i = document.querySelector('[role="main"]');
  return o ? o.innerHTML : t ? t.innerHTML : i ? i.innerHTML : document.body.innerHTML;
}
async function Mn(o) {
  try {
    const { [H.SITE_CUSTOMIZATIONS]: t } = await chrome.storage.local.get(
      H.SITE_CUSTOMIZATIONS
    ), i = t?.[o];
    i?.selectorsToRemove && i.selectorsToRemove.forEach((r) => {
      document.querySelectorAll(r).forEach((l) => l.remove());
    });
  } catch (t) {
    console.warn("[v0][CS] applyPreset failed:", t);
  }
}
