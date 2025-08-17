
import { $, html } from './utils.js';
import { listNovels, likeCount } from './api.js';
function card(n){ const img=n.cover_url||`https://picsum.photos/seed/${encodeURIComponent(n.slug)}/400/600`; return html`<article class="card"><img class="thumb" src="${img}"><div class="pad"><div class="meta">${n.author||''}</div><h3>${n.title}</h3><p class="meta">${(n.description||'').slice(0,120)}</p><div style="display:flex;justify-content:space-between"><a class="btn" href="novel.html?id=${n.id}">Open</a><span class="meta" data-like="${n.id}">❤ …</span></div></div></article>`; }
async function hydrate(scope){ for(const el of scope.querySelectorAll('[data-like]')) el.textContent='❤ '+await likeCount(Number(el.dataset.like)); }
async function render(q){ const list=await listNovels(q); const a=$('#all'); a.innerHTML=''; list.forEach(n=>a.append(card(n))); const l=list.slice(0,8); const latest=$('#latest'); latest.innerHTML=''; l.forEach(n=>latest.append(card(n))); await hydrate(a); await hydrate(latest); }
$('#searchBtn').onclick=()=>render($('#q').value.trim()); render();
