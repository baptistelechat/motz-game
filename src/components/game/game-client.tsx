"use client";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { useGameStore } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { GameTitle } from "./game-title";
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
    <div className="flex flex-col items-center h-full w-full gap-4 md:gap-8 overflow-hidden p-2 md:p-4">
      <div className="flex-none text-center space-y-2 md:space-y-4 w-full max-w-md">
        <GameTitle game>MANCHE {currentRound?.round_number || 1}</GameTitle>

        {currentRound ? (
          <div className="bg-card border-2 md:border-4 border-border p-4 md:p-8 rounded-xl shadow-[4px_4px_0_0_#000000] md:shadow-[8px_8px_0_0_#000000] space-y-2 md:space-y-6 animate-in zoom-in duration-300">
            <div className="space-y-1 md:space-y-2">
              <p className="font-display text-sm md:text-xl text-muted-foreground uppercase">
                LETTRE
              </p>
              <p className="font-display text-4xl md:text-6xl text-primary">
                {currentRound.constraints.letter}
              </p>
            </div>

            <div className="w-full h-0.5 md:h-1 bg-border/20" />

            <div className="space-y-1 md:space-y-2">
              <p className="font-display text-sm md:text-xl text-muted-foreground uppercase">
                THEME
              </p>
              <p className="font-display text-xl md:text-3xl text-foreground wrap-break-word leading-tight">
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

      <ScrollArea className="w-full max-w-4xl mx-auto h-full md:h-auto">
        <PlayerListDisplay
          players={displayPlayers}
          currentUserId={currentUserId}
          className="w-full"
        />
      </ScrollArea>
    </div>
  );
}
