import { PlayerStatusBadge } from "@/components/game/player-status-badge";
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

interface AvatarDisplayProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarDisplayVariants> {
  animal: string;
  color: string;
  isHost?: boolean;
  isPlayer?: boolean;
  isBot?: boolean;
  isReady?: boolean;
}

export function AvatarDisplay({
  animal,
  color,
  className,
  size = "md",
  isHost,
  isPlayer,
  isBot,
  isReady,
  ...props
}: AvatarDisplayProps) {
  return (
    <div className="relative inline-block">
      <div
        className={cn(avatarDisplayVariants({ size }), className)}
        style={{ borderColor: color }}
        title={animal}
        {...props}
      >
        <div className={iconSizeVariants({ size })}>
          <Image
            src={`/assets/avatar/${animal.toLowerCase()}.png`}
            alt={animal}
            fill
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      {isHost && <PlayerStatusBadge role="HOST" />}
      {isPlayer && <PlayerStatusBadge role="PLAYER" />}
      {isBot && <PlayerStatusBadge role="BOT" />}
      {isReady && <PlayerStatusBadge role="READY" />}
      {isReady !== undefined && !isReady && <PlayerStatusBadge role="WAITING" />}
    </div>
  );
}
