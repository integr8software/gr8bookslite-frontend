"use client";

import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  CashAdvanceMultipleEntryAllStatusFilter,
  CashAdvanceMultipleEntryStatusFilters,
  CashAdvanceMultipleEntryStatuses,
  CashAdvanceMultipleEntryTablePaginationStorageKey,
  CashAdvanceMultipleEntryAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { countCashAdvanceMultipleEntriesByStatus } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  useCashAdvanceMultipleEntryStore,
  useCashAdvanceMultipleEntryTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { CashAdvanceMultipleEntryRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryRecordActions";
import { CashAdvanceMultipleEntryTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryTableToolbar";
import { renderCashAdvanceMultipleEntryTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

export function CashAdvanceMultipleEntryOverviewPage() {
  const { entries, lastSyncedAt, updateEntryStatus } = useCashAdvanceMultipleEntryStore();
  const tableState = useCashAdvanceMultipleEntryTable(entries);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Advance Multiple Entry"
        description="Search Cash Advance Multiple Entry records and open add, view, or edit forms."
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

      <div data-spotlight-id="maintenance-table">
        <ModuleTable
          emptyDescription="Try another cash advance entry no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Advance Multiple Entry Transaction Found."
          minWidthClassName={getCashAdvanceMultipleEntryTableMinWidthClassName(tableState.table.getVisibleLeafColumns().length)}
          paginationLabel="entries"
          paginationStorageKey={CashAdvanceMultipleEntryTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          pageSizeOptions={[5, 10, 15, 20, 25, 50]}
          table={tableState.table}
          tableTitle="Cash Advances Multiple Entries"
          useColumnSizing
          toolbar={<CashAdvanceMultipleEntryTableToolbar tableState={tableState} />}
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}>
                  {renderCashAdvanceMultipleEntryTableCell(cell.column.id, row.original, () => (
                    <CashAdvanceMultipleEntryRecordActions record={row.original} onUpdateStatus={updateEntryStatus} />
                  ))}
                </td>
              ))}
            </tr>
          )}
        />
      </div>
    </section>
  );
}
function getCashAdvanceMultipleEntryTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[158rem]";
  if (visibleColumnCount >= 10) return "min-w-[126rem]";
  return "min-w-[82rem]";
}

function CashAdvanceMultipleEntryListHeaderActions() {
  return (
    <Link
      href={CashAdvanceMultipleEntryAddLink}
      className={moduleHeaderActionClassNames.primary}
      data-spotlight-id="maintenance-create-record"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Start New Cash Advance Multiple Entry
    </Link>
  );
}

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
  const draftCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.draft);
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
          tone: "violet",
          isActive: statusFilter === CashAdvanceMultipleEntryAllStatusFilter,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryAllStatusFilter),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.draft,
          value: draftCount,
          summary: formatPartOfTotalPercentage(draftCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.draft),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.draft),
          tone: "blue",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.draft,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.draft),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.forApproval,
          value: forApprovalCount,
          summary: formatPartOfTotalPercentage(forApprovalCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.forApproval),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.forApproval),
          tone: "amber",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.forApproval,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.forApproval),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.posted,
          value: postedCount,
          summary: formatPartOfTotalPercentage(postedCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.posted),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.posted),
          tone: "emerald",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.posted,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.posted),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.disapproved,
          value: disapprovedCount,
          summary: formatPartOfTotalPercentage(disapprovedCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.disapproved),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.disapproved),
          tone: "red",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.disapproved,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.disapproved),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.cancelled,
          value: cancelledCount,
          summary: formatPartOfTotalPercentage(cancelledCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.cancelled),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.cancelled),
          tone: "slate",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.cancelled,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.cancelled),
        },
      ]}
    />
  );
}
