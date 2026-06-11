"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { CashAdvanceFormPanel } from "@/app/src/ui/modules/cash-disbursement/cash-advance/Action";

const CashAdvanceHref = "/cash-disbursement/cash-advance";

type CashAdvanceStatus = "Approved" | "Pending Review" | "Draft" | "Rejected";

type CashAdvanceRecord = {
  accountCode: string;
  amount: number;
  costCenter: string;
  documentDate: string;
  id: string;
  remarks: string;
  status: CashAdvanceStatus;
  partyCode: string;
  partyName: string;
  transNo: string;
};

const CashAdvanceRecords: CashAdvanceRecord[] = [
  {
    accountCode: "1130-CA",
    amount: 12500,
    costCenter: "Operations",
    documentDate: "2026-06-11",
    id: "ca-001",
    remarks: "Project site travel and meal allowance.",
    status: "Draft",
    partyCode: "EMP-0017",
    partyName: "Maria Santos",
    transNo: "CA-2026-0104",
  },
  {
    accountCode: "1130-CA",
    amount: 8200,
    costCenter: "Admin",
    documentDate: "2026-06-10",
    id: "ca-002",
    remarks: "Office supplies purchase advance.",
    status: "Draft",
    partyCode: "EMP-0042",
    partyName: "Jose Ramirez",
    transNo: "CA-2026-0103",
  },
  {
    accountCode: "1135-OA",
    amount: 30000,
    costCenter: "Sales",
    documentDate: "2026-06-08",
    id: "ca-003",
    remarks: "Client visit representation budget.",
    status: "Pending Review",
    partyCode: "EMP-0025",
    partyName: "Angela Cruz",
    transNo: "CA-2026-0102",
  },
  {
    accountCode: "1130-CA",
    amount: 25000,
    costCenter: "Corporate Affairs",
    documentDate: "2026-06-03",
    id: "ca-004",
    remarks: "Retainer and filing advance for corporate documents.",
    status: "Approved",
    partyCode: "EMP-0031",
    partyName: "Santos and Velasco Legal",
    transNo: "CA-2026-0101",
  },
  {
    accountCode: "1135-OA",
    amount: 4875,
    costCenter: "Supply Chain",
    documentDate: "2026-04-28",
    id: "ca-005",
    remarks: "Freight coordination and local transport advance.",
    status: "Rejected",
    partyCode: "EMP-0058",
    partyName: "Global Freight Movers",
    transNo: "CA-2026-0100",
  },
];

const StatusOptions = ["All", "Approved", "Pending Review", "Draft", "Rejected"] as const;

const DarkModuleTableClassName = [
  "[&>div]:!bg-[#151b23]",
  "[&_.module-table-header]:!bg-[#20262e]",
  "[&_.module-table-header]:!text-slate-300",
  "[&_.module-table-header_tr]:!border-[#2b3440]",
  "[&_.module-table-header_button]:!text-slate-300",
  "[&_.module-table-header_button:hover]:!text-slate-50",
  "[&_tbody]:!divide-[#2b3440]",
  "[&_tbody]:!bg-[#151b23]",
  "[&_tbody]:!text-slate-300",
  "[&_tbody_tr:hover]:!bg-[#18212b]",
  "[&_td]:!px-5",
  "[&_td]:!py-4",
  "[&>div>div:last-child]:!border-[#2b3440]",
  "[&>div>div:last-child]:!bg-[#151b23]",
  "[&>div>div:last-child]:!text-slate-400",
  "[&>div>div:last-child_button]:!border-[#313b49]",
  "[&>div>div:last-child_button]:!bg-[#111820]",
  "[&>div>div:last-child_button]:!text-slate-300",
  "[&>div>div:last-child_button[aria-current='page']]:!border-blue-500",
  "[&>div>div:last-child_button[aria-current='page']]:!bg-blue-500",
  "[&>div>div:last-child_button[aria-current='page']]:!text-white",
  "[&>div>div:last-child_select]:!border-[#313b49]",
  "[&>div>div:last-child_select]:!bg-[#111820]",
  "[&>div>div:last-child_select]:!text-slate-100",
].join(" ");

