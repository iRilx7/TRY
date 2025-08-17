
import sb from './supabaseClient.js'; import { $, } from './utils.js';
document.getElementById('signup').onclick=async()=>{ const {error}=await sb.auth.signUp({email:su_email.value,password:su_pass.value}); alert(error?error.message:'Check your email (if required)'); };
document.getElementById('login').onclick=async()=>{ const {error}=await sb.auth.signInWithPassword({email:li_email.value,password:li_pass.value}); if(error) alert(error.message); else location.href='admin.html'; };
