import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      tone: {
        primary: "bg-primary/15 text-primary border-primary/30",
        success: "bg-success/15 text-success border-success/30",
        warning: "bg-warning/15 text-warning border-warning/30",
        danger: "bg-danger/15 text-danger border-danger/30",
        purple: "bg-purple/15 text-purple border-purple/30",
        muted: "bg-muted text-muted-fg border-border",
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
