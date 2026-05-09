"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sun,
  Inbox,
  ListChecks,
  CalendarDays,
  Settings,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Proyectos", icon: LayoutGrid, emoji: "📦" },
  { href: "/today", label: "Hoy", icon: Sun, emoji: "☀️" },
  { href: "/inbox", label: "Inbox", icon: Inbox, emoji: "📥" },
  { href: "/tasks", label: "Tareas", icon: ListChecks, emoji: "✓" },
  { href: "/weekly", label: "Weekly", icon: CalendarDays, emoji: "📅" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-fg flex flex-col">
      {/* Workspace header */}
      <div className="px-3 h-11 flex items-center gap-2 group cursor-pointer hover:bg-hover/60 mx-1 mt-2 rounded">
        <div className="size-5 rounded text-base leading-none grid place-items-center">
          ✈
        </div>
        <span className="text-sm font-medium text-fg tracking-tight flex-1">
          cockpit
        </span>
      </div>

      {/* Quick actions */}
      <div className="px-2 mt-1 space-y-0.5">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2 h-7 rounded text-sm text-muted-fg hover:bg-hover transition-colors"
        >
          <Search className="size-4" strokeWidth={1.75} />
          <span className="text-xs">Buscar</span>
          <kbd className="ml-auto text-[10px] font-mono opacity-60">⌘K</kbd>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2 h-7 rounded text-sm text-muted-fg hover:bg-hover transition-colors"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          <span className="text-xs">Nueva tarea</span>
        </button>
      </div>

      <div className="h-px bg-border mx-3 my-3" />

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-px overflow-y-auto">
        <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg/70">
          Workspace
        </p>
        {NAV.map(({ href, label, emoji }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-2 h-7 rounded text-sm transition-colors",
                active
                  ? "bg-hover text-fg font-medium"
                  : "hover:bg-hover/60 text-sidebar-fg"
              )}
            >
              <span className="text-sm leading-none w-4 text-center">{emoji}</span>
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 h-7 rounded text-sm text-sidebar-fg hover:bg-hover transition-colors"
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
