import { Card } from "@/components/ui/Card";

export default function WeeklyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Weekly review</h1>
        <p className="text-sm text-muted-fg mt-1">
          Domingos 18hs te genera el resumen de la semana. Stub — Fase 6.
        </p>
      </div>

      <Card className="text-center py-16">
        <p className="text-muted-fg">No hay weekly reviews todavía.</p>
        <p className="text-xs text-muted-fg mt-2">
          El primero se genera cuando llegue el domingo.
        </p>
      </Card>
    </div>
  );
}
