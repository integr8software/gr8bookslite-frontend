import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemManagementMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-management/Main";

const PageTitle = "Item Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemManagementPage() {
  return <InventoryWarehouseManagementItemManagementMain />;
}


