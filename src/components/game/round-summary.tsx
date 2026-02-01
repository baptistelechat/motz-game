"use client";

import { startNextRound } from "@/app/actions/game-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculatePlayerRankings } from "@/lib/game/ranking";
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
    return calculatePlayerRankings(players, submissions, round.created_at);
  }, [players, submissions, round.created_at]);

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
            CLASSEMENT DE LA MANCHE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 bg-background">
          <ScrollArea className="h-full">
            <div className="divide-y-4 divide-black">
              {results.map((result) => (
                <div
                  key={result.player.id}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
                    result.player.id === currentUserId && "bg-theme/5",
                    !result.isValid && "bg-destructive/5 opacity-75",
                  )}
                >
                  {/* Avatar avec Badge de rang inclus */}
                  <div className="relative">
                    <AvatarDisplay
                      player={result.player}
                      isHost={result.player.id === hostId}
                      rank={result.rank}
                      size="md"
                    />
                  </div>

                  {/* Info Joueur & Mot */}
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <div
                      className={cn(
                        "font-display truncate text-lg leading-tight w-full",
                        result.player.id === currentUserId && "text-theme",
                      )}
                      title={result.player.pseudo}
                    >
                      {result.player.pseudo}
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate w-full flex gap-1",
                        result.isValid
                          ? "text-muted-foreground"
                          : "text-destructive line-through decoration-2",
                      )}
                    >
                      {result.word}
                      {result.duration !== undefined && (
                        <span>({result.duration.toFixed(3)}s)</span>
                      )}
                    </p>
                    {!result.isValid && (
                      <span className="text-[10px] text-destructive font-bold uppercase block truncate">
                        REJETE
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right flex flex-col items-end shrink-0 gap-0.5">
                    <span className="font-display text-lg whitespace-nowrap">
                      +{result.score}
                    </span>
                    {result.isValid && result.submission && (
                      <div className="flex flex-col items-end leading-none gap-0.5 text-sm">
                        <span className="text-muted-foreground whitespace-nowrap">
                          Mot +
                          {result.score -
                            (result.submission.points_details?.speed_bonus ||
                              0)}
                        </span>
                        {(result.submission.points_details?.speed_bonus || 0) >
                          0 && (
                          <span className="text-primary whitespace-nowrap">
                            Vit. +
                            {result.submission.points_details?.speed_bonus}
                          </span>
                        )}
                      </div>
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
        <Button
          onClick={handleNextRound}
          disabled={isStartingNext}
          className="w-full h-14 text-xl font-display"
        >
          {isStartingNext ? (
            <>
              <PixelIcon name="clock" className="w-6 h-6 animate-spin" />
              LANCEMENT...
            </>
          ) : (
            <>MANCHE SUIVANTE</>
          )}
        </Button>
      ) : (
        <div className="text-center text-muted-foreground font-display animate-pulse text-xs">
          En attente de l&apos;hôte...
        </div>
      )}
    </div>
  );
}
