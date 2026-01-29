"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { useTheme } from "@/hooks/use-theme";
import { validateWord } from "@/lib/game/validation";
import { cn } from "@/lib/utils";
import { RoundConstraints } from "@/types/game";
import { ArrowRight, Loader } from "@nsmr/pixelart-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const [isValid, setIsValid] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const dictionary = useDictionary();
  const theme = useTheme(constraints.theme);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus mode: Keep input focused if possible, or provide easy way to refocus
  // For mobile, we rely on sticky positioning.
  useEffect(() => {
    // Auto-focus on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setValue(newValue);
    setIsValid(false);

    // Optional: Real-time validation feedback?
    // Story says: "Validation locale effectuée (à la frappe ou soumission)"
    // If we validate on type, we might annoy user with "Too short" while typing.
    // Usually, we validate format on type (imposed letters etc) but Dictionary on submit?
    // Or full validation on type but only show "Valid" state, hide "Error" until submit or delay?
    // Let's validate on type to show "Optimistic" state (Yellow border) if valid.

    if (newValue.length > 0 && dictionary.isReady) {
      const result = validateWord(
        newValue,
        constraints,
        dictionary.has,
        theme.isValid,
      );
      setIsValid(result.isValid);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (disabled || !value) return;

    if (!dictionary.isReady) {
      // Should not happen if we handle loading state, but safe guard
      return;
    }

    const result = validateWord(
      value,
      constraints,
      dictionary.has,
      theme.isValid,
    );

    if (result.isValid) {
      // Success
      // Play sound "Success" (placeholder)
      console.log("Audio: Success");
      onValidate(value);
      setValue("");
      setIsValid(false);
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
    if (isValid) return "border-[#FFFF00] focus-visible:ring-[#FFFF00]"; // Laser Lemon
    return "border-border";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t z-50">
      <div className="max-w-md mx-auto relative">
        <motion.div
          animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled || dictionary.isLoading}
              placeholder={
                dictionary.isLoading ? "Chargement..." : "Votre mot..."
              }
              className={getBorderClass()}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
            />
            {dictionary.isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <Button
            onClick={() => handleSubmit()}
            disabled={disabled || !value || dictionary.isLoading}
            variant="outline"
            className={cn(
              "transition-colors aspect-square size-12",
              isValid ? "bg-[#FFFF00] text-black hover:bg-[#E6E600]" : "",
            )}
            title="DEBUG: Relancer les contraintes"
          >
            <ArrowRight className="size-7" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
