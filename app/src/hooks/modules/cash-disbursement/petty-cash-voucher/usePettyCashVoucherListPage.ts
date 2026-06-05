"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { PettyCashVoucherRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { PettyCashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherQueryKeys";
import type { PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const columnHelper = createColumnHelper<PettyCashVoucherRecord>();

export function usePettyCashVoucherListPage() {
  const queryClient = useQueryClient();
  const vouchersQuery = useQuery({
    queryKey: PettyCashVoucherQueryKeys.vouchers(),
    queryFn: async () => PettyCashVoucherRecords,
    initialData: PettyCashVoucherRecords,
  });
  const [pendingDelete, setPendingDelete] =
    useState<PettyCashVoucherRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => voucherId,
    onSuccess: (voucherId) => {
      queryClient.setQueryData<PettyCashVoucherRecord[]>(
        PettyCashVoucherQueryKeys.vouchers(),
        (current = PettyCashVoucherRecords) =>
          current.filter((voucher) => voucher.id !== voucherId),
      );
      toast.success("Petty cash voucher deleted.");
    },
    onError: () => {
      toast.error("Could not delete the voucher. Please try again.");
    },
  });

  const filteredVouchers = useMemo(() => {
    return vouchersQuery.data.filter((voucher) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        voucher.voucherNo.toLowerCase().includes(query) ||
        voucher.vceCode.toLowerCase().includes(query) ||
        voucher.vceName.toLowerCase().includes(query) ||
        voucher.accountCode.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || voucher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, vouchersQuery.data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("voucherNo", {
        header: "Voucher No.",
      }),
      columnHelper.accessor("vceCode", {
        header: "VCE Code",
      }),
      columnHelper.accessor("vceName", {
        header: "VCE Name",
      }),
      columnHelper.accessor("accountCode", {
        header: "Account Code",
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
      }),
      columnHelper.accessor("documentDate", {
        header: "Document Date",
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
    data: filteredVouchers,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleConfirmDelete() {
    if (!pendingDelete) {
      toast.error("Could not find the voucher to delete.");
      return;
    }

    deleteVoucherMutation.mutate(pendingDelete.id);
    setPendingDelete(null);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("All");
  }

  return {
    handleConfirmDelete,
    isLoading: vouchersQuery.isLoading,
    isMutating: deleteVoucherMutation.isPending,
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
