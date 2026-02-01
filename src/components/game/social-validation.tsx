"use client";

import { finalizeValidation, voteInvalid } from "@/app/actions/game-actions";
import { AvatarDisplay } from "@/components/profile/avatar-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GamePlayer, GameRound, RoundSubmission } from "@/store/use-game-store";
import { useState } from "react";
import { toast } from "sonner";

interface SocialValidationViewProps {
  round: GameRound;
  players: GamePlayer[];
  submissions: RoundSubmission[];
  currentUserId: string;
  hostId: string | null;
}

export function SocialValidationView({
  round,
  players,
  submissions,
  currentUserId,
  hostId,
}: SocialValidationViewProps) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const isHost = currentUserId === hostId;

  const handleVote = async (submissionId: string) => {
    try {
      await voteInvalid(submissionId);
      toast.success("Vote enregistré");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Erreur lors du vote");
    }
  };

  const handleFinalize = async () => {
    if (!isHost) return;
    setIsFinalizing(true);
    try {
      await finalizeValidation(round.id);
    } catch (error) {
      console.error("Error finalizing:", error);
      toast.error("Erreur lors de la validation");
      setIsFinalizing(false);
    }
  };

  // Filter submissions that need validation (usually all, or maybe just thematic ones?)
  // Story says: "La liste des mots soumis s'affiche"
  const submissionsToValidate = submissions.filter((s) => s.word);

  return (
    <div className="flex flex-col items-center h-full w-full max-w-2xl mx-auto p-4 gap-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl md:text-4xl text-primary animate-pulse">
          VALIDATION SOCIALE
        </h2>
        <p className="text-muted-foreground font-display">
          Signalez les mots qui ne respectent pas le thème !
        </p>
      </div>

      <Card className="w-full flex-1 overflow-hidden flex flex-col border-4 border-black rounded-none shadow-hard">
        <CardHeader className="pb-2 bg-muted/50 border-b-4 border-black">
          <CardTitle className="font-display text-lg">
            VOTEZ CONTRE LES INTRUS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 bg-background">
          <ScrollArea className="h-full">
            <div className="divide-y-4 divide-black">
              {submissionsToValidate.map((sub) => {
                const player = players.find((p) => p.id === sub.player_id);
                const votes = sub.votes || [];
                const hasVoted = votes.includes(currentUserId);
                const isMySubmission = sub.player_id === currentUserId;

                return (
                  <div key={sub.id} className="flex items-center p-4 gap-4">
                    <AvatarDisplay
                      player={
                        player || {
                          avatar_config: { animal: "Chat", color: "#FFFF00" },
                        }
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display truncate">
                          {player?.pseudo || "Inconnu"}
                        </span>
                      </div>
                      <p className="text-xl font-bold font-mono">{sub.word}</p>
                    </div>

                    {!isMySubmission && (
                      <Button
                        variant={hasVoted ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleVote(sub.id)}
                        disabled={hasVoted}
                        className={cn(
                          "border-2 border-black rounded-none shadow-hard active:translate-y-1 active:shadow-none transition-all",
                          hasVoted && "opacity-50",
                        )}
                      >
                        <PixelIcon
                          name="alert-triangle"
                          className="w-4 h-4 mr-2"
                        />
                        {hasVoted ? "SIGNALÉ" : "SIGNALER"}
                        {votes.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-black text-white border-none"
                          >
                            {votes.length}
                          </Badge>
                        )}
                      </Button>
                    )}
                    {isMySubmission && votes.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="border-2 border-black rounded-none animate-pulse"
                      >
                        {votes.length} Signalement(s)
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {isHost ? (
        <Card className="w-full border-4 border-black rounded-none shadow-hard p-4 bg-muted">
          <Button
            onClick={handleFinalize}
            disabled={isFinalizing}
            className="w-full h-14 text-xl font-display border-4 border-black rounded-none shadow-hard hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            {isFinalizing ? (
              <>
                <PixelIcon name="clock" className="w-6 h-6 animate-spin" />
                VALIDATION...
              </>
            ) : (
              <>
                TERMINER LA VALIDATION
                <PixelIcon name="thumb-up" className="w-6 h-6" />
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground font-display animate-pulse">
          En attente de la fin du vote...
        </div>
      )}
    </div>
  );
}
