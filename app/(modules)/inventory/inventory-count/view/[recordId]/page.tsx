import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { InventoryCountFormPage } from "@/app/src/ui/modules/inventory/inventory-count/InventoryCountFormPage";

const PageTitle = "View Inventory Count";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryInventoryCountViewPage() {
  return <InventoryCountFormPage />;
}


