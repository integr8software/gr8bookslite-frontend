"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PettyCashReplenishmentCopyFromRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import type {
  PettyCashReplenishmentCopyFromRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const columnHelper =
  createColumnHelper<PettyCashReplenishmentCopyFromRecord>();

export function usePettyCashReplenishmentCopyFromDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor("voucherNo", {
        id: "voucherNo",
        header: "Voucher #",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("vceCode", {
        id: "vceCode",
        header: "VCE Code",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("vceName", {
        id: "vceName",
        header: "VCE Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("amount", {
        id: "amount",
        header: "Amount",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("documentDate", {
        id: "documentDate",
        header: "Date",
        cell: (info) => info.getValue(),
      }),
    ],
    [],
  );

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return PettyCashReplenishmentCopyFromRecords;
    }

    const query = searchQuery.toLowerCase();

    return PettyCashReplenishmentCopyFromRecords.filter(
      (record) =>
        record.voucherNo.toLowerCase().includes(query) ||
        record.vceCode.toLowerCase().includes(query) ||
        record.vceName.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedRecord =
    PettyCashReplenishmentCopyFromRecords.find(
      (record) => record.id === selectedId,
    ) ?? null;

  return {
    filteredRecords,
    searchQuery,
    selectedId,
    selectedRecord,
    setSearchQuery,
    setSelectedId,
    table,
  };
}
