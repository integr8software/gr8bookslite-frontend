"use client";

import { Building2, Globe, Phone } from "lucide-react";
import { getCompanyProfileData } from "@/app/src/services/modules/companies/ErpCompaniesService";

export function CompanyProfilePage({ companySlug }: { companySlug: string }) {
  const { company, activity } = getCompanyProfileData(companySlug);

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        Companies <span className="mx-2 text-slate-300">â€º</span> {company.name}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <span className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-blue-50 text-3xl font-semibold text-blue-700">
              {company.code}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                  {company.name}
                </h1>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                  {company.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {company.industry}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {company.website}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              Edit Company
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              More
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-8 border-b border-slate-200 text-sm font-medium text-slate-500">
          {["Overview", "Branches & Sites", "Modules", "Users", "Settings", "Billing"].map((tab, index) => (
            <button
              key={tab}
              className={joinClasses(
                "border-b-2 pb-4 transition",
                index === 0 ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.6fr)_minmax(320px,0.8fr)]">
          <div className="rounded-[1.75rem] border border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Company Information</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <InfoField label="Company Name" value={company.name} />
              <InfoField label="Currency" value="USD - US Dollar" />
              <InfoField label="Company Code" value="GC001" />
              <InfoField label="Fiscal Year" value="January - December" />
              <InfoField label="Industry" value={company.industry} />
              <InfoField label="Tax ID" value="12-3456789" />
              <InfoField label="Email" value={company.email} />
              <InfoField label="Address" value={company.address} />
              <InfoField label="Phone" value={company.phone} />
              <InfoField label="Status" value={company.status} />
              <InfoField label="Website" value={company.website} />
              <InfoField label="Created On" value="May 10, 2024 by John D." />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Quick Summary</h2>
            <div className="mt-5 space-y-4">
              <SummaryItem label="Branches" value={String(company.branchCount)} />
              <SummaryItem label="Users" value={String(company.userCount)} />
              <SummaryItem label="Active Modules" value={String(company.activeModules)} />
              <SummaryItem label="Satellite Offices" value={String(company.satelliteOffices)} />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              <button className="text-sm font-semibold text-blue-600">View all</button>
            </div>
            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

