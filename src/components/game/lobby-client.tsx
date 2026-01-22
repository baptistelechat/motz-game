"use client";

import { joinGame } from "@/app/actions/game-actions";
import { LobbyControls } from "@/components/game/lobby-controls";
import { LobbyPlayerList } from "@/components/game/lobby-player-list";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { useRealtimeLobby } from "@/hooks/use-realtime-lobby";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { Loader } from "@nsmr/pixelart-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorCard } from "../ui/error-card";

interface LobbyClientProps {
  code: string;
  gameId: string;
  hostId: string;
}

export function LobbyClient({ code, gameId, hostId }: LobbyClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    isInitialized,
  } = usePlayerProfile();
  const {
    players,
    gameStatus,
    isLoading: isLobbyLoading,
    refreshPlayers,
  } = useRealtimeLobby(gameId, user?.id);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
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
        toast.error("Erreur lors de la création du profil.");
      }
    };

    createDefaultProfile();
  }, [isInitialized, user, profile, isProfileLoading, updateProfile]);

  // 2. Join Game once profile is ready
  useEffect(() => {
    // Wait for profile to be ready and user to be authenticated
    if (!user || !profile) return;
    if (hasJoinedRef.current || isJoining) return;

    const isInLobby = players.some((p) => p.player_id === user.id);
    if (isInLobby) {
      hasJoinedRef.current = true;
      return;
    }

    const join = async () => {
      setIsJoining(true);
      try {
        await joinGame(code);
        hasJoinedRef.current = true;
        // Trigger refresh immediately to minimize wait time
        refreshPlayers();
        // Toast removed: let the realtime subscription handle it or handle it implicitly by UI update
      } catch (err) {
        console.error("Failed to join game:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Impossible de rejoindre la partie.";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsJoining(false);
      }
    };
    join();
  }, [user, profile, code, refreshPlayers, players, isJoining]);

  // 3. Navigation when game starts
  useEffect(() => {
    if (gameStatus === "PLAYING") {
      router.replace(`/game/${code}`);
    }
  }, [gameStatus, code, router]);

  const isInLobby = players.some((p) => p.player_id === user?.id);
  const showLoader =
    isJoining ||
    (isLobbyLoading && players.length === 0) ||
    (!isInLobby && !error);

  // 4. Timeout handler for connection issues
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showLoader) {
      timeout = setTimeout(() => {
        setIsTimeout(true);
      }, 10000); // 10 seconds timeout
    } else {
      setIsTimeout(false);
    }
    return () => clearTimeout(timeout);
  }, [showLoader]);

  if (error || isTimeout) {
    return (
      <ErrorCard
        title={isTimeout ? "DÉLAI D'ATTENTE DÉPASSÉ" : "ERREUR"}
        message={
          isTimeout ? "La connexion au lobby prend trop de temps." : error
        }
        action={
          <>
            {isTimeout && (
              <Button
                size="xl"
                variant="outline"
                onClick={() => {
                  setIsTimeout(false);
                  refreshPlayers();
                }}
              >
                RÉESSAYER
              </Button>
            )}
            <Button asChild size="xl" variant="default">
              <Link href="/">RETOUR AU MENU</Link>
            </Button>
          </>
        }
      />
    );
  }

  if (showLoader) {
    return (
      <div className="flex items-center justify-center h-64 gap-4 animate-pulse text-muted-foreground">
        <Loader className="size-8 animate-spin" />
        <p className="font-display text-xl">CONNEXION...</p>
      </div>
    );
  }

  const isMyPlayerReady =
    players.find((p) => p.player_id === user?.id)?.is_ready || false;

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full md:h-auto md:max-h-[80vh] animate-in fade-in duration-500">
      <div className="flex-none text-center space-y-2">
        <p className="text-xl font-display text-primary drop-shadow-[2px_2px_0_(--border)]">
          {players.length} JOUEUR{players.length > 1 ? "S" : ""}
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <LobbyPlayerList players={players} hostId={hostId} />
      </div>

      {user && (
        <div className="flex-none w-full mt-auto md:mt-4">
          <LobbyControls
            gameId={gameId}
            isHost={user.id === hostId}
            players={players}
            isMyPlayerReady={isMyPlayerReady}
          />
        </div>
      )}
    </div>
  );
}
