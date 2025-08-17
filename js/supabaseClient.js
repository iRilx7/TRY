// Supabase client bootstrap
// Paste your own URL/key here if different
const SUPABASE_URL = "https://pfjbwjpgwscolqiqtyxt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamJ3anBnd3Njb2xxaXF0eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTg5NDgsImV4cCI6MjA3MDk5NDk0OH0.D1H1O9E8pb_tzL4XXg_yC4yrbXwyuYwV5YEH-PXYVEo";
window.supabase = window.supabase || createSupabaseClient();

function createSupabaseClient(){
  // minimal supabase-js v2 loader (ESM via CDN)
  // Using dynamic import to keep single-file hosting simple
  const state = {}
  state.promise = (async () => {
    if (!window.Supabase) {
      const mod = await import("https://esm.sh/@supabase/supabase-js@2.45.4");
      window.Supabase = mod;
    }
    state.client = window.Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return state.client;
  })();
  return new Proxy(state, {
    get(_t, prop){
      if (prop === "from" || prop === "auth" || prop === "storage" || prop === "rpc") {
        throw new Error("Wait for supabase client: use await (await supabase.promise)");
      }
      return state[prop];
    }
  });
}
