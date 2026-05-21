"use client";

import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

export interface CopyFromRecord {
  id: string;
  voucherNo: string;
  vceCode: string;
  vceName: string;
  amount: string;
  documentDate: string;
}

interface CopyFromDialogProps {
  isOpen: boolean;
  source: string;
  onClose: () => void;
  onSelect: (record: CopyFromRecord) => void;
}

const sampleVouchers: CopyFromRecord[] = [
  {
    id: "1",
    voucherNo: "PCV-2026-001",
    vceCode: "VCE-1098",
    vceName: "Waldo Enterprises",
    amount: "12,500.00",
    documentDate: "2026-05-21",
  },
  {
    id: "2",
    voucherNo: "PCV-2026-002",
    vceCode: "VCE-1134",
    vceName: "Pacific Supplies",
    amount: "8,320.50",
    documentDate: "2026-05-18",
  },
  {
    id: "3",
    voucherNo: "PCV-2026-003",
    vceCode: "VCE-1210",
    vceName: "Greenfield Logistics",
    amount: "4,200.00",
    documentDate: "2026-05-14",
  },
  {
    id: "4",
    voucherNo: "PCV-2026-004",
    vceCode: "VCE-1156",
    vceName: "Summit Trading Co.",
    amount: "15,600.00",
    documentDate: "2026-05-10",
  },
];

export function PettyCashReplenishmentCopyFromDialog({
  isOpen,
  source,
  onClose,
  onSelect,
}: CopyFromDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const columnHelper = createColumnHelper<CopyFromRecord>();

  const columns = [
    columnHelper.accessor("voucherNo", {
      id: "voucherNo",
      header: "Voucher #",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("vceCode", {
      id: "vceCode",
      header: "VCE Code",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("vceName", {
      id: "vceName",
      header: "VCE Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("amount", {
      id: "amount",
      header: "Amount",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("documentDate", {
      id: "documentDate",
      header: "Date",
      cell: (info) => info.getValue(),
    }),
  ];

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return sampleVouchers;
    }

    const query = searchQuery.toLowerCase();
    return sampleVouchers.filter(
      (record) =>
        record.voucherNo.toLowerCase().includes(query) ||
        record.vceCode.toLowerCase().includes(query) ||
        record.vceName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
  });

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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search voucher number, VCE code, or VCE name"
              className="h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pl-9 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-sm text-darknavy">
            <thead className="sticky top-0 bg-skyblue/10 text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/70">
              <tr>
                <th className="border-b border-darknavy/10 px-6 py-3"></th>
                {table.getHeaderGroups().map((headerGroup) =>
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-darknavy/10 transition hover:bg-skyblue/5 ${
                    selectedId === row.original.id ? "bg-skyblue/10" : ""
                  }`}
                  onClick={() => setSelectedId(row.original.id)}
                  role="button"
                  tabIndex={0}
                >
                  <td className="px-6 py-3">
                    <div
                      className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                        selectedId === row.original.id
                          ? "border-skyblue bg-skyblue"
                          : "border-darknavy/20 bg-white"
                      }`}
                    >
                      {selectedId === row.original.id ? (
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

          {filteredRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-darknavy/60">No records found.</p>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 border-t border-darknavy/10 p-6">
          <button
            type="button"
            onClick={() => {
              if (selectedId) {
                const selected = sampleVouchers.find((v) => v.id === selectedId);
                if (selected) {
                  onSelect(selected);
                }
              }
              onClose();
            }}
            disabled={!selectedId}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-darknavy px-6 text-sm font-semibold text-white transition disabled:bg-darknavy/50 hover:bg-darknavy/90"
          >
            Copy selected
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-6 text-sm font-semibold text-darknavy transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
