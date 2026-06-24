import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseJournalMain } from "@/app/src/ui/modules/purchasing/purchase-journal/Main";

const PageTitle = "Purchase Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseJournalPage() {
  return <PurchaseJournalMain />;
}


