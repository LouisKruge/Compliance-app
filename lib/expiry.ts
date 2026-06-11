export type ExpiryStatus = "valid" | "expiring" | "expired" | "missing";

const DAY_MS = 24 * 60 * 60 * 1000;

export const EXPIRING_WINDOW_DAYS = 60;

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / DAY_MS);
}

export function expiryStatus(expiryDate: Date | string | null | undefined): ExpiryStatus {
  const days = daysUntil(expiryDate);
  if (days === null) return "missing";
  if (days < 0) return "expired";
  if (days <= EXPIRING_WINDOW_DAYS) return "expiring";
  return "valid";
}

/** Status of a document that exists: no expiry date means it doesn't lapse (e.g. CIPC cert). */
export function documentStatus(expiryDate: Date | string | null | undefined): ExpiryStatus {
  return expiryDate == null ? "valid" : expiryStatus(expiryDate);
}

/** The standard set of documents every tendering contractor needs. */
export const REQUIRED_DOC_TYPES: { type: string; label: string }[] = [
  { type: "tax_pin", label: "SARS Tax Clearance PIN" },
  { type: "coida_letter", label: "COIDA Letter of Good Standing" },
  { type: "cidb_cert", label: "CIDB Registration Certificate" },
  { type: "bbbee_affidavit", label: "B-BBEE Affidavit / Certificate" },
  { type: "cipc_cert", label: "CIPC Registration Certificate" },
  { type: "csd_report", label: "CSD Registration Report" },
  { type: "insurance", label: "Public Liability Insurance" },
];

export const DOC_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(REQUIRED_DOC_TYPES.map((d) => [d.type, d.label])),
  nhbrc: "NHBRC Registration",
  letter_of_authority: "Letter of Good Standing / Authority",
  other: "Other",
};

export function docTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] ?? type;
}

/**
 * Compliance health score 0–100:
 * each required doc type contributes equally; valid = full credit,
 * expiring = half credit, expired/missing = none.
 */
export function complianceScore(
  documents: { type: string; expiryDate: Date | null }[]
): { score: number; gaps: { type: string; label: string; status: ExpiryStatus }[] } {
  let earned = 0;
  const gaps: { type: string; label: string; status: ExpiryStatus }[] = [];
  for (const req of REQUIRED_DOC_TYPES) {
    const docs = documents.filter((d) => d.type === req.type);
    if (docs.length === 0) {
      gaps.push({ ...req, status: "missing" });
      continue;
    }
    // best document of that type counts
    const statuses = docs.map((d) => documentStatus(d.expiryDate));
    if (statuses.includes("valid")) earned += 1;
    else if (statuses.includes("expiring")) {
      earned += 0.5;
      gaps.push({ ...req, status: "expiring" });
    } else gaps.push({ ...req, status: "expired" });
  }
  return {
    score: Math.round((earned / REQUIRED_DOC_TYPES.length) * 100),
    gaps,
  };
}
