import { createClient } from '@supabase/supabase-js';

// Client público (browser) — só enxerga o que as RLS policies permitirem
export function supabasePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Client admin (APENAS em código de servidor: API routes / server components)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
