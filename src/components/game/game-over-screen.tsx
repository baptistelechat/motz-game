"use client";

import { resetGame } from "@/app/actions/game-actions";
import { GamePlayer } from "@/store/use-game-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RoundSummary } from "./round-summary";

interface GameOverScreenProps {
  gameId: string;
  players: GamePlayer[];
  isHost: boolean;
  currentUserId: string;
  hostId: string | null;
}

export function GameOverScreen({
  gameId,
  players,
  currentUserId,
  hostId,
}: GameOverScreenProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleReplay = async () => {
    setIsResetting(true);
    try {
      await resetGame(gameId);
      // Status change to LOBBY will trigger navigation in GameClient
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la relance de la partie");
      setIsResetting(false);
    }
  };

  const handleQuit = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full pt-4 pb-4 px-4 gap-4">
      {/* Reusing RoundSummary in Game Over mode */}
      <RoundSummary
        players={players}
        currentUserId={currentUserId}
        hostId={hostId}
        isGameOver={true}
        onReplay={handleReplay}
        onQuit={handleQuit}
        isActionLoading={isResetting}
      />
    </div>
  );
}
