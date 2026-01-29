"use client";

import { createGame } from "@/app/actions/game-actions";
import { DictionaryLoader } from "@/components/game/dictionary-loader";
import { JoinGameDialog } from "@/components/game/join-game-dialog";
import { AttributesDialog } from "@/components/info/attributes-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { StickyActionZone } from "@/components/layout/sticky-action-zone";
import { useAuth } from "@/components/providers/auth-provider";
import { InstallApp } from "@/components/pwa/install-app";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/error-card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isInitialized } =
    usePlayerProfile();

  const [isCreating, setIsCreating] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset creation state when pending ends
  useEffect(() => {
    if (!isPending && isCreating) {
      setIsCreating(false);
    }
  }, [isPending, isCreating]);

  const handleCreateGame = () => {
    setIsCreating(true);
    setCreationError(null);
    const toastId = toast.loading("Création de la partie...");

    startTransition(async () => {
      try {
        await createGame();
        // Redirect will happen, so we might not reach here, but if we do, dismiss
        toast.dismiss(toastId);
      } catch (error) {
        // Ignore redirect errors as they are part of normal flow
        // Check for NEXT_REDIRECT in message, handling both Error objects and plain objects
        const errorMessage = 
          error instanceof Error ? error.message : 
          typeof error === 'object' && error && 'message' in error ? String((error as any).message) : 
          String(error);

        if (errorMessage.includes("NEXT_REDIRECT")) {
          toast.dismiss(toastId); // Ensure dismiss on redirect
          return;
        }

        console.error("Failed to create game:", error);
        toast.dismiss(toastId);
        const err =
          error instanceof Error
            ? error
            : new Error("Impossible de créer la partie");
        setCreationError(err);
        toast.error(err.message);
      }
    });
  };

  // Silent profile creation
  useEffect(() => {
    // Only attempt creation if fully initialized, user exists, and confirmed no profile
    if (
      user &&
      isInitialized &&
      !isLoading &&
      !profile &&
      !isCreating &&
      !creationError
    ) {
      setIsCreating(true);

      updateProfile(generateRandomPlayer())
        .then(() => {
          setIsCreating(false);
        })
        .catch((err) => {
          console.error("Failed to create silent profile:", err);
          setCreationError(
            err instanceof Error ? err : new Error("Unknown error"),
          );
          setIsCreating(false);
        });
    }
  }, [
    user,
    isLoading,
    profile,
    isCreating,
    updateProfile,
    creationError,
    isInitialized,
  ]);

  if (creationError) {
    return (
      <MainLayout className="items-center justify-center">
        <ErrorCard
          title="ERREUR CRITIQUE"
          message={
            <div className="space-y-4">
              <p className="text-center">Une erreur est survenue.</p>
              <div className="bg-black/20 p-4 font-mono text-xs overflow-auto border-2 border-black/10 max-h-32">
                {creationError.message}
              </div>
              <p className="text-center font-bold">
                Vérifiez votre connexion ou réessayez.
              </p>
            </div>
          }
          variant="filled"
          action={
            <Button
              size="xl"
              variant="outline"
              onClick={() => setCreationError(null)}
            >
              RÉESSAYER
            </Button>
          }
        />
      </MainLayout>
    );
  }

  if (
    (isLoading && !profile) ||
    isCreating ||
    (user && !profile) ||
    !isInitialized
  ) {
    return <LoadingScreen message="CHARGEMENT..." />;
  }

  // Should not happen if auth is working, but safe guard
  if (!profile) return null;

  // If profile exists, show main menu
  return (
    <MainLayout>
      <DictionaryLoader />
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-12 min-h-dvh relative">
        <div className="text-center space-y-6">
          <h1 className="font-display text-4xl md:text-7xl text-theme drop-shadow-[6px_6px_0_var(--border)] uppercase text-center">
            MOTZ-GAME
          </h1>
          <p className="font-sans text-3xl md:text-4xl text-foreground tracking-wider">
            Chaque lettre compte
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-xs md:max-w-2xl justify-center items-center">
          <Button
            size="xl"
            className="w-full md:w-64"
            onClick={handleCreateGame}
            disabled={isPending}
          >
            {isPending ? "CRÉATION..." : "CRÉER UNE PARTIE"}
          </Button>
          <Button
            variant="secondary"
            size="xl"
            className="w-full md:w-64"
            onClick={() => setIsJoinDialogOpen(true)}
          >
            REJOINDRE
          </Button>
        </div>
      </div>

      <StickyActionZone>
        <AttributesDialog />
        <InstallApp />
      </StickyActionZone>

      <JoinGameDialog
        open={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
      />
    </MainLayout>
  );
}
