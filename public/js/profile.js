import { listBookmarks } from './api.js';
import { html, $ } from './utils.js';

function card(n, ch){
  const img = n.cover_url || `https://picsum.photos/seed/${encodeURIComponent(n.slug)}/400/600`;
  return html`<article class="card">
    <img src="${img}" alt="${n.title}"/>
    <div class="pad">
      <span class="badge">${n.author||'Unknown'}</span>
      <h3>${n.title}</h3>
      <p class="meta">Chapter ${ch.chapter_number}: ${ch.title}</p>
      <p><a class="btn" href="reader.html?novel=${encodeURIComponent(n.slug)}&ch=${ch.chapter_number}">Continue →</a></p>
    </div>
  </article>`;
}

async function init(){
  const list = await listBookmarks();
  const b = $('#bookmarks'); b.innerHTML='';
  for (const row of list){
    if (row.novel && row.chapter) b.append(card(row.novel, row.chapter));
  }
}
init();
