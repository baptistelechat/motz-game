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

export interface RoundSubmission {
  id: string;
  player_id: string;
  word: string;
  score: number;
  is_valid: boolean;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  points_details?: any;
}

interface GameState {
  gameId: string | null;
  hostId: string | null;
  status: GameStatus;
  players: GamePlayer[];
  currentRound: GameRound | null;
  roundSubmissions: RoundSubmission[];
  isLoading: boolean;

  setGameId: (id: string) => void;
  setHostId: (id: string | null) => void;
  setStatus: (status: GameStatus) => void;
  setPlayers: (players: GamePlayer[]) => void;
  setCurrentRound: (round: GameRound | null) => void;
  setRoundSubmissions: (submissions: RoundSubmission[]) => void;
  addRoundSubmission: (submission: RoundSubmission) => void;
  removeRoundSubmission: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  submitWord: (word: string) => Promise<boolean>;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameId: null,
  hostId: null,
  status: "LOBBY",
  players: [],
  currentRound: null,
  roundSubmissions: [],
  isLoading: true,

  setGameId: (id) => set({ gameId: id }),
  setHostId: (id) => set({ hostId: id }),
  setStatus: (status) => set({ status }),
  setPlayers: (players) => set({ players }),
  setCurrentRound: (round) => set({ currentRound: round }),
  setRoundSubmissions: (submissions) => set({ roundSubmissions: submissions }),
  addRoundSubmission: (submission) =>
    set((state) => {
      const exists = state.roundSubmissions.some((s) => s.id === submission.id);
      if (exists) return state;
      return {
        roundSubmissions: [...state.roundSubmissions, submission],
      };
    }),
  removeRoundSubmission: (id) =>
    set((state) => ({
      roundSubmissions: state.roundSubmissions.filter((s) => s.id !== id),
    })),
  setIsLoading: (isLoading) => set({ isLoading }),

  submitWord: async (word) => {
    const { gameId, currentRound } = get();

    if (!gameId || !currentRound) {
      console.error(
        `Cannot submit word: Game (${gameId}) or Round (${currentRound?.id}) not active`,
      );
      toast.error("Erreur: Partie non active");
      return false;
    }

    try {
      const result = await submitWordAction({
        gameId,
        roundId: currentRound.id,
        word,
      });

      if (!result.success) {
        toast.error(result.message || "Mot refusé par le serveur");
        return false;
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
        return true;
      }
    } catch (err) {
      console.error("Failed to submit word:", err);
      toast.error("Erreur de communication avec le serveur");
      return false;
    }
  },
}));
