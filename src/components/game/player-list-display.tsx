"use client";

import { AvatarConfig } from "@/interface/AvatarConfig";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AvatarDisplay } from "../profile/avatar-display";

export interface DisplayPlayer {
  id: string;
  pseudo: string;
  avatar_config: AvatarConfig;
  isReady?: boolean;
  isHost?: boolean;
  isBot?: boolean;
  score?: number;
  rank?: number;
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
      <AnimatePresence mode="popLayout">
        {players.map((p) => (
          <motion.div
            layout
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
            <div className="relative">
              <AvatarDisplay
                player={p}
                size="md"
                isReady={hideReadyStatus ? undefined : p.isReady}
                isHost={p.isHost}
                isBot={p.isBot}
                rank={p.rank}
              />
            </div>

            <div className="flex flex-col items-center w-full">
              <div
                className={cn(
                  "text-center truncate w-full px-2 font-display text-sm md:text-base",
                  p.id === currentUserId
                    ? "text-theme"
                    : "text-muted-foreground",
                )}
              >
                {p.pseudo}
              </div>
              {p.score !== undefined && (
                <div className="text-primary text-md md:text-xl">
                  {p.score} pts
                </div>
              )}
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
