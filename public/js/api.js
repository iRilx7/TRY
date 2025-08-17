import { sb } from './supabaseClient.js';

/* Auth helpers */
export async function session(){ return (await sb.auth.getSession()).data.session; }
export async function user(){ return (await sb.auth.getUser()).data.user; }
export async function isAdmin(){
  const u = await user(); if(!u) return false;
  const { data, error } = await sb.from('admins').select('user_id').eq('user_id', u.id).maybeSingle();
  return !!data && !error;
}

/* Novels */
export async function listNovels(q=null){
  let query = sb.from('novels').select('*');
  if (q && q.trim()) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  query = query.order('created_at', { ascending:false });
  return (await query).data || [];
}
export async function getNovelBySlug(slug){
  return (await sb.from('novels').select('*').eq('slug', slug).single()).data;
}
export async function saveNovel(payload){
  // upsert by slug
  const existing = (await sb.from('novels').select('id').eq('slug', payload.slug).maybeSingle()).data;
  if (existing) return (await sb.from('novels').update(payload).eq('id', existing.id)).data;
  return (await sb.from('novels').insert(payload)).data;
}

/* Chapters */
export async function chaptersForNovel(novel_id){
  return (await sb.from('chapters').select('id, chapter_number, title, created_at').eq('novel_id',novel_id).order('chapter_number',{ascending:true})).data || [];
}
export async function chapterByNumber(novel_id, n){
  return (await sb.from('chapters').select('*').eq('novel_id',novel_id).eq('chapter_number', n).maybeSingle()).data;
}
export async function createChapter(payload){ return (await sb.from('chapters').insert(payload)).data; }
export async function updateChapter(id,patch){ return (await sb.from('chapters').update(patch).eq('id',id)).data; }
export async function deleteChapter(id){ return (await sb.from('chapters').delete().eq('id',id)).data; }

/* Latest updates: derive from latest chapter timestamps */
export async function latestUpdatedNovels(limit=12){
  // Fetch latest chapters, then map to novels
  const { data: ch } = await sb.from('chapters').select('id, novel_id, created_at').order('created_at',{ascending:false}).limit(200);
  const seen = new Set(); const novelIds=[];
  for (const c of ch||[]) { if (!seen.has(c.novel_id)) { seen.add(c.novel_id); novelIds.push(c.novel_id); } if (novelIds.length>=limit) break; }
  if (!novelIds.length) return [];
  const { data: novels } = await sb.from('novels').select('*').in('id', novelIds);
  // sort by first appearance order
  const order = Object.fromEntries(novelIds.map((id,i)=>[id,i]));
  return (novels||[]).sort((a,b)=> order[a.id]-order[b.id]);
}

/* Completed (heuristic): 20+ chapters and no updates in 30 days */
export async function completedNovels(limit=12){
  const cutoff = new Date(Date.now()-30*24*3600*1000).toISOString();
  const { data: counts } = await sb.rpc('noop').catch(()=>({data:null})); // ignore
  const { data: lastCh } = await sb.from('chapters').select('novel_id, created_at').order('created_at',{ascending:false}).limit(1000);
  const map = new Map(); // novel_id -> {last, count}
  for (const c of lastCh||[]) {
    const m = map.get(c.novel_id) || {count:0,last:c.created_at};
    m.count += 1; if (new Date(c.created_at) > new Date(m.last)) m.last = c.created_at;
    map.set(c.novel_id, m);
  }
  const candidates = Array.from(map.entries()).filter(([,v])=> v.count>=20 && v.last < cutoff).map(([k])=>k).slice(0, limit);
  if (!candidates.length) return [];
  return (await sb.from('novels').select('*').in('id', candidates)).data || [];
}

/* Likes per novel */
export async function likeCount(novel_id){
  const { count } = await sb.from('likes').select('id', { count:'exact', head:true }).eq('novel_id', novel_id);
  return count||0;
}
export async function toggleLike(novel_id){
  const u = await user(); if(!u) throw new Error('login');
  const exists = (await sb.from('likes').select('id').eq('user_id',u.id).eq('novel_id',novel_id)).data?.[0];
  if (exists) await sb.from('likes').delete().eq('id', exists.id);
  else await sb.from('likes').insert({ user_id:u.id, novel_id });
}

/* Comments per novel */
export async function listComments(novel_id){
  return (await sb.from('comments').select('id, content, created_at').eq('novel_id',novel_id).order('created_at',{ascending:false})).data || [];
}
export async function addComment(novel_id, content){
  const u = await user(); if(!u) throw new Error('login');
  return (await sb.from('comments').insert({ user_id:u.id, novel_id, content })).data;
}

/* Progress & bookmarks */
export async function getProgress(novel_id){
  const u = await user(); if(!u) return null;
  return (await sb.from('reading_progress').select('*').eq('user_id',u.id).eq('novel_id',novel_id).maybeSingle()).data;
}
export async function saveProgress(novel_id, chapter_id){
  const u = await user(); if(!u) return;
  await sb.from('reading_progress').upsert({ user_id:u.id, novel_id, chapter_id, last_read_at: new Date().toISOString() }, { onConflict: 'user_id,novel_id' });
}

export async function toggleBookmark(chapter_id, novel_id){
  const u = await user(); if(!u) throw new Error('login');
  const ex = (await sb.from('bookmarks').select('id').eq('user_id',u.id).eq('chapter_id',chapter_id)).data?.[0];
  if (ex) return (await sb.from('bookmarks').delete().eq('id', ex.id)).data;
  return (await sb.from('bookmarks').insert({ user_id:u.id, chapter_id, novel_id })).data;
}

export async function listBookmarks(){
  const u = await user(); if(!u) return [];
  const { data: bms } = await sb.from('bookmarks').select('id, chapter_id, novel_id, created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50);
  if (!bms?.length) return [];
  const novelIds = Array.from(new Set(bms.map(b=>b.novel_id)));
  const { data: novels } = await sb.from('novels').select('*').in('id', novelIds);
  const novelMap = new Map((novels||[]).map(n=>[n.id,n]));
  // Get chapter titles
  const chIds = bms.map(b=>b.chapter_id);
  const { data: chaps } = await sb.from('chapters').select('id, novel_id, chapter_number, title').in('id', chIds);
  const chMap = new Map((chaps||[]).map(c=>[c.id,c]));
  return bms.map(b => ({ bookmark:b, novel: novelMap.get(b.novel_id), chapter: chMap.get(b.chapter_id) }));
}
