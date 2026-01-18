"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload } from "@nsmr/pixelart-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get("test-install") === "true";
    const isTestIOS = urlParams.get("test-ios") === "true";

    // Check device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || isTestIOS;
    setIsIOS(isIosDevice);

    // Check standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;

    // Show if test mode, or if iOS and not standalone
    if (isTestMode || isTestIOS || (isIosDevice && !isStandalone)) {
      setIsVisible(true);
    }

    // Handle beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="bg-[#121220] border-4 border-[#39FF14] shadow-hard text-white p-6 max-w-sm rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-[#39FF14] text-lg text-center">
              INSTALLER SUR IOS
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <ol className="space-y-4 font-sans text-white">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-[#39FF14] font-display">
                  1
                </span>
                <span>
                  Appuyez sur le bouton de partage{" "}
                  <Upload className="inline w-4 h-4 mx-1" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-[#39FF14] font-display">
                  2
                </span>
                <span>Sélectionnez &quot;Sur l&apos;écran d&apos;accueil&quot;</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-[#39FF14] font-display">
                  3
                </span>
                <span>Confirmez avec &quot;Ajouter&quot;</span>
              </li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#39FF14] text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none p-0 flex items-center justify-center animate-in zoom-in duration-300"
        aria-label="Installer l'application"
      >
        <Download className="size-7" />
      </Button>
    </>
  );
}
