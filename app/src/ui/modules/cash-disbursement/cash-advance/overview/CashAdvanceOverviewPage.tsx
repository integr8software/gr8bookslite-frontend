"use client";

import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  countCashAdvancesByStatus,
  formatCashAdvanceCurrency,
  formatCashAdvanceDate,
  formatCashAdvancePercentage,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceHref,
  CashAdvanceStatusFilterOptions,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
  CashAdvanceTablePaginationStorageKey,
  getCashAdvanceTableMinWidthClassName,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  useCashAdvanceStore,
  useCashAdvanceTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type {
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
  ModuleStatusBadge,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
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
import { CashAdvanceRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceRecordActions";

export function CashAdvanceOverviewPage() {
  const { advances, lastSyncedAt, updateAdvanceStatus } = useCashAdvanceStore();
  const tableState = useCashAdvanceTable(advances);

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
        actions={<CashAdvanceListHeaderActions />}
      />

      <CashAdvanceMetrics
        records={advances}
        statusFilter={tableState.statusFilter}
        onStatusFilterChange={tableState.setStatusFilter}
      />

      <ModuleTable
        emptyDescription="Try another cash advance no., remarks, date range, amount range, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Cash Advance Transaction Found."
        minWidthClassName={getCashAdvanceTableMinWidthClassName(
          tableState.table.getVisibleLeafColumns().length,
        )}
        paginationLabel="entries"
        paginationStorageKey={CashAdvanceTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Cash Advances"
        toolbar={
          <ModuleTableToolbar className="!grid-cols-1 !gap-2 !p-3 sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
              <ModuleTableSearch
                label="Search cash advances"
                placeholder="Search by transaction no., party, account, or remarks"
                value={tableState.query}
                onChange={tableState.setQuery}
              />
              <DateRangePicker
                label="Date Range"
                value={tableState.dateRange}
                onChange={tableState.setDateRange}
              />
              <AmountRangePicker
                label="Total Amount"
                value={tableState.amountRange}
                onChange={tableState.setAmountRange}
              />
              <ModuleTableFilterSelect
                label="Status"
                value={tableState.statusFilter}
                options={CashAdvanceStatusFilterOptions}
                onChange={(value) =>
                  tableState.setStatusFilter(
                    value as Parameters<typeof tableState.setStatusFilter>[0],
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2 xl:w-[7rem]">
              <ModuleTableColumnVisibilityButton table={tableState.table} />
              <ModuleTableResetButton
                className="px-2"
                onClick={tableState.resetFilters}
              >
                <span className="sr-only">Reset filters</span>
              </ModuleTableResetButton>
            </div>
          </ModuleTableToolbar>
        }
        renderRow={(row) => (
          <CashAdvanceTableRow
            key={row.id}
            row={row}
            onUpdateStatus={updateAdvanceStatus}
          />
        )}
      />
    </section>
  );
}

function CashAdvanceTableRow({
  onUpdateStatus,
  row,
}: {
  onUpdateStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
  row: Row<CashAdvanceRecord>;
}) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={joinClasses(
            "px-4 py-4 align-top",
            getColumnMetaClassName(cell.column.columnDef.meta),
          )}
        >
          <CashAdvanceCellContent
            columnId={cell.column.id}
            record={row.original}
            onUpdateStatus={onUpdateStatus}
          />
        </td>
      ))}
    </tr>
  );
}

function CashAdvanceCellContent({
  columnId,
  onUpdateStatus,
  record,
}: {
  columnId: string;
  onUpdateStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
  record: CashAdvanceRecord;
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
    case "accountCode":
      return <span className="font-semibold text-darknavy">{record.accountCode || ""}</span>;
    case "accountTitle":
      return (
        <div className="text-darknavy">
          <p>{getCashAdvanceAccountTitle(record.accountCode)}</p>
        </div>
      );
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{record.remarks || ""}</span>;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCashAdvanceCurrency(record.amount)}</span>;
    case "currency":
      return <span className="font-semibold text-darknavy">{record.formValues?.currency ?? "PHP"}</span>;
    case "status":
      return (
        <div className="flex w-full justify-center">
          <CashAdvanceStatusBadge status={record.status} />
        </div>
      );
    case "createdBy":
      return record.createdBy ?? "";
    case "createdAt":
      return formatCashAdvanceAuditDate(record.createdAt);
    case "updatedBy":
      return record.updatedBy ?? "";
    case "updatedAt":
      return formatCashAdvanceAuditDate(record.updatedAt);
    case "actions":
      return <CashAdvanceRecordActions record={record} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function formatCashAdvanceAuditDate(value?: string) {
  return value ? formatCashAdvanceDate(value) : "";
}

function getCashAdvanceAccountTitle(accountCode: string) {
  return CashAdvanceAccountOptions.find((option) => option.value === accountCode)?.label ?? accountCode;
}

function CashAdvanceListHeaderActions() {
  return (
    <Link href={`${CashAdvanceHref}/add`} className={moduleHeaderActionClassNames.primary}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Start New Cash Advance
    </Link>
  );
}

function CashAdvanceMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: (typeof CashAdvanceStatusFilters)[number]) => void;
  records: CashAdvanceRecord[];
  statusFilter: (typeof CashAdvanceStatusFilters)[number];
}) {
  const draftCount = countCashAdvancesByStatus(records, CashAdvanceStatuses.draft);
  const forApprovalCount = countCashAdvancesByStatus(records, CashAdvanceStatuses.forApproval);
  const postedCount = countCashAdvancesByStatus(records, CashAdvanceStatuses.posted);
  const disapprovedCount = countCashAdvancesByStatus(records, CashAdvanceStatuses.disapproved);
  const cancelledCount = countCashAdvancesByStatus(records, CashAdvanceStatuses.cancelled);

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          icon: ReceiptText,
          label: "Total Entries",
          summary: "All time",
          tone: "violet",
          value: records.length,
          isActive: statusFilter === "all",
          onClick: () => onStatusFilterChange("all"),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.draft),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.draft),
          tone: "blue",
          label: CashAdvanceStatuses.draft,
          summary: formatCashAdvancePercentage(draftCount, records.length),
          value: draftCount,
          isActive: statusFilter === CashAdvanceStatuses.draft,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.draft),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.forApproval),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.forApproval),
          tone: "amber",
          label: CashAdvanceStatuses.forApproval,
          summary: formatCashAdvancePercentage(forApprovalCount, records.length),
          value: forApprovalCount,
          isActive: statusFilter === CashAdvanceStatuses.forApproval,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.forApproval),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.posted),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.posted),
          tone: "emerald",
          label: CashAdvanceStatuses.posted,
          summary: formatCashAdvancePercentage(postedCount, records.length),
          value: postedCount,
          isActive: statusFilter === CashAdvanceStatuses.posted,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.posted),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.disapproved),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.disapproved),
          tone: "red",
          label: CashAdvanceStatuses.disapproved,
          summary: formatCashAdvancePercentage(disapprovedCount, records.length),
          value: disapprovedCount,
          isActive: statusFilter === CashAdvanceStatuses.disapproved,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.disapproved),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.cancelled),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.cancelled),
          tone: "slate",
          label: CashAdvanceStatuses.cancelled,
          summary: formatCashAdvancePercentage(cancelledCount, records.length),
          value: cancelledCount,
          isActive: statusFilter === CashAdvanceStatuses.cancelled,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.cancelled),
        },
      ]}
    />
  );
}

function CashAdvanceStatusBadge({ status }: { status: CashAdvanceStatus }) {
  return <ModuleStatusBadge status={status} />;
}
