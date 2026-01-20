import { PlayerProfile } from "@/lib/schemas/player-schema";
import { createClient } from "@/lib/supabase/client";
import { create } from "zustand";

export type PlayerRecord = PlayerProfile & {
  id: string;
  updated_at: string;
  created_at: string;
  last_sign_in_at?: string;
};

interface PlayerState {
  profile: PlayerRecord | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
  setProfile: (profile: PlayerRecord | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, newProfile: PlayerProfile) => Promise<void>;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    // If already initialized and profile exists (or we know it doesn't), avoid re-fetching
    // But for now, we want to fetch at least once per session per user
    // We can rely on isInitialized to avoid double fetching
    // BUT if the user ID changes, we MUST fetch.
    // This logic is better handled by the component/hook calling this.
    // Here we just do the fetch.

    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("players")
        .select(
          "id, pseudo, avatar_config, updated_at, created_at, last_sign_in_at",
        )
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          throw error;
        }
        set({ profile: null, isInitialized: true });
      } else {
        set({ profile: data as PlayerRecord, isInitialized: true });

        // Background update: Track activity without blocking the UI
        supabase
          .from("players")
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to update last_sign_in_at:", error);
            }
          });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      set({ error: err as Error, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (userId: string, newProfile: PlayerProfile) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const payload = {
        id: userId,
        ...newProfile,
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(), // Also update on explicit profile change
      };

      const { data, error } = await supabase
        .from("players")
        .upsert(payload)
        .select(
          "id, pseudo, avatar_config, updated_at, created_at, last_sign_in_at",
        )
        .single();

      if (error) throw error;
      if (data) set({ profile: data as PlayerRecord });
    } catch (err) {
      console.error("Error updating profile:", err);
      set({ error: err as Error });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({ profile: null, isLoading: false, error: null, isInitialized: false }),
}));
