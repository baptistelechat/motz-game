"use client";

import { debugRegenerateRound } from "@/app/actions/game-actions";
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
}

export function GameDebugControls({ currentRound }: GameDebugControlsProps) {
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

  const handleDebugReroll = async () => {
    if (!currentRound) return;
    try {
      await debugRegenerateRound(currentRound.id);
      toast.success("Contraintes régénérées !");
    } catch (error) {
      console.error("Debug reroll failed:", error);
      toast.error("Erreur lors de la régénération");
    }
  };

  // Only render in development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleDebugReroll}
        variant="outline"
        className="absolute top-4 left-4 aspect-square p-0! size-12 z-50"
        title="DEBUG: Relancer les contraintes"
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
        {validCount !== null && (
          <Badge variant="secondary" className="text-sm whitespace-nowrap flex items-center">
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
