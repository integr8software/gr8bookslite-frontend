import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseRequestAction } from "@/app/src/ui/modules/purchasing/purchase-request/Action";

const PageTitle = "View Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestViewPage() {
  return <PurchaseRequestAction />;
}


