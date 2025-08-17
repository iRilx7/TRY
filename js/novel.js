
async function main(){
  const slug=q('slug'); if(!slug){ location.href='index.html'; return; }
  const {data:n,error}=await sb.from('novels').select('*').eq('slug',slug).maybeSingle();
  if(error||!n){ el('#content').innerHTML='<h2>Novel not found</h2>'; return; }
  const {data:ch}=await sb.from('chapters').select('chapter_number,title').eq('novel_id',n.id).order('chapter_number');
  const first=ch?.[0]?.chapter_number;
  const chips=(n.genres||[]).map(g=>`<a class="chip" href="index.html?g=${encodeURIComponent(g)}">${g}</a>`).join('');
  el('#content').innerHTML=`
    <div class="hero">
      <img class="cover" src="${n.cover_url||''}" alt="cover">
      <div>
        <h1>${n.title}</h1>
        <div class="small">by <a href="index.html?author=${encodeURIComponent(n.author||'')}">${n.author||'Unknown'}</a></div>
        <div class="chips" style="margin:8px 0 12px;">${chips}</div>
        <p>${n.description||''}</p>
        ${first?`<a class="btn primary" href="reader.html?slug=${encodeURIComponent(slug)}&ch=${first}">Start reading</a>`:''}
      </div>
    </div>
    <hr><h3>Chapters</h3>
    <table class="list"><thead><tr><th>#</th><th>Title</th></tr></thead><tbody id="rows"></tbody></table>`;
  const tbody=el('#rows'); (ch||[]).forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.chapter_number}</td><td><a href="reader.html?slug=${encodeURIComponent(slug)}&ch=${r.chapter_number}">${r.title}</a></td>`;
    tbody.appendChild(tr);
  });
}
main();
