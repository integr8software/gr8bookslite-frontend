import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BankReconciliationListPage } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationListPage";

const PageTitle = "Bank Reconciliation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptBankReconciliationPage() {
  return <BankReconciliationListPage />;
}
