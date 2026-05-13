"use client";

import { useMemo, useState } from "react";
import { useWorkspaceShell } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";
import { getCollectionReceiptsData } from "@/app/src/services/modules/financial/ErpCollectionReceiptsService";

export function useCollectionReceiptsPage() {
  const { currentBranch } = useWorkspaceShell();
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const data = useMemo(
    () => getCollectionReceiptsData(currentBranch.id),
    [currentBranch.id],
  );

  const selectedReceipt =
    data.receipts.find((receipt) => receipt.id === selectedReceiptId) ??
    data.selectedReceipt;

  return {
    ...data,
    selectedReceipt,
    selectedReceiptId: selectedReceipt.id,
    setSelectedReceiptId,
  };
}