const CashAdvanceColumns: ColumnDef<CashAdvanceRecord>[] = [
  {
    accessorKey: "transNo",
    header: "CA No.",
    meta: { className: "w-[10rem]" },
  },
  {
    accessorKey: "partyName",
    header: "Party",
    meta: { className: "w-[15rem]" },
  },
  {
    accessorKey: "accountCode",
    header: "Account",
    meta: { className: "w-[10rem]" },
  },
  {
    accessorKey: "documentDate",
    header: "Date",
    meta: { className: "w-[8rem]" },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { className: "w-[9rem]" },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-[9rem]" },
  },
  {
    id: "actions",
    enableSorting: false,
    header: "Actions",
    meta: { className: "w-[9rem] text-right" },
  },
];

export function CashAdvanceMain() {
  const [query, setQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<(typeof StatusOptions)[number]>("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CashAdvanceRecords.filter((record) => {
      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          record.transNo,
          record.partyCode,
          record.partyName,
          record.accountCode,
          record.costCenter,
          record.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);
  const approvedCount = CashAdvanceRecords.filter(
    (record) => record.status === "Approved",
  ).length;
  const pendingCount = CashAdvanceRecords.filter(
    (record) => record.status === "Pending Review",
  ).length;
  // TanStack Table intentionally returns function references that React Compiler flags.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns: CashAdvanceColumns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  function resetFilters() {
    setQuery("");
    setStatusFilter("All");
  }

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-[#111720] text-slate-100 sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-4 p-4 sm:p-6">
        <nav className="flex flex-wrap items-center gap-2 px-1 text-[11px] text-slate-500">
          <span>Cash Disbursement</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-semibold text-slate-300">Cash Advance</span>
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </nav>

        <section className="rounded-lg border border-[#2b3440] bg-[#151b23] px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold leading-tight text-slate-50">
                Cash advance control center
                <BadgeCheck
                  className="ml-2 inline h-4 w-4 align-middle text-blue-500"
                  aria-hidden="true"
                />
              </h1>
              <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-400">
                Search cash advance records, review status, and open the
                matching add, view, or edit form.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-500 px-4 text-xs font-bold text-white transition hover:bg-blue-400"
            >
              Start New Cash Advance
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="grid rounded-lg border border-[#2b3440] bg-[#151b23] shadow-[0_18px_60px_rgba(0,0,0,0.18)] md:grid-cols-3">
          <MetricTile
            label="Visible advances"
            value={CashAdvanceRecords.length}
            helper="Current rows available in the cash advance desk."
            accentClassName="bg-blue-500"
          />
          <MetricTile
            label="Approved advances"
            value={approvedCount}
            helper="Cash advances already approved."
            accentClassName="bg-emerald-500"
            helperClassName="text-emerald-400"
          />
          <MetricTile
            label="Pending review"
            value={pendingCount}
            helper="Transactions still waiting for approval."
            accentClassName="bg-amber-500"
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-[#2b3440] bg-[#151b23] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="border-b border-[#2b3440] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              Search Transaction
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-tight text-slate-50">
              Preview the transaction set before creating a cash advance
            </h2>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-400">
              Search by transaction number, party, remarks, or account code, then
              move directly into Preview, New Cash Advance, Edit Cash Advance,
              or Delete.
            </p>
          </div>

          <div className="grid gap-4 border-b border-[#2b3440] bg-[#151b23] px-5 py-4 lg:grid-cols-[minmax(24rem,1fr)_15rem_15rem]">
            <label className="relative min-w-0">
              <span className="sr-only">Search cash advance records</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by transaction number, payee, department, or remarks..."
                className="h-9 w-full rounded-md border border-[#313b49] bg-[#111820] pl-10 pr-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            <label className="relative min-w-0">
              <span className="absolute -top-2 left-3 bg-[#151b23] px-1 text-[11px] text-slate-400">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as (typeof StatusOptions)[number],
                  )
                }
                className="h-9 w-full appearance-none rounded-md border border-[#313b49] bg-[#111820] px-3 pr-9 text-xs font-semibold text-slate-100 outline-none transition focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
              >
                {StatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#313b49] bg-[#111820] px-4 text-xs font-semibold text-slate-300 transition hover:border-blue-500/45 hover:text-slate-50"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className={DarkModuleTableClassName}>
            <ModuleTable
              emptyDescription="Try a different party, transaction number, account, or status."
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              emptyTitle="No cash advances matched"
              maxHeightClassName="max-h-none"
              minWidthClassName="min-w-[72rem]"
              paginationLabel="records"
              paginationStorageKey="cash-disbursement-cash-advance"
              pageSizeOptions={[5, 10, 15, 20]}
              table={table}
              variant="embedded"
              renderRow={({ id, original }) => (
                <tr
                  key={id}
                  className="border-t border-[#2b3440] bg-[#151b23] transition hover:bg-[#18212b]"
                >
                  <td className="align-top">
                    <p className="text-xs font-bold text-slate-50">
                      {original.transNo}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {original.partyCode}
                    </p>
                  </td>
                  <td className="align-top">
                    <p className="text-xs font-bold text-slate-50">
                      {original.partyName}
                    </p>
                    <p className="mt-2 max-w-[18rem] text-xs leading-6 text-slate-400">
                      {original.remarks}
                    </p>
                  </td>
                  <td className="align-top">
                    <p className="text-xs text-sky-200">
                      {original.accountCode}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {original.costCenter}
                    </p>
                  </td>
                  <td className="align-top text-xs text-slate-300">
                    {formatDateLabel(original.documentDate)}
                  </td>
                  <td className="align-top text-xs font-bold text-slate-50">
                    {formatCurrency(original.amount)}
                  </td>
                  <td className="align-top">
                    <StatusBadge status={original.status} />
                  </td>
                  <td className="align-top">
                    <RecordActions
                      record={original}
                      onStartNew={() => setIsDrawerOpen(true)}
                    />
                  </td>
                </tr>
              )}
            />
          </div>
        </section>
        <ModuleDrawer
          isOpen={isDrawerOpen}
          maxWidthClassName="max-w-6xl"
          title="Cash Advance"
          eyebrow="New Cash Advance"
          description="Create the cash advance details, continue to accounting entries, then review everything before saving."
          onClose={() => setIsDrawerOpen(false)}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-darknavy/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Proceed to Accounting Entries
              </button>
            </div>
          }
        >
          <CashAdvanceFormPanel mode="add" showToolbar={false} />
        </ModuleDrawer>
      </main>
    </section>
  );
}

