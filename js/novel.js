(async () => {
  const sb = await supabase.promise;
  const qs = new URLSearchParams(location.search);
  const slug = qs.get("slug");

  const $ = (id) => document.getElementById(id);
  const titleEl = $("novelTitle");
  const metaEl = $("novelMeta");
  const coverEl = $("novelCover");
  const descEl = $("novelDesc");
  const badgesEl = $("novelBadges");
  const chaptersList = $("chaptersList");
  const startBtn = $("startReading");

  const { data: novels, error } = await sb.from("novels").select("*").eq("slug", slug).single();
  if (!novels) { titleEl.textContent = "Not found"; return; }

  titleEl.textContent = novels.title;
  metaEl.innerHTML = `by <a href="index.html?author=${encodeURIComponent(novels.author||'')}">${novels.author||'Unknown'}</a> · <a class="badge" href="index.html?genre=${encodeURIComponent(novels.genre||'General')}">${novels.genre||'General'}</a>`;
  coverEl.src = novels.cover_url || "https://placehold.co/160x210?text=Cover";
  descEl.textContent = novels.description || "";

  const { data: chs } = await sb.from("chapters").select("id,chapter_number,title,created_at").eq("novel_id", novels.id).order("chapter_number");
  chaptersList.innerHTML = (chs||[]).map(ch => 
    `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:36px" class="muted">#${ch.chapter_number}</div>
      <a href="reader.html?slug=${encodeURIComponent(slug)}&ch=${ch.chapter_number}">${ch.title}</a>
      <span class="muted" style="margin-left:auto">${new Date(ch.created_at).toLocaleString()}</span>
    </div>`
  ).join("") || "<div class='muted'>No chapters yet</div>";

  const first = (chs && chs[0]) ? chs[0].chapter_number : 1;
  startBtn.href = `reader.html?slug=${encodeURIComponent(slug)}&ch=${first}`;
})();