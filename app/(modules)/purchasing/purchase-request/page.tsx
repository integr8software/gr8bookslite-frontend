import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseRequestMain } from "@/app/src/ui/modules/purchasing/purchase-request/Main";

const PageTitle = "Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestPage() {
  return <PurchaseRequestMain />;
}


