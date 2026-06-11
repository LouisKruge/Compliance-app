"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ProjectForm() {
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
    const body = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ""));
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create project");
    }
  }

  if (!open) return <button className="btn-primary" onClick={() => setOpen(true)}>+ New project</button>;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-bold">New project brief</h2>
      <p className="text-xs text-ink-400">This brief drives the AI safety-file generation — be specific about scope and trades.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="prj-name">Project name</label>
          <input className="input" id="prj-name" name="name" placeholder="e.g. Soweto Clinic Renovation" required />
        </div>
        <div>
          <label className="label" htmlFor="prj-client">Client / principal contractor</label>
          <input className="input" id="prj-client" name="client" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="prj-site">Site address</label>
          <input className="input" id="prj-site" name="siteAddress" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="prj-scope">Scope of work</label>
          <textarea className="input" id="prj-scope" name="scope" rows={3} placeholder="e.g. Internal renovations including partitioning, electrical reticulation, plumbing and painting" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="prj-trades">Trades on site (comma-separated)</label>
          <input className="input" id="prj-trades" name="trades" placeholder="e.g. electrical, plumbing, painting, carpentry" />
        </div>
        <div>
          <label className="label" htmlFor="prj-risk">Risk class</label>
          <select className="input" id="prj-risk" name="riskClass" defaultValue="MEDIUM">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High (work at height, excavation, demolition…)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prj-start">Start date</label>
          <input className="input" id="prj-start" name="startDate" type="date" />
        </div>
        <div>
          <label className="label" htmlFor="prj-duration">Duration (weeks)</label>
          <input className="input" id="prj-duration" name="durationWeeks" type="number" min={1} />
        </div>
        <div>
          <label className="label" htmlFor="prj-staff">Staff on site</label>
          <input className="input" id="prj-staff" name="staffCount" type="number" min={1} />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Create project"}</button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
