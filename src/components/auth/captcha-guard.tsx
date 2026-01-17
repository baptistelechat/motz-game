"use client";
import { useAuth } from "@/components/providers/auth-provider";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";

export function CaptchaGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signIn, error } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Si on charge ou si l'utilisateur est connecté, on affiche le contenu normal
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121220] text-[#39FF14] font-display animate-pulse">
        CHARGEMENT DU SYSTEME...
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  // Si pas connecté, on affiche l'écran de garde avec Captcha
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121220] p-4 gap-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl md:text-5xl text-[#39FF14] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase">
          VERIFICATION
        </h1>
        <p className="font-sans text-2xl text-white">
          Prouve que tu n&#39;es pas une machine
        </p>
      </div>

      <div className="bg-black/50 p-8 border-4 border-[#39FF14] shadow-hard backdrop-blur-sm space-y-4 flex flex-col items-center">
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

        {captchaError && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-[#FF00FF] font-sans text-md text-center">
              Échec de la vérification.
              <br />
            </div>
            <button
              onClick={() => {
                setCaptchaError(false);
                turnstileRef.current?.reset();
              }}
              className="px-4 py-2 bg-[#39FF14] text-black font-display text-xs uppercase hover:bg-[#2cb82c] transition-colors shadow-[2px_2px_0_rgba(0,0,0,1)]"
            >
              Reessayer
            </button>
          </div>
        )}

        {isVerifying && (
          <div className="text-[#39FF14] font-sans text-center animate-pulse">
            Connexion en cours...
          </div>
        )}

        {/* Affichage des erreurs (ex: Anonymous auth disabled) */}
        {error && (
          <div className="text-[#FF00FF] font-sans text-sm max-w-xs text-center bg-black p-2 border border-[#FF00FF]">
            ERREUR: {error.message}
          </div>
        )}
      </div>

      {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="text-red-500 font-mono text-sm max-w-md text-center bg-black p-4 border border-red-500">
          ⚠️ MISSING NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local
          <br />
          Please configure Cloudflare Turnstile to proceed.
        </div>
      )}
    </div>
  );
}
