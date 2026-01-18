"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { AvatarDisplay } from "@/components/profile/avatar-display";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/constants/pseudo";
import { generateRandomPseudo } from "@/lib/utils/random-pseudo";
import { useEffect, useState } from "react";

export default function Home() {
  const { profile, isLoading, updateProfile, user, isInitialized } =
    usePlayerProfile();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<Error | null>(null);

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
      const randomAvatar = {
        animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };

      updateProfile({
        pseudo: generateRandomPseudo(),
        avatar_config: randomAvatar,
      })
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
        <div className="bg-[#FF00FF] text-white p-6 border-4 border-black shadow-hard max-w-md w-full mx-4">
          <h2 className="font-display text-xl mb-4 text-center border-b-4 border-black/20 pb-2">
            ERREUR CRITIQUE
          </h2>
          <p className="font-sans mb-4 text-center">
            Impossible de créer le profil joueur.
          </p>
          <div className="bg-black/20 p-4 font-mono text-xs overflow-auto mb-4 border-2 border-black/10">
            {creationError.message}
          </div>
          <p className="text-sm text-center font-bold">
            Vérifiez que la table &apos;players&apos; existe dans votre base de
            données Supabase.
          </p>
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
        <div className="absolute top-4 right-4 z-20">
          {/* Profile Badge */}
          <Button
            onClick={() => setShowProfileEdit(true)}
            variant="outline"
            className="flex items-center gap-3 bg-[#121220] border-4 border-[#39FF14] p-2 h-auto shadow-hard hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer text-white hover:bg-[#121220] hover:text-white"
            aria-label="Modifier mon profil"
          >
            <span className="font-display text-sm md:text-base hidden sm:inline text-[#39FF14]">
              {profile.pseudo}
            </span>
            <AvatarDisplay
              animal={profile.avatar_config.animal}
              color={profile.avatar_config.color}
              size="sm"
            />
          </Button>
        </div>

        <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="bg-[#121220] border-4 border-[#39FF14] shadow-hard text-white p-0 w-full h-full max-w-none md:max-w-md md:h-auto md:max-h-[85vh] md:rounded-none flex flex-col overflow-hidden gap-0"
          >
            <DialogHeader className="p-6 pb-0 shrink-0">
              <DialogTitle className="font-display text-[#39FF14] text-xl text-center">
                MODIFIER PROFIL
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ProfileForm onSaved={() => setShowProfileEdit(false)} />
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-center space-y-6">
          <h1 className="font-display text-4xl md:text-7xl text-[#39FF14] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase text-center">
            MOTZ-GAME
          </h1>
          <p className="font-sans text-3xl md:text-4xl text-white tracking-wider">
            Chaque lettre compte
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-xs md:max-w-2xl justify-center items-center">
          <Button className="w-full md:w-64 h-20 md:h-16 text-2xl bg-[#39FF14] text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none">
            CRÉER UNE PARTIE
          </Button>
          <Button
            variant="secondary"
            className="w-full md:w-64 h-20 md:h-16 text-2xl bg-white text-black border-4 border-black shadow-hard hover:bg-gray-100 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none"
          >
            REJOINDRE
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
