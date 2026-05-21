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
  Search,
  Filter,
  Edit3,
  Eye,
} from "lucide-react";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import type { Row } from "@tanstack/react-table";

interface PettyCashReplenishmentRow {
  id: string;
  replenishmentNo: string;
  vceCode: string;
  vceName: string;
  documentDate: string;
  totalAmount: string;
  status: string;
}

const columnHelper = createColumnHelper<PettyCashReplenishmentRow>();

const sampleReplenishments: PettyCashReplenishmentRow[] = [
  {
    id: "1",
    replenishmentNo: "PCR-2026-001",
    vceCode: "VCE-1081",
    vceName: "Metro Supplies Inc.",
    documentDate: "2026-05-21",
    totalAmount: "18,750.00",
    status: "Active",
  },
  {
    id: "2",
    replenishmentNo: "PCR-2026-002",
    vceCode: "VCE-1143",
    vceName: "Northfield Traders",
    documentDate: "2026-05-18",
    totalAmount: "9,420.50",
    status: "Closed",
  },
  {
    id: "3",
    replenishmentNo: "PCR-2026-003",
    vceCode: "VCE-1195",
    vceName: "Oceanic Logistics",
    documentDate: "2026-05-14",
    totalAmount: "12,500.00",
    status: "Pending",
  },
];

export function PettyCashReplenishmentMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRecords = useMemo(() => {
    return sampleReplenishments.filter((record) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        record.replenishmentNo.toLowerCase().includes(query) ||
        record.vceCode.toLowerCase().includes(query) ||
        record.vceName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("replenishmentNo", {
        header: "Replenishment No.",
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
      columnHelper.accessor("documentDate", {
        header: "Document Date",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("totalAmount", {
        header: "Total Amount",
        cell: (info) => <span className="text-sm text-darknavy/75">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              info.getValue() === "Active"
                ? "bg-skyblue/10 text-skyblue"
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
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link
              href={`/cash-disbursement/petty-cash-replenishment/view/${row.original.id}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/cash-disbursement/petty-cash-replenishment/edit/${row.original.id}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-background px-4 py-6 text-darknavy sm:-mx-5 sm:px-6 lg:-mx-6">
      <main className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-5">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Replenishment"
          titleAs="h1"
          description="View and manage petty cash replenishment records for cash disbursement."
          eyebrow={
            <>
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Cash disbursement
            </>
          }
          actions={
            <>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export
              </button>
              <Link
                href="/cash-disbursement/petty-cash-replenishment/add"
                className={moduleHeaderActionClassNames.primary}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Replenishment
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
                  placeholder="Search replenishment number, VCE code, or VCE name"
                  className="h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pl-9 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 pr-9 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
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
              emptyDescription="Adjust the filters or create a new replenishment record to view petty cash activity."
              emptyTitle="No replenishments found"
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              isLoading={false}
              paginationLabel="replenishments"
              paginationStorageKey="petty-cash-replenishment-table"
              table={table}
              renderRow={({ id, original }) => (
                <PettyCashReplenishmentRow key={id} row={original} />
              )}
            />
          </div>
        </div>
      </main>
    </section>
  );
}

function PettyCashReplenishmentRow({
  row,
}: {
  row: PettyCashReplenishmentRow;
}) {
  return (
    <tr className="module-table-row text-darknavy">
      <td className="px-4 py-3 text-sm font-semibold text-darknavy/80">{row.replenishmentNo}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.vceCode}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.vceName}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.documentDate}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.totalAmount}</td>
      <td className="px-4 py-3 text-sm text-darknavy/70">{row.status}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/cash-disbursement/petty-cash-replenishment/view/${row.id}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/cash-disbursement/petty-cash-replenishment/edit/${row.id}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/80 transition hover:bg-skyblue/10"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
