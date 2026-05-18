import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashDisbursementAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-disbursement/Action";

const PageTitle = "Edit Petty Cash Disbursement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashDisbursementEditPage() {
  return <PettyCashDisbursementAction />;
}


