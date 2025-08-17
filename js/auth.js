
import { sb } from './supabaseClient.js';
import { $ , toast } from './utils.js';
$('#signup').addEventListener('click', async ()=>{
  const { error } = await sb.auth.signUp({ email: su_email.value, password: su_pass.value });
  toast(error ? error.message : 'Check your email to confirm (if required).', error?'err':'ok');
});
$('#login').addEventListener('click', async ()=>{
  const { error } = await sb.auth.signInWithPassword({ email: li_email.value, password: li_pass.value });
  if (error) toast(error.message,'err'); else { toast('Logged in'); location.href='admin.html'; }
});
