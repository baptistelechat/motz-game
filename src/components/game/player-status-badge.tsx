import { PixelIcon } from "@/components/ui/pixel-icon";
import { cn } from "@/lib/utils";

interface PlayerStatusBadgeProps {
  role?: "HOST" | "PLAYER" | "BOT" | "READY" | "WAITING";
  className?: string;
}

export function PlayerStatusBadge({ role, className }: PlayerStatusBadgeProps) {
  if (role === "HOST") {
    return (
      <div
        className={cn(
          "absolute -top-3 -right-3 z-10 flex items-center justify-center pointer-events-none",
          className,
        )}
        title="Host"
      >
        <PixelIcon
          name="star"
          className="size-6 drop-shadow-[2px_2px_0_#000]"
        />
      </div>
    );
  }

  if (role === "PLAYER") {
    return (
      <div
        className={cn(
          "absolute -top-3 -right-3 z-10 flex items-center justify-center pointer-events-none",
          className,
        )}
        title="Player"
      >
        <PixelIcon
          name="game-controller"
          className="size-6 drop-shadow-[2px_2px_0_#000]"
        />
      </div>
    );
  }

  if (role === "BOT") {
    return (
      <div
        className={cn(
          "absolute -top-3 -right-3 z-10 flex items-center justify-center pointer-events-none",
          className,
        )}
        title="Bot"
      >
        <PixelIcon
          name="robot"
          className="size-6 drop-shadow-[2px_2px_0_#000]"
        />
      </div>
    );
  }

  if (role === "READY") {
    return (
      <div
        className={cn(
          "absolute -bottom-3 -right-3 z-10 flex items-center justify-center pointer-events-none",
          className,
        )}
        title="Ready"
      >
        <PixelIcon
          name="thumb-up"
          className="size-6 drop-shadow-[2px_2px_0_#000]"
        />
      </div>
    );
  }

  if (role === "WAITING") {
    return (
      <div
        className={cn(
          "absolute -bottom-3 -right-3 z-10 flex items-center justify-center pointer-events-none",
          className,
        )}
        title="Waiting"
      >
        <PixelIcon
          name="coffee"
          className="size-6 drop-shadow-[2px_2px_0_#000]"
        />
      </div>
    );
  }

  return null;
}
