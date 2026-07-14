import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TransactionTypeTitle } from "@/app/src/constants/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeConstants";
import { TransactionTypeListPage } from "@/app/src/ui/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeListPage";

export const metadata: Metadata = {
  title: `${TransactionTypeTitle} | ${AppName}`,
  description: `${TransactionTypeTitle} page for ${AppName}.`,
};

export default function MaintenanceItemManagementInventoryTransactionTypePage() {
  return <TransactionTypeListPage />;
}


