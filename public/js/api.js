import { sb, DEMO } from './supabaseClient.js';

async function demoData() {
  const res = await fetch('./sample/sample.json'); return res.json();
}

export const api = {
  async listNovels(){
    if (DEMO){ const d = await demoData(); return d.novels; }
    const { data } = await sb.from('novels').select('*').eq('is_published', true).order('updated_at',{ascending:false});
    return data||[];
  },
  async getNovelBySlug(slug){
    if (DEMO){ const d = await demoData(); return d.novels.find(n=>n.slug===slug); }
    const { data } = await sb.from('novels').select('*').eq('slug', slug).maybeSingle();
    return data;
  },
  async listChapters(novel_id_or_slug){
    if (DEMO){
      const d = await demoData();
      const slug = typeof novel_id_or_slug==='string'?novel_id_or_slug:d.novels.find(n=>n.id===novel_id_or_slug).slug;
      return (d.chapters[slug]||[]).map(c=>({ index_in_novel:c.index, title:c.title, id:c.index }));
    }
    const novel_id = typeof novel_id_or_slug==='string' ? (await this.getNovelBySlug(novel_id_or_slug)).id : novel_id_or_slug;
    const { data } = await sb.from('chapters').select('id,index_in_novel,title').eq('novel_id', novel_id).eq('is_published', true).order('index_in_novel', {ascending:true});
    return data||[];
  },
  async getChapter(novel_id_or_slug, index){
    if (DEMO){
      const d = await demoData();
      const slug = typeof novel_id_or_slug==='string'?novel_id_or_slug:d.novels.find(n=>n.id===novel_id_or_slug).slug;
      const r = (d.chapters[slug]||[]).find(c=>c.index==index);
      if (!r) return null;
      return { id:index, index_in_novel:index, title:r.title, content:r.content, published_at:new Date().toISOString() };
    }
    const novel_id = typeof novel_id_or_slug==='string' ? (await this.getNovelBySlug(novel_id_or_slug)).id : novel_id_or_slug;
    const { data } = await sb.from('chapters').select('id,index_in_novel,title,content,published_at').eq('novel_id', novel_id).eq('index_in_novel', index).single();
    return data;
  },
  async getSession(){ if (DEMO) return { user:null }; const { data } = await sb.auth.getSession(); return data.session || { user:null }; },
  async signOut(){ if (DEMO) return; await sb.auth.signOut(); },

  // Social & progress (no-ops in demo)
  async getProgress(novel_id){ if (DEMO) return null; const { data } = await sb.from('reading_progress').select('*').eq('novel_id', novel_id).maybeSingle(); return data; },
  async saveProgress(novel_id, last_chapter_index, last_scroll_pct){ if (DEMO) return; const user=(await sb.auth.getUser()).data.user; if(!user) return;
    await sb.from('reading_progress').upsert({ user_id:user.id, novel_id, last_chapter_index, last_scroll_pct }, { onConflict:'user_id,novel_id' });
  },
  async toggleBookmark(chapter_id){ if (DEMO) return; const u=(await sb.auth.getUser()).data.user; if(!u) return; const e=(await sb.from('bookmarks').select('id').eq('user_id',u.id).eq('chapter_id',chapter_id)).data?.[0];
    if(e) await sb.from('bookmarks').delete().eq('id', e.id); else await sb.from('bookmarks').insert({user_id:u.id, chapter_id});
  },
  async countLikes(chapter_id){ if (DEMO) return 0; const { count } = await sb.from('likes').select('id',{count:'exact',head:true}).eq('chapter_id', chapter_id); return count||0; },
  async toggleLike(chapter_id){ if (DEMO) return; const u=(await sb.auth.getUser()).data.user; if(!u) return; const e=(await sb.from('likes').select('id').eq('user_id',u.id).eq('chapter_id',chapter_id)).data?.[0];
    if(e) await sb.from('likes').delete().eq('id',e.id); else await sb.from('likes').insert({user_id:u.id,chapter_id});
  },
  async listComments(chapter_id){ if (DEMO) return []; const { data } = await sb.from('comments').select('id,body,created_at').eq('chapter_id',chapter_id).order('created_at',{ascending:false}); return data||[]; },
  async addComment(chapter_id, body){ if (DEMO) return; const u=(await sb.auth.getUser()).data.user; if(!u) return; await sb.from('comments').insert({user_id:u.id, chapter_id, body}); }
}
