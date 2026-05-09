import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Notion-style badges: pill, fondo plano sutil, sin border.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        primary: "bg-primary/10 text-primary",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        danger: "bg-danger/12 text-danger",
        purple: "bg-purple/12 text-purple",
        muted: "bg-muted text-muted-fg",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export const STATUS_TONE = {
  HOT: "danger",
  ACTIVE: "success",
  PAUSED: "warning",
  IDLE: "muted",
  STALE: "muted",
} as const;
