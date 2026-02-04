import { determineNetworkStatus } from "@/lib/utils/network";
import { useEffect, useRef, useState } from "react";

interface LatencyState {
  latency: number | null;
  isOffline: boolean;
  status: "good" | "fair" | "poor" | "offline";
}

export function useLatency(intervalMs: number = 10000) {
  const [state, setState] = useState<LatencyState>({
    latency: null,
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
    status: "good", // Default to good until measured
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkLatency = async () => {
    // Don't ping if we know we are offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setState((prev) => ({ ...prev, isOffline: true, status: "offline" }));
      return;
    }

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch("/api/ping", {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Ping failed");

      const end = Date.now();
      const latency = end - start;

      setState({
        latency,
        isOffline: false,
        status: determineNetworkStatus(latency, false),
      });
    } catch (error) {
      console.warn("Ping failed:", error);
      setState((prev) => ({
        ...prev,
        // If ping fails, we might be offline or server is down
        isOffline: true,
        status: "offline",
      }));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }));
      checkLatency(); // Check immediately when back online
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true, status: "offline" }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    checkLatency();

    // Set up polling
    intervalRef.current = setInterval(checkLatency, intervalMs);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs]);

  return state;
}
