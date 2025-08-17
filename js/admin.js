
const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Harem","Historical","Horror","Isekai","Magic","Martial Arts","Mystery","Romance","Sci‑Fi","Slice of Life","Supernatural","Tragedy","Wuxia","Xianxia","General"];

let selectedGenres = new Set();
let currentNovel = null; // {id, ...}

function renderGenreBank(){
  const bank=el('#genreBank'); bank.innerHTML='';
  GENRES.forEach(g=>{
    const c=document.createElement('span'); c.className='chip'; c.textContent=g;
    if(selectedGenres.has(g)) c.classList.add('active');
    c.onclick=()=>{ selectedGenres.has(g)?selectedGenres.delete(g):selectedGenres.add(g); renderGenreBank(); };
    bank.appendChild(c);
  });
}

async function requireAdmin(){
  const user = await getUser(); if(!user){ location.href='auth.html'; return; }
  const { data, error } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if(error){ toast(error.message); return; }
  if(!data){ el('#gate').innerHTML='<h2>Not an admin</h2><p class="small">Ask the owner to add your id into public.admins.</p>'; return; }
  el('#gate').classList.add('hidden'); el('#adminApp').style.display='grid';
  renderGenreBank(); loadNovels();
}
requireAdmin();

async function loadNovels(){
  const {data,error}=await sb.from('novels').select('id,title,author,slug,created_at').order('created_at',{ascending:false});
  if(error){ toast(error.message); return; }
  const list=el('#novelList'); list.innerHTML='';
  data.forEach(n=>{
    const div=document.createElement('div'); div.className='n-item'; div.innerHTML=`<b>${n.title||'(untitled)'}</b><div class="small">${n.author||'Unknown'} • ${n.slug}</div>`;
    div.onclick=()=>openNovel(n.id);
    list.appendChild(div);
  });
}

async function openNovel(id){
  const {data:n,error}=await sb.from('novels').select('*').eq('id',id).maybeSingle();
  if(error||!n){ toast('Novel missing'); return; }
  currentNovel=n; selectedGenres = new Set(n.genres||[]); renderGenreBank();
  el('#nid').value=n.id; el('#title').value=n.title||''; el('#author').value=n.author||''; el('#cover_url').value=n.cover_url||''; el('#description').value=n.description||''; el('#genresExtra').value='';
  // chapters preview
  el('#chTable').innerHTML='';
}

el('#newNovel').onclick=()=>{ currentNovel=null; el('#nid').value=''; el('#title').value=''; el('#author').value=''; el('#cover_url').value=''; el('#description').value=''; selectedGenres=new Set(); renderGenreBank(); };

// Upload cover
el('#uploadBtn').onclick=async()=>{
  const file=el('#cover_file').files[0]; if(!file) return toast('Choose a file');
  const path=`covers/${Date.now()}-${file.name}`;
  const {error}=await sb.storage.from('covers').upload(path, file, {upsert:true});
  if(error) return toast(error.message);
  const {data} = sb.storage.from('covers').getPublicUrl(path);
  el('#cover_url').value=data.publicUrl; toast('Cover uploaded ✓',true);
};

el('#saveNovel').onclick=async()=>{
  // merge custom genres
  const custom=(el('#genresExtra').value||'').split(',').map(s=>s.trim()).filter(Boolean);
  const genres=Array.from(new Set([...selectedGenres, ...custom]));
  const payload={ title:el('#title').value.trim(), author:el('#author').value.trim(), cover_url:el('#cover_url').value.trim(), description:el('#description').value.trim(), genres };
  if(!payload.title) return toast('Title required');
  // slug from title
  payload.slug = slugify(payload.title);
  if(el('#nid').value){
    const id=parseInt(el('#nid').value,10);
    const {error}=await sb.from('novels').update(payload).eq('id',id);
    if(error) return toast(error.message);
    toast('Saved ✓',true); loadNovels();
  }else{
    const {error}=await sb.from('novels').insert(payload);
    if(error) return toast(error.message);
    toast('Created ✓',true); loadNovels();
  }
};

el('#deleteNovel').onclick=async()=>{
  const id=el('#nid').value; if(!id) return toast('Select a novel');
  if(!confirm('Delete this novel and all its chapters?')) return;
  const {error}=await sb.from('novels').delete().eq('id',id);
  if(error) return toast(error.message);
  toast('Deleted'); loadNovels(); el('#newNovel').click();
};

// Chapters CRUD uses currentNovel
async function findChapterId(num){
  if(!currentNovel){ return null; }
  const {data}=await sb.from('chapters').select('id').eq('novel_id',currentNovel.id).eq('chapter_number',num).maybeSingle();
  return data?.id||null;
}
el('#suggestNext').onclick=async()=>{
  if(!currentNovel) return toast('Pick a novel');
  const {data}=await sb.from('chapters').select('chapter_number').eq('novel_id',currentNovel.id).order('chapter_number',{ascending:false}).limit(1);
  el('#c_num').value=(data?.[0]?.chapter_number||0)+1;
};
el('#createCh').onclick=async()=>{
  if(!currentNovel) return toast('Pick a novel');
  const payload={ novel_id:currentNovel.id, chapter_number:parseInt(el('#c_num').value,10)||1, title:el('#c_title').value.trim(), content:el('#c_content').value };
  const {error}=await sb.from('chapters').insert(payload); if(error) return toast(error.message);
  toast('Chapter created ✓',true); el('#loadList').click();
};
el('#updateCh').onclick=async()=>{
  if(!currentNovel) return toast('Pick a novel');
  const num=parseInt(el('#c_num').value,10)||1; const id=await findChapterId(num); if(!id) return toast('Not found');
  const payload={ title:el('#c_title').value.trim(), content:el('#c_content').value };
  const {error}=await sb.from('chapters').update(payload).eq('id',id); if(error) return toast(error.message);
  toast('Updated ✓',true); el('#loadList').click();
};
el('#deleteCh').onclick=async()=>{
  if(!currentNovel) return toast('Pick a novel');
  const num=parseInt(el('#c_num').value,10)||1; const id=await findChapterId(num); if(!id) return toast('Not found');
  const {error}=await sb.from('chapters').delete().eq('id',id); if(error) return toast(error.message);
  toast('Deleted'); el('#loadList').click();
};
el('#loadList').onclick=async()=>{
  if(!currentNovel) return toast('Pick a novel');
  const {data,error}=await sb.from('chapters').select('chapter_number,title,created_at').eq('novel_id',currentNovel.id).order('chapter_number');
  if(error) return toast(error.message);
  const tb=el('#chTable'); tb.innerHTML=''; data.forEach(r=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.chapter_number}</td><td>${r.title}</td><td>${new Date(r.created_at).toLocaleString()}</td>`;
    tr.onclick=()=>{ el('#c_num').value=r.chapter_number; el('#c_title').value=r.title; };
    tb.appendChild(tr);
  });
};
