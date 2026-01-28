"use client";

import { AvatarDisplay } from "@/components/profile/avatar-display";
import { AvatarConfig } from "@/interface/AvatarConfig";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export interface DisplayPlayer {
  id: string;
  pseudo: string;
  avatarConfig: AvatarConfig;
  isReady?: boolean;
  isHost?: boolean;
  isBot?: boolean;
}

interface PlayerListDisplayProps {
  players: DisplayPlayer[];
  currentUserId?: string;
  className?: string;
  emptyMessage?: string;
  hideReadyStatus?: boolean;
}

export function PlayerListDisplay({
  players,
  currentUserId,
  className,
  emptyMessage = "En attente de joueurs...",
  hideReadyStatus = false,
}: PlayerListDisplayProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 w-full p-4",
        className,
      )}
    >
      <AnimatePresence>
        {players.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 10 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className="flex flex-col items-center gap-2 group w-full md:w-40"
          >
            <AvatarDisplay
              animal={p.avatarConfig.animal}
              color={p.avatarConfig.color}
              size="md"
              isHost={p.isHost}
              isPlayer={!p.isHost && !p.isBot}
              isBot={p.isBot}
              isReady={hideReadyStatus ? undefined : p.isReady}
            />
            <div
              className={cn(
                "text-center truncate w-full px-2 font-display text-sm md:text-base",
                p.id === currentUserId ? "text-theme" : "text-muted-foreground",
              )}
            >
              {p.pseudo}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {players.length === 0 && (
        <div className="col-span-full w-full text-center text-muted-foreground font-sans animate-pulse">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
