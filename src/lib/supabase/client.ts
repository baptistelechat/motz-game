import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !key) {
    console.error("Supabase Client Error: Missing env vars", { url, key: !!key });
  } else {
    // console.log("Supabase Client: Creating client with", { url });
  }

  return createBrowserClient<Database>(
    url!,
    key!,
  );
}
