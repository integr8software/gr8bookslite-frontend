import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { InventoryAccountMain } from "@/app/src/ui/modules/inventory/inventory-account/Main";

const PageTitle = "Inventory Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryInventoryAccountPage() {
  return <InventoryAccountMain />;
}


