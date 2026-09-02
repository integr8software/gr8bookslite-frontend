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
  type AcknowledgementReceiptModuleConfig,
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
import { AcknowledgementReceiptRecordActions } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/overview/AcknowledgementReceiptRecordActions";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type AcknowledgementReceiptListPageProps<TReceipt> = AcknowledgementReceiptModuleConfig<TReceipt> & {
  baseHref?: string;
  description?: string;
  receiptLabel?: string;
  startNewLabel?: string;
  tableTitle?: string;
};

export function AcknowledgementReceiptListPage<TReceipt>({
  api,
  baseHref = AcknowledgementReceiptHref,
  description = "Search collection sources, preview linked acknowledgement receipts, and create or update receipt entries.",
  receiptLabel = "Collection Receipt",
  startNewLabel,
  storageKey,
  tableTitle = "Receipt entries",
}: AcknowledgementReceiptListPageProps<TReceipt> = {}) {
  const { lastSyncedAt, receipts, updateReceiptStatus } = useAcknowledgementReceiptStore(undefined, {
    api,
    receiptLabel: receiptLabel.toLowerCase(),
    storageKey,
  });
  const tableState = useAcknowledgementReceiptTable(receipts);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={receiptLabel}
        description={description}
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
            <Link href={`${baseHref}/add`} className={moduleHeaderActionClassNames.primary}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {startNewLabel ?? `Start New ${receiptLabel}`}
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
        paginationStorageKey={storageKey ?? AcknowledgementReceiptTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle={tableTitle}
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label={`Search ${receiptLabel.toLowerCase()}s`}
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
              <AcknowledgementReceiptRecordActions
                baseHref={baseHref}
                receiptLabel={receiptLabel.toLowerCase()}
                record={original}
                onUpdateStatus={updateReceiptStatus}
              />
            </td>
          </tr>
        )}
      />
    </section>
  );
}

function AcknowledgementReceiptMetrics({ records }: { records: AcknowledgementReceiptRecord[] }) {
  const activeCount = records.filter((record) => isAcknowledgementReceiptActiveStatus(record.status)).length;
  const forApprovalCount = countAcknowledgementReceiptsByStatus(records, "For Approval");
  const disapprovedCount = countAcknowledgementReceiptsByStatus(records, "Disapproved");
  const postedCount = countAcknowledgementReceiptsByStatus(records, "Posted");

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
          label: "In Process",
          value: activeCount,
          summary: formatAcknowledgementReceiptPercentage(activeCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "For Approval",
          value: forApprovalCount,
          summary: formatAcknowledgementReceiptPercentage(forApprovalCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Posted",
          value: postedCount,
          summary: formatAcknowledgementReceiptPercentage(postedCount, records.length),
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
          label: "Cancelled",
          value: countAcknowledgementReceiptsByStatus(records, "Cancelled"),
          summary: formatAcknowledgementReceiptPercentage(countAcknowledgementReceiptsByStatus(records, "Cancelled"), records.length),
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
  Cancelled: Ban,
  Disapproved: XCircle,
  Draft: Clock3,
  "For Approval": Clock3,
  Posted: PackageCheck,
} satisfies Record<AcknowledgementReceiptStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-offwhite text-darknavy",
  Posted: "bg-citron/25 text-darknavy",
} satisfies Record<AcknowledgementReceiptStatus, string>;
