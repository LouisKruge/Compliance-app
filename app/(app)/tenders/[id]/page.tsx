import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { TenderOutcomeSelect } from "@/components/TenderOutcomeSelect";
import type { ExpiryStatus } from "@/lib/expiry";

export const dynamic = "force-dynamic";

type Checklist = { label: string; status: ExpiryStatus; documentId: string | null }[];

export default async function TenderPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const tender = await db.tender.findUnique({ where: { id: params.id } });
  if (!tender || tender.companyId !== session.companyId) notFound();

  const analysis = tender.analysis ? JSON.parse(tender.analysis) : null;
  const checklist: Checklist = analysis?.checklist ?? [];
  const missing = checklist.filter((c) => c.status === "missing" || c.status === "expired");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/tenders" className="text-sm font-semibold text-brand-600 hover:underline">
        ← All tenders
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">{tender.tenderNo}</h1>
            <p className="text-ink-500">{tender.title}</p>
          </div>
          <TenderOutcomeSelect tenderId={tender.id} outcome={tender.outcome} />
        </div>
        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="label inline">Closing date:</dt>{" "}
            <dd className="inline">{tender.closingDate ? tender.closingDate.toLocaleDateString("en-ZA") : "Not detected"}</dd>
          </div>
          <div>
            <dt className="label inline">CIDB grade required:</dt>{" "}
            <dd className="inline">{analysis?.cidbGradeRequired ?? "Not stated"}</dd>
          </div>
          <div>
            <dt className="label inline">Compulsory briefing:</dt>{" "}
            <dd className="inline">{analysis?.briefingRequired ? "Yes — attend or be disqualified" : "Not detected"}</dd>
          </div>
          <div>
            <dt className="label inline">Readiness:</dt>{" "}
            <dd className={`inline font-bold ${(tender.readinessPct ?? 0) >= 80 ? "text-green-600" : "text-amber-600"}`}>
              {tender.readinessPct ?? 0}%
            </dd>
          </div>
        </dl>
        {analysis?.summary && <p className="mt-4 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">{analysis.summary}</p>}
      </div>

      {missing.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <h2 className="font-bold text-red-800">⚠ You are missing {missing.length} item{missing.length > 1 ? "s" : ""}</h2>
          <ul className="mt-2 list-disc pl-6 text-sm text-red-700">
            {missing.map((m) => <li key={m.label}>{m.label}</li>)}
          </ul>
          <Link href="/documents" className="btn-primary mt-4">Fix in the vault →</Link>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold">Returnables checklist</h2>
        {checklist.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">No returnables detected in the pasted text.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center justify-between py-2">
                <p className="text-sm font-medium">{c.label}</p>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {analysis?.functionalityCriteria?.length > 0 && (
        <div className="card">
          <h2 className="font-bold">Functionality criteria</h2>
          <ul className="mt-2 list-disc pl-6 text-sm text-ink-600">
            {analysis.functionalityCriteria.map((c: string) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
