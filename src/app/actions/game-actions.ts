"use server";

import { createClient } from "@/lib/supabase/server";
import { generateGameCode } from "@/lib/utils/game-code";
import { redirect } from "next/navigation";

export async function createGame() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to create a game");
  }

  let code: string;
  let retries = 0;
  const maxRetries = 5;

  while (retries < maxRetries) {
    code = generateGameCode();

    const { data, error } = await supabase
      .from("games")
      .insert({
        code,
        host_id: user.id,
        status: "LOBBY",
      })
      .select("code")
      .single();

    if (!error && data) {
      redirect(`/room/${data.code}`);
    }

    if (error?.code === "23505") {
      // Postgres unique_violation
      retries++;
      continue;
    }

    throw new Error(`Failed to create game: ${error.message}`);
  }

  throw new Error(
    "Failed to generate a unique game code after multiple attempts",
  );
}
