import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashAdvanceOverviewPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceOverviewPage";

const PageTitle = "Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvancePage() {
  return <CashAdvanceOverviewPage />;
}


