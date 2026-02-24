"use client";

import {
  castVote as castVoteAction,
  initiateVoteKick,
} from "@/app/actions/game-actions";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type KickSession = Database["public"]["Tables"]["kick_sessions"]["Row"];
type KickVote = Database["public"]["Tables"]["kick_votes"]["Row"];

export function useVoteKick(gameId: string, currentUserId: string) {
  const [activeSession, setActiveSession] = useState<KickSession | null>(null);
  const [votes, setVotes] = useState<KickVote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isKicked, setIsKicked] = useState(false);

  const supabase = createClient();

  // Subscribe to kick sessions
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`kick_sessions:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kick_sessions",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Check if active
            if (payload.new.status === "active") {
              const session = payload.new as KickSession;
              if (session.target_id === currentUserId) return;

              setActiveSession(session);
              setVotes([]);
              setHasVoted(false);
              toast.warning("Un vote d'exclusion a été lancé !");
            }
          } else if (payload.eventType === "UPDATE") {
            const session = payload.new as KickSession;
            if (
              session.status === "completed" ||
              session.status === "expired" ||
              session.status === "rejected"
            ) {
              setActiveSession(null);
              setVotes([]);
              if (session.status === "completed") {
                if (session.target_id === currentUserId) {
                  setIsKicked(true);
                  toast.error("Vous avez été exclu de la partie.");
                } else {
                  toast.info("Le joueur a été exclu.");
                }
              } else if (session.status === "expired")
                toast.info("Le vote a expiré.");
              else toast.info("Le vote d'exclusion a échoué.");
            } else {
              setActiveSession(session);
            }
          } else if (payload.eventType === "DELETE") {
            setActiveSession(null);
            setVotes([]);
          }
        },
      )
      .subscribe();

    // Check for existing active session
    supabase
      .from("kick_sessions")
      .select("*")
      .eq("game_id", gameId)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          // Allow target to see session for transparency
          // if (data.target_id === currentUserId) return;

          setActiveSession(data);
          // Fetch votes
          supabase
            .from("kick_votes")
            .select("*")
            .eq("session_id", data.id)
            .then(({ data: votesData }) => {
              if (votesData) {
                setVotes(votesData);
                setHasVoted(
                  votesData.some((v) => v.voter_id === currentUserId),
                );
              }
            });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase, currentUserId]);

  // Subscribe to votes for active session
  useEffect(() => {
    if (!activeSession) return;

    const channel = supabase
      .channel(`kick_votes:${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kick_votes",
          filter: `session_id=eq.${activeSession.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newVote = payload.new as KickVote;
            setVotes((prev) => {
              // Avoid duplicates just in case
              if (prev.some((v) => v.id === newVote.id)) return prev;
              return [...prev, newVote];
            });
            if (newVote.voter_id === currentUserId) setHasVoted(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession, supabase, currentUserId]);

  const handleInitiateVote = async (targetId: string) => {
    try {
      await initiateVoteKick(gameId, targetId);
      toast.success("Vote lancé !");
    } catch (error) {
      toast.error("Impossible de lancer le vote", {
        description: (error as Error).message,
      });
    }
  };

  const handleVote = async (vote: boolean) => {
    if (!activeSession) return;
    try {
      await castVoteAction(activeSession.id, vote);
      setHasVoted(true);
    } catch (error) {
      toast.error("Erreur lors du vote", {
        description: (error as Error).message,
      });
    }
  };

  return {
    activeSession,
    votes,
    hasVoted,
    isKicked,
    initiateVote: handleInitiateVote,
    castVote: handleVote,
  };
}
