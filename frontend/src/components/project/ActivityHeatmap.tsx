"use client";

import { cn } from "@/lib/utils";

interface Props {
  data: Array<{ date: string; count: number }>;
  className?: string;
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export function ActivityHeatmap({ data, className }: Props) {
  // Agrupa en columnas de semanas (de lunes a domingo)
  // data viene ordenado por date asc (60 días)
  const max = Math.max(1, ...data.map((d) => d.count));

  // Construye grid 7 (rows días) x N (cols semanas)
  const days = data.map((d) => ({ ...d, dow: dayOfWeek(d.date) }));
  // Pad inicio para alinear con lunes
  const firstDow = days[0]?.dow ?? 0;
  const padStart: Array<{ date: string; count: number; dow: number; placeholder: true }> = [];
  for (let i = 0; i < firstDow; i++) {
    padStart.push({ date: "", count: 0, dow: i, placeholder: true });
  }
  const all: Array<{ date: string; count: number; dow: number; placeholder?: boolean }> = [
    ...padStart,
    ...days,
  ];

  // Slice into weeks (chunks of 7)
  const weeks: typeof all[] = [];
  for (let i = 0; i < all.length; i += 7) {
    weeks.push(all.slice(i, i + 7));
  }

  const intensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= max * 0.25) return 1;
    if (count <= max * 0.5) return 2;
    if (count <= max * 0.75) return 3;
    return 4;
  };

  const intensityClass: Record<number, string> = {
    0: "bg-muted/60",
    1: "bg-success/30",
    2: "bg-success/55",
    3: "bg-success/75",
    4: "bg-success",
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="flex flex-col justify-between text-[10px] text-muted-fg/70 pt-3 pb-1">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className={i % 2 === 1 ? "" : "opacity-0"}>
            {d}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={cn(
                  "size-3 rounded-sm transition-colors",
                  day.placeholder ? "opacity-0" : intensityClass[intensity(day.count)]
                )}
                title={day.placeholder ? "" : `${day.date}: ${day.count} commit${day.count === 1 ? "" : "s"}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-fg/70 self-end">
        <span>menos</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("size-2.5 rounded-sm", intensityClass[i])} />
        ))}
        <span>más</span>
      </div>
    </div>
  );
}

function dayOfWeek(iso: string): number {
  const d = new Date(iso);
  const dow = d.getDay(); // Sunday=0
  return (dow + 6) % 7; // Monday=0
}
