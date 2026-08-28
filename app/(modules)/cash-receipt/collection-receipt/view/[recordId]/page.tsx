import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CollectionReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/collection-receipt/form/CollectionReceiptActionPage";

const PageTitle = "View Collection Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptCollectionReceiptViewPage() {
  return <CollectionReceiptActionPage />;
}
