import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { createServerClient } from "@supabase/ssr";
import { createClient, Session } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Cache session in memory to avoid rate limits
let cachedSession: Session | null = null;
let sessionTimestamp = 0;
const SESSION_TTL = 50 * 60 * 1000; // 50 minutes

export async function POST(request: NextRequest) {
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

  // Collect cookies to set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookiesToSet: any[] = [];

  // Use @supabase/ssr to handle cookie creation automatically
  const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookies.forEach((c) => cookiesToSet.push(c));
      },
    },
  });

  try {
    const { searchParams } = new URL(request.url);
    const forceNew = searchParams.get("force") === "true";

    // Return cached session if valid and not forced
    if (
      !forceNew &&
      cachedSession &&
      Date.now() - sessionTimestamp < SESSION_TTL
    ) {
      console.log(
        "🔒 E2E Bypass: Returning cached session for user",
        cachedSession.user.id,
      );

      // Refresh the session to ensure cookies are generated
      const { data: refreshData, error: refreshError } =
        await supabase.auth.setSession({
          access_token: cachedSession.access_token,
          refresh_token: cachedSession.refresh_token,
        });

      if (!refreshError && refreshData.session) {
        cachedSession = refreshData.session;
        sessionTimestamp = Date.now();

        const finalResponse = NextResponse.json(cachedSession);
        cookiesToSet.forEach(({ name, value, options }) => {
          finalResponse.cookies.set(name, value, options);
        });
        return finalResponse;
      } else {
        console.warn(
          "🔒 E2E Bypass: Cached session refresh failed, creating new one:",
          refreshError,
        );
        cachedSession = null;
      }
    }

    // Create a separate client for auth operations to ensure clean state
    const authClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Helper for retrying auth operations
    const retryOp = async <T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      op: () => Promise<{ data: T; error: any }>,
      name: string,
      retries = 3,
    ): Promise<T> => {
      for (let i = 0; i < retries; i++) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = (await op()) as { data: T; error: any };
          if (error) {
            // If rate limit, throw to trigger retry logic
            if (error.status === 429) throw error;
            // If other error, throw immediately (no retry for logic errors)
            throw error;
          }
          return data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (i === retries - 1) throw err;
          if (err?.status === 429 || err?.code === "over_request_rate_limit") {
            const delay = 1000 * Math.pow(2, i);
            console.warn(
              `🔒 E2E Bypass: ${name} rate limited (Attempt ${i + 1}). Retrying in ${delay}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            // Non-rate-limit error, throw immediately
            throw err;
          }
        }
      }
      throw new Error(`${name} failed after retries`);
    };

    console.log("🔒 E2E Bypass: Attempting Admin Create + Magic Link flow...");

    // Generate unique credentials
    const uniqueId = crypto.randomUUID();
    const email = `e2e-${uniqueId}@motz-game.local`;
    const password = `pass-${uniqueId}`;

    // 1. Create User via Admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData = await retryOp<any>(
      () =>
        authClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        }),
      "createUser",
    );

    if (!userData.user)
      throw new Error("User creation failed - no user returned");
    console.log("🔒 E2E Bypass: User created:", userData.user.id);

    // 2. Generate Magic Link
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkData = await retryOp<any>(
      () =>
        authClient.auth.admin.generateLink({
          type: "magiclink",
          email,
        }),
      "generateLink",
    );

    // 3. Verify OTP to get Session
    const emailOtp = linkData.properties?.email_otp;
    if (!emailOtp) throw new Error("No OTP returned from generateLink");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionData = await retryOp<any>(
      () =>
        authClient.auth.verifyOtp({
          token: emailOtp,
          type: "email",
          email,
        }),
      "verifyOtp",
      5,
    ); // More retries for verifyOtp

    if (!sessionData.session)
      throw new Error("No session returned from verifyOtp");

    console.log("🔒 E2E Bypass: Session obtained successfully");
    const session = sessionData.session;
    const user = session.user;

    // Cache the session
    cachedSession = session;
    sessionTimestamp = Date.now();

    // Ensure cookies are set on the response via SSR client
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    const { error: profileError } = await supabase.from("players").insert({
      id: user.id,
      ...generateRandomPlayer("E2E"),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Failed to pre-create profile:", profileError);
    }

    // Return the session JSON, and set collected cookies
    const finalResponse = NextResponse.json(session);
    cookiesToSet.forEach(({ name, value, options }) => {
      finalResponse.cookies.set(name, value, options);
    });

    return finalResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("🔒 E2E Bypass: Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: err?.status || 500 },
    );
  }
}
