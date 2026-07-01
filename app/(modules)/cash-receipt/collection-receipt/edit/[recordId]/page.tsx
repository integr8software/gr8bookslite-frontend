import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CollectionReceiptAction } from "@/app/src/ui/modules/cash-receipt/collection-receipt/Action";

const PageTitle = "Edit Collection Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptCollectionReceiptEditPage() {
  return <CollectionReceiptAction />;
}


