
import { $, html } from './utils.js';
import { getNovelById, chaptersForNovel, likeCount } from './api.js';
const id=Number(new URLSearchParams(location.search).get('id')); let novel=null, chapters=[];
function chItem(c){ const li=document.createElement('li'); li.innerHTML=`<a class="btn" href="reader.html?id=${id}&ch=${c.chapter_number}">#${c.chapter_number} ${c.title}</a>`; return li; }
async function load(){ novel=await getNovelById(id); if(!novel) return; $('#title').textContent=novel.title; $('#author').textContent=novel.author||''; $('#desc').textContent=novel.description||''; $('#cover').src=novel.cover_url||`https://picsum.photos/seed/${encodeURIComponent(novel.slug)}/800/1200`; $('#likes').textContent='❤ '+await likeCount(id); chapters=await chaptersForNovel(id); const ul=$('#chapList'); ul.innerHTML=''; chapters.forEach(c=>ul.append(chItem(c))); $('#start').href=`reader.html?id=${id}&ch=${chapters[0]?.chapter_number||1}`; $('#continue').href=`reader.html?id=${id}&ch=${chapters[0]?.chapter_number||1}`; $('#filterCh').oninput=e=>{ const s=e.target.value.toLowerCase(); ul.querySelectorAll('li').forEach(li=>li.style.display=li.textContent.toLowerCase().includes(s)?'':'none'); }; }
load();
