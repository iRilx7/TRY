(async () => {
  const sb = await supabase.promise;

  const $ = (id) => document.getElementById(id);
  const msg = $("authMsg");
  const email = $("email");
  const password = $("password");
  const loginBtn = $("loginBtn");
  const signupBtn = $("signupBtn");

  function say(t, ok=false){ msg.textContent = t; msg.style.color = ok? "#45d483":"#ff5c7a" }

  loginBtn.onclick = async () => {
    say("Logging in…");
    const { data, error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
    if (error) return say(error.message);
    say("Success. Redirecting…", true);
    location.href = "index.html";
  };

  signupBtn.onclick = async () => {
    say("Creating account…");
    const { data, error } = await sb.auth.signUp({ email: email.value.trim(), password: password.value });
    if (error) return say(error.message);
    say("Account created. Please check your email to confirm. You can now log in.", true);
  };
})();