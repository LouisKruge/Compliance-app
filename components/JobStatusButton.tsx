"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NEXT: Record<string, { next: string; label: string }> = {
  OPEN: { next: "IN_PROGRESS", label: "Start" },
  IN_PROGRESS: { next: "DONE", label: "Mark done" },
};

export function JobStatusButton({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const action = NEXT[status];
  if (!action) return null;

  async function advance() {
    setBusy(true);
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action.next }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={advance} disabled={busy} className="btn-secondary shrink-0 px-3 py-1 text-xs">
      {busy ? "…" : action.label}
    </button>
  );
}
