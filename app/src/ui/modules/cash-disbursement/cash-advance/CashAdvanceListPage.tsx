"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Pencil,
  PackageCheck,
  Plus,
  ReceiptText,
  Save,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { CashAdvanceFormPanel } from "@/app/src/ui/modules/cash-disbursement/cash-advance/CashAdvanceActionPage";
import {
  AmountRangePicker,
  type AmountRangeValue,
} from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

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
    header: "Advance No.",
    meta: { className: "w-[10rem]" },
  },
  {
    accessorKey: "documentDate",
    header: "Document Date",
    meta: { className: "w-[9rem]" },
  },
  {
    accessorKey: "partyName",
    header: "Party Name",
    meta: { className: "w-[16rem]" },
  },
  {
    accessorKey: "accountCode",
    header: "Account",
    meta: { className: "w-[12rem]" },
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
    meta: { className: "w-[5.5rem] px-3 text-center last:pr-3" },
  },
];

export function CashAdvanceListPage() {
  const [query, setQuery] = useState("");
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<(typeof StatusOptions)[number]>("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return CashAdvanceRecords.filter((record) => {
      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesDateRange =
        (!dateRange.from || record.documentDate >= dateRange.from) &&
        (!dateRange.to || record.documentDate <= dateRange.to);
      const matchesAmountRange =
        (!amountRange.from || record.amount >= Number(amountRange.from)) &&
        (!amountRange.to || record.amount <= Number(amountRange.to));
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

      return matchesStatus && matchesDateRange && matchesAmountRange && matchesQuery;
    });
  }, [amountRange, dateRange, query, statusFilter]);
  const activeCount = CashAdvanceRecords.filter(
    (record) => record.status !== "Rejected",
  ).length;
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
    setAmountRange({ from: "", to: "" });
    setDateRange({ from: "", to: "" });
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
          <>
            <button
              type="button"
              className={moduleHeaderActionClassNames.secondary}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
            </button>
            <button
              type="button"
              className={moduleHeaderActionClassNames.secondary}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Start New Cash Advance
            </button>
          </>
        }
      />

      <ModuleStatisticCards
        className="2xl:grid-cols-6"
        items={[
          {
            icon: ReceiptText,
            iconClassName: "bg-skyblue/20 text-skyblue",
            label: "Total Advances",
            summary: "All time",
            value: CashAdvanceRecords.length,
          },
          {
            icon: CheckCircle2,
            iconClassName: "bg-emerald-50 text-emerald-700",
            label: "Active",
            summary: formatPercentage(activeCount, CashAdvanceRecords.length),
            value: activeCount,
          },
          {
            icon: Clock3,
            iconClassName: "bg-offwhite text-darknavy",
            label: "Pending",
            summary: formatPercentage(pendingCount, CashAdvanceRecords.length),
            value: pendingCount,
          },
          {
            icon: CheckCircle2,
            iconClassName: "bg-citron/25 text-darknavy",
            label: "Approved",
            summary: formatPercentage(approvedCount, CashAdvanceRecords.length),
            value: approvedCount,
          },
          {
            icon: XCircle,
            iconClassName: "bg-coralpink/15 text-coralpink",
            label: "Disapproved",
            summary: formatPercentage(rejectedCount, CashAdvanceRecords.length),
            value: rejectedCount,
          },
          {
            icon: PackageCheck,
            iconClassName: "bg-skyblue/15 text-skyblue",
            label: "Closed",
            summary: formatPercentage(0, CashAdvanceRecords.length),
            value: 0,
          },
        ]}
      />

      <ModuleTable
              emptyDescription="Try a different party, transaction number, account, or status."
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              emptyTitle="No cash advances matched"
              minWidthClassName="min-w-[66rem]"
              paginationLabel="entries"
              paginationStorageKey="cash-disbursement-cash-advance"
              pageSizeOptions={[5, 10, 15, 20, 25, 50]}
              table={table}
              toolbar={
                <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
                  <ModuleTableSearch
                    label="Search cash advances"
                    placeholder="Search by transaction no., party, account, or remarks"
                    value={query}
                    onChange={setQuery}
                  />
                  <DateRangePicker
                    label="Date Range"
                    value={dateRange}
                    onChange={setDateRange}
                  />
                  <AmountRangePicker
                    label="Total Amount"
                    value={amountRange}
                    onChange={setAmountRange}
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
                    <p className="text-sm font-semibold text-skyblue">
                      {original.transNo}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-darknavy/70">
                    {formatDateLabel(original.documentDate)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm font-semibold text-darknavy">
                      {original.partyName}
                    </p>
                    <p className="mt-1 text-sm text-darknavy/60">
                      {original.partyCode}
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
                  <td className="px-4 py-4 align-top text-sm font-semibold text-darknavy">
                    {formatCurrency(original.amount)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge status={original.status} />
                  </td>
                  <td className="px-3 py-4 align-top text-center">
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
  const items: ModuleActionMenuItem[] = [
    {
      href: `${CashAdvanceHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    {
      href: `${CashAdvanceHref}/edit/${record.id}`,
      icon: Pencil,
      label: "Edit",
      type: "link",
    },
    ...(record.status === "Pending Review"
      ? [
          {
            icon: Plus,
            label: "New",
            onSelect: onStartNew,
            type: "button",
          } satisfies ModuleActionMenuItem,
        ]
      : [
          {
            icon: Trash2,
            label: "Delete",
            onSelect: () => undefined,
            tone: "danger",
            type: "button",
          } satisfies ModuleActionMenuItem,
        ]),
  ];

  return (
    <ModuleTableActions className="!justify-center">
      <ModuleActionMenu
        items={items}
        label={`Actions for cash advance ${record.transNo}`}
      />
    </ModuleTableActions>
  );
}

function StatusBadge({ status }: { status: CashAdvanceStatus }) {
  const Icon = statusIconByStatus[status];

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusClassNameByStatus[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {getStatusLabel(status)}
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

function formatPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

function getStatusLabel(status: CashAdvanceStatus) {
  if (status === "Pending Review") {
    return "Pending";
  }

  if (status === "Rejected") {
    return "Disapproved";
  }

  return status;
}

const statusIconByStatus = {
  Approved: CheckCircle2,
  Draft: Clock3,
  "Pending Review": Clock3,
  Rejected: XCircle,
} satisfies Record<CashAdvanceStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Approved: "bg-citron/25 text-darknavy",
  Draft: "bg-offwhite text-darknavy/70",
  "Pending Review": "bg-offwhite text-darknavy",
  Rejected: "bg-coralpink/15 text-coralpink",
} satisfies Record<CashAdvanceStatus, string>;
