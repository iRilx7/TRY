import { sb } from './supabaseClient.js';
import { $, html } from './utils.js';
import { isAdmin, saveNovel, chaptersForNovel, createChapter, updateChapter, deleteChapter } from './api.js';

async function guard(){
  const ok = await isAdmin();
  const guard = $('#adminGuard'), cms = $('#cms');
  if (ok){ guard.style.display='none'; cms.style.display='block'; }
  else { guard.textContent = 'You are not an admin or not logged in.'; }
}
guard();

// Upload cover to 'covers' bucket
$('#uploadCover').addEventListener('click', async ()=>{
  const file = $('#cover').files[0]; if(!file) return alert('Pick an image');
  const slug = $('#n_slug').value.trim(); if(!slug) return alert('Enter slug first');
  const path = `${slug}/${Date.now()}_${file.name}`;
  const { error } = await sb.storage.from('covers').upload(path, file, { upsert:true, cacheControl:'3600' });
  if (error) return alert(error.message);
  const { data } = sb.storage.from('covers').getPublicUrl(path);
  $('#n_cover_url').value = data.publicUrl;
  alert('Cover uploaded');
});

$('#saveNovel').addEventListener('click', async ()=>{
  const payload = {
    slug: n_slug.value.trim(),
    title: n_title.value.trim(),
    author: n_author.value.trim() || null,
    description: n_desc.value.trim() || null,
    cover_url: n_cover_url.value.trim() || null
  };
  if (!payload.slug || !payload.title) return alert('Slug + Title required');
  try{ await saveNovel(payload); alert('Novel saved'); }catch(e){ alert(e.message); }
});

async function novelIdBySlug(slug){
  const { data } = await sb.from('novels').select('id').eq('slug', slug).single();
  return data.id;
}

$('#createChapter').addEventListener('click', async ()=>{
  const slug = $('#c_slug').value.trim(); const num=Number($('#c_num').value);
  if (!slug || !num) return alert('slug + chapter number required');
  const novel_id = await novelIdBySlug(slug);
  const payload = { novel_id, chapter_number: num, title: $('#c_title').value.trim()||`Chapter ${num}`, content: $('#c_content').value.trim() };
  const { error } = await sb.from('chapters').insert(payload);
  alert(error ? error.message : 'Chapter created');
});

$('#updateChapter').addEventListener('click', async ()=>{
  const slug = $('#c_slug').value.trim(); const num=Number($('#c_num').value);
  const novel_id = await novelIdBySlug(slug);
  const row = (await sb.from('chapters').select('id').eq('novel_id',novel_id).eq('chapter_number',num).maybeSingle()).data;
  if (!row) return alert('Chapter not found');
  const { error } = await sb.from('chapters').update({ title: $('#c_title').value.trim(), content: $('#c_content').value.trim() }).eq('id', row.id);
  alert(error ? error.message : 'Chapter updated');
});

$('#deleteChapter').addEventListener('click', async ()=>{
  const slug = $('#c_slug').value.trim(); const num=Number($('#c_num').value);
  const novel_id = await novelIdBySlug(slug);
  const row = (await sb.from('chapters').select('id').eq('novel_id',novel_id).eq('chapter_number',num).maybeSingle()).data;
  if (!row) return alert('Chapter not found');
  const { error } = await sb.from('chapters').delete().eq('id', row.id);
  alert(error ? error.message : 'Chapter deleted');
});
