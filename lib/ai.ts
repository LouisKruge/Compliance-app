import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export type ProjectBrief = {
  companyName: string;
  cidbGrade: number;
  projectName: string;
  client: string;
  siteAddress?: string | null;
  scope: string;
  trades?: string | null;
  riskClass: string;
  staffCount?: number | null;
  durationWeeks?: number | null;
};

/* ------------------------------------------------------------------ */
/* Safety file generation                                              */
/* ------------------------------------------------------------------ */

/**
 * The verified regulatory skeleton. The AI fills project-specific content
 * into this structure — it never invents the structure or the citations.
 * Section list follows the Construction Regulations, 2014 (OHS Act 85 of 1993).
 */
const SAFETY_FILE_SECTIONS = [
  "Cover Page & Document Index",
  "Health & Safety Policy (signed by CEO — OHS Act s7)",
  "Notification of Construction Work (CR 4 — where applicable)",
  "Health & Safety Plan (CR 7(1)(a))",
  "Baseline Risk Assessment (CR 9)",
  "Legal Appointments (CR 8: Construction Manager, Construction Supervisor; HCS/First Aider/Fire as applicable)",
  "Fall Protection Plan (CR 10 — where work at height)",
  "Method Statements for listed activities",
  "Toolbox Talk Schedule & Registers",
  "Incident Reporting Procedure (GAR 8 / COIDA)",
  "PPE Issue Register",
  "Emergency Preparedness Plan & Contact List",
  "Employee Medicals, Inductions & Competency Records",
  "Subcontractor Management (CR 7(1)(c)(v))",
];

export async function generateSafetyFile(
  brief: ProjectBrief
): Promise<{ content: string; generatedBy: "ai" | "fallback" }> {
  const anthropic = client();
  if (anthropic) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: [
          "You are TenderFit's safety-file drafting engine for South African construction SMEs.",
          "You draft site-specific Health & Safety file content under the OHS Act 85 of 1993 and Construction Regulations 2014.",
          "RULES: Never invent regulation numbers or citations beyond those given in the section skeleton.",
          "Mark anything requiring a signature or professional sign-off with [SIGNATURE REQUIRED].",
          "Mark anything you cannot determine from the brief with [CONFIRM WITH CLIENT].",
          "Output clean markdown. Every document is reviewed by a human before delivery.",
        ].join(" "),
        messages: [
          {
            role: "user",
            content: `Draft the full site-specific H&S file content using exactly this section skeleton:\n${SAFETY_FILE_SECTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nProject brief:\n${JSON.stringify(brief, null, 2)}\n\nTailor every section to the scope, trades and risk class. Include a populated baseline risk assessment table with hazards specific to the stated trades.`,
          },
        ],
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      if (text.trim()) return { content: text, generatedBy: "ai" };
    } catch (err) {
      console.error("Anthropic API failed, using fallback skeleton:", err);
    }
  }
  return { content: fallbackSafetyFile(brief), generatedBy: "fallback" };
}

function fallbackSafetyFile(b: ProjectBrief): string {
  const trades = (b.trades || "general building works")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const hazardRows = trades
    .map(
      (t) =>
        `| ${t} | Site-specific hazards for ${t.toLowerCase()} [CONFIRM WITH CLIENT] | Medium | Safe work procedure, competent supervision, PPE | Construction Supervisor |`
    )
    .join("\n");

  return `# Health & Safety File — ${b.projectName}

**Contractor:** ${b.companyName} (CIDB Grade ${b.cidbGrade})
**Client:** ${b.client}
**Site:** ${b.siteAddress || "[CONFIRM WITH CLIENT]"}
**Scope of work:** ${b.scope}
**Risk class:** ${b.riskClass} · **Staff on site:** ${b.staffCount ?? "[CONFIRM]"} · **Duration:** ${b.durationWeeks ?? "[CONFIRM]"} weeks

> Compiled under the Occupational Health and Safety Act 85 of 1993 and the Construction Regulations, 2014. This file requires human review and signature before submission. [SIGNATURE REQUIRED]

${SAFETY_FILE_SECTIONS.map((s, i) => `## ${i + 1}. ${s}`).join(
  "\n\nContent to be completed against the TenderFit QA rubric for this section.\n\n"
)}

## Baseline Risk Assessment (CR 9) — populated draft

| Activity | Hazard | Risk rating | Controls | Responsible |
|---|---|---|---|---|
${hazardRows}
| All site work | Slips, trips, falls on same level | Medium | Housekeeping standard, demarcated walkways, toolbox talks | Construction Supervisor |
| All site work | Struck by moving plant/vehicles | High | Traffic management plan, spotters, hi-vis PPE | Construction Manager |

## Legal Appointments (CR 8)

| Appointment | Regulation | Name | Signature |
|---|---|---|---|
| Construction Manager | CR 8(1) | [CONFIRM] | [SIGNATURE REQUIRED] |
| Construction Supervisor | CR 8(7) | [CONFIRM] | [SIGNATURE REQUIRED] |
| First Aider | GSR 3 | [CONFIRM] | [SIGNATURE REQUIRED] |

