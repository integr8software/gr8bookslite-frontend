"use client";

import type { ErpBranch } from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";

export function CollectionReceiptsHeader({
  currentBranch,
}: {
  currentBranch: ErpBranch;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>Financial Management</span>
          <span>&rsaquo;</span>
          <span>Collections</span>
          <span>&rsaquo;</span>
          <span className="font-semibold text-slate-900">Collection Receipts</span>
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Collection Receipts
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
          <span>{currentBranch.name}</span>
          <span>({currentBranch.code})</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Record and manage payments received from customers.
        </p>
      </div>
    </div>
  );
}

export function CollectionTabs({ tabs }: { tabs: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-slate-200">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={`border-b-2 pb-4 text-sm font-medium transition ${
            index === 0
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
