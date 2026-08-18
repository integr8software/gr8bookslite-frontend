import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashAdvanceMultipleEntryActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/action/CashAdvanceMultipleEntryActionPage";

const PageTitle = "Add Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryAddPage() {
  return <CashAdvanceMultipleEntryActionPage />;
}


