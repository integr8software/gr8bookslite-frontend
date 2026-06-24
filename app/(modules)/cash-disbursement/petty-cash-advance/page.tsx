import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashAdvanceListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance/PettyCashAdvanceListPage";

const PageTitle = "Petty Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvancePage() {
  return <PettyCashAdvanceListPage />;
}


