import{forwardRef as E,createElement as z}from"react";var l=(...t)=>t.filter((e,u,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===u).join(" ").trim();var w=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var A=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,u,o)=>o?o.toUpperCase():u.toLowerCase());var g=t=>{let e=A(t);return e.charAt(0).toUpperCase()+e.slice(1)};import{forwardRef as V,createElement as F}from"react";var f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var B=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};import{createContext as v,useContext as G,useMemo as sa,createElement as ia}from"react";var W=v({});var M=()=>G(W);var D=V(({color:t,size:e,strokeWidth:u,absoluteStrokeWidth:o,className:h="",children:d,iconNode:R,...k},T)=>{let{size:S=24,strokeWidth:P=2,absoluteStrokeWidth:q=!1,color:y="currentColor",className:b=""}=M()??{},U=o??q?Number(u??P)*24/Number(e??S):u??P;return F("svg",{ref:T,...f,width:e??S??f.width,height:e??S??f.height,stroke:t??y,strokeWidth:U,className:l("lucide",b,h),...!d&&!B(k)&&{"aria-hidden":"true"},...k},[...R.map(([O,H])=>F(O,H)),...Array.isArray(d)?d:[d]])});var a=(t,e)=>{let u=E(({className:o,...h},d)=>z(D,{ref:d,iconNode:e,className:l(`lucide-${w(g(t))}`,`lucide-${t}`,o),...h}));return u.displayName=g(t),u};var X=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],r=a("arrow-right",X);var N=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],s=a("check",N);var K=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],i=a("chevron-down",K);var Z=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],c=a("chevron-left",Z);var Q=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],n=a("chevron-right",Q);var J=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],p=a("info",J);var _=[["path",{d:"M5 12h14",key:"1ays0h"}]],L=a("minus",_);var Y=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],m=a("plus",Y);var j=[["path",{d:"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",key:"icamh8"}],["path",{d:"m14.5 12.5 2-2",key:"inckbg"}],["path",{d:"m11.5 9.5 2-2",key:"fmmyf7"}],["path",{d:"m8.5 6.5 2-2",key:"vc6u1g"}],["path",{d:"m17.5 15.5 2-2",key:"wo5hmg"}]],I=a("ruler",j);var $=[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]],x=a("shopping-cart",$);var aa=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],C=a("x",aa);export{r as ArrowRight,s as Check,i as ChevronDown,c as ChevronLeft,n as ChevronRight,p as Info,L as Minus,m as Plus,I as Ruler,x as ShoppingCart,C as X};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toKebabCase.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toCamelCase.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/toPascalCase.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/defaultAttributes.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils/hasA11yProp.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/context.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/Icon.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/createLucideIcon.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/arrow-right.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/check.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/chevron-down.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/chevron-left.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/chevron-right.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/info.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/minus.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/plus.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/ruler.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/shopping-cart.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/x.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
