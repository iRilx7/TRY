import { sb, toast } from './supabaseClient.js';

async function load() {
  const { data, error } = await sb.from('novels').select('id,slug,title,author,cover_url,created_at').order('created_at', { ascending:false }).limit(40);
  if (error) { toast(error.message,'err'); return; }
  const grid = document.getElementById('grid');
  const latest = document.getElementById('latest');
  const card = (n) => `<a class="card" href="novel.html?slug=${encodeURIComponent(n.slug)}">
      <img src="${n.cover_url||''}" alt="">
      <div class="pad"><div class="badge">${n.author||''}</div><h4>${n.title}</h4></div>
    </a>`;
  latest.innerHTML = data.slice(0,8).map(card).join('');
  grid.innerHTML = data.map(card).join('');
}
load();

document.getElementById('searchBtn').onclick = async () => {
  const q = document.getElementById('q').value.trim();
  const { data, error } = await sb.from('novels').select('slug,title,author,cover_url').ilike('title', `%${q}%`);
  if (error) { toast(error.message,'err'); return; }
  document.getElementById('grid').innerHTML = data.map(n=>`<a class="card" href="novel.html?slug=${encodeURIComponent(n.slug)}">
      <img src="${n.cover_url||''}" alt=""><div class="pad"><div class="badge">${n.author||''}</div><h4>${n.title}</h4></div></a>`).join('');
};