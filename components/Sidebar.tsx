"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/documents", label: "Document Vault", icon: "🗂️" },
  { href: "/employees", label: "Staff Records", icon: "👷" },
  { href: "/projects", label: "Projects & Safety Files", icon: "🦺" },
  { href: "/tenders", label: "Tender Analyzer", icon: "📑" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const PLAN_LABELS: Record<string, string> = {
  TRIAL: "Free trial",
  COMPLIANT: "Compliant — R690/m",
  TENDER_READY: "Tender-Ready — R1,450/m",
  PRO: "Pro — R2,950/m",
};

export function Sidebar({
  userName,
  companyName,
  plan,
}: {
  userName: string;
  companyName: string;
  plan: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink-100 bg-white">
      <div className="border-b border-ink-100 px-5 py-5">
        <Link href="/dashboard" className="text-lg font-extrabold">
          Tender<span className="text-brand-600">Fit</span>
        </Link>
        <p className="mt-1 truncate text-sm font-semibold text-ink-700">{companyName}</p>
        <p className="text-xs text-ink-400">{PLAN_LABELS[plan] ?? plan}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink-100 px-5 py-4">
        <p className="truncate text-sm font-medium text-ink-700">{userName}</p>
        <button onClick={logout} className="mt-1 text-xs font-semibold text-ink-400 hover:text-red-600">
          Log out
        </button>
      </div>
    </aside>
  );
}
