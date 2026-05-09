import { cn } from "@/lib/utils";

export function PageHeader({
  emoji,
  title,
  description,
  action,
  className,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {emoji && (
            <span className="text-3xl leading-none select-none" aria-hidden>
              {emoji}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-fg">{title}</h1>
        </div>
        {action}
      </div>
      {description && (
        <p className="text-sm text-muted-fg ml-12">{description}</p>
      )}
    </div>
  );
}
