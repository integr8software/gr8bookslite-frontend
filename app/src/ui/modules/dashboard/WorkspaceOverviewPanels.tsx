"use client";

import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";
import type { getWorkspaceDashboardData } from "@/app/src/services/modules/dashboard/ErpDashboardService";

type DashboardCompany = ReturnType<typeof getWorkspaceDashboardData>["companies"][number];
type ApprovalItem = ReturnType<typeof getWorkspaceDashboardData>["approvalQueue"][number];

const priorityClasses = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-blue-50 text-blue-600",
} as const;

export function WorkspacePerformanceTable({
  companies,
}: {
  companies: readonly DashboardCompany[];
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Company Performance Overview
        </h2>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <span>View all companies</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Company</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Revenue (This Month)</th>
              <th className="pb-3 font-medium">Expenses (This Month)</th>
              <th className="pb-3 font-medium">Net Profit</th>
              <th className="pb-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-slate-100">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                      {company.code}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {company.name}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <DashboardStatusBadge status={company.status} />
                </td>
                <td className="py-4 text-slate-700">{company.revenueThisMonth}</td>
                <td className="py-4 text-slate-700">{company.expensesThisMonth}</td>
                <td className="py-4 font-semibold text-emerald-600">
                  {company.netProfit}
                </td>
                <td className="py-4">
                  <MiniTrend values={company.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApprovalQueuePanel({
  items,
}: {
  items: readonly ApprovalItem[];
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Approval Queue
        </h2>
        <button className="text-sm font-semibold text-blue-600">View all</button>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-slate-100 px-4 py-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
              <BellRing className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.company}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{item.amount}</p>
              <p className="mt-1 text-sm text-slate-500">{item.when}</p>
            </div>
            <span
              className={joinClasses(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                priorityClasses[item.priority as keyof typeof priorityClasses],
              )}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InfoPanel({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <button className="text-sm font-semibold text-blue-600">View all</button>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardStatusBadge({
  status,
}: {
  status: DashboardCompany["status"];
}) {
  return (
    <span
      className={joinClasses(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Active"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {status}
    </span>
  );
}

function MiniTrend({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 32 - ((value - min) / Math.max(max - min, 1)) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="72" height="36" viewBox="0 0 100 36" className="text-emerald-500">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
