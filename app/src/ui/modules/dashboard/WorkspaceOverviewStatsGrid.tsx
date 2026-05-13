"use client";

import {
  CalendarDays,
  CreditCard,
  FolderOpenDot,
  Users,
} from "lucide-react";
import type { getWorkspaceDashboardData } from "@/app/src/services/modules/dashboard/ErpDashboardService";

type DashboardStat = ReturnType<typeof getWorkspaceDashboardData>["stats"][number];

const toneClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
} as const;

const cardIcons = [CreditCard, CalendarDays, FolderOpenDot, Users];

export function WorkspaceStatsGrid({
  stats,
}: {
  stats: readonly DashboardStat[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = cardIcons[index];

        return (
          <div
            key={stat.label}
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div
              className={joinClasses(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                toneClasses[stat.tone],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2 text-sm">
              <span
                className={
                  stat.tone === "green"
                    ? "font-medium text-emerald-600"
                    : "text-slate-500"
                }
              >
                {stat.helper}
              </span>
              <button className="font-semibold text-blue-600">
                {stat.linkLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
