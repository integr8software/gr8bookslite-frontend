import { erpReceipts } from "@/app/src/data/modules/financial/ErpCollectionReceiptsData";
import { getBranchById } from "@/app/src/data/modules/workspace/ErpWorkspaceShellData";

export function getCollectionReceiptsData(activeBranchId: string) {
  const activeBranch = getBranchById(activeBranchId);
  const receipts = erpReceipts.filter((receipt) => receipt.branchId === activeBranch.id);

  return {
    activeBranch,
    tabs: ["Receipts", "Deposit Slip", "Batch Summary", "Customer Payments"],
    receipts,
    selectedReceipt: receipts[0] ?? erpReceipts[0],
  };
}
