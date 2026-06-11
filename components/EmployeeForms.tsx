"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function EmployeeForm() {
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
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setBusy(false);
    if (res.ok) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add employee");
    }
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>+ Add employee</button>;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-bold">Add an employee</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="emp-name">Full name</label>
          <input className="input" id="emp-name" name="name" required />
        </div>
        <div>
          <label className="label" htmlFor="emp-title">Job title</label>
          <input className="input" id="emp-title" name="jobTitle" placeholder="e.g. Site Supervisor" />
        </div>
        <div>
          <label className="label" htmlFor="emp-id">ID number (optional)</label>
          <input className="input" id="emp-id" name="idNumber" />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

export function RecordForm({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/employees/${employeeId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setBusy(false);
    if (res.ok) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button className="mt-3 text-xs font-semibold text-brand-600 hover:underline" onClick={() => setOpen(true)}>
        + Add medical / induction / competency
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-lg bg-ink-50 p-4 sm:grid-cols-4">
      <select className="input" name="type" aria-label="Record type">
        <option value="medical">Medical</option>
        <option value="induction">Induction</option>
        <option value="competency">Competency</option>
      </select>
      <input className="input" name="title" placeholder="e.g. Annual medical 2026" required aria-label="Record title" />
      <input className="input" name="expiryDate" type="date" aria-label="Expiry date" />
      <div className="flex gap-2">
        <button className="btn-primary px-3 py-1 text-xs" disabled={busy}>{busy ? "…" : "Add"}</button>
        <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
