# TenderFit — Compliance & Tender-Readiness Platform

**Never lose a tender or get turned away from site because of paperwork.**

TenderFit is an AI-powered compliance platform for South African construction SMEs (CIDB Grades 1–5). It keeps every compliance document valid, generates site-specific safety files and tender readiness reports, and warns contractors before anything expires.

## Features

- **Compliance Vault** — store every certificate (SARS tax pin, COIDA letter, CIDB cert, B-BBEE affidavit, CIPC, CSD, insurances) with expiry tracking and secure file upload.
- **Expiry Radar** — dashboard alerts for anything expiring within 60 days, plus a compliance health score across the 7 documents every tendering contractor needs.
- **AI Safety File Generator** — a short project brief produces a complete, site-specific H&S file built on the OHS Act 85 of 1993 / Construction Regulations 2014 skeleton. Every file is queued for human QA review before delivery (SOP-02).
- **Tender Analyzer** — paste a tender document; the analyzer extracts the returnables checklist, CIDB grade, closing date and briefing requirements, then cross-checks against the vault: *"you're missing these 3 items."*
- **Staff Records** — medicals, inductions and competency certificates per employee, all on the expiry radar.
- **Jobs queue & audit log** — QA reviews and renewals tracked per company; every action audited.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Next.js API routes, Zod validation, JWT sessions (httpOnly cookies, bcrypt) |
| Database | Prisma ORM + SQLite (dev) — switch the provider to PostgreSQL for production |
| AI | Anthropic Claude API with a deterministic regulation-skeleton fallback when no key is set |

## Getting started

```bash
npm install
cp .env.example .env        # set AUTH_SECRET; optionally ANTHROPIC_API_KEY
npm run setup               # prisma generate + db push + seed demo data
npm run dev                 # http://localhost:3000
```

**Demo login:** `demo@tenderfit.co.za` / `demo1234` — a seeded Grade 2GB contractor with documents in every expiry state, staff records, an active project and open renewal jobs.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite; a Postgres URL in production |
| `AUTH_SECRET` | yes (prod) | Signs session JWTs |
| `ANTHROPIC_API_KEY` | no | Enables real AI generation/analysis; without it the built-in template engine and rule-based analyzer run |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-4-6` |

## Architecture notes

- **AI quality rule:** the AI fills project-specific content into a *verified regulatory skeleton* (section list and citations are hard-coded from the Construction Regulations 2014) — it never invents regulation references. Generated files are marked for human QA via the jobs queue.
- **Multi-tenancy:** every record is scoped to a `Company`; all API routes verify ownership before any read/write.
- **POPIA scope:** uploaded files are stored outside the web root and served only through an authenticated, ownership-checked endpoint; employee ID numbers are displayed truncated.
- **Production path:** swap SQLite → Postgres (one line in `prisma/schema.prisma`), move `uploads/` to S3-compatible storage, put Paystack/PayFast behind the plan selector in Settings, and wire the expiry radar to the WhatsApp Business API.

## Disclaimer

TenderFit prepares and manages compliance documents; it is not a substitute for SACPCMP-registered professional sign-off where regulations require it. This repository is a product implementation, not legal advice.
