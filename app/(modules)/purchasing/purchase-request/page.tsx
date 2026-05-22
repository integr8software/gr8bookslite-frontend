import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseRequestListPage } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestListPage";

const PageTitle = "Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestPage() {
  return <PurchaseRequestListPage />;
}


