import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { OfficialReceiptListPage } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptListPage";

const PageTitle = "Official Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptOfficialReceiptPage() {
  return <OfficialReceiptListPage />;
}


