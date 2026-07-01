import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseRequestFormPage } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormPage";

const PageTitle = "View Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestViewPage() {
  return <PurchaseRequestFormPage />;
}


