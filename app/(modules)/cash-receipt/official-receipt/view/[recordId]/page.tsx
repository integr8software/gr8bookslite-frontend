import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionPage";

const PageTitle = "View Official Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptOfficialReceiptViewPage() {
  return <OfficialReceiptActionPage />;
}


