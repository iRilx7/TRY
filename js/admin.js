import { sb, toast } from './supabaseClient.js';

// guard
(async () => {
  const uid = (await sb.auth.getUser()).data.user?.id;
  if (!uid) { location.href='auth.html'; return; }
  const { data } = await sb.from('admins').select('*').eq('user_id', uid).maybeSingle();
  if (!data) { document.getElementById('adminGuard').innerHTML='You are not an admin.'; return; }
  document.getElementById('adminGuard').style.display='none';
  document.getElementById('cms').style.display='block';
})();

// helper slugify
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');

const title = document.getElementById('n_title');
const slug = document.getElementById('n_slug');
title.addEventListener('input', ()=> slug.value = slugify(title.value));

document.getElementById('uploadCover').onclick = async () => {
  const f = document.getElementById('cover').files[0];
  if (!f) return toast('Choose an image first','warn');
  const path = `covers/${Date.now()}_${f.name}`;
  const { error } = await sb.storage.from('covers').upload(path, f, { upsert:true });
  if (error) return toast(error.message,'err');
  const { data } = sb.storage.from('covers').getPublicUrl(path);
  document.getElementById('n_cover_url').value = data.publicUrl;
  document.getElementById('coverPreview').src = data.publicUrl;
  toast('Cover uploaded','ok');
};

document.getElementById('saveNovel').onclick = async () => {
  const body = {
    slug: slug.value || slugify(title.value),
    title: title.value.trim(),
    author: document.getElementById('n_author').value.trim(),
    description: document.getElementById('n_desc').value,
    cover_url: document.getElementById('n_cover_url').value.trim()
  };
  if (!body.slug || !body.title) return toast('Title is required','warn');
  const { error } = await sb.from('novels').upsert(body).select().single();
  if (error) return toast(error.message,'err');
  toast('Novel saved. It will appear on Home & search.','ok');
  document.getElementById('slugTag').textContent = body.slug;
  document.getElementById('c_slug').value = body.slug;
  document.getElementById('viewNovel').href = `novel.html?slug=${encodeURIComponent(body.slug)}`;
};

async function getNovelId(sl) {
  const { data } = await sb.from('novels').select('id').eq('slug', sl).maybeSingle();
  return data?.id;
}

document.getElementById('suggestNum').onclick = async () => {
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return toast('Novel not found','err');
  const { data } = await sb.from('chapters').select('chapter_number').eq('novel_id', nid).order('chapter_number',{ascending:false}).limit(1);
  document.getElementById('c_num').value = (data?.[0]?.chapter_number || 0) + 1;
};

document.getElementById('createChapter').onclick = async () => {
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return toast('Novel not found','err');
  const body = {
    novel_id: nid,
    chapter_number: parseInt(document.getElementById('c_num').value,10),
    title: document.getElementById('c_title').value.trim() || `Chapter ${document.getElementById('c_num').value}`,
    content: document.getElementById('c_content').value
  };
  const { error } = await sb.from('chapters').insert(body);
  if (error) return toast(error.message,'err');
  toast('Chapter created','ok');
  document.getElementById('loadChapters').click();
};

document.getElementById('updateChapter').onclick = async () => {
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return toast('Novel not found','err');
  const num = parseInt(document.getElementById('c_num').value,10);
  const { data: ch } = await sb.from('chapters').select('id').eq('novel_id', nid).eq('chapter_number', num).maybeSingle();
  if (!ch) return toast('Chapter not found','err');
  const body = { title: document.getElementById('c_title').value.trim(), content: document.getElementById('c_content').value };
  const { error } = await sb.from('chapters').update(body).eq('id', ch.id);
  if (error) return toast(error.message,'err');
  toast('Updated','ok'); document.getElementById('loadChapters').click();
};

document.getElementById('deleteChapter').onclick = async () => {
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return toast('Novel not found','err');
  const num = parseInt(document.getElementById('c_num').value,10);
  const { data: ch } = await sb.from('chapters').select('id').eq('novel_id', nid).eq('chapter_number', num).maybeSingle();
  if (!ch) return toast('Chapter not found','err');
  const { error } = await sb.from('chapters').delete().eq('id', ch.id);
  if (error) return toast(error.message,'err');
  toast('Deleted','ok'); document.getElementById('loadChapters').click();
};

document.getElementById('loadChapters').onclick = async () => {
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return toast('Novel not found','err');
  const { data, error } = await sb.from('chapters').select('id,title,chapter_number,created_at').eq('novel_id', nid).order('chapter_number');
  if (error) return toast(error.message,'err');
  const tb = document.querySelector('#chapTable tbody'); document.getElementById('chapTableWrap').style.display='block';
  tb.innerHTML = data.map(r=>`<tr><td>${r.chapter_number}</td><td>${r.title}</td><td>${new Date(r.created_at).toLocaleString()}</td>
  <td><button data-n="${r.chapter_number}" class="btn">Edit</button></td></tr>`).join('');
  tb.querySelectorAll('button').forEach(b=> b.onclick = ()=>{ document.getElementById('c_num').value=b.dataset.n; loadOne(); });
};

async function loadOne(){
  const sl = document.getElementById('c_slug').value.trim();
  const nid = await getNovelId(sl); if (!nid) return;
  const num = parseInt(document.getElementById('c_num').value,10);
  const { data } = await sb.from('chapters').select('title,content').eq('novel_id', nid).eq('chapter_number', num).maybeSingle();
  if (data){ document.getElementById('c_title').value=data.title; document.getElementById('c_content').value=data.content; }
}

document.getElementById('c_num').addEventListener('change',loadOne);
