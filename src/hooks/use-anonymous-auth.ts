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

        if (getUserError) {
          if (!getUserError.message.includes("Auth session missing")) {
            throw getUserError;
          }
        }

        if (currentUser) {
          setUser(currentUser);
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
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user: newUser },
        error: signInError,
      } = await supabase.auth.signInAnonymously({
        options: { captchaToken },
      });

      if (signInError) throw signInError;
      if (newUser) setUser(newUser);
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
