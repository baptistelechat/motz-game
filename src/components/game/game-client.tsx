"use client";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { useGameStore } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { PlayerListDisplay } from "./player-list-display";

interface GameClientProps {
  gameId: string;
  currentUserId: string;
}

export function GameClient({ gameId, currentUserId }: GameClientProps) {
  useRealtimeGame(gameId);
  const { players, currentRound, isLoading, hostId } = useGameStore();

  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT DE LA PARTIE..." />;
  }

  const displayPlayers = players.map((p) =>
    mapGamePlayerToDisplayPlayer(p, hostId),
  );

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl text-theme drop-shadow-[4px_4px_0_#000000]">
          MANCHE {currentRound?.round_number || 1}
        </h1>

        {currentRound ? (
          <div className="bg-card border-4 border-border p-8 rounded-xl shadow-[8px_8px_0_0_#000000] space-y-6 max-w-md mx-auto animate-in zoom-in duration-300">
            <div className="space-y-2">
              <p className="font-display text-xl text-muted-foreground uppercase">
                LETTRE
              </p>
              <p className="font-display text-6xl text-primary">
                {currentRound.constraints.letter}
              </p>
            </div>

            <div className="w-full h-1 bg-border/20" />

            <div className="space-y-2">
              <p className="font-display text-xl text-muted-foreground uppercase">
                THÈME
              </p>
              <p className="font-display text-3xl text-foreground">
                {currentRound.constraints.theme}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xl font-display text-muted-foreground">
            En attente du début de la manche...
          </div>
        )}
      </div>

      <PlayerListDisplay
        players={displayPlayers}
        currentUserId={currentUserId}
        className="max-w-4xl"
      />
    </div>
  );
}
