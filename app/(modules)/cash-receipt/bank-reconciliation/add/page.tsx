import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BankReconciliationFormPage } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationFormPage";

const PageTitle = "Add Bank Reconciliation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptBankReconciliationAddPage() {
  return <BankReconciliationFormPage />;
}
