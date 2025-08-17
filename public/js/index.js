import { $, html, fmtDate } from './utils.js';
import { listNovels, latestUpdatedNovels, completedNovels, likeCount } from './api.js';

function card(n){ 
  const img = n.cover_url || `https://picsum.photos/seed/${encodeURIComponent(n.slug)}/400/600`;
  return html`<article class="card">
    <img src="${img}" alt="${n.title}"/>
    <div class="pad">
      <span class="badge">${n.author||'Unknown'}</span>
      <h3>${n.title}</h3>
      <p class="meta">${(n.description||'').slice(0,140)}</p>
      <p style="display:flex;gap:8px;align-items:center;justify-content:space-between;">
        <a class="btn" href="reader.html?novel=${encodeURIComponent(n.slug)}&ch=1">Read →</a>
        <span class="meta" data-like="${n.id}">❤ …</span>
      </p>
    </div>
  </article>`;
}

async function hydrateLikes(scope){
  for (const el of scope.querySelectorAll('[data-like]')){
    const id = Number(el.getAttribute('data-like'));
    el.textContent = '❤ ' + await likeCount(id);
  }
}

async function renderAll(){
  const q = $('#q').value.trim();
  const novels = await listNovels(q);
  const grid = $('#grid'); grid.innerHTML=''; novels.forEach(n=>grid.append(card(n))); await hydrateLikes(grid);

  const latest = await latestUpdatedNovels(8);
  const latestEl = $('#latest'); latestEl.innerHTML=''; latest.forEach(n=>latestEl.append(card(n))); await hydrateLikes(latestEl);

  const completed = await completedNovels(8);
  const compEl = $('#completed'); compEl.innerHTML=''; completed.forEach(n=>compEl.append(card(n))); await hydrateLikes(compEl);
}

$('#searchBtn').addEventListener('click', renderAll);
renderAll();
