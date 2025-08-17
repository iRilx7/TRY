import { sb } from './supabaseClient.js';
// Minimal stub: show bookmarks if you use them
async function load(){
  const uid = (await sb.auth.getUser()).data.user?.id;
  if (!uid){ document.getElementById('bookmarks').innerHTML='<p class="meta">Log in to see bookmarks.</p>'; return; }
  const { data, error } = await sb.from('bookmarks').select('chapters!inner(title,chapter_number),novel_id').eq('user_id', uid).limit(50);
  if (error){ document.getElementById('bookmarks').innerHTML='<p class="meta">No bookmarks yet.</p>'; return; }
  document.getElementById('bookmarks').innerHTML = data.map(b=>`<div class="card pad"><div class="badge">Chapter ${b.chapters.chapter_number}</div><h4>${b.chapters.title}</h4></div>`).join('');
}
load();