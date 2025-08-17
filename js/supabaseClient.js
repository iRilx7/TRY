import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Replace with your own if needed
export const SUPABASE_URL = 'https://pfjbwjpgwscolqiqtyxt.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamJ3anBnd3Njb2xxaXF0eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTg5NDgsImV4cCI6MjA3MDk5NDk0OH0.D1H1O9E8pb_tzL4XXg_yC4yrbXwyuYwV5YEH-PXYVEo';
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const toast = (msg, kind='ok') => {
  const t=document.createElement('div'); t.className='toast '+kind; t.textContent=msg;
  document.getElementById('toasts')?.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
};
export const params = new URLSearchParams(location.search);
