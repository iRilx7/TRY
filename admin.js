
// Minimal admin interactions; wire these to your Supabase calls.
const defaultGenres = ['Action','Adventure','Comedy','Drama','Fantasy','Harem','Historical','Horror','Isekai','Magic','Martial Arts','Mystery','Romance','Sci-Fi','Slice of Life','Supernatural','Tragedy','Wuxia','Xianxia','General']

const chipsWrap = document.getElementById('genreChips')
const active = new Set()

function drawChips(){
  chipsWrap.innerHTML = ''
  defaultGenres.forEach(g=>{
    const b = document.createElement('button')
    b.className = 'chip' + (active.has(g)?' active':'')
    b.textContent = g
    b.onclick = ()=>{ active.has(g)?active.delete(g):active.add(g); drawChips() }
    chipsWrap.appendChild(b)
  })
}
drawChips()

document.getElementById('saveNovel').onclick = async ()=>{
  const payload = {
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim(),
    description: document.getElementById('desc').value,
    cover_url: document.getElementById('cover').value.trim(),
    genres: [...active], // <-- matches genres text[] in DB
  }
  console.log('SAVE NOVEL → send to your API', payload)
  alert('Demo: wire this to Supabase insert/update.
It will write to novels.genres (text[]).')
}
document.getElementById('createChap').onclick = ()=>{
  alert('Demo: wire to Supabase to create chapter.')
}
document.getElementById('updateChap').onclick = ()=>{
  alert('Demo: wire to Supabase to update chapter.')
}
document.getElementById('deleteChap').onclick = ()=>{
  alert('Demo: wire to Supabase to delete chapter.')
}
document.getElementById('loadChaps').onclick = ()=>{
  document.getElementById('chapTable').textContent = 'Demo: fetch chapters list and render.'
}
