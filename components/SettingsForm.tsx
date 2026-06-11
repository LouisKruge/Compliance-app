"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape",
];

const PLANS = [
  ["TRIAL", "Free trial"],
  ["COMPLIANT", "Compliant — R690/m"],
  ["TENDER_READY", "Tender-Ready — R1,450/m"],
  ["PRO", "Pro — R2,950/m"],
];

type CompanyData = {
  name: string;
  regNo: string;
  cidbGrade: number;
  cidbClass: string;
  csdNumber: string;
  province: string;
  plan: string;
  profile: string;
};

export function SettingsForm({ company, readOnly }: { company: CompanyData; readOnly: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <fieldset disabled={readOnly} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="set-name">Company name</label>
            <input className="input" id="set-name" name="name" defaultValue={company.name} required />
          </div>
          <div>
            <label className="label" htmlFor="set-reg">CIPC registration no</label>
            <input className="input" id="set-reg" name="regNo" defaultValue={company.regNo} placeholder="e.g. 2019/123456/07" />
          </div>
          <div>
            <label className="label" htmlFor="set-grade">CIDB grade</label>
            <select className="input" id="set-grade" name="cidbGrade" defaultValue={company.cidbGrade}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="set-class">CIDB class of works</label>
            <select className="input" id="set-class" name="cidbClass" defaultValue={company.cidbClass}>
              <option value="GB">GB — General Building</option>
              <option value="CE">CE — Civil Engineering</option>
              <option value="ME">ME — Mechanical Engineering</option>
              <option value="EP">EP — Electrical (Infrastructure)</option>
              <option value="EB">EB — Electrical (Buildings)</option>
              <option value="SB">SB — Specialist</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="set-csd">CSD supplier number</label>
            <input className="input" id="set-csd" name="csdNumber" defaultValue={company.csdNumber} placeholder="MAAA…" />
          </div>
          <div>
            <label className="label" htmlFor="set-prov">Province</label>
            <select className="input" id="set-prov" name="province" defaultValue={company.province}>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="set-plan">Plan</label>
            <select className="input" id="set-plan" name="plan" defaultValue={company.plan}>
              {PLANS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <p className="mt-1 text-xs text-ink-400">
              Billing integration (Paystack/PayFast) is connected at go-live; plan selection here drives feature limits.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="set-profile">Company profile (used in AI tender narratives)</label>
            <textarea className="input" id="set-profile" name="profile" rows={4} defaultValue={company.profile}
              placeholder="Years in business, notable completed projects, key staff and qualifications…" />
          </div>
        </div>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {saved && <p className="text-sm font-medium text-green-600">Saved ✓</p>}
        {!readOnly && <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>}
      </fieldset>
      {readOnly && <p className="text-sm text-ink-400">Staff accounts have read-only access to settings.</p>}
    </form>
  );
}
