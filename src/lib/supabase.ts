import { createBrowserClient } from "@supabase/ssr";

// Supabase browser client (singleton, cookie-based for SSR compatibility)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
