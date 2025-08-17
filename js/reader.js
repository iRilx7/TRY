
import { $, html, throttle, toast } from './utils.js';
import { getNovelBySlug, chaptersForNovel, chapterByNumber, toggleLike, likeCount, listComments, addComment, toggleBookmark, saveProgress } from './api.js';

const params = new URLSearchParams(location.search);
const slug = params.get('novel');
let chIndex = Number(params.get('ch')||'1');
let novel=null, chapters=[], current=null;

function setNav(){
  $('#prev').onclick = (e)=>{ if(chIndex<=1){e.preventDefault();return;} chIndex--; location.search=`?novel=${encodeURIComponent(slug)}&ch=${chIndex}`; };
  $('#next').onclick = (e)=>{ if(chIndex>=chapters.length){e.preventDefault();return;} chIndex++; location.search=`?novel=${encodeURIComponent(slug)}&ch=${chIndex}`; };
}
function renderTOC(){
  const toc=$('#toc'); toc.innerHTML='';
  for (const c of chapters){
    const a=document.createElement('a');
    a.textContent = `${c.chapter_number}. ${c.title}`;
    a.href = `?novel=${encodeURIComponent(slug)}&ch=${c.chapter_number}`;
    if (c.chapter_number===chIndex) a.classList.add('active');
    toc.append(a);
  }
}
function applyFont(){
  let fontSize = Number(localStorage.getItem('fontSize') || 18);
  $('#content').style.fontSize = fontSize + 'px';
  $('#fontPlus').onclick = ()=>{fontSize=Math.min(28,fontSize+1);localStorage.setItem('fontSize',fontSize);applyFont();};
  $('#fontMinus').onclick = ()=>{fontSize=Math.max(14,fontSize-1);localStorage.setItem('fontSize',fontSize);applyFont();};
}
async function loadComments(){
  const list = await listComments(novel.id);
  const wrap = $('#comments'); wrap.innerHTML='';
  for (const c of list){
    wrap.append(html`<div class="comment"><div>${c.content}</div><div class="meta">${new Date(c.created_at).toLocaleString()}</div></div>`);
  }
  $('#c_submit').onclick = async () => {
    const body = $('#c_body').value.trim(); if(!body) return;
    try { await addComment(novel.id, body); toast('Comment posted'); location.reload(); } catch { toast('Please log in first','warn'); }
  };
}
async function load(){
  novel = await getNovelBySlug(slug);
  $('#novelTitle').textContent = novel.title;
  chapters = await chaptersForNovel(novel.id);
  if (!chapters.length){ $('#content').innerHTML = '<p>No chapters yet.</p>'; return; }
  if (chIndex<1 || chIndex>chapters.length) chIndex=1;
  current = await chapterByNumber(novel.id, chIndex);
  $('#chapterTitle').textContent = current.title;
  $('#content').innerHTML = current.content;
  setNav(); renderTOC(); applyFont();
  $('#like').textContent = '❤ ' + (await likeCount(novel.id));
  $('#like').onclick = async ()=>{ try{ await toggleLike(novel.id); toast('Toggled like'); location.reload(); }catch{ toast('Log in first','warn'); } };
  $('#bookmark').onclick = async ()=>{ try{ await toggleBookmark(current.id, novel.id); toast('Toggled bookmark'); }catch{ toast('Log in first','warn'); } };
  const handler = throttle(async ()=>{ await saveProgress(novel.id, current.id); }, 1200);
  addEventListener('scroll', handler, { passive:true });
  await loadComments();
}
load();
