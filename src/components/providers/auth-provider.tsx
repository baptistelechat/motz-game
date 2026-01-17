"use client";

import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (captchaToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, signIn } = useAnonymousAuth();

  useEffect(() => {
    if (user) {
      console.log("Anonymous auth active:", user.id);
    }
    if (error) {
      console.error("Anonymous auth failed:", error);
    }
  }, [user, error]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
