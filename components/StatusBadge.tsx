import type { ExpiryStatus } from "@/lib/expiry";

const STYLES: Record<ExpiryStatus, string> = {
  valid: "bg-green-100 text-green-800",
  expiring: "bg-amber-100 text-amber-800",
  expired: "bg-red-100 text-red-800",
  missing: "bg-ink-100 text-ink-500",
};

const LABELS: Record<ExpiryStatus, string> = {
  valid: "Valid",
  expiring: "Expiring soon",
  expired: "Expired",
  missing: "Missing",
};

export function StatusBadge({ status, days }: { status: ExpiryStatus; days?: number | null }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
      {status === "expiring" && days != null && ` · ${days}d`}
      {status === "expired" && days != null && ` · ${Math.abs(days)}d ago`}
    </span>
  );
}
