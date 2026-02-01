"use client";

import { AvatarDisplay } from "@/components/profile/avatar-display";
import { ProfileDialog } from "@/components/profile/components/profile-dialog";
import { Button } from "@/components/ui/button";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { ADJECTIVES, ANIMALS } from "@/lib/constants/pseudo";
import { cn } from "@/lib/utils";
import { Lightbulb } from "@nsmr/pixelart-react";
import { useState } from "react";

interface ProfileBadgeProps {
  className?: string;
}

const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function ProfileBadge({ className }: ProfileBadgeProps) {
  const { profile } = usePlayerProfile();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const isDefaultPseudo = (pseudo: string) => {
    const parts = pseudo.split("_");
    if (parts.length !== 2) return false;
    const [pAnimal, pAdj] = parts;
    const isAnimal = ANIMALS.some((a) => normalize(a) === pAnimal);
    const isAdj = ADJECTIVES.some((a) => normalize(a) === pAdj);
    return isAnimal && isAdj;
  };

  const showCustomizeHint = isDefaultPseudo(profile.pseudo);

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        onClick={() => setOpen(true)}
        variant="profile"
        aria-label="Modifier mon profil"
        className="relative overflow-visible"
      >
        <span
          className="font-display text-sm md:text-base hidden lg:inline"
          style={{
            color: profile.avatar_config.color,
          }}
        >
          {profile.pseudo}
        </span>
        <AvatarDisplay
          player={profile}
          size="sm"
        />
        {showCustomizeHint && (
          <div className="absolute -bottom-3 -right-2 animate-bounce z-10 drop-shadow-[2px_2px_0_#000] text-theme">
            <Lightbulb className="size-6" fill="currentColor" />
          </div>
        )}
      </Button>

      <ProfileDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
