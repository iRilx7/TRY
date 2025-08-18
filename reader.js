
// demo data – replace with your injected chapter + toc data
const demoChapters = [
  { n:1, title:'Merging with Brook, Escaping from Hell' },
  { n:2, title:'Escape from the Florian Triangle' }
]
const demoContent = `The underworld. The road to the afterlife.\n\nBrook slowly opened his eyes…`

// Render TOC
const toc = document.getElementById('toc')
demoChapters.forEach(c=>{
  const a = document.createElement('a')
  a.href = '#'
  a.textContent = `#${c.n} — ${c.title}`
  a.style.display='block'
  a.style.padding='6px 0'
  a.onclick = e=>{ e.preventDefault(); loadChapter(c.n) }
  toc.appendChild(a)
})

function isArabic(s){
  return /[\u0600-\u06FF]/.test(s)
}

function applyDirection(el, text){
  if(isArabic(text)){
    el.setAttribute('dir','rtl')
    el.setAttribute('lang','ar')
  }else{
    el.setAttribute('dir','ltr')
    el.setAttribute('lang','en')
  }
}

function loadChapter(n){
  const body = document.getElementById('chapterBody')
  const text = demoContent
  body.textContent = text  // pre-wrap will keep spaces/newlines
  applyDirection(body, text)
}
loadChapter(1)

// Font size controls
let current = 1.08
document.getElementById('fontPlus').onclick = ()=>{
  current = Math.min(current+0.06, 1.6)
  document.querySelector('.chapter-text').style.fontSize = current+'rem'
}
document.getElementById('fontMinus').onclick = ()=>{
  current = Math.max(current-0.06, 0.9)
  document.querySelector('.chapter-text').style.fontSize = current+'rem'
}
