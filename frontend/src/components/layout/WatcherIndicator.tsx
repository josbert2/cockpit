"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { fetchVaultSyncStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

export function WatcherIndicator() {
  const { data } = useQuery({
    queryKey: ["vault-sync-status"],
    queryFn: fetchVaultSyncStatus,
    refetchInterval: 5_000,
    staleTime: 0,
  });

  if (!data) {
    return null;
  }

  const active = data.watcher_active;
  const age = data.watcher_stamp_age_s;
  const ageLabel =
    age === null
      ? "no init"
      : age < 60
        ? `${age}s`
        : age < 3600
          ? `${Math.floor(age / 60)}m`
          : `${Math.floor(age / 3600)}h`;

  return (
    <div
      className={cn(
        "h-7 px-2 flex items-center gap-1.5 rounded text-[11px] font-medium border transition-colors",
        active
          ? "bg-success/10 text-success border-success/20"
          : "bg-muted/40 text-muted-fg border-border"
      )}
      title={
        active
          ? `Vault watcher activo · último ping hace ${ageLabel}`
          : "Vault watcher inactivo. Corré: php artisan cockpit:watch-vault"
      }
    >
      {active ? (
        <Eye className="size-3" strokeWidth={2} />
      ) : (
        <EyeOff className="size-3" strokeWidth={2} />
      )}
      <span className="tabular-nums">
        {active ? `vault · ${ageLabel}` : "vault off"}
      </span>
      {active && (
        <span className="size-1.5 rounded-full bg-success animate-pulse ml-0.5" />
      )}
    </div>
  );
}
