"use client";

import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  type LucideIcon,
  Upload,
  XCircle,
} from "lucide-react";
import {
  CashAdvanceMultipleEntryHref,
  CashAdvanceMultipleEntryStatusFilterOptions,
  CashAdvanceMultipleEntryStatusFilters,
  CashAdvanceMultipleEntryStatuses,
  CashAdvanceMultipleEntryTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  countCashAdvanceMultipleEntriesByStatus,
  formatCashAdvanceMultipleEntryPercentage,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  useCashAdvanceMultipleEntryStore,
  useCashAdvanceMultipleEntryTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { formatCashAdvanceCurrency, formatCashAdvanceDate } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
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
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function CashAdvanceMultipleEntryListPage() {
  const { entries, lastSyncedAt } = useCashAdvanceMultipleEntryStore();
  const tableState = useCashAdvanceMultipleEntryTable(entries);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Advances Multiple Entry"
        description="Search cash advances multiple entry records and open add, view, or edit forms."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={<CashAdvanceMultipleEntryListHeaderActions />}
      />

      <CashAdvanceMultipleEntryMetrics
        records={entries}
        statusFilter={tableState.statusFilter}
        onStatusFilterChange={tableState.setStatusFilter}
      />

      <ModuleTable
        emptyDescription="Try a different party, transaction number, account, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No cash advances multiple entries matched"
        minWidthClassName="min-w-[76rem]"
        paginationLabel="entries"
        paginationStorageKey={CashAdvanceMultipleEntryTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Cash advances multiple entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto_auto]">
            <ModuleTableSearch
              label="Search Cash Advances Multiple Entries"
              placeholder="Search by trans no., Party Name, account, or remarks"
              value={tableState.query}
              onChange={tableState.setQuery}
            />
            <DateRangePicker label="Date Range" value={tableState.dateRange} onChange={tableState.setDateRange} />
            <AmountRangePicker label="Total Amount" value={tableState.amountRange} onChange={tableState.setAmountRange} />
            <ModuleTableFilterSelect
              label="Status"
              value={tableState.statusFilter}
              options={CashAdvanceMultipleEntryStatusFilterOptions}
              onChange={(value) =>
                tableState.setStatusFilter(
                  value as Parameters<typeof tableState.setStatusFilter>[0],
                )
              }
            />
            <ModuleTableColumnVisibilityButton table={tableState.table} />
            <ModuleTableResetButton onClick={tableState.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={(row) => (
          <tr key={row.id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={joinClasses(
                  "px-4 py-4 align-middle",
                  getColumnMetaClassName(cell.column.columnDef.meta),
                )}
              >
                <CashAdvanceMultipleEntryCellContent
                  columnId={cell.column.id}
                  record={row.original}
                />
              </td>
            ))}
          </tr>
        )}
      />
    </section>
  );
}

function CashAdvanceMultipleEntryCellContent({
  columnId,
  record,
}: {
  columnId: string;
  record: CashAdvanceMultipleEntryRecord;
}) {
  switch (columnId) {
    case "transNo":
      return <span className="font-semibold text-skyblue">{record.transNo}</span>;
    case "documentDate":
      return formatCashAdvanceDate(record.documentDate);
    case "partyName":
      return <span className="font-semibold text-darknavy">{record.partyName}</span>;
    case "partyCode":
      return <span className="font-semibold text-darknavy">{record.partyCode}</span>;
    case "accountTitle":
      return (
        <>
          <p className="text-darknavy/70">{record.accountTitle}</p>
          <p className="mt-1 text-sm text-darknavy/55">{record.accountCode}</p>
        </>
      );
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCashAdvanceCurrency(record.amount)}</span>;
    case "status":
      return <CashAdvanceMultipleEntryStatusBadge status={record.status} />;
    case "actions":
      return (
        <div className="flex justify-center gap-2">
          <Link href={`${CashAdvanceMultipleEntryHref}/view/${record.id}`} className="font-semibold text-skyblue hover:underline">
            View
          </Link>
          <Link href={`${CashAdvanceMultipleEntryHref}/edit/${record.id}`} className="font-semibold text-coralpink hover:underline">
            Edit
          </Link>
        </div>
      );
    default:
      return null;
  }
}

