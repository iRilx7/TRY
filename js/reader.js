
import { $, } from './utils.js';
import { getNovelById, chaptersForNovel, chapterByNumber } from './api.js';
const p=new URLSearchParams(location.search); const id=Number(p.get('id')); let idx=Number(p.get('ch')||'1'); let chapters=[];
function setNav(){ $('#prev').onclick=()=>{ if(idx>1){ idx--; location.search=`?id=${id}&ch=${idx}` } }; $('#next').onclick=()=>{ if(idx<chapters.length){ idx++; location.search=`?id=${id}&ch=${idx}` } }; }
function font(){ let s=Number(localStorage.getItem('f')||18); const apply=()=>$('#content').style.fontSize=s+'px'; $('#fontPlus').onclick=()=>{s=Math.min(28,s+1);localStorage.setItem('f',s);apply()}; $('#fontMinus').onclick=()=>{s=Math.max(14,s-1);localStorage.setItem('f',s);apply()}; apply(); }
async function load(){ const novel=await getNovelById(id); $('#novelTitle').textContent=novel.title; chapters=await chaptersForNovel(id); const toc=document.getElementById('toc'); toc.innerHTML=''; for(const c of chapters){ const a=document.createElement('a'); a.className='btn'; a.style.display='block'; a.textContent=`${c.chapter_number}. ${c.title}`; a.href=`?id=${id}&ch=${c.chapter_number}`; toc.append(a); } if(idx<1||idx>chapters.length) idx=1; const cur=await chapterByNumber(id,idx); $('#chapterTitle').textContent=cur.title; document.getElementById('content').innerHTML=cur.content; setNav(); font(); }
load();
