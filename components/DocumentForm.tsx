"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DOC_TYPES = [
  ["tax_pin", "SARS Tax Clearance PIN"],
  ["coida_letter", "COIDA Letter of Good Standing"],
  ["cidb_cert", "CIDB Registration Certificate"],
  ["bbbee_affidavit", "B-BBEE Affidavit / Certificate"],
  ["cipc_cert", "CIPC Registration Certificate"],
  ["csd_report", "CSD Registration Report"],
  ["insurance", "Public Liability Insurance"],
  ["nhbrc", "NHBRC Registration"],
  ["letter_of_authority", "Letter of Good Standing / Authority"],
  ["other", "Other"],
];

export function DocumentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    setBusy(false);
    if (res.ok) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add document");
    }
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Add document
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-bold">Add a document</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="doc-title">Title</label>
          <input className="input" id="doc-title" name="title" placeholder="e.g. Tax Clearance PIN 2026" required />
        </div>
        <div>
          <label className="label" htmlFor="doc-type">Type</label>
          <select className="input" id="doc-type" name="type">
            {DOC_TYPES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="doc-issue">Issue date</label>
          <input className="input" id="doc-issue" name="issueDate" type="date" />
        </div>
        <div>
          <label className="label" htmlFor="doc-expiry">Expiry date</label>
          <input className="input" id="doc-expiry" name="expiryDate" type="date" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="doc-file">File (PDF/image, optional)</label>
          <input className="input" id="doc-file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save document"}</button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
