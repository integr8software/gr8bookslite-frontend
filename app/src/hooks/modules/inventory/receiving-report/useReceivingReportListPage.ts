"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
  formatReceivingReportCurrency,
  formatReceivingReportDate,
  getInitialReceivingReports,
  writeStoredReceivingReports,
} from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import { ReceivingReportStatuses } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import type {
  ReceivingReportRangeValue,
  ReceivingReportRecord,
  ReceivingReportStatus,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";
import { parseIsoDate } from "@/app/src/utils/date.util";
import { parseAmount } from "@/app/src/utils/number.util";

const columnHelper = createColumnHelper<ReceivingReportRecord>();

export function useReceivingReportListPage() {
  const [records, setRecords] = useState(getInitialReceivingReports);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<ReceivingReportRangeValue>({
    from: "",
    to: "",
  });
  const [amountRange, setAmountRange] = useState<ReceivingReportRangeValue>({
    from: "",
    to: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRecords = useMemo(
    () =>
      filterReceivingReports(records, {
        amountRange,
        dateRange,
        query,
        statusFilter,
      }),
    [amountRange, dateRange, query, records, statusFilter],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: "RR No.",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("documentDate", {
        header: "Document Date",
        cell: (info) => formatReceivingReportDate(info.getValue()),
      }),
      columnHelper.accessor("vceName", {
        header: "Vendor",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("vceCode", {
        header: "Party Code",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("poNo", {
        header: "PO No.",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("warehouse", {
        header: "Warehouse",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("netAmount", {
        header: "Net Amount",
        cell: (info) => formatReceivingReportCurrency(info.getValue()),
        meta: { className: "text-right" },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { className: "text-center" },
      }),
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  function resetFilters() {
    setQuery("");
    setDateRange({ from: "", to: "" });
    setAmountRange({ from: "", to: "" });
    setStatusFilter("all");
  }

  function updateReceivingReportStatus(
    record: ReceivingReportRecord,
    status: ReceivingReportStatus,
  ) {
    try {
      setRecords((currentRecords) => {
        const nextRecords = currentRecords.map((currentRecord) => {
          if (currentRecord.id !== record.id) {
            return currentRecord;
          }

          return {
            ...currentRecord,
            formValues: currentRecord.formValues
              ? {
                  ...currentRecord.formValues,
                  status,
                }
              : currentRecord.formValues,
            status,
          };
        });

        writeStoredReceivingReports(nextRecords);
        return nextRecords;
      });
      toast.success(`Receiving report ${status.toLowerCase()}.`);
    } catch {
      toast.error("Unable to update receiving report status.");
    }
  }

  return {
    amountRange,
    dateRange,
    query,
    records,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statusFilter,
    table,
    updateReceivingReportStatus,
  };
}

export function canEditReceivingReportStatus(status: ReceivingReportStatus) {
  return (
    status === ReceivingReportStatuses.draft ||
    status === ReceivingReportStatuses.pending
  );
}

export function canApproveReceivingReportStatus(status: ReceivingReportStatus) {
  return (
    status === ReceivingReportStatuses.draft ||
    status === ReceivingReportStatuses.pending ||
    status === ReceivingReportStatuses.approved
  );
}

export function canDisapproveReceivingReportStatus(status: ReceivingReportStatus) {
  return (
    status === ReceivingReportStatuses.draft ||
    status === ReceivingReportStatuses.pending ||
    status === ReceivingReportStatuses.disapproved
  );
}

export function canCancelReceivingReportStatus(status: ReceivingReportStatus) {
  return status !== ReceivingReportStatuses.closed;
}

function filterReceivingReports(
  records: ReceivingReportRecord[],
  filters: {
    amountRange: ReceivingReportRangeValue;
    dateRange: ReceivingReportRangeValue;
    query: string;
    statusFilter: string;
  },
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const fromDate = parseIsoDate(filters.dateRange.from);
  const toDate = parseIsoDate(filters.dateRange.to);
  const fromAmount = parseAmount(filters.amountRange.from);
  const toAmount = parseAmount(filters.amountRange.to);

  return records.filter((record) => {
    if (normalizedQuery) {
      const haystack = [
        record.transactionNo,
        record.vceName,
        record.vceCode,
        record.poNo,
        record.warehouse,
        record.status,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    if (filters.statusFilter !== "all" && record.status !== filters.statusFilter) {
      return false;
    }

    const recordDate = parseIsoDate(record.documentDate);

    if (fromDate && recordDate && recordDate.getTime() < fromDate.getTime()) {
      return false;
    }

    if (toDate && recordDate && recordDate.getTime() > toDate.getTime()) {
      return false;
    }

    if (fromAmount != null && record.netAmount < fromAmount) {
      return false;
    }

    if (toAmount != null && record.netAmount > toAmount) {
      return false;
    }

    return true;
  });
}

