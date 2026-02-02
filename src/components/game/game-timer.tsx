"use client";

import { PixelIcon } from "@/components/ui/pixel-icon";
import { Progress } from "@/components/ui/progress";
import { ROUND_DURATION_SECONDS } from "@/lib/game/constants";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface GameTimerProps {
  endsAt?: string;
  onTimeUp?: () => void;
  className?: string;
}

export function GameTimer({ endsAt, onTimeUp, className }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    if (!endsAt) return;

    const end = new Date(endsAt).getTime();

    // Reset hasCalledTimeUp when endsAt changes
    hasCalledTimeUp.current = false;

    // Calculate initial total duration if possible, or just assume 60s for the progress bar visual
    // Actually, to make the progress bar accurate, we need the start time too.
    // But since we don't have start_time in the prop, we can just use timeLeft relative to a fixed max or just show text.
    // For now, let's just show the countdown and visual effects.

    // To make the progress bar meaningful, we ideally need the round duration.
    // We know it's 60s from the backend constant.

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((end - now) / 1000));

      setTimeLeft(diff);

      if (diff <= 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        if (onTimeUp) onTimeUp();
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onTimeUp]);

  if (timeLeft === null) return null;

  const isUrgent = timeLeft <= 10;
  const progress = Math.min(
    100,
    (timeLeft / ROUND_DURATION_SECONDS) * 100,
  );

  return (
    <div className={cn("w-full flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-2 font-display text-2xl transition-colors duration-300",
          isUrgent ? "text-[#FF00FF] animate-pulse" : "text-muted-foreground",
        )}
      >
        <PixelIcon
          name="clock"
          className={cn("size-6", isUrgent && "animate-bounce")}
        />
        <span>{timeLeft}s</span>
      </div>

      <Progress
        value={progress}
        className={cn(
          "h-4 border-2 border-black rounded-none",
          isUrgent && "[&>div]:bg-[#FF00FF]",
        )}
      />
    </div>
  );
}
