"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TenderOutcomeSelect({ tenderId, outcome }: { tenderId: string; outcome: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setBusy(true);
    await fetch(`/api/tenders/${tenderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: e.target.value }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <select className="input w-auto" defaultValue={outcome} onChange={onChange} disabled={busy} aria-label="Tender outcome">
      <option value="OPEN">Open</option>
      <option value="SUBMITTED">Submitted</option>
      <option value="WON">Won 🎉</option>
      <option value="LOST">Lost</option>
    </select>
  );
}
