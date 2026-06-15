import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { CashAdvanceMultipleEntryActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryActionPage";

const PageTitle = "View Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryViewPage() {
  return <CashAdvanceMultipleEntryActionPage />;
}


