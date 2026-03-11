import { createClient } from "@supabase/supabase-js";

// ─── Supabase Configuration ───────────────────────────────────────────────────
// You can find them in: Supabase Dashboard → Settings → API
// ──────────────────────────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "⚠️ Supabase is not configured!\n" +
      "Create a .env file in the project root with:\n" +
      "  VITE_SUPABASE_URL=your-project-url\n" +
      "  VITE_SUPABASE_ANON_KEY=your-anon-key\n" +
      "Get these from: https://supabase.com/dashboard → Settings → API",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
