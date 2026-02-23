"use client"

import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/use-game-store";

interface GameTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  game?: boolean;
  validation?:boolean;
  gameOver?:boolean
}

export function GameTitle({
  className,
  game = false,
  validation = false,
  gameOver = false,
  ...props
}: GameTitleProps) {

    const {
      currentRound,
    } = useGameStore();
  
  return (
    <h1
      className={cn(
        "font-display text-theme text-center",
        game || validation ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
        "drop-shadow-[4px_4px_0_#000000]",
        className,
      )}
      {...props}
      >
        {game ? `MANCHE ${currentRound?.round_number || 1}` : validation ? "VALIDATION" : gameOver ? "PARTIE TERMINEE": "SALLE D'ATTENTE"}
    </h1>
  );
}
