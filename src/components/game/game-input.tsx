"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import { getConstraintLabel } from "@/lib/game/formatting";
import { validateWord } from "@/lib/game/validation";
import { cn } from "@/lib/utils";
import { RoundConstraints } from "@/types/game";
import { ArrowRight, Loader, Close } from "@nsmr/pixelart-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface GameInputProps {
  constraints: RoundConstraints;
  onValidate: (word: string) => void;
  disabled?: boolean;
}

export function GameInput({
  constraints,
  onValidate,
  disabled,
}: GameInputProps) {
  const [value, setValue] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const dictionary = useDictionary();
  const inputRef = useRef<HTMLInputElement>(null);

  // Visual Viewport logic to detect keyboard/compact state
  const [isCompact, setIsCompact] = useState(false);

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (disabled || !value) return;

    if (!dictionary.isReady) {
      // Should not happen if we handle loading state, but safe guard
      return;
    }

    const result = validateWord(value, constraints, dictionary.has);

    if (result.isValid) {
      // Success
      // Play sound "Success" (placeholder)
      console.log("Audio: Success");
      onValidate(value);
      setValue("");
      // Keep focus
      inputRef.current?.focus();
    } else {
      // Error
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
