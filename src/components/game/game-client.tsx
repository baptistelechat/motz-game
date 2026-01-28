"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { getConstraintLabel } from "@/lib/game/formatting";
import { useGameStore } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { GameDebugControls } from "./game-debug-controls";
import { GameInput } from "./game-input";
import { GameTitle } from "./game-title";
import { PlayerListDisplay } from "./player-list-display";

interface GameClientProps {
  gameId: string;
  currentUserId: string;
}

export function GameClient({ gameId, currentUserId }: GameClientProps) {
  useRealtimeGame(gameId);
  const { players, currentRound, isLoading, hostId, submitWord } =
    useGameStore();

  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT DE LA PARTIE..." />;
  }

  const displayPlayers = players.map((p) =>
    mapGamePlayerToDisplayPlayer(p, hostId),
  );

  return (
    <div className="flex flex-col items-center h-full w-full gap-4 md:gap-8 overflow-hidden p-2 md:p-4 pb-24 relative">
      {currentRound && <GameDebugControls currentRound={currentRound} />}

      <div className="flex-none text-center space-y-2 md:space-y-4 w-full max-w-md">
        <GameTitle game>MANCHE {currentRound?.round_number || 1}</GameTitle>

        {currentRound ? (
          <Card
            className="border-2 md:border-4 shadow-[4px_4px_0_0_#000000] md:shadow-[8px_8px_0_0_#000000] animate-in zoom-in duration-300"
            data-testid="constraint-display"
          >
            <CardHeader className="pb-2 md:pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 md:space-y-2">
                  <p className="font-display text-xs md:text-sm text-muted-foreground uppercase">
                    IMPOSEE
                  </p>
                  <p className="font-display text-4xl md:text-6xl text-primary drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                    {currentRound.constraints.imposed_letter}
                  </p>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="font-display text-xs md:text-sm text-muted-foreground uppercase">
                    INTERDITE
                  </p>
                  <p className="font-display text-4xl md:text-6xl text-destructive drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    {currentRound.constraints.forbidden_letter}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <div className="w-full h-0.5 md:h-1 bg-border/20" />

              {/* Constraint Card Display */}
              <div className="bg-muted/50 p-2 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <p className="font-display text-xs text-muted-foreground uppercase mb-1">
                  CONTRAINTE SPECIALE
                </p>
                <p className="text-3xl text-foreground">
                  {getConstraintLabel(
                    currentRound.constraints.constraint_card,
                    currentRound.constraints.theme,
                    currentRound.constraints.imposed_letter,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-xl font-display text-muted-foreground">
            En attente du début de la manche...
          </div>
        )}
      </div>

      <ScrollArea>
        <PlayerListDisplay
          players={displayPlayers}
          currentUserId={currentUserId}
          className="w-full"
        />
      </ScrollArea>

      {currentRound && (
        <GameInput
          constraints={currentRound.constraints}
          onValidate={(word) => submitWord(word)}
        />
      )}
    </div>
  );
}
