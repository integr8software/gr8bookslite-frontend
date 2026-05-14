import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashDisbursementMain } from "@/app/src/ui/modules/cash-disbursement/petty-cash-disbursement/Main";

const PageTitle = "Petty Cash Disbursement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashDisbursementPage() {
  return <PettyCashDisbursementMain />;
}


