import { Card } from "@/components/ui/Card";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";

const FAKE_PROJECTS = [
  { name: "relay", status: "HOT" as const, days: 1, commits30d: 87, stack: "node vite", msg: "fix: HandoffCountdown se quedaba congelado" },
  { name: "erp", status: "HOT" as const, days: 1, commits30d: 40, stack: "php node laravel", msg: "Merge release-reverb" },
  { name: "wa-baileys", status: "HOT" as const, days: 1, commits30d: 3, stack: "node", msg: "contacts: cache + GET" },
  { name: "erp-mobile", status: "HOT" as const, days: 1, commits30d: 4, stack: "node", msg: "Fix: instagram" },
  { name: "realtes", status: "ACTIVE" as const, days: 8, commits30d: 39, stack: "?", msg: "remove .env.bak from tracking" },
  { name: "lizz", status: "ACTIVE" as const, days: 10, commits30d: 5, stack: "?", msg: "fix(ingresos): payments.meta.total" },
  { name: "futbol-stats", status: "ACTIVE" as const, days: 11, commits30d: 13, stack: "py", msg: "feat: betslip widget + top-picks" },
];

export default function ProjectListPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
        <p className="text-sm text-muted-fg mt-1">
          37 repos en <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/root/</code>. Datos mock — Fase 1 va a leer de la DB.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-fg text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Repo</th>
              <th className="text-right p-3 font-medium">Días</th>
              <th className="text-right p-3 font-medium">30d</th>
              <th className="text-left p-3 font-medium">Stack</th>
              <th className="text-left p-3 font-medium">Último commit</th>
            </tr>
          </thead>
          <tbody>
            {FAKE_PROJECTS.map((p) => (
              <tr
                key={p.name}
                className="border-t border-border hover:bg-muted/40 transition-colors"
              >
                <td className="p-3">
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-right tabular-nums text-muted-fg">{p.days}</td>
                <td className="p-3 text-right tabular-nums text-muted-fg">{p.commits30d}</td>
                <td className="p-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.stack}</code>
                </td>
                <td className="p-3 text-muted-fg truncate max-w-md">{p.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
