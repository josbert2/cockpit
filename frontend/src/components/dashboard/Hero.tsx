"use client";

import { useEffect, useState } from "react";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function getGreeting(hour: number) {
  if (hour < 6) return "Trasnochando";
  if (hour < 12) return "Buen día";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

interface Props {
  todaySlots: number;
  hotCount: number;
  manualOpen: number;
  vaultOpen: number;
}

export function Hero({ todaySlots, hotCount, manualOpen, vaultOpen }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <div className="h-32" />;
  }

  const dateLabel = `${DAYS[now.getDay()]} ${now.getDate()} de ${MONTHS[now.getMonth()]}`;
  const greeting = `${getGreeting(now.getHours())}, Felipe`;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-fg uppercase tracking-wider font-medium">
        {dateLabel}
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-fg">{greeting}.</h1>
      <p className="text-base text-muted-fg max-w-2xl leading-relaxed">
        {todaySlots > 0 ? (
          <>
            Tenés <span className="text-fg font-semibold">{todaySlots}/3</span> slots con foco hoy.{" "}
          </>
        ) : (
          <>Aún no elegiste foco para hoy. </>
        )}
        <span className="text-fg font-semibold">{hotCount}</span> proyecto{hotCount === 1 ? "" : "s"} hot ·{" "}
        <span className="text-fg font-semibold">{manualOpen}</span> tareas manuales ·{" "}
        <span className="text-fg font-semibold">{vaultOpen}</span> del vault.
      </p>
    </div>
  );
}
