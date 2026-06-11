"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateSafetyFileButton({
  projectId,
  hasFile,
}: {
  projectId: string;
  hasFile: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/safety-file`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Generation failed — try again");
    }
  }

  return (
    <div>
      <button className="btn-primary" onClick={generate} disabled={busy}>
        {busy ? "Generating… (this can take a minute)" : hasFile ? "Regenerate safety file" : "🦺 Generate safety file"}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
