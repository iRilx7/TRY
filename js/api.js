
import sb from './supabaseClient.js';
export async function listNovels(q){ let x=sb.from('novels').select('*').order('created_at',{ascending:false}); if(q) x=x.or(`title.ilike.%${q}%,author.ilike.%${q}%`); return (await x).data||[]; }
export async function getNovelById(id){ return (await sb.from('novels').select('*').eq('id',id).single()).data; }
export async function chaptersForNovel(novel_id){ return (await sb.from('chapters').select('id,chapter_number,title,created_at').eq('novel_id',novel_id).order('chapter_number')).data||[]; }
export async function chapterByNumber(novel_id,n){ return (await sb.from('chapters').select('*').eq('novel_id',novel_id).eq('chapter_number',n).maybeSingle()).data; }
export async function likeCount(novel_id){ return (await sb.from('likes').select('id',{count:'exact',head:true}).eq('novel_id',novel_id)).count||0; }
export async function user(){ return (await sb.auth.getUser()).data.user; }
export async function isAdmin(){ const u=await user(); if(!u) return false; return !!(await sb.from('admins').select('user_id').eq('user_id',u.id).maybeSingle()).data; }
export async function saveNovel(payload){ const base=payload.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'novel'; if(!payload.id) payload.slug=base; const {data,error}=await sb.from('novels').upsert(payload,{onConflict:'slug'}).select().limit(1); if(error) throw error; return data?.[0]; }
export async function deleteNovel(id){ return await sb.from('novels').delete().eq('id',id); }
export async function nextChapterNumber(novel_id){ const l=await chaptersForNovel(novel_id); return (l.at(-1)?.chapter_number||0)+1; }
export async function createChapter(nid,num,t,body){ const {error}=await sb.from('chapters').insert({novel_id:nid,chapter_number:num,title:t,content:body}); if(error) throw error; }
export async function updateChapter(nid,num,t,body){ const row=(await sb.from('chapters').select('id').eq('novel_id',nid).eq('chapter_number',num).maybeSingle()).data; if(!row) throw new Error('Chapter not found'); const {error}=await sb.from('chapters').update({title:t,content:body}).eq('id',row.id); if(error) throw error; }
export async function deleteChapter(nid,num){ const row=(await sb.from('chapters').select('id').eq('novel_id',nid).eq('chapter_number',num).maybeSingle()).data; if(!row) throw new Error('Chapter not found'); const {{error}}=await sb.from('chapters').delete().eq('id',row.id); if(error) throw error; }
