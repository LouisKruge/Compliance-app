import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const company = await db.company.findUnique({ where: { id: session.companyId } });
  if (!company) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.name} companyName={company.name} plan={company.plan} />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