---
*Generated by TenderFit (template engine — no AI key configured). Every file passes human QA before delivery.*`;
}

/* ------------------------------------------------------------------ */
/* Tender analysis                                                     */
/* ------------------------------------------------------------------ */

export type TenderAnalysis = {
  returnables: string[];
  cidbGradeRequired: number | null;
  closingDate: string | null;
  briefingRequired: boolean;
  functionalityCriteria: string[];
  summary: string;
};

const COMMON_RETURNABLES = [
  { key: /tax\s*(clearance|compliance|pin)/i, label: "SARS Tax Clearance PIN", docType: "tax_pin" },
  { key: /(letter\s*of\s*good\s*standing|coida|compensation\s*fund)/i, label: "COIDA Letter of Good Standing", docType: "coida_letter" },
  { key: /cidb/i, label: "CIDB Registration Certificate", docType: "cidb_cert" },
  { key: /b[\s-]*bbee|bee\s*(certificate|affidavit)/i, label: "B-BBEE Affidavit / Certificate", docType: "bbbee_affidavit" },
  { key: /(cipc|company\s*registration|ck\s*document)/i, label: "CIPC Registration Certificate", docType: "cipc_cert" },
  { key: /(csd|central\s*supplier\s*database)/i, label: "CSD Registration Report", docType: "csd_report" },
  { key: /(public\s*liability|insurance)/i, label: "Public Liability Insurance", docType: "insurance" },
  { key: /(health\s*and\s*safety|h\s*&\s*s|safety\s*(plan|file))/i, label: "Health & Safety Plan / File", docType: "other" },
  { key: /sbd\s*4/i, label: "SBD 4 — Declaration of Interest", docType: "other" },
  { key: /sbd\s*6/i, label: "SBD 6.1 — Preference Points Claim", docType: "other" },
  { key: /sbd\s*1\b/i, label: "SBD 1 — Invitation to Bid", docType: "other" },
  { key: /(joint\s*venture|jv\s*agreement)/i, label: "Joint Venture Agreement (if applicable)", docType: "other" },
  { key: /(bank\s*rating|financial\s*statement|audited)/i, label: "Financial Statements / Bank Rating", docType: "other" },
  { key: /(method\s*statement|methodology)/i, label: "Method Statement / Methodology", docType: "other" },
  { key: /(site\s*visit|briefing)/i, label: "Proof of Site Briefing Attendance", docType: "other" },
];

export const RETURNABLE_DOC_MAP = COMMON_RETURNABLES;

export async function analyzeTender(rawText: string): Promise<TenderAnalysis> {
  const anthropic = client();
  if (anthropic) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system:
          "You analyze South African public tender documents for construction SMEs. Extract facts only — never guess. Respond with strict JSON matching: {returnables: string[], cidbGradeRequired: number|null, closingDate: string|null (ISO), briefingRequired: boolean, functionalityCriteria: string[], summary: string}. If a field is not stated in the document, use null / [] / false.",
        messages: [
          {
            role: "user",
            content: `Extract the returnables checklist and key facts from this tender document:\n\n${rawText.slice(0, 150000)}`,
          },
        ],
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      if (json) return JSON.parse(json) as TenderAnalysis;
    } catch (err) {
      console.error("Anthropic API failed, using rule-based analyzer:", err);
    }
  }
  return ruleBasedAnalysis(rawText);
}

function ruleBasedAnalysis(text: string): TenderAnalysis {
  const returnables = COMMON_RETURNABLES.filter((r) => r.key.test(text)).map((r) => r.label);

  const gradeMatch = text.match(/(?:cidb\s*)?grad(?:e|ing)\s*(?:of\s*)?(\d)\s*(?:gb|ce|me|ep|sb)?/i);
  const cidbGradeRequired = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

  const dateMatch = text.match(
    /clos(?:ing|es?)[^.\n]*?(\d{1,2}[\s\/\-](?:\d{1,2}|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)[\s\/\-]\d{2,4})/i
  );
  let closingDate: string | null = null;
  if (dateMatch) {
    const parsed = new Date(dateMatch[1].replace(/[\/\-]/g, " "));
    if (!isNaN(parsed.getTime())) closingDate = parsed.toISOString();
  }

  const briefingRequired = /compulsory\s*(site\s*)?(briefing|meeting|visit)/i.test(text);

  const functionalityCriteria: string[] = [];
  if (/functionality/i.test(text)) functionalityCriteria.push("Functionality scoring applies — check minimum threshold in tender document");
  if (/experience/i.test(text)) functionalityCriteria.push("Relevant experience / track record");
  if (/key\s*personnel|cv/i.test(text)) functionalityCriteria.push("Key personnel CVs");

  return {
    returnables,
    cidbGradeRequired,
    closingDate,
    briefingRequired,
    functionalityCriteria,
    summary: `Rule-based extraction found ${returnables.length} returnable document requirements${cidbGradeRequired ? `, CIDB Grade ${cidbGradeRequired} required` : ""}${briefingRequired ? ", with a compulsory briefing" : ""}. Configure an Anthropic API key for full AI analysis of functionality criteria and special conditions.`,
  };
}
