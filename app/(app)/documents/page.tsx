import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysUntil, documentStatus, docTypeLabel } from "@/lib/expiry";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentForm } from "@/components/DocumentForm";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await requireSession();
  const documents = await db.document.findMany({
    where: { companyId: session.companyId },
    orderBy: [{ expiryDate: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Document Vault</h1>
        <p className="text-sm text-ink-500">
          Every compliance document with its expiry date — the expiry radar watches these for you.
        </p>
      </div>

      <DocumentForm />

      <section className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left">
              <th className="px-5 py-3 font-semibold">Document</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Expiry</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">File</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-400">
                  Your vault is empty. Add your first document above — start with your SARS tax pin and COIDA letter.
                </td>
              </tr>
            )}
            {documents.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-3 font-medium">{d.title}</td>
                <td className="px-5 py-3 text-ink-500">{docTypeLabel(d.type)}</td>
                <td className="px-5 py-3 text-ink-500">
                  {d.expiryDate ? d.expiryDate.toLocaleDateString("en-ZA") : "—"}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={documentStatus(d.expiryDate)} days={daysUntil(d.expiryDate)} />
                </td>
                <td className="px-5 py-3">
                  {d.filePath ? (
                    <a
                      href={`/api/documents/${d.id}/file`}
                      target="_blank"
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <DeleteButton url={`/api/documents/${d.id}`} label="document" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
