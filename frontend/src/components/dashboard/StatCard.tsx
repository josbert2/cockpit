import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  label: string;
  value: number | string;
  emoji?: string;
  icon?: LucideIcon;
  hint?: string;
  trend?: { value: number; label: string };
  href?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

const TONE_STYLES = {
  default: "bg-card",
  primary: "bg-primary/5",
  success: "bg-success/5",
  warning: "bg-warning/5",
  danger: "bg-danger/5",
};

export function StatCard({
  label,
  value,
  emoji,
  icon: Icon,
  hint,
  trend,
  href,
  tone = "default",
  className,
}: Props) {
  const inner = (
    <div
      className={cn(
        "rounded-md border border-border p-4 transition-all",
        TONE_STYLES[tone],
        href && "hover:border-fg/20 cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-fg font-medium uppercase tracking-wider">
        {emoji && <span className="text-base leading-none">{emoji}</span>}
        {Icon && <Icon className="size-3.5" strokeWidth={2} />}
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-fg tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-success" : trend.value < 0 ? "text-danger" : "text-muted-fg"
            )}
          >
            {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "·"} {Math.abs(trend.value)}
            <span className="text-muted-fg ml-1 font-normal">{trend.label}</span>
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-fg">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
