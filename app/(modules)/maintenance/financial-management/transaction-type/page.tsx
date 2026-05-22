import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TransactionTypeListPage } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeListPage";

const PageTitle = "Transaction Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTransactionTypePage() {
  return <TransactionTypeListPage />;
}


