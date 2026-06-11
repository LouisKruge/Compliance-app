/* Seeds a demo company so the app is explorable immediately.
   Login: demo@tenderfit.co.za / demo1234 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * DAY);

async function main() {
  const existing = await db.user.findUnique({ where: { email: "demo@tenderfit.co.za" } });
  if (existing) {
    console.log("Demo data already seeded — skipping.");
    return;
  }

  const company = await db.company.create({
    data: {
      name: "Mokoena Construction (Pty) Ltd",
      regNo: "2019/123456/07",
      cidbGrade: 2,
      cidbClass: "GB",
      csdNumber: "MAAA0123456",
      province: "Gauteng",
      plan: "TENDER_READY",
      profile:
        "Mokoena Construction is a Grade 2GB contractor established in 2019, specialising in renovations and small building works for municipal and provincial clients across Gauteng. Completed 14 public-sector projects including clinic renovations and school maintenance.",
    },
  });

  await db.user.create({
    data: {
      email: "demo@tenderfit.co.za",
      passwordHash: await bcrypt.hash("demo1234", 10),
      name: "Thabo Mokoena",
      role: "OWNER",
      companyId: company.id,
    },
  });

  await db.document.createMany({
    data: [
      { companyId: company.id, type: "tax_pin", title: "SARS Tax Clearance PIN 2026", issueDate: inDays(-200), expiryDate: inDays(165), verified: true },
      { companyId: company.id, type: "coida_letter", title: "COIDA Letter of Good Standing", issueDate: inDays(-340), expiryDate: inDays(25), verified: true },
      { companyId: company.id, type: "cidb_cert", title: "CIDB Registration — Grade 2GB", issueDate: inDays(-700), expiryDate: inDays(395), verified: true },
      { companyId: company.id, type: "bbbee_affidavit", title: "B-BBEE Level 1 Affidavit", issueDate: inDays(-380), expiryDate: inDays(-15), verified: true },
      { companyId: company.id, type: "cipc_cert", title: "CIPC Registration Certificate", issueDate: inDays(-2500), verified: true },
      { companyId: company.id, type: "insurance", title: "Public Liability — R5m cover", issueDate: inDays(-100), expiryDate: inDays(265), verified: true },
    ],
  });

  const sipho = await db.employee.create({
    data: { companyId: company.id, name: "Sipho Dlamini", jobTitle: "Site Supervisor", idNumber: "8501015800087" },
  });
  await db.employeeRecord.createMany({
    data: [
      { employeeId: sipho.id, type: "medical", title: "Annual occupational medical", issueDate: inDays(-330), expiryDate: inDays(35) },
      { employeeId: sipho.id, type: "competency", title: "Working at heights certificate", issueDate: inDays(-400), expiryDate: inDays(330) },
    ],
  });
  const lerato = await db.employee.create({
    data: { companyId: company.id, name: "Lerato Nkosi", jobTitle: "General Worker" },
  });
  await db.employeeRecord.create({
    data: { employeeId: lerato.id, type: "induction", title: "Site induction — Soweto Clinic", issueDate: inDays(-20) },
  });

  await db.project.create({
    data: {
      companyId: company.id,
      name: "Soweto Clinic Renovation — Phase 2",
      client: "City of Johannesburg",
      siteAddress: "1234 Vilakazi Street, Orlando West, Soweto",
      scope: "Internal renovations including drywall partitioning, electrical reticulation, plumbing upgrades and painting of the outpatient wing.",
      trades: "electrical, plumbing, painting, carpentry",
      riskClass: "MEDIUM",
      startDate: inDays(14),
      durationWeeks: 12,
      staffCount: 8,
    },
  });

  await db.job.createMany({
    data: [
      { companyId: company.id, type: "renewal", title: "Renew COIDA Letter of Good Standing", status: "OPEN", dueDate: inDays(20), notes: "Expires in 25 days — submit ROE first." },
      { companyId: company.id, type: "renewal", title: "Replace expired B-BBEE affidavit", status: "IN_PROGRESS", notes: "Sworn affidavit at commissioner of oaths — book slot." },
    ],
  });

  await db.auditEvent.create({
    data: { companyId: company.id, action: "company.registered", detail: company.name },
  });

  console.log("Seeded demo company:", company.name);
  console.log("Login: demo@tenderfit.co.za / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
