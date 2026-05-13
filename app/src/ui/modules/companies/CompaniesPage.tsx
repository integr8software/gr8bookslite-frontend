"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { erpCompanies } from "@/app/src/data/modules/companies/ErpCompaniesData";

export function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Companies
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Browse the companies connected to your ERP workspace and open each one
          for branch, users, module, and billing context.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {erpCompanies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-semibold text-blue-700">
                {company.code}
              </span>
              <span className={joinClasses(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                company.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
              )}>
                {company.status}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
              {company.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{company.industry}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Branches" value={String(company.branchCount)} />
              <Metric label="Users" value={String(company.userCount)} />
              <Metric label="Modules" value={String(company.activeModules)} />
              <Metric label="Net Profit" value={company.netProfit} />
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              <span>Open company profile</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

