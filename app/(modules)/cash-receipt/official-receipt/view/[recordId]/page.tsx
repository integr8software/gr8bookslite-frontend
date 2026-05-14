import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { OfficialReceiptAction } from "@/app/src/ui/modules/cash-receipt/official-receipt/Action";

const PageTitle = "View Official Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptOfficialReceiptViewPage() {
  return <OfficialReceiptAction />;
}


