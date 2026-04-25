import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Supabase redirects here after email confirmation or OAuth login.
// This route exchanges the one-time `code` in the URL for a real session.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home after successful auth
  return NextResponse.redirect(new URL("/", request.url));
}
