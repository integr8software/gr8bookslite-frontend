"use client";

import { CalendarDays } from "lucide-react";

export function WorkspaceOverviewHero() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-blue-600">Workspace Overview</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          Welcome back, John!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Here&apos;s what&apos;s happening across your companies.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <CalendarDays className="h-4.5 w-4.5" />
          <span>May 20 - May 26, 2024</span>
        </button>
        <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
          + Create New
        </button>
      </div>
    </div>
  );
}
