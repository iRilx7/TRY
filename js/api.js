
import { sb } from './supabaseClient.js';

/* Auth helpers */
export async function user(){ return (await sb.auth.getUser()).data.user; }
export async function isAdmin(){
  const u = await user(); if(!u) return false;
  const { data } = await sb.from('admins').select('user_id').eq('user_id', u.id).maybeSingle();
  return !!data;
}

/* Novels */
export async function listNovels(q=null){
  let query = sb.from('novels').select('*').order('created_at',{ascending:false});
  if (q && q.trim()){ const s=q.trim(); query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%`); }
  const { data } = await query; return data||[];
}
export async function getNovelBySlug(slug){ return (await sb.from('novels').select('*').eq('slug', slug).single()).data; }
export async function saveNovel(payload){
  // Always allow appearance even with 0 chapters. Upsert by slug.
  const base = { slug: payload.slug, title: payload.title, author: payload.author||null, description: payload.description||null, cover_url: payload.cover_url||null };
  try{
    // Try with genres column if it exists
    const withGenres = { ...base, genres: payload.genres||null };
    const { error } = await sb.from('novels').upsert(withGenres, { onConflict: 'slug' });
    if (error) throw error;
  }catch(e){
    // Fallback: strip genres (for schemas without the column)
    await sb.from('novels').upsert(base, { onConflict: 'slug' });
  }
}

/* Chapters */
export async function chaptersForNovel(novel_id){
  const { data } = await sb.from('chapters').select('id,chapter_number,title,created_at').eq('novel_id',novel_id).order('chapter_number',{ascending:true});
  return data||[];
}
export async function chapterByNumber(novel_id,n){
  return (await sb.from('chapters').select('*').eq('novel_id',novel_id).eq('chapter_number',n).maybeSingle()).data;
}
export async function nextChapterNumber(novel_id){
  const list = await chaptersForNovel(novel_id);
  return (list.at(-1)?.chapter_number||0)+1;
}

/* Social */
export async function likeCount(novel_id){
  const { count } = await sb.from('likes').select('id',{count:'exact',head:true}).eq('novel_id',novel_id);
  return count||0;
}
export async function toggleLike(novel_id){
  const u = await user(); if(!u) throw new Error('login');
  const exists = (await sb.from('likes').select('id').eq('user_id',u.id).eq('novel_id',novel_id)).data?.[0];
  if (exists) await sb.from('likes').delete().eq('id', exists.id);
  else await sb.from('likes').insert({ user_id:u.id, novel_id });
}
export async function listComments(novel_id){
  return (await sb.from('comments').select('id,content,created_at').eq('novel_id',novel_id).order('created_at',{ascending:false})).data||[];
}
export async function addComment(novel_id, content){
  const u = await user(); if(!u) throw new Error('login');
  return (await sb.from('comments').insert({ user_id:u.id, novel_id, content })).data;
}
export async function toggleBookmark(chapter_id, novel_id){
  const u = await user(); if(!u) throw new Error('login');
  const ex = (await sb.from('bookmarks').select('id').eq('user_id',u.id).eq('chapter_id',chapter_id)).data?.[0];
  if (ex) return (await sb.from('bookmarks').delete().eq('id', ex.id)).data;
  return (await sb.from('bookmarks').insert({ user_id:u.id, chapter_id, novel_id })).data;
}
export async function getProgress(novel_id){
  const u = await user(); if(!u) return null;
  return (await sb.from('reading_progress').select('*').eq('user_id',u.id).eq('novel_id',novel_id).maybeSingle()).data;
}
export async function saveProgress(novel_id, chapter_id){
  const u = await user(); if(!u) return;
  await sb.from('reading_progress').upsert({ user_id:u.id, novel_id, chapter_id, last_read_at:new Date().toISOString() }, { onConflict:'user_id,novel_id' });
}

/* Sections */
export async function latestUpdatedNovels(limit=8){
  const { data: ch } = await sb.from('chapters').select('novel_id,created_at').order('created_at',{ascending:false}).limit(200);
  const seen = new Set(); const ids=[];
  for (const c of ch||[]){ if(!seen.has(c.novel_id)){ seen.add(c.novel_id); ids.push(c.novel_id); } if(ids.length>=limit) break; }
  if (!ids.length) return [];
  return (await sb.from('novels').select('*').in('id', ids)).data||[];
}
export async function completedNovels(limit=8){
  const cutoff = new Date(Date.now()-30*24*3600*1000).toISOString();
  const { data: last } = await sb.from('chapters').select('novel_id,created_at').order('created_at',{ascending:false}).limit(1000);
  const map=new Map();
  for (const c of last||[]){ const x=map.get(c.novel_id)||{count:0,last:c.created_at}; x.count++; if(new Date(c.created_at)>new Date(x.last)) x.last=c.created_at; map.set(c.novel_id,x); }
  const ids = Array.from(map.entries()).filter(([,v])=>v.count>=20 && v.last<cutoff).map(([k])=>k).slice(0,limit);
  if (!ids.length) return [];
  return (await sb.from('novels').select('*').in('id',ids)).data||[];
}
export async function trendingNovels(limit=8){
  const { data: novels } = await sb.from('novels').select('*').order('created_at',{ascending:false}).limit(100);
  const arr=[]; for (const n of novels||[]){ const c = await likeCount(n.id); arr.push({n,c}); }
  return arr.sort((a,b)=>b.c-a.c).slice(0,limit).map(x=>x.n);
}
