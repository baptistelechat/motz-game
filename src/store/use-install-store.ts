import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isIOS: boolean;
  isStandalone: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setPlatformInfo: (isIOS: boolean, isStandalone: boolean) => void;
}

export const useInstallStore = create<InstallState>((set) => ({
  deferredPrompt: null,
  isIOS: false,
  isStandalone: false,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setPlatformInfo: (isIOS, isStandalone) => set({ isIOS, isStandalone }),
}));
