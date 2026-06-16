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
  Eye,
  Pencil,
  Plus,
  ReceiptText,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { CashAdvanceFormPanel } from "@/app/src/ui/modules/cash-disbursement/cash-advance/CashAdvanceActionPage";

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

export function CashAdvanceListPage() {
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
  const rejectedCount = CashAdvanceRecords.filter(
    (record) => record.status === "Rejected",
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
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Advance"
        description="Search cash advance records, review status, and open the matching add, view, or edit form."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Cash Advance
          </button>
        }
      />

      <ModuleMetrics
        metrics={[
          {
            helper: "Current rows",
            icon: ReceiptText,
            label: "Total Advances",
            value: CashAdvanceRecords.length,
          },
          {
            helper: "Already approved",
            icon: ReceiptText,
            label: "Approved",
            tone: "emerald",
            value: approvedCount,
          },
          {
            helper: "Waiting for approval",
            icon: ReceiptText,
            label: "Pending Review",
            tone: "amber",
            value: pendingCount,
          },
          {
            helper: "Returned records",
            icon: ReceiptText,
            label: "Rejected",
            iconClassName: "bg-coralpink",
            value: rejectedCount,
          },
        ]}
      />

      <ModuleTable
              emptyDescription="Try a different party, transaction number, account, or status."
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              emptyTitle="No cash advances matched"
              minWidthClassName="min-w-[72rem]"
              paginationLabel="entries"
              paginationStorageKey="cash-disbursement-cash-advance"
              pageSizeOptions={[5, 10, 15, 20, 25, 50]}
              table={table}
              toolbar={
                <ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_minmax(12rem,1fr)_auto]">
                  <ModuleTableSearch
                    label="Search cash advances"
                    placeholder="Search by transaction no., party, account, or remarks"
                    value={query}
                    onChange={setQuery}
                  />
                  <ModuleTableFilterSelect
                    label="Status"
                    value={statusFilter}
                    options={StatusOptions.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                    onChange={(value) =>
                      setStatusFilter(value as (typeof StatusOptions)[number])
                    }
                  />
                  <ModuleTableResetButton onClick={resetFilters} />
                </ModuleTableToolbar>
              }
              renderRow={({ id, original }) => (
                <tr
                  key={id}
                  className="module-table-row border-b border-darknavy/8 last:border-b-0"
                >
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm font-semibold text-darknavy">
                      {original.transNo}
                    </p>
                    <p className="mt-1 text-sm text-darknavy/60">
                      {original.partyCode}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm font-semibold text-darknavy">
                      {original.partyName}
                    </p>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-darknavy/60">
                      {original.remarks}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-darknavy/70">
                    <p>
                      {original.accountCode}
                    </p>
                    <p className="mt-1 text-sm text-darknavy/55">
                      {original.costCenter}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-darknavy/70">
                    {formatDateLabel(original.documentDate)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-semibold text-darknavy">
                    {formatCurrency(original.amount)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge status={original.status} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <RecordActions
                      record={original}
                      onStartNew={() => setIsDrawerOpen(true)}
                    />
                  </td>
                </tr>
              )}
            />

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
    </section>
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/35 hover:bg-skyblue/10 hover:text-skyblue"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          title="Delete"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-coralpink/25 bg-white text-coralpink transition hover:bg-coralpink/10"
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/35 hover:bg-skyblue/10 hover:text-skyblue"
    >
      {children}
    </Link>
  );
}

function StatusBadge({ status }: { status: CashAdvanceStatus }) {
  const tone =
    status === "Approved"
      ? "bg-citron/30 text-darknavy"
      : status === "Pending Review"
        ? "bg-skyblue/18 text-darknavy"
        : status === "Rejected"
          ? "bg-coralpink/18 text-coralpink"
          : "bg-darknavy/8 text-darknavy/65";

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
