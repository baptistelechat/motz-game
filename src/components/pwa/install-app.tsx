"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstallStore } from "@/store/use-install-store";
import { Download, Upload } from "@nsmr/pixelart-react";
import { useEffect, useState } from "react";

export function InstallApp() {
  const { deferredPrompt, isIOS, isStandalone, setDeferredPrompt } =
    useInstallStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get("test-install") === "true";
    const isTestIOS = urlParams.get("test-ios") === "true";

    // Show if test mode, or if iOS and not standalone, or if we have a prompt
    if (
      isTestMode ||
      isTestIOS ||
      (isIOS && !isStandalone) ||
      deferredPrompt
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isIOS, isStandalone, deferredPrompt]);

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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>INSTALLER SUR IOS</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <ol className="space-y-4 font-sans text-popover-foreground">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-primary font-display">
                  1
                </span>
                <span>
                  Appuyez sur le bouton de partage{" "}
                  <Upload className="inline w-4 h-4 mx-1" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-primary font-display">
                  2
                </span>
                <span>
                  Sélectionnez &quot;Sur l&apos;écran d&apos;accueil&quot;
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border-2 border-white text-primary font-display">
                  3
                </span>
                <span>Confirmez avec &quot;Ajouter&quot;</span>
              </li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        size="icon-xl"
        onClick={handleInstallClick}
        className="transition-all animate-in zoom-in duration-300"
        aria-label="Installer l'application"
      >
        <Download className="size-7" />
      </Button>
    </>
  );
}
