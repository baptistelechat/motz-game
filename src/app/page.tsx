"use client";

import { createGame } from "@/app/actions/game-actions";
import { JoinGameDialog } from "@/components/game/join-game-dialog";
import { AttributesDialog } from "@/components/info/attributes-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { StickyActionZone } from "@/components/layout/sticky-action-zone";
import { useAuth } from "@/components/providers/auth-provider";
import { InstallApp } from "@/components/pwa/install-app";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { useEffect, useState, useTransition } from "react";

export default function Home() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isInitialized } =
    usePlayerProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateGame = () => {
    startTransition(async () => {
      try {
        await createGame();
      } catch (error) {
        console.error("Failed to create game:", error);
        setCreationError(
          error instanceof Error ? error : new Error("Impossible de créer la partie"),
        );
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
        <div className="bg-destructive text-white p-6 border-4 border-black shadow-hard max-w-md w-full mx-4">
          <h2 className="font-display text-xl mb-4 text-center border-b-4 border-black/20 pb-2">
            ERREUR CRITIQUE
          </h2>
          <p className="font-sans mb-4 text-center">
            Une erreur est survenue.
          </p>
          <div className="bg-black/20 p-4 font-mono text-xs overflow-auto mb-4 border-2 border-black/10">
            {creationError.message}
          </div>
          <p className="text-sm text-center font-bold mb-4">
            Vérifiez votre connexion ou réessayez.
          </p>
          <div className="text-center">
            <Button
              variant="outline"
              className="border-2 border-black/20 hover:border-black/40 font-display"
              onClick={() => setCreationError(null)}
            >
              RÉESSAYER
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (
    (isLoading && !profile) ||
    isCreating ||
    (user && !profile) ||
    !isInitialized
  ) {
    return (
      <LoadingScreen
        message={isCreating ? "CREATION DU PROFIL..." : "CHARGEMENT..."}
      />
    );
  }

  // Should not happen if auth is working, but safe guard
  if (!profile) return null;

  // If profile exists, show main menu
  return (
    <MainLayout>
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
