import { PixelIcon } from "@/components/ui/pixel-icon";
import { cn } from "@/lib/utils";

interface PlayerStatusBadgeProps {
  role?: "HOST" | "PLAYER" | "BOT" | "READY" | "WAITING";
  rank?: number;
  className?: string;
}

export function PlayerStatusBadge({
  role,
  rank,
  className,
}: PlayerStatusBadgeProps) {
  if (rank !== undefined && rank > 0) {
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200"; // Default
    if (rank === 1) colorClass = "bg-yellow-400 text-yellow-950 border-white";
    else if (rank === 2)
      colorClass = "bg-slate-300 text-slate-900 border-white";
    else if (rank === 3)
      colorClass = "bg-amber-600 text-amber-950 border-white";

    return (
      <div
        className={cn(
          "absolute -bottom-2 -right-3 z-20 font-bold rounded-full size-6 flex items-center justify-center border-2 shadow-lg animate-in zoom-in spin-in-12 text-sm",
          colorClass,
          className,
        )}
      >
        {rank}
      </div>
    );
  }

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
