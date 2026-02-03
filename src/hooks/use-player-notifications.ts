import { useGameStore } from "@/store/use-game-store";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function usePlayerNotifications(currentUserId: string | undefined) {
  const players = useGameStore((state) => state.players);
  const previousPlayersRef = useRef(players);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (players.length > 0) {
      if (isFirstLoadRef.current) {
        previousPlayersRef.current = players;
        isFirstLoadRef.current = false;
        return;
      }

      // Find new players
      const newJoiners = players.filter(
        (p) =>
          !previousPlayersRef.current.some((prev) => prev.id === p.id) &&
          p.id !== currentUserId,
      );

      newJoiners.forEach((joiner) => {
        toast.success(`${joiner.pseudo} a rejoint la partie !`);
      });

      // Find players who left
      const leavers = previousPlayersRef.current.filter(
        (prev) =>
          !players.some((p) => p.id === prev.id) && prev.id !== currentUserId,
      );

      leavers.forEach((leaver) => {
        toast.info(`${leaver.pseudo} a quitté la partie.`);
      });

      // Update ref
      previousPlayersRef.current = players;
    }
  }, [players, currentUserId]);
}
