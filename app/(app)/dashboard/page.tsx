import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { complianceScore, daysUntil, expiryStatus, docTypeLabel } from "@/lib/expiry";
import { StatusBadge } from "@/components/StatusBadge";
import { JobStatusButton } from "@/components/JobStatusButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const [documents, tenders, jobs, events, projects] = await Promise.all([
    db.document.findMany({ where: { companyId: session.companyId } }),
    db.tender.findMany({
      where: { companyId: session.companyId, outcome: "OPEN" },
      orderBy: { closingDate: "asc" },
      take: 5,
    }),
    db.job.findMany({
      where: { companyId: session.companyId, status: { not: "DONE" } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.auditEvent.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
    db.project.count({ where: { companyId: session.companyId, status: "ACTIVE" } }),
  ]);

  const { score, gaps } = complianceScore(documents);
  const radar = documents
    .filter((d) => d.expiryDate && ["expiring", "expired"].includes(expiryStatus(d.expiryDate)))
    .sort((a, b) => a.expiryDate!.getTime() - b.expiryDate!.getTime());

  const scoreColor = score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-ink-500">Your compliance state at a glance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-4">
        <div className="card text-center">
          <p className="label">Compliance health</p>
          <p className={`text-4xl font-extrabold ${scoreColor}`}>{score}%</p>
        </div>
        <div className="card text-center">
          <p className="label">Documents in vault</p>
          <p className="text-4xl font-extrabold">{documents.length}</p>
        </div>
        <div className="card text-center">
          <p className="label">Active projects</p>
          <p className="text-4xl font-extrabold">{projects}</p>
        </div>
        <div className="card text-center">
          <p className="label">Open tenders</p>
          <p className="text-4xl font-extrabold">{tenders.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-bold">🚨 Expiry radar</h2>
          {radar.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">Nothing expiring in the next 60 days. 🎉</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {radar.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-ink-400">{docTypeLabel(d.type)}</p>
                  </div>
                  <StatusBadge status={expiryStatus(d.expiryDate)} days={daysUntil(d.expiryDate)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="font-bold">📋 Compliance gaps</h2>
          {gaps.length === 0 ? (
            <p className="mt-3 text-sm text-green-600">All required documents are valid — you are tender-ready.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {gaps.map((g) => (
                <li key={g.type} className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium">{g.label}</p>
                  <StatusBadge status={g.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/documents" className="btn-secondary mt-4">Fix gaps in the vault →</Link>
        </section>

        <section className="card">
          <h2 className="font-bold">🛠️ Open jobs (QA & renewals)</h2>
          {jobs.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No open jobs.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {jobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{j.title}</p>
                    {j.notes && <p className="truncate text-xs text-ink-400">{j.notes}</p>}
                  </div>
                  <JobStatusButton jobId={j.id} status={j.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="font-bold">🕘 Recent activity</h2>
          <ul className="mt-3 divide-y divide-ink-100">
            {events.map((e) => (
              <li key={e.id} className="py-2 text-sm">
                <span className="font-medium">{e.user?.name ?? "System"}</span>{" "}
                <span className="text-ink-500">{e.action.replace(/[._]/g, " ")}</span>
                {e.detail && <span className="text-ink-400"> — {e.detail}</span>}
                <span className="block text-xs text-ink-300">
                  {e.createdAt.toLocaleString("en-ZA")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
