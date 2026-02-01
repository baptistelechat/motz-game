"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { getConstraintLabel } from "@/lib/game/formatting";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { useEffect, useMemo, useState } from "react";
import { GameDebugControls } from "./game-debug-controls";
import { GameInput } from "./game-input";
import { GameTitle } from "./game-title";
import { PlayerListDisplay } from "./player-list-display";
import { RoundSummary } from "./round-summary";
import { SocialValidationView } from "./social-validation";
import { finishRound } from "@/app/actions/game-actions";

interface GameClientProps {
  gameId: string;
  currentUserId: string;
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-display text-xs text-muted-foreground uppercase mb-4",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function GameClient({ gameId, currentUserId }: GameClientProps) {
  useRealtimeGame(gameId);
  const {
    players,
    currentRound,
    isLoading,
    hostId,
    submitWord,
    roundSubmissions,
  } = useGameStore();

  const isHost = hostId === currentUserId;

  // Auto-finish round if all players submitted
  useEffect(() => {
    if (!isHost || !currentRound || currentRound.status !== "PLAYING") return;

    // Check if all players have a valid submission
    const allSubmitted =
      players.length > 0 &&
      players.every((p) =>
        roundSubmissions.some(
          (s) =>
            s.player_id === p.id &&
            s.is_valid &&
            // Ensure submission belongs to CURRENT round to avoid stale data race conditions
            s.round_id === currentRound.id,
        ),
      );

    if (allSubmitted) {
      finishRound(currentRound.id).catch(console.error);
    }
  }, [isHost, currentRound, players, roundSubmissions]);

  const displayPlayers = useMemo(() => {
    // 1. Map basic info and attach submission data
    const mapped = players.map((p) => {
      const display = mapGamePlayerToDisplayPlayer(p, hostId);

      const sub = roundSubmissions.find((s) => s.player_id === p.id);
      if (sub) {
        display.score = sub.score;
        display.rank = sub.points_details?.rank;
      }
      return display;
    });

    // 2. Filter: Only show players who have submitted (have a rank)
    const filtered = mapped.filter((p) => p.rank !== undefined);

    // 3. Sort: Ranked players first (by rank)
    return filtered.sort((a, b) => {
      const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;

      return rankA - rankB;
    });
  }, [players, hostId, roundSubmissions]);

  const [optimisticSubmitted, setOptimisticSubmitted] = useState(false);

  // Reset optimistic state when round changes
  useEffect(() => {
    setOptimisticSubmitted(false);
  }, [currentRound?.id, currentRound?.constraints]);

  const hasSubmitted = useMemo(() => {
    return (
      optimisticSubmitted ||
      roundSubmissions.some((s) => s.player_id === currentUserId)
    );
  }, [roundSubmissions, currentUserId, optimisticSubmitted]);

  const handleValidate = async (word: string) => {
    setOptimisticSubmitted(true);
    const success = await submitWord(word);
    if (!success) {
      setOptimisticSubmitted(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT DE LA PARTIE..." />;
  }

  if (currentRound?.status === "COMPLETED") {
    return (
      <RoundSummary
        round={currentRound}
        players={players}
        submissions={roundSubmissions}
        currentUserId={currentUserId}
        hostId={hostId}
      />
    );
  }

  if (currentRound?.status === "VALIDATING") {
    return (
      <SocialValidationView
        round={currentRound}
        players={players}
        submissions={roundSubmissions}
        currentUserId={currentUserId}
        hostId={hostId}
      />
    );
  }

  return (
    <div className="flex flex-col items-center h-full w-full gap-4 overflow-hidden p-2 md:p-4 relative">
      {currentRound && (
        <GameDebugControls
          currentRound={currentRound}
          isHost={hostId === currentUserId}
        />
      )}

      <div className="flex-none text-center space-y-6 w-full max-w-md">
        <GameTitle game/>

        {currentRound ? (
          <Card
            className="animate-in zoom-in duration-300"
            data-testid="constraint-display"
          >
            <CardHeader className="pb-2 md:pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 md:space-y-2">
                  <SectionLabel>IMPOSEE</SectionLabel>
                  <p className="font-display text-4xl md:text-6xl text-allow drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                    {currentRound.constraints.imposed_letter}
                  </p>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <SectionLabel>INTERDITE</SectionLabel>
                  <p className="font-display text-4xl md:text-6xl text-disallow drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    {currentRound.constraints.forbidden_letter}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {/* Constraint Card Display */}
              <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <SectionLabel>CONTRAINTE</SectionLabel>
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

      <ScrollArea className="flex-1 min-h-0 w-full">
        <PlayerListDisplay
          players={displayPlayers}
          currentUserId={currentUserId}
          className="w-full"
          hideReadyStatus
          emptyMessage="En attente de réponses..."
        />
      </ScrollArea>

      {currentRound && (
        <GameInput
          constraints={currentRound.constraints}
          onValidate={handleValidate}
          disabled={hasSubmitted}
        />
      )}
    </div>
  );
}