function MetricTile({
  accentClassName,
  helper,
  helperClassName,
  label,
  value,
}: {
  accentClassName: string;
  helper: string;
  helperClassName?: string;
  label: string;
  value: number;
}) {
  return (
    <div className="relative min-h-20 border-b border-[#2b3440] px-5 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <span
        className={joinClasses(
          "absolute bottom-5 left-5 top-5 w-px rounded-full",
          accentClassName,
        )}
        aria-hidden="true"
      />
      <div className="pl-4">
        <p className="text-[11px] font-bold text-slate-400">{label}</p>
        <p className="mt-2 text-lg font-bold leading-none text-slate-50">
          {value}
        </p>
        <p
          className={joinClasses(
            "mt-2 text-xs leading-5 text-slate-400",
            helperClassName,
          )}
        >
          {helper}
        </p>
      </div>
    </div>
  );
}

function RecordActions({
  onStartNew,
  record,
}: {
  onStartNew: () => void;
  record: CashAdvanceRecord;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconAction href={`${CashAdvanceHref}/view/${record.id}`} title="View">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      </IconAction>
      <IconAction href={`${CashAdvanceHref}/edit/${record.id}`} title="Edit">
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </IconAction>
      {record.status === "Pending Review" ? (
        <button
          type="button"
          title="New"
          onClick={onStartNew}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#313b49] bg-transparent text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-slate-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          title="Delete"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-500/45 bg-transparent text-red-400 transition hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function IconAction({
  children,
  href,
  title,
}: {
  children: ReactNode;
  href: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#313b49] bg-transparent text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-slate-50"
    >
      {children}
    </Link>
  );
}

function StatusBadge({ status }: { status: CashAdvanceStatus }) {
  const tone =
    status === "Approved"
      ? "bg-amber-500/35 text-white"
      : status === "Pending Review"
        ? "bg-blue-500/25 text-white"
        : status === "Rejected"
          ? "bg-red-500/25 text-red-200"
          : "bg-slate-600/35 text-slate-200";

  return (
    <span
      className={joinClasses(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-bold",
        tone,
      )}
    >
      {status}
    </span>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    currency: "PHP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
