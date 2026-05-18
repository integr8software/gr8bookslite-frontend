import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BankReconciliationMain } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/Main";

const PageTitle = "Bank Reconciliation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptBankReconciliationPage() {
  return <BankReconciliationMain />;
}


