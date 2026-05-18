import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemTypeMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-type/Main";

const PageTitle = "Item Type";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemTypePage() {
  return <InventoryWarehouseManagementItemTypeMain />;
}


