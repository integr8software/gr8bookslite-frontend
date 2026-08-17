"use client";

import Link from "next/link";
import { Ban, CheckCircle2, Clock3, Download, PackageCheck, Plus, ReceiptText, Search, Upload, XCircle } from "lucide-react";
import {
  countAcknowledgementReceiptsByStatus,
  formatAcknowledgementReceiptCurrency,
  formatAcknowledgementReceiptDate,
  formatAcknowledgementReceiptPercentage,
  isAcknowledgementReceiptActiveStatus,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import {
  AcknowledgementReceiptHref,
  AcknowledgementReceiptStatusFilterOptions,
  AcknowledgementReceiptTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import {
  useAcknowledgementReceiptStore,
  useAcknowledgementReceiptTable,
} from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceipt";
import type {
  AcknowledgementReceiptRecord,
  AcknowledgementReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AcknowledgementReceiptRecordActions } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptRecordActions";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function AcknowledgementReceiptListPage() {
  const { lastSyncedAt, receipts, updateReceiptStatus } = useAcknowledgementReceiptStore();
  const tableState = useAcknowledgementReceiptTable(receipts);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Acknowledgement Receipt"
        description="Search collection sources, preview linked Acknowledgement Receipts, and create or update receipt entries."
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
            <Link href={`${AcknowledgementReceiptHref}/add`} className={moduleHeaderActionClassNames.primary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Start New Acknowledgement Receipt
            </Link>
          </>
        }
      />

      <AcknowledgementReceiptMetrics records={receipts} />

      <ModuleTable
        emptyDescription="Try a different customer, receipt number, reference, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No receipts matched"
        minWidthClassName="min-w-[87rem]"
        paginationLabel="entries"
        paginationStorageKey={AcknowledgementReceiptTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Receipt entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search Acknowledgement Receipts"
              value={tableState.query}
              onChange={tableState.setQuery}
              placeholder="Search by receipt no., reference no., customer, or collection type"
            />
            <DateRangePicker label="Date Range" value={tableState.dateRange} onChange={tableState.setDateRange} />
            <AmountRangePicker label="Total Amount" value={tableState.amountRange} onChange={tableState.setAmountRange} />
            <ModuleTableFilterSelect
              label="Status"
              value={tableState.statusFilter}
              options={AcknowledgementReceiptStatusFilterOptions}
              onChange={(value) => tableState.setStatusFilter(value as Parameters<typeof tableState.setStatusFilter>[0])}
            />
            <ModuleTableResetButton onClick={tableState.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => (
          <tr key={id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            <td className="px-4 py-4 font-semibold text-skyblue">{original.receiptNo}</td>
            <td className="px-4 py-4">{formatAcknowledgementReceiptDate(original.receiptDate)}</td>
            <td className="px-4 py-4">{original.partyCode}</td>
            <td className="px-4 py-4">{original.customerName}</td>
            <td className="px-4 py-4">{original.collectionType}</td>
            <td className="px-4 py-4">{original.referenceNo}</td>
            <td className="px-4 py-4 font-semibold text-darknavy">{formatAcknowledgementReceiptCurrency(original.amount)}</td>
            <td className="px-4 py-4">
              <AcknowledgementReceiptStatusBadge status={original.status} />
            </td>
            <td className="px-4 py-4 text-center">
              <AcknowledgementReceiptRecordActions record={original} onUpdateStatus={updateReceiptStatus} />
            </td>
          </tr>
        )}
      />
    </section>
  );
}

function AcknowledgementReceiptMetrics({ records }: { records: AcknowledgementReceiptRecord[] }) {
  const activeCount = records.filter((record) => isAcknowledgementReceiptActiveStatus(record.status)).length;
  const approvedCount = countAcknowledgementReceiptsByStatus(records, "Approved");
  const disapprovedCount = countAcknowledgementReceiptsByStatus(records, "Disapproved");
  const pendingCount = countAcknowledgementReceiptsByStatus(records, "Pending");
  const closedCount = countAcknowledgementReceiptsByStatus(records, "Closed");

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
          summary: formatAcknowledgementReceiptPercentage(activeCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Pending",
          value: pendingCount,
          summary: formatAcknowledgementReceiptPercentage(pendingCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Approved",
          value: approvedCount,
          summary: formatAcknowledgementReceiptPercentage(approvedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Disapproved",
          value: disapprovedCount,
          summary: formatAcknowledgementReceiptPercentage(disapprovedCount, records.length),
          icon: XCircle,
          iconClassName: "bg-coralpink/15 text-coralpink",
        },
        {
          label: "Closed",
          value: closedCount,
          summary: formatAcknowledgementReceiptPercentage(closedCount, records.length),
          icon: PackageCheck,
          iconClassName: "bg-skyblue/15 text-skyblue",
        },
      ]}
    />
  );
}

function AcknowledgementReceiptStatusBadge({ status }: { status: AcknowledgementReceiptStatus }) {
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
} satisfies Record<AcknowledgementReceiptStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Active: "bg-citron/25 text-darknavy",
  Approved: "bg-citron/25 text-darknavy",
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Closed: "bg-skyblue/20 text-darknavy",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  Pending: "bg-offwhite text-darknavy",
} satisfies Record<AcknowledgementReceiptStatus, string>;
