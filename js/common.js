
async function getUser(){ const { data } = await sb.auth.getUser(); return data?.user||null; }
function el(q,scope=document){ return scope.querySelector(q); }
function els(q,scope=document){ return Array.from(scope.querySelectorAll(q)); }
function q(name){ const p=new URLSearchParams(location.search); return p.get(name); }
function slugify(s){ return (s||"").toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,80); }
function toast(msg, ok=false){
  const n=document.createElement('div');
  n.textContent=msg; n.style.cssText=`position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
  background:${ok?'#19c37d':'#ff5577'};color:#fff;padding:10px 14px;border-radius:10px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3);font-weight:800`;
  document.body.appendChild(n); setTimeout(()=>n.remove(),2200);
}
function renderNav(){
  const bar=document.createElement('div'); bar.className='nav';
  bar.innerHTML=`<div class="container">
    <div class="brand"><span class="dot"></span>NovelHub</div>
    <div class="navspace"></div>
    <a class="btn" href="index.html">Home</a>
    <a class="btn" href="profile.html">Profile</a>
    <a class="btn" href="admin.html">Admin</a>
    <a class="btn" href="auth.html" id="loginLink">Log in</a>
  </div>`;
  document.body.prepend(bar);
  getUser().then(u=>{
    if(u){
      const l=bar.querySelector('#loginLink'); const out=document.createElement('a');
      out.className='btn'; out.textContent='Log out'; out.href='#'; out.onclick=async(e)=>{e.preventDefault(); await sb.auth.signOut(); location.href='auth.html';};
      l.replaceWith(out);
    }else{
      bar.querySelector('a[href="profile.html"]').classList.add('hidden');
      bar.querySelector('a[href="admin.html"]').classList.add('hidden');
    }
  });
}
