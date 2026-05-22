"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { PettyCashReplenishmentRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type { PettyCashReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const columnHelper = createColumnHelper<PettyCashReplenishmentRecord>();

export function usePettyCashReplenishmentListPage() {
  const [records, setRecords] = useState(PettyCashReplenishmentRecords);
  const [pendingDelete, setPendingDelete] =
    useState<PettyCashReplenishmentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        record.replenishmentNo.toLowerCase().includes(query) ||
        record.vceCode.toLowerCase().includes(query) ||
        record.vceName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("replenishmentNo", {
        header: "Replenishment No.",
      }),
      columnHelper.accessor("vceCode", {
        header: "VCE Code",
      }),
      columnHelper.accessor("vceName", {
        header: "VCE Name",
      }),
      columnHelper.accessor("documentDate", {
        header: "Document Date",
      }),
      columnHelper.accessor("totalAmount", {
        header: "Total Amount",
      }),
      columnHelper.accessor("status", {
        header: "Status",
      }),
      columnHelper.display({
        id: "actions",
        header: "",
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleConfirmDelete() {
    if (!pendingDelete) {
      toast.error("Could not find the replenishment to delete.");
      return;
    }

    setRecords((current) =>
      current.filter((record) => record.id !== pendingDelete.id),
    );
    toast.success("Petty cash replenishment deleted.");
    setPendingDelete(null);
  }

  return {
    handleConfirmDelete,
    pendingDelete,
    searchQuery,
    setPendingDelete,
    setSearchQuery,
    setStatusFilter,
    statusFilter,
    table,
  };
}
