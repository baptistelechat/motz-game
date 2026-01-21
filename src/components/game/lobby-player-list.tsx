"use client";

import { AvatarDisplay } from "@/components/profile/avatar-display";
import { LobbyPlayer } from "@/hooks/use-realtime-lobby";
import { AnimatePresence, motion } from "framer-motion";

interface LobbyPlayerListProps {
  players: LobbyPlayer[];
  hostId?: string;
}

export function LobbyPlayerList({ players, hostId }: LobbyPlayerListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl p-4">
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
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <AvatarDisplay
                animal={p.player.avatar_config.animal}
                color={p.player.avatar_config.color}
                size="md"
                isHost={hostId === p.player_id}
                isPlayer={p.player_id !== hostId}
                isBot={p.player.pseudo.startsWith("Bot-")}
              />
              {p.is_ready && (
                <div className="absolute -top-2 -right-2 bg-green-500 border-2 border-black text-white text-xs px-1 font-display animate-bounce">
                  PRET
                </div>
              )}
            </div>
            <div className="text-lg text-center truncate w-full px-2 text-foreground">
              {p.player.pseudo}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {players.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground font-sans animate-pulse">
          En attente de joueurs...
        </div>
      )}
    </div>
  );
}
