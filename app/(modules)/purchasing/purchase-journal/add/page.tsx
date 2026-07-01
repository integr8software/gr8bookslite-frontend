import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseJournalAction } from "@/app/src/ui/modules/purchasing/purchase-journal/Action";

const PageTitle = "Add Purchase Journal";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseJournalAddPage() {
  return <PurchaseJournalAction />;
}


