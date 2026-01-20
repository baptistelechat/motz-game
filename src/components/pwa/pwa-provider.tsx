"use client";

import { usePWA } from "@/hooks/use-pwa";

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  usePWA();
  return <>{children}</>;
}
