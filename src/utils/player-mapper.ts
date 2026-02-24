import { DisplayPlayer } from "@/components/game/player-list-display";
import { GamePlayer } from "@/store/use-game-store";

export function mapGamePlayerToDisplayPlayer(
  player: GamePlayer,
  hostId: string | null | undefined,
  reputation?: Record<string, boolean>
): DisplayPlayer {
  return {
    id: player.id,
    pseudo: player.pseudo,
    avatar_config: player.avatar_config,
    isReady: player.is_ready,
    isHost: hostId === player.id,
    isBot: player.pseudo.startsWith("Bot-"),
    isReputable: reputation ? reputation[player.id] : undefined,
  };
}
