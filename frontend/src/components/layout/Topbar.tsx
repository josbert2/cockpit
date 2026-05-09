"use client";

import { Search, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="h-14 shrink-0 border-b border-border flex items-center px-4 gap-3 bg-bg/80 backdrop-blur sticky top-0 z-10">
      <div className="flex-1 max-w-md relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" />
        <input
          type="text"
          placeholder="Buscar proyecto, tarea, captura…"
          className="w-full h-9 pl-9 pr-12 rounded-xl bg-input border border-border text-sm placeholder:text-muted-fg focus:outline-none focus:border-primary/60 transition-colors"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-fg border border-border bg-card rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="size-9 grid place-items-center rounded-xl text-muted-fg hover:bg-muted hover:text-fg transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <SunMedium className="size-4" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
}
