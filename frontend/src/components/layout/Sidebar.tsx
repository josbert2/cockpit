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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Proyectos", icon: LayoutGrid },
  { href: "/today", label: "Hoy", icon: Sun },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/weekly", label: "Weekly", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-bg flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-border">
        <div className="size-7 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-fg">
          ✈
        </div>
        <span className="font-semibold tracking-tight">cockpit</span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                active
                  ? "bg-muted text-fg font-medium"
                  : "text-muted-fg hover:bg-muted hover:text-fg"
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-fg hover:bg-muted hover:text-fg transition-colors"
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
