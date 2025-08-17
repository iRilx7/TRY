// smart loader: uses Supabase if config.js exists, otherwise DEMO mode
export let sb = null;
export let DEMO = false;
try {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('./config.js');
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('config.js missing → DEMO mode');
  DEMO = true;
}