function CashAdvanceMultipleEntryListHeaderActions() {
  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          className="[&>button]:h-10 [&>button]:w-10"
          items={CashAdvanceMultipleEntryListOverflowItems}
          label="Cash Advances Multiple Entry list actions"
        />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <button type="button" className={moduleHeaderActionClassNames.secondary}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload
        </button>
        <button type="button" className={moduleHeaderActionClassNames.secondary}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </button>
      </div>
      <Link href={`${CashAdvanceMultipleEntryHref}/add`} className={moduleHeaderActionClassNames.primary}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start New Cash Advances Multiple Entry
      </Link>
    </>
  );
}

const CashAdvanceMultipleEntryListOverflowItems = [
  {
    icon: Upload,
    label: "Upload",
    onSelect: () => undefined,
    type: "button",
  },
  {
    icon: Download,
    label: "Export",
    onSelect: () => undefined,
    type: "button",
  },
] satisfies ModuleActionMenuItem[];

function CashAdvanceMultipleEntryMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: (typeof CashAdvanceMultipleEntryStatusFilters)[number]) => void;
  records: CashAdvanceMultipleEntryRecord[];
  statusFilter: (typeof CashAdvanceMultipleEntryStatusFilters)[number];
}) {
  const postedCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.posted);
  const disapprovedCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.disapproved);
  const forApprovalCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.forApproval);
  const cancelledCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.cancelled);

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Entries",
          value: records.length,
          summary: "All time",
          icon: ReceiptText,
          iconClassName: "bg-skyblue/20 text-skyblue",
          isActive: statusFilter === "all",
          onClick: () => onStatusFilterChange("all"),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.forApproval,
          value: forApprovalCount,
          summary: formatCashAdvanceMultipleEntryPercentage(forApprovalCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.forApproval,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.forApproval),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.posted,
          value: postedCount,
          summary: formatCashAdvanceMultipleEntryPercentage(postedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.posted,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.posted),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.disapproved,
          value: disapprovedCount,
          summary: formatCashAdvanceMultipleEntryPercentage(disapprovedCount, records.length),
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.disapproved,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.disapproved),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.cancelled,
          value: cancelledCount,
          summary: formatCashAdvanceMultipleEntryPercentage(cancelledCount, records.length),
          icon: Ban,
          iconClassName: "bg-skyblue/15 text-skyblue",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.cancelled,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.cancelled),
        },
      ]}
    />
  );
}

function CashAdvanceMultipleEntryStatusBadge({ status }: { status: CashAdvanceStatus }) {
  const Icon = statusIconByStatus[status];

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusClassNameByStatus[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

const statusIconByStatus = {
  [CashAdvanceMultipleEntryStatuses.cancelled]: Ban,
  [CashAdvanceMultipleEntryStatuses.disapproved]: XCircle,
  [CashAdvanceMultipleEntryStatuses.draft]: Clock3,
  [CashAdvanceMultipleEntryStatuses.forApproval]: Clock3,
  [CashAdvanceMultipleEntryStatuses.posted]: PackageCheck,
} satisfies Record<CashAdvanceStatus, LucideIcon>;

const statusClassNameByStatus = {
  [CashAdvanceMultipleEntryStatuses.cancelled]: "bg-darknavy/10 text-darknavy/70",
  [CashAdvanceMultipleEntryStatuses.disapproved]: "bg-coralpink/15 text-coralpink",
  [CashAdvanceMultipleEntryStatuses.draft]: "bg-offwhite text-darknavy/70",
  [CashAdvanceMultipleEntryStatuses.forApproval]: "bg-offwhite text-darknavy",
  [CashAdvanceMultipleEntryStatuses.posted]: "bg-citron/25 text-darknavy",
} satisfies Record<CashAdvanceStatus, string>;
