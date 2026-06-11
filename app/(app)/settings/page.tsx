import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const company = await db.company.findUnique({ where: { id: session.companyId } });
  if (!company) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Company Settings</h1>
        <p className="text-sm text-ink-500">
          This data feeds your tender packs and safety files — keep it accurate.
        </p>
      </div>
      <SettingsForm
        company={{
          name: company.name,
          regNo: company.regNo ?? "",
          cidbGrade: company.cidbGrade,
          cidbClass: company.cidbClass,
          csdNumber: company.csdNumber ?? "",
          province: company.province,
          plan: company.plan,
          profile: company.profile ?? "",
        }}
        readOnly={session.role === "STAFF"}
      />
    </div>
  );
}
