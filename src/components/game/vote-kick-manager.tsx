"use client";

import { AvatarDisplay } from "@/components/profile/avatar-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { GamePlayer } from "@/store/use-game-store";
import { Database } from "@/types/database.types";
import { AlertTriangle } from "lucide-react";

type KickSession = Database["public"]["Tables"]["kick_sessions"]["Row"];
type KickVote = Database["public"]["Tables"]["kick_votes"]["Row"];

interface VoteKickManagerProps {
  activeSession: KickSession | null;
  votes: KickVote[];
  hasVoted: boolean;
  castVote: (vote: boolean) => Promise<void>;
  currentUserId: string;
  players: GamePlayer[];
}

export function VoteKickManager({
  activeSession,
  votes,
  hasVoted,
  castVote,
  currentUserId,
  players,
}: VoteKickManagerProps) {
  if (!activeSession) return null;

  const targetPlayer = players.find((p) => p.id === activeSession.target_id);
  const initiatorPlayer = players.find(
    (p) => p.id === activeSession.initiator_id,
  );

  if (!targetPlayer) return null;

  const totalPlayers = players.length;
  const requiredVotes = Math.floor(totalPlayers / 2) + 1;
  const yesVotes = votes.filter((v) => v.vote).length;
  // Progress bar for yes votes vs required
  const progress = Math.min((yesVotes / requiredVotes) * 100, 100);

  // Don't show voting buttons to target
  const isTarget = currentUserId === activeSession.target_id;

  return (
    <Dialog open={!!activeSession}>
      <DialogContent className="sm:max-w-md border-4 border-black shadow-hard rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 font-display text-xl uppercase">
            <AlertTriangle className="w-6 h-6" />
            Vote d&apos;exclusion
          </DialogTitle>
          <DialogDescription className="font-sans text-base">
            {initiatorPlayer?.pseudo || "Un joueur"} a proposé d&apos;exclure{" "}
            <span className="text-foreground">{targetPlayer.pseudo}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <AvatarDisplay player={targetPlayer} size="lg" />

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-display uppercase text-muted-foreground">
              <span>
                Pour: <span className="text-red-600">{yesVotes}</span>
              </span>
              <span>Requis: {requiredVotes}</span>
            </div>
            <Progress value={progress} className="h-4 border-2 border-black" />
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-4 flex-col sm:flex-row w-full">
          {!hasVoted && !isTarget && (
            <div className="flex gap-4 w-full">
              <Button
                variant="destructive"
                onClick={() => castVote(true)}
                className="w-full flex-1"
                size="xl"
              >
                Exclure
              </Button>
              <Button
                variant="secondary"
                onClick={() => castVote(false)}
                className="w-full flex-1"
                size="xl"
              >
                Garder
              </Button>
            </div>
          )}
          {(hasVoted || isTarget) && (
            <p className="text-lg text-muted-foreground text-center animate-in fade-in">
              {isTarget
                ? "Vous ne pouvez pas voter contre vous-même."
                : "Vote enregistré. En attente des autres joueurs..."}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
