(async () => {
  const sb = await supabase.promise;
  const qs = new URLSearchParams(location.search);
  const slug = qs.get("slug");
  let chNo = parseInt(qs.get("ch") || "1", 10);

  const $ = (id) => document.getElementById(id);
  const toc = $("toc");
  const content = $("chapterContent");
  const titleEl = $("chapterTitle");
  const meta = $("chapterMeta");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const novelLink = $("novelLink");

  const nv = await sb.from("novels").select("id,title,slug").eq("slug", slug).single();
  if (!nv.data){ content.textContent = "Novel not found"; return; }
  novelLink.href = `novel.html?slug=${encodeURIComponent(slug)}`;

  const { data: chapters } = await sb.from("chapters").select("id,chapter_number,title,content,created_at").eq("novel_id", nv.data.id).order("chapter_number");

  function renderTOC() {
    toc.innerHTML = chapters.map(c => `<a href="reader.html?slug=${encodeURIComponent(slug)}&ch=${c.chapter_number}" class="${c.chapter_number===chNo?'active':''}">#${c.chapter_number} — ${c.title}</a>`).join("");
  }
  function renderChapter() {
    const ch = chapters.find(c => c.chapter_number===chNo) || chapters[0];
    if (!ch) { content.textContent = "No chapters yet"; return; }
    chNo = ch.chapter_number;
    titleEl.textContent = ch.title;
    meta.textContent = `Chapter #${ch.chapter_number} • ${new Date(ch.created_at).toLocaleString()}`;
    content.innerHTML = ch.content;
    prevBtn.disabled = (chNo <= (chapters[0]?.chapter_number||1));
    nextBtn.disabled = (chNo >= (chapters[chapters.length-1]?.chapter_number||1));
  }
  renderTOC(); renderChapter();

  prevBtn.onclick = () => { if (chNo>chapters[0].chapter_number) { chNo--; renderChapter(); renderTOC(); history.replaceState(null,"",`?slug=${encodeURIComponent(slug)}&ch=${chNo}`);} };
  nextBtn.onclick = () => { if (chNo<chapters[chapters.length-1].chapter_number) { chNo++; renderChapter(); renderTOC(); history.replaceState(null,"",`?slug=${encodeURIComponent(slug)}&ch=${chNo}`);} };

  // Font size
  document.getElementById("smaller").onclick = () => { document.querySelector(".reader .content").style.fontSize="16px"; };
  document.getElementById("bigger").onclick = () => { document.querySelector(".reader .content").style.fontSize="20px"; };
})();