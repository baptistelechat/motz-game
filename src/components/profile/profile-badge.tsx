import { AvatarDisplay } from "@/components/profile/avatar-display";
import { Button } from "@/components/ui/button";
import { ADJECTIVES, ANIMALS } from "@/lib/constants/pseudo";
import type { PlayerProfile } from "@/lib/schemas/player-schema";
import { cn } from "@/lib/utils";
import { Lightbulb } from "@nsmr/pixelart-react";

interface ProfileBadgeProps {
  profile: PlayerProfile;
  onClick: () => void;
  className?: string;
}

const normalize = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function ProfileBadge({
  profile,
  onClick,
  className,
}: ProfileBadgeProps) {
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
        onClick={onClick}
        variant="profile"
        aria-label="Modifier mon profil"
        className="relative overflow-visible"
      >
        <span
          className="font-display text-sm md:text-base hidden sm:inline"
          style={{
            color: profile.avatar_config.color,
          }}
        >
          {profile.pseudo}
        </span>
        <AvatarDisplay
          animal={profile.avatar_config.animal}
          color={profile.avatar_config.color}
          size="sm"
        />
        {showCustomizeHint && (
          <div className="absolute -bottom-3 -right-2 animate-bounce z-10 drop-shadow-[2px_2px_0_#000] text-theme">
            <Lightbulb className="size-6" fill="currentColor" />
          </div>
        )}
      </Button>
    </div>
  );
}
