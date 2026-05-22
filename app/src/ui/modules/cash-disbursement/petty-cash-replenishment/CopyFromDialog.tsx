"use client";

import { Search, Check } from "lucide-react";
import {
  flexRender,
} from "@tanstack/react-table";
import { usePettyCashReplenishmentCopyFromDialog } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentCopyFromDialog";
import type {
  PettyCashReplenishmentCopyFromRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

interface CopyFromDialogProps {
  isOpen: boolean;
  source: string;
  onClose: () => void;
  onSelect: (record: PettyCashReplenishmentCopyFromRecord) => void;
}

const searchInputClassName = [
  "h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pl-9",
  "text-sm text-darknavy outline-none transition focus:border-skyblue",
  "focus:ring-2 focus:ring-skyblue/20",
].join(" ");

const tableHeadClassName = [
  "sticky top-0 bg-skyblue/10 text-xs font-semibold uppercase",
  "tracking-[0.12em] text-darknavy/70",
].join(" ");

const copyButtonClassName = [
  "inline-flex h-10 items-center justify-center rounded-lg bg-darknavy",
  "px-6 text-sm font-semibold text-white transition disabled:bg-darknavy/50",
  "hover:bg-darknavy/90",
].join(" ");

const cancelButtonClassName = [
  "inline-flex h-10 items-center justify-center rounded-lg border",
  "border-darknavy/10 bg-white px-6 text-sm font-semibold text-darknavy",
  "transition hover:bg-slate-50",
].join(" ");

export function PettyCashReplenishmentCopyFromDialog({
  isOpen,
  source,
  onClose,
  onSelect,
}: CopyFromDialogProps) {
  const dialog = usePettyCashReplenishmentCopyFromDialog();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-2xl border border-darknavy/10 bg-white shadow-xl">
        <div className="border-b border-darknavy/10 p-6">
          <h2 className="text-lg font-semibold text-darknavy">Copy from {source}</h2>
          <p className="mt-1 text-sm text-darknavy/60">
            Select a record to copy data from.
          </p>
        </div>

        <div className="border-b border-darknavy/10 p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40" />
            <input
              type="text"
              value={dialog.searchQuery}
              onChange={(event) => dialog.setSearchQuery(event.target.value)}
              placeholder="Search voucher number, VCE code, or VCE name"
              className={searchInputClassName}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-sm text-darknavy">
            <thead className={tableHeadClassName}>
              <tr>
                <th className="border-b border-darknavy/10 px-6 py-3"></th>
                {dialog.table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th key={header.id} className="border-b border-darknavy/10 px-6 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {dialog.table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-darknavy/10 transition hover:bg-skyblue/5 ${
                    dialog.selectedId === row.original.id ? "bg-skyblue/10" : ""
                  }`}
                  onClick={() => dialog.setSelectedId(row.original.id)}
                  role="button"
                  tabIndex={0}
                >
                  <td className="px-6 py-3">
                    <div
                      className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                        dialog.selectedId === row.original.id
                          ? "border-skyblue bg-skyblue"
                          : "border-darknavy/20 bg-white"
                      }`}
                    >
                      {dialog.selectedId === row.original.id ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : null}
                    </div>
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {dialog.filteredRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-darknavy/60">No records found.</p>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 border-t border-darknavy/10 p-6">
          <button
            type="button"
            onClick={() => {
              if (dialog.selectedRecord) {
                onSelect(dialog.selectedRecord);
              }
              onClose();
            }}
            disabled={!dialog.selectedId}
            className={copyButtonClassName}
          >
            Copy selected
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClassName}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
