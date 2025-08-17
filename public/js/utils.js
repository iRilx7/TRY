export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
export const html = (s,...v)=>{let o=s[0];v.forEach((x,i)=>o+=(x??"")+s[i+1]);const t=document.createElement('template');t.innerHTML=o.trim();return t.content};
export const fmtDate = (d)=> new Date(d).toLocaleDateString();
export const throttle = (fn,w=800)=>{let t=0;return(...a)=>{const n=Date.now();if(n-t>w){t=n;fn(...a)}}};
