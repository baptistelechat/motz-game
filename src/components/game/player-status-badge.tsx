import { cn } from "@/lib/utils";

interface PlayerStatusBadgeProps {
  role?: "HOST" | "PLAYER" | "BOT";
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
        <span className="font-display text-2xl text-yellow-400 drop-shadow-[2px_2px_0_#000] leading-none select-none">
          *
        </span>
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
        <span className="font-display text-2xl text-gray-400 drop-shadow-[2px_2px_0_#000] leading-none select-none">
          B
        </span>
      </div>
    );
  }

  return null;
}
