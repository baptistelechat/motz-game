import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { PlayerProfile } from "@/lib/schemas/player-schema";
import { usePlayerStore } from "@/store/use-player-store";
import { useEffect, useRef } from "react";

export type PlayerRecord = PlayerProfile & {
  id: string;
  last_seen: string;
};

export function usePlayerProfile() {
  const { user } = useAnonymousAuth();
  const {
    profile,
    isLoading,
    error,
    isInitialized,
    fetchProfile,
    updateProfile: storeUpdateProfile,
  } = usePlayerStore();

  // Ref to track if we've already tried fetching for this user
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && user.id !== hasFetchedRef.current) {
      // Avoid re-fetching if we already have the profile for this user
      if (profile && profile.id === user.id) {
        hasFetchedRef.current = user.id;
        return;
      }
      hasFetchedRef.current = user.id;
      fetchProfile(user.id);
    }
  }, [user, fetchProfile, profile]);

  const updateProfile = async (newProfile: PlayerProfile) => {
    if (!user) throw new Error("User not authenticated");
    return storeUpdateProfile(user.id, newProfile);
  };

  return {
    profile,
    isLoading,
    error,
    isInitialized,
    updateProfile,
    user,
    // expose fetchProfile if needed manually, wrapping with user check
    fetchProfile: async () => {
      if (user) await fetchProfile(user.id);
    },
  };
}
