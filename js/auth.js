import { sb } from './supabaseClient.js';
import { $ } from './utils.js';

$('#signup').addEventListener('click', async ()=>{
  const { error } = await sb.auth.signUp({ email: su_email.value, password: su_pass.value });
  alert(error ? error.message : 'Check your email to confirm (if required).');
});
$('#login').addEventListener('click', async ()=>{
  const { error } = await sb.auth.signInWithPassword({ email: li_email.value, password: li_pass.value });
  if (error) alert(error.message); else location.href='index.html';
});
