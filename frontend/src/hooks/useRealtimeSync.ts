"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";

/**
 * Suscribe a los canales públicos de Reverb y revalida queries de TanStack
 * cuando llegan eventos.
 *
 * Uso: invocar una vez en un componente alto (Providers o un wrapper que
 * vive bajo QueryClientProvider).
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    try {
      const echo = getEcho();

      const tasks = echo.channel("tasks");
      tasks.listen(".tasks.mutated", () => {
        qc.invalidateQueries({ queryKey: ["tasks"] });
      });

      const projects = echo.channel("projects");
      projects.listen(".projects.mutated", () => {
        qc.invalidateQueries({ queryKey: ["projects"] });
      });

      const inbox = echo.channel("inbox");
      inbox.listen(".inbox.mutated", () => {
        qc.invalidateQueries({ queryKey: ["inbox"] });
      });

      cleanup = () => {
        echo.leave("tasks");
        echo.leave("projects");
        echo.leave("inbox");
      };
    } catch (err) {
      console.warn("[realtime] echo init failed:", err);
    }
    return () => cleanup?.();
  }, [qc]);
}
