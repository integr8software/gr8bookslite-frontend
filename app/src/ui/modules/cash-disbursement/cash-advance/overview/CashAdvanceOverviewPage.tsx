"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Plus,
  ReceiptText,
  Save,
  Search,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import {
  countCashAdvancesByStatus,
  formatCashAdvanceCurrency,
  formatCashAdvanceDate,
  formatCashAdvancePercentage,
  getCashAdvanceStatusLabel,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import {
  CashAdvanceHref,
  CashAdvanceStatusFilterOptions,
  CashAdvanceStatusFilters,
  CashAdvanceTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  useCashAdvanceStore,
  useCashAdvanceTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type {
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceFormPanel } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceContent";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { CashAdvanceRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceRecordActions";

export function CashAdvanceOverviewPage() {
  const { advances, lastSyncedAt } = useCashAdvanceStore();
  const tableState = useCashAdvanceTable(advances);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        emptyDescription="Try a different party, transaction number, account, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No cash advances matched"
        minWidthClassName="min-w-[66rem]"
        paginationLabel="entries"
        paginationStorageKey={CashAdvanceTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
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
              {formatCashAdvanceDate(original.documentDate)}
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
              <p>{original.accountCode}</p>
              <p className="mt-1 text-sm text-darknavy/55">{original.costCenter}</p>
            </td>
            <td className="px-4 py-4 align-top text-sm font-semibold text-darknavy">
              {formatCashAdvanceCurrency(original.amount)}
            </td>
            <td className="px-4 py-4 align-top">
              <CashAdvanceStatusBadge status={original.status} />
            </td>
            <td className="px-3 py-4 align-top text-center">
              <CashAdvanceRecordActions
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

function CashAdvanceListHeaderActions() {
  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          className="[&>button]:h-10 [&>button]:w-10"
          items={CashAdvanceListOverflowItems}
          label="Cash advance list actions"
        />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <button type="button" className={moduleHeaderActionClassNames.secondary}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload Attachments
        </button>
      </div>
      <Link href={`${CashAdvanceHref}/add`} className={moduleHeaderActionClassNames.primary}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start New Cash Advance
      </Link>
    </>
  );
}

const CashAdvanceListOverflowItems = [
  {
    icon: Upload,
    label: "Upload Attachments",
    onSelect: () => undefined,
    type: "button",
  },
] satisfies ModuleActionMenuItem[];

function CashAdvanceMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: (typeof CashAdvanceStatusFilters)[number]) => void;
  records: CashAdvanceRecord[];
  statusFilter: (typeof CashAdvanceStatusFilters)[number];
}) {
  const draftCount = countCashAdvancesByStatus(records, "Draft");
  const approvedCount = countCashAdvancesByStatus(records, "Approved");
  const pendingCount = countCashAdvancesByStatus(records, "Pending Review");
  const rejectedCount = countCashAdvancesByStatus(records, "Rejected");
  const cancelledCount = countCashAdvancesByStatus(records, "Cancelled");

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          icon: ReceiptText,
          iconClassName: "bg-skyblue/20 text-skyblue",
          label: "Total Transaction",
          summary: "All time",
          value: records.length,
          isActive: statusFilter === "all",
          onClick: () => onStatusFilterChange("all"),
        },
        {
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
          label: "Draft",
          summary: formatCashAdvancePercentage(draftCount, records.length),
          value: draftCount,
          isActive: statusFilter === "Draft",
          onClick: () => onStatusFilterChange("Draft"),
        },
        {
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
          label: "For Approval",
          summary: formatCashAdvancePercentage(pendingCount, records.length),
          value: pendingCount,
          isActive: statusFilter === "Pending Review",
          onClick: () => onStatusFilterChange("Pending Review"),
        },
        {
          icon: PackageCheck,
          iconClassName: "bg-skyblue/20 text-darknavy",
          label: "Posted",
          summary: formatCashAdvancePercentage(approvedCount, records.length),
          value: approvedCount,
          isActive: statusFilter === "Approved",
          onClick: () => onStatusFilterChange("Approved"),
        },
        {
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
          label: "Disapproved",
          summary: formatCashAdvancePercentage(rejectedCount, records.length),
          value: rejectedCount,
          isActive: statusFilter === "Rejected",
          onClick: () => onStatusFilterChange("Rejected"),
        },
        {
          icon: XCircle,
          iconClassName: "bg-slate-100 text-slate-700",
          label: "Cancelled",
          summary: formatCashAdvancePercentage(cancelledCount, records.length),
          value: cancelledCount,
          isActive: statusFilter === "Cancelled",
          onClick: () => onStatusFilterChange("Cancelled"),
        },
      ]}
    />
  );
}

function CashAdvanceStatusBadge({ status }: { status: CashAdvanceStatus }) {
  const Icon = statusIconByStatus[status];

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusClassNameByStatus[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {getCashAdvanceStatusLabel(status)}
    </span>
  );
}

const statusIconByStatus = {
  Approved: CheckCircle2,
  Cancelled: XCircle,
  Draft: Clock3,
  "Pending Review": Clock3,
  Rejected: XCircle,
} satisfies Record<CashAdvanceStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Approved: "bg-citron/25 text-darknavy",
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Draft: "bg-offwhite text-darknavy/70",
  "Pending Review": "bg-offwhite text-darknavy",
  Rejected: "bg-coralpink/15 text-coralpink",
} satisfies Record<CashAdvanceStatus, string>;
