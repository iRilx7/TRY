
export const $=(s,r=document)=>r.querySelector(s);
export const html=(s,...v)=>{let o=s[0];v.forEach((x,i)=>o+=(x??'')+s[i+1]);const t=document.createElement('template');t.innerHTML=o.trim();return t.content;}
export function toast(m){const b=document.getElementById('toasts')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'toasts'}));const d=document.createElement('div');d.textContent=m;d.className='card';b.append(d);setTimeout(()=>d.remove(),2000);}
