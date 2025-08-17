// public/js/utils.js
export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export const html = (strings, ...values) => {
  let out = strings[0];
  values.forEach((v, i) => out += (v ?? "") + strings[i+1]);
  const t = document.createElement('template'); t.innerHTML = out.trim();
  return t.content;
};

export function timeAgo(dateStr) {
  const d = new Date(dateStr); const s = Math.floor((Date.now() - d.getTime())/1000);
  const units = [[60,"s"],[60,"m"],[24,"h"],[7,"d"],[4.3,"w"],[12,"mo"]];
  let n=s, u="s";
  for (const [k, label] of units){ if(n<k) {u=label; break;} n=Math.floor(n/k); u=label; }
  return `${n}${u} ago`;
}

export function throttle(fn, wait=800){ let t=0; return (...a)=>{ const n=Date.now(); if(n-t>wait){ t=n; fn(...a); } }; }

export function getParam(name){ return new URLSearchParams(location.search).get(name); }

export const Theme = {
  load(){
    const t = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme=t;
  },
  toggle(){
    const t = document.documentElement.dataset.theme==="dark"?"light":"dark";
    document.documentElement.dataset.theme=t;
    localStorage.setItem("theme", t);
  }
};
