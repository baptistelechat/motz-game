import { PlayerStatusBadge } from "@/components/game/player-status-badge";
import { AvatarConfig } from "@/interface/AvatarConfig";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";

const avatarDisplayVariants = cva(
  "flex items-center justify-center bg-black border-black transition-colors relative",
  {
    variants: {
      size: {
        sm: "w-8 h-8 p-0.5 border-2",
        md: "w-16 h-16 p-1 border-4 shadow-[4px_4px_0_#000]",
        lg: "w-32 h-32 p-2 border-4 shadow-[6px_6px_0_#000]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const iconSizeVariants = cva("relative", {
  variants: {
    size: {
      sm: "w-full h-full",
      md: "w-full h-full",
      lg: "w-full h-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarEntity {
  avatar_config: AvatarConfig;
}

interface AvatarDisplayProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarDisplayVariants> {
  player: AvatarEntity;
  isHost?: boolean;
  isBot?: boolean;
  isReady?: boolean;
  rank?: number;
}

export function AvatarDisplay({
  className,
  size = "md",
  player,
  isHost,
  isBot,
  isReady,
  rank,
  ...props
}: AvatarDisplayProps) {
  // Extraction des données de l'objet player
  const config = player.avatar_config;
  const effectiveAnimal = config?.animal || "CAT"; // Fallback safe
  const effectiveColor = config?.color || "#000000";

  return (
    <div className="relative inline-block">
      <div
        className={cn(avatarDisplayVariants({ size }), className)}
        style={{ borderColor: effectiveColor }}
        title={effectiveAnimal}
        {...props}
      >
        <div className={iconSizeVariants({ size })}>
          <Image
            src={`/assets/avatar/${effectiveAnimal.toLowerCase()}.png`}
            alt={effectiveAnimal}
            fill
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      {isHost && <PlayerStatusBadge role="HOST" />}
      {isBot && <PlayerStatusBadge role="BOT" />}
      {isReady && <PlayerStatusBadge role="READY" />}
      {isReady !== undefined && !isReady && (
        <PlayerStatusBadge role="WAITING" />
      )}
      {rank !== undefined && rank > 0 && <PlayerStatusBadge rank={rank} />}
    </div>
  );
}
