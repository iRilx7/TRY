
import { sb } from './supabaseClient.js';
import { $, $$, toast } from './utils.js';
import { isAdmin, saveNovel, chaptersForNovel, nextChapterNumber } from './api.js';
const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Harem','Historical','Horror','Isekai','Magic','Martial Arts','Mystery','Romance','Sci-Fi','Slice of Life','Supernatural','Tragedy','Wuxia','Xianxia'];
const chips = $('#genreChips'); GENRES.forEach(g=>{ const c=document.createElement('span'); c.className='chip'; c.textContent=g; c.onclick=()=>c.classList.toggle('active'); chips.append(c); });
function collectGenres(){ const custom=$('#n_genres').value.split(',').map(s=>s.trim()).filter(Boolean); const selected=$$('.chip.active').map(x=>x.textContent); return [...new Set([...selected,...custom])].join(','); }
async function guard(){ const ok = await isAdmin(); const g=$('#adminGuard'), cms=$('#cms'); if(ok){g.style.display='none'; cms.style.display='block';} else {g.innerHTML='<strong>You are not an admin or not logged in.</strong>';}} guard();
$('#n_cover_url').addEventListener('input',()=>{ $('#coverPreview').src = $('#n_cover_url').value.trim()||''; });
$('#uploadCover').addEventListener('click', async ()=>{
  const file = $('#cover').files[0]; if(!file) return toast('Pick an image','warn');
  const slug = $('#n_slug').value.trim(); if(!slug) return toast('Enter slug first','warn');
  const path = `${slug}/${Date.now()}_${file.name}`;
  const { error } = await sb.storage.from('covers').upload(path, file, { upsert:true, cacheControl:'3600' });
  if (error) return toast(error.message,'err');
  const { data } = sb.storage.from('covers').getPublicUrl(path);
  $('#n_cover_url').value = data.publicUrl; $('#coverPreview').src = data.publicUrl; toast('Cover uploaded');
});
$('#saveNovel').addEventListener('click', async ()=>{
  const payload = { slug:n_slug.value.trim(), title:n_title.value.trim(), author:n_author.value.trim()||null, description:n_desc.value.trim()||null, cover_url:n_cover_url.value.trim()||null, genres:collectGenres() };
  if(!payload.slug || !payload.title) return toast('Slug + Title required','warn');
  try{ await saveNovel(payload); toast('Novel saved. It will appear on Home & search.','ok'); }catch(e){ toast(e.message,'err'); }
});
async function novelIdBySlug(slug){ const { data } = await sb.from('novels').select('id').eq('slug',slug).maybeSingle(); if(!data) throw new Error('Novel not found'); return data.id; }
$('#suggestNum').addEventListener('click', async ()=>{ try{ const id=await novelIdBySlug($('#c_slug').value.trim()); const next=await nextChapterNumber(id); $('#c_num').value=next; toast('Suggested: '+next); }catch(e){ toast(e.message,'err'); } });
$('#createChapter').addEventListener('click', async ()=>{ try{ const slug=$('#c_slug').value.trim(); const id=await novelIdBySlug(slug); const num=Number($('#c_num').value); const t=$('#c_title').value.trim()||`Chapter ${num}`; const body=$('#c_content').value.trim(); const { error } = await sb.from('chapters').insert({ novel_id:id, chapter_number:num, title:t, content:body }); if (error) throw error; toast('Chapter created'); }catch(e){ toast(e.message,'err'); } });
$('#updateChapter').addEventListener('click', async ()=>{ try{ const slug=$('#c_slug').value.trim(); const id=await novelIdBySlug(slug); const num=Number($('#c_num').value); const row=(await sb.from('chapters').select('id').eq('novel_id',id).eq('chapter_number',num).maybeSingle()).data; if(!row) throw new Error('Chapter not found'); const { error } = await sb.from('chapters').update({ title:$('#c_title').value.trim(), content:$('#c_content').value.trim() }).eq('id',row.id); if(error) throw error; toast('Chapter updated'); }catch(e){ toast(e.message,'err'); } });
$('#deleteChapter').addEventListener('click', async ()=>{ try{ const slug=$('#c_slug').value.trim(); const id=await novelIdBySlug(slug); const num=Number($('#c_num').value); const row=(await sb.from('chapters').select('id').eq('novel_id',id).eq('chapter_number',num).maybeSingle()).data; if(!row) throw new Error('Chapter not found'); if(!confirm('Delete this chapter?')) return; const { error } = await sb.from('chapters').delete().eq('id',row.id); if(error) throw error; toast('Chapter deleted'); }catch(e){ toast(e.message,'err'); } });
$('#loadChapters').addEventListener('click', async ()=>{ try{ const slug=$('#c_slug').value.trim(); const id=await novelIdBySlug(slug); const list=await chaptersForNovel(id); const wrap=$('#chapTableWrap'); const tbody=$('#chapTable tbody'); tbody.innerHTML=''; for(const c of list){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${c.chapter_number}</td><td>${c.title}</td><td>${new Date(c.created_at).toLocaleString()}</td><td><button class='btn' data-edit='${c.chapter_number}'>Edit</button></td>`; tbody.append(tr);} wrap.style.display='block'; tbody.onclick=(e)=>{ const n=e.target?.getAttribute?.('data-edit'); if(!n) return; const c=list.find(x=>x.chapter_number==n); $('#c_num').value=c.chapter_number; $('#c_title').value=c.title; sb.from('chapters').select('content').eq('id',c.id).single().then(({data})=>$('#c_content').value=data?.content||''); window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); }; toast(`Loaded ${list.length} chapters`); }catch(e){ toast(e.message,'err'); } });
