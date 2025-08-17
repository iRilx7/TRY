(async () => {
  const sb = await supabase.promise;
  const $ = (id) => document.getElementById(id);
  const logoutBtn = $("logoutBtn");

  // Gate admin
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { location.href = "auth.html"; return; }
  const { data: rows } = await sb.from("admins").select("user_id").eq("user_id", user.id).limit(1);
  if (!rows || !rows.length) { alert("Admins only"); location.href = "index.html"; return; }

  logoutBtn.onclick = async (e) => { e.preventDefault(); await sb.auth.signOut(); location.href="auth.html"; };

  // Inputs
  const title = $("title");
  const author = $("author");
  const slug = $("slug");
  const genre = $("genre");
  const cover_url = $("cover_url");
  const description = $("description");
  const coverFile = $("coverFile");
  const preview = $("preview");

  const uploadCoverBtn = $("uploadCoverBtn");
  const saveNovelBtn = $("saveNovelBtn");

  function slugify(s){ return (s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

  title.oninput = () => { if (!slug.value || slug.value.startsWith("auto")) slug.value = slugify(title.value); };
  [title, author, genre, description, cover_url].forEach(el => el.oninput = renderPreview);

  function renderPreview(){
    preview.innerHTML = `
      <div class="n-card">
        <img class="n-cover" src="${cover_url.value||'https://placehold.co/96x130?text=Cover'}">
        <div>
          <div class="title">${title.value||'Untitled'}</div>
          <div class="muted">by ${author.value||'Unknown'}</div>
          <div class="badges"><span class="badge">${genre.value||'General'}</span></div>
          <div class="muted" style="margin-top:6px;font-size:13px">${(description.value||'').slice(0,120)}</div>
        </div>
      </div>`;
  }
  renderPreview();

  uploadCoverBtn.onclick = async () => {
    if (!coverFile.files[0]) return alert("Choose a file first");
    const f = coverFile.files[0];
    const path = `covers/${Date.now()}_${f.name}`;
    const { data, error } = await sb.storage.from("covers").upload(path, f, { cacheControl: "3600", upsert: false });
    if (error) return alert(error.message);
    const { data: pub } = sb.storage.from("covers").getPublicUrl(path);
    cover_url.value = pub.publicUrl;
    renderPreview();
  };

  saveNovelBtn.onclick = async () => {
    const payload = {
      slug: slugify(slug.value || title.value),
      title: title.value.trim(),
      author: author.value.trim(),
      genre: genre.value || "General",
      description: description.value,
      cover_url: cover_url.value
    };
    if (!payload.title) return alert("Title is required");

    // upsert by slug
    const { data, error } = await sb.from("novels").upsert(payload, { onConflict: "slug" }).select("id").single();
    if (error) return alert(error.message);
    alert("Saved ✅");
  };

  // Chapters section
  const c_slug = $("chap_novel_slug");
  const c_num = $("chapter_number");
  const c_title = $("chapter_title");
  const c_content = $("chapter_content");
  const tbl = $("chaptersTable").querySelector("tbody");

  async function getNovelIdBySlug(s){
    const { data, error } = await sb.from("novels").select("id,slug").eq("slug", s).single();
    if (!data) throw new Error("Novel not found by slug");
    return data.id;
  }

  $("suggestBtn").onclick = async () => {
    try {
      const nid = await getNovelIdBySlug(c_slug.value.trim());
      const { data } = await sb.from("chapters").select("chapter_number").eq("novel_id", nid).order("chapter_number", {ascending:false}).limit(1);
      const next = (data && data.length ? (data[0].chapter_number+1) : 1);
      c_num.value = String(next);
    } catch(e){ alert(e.message); }
  };

  $("createChapterBtn").onclick = async () => {
    try {
      const nid = await getNovelIdBySlug(c_slug.value.trim());
      const payload = {
        novel_id: nid,
        title: c_title.value.trim() || `Chapter ${c_num.value}`,
        content: c_content.value,
        chapter_number: parseInt(c_num.value,10)||1
      };
      const { error } = await sb.from("chapters").insert(payload);
      if (error) throw error;
      alert("Chapter created ✅");
      loadList();
    } catch(e){ alert(e.message); }
  };

  $("updateChapterBtn").onclick = async () => {
    try {
      const nid = await getNovelIdBySlug(c_slug.value.trim());
      const { error } = await sb.from("chapters")
        .update({ title: c_title.value.trim(), content: c_content.value })
        .eq("novel_id", nid).eq("chapter_number", parseInt(c_num.value,10)||1);
      if (error) throw error;
      alert("Updated ✅");
      loadList();
    } catch(e){ alert(e.message); }
  };

  $("deleteChapterBtn").onclick = async () => {
    try {
      const nid = await getNovelIdBySlug(c_slug.value.trim());
      const { error } = await sb.from("chapters")
        .delete()
        .eq("novel_id", nid).eq("chapter_number", parseInt(c_num.value,10)||1);
      if (error) throw error;
      alert("Deleted ✅");
      loadList();
    } catch(e){ alert(e.message); }
  };

  async function loadList(){
    try {
      const nid = await getNovelIdBySlug(c_slug.value.trim());
      const { data } = await sb.from("chapters").select("id,chapter_number,title,created_at").eq("novel_id", nid).order("chapter_number");
      tbl.innerHTML = (data||[]).map(ch => 
        `<tr>
          <td>#${ch.chapter_number}</td>
          <td>${ch.title}</td>
          <td>${new Date(ch.created_at).toLocaleString()}</td>
          <td><button class="btn ghost" data-num="${ch.chapter_number}">Load</button></td>
        </tr>`).join("");
      tbl.querySelectorAll("button[data-num]").forEach(btn => {
        btn.onclick = async () => {
          c_num.value = btn.getAttribute("data-num");
          const nid2 = await getNovelIdBySlug(c_slug.value.trim());
          const { data: one } = await sb.from("chapters")
            .select("title,content").eq("novel_id", nid2).eq("chapter_number", parseInt(c_num.value,10)||1).single();
          c_title.value = one?.title || "";
          c_content.value = one?.content || "";
        };
      });
    } catch(e){ alert(e.message); }
  }
  $("loadListBtn").onclick = loadList;
})();