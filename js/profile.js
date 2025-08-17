(async () => {
  const sb = await supabase.promise;
  const $ = (id) => document.getElementById(id);
  const area = $("profileArea");

  const { data: { user } } = await sb.auth.getUser();
  if (!user) { area.innerHTML = `You are not logged in. <a class="btn" href="auth.html">Log in</a>`; return; }

  const { data: rows } = await sb.from("admins").select("user_id").eq("user_id", user.id).limit(1);
  const isAdmin = !!(rows && rows.length);
  area.innerHTML = `
    <div><b>Email:</b> ${user.email}</div>
    <div><b>User ID:</b> ${user.id}</div>
    <div><b>Role:</b> ${isAdmin? "Admin ✅":"Reader"}</div>
    <div style="margin-top:10px"><a class="btn ghost" href="admin.html">Go to Admin</a></div>
  `;
})();