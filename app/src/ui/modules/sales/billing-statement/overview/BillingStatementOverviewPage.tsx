"use client";

import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Plus,
  Search,
  XCircle,
  Upload,
} from "lucide-react";
import {
  BillingStatementHref,
  BillingStatementStatusFilterOptions,
  BillingStatementTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import {
  countBillingStatementsByStatus,
  formatBillingStatementDate,
  formatBillingStatementMoney,
  formatBillingStatementPercentage,
  isBillingStatementActiveStatus,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import { useBillingStatementListPage } from "@/app/src/hooks/modules/sales/billing-statement/useBillingStatementListPage";
import type {
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
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
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { BillingStatementRecordActions } from "@/app/src/ui/modules/sales/billing-statement/overview/BillingStatementRecordActions";

export function BillingStatementOverviewPage() {
  const {
    amountRange,
    dateRange,
    lastSyncedAt,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statements,
    statusFilter,
    table,
    updateStatementStatus,
  } = useBillingStatementListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Billing Statement"
        description="Prepare billing statements, review customer references, and manage billing item entries."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales document
          </>
        }
        actions={<BillingStatementListHeaderActions />}
      />

      <BillingStatementMetrics records={statements} />

      <ModuleTable
        emptyDescription="Try a different transaction number, customer, invoice, reference, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No billing statements matched"
        minWidthClassName="min-w-[88rem]"
        paginationLabel="entries"
        paginationStorageKey={BillingStatementTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={table}
        tableTitle="Billing statement entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search billing statements"
              value={query}
              onChange={setQuery}
              placeholder="Search by trans no., customer, invoice no., or reference"
            />
            <DateRangePicker
              label="Date Range"
              value={dateRange}
              onChange={setDateRange}
            />
            <AmountRangePicker
              label="Gross Amount"
              value={amountRange}
              onChange={setAmountRange}
            />
            <ModuleTableFilterSelect
              label="Status"
              value={statusFilter}
              options={BillingStatementStatusFilterOptions}
              onChange={(value) =>
                setStatusFilter(value as Parameters<typeof setStatusFilter>[0])
              }
            />
            <ModuleTableResetButton onClick={resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => (
          <tr key={id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            <td className="px-4 py-4 font-semibold text-skyblue">{original.transNo}</td>
            <td className="px-4 py-4">{formatBillingStatementDate(original.documentDate)}</td>
            <td className="px-4 py-4">{original.name}</td>
            <td className="px-4 py-4">{original.invoiceNo || "-"}</td>
            <td className="px-4 py-4">{original.refNo || original.poNo || original.joNo || "-"}</td>
            <td className="px-4 py-4 font-semibold text-darknavy">
              {formatBillingStatementMoney(original.grossAmount)}
            </td>
            <td className="px-4 py-4">
              <BillingStatementStatusBadge status={original.status} />
            </td>
            <td className="px-4 py-4 text-center">
              <BillingStatementRecordActions
                statement={original}
                onUpdateStatus={updateStatementStatus}
              />
            </td>
          </tr>
        )}
      />

    </section>
  );
}

function BillingStatementListHeaderActions() {
  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          className="[&>button]:h-10 [&>button]:w-10"
          items={BillingStatementListOverflowItems}
          label="Billing statement list actions"
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
      <Link href={`${BillingStatementHref}/add`} className={moduleHeaderActionClassNames.primary}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start New Billing Statement
      </Link>
    </>
  );
}

const BillingStatementListOverflowItems = [
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

function BillingStatementMetrics({ records }: { records: BillingStatementRecord[] }) {
  const activeCount = records.filter((record) =>
    isBillingStatementActiveStatus(record.status),
  ).length;
  const forApprovalCount = countBillingStatementsByStatus(records, "For Approval");
  const postedCount = countBillingStatementsByStatus(records, "Posted");
  const disapprovedCount = countBillingStatementsByStatus(records, "Disapproved");
  const cancelledCount = countBillingStatementsByStatus(records, "Cancelled");

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Statements",
          value: records.length,
          summary: "All time",
          icon: FileText,
          iconClassName: "bg-skyblue/20 text-skyblue",
        },
        {
          label: "Active",
          value: activeCount,
          summary: formatBillingStatementPercentage(activeCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "For Approval",
          value: forApprovalCount,
          summary: formatBillingStatementPercentage(forApprovalCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Posted",
          value: postedCount,
          summary: formatBillingStatementPercentage(postedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Disapproved",
          value: disapprovedCount,
          summary: formatBillingStatementPercentage(disapprovedCount, records.length),
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
        },
        {
          label: "Cancelled",
          value: cancelledCount,
          summary: formatBillingStatementPercentage(cancelledCount, records.length),
          icon: Ban,
          iconClassName: "bg-skyblue/15 text-skyblue",
        },
      ]}
    />
  );
}

function BillingStatementStatusBadge({ status }: { status: BillingStatementStatus }) {
  const Icon = statusIconByStatus[status] ?? Clock3;

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusClassNameByStatus[status] ?? "bg-offwhite text-darknavy/70",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

const statusIconByStatus = {
  Cancelled: Ban,
  Disapproved: XCircle,
  Draft: Clock3,
  "For Approval": Clock3,
  Posted: CheckCircle2,
} satisfies Record<BillingStatementStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-offwhite text-darknavy",
  Posted: "bg-citron/25 text-darknavy",
} satisfies Record<BillingStatementStatus, string>;
