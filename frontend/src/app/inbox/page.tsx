import { Card } from "@/components/ui/Card";

export default function InboxPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-fg mt-1">
          Capturas pendientes del vault <code className="text-xs bg-muted px-1.5 py-0.5 rounded">_inbox/</code>. Stub — Fase 3.
        </p>
      </div>

      <Card className="text-center py-16">
        <p className="text-muted-fg">No hay capturas pendientes.</p>
        <p className="text-xs text-muted-fg mt-2">
          Cuando el cockpit esté en Fase 3, va a leer del vault automáticamente.
        </p>
      </Card>
    </div>
  );
}
