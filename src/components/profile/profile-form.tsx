"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/constants/pseudo";
import { playerProfileSchema } from "@/lib/schemas/player-schema";
import { generateRandomPseudo } from "@/lib/utils/random-pseudo";
import { Dice } from "@nsmr/pixelart-react";
import { useEffect, useRef, useState } from "react";
import { AvatarSelector } from "./avatar-selector";

interface ProfileFormProps {
  onSaved?: () => void;
}

export function ProfileForm({ onSaved }: ProfileFormProps) {
  const { profile, updateProfile, isLoading, isInitialized } =
    usePlayerProfile();
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState({
    animal: ANIMALS[0],
    color: AVATAR_COLORS[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form when profile loads or is confirmed missing
  useEffect(() => {
    if (!isInitialized || hasInitialized.current) return;

    if (profile) {
      setPseudo(profile.pseudo);
      if (profile.avatar_config?.animal) {
        // Ensure the animal and color exist in our current lists
        const animalExists = ANIMALS.includes(profile.avatar_config.animal);
        const colorExists = AVATAR_COLORS.includes(profile.avatar_config.color);

        const safeAvatar = {
          animal: animalExists ? profile.avatar_config.animal : ANIMALS[0],
          color: colorExists ? profile.avatar_config.color : AVATAR_COLORS[0],
        };
        setAvatar(safeAvatar);
      }
    } else if (!pseudo) {
      // Only generate random if we don't have a profile AND haven't set one yet
      setPseudo(generateRandomPseudo());
    }
    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isInitialized]); // Only run on mount/init

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const data = {
        pseudo,
        avatar_config: avatar,
      };

      // Validate
      const validated = playerProfileSchema.parse(data);

      await updateProfile(validated);
      if (onSaved) onSaved();
    } catch (err) {
      const error = err as { errors?: { message: string }[]; message?: string };
      if (error.errors && error.errors.length > 0) {
        // Zod error
        setError(error.errors[0].message);
      } else {
        setError(error.message || "Une erreur est survenue");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomize = () => {
    // Force a new random value even if it coincidentally matches the old one
    // But realistically Math.random collision on this set is rare.
    // We can also randomize the avatar to give a full "fresh" feel
    setPseudo(generateRandomPseudo());
    setAvatar({
      animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
  };

  if ((isLoading && !isInitialized) || (!isInitialized && !profile)) {
    return (
      <div className="text-center font-display text-primary animate-pulse">
        CHARGEMENT DU PROFIL...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <Label htmlFor="pseudo" className="text-xl text-white">
            Ton Pseudo
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ton pseudo"
                disabled={isSaving}
                className="flex-1 font-display tracking-wide bg-[#121220] border-2 border-white text-white placeholder:text-gray-500 focus-visible:ring-[#39FF14] focus-visible:border-[#39FF14]"
              />
              <Button
                type="button"
                onClick={handleRandomize}
                variant="outline"
                disabled={isSaving}
                className="aspect-square p-0 w-12 h-12 border-2 border-white bg-[#121220] text-white"
              >
                <Dice className="size-7" />
              </Button>
            </div>
            {error && (
              <p className="text-[#FF00FF] font-bold bg-black/20 p-2 border-2 border-[#FF00FF]">
                {error}
              </p>
            )}
          </div>
        </div>

        <AvatarSelector value={avatar} onChange={setAvatar} />
      </div>

      <div className="p-6 pt-4 shrink-0">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full text-xl py-6 bg-[#39FF14] text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none font-display"
          size="lg"
        >
          {isSaving ? "SAUVEGARDE..." : "C'EST PARTI !"}
        </Button>
      </div>
    </form>
  );
}
