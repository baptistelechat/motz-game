"use client";

import { startGame, toggleReady } from "@/app/actions/game-actions";
import { Button } from "@/components/ui/button";
import { LobbyPlayer } from "@/hooks/use-realtime-lobby";
import { Loader } from "@nsmr/pixelart-react";
import { Play } from "lucide-react";
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
    <div className="flex flex-col w-full max-w-md mx-auto gap-4 mb-2">
      <div className="flex gap-4 w-full">
        <Button
          variant={isMyPlayerReady ? "default" : "secondary"}
          size="xl"
          onClick={handleToggleReady}
          disabled={isPending}
          className="w-full flex-1"
        >
          {isPending ? (
            "Chargement..."
          ) : isMyPlayerReady ? (
            <div className="flex flex-col items-center leading-tight py-1">
              <div className="flex items-center gap-2">
                <Loader className="size-5 animate-spin" />
                <span>En attente</span>
              </div>
              <span className="text-sm">des autres joueurs...</span>
            </div>
          ) : (
            <>Prêt ?</>
          )}
        </Button>

        {isHost && (
          <Button
            variant="secondary"
            size="xl"
            onClick={handleStartGame}
            disabled={!allPlayersReady || isPending}
            className="w-full flex-1 animate-in fade-in slide-in-from-bottom-2"
          >
            <Play className="mr-2 size-6" />
            Lancer
          </Button>
        )}
      </div>

      {isHost && !allPlayersReady && (
        <p className="text-lg text-muted-foreground text-center animate-in fade-in">
          Tous les joueurs doivent être prêts
        </p>
      )}
    </div>
  );
}
