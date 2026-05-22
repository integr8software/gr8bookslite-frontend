import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseRequestFormPage } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestFormPage";

const PageTitle = "Add Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestAddPage() {
  return <PurchaseRequestFormPage />;
}


