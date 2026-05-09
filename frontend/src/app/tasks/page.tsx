import { Card } from "@/components/ui/Card";

export default function TasksPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tareas</h1>
        <p className="text-sm text-muted-fg mt-1">
          Lista global de TODOs cross-proyecto. Stub — Fase 4.
        </p>
      </div>

      <Card className="text-center py-16">
        <p className="text-muted-fg">Sin tareas todavía.</p>
        <p className="text-xs text-muted-fg mt-2">
          Va a leer todos los <code className="text-xs bg-muted px-1.5 py-0.5 rounded">- [ ]</code> de los .md del vault.
        </p>
      </Card>
    </div>
  );
}
