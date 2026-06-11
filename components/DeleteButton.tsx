"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ url, label }: { url: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(url, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={onDelete} disabled={busy} className="text-xs font-semibold text-ink-400 hover:text-red-600">
      {busy ? "…" : "Delete"}
    </button>
  );
}
