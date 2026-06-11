import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const FEATURES = [
  {
    title: "Compliance Vault",
    body: "Every certificate, letter and affidavit in one POPIA-compliant vault — tax pin, COIDA, CIDB, B-BBEE, insurances and staff records.",
  },
  {
    title: "Expiry Radar",
    body: "Automated alerts at 60, 30, 14 and 7 days before anything lapses. Never get turned away from site or disqualified again.",
  },
  {
    title: "AI Safety Files",
    body: "Answer a short project questionnaire and get a complete, site-specific H&S file built on the Construction Regulations 2014 — human-reviewed, same day.",
  },
  {
    title: "Tender Analyzer",
    body: "Paste the tender document; we extract the returnables checklist and cross-check it against your vault: “you're missing these 3 items.”",
  },
];

const PLANS = [
  {
    name: "Compliant",
    price: "R690",
    blurb: "Vault + expiry radar + compliance calendar. Up to 10 staff records.",
  },
  {
    name: "Tender-Ready",
    price: "R1,450",
    blurb: "Everything in Compliant + 2 safety files per quarter + unlimited tender analyses.",
    featured: true,
  },
  {
    name: "Pro",
    price: "R2,950",
    blurb: "Everything + renewals concierge + priority turnaround + 25 staff records.",
  },
];

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main>
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-extrabold tracking-tight">
            Tender<span className="text-brand-600">Fit</span>
          </span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">Log in</Link>
            <Link href="/register" className="btn-primary">Start free</Link>
          </nav>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">
            For South African construction SMEs · CIDB Grades 1–5
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Never lose a tender or get turned away from site{" "}
            <span className="text-brand-600">because of paperwork.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500">
            TenderFit keeps every compliance document valid, generates your safety files and
            tender packs with AI, and warns you before anything expires — for less than one
            day of a consultant&apos;s time per month.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Get your free compliance audit
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-extrabold">Simple pricing</h2>
          <p className="mt-2 text-center text-ink-500">
            One missed tender costs more than three years of this.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`card flex flex-col ${p.featured ? "border-brand-500 ring-2 ring-brand-200" : ""}`}
              >
                <h3 className="font-bold">{p.name}</h3>
                <p className="mt-2 text-3xl font-extrabold">
                  {p.price}
                  <span className="text-sm font-medium text-ink-400">/month</span>
                </p>
                <p className="mt-3 flex-1 text-sm text-ink-500">{p.blurb}</p>
                <Link href="/register" className={`mt-5 ${p.featured ? "btn-primary" : "btn-secondary"}`}>
                  Start free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
        TenderFit · POPIA-compliant document vault · We prepare and manage compliance
        documents; SACPCMP-registered professional sign-off is arranged through our partner
        network where required.
      </footer>
    </main>
  );
}
