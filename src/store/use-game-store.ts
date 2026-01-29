import { submitWord as submitWordAction } from "@/app/actions/game-actions";
import { AvatarConfig } from "@/interface/AvatarConfig";
import { Database } from "@/types/database.types";
import { RoundConstraints } from "@/types/game";
import { toast } from "sonner";
import { create } from "zustand";

type GameStatus = Database["public"]["Enums"]["game_status"];
type RoundStatus = Database["public"]["Enums"]["round_status"];

export interface GamePlayer {
  id: string;
  pseudo: string;
  avatar_config: AvatarConfig;
  is_ready: boolean;
  joined_at: string;
}

export interface GameRound {
  id: string;
  round_number: number;
  constraints: RoundConstraints;
  theme?: string;
  status: RoundStatus;
}

interface GameState {
  gameId: string | null;
  hostId: string | null;
  status: GameStatus;
  players: GamePlayer[];
  currentRound: GameRound | null;
  isLoading: boolean;

  setGameId: (id: string) => void;
  setHostId: (id: string | null) => void;
  setStatus: (status: GameStatus) => void;
  setPlayers: (players: GamePlayer[]) => void;
  setCurrentRound: (round: GameRound | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  submitWord: (word: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameId: null,
  hostId: null,
  status: "LOBBY",
  players: [],
  currentRound: null,
  isLoading: true,

  setGameId: (id) => set({ gameId: id }),
  setHostId: (id) => set({ hostId: id }),
  setStatus: (status) => set({ status }),
  setPlayers: (players) => set({ players }),
  setCurrentRound: (round) => set({ currentRound: round }),
  setIsLoading: (isLoading) => set({ isLoading }),

  submitWord: async (word) => {
    const { gameId, currentRound } = get();

    if (!gameId || !currentRound) {
      console.error(
        `Cannot submit word: Game (${gameId}) or Round (${currentRound?.id}) not active`,
      );
      toast.error("Erreur: Partie non active");
      return;
    }

    try {
      const result = await submitWordAction({
        gameId,
        roundId: currentRound.id,
        word,
      });

      if (!result.success) {
        toast.error(result.message || "Mot refusé par le serveur");
        // Could also trigger a "shake" or specific feedback here if we had state for it
      } else {
        // Success
        const { score, rank, speed_bonus, word_score } =
          result.submission || {};

        if (score !== undefined) {
          toast.success(`Mot validé ! +${score} pts`, {
            description: `Mot: ${word_score} pts | Vitesse: ${speed_bonus} pts | Place: #${rank}`,
            duration: 3000,
          });
        } else {
          toast.success("Mot validé !");
        }
      }
    } catch (err) {
      console.error("Failed to submit word:", err);
      toast.error("Erreur de communication avec le serveur");
    }
  },
}));
