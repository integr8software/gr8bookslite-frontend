"use client";

import Link from "next/link";
import type { getWorkspaceDashboardData } from "@/app/src/services/modules/dashboard/ErpDashboardService";

type DashboardCompany = ReturnType<typeof getWorkspaceDashboardData>["companies"][number];

export function WorkspaceCompaniesPanel({
  companies,
}: {
  companies: readonly DashboardCompany[];
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Search company...
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">All Companies</p>
      <div className="mt-3 space-y-2">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
              {company.code}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">
                {company.name}
              </span>
            </span>
            <DashboardStatusBadge status={company.status} compact />
          </Link>
        ))}
      </div>
      <button className="mt-4 text-sm font-semibold text-blue-600">
        + Add Company
      </button>
    </div>
  );
}

function DashboardStatusBadge({
  status,
  compact = false,
}: {
  status: DashboardCompany["status"];
  compact?: boolean;
}) {
  return (
    <span
      className={joinClasses(
        compact
          ? "rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
          : "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Active"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {status}
    </span>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
