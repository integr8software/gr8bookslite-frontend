"use client";

import {
  CalendarDays,
  CreditCard,
  Landmark,
  ReceiptText,
} from "lucide-react";

const kpis = [
  {
    label: "Total Receipts This Month",
    value: "$125,430.00",
    helper: "+18.6% vs last month",
    tone: "blue",
    icon: Landmark,
  },
  {
    label: "Total Receipts This Year",
    value: "$1,452,830.00",
    helper: "+24.3% vs last year",
    tone: "green",
    icon: ReceiptText,
  },
  {
    label: "Pending Deposits",
    value: "$28,540.00",
    helper: "12 receipts",
    tone: "amber",
    icon: CalendarDays,
  },
  {
    label: "Overdue Amount",
    value: "$213,520.00",
    helper: "View Aging Report",
    tone: "red",
    icon: CreditCard,
  },
] as const;

const toneClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
} as const;

export function CollectionKpiGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div
              className={joinClasses(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                toneClasses[kpi.tone],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {kpi.value}
            </p>
            <p
              className={joinClasses(
                "mt-4 text-sm font-medium",
                kpi.tone === "green"
                  ? "text-emerald-600"
                  : kpi.tone === "red"
                    ? "text-blue-600"
                    : "text-slate-500",
              )}
            >
              {kpi.helper}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
