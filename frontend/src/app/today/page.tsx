import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function TodayPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
        <p className="text-sm text-muted-fg mt-1">
          Las 3 cosas que mueven la aguja hoy. Stub — Fase 2.
        </p>
      </div>

      {[1, 2, 3].map((slot) => (
        <Card key={slot} className="flex items-start gap-4 p-5">
          <div className="size-8 shrink-0 rounded-xl bg-muted grid place-items-center text-muted-fg font-bold tabular-nums">
            {slot}
          </div>
          <div className="flex-1">
            <p className="text-fg font-medium">Slot vacío</p>
            <p className="text-sm text-muted-fg mt-1">
              Drop una task del backlog acá.
            </p>
          </div>
          <Badge tone="muted">Empty</Badge>
        </Card>
      ))}
    </div>
  );
}
