"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Download,
  Home,
  Plus,
  Sparkles,
  Upload,
  Search,
  Filter,
  Edit3,
  Trash2,
} from "lucide-react";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type { Row } from "@tanstack/react-table";

interface PettyCashVoucherTableRow {
  id: string;
  voucherNo: string;
  vceCode: string;
  vceName: string;
  accountCode: string;
  amount: string;
  documentDate: string;
  status: string;
}

const columnHelper = createColumnHelper<PettyCashVoucherTableRow>();

const sampleVouchers: PettyCashVoucherTableRow[] = [
  {
    id: "1",
    voucherNo: "PCV-2026-001",
    vceCode: "VCE-1098",
    vceName: "Waldo Enterprises",
    accountCode: "101-200",
    amount: "12,500.00",
    documentDate: "2026-05-21",
    status: "Pending",
  },
  {
    id: "2",
    voucherNo: "PCV-2026-002",
    vceCode: "VCE-1134",
    vceName: "Pacific Supplies",
    accountCode: "101-300",
    amount: "8,320.50",
    documentDate: "2026-05-18",
    status: "Approved",
  },
  {
    id: "3",
    voucherNo: "PCV-2026-003",
    vceCode: "VCE-1210",
    vceName: "Greenfield Logistics",
    accountCode: "101-210",
    amount: "4,200.00",
    documentDate: "2026-05-14",
    status: "Cancelled",
  },
];

export function PettyCashVoucherMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredVouchers = useMemo(() => {
    return sampleVouchers.filter((voucher) => {
      const matchesSearch =
        voucher.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.vceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.vceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.accountCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || voucher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("voucherNo", {
        header: "Voucher No.",
        cell: (info) => (
          <span className="text-sm font-semibold text-darknavy">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("vceCode", {
        header: "VCE Code",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("vceName", {
        header: "VCE Name",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("accountCode", {
        header: "Account Code",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("documentDate", {
        header: "Document Date",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              info.getValue() === "Approved"
                ? "bg-green-100 text-green-700"
                : info.getValue() === "Pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredVouchers,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Voucher"
          titleAs="h1"
          description="Manage petty cash voucher records with the same modern module layout."
          eyebrow={
            <>
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Cash disbursement
            </>
          }
          actions={
            <>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Quick Tour
              </button>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import
              </button>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export
              </button>
              <Link
                href="/cash-disbursement/petty-cash-voucher/add"
                className={moduleHeaderActionClassNames.primary}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Voucher
              </Link>
            </>
          }
        />

        <div className="rounded-xl border border-darknavy/10 bg-white shadow-sm">
          <div className="border-b border-darknavy/10 p-4 sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem_11rem_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search voucher number, VCE, or account code"
                  className="h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pl-9 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pr-9 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
                >
                  <option value="All">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <ModuleTable
              emptyDescription="Adjust the filters or add a new voucher to view petty cash records."
              emptyTitle="No vouchers found"
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              isLoading={false}
              paginationLabel="vouchers"
              paginationStorageKey="petty-cash-voucher-table"
              table={table}
              renderRow={({ id, original }) => (
                <PettyCashVoucherRow key={id} row={original} />
              )}
            />
          </div>
        </div>
      </main>
    </section>
  );
}

function PettyCashVoucherRow({
  row,
}: {
  row: PettyCashVoucherTableRow;
}) {
  return (
    <tr className="module-table-row text-darknavy">
      <td className="px-4 py-3 text-sm font-semibold text-darknavy/80">{row.voucherNo}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.vceCode}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.vceName}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.accountCode}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.amount}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.documentDate}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.status}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10">
            <Edit3 className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
