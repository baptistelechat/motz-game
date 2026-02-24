"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GamePlayer } from "@/store/use-game-store";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { PlayerListDisplay } from "./player-list-display";

interface LobbyPlayerListProps {
  players: GamePlayer[];
  hostId?: string | null;
  className?: string;
  reputation?: Record<string, boolean>;
  onKick?: (playerId: string) => void;
}

export function LobbyPlayerList({
  players,
  hostId,
  className,
  reputation,
  onKick,
}: LobbyPlayerListProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const displayPlayers = players.map((p) =>
    mapGamePlayerToDisplayPlayer(p, hostId, reputation),
  );

  return (
    <ScrollArea
      className={cn("w-full max-w-4xl mx-auto h-full md:h-auto", className)}
    >
      <PlayerListDisplay
        players={displayPlayers}
        currentUserId={currentUserId}
        onKick={onKick}
      />
    </ScrollArea>
  );
}
