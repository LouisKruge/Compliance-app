import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { GenerateSafetyFileButton } from "@/components/GenerateSafetyFileButton";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const project = await db.project.findUnique({ where: { id: params.id } });
  if (!project || project.companyId !== session.companyId) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/projects" className="text-sm font-semibold text-brand-600 hover:underline">
        ← All projects
      </Link>

      <div className="card">
        <h1 className="text-2xl font-extrabold">{project.name}</h1>
        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="label inline">Client:</dt> <dd className="inline">{project.client}</dd></div>
          <div><dt className="label inline">Risk class:</dt> <dd className="inline">{project.riskClass}</dd></div>
          <div className="sm:col-span-2"><dt className="label inline">Site:</dt> <dd className="inline">{project.siteAddress || "—"}</dd></div>
          <div className="sm:col-span-2"><dt className="label inline">Scope:</dt> <dd className="inline">{project.scope}</dd></div>
          <div className="sm:col-span-2"><dt className="label inline">Trades:</dt> <dd className="inline">{project.trades || "—"}</dd></div>
        </dl>
        <div className="mt-5">
          <GenerateSafetyFileButton projectId={project.id} hasFile={!!project.safetyFile} />
        </div>
      </div>

      {project.safetyFile && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
            <div>
              <h2 className="font-bold">Safety file (draft for QA review)</h2>
              <p className="text-xs text-ink-400">
                Generated {project.safetyFileAt?.toLocaleString("en-ZA")} ·{" "}
                {project.safetyFileBy === "ai" ? "AI-drafted" : "template engine"} · human review
                required before delivery (SOP-02)
              </p>
            </div>
          </div>
          <Markdown content={project.safetyFile} />
        </div>
      )}
    </div>
  );
}
