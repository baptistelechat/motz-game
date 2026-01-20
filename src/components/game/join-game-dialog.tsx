"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface JoinGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinGameDialog({ open, onOpenChange }: JoinGameDialogProps) {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 6) {
      router.push(`/room/${code.toUpperCase()}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-4 border-black shadow-hard rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center uppercase">
            Rejoindre une partie
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleJoin} className="flex flex-col gap-6 py-4">
          <div className="space-y-2">
            <Input
              placeholder="A1B2C3"
              className="text-center tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="submit"
            size="xl"
            disabled={code.length < 6}
            className="w-full"
          >
            REJOINDRE
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
