"use client";

import {
  finalizeValidation,
  startNextRound,
  toggleVote,
} from "@/app/actions/game-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VALIDATION_DURATION_MS } from "@/lib/game/constants";
import { calculatePlayerRankings } from "@/lib/game/ranking";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { generateRandomAvatar } from "@/lib/utils/generate-player";
import {
  GamePlayer,
  GameRound,
  RoundSubmission,
  useGameStore,
} from "@/store/use-game-store";
import { Pause, Play } from "@nsmr/pixelart-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AvatarDisplay } from "../profile/avatar-display";
import { GameTitle } from "./game-title";

interface RoundSummaryProps {
  round: GameRound;
  players: GamePlayer[];
  submissions: RoundSubmission[];
  currentUserId: string;
  hostId: string | null;
  isValidationMode?: boolean;
}

export function RoundSummary({
  round,
  players,
  submissions,
  currentUserId,
  hostId,
  isValidationMode = false,
}: RoundSummaryProps) {
  const {
    updateRoundSubmission,
    // setCurrentRound, // Removed as we don't use it anymore for optimistic updates here
  } = useGameStore();
  const [supabase] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(false);
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // State to pause auto-advance
  const isHost = currentUserId === hostId;

  const handleNextRound = async () => {
    if (!isHost) return;
    setIsLoading(true);
    try {
      await startNextRound(round.id);
    } catch (error) {
      console.error("Error starting next round:", error);
      toast.error("Erreur lors du lancement de la manche suivante");
      setIsLoading(false);
    }
  };

  const handleFinalizeValidation = async () => {
    if (!isHost) return;
    setIsLoading(true);

    // Removed optimistic update to prevent fetching stale submissions via useRealtimeGame effect
    // We wait for the server to update the round status and submissions,
    // which will trigger Realtime updates to switch the UI and fetch correct data.

    try {
      await finalizeValidation(round.id);
    } catch (error) {
      console.error("Error finalizing:", error);
      toast.error("Erreur lors de la validation");
      setIsLoading(false);
    }
  };

  // Auto-advance timer logic
  useEffect(() => {
    // Only host handles the timer logic reset
    if (!isHost) return;

    // Reset progress when round changes or mode changes
    setAutoAdvanceProgress(0);
    // Unpause when round changes to ensure flow
    setIsPaused(false);
  }, [round.id, isValidationMode, isHost]);

  // Realtime Sync Logic
  useEffect(() => {
    const channel = supabase.channel(`round_sync:${round.id}`);

    if (!isHost) {
      // Clients listen for updates
      channel
        .on(
          "broadcast",
          { event: "sync_timer" },
          ({ payload }: { payload: { progress: number; paused: boolean } }) => {
            const { progress, paused } = payload;
            setAutoAdvanceProgress(progress);
            setIsPaused(paused);
          },
        )
        .subscribe();
    } else {
      // Host subscribes just to keep connection open (optional but good practice)
      channel.subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [round.id, isHost, supabase]);

  // Broadcast function for Host
  const broadcastSync = async (progress: number, paused: boolean) => {
    await supabase.channel(`round_sync:${round.id}`).send({
      type: "broadcast",
      event: "sync_timer",
      payload: { progress, paused },
    });
  };

  useEffect(() => {
    // Only host handles the timer
    if (!isHost) return;

    // Broadcast immediately when pause state changes
    broadcastSync(autoAdvanceProgress, isPaused);

    // Only auto-advance if not loading and not paused
    if (isLoading || isPaused) return;

    // Timer duration
    const AUTO_ADVANCE_DELAY = VALIDATION_DURATION_MS;
    const UPDATE_INTERVAL = 1000; // Update every second for "saccadé" effect
    const steps = AUTO_ADVANCE_DELAY / UPDATE_INTERVAL;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      setAutoAdvanceProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          broadcastSync(100, isPaused); // Final sync
          return 100;
        }

        const next = Math.min(prev + increment, 100);

        // Broadcast on every step since steps are now 1 second apart
        broadcastSync(next, isPaused);

        return next;
      });
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, isLoading, isPaused, round.id]); // Added round.id to deps to ensure fresh closure if needed, though isHost/paused are main triggers

  // Trigger action when progress reaches 100%
  useEffect(() => {
    if (!isHost || isLoading || isPaused) return;

    if (autoAdvanceProgress >= 100) {
      if (isValidationMode) {
        handleFinalizeValidation();
      } else {
        handleNextRound();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvanceProgress, isHost, isLoading, isPaused, isValidationMode]);

  // Reset loading state when round status changes (e.g. switching from validation to summary)
  useEffect(() => {
    setIsLoading(false);
  }, [round.status, isValidationMode]);

  const results = useMemo(() => {
    return calculatePlayerRankings(players, submissions, round.created_at);
  }, [players, submissions, round.created_at]);

  // Extract solutions from constraints metadata
  const solutions = useMemo(() => {
    // constraints is an object with a potential 'solutions' property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints = round.constraints as any;
    return (constraints?.solutions as string[]) || [];
  }, [round.constraints]);

  // Generate stable random avatars for validation mode to maintain anonymity
  const anonymousAvatars = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, any> = {};
    players.forEach((p) => {
      map[p.id] = generateRandomAvatar();
    });
    return map;
  }, [players]);

  const handleVote = async (submissionId: string) => {
    // Optimistic update
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission) {
      const votes = submission.votes || [];
      const hasVoted = votes.includes(currentUserId);
      const newVotes = hasVoted
        ? votes.filter((id) => id !== currentUserId)
        : [...votes, currentUserId];

      updateRoundSubmission({
        id: submissionId,
        votes: newVotes,
      });
    }

    try {
      await toggleVote(submissionId);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Erreur lors du vote");
      // Revert optimistic update (could be complex, fetching latest state is easier)
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-2xl mx-auto p-4 gap-6 animate-in fade-in duration-500">
      <GameTitle game={!isValidationMode} validation={isValidationMode} />
      {isValidationMode && (
        <p className="text-muted-foreground font-display text-center text-xl">
          Signalez les mots qui ne respectent pas le thème !
        </p>
      )}

      {/*  No solutions found */}
      {!isValidationMode && solutions.length > 0 ? (
        <Card className="w-full border-4 border-black bg-destructive/10 shadow-hard rounded-none">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive font-display text-xl">
              <PixelIcon name="alert-circle" className="w-8 h-8" />
              PERSONNE N&apos;A TROUVÉ !
              <PixelIcon name="alert-circle" className="w-8 h-8" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center font-display">
              Il fallait jouer :
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {solutions.map((sol, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-background text-primary border-2 border-black text-lg px-4 py-2 rounded-none"
                >
                  {sol}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Results Table */}
      <Card className="w-full flex-1 overflow-hidden flex flex-col border-4 border-black rounded-none shadow-hard">
        <CardHeader className="pb-2 border-b-4 border-black">
          <CardTitle className="font-display text-lg">
            {isValidationMode ? "VOTEZ" : "CLASSEMENT"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 bg-background">
          <ScrollArea className="h-full">
            <div className="divide-y-4 divide-black">
              {results.map((result) => {
                const votes = result.submission?.votes || [];
                const hasVoted = votes.includes(currentUserId);
                const isMySubmission = result.player.id === currentUserId;

                // In validation mode, only show entries with actual submissions
                if (isValidationMode && !result.submission) return null;

                return (
                  <div
                    key={result.player.id}
                    className={cn(
                      "grid items-center gap-3 p-4",
                      isValidationMode
                        ? "grid-cols-[auto_minmax(0,1fr)_auto]"
                        : "grid-cols-[3rem_auto_minmax(0,1fr)_auto]",
                      result.player.id === currentUserId && "bg-theme/5",
                      !isValidationMode &&
                        !result.isValid &&
                        "bg-destructive/5 opacity-75",
                    )}
                  >
                    {/* Rank (Left side) - Only in Score Mode */}
                    {!isValidationMode && (
                      <div className="flex justify-center items-center">
                        {result.isValid ? (
                          <span
                            className={cn(
                              "font-display text-lg w-8 text-center",
                              result.rank === 1 && "text-yellow-500",
                              result.rank === 2 && "text-slate-400",
                              result.rank === 3 && "text-amber-700",
                              result.rank > 3 && "text-muted-foreground",
                            )}
                          >
                            #{result.rank}
                          </span>
                        ) : (
                          <PixelIcon name="alert-circle" className="size-8" />
                        )}
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="relative">
                      {!isValidationMode ? (
                        <AvatarDisplay
                          player={result.player}
                          isHost={result.player.id === hostId}
                          // rank={result.rank}
                          size="md"
                          className="overflow-visible"
                        />
                      ) : (
                        <AvatarDisplay
                          player={{
                            ...result.player,
                            avatar_config: anonymousAvatars[result.player.id],
                          }}
                          // Masquer les status en mode anonyme
                          isHost={false}
                          rank={undefined}
                          size="md"
                          className="overflow-visible"
                        />
                      )}
                    </div>

                    {/* Info Joueur & Mot */}
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <div
                        className={cn(
                          "font-display truncate text-lg leading-tight w-full",
                          result.player.id === currentUserId && "text-theme",
                        )}
                        title={
                          !isValidationMode ? result.player.pseudo : undefined
                        }
                      >
                        {!isValidationMode
                          ? result.player.pseudo
                          : `Joueur ${result.rank}`}
                      </div>
                      <p
                        className={cn(
                          "text-sm truncate w-full flex gap-1 text-muted-foreground",
                          !isValidationMode &&
                            !result.isValid &&
                            "text-destructive line-through decoration-2",
                          isValidationMode && "text-xl",
                        )}
                      >
                        {result.word}
                        {result.duration !== undefined && (
                          <span>({result.duration.toFixed(3)}s)</span>
                        )}
                      </p>
                    </div>

                    {/* Action / Score */}
                    <div className="text-right flex flex-col items-end shrink-0 gap-0.5">
                      {isValidationMode ? (
                        <>
                          {!isMySubmission && result.submission && (
                            <Button
                              variant={hasVoted ? "destructive" : "outline"}
                              size="sm"
                              onClick={() =>
                                result.submission &&
                                handleVote(result.submission.id)
                              }
                            >
                              <PixelIcon name="thumb-down" className="size-6" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-display text-lg whitespace-nowrap">
                            +{result.score}
                          </span>
                          {result.isValid && result.submission && (
                            <div className="flex flex-col items-end leading-none gap-0.5 text-sm">
                              <span className="text-muted-foreground whitespace-nowrap">
                                Mot +
                                {result.score -
                                  (result.submission.points_details
                                    ?.speed_bonus || 0)}
                              </span>
                              {(result.submission.points_details?.speed_bonus ||
                                0) > 0 && (
                                <span className="text-primary whitespace-nowrap">
                                  Vitesse +
                                  {
                                    result.submission.points_details
                                      ?.speed_bonus
                                  }
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Host Controls */}
      <div className="w-full flex flex-col gap-2">
        {isHost ? (
          <div className="flex gap-2">
            <Button
              onClick={
                isValidationMode ? handleFinalizeValidation : handleNextRound
              }
              disabled={isLoading}
              className={cn("flex-1 h-12 text-xl font-display")}
            >
              {isLoading ? (
                <>{isValidationMode ? "VALIDATION..." : "LANCEMENT..."}</>
              ) : (
                <>
                  {isValidationMode
                    ? "TERMINER LA VALIDATION"
                    : "MANCHE SUIVANTE"}
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant={isPaused ? "destructive" : "outline"}
              title={isPaused ? "Reprendre" : "Pause"}
              className="aspect-square size-12"
              disabled={isLoading}
            >
              {isPaused ? (
                <Play className="size-6" />
              ) : (
                <Pause className="size-6" />
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground font-display animate-pulse text-xs">
            {isValidationMode
              ? "En attente de la fin du vote..."
              : "En attente de l'hôte..."}
          </div>
        )}

        {/* Timer Progress Bar */}
        <Progress
          value={autoAdvanceProgress}
          className="h-2 w-full border-black border rounded-none"
        />
      </div>
    </div>
  );
}
