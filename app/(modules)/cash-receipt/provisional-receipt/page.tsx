import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ProvisionalReceiptListPage } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/ProvisionalReceiptListPage";

const PageTitle = "Provisional Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProvisionalReceiptPage() {
  return <ProvisionalReceiptListPage />;
}
