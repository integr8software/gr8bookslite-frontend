import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ProvisionalReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/form/ProvisionalReceiptActionPage";

const PageTitle = "Edit Provisional Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProvisionalReceiptEditPage() {
  return <ProvisionalReceiptActionPage />;
}
