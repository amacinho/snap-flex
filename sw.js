if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let o={};const c=e=>s(e,t),f={module:{uri:t},exports:o,require:c};i[t]=Promise.all(n.map((e=>f[e]||c(e)))).then((e=>(r(...e),o)))}}define(["./workbox-e8110d74"],(function(e){"use strict";e.setCacheNameDetails({prefix:"snap-flex-v1.01"}),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-KR2iCJvx.css",revision:null},{url:"index.html",revision:"210aac6a25b619d746cfd15f5f782a8e"},{url:"registerSW.js",revision:"304e612d3eee7ca7f7d6111cf9fb183f"},{url:"manifest.webmanifest",revision:"c487bc0dc421ab9b8c3e27cb0a355d4b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
