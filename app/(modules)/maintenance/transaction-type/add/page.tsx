import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { TransactionTypeFormPage } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeFormPage";

const PageTitle = "Add Transaction Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTransactionTypeAddPage() {
  return <TransactionTypeFormPage />;
}


