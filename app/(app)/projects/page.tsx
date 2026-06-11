import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/ProjectForm";

export const dynamic = "force-dynamic";

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
};

export default async function ProjectsPage() {
  const session = await requireSession();
  const projects = await db.project.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Projects & Safety Files</h1>
        <p className="text-sm text-ink-500">
          One site-specific safety file per project, generated from a 2-minute brief and human-reviewed before delivery.
        </p>
      </div>

      <ProjectForm />

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.length === 0 && (
          <p className="card text-center text-sm text-ink-400 sm:col-span-2">
            No projects yet. Add the project you&apos;re mobilising for and generate its safety file.
          </p>
        )}
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="card transition hover:border-brand-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <h2 className="font-bold">{p.name}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_STYLES[p.riskClass]}`}>
                {p.riskClass} risk
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-500">{p.client}</p>
            <p className="mt-2 line-clamp-2 text-xs text-ink-400">{p.scope}</p>
            <p className="mt-3 text-xs font-semibold">
              {p.safetyFile ? (
                <span className="text-green-600">✓ Safety file generated {p.safetyFileAt?.toLocaleDateString("en-ZA")}</span>
              ) : (
                <span className="text-amber-600">⚠ No safety file yet — generate one</span>
              )}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
