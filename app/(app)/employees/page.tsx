import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysUntil, expiryStatus } from "@/lib/expiry";
import { StatusBadge } from "@/components/StatusBadge";
import { EmployeeForm, RecordForm } from "@/components/EmployeeForms";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const RECORD_LABELS: Record<string, string> = {
  medical: "Medical",
  induction: "Induction",
  competency: "Competency",
};

export default async function EmployeesPage() {
  const session = await requireSession();
  const employees = await db.employee.findMany({
    where: { companyId: session.companyId },
    include: { records: { orderBy: { expiryDate: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Staff Records</h1>
        <p className="text-sm text-ink-500">
          Medicals, inductions and competency certificates per employee — all on the expiry radar.
        </p>
      </div>

      <EmployeeForm />

      {employees.length === 0 && (
        <p className="card text-center text-sm text-ink-400">
          No staff yet. Add your site team so their medicals and inductions never lapse.
        </p>
      )}

      <div className="space-y-6">
        {employees.map((emp) => (
          <section key={emp.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold">{emp.name}</h2>
                <p className="text-xs text-ink-400">
                  {emp.jobTitle || "—"}
                  {emp.idNumber && ` · ID …${emp.idNumber.slice(-4)}`}
                </p>
              </div>
              <DeleteButton url={`/api/employees/${emp.id}`} label="employee" />
            </div>

            {emp.records.length > 0 && (
              <ul className="mt-4 divide-y divide-ink-100">
                {emp.records.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-ink-400">
                        {RECORD_LABELS[r.type] ?? r.type}
                        {r.expiryDate && ` · expires ${r.expiryDate.toLocaleDateString("en-ZA")}`}
                      </p>
                    </div>
                    <StatusBadge status={expiryStatus(r.expiryDate)} days={daysUntil(r.expiryDate)} />
                  </li>
                ))}
              </ul>
            )}

            <RecordForm employeeId={emp.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
