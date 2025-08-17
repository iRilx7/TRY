
function genreChip(g){ const a=document.createElement('a'); a.className='chip'; a.href='index.html?g='+encodeURIComponent(g); a.textContent=g; return a; }

async function render(where, id, limit=60){
  let qy=sb.from('novels').select('*').order('created_at',{ascending:false}).limit(limit);
  if(where) qy=where(qy);
  const {data,error}=await qy; if(error){console.error(error);return;}
  const box=el('#'+id); box.innerHTML='';
  data.forEach(n=>{
    const card=document.createElement('div'); card.className='novel-card';
    const img = n.cover_url ? `<img src="${n.cover_url}" alt="${n.title} cover">` : `<div style="height:300px;background:#0e1526"></div>`;
    card.innerHTML=`${img}
      <div class="info">
        <div class="title"><a href="novel.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></div>
        <div class="author">by <a href="index.html?author=${encodeURIComponent(n.author||'')}">${n.author||'Unknown'}</a></div>
        <div class="chips"></div>
        <div class="desc small">${(n.description||'').slice(0,140)}</div>
      </div>`;
    const chips=card.querySelector('.chips');
    (n.genres||[]).slice(0,3).forEach(g=>chips.appendChild(genreChip(g)));
    box.appendChild(card);
  });
}

function apply(){
  const author=q('author'), g=q('g'), s=q('s'); const af=el('#activeFilter'); let where=null;
  if(author){ af.textContent='Filter: author '+author; where=Q=>Q.ilike('author',author); }
  else if(g){ af.textContent='Filter: genre '+g; where=Q=>Q.contains('genres',[g]); }
  else if(s){ af.textContent='Search: '+s; where=Q=>Q.or(`title.ilike.%${s}%,author.ilike.%${s}%,genres.cs.{${s}}`); }
  else af.textContent='';
  render(where,'all',80);
}
el('#searchBtn').onclick=()=>{ const v=el('#q').value.trim(); if(v) location.href='index.html?s='+encodeURIComponent(v); };
render(null,'latest',12); apply();
