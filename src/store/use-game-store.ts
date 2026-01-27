import { AvatarConfig } from "@/interface/AvatarConfig";
import { Database } from "@/types/database.types";
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
  constraints: {
    mandatory_letter: string;
    forbidden_letter: string;
    theme: string;
  };
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
}

export const useGameStore = create<GameState>((set) => ({
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
}));
