"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function TenderForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/tenders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setBusy(false);
    if (res.ok) {
      const { tender } = await res.json();
      formRef.current?.reset();
      setOpen(false);
      router.push(`/tenders/${tender.id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Analysis failed");
    }
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>+ Analyze a tender</button>;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-bold">Analyze a tender</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="tdr-no">Tender number</label>
          <input className="input" id="tdr-no" name="tenderNo" placeholder="e.g. CIDB/2026/041" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="tdr-title">Title</label>
          <input className="input" id="tdr-title" name="title" required />
        </div>
        <div>
          <label className="label" htmlFor="tdr-close">Closing date (if known)</label>
          <input className="input" id="tdr-close" name="closingDate" type="date" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="tdr-text">Tender document text</label>
        <textarea
          className="input font-mono text-xs"
          id="tdr-text"
          name="rawText"
          rows={10}
          placeholder="Paste the tender document here — at minimum the conditions, returnables and evaluation sections."
          required
        />
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>
          {busy ? "Analyzing… (this can take a minute)" : "Run analysis"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
