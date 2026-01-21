import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  if (process.env.NEXT_PUBLIC_IS_E2E !== "true") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration (URL or SERVICE ROLE KEY)" },
      { status: 500 },
    );
  }

  // Use Service Role Key to bypass Captcha and create a valid session
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Sign in anonymously to get the session tokens
    // We hope the Service Role Key bypasses captcha requirements if any
    const { data: sessionData, error: signInError } =
      await supabase.auth.signInAnonymously();

    if (signInError || !sessionData.session || !sessionData.user) {
      return NextResponse.json(
        { error: signInError?.message || "Failed to sign in anonymously" },
        { status: 500 },
      );
    }

    const user = sessionData.user;

    const { error: profileError } = await supabase.from("players").insert({
      id: user.id,
      ...generateRandomPlayer("E2E"),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Failed to pre-create profile:", profileError);
      // We don't fail the request, hoping the client-side auto-creation picks it up,
      // but we log it.
    }

    return NextResponse.json(sessionData.session);
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_IS_E2E !== "true") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    console.warn("Missing SERVICE ROLE KEY - Skipping user cleanup");
    return NextResponse.json(
      { warning: "Skipping cleanup: Missing SERVICE ROLE KEY" },
      { status: 200 },
    );
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 1. Cleanup Games (where user is host)
    // Note: If ON DELETE CASCADE is missing in SQL, we must do this manually.
    const { error: gamesError } = await supabase
      .from("games")
      .delete()
      .eq("host_id", userId);

    if (gamesError) {
      console.error("Failed to cleanup games:", gamesError);
      // Continue anyway to try cleaning up the user
    }

    // 2. Cleanup Player Profile
    const { error: playerError } = await supabase
      .from("players")
      .delete()
      .eq("id", userId);

    if (playerError) {
      console.error("Failed to cleanup player:", playerError);
    }

    // 3. Delete User from Auth
    const { error: userError } = await supabase.auth.admin.deleteUser(userId);

    if (userError) {
      throw userError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
