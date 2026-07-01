import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { CollectionReceiptMain } from "@/app/src/ui/modules/cash-receipt/collection-receipt/Main";

const PageTitle = "Collection Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptCollectionReceiptPage() {
  return <CollectionReceiptMain />;
}


