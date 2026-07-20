import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { InventoryCountAction } from "@/app/src/ui/modules/inventory/inventory-count/Action";

const PageTitle = "Edit Inventory Count";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryInventoryCountEditPage() {
  return <InventoryCountAction />;
}


