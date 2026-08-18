import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashAdvanceMultipleEntryOverviewPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryOverviewPage";

const PageTitle = "Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryPage() {
  return <CashAdvanceMultipleEntryOverviewPage />;
}


