import { Check, Plus, Search } from "lucide-react";
import type { WorkspaceCompanyRecord } from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";

type WorkspaceOverviewCompaniesPanelProps = {
  companies: WorkspaceCompanyRecord[];
};

export function WorkspaceOverviewCompaniesPanel({
  companies,
}: WorkspaceOverviewCompaniesPanelProps) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-darknavy/10 bg-white shadow-[0_20px_60px_rgba(33,39,56,0.08)]">
      <div className="border-b border-darknavy/8 p-4">
        <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-darknavy/10 bg-offwhite px-4 text-sm text-darknavy/50">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            type="text"
            value=""
            readOnly
            aria-label="Search company"
            placeholder="Search company..."
            className="w-full bg-transparent text-darknavy outline-none placeholder:text-darknavy/42"
          />
        </label>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-darknavy/55">All Companies</p>
          <span className="rounded-full bg-darknavy/5 px-3 py-1 text-xs font-semibold text-darknavy/50">
            {companies.length}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        {companies.map((company) => (
          <button
            key={company.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${companyTone(company.tone)}`}
            >
              {company.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-darknavy">
                {company.name}
              </p>
            </div>
            <span className={statusTone(company.status)}>{company.status}</span>
            {company.status === "Active" ? (
              <Check className="h-4 w-4 shrink-0 text-skyblue" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="border-t border-darknavy/8 p-3">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-skyblue transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Company
        </button>
      </div>
    </article>
  );
}

function companyTone(tone: WorkspaceCompanyRecord["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-citron/30 text-darknavy";
    case "coral":
      return "bg-coralpink/18 text-coralpink";
    case "dark":
      return "bg-darknavy/8 text-darknavy/72";
    case "mint":
      return "bg-emerald-100 text-emerald-700";
    case "violet":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-skyblue/18 text-darknavy";
  }
}

function statusTone(status: WorkspaceCompanyRecord["status"]) {
  return status === "Active"
    ? "inline-flex min-h-7 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700"
    : "inline-flex min-h-7 items-center rounded-full bg-darknavy/7 px-3 text-xs font-semibold text-darknavy/48";
}
