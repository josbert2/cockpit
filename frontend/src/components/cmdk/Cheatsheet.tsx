"use client";

import { X } from "lucide-react";

const SHORTCUTS = [
  {
    group: "General",
    items: [
      { keys: ["⌘", "K"], desc: "Command palette" },
      { keys: ["?"], desc: "Mostrar este cheatsheet" },
      { keys: ["esc"], desc: "Cerrar diálogo / palette" },
    ],
  },
  {
    group: "Navegación (después de g)",
    items: [
      { keys: ["g", "d"], desc: "Dashboard" },
      { keys: ["g", "t"], desc: "Hoy" },
      { keys: ["g", "p"], desc: "Proyectos" },
      { keys: ["g", "k"], desc: "Tareas" },
      { keys: ["g", "i"], desc: "Inbox" },
      { keys: ["g", "w"], desc: "Weekly" },
    ],
  },
  {
    group: "En el palette",
    items: [
      { keys: ["↑", "↓"], desc: "Navegar resultados" },
      { keys: ["↵"], desc: "Ejecutar" },
    ],
  },
];

export function Cheatsheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-fg/20 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-md rounded-md border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <h2 className="text-sm font-semibold">Atajos de teclado</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-7 grid place-items-center rounded text-muted-fg hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map((g) => (
            <div key={g.group}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-fg/70 mb-2">
                {g.group}
              </p>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <div
                    key={it.desc}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-fg">{it.desc}</span>
                    <div className="flex items-center gap-1">
                      {it.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="font-mono text-[11px] border border-border rounded px-1.5 py-0.5 bg-muted/40 text-muted-fg"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
