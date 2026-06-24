import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TransactionTypeListPage } from "@/app/src/ui/modules/maintenance/transaction-type/TransactionTypeListPage";

const PageTitle = "Transaction Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTransactionTypePage() {
  return <TransactionTypeListPage />;
}


