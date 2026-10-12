import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

// OAuth callback — tukar code dengan session lalu redirect ke home
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(origin);
}
