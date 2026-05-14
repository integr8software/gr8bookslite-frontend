import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BankReconciliationAction } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/Action";

const PageTitle = "View Bank Reconciliation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptBankReconciliationViewPage() {
  return <BankReconciliationAction />;
}


