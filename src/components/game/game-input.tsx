"use client";

import { Progress } from "@/components/ui/progress";
import { useDictionary } from "@/hooks/use-dictionary";
import { ROUND_DURATION_SECONDS } from "@/lib/game/constants";
import { getConstraintLabel } from "@/lib/game/formatting";
import { validateWord } from "@/lib/game/validation";
import { cn } from "@/lib/utils";
import { RoundConstraints } from "@/types/game";
import { ArrowRight, Close, Loader } from "@nsmr/pixelart-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface GameInputProps {
  constraints: RoundConstraints;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidate: (word: string) => Promise<any>;
  disabled?: boolean;
  endsAt?: string;
}

export function GameInput({
  constraints,
  onValidate,
  disabled,
  endsAt,
}: GameInputProps) {
  const [value, setValue] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const dictionary = useDictionary();
  const inputRef = useRef<HTMLInputElement>(null);

  // Visual Viewport logic to detect keyboard/compact state
  const [isCompact, setIsCompact] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!isCompact || !endsAt) return;

    const updateProgress = () => {
      const end = new Date(endsAt).getTime();
      const now = Date.now();
      const diffSeconds = Math.max(0, (end - now) / 1000);
      const p = Math.min(100, (diffSeconds / ROUND_DURATION_SECONDS) * 100);

      setProgress(p);
      setIsUrgent(diffSeconds <= 10);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [isCompact, endsAt]);

  useEffect(() => {
    const handleResize = () => {
      if (!window.visualViewport) return;
      // If height is less than 500px, we assume keyboard is open or screen is very small
      setIsCompact(window.visualViewport.height < 500);
    };

    // Initial check
    handleResize();

    // Listen to visual viewport resize (better than window resize for virtual keyboard)
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setValue(newValue);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (disabled || !value) return;

    if (!dictionary.isReady) {
      // Should not happen if we handle loading state, but safe guard
      return;
    }

    const result = validateWord(value, constraints, dictionary.has);

    if (result.isValid) {
      // Client-side valid, now try server-side
      const serverResult = await onValidate(value);

      if (serverResult?.success === false) {
        // Server rejected (e.g. profanity)
        console.log("Audio: Bloop");
        toast.error(serverResult.message || "Erreur serveur", {
          className:
            "!fixed !bottom-28 !left-0 !right-0 !mx-auto !w-fit !top-auto",
        });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400); // Reset shake
        inputRef.current?.focus();
        // Do NOT clear value so user can see what was rejected
      } else {
        // Success
        console.log("Audio: Success");
        setValue("");
        // Keep focus
        inputRef.current?.focus();
      }
    } else {
      // Error (Client-side)
      // Play sound "Bloop" (placeholder)
      console.log("Audio: Bloop");
      toast.error(result.error || "Mot invalide", {
        className:
          "!fixed !bottom-28 !left-0 !right-0 !mx-auto !w-fit !top-auto",
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Reset shake
      // Refocus input for quick retry
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Border color logic
  const getBorderClass = () => {
    if (isShaking) return "border-[#FF00FF] focus-visible:ring-[#FF00FF]"; // Hot Pink
    return "border-border";
  };

  return (
    <div className="w-full p-4 pb-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t z-50 transition-all duration-300">
      <div className="max-w-md mx-auto relative space-y-2">
        {/* Compact Constraint Banner - Visible only when viewport is small (keyboard open) */}
        {isCompact && (
          <div className="flex flex-col items-center justify-center gap-2 px-1 pb-1 text-xs font-display text-muted-foreground animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex gap-4 justify-between">
              <span className="text-allow">
                IMPOSEE : {constraints.imposed_letter}
              </span>
              <span className="text-disallow">
                INTERDITE : {constraints.forbidden_letter}
              </span>
            </div>
            <span className="">
              {getConstraintLabel(
                constraints.constraint_card,
                constraints.theme,
                constraints.imposed_letter,
              )}
            </span>

            {/* Compact Progress Bar */}
            <div className="w-full mt-1">
              <Progress
                value={progress}
                className={cn(
                  "h-1.5 border border-black rounded-none bg-background",
                  isUrgent && "[&>div]:bg-[#FF00FF]",
                )}
              />
            </div>
          </div>
        )}

        <motion.div
          animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="search"
              inputMode="text"
              name="motz_game_word_input"
              id="motz_game_word_input"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled || dictionary.isLoading}
              placeholder={
                dictionary.isLoading
                  ? "Chargement..."
                  : disabled
                    ? "En attente des autres..."
                    : "Votre mot..."
              }
              className={getBorderClass()}
              autoCapitalize="characters"
            />
            {dictionary.isLoading ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              value &&
              !disabled && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Effacer"
                >
                  <Close className="size-4" />
                </button>
              )
            )}
          </div>

          <Button
            onClick={() => handleSubmit()}
            disabled={disabled || !value || dictionary.isLoading}
            variant="outline"
            className={cn("transition-colors aspect-square size-12")}
            title="Valider"
          >
            <ArrowRight className="size-7" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
