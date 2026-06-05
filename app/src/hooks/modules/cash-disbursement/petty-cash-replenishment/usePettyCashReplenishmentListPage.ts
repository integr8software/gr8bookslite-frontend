"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { PettyCashReplenishmentRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import { PettyCashReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentQueryKeys";
import type { PettyCashReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const columnHelper = createColumnHelper<PettyCashReplenishmentRecord>();

export function usePettyCashReplenishmentListPage() {
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({
    queryKey: PettyCashReplenishmentQueryKeys.records(),
    queryFn: async () => PettyCashReplenishmentRecords,
    initialData: PettyCashReplenishmentRecords,
  });
  const [pendingDelete, setPendingDelete] =
    useState<PettyCashReplenishmentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => recordId,
    onSuccess: (recordId) => {
      queryClient.setQueryData<PettyCashReplenishmentRecord[]>(
        PettyCashReplenishmentQueryKeys.records(),
        (current = PettyCashReplenishmentRecords) =>
          current.filter((record) => record.id !== recordId),
      );
      toast.success("Petty cash replenishment deleted.");
    },
    onError: () => {
      toast.error("Could not delete the replenishment. Please try again.");
    },
  });

  const filteredRecords = useMemo(() => {
    return recordsQuery.data.filter((record) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        record.replenishmentNo.toLowerCase().includes(query) ||
        record.vceCode.toLowerCase().includes(query) ||
        record.vceName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [recordsQuery.data, searchQuery, statusFilter]);

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

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
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

    deleteRecordMutation.mutate(pendingDelete.id);
    setPendingDelete(null);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("All");
  }

  return {
    handleConfirmDelete,
    isLoading: recordsQuery.isLoading,
    isMutating: deleteRecordMutation.isPending,
    pendingDelete,
    searchQuery,
    resetFilters,
    setPendingDelete,
    setSearchQuery,
    setStatusFilter,
    statusFilter,
    table,
  };
}
