"use client";

import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import {
  Plus,
  ReceiptText,
  Search } from "lucide-react";
import { countCashAdvancesByStatus } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import {
  CashAdvanceAllStatusFilter,
  CashAdvanceStatusFilters,
  CashAdvanceStatuses,
  CashAdvanceTablePaginationStorageKey,
  getCashAdvanceTableMinWidthClassName,
  CashAdvanceAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { useCashAdvanceStore, useCashAdvanceTable } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type { CashAdvanceRecord, CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceTableToolbar";
import { renderCashAdvanceTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
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

      <CashAdvanceMetrics records={advances} statusFilter={tableState.statusFilter} onStatusFilterChange={tableState.setStatusFilter} />

      <div data-spotlight-id="maintenance-table">
        <ModuleTable
          emptyDescription="Try another cash advance no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Advance Transaction Found."
          minWidthClassName={getCashAdvanceTableMinWidthClassName(tableState.table.getVisibleLeafColumns().length)}
          paginationLabel="entries"
          paginationStorageKey={CashAdvanceTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          pageSizeOptions={[5, 10, 15, 20, 25, 50]}
          table={tableState.table}
          tableTitle="Cash Advances"
          useColumnSizing
          toolbar={<CashAdvanceTableToolbar tableState={tableState} />}
          renderRow={(row) => <CashAdvanceTableRow key={row.id} row={row} onUpdateStatus={updateAdvanceStatus} />}
        />
      </div>
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
        <td key={cell.id} className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}>
          {renderCashAdvanceTableCell(cell.column.id, row.original, () => (
            <CashAdvanceRecordActions record={row.original} onUpdateStatus={onUpdateStatus} />
          ))}
        </td>
      ))}
    </tr>
  );
}

function CashAdvanceListHeaderActions() {
  return (
    <Link href={CashAdvanceAddLink} className={moduleHeaderActionClassNames.primary} data-spotlight-id="maintenance-create-record">
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
          isActive: statusFilter === CashAdvanceAllStatusFilter,
          onClick: () => onStatusFilterChange(CashAdvanceAllStatusFilter),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.draft),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.draft),
          tone: "blue",
          label: CashAdvanceStatuses.draft,
          summary: formatPartOfTotalPercentage(draftCount, records.length),
          value: draftCount,
          isActive: statusFilter === CashAdvanceStatuses.draft,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.draft),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.forApproval),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.forApproval),
          tone: "amber",
          label: CashAdvanceStatuses.forApproval,
          summary: formatPartOfTotalPercentage(forApprovalCount, records.length),
          value: forApprovalCount,
          isActive: statusFilter === CashAdvanceStatuses.forApproval,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.forApproval),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.posted),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.posted),
          tone: "emerald",
          label: CashAdvanceStatuses.posted,
          summary: formatPartOfTotalPercentage(postedCount, records.length),
          value: postedCount,
          isActive: statusFilter === CashAdvanceStatuses.posted,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.posted),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.disapproved),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.disapproved),
          tone: "red",
          label: CashAdvanceStatuses.disapproved,
          summary: formatPartOfTotalPercentage(disapprovedCount, records.length),
          value: disapprovedCount,
          isActive: statusFilter === CashAdvanceStatuses.disapproved,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.disapproved),
        },
        {
          icon: getModuleStatusMetricIcon(CashAdvanceStatuses.cancelled),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceStatuses.cancelled),
          tone: "slate",
          label: CashAdvanceStatuses.cancelled,
          summary: formatPartOfTotalPercentage(cancelledCount, records.length),
          value: cancelledCount,
          isActive: statusFilter === CashAdvanceStatuses.cancelled,
          onClick: () => onStatusFilterChange(CashAdvanceStatuses.cancelled),
        },
      ]}
    />
  );
}
