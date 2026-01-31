"use client";

import { startNextRound } from "@/app/actions/game-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GamePlayer, GameRound, RoundSubmission } from "@/store/use-game-store";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AvatarDisplay } from "../profile/avatar-display";
import { GameTitle } from "./game-title";

interface RoundSummaryProps {
  round: GameRound;
  players: GamePlayer[];
  submissions: RoundSubmission[];
  currentUserId: string;
  hostId: string | null;
}

export function RoundSummary({
  round,
  players,
  submissions,
  currentUserId,
  hostId,
}: RoundSummaryProps) {
  const [isStartingNext, setIsStartingNext] = useState(false);
  const isHost = currentUserId === hostId;

  const results = useMemo(() => {
    // 1. Map players to their submissions
    const mapped = players.map((player) => {
      const submission = submissions.find((s) => s.player_id === player.id);
      return {
        player,
        submission,
        score: submission?.score || 0,
        word: submission?.word || "-",
        rank: submission?.points_details?.rank || 999,
        isValid: submission?.is_valid !== false, // Treat undefined as true? Or check strict false
      };
    });

    // 2. Sort by Validity then Rank (or Score if Rank is missing)
    return mapped.sort((a, b) => {
      // Valid first
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;

      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.score - a.score;
    });
  }, [players, submissions]);

  // Extract solutions from constraints metadata
  const solutions = useMemo(() => {
    // constraints is an object with a potential 'solutions' property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints = round.constraints as any;
    return (constraints?.solutions as string[]) || [];
  }, [round.constraints]);

  const handleNextRound = async () => {
    if (!isHost) return;
    setIsStartingNext(true);
    try {
      await startNextRound(round.id);
    } catch (error) {
      console.error("Error starting next round:", error);
      toast.error("Erreur lors du lancement de la manche suivante");
      setIsStartingNext(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-2xl mx-auto p-4 gap-6 animate-in fade-in duration-500">
      <GameTitle game />

      {solutions.length > 0 ? (
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
                  className="bg-background text-primary border-2 border-black font-mono text-lg px-4 py-2 rounded-none"
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
        <CardHeader className="pb-2 bg-muted/50 border-b-4 border-black">
          <CardTitle className="font-display text-lg">CLASSEMENT</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 bg-background">
          <ScrollArea className="h-full">
            <div className="divide-y-4 divide-black">
              {results.map((result, index) => (
                <div
                  key={result.player.id}
                  className={cn(
                    "flex items-center p-4 gap-4",
                    result.player.id === currentUserId && "bg-theme/5",
                    !result.isValid && "bg-destructive/5 opacity-75",
                  )}
                >
                  <div className="font-display text-xl w-8 text-muted-foreground">
                    #{index + 1}
                  </div>
                  <AvatarDisplay
                    animal={result.player.avatar_config.animal}
                    color={result.player.avatar_config.color}
                    isHost={result.player.id === hostId}
                    isPlayer={result.player.id !== hostId}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-display truncate",
                          result.player.id === currentUserId && "text-theme",
                        )}
                      >
                        {result.player.pseudo}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate font-mono",
                        result.isValid
                          ? "text-muted-foreground"
                          : "text-destructive line-through decoration-2",
                      )}
                    >
                      {result.word}
                    </p>
                    {!result.isValid && (
                      <span className="text-[10px] text-destructive font-bold uppercase block">
                        REJETÉ PAR LE GROUPE
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-display text-lg block">
                      +{result.score}
                    </span>
                    {result.submission?.points_details?.speed_bonus > 0 &&
                      result.isValid && (
                        <span className="text-xs text-green-500 font-mono">
                          Speed: +
                          {result.submission?.points_details?.speed_bonus}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Host Controls */}
      {isHost ? (
        <Card className="w-full border-4 border-black rounded-none shadow-hard p-4 bg-muted">
          <Button
            onClick={handleNextRound}
            disabled={isStartingNext}
            className="w-full h-14 text-xl font-display border-4 border-black rounded-none shadow-hard hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isStartingNext ? (
              <>
                <PixelIcon name="clock" className="w-6 h-6 animate-spin" />
                LANCEMENT...
              </>
            ) : (
              <>
                MANCHE SUIVANTE
                <PixelIcon name="arrow-right" className="w-6 h-6" />
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground font-display animate-pulse">
          En attente de l&apos;hôte...
        </div>
      )}
    </div>
  );
}
