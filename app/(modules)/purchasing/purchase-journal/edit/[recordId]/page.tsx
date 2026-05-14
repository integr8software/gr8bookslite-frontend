import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseJournalAction } from "@/app/src/ui/modules/purchasing/purchase-journal/Action";

const PageTitle = "Edit Purchase Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseJournalEditPage() {
  return <PurchaseJournalAction />;
}


