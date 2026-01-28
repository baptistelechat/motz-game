"use client";

import { joinGame } from "@/app/actions/game-actions";
import { LobbyControls } from "@/components/game/lobby-controls";
import { LobbyInfo } from "@/components/game/lobby-info";
import { LobbyPlayerList } from "@/components/game/lobby-player-list";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { usePlayerNotifications } from "@/hooks/use-player-notifications";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { generateRandomPlayer } from "@/lib/utils/generate-player";
import { useGameStore } from "@/store/use-game-store";
import { Loader } from "@nsmr/pixelart-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorCard } from "../ui/error-card";
import { GameTitle } from "./game-title";

interface LobbyClientProps {
  code: string;
  gameId: string;
  hostId: string;
}

export function LobbyClient({
  code,
  gameId,
  hostId: initialHostId,
}: LobbyClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    isInitialized,
  } = usePlayerProfile();

  // Use unified realtime hook (replaces useRealtimeLobby)
  const { refresh } = useRealtimeGame(gameId);

  // Access global store state
  const {
    players,
    status: gameStatus,
    isLoading: isLobbyLoading,
    hostId: storeHostId,
  } = useGameStore();

  // Enable toast notifications
  usePlayerNotifications(user?.id);

  // Use store hostId if available (updated via realtime), fallback to initial
  const currentHostId = storeHostId || initialHostId;

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

    const isInLobby = players.some((p) => p.id === user.id);
    if (isInLobby) {
      hasJoinedRef.current = true;
      return;
    }

    const join = async () => {
      setIsJoining(true);
      try {
        await joinGame(code);
        hasJoinedRef.current = true;
        // Explicitly refresh to ensure state is updated even if Realtime is slow
        await refresh();
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
  }, [user, profile, code, players, isJoining, refresh]);

  // 3. Navigation when game starts
  useEffect(() => {
    if (gameStatus === "PLAYING") {
      router.replace(`/game/${code}`);
    }
  }, [gameStatus, code, router]);

  const isInLobby = players.some((p) => p.id === user?.id);
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
                  refresh();
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

  const isHost = user?.id === currentHostId;

  return (
    <div
      className={`flex flex-col items-center gap-4 w-full min-h-0 animate-in fade-in duration-500 justify-center ${
        isHost
          ? "flex-1 h-full"
          : "flex-1 md:flex-none md:h-auto md:max-h-[80vh]"
      }`}
    >
      <div
        className={`flex-none text-center space-y-2 ${
          isHost ? "mt-0 md:mt-24" : "mt-0"
        }`}
      >
        <GameTitle>SALLE D&apos;ATTENTE</GameTitle>
        <p className="text-xl font-display text-primary drop-shadow-[2px_2px_0_(--border)]">
          {players.length} JOUEUR{players.length > 1 ? "S" : ""}
        </p>
        {isHost && (
          <div className="lg:hidden w-full mt-2">
            <LobbyInfo code={code} />
          </div>
        )}
      </div>

      <div
        className={`w-full min-h-0 overflow-hidden flex flex-col justify-center transition-all ${
          isHost ? "flex-1 md:max-h-[50vh]" : "flex-1 md:flex-none"
        }`}
      >
        <LobbyPlayerList
          players={players}
          hostId={currentHostId}
          className={isHost ? "md:max-h-full" : "md:max-h-[50vh]"}
        />
      </div>

      <div className="flex-none w-full max-w-md">
        <LobbyControls
          gameId={gameId}
          isHost={isHost}
          onGameStarted={refresh}
        />
      </div>
    </div>
  );
}
