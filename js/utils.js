
export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
export const html = (s,...v)=>{let o=s[0];v.forEach((x,i)=>o+=(x??"")+s[i+1]);const t=document.createElement('template');t.innerHTML=o.trim();return t.content;};
export const fmtDate = (d)=> new Date(d).toLocaleDateString();
export function toast(msg, type='ok'){ 
  let box = $('#toasts'); if(!box){ box=document.createElement('div'); box.id='toasts'; document.body.append(box); }
  const el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=msg; box.append(el);
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 3000);
}
export const throttle=(fn,wait)=>{let t=0;return(...a)=>{const n=Date.now();if(n-t>wait){t=n;fn(...a)}}};
