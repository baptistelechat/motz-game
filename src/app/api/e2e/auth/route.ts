import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NEXT_PUBLIC_IS_E2E !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try anonymous sign-in directly with Service Role client
  // This might bypass captcha if the client is admin
  const { data: sessionData, error: signInError } = await supabase.auth.signInAnonymously();

  if (signInError) {
    console.error("Error signing in anonymously (E2E):", signInError);
    return NextResponse.json({ error: signInError.message }, { status: 500 });
  }

  return NextResponse.json(sessionData.session);
}
