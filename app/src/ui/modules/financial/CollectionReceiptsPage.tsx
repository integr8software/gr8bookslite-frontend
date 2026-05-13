"use client";

import { useCollectionReceiptsPage } from "@/app/src/hooks/modules/financial/useCollectionReceiptsPage";
import { useWorkspaceShell } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";
import {
  CollectionKpiGrid,
  CollectionReceiptDetails,
  CollectionReceiptsHeader,
  CollectionReceiptsTable,
  CollectionTabs,
} from "./CollectionReceiptsSections";

export function CollectionReceiptsPage() {
  const { currentBranch } = useWorkspaceShell();
  const {
    receipts,
    selectedReceipt,
    selectedReceiptId,
    setSelectedReceiptId,
    tabs,
  } = useCollectionReceiptsPage();

  return (
    <div className="space-y-6">
      <CollectionReceiptsHeader currentBranch={currentBranch} />
      <CollectionTabs tabs={tabs} />
      <CollectionKpiGrid />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.68fr)]">
        <div className="space-y-5">
          <CollectionReceiptsTable
            receipts={receipts}
            selectedReceiptId={selectedReceiptId}
            setSelectedReceiptId={setSelectedReceiptId}
          />
        </div>

        <CollectionReceiptDetails
          currentBranch={currentBranch}
          selectedReceipt={selectedReceipt}
        />
      </div>
    </div>
  );
}
