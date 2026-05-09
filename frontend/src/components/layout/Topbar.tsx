"use client";

import { Moon, SunMedium, ChevronRight, Star, MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WatcherIndicator } from "./WatcherIndicator";

const PATH_LABELS: Record<string, { label: string; emoji: string }> = {
  "/": { label: "Dashboard", emoji: "🛩" },
  "/today": { label: "Hoy", emoji: "☀️" },
  "/projects": { label: "Proyectos", emoji: "📦" },
  "/inbox": { label: "Inbox", emoji: "📥" },
  "/tasks": { label: "Tareas", emoji: "✓" },
  "/weekly": { label: "Weekly", emoji: "📅" },
  "/settings": { label: "Settings", emoji: "⚙️" },
};

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = PATH_LABELS[pathname] ?? { label: "Page", emoji: "📄" };

  return (
    <header className="h-11 shrink-0 flex items-center px-3 gap-1 border-b border-border bg-bg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-fg">
        <span className="text-base leading-none">{current.emoji}</span>
        <ChevronRight className="size-3 opacity-50" />
        <span className="text-fg font-medium">{current.label}</span>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <WatcherIndicator />
        <button
          type="button"
          className="h-7 px-2 grid place-items-center rounded text-xs text-muted-fg hover:bg-hover transition-colors"
        >
          Share
        </button>
        <button
          type="button"
          className="size-7 grid place-items-center rounded text-muted-fg hover:bg-hover transition-colors"
          aria-label="Star"
        >
          <Star className="size-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="size-7 grid place-items-center rounded text-muted-fg hover:bg-hover transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <SunMedium className="size-4" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4" strokeWidth={1.75} />
          )}
        </button>
        <button
          type="button"
          className="size-7 grid place-items-center rounded text-muted-fg hover:bg-hover transition-colors"
          aria-label="More"
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
