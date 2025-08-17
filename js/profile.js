
import { html, $ } from './utils.js';
import { sb } from './supabaseClient.js';

async function listBookmarks(){
  const u = (await sb.auth.getUser()).data.user; if(!u) return [];
  const { data: bms } = await sb.from('bookmarks').select('id, chapter_id, novel_id, created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50);
  if (!bms?.length) return [];
  const novelIds = Array.from(new Set(bms.map(b=>b.novel_id)));
  const { data: novels } = await sb.from('novels').select('*').in('id', novelIds);
  const novelMap = new Map((novels||[]).map(n=>[n.id,n]));
  const chIds = bms.map(b=>b.chapter_id);
  const { data: chaps } = await sb.from('chapters').select('id, novel_id, chapter_number, title').in('id', chIds);
  const chMap = new Map((chaps||[]).map(c=>[c.id,c]));
  return bms.map(b => ({ bookmark:b, novel: novelMap.get(b.novel_id), chapter: chMap.get(b.chapter_id) }));
}
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
  for (const row of list){ if (row.novel && row.chapter) b.append(card(row.novel, row.chapter)); }
}
init();
