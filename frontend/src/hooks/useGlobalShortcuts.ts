"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Atajos globales tipo Linear:
 * - ⌘K / Ctrl+K: abre command palette
 * - g d / g t / g p / g k / g i / g w: navegación rápida (sequence "g X")
 * - ?: muestra cheatsheet (TODO)
 *
 * Devuelve { paletteOpen, setPaletteOpen, cheatsheetOpen, setCheatsheetOpen }.
 */
export function useGlobalShortcuts() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  useEffect(() => {
    let leaderTimeout: ReturnType<typeof setTimeout> | null = null;
    let leaderActive = false;

    const isInputElement = (el: EventTarget | null) =>
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      (el instanceof HTMLElement && el.isContentEditable);

    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // ⌘K / Ctrl+K
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      if (isInputElement(e.target)) return;

      // ?
      if (e.key === "?" && !meta && !e.altKey) {
        e.preventDefault();
        setCheatsheetOpen((v) => !v);
        return;
      }

      // Leader: g
      if (!leaderActive && e.key === "g" && !meta && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        leaderActive = true;
        if (leaderTimeout) clearTimeout(leaderTimeout);
        leaderTimeout = setTimeout(() => {
          leaderActive = false;
        }, 1000);
        return;
      }

      // Leader follow-up
      if (leaderActive) {
        leaderActive = false;
        if (leaderTimeout) clearTimeout(leaderTimeout);
        const map: Record<string, string> = {
          d: "/",
          t: "/today",
          p: "/projects",
          k: "/tasks",
          i: "/inbox",
          w: "/weekly",
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (leaderTimeout) clearTimeout(leaderTimeout);
    };
  }, [router]);

  return { paletteOpen, setPaletteOpen, cheatsheetOpen, setCheatsheetOpen };
}
