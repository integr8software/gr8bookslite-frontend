"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { usePurchaseOrderStore } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrder";
import { getPurchaseOrderTotals } from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type { PurchaseOrderRecord } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

export function usePurchaseOrderListPage() {
  const { deleteOrder, isMutating, lastSyncedAt, orders } = usePurchaseOrderStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "documentDate", desc: true }]);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState<PurchaseOrderRecord | null>(null);
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return orders;

    return orders.filter((order) =>
      [order.transNo, order.vceCode, order.vceName, order.purchaseType, order.status, order.prNo, order.projectCode, order.projectName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [orders, query]);
  const columns = useMemo<ColumnDef<PurchaseOrderRecord>[]>(
    () => [
      createColumn("transNo", "Trans No.", "w-[11rem]"),
      createColumn("documentDate", "Document Date", "w-[10rem]"),
      createColumn("vceName", "Supplier", "w-[18rem]"),
      createColumn("purchaseType", "Type", "w-[9rem]"),
      createColumn("status", "Status", "w-[9rem]"),
      {
        id: "grossAmount",
        header: "Gross Amount",
        accessorFn: (order) => getPurchaseOrderTotals(order).grossAmount,
        sortingFn: "basic",
        meta: { className: "w-[12rem] text-center" },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { className: "w-[13rem]" },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleQueryChange(value: string) {
    setQuery(value);
    table.setPageIndex(0);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteOrder) return;

    deleteOrder(pendingDeleteOrder.id);
    setPendingDeleteOrder(null);
  }

  return {
    handleConfirmDelete,
    handleQueryChange,
    isMutating,
    lastSyncedAt,
    pendingDeleteOrder,
    query,
    setPendingDeleteOrder,
    table,
  };
}

function createColumn(key: keyof PurchaseOrderRecord, header: string, className: string): ColumnDef<PurchaseOrderRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
    meta: { className },
  };
}
