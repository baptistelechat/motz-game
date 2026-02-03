"use client";

import {
  debugForceThemeConstraint,
  debugRegenerateRound,
} from "@/app/actions/game-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/game/dictionary";
import { validateWord } from "@/lib/game/validation";
import { GameRound } from "@/store/use-game-store";
import { Dice, InfoBox } from "@nsmr/pixelart-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GameDebugControlsProps {
  currentRound: GameRound;
  isHost: boolean;
}

export function GameDebugControls({
  currentRound,
  isHost,
}: GameDebugControlsProps) {
  const [validCount, setValidCount] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const countValidWords = async () => {
      if (!currentRound) return;

      setIsCounting(true);
      try {
        const words = await getDictionary();

        if (mounted) {
          setTotalWords(words.length);
        }

        // Count valid words without storing them all in state
        let count = 0;
        // Optimization: simple for loop or filter length
        for (const word of words) {
          if (
            validateWord(word, currentRound.constraints, () => true).isValid
          ) {
            count++;
          }
        }

        if (mounted) {
          setValidCount(count);
        }
      } catch (error) {
        console.error("Error counting valid words:", error);
      } finally {
        if (mounted) {
          setIsCounting(false);
        }
      }
    };

    countValidWords();

    return () => {
      mounted = false;
    };
  }, [currentRound]);

  const handleCheat = async () => {
    if (!currentRound) return;

    try {
      const words = await getDictionary();
      const solutions: string[] = [];

      for (const word of words) {
        if (validateWord(word, currentRound.constraints, () => true).isValid) {
          solutions.push(word);
          if (solutions.length >= 5) break;
        }
      }

      if (solutions.length === 0) {
        toast.error("Aucun mot trouvé pour ces contraintes !");
        return;
      }

      toast.success("Mots suggérés :", {
        description: solutions.join(", "),
        duration: 5000,
      });
    } catch (error) {
      console.error("Cheat error:", error);
      toast.error("Erreur lors de la recherche de mots");
    }
  };

  const handleDebugReroll = async () => {
    if (!currentRound) return;
    try {
      await debugRegenerateRound(currentRound.id);
      toast.success("Manche réinitialisée !", {
        description:
          "Les contraintes ont été régénérées et les soumissions effacées.",
      });
    } catch (error) {
      console.error("Debug reset failed:", error);
      toast.error("Erreur lors de la réinitialisation");
    }
  };

  const handleForceTheme = async () => {
    if (!currentRound) return;
    try {
      await debugForceThemeConstraint(currentRound.id);
      toast.success("Thème forcé !", {
        description: "La manche a été régénérée avec une contrainte de thème.",
      });
    } catch (error) {
      console.error("Force theme failed:", error);
      toast.error("Erreur lors du forçage du thème");
    }
  };

  // Only render in development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (isHost) {
    return (
      <>
        <Button
          type="button"
          onClick={handleDebugReroll}
          variant="outline"
          className="absolute top-4 left-4 aspect-square p-0! size-12 z-50"
          title="DEBUG: Réinitialiser la manche (contraintes + soumissions)"
        >
          <Dice className="size-7" />
        </Button>
        <div className="absolute top-20 left-4 z-50 flex flex-col items-start gap-2">
          <Button
            type="button"
            onClick={handleCheat}
            variant="outline"
            className="aspect-square p-0 size-12"
            title="DEBUG: Trouver des mots valides"
          >
            <InfoBox className="size-7" />
          </Button>
          <Button
            type="button"
            onClick={handleForceTheme}
            variant="outline"
            className="aspect-square p-0 size-12"
            title="DEBUG: Forcer contrainte Thème"
          >
            <span className="font-bold text-lg">T</span>
          </Button>
          {validCount !== null && (
            <Badge
              variant="secondary"
              className="text-sm whitespace-nowrap flex items-center"
            >
              {isCounting ? (
                "..."
              ) : (
                <>
                  {validCount}
                  {totalWords && (
                    <span className="opacity-70">
                      ({((validCount / totalWords) * 100).toFixed(2)}%)
                    </span>
                  )}
                </>
              )}
            </Badge>
          )}
        </div>
      </>
    );
  }
}
