import { sb, toast, params } from './supabaseClient.js';

const slug = params.get('slug');
if (!slug) location.href='index.html';

async function load() {
  const { data: n } = await sb.from('novels').select('id,slug,title,author,description,cover_url').eq('slug', slug).maybeSingle();
  if (!n) { toast('Novel not found','err'); return; }
  document.getElementById('details').innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start">
      <img src="${n.cover_url||''}" style="width:160px;height:220px;object-fit:cover;border-radius:12px;border:1px solid var(--border)">
      <div><h2>${n.title}</h2><div class="badge">${n.author||''}</div><p class="meta">${n.description||''}</p>
      <a class="btn primary" href="reader.html?slug=${encodeURIComponent(slug)}">Open reader</a></div>
    </div>`;
  const { data: chs } = await sb.from('chapters').select('chapter_number,title').eq('novel_id', n.id).order('chapter_number');
  document.getElementById('chapterList').innerHTML = chs.map(c=>`<a class="btn" href="reader.html?slug=${encodeURIComponent(slug)}&ch=${c.chapter_number}">#${c.chapter_number} — ${c.title}</a>`).join(' ');
}
load();