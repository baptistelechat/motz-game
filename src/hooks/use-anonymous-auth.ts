import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      try {
        const {
          data: { user: currentUser },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (getUserError || !currentUser) {
          if (
            getUserError &&
            !getUserError.message.includes("Auth session missing")
          ) {
            throw getUserError;
          }
          // Auto-sign-in for E2E contexts
          const isE2E =
            process.env.NEXT_PUBLIC_IS_E2E === "true" ||
            (typeof window !== "undefined" &&
              window.localStorage.getItem("motz-e2e-mode") === "true");

          if (isE2E) {
            console.log("🔒 E2E Mode detected, attempting auto-sign-in...");
            await signIn("e2e-bypass-token");
          }
        }

        if (currentUser) {
          // console.log("🔒✅ checkAuth found user:", currentUser.id);
          setUser(currentUser);
        } else {
          // console.log("🔒❌ checkAuth found NO user and NO error");
        }
        // NOTE: We do NOT auto-sign-in anymore because Captcha is required.
        // The user must trigger sign-in manually via UI.
      } catch (err) {
        setError(err as Error);
        console.error("Anonymous auth error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const signIn = async (captchaToken: string) => {
    // console.log("🔒 signIn called with token:", captchaToken);
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      if (captchaToken === "e2e-bypass-token") {
        console.log("🔒 E2E Bypass: Fetching session from API...");
        const response = await fetch("/api/e2e/auth", { method: "POST" });
        console.log("🔒 E2E Bypass: API Response Status:", response.status);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error("🔒 E2E Bypass: API Error Body:", errorBody);
          throw new Error(
            `E2E Auth API failed: ${response.statusText} - ${errorBody}`,
          );
        }
        const session = await response.json();
        console.log("🔒 E2E Bypass: Session received", session ? "YES" : "NO");
        const { error: sessionError } = await supabase.auth.setSession(session);
        if (sessionError) {
          console.error("🔒 E2E Bypass: setSession Error", sessionError);
          throw sessionError;
        }

        const {
          data: { user: newUser },
        } = await supabase.auth.getUser();
        console.log("🔒 E2E Bypass: User retrieved", newUser?.id);
        if (newUser) setUser(newUser);
      } else {
        const {
          data: { user: newUser },
          error: signInError,
        } = await supabase.auth.signInAnonymously({
          options: { captchaToken },
        });

        if (signInError) throw signInError;
        if (newUser) setUser(newUser);
      }
    } catch (err) {
      setError(err as Error);
      console.error("Sign in error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error, signIn };
}
