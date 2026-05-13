"use client";

import {
  CalendarDays,
  ChevronDown,
  Ellipsis,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { getBranchById } from "@/app/src/data/modules/workspace/ErpWorkspaceShellData";
import type { ErpReceipt } from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";

const statusClasses = {
  Deposited: "bg-emerald-50 text-emerald-600",
  "Pending Deposit": "bg-amber-50 text-amber-600",
  Voided: "bg-red-50 text-red-600",
} as const;

const columns = [
  "",
  "Receipt No.",
  "Customer",
  "Branch / Site",
  "Receipt Date",
  "Payment Method",
  "Amount",
  "Status",
  "Actions",
] as const;

export function CollectionReceiptsTable({
  receipts,
  selectedReceiptId,
  setSelectedReceiptId,
}: {
  receipts: readonly ErpReceipt[];
  selectedReceiptId: string;
  setSelectedReceiptId: (receiptId: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <CollectionFilters />

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="pb-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => {
              const branch = getBranchById(receipt.branchId);
              const isSelected = receipt.id === selectedReceiptId;

              return (
                <tr
                  key={receipt.id}
                  className={joinClasses(
                    "border-t border-slate-100 transition",
                    isSelected && "bg-blue-50/50",
                  )}
                >
                  <td className="py-4">
                    <input
                      checked={isSelected}
                      onChange={() => setSelectedReceiptId(receipt.id)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                  </td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptId(receipt.id)}
                      className="font-semibold text-blue-600"
                    >
                      {receipt.receiptNo}
                    </button>
                  </td>
                  <td className="py-4 text-slate-700">{receipt.customer}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span>{branch.name}</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] font-semibold text-blue-700">
                        {branch.code}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-700">{receipt.receiptDate}</td>
                  <td className="py-4 text-slate-700">{receipt.paymentMethod}</td>
                  <td className="py-4 font-semibold text-slate-900">{receipt.amount}</td>
                  <td className="py-4">
                    <ReceiptStatusBadge status={receipt.status} />
                  </td>
                  <td className="py-4">
                    <button className="rounded-xl border border-slate-200 p-2 text-slate-500">
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
        <p>Showing 1 to {receipts.length} of 56 receipts</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 7].map((page) => (
            <button
              key={page}
              className={joinClasses(
                "flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-medium",
                page === 1
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600",
              )}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollectionFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      {["All Customers", "All Payment Methods", "All Status"].map((label) => (
        <FilterChip key={label} label={label} />
      ))}
      <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
        <CalendarDays className="h-4 w-4" />
        <span>May 1, 2024 - May 31, 2024</span>
      </button>
      <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500">
        <Search className="h-4 w-4" />
        <span>Search receipts...</span>
      </div>
      <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </button>
      <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
        <Plus className="h-4 w-4" />
        <span>New Receipt</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function ReceiptStatusBadge({ status }: { status: ErpReceipt["status"] }) {
  return (
    <span
      className={joinClasses(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
