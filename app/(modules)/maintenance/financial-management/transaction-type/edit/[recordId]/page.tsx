import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TransactionTypeFormPage } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeFormPage";

const PageTitle = "Edit Transaction Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTransactionTypeEditPage() {
  return <TransactionTypeFormPage />;
}


