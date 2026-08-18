import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RecurringTransactionsListPage } from "@/app/src/ui/modules/cash-disbursement/recurring-transactions/RecurringTransactionsListPage";

const PageTitle = "Recurring Transactions";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRecurringTransactionsPage() {
  return <RecurringTransactionsListPage />;
}
