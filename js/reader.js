import { sb, toast, params } from './supabaseClient.js';

const slug = params.get('slug'); const ch = parseInt(params.get('ch')||'0',10);
let novel, chapters=[];

async function loadNovel(){
  const { data: n } = await sb.from('novels').select('id,title').eq('slug', slug).maybeSingle();
  novel = n; if (!n){ toast('Novel not found','err'); return; }
  document.getElementById('novelTitle').textContent = n.title;
  const { data: chs } = await sb.from('chapters').select('chapter_number,title').eq('novel_id', n.id).order('chapter_number');
  chapters = chs||[];
  const toc = document.getElementById('toc');
  toc.innerHTML = chapters.map(c=>`<a href="reader.html?slug=${encodeURIComponent(slug)}&ch=${c.chapter_number}" class="${c.chapter_number===ch?'active':''}">#${c.chapter_number} — ${c.title}</a>`).join('');
  if (ch) loadChapter(ch); else document.getElementById('content').innerHTML = '<p class="meta">Choose a chapter from the left.</p>';
}

async function loadChapter(num){
  const { data } = await sb.from('chapters').select('title,content').eq('novel_id', novel.id).eq('chapter_number', num).maybeSingle();
  if (!data) return toast('Chapter not found','err');
  document.getElementById('chapterTitle').textContent = data.title;
  document.getElementById('content').innerHTML = data.content || '';
  document.getElementById('prev').href = num>1 ? `reader.html?slug=${encodeURIComponent(slug)}&ch=${num-1}` : '#';
  const max = chapters[chapters.length-1]?.chapter_number||num;
  document.getElementById('next').href = num<max ? `reader.html?slug=${encodeURIComponent(slug)}&ch=${num+1}` : '#';
}

document.getElementById('fontPlus').onclick = ()=>{ const a=document.getElementById('content'); const s=parseFloat(getComputedStyle(a).fontSize); a.style.fontSize=(s+2)+'px'; };
document.getElementById('fontMinus').onclick = ()=>{ const a=document.getElementById('content'); const s=parseFloat(getComputedStyle(a).fontSize); a.style.fontSize=(s-2)+'px'; };

loadNovel();