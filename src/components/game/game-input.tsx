'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useDictionary } from '@/hooks/use-dictionary';
import { validateWord } from '@/lib/game/validation';
import { RoundConstraints } from '@/types/game';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameInputProps {
  constraints: RoundConstraints;
  onValidate: (word: string) => void;
  disabled?: boolean;
}

export function GameInput({ constraints, onValidate, disabled }: GameInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const dictionary = useDictionary();
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
    setError(null);
    setIsValid(false);
    
    // Optional: Real-time validation feedback?
    // Story says: "Validation locale effectuée (à la frappe ou soumission)"
    // If we validate on type, we might annoy user with "Too short" while typing.
    // Usually, we validate format on type (imposed letters etc) but Dictionary on submit?
    // Or full validation on type but only show "Valid" state, hide "Error" until submit or delay?
    // Let's validate on type to show "Optimistic" state (Yellow border) if valid.
    
    if (newValue.length > 0 && dictionary.isReady) {
      const result = validateWord(newValue, constraints, dictionary.has);
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

    const result = validateWord(value, constraints, dictionary.has);

    if (result.isValid) {
      // Success
      // Play sound "Success" (placeholder)
      console.log('Audio: Success');
      onValidate(value);
      setValue('');
      setIsValid(false);
      setError(null);
      // Keep focus
      inputRef.current?.focus();
    } else {
      // Error
      // Play sound "Bloop" (placeholder)
      console.log('Audio: Bloop');
      setError(result.error || 'Mot invalide');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Reset shake
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Border color logic
  const getBorderClass = () => {
    if (error || isShaking) return 'border-[#FF00FF] focus-visible:ring-[#FF00FF]'; // Hot Pink
    if (isValid) return 'border-[#FFFF00] focus-visible:ring-[#FFFF00]'; // Laser Lemon
    return 'border-border';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom,16px)] bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t z-50">
      <div className="max-w-md mx-auto relative">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -40 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute left-0 right-0 -top-2 flex justify-center"
            >
              <span className="bg-[#FF00FF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
              className={cn(
                "pr-10 font-mono text-lg uppercase tracking-widest border-2 transition-colors duration-200",
                getBorderClass(),
              )}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
            />
            {dictionary.isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <Button
            onClick={() => handleSubmit()}
            disabled={disabled || !value || dictionary.isLoading}
            size="icon"
            className={cn(
              "transition-colors",
              isValid ? "bg-[#FFFF00] text-black hover:bg-[#E6E600]" : "",
            )}
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
