var I=Object.defineProperty;var O=(e,t,o)=>t in e?I(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var c=(e,t,o)=>O(e,typeof t!="symbol"?t+"":t,o);import{c as B,u as S,r as p,j as i,T as k,P as H,n as W,d as $,C as G,a as X,A as q,p as Y,b as K,e as Z,L as J,B as Q,f as ee,g as te,h as ie,i as re,k as oe,l as se,F as ae,m as ne,R as le}from"./index.js";/**
 * @license lucide-react v0.547.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],ue=B("external-link",ce);/**
 * @license lucide-react v0.547.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],he=B("play",de);/**
 * @license lucide-react v0.547.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],C=B("square",me);function fe(){const{blacklist:e,addToBlacklist:t,removeFromBlacklist:o,error:r,setError:a}=S(m=>({blacklist:m.blacklist,addToBlacklist:m.addToBlacklist,removeFromBlacklist:m.removeFromBlacklist,error:m.error,setError:m.setError})),[s,n]=p.useState(""),l=p.useRef(!1),d=p.useRef(null);p.useEffect(()=>()=>{d.current&&clearTimeout(d.current)},[]);function u(){d.current&&clearTimeout(d.current),d.current=setTimeout(()=>a(null),2500)}async function h(){const m=s.trim(),g=W(m);if(!g){a("Informe um domínio válido, por ex.: exemplo.com"),u();return}if(e?.includes(g)){a(`"${g}" já está na lista.`),u(),n("");return}if(!l.current){l.current=!0;try{$("[dbg] BlacklistManager.handleAdd -> normalized:",g),await t?.(g),n("")}catch{a("Falha ao adicionar. Tente novamente."),u()}finally{l.current=!1}}}async function f(m){if(!l.current){l.current=!0;try{await o?.(m)}catch{a("Falha ao remover. Tente novamente."),u()}finally{l.current=!1}}}return i.jsxs("div",{className:"space-y-4",children:[i.jsxs("div",{className:"glass-card p-4",children:[i.jsx("h2",{className:"text-xl font-semibold text-white",children:"Sites bloqueados"}),i.jsx("p",{className:"text-sm text-gray-400",children:"Adicione ou remova domínios que serão bloqueados."})]}),i.jsxs("div",{className:"glass-card p-4",children:[i.jsx("div",{className:"space-y-2 mb-3",children:!e||e.length===0?i.jsx("div",{className:"text-center py-6 text-gray-500",children:"Nenhum site bloqueado ainda."}):e.map(m=>{const g=typeof m=="string"?m:m&&typeof m=="object"&&"domain"in m?String(m.domain):String(m);return i.jsxs("div",{className:"flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10",children:[i.jsx("span",{className:"text-white font-mono text-sm",children:g}),i.jsx("button",{onClick:()=>f(g),className:"p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors","aria-label":`Remover ${g}`,children:i.jsx(k,{className:"w-4 h-4"})})]},g)})}),i.jsxs("div",{className:"flex gap-2",children:[i.jsx("input",{type:"text",placeholder:"exemplo.com",value:s,onChange:m=>n(m.target.value),onKeyDown:m=>m.key==="Enter"&&h(),className:"flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50","aria-label":"Novo domínio"}),i.jsxs("button",{onClick:h,disabled:l.current,className:"px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg transition-colors flex items-center gap-2 font-medium",children:[i.jsx(H,{className:"w-5 h-5"}),"Adicionar"]})]}),r&&i.jsx("p",{id:"blacklist-error",className:"text-xs text-red-400 mt-2",role:"alert","aria-live":"polite",children:r})]}),i.jsx("div",{className:"bg-blue-500/10 border border-blue-500/30 rounded-lg p-3",children:i.jsx("p",{className:"text-xs text-blue-300",children:"💡 Sites bloqueados não carregam durante o uso normal e também em sessões de foco."})})]})}const pe=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_objectHelperBox;

out vec2 v_responsiveUV;
out vec2 v_responsiveBoxSize;
out vec2 v_responsiveHelperBox;
out vec2 v_responsiveBoxGivenSize;

out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_patternHelperBox;

out vec2 v_imageUV;

// #define ADD_HELPERS

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================
  // Sizing api for graphic objects with fixed ratio
  // (currently supports only ratio = 1)

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  #ifdef ADD_HELPERS
  v_objectHelperBox = uv;
  v_objectHelperBox *= objectWorldScale;
  v_objectHelperBox += boxOrigin * (objectWorldScale - 1.);
  #endif

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;


  // ===================================================


  // ===================================================
  // Sizing api for graphic objects with either givenBoxSize ratio or canvas ratio.
  // Full-screen mode available with u_worldWidth = u_worldHeight = 0

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  v_responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / v_responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================


  // ===================================================
  // Sizing api for patterns
  // (treating graphics as a image u_worldWidth x u_worldHeight size)

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  #ifdef ADD_HELPERS
  v_patternHelperBox = uv;
  v_patternHelperBox *= patternBoxScale;
  v_patternHelperBox += boxOrigin * (patternBoxScale - 1.);
  #endif

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================


  // ===================================================
  // Sizing api for images

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  #ifdef ADD_HELPERS
  vec2 imageHelperBox = uv;
  imageHelperBox *= imageBoxScale;
  imageHelperBox += boxOrigin * (imageBoxScale - 1.);
  #endif

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;

  // ===================================================

}`,z=1920*1080*4;let ge=class{constructor(t,o,r,a,s=0,n=0,l=2,d=z){c(this,"parentElement");c(this,"canvasElement");c(this,"gl");c(this,"program",null);c(this,"uniformLocations",{});c(this,"fragmentShader");c(this,"rafId",null);c(this,"lastRenderTime",0);c(this,"currentFrame",0);c(this,"speed",0);c(this,"currentSpeed",0);c(this,"providedUniforms");c(this,"hasBeenDisposed",!1);c(this,"resolutionChanged",!0);c(this,"textures",new Map);c(this,"minPixelRatio");c(this,"maxPixelCount");c(this,"isSafari",be());c(this,"uniformCache",{});c(this,"textureUnitMap",new Map);c(this,"initProgram",()=>{const t=xe(this.gl,pe,this.fragmentShader);t&&(this.program=t)});c(this,"setupPositionAttribute",()=>{const t=this.gl.getAttribLocation(this.program,"a_position"),o=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,o);const r=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(r),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)});c(this,"setupUniforms",()=>{const t={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([o,r])=>{if(t[o]=this.gl.getUniformLocation(this.program,o),r instanceof HTMLImageElement){const a=`${o}AspectRatio`;t[a]=this.gl.getUniformLocation(this.program,a)}}),this.uniformLocations=t});c(this,"renderScale",1);c(this,"parentWidth",0);c(this,"parentHeight",0);c(this,"parentDevicePixelWidth",0);c(this,"parentDevicePixelHeight",0);c(this,"devicePixelsSupported",!1);c(this,"resizeObserver",null);c(this,"setupResizeObserver",()=>{this.resizeObserver=new ResizeObserver(([t])=>{if(t?.borderBoxSize[0]){const o=t.devicePixelContentBoxSize?.[0];o!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=o.inlineSize,this.parentDevicePixelHeight=o.blockSize),this.parentWidth=t.borderBoxSize[0].inlineSize,this.parentHeight=t.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)});c(this,"handleVisualViewportChange",()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()});c(this,"handleResize",()=>{let t=0,o=0;const r=Math.max(1,window.devicePixelRatio),a=visualViewport?.scale??1;if(this.devicePixelsSupported){const h=Math.max(1,this.minPixelRatio/r);t=this.parentDevicePixelWidth*h*a,o=this.parentDevicePixelHeight*h*a}else{let h=Math.max(r,this.minPixelRatio)*a;if(this.isSafari){const f=_e();h*=Math.max(1,f)}t=Math.round(this.parentWidth)*h,o=Math.round(this.parentHeight)*h}const s=Math.sqrt(this.maxPixelCount)/Math.sqrt(t*o),n=Math.min(1,s),l=Math.round(t*n),d=Math.round(o*n),u=l/Math.round(this.parentWidth);(this.canvasElement.width!==l||this.canvasElement.height!==d||this.renderScale!==u)&&(this.renderScale=u,this.canvasElement.width=l,this.canvasElement.height=d,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))});c(this,"render",t=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}const o=t-this.lastRenderTime;this.lastRenderTime=t,this.currentSpeed!==0&&(this.currentFrame+=o*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0?this.requestRender():this.rafId=null});c(this,"requestRender",()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)});c(this,"setTextureUniform",(t,o)=>{if(!o.complete||o.naturalWidth===0)throw new Error(`Paper Shaders: image for uniform ${t} must be fully loaded`);const r=this.textures.get(t);r&&this.gl.deleteTexture(r),this.textureUnitMap.has(t)||this.textureUnitMap.set(t,this.textureUnitMap.size);const a=this.textureUnitMap.get(t);this.gl.activeTexture(this.gl.TEXTURE0+a);const s=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,s),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o),t!=="u_noiseTexture"&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));const n=this.gl.getError();if(n!==this.gl.NO_ERROR||s===null){console.error("Paper Shaders: WebGL error when uploading texture:",n);return}this.textures.set(t,s);const l=this.uniformLocations[t];if(l){this.gl.uniform1i(l,a);const d=`${t}AspectRatio`,u=this.uniformLocations[d];if(u){const h=o.naturalWidth/o.naturalHeight;this.gl.uniform1f(u,h)}}});c(this,"areUniformValuesEqual",(t,o)=>t===o?!0:Array.isArray(t)&&Array.isArray(o)&&t.length===o.length?t.every((r,a)=>this.areUniformValuesEqual(r,o[a])):!1);c(this,"setUniformValues",t=>{this.gl.useProgram(this.program),Object.entries(t).forEach(([o,r])=>{let a=r;if(r instanceof HTMLImageElement&&(a=`${r.src.slice(0,200)}|${r.naturalWidth}x${r.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[o],a))return;this.uniformCache[o]=a;const s=this.uniformLocations[o];if(!s){console.warn(`Uniform location for ${o} not found`);return}if(r instanceof HTMLImageElement)this.setTextureUniform(o,r);else if(Array.isArray(r)){let n=null,l=null;if(r[0]!==void 0&&Array.isArray(r[0])){const d=r[0].length;if(r.every(u=>u.length===d))n=r.flat(),l=d;else{console.warn(`All child arrays must be the same length for ${o}`);return}}else n=r,l=n.length;switch(l){case 2:this.gl.uniform2fv(s,n);break;case 3:this.gl.uniform3fv(s,n);break;case 4:this.gl.uniform4fv(s,n);break;case 9:this.gl.uniformMatrix3fv(s,!1,n);break;case 16:this.gl.uniformMatrix4fv(s,!1,n);break;default:console.warn(`Unsupported uniform array length: ${l}`)}}else typeof r=="number"?this.gl.uniform1f(s,r):typeof r=="boolean"?this.gl.uniform1i(s,r?1:0):console.warn(`Unsupported uniform type for ${o}: ${typeof r}`)})});c(this,"getCurrentFrame",()=>this.currentFrame);c(this,"setFrame",t=>{this.currentFrame=t,this.lastRenderTime=performance.now(),this.render(performance.now())});c(this,"setSpeed",(t=1)=>{this.speed=t,this.setCurrentSpeed(document.hidden?0:t)});c(this,"setCurrentSpeed",t=>{this.currentSpeed=t,this.rafId===null&&t!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&t===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)});c(this,"setMaxPixelCount",(t=z)=>{this.maxPixelCount=t,this.handleResize()});c(this,"setMinPixelRatio",(t=2)=>{this.minPixelRatio=t,this.handleResize()});c(this,"setUniforms",t=>{this.setUniformValues(t),this.providedUniforms={...this.providedUniforms,...t},this.render(performance.now())});c(this,"handleDocumentVisibilityChange",()=>{this.setCurrentSpeed(document.hidden?0:this.speed)});c(this,"dispose",()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(t=>{this.gl.deleteTexture(t)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),document.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount});if(t instanceof HTMLElement)this.parentElement=t;else throw new Error("Paper Shaders: parent element must be an HTMLElement");if(!document.querySelector("style[data-paper-shader]")){const f=document.createElement("style");f.innerHTML=ve,f.setAttribute("data-paper-shader",""),document.head.prepend(f)}const u=document.createElement("canvas");this.canvasElement=u,this.parentElement.prepend(u),this.fragmentShader=o,this.providedUniforms=r,this.currentFrame=n,this.minPixelRatio=l,this.maxPixelCount=d;const h=u.getContext("webgl2",a);if(!h)throw new Error("Paper Shaders: WebGL is not supported in this browser");this.gl=h,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(s),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,document.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}};function N(e,t,o){const r=e.createShader(t);return r?(e.shaderSource(r,o),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(r)),e.deleteShader(r),null)):null}function xe(e,t,o){const r=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),a=r?r.precision:null;a&&a<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),o=o.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));const s=N(e,e.VERTEX_SHADER,t),n=N(e,e.FRAGMENT_SHADER,o);if(!s||!n)return null;const l=e.createProgram();return l?(e.attachShader(l,s),e.attachShader(l,n),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS)?(e.detachShader(l,s),e.detachShader(l,n),e.deleteShader(s),e.deleteShader(n),l):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(l)),e.deleteProgram(l),e.deleteShader(s),e.deleteShader(n),null)):null}const ve=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function be(){const e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")}function _e(){const e=visualViewport?.scale??1,t=visualViewport?.width??window.innerWidth,o=window.innerWidth-document.documentElement.clientWidth,r=e*t+o,a=outerWidth/r,s=Math.round(100*a);return s%5===0?s/100:s===33?1/3:s===67?2/3:s===133?4/3:a}const we=`
in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_patternUV;
in vec2 v_imageUV;`,Se=`
in vec2 v_objectBoxSize;
in vec2 v_objectHelperBox;
in vec2 v_responsiveBoxSize;
in vec2 v_responsiveHelperBox;
in vec2 v_patternBoxSize;
in vec2 v_patternHelperBox;`,ye=`
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;`,Re={fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},je={none:0,contain:1,cover:2},Ee=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,Ue=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,Be=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,M={maxColorCount:10},Ae=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${M.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${we}
${Se}
${ye}

out vec4 fragColor;

${Ee}
${Ue}
${Be}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + fract(float(i) / 3.) * .9;
  float c = .8 + fract(float(i + 1) / 4.);

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;
  shape_uv += .5;

  vec2 grainUV = v_objectUV;
  // apply inverse transform to grain_uv so it respects the originXY
  float grainUVRot = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(grainUVRot), sin(grainUVRot), -sin(grainUVRot), cos(grainUVRot));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  grainUV = transpose(graphicRotation) * grainUV;
  grainUV *= u_scale;
  grainUV *= .7;
  grainUV -= graphicOffset;
  grainUV *= v_objectBoxSize;
  
  float grain = noise(grainUV, vec2(0.));
  float mixerGrain = .4 * u_grainMixer * (grain - .5);

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., shape_uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${M.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  float rr = noise(rotate(grainUV, 1.), vec2(3.));
  float gg = noise(rotate(grainUV, 2.) + 10., vec2(-1.));
  float bb = noise(grainUV - 2., vec2(5.));
  vec3 grainColor = vec3(rr, gg, bb);
  color = mix(color, grainColor, .01 + .3 * u_grainOverlay);
  
  fragColor = vec4(color, opacity);
}
`;function ze(e){if(Array.isArray(e))return e.length===4?e:e.length===3?[...e,1]:E;if(typeof e!="string")return E;let t,o,r,a=1;if(e.startsWith("#"))[t,o,r,a]=Ne(e);else if(e.startsWith("rgb"))[t,o,r,a]=Me(e);else if(e.startsWith("hsl"))[t,o,r,a]=Pe(Te(e));else return console.error("Unsupported color format",e),E;return[w(t,0,1),w(o,0,1),w(r,0,1),w(a,0,1)]}function Ne(e){e=e.replace(/^#/,""),e.length===3&&(e=e.split("").map(s=>s+s).join("")),e.length===6&&(e=e+"ff");const t=parseInt(e.slice(0,2),16)/255,o=parseInt(e.slice(2,4),16)/255,r=parseInt(e.slice(4,6),16)/255,a=parseInt(e.slice(6,8),16)/255;return[t,o,r,a]}function Me(e){const t=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0")/255,parseInt(t[2]??"0")/255,parseInt(t[3]??"0")/255,t[4]===void 0?1:parseFloat(t[4])]:[0,0,0,1]}function Te(e){const t=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return t?[parseInt(t[1]??"0"),parseInt(t[2]??"0"),parseInt(t[3]??"0"),t[4]===void 0?1:parseFloat(t[4])]:[0,0,0,1]}function Pe(e){const[t,o,r,a]=e,s=t/360,n=o/100,l=r/100;let d,u,h;if(o===0)d=u=h=l;else{const f=(_,v,x)=>(x<0&&(x+=1),x>1&&(x-=1),x<.16666666666666666?_+(v-_)*6*x:x<.5?v:x<.6666666666666666?_+(v-_)*(.6666666666666666-x)*6:_),m=l<.5?l*(1+n):l+n-l*n,g=2*l-m;d=f(g,m,s+1/3),u=f(g,m,s),h=f(g,m,s-1/3)}return[d,u,h,a]}const w=(e,t,o)=>Math.min(Math.max(e,t),o),E=[0,0,0,1];function Ve(){if(typeof window>"u"){console.warn("Paper Shaders: can’t create an image on the server");return}const e=new Image;return e.src=Ce,e}const Ce="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";function Le(e){const t=p.useRef(void 0),o=p.useCallback(r=>{const a=e.map(s=>{if(s!=null){if(typeof s=="function"){const n=s,l=n(r);return typeof l=="function"?l:()=>{n(null)}}return s.current=r,()=>{s.current=null}}});return()=>{a.forEach(s=>s?.())}},e);return p.useMemo(()=>e.every(r=>r==null)?null:r=>{t.current&&(t.current(),t.current=void 0),r!=null&&(t.current=o(r))},e)}async function T(e){const t={},o=[],r=s=>{try{return s.startsWith("/")||new URL(s),!0}catch{return!1}},a=s=>{try{return s.startsWith("/")?!1:new URL(s,window.location.origin).origin!==window.location.origin}catch{return!1}};return Object.entries(e).forEach(([s,n])=>{if(typeof n=="string"){if(!n){t[s]=Ve();return}if(!r(n)){console.warn(`Uniform "${s}" has invalid URL "${n}". Skipping image loading.`);return}const l=new Promise((d,u)=>{const h=new Image;a(n)&&(h.crossOrigin="anonymous"),h.onload=()=>{t[s]=h,d()},h.onerror=()=>{console.error(`Could not set uniforms. Failed to load image at ${n}`),u()},h.src=n});o.push(l)}else t[s]=n}),await Promise.all(o),t}const L=p.forwardRef(function({fragmentShader:t,uniforms:o,webGlContextAttributes:r,speed:a=0,frame:s=0,width:n,height:l,minPixelRatio:d,maxPixelCount:u,style:h,...f},m){const[g,_]=p.useState(!1),v=p.useRef(null),x=p.useRef(null),y=p.useRef(r);p.useEffect(()=>((async()=>{const A=await T(o);v.current&&!x.current&&(x.current=new ge(v.current,t,A,y.current,a,s,d,u),_(!0))})(),()=>{x.current?.dispose(),x.current=null}),[t]),p.useEffect(()=>{let j=!1;return(async()=>{const F=await T(o);j||x.current?.setUniforms(F)})(),()=>{j=!0}},[o,g]),p.useEffect(()=>{x.current?.setSpeed(a)},[a,g]),p.useEffect(()=>{x.current?.setMaxPixelCount(u)},[u,g]),p.useEffect(()=>{x.current?.setMinPixelRatio(d)},[d,g]),p.useEffect(()=>{x.current?.setFrame(s)},[s,g]);const R=Le([v,m]);return i.jsx("div",{ref:R,style:n!==void 0||l!==void 0?{width:n,height:l,...h}:h,...f})});L.displayName="ShaderMount";function De(e,t){for(const o in e){if(o==="colors"){const r=Array.isArray(e.colors),a=Array.isArray(t.colors);if(!r||!a){if(Object.is(e.colors,t.colors)===!1)return!1;continue}if(e.colors?.length!==t.colors?.length||!e.colors?.every((s,n)=>s===t.colors?.[n]))return!1;continue}if(Object.is(e[o],t[o])===!1)return!1}return!0}const b={params:{...Re,speed:1,frame:0,colors:["#e0eaff","#241d9a","#f75092","#9f50d3"],distortion:.8,swirl:.1,grainMixer:0,grainOverlay:0}},Fe=p.memo(function({speed:t=b.params.speed,frame:o=b.params.frame,colors:r=b.params.colors,distortion:a=b.params.distortion,swirl:s=b.params.swirl,grainMixer:n=b.params.grainMixer,grainOverlay:l=b.params.grainOverlay,fit:d=b.params.fit,rotation:u=b.params.rotation,scale:h=b.params.scale,originX:f=b.params.originX,originY:m=b.params.originY,offsetX:g=b.params.offsetX,offsetY:_=b.params.offsetY,worldWidth:v=b.params.worldWidth,worldHeight:x=b.params.worldHeight,...y}){const R={u_colors:r.map(ze),u_colorsCount:r.length,u_distortion:a,u_swirl:s,u_grainMixer:n,u_grainOverlay:l,u_fit:je[d],u_rotation:u,u_scale:h,u_offsetX:g,u_offsetY:_,u_originX:f,u_originY:m,u_worldWidth:v,u_worldHeight:x};return i.jsx(L,{...y,speed:t,frame:o,fragmentShader:Ae,uniforms:R})},De);function Ie({speed:e=1,intensity:t=1,className:o=""}){const r=Math.max(e,.001);e<=0&&console.warn("[PomodoroShaderBackground] Invalid speed value:",e,"using minimum value 0.001");const a=["#000000","#1a0a00","#CC3700","#FF4400"];return i.jsxs("div",{className:`w-full h-full bg-black relative overflow-hidden ${o}`,children:[i.jsx(Fe,{className:"w-full h-full absolute inset-0",colors:a,speed:r*t,backgroundColor:"#000000"}),i.jsxs("div",{className:"absolute inset-0 pointer-events-none",style:{"--animation-speed":r},children:[i.jsx("div",{className:"shader-light-1 absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"}),i.jsx("div",{className:"shader-light-2 absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"}),i.jsx("div",{className:"shader-light-3 absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"})]})]})}const P={compact:{width:420,height:340,timerSize:"text-6xl",spacing:{indicator:"mb-5",timer:"mb-7",button:""}},medium:{width:480,height:380,timerSize:"text-7xl",spacing:{indicator:"mb-6",timer:"mb-8",button:""}},large:{width:560,height:440,timerSize:"text-8xl",spacing:{indicator:"mb-8",timer:"mb-10",button:""}}};function D(){const[e,t]=p.useState(null),[o,r]=p.useState({width:1920,height:1080,windowWidth:1920,windowHeight:1080});p.useEffect(()=>{const u=()=>{r({width:window.screen.width,height:window.screen.height,windowWidth:window.outerWidth,windowHeight:window.outerHeight})};return u(),window.addEventListener("resize",u),()=>window.removeEventListener("resize",u)},[]);const a=p.useMemo(()=>{const u=o.width*o.height;return u>3e6?"large":u>2e6?"medium":(u>1e6,"compact")},[o.width,o.height]),s=e||a;return{dimensions:P[s],currentSize:s,isManual:e!==null,setSize:u=>{t(u)},resetToAuto:()=>{t(null)},availableSizes:Object.keys(P)}}function Oe(e){const t=Math.floor(e/60),o=Math.floor(e%60);return`${t.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}`}function ke(e){switch(e){case"focus":return"Modo Foco";case"short_break":return"Pausa Curta";case"long_break":return"Pausa Longa";default:return""}}function He(e){switch(e){case"focus":return"text-orange-300";case"short_break":return"text-orange-200";case"long_break":return"text-orange-100";default:return"text-white"}}function We({displayTime:e,phase:t,onStop:o}){const{dimensions:r}=D();return i.jsxs("div",{className:"relative w-full h-full overflow-hidden",children:[i.jsx(Ie,{speed:1.2,intensity:1.8,className:"w-full h-full"}),i.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center z-10",children:[i.jsx("div",{className:`text-base font-medium ${r.spacing.indicator} ${He(t)} text-center`,children:ke(t)}),i.jsx("div",{className:`${r.timerSize} font-futura font-extrabold text-white text-center ${r.spacing.timer} select-none pomodoro-timer-text`,children:Oe(e)}),i.jsxs("button",{onClick:o,className:"group relative px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-200 hover:text-red-100 rounded-full font-medium transition-all duration-300 backdrop-blur-sm pomodoro-stop-button",children:[i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx(C,{className:"w-4 h-4"}),i.jsx("span",{className:"text-base",children:"Parar Pomodoro"})]}),i.jsx("div",{className:"absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"})]})]}),i.jsx("div",{className:"absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none"})]})}const $e=p.memo(We);function U(e,t){if(e?.state?.phase==="idle")return t*60;if(e?.state?.endsAt){const o=new Date,r=new Date(e.state.endsAt),a=Math.max(0,r.getTime()-o.getTime());return Math.ceil(a/1e3)}return Math.ceil((e?.state?.remainingMs??0)/1e3)}function V(){const{pomodoro:e,startPomodoro:t,stopPomodoro:o}=S(f=>({pomodoro:f.pomodoro,startPomodoro:f.startPomodoro,stopPomodoro:f.stopPomodoro})),[r,a]=p.useState(e?.config?.focusMinutes??25),[s,n]=p.useState(e?.config?.shortBreakMinutes??5),[l,d]=p.useState(()=>U(e,r));p.useEffect(()=>{if(e?.state?.phase==="idle"){d(r*60);return}d(Math.max(0,U(e,r)));const f=setInterval(()=>{d(Math.max(0,U(e,r)))},1e3);return()=>clearInterval(f)},[e?.state?.phase,e?.state?.endsAt,e?.state?.remainingMs,r]);const u=()=>{t(r,s)},h=f=>{const m=Math.floor(f/60),g=Math.floor(f%60);return`${m.toString().padStart(2,"0")}:${g.toString().padStart(2,"0")}`};return e?.state?.phase&&e.state.phase!=="idle"?i.jsx($e,{displayTime:l,phase:e.state.phase,onStop:o}):i.jsxs("div",{className:"space-y-4",children:[i.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-6 text-center",children:[i.jsxs("div",{className:"text-sm font-medium text-gray-400 mb-2",children:[e?.state?.phase==="idle"&&"Pronto para começar",e?.state?.phase==="focus"&&"🎯 Modo Foco",(e?.state?.phase==="short_break"||e?.state?.phase==="long_break")&&"☕ Pausa"]}),i.jsx("div",{className:`text-4xl font-bold mb-4 ${e?.state?.phase!=="idle"?"text-blue-400":"text-gray-600"}`,children:h(l)}),i.jsxs("div",{className:"flex items-center justify-center gap-2 text-sm text-gray-500",children:[i.jsx(G,{className:"w-4 h-4"}),i.jsxs("span",{children:["Ciclo ",e?.state?.cycleIndex??0," de ",e?.config?.cyclesBeforeLongBreak??0]})]})]}),e?.state?.phase==="idle"?i.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4 space-y-4",children:[i.jsxs("div",{children:[i.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Tempo de Foco (minutos)"}),i.jsx("input",{type:"number",value:r,onChange:f=>a(Number(f.target.value)),className:"w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50",min:"1",max:"120"})]}),i.jsxs("div",{children:[i.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Tempo de Pausa (minutos)"}),i.jsx("input",{type:"number",value:s,onChange:f=>n(Number(f.target.value)),className:"w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50",min:"1",max:"60"})]}),i.jsxs("button",{onClick:u,className:"w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",children:[i.jsx(he,{className:"w-5 h-5"}),"Iniciar Pomodoro"]})]}):i.jsxs("button",{onClick:o,className:"w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",children:[i.jsx(C,{className:"w-5 h-5"}),"Parar Pomodoro"]}),i.jsxs("div",{className:"bg-blue-500/10 border border-blue-500/30 rounded-lg p-3",children:[i.jsx("p",{className:"text-xs font-medium text-blue-300 mb-2",children:"Como funciona:"}),i.jsxs("ul",{className:"list-disc list-inside space-y-1 text-xs text-blue-200",children:[i.jsx("li",{children:"Durante o foco, sites da blacklist são bloqueados"}),i.jsx("li",{children:"Após 4 ciclos, você ganha uma pausa longa"}),i.jsx("li",{children:"Modo adaptativo aumenta o tempo de foco gradualmente"})]})]})]})}X.register(q,Y,K,Z,J,Q,ee,te,ie);function Ge(){const e=S(v=>v.dailyUsage??{}),t=new Date().toISOString().split("T")[0],r=e?.[t]&&e[t].perDomain||{},a=Object.entries(r).sort(([,v],[,x])=>(Number(x)||0)-(Number(v)||0)).slice(0,5),s=Object.values(r).reduce((v,x)=>v+(Number(x)||0),0),n=Math.floor(s/60),l=Math.floor(n/60),d=n%60,u=a.map(([v])=>v),h=a.map(([,v])=>Math.floor(v/60)),f={labels:u,datasets:[{data:h,backgroundColor:["rgba(59, 130, 246, 0.7)","rgba(16, 185, 129, 0.7)","rgba(239, 68, 68, 0.7)","rgba(245, 158, 11, 0.7)","rgba(139, 92, 246, 0.7)"],borderColor:"#0d0d1a",borderWidth:2}]},m={labels:u,datasets:[{label:"Minutos",data:h,backgroundColor:"rgba(59, 130, 246, 0.6)",borderColor:"rgba(59, 130, 246, 1)",borderWidth:1,borderRadius:4}]},g={maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"#1f2937",titleColor:"#e5e7eb",bodyColor:"#d1d5db",padding:10,cornerRadius:4}}},_={maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"#1f2937",titleColor:"#e5e7eb",bodyColor:"#d1d5db",padding:10,cornerRadius:4}},scales:{x:{ticks:{color:"#9ca3af"},grid:{color:"rgba(255, 255, 255, 0.05)"}},y:{beginAtZero:!0,ticks:{color:"#9ca3af"},grid:{color:"rgba(255, 255, 255, 0.1)"}}}};return i.jsxs("div",{className:"space-y-4",children:[i.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4 text-center",children:[i.jsx("h3",{className:"text-sm font-medium text-gray-400 mb-1",children:"USO TOTAL HOJE"}),i.jsxs("div",{className:"text-3xl font-bold text-blue-400",children:[l,"h ",d,"m"]})]}),a.length>0?i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4",children:[i.jsx("h3",{className:"text-sm font-semibold text-white mb-3",children:"Distribuição de Hoje"}),i.jsx("div",{className:"h-40 flex items-center justify-center",children:i.jsx(re,{data:f,options:g})})]}),i.jsxs("div",{className:"bg-white/5 border border-white/10 rounded-lg p-4",children:[i.jsx("h3",{className:"text-sm font-semibold text-white mb-3",children:"Top Sites (Minutos)"}),i.jsx("div",{className:"h-40",children:i.jsx(oe,{data:m,options:_})})]})]}):i.jsx("div",{className:"bg-white/5 border border-white/10 rounded-lg p-8 text-center",children:i.jsx("p",{className:"text-gray-500 text-sm",children:"Nenhum dado de uso para hoje ainda."})})]})}function Xe(){const{isLoading:e,error:t,setError:o,pomodoro:r}=S(d=>({isLoading:d.isLoading,error:d.error,setError:d.setError,pomodoro:d.pomodoro})),[a,s]=p.useState("pomodoro"),{dimensions:n}=D();p.useEffect(()=>{const d=se.getState();d.loadState();const u=d.listenForUpdates();return()=>{try{u?.()}catch{}}},[]);const l=()=>{try{typeof chrome<"u"&&(chrome?.runtime?.openOptionsPage?chrome.runtime.openOptionsPage():chrome?.tabs?.create&&chrome?.runtime?.getURL&&chrome.tabs.create({url:chrome.runtime.getURL("options.html")}))}catch(d){console.warn("[v0] Failed to open options page:",d)}};return e?i.jsx("div",{className:"flex items-center justify-center h-full min-h-[500px] bg-[#0d0d1a]",children:i.jsxs("div",{className:"text-center",children:[i.jsx("div",{className:"animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto"}),i.jsx("p",{className:"mt-4 text-gray-400 text-sm",children:"Carregando..."})]})}):r?.state?.phase&&r.state.phase!=="idle"?i.jsx("div",{className:"pomodoro-fullscreen-container",style:{"--popup-width":`${n.width}px`,"--popup-height":`${n.height}px`},children:i.jsx(V,{})}):i.jsx("div",{className:"popup-main-container w-full h-full bg-[#0d0d1a] p-2",style:{"--popup-width":"380px","--popup-min-height":"520px"},children:i.jsxs("div",{className:"glass-card h-full flex flex-col overflow-hidden",children:[i.jsxs("div",{className:"p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0",children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("div",{className:"p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md",children:i.jsx(ae,{className:"w-5 h-5 text-white"})}),i.jsxs("div",{children:[i.jsx("h1",{className:"text-md font-bold text-white",children:"Focus Extension"}),i.jsx("p",{className:"text-xs text-gray-400",children:"Acesso Rápido"})]})]}),i.jsx("button",{onClick:l,className:"p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors",title:"Abrir painel completo",children:i.jsx(ue,{className:"w-4 h-4"})})]}),i.jsxs("div",{className:"flex border-b border-white/10 flex-shrink-0",children:[i.jsx("button",{onClick:()=>s("pomodoro"),className:`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${a==="pomodoro"?"border-b-2 border-blue-400 text-white bg-blue-500/10":"text-gray-400 hover:text-white hover:bg-white/5"}`,children:"Pomodoro"}),i.jsx("button",{onClick:()=>s("blacklist"),className:`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${a==="blacklist"?"border-b-2 border-blue-400 text-white bg-blue-500/10":"text-gray-400 hover:text-white hover:bg-white/5"}`,children:"Bloqueio"}),i.jsx("button",{onClick:()=>s("dashboard"),className:`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${a==="dashboard"?"border-b-2 border-blue-400 text-white bg-blue-500/10":"text-gray-400 hover:text-white hover:bg-white/5"}`,children:"Dashboard"})]}),i.jsxs("div",{className:"p-4 flex-1 overflow-y-auto",children:[t&&i.jsxs("div",{className:"mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-md flex justify-between items-center",children:[i.jsx("span",{children:t}),i.jsx("button",{onClick:()=>o(null),className:"text-red-300 hover:text-red-100 text-lg","aria-label":"Fechar alerta de erro",children:"×"})]}),a==="pomodoro"&&i.jsx(V,{}),a==="blacklist"&&i.jsx(fe,{}),a==="dashboard"&&i.jsx(Ge,{})]})]})})}ne.createRoot(document.getElementById("root")).render(i.jsx(le.StrictMode,{children:i.jsx(Xe,{})}));
