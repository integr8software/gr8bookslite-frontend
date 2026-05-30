"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { WorkspaceVouchersAndCouponsTableColumns } from "@/app/src/constants/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsConstants";
import {
  WorkspaceVouchersAndCouponsRecords,
  formatWorkspaceVouchersAndCouponsDate,
  formatWorkspaceVouchersAndCouponsExpiry,
  formatWorkspaceVouchersAndCouponsValue,
  getWorkspaceVouchersAndCouponsSummary,
} from "@/app/src/data/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsData";
import type {
  WorkspaceVouchersAndCouponsRecord,
  WorkspaceVouchersAndCouponsStatusFilter,
  WorkspaceVouchersAndCouponsTableColumnKey,
  WorkspaceVouchersAndCouponsTypeFilter,
} from "@/app/src/types/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsTypes";

const InitialPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 5,
};

export function useWorkspaceVouchersAndCouponsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<WorkspaceVouchersAndCouponsStatusFilter>("All");
  const [typeFilter, setTypeFilter] =
    useState<WorkspaceVouchersAndCouponsTypeFilter>("All");
  const [pagination, setPagination] =
    useState<PaginationState>(InitialPagination);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return WorkspaceVouchersAndCouponsRecords.filter((record) => {
      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;
      const matchesType = typeFilter === "All" || record.type === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          record.subscriberName,
          record.ownerName,
          record.planName,
          record.promotionName,
          record.code,
          record.type,
          record.status,
          record.masterStatus,
          record.assignmentMode,
          record.grantedBy,
          record.invoiceNo,
          record.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesType && matchesQuery;
    });
  }, [query, statusFilter, typeFilter]);
  const columns = useMemo<ColumnDef<WorkspaceVouchersAndCouponsRecord>[]>(
    () =>
      WorkspaceVouchersAndCouponsTableColumns.map((column) => {
        if ("key" in column) {
          return createColumn(column.key, column.label, column.className);
        }

        return {
          id: "actions",
          enableSorting: false,
          header: column.label,
          meta: { className: column.className },
        };
      }),
    [],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });
  const summary = useMemo(
    () => getWorkspaceVouchersAndCouponsSummary(filteredRecords),
    [filteredRecords],
  );

  function resetFilters() {
    setQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  return {
    query,
    resetFilters,
    setQuery,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    summary,
    table,
    typeFilter,
  };
}

function createColumn(
  key: WorkspaceVouchersAndCouponsTableColumnKey,
  label: string,
  className: string,
): ColumnDef<WorkspaceVouchersAndCouponsRecord> {
  if (key === "value") {
    return {
      id: key,
      accessorFn: (record) =>
        formatWorkspaceVouchersAndCouponsValue(record),
      enableSorting: false,
      header: label,
      meta: { className },
    };
  }

  if (key === "expiresAt") {
    return {
      id: key,
      accessorFn: (record) =>
        formatWorkspaceVouchersAndCouponsExpiry(record.expiresAt),
      enableSorting: false,
      header: label,
      meta: { className },
    };
  }

  if (key === "subscriberName") {
    return {
      id: key,
      accessorFn: (record) =>
        `${record.subscriberName} ${record.ownerName} ${record.planName}`,
      enableSorting: false,
      header: label,
      meta: { className },
    };
  }

  if (key === "promotionName") {
    return {
      id: key,
      accessorFn: (record) =>
        `${record.promotionName} ${record.code} ${formatWorkspaceVouchersAndCouponsDate(
          record.assignedAt,
        )}`,
      enableSorting: false,
      header: label,
      meta: { className },
    };
  }

  return {
    accessorKey: key,
    enableSorting: false,
    header: label,
    meta: { className },
  };
}
