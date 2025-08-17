(async () => {
  const sb = await supabase.promise;

  const $ = (s) => document.querySelector(s);
  const qs = new URLSearchParams(location.search);
  const searchInput = $("#searchInput");
  const searchBtn = $("#searchBtn");
  const latestWrap = $("#latestWrap");
  const allWrap = $("#allWrap");
  const authBtn = $("#authBtn");
  const adminLink = $("#adminLink");

  // session + navbar
  const { data: { user } } = await sb.auth.getUser();
  if (user) {
    authBtn.textContent = "Log out";
    authBtn.href = "#";
    authBtn.onclick = async (e) => { e.preventDefault(); await sb.auth.signOut(); location.reload(); };
    // check admin
    const { data: rows } = await sb.from("admins").select("user_id").eq("user_id", user.id).limit(1);
    if (rows && rows.length) adminLink.style.display = "inline-flex";
  }

  // search handler
  searchBtn.onclick = () => {
    const q = searchInput.value.trim();
    const params = new URLSearchParams(location.search);
    if (q) params.set("q", q); else params.delete("q");
    location.search = params.toString();
  };

  // read filters from URL
  const q = qs.get("q") || "";
  const byAuthor = qs.get("author");
  const byGenre = qs.get("genre");
  if (q) searchInput.value = q;

  function card(nv) {
    const url = `novel.html?slug=${encodeURIComponent(nv.slug)}`;
    const author = `<a href="index.html?author=${encodeURIComponent(nv.author||'')}">${nv.author || "Unknown"}</a>`;
    const genre = `<a class="badge" href="index.html?genre=${encodeURIComponent(nv.genre||'General')}">${nv.genre||"General"}</a>`;
    return `<a class="card n-card" href="${url}">
      <img class="n-cover" src="${nv.cover_url || 'https://placehold.co/160x210?text=Cover'}" alt="cover">
      <div>
        <div class="title">${nv.title}</div>
        <div class="muted">by ${author}</div>
        <div class="badges">${genre}</div>
        <div class="muted" style="margin-top:6px;font-size:13px">${(nv.description||'').slice(0,120)}</div>
      </div>
    </a>`;
  }

  // fetch latest (by created_at)
  let latest = await sb.from("novels").select("*").order("created_at", { ascending:false }).limit(8);
  latestWrap.innerHTML = (latest.data||[]).map(card).join("") || "<div class='muted'>No novels yet</div>";

  // fetch all with filters
  let query = sb.from("novels").select("*").order("created_at", { ascending:false });
  if (q) query = query.ilike("title", `%${q}%`).or(`author.ilike.%${q}%`);
  if (byAuthor) query = sb.from("novels").select("*").eq("author", byAuthor).order("created_at", { ascending:false });
  if (byGenre) query = sb.from("novels").select("*").eq("genre", byGenre).order("created_at", { ascending:false });

  const all = await query;
  allWrap.innerHTML = (all.data||[]).map(card).join("") || "<div class='muted'>No results</div>";
})();