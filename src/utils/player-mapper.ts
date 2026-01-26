import { DisplayPlayer } from "@/components/game/player-list-display";
import { GamePlayer } from "@/store/use-game-store";

export function mapGamePlayerToDisplayPlayer(
  player: GamePlayer,
  hostId: string | null | undefined,
): DisplayPlayer {
  return {
    id: player.id,
    pseudo: player.pseudo,
    avatarConfig: player.avatar_config,
    isReady: player.is_ready,
    isHost: hostId === player.id,
    isBot: player.pseudo.startsWith("Bot-"),
  };
}
