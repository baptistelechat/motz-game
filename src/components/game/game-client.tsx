"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeGame } from "@/hooks/use-realtime-game";
import { getDictionary } from "@/lib/game/dictionary";
import { validateWord } from "@/lib/game/validation";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/store/use-game-store";
import { ConstraintCard } from "@/types/game";
import { mapGamePlayerToDisplayPlayer } from "@/utils/player-mapper";
import { Dice, InfoBox } from "@nsmr/pixelart-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { GameInput } from "./game-input";
import { GameTitle } from "./game-title";
import { PlayerListDisplay } from "./player-list-display";

interface GameClientProps {
  gameId: string;
  currentUserId: string;
}

function getConstraintLabel(
  card: ConstraintCard,
  theme?: string,
  imposedLetter?: string,
): string {
  switch (card.type) {
    case "free":
      return "LIBRE";
    case "min_len":
      return `MINI. ${card.value} LETTRES`;
    case "max_len":
      return `MAXI. ${card.value} LETTRES`;
    case "exact_len":
      return `${card.value} LETTRES`;
    case "starts_with_imposed":
      return `DEBUTE PAR ${imposedLetter?.toUpperCase() || "IMPOSEE"}`;
    case "ends_with_imposed":
      return `FINIT PAR ${imposedLetter?.toUpperCase() || "IMPOSEE"}`;
    case "unique_chars":
      return "LETTRES UNIQUES";
    case "min_vowels":
      return `MINI. ${card.value} VOYELLES`;
    case "invert_letters":
      return "INVERSION";
    case "theme":
      return `THEME : ${theme || "AUCUN"}`;
    default:
      return "INCONNU";
  }
}

export function GameClient({ gameId, currentUserId }: GameClientProps) {
  useRealtimeGame(gameId);
  const { players, currentRound, isLoading, hostId, submitWord } =
    useGameStore();

  // Track retries for the current round ID to prevent infinite loops
  const retryAttempts = useRef<number>(0);
  const lastCheckedRoundId = useRef<string | null>(null);

  // Solvability Check Effect
  useEffect(() => {
    if (!currentRound || hostId !== currentUserId) return;

    // Reset retries if it's a new round ID
    if (lastCheckedRoundId.current !== currentRound.id) {
      retryAttempts.current = 0;
      lastCheckedRoundId.current = currentRound.id;
    }

    const checkSolvability = async () => {
      const dictionary = await getDictionary();
      if (!dictionary.length) return; // Fail safe

      // Check if at least one word is valid
      const hasValidWord = dictionary.some(
        (word) =>
          validateWord(word, currentRound.constraints, () => true).isValid,
      );

      if (!hasValidWord) {
        if (retryAttempts.current < 10) {
          console.log(
            `Round ${currentRound.round_number} impossible (Attempt ${retryAttempts.current + 1}/10). Regenerating...`,
          );

          // Only show toast on first retry to avoid spam, or update it
          if (retryAttempts.current === 0) {
            toast.loading(
              "Configuration impossible détectée, recherche d'une alternative...",
              {
                id: "solvability-check",
                duration: 2000,
              },
            );
          }

          retryAttempts.current++;
          const supabase = createClient();
          await supabase.rpc("debug_regenerate_round_constraints", {
            p_round_id: currentRound.id,
          });
          // The subscription will trigger this effect again with new constraints
        } else {
          toast.error(
            "Impossible de trouver une configuration jouable après 10 essais.",
            {
              id: "solvability-check",
            },
          );
        }
      } else {
        // If we were regenerating, show success
        if (retryAttempts.current > 0) {
          toast.success("Configuration jouable trouvée !", {
            id: "solvability-check",
          });
        }
      }
    };

    checkSolvability();
  }, [currentRound, hostId, currentUserId]);

  const handleDebugReroll = async () => {
    if (!currentRound) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("debug_regenerate_round_constraints", {
      p_round_id: currentRound.id,
    });
    if (error) {
      console.error("Debug reroll failed:", error);
    }
  };

  const handleCheat = async () => {
    if (!currentRound) return;

    try {
      const words = await getDictionary();

      const validWords = words.filter((word) => {
        const result = validateWord(word, currentRound.constraints, () => true);
        return result.isValid;
      });

      if (validWords.length === 0) {
        toast.error("Aucun mot trouvé pour ces contraintes !");
        return;
      }

      const shuffled = validWords.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      toast.success("Mots suggérés :", {
        description: selected.join(", "),
        duration: 5000,
      });
    } catch (error) {
      console.error("Cheat error:", error);
      toast.error("Erreur lors de la recherche de mots");
    }
  };

  if (isLoading) {
    return <LoadingScreen message="CHARGEMENT DE LA PARTIE..." />;
  }

  const displayPlayers = players.map((p) =>
    mapGamePlayerToDisplayPlayer(p, hostId),
  );

  return (
    <div className="flex flex-col items-center h-full w-full gap-4 md:gap-8 overflow-hidden p-2 md:p-4 pb-24 relative">
      {process.env.NODE_ENV === "development" && currentRound && (
        <>
          <Button
            type="button"
            onClick={handleDebugReroll}
            variant="outline"
            className="absolute top-4 left-4 aspect-square p-0 size-12 z-50"
            title="DEBUG: Relancer les contraintes"
          >
            <Dice className="size-7" />
          </Button>
          <Button
            type="button"
            onClick={handleCheat}
            variant="outline"
            className="absolute top-20 left-4 aspect-square p-0 size-12 z-50"
            title="DEBUG: Trouver des mots valides"
          >
            <InfoBox className="size-7" />
          </Button>
        </>
      )}

      <div className="flex-none text-center space-y-2 md:space-y-4 w-full max-w-md">
        <GameTitle game>MANCHE {currentRound?.round_number || 1}</GameTitle>

        {currentRound ? (
          <Card
            className="border-2 md:border-4 shadow-[4px_4px_0_0_#000000] md:shadow-[8px_8px_0_0_#000000] animate-in zoom-in duration-300"
            data-testid="constraint-display"
          >
            <CardHeader className="pb-2 md:pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 md:space-y-2">
                  <p className="font-display text-xs md:text-sm text-muted-foreground uppercase">
                    IMPOSEE
                  </p>
                  <p className="font-display text-4xl md:text-6xl text-primary drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                    {currentRound.constraints.imposed_letter}
                  </p>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="font-display text-xs md:text-sm text-muted-foreground uppercase">
                    INTERDITE
                  </p>
                  <p className="font-display text-4xl md:text-6xl text-destructive drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    {currentRound.constraints.forbidden_letter}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <div className="w-full h-0.5 md:h-1 bg-border/20" />

              {/* Constraint Card Display */}
              <div className="bg-muted/50 p-2 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <p className="font-display text-xs text-muted-foreground uppercase mb-1">
                  CONTRAINTE SPECIALE
                </p>
                <p className="text-3xl text-foreground">
                  {getConstraintLabel(
                    currentRound.constraints.constraint_card,
                    currentRound.constraints.theme,
                    currentRound.constraints.imposed_letter,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-xl font-display text-muted-foreground">
            En attente du début de la manche...
          </div>
        )}
      </div>

      <ScrollArea>
        <PlayerListDisplay
          players={displayPlayers}
          currentUserId={currentUserId}
          className="w-full"
        />
      </ScrollArea>

      {currentRound && (
        <GameInput
          constraints={currentRound.constraints}
          onValidate={(word) => submitWord(word)}
        />
      )}
    </div>
  );
}
