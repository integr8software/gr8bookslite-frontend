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
  Upload,
  XCircle,
} from "lucide-react";
import {
  countOfficialReceiptsByStatus,
  formatOfficialReceiptCurrency,
  formatOfficialReceiptDate,
  formatOfficialReceiptPercentage,
  isOfficialReceiptActiveStatus,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import {
  OfficialReceiptHref,
  OfficialReceiptStatusFilterOptions,
  OfficialReceiptTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import {
  useOfficialReceiptStore,
  useOfficialReceiptTable,
} from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import type {
  OfficialReceiptRecord,
  OfficialReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
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

export function OfficialReceiptListPage() {
  const { lastSyncedAt, receipts } = useOfficialReceiptStore();
  const tableState = useOfficialReceiptTable(receipts);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Official Receipt"
        description="Search collection sources, preview linked official receipts, and create or update receipt entries."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash receipt
          </>
        }
        actions={
          <>
            <button type="button" className={moduleHeaderActionClassNames.secondary}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
            </button>
            <button type="button" className={moduleHeaderActionClassNames.secondary}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
            <Link href={`${OfficialReceiptHref}/add`} className={moduleHeaderActionClassNames.primary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Start New Official Receipt
            </Link>
          </>
        }
      />

      <OfficialReceiptMetrics records={receipts} />

      <ModuleTable
        emptyDescription="Try a different customer, receipt number, reference, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No receipts matched"
        minWidthClassName="min-w-[87rem]"
        paginationLabel="entries"
        paginationStorageKey={OfficialReceiptTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Receipt entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search official receipts"
              value={tableState.query}
              onChange={tableState.setQuery}
              placeholder="Search by receipt no., reference no., customer, or collection type"
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
              options={OfficialReceiptStatusFilterOptions}
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
            <td className="px-4 py-4 font-semibold text-skyblue">{original.receiptNo}</td>
            <td className="px-4 py-4">{formatOfficialReceiptDate(original.receiptDate)}</td>
            <td className="px-4 py-4">{original.customerName}</td>
            <td className="px-4 py-4">{original.collectionType}</td>
            <td className="px-4 py-4">{original.referenceNo}</td>
            <td className="px-4 py-4 font-semibold text-darknavy">
              {formatOfficialReceiptCurrency(original.amount)}
            </td>
            <td className="px-4 py-4">
              <OfficialReceiptStatusBadge status={original.status} />
            </td>
            <td className="px-4 py-4 text-center">
              <div className="inline-flex items-center gap-2">
                <Link
                  href={`${OfficialReceiptHref}/view/${original.id}`}
                  className="rounded-md border border-darknavy/10 bg-white px-3 py-1.5 text-xs font-semibold text-darknavy/70 shadow-sm transition hover:border-skyblue/40 hover:text-darknavy"
                >
                  View
                </Link>
                <Link
                  href={`${OfficialReceiptHref}/edit/${original.id}`}
                  className="rounded-md bg-skyblue px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Edit
                </Link>
              </div>
            </td>
          </tr>
        )}
      />
    </section>
  );
}

function OfficialReceiptMetrics({
  records,
}: {
  records: OfficialReceiptRecord[];
}) {
  const activeCount = records.filter((record) =>
    isOfficialReceiptActiveStatus(record.status),
  ).length;
  const approvedCount = countOfficialReceiptsByStatus(records, "Approved");
  const disapprovedCount = countOfficialReceiptsByStatus(records, "Disapproved");
  const pendingCount = countOfficialReceiptsByStatus(records, "Pending");
  const closedCount = countOfficialReceiptsByStatus(records, "Closed");

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Receipts",
          value: records.length,
          summary: "All time",
          icon: ReceiptText,
          iconClassName: "bg-skyblue/20 text-skyblue",
        },
        {
          label: "Active",
          value: activeCount,
          summary: formatOfficialReceiptPercentage(activeCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Pending",
          value: pendingCount,
          summary: formatOfficialReceiptPercentage(pendingCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Approved",
          value: approvedCount,
          summary: formatOfficialReceiptPercentage(approvedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Disapproved",
          value: disapprovedCount,
          summary: formatOfficialReceiptPercentage(
            disapprovedCount,
            records.length,
          ),
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
        },
        {
          label: "Closed",
          value: closedCount,
          summary: formatOfficialReceiptPercentage(closedCount, records.length),
          icon: PackageCheck,
          iconClassName: "bg-skyblue/15 text-skyblue",
        },
      ]}
    />
  );
}

function OfficialReceiptStatusBadge({
  status,
}: {
  status: OfficialReceiptStatus;
}) {
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
  Active: CheckCircle2,
  Approved: CheckCircle2,
  Cancelled: Ban,
  Closed: PackageCheck,
  Disapproved: XCircle,
  Draft: Clock3,
  Pending: Clock3,
} satisfies Record<OfficialReceiptStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Active: "bg-citron/25 text-darknavy",
  Approved: "bg-citron/25 text-darknavy",
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Closed: "bg-skyblue/20 text-darknavy",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  Pending: "bg-offwhite text-darknavy",
} satisfies Record<OfficialReceiptStatus, string>;
