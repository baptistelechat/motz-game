"use client";
import { useAuth } from "@/components/providers/auth-provider";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/ui/error-card";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function CaptchaGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signIn, error } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Si pas connecté, on affiche l'écran de garde avec Captcha
  const isE2E = process.env.NEXT_PUBLIC_IS_E2E === "true";

  // Auto-signin in E2E mode
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_IS_E2E === "true" &&
      !user &&
      !isLoading &&
      !isVerifying
    ) {
      setIsVerifying(true);
      signIn("e2e-bypass-token").catch(() => setIsVerifying(false));
    }
  }, [user, isLoading, isVerifying, signIn]);

  // Si on charge ou si l'utilisateur est connecté, on affiche le contenu normal
  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT..." />;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl md:text-5xl text-primary drop-shadow-[4px_4px_0_var(--border)] uppercase">
          VERIFICATION
        </h1>
        <p className="font-sans text-2xl md:text-4xl text-foreground">
          Prouve que tu n&#39;es pas une machine
        </p>
      </div>

      <Card className="bg-black/50 border-primary backdrop-blur-sm p-8 gap-4 items-center">
        {!isE2E && (
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
            onSuccess={(token) => {
              setCaptchaError(false);
              // Auto-submit
              setIsVerifying(true);
              signIn(token).catch(() => setIsVerifying(false));
            }}
            onError={() => setCaptchaError(true)}
            onExpire={() => setCaptchaError(true)}
            options={{
              theme: "dark",
              size: "normal",
            }}
          />
        )}

        {isE2E && (
          <div className="text-yellow-400 font-mono text-center animate-pulse">
            🔒 E2E MODE ACTIF
            <br />
            CAPTCHA DESACTIVÉ
          </div>
        )}

        {captchaError && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-destructive font-sans text-md text-center">
              Échec de la vérification.
              <br />
            </div>
            <button
              onClick={() => {
                setCaptchaError(false);
                turnstileRef.current?.reset();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground font-display text-xs uppercase hover:bg-primary/90 transition-colors shadow-[2px_2px_0_var(--border)]"
            >
              Reessayer
            </button>
          </div>
        )}

        {isVerifying && (
          <div className="text-primary font-sans text-center animate-pulse">
            Connexion en cours...
          </div>
        )}

        {/* Affichage des erreurs (ex: Anonymous auth disabled) */}
        {error && (
          <ErrorCard
            title="ERREUR CRITIQUE"
            message={error.message}
            className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-2"
            action={
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black font-display text-xs uppercase hover:bg-gray-200 transition-colors shadow-[2px_2px_0_var(--border)] border-2 border-black w-full"
              >
                RECHARGER LA PAGE
              </button>
            }
          />
        )}
      </Card>

      {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="text-red-500 font-mono text-sm max-w-md text-center bg-black p-4 border border-red-500">
          ⚠️ MISSING NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local
          <br />
          Please configure Cloudflare Turnstile to proceed.
        </div>
      )}

      {process.env.NEXT_PUBLIC_IS_E2E === "true" && (
        <button
          data-testid="e2e-bypass-captcha"
          className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded text-xs opacity-50 hover:opacity-100 z-50"
          onClick={() => {
            console.log("🔒 E2E BUTTON CLICKED");
            signIn("e2e-bypass-token").catch((e) =>
              console.error("🔒 E2E BUTTON ERROR", e),
            );
          }}
        >
          E2E BYPASS
        </button>
      )}
    </div>
  );
}
