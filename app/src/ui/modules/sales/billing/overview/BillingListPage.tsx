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
  Upload,
  XCircle,
} from "lucide-react";
import {
  countBillingsByStatus,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingPercentage,
  isBillingActiveStatus,
} from "@/app/src/data/modules/sales/billing/BillingData";
import {
  BillingHref,
  BillingStatusFilterOptions,
  BillingTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/billing/BillingConstants";
import {
  useBillingStore,
  useBillingTable,
} from "@/app/src/hooks/modules/sales/billing/useBilling";
import type {
  BillingRecord,
  BillingStatus,
} from "@/app/src/types/modules/sales/billing/BillingTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { BillingRecordActions } from "@/app/src/ui/modules/sales/billing/overview/BillingRecordActions";

export function BillingListPage() {
  const { invoices, lastSyncedAt, updateInvoiceStatus } = useBillingStore();
  const tableState = useBillingTable(invoices);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Billing"
        description="Prepare billing, tax amounts, project references, and billing line entries."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales
          </>
        }
        actions={<BillingListHeaderActions />}
      />

      <BillingMetrics records={invoices} />

      <ModuleTable
        emptyDescription="Try a different transaction number, customer, invoice, reference, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No billings matched"
        minWidthClassName="min-w-[88rem]"
        paginationLabel="entries"
        paginationStorageKey={BillingTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Billing entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search billings"
              value={tableState.query}
              onChange={tableState.setQuery}
              placeholder="Search by trans no., customer, invoice no., or reference"
            />
            <DateRangePicker
              label="Date Range"
              value={tableState.dateRange}
              onChange={tableState.setDateRange}
            />
            <AmountRangePicker
              label="Gross Amount"
              value={tableState.amountRange}
              onChange={tableState.setAmountRange}
            />
            <ModuleTableFilterSelect
              label="Status"
              value={tableState.statusFilter}
              options={BillingStatusFilterOptions}
              onChange={(value) =>
                tableState.setStatusFilter(
                  value as Parameters<typeof tableState.setStatusFilter>[0],
                )
              }
            />
            <ModuleTableResetButton onClick={tableState.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => (
          <tr key={id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            <td className="px-4 py-4 font-semibold text-skyblue">{original.transactionNo}</td>
            <td className="px-4 py-4">{formatBillingDate(original.documentDate)}</td>
            <td className="px-4 py-4">{original.customerName}</td>
            <td className="px-4 py-4">{original.invoiceNo}</td>
            <td className="px-4 py-4">{original.referenceNo}</td>
            <td className="px-4 py-4 font-semibold text-darknavy">
              {formatBillingCurrency(original.amount)}
            </td>
            <td className="px-4 py-4">
              <BillingStatusBadge status={original.status} />
            </td>
            <td className="px-4 py-4 text-center">
              <BillingRecordActions record={original} onUpdateStatus={updateInvoiceStatus} />
            </td>
          </tr>
        )}
      />
    </section>
  );
}

function BillingListHeaderActions() {
  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          className="[&>button]:h-10 [&>button]:w-10"
          items={BillingListOverflowItems}
          label="Billing list actions"
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
      <Link href={`${BillingHref}/add`} className={moduleHeaderActionClassNames.primary}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start New Billing
      </Link>
    </>
  );
}

const BillingListOverflowItems = [
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

function BillingMetrics({ records }: { records: BillingRecord[] }) {
  const activeCount = records.filter((record) =>
    isBillingActiveStatus(record.status),
  ).length;
  const postedCount = countBillingsByStatus(records, "Posted");
  const disapprovedCount = countBillingsByStatus(records, "Disapproved");
  const forApprovalCount = countBillingsByStatus(records, "For Approval");
  const cancelledCount = countBillingsByStatus(records, "Cancelled");

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Billings",
          value: records.length,
          summary: "All time",
          icon: FileText,
          iconClassName: "bg-skyblue/20 text-skyblue",
        },
        {
          label: "Active",
          value: activeCount,
          summary: formatBillingPercentage(activeCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "For Approval",
          value: forApprovalCount,
          summary: formatBillingPercentage(forApprovalCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Posted",
          value: postedCount,
          summary: formatBillingPercentage(postedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Disapproved",
          value: disapprovedCount,
          summary: formatBillingPercentage(disapprovedCount, records.length),
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
        },
        {
          label: "Cancelled",
          value: cancelledCount,
          summary: formatBillingPercentage(cancelledCount, records.length),
          icon: Ban,
          iconClassName: "bg-skyblue/15 text-skyblue",
        },
      ]}
    />
  );
}

function BillingStatusBadge({ status }: { status: BillingStatus }) {
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
} satisfies Record<BillingStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-offwhite text-darknavy",
  Posted: "bg-citron/25 text-darknavy",
} satisfies Record<BillingStatus, string>;
