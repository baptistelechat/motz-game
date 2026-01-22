"use client";

import { startGame, toggleReady } from "@/app/actions/game-actions";
import { Button } from "@/components/ui/button";
import { LobbyPlayer } from "@/hooks/use-realtime-lobby";
import { Check, Play, X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface LobbyControlsProps {
  gameId: string;
  isHost: boolean;
  players: LobbyPlayer[];
  isMyPlayerReady: boolean;
}

export function LobbyControls({
  gameId,
  isHost,
  players,
  isMyPlayerReady,
}: LobbyControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleReady = () => {
    startTransition(async () => {
      try {
        await toggleReady(gameId, !isMyPlayerReady);
      } catch (error) {
        toast.error("Erreur lors du changement de statut");
        console.error(error);
      }
    });
  };

  const handleStartGame = () => {
    startTransition(async () => {
      try {
        await startGame(gameId);
      } catch (error) {
        toast.error("Impossible de lancer la partie");
        console.error(error);
      }
    });
  };

  const allPlayersReady =
    players.length > 0 && players.every((p) => p.is_ready);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <Button
        variant={isMyPlayerReady ? "secondary" : "default"}
        size="xl"
        onClick={handleToggleReady}
        disabled={isPending}
        className="mb-2"
      >
        {isPending ? (
          "Chargement..."
        ) : isMyPlayerReady ? (
          <>
            <Check className="mr-2 size-6" /> Je suis prêt
          </>
        ) : (
          <>
            <X className="mr-2 size-6" /> Pas prêt
          </>
        )}
      </Button>

      {isHost && (
        <div className="pt-4 border-t border-border/50">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleStartGame}
            disabled={!allPlayersReady || isPending}
            className="w-full text-lg font-bold animate-in fade-in slide-in-from-bottom-2"
          >
            <Play className="mr-2 size-6" />
            Lancer la partie
          </Button>
          {!allPlayersReady && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tous les joueurs doivent être prêts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
