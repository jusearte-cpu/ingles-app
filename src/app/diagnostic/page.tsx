export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { diagnosticItems } from "@/db/schema";
import { DiagnosticRunner } from "./DiagnosticRunner";

export default function DiagnosticPage() {
  const items = db
    .select()
    .from(diagnosticItems)
    .orderBy(diagnosticItems.sortOrder)
    .all()
    .map((i) => ({ id: i.id, skill: i.skill, content: i.content as any }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Diagnóstico rápido</h1>
      {items.length === 0 ? (
        <p className="text-sm text-ink/60">
          Todavía no hay ítems de diagnóstico sembrados. Corre `npm run db:seed`.
        </p>
      ) : (
        <DiagnosticRunner items={items} />
      )}
    </div>
  );
}
