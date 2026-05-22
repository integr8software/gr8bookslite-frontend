"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PettyCashVoucherRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type { PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const columnHelper = createColumnHelper<PettyCashVoucherRecord>();

export function usePettyCashVoucherListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredVouchers = useMemo(() => {
    return PettyCashVoucherRecords.filter((voucher) => {
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
  }, [searchQuery, statusFilter]);

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

  const table = useReactTable({
    columns,
    data: filteredVouchers,
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    searchQuery,
    setSearchQuery,
    setStatusFilter,
    statusFilter,
    table,
  };
}
