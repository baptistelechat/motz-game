"use client";

import { useInstallStore } from "@/store/use-install-store";
import { useEffect } from "react";

export function usePWA() {
  const { setDeferredPrompt, setPlatformInfo } = useInstallStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search);
    const isTestIOS = urlParams.get("test-ios") === "true";

    // Check device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || isTestIOS;

    // Check standalone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = window.navigator as any;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;

    setPlatformInfo(isIosDevice, !!isStandalone);

    // Handle beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDeferredPrompt(e as any);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [setDeferredPrompt, setPlatformInfo]);
}
