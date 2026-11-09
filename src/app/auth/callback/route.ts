import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

// OAuth callback — tukar code dengan session lalu redirect ke home
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth error (e.g. user cancelled, provider not enabled)
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  if (code) {
    const supabase = await createSupabaseServer();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      const msg = encodeURIComponent(exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=${msg}`);
    }
  }

  return NextResponse.redirect(origin);
}
