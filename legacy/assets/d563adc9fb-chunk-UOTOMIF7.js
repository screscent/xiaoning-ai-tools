import{require_react as l}from"chunk-HKLPI2XQ";import{__commonJS as S,__toESM as p}from"chunk-ZS7NZCD4";var A=S({"node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(u){"use strict";(function(){function n(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}function c(e,t){d||s.startTransition===void 0||(d=!0,console.error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));var o=t();if(!E){var a=t();O(o,a)||(console.error("The result of getSnapshot should be cached to avoid an infinite loop"),E=!0)}a=L({inst:{value:o,getSnapshot:t}});var r=a[0].inst,f=a[1];return v(function(){r.value=o,r.getSnapshot=t,_(r)&&f({inst:r})},[e,o,t]),h(function(){return _(r)&&f({inst:r}),e(function(){_(r)&&f({inst:r})})},[e]),w(o),o}function _(e){var t=e.getSnapshot;e=e.value;try{var o=t();return!O(e,o)}catch{return!0}}function m(e,t){return t()}typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart=="function"&&__REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());var s=l(),O=typeof Object.is=="function"?Object.is:n,L=s.useState,h=s.useEffect,v=s.useLayoutEffect,w=s.useDebugValue,d=!1,E=!1,T=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?m:c;u.useSyncExternalStore=s.useSyncExternalStore!==void 0?s.useSyncExternalStore:T,typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop=="function"&&__REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error())})()}}),g=S({"node_modules/use-sync-external-store/shim/index.js"(u,n){"use strict";n.exports=A()}}),x=p(g(),1),i=p(l(),1),R=p(l(),1),D=i.useInsertionEffect,B=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",y=B?i.useLayoutEffect:i.useEffect,G=D||y,I=u=>{const n=i.useRef([u,(...c)=>n[0](...c)]).current;return G(()=>{n[0]=u}),n[1]};/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/export{R as import_react,x as import_shim,I as useEvent,y as useIsomorphicLayoutEffect};
