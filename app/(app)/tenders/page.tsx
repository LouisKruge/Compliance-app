import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TenderForm } from "@/components/TenderForm";

export const dynamic = "force-dynamic";

const OUTCOME_STYLES: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  SUBMITTED: "bg-purple-100 text-purple-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-ink-100 text-ink-500",
};

export default async function TendersPage() {
  const session = await requireSession();
  const tenders = await db.tender.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Tender Analyzer</h1>
        <p className="text-sm text-ink-500">
          Paste a tender document; we extract the returnables checklist and cross-check it against your vault.
        </p>
      </div>

      <TenderForm />

      <section className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left">
              <th className="px-5 py-3 font-semibold">Tender</th>
              <th className="px-5 py-3 font-semibold">Closing</th>
              <th className="px-5 py-3 font-semibold">Readiness</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {tenders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-400">
                  No tenders analyzed yet. Paste your first tender document above.
                </td>
              </tr>
            )}
            {tenders.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-3">
                  <Link href={`/tenders/${t.id}`} className="font-medium text-brand-600 hover:underline">
                    {t.tenderNo}
                  </Link>
                  <p className="text-xs text-ink-400">{t.title}</p>
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {t.closingDate ? t.closingDate.toLocaleDateString("en-ZA") : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className={`font-bold ${(t.readinessPct ?? 0) >= 80 ? "text-green-600" : (t.readinessPct ?? 0) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {t.readinessPct ?? 0}%
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${OUTCOME_STYLES[t.outcome]}`}>
                    {t.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
