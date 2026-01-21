"use client";

import { joinGame } from "@/app/actions/game-actions";
import { LobbyPlayerList } from "@/components/game/lobby-player-list";
import { useAuth } from "@/components/providers/auth-provider";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { useRealtimeLobby } from "@/hooks/use-realtime-lobby";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { Loader } from "@nsmr/pixelart-react";
import { useEffect, useRef, useState } from "react";

interface LobbyClientProps {
  code: string;
  gameId: string;
  hostId: string;
}

export function LobbyClient({ code, gameId, hostId }: LobbyClientProps) {
  const { user } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    isInitialized,
  } = usePlayerProfile();
  const { players, isLoading: isLobbyLoading } = useRealtimeLobby(gameId);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);

  // 1. Ensure profile exists (Auto-create if missing for seamless join)
  useEffect(() => {
    if (!isInitialized || !user || profile || isProfileLoading) return;

    const createDefaultProfile = async () => {
      try {
        await updateProfile(generateRandomPlayer());
      } catch (err) {
        console.error("Failed to create auto-profile:", err);
        setError("Erreur lors de la création du profil.");
      }
    };

    createDefaultProfile();
  }, [isInitialized, user, profile, isProfileLoading, updateProfile]);

  // 2. Join Game once profile is ready
  useEffect(() => {
    // Wait for profile to be ready and user to be authenticated
    if (!user || !profile) return;
    if (hasJoinedRef.current) return;

    const join = async () => {
      setIsJoining(true);
      try {
        await joinGame(code);
        hasJoinedRef.current = true;
      } catch (err) {
        console.error("Failed to join game:", err);
        setError("Impossible de rejoindre la partie.");
      } finally {
        setIsJoining(false);
      }
    };
    join();
  }, [user, profile, code]);

  if (error) {
    return (
      <div className="text-destructive font-bold bg-black p-4 border-2 border-destructive shadow-[4px_4px_0_(--border)]">
        ERREUR: {error}
      </div>
    );
  }

  // Show loader only if joining OR (lobby loading AND no players yet) OR (user not yet in list)
  const isInLobby = players.some((p) => p.player_id === user?.id);
  const showLoader = isJoining || (isLobbyLoading && players.length === 0) || (!isInLobby && !error);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center h-64 gap-4 animate-pulse text-muted-foreground">
        <Loader className="size-8 animate-spin" />
        <p className="font-display text-xl">CONNEXION...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <p className="text-xl font-display text-primary drop-shadow-[2px_2px_0_(--border)]">
          {players.length} JOUEUR{players.length > 1 ? "S" : ""}
        </p>
      </div>

      <LobbyPlayerList players={players} hostId={hostId} />
    </div>
  );
}
