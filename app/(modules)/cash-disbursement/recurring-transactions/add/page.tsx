import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RecurringTransactionsActionPage } from "@/app/src/ui/modules/cash-disbursement/recurring-transactions/RecurringTransactionsActionPage";

const PageTitle = "Add Recurring Transaction";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRecurringTransactionsAddPage() {
  return <RecurringTransactionsActionPage />;
}
