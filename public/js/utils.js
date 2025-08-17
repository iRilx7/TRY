export const $ = (s,root=document)=>root.querySelector(s);
export const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
export const html=(s,...v)=>{let o=s[0];v.forEach((x,i)=>o+=(x??"")+s[i+1]);const t=document.createElement('template');t.innerHTML=o.trim();return t.content};
export function getParam(k){return new URLSearchParams(location.search).get(k)}
export function timeAgo(x){const d=new Date(x),s=((Date.now()-d)/1000)|0;const u=[[60,"s"],[60,"m"],[24,"h"],[7,"d"],[4.3,"w"],[12,"mo"]];let n=s,l="s";for(const [k,t]of u){if(n<k){l=t;break}n=(n/k)|0;l=t}return `${n}${l} ago`}
export function throttle(fn,w=800){let t=0;return(...a)=>{const n=Date.now();if(n-t>w){t=n;fn(...a)}}}
