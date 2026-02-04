"use client";

import { finishRound, resetGame } from "@/app/actions/game-actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { getConstraintLabel } from "@/lib/game/formatting";
import { calculatePlayerRankings } from "@/lib/game/ranking";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GameDebugControls } from "./game-debug-controls";
import { GameInput } from "./game-input";
import { GameTimer } from "./game-timer";
import { GameTitle } from "./game-title";
import { PlayerListDisplay } from "./player-list-display";
import { RoundSummary } from "./round-summary";
import { toast } from "sonner";

interface GameClientProps {
  gameId: string;
  currentUserId: string;
  code: string;
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

export function GameClient({ gameId, currentUserId, code }: GameClientProps) {
  const router = useRouter();
  useRealtimeGame(gameId);
  const {
    players,
    currentRound,
    isLoading,
    hostId,
    submitWord,
    roundSubmissions,
    status,
  } = useGameStore();

  const isHost = hostId === currentUserId;

  useEffect(() => {
    if (status === "LOBBY") {
      router.push(`/room/${code}`);
    }
  }, [status, code, router]);

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
      // Add a small delay (1.5s) to avoid abrupt transition
      const timer = setTimeout(() => {
        finishRound(currentRound.id).catch(console.error);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isHost, currentRound, players, roundSubmissions]);

  const displayPlayers = useMemo(() => {
    // Use unified ranking logic
    const rankedPlayers = calculatePlayerRankings(players, roundSubmissions);

    // Map to DisplayPlayer format
    return rankedPlayers
      .filter((rp) => rp.submission)
      .map((rp) => {
        const display = mapGamePlayerToDisplayPlayer(rp.player, hostId);
        return {
          ...display,
          score: rp.score,
          rank: rp.rank,
        };
      });
  }, [players, hostId, roundSubmissions]);

  const [optimisticSubmitted, setOptimisticSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleTimeUp = () => {
    if (isHost && currentRound && currentRound.status === "PLAYING") {
      finishRound(currentRound.id).catch(console.error);
    }
  };

  if (status === "FINISHED") {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen w-full pt-4 pb-4 px-4 gap-4">
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

  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT DE LA PARTIE..." />;
  }

  if (
    currentRound?.status === "COMPLETED" ||
    currentRound?.status === "VALIDATING"
  ) {
    return (
      <RoundSummary
        round={currentRound}
        players={players}
        submissions={roundSubmissions}
        currentUserId={currentUserId}
        hostId={hostId}
        isValidationMode={currentRound?.status === "VALIDATING"}
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
        <GameTitle game />

        {currentRound?.status === "PLAYING" && (
          <GameTimer endsAt={currentRound.ends_at} onTimeUp={handleTimeUp} />
        )}

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
          endsAt={currentRound.ends_at}
        />
      )}
    </div>
  );
}
