"use client";

import { AvatarDisplay } from "@/components/profile/avatar-display";
import { useAuth } from "@/components/providers/auth-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LobbyPlayer } from "@/hooks/use-realtime-lobby";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface LobbyPlayerListProps {
  players: LobbyPlayer[];
  hostId?: string;
  className?: string;
}

export function LobbyPlayerList({
  players,
  hostId,
  className,
}: LobbyPlayerListProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  return (
    <ScrollArea className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 w-full p-4">
        <AnimatePresence>
          {players.map((p) => (
            <motion.div
              key={p.player_id}
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              className="flex flex-col items-center gap-1 group w-full md:w-40"
            >
              <AvatarDisplay
                animal={p.player.avatar_config.animal}
                color={p.player.avatar_config.color}
                size="md"
                isHost={hostId === p.player_id}
                isPlayer={p.player_id !== hostId}
                isBot={p.player.pseudo.startsWith("Bot-")}
                isReady={p.is_ready}
              />
              <div
                className={cn(
                  "text-lg text-center truncate w-full px-2",
                  p.player_id === currentUserId
                    ? "text-theme"
                    : "text-muted-foreground",
                )}
              >
                {p.player.pseudo}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {players.length === 0 && (
          <div className="col-span-full w-full text-center text-muted-foreground font-sans animate-pulse">
            En attente de joueurs...
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
