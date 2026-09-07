import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CashAdvanceActionModes } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { CashAdvanceActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionPage";

const PageTitle = "View Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceViewPage() {
  return <CashAdvanceActionPage mode={CashAdvanceActionModes.View} />;
}


