import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseRequestActionPage } from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestPage";

const PageTitle = "Edit Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestEditPage() {
  return <PurchaseRequestActionPage />;
}
