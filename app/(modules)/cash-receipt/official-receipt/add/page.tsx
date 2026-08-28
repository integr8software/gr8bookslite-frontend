import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { OfficialReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/form/OfficialReceiptActionPage";

const PageTitle = "Add Official Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptOfficialReceiptAddPage() {
  return <OfficialReceiptActionPage />;
}


