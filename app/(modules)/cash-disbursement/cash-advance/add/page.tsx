import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashAdvanceActionModes } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { CashAdvanceActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionPage";

const PageTitle = "Add Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceAddPage() {
  return <CashAdvanceActionPage mode={CashAdvanceActionModes.Add} />;
}


