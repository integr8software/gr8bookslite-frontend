import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseRequestFormPage } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormPage";

const PageTitle = "Edit Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestEditPage() {
  return <PurchaseRequestFormPage />;
}


