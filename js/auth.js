import { sb, toast } from './supabaseClient.js';
document.getElementById('signup').onclick = async () => {
  const email = document.getElementById('su_email').value.trim();
  const password = document.getElementById('su_pass').value;
  const { error } = await sb.auth.signUp({ email, password });
  if (error) toast(error.message,'err'); else toast('Check your email to confirm.','ok');
};
document.getElementById('login').onclick = async () => {
  const email = document.getElementById('li_email').value.trim();
  const password = document.getElementById('li_pass').value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { toast(error.message,'err'); return; }
  toast('Logged in!','ok'); location.href='index.html';
};