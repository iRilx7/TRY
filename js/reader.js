
async function main(){
  const slug=q('slug'); let chNum=parseInt(q('ch'),10)||null;
  const {data:novel}=await sb.from('novels').select('id,title').eq('slug',slug).maybeSingle();
  if(!novel){ toast('Novel not found'); return; }
  const {data:chapters}=await sb.from('chapters').select('id,chapter_number,title,created_at').eq('novel_id',novel.id).order('chapter_number');
  if(!chapters?.length){ toast('No chapters'); return; }
  if(!chNum) chNum=chapters[0].chapter_number;
  const curr=chapters.find(c=>c.chapter_number===chNum) || chapters[0];

  const toc=el('#toc'); toc.innerHTML='';
  chapters.forEach(c=>{
    const a=document.createElement('a'); a.href=`reader.html?slug=${encodeURIComponent(slug)}&ch=${c.chapter_number}`; a.textContent=`#${c.chapter_number} — ${c.title}`;
    if(c.chapter_number===curr.chapter_number) a.style.background='#213050';
    toc.appendChild(a);
  });

  const {data:full}=await sb.from('chapters').select('title,content,created_at').eq('id',curr.id).maybeSingle();
  el('#title').textContent = full ? `${curr.chapter_number}. ${full.title}` : `${curr.chapter_number}`;
  el('#meta').textContent = `Chapter #${curr.chapter_number} • ${new Date(curr.created_at).toLocaleString()}`;
  const ct=el('#content');
  if(full?.content && /<[a-z][\s\S]*>/i.test(full.content)) ct.innerHTML=full.content; else ct.textContent=full?.content||'';

  const ix=chapters.findIndex(c=>c.id===curr.id), prev=chapters[ix-1], next=chapters[ix+1];
  el('#prevBtn').href=prev?`reader.html?slug=${encodeURIComponent(slug)}&ch=${prev.chapter_number}`:'#';
  el('#nextBtn').href=next?`reader.html?slug=${encodeURIComponent(slug)}&ch=${next.chapter_number}`:'#';

  // font size controls
  let size=18; el('#inc').onclick=()=>{ size=Math.min(28,size+1); ct.style.fontSize=size+'px'; };
  el('#dec').onclick=()=>{ size=Math.max(14,size-1); ct.style.fontSize=size+'px'; };
}
main();
